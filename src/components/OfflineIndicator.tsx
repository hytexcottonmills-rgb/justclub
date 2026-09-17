import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-2xl shadow-amber-900/40 border border-amber-400"
        >
          <WifiOff className="w-4 h-4 animate-pulse text-slate-950" />
          <span>Offline Lounge Mode — Local POS timers & bills active. Will sync to Cloudflare when back online.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
