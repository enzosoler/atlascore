import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function AIWorkoutGenerationGuide() {
  return (
    <BlogPostLayout
      title="How to Generate Today's Workout with AI"
      excerpt="Use Atlas AI to create personalized daily workouts based on your plan, recovery status, and training goals."
      publishedAt="2026-03-26"
      readingTime={6}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>What is AI Workout Generation?</h2>
      <p>
        Atlas AI Workout creates personalized training sessions for today based on:
      </p>
      <ul>
        <li><strong>Your current plan</strong> — what phase and block you're in</li>
        <li><strong>Recent training</strong> — what you did in the last 3-7 days</li>
        <li><strong>Recovery indicators</strong> — sleep, energy, and soreness from check-ins</li>
        <li><strong>Available equipment</strong> — home or gym setup</li>
        <li><strong>Time available</strong> — how long you can train today</li>
      </ul>

      <h2>When to Use AI Workout</h2>

      <h3>Perfect for:</h3>
      <ul>
        <li>Days when you want guidance but don't have a rigid plan</li>
        <li>Adjusting intensity based on how you feel today</li>
        <li>Quick gym sessions when you need structure fast</li>
        <li>Home workouts with limited equipment</li>
        <li>Deload or active recovery days</li>
      </ul>

      <h3>Different from full plans:</h3>
      <p>
        AI Workout generates <strong>single sessions</strong>. For complete periodized programs,
        use <strong>AI Plan Building</strong> instead.
      </p>

      <h2>Step by Step: Generate Your Workout</h2>

      <h3>1. Open AI Workout</h3>
      <p>
        Go to <strong>Workouts → AI Workout</strong> or click the AI Workout card on your dashboard.
      </p>

      <h3>2. Set Your Parameters</h3>
      <p>
        Tell Atlas what you need today:
      </p>
      <ul>
        <li><strong>Duration:</strong> 30, 45, 60, or 90 minutes</li>
        <li><strong>Focus:</strong> Push, Pull, Legs, Full Body, or let AI decide</li>
        <li><strong>Intensity:</strong> Light, Moderate, or Heavy (or auto-adjusted based on recovery)</li>
        <li><strong>Equipment:</strong> Full gym, Dumbbells only, or Bodyweight</li>
      </ul>

      <h3>3. Review the Generated Workout</h3>
      <p>
        Atlas creates a complete session with:
      </p>
      <ul>
        <li>Warm-up exercises specific to your main work</li>
        <li>Main exercises with sets, reps, and suggested load</li>
        <li>Accessory work to round out the session</li>
        <li>Estimated total time and volume</li>
      </ul>

      <h3>4. Customize if Needed</h3>
      <p>
        You can:
      </p>
      <ul>
        <li>Swap any exercise for an alternative</li>
        <li>Adjust sets or reps</li>
        <li>Regenerate the entire workout if you want different options</li>
        <li>Save the workout to your library for future use</li>
      </ul>

      <h3>5. Execute and Log</h3>
      <p>
        Once you're happy with the workout, click <strong>Start Workout</strong>. 
        Atlas logs it automatically as you complete each set.
      </p>

      <h2>How AI Makes Decisions</h2>

      <h3>Load Selection</h3>
      <p>
        AI suggests weights based on:
      </p>
      <ul>
        <li>Your historical data for each exercise</li>
        <li>Target rep range and RPE</li>
        <li>Recent performance trends</li>
      </ul>

      <h3>Volume Adjustment</h3>
      <p>
        If your recent check-ins show poor sleep or high fatigue, AI automatically:
      </p>
      <ul>
        <li>Reduces total sets by 10-20%</li>
        <li>Lowers suggested intensity</li>
        <li>Adds more recovery-focused exercises</li>
      </ul>

      <h3>Exercise Selection</h3>
      <p>
        AI prioritizes:
      </p>
      <ul>
        <li>Exercises you've performed well with before</li>
        <li>Movements that fit your available equipment</li>
        <li>Exercises that balance your recent training (e.g., more pulling if you trained push yesterday)</li>
      </ul>

      <h2>Integration with Your Plan</h2>
      <p>
        If you have an active AI plan or coach-prescribed program:
      </p>
      <ul>
        <li>AI Workout respects the plan's phase and goals</li>
        <li>Muscle groups are balanced across the week</li>
        <li>Volume targets from your plan influence the session design</li>
        <li>Progressive overload patterns are maintained</li>
      </ul>

      <h2>Tips for Best Results</h2>

      <h3>Keep Check-ins Updated</h3>
      <p>
        The more accurate your recovery data, the better AI can adjust. Log sleep,
        energy, and soreness regularly.
      </p>

      <h3>Log Consistently</h3>
      <p>
        AI learns from your history. The more workouts you log, the better it understands
        your capabilities and preferences.
      </p>

      <h3>Provide Feedback</h3>
      <p>
        After completing an AI workout, rate how it felt. This helps Atlas learn your
        preferences over time.
      </p>

      <h3>Start Conservative</h3>
      <p>
        If you're new to AI workouts, start with moderate intensity and let the system
        learn your baseline before pushing harder.
      </p>

      <blockquote>
        <strong>Pro tip:</strong> AI Workout is your training partner that adapts to your life.
        Use it when you need flexibility while staying aligned with your long-term goals.
      </blockquote>
    </BlogPostLayout>
  );
}
