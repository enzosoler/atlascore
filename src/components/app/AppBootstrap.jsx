import React from 'react';

/**
 * AppBootstrap — branded loading screen shown while auth state resolves.
 * Uses the logo animation video for a polished first impression.
 */
export default function AppBootstrap() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[hsl(var(--bg))]">
      <video
        src="/assets/logo-animation.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-40 h-40 object-contain"
      />
    </div>
  );
}
