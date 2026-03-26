import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function NutritionTrackingGuide() {
  return (
    <BlogPostLayout
      title="How to Track Your Nutrition and Macros"
      excerpt="Log meals, track macros, and connect nutrition data with your training for complete insights."
      publishedAt="2026-03-26"
      readingTime={7}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Why Track Nutrition?</h2>
      <p>
        Nutrition is the foundation of performance and body composition. Tracking helps you:
      </p>
      <ul>
        <li><strong>Fuel training</strong> — ensure adequate energy for workouts</li>
        <li><strong>Recover optimally</strong> — protein and nutrients for adaptation</li>
        <li><strong>Control body composition</strong> — manage surplus or deficit</li>
        <li><strong>Identify patterns</strong> — connect eating to performance and recovery</li>
        <li><strong>Build awareness</strong> — understand what you're actually consuming</li>
      </ul>

      <h2>Nutrition Tracking in Atlas</h2>

      <h3>What Atlas Tracks</h3>
      <p>
        Comprehensive nutrition logging:
      </p>
      <ul>
        <li><strong>Calories</strong> — total energy intake</li>
        <li><strong>Macronutrients</strong> — protein, carbohydrates, fats</li>
        <li><strong>Micronutrients</strong> — key vitamins and minerals</li>
        <li><strong>Meal timing</strong> — when you eat relative to training</li>
        <li><strong>Hydration</strong> — water intake</li>
        <li><strong>Foods</strong> — what you eat with portion sizes</li>
      </ul>

      <h3>Integration with Training</h3>
      <p>
        Atlas connects nutrition to your training:
      </p>
      <ul>
        <li>Pre-workout nutrition and performance correlation</li>
        <li>Post-workout recovery nutrition tracking</li>
        <li>Daily intake vs training volume analysis</li>
        <li>Body composition changes relative to intake</li>
      </ul>

      <h2>Step by Step: Log Your First Meal</h2>

      <h3>1. Navigate to Nutrition</h3>
      <p>
        Click <strong>Nutrition</strong> in the sidebar or dashboard.
      </p>

      <h3>2. Add a Meal</h3>
      <p>
        Click <strong>"Add Meal"</strong> and select the meal type:
      </p>
      <ul>
        <li>Breakfast</li>
        <li>Lunch</li>
        <li>Dinner</li>
        <li>Snack</li>
        <li>Pre-workout</li>
        <li>Post-workout</li>
        <li>Custom</li>
      </ul>

      <h3>3. Search for Foods</h3>
      <p>
        Start typing food names. Atlas includes:
      </p>
      <ul>
        <li>Common whole foods database</li>
        <li>Chain restaurant menu items</li>
        <li>Popular packaged foods</li>
        <li>Your custom foods and recipes</li>
        <li>Recently used items</li>
      </ul>

      <h3>4. Enter Portion Size</h3>
      <p>
        Specify the amount:
      </p>
      <ul>
        <li>Grams (most accurate)</li>
        <li>Ounces</li>
        <li>Servings (from package)</li>
        <li>Cups, tablespoons, etc.</li>
        <li>Visual estimates (if no scale available)</li>
      </ul>

      <h3>5. Review Macros</h3>
      <p>
        Atlas automatically calculates:
      </p>
      <ul>
        <li>Calories from the food</li>
        <li>Protein grams</li>
        <li>Carbohydrate grams (with fiber breakdown)</li>
        <li>Fat grams</li>
      </ul>

      <h3>6. Save and Continue</h3>
      <p>
        Add more foods to the meal or save the complete entry.
      </p>

      <h2>Advanced Features</h2>

      <h3>Creating Custom Foods</h3>
      <p>
        For foods not in the database:
      </p>
      <ol>
        <li>Go to <strong>Nutrition → Custom Foods</strong></li>
        <li>Click "Create Custom Food"</li>
        <li>Enter:
          <ul>
            <li>Name</li>
            <li>Serving size (e.g., 100g, 1 cup)</li>
            <li>Calories and macros per serving</li>
            <li>Optional: photo and barcode</li>
          </ul>
        </li>
        <li>Save for future use</li>
      </ol>

      <h3>Building Recipes</h3>
      <p>
        For meals you eat frequently:
      </p>
      <ol>
        <li>Go to <strong>Nutrition → Recipes</strong></li>
        <li>Click "Create Recipe"</li>
        <li>Add all ingredients with amounts</li>
        <li>Specify number of servings</li>
        <li>Atlas calculates macros per serving</li>
        <li>Save and log as one item</li>
      </ol>

      <h3>Meal Templates</h3>
      <p>
        Save common meals for quick logging:
      </p>
      <ul>
        <li>"Morning Shake" — protein, banana, oats, milk</li>
        <li>"Lunch Salad" — base + protein + toppings</li>
        <li>"Post-Workout" — chicken, rice, vegetables</li>
      </ul>

      <h3>Barcode Scanner (Mobile)</h3>
      <p>
        On the Atlas mobile app:
      </p>
      <ol>
        <li>Tap the barcode icon</li>
        <li>Scan package barcode</li>
        <li>Atlas looks up nutritional info</li>
        <li>Adjust serving size if needed</li>
        <li>Save to your log</li>
      </ol>

      <h2>Daily Targets and Tracking</h2>

      <h3>Setting Your Goals</h3>
      <p>
        Configure your nutrition targets:
      </p>
      <ol>
        <li>Go to <strong>Nutrition → Goals</strong></li>
        <li>Set your targets based on:
          <ul>
            <li>Total daily calories</li>
            <li>Protein target (typically 0.7-1g per lb bodyweight)</li>
            <li>Carbohydrate target (training-dependent)</li>
            <li>Fat target (typically 0.3-0.4g per lb bodyweight)</li>
          </ul>
        </li>
        <li>Choose tracking style: strict, flexible, or intuitive</li>
      </ol>

      <h3>Tracking Modes</h3>

      <h4>Strict Tracking</h4>
      <p>
        Log every food item with precise portions. Best for:
      </p>
      <ul>
        <li>Competition prep</li>
        <li>Specific body composition goals</li>
        <li>Troubleshooting issues</li>
        <li>Learning about food composition</li>
      </ul>

      <h4>Flexible Tracking</h4>
      <p>
        Track main meals and estimate snacks. Best for:
      </p>
      <ul>
        <li>Maintaining progress</li>
        <li>Busy lifestyles</li>
        <li>Sustainable long-term habits</li>
      </ul>

      <h4>Intuitive Tracking</h4>
      <p>
        Note meal timing and general patterns. Best for:
      </p>
      <ul>
        <li>Building awareness without obsession</li>
        <li>Maintainers who eat consistently</li>
        <li>Those who find detailed tracking stressful</li>
      </ul>

      <h2>Connecting Nutrition to Training</h2>

      <h3>Pre-Workout Nutrition</h3>
      <p>
        Log what you eat 1-3 hours before training:
      </p>
      <ul>
        <li>Atlas tracks timing relative to workout</li>
        <li>Correlates pre-workout nutrition to performance</li>
        <li>Suggests optimal pre-workout meals based on your data</li>
      </ul>

      <h3>Post-Workout Nutrition</h3>
      <p>
        Track recovery nutrition:
      </p>
      <ul>
        <li>Log meals within the "anabolic window"</li>
        <li>Track protein timing</li>
        <li>Monitor carbohydrate replenishment</li>
        <li>Atlas correlates to next-day recovery metrics</li>
      </ul>

      <h3>Daily Insights</h3>
      <p>
        With enough data, Atlas shows:
      </p>
      <ul>
        <li>"You sleep better when protein is 30%+ of calories"</li>
        <li>"Higher carb days correlate with better training RPE"</li>
        <li>"You maintain strength better at 2500+ calories"</li>
      </ul>

      <h2>Tips for Accurate Tracking</h2>

      <h3>Use a Food Scale</h3>
      <p>
        For the first few weeks, weigh foods in grams. This builds accurate portion
        awareness that serves you even when you don't have a scale.
      </p>

      <h3>Track Everything</h3>
      <p>
        Include:
      </p>
      <ul>
        <li>Cooking oils and butter</li>
        <li>Condiments and sauces</li>
        <li>Beverages (including alcohol)</li>
        <li>Tastes, bites, and samples</li>
        <li>Supplements with calories</li>
      </ul>

      <h3>Plan Ahead</h3>
      <p>
        Log tomorrow's meals today. This helps with:
      </p>
      <ul>
        <li>Hitting targets intentionally</li>
        <li>Meal prep planning</li>
        <li>Grocery shopping</li>
        <li>Reducing decision fatigue</li>
      </ul>

      <h3>Be Honest</h3>
      <p>
        The only person you cheat by under-logging is yourself. Accurate data
drives accurate insights and results.
      </p>

      <h2>Common Challenges</h2>

      <h3>Eating Out</h3>
      <p>
        Strategies for restaurant meals:
      </p>
      <ul>
        <li>Choose menu items in Atlas database</li>
        <li>Estimate portions based on similar home-cooked meals</li>
        <li>Log conservatively (slightly overestimate)</li>
        <li>Use "Quick Add" for calories only if detailed breakdown unknown</li>
      </ul>

      <h3>Social Events</h3>
      <p>
        Balance accuracy with enjoyment:
      </p>
      <ul>
        <li>Pre-log your best guess</li>
        <li>Use "Estimated" tag for transparency</li>
        <li>Don't stress minor inaccuracies</li>
        <li>Focus on patterns over time, not single days</li>
      </ul>

      <h3>Tracking Fatigue</h3>
      <p>
        If detailed tracking becomes burdensome:
      </p>
      <ul>
        <li>Switch to Flexible or Intuitive mode temporarily</li>
        <li>Take a tracking break (1-2 weeks) while maintaining habits</li>
        <li>Use meal templates to speed up logging</li>
        <li>Remember why you started — the data serves you</li>
      </ul>

      <blockquote>
        <strong>Remember:</strong> Nutrition tracking isn't about perfection — it's about
        awareness and consistency. Even tracking 80% accurately gives you better
        insights than not tracking at all. Connect your eating to your training and watch
        both improve together.
      </blockquote>
    </BlogPostLayout>
  );
}
