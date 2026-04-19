/**
 * BiomarkerDetail — /app/labs/biomarker/:id.
 * Ref: InsideTracker marker page + Function Health biomarker drill-down.
 *
 * Drill-down view on one biomarker:
 *  - Hero: current value + status + reference range visualization
 *  - Trend chart across panels
 *  - "What it means" AI explainer card
 *  - "How to improve it" actions (training/nutrition/supplement tips)
 *  - Related biomarkers strip
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon, TrendUpIcon, TrendDownIcon } from '../lib/icons';

export default function BiomarkerDetail({
  biomarker = null,        // { id, name, value, unit, status, range: { low, high, optimalLow, optimalHigh }, history, explanation, actions, related }
  onBack,
  onAsk,
  onOpenBiomarker,
}) {
  if (!biomarker) {
    return (
      <SafeScreen paddingX={20}>
        <BackButton onClick={onBack} />
        <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 100px)', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Biomarker not available</div>
          <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 6 }}>
            This marker couldn't be loaded.
          </p>
        </div>
      </SafeScreen>
    );
  }

  const statusColor = biomarker.status === 'optimal' ? '#34D399'
    : biomarker.status === 'monitor' ? '#FBBF24'
    : biomarker.status === 'low' ? '#60A5FA'
    : biomarker.status === 'high' || biomarker.status === 'out' ? '#FB7185'
    : 'hsl(var(--rd-fg-muted))';

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            {biomarker.category || 'Biomarker'}
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            {biomarker.name}
          </h1>
        </SpringReveal>

        {/* Hero value + range bar */}
        <SpringReveal delay={60}>
          <Glass radius="xl" elevation="md" style={{ padding: 20, marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: statusColor }}>
                {biomarker.value}
              </span>
              <span style={{ fontSize: 15, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
                {biomarker.unit}
              </span>
              {biomarker.status && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10, padding: '3px 10px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    background: `${statusColor}22`,
                    border: `1px solid ${statusColor}66`,
                    color: statusColor,
                  }}
                >
                  {biomarker.status === 'out' ? 'out of range' : biomarker.status}
                </span>
              )}
            </div>
            <RangeBar biomarker={biomarker} color={statusColor} />
          </Glass>
        </SpringReveal>

        {/* Trend chart */}
        {Array.isArray(biomarker.history) && biomarker.history.length >= 2 && (
          <SpringReveal delay={120}>
            <SectionHeader title="Trend" />
            <Glass radius="xl" style={{ padding: 16 }}>
              <TrendChart history={biomarker.history} />
            </Glass>
          </SpringReveal>
        )}

        {/* What it means */}
        {biomarker.explanation && (
          <SpringReveal delay={180}>
            <SectionHeader title="What it means" />
            <Glass tint="ai" radius="xl" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span aria-hidden style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.5)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SparkleIcon size={14} />
                </span>
                <p style={{ margin: 0, fontSize: 14, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.55 }}>
                  {biomarker.explanation}
                </p>
              </div>
            </Glass>
          </SpringReveal>
        )}

        {/* Actions */}
        {Array.isArray(biomarker.actions) && biomarker.actions.length > 0 && (
          <SpringReveal delay={220}>
            <SectionHeader title="How to move it" />
            <div style={{ display: 'grid', gap: 8 }}>
              {biomarker.actions.map((a, i) => (
                <ActionRow key={i} action={a} />
              ))}
            </div>
          </SpringReveal>
        )}

        {/* Related */}
        {Array.isArray(biomarker.related) && biomarker.related.length > 0 && (
          <SpringReveal delay={260}>
            <SectionHeader title="Related markers" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {biomarker.related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpenBiomarker?.(r.id)}
                  style={{
                    height: 36, paddingInline: 14, borderRadius: 9999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'hsl(var(--rd-fg-secondary))',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {r.name} →
                </button>
              ))}
            </div>
          </SpringReveal>
        )}
      </div>

      {/* Ask AI sticky */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto' }}>
          <LiquidButton intent="ai" size="xl" block onClick={() => onAsk?.(`Explain ${biomarker.name} (${biomarker.value} ${biomarker.unit}) and what I should do.`)}>
            Ask coach about this marker
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { BiomarkerDetail };

/* ─── Range bar ─────────────────────────────────────────────────────────── */
function RangeBar({ biomarker, color }) {
  const r = biomarker.range || {};
  const low = r.low, high = r.high, oLow = r.optimalLow, oHigh = r.optimalHigh;
  const hasRange = typeof low === 'number' && typeof high === 'number';
  if (!hasRange) return null;
  const span = high - low;
  const clamp = (v) => Math.max(0, Math.min(1, (v - low) / span));
  const valuePct = clamp(biomarker.value) * 100;
  const optimalLeft = oLow != null ? clamp(oLow) * 100 : null;
  const optimalRight = oHigh != null ? clamp(oHigh) * 100 : null;

  return (
    <div>
      <div style={{ position: 'relative', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {/* Optimal band (green) */}
        {optimalLeft != null && optimalRight != null && (
          <span
            aria-hidden
            style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${optimalLeft}%`, width: `${optimalRight - optimalLeft}%`,
              background: 'rgba(52,211,153,0.22)',
              borderLeft: '1px solid rgba(52,211,153,0.4)',
              borderRight: '1px solid rgba(52,211,153,0.4)',
            }}
          />
        )}
        {/* Value marker */}
        <span
          aria-hidden
          style={{
            position: 'absolute', top: -3, left: `calc(${valuePct}% - 2px)`,
            width: 4, height: 16, borderRadius: 2,
            background: color,
            boxShadow: `0 0 8px ${color}aa`,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
        <span>{low} {biomarker.unit}</span>
        {optimalLeft != null && optimalRight != null && (
          <span style={{ color: '#34D399' }}>
            Optimal {oLow}–{oHigh}
          </span>
        )}
        <span>{high} {biomarker.unit}</span>
      </div>
    </div>
  );
}

/* ─── Trend chart ───────────────────────────────────────────────────────── */
function TrendChart({ history }) {
  const values = history.map((h) => h.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 100 - ((h.value - min) / range) * 90 - 5;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  return (
    <div>
      <div style={{ height: 100 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} aria-hidden>
          <path d={linePath} fill="none" stroke="hsl(var(--rd-accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {history.map((h, i) => {
            const [x, y] = points[i].split(',').map(Number);
            return <circle key={i} cx={x} cy={y} r="1.4" fill="hsl(var(--rd-accent))" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
        <span>{new Date(history[0].at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
        <span>{new Date(history[history.length - 1].at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
      </div>
    </div>
  );
}

function ActionRow({ action }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span aria-hidden style={{ width: 22, height: 22, borderRadius: 9999, background: 'rgba(0,255,255,0.14)', border: '1px solid rgba(0,255,255,0.35)', color: 'hsl(var(--rd-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>
        {action.label}
      </div>
      {action.domain && (
        <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
          {action.domain}
        </span>
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h2 style={{ margin: '24px 0 8px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', paddingInline: 2 }}>
      {title}
    </h2>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label="Back"
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
  );
}
