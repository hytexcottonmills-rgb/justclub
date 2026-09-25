import React, { useState } from 'react';
import { MembershipPlan, CustomerPlayer } from '../types';
import { 
  X, 
  Crown, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Percent, 
  Clock, 
  IndianRupee, 
  Users, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MembershipPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: MembershipPlan[];
  onSavePlan: (plan: MembershipPlan) => void;
  onDeletePlan: (planId: string) => void;
  customers: CustomerPlayer[];
  isDarkMode?: boolean;
}

export const MembershipPlansModal: React.FC<MembershipPlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSavePlan,
  onDeletePlan,
  customers,
  isDarkMode = true,
}) => {
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(999);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [gameDiscountPercent, setGameDiscountPercent] = useState<number>(30);
  const [barDiscountPercent, setBarDiscountPercent] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingPlan(null);
    setName('');
    setPrice(999);
    setDurationDays(30);
    setGameDiscountPercent(30);
    setBarDiscountPercent(0);
    setDescription('');
    setIsActive(true);
    setIsCreatingNew(true);
  };

  const handleStartEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setDurationDays(plan.durationDays);
    setGameDiscountPercent(plan.gameDiscountPercent);
    setBarDiscountPercent(plan.barDiscountPercent || 0);
    setDescription(plan.description || '');
    setIsActive(plan.isActive);
    setIsCreatingNew(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const planData: MembershipPlan = {
      id: editingPlan ? editingPlan.id : `plan_${Date.now()}`,
      name: name.trim(),
      price: typeof price === 'number' ? Math.max(0, price) : 0,
      durationDays: Math.max(1, durationDays),
      gameDiscountPercent: Math.min(100, Math.max(0, gameDiscountPercent)),
      barDiscountPercent: Math.min(100, Math.max(0, barDiscountPercent)),
      description: description.trim(),
      isActive,
      createdAt: editingPlan?.createdAt || new Date().toISOString(),
    };

    onSavePlan(planData);
    setIsCreatingNew(false);
    setEditingPlan(null);
  };

  const getMemberCount = (planId: string) => {
    return customers.filter(c => c.membershipPlanId === planId && c.membershipStatus === 'ACTIVE').length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Club Membership Plans</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {plans.length} Plans Active
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Configure percentage game discounts (0%–100%) and recurring player passes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isCreatingNew ? (
            /* CREATE / EDIT PLAN FORM */
            <form onSubmit={handleSubmit} className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gold VIP Member (30% Off), Practice Club Pass (100% Free)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-medium ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                    }`}
                  />
                </div>

                {/* Price & Duration */}
                <div className="space-y-1">
                  <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    Membership Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border font-mono font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                {/* Duration in Days */}
                <div className="space-y-1">
                  <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    Validity Duration (Days)
                  </label>
                  <div className="flex gap-1.5">
                    {[30, 90, 180, 365].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationDays(d)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          durationDays === d
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : isDarkMode
                              ? 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-2xs'
                        }`}
                      >
                        {d === 365 ? '1 Year' : `${d}d`}
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className={`w-16 px-2 py-1.5 text-xs text-center rounded-lg border font-mono font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                {/* Game Discount Percentage (0% - 100%) */}
                <div className={`p-3.5 rounded-xl border sm:col-span-2 space-y-2 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Game Table Discount Percentage</span>
                      <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Automatically deducted from member's calculated game share (1v1, 2v2, LP, or Solo)
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 border px-3 py-1 rounded-xl ${
                      isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-300'
                    }`}>
                      <span className={`text-base font-black font-mono ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{gameDiscountPercent}%</span>
                      <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-amber-300/80' : 'text-amber-800'}`}>OFF</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={gameDiscountPercent}
                      onChange={(e) => setGameDiscountPercent(Number(e.target.value))}
                      className={`flex-1 accent-amber-500 cursor-pointer h-2 rounded-lg ${
                        isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    />
                    <div className="flex gap-1">
                      {[15, 30, 50, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setGameDiscountPercent(pct)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                            gameDiscountPercent === pct
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                              : isDarkMode
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {pct === 100 ? 'FREE (100%)' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cafe / Bar Discount (Optional) */}
                <div className={`p-3.5 rounded-xl border sm:col-span-2 space-y-2 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Snack & Cafe Discount (Optional)</span>
                      <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Optional perk for food, beverages, and hookah orders
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 border px-3 py-1 rounded-xl ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                    }`}>
                      <span className={`text-xs font-black font-mono ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{barDiscountPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={barDiscountPercent}
                      onChange={(e) => setBarDiscountPercent(Number(e.target.value))}
                      className={`flex-1 accent-indigo-500 cursor-pointer h-2 rounded-lg ${
                        isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    Perks & Notes for Customer Receipt
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 30% discount on all snooker tables, priority booking, free locker use."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-2 pt-2 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPlan ? 'Save Plan Updates' : 'Create Membership Plan'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* PLANS LISTING */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Plans created here are selectable when assigning or selling passes to members.
                </div>
                <button
                  onClick={handleStartCreate}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {plans.map((plan) => {
                  const memberCount = getMemberCount(plan.id);

                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isDarkMode
                          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>{plan.name}</span>
                              </h4>
                              {plan.isActive ? (
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${
                                  isDarkMode
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold'
                                }`}>
                                  ACTIVE
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                                  isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  INACTIVE
                                </span>
                              )}
                            </div>
                            <div className={`text-xs font-mono font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                              ₹{plan.price.toLocaleString('en-IN')} <span className={`text-[10px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ {plan.durationDays} days</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(plan)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title="Edit Plan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeletePlan(plan.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
                              title="Delete Plan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Badges / Metrics */}
                        <div className="grid grid-cols-2 gap-2 my-3">
                          <div className={`p-2.5 rounded-xl border text-center ${
                            isDarkMode 
                              ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' 
                              : 'bg-amber-500/10 border-amber-300 text-amber-900'
                          }`}>
                            <span className={`text-[10px] block font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
                              Game Discount
                            </span>
                            <span className={`text-base font-black font-mono mt-0.5 block ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                              {plan.gameDiscountPercent}% OFF
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-xl border text-center ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            <span className={`text-[10px] block font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Members</span>
                            <span className={`text-base font-black font-mono flex items-center justify-center gap-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              <Users className="w-3.5 h-3.5" />
                              {memberCount}
                            </span>
                          </div>
                        </div>

                        {plan.description && (
                          <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {plan.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] ${
                        isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-100 text-slate-500'
                      }`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Valid for {plan.durationDays} Days
                        </span>
                        {plan.barDiscountPercent ? (
                          <span className={`font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            +{plan.barDiscountPercent}% Cafe Off
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 sm:px-6 py-3 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Discounts are computed automatically on per-player checkout</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
