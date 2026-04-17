/**
 * Day1Banner — Personalized day-1 experience for TodayV2.
 *
 * Renders when the user completed onboarding V2 less than 24 hours ago.
 * Shows their plan headline, 3 concrete action cards, and a coach message
 * referencing their biggest blocker from the quiz.
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Dumbbell, Scale, Check, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

// ─── Goal label mapping ──────────────────────────────────────────────────────

const GOAL_LABELS = {
  fat_loss: 'lose fat',
  muscle_gain: 'build muscle',
  recomp: 'recomp',
  energy_health: 'improve your health',
  event_prep: 'get event-ready',
  performance: 'perform better',
  health: 'get healthier',
  longevity: 'build longevity',
};

const BLOCKER_MESSAGES = {
  no_time: "You said time is your biggest constraint. Your plan is built around sessions you can actually fit in — no 90-minute gym days.",
  lose_motivation: "You said motivation fades. That's why we track consistency, not perfection. Show up 3 times this week — that's the only target.",
  weekends: "You said weekends undo your weekdays. We'll keep Saturday and Sunday simple — one protein target, one walk.",
  dont_know_working: "You said you never know if what you're doing is working. That changes today. Every metric you log builds the picture.",
  chaotic_schedule: "You said your schedule is chaotic. Your plan flexes with you — miss a day, the week still works.",
  plateau: "You said plateaus kill your momentum. We'll catch them early with weekly trends and adjust before you stall.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

// ─── Action Card ─────────────────────────────────────────────────────────────

function ActionCard({ icon: Icon, title, done, onClick, to }) {
  const Wrapper = to ? Link : 'button';
  const wrapperProps = to ? { to } : { type: 'button', onClick };

  return (
    <Wrapper
      {...wrapperProps}
      className={`flex items-center gap-3.5 rounded-[14px] border px-4 py-3.5 transition-colors ${
        done
          ? 'border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.06)]'
          : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] active:bg-[hsl(var(--fill))]'
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${
        done
          ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
          : 'bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))]'
      }`}>
        {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" strokeWidth={1.8} />}
      </div>
      <span className={`text-[14px] font-medium ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'}`}>
        {title}
      </span>
    </Wrapper>
  );
}

// ─── Main Banner ─────────────────────────────────────────────────────────────

export default function Day1Banner({ profile, daily, onOpenCheckin, onOpenQuickMeal }) {
  const goalLabel = useMemo(() => {
    const primaryGoal = profile?.health_goals?.[0];
    return GOAL_LABELS[primaryGoal] || 'reach your goal';
  }, [profile?.health_goals]);

  const blockerMessage = useMemo(() => {
    return BLOCKER_MESSAGES[profile?.biggest_blocker] || null;
  }, [profile?.biggest_blocker]);

  const weeks = profile?.plan_duration_weeks;
  const targetDate = formatDate(profile?.target_date);

  return (
    <div className="space-y-4">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[18px] border border-[hsl(var(--brand)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.08)] to-[hsl(var(--brand)/0.02)] p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand))]">
          Day 1{weeks ? ` of ${weeks} weeks` : ''}
        </p>
        <h2 className="mt-1 text-[20px] font-bold leading-tight tracking-[-0.02em] text-[hsl(var(--fg))]">
          Your plan to {goalLabel}{targetDate ? ` by ${targetDate}` : ''} starts now.
        </h2>
      </motion.div>

      {/* Action cards */}
      <div className="space-y-2.5">
        <ActionCard
          icon={UtensilsCrossed}
          title="Log your first meal"
          done={daily?.nutritionLogged}
          onClick={onOpenQuickMeal}
        />
        <ActionCard
          icon={Dumbbell}
          title="Start today's workout"
          done={daily?.workoutDone}
          to={ROUTES.workouts}
        />
        <ActionCard
          icon={Scale}
          title="Record your weight"
          done={daily?.weightLogged}
          onClick={onOpenCheckin}
        />
      </div>

      {/* Coach blocker message */}
      {blockerMessage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[16px] border border-[hsl(var(--brand-ai)/0.2)] bg-[hsl(var(--brand-ai)/0.04)] p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand-ai)/0.12)]">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
            </div>
            <span className="text-[12px] font-semibold text-[hsl(var(--brand-ai))]">Your coach</span>
          </div>
          <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
            {blockerMessage}
          </p>
        </motion.div>
      )}

      {/* Motivations */}
      {profile?.motivations?.length > 0 && (
        <p className="px-1 text-[13px] text-[hsl(var(--fg-3))]">
          What you're working toward: {profile.motivations.map(m => m.replace(/_/g, ' ')).join(', ')}
        </p>
      )}
    </div>
  );
}

/**
 * Check if the user should see the Day 1 banner.
 * Call this in TodayV2 to conditionally render Day1Banner.
 */
export function isDay1User(profileData) {
  if (!profileData?.onboarded_at || profileData?.onboarding_version < 2) return false;
  const hoursSince = (Date.now() - new Date(profileData.onboarded_at).getTime()) / (1000 * 60 * 60);
  return hoursSince < 24;
}
