import React from 'react';

/**
 * AppBootstrap — branded splash shown while auth state resolves.
 * Premium: logo with subtle ping glow, wordmark, bouncing dot loader.
 */
export default function AppBootstrap() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-[#0A0A0A] text-[#EFE9DA]">
      {/* Logo + ambient glow */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-28 w-28 animate-ping rounded-[28%] bg-[#E8B500]/15"
          style={{ animationDuration: '2.2s' }}
        />
        <img
          src="/branding/v3/app-icon/ink-192.png"
          width={76}
          height={76}
          alt="atlas.core"
          className="relative rounded-[22%] object-cover shadow-[0_0_40px_rgba(232,181,0,0.16)]"
        />
      </div>

      {/* Wordmark */}
      <p
        className="select-none text-[22px] tracking-[-0.05em]"
        style={{ fontFamily: '"Archivo Black", "Arial Black", sans-serif' }}
      >
        <span className="text-[#EFE9DA]">atlas</span>
        <span className="text-[#E8B500]">.core</span>
      </p>

      {/* Dot loader */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#E8B500]/55"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
