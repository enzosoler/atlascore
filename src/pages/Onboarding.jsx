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
import { useI18n } from '@/lib/i18nContext';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { cn } from '@/lib/utils';

// ─── Config ───────────────────────────────────────────────────────────────────

const GOAL_IDS = ['fat_loss', 'muscle_gain', 'recomp', 'performance', 'health', 'longevity'];
const GOAL_EMOJIS = { fat_loss: '🔥', muscle_gain: '💪', recomp: '⚡', performance: '🏆', health: '❤️', longevity: '🌱' };
const ACTIVITY_LEVEL_IDS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const HEAR_ABOUT_US_IDS = ['instagram', 'youtube', 'google', 'indication', 'coach', 'other'];

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

function StepDots({ step, total, t }) {
  return (
    <div className="mb-7 rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.52)] px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="atlas-overline">
          {t('onboarding.page.stepOf', { step: step + 1, total })}
        </p>
        <span className="font-mono text-[12px] font-semibold text-[hsl(var(--brand))]">
          {Math.round(((step + 1) / total) * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn('h-2 flex-1 rounded-full transition-all duration-300', i === step ? 'bg-[hsl(var(--brand))]' : i < step ? 'bg-[hsl(var(--brand)/0.38)]' : 'bg-[hsl(var(--border-h))]')}
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

// ─── Step screens ─────────────────────────────────────────────────────────────

function StepWelcome({ t }) {
  const steps = [
    { n: '01', title: t('onboarding.page.step01Title'), desc: t('onboarding.page.step01Desc') },
    { n: '02', title: t('onboarding.page.step02Title'), desc: t('onboarding.page.step02Desc') },
    { n: '03', title: t('onboarding.page.step03Title'), desc: t('onboarding.page.step03Desc') },
  ];
  return (
    <div className="text-center space-y-6 py-2">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto">
        <Zap className="w-8 h-8 text-[hsl(var(--brand))]" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight mb-2">
          {t('onboarding.page.welcomeTitle')}{' '}
          <span className="text-[hsl(var(--accent-primary))]">atlas</span>
          <span className="text-[hsl(var(--fg))]">.core</span>
        </h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-xs mx-auto">
          {t('onboarding.page.welcomeSubtitle')}
        </p>
      </div>
      <div className="space-y-2 text-left">
        {steps.map(({ n, title, desc }) => (
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

function StepProfileAndGoals({ form, set, toggle, t }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold mb-1">{t('onboarding.page.goalTitle')}</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">{t('onboarding.page.goalSubtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {GOAL_IDS.map((id) => (
          <GoalChip
            key={id}
            selected={form.health_goals.includes(id)}
            onClick={() => toggle('health_goals', id)}
            emoji={GOAL_EMOJIS[id]}
            label={t(`onboarding.page.goals.${id}`)}
          />
        ))}
      </div>

      <div className="border-t border-[hsl(var(--border-h))] pt-4 space-y-3">
        <p className="atlas-overline">{t('onboarding.page.basicProfile')}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>{t('onboarding.page.heightLabel')}</FieldLabel>
            <Input
              type="number"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              placeholder="175"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
          <div>
            <FieldLabel>{t('onboarding.page.currentWeightLabel')}</FieldLabel>
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
            <FieldLabel>{t('onboarding.page.biologicalSex')}</FieldLabel>
            <Select value={form.sex} onValueChange={(v) => set('sex', v)}>
              <SelectTrigger className="atlas-field h-11 rounded-[12px] border-0 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('onboarding.page.male')}</SelectItem>
                <SelectItem value="female">{t('onboarding.page.female')}</SelectItem>
                <SelectItem value="other">{t('onboarding.page.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>{t('onboarding.page.ageLabel')}</FieldLabel>
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
              {t('onboarding.page.targetWeightLabel')} <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--fg-3))]">{t('onboarding.page.optional')}</span>
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
            <FieldLabel>{t('onboarding.page.activityLevel')}</FieldLabel>
            <Select value={form.activity_level} onValueChange={(v) => set('activity_level', v)}>
              <SelectTrigger className="atlas-field h-11 rounded-[12px] border-0 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVEL_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {t(`onboarding.page.activityLevels.${id}`)} — {t(`onboarding.page.activityLevels.${id}Desc`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Remarketing data collection (transcript 2 playbook) ── */}
      <div className="border-t border-[hsl(var(--border-h))] pt-4 space-y-2.5">
        <p className="atlas-overline">
          {t('onboarding.page.hearAboutUs')} <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal">{t('onboarding.page.optional')}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {HEAR_ABOUT_US_IDS.map((id) => {
            const selected = form.hear_about_us === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => set('hear_about_us', selected ? '' : id)}
                className={cn('px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all', selected ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--fg))]' : 'border-[hsl(var(--border))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card-hi))]')}
              >
                {t(`onboarding.page.hearOptions.${id}`)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepFirstCheckpoint({ form, set, t }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold mb-1">{t('onboarding.page.checkpointTitle')}</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed">
          {t('onboarding.page.checkpointSubtitle')}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <FieldLabel>{t('onboarding.page.checkpointWeightLabel')}</FieldLabel>
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
              {t('onboarding.page.checkpointBodyFatLabel')} <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--fg-3))]">{t('onboarding.page.optional')}</span>
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
              {t('onboarding.page.checkpointWaistLabel')} <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--fg-3))]">{t('onboarding.page.optional')}</span>
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
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-5" dangerouslySetInnerHTML={{ __html: t('onboarding.page.checkpointInfo') }} />
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

