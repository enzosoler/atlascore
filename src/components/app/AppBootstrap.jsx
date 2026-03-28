import React from 'react';

/**
 * AppBootstrap — branded splash shown while auth state resolves.
 * Premium: logo with subtle ping glow, wordmark, bouncing dot loader.
 */
export default function AppBootstrap() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-[hsl(var(--bg))]">
      {/* Logo + ambient glow */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-28 w-28 animate-ping rounded-[28%] bg-[hsl(var(--brand)/0.12)]"
          style={{ animationDuration: '2.2s' }}
        />
        <img
          src="/branding/dark/icon-192.png"
          width={76}
          height={76}
          alt="atlas.core"
          className="relative rounded-[22%] object-cover shadow-[0_0_40px_hsl(var(--brand)/0.18)]"
        />
      </div>

      {/* Wordmark */}
      <p className="text-[22px] font-semibold tracking-[-0.05em] select-none">
        <span className="text-[hsl(var(--brand))]">atlas</span>
        <span className="font-medium text-[hsl(var(--fg)/0.75)]">.core</span>
      </p>

      {/* Dot loader */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand)/0.45)] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
