import { GameSession, GameSplitRule, BarSplitRule, PlayerSettlementShare, BillSettlementResult, CustomerPlayer, PaymentMethod, LedgerEntry } from '../types';
import { createShortPayToken } from './payToken';

/**
 * Returns a timezone-safe YYYY-MM-DD date string using local calendar time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current running duration in minutes and cost for a game session
 */
export function calculateSessionMetrics(session: GameSession, targetTime: number = Date.now()) {
  let effectiveEndTime = targetTime;
  if (session.status === 'paused' && session.pausedAt) {
    effectiveEndTime = session.pausedAt;
  } else if (session.status === 'completed' && session.endedAt) {
    effectiveEndTime = session.endedAt;
  }

  const elapsedMs = Math.max(0, effectiveEndTime - session.startTime - (session.totalPausedDuration * 1000));
  const rawMinutes = elapsedMs / 60000;
  
  let billedMinutes = rawMinutes;
  if (session.billingIncrement === '15min') {
    const blocks = Math.ceil(rawMinutes / 15) || 1;
    billedMinutes = blocks * 15;
  }

  const perTableGameCost = (billedMinutes / 60) * session.hourlyRate;
  const numPlayers = session.taggedPlayers?.length || 1;
  const gameCost = session.billingBasis === 'PER_PERSON'
    ? Math.round(perTableGameCost * numPlayers)
    : Math.round(perTableGameCost);

  const barCost = session.attachedBarOrders.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return {
    rawMinutes: Math.round(rawMinutes),
    billedMinutes: Math.round(billedMinutes),
    gameCost,
    barCost,
    totalCost: gameCost + barCost,
    formattedDuration: formatMinutes(rawMinutes),
  };
}

