import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';
import { saveLocalProfile } from '@/lib/profileUtils';
import { getTodayKey } from '@/lib/dateUtils';
import { useNavigate } from 'react-router-dom';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  X,
  ArrowRight,
  Zap,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Compass,
  Star,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Config ───────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'fat_loss',    emoji: '🔥', label: 'Fat loss' },
  { id: 'muscle_gain', emoji: '💪', label: 'Muscle gain' },
  { id: 'recomp',      emoji: '⚡', label: 'Recomposition' },
  { id: 'performance', emoji: '🏆', label: 'Performance' },
  { id: 'health',      emoji: '❤️', label: 'General health' },
  { id: 'longevity',   emoji: '🌱', label: 'Longevity' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary',   label: 'Sedentary',   desc: 'No regular exercise' },
  { id: 'light',       label: 'Light',       desc: '1–2x per week' },
  { id: 'moderate',    label: 'Moderate',    desc: '3–4x per week' },
  { id: 'active',      label: 'Active',      desc: '5–6x per week' },
  { id: 'very_active', label: 'Very active', desc: '2x per day / athlete' },
];

// Remarketing data — collected for retargeting (transcript 2 playbook)
const HEAR_ABOUT_US = [
  { id: 'instagram',     label: 'Instagram / TikTok' },
  { id: 'youtube',       label: 'YouTube' },
  { id: 'google',        label: 'Google' },
  { id: 'indication',    label: 'Referral' },
  { id: 'coach',         label: 'My coach / nutritionist' },
  { id: 'other',         label: 'Other' },
];

const SETUP_MESSAGES = [
  'Calculating your nutrition targets...',
  'Saving your first checkpoint...',
  'Setting up your dashboard...',
  'Your Atlas Core is ready.',
];

const TOTAL_STEPS = 4; // 0=welcome, 1=profile+goals, 2=first checkpoint, 3=path choice

const INITIAL_FORM = {
  sex: 'male',
  age: '',
  height: '',
  current_weight: '',
  target_weight: '',
  health_goals: [],
  activity_level: 'moderate',
  hear_about_us: '',          // remarketing data
  // Step 2 — first checkpoint
  checkpoint_weight: '',
  checkpoint_body_fat: '',
  checkpoint_waist: '',
  // Step 3 — path
  chosen_path: '', // 'fresh' | 'own'
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8">
      <AtlasCoreLogoSVG width={48} height={24} className="shrink-0" />
      <span className="text-[17px] font-bold tracking-tight">
        <span className="text-[hsl(var(--accent-primary))]">atlas</span>
        <span className="text-[hsl(var(--fg))]">.core</span>
      </span>
    </div>
  );
}

function StepDots({ step, total }) {
  return (
    <div className="mb-7 rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.52)] px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
          Step {step + 1} of {total}
        </p>
        <span className="font-mono text-[12px] font-semibold text-[hsl(var(--brand))]">
          {Math.round(((step + 1) / total) * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step
                ? 'h-2 flex-1 bg-[hsl(var(--brand))]'
                : i < step
                  ? 'h-2 flex-1 bg-[hsl(var(--brand)/0.38)]'
                  : 'h-2 flex-1 bg-[hsl(var(--border-h))]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function GoalChip({ selected, onClick, emoji, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all text-center
        ${selected
          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.08)] shadow-sm'
          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))]'
        }`}
    >
      <span className="text-[22px] leading-none">{emoji}</span>
      <span className={`text-[12px] font-semibold leading-tight ${selected ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-2))]'}`}>
        {label}
      </span>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
      {children}
    </label>
  );
}

