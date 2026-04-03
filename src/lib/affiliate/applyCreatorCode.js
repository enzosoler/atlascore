import { supabase } from '@/lib/supabaseClient';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export async function applyCreatorCode(userId, code) {
  const { data, error } = await supabase.rpc('apply_creator_code', {
    p_user_id: userId,
    p_code: code,
  });

  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? 'failed_to_apply_code');

  // Mirror to RevenueCat as metadata (not source of truth)
  if (Capacitor.isNativePlatform()) {
    try {
      await Purchases.setAttributes({
        creator_code: data.code,
        creator_name: data.creator,
      });
    } catch { /* non-critical */ }
  }

  return data;
}

export async function getCreatorStatus(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('creator_code, creator_locked, creator_attached_at')
    .eq('id', userId)
    .single();

  if (error) return { code: null, locked: false };
  return {
    code: data?.creator_code || null,
    locked: data?.creator_locked || false,
    attachedAt: data?.creator_attached_at || null,
  };
}
