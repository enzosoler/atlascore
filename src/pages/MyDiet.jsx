import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { getActiveDietPlans, createDietPlan, deactivateAllDietPlans } from '@/services/dietPlanService';
import { supabase } from '@/lib/supabaseClient';
import { invokeLLMJson } from '@/lib/llm';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Sparkles, Loader2, UtensilsCrossed, ChevronDown, ChevronUp, ClipboardList, User, Users, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/lib/SubscriptionContext';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, StatusBanner } from '@/components/shared/StablePage';
import { useT } from '@/lib/i18nContext';

const CREATOR_BADGE  = { ai: 'badge-neutral', coach: 'badge-blue', user: 'badge-neutral' };
const CREATOR_ICONS  = { ai: ClipboardList, coach: Users, user: User };

const DIET_APPROACHES = [
  { value: 'flexible', label: 'Flexible dieting (IIFYM)', desc: 'Hit your macros — eat anything that fits' },
  { value: 'balanced', label: 'Balanced / whole foods', desc: 'Structured meals with real, nutrient-dense foods' },
  { value: 'vegan', label: 'Vegan', desc: '100% plant-based, no animal products' },
  { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish, dairy and eggs OK' },
  { value: 'pescatarian', label: 'Pescatarian', desc: 'No meat, but fish and seafood OK' },
  { value: 'keto', label: 'Keto / Low-carb', desc: 'Very low carb, high fat' },
  { value: 'paleo', label: 'Paleo', desc: 'Whole foods, no grains, dairy, or processed food' },
  { value: 'mediterranean', label: 'Mediterranean', desc: 'Olive oil, fish, vegetables, whole grains' },
  { value: 'carnivore', label: 'Carnivore', desc: 'Animal products only' },
];

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
  const [showDietSetup, setShowDietSetup] = useState(false);
  const [dietApproach, setDietApproach] = useState('balanced');
  const [allergies, setAllergies] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState(5);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data } = await supabase.from('profiles').select('profile_data, full_name').eq('id', user.id).single();
        const pd = data?.profile_data ?? {};
        return { ...pd, full_name: data?.full_name };
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

  const openDietSetup = () => {
    setDietApproach(profile?.dietary_style || 'balanced');
    setAllergies(profile?.allergies || '');
    setMealsPerDay(profile?.meals_per_day || 5);
    setShowDietSetup(true);
  };

  const generate = async () => {
    setShowDietSetup(false);
    setGenerating(true);
    setGenError(null);

    const isFlexible = dietApproach === 'flexible';
    const approachLabel = DIET_APPROACHES.find(a => a.value === dietApproach)?.label || dietApproach;

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
- Dietary approach: ${approachLabel}
- Meals per day: ${mealsPerDay}
${allergies ? `- Allergies / restrictions: ${allergies}` : ''}

${isFlexible
  ? `This user follows FLEXIBLE DIETING (IIFYM). Do NOT prescribe specific foods. Instead, for each meal provide macro targets (calories, protein, carbs, fat) and a few example food ideas they could use to hit those targets. The user will choose their own foods as long as they hit the macros.`
  : `Create a structured plan with ${mealsPerDay} meals distributed throughout the day, using real foods and quantities in grams/units. All foods must be compatible with a ${approachLabel} diet.`
}`,
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
          <PrimaryButton onClick={openDietSetup} disabled={generating} className="gap-2">
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
              <PrimaryButton onClick={openDietSetup} disabled={generating} className="gap-2">
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
      {/* Diet Setup Dialog */}
      {showDietSetup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowDietSetup(false)}>
          <div className="w-full max-w-lg bg-[hsl(var(--card))] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[hsl(var(--card))] px-5 pt-5 pb-3 border-b border-[hsl(var(--border)/0.3)] flex items-center justify-between">
              <div>
                <p className="text-[17px] font-bold text-[hsl(var(--fg))]">{t('myDiet.setup_title')}</p>
                <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">{t('myDiet.setup_subtitle')}</p>
              </div>
              <button onClick={() => setShowDietSetup(false)} className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Dietary Approach */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-2">{t('myDiet.approach_label')}</p>
                <div className="grid gap-2">
                  {DIET_APPROACHES.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDietApproach(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        dietApproach === opt.value
                          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.06)]'
                          : 'border-[hsl(var(--border)/0.5)] hover:border-[hsl(var(--border))]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        dietApproach === opt.value ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]' : 'border-[hsl(var(--fg-3))]'
                      }`}>
                        {dietApproach === opt.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{opt.label}</p>
                        <p className="text-[11px] text-[hsl(var(--fg-3))]">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals per day */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-2">{t('myDiet.meals_per_day_label')}</p>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setMealsPerDay(n)}
                      className={`flex-1 h-10 rounded-xl border text-[13px] font-medium transition-all ${
                        mealsPerDay === n
                          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]'
                          : 'border-[hsl(var(--border)/0.5)] text-[hsl(var(--fg-2))] hover:border-[hsl(var(--border))]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies / restrictions */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-2">{t('myDiet.allergies_label')}</p>
                <input
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder={t('myDiet.allergies_placeholder')}
                  className="atlas-field h-10 w-full rounded-xl border-0 px-4 text-[13px]"
                />
              </div>
            </div>

            <div className="px-5 pb-5 pt-2">
              <PrimaryButton onClick={generate} className="w-full h-12 gap-2 rounded-xl">
                <Sparkles className="h-4 w-4" />
                {t('myDiet.generate_plan')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

    </AppContainer>
  );
}
