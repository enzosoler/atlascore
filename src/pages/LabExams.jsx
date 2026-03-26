import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
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
} from '@/services/labExamService';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants & helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUS_MAP = {
  normal:   { variant: 'success',     icon: CheckCircle2 },
  low:      { variant: 'warning',     icon: TrendingDown },
  high:     { variant: 'warning',     icon: TrendingUp },
  critical: { variant: 'destructive', icon: AlertTriangle },
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

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

/** Summary stat card at the top */
function StatTile({ label, value, hint, icon: Icon, accentClassName }) {
  return (
    <article className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="atlas-overline">{label}</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">{hint}</p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-2xl border shadow-[var(--shadow-xs)]',
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}

/** A single row in the exam list */
function ExamListRow({ exam, onClick, t }) {
  const markers = exam.markers || [];
  const abnormal = countAbnormal(markers);
  const dateStr = formatDate(exam.exam_date);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-5 py-4 text-left transition-all hover:border-[hsl(var(--brand)/0.22)] hover:shadow-[var(--shadow-sm)]"
    >
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.74)]">
        <FileText className="h-4.5 w-4.5 text-[hsl(var(--fg-2))]" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.94rem] font-semibold text-[hsl(var(--fg))]">
          {exam.panel_name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[hsl(var(--fg-2))]">
          <span>{dateStr}</span>
          <span className="text-[hsl(var(--fg-3))]">&middot;</span>
          <span>
            {markers.length} {t('pages.lab_exams.markers_count')}
          </span>
          {abnormal > 0 ? (
            <Badge variant="warning" className="ml-1 text-[10px]">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {abnormal} {t('pages.lab_exams.out_of_range')}
            </Badge>
          ) : markers.length > 0 ? (
            <Badge variant="success" className="ml-1 text-[10px]">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {t('pages.lab_exams.all_in_range')}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))] transition-transform group-hover:translate-x-0.5" />
    </motion.button>
  );
}

