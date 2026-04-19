/**
 * iOS device bezel for the v3 gallery. Shows a single screen inside an
 * iPhone-style frame with rounded corners, notch, and home indicator.
 * Keeps the preview environment visually consistent with the Claude Design
 * canvas the screens were originally drawn in.
 */

import React from 'react';

export default function IOSFrame({
  width = 360,
  height = 780,
  dark = false,
  children,
}) {
  const frameBg = dark ? '#0a0a0a' : '#efe9da';
  const bezelC  = dark ? '#1a1a1a' : '#d6cfbc';
  return (
    <div
      style={{
        width: width + 16,
        height: height + 16,
        padding: 8,
        background: bezelC,
        borderRadius: 54,
        boxShadow: dark
          ? '0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 24px 60px rgba(40,30,20,0.20), inset 0 0 0 1px rgba(10,10,10,0.06)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width,
          height,
          background: frameBg,
          borderRadius: 46,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* notch */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 112,
            height: 28,
            background: '#000',
            borderRadius: 999,
            zIndex: 5,
          }}
        />
        {/* home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 4,
            background: dark ? 'rgba(239,233,218,0.45)' : 'rgba(10,10,10,0.38)',
            borderRadius: 999,
            zIndex: 5,
          }}
        />
        {/* screen content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
