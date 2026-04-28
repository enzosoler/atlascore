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
import { useT } from '@/lib/i18nContext';
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

function displayNameFromUser(user, profileData, t) {
  const meta = user?.user_metadata || user?.raw_user?.user_metadata || {};
  return (
    meta.display_name ||
    meta.full_name ||
    meta.name ||
    profileData?.full_name ||
    profileData?.display_name ||
    user?.email?.split('@')[0] ||
    t('you.v3.athlete')
  );
}

function joinedLabel(user, t) {
  const created = user?.created_at ? new Date(user.created_at) : null;
  if (!created || Number.isNaN(created.getTime())) return t('you.v3.joinedRecently');
  return t('you.v3.joinedDate', {
    date: created.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).toUpperCase(),
  });
}

function fallbackLiftRows(t) {
  return [
    { l: t('you.v3.lifts.deadlift'), v: '—', u: 'lb' },
    { l: t('you.v3.lifts.squat'), v: '—', u: 'lb' },
    { l: t('you.v3.lifts.bench'), v: '—', u: 'lb' },
    { l: t('you.v3.lifts.ohp'), v: '—', u: 'lb' },
  ];
}

export default function V3You() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useT();
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

  const name = displayNameFromUser(user, profileData, t);
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
        t: t('you.v3.recent.completedSession', { session: session.note?.trim() || t('you.v3.workoutSession') }),
        d: relativeAgeLabel(session.started_at || session.created_at || session.completed_at),
        hi: rows.length === 0,
      });
    });
    if ((daily.todayMeals || []).length > 0) {
      rows.push({
        t: t(daily.todayMeals.length === 1 ? 'you.v3.recent.loggedMealToday' : 'you.v3.recent.loggedMealsToday', {
          count: daily.todayMeals.length,
        }),
        d: t('you.v3.today'),
      });
    }
    if (latest?.date) {
      rows.push({
        t: t('you.v3.recent.updatedBodyCheckpoint'),
        d: relativeAgeLabel(latest.date),
      });
    }
    return rows.slice(0, 4);
  }, [daily.recentSessions, daily.todayMeals, latest, t]);

  const program = daily.plan?.name
    ? {
        badge: t('you.v3.program.activePlan'),
        title: daily.plan.name,
        mark: `D${(daily.plan.todayDayIndex ?? 0) + 1}`,
        total: daily.plan.totalDays || 1,
        current: (daily.plan.todayDayIndex ?? 0) + 1,
      }
    : routines[0]
      ? {
          badge: t('you.v3.program.recentRoutine'),
          title: routines[0].name,
          mark: `R${Math.min(99, (Array.isArray(routines[0].days) ? routines[0].days.length : 0) || 1)}`,
          total: Math.max(1, (Array.isArray(routines[0].days) ? routines[0].days.length : 0) || 1),
          current: 1,
        }
      : null;

  const bio = profileData?.training_goal
    ? String(profileData.training_goal).slice(0, 140)
    : profileData?.fitness_level
      ? t('you.v3.bioByFitnessLevel', { level: profileData.fitness_level })
      : '';

  const badges = [
    daily.workoutStreak > 0 ? t('you.v3.badges.dayStreak', { days: daily.workoutStreak }) : null,
    measurements.length > 0 ? t(measurements.length === 1 ? 'you.v3.badges.checkpoint' : 'you.v3.badges.checkpoints', { count: measurements.length }) : null,
    routines.length > 0 ? t(routines.length === 1 ? 'you.v3.badges.savedRoutine' : 'you.v3.badges.savedRoutines', { count: routines.length }) : null,
    daily.nutritionMode ? String(daily.nutritionMode).replace(/_/g, ' ') : null,
  ].filter(Boolean);

  const liftRows = fallbackLiftRows(t);
  const safeRecent = recent.length > 0 ? recent : [
    { t: sessionCount > 0 ? t('you.v3.recent.sessionsLogged', { count: sessionCount }) : t('you.v3.recent.noSessions'), d: t('you.v3.now'), hi: true },
    { t: measurements.length > 0 ? t(measurements.length === 1 ? 'you.v3.recent.bodyCheckpointRecorded' : 'you.v3.recent.bodyCheckpointsRecorded', { count: measurements.length }) : t('you.v3.recent.addFirstCheckpoint'), d: measurements.length > 0 ? t('you.v3.body') : t('you.v3.start') },
    { t: routines.length > 0 ? t(routines.length === 1 ? 'you.v3.recent.routineSaved' : 'you.v3.recent.routinesSaved', { count: routines.length }) : t('you.v3.recent.saveRoutine'), d: routines.length > 0 ? t('you.v3.train') : t('you.v3.plan') },
  ];
  const safeBadges = badges.length > 0 ? badges : [t('you.v3.badges.profileLive'), t('you.v3.badges.coreLoopActive')];
  const safeProgram = program || {
    badge: t('you.v3.program.nextUp'),
    title: routines.length > 0 ? t('you.v3.program.pickRoutine') : t('you.v3.program.createRoutine'),
    mark: 'GO',
    total: 1,
    current: 1,
  };
  const quickLinks = [
    {
      key: 'body',
      label: t('you.v3.links.body.label'),
      meta: t('you.v3.links.body.meta'),
      description: t('you.v3.links.body.description'),
      onClick: () => navigate('/app/body'),
    },
    {
      key: 'labs',
      label: t('you.v3.links.labs.label'),
      meta: t('you.v3.links.labs.meta'),
      description: t('you.v3.links.labs.description'),
      onClick: () => navigate('/app/labs'),
    },
    {
      key: 'protocols',
      label: t('you.v3.links.protocols.label'),
      meta: t('you.v3.links.protocols.meta'),
      description: t('you.v3.links.protocols.description'),
      onClick: () => navigate('/app/protocols'),
    },
    {
      key: 'social',
      label: t('you.v3.links.social.label'),
      meta: t('you.v3.links.social.meta'),
      description: t('you.v3.links.social.description'),
      onClick: () => navigate('/app/social'),
    },
    {
      key: 'settings',
      label: t('you.v3.links.settings.label'),
      meta: t('you.v3.links.settings.meta'),
      description: t('you.v3.links.settings.description'),
      onClick: () => navigate('/app/settings'),
    },
    {
      key: 'billing',
      label: t('you.v3.links.billing.label'),
      meta: t('you.v3.links.billing.meta'),
      description: t('you.v3.links.billing.description'),
      onClick: () => navigate('/webapp/billing'),
    },
  ];

  return (
    <S33_Profile
      dark={theme === 'dark'}
      showTabBar={false}
      handle={handle}
      profileStatus={t('you.v3.athleteStatus')}
      initials={getInitials(name)}
      name={name}
      joinedLabel={joinedLabel(user, t)}
      bio={bio}
      stats={[
        { k: t('you.v3.stats.sessions'), v: String(sessionCount || (daily.recentSessions || []).length) },
        { k: t('you.v3.stats.routines'), v: String(routines.length) },
        { k: t('you.v3.stats.checks'), v: String(measurements.length) },
      ]}
      lifts={liftRows}
      program={safeProgram}
      composition={latestWeight != null ? {
        label: [
          latestWeight != null && oldestWeight != null ? `${latestWeight - oldestWeight > 0 ? '+' : ''}${(latestWeight - oldestWeight).toFixed(1)} kg` : null,
          latestLeanMass != null && oldestLeanMass != null ? `${latestLeanMass - oldestLeanMass > 0 ? '+' : ''}${(latestLeanMass - oldestLeanMass).toFixed(1)} LBM` : null,
        ].filter(Boolean).join(' · ') || t('you.v3.latestBodyTrend'),
        weight: latestWeight.toFixed(1),
        unit: 'kg',
        trend: weightTrend,
      } : null}
      recent={safeRecent}
      badges={safeBadges}
      quickLinks={quickLinks}
      labels={{
        bigFour: t('you.v3.labels.bigFour'),
        composition90d: t('you.v3.labels.composition90d'),
        weight: t('you.v3.labels.weight'),
        recent: t('you.v3.labels.recent'),
        moreFromProfile: t('you.v3.labels.moreFromProfile'),
        open: t('you.v3.labels.open'),
      }}
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
