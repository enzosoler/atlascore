/**
 * v3 brand marks — heart + chevron + wordmark lockups.
 * Translated from the Claude Design canvas (atlas-core/heart-mark.jsx).
 *
 * The heart is the primary mark: a classical two-lobe silhouette on a
 * 96-unit grid, overlaid with an amber ECG trace that actually "reads"
 * as a vital sign. Swap the ECG flavor via PaperThemeProvider's `ecg`
 * field ('classic' | 'sharp' | 'flat').
 *
 * The chevron is the secondary mark: a double-chevron that reads as
 * "progress / level up / PR" and hides the A of ATLAS in its upper
 * triangle. The hybrid ChevronHeartMark combines both.
 */

import React from 'react';
import { useACTheme, ACFonts } from './paper.jsx';

export const ECG_PATHS = {
  classic: 'M10 50 L30 50 L36 50 L42 42 L48 60 L54 32 L60 58 L66 50 L86 50',
  sharp:   'M10 50 L32 50 L38 50 L44 28 L52 72 L58 28 L64 50 L86 50',
  flat:    'M10 50 L86 50',
};

/** Primary mark — heart silhouette + amber ECG trace. */
export function HeartMark({ size = 96, color, accent, strokeW = 3.2 }) {
  const t = useACTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  const path = ECG_PATHS[t.ecg] || ECG_PATHS.classic;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      <path
        d="M48 82
           C 34 72, 10 58, 10 36
           C 10 22, 22 12, 32 12
           C 40 12, 44 18, 48 24
           C 52 18, 56 12, 64 12
           C 74 12, 86 22, 86 36
           C 86 58, 62 72, 48 82 Z"
        fill={ink}
      />
      <path
        d={path}
        fill="none"
        stroke={acc}
        strokeWidth={strokeW}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Secondary mark — ascending double-chevron. Upper=ink, lower=amber. */
export function ChevronMark({ size = 96, color, accent }) {
  const t = useACTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      <path d="M14 56 L48 18 L82 56 L70 56 L48 33 L26 56 Z" fill={ink} />
      <path d="M14 82 L48 44 L82 82 L70 82 L48 59 L26 82 Z" fill={acc} />
    </svg>
  );
}

/** Hybrid — heart silhouette built with chevron-peaked lobes. */
export function ChevronHeartMark({ size = 96, color, accent, strokeW = 3.2 }) {
  const t = useACTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  const path = ECG_PATHS[t.ecg] || ECG_PATHS.classic;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      <path
        d="M48 84
           L 10 46
           L 10 28
           L 28 10
           L 48 30
           L 68 10
           L 86 28
           L 86 46
           Z"
        fill={ink}
      />
      <path
        d={path}
        fill="none"
        stroke={acc}
        strokeWidth={strokeW}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Wordmark — Archivo Black "atlas" + amber square bullet + "core".
 * The bullet echoes the ECG spike and chevron beat. The only place
 * in the app where Archivo Black is appropriate.
 */
export function Wordmark({ size = 48, color, accent, dot = 'dot' }) {
  const t = useACTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  return (
    <div
      style={{
        fontFamily: ACFonts.brand,
        fontSize: size,
        letterSpacing: -size * 0.055,
        lineHeight: 1,
        color: ink,
        textTransform: 'lowercase',
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      <span>atlas</span>
      <span
        style={{
          display: 'inline-block',
          width: size * 0.16,
          height: size * 0.16,
          background: acc,
          margin: `0 ${size * 0.04}px ${size * 0.06}px`,
          borderRadius: dot === 'round' ? '50%' : 0,
          alignSelf: 'flex-end',
        }}
      />
      <span>core</span>
    </div>
  );
}

/** Horizontal lockup — mark + wordmark side-by-side. */
export function LockupH({ Mark = HeartMark, size = 64, gap = 18, wsize = 36, color, accent }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Mark size={size} color={color} accent={accent} />
      <Wordmark size={wsize} color={color} accent={accent} />
    </div>
  );
}

/** Stacked lockup — mark above wordmark. */
export function LockupV({ Mark = HeartMark, size = 80, gap = 14, wsize = 32, color, accent }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap,
      }}
    >
      <Mark size={size} color={color} accent={accent} />
      <Wordmark size={wsize} color={color} accent={accent} />
    </div>
  );
}

/** Tagline lockup — mark + wordmark + "BODY · OPERATING · SYSTEM" caption. */
export function LockupTag({ Mark = HeartMark, color, accent }) {
  const t = useACTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20 }}>
      <Mark size={80} color={ink} accent={acc} />
      <div>
        <Wordmark size={42} color={ink} accent={acc} />
        <div
          style={{
            fontFamily: ACFonts.mono,
            fontSize: 10,
            letterSpacing: 3,
            color: ink,
            opacity: 0.6,
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: acc }}>●</span>
          BODY · OPERATING · SYSTEM
        </div>
      </div>
    </div>
  );
}
