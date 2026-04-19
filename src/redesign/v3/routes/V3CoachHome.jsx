import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import S13_Coach_Brief from '../screens/S13_Coach_Brief.jsx';

function buildMoves(daily) {
  return [
    {
      n: '01',
      t: 'Train',
      d: daily.plan?.name || 'Open workout library',
      meta: daily.plan ? 'Ready when you are' : 'Pick a routine or start an empty session',
      lead: true,
    },
    {
      n: '02',
      t: 'Fuel',
      d: `${(daily.todayMeals || []).length} meal${(daily.todayMeals || []).length === 1 ? '' : 's'} logged`,
      meta: daily.nutritionMode ? String(daily.nutritionMode).replace(/_/g, ' ') : 'Nutrition tracking active',
    },
    {
      n: '03',
      t: 'Momentum',
      d: `${daily.workoutStreak || 0}-day streak`,
      meta: `${(daily.recentSessions || []).length} recent session${(daily.recentSessions || []).length === 1 ? '' : 's'} in view`,
    },
  ];
}

function buildSignals(daily) {
  return [
    {
      k: 'Streak',
      v: String(daily.workoutStreak || 0),
      u: 'days',
      d: daily.workoutStreak > 0 ? 'live' : 'start',
      data: [0, 1, 2, 3, Math.max(0, daily.workoutStreak || 0)].map((v, k) => ({ k, v })),
    },
    {
      k: 'Meals',
      v: String((daily.todayMeals || []).length),
      u: 'today',
      d: daily.todayMeals?.length ? 'logged' : 'none',
      data: [0, 0, 1, 1, (daily.todayMeals || []).length].map((v, k) => ({ k, v })),
    },
    {
      k: 'Plan',
      v: daily.plan?.name ? '1' : '0',
      u: 'active',
      d: daily.plan?.name ? 'set' : 'pick',
      data: [0, 0, 0, 1, daily.plan?.name ? 1 : 0].map((v, k) => ({ k, v })),
    },
  ];
}

export default function V3CoachHome() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const daily = useDailyStateV2();
  const firstName = (user?.full_name || user?.email?.split('@')[0] || 'Athlete').split(' ')[0];

  return (
    <S13_Coach_Brief
      dark={theme === 'dark'}
      timestampLabel={new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
      briefLabel="Daily brief"
      headlineLead={`${firstName}, you're`}
      headlineAccent={daily.plan?.name ? 'on track' : 'building'}
      metricLabel="Streak"
      metricValue={String(daily.workoutStreak || 0)}
      deltaLabel="meals today"
      deltaValue={String((daily.todayMeals || []).length)}
      timelineLabels={['START', 'RECENT', 'TODAY']}
      reasonText={
        daily.plan?.name
          ? `Your active plan is ${daily.plan.name}. Use this screen as the bridge into training, nutrition, and a live coach chat.`
          : 'Coach can already help with training, food, and recovery questions. Pick a routine or ask a direct question to get moving.'
      }
      movesLabel="Today · three moves"
      movesProgressLabel={`${Math.min(3, (daily.todayMeals?.length ? 1 : 0) + (daily.plan?.name ? 1 : 0) + (daily.workoutStreak > 0 ? 1 : 0))} / 03`}
      moves={buildMoves(daily)}
      signalLabel="Live context"
      signalStatus="From your app data"
      signals={buildSignals(daily)}
      primaryActionLabel="Start today →"
      secondaryActionLabel="ask coach anything"
      onClose={() => navigate('/app/today')}
      onStartToday={() => navigate('/app/workouts/active')}
      onAskCoach={() => navigate('/app/coach/chat')}
    />
  );
}
