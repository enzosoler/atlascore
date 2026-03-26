import React, { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, FlaskConical, PauseCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import ProtocolCard from '@/components/protocols/ProtocolCard';
import ProtocolForm from '@/components/protocols/ProtocolForm';
import LogDoseForm from '@/components/protocols/LogDoseForm';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import {
  DialogPanelHeader,
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  toArray,
} from '@/components/shared/StablePage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── Constants ─────────────────────────────────────────────────────────────────

const PROTOCOLS_QUERY_KEY = ['protocols'];
const FILTERS = ['all', 'active', 'paused', 'finished'];

const CURVE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

function getFilterLabels(t) {
  return {
    all: t('pages.protocols.tab_all'),
    active: t('pages.protocols.tab_active'),
    paused: t('pages.protocols.tab_paused'),
    finished: t('pages.protocols.tab_finished'),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getProtocolStatus(protocol) {
  if (protocol?.end_date) return 'finished';
  if (protocol?.active === false) return 'paused';
  return 'active';
}

// ── Supabase data-access helpers ──────────────────────────────────────────────
// RLS automatically filters rows to the authenticated user — no manual
// .eq('user_id', ...) needed on reads, but we still pass user_id on writes.

async function fetchProtocols() {
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(200);

  if (error) throw error;
  return data ?? [];
}

async function fetchProtocolLogs(protocolId) {
  const { data, error } = await supabase
    .from('protocol_logs')
    .select('*')
    .eq('protocol_id', protocolId)
    .order('taken_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

async function fetchAllProtocolLogs() {
  const { data, error } = await supabase
    .from('protocol_logs')
    .select('*')
    .order('taken_at', { ascending: false })
    .limit(500);

  if (error) throw error;
  return data ?? [];
}

async function logDose(payload) {
  const { data, error } = await supabase
    .from('protocol_logs')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createProtocol(payload) {
  const { data, error } = await supabase
    .from('protocols')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateProtocol(protocolId, payload) {
  const { data, error } = await supabase
    .from('protocols')
    .update(payload)
    .eq('id', protocolId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteProtocol(protocolId) {
  const { error } = await supabase
    .from('protocols')
    .delete()
    .eq('id', protocolId);

  if (error) throw error;
}

// ── Concentration Chart based on Actual Dose Logs ────────────────────────────

import {
  generateConcentrationSeries,
  getSubstanceHalfLife,
} from '@/lib/concentrationCalculator';

function ConcentrationChart({ protocols }) {
  const qc = useQueryClient();
  const { user } = useAuth();

  // Fetch logs for all active protocols
  const logsQueries = useQueries({
    queries: protocols.map((protocol) => ({
      queryKey: ['protocol-logs', protocol.id],
      queryFn: () => fetchProtocolLogs(protocol.id),
      enabled: !!protocol?.id && !!user?.id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = logsQueries.some((q) => q.isLoading);

  // Combine protocols with their logs and calculate series
  const protocolsWithData = useMemo(() => {
    return protocols.map((protocol, index) => {
      const logs = logsQueries[index]?.data || [];
      const halfLife = getSubstanceHalfLife(protocol);
      const series =
        logs.length > 0
          ? generateConcentrationSeries(logs, halfLife, 30, 14, 4)
          : [];

      return {
        protocol,
        logs,
        halfLife,
        series,
        hasLogs: logs.length > 0,
      };
    });
  }, [protocols, logsQueries]);

  const hasAnyLogs = protocolsWithData.some((p) => p.hasLogs);

  if (protocols.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.4)] px-6 py-12 text-center">
        <p className="text-[14px] text-[hsl(var(--fg-2))]">
          No active protocols available.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.4)] px-6 py-12">
        <p className="text-[14px] text-[hsl(var(--fg-2))]">Loading dose history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hasAnyLogs ? (
        <div className="rounded-[16px] border border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.08)] px-4 py-3">
          <p className="text-[13px] text-[hsl(var(--warn))]">
            No doses logged yet. Click "Log dose" on a protocol to see concentration curves.
          </p>
        </div>
      ) : null}

      {protocolsWithData.map((data, index) => (
        <ProtocolConcentrationCard
          key={data.protocol.id}
          data={data}
          color={CURVE_COLORS[index % CURVE_COLORS.length]}
        />
      ))}
    </div>
  );
}

function ProtocolConcentrationCard({ data, color }) {
  const { protocol, halfLife, series, hasLogs } = data;

  const VIEWBOX_WIDTH = 400;
  const VIEWBOX_HEIGHT = 120;
  const PADDING = { top: 10, bottom: 25, left: 40, right: 20 };
  const PLOT_WIDTH = VIEWBOX_WIDTH - PADDING.left - PADDING.right;
  const PLOT_HEIGHT = VIEWBOX_HEIGHT - PADDING.top - PADDING.bottom;

  if (!hasLogs || series.length === 0) {
    return (
      <div className="rounded-[20px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.3)] px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
            {protocol.substance_name || protocol.name}
          </p>
        </div>
        <p className="mt-2 text-[12px] text-[hsl(var(--fg-2))]">
          No doses logged yet. Log doses to see concentration curve.
        </p>
      </div>
    );
  }

  // Find min/max for scaling
  const concentrations = series.map((p) => p.concentration);
  const maxConcentration = Math.max(...concentrations, 1);
  const minConcentration = Math.min(...concentrations.filter((c) => c > 0), maxConcentration * 0.01);

  // Generate path points
  const now = new Date();
  const startTime = series[0].time.getTime();
  const endTime = series[series.length - 1].time.getTime();
  const timeRange = endTime - startTime;

  const points = series.map((point) => {
    const x =
      PADDING.left +
      ((point.time.getTime() - startTime) / timeRange) * PLOT_WIDTH;
    const y =
      PADDING.top +
      PLOT_HEIGHT -
      ((point.concentration - minConcentration) / (maxConcentration - minConcentration)) *
        PLOT_HEIGHT;
    return { x, y, ...point };
  });

  // Find current time position
  const nowX =
    PADDING.left + ((now.getTime() - startTime) / timeRange) * PLOT_WIDTH;

  // Create path
  const pathData = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

  // Find current concentration
  const currentPoint = points.reduce((closest, pt) => {
    return Math.abs(pt.time.getTime() - now.getTime()) <
      Math.abs(closest.time.getTime() - now.getTime())
      ? pt
      : closest;
  });

  // Format dates for labels
  const formatDate = (date) => {
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.3)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
            {protocol.substance_name || protocol.name}
          </p>
        </div>
        <div className="flex gap-3 text-[11px] text-[hsl(var(--fg-2))]">
          <span>T½: {halfLife.toFixed(1)}d</span>
          <span>Current: {currentPoint.concentration.toFixed(1)}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="w-full">
        {/* Grid */}
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + PLOT_HEIGHT}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1={PADDING.left}
          y1={PADDING.top + PLOT_HEIGHT}
          x2={PADDING.left + PLOT_WIDTH}
          y2={PADDING.top + PLOT_HEIGHT}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Now line */}
        <line
          x1={nowX}
          y1={PADDING.top}
          x2={nowX}
          y2={PADDING.top + PLOT_HEIGHT}
          stroke="hsl(var(--fg-2))"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.7"
        />

        {/* Concentration curve */}
        <path d={pathData} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Current concentration point */}
        <circle
          cx={currentPoint.x.toFixed(1)}
          cy={currentPoint.y.toFixed(1)}
          r="3"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />

        {/* X-axis labels */}
        <text x={PADDING.left} y={PADDING.top + PLOT_HEIGHT + 15} fontSize="9" fill="hsl(var(--fg-2))">
          {formatDate(series[0].time)}
        </text>
        <text x={PADDING.left + PLOT_WIDTH / 2} y={PADDING.top + PLOT_HEIGHT + 15} fontSize="9" textAnchor="middle" fill="hsl(var(--fg-2))">
          {formatDate(new Date((startTime + endTime) / 2))}
        </text>
        <text x={PADDING.left + PLOT_WIDTH} y={PADDING.top + PLOT_HEIGHT + 15} fontSize="9" textAnchor="end" fill="hsl(var(--fg-2))">
          {formatDate(series[series.length - 1].time)}
        </text>
      </svg>

      <div className="mt-2 flex items-center justify-between text-[11px] text-[hsl(var(--fg-2))]">
        <span>Past 30 days</span>
        <span>Next 14 days (projected)</span>
      </div>
    </div>
  );
}

// ── Summary tile ──────────────────────────────────────────────────────────────

function SummaryTile({ label, value, hint, icon: Icon }) {
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
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.8)] text-[hsl(var(--brand))]">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

// ── Page entry point ──────────────────────────────────────────────────────────

export default function Protocols() {
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  return (
    <SafePageBoundary
      title={t('pages.protocols.title')}
      subtitle={t('pages.protocols.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription="The Protocols route stayed available in safe mode even though the main content failed."
    >
      <ProtocolsContent />
    </SafePageBoundary>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function ProtocolsContent() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  const filterLabels = getFilterLabels(t);
  const qc = useQueryClient();

  const [filter, setFilter] = useState('active');
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState('');

  // Dose logging state
  const [isLogDoseOpen, setIsLogDoseOpen] = useState(false);
  const [loggingProtocol, setLoggingProtocol] = useState(null);

  // ── Query ──────────────────────────────────────────────────────────────────

  const protocolsQuery = useQuery({
    queryKey: PROTOCOLS_QUERY_KEY,
    queryFn: fetchProtocols,
    // Only fetch once the user session is confirmed
    enabled: Boolean(user?.id),
    retry: 1,
  });

  // ── Save (create / update) ─────────────────────────────────────────────────

  const saveProtocolMutation = useMutation({
    mutationFn: ({ protocolId, payload }) =>
      protocolId
        ? updateProtocol(protocolId, payload)
        : createProtocol({ ...payload, user_id: user.id }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setIsFormOpen(false);
      setEditingProtocol(null);
      setNotice({
        tone: 'success',
        message: variables.protocolId ? 'Protocol updated.' : 'Protocol added.',
      });
    },
    onError: (error) => {
      console.error('[Protocols] save error:', error);
      setNotice({
        tone: 'warning',
        message: t('pages.protocols.save_error'),
      });
    },
  });

  // ── Status change (pause / resume / finish / reactivate) ──────────────────

  const statusMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProtocol(id, payload),
    onMutate: ({ actionKey }) => setPendingActionKey(actionKey),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({ tone: 'success', message: variables.successMessage });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message: t('pages.protocols.status_error'),
      });
    },
    onSettled: () => setPendingActionKey(''),
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => deleteProtocol(id),
    onMutate: ({ actionKey }) => setPendingActionKey(actionKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({ tone: 'success', message: t('pages.protocols.delete_success') });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message: t('pages.protocols.delete_error'),
      });
    },
    onSettled: () => setPendingActionKey(''),
  });

  // ── Dose logging ───────────────────────────────────────────────────────────

  const logDoseMutation = useMutation({
    mutationFn: ({ protocolId, dose_amount, unit, notes, taken_at }) =>
      logDose({
        protocol_id: protocolId,
        user_id: user.id,
        dose_amount,
        unit,
        notes,
        taken_at: taken_at || new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['protocol-logs'] });
      setIsLogDoseOpen(false);
      setLoggingProtocol(null);
      setNotice({ tone: 'success', message: 'Dose logged successfully.' });
    },
    onError: (error) => {
      console.error('[Protocols] log dose error:', error);
      setNotice({
        tone: 'warning',
        message: 'Failed to log dose. Please try again.',
      });
    },
  });

  const protocols = toArray(protocolsQuery.data);
  const isLoading = protocolsQuery.isPending;
  const hasLoadError = protocolsQuery.isError;

  const groupedProtocols = useMemo(() => {
    const active   = protocols.filter((p) =>  p?.active && !p?.end_date);
    const paused   = protocols.filter((p) => !p?.active && !p?.end_date);
    const finished = protocols.filter((p) =>  Boolean(p?.end_date));
    return { all: protocols, active, paused, finished };
  }, [protocols]);

  const filteredProtocols = groupedProtocols[filter] ?? [];
  const hasAnyProtocols = protocols.length > 0;

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleCreate = () => {
    setNotice(null);
    setEditingProtocol(null);
    setIsFormOpen(true);
  };

  const handleEdit = (protocol) => {
    setNotice(null);
    setEditingProtocol(protocol);
    setIsFormOpen(true);
  };

  const handleStatusChange = (protocol, nextStatus) => {
    if (!protocol?.id) return;

    // Send null (not empty string) for date columns — Postgres rejects ''
    const payloads = {
      active:   { active: true,  end_date: null },
      paused:   { active: false, end_date: null },
      finished: { active: false, end_date: protocol?.end_date || getToday() },
    };

    const messages = {
      active:   'Protocol reactivated.',
      paused:   'Protocol paused.',
      finished: 'Protocol marked as finished.',
    };

    statusMutation.mutate({
      id: protocol.id,
      payload: payloads[nextStatus],
      actionKey: `${protocol.id}-${nextStatus}`,
      successMessage: messages[nextStatus],
    });
  };

  const handleDelete = (protocol) => {
    if (!protocol?.id) return;

    const label = protocol?.substance_name || protocol?.name || 'this item';
    if (!window.confirm(`Delete ${label}?`)) return;

    deleteMutation.mutate({
      id: protocol.id,
      actionKey: `${protocol.id}-delete`,
    });
  };

  const handleFormSubmit = (payload) => {
    saveProtocolMutation.mutate({
      protocolId: editingProtocol?.id ?? null,
      payload,
    });
  };

  const handleLogDose = (protocol) => {
    setNotice(null);
    setLoggingProtocol(protocol);
    setIsLogDoseOpen(true);
  };

  const handleLogDoseSubmit = (payload) => {
    if (!loggingProtocol?.id) return;
    logDoseMutation.mutate({
      protocolId: loggingProtocol.id,
      ...payload,
    });
  };

  const handleLogDoseClose = () => {
    if (logDoseMutation.isPending) return;
    setIsLogDoseOpen(false);
    setLoggingProtocol(null);
  };

  const handleFormClose = () => {
    if (saveProtocolMutation.isPending) return;
    setIsFormOpen(false);
    setEditingProtocol(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageShell
      title={isPt ? "Protocolos" : "Protocols"}
      subtitle={isPt ? "Acompanhe compostos, doses e ciclos do seu protocolo atual em um só lugar." : "Track compounds, doses and cycles of your current protocol in one place."}
      actions={
        <PrimaryButton
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Protocol
        </PrimaryButton>
      }
      maxWidth="max-w-6xl"
    >
      {notice?.message ? (
        <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>
      ) : null}

      {isLoading ? (
        <LoadingState
          title="Loading protocols"
          description="Please wait while your protocols are loading."
        />
      ) : null}

      {!isLoading && hasLoadError ? (
        <ErrorState
          title="Protocols in safe mode"
          description="Data did not load completely, but you can still add new items."
        />
      ) : null}

      {/* Summary tiles */}
      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Active"
          value={groupedProtocols.active.length}
          hint={isPt ? "Compostos em uso ou sendo monitorados." : "Compounds currently in use or being monitored."}
          icon={FlaskConical}
        />
        <SummaryTile
          label="Paused"
          value={groupedProtocols.paused.length}
          hint={isPt ? "Itens temporariamente suspensos mas ainda rastreados." : "Items temporarily suspended but still tracked."}
          icon={PauseCircle}
        />
        <SummaryTile
          label="Finished"
          value={groupedProtocols.finished.length}
          hint={isPt ? "Ciclos e protocolos completos mantidos no histórico." : "Completed cycles and protocols kept in history."}
          icon={Clock3}
        />
      </section>

      {/* Half-Life Curve Visualization (Performance Plan) */}
      <UpgradeGate feature="advanced_protocol_tracking" plan="Performance">
        <SectionCard title={isPt ? "Curvas de Meia-Vida" : "Half-Life Curves"} subtitle={isPt ? "Visualize a concentração ativa ao longo do tempo para protocolos atuais." : "Visualize active concentration over time for current protocols."}>
          <ConcentrationChart protocols={groupedProtocols.active} />
        </SectionCard>
      </UpgradeGate>

      {/* Protocol list */}
      <SectionCard
        title={isPt ? "Itens do protocolo atual" : "Current protocol items"}
        subtitle={isPt ? "Rastreamento de status de substâncias que você usa ou monitora." : "Status tracking of substances you currently use or monitor."}
        actions={
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => {
              const count =
                option === 'all'
                  ? groupedProtocols.all.length
                  : groupedProtocols[option]?.length ?? 0;

              return (
                <FilterChip
                  key={option}
                  onClick={() => setFilter(option)}
                  active={filter === option}
                >
                  {filterLabels[option] || option} ({count})
                </FilterChip>
              );
            })}
          </div>
        }
      >
        {/* Skeleton while loading */}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="animate-pulse rounded-[28px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.72)] p-5"
              >
                <div className="h-5 w-40 rounded-full bg-[hsl(var(--border))]" />
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((block) => (
                    <div key={block} className="h-20 rounded-2xl bg-[hsl(var(--card))]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* No protocols at all */}
        {!isLoading && !hasAnyProtocols ? (
          <EmptyState
            title={isPt ? "Nenhum item de protocolo" : "No protocol items"}
            description={
              hasLoadError
                ? 'The list could not be loaded. You can still add your first protocol.'
                : 'Start with a medication, hormone, peptide, supplement or other tracked compound.'
            }
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Add Protocol
              </PrimaryButton>
            }
          />
        ) : null}

        {/* Filter has no matches */}
        {!isLoading && hasAnyProtocols && filteredProtocols.length === 0 ? (
          <EmptyState
            title={`No ${filterLabels[filter]?.toLowerCase() || filter} protocols`}
            description="Try another filter or add a new protocol."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Add Protocol
              </PrimaryButton>
            }
          />
        ) : null}

        {/* Protocol cards */}
        {!isLoading && filteredProtocols.length > 0 ? (
          <div className="space-y-4">
            {filteredProtocols.map((protocol) => {
              const status = getProtocolStatus(protocol);

              return (
                <ProtocolCard
                  key={protocol?.id ?? `${protocol?.name}-${protocol?.start_date}`}
                  protocol={protocol}
                  status={status}
                  busyActionKey={pendingActionKey}
                  onEdit={() => handleEdit(protocol)}
                  onLogDose={status === 'active' ? () => handleLogDose(protocol) : null}
                  isLogDosePending={logDoseMutation.isPending && loggingProtocol?.id === protocol.id}
                  onPause={
                    status === 'active'
                      ? () => handleStatusChange(protocol, 'paused')
                      : null
                  }
                  onResume={
                    status === 'paused'
                      ? () => handleStatusChange(protocol, 'active')
                      : null
                  }
                  onFinish={
                    status !== 'finished'
                      ? () => handleStatusChange(protocol, 'finished')
                      : null
                  }
                  onDelete={() => handleDelete(protocol)}
                />
              );
            })}
          </div>
        ) : null}
      </SectionCard>

      {/* Create / Edit dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (saveProtocolMutation.isPending) return;
          setIsFormOpen(open);
          if (!open) setEditingProtocol(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
          <DialogPanelHeader
            eyebrow={isPt ? "Protocolos" : "Protocols"}
            title={editingProtocol ? 'Edit protocol' : 'Add Protocol'}
            description="Enter the main protocol data: substance, category, dose, unit, frequency, timing and current status."
            accentClassName="from-[hsl(var(--brand)/0.18)] via-[hsl(var(--accent-secondary)/0.08)]"
          />
          {/* Visually hidden for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>
              {editingProtocol ? 'Edit protocol' : 'Add Protocol'}
            </DialogTitle>
            <DialogDescription>
              Enter the main protocol data: substance, category, dose, unit, frequency, timing and current status.
            </DialogDescription>
          </DialogHeader>

          <ProtocolForm
            protocol={editingProtocol}
            isSubmitting={saveProtocolMutation.isPending}
            onCancel={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
      {/* Log Dose dialog */}
      <Dialog
        open={isLogDoseOpen}
        onOpenChange={(open) => {
          if (logDoseMutation.isPending) return;
          setIsLogDoseOpen(open);
          if (!open) setLoggingProtocol(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
          <DialogPanelHeader
            eyebrow="Log Dose"
            title={loggingProtocol?.substance_name || 'Log Dose'}
            description={`Record when you took this dose. Defaults to protocol settings.`}
            accentClassName="from-[hsl(var(--ok)/0.18)] via-[hsl(var(--brand)/0.08)]"
          />
          <DialogHeader className="sr-only">
            <DialogTitle>Log Dose</DialogTitle>
            <DialogDescription>
              Record a dose administration for this protocol.
            </DialogDescription>
          </DialogHeader>
          <LogDoseForm
            protocol={loggingProtocol}
            isSubmitting={logDoseMutation.isPending}
            onCancel={handleLogDoseClose}
            onSubmit={handleLogDoseSubmit}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
