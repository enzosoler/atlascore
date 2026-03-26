import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

import { useAuth } from '@/lib/AuthContext';
import { formatDate, getToday } from '@/lib/atlas-theme';
import { useI18n } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DialogPanelHeader,
  EmptyState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';

import {
  createExam,
  deleteExam,
  extractExamFromFile,
  generateExamInsights,
  listExams,
  updateExam,
  uploadLabFile,
} from '@/services/labExamService';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants & helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUS_META = {
  normal:   { variant: 'success',     icon: CheckCircle2, tone: 'ok' },
  low:      { variant: 'warning',     icon: TrendingDown,  tone: 'warn' },
  high:     { variant: 'warning',     icon: TrendingUp,    tone: 'warn' },
  critical: { variant: 'destructive', icon: AlertTriangle,  tone: 'err' },
};

function statusLabel(status, t) {
  return t(`pages.lab_exams.status.${status}`) || status;
}

function countAbnormal(markers) {
  return (markers || []).filter((m) => m.status && m.status !== 'normal').length;
}

const emptyMarker = () => ({
  name: '',
  value: '',
  unit: '',
  reference_min: '',
  reference_max: '',
  status: 'normal',
});

/** Group exams by month-year for timeline display */
function groupByMonth(exams) {
  const groups = {};
  for (const exam of exams) {
    const d = new Date(exam.exam_date + 'T12:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = { key, label: '', exams: [] };
    groups[key].exams.push(exam);
  }
  for (const g of Object.values(groups)) {
    const [y, m] = g.key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    g.label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components — List view
   ═══════════════════════════════════════════════════════════════════════════ */

/** Compact stat pill for the overview strip */
function StatPill({ label, value, icon: Icon, accentClassName }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.8)] px-4 py-3 shadow-[var(--shadow-xs)]">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
          accentClassName,
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[20px] font-semibold tabular-nums leading-tight tracking-[-0.03em] text-[hsl(var(--fg))]">
          {value}
        </p>
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))]">{label}</p>
      </div>
    </div>
  );
}

/** A single exam row in the list */
function ExamListRow({ exam, onClick, onDelete, t }) {
  const markers = exam.markers || [];
  const abnormal = countAbnormal(markers);
  const dateStr = formatDate(exam.exam_date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="group flex w-full items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-4 py-3.5 text-left transition-all hover:border-[hsl(var(--brand)/0.22)] hover:shadow-[var(--shadow-sm)]"
      >
        {/* Status dot */}
        <div
          className={cn(
            'h-2.5 w-2.5 shrink-0 rounded-full',
            abnormal > 0 ? 'bg-[hsl(var(--warn))]' : 'bg-[hsl(var(--ok))]',
          )}
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9rem] font-semibold text-[hsl(var(--fg))]">
            {exam.panel_name}
          </p>
          <p className="mt-0.5 text-xs text-[hsl(var(--fg-3))]">
            {dateStr}
            <span className="mx-1.5 text-[hsl(var(--fg-3)/0.5)]">&middot;</span>
            {markers.length} {t('pages.lab_exams.markers_count')}
          </p>
        </div>

        {/* Status badge */}
        {abnormal > 0 ? (
          <Badge variant="warning" className="shrink-0 text-[10px]">
            {abnormal} {t('pages.lab_exams.out_of_range')}
          </Badge>
        ) : markers.length > 0 ? (
          <Badge variant="success" className="shrink-0 text-[10px]">
            {t('pages.lab_exams.all_in_range')}
          </Badge>
        ) : null}

        {/* Delete (on hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[hsl(var(--fg-3))] opacity-0 transition-all hover:text-[hsl(var(--err))] group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </motion.button>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages.lab_exams.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.lab_exams.delete_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('pages.lab_exams.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(exam.id)}
              className="bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err)/0.9)]"
            >
              {t('pages.lab_exams.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components — Detail view
   ═══════════════════════════════════════════════════════════════════════════ */

/** Compact marker table row */
function MarkerTableRow({ marker, t }) {
  const cfg = STATUS_META[marker.status] || STATUS_META.normal;
  const StatusIcon = cfg.icon;
  const hasRef = marker.reference_min != null || marker.reference_max != null;
  const isAbnormal = marker.status && marker.status !== 'normal';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 transition-colors',
        isAbnormal
          ? 'bg-[hsl(var(--warn)/0.06)] hover:bg-[hsl(var(--warn)/0.1)]'
          : 'hover:bg-[hsl(var(--fill)/0.5)]',
      )}
    >
      {/* Status indicator */}
      <StatusIcon
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          isAbnormal ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--ok)/0.6)]',
        )}
      />

      {/* Name + ref range */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[hsl(var(--fg))]">{marker.name}</p>
        {hasRef ? (
          <p className="text-[10px] text-[hsl(var(--fg-3))]">
            {marker.reference_min ?? '–'} — {marker.reference_max ?? '–'} {marker.unit || ''}
          </p>
        ) : null}
      </div>

      {/* Value */}
      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[hsl(var(--fg))]">
        {marker.value}
        {marker.unit ? (
          <span className="ml-1 text-[11px] font-normal text-[hsl(var(--fg-3))]">
            {marker.unit}
          </span>
        ) : null}
      </span>

      {/* Status badge — only show if abnormal */}
      {isAbnormal ? (
        <Badge variant={cfg.variant} className="shrink-0 gap-0.5 text-[9px]">
          {statusLabel(marker.status, t)}
        </Badge>
      ) : null}
    </div>
  );
}

