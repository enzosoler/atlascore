import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18nContext';

export default function CheckinPrompt({ checkin, missingToday, onStart }) {
  const { t } = useI18n();
  const isMissing = typeof missingToday === 'boolean' ? missingToday : !checkin;

  if (!isMissing) return null;

  return (
    <div className="rounded-[24px] border border-[hsl(var(--warn)/0.24)] bg-[linear-gradient(180deg,hsl(var(--warn)/0.08)_0%,hsl(var(--card))_100%)] p-5 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[hsl(var(--warn))] mt-0.5 shrink-0" strokeWidth={2} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--warn))]" strokeWidth={2} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--warn))]">
              Daily reset
            </p>
          </div>
          <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">
            {t('today.checkin.pendingTitle')}
          </p>
          <p className="text-[12px] leading-6 text-[hsl(var(--fg-2))] mt-1">
            {t('today.checkin.pendingDescription')}
          </p>
        </div>
      </div>
      {onStart && (
        <Button
          onClick={onStart}
          className="w-full h-10 rounded-[16px] bg-[hsl(var(--warn))] hover:bg-[hsl(var(--warn)/0.88)] text-white text-[13px] font-semibold"
        >
          {t('today.checkin.checkInNow')}
        </Button>
      )}
    </div>
  );
}
