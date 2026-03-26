import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function AIPlanBuildingGuide() {
  return (
    <BlogPostLayout
      title="How AI Plan Building Works"
      excerpt="Understand how Atlas AI builds periodized training plans adapted to your schedule, goals, and training history."
      publishedAt="2026-03-26"
      readingTime={8}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>What is AI Plan Building?</h2>
      <p>
        Atlas AI Plan Building creates complete, periodized training programs tailored to you.
        Unlike generic templates, AI plans adapt to:
      </p>
      <ul>
        <li><strong>Your goals</strong> — strength, hypertrophy, endurance, or sport-specific</li>
        <li><strong>Your schedule</strong> — available days per week and session duration</li>
        <li><strong>Your experience</strong> — beginner, intermediate, or advanced</li>
        <li><strong>Your equipment</strong> — full gym, limited equipment, or bodyweight</li>
        <li><strong>Your constraints</strong> — injuries, preferences, movement limitations</li>
      </ul>

      <h2>The Science Behind AI Plans</h2>

      <h3>Periodization Principles</h3>
      <p>
        Atlas AI applies established strength training principles:
      </p>
      <ul>
        <li><strong>Progressive overload</strong> — gradual increase in volume or intensity</li>
        <li><strong>Variation</strong> — strategic changes in exercises and rep ranges</li>
        <li><strong>Specificity</strong> — exercises that directly support your goals</li>
        <li><strong>Recovery management</strong> — built-in deloads and rest days</li>
        <li><strong>Individual differences</strong> — adjustments based on your response</li>
      </ul>

      <h3>Block Periodization</h3>
      <p>
        Plans are organized into blocks, each with a specific focus:
      </p>
      <ul>
        <li><strong>Foundation Block (Weeks 1-4)</strong> — movement quality, work capacity, preparation</li>
        <li><strong>Build Block (Weeks 5-8)</strong> — primary adaptations for your goal</li>
        <li><strong>Peak Block (Weeks 9-12)</strong> — intensification, testing, competition prep</li>
        <li><strong>Deload (Week 13)</strong> — recovery, adaptation consolidation</li>
      </ul>

      <h2>Step by Step: Build Your Plan</h2>

      <h3>1. Start Plan Creation</h3>
      <p>
        Go to <strong>Plans → Create AI Plan</strong> or click "New Plan" on your dashboard.
      </p>

      <h3>2. Define Your Goal</h3>
      <p>
        Select your primary objective:
      </p>
      <ul>
        <li><strong>Build Strength</strong> — focus on compound lifts, lower reps, higher load</li>
        <li><strong>Build Muscle</strong> — hypertrophy focus, moderate reps, volume emphasis</li>
        <li><strong>Improve Conditioning</strong> — endurance, work capacity, metabolic stress</li>
        <li><strong>Athletic Performance</strong> — power, speed, sport-specific qualities</li>
        <li><strong>Body Recomposition</strong> — balanced approach for fat loss and muscle gain</li>
      </ul>

      <h3>3. Set Your Schedule</h3>
      <p>
        Tell Atlas when you can train:
      </p>
      <ul>
        <li><strong>Days per week:</strong> 2-6 (AI optimizes based on recovery needs)</li>
        <li><strong>Session duration:</strong> 30, 45, 60, or 90 minutes</li>
        <li><strong>Preferred days:</strong> specific days or "any day" flexibility</li>
      </ul>

      <h3>4. Configure Equipment</h3>
      <p>
        Choose your training environment:
      </p>
      <ul>
        <li><strong>Full Gym</strong> — barbells, dumbbells, machines, cables</li>
        <li><strong>Home Gym (Basic)</strong> — dumbbells, bench, pull-up bar</li>
        <li><strong>Home Gym (Minimal)</strong> — resistance bands, bodyweight</li>
        <li><strong>Bodyweight Only</strong> — no equipment required</li>
      </ul>

      <h3>5. Set Experience Level</h3>
      <p>
        Be honest about your training age:
      </p>
      <ul>
        <li><strong>Beginner</strong> — less than 1 year consistent training</li>
        <li><strong>Intermediate</strong> — 1-3 years, familiar with basic movements</li>
        <li><strong>Advanced</strong> — 3+ years, needs periodization for progress</li>
      </ul>

      <h3>6. Add Preferences & Constraints</h3>
      <p>
        Optional but important:
      </p>
      <ul>
        <li>Exercises to include or exclude</li>
        <li>Movement limitations or injuries</li>
        <li>Training preferences (e.g., "prefer free weights")</li>
        <li>Cardio inclusion and type</li>
      </ul>

      <h3>7. Review and Generate</h3>
      <p>
        Atlas shows a preview of your plan structure:
      </p>
      <ul>
        <li>Weekly schedule overview</li>
        <li>Split type (full body, upper/lower, push/pull/legs)</li>
        <li>Volume distribution across muscle groups</li>
        <li>Estimated weekly time commitment</li>
      </ul>
      <p>
        Click <strong>Generate Plan</strong> to create your complete program.
      </p>

      <h2>What's Inside Your AI Plan</h2>

      <h3>Complete Workout Details</h3>
      <p>
        Each session includes:
      </p>
      <ul>
        <li>Warm-up protocol specific to the day's work</li>
        <li>Main exercises with sets, reps, and load targets</li>
        <li>Accessory work for balance and injury prevention</li>
        <li>Cool-down recommendations</li>
        <li>Estimated duration and intensity guidance</li>
      </ul>

      <h3>Progressive Overload Tracking</h3>
      <p>
        The plan includes progression rules:
      </p>
      <ul>
        <li>When to increase load (e.g., hit top of rep range)</li>
        <li>When to add sets</li>
        <li>When to deload or maintain</li>
        <li>Alternative exercises if equipment is unavailable</li>
      </ul>

      <h3>Adherence Monitoring</h3>
      <p>
        As you log workouts, Atlas tracks:
      </p>
      <ul>
        <li>Plan vs execution comparison</li>
        <li>Volume compliance (are you hitting target volume?)</li>
        <li>Intensity compliance (are you training at planned RPE?)</li>
        <li>Consistency score (sessions completed vs scheduled)</li>
      </ul>

      <h2>Adapting Your Plan</h2>

      <h3>Life Happens — Adjustments Are Normal</h3>
      <p>
        Atlas makes it easy to modify your plan:
      </p>
      <ul>
        <li><strong>Swap exercises</strong> — same muscle group, different movement</li>
        <li><strong>Adjust volume</strong> — add or remove sets based on recovery</li>
        <li><strong>Reschedule</strong> — move workouts to different days</li>
        <li><strong>Regenerate</strong> — completely rebuild based on new goals or schedule</li>
      </ul>

      <h3>Auto-Adjustments</h3>
      <p>
        If enabled, Atlas can automatically:
      </p>
      <ul>
        <li>Reduce volume if check-ins show high fatigue</li>
        <li>Extend deload if recovery metrics don't improve</li>
        <li>Accelerate progression if you're consistently exceeding targets</li>
      </ul>

      <h2>Integration with AI Workout</h2>
      <p>
        Your plan and AI Workout are connected:
      </p>
      <ul>
        <li>AI Workout respects your plan's muscle group schedule</li>
        <li>Plan targets influence AI Workout suggestions</li>
        <li>Logged workouts feed back into plan adherence tracking</li>
        <li>You can use AI Workout for days when you want flexibility within the plan</li>
      </ul>

      <h2>Tips for Best Results</h2>

      <h3>Be Realistic with Your Schedule</h3>
      <p>
        A 3-day plan you actually complete beats a 6-day plan you skip half the time.
        Atlas optimizes for consistency.
      </p>

      <h3>Log Everything</h3>
      <p>
        The more data Atlas has, the better it can adjust. Log workouts, check-ins,
        and even notes about how sessions felt.
      </p>

      <h3>Trust the Process</h3>
      <p>
        Give a plan at least 4 weeks before judging it. Early days are about learning
        movements and establishing baselines.
      </p>

      <h3>Use Regeneration Wisely</h3>
      <p>
        Don't regenerate constantly. Use adjustments for small changes, and only
        regenerate when your goals or schedule significantly change.
      </p>

      <blockquote>
        <strong>Remember:</strong> AI Plan Building isn't magic — it's intelligent application
        of training science to your unique situation. Follow the plan, log consistently,
        and trust that progression is happening even when you don't feel it day-to-day.
      </blockquote>
    </BlogPostLayout>
  );
}
