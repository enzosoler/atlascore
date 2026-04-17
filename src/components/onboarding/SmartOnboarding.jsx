import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  User,
  Target,
  Activity,
  UtensilsCrossed,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Calculator,
  Calendar,
  Zap,
  Scale,
  Dumbbell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateMaintenanceCalories,
  calculateMacros,
  estimateBodyFatBMI,
  calculateBodyComposition 
} from '@/lib/bodyMath';

const GOAL_OPTIONS = [
  {
    id: 'cut',
    name: 'Cut',
    description: 'Lose fat while preserving muscle',
    color: 'from-red-500 to-orange-500',
    deficit: 500, // 500 calorie deficit
    rate: '0.5-0.8 kg per week',
  },
  {
    id: 'maintain',
    name: 'Maintain',
    description: 'Keep current composition',
    color: 'from-blue-500 to-cyan-500',
    deficit: 0,
    rate: 'Maintain weight',
  },
  {
    id: 'bulk',
    name: 'Bulk',
    description: 'Gain muscle with minimal fat',
    color: 'from-green-500 to-emerald-500',
    deficit: -300, // 300 calorie surplus
    rate: '0.2-0.4 kg per week',
  },
];

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    name: 'Sedentary',
    description: 'Little to no exercise',
    multiplier: 1.2,
    examples: 'Desk job, no exercise',
  },
  {
    id: 'light',
    name: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    multiplier: 1.375,
    examples: 'Walking, light gym work',
  },
  {
    id: 'moderate',
    name: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    multiplier: 1.55,
    examples: 'Regular gym sessions, sports',
  },
  {
    id: 'active',
    name: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    multiplier: 1.725,
    examples: 'Athlete, manual labor',
  },
  {
    id: 'very_active',
    name: 'Extremely Active',
    description: 'Very hard exercise, physical job',
    multiplier: 1.9,
    examples: 'Professional athlete, construction',
  },
];

const NUTRITION_MODES = [
  {
    id: 'structured',
    name: 'Structured Plan',
    description: 'Get exact meal plans',
    icon: UtensilsCrossed,
  },
  {
    id: 'flexible',
    name: 'Flexible Macros',
    description: 'Track macros with food freedom',
    icon: Calculator,
  },
];

