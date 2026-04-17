import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Beaker,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Droplets,
  FileText,
  Flame,
  Heart,
  HeartPulse,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AppContainer,
  Card,
  Section,
} from '@/components/shared/AppContainer';
import {
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
  StatusBanner,
} from '@/components/shared/StablePage';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';
import * as labService from '@/services/labExamService';

// ── Biomarker Categories ──────────────────────────────────────────────────────

const CATEGORIES = {
  metabolic: {
    label: 'Metabolic',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/8',
    borderColor: 'border-orange-500/15',
    keywords: ['glucose', 'insulin', 'hba1c', 'a1c', 'hemoglobin a1c', 'fasting glucose', 'triglycerides'],
  },
  hormonal: {
    label: 'Hormonal',
    icon: Zap,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/8',
    borderColor: 'border-violet-500/15',
    keywords: ['testosterone', 'estradiol', 'cortisol', 'tsh', 'thyroid', 't3', 't4', 'dhea', 'shbg', 'progesterone', 'fsh', 'lh', 'prolactin'],
  },
  lipids: {
    label: 'Lipids',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/8',
    borderColor: 'border-rose-500/15',
    keywords: ['cholesterol', 'ldl', 'hdl', 'vldl', 'triglyceride', 'apolipoprotein', 'lp(a)', 'lipoprotein'],
  },
  inflammatory: {
    label: 'Inflammatory',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/8',
    borderColor: 'border-red-500/15',
    keywords: ['crp', 'c-reactive', 'esr', 'ferritin', 'homocysteine', 'fibrinogen', 'interleukin', 'il-6'],
  },
  vitamins: {
    label: 'Vitamins & Minerals',
    icon: Droplets,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/8',
    borderColor: 'border-emerald-500/15',
    keywords: ['vitamin', 'iron', 'zinc', 'magnesium', 'calcium', 'selenium', 'b12', 'folate', 'folic', 'potassium', 'sodium', 'phosphorus'],
  },
  liver: {
    label: 'Liver & Kidney',
    icon: Beaker,
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/8',
    borderColor: 'border-amber-600/15',
    keywords: ['ast', 'alt', 'ggt', 'bilirubin', 'albumin', 'creatinine', 'urea', 'bun', 'gfr', 'uric acid', 'alkaline phosphatase'],
  },
  blood: {
    label: 'Blood Count',
    icon: HeartPulse,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/8',
    borderColor: 'border-sky-500/15',
    keywords: ['hemoglobin', 'hematocrit', 'rbc', 'wbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'basophil', 'mcv', 'mch', 'mchc', 'rdw'],
  },
};

function categorizeMarker(marker) {
  const name = (marker?.name || '').toLowerCase();
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (cat.keywords.some((kw) => name.includes(kw))) return key;
  }
  return 'other';
}

function summarizeExam(exam = {}) {
  const markers = Array.isArray(exam.markers) ? exam.markers : [];
  return markers.reduce(
    (acc, marker) => {
      const status = marker?.status || 'normal';
      acc.total += 1;
      if (status === 'normal') acc.normal += 1;
      if (status === 'low') acc.low += 1;
      if (status === 'high') acc.high += 1;
      if (status === 'critical') acc.critical += 1;
      return acc;
    },
    { total: 0, normal: 0, low: 0, high: 0, critical: 0 }
  );
}

function formatExamDate(date) {
  if (!date) return '\u2014';
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    normal: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2, label: 'Normal' },
    low: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: ArrowDownRight, label: 'Low' },
    high: { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: ArrowUpRight, label: 'High' },
    critical: { color: 'bg-red-500/15 text-red-600 border-red-500/30', icon: AlertTriangle, label: 'Critical' },
  };
  const config = configs[status] || configs.normal;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <Badge variant="outline" className={cn('font-medium capitalize flex items-center gap-1', config.color, sizeClasses)}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {config.label}
    </Badge>
  );
};

// ── Range Visualization Bar ───────────────────────────────────────────────────

