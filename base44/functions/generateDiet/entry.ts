import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PLAN_ENTITLEMENTS = {
  free: ['today_basic','diary','nutrition_tracking','workout_tracking','measurements','my_diet_read','my_workout_read','profile'],
  pro: ['today_basic','diary','nutrition_tracking','workout_tracking','measurements','my_diet_read','my_workout_read','profile','atlas_ai','lab_exams','progress_photos','ai_diet_generation','ai_workout_generation','standard_exports','social_cards'],
  performance: ['today_basic','diary','nutrition_tracking','workout_tracking','measurements','my_diet_read','my_workout_read','profile','atlas_ai','lab_exams','progress_photos','ai_diet_generation','ai_workout_generation','standard_exports','social_cards','advanced_protocol_tracking','dose_timeline','premium_exports','macro_view_premium'],
  coach: ['coach_dashboard','coach_students','coach_create_diet','coach_edit_diet'],
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

    await assertFeatureAccess(base44, user, 'ai_diet_generation');

    const body = await req.json();
    const { date, profile, wizard } = body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // wizard = extra answers from the smart wizard (only what was missing)
    const w = wizard || {};

    const mealsPerDay = w.meals_per_day || profile?.meals_per_day || 5;
    const restrictions = w.restrictions || profile?.food_restrictions || profile?.dietary_style || 'none';
    const allergies = w.allergies || profile?.allergies || 'none';
    const preferences = w.preferences || profile?.food_preferences || 'balanced';
    const avoidances = w.avoidances || profile?.food_avoidances || 'none';
    const objective = w.objective || (profile?.health_goals?.join(', ')) || 'general health';
    const activityLevel = profile?.activity_level || 'moderate';
    const trainingToday = w.training_today !== undefined ? w.training_today : true;

    // Build a rich user context string for the AI
    const userContext = [
      `Age: ${profile?.age || 30}`,
      `Sex: ${profile?.sex === 'female' ? 'Female' : 'Male'}`,
      `Weight: ${profile?.current_weight || 80}kg`,
      `Height: ${profile?.height || 175}cm`,
      `Goal: ${objective}`,
      `Activity level: ${activityLevel}`,
      `Training experience: ${profile?.training_experience || 'intermediate'}`,
      `Workouts per week: ${profile?.training_days_per_week || 4}`,
      `Training today: ${trainingToday ? 'Yes' : 'No'}`,
      profile?.health_goals?.length ? `Health goals: ${profile.health_goals.join(', ')}` : '',
    ].filter(Boolean).join('\n- ');

    const prompt = `You are a nutrition coach specializing in performance and body composition. Generate a COMPLETE one-day meal plan in polished natural English.

PATIENT CONTEXT (use ALL of this information and do not ask for it again):
- ${userContext}

PERSONALIZED NUTRITION TARGETS:
- Target calories: ${profile?.calories_target || 2200} kcal
- Target protein: ${profile?.protein_target || 160}g
- Target carbohydrates: ${profile?.carbs_target || 250}g
- Target fat: ${profile?.fat_target || 70}g

PREFERENCES AND RESTRICTIONS:
- Dietary restrictions: ${restrictions}
- Allergies: ${allergies}
- Preferences: ${preferences}
- Avoid: ${avoidances}
- Number of meals: ${mealsPerDay}

CRITICAL RULES:
1. Generate EXACTLY ${mealsPerDay} meals across the day, and never fewer than 3.
2. Use a sensible meal distribution such as breakfast, morning snack when needed, lunch, afternoon snack, dinner, and an evening meal when needed.
3. If there is training today, include appropriate pre-workout and/or post-workout support.
4. Every meal must include at least 3 food items with gram-based quantities and realistic macro estimates.
5. Total daily macros should reach at least 90% of the stated targets.
6. Adapt carbohydrate quantity and food choice to the goal (${objective}).
7. Distribute protein fairly evenly across the meals.
8. Use practical, accessible foods that fit the athlete's preferences.
9. Do not generate a 1-meal or 2-meal plan.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          meals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                meal_type: { type: 'string' },
                foods: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' }, amount: { type: 'number' }, unit: { type: 'string' },
                      kcal: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' },
                      fat: { type: 'number' }, fiber: { type: 'number' },
                    }
                  }
                },
                total_calories: { type: 'number' }, total_protein: { type: 'number' },
                total_carbs: { type: 'number' }, total_fat: { type: 'number' }, total_fiber: { type: 'number' },
              }
            }
          }
        }
      }
    });

    const meals = result?.meals || [];
    if (meals.length < 3) {
      throw new Error(`The AI generated only ${meals.length} meal(s). The minimum required is 3. Please try again.`);
    }

    const saved = [];
    for (const meal of meals) {
      const created = await base44.entities.Meal.create({ ...meal, date: targetDate });
      saved.push(created);
    }

    console.log(`generateDiet: ${user.email} generated ${saved.length} meals for ${targetDate}`);
    return Response.json({ success: true, meals: saved, count: saved.length });
  } catch (error) {
    const status = error.status || 500;
    console.error(`generateDiet error [${status}]:`, error.message);
    return Response.json({ error: error.message }, { status });
  }
});
