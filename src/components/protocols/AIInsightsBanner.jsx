import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function generateInsights(protocols = [], logs = []) {
  const insights = [];
  
  if (protocols.length === 0) {
    return [{
      type: 'info',
      icon: Sparkles,
      message: 'Start tracking your supplements to get personalized insights',
      tone: 'neutral'
    }];
  }
  
  const activeProtocols = protocols.filter(p => p.active !== false && !p.end_date);
  
  // Calculate adherence for the last 7 days
  const today = new Date();
  let recentDoses = 0;
  let expectedDoses = 0;
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLogs = logs.filter(log => 
      log.taken_at?.startsWith(dateStr) || log.created_at?.startsWith(dateStr)
    );
    
    recentDoses += dayLogs.length;
    expectedDoses += activeProtocols.length;
  }
  
  const adherenceRate = expectedDoses > 0 ? recentDoses / expectedDoses : 0;
  
  // Check for missed doses yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayLogs = logs.filter(log => 
    log.taken_at?.startsWith(yesterdayStr) || log.created_at?.startsWith(yesterdayStr)
  );
  const yesterdayDosedProtocols = new Set(yesterdayLogs.map(log => log.protocol_id)).size;
  const missedYesterday = activeProtocols.length - yesterdayDosedProtocols;
  
  if (missedYesterday > 0) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      message: missedYesterday === 1 
        ? 'You missed 1 dose yesterday' 
        : `You missed ${missedYesterday} doses yesterday`,
      tone: 'warning'
    });
  }
  
  // Check for declining consistency
  if (adherenceRate < 0.5 && activeProtocols.length > 0) {
    insights.push({
      type: 'warning',
      icon: TrendingDown,
      message: 'Consistency is dropping — try to get back on track',
      tone: 'warning'
    });
  }
  
  // Check for perfect streak
  if (adherenceRate === 1 && expectedDoses > 0) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Perfect week! You\'re on track',
      tone: 'success'
    });
  } else if (adherenceRate >= 0.8) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      message: 'Great consistency this week',
      tone: 'success'
    });
  }
  
  // Default insight if nothing specific
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: Sparkles,
      message: 'Log your doses to build better habits',
      tone: 'neutral'
    });
  }
  
  return insights.slice(0, 1); // Return only the most important insight
}

const toneClasses = {
  success: {
    container: 'bg-[hsl(var(--ok)/0.08)] border-[hsl(var(--ok)/0.18)]',
    icon: 'text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.12)]',
    text: 'text-[hsl(var(--ok))]',
  },
  warning: {
    container: 'bg-[hsl(var(--warn)/0.08)] border-[hsl(var(--warn)/0.18)]',
    icon: 'text-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.12)]',
    text: 'text-[hsl(var(--warn))]',
  },
  neutral: {
    container: 'bg-[hsl(var(--brand)/0.06)] border-[hsl(var(--brand)/0.12)]',
    icon: 'text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)]',
    text: 'text-[hsl(var(--brand))]',
  },
};

export default function AIInsightsBanner({ protocols = [], logs = [] }) {
  const insights = generateInsights(protocols, logs);
  const insight = insights[0];
  
  if (!insight) return null;
  
  const styles = toneClasses[insight.tone];
  const Icon = insight.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-[20px] border px-4 py-3',
      styles.container
    )}>
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
        styles.icon
      )}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <p className={cn('text-[14px] font-medium', styles.text)}>
        {insight.message}
      </p>
    </div>
  );
}