/** Marker row inside exam detail */
function MarkerRow({ marker, t }) {
  const cfg = STATUS_MAP[marker.status] || STATUS_MAP.normal;
  const StatusIcon = cfg.icon;
  const hasRef = marker.reference_min != null || marker.reference_max != null;

  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[hsl(var(--fg))]">{marker.name}</p>
        {hasRef ? (
          <p className="mt-0.5 text-[11px] text-[hsl(var(--fg-3))]">
            Ref: {marker.reference_min ?? '--'} – {marker.reference_max ?? '--'} {marker.unit || ''}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold tabular-nums text-[hsl(var(--fg))]">
          {marker.value} {marker.unit || ''}
        </span>
        <Badge variant={cfg.variant} className="gap-1 text-[10px]">
          <StatusIcon className="h-3 w-3" />
          {statusLabel(marker.status, t)}
        </Badge>
      </div>
    </div>
  );
}

/** Trend mini-chart for a marker */
function MarkerTrendCard({ markerName, data }) {
  const latest = data[data.length - 1];
  const oldest = data[0];
  const change = Number(latest?.value || 0) - Number(oldest?.value || 0);
  const isUp = change > 0;
  const toneClassName = isUp ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--ok))]';
  const barToneClassName =
    latest?.status === 'normal' ? 'bg-[hsl(var(--ok))]' : 'bg-[hsl(var(--warn))]';
  const maxValue = Math.max(...data.map((e) => Number(e.value || 0)), 1);

  return (
    <div className="atlas-card-muted p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{markerName}</p>
        <span className={`text-[12px] font-medium ${toneClassName}`}>
          {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(1)}
        </span>
      </div>
      <div className="flex h-14 items-end justify-between gap-1">
        {data.map((entry, index) => {
          const height = (Number(entry.value || 0) / maxValue) * 100;
          return (
            <div
              key={`${markerName}-${index}`}
              className={`flex-1 rounded-t-[10px] opacity-80 transition-opacity hover:opacity-100 ${barToneClassName}`}
              style={{ height: `${Math.max(height, 12)}%` }}
              title={`${entry.value} on ${entry.date}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/** AI Insights panel */
function InsightsPanel({ insights, loading, onGenerate, t }) {
  if (loading) {
    return (
      <div className="atlas-card-muted flex items-center gap-3 rounded-[20px] p-5">
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
        className="flex w-full items-center gap-3 rounded-[20px] border border-dashed border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-5 py-4 text-left transition-colors hover:border-[hsl(var(--brand)/0.3)]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)]">
          <Sparkles className="h-4.5 w-4.5 text-[hsl(var(--brand))]" />
        </div>
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
    <div className="space-y-3 rounded-[20px] border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.04)] p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" />
        <p className="text-sm font-semibold text-[hsl(var(--fg))]">
          {t('pages.lab_exams.ai_insights')}
        </p>
      </div>

      {insights.summary ? (
        <p className="text-sm font-medium text-[hsl(var(--fg))]">{insights.summary}</p>
      ) : null}

      {insights.insights?.length > 0 ? (
        <ul className="space-y-2">
          {insights.insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand))]" />
              {insight}
            </li>
          ))}
        </ul>
      ) : null}

      {insights.disclaimer ? (
        <p className="mt-2 text-[11px] italic leading-5 text-[hsl(var(--fg-3))]">
          {insights.disclaimer}
        </p>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Views
   ═══════════════════════════════════════════════════════════════════════════ */

/** Detail view for a single exam */
function ExamDetailView({ exam, onBack, onDelete, onInsightsUpdate, t }) {
  const { user } = useAuth();
  const markers = exam.markers || [];
  const abnormal = countAbnormal(markers);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState(() => {
    if (exam.insights) {
      try { return JSON.parse(exam.insights); } catch { return null; }
    }
    return null;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);
    try {
      // Fetch user profile for context
      let profile = null;
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('profile_data')
          .eq('id', user.id)
          .single();
        profile = data?.profile_data || null;
      }

      const result = await generateExamInsights(exam, profile);
      if (result) {
        setInsights(result);
        // Save insights to the exam record
        try {
          await updateExam(exam.id, { insights: JSON.stringify(result) });
          onInsightsUpdate?.(exam.id, JSON.stringify(result));
        } catch {
          // Non-fatal — insights are displayed even if save fails
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Header */}
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
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Summary badges */}
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

      {/* Markers list */}
      {markers.length > 0 ? (
        <SectionCard
          title={t('pages.lab_exams.markers_title')}
          subtitle={t('pages.lab_exams.markers_subtitle')}
        >
          <div className="space-y-2">
            {markers.map((marker, index) => (
              <MarkerRow key={`${marker.name}-${index}`} marker={marker} t={t} />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {/* Notes */}
      {exam.notes ? (
        <SectionCard title={t('pages.lab_exams.notes_title')}>
          <p className="text-sm leading-6 text-[hsl(var(--fg-2))]">{exam.notes}</p>
        </SectionCard>
      ) : null}

      {/* AI Insights */}
      <SectionCard
        title={t('pages.lab_exams.ai_insights')}
        subtitle={t('pages.lab_exams.ai_insights_subtitle')}
      >
        <InsightsPanel
          insights={insights}
          loading={insightsLoading}
          onGenerate={handleGenerateInsights}
          t={t}
        />
      </SectionCard>

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

  const resetForm = () => {
    setForm({ exam_date: getToday(), panel_name: '', markers: [emptyMarker()], notes: '' });
    setFormErrors({});
    setImportedCount(0);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
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
    };

    setFormErrors({});
    onSave(payload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
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

        <div className="space-y-6 p-6 lg:p-7">
          {/* File import */}
          <label
            className={cn(
              'flex cursor-pointer items-center justify-center gap-3 rounded-[24px] border border-dashed border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-5 py-5 text-center transition-colors hover:border-[hsl(var(--brand)/0.24)]',
              importing && 'pointer-events-none opacity-70',
            )}
          >
            {importing ? (
              <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--brand))]" />
            ) : (
              <Upload className="h-5 w-5 text-[hsl(var(--fg-2))]" />
            )}
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--fg))]">
                {importing
                  ? t('pages.lab_exams.importing')
                  : t('pages.lab_exams.import_pdf_title')}
              </p>
              <p className="mt-1 text-xs leading-5 text-[hsl(var(--fg-2))]">
                {t('pages.lab_exams.import_pdf_hint')}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleImportFile}
            />
          </label>

          {importedCount > 0 ? (
            <StatusBanner tone="success">
              {t('pages.lab_exams.import_banner', { count: importedCount })}
            </StatusBanner>
          ) : null}

          {/* Panel name + date */}
          <div className="grid gap-4 md:grid-cols-2">
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
                  'h-12',
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
                  'h-12',
                  formErrors.exam_date &&
                    'border-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.3)]',
                )}
              />
              {formErrors.exam_date ? (
                <p className="text-[12px] text-[hsl(var(--err))]">{formErrors.exam_date}</p>
              ) : null}
            </div>
          </div>

          {/* Markers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                  {t('pages.lab_exams.markers_title')}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">
                  {t('pages.lab_exams.markers_subtitle')}
                </p>
              </div>
              <Button type="button" variant="outline" className="h-10" onClick={addMarker}>
                <Plus className="h-4 w-4" />
                {t('pages.lab_exams.add_marker')}
              </Button>
            </div>

            <div className="space-y-2">
              {form.markers.map((marker, index) => (
                <div
                  key={`marker-${index}`}
                  className="atlas-card-muted grid gap-3 p-3 md:grid-cols-[1.5fr_0.8fr_0.8fr_auto]"
                >
                  <Input
                    placeholder={t('pages.lab_exams.marker_name')}
                    value={marker.name}
                    onChange={(e) => updateMarker(index, 'name', e.target.value)}
                    className="h-11"
                  />
                  <Input
                    type="number"
                    placeholder={t('pages.lab_exams.marker_value')}
                    value={marker.value}
                    onChange={(e) => updateMarker(index, 'value', e.target.value)}
                    className="h-11"
                  />
                  <Input
                    placeholder={t('pages.lab_exams.marker_unit')}
                    value={marker.unit}
                    onChange={(e) => updateMarker(index, 'unit', e.target.value)}
                    className="h-11"
                  />
                  <button
                    type="button"
                    onClick={() => removeMarker(index)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">
              {t('pages.lab_exams.notes_title')}
            </label>
            <Textarea
              placeholder={t('pages.lab_exams.notes_placeholder')}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? t('pages.lab_exams.saving') : t('pages.lab_exams.save_exam')}
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
    mutationFn: (payload) => createExam(user.id, payload),
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
    mutationFn: (id) => deleteExam(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-exams'] });
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

  const markerTrends = useMemo(() => {
    const trends = {};
    for (const exam of exams) {
      for (const marker of exam.markers || []) {
        if (!trends[marker.name]) trends[marker.name] = [];
        trends[marker.name].push({
          date: exam.exam_date,
          value: marker.value,
          status: marker.status,
        });
      }
    }
    return trends;
  }, [exams]);

  const handleInsightsUpdate = useCallback(
    (examId, insightsJson) => {
      qc.setQueryData(['lab-exams', user?.id], (old) =>
        (old || []).map((e) => (e.id === examId ? { ...e, insights: insightsJson } : e)),
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
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[72px] w-full rounded-[20px]" />
                ))}
              </div>
            ) : null}

            {/* Summary stats */}
            {!isLoading && exams.length > 0 ? (
              <section className="grid gap-3 md:grid-cols-3">
                <StatTile
                  label={t('pages.lab_exams.panels')}
                  value={exams.length}
                  hint={t('pages.lab_exams.panels_hint')}
                  icon={Heart}
                  accentClassName="border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]"
                />
                <StatTile
                  label={t('pages.lab_exams.out_of_range_markers')}
                  value={abnormalMarkers}
                  hint={t('pages.lab_exams.out_of_range_hint')}
                  icon={AlertTriangle}
                  accentClassName="border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]"
                />
                <StatTile
                  label={t('pages.lab_exams.tracked_markers')}
                  value={trackedMarkers}
                  hint={t('pages.lab_exams.tracked_hint')}
                  icon={CheckCircle2}
                  accentClassName="border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]"
                />
              </section>
            ) : null}

            {/* Trends */}
            {Object.keys(markerTrends).some((k) => markerTrends[k].length > 1) ? (
              <SectionCard
                title={t('pages.lab_exams.evolution')}
                subtitle={t('pages.lab_exams.recent_trends')}
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(markerTrends)
                    .filter(([, data]) => data.length > 1)
                    .map(([name, data]) => (
                      <MarkerTrendCard key={name} markerName={name} data={data} />
                    ))}
                </div>
              </SectionCard>
            ) : null}

            {/* Exam list */}
            <SectionCard
              title={t('pages.lab_exams.history')}
              subtitle={t('pages.lab_exams.history_subtitle')}
            >
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
                <div className="space-y-2">
                  <AnimatePresence>
                    {exams.map((exam) => (
                      <ExamListRow
                        key={exam.id}
                        exam={exam}
                        onClick={() => setSelectedExamId(exam.id)}
                        t={t}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : null}
            </SectionCard>
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
