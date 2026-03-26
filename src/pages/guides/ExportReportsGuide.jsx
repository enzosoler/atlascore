import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function ExportReportsGuide() {
  return (
    <BlogPostLayout
      title="How to Export and Share Your Training Reports"
      excerpt="Generate detailed reports for yourself or share them with coaches and professionals."
      publishedAt="2026-03-26"
      readingTime={4}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Why Export Training Data?</h2>
      <p>
        Your training history is valuable. Exporting lets you:
      </p>
      <ul>
        <li><strong>Share with coaches</strong> — complete context for better guidance</li>
        <li><strong>Personal records</strong> — backup your fitness journey</li>
        <li><strong>Analysis</strong> — dig deeper into your own patterns</li>
        <li><strong>Transitions</strong> — moving between platforms or to a new coach</li>
        <li><strong>Accountability</strong> — regular reports to keep yourself on track</li>
      </ul>

      <h2>Available Export Types</h2>

      <h3>1. Workout History Export</h3>
      <p>
        Complete log of all training sessions:
      </p>
      <ul>
        <li>Every exercise, set, rep, and load</li>
        <li>Dates, durations, and notes</li>
        <li>RPE and subjective ratings</li>
        <li>Plan vs execution comparisons</li>
      </ul>
      <p>
        <strong>Formats:</strong> CSV, Excel, JSON
      </p>

      <h3>2. Progress Report</h3>
      <p>
        Visual summary of your transformation:
      </p>
      <ul>
        <li>Progress photos timeline</li>
        <li>Weight and measurement trends</li>
        <li>Body composition changes</li>
        <li>Milestone achievements</li>
      </ul>
      <p>
        <strong>Formats:</strong> PDF, shareable web link
      </p>

      <h3>3. Training Analytics</h3>
      <p>
        Data-driven insights about your training:
      </p>
      <ul>
        <li>Volume trends over time</li>
        <li>Exercise frequency analysis</li>
        <li>Strength progression curves</li>
        <li>Adherence and consistency metrics</li>
      </ul>
      <p>
        <strong>Formats:</strong> PDF report, CSV data
      </p>

      <h3>4. Coach Report</h3>
      <p>
        Professional summary for coaching review:
      </p>
      <ul>
        <li>Weekly/monthly training summary</li>
        <li>Plan adherence analysis</li>
        <li>Volume and intensity compliance</li>
        <li>Notes and feedback threads</li>
        <li>Suggested adjustments</li>
      </ul>
      <p>
        <strong>Formats:</strong> PDF, direct platform sharing
      </p>

      <h2>Step by Step: Export Your Data</h2>

      <h3>1. Go to Settings</h3>
      <p>
        Navigate to <strong>Settings → Data & Privacy → Export Data</strong>.
      </p>

      <h3>2. Choose Export Type</h3>
      <p>
        Select what you want to export:
      </p>
      <ul>
        <li>Workout history</li>
        <li>Progress photos and measurements</li>
        <li>Check-in data (sleep, energy, soreness)</li>
        <li>Nutrition logs</li>
        <li>Everything (complete data package)</li>
      </ul>

      <h3>3. Set Date Range</h3>
      <p>
        Define the period:
      </p>
      <ul>
        <li>Last 30 days</li>
        <li>Last 90 days</li>
        <li>Current year</li>
        <li>All time</li>
        <li>Custom range</li>
      </ul>

      <h3>4. Select Format</h3>
      <p>
        Choose your preferred format:
      </p>
      <ul>
        <li><strong>CSV:</strong> Best for spreadsheet analysis</li>
        <li><strong>Excel:</strong> Pre-formatted with charts</li>
        <li><strong>PDF:</strong> Professional reports</li>
        <li><strong>JSON:</strong> For developers or data import</li>
      </ul>

      <h3>5. Generate Export</h3>
      <p>
        Click <strong>Generate Export</strong>. Atlas processes your data and:
      </p>
      <ul>
        <li>Sends you an email when ready (for large exports)</li>
        <li>Provides immediate download (for small exports)</li>
        <li>Stores the export for 7 days in your account</li>
      </ul>

      <h2>Sharing with Coaches</h2>

      <h3>Method 1: Direct Platform Sharing</h3>
      <p>
        If your coach uses Atlas:
      </p>
      <ol>
        <li>Go to <strong>Profile → Coach Access</strong></li>
        <li>Send connection request to coach's email</li>
        <li>Grant permission level (view only, comment, or full access)</li>
        <li>Coach receives real-time access to your data</li>
      </ol>

      <h3>Method 2: Report Sharing</h3>
      <p>
        For coaches outside Atlas:
      </p>
      <ol>
        <li>Generate a Coach Report (see above)</li>
        <li>Choose share options:
          <ul>
            <li>Email directly to coach</li>
            <li>Create shareable link (expires in 7/30/90 days)</li>
            <li>Download and send manually</li>
          </ul>
        </li>
        <li>Include a personal message with context</li>
      </ol>

      <h3>Method 3: Scheduled Reports</h3>
      <p>
        Automate regular sharing:
      </p>
      <ul>
        <li>Set up weekly summary emails to your coach</li>
        <li>Monthly progress reports</li>
        <li>End-of-phase comprehensive reports</li>
      </ul>

      <h2>What's Included in Exports</h2>

      <h3>Workout Data Fields</h3>
      <p>
        Every export includes:
      </p>
      <ul>
        <li>Date and time</li>
        <li>Workout name/type</li>
        <li>Exercises performed</li>
        <li>Sets, reps, load for each exercise</li>
        <li>RPE ratings</li>
        <li>Notes and tags</li>
        <li>Planned vs actual comparison</li>
        <li>Rest times (if tracked)</li>
      </ul>

      <h3>Metadata Included</h3>
      <p>
        Context for interpretation:
      </p>
      <ul>
        <li>Active training plan at time of workout</li>
        <li>Week and phase of program</li>
        <li>Check-in data from that day (if available)</li>
        <li>Weight and measurements from that period</li>
      </ul>

      <h2>Privacy and Security</h2>

      <h3>Export Security</h3>
      <p>
        Your exported data is protected:
      </p>
      <ul>
        <li>Exports are generated securely and stored temporarily</li>
        <li>Download links expire after 7 days</li>
        <li>Email exports use encrypted links</li>
        <li>You can revoke shared links anytime</li>
      </ul>

      <h3>What's Never Shared</h3>
      <p>
        Atlas never exports without permission:
      </p>
      <ul>
        <li>Payment or billing information</li>
        <li>Account credentials</li>
        <li>Data from other users (even coaches)</li>
        <li>Deleted or archived content</li>
      </ul>

      <h2>Using Exported Data</h2>

      <h3>In Spreadsheets</h3>
      <p>
        CSV exports work great for:
      </p>
      <ul>
        <li>Pivot tables showing exercise frequency</li>
        <li>Charts of volume over time</li>
        <li>Personal records tracking</li>
        <li>Custom analytics</li>
      </ul>

      <h3>For Coaches</h3>
      <p>
        Coach reports help professionals:
      </p>
      <ul>
        <li>Review adherence without platform access</li>
        <li>Identify trends and patterns</li>
        <li>Make data-driven program adjustments</li>
        <li>Document client progress for their records</li>
      </ul>

      <h3>For Personal Records</h3>
      <p>
        Keep exports as:
      </p>
      <ul>
        <li>Annual training summaries</li>
        <li>Pre/post competition documentation</li>
        <li>Insurance or medical documentation</li>
        <li>Personal achievement archives</li>
      </ul>

      <h2>Export Limitations</h2>

      <h3>Plan-Based Limits</h3>
      <p>
        Export capabilities by subscription:
      </p>
      <ul>
        <li><strong>Free:</strong> Basic workout CSV, last 30 days only</li>
        <li><strong>Pro:</strong> All formats, any date range, analytics reports</li>
        <li><strong>Elite:</strong> Everything plus coach collaboration features</li>
      </ul>

      <h3>Technical Limits</h3>
      <p>
        For performance:
      </p>
      <ul>
        <li>Maximum 5 years of data per export</li>
        <li>Large exports may take up to 24 hours to generate</li>
        <li>Progress photos export as separate ZIP files</li>
        <li>Maximum 10 scheduled reports active at once</li>
      </ul>

      <blockquote>
        <strong>Your data belongs to you.</strong> Atlas makes it easy to access, export,
        and share your training history. Regular exports are a good backup practice,
        and sharing with coaches gives them the full picture they need to help you improve.
      </blockquote>
    </BlogPostLayout>
  );
}
