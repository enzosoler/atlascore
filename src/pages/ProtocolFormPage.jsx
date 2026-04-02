import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FlaskConical,
  Pill,
  Save,
  Syringe,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import {
  createProtocol,
  getProtocol,
  updateProtocol,
} from '@/services/protocolService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  PageShell,
  SectionCard,
  LoadingState,
  StatusBanner,
  SafePageBoundary,
} from '@/components/shared/StablePage';

// ── Option lists ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'medication', icon: Pill },
  { value: 'hormone', icon: Syringe },
  { value: 'peptide', icon: FlaskConical },
  { value: 'supplement', icon: Pill },
];

const ROUTE_OPTIONS = [
  { value: 'subcutaneous' },
  { value: 'oral' },
  { value: 'topical' },
  { value: 'intramuscular' },
  { value: 'other' },
];

const UNIT_OPTIONS = ['mg', 'mcg', 'g', 'mL', 'IU', 'caps', 'tablets'];

const WEEKDAYS = [
  { value: 0, short: 'S' },
  { value: 1, short: 'M' },
  { value: 2, short: 'T' },
  { value: 3, short: 'W' },
  { value: 4, short: 'T' },
  { value: 5, short: 'F' },
  { value: 6, short: 'S' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

const EMPTY_FORM = {
  name: '',
  category: 'supplement',
  dose_amount: '',
  dose_unit: 'mg',
  route: 'oral',
  schedule_type: 'weekdays',
  schedule_weekdays: [1, 3, 5],
  schedule_interval_days: 1,
  reminder_enabled: true,
  reminder_time: '08:00',
  followup_reminder_enabled: false,
  followup_reminder_minutes: 30,
  start_date: todayStr(),
  notes: '',
};

function buildFormState(protocol) {
  if (!protocol) return { ...EMPTY_FORM };
  return {
    name: protocol.name || protocol.substance_name || '',
    category: protocol.category || 'supplement',
    dose_amount: protocol.dose_amount || protocol.dose || '',
    dose_unit: protocol.dose_unit || protocol.unit || 'mg',
    route: protocol.route || 'oral',
    schedule_type: protocol.schedule_type || 'weekdays',
    schedule_weekdays: protocol.schedule_weekdays || [1, 3, 5],
    schedule_interval_days: protocol.schedule_interval_days || 1,
    reminder_enabled: protocol.reminder_enabled ?? true,
    reminder_time: protocol.reminder_time || '08:00',
    followup_reminder_enabled: !!protocol.followup_reminder_minutes,
    followup_reminder_minutes: protocol.followup_reminder_minutes || 30,
    start_date: protocol.start_date || todayStr(),
    notes: protocol.notes || '',
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return <label className="block text-[12px] font-semibold text-[hsl(var(--fg))] mb-1.5">{children}</label>;
}

function FieldHint({ children }) {
  return <p className="text-[12px] leading-5 text-[hsl(var(--fg-3))] mt-1">{children}</p>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <div
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--border))]'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          )}
        />
      </div>
      <span className="text-[13px] text-[hsl(var(--fg))]">{label}</span>
    </button>
  );
}

// ── Main form content ────────────────────────────────────────────────────────

