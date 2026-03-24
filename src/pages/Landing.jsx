import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle,
  Layers,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import RegionSelector from '@/components/pricing/RegionSelector';
import { getRegionPricing } from '@/lib/regionalPricing';

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

/* ─────────────────────────────────────────
   AUTH ACTIONS
───────────────────────────────────────── */
const handleSignUp = () => { window.location.href = `${ROUTES.auth}?mode=signup`; };
const handleLogin  = () => { window.location.href = `${ROUTES.auth}?mode=login`; };
const handlePlan   = (id) => {
  if (!id || id === 'free') { handleSignUp(); return; }
  if (window.self !== window.top) { alert('Checkout only works in the published app.'); return; }
  sessionStorage.setItem('pending_plan', id);
  window.location.href = `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.pricing)}`;
};

/* ─────────────────────────────────────────
   PLAN META (for full pricing section)
───────────────────────────────────────── */
const ATHLETE_PLAN_META = [
  { id: 'free',                key: 'free',        icon: Activity },
  { id: 'athlete_pro',         key: 'pro',         icon: Zap, popular: true },
  { id: 'athlete_performance', key: 'performance', icon: Star },
];

const PROFESSIONAL_PLAN_META = [
  { id: 'coach',        key: 'coach',        icon: Users },
  { id: 'nutritionist', key: 'nutritionist', icon: Users },
  { id: 'clinician',    key: 'clinician',    icon: Stethoscope },
];

