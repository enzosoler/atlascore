import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { captureException } from '@/lib/sentry';
import S13_Coach_Brief from '../screens/S13_Coach_Brief.jsx';
import { ACFonts, useACT } from '../lib/paper.jsx';

function safeCount(value) {
  const next = Number(value);
  return Number.isFinite(next) ? Math.max(0, next) : 0;
}

function buildMoves(daily) {
  const mealCount = safeCount(daily.todayMeals?.length);
  const streak = safeCount(daily.workoutStreak);
  const recentSessions = safeCount(daily.recentSessions?.length);

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
      d: `${mealCount} meal${mealCount === 1 ? '' : 's'} logged`,
      meta: daily.nutritionMode ? String(daily.nutritionMode).replace(/_/g, ' ') : 'Nutrition tracking active',
    },
    {
      n: '03',
      t: 'Momentum',
      d: `${streak}-day streak`,
      meta: `${recentSessions} recent session${recentSessions === 1 ? '' : 's'} in view`,
    },
  ];
}

function buildSignals(daily) {
  const streak = safeCount(daily.workoutStreak);
  const meals = safeCount(daily.todayMeals?.length);
  const hasPlan = daily.plan?.name ? 1 : 0;

  return [
    {
      k: 'Streak',
      v: String(streak),
      u: 'days',
      d: streak > 0 ? 'live' : 'start',
      data: [0, 1, 2, 3, streak].map((v, k) => ({ k, v })),
    },
    {
      k: 'Meals',
      v: String(meals),
      u: 'today',
      d: meals > 0 ? 'logged' : 'none',
      data: [0, 0, 1, 1, meals].map((v, k) => ({ k, v })),
    },
    {
      k: 'Plan',
      v: String(hasPlan),
      u: 'active',
      d: hasPlan ? 'set' : 'pick',
      data: [0, 0, 0, 1, hasPlan].map((v, k) => ({ k, v })),
    },
  ];
}

class CoachRouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CoachRouteErrorBoundary]', error, errorInfo);
    captureException(error, {
      component: 'V3CoachHome',
      componentStack: errorInfo?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function CoachTextFallback({
  dark,
  firstName,
  reasonText,
  moves,
  onClose,
  onStartToday,
  onAskCoach,
}) {
  const c = useACT(dark);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '18px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: 'none',
            background: c.card,
            color: c.fg,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.dim }}>
          Coach safe mode
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ padding: '28px 22px 22px' }}>
        <div style={{ fontFamily: ACFonts.brand, fontSize: 40, lineHeight: 0.95, letterSpacing: -1.6, textTransform: 'lowercase' }}>
          {firstName}, coach is still here.
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: c.dim }}>
          The visual summary hit a rendering issue, so this route fell back to a stable text version instead of crashing.
        </p>
        <div style={{ marginTop: 18, padding: 16, borderRadius: 20, background: c.card, border: `1px solid ${c.hair}` }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', color: c.accent }}>
            Today
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: c.fg }}>
            {reasonText}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 22px 20px' }}>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.dim }}>
          Three moves
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {moves.map((move, index) => (
            <div key={move.id || move.n || index} style={{ padding: 16, borderRadius: 18, background: c.card, border: `1px solid ${c.hair}` }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', color: move.lead ? c.accent : c.dim }}>
                {move.n}
              </div>
              <div style={{ marginTop: 8, fontFamily: ACFonts.brand, fontSize: 22, lineHeight: 1, letterSpacing: -0.8, textTransform: 'lowercase' }}>
                {move.t}
              </div>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, color: c.fg }}>
                {move.d}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5, color: c.dim }}>
                {move.meta}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={onStartToday}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 999,
            padding: '16px 20px',
            background: c.fg,
            color: c.bg,
            fontFamily: ACFonts.brand,
            fontSize: 24,
            letterSpacing: -0.8,
            textTransform: 'lowercase',
            cursor: 'pointer',
          }}
        >
          start today
        </button>
        <button
          type="button"
          onClick={onAskCoach}
          style={{
            width: '100%',
            borderRadius: 999,
            padding: '14px 20px',
            background: 'transparent',
            color: c.fg,
            border: `1px solid ${c.hair}`,
            fontFamily: ACFonts.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Ask coach anything
        </button>
      </div>
    </div>
  );
}

export default function V3CoachHome() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const daily = useDailyStateV2();
  const firstName = (user?.full_name || user?.email?.split('@')[0] || 'Athlete').split(' ')[0];
  const mealCount = safeCount(daily.todayMeals?.length);
  const streak = safeCount(daily.workoutStreak);
  const hasPlan = Boolean(daily.plan?.name);
  const moves = buildMoves(daily);
  const reasonText = hasPlan
    ? `Your active plan is ${daily.plan.name}. Use this screen as the bridge into training, nutrition, and a live coach chat.`
    : 'Coach can already help with training, food, and recovery questions. Pick a routine or ask a direct question to get moving.';
  const onClose = () => navigate('/app/today');
  const onStartToday = () => navigate('/app/workouts/active');
  const onAskCoach = () => navigate('/app/coach/chat');

  return (
    <CoachRouteErrorBoundary
      fallback={(
        <CoachTextFallback
          dark={theme === 'dark'}
          firstName={firstName}
          reasonText={reasonText}
          moves={moves}
          onClose={onClose}
          onStartToday={onStartToday}
          onAskCoach={onAskCoach}
        />
      )}
    >
      <S13_Coach_Brief
        dark={theme === 'dark'}
        timestampLabel={new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
        briefLabel="Daily brief"
        headlineLead={`${firstName}, you're`}
        headlineAccent={hasPlan ? 'on track' : 'building'}
        metricLabel="Streak"
        metricValue={String(streak)}
        deltaLabel="meals today"
        deltaValue={String(mealCount)}
        timelineLabels={['START', 'RECENT', 'TODAY']}
        reasonText={reasonText}
        movesLabel="Today · three moves"
        movesProgressLabel={`${Math.min(3, (mealCount ? 1 : 0) + (hasPlan ? 1 : 0) + (streak > 0 ? 1 : 0))} / 03`}
        moves={moves}
        signalLabel="Live context"
        signalStatus="From your app data"
        signals={buildSignals(daily)}
        primaryActionLabel="Start today →"
        secondaryActionLabel="ask coach anything"
        onClose={onClose}
        onStartToday={onStartToday}
        onAskCoach={onAskCoach}
      />
    </CoachRouteErrorBoundary>
  );
}
