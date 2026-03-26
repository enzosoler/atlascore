/**
 * base44Client.js — compatibility stub
 *
 * The @base44/sdk package has been removed. This stub preserves the same API
 * surface used across the codebase so the build succeeds while individual
 * pages/components are progressively migrated to Supabase.
 *
 * All entity methods return resolved Promises with empty data so callers
 * degrade gracefully instead of throwing at runtime.
 */

function createEntityStub() {
  return {
    list:   () => Promise.resolve([]),
    all:    () => Promise.resolve([]),
    filter: () => Promise.resolve([]),
    get:    () => Promise.resolve(null),
    create: (data) => Promise.resolve({ id: null, ...data }),
    update: (id, data) => Promise.resolve({ id, ...data }),
    delete: () => Promise.resolve(null),
  };
}

const entityNames = [
  'Achievement', 'ClinicianPatient', 'CoachStudent', 'DailyCheckin',
  'DietPlan', 'EntitlementOverride', 'ExerciseLog', 'ExerciseMaster',
  'FoodLog', 'FoodMaster', 'LabExam', 'Meal', 'Measurement',
  'NutritionistClientLink', 'PrescribedDiet', 'PrescribedWorkout',
  'ProgressPhoto', 'Protocol', 'Routine', 'Subscription', 'UserProfile',
  'Workout', 'WorkoutPlan',
];

const entities = {};
for (const name of entityNames) {
  entities[name] = createEntityStub();
}

export const base44 = {
  entities,
  functions: {
    invoke: () => Promise.resolve(null),
  },
  integrations: {
    Core: {
      InvokeLLM: () => {
        console.warn('[base44 stub] InvokeLLM called — base44 has been removed. Migrate to a direct OpenAI/Supabase call.');
        return Promise.resolve(null);
      },
    },
  },
  auth: {
    me: () => Promise.resolve(null),
  },
};
