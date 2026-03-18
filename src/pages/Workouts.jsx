import React, { useMemo, useState } from 'react';
import { Clock3, FlaskConical, PauseCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  EmptyState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';

const FILTERS = ['all', 'active', 'paused', 'finished'];
const MOCK_PROTOCOLS = [
  {
    id: 'mock-protocol-1',
    name: 'Pre-workout stack',
    substance_name: 'Caffeine + Citrulline',
    category: 'Supplement',
    dose: '200mg + 6g',
    frequency: 'Before strength session',
    notes: 'Use only on heavy training days.',
    start_date: '2026-03-03',
    end_date: '',
    active: true,
  },
  {
    id: 'mock-protocol-2',
    name: 'Recovery support',
    substance_name: 'Electrolytes',
    category: 'Hydration',
    dose: '1 scoop',
    frequency: 'After conditioning',
    notes: 'Paused while weekly volume is reduced.',
    start_date: '2026-02-15',
    end_date: '',
    active: false,
  },
  {
    id: 'mock-protocol-3',
    name: 'Creatine cycle',
    substance_name: 'Creatine Monohydrate',
    category: 'Supplement',
    dose: '5g',
    frequency: 'Daily',
    notes: 'Previous block completed and kept for reference.',
    start_date: '2026-01-08',
    end_date: '2026-02-22',
    active: false,
  },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getProtocolStatus(protocol) {
  if (protocol?.end_date) return 'finished';
  if (protocol?.active === false) return 'paused';
  return 'active';
}

function SummaryTile({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-[28px] border border-zinc-200/90 bg-white px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{hint}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function LocalProtocolCard({ protocol, status, onEdit, onPause, onResume, onFinish, onDelete }) {
  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-950">
                {protocol?.substance_name || protocol?.name || 'Protocol item'}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : status === 'paused'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Finished'}
              </span>
              {protocol?.category ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                  {protocol.category}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              {protocol?.dose || 'Dose not defined'} ·{' '}
              {protocol?.frequency || 'Frequency not defined'}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Start
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">
                {protocol?.start_date || '--'}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                End
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">
                {protocol?.end_date || '--'}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Name
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">
                {protocol?.name || '--'}
              </p>
            </div>
          </div>

          {protocol?.notes ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{protocol.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[240px] lg:justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Edit
          </button>
          {onPause ? (
            <button
              type="button"
              onClick={onPause}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
            >
              Pause
            </button>
          ) : null}
          {onResume ? (
            <button
              type="button"
              onClick={onResume}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              Resume
            </button>
          ) : null}
          {onFinish ? (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200"
            >
              Finish
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Workouts() {
  return (
    <SafePageBoundary
      title="Protocols"
      subtitle="Active protocol management for medications, hormones, peptides, supplements, and other compounds you are using or tracking."
      maxWidth="max-w-6xl"
      fallbackDescription="The Protocols route stayed available in safe mode even though the main content failed."
    >
      <WorkoutsContent />
    </SafePageBoundary>
  );
}

function WorkoutsContent() {
  const [filter, setFilter] = useState('active');
  const [notice, setNotice] = useState(null);
  const [protocols, setProtocols] = useState(MOCK_PROTOCOLS);

  const groupedProtocols = useMemo(() => {
    const active = protocols.filter((item) => item?.active && !item?.end_date);
    const paused = protocols.filter((item) => !item?.active && !item?.end_date);
    const finished = protocols.filter((item) => Boolean(item?.end_date));

    return {
      all: protocols,
      active,
      paused,
      finished,
    };
  }, [protocols]);

  const filteredProtocols = groupedProtocols[filter] || [];
  const hasAnyProtocols = protocols.length > 0;

  const handleCreate = () => {
    setNotice({
      tone: 'warning',
      message: 'Mock local ativo: o formulario desta tela ainda nao foi migrado.',
    });
  };

  const handleEdit = (protocol) => {
    setNotice({
      tone: 'warning',
      message: `Mock local ativo: edicao de "${protocol?.substance_name || protocol?.name}" ainda nao foi migrada.`,
    });
  };

  const handleStatusChange = (protocol, nextStatus) => {
    if (!protocol?.id) return;

    setProtocols((current) =>
      current.map((item) => {
        if (item.id !== protocol.id) return item;

        if (nextStatus === 'active') {
          return { ...item, active: true, end_date: '' };
        }

        if (nextStatus === 'paused') {
          return { ...item, active: false, end_date: '' };
        }

        return { ...item, active: false, end_date: item.end_date || getToday() };
      })
    );

    setNotice({
      tone: 'success',
      message:
        nextStatus === 'active'
          ? 'Protocol item resumed.'
          : nextStatus === 'paused'
          ? 'Protocol item paused.'
          : 'Protocol item marked as finished.',
    });
  };

  const handleDelete = (protocol) => {
    if (!protocol?.id) return;

    const protocolLabel = protocol?.substance_name || protocol?.name || 'this protocol item';
    const confirmed = window.confirm(`Delete ${protocolLabel}?`);

    if (!confirmed) return;

    setProtocols((current) => current.filter((item) => item.id !== protocol.id));
    setNotice({
      tone: 'success',
      message: 'Protocol item deleted.',
    });
  };

  return (
    <PageShell
      title="Protocols"
      subtitle="A focused V1 workspace for current compounds, simple scheduling, status control, and visible adherence context without breaking the stable app shell."
      actions={
        <PrimaryButton
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add protocol item
        </PrimaryButton>
      }
      maxWidth="max-w-6xl"
    >
      <StatusBanner tone="warning">
        Proximo ponto de falha encontrado nesta rota: <strong>src/pages/Workouts.jsx</strong>{' '}
        ainda chamava <strong>base44.entities.Protocol.list/update/create/delete</strong>. Essas
        chamadas foram trocadas por estado local mock minimo.
      </StatusBanner>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Active"
          value={groupedProtocols.active.length}
          hint="Current compounds still in rotation right now."
          icon={FlaskConical}
        />
        <SummaryTile
          label="Paused"
          value={groupedProtocols.paused.length}
          hint="Items temporarily stopped but still being tracked."
          icon={PauseCircle}
        />
        <SummaryTile
          label="Finished"
          value={groupedProtocols.finished.length}
          hint="Completed cycles and protocols kept in history."
          icon={Clock3}
        />
      </section>

      <SectionCard
        title="Current protocol items"
        subtitle="Clean, status-driven tracking for the substances you are currently using or still monitoring."
        actions={
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => {
              const count =
                option === 'all'
                  ? groupedProtocols.all.length
                  : groupedProtocols[option]?.length || 0;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    filter === option
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  {option[0].toUpperCase() + option.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        }
      >
        {!hasAnyProtocols ? (
          <EmptyState
            title="No protocol items yet"
            description="Start with a medication, hormone, peptide, supplement, or any other tracked compound."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Add protocol item
              </PrimaryButton>
            }
          />
        ) : null}

        {hasAnyProtocols && filteredProtocols.length === 0 ? (
          <EmptyState
            title={`No ${filter} protocol items`}
            description="Try another status filter or add a new protocol item."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Add protocol item
              </PrimaryButton>
            }
          />
        ) : null}

        {filteredProtocols.length > 0 ? (
          <div className="space-y-4">
            {filteredProtocols.map((protocol) => {
              const status = getProtocolStatus(protocol);

              return (
                <LocalProtocolCard
                  key={protocol?.id || `${protocol?.name}-${protocol?.start_date || 'date'}`}
                  protocol={protocol}
                  status={status}
                  onEdit={() => handleEdit(protocol)}
                  onPause={status === 'active' ? () => handleStatusChange(protocol, 'paused') : null}
                  onResume={status === 'paused' ? () => handleStatusChange(protocol, 'active') : null}
                  onFinish={
                    status !== 'finished' ? () => handleStatusChange(protocol, 'finished') : null
                  }
                  onDelete={() => handleDelete(protocol)}
                />
              );
            })}
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}
