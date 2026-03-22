import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function PlanVsExecutionGuide() {
  return (
    <BlogPostLayout
      title="Plan vs Execution: Adherence in Depth"
      excerpt="Understand the difference between what you planned and what you actually did — and why it matters."
      publishedAt="2026-03-14"
      readingTime={7}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>The Concept: Plan vs Execution</h2>
      <p>
        <strong>Plan</strong> is what your coach or you prescribed — exercises, sets, reps, calories.
      </p>
      <p>
        <strong>Execution</strong> is what you actually did in the real world.
      </p>
      <p>
        The difference between the two is <strong>adherence</strong> — and it is one of the most important success metrics.
      </p>

      <h2>Why Plan vs Execution Matters</h2>
      <ul>
        <li><strong>For coaches:</strong> See whether clients are doing what was prescribed</li>
        <li><strong>For nutritionists:</strong> Understand the gap between the planned diet and what was eaten</li>
        <li><strong>For athletes:</strong> Learn why certain plans work — or do not</li>
        <li><strong>For clinicians:</strong> Validate adherence to prescribed protocols</li>
      </ul>

      <h2>Real Examples</h2>

      <h3>Workout: Plan vs Execution</h3>
      <p>
        <strong>Plan prescribed by the coach:</strong>
      </p>
      <ul>
        <li>4x Barbell bench press, 8-10 reps @ 100kg</li>
        <li>3x Barbell curl, 10-12 reps @ 30kg</li>
        <li>3x Rope tricep pushdown, 12-15 reps</li>
        <li>Expected duration: 45 min, RPE 8</li>
      </ul>

      <p>
        <strong>What the athlete actually did:</strong>
      </p>
      <ul>
        <li>3x Barbell bench press, 8 reps @ 100kg (stopped one set early)</li>
        <li>3x Barbell curl, 10 reps @ 30kg ✓</li>
        <li>3x Rope tricep pushdown, 12 reps ✓</li>
        <li>Actual duration: 35 min, RPE 7</li>
      </ul>

      <p>
        <strong>Analysis:</strong> 85% adherence — one bench set short. Possible causes: fatigue, incomplete recovery, or time pressure.
      </p>

      <h3>Nutrition: Plan vs Execution</h3>
      <p>
        <strong>Plan prescribed by the nutritionist:</strong>
      </p>
      <ul>
        <li>Breakfast: 500 kcal, 25g protein</li>
        <li>Lunch: 800 kcal, 40g protein</li>
        <li>Snack: 300 kcal, 15g protein</li>
        <li>Dinner: 700 kcal, 40g protein</li>
        <li><strong>Total:</strong> 2300 kcal, 120g protein</li>
      </ul>

      <p>
        <strong>What the client actually ate:</strong>
      </p>
      <ul>
        <li>Breakfast: 650 kcal, 20g protein (higher-carb choice)</li>
        <li>Lunch: 750 kcal, 38g protein ✓</li>
        <li>Snack: skipped (0 kcal)</li>
        <li>Dinner: 900 kcal, 45g protein</li>
        <li><strong>Total:</strong> 2300 kcal, 103g protein</li>
      </ul>

      <p>
        <strong>Analysis:</strong> Calories are on target, but protein is 13% low. Pattern: skipped snack, compensated at dinner.
        The nutritionist may need to adjust meal timing for better adherence.
      </p>

      <h2>How Atlas Calculates Adherence</h2>

      <h3>For Workouts</h3>
      <p>
        Atlas compares:
      </p>
      <ul>
        <li><strong>Exercises:</strong> was the exercise completed?</li>
        <li><strong>Volume:</strong> sets × reps × load</li>
        <li><strong>RPE:</strong> perceived intensity</li>
      </ul>
      <p>
        Adherence = planned exercises completed / total planned exercises.
      </p>

      <h3>For Nutrition</h3>
      <p>
        Atlas compares:
      </p>
      <ul>
        <li><strong>Calories:</strong> consumed vs target</li>
        <li><strong>Protein:</strong> consumed vs target</li>
        <li><strong>Carbs and fat:</strong> vs targets</li>
      </ul>
      <p>
        Adherence = average macro adherence.
      </p>

      <h2>How to Interpret Your Data</h2>

      <h3>Adherence 90–100%</h3>
      <p>
        <strong>Excellent.</strong> You are following the plan closely. Keep going.
      </p>

      <h3>Adherence 70–90%</h3>
      <p>
        <strong>Good.</strong> Small deviations are normal. Identify the gaps — is it time, motivation, food availability?
      </p>

      <h3>Adherence &lt; 70%</h3>
      <p>
        <strong>Reassess.</strong> The plan may not be realistic for your life right now. Work with your coach or nutritionist to adjust it.
      </p>

      <h2>Action: How to Improve Adherence</h2>

      <h3>1. Understand Why You Missed</h3>
      <p>
        Use notes on each exercise or meal: "No time", "No ingredients", "Low motivation", "Injured".
      </p>

      <h3>2. Adjust the Plan</h3>
      <p>
        If you always skip the same exercise or meal, it may not be realistic. Work with your coach to simplify it.
      </p>

      <h3>3. Track Patterns</h3>
      <p>
        "I always miss on Monday" or "When I sleep badly, I train worse." Use the data to identify patterns.
      </p>

      <h3>4. Celebrate Adherence</h3>
      <p>
        80% adherence across 30 days is extraordinary. It deserves recognition.
      </p>

      <blockquote>
        <strong>Hard truth:</strong> A perfect plan you cannot follow is worse than a 70% plan you follow consistently.
        Adherence beats perfection.
      </blockquote>
    </BlogPostLayout>
  );
}
