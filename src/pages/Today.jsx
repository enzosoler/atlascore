import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Camera,
  Dumbbell,
  Loader2,
  Scale,
  Shield,
  Sparkles,
  SunMedium,
  UtensilsCrossed,
  CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { getGreeting } from '@/lib/atlas-theme';
import { generateMvpInsights } from '@/lib/insightsEngine';
import { SafePageBoundary } from '@/components/shared/StablePage';
import {
  TodayActionCard,
  TodayAdherenceCard,
  TodayCard,
  TodayInsightCard,
  TodayScreen,
  TodaySection,
  TodayStatCard,
} from '@/components/today/TodayMobileUI';
import { WeeklyCheckinModal } from '@/components/today/WeeklyCheckinModal';

function getPreferredName(displayName, fallbackName = null) {
  if (!displayName) return fallbackName;
  const [firstChunk] = String(displayName)
    .split(/[\s@._-]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (!firstChunk) return fallbackName;

  const sanitizedChunk = firstChunk.replace(/\d+$/u, '');
  const candidate = sanitizedChunk || firstChunk;

  if (!candidate) return fallbackName;

  return `${candidate.charAt(0).toLocaleUpperCase()}${candidate.slice(1)}`;
}

function getDateLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function getHeroAmbientClassName(date = new Date(), weatherTone = 'default') {
  const hour = date.getHours();

  if (weatherTone === 'rain' || weatherTone === 'storm') {
    if (hour < 18) {
      return 'border-[hsl(var(--accent-secondary)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.18),transparent_24%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.12),transparent_30%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_42%,hsl(var(--fill-secondary)/0.98)_100%)]';
    }

    return 'border-[hsl(var(--accent-secondary)/0.26)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.22),transparent_22%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.1),transparent_28%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_40%,hsl(var(--fill-secondary)/0.98)_100%)]';
  }

  if (weatherTone === 'cloud' || weatherTone === 'fog' || weatherTone === 'snow') {
    if (hour < 18) {
      return 'border-[hsl(var(--border)/0.96)] bg-[radial-gradient(circle_at_top_right,hsl(var(--fill-secondary)/0.72),transparent_24%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.12),transparent_32%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_46%,hsl(var(--fill)/0.98)_100%)]';
    }

    return 'border-[hsl(var(--border)/0.96)] bg-[radial-gradient(circle_at_top_right,hsl(var(--fill-secondary)/0.82),transparent_22%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.1),transparent_28%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_42%,hsl(var(--fill-secondary)/0.98)_100%)]';
  }

  if (hour < 12) {
    return 'border-[hsl(var(--brand)/0.22)] bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.14),transparent_24%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.18),transparent_34%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_48%,hsl(var(--fill)/0.98)_100%)]';
  }

  if (hour < 18) {
    return 'border-[hsl(var(--brand)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.14),transparent_26%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.16),transparent_34%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_44%,hsl(var(--fill)/0.98)_100%)]';
  }

  return 'border-[hsl(var(--accent-secondary)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.2),transparent_24%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.14),transparent_30%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_42%,hsl(var(--fill-secondary)/0.98)_100%)]';
}

function getWeatherPresentation(code, locale) {
  const isEnglish = locale === 'en-US';

  if (code === 0) {
    return {
      Icon: SunMedium,
      label: 'Clear',
      tone: 'clear',
      iconClassName: 'text-[hsl(var(--warn))]',
    };
  }

  if (code === 1) {
    return {
      Icon: CloudSun,
      label: 'Mostly clear',
      tone: 'clear',
      iconClassName: 'text-[hsl(var(--warn))]',
    };
  }

  if (code === 2) {
    return {
      Icon: CloudSun,
      label: isEnglish ? 'Partly cloudy' : 'Parcialmente nublado',
      tone: 'cloud',
      iconClassName: 'text-[hsl(var(--accent-secondary))]',
    };
  }

  if (code === 3) {
    return {
      Icon: Cloud,
      label: isEnglish ? 'Cloudy' : 'Nublado',
      tone: 'cloud',
      iconClassName: 'text-[hsl(var(--fg-2))]',
    };
  }

  if (code === 45 || code === 48) {
    return {
      Icon: CloudFog,
      label: isEnglish ? 'Fog' : 'Neblina',
      tone: 'fog',
      iconClassName: 'text-[hsl(var(--fg-2))]',
    };
  }

  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) {
    return {
      Icon: CloudDrizzle,
      label: isEnglish ? 'Drizzle' : 'Garoa',
      tone: 'rain',
      iconClassName: 'text-[hsl(var(--accent-secondary))]',
    };
  }

  if (code >= 61 && code <= 67) {
    return {
      Icon: CloudRain,
      label: isEnglish ? 'Rain' : 'Chuva',
      tone: 'rain',
      iconClassName: 'text-[hsl(var(--accent-secondary))]',
    };
  }

  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      Icon: CloudSnow,
      label: isEnglish ? 'Snow' : 'Neve',
      tone: 'snow',
      iconClassName: 'text-[hsl(var(--fg))]',
    };
  }

  if (code >= 95) {
    return {
      Icon: CloudLightning,
      label: isEnglish ? 'Storm' : 'Tempestade',
      tone: 'storm',
      iconClassName: 'text-[hsl(var(--warn))]',
    };
  }

  return {
    Icon: Cloud,
    label: 'Conditions',
    tone: 'default',
    iconClassName: 'text-[hsl(var(--fg-2))]',
  };
}