function formatPlanPrice(planId, translatedPrice, pricing, locale, billing = 'monthly') {
  if (planId === 'free') return translatedPrice;
  const prices = billing === 'yearly' ? pricing.prices_yearly : pricing.prices;
  const amount = prices?.[planId];
  if (typeof amount !== 'number') return translatedPrice;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: pricing.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calcYearlySavings(planId, pricing) {
  const monthly = pricing.prices?.[planId];
  const yearly  = pricing.prices_yearly?.[planId];
  if (!monthly || !yearly) return null;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

/* ─────────────────────────────────────────
   COPY
───────────────────────────────────────── */
const COPY = {
  'en-US': {
    nav: { howItWorks: 'How it works', features: 'Features', blog: 'Blog', pricing: 'Pricing', login: 'Log In', signup: 'Get Started' },
    hero: {
      badge: 'Early Access',
      h1a: 'Track everything.',
      h1b: 'Understand what actually works.',
      sub: 'Your workouts, nutrition, and body metrics — finally in one place. See the patterns that actually change your body.',
      cta1: 'Start free',
      cta2: 'See how it works',
      s1t: 'Everything connected', s1d: 'not scattered across apps',
      s2t: 'See patterns', s2d: 'not just data points',
      s3t: 'Know what works', s3d: 'for your body',
    },
    problem: {
      label: 'The Problem',
      h2: 'You\'re doing everything right.\nBut you don\'t actually know what\'s working.',
      sub: 'Workouts in one app. Nutrition in another. Progress photos lost in your camera roll. When your data is scattered, you\'re flying blind.',
      items: [
        { e: '🏋️', t: 'Workout App', d: 'Track sessions, but no context on results' },
        { e: '🥗', t: 'Food Tracker', d: 'Log meals, never see the impact' },
        { e: '📊', t: 'Spreadsheet', d: 'Measurements you forget to update' },
        { e: '📱', t: 'Notes App', d: 'Plans scattered across random notes' },
        { e: '📸', t: 'Photo Gallery', d: 'Progress photos buried and forgotten' },
        { e: '💬', t: 'Messages', d: 'Coach feedback lost in threads' },
      ],
      quote: 'Data without connection is just noise.',
      quoteDesc: 'Without everything in one place, you\'re guessing. And guessing doesn\'t get you results.',
    },
    solution: {
      label: 'The Solution',
      h2a: 'Everything connected.',
      h2b: 'One view.',
      sub: 'Atlas is a single platform for people who want to understand their progress, not just record it. Training, nutrition, and body metrics — organized, connected, readable.',
      p1t: 'Centralized', p1d: 'Training, nutrition, body metrics — all in one system. When the data lives together, patterns become visible.',
      p2t: 'Connected', p2d: 'The entire product is built around one question: what is actually driving your results?',
      p3t: 'Honest', p3d: 'No gamification. No motivation tricks. Just your data, clearly presented.',
    },
    features: {
      workouts: {
        label: 'Workouts',
        h2: 'Watch your\ntraining compound.',
        desc: 'Track volume, intensity, and consistency over time. Know when you\'re progressing and when you\'ve plateaued.',
        pts: [
          { t: 'Full exercise library', d: '— or add your own. Bodybuilding, functional, cardio.' },
          { t: 'Workout history at a glance', d: '— see every session you\'ve ever done.' },
          { t: 'PR tracking built in', d: '— personal records update automatically.' },
          { t: 'No forced templates', d: '— log what you actually did, not what was planned.' },
        ],
      },
      nutrition: {
        label: 'Nutrition',
        h2: 'Understand what\nyour nutrition does.',
        desc: 'Not just a daily calorie count. A clear view of your intake patterns and how they connect to your performance and body composition.',
        pts: [
          { t: 'Fast daily logging', d: '— meals, macros, and calories without friction.' },
          { t: 'Weekly patterns', d: '— see where you\'re hitting targets and where you\'re not.' },
          { t: 'Connected to results', d: '— nutrition sits next to body weight and performance data.' },
          { t: 'Not a calorie prison', d: '— designed for awareness, not anxiety.' },
        ],
      },
      progress: {
        label: 'Progress Tracking',
        h2: 'See the full picture,\nnot just the number.',
        desc: 'Weight fluctuates. Atlas tracks multiple markers — body measurements, visual progress, weight trends — so you see the full picture.',
        pts: [
          { t: 'Body weight trends', d: '— weekly averages cut through daily noise.' },
          { t: 'Full measurements', d: '— waist, chest, arms, legs, hips, body fat %.' },
          { t: 'Before/after comparisons', d: '— pick any two dates and see the difference.' },
          { t: 'Trend detection', d: '— know immediately if your trajectory is going the right way.' },
        ],
      },
      photos: {
        label: 'Progress Photos',
        h2: 'See what the scale\ncan\'t show.',
        desc: 'Your body changes in ways measurements miss. Progress photos are the most honest record you have.',
        pts: [
          { t: 'Organized by date', d: '— no more digging through your camera roll.' },
          { t: 'Side-by-side comparison', d: '— pick any two check-ins and see the difference.' },
          { t: 'Private and secure', d: '— your photos stay yours. No public sharing.' },
          { t: 'Synced with metrics', d: '— see your weight and measurements alongside the photo from that day.' },
        ],
      },
      supplements: {
        label: 'Supplements & Protocols',
        h2: 'Your protocol, organized.\nYour adherence, visible.',
        desc: 'Creatine, vitamins, pre-workout — whatever your protocol is, Atlas keeps it organized and trackable.',
        pts: [
          { t: 'Daily checklist', d: '— log what you took, when you took it.' },
          { t: 'Custom protocols', d: '— morning stack, evening stack, cycle-based dosing.' },
          { t: 'Consistency tracking', d: '— see your adherence over the past 30 days.' },
          { t: 'No judgment', d: '— log whatever you want. It\'s your health data.' },
        ],
      },
      timeline: {
        label: 'Unified Timeline',
        h2: 'Your entire history.\nOne scroll.',
        desc: 'Workouts, check-ins, photos, protocol changes — all visible in a single chronological timeline.',
        pts: [
          { t: 'Automatic log', d: '— every action you take becomes part of your history.' },
          { t: 'Cross-reference anything', d: '— see what your nutrition looked like the week you hit your PR.' },
          { t: 'Monthly summaries', d: '— understand what each month actually delivered.' },
          { t: 'Long-term memory', d: '— scroll back 6 months, 12 months, 2 years. Your data doesn\'t expire.' },
        ],
      },
    },
    diff: {
      label: 'Why Atlas',
      h2: 'Built around the connection,\nnot the category.',
      sub: 'Every other tool tracks one thing well. Atlas tracks how everything relates.',
      cols: ['Capability', 'Workout Apps', 'Food Trackers', 'Generic Health Apps', 'Atlas'],
      rows: [
        ['Workout tracking', '✓', '—', 'Partial', '✓ Full'],
        ['Nutrition & macros', '—', '✓', 'Partial', '✓ Full'],
        ['Body measurements', '—', '—', 'Basic', '✓ Full'],
        ['Progress photos', '—', '—', '—', '✓ Organized'],
        ['Supplement tracking', '—', '—', '—', '✓ Full'],
        ['Unified timeline', '—', '—', '—', '✓ Everything'],
        ['Cross-metric analysis', '—', '—', '—', '✓ Built-in'],
      ],
      cards: [
        { e: '🚫', t: 'No plan-pushing', d: 'Atlas doesn\'t tell you what to do. It tracks what you actually do — and shows you if it\'s working.' },
        { e: '🚫', t: 'No gamification', d: 'No streaks, no badges. Your progress is real. That\'s the reward.' },
        { e: '🚫', t: 'Not clinical', d: 'Built for serious people. No jargon, no forms, no complexity.' },
      ],
    },
    pricing: {
      label: 'Pricing',
      h2: 'Simple. Honest.',
      sub: 'Start free. Upgrade when you want the full picture.',
      toggle: { intl: 'USD / International', br: 'BRL / Brasil' },
      free: {
        name: 'Free', priceIntl: '$0', priceBR: 'R$ 0', period: '/month', annualNote: 'Always free. No card required.',
        features: ['Basic Today', 'Workout and nutrition diary', 'Measurement tracking', 'Basic protocols', 'Profile and settings', 'Limited history (30 days)', 'Weekly insights'],
        absent: ['Structured plan tools', 'Full lab work', 'Progress photos', 'Advanced analytics', 'PDF/CSV export'],
        cta: 'Get Started Free', id: 'free',
      },
      pro: {
        name: 'Pro', priceIntl: '$9.99', priceBR: 'R$ 29', period: '/month',
        annualIntl: 'Or $79/year — save $40 (33%)', annualBR: 'Or R$249/year — save $40 (33%)',
        popular: 'Most Popular',
        features: [
          'Everything in Free', 'Meal plan tools', 'Workout plan tools', 'Complete meal/workout plans',
          'Full lab work', 'Unlimited progress photos', 'Expanded history (1 year)',
          'Complete analytics', 'Progress insights', 'PDF and CSV export', 'Stock alerts', 'Premium social cards',
        ],
        cta: 'Start Pro Free for 7 Days', id: 'pro_monthly',
      },
      founder: {
        h3: '🔒 Founder Price — Locked Forever',
        desc: 'Joining during Early Access? Your price never changes — even when we raise rates.',
        cta: 'Claim Founder Price',
      },
    },
    pros: {
      label: 'For Professionals',
      h2: 'Built for individuals.\nWorks with your team.',
      sub: 'Atlas doesn\'t require a coach or nutritionist. But if you work with one, they can see your data and collaborate directly inside the app.',
      cards: [
        { e: '🏃', t: 'Personal Trainers', d: 'See your clients\' workout logs, progress photos, and measurements in real-time. No more WhatsApp screenshots.' },
        { e: '🥦', t: 'Nutritionists', d: 'Review actual food logs alongside body metrics. See whether the plan is translating into real results.' },
      ],
      note: 'Professional collaboration is optional. Atlas works perfectly without anyone else involved.',
    },
    closing: {
      h2a: 'Stop guessing.',
      h2b: 'Start seeing.',
      sub: 'Atlas gives you the full picture — what you\'ve done, how it\'s working, and where to keep pushing.',
      cta1: 'Get started free', cta2: 'See plans',
      fine: 'No credit card needed. Free plan available. Cancel anytime.',
    },
  },
};

const HOME_MOCK_COPY = {
  'en-US': {
    workout: {
      overline: "Today's workout",
      exerciseName: 'bench press',
      weight: '102.5 kg',
      progress: '⬆ +2.5 kg from last session · PR',
      bars: [
        { label: 'Volume', pct: 82, val: '+18%' },
        { label: 'Frequency', pct: 65, val: '3x/wk' },
        { label: 'Consistency', pct: 91, val: '91%' },
      ],
      tags: ['Push A', 'Upper', 'Week 6'],
    },
    nutrition: {
      overline: "Today's nutrition",
      metricLabel: 'Calories',
      metricValue: '2,340',
      metricMeta: 'Target: 2,500 · 94% of goal',
      bars: [
        { label: 'Protein', pct: 88, val: '176g' },
        { label: 'Carbs', pct: 72, val: '248g' },
        { label: 'Fat', pct: 54, val: '62g' },
      ],
      summaryLabel: '7-day average',
      summaryText: 'Average protein: 168g · 3 days below target',
    },
    progress: {
      overline: 'Body evolution',
      cards: [
        { label: 'Weight', value: '84.2 kg', trend: '▼ −3.8 kg / 8 wk' },
        { label: 'Body fat', value: '17.4%', trend: '▼ −2.1% / 8 wk' },
      ],
      bars: [
        { label: 'Waist', pct: 60, val: '−3 cm', accent: true },
        { label: 'Arm', pct: 75, val: '+1.5 cm' },
        { label: 'Chest', pct: 68, val: '+2 cm' },
      ],
    },
    photos: {
      overline: 'Visual progress',
      items: [
        ['Jan 01', '#1a1a2e'],
        ['Feb 15', '#1e2a1e'],
        ['Mar 19', '#2a1e1e'],
      ],
      summaryTitle: '📸 12 weeks of progress',
      summaryText: "Compare any two dates. The difference you don't notice day to day.",
    },
    supplements: {
      overline: "Today's protocol",
      items: [
        { icon: '💊', name: 'Creatine', dose: '5g · Morning', done: true },
        { icon: '🌿', name: 'Vitamin D3', dose: '5000 IU · Morning', done: true },
        { icon: '🔥', name: 'Pre-workout', dose: '1 scoop · Pre-workout', done: true },
        { icon: '🌙', name: 'Magnesium', dose: '400mg · Night', done: false },
      ],
      summaryLabel: '30-day adherence',
      summaryValue: '87%',
      summarySuffix: 'consistency',
    },
    timeline: {
      overline: 'Your timeline',
      items: [
        { date: 'Today · Mar 19', label: 'New PR — squat 140 kg', detail: 'Workout logged · 4 exercises', active: true },
        { date: 'Mar 17', label: 'Check-in — 84.2 kg', detail: 'Body fat: 17.4% · Progress photo', active: false },
        { date: 'Mar 15', label: 'Protocol updated', detail: 'Added omega-3 · 3g daily', active: false },
        { date: 'Mar 12', label: 'Nutrition — best week', detail: 'Average protein: 182g · 7/7 days', active: false },
      ],
    },
  },
};

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

function FeaturePoint({ t, d }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]">
        <Check className="h-3 w-3" strokeWidth={2.6} />
      </div>
      <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
        <strong className="font-semibold text-[hsl(var(--fg))]">{t}</strong>{d}
      </p>
    </div>
  );
}

