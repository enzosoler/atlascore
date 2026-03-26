import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Calendar } from 'lucide-react';

function getWeekDates() {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

function calculateAdherence(logs = [], protocols = []) {
  const weekDates = getWeekDates();
  const activeProtocols = protocols.filter(p => p.active !== false && !p.end_date);
  
  if (activeProtocols.length === 0) {
    return { 
      weeklyRate: 0, 
      streak: 0, 
      takenThisWeek: 0, 
      missedThisWeek: 0,
      dailyBreakdown: weekDates.map(() => ({ taken: 0, total: 0 }))
    };
  }
  
  // Group logs by date
  const logsByDate = {};
  weekDates.forEach(date => {
    logsByDate[date] = logs.filter(log => 
      log.taken_at?.startsWith(date) || log.created_at?.startsWith(date)
    );
  });
  
  // Calculate daily adherence
  let takenThisWeek = 0;
  let missedThisWeek = 0;
  const dailyBreakdown = [];
  
  weekDates.forEach(date => {
    const dayLogs = logsByDate[date] || [];
    // Count unique protocols dosed
    const dosedProtocols = new Set(dayLogs.map(log => log.protocol_id)).size;
    const totalDue = activeProtocols.length;
    
    takenThisWeek += dosedProtocols;
    missedThisWeek += Math.max(0, totalDue - dosedProtocols);
    
    dailyBreakdown.push({
      date,
      taken: dosedProtocols,
      total: totalDue,
      isToday: date === new Date().toISOString().split('T')[0]
    });
  });
  
  const totalDoses = takenThisWeek + missedThisWeek;
  const weeklyRate = totalDoses > 0 ? Math.round((takenThisWeek / totalDoses) * 100) : 0;
  
  // Calculate current streak
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = weekDates.length - 1; i >= 0; i--) {
    const date = weekDates[i];
    const dayLogs = logsByDate[date] || [];
    const dosedProtocols = new Set(dayLogs.map(log => log.protocol_id)).size;
    
    if (dosedProtocols > 0 || date === today) {
      if (dosedProtocols > 0) streak++;
    } else {
      break;
    }
  }
  
  return { weeklyRate, streak, takenThisWeek, missedThisWeek, dailyBreakdown };
}

function getTrend(currentRate, previousRate) {
  if (currentRate > previousRate) return 'up';
  if (currentRate < previousRate) return 'down';
  return 'same';
}

function DayDot({ day, isActive }) {
  const date = new Date(day.date);
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'narrow' });
  const isToday = day.isToday;
  
  let status = 'empty';
  if (day.total > 0) {
    if (day.taken >= day.total) status = 'complete';
    else if (day.taken > 0) status = 'partial';
    else status = 'missed';
  }
  
  const statusClasses = {
    empty: 'bg-[hsl(var(--fill)/0.5)] border-[hsl(var(--border)/0.5)]',
    complete: 'bg-[hsl(var(--ok)/0.18)] border-[hsl(var(--ok)/0.3)]',
    partial: 'bg-[hsl(var(--warn)/0.12)] border-[hsl(var(--warn)/0.2)]',
    missed: 'bg-[hsl(var(--err)/0.08)] border-[hsl(var(--err)/0.15)]',
  };
  
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div 
        className={`h-8 w-8 rounded-full border-2 ${statusClasses[status]} flex items-center justify-center transition-all ${
          isToday ? 'ring-2 ring-[hsl(var(--brand)/0.3)]' : ''
        }`}
      >
        {status === 'complete' && <span className="text-[hsl(var(--ok))] text-xs">✓</span>}
        {status === 'partial' && <span className="text-[hsl(var(--warn))] text-xs">•</span>}
      </div>
      <span className={`text-[11px] font-medium ${isToday ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'}`}>
        {dayLabel}
      </span>
    </div>
  );
}

export default function AdherenceWidget({ protocols = [], logs = [] }) {
  const { weeklyRate, streak, takenThisWeek, missedThisWeek, dailyBreakdown } = calculateAdherence(logs, protocols);
  
  const trend = getTrend(weeklyRate, 70); // Compare to baseline 70%
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-[hsl(var(--ok))]' : trend === 'down' ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--fg-2))]';
  
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-2))]">
              This week
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[32px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {weeklyRate}%
            </span>
            <span className="text-[13px] text-[hsl(var(--fg-2))]">
              adherence
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`flex items-center justify-end gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" strokeWidth={2} />
            <span className="text-[13px] font-medium">
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Steady'}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
            {streak} day{streak !== 1 ? 's' : ''} streak
          </p>
        </div>
      </div>
      
      {/* Daily dots */}
      <div className="mt-4 flex justify-between">
        {dailyBreakdown.map((day, i) => (
          <DayDot key={day.date} day={day} isActive={i === dailyBreakdown.length - 1} />
        ))}
      </div>
      
      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[hsl(var(--border)/0.5)] pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]">
            <Calendar className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{takenThisWeek}</p>
            <p className="text-[12px] text-[hsl(var(--fg-3))]">taken</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]">
            <Calendar className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{missedThisWeek}</p>
            <p className="text-[12px] text-[hsl(var(--fg-3))]">missed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
