import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Moon, Zap, Smile } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { getDailyCheckin, upsertDailyCheckin } from '@/services/checkinService';
import { getToday } from '@/lib/atlas-theme';
import { toast } from 'sonner';

// Gate opens at or after 10:00 local time.
function isPast10am() {
  return new Date().getHours() >= 10;
}

function localDateKey() {
  return getToday();
}

const ROWS = [
  {
    key: 'sleep_hours',
    label: 'Sleep',
    icon: Moon,
    min: 3,
    max: 12,
    step: 0.5,
    format: (v) => `${v}h`,
  },
  {
    key: 'energy',
    label: 'Energy',
    icon: Zap,
    min: 1,
    max: 5,
    step: 1,
    format: (v) => `${v}/5`,
  },
  {
    key: 'mood',
    label: 'Mood',
    icon: Smile,
    min: 1,
    max: 5,
    step: 1,
    format: (v) => ['', 'Terrible', 'Poor', 'Neutral', 'Good', 'Excellent'][v],
  },
];

const DEFAULT_VALS = {
  sleep_hours: 7,
  energy: 3,
  mood: 3,
};

export default function DailyCheckinGate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = localDateKey();

  // Track whether it's past 10am — re-evaluate on visibility changes.
  const [past10, setPast10] = useState(isPast10am);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setPast10(isPast10am());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const { data: existingCheckin, isLoading } = useQuery({
    queryKey: ['daily-checkin', user?.id, today],
    queryFn: () => getDailyCheckin(user.id, today),
    enabled: !!user?.id && past10,
    // Refetch when the window regains focus (e.g. user comes back to the app).
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const [vals, setVals] = useState(DEFAULT_VALS);
  const [saving, setSaving] = useState(false);

  const setValue = useCallback((key, value) => {
    setVals((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      await upsertDailyCheckin(user.id, { date: today, ...vals });
      queryClient.invalidateQueries({ queryKey: ['daily-checkin'] });
      toast.success('Check-in saved!');
    } catch (err) {
      toast.error('Could not save check-in. Try again.');
      console.error('[DailyCheckinGate]', err);
    } finally {
      setSaving(false);
    }
  };

  // Conditions to show: past 10am, user loaded, checkin query settled, no checkin yet.
  const shouldShow = past10 && !!user?.id && !isLoading && !existingCheckin;

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-t-[28px] sm:rounded-[28px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.7)] shadow-[0_24px_64px_rgba(0,0,0,0.28)] overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border)/0.5)]">
          <p className="text-[18px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            Daily check-in
          </p>
          <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
            How are you feeling today? Fill this in to continue.
          </p>
        </div>

        {/* Sliders */}
        <div className="px-6 py-5 space-y-6">
          {ROWS.map(({ key, label, icon: Icon, min, max, step, format }) => (
            <div key={key} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[hsl(var(--fg-2))]">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                  <span>{label}</span>
                </div>
                <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                  {format(vals[key])}
                </span>
              </div>
              <Slider
                value={[vals[key]]}
                onValueChange={([v]) => setValue(key, v)}
                min={min}
                max={max}
                step={step}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-[16px] text-[15px] font-semibold bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.88)] text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Submit check-in'}
          </Button>
        </div>
      </div>
    </div>
  );
}