function MockCard({ children }) {
  return (
    <div className="rounded-[14px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.6)] p-3.5">
      {children}
    </div>
  );
}

function BarRow({ label, pct, val, accent = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-16 shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: accent ? 'hsl(0 67% 52%)' : 'hsl(var(--brand))' }}
        />
      </div>
      <span className="w-9 text-right text-[11px] text-[hsl(var(--fg-2))]">{val}</span>
    </div>
  );
}

function WorkoutMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <MockCard>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{copy.exerciseName}</p>
        <p className="mt-1 text-[2rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{copy.weight}</p>
        <p className="mt-0.5 text-[11px] text-[hsl(var(--brand))]">{copy.progress}</p>
      </MockCard>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {copy.tags.map((tag) => (
          <span key={tag} className="atlas-public-pill border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.06)] text-[hsl(var(--brand))]">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function NutritionMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <MockCard>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{copy.metricLabel}</p>
        <p className="mt-1 text-[2rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{copy.metricValue}</p>
        <p className="mt-0.5 text-[11px] text-[hsl(var(--fg-2))]">{copy.metricMeta}</p>
      </MockCard>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} />
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{copy.summaryLabel}</p>
        <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">{copy.summaryText}</p>
      </MockCard>
    </div>
  );
}

function ProgressMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="grid grid-cols-2 gap-2">
        {copy.cards.map((card) => (
          <MockCard key={card.label}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{card.label}</p>
            <p className="mt-1 text-[1.8rem] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">{card.value}</p>
            <p className="mt-0.5 text-[11px] text-[hsl(var(--brand))]">{card.trend}</p>
          </MockCard>
        ))}
      </div>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} accent={bar.accent} />
        ))}
      </div>
    </div>
  );
}

