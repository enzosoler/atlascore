import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useT, useI18n } from '@/lib/i18nContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import {
  Smile,
  Moon,
  Droplets,
  UtensilsCrossed,
  Dumbbell,
  BarChart3,
  Pill,
  Minus,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { getToday } from '@/lib/atlas-theme';
import {
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  DateStepper,
  SafePageBoundary,
  shiftDate,
} from '@/components/shared/StablePage';
import { cn } from '@/lib/utils';
import { getDailyCheckin } from '@/services/checkinService';
import { updateWorkout, deleteWorkout } from '@/services/workoutService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─────────────────────────────────────────────────────────────────
// Sub-components reusing the same patterns as the other pages
// ─────────────────────────────────────────────────────────────────

function HeroStat({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function SectionMetric({ label, value, suffix }) {
  return (
    <div className="bg-[hsl(var(--card)/0.86)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        {suffix ? (
          <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

function ScoreDots({ value, max = 5 }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full transition-colors',
            i < value ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--border))]'
          )}
        />
      ))}
    </div>
  );
}

function EmptySlot({ message }) {
  return (
    <div className="flex items-center gap-2 py-5 px-5 text-[13px] text-[hsl(var(--fg-2))]">
      <Minus className="h-3.5 w-3.5 opacity-40 shrink-0" strokeWidth={2} />
      {message}
    </div>
  );
}

function SectionIconHeader({ icon: Icon, color, label }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border)/0.5)]">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.6)]"
        style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}
      >
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.9} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────

export default function Diary() {
  const t = useT();
  return (
    <SafePageBoundary
      title={t('diary.title')}
      subtitle={t('diary.subtitle')}
      fallbackDescription={t('diary.fallback_description')}
    >
      <DiaryContent />
    </SafePageBoundary>
  );
}

