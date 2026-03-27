import { supabase } from '@/lib/supabaseClient';

/**
 * Get all clients for a professional filtered by link type.
 * @param {string} professionalId - UUID of the professional
 * @param {'coach'|'nutritionist'|'clinician'} linkType
 */
export async function getMyClients(professionalId, linkType) {
  const { data, error } = await supabase
    .from('professional_link_details')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('link_type', linkType)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all professionals linked to a client (all link types).
 * @param {string} clientId - UUID of the client
 */
export async function getMyProfessionals(clientId) {
  const { data, error } = await supabase
    .from('professional_link_details')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get pending invites for a client.
 * @param {string} clientId - UUID of the client
 */
export async function getPendingInvites(clientId) {
  const { data, error } = await supabase
    .from('professional_link_details')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Invite a client by email. Looks up the client's UUID from profiles by email,
 * then inserts a professional_links record.
 * @param {string} professionalId - UUID of the professional
 * @param {string} clientEmail - email of the client to invite
 * @param {'coach'|'nutritionist'|'clinician'} linkType
 */
export async function inviteClient(professionalId, clientEmail, linkType) {
  // Look up the client's profile id by email
  const { data: profiles, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', clientEmail.trim().toLowerCase())
    .limit(1);

  if (lookupError) throw lookupError;
  if (!profiles || profiles.length === 0) {
    throw new Error(`No account found for email: ${clientEmail}`);
  }

  const clientId = profiles[0].id;

  const { data, error } = await supabase
    .from('professional_links')
    .insert({
      professional_id: professionalId,
      client_id: clientId,
      link_type: linkType,
      status: 'pending',
      invited_by: professionalId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept or reject a link invitation.
 * @param {string} linkId - UUID of the professional_links row
 * @param {boolean} accept - true to accept, false to reject
 */
export async function respondToInvite(linkId, accept) {
  const updates = accept
    ? { status: 'active', accepted_at: new Date().toISOString() }
    : { status: 'rejected' };

  const { data, error } = await supabase
    .from('professional_links')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a link (sets status to 'removed', only professional can do this).
 * @param {string} linkId - UUID of the professional_links row
 */
export async function removeLink(linkId) {
  const { error } = await supabase
    .from('professional_links')
    .delete()
    .eq('id', linkId);

  if (error) throw error;
}

/**
 * Get a specific client's profile with their data summary.
 * @param {string} clientId - UUID of the client
 */
export async function getClientProfile(clientId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) throw error;
  return data;
}
