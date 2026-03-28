import React from 'react';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';

/**
 * ProtocolTimeline — horizontal timeline showing protocol start/end dates and overlaps.
 * Active protocols shown as colored bars on a timeline.
 */
export default function ProtocolTimeline({ protocols }) {
  if (!protocols?.length) return null;

  const active = protocols.filter((p) => p.active !== false);
  if (active.length === 0) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculate timeline bounds
  const starts = active.map((p) => p.start_date || p.created_at?.split('T')[0]).filter(Boolean);
  const earliest = starts.length > 0 ? starts.sort()[0] : todayStr;
  const latestEnd = active.reduce((max, p) => {
    const end = p.end_date || todayStr;
    return end > max ? end : max;
  }, todayStr);

  const safeParse = (v) => {
    if (!v) return null;
    const d = parseISO(v);
    return isValid(d) ? d : null;
  };

  const timelineStart = safeParse(earliest);
  const timelineEnd = safeParse(latestEnd);
  if (!timelineStart || !timelineEnd) return null;

  const totalDays = Math.max(differenceInDays(timelineEnd, timelineStart), 1) + 14; // 2 week buffer

  const COLORS = [
    'hsl(var(--brand))',
    'hsl(var(--ok))',
    'hsl(var(--warn))',
    'hsl(var(--brand-ai))',
  ];

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
        Protocol Timeline
      </p>

      <div className="space-y-2">
        {active.slice(0, 5).map((protocol, idx) => {
          const start = safeParse(protocol.start_date || protocol.created_at?.split('T')[0]);
          const end = safeParse(protocol.end_date) || today;
          if (!start) return null;

          const startOffset = Math.max(0, differenceInDays(start, timelineStart));
          const duration = Math.max(1, differenceInDays(end, start));
          const leftPct = (startOffset / totalDays) * 100;
          const widthPct = Math.min((duration / totalDays) * 100, 100 - leftPct);
          const color = COLORS[idx % COLORS.length];

          const label = protocol.compound || protocol.name || 'Protocol';
          const daysActive = differenceInDays(today, start);

          return (
            <div key={protocol.id}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[12px] font-semibold text-[hsl(var(--fg))] truncate">{label}</p>
                <span className="text-[10px] text-[hsl(var(--fg-3))] shrink-0 ml-2">
                  {daysActive >= 0 ? `${daysActive}d active` : 'starts soon'}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-[hsl(var(--fill)/0.5)]">
                <div
                  className="absolute top-0 h-full rounded-full transition-all"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: color,
                    opacity: 0.75,
                  }}
                />
                {/* Today marker */}
                {(() => {
                  const todayOffset = differenceInDays(today, timelineStart);
                  const todayPct = (todayOffset / totalDays) * 100;
                  if (todayPct < 0 || todayPct > 100) return null;
                  return (
                    <div
                      className="absolute top-0 w-0.5 h-full bg-[hsl(var(--fg))]"
                      style={{ left: `${todayPct}%` }}
                    />
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[hsl(var(--fg))]" />
          <span className="text-[10px] text-[hsl(var(--fg-3))]">Today</span>
        </div>
        <span className="text-[10px] text-[hsl(var(--fg-3))]">
          {format(timelineStart, 'MMM d')} — {format(timelineEnd, 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
}
