import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function WorkoutLoggingGuide() {
  return (
    <BlogPostLayout
      title="Complete Guide: Workout Logging"
      excerpt="Log workouts with professional precision — sets, reps, load, and RPE. Understand each detail."
      publishedAt="2026-03-15"
      readingTime={8}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Why Track Workouts?</h2>
      <p>
        Tracking workouts matters because it helps with:
      </p>
      <ul>
        <li><strong>Progression</strong> — see whether you are getting stronger week by week</li>
        <li><strong>Adherence</strong> — stay consistent with your prescribed plan</li>
        <li><strong>Analysis</strong> — identify which exercises work best for you</li>
        <li><strong>Injury prevention</strong> — monitor volume and RPE to avoid overtraining</li>
      </ul>

      <h2>Anatomy of a Workout Log</h2>
      <p>
        Each exercise has the following components:
      </p>
      
      <h3>1. Exercise Name</h3>
      <p>
        Search the Atlas exercise database (bench press, leg press, squat, and more).
        Atlas suggests exercises based on recent history and favorites.
      </p>

      <h3>2. Sets</h3>
      <p>
        How many sets you completed. Example: 4 sets of bench press.
      </p>

      <h3>3. Repetitions</h3>
      <p>
        The number of repetitions per set. You can log:
      </p>
      <ul>
        <li><strong>Exact:</strong> "10 reps" if all sets were 10</li>
        <li><strong>Range:</strong> "8-12 reps" if it varied</li>
      </ul>

      <h3>4. Load</h3>
      <p>
        In kg or lbs, depending on your settings. Leave it blank for bodyweight exercises.
      </p>

      <h3>5. RPE (Rate of Perceived Exertion)</h3>
      <p>
        From 1–10, how hard the effort felt. This helps distinguish strength work, hypertrophy work, and cardio.
      </p>
      <ul>
        <li><strong>6-7:</strong> light training, plenty left in reserve</li>
        <li><strong>8-9:</strong> moderate to heavy training</li>
        <li><strong>9-10:</strong> near-max effort, very few reps in reserve</li>
      </ul>

      <h2>Step by Step: Log a Complete Workout</h2>

      <h3>1. Go to Workouts</h3>
      <p>
        Click "Workouts" in the sidebar. You will see a summary of recent sessions and a "New Workout" option.
      </p>

      <h3>2. Create a New Workout</h3>
      <p>
        Click "New Workout" or choose an earlier date if you are logging retroactively.
      </p>

      <h3>3. Search for an Exercise</h3>
      <p>
        Start typing the exercise name. Atlas suggests:
      </p>
      <ul>
        <li><strong>Favorite</strong> exercises at the top</li>
        <li><strong>Recent</strong> exercises</li>
        <li><strong>Full-search</strong> results</li>
      </ul>
      <p>
        If the exercise does not exist, you can create a <strong>custom exercise</strong>.
      </p>

      <h3>4. Log Sets and Reps</h3>
      <p>
        Enter:
      </p>
      <ul>
        <li><strong>Sets:</strong> 4</li>
        <li><strong>Reps:</strong> 8-12 (or exact, e.g. 10)</li>
        <li><strong>Load:</strong> 100 kg</li>
        <li><strong>RPE:</strong> 8</li>
        <li><strong>Notes (optional):</strong> "Felt weak today", "Ready to increase the load"</li>
      </ul>

      <h3>5. Add More Exercises</h3>
      <p>
        Click "Add Exercise" to continue building the session.
      </p>

      <h3>6. Finish and Save</h3>
      <p>
        Click "Save Workout". Atlas calculates:
      </p>
      <ul>
        <li><strong>Total volume:</strong> sets × reps × load</li>
        <li><strong>Estimated duration:</strong> based on the exercise list</li>
        <li><strong>Average RPE:</strong> average across all exercises</li>
      </ul>

      <h2>Professional Tips</h2>

      <h3>Use Favorites</h3>
      <p>
        Click the star to save exercises you use often. They appear at the top next time.
      </p>

      <h3>Track Progression</h3>
      <p>
        Increasing load, reps, or volume is progression. Use Atlas to spot strength trends over time.
      </p>

      <h3>Notes Matter</h3>
      <p>
        "Felt strong", "Technique broke down", "Mild shoulder irritation" — these notes help you identify patterns.
      </p>

      <h3>Compare with Prescription</h3>
      <p>
        If your coach prescribed a workout, Atlas shows "Plan vs Execution". Did you perform what was prescribed?
      </p>

      <h2>Integration with Check-ins</h2>
      <p>
        Atlas correlates workout logs with:
      </p>
      <ul>
        <li>Sleep (did you recover enough?)</li>
        <li>Energy (did you feel ready to train?)</li>
        <li>Nutrition (did you eat enough?)</li>
      </ul>
      <p>
        With 30+ days of data, progress insights can surface patterns like "you train better when you sleep 8+ hours."
      </p>

      <blockquote>
        <strong>Remember:</strong> Consistency beats intensity. A workout you log every time is more valuable
        than a heroic session you never document. Start today and keep the pattern going.
      </blockquote>
    </BlogPostLayout>
  );
}