function PhotosMock({ copy }) {
  const before = { date: '01 Jan', url: '/demo-progress-photos/progress_casual_1.jpg', label: 'Before' };
  const after  = { date: '19 Mar', url: '/demo-progress-photos/progress_photo_2_during.jpg', label: 'After' };
  return (
    <div className="atlas-public-panel space-y-4 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="grid grid-cols-2 gap-3">
        {[before, after].map(({ date, url, label }) => (
          <div key={date} className="relative overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.7)]" style={{ aspectRatio: '3/4' }}>
            <img src={url} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-white/60">{label}</span>
              <span className="block text-[13px] font-semibold text-white">{date}</span>
            </div>
          </div>
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] font-semibold text-[hsl(var(--brand))]">{copy.summaryTitle}</p>
        <p className="mt-1 text-[13px] text-[hsl(var(--fg))]">{copy.summaryText}</p>
      </MockCard>
    </div>
  );
}

function SupplementsMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="space-y-2">
        {copy.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{item.icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.name}</p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.dose}</p>
              </div>
            </div>
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${item.done ? 'border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]' : 'border border-[hsl(var(--border))] bg-transparent'}`}>
              {item.done ? <Check className="h-3 w-3" strokeWidth={2.6} /> : null}
            </div>
          </div>
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{copy.summaryLabel}</p>
        <p className="mt-0.5 text-[1.2rem] font-bold tracking-[-0.04em] text-[hsl(var(--brand))]">{copy.summaryValue} <span className="text-[11px] font-normal text-[hsl(var(--fg-3))]">{copy.summarySuffix}</span></p>
      </MockCard>
    </div>
  );
}

function TimelineMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="space-y-0">
        {copy.items.map((item, i) => (
          <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < copy.items.length - 1 && (
              <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[hsl(var(--border)/0.7)]" />
            )}
            <div className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${item.active ? 'border-[hsl(var(--brand))] bg-[hsl(var(--card))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--fill))]'}`} />
            <div>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.date}</p>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.label}</p>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURE_BLOCKS = [
  { key: 'workouts', mockKey: 'workout', Mock: WorkoutMock, reverse: false },
  { key: 'nutrition', mockKey: 'nutrition', Mock: NutritionMock, reverse: true },
  { key: 'progress', mockKey: 'progress', Mock: ProgressMock, reverse: false },
  { key: 'photos', mockKey: 'photos', Mock: PhotosMock, reverse: true },
  { key: 'supplements', mockKey: 'supplements', Mock: SupplementsMock, reverse: false },
  { key: 'timeline', mockKey: 'timeline', Mock: TimelineMock, reverse: true },
];

