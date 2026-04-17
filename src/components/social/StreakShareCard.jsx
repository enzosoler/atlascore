/**
 * StreakShareCard -- 1080x1920 (9:16) shareable milestone card.
 *
 * Renders at a fixed pixel size; callers scale it down for preview.
 * Uses CSS custom-property tokens so the card looks correct
 * regardless of whether the page theme is light or dark.
 */
import React from 'react';

// ── Milestone copy ───────────────────────────────────────────────────────────

export const MILESTONE_MESSAGES = {
  7:   'One week down. Momentum building.',
  14:  'Two weeks consistent. This is becoming a habit.',
  30:  '30 days. You showed up when it mattered.',
  60:  '60 days of discipline. Most people quit by now.',
  100: '100 days. This is who you are now.',
  365: 'One year. Respect.',
};

export const SHARE_MILESTONES = [7, 14, 30, 60, 100, 365];

function closestMilestoneMessage(streak) {
  if (MILESTONE_MESSAGES[streak]) return MILESTONE_MESSAGES[streak];
  // Fallback for non-exact milestones (safety)
  const sorted = SHARE_MILESTONES.filter(m => m <= streak).sort((a, b) => b - a);
  return MILESTONE_MESSAGES[sorted[0]] || 'Consistency is the real flex.';
}

// ── Card ─────────────────────────────────────────────────────────────────────

export default function StreakShareCard({
  streak = 7,
  workouts = 0,
  meals = 0,
  weightEntries = 0,
}) {
  const message = closestMilestoneMessage(streak);

  // Build stat fragments — only show stats that are > 0
  const stats = [];
  if (workouts > 0)      stats.push(`${workouts} workouts`);
  if (meals > 0)          stats.push(`${meals} meals logged`);
  if (weightEntries > 0)  stats.push(`${weightEntries} kg tracked`);

  return (
    <div
      className="streak-share-card"
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        // Force dark card regardless of page theme
        background: '#09090b',
        color: '#fafafa',
      }}
    >
      {/* Subtle radial glow behind the number */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          width: 700,
          height: 700,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top logo */}
      <span
        style={{
          position: 'absolute',
          top: 100,
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
        }}
      >
        atlas.core
      </span>

      {/* Main streak block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 200, lineHeight: 1 }}>
          {'\uD83D\uDD25'}{' '}
          <span style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
            {streak}
          </span>
        </span>

        <span
          style={{
            fontSize: 56,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          day streak
        </span>
      </div>

      {/* Motivational line */}
      <p
        style={{
          marginTop: 72,
          fontSize: 38,
          fontWeight: 500,
          lineHeight: 1.45,
          maxWidth: 820,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
          zIndex: 1,
        }}
      >
        {message}
      </p>

      {/* Stats row */}
      {stats.length > 0 && (
        <p
          style={{
            position: 'absolute',
            bottom: 200,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '0.03em',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          {stats.join(' \u00B7 ')}
        </p>
      )}

      {/* Watermark */}
      <span
        style={{
          position: 'absolute',
          bottom: 80,
          right: 80,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'rgba(255,255,255,0.15)',
        }}
      >
        atlas.core
      </span>
    </div>
  );
}
