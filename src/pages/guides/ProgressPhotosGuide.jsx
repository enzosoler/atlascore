import React from 'react';
import BlogPostLayout from '@/components/content/BlogPostLayout';

export default function ProgressPhotosGuide() {
  return (
    <BlogPostLayout
      title="How to Compare Progress Photos Over Time"
      excerpt="Upload, organize, and compare body progress photos to visualize your transformation journey."
      publishedAt="2026-03-26"
      readingTime={5}
      author="Team Atlas"
      breadcrumb={{ href: '/help', label: 'Help Center' }}
    >
      <h2>Why Progress Photos Matter</h2>
      <p>
        The scale doesn't tell the whole story. Progress photos capture:
      </p>
      <ul>
        <li><strong>Body composition changes</strong> — muscle gain and fat loss</li>
        <li><strong>Posture improvements</strong> — from training and mobility work</li>
        <li><strong>Progression over time</strong> — visual timeline of transformation</li>
        <li><strong>Motivation</strong> — seeing change when the scale stalls</li>
        <li><strong>Objective feedback</strong> — beyond subjective perception</li>
      </ul>

      <h2>Best Practices for Progress Photos</h2>

      <h3>Consistency Is Key</h3>
      <p>
        For valid comparison, keep these constant:
      </p>
      <ul>
        <li><strong>Time of day:</strong> Morning, before eating, after bathroom</li>
        <li><strong>Lighting:</strong> Natural light or same artificial source</li>
        <li><strong>Location:</strong> Same room/background</li>
        <li><strong>Clothing:</strong> Same outfit or consistent minimal clothing</li>
        <li><strong>Poses:</strong> Front, side, and back angles</li>
        <li><strong>Distance:</strong> Full body in frame, consistent camera distance</li>
      </ul>

      <h3>Recommended Angles</h3>
      <p>
        Capture these three views every time:
      </p>
      <ul>
        <li><strong>Front:</strong> Facing camera, relaxed posture, arms at sides</li>
        <li><strong>Side:</strong> Profile view, showing torso thickness</li>
        <li><strong>Back:</strong> Facing away, showing back width and glutes</li>
      </ul>

      <h3>Photo Tips</h3>
      <ul>
        <li>Use a timer or ask someone to take photos</li>
        <li>Keep the camera at waist height</li>
        <li>Good lighting shows definition better than dim light</li>
        <li>Don't flex or pose — relaxed shows true progress</li>
        <li>Take multiple shots and choose the best</li>
      </ul>

      <h2>Step by Step: Upload and Compare</h2>

      <h3>1. Navigate to Progress</h3>
      <p>
        Go to <strong>Measurements → Progress Photos</strong> from the sidebar.
      </p>

      <h3>2. Upload New Photos</h3>
      <p>
        Click <strong>"Add Photos"</strong> and select:
      </p>
      <ul>
        <li>Date of the photos (defaults to today)</li>
        <li>Front, side, and back images</li>
        <li>Optional: weight and notes for context</li>
      </ul>

      <h3>3. Organize with Tags</h3>
      <p>
        Add optional context:
      </p>
      <ul>
        <li>Training phase ("Bulk Week 8", "Cut Month 2")</li>
        <li>Special events ("Post-Competition", "After Deload")</li>
        <li>Personal notes ("Feeling lean", "Best pump ever")</li>
      </ul>

      <h3>4. Compare Side-by-Side</h3>
      <p>
        Atlas offers multiple comparison modes:
      </p>
      <ul>
        <li><strong>Slider comparison:</strong> Drag to reveal before/after</li>
        <li><strong>Side-by-side:</strong> Two photos next to each other</li>
        <li><strong>Overlay:</strong> Semi-transparent overlay with alignment</li>
        <li><strong>Timeline:</strong> Scroll through all photos chronologically</li>
      </ul>

      <h3>5. Analyze Changes</h3>
      <p>
        When comparing, look for:
      </p>
      <ul>
        <li><strong>Shoulder width and roundness</strong> — deltoid development</li>
        <li><strong>Waist definition</strong> — core and body fat changes</li>
        <li><strong>Leg thickness</strong> — quad and hamstring growth</li>
        <li><strong>Back width</strong> — lat development</li>
        <li><strong>Overall proportions</strong> — how your body composition shifted</li>
      </ul>

      <h2>Comparison Features</h2>

      <h3>Automatic Alignment</h3>
      <p>
        Atlas uses key point detection to:
      </p>
      <ul>
        <li>Align photos by body position</li>
        <li>Normalize scale differences</li>
        <li>Crop consistently for comparison</li>
      </ul>

      <h3>Time-Span Selection</h3>
      <p>
        Compare any intervals:
      </p>
      <ul>
        <li>Week-over-week (for recent changes)</li>
        <li>Month-over-month (standard progress tracking)</li>
        <li>Beginning to current (total transformation)</li>
        <li>Custom ranges (any two dates)</li>
      </ul>

      <h3>Measurements Overlay</h3>
      <p>
        Atlas can overlay:
      </p>
      <ul>
        <li>Weight at each photo date</li>
        <li>Key measurements (waist, arms, etc.)</li>
        <li>Body fat percentage if tracked</li>
        <li>Training volume and adherence from that period</li>
      </ul>

      <h2>Privacy and Storage</h2>

      <h3>Your Photos Are Private</h3>
      <p>
        Atlas takes privacy seriously:
      </p>
      <ul>
        <li>Photos are encrypted at rest and in transit</li>
        <li>Not shared with coaches unless you explicitly grant access</li>
        <li>Never used for AI training or marketing</li>
        <li>You can delete individual photos or your entire photo history anytime</li>
      </ul>

      <h3>Storage Limits</h3>
      <p>
        Photo storage by plan:
      </p>
      <ul>
        <li><strong>Free:</strong> 3 sets of progress photos</li>
        <li><strong>Paid:</strong> Unlimited photos with full comparison features</li>
      </ul>

      <h2>Integration with Other Data</h2>

      <h3>Photo + Training Correlation</h3>
      <p>
        Atlas connects photos to:
      </p>
      <ul>
        <li>Training phase (were you bulking or cutting?)</li>
        <li>Volume and intensity (how hard were you training?)</li>
        <li>Adherence (did you stick to the plan?)</li>
        <li>Recovery metrics (sleep, stress, energy)</li>
      </ul>

      <h3>Automated Insights</h3>
      <p>
        With enough photos, Atlas can surface:
      </p>
      <ul>
        <li>"Your visible progress accelerates when sleep is 8+ hours"</li>
        <li>"Changes were most noticeable during your highest volume phase"</li>
        <li>"Post-deload photos consistently show better definition"</li>
      </ul>

      <h2>Sharing Progress Photos</h2>

      <h3>With Coaches</h3>
      <p>
        Share specific photo sets:
      </p>
      <ul>
        <li>Select photos to share</li>
        <li>Add context notes for your coach</li>
        <li>Coach sees comparison to previous photos</li>
        <li>Coach can add feedback directly on photos</li>
      </ul>

      <h3>Export Options</h3>
      <p>
        Create shareable content:
      </p>
      <ul>
        <li>Before/after collages with timestamps</li>
        <li>Progress videos from multiple photos</li>
        <li>Privacy-blurred versions (face hidden)</li>
        <li>Measurement overlays on photos</li>
      </ul>

      <h2>Tips for Better Progress Photos</h2>

      <h3>Frequency</h3>
      <p>
        How often to take photos:
      </p>
      <ul>
        <li><strong>Weekly:</strong> Good for short phases or troubleshooting</li>
        <li><strong>Bi-weekly:</strong> Standard recommendation for most users</li>
        <li><strong>Monthly:</strong> Sufficient for slower, sustainable progress</li>
        <li><strong>At phase changes:</strong> Start and end of bulks/cuts</li>
      </ul>

      <h3>Context Matters</h3>
      <p>
        Photos tell more with context:
      </p>
      <ul>
        <li>Always log weight with photos</li>
        <li>Note training phase and goals</li>
        <li>Record any significant lifestyle changes</li>
        <li>Include how you felt (confidence, energy, motivation)</li>
      </ul>

      <h3>Don't Obsess Over Day-to-Day</h3>
      <p>
        Remember:
      </p>
      <ul>
        <li>Lighting can make you look completely different</li>
        <li>Water retention affects daily appearance</li>
        <li>Weekly photos may show noise, not signal</li>
        <li>Monthly comparisons are more meaningful</li>
      </ul>

      <blockquote>
        <strong>Remember:</strong> Progress photos are for you. They're data, not judgment.
        Celebrate the changes you see, and use them as motivation when the scale
        isn't moving. The mirror doesn't lie.
      </blockquote>
    </BlogPostLayout>
  );
}
