const CURRENT_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'granted', 'past_due'];

async function deactivateCompetingCurrentRows(supabase, userId, keepId) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'inactive' })
    .eq('user_id', userId)
    .neq('id', keepId)
    .in('status', CURRENT_SUBSCRIPTION_STATUSES);

  if (error) {
    throw error;
  }
}

export async function writeSubscriptionByUserId(supabase, subscriptionRow) {
  const userId = subscriptionRow?.user_id;
  if (!userId) {
    throw new Error('writeSubscriptionByUserId requires subscriptionRow.user_id');
  }

  const stripeSubscriptionId = subscriptionRow.stripe_subscription_id ?? null;
  let targetId = null;

  if (stripeSubscriptionId) {
    const { data: existingByStripe, error: stripeLookupError } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .limit(1)
      .maybeSingle();

    if (stripeLookupError) {
      throw stripeLookupError;
    }

    if (existingByStripe?.user_id && existingByStripe.user_id !== userId) {
      throw new Error(`Subscription ${stripeSubscriptionId} belongs to another user`);
    }

    targetId = existingByStripe?.id ?? null;
  }

  if (!targetId) {
    const { data: existingByUser, error: userLookupError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userLookupError) {
      throw userLookupError;
    }

    targetId = existingByUser?.id ?? null;
  }

  if (targetId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionRow)
      .eq('id', targetId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (CURRENT_SUBSCRIPTION_STATUSES.includes(subscriptionRow.status) && data?.id) {
      await deactivateCompetingCurrentRows(supabase, userId, data.id);
    }

    return { action: 'update', data };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscriptionRow)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (CURRENT_SUBSCRIPTION_STATUSES.includes(subscriptionRow.status) && data?.id) {
    await deactivateCompetingCurrentRows(supabase, userId, data.id);
  }

  return { action: 'insert', data };
}
