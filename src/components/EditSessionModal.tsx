import React, { useState, useEffect } from 'react';
import { GameSession, CustomerPlayer, BarItem, BarOrderItem, MatchType } from '../types';
import { calculateSessionMetrics } from '../utils/billing';
import { sanitize10DigitMobile, formatWhatsAppDisplay } from '../utils/phone';
import { 
  X, 
  Users, 
  Coffee, 
  Search, 
  UserPlus, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsAppInput } from './WhatsAppInput';

interface EditSessionModalProps {
  isOpen: boolean;
  session: GameSession | null;
  customers: CustomerPlayer[];
  barItems: BarItem[];
  onClose: () => void;
  onSaveSession: (
    sessionId: string,
    updatedMatchType: MatchType,
    updatedPlayers: CustomerPlayer[],
    updatedBarOrders: BarOrderItem[]
  ) => void;
  onAddNewCustomer: (name: string, whatsapp: string) => CustomerPlayer;
  isDarkMode?: boolean;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  session,
  customers,
  barItems,
  onClose,
  onSaveSession,
  onAddNewCustomer,
  isDarkMode = true,
}) => {
  if (!isOpen || !session) return null;

  // Active Tab: 'players' | 'bar'
  const [activeTab, setActiveTab] = useState<'players' | 'bar'>('players');

  // Working state for Players & Format
  const [matchType, setMatchType] = useState<MatchType>(session.matchType || '1v1');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    session.taggedPlayers ? session.taggedPlayers.map(p => p.id) : []
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Working state for Bar Items
  const [attachedOrders, setAttachedOrders] = useState<BarOrderItem[]>(
    session.attachedBarOrders ? JSON.parse(JSON.stringify(session.attachedBarOrders)) : []
  );
  const [barSearch, setBarSearch] = useState('');
  const [selectedBarCategory, setSelectedBarCategory] = useState<string>('All');

  // Reset local state whenever modal opens with a new session
  useEffect(() => {
    if (session) {
      setMatchType(session.matchType || '1v1');
      setSelectedPlayerIds(session.taggedPlayers ? session.taggedPlayers.map(p => p.id) : []);
      setAttachedOrders(session.attachedBarOrders ? JSON.parse(JSON.stringify(session.attachedBarOrders)) : []);
      setCustomerSearch('');
      setBarSearch('');
      setShowNewCustForm(false);
    }
  }, [session]);

  // Handle Match Type changes and adjust player selection limits if needed
  const handleMatchTypeChange = (newType: MatchType) => {
    setMatchType(newType);
    const max = newType === 'solo' ? 1 : newType === '1v1' ? 2 : newType === '2v2' ? 4 : Infinity;
    if (selectedPlayerIds.length > max) {
      setSelectedPlayerIds(prev => prev.slice(0, max));
    }
  };

  const handleTogglePlayer = (cust: CustomerPlayer) => {
    const isSelected = selectedPlayerIds.includes(cust.id);
    if (isSelected) {
      setSelectedPlayerIds(prev => prev.filter(id => id !== cust.id));
    } else {
      const maxAllowed = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : matchType === '2v2' ? 4 : Infinity;
      if (selectedPlayerIds.length < maxAllowed) {
        setSelectedPlayerIds(prev => [...prev, cust.id]);
      }
    }
  };

  const handleCreateNewCust = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = sanitize10DigitMobile(newCustPhone);
    if (!newCustName.trim() || cleanPhone.length !== 10) return;
    const created = onAddNewCustomer(newCustName.trim(), cleanPhone);
    const maxAllowed = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : matchType === '2v2' ? 4 : Infinity;
    if (selectedPlayerIds.length < maxAllowed) {
      setSelectedPlayerIds(prev => [...prev, created.id]);
    }
    setNewCustName('');
    setNewCustPhone('');
    setShowNewCustForm(false);
  };

  // Bar items quantity actions
  const handleIncreaseBarItem = (itemId: string) => {
    const originalItem = barItems.find(b => b.id === itemId);
    setAttachedOrders(prev => prev.map(order => {
      if (order.itemId === itemId) {
        return { ...order, quantity: order.quantity + 1 };
      }
      return order;
    }));
  };

  const handleDecreaseBarItem = (itemId: string) => {
    setAttachedOrders(prev => {
      return prev.map(order => {
        if (order.itemId === itemId) {
          return { ...order, quantity: Math.max(1, order.quantity - 1) };
        }
        return order;
      });
    });
  };

  const handleRemoveBarItem = (itemId: string) => {
    setAttachedOrders(prev => prev.filter(order => order.itemId !== itemId));
  };

  const handleAddBarItem = (item: BarItem) => {
    setAttachedOrders(prev => {
      const existingIndex = prev.findIndex(o => o.itemId === item.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  // Save changes
  const handleSave = () => {
    const resolvedPlayers = selectedPlayerIds
      .map(id => customers.find(c => c.id === id))
      .filter((c): c is CustomerPlayer => Boolean(c));

    // Fallback if no players were tagged in solo/1v1/2v2
    let finalPlayers = [...resolvedPlayers];
    const required = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : matchType === '2v2' ? 4 : 0;
    if (matchType !== 'group' && finalPlayers.length < required) {
      const remaining = customers.filter(c => !finalPlayers.some(fp => fp.id === c.id));
      for (let i = finalPlayers.length; i < required; i++) {
        if (remaining[i - finalPlayers.length]) {
          finalPlayers.push(remaining[i - finalPlayers.length]);
        }
      }
    }

    onSaveSession(session.id, matchType, finalPlayers, attachedOrders);
    onClose();
  };

  // Compute live calculations with working state
  const tempSession: GameSession = {
    ...session,
    matchType,
    taggedPlayers: selectedPlayerIds
      .map(id => customers.find(c => c.id === id))
      .filter((c): c is CustomerPlayer => Boolean(c)),
    attachedBarOrders: attachedOrders,
  };
  const previewMetrics = calculateSessionMetrics(tempSession);

  // Bar Categories
  const barCategories = ['All', 'Beverages', 'Snacks', 'Lounge / Hookah', 'Combos'];

  const filteredBarItems = barItems.filter(item => {
    if (selectedBarCategory !== 'All' && item.category !== selectedBarCategory) return false;
    if (barSearch.trim() && !item.name.toLowerCase().includes(barSearch.toLowerCase())) return false;
    return true;
  });

  const maxPlayersForFormat = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : matchType === '2v2' ? 4 : 'Any';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                Live Session Editor
              </span>
              <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {session.assetName}
              </span>
            </div>
            <h2 className={`text-lg font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Edit Players & Bar Orders
            </h2>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Segment */}
        <div className={`px-4 pt-3 pb-2 border-b flex items-center gap-2 ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'players'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : isDarkMode
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Players & Match Format ({selectedPlayerIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bar')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'bar'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : isDarkMode
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Bar & Snacks ({attachedOrders.reduce((a, b) => a + b.quantity, 0)})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'players' ? (
            /* --- TAB 1: PLAYERS & FORMAT --- */
            <div className="space-y-4">
              
              {/* Match Format Selection */}
              <div>
                <label className={`text-xs font-bold block mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Match Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['solo', '1v1', '2v2', 'group'] as MatchType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleMatchTypeChange(type)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                        matchType === type
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : isDarkMode
                            ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div>{type}</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">
                        {type === 'solo' ? '1 Player' : type === '1v1' ? '2 Players' : type === '2v2' ? '4 Players' : 'Any'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tagged Players Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>Currently Tagged Players</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                      selectedPlayerIds.length > 0 
                        ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200')
                        : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                    }`}>
                      {selectedPlayerIds.length} / {maxPlayersForFormat}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowNewCustForm(!showNewCustForm)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> + Quick Register
                  </button>
                </div>

                {/* Inline Quick Register Form */}
                {showNewCustForm && (
                  <form onSubmit={handleCreateNewCust} className={`p-3 mb-3 rounded-xl border space-y-2 ${
                    isDarkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                      <WhatsAppInput
                        value={newCustPhone}
                        onChange={setNewCustPhone}
                        isDarkMode={isDarkMode}
                        size="sm"
                        placeholder="WhatsApp (10 digits)"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewCustForm(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs"
                      >
                        Save & Tag Player
                      </button>
                    </div>
                  </form>
                )}

                {/* Selected Players Pills with 1-click remove */}
                {selectedPlayerIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPlayerIds.map(id => {
                      const cust = customers.find(c => c.id === id);
                      if (!cust) return null;
                      return (
                        <div
                          key={cust.id}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                            isDarkMode
                              ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                          }`}
                        >
                          <span>{cust.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPlayerIds(prev => prev.filter(pId => pId !== cust.id))}
                            className="p-0.5 rounded-full hover:bg-rose-500/20 hover:text-rose-400 transition"
                            title="Remove player"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl border border-dashed text-xs text-center mb-3 ${
                    isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-500'
                  }`}>
                    No players tagged yet. Select from the list below.
                  </div>
                )}

                {/* Customer Search & Select list */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder="Search registered player by name or WhatsApp no..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.whatsapp.includes(customerSearch))
                      .map(cust => {
                        const isSelected = selectedPlayerIds.includes(cust.id);
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => handleTogglePlayer(cust)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? isDarkMode
                                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                                  : 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                                : isDarkMode
                                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <span className="block">{cust.name}</span>
                              <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatWhatsAppDisplay(cust.whatsapp)}</span>
                            </div>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'
                              }`}>
                                <Plus className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* --- TAB 2: BAR & SNACK ORDERS --- */
            <div className="space-y-4">
              
              {/* Currently Attached Items List with Stepper & Trash */}
              <div>
                <label className={`text-xs font-bold block mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Attached Bar Items to this Station ({attachedOrders.length})
                </label>

                {attachedOrders.length > 0 ? (
                  <div className="space-y-2">
                    {attachedOrders.map(order => {
                      const itemTotal = order.price * order.quantity;
                      return (
                        <div
                          key={order.itemId}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className={`text-xs font-bold block truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {order.name}
                            </span>
                            <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              ₹{order.price} each • Subtotal: <strong className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>₹{itemTotal}</strong>
                            </span>
                          </div>

                          {/* Stepper & Trash Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className={`flex items-center rounded-xl border overflow-hidden ${
                              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleDecreaseBarItem(order.itemId)}
                                className={`p-1.5 transition cursor-pointer ${
                                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className={`px-2.5 text-xs font-mono font-bold min-w-[24px] text-center ${
                                isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {order.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncreaseBarItem(order.itemId)}
                                className={`p-1.5 transition cursor-pointer ${
                                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveBarItem(order.itemId)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Remove item completely"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border border-dashed text-xs text-center ${
                    isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-500'
                  }`}>
                    No bar or snack items currently attached. Add items below.
                  </div>
                )}
              </div>

              {/* Add New Snack Catalog Picker */}
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Add Items from Bar Catalog
                  </label>
                  <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {filteredBarItems.length} items available
                  </span>
                </div>

                {/* Bar Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {barCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedBarCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedBarCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Item */}
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Search beverages, snacks, combos..."
                    value={barSearch}
                    onChange={(e) => setBarSearch(e.target.value)}
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Items List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredBarItems.map(item => {
                    const isOutOfStock = item.stock !== null && item.stock <= 0;
                    const alreadyAttachedQty = attachedOrders.find(o => o.itemId === item.id)?.quantity || 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                          isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`font-mono font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              ₹{item.price}
                            </span>
                            {item.stock !== null ? (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                isOutOfStock
                                  ? (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600 border border-red-200')
                                  : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                              }`}>
                                {isOutOfStock ? 'Out of stock' : `${item.stock} in stock`}
                              </span>
                            ) : null}
                            {alreadyAttachedQty > 0 && (
                              <span className="text-[10px] text-amber-500 font-semibold">
                                ({alreadyAttachedQty} in session)
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddBarItem(item)}
                          disabled={isOutOfStock}
                          className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1 text-xs transition cursor-pointer ${
                            isOutOfStock
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" /> + Add
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Modal Footer with Live Ticker & Action Buttons */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          {/* Live Total Ticker Preview */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`p-2 rounded-xl border text-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <span className={`block text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Live Total Preview
              </span>
              <span className={`text-base font-extrabold font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                ₹{previewMetrics.totalCost}
              </span>
              <span className={`text-[10px] ml-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                (Game: ₹{previewMetrics.gameCost} • Bar: ₹{previewMetrics.barCost})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800/80' : 'text-slate-600 hover:text-slate-900 bg-slate-200'
              }`}
            >
              Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
