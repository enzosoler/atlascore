/**
 * TodayV2 — High-end iPhone experience.
 * Original design preserved. New plan features layered on top:
 * streak pill, chain dots, proactive AI card, adaptive greeting, milestones.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Dumbbell, UtensilsCrossed, Scale, Target, Camera,
  ArrowRight, Sparkles, ChevronRight, X, MessageSquareMore,
  Activity, CalendarDays, Flame, Clock3
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { buildBriefing, buildRecommendations, buildDailyStatus } from '@/lib/rulesEngine';
import { ROUTES } from '@/lib/routes';
import { TodayScreen } from '@/components/today/TodayMobileUI';
import { AICoachBriefing } from '@/components/today/AICoachBriefing';
import WeeklySummary from '@/components/today/WeeklySummary';
import BodyCheckinSheet from '@/components/body/BodyCheckinSheet';
import QuickMealSheet from '@/components/nutrition/QuickMealSheet';
import CoachChatTrigger from '@/components/ai/CoachChatTrigger';
import CoachChatSheet from '@/components/ai/CoachChatSheet';
import { useCoachChat } from '@/hooks/useCoachChat';
import PaywallTrigger from '@/components/entitlements/PaywallTrigger';
import { useSubscription } from '@/lib/SubscriptionContext';
import { getDailyCheckin, listDailyCheckins } from '@/services/checkinService';
import { getToday } from '@/lib/atlas-theme';
import { supabase } from '@/lib/supabaseClient';
import Day1Banner, { isDay1User } from '@/components/today/Day1Banner';
import ShareFlow, { isShareDismissed } from '@/components/social/ShareFlow';
import { SHARE_MILESTONES } from '@/components/social/StreakShareCard';
import { cn } from '@/lib/utils';
import { trackPurchaseCompleted } from '@/lib/analytics';
import { toast } from 'sonner';
import { DataState } from '@/components/shared/StablePage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateLabel(locale) {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());
}

function getFirstName(fullName) {
  if (!fullName) return '';
  const [first] = String(fullName).split(/[\s@._-]+/).filter(Boolean) || [];
  if (!first) return '';
  const clean = first.replace(/\d+$/u, '') || first;
  return `${clean.charAt(0).toLocaleUpperCase()}${clean.slice(1)}`;
}

function getGreeting(fullName, t) {
  const name = getFirstName(fullName) || t('common.athlete');
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('today.greeting.morning', { name });
  if (h >= 12 && h < 17) return t('today.greeting.afternoon', { name });
  if (h >= 17 && h < 21) return t('today.greeting.evening', { name });
  return t('today.greeting.late', { name });
}

function calcStreak(checkins = []) {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (sorted.some(c => c.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getStreakUrgency(todayCheckinExists) {
  if (todayCheckinExists) return 'done';
  const h = new Date().getHours();
  if (h >= 21) return 'urgent';
  if (h >= 17) return 'warming';
  return 'normal';
}

function getWeekDates() {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = (dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatRelativeAge(timestamp) {
  if (!timestamp) return 'Live now';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return 'Live now';
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function buildWeeklySegmentSummary(recentCheckins = [], todayCheckin = null) {
  const weekDates = getWeekDates();
  const checkinSet = new Set((recentCheckins || []).map((entry) => entry.date));
  return weekDates.map((date, index) => {
    const isToday = date === getToday();
    const hasCheckin = checkinSet.has(date);
    const isActive = hasCheckin || (isToday && !!todayCheckin);
    return {
      key: date,
      label: DAY_LABELS[index],
      value: isActive ? (isToday && todayCheckin ? 100 : 86) : 0,
      note: hasCheckin ? 'Checked in' : isToday ? 'Today' : 'Open',
    };
  });
}

// ─── New plan components ─────────────────────────────────────────────────────

function StreakPill({ streak, urgency }) {
  if (streak < 1) return null;
  return (
    <div className={cn(
      'flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold transition-colors duration-300',
      urgency === 'done'    && 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
      urgency === 'normal'  && 'bg-[hsl(var(--fg-3)/0.12)] text-[hsl(var(--fg-3))]',
      urgency === 'warming' && 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
      urgency === 'urgent'  && 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] animate-pulse',
    )}>
      🔥 <span>{streak}</span>
    </div>
  );
}

function ChainDots({ checkinDates }) {
  const t = useT();
  const weekDates = getWeekDates();
  const checkinSet = new Set(checkinDates);
  const todayStr = getToday();

  return (
    <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-3">{t('today.this_week')}</p>
      <div className="flex items-center justify-between gap-1 px-1">
        {weekDates.map((date, i) => {
          const isDone = checkinSet.has(date);
          const isToday = date === todayStr;
          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200',
                isDone
                  ? 'bg-[hsl(var(--brand))] border-[hsl(var(--brand))]'
                  : isToday
                    ? 'border-[hsl(var(--brand)/0.5)] bg-transparent animate-pulse'
                    : 'border-[hsl(var(--border))] bg-transparent'
              )}>
                {isDone && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wide',
                isToday ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'
              )}>
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Original components (preserved) ─────────────────────────────────────────

function Header({ weather, greeting, locale, streak, streakUrgency, adaptiveSubtitle }) {
  return (
    <header className="flex items-end justify-between px-0.5">
      <div className="space-y-0.5">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-tight">
          {getDateLabel(locale)}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--fg))]">
          {greeting}
        </h1>
        {adaptiveSubtitle && (
          <p className="text-[13px] text-[hsl(var(--fg-3))] mt-0.5">{adaptiveSubtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <StreakPill streak={streak} urgency={streakUrgency} />
        {weather && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--fill)/0.4)] border border-[hsl(var(--border)/0.5)]">
            <span className="text-sm">{weather.icon}</span>
            <span className="text-[13px] font-semibold text-[hsl(var(--fg-2))]">{weather.temp}°</span>
          </div>
        )}
      </div>
    </header>
  );
}

function CircularProgress({ size = 56, strokeWidth = 5, pct, color, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--fill))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function MacroRingsCard({ nutrition, t }) {
  const { caloriesConsumed = 0, caloriesTarget = 0, proteinConsumed = 0, proteinTarget = 0, carbsConsumed = 0, carbsTarget = 0, fatConsumed = 0, fatTarget = 0 } = nutrition;
  const macros = [
    { key: 'cal', label: t('today.macros.calories') || 'Cal', consumed: Math.round(caloriesConsumed), target: caloriesTarget, unit: '', color: 'hsl(var(--fg))' },
    { key: 'protein', label: t('today.macros.protein') || 'Protein', consumed: Math.round(proteinConsumed), target: proteinTarget, unit: 'g', color: 'hsl(var(--brand))' },
    { key: 'carbs', label: t('today.macros.carbs') || 'Carbs', consumed: Math.round(carbsConsumed), target: carbsTarget, unit: 'g', color: 'hsl(var(--brand-ai))' },
    { key: 'fat', label: t('today.macros.fat') || 'Fat', consumed: Math.round(fatConsumed), target: fatTarget, unit: 'g', color: 'hsl(var(--warn))' },
  ];
  return (
    <Link to={ROUTES.nutrition} className="block">
      <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 active:bg-[hsl(var(--fill)/0.5)] transition-all">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-3">Macros</p>
        <div className="flex items-center justify-between px-1">
          {macros.map((m) => {
            const pct = m.target > 0 ? (m.consumed / m.target) * 100 : 0;
            return (
              <div key={m.key} className="flex flex-col items-center gap-1.5">
                <CircularProgress size={52} strokeWidth={4.5} pct={pct} color={m.color}>
                  <span className="text-[11px] font-bold text-[hsl(var(--fg))]">{m.consumed}{m.unit}</span>
                </CircularProgress>
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))]">{m.label}</p>
                  {m.target > 0 && <p className="text-[9px] text-[hsl(var(--fg-3))]">/ {m.target}{m.unit}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

function PrimaryAction({ action, briefingText, kcalRemaining, compact = false }) {
  const t = useT();
  if (!action) return null;

  if (compact) {
    return (
      <Link
        to={action.path}
        className="group flex items-center justify-between gap-3 rounded-[18px] border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--brand))_0%,hsl(var(--brand)/0.85)_100%)] px-4 py-3.5 text-white shadow-[0_12px_30px_hsl(var(--brand)/0.18)] transition-all active:scale-[0.98] active:brightness-95"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
            Next action
          </p>
          <p className="mt-1 text-[14px] font-semibold leading-5 tracking-[-0.02em]">
            {action.label}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-white/82 line-clamp-2">
            {briefingText}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[hsl(var(--brand))] shadow-lg transition-transform group-active:scale-95">
          <ArrowRight className="h-5 w-5" strokeWidth={3} />
        </div>
      </Link>
    );
  }

  return (
    <Link to={action.path} className="group block">
      <div className="relative overflow-hidden rounded-[24px] bg-zinc-950 dark:bg-white p-6 shadow-2xl transition-all duration-300 active:scale-[0.98] active:brightness-90">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.15)] dark:bg-[hsl(var(--brand)/0.08)] blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[hsl(var(--brand-ai)/0.1)] dark:bg-[hsl(var(--brand-ai)/0.05)] blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/50 dark:text-zinc-950/50">
                {action.label}
              </p>
            </div>
            <h2 className="text-[21px] font-bold leading-[1.15] tracking-tight text-white dark:text-zinc-950">
              {briefingText}
            </h2>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-zinc-950/5 border border-white/10 dark:border-zinc-950/10 backdrop-blur-md">
              <span className="text-[12px] font-bold text-white/90 dark:text-zinc-950/90">
                {kcalRemaining > 0 ? t('today.kcal_remaining', { n: kcalRemaining }) : t('today.daily_target_met')}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xl transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ to, onClick, icon: Icon, label, status, colorClass, onQuickAdd }) {
  const inner = (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 shadow-sm transition-all duration-200 active:bg-[hsl(var(--fill)/0.5)] active:scale-[0.96]">
      <div className="flex items-start justify-between">
        <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        {onQuickAdd && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(); }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))] active:scale-90 transition-transform"
            aria-label="Quick add"
          >
            <span className="text-[16px] font-bold leading-none">+</span>
          </button>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-[14px] font-bold text-[hsl(var(--fg))]">{label}</p>
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))]">{status}</p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="group block text-left w-full">
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} className="group block">
      {inner}
    </Link>
  );
}

function RecommendationCard({ rec }) {
  return (
    <Link to={rec.actionPath || '#'} className="block">
      <div className="flex items-center gap-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 shadow-sm active:bg-[hsl(var(--fill)/0.5)] transition-all">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[hsl(var(--fg))] truncate">{rec.title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))] line-clamp-1 mt-0.5">{rec.reason}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={2.5} />
      </div>
    </Link>
  );
}

function PriorityActionStrip({ actions }) {
  if (!actions?.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))]">Priority actions</h3>
        <span className="text-[11px] text-[hsl(var(--fg-3))]">Act first</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="rounded-[18px] border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--card)/0.9)] px-4 py-4 text-left shadow-[var(--shadow-xs)] transition-colors active:bg-[hsl(var(--fill)/0.6)]"
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-[14px]', action.colorClass)}>
                <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </div>
              <p className="mt-3 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{action.label}</p>
              <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{action.detail}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Trial Countdown ──────────────────────────────────────────────────────────

function TrialCountdown({ daysRemaining }) {
  const t = useT();
  if (!daysRemaining || daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 2;

  return (
    <Link to={ROUTES.pricing} className="block">
      <div className={cn(
        'rounded-[18px] border p-4 transition-all active:scale-[0.98]',
        isUrgent
          ? 'bg-[hsl(var(--warn)/0.08)] border-[hsl(var(--warn)/0.2)]'
          : 'bg-[hsl(var(--brand)/0.06)] border-[hsl(var(--brand)/0.15)]'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className={cn('h-4 w-4', isUrgent ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--brand))]')} strokeWidth={2} />
            <span className="text-[14px] font-bold text-[hsl(var(--fg))]">
              {t('today.trial.daysLeft', { count: daysRemaining })}
            </span>
          </div>
          <span className={cn(
            'text-[12px] font-semibold px-3 py-1 rounded-full',
            isUrgent
              ? 'bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]'
              : 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
          )}>
            {t('today.trial.seePlans')}
          </span>
        </div>
        <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1 ml-[26px]">
          {t('today.trial.subtitle')}
        </p>
      </div>
    </Link>
  );
}

// ─── Daily Status ─────────────────────────────────────────────────────────────

function DailyStatus({
  status,
  message,
  completedCount,
  totalCount,
  briefing,
  kcalRemaining,
  streak,
  streakUrgency,
  todayCheckin,
  primaryAction,
  onOpenChat,
}) {
  const t = useT();
  if (!status) return null;

  const statusConfig = {
    'on-track':        { bg: 'bg-[hsl(var(--ok)/0.08)]', border: 'border-[hsl(var(--ok)/0.2)]', dot: 'bg-[hsl(var(--ok))]', label: t('today.status.onTrack') },
    'neutral':         { bg: 'bg-[hsl(var(--fill)/0.5)]', border: 'border-[hsl(var(--border)/0.5)]', dot: 'bg-[hsl(var(--fg-3))]', label: t('today.status.gettingStarted') },
    'caution':         { bg: 'bg-[hsl(var(--warn)/0.08)]', border: 'border-[hsl(var(--warn)/0.2)]', dot: 'bg-[hsl(var(--warn))]', label: t('today.status.caution') },
    'needs-attention': { bg: 'bg-[hsl(var(--err)/0.08)]', border: 'border-[hsl(var(--err)/0.2)]', dot: 'bg-[hsl(var(--err))]', label: t('today.status.needsAttention') },
  };

  const cfg = statusConfig[status] || statusConfig['neutral'];
  const remaining = Math.max(0, kcalRemaining || 0);
  const detailPills = [
    { label: 'Completed', value: `${completedCount}/${totalCount}`, icon: Activity },
    { label: 'Fuel left', value: remaining > 0 ? `${remaining} kcal` : 'Done', icon: CalendarDays },
    streak > 0 ? { label: 'Streak', value: `${streak}d`, icon: Flame } : null,
  ].filter(Boolean);
  const detailGridClass = detailPills.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <section className="overflow-hidden rounded-[26px] border border-[hsl(var(--border)/0.55)] bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)/0.1),transparent_45%),linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.16)_100%)] shadow-[0_2px_24px_hsl(var(--brand)/0.04)]">
      <div className={cn('h-[2px]', status === 'needs-attention' ? 'bg-[hsl(var(--err))]' : status === 'caution' ? 'bg-[hsl(var(--warn))]' : 'bg-[hsl(var(--brand))]')} />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', cfg.dot)} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Daily status
              </p>
            </div>
            <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {cfg.label}
            </h2>
            <p className="max-w-[28rem] text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              {message}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
              Progress
            </p>
            <p className="mt-1 text-[28px] font-semibold tabular-nums tracking-[-0.06em] text-[hsl(var(--fg))]">
              {completedCount}/{totalCount}
            </p>
          </div>
        </div>

        {briefing?.text ? (
          <p className="text-[13px] leading-6 text-[hsl(var(--fg-3))]">
            {briefing.text}
          </p>
        ) : null}

        <div className={cn('grid gap-2.5', detailGridClass)}>
          {detailPills.map((pill) => {
            const Icon = pill.icon;
            return (
              <div key={`${pill.label}-${pill.value}`} className="rounded-[16px] border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--card)/0.7)] px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
                  <Icon className="h-3 w-3" strokeWidth={2.2} />
                  <span>{pill.label}</span>
                </div>
                <p className="mt-1 text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  {pill.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-2 sm:grid-cols-[1.3fr_0.7fr]">
          <PrimaryAction
            action={primaryAction}
            briefingText={briefing?.text || message}
            kcalRemaining={remaining}
            compact
          />

          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center justify-between gap-3 rounded-[18px] border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--card)/0.75)] px-4 py-3.5 text-left transition-colors active:bg-[hsl(var(--fill)/0.65)]"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
                Coach chat
              </p>
              <p className="mt-1 text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                Ask a follow-up
              </p>
              <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-3))]">
                Clarify the plan or ask for a swap.
              </p>
            </div>
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              streakUrgency === 'urgent' ? 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]' : 'bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]'
            )}>
              <MessageSquareMore className="h-4.5 w-4.5" strokeWidth={2.2} />
            </div>
          </button>
        </div>

        {todayCheckin ? (
          <div className="flex items-center gap-2 text-[12px] text-[hsl(var(--fg-3))]">
            <Clock3 className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>Built from today&apos;s check-in and training status.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProtocolsSummary({ protocols }) {
  const t = useT();
  if (!protocols || protocols.dueToday === 0) return null;

  return (
    <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
          {t('today.protocols.title')}
        </p>
        <span className="text-[11px] font-semibold text-[hsl(var(--fg-3))]">
          {protocols.completedToday}/{protocols.dueToday}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {protocols.activeCompounds.map((name, i) => {
          const isDone = i < protocols.completedToday;
          return (
            <Link key={name + i} to={ROUTES.protocols} className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors',
              isDone
                ? 'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
                : 'bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-3))]'
            )}>
              {isDone ? '✓' : '○'} {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const [weather, setWeather] = useState(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [quickMealOpen, setQuickMealOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [shareFlowOpen, setShareFlowOpen] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [streakCelebrationDismissed, setStreakCelebrationDismissed] = useState(false);

  const { trialDaysRemaining, subscription } = useSubscription();
  const queryClient = useQueryClient();

  // Activate subscription after Stripe redirect.
  // The stripe-webhook is the source of truth in production, but because the
  // webhook signing secret can drift (see docs/LAUNCH_OPS.md §5), we call the
  // complete-checkout edge function here as a redundant activation path.
  // Both paths upsert the same row keyed on user_id, so running both is safe.
  useEffect(() => {
    if (searchParams.get('subscribed') !== '1') return;

    const sessionId = searchParams.get('session_id');

    // Always fire analytics + clear the query params immediately so the URL
    // doesn't retain sensitive-looking data even if activation fails.
    trackPurchaseCompleted({ source: 'stripe_redirect' });
    searchParams.delete('subscribed');
    searchParams.delete('session_id');
    setSearchParams(searchParams, { replace: true });

    if (!sessionId) {
      // No session_id means this redirect came from an older build or a
      // manually-constructed URL. The webhook will still cover it when
      // working; log so we notice if it becomes common.
      console.warn('[TodayV2] ?subscribed=1 without session_id; skipping complete-checkout');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('complete-checkout', {
          body: { session_id: sessionId },
        });
        if (cancelled) return;
        if (error) {
          console.error('[TodayV2] complete-checkout failed', error);
          // Don't surface the raw error — the webhook may still activate them
          // within a few seconds. Invalidate the subscription query so the UI
          // picks up the new state whichever path wrote it.
          toast.message('Finalizing your subscription…');
        } else if (data?.success) {
          console.log('[TodayV2] Subscription activated', data);
          toast.success('Subscription activated');
        }
      } catch (err) {
        if (!cancelled) console.error('[TodayV2] complete-checkout threw', err);
      } finally {
        // Whether the direct call succeeded or the webhook is doing the work,
        // refetch subscription state so gated features unlock promptly.
        queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
      }
    })();

    return () => { cancelled = true; };
   
  }, []);
  const today = getToday();
  const uid = user?.id;

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current=temperature_2m,weather_code`
        );
        if (res.ok) {
          const json = await res.json();
          const temp = Math.round(json.current?.temperature_2m ?? 0);
          const code = json.current?.weather_code ?? 0;
          let icon = '☀️';
          if (code > 0 && code <= 3) icon = '⛅';
          else if (code > 3 && code <= 48) icon = '🌫️';
          else if (code > 48) icon = '🌧️';
          setWeather({ temp, icon });
        }
      } catch (e) { console.error(e); }
    }, null, { timeout: 6000, maximumAge: 600000 });
  }, []);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: uid });
  const coach = useCoachChat({
    invalidateAfterAction: daily?.invalidateAfterAction,
    activePlan: daily?.activePlan,
  });

  const safeDaily = daily || {};
  const safePlan = safeDaily?.plan || {};
  const safeNutrition = safeDaily?.nutrition || {};
  const kcalRemaining = Math.max(0, (safeNutrition.caloriesTarget || 0) - (safeNutrition.caloriesConsumed || 0));
  const nutritionMode = safeDaily?.nutritionMode || safeDaily?.profile?.nutrition_mode || 'macros_only';

  // ── Check-in data (moved up so recommendations can use energy/mood) ──
  const { data: todayCheckin } = useQuery({
    queryKey: ['daily-checkin', uid, today],
    queryFn: () => getDailyCheckin(uid, today),
    enabled: !!uid,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ['daily-checkins-streak', uid],
    queryFn: () => listDailyCheckins(uid, { limit: 35 }),
    enabled: !!uid,
    staleTime: 60_000,
  });

  const { data: coachMemory } = useQuery({
    queryKey: ['coach-memory-insight', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('coach_memory')
        .select('proactive_insight, proactive_insight_generated_at')
        .eq('user_id', uid)
        .maybeSingle();
      return data;
    },
    enabled: !!uid,
    staleTime: 120_000,
    refetchOnWindowFocus: true,
  });

  // ── AI-first briefing — use AI engine when available, rules as fallback ──
  const rulesBriefing = buildBriefing({
    workoutDone: safeDaily.workoutDone,
    nutritionLogged: safeDaily.nutritionLogged,
    hasActivePlan: safePlan.id != null,
    planName: safePlan.name,
    preferredName: safeDaily.preferredName,
    kcalRemaining,
    t,
  });

  const briefing = useMemo(() => {
    if (ai.hasData && ai.briefing) {
      return {
        text: ai.briefing.message || ai.briefing.text || rulesBriefing.text,
        focus: ai.briefing.focus || rulesBriefing.focus,
        primaryAction: rulesBriefing.primaryAction,
        secondaryAction: rulesBriefing.secondaryAction,
      };
    }
    return rulesBriefing;
  }, [ai.hasData, ai.briefing, rulesBriefing]);

  // ── AI-first recommendations ──
  const rulesRecs = buildRecommendations({
    workoutDone: safeDaily.workoutDone,
    hasActivePlan: safePlan.id != null,
    proteinConsumed: safeNutrition.proteinConsumed || 0,
    proteinTarget: safeNutrition.proteinTarget || 0,
    weightLogged: safeDaily.weightLogged,
    hasPhotos: false,
    protocolsDue: safeDaily.protocols?.dueToday || 0,
    protocolsComplete: safeDaily.protocols?.completedToday || 0,
    caloriesConsumed: safeNutrition.caloriesConsumed || 0,
    caloriesTarget: safeNutrition.caloriesTarget || 0,
    weekWorkoutCount: safeDaily.weekWorkoutCount || 0,
    energy: todayCheckin?.energy ?? null,
    mood: todayCheckin?.mood ?? null,
    t,
  }) || [];

  const recs = useMemo(() => {
    if (ai.hasData && ai.recommendations?.length > 0) {
      return ai.recommendations.slice(0, 3);
    }
    return rulesRecs;
  }, [ai.hasData, ai.recommendations, rulesRecs]);

  // ── Daily status (on-track / caution / needs-attention) ──
  const dailyStatus = buildDailyStatus({
    workoutDone: safeDaily.workoutDone,
    nutritionLogged: safeDaily.nutritionLogged,
    weightLogged: safeDaily.weightLogged,
    protocolsDue: safeDaily.protocols?.dueToday || 0,
    protocolsComplete: safeDaily.protocols?.completedToday || 0,
    t,
  });

  const calculatedStreak = useMemo(() => calcStreak(recentCheckins), [recentCheckins]);
  const streak = daily.workoutStreak ?? calculatedStreak;
  const checkinDates = useMemo(() => recentCheckins.map(c => c.date), [recentCheckins]);
  const hasCheckin = !!todayCheckin;
  const streakUrgency = getStreakUrgency(hasCheckin);

  // Adaptive subtitle
  const adaptiveSubtitle = useMemo(() => {
    if (!todayCheckin) return null;
    if (todayCheckin.energy && todayCheckin.energy <= 2) return t('today.subtitle_low_energy');
    if (todayCheckin.energy && todayCheckin.energy >= 4) return t('today.subtitle_high_energy');
    if (todayCheckin.mood && todayCheckin.mood <= 2) return t('today.subtitle_rough_day');
    return null;
  }, [todayCheckin, t]);

  const weeklySegments = useMemo(
    () => buildWeeklySegmentSummary(recentCheckins, todayCheckin),
    [recentCheckins, todayCheckin]
  );
  const weekDateSet = useMemo(() => new Set(getWeekDates()), []);
  const weekCheckinCount = useMemo(
    () => recentCheckins.filter((checkin) => weekDateSet.has(checkin.date)).length,
    [recentCheckins, weekDateSet]
  );
  const weeklySummaryText = useMemo(() => {
    const workouts = safeDaily.weekWorkoutCount || 0;
    const checkins = weekCheckinCount;
    return `${workouts} workouts · ${checkins}/7 check-ins`;
  }, [safeDaily.weekWorkoutCount, weekCheckinCount]);
  const weeklyNarrative = useMemo(() => {
    const workouts = safeDaily.weekWorkoutCount || 0;
    const checkins = weekCheckinCount;
    const hasLowEnergy = todayCheckin?.energy != null && todayCheckin.energy <= 2;
    if (hasLowEnergy) return 'Today reads as a recovery day. Keep the next step light and specific.';
    if (checkins >= 5 && workouts >= 4) return 'Strong week so far. Keep the rhythm and stay consistent through the weekend.';
    if (workouts > checkins) return 'Training is moving faster than tracking. A quick check-in will make the week easier to read.';
    if (checkins === 0 && workouts === 0) return 'The week is still open. One logged session makes the pattern easier to spot.';
    return 'Consistency is building. One steady day at a time keeps the trend readable.';
  }, [safeDaily.weekWorkoutCount, weekCheckinCount, todayCheckin?.energy]);
  const weeklyHighlights = useMemo(() => {
    const workouts = safeDaily.weekWorkoutCount || 0;
    return [
      { label: 'Workouts', value: String(workouts) },
      { label: 'Check-ins', value: `${weekCheckinCount}/7` },
      { label: 'Consistency', value: `${Math.min(100, Math.round((weekCheckinCount / 7) * 100))}%` },
    ];
  }, [safeDaily.weekWorkoutCount, weekCheckinCount]);

  // Proactive AI
  const proactiveMessage = useMemo(() => {
    const fromCoachMemory = coachMemory?.proactive_insight_generated_at
      ? coachMemory?.proactive_insight
      : null;
    return fromCoachMemory || ai?.briefing?.message || null;
  }, [coachMemory?.proactive_insight, coachMemory?.proactive_insight_generated_at, ai?.briefing?.message]);
  const proactiveReason = useMemo(() => {
    if (todayCheckin?.energy != null && todayCheckin.energy <= 2) return 'Triggered by a low-energy check-in';
    if (!safeDaily.workoutDone && safePlan.id) return 'Triggered by your open workout';
    if (!safeDaily.nutritionLogged && kcalRemaining > 0) return 'Triggered by remaining fuel';
    if ((safeDaily.protocols?.dueToday || 0) > (safeDaily.protocols?.completedToday || 0)) return 'Triggered by pending protocols';
    return 'Triggered by today’s state';
  }, [todayCheckin?.energy, safeDaily.workoutDone, safePlan.id, safeDaily.nutritionLogged, kcalRemaining, safeDaily.protocols?.dueToday, safeDaily.protocols?.completedToday]);
  const proactiveContext = briefing.focus || (safeDaily.workoutDone ? 'Recovery focus' : 'Execution focus');
  const proactiveFreshness = useMemo(() => {
    if (coachMemory?.proactive_insight_generated_at) {
      return `Updated ${formatRelativeAge(coachMemory.proactive_insight_generated_at)}`;
    }
    if (ai?.briefing?.message) {
      return 'Generated live';
    }
    return 'Fresh from today';
  }, [coachMemory?.proactive_insight_generated_at, ai?.briefing?.message]);
  const showAICard = !aiDismissed && !!proactiveMessage;

  // Milestones
  const MILESTONE_THRESHOLDS = [3, 7, 14, 30];
  const streakMilestone = MILESTONE_THRESHOLDS.includes(streak) ? streak : null;
  const showMilestone = !!streakMilestone && !streakCelebrationDismissed;

  // Share-flow milestones (7, 14, 30, 60, 100, 365)
  const isShareMilestone = SHARE_MILESTONES.includes(streak);
  const shareNotDismissed = isShareMilestone && !isShareDismissed(streak);
  useEffect(() => {
    if (shareNotDismissed && streak > 0) setShareFlowOpen(true);
  }, [shareNotDismissed, streak]);

  const priorityActions = useMemo(() => {
    const actions = [];
    if (!safeDaily.workoutDone) {
      actions.push({
        label: 'Start workout',
        detail: safePlan.id ? 'Open today’s training plan and log the session.' : 'Go to Workouts and create today’s session.',
        onClick: () => { window.location.href = ROUTES.workouts; },
        icon: Dumbbell,
        colorClass: 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]',
      });
    }
    if (!safeDaily.nutritionLogged) {
      actions.push({
        label: 'Log nutrition',
        detail: 'Capture meals or macros before the day gets harder to reconstruct.',
        onClick: () => setQuickMealOpen(true),
        icon: UtensilsCrossed,
        colorClass: 'bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]',
      });
    }
    if (!todayCheckin || !safeDaily.weightLogged) {
      actions.push({
        label: 'Record check-in',
        detail: 'Update weight and recovery so the dashboard reflects today, not yesterday.',
        onClick: () => setCheckinOpen(true),
        icon: Scale,
        colorClass: 'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]',
      });
    }
    if (!actions.length) {
      actions.push({
        label: 'Ask the coach',
        detail: 'You are on track. Use chat for a swap, adjustment, or deeper explanation.',
        onClick: () => setChatOpen(true),
        icon: MessageSquareMore,
        colorClass: 'bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]',
      });
    }
    return actions.slice(0, 3);
  }, [safeDaily.workoutDone, safeDaily.nutritionLogged, safeDaily.weightLogged, safePlan.id, todayCheckin]);

  if (daily?.isLoading) {
    return (
      <TodayScreen>
        <Header
          weather={weather}
          greeting={getGreeting(safeDaily.preferredName, t)}
          locale={locale}
          streak={streak}
          streakUrgency={streakUrgency}
          adaptiveSubtitle={adaptiveSubtitle}
        />
        <DataState
          variant="loading"
          eyebrow="Today"
          title="Building today’s dashboard"
          description="Atlas is loading your workout, nutrition, check-in, and plan context before showing the day summary."
          note="This prevents the dashboard from flashing fallback zeros that look like real data."
        />
      </TodayScreen>
    );
  }

  return (
    <TodayScreen>
      {/* 1. Header — with streak pill */}
      <Header
        weather={weather}
        greeting={getGreeting(safeDaily.preferredName, t)}
        locale={locale}
        streak={streak}
        streakUrgency={streakUrgency}
        adaptiveSubtitle={adaptiveSubtitle}
      />

      {ai.error ? (
        <DataState
          variant="error"
          eyebrow="Coach availability"
          title="Live coach insight is unavailable"
          description="The daily dashboard is still usable, but the proactive coach briefing could not be generated right now."
          primaryAction={(
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="atlas-button atlas-button-secondary"
            >
              Open coach chat
            </button>
          )}
          note="Atlas falls back to the rules-based daily summary until AI insight returns."
        />
      ) : null}

      {/* Day 1 Banner — personalized first-day experience (onboarding V2 users only) */}
      {isDay1User(safeDaily?.profile) ? (
        <Day1Banner
          profile={safeDaily.profile}
          daily={safeDaily}
          onOpenCheckin={() => setCheckinOpen(true)}
          onOpenQuickMeal={() => setQuickMealOpen(true)}
        />
      ) : (
        <>
          {/* 1b. Daily Status — dominant hero */}
          <DailyStatus
            status={dailyStatus.status}
            message={dailyStatus.message}
            completedCount={dailyStatus.completedCount}
            totalCount={dailyStatus.totalCount}
            briefing={briefing}
            kcalRemaining={kcalRemaining}
            streak={streak}
            streakUrgency={streakUrgency}
            todayCheckin={todayCheckin}
            primaryAction={briefing.primaryAction}
            onOpenChat={() => setChatOpen(true)}
          />

          {/* 1c. Trial countdown — only shows during active trial */}
          {subscription?.status === 'trialing' && trialDaysRemaining > 0 && (
            <TrialCountdown daysRemaining={trialDaysRemaining} />
          )}
        </>
      )}

      <PriorityActionStrip actions={priorityActions} />

      {/* NEW: Streak milestone celebration */}
      {showMilestone && (
        <div className="rounded-[18px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.2)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl atlas-streak-pulse inline-block">🔥</span>
              <p className="text-[15px] font-bold text-[hsl(var(--fg))]">
                <span className="atlas-odometer-flip">{streakMilestone}</span> days.{' '}
                {streakMilestone === 3 && t('today.streak_showed_up')}
                {streakMilestone === 7 && t('today.streak_one_week')}
                {streakMilestone === 14 && t('today.streak_two_weeks')}
                {streakMilestone === 30 && t('today.streak_one_month')}
              </p>
            </div>
            <button onClick={() => setStreakCelebrationDismissed(true)} className="text-[hsl(var(--fg-3))] p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NEW: Streak recovery */}
      {streak === 0 && recentCheckins.length > 0 && !hasCheckin && (
        <div className="rounded-[18px] bg-[hsl(var(--err)/0.06)] border border-[hsl(var(--err)/0.15)] p-4">
          <p className="text-[14px] text-[hsl(var(--fg))]">
            <span className="text-[hsl(var(--err))] font-semibold">{t('today.streak_reset')}</span>{' '}
            {t('today.streak_start_again')}
          </p>
        </div>
      )}

      {/* NEW: Streak paywall at 3 days */}
      {streak === 3 && <PaywallTrigger trigger="streak" show={streak >= 3} />}

      {/* 2. Proactive insight */}
      {showAICard && (
        <AICoachBriefing
          briefing={proactiveMessage}
          focus={proactiveContext}
          reason={proactiveReason}
          context={ai?.briefing?.focus || 'Derived from today’s status'}
          freshness={proactiveFreshness}
          primaryAction={briefing.primaryAction}
          secondaryAction={briefing.secondaryAction}
          onOpenChat={() => setChatOpen(true)}
          onDismiss={() => setAiDismissed(true)}
        />
      )}

      {/* 3. Weekly review */}
      <WeeklySummary
        label="Weekly review"
        summary={weeklySummaryText}
        narrative={weeklyNarrative}
        highlights={weeklyHighlights}
        segments={weeklySegments}
      />

      {/* Macro rings card (macros-only nutrition mode) */}
      {nutritionMode === 'macros_only' && (
        <MacroRingsCard nutrition={safeNutrition} t={t} />
      )}

      {/* 4. Coach Input */}
      <section className="space-y-4">
        <CoachChatTrigger
          onOpen={() => setChatOpen(true)}
          onSuggestion={(text) => { coach.sendMessage(text, 'today'); setChatOpen(true); }}
        />
      </section>

      {/* NEW: 7-day chain dots */}
      <ChainDots checkinDates={checkinDates} />

      {/* 3b. Protocol Summary — supplement/medication compliance */}
      <ProtocolsSummary protocols={safeDaily.protocols} />

      {/* 5. Quick Actions Grid (ORIGINAL — preserved) */}
      <section className="space-y-4">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">{t('today.focus_areas')}</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <QuickAction
            to={ROUTES.workouts}
            icon={Dumbbell}
            label={t('today.workout.label')}
            status={safeDaily.workoutDone ? t('today.completed') : t('today.start_now')}
            colorClass="bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]"
          />
          <QuickAction
            to={ROUTES.nutrition}
            icon={UtensilsCrossed}
            label={t('today.nutrition.label')}
            status={safeDaily.nutritionLogged ? t('today.tracked') : t('today.log_fuel')}
            colorClass="bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))]"
            onQuickAdd={() => setQuickMealOpen(true)}
          />
          <QuickAction
            onClick={() => setCheckinOpen(true)}
            icon={Scale}
            label={t('today.checkin.title')}
            status={safeDaily.weightLogged ? t('today.logged') : t('today.scale_weight')}
            colorClass="bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]"
          />
          <QuickAction
            to={ROUTES.goals}
            icon={Target}
            label={t('today.progress')}
            status={t('today.view_trends')}
            colorClass="bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]"
          />
          <QuickAction
            to={ROUTES.progressPhotos}
            icon={Camera}
            label={t('today.photos')}
            status={t('today.capture')}
            colorClass="bg-[hsl(var(--fg)/0.08)] text-[hsl(var(--fg))]"
          />
        </div>
      </section>

      {/* 6. Today's Plan Summary (ORIGINAL — preserved) */}
      {safePlan.id && !safeDaily.workoutDone && (
        <section className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">{t('today.upcoming')}</h3>
          <Link to={ROUTES.workouts} className="block">
            <div className="flex items-center gap-4 rounded-[18px] bg-[hsl(var(--fill)/0.3)] border border-[hsl(var(--border)/0.5)] p-4 active:bg-[hsl(var(--fill)/0.5)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <Dumbbell className="h-6 w-6 text-[hsl(var(--fg))]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[hsl(var(--fg))]">{safePlan.name}</p>
                <p className="text-[12px] font-medium text-[hsl(var(--fg-3))] mt-0.5">
                  {safePlan.todayExercises?.length || 0} {t('today.exercises')}
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[hsl(var(--fg))] text-white text-[12px] font-bold">
                {t('today.start')}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 7. Recommendations (ORIGINAL — preserved) */}
      {recs.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">{t('today.smart_recs')}</h3>
          <div className="space-y-2.5">
            {recs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </section>
      )}

      {/* NEW: First workout milestone */}
      {safeDaily.recentSessions?.length === 1 && safeDaily.workoutDone && (
        <div className="rounded-[18px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.15)] p-4">
          <p className="text-[14px] text-[hsl(var(--fg))]">{t('today.first_workout')}</p>
        </div>
      )}

      <CoachChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={coach.messages}
        isTyping={coach.isTyping}
        isHydrating={coach.isHydrating}
        loadError={coach.loadError}
        actionStates={coach.actionStates}
        onSendMessage={coach.sendMessage}
        onConfirmAction={coach.executeAction}
        onDismissAction={coach.dismissAction}
        pageContext="today"
      />
      <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />
      <QuickMealSheet open={quickMealOpen} onOpenChange={setQuickMealOpen} />
      <ShareFlow
        open={shareFlowOpen}
        onClose={() => setShareFlowOpen(false)}
        streak={streak}
        workouts={safeDaily.weekWorkoutCount || 0}
        meals={safeNutrition.caloriesConsumed > 0 ? 1 : 0}
        weightEntries={safeDaily.weightLogged ? 1 : 0}
      />
    </TodayScreen>
  );
}

export default function TodayV2() {
  return <TodayContent />;
}
