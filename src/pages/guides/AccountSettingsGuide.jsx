import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function AccountSettingsGuide() {
  return (
    <BlogPostLayout
      title="How to Change Language and Other Preferences"
      excerpt="Configure your account settings, language preferences, and notification options."
      publishedAt="2026-03-26"
      readingTime={3}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Personalizing Your Atlas Experience</h2>
      <p>
        Atlas Core adapts to your preferences. From language to notifications, here's how to
        configure the app to work best for you.
      </p>

      <h2>Language Settings</h2>

      <h3>Available Languages</h3>
      <p>
        Atlas currently supports:
      </p>
      <ul>
        <li><strong>English (en)</strong> — full feature support</li>
        <li><strong>Portuguese - Brazil (pt-BR)</strong> — full feature support</li>
      </ul>

      <h3>Change Language</h3>
      <p>
        To switch languages:
      </p>
      <ol>
        <li>Go to <strong>Settings → Preferences</strong></li>
        <li>Find "Language" option</li>
        <li>Select your preferred language</li>
        <li>Change applies immediately</li>
        <li>All content, including help articles, switches to selected language</li>
      </ol>

      <h3>Language Toggle (Quick Access)</h3>
      <p>
        Fast switching without going to settings:
      </p>
      <ul>
        <li>Click the language pill in the top navigation ("EN" or "PT")</li>
        <li>Or use keyboard shortcut: Ctrl/Cmd + L</li>
        <li>Toggle between your two most-used languages</li>
      </ul>

      <h3>What Gets Translated</h3>
      <p>
        When you change language:
      </p>
      <ul>
        <li>All interface elements and navigation</li>
        <li>Help center articles and guides</li>
        <li>Exercise names (where available)</li>
        <li>Email notifications</li>
        <li>PDF reports</li>
      </ul>

      <h3>What Stays in Original Language</h3>
      <p>
        Some content remains unchanged:
      </p>
      <ul>
        <li>Your custom exercise names</li>
        <li>Workout notes you wrote</li>
        <li>Personal tags and categories</li>
        <li>Imported data from other sources</li>
      </ul>

      <h2>Unit Preferences</h2>

      <h3>Weight Units</h3>
      <p>
        Choose how weight is displayed:
      </p>
      <ul>
        <li><strong>Kilograms (kg)</strong> — metric system</li>
        <li><strong>Pounds (lbs)</strong> — imperial system</li>
      </ul>
      <p>
        To change: <strong>Settings → Preferences → Weight Units</strong>
      </p>
      <p>
        <strong>Note:</strong> Changing units converts all historical data automatically.
        You won't lose data or need to re-enter anything.
      </p>

      <h3>Body Measurements</h3>
      <p>
        Same options as weight:
      </p>
      <ul>
        <li>Centimeters (cm)</li>
        <li>Inches (in)</li>
      </ul>
      <p>
        Can be set independently from weight units.
      </p>

      <h3>Distance</h3>
      <p>
        For cardio and conditioning tracking:
      </p>
      <ul>
        <li>Kilometers (km)</li>
        <li>Miles (mi)</li>
      </ul>

      <h2>Theme and Appearance</h2>

      <h3>Dark/Light Mode</h3>
      <p>
        Atlas defaults to your system preference, but you can override:
      </p>
      <ol>
        <li>Go to <strong>Settings → Appearance</strong></li>
        <li>Choose:
          <ul>
            <li>System (follows your OS setting)</li>
            <li>Dark</li>
            <li>Light</li>
          </ul>
        </li>
      </ol>

      <h3>Accent Color</h3>
      <p>
        Customize the brand color:
      </p>
      <ul>
        <li>Default (Atlas Orange)</li>
        <li>Blue</li>
        <li>Green</li>
        <li>Purple</li>
        <li>Red</li>
      </ul>

      <h3>Font Size</h3>
      <p>
        Adjust text size:
      </p>
      <ul>
        <li>Small (compact interface)</li>
        <li>Normal (default)</li>
        <li>Large (better accessibility)</li>
        <li>Extra Large (maximum readability)</li>
      </ul>

      <h2>Notification Preferences</h2>

      <h3>Workout Reminders</h3>
      <p>
        Stay consistent with reminders:
      </p>
      <ul>
        <li><strong>Scheduled workouts:</strong> Reminder 1 hour before planned session</li>
        <li><strong>Missed workout:</strong> Gentle nudge if you skip a scheduled day</li>
        <li><strong>Weekly prep:</strong> Sunday reminder to review upcoming week</li>
      </ul>
      <p>
        Configure at: <strong>Settings → Notifications → Workouts</strong>
      </p>

      <h3>Check-in Reminders</h3>
      <p>
        Keep recovery data current:
      </p>
      <ul>
        <li>Daily check-in reminder (morning or evening)</li>
        <li>Weekly reflection prompt</li>
        <li>Measurement reminders (monthly, bi-weekly, etc.)</li>
      </ul>

      <h3>AI and Plan Notifications</h3>
      <p>
        Stay informed about your training:
      </p>
      <ul>
        <li>New AI workout generated</li>
        <li>Plan phase transitions</li>
        <li>Deload reminders</li>
        <li>Progress milestones</li>
      </ul>

      <h3>Social and Coach Notifications</h3>
      <p>
        If connected to coaches or peers:
      </p>
      <ul>
        <li>Coach feedback on workouts</li>
        <li>Plan updates from coach</li>
        <li>Accountability partner updates</li>
      </ul>

      <h3>Marketing and Updates</h3>
      <p>
        Optional communications:
      </p>
      <ul>
        <li>New feature announcements</li>
        <li>Tips and education content</li>
        <li>Special offers (can opt out)</li>
        <li>Blog digest (weekly/monthly)</li>
      </ul>

      <h3>Notification Channels</h3>
      <p>
        Choose how you receive each type:
      </p>
      <ul>
        <li>In-app (always on, shows in notification bell)</li>
        <li>Email (configure frequency: immediate, daily digest, weekly)</li>
        <li>Push (mobile notifications)</li>
        <li>SMS (for critical reminders only)</li>
      </ul>

      <h3>Quiet Hours</h3>
      <p>
        Respect your downtime:
      </p>
      <ol>
        <li>Set "Do Not Disturb" hours</li>
        <li>No notifications during these times</li>
        <li>Exceptions: workout reminders if scheduled during quiet hours</li>
      </ol>

      <h2>Privacy and Security</h2>

      <h3>Data Sharing</h3>
      <p>
        Control what others see:
      </p>
      <ul>
        <li>Profile visibility (public, friends only, private)</li>
        <li>Workout sharing (share specific workouts, not everything)</li>
        <li>Progress photo privacy (who can see your photos)</li>
        <li>Measurement sharing (weight trends, etc.)</li>
      </ul>

      <h3>Connected Apps</h3>
      <p>
        Manage integrations:
      </p>
      <ul>
        <li>Apple Health / Google Fit</li>
        <li>MyFitnessPal</li>
        <li>Garmin, Fitbit, etc.</li>
        <li>Revoke access anytime</li>
      </ul>

      <h3>Two-Factor Authentication</h3>
      <p>
        Secure your account:
      </p>
      <ol>
        <li>Go to <strong>Settings → Security</strong></li>
        <li>Enable 2FA</li>
        <li>Choose method: authenticator app or SMS</li>
        <li>Backup recovery codes in safe place</li>
      </ol>

      <h3>Export Your Data</h3>
      <p>
        Access all your data:
      </p>
      <ul>
        <li>Full data export available anytime</li>
        <li>Multiple formats: CSV, JSON, PDF</li>
        <li>See <strong>Export Reports Guide</strong> for details</li>
      </ul>

      <h3>Delete Account</h3>
      <p>
        If you need to leave:
      </p>
      <ol>
        <li>Go to <strong>Settings → Account → Delete Account</strong></li>
        <li>Export your data first (recommended)</li>
        <li>Confirm deletion</li>
        <li>All data permanently removed within 30 days</li>
      </ol>

      <h2>Training Preferences</h2>

      <h3>Default Workout Settings</h3>
      <p>
        Set your preferences:
      </p>
      <ul>
        <li>Default rest time between sets</li>
        <li>Default RPE scale (1-10 or RPE/RIR)</li>
        <li>Auto-timer settings</li>
        <li>Default unit for exercises</li>
      </ul>

      <h3>AI Preferences</h3>
      <p>
        Customize AI behavior:
      </p>
      <ul>
        <li>AI Workout style (conservative, balanced, aggressive)</li>
        <li>Auto-adjust based on recovery (on/off)</li>
        <li>Preferred exercise types to include</li>
        <li>Exercise types to avoid</li>
      </ul>

      <h2>Accessibility</h2>

      <h3>Screen Reader Support</h3>
      <p>
        Atlas works with:
      </p>
      <ul>
        <li>VoiceOver (iOS)</li>
        <li>TalkBack (Android)</li>
        <li>NVDA/JAWS (Desktop web)</li>
      </ul>

      <h3>Keyboard Navigation</h3>
      <p>
        Full keyboard support:
      </p>
      <ul>
        <li>Tab through all interactive elements</li>
        <li>Keyboard shortcuts for common actions</li>
        <li>Visible focus indicators</li>
      </ul>

      <h3>Motion and Animation</h3>
      <p>
        For motion sensitivity:
      </p>
      <ul>
        <li>Option to reduce animations</li>
        <li>No auto-playing content</li>
        <li>Static alternatives to animated charts</li>
      </ul>

      <blockquote>
        <strong>Make it yours.</strong> Atlas is designed to adapt to how you work best.
        Take a few minutes to configure your preferences — it'll make every workout,
        check-in, and review more comfortable and efficient.
      </blockquote>
    </BlogPostLayout>
  );
}
