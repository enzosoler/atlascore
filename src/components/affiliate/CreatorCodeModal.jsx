import { useState } from 'react';
import { Check, Loader2, Tag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { applyCreatorCode } from '@/lib/affiliate/applyCreatorCode';
import MobileSheet from '@/components/shared/MobileSheet';
import { Button } from '@/components/ui/button';

/**
 * CreatorCodeModal -- bottom sheet where users enter / apply a creator code.
 *
 * Cameo-inspired: prominent code input, clear feedback, minimal friction.
 */
export default function CreatorCodeModal({ open, onOpenChange, onApplied }) {
  const { user } = useAuth();
  const { t } = useI18n();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);   // { code, creator }
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim() || !user?.id) return;
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const result = await applyCreatorCode(user.id, code.trim());
      setSuccess({ code: result.code, creator: result.creator });
      onApplied?.({ code: result.code, creator: result.creator });
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('locked') || msg === 'affiliate.creatorLocked') {
        setError(t('affiliate.creatorLocked'));
      } else {
        setError(t('affiliate.invalidCode'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCode('');
      setError('');
      setSuccess(null);
      setLoading(false);
    }, 300);
  };

  return (
    <MobileSheet
      open={open}
      onOpenChange={handleClose}
      title={t('affiliate.enterCode')}
    >
      <MobileSheet.Body className="space-y-5">
        {success ? (
          /* ── Success state ───────────────────────────────────────── */
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.1)]">
              <Check className="h-7 w-7 text-[hsl(var(--ok))]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[hsl(var(--fg))]">
                {t('affiliate.applied')}
              </p>
              <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                {t('affiliate.creator')}: <span className="font-semibold text-[hsl(var(--fg))]">{success.creator}</span>
              </p>
            </div>

            {/* Applied code display */}
            <div className="rounded-xl border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.05)] px-6 py-3">
              <p className="text-lg font-bold tracking-wide text-[hsl(var(--ok))]">
                {success.code}
              </p>
            </div>
          </div>
        ) : (
          /* ── Input state ─────────────────────────────────────────── */
          <>
            {/* Explanation */}
            <div className="flex items-start gap-3 rounded-xl bg-[hsl(var(--shell)/0.5)] p-3.5">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand))]" />
              <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
                Enter a creator or partner code to link your account. This helps support the creator who referred you.
              </p>
            </div>

            {/* Code input */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                Creator Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder={t('affiliate.codePlaceholder')}
                autoFocus
                className="h-12 w-full rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-4 text-center text-[18px] font-bold tracking-widest text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] placeholder:font-normal placeholder:tracking-normal placeholder:text-[14px] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.2)]"
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              />
              {error && (
                <p className="text-[12px] font-medium text-[hsl(var(--err))]">{error}</p>
              )}
            </div>
          </>
        )}
      </MobileSheet.Body>

      <MobileSheet.Footer>
        {success ? (
          <Button
            onClick={handleClose}
            className="h-12 w-full rounded-xl text-[15px] font-semibold"
          >
            {t('common.close') || 'Done'}
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="h-12 w-full rounded-xl bg-[hsl(var(--brand))] text-[15px] font-semibold text-white hover:bg-[hsl(var(--brand)/0.9)] border-0 shadow-[0_4px_14px_hsl(var(--brand)/0.25)] disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('affiliate.applying')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t('affiliate.apply')}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        )}
      </MobileSheet.Footer>
    </MobileSheet>
  );
}