function DiaryContent() {
  const t = useT();
  const { locale } = useI18n();
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(getToday());
  const isToday = date === getToday();

  // ── Editing State ─────────────────────────────────────────────
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // ── Queries ────────────────────────────────────────────────────

  const { data: checkin = null } = useQuery({
    queryKey: ['diary-checkin', date],
    queryFn: async () => {
      if (!user?.id) return null;
      return getDailyCheckin(user.id, date);
    },
    enabled: !!user?.id,
  });

  const { data: meals = [] } = useQuery({
    queryKey: ['diary-food-logs', date, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, food_name, calories, protein, carbs, fat, date, created_at')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((log) => ({
        id: log.id,
        date: log.date,
        title: log.food_name || 'Food',
        total_calories: Number(log.calories || 0),
        total_protein: Number(log.protein || 0),
        total_carbs: Number(log.carbs || 0),
        total_fat: Number(log.fat || 0),
      }));
    },
    enabled: !!user?.id,
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['diary-workouts', date],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('workouts')
        .select('id, name, status, completed_at, exercises, exercises_completed, duration_minutes, volume_load, perceived_effort, notes, plan_id')
        .eq('user_id', user.id)
        .gte('completed_at', `${date}T00:00:00`)
        .lte('completed_at', `${date}T23:59:59`)
        .order('completed_at', { ascending: true });
      return (data || []).map(w => ({
        ...w,
        date,
        name: w.name || w.status || 'Workout',
      }));
    },
    enabled: !!user?.id,
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['diary-measurements', date],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Show doses logged for the selected date (protocol_id links log → plan)
  const { data: supplements = [] } = useQuery({
    queryKey: ['diary-supplements', date],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('protocols')
        .select('id, substance_name, name, dose, unit, frequency, active')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('start_date', { ascending: false })
        .limit(20);
      return (data || []).map(p => ({
        id: p.id,
        name: p.substance_name || p.name || 'Protocol',
        dose: p.dose,
        unit: p.unit,
        frequency: p.frequency,
        active: p.active,
      }));
    },
    enabled: !!user?.id,
  });

  // ── Handlers ───────────────────────────────────────────────────

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setIsEditModalOpen(true);
  };

  const handleSaveWorkout = async (updates) => {
    if (!editingWorkout?.id) return;

    try {
      await updateWorkout(editingWorkout.id, updates);
      toast.success(t('diary.workout_updated'));
      setIsEditModalOpen(false);
      setEditingWorkout(null);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['diary-workouts', date] });
      queryClient.invalidateQueries({ queryKey: ['workout-history', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recent-workouts', user?.id] });
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error(t('diary.workout_update_error'));
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm(t('diary.workout_delete_confirm'))) {
      return;
    }

    try {
      await deleteWorkout(workoutId);
      toast.success(t('diary.workout_deleted'));
      queryClient.invalidateQueries({ queryKey: ['diary-workouts', date] });
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error(t('diary.workout_delete_error'));
    }
  };

  // ── Valores derivados ──────────────────────────────────────────

  const totalCal      = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtein  = meals.reduce((s, m) => s + (m.total_protein || 0), 0);
  const totalCarbs    = meals.reduce((s, m) => s + (m.total_carbs || 0), 0);
  const totalFat      = meals.reduce((s, m) => s + (m.total_fat || 0), 0);
  const measurement   = measurements[0] || null;
  const doneWorkouts  = workouts.filter((w) => w.status === 'completed').length;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <AppContainer>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        eyebrow={t('diary.title')}
        title={t('diary.page_subtitle')}
        subtitle={t('diary.page_subtitle_detail')}
        accentClassName="from-[hsl(var(--brand)/0.07)] via-[hsl(var(--brand)/0.02)]"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DateStepper
              date={date}
              onChange={(amount) => setDate(shiftDate(date, amount))}
            />
            {isToday && (
              <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand)/0.1)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--brand))]">
                {t('diary.today_badge')}
              </span>
            )}
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat
            label={t('diary.daily_energy_label')}
            value={totalCal > 0 ? `${Math.round(totalCal)} kcal` : '—'}
            detail={
              meals.length > 0
                ? t('diary.meals_detail').replace('{n}', String(meals.length)).replace('{protein}', String(Math.round(totalProtein)))
                : t('diary.no_meals')
            }
          />
          <HeroStat
            label={t('diary.checkin_label')}
            value={
              checkin
                ? t('diary.checkin_value').replace('{mood}', String(checkin.mood ?? '—')).replace('{energy}', String(checkin.energy ?? '—'))
                : '—'
            }
            detail={
              checkin
                ? t('diary.checkin_detail').replace('{sleep}', String(checkin.sleep_hours || 0)).replace('{water}', String(checkin.hydration_liters || 0))
                : t('diary.no_checkin')
            }
          />
          <HeroStat
            label={t('diary.workouts_label')}
            value={workouts.length > 0 ? t('diary.workouts_value').replace('{n}', String(workouts.length)) : '—'}
            detail={
              workouts.length > 0
                ? t('diary.workouts_detail').replace('{n}', String(doneWorkouts))
                : t('diary.no_workouts_recorded')
            }
          />
        </div>
      </PageHeader>

      {/* ── Nutrition ───────────────────────────────────────────── */}
      <Section
        eyebrow={t('diary.title')}
        title={meals.length > 0 ? t('diary.nutrition_section_title').replace('{n}', String(Math.round(totalCal))) : t('diary.nutrition_section_title_empty')}
        subtitle={t('diary.nutrition_section_subtitle')}
        actions={null}
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={UtensilsCrossed}
            color="hsl(var(--brand, #0A84FF))"
            label={t('diary.nutrition_label')}
          />

          {meals.length === 0 ? (
            <EmptySlot message={t('diary.no_meals')} />
          ) : (
            <>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {meals.map((m) => (
                  <div key={m.id} className="px-5 py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                        {m.title}
                      </p>
                      <span className="shrink-0 text-[13px] font-semibold text-[hsl(var(--fg))]">
                        {Math.round(m.total_calories)}{' '}
                        <span className="text-[11px] font-medium text-[hsl(var(--fg-2))]">kcal</span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex gap-4 text-[12px] text-[hsl(var(--fg-2))]">
                      <span>P {Math.round(m.total_protein)}g</span>
                      <span>C {Math.round(m.total_carbs)}g</span>
                      <span>G {Math.round(m.total_fat)}g</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-px bg-[hsl(var(--border)/0.6)] sm:grid-cols-3">
                <SectionMetric label={t('diary.protein_label')} value={`${Math.round(totalProtein)}`} suffix="g" />
                <SectionMetric label={t('diary.carbs_label')} value={`${Math.round(totalCarbs)}`} suffix="g" />
                <SectionMetric label={t('diary.fat_label')} value={`${Math.round(totalFat)}`} suffix="g" />
              </div>
            </>
          )}
        </Card>
      </Section>

      {/* ── Check-in ────────────────────────────────────────────── */}
      <Section
        eyebrow={t('diary.title')}
        title={t('diary.checkin_section_title')}
        subtitle={t('diary.checkin_section_subtitle')}
        actions={null}
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={Smile}
            color="hsl(var(--ok, #34C759))"
            label={t('diary.checkin_label')}
          />

          {!checkin ? (
            <EmptySlot message={t('diary.no_checkin')} />
          ) : (
            <div className="px-5 py-5 space-y-5">
              {/* Metrics grid */}
              <div className="grid gap-px overflow-hidden rounded-[20px] bg-[hsl(var(--border)/0.6)] sm:grid-cols-2">
                <SectionMetric label={t('diary.mood_label')} value={`${checkin.mood ?? '—'}`} suffix={checkin.mood != null ? '/5' : ''} />
                <SectionMetric label={t('diary.energy_label')} value={`${checkin.energy ?? '—'}`} suffix={checkin.energy != null ? '/5' : ''} />
                <SectionMetric
                  label={t('diary.sleep_label')}
                  value={`${checkin.sleep_hours || 0}`}
                  suffix="h"
                />
                <SectionMetric
                  label={t('diary.hydration_label')}
                  value={`${checkin.hydration_liters || 0}`}
                  suffix="L"
                />
              </div>

              {/* Visual score dots */}
              {(checkin.mood != null || checkin.energy != null) && (
                <div className="space-y-3">
                  {checkin.mood != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                        <Smile className="h-3.5 w-3.5" strokeWidth={1.9} />
                        {t('diary.mood_inline')}
                      </div>
                      <ScoreDots value={checkin.mood} max={5} />
                    </div>
                  )}
                  {checkin.energy != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                        <Moon className="h-3.5 w-3.5" strokeWidth={1.9} />
                        {t('diary.energy_inline')}
                      </div>
                      <ScoreDots value={checkin.energy} max={5} />
                    </div>
                  )}
                  {checkin.hydration_liters != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                        <Droplets className="h-3.5 w-3.5" strokeWidth={1.9} />
                        {t('diary.hydration_inline')}
                      </div>
                      <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                        {checkin.hydration_liters}L
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notas */}
              {checkin.notes && (
                <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))] mb-1.5">
                    {t('diary.notes_label')}
                  </p>
                  <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{checkin.notes}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Workouts ─────────────────────────────────────────────── */}
      <Section
        eyebrow={t('diary.title')}
        title={workouts.length > 0 ? t('diary.workouts_section_title').replace('{n}', String(workouts.length)) : t('diary.workouts_section_title_empty')}
        subtitle={t('diary.workouts_section_subtitle')}
        actions={null}
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={Dumbbell}
            color="hsl(var(--brand-ai, #8B5CF6))"
            label={t('diary.workouts_label_header')}
          />

          {workouts.length === 0 ? (
            <EmptySlot message={t('diary.no_workouts_recorded')} />
          ) : (
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {workouts.map((w) => {
                const done = w.status === 'completed';
                return (
                  <div key={w.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                          {w.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-[12px] text-[hsl(var(--fg-2))]">
                          {w.duration_minutes > 0 && <span>{w.duration_minutes} min</span>}
                          {w.volume_load > 0 && (
                            <span>{w.volume_load.toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US')} kg vol.</span>
                          )}
                          {w.perceived_effort > 0 && <span>RPE {w.perceived_effort}</span>}
                        </div>
                        {(w.exercises?.length > 0 || w.exercises_completed?.length > 0) && (
                          <p className="mt-1.5 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
                            {(w.exercises_completed || w.exercises || []).map((e) => e.name).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                            done
                              ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                              : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(34_68%_32%)]'
                          )}
                        >
                          {done ? t('diary.done_badge') : t('diary.pending_badge')}
                        </span>
                        <button
                          onClick={() => handleEditWorkout(w)}
                          className="p-1.5 rounded-full hover:bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
                          title={t('diary.edit_workout_title')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(w.id)}
                          className="p-1.5 rounded-full hover:bg-[hsl(var(--err)/0.1)] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--err))] transition-colors"
                          title={t('diary.delete_workout_title')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Measurements ─────────────────────────────────────────── */}
      <Section
        eyebrow={t('diary.title')}
        title={t('diary.measurements_section_title')}
        subtitle={t('diary.measurements_section_subtitle')}
        actions={null}
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={BarChart3}
            color="hsl(var(--warn, #FF9F0A))"
            label={t('diary.measurements_label')}
          />

          {!measurement ? (
            <EmptySlot message={t('diary.no_measurements')} />
          ) : (
            <div className="grid gap-px bg-[hsl(var(--border)/0.6)] sm:grid-cols-2">
              {measurement.weight != null && (
                <SectionMetric label={t('diary.weight_label')} value={`${measurement.weight}`} suffix="kg" />
              )}
              {measurement.body_fat != null && (
                <SectionMetric
                  label={t('diary.body_fat_label')}
                  value={`${measurement.body_fat}`}
                  suffix="%"
                />
              )}
              {measurement.waist != null && (
                <SectionMetric label={t('diary.waist_label')} value={`${measurement.waist}`} suffix="cm" />
              )}
              {measurement.arms != null && (
                <SectionMetric label={t('diary.arms_label')} value={`${measurement.arms}`} suffix="cm" />
              )}
              {measurement.chest != null && (
                <SectionMetric label={t('diary.chest_label')} value={`${measurement.chest}`} suffix="cm" />
              )}
              {measurement.hips != null && (
                <SectionMetric label={t('diary.hips_label')} value={`${measurement.hips}`} suffix="cm" />
              )}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Suplementos ─────────────────────────────────────────── */}
      <Section
        eyebrow={t('diary.title')}
        title={
          supplements.length > 0
            ? t('diary.supplements_section_title').replace('{n}', String(supplements.length))
            : t('diary.supplements_section_title_empty')
        }
        subtitle={t('diary.supplements_section_subtitle')}
        actions={null}
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={Pill}
            color="hsl(var(--ok, #34C759))"
            label={t('diary.supplements_label')}
          />

          {supplements.length === 0 ? (
            <EmptySlot message={t('diary.no_supplements')} />
          ) : (
            <div className="flex flex-wrap gap-2 px-5 py-5">
              {supplements.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] px-3.5 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))]"
                >
                  {s.name}
                  {s.dose ? ` · ${s.dose}` : ''}
                </span>
              ))}
            </div>
          )}
        </Card>
      </Section>
      {/* ── Edit Workout Modal ─────────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[32rem]">
          <DialogHeader>
            <DialogTitle>{t('diary.edit_workout_dialog_title')}</DialogTitle>
          </DialogHeader>
          {editingWorkout && (
            <WorkoutEditForm
              workout={editingWorkout}
              onSave={handleSaveWorkout}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingWorkout(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppContainer>
  );
}

// ─────────────────────────────────────────────────────────────────
// Workout Edit Form Component
// ─────────────────────────────────────────────────────────────────

function WorkoutEditForm({ workout, onSave, onCancel }) {
  const t = useT();
  const [formData, setFormData] = useState({
    name: workout.name || '',
    completed_at: workout.completed_at ? new Date(workout.completed_at).toISOString().slice(0, 16) : '',
    duration_minutes: workout.duration_minutes || 0,
    volume_load: workout.volume_load || 0,
    perceived_effort: workout.perceived_effort || 0,
    status: workout.status || 'completed',
    notes: workout.notes || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      duration_minutes: Number(formData.duration_minutes),
      volume_load: Number(formData.volume_load),
      perceived_effort: Number(formData.perceived_effort),
      completed_at: new Date(formData.completed_at).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('diary.workout_name_label')}</label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={t('diary.workout_name_placeholder')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('diary.date_time_label')}</label>
        <Input
          type="datetime-local"
          value={formData.completed_at}
          onChange={(e) => handleChange('completed_at', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('diary.duration_label')}</label>
          <Input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', e.target.value)}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('diary.volume_label')}</label>
          <Input
            type="number"
            value={formData.volume_load}
            onChange={(e) => handleChange('volume_load', e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('diary.rpe_label')}</label>
        <Input
          type="number"
          value={formData.perceived_effort}
          onChange={(e) => handleChange('perceived_effort', e.target.value)}
          min="1"
          max="10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('diary.status_label')}</label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
        >
          <option value="completed">{t('diary.status_completed')}</option>
          <option value="pending">{t('diary.status_pending')}</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('diary.notes_form_label')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder={t('diary.notes_placeholder')}
          rows={3}
          className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {t('diary.cancel')}
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {t('diary.save_changes')}
        </Button>
      </div>
    </form>
  );
}
