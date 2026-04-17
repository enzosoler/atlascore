import React, { useEffect, useState } from 'react';
import { detectRegion, setRegionPricing } from '@/lib/regionalPricing';
import { Globe } from 'lucide-react';

/**
 * RegionSelector — auto-detects the user's region via IP and displays
 * the detected region with an option to switch manually.
 *
 * Security model:
 * - Detection is IP-based (ipapi.co), not browser language
 * - Result is session-cached in sessionStorage (not localStorage)
 * - Users can manually select a different region if needed
 */

// Regions shown in the dropdown, grouped logically
const REGION_OPTIONS = [
  { code: 'US', label: 'United States (USD)' },
  { code: 'BR', label: 'Brasil (BRL)' },
  { code: 'MX', label: 'México (MXN)' },
  { code: 'AR', label: 'Argentina (ARS)' },
  { code: 'CO', label: 'Colombia (COP)' },
  { code: 'CL', label: 'Chile (CLP)' },
  { code: 'PE', label: 'Perú (PEN)' },
  { code: 'GB', label: 'United Kingdom (GBP)' },
  { code: 'IE', label: 'Ireland (EUR)' },
  { code: 'DE', label: 'Deutschland (EUR)' },
  { code: 'FR', label: 'France (EUR)' },
  { code: 'ES', label: 'España (EUR)' },
  { code: 'IT', label: 'Italia (EUR)' },
  { code: 'PT', label: 'Portugal (EUR)' },
  { code: 'PL', label: 'Polska (PLN)' },
  { code: 'SE', label: 'Sverige (SEK)' },
  { code: 'NO', label: 'Norge (NOK)' },
  { code: 'DK', label: 'Danmark (DKK)' },
  { code: 'CH', label: 'Switzerland (CHF)' },
  { code: 'CA', label: 'Canada (CAD)' },
  { code: 'AU', label: 'Australia (AUD)' },
  { code: 'NZ', label: 'New Zealand (NZD)' },
  { code: 'JP', label: '日本 (JPY)' },
  { code: 'KR', label: '한국 (KRW)' },
  { code: 'IN', label: 'India (INR)' },
  { code: 'TH', label: 'Thailand (THB)' },
  { code: 'PH', label: 'Philippines (PHP)' },
  { code: 'ID', label: 'Indonesia (IDR)' },
  { code: 'TR', label: 'Türkiye (TRY)' },
  { code: 'ZA', label: 'South Africa (ZAR)' },
  { code: 'NG', label: 'Nigeria (NGN)' },
];

export default function RegionSelector({ onRegionChange }) {
  const [selected, setSelected] = useState('US');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const detected = await detectRegion();
      setSelected(detected);
      setRegionPricing(detected);
      onRegionChange?.(detected);
      setLoading(false);
    }
    init();
  }, []);  

  if (loading) return null;

  function handleChange(e) {
    const next = e.target.value;
    setSelected(next);
    setRegionPricing(next);
    onRegionChange?.(next);
  }

  return (
    <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
      <Globe className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
      <select
        value={selected}
        onChange={handleChange}
        className="appearance-none rounded-md border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-2.5 py-1.5 pr-7 text-[13px] text-[hsl(var(--fg))] transition-colors hover:border-[hsl(var(--border))] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand)/0.3)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
        }}
      >
        {REGION_OPTIONS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
