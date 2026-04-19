/**
 * Routines — /app/routines.
 * Ref: Hevy routines tab + Strong programs.
 *
 * List of saved routine templates. Grid or card rows with name, exercises
 * count, primary muscles, last used. Three actions: create (manual),
 * AI-build, browse presets.
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { DumbbellIcon, SparkleIcon } from '../lib/icons';

const GROUPS = ['All', 'Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full body'];

export default function Routines({
  routines = [],         // [{ id, name, exerciseCount, muscles, lastUsedAt, color }]
  onBack,
  onOpenRoutine,
  onCreateManual,
  onAiGenerate,
  onBrowsePresets,
}) {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return routines;
    return routines.filter((r) => (r.muscles || []).some((m) => normalize(m) === normalize(filter)) || normalize(r.name).includes(normalize(filter)));
  }, [routines, filter]);

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Training
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Your routines
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
            Saved workout templates. Start one anytime or let AI build a new one from your goals.
          </p>
        </SpringReveal>

        {/* Create row — always visible */}
        <SpringReveal delay={60}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
            <CreateTile
              Icon={SparkleIcon}
              label="AI build"
              sub="From your goals"
              tint="ai"
              onClick={onAiGenerate}
            />
            <CreateTile
              Icon={DumbbellIcon}
              label="Manual"
              sub="Start blank"
              onClick={onCreateManual}
            />
            <CreateTile
              Icon={GridIcon}
              label="Presets"
              sub="PPL, 5/3/1…"
              onClick={onBrowsePresets}
            />
          </div>
        </SpringReveal>

        {/* Filter chips */}
        {routines.length > 0 && (
          <SpringReveal delay={100}>
            <div style={{ display: 'flex', gap: 6, marginTop: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {GROUPS.map((g) => {
                const active = filter === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFilter(g)}
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
                    {g}
                  </button>
                );
              })}
            </div>
          </SpringReveal>
        )}

        {/* Routine list */}
        <div style={{ marginTop: 20 }}>
          {routines.length === 0 ? (
            <SpringReveal delay={140}>
              <Glass tint="ai" radius="xl" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.5)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SparkleIcon size={16} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                      No routines yet
                    </div>
                    <p style={{ margin: '4px 0 12px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                      Atlas AI can build your first one from your goal, equipment, and schedule — takes 3 seconds.
                    </p>
                    <LiquidButton intent="ai" size="sm" onClick={onAiGenerate}>
                      Build my first routine
                    </LiquidButton>
                  </div>
                </div>
              </Glass>
            </SpringReveal>
          ) : filtered.length === 0 ? (
            <Glass radius="lg" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                No routines match "{filter}". Try a different filter.
              </div>
            </Glass>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {filtered.map((r, i) => (
                <SpringReveal key={r.id} delay={Math.min(i * 20, 200)}>
                  <RoutineRow routine={r} onClick={() => onOpenRoutine?.(r.id)} />
                </SpringReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </SafeScreen>
  );
}
export { Routines };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function CreateTile({ Icon, label, sub, tint, onClick }) {
  const isAi = tint === 'ai';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 12,
        borderRadius: 14,
        background: isAi ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.04)',
        border: isAi ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        minHeight: 96,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <span aria-hidden style={{
        width: 28, height: 28, borderRadius: 9,
        background: isAi ? 'rgba(139,92,246,0.18)' : 'rgba(0,255,255,0.10)',
        border: isAi ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(0,255,255,0.22)',
        color: isAi ? '#A78BFA' : 'hsl(var(--rd-accent))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} />
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 1 }}>{sub}</div>
      </div>
    </button>
  );
}

function RoutineRow({ routine: r, onClick }) {
  const tint = r.color === 'violet' ? { bg: 'rgba(139,92,246,0.08)', bd: 'rgba(139,92,246,0.25)', c: '#A78BFA' }
            : r.color === 'gold' ? { bg: 'rgba(201,169,106,0.08)', bd: 'rgba(201,169,106,0.28)', c: 'hsl(var(--rd-premium))' }
            : { bg: 'rgba(0,255,255,0.06)', bd: 'rgba(0,255,255,0.22)', c: 'hsl(var(--rd-accent))' };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span aria-hidden style={{ width: 40, height: 40, borderRadius: 10, background: tint.bg, border: `1px solid ${tint.bd}`, color: tint.c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <DumbbellIcon size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }} className="truncate">
          {r.name}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }} className="truncate">
          {r.exerciseCount || 0} exercises
          {Array.isArray(r.muscles) && r.muscles.length > 0 && ` · ${r.muscles.join(' · ')}`}
          {r.lastUsedAt && ` · last used ${formatRel(r.lastUsedAt)}`}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function GridIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function formatRel(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.round(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 2) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function normalize(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
