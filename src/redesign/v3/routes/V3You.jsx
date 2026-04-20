/**
 * /app/v3/you — profile.
 * Wraps S33_Profile with real profile/session/routine/body data.
 */

import React from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { getInitials, loadLocalProfile } from '@/lib/profileUtils';
import { listMeasurements } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { listRoutines } from '@/lib/workoutsService';
import S33_Profile from '../screens/S33_Profile.jsx';

function relativeAgeLabel(dateValue) {
  if (!dateValue) return '';
  const diff = Date.now() - new Date(dateValue).getTime();
  if (!Number.isFinite(diff) || diff < 0) return '';
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function displayNameFromUser(user, profileData) {
  const meta = user?.user_metadata || user?.raw_user?.user_metadata || {};
  return (
    meta.display_name ||
    meta.full_name ||
    meta.name ||
    profileData?.full_name ||
    profileData?.display_name ||
    user?.email?.split('@')[0] ||
    'Athlete'
  );
}

function joinedLabel(user) {
  const created = user?.created_at ? new Date(user.created_at) : null;
  if (!created || Number.isNaN(created.getTime())) return 'joined recently';
  return `joined ${created.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase()}`;
}

function fallbackLiftRows() {
  return [
    { l: 'Deadlift', v: '—', u: 'lb' },
    { l: 'Squat', v: '—', u: 'lb' },
    { l: 'Bench', v: '—', u: 'lb' },
    { l: 'OHP', v: '—', u: 'lb' },
  ];
}

export default function V3You() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const daily = useDailyStateV2();
  const navigate = useNavigate();

  const { data: profileData } = useQuery({
    queryKey: ['v3-profile-data', user?.id],
    queryFn: () => loadLocalProfile(user),
    enabled: !!user?.id,
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['v3-you-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 60),
    enabled: !!user?.id,
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['v3-you-routines', user?.id],
    queryFn: () => listRoutines(),
    enabled: !!user?.id,
  });

  const { data: sessionCount = 0 } = useQuery({
    queryKey: ['v3-you-session-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const name = displayNameFromUser(user, profileData);
  const handleBase = (user?.email?.split('@')[0] || name || 'athlete')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '');
  const handle = `@${handleBase || 'athlete'}`;

  const latest = measurements[0] || null;
  const oldest = measurements[measurements.length - 1] || null;
  const latestWeight = getMeasurementFieldValue(latest, 'weight');
  const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
  const latestLeanMass = getMeasurementFieldValue(latest, 'lean_mass');
  const oldestLeanMass = getMeasurementFieldValue(oldest, 'lean_mass');
  const weightTrend = measurements
    .map((entry) => getMeasurementFieldValue(entry, 'weight'))
    .filter((value) => value != null)
    .slice(0, 9)
    .reverse();

  const recent = useMemo(() => {
    const rows = [];
    (daily.recentSessions || []).slice(0, 3).forEach((session) => {
      rows.push({
        t: `Completed ${session.note?.trim() || 'workout session'}`,
        d: relativeAgeLabel(session.started_at || session.created_at || session.completed_at),
        hi: rows.length === 0,
      });
    });
    if ((daily.todayMeals || []).length > 0) {
      rows.push({
        t: `Logged ${(daily.todayMeals || []).length} meal${daily.todayMeals.length === 1 ? '' : 's'} today`,
        d: 'today',
      });
    }
    if (latest?.date) {
      rows.push({
        t: 'Updated body checkpoint',
        d: relativeAgeLabel(latest.date),
      });
    }
    return rows.slice(0, 4);
  }, [daily.recentSessions, daily.todayMeals, latest]);

  const program = daily.plan?.name
    ? {
        badge: 'Active plan',
        title: daily.plan.name,
        mark: `D${(daily.plan.todayDayIndex ?? 0) + 1}`,
        total: daily.plan.totalDays || 1,
        current: (daily.plan.todayDayIndex ?? 0) + 1,
      }
    : routines[0]
      ? {
          badge: 'Recent routine',
          title: routines[0].name,
          mark: `R${Math.min(99, (Array.isArray(routines[0].days) ? routines[0].days.length : 0) || 1)}`,
          total: Math.max(1, (Array.isArray(routines[0].days) ? routines[0].days.length : 0) || 1),
          current: 1,
        }
      : null;

  const bio = profileData?.training_goal
    ? String(profileData.training_goal).slice(0, 140)
    : profileData?.fitness_level
      ? `${profileData.fitness_level} athlete focused on consistency and measurable progress.`
      : '';

  const badges = [
    daily.workoutStreak > 0 ? `${daily.workoutStreak}-day streak` : null,
    measurements.length > 0 ? `${measurements.length} checkpoints` : null,
    routines.length > 0 ? `${routines.length} saved routines` : null,
    daily.nutritionMode ? String(daily.nutritionMode).replace(/_/g, ' ') : null,
  ].filter(Boolean);

  const liftRows = fallbackLiftRows();
  const safeRecent = recent.length > 0 ? recent : [
    { t: sessionCount > 0 ? `${sessionCount} sessions logged so far` : 'No sessions logged yet', d: 'now', hi: true },
    { t: measurements.length > 0 ? `${measurements.length} body checkpoint${measurements.length === 1 ? '' : 's'} recorded` : 'Add your first checkpoint to unlock body trends', d: measurements.length > 0 ? 'body' : 'start' },
    { t: routines.length > 0 ? `${routines.length} routine${routines.length === 1 ? '' : 's'} saved` : 'Save a routine to surface it here', d: routines.length > 0 ? 'train' : 'plan' },
  ];
  const safeBadges = badges.length > 0 ? badges : ['Profile live', 'Core loop active'];
  const safeProgram = program || {
    badge: 'Next up',
    title: routines.length > 0 ? 'Pick a routine to start training.' : 'Create or import a routine to bring this profile to life.',
    mark: 'GO',
    total: 1,
    current: 1,
  };

  return (
    <S33_Profile
      dark={theme === 'dark'}
      showTabBar={false}
      handle={handle}
      profileStatus="athlete"
      initials={getInitials(name)}
      name={name}
      joinedLabel={joinedLabel(user)}
      bio={bio}
      stats={[
        { k: 'Sessions', v: String(sessionCount || (daily.recentSessions || []).length) },
        { k: 'Routines', v: String(routines.length) },
        { k: 'Checks', v: String(measurements.length) },
      ]}
      lifts={liftRows}
      program={safeProgram}
      composition={latestWeight != null ? {
        label: [
          latestWeight != null && oldestWeight != null ? `${latestWeight - oldestWeight > 0 ? '+' : ''}${(latestWeight - oldestWeight).toFixed(1)} kg` : null,
          latestLeanMass != null && oldestLeanMass != null ? `${latestLeanMass - oldestLeanMass > 0 ? '+' : ''}${(latestLeanMass - oldestLeanMass).toFixed(1)} LBM` : null,
        ].filter(Boolean).join(' · ') || 'Latest body trend',
        weight: latestWeight.toFixed(1),
        unit: 'kg',
        trend: weightTrend,
      } : null}
      recent={safeRecent}
      badges={safeBadges}
      onGoBack={() => navigate('/app/today')}
      onOpenSettings={() => navigate('/app/settings')}
      onOpenProgram={() => navigate(program ? '/app/workouts' : '/app/routines')}
      onOpenComposition={() => navigate('/app/body')}
      onOpenCrew={() => navigate('/app/crew')}
      onOpenWatch={() => navigate('/app/watch')}
      onOpenProtocols={() => navigate('/app/protocols')}
    />
  );
}
