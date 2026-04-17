/**
 * useCoachChat — conversational AI coach hook.
 *
 * Manages message history, calls the ai-coach-chat edge function,
 * and executes actions returned by the AI (update targets, log data, swap exercises, navigate).
 *
 * Messages are persisted server-side by the edge function in the `coach_messages` table.
 * On mount, we hydrate the UI from that table so the user sees prior conversation
 * across sessions, reloads, and device changes.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18nContext';
import { updateWorkoutPlan } from '@/services/workoutPlanService';
import { createMeasurement } from '@/services/bodyProgressService';


let msgIdCounter = 0;
function nextId() {
  return `msg-${++msgIdCounter}`;
}

// How many messages to hydrate from DB on mount. Matches the edge function
// context window (limit 20) so the UI matches what the coach actually sees.
const HISTORY_HYDRATE_LIMIT = 30;

export function useCoachChat({ invalidateAfterAction, activePlan } = {}) {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  // Map of actionId -> 'pending' | 'loading' | 'done' | 'dismissed'
  const [actionStates, setActionStates] = useState({});
  const hydratedRef = useRef(false);

  // ── Hydrate prior conversation from DB once per session ─────────────────────
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { setIsHydrating(false); return; }

        const { data, error } = await supabase
          .from('coach_messages')
          .select('id, role, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(HISTORY_HYDRATE_LIMIT);

        if (cancelled) return;
        if (error) {
          console.warn('[useCoachChat] hydrate failed:', error.message);
          setIsHydrating(false);
          return;
        }

        const prior = (data ?? [])
          .slice()
          .reverse()
          .map((row) => ({
            id: nextId(),
            role: row.role,
            content: row.content,
            actions: [],
            suggestions: [],
            timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          }));

        setMessages(prior);
      } catch (err) {
        console.warn('[useCoachChat] hydrate exception:', err?.message || err);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: nextId(), timestamp: Date.now(), ...msg }]);
  }, []);

  const sendMessage = useCallback(async (text, pageContext = 'today') => {
    if (!text?.trim() || isTyping) return;

    const userMsg = { id: nextId(), role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-coach-chat', {
        body: { message: text.trim(), page_context: pageContext, locale },
      });

      if (fnError) {
        const status = fnError?.context?.status ?? '?';
        const detail = fnError?.message ?? JSON.stringify(fnError);
        console.error('[ai-coach-chat] error:', { status, detail, context: fnError?.context });
        appendMessage({ role: 'assistant', content: `Error ${status}: ${detail}`, actions: [], suggestions: [] });
        return;
      }

      if (data?.error) {
        appendMessage({ role: 'assistant', content: `[${data.code ?? 'ERR'}] ${data.error}`, actions: [], suggestions: [] });
        return;
      }

      const assistantId = nextId();
      const assistantMsg = {
        id: assistantId,
        role: 'assistant',
        content: data?.message ?? '',
        actions: Array.isArray(data?.actions) ? data.actions : [],
        suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Register pending actions
      if (assistantMsg.actions.length > 0) {
        setActionStates((prev) => {
          const next = { ...prev };
          assistantMsg.actions.forEach((_, i) => {
            next[`${assistantId}-${i}`] = 'pending';
          });
          return next;
        });
      }
    } catch (err) {
      const detail = err?.message || String(err) || 'Unknown error';
      console.error('[ai-coach-chat] exception:', detail);
      appendMessage({ role: 'assistant', content: 'Something went wrong. Please try again.', actions: [], suggestions: [] });
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, appendMessage, locale]);

  const executeAction = useCallback(async (action, actionKey) => {
    setActionStates((prev) => ({ ...prev, [actionKey]: 'loading' }));

    try {
      await dispatchAction(action, { activePlan, navigate });
      setActionStates((prev) => ({ ...prev, [actionKey]: 'done' }));
      invalidateAfterAction?.('all');

      // Append a brief confirmation message
      appendMessage({
        role: 'assistant',
        content: action.description ? `Done — ${action.description}` : 'Done.',
        actions: [],
        suggestions: [],
      });
    } catch (err) {
      setActionStates((prev) => ({ ...prev, [actionKey]: 'pending' }));
      toast.error(err?.message ?? 'Action failed');
    }
  }, [activePlan, navigate, invalidateAfterAction, appendMessage]);

  const dismissAction = useCallback((actionKey) => {
    setActionStates((prev) => ({ ...prev, [actionKey]: 'dismissed' }));
  }, []);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    setActionStates({});
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('coach_messages').delete().eq('user_id', user.id);
      }
    } catch (err) {
      console.warn('[useCoachChat] clearHistory db delete failed:', err?.message || err);
    }
  }, []);

  return {
    messages,
    isTyping,
    isHydrating,
    actionStates,
    sendMessage,
    executeAction,
    dismissAction,
    clearHistory,
  };
}

// ─── Action dispatcher ─────────────────────────────────────────────────────────

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// Validate and clamp a numeric value within safe bounds
function safeNum(value, min, max, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

async function dispatchAction(action, { activePlan, navigate }) {
  const { type, params = {} } = action;
  const userId = await getCurrentUserId();

  switch (type) {
    case 'update_calorie_target': {
      const cal = safeNum(params.calories, 800, 10000);
      await updateProfileTarget(userId, 'calories', cal);
      break;
    }
    case 'update_protein_target': {
      const prot = safeNum(params.protein, 20, 500);
      await updateProfileTarget(userId, 'protein', prot);
      break;
    }
    case 'update_macro_targets': {
      const patch = {};
      if (params.calories != null) patch.calories = safeNum(params.calories, 800, 10000);
      if (params.protein != null) patch.protein = safeNum(params.protein, 20, 500);
      if (params.carbs != null) patch.carbs = safeNum(params.carbs, 0, 1500);
      if (params.fat != null) patch.fat = safeNum(params.fat, 0, 500);
      await updateProfileTargets(userId, patch);
      break;
    }
    case 'log_food': {
      const { error } = await supabase.from('food_logs').insert({
        user_id: userId,
        name: typeof params.name === 'string' ? params.name.slice(0, 200) : 'Food',
        calories: safeNum(params.calories, 0, 10000),
        protein: safeNum(params.protein, 0, 500),
        carbs: safeNum(params.carbs, 0, 1500),
        fat: safeNum(params.fat, 0, 500),
        date: new Date().toISOString(),
        meal_type: params.meal_type ?? 'other',
      });
      if (error) throw error;
      break;
    }
    case 'log_weight': {
      const weight = safeNum(params.weight, 20, 500);
      await createMeasurement(userId, {
        weight,
        date: (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })(),
      });
      break;
    }
    case 'log_checkin': {
      const today = (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();
      const { error } = await supabase.from('daily_checkins').upsert({
        user_id: userId,
        date: today,
        energy: params.energy ?? null,
        mood: params.mood ?? null,
        sleep_hours: params.sleep_hours ?? null,
      }, { onConflict: 'user_id,date' });
      if (error) throw error;
      break;
    }
    case 'swap_exercise': {
      if (!activePlan?.id || !Array.isArray(activePlan.days)) {
        throw new Error('No active workout plan found');
      }
      const days = JSON.parse(JSON.stringify(activePlan.days));
      const day = days[params.day_index];
      if (!day) throw new Error('Day not found in plan');
      if (!Array.isArray(day.exercises) || !day.exercises[params.exercise_index]) {
        throw new Error('Exercise not found in plan');
      }
      day.exercises[params.exercise_index] = {
        ...day.exercises[params.exercise_index],
        name: params.new_exercise,
        exercise_name: params.new_exercise,
      };
      await updateWorkoutPlan(activePlan.id, { days });
      break;
    }
    case 'navigate': {
      if (params.path) navigate(params.path);
      break;
    }
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

// ─── Profile target helpers ────────────────────────────────────────────────────

async function updateProfileTarget(userId, key, value) {
  // Read current profile_data, merge, write back
  const { data, error: readErr } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .single();
  if (readErr) throw readErr;

  const profileData = data?.profile_data ?? {};
  const targets = profileData?.targets ?? {};
  const updated = { ...profileData, targets: { ...targets, [key]: value } };

  const { error: writeErr } = await supabase
    .from('profiles')
    .update({ profile_data: updated })
    .eq('id', userId);
  if (writeErr) throw writeErr;
}

async function updateProfileTargets(userId, patch) {
  const { data, error: readErr } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .single();
  if (readErr) throw readErr;

  const profileData = data?.profile_data ?? {};
  const targets = profileData?.targets ?? {};
  const updated = { ...profileData, targets: { ...targets, ...patch } };

  const { error: writeErr } = await supabase
    .from('profiles')
    .update({ profile_data: updated })
    .eq('id', userId);
  if (writeErr) throw writeErr;
}
