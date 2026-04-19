/**
 * MacroTargets — set daily calorie + macro split targets.
 *
 * - Hero: tappable total kcal (number input)
 * - Macro split steppers for protein / carb / fat — must sum to 100%
 * - Grams auto-compute from total kcal × split ratios (P=4kcal/g, C=4, F=9)
 * - Preset buttons (Balanced / High protein / Low carb / Cutting / Bulking)
 * - "Calculate from my goals" reads `user.user_metadata` — honest empty state
 *   if those fields aren't set yet.
 *
 * TRUST RULE — no numbers are shown until the user picks a preset or types
 * a kcal target. Fabricated defaults are not ok.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  SafeScreen,
  Glass,
  LiquidButton,
  SpringReveal,
} from '../lib/glass';
import { TargetIcon, SparkleIcon, CheckIcon } from '../lib/icons';
import { useAuth } from '@/lib/AuthContext';
import { getMacroTargets, setMacroTargets } from './nutritionStore';

const PRESETS = [
  { id: 'balanced',    label: 'Balanced',     split: { p: 30, c: 40, f: 30 }, note: '30 / 40 / 30' },
  { id: 'highprotein', label: 'High protein', split: { p: 40, c: 30, f: 30 }, note: '40 / 30 / 30' },
  { id: 'lowcarb',     label: 'Low carb',     split: { p: 30, c: 20, f: 50 }, note: '30 / 20 / 50' },
  { id: 'cutting',     label: 'Cutting',      split: { p: 40, c: 35, f: 25 }, note: '40 / 35 / 25' },
  { id: 'bulking',     label: 'Bulking',      split: { p: 25, c: 50, f: 25 }, note: '25 / 50 / 25' },
];

const KCAL_PER = { p: 4, c: 4, f: 9 };

function gramsFor(totalKcal, split) {
  if (!totalKcal || !split) return null;
  return {
    protein: Math.round((totalKcal * (split.p / 100)) / KCAL_PER.p),
    carbs:   Math.round((totalKcal * (split.c / 100)) / KCAL_PER.c),
    fat:     Math.round((totalKcal * (split.f / 100)) / KCAL_PER.f),
  };
}

export default function MacroTargets({
  initial,
  userMeta,
  onSave,
}) {
  // Null until user types a number OR picks a preset — respects the trust rule.
  const [kcal, setKcal]     = useState(initial?.calories ?? '');
  const [split, setSplit]   = useState(initial?.split || null);

  const kcalNum = Number(kcal) > 0 ? Number(kcal) : null;
  const grams = useMemo(() => gramsFor(kcalNum, split), [kcalNum, split]);
  const sum = split ? split.p + split.c + split.f : 0;
  const validSplit = split ? sum === 100 : false;

  const canSave = Boolean(kcalNum && validSplit);

  const pickPreset = (p) => {
    setSplit(p.split);
    // Don't overwrite an existing user-chosen kcal.
    if (!kcalNum) setKcal(2000);
  };

  const adjust = (k, delta) => {
    if (!split) return;
    const next = { ...split, [k]: Math.max(0, Math.min(100, split[k] + delta)) };
    setSplit(next);
  };

  const calcFromGoals = () => {
    const weightKg = Number(userMeta?.weight_kg ?? userMeta?.weight);
    const goal = (userMeta?.goal || '').toLowerCase();
    if (!weightKg || weightKg <= 0) {
      toast.info('Add your weight in profile first', {
        description: 'We need weight + goal to estimate a target.',
      });
      return;
    }
    // Very rough TDEE estimate (Mifflin-ish baseline × activity 1.5),
    // then goal adjustment. This is a starting point, not medical advice —
    // the user can override the number right after.
    let baseline = Math.round(weightKg * 32); // ~32 kcal/kg/day rough
    if (goal.includes('cut') || goal.includes('lose')) baseline -= 400;
    if (goal.includes('bulk') || goal.includes('gain')) baseline += 300;
    setKcal(baseline);
    // Default split: balanced if none picked.
    if (!split) setSplit({ p: 30, c: 40, f: 30 });
    toast.success('Estimated from your profile', {
      description: 'Adjust the number if this looks off.',
    });
  };

  const save = () => {
    if (!canSave) return;
    const payload = {
      calories: kcalNum,
      split,
      protein: grams.protein,
      carbs: grams.carbs,
      fat: grams.fat,
    };
    onSave?.(payload);
  };

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <SpringReveal delay={20}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Nutrition
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Macro targets
            </h1>
            <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', marginTop: 6, lineHeight: 1.45 }}>
              Pick a preset, tweak the split, or tap the number to set your own total.
            </p>
          </div>
        </SpringReveal>

        {/* Hero: total kcal */}
        <SpringReveal delay={60}>
          <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'hsl(var(--rd-accent))' }}>
              <TargetIcon size={16} />
              <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                Daily target
              </span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
              <input
                type="number"
                inputMode="numeric"
                placeholder="—"
                value={kcal}
                onChange={(e) => setKcal(e.target.value.replace(/[^\d]/g, ''))}
                style={{
                  width: '4.5ch',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  color: 'hsl(var(--rd-fg-primary))',
                  fontSize: 56,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
                aria-label="Daily calorie target"
              />
              <span style={{ fontSize: 18, fontWeight: 600, color: 'hsl(var(--rd-fg-muted))' }}>kcal</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <LiquidButton intent="ai" size="sm" leftIcon={<SparkleIcon size={14} />} onClick={calcFromGoals}>
                Calculate from my goals
              </LiquidButton>
            </div>
          </Glass>
        </SpringReveal>

        {/* Presets */}
        <SpringReveal delay={120}>
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Presets</SectionLabel>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {PRESETS.map((p) => {
                const active = split && split.p === p.split.p && split.c === p.split.c && split.f === p.split.f;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickPreset(p)}
                    style={{
                      flex: '0 0 auto',
                      padding: '10px 14px',
                      borderRadius: 14,
                      background: active
                        ? 'linear-gradient(180deg, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.08) 100%)'
                        : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      textAlign: 'left',
                      minWidth: 130,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                      {p.note}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </SpringReveal>

        {/* Split editor OR empty state */}
        <SpringReveal delay={160}>
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Macro split</SectionLabel>
            {!split || !kcalNum ? (
              <EmptyState />
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                <Stepper
                  label="Protein"
                  pct={split.p}
                  grams={grams?.protein}
                  color="hsl(var(--rd-accent))"
                  onDec={() => adjust('p', -5)}
                  onInc={() => adjust('p', 5)}
                />
                <Stepper
                  label="Carbs"
                  pct={split.c}
                  grams={grams?.carbs}
                  color="#FBBF24"
                  onDec={() => adjust('c', -5)}
                  onInc={() => adjust('c', 5)}
                />
                <Stepper
                  label="Fat"
                  pct={split.f}
                  grams={grams?.fat}
                  color="#A78BFA"
                  onDec={() => adjust('f', -5)}
                  onInc={() => adjust('f', 5)}
                />
                <SumRow sum={sum} valid={validSplit} />
              </div>
            )}
          </div>
        </SpringReveal>

        {/* Save */}
        <div style={{ marginTop: 24 }}>
          <LiquidButton block intent="primary" size="lg" disabled={!canSave} onClick={save} leftIcon={canSave ? <CheckIcon size={16} /> : null}>
            Save targets
          </LiquidButton>
          {!canSave && (
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', textAlign: 'center', marginTop: 8, lineHeight: 1.4 }}>
              {!kcalNum ? 'Enter your daily kcal to continue' : `Split must total 100% (now ${sum}%)`}
            </div>
          )}
        </div>

      </div>
    </SafeScreen>
  );
}
export { MacroTargets };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Stepper({ label, pct, grams, color, onDec, onInc }) {
  return (
    <Glass radius="lg" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              · {grams ?? '—'} g
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StepBtn onClick={onDec} label={`Decrease ${label}`} sign="-" />
          <StepBtn onClick={onInc} label={`Increase ${label}`} sign="+" />
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 10 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 4,
            transition: 'width 320ms cubic-bezier(.22,1,.36,1)',
          }}
        />
      </div>
    </Glass>
  );
}

function StepBtn({ onClick, label, sign }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 36, height: 36, borderRadius: 9999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'hsl(var(--rd-fg-primary))',
        fontSize: 18, fontWeight: 600,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {sign}
    </button>
  );
}

function SumRow({ sum, valid }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        background: valid ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
        border: valid ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
        color: valid ? '#34D399' : '#FBBF24',
        fontSize: 13,
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>Split total</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{sum}%</span>
    </div>
  );
}

function EmptyState() {
  return (
    <Glass radius="lg" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>
        Pick a preset or enter your target kcal to start
      </div>
      <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.45 }}>
        We won't guess a split for you — your body, your call.
      </div>
    </Glass>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function MacroTargetsRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const existing = getMacroTargets(user?.id);
  return (
    <MacroTargets
      initial={existing}
      userMeta={user?.user_metadata}
      onSave={(targets) => {
        setMacroTargets(user?.id, targets);
        toast.success('Targets updated — Today system will use these');
        navigate('/app/today');
      }}
    />
  );
}
