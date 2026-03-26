import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function AdjustingPlansGuide() {
  return (
    <BlogPostLayout
      title="How to Adjust a Plan When Your Schedule Changes"
      excerpt="Learn to modify workouts, swap exercises, and adapt your training plan when life gets in the way."
      publishedAt="2026-03-26"
      readingTime={6}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Why Plans Need Adjustments</h2>
      <p>
        Life doesn't follow a 12-week periodization chart. Work deadlines, family obligations,
        travel, illness, and motivation fluctuations all affect training. Atlas is designed for
        real-world adaptation.
      </p>

      <h2>Types of Adjustments</h2>

      <h3>1. Session-Level Changes</h3>
      <p>
        For when today's session needs modification:
      </p>
      <ul>
        <li><strong>Swap exercises</strong> — equipment unavailable or exercise feels wrong</li>
        <li><strong>Adjust sets/reps</strong> — time constraints or recovery status</li>
        <li><strong>Change load</strong> — feel stronger or weaker than expected</li>
        <li><strong>Skip exercises</strong> — injury or discomfort</li>
      </ul>

      <h3>2. Weekly Schedule Changes</h3>
      <p>
        For when the whole week shifts:
      </p>
      <ul>
        <li><strong>Reschedule workouts</strong> — move Monday's session to Tuesday</li>
        <li><strong>Combine sessions</strong> — merge two shorter workouts into one</li>
        <li><strong>Split sessions</strong> — break a long workout into two shorter ones</li>
        <li><strong>Skip a day</strong> — remove a session entirely</li>
      </ul>

      <h3>3. Plan-Level Modifications</h3>
      <p>
        For fundamental plan changes:
      </p>
      <ul>
        <li><strong>Change days per week</strong> — 4 days becomes 3 or 5</li>
        <li><strong>Adjust duration</strong> — 60-minute sessions become 45</li>
        <li><strong>Switch goals</strong> — from strength to hypertrophy focus</li>
        <li><strong>Regenerate completely</strong> — new plan with new parameters</li>
      </ul>

      <h2>Step by Step: Adjust Your Plan</h2>

      <h3>Scenario 1: Today's Equipment Isn't Available</h3>

      <h4>1. Open the Workout</h4>
      <p>
        Go to <strong>Workouts</strong> and open today's scheduled session.
      </p>

      <h4>2. Find the Exercise</h4>
      <p>
        Locate the exercise you need to swap (e.g., barbell bench press when there's no bench free).
      </p>

      <h4>3. Use the Swap Feature</h4>
      <p>
        Click the <strong>swap icon</strong> (⇄) next to the exercise. Atlas shows alternatives that:
      </p>
      <ul>
        <li>Target the same muscle group</li>
        <li>Use available equipment</li>
        <li>Maintain similar movement patterns</li>
      </ul>

      <h4>4. Select Alternative</h4>
      <p>
        Choose from the list (e.g., dumbbell bench press). Atlas automatically:
      </p>
      <ul>
        <li>Adjusts suggested load based on the new exercise</li>
        <li>Updates the plan for future occurrences if you prefer</li>
        <li>Logs the swap for adherence tracking</li>
      </ul>

      <h4>5. Complete the Workout</h4>
      <p>
        Continue with the adjusted exercise. The plan still tracks as "executed with adjustments."
      </p>

      <h3>Scenario 2: You Can Only Train 30 Minutes Today</h3>

      <h4>1. Access Quick Adjust</h4>
      <p>
        In today's workout, click <strong>"Quick Adjust"</strong> or the <strong>time icon</strong>.
      </p>

      <h4>2. Set New Duration</h4>
      <p>
        Select <strong>30 minutes</strong>. Atlas will:
      </p>
      <ul>
        <li>Prioritize compound movements</li>
        <li>Reduce accessory volume</li>
        <li>Suggest superset combinations</li>
        <li>Remove lower-priority exercises</li>
      </ul>

      <h4>3. Review Changes</h4>
      <p>
        Atlas shows what was removed or reduced. You can:
      </p>
      <ul>
        <li>Accept all changes</li>
        <li>Manually adjust specific exercises</li>
        <li>Cancel and keep the original workout</li>
      </ul>

      <h4>4. Save Adjustment Pattern</h4>
      <p>
        If you often have only 30 minutes, Atlas can learn this pattern and suggest
        "condensed" versions of future workouts.
      </p>

      <h3>Scenario 3: Moving a Whole Week</h3>

      <h4>1. Go to Plan View</h4>
      <p>
        Navigate to <strong>Plans → [Your Active Plan]</strong> and view the calendar.
      </p>

      <h4>2. Drag and Drop</h4>
      <p>
        Click and drag workouts to new days. Atlas automatically:
      </p>
      <ul>
        <li>Adjusts rest day spacing</li>
        <li>Maintains muscle group rotation</li>
        <li>Warns if you create conflicts (e.g., chest two days in a row)</li>
      </ul>

      <h4>3. Handle Conflicts</h4>
      <p>
        If Atlas detects issues:
      </p>
      <ul>
        <li>Yellow warning: suboptimal but acceptable</li>
        <li>Red warning: significant conflict (e.g., same muscle group 2 days in a row)</li>
        <li>Suggestions: Atlas offers alternative arrangements</li>
      </ul>

      <h4>4. Confirm Changes</h4>
      <p>
        Save the new schedule. Atlas updates:
      </p>
      <ul>
        <li>Calendar view</li>
        <li>Notification reminders</li>
        <li>Plan adherence baseline</li>
      </ul>

      <h2>Smart Adjustment Features</h2>

      <h3>Auto-Volume Balance</h3>
      <p>
        When you remove or reduce exercises, Atlas can:
      </p>
      <ul>
        <li>Redistribute volume to remaining exercises</li>
        <li>Add sets to the next session for the same muscle group</li>
        <li>Track "missed volume" for future weeks</li>
      </ul>

      <h3>Recovery-Based Suggestions</h3>
      <p>
        If your check-ins show poor recovery, Atlas suggests:
      </p>
      <ul>
        <li>Reducing today's volume by 20%</li>
        <li>Swapping high-stress exercises for lower-stress alternatives</li>
        <li>Adding an extra rest day this week</li>
      </ul>

      <h3>Pattern Learning</h3>
      <p>
        Atlas learns from your adjustments:
      </p>
      <ul>
        <li>If you always skip leg day on Friday → suggests moving it to Thursday</li>
        <li>If you consistently reduce bench press volume → suggests lower baseline</li>
        <li>If you often need 30-minute versions → offers "express" alternatives</li>
      </ul>

      <h2>Maintaining Plan Integrity</h2>

      <h3>What Gets Tracked</h3>
      <p>
        Atlas tracks all adjustments for adherence analysis:
      </p>
      <ul>
        <li><strong>Exact match</strong> — performed exactly as prescribed</li>
        <li><strong>Adjusted execution</strong> — completed with modifications</li>
        <li><strong>Partial completion</strong> — some exercises skipped</li>
        <li><strong>Skipped session</strong> — entire workout missed</li>
      </ul>

      <h3>Adherence vs. Flexibility</h3>
      <p>
        Atlas doesn't punish adjustments — it celebrates consistency. The goal is:
      </p>
      <ul>
        <li>Hit your muscle groups consistently (not necessarily on exact days)</li>
        <li>Maintain weekly volume targets (can redistribute across days)</li>
        <li>Progress over time (not perfection every session)</li>
      </ul>

      <h2>Common Adjustment Patterns</h2>

      <h3>The "Work Travel" Pattern</h3>
      <p>
        Hotel gym with limited equipment:
      </p>
      <ul>
        <li>Set equipment to "Dumbbells Only" in Quick Adjust</li>
        <li>Atlas swaps all barbell movements for dumbbell alternatives</li>
        <li>Reduce duration if time zone affects energy</li>
      </ul>

      <h3>The "Sick Day" Pattern</h3>
      <p>
        Mild illness but want to move:
      </p>
      <ul>
        <li>Use "Recovery" mode in Quick Adjust</li>
        <li>Atlas removes high-intensity work</li>
        <li>Keeps light mobility and blood flow exercises</li>
        <li>Reduces suggested RPE across all movements</li>
      </ul>

      <h3>The "Time Crunch" Pattern</h3>
      <p>
        Unexpected deadline but don't want to skip:
      </p>
      <ul>
        <li>Select "Express" adjustment</li>
        <li>Atlas prioritizes the 3 most important exercises</li>
        <li>Removes all accessories</li>
        <li>Suggests supersets for everything</li>
      </ul>

      <h2>When to Regenerate vs. Adjust</h2>

      <h3>Adjust When:</h3>
      <ul>
        <li>Temporary schedule changes</li>
        <li>Single equipment unavailability</li>
        <li>Recovery fluctuations</li>
        <li>Minor preference changes</li>
      </ul>

      <h3>Regenerate When:</h3>
      <ul>
        <li>Goals fundamentally change (strength → endurance)</li>
        <li>Available days per week change long-term</li>
        <li>New equipment setup (home gym upgrade)</li>
        <li>Significant injury requiring program redesign</li>
        <li>Current plan isn't working after 4+ weeks</li>
      </ul>

      <blockquote>
        <strong>Remember:</strong> The best plan is one you actually follow. Atlas adjustments
        let you stay consistent even when life doesn't cooperate. Adjust early, adjust often,
        and keep the momentum going.
      </blockquote>
    </BlogPostLayout>
  );
}
