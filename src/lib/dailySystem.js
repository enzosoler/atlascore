/**
 * dailySystem.js — The atlas.core daily operating system.
 *
 * STATE → DECISION → ACTION → FEEDBACK → UPDATE
 *
 * v2: Added context-aware decisions, identity actions, 7-day trend,
 *     constraint logic, reason breakdown, workout rotation.
 */

const STORAGE_KEY = 'atlas.daily.system';

// ─── READINESS CALCULATION ──────────────────────────────────

/**
 * Calculate readiness with full reason breakdown.
 * @returns {{ score, level, label, reasons: string[] }}
 */
export function calculateReadiness(sleep = 3, recovery = 3, soreness = 1, modifier = 0) {
  const sleepScore = (sleep / 5) * 100;
  const recoveryScore = (recovery / 5) * 100;
  const sorenessScore = ((6 - soreness) / 5) * 100;
  const base = (sleepScore + recoveryScore + sorenessScore) / 3;
  const raw = base + modifier;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  // Reason breakdown — what moved the needle
  const reasons = [];
  if (sleep <= 2) reasons.push(`Sleep low (${sleepScore.toFixed(0)})`);
  else if (sleep >= 4) reasons.push(`Sleep strong (${sleepScore.toFixed(0)})`);
  if (recovery <= 2) reasons.push(`Recovery poor (${recoveryScore.toFixed(0)})`);
  else if (recovery >= 4) reasons.push(`Recovery good (${recoveryScore.toFixed(0)})`);
  if (soreness >= 4) reasons.push(`Soreness high (-${(100 - sorenessScore).toFixed(0)})`);
  if (modifier > 0) reasons.push(`Yesterday's adherence (+${modifier})`);
  if (modifier < 0) reasons.push(`Yesterday's adherence (${modifier})`);

  let level, label;
  if (score >= 70) {
    level = 'high';
    label = 'Push day. Your body is ready for intensity.';
  } else if (score >= 40) {
    level = 'medium';
    label = 'Moderate day. Train smart, recover well.';
  } else {
    level = 'low';
    label = 'Recovery day. Move light, prioritize rest.';
  }

  return { score, level, label, reasons };
}

// ─── DECISION ENGINE (context-aware) ────────────────────────

const ROTATION = ['upper', 'lower', 'full', 'rest'];

function inferNextWorkoutType(lastType) {
  if (!lastType) return 'full';
  const idx = ROTATION.indexOf(lastType);
  if (idx === -1) return 'full';
  return ROTATION[(idx + 1) % ROTATION.length];
}

/**
 * Generate actions based on readiness + context.
 * Context-aware: considers last workout type, low adherence penalty,
 * and includes one identity anchor action per day.
 *
 * @param {'high'|'medium'|'low'} level
 * @param {object} context
 * @returns {Array<{ id, text, category, route?, anchor? }>}
 */