/** Mini trend sparkline for a single marker */
function MarkerSparkline({ markerName, data }) {
  if (!data || data.length < 2) return null;

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const oldest = sorted[0];
  const change = Number(latest?.value || 0) - Number(oldest?.value || 0);
  const isUp = change > 0;

  const lineColor =
    latest?.status === 'normal'
      ? 'hsl(var(--ok))'
      : latest?.status === 'critical'
        ? 'hsl(var(--err))'
        : 'hsl(var(--warn))';

  const chartData = sorted.map((entry) => ({
    date: entry.date,
    value: Number(entry.value || 0),
    label: new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">{markerName}</p>
        <span
          className={cn(
            'text-[11px] font-medium tabular-nums',
            isUp ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--ok))]',
          )}
        >
          {isUp ? '+' : ''}
          {change.toFixed(1)} {latest?.unit || ''}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <RechartsTooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '10px',
              fontSize: '11px',
              padding: '4px 8px',
            }}
            formatter={(value) => [`${value}`, markerName]}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 2.5, fill: lineColor }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** AI Insights panel */
function InsightsPanel({ insights, loading, onGenerate, t }) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[16px] bg-[hsl(var(--brand)/0.04)] p-4">
        <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--brand))]" />
        <p className="text-sm text-[hsl(var(--fg-2))]">{t('pages.lab_exams.generating_insights')}</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <button
        type="button"
        onClick={onGenerate}
        className="flex w-full items-center gap-3 rounded-[16px] border border-dashed border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.03)] px-4 py-3.5 text-left transition-colors hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.06)]"
      >
        <Sparkles className="h-4.5 w-4.5 shrink-0 text-[hsl(var(--brand))]" />
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--fg))]">
            {t('pages.lab_exams.generate_insights')}
          </p>
          <p className="mt-0.5 text-xs text-[hsl(var(--fg-2))]">
            {t('pages.lab_exams.insights_description')}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-[16px] border border-[hsl(var(--brand)/0.14)] bg-[hsl(var(--brand)/0.03)] p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" />
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
          {t('pages.lab_exams.ai_insights')}
        </p>
      </div>

      {insights.summary ? (
        <p className="text-sm leading-relaxed text-[hsl(var(--fg))]">{insights.summary}</p>
      ) : null}

      {insights.insights?.length > 0 ? (
        <ul className="space-y-1.5">
          {insights.insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand))]" />
              {insight}
            </li>
          ))}
        </ul>
      ) : null}

      {insights.recommendations?.length > 0 ? (
        <div className="space-y-1.5 border-t border-[hsl(var(--brand)/0.1)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--brand)/0.6)]">
            {t('pages.lab_exams.recommendations')}
          </p>
          <ul className="space-y-1.5">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--ok))]" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {insights.disclaimer ? (
        <p className="text-[10px] italic leading-5 text-[hsl(var(--fg-3))]">
          {insights.disclaimer}
        </p>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Exam Detail View
   ═══════════════════════════════════════════════════════════════════════════ */

