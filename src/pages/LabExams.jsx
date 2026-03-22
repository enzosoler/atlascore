import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { formatDate, getToday } from '@/lib/atlas-theme';
import { useI18n } from '@/lib/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  LoadingState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';

function getStatusConfig(t) {
  return {
    normal: { label: t('pages.lab_exams.status.normal'), cls: 'badge badge-ok', tone: 'success' },
    low: { label: t('pages.lab_exams.status.low'), cls: 'badge badge-warn', tone: 'warning' },
    high: { label: t('pages.lab_exams.status.high'), cls: 'badge badge-err', tone: 'danger' },
    critical: { label: t('pages.lab_exams.status.critical'), cls: 'badge badge-err', tone: 'danger' },
  };
}

const emptyMarker = () => ({
  name: '',
  value: '',
  unit: '',
  reference_min: '',
  reference_max: '',
  status: 'normal',
});

function SummaryTile({ label, value, hint, accentClassName, icon: Icon }) {
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
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-[var(--shadow-xs)] ${accentClassName}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}

function MarkerTrendCard({ markerName, data }) {
  const latest = data[data.length - 1];
  const oldest = data[0];
  const change = Number(latest?.value || 0) - Number(oldest?.value || 0);
  const isUp = change > 0;
  const toneClassName = isUp
    ? 'text-[hsl(var(--warn))]'
    : 'text-[hsl(var(--ok))]';
  const barToneClassName = latest?.status === 'normal'
    ? 'bg-[hsl(var(--ok))]'
    : 'bg-[hsl(var(--warn))]';
  const maxValue = Math.max(...data.map((entry) => Number(entry.value || 0)), 1);

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

function ExamCard({
  exam,
  expanded,
  onToggle,
  onDelete,
  deletePending,
}) {
  const markers = exam.markers || [];
  const abnormal = markers.filter((marker) => marker.status && marker.status !== 'normal').length;

  return (
    <motion.div
      key={exam.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="atlas-card overflow-hidden rounded-[28px] border-[hsl(var(--border)/0.92)]"
    >
      <div className="flex items-center justify-between gap-4 p-5">
        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <h3 className="text-[1.02rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {exam.panel_name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2 text-xs text-[hsl(var(--fg-2))]">
            <span>{formatDate(exam.exam_date)}</span>
            <span>{markers.length} markers</span>
            {abnormal > 0 ? (
              <span className="flex items-center gap-1 text-[hsl(var(--warn))]">
                <AlertTriangle className="h-3.5 w-3.5" />
                {abnormal} out of range
              </span>
            ) : markers.length > 0 ? (
              <span className="flex items-center gap-1 text-[hsl(var(--ok))]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All in range
              </span>
            ) : null}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.74)] text-[hsl(var(--fg-2))]"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-[hsl(var(--border)/0.86)] px-5 pb-5 pt-4">
          <div className="space-y-2">
            {markers.map((marker, index) => (
              <div
                key={`${marker.name}-${index}`}
                className="flex flex-col gap-2 rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--fg))]">{marker.name}</p>
                  {(marker.reference_min != null || marker.reference_max != null) ? (
                    <p className="mt-1 text-xs text-[hsl(var(--fg-3))]">
                      Ref: {marker.reference_min ?? '--'} - {marker.reference_max ?? '--'}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[hsl(var(--fg))]">
                    {marker.value} {marker.unit}
                  </span>
                  {marker.status ? (
                    <span className={statusConfig[marker.status]?.cls || 'badge badge-neutral'}>
                      {statusConfig[marker.status]?.label}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {exam.notes ? (
            <p className="mt-4 text-sm italic leading-6 text-[hsl(var(--fg-2))]">{exam.notes}</p>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}

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
  const statusConfig = getStatusConfig(t);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({
    exam_date: getToday(),
    panel_name: '',
    markers: [emptyMarker()],
    notes: '',
  });
  const [importing, setImporting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const qc = useQueryClient();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['lab-exams'],
    queryFn: () => base44.entities.LabExam.list('-exam_date', 50),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (payload) => base44.entities.LabExam.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-exams'] });
      setShowAdd(false);
      setFormErrors({});
      setForm({ exam_date: getToday(), panel_name: '', markers: [emptyMarker()], notes: '' });
      toast.success('Exam recorded.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LabExam.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-exams'] });
      toast.success('Exam removed.');
    },
  });

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            panel_name: { type: 'string' },
            exam_date: { type: 'string' },
            markers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'number' },
                  unit: { type: 'string' },
                  reference_min: { type: 'number' },
                  reference_max: { type: 'number' },
                  status: { type: 'string', enum: ['normal', 'low', 'high', 'critical'] },
                },
              },
            },
          },
        },
      });

      if (result.status !== 'success') {
        toast.error(t('pages.lab_exams.import_error'));
        return;
      }

      const data = result.output;
      setForm((previous) => ({
        ...previous,
        panel_name: data.panel_name || previous.panel_name,
        exam_date: data.exam_date || previous.exam_date,
        markers: data.markers?.length
          ? data.markers.map((marker) => ({
              ...marker,
              value: String(marker.value ?? ''),
              reference_min: String(marker.reference_min ?? ''),
              reference_max: String(marker.reference_max ?? ''),
            }))
          : previous.markers,
      }));
      toast.success(`Imported ${result.output.markers?.length || 0} markers.`);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const addMarker = () => setForm((previous) => ({ ...previous, markers: [...previous.markers, emptyMarker()] }));
  const removeMarker = (index) => setForm((previous) => ({
    ...previous,
    markers: previous.markers.filter((_, markerIndex) => markerIndex !== index),
  }));
  const updateMarker = (index, field, value) => setForm((previous) => {
    const nextMarkers = [...previous.markers];
    nextMarkers[index] = { ...nextMarkers[index], [field]: value };
    return { ...previous, markers: nextMarkers };
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
        .filter((marker) => marker.name)
        .map((marker) => ({
          ...marker,
          value: marker.value !== '' ? Number(marker.value) : undefined,
          reference_min: marker.reference_min !== '' ? Number(marker.reference_min) : undefined,
          reference_max: marker.reference_max !== '' ? Number(marker.reference_max) : undefined,
        })),
    };

    setFormErrors({});
    createMutation.mutate(payload);
  };

  const abnormalMarkers = exams.reduce(
    (total, exam) => total + (exam.markers || []).filter((marker) => marker.status && marker.status !== 'normal').length,
    0
  );
  const trackedMarkers = exams.reduce((total, exam) => total + (exam.markers?.length || 0), 0);

  const markerTrends = useMemo(() => {
    const trends = {};
    exams.forEach((exam) => {
      exam.markers?.forEach((marker) => {
        if (!trends[marker.name]) {
          trends[marker.name] = [];
        }
        trends[marker.name].push({
          date: exam.exam_date,
          value: marker.value,
          status: marker.status,
        });
      });
    });
    return trends;
  }, [exams]);

  return (
    <PageShell
      title="Lab Exams"
      subtitle="Keep PDFs, images, and structured lab reads in one dependable layer."
      actions={(
        <PrimaryButton type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New exam
        </PrimaryButton>
      )}
      maxWidth="max-w-6xl"
    >
      {importing ? (
        <StatusBanner tone="success">
          The file was uploaded. We are extracting markers to prefill the form.
        </StatusBanner>
      ) : null}

      {isLoading ? (
        <LoadingState
          title="Loading exams"
          description="We are retrieving your lab panels while keeping the route available."
        />
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Panels"
          value={exams.length}
          hint="Total number of recorded lab panels."
          icon={Heart}
          accentClassName="border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]"
        />
        <SummaryTile
          label="Out-of-range markers"
          value={abnormalMarkers}
          hint="Signals outside the reference range across your history."
          icon={AlertTriangle}
          accentClassName="border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]"
        />
        <SummaryTile
          label="Tracked markers"
          value={trackedMarkers}
          hint="Total data base for longitudinal review."
          icon={CheckCircle2}
          accentClassName="border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]"
        />
      </section>

      {Object.keys(markerTrends).some((key) => markerTrends[key].length > 1) ? (
        <SectionCard
          title="Marker trends"
          subtitle="Quick trend read for markers with enough history."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(markerTrends)
              .filter(([, data]) => data.length > 1)
              .map(([markerName, data]) => (
                <MarkerTrendCard key={markerName} markerName={markerName} data={data} />
              ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Exam history"
        subtitle="Open each panel to review markers, reference ranges, and notes."
      >
        {!isLoading && exams.length === 0 ? (
          <EmptyState
            title="No lab exams yet"
            description="Add one manually or import a PDF or image to start your lab history."
            icon={Heart}
            action={(
              <PrimaryButton type="button" onClick={() => setShowAdd(true)}>
                Add first exam
              </PrimaryButton>
            )}
          />
        ) : null}

        {!isLoading && exams.length > 0 ? (
          <div className="space-y-4">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                expanded={Boolean(expanded[exam.id])}
                deletePending={deleteMutation.isPending}
                onToggle={() => setExpanded((previous) => ({ ...previous, [exam.id]: !previous[exam.id] }))}
                onDelete={() => deleteMutation.mutate(exam.id)}
              />
            ))}
          </div>
        ) : null}
      </SectionCard>

      <Dialog
        open={showAdd}
        onOpenChange={(open) => {
          setShowAdd(open);
          if (!open) {
            setFormErrors({});
            setForm({ exam_date: getToday(), panel_name: '', markers: [emptyMarker()], notes: '' });
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
            <DialogPanelHeader
              eyebrow="Lab import"
            title="Add exam"
            description="Use upload to prefill the panel, then refine values, units, and notes before saving."
            accentClassName="from-[hsl(var(--brand)/0.18)] via-[hsl(var(--accent-secondary)/0.08)]"
          />

          <DialogHeader className="sr-only">
            <DialogTitle>New exam</DialogTitle>
            <DialogDescription>Add a lab exam.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6 lg:p-7">
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-[24px] border border-dashed border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] px-5 py-5 text-center transition-colors hover:border-[hsl(var(--brand)/0.24)] ${importing ? 'pointer-events-none opacity-70' : ''}`}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--fg))]">
                  {importing ? 'Importing file...' : 'Import exam PDF or image'}
                </p>
                <p className="mt-1 text-xs leading-5 text-[hsl(var(--fg-2))]">
                  We extract panel name, date, and markers for review before you save.
                </p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleImportFile} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                  Panel / exam
                </label>
                <Input
                  placeholder="e.g. CBC, hormones, lipid panel"
                  value={form.panel_name}
                  onChange={(event) => {
                    setForm((previous) => ({ ...previous, panel_name: event.target.value }));
                    if (formErrors.panel_name) setFormErrors((previous) => ({ ...previous, panel_name: undefined }));
                  }}
                  className={`h-12 ${formErrors.panel_name ? 'border-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.3)]' : ''}`}
                />
                {formErrors.panel_name ? (
                  <p className="text-[12px] text-[hsl(var(--err))]">{formErrors.panel_name}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">Date</label>
                <Input
                  type="date"
                  value={form.exam_date}
                  onChange={(event) => {
                    setForm((previous) => ({ ...previous, exam_date: event.target.value }));
                    if (formErrors.exam_date) setFormErrors((previous) => ({ ...previous, exam_date: undefined }));
                  }}
                  className={`h-12 ${formErrors.exam_date ? 'border-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.3)]' : ''}`}
                />
                {formErrors.exam_date ? (
                  <p className="text-[12px] text-[hsl(var(--err))]">{formErrors.exam_date}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">Markers</p>
                  <p className="text-[12px] text-[hsl(var(--fg-3))]">Review value, unit, and clinical status.</p>
                </div>
                <Button type="button" variant="outline" className="h-10" onClick={addMarker}>
                  <Plus className="h-4 w-4" />
                  Add marker
                </Button>
              </div>

              <div className="space-y-3">
                {form.markers.map((marker, index) => (
                  <div
                    key={`marker-${index}`}
                    className="atlas-card-muted grid gap-3 p-4 md:grid-cols-[1.5fr_0.8fr_0.8fr_auto]"
                  >
                    <Input
                      placeholder="Marker name"
                      value={marker.name}
                      onChange={(event) => updateMarker(index, 'name', event.target.value)}
                      className="h-11"
                    />
                    <Input
                      type="number"
                      placeholder="Value"
                      value={marker.value}
                      onChange={(event) => updateMarker(index, 'value', event.target.value)}
                      className="h-11"
                    />
                    <Input
                      placeholder="Unit"
                      value={marker.unit}
                      onChange={(event) => updateMarker(index, 'unit', event.target.value)}
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

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">Notes</label>
              <Textarea
                placeholder="Relevant panel notes, clinical context, or next steps..."
                value={form.notes}
                onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
                className="min-h-[120px] resize-y"
              />
            </div>

            <Button onClick={handleSave} disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Saving exam...' : 'Save exam'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
