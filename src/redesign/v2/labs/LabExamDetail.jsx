/**
 * LabExamDetail — /app/labs/exam/:id.
 * Ref: Function Health panel detail + InsideTracker result page.
 *
 * Single lab panel with all biomarkers. Group by category (Metabolic,
 * Cardiovascular, Hormones, Vitamins, Inflammation, Blood count) with status
 * indicators (optimal / monitor / out-of-range).
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon } from '../lib/icons';

const STATUS_COLORS = {
  optimal:    '#34D399',
  monitor:    '#FBBF24',
  out:        '#FB7185',
  low:        '#60A5FA',
  high:       '#FB7185',
};

export default function LabExamDetail({
  exam = null,             // { id, name, at, source, orderingProvider, summary }
  biomarkers = [],         // [{ id, category, name, value, unit, status, range, trend? }]
  coachSummary = null,     // { title, body }
  onBack,
  onAsk,
  onOpenBiomarker,
  onShare,
}) {
  const [filter, setFilter] = useState('All');

  const grouped = useMemo(() => {
    const map = {};
    for (const b of biomarkers) {
      const cat = b.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    }
    return map;
  }, [biomarkers]);

  const categories = ['All', ...Object.keys(grouped)];
  const visible = filter === 'All' ? biomarkers : grouped[filter] || [];

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            {exam?.at
              ? new Date(exam.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Lab panel'}
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            {exam?.name || 'Results'}
          </h1>
          {exam?.source && (
            <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
              {exam.source}{exam.orderingProvider ? ` · ordered by ${exam.orderingProvider}` : ''}
            </div>
          )}
        </SpringReveal>

        {/* Coach summary card */}
        {coachSummary && (
          <SpringReveal delay={60}>
            <Glass tint="ai" radius="xl" style={{ padding: 16, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.5)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SparkleIcon size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700 }}>
                    AI summary
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{coachSummary.title}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                    {coachSummary.body}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAsk?.(`Tell me more about this lab panel: ${exam?.name || ''}`)}
                    style={{ marginTop: 10, background: 'transparent', border: 'none', color: '#A78BFA', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Ask coach →
                  </button>
                </div>
              </div>
            </Glass>
          </SpringReveal>
        )}

        {/* Category filter chips */}
        <SpringReveal delay={100}>
          <div style={{ display: 'flex', gap: 6, marginTop: 18, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categories.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  style={{
                    flex: '0 0 auto',
                    height: 32, paddingInline: 14, borderRadius: 9999,
                    background: active ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                    border: active ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </SpringReveal>

        {/* Biomarker list */}
        <div style={{ marginTop: 14 }}>
          {visible.length === 0 ? (
            <Glass radius="lg" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                No biomarkers in this panel.
              </div>
            </Glass>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {visible.map((b) => (
                <BiomarkerRow key={b.id} biomarker={b} onClick={() => onOpenBiomarker?.(b.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky share/ask CTA */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <LiquidButton intent="neutral" size="lg" onClick={onShare}>Share with coach</LiquidButton>
          <LiquidButton intent="ai" size="lg" onClick={() => onAsk?.('Explain this lab panel to me')}>Ask AI</LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { LabExamDetail };

function BiomarkerRow({ biomarker: b, onClick }) {
  const statusColor = STATUS_COLORS[b.status] || 'hsl(var(--rd-fg-muted))';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 14px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span aria-hidden style={{ width: 4, height: 32, borderRadius: 2, background: statusColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">
          {b.name}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {b.range ? `Ref: ${b.range}` : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', color: statusColor }}>
          {b.value}
          {b.unit && <span style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{b.unit}</span>}
        </div>
        {b.status && (
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor, fontWeight: 700, marginTop: 2 }}>
            {b.status === 'out' ? 'out of range' : b.status}
          </div>
        )}
      </div>
    </button>
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