export default function SmartOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTargets, setGeneratedTargets] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    height_cm: '',
    current_weight: '',
    target_weight: '',
    activity_level: '',
    goal: '',
    nutrition_mode: '',
    training_experience: '',
    weekly_workouts: '',
    workout_duration: '',
    sleep_hours: '',
    stress_level: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTargets = () => {
    const {
      age,
      sex,
      height_cm,
      current_weight,
      target_weight,
      activity_level,
      goal,
      nutrition_mode,
    } = formData;

    // Convert to numbers
    const age_num = parseInt(age);
    const height_m = parseFloat(height_cm) / 100;
    const weight_kg = parseFloat(current_weight);
    const target_weight_kg = parseFloat(target_weight);

    // Calculate BMR and TDEE
    const bmr = calculateBMR(weight_kg, parseFloat(height_cm), age_num, sex);
    const tdee = calculateTDEE(bmr, activity_level);
    const maintenance = calculateMaintenanceCalories(weight_kg, parseFloat(height_cm), age_num, sex, activity_level);

    // Get goal settings
    const goalData = GOAL_OPTIONS.find(g => g.id === goal);
    const targetCalories = maintenance - goalData.deficit;

    // Estimate body fat (simplified)
    const estimatedBodyFat = estimateBodyFatBMI(weight_kg, height_m, age_num, sex);
    const bodyComposition = calculateBodyComposition(weight_kg, estimatedBodyFat);

    // Calculate macros
    const macros = calculateMacros(
      weight_kg,
      bodyComposition.lean_mass,
      goal,
      activity_level,
      maintenance,
      targetCalories
    );

    // Calculate time to goal
    const weightDifference = Math.abs(target_weight_kg - weight_kg);
    const weeklyRate = Math.abs(goalData.deficit) / 7700; // kg per week
    const weeksToGoal = weightDifference / weeklyRate;

    // Generate training recommendations
    const trainingRecs = generateTrainingRecommendations(goal, activity_level, formData.training_experience);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      maintenance: Math.round(maintenance),
      target_calories: Math.round(targetCalories),
      macros,
      body_composition: bodyComposition,
      estimated_body_fat: estimatedBodyFat,
      weeks_to_goal: Math.round(weeksToGoal),
      weekly_rate: weeklyRate.toFixed(2),
      training_recommendations: trainingRecs,
      goal_data: goalData,
    };
  };

  const generateTrainingRecommendations = (goal, activityLevel, experience) => {
    const baseRecs = {
      frequency: 3,
      duration: 45,
      intensity: 'moderate',
      focus: ['compound_movements'],
    };

    // Adjust based on goal
    if (goal === 'cut') {
      baseRecs.frequency = 4;
      baseRecs.duration = 50;
      baseRecs.focus.push(['cardio', 'hiit']);
    } else if (goal === 'bulk') {
      baseRecs.frequency = 4;
      baseRecs.duration = 60;
      baseRecs.intensity = 'high';
      baseRecs.focus.push(['progressive_overload']);
    }

    // Adjust based on activity level
    if (activityLevel === 'sedentary' || activityLevel === 'light') {
      baseRecs.frequency = Math.max(3, baseRecs.frequency - 1);
    } else if (activityLevel === 'active' || activityLevel === 'very_active') {
      baseRecs.duration = Math.min(75, baseRecs.duration + 15);
    }

    // Adjust based on experience
    if (experience === 'beginner') {
      baseRecs.intensity = 'low';
      baseRecs.focus = ['full_body', 'form'];
    } else if (experience === 'advanced') {
      baseRecs.frequency = Math.min(6, baseRecs.frequency + 1);
      baseRecs.focus.push(['periodization']);
    }

    return baseRecs;
  };

  const handleNext = () => {
    if (step === 5) {
      // Calculate targets
      const targets = calculateTargets();
      setGeneratedTargets(targets);
      setStep(6);
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      // Save onboarding data
      await supabase.from('onboarding_data').upsert({
        user_id: user.id,
        completed: true,
        data: formData,
        generated_targets: generatedTargets,
        completed_at: new Date().toISOString(),
      });

      // Update user profile
      await supabase.from('user_profiles').upsert({
        user_id: user.id,
        onboarding_completed: true,
        current_goal: formData.goal,
        nutrition_mode: formData.nutrition_mode,
        target_calories: generatedTargets.target_calories,
        target_protein: generatedTargets.macros.protein,
        target_carbs: generatedTargets.macros.carbs,
        target_fat: generatedTargets.macros.fat,
        current_phase: 'starting',
        phase_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success('Welcome to Atlas Core! Your personalized system is ready.');
      navigate('/today');
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.age && formData.sex && formData.height_cm && formData.current_weight;
      case 2:
        return formData.target_weight && formData.activity_level;
      case 3:
        return formData.goal;
      case 4:
        return formData.nutrition_mode;
      case 5:
        return formData.training_experience && formData.weekly_workouts;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <GoalsStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <GoalSelectionStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <NutritionModeStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <TrainingStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <TargetsPreview targets={generatedTargets} formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--brand)/0.05)] to-[hsl(var(--brand)/0.02)]">
      <div className="container mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[hsl(var(--brand))]" />
              <span className="text-sm font-medium text-[hsl(var(--fg))]">Setup Your Atlas</span>
            </div>
            <span className="text-sm text-[hsl(var(--fg-2))]">
              Step {step} of {generatedTargets ? 6 : 5}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[hsl(var(--border)/0.3)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] transition-all duration-500"
              style={{ width: `${(step / (generatedTargets ? 6 : 5)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto">
          {renderStep()}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] px-6 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))] disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Previous
            </button>

            {step === 6 ? (
              <button
                onClick={handleFinish}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start Your Journey
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicInfoStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-2">Tell us about yourself</h2>
        <p className="text-[hsl(var(--fg-2))]">This helps us calculate your personal targets</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="25"
            className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Sex</label>
          <select
            value={formData.sex}
            onChange={(e) => updateFormData('sex', e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Height (cm)</label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) => updateFormData('height_cm', e.target.value)}
            placeholder="178"
            className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Current Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.current_weight}
            onChange={(e) => updateFormData('current_weight', e.target.value)}
            placeholder="82.5"
            className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
          />
        </div>
      </div>
    </div>
  );
}

function GoalsStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-2">Set your targets</h2>
        <p className="text-[hsl(var(--fg-2))]">What are you working towards?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Target Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          value={formData.target_weight}
          onChange={(e) => updateFormData('target_weight', e.target.value)}
          placeholder="78.0"
          className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-4">Activity Level</label>
        <div className="space-y-3">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => updateFormData('activity_level', level.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                formData.activity_level === level.id
                  ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                  : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[hsl(var(--fg))]">{level.name}</h4>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{level.description}</p>
                  <p className="text-xs text-[hsl(var(--fg-3))] mt-1">{level.examples}</p>
                </div>
                {formData.activity_level === level.id && (
                  <CheckCircle className="h-5 w-5 text-[hsl(var(--brand))]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalSelectionStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-2">Choose your goal</h2>
        <p className="text-[hsl(var(--fg-2))]">This determines your nutrition and training approach</p>
      </div>

      <div className="space-y-4">
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => updateFormData('goal', goal.id)}
            className={`w-full text-left rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
              formData.goal === goal.id
                ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${goal.color} text-white`}>
                <Target className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">{goal.name}</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-2">{goal.description}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[hsl(var(--brand))]" />
                  <span className="text-sm font-medium text-[hsl(var(--brand))]">{goal.rate}</span>
                </div>
              </div>
              {formData.goal === goal.id && (
                <CheckCircle className="h-6 w-6 text-[hsl(var(--brand))]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NutritionModeStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-2">How do you want to eat?</h2>
        <p className="text-[hsl(var(--fg-2))]">Choose your nutrition approach</p>
      </div>

      <div className="space-y-4">
        {NUTRITION_MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => updateFormData('nutrition_mode', mode.id)}
              className={`w-full text-left rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                formData.nutrition_mode === mode.id
                  ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                  : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand))] text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">{mode.name}</h3>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{mode.description}</p>
                </div>
                {formData.nutrition_mode === mode.id && (
                  <CheckCircle className="h-6 w-6 text-[hsl(var(--brand))]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrainingStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-2">Training experience</h2>
        <p className="text-[hsl(var(--fg-2))]">Help us design your workout plan</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Training Experience</label>
          <select
            value={formData.training_experience}
            onChange={(e) => updateFormData('training_experience', e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
          >
            <option value="">Select</option>
            <option value="beginner">Beginner (0-1 years)</option>
            <option value="intermediate">Intermediate (1-3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--fg))] mb-2">Workouts per week</label>
          <input
            type="number"
            min="1"
            max="7"
            value={formData.weekly_workouts}
            onChange={(e) => updateFormData('weekly_workouts', e.target.value)}
            placeholder="4"
            className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-[hsl(var(--fg))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
          />
        </div>
      </div>
    </div>
  );
}

function TargetsPreview({ targets, formData }) {
  const goalData = GOAL_OPTIONS.find(g => g.id === formData.goal);
  const nutritionModeData = NUTRITION_MODES.find(m => m.id === formData.nutrition_mode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--fg))] mb-2">Your personalized system</h2>
        <p className="text-[hsl(var(--fg-2))]">Based on your data, here are your targets</p>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.05)] to-[hsl(var(--brand)/0.02)] p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Goal Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[hsl(var(--fg))] flex items-center gap-2">
              <Target className="h-5 w-5 text-[hsl(var(--brand))]" />
              Your Goal
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Goal Type</span>
                <span className="font-medium text-[hsl(var(--fg))]">{goalData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Expected Rate</span>
                <span className="font-medium text-[hsl(var(--fg))]">{goalData.rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Time to Goal</span>
                <span className="font-medium text-[hsl(var(--fg))]">{targets.weeks_to_goal} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Nutrition Mode</span>
                <span className="font-medium text-[hsl(var(--fg))]">{nutritionModeData.name}</span>
              </div>
            </div>
          </div>

          {/* Daily Targets */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[hsl(var(--fg))] flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[hsl(var(--brand))]" />
              Daily Targets
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Calories</span>
                <span className="font-medium text-[hsl(var(--fg))]">{targets.target_calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Protein</span>
                <span className="font-medium text-[hsl(var(--fg))]">{targets.macros.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Carbs</span>
                <span className="font-medium text-[hsl(var(--fg))]">{targets.macros.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--fg-2))]">Fat</span>
                <span className="font-medium text-[hsl(var(--fg))]">{targets.macros.fat}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Composition */}
        <div className="mt-6 pt-6 border-t border-[hsl(var(--border)/0.2)]">
          <h3 className="font-semibold text-[hsl(var(--fg))] flex items-center gap-2 mb-4">
            <Scale className="h-5 w-5 text-[hsl(var(--brand))]" />
            Body Composition (Estimated)
          </h3>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[hsl(var(--card))/0.5] p-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">Weight</p>
              <p className="text-lg font-bold text-[hsl(var(--fg))]">{formData.current_weight} kg</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--card))/0.5] p-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">Body Fat</p>
              <p className="text-lg font-bold text-[hsl(var(--fg))]">{targets.estimated_body_fat.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--card))/0.5] p-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">Lean Mass</p>
              <p className="text-lg font-bold text-[hsl(var(--fg))]">{targets.body_composition.lean_mass.toFixed(1)} kg</p>
            </div>
          </div>
        </div>

        {/* Training Recommendations */}
        <div className="mt-6 pt-6 border-t border-[hsl(var(--border)/0.2)]">
          <h3 className="font-semibold text-[hsl(var(--fg))] flex items-center gap-2 mb-4">
            <Dumbbell className="h-5 w-5 text-[hsl(var(--brand))]" />
            Training Recommendations
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-[hsl(var(--card))/0.5] p-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">Frequency</p>
              <p className="text-lg font-bold text-[hsl(var(--fg))]">{targets.training_recommendations.frequency}x per week</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--card))/0.5] p-4">
              <p className="text-sm text-[hsl(var(--fg-2))]">Duration</p>
              <p className="text-lg font-bold text-[hsl(var(--fg))]">{targets.training_recommendations.duration} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready message */}
      <div className="rounded-2xl border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.05)] p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-[hsl(var(--success))] mt-1" />
          <div>
            <h3 className="font-semibold text-[hsl(var(--fg))] mb-2">You're ready to start!</h3>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Your personalized targets are calculated. Click "Start Your Journey" to begin tracking with Atlas Core.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