function OptionalBadge() {
  return (
    <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--fg-3))]">
      optional
    </span>
  );
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="text-center space-y-6 py-2">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto">
        <Zap className="w-8 h-8 text-[hsl(var(--brand))]" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight mb-2">
          Welcome to{' '}
          <span className="text-[hsl(var(--accent-primary))]">atlas</span>
          <span className="text-[hsl(var(--fg))]">.core</span>
        </h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-xs mx-auto">
          Three quick steps to set up your dashboard and save your first data point.
        </p>
      </div>
      <div className="space-y-2 text-left">
        {[
          { n: '01', title: 'Profile and goals', desc: 'Who you are and what you want to achieve' },
          { n: '02', title: 'First checkpoint', desc: 'Your starting point so you can compare against it later' },
          { n: '03', title: 'Choose your path', desc: 'How you want to start this week' },
        ].map(({ n, title, desc }) => (
          <div
            key={n}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--card-hi))] border border-[hsl(var(--border-h))]"
          >
            <span className="text-[11px] font-bold tabular-nums text-[hsl(var(--brand))] shrink-0 mt-0.5 w-4">
              {n}
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-snug">{title}</p>
              <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepProfileAndGoals({ form, set, toggle }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold mb-1">What is your main goal?</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">
          This shapes your dashboard and Atlas AI recommendations
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {GOALS.map((g) => (
          <GoalChip
            key={g.id}
            selected={form.health_goals.includes(g.id)}
            onClick={() => toggle('health_goals', g.id)}
            emoji={g.emoji}
            label={g.label}
          />
        ))}
      </div>

      <div className="border-t border-[hsl(var(--border-h))] pt-4 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))]">
          Basic profile
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Height (cm)</FieldLabel>
            <Input
              type="number"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              placeholder="175"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
          <div>
            <FieldLabel>Current weight (kg)</FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.current_weight}
              onChange={(e) => {
                set('current_weight', e.target.value);
                // Keep checkpoint pre-filled in sync
                set('checkpoint_weight', e.target.value);
              }}
              placeholder="80"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
          <div>
            <FieldLabel>Biological sex</FieldLabel>
            <Select value={form.sex} onValueChange={(v) => set('sex', v)}>
              <SelectTrigger className="atlas-field h-11 rounded-[12px] border-0 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Age</FieldLabel>
            <Input
              type="number"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="30"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>
              Target weight (kg)<OptionalBadge />
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.target_weight}
              onChange={(e) => set('target_weight', e.target.value)}
              placeholder="75"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
          <div>
            <FieldLabel>Activity level</FieldLabel>
            <Select value={form.activity_level} onValueChange={(v) => set('activity_level', v)}>
              <SelectTrigger className="atlas-field h-11 rounded-[12px] border-0 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label} — {a.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Remarketing data collection (transcript 2 playbook) ── */}
      <div className="border-t border-[hsl(var(--border-h))] pt-4 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))]">
          How did you hear about us? <OptionalBadge />
        </p>
        <div className="flex flex-wrap gap-2">
          {HEAR_ABOUT_US.map((option) => {
            const selected = form.hear_about_us === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => set('hear_about_us', selected ? '' : option.id)}
                className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all
                  ${selected
                    ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--fg))]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card-hi))]'
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepFirstCheckpoint({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold mb-1">First checkpoint</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed">
          Let's save your starting point so you can compare future Block Reviews against it.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <FieldLabel>Weight (kg)</FieldLabel>
          <Input
            type="number"
            step="0.1"
            value={form.checkpoint_weight}
            onChange={(e) => set('checkpoint_weight', e.target.value)}
            placeholder="80"
            className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>
              Body fat (%)<OptionalBadge />
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.checkpoint_body_fat}
              onChange={(e) => set('checkpoint_body_fat', e.target.value)}
              placeholder="18"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
          <div>
            <FieldLabel>
              Waist (cm)<OptionalBadge />
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.checkpoint_waist}
              onChange={(e) => set('checkpoint_waist', e.target.value)}
              placeholder="80"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.15)] px-4 py-3">
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-5">
          This checkpoint is saved in <strong className="text-[hsl(var(--fg))]">Measurements</strong> and
          serves as the baseline for progress comparisons in{' '}
          <strong className="text-[hsl(var(--fg))]">Block Review</strong>.
        </p>
      </div>
    </div>
  );
}

function PathCard({ selected, onClick, icon: Icon, title, desc, items }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all space-y-3
        ${selected
          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.06)]'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-h))] hover:bg-[hsl(var(--card-hi))]'
        }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${selected ? 'bg-[hsl(var(--brand)/0.15)]' : 'bg-[hsl(var(--shell))]'}`}>
          <Icon className={`w-4 h-4 ${selected ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-2))]'}`} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))] leading-snug">{title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5 leading-4">{desc}</p>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
          ${selected ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'}`}>
          {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
        </div>
      </div>
      {selected && items && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5 pl-12"
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] text-[hsl(var(--fg-2))]">
              <div className="w-1 h-1 rounded-full bg-[hsl(var(--brand)/0.6)] shrink-0" />
              {item}
            </div>
          ))}
        </motion.div>
      )}
    </button>
  );
}

