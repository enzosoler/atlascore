import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, FlaskConical, PauseCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import ProtocolCard from '@/components/protocols/ProtocolCard';
import ProtocolForm from '@/components/protocols/ProtocolForm';
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

// Half-life lookup table (in days) for common substances
const SUBSTANCE_HALF_LIFE_MAP = {
  'Cipionato de Testosterona': 8.0,
  'Test C': 8.0,
  'Enantato de Testosterona': 4.5,
  'Test E': 4.5,
  'Propionato de Testosterona': 0.8,
  'Test P': 0.8,
  'Undecanoato de Testosterona': 20.9,
  'Nebido': 20.9,
  'Decanoato de Nandrolona': 12.0,
  'Deca': 12.0,
  'Fenilpropionato de Nandrolona': 2.5,
  'NPP': 2.5,
  'Acetato de Trembolona': 1.0,
  'Tren A': 1.0,
  'Enantato de Trembolona': 5.0,
  'Tren E': 5.0,
  'Drostanolona Propionato': 1.0,
  'Masteron': 1.0,
  'Drostanolona Enantato': 4.5,
  'Mast E': 4.5,
  'Metenolona Enantato': 10.5,
  'Primobolan': 10.5,
  'Oxandrolona': 0.4,
  'Anavar': 0.4,
  'Oximetolona': 0.35,
  'Hemogenin': 0.35,
  'Metandienona': 0.2,
  'Dianabol': 0.2,
  'Estanozolol': 0.4,
  'Winstrol': 0.4,
};

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

// ── Half-Life Curve Chart ────────────────────────────────────────────────────

function getSubstanceHalfLife(protocol) {
  // First check if protocol has estimated_half_life_days
  if (typeof protocol?.estimated_half_life_days === 'number' && protocol.estimated_half_life_days > 0) {
    return protocol.estimated_half_life_days;
  }

  // Fall back to lookup by substance name
  const name = protocol?.substance_name;
  if (name && SUBSTANCE_HALF_LIFE_MAP[name]) {
    return SUBSTANCE_HALF_LIFE_MAP[name];
  }

  // Default to 1 day
  return 1;
}

