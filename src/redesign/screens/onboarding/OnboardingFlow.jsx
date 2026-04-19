import React, { useState } from 'react';
import { OnboardingShell } from '../../layouts';
import { Button, Input } from '../../ui';
import { StepCard, OptionPicker, NumericStepper, PersonalizedSummary } from '../../modules';

/**
 * A condensed 10-step onboarding flow. Real Atlas Core uses ~28 steps;
 * the redesign groups them into tighter themes while preserving the
 * Cal AI / Noom "personalized for you" arc.
 *
 * Each step is a tiny component composed from modules + primitives.
 */

const GOAL_OPTIONS = [
  { id: 'lose',     label: 'Lose fat',          description: 'Drop body fat while keeping muscle.',  icon: '⬇' },
  { id: 'build',    label: 'Build muscle',      description: 'Add lean mass with progressive load.', icon: '⬆' },
  { id: 'perform',  label: 'Perform',           description: 'Train for a specific goal or sport.',  icon: '⚡' },
  { id: 'health',   label: 'Feel healthier',    description: 'Energy, sleep, labs. No specific body goal.', icon: '♥' },
];

const ACTIVITY_OPTIONS = [
  { id: 'sed',    label: 'Mostly sedentary',  description: 'Desk job, <1 workout/week.' },
  { id: 'light',  label: 'Lightly active',    description: '1-2 workouts/week.' },
  { id: 'mod',    label: 'Moderately active', description: '3-4 workouts/week.' },
  { id: 'high',   label: 'Very active',       description: '5+ workouts/week.' },
];

const DIET_OPTIONS = [
  { id: 'omni',    label: 'Omnivore',    icon: '🍖' },
  { id: 'pesc',    label: 'Pescetarian', icon: '🐟' },
  { id: 'veg',     label: 'Vegetarian',  icon: '🥗' },
  { id: 'vegan',   label: 'Vegan',       icon: '🌱' },
  { id: 'keto',    label: 'Low carb',    icon: '🥑' },
  { id: 'none',    label: 'No preference', icon: '—' },
];

const HABIT_OPTIONS = [
  { id: 'track',    label: 'Log meals',      description: 'Even roughly — we\'ll guide you.' },
  { id: 'weight',   label: 'Weigh in daily', description: 'Trend, not drama.' },
  { id: 'recovery', label: 'Track recovery', description: 'Sleep + HRV via HealthKit.' },
  { id: 'workout',  label: 'Follow a plan',  description: 'We build it for you.' },
];

export default function OnboardingFlow() {
  const TOTAL = 10;
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    goal: null, activity: null, diet: null, habits: [],
    age: 28, heightCm: 180, weightKg: 82, sex: 'male',
  });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const canContinue = ({
    1: true,
    2: !!data.goal,
    3: !!data.activity,
    4: data.age && data.heightCm && data.weightKg,
    5: !!data.diet,
    6: data.habits.length > 0,
    7: true,
    8: true,
    9: true,
    10: true,
  }[step]);

  return (
    <OnboardingShell
      step={step}
      total={TOTAL}
      onBack={step > 1 ? back : null}
      footer={
        step === TOTAL
          ? <Button intent="primary" size="xl" block>Start free trial</Button>
          : <Button intent="primary" size="xl" block disabled={!canContinue} onClick={next}>Continue</Button>
      }
    >
      {step === 1 && (
        <StepCard title="Let's build your plan." description="Answer a few questions. We'll do the math.">
          <div className="flex items-center justify-center py-8">
            <img src="/branding/dark/logo.svg" alt="atlas.core" width="112" height="112" className="h-28 w-28 drop-shadow-[0_0_48px_rgba(0,255,255,0.30)]" draggable={false} />
          </div>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="What's your main goal?" description="Pick one. You can change this later." whyAsk="We adjust calories, protein targets, and training volume differently for each goal.">
          <OptionPicker options={GOAL_OPTIONS} value={data.goal} onChange={(v) => set('goal', v)} />
        </StepCard>
      )}

      {step === 3 && (
        <StepCard title="How active are you?" description="Outside of training." whyAsk="This shifts your daily calorie baseline.">
          <OptionPicker options={ACTIVITY_OPTIONS} value={data.activity} onChange={(v) => set('activity', v)} />
        </StepCard>
      )}

      {step === 4 && (
        <StepCard title="About your body" description="All fields private." whyAsk="Used to estimate BMR and protein minimums. Updated weekly from your logs.">
          <div className="space-y-5">
            <NumericStepper label="Age"       value={data.age}       onChange={(v) => set('age', v)}       unit="years" min={13} max={100} />
            <NumericStepper label="Height"    value={data.heightCm}  onChange={(v) => set('heightCm', v)}  unit="cm"    min={120} max={230} />
            <NumericStepper label="Weight"    value={data.weightKg}  onChange={(v) => set('weightKg', v)}  unit="kg"    min={30} max={250} step={0.5} />
          </div>
        </StepCard>
      )}

      {step === 5 && (
        <StepCard title="Any dietary preferences?" description="Pick the closest match.">
          <OptionPicker options={DIET_OPTIONS} value={data.diet} onChange={(v) => set('diet', v)} />
        </StepCard>
      )}

      {step === 6 && (
        <StepCard title="What habits matter to you?" description="Select one or more." whyAsk="We'll surface reminders and shortcuts for the things you care about.">
          <OptionPicker multi options={HABIT_OPTIONS} value={data.habits} onChange={(v) => set('habits', v)} />
        </StepCard>
      )}

      {step === 7 && (
        <StepCard title="Any constraints we should know?" description="Injuries, equipment limits, or schedule.">
          <Input label="Notes" placeholder="e.g. no bench, knee pain, work 9–5" hint="Optional. You can add more later." />
        </StepCard>
      )}

      {step === 8 && (
        <StepCard title="One moment — we're building your plan." description="Crunching recovery, calorie math, and training volume.">
          <div className="flex h-48 items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-rd-border border-t-rd-accent animate-spin" aria-hidden />
          </div>
        </StepCard>
      )}

      {step === 9 && (
        <StepCard title="Your starting numbers" description="We'll adjust these every week based on your trend.">
          <PersonalizedSummary lines={[
            { label: 'Daily calories', value: '2,460 kcal' },
            { label: 'Protein',        value: '185 g' },
            { label: 'Carbs',          value: '280 g' },
            { label: 'Fat',            value: '82 g' },
            { label: 'Training',       value: '4 days / week' },
            { label: 'Recovery target', value: '7.5 h sleep' },
          ]} />
        </StepCard>
      )}

      {step === 10 && (
        <StepCard title="Try atlas.core free for 7 days." description="Full access. No charge today. Cancel any time.">
          <ul className="space-y-2">
            {['Adaptive weekly plans','AI coach + insights','HealthKit sync','Labs interpretation','Priority support'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[14px] text-rd-fg-secondary"><span className="text-rd-accent">✓</span>{f}</li>
            ))}
          </ul>
          <p className="mt-6 text-[12px] text-rd-fg-muted text-center">We'll remind you 2 days before trial ends.</p>
        </StepCard>
      )}
    </OnboardingShell>
  );
}
