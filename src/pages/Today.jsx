import React, { useEffect, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Dumbbell,
  Loader2,
  Scale,
  Shield,
  Sparkles,
  SunMedium,
  UtensilsCrossed,
  CalendarCheck,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { getGreeting } from '@/lib/atlas-theme';
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

function getPreferredName(displayName) {
  if (!displayName) return null;
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function getDateLabel(locale) {
  return new Intl.DateTimeFormat(locale === 'en-US' ? 'en-US' : 'pt-BR', {
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
      label: isEnglish ? 'Clear' : 'Sol',
      tone: 'clear',
      iconClassName: 'text-[hsl(var(--warn))]',
    };
  }

  if (code === 1) {
    return {
      Icon: CloudSun,
      label: isEnglish ? 'Mostly clear' : 'Sol entre nuvens',
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
      label: isEnglish ? 'Fog' : 'Névoa',
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
    label: isEnglish ? 'Conditions' : 'Clima',
    tone: 'default',
    iconClassName: 'text-[hsl(var(--fg-2))]',
  };
}

function getNextSteps(t, locale, ROUTES, {
  activeWorkoutPlan,
  todaySession,
  todayMealsCount,
  recentMeasurementsCount,
  progressPhotosCount,
}) {
  const isEnglish = locale === 'en-US';

  return [
    {
      to: ROUTES.nutrition,
      title: todayMealsCount > 0 ? (isEnglish ? 'Review nutrition' : 'Revisar nutrição') : t('today_page.nextSteps.nutritionTitle'),
      description: todayMealsCount > 0
        ? isEnglish
          ? `You already logged ${todayMealsCount} food item${todayMealsCount > 1 ? 's' : ''} today. Keep the day complete.`
          : `Você já registrou ${todayMealsCount} alimento${todayMealsCount > 1 ? 's' : ''} hoje. Mantenha o dia completo.`
        : t('today_page.nextSteps.nutritionDesc'),
      icon: UtensilsCrossed,
      phase: t('today_page.nextSteps.nutritionPhase'),
    },
    {
      to: ROUTES.workouts,
      title: !activeWorkoutPlan
        ? isEnglish ? 'Create workout plan' : 'Criar plano de treino'
        : todaySession?.status === 'completed'
          ? isEnglish ? 'Review workout log' : 'Revisar treino registrado'
          : isEnglish ? 'Start workout' : 'Iniciar treino',
      description: !activeWorkoutPlan
        ? isEnglish
          ? 'Build your active training plan first so Today, history and execution all point to the same structure.'
          : 'Monte primeiro seu plano de treino ativo para que Hoje, histórico e execução apontem para a mesma estrutura.'
        : todaySession?.status === 'completed'
          ? isEnglish
            ? 'Open the completed session, review the numbers and prepare the next training day.'
            : 'Abra a sessão concluída, revise os números e prepare o próximo dia de treino.'
          : isEnglish
            ? 'Launch the active plan and log sets, reps and load from the structured session.'
            : 'Abra o plano ativo e registre séries, repetições e carga a partir da sessão estruturada.',
      icon: Dumbbell,
      phase: t('today_page.nextSteps.workoutPhase'),
    },
    {
      to: ROUTES.measurements,
      title: recentMeasurementsCount > 0
        ? isEnglish ? 'Review measurements' : 'Revisar medidas'
        : isEnglish ? 'Log measurement' : 'Registrar medida',
      description: recentMeasurementsCount > 0
        ? isEnglish
          ? 'Keep body weight and circumference checkpoints current so progress trends stay trustworthy.'
          : 'Mantenha peso e circunferências atualizados para que as tendências de progresso continuem confiáveis.'
        : isEnglish
          ? 'Add body weight and body measurements so progress tracking starts with a real baseline.'
          : 'Adicione peso e medidas corporais para que o acompanhamento de progresso comece com uma base real.',
      icon: Scale,
      phase: isEnglish ? 'Body' : 'Corpo',
    },
    {
      to: progressPhotosCount > 0 ? ROUTES.atlasAI : ROUTES.progressPhotos,
      title: progressPhotosCount > 0 ? t('today_page.nextSteps.aiTitle') : isEnglish ? 'Add progress photo' : 'Adicionar foto de progresso',
      description: progressPhotosCount > 0
        ? t('today_page.nextSteps.aiDesc')
        : isEnglish
          ? 'Capture a dated visual checkpoint so your photo timeline evolves with the rest of your data.'
          : 'Capture um checkpoint visual com data para que sua linha do tempo de fotos evolua junto com o restante dos dados.',
      icon: progressPhotosCount > 0 ? Brain : Sparkles,
      phase: progressPhotosCount > 0 ? t('today_page.nextSteps.aiPhase') : isEnglish ? 'Photos' : 'Fotos',
    },
  ];
}

// ── Simple rules-based insight generator ──────────────────────────────────────
// Priority order: missing data warnings → positive streaks → protocol info → default
function buildInsight(
  t,
  locale,
  {
    recentSessions,
    todayMeals,
    recentMeasurements,
    activeProtocolsList,
    activeDietPlan,
    activeWorkoutPlan,
    todayStr,
  },
) {
  const last7 = recentSessions.filter((s) => {
    if (!s.date) return false;
    const diff = (new Date(todayStr) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  const completedLast7 = last7.filter((s) => s.status === 'completed').length;

  // 1. No workouts this week despite having an active plan
  if (activeWorkoutPlan && completedLast7 === 0) {
    return {
      title: t('today_page.insight.noWorkoutsTitle'),
      description: t('today_page.insight.noWorkoutsDesc'),
    };
  }

  // 2. No meals logged today despite having an active diet plan
  if (activeDietPlan && todayMeals.length === 0) {
    return {
      title: t('today_page.insight.noMealsTitle'),
      description: t('today_page.insight.noMealsDesc'),
    };
  }

  // 3. No measurements ever (new user prompt)
  if (recentMeasurements.length === 0) {
    return {
      title: t('today_page.insight.noMeasurementsTitle'),
      description: t('today_page.insight.noMeasurementsDesc'),
    };
  }

  // 4. No measurements in the last 30 days (lapsed tracking)
  const thirtyAgoStr = (() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  })();
  const hasRecentMeasure = recentMeasurements.some((m) => m.date && m.date >= thirtyAgoStr);
  if (!hasRecentMeasure) {
    return {
      title: t('today_page.insight.oldMeasurementsTitle'),
      description: t('today_page.insight.oldMeasurementsDesc'),
    };
  }

  // 5. Great workout consistency this week
  if (completedLast7 >= 4) {
    return {
      title:
        locale === 'en-US'
          ? `${completedLast7} workouts completed in the last 7 days.`
          : `${completedLast7} treinos concluídos nos últimos 7 dias.`,
      description: t('today_page.insight.workoutConsistencyDesc'),
    };
  }
  if (completedLast7 >= 2) {
    return {
      title:
        locale === 'en-US'
          ? `${completedLast7} workouts completed this week.`
          : `${completedLast7} treinos concluídos esta semana.`,
      description: t('today_page.insight.workoutGoodDesc'),
    };
  }

  // 6. Active protocol info
  if (activeProtocolsList.length > 0) {
    const p = activeProtocolsList[0];
    const since = p.start_date
      ? new Date(`${p.start_date}T12:00:00`).toLocaleDateString(
          locale === 'en-US' ? 'en-US' : 'pt-BR',
          {
            day: 'numeric',
            month: 'short',
          },
        )
      : null;
    const count = activeProtocolsList.length;
    const protocolWord =
      locale === 'en-US'
        ? `${count} active protocol${count > 1 ? 's' : ''}.`
        : `${count} protocolo${count > 1 ? 's' : ''} ativo${count > 1 ? 's' : ''}.`;
    return {
      title: protocolWord,
      description: since
        ? `${p.name || (locale === 'en-US' ? 'Protocol' : 'Protocolo')} ${t('today_page.insight.protocolDescWith').replace('{date}', since)}`
        : t('today_page.insight.protocolDescDefault'),
    };
  }

  // Default
  return {
    title: t('today_page.insight.defaultTitle'),
    description: t('today_page.insight.defaultDesc'),
  };
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
  const { role, loading: isRoleLoading } = useRole(user);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const displayName = user?.full_name || user?.email || t('today_page.fallbackName');
  const preferredName = getPreferredName(displayName) || t('today_page.fallbackName');
  const greeting = getGreeting(locale);
  const isAdmin = !isRoleLoading && role === 'admin';
  const isEN = locale === 'en-US';
  const weatherPresentation = weather
    ? getWeatherPresentation(weather.weathercode, locale)
    : null;
  const heroGreeting = `${greeting}, ${preferredName}`;
  const heroTagline = isEN
    ? 'See what’s on track, what needs attention, and the next move that matters.'
    : 'Veja o que está em dia, o que pede atenção e o próximo passo que mais importa.';
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
      const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(20);
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
      const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
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
    loadingDiet ||
    loadingWorkout ||
    loadingSessions ||
    loadingMeals ||
    loadingMeasurements ||
    loadingProgressPhotos ||
    loadingProtocols;

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeDietPlan = activeDietPlans[0] || null;
  const activeWorkoutPlan = activeWorkoutPlans[0] || null;
  const todayMeals = recentMeals.filter((m) => m.date === todayStr);
  const activeProtocolsList = allProtocols.filter((p) => p.active && !p.end_date);
  const latestMeasurement = recentMeasurements[0] || null;
  const todaySession = recentSessions.find((s) => s.date === todayStr);

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
        locale === 'en-US' ? 'en-US' : 'pt-BR',
        {
          day: 'numeric',
          month: 'short',
        },
      )
    : t('today_page.addMeasurement');

  const protocolsValue = String(activeProtocolsList.length);
  const protocolsMeta =
    activeProtocolsList.length > 0
      ? `${activeProtocolsList.length} ${activeProtocolsList.length > 1 ? (locale === 'en-US' ? 'active' : 'ativos') : (locale === 'en-US' ? 'active' : 'ativo')}`
      : t('today_page.noActive');

  const NEXT_STEPS = getNextSteps(t, locale, ROUTES, {
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
      ctaLabel: nutritionDone
        ? (isEN ? 'Review today' : 'Revisar hoje')
        : (isEN ? 'Log meals' : 'Registrar refeições'),
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
        ? (isEN ? 'Review session' : 'Ver sessão')
        : !activeWorkoutPlan
          ? (isEN ? 'Create plan' : 'Criar plano')
          : (isEN ? 'Start session' : 'Iniciar sessão'),
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
      ctaLabel: measurementsDone
        ? (isEN ? 'View body' : 'Ver medidas')
        : (isEN ? 'Log weight' : 'Registrar peso'),
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
      ctaLabel: isEN ? 'View protocols' : 'Ver protocolos',
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

  // ── Dynamic data-driven insight ────────────────────────────────────────────

  const insight = isLoading
    ? {
        title: t('today_page.insight.loadingTitle'),
        description: t('today_page.insight.loadingDesc'),
      }
    : buildInsight(t, locale, {
        recentSessions,
        todayMeals,
        recentMeasurements,
        activeProtocolsList,
        activeDietPlan,
        activeWorkoutPlan,
        todayStr,
      });

  // ── Recent activity (last 5 workout sessions) ─────────────────────────────

  const recentActivity = recentSessions.slice(0, 5);

  return (
    <TodayScreen>
      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="atlas-overline">{getDateLabel(locale)}</p>
          <h1 className="mt-3 text-[34px] font-bold tracking-[-0.07em] text-[hsl(var(--fg))]">
            {t('today_page.heading')}
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.9)_0%,hsl(var(--card))_100%)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
      </header>

      {/* ── Greeting card ── */}
      <TodayCard
        className={cn(
          'relative overflow-hidden rounded-[26px] p-5 shadow-[var(--shadow-md)] sm:p-6',
          heroAmbientClassName
        )}
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.16)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[hsl(var(--accent-secondary)/0.16)] blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="atlas-overline text-[hsl(var(--fg-3))]">
              {isEN ? 'Daily brief' : 'Resumo do dia'}
            </p>
            <p className="mt-4 text-[clamp(1.9rem,1.55rem+1.4vw,2.45rem)] font-bold tracking-[-0.07em] text-[hsl(var(--fg))]">
              {heroGreeting}
            </p>
            <p className="mt-3 max-w-[32rem] text-[15px] leading-6 text-[hsl(var(--fg-2))]">
              {heroTagline}
            </p>
          </div>

          {weather && weatherPresentation ? (
            <div className="mt-0.5 shrink-0 rounded-[18px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.54)] px-3.5 py-3 text-right shadow-[var(--shadow-xs)] backdrop-blur-[14px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
                {isEN ? 'Weather' : 'Clima'}
              </p>
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <weatherPresentation.Icon className={cn('h-4 w-4 shrink-0', weatherPresentation.iconClassName)} strokeWidth={2.1} />
                <span className="font-mono text-[22px] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
                  {weather.temperature}°
                </span>
              </div>
              <p className="mt-1 text-[12px] font-medium text-[hsl(var(--fg-2))]">
                {weatherPresentation.label}
              </p>
            </div>
          ) : null}
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
        <div className="rounded-2xl border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.05)] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--ok))] shrink-0">
            {isEN ? 'Today so far' : 'Hoje até agora'}
          </p>
          {[
            { label: isEN ? 'Nutrition' : 'Nutrição', done: nutritionDone, detail: nutritionDone ? `${todayMeals.length} ${isEN ? 'entries' : 'entradas'}` : null },
            { label: isEN ? 'Workout' : 'Treino', done: workoutDone, detail: workoutDone ? (isEN ? 'completed' : 'concluído') : null },
            { label: isEN ? 'Measurements' : 'Medidas', done: measurementsDone, detail: measurementsDone ? (isEN ? 'up to date' : 'em dia') : null },
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
            score={isLoading ? 0 : adherenceAverage}
            summary={
              isLoading
                ? t('today_page.calculating')
                : adherenceAverage >= 70
                  ? t('today_page.adherence.good')
                  : adherenceAverage > 0
                    ? t('today_page.adherence.improve')
                    : t('today_page.adherence.configure')
            }
            items={isLoading ? [] : adherenceSignals}
          />
        </TodaySection>

        <TodaySection
          eyebrow={t('today_page.insight.eyebrow')}
          title={t('today_page.insight.title')}
        >
          <TodayInsightCard
            to={ROUTES.insights}
            eyebrow={t('today_page.insight.eyebrow')}
            icon={Brain}
            title={insight.title}
            description={insight.description}
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
            <div className="space-y-3">
              {recentActivity.map((session) => {
                const isCompleted = session.status === 'completed';
                const sessionDate = session.date
                  ? new Date(`${session.date}T12:00:00`).toLocaleDateString(
                      locale === 'en-US' ? 'en-US' : 'pt-BR',
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
                    className="flex items-center gap-3"
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
          className="atlas-card rounded-[24px] border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] shadow-[var(--shadow-sm)] flex items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
            <CalendarCheck className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {isEN ? 'Weekly check-in' : 'Check-in semanal'}
            </p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              {isEN ? 'Energy, mood, sleep — 30 sec' : 'Energia, humor, sono — 30 seg'}
            </p>
          </div>
        </button>

        <Link
          to={ROUTES.blockReview}
          className="atlas-card rounded-[24px] border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] shadow-[var(--shadow-sm)] flex items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--accent-secondary)/0.22)] bg-[hsl(var(--accent-secondary)/0.14)] text-[hsl(var(--accent-secondary))]">
            <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {isEN ? 'Review last 4 weeks' : 'Revisar últimas 4 semanas'}
            </p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              {isEN ? 'See what actually worked' : 'Veja o que realmente funcionou'}
            </p>
          </div>
        </Link>
      </div>

      <WeeklyCheckinModal open={checkinOpen} onClose={() => setCheckinOpen(false)} />
    </TodayScreen>
  );
}
