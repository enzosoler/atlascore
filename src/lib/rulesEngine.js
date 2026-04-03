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
 * Build the daily status (on-track / caution / needs-attention).
 * @returns {{ status: string, message: string, completedCount: number, totalCount: number }}
 */
export function buildDailyStatus({ workoutDone, nutritionLogged, weightLogged, protocolsDue = 0, protocolsComplete = 0, t }) {
  const _ = t || ((key) => key.split('.').pop());
  const hour = new Date().getHours();

  const areas = [
    { key: 'workout', done: !!workoutDone },
    { key: 'nutrition', done: !!nutritionLogged },
    { key: 'weight', done: !!weightLogged },
  ];
  if (protocolsDue > 0) {
    areas.push({ key: 'protocols', done: protocolsComplete >= protocolsDue });
  }

  const completed = areas.filter((a) => a.done).length;
  const total = areas.length;
  const isEarlyDay = hour < 12;
  const isMidDay = hour >= 12 && hour < 17;

  if (completed === total) {
    return { status: 'on-track', message: _('today.status.allComplete'), completedCount: completed, totalCount: total };
  }
  if (completed >= total - 1) {
    const missing = areas.find((a) => !a.done);
    return { status: 'on-track', message: _(`today.status.almost`, { area: _(`today.status.area_${missing?.key}`) }), completedCount: completed, totalCount: total };
  }
  if (isEarlyDay) {
    return { status: 'neutral', message: _('today.status.dayAhead'), completedCount: completed, totalCount: total };
  }
  if (isMidDay && completed >= 1) {
    return { status: 'caution', message: _('today.status.keepGoing', { remaining: total - completed }), completedCount: completed, totalCount: total };
  }
  return { status: 'needs-attention', message: _('today.status.behindPace', { remaining: total - completed }), completedCount: completed, totalCount: total };
}

/**
 * Build the daily briefing text + focus + actions.
 * Now includes time-of-day context.
 * @returns {{ text: string, focus: string, primaryAction: {label,path}|null, secondaryAction: {label,path}|null }}
 */
export function buildBriefing({ workoutDone, nutritionLogged, hasActivePlan, planName, preferredName, kcalRemaining, t }) {
  const name = preferredName || (t ? t('common.athlete') : 'Athlete');
  const _ = t || ((key) => key.split('.').pop());
  const hour = new Date().getHours();

  // Time-of-day suffix for briefing context
  let timeSuffix = '';
  if (hour >= 20 && kcalRemaining > 400) {
    timeSuffix = ' ' + _('today.briefing.eveningNutrition');
  } else if (hour >= 20 && !workoutDone) {
    timeSuffix = ' ' + _('today.briefing.eveningWorkout');
  }

  if (workoutDone && nutritionLogged && kcalRemaining < 300) {
    return { text: _('today.briefing.lockedIn', { name }), focus: _('today.briefing.focusRecovery'), primaryAction: null, secondaryAction: null };
  }
  if (workoutDone && kcalRemaining >= 300) {
    return { text: _('today.briefing.closeGap', { kcal: Math.round(kcalRemaining) }) + timeSuffix, focus: _('today.briefing.focusNutrition'), primaryAction: { label: _('today.briefing.actionLogMeal'), path: ROUTES.nutrition }, secondaryAction: null };
  }
  if (!workoutDone && hasActivePlan) {
    const prefix = nutritionLogged ? _('today.briefing.nutritionPrefix') : '';
    return { text: _('today.briefing.onSchedule', { prefix, planName: planName || _('today.briefing.yourWorkout') }) + timeSuffix, focus: _('today.briefing.focusTraining'), primaryAction: { label: _('today.briefing.actionStartWorkout'), path: ROUTES.workouts }, secondaryAction: nutritionLogged ? null : { label: _('today.briefing.actionLogMealShort'), path: ROUTES.nutrition } };
  }
  if (!workoutDone && !hasActivePlan) {
    return { text: _('today.briefing.noPlan', { name }), focus: _('today.briefing.focusBuild'), primaryAction: { label: _('today.briefing.actionCreatePlan'), path: ROUTES.workouts }, secondaryAction: null };
  }
  return { text: _('today.briefing.goodDay', { name }), focus: _('today.briefing.focusToday'), primaryAction: { label: _('today.briefing.actionStartWorkout'), path: ROUTES.workouts }, secondaryAction: null };
}

/**
 * Build max 3 recommendations from current state.
 * Priority: critical adherence > missed daily action > nutrition correction > protocol > positive reinforcement.
 * @returns {Array<{id,type,title,reason,actionLabel,actionPath}>}
 */
