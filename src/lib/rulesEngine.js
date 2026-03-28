/**
 * rulesEngine.js — shared rules-based intelligence layer.
 *
 * Extracted from Today.jsx so both TodayV2 and TrainV2 can use the same
 * fallback logic when the AI engine hasn't returned yet.
 *
 * Every function returns a safe default shape — never throws.
 */

import { ROUTES } from '@/lib/routes';

/**
 * Build the daily briefing text + focus + actions.
 * @returns {{ text: string, focus: string, primaryAction: {label,path}|null, secondaryAction: {label,path}|null }}
 */
export function buildBriefing({ workoutDone, nutritionLogged, hasActivePlan, planName, preferredName, kcalRemaining }) {
  const name = preferredName || 'Athlete';

  if (workoutDone && nutritionLogged && kcalRemaining < 300) {
    return { text: `${name}, you're locked in today. Workout done, nutrition on track.`, focus: 'Recovery', primaryAction: null, secondaryAction: null };
  }
  if (workoutDone && kcalRemaining >= 300) {
    return { text: `Session complete. Close the gap — ${Math.round(kcalRemaining)} kcal remaining.`, focus: 'Nutrition', primaryAction: { label: 'Log a meal', path: ROUTES.nutrition }, secondaryAction: null };
  }
  if (!workoutDone && hasActivePlan) {
    const prefix = nutritionLogged ? 'Nutrition logged. ' : '';
    return { text: `${prefix}${planName || 'Your workout'} is on the schedule. Get it done.`, focus: 'Training', primaryAction: { label: 'Start workout', path: ROUTES.workouts }, secondaryAction: nutritionLogged ? null : { label: 'Log meal', path: ROUTES.nutrition } };
  }
  if (!workoutDone && !hasActivePlan) {
    return { text: `No active plan, ${name}. Build one now or start a quick workout.`, focus: 'Build', primaryAction: { label: 'Create plan', path: ROUTES.workouts }, secondaryAction: null };
  }
  return { text: `Good day to move, ${name}. Log your workouts and meals.`, focus: 'Today', primaryAction: { label: 'Start workout', path: ROUTES.workouts }, secondaryAction: null };
}

/**
 * Build max 2 recommendations from current state.
 * @returns {Array<{id,type,title,reason,actionLabel,actionPath}>}
 */
export function buildRecommendations({ workoutDone, hasActivePlan, proteinConsumed, proteinTarget, weightLogged, hasPhotos }) {
  const recs = [];

  if (workoutDone && proteinConsumed < (proteinTarget || 150) * 0.7) {
    recs.push({
      id: 'rec-protein',
      type: 'nutrition',
      title: 'Protein window closing',
      reason: `${Math.round(proteinConsumed)}g of ${proteinTarget || 150}g. Recovery depends on closing this gap.`,
      actionLabel: 'Log protein meal',
      actionPath: ROUTES.nutrition,
    });
  }

  if (!hasActivePlan && !workoutDone) {
    recs.push({
      id: 'rec-plan',
      type: 'workout',
      title: 'No training plan active',
      reason: 'Athletes with a plan are more consistent. Build yours.',
      actionLabel: 'Build plan',
      actionPath: ROUTES.workouts,
    });
  }

  if (!weightLogged) {
    recs.push({
      id: 'rec-weight',
      type: 'habit',
      title: 'Log your weight',
      reason: 'Weekly weigh-ins catch trends early.',
      actionLabel: 'Log weight',
      actionPath: ROUTES.body,
    });
  }

  return recs.slice(0, 2);
}
