import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Dumbbell,
  Utensils,
  Pill,
  TrendingUp,
  Activity,
  Heart,
  Flame,
  Gauge,
} from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { track } from '@/lib/analytics';
import { ROUTES } from '@/lib/routes';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ value, label, color, icon: Icon }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-[72px] w-[72px] items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="hsl(var(--border) / 0.3)" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={`hsl(${color})`} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={progress}
            transform="rotate(-90 36 36)"
            className="transition-all duration-700"
          />
        </svg>
        <Icon className="h-5 w-5" style={{ color: `hsl(${color})` }} />
      </div>
      <div className="text-center">
        <p className="text-[18px] font-bold text-[hsl(var(--fg))]">{value}</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[hsl(var(--fg-3))]">{label}</p>
      </div>
    </div>
  );
}

// ─── Recommendation card ─────────────────────────────────────────────────────
function RecCard({ icon: Icon, color, tag, title, body, delay = 0 }) {
  const handleTap = () => track('demo_card_tapped', { card: tag });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      onClick={handleTap}
      className="rounded-[16px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-xs)]"
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-[8px]"
          style={{ background: `hsla(${color}, 0.12)` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: `hsl(${color})` }} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[hsl(var(--fg-3))]">{tag}</span>
      </div>
      <p className="text-[14px] font-semibold leading-snug text-[hsl(var(--fg))]">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{body}</p>
    </motion.div>
  );
}

// ─── Demo badge ──────────────────────────────────────────────────────────────
function DemoBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--accent-primary)/0.3)] bg-[hsl(var(--accent-primary)/0.08)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--accent-primary))]">
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function DemoHome() {
  const { t } = useI18n();
  const navigate = useNavigate();

  React.useEffect(() => {
    track('demo_home_viewed');
  }, []);

  const goAuth = (mode = 'signup') => {
    track('auth_gate_shown', { source: 'demo_cta', mode });
    navigate(`${ROUTES.auth}?mode=${mode}`);
  };

  return (
    <div
      className="min-h-screen bg-[hsl(var(--bg))]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <AtlasCoreLogoSVG width={24} />
          <span className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            <span className="text-[hsl(var(--accent-primary))]">atlas</span>
            <span className="font-light">.core</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => goAuth('login')}
            className="text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
          >
            {t('demo.signIn')}
          </button>
          <button
            onClick={() => goAuth('signup')}
            className="rounded-[10px] bg-[hsl(var(--accent-primary))] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
          >
            {t('demo.createAccount')}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-5 pb-24">
        {/* Greeting */}
        <div className="pt-2">
          <DemoBadge label={t('demo.badge')} />
          <p className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {t('demo.greeting')}
          </p>
        </div>

        {/* Score rings */}
        <div className="rounded-[18px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] px-4 py-5 shadow-[var(--shadow-xs)]">
          <div className="grid grid-cols-4 gap-2">
            <ScoreRing value={82} label={t('demo.readiness')} color="var(--sys-green)" icon={Activity} />
            <ScoreRing value={68} label={t('demo.recovery')} color="var(--sys-yellow)" icon={Heart} />
            <ScoreRing value={91} label={t('demo.adherence')} color="var(--accent-primary)" icon={Flame} />
            <ScoreRing value={74} label={t('demo.metabolic')} color="var(--sys-purple)" icon={Gauge} />
          </div>
        </div>

        {/* Recommendation cards */}
        <RecCard
          icon={Sparkles}
          color="var(--sys-purple)"
          tag={t('demo.todayRec')}
          title={t('demo.recTitle')}
          body={t('demo.recBody')}
          delay={0.05}
        />
        <RecCard
          icon={Dumbbell}
          color="var(--sys-yellow)"
          tag={t('demo.trainingAdj')}
          title={t('demo.trainingTitle')}
          body={t('demo.trainingBody')}
          delay={0.1}
        />
        <RecCard
          icon={Utensils}
          color="var(--sys-green)"
          tag={t('demo.nutritionDir')}
          title={t('demo.nutritionTitle')}
          body={t('demo.nutritionBody')}
          delay={0.15}
        />
        <RecCard
          icon={Pill}
          color="var(--accent-primary)"
          tag={t('demo.protocolReminder')}
          title={t('demo.protocolTitle')}
          body={t('demo.protocolBody')}
          delay={0.2}
        />
        <RecCard
          icon={TrendingUp}
          color="var(--sys-green)"
          tag={t('demo.trajectory')}
          title={t('demo.trajectoryTitle')}
          body={t('demo.trajectoryBody')}
          delay={0.25}
        />

        {/* CTA block */}
        <div className="rounded-[18px] border border-[hsl(var(--accent-primary)/0.3)] bg-[hsl(var(--accent-primary)/0.05)] p-5 text-center">
          <p className="text-[16px] font-bold text-[hsl(var(--fg))]">{t('demo.unlockTitle')}</p>
          <p className="mt-1.5 text-[13px] text-[hsl(var(--fg-2))]">{t('demo.unlockBody')}</p>
          <button
            onClick={() => goAuth('signup')}
            className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-[hsl(var(--accent-primary))] px-6 py-3 text-[14px] font-semibold text-white transition-all active:scale-[0.97]"
          >
            {t('demo.startTracking')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
