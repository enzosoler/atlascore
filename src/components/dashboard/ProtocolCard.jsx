import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Today's Protocol Card
 * Shows supplement protocol with checkmarks and adherence percentage
 */
export function TodayProtocolCard({
  to,
  protocols = [], // Array of { name, dose, unit, time, checked, icon }
  adherence = 0, // 0-100 percentage
  tone = 'teal',
  loading = false,
}) {
  const toneStyles = {
    teal: {
      border: 'border-[hsl(var(--accent-secondary)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--accent-secondary))]',
      accentBg: 'bg-[hsl(var(--accent-secondary))]',
      accentBorder: 'border-[hsl(var(--accent-secondary)/0.3)]',
      tagBorder: 'border-[hsl(var(--accent-secondary)/0.2)]',
      tagBg: 'bg-[hsl(var(--accent-secondary)/0.08)]',
    },
    orange: {
      border: 'border-[hsl(var(--warn)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--warn))]',
      accentBg: 'bg-[hsl(var(--warn))]',
      accentBorder: 'border-[hsl(var(--warn)/0.3)]',
      tagBorder: 'border-[hsl(var(--warn)/0.2)]',
      tagBg: 'bg-[hsl(var(--warn)/0.08)]',
    },
    blue: {
      border: 'border-[hsl(var(--brand)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--brand))]',
      accentBg: 'bg-[hsl(var(--brand))]',
      accentBorder: 'border-[hsl(var(--brand)/0.3)]',
      tagBorder: 'border-[hsl(var(--brand)/0.2)]',
      tagBg: 'bg-[hsl(var(--brand)/0.08)]',
    },
  };

  const styles = toneStyles[tone] || toneStyles.teal;

  if (loading) {
    return (
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-6 animate-pulse">
        <div className="h-4 w-24 bg-[hsl(var(--fill))] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[hsl(var(--fill))] rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        'block rounded-[24px] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        styles.border,
        styles.bg
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="atlas-overline">TODAY&apos;S PROTOCOL</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border',
            'border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))]'
          )}
        >
          <Pill className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      {/* Protocol List */}
      <div className="space-y-2 mb-5">
        {protocols.map((protocol, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-colors',
              protocol.checked
                ? cn('border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.06)]')
                : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.5)]'
            )}
          >
            {/* Icon */}
            {protocol.icon && (
              <span className="text-[18px]">{protocol.icon}</span>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-[14px] font-semibold truncate',
                  protocol.checked ? 'text-[hsl(var(--fg-3))]' : 'text-[hsl(var(--fg))]'
                )}
              >
                {protocol.name}
              </p>
              <p className="text-[12px] text-[hsl(var(--fg-2))]">
                {protocol.dose} {protocol.unit} · {protocol.time}
              </p>
            </div>

            {/* Checkbox */}
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                protocol.checked
                  ? 'border-[hsl(var(--accent-secondary))] bg-[hsl(var(--accent-secondary))]'
                  : cn('border-[hsl(var(--border))] bg-transparent')
              )}
            >
              {protocol.checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </div>
          </div>
        ))}
      </div>

      {/* Adherence Footer */}
      <div className="rounded-[16px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.4)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[hsl(var(--fg-3))]">7-day adherence</span>
        </div>
        <p className="text-[20px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] mt-1">
          <span className={styles.accent}>{adherence}%</span>
          <span className="text-[12px] font-medium text-[hsl(var(--fg-3))] ml-2">consistency</span>
        </p>
      </div>
    </Link>
  );
}
