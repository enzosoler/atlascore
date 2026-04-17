import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  Home,
  AlertCircle,
  Heart,
  TrendingUp,
  Zap,
  RotateCcw,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { invokeLLMJson } from '@/lib/llm';
import { deactivateAllWorkoutPlans, createWorkoutPlan } from '@/services/workoutPlanService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18nContext';

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: QUICK INTAKE - Comprehensive questionnaire
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTIONS_PT = [
  {
    id: 'primary_goal', icon: Target, question: 'Qual seu objetivo principal neste bloco?',
    subtitle: 'Isso determina volume, intensidade e escolha de exercícios', type: 'single_choice', required: true,
    options: [
      { value: 'muscle_gain', label: 'Hipertrofia / Ganho de massa', description: 'Foco em crescimento muscular' },
      { value: 'strength', label: 'Força máxima', description: 'Powerlifting, levantamento de peso' },
      { value: 'fat_loss', label: 'Perda de gordura', description: 'Cutting, definição muscular' },
      { value: 'endurance', label: 'Resistência', description: 'Muscular ou cardiovascular' },
      { value: 'recomposition', label: 'Recomposição corporal', description: 'Ganho de músculo + perda de gordura' },
      { value: 'general_fitness', label: 'Condicionamento geral', description: 'Saúde e bem-estar' },
    ],
  },
  {
    id: 'days_per_week', icon: Calendar, question: 'Quantos dias por semana você pode treinar?',
    subtitle: 'Seja realista - consistência é melhor que intensidade', type: 'single_choice', required: true,
    options: [
      { value: '2', label: '2 dias', description: 'Full body minimalista' },
      { value: '3', label: '3 dias', description: 'Full body ou Push/Pull/Legs' },
      { value: '4', label: '4 dias', description: 'Upper/Lower ou PPL + extra' },
      { value: '5', label: '5 dias', description: 'Bro split ou PPL modificado' },
      { value: '6', label: '6 dias', description: 'High frequency ou PPL duplo' },
    ],
  },
  {
    id: 'session_duration', icon: Clock, question: 'Quanto tempo você tem por sessão?',
    subtitle: 'Incluindo aquecimento e alongamento', type: 'single_choice', required: true,
    options: [
      { value: '30', label: '30 minutos', description: 'Treinos rápidos e eficientes' },
      { value: '45', label: '45 minutos', description: 'Padrão para quem tem pouco tempo' },
      { value: '60', label: '60 minutos', description: 'Duração ideal para maioria' },
      { value: '75', label: '75 minutos', description: 'Para treinos mais volumosos' },
      { value: '90', label: '90+ minutos', description: 'Avançado ou múltiplos grupos' },
    ],
  },
  {
    id: 'experience_level', icon: TrendingUp, question: 'Qual seu nível de experiência?',
    subtitle: 'Isso afeta volume, intensidade e complexidade dos exercícios', type: 'single_choice', required: true,
    options: [
      { value: 'beginner', label: 'Iniciante', description: 'Menos de 1 ano de treino consistente' },
      { value: 'intermediate', label: 'Intermediário', description: '1-3 anos, domina movimentos básicos' },
      { value: 'advanced', label: 'Avançado', description: '3-6 anos, busca otimização' },
      { value: 'expert', label: 'Expert', description: '6+ anos ou atleta competitivo' },
    ],
  },
  {
    id: 'training_location', icon: Home, question: 'Onde você vai treinar?',
    subtitle: 'Equipamento disponível afeta completamente a seleção de exercícios', type: 'single_choice', required: true,
    options: [
      { value: 'full_gym', label: 'Academia completa', description: 'Livre acesso a todos equipamentos' },
      { value: 'basic_gym', label: 'Academia básica', description: 'Equipamentos limitados, sem máquinas' },
      { value: 'home_equipped', label: 'Casa com equipamentos', description: 'Halteres, elásticos, barra' },
      { value: 'home_minimal', label: 'Casa sem equipamentos', description: 'Só peso corporal ou mínimo' },
      { value: 'hybrid', label: 'Híbrido', description: 'Mistura entre casa e academia' },
    ],
  },
  {
    id: 'limitations', icon: AlertCircle, question: 'Tem alguma limitação, lesão ou dor atual?',
    subtitle: 'A IA adaptará exercícios para respeitar suas restrições', type: 'multi_choice_text', required: false,
    options: [
      { value: 'none', label: 'Nenhuma', description: 'Totalmente apto' },
      { value: 'shoulder', label: 'Ombro', description: 'Dor ou limitação' },
      { value: 'lower_back', label: 'Lombar', description: 'Dor ou hérnia' },
      { value: 'knee', label: 'Joelho', description: 'Dor ou lesão' },
      { value: 'wrist', label: 'Punho', description: 'Tendinite ou limitação' },
      { value: 'hip', label: 'Quadril', description: 'Mobilidade ou dor' },
      { value: 'elbow', label: 'Cotovelo', description: 'Epicondilite ou dor' },
    ],
    allowCustom: true, customPlaceholder: 'Descreva outras limitações...',
  },
  {
    id: 'muscle_focus', icon: Dumbbell, question: 'Quer priorizar algum grupo muscular?',
    subtitle: 'Vamos distribuir volume de acordo com suas prioridades', type: 'multi_choice', maxSelect: 3, required: false,
    options: [
      { value: 'chest', label: 'Peito', description: 'Pectoralis maior/menor' },
      { value: 'back', label: 'Costas', description: 'Dorsais, trapézio, romboides' },
      { value: 'shoulders', label: 'Ombros', description: 'Deltoide anterior/lateral/posterior' },
      { value: 'arms', label: 'Braços', description: 'Bíceps e tríceps' },
      { value: 'legs', label: 'Pernas', description: 'Quadríceps, isquiotibiais, glúteos' },
      { value: 'core', label: 'Core', description: 'Abdômen e estabilização' },
      { value: 'balanced', label: 'Equilibrado', description: 'Sem prioridade específica' },
    ],
  },
  {
    id: 'exercise_preferences', icon: Heart, question: 'Preferências de exercícios',
    subtitle: 'Exercícios que você gosta ou evita', type: 'text_pair', required: false,
    likeLabel: 'Exercícios que você GOSTA', likePlaceholder: 'Ex: Agachamento, desenvolvimento militar, remada...',
    dislikeLabel: 'Exercícios que você EVITA ou NÃO GOSTA', dislikePlaceholder: 'Ex: Stiff, leg press 45, levantamento terra...',
  },
  {
    id: 'cardio_preference', icon: Zap, question: 'Incluir cardio no plano?',
    subtitle: 'E se sim, qual tipo você prefere?', type: 'single_choice', required: false,
    options: [
      { value: 'none', label: 'Sem cardio', description: 'Foco apenas em musculação' },
      { value: 'low_intensity', label: 'LISS (baixa intensidade)', description: 'Caminhada, esteira leve 20-30min' },
      { value: 'hiit', label: 'HIIT (alta intensidade)', description: 'Intervalos curtos e intensos' },
      { value: 'sports', label: 'Esportes', description: 'Futebol, natação, ciclismo, etc' },
      { value: 'mixed', label: 'Misto', description: 'Combinação de diferentes tipos' },
    ],
  },
  {
    id: 'intensity_preference', icon: TrendingUp, question: 'Qual intensidade você prefere?',
    subtitle: 'Como gosta de treinar?', type: 'single_choice', required: false,
    options: [
      { value: 'moderate', label: 'Moderada', description: 'RPE 7-8, 1-2 reps na reserva' },
      { value: 'high', label: 'Alta', description: 'RPE 8-9, próximo da falha' },
      { value: 'very_high', label: 'Muito alta', description: 'RPE 9-10, técnicas avançadas' },
      { value: 'varied', label: 'Variada', description: 'Mistura de intensidades' },
    ],
  },
];

