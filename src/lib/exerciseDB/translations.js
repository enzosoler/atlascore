/**
 * Atlas Core — Exercise System (English-only)
 *
 * This file exports stubs to maintain API compatibility.
 * Legacy locale translation support has been removed.
 */

// ─── Stubs for compatibility ────────────────────────────────────────────────

export const MUSCLE_EN_TO_PT = {};
export const EQUIPMENT_EN_TO_PT = {};
export const BODY_PART_EN_TO_PT = {};
export const PT_SEARCH_TO_EN = {};
export const EXERCISE_TRANSLATIONS = {
  // Chest exercises
  'Bench Press': { pt: 'Supino Reto', aliases_en: ['chest press', 'barbell bench'], aliases_pt: ['supino', 'peito reto'], primary_muscles: ['chest'], equipment: 'barbell', exercise_db_id: '0031' },
  'Incline Bench Press': { pt: 'Supino Inclinado', aliases_en: ['incline press', 'upper chest press'], aliases_pt: ['supino inclinado'], primary_muscles: ['chest', 'shoulders'], equipment: 'barbell', exercise_db_id: '0041' },
  'Decline Bench Press': { pt: 'Supino Declinado', aliases_en: ['decline press'], aliases_pt: ['supino declinado'], primary_muscles: ['chest'], equipment: 'barbell', exercise_db_id: '0030' },
  'Dumbbell Bench Press': { pt: 'Supino com Halteres', aliases_en: ['db bench press', 'dumbbell press'], aliases_pt: ['supino halteres'], primary_muscles: ['chest'], equipment: 'dumbbell', exercise_db_id: '0289' },
  'Dumbbell Flyes': { pt: 'Crucifixo com Halteres', aliases_en: ['db flyes', 'dumbbell fly', 'chest fly'], aliases_pt: ['crucifixo', 'fly'], primary_muscles: ['chest'], equipment: 'dumbbell', exercise_db_id: '0296' },
  'Cable Crossover': { pt: 'Crossover', aliases_en: ['cable flyes', 'cable cross'], aliases_pt: ['cabo cruzado'], primary_muscles: ['chest'], equipment: 'cable', exercise_db_id: '1273' },
  'Push Up': { pt: 'Flexão', aliases_en: ['pushup', 'press up'], aliases_pt: ['flexao', 'polichinelo'], primary_muscles: ['chest'], equipment: 'body weight', exercise_db_id: '0662' },
  'Chest Press Machine': { pt: 'Supino Máquina', aliases_en: ['machine press'], aliases_pt: ['supino aparelho'], primary_muscles: ['chest'], equipment: 'machine', exercise_db_id: '0597' },
  'Pec Deck': { pt: 'Peck Deck', aliases_en: ['pec deck fly', 'butterfly'], aliases_pt: ['borboleta', 'voador'], primary_muscles: ['chest'], equipment: 'machine', exercise_db_id: '0595' },
  
  // Legs - Quadriceps
  'Squat': { pt: 'Agachamento', aliases_en: ['back squat', 'barbell squat'], aliases_pt: ['agachamento livre', 'agachamento barra'], primary_muscles: ['quadriceps', 'glutes'], equipment: 'barbell', exercise_db_id: '0116' },
  'Front Squat': { pt: 'Agachamento Frontal', aliases_en: ['front barbell squat'], aliases_pt: ['agachamento frontal'], primary_muscles: ['quadriceps'], equipment: 'barbell', exercise_db_id: '0825' },
  'Goblet Squat': { pt: 'Agachamento Goblet', aliases_en: [], aliases_pt: [], primary_muscles: ['quadriceps', 'glutes'], equipment: 'dumbbell', exercise_db_id: '0805' },
  'Leg Press': { pt: 'Leg Press', aliases_en: ['sled press'], aliases_pt: ['prensa de pernas'], primary_muscles: ['quadriceps'], equipment: 'machine', exercise_db_id: '0739' },
  'Leg Extension': { pt: 'Cadeira Extensora', aliases_en: ['extensions'], aliases_pt: ['extensora'], primary_muscles: ['quadriceps'], equipment: 'machine', exercise_db_id: '0588' },
  'Hack Squat': { pt: 'Agachamento Hack', aliases_en: [], aliases_pt: ['hack'], primary_muscles: ['quadriceps'], equipment: 'machine', exercise_db_id: '0743' },
  'Smith Machine Squat': { pt: 'Agachamento Smith', aliases_en: [], aliases_pt: ['agachamento smith'], primary_muscles: ['quadriceps'], equipment: 'smith machine', exercise_db_id: '0741' },
  
  // Legs - Hamstrings/Glutes
  'Romanian Deadlift': { pt: 'Levantamento Terra Romeno', aliases_en: ['rdl'], aliases_pt: ['terra romano'], primary_muscles: ['hamstrings', 'glutes'], equipment: 'barbell', exercise_db_id: '0798' },
  'Stiff Leg Deadlift': { pt: 'Terra com Pernas Rígidas', aliases_en: ['sldl'], aliases_pt: [], primary_muscles: ['hamstrings'], equipment: 'barbell', exercise_db_id: '0784' },
  'Leg Curl': { pt: 'Mesa Flexora', aliases_en: ['hamstring curl', 'lying leg curl'], aliases_pt: ['flexora'], primary_muscles: ['hamstrings'], equipment: 'machine', exercise_db_id: '0586' },
  'Hip Thrust': { pt: 'Hip Thrust', aliases_en: [], aliases_pt: ['empurrada de quadril'], primary_muscles: ['glutes'], equipment: 'barbell', exercise_db_id: '1494' },
  'Glute Bridge': { pt: 'Ponte de Glúteos', aliases_en: [], aliases_pt: ['ponte'], primary_muscles: ['glutes'], equipment: 'body weight', exercise_db_id: '0880' },
  'Single Leg Glute Bridge': { pt: 'Ponte Unilateral', aliases_en: [], aliases_pt: ['ponte uma perna'], primary_muscles: ['glutes'], equipment: 'body weight', exercise_db_id: '0881' },
  'Lunges': { pt: 'Afundo', aliases_en: ['split squat', 'walking lunge'], aliases_pt: ['afundo'], primary_muscles: ['quadriceps', 'glutes'], equipment: 'dumbbell', exercise_db_id: '0336' },
  'Bulgarian Split Squat': { pt: 'Afundo Búlgaro', aliases_en: ['bulgarian squat'], aliases_pt: ['afundo bulgaro'], primary_muscles: ['quadriceps'], equipment: 'dumbbell', exercise_db_id: '0334' },
  'Step Up': { pt: 'Subida no Banco', aliases_en: [], aliases_pt: ['step'], primary_muscles: ['quadriceps'], equipment: 'dumbbell', exercise_db_id: '0613' },
  
  // Calves
  'Standing Calf Raise': { pt: 'Panturrilha em Pé', aliases_en: ['calf raises'], aliases_pt: ['panturrilha'], primary_muscles: ['calves'], equipment: 'machine', exercise_db_id: '0417' },
  'Seated Calf Raise': { pt: 'Panturrilha Sentado', aliases_en: [], aliases_pt: [], primary_muscles: ['calves'], equipment: 'machine', exercise_db_id: '0416' },
  'Calf Press': { pt: 'Panturrilha no Leg Press', aliases_en: [], aliases_pt: [], primary_muscles: ['calves'], equipment: 'machine', exercise_db_id: '1374' },
  
  // Back
  'Deadlift': { pt: 'Levantamento Terra', aliases_en: ['conventional deadlift'], aliases_pt: ['terra', 'leve terra'], primary_muscles: ['back', 'hamstrings'], equipment: 'barbell', exercise_db_id: '0032' },
  'Sumo Deadlift': { pt: 'Terra Sumo', aliases_en: [], aliases_pt: ['terra sumo'], primary_muscles: ['back', 'glutes'], equipment: 'barbell', exercise_db_id: '0061' },
  'Pull Up': { pt: 'Barra Fixa', aliases_en: ['chin up', 'pullup'], aliases_pt: ['barra', 'puxada na barra'], primary_muscles: ['lats'], equipment: 'body weight', exercise_db_id: '0652' },
  'Chin Up': { pt: 'Pegada Supinada', aliases_en: ['supinated pull up'], aliases_pt: ['barra supinada'], primary_muscles: ['biceps', 'lats'], equipment: 'body weight', exercise_db_id: '0651' },
  'Lat Pulldown': { pt: 'Puxada Aberta', aliases_en: ['pulldown', 'wide grip pulldown'], aliases_pt: ['puxada costas', 'puxada alta'], primary_muscles: ['lats'], equipment: 'cable', exercise_db_id: '0015' },
  'Bent Over Row': { pt: 'Remada Curvada', aliases_en: ['barbell row'], aliases_pt: ['remada', 'remada barra'], primary_muscles: ['lats', 'back'], equipment: 'barbell', exercise_db_id: '0047' },
  'One Arm Dumbbell Row': { pt: 'Remada Unilateral', aliases_en: ['single arm row', 'db row'], aliases_pt: ['remada com halter', 'remada braço'], primary_muscles: ['lats'], equipment: 'dumbbell', exercise_db_id: '0291' },
  'Seated Cable Row': { pt: 'Remada Sentada', aliases_en: ['cable row'], aliases_pt: ['remada no cabo'], primary_muscles: ['back'], equipment: 'cable', exercise_db_id: '0861' },
  'T-Bar Row': { pt: 'Remada T', aliases_en: ['tbar row'], aliases_pt: ['remada t'], primary_muscles: ['back'], equipment: 'barbell', exercise_db_id: '0245' },
  'Face Pull': { pt: 'Face Pull', aliases_en: [], aliases_pt: [], primary_muscles: ['shoulders', 'back'], equipment: 'cable', exercise_db_id: '0918' },
  'Cable Pullover': { pt: 'Pullover no Cabo', aliases_en: [], aliases_pt: ['puxada overhead'], primary_muscles: ['lats'], equipment: 'cable', exercise_db_id: '0976' },
  'Inverted Row': { pt: 'Remada Invertida', aliases_en: ['australian pull up'], aliases_pt: ['remada invertida', 'remada australiana'], primary_muscles: ['back'], equipment: 'body weight', exercise_db_id: '0210' },
  'Good Morning': { pt: 'Good Morning', aliases_en: [], aliases_pt: [], primary_muscles: ['hamstrings', 'back'], equipment: 'barbell', exercise_db_id: '0785' },
  'Hyperextension': { pt: 'Hiperextensão', aliases_en: ['back extension'], aliases_pt: ['hiperextensao lombar'], primary_muscles: ['back'], equipment: 'body weight', exercise_db_id: '0409' },
  'Landmine Row': { pt: 'Landmine Row', aliases_en: [], aliases_pt: ['remada landmine'], primary_muscles: ['back'], equipment: 'barbell', exercise_db_id: '2150' },
  
  // Shoulders
  'Overhead Press': { pt: 'Desenvolvimento', aliases_en: ['shoulder press', 'military press', 'ohp'], aliases_pt: ['desenvolvimento ombros', 'desenvolvimento em pé'], primary_muscles: ['shoulders'], equipment: 'barbell', exercise_db_id: '0426' },
  'Dumbbell Shoulder Press': { pt: 'Desenvolvimento com Halteres', aliases_en: ['seated db press', 'dumbbell press'], aliases_pt: ['desenvolvimento halteres'], primary_muscles: ['shoulders'], equipment: 'dumbbell', exercise_db_id: '0405' },
  'Arnold Press': { pt: 'Desenvolvimento Arnold', aliases_en: [], aliases_pt: [], primary_muscles: ['shoulders'], equipment: 'dumbbell', exercise_db_id: '2137' },
  'Lateral Raise': { pt: 'Elevação Lateral', aliases_en: ['side raises', 'lat raise'], aliases_pt: ['crucifixo lateral', 'elevação ombro'], primary_muscles: ['shoulders'], equipment: 'dumbbell', exercise_db_id: '0334' },
  'Front Raise': { pt: 'Elevação Frontal', aliases_en: [], aliases_pt: [], primary_muscles: ['shoulders'], equipment: 'dumbbell', exercise_db_id: '0310' },
  'Rear Delt Fly': { pt: 'Crucifixo Inverso', aliases_en: ['reverse fly', 'rear delt raise'], aliases_pt: ['crucifixo inverso'], primary_muscles: ['shoulders'], equipment: 'dumbbell', exercise_db_id: '0215' },
  'Shrugs': { pt: 'Encolhimento', aliases_en: ['traps', 'shoulder shrugs'], aliases_pt: ['encolhimento de ombros'], primary_muscles: ['traps'], equipment: 'dumbbell', exercise_db_id: '0406' },
  'Upright Row': { pt: 'Remada Vertical', aliases_en: [], aliases_pt: [], primary_muscles: ['traps', 'shoulders'], equipment: 'barbell', exercise_db_id: '0067' },
  'Cable Lateral Raise': { pt: 'Elevação Lateral no Cabo', aliases_en: [], aliases_pt: [], primary_muscles: ['shoulders'], equipment: 'cable', exercise_db_id: '0242' },
  'Landmine Press': { pt: 'Landmine Press', aliases_en: [], aliases_pt: ['desenvolvimento landmine'], primary_muscles: ['chest', 'shoulders'], equipment: 'barbell', exercise_db_id: '2149' },
  'Shoulder Press Machine': { pt: 'Desenvolvimento Máquina', aliases_en: [], aliases_pt: ['desenvolvimento aparelho'], primary_muscles: ['shoulders'], equipment: 'machine', exercise_db_id: '0598' },
  'Lateral Raise Machine': { pt: 'Elevação Lateral Máquina', aliases_en: [], aliases_pt: [], primary_muscles: ['shoulders'], equipment: 'machine', exercise_db_id: '0599' },
  
  // Biceps
  'Barbell Curl': { pt: 'Rosca Direta', aliases_en: ['bb curl', 'bar curl'], aliases_pt: ['rosca barra', 'rosca direta'], primary_muscles: ['biceps'], equipment: 'barbell', exercise_db_id: '0030' },
  'Dumbbell Curl': { pt: 'Rosca Alternada', aliases_en: ['db curl', 'bicep curl'], aliases_pt: ['rosca halter', 'rosca biceps'], primary_muscles: ['biceps'], equipment: 'dumbbell', exercise_db_id: '0291' },
  'Hammer Curl': { pt: 'Rosca Martelo', aliases_en: [], aliases_pt: ['martelo'], primary_muscles: ['biceps', 'forearms'], equipment: 'dumbbell', exercise_db_id: '0317' },
  'Preacher Curl': { pt: 'Rosca Scott', aliases_en: ['scott curl'], aliases_pt: ['rosca scott'], primary_muscles: ['biceps'], equipment: 'barbell', exercise_db_id: '1624' },
  'Concentration Curl': { pt: 'Rosca Concentrada', aliases_en: [], aliases_pt: [], primary_muscles: ['biceps'], equipment: 'dumbbell', exercise_db_id: '0302' },
  'Incline Dumbbell Curl': { pt: 'Rosca Inclinada', aliases_en: [], aliases_pt: [], primary_muscles: ['biceps'], equipment: 'dumbbell', exercise_db_id: '0318' },
  'Cable Curl': { pt: 'Rosca no Cabo', aliases_en: [], aliases_pt: [], primary_muscles: ['biceps'], equipment: 'cable', exercise_db_id: '0149' },
  'Bicep Curl Machine': { pt: 'Rosca Scott Máquina', aliases_en: ['machine curl'], aliases_pt: ['rosca aparelho'], primary_muscles: ['biceps'], equipment: 'machine', exercise_db_id: '0594' },
  
  // Triceps
  'Triceps Pushdown': { pt: 'Puxador Tríceps', aliases_en: ['cable pushdown', 'tricep pushdown'], aliases_pt: ['puxada triceps', 'triceps corda'], primary_muscles: ['triceps'], equipment: 'cable', exercise_db_id: '0201' },
  'Skullcrusher': { pt: 'Tríceps Testa', aliases_en: ['lying triceps extension', 'french press'], aliases_pt: ['triceps deitado', 'triceps testa'], primary_muscles: ['triceps'], equipment: 'barbell', exercise_db_id: '1716' },
  'Overhead Triceps Extension': { pt: 'Tríceps Francês', aliases_en: ['tricep extension'], aliases_pt: ['triceps no cabo', 'extensão triceps'], primary_muscles: ['triceps'], equipment: 'cable', exercise_db_id: '0200' },
  'Close Grip Bench Press': { pt: 'Supino Fechado', aliases_en: ['cg bench', 'close grip press'], aliases_pt: ['supino pegada fechada'], primary_muscles: ['triceps'], equipment: 'barbell', exercise_db_id: '0259' },
  'Diamond Push Up': { pt: 'Flexão Diamante', aliases_en: [], aliases_pt: [], primary_muscles: ['triceps'], equipment: 'body weight', exercise_db_id: '0287' },
  'Dips': { pt: 'Paralelas', aliases_en: ['tricep dips', 'chest dips'], aliases_pt: ['paralela', 'mergulho'], primary_muscles: ['chest', 'triceps'], equipment: 'body weight', exercise_db_id: '0253' },
  'Cable Triceps Extension': { pt: 'Tríceps no Cabo', aliases_en: [], aliases_pt: [], primary_muscles: ['triceps'], equipment: 'cable', exercise_db_id: '0199' },
  'Rope Pushdown': { pt: 'Tríceps Corda', aliases_en: ['tricep rope'], aliases_pt: ['corda'], primary_muscles: ['triceps'], equipment: 'cable', exercise_db_id: '0202' },
  'Triceps Extension Machine': { pt: 'Tríceps Máquina', aliases_en: [], aliases_pt: ['triceps aparelho'], primary_muscles: ['triceps'], equipment: 'machine', exercise_db_id: '0593' },
  
  // Abs/Core
  'Crunches': { pt: 'Abdominal', aliases_en: ['sit up', 'ab crunch'], aliases_pt: ['abdominal supra'], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0276' },
  'Leg Raises': { pt: 'Elevação de Pernas', aliases_en: ['hanging leg raise', 'lying leg raise'], aliases_pt: ['abdominal infra', 'elevacao perna'], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0445' },
  'Plank': { pt: 'Prancha', aliases_en: [], aliases_pt: [], primary_muscles: ['abs', 'core'], equipment: 'body weight', exercise_db_id: '0466' },
  'Russian Twist': { pt: 'Twist Russo', aliases_en: [], aliases_pt: ['torcao russa'], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0879' },
  'Hanging Knee Raise': { pt: 'Abdominal na Barra', aliases_en: [], aliases_pt: [], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0444' },
  'Ab Wheel': { pt: 'Roda Abdominal', aliases_en: ['ab rollout'], aliases_pt: ['roda'], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0271' },
  'Cable Crunch': { pt: 'Abdominal no Cabo', aliases_en: [], aliases_pt: [], primary_muscles: ['abs'], equipment: 'cable', exercise_db_id: '0211' },
  'Mountain Climber': { pt: 'Escalador', aliases_en: [], aliases_pt: ['escalada'], primary_muscles: ['abs', 'cardio'], equipment: 'body weight', exercise_db_id: '0632' },
  'Bicycle Crunch': { pt: 'Abdominal Bicicleta', aliases_en: [], aliases_pt: [], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0277' },
  'Roman Chair Leg Raise': { pt: 'Elevação de Pernas na Cadeira', aliases_en: [], aliases_pt: [], primary_muscles: ['abs'], equipment: 'body weight', exercise_db_id: '0446' },
  
  // Forearms
  'Wrist Curl': { pt: 'Rosca de Punho', aliases_en: [], aliases_pt: [], primary_muscles: ['forearms'], equipment: 'dumbbell', exercise_db_id: '0414' },
  'Reverse Wrist Curl': { pt: 'Rosca de Punho Inversa', aliases_en: [], aliases_pt: [], primary_muscles: ['forearms'], equipment: 'dumbbell', exercise_db_id: '0413' },
  'Farmer Walk': { pt: 'Caminhada do Agricultor', aliases_en: ['farmers carry'], aliases_pt: ['farmer walk'], primary_muscles: ['forearms'], equipment: 'dumbbell', exercise_db_id: '0407' },
  
  // Cardio/Other
  'Kettlebell Swing': { pt: 'Kettlebell Swing', aliases_en: [], aliases_pt: ['swing'], primary_muscles: ['glutes', 'hamstrings'], equipment: 'kettlebell', exercise_db_id: '0521' },
  'Turkish Get Up': { pt: 'Levantamento Turco', aliases_en: [], aliases_pt: [], primary_muscles: ['shoulders', 'core'], equipment: 'kettlebell', exercise_db_id: '0520' },
  'Box Jump': { pt: 'Salto no Caixote', aliases_en: [], aliases_pt: ['box jump'], primary_muscles: ['quadriceps'], equipment: 'body weight', exercise_db_id: '0298' },
  'Burpee': { pt: 'Burpee', aliases_en: [], aliases_pt: [], primary_muscles: ['full body'], equipment: 'body weight', exercise_db_id: '0411' },
  'Jumping Jacks': { pt: 'Polichinelo', aliases_en: ['star jumps'], aliases_pt: ['polichinelo'], primary_muscles: ['cardio'], equipment: 'body weight', exercise_db_id: '0270' },
  'Running': { pt: 'Corrida', aliases_en: ['jogging'], aliases_pt: ['corrida'], primary_muscles: ['cardio'], equipment: 'body weight', exercise_db_id: '0630' },
  'Rowing': { pt: 'Remo', aliases_en: ['rower'], aliases_pt: ['remo'], primary_muscles: ['cardio', 'back'], equipment: 'machine', exercise_db_id: '2135' },
  'Elliptical': { pt: 'Elíptico', aliases_en: ['cross trainer'], aliases_pt: ['eliptico'], primary_muscles: ['cardio'], equipment: 'machine', exercise_db_id: '2136' },
  
  // Additional exercises
  'Smith Machine Bench Press': { pt: 'Supino Smith', aliases_en: [], aliases_pt: ['supino smith'], primary_muscles: ['chest'], equipment: 'smith machine', exercise_db_id: '0745' },
  'Seated Leg Curl': { pt: 'Cadeira Flexora', aliases_en: ['seated hamstring curl'], aliases_pt: ['flexora sentado'], primary_muscles: ['hamstrings'], equipment: 'machine', exercise_db_id: '0590' },
  'Abductor Machine': { pt: 'Abdutora', aliases_en: ['hip abductor'], aliases_pt: ['abdutora'], primary_muscles: ['glutes'], equipment: 'machine', exercise_db_id: '0591' },
  'Adductor Machine': { pt: 'Adutora', aliases_en: ['hip adductor'], aliases_pt: ['adutora'], primary_muscles: ['adductors'], equipment: 'machine', exercise_db_id: '0592' },
  'Zercher Squat': { pt: 'Agachamento Zercher', aliases_en: [], aliases_pt: [], primary_muscles: ['quadriceps'], equipment: 'barbell', exercise_db_id: '0826' },
  'Sissy Squat': { pt: 'Agachamento Sissy', aliases_en: [], aliases_pt: [], primary_muscles: ['quadriceps'], equipment: 'body weight', exercise_db_id: '1785' },
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
 * Get the exercise name in English (no translation).
 */
export function getExercisePT(exerciseNameEN = '') {
  return exerciseNameEN;
}

/**
 * Get all aliases for an exercise.
 */
export function getExerciseAliases(exerciseNameEN = '') {
  return {
    aliases_en: [],
    aliases_pt: [],
  };
}

/**
 * Translate a search query (pass-through).
 */
export function translateSearchQueryToEN(query = '') {
  return query;
}

/**
 * Return muscle name as-is (no translation).
 */
export function muscleToPT(muscle = '') {
  return muscle;
}

/**
 * Return equipment as-is (no translation).
 */
export function equipmentToPT(equipment = '') {
  return equipment;
}

/**
 * Return body part as-is (no translation).
 */
export function bodyPartToPT(bodyPart = '') {
  return bodyPart;
}
