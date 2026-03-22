import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeNextActionInsight,
  computeProgressInsights,
  generateMvpInsights,
} from '../../src/lib/insightsEngine.js';

const TODAY = '2026-03-22';
const BASE_DATE = new Date(`${TODAY}T12:00:00Z`);

function dateKey(daysAgo) {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function buildCheckins() {
  const sleep = [6.6, 6.7, 6.8, 6.7, 6.9, 6.8, 6.7, 7.1, 7.2, 7.3, 7.1, 7.4, 7.2, 7.3];
  const energy = [6.2, 6.3, 6.4, 6.5, 6.4, 6.3, 6.2, 7.0, 7.1, 7.2, 7.3, 7.2, 7.4, 7.3];
  const hydration = [2.6, 2.7, 2.8, 2.6, 2.7, 2.8, 2.6, 3.1, 2.8, 3.0, 2.9, 3.1, 2.7, 3.0];

  return sleep.map((sleepHours, index) => ({
    date: dateKey(13 - index),
    sleep_hours: sleepHours,
    energy: energy[index],
    mood: index < 7 ? 3 : 4,
    hydration_liters: hydration[index],
  }));
}

function buildMeals() {
  return Array.from({ length: 14 }, (_, index) => {
    const currentWeek = index >= 7;
    const baseCalories = currentWeek ? 2340 : 2330;
    const baseProtein = currentWeek ? 180 : 179;

    return {
      date: dateKey(13 - index),
      total_calories: baseCalories + (index % 2 === 0 ? 0 : 10),
      total_protein: baseProtein + (currentWeek ? 0 : 1),
      total_carbs: 210 + (index % 2),
      total_fat: 68 + (index % 2),
    };
  });
}

function buildWorkouts() {
  const dates = [13, 11, 9, 7, 6, 4, 2, 0];
  const loads = [100, 102.5, 105, 107.5, 108, 110, 111, 112.5];

  return dates.map((daysAgo, index) => ({
    completed_at: `${dateKey(daysAgo)}T10:00:00Z`,
    status: 'completed',
    duration_minutes: 60 + (index % 3),
    volume_load: index < 4 ? 10100 + index * 75 : 10550 + (index - 4) * 100,
    exercises_completed: [
      {
        name: index % 2 === 0 ? 'Bench Press' : 'Squat',
        sets_completed: [{ load_actual: loads[index] }],
      },
    ],
  }));
}

const richUserData = {
  today: TODAY,
  rangeDays: 14,
  profile: {
    current_weight: 90,
    target_weight: 82,
    height_cm: 180,
    calories_target: 2350,
    protein_target: 180,
    water_target: 3,
    training_frequency: 4,
  },
  dietPlan: { total_calories: 2350, total_protein: 180, total_carbs: 220, total_fat: 70 },
  workoutPlan: { frequency: 4, days: ['Mon', 'Tue', 'Thu', 'Sat'] },
  measurements: [
    { date: '2026-02-10', weight: 92.4, waist: 96.1, body_fat_percent: 22.4, bmi: 28.4 },
    { date: '2026-02-24', weight: 91.2, waist: 95.0, body_fat_percent: 21.8, bmi: 28.0 },
    { date: '2026-03-10', weight: 89.9, waist: 94.2, body_fat_percent: 21.1, bmi: 27.8 },
    { date: '2026-03-22', weight: 90.1, waist: 93.8, body_fat_percent: 21.0, bmi: 27.8 },
  ],
  workouts: buildWorkouts(),
  meals: buildMeals(),
  checkins: buildCheckins(),
};

test('generateMvpInsights returns the five expected categories and a deterministic next action', () => {
  const result = generateMvpInsights(richUserData);
  const categories = result.insights.map((insight) => insight.category);

  assert.deepEqual(categories.sort(), [
    'next_action',
    'nutrition',
    'progress',
    'recovery',
    'training',
  ]);

  assert.equal(result.insights[0].category, 'next_action');
  assert.equal(result.insights[0].metric_key, 'hydration_adherence');
  assert.match(result.insights[0].title, /water goal/i);
  assert.equal(result.summary.consistencyScore, 91);
  assert.equal(result.summary.consistencyLabel, 'Strong consistency over the last 2 weeks');

  const thisWeekWorkout = result.summary.thisWeek.find((item) => item.label === 'Workouts');
  const thisWeekWater = result.summary.thisWeek.find((item) => item.label === 'Water');
  const sinceStartWeight = result.summary.sinceStart.find((item) => item.label === 'Weight');
  const trendSleep = result.summary.trends.find((item) => item.label === 'Sleep');

  assert.equal(thisWeekWorkout?.value, '4/4');
  assert.equal(thisWeekWater?.detail, '4/7 days hit target');
  assert.equal(sinceStartWeight?.value, '-2.3 kg');
  assert.match(trendSleep?.value || '', /h$/);
});

test('progress insights fall back to a safe baseline when there is not enough data', () => {
  const insight = computeProgressInsights({ today: TODAY });

  assert.equal(insight.title, 'Add your first checkpoint.');
  assert.equal(insight.direction, 'attention');
  assert.match(insight.body, /weight and waist measurement/i);
});

test('next action falls back to the first logging step when the dashboard is empty', () => {
  const insight = computeNextActionInsight({ today: TODAY });

  assert.equal(insight.category, 'next_action');
  assert.equal(insight.metric_key, 'data_baseline');
  assert.match(insight.title, /weight log/i);
  assert.match(insight.title, /check-in/i);
  assert.match(insight.body, /history/i);
});
