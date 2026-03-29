import React, { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Clock, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import {
  calculateConcentrationAtTime,
  generateConcentrationSeries,
  getCurrentConcentration,
  getConcentrationStats,
  getSubstanceHalfLife,
} from '@/lib/concentrationCalculator';
import ProtocolCard from '@/components/protocols/ProtocolCard';
import ProtocolForm from '@/components/protocols/ProtocolForm';
import LogDoseForm from '@/components/protocols/LogDoseForm';
import TodayDoseSection from '@/components/protocols/TodayDoseSection';
import AdherenceWidget from '@/components/protocols/AdherenceWidget';
import AIInsightsBanner from '@/components/protocols/AIInsightsBanner';
import { useAICoach } from '@/hooks/useAICoach';
import CadenceScheduleView from '@/components/protocols/CadenceScheduleView';
import ProtocolTimeline from '@/components/protocols/ProtocolTimeline';
import QuickAddTemplates from '@/components/protocols/QuickAddTemplates';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import {
  DialogPanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
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
const LOGS_QUERY_KEY = ['protocol-logs'];

const CURVE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getProtocolStatus(protocol) {
  if (protocol?.end_date) return 'finished';
  if (protocol?.active === false) return 'paused';
  return 'active';
}

function estimateIntervalDays(frequency) {
  if (!frequency) return 7;
  const f = frequency.toLowerCase();
  if (f.includes('daily') || f.includes('diário') || f.includes('1x/day') || f.includes('1x/dia')) return 1;
  if (f.includes('2x/day') || f.includes('2x/dia')) return 0.5;
  if (f.includes('eod') || f.includes('every other day') || f.includes('dia sim')) return 2;
  if (f.includes('3x/week') || f.includes('3x/sem')) return 7 / 3;
  if (f.includes('2x/week') || f.includes('2x/sem')) return 3.5;
  if (f.includes('1x/week') || f.includes('1x/sem') || f.includes('weekly') || f.includes('semanal')) return 7;
  if (f.includes('biweekly') || f.includes('quinzenal') || f.includes('2x/month') || f.includes('2x/mês')) return 14;
  if (f.includes('monthly') || f.includes('mensal') || f.includes('1x/month')) return 30;
  return 7;
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

function ConcentrationChart({ protocols }) {
  const { t } = useI18n();
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

  // Combine protocols with their logs, series, stats, and projections
  const protocolsWithData = useMemo(() => {
    return protocols.map((protocol, index) => {
      const logs = logsQueries[index]?.data || [];
      const halfLife = getSubstanceHalfLife(protocol);
      const series =
        logs.length > 0
          ? generateConcentrationSeries(logs, halfLife, 30, 14, 4)
          : [];
      const stats = logs.length > 0 ? getConcentrationStats(logs, halfLife) : null;
      const currentConc = logs.length > 0 ? getCurrentConcentration(logs, halfLife) : 0;

      const lastDose = logs.length > 0
        ? logs.reduce((latest, log) =>
            new Date(log.taken_at) > new Date(latest.taken_at) ? log : latest)
        : null;

      const intervalDays = estimateIntervalDays(protocol.frequency);
      const nextDoseTime = lastDose
        ? new Date(new Date(lastDose.taken_at).getTime() + intervalDays * 86400000)
        : null;
      const concAtNextDose = lastDose && nextDoseTime
        ? calculateConcentrationAtTime(logs, nextDoseTime, halfLife) : 0;
      const missedTime = lastDose
        ? new Date(new Date(lastDose.taken_at).getTime() + intervalDays * 2 * 86400000)
        : null;
      const concIfMissed = lastDose && missedTime
        ? calculateConcentrationAtTime(logs, missedTime, halfLife) : 0;

      const peakPct = stats && stats.peak > 0 ? (currentConc / stats.peak) * 100 : 0;
      const decayPhase = peakPct > 80 ? 'peak' : peakPct > 50 ? 'moderate' : peakPct > 20 ? 'declining' : 'low';

      return {
        protocol, logs, halfLife, series, stats, currentConc,
        lastDose, nextDoseTime, concAtNextDose, concIfMissed,
        peakPct, decayPhase, hasLogs: logs.length > 0,
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
      {/* ── Hero Summary ──────────────────────────────────────────────── */}
      {hasAnyLogs && (
        <div className="rounded-[20px] border border-[hsl(var(--brand)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.08)] to-[hsl(var(--fill)/0.3)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[hsl(var(--brand))]" />
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
              {t('pages.protocols.current_state')}
            </p>
          </div>
          <div className="space-y-3">
            {protocolsWithData.filter(p => p.hasLogs).map((data) => {
              const statusLabel = { peak: t('pages.protocols.status_peak'), moderate: t('pages.protocols.status_stable'), declining: t('pages.protocols.status_declining'), low: t('pages.protocols.status_low') }[data.decayPhase];
              const statusColor = { peak: 'hsl(var(--ok))', moderate: 'hsl(var(--brand))', declining: 'hsl(var(--warn))', low: 'hsl(var(--err))' }[data.decayPhase];
              return (
                <div key={data.protocol.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: statusColor }} />
                    <span className="text-[13px] text-[hsl(var(--fg))] truncate">{data.protocol.substance_name || data.protocol.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] shrink-0">
                    <span style={{ color: statusColor }} className="font-medium">{statusLabel}</span>
                    <span className="text-[hsl(var(--fg-2))]">{Math.round(data.peakPct)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasAnyLogs && (
        <div className="rounded-[16px] border border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.08)] px-4 py-3">
          <p className="text-[13px] text-[hsl(var(--warn))]">
            {t('pages.protocols.no_doses')}
          </p>
        </div>
      )}

      {/* ── Per-compound analysis ─────────────────────────────────────── */}
      {protocolsWithData.map((data, index) => {
        const color = CURVE_COLORS[index % CURVE_COLORS.length];
        return (
          <div key={data.protocol.id} className="space-y-3">
            {/* Concentration Curve */}
            <ProtocolConcentrationCard data={data} color={color} locale={locale} />

            {/* Half-life + Projection grid */}
            {data.hasLogs && data.stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Half-life Panel */}
                <div className="rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.3)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-3.5 w-3.5 text-[hsl(var(--fg-2))]" />
                    <p className="text-[12px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">{t('pages.protocols.half_life')}</p>
                  </div>
                  <p className="text-[22px] font-semibold text-[hsl(var(--fg))]">
                    ~{data.halfLife < 1 ? `${(data.halfLife * 24).toFixed(0)}h` : `${data.halfLife.toFixed(1)}d`}
                  </p>
                  <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
                    {data.decayPhase === 'peak' && t('pages.protocols.peak_phase')}
                    {data.decayPhase === 'moderate' && t('pages.protocols.moderate_decline')}
                    {data.decayPhase === 'declining' && t('pages.protocols.declining_phase')}
                    {data.decayPhase === 'low' && t('pages.protocols.low_phase')}
                  </p>
                </div>

                {/* Projection Panel */}
                <div className="rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.3)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--fg-2))]" />
                    <p className="text-[12px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">{t('pages.protocols.projection')}</p>
                  </div>
                  {data.nextDoseTime && data.concAtNextDose > 0 ? (
                    <>
                      <p className="text-[13px] text-[hsl(var(--fg))] leading-relaxed">
                        {data.peakPct > 40
                          ? t('pages.protocols.dose_on_time')
                          : t('pages.protocols.dose_dropping')}
                      </p>
                      {data.concIfMissed > 0 && data.stats.peak > 0 && (
                        <p className="mt-2 text-[12px] text-[hsl(var(--warn))] leading-relaxed">
                          {t('pages.protocols.missed_dose', { pct: Math.round((data.concIfMissed / data.stats.peak) * 100) })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-[hsl(var(--fg-2))]">
                      {t('pages.protocols.log_for_projections')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProtocolConcentrationCard({ data, color, locale }) {
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
  const { t } = useI18n();
  const qc = useQueryClient();
  const ai = useAICoach({ userId: user?.id });

  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTemplateMode, setIsTemplateMode] = useState(true);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState('');

  // Dose logging state
  const [isLogDoseOpen, setIsLogDoseOpen] = useState(false);
  const [loggingProtocol, setLoggingProtocol] = useState(null);

  // ── Queries ─────────────────────────────────────────────────────────────────

  const protocolsQuery = useQuery({
    queryKey: PROTOCOLS_QUERY_KEY,
    queryFn: fetchProtocols,
    enabled: Boolean(user?.id),
    retry: 1,
  });

  const logsQuery = useQuery({
    queryKey: LOGS_QUERY_KEY,
    queryFn: fetchAllProtocolLogs,
    enabled: Boolean(user?.id),
    retry: 1,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveProtocolMutation = useMutation({
    mutationFn: ({ protocolId, payload }) =>
      protocolId
        ? updateProtocol(protocolId, payload)
        : createProtocol({ ...payload, user_id: user.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setIsFormOpen(false);
      setIsTemplateMode(true);
      setEditingProtocol(null);
      setNotice({ tone: 'success', message: 'Saved successfully.' });
    },
    onError: () => {
      setNotice({ tone: 'warning', message: 'Failed to save. Please try again.' });
    },
  });

  const saveMultipleProtocolsMutation = useMutation({
    mutationFn: async (items) => {
      const results = [];
      for (const item of items) {
        const result = await createProtocol({ ...item, user_id: user.id });
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setIsFormOpen(false);
      setIsTemplateMode(true);
      setEditingProtocol(null);
      setNotice({ tone: 'success', message: 'Items added successfully.' });
    },
    onError: () => {
      setNotice({ tone: 'warning', message: 'Failed to add items. Please try again.' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProtocol(id, payload),
    onMutate: ({ actionKey }) => setPendingActionKey(actionKey),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({ tone: 'success', message: variables.successMessage });
    },
    onError: () => {
      setNotice({ tone: 'warning', message: 'Failed to update status.' });
    },
    onSettled: () => setPendingActionKey(''),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => deleteProtocol(id),
    onMutate: ({ actionKey }) => setPendingActionKey(actionKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({ tone: 'success', message: 'Item deleted.' });
    },
    onError: () => {
      setNotice({ tone: 'warning', message: 'Failed to delete.' });
    },
    onSettled: () => setPendingActionKey(''),
  });

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
      qc.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
      setIsLogDoseOpen(false);
      setLoggingProtocol(null);
      setNotice({ tone: 'success', message: 'Dose logged.' });
    },
    onError: () => {
      setNotice({ tone: 'warning', message: 'Failed to log dose.' });
    },
  });

  // ── Data processing ────────────────────────────────────────────────────────

  const protocols = toArray(protocolsQuery.data);
  const logs = toArray(logsQuery.data);
  const isLoading = protocolsQuery.isPending || logsQuery.isPending;
  const hasLoadError = protocolsQuery.isError || logsQuery.isError;

  const activeProtocols = useMemo(() => 
    protocols.filter((p) => p?.active !== false && !p?.end_date),
    [protocols]
  );

  const hasAnyProtocols = protocols.length > 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreate = () => {
    setNotice(null);
    setEditingProtocol(null);
    setIsTemplateMode(true);
    setIsFormOpen(true);
  };

  const handleEdit = (protocol) => {
    setNotice(null);
    setEditingProtocol(protocol);
    setIsTemplateMode(false);
    setIsFormOpen(true);
  };

  const handleTemplateSelect = (template) => {
    if (template.type === 'ai') {
      setIsTemplateMode(false);
      setIsFormOpen(true); // Open blank form so user can fill in manually
    } else if (template.items) {
      // Add template items with today's date
      const itemsWithDates = template.items.map(item => ({
        ...item,
        start_date: getToday(),
        active: true,
      }));
      saveMultipleProtocolsMutation.mutate(itemsWithDates);
    }
  };

  const handleFormSubmit = (payload) => {
    saveProtocolMutation.mutate({
      protocolId: editingProtocol?.id ?? null,
      payload,
    });
  };

  const handleStatusChange = (protocol, nextStatus) => {
    if (!protocol?.id) return;

    const payloads = {
      active: { active: true, end_date: null },
      paused: { active: false, end_date: null },
      finished: { active: false, end_date: protocol?.end_date || getToday() },
    };

    const messages = {
      active: 'Reactivated.',
      paused: 'Paused.',
      finished: 'Marked as finished.',
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
    deleteMutation.mutate({ id: protocol.id, actionKey: `${protocol.id}-delete` });
  };

  const handleLogDose = (protocol) => {
    setNotice(null);
    setLoggingProtocol(protocol);
    setIsLogDoseOpen(true);
  };

  const handleLogDoseSubmit = (payload) => {
    if (!loggingProtocol?.id) return;
    logDoseMutation.mutate({ protocolId: loggingProtocol.id, ...payload });
  };

  const handleFormClose = () => {
    if (saveProtocolMutation.isPending || saveMultipleProtocolsMutation.isPending) return;
    setIsFormOpen(false);
    setIsTemplateMode(true);
    setEditingProtocol(null);
  };

  const handleLogDoseClose = () => {
    if (logDoseMutation.isPending) return;
    setIsLogDoseOpen(false);
    setLoggingProtocol(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageShell
      eyebrow={t('pages.protocols.eyebrow')}
      title={t('pages.protocols.page_title')}
      subtitle={t('pages.protocols.page_subtitle')}
      actions={
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))] px-4 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[hsl(var(--brand)/0.9)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {t('pages.protocols.add_new')}
        </button>
      }
      maxWidth="max-w-4xl"
    >
      {notice?.message && (
        <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>
      )}

      {isLoading && (
        <LoadingState
          title="Loading your items"
          description="Please wait while we load your supplements and medications."
        />
      )}

      {!isLoading && hasLoadError && (
        <ErrorState
          title="Unable to load data"
          description="Some information may be unavailable, but you can still add new items."
        />
      )}

      {/* ── TODAY: Critical daily focus section ─────────────────────────────── */}
      {!isLoading && (
        <SectionCard
          title={t('pages.protocols.today_section')}
          subtitle={t('pages.protocols.today_subtitle')}
        >
          <TodayDoseSection
            protocols={activeProtocols}
            logs={logs}
            onLogDose={handleLogDose}
            isPending={logDoseMutation.isPending}
            loggingProtocolId={loggingProtocol?.id}
          />
        </SectionCard>
      )}

      {/* ── AI Protocol Coaching (engine-driven) ─────────────────────────────── */}
      {!isLoading && ai.protocols && ai.protocols.status !== 'no_protocols' && (
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[hsl(var(--brand-ai)/0.12)] flex items-center justify-center shrink-0">
              <span className="text-[14px]">🧠</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{ai.protocols.message}</p>
              {ai.protocols.adherenceNote && (
                <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1">{ai.protocols.adherenceNote}</p>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── AI Insights Banner (rules-based fallback) ────────────────────────── */}
      {!isLoading && hasAnyProtocols && !ai.protocols && (
        <AIInsightsBanner protocols={activeProtocols} logs={logs} />
      )}

      {/* ── Cadence Schedule ─────────────────────────────────────────────────── */}
      {!isLoading && hasAnyProtocols && (
        <SectionCard
          title={t('pages.protocols.schedule_section')}
          subtitle={t('pages.protocols.schedule_subtitle')}
        >
          <CadenceScheduleView protocols={protocols} logs={logs} />
        </SectionCard>
      )}

      {/* ── Protocol Timeline ────────────────────────────────────────────────── */}
      {!isLoading && hasAnyProtocols && (
        <SectionCard
          title={t('pages.protocols.timeline_section')}
          subtitle={t('pages.protocols.timeline_subtitle')}
        >
          <ProtocolTimeline protocols={protocols} />
        </SectionCard>
      )}

      {/* ── Active Items: Simplified cards ──────────────────────────────────── */}
      {!isLoading && (
        <SectionCard
          title={t('pages.protocols.active_items')}
          subtitle={t('pages.protocols.active_items_subtitle')}
        >
          {!hasAnyProtocols ? (
            <EmptyState
              title={t('pages.protocols.no_items')}
              description={t('pages.protocols.no_items_desc')}
              action={
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))] px-4 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[hsl(var(--brand)/0.9)]"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  {t('pages.protocols.add_first_item')}
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {protocols.map((protocol) => {
                const status = getProtocolStatus(protocol);
                return (
                  <ProtocolCard
                    key={protocol?.id ?? `${protocol?.name}-${protocol?.start_date}`}
                    protocol={protocol}
                    status={status}
                    logs={logs}
                    busyActionKey={pendingActionKey}
                    onEdit={() => handleEdit(protocol)}
                    onLogDose={status === 'active' ? () => handleLogDose(protocol) : null}
                    isLogDosePending={logDoseMutation.isPending && loggingProtocol?.id === protocol.id}
                    onPause={status === 'active' ? () => handleStatusChange(protocol, 'paused') : null}
                    onResume={status === 'paused' ? () => handleStatusChange(protocol, 'active') : null}
                    onFinish={status !== 'finished' ? () => handleStatusChange(protocol, 'finished') : null}
                    onDelete={() => handleDelete(protocol)}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Adherence & Stats ───────────────────────────────────────────────── */}
      {!isLoading && hasAnyProtocols && (
        <AdherenceWidget protocols={activeProtocols} logs={logs} />
      )}

      {/* ── Pharmacokinetic Analysis: Concentration, Half-life, Projections ──── */}
      {!isLoading && hasAnyProtocols && (
        <UpgradeGate feature="advanced_protocol_tracking" plan="Performance">
          <SectionCard
            title={t('pages.protocols.pk_analysis')}
            subtitle={t('pages.protocols.pk_subtitle')}
          >
            <ConcentrationChart protocols={activeProtocols} />
          </SectionCard>
        </UpgradeGate>
      )}

      {/* ── Add/Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (saveProtocolMutation.isPending || saveMultipleProtocolsMutation.isPending) return;
          setIsFormOpen(open);
          if (!open) {
            setEditingProtocol(null);
            setIsTemplateMode(true);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
          {isTemplateMode && !editingProtocol ? (
            <>
              <DialogPanelHeader
                eyebrow={t('pages.protocols.dialog_add_eyebrow')}
                title={t('pages.protocols.dialog_add_title')}
                description={t('pages.protocols.dialog_add_desc')}
                accentClassName="from-[hsl(var(--brand)/0.18)] via-[hsl(var(--accent-secondary)/0.08)]"
              />
              <div className="p-6">
                <QuickAddTemplates 
                  onSelect={handleTemplateSelect}
                  onClose={() => setIsTemplateMode(false)}
                />
              </div>
            </>
          ) : (
            <>
              <DialogPanelHeader
                eyebrow={t('pages.protocols.dialog_edit_eyebrow')}
                title={editingProtocol ? t('pages.protocols.dialog_edit_title') : t('pages.protocols.dialog_add_title_short')}
                description={t('pages.protocols.dialog_edit_desc')}
                accentClassName="from-[hsl(var(--brand)/0.18)] via-[hsl(var(--accent-secondary)/0.08)]"
              />
              <DialogHeader className="sr-only">
                <DialogTitle>{editingProtocol ? 'Edit item' : 'Add item'}</DialogTitle>
                <DialogDescription>
                  Enter the details for this supplement or medication.
                </DialogDescription>
              </DialogHeader>
              <ProtocolForm
                protocol={editingProtocol}
                isSubmitting={saveProtocolMutation.isPending}
                onCancel={handleFormClose}
                onSubmit={handleFormSubmit}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Log Dose Dialog ───────────────────────────────────────────────────── */}
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
            eyebrow={t('pages.protocols.log_dose_eyebrow')}
            title={loggingProtocol?.substance_name || t('pages.protocols.log_dose_title')}
            description={t('pages.protocols.log_dose_desc')}
            accentClassName="from-[hsl(var(--ok)/0.18)] via-[hsl(var(--brand)/0.08)]"
          />
          <DialogHeader className="sr-only">
            <DialogTitle>Log Dose</DialogTitle>
            <DialogDescription>
              Record a dose for this item.
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
