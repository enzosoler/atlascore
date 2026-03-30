import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { getToday } from '@/lib/atlas-theme';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/lib/i18nContext';

export default function QuickCheckin({ existingCheckin }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [vals, setVals] = useState({
    mood: existingCheckin?.mood || 3,
    energy: existingCheckin?.energy || 3,
    sleep_hours: existingCheckin?.sleep_hours || 7,
    hydration_liters: existingCheckin?.hydration_liters || 0,
  });
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const moodLabels = [
    '',
    t('today.quickCheckin.moodTerrible'),
    t('today.quickCheckin.moodPoor'),
    t('today.quickCheckin.moodNeutral'),
    t('today.quickCheckin.moodGood'),
    t('today.quickCheckin.moodExcellent'),
  ];

  const rows = [
    { key: 'mood', label: t('today.quickCheckin.mood'), min: 1, max: 5, step: 1, format: v => moodLabels[v] },
    { key: 'energy', label: t('today.quickCheckin.energy'), min: 1, max: 5, step: 1, format: v => `${v}/5` },
    { key: 'sleep_hours', label: t('today.quickCheckin.sleep'), min: 3, max: 12, step: 0.5, format: v => `${v}h` },
    { key: 'hydration_liters', label: t('today.quickCheckin.water'), min: 0, max: 5, step: 0.25, format: v => `${v.toFixed(1)}L` },
  ];

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
      toast.success(t('today.quickCheckin.saved'));
    } catch (err) {
      toast.error(t('today.quickCheckin.error'));
      console.error('[QuickCheckin] save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="atlas-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <p className="atlas-overline">{t('today.quickCheckin.label')}</p>
        <Button onClick={handleSave} disabled={saving} size="sm"
          className="h-7 px-3 rounded-lg text-[12px] font-medium bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.85)] text-white">
          {saving ? t('today.quickCheckin.saving') : t('today.quickCheckin.save')}
        </Button>
      </div>
      {rows.map(row => (
        <div key={row.key} className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[hsl(var(--fg-2))]">{row.label}</span>
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
