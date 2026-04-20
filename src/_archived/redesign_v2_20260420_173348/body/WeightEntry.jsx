/**
 * WeightEntry — fullscreen weight logger.
 * Ref: Happy Scale + iOS Health weight + Whoop body weight.
 *
 * Core UX:
 *  - Huge tappable number input (BigNumberInput style)
 *  - Unit toggle kg/lb
 *  - Date/time picker (defaults to now)
 *  - Optional body fat % input (small)
 *  - Moving-average hint ("your 7-day avg is 73.4kg")
 *  - Big Save CTA
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, BigNumberInput } from '../lib/glass';

/**
 * CRITICAL: `previousWeight` and `movingAvgKg` come from real logged weights.
 * When the user has no history, both are null and we hide those hints
 * rather than inventing numbers.
 */
export default function WeightEntry({
  previousWeight = null,
  movingAvgKg = null,
  defaultUnit = 'kg',
  onCancel,
  onSave,
  onViewHistory,
}) {
  const [unit, setUnit] = useState(defaultUnit);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [when, setWhen] = useState(() => {
    const d = new Date();
    return `${d.toISOString().slice(0, 10)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const weightNum = Number(String(weight).replace(',', '.'));
  const delta = useMemo(() => {
    if (!weight || isNaN(weightNum) || previousWeight == null) return null;
    const prev = unit === 'kg' ? previousWeight : previousWeight * 2.20462;
    return weightNum - prev;
  }, [weight, weightNum, unit, previousWeight]);

  const canSave = weight && !isNaN(weightNum) && weightNum > 0 && weightNum < 1000;

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      {/* Back */}
      <button
        type="button"
        onClick={onCancel}
        aria-label="Back"
        style={{
          position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 45,
          width: 36, height: 36, borderRadius: 9999,
          background: 'rgba(10,14,20,0.55)',
          backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
      </button>

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
          Log weight
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          Hop on the scale.
        </h1>

        {/* Unit toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: 4,
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          {['kg', 'lb'].map((u) => {
            const active = unit === u;
            return (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                style={{
                  height: 36, borderRadius: 9999, border: 'none',
                  background: active ? 'hsl(var(--rd-accent))' : 'transparent',
                  color: active ? 'hsl(var(--rd-fg-on-accent))' : 'hsl(var(--rd-fg-secondary))',
                  fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background 220ms, color 220ms',
                }}
              >
                {u}
              </button>
            );
          })}
        </div>

        {/* Big weight input */}
        <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 28, textAlign: 'center' }}>
          <BigNumberInput
            value={weight}
            onChange={setWeight}
            suffix={unit}
            placeholder={unit === 'kg' ? '72.5' : '160'}
          />
          {delta !== null && Math.abs(delta) < 50 && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
              <span
                style={{
                  color: delta === 0 ? 'hsl(var(--rd-fg-muted))' : delta < 0 ? '#34D399' : '#FBBF24',
                  fontWeight: 700,
                }}
              >
                {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {Math.abs(delta).toFixed(1)}
              </span>{' '}
              {unit} vs last
            </div>
          )}
          {movingAvgKg != null && (
            <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 6 }}>
              7-day avg: <strong style={{ color: 'hsl(var(--rd-fg-secondary))', fontVariantNumeric: 'tabular-nums' }}>{movingAvgKg.toFixed(1)} kg</strong>
            </div>
          )}
        </Glass>

        {/* Body fat (optional) */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 8 }}>
            Body fat % <span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="decimal"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
              placeholder="—"
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'hsl(var(--rd-fg-primary))',
                padding: '0 44px 0 16px',
                fontSize: 17, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
              %
            </span>
          </div>
        </div>

        {/* When */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 8 }}>
            When
          </div>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              padding: '0 16px',
              fontSize: 15, fontWeight: 500,
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>
      </div>

      {/* Save CTA sticky */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LiquidButton
            intent="primary"
            size="xl"
            block
            disabled={!canSave}
            onClick={() => onSave?.({
              weight: weightNum,
              unit,
              bodyFatPct: bodyFat ? Number(bodyFat.replace(',', '.')) : null,
              at: when,
            })}
          >
            Save weight
          </LiquidButton>
          {/* Discoverability: route to /app/body/composition. Route wrapper
              decides whether to show it (only makes sense when the user has
              prior logs OR wants to browse the empty state). */}
          {onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              style={{
                height: 40,
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--rd-accent))',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              View history
            </button>
          )}
        </div>
      </div>
    </SafeScreen>
  );
}
export { WeightEntry };
