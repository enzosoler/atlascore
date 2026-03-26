import React, { useState } from 'react';
import { Check, Pencil, Trash2, MoreVertical, ChevronDown, ChevronUp, Clock, Calendar, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

function getStatusMeta(status) {
  if (status === 'paused') {
    return {
      label: 'Paused',
      badgeClassName: 'border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]',
    };
  }

  if (status === 'finished') {
    return {
      label: 'Finished',
      badgeClassName: 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--fill)/0.86)] text-[hsl(var(--fg-2))]',
    };
  }

  return {
    label: 'Active',
    badgeClassName: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]',
  };
}

function ActionMenu({ onPause, onResume, onFinish, onDelete, status, isAnyPending }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isAnyPending}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] shadow-lg">
            {status === 'active' && onPause && (
              <button
                onClick={() => { onPause(); setIsOpen(false); }}
                disabled={isAnyPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[hsl(var(--warn))] hover:bg-[hsl(var(--warn)/0.08)]"
              >
                <Clock className="h-4 w-4" strokeWidth={2} />
                Pause
              </button>
            )}
            
            {status === 'paused' && onResume && (
              <button
                onClick={() => { onResume(); setIsOpen(false); }}
                disabled={isAnyPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.08)]"
              >
                <Check className="h-4 w-4" strokeWidth={2} />
                Resume
              </button>
            )}
            
            {status !== 'finished' && onFinish && (
              <button
                onClick={() => { onFinish(); setIsOpen(false); }}
                disabled={isAnyPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]"
              >
                <Calendar className="h-4 w-4" strokeWidth={2} />
                Mark finished
              </button>
            )}
            
            <div className="border-t border-[hsl(var(--border)/0.5)]" />
            
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              disabled={isAnyPending}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function getAdherenceForProtocol(protocolId, logs) {
  const today = new Date().toISOString().split('T')[0];
  const weekDates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  
  let taken = 0;
  weekDates.forEach(date => {
    const hasDose = logs.some(log => 
      log.protocol_id === protocolId && 
      (log.taken_at?.startsWith(date) || log.created_at?.startsWith(date))
    );
    if (hasDose) taken++;
  });
  
  const missedToday = !logs.some(log => 
    log.protocol_id === protocolId && 
    (log.taken_at?.startsWith(today) || log.created_at?.startsWith(today))
  );
  
  return { taken, total: 7, missedToday };
}

