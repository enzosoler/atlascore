/**
 * Insights — /app/insights (premium gated).
 * Ref: Whoop Insights + Oura Trends + Levels metabolic insights.
 *
 * Timeline of AI-generated findings with filter chips (category, severity,
 * timeframe), each card expandable. Premium gate when the user is Free.
 *
 * RULE: every insight comes from a real analysis. Never fabricates. If the
 * service returns nothing, we say so honestly.
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon, TrendUpIcon, TrendDownIcon } from '../lib/icons';

const CATEGORIES = ['All', 'Recovery', 'Training', 'Nutrition', 'Body', 'Sleep'];
const TIMEFRAMES = ['Today', '7 days', '30 days', 'All time'];

export default function Insights({
  isPremium = false,
  insights = [],           // [{ id, category, severity, headline, body, at, delta?, metrics? }]
  onUpgrade,
  onOpenInsight,
  onAsk,
  onBack,
}) {
  const [cat, setCat] = useState('All');
  const [time, setTime] = useState('7 days');

  const filtered = useMemo(() => {
    return insights.filter((i) => {
      if (cat !== 'All' && i.category !== cat) return false;
      if (!i.at) return true;
      const ageDays = (Date.now() - new Date(i.at).getTime()) / 86400000;
      if (time === 'Today' && ageDays > 1) return false;
      if (time === '7 days' && ageDays > 7) return false;
      if (time === '30 days' && ageDays > 30) return false;
      return true;
    });
  }, [insights, cat, time]);

  // Free users see a teaser + premium gate
  if (!isPremium) {
    return (
      <SafeScreen hasTopBar hasBottomNav paddingX={20}>
        <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 40 }}>
          <SpringReveal delay={20}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Insights · Premium
            </div>
            <h1 style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Your data, decoded.
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
              Atlas AI watches every metric — HRV, macros, sleep, volume — and surfaces the
              patterns that actually matter. Why you're tired. What you should eat. When to deload.
            </p>
          </SpringReveal>

          <SpringReveal delay={80}>
            <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
              <TeaseRow headline="Why your HRV is trending down." />
              <TeaseRow headline="The macro pattern behind your recent PRs." />
              <TeaseRow headline="Sleep debt: how much you can push this week." />
              <TeaseRow headline="Protein timing vs. strength gains — your data." />
            </div>
          </SpringReveal>

          <SpringReveal delay={160}>
            <Glass tint="premium" radius="xl" style={{ padding: 18, marginTop: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-premium))', fontWeight: 700 }}>
                Atlas Premium
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 4 }}>
                Unlock every insight for $9.99/mo
              </div>
              <p style={{ margin: '6px 0 14px', fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                Includes AI coach chat, meal plans, lab interpretation, and unlimited AI logs.
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

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Insights
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            What I'm seeing.
          </h1>
        </SpringReveal>

        {/* Filters */}
        <SpringReveal delay={60}>
          <ChipRow items={CATEGORIES} value={cat} onChange={setCat} />
          <ChipRow items={TIMEFRAMES} value={time} onChange={setTime} tint="neutral" />
        </SpringReveal>

        {/* Timeline */}
        <div style={{ marginTop: 20 }}>
          {filtered.length === 0 ? (
            <Glass radius="xl" style={{ padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', marginBottom: 6 }}>
                Nothing to call out yet
              </div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                {insights.length === 0
                  ? 'Log some meals, workouts, and connect a wearable — the AI needs data to find patterns.'
                  : 'No insights match this filter. Try a broader timeframe or different category.'}
              </div>
            </Glass>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map((i, idx) => (
                <SpringReveal key={i.id} delay={idx * 30}>
                  <InsightCard
                    insight={i}
                    onOpen={() => onOpenInsight?.(i.id)}
                    onAsk={onAsk}
                  />
                </SpringReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </SafeScreen>
  );
}
export { Insights };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function ChipRow({ items, value, onChange, tint = 'accent' }) {
  const tintColors = tint === 'neutral'
    ? { activeBg: 'rgba(255,255,255,0.08)', activeBorder: 'rgba(255,255,255,0.22)', activeColor: 'hsl(var(--rd-fg-primary))' }
    : { activeBg: 'rgba(0,255,255,0.14)',   activeBorder: 'rgba(0,255,255,0.4)',   activeColor: 'hsl(var(--rd-accent))' };
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {items.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            style={{
              flex: '0 0 auto',
              height: 32, paddingInline: 14, borderRadius: 9999,
              background: active ? tintColors.activeBg : 'rgba(255,255,255,0.04)',
              border: active ? `1px solid ${tintColors.activeBorder}` : '1px solid rgba(255,255,255,0.08)',
              color: active ? tintColors.activeColor : 'hsl(var(--rd-fg-secondary))',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

const SEVERITY_COLOR = {
  positive: '#34D399', warning: '#FBBF24', info: 'hsl(var(--rd-accent))', danger: '#FB7185',
};

function InsightCard({ insight, onOpen, onAsk }) {
  const color = SEVERITY_COLOR[insight.severity] || '#A78BFA';
  return (
    <Glass radius="xl" style={{ padding: 14, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, background: color, boxShadow: `0 0 5px ${color}` }} />
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {insight.category}
        </span>
        {insight.at && (
          <span style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
            {formatRel(insight.at)}
          </span>
        )}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
        {insight.headline}
      </div>
      {insight.body && (
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.45 }}>
          {insight.body}
        </p>
      )}
      <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
        <button
          type="button"
          onClick={() => onAsk?.(`Tell me more: ${insight.headline}`)}
          style={{ background: 'transparent', border: 'none', color: '#A78BFA', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
        >
          Ask why →
        </button>
        <button
          type="button"
          onClick={onOpen}
          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-fg-muted))', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Details
        </button>
      </div>
    </Glass>
  );
}

function TeaseRow({ headline }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(139,92,246,0.04)',
        border: '1px solid rgba(139,92,246,0.14)',
        position: 'relative',
      }}
    >
      <span aria-hidden style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(139,92,246,0.18)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <SparkleIcon size={14} />
      </span>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em', color: 'hsl(var(--rd-fg-secondary))', filter: 'blur(3px)' }}>
        {headline}
      </div>
      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-premium))', fontWeight: 700, flexShrink: 0 }}>
        Locked
      </span>
    </div>
  );
}

function formatRel(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
