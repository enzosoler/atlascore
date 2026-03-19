import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, FlaskConical, PauseCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import ProtocolCard from '@/components/protocols/ProtocolCard';
import ProtocolForm from '@/components/protocols/ProtocolForm';
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
const FILTER_LABELS = {
  all: 'Todos',
  active: 'Ativo',
  paused: 'Pausado',
  finished: 'Finalizado',
};

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
  return (
    <SafePageBoundary
      title="Protocolos"
      subtitle="Gerencie medicamentos, hormônios, peptídeos, suplementos e outros compostos que você usa ou acompanha."
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
        message: variables.protocolId ? 'Protocolo atualizado.' : 'Protocolo adicionado.',
      });
    },
    onError: (error) => {
      console.error('[Protocols] save error:', error);
      setNotice({
        tone: 'warning',
        message: 'Não foi possível salvar o protocolo. Tente novamente.',
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
        message: 'Não foi possível atualizar o status. Tente novamente.',
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
      setNotice({ tone: 'success', message: 'Protocolo excluído.' });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message: 'Não foi possível excluir o protocolo. Tente novamente.',
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
      active:   'Protocolo reativado.',
      paused:   'Protocolo pausado.',
      finished: 'Protocolo marcado como finalizado.',
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

    const label = protocol?.substance_name || protocol?.name || 'este item';
    if (!window.confirm(`Excluir ${label}?`)) return;

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
      title="Protocolos"
      subtitle="Rastreie compostos, doses e ciclos do seu protocolo atual em um só lugar."
      actions={
        <PrimaryButton
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Adicionar protocolo
        </PrimaryButton>
      }
      maxWidth="max-w-6xl"
    >
      {notice?.message ? (
        <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>
      ) : null}

      {isLoading ? (
        <LoadingState
          title="Carregando protocolos"
          description="Aguarde enquanto seus protocolos são carregados."
        />
      ) : null}

      {!isLoading && hasLoadError ? (
        <ErrorState
          title="Protocolos em modo seguro"
          description="Os dados não carregaram completamente, mas você ainda pode adicionar novos itens."
        />
      ) : null}

      {/* Summary tiles */}
      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Ativo"
          value={groupedProtocols.active.length}
          hint="Compostos atualmente em uso ou monitoramento."
          icon={FlaskConical}
        />
        <SummaryTile
          label="Pausado"
          value={groupedProtocols.paused.length}
          hint="Itens temporariamente suspensos mas ainda rastreados."
          icon={PauseCircle}
        />
        <SummaryTile
          label="Finalizado"
          value={groupedProtocols.finished.length}
          hint="Ciclos e protocolos concluídos mantidos no histórico."
          icon={Clock3}
        />
      </section>

      {/* Protocol list */}
      <SectionCard
        title="Itens do protocolo atual"
        subtitle="Rastreamento por status das substâncias que você usa ou monitora atualmente."
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
                  {FILTER_LABELS[option] || option} ({count})
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
            title="Nenhum item no protocolo"
            description={
              hasLoadError
                ? 'A lista não pôde ser carregada. Você ainda pode adicionar seu primeiro protocolo.'
                : 'Comece com um medicamento, hormônio, peptídeo, suplemento ou outro composto rastreado.'
            }
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Adicionar protocolo
              </PrimaryButton>
            }
          />
        ) : null}

        {/* Filter has no matches */}
        {!isLoading && hasAnyProtocols && filteredProtocols.length === 0 ? (
          <EmptyState
            title={`Nenhum protocolo ${FILTER_LABELS[filter]?.toLowerCase() || filter}`}
            description="Tente outro filtro ou adicione um novo protocolo."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Adicionar protocolo
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
            eyebrow="Protocolos"
            title={editingProtocol ? 'Editar protocolo' : 'Adicionar protocolo'}
            description="Registre os dados principais do protocolo: substância, categoria, dose, unidade, frequência, horário e status atual."
            accentClassName="from-[hsl(var(--brand)/0.18)] via-[hsl(var(--accent-secondary)/0.08)]"
          />
          {/* Visually hidden for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>
              {editingProtocol ? 'Editar protocolo' : 'Adicionar protocolo'}
            </DialogTitle>
            <DialogDescription>
              Registre os dados principais do protocolo: substância, categoria, dose, unidade, frequência, horário e status atual.
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
