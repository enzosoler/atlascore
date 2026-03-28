import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, FlaskConical, PauseCircle, Plus } from 'lucide-react';
import { useT } from '@/lib/i18nContext';
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
    <article className="rounded-[28px] border border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] px-5 py-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="atlas-overline">
            {label}
          </p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">{hint}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.92)_0%,hsl(var(--card))_100%)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Protocols() {
  const t = useT();
  return (
    <SafePageBoundary
      title={t('coach.prescribeWorkout.pageTitle')}
      subtitle={t('coach.prescribeWorkout.pageSubtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription={t('coach.prescribeWorkout.fallbackDescription')}
    >
      <ProtocolsContent />
    </SafePageBoundary>
  );
}

function ProtocolsContent() {
  const t = useT();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('active');
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState('');

  const protocolsQuery = useQuery({
    queryKey: PROTOCOLS_QUERY_KEY,
    queryFn: async () => [],
    retry: 1,
  });

  const saveProtocol = useMutation({
    mutationFn: async ({ protocolId, payload }) => ({}),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setIsFormOpen(false);
      setEditingProtocol(null);
      setNotice({
        tone: 'success',
        message: variables.protocolId
          ? t('coach.prescribeWorkout.protocolUpdated')
          : t('coach.prescribeWorkout.protocolAdded'),
      });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message: t('coach.prescribeWorkout.couldNotSave'),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, payload }) => ({}),
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
        message: t('coach.prescribeWorkout.couldNotUpdateStatus'),
      });
    },
    onSettled: () => {
      setPendingActionKey('');
    },
  });

  const deleteProtocol = useMutation({
    mutationFn: async ({ id }) => ({}),
    onMutate: ({ actionKey }) => {
      setPendingActionKey(actionKey);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
      setNotice({
        tone: 'success',
        message: t('coach.prescribeWorkout.protocolDeleted'),
      });
    },
    onError: () => {
      setNotice({
        tone: 'warning',
        message: t('coach.prescribeWorkout.couldNotDelete'),
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
      active: t('coach.prescribeWorkout.protocolReactivated'),
      paused: t('coach.prescribeWorkout.protocolPaused'),
      finished: t('coach.prescribeWorkout.protocolFinished'),
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

    const protocolLabel = protocol?.substance_name || protocol?.name || 'this protocol';
    const confirmed = window.confirm(`Delete ${protocolLabel}?`);

    if (!confirmed) return;

    deleteProtocol.mutate({
      id: protocol.id,
      actionKey: `${protocol.id}-delete`,
    });
  };

  return (
    <PageShell
      title={t('coach.prescribeWorkout.contentTitle')}
      subtitle={t('coach.prescribeWorkout.contentSubtitle')}
      actions={
        <PrimaryButton
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {t('coach.prescribeWorkout.addProtocol')}
        </PrimaryButton>
      }
      maxWidth="max-w-6xl"
    >
      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      {isLoading ? (
        <LoadingState
          title={t('coach.prescribeWorkout.loadingTitle')}
          description={t('coach.prescribeWorkout.loadingDescription')}
        />
      ) : null}

      {!isLoading && hasLoadError ? (
        <ErrorState
          title={t('coach.prescribeWorkout.errorTitle')}
          description={t('coach.prescribeWorkout.errorDescription')}
        />
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label={t('coach.prescribeWorkout.tileActive')}
          value={groupedProtocols.active.length}
          hint={t('coach.prescribeWorkout.tileActiveHint')}
          icon={FlaskConical}
        />
        <SummaryTile
          label={t('coach.prescribeWorkout.tilePaused')}
          value={groupedProtocols.paused.length}
          hint={t('coach.prescribeWorkout.tilePausedHint')}
          icon={PauseCircle}
        />
        <SummaryTile
          label={t('coach.prescribeWorkout.tileFinished')}
          value={groupedProtocols.finished.length}
          hint={t('coach.prescribeWorkout.tileFinishedHint')}
          icon={Clock3}
        />
      </section>

      <SectionCard
        title={t('coach.prescribeWorkout.sectionTitle')}
        subtitle={t('coach.prescribeWorkout.sectionSubtitle')}
        actions={
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => {
              const count =
                option === 'all'
                  ? groupedProtocols.all.length
                  : groupedProtocols[option]?.length || 0;

              const filterLabels = {
                all: t('coach.prescribeWorkout.filterAll'),
                active: t('coach.prescribeWorkout.filterActive'),
                paused: t('coach.prescribeWorkout.filterPaused'),
                finished: t('coach.prescribeWorkout.filterFinished'),
              };

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    filter === option
                      ? 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                      : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] text-[hsl(var(--fg-2))] hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--fill)/0.78)] hover:text-[hsl(var(--fg))]'
                  }`}
                >
                  {(filterLabels[option] || option)} ({count})
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
                className="animate-pulse rounded-[28px] border border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.56)_0%,hsl(var(--card))_100%)] p-5"
              >
                <div className="h-5 w-40 rounded-full bg-[hsl(var(--fill)/0.92)]" />
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((block) => (
                    <div key={block} className="h-20 rounded-2xl bg-[hsl(var(--fill)/0.72)]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !hasAnyProtocols ? (
          <EmptyState
            title={t('coach.prescribeWorkout.emptyTitle')}
            description={
              hasLoadError
                ? t('coach.prescribeWorkout.emptyLoadError')
                : t('coach.prescribeWorkout.emptyDescription')
            }
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                {t('coach.prescribeWorkout.addProtocol')}
              </PrimaryButton>
            }
          />
        ) : null}

        {!isLoading && hasAnyProtocols && filteredProtocols.length === 0 ? (
          <EmptyState
            title={t('coach.prescribeWorkout.emptyFilterTitle')}
            description={t('coach.prescribeWorkout.emptyFilterDescription')}
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                {t('coach.prescribeWorkout.addProtocol')}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-0 shadow-[var(--shadow-lg)] sm:max-w-3xl">
          <DialogHeader className="border-b border-[hsl(var(--border)/0.82)] px-6 pb-5 pt-6 text-left">
            <DialogTitle className="text-[28px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {editingProtocol ? t('coach.prescribeWorkout.dialogEditTitle') : t('coach.prescribeWorkout.dialogAddTitle')}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--fg-2))]">
              {t('coach.prescribeWorkout.dialogDescription')}
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
