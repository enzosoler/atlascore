/**
 * Realistic placeholder data for the redesign. One source of truth so every
 * screen screenshot renders with the same plausible user.
 */

export const mockUser = {
  id: 'usr_enzo',
  name: 'Enzo',
  email: 'enzo@chronoinnovation.com',
  avatar: null,
  role: 'athlete',
  plan: 'pro',
  trialEndsAt: null,
  createdAt: '2025-11-02',
  locale: 'en-US',
  units: { weight: 'kg', distance: 'km' },
};

export const mockToday = {
  readiness: 74,
  recovery: 68,
  strain: 12.4,
  sleepHours: 7.4,
  restingHr: 54,
  hrv: 64,
  streakDays: 23,
  tasks: [
    { id: 't1', title: 'Upper Body — Push',  kind: 'workout',  due: '6:30 PM', done: false },
    { id: 't2', title: 'Log lunch',          kind: 'nutrition', due: '1:00 PM', done: true },
    { id: 't3', title: 'Weekly body check-in', kind: 'body',    due: 'Today',   done: false },
  ],
};

export const mockMacros = {
  targets: { kcal: 2640, protein: 185, carbs: 280, fat: 82 },
  consumed:{ kcal: 1412, protein: 112, carbs: 148, fat: 41 },
};

export const mockMeals = [
  {
    id: 'm1', name: 'Breakfast', time: '7:40 AM',
    totals: { kcal: 612, protein: 42, carbs: 58, fat: 22 },
    items: [
      { id: 'f1', name: 'Overnight oats + whey', portion: '1 bowl',   kcal: 420, protein: 32, carbs: 48, fat: 14 },
      { id: 'f2', name: 'Blueberries',           portion: '80 g',     kcal: 46,  protein: 1,  carbs: 10, fat: 0 },
      { id: 'f3', name: 'Black coffee',          portion: '240 ml',   kcal: 2,   protein: 0,  carbs: 0,  fat: 0 },
      { id: 'f4', name: 'Almond butter',         portion: '1 tbsp',   kcal: 144, protein: 9,  carbs: 0,  fat: 8 },
    ],
  },
  {
    id: 'm2', name: 'Lunch', time: '1:10 PM',
    totals: { kcal: 800, protein: 70, carbs: 90, fat: 19 },
    items: [
      { id: 'f5', name: 'Grilled chicken bowl',  portion: '1 bowl',   kcal: 640, protein: 62, carbs: 70, fat: 14 },
      { id: 'f6', name: 'Greek yogurt',          portion: '150 g',    kcal: 160, protein: 8,  carbs: 20, fat: 5  },
    ],
  },
  {
    id: 'm3', name: 'Dinner', time: 'Planned',
    totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    items: [],
  },
  {
    id: 'm4', name: 'Snacks', time: 'Anytime',
    totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    items: [],
  },
];

export const mockExercise = {
  id: 'ex_bench',
  name: 'Barbell Bench Press',
  muscle: 'Chest',
  equipment: 'Barbell',
  history: [
    { date: '2026-04-15', sets: 4, topSet: '92.5 kg × 5' },
    { date: '2026-04-08', sets: 4, topSet: '90.0 kg × 6' },
  ],
};

export const mockActiveWorkout = {
  id: 'w1',
  name: 'Upper Body — Push',
  startedAt: '2026-04-17T18:31:00',
  blocks: [
    {
      id: 'b1',
      kind: 'straight',
      exercises: [{
        id: 'ex_bench',
        name: 'Barbell Bench Press',
        target: { sets: 4, reps: '5-7', rpe: 8 },
        sets: [
          { n: 1, kg: 70, reps: 8, rpe: 7, done: true  },
          { n: 2, kg: 85, reps: 6, rpe: 8, done: true  },
          { n: 3, kg: 92.5, reps: 5, rpe: 8.5, done: true },
          { n: 4, kg: 92.5, reps: null, rpe: null, done: false },
        ],
      }],
    },
    {
      id: 'b2',
      kind: 'superset',
      exercises: [
        { id: 'ex_ohp', name: 'Overhead Press', target: { sets: 3, reps: '8-10' }, sets: [] },
        { id: 'ex_row', name: 'Seated Row',     target: { sets: 3, reps: '10-12' }, sets: [] },
      ],
    },
  ],
};

export const mockWeightSeries = Array.from({ length: 28 }, (_, i) => ({
  date: new Date(Date.now() - (27 - i) * 86400000).toISOString().slice(0, 10),
  kg: 82.4 - i * 0.05 + Math.sin(i / 3) * 0.4,
}));

export const mockBiomarkers = [
  { id: 'bio_ldl',  name: 'LDL Cholesterol', value: 118, unit: 'mg/dL', range: [0, 100],  status: 'elevated'  },
  { id: 'bio_hdl',  name: 'HDL Cholesterol', value: 58,  unit: 'mg/dL', range: [40, 200], status: 'optimal'   },
  { id: 'bio_vitd', name: 'Vitamin D',       value: 28,  unit: 'ng/mL', range: [30, 80],  status: 'low'       },
  { id: 'bio_hba1c',name: 'HbA1c',           value: 5.2, unit: '%',     range: [0, 5.6],  status: 'optimal'   },
  { id: 'bio_ferr', name: 'Ferritin',        value: 94,  unit: 'ng/mL', range: [30, 400], status: 'optimal'   },
];

export const mockCoachMessages = [
  { id: 'c1', role: 'coach', ts: '8:02 AM', text: 'Morning. Your HRV is up 8% and sleep was solid — today looks like a good day to push intensity.' },
  { id: 'c2', role: 'user',  ts: '8:05 AM', text: 'Swap legs to pull instead?' },
  { id: 'c3', role: 'coach', ts: '8:05 AM', text: 'I can. Your last pull session was Saturday — three days ago. Want me to pull up your usual Pull A?', confidence: 0.92 },
];

export const mockInsights = [
  { id: 'i1', title: 'Protein target updated',       body: 'Increased to 185 g/day based on last 2 weeks of training volume.', tone: 'info' },
  { id: 'i2', title: 'Recovery trending down',       body: 'HRV has dropped 6% over 5 days. Consider a lighter session tomorrow.', tone: 'warning' },
  { id: 'i3', title: 'Weight trend: down 1.2 kg',    body: 'Across 28-day moving average. On track with your cut.', tone: 'success' },
];

export const mockPlans = [
  { id: 'weekly',  label: 'Weekly',   price: '$6.99',   sub: 'billed weekly',   trial: '3-day free trial', highlight: true },
  { id: 'annual',  label: 'Annual',   price: '$59.99',  sub: '$4.99/mo',        trial: '7-day free trial', badge: 'Save 40%' },
  { id: 'monthly', label: 'Monthly',  price: '$14.99',  sub: 'billed monthly' },
];
