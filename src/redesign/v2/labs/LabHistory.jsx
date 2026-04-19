/**
 * LabHistory — /app/labs/history.
 * Ref: Apple Health records + Levels timeline.
 *
 * Chronological timeline of every lab panel uploaded. Group by year. Each
 * panel is a tappable row with date, name, source, biomarker count, and a
 * quick status strip (n optimal, n monitor, n out).
 */
import React, { useMemo } from 'react';
import { SafeScreen, Glass, SpringReveal } from '../lib/glass';
import { PulseIcon } from '../lib/icons';

export default function LabHistory({
  exams = [],        // [{ id, name, at, source, summary: { optimal, monitor, outOfRange, total } }]
  onBack,
  onOpenExam,
  onUpload,
}) {
  const grouped = useMemo(() => {
    const by = {};
    for (const ex of exams) {
      const y = new Date(ex.at).getFullYear();
      if (!by[y]) by[y] = [];
      by[y].push(ex);
    }
    const years = Object.keys(by).map(Number).sort((a, b) => b - a);
    for (const y of years) {
      by[y].sort((a, b) => new Date(b.at) - new Date(a.at));
    }
    return { years, by };
  }, [exams]);

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 60px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                Labs
              </div>
              <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                All panels
              </h1>
              <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                {exams.length} {exams.length === 1 ? 'panel' : 'panels'}
              </div>
            </div>
            <button
              type="button"
              onClick={onUpload}
              style={{
                height: 36, paddingInline: 14, borderRadius: 9999,
                background: 'rgba(0,255,255,0.12)',
                border: '1px solid rgba(0,255,255,0.3)',
                color: 'hsl(var(--rd-accent))',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              + Upload
            </button>
          </div>
        </SpringReveal>

        {exams.length === 0 ? (
          <SpringReveal delay={60}>
            <Glass radius="xl" style={{ padding: 20, marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 }}>
                No panels yet
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                Upload a PDF from your last blood panel. Each one lives here forever.
              </p>
            </Glass>
          </SpringReveal>
        ) : (
          grouped.years.map((year, yIdx) => (
            <SpringReveal key={year} delay={60 + yIdx * 40}>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
                  {year}
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {grouped.by[year].map((ex) => (
                    <ExamRow key={ex.id} exam={ex} onClick={() => onOpenExam?.(ex.id)} />
                  ))}
                </div>
              </div>
            </SpringReveal>
          ))
        )}
      </div>
    </SafeScreen>
  );
}
export { LabHistory };

function ExamRow({ exam, onClick }) {
  const d = new Date(exam.at);
  const s = exam.summary || {};
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', gap: 12,
        padding: '14px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
          {d.toLocaleDateString('en-US', { month: 'short' })}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {d.getDate()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }} className="truncate">
          {exam.name || 'Lab panel'}
        </div>
        {exam.source && (
          <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }} className="truncate">
            {exam.source}
          </div>
        )}
        {/* Status strip */}
        {s.total > 0 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {s.optimal != null && (
              <span style={{ color: '#34D399' }}>{s.optimal} optimal</span>
            )}
            {s.monitor != null && s.monitor > 0 && (
              <span style={{ color: '#FBBF24' }}>{s.monitor} monitor</span>
            )}
            {s.outOfRange != null && s.outOfRange > 0 && (
              <span style={{ color: '#FB7185' }}>{s.outOfRange} out</span>
            )}
          </div>
        )}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0, alignSelf: 'center' }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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
