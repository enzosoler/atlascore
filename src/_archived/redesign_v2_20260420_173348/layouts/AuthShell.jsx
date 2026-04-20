/**
 * AuthShell — minimal layout for public auth + marketing routes.
 * No top bar, no bottom nav, just safe-area aware canvas with an ambient glow.
 */
import React from 'react';

export default function AuthShell({ children, className }) {
  return (
    <div
      className={className}
      style={{
        minHeight: '100svh',
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(0,255,255,0.08) 0%, transparent 55%), radial-gradient(50% 50% at 80% 90%, rgba(139,92,246,0.06) 0%, transparent 60%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
export { AuthShell };
