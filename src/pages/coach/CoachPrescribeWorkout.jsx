import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, FlaskConical, PauseCircle, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProtocolCard from '@/components/protocols/ProtocolCard';
import ProtocolForm from '@/components/protocols/ProtocolForm';
import {
  EmptyState,
  ErrorState,
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

const PROTOCOLS_QUERY_KEY = ['protocols-stable'];
const FILTERS = ['all', 'active', 'paused', 'finished'];

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

function ProtocolsContent() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('active');
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState('');

  const protocolsQuery = useQuery({
    queryKey: PROTOCOLS_QUERY_KEY,
    queryFn: () => base44.entities.Protocol.list('-start_date', 100),
    retry: 1,
  });

  const saveProtocol = useMutation({
    mutationFn: ({ protocolId, payload }) =>
      protocolId
        ? base44.entities.Protocol.update(protocolId, payload)
        : base44.entities.Protocol.create(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setIsFormOpen(false);
      setEditingProtocol(null);
      setNotice({
        tone: 'success',
        message: variables.protocolId
          ? 'Protocolo atualizado.'
          : 'Protocolo adicionado.',
      });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message:
          'Não foi possível salvar o protocolo. Tente novamente.',
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.Protocol.update(id, payload),
    onMutate: ({ actionKey }) => {
      setPendingActionKey(actionKey);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({
        tone: 'success',
        message: variables.successMessage,
      });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message:
          'Não foi possível atualizar o status. Tente novamente.',
      });
    },
    onSettled: () => {
      setPendingActionKey('');
    },
  });

  const deleteProtocol = useMutation({
    mutationFn: ({ id }) => base44.entities.Protocol.delete(id),
    onMutate: ({ actionKey }) => {
      setPendingActionKey(actionKey);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({
        tone: 'success',
        message: 'Protocolo excluído.',
      });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message:
          'Não foi possível excluir o protocolo. Tente novamente.',
      });
    },
    onSettled: () => {
      setPendingActionKey('');
    },
  });

  const protocols = toArray(protocolsQuery.data);
  const isLoading = protocolsQuery.isPending;
  const hasLoadError = protocolsQuery.isError;

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

    const payloads = {
      active: {
        active: true,
        end_date: '',
      },
      paused: {
        active: false,
        end_date: '',
      },
      finished: {
        active: false,
        end_date: protocol?.end_date || getToday(),
      },
    };

    const successMessages = {
      active: 'Protocolo reativado.',
      paused: 'Protocolo pausado.',
      finished: 'Protocolo marcado como finalizado.',
    };

    statusMutation.mutate({
      id: protocol.id,
      payload: payloads[nextStatus],
      actionKey: `${protocol.id}-${nextStatus}`,
      successMessage: successMessages[nextStatus],
    });
  };

  const handleDelete = (protocol) => {
    if (!protocol?.id) return;

    const protocolLabel = protocol?.substance_name || protocol?.name || 'este protocolo';
    const confirmed = window.confirm(`Excluir ${protocolLabel}?`);

    if (!confirmed) return;

    deleteProtocol.mutate({
      id: protocol.id,
      actionKey: `${protocol.id}-delete`,
    });
  };

  return (
    <PageShell
      title="Protocolos"
      subtitle="A focused V1 workspace for current compounds, simple scheduling, status control, and visible adherence context without breaking the stable app shell."
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
      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      {isLoading ? (
        <LoadingState
          title="Carregando protocolos"
          description="The page is already open in safe mode while your current protocol items load."
        />
      ) : null}

      {!isLoading && hasLoadError ? (
        <ErrorState
          title="Protocolos em modo seguro"
          description="Existing protocol data did not fully load, but you can still open the page and create new items."
        />
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Ativo"
          value={groupedProtocols.active.length}
          hint="Current compounds still in rotation right now."
          icon={FlaskConical}
        />
        <SummaryTile
          label="Pausado"
          value={groupedProtocols.paused.length}
          hint="Items temporarily stopped but still being tracked."
          icon={PauseCircle}
        />
        <SummaryTile
          label="Finalizado"
          value={groupedProtocols.finished.length}
          hint="Completed cycles and protocols kept in history."
          icon={Clock3}
        />
      </section>

      <SectionCard
        title="Itens do protocolo atual"
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
                  {({'all': 'Todos', 'active': 'Ativo', 'paused': 'Pausado', 'finished': 'Finalizado'}[option] || option)} ({count})
                </button>
              );
            })}
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="animate-pulse rounded-[28px] border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="h-5 w-40 rounded-full bg-zinc-200" />
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((block) => (
                    <div key={block} className="h-20 rounded-2xl bg-white" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !hasAnyProtocols ? (
          <EmptyState
            title="Nenhum item no protocolo"
            description={
              hasLoadError
                ? 'A lista não pôde ser carregada. Você ainda pode adicionar novos protocolos.'
                : 'Comece com um medicamento, hormônio, peptídeo, suplemento ou outro composto rastreado.'
            }
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Adicionar protocolo
              </PrimaryButton>
            }
          />
        ) : null}

        {!isLoading && hasAnyProtocols && filteredProtocols.length === 0 ? (
          <EmptyState
            title={`No ${filter} protocol items`}
            description="Try another status filter or add a new protocol item."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Adicionar protocolo
              </PrimaryButton>
            }
          />
        ) : null}

        {!isLoading && filteredProtocols.length > 0 ? (
          <div className="space-y-4">
            {filteredProtocols.map((protocol) => {
              const status = getProtocolStatus(protocol);

              return (
                <ProtocolCard
                  key={protocol?.id || `${protocol?.name}-${protocol?.start_date || 'date'}`}
                  protocol={protocol}
                  status={status}
                  busyActionKey={pendingActionKey}
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

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (saveProtocol.isPending) return;
          setIsFormOpen(open);
          if (!open) setEditingProtocol(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] border-zinc-200 bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:max-w-3xl">
          <DialogHeader className="border-b border-zinc-200 px-6 pb-5 pt-6 text-left">
            <DialogTitle className="text-[28px] font-semibold tracking-[-0.04em] text-zinc-950">
              {editingProtocol ? 'Editar protocolo' : 'Adicionar protocolo'}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Capture the core details that make this protocol useful right away: substance,
              category, dose, frequency, schedule, notes, and current status handling.
            </DialogDescription>
          </DialogHeader>

          <ProtocolForm
            protocol={editingProtocol}
            isSubmitting={saveProtocol.isPending}
            onCancel={() => {
              if (saveProtocol.isPending) return;
              setIsFormOpen(false);
              setEditingProtocol(null);
            }}
            onSubmit={(payload) =>
              saveProtocol.mutate({
                protocolId: editingProtocol?.id,
                payload,
              })
            }
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}