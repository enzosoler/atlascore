import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const INVITE_EXPIRY_DAYS = 30;

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { recipient_email, recipient_name, inviter_email, inviter_name, role, inviter_role } = body;

    // Validate inputs
    if (!recipient_email || !recipient_name || !inviter_email || !role) {
      return new Response(
        JSON.stringify({ success: false, error: 'Incomplete request data' }),
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Verify inviter is authenticated and has correct role
    const inviter = await base44.auth.me();
    if (!inviter || inviter.email !== inviter_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 403 }
      );
    }

    // Map role to entity and fields
    const roleMap = {
      student: { entity: 'CoachStudent', inviterField: 'coach_email', recipientField: 'student_email', recipientNameField: 'student_name' },
      client: { entity: 'NutritionistClientLink', inviterField: 'nutritionist_email', recipientField: 'client_email', recipientNameField: 'client_name' },
      patient: { entity: 'ClinicianPatient', inviterField: 'clinician_email', recipientField: 'patient_email', recipientNameField: 'patient_name' },
    };

    const mapping = roleMap[role];
    if (!mapping) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role' }),
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
    const expiryDateStr = expiresAt.toISOString().split('T')[0];

    // Create link record
    const linkData = {
      [mapping.inviterField]: inviter_email,
      [mapping.recipientField]: recipient_email,
      [mapping.recipientNameField]: recipient_name,
      status: 'pending',
      invited_at: new Date().toISOString().split('T')[0],
      expires_at: expiryDateStr,
    };

    await base44.asServiceRole.entities[mapping.entity].create(linkData);

    // Send email with invite link
    const appUrl = Deno.env.get('APP_URL') || 'https://atlas-core.app';
    const inviteUrl = `${appUrl}/auth?mode=signup&invite=${encodeURIComponent(recipient_email)}&role=${role}&inviter=${encodeURIComponent(inviter_email)}`;

    const emailBody = `
Hi ${recipient_name},

${inviter_name} invited you to join their team on Atlas Core.

If you are joining as a ${role === 'student' ? 'student' : role === 'client' ? 'client' : 'patient'}, use the link below to create your account:

${inviteUrl}

This link expires in 30 days.

Not you? You can ignore this email.

---
Atlas Core
`.trim();

    await base44.integrations.Core.SendEmail({
      to: recipient_email,
      subject: `${inviter_name} invited you to Atlas Core`,
      body: emailBody,
      from_name: 'Atlas Core',
    });

    console.log(`Invite sent to ${recipient_email} from ${inviter_email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Invite sent successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('sendInvite error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
});