/* ─────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────── */
function PricingCard({ plan, popularLabel }) {
  const Icon = plan.icon;
  const isFree = plan.id === 'free';

  return (
    <article
      className={`relative flex h-full flex-col rounded-[30px] border px-5 py-5 lg:px-6 lg:py-6 ${
        plan.popular
          ? 'border-[hsl(var(--brand)/0.32)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]'
          : 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.86)] shadow-[var(--shadow-xs)]'
      }`}
    >
      {plan.popular ? (
        <span className="atlas-public-pill absolute right-5 top-5 border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          {popularLabel}
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 pt-1">
          <p className="atlas-metric-label">{plan.name}</p>
          <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {plan.pitch}
          </p>
          {plan.note ? (
            <p className="mt-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{plan.note}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span className="text-[2.35rem] font-semibold tracking-[-0.065em] text-[hsl(var(--fg))]">
            {plan.price}
          </span>
          {!isFree ? (
            <span className="pb-1 text-[13px] text-[hsl(var(--fg-2))]">{plan.period}</span>
          ) : null}
        </div>
        {plan.savings ? (
          <p className="mt-2 text-[12px] font-semibold text-[hsl(var(--ok))]">
            Save {plan.savings}%
          </p>
        ) : plan.trial ? (
          <p className="mt-2 text-[12px] font-semibold text-[hsl(var(--ok))]">{plan.trial}</p>
        ) : null}
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        {plan.features?.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.4} />
            <span>{feature}</span>
          </div>
        ))}
        {plan.missing?.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-3))]">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2.1} />
            <span className="line-through">{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => handlePlan(plan.id)}
        variant={plan.popular ? 'default' : 'outline'}
        className="mt-6 h-11 w-full"
      >
        {plan.cta}
      </Button>
    </article>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Landing() {
  const { t, locale } = useTranslation();
  const c = COPY['en-US'];
  const homeMocks = HOME_MOCK_COPY['en-US'];

  const [billing, setBilling] = useState('monthly');
  const [region, setRegion] = useState('US');
  const pricing = getRegionPricing(region);

  const athletePlans = useMemo(() => {
    const translations = t('pricing_page.plans');
    return ATHLETE_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
      const savings = billing === 'yearly' ? calcYearlySavings(meta.id, pricing) : null;
      return {
        ...meta,
        name: translated.name,
        pitch: translated.pitch,
        features: translated.features,
        missing: translated.missing || [],
        cta: translated.cta,
        trial: billing === 'monthly' ? translated.trial : null,
        period: billing === 'yearly' ? '/year' : translated.period,
        savings,
        price: formatPlanPrice(meta.id, translated.price, pricing, locale, billing),
      };
    });
  }, [locale, pricing, billing, t]);

  const professionalPlans = useMemo(() => {
    const translations = t('pricing_page.plans');
    return PROFESSIONAL_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
      const savings = billing === 'yearly' ? calcYearlySavings(meta.id, pricing) : null;
      return {
        ...meta,
        name: translated.name,
        pitch: translated.pitch,
        note: translated.note,
        features: translated.features,
        cta: translated.cta,
        trial: billing === 'monthly' ? translated.trial : null,
        period: billing === 'yearly' ? '/year' : translated.period,
        savings,
        price: formatPlanPrice(meta.id, translated.price, pricing, locale, billing),
      };
    });
  }, [locale, pricing, billing, t]);

  return (
    <PublicSiteShell
      navLinks={[
        { href: '#solution', label: c.nav.howItWorks },
        { href: '#features', label: c.nav.features },
        { href: ROUTES.blog, label: c.nav.blog },
        { href: '#pricing', label: c.nav.pricing },
      ]}
      actions={(
        <>
          <Button size="sm" onClick={handleLogin}>{c.nav.login}</Button>
        </>
      )}
    >
      <PublicMetadata
        title="atlas.core"
        description="atlas.core is the public performance operating system for workouts, nutrition, measurements, supplements, and connected progress."
        canonicalPath={ROUTES.home}
      />

      {/* ══ HERO ══════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <motion.div
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          className="space-y-10"
        >
          {/* Badge */}
          <motion.div variants={fade} custom={0} className="flex items-center gap-2.5">
            <span className="atlas-public-pill border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.06)] text-[hsl(var(--brand))]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--brand))]" />
              {c.hero.badge}
            </span>
          </motion.div>

          {/* Headline + sub + CTAs */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="space-y-8">
              <motion.div variants={fade} custom={1} className="space-y-2">
                <h1 className="atlas-display-title text-[clamp(2.8rem,2rem+2.8vw,5rem)] leading-[1.08]">
                  {c.hero.h1a}
                </h1>
                <h1 className="atlas-display-title text-[clamp(2.8rem,2rem+2.8vw,5rem)] leading-[1.08]">
                  {c.hero.h1b}
                </h1>
              </motion.div>

              <motion.p variants={fade} custom={2} className="atlas-public-copy max-w-lg text-[1.05rem]">
                {c.hero.sub}
              </motion.p>

              <motion.div variants={fade} custom={3} className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handleSignUp} className="gap-2">
                  {c.hero.cta1}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#features">{c.hero.cta2}</a>
                </Button>
              </motion.div>

              <motion.div variants={fade} custom={4} className="grid grid-cols-3 gap-3">
                {[
                  [c.hero.s1t, c.hero.s1d],
                  [c.hero.s2t, c.hero.s2d],
                  [c.hero.s3t, c.hero.s3d],
                ].map(([strong, sub]) => (
                  <div key={strong} className="atlas-public-panel-muted p-4">
                    <p className="text-[15px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{strong}</p>
                    <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{sub}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div variants={fade} custom={2}>
              <WorkoutMock copy={homeMocks.workout} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══ PROBLEM ══════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-8 max-w-2xl">
            <p className="atlas-overline">{c.problem.label}</p>
            <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
              {c.problem.h2}
            </h2>
            <p className="atlas-public-copy mt-3">{c.problem.sub}</p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {c.problem.items.map((item, i) => (
              <motion.div key={item.t} {...fadeIn(i * 0.06)}>
                <div className="atlas-public-panel-muted flex items-start gap-3 p-4">
                  <span className="text-xl">{item.e}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{item.t}</p>
                    <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{item.d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn(0.2)} className="mt-8 max-w-2xl border-l-[3px] border-[hsl(var(--brand))] pl-5">
            <p className="text-[1.05rem] font-semibold leading-7 text-[hsl(var(--fg))]">{c.problem.quote}</p>
            <p className="mt-3 text-[14px] text-[hsl(var(--fg-2))]">{c.problem.quoteDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* ══ SOLUTION ══════════════════════════════ */}
      <section id="solution" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10 text-center">
          <p className="atlas-overline justify-center">{c.solution.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
            {c.solution.h2a}<br />
            <span className="text-[hsl(var(--brand))]">{c.solution.h2b}</span>
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-xl">{c.solution.sub}</p>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--border)/0.7)] md:grid-cols-3">
          {[
            { t: c.solution.p1t, d: c.solution.p1d, icon: Layers },
            { t: c.solution.p2t, d: c.solution.p2d, icon: TrendingUp },
            { t: c.solution.p3t, d: c.solution.p3d, icon: Zap },
          ].map(({ t, d, icon: Icon }, i) => (
            <motion.div key={t} {...fadeIn(i * 0.08)}>
              <div className="h-full bg-[hsl(var(--card))] px-6 py-7 transition-colors hover:bg-[hsl(var(--fill)/0.5)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[18px] border border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.07)] text-[hsl(var(--brand))]">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <p className="text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{t}</p>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════ */}
      <div id="features">
        {FEATURE_BLOCKS.map(({ key, mockKey, Mock, reverse }) => {
          const f = c.features[key];
          return (
            <section
              key={key}
              className="border-t border-[hsl(var(--border)/0.6)] mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20"
            >
              <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:direction-rtl' : ''}`}>
                {/* Text side */}
                <motion.div
                  {...fadeIn(0)}
                  className={`space-y-6 ${reverse ? 'lg:order-2' : ''}`}
                >
                  <p className="atlas-overline">{f.label}</p>
                  <h2 className="atlas-display-title whitespace-pre-line text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
                    {f.h2}
                  </h2>
                  <p className="atlas-public-copy">{f.desc}</p>
                  <div className="space-y-3.5">
                    {f.pts.map((pt) => <FeaturePoint key={pt.t} t={pt.t} d={pt.d} />)}
                  </div>
                </motion.div>

                {/* Visual side */}
                <motion.div
                  {...fadeIn(0.15)}
                  className={reverse ? 'lg:order-1' : ''}
                >
                  <Mock copy={homeMocks[mockKey]} />
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ══ DIFFERENTIATION ═══════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-10 text-center">
            <p className="atlas-overline justify-center">{c.diff.label}</p>
            <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">{c.diff.h2}</h2>
            <p className="atlas-public-copy mx-auto mt-3 max-w-xl">{c.diff.sub}</p>
          </motion.div>

          {/* Comparison table */}
          <motion.div {...fadeIn(0.1)} className="mb-10 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-[13px]">
              <thead>
                <tr>
                  {c.diff.cols.map((col, i) => (
                    <th
                      key={col}
                      className={`border-b border-[hsl(var(--border)/0.7)] px-4 py-3 text-left font-semibold tracking-wider text-[11px] uppercase ${
                        i === 4 ? 'text-[hsl(var(--brand))] bg-[hsl(var(--tint)/0.04)]' : 'text-[hsl(var(--fg-3))]'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.diff.rows.map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-[hsl(var(--border)/0.5)] transition-colors hover:bg-[hsl(var(--fill)/0.4)]"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-3.5 ${
                          ci === 0 ? 'text-[hsl(var(--fg-2))]' :
                          ci === 4 ? 'font-semibold text-[hsl(var(--brand))] bg-[hsl(var(--tint)/0.03)]' :
                          cell === '—' ? 'text-[hsl(var(--fg-3))] opacity-40' : 'text-[hsl(var(--fg-2))]'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Differentiator cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {c.diff.cards.map((card, i) => (
              <motion.div key={card.t} {...fadeIn(i * 0.07)}>
                <div className="atlas-card h-full px-5 py-5">
                  <span className="text-xl">{card.e}</span>
                  <p className="mt-4 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{card.t}</p>
                  <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{card.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════ */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        {/* Header */}
        <motion.div {...fadeIn(0)} className="mb-8">
          <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <div>
                <p className="atlas-overline">{c.pricing.label}</p>
                <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">{c.pricing.h2}</h2>
                <p className="atlas-public-copy mt-3 max-w-md">{c.pricing.sub}</p>
              </div>

              {/* Billing toggle + region */}
              <div className="space-y-3">
                <RegionSelector onRegionChange={setRegion} />
                <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] p-1">
                  <button
                    type="button"
                    onClick={() => setBilling('monthly')}
                    className={`flex-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                      billing === 'monthly'
                        ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                        : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilling('yearly')}
                    className={`flex-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                      billing === 'yearly'
                        ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                        : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
                    }`}
                  >
                    Yearly
                    {billing !== 'yearly' && (
                      <span className="ml-1.5 rounded-full bg-[hsl(var(--ok)/0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ok))]">
                        up to 31%
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Athlete plans */}
        <motion.div {...fadeIn(0.08)} className="atlas-public-panel mb-6 px-6 py-6 lg:px-8 lg:py-8">
          <p className="atlas-overline mb-6">Athlete</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {athletePlans.map((plan, index) => (
              <motion.div key={plan.id} {...fadeIn(index * 0.06)}>
                <PricingCard plan={plan} popularLabel="Most chosen" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Professional plans */}
        <motion.div {...fadeIn(0.12)} className="mb-6">
          <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
            <div className="pt-2">
              <p className="atlas-overline">Professional</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                Plans for coaches, nutritionists, and clinicians.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {professionalPlans.map((plan, index) => (
                <motion.div key={plan.id} {...fadeIn(index * 0.06)}>
                  <PricingCard plan={plan} popularLabel="Most chosen" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Founder box */}
        <motion.div {...fadeIn(0.15)}>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[hsl(var(--tint)/0.16)] bg-[hsl(var(--tint)/0.03)] px-6 py-5">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{c.pricing.founder.h3}</p>
              <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">{c.pricing.founder.desc}</p>
            </div>
            <Button onClick={handleSignUp} variant="default" size="sm">{c.pricing.founder.cta}</Button>
          </div>
        </motion.div>
      </section>

      {/* ══ PROFESSIONALS ══════════════════════════ */}
      <section className="mx-auto max-w-6xl border-t border-[hsl(var(--border)/0.6)] px-5 py-14 lg:px-8 lg:py-16">
        <motion.div {...fadeIn(0)} className="mb-8 text-center">
          <p className="atlas-overline justify-center">{c.pros.label}</p>
          <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
            {c.pros.h2}
          </h2>
          <p className="atlas-public-copy mx-auto mt-3 max-w-xl">{c.pros.sub}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {c.pros.cards.map((card, i) => (
            <motion.div key={card.t} {...fadeIn(i * 0.08)}>
              <div className="atlas-card h-full px-6 py-6">
                <span className="text-2xl">{card.e}</span>
                <p className="mt-4 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{card.t}</p>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{card.d}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeIn(0.15)} className="mt-6 text-center text-[13px] text-[hsl(var(--fg-3))]">
          {c.pros.note}
        </motion.p>
      </section>

      {/* ══ CLOSING CTA ═══════════════════════════ */}
      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="atlas-page-header atlas-cta-glow px-6 py-10 text-center lg:px-10 lg:py-14">
          <h2 className="atlas-display-title whitespace-pre-line text-[clamp(2.2rem,1.6rem+1.6vw,3.8rem)] leading-[1.1]">
            {c.closing.h2a}
            <br />
            <span className="text-[hsl(var(--brand))]">{c.closing.h2b}</span>
          </h2>
          <p className="atlas-public-copy mx-auto mt-5 max-w-xl text-[1.05rem]">{c.closing.sub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={handleSignUp} className="gap-2">
              {c.closing.cta1}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>{c.closing.cta2}</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-[hsl(var(--fg-3))]">{c.closing.fine}</p>
        </motion.div>
      </section>

    </PublicSiteShell>
  );
}
