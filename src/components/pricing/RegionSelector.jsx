import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { setRegionPricing, detectRegion } from '@/lib/regionalPricing';

/**
 * RegionSelector — permite usuário escolher Brasil ou US para preços
 */
export default function RegionSelector({ onRegionChange }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initRegion() {
      // Auto-detect region based on browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const region = browserLang.toLowerCase().startsWith('pt') ? 'BR' : 'US';
      setRegionPricing(region);
      onRegionChange?.(region);
      setLoading(false);
    }
    initRegion();
  }, [onRegionChange]);

  if (loading) return null;

  // No UI shown - currency is auto-detected
  return null;
}
