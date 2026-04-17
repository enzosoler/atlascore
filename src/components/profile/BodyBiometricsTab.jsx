import React, { useState, useEffect } from 'react';
import { Save, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { FormField, SelectField } from './ProfileFormField';
import { saveLocalProfile, hasValue, formatNumber } from '@/lib/profileUtils';
import { toast } from 'sonner';

function WeightDirection({ current, target }) {
  if (!hasValue(current) || !hasValue(target)) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
        <Minus className="h-4 w-4" />
        <span>Set both weights to see direction</span>
      </div>
    );
  }
  const delta = Number(target) - Number(current);
  if (delta === 0) return (
    <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--ok))]">
      <Minus className="h-4 w-4" /><span>Maintaining weight</span>
    </div>
  );
  const Icon = delta > 0 ? TrendingUp : TrendingDown;
  const color = delta > 0 ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--warn))]';
  const label = delta > 0 ? `Gain ${formatNumber(Math.abs(delta), { maximumFractionDigits: 1 })} kg` : `Lose ${formatNumber(Math.abs(delta), { maximumFractionDigits: 1 })} kg`;
  return <div className={`flex items-center gap-2 text-[13px] ${color}`}><Icon className="h-4 w-4" /><span>{label}</span></div>;
}

export default function BodyBiometricsTab({ profileData, profileQueryKey }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    date_of_birth: '',
    sex: 'male',
    height: '',
    current_weight: '',
    target_weight: '',
    body_fat_pct: '',
  });

  useEffect(() => {
    if (!profileData) return;
    setForm({
      date_of_birth: profileData.date_of_birth || '',
      sex: profileData.sex || 'male',
      height: profileData.height || '',
      current_weight: profileData.current_weight || '',
      target_weight: profileData.target_weight || '',
      body_fat_pct: profileData.body_fat_pct || '',
    });
  }, [profileData]);

  const saveProfile = useMutation({
    mutationFn: (payload) => saveLocalProfile(user, profileData?.id, payload),
    onSuccess: (result) => {
      qc.setQueryData(profileQueryKey, result);
      setSaved(true);
      toast.success('Body data saved');
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const set = (key) => (e) => {
    const val = typeof e === 'string' ? e : e?.target?.value ?? '';
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    // Compute age from DOB for backward compat
    let age = profileData?.age || '';
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
      }
    }
    saveProfile.mutate({ ...profileData, ...form, age });
  };

  const heightM = Number(form.height) / 100;
  const weightKg = Number(form.current_weight);
  const bmi = heightM > 0 && weightKg > 0 ? weightKg / (heightM * heightM) : null;

  return (
    <div className="space-y-5">
      {/* Basics */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Basics
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Date of birth"
            value={form.date_of_birth}
            onChange={set('date_of_birth')}
            type="date"
            placeholder="1997-01-15"
          />
          <SelectField
            label="Sex"
            value={form.sex}
            onChange={set('sex')}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            description="Used for BMR and calorie calculations"
          />
        </div>
      </section>

      {/* Measurements */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Measurements
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Height"
            value={form.height}
            onChange={set('height')}
            unit="cm"
            placeholder="178"
            min="50" max="300"
          />
          <FormField
            label="Body fat"
            value={form.body_fat_pct}
            onChange={set('body_fat_pct')}
            unit="%"
            placeholder="18"
            min="2" max="60"
            step="0.1"
            description="Optional"
          />
        </div>
      </section>

      {/* Weight */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Weight
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Current weight"
            value={form.current_weight}
            onChange={set('current_weight')}
            unit="kg"
            placeholder="82.4"
            min="20" max="300" step="0.1"
          />
          <FormField
            label="Target weight"
            value={form.target_weight}
            onChange={set('target_weight')}
            unit="kg"
            placeholder="78.0"
            min="20" max="300" step="0.1"
          />
        </div>
        <div className="mt-3 rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
          <WeightDirection current={form.current_weight} target={form.target_weight} />
        </div>
        {bmi !== null && (
          <div className="mt-2 flex items-center justify-between rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
            <span className="text-[13px] text-[hsl(var(--fg-2))]">BMI</span>
            <span className="text-[17px] font-semibold text-[hsl(var(--fg))]">
              {formatNumber(bmi, { maximumFractionDigits: 1 })}
            </span>
          </div>
        )}
      </section>

      <Button onClick={handleSave} disabled={saveProfile.isPending || saved} className="w-full gap-2">
        {saved ? 'Saved ✓' : saveProfile.isPending ? 'Saving...' : (
          <><Save className="h-4 w-4" /> Save body data</>
        )}
      </Button>
    </div>
  );
}
