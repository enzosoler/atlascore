/**
 * PhotoScanConfirm — AI confidence + per-item edit screen (Cal AI style).
 * Ref: Cal AI post-capture confirm + MyFitnessPal meal adjustment.
 *
 * - Hero: the captured photo (or placeholder blur) + AI-identified meal name
 * - Confidence banner (low = ask user to confirm, high = auto-proceed)
 * - Item list: each detected food gets a row with portion editor inline
 * - Totals footer: live sum of calories + macros
 * - Save to meal CTA
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { parseFoodText } from './nutritionAi';

/**
 * CRITICAL: we never invent food items. `items` comes from the AI parser
 * (parseText path) or from a real photo analysis. If neither happened, we
 * show an empty state — pretending "AI detected chicken breast 150g" is
 * miscounting the user's macros, which is worse than not logging.
 */
export default function PhotoScanConfirm({
  photoUrl = null,
  mealName: initialMealName = '',
  mealLabel = 'Meal',
  overallConfidence: initialConfidence = null,
  items: initialItems = null,
  parseText = null,     // when set, we run the AI parser on mount
  onCancel,
  onRetake,
  onSave,
}) {
  const [items, setItems] = useState(initialItems || []);
  const [mealName, setMealName] = useState(initialMealName);
  const [overallConfidence, setOverallConfidence] = useState(initialConfidence);
  const [loading, setLoading] = useState(!!parseText);
  const [parseError, setParseError] = useState('');

  // Run AI parse on mount when a `parseText` prop was provided.
  useEffect(() => {
    if (!parseText) return;
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        const meal = await parseFoodText(parseText, { signal: ctrl.signal });
        if (cancelled) return;
        setMealName(meal.food_name || parseText.slice(0, 60));
        setOverallConfidence(meal.confidence ?? 0.8);
        const normalized = (meal.items || []).map((it, i) => ({
          id: `ai-${i}`,
          name: it.name,
          portion: it.estimated_grams || it.unit_weight_g || 100,
          unit: it.unit_type === 'unit' || it.unit_type === 'piece' ? 'unit'
              : it.unit_type === 'slice' ? 'slice'
              : it.unit_type === 'tbsp' ? 'tbsp'
              : it.unit_type === 'tsp' ? 'tsp'
              : it.unit_type === 'cup' ? 'cup'
              : 'g',
          calories: it.calories || 0,
          protein: it.protein || 0,
          carbs: it.carbs || 0,
          fat: it.fat || 0,
          confidence: meal.confidence ?? 0.8,
        }));
        setItems(normalized);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setParseError(e?.message || 'AI parse failed');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; ctrl.abort(); };
  }, [parseText]);

  const totals = useMemo(() => {
    return items.reduce((acc, it) => ({
      calories: acc.calories + it.calories,
      protein:  acc.protein  + it.protein,
      carbs:    acc.carbs    + it.carbs,
      fat:      acc.fat      + it.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [items]);

  const removeItem = (id) => setItems((s) => s.filter((x) => x.id !== id));

  const lowConfidence = overallConfidence < 0.75;

  // Loading overlay while the AI parser works.
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'hsl(var(--rd-bg-app))',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 50% 45%, rgba(139,92,246,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 340 }}>
          <div style={{ width: 72, height: 72, borderRadius: 9999, background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden style={{ animation: 'rd-ai-spin 1400ms cubic-bezier(.5,0,.5,1) infinite' }}>
              <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="#A78BFA" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: 6 }}>
            Atlas AI
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 10 }}>
            Estimating macros…
          </div>
          <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.45, marginBottom: 20 }}>
            Parsing "{(parseText || '').slice(0, 80)}{parseText && parseText.length > 80 ? '…' : ''}"
          </div>
          <ShimmerRow />
          <ShimmerRow delay="200ms" />
          <ShimmerRow delay="400ms" />
        </div>
        <style>{`
          @keyframes rd-ai-spin { to { transform: rotate(360deg); } }
          @keyframes rd-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (parseError) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'hsl(var(--rd-bg-app))',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden>😕</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          AI could not parse that
        </div>
        <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, maxWidth: 320, marginBottom: 18 }}>
          {parseError}. Try rephrasing or use manual search.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <LiquidButton intent="neutral" size="lg" onClick={onCancel}>Back</LiquidButton>
          <LiquidButton intent="primary" size="lg" onClick={onRetake}>Try again</LiquidButton>
        </div>
      </div>
    );
  }

  return (
    <SafeScreen paddingX={0} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 112px)' }}>
      {/* Hero photo */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          background: photoUrl
            ? `url(${photoUrl}) center / cover no-repeat`
            : 'linear-gradient(135deg, #1a0e2e 0%, #0e1a2e 50%, #0a1a1a 100%)',
          overflow: 'hidden',
        }}
      >
        {!photoUrl && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 48 }} aria-hidden>🍽</div>
        )}
        {/* Top fade to blend with content */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,10,0.55) 0%, transparent 30%, transparent 60%, rgba(5,7,10,1) 100%)' }} />

        {/* Back */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back"
          style={{
            position: 'absolute', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
            width: 36, height: 36, borderRadius: 9999,
            background: 'rgba(10,14,20,0.55)',
            backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Retake */}
        <button
          type="button"
          onClick={onRetake}
          style={{
            position: 'absolute', top: 'calc(env(safe-area-inset-top) + 14px)', right: 'max(16px, env(safe-area-inset-right))',
            height: 36, paddingInline: 14, borderRadius: 9999,
            background: 'rgba(10,14,20,0.55)',
            backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retake
        </button>

        {/* Meal name overlay */}
        <div style={{ position: 'absolute', left: 'max(20px, env(safe-area-inset-left))', right: 'max(20px, env(safe-area-inset-right))', bottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
            Detected meal
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', marginTop: 2 }}>
            {mealName}
          </div>
        </div>
      </div>

      <div style={{ paddingInline: 20 }}>
        {/* AI confidence banner */}
        <SpringReveal delay={40}>
          <Glass tint={lowConfidence ? 'warning' : 'ai'} radius="xl" style={{ padding: 14, marginTop: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                aria-hidden
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: lowConfidence ? 'rgba(245,158,11,0.22)' : 'rgba(139,92,246,0.22)',
                  border: `1px solid ${lowConfidence ? 'rgba(245,158,11,0.5)' : 'rgba(139,92,246,0.5)'}`,
                  color: lowConfidence ? '#FBBF24' : '#A78BFA',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {lowConfidence ? <AlertIcon /> : <SparkIcon />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.2 }}>
                  {lowConfidence ? "Not fully sure — please confirm." : 'AI is confident in this read.'}
                </div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1.35 }}>
                  {lowConfidence
                    ? `Low-confidence items are flagged below. Tap to fix portions.`
                    : `${Math.round(overallConfidence * 100)}% overall confidence across ${items.length} items.`}
                </div>
              </div>
            </div>
          </Glass>
        </SpringReveal>

        {/* Items list */}
        <SpringReveal delay={80}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 8 }}>
            Items · {items.length}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <ItemRow
                key={it.id}
                item={it}
                onChange={(updated) => setItems((s) => s.map((x) => (x.id === it.id ? updated : x)))}
                onRemove={() => removeItem(it.id)}
              />
            ))}
          </div>
        </SpringReveal>

        {/* Add item */}
        <SpringReveal delay={140}>
          <button
            type="button"
            style={{
              width: '100%', marginTop: 10, height: 44,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,255,255,0.15)',
              color: 'hsl(var(--rd-fg-muted))',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span aria-hidden>+</span> Add another item
          </button>
        </SpringReveal>
      </div>

      {/* Totals + save footer */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                Total
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {Math.round(totals.calories)}
                <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 4 }}>kcal</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
              <span><span style={{ color: 'hsl(var(--rd-accent))' }}>P</span> {Math.round(totals.protein)}g</span>
              <span><span style={{ color: '#FBBF24' }}>C</span> {Math.round(totals.carbs)}g</span>
              <span><span style={{ color: '#A78BFA' }}>F</span> {Math.round(totals.fat)}g</span>
            </div>
          </div>
          <LiquidButton
            intent="primary"
            size="xl"
            block
            onClick={() => onSave?.({ items, totals, mealLabel })}
          >
            Add to {mealLabel}
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { PhotoScanConfirm };

function ItemRow({ item, onChange, onRemove }) {
  const confPct = Math.round(item.confidence * 100);
  const low = item.confidence < 0.75;
  return (
    <Glass radius="lg" style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }} className="truncate">
              {item.name}
            </span>
            <span
              style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 9999, fontWeight: 700,
                background: low ? 'rgba(245,158,11,0.14)' : 'rgba(16,185,129,0.14)',
                color: low ? '#FBBF24' : '#34D399',
                border: `1px solid ${low ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                flexShrink: 0,
              }}
            >
              {confPct}%
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {item.portion}{item.unit} · {item.calories} kcal · P{item.protein} C{item.carbs} F{item.fat}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            aria-label="Decrease"
            onClick={() => {
              const step = item.unit === 'g' || item.unit === 'ml' ? 10 : 0.25;
              const next = Math.max(0.25, +(item.portion - step).toFixed(2));
              const r = next / item.portion;
              onChange({
                ...item,
                portion: next,
                calories: Math.round(item.calories * r),
                protein: +(item.protein * r).toFixed(1),
                carbs: +(item.carbs * r).toFixed(1),
                fat: +(item.fat * r).toFixed(1),
              });
            }}
            style={btnTiny}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Increase"
            onClick={() => {
              const step = item.unit === 'g' || item.unit === 'ml' ? 10 : 0.25;
              const next = +(item.portion + step).toFixed(2);
              const r = next / item.portion;
              onChange({
                ...item,
                portion: next,
                calories: Math.round(item.calories * r),
                protein: +(item.protein * r).toFixed(1),
                carbs: +(item.carbs * r).toFixed(1),
                fat: +(item.fat * r).toFixed(1),
              });
            }}
            style={btnTiny}
          >
            +
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove item"
            style={{ ...btnTiny, color: '#FB7185' }}
          >
            ×
          </button>
        </div>
      </div>
    </Glass>
  );
}

const btnTiny = {
  width: 32, height: 32, borderRadius: 10,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'hsl(var(--rd-fg-primary))', fontSize: 16, fontWeight: 700,
  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

const sx = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function AlertIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24"><path {...sx} d="M12 3L2 21h20L12 3zM12 10v4M12 18v.01" /></svg>); }
function SparkIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24"><path {...sx} d="M12 3l1.9 5.9L20 10l-5 3.6L16 20l-4-3-4 3 1-6.4L4 10l6.1-1.1z" /></svg>); }

function ShimmerRow({ delay = '0ms' }) {
  return (
    <div
      style={{
        height: 48,
        borderRadius: 12,
        marginBottom: 8,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(139,92,246,0.14) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: `rd-shimmer 1400ms ${delay} linear infinite`,
      }}
    />
  );
}
