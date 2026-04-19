/**
 * RoutinePresets — browse screen for the curated preset library.
 * Ref: Hevy "Browse routines" tab + Boostcamp program cards.
 *
 * Layout: full-width preset cards (richer than exercise rows because each
 * preset has meaningful metadata: split, level, days/week, duration range,
 * equipment needed). Filter chip at the top by experience level.
 *
 * Rules applied:
 *  - ZERO emojis — uses SVG icons from lib/icons.
 *  - safe-area-inset aware, sticky header.
 *  - Every card has identical structure — visual rhythm matches the rest
 *    of the app.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, SpringReveal } from '../lib/glass';
import { DumbbellIcon } from '../lib/icons';
import {
  ROUTINE_PRESETS,
  totalExerciseCount,
  totalSetCount,
} from './routinePresets';

const LEVEL_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const ACCENT_COLORS = {
  cyan:   { bg: 'rgba(0,255,255,0.10)',   bd: 'rgba(0,255,255,0.26)',   c: 'hsl(var(--rd-accent))' },
  violet: { bg: 'rgba(139,92,246,0.10)',  bd: 'rgba(139,92,246,0.26)',  c: '#A78BFA' },
  gold:   { bg: 'rgba(201,169,106,0.10)', bd: 'rgba(201,169,106,0.28)', c: 'hsl(var(--rd-premium))' },
};

export default function RoutinePresets({
  presets = ROUTINE_PRESETS,
  onBack,
  onOpenPreset,
}) {
  const [level, setLevel] = useState('All');

  const filtered = useMemo(() => {
    if (level === 'All') return presets;
    return presets.filter((p) => p.level === level);
  }, [presets, level]);

  return (
    <SafeScreen paddingX={0}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: 'calc(env(safe-area-inset-top) + 10px)',
          paddingInline: 16,
          paddingBottom: 10,
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.74) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
            }}>
              Browse
            </div>
            <div style={{
              fontSize: 17, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))',
              letterSpacing: '-0.01em',
            }}>
              Routine presets
            </div>
          </div>
        </div>

        {/* Level filter chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {LEVEL_FILTERS.map((l) => {
            const active = level === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                style={{
                  flex: '0 0 auto',
                  height: 30, paddingInline: 12, borderRadius: 9999,
                  background: active ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intro copy */}
      <div style={{ paddingInline: 16, paddingTop: 10, paddingBottom: 6 }}>
        <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
          Curated starter programs. Pick one, tweak it, make it yours.
          Every preset uses exercises from the library — swap any of them anytime.
        </div>
      </div>

      {/* List */}
      <div style={{
        paddingInline: 16,
        paddingTop: 8,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: 20, borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.10)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', marginBottom: 4 }}>
              No presets at this level
            </div>
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>
              Try a different filter.
            </div>
          </div>
        ) : (
          filtered.map((p, i) => (
            <SpringReveal key={p.id} delay={Math.min(i * 20, 160)}>
              <PresetCard preset={p} onClick={() => onOpenPreset?.(p)} />
            </SpringReveal>
          ))
        )}
      </div>
    </SafeScreen>
  );
}
export { RoutinePresets };

/* ─── PresetCard ──────────────────────────────────────────────────────── */

function PresetCard({ preset: p, onClick }) {
  const accent = ACCENT_COLORS[p.accent] || ACCENT_COLORS.cyan;
  const exercises = totalExerciseCount(p);
  const sets = totalSetCount(p);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: 16,
        borderRadius: 18,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(16px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle tint on top-right tied to the preset accent */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(110% 70% at 100% 0%, ${accent.bg.replace('0.10', '0.22')} 0%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header row: icon + name + chevron */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          aria-hidden
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: accent.bg,
            border: `1px solid ${accent.bd}`,
            color: accent.c,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <DumbbellIcon size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
            lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.name}
          </div>
          <div style={{
            fontSize: 11, color: accent.c, marginTop: 3, fontWeight: 600, letterSpacing: '0.02em',
          }}>
            {p.tagline}
          </div>
        </div>
        <svg
          aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Description */}
      <div style={{
        position: 'relative',
        fontSize: 12.5, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5,
      }}>
        {p.description}
      </div>

      {/* Meta strip */}
      <div style={{ position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <MetaTag label={p.level} />
        <MetaTag label={`${p.daysPerWeek} days/week`} />
        <MetaTag label={p.split} />
        <MetaTag label={`${p.durationMin[0]}–${p.durationMin[1]} min`} />
        <MetaTag label={`${exercises} exercises · ${sets} sets`} muted />
      </div>
    </button>
  );
}

function MetaTag({ label, muted = false }) {
  return (
    <span
      style={{
        height: 22, paddingInline: 9, borderRadius: 7,
        background: muted ? 'transparent' : 'rgba(255,255,255,0.05)',
        border: muted ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.10)',
        color: muted ? 'hsl(var(--rd-fg-muted))' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em',
        display: 'inline-flex', alignItems: 'center',
      }}
    >
      {label}
    </span>
  );
}

/* ─── Route wrapper ───────────────────────────────────────────────────── */

export function RoutinePresetsRoute() {
  const navigate = useNavigate();
  return (
    <RoutinePresets
      onBack={() => navigate(-1)}
      onOpenPreset={(preset) => navigate(`/app/routines/presets/${preset.id}`)}
    />
  );
}
