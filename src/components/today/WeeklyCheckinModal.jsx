import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Rating row ───────────────────────────────────────────────────────────────

function RatingRow({ label, hint, value, onChange, max = 5 }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{label}</p>
        {hint && <p className="text-[11px] text-[hsl(var(--fg-3))]">{hint}</p>}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              'flex-1 h-10 rounded-xl border text-[13px] font-semibold transition-all',
              value === n
                ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card-hi))]'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function WeeklyCheckinModal({ open, onClose }) {
  const { user } = useAuth();
  const [energy, setEnergy] = useState(null);
  const [mood, setMood] = useState(null);
  const [sleepHours, setSleepHours] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const canSave = energy !== null && mood !== null;

  const reset = () => {
    setEnergy(null);
    setMood(null);
    setSleepHours('');
    setNotes('');
    setSaving(false);
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!canSave || !user?.id) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        user_id: user.id,
        date: today,
        energy,
        mood,
      };
      if (sleepHours !== '') payload.sleep_hours = Number(sleepHours);
      if (notes.trim()) payload.notes = notes.trim();

      await supabase
        .from('daily_checkins')
        .upsert(payload, { onConflict: 'user_id,date' });

      setDone(true);
    } catch (err) {
      console.error('Check-in save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Friendly summary labels
  const energyLabel = energy
    ? ['', 'Very low energy', 'Low energy', 'Energy is okay', 'Good energy', 'High energy'][energy]
    : null;
  const moodLabel = mood
    ? ['', 'Very poor mood', 'Low mood', 'Mood is okay', 'Good mood', 'Excellent mood'][mood]
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-0 shadow-[var(--shadow-lg)]">
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-11 rounded-full bg-[hsl(var(--border))]" />
        </div>
        <DialogHeader className="px-6 pb-0 pt-4">
          <DialogTitle className="text-[18px] font-bold tracking-[-0.03em]">
            {done ? 'Check-in saved ✓' : 'Weekly check-in'}
          </DialogTitle>
          {!done && (
            <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1 leading-5">
              How are you feeling today? It takes less than 30 seconds.
            </p>
          )}
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          {done ? (
            // ── Success state ──
            <div className="space-y-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--ok)/0.1)] mx-auto">
                <Check className="w-7 h-7 text-[hsl(var(--ok))]" strokeWidth={2.5} />
              </div>

              <div className="space-y-2 rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.56)] p-4 text-[13px] text-[hsl(var(--fg-2))]">
                {energyLabel && (
                  <div className="flex items-center justify-between">
                    <span>Energy</span>
                    <span className="font-semibold text-[hsl(var(--fg))]">{energy}/5 — {energyLabel}</span>
                  </div>
                )}
                {moodLabel && (
                  <div className="flex items-center justify-between">
                    <span>Mood</span>
                    <span className="font-semibold text-[hsl(var(--fg))]">{mood}/5 — {moodLabel}</span>
                  </div>
                )}
                {sleepHours && (
                  <div className="flex items-center justify-between">
                    <span>Sleep</span>
                    <span className="font-semibold text-[hsl(var(--fg))]">{sleepHours}h</span>
                  </div>
                )}
                {notes && (
                  <div className="border-t border-[hsl(var(--border-h))] pt-1">
                    <span className="text-[hsl(var(--fg-2))]">"{notes}"</span>
                  </div>
                )}
              </div>

              {(energy <= 2 || mood <= 2) && (
                <p className="text-[12px] text-[hsl(var(--warn))] leading-5">
                  Low energy or mood logged. Consider reducing today's training volume.
                </p>
              )}

              <Button onClick={handleClose} className="w-full" size="sm">
                Close
              </Button>
            </div>
          ) : (
            // ── Form state ──
            <div className="space-y-5">
              <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
                <RatingRow
                  label="Energy"
                  hint="1 = drained · 5 = excellent"
                  value={energy}
                  onChange={setEnergy}
                />
              </div>

              <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
                <RatingRow
                  label="Mood"
                  hint="1 = terrible · 5 = excellent"
                  value={mood}
                  onChange={setMood}
                />
              </div>

              <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Sleep (hours)</p>
                    <p className="text-[11px] text-[hsl(var(--fg-3))]">optional</p>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="7.5"
                    className="atlas-field h-11 w-full px-3 text-[14px]"
                  />
                </div>
              </div>

              <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Quick note</p>
                    <p className="text-[11px] text-[hsl(var(--fg-3))]">optional</p>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did the day go? Anything unusual?"
                    rows={2}
                    className="atlas-field min-h-[88px] w-full resize-none px-3 py-2.5 text-[14px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 flex-1 rounded-[10px]"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-11 flex-1 rounded-[10px]"
                  disabled={!canSave || saving}
                  onClick={handleSave}
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : 'Save check-in'
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