function ExamDetailView({ exam, allExams, onBack, onDelete, onInsightsUpdate, t }) {
  const { user } = useAuth();
  const markers = exam.markers || [];
  const abnormal = countAbnormal(markers);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState(() => {
    if (exam.ai_insights) {
      try {
        return typeof exam.ai_insights === 'string'
          ? JSON.parse(exam.ai_insights)
          : exam.ai_insights;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMarkers = useMemo(() => {
    if (filterStatus === 'all') return markers;
    if (filterStatus === 'abnormal') return markers.filter((m) => m.status && m.status !== 'normal');
    return markers.filter((m) => !m.status || m.status === 'normal');
  }, [markers, filterStatus]);

  // Build trends for markers in THIS exam from ALL exams
  const markerTrends = useMemo(() => {
    const markerNames = new Set(markers.map((m) => m.name));
    const trends = {};
    for (const ex of allExams) {
      for (const m of ex.markers || []) {
        if (markerNames.has(m.name)) {
          if (!trends[m.name]) trends[m.name] = [];
          trends[m.name].push({
            date: ex.exam_date,
            value: m.value,
            unit: m.unit,
            status: m.status,
          });
        }
      }
    }
    return trends;
  }, [markers, allExams]);

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);
    try {
      let profile = null;
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          const pd = data.profile_data && typeof data.profile_data === 'object' ? data.profile_data : {};
          profile = { ...pd, ...data };
          delete profile.profile_data;
        }
      }

      const result = await generateExamInsights(exam, profile);
      if (result) {
        setInsights(result);
        try {
          await updateExam(user.id, exam.id, { ai_insights: JSON.stringify(result) });
          onInsightsUpdate?.(exam.id, result);
        } catch {
          // Non-fatal
        }
        toast.success(t('pages.lab_exams.insights_generated'));
      } else {
        toast.error(t('pages.lab_exams.insights_error'));
      }
    } catch {
      toast.error(t('pages.lab_exams.insights_error'));
    } finally {
      setInsightsLoading(false);
    }
  };

  const trendEntries = Object.entries(markerTrends).filter(([, data]) => data.length > 1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-5"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.74)] text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {exam.panel_name}
          </h2>
          <p className="text-sm text-[hsl(var(--fg-2))]">{formatDate(exam.exam_date)}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Quick summary strip ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {markers.length} {t('pages.lab_exams.markers_count')}
        </Badge>
        {abnormal > 0 ? (
          <Badge variant="warning">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {abnormal} {t('pages.lab_exams.out_of_range')}
          </Badge>
        ) : markers.length > 0 ? (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t('pages.lab_exams.all_in_range')}
          </Badge>
        ) : null}
      </div>

      {/* ── Two-column layout: Markers + Sidebar ────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left: Markers */}
        <div className="space-y-4">
          {markers.length > 0 ? (
            <div>
              {/* Filter pills */}
              {abnormal > 0 ? (
                <div className="mb-3 flex gap-1.5">
                  {['all', 'abnormal', 'normal'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilterStatus(f)}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                        filterStatus === f
                          ? 'bg-[hsl(var(--brand)/0.14)] text-[hsl(var(--brand))]'
                          : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]',
                      )}
                    >
                      {f === 'all'
                        ? t('pages.lab_exams.filter_all')
                        : f === 'abnormal'
                          ? t('pages.lab_exams.filter_abnormal')
                          : t('pages.lab_exams.filter_normal')}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Marker list */}
              <div className="space-y-1">
                <AnimatePresence>
                  {filteredMarkers.map((marker, index) => (
                    <motion.div
                      key={`${marker.name}-${index}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <MarkerTableRow marker={marker} t={t} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {exam.notes ? (
            <SectionCard title={t('pages.lab_exams.notes_title')}>
              <p className="text-sm leading-6 text-[hsl(var(--fg-2))]">{exam.notes}</p>
            </SectionCard>
          ) : null}
        </div>

        {/* Right: Trends + AI Insights */}
        <div className="space-y-4">
          {/* Trends */}
          {trendEntries.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                {t('pages.lab_exams.evolution')}
              </p>
              {trendEntries.slice(0, 6).map(([name, data]) => (
                <MarkerSparkline key={name} markerName={name} data={data} />
              ))}
            </div>
          ) : null}

          {/* AI Insights */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {t('pages.lab_exams.ai_insights')}
            </p>
            <InsightsPanel
              insights={insights}
              loading={insightsLoading}
              onGenerate={handleGenerateInsights}
              t={t}
            />
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages.lab_exams.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.lab_exams.delete_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('pages.lab_exams.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(exam.id);
                onBack();
              }}
              className="bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err)/0.9)]"
            >
              {t('pages.lab_exams.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Add Exam Dialog
   ═══════════════════════════════════════════════════════════════════════════ */

function AddExamDialog({ open, onOpenChange, onSave, saving, t }) {
  const [form, setForm] = useState({
    exam_date: getToday(),
    panel_name: '',
    markers: [emptyMarker()],
    notes: '',
  });
  const [importing, setImporting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [importedCount, setImportedCount] = useState(0);
  const [importedFile, setImportedFile] = useState(null);
  const [expandedMarker, setExpandedMarker] = useState(null);

  const resetForm = () => {
    setForm({ exam_date: getToday(), panel_name: '', markers: [emptyMarker()], notes: '' });
    setFormErrors({});
    setImportedCount(0);
    setImportedFile(null);
    setExpandedMarker(null);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportedFile(file);
    try {
      const result = await extractExamFromFile(file);

      if (result) {
        setForm((prev) => ({
          ...prev,
          panel_name: result.panel_name || prev.panel_name,
          exam_date: result.exam_date || prev.exam_date,
          markers: result.markers?.length
            ? result.markers.map((m) => ({
                name: m.name || '',
                value: m.value != null ? String(m.value) : '',
                unit: m.unit || '',
                reference_min: m.reference_min != null ? String(m.reference_min) : '',
                reference_max: m.reference_max != null ? String(m.reference_max) : '',
                status: m.status || 'normal',
              }))
            : prev.markers,
        }));
        const count = result.markers?.length || 0;
        setImportedCount(count);
        toast.success(t('pages.lab_exams.import_success', { count }));
      } else {
        toast.error(t('pages.lab_exams.import_error'));
      }
    } catch (err) {
      console.error('[LabExams] Import error:', err);
      toast.error(t('pages.lab_exams.import_error'));
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const addMarker = () =>
    setForm((prev) => ({ ...prev, markers: [...prev.markers, emptyMarker()] }));

  const removeMarker = (index) =>
    setForm((prev) => ({
      ...prev,
      markers: prev.markers.filter((_, i) => i !== index),
    }));

  const updateMarker = (index, field, value) =>
    setForm((prev) => {
      const next = [...prev.markers];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, markers: next };
    });

  const handleSave = () => {
    const errors = {};
    if (!form.panel_name?.trim()) errors.panel_name = t('pages.lab_exams.panel_name_required');
    if (!form.exam_date) errors.exam_date = t('pages.lab_exams.date_required');

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...form,
      markers: form.markers
        .filter((m) => m.name?.trim())
        .map((m) => ({
          ...m,
          value: m.value !== '' ? Number(m.value) : undefined,
          reference_min: m.reference_min !== '' ? Number(m.reference_min) : undefined,
          reference_max: m.reference_max !== '' ? Number(m.reference_max) : undefined,
        })),
      _file: importedFile,
    };

    setFormErrors({});
    onSave(payload);
  };

  const filledMarkers = form.markers.filter((m) => m.name?.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogPanelHeader
          eyebrow={t('pages.lab_exams.lab_import')}
          title={t('pages.lab_exams.add_exam')}
          description={t('pages.lab_exams.add_exam_description')}
          accentClassName="from-[hsl(var(--brand)/0.18)] via-[hsl(var(--accent-secondary)/0.08)]"
        />

        <DialogHeader className="sr-only">
          <DialogTitle>{t('pages.lab_exams.add_exam')}</DialogTitle>
          <DialogDescription>{t('pages.lab_exams.add_exam_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-5 lg:p-6">
          {/* ── Import area ─────────────────────────────────────────── */}
          <label
            className={cn(
              'flex cursor-pointer items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-5 py-5 text-center transition-all',
              importing
                ? 'pointer-events-none border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.04)] opacity-70'
                : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.04)]',
            )}
          >
            {importing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--brand))]" />
                <p className="text-sm font-semibold text-[hsl(var(--brand))]">
                  {t('pages.lab_exams.importing')}
                </p>
                <p className="text-xs text-[hsl(var(--fg-2))]">
                  {t('pages.lab_exams.import_analyzing')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="h-5 w-5 text-[hsl(var(--fg-3))]" />
                <p className="text-sm font-semibold text-[hsl(var(--fg))]">
                  {t('pages.lab_exams.import_pdf_title')}
                </p>
                <p className="max-w-sm text-xs leading-5 text-[hsl(var(--fg-3))]">
                  {t('pages.lab_exams.import_pdf_hint')}
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleImportFile}
            />
          </label>

          {importedCount > 0 ? (
            <StatusBanner tone="success">
              <p className="font-semibold">
                {t('pages.lab_exams.import_banner', { count: importedCount })}
              </p>
              <p className="mt-0.5 text-[12px] opacity-80">
                {t('pages.lab_exams.import_review_hint')}
              </p>
            </StatusBanner>
          ) : null}

          {/* ── Panel name + date ───────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                {t('pages.lab_exams.panel_name')}
              </label>
              <Input
                placeholder={t('pages.lab_exams.panel_placeholder')}
                value={form.panel_name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, panel_name: e.target.value }));
                  if (formErrors.panel_name)
                    setFormErrors((prev) => ({ ...prev, panel_name: undefined }));
                }}
                className={cn(
                  'h-11',
                  formErrors.panel_name &&
                    'border-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.3)]',
                )}
              />
              {formErrors.panel_name ? (
                <p className="text-[12px] text-[hsl(var(--err))]">{formErrors.panel_name}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                {t('pages.lab_exams.exam_date')}
              </label>
              <Input
                type="date"
                value={form.exam_date}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, exam_date: e.target.value }));
                  if (formErrors.exam_date)
                    setFormErrors((prev) => ({ ...prev, exam_date: undefined }));
                }}
                className={cn(
                  'h-11',
                  formErrors.exam_date &&
                    'border-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.3)]',
                )}
              />
              {formErrors.exam_date ? (
                <p className="text-[12px] text-[hsl(var(--err))]">{formErrors.exam_date}</p>
              ) : null}
            </div>
          </div>

          {/* ── Markers ─────────────────────────────────────────────── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                  {t('pages.lab_exams.markers_title')}
                </p>
                {filledMarkers.length > 0 ? (
                  <p className="text-[11px] text-[hsl(var(--fg-3))]">
                    {filledMarkers.length} {t('pages.lab_exams.markers_count')}
                    {importedCount > 0 ? ` — ${t('pages.lab_exams.auto_extracted')}` : ''}
                  </p>
                ) : null}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addMarker}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t('pages.lab_exams.add_marker')}
              </Button>
            </div>

            <div className="space-y-1.5">
              {form.markers.map((marker, index) => {
                const isExpanded = expandedMarker === index;
                const hasName = marker.name?.trim();
                const statusCfg = STATUS_META[marker.status] || STATUS_META.normal;

                return (
                  <div
                    key={`marker-${index}`}
                    className={cn(
                      'rounded-[14px] border transition-colors',
                      hasName
                        ? 'border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.8)]'
                        : 'border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)]',
                    )}
                  >
                    {/* Compact row */}
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        {hasName ? (
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-semibold text-[hsl(var(--fg))]">
                              {marker.name}
                            </span>
                            {marker.value ? (
                              <span className="shrink-0 text-[13px] tabular-nums text-[hsl(var(--fg-2))]">
                                {marker.value} {marker.unit}
                              </span>
                            ) : null}
                            {marker.status && marker.status !== 'normal' ? (
                              <Badge variant={statusCfg.variant} className="text-[9px]">
                                {statusLabel(marker.status, t)}
                              </Badge>
                            ) : null}
                          </div>
                        ) : (
                          <Input
                            placeholder={t('pages.lab_exams.marker_name')}
                            value={marker.name}
                            onChange={(e) => updateMarker(index, 'name', e.target.value)}
                            className="h-8 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedMarker(isExpanded ? null : index)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
                      >
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMarker(index)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--err))]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[hsl(var(--border)/0.5)] px-3 pb-3 pt-2.5"
                      >
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                              {t('pages.lab_exams.marker_name')}
                            </label>
                            <Input
                              value={marker.name}
                              onChange={(e) => updateMarker(index, 'name', e.target.value)}
                              className="h-8 text-[13px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                              {t('pages.lab_exams.marker_value')}
                            </label>
                            <Input
                              type="number"
                              value={marker.value}
                              onChange={(e) => updateMarker(index, 'value', e.target.value)}
                              className="h-8 text-[13px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                              {t('pages.lab_exams.marker_unit')}
                            </label>
                            <Input
                              value={marker.unit}
                              onChange={(e) => updateMarker(index, 'unit', e.target.value)}
                              className="h-8 text-[13px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                                {t('pages.lab_exams.ref_min')}
                              </label>
                              <Input
                                type="number"
                                value={marker.reference_min}
                                onChange={(e) => updateMarker(index, 'reference_min', e.target.value)}
                                className="h-8 text-[13px]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                                {t('pages.lab_exams.ref_max')}
                              </label>
                              <Input
                                type="number"
                                value={marker.reference_max}
                                onChange={(e) => updateMarker(index, 'reference_max', e.target.value)}
                                className="h-8 text-[13px]"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Notes ───────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">
              {t('pages.lab_exams.notes_title')}
            </label>
            <Textarea
              placeholder={t('pages.lab_exams.notes_placeholder')}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="min-h-[72px] resize-y text-[13px]"
            />
          </div>

          {/* ── Save ────────────────────────────────────────────────── */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('pages.lab_exams.saving')}
              </>
            ) : (
              t('pages.lab_exams.save_exam')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LabExams() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('pages.lab_exams.title')}
      subtitle={t('pages.lab_exams.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription={t('pages.lab_exams.status.normal')}
    >
      <LabExamsContent />
    </SafePageBoundary>
  );
}

function LabExamsContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['lab-exams', user?.id],
    queryFn: () => (user?.id ? listExams(user.id) : []),
    enabled: Boolean(user?.id),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      let sourceFile = null;
      if (payload._file) {
        sourceFile = await uploadLabFile(user.id, payload._file);
        delete payload._file;
      }
      return createExam(user.id, { ...payload, source_file: sourceFile });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-exams'] });
      setShowAdd(false);
      toast.success(t('pages.lab_exams.exam_saved'));
    },
    onError: (err) => {
      console.error('[LabExams] Create error:', err);
      toast.error(t('pages.lab_exams.save_error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExam(user.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-exams'] });
      setSelectedExamId(null);
      toast.success(t('pages.lab_exams.exam_deleted'));
    },
  });

  // ── Computed ─────────────────────────────────────────────────────────────

  const selectedExam = useMemo(
    () => exams.find((e) => e.id === selectedExamId) || null,
    [exams, selectedExamId],
  );

  const abnormalMarkers = exams.reduce(
    (total, exam) => total + countAbnormal(exam.markers),
    0,
  );
  const trackedMarkers = exams.reduce(
    (total, exam) => total + (exam.markers?.length || 0),
    0,
  );

  const monthGroups = useMemo(() => groupByMonth(exams), [exams]);

  const handleInsightsUpdate = useCallback(
    (examId, insightsObj) => {
      qc.setQueryData(['lab-exams', user?.id], (old) =>
        (old || []).map((e) =>
          e.id === examId
            ? { ...e, ai_insights: typeof insightsObj === 'string' ? insightsObj : JSON.stringify(insightsObj) }
            : e,
        ),
      );
    },
    [qc, user?.id],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageShell
      title={t('pages.lab_exams.title')}
      subtitle={t('pages.lab_exams.subtitle')}
      actions={
        !selectedExam ? (
          <PrimaryButton
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('pages.lab_exams.new_exam')}
          </PrimaryButton>
        ) : null
      }
      maxWidth="max-w-6xl"
    >
      <AnimatePresence mode="wait">
        {selectedExam ? (
          /* ── Detail view ─────────────────────────────────────────── */
          <ExamDetailView
            key={`detail-${selectedExam.id}`}
            exam={selectedExam}
            allExams={exams}
            onBack={() => setSelectedExamId(null)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onInsightsUpdate={handleInsightsUpdate}
            t={t}
          />
        ) : (
          /* ── List view ───────────────────────────────────────────── */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Loading skeleton */}
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[64px] w-full rounded-[20px]" />
                ))}
              </div>
            ) : null}

            {/* Summary stat strip — compact horizontal */}
            {!isLoading && exams.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                <StatPill
                  label={t('pages.lab_exams.panels')}
                  value={exams.length}
                  icon={FileText}
                  accentClassName="border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]"
                />
                <StatPill
                  label={t('pages.lab_exams.out_of_range_markers')}
                  value={abnormalMarkers}
                  icon={AlertTriangle}
                  accentClassName="border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]"
                />
                <StatPill
                  label={t('pages.lab_exams.tracked_markers')}
                  value={trackedMarkers}
                  icon={CheckCircle2}
                  accentClassName="border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]"
                />
              </div>
            ) : null}

            {/* Exam list — grouped by month */}
            {!isLoading && exams.length === 0 ? (
              <EmptyState
                title={t('pages.lab_exams.empty_title')}
                description={t('pages.lab_exams.empty_state')}
                icon={Heart}
                action={
                  <PrimaryButton type="button" onClick={() => setShowAdd(true)}>
                    {t('pages.lab_exams.add_first')}
                  </PrimaryButton>
                }
              />
            ) : null}

            {!isLoading && exams.length > 0 ? (
              <div className="space-y-5">
                {monthGroups.map((group) => (
                  <div key={group.key}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                      {group.label}
                    </p>
                    <div className="space-y-1.5">
                      <AnimatePresence>
                        {group.exams.map((exam) => (
                          <ExamListRow
                            key={exam.id}
                            exam={exam}
                            onClick={() => setSelectedExamId(exam.id)}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            t={t}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add exam dialog */}
      <AddExamDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onSave={(payload) => createMutation.mutate(payload)}
        saving={createMutation.isPending}
        t={t}
      />
    </PageShell>
  );
}
