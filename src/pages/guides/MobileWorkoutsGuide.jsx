import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function MobileWorkoutsGuide() {
  return (
    <BlogPostLayout
      title="How to Use Atlas on Mobile During Workouts"
      excerpt="Best practices for logging training on your phone at the gym without friction."
      publishedAt="2026-03-26"
      readingTime={4}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Mobile-First Design</h2>
      <p>
        atlas.core is designed for the gym. Every feature works seamlessly on mobile,
        from logging sets to reviewing plans. Here's how to get the most from mobile training.
      </p>

      <h2>Setting Up for Gym Success</h2>

      <h3>Before You Arrive</h3>
      <p>
        Preparation prevents phone fumbling:
      </p>
      <ul>
        <li><strong>Charge your phone</strong> — nothing kills a workout like a dead battery</li>
        <li><strong>Check offline mode</strong> — Atlas works offline if gym WiFi is spotty</li>
        <li><strong>Load today's workout</strong> — open it before you start</li>
        <li><strong>Set screen timeout</strong> — 2-5 minutes so it doesn't lock mid-set</li>
        <li><strong>Enable auto-brightness</strong> — adjusts to gym lighting</li>
      </ul>

      <h3>Phone Position</h3>
      <p>
        Where to keep your device:
      </p>
      <ul>
        <li><strong>Armband:</strong> Secure, accessible, hands-free</li>
        <li><strong>Pocket:</strong> Quick access, but risk of damage</li>
        <li><strong>On equipment:</strong> Visible timer, but don't block others</li>
        <li><strong>Gym bag nearby:</strong> Walk over between sets</li>
      </ul>

      <h2>Logging During Workouts</h2>

      <h3>Quick-Log Mode</h3>
      <p>
        Atlas mobile has a streamlined workout interface:
      </p>
      <ul>
        <li>Large buttons for set completion</li>
        <li>Swipe to move between exercises</li>
        <li>One-tap RPE selection</li>
        <li>Auto-advance after logging</li>
      </ul>

      <h3>Set-by-Set Logging</h3>
      <p>
        Efficient workflow:
      </p>
      <ol>
        <li>Do your set</li>
        <li>Pick up phone</li>
        <li>Tap the checkmark (or enter reps if different from target)</li>
        <li>Optionally adjust load if needed</li>
        <li>Put phone down</li>
        <li>Rest</li>
      </ol>
      <p>
        Total time: 3-5 seconds. Don't let logging disrupt your flow.
      </p>

      <h3>Rest Timer</h3>
      <p>
        Use the built-in timer:
      </p>
      <ul>
        <li>Starts automatically after logging a set</li>
        <li>Vibrates when rest is complete</li>
        <li>Shows next exercise while resting</li>
        <li>Adjustable presets for different exercises</li>
      </ul>

      <h3>Offline Logging</h3>
      <p>
        Atlas works without internet:
      </p>
      <ul>
        <li>Log all workouts normally</li>
        <li>Data saves locally</li>
        <li>Syncs automatically when connection returns</li>
        <li>No data loss, even in airplane mode</li>
      </ul>

      <h2>Mobile-Specific Features</h2>

      <h3>Voice Input</h3>
      <p>
        Hands busy? Use your voice:
      </p>
      <ul>
        <li>"Log 10 reps at 225 pounds"</li>
        <li>"Next exercise"</li>
        <li>"Add note: felt heavy today"</li>
        <li>"Start rest timer"</li>
      </ul>

      <h3>Quick Actions</h3>
      <p>
        Long-press shortcuts:
      </p>
      <ul>
        <li>Long-press exercise name → swap exercise</li>
        <li>Long-press set → copy set</li>
        <li>Long-press checkmark → log failure/skip</li>
      </ul>

      <h3>Widget (iOS/Android)</h3>
      <p>
        Add Atlas widget to home screen:
      </p>
      <ul>
        <li>See today's workout at a glance</li>
        <li>Quick-start from widget</li>
        <li>View weekly consistency</li>
        <li>Progress to weekly volume goal</li>
      </ul>

      <h3>Lock Screen Controls</h3>
      <p>
        Access without unlocking:
      </p>
      <ul>
        <li>Current exercise visible on lock screen</li>
        <li>Set completion button</li>
        <li>Rest timer countdown</li>
        <li>Next exercise preview</li>
      </ul>

      <h2>Minimizing Phone Time</h2>

      <h3>The "Log After" Method</h3>
      <p>
        For flow-state training:
      </p>
      <ol>
        <li>Do the entire workout from memory or a written note</li>
        <li>Log everything at the end in one batch</li>
        <li>Atlas helps you reconstruct with recent exercise suggestions</li>
      </ol>
      <p>
        Trade-off: Less precise data, but better training focus.
      </p>

      <h3>Auto-Fill Estimates</h3>
      <p>
        Speed up logging:
      </p>
      <ul>
        <li>Atlas suggests reps and load based on history</li>
        <li>Mostly right? Just tap confirm</li>
        <li>Minor adjustment? Tap once to edit</li>
        <li>Way off? Type in the actual values</li>
      </ul>

      <h3>Minimal Mode</h3>
      <p>
        Strip down the interface:
      </p>
      <ul>
        <li>Hide exercise instructions</li>
        <li>Remove plan comparison</li>
        <li>Show only current exercise</li>
        <li>Bigger buttons, less scrolling</li>
      </ul>

      <h2>Gym Etiquette with Phones</h2>

      <h3>Be Aware</h3>
      <p>
        Don't be "that person":
      </p>
      <ul>
        <li>Don't hog equipment while scrolling</li>
        <li>Keep volume low (vibrate mode)</li>
        <li>Don't video without permission</li>
        <li>Step aside if you need to focus on your phone</li>
      </ul>

      <h3>Safety First</h3>
      <p>
        Never compromise safety:
      </p>
      <ul>
        <li>Don't hold phone during heavy lifts</li>
        <li>Set it down for compound movements</li>
        <li>Use a spotter for max attempts, not just your phone</li>
        <li>Pay attention to surroundings</li>
      </ul>

      <h2>Dealing with Gym Challenges</h2>

      <h3>Poor Gym WiFi</h3>
      <p>
        Atlas has you covered:
      </p>
      <ul>
        <li>Enable offline mode before arriving</li>
        <li>Everything works without connection</li>
        <li>Syncs when you leave the gym</li>
        <li>Pre-download your plan if you know WiFi is bad</li>
      </ul>

      <h3>Sweaty Hands</h3>
      <p>
        Protect your device:
      </p>
      <ul>
        <li>Use a towel before touching phone</li>
        <li>Consider a waterproof case</li>
        <li>Voice input when hands are wet</li>
        <li>Wipe down phone post-workout</li>
      </ul>

      <h3>Bright Sunlight (Outdoor Training)</h3>
      <p>
        Visibility tips:
      </p>
      <ul>
        <li>Max brightness setting</li>
        <li>Find shade for logging</li>
        <li>Use dark mode (reduces glare)</li>
        <li>Audio confirmations for set logging</li>
      </ul>

      <h3>Cold Weather</h3>
      <p>
        Winter training:
      </p>
      <ul>
        <li>Keep phone warm (battery drains in cold)</li>
        <li>Use voice input with gloves</li>
        <li>Shorter rest timer (don't cool down)</li>
        <li>Log essential data only</li>
      </ul>

      <h2>Battery Optimization</h2>

      <h3>Extend Battery Life</h3>
      <p>
        Long workouts need power:
      </p>
      <ul>
        <li>Low power mode (Atlas still works)</li>
        <li>Reduce screen brightness</li>
        <li>Close other apps</li>
        <li>Airplane mode (saves 30-40% battery)</li>
        <li>Portable charger as backup</li>
      </ul>

      <h3>Battery Warning</h3>
      <p>
        Atlas alerts you:
      </p>
      <ul>
        <li>20% battery: reminder to charge soon</li>
        <li>10% battery: offer to enter essential-only mode</li>
        <li>5% battery: quick-save current progress</li>
      </ul>

      <h2>Syncing and Backup</h2>

      <h3>Automatic Sync</h3>
      <p>
        Your data is safe:
      </p>
      <ul>
        <li>Syncs when connection returns</li>
        <li>Local backup every 5 minutes during workout</li>
        <li>Never lose data, even if phone dies</li>
        <li>Sync status shown in app</li>
      </ul>

      <h3>Cross-Device Access</h3>
      <p>
        Seamless between devices:
      </p>
      <ul>
        <li>Log on phone at gym</li>
        <li>Review on tablet at home</li>
        <li>Analyze on laptop</li>
        <li>All data synced across devices</li>
      </ul>

      <blockquote>
        <strong>Remember:</strong> Your phone is a tool for better training, not a distraction.
        Find the balance that works for you — whether that's detailed set-by-set logging or
        batch logging at the end. The best workout log is the one you actually keep.
      </blockquote>
    </BlogPostLayout>
  );
}
