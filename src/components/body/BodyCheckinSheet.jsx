import React, { useState, useCallback, useEffect } from 'react';
import { Moon, Zap, Heart, Loader2, Check } from 'lucide-react';
import MobileSheet from '@/components/shared/MobileSheet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useT } from '@/lib/i18nContext';
import { DAILY_KEYS } from '@/hooks/useDailyStateV2';
import { cn } from '@/lib/utils';

/**
 * BodyCheckinSheet — Stoic/Finch-style guided stepper.
 *
 * Guided flow: one question per step with progress dots,
 * calm completion state, autosave per step.
 *
 * Steps:
 *  0 — Mood / Recovery (1-5)
 *  1 — Energy level (1-5)
 *  2 — Sleep quality (hours)
 *  3 — Completion
 */

const STEPS = [
  { key: 'mood', field: 'mood' },
  { key: 'energy', field: 'energy' },
  { key: 'sleep', field: 'sleep_hours' },
];

const TOTAL_STEPS = STEPS.length;

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Progress Dots ─────────────────────────────────────────────────────────────

function ProgressDots({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === current
              ? 'w-6 bg-[hsl(var(--brand))]'
              : i < current
                ? 'w-2 bg-[hsl(var(--brand)/0.4)]'
                : 'w-2 bg-[hsl(var(--border))]'
          )}
        />
      ))}
    </div>
  );
}

// ── Mood Step ─────────────────────────────────────────────────────────────────

function MoodStep({ value, onChange, t }) {
  const options = [
    { val: 1, emoji: '\u{1F614}', label: t('body.checkin.scale.wrecked') },
    { val: 2, emoji: '\u{1F615}', label: t('body.checkin.scale.sore') },
    { val: 3, emoji: '\u{1F610}', label: t('body.checkin.scale.okay') },
    { val: 4, emoji: '\u{1F642}', label: t('body.checkin.scale.good') },
    { val: 5, emoji: '\u{1F60A}', label: t('body.checkin.scale.fresh') },
  ];

  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand)/0.08)] flex items-center justify-center mb-4">
        <Heart className="w-6 h-6 text-[hsl(var(--brand))]" strokeWidth={1.8} />
      </div>
      <h3 className="text-[18px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
        How are you feeling?
      </h3>
      <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1.5 leading-5">
        Overall recovery and mood right now
      </p>

      <div className="flex gap-2 mt-8 w-full">
        {options.map((o) => (
          <button
            key={o.val}
            onClick={() => onChange(o.val)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border transition-all duration-200',
              value === o.val
                ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] scale-[1.04] shadow-sm'
                : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] active:scale-[0.97]'
            )}
          >
            <span className="text-[22px] leading-none">{o.emoji}</span>
            <span className={cn(
              'text-[10px] font-semibold',
              value === o.val ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'
            )}>
              {o.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Energy Step ───────────────────────────────────────────────────────────────

function EnergyStep({ value, onChange, t }) {
  const options = [
    { val: 1, label: t('body.checkin.scale.drained') },
    { val: 2, label: t('body.checkin.scale.low') },
    { val: 3, label: t('body.checkin.scale.moderate') },
    { val: 4, label: t('body.checkin.scale.good') },
    { val: 5, label: t('body.checkin.scale.peak') },
  ];

  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--warn)/0.08)] flex items-center justify-center mb-4">
        <Zap className="w-6 h-6 text-[hsl(var(--warn))]" strokeWidth={1.8} />
      </div>
      <h3 className="text-[18px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
        Energy level
      </h3>
      <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1.5 leading-5">
        How much battery do you have today?
      </p>

      <div className="flex flex-col gap-2 mt-8 w-full">
        {options.map((o) => (
          <button
            key={o.val}
            onClick={() => onChange(o.val)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200',
              value === o.val
                ? 'border-[hsl(var(--warn)/0.4)] bg-[hsl(var(--warn)/0.06)]'
                : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.2)] active:scale-[0.98]'
            )}
          >
            {/* Energy bar visualization */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2.5 h-4 rounded-sm transition-colors',
                    i < o.val
                      ? value === o.val ? 'bg-[hsl(var(--warn))]' : 'bg-[hsl(var(--warn)/0.3)]'
                      : 'bg-[hsl(var(--border)/0.3)]'
                  )}
                />
              ))}
            </div>
            <span className={cn(
              'text-[13px] font-medium',
              value === o.val ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-2))]'
            )}>
              {o.label}
            </span>
            {value === o.val && (
              <Check className="w-4 h-4 text-[hsl(var(--warn))] ml-auto" strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Sleep Step ─────────────────────────────────────────────────────────────────

function SleepStep({ value, onChange, t }) {
  const hours = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-ai)/0.08)] flex items-center justify-center mb-4">
        <Moon className="w-6 h-6 text-[hsl(var(--brand-ai))]" strokeWidth={1.8} />
      </div>
      <h3 className="text-[18px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
        How did you sleep?
      </h3>
      <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1.5 leading-5">
        Hours of sleep last night
      </p>

      <div className="grid grid-cols-4 gap-2 mt-8 w-full">
        {hours.map((h) => (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={cn(
              'h-12 rounded-xl border text-[14px] font-semibold transition-all duration-200',
              value === h
                ? 'border-[hsl(var(--brand-ai)/0.4)] bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))] scale-[1.04]'
                : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.2)] text-[hsl(var(--fg-2))] active:scale-[0.97]'
            )}
          >
            {`${h}h`}
          </button>
        ))}
      </div>

      {value && (
        <div className="mt-4 px-3 py-2 rounded-xl bg-[hsl(var(--fill)/0.4)] text-[12px] text-[hsl(var(--fg-2))]">
          {value >= 7.5
            ? 'Great sleep duration. Recovery should be solid.'
            : value >= 6.5
              ? 'Decent rest. You should be good for today.'
              : 'Below optimal. Consider an easier session today.'}
        </div>
      )}
    </div>
  );
}

