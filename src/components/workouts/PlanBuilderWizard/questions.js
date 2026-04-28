import {
  Target,
  Calendar,
  Clock,
  Dumbbell,
  Home,
  AlertCircle,
  Heart,
  TrendingUp,
  Zap,
} from 'lucide-react';

export const QUESTIONS_PT = [
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

export const QUESTIONS_EN = [
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

export function getQuestions(isPt) { return isPt ? QUESTIONS_PT : QUESTIONS_EN; }
