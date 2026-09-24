import React, { useState } from 'react';
import { GameSession } from '../types';
import { calculateSessionMetrics } from '../utils/billing';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  Clock, 
  Coffee, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { motion } from 'motion/react';

interface CancelSessionModalProps {
  isOpen: boolean;
  session: GameSession | null;
  onClose: () => void;
  onConfirmCancel: (sessionId: string, restoreStock: boolean, cancelReason?: string) => void;
  isDarkMode?: boolean;
}

export const CancelSessionModal: React.FC<CancelSessionModalProps> = ({
  isOpen,
  session,
  onClose,
  onConfirmCancel,
  isDarkMode = true,
}) => {
  if (!isOpen || !session) return null;

  const metrics = calculateSessionMetrics(session);
  const barOrdersCount = session.attachedBarOrders?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  
  // Return stock checkbox state (defaults to true)
  const [restoreStock, setRestoreStock] = useState<boolean>(true);
  const [selectedReason, setSelectedReason] = useState<string>('Started by mistake');

  const reasons = [
    'Started by mistake',
    'Customer cancelled',
    'Table defect / Cue issue',
    'Switched to another table',
    'Other reason'
  ];

  const handleConfirm = () => {
    onConfirmCancel(session.id, restoreStock, selectedReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Warning Banner Header */}
        <div className={`p-4 sm:p-5 border-b flex items-start justify-between ${
          isDarkMode ? 'bg-rose-950/30 border-slate-800' : 'bg-rose-50 border-rose-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Cancel Active Session?
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Station: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{session.assetName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Summary Box */}
          <div className={`p-3.5 rounded-xl border space-y-2 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Elapsed Duration:
              </span>
              <span className="font-mono font-bold">{metrics.formattedDuration}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Accumulated Meter:
              </span>
              <span className={`font-mono font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                ₹{metrics.totalCost} (will be discarded)
              </span>
            </div>

            {session.taggedPlayers.length > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Tagged Players:</span>
                <span className="font-semibold">{session.taggedPlayers.map(p => p.name).join(', ')}</span>
              </div>
            )}
          </div>

          {/* Bar inventory return option */}
          {session.attachedBarOrders && session.attachedBarOrders.length > 0 && (
            <div className={`p-3.5 rounded-xl border transition ${
              isDarkMode ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreStock}
                  onChange={(e) => setRestoreStock(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <span className={`font-bold block ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                    Return {barOrdersCount} Attached Bar Item(s) to Stock
                  </span>
                  <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-amber-300/80' : 'text-amber-700'}`}>
                    Items: {session.attachedBarOrders.map(o => `${o.quantity}x ${o.name}`).join(', ')}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Cancellation Reason Selector */}
          <div className="space-y-1.5">
            <label className={`font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Reason for Cancellation (Audit Log)
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-white' 
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {reasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-slate-900 bg-slate-200'
            }`}
          >
            Keep Session
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Cancel & Free Table
          </button>
        </div>

      </motion.div>
    </div>
  );
};
