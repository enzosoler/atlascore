/**
 * /app/v3/train — Library / programs / routines.
 *
 * Data wiring (TRUST RULE: never fabricate):
 *  - Routines: listRoutines() from @/lib/workoutsService. Each row becomes
 *    a program card. If the user has zero routines we pass `programs = []`
 *    so S24 renders its empty state. We never invent routines.
 *  - Active program: the routines table has no `is_active` flag today, so we
 *    treat the first row (sorted by last_used_at desc, then created_at desc
 *    inside the service) as the currently-active one.
 *  - While the fetch is in flight we pass `programs = undefined` so the mock
 *    catalog renders (gallery parity — the screen never flashes empty).
 *  - onStartWorkout → /app/workouts/active (existing active-session route).
 *  - onSelectProgram(id) → tries /app/workouts/routines/${id}. That route is
 *    not in the App router yet, so for now we no-op and dev-warn. Hook up
 *    once the detail route lands.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { listRoutines } from '@/lib/workoutsService';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import S24_Library from '../screens/S24_Library.jsx';

const DEV = typeof import.meta !== 'undefined' && import.meta?.env?.DEV;

/**
 * Map a row from `workout_plans` (the assigned/active program source) →
 * the shape S24_Library expects for a program card. This is the source
 * for things like "NF Team 2" — coach- or self-assigned programs that
 * live separately from user-created routines.
 */
function mapPlanToProgram(plan) {
  if (!plan) return null;
  const weeks = Number(plan.weeks || plan.duration_weeks || plan.length_weeks);
  const days = Number(plan.days_per_week || plan.sessions_per_week);
  return {
    id: plan.id,
    name: (typeof plan.name === 'string' && plan.name.trim()) ? plan.name.trim() : 'Current program',
    w: Number.isFinite(weeks) && weeks > 0 ? weeks : '—',
    d: Number.isFinite(days) && days > 0 ? days : '—',
    a: plan.author || plan.coach_name || undefined,
    lvl: plan.level || undefined,
    tag: 'Assigned',
  };
}

/**
 * Map a raw routines row → the shape S24_Library expects for a program card.
 * Fields on the row: id, name, source_preset_id, days (jsonb array),
 * created_at, updated_at, last_used_at. We derive:
 *  - w (weeks): unknown from the row alone; show '—'. (Routines are recurring
 *    splits, not fixed-length programs, so "weeks" isn't meaningful. We use
 *    em-dash rather than invent a number.)
 *  - d (days/wk): days array length.
 *  - lvl: unknown → omit.
 *  - a (author): omit; these are the user's own routines.
 *  - fit (match %): omit; no matching engine yet.
 */
function mapRoutineToProgram(row) {
  if (!row) return null;
  const dayCount = Array.isArray(row.days) ? row.days.length : 0;
  return {
    id: row.id,
    name: (typeof row.name === 'string' && row.name.trim()) ? row.name.trim() : 'Untitled routine',
    w: '—',
    d: dayCount,
    // a, lvl, fit, tag intentionally omitted — no honest source for them yet.
  };
}

export default function V3Train() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  // Active assigned plan (workout_plans.active=true) — source for "NF Team 2".
  // useDailyStateV2 already fetches this; we reuse it so the Library and the
  // Today/Coach views share one source of truth.
  const { daily } = useDailyStateV2();
  const activePlan = daily?.plan || null;

  // undefined = loading (mock renders) / array = real rows (possibly empty).
  const [routines, setRoutines] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      // Signed-out (shouldn't happen inside /app/* but be safe): no data,
      // show empty state rather than mock-lying.
      setRoutines([]);
      return;
    }
    (async () => {
      try {
        const rows = await listRoutines();
        if (cancelled) return;
        setRoutines(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error('[V3Train] failed to load routines:', err);
        toast.error(t('errors.loadFailed'));
        if (!cancelled) setRoutines([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const dark = theme === 'dark';

  // Merge the active assigned plan (from workout_plans) with user-created
  // routines. The assigned plan always sits first so it reads as the current
  // program — mirrors what Today / Coach already show.
  const { programs, activeProgramId } = useMemo(() => {
    if (routines === undefined) {
      // Loading: if we already have the active plan, surface it so the user
      // never sees a "no program" flash. Otherwise fall through to mock.
      if (activePlan) {
        const assigned = mapPlanToProgram(activePlan);
        return { programs: [assigned].filter(Boolean), activeProgramId: assigned?.id };
      }
      return { programs: undefined, activeProgramId: undefined };
    }
    const userPrograms = routines.map(mapRoutineToProgram).filter(Boolean);
    if (activePlan) {
      const assigned = mapPlanToProgram(activePlan);
      // De-dupe in case the assigned plan is also mirrored as a routine row.
      const filtered = assigned
        ? userPrograms.filter((p) => p.id !== assigned.id && p.name !== assigned.name)
        : userPrograms;
      return {
        programs: [assigned, ...filtered].filter(Boolean),
        activeProgramId: assigned?.id,
      };
    }
    return {
      programs: userPrograms,
      activeProgramId: routines[0]?.id,
    };
  }, [routines, activePlan]);

  const handleStartWorkout = () => {
    navigate('/app/workouts/active');
  };

  const handleSelectProgram = (id) => {
    if (!id) return;
    navigate(`/app/routines/${id}`);
  };

  return (
    <S24_Library
      dark={dark}
      programs={programs}
      activeProgramId={activeProgramId}
      onStartWorkout={handleStartWorkout}
      onSelectProgram={handleSelectProgram}
      onSearch={() => navigate('/app/exercises')}
      onBuildProgram={() => navigate('/app/workouts/manual-plan')}
      onOpenFeatured={() => navigate('/app/routines/presets')}
      onOpenCalendar={() => navigate('/app/workouts/calendar')}
      onOpenHistory={() => navigate('/app/workouts/history')}
      showTabBar={false}
    />
  );
}
