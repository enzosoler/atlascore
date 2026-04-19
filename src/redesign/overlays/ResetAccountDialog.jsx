import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { Dialog, Button, Input, Badge } from '../ui';

/**
 * ResetAccountDialog — destructive, GitHub/Stripe-style "type RESET to confirm".
 *
 * On confirm: invokes the server-side Edge Function `reset-user-data` (which
 * wipes ~13 tables + storage, resets onboarding, keeps biometrics + account)
 * and sends the user back to /onboarding.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <ResetAccountDialog open={open} onClose={() => setOpen(false)} />
 */
export function ResetAccountDialog({ open, onClose, afterReset }) {
  const navigate = useNavigate();
  const { revalidateSession } = useAuth();
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const wordMatches = word.trim().toUpperCase() === 'RESET';

  const handleConfirm = async () => {
    if (!wordMatches) return;
    setError('');
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('reset-user-data', {
        body: { confirm: true },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      // Refresh local auth state so onboarding_completed flips to false everywhere
      try { await revalidateSession?.(); } catch { /* best effort */ }

      // Close the dialog and send them to onboarding fresh
      setWord('');
      onClose?.();
      afterReset?.();
      navigate(ROUTES.onboarding, { replace: true });
    } catch (e) {
      setError(e?.message || 'Could not reset your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      title="Reset your account"
      description="Start fresh — your account stays, everything you've logged goes."
      footer={
        <div className="flex gap-2">
          <Button intent="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            intent="danger"
            onClick={handleConfirm}
            disabled={!wordMatches || loading}
            loading={loading}
          >
            Reset everything
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-rd-md border border-rd-danger/30 bg-rd-danger-muted p-3">
          <p className="text-[13px] font-semibold text-rd-danger">This will delete</p>
          <ul className="mt-2 space-y-1 text-[13px] text-rd-fg-secondary">
            <li>· All workout logs &amp; plans</li>
            <li>· All food logs &amp; nutrition history</li>
            <li>· All body measurements &amp; progress photos</li>
            <li>· Coach memory &amp; messages</li>
            <li>· Daily check-ins &amp; streaks</li>
          </ul>
        </div>

        <div className="rounded-rd-md border border-rd-border bg-rd-surface-2 p-3">
          <p className="text-[13px] font-semibold text-rd-fg">You'll keep</p>
          <ul className="mt-2 space-y-1 text-[13px] text-rd-fg-secondary">
            <li>· Your account &amp; email</li>
            <li>· Biometrics (sex, age, height, current weight, units)</li>
            <li>· Your Pro subscription <Badge tone="premium" size="xs" className="ml-1">Preserved</Badge></li>
          </ul>
        </div>

        <p className="text-[13px] text-rd-fg-muted">
          Then you'll go through onboarding again to build a fresh plan.
        </p>

        <Input
          label={<>Type <span className="rd-tnum font-semibold text-rd-danger">RESET</span> to confirm</>}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          autoFocus
          size="lg"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="rd-tnum uppercase"
        />
        {error && <p role="alert" className="text-[13px] text-rd-danger">{error}</p>}
      </div>
    </Dialog>
  );
}

export default ResetAccountDialog;
