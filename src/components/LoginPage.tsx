import React from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Building2, 
  UserCheck, 
  ArrowLeft,
  Key
} from 'lucide-react';
import { AuthUser } from '../types';
import { JustClubLogo } from './JustClubLogo';

interface LoginPageProps {
  authUser: AuthUser | null;
  onGoogleLogin: (user: Partial<AuthUser>) => void;
  onLogout: () => void;
  onNavigateToPos: () => void;
  onNavigateToLanding: () => void;
  isDarkMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  authUser,
  onGoogleLogin,
  onLogout,
  onNavigateToPos,
  onNavigateToLanding,
  isDarkMode = true,
}) => {
  // Demo Users for instant testing
  const demoAccounts: Partial<AuthUser>[] = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'club_owner',
      loginProvider: 'google_one_tap',
    },
    {
      name: 'Vikram Malhotra',
      email: 'vikram.pos@imperialclub.in',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'club_manager',
      loginProvider: 'google_oauth',
    },
    {
      name: 'Super Admin Portal',
      email: 'admin@justclub.os',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'superadmin',
      loginProvider: 'demo',
    },
  ];

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
          
          {/* Header Icon */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Sign In to justclub</h1>
            <p className="text-xs text-slate-400 mt-1">Single Sign-On for Gaming Club Admins & Staff</p>
          </div>

          {/* ACTIVE LOGGED IN STATE */}
          {authUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-left flex items-center gap-3">
                <img src={authUser.picture} alt={authUser.name} className="w-12 h-12 rounded-full ring-2 ring-emerald-500 object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                    {authUser.name}
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-xs text-slate-400 truncate">{authUser.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {authUser.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Via Google One-Tap</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToPos}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Enter Live POS Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Google Account</span>
              </button>
            </div>
          ) : (
            /* LOGGED OUT SIGN IN OPTIONS */
            <div className="space-y-5">
              
              {/* Primary Google One-Tap SSO Button */}
              <button
                onClick={() => onGoogleLogin(demoAccounts[0])}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google One Tap</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-slate-500">
                  <span className="bg-slate-900 px-3">Instant Demo Sign In</span>
                </div>
              </div>

              {/* Quick Demo Role Cards */}
              <div className="space-y-2">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    onClick={() => onGoogleLogin(acc)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 transition text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={acc.picture} alt={acc.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                      </div>
                    </div>

                    <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      {acc.role?.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google SSO & One Tap Auth Active</span>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-slate-500">
        justclub Operating System V2 • Secured with Google Identity Services
      </div>
    </div>
  );
};
