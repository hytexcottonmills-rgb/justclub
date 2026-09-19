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
          className="fixed bottom-16 left-3 right-3 md:right-auto md:left-4 md:bottom-4 z-30 flex items-center gap-2.5 rounded-xl bg-indigo-600 text-white px-3.5 py-2.5 text-xs font-bold shadow-2xl shadow-indigo-950/40 border border-indigo-500/80"
        >
          <WifiOff className="w-4 h-4 animate-pulse text-white" />
          <span>Offline Lounge Mode — Local POS timers & bills active. Will sync to Cloudflare when back online.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
