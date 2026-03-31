import React from 'react';

export default function AdminFunnelBar({ label, count, conversionPct, dropoffPct, maxCount, isFirst }) {
  const fillPct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="w-[160px] shrink-0 text-[13px] font-medium text-[hsl(var(--fg))]">{label}</span>
      <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-[hsl(var(--fill)/0.5)]">
        <div
          className="absolute inset-y-0 left-0 rounded-md bg-[hsl(var(--brand)/0.6)] transition-all duration-300"
          style={{ width: `${fillPct}%` }}
        />
        <span className="absolute inset-0 flex items-center px-3 text-[12px] font-semibold text-[hsl(var(--fg))]">
          {count.toLocaleString()}
        </span>
      </div>
      <div className="flex w-[140px] shrink-0 items-center gap-2 text-[12px]">
        {isFirst ? (
          <span className="text-[hsl(var(--fg-3))]">—</span>
        ) : (
          <>
            <span className="font-semibold text-[hsl(var(--ok))]">{conversionPct}%</span>
            <span className="text-[hsl(var(--fg-3))]">conv</span>
            <span className="font-medium text-[hsl(var(--err))]">-{dropoffPct}%</span>
          </>
        )}
      </div>
    </div>
  );
}
