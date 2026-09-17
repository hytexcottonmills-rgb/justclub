import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AuthUser } from '../types';

interface SuperAdminGuardProps {
  authUser: AuthUser | null;
  onUnauthorized: () => void;
  children: React.ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  authUser,
  onUnauthorized,
  children
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkToken() {
      if (!authUser || authUser.role !== 'superadmin') {
        if (active) {
          setIsValidating(false);
          setIsVerified(false);
          onUnauthorized();
        }
        return;
      }

      try {
        setIsValidating(true);
        const res = await api.auth.verify();
        if (active) {
          if (res && res.success && res.user && res.user.role === 'superadmin') {
            setIsVerified(true);
          } else {
            setIsVerified(false);
            onUnauthorized();
          }
        }
      } catch (err) {
        if (active) {
          setIsVerified(false);
          onUnauthorized();
        }
      } finally {
        if (active) {
          setIsValidating(false);
        }
      }
    }

    checkToken();
    return () => {
      active = false;
    };
  }, [authUser, onUnauthorized]);

  if (isValidating) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Verifying Super Admin Credentials...</p>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
};
