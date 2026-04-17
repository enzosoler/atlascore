import React, { useState, useEffect } from 'react';
import { Save, Zap, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { FormField, SelectField, TextAreaField } from './ProfileFormField';
import { saveLocalProfile, hasValue, formatNumber, calculateMetabolicTargets } from '@/lib/profileUtils';
import { saveBMRSnapshot } from '@/services/bodyProgressService';
import { toast } from 'sonner';

const GOAL_OPTIONS = [
  { value: '', label: 'Select a goal' },
  { value: 'fat_loss', label: 'Lose fat' },
  { value: 'muscle_gain', label: 'Gain muscle' },
  { value: 'recomp', label: 'Body recomposition' },
  { value: 'strength', label: 'Build strength' },
  { value: 'performance', label: 'Improve performance' },
  { value: 'health', label: 'General health' },
  { value: 'longevity', label: 'Longevity' },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'beginner', label: 'Beginner (< 1 year)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'advanced', label: 'Advanced (3+ years)' },
];

const ACTIVITY_OPTIONS = [
  { value: '', label: 'Select activity level' },
  { value: 'sedentary', label: 'Sedentary (desk job)' },
  { value: 'light', label: 'Lightly active' },
  { value: 'moderate', label: 'Moderately active' },
  { value: 'active', label: 'Very active' },
  { value: 'very_active', label: 'Extremely active' },
];

const EQUIPMENT_OPTIONS = [
  { value: '', label: 'Select equipment' },
  { value: 'full_gym', label: 'Full gym' },
  { value: 'home_basic', label: 'Home — basic (dumbbells, bands)' },
  { value: 'home_advanced', label: 'Home — advanced (rack, barbell)' },
  { value: 'bodyweight', label: 'Bodyweight only' },
  { value: 'calisthenics_park', label: 'Calisthenics park' },
];

function MetabolicEstimator({ profileData, onApply }) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState({
    sex: profileData?.sex || 'male',
    age: profileData?.age || '',
    weight_kg: profileData?.current_weight || '',
    height_cm: profileData?.height || '',
    strength_sessions: profileData?.training_frequency || 3,
    cardio_sessions: 1,
    occupation: 'sedentary',
    goal: profileData?.training_goal || '',
  });

  useEffect(() => {
    if (!profileData) return;
    setInputs((prev) => ({
      ...prev,
      sex: profileData.sex || prev.sex,
      age: profileData.age || prev.age,
      weight_kg: profileData.current_weight || prev.weight_kg,
      height_cm: profileData.height || prev.height_cm,
      strength_sessions: profileData.training_frequency || prev.strength_sessions,
      goal: profileData.training_goal || prev.goal,
    }));
  }, [profileData]);

  const set = (key) => (e) => {
    const val = typeof e === 'string' ? e : e?.target?.value ?? e;
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const result = calculateMetabolicTargets(inputs);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[20px] border border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand)/0.05)] px-5 py-4 text-left transition-colors hover:bg-[hsl(var(--brand)/0.09)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
            <Calculator className="h-4 w-4" strokeWidth={1.9} />
          </div>
          <div>
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">Metabolic estimator</p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">Calculate BMR, TDEE, and macro targets</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" />}
      </button>

      {open && (
        <div className="mt-3 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Sex" value={inputs.sex} onChange={set('sex')} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
            <FormField label="Age" value={inputs.age} onChange={set('age')} unit="years" placeholder="28" min="10" max="100" />
            <FormField label="Weight" value={inputs.weight_kg} onChange={set('weight_kg')} unit="kg" placeholder="80" min="30" max="300" step="0.1" />
            <FormField label="Height" value={inputs.height_cm} onChange={set('height_cm')} unit="cm" placeholder="178" min="100" max="250" />
            <FormField label="Strength sessions/week" value={inputs.strength_sessions} onChange={set('strength_sessions')} unit="/wk" placeholder="3" min="0" max="14" />
            <FormField label="Cardio sessions/week" value={inputs.cardio_sessions} onChange={set('cardio_sessions')} unit="/wk" placeholder="1" min="0" max="14" />
          </div>

          {result ? (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'BMR', value: `${result.bmr} kcal` },
                  { label: 'TDEE', value: `${result.tdee} kcal` },
                  { label: 'Target', value: `${result.target_kcal} kcal`, highlight: true },
                  { label: 'Protein', value: `${result.protein_g}g` },
                ].map((item) => (
                  <div key={item.label} className={`rounded-[16px] border px-3 py-3 ${item.highlight ? 'border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.07)]' : 'border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.5)]'}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{item.label}</p>
                    <p className={`mt-1 text-[16px] font-semibold tracking-[-0.03em] ${item.highlight ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg))]'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3 text-[13px] text-[hsl(var(--fg-2))]">
                P {result.protein_g}g · C {result.carbs_g}g · F {result.fat_g}g
              </div>
              <Button type="button" className="mt-4 w-full gap-2" onClick={() => { onApply({ calories_target: String(result.target_kcal), protein_target: String(result.protein_g), carbs_target: String(result.carbs_g), fat_target: String(result.fat_g), _bmr: result.bmr, _tdee: result.tdee }); setOpen(false); }}>
                <Zap className="h-4 w-4" strokeWidth={1.9} /> Apply targets
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-[13px] text-[hsl(var(--fg-2))]">Fill in sex, age, weight, and height to calculate.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default function FitnessSetupTab({ profileData, profileQueryKey }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    training_goal: '',
    fitness_level: '',
    activity_level: '',
    equipment_access: '',
    injuries_notes: '',
    calories_target: '',
    protein_target: '',
    carbs_target: '',
    fat_target: '',
    water_target: '',
  });

  useEffect(() => {
    if (!profileData) return;
    setForm({
      training_goal: profileData.training_goal || '',
      fitness_level: profileData.fitness_level || '',
      activity_level: profileData.activity_level || '',
      equipment_access: profileData.equipment_access || '',
      injuries_notes: profileData.injuries_notes || '',
      calories_target: profileData.calories_target || '',
      protein_target: profileData.protein_target || '',
      carbs_target: profileData.carbs_target || '',
      fat_target: profileData.fat_target || '',
      water_target: profileData.water_target || '',
    });
  }, [profileData]);

  const saveProfile = useMutation({
    mutationFn: (payload) => saveLocalProfile(user, profileData?.id, payload),
    onSuccess: (result) => {
      qc.setQueryData(profileQueryKey, result);
      setSaved(true);
      toast.success('Fitness setup saved');
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const set = (key) => (e) => {
    const val = typeof e === 'string' ? e : e?.target?.value ?? '';
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleApplyEstimate = (estimated) => {
    const { _bmr, _tdee, ...formFields } = estimated;
    setForm((prev) => ({ ...prev, ...formFields }));
    setSaved(false);
    if (user?.id && (_bmr || _tdee)) {
      saveBMRSnapshot(user.id, { bmr: _bmr ?? null, tdee: _tdee ?? null, date: new Date().toISOString().split('T')[0] }).catch(() => {});
    }
  };

  const handleSave = () => {
    saveProfile.mutate({ ...profileData, ...form });
  };

  const totalCalories = Number(form.calories_target) || 0;
  const proteinCals = (Number(form.protein_target) || 0) * 4;
  const carbsCals = (Number(form.carbs_target) || 0) * 4;
  const fatCals = (Number(form.fat_target) || 0) * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  return (
    <div className="space-y-5">
      {/* Training profile */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Training profile
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Primary goal" value={form.training_goal} onChange={set('training_goal')} options={GOAL_OPTIONS} />
          <SelectField label="Experience level" value={form.fitness_level} onChange={set('fitness_level')} options={LEVEL_OPTIONS} />
          <SelectField label="Activity level" value={form.activity_level} onChange={set('activity_level')} options={ACTIVITY_OPTIONS} />
          <SelectField label="Equipment access" value={form.equipment_access} onChange={set('equipment_access')} options={EQUIPMENT_OPTIONS} />
        </div>
      </section>

      {/* Injuries */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Injuries & limitations
        </h3>
        <TextAreaField
          label="Notes"
          value={form.injuries_notes}
          onChange={set('injuries_notes')}
          placeholder="e.g. Shoulder impingement — avoid overhead pressing. Lower back pain — no heavy deadlifts."
          rows={3}
          description="AI workout generation will avoid exercises that conflict with these notes"
        />
      </section>

      {/* Metabolic estimator */}
      <MetabolicEstimator profileData={profileData} onApply={handleApplyEstimate} />

      {/* Nutrition targets */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Nutrition targets
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Calories" value={form.calories_target} onChange={set('calories_target')} unit="kcal" placeholder="2200" min="500" max="10000" step="50" />
          <FormField label="Water" value={form.water_target} onChange={set('water_target')} unit="L" placeholder="3.0" min="0.5" max="10" step="0.1" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <FormField label="Protein" value={form.protein_target} onChange={set('protein_target')} unit="g" placeholder="160" min="0" max="500" step="5"
            description={hasValue(form.protein_target) && totalCalories ? `${Math.round((proteinCals / totalCalories) * 100)}%` : ''} />
          <FormField label="Carbs" value={form.carbs_target} onChange={set('carbs_target')} unit="g" placeholder="240" min="0" max="1000" step="5"
            description={hasValue(form.carbs_target) && totalCalories ? `${Math.round((carbsCals / totalCalories) * 100)}%` : ''} />
          <FormField label="Fat" value={form.fat_target} onChange={set('fat_target')} unit="g" placeholder="60" min="0" max="300" step="5"
            description={hasValue(form.fat_target) && totalCalories ? `${Math.round((fatCals / totalCalories) * 100)}%` : ''} />
        </div>
        {totalMacroCals > 0 && totalCalories > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3 text-[13px]">
            <span className="text-[hsl(var(--fg-2))]">Macro total</span>
            <span className={Math.abs(totalMacroCals - totalCalories) < 50 ? 'font-semibold text-[hsl(var(--ok))]' : 'font-semibold text-[hsl(var(--warn))]'}>
              {formatNumber(totalMacroCals)} / {formatNumber(totalCalories)} kcal
            </span>
          </div>
        )}
      </section>

      <Button onClick={handleSave} disabled={saveProfile.isPending || saved} className="w-full gap-2">
        {saved ? 'Saved ✓' : saveProfile.isPending ? 'Saving...' : (
          <><Save className="h-4 w-4" /> Save fitness setup</>
        )}
      </Button>
    </div>
  );
}
