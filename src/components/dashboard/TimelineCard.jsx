import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trophy, Scale, FileEdit, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Timeline Card
 * Shows recent activity like PRs, check-ins, protocol updates, and nutrition milestones
 */
export function TimelineCard({
  to,
  events = [], // Array of { type, date, title, subtitle, icon, highlight }
  loading = false,
}) {
  const getIconForType = (type, customIcon) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'pr':
        return Trophy;
      case 'checkin':
        return Scale;
      case 'protocol':
        return FileEdit;
      case 'nutrition':
        return UtensilsCrossed;
      default:
        return Clock;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'pr':
        return {
          iconBg: 'bg-[hsl(var(--ok)/0.12)]',
          iconBorder: 'border-[hsl(var(--ok)/0.3)]',
          iconColor: 'text-[hsl(var(--ok))]',
          line: 'bg-[hsl(var(--ok)/0.3)]',
        };
      case 'checkin':
        return {
          iconBg: 'bg-[hsl(var(--brand)/0.12)]',
          iconBorder: 'border-[hsl(var(--brand)/0.3)]',
          iconColor: 'text-[hsl(var(--brand))]',
          line: 'bg-[hsl(var(--brand)/0.3)]',
        };
      case 'protocol':
        return {
          iconBg: 'bg-[hsl(var(--accent-secondary)/0.12)]',
          iconBorder: 'border-[hsl(var(--accent-secondary)/0.3)]',
          iconColor: 'text-[hsl(var(--accent-secondary))]',
          line: 'bg-[hsl(var(--accent-secondary)/0.3)]',
        };
      default:
        return {
          iconBg: 'bg-[hsl(var(--fill)/0.7)]',
          iconBorder: 'border-[hsl(var(--border)/0.8)]',
          iconColor: 'text-[hsl(var(--fg-2))]',
          line: 'bg-[hsl(var(--border)/0.6)]',
        };
    }
  };

  if (loading) {
    return (
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-6 animate-pulse">
        <div className="h-4 w-24 bg-[hsl(var(--fill))] rounded mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--fill))] mt-2" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-[hsl(var(--fill))] rounded" />
                <div className="h-4 w-40 bg-[hsl(var(--fill))] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[24px] border border-[hsl(var(--border)/0.8)]',
        'bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
        'p-6'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="atlas-overline">YOUR TIMELINE</p>
        </div>
      </div>

      {/* Timeline Events */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[hsl(var(--border)/0.5)]" />

        <div className="space-y-4">
          {events.map((event, index) => {
            const Icon = getIconForType(event.type, event.icon);
            const styles = getTypeStyles(event.type);
            const isToday = index === 0;

            return (
              <Link
                key={index}
                to={event.to || to}
                className="flex gap-3 group"
              >
                {/* Timeline Dot/Icon */}
                <div className="relative z-10 flex shrink-0 items-center justify-center">
                  {isToday ? (
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2',
                        'bg-[hsl(var(--card))]',
                        styles.iconBorder,
                        styles.iconColor
                      )}
                    >
                      <div className={cn('h-2 w-2 rounded-full', styles.iconColor.replace('text-', 'bg-'))} />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border',
                        'bg-[hsl(var(--card))] border-[hsl(var(--border)/0.6)]'
                      )}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--border))]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] mb-0.5">
                    {event.dateLabel}
                  </p>
                  <p
                    className={cn(
                      'text-[14px] font-semibold truncate group-hover:text-[hsl(var(--accent-secondary))] transition-colors',
                      event.highlight ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg))]'
                    )}
                  >
                    {event.title}
                  </p>
                  {event.subtitle && (
                    <p className="text-[12px] text-[hsl(var(--fg-2))] truncate">
                      {event.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