function RangeBar({ value, refRange, status }) {
  // Parse reference range like "300-900", "<100", ">40", "70-100"
  const parsed = parseRefRange(refRange);
  if (!parsed || !value) return null;

  const numVal = parseFloat(value);
  if (isNaN(numVal)) return null;

  const { min, max } = parsed;
  const range = max - min;
  const padding = range * 0.3;
  const displayMin = min - padding;
  const displayMax = max + padding;
  const displayRange = displayMax - displayMin;

  const clampedVal = Math.max(displayMin, Math.min(displayMax, numVal));
  const position = ((clampedVal - displayMin) / displayRange) * 100;

  const normalStart = ((min - displayMin) / displayRange) * 100;
  const normalEnd = ((max - displayMin) / displayRange) * 100;

  const dotColor =
    status === 'critical' ? 'bg-red-500'
    : status === 'high' ? 'bg-rose-500'
    : status === 'low' ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div className="mt-3 space-y-1.5">
      <div className="relative h-2 rounded-full bg-[hsl(var(--fill)/0.5)] overflow-hidden">
        {/* Normal range zone */}
        <div
          className="absolute top-0 h-full rounded-full bg-emerald-500/15"
          style={{ left: `${normalStart}%`, width: `${normalEnd - normalStart}%` }}
        />
        {/* Value dot */}
        <div
          className={cn('absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm', dotColor)}
          style={{ left: `calc(${position}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[hsl(var(--fg-3))]">
        <span>{min}</span>
        <span className="text-[hsl(var(--fg-2))] font-medium">Ref: {refRange}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function parseRefRange(refRange) {
  if (!refRange) return null;
  const str = String(refRange).trim();

  // Range: "300-900", "70 - 100"
  const rangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*[-\u2013]\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };

  // Less than: "<100"
  const ltMatch = str.match(/^[<\u2264]\s*(\d+(?:\.\d+)?)$/);
  if (ltMatch) return { min: 0, max: parseFloat(ltMatch[1]) };

  // Greater than: ">40"
  const gtMatch = str.match(/^[>\u2265]\s*(\d+(?:\.\d+)?)$/);
  if (gtMatch) { const v = parseFloat(gtMatch[1]); return { min: v, max: v * 3 }; }

  return null;
}

// ── Summary Banner ────────────────────────────────────────────────────────────

function SummaryBanner({ exam }) {
  const summary = summarizeExam(exam);
  const abnormal = summary.low + summary.high + summary.critical;
  const allGood = abnormal === 0 && summary.total > 0;

  return (
    <div className={cn(
      'rounded-3xl border p-5 sm:p-6',
      allGood
        ? 'border-emerald-500/15 bg-[linear-gradient(180deg,hsl(142_71%_45%/0.04)_0%,hsl(var(--card))_100%)]'
        : 'border-[hsl(var(--border)/0.7)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.3)_0%,hsl(var(--card))_100%)]'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[20px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {exam.panel_name}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[hsl(var(--fg-2))]">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatExamDate(exam.exam_date)}
            </span>
            <span className="rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-2.5 py-0.5 text-[11px] font-semibold">
              {summary.total} markers
            </span>
          </div>
        </div>

        {/* Key metric */}
        <div className="text-right shrink-0">
          {allGood ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-[13px] font-semibold text-emerald-600">All in range</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/8 px-3 py-2">
              <AlertTriangle size={16} className="text-rose-500" />
              <span className="text-[13px] font-semibold text-rose-600">
                {abnormal} out of range
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-4 gap-3 mt-5">
        {[
          { label: 'Total', value: summary.total, tone: 'neutral' },
          { label: 'Normal', value: summary.normal, tone: 'good' },
          { label: 'Review', value: summary.low + summary.high, tone: summary.low + summary.high > 0 ? 'warn' : 'neutral' },
          { label: 'Critical', value: summary.critical, tone: summary.critical > 0 ? 'critical' : 'neutral' },
        ].map((s) => (
          <div key={s.label} className={cn(
            'rounded-2xl border px-3 py-3 text-center',
            s.tone === 'good' ? 'border-emerald-500/15 bg-emerald-500/5'
            : s.tone === 'warn' ? 'border-amber-500/15 bg-amber-500/5'
            : s.tone === 'critical' ? 'border-rose-500/15 bg-rose-500/5'
            : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.2)]'
          )}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{s.label}</p>
            <p className="mt-1 text-[1.3rem] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Category Cards ────────────────────────────────────────────────────────────

function CategoryCards({ markers, onCategoryClick, activeCategory }) {
  const grouped = useMemo(() => {
    const groups = {};
    (markers || []).forEach((m) => {
      const cat = categorizeMarker(m);
      if (!groups[cat]) groups[cat] = { markers: [], abnormal: 0 };
      groups[cat].markers.push(m);
      if (m.status && m.status !== 'normal') groups[cat].abnormal += 1;
    });
    return groups;
  }, [markers]);

  const categoryKeys = Object.keys(grouped).sort((a, b) => {
    // Put categories with abnormal markers first
    return (grouped[b]?.abnormal || 0) - (grouped[a]?.abnormal || 0);
  });

  if (categoryKeys.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {categoryKeys.map((key) => {
        const catDef = CATEGORIES[key] || { label: 'Other', icon: FileText, color: 'text-[hsl(var(--fg-2))]', bgColor: 'bg-[hsl(var(--fill)/0.3)]', borderColor: 'border-[hsl(var(--border)/0.5)]' };
        const Icon = catDef.icon;
        const group = grouped[key];
        const isActive = activeCategory === key;

        return (
          <button
            key={key}
            onClick={() => onCategoryClick(isActive ? null : key)}
            className={cn(
              'flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-200',
              isActive
                ? `${catDef.borderColor} ${catDef.bgColor} ring-1 ring-inset ring-current/5`
                : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] hover:bg-[hsl(var(--fill)/0.3)]'
            )}
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', catDef.bgColor)}>
              <Icon size={18} className={catDef.color} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{catDef.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[hsl(var(--fg-3))]">{group.markers.length} markers</span>
                {group.abnormal > 0 && (
                  <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                    {group.abnormal} flagged
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Biomarker Detail Card ─────────────────────────────────────────────────────

function BiomarkerDetail({ marker }) {
  const [expanded, setExpanded] = useState(false);
  const status = marker?.status || 'normal';
  const isNormal = status === 'normal';

  const borderClass = isNormal
    ? 'border-[hsl(var(--border)/0.6)]'
    : status === 'critical'
      ? 'border-red-500/20'
      : status === 'high'
        ? 'border-rose-500/15'
        : 'border-amber-500/15';

  const bgClass = isNormal
    ? 'bg-[hsl(var(--card))]'
    : status === 'critical'
      ? 'bg-red-500/3'
      : status === 'high'
        ? 'bg-rose-500/3'
        : 'bg-amber-500/3';

  const explanation = status === 'high'
    ? 'Above the reference range. Worth tracking over time to see if this is a persistent pattern.'
    : status === 'low'
      ? 'Below the reference range. Consider context, timing, and whether this recurs across multiple tests.'
      : status === 'critical'
        ? 'Outside critical limits. Review this result with a clinician before taking action.'
        : 'Within the expected reference range. No immediate action needed.';

  return (
    <motion.div
      layout
      className={cn('rounded-2xl border p-4 transition-colors', borderClass, bgClass)}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            'w-2 h-2 rounded-full shrink-0',
            isNormal ? 'bg-emerald-500' : status === 'high' ? 'bg-rose-500' : status === 'critical' ? 'bg-red-500' : 'bg-amber-500'
          )} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))] truncate">{marker.name}</p>
            <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">Ref: {marker.ref_range || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className={cn(
              'text-[15px] font-bold tracking-[-0.02em]',
              status === 'critical' ? 'text-red-600'
              : status === 'high' ? 'text-rose-600'
              : status === 'low' ? 'text-amber-600'
              : 'text-[hsl(var(--fg))]'
            )}>
              {marker.value}
              <span className="text-[11px] font-normal text-[hsl(var(--fg-3))] ml-0.5">{marker.unit}</span>
            </p>
          </div>
          <StatusBadge status={status} size="sm" />
          <ChevronDown
            size={14}
            className={cn(
              'text-[hsl(var(--fg-3))] transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[hsl(var(--border)/0.4)] space-y-3">
              {/* Range visualization */}
              <RangeBar value={marker.value} refRange={marker.ref_range} status={status} />

              {/* Explanation text */}
              <p className="text-[12px] leading-5 text-[hsl(var(--fg-2))]">{explanation}</p>

              {/* Trend indicator (if available) */}
              {marker.trend && marker.trend !== 'stable' && (
                <div className="flex items-center gap-2 text-[11px]">
                  {marker.trend === 'up' ? (
                    <TrendingUp size={13} className="text-rose-500" />
                  ) : (
                    <TrendingDown size={13} className="text-amber-500" />
                  )}
                  <span className="text-[hsl(var(--fg-2))] font-medium">
                    Trending {marker.trend} vs. previous
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Markers List by Category ──────────────────────────────────────────────────

function MarkersList({ markers, activeCategory }) {
  const filtered = useMemo(() => {
    if (!activeCategory) return markers || [];
    return (markers || []).filter((m) => categorizeMarker(m) === activeCategory);
  }, [markers, activeCategory]);

  // Sort: abnormal first, then alphabetical
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aAbnormal = a.status !== 'normal' ? 0 : 1;
      const bAbnormal = b.status !== 'normal' ? 0 : 1;
      if (aAbnormal !== bAbnormal) return aAbnormal - bAbnormal;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [filtered]);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-2">
      {sorted.map((marker, idx) => (
        <BiomarkerDetail key={`${marker.name}-${idx}`} marker={marker} />
      ))}
    </div>
  );
}

// ── Actions / Next Steps ──────────────────────────────────────────────────────

function ActionSection({ exam, onAskAI }) {
  const markers = Array.isArray(exam?.markers) ? exam.markers : [];
  const abnormal = markers.filter((m) => m.status && m.status !== 'normal');
  const aiInsights = exam?.ai_insights;

  return (
    <div className="space-y-4">
      {/* AI Insights (if saved) */}
      {aiInsights?.analysis && (
        <Card className="px-5 py-4 border-[hsl(var(--brand)/0.12)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.04)_0%,hsl(var(--card))_100%)]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[hsl(var(--brand))]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand))]">AI Analysis</p>
          </div>
          <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{aiInsights.analysis}</p>
          {Array.isArray(aiInsights.recommendations) && aiInsights.recommendations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {aiInsights.recommendations.slice(0, 4).map((item) => (
                <span key={item} className="rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-3 py-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">
                  {item}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Next steps / Ask AI */}
      <div className="rounded-2xl border border-[hsl(var(--brand)/0.12)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.06)_0%,hsl(var(--card))_100%)] p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center shrink-0">
            <Brain size={18} className="text-[hsl(var(--brand))]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] font-semibold text-[hsl(var(--fg))]">What should I do next?</h4>
            <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
              {abnormal.length > 0
                ? `You have ${abnormal.length} marker${abnormal.length > 1 ? 's' : ''} outside the reference range. Ask AI for a plain-language explanation and actionable next steps.`
                : 'All markers are within range. Ask AI for context on how to maintain these levels.'}
            </p>
            <button
              onClick={() => onAskAI?.(exam)}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
            >
              <Brain size={14} />
              Ask AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analysis Panel (detail view for a selected exam) ──────────────────────────

function AnalysisPanel({ exam, onClose, onAskAI }) {
  const markers = Array.isArray(exam.markers) ? exam.markers : [];
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Close button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-2 text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill)/0.4)]"
        >
          <X size={16} />
        </button>
      </div>

      {/* 1. Summary Banner */}
      <SummaryBanner exam={exam} />

      {/* 2. Category Cards */}
      {markers.length > 0 && (
        <Section title="Categories">
          <CategoryCards
            markers={markers}
            onCategoryClick={setActiveCategory}
            activeCategory={activeCategory}
          />
        </Section>
      )}

      {/* Active category heading */}
      {activeCategory && CATEGORIES[activeCategory] && (
        <div className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', CATEGORIES[activeCategory].bgColor)}>
            {React.createElement(CATEGORIES[activeCategory].icon, { size: 14, className: CATEGORIES[activeCategory].color })}
          </div>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {CATEGORIES[activeCategory].label}
          </h3>
          <button
            onClick={() => setActiveCategory(null)}
            className="ml-auto text-[11px] text-[hsl(var(--brand))] font-medium"
          >
            Show all
          </button>
        </div>
      )}

      {/* 3. Biomarker Details */}
      {markers.length > 0 && (
        <MarkersList markers={markers} activeCategory={activeCategory} />
      )}

      {/* Notes */}
      {exam.notes && (
        <Card className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Notes</p>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))] italic">&ldquo;{exam.notes}&rdquo;</p>
        </Card>
      )}

      {/* 4. Actions / Next Steps */}
      <ActionSection exam={exam} onAskAI={onAskAI} />
    </motion.div>
  );
}

// ── Exam Row in List ──────────────────────────────────────────────────────────

function ExamRow({ exam, onClick, onDelete, isSelected }) {
  const summary = summarizeExam(exam);
  const abnormalCount = summary.low + summary.high + summary.critical;
  const hasAbnormal = abnormalCount > 0;

  return (
    <div
      onClick={() => onClick(exam)}
      className={cn(
        'group flex items-center justify-between p-4 cursor-pointer border-b border-[hsl(var(--separator))] last:border-0 transition-all',
        isSelected
          ? 'bg-primary/5 border-l-4 border-l-primary'
          : 'hover:bg-[hsl(var(--fill))] border-l-4 border-l-transparent'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          hasAbnormal ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
        )}>
          <FileText size={18} />
        </div>
        <div>
          <h4 className="font-medium text-[hsl(var(--fg))]">{exam.panel_name}</h4>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-[hsl(var(--fg-3))]" />
            <p className="text-xs text-[hsl(var(--fg-2))]">{formatExamDate(exam.exam_date)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[hsl(var(--fg))]">{summary.total} markers</p>
          {hasAbnormal ? (
            <p className="text-xs text-rose-600 font-medium">{abnormalCount} need attention</p>
          ) : (
            <p className="text-xs text-emerald-600">All normal</p>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(exam.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]"
            aria-label={`Delete ${exam.panel_name}`}
          >
            <Trash2 size={16} />
          </button>
        )}
        <ChevronRight size={16} className={cn(
          'transition-colors',
          isSelected ? 'text-primary' : 'text-[hsl(var(--fg-3))]'
        )} />
      </div>
    </div>
  );
}

// ── Upload Dialog ─────────────────────────────────────────────────────────────

function UploadDialog({ isOpen, onClose, onUpload, isExtracting, error }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border)/0.82)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold text-[hsl(var(--fg))] flex items-center gap-2">
            <Sparkles size={18} className="text-[hsl(var(--brand))]" />
            AI Lab Analysis
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[hsl(var(--fg-2))]">
            Upload your lab results for instant AI-powered insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <input
              type="file"
              onChange={onUpload}
              accept="application/pdf,image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isExtracting}
            />
            <div className={cn(
              'border border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all',
              isExtracting
                ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.04)]'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.04)]'
            )}>
              {isExtracting ? (
                <>
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--brand)/0.12)] flex items-center justify-center mb-3">
                    <Loader2 className="w-5 h-5 text-[hsl(var(--brand))] animate-spin" />
                  </div>
                  <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Analyzing...</p>
                  <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1">Extracting markers with AI</p>
                </>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--brand)/0.08)] flex items-center justify-center mb-3">
                    <Upload size={20} className="text-[hsl(var(--brand))]" />
                  </div>
                  <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Upload lab results</p>
                  <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1">PDF, JPG, or PNG up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-[hsl(var(--err)/0.08)] border border-[hsl(var(--err)/0.2)] p-3 text-[12px] text-[hsl(var(--err))]">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--border)/0.5)]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-[hsl(var(--card))] px-3 text-[hsl(var(--fg-3))]">or</span>
            </div>
          </div>

          <SecondaryButton className="w-full" disabled={isExtracting} onClick={() => { onClose(); toast.info('Manual marker entry coming soon.'); }}>
            <Plus size={16} className="mr-2" />
            Enter markers manually
          </SecondaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Empty State Hero ──────────────────────────────────────────────────────────

function EmptyHero({ onUploadClick }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--fill))] border border-[hsl(var(--separator))] p-8 md:p-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <Sparkles size={12} />
          <span>AI-Powered Health Intelligence</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--fg))] mb-3">
          Understand your health markers
        </h1>
        <p className="text-lg text-[hsl(var(--fg-2))] max-w-2xl mb-8">
          Upload your lab results and get clear insights on what matters.
          We analyze your markers and show you exactly what to improve.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Activity, label: 'Summary first', desc: 'See what matters instantly' },
            { icon: TrendingUp, label: 'Category breakdown', desc: 'Metabolic, hormonal, lipids...' },
            { icon: Target, label: 'What to improve', desc: 'Actionable next steps' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--fill))] flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--fg))]">{item.label}</p>
                <p className="text-xs text-[hsl(var(--fg-2))]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton onClick={onUploadClick} className="h-12 px-6 text-base">
            <Upload size={18} className="mr-2" />
            Upload your lab results
          </PrimaryButton>
          <p className="text-sm text-[hsl(var(--fg-2))]">
            PDF or image &middot; Auto-extracted &middot; Analyzed in seconds
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LabExams() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedExam, setSelectedExam] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Queries
  const { data: exams = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['lab_exams', user?.id],
    queryFn: () => labService.listExams(user?.id),
    enabled: !!user?.id,
  });

  const hasExams = exams.length > 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => labService.createExam(user?.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['lab_exams']);
      setIsUploadDialogOpen(false);
      toast.success('Lab results analyzed and saved!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => labService.deleteExam(user?.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lab_exams']);
      setSelectedExam(null);
      toast.success('Exam deleted');
    },
  });

  // Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setUploadError(null);
    try {
      const data = await labService.extractExamFromFile(file);
      await createMutation.mutateAsync({
        panel_name: data.panel_name || file.name.split('.')[0],
        exam_date: data.exam_date || new Date().toISOString().split('T')[0],
        markers: data.markers || [],
      });
    } catch (err) {
      const msg = err?.message || 'Failed to extract data from file';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
  };

  const handleAskAI = () => {
    toast.info('AI Q&A feature coming soon!');
  };

  return (
    <PageShell title={t('pages.lab_exams.title')}>
      <AppContainer>
        <div className="space-y-8">
          {/* Show hero when no exams and no selected exam */}
          {!hasExams && !isLoading && !isError && !selectedExam && (
            <EmptyHero onUploadClick={() => setIsUploadDialogOpen(true)} />
          )}

          {isError && (
            <StatusBanner tone="error">
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-[hsl(var(--fg))]">Could not load lab results.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-[12px] font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            </StatusBanner>
          )}

          {/* Main content grid */}
          <AnimatePresence mode="wait">
            {selectedExam ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AnalysisPanel
                  exam={selectedExam}
                  onClose={() => setSelectedExam(null)}
                  onAskAI={handleAskAI}
                />
              </motion.div>
            ) : hasExams ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Quick summary of most recent exam */}
                {exams[0] && (
                  <SummaryBanner exam={exams[0]} />
                )}

                {/* Category overview of most recent exam */}
                {exams[0]?.markers?.length > 0 && (
                  <Section title="Categories">
                    <CategoryCards
                      markers={exams[0].markers}
                      onCategoryClick={() => setSelectedExam(exams[0])}
                      activeCategory={null}
                    />
                  </Section>
                )}

                {/* Exam list */}
                <Section title="Your Lab History">
                  <Card className="overflow-hidden">
                    <div className="divide-y divide-[hsl(var(--separator))]">
                      {exams.map((exam) => (
                        <ExamRow
                          key={exam.id}
                          exam={exam}
                          onClick={handleExamClick}
                          onDelete={(id) => {
                            if (confirm('Delete this exam?')) {
                              deleteMutation.mutate(id);
                            }
                          }}
                          isSelected={false}
                        />
                      ))}
                    </div>

                    <div className="p-4 border-t border-[hsl(var(--separator))]">
                      <button
                        onClick={() => setIsUploadDialogOpen(true)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-[hsl(var(--separator))] hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium text-[hsl(var(--fg-2))] hover:text-primary"
                      >
                        <Plus size={16} />
                        Add new lab results
                      </button>
                    </div>
                  </Card>
                </Section>
              </motion.div>
            ) : isLoading ? (
              <LoadingState
                title="Loading lab history"
                description="Reading saved exams and marker summaries."
              />
            ) : null}
          </AnimatePresence>
        </div>
      </AppContainer>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => !isExtracting && setIsUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        isExtracting={isExtracting}
        error={uploadError}
      />
    </PageShell>
  );
}
