import React from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';

function getStatusLabel(status) {
  if (status === 'paused') return 'Pausado';
  if (status === 'finished') return 'Finalizado';
  return 'Ativo';
}

function getStatusClassName(status) {
  if (status === 'paused') return 'bg-amber-100 text-amber-700';
  if (status === 'finished') return 'bg-zinc-200 text-zinc-700';
  return 'bg-emerald-100 text-emerald-700';
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
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
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
  const isPausePending = Boolean(protocolId) && busyActionKey === `${protocolId}-paused`;
  const isResumePending = Boolean(protocolId) && busyActionKey === `${protocolId}-active`;
  const isFinishPending = Boolean(protocolId) && busyActionKey === `${protocolId}-finished`;
  const isDeletePending = Boolean(protocolId) && busyActionKey === `${protocolId}-delete`;
  const isAnyPending = isPausePending || isResumePending || isFinishPending || isDeletePending;

  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-950">
                {protocol?.substance_name || protocol?.name || 'Protocolo'}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClassName(status)}`}
              >
                {getStatusLabel(status)}
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
          {onLogDose && status === 'active' ? (
            <ActionButton
              onClick={onLogDose}
              disabled={isLogDosePending || isAnyPending}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              {isLogDosePending ? 'Registrando…' : 'Log dose'}
            </ActionButton>
          ) : null}

          <ActionButton
            onClick={onEdit}
            disabled={isAnyPending}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Editar
          </ActionButton>

          {onPause ? (
            <ActionButton
              onClick={onPause}
              disabled={isPausePending}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
            >
              Pausar
            </ActionButton>
          ) : null}

          {onResume ? (
            <ActionButton
              onClick={onResume}
              disabled={isResumePending}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              Retomar
            </ActionButton>
          ) : null}

          {onFinish ? (
            <ActionButton
              onClick={onFinish}
              disabled={isFinishPending}
              className="rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200"
            >
              Finalizar
            </ActionButton>
          ) : null}

          <ActionButton
            onClick={onDelete}
            disabled={isDeletePending}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Excluir
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
