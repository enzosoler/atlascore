/**
 * One-shot test email sender — runs all templates to admin@useatlascore.com
 * Usage: node scripts/send-test-emails.mjs
 */

const RESEND_API_KEY = 're_XGLcasmD_6UH52aBoSptuCDJit1tCHxux';
const TO = 'admin@useatlascore.com';
const FROM = 'atlas.core <noreply@useatlascore.com>';
const APP = 'https://useatlascore.com';

// ─── Shared styles ────────────────────────────────────────────────────────────

const C = {
  bg: '#F4F4F5', card: '#FFFFFF', fg: '#09090B', fg2: '#52525B',
  border: '#E4E4E7', cta: '#09090B', ctaText: '#FFFFFF',
};

function wrap(content, title) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<style>
body{margin:0;padding:0;background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
.container{max-width:600px;margin:40px auto;background:${C.card};border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);}
.header{background:${C.fg};padding:32px;text-align:center;}
.header h1{color:${C.ctaText};margin:0;font-size:24px;font-weight:600;}
.body{padding:40px 32px;color:${C.fg};line-height:1.6;}
.body p{color:${C.fg2};margin:16px 0;}
.cta{display:inline-block;margin:24px 0;padding:14px 28px;background:${C.cta};color:${C.ctaText};text-decoration:none;border-radius:8px;font-weight:500;}
.footer{padding:24px 32px;background:${C.bg};text-align:center;font-size:13px;color:${C.fg2};border-top:1px solid ${C.border};}
.footer a{color:${C.fg};text-decoration:none;}
</style></head><body>
<div class="container">
  <div class="header"><h1>atlas.core</h1></div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} atlas.core. All rights reserved.</p>
    <p><a href="${APP}">${APP.replace('https://', '')}</a></p>
  </div>
</div></body></html>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

