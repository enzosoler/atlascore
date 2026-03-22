import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function GettingStartedGuide() {
  return (
    <BlogPostLayout
      title="Getting Started with Atlas Core"
      excerpt="A complete guide to getting started — create your account, finish onboarding, and understand the dashboard in five minutes."
      publishedAt="2026-03-17"
      readingTime={5}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Welcome to Atlas Core</h2>
      <p>
        Atlas Core is your unified platform for tracking training, nutrition, and health.
        Whether you are an athlete, coach, nutritionist, or clinician, Atlas gives you professional tools
        to follow progress with precision.
      </p>

      <h2>Step 1: Create Your Account</h2>
      <p>
        Visit <strong>atlascore.com</strong> and click "Start Free". You can sign up with email,
        Google, or Apple. No credit card is required to begin.
      </p>
      <p>
        After confirming your email, you will be taken to onboarding.
      </p>

      <h2>Step 2: Complete Onboarding</h2>
      <p>
        Onboarding is a quick 2–3 minute walkthrough that covers:
      </p>
      <ul>
        <li><strong>Your profile</strong> — age, height, weight, and health goals</li>
        <li><strong>Your plan</strong> — daily calories and macros (protein, carbs, fat)</li>
        <li><strong>Your role</strong> — athlete, coach, nutritionist, or clinician</li>
      </ul>
      <p>
        You can skip any of these steps and come back later — there is no rush.
      </p>

      <h2>Step 3: Understand the Dashboard (Today)</h2>
      <p>
        After onboarding, you land on your "Today" dashboard. This is the center of Atlas Core.
      </p>

      <h3>Daily Check-in</h3>
      <p>
        At the top, complete your <strong>daily check-in</strong>. Tell Atlas:
      </p>
      <ul>
        <li>Your mood (1–5)</li>
        <li>Your energy level (1–5)</li>
        <li>Hours of sleep</li>
        <li>Liters of water you drank</li>
      </ul>
      <p>
        This data feeds progress insights — the more consistently you log, the better the patterns become.
      </p>

      <h3>Nutritional Snapshot</h3>
      <p>
        See today’s calories versus your target. Click to log meals.
      </p>

      <h3>Workout Summary</h3>
      <p>
        See today’s workout. Click to log exercises.
      </p>

      <h2>Step 4: Log Your First Meal</h2>
      <p>
        Open the <strong>Nutrition</strong> section and click "Add Meal".
      </p>
      <ol>
        <li>Select the meal (breakfast, lunch, snack, dinner)</li>
        <li>Search foods — Atlas includes a database with thousands of items</li>
        <li>Set the amount (100g, 1 cup, 1 unit)</li>
        <li>Save — Atlas calculates calories and macros automatically</li>
      </ol>

      <h2>Step 5: Log Your First Workout</h2>
      <p>
        Open <strong>Workouts</strong> and click "New Workout".
      </p>
      <ol>
        <li>Choose the workout date</li>
        <li>Search for an exercise (ex: bench press or leg press)</li>
        <li>Log sets, reps, and load</li>
        <li>Keep adding exercises until the session is complete</li>
        <li>Save — Atlas calculates total volume, time, and RPE</li>
      </ol>

      <h2>Next Steps</h2>
      <p>
        You’ve completed the essentials. Next:
      </p>
      <ul>
        <li>Read the other <strong>Guides</strong> to learn advanced workflows</li>
        <li>Invite a <strong>Coach or Nutritionist</strong> for custom prescriptions</li>
        <li>Explore <strong>Insights</strong> for analysis and recommendations</li>
        <li>Export your data as <strong>PDF/CSV</strong> whenever needed</li>
      </ul>

      <blockquote>
        <strong>Tip:</strong> Consistent tracking is the key. Even if results are not obvious immediately,
        30–60 days of data reveal real patterns. Start today.
      </blockquote>
    </BlogPostLayout>
  );
}
