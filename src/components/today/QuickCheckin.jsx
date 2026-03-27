import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { getToday } from '@/lib/atlas-theme';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const rows = [
  { key: 'mood', label: 'Mood', min: 1, max: 5, step: 1, format: v => ['', 'Terrible', 'Poor', 'Neutral', 'Good', 'Excellent'][v] },
  { key: 'energy', label: 'Energy', min: 1, max: 5, step: 1, format: v => `${v}/5` },
  { key: 'sleep_hours', label: 'Sleep', min: 3, max: 12, step: 0.5, format: v => `${v}h` },
  { key: 'hydration_liters', label: 'Water', min: 0, max: 5, step: 0.25, format: v => `${v.toFixed(1)}L` },
];

export default function QuickCheckin({ existingCheckin }) {
  const { user } = useAuth();
  const [vals, setVals] = useState({
    mood: existingCheckin?.mood || 3,
    energy: existingCheckin?.energy || 3,
    sleep_hours: existingCheckin?.sleep_hours || 7,
    hydration_liters: existingCheckin?.hydration_liters || 0,
  });
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        date: getToday(),
        mood: vals.mood,
        energy: vals.energy,
        sleep_hours: vals.sleep_hours,
      };
      if (existingCheckin?.id) {
        const { error } = await supabase
          .from('daily_checkins')
          .update(payload)
          .eq('id', existingCheckin.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_checkins')
          .insert(payload);
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ['daily-checkin'] });
      toast.success('Check-in saved');
    } catch (err) {
      toast.error('Failed to save check-in');
      console.error('[QuickCheckin] save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Check-in</p>
        <Button onClick={handleSave} disabled={saving} size="sm"
          className="h-7 px-3 rounded-lg text-[12px] font-medium bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.85)] text-white">
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      {rows.map(row => (
        <div key={row.key} className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.format(vals[row.key])}</span>
          </div>
          <Slider
            value={[vals[row.key]]}
            onValueChange={([v]) => setVals(p => ({ ...p, [row.key]: v }))}
            min={row.min} max={row.max} step={row.step}
          />
        </div>
      ))}
    </div>
  );
}