function HalfLifeCurveChart({ protocols }) {
  if (!protocols || protocols.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.4)] px-6 py-12 text-center">
        <p className="text-[14px] text-[hsl(var(--fg-2))]">Nenhum protocolo ativo para visualizar.</p>
      </div>
    );
  }

  const VIEWBOX_WIDTH = 400;
  const VIEWBOX_HEIGHT = 200;
  const PADDING = { top: 20, bottom: 30, left: 40, right: 60 };
  const PLOT_WIDTH = VIEWBOX_WIDTH - PADDING.left - PADDING.right;
  const PLOT_HEIGHT = VIEWBOX_HEIGHT - PADDING.top - PADDING.bottom;

  const xAxisEnd = PADDING.left + PLOT_WIDTH;
  const yAxisEnd = PADDING.top;

  // Generate points for a decay curve: C(t) = 100 × e^(-0.693 × t / half_life)
  const generateCurvePoints = (halfLife, colorIndex) => {
    const points = [];
    const daysToShow = 30;
    const pointsPerDay = 2;

    for (let i = 0; i <= daysToShow * pointsPerDay; i++) {
      const t = i / pointsPerDay; // days
      const c = 100 * Math.exp((-0.693 * t) / halfLife); // concentration
      const x = PADDING.left + (t / daysToShow) * PLOT_WIDTH;
      const y = PADDING.top + PLOT_HEIGHT - (c / 100) * PLOT_HEIGHT;
      points.push({ x, y, c, t });
    }

    return points;
  };

  const curvesData = protocols.slice(0, 4).map((protocol, index) => {
    const halfLife = getSubstanceHalfLife(protocol);
    const points = generateCurvePoints(halfLife, index);
    return {
      protocol,
      halfLife,
      points,
      color: CURVE_COLORS[index],
      label: protocol?.substance_name || `Protocol ${index + 1}`,
    };
  });

  const pathData = curvesData.map(curve => {
    const d = curve.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    return { color: curve.color, d };
  });

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="w-full border border-[hsl(var(--border)/0.88)] rounded-[16px] bg-[hsl(var(--fill)/0.3)]">
        {/* Grid lines */}
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + PLOT_HEIGHT} stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
        <line x1={PADDING.left} y1={PADDING.top + PLOT_HEIGHT} x2={xAxisEnd} y2={PADDING.top + PLOT_HEIGHT} stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />

        {/* Y-axis labels */}
        <text x={PADDING.left - 8} y={PADDING.top + 4} fontSize="10" textAnchor="end" fill="hsl(var(--fg-2))">100%</text>
        <text x={PADDING.left - 8} y={PADDING.top + PLOT_HEIGHT / 2 + 4} fontSize="10" textAnchor="end" fill="hsl(var(--fg-2))">50%</text>
        <text x={PADDING.left - 8} y={PADDING.top + PLOT_HEIGHT + 4} fontSize="10" textAnchor="end" fill="hsl(var(--fg-2))">0%</text>

        {/* X-axis labels */}
        <text x={PADDING.left} y={PADDING.top + PLOT_HEIGHT + 20} fontSize="10" textAnchor="middle" fill="hsl(var(--fg-2))">0d</text>
        <text x={PADDING.left + PLOT_WIDTH / 2} y={PADDING.top + PLOT_HEIGHT + 20} fontSize="10" textAnchor="middle" fill="hsl(var(--fg-2))">15d</text>
        <text x={xAxisEnd} y={PADDING.top + PLOT_HEIGHT + 20} fontSize="10" textAnchor="middle" fill="hsl(var(--fg-2))">30d</text>

        {/* Axis labels */}
        <text x={PADDING.left - 25} y={PADDING.top - 5} fontSize="11" fontWeight="600" fill="hsl(var(--fg-2))">Conc.</text>
        <text x={xAxisEnd + 15} y={PADDING.top + PLOT_HEIGHT + 22} fontSize="11" fontWeight="600" fill="hsl(var(--fg-2))">Dias</text>

        {/* Curves */}
        {pathData.map((path, idx) => (
          <path
            key={idx}
            d={path.d}
            stroke={path.color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Half-life markers (50% point) */}
        {curvesData.map((curve, idx) => {
          const halfLifePoint = curve.points.find(pt => pt.c <= 50);
          if (!halfLifePoint) return null;
          return (
            <circle
              key={`marker-${idx}`}
              cx={halfLifePoint.x}
              cy={halfLifePoint.y}
              r="2.5"
              fill={curve.color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}

        {/* Protocol labels at right edge */}
        {curvesData.map((curve, idx) => {
          const lastPoint = curve.points[curve.points.length - 1];
          return (
            <g key={`label-${idx}`}>
              <text
                x={xAxisEnd + 8}
                y={lastPoint.y + 4}
                fontSize="11"
                fontWeight="600"
                fill={curve.color}
              >
                {curve.label.slice(0, 12)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {curvesData.map((curve, idx) => (
          <div key={idx} className="rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.5)] px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: curve.color }} />
              <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">{curve.label.slice(0, 14)}</p>
            </div>
            <p className="mt-1 text-[11px] text-[hsl(var(--fg-2))]">T½: {curve.halfLife.toFixed(1)}d</p>
          </div>
        ))}
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
  const { t } = useI18n();
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
  const filterLabels = getFilterLabels(t);
  const qc = useQueryClient();

  const [filter, setFilter] = useState('active');
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState('');

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

  // ── Derived state ──────────────────────────────────────────────────────────

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

  const handleFormClose = () => {
    if (saveProtocolMutation.isPending) return;
    setIsFormOpen(false);
    setEditingProtocol(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageShell
      title="Protocols"
      subtitle="Track compounds, doses and cycles of your current protocol in one place."
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
          hint="Compounds currently in use or being monitored."
          icon={FlaskConical}
        />
        <SummaryTile
          label="Paused"
          value={groupedProtocols.paused.length}
          hint="Items temporarily suspended but still tracked."
          icon={PauseCircle}
        />
        <SummaryTile
          label="Finished"
          value={groupedProtocols.finished.length}
          hint="Completed cycles and protocols kept in history."
          icon={Clock3}
        />
      </section>

      {/* Half-Life Curve Visualization (Performance Plan) */}
      <UpgradeGate feature="advanced_protocol_tracking" plan="Performance">
        <SectionCard title="Half-Life Curves" subtitle="Visualize active concentration over time for current protocols.">
          <HalfLifeCurveChart protocols={groupedProtocols.active} />
        </SectionCard>
      </UpgradeGate>

      {/* Protocol list */}
      <SectionCard
        title="Current protocol items"
        subtitle="Status tracking of substances you currently use or monitor."
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
            title="No protocol items"
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
            eyebrow="Protocols"
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
    </PageShell>
  );
}
