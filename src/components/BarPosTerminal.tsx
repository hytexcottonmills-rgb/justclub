import React, { useState } from 'react';
import { BarItem, CustomerPlayer, PaymentMethod } from '../types';
import { UpiQrModal } from './UpiQrModal';
import { generateWhatsAppReceiptLink } from '../utils/billing';
import { 
  ShoppingBag, 
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
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  isDarkMode?: boolean;
}

export const BarPosTerminal: React.FC<BarPosTerminalProps> = ({
  barItems,
  customers,
  upiId,
  clubName,
  onProcessDirectBarSale,
  isDarkMode = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state: itemId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Customer selection state: null = Anonymous Walk-in, otherwise CustomerPlayer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPlayer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [customerSearch, setCustomerSearch] = useState('');

  // Responsive mobile tab state ('catalog' | 'cart')
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Upi QR Modal state
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  // Last sale WhatsApp receipt link
  const [lastReceiptUrl, setLastReceiptUrl] = useState<string | null>(null);

  const categories = ['All', 'Beverages', 'Snacks', 'Lounge / Hookah', 'Combos'];

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

  const updateQuantity = (itemId: string, delta: number) => {
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
  };

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
          <ShoppingBag className="w-4 h-4" />
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
      <div className={`${mobileTab === 'catalog' ? 'block' : 'hidden lg:block'} lg:col-span-2 space-y-4 sm:space-y-5`}>
        
        {/* Top Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <ShoppingBag className="w-5 h-5 text-indigo-500" /> Standalone Bar Terminal
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
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {item.category}
                  </span>
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
        </div>
      </div>

      {/* Right 1 Column: POS Checkout Cart Sidebar */}
      <div className={`${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'} border rounded-2xl p-4 sm:p-5 flex-col justify-between shadow-xl space-y-4 ${
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
              <ShoppingBag className="w-4 h-4 text-indigo-500" /> Current Order Cart
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
              <span className={isDarkMode ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>Customer Profile:</span>
              <button
                onClick={() => {
                  if (selectedCustomer) setSelectedCustomer(null);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selectedCustomer ? 'Switch to Anonymous Walk-in' : 'Select Customer'}
              </button>
            </div>

            {selectedCustomer ? (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
              }`}>
                <div>
                  <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedCustomer.name}</span>
                  <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>+{selectedCustomer.whatsapp}</span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className={`p-1 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Anonymous Walk-in Customer</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search registered customer..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className={`w-full rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {customerSearch && (
                    <div className={`absolute left-0 right-0 top-full mt-1 border rounded-xl max-h-36 overflow-y-auto z-20 shadow-xl p-1 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      {customers
                        .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                        .map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearch('');
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs block ${
                              isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <span className="font-bold">{c.name}</span> (+{c.whatsapp})
                          </button>
                        ))}
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
              cartList.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDarkMode
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <span className={`font-semibold block truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ₹{item.price} × {quantity} = <strong className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>₹{item.price * quantity}</strong>
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}>
                    <button onClick={() => updateQuantity(item.id, -1)} className="hover:opacity-80">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs px-1">{quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="hover:opacity-80">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method Selector */}
          <div className={`pt-3 border-t space-y-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Payment Method</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 rounded-xl text-xs font-semibold transition ${
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
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${
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
                onClick={() => setPaymentMethod('Ledger')}
                className={`py-2 rounded-xl text-xs font-semibold transition ${
                  paymentMethod === 'Ledger'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isDarkMode
                      ? 'bg-slate-950 text-slate-500 disabled:opacity-50'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 disabled:opacity-50'
                }`}
                title={!selectedCustomer ? 'Requires registered customer profile' : 'Push to Ledger'}
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
            disabled={cartList.length === 0}
            onClick={handleCheckout}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
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
          }}
        />
      )}
    </div>
  );
};
