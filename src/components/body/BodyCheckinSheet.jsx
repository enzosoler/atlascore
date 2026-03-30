import React, { useState } from 'react';
import { Scale, Ruler, Camera, Moon, Zap, Heart, Loader2, Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MobileSheet from '@/components/shared/MobileSheet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useT } from '@/lib/i18nContext';
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
  const t = useT();
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  // Sub-panel: null | 'sleep' | 'energy' | 'recovery'
  const [subPanel, setSubPanel] = useState(null);
  const [subVal, setSubVal] = useState(null);
  const [savingSub, setSavingSub] = useState(false);

  const handleLogWeight = async () => {
    const val = parseFloat(weight);
    if (!val || isNaN(val)) { toast.error(t('body.checkin.errorEnterWeight')); return; }
    if (val < 20 || val > 300) { toast.error(t('body.checkin.errorWeightRange')); return; }
    if (!user?.id) return;

    setSaving(true);
    try {
      const today = (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();
      const { error } = await supabase.from('measurements').upsert({
        user_id: user.id,
        date: today,
        weight: val,
      }, { onConflict: 'user_id,date' });

      if (error) throw error;
      toast.success(t('body.checkin.weightLogged', { val }));
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todayWeight(user.id) });
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.lastWeight(user.id) });
      queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, user.id] });
      setWeight('');
      onOpenChange(false);
    } catch {
      toast.error(t('body.checkin.errorWeightFailed'));
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
    const today = (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();

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
      const typeLabel = t(`body.checkin.${subPanel}`);
      toast.success(t('body.checkin.subLogged', { type: typeLabel }));
      setSubPanel(null);
      setSubVal(null);
      onOpenChange(false);
    } catch {
      toast.error(t('body.checkin.errorSaveFailed'));
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
      <MobileSheet open={open} onOpenChange={(o) => { if (!o) { closeSubPanel(); onOpenChange(false); } }} title={t('body.checkin.sleep')} description={t('body.checkin.sleepDesc')}>
        <MobileSheet.Body>
          <button onClick={closeSubPanel} className="flex items-center gap-1 text-[12px] text-[hsl(var(--fg-2))] mb-4">
            <ChevronLeft className="w-3.5 h-3.5" /> {t('body.checkin.back')}
          </button>
          <div className="grid grid-cols-4 gap-2">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => setSubVal(h)}
                className={`h-11 rounded-[12px] text-[14px] font-semibold transition-all ${
                  subVal === h
                    ? 'bg-[hsl(var(--brand))] text-white'
                    : 'bg-[hsl(var(--fill)/0.6)] border border-[hsl(var(--border)/0.7)] text-[hsl(var(--fg-2))]'
                }`}
              >
                {`${h}h`}
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
            {savingSub ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (subVal !== null ? t('body.checkin.logSleepVal', { val: subVal }) : t('body.checkin.logSleepFallback'))}
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
          { val: 1, label: '1', desc: t('body.checkin.scale.drained') },
          { val: 2, label: '2', desc: t('body.checkin.scale.low') },
          { val: 3, label: '3', desc: t('body.checkin.scale.moderate') },
          { val: 4, label: '4', desc: t('body.checkin.scale.good') },
          { val: 5, label: '5', desc: t('body.checkin.scale.peak') },
        ]
      : [
          { val: 1, label: '1', desc: t('body.checkin.scale.wrecked') },
          { val: 2, label: '2', desc: t('body.checkin.scale.sore') },
          { val: 3, label: '3', desc: t('body.checkin.scale.okay') },
          { val: 4, label: '4', desc: t('body.checkin.scale.good') },
          { val: 5, label: '5', desc: t('body.checkin.scale.fresh') },
        ];

    return (
      <MobileSheet
        open={open}
        onOpenChange={(o) => { if (!o) { closeSubPanel(); onOpenChange(false); } }}
        title={isEnergy ? t('body.checkin.energy') : t('body.checkin.recovery')}
        description={isEnergy ? t('body.checkin.energyDesc') : t('body.checkin.recoveryDesc')}
      >
        <MobileSheet.Body>
          <button onClick={closeSubPanel} className="flex items-center gap-1 text-[12px] text-[hsl(var(--fg-2))] mb-4">
            <ChevronLeft className="w-3.5 h-3.5" /> {t('body.checkin.back')}
          </button>
          <div className="flex gap-2">
            {options.map((o) => (
              <button
                key={o.val}
                onClick={() => setSubVal(o.val)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[12px] border transition-all ${
                  subVal === o.val
                    ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                    : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))]'
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
            {savingSub ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isEnergy ? t('body.checkin.logEnergy') : t('body.checkin.logRecovery'))}
          </button>
        </MobileSheet.Footer>
      </MobileSheet>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────────
  return (
    <MobileSheet open={open} onOpenChange={onOpenChange} title={t('body.checkin.title')} description={t('body.checkin.description')}>
      <MobileSheet.Body>
        <div className="space-y-4">

          {/* Quick weight log */}
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-[hsl(var(--brand))]" strokeWidth={2} />
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{t('body.checkin.logWeight')}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={t('body.checkin.weightPlaceholder')}
                className="flex-1 h-11 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-3 text-[15px] font-semibold text-[hsl(var(--fg))] outline-none focus:border-[hsl(var(--brand)/0.5)]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogWeight(); }}
              />
              <span className="flex items-center text-[13px] text-[hsl(var(--fg-3))] pr-1">{t('body.checkin.unit')}</span>
              <button
                onClick={handleLogWeight}
                disabled={saving || !weight}
                className="h-11 px-4 rounded-[12px] bg-[hsl(var(--brand))] text-white text-[13px] font-semibold disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                {t('body.checkin.log')}
              </button>
            </div>
          </div>

          {/* Action list */}
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] divide-y divide-[hsl(var(--border)/0.4)]">
            {[
              { icon: Ruler,  label: t('body.checkin.menu.measurementsLabel'), sub: t('body.checkin.menu.measurementsSub'),  action: () => goTo(ROUTES.measurements) },
              { icon: Camera, label: t('body.checkin.menu.photoLabel'),         sub: t('body.checkin.menu.photoSub'),          action: () => goTo(ROUTES.progressPhotos) },
              { icon: Moon,   label: t('body.checkin.menu.sleepLabel'),         sub: t('body.checkin.menu.sleepSub'),          action: () => { setSubVal(null); setSubPanel('sleep'); } },
              { icon: Zap,    label: t('body.checkin.menu.energyLabel'),        sub: t('body.checkin.menu.energySub'),         action: () => { setSubVal(null); setSubPanel('energy'); } },
              { icon: Heart,  label: t('body.checkin.menu.recoveryLabel'),      sub: t('body.checkin.menu.recoverySub'),       action: () => { setSubVal(null); setSubPanel('recovery'); } },
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
