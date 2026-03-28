import React, { useState } from 'react';

/**
 * AppBootstrap — branded loading screen shown while auth state resolves.
 * Uses the logo animation video; falls back to the static icon on error.
 */
export default function AppBootstrap() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[hsl(var(--bg))]">
      {videoFailed ? (
        <img
          src="/branding/dark/icon-192.png"
          width={96}
          height={96}
          alt="atlas.core"
          className="rounded-[22%] object-cover"
        />
      ) : (
        <video
          src="/assets/logo-animation.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-40 h-40 object-contain"
          onError={() => setVideoFailed(true)}
        />
      )}
    </div>
  );
}
