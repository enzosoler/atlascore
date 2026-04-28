import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, FlaskConical, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SubstancePicker from '@/components/protocols/SubstancePicker';
import { useT } from '@/lib/i18nContext';

// ── Option lists ──────────────────────────────────────────────────────────────

const CATEGORY_KEYS = ['supplement', 'medication', 'hormone', 'peptide', 'ancillary', 'other'];
const UNIT_KEYS = ['mg', 'mcg', 'g', 'ml', 'UI', 'caps', 'comp', 'other'];
const STATUS_KEYS = ['active', 'paused', 'finished'];

// ── Empty / default form state ────────────────────────────────────────────────

const EMPTY_FORM = {
  substance_name: '',
  name: '',
  category: 'supplement',
  dose: '',
  unit: 'mg',
  frequency: '',
  schedule: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  notes: '',
  status: 'active',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveStatus(protocol) {
  if (protocol?.end_date) return 'finished';
  if (protocol?.active === false) return 'paused';
  return 'active';
}

function buildFormState(protocol) {
  if (!protocol) return EMPTY_FORM;

  return {
    substance_name: protocol.substance_name || '',
    name:           protocol.name           || '',
    category:       protocol.category       || 'supplement',
    dose:           protocol.dose           || '',
    unit:           protocol.unit           || 'mg',
    frequency:      protocol.frequency      || '',
    schedule:       protocol.schedule       || '',
    start_date:     protocol.start_date     || new Date().toISOString().split('T')[0],
    end_date:       protocol.end_date       || '',
    notes:          protocol.notes          || '',
    status:         resolveStatus(protocol),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldShell({ label, description, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">{label}</label>
      {children}
      {description ? (
        <p className="text-[12px] leading-5 text-[hsl(var(--fg-3))]">{description}</p>
      ) : null}
    </div>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div>
          <p className="atlas-overline">{eyebrow}</p>
          <h3 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {title}
          </h3>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{description}</p>
    </div>
  );
}

// ── Form component ────────────────────────────────────────────────────────────

export default function ProtocolForm({
  protocol = null,
  isSubmitting = false,
  onCancel,
  onSubmit,
}) {
  const t = useT();
  const CATEGORY_OPTIONS = CATEGORY_KEYS.map((k) => ({ value: k, label: t(`protocols.form.categories.${k}`) }));
  const UNIT_OPTIONS = UNIT_KEYS.map((k) => ({ value: k, label: t(`protocols.form.units.${k}`) }));
  const STATUS_OPTIONS = STATUS_KEYS.map((k) => ({ value: k, label: t(`protocols.form.statuses.${k}`) }));
  const [form, setForm] = useState(() => buildFormState(protocol));
  const [errors, setErrors] = useState({});

  // Re-populate when switching between create / edit
  useEffect(() => {
    setForm(buildFormState(protocol));
    setErrors({});
  }, [protocol]);

  const selectedStatus = form.status;

  const previewLabel = useMemo(
    () => form.substance_name || form.name || t('protocols.form.newProtocol'),
    [form.substance_name, form.name, t]
  );

  const previewDose = useMemo(() => {
    if (!form.dose) return t('protocols.form.doseToBeDefinedLabel');
    return form.unit ? `${form.dose} ${form.unit}` : form.dose;
  }, [form.dose, form.unit, t]);

  // ── Field helpers ────────────────────────────────────────────────────────────

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // When a substance is selected from the picker, auto-fill related fields
  const handleSubstanceSelect = (item) => {
    setForm((prev) => ({
      ...prev,
      substance_name: item.canonical_name || prev.substance_name,
      name:           prev.name           || item.canonical_name,
      category:       item.category       || prev.category || 'supplement',
      // Auto-select unit from seed data; keep what user already typed
      unit:           prev.unit !== 'mg' ? prev.unit : (item.default_unit || 'mg'),
      frequency:      prev.frequency      || item.common_frequency_reference || '',
      notes:          prev.notes          || item.structured_notes           || '',
    }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.substance_name.trim() && !form.name.trim()) {
      nextErrors.substance_name = t('protocols.form.errors.substanceRequired');
    }
    if (!form.start_date) {
      nextErrors.start_date = t('protocols.form.errors.startDateRequired');
    }
    if (form.status === 'finished' && !form.end_date) {
      nextErrors.end_date = t('protocols.form.errors.endDateRequired');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Build payload — send null (not '') for empty date columns so Postgres
    // doesn't reject the value on the date column type.
    const payload = {
      substance_name: form.substance_name.trim(),
      name:           form.name.trim() || form.substance_name.trim(),
      category:       form.category,
      dose:           form.dose.trim(),
      unit:           form.unit,
      frequency:      form.frequency.trim(),
      schedule:       form.schedule.trim(),
      start_date:     form.start_date,
      end_date:       form.status === 'finished' && form.end_date ? form.end_date : null,
      notes:          form.notes.trim(),
      active:         form.status === 'active',
    };

    onSubmit?.(payload);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 lg:p-7">

      {/* Live preview */}
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.88)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.1),transparent_34%),linear-gradient(180deg,hsl(var(--fill)/0.78)_0%,hsl(var(--card))_100%)] p-5 shadow-[var(--shadow-xs)]">
        <p className="atlas-overline">{t('protocols.form.preview')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--brand))]">
            {STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label || t('protocols.form.statuses.active')}
          </span>
          <span className="rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
            {CATEGORY_OPTIONS.find((o) => o.value === form.category)?.label || t('protocols.form.categories.other')}
          </span>
        </div>
        <p className="mt-4 text-[1.25rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
          {previewLabel}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          {previewDose} · {form.frequency || t('protocols.form.frequencyToBeDefined')}
        </p>
      </div>

      {/* ── Section: Identity ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Pill}
          eyebrow={t('protocols.form.identity.eyebrow')}
          title={t('protocols.form.identity.title')}
          description={t('protocols.form.identity.description')}
        />

        {/* Substance picker + internal name */}
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-2">
            <SubstancePicker
              value={form.substance_name}
              onChange={(value) => setField('substance_name', value)}
              onSelect={handleSubstanceSelect}
            />
            {errors.substance_name ? (
              <p className="text-[12px] text-[hsl(var(--err))]">{errors.substance_name}</p>
            ) : null}
          </div>

          <FieldShell
            label={t('protocols.form.internalName')}
            description={t('protocols.form.internalNameDesc')}
          >
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder={t('protocols.form.internalNamePlaceholder')}
              className="h-12"
            />
          </FieldShell>
        </div>

        {/* Category | Dose | Unit | Frequency — 4-col grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldShell label={t('protocols.form.categoryLabel')}>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className="atlas-field h-12 px-4 text-base"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label={t('protocols.form.doseLabel')}>
            <Input
              value={form.dose}
              onChange={(e) => setField('dose', e.target.value)}
              placeholder={t('protocols.form.dosePlaceholder')}
              className="h-12"
            />
          </FieldShell>

          <FieldShell label={t('protocols.form.unitLabel')}>
            <select
              value={form.unit}
              onChange={(e) => setField('unit', e.target.value)}
              className="atlas-field h-12 px-4 text-base"
            >
              {UNIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label={t('protocols.form.frequencyLabel')}>
            <Input
              value={form.frequency}
              onChange={(e) => setField('frequency', e.target.value)}
              placeholder={t('protocols.form.frequencyPlaceholder')}
              className="h-12"
            />
          </FieldShell>
        </div>
      </section>

      {/* ── Section: Cadence ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={CalendarRange}
          eyebrow={t('protocols.form.cadence.eyebrow')}
          title={t('protocols.form.cadence.title')}
          description={t('protocols.form.cadence.description')}
        />

        {/* Schedule + Status buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label={t('protocols.form.scheduleLabel')}>
            <Input
              value={form.schedule}
              onChange={(e) => setField('schedule', e.target.value)}
              placeholder={t('protocols.form.schedulePlaceholder')}
              className="h-12"
            />
          </FieldShell>

          <FieldShell label={t('protocols.form.statusLabel')}>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setField('status', o.value)}
                  className={
                    o.value === form.status
                      ? 'atlas-button atlas-button-primary h-11'
                      : 'atlas-button atlas-button-secondary h-11'
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </FieldShell>
        </div>

        {/* Date range */}
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label={t('protocols.form.startLabel')}>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => setField('start_date', e.target.value)}
              className="h-12"
            />
            {errors.start_date ? (
              <p className="text-[12px] text-[hsl(var(--err))]">{errors.start_date}</p>
            ) : null}
          </FieldShell>

          <FieldShell
            label={t('protocols.form.endLabel')}
            description={
              form.status === 'finished'
                ? t('protocols.form.endDescFinished')
                : t('protocols.form.endDescDefault')
            }
          >
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => setField('end_date', e.target.value)}
              className="h-12"
            />
            {errors.end_date ? (
              <p className="text-[12px] text-[hsl(var(--err))]">{errors.end_date}</p>
            ) : null}
          </FieldShell>
        </div>
      </section>

      {/* ── Section: Notes ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={FlaskConical}
          eyebrow={t('protocols.form.notes.eyebrow')}
          title={t('protocols.form.notes.title')}
          description={t('protocols.form.notes.description')}
        />

        <FieldShell label={t('protocols.form.notesLabel')}>
          <Textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder={t('protocols.form.notesPlaceholder')}
            className="min-h-[140px] resize-y"
          />
        </FieldShell>
      </section>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-[hsl(var(--border)/0.82)] pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="sm:min-w-[140px]"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('protocols.form.cancel')}
        </Button>
        <Button
          type="submit"
          className="sm:min-w-[180px]"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t('protocols.form.saving')
            : protocol
            ? t('protocols.form.saveChanges')
            : t('protocols.form.createProtocol')}
        </Button>
      </div>
    </form>
  );
}
