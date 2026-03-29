import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES, ROLE_HOME } from '@/lib/routes';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowRight, 
  ChevronLeft, 
  Check, 
  Zap, 
  Target, 
  Activity, 
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDERS = [
  { id: 'male', label: 'onboarding.sex.male' },
  { id: 'female', label: 'onboarding.sex.female' },
  { id: 'other', label: 'onboarding.sex.other' },
];

const GOALS = [
  { id: 'fat_loss', emoji: '🔥', label: 'onboarding.goals.fat_loss' },
  { id: 'muscle_gain', emoji: '💪', label: 'onboarding.goals.muscle_gain' },
  { id: 'performance', emoji: '🏆', label: 'onboarding.goals.performance' },
  { id: 'health', emoji: '❤️', label: 'onboarding.goals.health' },
];

const TOTAL_STEPS = 3;

// ─── Components ──────────────────────────────────────────────────────────────

const ProgressDots = ({ currentStep }) => (
  <div className="flex gap-1.5 justify-center mb-8">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full transition-all duration-300 ${
          i === currentStep 
            ? 'w-6 bg-[hsl(var(--brand))]' 
            : 'w-2 bg-[hsl(var(--border-h))]'
        }`}
      />
    ))}
  </div>
);

export default function Onboarding() {
  const { user, revalidateSession } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    sex: '',
    age: '',
    height_cm: '',
    current_weight: '',
    health_goals: [],
  });

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleComplete = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Prepare payload
      const payload = {
        id: user.id,
        full_name: formData.full_name,
        sex: formData.sex,
        age: parseInt(formData.age) || 0,
        height_cm: parseFloat(formData.height_cm) || 0,
        current_weight: parseFloat(formData.current_weight) || 0,
        health_goals: formData.health_goals,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      console.log('[Onboarding] Saving payload:', payload);

      // 2. Save to profiles table (Single source of truth)
      const { data, error: saveError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (saveError) {
        console.error('[Onboarding] Supabase error:', saveError);
        throw saveError;
      }

      console.log('[Onboarding] Save successful:', data);

      // 3. Set local fallback to prevent race condition loop
      localStorage.setItem(`onboarding_done_${user.id}`, 'true');

      // 4. Celebrate!
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // 5. Revalidate and Navigate
      const updatedUser = await revalidateSession();
      const target = ROLE_HOME[updatedUser?.atlas_role || user?.atlas_role] || ROUTES.today;
      
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 1000);

    } catch (err) {
      console.error('[Onboarding] Error saving profile:', err);
      const errorMessage = err.message || err.error_description || 'Could not save your profile. Please try again.';
      setError(t('onboarding.error_saving') === 'onboarding.error_saving' ? errorMessage : t('onboarding.error_saving'));
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 0) return formData.full_name.length > 2 && formData.sex;
    if (step === 1) return formData.age && formData.height_cm && formData.current_weight;
    if (step === 2) return formData.health_goals.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <AtlasCoreLogoSVG className="h-8 w-auto mb-4" />
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-[hsl(var(--brand))]">atlas</span>
            <span className="text-[hsl(var(--fg))]">.core</span>
          </h1>
        </div>

        <ProgressDots currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-8 border-[hsl(var(--border)/0.5)] shadow-sm bg-[hsl(var(--card))]">
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold mb-1">{t('onboarding.step1.title') || 'Basic Profile'}</h2>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('onboarding.step1.desc') || 'Let’s start with the basics.'}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t('onboarding.full_name') || 'Full Name'}</Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => updateForm('full_name', e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">{t('onboarding.sex.label') || 'Biological Sex'}</Label>
                      <Select value={formData.sex} onValueChange={(v) => updateForm('sex', v)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder={t('onboarding.sex.placeholder') || 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS.map(g => (
                            <SelectItem key={g.id} value={g.id}>{t(g.label)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold mb-1">{t('onboarding.step2.title') || 'Metrics'}</h2>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('onboarding.step2.desc') || 'Essential data for your plan.'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">{t('onboarding.age') || 'Age'}</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="30"
                        value={formData.age}
                        onChange={(e) => updateForm('age', e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">{t('onboarding.height') || 'Height (cm)'}</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="175"
                          value={formData.height_cm}
                          onChange={(e) => updateForm('height_cm', e.target.value)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">{t('onboarding.weight') || 'Weight (kg)'}</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="75"
                          value={formData.current_weight}
                          onChange={(e) => updateForm('current_weight', e.target.value)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold mb-1">{t('onboarding.step3.title') || 'Your Goal'}</h2>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{t('onboarding.step3.desc') || 'What are you aiming for?'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {GOALS.map(g => {
                      const selected = formData.health_goals.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => updateForm('health_goals', [g.id])} // Single choice for simplicity
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                            ${selected 
                              ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.04)] shadow-sm' 
                              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-h))] hover:bg-[hsl(var(--card-hi))]'
                            }`}
                        >
                          <span className="text-xl">{g.emoji}</span>
                          <span className="flex-1 text-sm font-semibold">{t(g.label)}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${selected ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'}`}>
                            {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 text-xs text-red-500 font-medium">{error}</p>
              )}

              <div className="mt-8 flex gap-3">
                {step > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevStep}
                    disabled={loading}
                    className="h-12 w-12 rounded-xl border border-[hsl(var(--border-h))]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid() || loading}
                  className="flex-1 h-12 rounded-xl text-sm font-semibold gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === TOTAL_STEPS - 1 ? (
                    <>
                      {t('onboarding.finish') || 'Enter Atlas'} 
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {t('onboarding.continue') || 'Continue'} 
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-[11px] text-[hsl(var(--fg-3))] leading-relaxed px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Your data is used to personalize your experience.
        </p>
      </div>
    </div>
  );
}
