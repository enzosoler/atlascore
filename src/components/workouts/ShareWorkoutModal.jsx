/**
 * ShareWorkoutModal — Dialog for sharing a workout plan or single day.
 *
 * Props:
 *   open        — boolean controlling visibility
 *   onClose     — callback to close
 *   plan        — the workout plan object (from workout_plans table)
 */
import React, { useState } from 'react';
import { useT } from '@/lib/i18nContext';
import { createWorkoutShare } from '@/services/shareWorkoutService';
import { Share2, Copy, Check, Link2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareWorkoutModal({ open, onClose, plan }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState(null); // 'plan' | 'day'
  const [selectedDay, setSelectedDay] = useState(0);

  if (!open || !plan) return null;

  const days = Array.isArray(plan.days) ? plan.days : [];

  const handleShare = async (type, dayIndex) => {
    setLoading(true);
    setShareUrl(null);
    try {
      const result = await createWorkoutShare(type, plan.id, dayIndex);
      setShareUrl(result.url);
      setMode(type);
    } catch (err) {
      console.error('[ShareWorkoutModal] Error:', err);
      toast.error(t('shareWorkout.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('shareWorkout.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('shareWorkout.copy_failed'));
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: plan.name || t('shareWorkout.share_title'),
        text: t('shareWorkout.share_text'),
        url: shareUrl,
      });
    } catch {
      // User cancelled or share failed — ignore
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setMode(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-[16px] font-semibold text-[hsl(var(--fg))]">
              {t('shareWorkout.title')}
            </h2>
          </div>
          <p className="t-caption">{t('shareWorkout.subtitle')}</p>
        </div>

        {/* If no URL generated yet, show share options */}
        {!shareUrl && !loading && (
          <div className="space-y-3">
            {/* Share entire plan */}
            <button
              onClick={() => handleShare('plan')}
              className="w-full flex items-center gap-3 rounded-xl border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-4 text-left transition-colors hover:bg-[hsl(var(--shell))]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                <Share2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                  {t('shareWorkout.share_plan')}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {t('shareWorkout.share_plan_desc')}
                </p>
              </div>
            </button>

            {/* Share single day */}
            {days.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wide px-1">
                  {t('shareWorkout.share_day')}
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {days.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => handleShare('day', i)}
                      className="w-full flex items-center justify-between rounded-xl border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--shell))]"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                          {day.name || `Day ${i + 1}`}
                        </p>
                        {day.focus && (
                          <p className="text-[11px] text-[hsl(var(--fg-2))]">{day.focus}</p>
                        )}
                      </div>
                      <span className="t-caption">
                        {(day.exercises || []).length} {t('shareWorkout.exercises')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-[hsl(var(--fg-2))]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-[13px]">{t('shareWorkout.generating')}</span>
          </div>
        )}

        {/* Share URL result */}
        {shareUrl && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--shell))] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-[12px] font-semibold text-[hsl(var(--fg-2))]">
                  {mode === 'plan' ? t('shareWorkout.plan_link') : t('shareWorkout.day_link')}
                </span>
              </div>
              <p className="text-[12px] text-[hsl(var(--fg))] break-all font-mono bg-[hsl(var(--fill)/0.54)] rounded-lg p-2">
                {shareUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t('shareWorkout.copied_btn') : t('shareWorkout.copy_link')}
              </button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] px-4 py-2.5 text-[13px] font-semibold text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--shell))]"
                >
                  <Share2 className="h-4 w-4" />
                  {t('shareWorkout.share_btn')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
