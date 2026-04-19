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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { listRoutines } from '@/lib/workoutsService';
import S24_Library from '../screens/S24_Library.jsx';

const DEV = typeof import.meta !== 'undefined' && import.meta?.env?.DEV;

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
      } catch {
        if (!cancelled) setRoutines([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const dark = theme === 'dark';

  // Resolve props. Pass undefined while loading so S24 shows the mock catalog
  // (prevents an empty-state flash for users who *do* have routines).
  let programs;
  let activeProgramId;
  if (routines === undefined) {
    programs = undefined;            // loading → mock
    activeProgramId = undefined;
  } else {
    programs = routines.map(mapRoutineToProgram).filter(Boolean);
    // No is_active column yet — use the first (most recently used) row.
    activeProgramId = routines[0]?.id;
  }

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
      showTabBar={false}
    />
  );
}
