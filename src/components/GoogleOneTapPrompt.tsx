import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { X, ShieldCheck } from 'lucide-react';

interface GoogleOneTapPromptProps {
  authUser: AuthUser | null;
  onGoogleLogin: (credential: string) => void;
  isDarkMode?: boolean;
}

export const GoogleOneTapPrompt: React.FC<GoogleOneTapPromptProps> = ({
  authUser,
  onGoogleLogin,
  isDarkMode = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isRealConfigured = !!googleClientId && googleClientId !== '1092837461928374-demo.apps.googleusercontent.com';

  useEffect(() => {
    if (!isRealConfigured || authUser) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          auto_select: false,
          use_fedcm_for_prompt: false,
          callback: (response: any) => {
            if (response.credential) {
              onGoogleLogin(response.credential);
              setIsVisible(false);
            }
          },
        });

        // Trigger Google One Tap UI prompt automatically on mount
        window.google.accounts.id.prompt();
      } catch (e) {
        console.error("Failed to initialize Google One Tap", e);
      }
    }
  }, [authUser, onGoogleLogin, googleClientId, isRealConfigured]);

  if (authUser || !isVisible || !isRealConfigured) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
        isDarkMode
          ? 'bg-slate-900/95 border-indigo-500/40 text-slate-100 shadow-indigo-500/10'
          : 'bg-white/95 border-indigo-200 text-slate-800 shadow-slate-300/50'
      }`}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-700/50 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-bold tracking-tight">Sign in with Google</span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-2">
          One Tap Sign-in is available. Tap above or use the Login popup to securely access your registered club.
        </p>

        <div className="mt-2 text-[10px] text-slate-500 text-center flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1 justify-center">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Secured by Google One Tap SSO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Global types declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (cb?: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
