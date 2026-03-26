import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
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
import {
  TodayWorkoutCard,
  TodayNutritionCard,
  TodayProtocolCard,
  TimelineCard,
} from '@/components/dashboard';
import { WeeklyCheckinModal } from '@/components/today/WeeklyCheckinModal';
import FoodCameraScanner from '@/components/nutrition/FoodCameraScanner';
import { formatWeight, formatWeightDiff, isImperial } from '@/lib/units';
import { toast } from 'sonner';

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

function getDateLabel(locale = 'en') {
  return new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
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
  const { subscription, trialDaysRemaining, isTrialExpired } = useSubscription();
  const { t, locale } = useI18n();
  const isEN = locale === 'en-US';
  const isPt = locale === 'pt-BR';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
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

  // Fetch weather data
  useEffect(() => {
    let active = true;
    async function fetchWeather() {
      try {
        // Default to São Paulo if no location
        const lat = -23.5505;
        const lon = -46.6333;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await res.json();
        if (active && data.current_weather) {
          setWeather(data.current_weather);
        }
      } catch (err) {
        console.warn('Weather fetch failed:', err);
      }
    }
    fetchWeather();
    return () => { active = false; };
  }, []);

  // Queries
  const { data: todayMeals = [] } = useQuery({
    queryKey: ['today-meals', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('food_logs')
        .eq('user_id', user.id)
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: todaySession } = useQuery({
    queryKey: ['today-session', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('workout_logs')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: activeWorkoutPlan } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentMeasurements = [] } = useQuery({
    queryKey: ['recent-measurements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurements')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: progressPhotos = [] } = useQuery({
    queryKey: ['progress-photos-count', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_photos')
        .eq('user_id', user.id)
        .limit(1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile-today', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data?.profile_data || {};
    },
    enabled: !!user?.id,
  });

  const nextSteps = useMemo(() => getNextSteps(t, ROUTES, {
    activeWorkoutPlan,
    todaySession,
    todayMealsCount: todayMeals.length,
    recentMeasurementsCount: recentMeasurements.length,
    progressPhotosCount: progressPhotos.length,
  }), [t, activeWorkoutPlan, todaySession, todayMeals.length, recentMeasurements.length, progressPhotos.length]);

  const adherence = useMemo(() => {
    const total = 4;
    let completed = 0;
    if (todayMeals.length > 0) completed++;
    if (todaySession?.status === 'completed') completed++;
    if (recentMeasurements.length > 0) {
      const latest = new Date(recentMeasurements[0].date);
      const diff = (new Date() - latest) / (1000 * 60 * 60 * 24);
      if (diff < 7) completed++;
    }
    if (progressPhotos.length > 0) completed++;
    return Math.round((completed / total) * 100);
  }, [todayMeals.length, todaySession, recentMeasurements, progressPhotos.length]);

  const insights = useMemo(() => generateMvpInsights({
    meals: todayMeals,
    session: todaySession,
    measurements: recentMeasurements,
    profile,
  }), [todayMeals, todaySession, recentMeasurements, profile]);

  const handleCameraCapture = async (file) => {
    setIsSavingMeal(true);
    try {
      // In a real app, we'd upload to S3 and call an AI vision function.
      // For the MVP, we'll simulate a successful scan.
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t('today_page.notifications.mealScanned'));
      queryClient.invalidateQueries(['today-meals']);
    } catch (err) {
      toast.error(t('today_page.notifications.scanFailed'));
    } finally {
      setIsSavingMeal(false);
      setCameraOpen(false);
    }
  };

  return (
    <TodayScreen>
      {/* Hero Section */}
      <TodaySection className={cn('relative overflow-hidden border transition-all duration-500', heroAmbientClassName)}>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <p className="atlas-overline text-[hsl(var(--fg-3))]">{getDateLabel(locale)}</p>
            <h1 className="atlas-display-title text-[2.25rem] leading-[1.1] tracking-[-0.05em]">
              {greeting}, <span className="text-[hsl(var(--brand))]">{preferredName}</span>
            </h1>
          </div>

          {weatherPresentation && (
            <div className="flex flex-col items-end gap-1.5 text-right">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card)/0.8)] shadow-[var(--shadow-xs)]', weatherPresentation.iconClassName)}>
                <weatherPresentation.Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
                {weatherPresentation.label}
              </p>
            </div>
          )}
        </div>

        {/* Adherence Mini-Track */}
        <div className="mt-9 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[12px] font-semibold tracking-[-0.01em]">
              <span className="text-[hsl(var(--fg-2))]">{t('today_page.adherenceLabel')}</span>
              <span className="text-[hsl(var(--brand))]">{adherence}%</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--fill)/0.6)]">
              <div
                className="h-full rounded-full bg-[hsl(var(--brand))] transition-all duration-1000"
                style={{ width: `${adherence}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setCheckinOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card)/0.8)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)] transition-all hover:scale-105 active:scale-95"
          >
            <CalendarCheck className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </TodaySection>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Core Tracking */}
        <div className="space-y-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TodayWorkoutCard
              to={ROUTES.workouts}
              title={todaySession?.name || activeWorkoutPlan?.name || 'No workout planned'}
              subtitle={todaySession?.status === 'completed' ? 'Completed' : 'Pending'}
              primaryLift={activeWorkoutPlan?.exercises?.[0]?.name}
              weight={activeWorkoutPlan?.exercises?.[0]?.sets?.[0]?.weight}
              tags={todaySession ? [todaySession.type || 'strength'] : []}
              stats={[
                { label: 'Duration', value: `${todaySession?.duration_minutes || 0} min`, percentage: Math.min(100, ((todaySession?.duration_minutes || 0) / 60) * 100) },
                { label: 'Effort', value: `${todaySession?.perceived_effort || '--'}/10`, percentage: ((todaySession?.perceived_effort || 0) / 10) * 100 },
              ]}
            />
            <TodayNutritionCard
              to={ROUTES.nutrition}
              calories={todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0)}
              calorieTarget={profile?.targets?.calories}
              macros={{
                protein: todayMeals.reduce((sum, m) => sum + (m.protein_g || 0), 0),
                carbs: todayMeals.reduce((sum, m) => sum + (m.carbs_g || 0), 0),
                fat: todayMeals.reduce((sum, m) => sum + (m.fat_g || 0), 0),
              }}
              macroTargets={profile?.targets}
            />
          </div>

          <TodaySection title={t('today_page.sections.nextSteps')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {nextSteps.map((step, idx) => (
                <TodayActionCard
                  key={idx}
                  {...step}
                  onClick={() => navigate(step.to)}
                />
              ))}
            </div>
          </TodaySection>
        </div>

        {/* Right Column: Insights & Timeline */}
        <div className="space-y-6 lg:col-span-4">
          <TodaySection title={t('today_page.sections.insights')}>
            <div className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <TodayInsightCard key={idx} {...insight} />
                ))
              ) : (
                <Card className="flex flex-col items-center gap-3 px-5 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-3))]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-medium text-[hsl(var(--fg-2))]">
                    {t('today_page.noInsights')}
                  </p>
                </Card>
              )}
            </div>
          </TodaySection>

          <TodaySection title={t('today_page.sections.timeline')}>
            <TimelineCard
              to={ROUTES.workouts}
              events={[
                ...(todaySession ? [{
                  type: todaySession.status === 'completed' ? 'pr' : 'checkin',
                  dateLabel: 'Today',
                  title: todaySession.name || 'Workout',
                  subtitle: `${todaySession.status} · ${todaySession.duration_minutes || 0} min`,
                  to: ROUTES.workouts,
                }] : []),
                ...(todayMeals.length > 0 ? [{
                  type: 'nutrition',
                  dateLabel: 'Today',
                  title: `${todayMeals.length} meals logged`,
                  subtitle: `${todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0)} calories`,
                  to: ROUTES.nutrition,
                }] : []),
                ...(recentMeasurements.length > 0 ? [{
                  type: 'checkin',
                  dateLabel: recentMeasurements[0].date,
                  title: 'Measurement recorded',
                  subtitle: `${recentMeasurements[0].weight || '--'} kg`,
                  to: ROUTES.measurements,
                }] : []),
              ]}
            />
          </TodaySection>
        </div>
      </div>

      {/* Modals */}
      <WeeklyCheckinModal
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        user={user}
      />

      {cameraOpen && (
        <FoodCameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setCameraOpen(false)}
          isProcessing={isSavingMeal}
        />
      )}
    </TodayScreen>
  );
}
