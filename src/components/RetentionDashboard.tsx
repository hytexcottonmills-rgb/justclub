import React, { useState } from 'react';
import { CustomerPlayer } from '../types';
import { generateWhatsAppOfferLink } from '../utils/billing';
import { 
  Users, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Crown, 
  Clock, 
  TrendingUp, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  UserMinus,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';

interface RetentionDashboardProps {
  customers: CustomerPlayer[];
  clubName: string;
  isDarkMode?: boolean;
}

export const RetentionDashboard: React.FC<RetentionDashboardProps> = ({
  customers,
  clubName,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'at_risk' | 'churned' | 'active'>('at_risk');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByLtv, setSortByLtv] = useState(true);

  // Compute Days Since Last Visit helper
  const getDaysAgo = (dateStr: string) => {
    const past = new Date(dateStr).getTime();
    const now = new Date('2026-09-14').getTime(); // Using environment simulated date
    const diff = Math.max(0, now - past);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const processedCustomers = customers.map(c => {
    const daysAgo = getDaysAgo(c.lastVisitedDate);
    let churnStatus: 'active' | 'at_risk' | 'churned' = 'active';
    if (daysAgo >= 31 && daysAgo <= 60) {
      churnStatus = 'at_risk';
    } else if (daysAgo > 60) {
      churnStatus = 'churned';
    }

    return {
      ...c,
      daysAgo,
      computedStatus: churnStatus,
    };
  });

  const activeCount = processedCustomers.filter(c => c.computedStatus === 'active').length;
  const atRiskCount = processedCustomers.filter(c => c.computedStatus === 'at_risk').length;
  const churnedCount = processedCustomers.filter(c => c.computedStatus === 'churned').length;
  const totalVipLtv = processedCustomers.reduce((acc, c) => acc + c.lifetimeValue, 0);

  const filteredList = processedCustomers
    .filter(c => {
      if (activeTab !== 'all' && c.computedStatus !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.whatsapp.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortByLtv) {
        return b.lifetimeValue - a.lifetimeValue; // Highest LTV first
      }
      return b.daysAgo - a.daysAgo; // Longest absent first
    });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Users className="w-5 h-5 text-indigo-500" /> Customer Retention & Churn Analytics
          </h1>
          <p className={`text-xs mt-0.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Identify inactive regulars (31-60d) and trigger automated WhatsApp promo offers or win-back campaigns.
          </p>
        </div>

        {/* LTV Sort Toggle Button */}
        <button
          onClick={() => setSortByLtv(!sortByLtv)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            sortByLtv
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs'
              : isDarkMode
                ? 'bg-slate-900 text-slate-400 border border-slate-800'
                : 'bg-white text-slate-600 border border-slate-200 shadow-xs'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" />
          <span>Sort by Lifetime Value (LTV): {sortByLtv ? 'High → Low' : 'Off'}</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Active Segment */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className={`font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Regulars</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-extrabold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeCount}</div>
          <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Visited &lt; 30 days ago</span>
        </div>

        {/* At-Risk Segment */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode
            ? 'bg-slate-900 border-amber-500/30 bg-amber-500/5'
            : 'bg-amber-50/50 border-amber-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-amber-500">
            <span className="font-semibold uppercase tracking-wider">At-Risk Tier</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-300 mt-1">{atRiskCount}</div>
          <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Visited 31-60 days ago</span>
        </div>

        {/* Churned Segment */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode
            ? 'bg-slate-900 border-red-500/30 bg-red-500/5'
            : 'bg-red-50/50 border-red-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-red-500">
            <span className="font-semibold uppercase tracking-wider">Churned</span>
            <UserMinus className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{churnedCount}</div>
          <span className="text-[11px] text-red-600/80 dark:text-red-400/80 font-medium">Visited &gt; 60 days ago</span>
        </div>

        {/* Total LTV */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className={`font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Customer LTV</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalVipLtv.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Tracked Club Regulars</span>
        </div>

      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('at_risk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'at_risk'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                : isDarkMode
                  ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            At-Risk ({atRiskCount}) - Requires Action
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : isDarkMode
                  ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Customers ({processedCustomers.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white shadow-md'
                : isDarkMode
                  ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('churned')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'churned'
                ? 'bg-red-600 text-white shadow-md'
                : isDarkMode
                  ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Churned ({churnedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search customer name or phone..."
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

      {/* Customer Retention Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="p-4">Customer</th>
                <th className="p-4">Retention Status</th>
                <th className="p-4">Last Visit</th>
                <th className="p-4">Lifetime Value (LTV)</th>
                <th className="p-4 text-right">Actionable WhatsApp Workflow</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${
              isDarkMode ? 'divide-slate-800/80' : 'divide-slate-200'
            }`}>
              {filteredList.map(cust => {
                const isAtRisk = cust.computedStatus === 'at_risk';
                const isChurned = cust.computedStatus === 'churned';

                const defaultOfferMsg = isAtRisk
                  ? 'We have a special 20% discount on your next Snooker/PS5 hour!'
                  : 'Win-back Special: 1 Hour Free Snooker on your next visit!';

                const promoUrl = generateWhatsAppOfferLink(
                  cust.name,
                  cust.whatsapp,
                  clubName,
                  defaultOfferMsg
                );

                return (
                  <tr key={cust.id} className={isDarkMode ? 'hover:bg-slate-800/40 transition' : 'hover:bg-slate-50 transition'}>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cust.name}</span>
                        {cust.lifetimeValue > 15000 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" /> VIP
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>+{cust.whatsapp}</span>
                    </td>

                    <td className="p-4">
                      {isAtRisk ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> At-Risk ({cust.daysAgo} days ago)
                        </span>
                      ) : isChurned ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                          <UserMinus className="w-3.5 h-3.5" /> Churned ({cust.daysAgo} days ago)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Regular
                        </span>
                      )}
                    </td>

                    <td className={`p-4 font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {cust.lastVisitedDate} ({cust.daysAgo}d ago)
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{cust.lifetimeValue.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-right">
                      <a
                        href={promoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs ${
                          isAtRisk
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : isChurned
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {isAtRisk ? 'Send 20% Off Promo' : isChurned ? 'Trigger Win-Back Campaign' : 'Send Greeting'}
                      </a>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
