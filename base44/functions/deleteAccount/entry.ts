import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const USER_SCOPED_ENTITIES = [
  'Achievement',
  'DailyCheckin',
  'DietPlan',
  'ExerciseLog',
  'FoodLog',
  'LabExam',
  'Meal',
  'Measurement',
  'Post',
  'PrescribedDiet',
  'PrescribedWorkout',
  'ProgressPhoto',
  'Protocol',
  'Routine',
  'Supplement',
  'UserProfile',
  'Workout',
  'WorkoutPlan',
];

const deleteRecords = async (entityApi, records) => {
  await Promise.allSettled(records.map((record) => entityApi.delete(record.id)));
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (body?.confirmation !== 'DELETE') {
      return Response.json({ error: 'Confirmation required' }, { status: 400 });
    }

    const deleted = {};

    for (const entityName of USER_SCOPED_ENTITIES) {
      const entityApi = base44.entities[entityName];
      const adminEntityApi = base44.asServiceRole.entities[entityName];

      if (!entityApi || !adminEntityApi) continue;

      try {
        const records = await entityApi.list('-created_date', 500);
        deleted[entityName] = records.length;
        await deleteRecords(adminEntityApi, records);
      } catch (error) {
        console.warn(`deleteAccount: failed to delete ${entityName}`, error?.message || error);
      }
    }

    const relationshipDeletes = [
      ['Subscription', [{ user_email: user.email }, { user_id: user.id }]],
      ['EntitlementOverride', [{ user_email: user.email }]],
      ['CoachStudent', [{ coach_email: user.email }, { student_email: user.email }]],
      ['NutritionistClientLink', [{ nutritionist_email: user.email }, { client_email: user.email }]],
      ['ClinicianPatient', [{ clinician_email: user.email }, { patient_email: user.email }]],
    ];

    for (const [entityName, filters] of relationshipDeletes) {
      const entityApi = base44.asServiceRole.entities[entityName];
      if (!entityApi) continue;

      const seenIds = new Set();
      let total = 0;

      for (const filter of filters) {
        try {
          const records = await entityApi.filter(filter);
          const uniqueRecords = records.filter((record) => {
            if (seenIds.has(record.id)) return false;
            seenIds.add(record.id);
            return true;
          });
          total += uniqueRecords.length;
          await deleteRecords(entityApi, uniqueRecords);
        } catch (error) {
          console.warn(`deleteAccount: failed relationship cleanup for ${entityName}`, error?.message || error);
        }
      }

      deleted[entityName] = total;
    }

    await base44.asServiceRole.entities.User.delete(user.id);

    console.log(`deleteAccount: deleted account ${user.email}`);
    return Response.json({ success: true, deleted });
  } catch (error) {
    console.error('deleteAccount error:', error?.message || error);
    return Response.json({ error: error?.message || 'Account deletion failed' }, { status: 500 });
  }
});
