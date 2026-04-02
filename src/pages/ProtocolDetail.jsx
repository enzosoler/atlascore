import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Edit2,
  Pause,
  Pill,
  Play,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import {
  getProtocol,
  getProtocolLogs,
  getAdherenceStats,
  logDose,
  updateProtocol,
} from '@/services/protocolService';
import {
  PageShell,
  SectionCard,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBanner,
  SafePageBoundary,
} from '@/components/shared/StablePage';

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function statusMeta(status, t) {
  if (status === 'paused')
    return { label: t('protocols.status.paused'), cls: 'border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]' };
  if (status === 'discontinued')
    return { label: t('protocols.status.discontinued'), cls: 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.86)] text-[hsl(var(--fg-2))]' };
  return { label: t('protocols.status.active'), cls: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]' };
}

function formatSchedule(p, t) {
  if (p.schedule_type === 'weekdays' && Array.isArray(p.schedule_weekdays)) {
    const dayNames = [
      t('protocols.days.sun'), t('protocols.days.mon'), t('protocols.days.tue'),
      t('protocols.days.wed'), t('protocols.days.thu'), t('protocols.days.fri'),
      t('protocols.days.sat'),
    ];
    return p.schedule_weekdays.map((d) => dayNames[d]).join(', ');
  }
  if (p.schedule_type === 'interval' && p.schedule_interval_days) {
    return t('protocols.everyXDays', { count: p.schedule_interval_days });
  }
  return p.frequency || '—';
}

const ROUTE_LABELS = {
  subcutaneous: 'Subcutaneous',
  oral: 'Oral',
  topical: 'Topical',
  intramuscular: 'Intramuscular',
  other: 'Other',
};

// ── Adherence Bar ────────────────────────────────────────────────────────────

