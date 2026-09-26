import { GameSession, GameSplitRule, BarSplitRule, PlayerSettlementShare, BillSettlementResult, CustomerPlayer, PaymentMethod, LedgerEntry } from '../types';
import { createShortPayToken, getClubSlug } from './payToken';
import { formatWhatsAppForLink, formatWhatsAppDisplay, sanitize10DigitMobile } from './phone';

export { formatWhatsAppForLink, formatWhatsAppDisplay, sanitize10DigitMobile };

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
 * Parses any ISO timestamp, date string or ms number to a valid Date object or null
 */
export function parseDateSafe(val: any): Date | null {
  if (!val) return null;
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    // If it's a simple YYYY-MM-DD string without time, parse as local calendar date
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  return null;
}

/**
 * Checks if a given date / timestamp falls inside the selected period boundaries in local calendar time
 */
export function isDateInPeriod(
  dateVal: any,
  period: 'daily' | 'weekly' | 'monthly' | 'ytd' | 'custom',
  customStart?: string,
  customEnd?: string
): boolean {
  const d = parseDateSafe(dateVal);
  if (!d) return false;

  const localDateStr = getLocalDateString(d);
  const now = new Date();
  const todayStr = getLocalDateString(now);

  if (period === 'daily') {
    return localDateStr === todayStr;
  }

  if (period === 'weekly') {
    const past = new Date(now);
    past.setDate(now.getDate() - 6);
    const startStr = getLocalDateString(past);
    return localDateStr >= startStr && localDateStr <= todayStr;
  }

  if (period === 'monthly') {
    const past = new Date(now);
    past.setDate(now.getDate() - 29);
    const startStr = getLocalDateString(past);
    return localDateStr >= startStr && localDateStr <= todayStr;
  }

  if (period === 'ytd') {
    const startOfYearStr = `${now.getFullYear()}-01-01`;
    return localDateStr >= startOfYearStr && localDateStr <= todayStr;
  }

  if (period === 'custom') {
    if (!customStart || !customEnd) return true;
    return localDateStr >= customStart && localDateStr <= customEnd;
  }

  return true;
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

export function isMembershipActive(customer?: Partial<CustomerPlayer> | null): boolean {
  if (!customer) return false;
  if (!customer.membershipDiscountPercent || customer.membershipDiscountPercent <= 0) return false;
  if (customer.membershipStatus === 'EXPIRED') return false;
  
  if (customer.membershipExpiresAt) {
    const today = getLocalDateString();
    if (customer.membershipExpiresAt < today) {
      return false;
    }
  }
  return true;
}

export function getCustomerDiscountPercents(customer?: Partial<CustomerPlayer> | null): {
  isActive: boolean;
  gameDiscountPercent: number;
  barDiscountPercent: number;
  planName: string;
} {
  if (!isMembershipActive(customer)) {
    return { isActive: false, gameDiscountPercent: 0, barDiscountPercent: 0, planName: '' };
  }
  return {
    isActive: true,
    gameDiscountPercent: Math.min(100, Math.max(0, customer?.membershipDiscountPercent || 0)),
    barDiscountPercent: Math.min(100, Math.max(0, customer?.membershipBarDiscountPercent || 0)),
    planName: customer?.membershipPlanName || 'Member',
  };
}

export function splitAmountEqualNearest(total: number, targetIds: string[]): { shares: Record<string, number>; collectedTotal: number } {
  const shares: Record<string, number> = {};
  const n = targetIds.length;
  if (n === 0) return { shares, collectedTotal: 0 };

  const safeTotal = Math.max(0, Math.round(total));
  const base = Math.floor(safeTotal / n);
  const remainder = safeTotal - base * n; // 0..n-1 leftover rupees to spread

  targetIds.forEach((id, idx) => {
    shares[id] = base + (idx < remainder ? 1 : 0);
  });

  return { shares, collectedTotal: safeTotal };
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

  // --- 1. CALCULATE INTRINSIC SLOTS AND INDIVIDUAL DISCOUNTS ---
  // Each player's individual intrinsic portion (Slot) of the total table cost regardless of who pays.
  const individualGameSlot = numPlayers > 0 ? metrics.gameCost / numPlayers : 0;
  const individualBarSlot = numPlayers > 0 ? metrics.barCost / numPlayers : 0;

  const playerGameDiscounts: Record<string, number> = {};
  const playerBarDiscounts: Record<string, number> = {};

  players.forEach(p => {
    const memberInfo = getCustomerDiscountPercents(p);
    
    // Game discount contribution
    if (memberInfo.isActive && memberInfo.gameDiscountPercent > 0) {
      playerGameDiscounts[p.id] = Math.round(individualGameSlot * (memberInfo.gameDiscountPercent / 100));
    } else {
      playerGameDiscounts[p.id] = 0;
    }

    // Bar discount contribution
    if (memberInfo.isActive && memberInfo.barDiscountPercent > 0) {
      playerBarDiscounts[p.id] = Math.round(individualBarSlot * (memberInfo.barDiscountPercent / 100));
    } else {
      playerBarDiscounts[p.id] = 0;
    }
  });

  const totalGameDiscounts = Object.values(playerGameDiscounts).reduce((sum, val) => sum + val, 0);
  const totalBarDiscounts = Object.values(playerBarDiscounts).reduce((sum, val) => sum + val, 0);

  const totalNetGameCost = Math.max(0, metrics.gameCost - totalGameDiscounts);
  const totalNetBarCost = Math.max(0, metrics.barCost - totalBarDiscounts);

  // --- 2. CALCULATE GROSS SHARES (For UI Receipt Breakdown) ---
  const grossGameShares: Record<string, number> = {};
  players.forEach(p => grossGameShares[p.id] = 0);

  if (session.matchType === 'solo' || gameSplitRule === 'standard') {
    if (players[0]) {
      grossGameShares[players[0].id] = metrics.gameCost;
    }
  } else if (gameSplitRule === '1v1_equal') {
    const split = splitAmountEqualNearest(metrics.gameCost, players.map(p => p.id));
    Object.assign(grossGameShares, split.shares);
  } else if (gameSplitRule === '1v1_loser_pays') {
    const loserId = losingPlayerIds[0];
    if (loserId && grossGameShares[loserId] !== undefined) {
      grossGameShares[loserId] = metrics.gameCost;
    } else if (players[0]) {
      grossGameShares[players[0].id] = metrics.gameCost;
    }
  } else if (gameSplitRule === '2v2_equal') {
    const split = splitAmountEqualNearest(metrics.gameCost, players.map(p => p.id));
    Object.assign(grossGameShares, split.shares);
  } else if (gameSplitRule === '2v2_loser_pays') {
    const validLosers = losingPlayerIds.slice(0, 2).filter(id => id && grossGameShares[id] !== undefined);
    if (validLosers.length > 0) {
      const split = splitAmountEqualNearest(metrics.gameCost, validLosers);
      Object.assign(grossGameShares, split.shares);
    } else {
      const split = splitAmountEqualNearest(metrics.gameCost, players.map(p => p.id));
      Object.assign(grossGameShares, split.shares);
    }
  } else if (gameSplitRule === 'group_equal') {
    const split = splitAmountEqualNearest(metrics.gameCost, players.map(p => p.id));
    Object.assign(grossGameShares, split.shares);
  }

  const grossBarShares: Record<string, number> = {};
  players.forEach(p => grossBarShares[p.id] = 0);

  if (metrics.barCost > 0) {
    const isLoserPaysGame = gameSplitRule === '1v1_loser_pays' || gameSplitRule === '2v2_loser_pays';

    if (barSplitRule === 'link_to_game_loser' && isLoserPaysGame) {
      const targetLosers = losingPlayerIds.length > 0 ? losingPlayerIds : [players[0]?.id];
      const validTargets = targetLosers.filter(id => id && grossBarShares[id] !== undefined);
      if (validTargets.length > 0) {
        const split = splitAmountEqualNearest(metrics.barCost, validTargets);
        Object.assign(grossBarShares, split.shares);
      } else if (players[0]) {
        grossBarShares[players[0].id] = metrics.barCost;
      }
    } else if (barSplitRule === 'equal_share' || (barSplitRule === 'link_to_game_loser' && !isLoserPaysGame)) {
      const split = splitAmountEqualNearest(metrics.barCost, players.map(p => p.id));
      Object.assign(grossBarShares, split.shares);
    } else if (barSplitRule === 'single_payer') {
      const targetId = singlePayerId || players[0]?.id;
      if (targetId && grossBarShares[targetId] !== undefined) {
        grossBarShares[targetId] = metrics.barCost;
      }
    } else if (barSplitRule === 'custom_split') {
      const targetIds = (customBarSplitPlayerIds && customBarSplitPlayerIds.length > 0)
        ? customBarSplitPlayerIds.filter(id => grossBarShares[id] !== undefined)
        : players.map(p => p.id);
      const split = splitAmountEqualNearest(metrics.barCost, targetIds);
      Object.assign(grossBarShares, split.shares);
    }
  }

  // --- 3. CALCULATE NET SHARES (Applying Capped Net Table Splitting) ---
  const netGameShares: Record<string, number> = {};
  players.forEach(p => netGameShares[p.id] = 0);

  if (session.matchType === 'solo' || gameSplitRule === 'standard') {
    if (players[0]) {
      netGameShares[players[0].id] = totalNetGameCost;
    }
  } else if (gameSplitRule === '1v1_equal') {
    const split = splitAmountEqualNearest(totalNetGameCost, players.map(p => p.id));
    Object.assign(netGameShares, split.shares);
  } else if (gameSplitRule === '1v1_loser_pays') {
    const loserId = losingPlayerIds[0];
    if (loserId && netGameShares[loserId] !== undefined) {
      netGameShares[loserId] = totalNetGameCost;
    } else if (players[0]) {
      netGameShares[players[0].id] = totalNetGameCost;
    }
  } else if (gameSplitRule === '2v2_equal') {
    const split = splitAmountEqualNearest(totalNetGameCost, players.map(p => p.id));
    Object.assign(netGameShares, split.shares);
  } else if (gameSplitRule === '2v2_loser_pays') {
    const validLosers = losingPlayerIds.slice(0, 2).filter(id => id && netGameShares[id] !== undefined);
    if (validLosers.length > 0) {
      const split = splitAmountEqualNearest(totalNetGameCost, validLosers);
      Object.assign(netGameShares, split.shares);
    } else {
      const split = splitAmountEqualNearest(totalNetGameCost, players.map(p => p.id));
      Object.assign(netGameShares, split.shares);
    }
  } else if (gameSplitRule === 'group_equal') {
    const split = splitAmountEqualNearest(totalNetGameCost, players.map(p => p.id));
    Object.assign(netGameShares, split.shares);
  }

  const netBarShares: Record<string, number> = {};
  players.forEach(p => netBarShares[p.id] = 0);

  if (totalNetBarCost > 0) {
    const isLoserPaysGame = gameSplitRule === '1v1_loser_pays' || gameSplitRule === '2v2_loser_pays';

    if (barSplitRule === 'link_to_game_loser' && isLoserPaysGame) {
      const targetLosers = losingPlayerIds.length > 0 ? losingPlayerIds : [players[0]?.id];
      const validTargets = targetLosers.filter(id => id && netBarShares[id] !== undefined);
      if (validTargets.length > 0) {
        const split = splitAmountEqualNearest(totalNetBarCost, validTargets);
        Object.assign(netBarShares, split.shares);
      } else if (players[0]) {
        netBarShares[players[0].id] = totalNetBarCost;
      }
    } else if (barSplitRule === 'equal_share' || (barSplitRule === 'link_to_game_loser' && !isLoserPaysGame)) {
      const split = splitAmountEqualNearest(totalNetBarCost, players.map(p => p.id));
      Object.assign(netBarShares, split.shares);
    } else if (barSplitRule === 'single_payer') {
      const targetId = singlePayerId || players[0]?.id;
      if (targetId && netBarShares[targetId] !== undefined) {
        netBarShares[targetId] = totalNetBarCost;
      }
    } else if (barSplitRule === 'custom_split') {
      const targetIds = (customBarSplitPlayerIds && customBarSplitPlayerIds.length > 0)
        ? customBarSplitPlayerIds.filter(id => netBarShares[id] !== undefined)
        : players.map(p => p.id);
      const split = splitAmountEqualNearest(totalNetBarCost, targetIds);
      Object.assign(netBarShares, split.shares);
    }
  }

  // --- 4. COMBINE INTO PLAYER SETTLEMENT SHARES WITH EXPLICIT DEDUCTION BREAKDOWN ---
  const shares: PlayerSettlementShare[] = players.map(p => {
    const grossGameCost = grossGameShares[p.id] || 0;
    const grossBarCost = grossBarShares[p.id] || 0;

    const netGameCostShare = netGameShares[p.id] || 0;
    const netBarCostShare = netBarShares[p.id] || 0;

    const gameDiscountAmount = Math.max(0, grossGameCost - netGameCostShare);
    const barDiscountAmount = Math.max(0, grossBarCost - netBarCostShare);

    const totalShare = netGameCostShare + netBarCostShare;
    const method = playerPaymentMethods?.[p.id] || 'Ledger';
    const memberInfo = getCustomerDiscountPercents(p);

    return {
      playerId: p.id,
      playerName: p.name,
      whatsapp: p.whatsapp,
      gameCostShare: grossGameCost,
      gameDiscountPercent: memberInfo.isActive ? memberInfo.gameDiscountPercent : 0,
      gameDiscountAmount,
      netGameCostShare,
      barCostShare: grossBarCost,
      barDiscountPercent: memberInfo.isActive ? memberInfo.barDiscountPercent : 0,
      barDiscountAmount,
      netBarCostShare,
      totalShare,
      paymentMethod: method,
      isSettled: false,
      membershipBadge: memberInfo.isActive ? `${memberInfo.planName} (${memberInfo.gameDiscountPercent}% Off)` : undefined,
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
  const cleanPhone = formatWhatsAppForLink(whatsappNumber);
  
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
  const cleanPhone = formatWhatsAppForLink(whatsappNumber);
  const text = `Hi ${customerName}! We miss you at ${clubName}! 🎱🎮\n${offerMessage}\nReply to book your table now!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppReminderLink(
  customerName: string,
  whatsappNumber: string,
  clubName: string,
  debitAmount: number,
  upiId?: string,
  paymentSlug?: string
): string {
  const cleanPhone = formatWhatsAppForLink(whatsappNumber);
  const payeeUpi = upiId || 'justclub@upi';
  const redirectUrl = paymentSlug && paymentSlug.trim()
    ? `https://justclub.in/p/${paymentSlug.trim()}/${debitAmount}`
    : `https://justclub.in/p/${createShortPayToken(payeeUpi, debitAmount, clubName)}`;

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
  const cleanPhone = formatWhatsAppForLink(whatsappNumber);

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


