import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PLAN_ENTITLEMENTS = {
  free: ['today_basic','diary','nutrition_tracking','workout_tracking','measurements','my_diet_read','my_workout_read','profile'],
  pro: ['today_basic','diary','nutrition_tracking','workout_tracking','measurements','my_diet_read','my_workout_read','profile','atlas_ai','lab_exams','progress_photos','ai_diet_generation','ai_workout_generation','standard_exports','social_cards'],
  performance: ['today_basic','diary','nutrition_tracking','workout_tracking','measurements','my_diet_read','my_workout_read','profile','atlas_ai','lab_exams','progress_photos','ai_diet_generation','ai_workout_generation','standard_exports','social_cards','advanced_protocol_tracking','dose_timeline','premium_exports','macro_view_premium'],
  coach: ['coach_dashboard','coach_students','coach_create_diet','coach_edit_diet','coach_create_workout','coach_edit_workout'],
  nutritionist: ['nutritionist_dashboard','nutritionist_clients','nutritionist_create_diet','nutritionist_edit_diet','nutritionist_exports'],
  clinician: ['clinician_dashboard','clinician_patients','clinician_lab_access','clinician_protocol_access','clinician_exports'],
};

async function assertFeatureAccess(base44, user, featureKey) {
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'admin' || user.atlas_role === 'admin') return;
  const now = new Date().toISOString().split('T')[0];
  const [allSubs, allOverrides] = await Promise.all([
    base44.asServiceRole.entities.Subscription.filter({ user_email: user.email }),
    base44.asServiceRole.entities.EntitlementOverride.filter({ user_email: user.email }),
  ]);
  const activeSub = allSubs.find(s => ['active','trialing'].includes(s.status) && (!s.ends_at || s.ends_at >= now));
  const effectivePlan = activeSub?.plan_code || 'free';
  const allowed = new Set(PLAN_ENTITLEMENTS[effectivePlan] || PLAN_ENTITLEMENTS.free);
  for (const o of allOverrides) {
    if (o.feature_key !== featureKey) continue;
    if (o.expires_at && o.expires_at < now) continue;
    if (o.enabled) allowed.add(featureKey);
    else allowed.delete(featureKey);
  }
  if (!allowed.has(featureKey)) {
    throw Object.assign(new Error(`Your current plan (${effectivePlan}) does not include ${featureKey}. Upgrade to continue.`), { status: 403 });
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    await assertFeatureAccess(base44, user, 'ai_workout_generation');

    const body = await req.json();
    const { date, profile, wizard } = body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const w = wizard || {};

    const experience = w.experience || profile?.training_experience || 'intermediate';
    const focus = w.focus || profile?.training_focus || 'hypertrophy';
    const equipment = w.equipment || profile?.training_equipment || 'full gym';
    const injuries = w.injuries || profile?.injuries || 'none';
    const daysPerWeek = w.days_per_week || profile?.training_days_per_week || 4;
    const sessionMinutes = w.session_minutes || profile?.training_session_minutes || 60;
    const muscularFocus = w.muscular_focus || 'choose the best muscle group for today based on recovery';
    const methodology = w.methodology || profile?.training_methodology || 'traditional strength training';

    // Derive training focus from goal
    const goalToFocus = {
      fat_loss: 'muscle definition and higher calorie expenditure',
      muscle_gain: 'hypertrophy and training volume',
      recomp: 'body recomposition with moderate-to-high intensity',
      performance: 'strength and athletic performance',
      health: 'overall health and conditioning',
      longevity: 'longevity with controlled intensity',
    };
    const derivedFocus = goalToFocus[(profile?.health_goals || [])[0]] || focus;

    // Determine rep/set scheme by experience
    const repSchemes = {
      beginner: '3 sets × 12-15 reps, RIR 3-4, light to moderate loading',
      intermediate: '4 sets × 8-12 reps, RIR 2-3, linear progression',
      advanced: '4-5 sets × 6-10 reps, RIR 1-2, advanced methods when useful',
      expert: '5 sets × 5-8 reps, RIR 0-2, intra-week periodization',
    };
    const repGuideline = repSchemes[experience] || repSchemes.intermediate;

    const prompt = `You are an expert coach specializing in hypertrophy, strength, and recomposition. Generate a COMPLETE and HIGHLY PERSONALIZED workout plan in polished natural English.

ATHLETE PROFILE (use ALL of this context):
- Body weight: ${profile?.current_weight || 80}kg
- Primary goal: ${profile?.training_goal || profile?.health_goals?.join(', ') || 'hypertrophy'}
- Derived focus from goal: ${derivedFocus}
- Experience level: ${experience}
- Available equipment: ${equipment}
- Injuries or limitations: ${injuries}
- Weekly frequency: ${daysPerWeek} sessions per week
- Session duration: ${sessionMinutes} minutes
- Preferred methodology: ${methodology}
- General activity level: ${profile?.activity_level || 'moderate'}
- Age: ${profile?.age || 30}
- Sex: ${profile?.sex === 'female' ? 'Female' : 'Male'}

MUSCULAR FOCUS FOR THIS SESSION: ${muscularFocus}

RECOMMENDED SET/REP GUIDELINE FOR THIS LEVEL:
${repGuideline}

CRITICAL RULES:
1. Generate 5-7 exercises appropriate for the "${experience}" level. They should be challenging but realistic.
2. NEVER include exercises that worsen the listed injuries or limitations (${injuries}).
3. RIR should match the goal: strength = 1-2, hypertrophy = 2-3, fat loss/definition = 2-4.
4. Recommend realistic loading based on the athlete profile. Beginners should not receive aggressive loading prescriptions, and advanced athletes should show credible progression.
5. The workout name must reflect the muscular focus, for example "Chest and Triceps - Volume" instead of "Workout A".
6. Execution notes must be specific and useful, not generic.
7. Total duration should stay close to ${sessionMinutes} minutes.
8. Do not generate a generic template. Personalize the program using the full profile above.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          name:             { type: 'string' },
          type:             { type: 'string', enum: ['strength','cardio','hiit','flexibility','sport','other'] },
          duration_minutes: { type: 'number' },
          perceived_effort: { type: 'number' },
          notes:            { type: 'string' },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name:          { type: 'string' },
                muscle_groups: { type: 'array', items: { type: 'string' } },
                equipment:     { type: 'string' },
                notes:         { type: 'string' },
                sets: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { reps: { type: 'number' }, weight: { type: 'number' }, rir: { type: 'number' } }
                  }
                }
              }
            }
          },
        }
      }
    });

    const normalizedExercises = (result?.exercises || []).map(ex => ({
      name:          typeof ex.name === 'string' ? ex.name : String(ex.name ?? ''),
      muscle_groups: Array.isArray(ex.muscle_groups) ? ex.muscle_groups.map(String) : [],
      equipment:     typeof ex.equipment === 'string' ? ex.equipment : String(ex.equipment ?? ''),
      notes:         typeof ex.notes === 'string' ? ex.notes : '',
      sets: (Array.isArray(ex.sets) ? ex.sets : []).map(s => ({
        reps:   Number(s.reps)   || 10,
        weight: Number(s.weight) || 0,
        rir:    Number(s.rir)    || 2,
      })),
    }));

    const volumeLoad = normalizedExercises.reduce((acc, ex) =>
      acc + ex.sets.reduce((s, set) => s + (set.reps * set.weight), 0), 0);

    const workout = await base44.entities.Workout.create({
      name:             typeof result?.name === 'string' ? result.name : 'AI-generated workout',
      type:             result?.type || 'strength',
      duration_minutes: Number(result?.duration_minutes) || sessionMinutes,
      perceived_effort: Number(result?.perceived_effort) || 7,
      notes:            typeof result?.notes === 'string' ? result.notes : '',
      exercises:        normalizedExercises,
      date:             targetDate,
      completed:        false,
      volume_load:      volumeLoad,
    });

    console.log(`generateWorkout: ${user.email} generated workout for ${targetDate}`);
    return Response.json({ success: true, workout });
  } catch (error) {
    const status = error.status || 500;
    console.error(`generateWorkout error [${status}]:`, error.message);
    return Response.json({ error: error.message }, { status });
  }
});
