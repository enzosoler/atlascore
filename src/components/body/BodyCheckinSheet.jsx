import React, { useState } from 'react';
import { Scale, Ruler, Camera, Moon, Zap, Heart, Loader2, Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MobileSheet from '@/components/shared/MobileSheet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { AI_COACH_KEY } from '@/hooks/useAICoach';
import { DAILY_QUERY_KEYS } from '@/hooks/useDailyState';
import { ROUTES } from '@/lib/routes';

/**
 * BodyCheckinSheet — MobileSheet for quick body-state logging.
 *
 * Main menu: Weight (inline), Measurements, Photos, Sleep, Energy, Recovery.
 * Sleep/Energy/Recovery open inline sub-panels saved to daily_checkins table.
 */
export default function BodyCheckinSheet({ open, onOpenChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  // Sub-panel: null | 'sleep' | 'energy' | 'recovery'
  const [subPanel, setSubPanel] = useState(null);
  const [subVal, setSubVal] = useState(null);
  const [savingSub, setSavingSub] = useState(false);

  const handleLogWeight = async () => {
    const val = parseFloat(weight);
    if (!val || isNaN(val)) { toast.error('Enter a weight value first'); return; }
    if (val < 20 || val > 300) { toast.error('Weight must be between 20 and 300 kg'); return; }
    if (!user?.id) return;

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('measurements').upsert({
        user_id: user.id,
        date: today,
        weight: val,
      }, { onConflict: 'user_id,date' });

      if (error) throw error;
      toast.success(`Weight logged: ${val} kg`);
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todayWeight(user.id) });
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.lastWeight(user.id) });
      queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, user.id] });
      setWeight('');
      onOpenChange(false);
    } catch {
      toast.error('Failed to log weight');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubPanel = async () => {
    if (subVal === null || !user?.id) return;
    setSavingSub(true);

    const fieldMap = {
      sleep: 'sleep_hours',
      energy: 'energy',
      recovery: 'mood',
    };
    const field = fieldMap[subPanel];
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: existing } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('daily_checkins')
          .update({ [field]: subVal })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_checkins')
          .insert({ user_id: user.id, date: today, [field]: subVal });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['daily-checkin', user.id] });
      const labels = { sleep: 'Sleep', energy: 'Energy', recovery: 'Recovery' };
      toast.success(`${labels[subPanel]} logged`);
      setSubPanel(null);
      setSubVal(null);
      onOpenChange(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSavingSub(false);
    }
  };

  const goTo = (path) => {
    onOpenChange(false);
    setTimeout(() => navigate(path), 200);
  };

  const closeSubPanel = () => {
    setSubPanel(null);
    setSubVal(null);
  };

  // ── Sub-panel: Sleep ─────────────────────────────────────────────────────────
  if (subPanel === 'sleep') {
    const hours = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];
    return (
      <MobileSheet open={open} onOpenChange={(o) => { if (!o) { closeSubPanel(); onOpenChange(false); } }} title="Sleep" description="How many hours did you sleep?">
        <MobileSheet.Body>
          <button onClick={closeSubPanel} className="flex items-center gap-1 text-[12px] text-[hsl(var(--fg-2))] mb-4">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="grid grid-cols-4 gap-2">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => setSubVal(h)}
                className={`h-11 rounded-[12px] text-[14px] font-semibold transition-all ${
                  subVal === h
                    ? 'bg-[hsl(var(--brand))] text-white'
                    : 'bg-[hsl(var(--fill)/0.6)] border border-[hsl(var(--border)/0.6)] text-[hsl(var(--fg-2))]'
                }`}
              >
                {h % 1 === 0 ? `${h}h` : `${h}h`}
              </button>
            ))}
          </div>
        </MobileSheet.Body>
        <MobileSheet.Footer>
          <button
            onClick={handleSaveSubPanel}
            disabled={subVal === null || savingSub}
            className="atlas-button atlas-button-primary w-full disabled:opacity-50"
          >
            {savingSub ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Log ${subVal !== null ? subVal + 'h' : 'sleep'}`}
          </button>
        </MobileSheet.Footer>
      </MobileSheet>
    );
  }

  // ── Sub-panel: Energy / Recovery ─────────────────────────────────────────────
  if (subPanel === 'energy' || subPanel === 'recovery') {
    const isEnergy = subPanel === 'energy';
    const options = isEnergy
      ? [
          { val: 1, label: '1', desc: 'Drained' },
          { val: 2, label: '2', desc: 'Low' },
          { val: 3, label: '3', desc: 'Moderate' },
          { val: 4, label: '4', desc: 'Good' },
          { val: 5, label: '5', desc: 'Peak' },
        ]
      : [
          { val: 1, label: '1', desc: 'Wrecked' },
          { val: 2, label: '2', desc: 'Sore' },
          { val: 3, label: '3', desc: 'Okay' },
          { val: 4, label: '4', desc: 'Good' },
          { val: 5, label: '5', desc: 'Fresh' },
        ];

    return (
      <MobileSheet
        open={open}
        onOpenChange={(o) => { if (!o) { closeSubPanel(); onOpenChange(false); } }}
        title={isEnergy ? 'Energy' : 'Recovery'}
        description={isEnergy ? 'How is your energy today?' : 'How recovered do you feel?'}
      >
        <MobileSheet.Body>
          <button onClick={closeSubPanel} className="flex items-center gap-1 text-[12px] text-[hsl(var(--fg-2))] mb-4">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex gap-2">
            {options.map((o) => (
              <button
                key={o.val}
                onClick={() => setSubVal(o.val)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[12px] border transition-all ${
                  subVal === o.val
                    ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                    : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))]'
                }`}
              >
                <span className="text-[18px] font-bold">{o.label}</span>
                <span className="text-[10px] font-medium">{o.desc}</span>
              </button>
            ))}
          </div>
        </MobileSheet.Body>
        <MobileSheet.Footer>
          <button
            onClick={handleSaveSubPanel}
            disabled={subVal === null || savingSub}
            className="atlas-button atlas-button-primary w-full disabled:opacity-50"
          >
            {savingSub ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Log ${isEnergy ? 'energy' : 'recovery'}`}
          </button>
        </MobileSheet.Footer>
      </MobileSheet>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────────
  return (
    <MobileSheet open={open} onOpenChange={onOpenChange} title="Body Check-in" description="Log your body state">
      <MobileSheet.Body>
        <div className="space-y-4">

          {/* Quick weight log */}
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-[hsl(var(--brand))]" strokeWidth={2} />
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Log Weight</p>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 82.5"
                className="flex-1 h-11 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-3 text-[15px] font-semibold text-[hsl(var(--fg))] outline-none focus:border-[hsl(var(--brand)/0.5)]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogWeight(); }}
              />
              <span className="flex items-center text-[13px] text-[hsl(var(--fg-3))] pr-1">kg</span>
              <button
                onClick={handleLogWeight}
                disabled={saving || !weight}
                className="h-11 px-4 rounded-[12px] bg-[hsl(var(--brand))] text-white text-[13px] font-semibold disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                Log
              </button>
            </div>
          </div>

          {/* Action list */}
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] divide-y divide-[hsl(var(--border)/0.4)]">
            {[
              { icon: Ruler,  label: 'Body Measurements', sub: 'Waist, chest, arms, legs',  action: () => goTo(ROUTES.measurements) },
              { icon: Camera, label: 'Progress Photo',     sub: 'Take a checkpoint photo',   action: () => goTo(ROUTES.progressPhotos) },
              { icon: Moon,   label: 'Sleep',              sub: 'Log hours slept',            action: () => { setSubVal(null); setSubPanel('sleep'); } },
              { icon: Zap,    label: 'Energy',             sub: 'Rate your energy today',     action: () => { setSubVal(null); setSubPanel('energy'); } },
              { icon: Heart,  label: 'Recovery',           sub: 'How recovered do you feel',  action: () => { setSubVal(null); setSubPanel('recovery'); } },
            ].map(({ icon: Icon, label, sub, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-[hsl(var(--fill)/0.6)]"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[hsl(var(--fill)/0.8)] flex items-center justify-center text-[hsl(var(--fg-2))]">
                  <Icon className="w-4 h-4" strokeWidth={1.9} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{label}</p>
                  <p className="text-[11px] text-[hsl(var(--fg-3))]">{sub}</p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </MobileSheet.Body>
    </MobileSheet>
  );
}
