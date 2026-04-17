import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, Flame } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import { computeProjection } from '../projectionEngine';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildChartData(curveWithAtlas, curveNoChange) {
  return curveWithAtlas.map((point, i) => ({
    week: point.week,
    withAtlas: point.weight,
    noChange: curveNoChange[i]?.weight ?? point.weight,
  }));
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] px-3 py-3">
      <Icon size={16} className="text-[hsl(var(--brand))]" />
      <span className="text-[15px] font-bold text-[hsl(var(--fg))]">
        {value}
      </span>
      <span className="text-[11px] text-[hsl(var(--fg-3))]">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[10px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.9)] px-3 py-2 text-[12px] shadow-lg backdrop-blur">
      <p className="mb-1 font-medium text-[hsl(var(--fg-2))]">
        Week {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === 'withAtlas' ? 'With Atlas' : 'No change'}:{' '}
          {entry.value} kg
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ProjectionScreen() {
  const { answers, goNext } = useOnboarding();
  const t = useT();

  const projection = useMemo(() => {
    try {
      return computeProjection({
        current_weight: answers.current_weight,
        target_weight: answers.target_weight,
        timeline: answers.timeline,
        sex: answers.sex,
        age: answers.age,
        height_cm: answers.height_cm ?? answers.height,
        activity_level: answers.activity_level,
        health_goals: answers.health_goals,
      });
    } catch {
      return null;
    }
  }, [answers]);

  // Fallback when projection can't be computed
  if (!projection) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="max-w-[320px] rounded-[22px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
            One more step
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
            {t('onboardingV2.projection.moreInfo') || 'We need a bit more info to show your projection.'}
          </p>
          <button
            type="button"
            onClick={goNext}
            className="mt-5 rounded-[14px] bg-[hsl(var(--brand))] px-8 py-3.5 text-[15px] font-semibold text-white"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const {
    target_date,
    total_weeks,
    weekly_rate_kg,
    daily_deficit_kcal,
    is_aggressive,
    suggested_weeks,
    curve_with_atlas,
    curve_no_change,
  } = projection;

  const chartData = buildChartData(curve_with_atlas, curve_no_change);
  const targetWeight = answers.target_weight;
  const formattedDate = formatDate(target_date);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-4 pt-2">
      <motion.div
        className="mx-auto flex w-full max-w-[420px] flex-col gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Headline */}
        <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-[hsl(var(--fg))]">
          {t('onboardingV2.projection.headline', { target: targetWeight, date: formattedDate }) || `You can be at ${targetWeight}kg by ${formattedDate}.`}
        </h1>

        <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-3))]">
          This is built from the answers you just gave us. The curve below is the realistic version, not the optimistic one.
        </p>

        {/* Chart */}
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="atlasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--brand))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--brand))"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: 'hsl(var(--fg-3))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(w) => `W${w}`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--fg-3))' }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* No-change line (dashed gray) */}
              <Area
                type="monotone"
                dataKey="noChange"
                stroke="hsl(var(--fg-3))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                fill="none"
                dot={false}
                activeDot={false}
              />

              {/* With Atlas curve (gradient fill) */}
              <Area
                type="monotone"
                dataKey="withAtlas"
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                fill="url(#atlasGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--brand))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stat cards */}
        <div className="flex gap-3">
          <StatCard
            icon={Calendar}
            label="Target date"
            value={formatDate(target_date).replace(/,\s*\d{4}/, '')}
          />
          <StatCard
            icon={TrendingDown}
            label="Weekly pace"
            value={`${Math.abs(weekly_rate_kg)} kg/wk`}
          />
          <StatCard
            icon={Flame}
            label="Daily target"
            value={`${Math.abs(Math.round(daily_deficit_kcal))} kcal`}
          />
        </div>

        {/* Aggressive warning */}
        {is_aggressive && suggested_weeks && (
          <div className="rounded-[12px] border border-[hsl(var(--warn)/0.3)] bg-[hsl(var(--warn)/0.08)] px-4 py-3">
            <p className="text-[13px] leading-snug text-[hsl(var(--warn))]">
              {t('onboardingV2.projection.aggressive', { weeks: suggested_weeks }) || `That's aggressive. We recommend extending to ${suggested_weeks} weeks for sustainable results.`}
            </p>
          </div>
        )}

        {/* Subtext */}
        <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-3))]">
          {t('onboardingV2.projection.subtext', { weeks: total_weeks }) || `That's ${total_weeks} weeks from today. Not a miracle — just a plan that matches your body.`}
        </p>

        {/* Continue */}
        <button
          type="button"
          onClick={goNext}
          className="mt-2 w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          {t('onboardingV2.projection.continue') || 'Continue'}
        </button>
      </motion.div>
    </div>
  );
}