export default function ProtocolCard({
  protocol,
  status = 'active',
  logs = [],
  busyActionKey = '',
  onEdit,
  onPause,
  onResume,
  onFinish,
  onDelete,
  onLogDose,
  isLogDosePending = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const protocolId = protocol?.id;
  const statusMeta = getStatusMeta(status);
  
  const isPausePending = Boolean(protocolId) && busyActionKey === `${protocolId}-paused`;
  const isResumePending = Boolean(protocolId) && busyActionKey === `${protocolId}-active`;
  const isFinishPending = Boolean(protocolId) && busyActionKey === `${protocolId}-finished`;
  const isDeletePending = Boolean(protocolId) && busyActionKey === `${protocolId}-delete`;
  const isAnyPending = isPausePending || isResumePending || isFinishPending || isDeletePending || isLogDosePending;
  
  const adherence = getAdherenceForProtocol(protocolId, logs);
  const adherencePercent = Math.round((adherence.taken / adherence.total) * 100);
  
  const showLogDose = status === 'active' && onLogDose;
  
  return (
    <article className={cn(
      'overflow-hidden rounded-[24px] border transition-all',
      isExpanded 
        ? 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card))]' 
        : 'border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] hover:border-[hsl(var(--border)/0.92)]'
    )}>
      {/* Collapsed view - essential info only */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))]">
            <Pill className="h-5 w-5" strokeWidth={2} />
          </div>
          
          {/* Main info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold text-[hsl(var(--fg))]">
                {protocol?.substance_name || protocol?.name || 'Protocol'}
              </h3>
              <span className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                statusMeta.badgeClassName
              )}>
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">
              {protocol?.dose}{protocol?.unit ? ` ${protocol.unit}` : ''} · {protocol?.frequency || 'As needed'}
            </p>
          </div>
          
          {/* Adherence mini-indicator */}
          {status === 'active' && (
            <div className="hidden shrink-0 sm:block">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[hsl(var(--fill)/0.72)]">
                  <div 
                    className={cn(
                      'h-full rounded-full',
                      adherencePercent >= 80 ? 'bg-[hsl(var(--ok))]' : 
                      adherencePercent >= 50 ? 'bg-[hsl(var(--warn))]' : 'bg-[hsl(var(--err))]'
                    )}
                    style={{ width: `${adherencePercent}%` }}
                  />
                </div>
                <span className="text-[12px] text-[hsl(var(--fg-3))]">{adherencePercent}%</span>
              </div>
            </div>
          )}
          
          {/* Primary action */}
          {showLogDose && (
            <button
              onClick={onLogDose}
              disabled={isLogDosePending}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all',
                adherence.missedToday
                  ? 'bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]'
                  : 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.18)]'
              )}
            >
              {isLogDosePending ? 'Logging...' : adherence.missedToday ? 'Log dose' : '✓ Done'}
            </button>
          )}
        </div>
        
        {/* Secondary row: schedule + expand + actions */}
        <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border)/0.3)] pt-3">
          <div className="flex items-center gap-4 text-[12px] text-[hsl(var(--fg-3))]">
            <span>{protocol?.schedule || 'No schedule set'}</span>
            {protocol?.start_date && (
              <span className="hidden sm:inline">Started {protocol.start_date}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Edit button */}
            <button
              onClick={onEdit}
              disabled={isAnyPending}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              Edit
            </button>
            
            {/* Expand button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-medium text-[hsl(var(--fg-3))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" strokeWidth={2} />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  More
                </>
              )}
            </button>
            
            {/* Action menu */}
            <ActionMenu 
              onPause={onPause}
              onResume={onResume}
              onFinish={onFinish}
              onDelete={onDelete}
              status={status}
              isAnyPending={isAnyPending}
            />
          </div>
        </div>
      </div>
      
      {/* Expanded view - additional details */}
      {isExpanded && (
        <div className="border-t border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.4)] px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Dates */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">Timeline</p>
              <p className="text-[13px] text-[hsl(var(--fg))]">
                <span className="text-[hsl(var(--fg-3))]">Start:</span> {protocol?.start_date || 'Not set'}
              </p>
              <p className="text-[13px] text-[hsl(var(--fg))]">
                <span className="text-[hsl(var(--fg-3))]">End:</span> {protocol?.end_date || 'Ongoing'}
              </p>
            </div>
            
            {/* Category */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">Details</p>
              <p className="text-[13px] text-[hsl(var(--fg))]">
                <span className="text-[hsl(var(--fg-3))]">Category:</span> {protocol?.category || 'Other'}
              </p>
              <p className="text-[13px] text-[hsl(var(--fg))]">
                <span className="text-[hsl(var(--fg-3))]">Frequency:</span> {protocol?.frequency || 'Not set'}
              </p>
            </div>
            
            {/* Adherence */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">This week</p>
              <p className="text-[13px] text-[hsl(var(--fg))]">
                <span className="text-[hsl(var(--fg-3))]">Taken:</span>{' '}
                <span className={adherence.taken >= 5 ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]'}>
                  {adherence.taken}/{adherence.total} days
                </span>
              </p>
              {adherence.missedToday && status === 'active' && (
                <p className="text-[13px] text-[hsl(var(--warn))]">
                  Due today — log your dose
                </p>
              )}
            </div>
          </div>
          
          {/* Notes */}
          {protocol?.notes && (
            <div className="mt-4 border-t border-[hsl(var(--border)/0.3)] pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">Notes</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
                {protocol.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
