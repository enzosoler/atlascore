import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { applyCreatorCode } from '@/lib/affiliate/applyCreatorCode';
import MobileSheet from '@/components/shared/MobileSheet';
import { Button } from '@/components/ui/button';

/**
 * CreatorCodeModal — bottom sheet where users enter / apply a creator code.
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
    // Reset state after close animation
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
      <MobileSheet.Body className="space-y-4">
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.1)]">
              <Check className="h-6 w-6 text-[hsl(var(--ok))]" strokeWidth={2.5} />
            </div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
              {t('affiliate.applied')}
            </p>
            <p className="text-[13px] text-[hsl(var(--fg-2))]">
              {t('affiliate.creator')}: {success.creator}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                placeholder={t('affiliate.codePlaceholder')}
                autoFocus
                className="h-11 w-full rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-4 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand)/0.3)]"
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
            className="h-11 w-full rounded-xl"
          >
            {t('common.close') || 'Close'}
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="h-11 w-full rounded-xl bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)] border-0 shadow-[0_4px_14px_hsl(var(--brand)/0.25)]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('affiliate.applying')}
              </span>
            ) : (
              t('affiliate.apply')
            )}
          </Button>
        )}
      </MobileSheet.Footer>
    </MobileSheet>
  );
}
