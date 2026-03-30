import React from 'react';
import { Check, Clock, AlertCircle, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';

function isDueToday(protocol, logs = []) {
  const today = (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();
  const frequency = protocol.frequency?.toLowerCase() || '';

  if (frequency.includes('daily') || frequency.includes('day')) return true;

  const todayLogs = logs.filter(log =>
    log.taken_at?.startsWith(today) || log.created_at?.startsWith(today)
  );
  if (todayLogs.length > 0) return false;

  const lastLog = logs[0];
  if (!lastLog) return true;

  const lastDoseDate = new Date(lastLog.taken_at || lastLog.created_at);
  const daysSince = Math.floor((new Date() - lastDoseDate) / (1000 * 60 * 60 * 24));

  if (frequency.includes('eod') || frequency.includes('every other')) {
    return daysSince >= 2;
  }

  return todayLogs.length === 0;
}

function wasTakenToday(protocol, logs = []) {
  const today = (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();
  return logs.some(log =>
    log.protocol_id === protocol.id &&
    (log.taken_at?.startsWith(today) || log.created_at?.startsWith(today))
  );
}

function TodayDoseItem({ protocol, status = 'due', onLogDose, isPending, t }) {
  const isTaken = status === 'taken';

  const statusConfig = {
    due: {
      icon: Clock,
      iconClass: 'text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] border-[hsl(var(--brand)/0.18)]',
      badgeClass: 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.18)]',
      badgeText: t('protocols.protocols.dose.dueToday'),
      buttonClass: 'bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]',
    },
    taken: {
      icon: Check,
      iconClass: 'text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.12)] border-[hsl(var(--ok)/0.18)]',
      badgeClass: 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] border-[hsl(var(--ok)/0.18)]',
      badgeText: t('protocols.protocols.dose.taken'),
      buttonClass: 'bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] cursor-default',
    },
    overdue: {
      icon: AlertCircle,
      iconClass: 'text-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.12)] border-[hsl(var(--warn)/0.2)]',
      badgeClass: 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] border-[hsl(var(--warn)/0.2)]',
      badgeText: t('protocols.protocols.dose.missedYesterday'),
      buttonClass: 'bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]',
    },
  };

  const config = statusConfig[status] || statusConfig.due;
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-4 rounded-[20px] border p-4 transition-all',
      isTaken
        ? 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.04)]'
        : 'border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))]'
    )}>
      <div className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
        config.iconClass
      )}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[15px] font-semibold text-[hsl(var(--fg))]">
            {protocol.substance_name || protocol.name}
          </h4>
          <span className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
            config.badgeClass
          )}>
            {config.badgeText}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">
          {protocol.dose}{protocol.unit ? ` ${protocol.unit}` : ''}
          {protocol.schedule ? ` · ${protocol.schedule}` : ''}
        </p>
      </div>

      {isTaken ? (
        <div className="shrink-0 rounded-full bg-[hsl(var(--ok)/0.12)] px-3 py-1.5 text-[13px] font-medium text-[hsl(var(--ok))]">
          ✓ {t('protocols.protocols.dose.done')}
        </div>
      ) : (
        <button
          onClick={onLogDose}
          disabled={isPending}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all',
            config.buttonClass
          )}
        >
          {isPending ? t('protocols.protocols.dose.logging') : t('protocols.protocols.dose.logDose')}
        </button>
      )}
    </div>
  );
}

export default function TodayDoseSection({
  protocols = [],
  logs = [],
  onLogDose,
  isPending,
  loggingProtocolId
}) {
  const { t } = useI18n();

  const activeProtocols = protocols.filter(p =>
    p.active !== false && !p.end_date
  );

  const dueToday = [];
  const takenToday = [];
  const overdue = [];

  activeProtocols.forEach(protocol => {
    const taken = wasTakenToday(protocol, logs);
    const due = isDueToday(protocol, logs);

    if (taken) {
      takenToday.push(protocol);
    } else if (!due && logs.length > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const missedYesterday = !logs.some(log =>
        log.protocol_id === protocol.id &&
        (log.taken_at?.startsWith(yesterdayStr) || log.created_at?.startsWith(yesterdayStr))
      );

      if (missedYesterday) {
        overdue.push(protocol);
      } else {
        dueToday.push(protocol);
      }
    } else {
      dueToday.push(protocol);
    }
  });

  const totalDoses = dueToday.length + takenToday.length + overdue.length;
  const completionRate = totalDoses > 0
    ? Math.round((takenToday.length / totalDoses) * 100)
    : 0;

  if (totalDoses === 0) {
    return (
      <div className="atlas-card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
          <Pill className="h-5 w-5" strokeWidth={2} />
        </div>
        <h3 className="mt-3 text-[15px] font-semibold text-[hsl(var(--fg))]">
          {t('protocols.protocols.dose.nothingScheduled')}
        </h3>
        <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
          {t('protocols.protocols.dose.nothingScheduledDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-2))]">
          {t('protocols.protocols.dose.ofCompleted', { taken: takenToday.length, total: totalDoses })}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[hsl(var(--fill)/0.72)]">
            <div
              className="h-full rounded-full bg-[hsl(var(--brand))] transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-[13px] font-medium text-[hsl(var(--fg))]">{completionRate}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {overdue.map(protocol => (
          <TodayDoseItem
            key={protocol.id}
            protocol={protocol}
            status="overdue"
            onLogDose={() => onLogDose?.(protocol)}
            isPending={isPending && loggingProtocolId === protocol.id}
            t={t}
          />
        ))}

        {dueToday.map(protocol => (
          <TodayDoseItem
            key={protocol.id}
            protocol={protocol}
            status="due"
            onLogDose={() => onLogDose?.(protocol)}
            isPending={isPending && loggingProtocolId === protocol.id}
            t={t}
          />
        ))}

        {takenToday.length > 0 && (
          <>
            <div className="border-t border-[hsl(var(--border)/0.5)] pt-3">
              <p className="atlas-overline">
                {t('protocols.protocols.dose.alreadyTakenToday')}
              </p>
            </div>
            {takenToday.slice(0, 2).map(protocol => (
              <TodayDoseItem
                key={protocol.id}
                protocol={protocol}
                status="taken"
                t={t}
              />
            ))}
            {takenToday.length > 2 && (
              <p className="text-center text-[13px] text-[hsl(var(--fg-3))]">
                {t('protocols.protocols.dose.more', { n: takenToday.length - 2 })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
