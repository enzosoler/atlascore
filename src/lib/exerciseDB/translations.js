/**
 * Atlas Core — Exercise Translations & Alias System
 *
 * Maps ExerciseDB English exercise names → Portuguese names + aliases.
 * Also provides muscle group and equipment term translations for search.
 *
 * Strategy:
 *  1. Exact lookup by EN name (lowercase)
 *  2. Word-by-word partial match for unknown exercises
 *  3. Auto-generated fallback using word substitution
 */

// ─── Muscle group translations ────────────────────────────────────────────────

export const MUSCLE_EN_TO_PT = {
  // Primary muscles
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  'upper arms': 'Braços',
  'lower arms': 'Antebraços',
  forearms: 'Antebraços',
  quads: 'Quadríceps',
  quadriceps: 'Quadríceps',
  hamstrings: 'Isquiotibiais',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
  core: 'Core',
  abs: 'Abdômen',
  'upper abs': 'Abdômen',
  'lower abs': 'Abdômen Inferior',
  obliques: 'Oblíquos',
  'lower back': 'Lombar',
  traps: 'Trapézio',
  lats: 'Dorsal',
  waist: 'Cintura',
  'upper legs': 'Coxas',
  'lower legs': 'Pernas',
  neck: 'Pescoço',
  'serratus anterior': 'Serrátil Anterior',
  'levator scapulae': 'Levantador da Escápula',
  'rotator cuff': 'Manguito Rotador',
  delts: 'Deltóides',
  'front delts': 'Deltóide Anterior',
  'rear delts': 'Deltóide Posterior',
  'side delts': 'Deltóide Lateral',
  spine: 'Coluna',
  'adductor magnus': 'Adutor Magno',
  adductors: 'Adutores',
  abductors: 'Abdutores',
  'hip flexors': 'Flexores do Quadril',
  'iliopsoas': 'Iliopsoas',
  'soleus': 'Sóleo',
  'gastrocnemius': 'Gastrocnêmio',
  'rhomboids': 'Rombóides',
  // ExerciseDB body parts
  'upper body': 'Parte Superior',
  'lower body': 'Parte Inferior',
  'full body': 'Corpo Inteiro',
  'cardiovascular system': 'Sistema Cardiovascular',
};

// ─── Equipment translations ───────────────────────────────────────────────────

export const EQUIPMENT_EN_TO_PT = {
  barbell: 'Barra',
  dumbbell: 'Haltere',
  cable: 'Cabo / Polia',
  machine: 'Máquina',
  'body weight': 'Peso Corporal',
  bodyweight: 'Peso Corporal',
  kettlebell: 'Kettlebell',
  'resistance band': 'Banda Elástica',
  band: 'Banda Elástica',
  'ez barbell': 'Barra EZ',
  'smith machine': 'Smith',
  'leverage machine': 'Máquina Guiada',
  'assisted machine': 'Máquina Assistida',
  'suspension': 'Suspensão (TRX)',
  'olympic barbell': 'Barra Olímpica',
  'trap bar': 'Barra Hexagonal',
  'medicine ball': 'Medicine Ball',
  'stability ball': 'Bola de Estabilidade',
  'bosu ball': 'Bosu',
  'foam roller': 'Rolo de Espuma',
  'pull-up bar': 'Barra Fixa',
  rope: 'Corda',
  'roller': 'Rolo',
};

// ─── Body part / category translations ───────────────────────────────────────

export const BODY_PART_EN_TO_PT = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  'upper arms': 'Braços',
  'lower arms': 'Antebraços',
  'upper legs': 'Quadríceps / Posteriores',
  'lower legs': 'Panturrilhas',
  waist: 'Abdômen / Core',
  neck: 'Pescoço',
  cardio: 'Cardio',
};

// ─── PT search terms → EN API terms ──────────────────────────────────────────

/**
 * When user searches in PT, translate keywords to EN before hitting the API.
 * Used by ExerciseSearch to perform bilingual search.
 */