export function generateActions(level, context = {}) {
  const protein = context.proteinTarget || 150;
  const lastWorkoutType = context.lastWorkoutType || null;
  const recentAdherence = context.recentAdherence ?? 100;
  const yesterdayAdherence = context.yesterdayAdherence ?? null;
  const nextType = inferNextWorkoutType(lastWorkoutType);

  // System was broken yesterday (adherence < 40) — force reset to 2 anchor actions
  const yesterdayBroken = yesterdayAdherence !== null && yesterdayAdherence < 40;

  // Low adherence penalty OR yesterday broken: simplify to max 2 actions
  if ((recentAdherence < 40 || yesterdayBroken) && level !== 'low') {
    const workoutLabel = nextType === 'rest'
      ? 'Active recovery: 20 min walk'
      : `${nextType.charAt(0).toUpperCase() + nextType.slice(1)} body session`;
    return [
      { id: 'a1', text: workoutLabel, category: 'train', route: '/app/workouts', anchor: true },
      { id: 'a2', text: `Hit protein: ${protein}g`, category: 'eat', route: '/app/nutrition' },
    ];
  }

  if (level === 'high') {
    const workoutLabel = nextType === 'rest'
      ? 'Full body session (push day override)'
      : `${nextType.charAt(0).toUpperCase() + nextType.slice(1)} body — push intensity`;
    return [
      { id: 'a1', text: workoutLabel, category: 'train', route: '/app/workouts' },
      { id: 'a2', text: `Hit protein target: ${protein}g`, category: 'eat', route: '/app/nutrition', anchor: true },
      { id: 'a3', text: 'Log all meals today', category: 'eat', route: '/app/nutrition' },
      { id: 'a4', text: 'Log body weight', category: 'recover', route: '/app/body' },
    ];
  }

  if (level === 'medium') {
    const forceRecovery = context.soreness >= 4;
    if (forceRecovery) {
      return [
        { id: 'a1', text: 'Recovery session only — soreness is high', category: 'recover' },
        { id: 'a2', text: 'Stretch or mobility (15 min)', category: 'recover' },
        { id: 'a3', text: `Recovery protein: ${Math.round(protein * 0.85)}g`, category: 'eat', route: '/app/nutrition', anchor: true },
      ];
    }
    const workoutLabel = nextType === 'rest'
      ? 'Light cardio or mobility (30 min)'
      : `Moderate ${nextType} training (30 min)`;
    return [
      { id: 'a1', text: workoutLabel, category: 'train', route: '/app/workouts' },
      { id: 'a2', text: `Recovery protein: ${Math.round(protein * 0.85)}g`, category: 'eat', route: '/app/nutrition', anchor: true },
      { id: 'a3', text: 'Stretch or mobility work (15 min)', category: 'recover' },
      { id: 'a4', text: 'Hydrate: aim for 3L today', category: 'habit' },
    ];
  }

  // low
  return [
    { id: 'a1', text: 'Active recovery: walk or light cardio (20 min)', category: 'recover' },
    { id: 'a2', text: 'Mobility: full body (10 min)', category: 'recover' },
    { id: 'a3', text: `Protein minimum: ${Math.round(protein * 0.7)}g`, category: 'eat', route: '/app/nutrition', anchor: true },
    { id: 'a4', text: 'Prioritize sleep tonight', category: 'habit' },
  ];
}

// ─── COMPLETION + ADHERENCE ─────────────────────────────────

export function calculateAdherence(completions, actions) {
  const total = actions.length;
  if (total === 0) return { adherence: 0, done: 0, total: 0, label: 'No actions' };

  const done = actions.filter(a => completions[a.id] === 'done').length;
  const adherence = Math.round((done / total) * 100);

  let label;
  if (adherence >= 80) label = "You're building momentum";
  else if (adherence >= 50) label = 'Partial — keep pushing';
  else if (done > 0) label = "You're breaking consistency";
  else label = 'Not started';

  return { adherence, done, total, label };
}

export function nextDayModifier(adherence) {
  return Math.round((adherence - 50) * 0.1);
}

// ─── SYSTEM INTEGRITY ──────────────────────────────────────

/**
 * Determine overall system integrity state.
 * @param {{ adherence: number, done: number }} adherence
 * @param {{ direction: string, values: number[] }} trend
 * @param {boolean} anchorsComplete — both training + protein anchors done
 * @returns {{ state: 'stable'|'degrading'|'broken', label: string }}
 */
export function getSystemIntegrity(adherence, trend, anchorsComplete) {
  if (anchorsComplete && adherence.adherence >= 80) return { state: 'stable', label: 'System stable' };
  if (adherence.adherence >= 40 || adherence.done > 0) return { state: 'degrading', label: 'System degrading — restore consistency' };
  // No actions completed yet — brand-new user or start of day, not actually broken
  if (adherence.done === 0 && (!trend?.values || trend.values.length === 0)) {
    return { state: 'ready', label: 'System initializing' };
  }
  return { state: 'broken', label: 'System offline — start your anchors' };
}

// ─── 7-DAY TREND ────────────────────────────────────────────

/**
 * Calculate 7-day adherence trend.
 * @returns {{ avg: number, direction: '↑'|'↓'|'→', values: number[] }}
 */