function getNextSteps(t, ROUTES, {
  activeWorkoutPlan,
  todaySession,
  todayMealsCount,
  recentMeasurementsCount,
  progressPhotosCount,
}) {
  return [
    {
      to: ROUTES.nutrition,
      title: todayMealsCount > 0 ? 'Review nutrition' : t('today_page.nextSteps.nutritionTitle'),
      description: todayMealsCount > 0
        ? `You already logged ${todayMealsCount} food item${todayMealsCount > 1 ? 's' : ''} today. Keep the day complete.`
        : t('today_page.nextSteps.nutritionDesc'),
      icon: UtensilsCrossed,
      phase: t('today_page.nextSteps.nutritionPhase'),
    },
    {
      to: ROUTES.workouts,
      title: !activeWorkoutPlan
        ? 'Create workout plan'
        : todaySession?.status === 'completed'
          ? 'Review workout log'
          : 'Start workout',
      description: !activeWorkoutPlan
        ? 'Build your active training plan first so Today, history, and execution all point to the same structure.'
        : todaySession?.status === 'completed'
          ? 'Open the completed session, review the numbers, and prepare the next training day.'
          : 'Launch the active plan and log sets, reps, and load from the structured session.',
      icon: Dumbbell,
      phase: t('today_page.nextSteps.workoutPhase'),
    },
    {
      to: ROUTES.measurements,
      title: recentMeasurementsCount > 0
        ? 'Review measurements'
        : 'Log measurement',
      description: recentMeasurementsCount > 0
        ? 'Keep body weight and circumference checkpoints current so progress trends stay trustworthy.'
        : 'Add body weight and body measurements so progress tracking starts with a real baseline.',
      icon: Scale,
      phase: 'Body',
    },
    {
      to: ROUTES.progressPhotos,
      title: progressPhotosCount > 0 ? 'Review progress photos' : 'Add progress photo',
      description: progressPhotosCount > 0
        ? 'See how your latest checkpoints are changing over time.'
        : 'Capture a dated visual checkpoint so your photo timeline evolves with the rest of your data.',
      icon: Camera,
      phase: 'Photos',
    },
  ];
}

export default function Today() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('today_page.title')}
      subtitle={t('today_page.subtitle')}
      maxWidth="max-w-5xl"
      fallbackDescription="The Today screen opened in safe mode."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}

