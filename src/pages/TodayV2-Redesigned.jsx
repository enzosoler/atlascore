import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Flame, 
  Target, 
  TrendingUp, 
  UtensilsCrossed,
  Dumbbell,
  ChevronRight,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { buildBriefing, buildRecommendations } from '@/lib/rulesEngine';
import { ROUTES } from '@/lib/routes';
import { getToday } from '@/lib/atlas-theme';
import { supabase } from '@/lib/supabaseClient';
import { getDailyCheckin } from '@/services/checkinService';
import { cn } from '@/lib/utils';
import { DataState } from '@/components/shared/DataState';

function TodayV2Redesigned() {
  const { user } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const { dailyState, isLoading: dailyLoading } = useDailyStateV2();
  const { hasNewInsight, latestInsight } = useAICoach();

  // Today's data queries
  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['today-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const [checkin, nutrition, workouts] = await Promise.all([
        getDailyCheckin(user.id),
        // Add other data queries as needed
      ]);

      return {
        checkin,
        nutrition,
        workouts,
        date: new Date().toISOString().split('T')[0]
      };
    },
    enabled: !!user?.id
  });

  const isLoading = dailyLoading || todayLoading;

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!todayData) return null;

    const checkin = todayData.checkin || {};
    const nutrition = todayData.nutrition || {};
    const workouts = todayData.workouts || {};
    
    return {
      readiness: checkin && checkin.readiness_score ? checkin.readiness_score : 0,
      energy: checkin && checkin.energy ? checkin.energy : 5,
      recovery: checkin && checkin.recovery ? checkin.recovery : 7,
      caloriesConsumed: nutrition && nutrition.calories_consumed ? nutrition.calories_consumed : 0,
      caloriesTarget: 2000, // This would come from user profile
      proteinConsumed: nutrition && nutrition.protein_consumed ? nutrition.protein_consumed : 0,
      workoutCount: workouts && workouts.completed ? workouts.completed : 0,
      activeMinutes: workouts && workouts.active_minutes ? workouts.active_minutes : 0,
      streak: dailyState && dailyState.streak ? dailyState.streak : 0
    };
  }, [todayData, dailyState]);

  const firstName = useMemo(() => {
    if (!user?.full_name) return t('common.athlete');
    return user.full_name.split(' ')[0];
  }, [user?.full_name, t]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('today.greeting.morning');
    if (hour >= 12 && hour < 17) return t('today.greeting.afternoon');
    return t('today.greeting.evening');
  }, [t]);

  const dailyStatus = useMemo(() => {
    if (!metrics) return 'loading';
    
    // Determine daily status based on readiness and completion
    const readinessScore = metrics.readiness;
    const workoutCompleted = metrics.workoutCount > 0;
    
    if (readinessScore >= 8) return 'excellent';
    if (readinessScore >= 6) return 'good';
    if (readinessScore >= 4) return 'moderate';
    return 'needs_attention';
  }, [metrics]);

  const statusColor = useMemo(() => {
    switch (dailyStatus) {
      case 'excellent': return 'hsl(var(--ok))';
      case 'good': return 'hsl(var(--brand))';
      case 'moderate': return 'hsl(var(--warn))';
      case 'needs_attention': return 'hsl(var(--err))';
      default: return 'hsl(var(--fg-3))';
    }
  }, [dailyStatus]);

  const statusLabel = useMemo(() => {
    switch (dailyStatus) {
      case 'excellent': return t('today.status.excellent');
      case 'good': return t('today.status.good');
      case 'moderate': return t('today.status.moderate');
      case 'needs_attention': return t('today.status.needs_attention');
      default: return t('today.status.loading');
    }
  }, [t, dailyStatus]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--card))]/80 backdrop-blur-md border-b border-[hsl(var(--border))/0.5] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">
              {getToday()}, {firstName}
            </h1>
            {/* Streak Chip */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[hsl(var(--brand))/0.1] border border-[hsl(var(--brand))/0.2]">
              <Flame className="h-3 w-3 text-[hsl(var(--brand))]" />
              <span className="text-sm font-medium text-[hsl(var(--fg))]">{metrics?.streak || 0}</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate(ROUTES.settings)}
            className="p-2 rounded-lg hover:bg-[hsl(var(--fill-secondary))] transition-colors"
          >
            <Settings className="h-4 w-4 text-[hsl(var(--fg-2))]" />
          </button>
        </div>
      </header>

      <main className="px-4 py-4 pb-20">
        {isLoading ? (
          <DataState loading />
        ) : !metrics ? (
          <DataState empty title={t('today.no_data')} action={t('today.first_checkin')} />
        ) : (
          <div className="space-y-6">
            {/* Dominant Daily Status Hero - Whoop reference */}
            <div className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--card-hi))] rounded-2xl p-6 shadow-lg border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-1">
                    {t('today.how_is_today_going')}
                  </h2>
                  <p className="text-[hsl(var(--fg-2))]">
                    {statusLabel}
                  </p>
                </div>
                <div 
                  className="w-16 h-16 rounded-full border-4 border-[hsl(var(--border))]"
                  style={{ borderColor: statusColor }}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div 
                      className="w-12 h-12 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-[hsl(var(--fg-3))] mb-1">{t('today.readiness')}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.readiness}/10</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--fg-3))] mb-1">{t('today.energy')}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.energy}/10</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--fg-3))] mb-1">{t('today.recovery')}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.recovery}/10</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-[hsl(var(--border))/0.3] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(metrics.readiness / 10) * 100}%`,
                      backgroundColor: statusColor 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Supporting Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories Card */}
              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                    <h3 className="text-sm font-medium text-[hsl(var(--fg))]">{t('today.nutrition')}</h3>
                  </div>
                  <Link 
                    to={ROUTES.nutrition}
                    className="text-xs text-[hsl(var(--brand))] hover:text-[hsl(var(--brand)/0.8)]"
                  >
                    {t('common.view_all')}
                  </Link>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.caloriesConsumed}</p>
                    <p className="text-xs text-[hsl(var(--fg-3))]">{t('today.of')} {metrics.caloriesTarget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[hsl(var(--fg-3))] mb-1">{t('today.protein')}</p>
                    <p className="text-lg font-semibold text-[hsl(var(--brand))]">{metrics.proteinConsumed}g</p>
                  </div>
                </div>
              </div>

              {/* Workout Card */}
              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                    <h3 className="text-sm font-medium text-[hsl(var(--fg))]">{t('today.workouts')}</h3>
                  </div>
                  <Link 
                    to={ROUTES.workouts}
                    className="text-xs text-[hsl(var(--brand))] hover:text-[hsl(var(--brand)/0.8)]"
                  >
                    {t('common.view_all')}
                  </Link>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.workoutCount}</p>
                    <p className="text-xs text-[hsl(var(--fg-3))]">{t('today.completed')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[hsl(var(--fg-3))] mb-1">{t('today.active_time')}</p>
                    <p className="text-lg font-semibold text-[hsl(var(--ok))]">{metrics.activeMinutes}m</p>
                  </div>
                </div>
              </div>

              {/* AI Coach Card */}
              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))] lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[hsl(var(--brand-ai))]" />
                    <h3 className="text-sm font-medium text-[hsl(var(--fg))]">{t('today.ai_coach')}</h3>
                  </div>
                  {hasNewInsight && (
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--brand-ai))] animate-pulse" />
                  )}
                </div>
                {latestInsight ? (
                  <div>
                    <p className="text-sm text-[hsl(var(--fg))] mb-2">{latestInsight.message}</p>
                    <button
                      onClick={() => navigate('/ai-coach')}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--brand-ai))] text-white py-2 px-4 text-sm font-medium hover:bg-[hsl(var(--brand-ai)/0.9)] transition-colors"
                    >
                      {t('today.view_insight')}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[hsl(var(--fg-3))]">{t('today.no_insights')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Priority Action Strip */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
              <h3 className="text-sm font-medium text-[hsl(var(--fg))] mb-3">{t('today.next_actions')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.workoutCount === 0 && (
                  <button
                    onClick={() => navigate(ROUTES.workouts)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
                  >
                    <Dumbbell className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('today.start_workout')}</span>
                  </button>
                )}
                
                {metrics.caloriesConsumed < metrics.caloriesTarget * 0.8 && (
                  <button
                    onClick={() => navigate(ROUTES.nutrition)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--ok))] text-white hover:bg-[hsl(var(--ok)/0.9)] transition-colors"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('today.log_meal')}</span>
                  </button>
                )}

                <button
                  onClick={() => navigate(ROUTES.measurements)}
                  className="flex items-center gap-2 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--card-hi))] transition-colors"
                >
                  <Target className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                  <span className="text-sm font-medium">{t('today.log_weight')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TodayV2Redesigned;
