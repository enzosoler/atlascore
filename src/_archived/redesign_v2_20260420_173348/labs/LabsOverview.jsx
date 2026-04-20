/**
 * LabsOverview — /app/labs (premium gated).
 * Ref: Function Health overview + InsideTracker blood panel + Levels dashboard.
 *
 * Layout:
 *  - Premium gate teaser for Free users (same pattern as Insights)
 *  - Hero: overall health score + last panel date
 *  - Biomarker summary grid: optimal/monitor/out-of-range counts
 *  - Recent exams list (chronological)
 *  - Upload CTA
 *
 * RULE: no fake biomarkers. Real lab results only.
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon, PulseIcon, TrendUpIcon, TrendDownIcon, ChartIcon } from '../lib/icons';

export default function LabsOverview({
  isPremium = false,
  healthScore = null,        // 0..100
  lastPanelAt = null,
  summary = null,            // { optimal, monitor, outOfRange, total }
  exams = [],                // [{ id, name, at, source, status }]
  onUpgrade,
  onUpload,
  onOpenExam,
  onOpenHistory,
  onOpenBiomarker,
}) {

  // Free tier → premium gate
  if (!isPremium) {
    return (
      <SafeScreen hasTopBar hasBottomNav paddingX={20}>
        <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 40 }}>
          <SpringReveal delay={20}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-premium))', fontWeight: 700 }}>
              Labs · Premium
            </div>
            <h1 style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Your bloodwork, explained.
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
              Upload any lab PDF. Atlas AI reads every biomarker, explains what each one means
              for your training and nutrition, and tracks them over time.
            </p>
          </SpringReveal>

          <SpringReveal delay={80}>
            <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
              <TeaseRow label="HDL cholesterol" hint="What it means for your cardio." />
              <TeaseRow label="Fasting insulin" hint="Insulin sensitivity decoded." />
              <TeaseRow label="Ferritin" hint="Iron stores and training capacity." />
              <TeaseRow label="Testosterone" hint="Full endocrine context." />
              <TeaseRow label="Vitamin D · 25(OH)" hint="Supplementation guidance." />
            </div>
          </SpringReveal>

          <SpringReveal delay={160}>
            <Glass tint="premium" radius="xl" style={{ padding: 18, marginTop: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-premium))', fontWeight: 700 }}>
                Atlas Premium
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 4 }}>
                Unlock labs for $9.99/mo
              </div>
              <p style={{ margin: '6px 0 14px', fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                Unlimited PDF uploads, AI interpretation, and biomarker tracking — plus coach chat, insights, and meal plans.
              </p>
              <LiquidButton intent="premium" size="lg" block onClick={onUpgrade}>
                Start 7-day free trial
              </LiquidButton>
            </Glass>
          </SpringReveal>
        </div>
      </SafeScreen>
    );
  }

  const hasData = typeof healthScore === 'number' || exams.length > 0;

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Labs
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Your bloodwork.
          </h1>
          {lastPanelAt && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
              Last panel: {new Date(lastPanelAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </SpringReveal>

        {!hasData ? (
          /* Premium user with no labs yet */
          <SpringReveal delay={60}>
            <Glass radius="xl" style={{ padding: 20, marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
                No labs uploaded yet
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                Upload a PDF from your last panel. Atlas AI reads every marker, flags anything out
                of range, and explains what each means for your training.
              </p>
              <LiquidButton intent="primary" size="lg" onClick={onUpload}>
                Upload lab PDF
              </LiquidButton>
            </Glass>
          </SpringReveal>
        ) : (
          <>
            {/* Health score hero */}
            <SpringReveal delay={60}>
              <HealthScoreHero score={healthScore} summary={summary} />
            </SpringReveal>

            {/* Biomarker summary grid */}
            <SpringReveal delay={120}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
                <SummaryCell label="Optimal"      count={summary?.optimal}     total={summary?.total} color="#34D399" />
                <SummaryCell label="Monitor"      count={summary?.monitor}     total={summary?.total} color="#FBBF24" />
                <SummaryCell label="Out of range" count={summary?.outOfRange}  total={summary?.total} color="#FB7185" />
              </div>
            </SpringReveal>

            {/* Recent exams */}
            <SpringReveal delay={180}>
              <SectionHeader
                title="Recent panels"
                action={{ label: 'History', onClick: onOpenHistory }}
              />
              <div style={{ display: 'grid', gap: 8 }}>
                {exams.slice(0, 5).map((ex) => (
                  <ExamRow key={ex.id} exam={ex} onClick={() => onOpenExam?.(ex.id)} />
                ))}
              </div>
            </SpringReveal>

            {/* Upload CTA */}
            <SpringReveal delay={240}>
              <LiquidButton
                intent="neutral"
                size="lg"
                block
                onClick={onUpload}
                leftIcon={<UploadIcon />}
              >
                Upload new panel
              </LiquidButton>
            </SpringReveal>
          </>
        )}
      </div>
    </SafeScreen>
  );
}
export { LabsOverview };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function HealthScoreHero({ score, summary }) {
  const hasScore = typeof score === 'number';
  const color = hasScore ? (score >= 80 ? 'hsl(var(--rd-health-excellent))' : score >= 60 ? 'hsl(var(--rd-health-good))' : score >= 40 ? 'hsl(var(--rd-health-moderate))' : 'hsl(var(--rd-health-low))') : 'hsl(var(--rd-fg-muted))';
  const pct = hasScore ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const offset = 440 * (1 - pct);
  return (
    <Glass tint="neutral" radius="xl" elevation="lg" style={{ padding: 20, marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Ring */}
        <div style={{ width: 120, height: 120, flexShrink: 0 }}>
          <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%' }} aria-hidden>
            <defs>
              <linearGradient id="labsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.65" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
            <circle
              cx="80" cy="80" r="70"
              stroke={hasScore ? 'url(#labsRingGrad)' : 'rgba(255,255,255,0.15)'}
              strokeWidth="12"
              strokeDasharray="440"
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 620ms cubic-bezier(.22,1,.36,1)' }}
            />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Health score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: hasScore ? color : 'hsl(var(--rd-fg-muted))' }}>
              {hasScore ? score : '—'}
            </span>
            <span style={{ fontSize: 16, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', marginTop: 6, lineHeight: 1.35 }}>
            {hasScore
              ? (score >= 80 ? 'Strong panel. Hold the line.'
                : score >= 60 ? 'Solid, a few markers to watch.'
                : score >= 40 ? 'Several markers need attention.'
                : 'Multiple markers need follow-up.')
              : 'Upload a panel to see your score.'}
          </div>
        </div>
      </div>
    </Glass>
  );
}

function SummaryCell({ label, count, total, color }) {
  const has = typeof count === 'number';
  return (
    <Glass radius="lg" style={{ padding: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: has ? color : 'hsl(var(--rd-fg-muted))', lineHeight: 1.1 }}>
          {has ? count : '—'}
        </span>
        {has && typeof total === 'number' && (
          <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>/ {total}</span>
        )}
      </div>
    </Glass>
  );
}

function ExamRow({ exam, onClick }) {
  const d = exam.at ? new Date(exam.at) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span aria-hidden style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.22)', color: 'hsl(var(--rd-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <PulseIcon size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">
          {exam.name || 'Lab panel'}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          {exam.source ? ` · ${exam.source}` : ''}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function TeaseRow({ label, hint }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(201,169,106,0.04)',
        border: '1px solid rgba(201,169,106,0.18)',
        position: 'relative',
      }}
    >
      <span aria-hidden style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(201,169,106,0.14)', color: 'hsl(var(--rd-premium))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ChartIcon size={14} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em', color: 'hsl(var(--rd-fg-secondary))', filter: 'blur(2px)' }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 1, filter: 'blur(2px)' }}>
          {hint}
        </div>
      </div>
      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-premium))', fontWeight: 700, flexShrink: 0 }}>
        Locked
      </span>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 8, paddingInline: 2 }}>
      <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
        {title}
      </h2>
      {action && (
        <button type="button" onClick={action.onClick} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v12m0-12l-5 5m5-5l5 5M5 21h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
