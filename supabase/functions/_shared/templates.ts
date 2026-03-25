/**
 * Email templates for Atlas Core
 * All templates return both HTML and plain text versions
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface WelcomeData {
  firstName: string;
  appUrl: string;
}

export interface ConfirmEmailData {
  firstName: string;
  confirmUrl: string;
  appUrl: string;
}

export interface TrialData {
  firstName: string;
  trialDaysLeft: number;
  appUrl: string;
}

export interface ResetPasswordData {
  firstName: string;
  resetUrl: string;
  appUrl: string;
}

// Brand colors
const C = {
  bg: '#F4F4F5',
  card: '#FFFFFF',
  fg: '#09090B',
  fg2: '#52525B',
  border: '#E4E4E7',
  cta: '#09090B',
  ctaText: '#FFFFFF',
};

function wrapBase(content: string, appUrl: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
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
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Atlas Core</h1>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Atlas Core. All rights reserved.</p>
    <p><a href="${appUrl}">${appUrl.replace('https://', '')}</a></p>
  </div>
</div>
</body>
</html>`;
}

export function buildWelcome(data: WelcomeData): EmailTemplate {
  const { firstName, appUrl } = data;
  const displayName = firstName || 'there';
  
  const subject = 'Welcome to Atlas Core!';
  
  const html = wrapBase(`
    <h2>Welcome to Atlas Core, ${displayName}!</h2>
    <p>Your fitness journey starts now. We're excited to help you reach your goals with personalized training and nutrition tracking.</p>
    <p>Here's what you can do next:</p>
    <ul>
      <li>Complete your profile setup</li>
      <li>Log your first workout</li>
      <li>Set up your nutrition targets</li>
    </ul>
    <a href="${appUrl}/today" class="cta">Get Started</a>
    <p>If you have any questions, just reply to this email. We're here to help!</p>
  `, appUrl, subject);
  
  const text = `Welcome to Atlas Core, ${displayName}!

Your fitness journey starts now. We're excited to help you reach your goals with personalized training and nutrition tracking.

Here's what you can do next:
- Complete your profile setup
- Log your first workout
- Set up your nutrition targets

Get Started: ${appUrl}/today

If you have any questions, just reply to this email. We're here to help!

© ${new Date().getFullYear()} Atlas Core
${appUrl}`;
  
  return { subject, html, text };
}

export function buildConfirmEmail(data: ConfirmEmailData): EmailTemplate {
  const { firstName, confirmUrl, appUrl } = data;
  const displayName = firstName || 'there';
  
  const subject = 'Confirm your Atlas Core account';
  
  const html = wrapBase(`
    <h2>Hi ${displayName},</h2>
    <p>Thanks for signing up for Atlas Core! Please confirm your email address to get started.</p>
    <a href="${confirmUrl}" class="cta">Confirm Email Address</a>
    <p style="font-size:13px;color:${C.fg2};margin-top:32px;">Or copy and paste this link into your browser:<br/>${confirmUrl}</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `, appUrl, subject);
  
  const text = `Hi ${displayName},

Thanks for signing up for Atlas Core! Please confirm your email address to get started.

Confirm Email: ${confirmUrl}

If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} Atlas Core
${appUrl}`;
  
  return { subject, html, text };
}

export function buildTrialStarted(data: TrialData): EmailTemplate {
  const { firstName, trialDaysLeft, appUrl } = data;
  const displayName = firstName || 'there';
  
  const subject = 'Your Atlas Core trial has started!';
  
  const html = wrapBase(`
    <h2>Hi ${displayName},</h2>
    <p>Great news! Your ${trialDaysLeft}-day free trial of Atlas Core is now active.</p>
    <p>You now have full access to all premium features:</p>
    <ul>
      <li>Advanced workout tracking</li>
      <li>Nutrition planning and logging</li>
      <li>Progress analytics and insights</li>
      <li>Protocol management</li>
    </ul>
    <a href="${appUrl}/today" class="cta">Explore Premium Features</a>
    <p>Your trial ends in ${trialDaysLeft} days. We'll remind you before it expires.</p>
  `, appUrl, subject);
  
  const text = `Hi ${displayName},

Great news! Your ${trialDaysLeft}-day free trial of Atlas Core is now active.

You now have full access to all premium features:
- Advanced workout tracking
- Nutrition planning and logging
- Progress analytics and insights
- Protocol management

Explore Premium: ${appUrl}/today

Your trial ends in ${trialDaysLeft} days. We'll remind you before it expires.

© ${new Date().getFullYear()} Atlas Core
${appUrl}`;
  
  return { subject, html, text };
}

export function buildResetPassword(data: ResetPasswordData): EmailTemplate {
  const { firstName, resetUrl, appUrl } = data;
  const displayName = firstName || 'there';
  
  const subject = 'Reset your Atlas Core password';
  
  const html = wrapBase(`
    <h2>Hi ${displayName},</h2>
    <p>We received a request to reset your Atlas Core password. Click the button below to set a new password.</p>
    <a href="${resetUrl}" class="cta">Reset Password</a>
    <p style="font-size:13px;color:${C.fg2};margin-top:32px;">Or copy and paste this link:<br/>${resetUrl}</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request this reset, please ignore this email or contact support if you have concerns.</p>
  `, appUrl, subject);
  
  const text = `Hi ${displayName},

We received a request to reset your Atlas Core password.

Reset Password: ${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email or contact support.

© ${new Date().getFullYear()} Atlas Core
${appUrl}`;
  
  return { subject, html, text };
}

export type EmailType = 'welcome' | 'confirm_email' | 'trial_started' | 'reset_password';

export function buildTemplate(
  type: EmailType,
  data: WelcomeData | ConfirmEmailData | TrialData | ResetPasswordData
): EmailTemplate {
  switch (type) {
    case 'welcome':
      return buildWelcome(data as WelcomeData);
    case 'confirm_email':
      return buildConfirmEmail(data as ConfirmEmailData);
    case 'trial_started':
      return buildTrialStarted(data as TrialData);
    case 'reset_password':
      return buildResetPassword(data as ResetPasswordData);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
