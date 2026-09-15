import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft,
  Key,
  Mail,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { JustClubLogo } from './JustClubLogo';
import { AuthUser } from '../types';

interface LoginPageProps {
  authUser: AuthUser | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
  onNavigateToPos: () => void;
  onNavigateToLanding: () => void;
  isDarkMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  authUser,
  onLogin,
  onLogout,
  onNavigateToPos,
  onNavigateToLanding,
  isDarkMode = true,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-12 ${
      isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Top Bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </button>

        <JustClubLogo isDarkMode={isDarkMode} size="sm" />
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${
          isDarkMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-indigo-500/5'
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Sign In to justclub</h1>
            <p className="text-xs text-slate-400 mt-1">Admin Portal Access</p>
          </div>

          {authUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-left flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 font-bold text-xl">
                  {authUser.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white truncate">
                    {authUser.email}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {authUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToPos}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Enter Live POS Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Secure Log Out</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-500" />
                  </div>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Secure Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-slate-500">
        justclub Operating System V2 • Secured by Cloudflare D1
      </div>
    </div>
  );
};
