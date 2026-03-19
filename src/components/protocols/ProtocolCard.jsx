import React from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getStatusMeta(status) {
  if (status === 'paused') {
    return {
      label: 'Pausado',
      badgeClassName: 'border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]',
      iconClassName: 'border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
    };
  }

  if (status === 'finished') {
    return {
      label: 'Finalizado',
      badgeClassName: 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--fill)/0.86)] text-[hsl(var(--fg-2))]',
      iconClassName: 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--fill)/0.78)] text-[hsl(var(--fg-2))]',
    };
  }

  return {
    label: 'Ativo',
    badgeClassName: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]',
    iconClassName: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
  };
}

function ActionButton({
  children,
  className,
  disabled = false,
  onClick,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-[18px] border px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {children}
    </button>
  );
}

function DetailTile({ label, value }) {
  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.76)_0%,hsl(var(--card))_100%)] px-4 py-3">
      <p className="atlas-overline">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[hsl(var(--fg))]">
        {value || '--'}
      </p>
    </div>
  );
}

export default function ProtocolCard({
  protocol,
  status = 'active',
  busyActionKey = '',
  onEdit,
  onPause,
  onResume,
  onFinish,
  onDelete,
  onLogDose,
  isLogDosePending = false,
}) {
  const protocolId = protocol?.id;
  const statusMeta = getStatusMeta(status);
  const isPausePending = Boolean(protocolId) && busyActionKey === `${protocolId}-paused`;
  const isResumePending = Boolean(protocolId) && busyActionKey === `${protocolId}-active`;
  const isFinishPending = Boolean(protocolId) && busyActionKey === `${protocolId}-finished`;
  const isDeletePending = Boolean(protocolId) && busyActionKey === `${protocolId}-delete`;
  const isAnyPending = isPausePending || isResumePending || isFinishPending || isDeletePending;

  return (
    <article className="atlas-card overflow-hidden rounded-[28px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                {protocol?.substance_name || protocol?.name || 'Protocolo'}
              </h3>
              <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', statusMeta.badgeClassName)}>
                {statusMeta.label}
              </span>
              {protocol?.category ? (
                <span className="rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.84)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">
                  {protocol.category}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
              {protocol?.dose || 'Dose não definida'} · {protocol?.frequency || 'Frequência não definida'}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <DetailTile label="Início" value={protocol?.start_date} />
            <DetailTile label="Fim" value={protocol?.end_date} />
            <DetailTile label="Rotina" value={protocol?.schedule || protocol?.name} />
          </div>

          {protocol?.notes ? (
            <div className="rounded-[22px] border border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.76)_0%,hsl(var(--card))_100%)] px-4 py-4">
              <p className="atlas-overline">Notas</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">{protocol.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end">
          {onLogDose && status === 'active' ? (
            <ActionButton
              onClick={onLogDose}
              disabled={isLogDosePending || isAnyPending}
              className="border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.18)]"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              {isLogDosePending ? 'Registrando…' : 'Registrar dose'}
            </ActionButton>
          ) : null}

          <ActionButton
            onClick={onEdit}
            disabled={isAnyPending}
            className="border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill)/0.72)]"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Editar
          </ActionButton>

          {onPause ? (
            <ActionButton
              onClick={onPause}
              disabled={isPausePending}
              className="border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))] hover:bg-[hsl(var(--warn)/0.2)]"
            >
              Pausar
            </ActionButton>
          ) : null}

          {onResume ? (
            <ActionButton
              onClick={onResume}
              disabled={isResumePending}
              className="border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.2)]"
            >
              Retomar
            </ActionButton>
          ) : null}

          {onFinish ? (
            <ActionButton
              onClick={onFinish}
              disabled={isFinishPending}
              className="border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.84)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))]"
            >
              Finalizar
            </ActionButton>
          ) : null}

          <ActionButton
            onClick={onDelete}
            disabled={isDeletePending}
            className="border-[hsl(var(--err)/0.22)] bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.18)]"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Excluir
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
