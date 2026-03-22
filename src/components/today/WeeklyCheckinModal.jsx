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
    ? ['', 'Energia muito baixa', 'Energia baixa', 'Energia ok', 'Energia boa', 'Energia alta'][energy]
    : null;
  const moodLabel = mood
    ? ['', 'Humor péssimo', 'Humor baixo', 'Humor ok', 'Humor bom', 'Humor excelente'][mood]
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-[18px] font-bold tracking-[-0.03em]">
            {done ? 'Check-in registrado ✓' : 'Check-in semanal'}
          </DialogTitle>
          {!done && (
            <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1 leading-5">
              Como você está hoje? Leva menos de 30 segundos.
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

              <div className="space-y-2 rounded-xl bg-[hsl(var(--shell))] p-4 text-[13px] text-[hsl(var(--fg-2))]">
                {energyLabel && (
                  <div className="flex items-center justify-between">
                    <span>Energia</span>
                    <span className="font-semibold text-[hsl(var(--fg))]">{energy}/5 — {energyLabel}</span>
                  </div>
                )}
                {moodLabel && (
                  <div className="flex items-center justify-between">
                    <span>Humor</span>
                    <span className="font-semibold text-[hsl(var(--fg))]">{mood}/5 — {moodLabel}</span>
                  </div>
                )}
                {sleepHours && (
                  <div className="flex items-center justify-between">
                    <span>Sono</span>
                    <span className="font-semibold text-[hsl(var(--fg))]">{sleepHours}h</span>
                  </div>
                )}
                {notes && (
                  <div className="pt-1 border-t border-[hsl(var(--border-h))]">
                    <span className="text-[hsl(var(--fg-2))]">"{notes}"</span>
                  </div>
                )}
              </div>

              {(energy <= 2 || mood <= 2) && (
                <p className="text-[12px] text-[hsl(var(--warn))] leading-5">
                  Energia ou humor baixos registrados. Considere ajustar o volume de treino hoje.
                </p>
              )}

              <Button onClick={handleClose} className="w-full" size="sm">
                Fechar
              </Button>
            </div>
          ) : (
            // ── Form state ──
            <div className="space-y-5">
              <RatingRow
                label="Energia"
                hint="1 = esgotado · 5 = excelente"
                value={energy}
                onChange={setEnergy}
              />

              <RatingRow
                label="Humor"
                hint="1 = péssimo · 5 = excelente"
                value={mood}
                onChange={setMood}
              />

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Sono (horas)</p>
                  <p className="text-[11px] text-[hsl(var(--fg-3))]">opcional</p>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="7.5"
                  className="w-full h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Nota rápida</p>
                  <p className="text-[11px] text-[hsl(var(--fg-3))]">opcional</p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Como foi o dia, algo diferente..."
                  rows={2}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!canSave || saving}
                  onClick={handleSave}
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : 'Registrar check-in'
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
