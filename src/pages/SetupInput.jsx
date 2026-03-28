import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Ruler, Weight, Target, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { 
  formatWeight, 
  formatHeight, 
  getWeightUnit, 
  getHeightUnit,
  toKilograms, 
  toCentimeters,
  isImperial,
  UNIT_SYSTEMS 
} from '@/lib/units';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

export default function SetupInput() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [unitSystem, setUnitSystem] = useState(UNIT_SYSTEMS.METRIC);
  const [form, setForm] = useState({
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    sex: 'male',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    if (!user) return;
    
    setSaving(true);
    
    // Convert to metric for storage
    const weightKg = form.weight ? toKilograms(parseFloat(form.weight), { unit_system: unitSystem }) : null;
    const heightCm = form.height ? toCentimeters(parseFloat(form.height), { unit_system: unitSystem }) : null;
    const targetWeightKg = form.targetWeight ? toKilograms(parseFloat(form.targetWeight), { unit_system: unitSystem }) : null;
    
    // Save to profile
    const { error } = await supabase
      .from('profiles')
      .update({
        age: parseInt(form.age),
        height: heightCm,
        weight: weightKg,
        target_weight: targetWeightKg,
        sex: form.sex,
        unit_system: unitSystem,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    setSaving(false);
    
    if (!error) {
      navigate('/onboarding/permissions');
    }
  };

  const isComplete = form.age && form.height && form.weight;
  const useImperial = unitSystem === UNIT_SYSTEMS.IMPERIAL;
  const weightUnit = getWeightUnit({ unit_system: unitSystem });
  const heightUnit = getHeightUnit({ unit_system: unitSystem });

  return (
    <div className="mobile-page bg-[hsl(var(--bg))]">
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
        <AtlasCoreLogoSVG width={32} height={16} />
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="safe-scroll flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 text-sm text-[hsl(var(--accent-primary))] font-medium">Step 3 of 4</div>
          <h1 className="text-2xl font-bold mb-2">Your profile</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">This helps us calculate your targets</p>

          <div className="space-y-4">
            {/* Unit System Toggle */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4" /> Unit System
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: UNIT_SYSTEMS.METRIC, label: 'Metric (kg, cm)' },
                  { id: UNIT_SYSTEMS.IMPERIAL, label: 'Imperial (lb, ft/in)' },
                ].map((system) => (
                  <button
                    key={system.id}
                    onClick={() => setUnitSystem(system.id)}
                    className={`p-3 rounded-[14px] border text-sm transition-colors ${
                      unitSystem === system.id
                        ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/10'
                        : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))]'
                    }`}
                  >
                    {system.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" /> Sex
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['male', 'female'].map((sex) => (
                  <button
                    key={sex}
                    onClick={() => updateField('sex', sex)}
                    className={`p-3 rounded-[14px] border capitalize transition-colors ${
                      form.sex === sex
                        ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/10'
                        : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))]'
                    }`}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Target className="w-4 h-4" /> Age
              </label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="25"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Ruler className="w-4 h-4" /> Height ({heightUnit})
              </label>
              <Input
                type={useImperial ? 'text' : 'number'}
                value={form.height}
                onChange={(e) => updateField('height', e.target.value)}
                placeholder={useImperial ? "5'9\" or 69" : '175'}
              />
              {useImperial && (
                <p className="text-[11px] text-[hsl(var(--fg-3))] mt-1">
                  Enter as feet'inches" (e.g., 5'9") or just inches
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Weight className="w-4 h-4" /> Current Weight ({weightUnit})
              </label>
              <Input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                placeholder={useImperial ? '185' : '70'}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Target className="w-4 h-4" /> Target Weight ({weightUnit}) (optional)
              </label>
              <Input
                type="number"
                step="0.1"
                value={form.targetWeight}
                onChange={(e) => updateField('targetWeight', e.target.value)}
                placeholder={useImperial ? '170' : '65'}
              />
            </div>
          </div>

        </motion.div>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-4 border-t border-[hsl(var(--border)/0.4)] bg-[hsl(var(--bg)/0.96)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
        <Button onClick={handleContinue} className="w-full" disabled={!isComplete || saving}>
          {saving ? 'Saving...' : 'Continue'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