// ── Completion Step ───────────────────────────────────────────────────────────

function CompletionStep({ answers, t }) {
  const moodLabels = {
    1: '\u{1F614} Rough',
    2: '\u{1F615} Low',
    3: '\u{1F610} Okay',
    4: '\u{1F642} Good',
    5: '\u{1F60A} Great',
  };

  const energyLabels = {
    1: 'Drained',
    2: 'Low',
    3: 'Moderate',
    4: 'Good',
    5: 'Peak',
  };

  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-14 h-14 rounded-full bg-[hsl(var(--ok)/0.08)] flex items-center justify-center mb-5">
        <Check className="w-7 h-7 text-[hsl(var(--ok))]" strokeWidth={2.5} />
      </div>
      <h3 className="text-[20px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
        Logged.
      </h3>
      <p className="text-[14px] text-[hsl(var(--fg-2))] mt-2 leading-5">
        Keep showing up.
      </p>

      <div className="w-full mt-8 rounded-2xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.2)] p-4 space-y-3">
        {answers.mood != null && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[hsl(var(--fg-2))] flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" strokeWidth={2} />
              Mood
            </span>
            <span className="font-semibold text-[hsl(var(--fg))]">
              {moodLabels[answers.mood] || `${answers.mood}/5`}
            </span>
          </div>
        )}
        {answers.energy != null && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[hsl(var(--fg-2))] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" strokeWidth={2} />
              Energy
            </span>
            <span className="font-semibold text-[hsl(var(--fg))]">
              {energyLabels[answers.energy] || `${answers.energy}/5`}
            </span>
          </div>
        )}
        {answers.sleep_hours != null && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[hsl(var(--fg-2))] flex items-center gap-2">
              <Moon className="w-3.5 h-3.5" strokeWidth={2} />
              Sleep
            </span>
            <span className="font-semibold text-[hsl(var(--fg))]">
              {answers.sleep_hours}h
            </span>
          </div>
        )}
      </div>

      {(answers.mood <= 2 || answers.energy <= 2) && (
        <p className="mt-4 text-[12px] text-[hsl(var(--warn))] leading-5 px-2">
          Low energy or mood logged. Consider an easier session or active recovery today.
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BodyCheckinSheet({ open, onOpenChange }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const t = useT();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Reset state when the sheet opens
  useEffect(() => {
    if (open) {
      setStep(0);
      setAnswers({});
      setSaving(false);
      setCompleted(false);
    }
  }, [open]);

  // Autosave a single field to daily_checkins
  const autosaveField = useCallback(async (field, value) => {
    if (!user?.id || value == null) return;
    const today = getToday();

    try {
      const { data: existing } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('daily_checkins')
          .update({ [field]: value })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_checkins')
          .insert({ user_id: user.id, date: today, [field]: value });
      }

      queryClient.invalidateQueries({ queryKey: ['daily-checkin', user.id] });
    } catch (err) {
      console.error('[BodyCheckinSheet] autosave error:', err);
    }
  }, [user?.id, queryClient]);

  const handleAnswer = useCallback(async (value) => {
    const currentStep = STEPS[step];
    if (!currentStep) return;

    const newAnswers = { ...answers, [currentStep.field]: value };
    setAnswers(newAnswers);

    // Autosave this step in the background
    autosaveField(currentStep.field, value);

    // Small delay for visual feedback, then advance
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      // Final step complete
      setCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['daily-checkin'] });
      queryClient.invalidateQueries({ queryKey: DAILY_KEYS.weight(user?.id) });
    }
  }, [step, answers, autosaveField, queryClient, user?.id]);

  const handleClose = () => {
    onOpenChange(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <MobileSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <MobileSheet.Body className="flex flex-col">
        {/* Progress dots (hidden on completion) */}
        {!completed && (
          <div className="mb-6">
            <ProgressDots current={step} total={TOTAL_STEPS} />
          </div>
        )}

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center min-h-[280px]">
          {completed ? (
            <CompletionStep answers={answers} t={t} />
          ) : step === 0 ? (
            <MoodStep value={answers.mood} onChange={handleAnswer} t={t} />
          ) : step === 1 ? (
            <EnergyStep value={answers.energy} onChange={handleAnswer} t={t} />
          ) : step === 2 ? (
            <SleepStep value={answers.sleep_hours} onChange={handleAnswer} t={t} />
          ) : null}
        </div>

        {/* Saving indicator */}
        {saving && (
          <div className="flex items-center justify-center gap-2 py-2 text-[12px] text-[hsl(var(--fg-3))]">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </MobileSheet.Body>

      {/* Footer CTA — only show on completion */}
      {completed && (
        <MobileSheet.Footer>
          <button
            onClick={handleClose}
            className="atlas-button atlas-button-primary w-full h-12 rounded-2xl text-[14px] font-semibold"
          >
            Done
          </button>
        </MobileSheet.Footer>
      )}
    </MobileSheet>
  );
}