const templates = [
  {
    type: 'welcome',
    subject: 'Welcome to atlas.core!',
    html: wrap(`
      <h2>Welcome to atlas.core, Enzo!</h2>
      <p>Your fitness journey starts now. We're excited to help you reach your goals with personalized training and nutrition tracking.</p>
      <ul><li>Complete your profile setup</li><li>Log your first workout</li><li>Set up your nutrition targets</li></ul>
      <a href="${APP}/today" class="cta">Get Started</a>
      <p>If you have any questions, just reply to this email.</p>
    `, 'Welcome to atlas.core!'),
  },
  {
    type: 'confirm_email',
    subject: 'Confirm your atlas.core account',
    html: wrap(`
      <h2>Hi Enzo,</h2>
      <p>Thanks for signing up for atlas.core! Please confirm your email address to get started.</p>
      <a href="${APP}/auth?confirm=test_token" class="cta">Confirm Email Address</a>
      <p style="font-size:13px;color:${C.fg2};margin-top:32px;">If you didn't create an account, you can safely ignore this email.</p>
    `, 'Confirm your atlas.core account'),
  },
  {
    type: 'reset_password',
    subject: 'Reset your atlas.core password',
    html: wrap(`
      <h2>Hi Enzo,</h2>
      <p>We received a request to reset your atlas.core password. Click the button below to set a new password.</p>
      <a href="${APP}/auth/update-password?token=test_token" class="cta">Reset Password</a>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this reset, please ignore this email or contact support.</p>
    `, 'Reset your atlas.core password'),
  },
  {
    type: 'trial_started',
    subject: 'Your atlas.core trial has started!',
    html: wrap(`
      <h2>Hi Enzo,</h2>
      <p>Great news! Your 7-day free trial of atlas.core is now active.</p>
      <ul>
        <li>Advanced workout tracking</li><li>Nutrition planning and logging</li>
        <li>Progress analytics and insights</li><li>Protocol management</li>
      </ul>
      <a href="${APP}/today" class="cta">Explore Premium Features</a>
      <p>Your trial ends in 7 days. We'll remind you before it expires.</p>
    `, 'Your trial has started!'),
  },
  {
    type: 'trial_ending',
    subject: 'Your trial ends in 2 days',
    html: wrap(`
      <h2>Hi Enzo,</h2>
      <p>Your atlas.core free trial ends in <strong>2 days</strong>.</p>
      <p>Don't lose access to your data, workouts, and progress. Upgrade now to keep everything.</p>
      <a href="${APP}/pricing" class="cta">Upgrade Now</a>
      <p style="font-size:13px;color:${C.fg2};">Your trial expires on April 3, 2026.</p>
    `, 'Your trial ends in 2 days'),
  },
  {
    type: 'trial_expired',
    subject: 'Your atlas.core trial has ended',
    html: wrap(`
      <h2>Your trial has ended</h2>
      <p>Hi Enzo, your 7-day free trial of atlas.core has expired.</p>
      <p>Your data is safe. Upgrade any time to regain full access and pick up right where you left off.</p>
      <a href="${APP}/pricing" class="cta">View Plans</a>
    `, 'Your trial has ended'),
  },
  {
    type: 'payment_success',
    subject: 'Payment confirmed — atlas.core',
    html: wrap(`
      <h2>Payment confirmed</h2>
      <p>Hi Enzo, your payment was successful.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <tr><td style="padding:10px 0;color:${C.fg2};border-bottom:1px solid ${C.border};">Plan</td><td style="padding:10px 0;text-align:right;font-weight:500;">Athlete Pro</td></tr>
        <tr><td style="padding:10px 0;color:${C.fg2};">Amount</td><td style="padding:10px 0;text-align:right;font-weight:500;">R$49,00</td></tr>
      </table>
      <a href="${APP}/settings/billing" class="cta">View Billing</a>
    `, 'Payment confirmed'),
  },
  {
    type: 'payment_failed',
    subject: 'Payment failed — action required',
    html: wrap(`
      <h2>We couldn't process your payment</h2>
      <p>Hi Enzo, your recent payment for atlas.core didn't go through.</p>
      <p>This can happen if your card expired, had insufficient funds, or your bank blocked the charge.</p>
      <a href="${APP}/settings/billing" class="cta">Update Payment Method</a>
      <p style="font-size:13px;color:${C.fg2};margin-top:24px;">If we can't collect payment, your subscription may be paused.</p>
    `, 'Payment failed'),
  },
  {
    type: 'subscription_canceled',
    subject: 'Your atlas.core subscription has been canceled',
    html: wrap(`
      <h2>Subscription canceled</h2>
      <p>Hi Enzo, your atlas.core subscription has been canceled.</p>
      <p>You'll have access to your account until <strong>April 30, 2026</strong>. After that, your account will revert to the free plan.</p>
      <a href="${APP}/settings/billing" class="cta">Reactivate Subscription</a>
      <p style="font-size:13px;color:${C.fg2};margin-top:24px;">Changed your mind? You can reactivate any time before your access ends.</p>
    `, 'Subscription canceled'),
  },
  {
    type: 'inactivity_nudge',
    subject: "You haven't logged in a while — atlas.core",
    html: wrap(`
      <h2>Hey Enzo, we miss you.</h2>
      <p>It's been 5 days since you last logged anything. Consistency is everything — even a short log today keeps your streak alive.</p>
      <a href="${APP}/today" class="cta">Log something today</a>
    `, 'Come back to atlas.core'),
  },
  {
    type: 'weekly_report',
    subject: 'Your atlas.core week — Mar 17–23',
    html: wrap(`
      <h2>Your week, Enzo.</h2>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <tr><td style="padding:10px 0;color:${C.fg2};border-bottom:1px solid ${C.border};">Workouts logged</td><td style="padding:10px 0;text-align:right;font-weight:600;">4</td></tr>
        <tr><td style="padding:10px 0;color:${C.fg2};border-bottom:1px solid ${C.border};">Nutrition days tracked</td><td style="padding:10px 0;text-align:right;font-weight:600;">5</td></tr>
        <tr><td style="padding:10px 0;color:${C.fg2};border-bottom:1px solid ${C.border};">Weight change</td><td style="padding:10px 0;text-align:right;font-weight:600;">−0.3 kg</td></tr>
        <tr><td style="padding:10px 0;color:${C.fg2};">Current streak</td><td style="padding:10px 0;text-align:right;font-weight:600;">9 days</td></tr>
      </table>
      <a href="${APP}/insights" class="cta">See full progress</a>
    `, 'Your weekly report'),
  },
  {
    type: 'milestone_streak_7',
    subject: '7-day streak — keep going! 🔥',
    html: wrap(`
      <h2>7 days straight, Enzo.</h2>
      <p>You've logged activity for 7 days in a row. That's not luck — that's discipline.</p>
      <p>Keep the streak alive. Your next milestone is 14 days.</p>
      <a href="${APP}/today" class="cta">Keep it going</a>
    `, '7-day streak!'),
  },
  {
    type: 'invite_beta',
    subject: "You're invited to atlas.core — early access",
    html: wrap(`
      <h2>Early access, Enzo.</h2>
      <p>I'm building atlas.core — a training and health platform for athletes and the professionals who work with them. You're one of a small group I've personally invited to try it before launch.</p>
      <p style="padding:14px 16px;background:${C.bg};border-radius:8px;border-left:3px solid ${C.border};font-style:italic;color:${C.fg2};margin:20px 0;">"This is the test personal note you'd write when sending the invite."</p>
      <p>Your access covers everything — athlete tracking, workout and nutrition logging, lab exams, body composition, progress photos, coach and clinician dashboards, protocols, and more. No paywalls, no limits.</p>
      <p>I'd love honest feedback on what works, what's confusing, and what's missing.</p>
      <a href="${APP}/invite?token=test_preview_token" class="cta">Accept early access</a>
      <p style="font-size:13px;color:${C.fg2};margin-top:24px;">This link is personal to you and expires in 7 days.</p>
    `, "You're invited — atlas.core early access"),
  },
];

// ─── Send ─────────────────────────────────────────────────────────────────────

async function send(template) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `[TEST] ${template.subject}`,
      html: template.html,
    }),
  });

  const data = await res.json();
  return { ok: res.ok, id: data.id, error: data.message };
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`Sending ${templates.length} test emails to ${TO}\n`);

for (const t of templates) {
  process.stdout.write(`  → ${t.type.padEnd(25)}`);
  const { ok, id, error } = await send(t);
  if (ok) {
    console.log(`✓  ${id}`);
  } else {
    console.log(`✗  ${error}`);
  }
  // Small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 300));
}

console.log('\nDone. Check admin@useatlascore.com.');
