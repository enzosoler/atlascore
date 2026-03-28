import React, { useState } from 'react';
import { Scale, Ruler, Camera, Moon, Zap, Heart, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MobileSheet from '@/components/shared/MobileSheet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/lib/routes';

/**
 * BodyCheckinSheet — MobileSheet for quick body-state logging.
 *
 * Quick log buttons: Weight, Body Fat, Measurements page, Checkpoint, Sleep, Energy, Recovery.
 * Weight has inline numeric input for rapid logging.
 */
export default function BodyCheckinSheet({ open, onOpenChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogWeight = async () => {
    const val = parseFloat(weight);
    if (!val || val < 20 || val > 300 || !user?.id) return;

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
      queryClient.invalidateQueries({ queryKey: ['progress-measurements'] });
      queryClient.invalidateQueries({ queryKey: ['recent-measurements'] });
      setWeight('');
    } catch {
      toast.error('Failed to log weight');
    } finally {
      setSaving(false);
    }
  };

  const goTo = (path) => {
    onOpenChange(false);
    setTimeout(() => navigate(path), 200);
  };

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
                disabled={!weight || saving}
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
              { icon: Ruler, label: 'Body Measurements', sub: 'Waist, chest, arms, legs', path: ROUTES.measurements },
              { icon: Camera, label: 'Progress Photo', sub: 'Take a checkpoint photo', path: ROUTES.progressPhotos },
              { icon: Moon, label: 'Sleep', sub: 'Log hours and quality', action: 'sleep' },
              { icon: Zap, label: 'Energy', sub: 'Rate your energy today', action: 'energy' },
              { icon: Heart, label: 'Recovery', sub: 'How recovered do you feel', action: 'recovery' },
            ].map(({ icon: Icon, label, sub, path, action }) => (
              <button
                key={label}
                onClick={() => path ? goTo(path) : toast.info(`${label} logging coming soon`)}
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