function StepPathChoice({ form, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold mb-1">How do you want to start?</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">
          You can change this anytime inside the app
        </p>
      </div>

      <PathCard
        selected={form.chosen_path === 'fresh'}
        onClick={() => set('chosen_path', 'fresh')}
        icon={Compass}
        title="Start fresh this week"
        desc="We'll show you exactly what to log over the next 7 days so your first insights are useful."
        items={[
          'Log meals today in Nutrition',
          'Create or start a workout plan in Workouts',
          'Track weight and measurements twice this week',
          'Set up active protocols, if needed',
        ]}
      />

      <PathCard
        selected={form.chosen_path === 'own'}
        onClick={() => set('chosen_path', 'own')}
        icon={Dumbbell}
        title="I'll set it up at my own pace"
        desc="I already have a routine. I'll explore the modules that matter to me."
      />

      {!form.chosen_path && (
        <p className="text-[11px] text-center text-[hsl(var(--fg-3))]">
          Select one option to continue
        </p>
      )}
    </div>
  );
}

// ─── Paywall priming screen (transcript 2 playbook) ───────────────────────────
// Shows BEFORE the actual setup generation. Builds trust, explains the trial,
// and primes users toward the annual plan without hard-selling.

function PaywallPrimingScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 py-2"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-[hsl(var(--brand))]" strokeWidth={1.75} />
        </div>
        <h2 className="text-[20px] font-bold tracking-tight mb-1">
          How your free trial works
        </h2>
        <p className="text-[13px] text-[hsl(var(--fg-2))] leading-relaxed">
          7 days of full access. No credit card required right now.
        </p>
      </div>

      {/* Trial timeline */}
      <div className="space-y-2">
        {[
          {
            day: 'Today',
            title: 'Full access unlocked',
            desc: 'Workouts, nutrition, AI, and labs are available from day one.',
            icon: '🚀',
            highlight: true,
          },
          {
            day: 'Day 5',
            title: 'Email reminder',
            desc: "We'll remind you before your trial ends.",
            icon: '📧',
            highlight: false,
          },
          {
            day: 'Day 7',
            title: 'Trial ends',
            desc: 'Choose a plan to continue or lose access.',
            icon: '⏰',
            highlight: false,
          },
        ].map(({ day, title, desc, icon, highlight }) => (
          <div
            key={day}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all
              ${highlight
                ? 'bg-[hsl(var(--brand)/0.06)] border-[hsl(var(--brand)/0.2)]'
                : 'bg-[hsl(var(--card-hi))] border-[hsl(var(--border-h))]'
              }`}
          >
            <span className="text-[18px] shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0
                  ${highlight ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'}`}>
                  {day}
                </span>
                <span className="text-[13px] font-semibold leading-snug">{title}</span>
              </div>
              <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Annual plan highlight — pushes LTV (transcript 2 playbook) */}
      <div className="rounded-xl border border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.04)] p-3">
        <div className="flex items-start gap-2.5">
          <Crown className="w-4 h-4 text-[hsl(var(--brand))] shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-[12px] font-semibold text-[hsl(var(--fg))] leading-snug">
              Annual plan — save up to 40%
            </p>
            <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5">
              After the trial, the annual plan gives you the lowest monthly cost. You can choose it when you activate.
            </p>
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] px-3 py-2.5">
        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" strokeWidth={1.5} />
          ))}
          <span className="text-[11px] font-semibold ml-1 text-[hsl(var(--fg-2))]">
            4.9 · 500+ athletes
          </span>
        </div>
        <p className="text-[12px] text-[hsl(var(--fg-2))] italic leading-relaxed">
          "Finally, one app that brings training, nutrition, and labs together in the same place."
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="btn btn-primary w-full h-12 rounded-2xl text-[14px] gap-2"
      >
        Start my free trial <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </button>

      <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
        No credit card · Cancel anytime
      </p>
    </motion.div>
  );
}

// ─── Setup generation ─────────────────────────────────────────────────────────