export function formatMinutes(totalMinutes: number): string {
  const mins = Math.floor(totalMinutes);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  const secs = Math.floor((totalMinutes - mins) * 60);

  if (hrs > 0) {
    return `${hrs}h ${remMins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${remMins}m ${secs.toString().padStart(2, '0')}s`;
}

export function computeSplitSettlement(params: {
  session: GameSession;
  gameSplitRule: GameSplitRule;
  barSplitRule: BarSplitRule;
  losingPlayerIds: string[];
  singlePayerId?: string;
  customBarSplitPlayerIds?: string[];
  playerPaymentMethods?: Record<string, PaymentMethod>;
}): BillSettlementResult {
  const { session, gameSplitRule, barSplitRule, losingPlayerIds, singlePayerId, customBarSplitPlayerIds, playerPaymentMethods } = params;
  
  const metrics = calculateSessionMetrics(session);
  const players = session.taggedPlayers;
  const numPlayers = players.length;

  const gameShares: Record<string, number> = {};
  players.forEach(p => gameShares[p.id] = 0);

  if (session.matchType === 'solo' || gameSplitRule === 'standard') {
    if (players[0]) {
      gameShares[players[0].id] = metrics.gameCost;
    }
  } else if (gameSplitRule === '1v1_equal') {
    const share = Math.round(metrics.gameCost / 2);
    players.forEach(p => gameShares[p.id] = share);
  } else if (gameSplitRule === '1v1_loser_pays') {
    const loserId = losingPlayerIds[0];
    if (loserId && gameShares[loserId] !== undefined) {
      gameShares[loserId] = metrics.gameCost;
    } else if (players[0]) {
      gameShares[players[0].id] = metrics.gameCost;
    }
  } else if (gameSplitRule === '2v2_equal') {
    const share = Math.round(metrics.gameCost / 4);
    players.forEach(p => gameShares[p.id] = share);
  } else if (gameSplitRule === '2v2_loser_pays') {
    const validLosers = losingPlayerIds.slice(0, 2);
    if (validLosers.length > 0) {
      const perLoserShare = Math.round(metrics.gameCost / validLosers.length);
      validLosers.forEach(id => {
        if (gameShares[id] !== undefined) {
          gameShares[id] = perLoserShare;
        }
      });
    } else {
      const share = Math.round(metrics.gameCost / numPlayers);
      players.forEach(p => gameShares[p.id] = share);
    }
  } else if (gameSplitRule === 'group_equal') {
    const share = Math.round(metrics.gameCost / numPlayers);
    players.forEach(p => gameShares[p.id] = share);
  }

  // --- BAR SPLIT CALCULATION ---
  const barShares: Record<string, number> = {};
  players.forEach(p => barShares[p.id] = 0);

  if (metrics.barCost > 0) {
    const isLoserPaysGame = gameSplitRule === '1v1_loser_pays' || gameSplitRule === '2v2_loser_pays';

    if (barSplitRule === 'link_to_game_loser' && isLoserPaysGame) {
      const targetLosers = losingPlayerIds.length > 0 ? losingPlayerIds : [players[0]?.id];
      const validTargets = targetLosers.filter(id => id && barShares[id] !== undefined);
      if (validTargets.length > 0) {
        const perLoserBar = Math.round(metrics.barCost / validTargets.length);
        validTargets.forEach(id => barShares[id] = perLoserBar);
      } else if (players[0]) {
        barShares[players[0].id] = metrics.barCost;
      }
    } else if (barSplitRule === 'equal_share' || (barSplitRule === 'link_to_game_loser' && !isLoserPaysGame)) {
      const share = Math.round(metrics.barCost / Math.max(1, numPlayers));
      players.forEach(p => barShares[p.id] = share);
    } else if (barSplitRule === 'single_payer') {
      const targetId = singlePayerId || players[0]?.id;
      if (targetId && barShares[targetId] !== undefined) {
        barShares[targetId] = metrics.barCost;
      }
    } else if (barSplitRule === 'custom_split') {
      const targetIds = (customBarSplitPlayerIds && customBarSplitPlayerIds.length > 0)
        ? customBarSplitPlayerIds
        : players.map(p => p.id);
      const share = Math.round(metrics.barCost / Math.max(1, targetIds.length));
      targetIds.forEach(id => {
        if (barShares[id] !== undefined) barShares[id] = share;
      });
    }
  }

  // Combine into PlayerSettlementShare array
  const shares: PlayerSettlementShare[] = players.map(p => {
    const gameCostShare = gameShares[p.id] || 0;
    const barCostShare = barShares[p.id] || 0;
    const totalShare = gameCostShare + barCostShare;
    const method = playerPaymentMethods?.[p.id] || 'Ledger';

    return {
      playerId: p.id,
      playerName: p.name,
      whatsapp: p.whatsapp,
      gameCostShare,
      barCostShare,
      totalShare,
      paymentMethod: method,
      isSettled: false,
    };
  });

  return {
    sessionId: session.id,
    assetName: session.assetName,
    durationMinutes: metrics.billedMinutes,
    totalGameCost: metrics.gameCost,
    totalBarCost: metrics.barCost,
    grandTotal: metrics.totalCost,
    gameSplitRule,
    barSplitRule,
    losingPlayerIds,
    singlePayerId,
    customBarSplitPlayerIds,
    shares,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates dynamic wa.me links for WhatsApp receipt or debt collection
 */
export function generateWhatsAppReceiptLink(
  customerName: string,
  whatsappNumber: string,
  clubName: string,
  totalAmount: number,
  paidAmount: number,
  ledgerAmount: number,
  _upiId?: string
): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  
  let message = `Hi ${customerName}, your bill at ${clubName} is ₹${totalAmount}. `;
  message += `Paid: ₹${paidAmount}`;
  if (ledgerAmount > 0) {
    message += `, Added to your Account Ledger: ₹${ledgerAmount}.`;
  } else {
    message += `. Thank you for playing! 🎱🎮`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppOfferLink(
  customerName: string,
  whatsappNumber: string,
  clubName: string,
  offerMessage: string
): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const text = `Hi ${customerName}! We miss you at ${clubName}! 🎱🎮\n${offerMessage}\nReply to book your table now!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppReminderLink(
  customerName: string,
  whatsappNumber: string,
  clubName: string,
  debitAmount: number,
  upiId?: string
): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const payeeUpi = upiId || 'justclub@upi';
  const ledgerRef = `Ledger Settlement - ${customerName}`;
  const redirectUrl = `https://justclub.in/p/${encodeURIComponent(payeeUpi)}/${debitAmount}?pn=${encodeURIComponent(clubName)}`;

  let text = `Hi ${customerName}, gentle reminder from ${clubName}. You have a pending ledger balance of ₹${debitAmount} in your account.`;
  if (debitAmount > 0) {
    text += `\n\n💳 *Pay Securely via UPI:*\n${redirectUrl}\n\n_Click the secure link above to clear your balance via GPay, PhonePe, Paytm or BHIM._\n`;
  } else {
    text += ` Please settle at the counter during your next visit.`;
  }
  text += `\n\nThank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateItemizedWhatsAppBillLink(
  customerName: string,
  whatsappNumber: string,
  clubName: string,
  totalDue: number,
  _upiId: string,
  entries: LedgerEntry[]
): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  let breakdownText = '';
  const pendingDebits = entries.filter(e => e.type.startsWith('DEBIT') && e.status === 'PENDING');
  
  if (pendingDebits.length > 0) {
    breakdownText = pendingDebits.map((entry, idx) => {
      const dateStr = new Date(entry.timestamp).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      let line = `${idx + 1}. *${entry.assetName || entry.description}* (${dateStr})\n`;
      if (entry.durationMinutes) {
        line += `   • Game (${entry.durationMinutes}m @ ₹${entry.hourlyRate || 0}/hr): ₹${entry.gameShare || 0}\n`;
      }
      if (entry.barShare && entry.barShare > 0) {
        line += `   • Cafe / Bar: ₹${entry.barShare}\n`;
        if (entry.barItemsSummary && entry.barItemsSummary.length > 0) {
          const itemsStr = entry.barItemsSummary.map(it => `${it.name} x${it.quantity}`).join(', ');
          line += `     (${itemsStr})\n`;
        }
      }
      if (entry.splitRule) {
        line += `   • Split Rule: ${entry.splitRule.replace(/_/g, ' ')}${entry.isLoser ? ' ⚠️ (Loser Share)' : ''}\n`;
      }
      if (entry.coPlayers && entry.coPlayers.length > 0) {
        line += `   • Played with: ${entry.coPlayers.join(', ')}\n`;
      }
      line += `   • *Total Share: ₹${entry.amount}*\n`;
      return line;
    }).join('\n');
  } else {
    breakdownText = `Account Balance: ₹${totalDue}\n`;
  }

  const message = `*${clubName} - Itemized Bill Statement* 🎱🧾\n\n` +
    `Hello *${customerName}*,\n` +
    `Here is the complete audit breakdown of your pending ledger balance:\n\n` +
    `*TOTAL BALANCE DUE: ₹${totalDue}*\n\n` +
    `*📋 Session & F&B Breakdown:*\n` +
    breakdownText +
    `\n📋 *Status:* Posted to your Club Account Ledger. Please settle at the counter during your next visit.\n` +
    `Thank you for playing at ${clubName}!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns a clear rate label reflecting whether the rate was charged Per Table or Per Person.
 * Example: "₹180/hr per table" | "₹180/hr per person"
 */
export function getBillRateLabel(bill: { hourlyRate: number; billingBasis?: string }): string {
  const basis = bill.billingBasis === 'PER_PERSON' ? 'per person' : 'per table';
  return `₹${bill.hourlyRate}/hr ${basis}`;
}

/**
 * Returns the full math breakdown for Per-Person game costs, or null for Per-Table.
 * Example for 4 players: "₹180/hr × 4 players = ₹720 total game cost"
 */
export function getBillGameCostBreakdown(bill: {
  hourlyRate: number;
  billingBasis?: string;
  players?: { id?: string; name?: string }[];
  totalGameCost: number;
}): string | null {
  if (bill.billingBasis === 'PER_PERSON') {
    const numPlayers = Math.max(1, bill.players?.length || 1);
    return `₹${bill.hourlyRate}/hr × ${numPlayers} players = ₹${bill.totalGameCost} total game cost`;
  }
  return null;
}