const QUESTIONS_EN = [
  {
    id: 'primary_goal', icon: Target, question: 'What is your main goal for this block?',
    subtitle: 'This determines volume, intensity, and exercise selection', type: 'single_choice', required: true,
    options: [
      { value: 'muscle_gain', label: 'Hypertrophy / Muscle gain', description: 'Focus on muscle growth' },
      { value: 'strength', label: 'Max strength', description: 'Powerlifting, heavy lifting' },
      { value: 'fat_loss', label: 'Fat loss', description: 'Cutting, muscle definition' },
      { value: 'endurance', label: 'Endurance', description: 'Muscular or cardiovascular' },
      { value: 'recomposition', label: 'Body recomposition', description: 'Gain muscle + lose fat' },
      { value: 'general_fitness', label: 'General fitness', description: 'Health and well-being' },
    ],
  },
  {
    id: 'days_per_week', icon: Calendar, question: 'How many days per week can you train?',
    subtitle: 'Be realistic — consistency beats intensity', type: 'single_choice', required: true,
    options: [
      { value: '2', label: '2 days', description: 'Minimalist full body' },
      { value: '3', label: '3 days', description: 'Full body or Push/Pull/Legs' },
      { value: '4', label: '4 days', description: 'Upper/Lower or PPL + extra' },
      { value: '5', label: '5 days', description: 'Bro split or modified PPL' },
      { value: '6', label: '6 days', description: 'High frequency or double PPL' },
    ],
  },
  {
    id: 'session_duration', icon: Clock, question: 'How much time per session?',
    subtitle: 'Including warm-up and stretching', type: 'single_choice', required: true,
    options: [
      { value: '30', label: '30 minutes', description: 'Quick and efficient workouts' },
      { value: '45', label: '45 minutes', description: 'Standard for limited time' },
      { value: '60', label: '60 minutes', description: 'Ideal duration for most' },
      { value: '75', label: '75 minutes', description: 'For higher volume training' },
      { value: '90', label: '90+ minutes', description: 'Advanced or multiple groups' },
    ],
  },
  {
    id: 'experience_level', icon: TrendingUp, question: 'What is your experience level?',
    subtitle: 'This affects volume, intensity, and exercise complexity', type: 'single_choice', required: true,
    options: [
      { value: 'beginner', label: 'Beginner', description: 'Less than 1 year of consistent training' },
      { value: 'intermediate', label: 'Intermediate', description: '1-3 years, master basic movements' },
      { value: 'advanced', label: 'Advanced', description: '3-6 years, seeking optimization' },
      { value: 'expert', label: 'Expert', description: '6+ years or competitive athlete' },
    ],
  },
  {
    id: 'training_location', icon: Home, question: 'Where will you train?',
    subtitle: 'Available equipment greatly affects exercise selection', type: 'single_choice', required: true,
    options: [
      { value: 'full_gym', label: 'Full gym', description: 'Full access to all equipment' },
      { value: 'basic_gym', label: 'Basic gym', description: 'Limited equipment, no machines' },
      { value: 'home_equipped', label: 'Equipped home gym', description: 'Dumbbells, bands, barbell' },
      { value: 'home_minimal', label: 'Home — minimal', description: 'Bodyweight only or minimal' },
      { value: 'hybrid', label: 'Hybrid', description: 'Mix of home and gym' },
    ],
  },
  {
    id: 'limitations', icon: AlertCircle, question: 'Do you have any limitations, injuries, or pain?',
    subtitle: 'AI will adapt exercises to respect your restrictions', type: 'multi_choice_text', required: false,
    options: [
      { value: 'none', label: 'None', description: 'Fully fit' },
      { value: 'shoulder', label: 'Shoulder', description: 'Pain or limitation' },
      { value: 'lower_back', label: 'Lower back', description: 'Pain or herniation' },
      { value: 'knee', label: 'Knee', description: 'Pain or injury' },
      { value: 'wrist', label: 'Wrist', description: 'Tendinitis or limitation' },
      { value: 'hip', label: 'Hip', description: 'Mobility or pain' },
      { value: 'elbow', label: 'Elbow', description: 'Epicondylitis or pain' },
    ],
    allowCustom: true, customPlaceholder: 'Describe other limitations...',
  },
  {
    id: 'muscle_focus', icon: Dumbbell, question: 'Want to prioritize a muscle group?',
    subtitle: 'We\'ll distribute volume according to your priorities', type: 'multi_choice', maxSelect: 3, required: false,
    options: [
      { value: 'chest', label: 'Chest', description: 'Pectoralis major/minor' },
      { value: 'back', label: 'Back', description: 'Lats, traps, rhomboids' },
      { value: 'shoulders', label: 'Shoulders', description: 'Anterior/lateral/posterior deltoid' },
      { value: 'arms', label: 'Arms', description: 'Biceps and triceps' },
      { value: 'legs', label: 'Legs', description: 'Quads, hamstrings, glutes' },
      { value: 'core', label: 'Core', description: 'Abs and stabilization' },
      { value: 'balanced', label: 'Balanced', description: 'No specific priority' },
    ],
  },
  {
    id: 'exercise_preferences', icon: Heart, question: 'Exercise preferences',
    subtitle: 'Exercises you like or want to avoid', type: 'text_pair', required: false,
    likeLabel: 'Exercises you LIKE', likePlaceholder: 'E.g.: Squat, overhead press, barbell row...',
    dislikeLabel: 'Exercises you AVOID or DISLIKE', dislikePlaceholder: 'E.g.: Deadlift, leg press, stiff-leg deadlift...',
  },
  {
    id: 'cardio_preference', icon: Zap, question: 'Include cardio in the plan?',
    subtitle: 'If so, what type do you prefer?', type: 'single_choice', required: false,
    options: [
      { value: 'none', label: 'No cardio', description: 'Focus on weight training only' },
      { value: 'low_intensity', label: 'LISS (low intensity)', description: 'Walking, light treadmill 20-30min' },
      { value: 'hiit', label: 'HIIT (high intensity)', description: 'Short intense intervals' },
      { value: 'sports', label: 'Sports', description: 'Soccer, swimming, cycling, etc.' },
      { value: 'mixed', label: 'Mixed', description: 'Combination of different types' },
    ],
  },
  {
    id: 'intensity_preference', icon: TrendingUp, question: 'What intensity do you prefer?',
    subtitle: 'How do you like to train?', type: 'single_choice', required: false,
    options: [
      { value: 'moderate', label: 'Moderate', description: 'RPE 7-8, 1-2 reps in reserve' },
      { value: 'high', label: 'High', description: 'RPE 8-9, close to failure' },
      { value: 'very_high', label: 'Very high', description: 'RPE 9-10, advanced techniques' },
      { value: 'varied', label: 'Varied', description: 'Mix of intensities' },
    ],
  },
];

