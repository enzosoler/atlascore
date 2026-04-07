import React, { useState, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { track } from '@/lib/analytics';
import { ROUTES } from '@/lib/routes';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthGateContext = createContext(null);

export function AuthGateProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState('');

  const showGate = useCallback((actionReason = '') => {
    setReason(actionReason);
    setVisible(true);
    track('auth_gate_shown', { reason: actionReason, source: 'action' });
  }, []);

  const hideGate = useCallback(() => {
    setVisible(false);
    setReason('');
  }, []);

  return (
    <AuthGateContext.Provider value={{ showGate, hideGate }}>
      {children}
      <AuthGateModal visible={visible} reason={reason} onClose={hideGate} />
    </AuthGateContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
/**
 * Returns a guard function. Call `guard()` before a protected action.
 * Returns `true` if the user is authenticated and can proceed.
 * Returns `false` and shows the auth modal if not authenticated.
 *
 * Usage:
 *   const guard = useAuthGate();
 *   const handleSave = () => {
 *     if (!guard('save_workout')) return;
 *     // ... do the save
 *   };
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuth();
  const ctx = useContext(AuthGateContext);

  return useCallback(
    (reason = '') => {
      if (isAuthenticated) return true;
      track('protected_action_attempted', { action: reason });
      ctx?.showGate(reason);
      return false;
    },
    [isAuthenticated, ctx],
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function AuthGateModal({ visible, reason, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const goAuth = (mode) => {
    onClose();
    track(`${mode}_started`, { source: 'auth_gate', reason });
    navigate(`${ROUTES.auth}?mode=${mode}&next=${encodeURIComponent(window.location.pathname)}`);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50"
          />
          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 z-[101] rounded-t-[24px] bg-[hsl(var(--card))] shadow-[var(--shadow-lg)]"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
          >
            <div className="mx-auto max-w-lg px-6 pt-6 pb-4">
              {/* Handle */}
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[hsl(var(--fg-3)/0.25)]" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg))]"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[hsl(var(--accent-primary)/0.1)]">
                  <Lock className="h-6 w-6 text-[hsl(var(--accent-primary))]" />
                </div>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  {t('authGate.title')}
                </h2>
                <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
                  {t('authGate.subtitle')}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => goAuth('signup')}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--accent-primary))] text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
                >
                  {t('demo.createAccount')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => goAuth('login')}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.3)] text-[14px] font-medium text-[hsl(var(--fg-2))] transition-all hover:text-[hsl(var(--fg))] active:scale-[0.98]"
                >
                  {t('demo.signIn')}
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full py-2 text-center text-[13px] text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
              >
                {t('authGate.continueAs')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default useAuthGate;
