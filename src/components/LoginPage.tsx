import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight,
  LogOut,
  X
} from 'lucide-react';
import { JustClubLogo } from './JustClubLogo';
import { AuthUser } from '../types';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser | null;
  onGoogleLogin: (credential: string) => void;
  onLogout: () => void;
  onNavigateToPos: () => void;
  isDarkMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  isOpen,
  onClose,
  authUser,
  onGoogleLogin,
  onLogout,
  onNavigateToPos,
  isDarkMode = true,
}) => {
  const [error, setError] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1092837461928374-demo.apps.googleusercontent.com';
  const isRealConfigured = googleClientId !== '1092837461928374-demo.apps.googleusercontent.com';

  useEffect(() => {
    if (!isOpen || authUser) return;

    if (window.google?.accounts?.id && isRealConfigured) {
      const timer = setTimeout(() => {
        const container = document.getElementById('google-sso-button');
        if (container) {
          try {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              auto_select: false,
              use_fedcm_for_prompt: false,
              callback: (response: any) => {
                if (response.credential) {
                  onGoogleLogin(response.credential);
                  onClose();
                } else {
                  setError('Google Authentication failed: No credential returned.');
                }
              },
            });

            (window.google.accounts.id as any).renderButton(container, {
              theme: isDarkMode ? 'filled_black' : 'outline',
              size: 'large',
              width: container.offsetWidth || 340,
              type: 'standard',
              shape: 'pill',
              text: 'continue_with',
              logo_alignment: 'left',
            });
          } catch (e) {
            console.error("Google button rendering error", e);
          }
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isOpen, authUser, isDarkMode, googleClientId, isRealConfigured, onGoogleLogin, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Center Auth Card Popup */}
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl scale-100 animate-in zoom-in-95 duration-200 z-10 p-6 sm:p-8 ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-indigo-500/5'
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full border transition cursor-pointer ${
            isDarkMode 
              ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' 
              : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Logo Header */}
        <div className="flex justify-center mb-4 mt-2">
          <JustClubLogo isDarkMode={isDarkMode} size="sm" />
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Sign In to JustClub
          </h1>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Access your Lounge Terminal & POS Dashboard
          </p>
        </div>

        {authUser ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border text-left flex items-center gap-3 ${
              isDarkMode ? 'bg-slate-950 border-emerald-500/40' : 'bg-slate-50 border-emerald-500/30'
            }`}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 font-bold text-xl overflow-hidden shadow-sm">
                {authUser.picture ? (
                  <img src={authUser.picture} alt={authUser.name} className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                ) : (
                  authUser.email.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-extrabold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {authUser.name || authUser.email}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {authUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onNavigateToPos();
                onClose();
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Live POS Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Secure Log Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Google Authentication Section */}
            <div className="space-y-3">
              <label className={`text-[11px] font-black uppercase tracking-wider block text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sign in with Google
              </label>
              {isRealConfigured && window.google?.accounts?.id ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <div id="google-sso-button" className="w-full flex justify-center"></div>
                  <p className="text-[10px] text-slate-500 mt-2 text-center">
                    Click above to authenticate securely with your Google account
                  </p>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-amber-500 font-semibold">
                    Google Sign-In is temporarily unavailable, please try again shortly.
                  </p>
                  <p className={`text-[10px] mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Authentication requires a valid Google Single Sign-On configuration.
                  </p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="text-[10px] text-slate-500 text-center flex flex-col items-center justify-center gap-1 mt-4">
              {isRealConfigured ? (
                <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 font-bold rounded-md text-[8px] uppercase tracking-wider border border-emerald-500/20">
                  🟢 Google Authentication Configured
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 font-bold rounded-md text-[8px] uppercase tracking-wider border border-amber-500/20">
                  ⚠️ Google SSO Not Configured
                </span>
              )}
              <span className="mt-1 opacity-70 text-[9px]">JustClub Security Protocol Enabled</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
