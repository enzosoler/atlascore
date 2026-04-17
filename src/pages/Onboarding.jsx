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
  ArrowRight,
  Zap,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { cn } from '@/lib/utils';
import { tapLight } from '@/lib/haptics';
import { trackProductEvent } from '@/lib/productEvents';
import { trackOnboardingCompleted } from '@/lib/analytics';

// ─── Config ───────────────────────────────────────────────────────────────────

const GOAL_IDS = ['fat_loss', 'muscle_gain', 'recomp', 'performance', 'health', 'longevity'];
const GOAL_EMOJIS = { fat_loss: '🔥', muscle_gain: '💪', recomp: '⚡', performance: '🏆', health: '❤️', longevity: '🌱' };
const ACTIVITY_LEVEL_IDS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const HEAR_ABOUT_US_IDS = ['instagram', 'youtube', 'google', 'indication', 'coach', 'other'];
const STEP_TITLES = ['Your baseline', 'Choose your path'];

const TOTAL_STEPS = 2; // 0=profile+goals+checkpoint(merged), 1=path choice

const INITIAL_FORM = {
  sex: 'male',
  age: '',
  height: '',
  current_weight: '',
  target_weight: '',
  health_goals: [],
  activity_level: 'moderate',
  hear_about_us: '',          // remarketing data
  // Checkpoint measurements (inline in step 0)
  checkpoint_weight: '',
  checkpoint_body_fat: '',
  checkpoint_waist: '',
  // Step 1 — path
  chosen_path: '', // 'fresh' | 'own'
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <AtlasCoreLogoSVG width={44} height={22} className="shrink-0" />
      <span className="text-[15px] font-bold tracking-[-0.02em]">
        <span className="text-[hsl(var(--accent-primary))]">atlas</span>
        <span className="text-[hsl(var(--fg))]">.core</span>
      </span>
    </div>
  );
}

function StepDots({ step, total }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
          Step {step + 1} of {total}
        </span>
        <span className="font-medium text-[hsl(var(--fg-2))]">
          {STEP_TITLES[step] || 'Continue'}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[hsl(var(--border))]">
        <motion.div
          className="h-full rounded-full bg-[hsl(var(--brand))]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function GoalChip({ selected, onClick, emoji, label }) {
  return (
    <button
      onClick={() => { tapLight(); onClick(); }}
      className={cn(
        'flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all text-center min-h-[76px] active:scale-[0.95]',
        selected
          ? 'bg-[hsl(var(--brand)/0.12)] border border-[hsl(var(--brand))] text-[hsl(var(--brand))]'
          : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))]'
      )}
    >
      <span className="text-[22px] leading-none">{emoji}</span>
      <span className={cn(
        'text-[11px] font-semibold leading-tight',
        selected ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-2))]'
      )}>
        {label}
      </span>
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[13px] font-medium text-[hsl(var(--fg-2))]">
      {children}
    </label>
  );
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function StepProfileAndGoals({ form, set, toggle, t }) {
  return (
    <div className="space-y-5">
      {/* Welcome header (replaces separate welcome screen) */}
      <div className="text-center space-y-1 pb-1">
        <h2 className="text-[22px] font-bold tracking-[-0.02em]">
          {t('onboarding.page.welcomeTitle')}{' '}
          <span className="text-[hsl(var(--accent-primary))]">atlas</span>
          <span className="text-[hsl(var(--fg))]">.core</span>
        </h2>
        <p className="text-[13px] text-[hsl(var(--fg-2))] leading-relaxed">
          {t('onboarding.page.welcomeSubtitle')}
        </p>
      </div>

      <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-4 space-y-3">
        <h2 className="text-[18px] font-bold mb-1">{t('onboarding.page.goalTitle')}</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">{t('onboarding.page.goalSubtitle')}</p>
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
      </div>

      <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-4 space-y-3">
        <p className="atlas-overline">{t('onboarding.page.basicProfile')}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>{t('onboarding.page.heightLabel')}</FieldLabel>
            <Input
              type="number"
              min="50"
              max="280"
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
              min="20"
              max="500"
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
              min="1"
              max="120"
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
              min="20"
              max="500"
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

      {/* ── Starting measurements (optional, merged from old checkpoint step) ── */}
      <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-4 space-y-3">
        <p className="atlas-overline">
          {t('onboarding.page.startingMeasurements')} <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal">{t('onboarding.page.optional')}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>
              {t('onboarding.page.checkpointBodyFatLabel')}
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="70"
              value={form.checkpoint_body_fat}
              onChange={(e) => set('checkpoint_body_fat', e.target.value)}
              placeholder="18"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
          <div>
            <FieldLabel>
              {t('onboarding.page.checkpointWaistLabel')}
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              min="30"
              max="200"
              value={form.checkpoint_waist}
              onChange={(e) => set('checkpoint_waist', e.target.value)}
              placeholder="80"
              className="atlas-field h-11 rounded-[12px] border-0 px-4 text-base"
            />
          </div>
        </div>
      </div>

      {/* ── Remarketing — "hear about us" is the last field (not a blocker) ── */}
      <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-4 space-y-2.5">
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

function PathCard({ selected, onClick, icon: Icon, title, desc, items }) {
  return (
    <button
      onClick={() => { tapLight(); onClick(); }}
      className={cn(
        'w-full text-left p-4 rounded-2xl transition-all space-y-3 active:scale-[0.98]',
        selected
          ? 'bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand))]'
          : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))]'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          selected ? 'bg-[hsl(var(--brand)/0.12)]' : 'bg-[hsl(var(--card))]'
        )}>
          <Icon className={cn('w-4 h-4', selected ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-2))]')} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))] leading-snug">{title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <div className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all',
          selected ? 'bg-[hsl(var(--brand))]' : 'border border-[hsl(var(--border))]'
        )}>
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

function PaywallPrimingScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 py-2"
    >
      <div className="text-center space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
          What happens next
        </p>
        <h2 className="text-[24px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
          Your setup is ready.
        </h2>
        <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
          We’ll build your baseline, generate your first week, and open Atlas with a plan that matches the answers you just gave.
        </p>
      </div>

      <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.7)] p-4">
        {[
          {day: 'Save your baseline', desc: 'We store your profile and measurements so the plan starts from reality.', active: true },
          {day: 'Generate your setup', desc: 'Atlas calculates your targets and milestones from your answers.', active: false },
          {day: 'Open the app', desc: 'You land on your first week with the right starting context.', active: false },
        ].map(({ day, desc, active }) => (
          <div key={day} className="flex gap-3.5 py-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-2 h-2 rounded-full shrink-0 mt-1.5',
                active ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--border-h))]'
              )} />
              {idx < 2 && <div className="w-px flex-1 bg-[hsl(var(--border-h))] mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                active ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'
              )}>{day}</span>
              <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[18px] bg-[hsl(var(--fill)/0.5)] border border-[hsl(var(--border)/0.5)] p-4 space-y-2">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">What you’ll get right away</p>
        <div className="space-y-1.5 text-[12px] leading-relaxed text-[hsl(var(--fg-2))]">
          <p>• A calorie target based on your current weight and goal.</p>
          <p>• A plan path based on the goal you picked.</p>
          <p>• A first checkpoint so progress starts with a real baseline.</p>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">No billing surprises here</p>
        <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">
          You can review everything before you move on. If anything fails to save, we’ll keep you on this step.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="atlas-button atlas-button-primary w-full h-12 rounded-2xl text-[14px] gap-2"
      >
        Continue <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </button>

      <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
        You can change your inputs later from your profile.
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
    <div className="text-center py-10 space-y-8">
      <div className="flex items-center justify-center">
        {done
          ? <div className="w-12 h-12 rounded-full bg-[hsl(var(--ok)/0.08)] flex items-center justify-center">
              <Check className="w-6 h-6 text-[hsl(var(--ok))]" strokeWidth={2} />
            </div>
          : <Loader2 className="w-8 h-8 text-[hsl(var(--fg-3))] animate-spin" strokeWidth={1.5} />
        }
      </div>

      <div className="space-y-2 min-h-[48px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[15px] font-semibold text-[hsl(var(--fg))]"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
        {!done && (
          <p className="text-[12px] text-[hsl(var(--fg-3))]">{t('onboarding.page.setup.settingUp')}</p>
        )}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <button onClick={onDone} className="atlas-button atlas-button-primary h-12 px-8 rounded-2xl text-[14px] gap-2">
            {t('onboarding.page.success.enterApp')} <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ chosenPath, onDone, t }) {
  useEffect(() => {
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  }, []);

  const isFresh = chosenPath === 'fresh';

  return (
    <div className="text-center py-6 space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="w-16 h-16 rounded-full bg-[hsl(var(--ok)/0.08)] flex items-center justify-center mx-auto"
      >
        <Check className="w-8 h-8 text-[hsl(var(--ok))]" strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="text-[24px] font-bold tracking-tight">{t('onboarding.page.success.title')}</h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-[260px] mx-auto">
          {isFresh ? t('onboarding.page.success.freshMessage') : t('onboarding.page.success.ownMessage')}
        </p>
      </motion.div>

      {isFresh && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-left space-y-2.5 pt-2"
        >
          {[
            { icon: UtensilsCrossed, text: t('onboarding.page.success.focusItem1') },
            { icon: Dumbbell, text: t('onboarding.page.success.focusItem2') },
            { icon: Scale, text: t('onboarding.page.success.focusItem3') },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-[13px] text-[hsl(var(--fg-2))]">
              <Icon className="w-4 h-4 text-[hsl(var(--fg-3))] shrink-0" strokeWidth={1.8} />
              {text}
            </div>
          ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        onClick={onDone}
        className="atlas-button atlas-button-primary w-full h-12 rounded-2xl text-[14px] gap-2 mt-2"
      >
        {t('onboarding.page.success.enterApp')} <ArrowRight className="w-4 h-4" strokeWidth={2} />
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
  const [saveError, setSaveError] = useState(null);
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
    if (step === 0) return form.health_goals.length > 0 && form.height && form.current_weight && form.age;
    if (step === 1) return !!form.chosen_path;
    return true;
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  const saveAndFinish = async () => {
    if (!isAuthenticated || !user) { navigate(ROUTES.home, { replace: true }); return false; }
    setSaving(true);
    setSaveError(null);
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

      // Fire-and-forget activation event
      trackOnboardingCompleted({
        goals: form.health_goals,
        path: form.chosen_path,
      });
      trackProductEvent(user.id, 'onboarding_completed', {
        goals: form.health_goals,
        path: form.chosen_path,
        hear_about_us: form.hear_about_us || null,
      });
      return true;
    } catch (err) {
      console.error('[Onboarding] Save failed:', err);
      setSaveError(t('onboarding.page.saveError') || 'We could not save your setup. Check your connection and try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Last step finish → save → show paywall priming
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
      case 0: return <StepProfileAndGoals form={form} set={set} toggle={toggle} t={t} />;
      case 1: return <StepPathChoice form={form} set={set} t={t} />;
      default: return null;
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))] p-5">
      <div className="w-full max-w-md">

        {/* ── Paywall priming screen ── */}
        {showPaywallPriming && (
          <>
            <Logo />
            <div className="atlas-card rounded-[22px] p-6">
              <PaywallPrimingScreen onContinue={handlePrimingContinue} />
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
            <Logo />
            <StepDots step={step} total={TOTAL_STEPS} />

            <div className="atlas-card rounded-[22px] p-6 mb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -16, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {stepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {saveError && (
              <div className="mb-4 rounded-[16px] border border-[hsl(var(--err)/0.25)] bg-[hsl(var(--err)/0.08)] px-4 py-3 text-[13px] leading-relaxed text-[hsl(var(--err))]">
                {saveError}
              </div>
            )}

            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-[hsl(var(--fill)/0.8)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canContinue()}
                  className="atlas-button atlas-button-primary flex-1 h-11 rounded-xl text-[14px] gap-1"
                >
                  {t('onboarding.page.continue')} <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving || !canContinue()}
                  className="atlas-button atlas-button-primary flex-1 h-11 rounded-xl text-[14px] gap-1.5"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Zap className="w-4 h-4" strokeWidth={2} /> {t('onboarding.page.setUp')}</>
                  }
                </button>
              )}
            </div>

            {step === 0 && (
              <p className="text-center text-[11px] text-[hsl(var(--fg-3))] mt-4">
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
