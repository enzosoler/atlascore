/**
 * Plan — Control Center
 *
 * The single place where the user configures:
 *   1. Goal (cut / bulk / maintain + target weight + deadline)
 *   2. Nutrition targets (kcal, protein, carbs, fat)
 *   3. Training plan (view active plan, link to workouts)
 *   4. Supplements (placeholder)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  UtensilsCrossed,
  Dumbbell,
  Pill,
  ChevronRight,
  Check,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';

// ─── Goal options ──────────────────────────────────────────────────────────────

function getGoals(t) {
  return [
    { key: 'cut',      label: t('planPage.goals.cut'),      description: t('planPage.goals.cutDesc'),      color: 'ok' },
    { key: 'bulk',     label: t('planPage.goals.bulk'),     description: t('planPage.goals.bulkDesc'),     color: 'brand' },
    { key: 'maintain', label: t('planPage.goals.maintain'), description: t('planPage.goals.maintainDesc'), color: 'warn' },
    { key: 'recomp',   label: t('planPage.goals.recomp'),   description: t('planPage.goals.recompDesc'),   color: 'brand' },
  ];
}

const GOAL_COLOR = {
  ok:    'border-[hsl(var(--ok)/0.35)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
  brand: 'border-[hsl(var(--brand)/0.35)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
  warn:  'border-[hsl(var(--warn)/0.35)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
};

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, label, children, action }) {
  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[hsl(var(--border)/0.5)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <p className="text-[14px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">{label}</p>
        </div>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

// ─── Macro input ───────────────────────────────────────────────────────────────

function MacroInput({ label, unit, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.4)] px-3 h-11">
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-[15px] font-semibold text-[hsl(var(--fg))] outline-none"
          placeholder="0"
        />
        <span className="text-[12px] text-[hsl(var(--fg-3))] shrink-0">{unit}</span>
      </div>
    </div>
  );
}

// ─── Main content ──────────────────────────────────────────────────────────────

function PlanContent() {
  const { user } = useAuth();
  const t = useT();
  const queryClient = useQueryClient();
  const GOALS = getGoals(t);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const { data: profileRow, isLoading } = useQuery({
    queryKey: ['profile-plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('training_goal, calories_target, protein_target, carbs_target, fat_target, target_weight, current_weight')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ?? {};
    },
    enabled: !!user?.id,
  });

  const { data: activePlan } = useQuery({
    queryKey: ['active-plan-plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id, name, frequency_per_week, description')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // ── Local state ───────────────────────────────────────────────────────────────
  const [goal, setGoal] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (profileRow) {
      setGoal(profileRow.training_goal ?? '');
      setTargetWeight(profileRow.target_weight ?? '');
      setTargetDate('');
      setCalories(profileRow.calories_target ?? '');
      setProtein(profileRow.protein_target ?? '');
      setCarbs(profileRow.carbs_target ?? '');
      setFat(profileRow.fat_target ?? '');
    }
  }, [profileRow]);

  // ── Save mutation ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        training_goal: goal || null,
        calories_target: Number(calories) || null,
        protein_target: Number(protein) || null,
        carbs_target: Number(carbs) || null,
        fat_target: Number(fat) || null,
        target_weight: targetWeight ? Number(targetWeight) : null,
      };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('planPage.toastUpdated'));
      queryClient.invalidateQueries({ queryKey: ['profile-plan', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-today', user?.id] });
    },
    onError: () => toast.error(t('planPage.toastSaveFailed')),
  });

  const isDirty = profileRow && (
    goal !== (profileRow.training_goal ?? '') ||
    String(targetWeight) !== String(profileRow.target_weight ?? '') ||
    String(calories) !== String(profileRow.calories_target ?? '') ||
    String(protein) !== String(profileRow.protein_target ?? '') ||
    String(carbs) !== String(profileRow.carbs_target ?? '') ||
    String(fat) !== String(profileRow.fat_target ?? '')
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--brand))]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[hsl(var(--bg))]">
      <div className="mx-auto max-w-lg px-4 pt-5 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{t('planPage.title')}</h1>
          {isDirty && (
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 rounded-[12px] bg-[hsl(var(--brand))] px-4 h-9 text-[13px] font-semibold text-white hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-60"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              {t('common.save')}
            </button>
          )}
        </div>

        {/* ── Goal ─────────────────────────────────────────────────────────── */}
        <SectionCard icon={Target} label={t('planPage.goal')}>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {GOALS.map((g) => {
              const isSelected = goal === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => setGoal(g.key)}
                  className={`rounded-[14px] border px-3 py-3 text-left transition-all ${
                    isSelected
                      ? GOAL_COLOR[g.color]
                      : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)] text-[hsl(var(--fg-2))] hover:border-[hsl(var(--border))]'
                  }`}
                >
                  <p className={`text-[13px] font-bold ${isSelected ? '' : 'text-[hsl(var(--fg))]'}`}>{g.label}</p>
                  <p className={`text-[11px] mt-0.5 leading-4 ${isSelected ? 'opacity-80' : 'text-[hsl(var(--fg-3))]'}`}>{g.description}</p>
                </button>
              );
            })}
          </div>

          {/* Target weight + date */}
          <div className="grid grid-cols-2 gap-3">
            <MacroInput label={t('planPage.targetWeight')} unit="kg" value={targetWeight} onChange={setTargetWeight} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
                {t('planPage.targetDate')}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-11 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.4)] px-3 text-[14px] font-medium text-[hsl(var(--fg))] outline-none focus:border-[hsl(var(--brand)/0.5)] appearance-none"
              />
            </div>
          </div>

          {/* Delta to target */}
          {profileRow?.weight_kg && targetWeight && Number(targetWeight) > 0 && (
            <div className="mt-3 rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-3 py-2.5">
              <p className="text-[12px] text-[hsl(var(--fg-2))]">
                {t('planPage.currentWeight')} <strong className="text-[hsl(var(--fg))]">{profileRow.current_weight} kg</strong>
                {' · '}
                {Number(targetWeight) < profileRow.current_weight ? t('planPage.needToLose') : t('planPage.needToGain')}{' '}
                <strong className="text-[hsl(var(--brand))]">
                  {Math.abs(Number(targetWeight) - profileRow.current_weight).toFixed(1)} kg
                </strong>
              </p>
            </div>
          )}
        </SectionCard>

        {/* ── Nutrition Targets ─────────────────────────────────────────────── */}
        <SectionCard icon={UtensilsCrossed} label={t('planPage.nutritionTargets')}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <MacroInput label={t('planPage.calories')} unit="kcal" value={calories} onChange={setCalories} />
            </div>
            <MacroInput label={t('planPage.protein')} unit="g" value={protein} onChange={setProtein} />
            <MacroInput label={t('planPage.carbs')} unit="g" value={carbs} onChange={setCarbs} />
            <MacroInput label={t('planPage.fat')} unit="g" value={fat} onChange={setFat} />
          </div>

          {/* Macro split preview */}
          {(Number(protein) > 0 || Number(carbs) > 0 || Number(fat) > 0) && (() => {
            const proteinKcal = Number(protein) * 4;
            const carbsKcal = Number(carbs) * 4;
            const fatKcal = Number(fat) * 9;
            const total = proteinKcal + carbsKcal + fatKcal || 1;
            return (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">{t('planPage.macroSplit')}</p>
                <div className="flex h-2 overflow-hidden rounded-full gap-0.5">
                  <div className="rounded-full bg-[hsl(var(--brand))]" style={{ width: `${(proteinKcal / total) * 100}%` }} />
                  <div className="rounded-full bg-[hsl(var(--brand-ai))]" style={{ width: `${(carbsKcal / total) * 100}%` }} />
                  <div className="rounded-full bg-[hsl(var(--warn))]" style={{ width: `${(fatKcal / total) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[hsl(var(--fg-3))]">
                  <span>{t('planPage.protein')} {Math.round((proteinKcal / total) * 100)}%</span>
                  <span>{t('planPage.carbs')} {Math.round((carbsKcal / total) * 100)}%</span>
                  <span>{t('planPage.fat')} {Math.round((fatKcal / total) * 100)}%</span>
                </div>
              </div>
            );
          })()}
        </SectionCard>

        {/* ── Training Plan ─────────────────────────────────────────────────── */}
        <SectionCard
          icon={Dumbbell}
          label={t('planPage.trainingPlan')}
          action={
            <Link
              to={ROUTES.workouts}
              className="flex items-center gap-1 text-[12px] font-semibold text-[hsl(var(--brand))] hover:opacity-80"
            >
              {t('planPage.manage')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          }
        >
          {activePlan ? (
            <div className="space-y-2">
              <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">{activePlan.name}</p>
              {activePlan.description && (
                <p className="text-[13px] text-[hsl(var(--fg-2))] leading-5">{activePlan.description}</p>
              )}
              {activePlan.frequency_per_week && (
                <span className="inline-block text-[11px] font-semibold text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] border border-[hsl(var(--brand)/0.2)] rounded-full px-2.5 py-0.5">
                  {activePlan.frequency_per_week}{t('planPage.timesPerWeek')}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] text-[hsl(var(--fg-3))]">{t('planPage.noActivePlan')}</p>
              <Link
                to={ROUTES.workouts}
                className="shrink-0 flex items-center gap-1.5 rounded-[11px] bg-[hsl(var(--brand))] px-3 h-8 text-[12px] font-semibold text-white hover:opacity-90 active:opacity-75 transition-opacity"
              >
                {t('planPage.createPlan')}
              </Link>
            </div>
          )}
        </SectionCard>

        {/* ── Supplements ──────────────────────────────────────────────────── */}
        <SectionCard icon={Pill} label={t('planPage.supplements')}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[hsl(var(--fg-3))]">{t('planPage.supplementsSoon')}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] border border-[hsl(var(--brand)/0.2)] rounded-full px-2.5 py-1">
              {t('planPage.soon')}
            </span>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

export default function Plan() {
  const t = useT();
  return (
    <SafePageBoundary
      title={t('planPage.title')}
      subtitle={t('planPage.subtitle')}
      fallbackDescription={t('planPage.errorFallback')}
    >
      <PlanContent />
    </SafePageBoundary>
  );
}