function AdherenceBar({ daily }) {
  if (!daily?.length) return null;

  return (
    <div className="flex items-end gap-[3px]">
      {daily.map((d, i) => {
        const isTaken = d.status === 'taken' || d.taken;
        const isSkipped = d.status === 'skipped';
        const bg = isTaken
          ? 'bg-[hsl(var(--ok))]'
          : isSkipped
            ? 'bg-[hsl(var(--warn))]'
            : 'bg-[hsl(var(--border))]';

        return (
          <div
            key={d.date ?? i}
            title={d.date}
            className={cn('w-full rounded-sm', bg)}
            style={{ height: isTaken ? 24 : isSkipped ? 14 : 8 }}
          />
        );
      })}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

function ProtocolDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [notice, setNotice] = useState(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const protocolQ = useQuery({
    queryKey: ['protocol', id],
    queryFn: () => getProtocol(id),
    enabled: Boolean(id && user?.id),
  });

  const logsQ = useQuery({
    queryKey: ['protocol-logs', id],
    queryFn: () => getProtocolLogs(id, 30),
    enabled: Boolean(id && user?.id),
  });

  const adherenceQ = useQuery({
    queryKey: ['protocol-adherence', id],
    queryFn: () => getAdherenceStats(user?.id, { days: 14 }),
    enabled: Boolean(id && user?.id),
    select: (data) => ({
      rate: data?.byProtocol?.[id]?.rate ?? data?.rate ?? 0,
      daily: data?.byProtocol?.[id]
        ? _buildDaily14(data.byProtocol[id])
        : data?.daily ?? [],
    }),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const logMutation = useMutation({
    mutationFn: (status) =>
      logDose(id, {
        scheduled_date: todayStr(),
        status,
        taken_at: status === 'taken' ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['protocol-logs', id] });
      qc.invalidateQueries({ queryKey: ['protocol-adherence', id] });
      setNotice({ tone: 'success', message: t('protocols.doseLogged') });
    },
    onError: () => setNotice({ tone: 'warning', message: t('protocols.doseLogFailed') }),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus) => updateProtocol(id, { status: newStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['protocol', id] });
      qc.invalidateQueries({ queryKey: ['protocols'] });
      setNotice({ tone: 'success', message: t('protocols.statusUpdated') });
    },
    onError: () => setNotice({ tone: 'warning', message: t('protocols.statusUpdateFailed') }),
  });

  // ── Derived data ───────────────────────────────────────────────────────────

  const protocol = protocolQ.data;
  const logs = logsQ.data ?? [];
  const isLoading = protocolQ.isPending;
  const hasError = protocolQ.isError;

  const status = protocol?.status ?? 'active';
  const sm = statusMeta(status, t);
  const dose = protocol
    ? [protocol.dose_amount || protocol.dose, protocol.dose_unit || protocol.unit].filter(Boolean).join(' ')
    : '';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageShell
      title={protocol?.name || protocol?.substance_name || t('protocols.detail')}
      subtitle={dose}
      maxWidth="max-w-3xl"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.protocols)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] px-3.5 py-2 text-[13px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            {t('protocols.back')}
          </button>
          {protocol && (
            <button
              type="button"
              onClick={() => navigate(`/Protocols/${id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand))] px-3.5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[hsl(var(--brand)/0.9)]"
            >
              <Edit2 className="h-3.5 w-3.5" strokeWidth={2} />
              {t('protocols.edit')}
            </button>
          )}
        </div>
      }
    >
      {notice?.message && <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>}

      {isLoading && <LoadingState />}
      {!isLoading && hasError && <ErrorState title={t('protocols.loadError')} />}

      {!isLoading && protocol && (
        <>
          {/* ── Info card ───────────────────────────────────────────── */}
          <SectionCard>
            <div className="space-y-4">
              {/* Status badge + category */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', sm.cls)}>
                  {sm.label}
                </span>
                {protocol.category && (
                  <span className="rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))] capitalize">
                    {protocol.category}
                  </span>
                )}
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Pill} label={t('protocols.dose')} value={dose || '—'} />
                <InfoRow icon={Clock} label={t('protocols.route')} value={ROUTE_LABELS[protocol.route] || protocol.route || '—'} />
                <InfoRow icon={Calendar} label={t('protocols.schedule')} value={formatSchedule(protocol, t)} />
                <InfoRow icon={Calendar} label={t('protocols.startDate')} value={protocol.start_date || '—'} />
              </div>

              {protocol.reminder_enabled && protocol.reminder_time && (
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {t('protocols.reminderAt', { time: protocol.reminder_time })}
                </p>
              )}

              {protocol.notes && (
                <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-2))] whitespace-pre-wrap">
                  {protocol.notes}
                </p>
              )}
            </div>
          </SectionCard>

          {/* ── Log dose ────────────────────────────────────────────── */}
          {status === 'active' && (
            <SectionCard title={t('protocols.logDose')} subtitle={t('protocols.logDoseDesc')}>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={logMutation.isPending}
                  onClick={() => logMutation.mutate('taken')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.1)] px-4 py-3 text-[14px] font-semibold text-[hsl(var(--ok))] transition-all hover:bg-[hsl(var(--ok)/0.18)]"
                >
                  <Check className="h-4 w-4" strokeWidth={2} />
                  {t('protocols.taken')}
                </button>
                <button
                  type="button"
                  disabled={logMutation.isPending}
                  onClick={() => logMutation.mutate('skipped')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.1)] px-4 py-3 text-[14px] font-semibold text-[hsl(var(--warn))] transition-all hover:bg-[hsl(var(--warn)/0.18)]"
                >
                  <SkipForward className="h-4 w-4" strokeWidth={2} />
                  {t('protocols.skip')}
                </button>
              </div>
            </SectionCard>
          )}

          {/* ── Adherence (last 14 days) ────────────────────────────── */}
          <SectionCard title={t('protocols.adherence')} subtitle={t('protocols.adherenceLast14')}>
            {adherenceQ.data?.daily?.length ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[28px] font-semibold tracking-tight text-[hsl(var(--fg))]">
                    {adherenceQ.data.rate}%
                  </span>
                  <span className="text-[12px] text-[hsl(var(--fg-2))]">
                    {t('protocols.last14Days')}
                  </span>
                </div>
                <AdherenceBar daily={adherenceQ.data.daily} />
              </div>
            ) : (
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{t('protocols.noAdherenceData')}</p>
            )}
          </SectionCard>

          {/* ── Recent dose history ─────────────────────────────────── */}
          <SectionCard title={t('protocols.recentHistory')} subtitle={t('protocols.last30Doses')}>
            {logs.length === 0 ? (
              <EmptyState title={t('protocols.noDosesYet')} description={t('protocols.noDosesDesc')} />
            ) : (
              <ul className="divide-y divide-[hsl(var(--border)/0.5)]">
                {logs.slice(0, 20).map((log) => {
                  const isTaken = log.status === 'taken';
                  const isSkipped = log.status === 'skipped';
                  return (
                    <li key={log.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                            isTaken
                              ? 'bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]'
                              : isSkipped
                                ? 'bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]'
                                : 'bg-[hsl(var(--border)/0.3)] text-[hsl(var(--fg-3))]'
                          )}
                        >
                          {isTaken ? <Check className="h-3.5 w-3.5" /> : isSkipped ? <SkipForward className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-[13px] text-[hsl(var(--fg))] truncate">
                          {log.scheduled_date || log.taken_at?.split('T')[0] || '—'}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-[12px] font-medium capitalize',
                          isTaken ? 'text-[hsl(var(--ok))]' : isSkipped ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--fg-3))]'
                        )}
                      >
                        {log.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <SectionCard>
            <div className="flex flex-wrap gap-2">
              {status === 'active' && (
                <ActionButton
                  icon={Pause}
                  label={t('protocols.pause')}
                  className="text-[hsl(var(--warn))]"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('paused')}
                />
              )}
              {status === 'paused' && (
                <ActionButton
                  icon={Play}
                  label={t('protocols.resume')}
                  className="text-[hsl(var(--ok))]"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('active')}
                />
              )}
              {status !== 'discontinued' && (
                <ActionButton
                  icon={XCircle}
                  label={t('protocols.discontinue')}
                  className="text-[hsl(var(--err))]"
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    if (window.confirm(t('protocols.confirmDiscontinue'))) {
                      statusMutation.mutate('discontinued');
                    }
                  }}
                />
              )}
            </div>
          </SectionCard>
        </>
      )}
    </PageShell>
  );
}

// ── Small sub-components ─────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
        <Icon className="h-3 w-3" strokeWidth={2} />
        {label}
      </div>
      <p className="text-[14px] text-[hsl(var(--fg))]">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, className = '', disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] px-4 py-2.5 text-[13px] font-medium transition-all hover:bg-[hsl(var(--fill)/0.72)] disabled:opacity-50',
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}

// Build a 14-day daily array from byProtocol stats
function _buildDaily14(stats) {
  // Fallback: we don't have daily breakdown from the aggregated stats.
  // Return an empty array — the AdherenceBar handles it gracefully.
  return [];
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function ProtocolDetail() {
  const { t } = useI18n();
  return (
    <SafePageBoundary title={t('protocols.detail')} maxWidth="max-w-3xl">
      <ProtocolDetailContent />
    </SafePageBoundary>
  );
}