export const PT_SEARCH_TO_EN = {
  // Muscles
  peito: 'chest',
  peitoral: 'chest',
  costas: 'back',
  dorsal: 'back',
  latíssimo: 'lats',
  lat: 'lats',
  ombro: 'shoulders',
  ombros: 'shoulders',
  deltóide: 'shoulders',
  bíceps: 'biceps',
  biceps: 'biceps',
  tríceps: 'triceps',
  triceps: 'triceps',
  quadríceps: 'quads',
  quadriceps: 'quads',
  quad: 'quads',
  femoral: 'hamstrings',
  posterior: 'hamstrings',
  isquiotibial: 'hamstrings',
  'isquio tibial': 'hamstrings',
  glúteo: 'glutes',
  gluteo: 'glutes',
  bumbum: 'glutes',
  panturrilha: 'calves',
  panturrilhas: 'calves',
  abdômen: 'upper abs',
  abdomen: 'upper abs',
  abdominal: 'upper abs',
  abs: 'upper abs',
  core: 'upper abs',
  lombar: 'lower back',
  'lombar inferior': 'lower back',
  trapézio: 'traps',
  trapezio: 'traps',
  pescoço: 'neck',
  braco: 'upper arms',
  braço: 'upper arms',
  antebraco: 'lower arms',
  antebraço: 'lower arms',
  coxa: 'upper legs',
  coxas: 'upper legs',
  perna: 'lower legs',
  pernas: 'lower legs',
  cintura: 'waist',

  // Common exercise names / movement patterns
  supino: 'bench press',
  'supino reto': 'barbell bench press',
  'supino inclinado': 'incline bench press',
  'supino declinado': 'decline bench press',
  'supino haltere': 'dumbbell bench press',
  crucifixo: 'fly',
  agachamento: 'squat',
  'leg press': 'leg press',
  'hack squat': 'hack squat',
  remada: 'row',
  puxada: 'pulldown',
  'barra fixa': 'pull-up',
  flexão: 'push-up',
  flexao: 'push-up',
  desenvolvimento: 'press',
  'desenvolvimento arnold': 'arnold press',
  elevação: 'raise',
  elevacao: 'raise',
  'elevação lateral': 'lateral raise',
  'elevação frontal': 'front raise',
  rosca: 'curl',
  'rosca direta': 'barbell curl',
  'rosca alternada': 'alternate curl',
  'rosca concentrada': 'concentration curl',
  'rosca martelo': 'hammer curl',
  'tríceps pulley': 'tricep pushdown',
  'triceps pulley': 'tricep pushdown',
  extensão: 'extension',
  extensao: 'extension',
  afundo: 'lunge',
  avanço: 'lunge',
  avanco: 'lunge',
  stiff: 'romanian deadlift',
  rdl: 'romanian deadlift',
  terra: 'deadlift',
  levantamento: 'deadlift',
  'levantamento terra': 'deadlift',
  'terra romeno': 'romanian deadlift',
  'hip thrust': 'hip thrust',
  'ponte glutea': 'glute bridge',
  'cadeira extensora': 'leg extension',
  'mesa flexora': 'seated leg curl',
  'panturrilha em pé': 'standing calf raise',
  'panturrilha sentado': 'seated calf raise',
  abducão: 'hip abduction',
  adução: 'hip adduction',
  'plank': 'plank',
  prancha: 'plank',
  'abdominais': 'crunch',
  'abdominal': 'crunch',
  crunch: 'crunch',

  // Equipment
  barra: 'barbell',
  haltere: 'dumbbell',
  halter: 'dumbbell',
  cabo: 'cable',
  polia: 'cable',
  maquina: 'machine',
  máquina: 'machine',
  kettlebell: 'kettlebell',
  elastico: 'band',
  elástico: 'band',
};

// ─── Exercise name → PT translation map ──────────────────────────────────────
// Key: ExerciseDB exercise name (lowercase, exact)
// Value: { pt, aliases_pt, aliases_en }

