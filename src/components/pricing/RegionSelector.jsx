import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { setRegionPricing, detectRegion } from '@/lib/regionalPricing';

/**
 * RegionSelector — permite usuário escolher Brasil ou US para preços
 */
export default function RegionSelector({ onRegionChange }) {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initRegion() {
      const detected = await detectRegion();
      setRegion(detected);
      onRegionChange?.(detected);
      setLoading(false);
    }
    initRegion();
  }, [onRegionChange]);

  const handleChange = (newRegion) => {
    setRegion(newRegion);
    setRegionPricing(newRegion);
    onRegionChange?.(newRegion);
  };

  if (loading) return null;

  return (
    <div className="atlas-public-panel-muted flex items-center gap-2 px-3 py-2.5">
      <Globe className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={1.9} />
      <select
        value={region}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full cursor-pointer bg-transparent text-base font-medium text-[hsl(var(--fg))] outline-none"
      >
        <option value="BR">Brasil (R$)</option>
        <option value="US">USA ($)</option>
      </select>
    </div>
  );
}