function SetupGenerationScreen({ onDone }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      if (i < SETUP_MESSAGES.length - 1) {
        setMsgIdx(i);
      } else {
        setMsgIdx(SETUP_MESSAGES.length - 1);
        setDone(true);
        clearInterval(intervalRef.current);
      }
    }, 700);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="text-center py-6 space-y-8">
      <div className="relative w-20 h-20 mx-auto">
        <svg
          className="absolute inset-0 -rotate-90 animate-spin"
          style={{ animationDuration: '2s' }}
          viewBox="0 0 80 80"
        >
          <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border-h))" strokeWidth="4" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--brand))" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="50 164"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {done
            ? <Check className="w-8 h-8 text-[hsl(var(--ok))]" strokeWidth={2.5} />
            : <Zap className="w-7 h-7 text-[hsl(var(--brand))]" strokeWidth={2} />
          }
        </div>
      </div>

      <div className="space-y-2 min-h-[48px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-[15px] font-semibold text-[hsl(var(--fg))]"
          >
            {SETUP_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
        {!done && (
          <p className="text-[12px] text-[hsl(var(--fg-2))]">Setting up your Atlas Core...</p>
        )}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button onClick={onDone} className="btn btn-primary h-12 px-8 rounded-2xl text-[14px] gap-2">
            <ArrowRight className="w-4 h-4" strokeWidth={2} /> Enter the app
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ chosenPath, onDone }) {
  useEffect(() => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }, []);

  const isFresh = chosenPath === 'fresh';

  return (
    <div className="text-center py-4 space-y-6">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
        className="w-20 h-20 rounded-full bg-[hsl(var(--ok)/0.1)] flex items-center justify-center mx-auto"
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Check className="w-10 h-10 text-[hsl(var(--ok))]" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-[24px] font-bold">All set! 🎉</h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-xs mx-auto">
          {isFresh
            ? 'Your first checkpoint is saved. Go to Today and start your first log of the day.'
            : 'Your Atlas Core is ready. Explore the modules at your own pace.'}
        </p>
      </motion.div>

      {isFresh && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] p-4 text-left space-y-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
            This week, focus on
          </p>
          {[
            { icon: UtensilsCrossed, text: 'Log meals in Nutrition' },
            { icon: Dumbbell, text: 'Create or start a plan in Workouts' },
            { icon: Scale, text: 'Log measurements twice this week' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2.5 text-[13px] text-[hsl(var(--fg-2))]"
            >
              <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand))] shrink-0" strokeWidth={2} />
              {text}
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        onClick={onDone}
        className="btn btn-primary w-full h-12 rounded-2xl text-[14px] gap-2 mt-2"
      >
        <ArrowRight className="w-4 h-4" strokeWidth={2} /> Enter the app
      </motion.button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, user, revalidateSession } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPaywallPriming, setShowPaywallPriming] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!isAuthenticated || !user) navigate(ROUTES.home, { replace: true });
    if (user?.onboarding_completed) {
      navigate(ROLE_HOME[user?.atlas_role] || ROUTES.today, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, id) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id],
    }));

  const canContinue = () => {
    if (step === 0) return true;
    if (step === 1) return form.health_goals.length > 0 && form.height && form.current_weight && form.age;
    if (step === 2) return !!form.checkpoint_weight;
    if (step === 3) return !!form.chosen_path;
    return true;
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  const saveAndFinish = async () => {
    if (!isAuthenticated || !user) { navigate(ROUTES.home, { replace: true }); return false; }
    setSaving(true);
    try {
      // CRITICAL: write onboarding_completed as a direct column.
      // Do NOT include profile fields (calories_target, etc.) here — they live in
      // profile_data JSONB and would cause the entire upsert to fail silently.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, onboarding_completed: true, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (profileError) throw profileError;

      // Write form data into profile_data via the canonical profileUtils pattern.
      const w = Number(form.current_weight) || 80;
      const isDeficit = form.health_goals.includes('fat_loss');
      const multiplier = isDeficit ? 28 : form.health_goals.includes('muscle_gain') ? 35 : 30;
      const caloriesTarget = Math.round(w * multiplier);
      const profileDataPayload = {
        ...(form.age !== ''            && { age: Number(form.age) }),
        ...(form.height !== ''         && { height: Number(form.height) }),
        ...(form.current_weight !== '' && { current_weight: Number(form.current_weight) }),
        ...(form.target_weight !== ''  && { target_weight: Number(form.target_weight) }),
        ...(form.sex                   && { sex: form.sex }),
        ...(form.activity_level        && { activity_level: form.activity_level }),
        ...(form.health_goals.length   && { health_goals: form.health_goals }),
        calories_target: caloriesTarget,
        protein_target:  Math.round(w * 2.2),
        carbs_target:    Math.round((caloriesTarget * 0.4) / 4),
        fat_target:      Math.round((caloriesTarget * 0.25) / 9),
        water_target:    parseFloat((w * 0.035).toFixed(1)),
      };
      await saveLocalProfile(user, null, profileDataPayload);

      // Store remarketing data in user metadata (no schema change needed)
      if (form.hear_about_us) {
        await supabase.auth.updateUser({ data: { hear_about_us: form.hear_about_us } });
      }

      // Insert first measurement checkpoint
      const checkpointWeight = Number(form.checkpoint_weight) || Number(form.current_weight);
      if (checkpointWeight) {
        const measurementPayload = {
          user_id: user.id,
          date: getTodayKey(),
          weight: checkpointWeight,
        };
        if (form.checkpoint_body_fat !== '') measurementPayload.body_fat = Number(form.checkpoint_body_fat);
        if (form.checkpoint_waist !== '')    measurementPayload.waist = Number(form.checkpoint_waist);
        await supabase.from('measurements').insert(measurementPayload);
      }

      // Same-device race condition guard — only set after confirmed DB write above
      localStorage.setItem(`onboarding_done_${user.id}`, 'true');
      return true;
    } catch (err) {
      console.error('[Onboarding] Save failed:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Step 3 finish → save → show paywall priming
  const handleFinish = async () => {
    const saved = await saveAndFinish();
    if (!saved) return; // DB write failed — user stays on step, button re-enables to retry
    setShowPaywallPriming(true);
  };

  // Paywall priming CTA → setup generation
  const handlePrimingContinue = () => {
    setShowPaywallPriming(false);
    setShowGeneration(true);
  };

  const handleGenerationDone = () => {
    setShowGeneration(false);
    setShowSuccess(true);
  };

  const handleSuccessDone = async () => {
    // The DB write already succeeded (saveAndFinish checked the error).
    // Attempt a session refresh so AuthContext picks up onboarding_completed = true.
    // If it fails (slow network, timeout), navigate anyway — the guard's
    // localStorage fallback will let us through without touching authState.
    try { await revalidateSession(); } catch { /* non-fatal */ }
    navigate(ROLE_HOME[user?.atlas_role] || ROUTES.today, { replace: true });
  };

  const stepContent = () => {
    switch (step) {
      case 0: return <StepWelcome />;
      case 1: return <StepProfileAndGoals form={form} set={set} toggle={toggle} />;
      case 2: return <StepFirstCheckpoint form={form} set={set} />;
      case 3: return <StepPathChoice form={form} set={set} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))] p-5">
      <div className="w-full max-w-md">

        {/* ── Paywall priming screen ── */}
        {showPaywallPriming && (
          <>
            <Logo />
            <div className="surface rounded-[22px] p-6">
              <PaywallPrimingScreen onContinue={handlePrimingContinue} />
            </div>
          </>
        )}

        {/* ── Setup generation screen ── */}
        {!showPaywallPriming && showGeneration && (
          <>
            <Logo />
            <div className="surface rounded-[22px] p-8">
              <SetupGenerationScreen onDone={handleGenerationDone} />
            </div>
          </>
        )}

        {/* ── Success screen ── */}
        {!showPaywallPriming && !showGeneration && showSuccess && (
          <>
            <Logo />
            <div className="surface rounded-[22px] p-8">
              <SuccessScreen chosenPath={form.chosen_path} onDone={handleSuccessDone} />
            </div>
          </>
        )}

        {/* ── Main onboarding steps ── */}
        {!showPaywallPriming && !showGeneration && !showSuccess && (
          <>
            <div className="flex justify-end mb-1">
              <button
                onClick={() => navigate(ROUTES.home, { replace: true })}
                className="p-2 rounded-lg hover:bg-[hsl(var(--shell))] transition-colors text-[hsl(var(--fg-2))]"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <Logo />
            <StepDots step={step} total={TOTAL_STEPS} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="surface mb-4 rounded-[22px] p-6"
              >
                {stepContent()}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="btn btn-secondary h-11 rounded-[12px] px-4"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canContinue()}
                  className="btn btn-primary flex-1 h-11 rounded-[12px] text-[14px] gap-1"
                >
                  Continue <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving || !canContinue()}
                  className="btn btn-primary flex-1 h-11 rounded-[12px] text-[14px] gap-1.5"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Zap className="w-4 h-4" strokeWidth={2} /> Set up my Atlas Core</>
                  }
                </button>
              )}
            </div>

            {step === 0 && (
              <p className="text-center text-[11px] text-[hsl(var(--fg-2))] mt-4">
                By continuing, you accept the{' '}
                <span className="underline cursor-pointer">Terms of Use</span>.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
