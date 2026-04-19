/**
 * V3LoadingSplash — system boot screen for atlas.core.
 *
 * Feels like a biological operating system coming online:
 *   - HeartMark pulses once (alive signal)
 *   - ECG heartbeat line draws across as the loading indicator
 *   - Phase label updates in mono (boot → syncing → ready)
 *   - No generic spinner, no progress bar
 *
 * Uses only design tokens from paper.jsx (ACBrand, ACFonts, useACT).
 */

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { ACFonts, ACBrand, useACT } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';

const PHASE_LABELS = {
  boot:    'initializing',
  syncing: 'syncing',
  ready:   'ready',
  error:   'connection issue',
};

function V3LoadingInner({ dark, phase = 'boot' }) {
  const c = useACT(dark);
  const label = PHASE_LABELS[phase] || PHASE_LABELS.boot;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'ready'}
      style={{
        minHeight: '100dvh',
        background: c.bg,
        color: c.fg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'max(24px, env(safe-area-inset-left))',
        paddingRight: 'max(24px, env(safe-area-inset-right))',
        boxSizing: 'border-box',
      }}
    >
      {/* HeartMark with pulse */}
      <div
        style={{
          animation: 'ac-boot-pulse 2.4s ease-in-out infinite',
        }}
      >
        <HeartMark size={48} color={c.fg} accent={c.accent} />
      </div>

      {/* Wordmark */}
      <div
        style={{
          marginTop: 20,
          fontFamily: ACFonts.brand,
          fontSize: 28,
          letterSpacing: -1.4,
          lineHeight: 1,
          textTransform: 'lowercase',
        }}
      >
        atlas<span style={{ color: c.accent }}>.</span>core
      </div>

      {/* ECG heartbeat line — the loading indicator */}
      <div style={{ marginTop: 32, width: 200, height: 32, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="200"
          height="32"
          viewBox="0 0 200 32"
          style={{
            display: 'block',
            animation: 'ac-ecg-draw 2s linear infinite',
          }}
        >
          {/* Flatline → spike → flatline pattern, repeated */}
          <path
            d="M0 16 L40 16 L50 16 L56 4 L64 28 L72 10 L80 16 L120 16 L130 16 L136 4 L144 28 L152 10 L160 16 L200 16"
            fill="none"
            stroke={c.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="260"
            strokeDashoffset="260"
            style={{ animation: 'ac-ecg-trace 2s linear infinite' }}
          />
          {/* Dim baseline */}
          <line x1="0" y1="16" x2="200" y2="16" stroke={c.hair} strokeWidth="1" />
        </svg>
      </div>

      {/* Phase label */}
      <div
        style={{
          marginTop: 16,
          fontFamily: ACFonts.mono,
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: c.dim,
        }}
      >
        {label}
      </div>

      <style>{`
        @keyframes ac-boot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.96); }
        }
        @keyframes ac-ecg-trace {
          0% { stroke-dashoffset: 260; }
          80% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ac-ecg-draw {
          0% { opacity: 1; }
          85% { opacity: 1; }
          95% { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function V3LoadingSplash({ phase = 'boot' }) {
  const { theme } = useTheme();
  return <V3LoadingInner dark={theme === 'dark'} phase={phase} />;
}