function getQuestions(isPt) { return isPt ? QUESTIONS_PT : QUESTIONS_EN; }

// ═══════════════════════════════════════════════════════════════════════════════
// INTAKE STEP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function IntakeStep({ answers, onChange, onNext, profileData }) {
  const { locale } = useI18n();
  const isPt = locale?.startsWith('pt');
  const QUESTIONS = getQuestions(isPt);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [customText, setCustomText] = useState('');
  const [likedExercises, setLikedExercises] = useState('');
  const [dislikedExercises, setDislikedExercises] = useState('');

  const question = QUESTIONS[currentQuestion];
  const answer = answers[question.id];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleSingleChoice = (value) => {
    onChange(question.id, value);
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(c => c + 1), 250);
    }
  };

  const handleMultiChoice = (value) => {
    const current = answer || [];
    const maxSelect = question.maxSelect || 3;
    
    if (value === 'none') {
      onChange(question.id, ['none']);
      return;
    }
    
    if (current.includes('none')) {
      onChange(question.id, [value]);
      return;
    }
    
    if (current.includes(value)) {
      onChange(question.id, current.filter(v => v !== value));
    } else if (current.length < maxSelect) {
      onChange(question.id, [...current, value]);
    }
  };

  const canProceed = () => {
    if (!question.required) return true;
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  };

  const isComplete = QUESTIONS.every(q => {
    if (!q.required) return true;
    const a = answers[q.id];
    if (Array.isArray(a)) return a.length > 0;
    return !!a;
  });

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[hsl(var(--fg-2))]">
          <span>{isPt ? 'Pergunta' : 'Question'} {currentQuestion + 1} {isPt ? 'de' : 'of'} {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[hsl(var(--fill))] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[hsl(var(--brand))] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Question Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center shrink-0">
              <question.icon className="w-5 h-5 text-[hsl(var(--brand))]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">
                {question.question}
              </h3>
              <p className="text-xs text-[hsl(var(--fg-2))] mt-1">
                {question.subtitle}
              </p>
            </div>
          </div>

          {/* Single Choice */}
          {question.type === 'single_choice' && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSingleChoice(option.value)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    answer === option.value
                      ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answer === option.value
                        ? 'border-[hsl(var(--brand))]'
                        : 'border-[hsl(var(--border))]'
                    }`}>
                      {answer === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--brand))]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-2))]">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Multi Choice */}
          {(question.type === 'multi_choice' || question.type === 'multi_choice_text') && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMultiChoice(option.value)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    (answer || []).includes(option.value)
                      ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      (answer || []).includes(option.value)
                        ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]'
                        : 'border-[hsl(var(--border))]'
                    }`}>
                      {(answer || []).includes(option.value) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--fg))]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-2))]">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Custom text for multi_choice_text */}
              {question.allowCustom && (
                <div className="mt-3">
                  <textarea
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      onChange(`${question.id}_custom`, e.target.value);
                    }}
                    placeholder={question.customPlaceholder}
                    className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--brand)/0.5)] resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          {/* Text Pair (like/dislike) */}
          {question.type === 'text_pair' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider">
                  {question.likeLabel}
                </label>
                <textarea
                  value={likedExercises}
                  onChange={(e) => {
                    setLikedExercises(e.target.value);
                    onChange(`${question.id}_liked`, e.target.value);
                  }}
                  placeholder={question.likePlaceholder}
                  className="w-full mt-1.5 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--brand)/0.5)] resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--fg-2))] uppercase tracking-wider">
                  {question.dislikeLabel}
                </label>
                <textarea
                  value={dislikedExercises}
                  onChange={(e) => {
                    setDislikedExercises(e.target.value);
                    onChange(`${question.id}_disliked`, e.target.value);
                  }}
                  placeholder={question.dislikePlaceholder}
                  className="w-full mt-1.5 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--err)/0.5)] resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentQuestion(c => Math.max(0, c - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1 text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {isPt ? 'Anterior' : 'Previous'}
        </button>
        
        {currentQuestion < QUESTIONS.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(c => Math.min(QUESTIONS.length - 1, c + 1))}
            disabled={!canProceed()}
            className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--brand))] hover:text-[hsl(var(--brand)/0.8)] disabled:opacity-40 transition-colors"
          >
            {isPt ? 'Próxima' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!isComplete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            {isPt ? 'Criar meu plano' : 'Create my plan'}
          </button>
        )}
      </div>
    </div>
  );
}

