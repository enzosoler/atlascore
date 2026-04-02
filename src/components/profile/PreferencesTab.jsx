import React, { useState } from 'react';
import { Moon, Sun, Globe, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { locales, localeLabels } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { SelectField } from './ProfileFormField';
import { saveLocalProfile } from '@/lib/profileUtils';
import { toast } from 'sonner';


function ThemeOption({ icon: Icon, label, description, value, currentTheme, onSelect }) {
  const active = currentTheme === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'flex min-h-[104px] flex-1 flex-col items-start justify-center gap-1.5 rounded-[22px] border px-5 py-5 text-left transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
      <span className="text-[14px] font-semibold tracking-[-0.016em]">{label}</span>
      {description && <span className="text-[12px] leading-4 opacity-80">{description}</span>}
    </button>
  );
}

function LanguageOption({ label, value, currentLocale, onSelect }) {
  const active = currentLocale === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'flex flex-1 items-center justify-center gap-2 rounded-[22px] border px-4 py-4 text-center transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <span className="text-[14px] font-semibold tracking-[-0.016em]">{label}</span>
    </button>
  );
}

const TIMEZONE_OPTIONS = (() => {
  const zones = Intl.supportedValuesOf?.('timeZone') || ['America/New_York', 'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const common = [userTz, 'America/New_York', 'America/Sao_Paulo', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'].filter(Boolean);
  const unique = [...new Set(common)];
  return unique.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }));
})();

const UNITS_OPTIONS = [
  { value: 'metric', label: 'Metric (kg, cm)' },
  { value: 'imperial', label: 'Imperial (lbs, in)' },
];

export default function PreferencesTab({ profileData, profileQueryKey }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const [saved, setSaved] = useState(false);

  const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [units, setUnits] = useState(profileData?.units_system || 'metric');
  const [timezone, setTimezone] = useState(profileData?.timezone || detectedTz);

  const saveProfile = useMutation({
    mutationFn: (payload) => saveLocalProfile(user, profileData?.id, payload),
    onSuccess: (result) => {
      qc.setQueryData(profileQueryKey, result);
      setSaved(true);
      toast.success('Preferences saved');
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    saveProfile.mutate({ ...profileData, units_system: units, timezone });
  };

  return (
    <div className="space-y-5">
      {/* Appearance */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Appearance
        </h3>
        <div className="flex gap-3">
          <ThemeOption icon={Moon} label="Dark" description="Recommended" value="dark" currentTheme={theme} onSelect={setTheme} />
          <ThemeOption icon={Sun} label="Light" description="Alternative" value="light" currentTheme={theme} onSelect={setTheme} />
        </div>
      </section>

      {/* Language */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Language
        </h3>
        <div className="flex gap-3">
          {locales.map((loc) => (
            <LanguageOption key={loc} label={localeLabels[loc]} value={loc} currentLocale={locale} onSelect={setLocale} />
          ))}
        </div>
      </section>

      {/* Units & timezone */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Units & timezone
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Units" value={units} onChange={setUnits} options={UNITS_OPTIONS} />
          <SelectField label="Timezone" value={timezone} onChange={setTimezone} options={TIMEZONE_OPTIONS} />
        </div>
      </section>

      {/* Connections */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          Connections
        </h3>
        <AppleHealthCard />
      </section>

      <Button onClick={handleSave} disabled={saveProfile.isPending || saved} className="w-full gap-2">
        {saved ? 'Saved ✓' : saveProfile.isPending ? 'Saving...' : (
          <><Save className="h-4 w-4" /> Save preferences</>
        )}
      </Button>
    </div>
  );
}

// Inline Apple Health card (from ConnectedServices.jsx)
function AppleHealthCard() {
  let available = false;
  let connected = false;
  let isIOS = false;

  try {
    // Check if Capacitor HealthKit is available
    isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  } catch { /* ignore */ }

  if (!isIOS) {
    return (
      <div className="rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
            <span className="text-white text-[16px]">♥</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Apple Health</p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">Available on iOS only</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
          <span className="text-white text-[16px]">♥</span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Apple Health</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))]">Manage in Connected Services</p>
        </div>
      </div>
    </div>
  );
}
