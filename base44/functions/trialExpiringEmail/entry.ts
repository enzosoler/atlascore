/**
 * trialExpiringEmail - daily cron job
 * Sends reminder email 3 days before a trial expires
 * Called via create_automation with schedule_type=simple, repeat_unit=days, repeat_interval=1
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date();
    const threeFromNow = new Date(today);
    threeFromNow.setDate(threeFromNow.getDate() + 3);
    const threeDaysFromNow = threeFromNow.toISOString().split('T')[0];

    // Find all trialing subscriptions expiring in 3 days
    const allTrialing = await base44.asServiceRole.entities.Subscription.filter({ 
      status: 'trialing'
    });

    const expiringSoon = allTrialing.filter(sub => 
      sub.trial_ends_at === threeDaysFromNow
    );

    console.log(`trialExpiringEmail: found ${expiringSoon.length} trial(s) expiring in 3 days`);

    if (expiringSoon.length === 0) {
      return Response.json({ sent_count: 0, message: 'No reminders to send' });
    }

    // Send email to each user
    const emails = expiringSoon.map(sub =>
      base44.integrations.Core.SendEmail({
        to: sub.user_email,
        subject: 'Your Atlas Core trial ends in 3 days',
        body: `
Hi,

Your Atlas Core trial ends in 3 days (${sub.trial_ends_at}).

Upgrade now to keep access to:
- Atlas AI
- AI workout and diet generation
- Lab exam tracking
- Progress photos
- And more

Upgrade here: https://atlascore.app/Pricing

If you have any questions, just reply to this email.

Thanks,
Atlas Core
        `.trim(),
        from_name: 'Atlas Core',
      })
    );

    await Promise.all(emails);

    console.log(`trialExpiringEmail: sent ${expiringSoon.length} reminder email(s)`);
    return Response.json({ sent_count: expiringSoon.length, success: true });

  } catch (error) {
    console.error('trialExpiringEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
