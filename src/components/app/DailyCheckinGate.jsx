import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight, Droplets, Moon, Smile, Sparkles, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { getDailyCheckin, upsertDailyCheckin } from '@/services/checkinService';
import { getToday } from '@/lib/atlas-theme';
import { toast } from 'sonner';
import { celebrateHeavy, tick, notifyError } from '@/lib/haptics';
import { useT } from '@/lib/i18nContext';

// Gate opens at or after 10:00 local time.
function isPast10am() {
  return new Date().getHours() >= 10;
}

function localDateKey() {
  return getToday();
}

const STEP_KEYS = ['intro', 'recovery', 'state', 'review'];

const DEFAULT_VALS = {
  sleep_hours: 7,
  hydration_liters: 0,
  energy: 3,
  mood: 3,
};

function StepBadge({ index, active, complete }) {
  return (
    <div
      className={[
        'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold',
        active
          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
          : complete
            ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]'
            : 'border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.25)] text-[hsl(var(--fg-3))]',
      ].join(' ')}
    >
      {complete && !active ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> : index + 1}
    </div>
  );
}

function MetricRow({ label, icon: Icon, value, format, min, max, step, onChange }) {
  return (
    <div className="space-y-2.5 rounded-[22px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--card)/0.8)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[hsl(var(--fg-2))]">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
          <span>{label}</span>
        </div>
        <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">{format(value)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

export default function DailyCheckinGate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = localDateKey();
  const t = useT();

  const MOOD_LABELS = ['', t('checkin.moodLabels.veryLow'), t('checkin.moodLabels.low'), t('checkin.moodLabels.neutral'), t('checkin.moodLabels.good'), t('checkin.moodLabels.great')];
  const STEPS = STEP_KEYS.map((key) => ({
    key,
    title: t(`checkin.steps.${key}.title`),
    subtitle: t(`checkin.steps.${key}.subtitle`),
  }));

  // Track whether it's past 10am. Re-evaluate on visibility changes.
  const [past10, setPast10] = useState(isPast10am);
  const [stepIndex, setStepIndex] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setPast10(isPast10am());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const { data: existingCheckin, isLoading } = useQuery({
    queryKey: ['daily-checkin', user?.id, today],
    queryFn: () => getDailyCheckin(user.id, today),
    enabled: !!user?.id && past10,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const [vals, setVals] = useState(DEFAULT_VALS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingCheckin) return;
    setVals({
      sleep_hours: existingCheckin.sleep_hours ?? DEFAULT_VALS.sleep_hours,
      hydration_liters: existingCheckin.hydration_liters ?? DEFAULT_VALS.hydration_liters,
      energy: existingCheckin.energy ?? DEFAULT_VALS.energy,
      mood: existingCheckin.mood ?? DEFAULT_VALS.mood,
    });
    setNotes(existingCheckin.notes || '');
  }, [existingCheckin]);

  const setValue = (key, value) => {
    setVals((prev) => {
      if (stepIndex > 0 && Number.isInteger(value) && prev[key] !== value) tick();
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      await upsertDailyCheckin(user.id, {
        date: today,
        ...vals,
        notes: notes.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: ['daily-checkin', user.id] });
      queryClient.invalidateQueries({ queryKey: ['daily-checkins', user.id] });
      celebrateHeavy();
      toast.success(t('checkin.toastSaved'));
    } catch (err) {
      notifyError();
      toast.error(t('checkin.toastError'));
      console.error('[DailyCheckinGate]', err);
    } finally {
      setSaving(false);
    }
  };

  const step = STEPS[stepIndex];
  const shouldShow = past10 && !!user?.id && !isLoading && !existingCheckin;

  const progressLabel = useMemo(() => `${stepIndex + 1} of ${STEPS.length}`, [stepIndex]);

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-[30px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card))] shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:rounded-[30px]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="border-b border-[hsl(var(--border)/0.5)] px-6 pb-4 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">
                {t('checkin.eyebrow')}
              </p>
            </div>
            <div className="rounded-full border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.42)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
              {progressLabel}
            </div>
          </div>

          <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {step.title}
          </h2>
          <p className="mt-1.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {step.subtitle}
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((item, index) => (
              <div key={item.key} className="flex items-center gap-2">
                <StepBadge index={index} active={index === stepIndex} complete={index < stepIndex} />
                <span className="whitespace-nowrap text-[11px] font-medium text-[hsl(var(--fg-3))]">
                  {item.title}
                </span>
                {index < STEPS.length - 1 ? <span className="mx-1 h-px w-6 bg-[hsl(var(--border)/0.6)]" /> : null}
              </div>
            ))}
          </div>

          {stepIndex === 0 && (
            <div className="space-y-4 rounded-[24px] border border-[hsl(var(--border)/0.75)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.28)_0%,hsl(var(--card))_100%)] px-4 py-4">
              <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                {t('checkin.introBody')}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { icon: Moon, label: t('checkin.labels.sleep') },
                  { icon: Droplets, label: t('checkin.labels.hydration') },
                  { icon: Zap, label: t('checkin.labels.energy') },
                  { icon: Smile, label: t('checkin.labels.mood') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-[16px] border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--card)/0.76)] px-3 py-2.5">
                    <item.icon className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={1.9} />
                    <span className="text-[12px] font-medium text-[hsl(var(--fg-2))]">{item.label}</span>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => setStepIndex(1)}
                className="h-11 w-full rounded-[16px] bg-[hsl(var(--primary))] text-[14px] font-semibold text-white hover:bg-[hsl(var(--primary)/0.9)]"
              >
                {t('checkin.startBtn')}
                <ChevronRight className="ml-1.5 h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="space-y-3.5">
              <MetricRow
                label={t('checkin.labels.sleep')}
                icon={Moon}
                value={vals.sleep_hours}
                format={(v) => `${Number(v).toFixed(1)}h`}
                min={3}
                max={12}
                step={0.5}
                onChange={(value) => setValue('sleep_hours', value)}
              />
              <MetricRow
                label={t('checkin.labels.hydration')}
                icon={Droplets}
                value={vals.hydration_liters}
                format={(v) => `${Number(v).toFixed(1)}L`}
                min={0}
                max={5}
                step={0.25}
                onChange={(value) => setValue('hydration_liters', value)}
              />
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-3.5">
              <MetricRow
                label={t('checkin.labels.energy')}
                icon={Zap}
                value={vals.energy}
                format={(v) => `${v}/5`}
                min={1}
                max={5}
                step={1}
                onChange={(value) => setValue('energy', value)}
              />
              <MetricRow
                label={t('checkin.labels.mood')}
                icon={Smile}
                value={vals.mood}
                format={(v) => MOOD_LABELS[v] || `${v}/5`}
                min={1}
                max={5}
                step={1}
                onChange={(value) => setValue('mood', value)}
              />
            </div>
          )}

          {stepIndex === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{t('checkin.labels.sleep')}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{Number(vals.sleep_hours).toFixed(1)}h</p>
                </div>
                <div className="rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{t('checkin.labels.hydration')}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{Number(vals.hydration_liters).toFixed(1)}L</p>
                </div>
                <div className="rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{t('checkin.labels.energy')}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{vals.energy}/5</p>
                </div>
                <div className="rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{t('checkin.labels.mood')}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{MOOD_LABELS[vals.mood] || `${vals.mood}/5`}</p>
                </div>
              </div>

              <label className="block rounded-[24px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--card)/0.85)] px-4 py-4">
                <span className="text-[13px] font-medium text-[hsl(var(--fg-2))]">{t('checkin.optionalNote')}</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('checkin.notePlaceholder')}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-[16px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.28)] px-3 py-3 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand))] focus:outline-none"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[hsl(var(--border)/0.7)] px-6 py-4">
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--fg-3))] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            {t('checkin.back')}
          </button>

          {stepIndex < 3 ? (
            <Button
              type="button"
              onClick={() => setStepIndex((prev) => Math.min(3, prev + 1))}
              className="h-11 rounded-[16px] bg-[hsl(var(--primary))] px-5 text-[14px] font-semibold text-white hover:bg-[hsl(var(--primary)/0.9)]"
            >
              {t('checkin.next')}
              <ChevronRight className="ml-1.5 h-4 w-4" strokeWidth={2} />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-11 rounded-[16px] bg-[hsl(var(--primary))] px-5 text-[14px] font-semibold text-white hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-60"
            >
              {saving ? t('checkin.saving') : t('checkin.saveBtn')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
