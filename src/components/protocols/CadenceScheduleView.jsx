import React from 'react';
import { Check, Minus } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * CadenceScheduleView — visual weekly dose schedule grid.
 *
 * Shows which days each protocol's doses are due this week.
 * Green dots = logged today, grey = pending, no dot = not scheduled.
 */
export default function CadenceScheduleView({ protocols, logs }) {
  if (!protocols?.length) return null;

  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun
  const todayStr = today.toISOString().split('T')[0];

  // Build a map of logged dose dates per protocol
  const loggedByProtocol = {};
  for (const log of (logs || [])) {
    if (!loggedByProtocol[log.protocol_id]) loggedByProtocol[log.protocol_id] = new Set();
    loggedByProtocol[log.protocol_id].add(log.date || log.logged_at?.split('T')[0]);
  }

  // Get the dates for this week (Mon–Sun)
  const weekDates = [];
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((todayDow + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  // Determine schedule days for each protocol
  function getScheduledDays(protocol) {
    const freq = protocol.frequency_per_week || protocol.frequency || 7;
    if (freq >= 7) return [0, 1, 2, 3, 4, 5, 6]; // daily
    // Spread evenly across the week
    const step = 7 / freq;
    const days = [];
    for (let i = 0; i < freq; i++) days.push(Math.round(i * step) % 7);
    return days;
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
        Weekly Schedule
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-[1fr_repeat(7,2rem)] gap-1.5 items-center">
        <div />
        {DAYS.map((day, i) => (
          <p key={day} className={`text-center text-[10px] font-semibold ${
            weekDates[i] === todayStr ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'
          }`}>{day}</p>
        ))}

        {/* Protocol rows */}
        {protocols.filter((p) => !p.end_date && p.active !== false).slice(0, 6).map((protocol) => {
          const scheduledDays = getScheduledDays(protocol);
          const protocolLogs = loggedByProtocol[protocol.id] || new Set();

          return (
            <React.Fragment key={protocol.id}>
              <p className="text-[11px] font-medium text-[hsl(var(--fg))] truncate pr-2">
                {protocol.compound || protocol.name}
              </p>
              {weekDates.map((dateStr, dayIdx) => {
                const isScheduled = scheduledDays.includes(dayIdx);
                const isLogged = protocolLogs.has(dateStr);
                const isPast = dateStr < todayStr;
                const isToday = dateStr === todayStr;

                if (!isScheduled) {
                  return <div key={dateStr} className="flex justify-center"><Minus className="w-3 h-3 text-[hsl(var(--fill))]" /></div>;
                }

                if (isLogged) {
                  return (
                    <div key={dateStr} className="flex justify-center">
                      <div className="w-5 h-5 rounded-full bg-[hsl(var(--ok)/0.15)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[hsl(var(--ok))]" strokeWidth={2.5} />
                      </div>
                    </div>
                  );
                }

                if (isPast) {
                  return (
                    <div key={dateStr} className="flex justify-center">
                      <div className="w-5 h-5 rounded-full bg-[hsl(var(--err)/0.12)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--err))]" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={dateStr} className="flex justify-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-[hsl(var(--brand)/0.15)] ring-1 ring-[hsl(var(--brand)/0.3)]' : 'bg-[hsl(var(--fill)/0.6)]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--fg-3))]'}`} />
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
