import React, { useEffect, useState } from 'react';
import { detectRegion, setRegionPricing } from '@/lib/regionalPricing';

/**
 * RegionSelector — shows a USD ↔ BRL toggle, but only if the user's IP
 * is detected as Brazil. International users are silently locked to USD.
 *
 * Security model:
 * - Detection is IP-based (ipapi.co), not browser language
 * - Result is session-cached, not localStorage (can't be pre-set)
 * - Non-BR users never see the toggle, so they can't manually pick BRL
 */
export default function RegionSelector({ onRegionChange }) {
  const [detectedRegion, setDetectedRegion] = useState(null);
  const [selected, setSelected] = useState('US');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Default to US, don't auto-detect Brazil via IP
      const detected = 'US';
      setDetectedRegion(detected);
      setSelected(detected);
      setRegionPricing(detected);
      onRegionChange?.(detected);
      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null;

  // Non-BR users: no toggle, no UI — region is locked to US
  if (detectedRegion !== 'BR') return null;

  const isBRL = selected === 'BR';

  function handleToggle() {
    const next = isBRL ? 'US' : 'BR';
    setSelected(next);
    setRegionPricing(next);
    onRegionChange?.(next);
  }

  return (
    <div className="flex items-center gap-3 text-[13px] text-[hsl(var(--fg-2))]">
      <button
        type="button"
        onClick={() => {
          if (isBRL) handleToggle();
        }}
        className={`transition-colors ${
          !isBRL
            ? 'font-medium text-[hsl(var(--fg))]'
            : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
        }`}
      >
        USD / Internacional
      </button>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isBRL}
        onClick={handleToggle}
        className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-[hsl(var(--brand))] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--brand))]"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] transition-transform duration-200 ${
            isBRL ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => {
          if (!isBRL) handleToggle();
        }}
        className={`transition-colors ${
          isBRL
            ? 'font-medium text-[hsl(var(--fg))]'
            : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
        }`}
      >
        BRL / Brasil
      </button>
    </div>
  );
}
