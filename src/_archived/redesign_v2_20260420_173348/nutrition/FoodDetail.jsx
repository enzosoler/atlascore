/**
 * FoodDetail — food card with portion editor and add-to-meal.
 * Ref: MyFitnessPal food detail + Cronometer breakdown + Yazio portion wheel.
 *
 * - Big header with name + brand + hero macros
 * - Portion editor (quantity + unit picker)
 * - Macros computed live from portion
 * - Add to meal sticky bottom CTA
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

const UNITS = ['g', 'oz', 'cup', 'tbsp', 'piece'];

export default function FoodDetail({
  food = {
    name: 'Greek yogurt',
    brand: 'Oikos 0%',
    basePortion: { amount: 170, unit: 'g' },
    nutrients: { calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, sugar: 6, sodium: 60 },
  },
  meal = 'Breakfast',
  onClose,
  onAdd,
}) {
  const [amount, setAmount] = useState(food.basePortion.amount);
  const [unit, setUnit] = useState(food.basePortion.unit);

  // Scale nutrients by portion amount ratio (simplified — real impl uses per-unit conversions).
  const scale = amount / (food.basePortion.amount || 1);
  const scaled = useMemo(() => ({
    calories: Math.round(food.nutrients.calories * scale),
    protein:  +(food.nutrients.protein  * scale).toFixed(1),
    carbs:    +(food.nutrients.carbs    * scale).toFixed(1),
    fat:      +(food.nutrients.fat      * scale).toFixed(1),
    fiber:    +((food.nutrients.fiber ?? 0) * scale).toFixed(1),
    sugar:    +((food.nutrients.sugar ?? 0) * scale).toFixed(1),
    sodium:   Math.round((food.nutrients.sodium ?? 0) * scale),
  }), [scale, food.nutrients]);

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}>
      {/* Back */}
      <button
        type="button"
        onClick={onClose}
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)' }}>
        {/* Name / brand */}
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Adding to {meal}
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            {food.name}
          </h1>
          {food.brand && (
            <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>{food.brand}</div>
          )}
        </SpringReveal>

        {/* Hero macros card */}
        <SpringReveal delay={60}>
          <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 20, marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                  Calories
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {scaled.calories}
                  </span>
                  <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>kcal</span>
                </div>
              </div>
              <MacroDonut p={scaled.protein} c={scaled.carbs} f={scaled.fat} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <MacroBlock label="Protein" value={scaled.protein} color="hsl(var(--rd-accent))" />
              <MacroBlock label="Carbs"   value={scaled.carbs}   color="#FBBF24" />
              <MacroBlock label="Fat"     value={scaled.fat}     color="#A78BFA" />
            </div>
          </Glass>
        </SpringReveal>

        {/* Portion editor */}
        <SpringReveal delay={120}>
          <Glass radius="xl" style={{ padding: 18, marginTop: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 10 }}>
              Portion
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setAmount(Math.max(1, Math.round(amount * 10 - 5) / 10))}
                aria-label="Decrease"
                style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--rd-fg-primary))', fontSize: 20, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
              >
                −
              </button>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                inputMode="decimal"
                style={{
                  flex: 1, height: 44, borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'hsl(var(--rd-fg-primary))', padding: '0 14px',
                  fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setAmount(Math.round((amount + 5) * 10) / 10)}
                aria-label="Increase"
                style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--rd-fg-primary))', fontSize: 20, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {UNITS.map((u) => {
                const active = unit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    style={{
                      height: 32, paddingInline: 12, borderRadius: 9999,
                      background: active ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </Glass>
        </SpringReveal>

        {/* Detailed nutrition table */}
        <SpringReveal delay={160}>
          <Glass radius="xl" style={{ padding: 18, marginTop: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 8 }}>
              Full breakdown
            </div>
            <Row label="Fiber"   value={`${scaled.fiber} g`} />
            <Row label="Sugar"   value={`${scaled.sugar} g`} />
            <Row label="Sodium"  value={`${scaled.sodium} mg`} last />
          </Glass>
        </SpringReveal>
      </div>

      {/* Sticky Add CTA */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.95) 100%)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '14px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto' }}>
          <LiquidButton intent="primary" size="xl" block onClick={() => onAdd?.({ ...food, portion: { amount, unit }, calculated: scaled })}>
            Add to {meal} · {scaled.calories} kcal
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { FoodDetail };

function MacroBlock({ label, value, color }) {
  return (
    <div
      style={{
        padding: '10px 8px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>g</span>
      </div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBlock: 10,
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

function MacroDonut({ p, c, f }) {
  const pcal = p * 4, ccal = c * 4, fcal = f * 9;
  const total = pcal + ccal + fcal || 1;
  const pp = pcal / total, cp = ccal / total, fp = fcal / total;
  const C = 2 * Math.PI * 28;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
      {pp > 0 && (
        <circle cx="32" cy="32" r="28" stroke="hsl(var(--rd-accent))" strokeWidth="6" fill="none" strokeDasharray={`${pp * C} ${C}`} transform="rotate(-90 32 32)" strokeLinecap="butt" />
      )}
      {cp > 0 && (
        <circle cx="32" cy="32" r="28" stroke="#FBBF24" strokeWidth="6" fill="none" strokeDasharray={`${cp * C} ${C}`} strokeDashoffset={`${-pp * C}`} transform="rotate(-90 32 32)" strokeLinecap="butt" />
      )}
      {fp > 0 && (
        <circle cx="32" cy="32" r="28" stroke="#A78BFA" strokeWidth="6" fill="none" strokeDasharray={`${fp * C} ${C}`} strokeDashoffset={`${-(pp + cp) * C}`} transform="rotate(-90 32 32)" strokeLinecap="butt" />
      )}
    </svg>
  );
}
