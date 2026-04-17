import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Play, 
  Plus, 
  Search, 
  Calendar, 
  TrendingUp, 
  Clock,
  Target,
  Activity,
  Zap,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import { getTodayWorkouts } from '@/services/workoutService';
import { cn } from '@/lib/utils';

function WorkoutsV2Redesigned() {
  const { user } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');

  // Today's workouts data
  const { data: workoutsData, isLoading } = useQuery({
    queryKey: ['workouts-today', user?.id],
    queryFn: () => getTodayWorkouts(user?.id),
    enabled: !!user?.id
  });

  const isLoading = isLoading;

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!workoutsData) return null;

    const { completed = 0, totalMinutes = 0, activeMinutes = 0 } = workoutsData;
    
    return {
      workoutCount: completed,
      totalMinutes,
      activeMinutes,
      weeklyVolume: totalMinutes * 1.2, // Rough calculation
      personalRecords: {
        bench: 85, // Would come from actual data
        squat: 120,
        deadlift: 200
      }
    };
  }, [workoutsData]);

  const goals = ['all', 'strength', 'hypertrophy', 'endurance', 'fat_loss'];
  const equipment = ['all', 'bodyweight', 'dumbbells', 'barbell', 'bands', 'kettlebells'];

  const filteredWorkouts = useMemo(() => {
    if (!workoutsData?.workouts) return [];
    
    return workoutsData.workouts.filter(workout => {
      const matchesGoal = selectedGoal === 'all' || workout.goal === selectedGoal;
      const matchesEquipment = selectedEquipment === 'all' || workout.equipment === selectedEquipment;
      return matchesGoal && matchesEquipment;
    });
  }, [workoutsData, selectedGoal, selectedEquipment]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--card))]/80 backdrop-blur-md border-b border-[hsl(var(--border))/0.5] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">
            {t('workouts.title')}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.workouts)}
              className="text-sm text-[hsl(var(--brand))] hover:text-[hsl(var(--brand)/0.8)]"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--fg))/30 border-t-[hsl(var(--fg))]" />
          </div>
        ) : !workoutsData?.workouts || workoutsData.workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">💪</div>
              <h2 className="text-xl font-semibold text-[hsl(var(--fg))] mb-2">
                {t('workouts.no_workouts')}
              </h2>
              <p className="text-[hsl(var(--fg-3))] mb-4">
                {t('workouts.start_first')}
              </p>
              <button
                onClick={() => navigate('/workouts/builder')}
                className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('workouts.create_first')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--fg))] mb-4">
                {t('workouts.discover')}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Goal Filter */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--fg-2))] mb-2">
                    {t('workouts.goal')}
                  </label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full h-11 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[hsl(var(--fg))]"
                  >
                    {goals.map(goal => (
                      <option key={goal} value={goal}>
                        {t(`workouts.goals.${goal}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipment Filter */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--fg-2))] mb-2">
                    {t('workouts.equipment')}
                  </label>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full h-11 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[hsl(var(--fg))]"
                  >
                    {equipment.map(eq => (
                      <option key={eq} value={eq}>
                        {t(`workouts.equipment.${eq}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--fg-3))]" />
                  <input
                    type="text"
                    placeholder={t('workouts.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-10 pr-4 py-2 text-[hsl(var(--fg))]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-5 w-5 text-[hsl(var(--brand))]" />
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.workoutCount}</p>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('workouts.completed_this_week')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[hsl(var(--ok))]" />
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.totalMinutes}</p>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('workouts.minutes_this_week')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-[hsl(var(--warn))]" />
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.activeMinutes}</p>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('workouts.active_minutes')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))] lg:col-span-2">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--brand-ai))]" />
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{metrics.weeklyVolume}</p>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('workouts.weekly_volume')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workout List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-4">
                {t('workouts.recommended')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    to={`/workouts/${workout.id}`}
                    className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-[hsl(var(--fg))] mb-1">
                          {workout.name}
                        </h4>
                        <p className="text-sm text-[hsl(var(--fg-2))] mb-2">
                          {workout.goal && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[hsl(var(--brand))/0.1] rounded-full text-xs text-white">
                              {t(`workouts.goals.${workout.goal}`)}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-[hsl(var(--fg-3))]">
                          {workout.duration && (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span>{formatDuration(workout.duration)}</span>
                            </>
                          )}
                          {workout.equipment && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>{workout.equipment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-[hsl(var(--fg-3))] mb-1">
                          {workout.sets && workout.sets.length > 0 && (
                            <>
                              {t('workouts.sets')}: {workout.sets.length}
                            </>
                          )}
                        </p>
                        <p className="text-lg font-semibold text-[hsl(var(--fg))]">
                          {formatVolume(workout.estimated_volume)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {/* TODO: Start workout */}}
                        className="flex items-center gap-2 px-4 py-3 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors group-hover:scale-[1.02]"
                      >
                        <Play className="h-4 w-4" />
                        {t('workouts.start')}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default WorkoutsV2Redesigned;
