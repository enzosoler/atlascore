import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { getActiveDietPlans, createDietPlan, deactivateAllDietPlans } from '@/services/dietPlanService';
import { supabase } from '@/lib/supabaseClient';
import { invokeLLMJson } from '@/lib/llm';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Sparkles, Loader2, UtensilsCrossed, ChevronDown, ChevronUp, ClipboardList, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/lib/SubscriptionContext';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, StatusBanner } from '@/components/shared/StablePage';
import { useT } from '@/lib/i18nContext';

const CREATOR_BADGE  = { ai: 'badge-neutral', coach: 'badge-blue', user: 'badge-neutral' };
const CREATOR_ICONS  = { ai: ClipboardList, coach: Users, user: User };

function MacroChip({ label, value, unit, color }) {
  return (
    <div className="flex flex-col items-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] px-4 py-3">
      <span className="kpi-sm" style={{ color }}>{value ?? '—'}</span>
      <span className="t-caption mt-0.5">{unit}</span>
      <span className="t-label mt-0.5">{label}</span>
    </div>
  );
}

function MealCard({ meal }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="atlas-card rounded-[18px]">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[13px] font-semibold">{meal.name}</p>
            {meal.time && <p className="t-caption">{meal.time}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 t-caption">
            <span>{meal.total_calories ?? 0} kcal</span>
            <span className="hidden sm:inline">P {meal.total_protein ?? 0}g</span>
            <span className="hidden sm:inline">C {meal.total_carbs ?? 0}g</span>
            <span className="hidden sm:inline">G {meal.total_fat ?? 0}g</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-[hsl(var(--border-h))] px-4 pb-3 pt-2 space-y-1.5">
          {(meal.foods || []).map((f, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="text-[hsl(var(--fg))]">{f.name}</span>
              <span className="t-caption ml-3 shrink-0">{f.amount}{f.unit} · {f.kcal}kcal</span>
            </div>
          ))}
          {(!meal.foods || meal.foods.length === 0) && (
            <p className="t-caption">{t('myDiet.no_detailed_foods')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyDiet() {
  const t = useT();
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can } = useSubscription();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        return data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['diet-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await getActiveDietPlans(user.id);
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const plan = plans[0] || null;

  const generate = async () => {
    setGenerating(true);
    setGenError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await invokeLLMJson(
        `Create a detailed diet plan in English for a user with the following profile:
- Goal: ${profile?.training_goal || 'general health'}
- Target calories: ${profile?.calories_target || 0} kcal
- Target protein: ${profile?.protein_target || 160}g
- Target carbs: ${profile?.carbs_target || 250}g
- Target fat: ${profile?.fat_target || 70}g
- Dietary style: ${profile?.dietary_style || 'balanced'}

Create a plan with 5-6 meals distributed throughout the day, with real foods and quantities in grams/units.`,
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            objective: { type: 'string' },
            total_calories: { type: 'number' },
            total_protein: { type: 'number' },
            total_carbs: { type: 'number' },
            total_fat: { type: 'number' },
            meals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  time: { type: 'string' },
                  total_calories: { type: 'number' },
                  total_protein: { type: 'number' },
                  total_carbs: { type: 'number' },
                  total_fat: { type: 'number' },
                  foods: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        amount: { type: 'number' },
                        unit: { type: 'string' },
                        kcal: { type: 'number' },
                        protein: { type: 'number' },
                        carbs: { type: 'number' },
                        fat: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      );

      clearTimeout(timeoutId);

      if (res?.name) {
        // Deactivate previous plans
        try { await deactivateAllDietPlans(user.id); } catch { /* noop */ }
        await createDietPlan(user.id, {
          ...res,
          source: 'ai',
          created_by_type: 'ai',
          active: true,
          version: 1,
          start_date: new Date().toISOString().split('T')[0],
        });
        qc.invalidateQueries({ queryKey: ['diet-plans'] });
        qc.invalidateQueries({ queryKey: ['diet-plans-active'] });
        toast.success(t('myDiet.plan_generated'));
      } else {
        setGenError(t('myDiet.gen_error_structure'));
        toast.error(t('myDiet.gen_error_toast'));
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        setGenError(t('myDiet.gen_timeout'));
        toast.error(t('myDiet.gen_timeout_toast'));
      } else {
        setGenError(t('myDiet.gen_connect_error'));
        toast.error(t('myDiet.gen_error_plan'));
      }
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 t-small text-[hsl(var(--fg-2))]">
      <Loader2 className="w-4 h-4 animate-spin" /> {t('myDiet.loading')}
    </div>
  );

  const CREATOR_LABELS = { ai: t('myDiet.creator_generated'), coach: t('myDiet.creator_coach'), user: t('myDiet.creator_you') };
  const CreatorIcon = plan ? (CREATOR_ICONS[plan.created_by_type] || ClipboardList) : null;

  return (
    <AppContainer maxWidth="max-w-3xl">
      <PageHeader
        eyebrow={t('myDiet.eyebrow')}
        title={t('myDiet.title')}
        subtitle={t('myDiet.subtitle')}
        actions={can('ai_diet_generation') ? (
          <PrimaryButton onClick={generate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {plan ? t('myDiet.build_new_plan') : t('myDiet.build_plan')}
          </PrimaryButton>
        ) : (
          <UpgradeGate feature="ai_diet_generation" plan="Pro" />
        )}
      />

      {genError && (
        <StatusBanner tone="error">{genError}</StatusBanner>
      )}

      {!plan ? (
        <Card className="px-5 py-4">
          <EmptyState
            icon={UtensilsCrossed}
            title={t('myDiet.no_active_plan_title')}
            description={t('myDiet.no_active_plan_desc')}
            action={can('ai_diet_generation') ? (
              <PrimaryButton onClick={generate} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {t('myDiet.build_plan')}
              </PrimaryButton>
            ) : (
              <UpgradeGate feature="ai_diet_generation" plan="Pro" />
            )}
          />
        </Card>
      ) : (
        <>
          <Section eyebrow={t('myDiet.plan_eyebrow')} title={plan.name} subtitle={plan.objective || t('myDiet.plan_subtitle')}>
            <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${CREATOR_BADGE[plan.created_by_type] || 'badge-neutral'} gap-1`}>
                {CreatorIcon && <CreatorIcon className="w-3 h-3" />}
                {CREATOR_LABELS[plan.created_by_type] || t('myDiet.creator_generated')}
              </span>
              <span className="badge badge-neutral">v{plan.version || 1}</span>
            </div>
            {plan.start_date && (
              <p className="t-caption">{t('myDiet.since').replace('{date}', new Date(plan.start_date + 'T12:00').toLocaleDateString())}</p>
            )}
            </Card>
          </Section>

          <Section eyebrow={t('myDiet.totals_eyebrow')} title={t('myDiet.totals_title')} subtitle={t('myDiet.totals_subtitle')}>
            <div className="grid grid-cols-4 gap-2">
              <MacroChip label={t('myDiet.calories_label')} value={plan.total_calories ?? plan.target_calories} unit="kcal" color="hsl(var(--brand))" />
              <MacroChip label={t('myDiet.protein_label')} value={plan.total_protein ?? plan.target_protein} unit="g" color="hsl(var(--accent-primary))" />
              <MacroChip label={t('myDiet.carbs_label')} value={plan.total_carbs ?? plan.target_carbs} unit="g" color="hsl(var(--accent-secondary))" />
              <MacroChip label={t('myDiet.fat_label')} value={plan.total_fat ?? plan.target_fat} unit="g" color="hsl(var(--status-warning))" />
            </div>
          </Section>

          <Section eyebrow={t('myDiet.meals_eyebrow')} title={t('myDiet.meals_title').replace('{n}', String((plan.meals || []).length))} subtitle={t('myDiet.meals_subtitle')}>
            <div className="space-y-2">
              {(plan.meals || []).map((meal, i) => <MealCard key={i} meal={meal} />)}
            </div>
          </Section>

          {plan.notes && (
            <Card className="p-4">
              <p className="t-label mb-1">{t('myDiet.notes_label')}</p>
              <p className="t-body text-[hsl(var(--fg-2))]">{plan.notes}</p>
            </Card>
          )}
        </>
      )}
    </AppContainer>
  );
}