export function get7DayTrend() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { avg: 0, direction: '→', values: [] };
    const all = JSON.parse(raw);
    const values = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (all[key]?.adherence != null) values.push(all[key].adherence);
    }
    if (values.length === 0) return { avg: 0, direction: '→', values: [] };
    const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
    // Compare first half vs second half
    const mid = Math.floor(values.length / 2);
    const recent = values.slice(0, mid);
    const older = values.slice(mid);
    const recentAvg = recent.length ? recent.reduce((s, v) => s + v, 0) / recent.length : avg;
    const olderAvg = older.length ? older.reduce((s, v) => s + v, 0) / older.length : avg;
    const diff = recentAvg - olderAvg;
    const direction = diff > 5 ? '↑' : diff < -5 ? '↓' : '→';
    return { avg, direction, values };
  } catch {
    return { avg: 0, direction: '→', values: [] };
  }
}

// ─── PERSISTENCE ────────────────────────────────────────────

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function loadDailyState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[todayKey()] || null;
  } catch {
    return null;
  }
}

export function saveDailyState(state) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[todayKey()] = { ...state, updatedAt: Date.now() };
    const keys = Object.keys(all).sort().reverse();
    const trimmed = {};
    keys.slice(0, 30).forEach(k => { trimmed[k] = all[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

/**
 * Load yesterday's modifier and adherence level.
 * @returns {{ modifier: number, yesterdayAdherence: number|null }}
 */
export function loadYesterdayModifier() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { modifier: 0, yesterdayAdherence: null };
    const all = JSON.parse(raw);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = yesterday.toISOString().slice(0, 10);
    const state = all[key];
    if (!state?.adherence) return { modifier: 0, yesterdayAdherence: null };
    return { modifier: nextDayModifier(state.adherence), yesterdayAdherence: state.adherence };
  } catch {
    return { modifier: 0, yesterdayAdherence: null };
  }
}

// ─── HOOK ───────────────────────────────────────────────────

import { useState, useCallback, useMemo, useEffect } from 'react';

export function useDailySystem(context = {}) {
  const [state, setState] = useState(() => {
    const saved = loadDailyState();
    return saved || {
      checkedIn: false,
      sleep: 3,
      recovery: 3,
      soreness: 1,
      completions: {},
      lastWorkoutType: null,
    };
  });

  // Re-sync from localStorage when the component re-mounts (e.g. navigating back)
  // This picks up changes made by other screens (workout completion, etc.)
  useEffect(() => {
    const saved = loadDailyState();
    if (saved && saved.updatedAt && saved.updatedAt !== state.updatedAt) {
      setState(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const yesterday = useMemo(() => loadYesterdayModifier(), []);
  const modifier = yesterday.modifier;
  const trend = useMemo(() => get7DayTrend(), []);

  const fullContext = {
    ...context,
    lastWorkoutType: state.lastWorkoutType,
    soreness: state.soreness,
    recentAdherence: trend.avg,
    yesterdayAdherence: yesterday.yesterdayAdherence,
  };

  const readiness = state.checkedIn
    ? calculateReadiness(state.sleep, state.recovery, state.soreness, modifier)
    : null;

  const actions = readiness ? generateActions(readiness.level, fullContext) : [];
  const adherence = calculateAdherence(state.completions, actions);

  const checkIn = useCallback((sleep, recovery, soreness) => {
    const next = { ...state, checkedIn: true, sleep, recovery, soreness };
    setState(next);
    saveDailyState({ ...next, adherence: 0 });
  }, [state]);

  const markAction = useCallback((id, status) => {
    setState(prev => {
      const next = {
        ...prev,
        completions: { ...prev.completions, [id]: status },
      };
      const r = calculateReadiness(next.sleep, next.recovery, next.soreness, modifier);
      const acts = generateActions(r.level, { ...fullContext, soreness: next.soreness });
      const adh = calculateAdherence(next.completions, acts);
      saveDailyState({ ...next, adherence: adh.adherence });
      return next;
    });
  }, [modifier, fullContext]);

  const toggleAction = useCallback((id) => {
    const current = state.completions[id] || 'pending';
    const nextStatus = current === 'pending' ? 'done' : current === 'done' ? 'skipped' : 'pending';
    markAction(id, nextStatus);
  }, [state.completions, markAction]);

  const momentum = trend.values.length >= 2
    ? (trend.direction === '↑' ? 'Momentum building' : trend.direction === '↓' ? 'Downtrend detected' : null)
    : null;

  return {
    checkedIn: state.checkedIn,
    readiness,
    actions,
    completions: state.completions,
    adherence,
    trend,
    momentum,
    checkIn,
    toggleAction,
    markAction,
  };
}