function ProtocolFormContent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [notice, setNotice] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Load existing protocol when editing ────────────────────────────────────

  const protocolQ = useQuery({
    queryKey: ['protocol', id],
    queryFn: () => getProtocol(id),
    enabled: Boolean(id && user?.id),
  });

  const [form, setForm] = useState(() => EMPTY_FORM);

  // Populate form when protocol loads
  useEffect(() => {
    if (protocolQ.data) setForm(buildFormState(protocolQ.data));
  }, [protocolQ.data]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateProtocol(id, payload) : createProtocol(user.id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['protocols'] });
      qc.invalidateQueries({ queryKey: ['protocol', id] });
      navigate(isEdit ? `/Protocols/${id}` : ROUTES.protocols);
    },
    onError: () => setNotice({ tone: 'warning', message: t('protocols.saveFailed') }),
  });

  // ── Field helpers ──────────────────────────────────────────────────────────

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleWeekday = (day) => {
    setForm((prev) => {
      const current = prev.schedule_weekdays || [];
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort();
      return { ...prev, schedule_weekdays: next };
    });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = t('protocols.nameRequired');
    if (!form.start_date) nextErrors.start_date = t('protocols.startDateRequired');

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      dose_amount: form.dose_amount?.toString().trim() || null,
      dose_unit: form.dose_unit,
      route: form.route,
      schedule_type: form.schedule_type,
      schedule_weekdays: form.schedule_type === 'weekdays' ? form.schedule_weekdays : null,
      schedule_interval_days: form.schedule_type === 'interval' ? Number(form.schedule_interval_days) || 1 : null,
      reminder_enabled: form.reminder_enabled,
      reminder_time: form.reminder_enabled ? form.reminder_time : null,
      followup_reminder_minutes: form.followup_reminder_enabled ? Number(form.followup_reminder_minutes) || 30 : null,
      start_date: form.start_date,
      notes: form.notes.trim() || null,
    };

    // For create, also include status
    if (!isEdit) payload.status = 'active';

    saveMutation.mutate(payload);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isEdit && protocolQ.isPending) return <LoadingState />;

  return (
    <PageShell
      title={isEdit ? t('protocols.editProtocol') : t('protocols.newProtocol')}
      subtitle={isEdit ? t('protocols.editProtocolDesc') : t('protocols.newProtocolDesc')}
      maxWidth="max-w-2xl"
      actions={
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] px-3.5 py-2 text-[13px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          {t('protocols.back')}
        </button>
      }
    >
      {notice?.message && <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Name ──────────────────────────────────────────────── */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <FieldLabel>{t('protocols.name')}</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder={t('protocols.namePlaceholder')}
                className={cn(errors.name && 'border-[hsl(var(--err))]')}
              />
              {errors.name && <p className="text-[12px] text-[hsl(var(--err))] mt-1">{errors.name}</p>}
            </div>

            {/* ── Category ────────────────────────────────────────── */}
            <div>
              <FieldLabel>{t('protocols.category')}</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField('category', opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[12px] font-medium capitalize transition-all',
                        active
                          ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                          : 'border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Dose + Route ──────────────────────────────────────── */}
        <SectionCard title={t('protocols.dosage')}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>{t('protocols.doseAmount')}</FieldLabel>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={form.dose_amount}
                  onChange={(e) => setField('dose_amount', e.target.value)}
                  placeholder="250"
                />
              </div>
              <div>
                <FieldLabel>{t('protocols.doseUnit')}</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {UNIT_OPTIONS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setField('dose_unit', u)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-all',
                        form.dose_unit === u
                          ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                          : 'border-[hsl(var(--border)/0.88)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Route */}
            <div>
              <FieldLabel>{t('protocols.route')}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {ROUTE_OPTIONS.map((opt) => {
                  const active = form.route === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField('route', opt.value)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-[12px] font-medium capitalize transition-all',
                        active
                          ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                          : 'border-[hsl(var(--border)/0.88)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
                      )}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Schedule ──────────────────────────────────────────── */}
        <SectionCard title={t('protocols.schedule')}>
          <div className="space-y-4">
            {/* Type toggle */}
            <div className="flex rounded-xl border border-[hsl(var(--border)/0.88)] overflow-hidden">
              {['weekdays', 'interval'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setField('schedule_type', type)}
                  className={cn(
                    'flex-1 px-4 py-2.5 text-[13px] font-medium capitalize transition-all',
                    form.schedule_type === type
                      ? 'bg-[hsl(var(--brand))] text-white'
                      : 'bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
                  )}
                >
                  {type === 'weekdays' ? t('protocols.specificDays') : t('protocols.everyXDaysLabel')}
                </button>
              ))}
            </div>

            {/* Weekday picker */}
            {form.schedule_type === 'weekdays' && (
              <div>
                <FieldLabel>{t('protocols.selectDays')}</FieldLabel>
                <div className="flex gap-2">
                  {WEEKDAYS.map((wd) => {
                    const active = (form.schedule_weekdays || []).includes(wd.value);
                    return (
                      <button
                        key={wd.value}
                        type="button"
                        onClick={() => toggleWeekday(wd.value)}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold transition-all',
                          active
                            ? 'bg-[hsl(var(--brand))] text-white'
                            : 'border border-[hsl(var(--border)/0.88)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
                        )}
                      >
                        {wd.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interval input */}
            {form.schedule_type === 'interval' && (
              <div>
                <FieldLabel>{t('protocols.intervalDays')}</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[hsl(var(--fg-2))]">{t('protocols.every')}</span>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={form.schedule_interval_days}
                    onChange={(e) => setField('schedule_interval_days', e.target.value)}
                    className="w-20"
                  />
                  <span className="text-[13px] text-[hsl(var(--fg-2))]">{t('protocols.days')}</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Reminders ─────────────────────────────────────────── */}
        <SectionCard title={t('protocols.reminders')}>
          <div className="space-y-4">
            <Toggle
              checked={form.reminder_enabled}
              onChange={(v) => setField('reminder_enabled', v)}
              label={t('protocols.enableReminder')}
            />
            {form.reminder_enabled && (
              <div>
                <FieldLabel>{t('protocols.reminderTime')}</FieldLabel>
                <Input
                  type="time"
                  value={form.reminder_time}
                  onChange={(e) => setField('reminder_time', e.target.value)}
                  className="w-36"
                />
              </div>
            )}

            <Toggle
              checked={form.followup_reminder_enabled}
              onChange={(v) => setField('followup_reminder_enabled', v)}
              label={t('protocols.enableFollowup')}
            />
            {form.followup_reminder_enabled && (
              <div>
                <FieldLabel>{t('protocols.followupDelay')}</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="5"
                    max="240"
                    value={form.followup_reminder_minutes}
                    onChange={(e) => setField('followup_reminder_minutes', e.target.value)}
                    className="w-20"
                  />
                  <span className="text-[13px] text-[hsl(var(--fg-2))]">{t('protocols.minutes')}</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Start date + Notes ─────────────────────────────────── */}
        <SectionCard title={t('protocols.additional')}>
          <div className="space-y-4">
            <div>
              <FieldLabel>{t('protocols.startDate')}</FieldLabel>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
                className={cn('w-44', errors.start_date && 'border-[hsl(var(--err))]')}
              />
              {errors.start_date && <p className="text-[12px] text-[hsl(var(--err))] mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <FieldLabel>{t('protocols.notes')}</FieldLabel>
              <Textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder={t('protocols.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Save ──────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[hsl(var(--brand)/0.9)] disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {saveMutation.isPending
              ? t('protocols.saving')
              : isEdit
                ? t('protocols.saveChanges')
                : t('protocols.createProtocol')}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function ProtocolFormPage() {
  const { t } = useI18n();
  const { id } = useParams();
  return (
    <SafePageBoundary title={id ? t('protocols.editProtocol') : t('protocols.newProtocol')} maxWidth="max-w-2xl">
      <ProtocolFormContent />
    </SafePageBoundary>
  );
}