function TodayContent() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const isEN = locale === 'en-US';
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const fallbackName = t('today_page.fallbackName');
  const displayName = user?.full_name || user?.email || fallbackName;
  const preferredName = getPreferredName(displayName, fallbackName) || fallbackName;
  const greeting = getGreeting(locale);
  const weatherPresentation = weather
    ? getWeatherPresentation(weather.weathercode, locale)
    : null;
  const heroAmbientClassName = getHeroAmbientClassName(
    new Date(),
    weatherPresentation?.tone || 'default'
  );

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator?.geolocation) return undefined;

    let isActive = true;
    const controller = new AbortController();

    const fetchWeather = async (latitude, longitude) => {
      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current_weather: 'true',
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = await response.json();
        const currentWeather = data?.current_weather;

        if (!isActive || !currentWeather || typeof currentWeather.temperature !== 'number') {
          return;
        }

        setWeather({
          temperature: Math.round(currentWeather.temperature),
          weathercode: Number.isFinite(currentWeather.weathercode)
            ? currentWeather.weathercode
            : null,
        });
      } catch (error) {
        if (error?.name !== 'AbortError') {
          // Fail silently so the hero never blocks on weather/location.
        }
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // If permission is denied or unavailable, keep the weather treatment hidden.
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 15 * 60 * 1000,
      }
    );

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  // ── Data queries ───────────────────────────────────────────────────────────

  const { data: profileRow = null, isLoading: loadingProfile } = useQuery({
    queryKey: ['today-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const { data: activeDietPlans = [], isLoading: loadingDiet } = useQuery({
    queryKey: ['today-diet-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('diet_plans').select('*').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeWorkoutPlans = [], isLoading: loadingWorkout } = useQuery({
    queryKey: ['today-workout-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('workout_plans').select('*').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Completed sessions from Supabase — sorted by completed_at
  const { data: recentSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['today-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(60);
      // Normalise: add a `date` field (YYYY-MM-DD) from completed_at so existing logic works
      return (data || []).map((s) => ({ ...s, date: s.completed_at ? s.completed_at.split('T')[0] : null }));
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Today's food logs for nutrition adherence
  const { data: recentMeals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['today-meals-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('food_logs').select('*').eq('user_id', user.id).gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).order('date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Recent measurements from Supabase
  const { data: recentMeasurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['today-measurements-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(200);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const { data: recentCheckins = [], isLoading: loadingCheckins } = useQuery({
    queryKey: ['today-checkins-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const startKey = start.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startKey)
        .order('date', { ascending: false })
        .limit(60);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentProgressPhotos = [], isLoading: loadingProgressPhotos } = useQuery({
    queryKey: ['today-progress-photos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('progress_photos')
        .select('id, date, category')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(12);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Active protocols from Supabase
  const { data: allProtocols = [], isLoading: loadingProtocols } = useQuery({
    queryKey: ['today-protocols', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('protocols').select('*').eq('user_id', user.id).order('start_date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    loadingProfile ||
    loadingDiet ||
    loadingWorkout ||
    loadingSessions ||
    loadingMeals ||
    loadingMeasurements ||
    loadingCheckins ||
    loadingProgressPhotos ||
    loadingProtocols;

  // ── Derived state ─────────────────────────────────────────────────────────

  const profile = useMemo(() => {
    const pd = profileRow?.profile_data;
    const fromPd = pd && typeof pd === 'object' ? pd : {};
    const merged = { ...fromPd, ...(profileRow || {}) };
    delete merged.profile_data;
    return merged;
  }, [profileRow]);

  const activeDietPlan = activeDietPlans[0] || null;
  const activeWorkoutPlan = activeWorkoutPlans[0] || null;
  const todayMeals = recentMeals.filter((m) => m.date === todayStr);
  const activeProtocolsList = allProtocols.filter((p) => p.active && !p.end_date);
  const latestMeasurement = recentMeasurements[0] || null;
  const todaySession = recentSessions.find((s) => s.date === todayStr);

  const mvp = useMemo(() => {
    if (!user?.id) return null;
    return generateMvpInsights({
      today: todayStr,
      rangeDays: 30,
      profile,
      workoutPlan: activeWorkoutPlan,
      dietPlan: activeDietPlan,
      measurements: recentMeasurements,
      workouts: recentSessions,
      meals: recentMeals,
      checkins: recentCheckins,
    });
  }, [
    user?.id,
    todayStr,
    profile,
    activeWorkoutPlan,
    activeDietPlan,
    recentMeasurements,
    recentSessions,
    recentMeals,
    recentCheckins,
  ]);

  // ── "Done" flags for each pillar ──────────────────────────────────────────

  const nutritionDone = todayMeals.length > 0;
  const workoutDone = todaySession?.status === 'completed';
  // Measurements: any log in the last 7 days counts as "up to date"
  const sevenAgoStr = (() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();
  const measurementsDone = recentMeasurements.some((m) => m.date && m.date >= sevenAgoStr);
  const protocolsDone = activeProtocolsList.length > 0;

  const allDoneCount = [nutritionDone, workoutDone, measurementsDone].filter(Boolean).length;
  const showDailySummary = !isLoading && allDoneCount >= 2;
  const heroGreeting = `${greeting}, ${preferredName}.`;
  const heroTagline = isLoading
    ? 'Pulling training, nutrition, and body signals into one clean daily brief.'
    : allDoneCount === 3
      ? isEN
        ? 'Your core tracking is current. Review what is working and protect the next best decision.'
        : 'Your core tracking is current. Review what is working and protect the next best decision.'
      : allDoneCount === 0
        ? isEN
          ? 'Start with food, training, or body data so Today becomes something measurable.'
          : 'Start with food, training, or body data so Today becomes something measurable.'
        : isEN
          ? 'You already have momentum today. Close the biggest gap and keep the day structurally complete.'
          : 'You already have momentum today. Close the biggest gap and keep the day structurally complete.';
  const heroHighlights = [
    {
      label: 'Focus',
      value: `${allDoneCount}/3 core pillars`,
      tone: allDoneCount >= 2 ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]',
    },
    {
      label: 'Training',
      value: activeWorkoutPlan
        ? workoutDone
          ? 'Session complete'
          : 'Plan ready'
        : 'Plan needed',
      tone: workoutDone ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]',
    },
    {
      label: weather && weatherPresentation ? 'Weather' : 'Nutrition',
      value: weather && weatherPresentation
        ? `${weather.temperature}° · ${weatherPresentation.label}`
        : nutritionDone
          ? `${todayMeals.length} entr${todayMeals.length === 1 ? 'y' : 'ies'} logged`
          : 'Needs a meal log',
      tone: weather && weatherPresentation
        ? weatherPresentation.iconClassName
        : nutritionDone
          ? 'text-[hsl(var(--ok))]'
          : 'text-[hsl(var(--fg))]',
      Icon: weather && weatherPresentation ? weatherPresentation.Icon : UtensilsCrossed,
    },
  ];

  // ── Snapshot card values ─────────────────────────────────────────────────

  const nutritionValue = activeDietPlan
    ? `${activeDietPlan.total_calories ?? activeDietPlan.target_calories ?? '—'} kcal`
    : t('today_page.noPlan');
  const nutritionMeta = activeDietPlan
    ? activeDietPlan.name || t('today_page.activePlan')
    : t('today_page.setupNutrition');

  const workoutValue = todaySession
    ? todaySession.status === 'completed'
      ? t('today_page.completed')
      : t('today_page.inProgress')
    : activeWorkoutPlan
      ? t('today_page.pending')
      : t('today_page.noPlan');
  const workoutMeta = activeWorkoutPlan
    ? activeWorkoutPlan.name || t('today_page.activePlan')
    : t('today_page.setupWorkouts');

  const progressValue = latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '—';
  const progressMeta = latestMeasurement
    ? new Date(`${latestMeasurement.date}T12:00:00`).toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          month: 'short',
        },
      )
    : t('today_page.addMeasurement');

  const protocolsValue = String(activeProtocolsList.length);
  const protocolsMeta =
    activeProtocolsList.length > 0
      ? `${activeProtocolsList.length} active`
      : t('today_page.noActive');

  const NEXT_STEPS = getNextSteps(t, ROUTES, {
    activeWorkoutPlan,
    todaySession,
    todayMealsCount: todayMeals.length,
    recentMeasurementsCount: recentMeasurements.length,
    progressPhotosCount: recentProgressPhotos.length,
  });

  const snapshotCards = [
    {
      to: ROUTES.nutrition,
      label: t('today_page.snapshot.nutrition'),
      value: isLoading ? '—' : nutritionValue,
      description: activeDietPlan
        ? t('today_page.snapshot.nutritionActive')
        : t('today_page.snapshot.nutritionNone'),
      meta: isLoading ? '...' : nutritionMeta,
      icon: UtensilsCrossed,
      tone: 'blue',
      done: nutritionDone,
      ctaLabel: nutritionDone ? 'Review today' : 'Log meals',
    },
    {
      to: ROUTES.workouts,
      label: t('today_page.snapshot.workout'),
      value: isLoading ? '—' : workoutValue,
      description: activeWorkoutPlan
        ? t('today_page.snapshot.workoutActive')
        : t('today_page.snapshot.workoutNone'),
      meta: isLoading ? '...' : workoutMeta,
      icon: Dumbbell,
      tone: 'orange',
      done: workoutDone,
      ctaLabel: workoutDone
        ? 'Review session'
        : !activeWorkoutPlan
          ? 'Create plan'
          : 'Start session',
    },
    {
      to: ROUTES.measurements,
      label: t('today_page.snapshot.progress'),
      value: isLoading ? '—' : progressValue,
      description: latestMeasurement
        ? t('today_page.snapshot.progressLatest')
        : t('today_page.snapshot.progressNone'),
      meta: isLoading ? '...' : progressMeta,
      icon: Scale,
      tone: 'green',
      done: measurementsDone,
      ctaLabel: measurementsDone ? 'View body' : 'Log weight',
    },
    {
      to: ROUTES.protocols,
      label: t('today_page.snapshot.protocols'),
      value: isLoading ? '—' : protocolsValue,
      description:
        activeProtocolsList.length > 0
          ? t('today_page.snapshot.protocolsActive')
          : t('today_page.snapshot.protocolsNone'),
      meta: isLoading ? '...' : protocolsMeta,
      icon: Shield,
      tone: 'teal',
      done: protocolsDone,
      ctaLabel: 'View protocols',
    },
  ];

  // ── Adherence — driven by real data ────────────────────────────────────────

  const last7 = recentSessions.filter((s) => {
    if (!s.date) return false;
    const diff = (new Date(todayStr) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  const completedLast7 = last7.filter((s) => s.status === 'completed').length;
  const workoutFreq = activeWorkoutPlan?.frequency || activeWorkoutPlan?.days?.length || 4;
  const workoutAdherence = activeWorkoutPlan
    ? Math.min(100, Math.round((completedLast7 / Math.max(1, workoutFreq)) * 100))
    : 0;

  // Nutrition adherence: based on meals actually logged today (not just plan existence)
  const mealsLoggedToday = todayMeals.length;
  const nutritionAdherence =
    mealsLoggedToday >= 3 ? 100 : mealsLoggedToday === 2 ? 66 : mealsLoggedToday === 1 ? 33 : 0;

  const adherenceSignals = [
    { label: t('today_page.snapshot.nutrition'), value: nutritionAdherence },
    { label: t('today_page.snapshot.workout'), value: workoutAdherence },
  ];
  const adherenceAverage = Math.round(
    adherenceSignals.reduce((t, i) => t + i.value, 0) / adherenceSignals.length,
  );

  const engineScore = mvp?.summary?.consistencyScore ?? null;
  const engineSignals = (mvp?.summary?.consistencyComponents || [])
    .filter((item) => item?.value != null)
    .map((item) => ({ label: item.label, value: item.value }));

  const adherenceScore = engineScore ?? adherenceAverage;
  const adherenceItems = engineSignals.length ? engineSignals : adherenceSignals;

  const nextActionInsight =
    (mvp?.insights || []).find((item) => item?.category === 'next_action') || null;
  const previewTitle = isLoading
    ? t('today_page.insight.loadingTitle')
    : nextActionInsight?.title || t('today_page.insight.defaultTitle');
  const previewDescription = isLoading
    ? t('today_page.insight.loadingDesc')
    : nextActionInsight?.body || t('today_page.insight.defaultDesc');

  // ── Recent activity (last 5 workout sessions) ─────────────────────────────

  const recentActivity = recentSessions.slice(0, 5);

  return (
    <TodayScreen>
      {/* ── Header ── */}
      <header className="flex items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="atlas-overline">Today</p>
          <p className="mt-2 text-[15px] font-medium tracking-[-0.02em] text-[hsl(var(--fg-2))]">
            {getDateLabel()}
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.86)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
          {isLoading ? 'Loading' : `${allDoneCount}/3 complete`}
        </div>
      </header>

      {/* ── Greeting card ── */}
      <TodayCard
        className={cn(
          'relative overflow-hidden rounded-[30px] p-6 shadow-[var(--shadow-md)] sm:p-7',
          heroAmbientClassName
        )}
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.16)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[hsl(var(--accent-secondary)/0.16)] blur-2xl" />

        <div className="relative space-y-6">
          <div className="min-w-0 max-w-3xl">
            <p className="atlas-overline text-[hsl(var(--fg-3))]">
              Daily brief
            </p>
            <h1 className="mt-4 text-[clamp(2.05rem,1.78rem+1.15vw,2.7rem)] font-semibold tracking-[-0.07em] text-[hsl(var(--fg))]">
              {heroGreeting}
            </h1>
            <p className="mt-3 max-w-[34rem] text-[15px] leading-7 text-[hsl(var(--fg-2))]">
              {heroTagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {heroHighlights.map((item) => {
              const Icon = item.Icon;

              return (
                <div
                  key={`${item.label}-${item.value}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.62)] px-3.5 py-2 text-[12px] font-semibold tracking-[-0.012em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)] backdrop-blur-[14px]"
                >
                  {Icon ? (
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', item.tone)} strokeWidth={2} />
                  ) : null}
                  <span className="text-[hsl(var(--fg-3))]">{item.label}</span>
                  <span className={cn('text-[hsl(var(--fg))]', item.tone)}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </TodayCard>

      {/* ── Snapshot cards — 4 pillars ── */}
      <TodaySection
        eyebrow={t('today_page.snapshot.eyebrow')}
        title={t('today_page.snapshot.title')}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-[13px] text-[hsl(var(--fg-2))]">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('today_page.loading')}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {snapshotCards.map((item) => (
              <TodayStatCard
                key={item.label}
                to={item.to}
                label={item.label}
                value={item.value}
                description={item.description}
                meta={item.meta}
                icon={item.icon}
                tone={item.tone}
                done={item.done}
                ctaLabel={item.ctaLabel}
              />
            ))}
          </div>
        )}
      </TodaySection>

      {/* ── Daily summary strip — shown once ≥ 2 pillars are done ── */}
      {showDailySummary && (
        <div className="atlas-card flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] border-[hsl(var(--ok)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.08),transparent_42%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] px-5 py-4 shadow-[var(--shadow-xs)]">
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--ok))]">
            Today so far
          </p>
          {[
            { label: 'Nutrition', done: nutritionDone, detail: nutritionDone ? `${todayMeals.length} entries` : null },
            { label: 'Workout', done: workoutDone, detail: workoutDone ? 'completed' : null },
            { label: 'Measurements', done: measurementsDone, detail: measurementsDone ? 'up to date' : null },
          ].map(({ label, done, detail }) => (
            <span key={label} className={cn(
              'flex items-center gap-1 text-[12px] font-medium',
              done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'
            )}>
              <span>{done ? '✓' : '—'}</span>
              <span>{label}{detail ? ` · ${detail}` : ''}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Adherence + Insight side by side ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodaySection
          eyebrow={t('today_page.adherence.eyebrow')}
          title={t('today_page.adherence.title')}
        >
          <TodayAdherenceCard
            score={isLoading ? 0 : adherenceScore || 0}
            summary={
              isLoading
                ? t('today_page.calculating')
                : adherenceScore >= 70
                  ? t('today_page.adherence.good')
                  : adherenceScore > 0
                    ? t('today_page.adherence.improve')
                    : t('today_page.adherence.configure')
            }
            items={isLoading ? [] : adherenceItems}
          />
        </TodaySection>

        <TodaySection
          eyebrow={t('today_page.insight.eyebrow')}
          title={t('today_page.insight.title')}
        >
          <TodayInsightCard
            to={ROUTES.insights}
            eyebrow={t('today_page.insight.eyebrow')}
            icon={BarChart3}
            title={previewTitle}
            description={previewDescription}
            cta={t('today_page.insight.cta')}
          />
        </TodaySection>
      </div>

      {/* ── Recent activity — last 5 workout sessions ── */}
      {!isLoading && recentActivity.length > 0 && (
        <TodaySection
          eyebrow={t('today_page.activity.eyebrow')}
          title={t('today_page.activity.title')}
        >
          <TodayCard>
            <div className="space-y-0 divide-y divide-[hsl(var(--border)/0.72)]">
              {recentActivity.map((session) => {
                const isCompleted = session.status === 'completed';
                const sessionDate = session.date
                  ? new Date(`${session.date}T12:00:00`).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      },
                    )
                  : '—';

                return (
                  <div
                    key={session.id || `${session.date}-${session.name}`}
                    className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border',
                        isCompleted
                          ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
                          : 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Clock className="h-4 w-4" strokeWidth={2} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[hsl(var(--fg))]">
                        {session.name ||
                          session.workout_type ||
                          t('today_page.activity.fallbackName')}
                      </p>
                      <p className="text-[12px] text-[hsl(var(--fg-3))]">{sessionDate}</p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        isCompleted
                          ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                          : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]',
                      )}
                    >
                      {isCompleted
                        ? t('today_page.completed')
                        : t('today_page.pending')}
                    </span>
                  </div>
                );
              })}
            </div>
          </TodayCard>
        </TodaySection>
      )}

      {/* ── Next steps — action cards ── */}
      <TodaySection
        eyebrow={t('today_page.nextSteps.eyebrow')}
        title={t('today_page.nextSteps.title')}
        description={t('today_page.nextSteps.description')}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {NEXT_STEPS.map((item, index) => (
            <TodayActionCard
              key={item.to}
              to={item.to}
              title={item.title}
              description={item.description}
              icon={item.icon}
              priority={item.phase}
              highlighted={index === 0}
            />
          ))}
        </div>
      </TodaySection>

      {/* ── Quick actions: check-in + block review ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => setCheckinOpen(true)}
          className="atlas-card flex min-h-[104px] items-center gap-4 rounded-[24px] border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-5 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
            <CalendarCheck className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold tracking-[-0.034em] text-[hsl(var(--fg))]">
              Weekly check-in
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Energy, mood, sleep - 30 sec
            </p>
          </div>
        </button>

        <Link
          to={ROUTES.blockReview}
          className="atlas-card flex min-h-[104px] items-center gap-4 rounded-[24px] border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-5 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--accent-secondary)/0.22)] bg-[hsl(var(--accent-secondary)/0.14)] text-[hsl(var(--accent-secondary))]">
            <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold tracking-[-0.034em] text-[hsl(var(--fg))]">
              Review last 4 weeks
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              See what actually worked
            </p>
          </div>
        </Link>
      </div>

      <WeeklyCheckinModal open={checkinOpen} onClose={() => setCheckinOpen(false)} />
    </TodayScreen>
  );
}
