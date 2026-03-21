import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, ChevronRight, Check } from 'lucide-react';

/**
 * Smart AI wizard — shows a summary of what the system already knows,
 * then asks only for missing or confirmation-needed info.
 *
 * Props:
 *   open, onClose
 *   type: 'diet' | 'workout'
 *   profile: UserProfile object
 *   onGenerate: (wizardAnswers) => Promise<void>
 */
export default function AIGenerateWizard({ open, onClose, type, profile, onGenerate }) {
  const [step, setStep] = useState('review'); // 'review' | 'fill' | 'generating'
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setAnswers(a => ({ ...a, [k]: v }));

  const isDiet = type === 'diet';

  // Missing fields detection
  const missingDiet = [];
  if (!profile?.dietary_style && !profile?.food_preferences) missingDiet.push('restrictions');
  if (!profile?.meals_per_day) missingDiet.push('meals_per_day');

  const missingWorkout = [];
  if (!profile?.training_experience) missingWorkout.push('experience');
  if (!profile?.training_location) missingWorkout.push('location');
  if (!profile?.training_session_minutes) missingWorkout.push('session_minutes');

  const missing = isDiet ? missingDiet : missingWorkout;
  const hasMissing = missing.length > 0;

  const knownItems = isDiet ? [
    profile?.current_weight && `Peso: ${profile.current_weight}kg`,
    profile?.calories_target && `Meta calórica: ${profile.calories_target} kcal`,
    profile?.protein_target && `Proteína alvo: ${profile.protein_target}g`,
    profile?.health_goals?.length && `Objetivo: ${profile.health_goals.join(', ')}`,
    profile?.activity_level && `Atividade: ${profile.activity_level}`,
    profile?.dietary_style && `Estilo: ${profile.dietary_style}`,
    profile?.allergies && `Alergias: ${profile.allergies}`,
    profile?.meals_per_day && `Refeições/dia: ${profile.meals_per_day}`,
  ].filter(Boolean) : [
    profile?.current_weight && `Peso: ${profile.current_weight}kg`,
    profile?.training_goal && `Objetivo: ${profile.training_goal}`,
    profile?.activity_level && `Atividade: ${profile.activity_level}`,
    profile?.training_experience && `Experiência: ${profile.training_experience}`,
    profile?.training_days_per_week && `Frequência: ${profile.training_days_per_week}×/semana`,
    profile?.training_session_minutes && `Duração: ${profile.training_session_minutes}min`,
    profile?.training_location && `Local: ${profile.training_location}`,
    profile?.injuries && `Lesões: ${profile.injuries}`,
  ].filter(Boolean);

  const handleGenerate = async () => {
    setStep('generating');
    setLoading(true);
    try {
      await onGenerate(answers);
      onClose();
    } finally {
      setLoading(false);
      setStep('review');
      setAnswers({});
    }
  };

  const handleReview = () => {
    if (hasMissing) setStep('fill');
    else handleGenerate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border-h))] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <Sparkles className="w-4 h-4 text-[hsl(var(--brand-ai))]" />
            {isDiet ? 'Generate AI Meal Plan' : 'Generate AI Workout'}
          </DialogTitle>
        </DialogHeader>

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-[hsl(var(--fg-2))] mb-3">
                I'll use your current profile data to generate a personalized plan.
              </p>
              <div className="bg-[hsl(var(--shell))] rounded-xl p-3 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-2">What I already know about you</p>
                {knownItems.length > 0 ? knownItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <Check className="w-3 h-3 text-[hsl(var(--ok))] shrink-0" strokeWidth={2.5} />
                    <span>{item}</span>
                  </div>
                )) : (
                  <p className="text-[12px] text-[hsl(var(--fg-2))]">Profile not yet filled — I'll use reasonable defaults.</p>
                )}
              </div>
            </div>

            {hasMissing && (
              <p className="text-[12px] text-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.08)] border border-[hsl(var(--warn)/0.2)] rounded-lg px-3 py-2">
                There are {missing.length} missing piece(s) that improve plan quality. I'll ask you in the next step.
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="btn btn-secondary flex-1 h-10 rounded-xl text-[13px]">
                Cancel
              </button>
              <button onClick={handleReview} className="btn btn-primary flex-1 h-10 rounded-xl text-[13px] gap-1.5">
                {hasMissing ? <>Review <ChevronRight className="w-3.5 h-3.5" /></> : <><Sparkles className="w-3.5 h-3.5" /> Generate now</>}
              </button>
            </div>
          </div>
        )}

        {step === 'fill' && (
          <div className="space-y-4">
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              Only the information missing for maximum personalization:
            </p>

            {isDiet && missing.includes('meals_per_day') && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
                  How many meals per day?
                </label>
                <Select value={String(answers.meals_per_day || '')} onValueChange={v => set('meals_per_day', Number(v))}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n} meals</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isDiet && missing.includes('restrictions') && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
                  Food restrictions or preferences?
                </label>
                <Input
                  value={answers.restrictions || ''}
                  onChange={e => set('restrictions', e.target.value)}
                  placeholder="Ex: No dairy, low-carb, vegetarian..."
                  className="h-10 rounded-lg text-base"
                />
              </div>
            )}
            {!isDiet && missing.includes('experience') && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
                  Training experience level?
                </label>
                <Select value={answers.experience || ''} onValueChange={v => set('experience', v)}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (less than 1 year)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3-6 years)</SelectItem>
                    <SelectItem value="expert">Expert (6+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isDiet && missing.includes('location') && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
                  Training location?
                </label>
                <Select value={answers.location || ''} onValueChange={v => set('location', v)}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Full gym</SelectItem>
                    <SelectItem value="home">Home (no equipment)</SelectItem>
                    <SelectItem value="home_eq">Home (with equipment)</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isDiet && missing.includes('session_minutes') && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
                  Session duration?
                </label>
                <Select value={String(answers.session_minutes || '')} onValueChange={v => set('session_minutes', Number(v))}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60, 75, 90].map(n => <SelectItem key={n} value={String(n)}>{n} minutes</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Always offer muscular focus for workout */}
            {!isDiet && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
                  Muscle focus for today (optional)
                </label>
                <Input
                  value={answers.muscular_focus || ''}
                  onChange={e => set('muscular_focus', e.target.value)}
                  placeholder="Ex: Chest and triceps, Back, Legs..."
                  className="h-10 rounded-lg text-base"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep('review')} className="btn btn-secondary h-10 rounded-xl px-4 text-[13px]">
                Back
              </button>
              <button onClick={handleGenerate} className="btn btn-primary flex-1 h-10 rounded-xl text-[13px] gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Generate now
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--brand-ai))]" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold mb-1">
                {isDiet ? 'Gerando plano alimentar...' : 'Gerando treino...'}
              </p>
              <p className="text-[12px] text-[hsl(var(--fg-2))]">
                A IA está usando seu perfil para personalizar o plano
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}