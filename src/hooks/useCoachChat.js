/**
 * useCoachChat — conversational AI coach hook.
 *
 * Manages message history, calls the ai-coach-chat edge function,
 * and executes actions returned by the AI (update targets, log data, swap exercises, navigate).
 *
 * No DB persistence in V1 — messages live in component state only.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { updateWorkoutPlan } from '@/services/workoutPlanService';
import { createMeasurement } from '@/services/bodyProgressService';


let msgIdCounter = 0;
function nextId() {
  return `msg-${++msgIdCounter}`;
}

export function useCoachChat({ invalidateAfterAction, activePlan } = {}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  // Map of actionId -> 'pending' | 'loading' | 'done' | 'dismissed'
  const [actionStates, setActionStates] = useState({});

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
        body: { message: text.trim(), page_context: pageContext },
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
  }, [messages, isTyping, appendMessage]);

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

  const clearHistory = useCallback(() => {
    setMessages([]);
    setActionStates({});
  }, []);

  return {
    messages,
    isTyping,
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

async function dispatchAction(action, { activePlan, navigate }) {
  const { type, params = {} } = action;
  const userId = await getCurrentUserId();

  switch (type) {
    case 'update_calorie_target': {
      await updateProfileTarget(userId, 'calories', params.calories);
      break;
    }
    case 'update_protein_target': {
      await updateProfileTarget(userId, 'protein', params.protein);
      break;
    }
    case 'update_macro_targets': {
      const patch = {};
      if (params.calories != null) patch.calories = params.calories;
      if (params.protein != null) patch.protein = params.protein;
      if (params.carbs != null) patch.carbs = params.carbs;
      if (params.fat != null) patch.fat = params.fat;
      await updateProfileTargets(userId, patch);
      break;
    }
    case 'log_food': {
      const { error } = await supabase.from('food_logs').insert({
        user_id: userId,
        name: params.name ?? 'Food',
        calories: params.calories ?? 0,
        protein: params.protein ?? 0,
        carbs: params.carbs ?? 0,
        fat: params.fat ?? 0,
        date: new Date().toISOString(),
        meal_type: params.meal_type ?? 'other',
      });
      if (error) throw error;
      break;
    }
    case 'log_weight': {
      await createMeasurement(userId, {
        weight: params.weight,
        date: new Date().toISOString().split('T')[0],
      });
      break;
    }
    case 'log_checkin': {
      const today = new Date().toISOString().split('T')[0];
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
