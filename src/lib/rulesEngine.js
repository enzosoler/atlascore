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
export function buildBriefing({ workoutDone, nutritionLogged, hasActivePlan, planName, preferredName, kcalRemaining, t }) {
  const name = preferredName || (t ? t('common.athlete') : 'Athlete');
  const _ = t || ((key) => key.split('.').pop());

  if (workoutDone && nutritionLogged && kcalRemaining < 300) {
    return { text: _('today.briefing.lockedIn', { name }), focus: _('today.briefing.focusRecovery'), primaryAction: null, secondaryAction: null };
  }
  if (workoutDone && kcalRemaining >= 300) {
    return { text: _('today.briefing.closeGap', { kcal: Math.round(kcalRemaining) }), focus: _('today.briefing.focusNutrition'), primaryAction: { label: _('today.briefing.actionLogMeal'), path: ROUTES.nutrition }, secondaryAction: null };
  }
  if (!workoutDone && hasActivePlan) {
    const prefix = nutritionLogged ? _('today.briefing.nutritionPrefix') : '';
    return { text: _('today.briefing.onSchedule', { prefix, planName: planName || _('today.briefing.yourWorkout') }), focus: _('today.briefing.focusTraining'), primaryAction: { label: _('today.briefing.actionStartWorkout'), path: ROUTES.workouts }, secondaryAction: nutritionLogged ? null : { label: _('today.briefing.actionLogMealShort'), path: ROUTES.nutrition } };
  }
  if (!workoutDone && !hasActivePlan) {
    return { text: _('today.briefing.noPlan', { name }), focus: _('today.briefing.focusBuild'), primaryAction: { label: _('today.briefing.actionCreatePlan'), path: ROUTES.workouts }, secondaryAction: null };
  }
  return { text: _('today.briefing.goodDay', { name }), focus: _('today.briefing.focusToday'), primaryAction: { label: _('today.briefing.actionStartWorkout'), path: ROUTES.workouts }, secondaryAction: null };
}

/**
 * Build max 2 recommendations from current state.
 * @returns {Array<{id,type,title,reason,actionLabel,actionPath}>}
 */
export function buildRecommendations({ workoutDone, hasActivePlan, proteinConsumed, proteinTarget, weightLogged, hasPhotos, t }) {
  const _ = t || ((key) => key.split('.').pop());
  const recs = [];

  if (workoutDone && proteinConsumed < (proteinTarget || 150) * 0.7) {
    recs.push({
      id: 'rec-protein',
      type: 'nutrition',
      title: _('today.recs.proteinTitle'),
      reason: _('today.recs.proteinReason', { consumed: Math.round(proteinConsumed), target: proteinTarget || 150 }),
      actionLabel: _('today.recs.proteinAction'),
      actionPath: ROUTES.nutrition,
    });
  }

  if (!hasActivePlan && !workoutDone) {
    recs.push({
      id: 'rec-plan',
      type: 'workout',
      title: _('today.recs.noPlanTitle'),
      reason: _('today.recs.noPlanReason'),
      actionLabel: _('today.recs.noPlanAction'),
      actionPath: ROUTES.workouts,
    });
  }

  if (!weightLogged) {
    recs.push({
      id: 'rec-weight',
      type: 'habit',
      title: _('today.recs.weightTitle'),
      reason: _('today.recs.weightReason'),
      actionLabel: _('today.recs.weightAction'),
      actionPath: ROUTES.body,
    });
  }

  return recs.slice(0, 2);
}