// ... (rest of the code remains the same)

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: AI GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function GenerationStep({ intakeData, profileData, onComplete, onBack }) {
  const { locale } = useI18n();
  const isPt = locale?.startsWith('pt');
  const [stage, setStage] = useState('preparing'); // preparing | generating | validating | complete
  const [error, setError] = useState(null);

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    try {
      setStage('preparing');
      await new Promise(r => setTimeout(r, 800));

      setStage('generating');

      // Build comprehensive prompt in user's language
      const systemPrompt = isPt
        ? `Você é um treinador especialista em periodização e programação de treino com 20 anos de experiência.

Sua tarefa é criar um plano de treino PERSONALIZADO e COERENTE baseado no perfil completo do atleta.

REGRAS ABSOLUTAS:
1. NUNCA sugira volume incompatível com o nível do atleta
2. SEMPRE respeite limitações físicas declaradas
3. SEMPRE adapte exercícios ao equipamento disponível
4. NUNCA exceda o tempo por sessão estipulado
5. SEMPRE justifique suas escolhas no campo "rationale"
6. Use progressão realista de 4-8 semanas`
        : `You are an expert coach in periodization and workout programming with 20 years of experience.

Your task is to create a PERSONALIZED and COHERENT workout plan based on the athlete's complete profile.

ABSOLUTE RULES:
1. NEVER suggest volume incompatible with the athlete's level
2. ALWAYS respect declared physical limitations
3. ALWAYS adapt exercises to available equipment
4. NEVER exceed the stipulated session time
5. ALWAYS justify your choices in the "rationale" field
6. Use realistic progression of 4-8 weeks

PLAN STRUCTURE:
- Choose the ideal SPLIT based on frequency and goal
- Distribute weekly volume per muscle group in a balanced way
- Select exercises compatible with equipment and experience
- Define sets, reps, rest, and appropriate techniques
- Include warm-up and progression recommendations

If there are limitations, adapt exercises (e.g.: shoulder pain → avoid overhead press, use landmine press).

IMPORTANT: Use English exercise names (e.g. "Bench Press", "Squat", "Deadlift"). Respond entirely in English.`;

      const userPrompt = isPt
        ? `Crie um plano de treino para:

DADOS DO PERFIL:
- Idade: ${profileData.age || 'não informado'}
- Peso: ${profileData.weight || 'não informado'}kg
- Altura: ${profileData.height || 'não informado'}cm
- Sexo: ${profileData.gender || 'não informado'}

DADOS DO INTAKE:
- Objetivo principal: ${intakeData.primary_goal}
- Dias por semana: ${intakeData.days_per_week}
- Duração por sessão: ${intakeData.session_duration} minutos
- Nível de experiência: ${intakeData.experience_level}
- Local de treino: ${intakeData.training_location}
- Limitações: ${(intakeData.limitations || []).join(', ')}
- Limitações adicionais: ${intakeData.limitations_custom || 'nenhuma'}
- Foco muscular prioritário: ${(intakeData.muscle_focus || []).join(', ')}
- Exercícios preferidos: ${intakeData.exercise_preferences_liked || 'nenhum específico'}
- Exercícios a evitar: ${intakeData.exercise_preferences_disliked || 'nenhum específico'}
- Preferência de cardio: ${intakeData.cardio_preference || 'nenhum'}
- Intensidade preferida: ${intakeData.intensity_preference || 'moderada'}

Gere o plano em português. Use nomes de exercícios em português.`
        : `Create a workout plan for:

PROFILE DATA:
- Age: ${profileData.age || 'not provided'}
- Weight: ${profileData.weight || 'not provided'}kg
- Height: ${profileData.height || 'not provided'}cm
- Gender: ${profileData.gender || 'not provided'}

INTAKE DATA:
- Primary goal: ${intakeData.primary_goal}
- Days per week: ${intakeData.days_per_week}
- Session duration: ${intakeData.session_duration} minutes
- Experience level: ${intakeData.experience_level}
- Training location: ${intakeData.training_location}
- Limitations: ${(intakeData.limitations || []).join(', ') || 'none'}
- Additional limitations: ${intakeData.limitations_custom || 'none'}
- Priority muscle focus: ${(intakeData.muscle_focus || []).join(', ') || 'none'}
- Preferred exercises: ${intakeData.exercise_preferences_liked || 'none'}
- Exercises to avoid: ${intakeData.exercise_preferences_disliked || 'none'}
- Cardio preference: ${intakeData.cardio_preference || 'none'}
- Preferred intensity: ${intakeData.intensity_preference || 'moderate'}

Generate the plan in English. Use standard English exercise names.`;

      const responseSchema = {
        type: 'object',
        properties: {
          plan: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Nome descritivo do plano' },
              objective: { type: 'string', description: 'Objetivo principal do plano' },
              frequency: { type: 'number', description: 'Dias por semana' },
              duration_weeks: { type: 'number', description: 'Duração sugerida em semanas' },
              split_type: { type: 'string', description: 'Tipo de split (ex: Upper/Lower, PPL, Full Body)' },
              rationale: { type: 'string', description: 'Explicação detalhada de por que esse split e estrutura foram escolhidos' },
            },
            required: ['name', 'objective', 'frequency', 'split_type', 'rationale']
          },
          weekly_volume: {
            type: 'object',
            description: 'Volume semanal por grupo muscular em séries diretas',
            properties: {
              chest: { type: 'number' },
              back: { type: 'number' },
              shoulders: { type: 'number' },
              biceps: { type: 'number' },
              triceps: { type: 'number' },
              quadriceps: { type: 'number' },
              hamstrings: { type: 'number' },
              glutes: { type: 'number' },
              calves: { type: 'number' },
              core: { type: 'number' },
            }
          },
          days: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'Nome do dia (ex: Push - Peito/Ombro/Tríceps)' },
                focus: { type: 'string', description: 'Grupos musculares foco' },
                estimated_duration_minutes: { type: 'number' },
                warmup: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Exercícios de aquecimento recomendados'
                },
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      muscle_group: { type: 'string' },
                      sets: { type: 'number' },
                      reps: { type: 'string', description: 'Ex: 8-12, 10-15, 6-8' },
                      rest_seconds: { type: 'number' },
                      technique: { type: 'string', description: 'Técnica especial se houver (drop set, rest-pause, etc)' },
                      notes: { type: 'string', description: 'Dicas de execução' },
                      alternative: { type: 'string', description: 'Exercício alternativo se necessário' },
                    },
                    required: ['name', 'muscle_group', 'sets', 'reps', 'rest_seconds']
                  }
                },
                cardio: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    duration_minutes: { type: 'number' },
                    intensity: { type: 'string' },
                  }
                }
              },
              required: ['label', 'focus', 'exercises', 'estimated_duration_minutes']
            }
          },
          progression: {
            type: 'object',
            properties: {
              strategy: { type: 'string', description: 'Estratégia de progressão (ex: double progression, linear)' },
              week_by_week: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    week: { type: 'number' },
                    focus: { type: 'string' },
                    volume_adjustment: { type: 'string' },
                    intensity_target: { type: 'string' },
                  }
                }
              }
            }
          },
          warnings: {
            type: 'array',
            items: { type: 'string' },
            description: 'Avisos importantes sobre o plano'
          },
          adaptations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Adaptações feitas baseadas nas limitações do usuário'
          }
        },
        required: ['plan', 'days', 'weekly_volume', 'rationale']
      };

      const res = await invokeLLMJson(`${systemPrompt}\n\n${userPrompt}`, responseSchema);

      setStage('validating');
      await new Promise(r => setTimeout(r, 500));

      // Validate the response
      const validatedPlan = validateAndFixPlan(res, intakeData);
      
      setStage('complete');
      await new Promise(r => setTimeout(r, 300));
      
      onComplete(validatedPlan);
    } catch (err) {
      console.error('Plan generation error:', err);
      setError(err.message || (isPt ? 'Erro ao gerar plano. Tente novamente.' : 'Error generating plan. Please try again.'));
    }
  };

  const validateAndFixPlan = (res, intake) => {
    const plan = res.plan || {};
    const days = res.days || [];
    
    // Ensure plan matches frequency
    const targetDays = parseInt(intake.days_per_week);
    if (days.length !== targetDays) {
      console.warn(`Plan days mismatch: expected ${targetDays}, got ${days.length}`);
    }

    // Ensure duration matches
    const maxDuration = parseInt(intake.session_duration);
    days.forEach(day => {
      if (day.estimated_duration_minutes > maxDuration + 10) {
        day.warnings = [...(day.warnings || []), `Duração estimada (${day.estimated_duration_minutes}min) excede o tempo disponível (${maxDuration}min)`];
      }
    });

    // Check for avoided exercises
    const avoided = (intake.exercise_preferences_disliked || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    days.forEach(day => {
      day.exercises.forEach(ex => {
        if (avoided.some(a => ex.name.toLowerCase().includes(a))) {
          ex.warning = `Este exercício foi incluído mas está na sua lista de evitados. Considere usar: ${ex.alternative || 'alternativa similar'}`;
        }
      });
    });

    return {
      ...res,
      plan: {
        ...plan,
        name: plan.name || `Plano ${intake.primary_goal} - ${intake.days_per_week}x/semana`,
        frequency: targetDays,
      }
    };
  };

  const stages = isPt ? {
    preparing: { icon: Info, text: 'Analisando seu perfil...', sub: 'Coletando dados do intake e perfil' },
    generating: { icon: Sparkles, text: 'Criando seu plano personalizado...', sub: 'IA selecionando exercícios ideais para você' },
    validating: { icon: CheckCircle2, text: 'Validando estrutura...', sub: 'Verificando coerência e segurança' },
    complete: { icon: CheckCircle2, text: 'Plano pronto!', sub: 'Revise antes de salvar' },
  } : {
    preparing: { icon: Info, text: 'Analyzing your profile...', sub: 'Collecting intake and profile data' },
    generating: { icon: Sparkles, text: 'Creating your personalized plan...', sub: 'AI selecting ideal exercises for you' },
    validating: { icon: CheckCircle2, text: 'Validating structure...', sub: 'Checking coherence and safety' },
    complete: { icon: CheckCircle2, text: 'Plan ready!', sub: 'Review before saving' },
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--err)/0.1)] flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-[hsl(var(--err))]" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">{isPt ? 'Erro ao criar plano' : 'Error creating plan'}</p>
          <p className="text-sm text-[hsl(var(--fg-2))] mt-1">{error}</p>
        </div>
        <button
          onClick={generatePlan}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90"
        >
          <RotateCcw className="w-4 h-4" />
          {isPt ? 'Tentar novamente' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <motion.div
        animate={{ scale: stage === 'generating' ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--brand)/0.2)] to-[hsl(var(--brand)/0.05)] flex items-center justify-center"
      >
        {stage === 'generating' ? (
          <Loader2 className="w-10 h-10 text-[hsl(var(--brand))] animate-spin" />
        ) : (
          <Icon className="w-10 h-10 text-[hsl(var(--brand))]" />
        )}
      </motion.div>
      
      <div className="text-center space-y-2">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[17px] font-semibold text-[hsl(var(--fg))]"
        >
          {currentStage.text}
        </motion.p>
        <p className="text-sm text-[hsl(var(--fg-2))]">{currentStage.sub}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 pt-4">
        {Object.keys(stages).map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              Object.keys(stages).indexOf(s) <= Object.keys(stages).indexOf(stage)
                ? 'bg-[hsl(var(--brand))] w-4'
                : 'bg-[hsl(var(--border))]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: REVIEW & SAVE
// ═══════════════════════════════════════════════════════════════════════════════

function ReviewStep({ generatedPlan, intakeData, onSave, onBack, onAdjust }) {
  const { locale } = useI18n();
  const isPt = locale?.startsWith('pt');
  const [saving, setSaving] = useState(false);
  const [expandedDay, setExpandedDay] = useState(0);

  const plan = generatedPlan.plan;
  const days = generatedPlan.days || [];
  const volume = generatedPlan.weekly_volume || {};

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(generatedPlan);
    } finally {
      setSaving(false);
    }
  };

  const totalExercises = days.reduce((sum, d) => sum + (d.exercises?.length || 0), 0);
  const avgDuration = Math.round(days.reduce((sum, d) => sum + (d.estimated_duration_minutes || 0), 0) / days.length);

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--brand)/0.15)] to-[hsl(var(--brand)/0.05)] rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--brand))] uppercase tracking-wider">{isPt ? 'Plano Gerado' : 'Generated Plan'}</p>
            <h3 className="text-[17px] font-bold text-[hsl(var(--fg))] mt-1">{plan.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--ok)/0.15)] text-[hsl(var(--ok))] text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isPt ? 'Pronto' : 'Ready'}
          </div>
        </div>
        
        <p className="text-sm text-[hsl(var(--fg-2))] leading-relaxed">{plan.rationale}</p>
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-[hsl(var(--card))] rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-[hsl(var(--brand))]">{plan.frequency}x</p>
            <p className="text-[10px] text-[hsl(var(--fg-2))] uppercase">{isPt ? 'por semana' : 'per week'}</p>
          </div>
          <div className="bg-[hsl(var(--card))] rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-[hsl(var(--brand))]">{avgDuration}m</p>
            <p className="text-[10px] text-[hsl(var(--fg-2))] uppercase">{isPt ? 'por sessão' : 'per session'}</p>
          </div>
          <div className="bg-[hsl(var(--card))] rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-[hsl(var(--brand))]">{totalExercises}</p>
            <p className="text-[10px] text-[hsl(var(--fg-2))] uppercase">{isPt ? 'exercícios' : 'exercises'}</p>
          </div>
        </div>
      </div>

      {/* Volume Distribution */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">{isPt ? 'Volume semanal por grupo' : 'Weekly volume by group'}</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(volume).filter(([, v]) => v > 0).map(([muscle, sets]) => (
            <div key={muscle} className="flex items-center justify-between p-2.5 rounded-lg bg-[hsl(var(--fill)/0.5)]">
              <span className="text-sm text-[hsl(var(--fg))] capitalize">{muscle}</span>
              <span className="text-sm font-semibold text-[hsl(var(--brand))]">{sets} {isPt ? 'séries' : 'sets'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Split Type */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--fill)/0.5)]">
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand)/0.1)] flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-[hsl(var(--brand))]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[hsl(var(--fg))]">{plan.split_type}</p>
          <p className="text-xs text-[hsl(var(--fg-2))]">{isPt ? 'Estrutura do plano' : 'Plan structure'}</p>
        </div>
      </div>

      {/* Adaptations */}
      {(generatedPlan.adaptations || []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">{isPt ? 'Adaptações para você' : 'Adaptations for you'}</p>
          <div className="space-y-1.5">
            {generatedPlan.adaptations.map((adaptation, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Info className="w-4 h-4 text-[hsl(var(--brand))] shrink-0 mt-0.5" />
                <span className="text-[hsl(var(--fg-2))]">{adaptation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Previews */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">{isPt ? 'Preview dos dias' : 'Day preview'}</p>
        <div className="space-y-2">
          {days.map((day, idx) => (
            <div
              key={idx}
              onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
              className="border border-[hsl(var(--border))] rounded-xl overflow-hidden cursor-pointer hover:border-[hsl(var(--brand)/0.4)] transition-colors"
            >
              <div className="flex items-center justify-between p-3 bg-[hsl(var(--fill)/0.3)]">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[hsl(var(--brand)/0.15)] flex items-center justify-center text-xs font-bold text-[hsl(var(--brand))]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--fg))]">{day.label}</p>
                    <p className="text-xs text-[hsl(var(--fg-2))]">{day.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--fg-2))]">{day.exercises?.length || 0} ex</span>
                  <ChevronRight className={`w-4 h-4 text-[hsl(var(--fg-3))] transition-transform ${expandedDay === idx ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {expandedDay === idx && (
                <div className="p-3 space-y-2 border-t border-[hsl(var(--border)/0.5)]">
                  {day.exercises?.map((ex, exIdx) => (
                    <div key={exIdx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[hsl(var(--fill))] flex items-center justify-center text-[10px] text-[hsl(var(--fg-3))]">
                          {exIdx + 1}
                        </span>
                        <span className="text-[hsl(var(--fg))]">{ex.name}</span>
                        {ex.warning && (
                          <Info className="w-3.5 h-3.5 text-[hsl(var(--warn))]" />
                        )}
                      </div>
                      <span className="text-xs text-[hsl(var(--fg-2))]">{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                  {day.cardio && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--fg-2))] pt-1 border-t border-dashed border-[hsl(var(--border))]">
                      <Zap className="w-4 h-4 text-[hsl(var(--brand))]" />
                      Cardio: {day.cardio.type} ({day.cardio.duration_minutes}min)
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {(generatedPlan.warnings || []).length > 0 && (
        <div className="p-3 rounded-xl bg-[hsl(var(--warn)/0.08)] border border-[hsl(var(--warn)/0.2)]">
          <p className="text-xs font-semibold text-[hsl(var(--warn))] uppercase tracking-wider mb-2">{isPt ? 'Avisos' : 'Warnings'}</p>
          {generatedPlan.warnings.map((w, i) => (
            <p key={i} className="text-sm text-[hsl(var(--fg-2))] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[hsl(var(--warn))] shrink-0 mt-0.5" />
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          disabled={saving}
          className="flex-1 h-11 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] transition-colors disabled:opacity-40"
        >
          {isPt ? 'Voltar' : 'Back'}
        </button>
        <button
          onClick={onAdjust}
          disabled={saving}
          className="flex-1 h-11 rounded-xl border border-[hsl(var(--brand)/0.3)] text-sm font-medium text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.08)] transition-colors disabled:opacity-40"
        >
          {isPt ? 'Ajustar' : 'Adjust'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-[2] h-11 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {isPt ? 'Salvar Plano' : 'Save Plan'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PlanBuilderWizard({ open, onClose, userId, profileData }) {
  const { t } = useI18n();
  const [step, setStep] = useState('intake'); // intake | generating | review
  const [answers, setAnswers] = useState({});
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const queryClient = useQueryClient();

  const handleIntakeNext = () => {
    setStep('generating');
  };

  const handleGenerationComplete = (plan) => {
    setGeneratedPlan(plan);
    setStep('review');
  };

  const handleSave = async (plan) => {
    try {
      await deactivateAllWorkoutPlans(userId);
      await createWorkoutPlan(userId, {
        name: plan.plan.name,
        objective: plan.plan.objective,
        frequency: plan.plan.frequency,
        days: plan.days.map(d => ({
          label: d.label,
          exercises: d.exercises.map(e => ({
            name: e.name,
            muscle_group: e.muscle_group,
            sets: e.sets,
            reps: e.reps,
            rest: e.rest_seconds,
            notes: e.notes || '',
          })),
        })),
        active: true,
        created_by_type: 'ai',
        ai_metadata: {
          split_type: plan.plan.split_type,
          weekly_volume: plan.weekly_volume,
          rationale: plan.plan.rationale,
          adaptations: plan.adaptations,
          intake_data: answers,
        },
        start_date: new Date().toISOString().split('T')[0],
      });

      queryClient.invalidateQueries({ queryKey: ['active-workout-plan', userId] });
      queryClient.invalidateQueries({ queryKey: ['today-workout-plan', userId] });
      
      toast.success(t('planBuilder.planCreatedSuccess'));
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(t('planBuilder.planSaveError'));
      throw err;
    }
  };

  const handleAdjust = () => {
    setStep('intake');
  };

  const handleBackToIntake = () => {
    setStep('intake');
  };

  const stepTitles = {
    intake: t('planBuilder.stepTitles.intake'),
    generating: t('planBuilder.stepTitles.generating'),
    review: t('planBuilder.stepTitles.review'),
  };

  const stepSubtitles = {
    intake: t('planBuilder.stepSubtitles.intake'),
    generating: t('planBuilder.stepSubtitles.generating'),
    review: t('planBuilder.stepSubtitles.review'),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[hsl(var(--card))] border-[hsl(var(--border))] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                {step === 'intake' ? 'Step 1 de 3' : step === 'generating' ? 'Step 2 de 3' : 'Step 3 de 3'}
              </p>
              <DialogTitle className="text-[17px] font-bold text-[hsl(var(--fg))] mt-1">
                {stepTitles[step]}
              </DialogTitle>
            </div>
            {step !== 'generating' && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-[hsl(var(--fg-2))] mt-1">{stepSubtitles[step]}</p>
        </DialogHeader>

        <div className="py-2 pb-6">
          {step === 'intake' && (
            <IntakeStep
              answers={answers}
              onChange={(k, v) => setAnswers(a => ({ ...a, [k]: v }))}
              onNext={handleIntakeNext}
              profileData={profileData}
            />
          )}

          {step === 'generating' && (
            <GenerationStep
              intakeData={answers}
              profileData={profileData}
              onComplete={handleGenerationComplete}
              onBack={handleBackToIntake}
            />
          )}

          {step === 'review' && generatedPlan && (
            <ReviewStep
              generatedPlan={generatedPlan}
              intakeData={answers}
              onSave={handleSave}
              onBack={handleAdjust}
              onAdjust={handleAdjust}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