function StepPathChoice({ form, set, t }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold mb-1">{t('onboarding.page.pathTitle')}</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">{t('onboarding.page.pathSubtitle')}</p>
      </div>

      <PathCard
        selected={form.chosen_path === 'fresh'}
        onClick={() => set('chosen_path', 'fresh')}
        icon={Compass}
        title={t('onboarding.page.freshTitle')}
        desc={t('onboarding.page.freshDesc')}
        items={[t('onboarding.page.freshItem1'), t('onboarding.page.freshItem2'), t('onboarding.page.freshItem3'), t('onboarding.page.freshItem4')]}
      />

      <PathCard
        selected={form.chosen_path === 'own'}
        onClick={() => set('chosen_path', 'own')}
        icon={Dumbbell}
        title={t('onboarding.page.ownTitle')}
        desc={t('onboarding.page.ownDesc')}
      />

      {!form.chosen_path && (
        <p className="text-[11px] text-center text-[hsl(var(--fg-3))]">{t('onboarding.page.selectOption')}</p>
      )}
    </div>
  );
}

// ─── Paywall priming screen (transcript 2 playbook) ───────────────────────────
// Shows BEFORE the actual setup generation. Builds trust, explains the trial,
// and primes users toward the annual plan without hard-selling.

function PaywallPrimingScreen({ onContinue, t }) {
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
        <h2 className="text-[20px] font-bold tracking-tight mb-1">{t('onboarding.page.paywall.title')}</h2>
        <p className="text-[13px] text-[hsl(var(--fg-2))] leading-relaxed">{t('onboarding.page.paywall.subtitle')}</p>
      </div>

      {/* Trial timeline */}
      <div className="space-y-2">
        {[
          { day: t('onboarding.page.paywall.todayLabel'), title: t('onboarding.page.paywall.todayTitle'), desc: t('onboarding.page.paywall.todayDesc'), icon: '🚀', highlight: true },
          { day: t('onboarding.page.paywall.day5Label'), title: t('onboarding.page.paywall.day5Title'), desc: t('onboarding.page.paywall.day5Desc'), icon: '📧', highlight: false },
          { day: t('onboarding.page.paywall.day7Label'), title: t('onboarding.page.paywall.day7Title'), desc: t('onboarding.page.paywall.day7Desc'), icon: '⏰', highlight: false },
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
            <p className="text-[12px] font-semibold text-[hsl(var(--fg))] leading-snug">{t('onboarding.page.paywall.annualTitle')}</p>
            <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5">{t('onboarding.page.paywall.annualDesc')}</p>
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
            {t('onboarding.page.paywall.socialProof')}
          </span>
        </div>
        <p className="text-[12px] text-[hsl(var(--fg-2))] italic leading-relaxed">
          {t('onboarding.page.paywall.testimonial')}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="atlas-button atlas-button-primary w-full h-12 rounded-2xl text-[14px] gap-2"
      >
        {t('onboarding.page.paywall.cta')} <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </button>

      <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
        {t('onboarding.page.paywall.noCreditCard')}
      </p>
    </motion.div>
  );
}

// ─── Setup generation ─────────────────────────────────────────────────────────

function SetupGenerationScreen({ onDone, t }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const messages = [t('onboarding.page.setup.msg1'), t('onboarding.page.setup.msg2'), t('onboarding.page.setup.msg3'), t('onboarding.page.setup.msg4')];

  useEffect(() => {
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      if (i < messages.length - 1) {
        setMsgIdx(i);
      } else {
        setMsgIdx(messages.length - 1);
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
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
        {!done && (
          <p className="text-[12px] text-[hsl(var(--fg-2))]">{t('onboarding.page.setup.settingUp')}</p>
        )}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button onClick={onDone} className="atlas-button atlas-button-primary h-12 px-8 rounded-2xl text-[14px] gap-2">
            <ArrowRight className="w-4 h-4" strokeWidth={2} /> {t('onboarding.page.success.enterApp')}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ chosenPath, onDone, t }) {
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
        <h2 className="text-[24px] font-bold">{t('onboarding.page.success.title')}</h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-xs mx-auto">
          {isFresh ? t('onboarding.page.success.freshMessage') : t('onboarding.page.success.ownMessage')}
        </p>
      </motion.div>

      {isFresh && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] p-4 text-left space-y-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
            {t('onboarding.page.success.focusTitle')}
          </p>
          {[
            { icon: UtensilsCrossed, text: t('onboarding.page.success.focusItem1') },
            { icon: Dumbbell, text: t('onboarding.page.success.focusItem2') },
            { icon: Scale, text: t('onboarding.page.success.focusItem3') },
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
        className="atlas-button atlas-button-primary w-full h-12 rounded-2xl text-[14px] gap-2 mt-2"
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
  const { t } = useI18n();
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
      console.log('[Onboarding] save confirmed — DB + localStorage + profile_data written');
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
    console.log('[Onboarding] handleSuccessDone — revalidating session');
    try { await revalidateSession(); } catch { /* non-fatal */ }
    console.log('[Onboarding] navigating to app');
    navigate(ROLE_HOME[user?.atlas_role] || ROUTES.today, { replace: true });
  };

  const stepContent = () => {
    switch (step) {
      case 0: return <StepWelcome t={t} />;
      case 1: return <StepProfileAndGoals form={form} set={set} toggle={toggle} t={t} />;
      case 2: return <StepFirstCheckpoint form={form} set={set} t={t} />;
      case 3: return <StepPathChoice form={form} set={set} t={t} />;
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
            <div className="atlas-card rounded-[22px] p-6">
              <PaywallPrimingScreen onContinue={handlePrimingContinue} t={t} />
            </div>
          </>
        )}

        {/* ── Setup generation screen ── */}
        {!showPaywallPriming && showGeneration && (
          <>
            <Logo />
            <div className="atlas-card rounded-[22px] p-8">
              <SetupGenerationScreen onDone={handleGenerationDone} t={t} />
            </div>
          </>
        )}

        {/* ── Success screen ── */}
        {!showPaywallPriming && !showGeneration && showSuccess && (
          <>
            <Logo />
            <div className="atlas-card rounded-[22px] p-8">
              <SuccessScreen chosenPath={form.chosen_path} onDone={handleSuccessDone} t={t} />
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
            <StepDots step={step} total={TOTAL_STEPS} t={t} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="atlas-card mb-4 rounded-[22px] p-6"
              >
                {stepContent()}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="atlas-button atlas-button-secondary h-11 rounded-[12px] px-4"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canContinue()}
                  className="atlas-button atlas-button-primary flex-1 h-11 rounded-[12px] text-[14px] gap-1"
                >
                  {t('onboarding.page.continue')} <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving || !canContinue()}
                  className="atlas-button atlas-button-primary flex-1 h-11 rounded-[12px] text-[14px] gap-1.5"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Zap className="w-4 h-4" strokeWidth={2} /> {t('onboarding.page.setUp')}</>
                  }
                </button>
              )}
            </div>

            {step === 0 && (
              <p className="text-center text-[11px] text-[hsl(var(--fg-2))] mt-4">
                {t('onboarding.page.termsNotice')}{' '}
                <span className="underline cursor-pointer">{t('onboarding.page.termsLink')}</span>.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
