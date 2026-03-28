import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function CoachManagementGuide() {
  return (
    <BlogPostLayout
      title="For Coaches: How to Manage Client Training"
      excerpt="Guide for coaches on managing athlete plans, reviewing logs, and sharing feedback through atlas.core."
      publishedAt="2026-03-26"
      readingTime={10}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Atlas for Coaching Professionals</h2>
      <p>
        atlas.core includes professional features designed for coaches, trainers, and nutritionists
        who manage multiple clients. This guide covers the complete workflow from client onboarding
        to ongoing program management.
      </p>

      <h2>Coach Account Setup</h2>

      <h3>Upgrading to Coach Tier</h3>
      <p>
        To access coaching features:
      </p>
      <ol>
        <li>Go to <strong>Settings → Subscription</strong></li>
        <li>Select <strong>Coach/Professional</strong> tier</li>
        <li>Complete professional profile verification</li>
        <li>Set up billing (per-client or unlimited)</li>
      </ol>

      <h3>Professional Profile</h3>
      <p>
        Configure your coach presence:
      </p>
      <ul>
        <li>Professional credentials and certifications</li>
        <li>Specialties (strength, bodybuilding, sports-specific, etc.)</li>
        <li>Profile photo and bio</li>
        <li>Contact preferences</li>
        <li>Availability and response time</li>
      </ul>

      <h3>Client Invitation System</h3>
      <p>
        Bring clients onto Atlas:
      </p>
      <ol>
        <li>Go to <strong>Coach Dashboard → Clients</strong></li>
        <li>Click "Invite Client"</li>
        <li>Enter client's email</li>
        <li>Select connection type:
          <ul>
            <li><strong>Full Access:</strong> View all data, create plans, log feedback</li>
            <li><strong>View Only:</strong> See workouts and metrics, no plan editing</li>
            <li><strong>Check-in Only:</strong> Receive updates and measurements, not daily logs</li>
          </ul>
        </li>
        <li>Send invitation</li>
        <li>Client accepts and connects their account</li>
      </ol>

      <h2>The Coach Dashboard</h2>

      <h3>Client Overview</h3>
      <p>
        At-a-glance client status:
      </p>
      <ul>
        <li>Last workout date and adherence</li>
        <li>This week's volume vs target</li>
        <li>Recent check-in trends (sleep, energy, soreness)</li>
        <li>Unread notes or questions from client</li>
        <li>Upcoming phase transitions</li>
        <li>Red flags: missed sessions, declining metrics</li>
      </ul>

      <h3>Weekly Summary View</h3>
      <p>
        Every Monday, Atlas generates for each client:
      </p>
      <ul>
        <li>Sessions completed vs scheduled</li>
        <li>Total volume and intensity</li>
        <li>Average adherence percentage</li>
        <li>Body weight trend</li>
        <li>Notable lifts (PRs, form concerns)</li>
        <li>Recovery metrics summary</li>
      </ul>

      <h3>Quick Actions</h3>
      <p>
        From the dashboard, instantly:
      </p>
      <ul>
        <li>Send a message to any client</li>
        <li>Review today's workout</li>
        <li>Adjust next week's plan</li>
        <li>Export client report</li>
      </ul>

      <h2>Reviewing Client Workouts</h2>

      <h3>Real-Time Log Review</h3>
      <p>
        As clients log workouts, you see:
      </p>
      <ul>
        <li>Live updates during their session</li>
        <li>Sets, reps, load as entered</li>
        <li>RPE and subjective ratings</li>
        <li>Session notes and questions</li>
        <li>Plan vs execution comparison</li>
      </ul>

      <h3>Detailed Analysis</h3>
      <p>
        Click any workout for deep dive:
      </p>
      <ul>
        <li>Exercise-by-exercise breakdown</li>
        <li>Load progression graphs</li>
        <li>Volume trends</li>
        <li>Rest time analysis</li>
        <li>Comparison to previous similar sessions</li>
      </ul>

      <h3>Video Review</h3>
      <p>
        If clients upload form videos:
      </p>
      <ul>
        <li>Watch directly in Atlas</li>
        <li>Add timestamped comments</li>
        <li>Draw on frames (squat depth markers, bar path)</li>
        <li>Compare to previous videos</li>
        <li>Side-by-side with technique examples</li>
      </ul>

      <h2>Providing Feedback</h2>

      <h3>Workout Comments</h3>
      <p>
        Add feedback on specific exercises:
      </p>
      <ol>
        <li>Open client's workout</li>
        <li>Click on any exercise</li>
        <li>Add comment visible to client</li>
        <li>Can include:
          <ul>
            <li>Text feedback</li>
            <li>Video links</li>
            <li>Load adjustments for next time</li>
            <li>Form cues</li>
          </ul>
        </li>
      </ol>

      <h3>Program Notes</h3>
      <p>
        High-level guidance:
      </p>
      <ul>
        <li>Weekly overview messages</li>
        <li>Phase transition instructions</li>
        <li>Goal reminders</li>
        <li>Strategy adjustments</li>
      </ul>

      <h3>Messaging</h3>
      <p>
        Direct communication:
      </p>
      <ul>
        <li>In-app messaging with clients</li>
        <li>Email notifications for unread messages</li>
        <li>Group messages (team/clients)</li>
        <li>Template responses for common questions</li>
      </ul>

      <h2>Creating and Managing Plans</h2>

      <h3>Building Programs</h3>
      <p>
        Create plans for clients:
      </p>
      <ol>
        <li>Go to <strong>Coach Dashboard → Plans</strong></li>
        <li>Click "Create New Plan"</li>
        <li>Choose method:
          <ul>
            <li><strong>AI-Assisted:</strong> Atlas suggests based on client profile</li>
            <li><strong>From Template:</strong> Your saved program templates</li>
            <li><strong>Manual Build:</strong> Full custom control</li>
          </ul>
        </li>
        <li>Input client parameters (goals, schedule, equipment)</li>
        <li>Design or review the program</li>
        <li>Save and assign to client</li>
      </ol>

      <h3>Program Templates</h3>
      <p>
        Save time with templates:
      </p>
      <ul>
        <li>Create reusable program structures</li>
        <li>Customize per client</li>
        <li>Organize by goal type, duration, or experience level</li>
        <li>Share templates with other Atlas coaches</li>
      </ul>

      <h3>Plan Adjustments</h3>
      <p>
        Modify on the fly:
      </p>
      <ul>
        <li>Edit any future workout</li>
        <li>Swap exercises globally or for specific days</li>
        <li>Adjust volume targets</li>
        <li>Extend or shorten phases</li>
        <li>Push changes to client immediately</li>
      </ul>

      <h3>Auto-Adjustments</h3>
      <p>
        Let Atlas help with client monitoring:
      </p>
      <ul>
        <li>Set rules: "Reduce volume 20% if recovery score is less than 6"</li>
        <li>Auto-suggest deloads based on performance trends</li>
        <li>Progression recommendations based on adherence</li>
      </ul>

      <h2>Client Progress Tracking</h2>

      <h3>Metrics Dashboard</h3>
      <p>
        Visual progress indicators:
      </p>
      <ul>
        <li>Body composition trends</li>
        <li>Strength progression curves</li>
        <li>Volume and consistency metrics</li>
        <li>Recovery pattern analysis</li>
        <li>Goal progress bars</li>
      </ul>

      <h3>Comparison Tools</h3>
      <p>
        Analyze client development:
      </p>
      <ul>
        <li>Before/after photos side-by-side</li>
        <li>Performance baseline vs current</li>
        <li>Phase-over-phase improvements</li>
        <li>Exercise-specific progress</li>
      </ul>

      <h3>Red Flag Alerts</h3>
      <p>
        Atlas notifies you when:
      </p>
      <ul>
        <li>Client misses 2+ consecutive scheduled sessions</li>
        <li>Volume drops significantly without explanation</li>
        <li>Recovery metrics decline for 7+ days</li>
        <li>Weight changes more than 2% in one week</li>
        <li>Client logs concerning notes</li>
      </ul>

      <h2>Collaboration Features</h2>

      <h3>Shared Goal Setting</h3>
      <p>
        Align with clients on objectives:
      </p>
      <ul>
        <li>Set short-term (4-week) and long-term (12+ week) goals</li>
        <li>Define success metrics</li>
        <li>Track together</li>
        <li>Celebrate milestones</li>
      </ul>

      <h3>Periodization Collaboration</h3>
      <p>
        Plan the training year:
      </p>
      <ul>
        <li>Map out macrocycles</li>
        <li>Schedule competition dates</li>
        <li>Plan deloads and transitions</li>
        <li>Share calendar view with client</li>
      </ul>

      <h3>Educational Content Sharing</h3>
      <p>
        Share resources:
      </p>
      <ul>
        <li>Atlas help articles</li>
        <li>Form videos</li>
        <li>External resources (links, PDFs)</li>
        <li>Custom notes and instructions</li>
      </ul>

      <h2>Billing and Client Management</h2>

      <h3>Coach Billing Models</h3>
      <p>
        Atlas supports:
      </p>
      <ul>
        <li><strong>Per-client:</strong> Fixed fee per active client</li>
        <li><strong>Unlimited:</strong> Flat rate for unlimited clients</li>
        <li><strong>Hybrid:</strong> Base fee + per-client over threshold</li>
      </ul>

      <h3>Client Status Management</h3>
      <p>
        Organize your roster:
      </p>
      <ul>
        <li><strong>Active:</strong> Currently training with you</li>
        <li><strong>Paused:</strong> Temporary break (vacation, competition off-season)</li>
        <li><strong>Onboarding:</strong> Just joined, setting up</li>
        <li><strong>Archived:</strong> Former clients (data preserved, no active access)</li>
      </ul>

      <h3>Client Limit</h3>
      <p>
        Manage capacity:
      </p>
      <ul>
        <li>Set your maximum active clients</li>
        <li>Waitlist management</li>
        <li>Referral tracking</li>
      </ul>

      <h2>Privacy and Ethics</h2>

      <h3>Data Access</h3>
      <p>
        Clients control their privacy:
      </p>
      <ul>
        <li>Clients choose what to share</li>
        <li>Can revoke coach access anytime</li>
        <li>Progress photos require explicit permission</li>
        <li>Clients see what data you can access</li>
      </ul>

      <h3>Professional Conduct</h3>
      <p>
        Atlas enforces:
      </p>
      <ul>
        <li>Code of ethics agreement</li>
        <li>Appropriate communication guidelines</li>
        <li>Reporting system for concerns</li>
        <li>Professional development resources</li>
      </ul>

      <h3>Data Security</h3>
      <p>
        Protecting client information:
      </p>
      <ul>
        <li>Encrypted data transmission and storage</li>
        <li>Two-factor authentication for coaches</li>
        <li>Audit logs of data access</li>
        <li>GDPR/CCPA compliance tools</li>
      </ul>

      <h2>Tips for Effective Coaching with Atlas</h2>

      <h3>Weekly Review Ritual</h3>
      <p>
        Set aside time every week to:
      </p>
      <ul>
        <li>Review all client summaries</li>
        <li>Send personalized feedback</li>
        <li>Adjust next week's plans</li>
        <li>Check for red flags</li>
      </ul>

      <h3>Communication Cadence</h3>
      <p>
        Balance presence and autonomy:
      </p>
      <ul>
        <li>Daily: Available for questions, but don't hover</li>
        <li>Weekly: Summary feedback and plan adjustments</li>
        <li>Bi-weekly: Progress review calls (if offered)</li>
        <li>Phase changes: Detailed strategy discussions</li>
      </ul>

      <h3>Leverage AI, Don't Replace Judgment</h3>
      <p>
        Atlas AI helps but doesn't replace coaching:
      </p>
      <ul>
        <li>Use AI suggestions as starting points</li>
        <li>Apply your expertise to customize</li>
        <li>Teach clients to understand, not just follow</li>
        <li>Your experience + data = better outcomes</li>
      </ul>

      <blockquote>
        <strong>Coaching is a relationship.</strong> Atlas provides the infrastructure for
        better coaching, but the connection you build with clients, the accountability you provide,
        and the expertise you share are what drive real results. Use Atlas to scale your impact
        without losing the human touch.
      </blockquote>
    </BlogPostLayout>
  );
}