export const EXERCISE_TRANSLATIONS = {
  // ── Chest ──────────────────────────────────────────────────────────────────
  'barbell bench press': {
    pt: 'Supino reto com barra',
    aliases_pt: ['supino reto', 'supino barra', 'bench press'],
    aliases_en: ['bench press', 'flat bench press'],
  },
  'barbell incline bench press': {
    pt: 'Supino inclinado com barra',
    aliases_pt: ['supino inclinado', 'supino inclinado barra'],
    aliases_en: ['incline bench press', 'incline barbell press'],
  },
  'barbell decline bench press': {
    pt: 'Supino declinado com barra',
    aliases_pt: ['supino declinado', 'supino declinado barra'],
    aliases_en: ['decline bench press'],
  },
  'dumbbell bench press': {
    pt: 'Supino com halteres',
    aliases_pt: ['supino haltere', 'supino com halter'],
    aliases_en: ['dumbbell bench', 'flat dumbbell press'],
  },
  'dumbbell incline bench press': {
    pt: 'Supino inclinado com halteres',
    aliases_pt: ['supino inclinado haltere'],
    aliases_en: ['incline dumbbell press', 'incline dumbbell bench'],
  },
  'dumbbell fly': {
    pt: 'Crucifixo com halteres',
    aliases_pt: ['crucifixo', 'crucifixo haltere', 'aberturas'],
    aliases_en: ['dumbbell flye', 'chest fly', 'flat fly'],
  },
  'cable fly': {
    pt: 'Crucifixo no cabo',
    aliases_pt: ['crucifixo cabo', 'crucifixo polia', 'cross-over'],
    aliases_en: ['cable crossover', 'cable fly chest'],
  },
  'push-up': {
    pt: 'Flexão de braço',
    aliases_pt: ['flexão', 'flexão de braços', 'pushup'],
    aliases_en: ['pushup', 'push up'],
  },

  // ── Back ───────────────────────────────────────────────────────────────────
  'barbell bent over row': {
    pt: 'Remada curvada com barra',
    aliases_pt: ['remada curvada', 'remada pronada', 'bent over row'],
    aliases_en: ['barbell row', 'bent-over row'],
  },
  'dumbbell bent over row': {
    pt: 'Remada curvada com haltere',
    aliases_pt: ['remada haltere', 'remada unilateral'],
    aliases_en: ['one arm row', 'single arm row', 'dumbbell row'],
  },
  'pull-up': {
    pt: 'Barra fixa',
    aliases_pt: ['barra fixa', 'puxada na barra', 'pullup'],
    aliases_en: ['pullup', 'pull up', 'chinup'],
  },
  'chin-up': {
    pt: 'Barra supinada',
    aliases_pt: ['barra supinada', 'chin up'],
    aliases_en: ['chin up', 'underhand pull-up'],
  },
  'lat pulldown': {
    pt: 'Puxada na polia alta',
    aliases_pt: ['puxada', 'pulley costas', 'pulldown'],
    aliases_en: ['cable pulldown', 'lat pull-down'],
  },
  'cable row': {
    pt: 'Remada no cabo',
    aliases_pt: ['remada sentada', 'remada cabo', 'serrote cabo'],
    aliases_en: ['seated cable row', 'low cable row'],
  },
  'deadlift': {
    pt: 'Levantamento terra',
    aliases_pt: ['terra', 'deadlift convencional', 'levantamento'],
    aliases_en: ['conventional deadlift', 'barbell deadlift'],
  },
  't-bar row': {
    pt: 'Remada T',
    aliases_pt: ['remada t', 'remada cavalinho'],
    aliases_en: ['t bar row', 'tbar row'],
  },

  // ── Shoulders ──────────────────────────────────────────────────────────────
  'barbell shoulder press': {
    pt: 'Desenvolvimento com barra',
    aliases_pt: ['desenvolvimento', 'press ombro barra', 'military press'],
    aliases_en: ['overhead press', 'military press', 'ohp'],
  },
  'dumbbell shoulder press': {
    pt: 'Desenvolvimento com halteres',
    aliases_pt: ['desenvolvimento haltere', 'press ombro haltere'],
    aliases_en: ['dumbbell overhead press', 'seated dumbbell press'],
  },
  'arnold press': {
    pt: 'Arnold press',
    aliases_pt: ['desenvolvimento arnold', 'arnold'],
    aliases_en: ['arnold shoulder press'],
  },
  'dumbbell lateral raise': {
    pt: 'Elevação lateral com halteres',
    aliases_pt: ['elevação lateral', 'lateral raise', 'aberturas laterais'],
    aliases_en: ['lateral raise', 'side raise', 'side lateral raise'],
  },
  'cable lateral raise': {
    pt: 'Elevação lateral no cabo',
    aliases_pt: ['elevação lateral cabo', 'lateral raise cabo'],
    aliases_en: ['cable side lateral raise'],
  },
  'dumbbell front raise': {
    pt: 'Elevação frontal com halteres',
    aliases_pt: ['elevação frontal', 'front raise'],
    aliases_en: ['front raise', 'frontal raise'],
  },
  'face pull': {
    pt: 'Face pull',
    aliases_pt: ['puxada facial', 'remada alta cabo'],
    aliases_en: ['cable face pull', 'rope face pull'],
  },
  'upright row': {
    pt: 'Encolhimento de ombros em pé',
    aliases_pt: ['remada alta', 'upright row barra'],
    aliases_en: ['barbell upright row', 'dumbbell upright row'],
  },
  'dumbbell shrug': {
    pt: 'Encolhimento com halteres',
    aliases_pt: ['encolhimento', 'shrug'],
    aliases_en: ['shoulder shrug', 'dumbbell shrug'],
  },
  'barbell shrug': {
    pt: 'Encolhimento com barra',
    aliases_pt: ['encolhimento barra'],
    aliases_en: ['barbell shrug'],
  },

  // ── Biceps ─────────────────────────────────────────────────────────────────
  'barbell curl': {
    pt: 'Rosca direta com barra',
    aliases_pt: ['rosca direta', 'rosca barra', 'curl barra'],
    aliases_en: ['standing barbell curl', 'bicep curl barbell'],
  },
  'dumbbell biceps curl': {
    pt: 'Rosca direta com haltere',
    aliases_pt: ['rosca haltere', 'rosca alternada'],
    aliases_en: ['dumbbell curl', 'alternating curl', 'bicep curl dumbbell'],
  },
  'hammer curl': {
    pt: 'Rosca martelo',
    aliases_pt: ['martelo', 'rosca neutra'],
    aliases_en: ['dumbbell hammer curl', 'neutral grip curl'],
  },
  'concentration curl': {
    pt: 'Rosca concentrada',
    aliases_pt: ['rosca concentrada', 'rosca scott'],
    aliases_en: ['dumbbell concentration curl'],
  },
  'preacher curl': {
    pt: 'Rosca scott',
    aliases_pt: ['scott', 'rosca scott', 'rosca preacher'],
    aliases_en: ['ez bar preacher curl', 'cable preacher curl'],
  },
  'incline dumbbell curl': {
    pt: 'Rosca inclinada com haltere',
    aliases_pt: ['rosca inclinada'],
    aliases_en: ['incline curl', 'incline bicep curl'],
  },
  'cable curl': {
    pt: 'Rosca no cabo',
    aliases_pt: ['rosca cabo', 'rosca polia'],
    aliases_en: ['cable bicep curl'],
  },

  // ── Triceps ────────────────────────────────────────────────────────────────
  'triceps pushdown': {
    pt: 'Tríceps pulley',
    aliases_pt: ['pulley tríceps', 'tríceps corda', 'triceps pushdown', 'pushdown'],
    aliases_en: ['cable pushdown', 'rope pushdown', 'tricep pulldown'],
  },
  'triceps dip': {
    pt: 'Mergulho no banco',
    aliases_pt: ['mergulho', 'dip tríceps', 'banco mergulho'],
    aliases_en: ['bench dip', 'dips', 'parallel bar dip'],
  },
  'skull crusher': {
    pt: 'Tríceps testa',
    aliases_pt: ['tríceps testa', 'skull crusher', 'extensão tríceps testa'],
    aliases_en: ['lying tricep extension', 'ez bar skull crusher'],
  },
  'overhead triceps extension': {
    pt: 'Tríceps francês',
    aliases_pt: ['tríceps francês', 'frances', 'extensão overhead'],
    aliases_en: ['french press', 'overhead extension', 'tricep overhead'],
  },
  'close-grip bench press': {
    pt: 'Supino pegada fechada',
    aliases_pt: ['supino pegada fechada', 'supino fechado'],
    aliases_en: ['close grip bench', 'narrow grip bench press'],
  },
  'cable overhead triceps extension': {
    pt: 'Tríceps francês no cabo',
    aliases_pt: ['frances cabo', 'tríceps francês cabo'],
    aliases_en: ['rope overhead extension'],
  },
  'triceps kickback': {
    pt: 'Tríceps coice com haltere',
    aliases_pt: ['coice', 'kickback tríceps'],
    aliases_en: ['dumbbell kickback', 'kickback'],
  },

  // ── Legs ───────────────────────────────────────────────────────────────────
  'barbell squat': {
    pt: 'Agachamento com barra',
    aliases_pt: ['agachamento livre', 'agachamento barra', 'squat'],
    aliases_en: ['squat', 'back squat', 'barbell back squat'],
  },
  'front squat': {
    pt: 'Agachamento frontal',
    aliases_pt: ['agachamento frontal', 'front squat'],
    aliases_en: ['barbell front squat'],
  },
  'leg press': {
    pt: 'Leg press',
    aliases_pt: ['prensa', 'leg press 45'],
    aliases_en: ['machine leg press', '45 degree leg press'],
  },
  'hack squat': {
    pt: 'Hack squat',
    aliases_pt: ['hack', 'agachamento hack', 'agachamento invertido'],
    aliases_en: ['barbell hack squat', 'machine hack squat'],
  },
  'romanian deadlift': {
    pt: 'Terra romeno',
    aliases_pt: ['stiff', 'rdl', 'terra romeno', 'levantamento romeno'],
    aliases_en: ['rdl', 'rdl deadlift', 'stiff-leg deadlift'],
  },
  'lunge': {
    pt: 'Afundo',
    aliases_pt: ['avanço', 'passada', 'lunge'],
    aliases_en: ['barbell lunge', 'dumbbell lunge', 'walking lunge'],
  },
  'bulgarian split squat': {
    pt: 'Agachamento búlgaro',
    aliases_pt: ['búlgaro', 'split squat búlgaro', 'agachamento unilateral'],
    aliases_en: ['split squat', 'rear foot elevated split squat'],
  },
  'leg extension': {
    pt: 'Cadeira extensora',
    aliases_pt: ['extensora', 'cadeira extensora', 'extensão de joelho'],
    aliases_en: ['machine leg extension', 'seated leg extension'],
  },
  'leg curl': {
    pt: 'Mesa flexora',
    aliases_pt: ['flexora', 'mesa flexora', 'rosca femoral'],
    aliases_en: ['seated leg curl', 'lying leg curl', 'hamstring curl'],
  },
  'hip thrust': {
    pt: 'Hip thrust',
    aliases_pt: ['empurrada de quadril', 'thrust'],
    aliases_en: ['barbell hip thrust', 'glute bridge thrust'],
  },
  'glute bridge': {
    pt: 'Ponte de glúteo',
    aliases_pt: ['ponte glúteo', 'bridge'],
    aliases_en: ['glute bridge exercise'],
  },
  'goblet squat': {
    pt: 'Agachamento goblet',
    aliases_pt: ['agachamento goblet', 'agachamento cálice'],
    aliases_en: ['dumbbell goblet squat', 'kettlebell goblet squat'],
  },
  'sumo deadlift': {
    pt: 'Terra sumô',
    aliases_pt: ['terra sumo', 'deadlift sumo'],
    aliases_en: ['sumo deadlift', 'wide stance deadlift'],
  },
  'calf raise': {
    pt: 'Panturrilha',
    aliases_pt: ['panturrilha', 'elevação de panturrilha'],
    aliases_en: ['standing calf raise', 'seated calf raise'],
  },
  'standing calf raise': {
    pt: 'Panturrilha em pé',
    aliases_pt: ['panturrilha em pé', 'elevação panturrilha'],
    aliases_en: ['calf raise standing'],
  },
  'seated calf raise': {
    pt: 'Panturrilha sentado',
    aliases_pt: ['panturrilha sentado'],
    aliases_en: ['seated calf'],
  },
  'hip abduction': {
    pt: 'Abdução de quadril',
    aliases_pt: ['abdução', 'abdutora'],
    aliases_en: ['side-lying hip abduction', 'cable hip abduction'],
  },
  'hip adduction': {
    pt: 'Adução de quadril',
    aliases_pt: ['adução', 'adutora'],
    aliases_en: ['side-lying hip adduction', 'cable hip adduction'],
  },

  // ── Core / Abs ─────────────────────────────────────────────────────────────
  'crunch': {
    pt: 'Abdominal',
    aliases_pt: ['abdominal', 'crunch', 'supra'],
    aliases_en: ['sit-up', 'abs crunch'],
  },
  'plank': {
    pt: 'Prancha',
    aliases_pt: ['prancha', 'isometria abdominal'],
    aliases_en: ['front plank', 'forearm plank'],
  },
  'russian twist': {
    pt: 'Torção russa',
    aliases_pt: ['torção russa', 'russian twist', 'rotação'],
    aliases_en: ['russian twist abs'],
  },
  'leg raise': {
    pt: 'Elevação de perna',
    aliases_pt: ['elevação de perna', 'leg raise abdominal'],
    aliases_en: ['lying leg raise', 'hanging leg raise'],
  },
  'hanging leg raise': {
    pt: 'Elevação de perna suspenso',
    aliases_pt: ['elevação perna barra', 'knee raise hanging'],
    aliases_en: ['hanging knee raise'],
  },
  'cable crunch': {
    pt: 'Abdominal no cabo',
    aliases_pt: ['crunch cabo', 'abdominal cabo'],
    aliases_en: ['kneeling cable crunch', 'cable ab crunch'],
  },
  'pallof press': {
    pt: 'Pallof press',
    aliases_pt: ['anti-rotação', 'pressão lateral cabo'],
    aliases_en: ['anti-rotation press'],
  },
  'ab wheel rollout': {
    pt: 'Roda abdominal',
    aliases_pt: ['roda abdominal', 'rodinha'],
    aliases_en: ['ab roller', 'wheel rollout'],
  },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Normalize string for search: lowercase, remove accents, trim.
 */
export function normalizeStr(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Get the PT translation for an ExerciseDB exercise.
 * Falls back to auto-generating a reasonable PT name.
 */
export function getExercisePT(exerciseNameEN = '') {
  const key = exerciseNameEN.toLowerCase().trim();
  const entry = EXERCISE_TRANSLATIONS[key];
  if (entry) return entry.pt;

  // Auto-generate: title-case the EN name with word substitutions
  const wordMap = {
    barbell: 'com barra',
    dumbbell: 'com haltere',
    cable: 'no cabo',
    machine: 'na máquina',
    'body weight': 'peso corporal',
    kettlebell: 'kettlebell',
    'ez barbell': 'barra ez',
    bench: 'banco',
    press: 'press',
    row: 'remada',
    curl: 'rosca',
    fly: 'crucifixo',
    flye: 'crucifixo',
    raise: 'elevação',
    extension: 'extensão',
    pulldown: 'puxada',
    pushdown: 'extensão',
    squat: 'agachamento',
    lunge: 'afundo',
    deadlift: 'levantamento terra',
    thrust: 'thrust',
    bridge: 'ponte',
    crunch: 'abdominal',
    plank: 'prancha',
    shrug: 'encolhimento',
    dip: 'mergulho',
    'pull-up': 'barra fixa',
    'push-up': 'flexão',
    incline: 'inclinado',
    decline: 'declinado',
    standing: 'em pé',
    seated: 'sentado',
    lying: 'deitado',
    overhead: 'acima da cabeça',
    reverse: 'reverso',
    wide: 'pegada aberta',
    narrow: 'pegada fechada',
    close: 'pegada fechada',
    grip: 'pegada',
    single: 'unilateral',
    alternating: 'alternado',
    front: 'frontal',
    back: 'posterior',
    lateral: 'lateral',
    hammer: 'martelo',
    concentration: 'concentrado',
    preacher: 'scott',
    skull: 'testa',
    crusher: '',
    kickback: 'coice',
    face: 'facial',
    pull: 'puxada',
    hip: 'quadril',
    glute: 'glúteo',
    calf: 'panturrilha',
    leg: 'perna',
    upper: 'superior',
    lower: 'inferior',
  };

  let result = exerciseNameEN.toLowerCase();
  Object.entries(wordMap).forEach(([en, pt]) => {
    result = result.replace(new RegExp(`\\b${en}\\b`, 'gi'), pt);
  });

  // Title case
  return result
    .split(' ')
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Get all aliases (EN + PT) for an exercise.
 */
export function getExerciseAliases(exerciseNameEN = '') {
  const key = exerciseNameEN.toLowerCase().trim();
  const entry = EXERCISE_TRANSLATIONS[key];
  return {
    aliases_en: entry?.aliases_en || [],
    aliases_pt: entry?.aliases_pt || [],
  };
}

/**
 * Translate a PT search query to its EN equivalent for API calls.
 * Returns the best EN match, or the original query if no match.
 */
export function translateSearchQueryToEN(query = '') {
  const norm = normalizeStr(query);
  // Check full-phrase match first
  const fullMatch = PT_SEARCH_TO_EN[norm];
  if (fullMatch) return fullMatch;

  // Check partial word matches (longest match wins)
  const entries = Object.entries(PT_SEARCH_TO_EN).sort((a, b) => b[0].length - a[0].length);
  for (const [pt, en] of entries) {
    if (norm.includes(normalizeStr(pt))) return en;
  }
  return query;
}

/**
 * Translate a muscle name from EN to PT.
 */
export function muscleToPT(muscle = '') {
  return MUSCLE_EN_TO_PT[muscle.toLowerCase()] || muscle;
}

/**
 * Translate equipment from EN to PT.
 */
export function equipmentToPT(equipment = '') {
  return EQUIPMENT_EN_TO_PT[equipment.toLowerCase()] || equipment;
}

/**
 * Translate body part from EN to PT.
 */
export function bodyPartToPT(bodyPart = '') {
  return BODY_PART_EN_TO_PT[bodyPart.toLowerCase()] || bodyPart;
}
