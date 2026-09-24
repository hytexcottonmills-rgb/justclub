import React, { useState, useMemo } from 'react';
import { BarItem, BarCategory, CustomerPlayer, PaymentMethod } from '../types';
import { UpiQrModal } from './UpiQrModal';
import { generateWhatsAppReceiptLink } from '../utils/billing';
import { 
  Martini, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  QrCode, 
  DollarSign, 
  Receipt, 
  User, 
  Users, 
  UserPlus, 
  UserCheck, 
  X, 
  Phone, 
  Wallet, 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle,
  Coffee,
  UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UNIFIED_BAR_CATEGORIES: { key: BarCategory; label: string }[] = [
  { key: 'Beverages', label: 'Beverages & Cold Drinks' },
  { key: 'Snacks', label: 'Snacks & Quick Bites' },
  { key: 'Hot Drinks', label: 'Hot Tea & Coffee' },
  { key: 'Combos', label: 'Game & Food Combos' },
  { key: 'Desserts', label: 'Desserts & Ice Cream' },
  { key: 'Lounge / Hookah', label: 'Lounge / Hookah Specials' },
  { key: 'Other', label: 'Other Bar Items' },
];

interface BarPosTerminalProps {
  barItems: BarItem[];
  customers: CustomerPlayer[];
  upiId: string;
  clubName: string;
  onProcessDirectBarSale: (
    items: { item: BarItem; quantity: number }[],
    customer: CustomerPlayer | null,
    paymentMethod: PaymentMethod
  ) => void;
  onAddNewCustomer?: (name: string, whatsapp: string) => CustomerPlayer;
  onAddBarItem?: (item: Omit<BarItem, 'id'>) => void;
  isDarkMode?: boolean;
  isReadOnly?: boolean;
  onLoadMoreBarItems?: () => void;
  hasMoreBarItems?: boolean;
  isLoadingMoreBarItems?: boolean;
}

export const BarPosTerminal: React.FC<BarPosTerminalProps> = ({
  barItems,
  customers,
  upiId,
  clubName,
  onProcessDirectBarSale,
  onAddNewCustomer,
  onAddBarItem,
  isDarkMode = true,
  isReadOnly = false,
  onLoadMoreBarItems,
  hasMoreBarItems = false,
  isLoadingMoreBarItems = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state: itemId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Customer selection state: null = Anonymous Walk-in, otherwise CustomerPlayer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPlayer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [customerSearch, setCustomerSearch] = useState('');

  // Customer Picker Modal State
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [customerPickerSearch, setCustomerPickerSearch] = useState('');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerError, setNewCustomerError] = useState('');

  // Responsive mobile tab state ('catalog' | 'cart')
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Upi QR Modal state
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  // Stock Availability Warning state
  const [isStockWarningOpen, setIsStockWarningOpen] = useState(false);
  const [isStockWarningConfirmed, setIsStockWarningConfirmed] = useState(false);

  // Last sale WhatsApp receipt link
  const [lastReceiptUrl, setLastReceiptUrl] = useState<string | null>(null);

  // Add Bar Item Modal State
  const [isAddBarItemModalOpen, setIsAddBarItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BarCategory>('Beverages');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>(120);
  const [newItemStock, setNewItemStock] = useState<number | ''>(50);
  const [addBarItemError, setAddBarItemError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const presentCats = Array.from(new Set(barItems.map(item => item.category).filter(Boolean)));
    const unifiedKeys = UNIFIED_BAR_CATEGORIES.map(c => c.key);
    const merged = Array.from(new Set([...presentCats, ...unifiedKeys]));
    return ['All', ...merged];
  }, [barItems]);

  const filteredItems = barItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const cartList = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = barItems.find(i => i.id === itemId);
      return item ? { item, quantity: qty } : null;
    })
    .filter((x): x is { item: BarItem; quantity: number } => x !== null);

  const totalCartAmount = cartList.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const oversoldItems = cartList.filter(
    ({ item, quantity }) => item.stock !== null && quantity > item.stock
  );

  const updateQuantity = (itemId: string, delta: number) => {
    setIsStockWarningConfirmed(false);
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleCheckout = () => {
    if (cartList.length === 0) return;

    if (oversoldItems.length > 0 && !isStockWarningConfirmed) {
      setIsStockWarningOpen(true);
      return;
    }

    if (paymentMethod === 'UPI' && !isQrOpen) {
      setIsQrOpen(true);
      return;
    }

    // Process Sale
    onProcessDirectBarSale(cartList, selectedCustomer, paymentMethod);

    // Generate WhatsApp Receipt URL if customer tagged
    if (selectedCustomer) {
      const receiptUrl = generateWhatsAppReceiptLink(
        selectedCustomer.name,
        selectedCustomer.whatsapp,
        clubName,
        totalCartAmount,
        paymentMethod === 'Ledger' ? 0 : totalCartAmount,
        paymentMethod === 'Ledger' ? totalCartAmount : 0,
        upiId
      );
      setLastReceiptUrl(receiptUrl);
    }

    // Reset Cart
    setCart({});
    setSelectedCustomer(null);
    setPaymentMethod('Cash');
    setCustomerSearch('');
    setIsStockWarningOpen(false);
    setIsStockWarningConfirmed(false);
  };

  const handleConfirmStockWarning = () => {
    setIsStockWarningConfirmed(true);
    setIsStockWarningOpen(false);

    if (paymentMethod === 'UPI' && !isQrOpen) {
      setIsQrOpen(true);
      return;
    }

    onProcessDirectBarSale(cartList, selectedCustomer, paymentMethod);

    if (selectedCustomer) {
      const receiptUrl = generateWhatsAppReceiptLink(
        selectedCustomer.name,
        selectedCustomer.whatsapp,
        clubName,
        totalCartAmount,
        paymentMethod === 'Ledger' ? 0 : totalCartAmount,
        paymentMethod === 'Ledger' ? totalCartAmount : 0,
        upiId
      );
      setLastReceiptUrl(receiptUrl);
    }

    setCart({});
    setSelectedCustomer(null);
    setPaymentMethod('Cash');
    setCustomerSearch('');
    setIsStockWarningConfirmed(false);
  };

  const handleCancelStockWarning = () => {
    setIsStockWarningOpen(false);
    setIsStockWarningConfirmed(false);
  };

  const handleSelectCustomer = (customer: CustomerPlayer | null) => {
    setSelectedCustomer(customer);
    if (!customer && paymentMethod === 'Ledger') {
      setPaymentMethod('Cash');
    }
    setIsCustomerPickerOpen(false);
    setCustomerPickerSearch('');
    setIsAddingNewCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerError('');
  };

  const handleQuickCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      setNewCustomerError('Please enter customer name');
      return;
    }
    const cleanPhone = newCustomerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      setNewCustomerError('Please enter a valid phone/WhatsApp number (min 7 digits)');
      return;
    }

    let created: CustomerPlayer;
    if (onAddNewCustomer) {
      created = onAddNewCustomer(newCustomerName.trim(), cleanPhone);
    } else {
      created = {
        id: `cust_${Date.now()}`,
        name: newCustomerName.trim(),
        whatsapp: cleanPhone,
        ledgerBalance: 0,
        totalVisits: 1,
        lastVisitedDate: new Date().toISOString().split('T')[0],
        lifetimeValue: 0,
      };
    }

    handleSelectCustomer(created);
  };

  const filteredPickerCustomers = customers.filter(c => {
    if (!customerPickerSearch.trim()) return true;
    const q = customerPickerSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.whatsapp.includes(q);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

      {/* Mobile Tab Switcher (Catalog vs Cart) */}
      <div className={`lg:hidden col-span-1 flex rounded-2xl p-1 border ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Martini className="w-4 h-4" />
          <span>Menu ({filteredItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 relative ${
            mobileTab === 'cart'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Cart ({cartList.reduce((a, b) => a + b.quantity, 0)}) • ₹{totalCartAmount}</span>
          {cartList.length > 0 && mobileTab !== 'cart' && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse absolute top-2 right-2.5" />
          )}
        </button>
      </div>

      {/* Left 2 Columns: Catalog Grid & Search */}
      <div id="bar-pos-catalog" className={`${mobileTab === 'catalog' ? 'block' : 'hidden lg:block'} lg:col-span-2 space-y-4 sm:space-y-5`}>
        
        {/* Top Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Martini className="w-5 h-5 text-indigo-500" /> Standalone Bar Terminal
            </h1>
            <p className={`text-xs mt-0.5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Rapid POS checkout for walk-in lounge customers & direct cafe orders.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search beverage or food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isDarkMode
                    ? 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredItems.map((item) => {
            const currentQtyInCart = cart[item.id] || 0;
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                  currentQtyInCart > 0
                    ? isDarkMode
                      ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20'
                      : 'bg-white border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                    : isDarkMode
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block truncate ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    {item.stock !== null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        item.stock === 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.stock <= 5
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.stock === 0
                          ? 'Out of Stock'
                          : item.stock <= 5
                            ? `Low: ${item.stock}`
                            : `Stock: ${item.stock}`}
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xs font-bold leading-tight line-clamp-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {item.name}
                  </h3>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                  isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                }`}>
                  <span className={`text-sm font-extrabold font-mono ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    ₹{item.price}
                  </span>

                  {currentQtyInCart > 0 ? (
                    <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      <button onClick={() => updateQuantity(item.id, -1)} className="hover:opacity-80">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span>{currentQtyInCart}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="hover:opacity-80">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className={`p-1.5 rounded-lg transition ${
                        isDarkMode
                          ? 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white'
                          : 'bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white border border-slate-200'
                      }`}
                      title="Add to Cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* --- IN-GRID ADD FOOD / BEVERAGE CARD (Always accessible in Bar POS) --- */}
          {onAddBarItem && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border-2 border-dashed flex flex-col justify-between transition-all duration-200 group ${
                isDarkMode
                  ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/70 text-slate-100'
                  : 'bg-slate-50/60 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isDarkMode
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    CATALOG
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isDarkMode ? 'bg-slate-800/80 text-slate-400 border-slate-700/80' : 'bg-white text-slate-600 border-slate-200 shadow-2xs'
                  }`}>
                    + ADD ITEM
                  </span>
                </div>
                <h3 className={`text-xs font-bold leading-tight mt-1.5 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Add Food / Beverage
                </h3>
              </div>

              {/* Center Body - Subtle, clean card interior */}
              <div className={`my-3 py-3 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-1.5 transition ${
                isDarkMode 
                  ? 'border-slate-800 bg-slate-950/40 text-slate-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-950/20' 
                  : 'border-slate-200 bg-white/70 text-slate-500 group-hover:border-indigo-300 group-hover:bg-white'
              }`}>
                <div className={`p-2 rounded-xl transition ${
                  isDarkMode 
                    ? 'bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25 group-hover:text-indigo-300' 
                    : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                }`}>
                  <Coffee className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  New Menu Item
                </span>
                <span className="text-[10px] opacity-75">Drinks, snacks & quick bites</span>
              </div>

              {/* Bottom Action Button - Clean JustClub Indigo */}
              <div className={`pt-2.5 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    if (isReadOnly) return;
                    setIsAddBarItemModalOpen(true);
                  }}
                  disabled={isReadOnly}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer ${
                    isReadOnly
                      ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850 shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  Configure & Add Item
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {hasMoreBarItems && onLoadMoreBarItems && (
          <div className="mt-6 text-center">
            <button
              onClick={onLoadMoreBarItems}
              disabled={isLoadingMoreBarItems}
              className={`px-6 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm border ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              {isLoadingMoreBarItems ? 'Loading Bar Items...' : 'Load More Bar Items'}
            </button>
          </div>
        )}
      </div>

      {/* Right 1 Column: POS Checkout Cart Sidebar */}
      <div id="bar-pos-cart" className={`${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'} border rounded-2xl p-4 sm:p-5 flex-col justify-between shadow-xl space-y-4 ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div>
          {/* Cart Header */}
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Martini className="w-4 h-4 text-indigo-500" /> Current Order Cart
            </h2>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              {cartList.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>

          {/* Customer Type Switcher (Walk-in vs Tag Registered) */}
          <div className="my-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <User className="w-3.5 h-3.5 text-indigo-500" /> Customer Profile
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedCustomer) {
                    handleSelectCustomer(null);
                  } else {
                    setIsCustomerPickerOpen(true);
                  }
                }}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                {selectedCustomer ? 'Switch to Walk-in' : '+ Tag Customer'}
              </button>
            </div>

            {selectedCustomer ? (
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-xs ${
                isDarkMode ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-indigo-50/80 border-indigo-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className={`font-bold block truncate text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedCustomer.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                        +{selectedCustomer.whatsapp}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        selectedCustomer.ledgerBalance < 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {selectedCustomer.ledgerBalance < 0
                          ? `Due: ₹${Math.abs(selectedCustomer.ledgerBalance)}`
                          : 'Clear ₹0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCustomerPickerOpen(true)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                    title="Change customer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCustomer(null)}
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'
                    }`}
                    title="Switch back to Anonymous Walk-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div 
                  onClick={() => setIsCustomerPickerOpen(true)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        Anonymous Walk-in
                      </div>
                      <div className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        Click to select registered customer
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCustomerPickerOpen(true);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" /> Select
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Quick search customer name/phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className={`w-full rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {customerSearch && (
                    <div className={`absolute left-0 right-0 top-full mt-1 border rounded-xl max-h-48 overflow-y-auto z-20 shadow-xl p-1.5 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      {customers
                        .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.whatsapp.includes(customerSearch))
                        .map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearch('');
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                              isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div>
                              <span className="font-bold">{c.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono ml-1.5">+{c.whatsapp}</span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              c.ledgerBalance < 0 ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'
                            }`}>
                              {c.ledgerBalance < 0 ? `Due ₹${Math.abs(c.ledgerBalance)}` : 'Clear'}
                            </span>
                          </button>
                        ))}
                      {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.whatsapp.includes(customerSearch)).length === 0 && (
                        <div className="p-2 text-center text-xs text-slate-500">
                          No customer found.{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomerPickerOpen(true);
                              setIsAddingNewCustomer(true);
                              setNewCustomerName(customerSearch);
                            }}
                            className="text-indigo-500 font-bold hover:underline ml-1 cursor-pointer"
                          >
                            + Add New
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Itemized List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 my-3">
            {cartList.length === 0 ? (
              <div className={`py-8 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Cart is empty. Click items on the left to add.
              </div>
            ) : (
              cartList.map(({ item, quantity }) => {
                const isOversold = item.stock !== null && quantity > item.stock;
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 text-xs ${
                      isOversold
                        ? isDarkMode
                          ? 'bg-amber-950/30 border-amber-500/50'
                          : 'bg-amber-50 border-amber-300'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800/80'
                          : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-2 min-w-0">
                        <span className={`font-semibold block truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                        <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          ₹{item.price} × {quantity} = <strong className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>₹{item.price * quantity}</strong>
                        </span>
                      </div>

                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border shrink-0 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}>
                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:opacity-80 cursor-pointer">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs px-1">{quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:opacity-80 cursor-pointer">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {isOversold && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 dark:text-amber-400 pt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Only {item.stock} in stock</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Payment Method Selector */}
          <div className={`pt-3 border-t space-y-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Payment Method
              </span>
              {!selectedCustomer ? (
                <span className="text-[10px] font-semibold text-amber-500">
                  Walk-in: Cash or UPI only
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-500">
                  Customer Tagged: Cash, UPI, or Ledger
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  paymentMethod === 'Cash'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isDarkMode
                      ? 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDarkMode
                      ? 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> UPI
              </button>
              <button
                type="button"
                disabled={!selectedCustomer}
                onClick={() => {
                  if (selectedCustomer) {
                    setPaymentMethod('Ledger');
                  }
                }}
                className={`py-2 rounded-xl text-xs font-semibold transition ${
                  !selectedCustomer
                    ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border border-slate-800'
                    : paymentMethod === 'Ledger'
                      ? 'bg-amber-600 text-white shadow-xs cursor-pointer'
                      : isDarkMode
                        ? 'bg-slate-950 text-slate-400 hover:bg-slate-800 cursor-pointer'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer'
                }`}
                title={!selectedCustomer ? 'Tag a registered customer above to enable Ledger payment' : 'Charge to Customer Khata'}
              >
                Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Total & Checkout Button */}
        <div className={`pt-4 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Total Amount</span>
            <span className={`text-2xl font-extrabold font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              ₹{totalCartAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            id="bar-pos-checkout-btn"
            disabled={cartList.length === 0 || isReadOnly}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              isReadOnly
                ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border border-slate-800 shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50'
            }`}
            title={isReadOnly ? 'POS is in Read-Only mode due to expired subscription' : ''}
          >
            <Check className="w-4 h-4" />
            Process Settlement (₹{totalCartAmount})
          </button>

          {/* Last receipt WhatsApp notification banner */}
          {lastReceiptUrl && (
            <a
              href={lastReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className={`p-2.5 rounded-xl text-xs flex items-center justify-between transition border ${
                isDarkMode
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Digital Receipt Ready
              </span>
              <span className="text-[10px] font-bold underline">Send Link</span>
            </a>
          )}
        </div>
      </div>

      {/* Mobile Floating Cart Summary Button */}
      {cartList.length > 0 && mobileTab === 'catalog' && (
        <div className="lg:hidden fixed bottom-20 left-3 right-3 z-40">
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-2xl shadow-indigo-600/70 flex items-center justify-between border border-indigo-400/40 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-mono">
                {cartList.reduce((a, b) => a + b.quantity, 0)}
              </span>
              <span>Review Cart & Checkout</span>
            </div>
            <span className="font-mono text-sm font-black">₹{totalCartAmount.toLocaleString('en-IN')} →</span>
          </button>
        </div>
      )}

      {/* Instant UPI QR Modal */}
      {isQrOpen && (
        <UpiQrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          amount={totalCartAmount}
          upiId={upiId}
          clubName={clubName}
          customerName={selectedCustomer ? selectedCustomer.name : 'Walk-in'}
          onConfirmPaid={() => {
            onProcessDirectBarSale(cartList, selectedCustomer, 'UPI');
            setIsQrOpen(false);
            setCart({});
            setIsStockWarningConfirmed(false);
          }}
        />
      )}

      {/* Stock Availability Warning Modal */}
      <AnimatePresence>
        {isStockWarningOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">
                    Stock Availability Warning
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {oversoldItems.length} item(s) exceed available stock — sell anyway?
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border space-y-2 text-xs max-h-40 overflow-y-auto ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {oversoldItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="font-semibold truncate">{item.name}</span>
                    <span className="font-mono text-amber-500 font-bold ml-2 shrink-0">
                      Cart: {quantity} (Stock: {item.stock})
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelStockWarning}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel & Adjust
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStockWarning}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm & Sell Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Picker & Instant Registration Modal */}
      <AnimatePresence>
        {isCustomerPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
                isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight">
                      Select Customer Profile
                    </h2>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Tag customer for digital receipts & Khata credit tab
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomerPickerOpen(false);
                    setIsAddingNewCustomer(false);
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Actions Bar */}
              <div className={`p-4 border-b space-y-3 shrink-0 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={customerPickerSearch}
                      onChange={(e) => setCustomerPickerSearch(e.target.value)}
                      autoFocus
                      className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    {customerPickerSearch && (
                      <button
                        type="button"
                        onClick={() => setCustomerPickerSearch('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewCustomer(prev => !prev);
                      if (!isAddingNewCustomer && customerPickerSearch) {
                        setNewCustomerName(customerPickerSearch);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isAddingNewCustomer
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isAddingNewCustomer ? 'Cancel' : '+ New'}</span>
                  </button>
                </div>

                {/* Inline Quick Register Customer Form */}
                {isAddingNewCustomer && (
                  <form onSubmit={handleQuickCreateCustomer} className={`p-3.5 rounded-xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-950/80 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Register New Customer
                      </span>
                      <span className="text-[10px] text-slate-500">Instant Bar & Khata Sync</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold block mb-1 text-slate-400">Customer Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={newCustomerName}
                          onChange={(e) => {
                            setNewCustomerName(e.target.value);
                            setNewCustomerError('');
                          }}
                          className={`w-full rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                            isDarkMode
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold block mb-1 text-slate-400">WhatsApp / Phone</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9840012345"
                          value={newCustomerPhone}
                          onChange={(e) => {
                            setNewCustomerPhone(e.target.value);
                            setNewCustomerError('');
                          }}
                          className={`w-full rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                            isDarkMode
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {newCustomerError && (
                      <p className="text-[11px] text-rose-400 font-medium">{newCustomerError}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCustomer(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Save & Tag
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Customer List Content */}
              <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[380px]">
                {/* Option 1: Anonymous Walk-in */}
                <div
                  onClick={() => handleSelectCustomer(null)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedCustomer === null
                      ? isDarkMode ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-indigo-50 border-indigo-500 text-indigo-900'
                      : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                      selectedCustomer === null ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        <span>Anonymous Walk-in Customer</span>
                        {selectedCustomer === null && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-semibold">
                            Currently Active
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Quick bill without customer registration (Cash / UPI only)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCustomer(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCustomer === null
                        ? 'bg-indigo-600 text-white'
                        : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {selectedCustomer === null ? 'Selected' : 'Select'}
                  </button>
                </div>

                {/* Section Separator */}
                <div className="pt-2 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Registered Customers ({filteredPickerCustomers.length})</span>
                  <span>Ledger / Khata Status</span>
                </div>

                {/* Customers loop */}
                {filteredPickerCustomers.map(customer => {
                  const isCurrent = selectedCustomer?.id === customer.id;
                  return (
                    <div
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isCurrent
                          ? isDarkMode ? 'bg-indigo-950/50 border-indigo-500 text-white' : 'bg-indigo-50 border-indigo-500 text-slate-900'
                          : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCurrent ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-indigo-600'
                        }`}>
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs flex items-center gap-2">
                            <span className="truncate">{customer.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-semibold shrink-0">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>+{customer.whatsapp}</span>
                            <span>•</span>
                            <span>{customer.totalVisits} visits</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                          customer.ledgerBalance < 0
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : customer.ledgerBalance > 0
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {customer.ledgerBalance < 0
                            ? `Due: ₹${Math.abs(customer.ledgerBalance)}`
                            : customer.ledgerBalance > 0
                              ? `Adv: ₹${customer.ledgerBalance}`
                              : 'Clear ₹0'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCustomer(customer);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600 text-white'
                              : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span>{isCurrent ? 'Selected' : 'Select'}</span>
                          {!isCurrent && <ArrowRight className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredPickerCustomers.length === 0 && (
                  <div className="py-8 text-center space-y-2">
                    <User className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="text-xs font-semibold text-slate-400">
                      No customer matching &quot;{customerPickerSearch}&quot;
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCustomer(true);
                        setNewCustomerName(customerPickerSearch);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register &quot;{customerPickerSearch}&quot; as New Customer</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-3.5 border-t flex items-center justify-between shrink-0 text-xs ${
                isDarkMode ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <span>{customers.length} total registered club members</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomerPickerOpen(false);
                    setIsAddingNewCustomer(false);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* --- ADD NEW FOOD / BEVERAGE MENU ITEM MODAL --- */}
        {isAddBarItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-indigo-500" />
                    Add Food & Beverage Item
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Configure pricing and stock for the POS menu & player orders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBarItemModalOpen(false);
                    setAddBarItemError(null);
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newItemName.trim()) {
                    setAddBarItemError('Please enter an item name');
                    return;
                  }
                  if (typeof newItemPrice !== 'number' || newItemPrice <= 0) {
                    setAddBarItemError('Please enter a valid selling price');
                    return;
                  }

                  if (onAddBarItem) {
                    onAddBarItem({
                      name: newItemName.trim(),
                      category: newItemCategory,
                      price: newItemPrice,
                      stock: newItemStock === '' ? null : Number(newItemStock),
                    });
                  }

                  setIsAddBarItemModalOpen(false);
                  setNewItemName('');
                  setNewItemCategory('Beverages');
                  setNewItemPrice(120);
                  setNewItemStock(50);
                  setAddBarItemError(null);
                }}
                className="p-5 space-y-4"
              >
                {addBarItemError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{addBarItemError}</span>
                  </div>
                )}

                {/* Field 1: Item Name */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red Bull Energy Drink / Cold Coffee / French Fries"
                    value={newItemName}
                    onChange={(e) => {
                      setNewItemName(e.target.value);
                      if (addBarItemError) setAddBarItemError(null);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border transition ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                    autoFocus
                    required
                  />
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Display label on POS register and customer receipts
                  </p>
                </div>

                {/* Field 2: Menu Category (Standardized Unified Category) */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Menu Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as BarCategory)}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border transition ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {UNIFIED_BAR_CATEGORIES.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Category filter tag in Bar POS terminal & bills
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Field 3: Selling Price */}
                  <div className="space-y-1.5">
                    <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Selling Price <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="120"
                        value={newItemPrice === '' ? '' : newItemPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewItemPrice(val === '' ? '' : Number(val));
                        }}
                        className={`w-full rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold border transition ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-600'
                        }`}
                        required
                      />
                    </div>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Tax-inclusive retail rate
                    </p>
                  </div>

                  {/* Field 4: Initial Stock Quantity */}
                  <div className="space-y-1.5">
                    <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Stock Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="50 (blank = unlimited)"
                        value={newItemStock === '' ? '' : newItemStock}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewItemStock(val === '' ? '' : Number(val));
                        }}
                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border transition ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Units available (auto-decrements)
                    </p>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddBarItemModalOpen(false);
                      setAddBarItemError(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Save Menu Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