export function buildRecommendations({ workoutDone, hasActivePlan, proteinConsumed, proteinTarget, weightLogged, hasPhotos, protocolsDue = 0, protocolsComplete = 0, caloriesConsumed = 0, caloriesTarget = 0, weekWorkoutCount = 0, energy = null, mood = null, t }) {
  const _ = t || ((key) => key.split('.').pop());
  const hour = new Date().getHours();
  const recs = [];

  // 1. Critical: calorie overshoot
  if (caloriesTarget > 0 && caloriesConsumed > caloriesTarget * 1.15) {
    recs.push({
      id: 'rec-calories-over',
      type: 'nutrition',
      title: _('today.recs.caloriesOverTitle'),
      reason: _('today.recs.caloriesOverReason', { over: Math.round(caloriesConsumed - caloriesTarget) }),
      actionLabel: _('today.recs.caloriesOverAction'),
      actionPath: ROUTES.nutrition,
    });
  }

  // 2. Protein gap (after workout or late in day)
  if ((workoutDone || hour >= 17) && proteinConsumed < (proteinTarget || 150) * 0.7) {
    const gap = Math.round((proteinTarget || 150) - proteinConsumed);
    recs.push({
      id: 'rec-protein',
      type: 'nutrition',
      title: _('today.recs.proteinTitle'),
      reason: _('today.recs.proteinReason', { consumed: Math.round(proteinConsumed), target: proteinTarget || 150, gap }),
      actionLabel: _('today.recs.proteinAction'),
      actionPath: ROUTES.nutrition,
    });
  }

  // 3. Missing plan
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

  // 4. Protocols pending
  if (protocolsDue > 0 && protocolsComplete < protocolsDue) {
    const pending = protocolsDue - protocolsComplete;
    recs.push({
      id: 'rec-protocols',
      type: 'protocol',
      title: _('today.recs.protocolsTitle', { count: pending }),
      reason: _('today.recs.protocolsReason'),
      actionLabel: _('today.recs.protocolsAction'),
      actionPath: ROUTES.protocols,
    });
  }

  // 5. Low energy — suggest lighter session or recovery
  if (energy != null && energy <= 2) {
    recs.push({
      id: 'rec-low-energy',
      type: 'wellness',
      title: _('today.recs.lowEnergyTitle'),
      reason: _('today.recs.lowEnergyReason'),
      actionLabel: _('today.recs.lowEnergyAction'),
      actionPath: ROUTES.body,
    });
  }

  // 6. Low mood + no workout — suggest light movement
  if (mood != null && mood <= 2 && !workoutDone) {
    recs.push({
      id: 'rec-low-mood',
      type: 'wellness',
      title: _('today.recs.lowMoodTitle'),
      reason: _('today.recs.lowMoodReason'),
      actionLabel: _('today.recs.lowMoodAction'),
      actionPath: ROUTES.workouts,
    });
  }

  // 7. Weight not logged
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

  return recs.slice(0, 3);
}

/**
 * Build a single contextual narrative sentence based on the user's daily state.
 * @returns {string}
 */
export function buildDailyNarrative({ workoutDone, nutritionLogged, weightLogged, protocolsDue = 0, protocolsComplete = 0, kcalRemaining = 0, hasActivePlan, t }) {
  const _ = t || ((key) => key.split('.').pop());
  const hour = new Date().getHours();

  const areas = [
    { key: 'workout', done: !!workoutDone },
    { key: 'nutrition', done: !!nutritionLogged },
    { key: 'weight', done: !!weightLogged },
  ];
  if (protocolsDue > 0) {
    areas.push({ key: 'protocols', done: protocolsComplete >= protocolsDue });
  }

  const completed = areas.filter((a) => a.done).length;
  const total = areas.length;
  const isMorning = hour < 12;
  const isMidDay = hour >= 12 && hour < 17;
  const remaining = areas.find((a) => !a.done);

  // All done
  if (completed === total) {
    return _('today.narrative.allDone');
  }

  // Morning, nothing logged
  if (isMorning && completed === 0) {
    const focus = !hasActivePlan ? _('today.narrative.focusPlanning') : _('today.narrative.focusTraining');
    return _('today.narrative.morningEmpty', { focus });
  }

  // Midday, workout done — shift to nutrition
  if (isMidDay && workoutDone && kcalRemaining > 0) {
    return _('today.narrative.middayWorkoutDone', { kcal: Math.round(kcalRemaining) });
  }

  // Evening, mostly on track (1 remaining)
  if (hour >= 17 && completed >= total - 1 && remaining) {
    return _('today.narrative.eveningAlmost', { area: _(`today.status.area_${remaining.key}`) });
  }

  // Behind pace
  if ((isMidDay || hour >= 17) && completed < total - 1) {
    // Pick most impactful missing action
    const impactful = areas.find((a) => !a.done);
    return _('today.narrative.behindPace', { action: _(`today.status.area_${impactful?.key}`) });
  }

  // Fallback — morning/early with some progress
  return _('today.narrative.keepGoing');
}
