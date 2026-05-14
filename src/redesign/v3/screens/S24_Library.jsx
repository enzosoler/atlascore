import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function MatchSheet({ dark, c, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', background: dark ? '#1a1a18' : '#f5f0e8',
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px 40px',
          maxHeight: '70vh', overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(239,233,218,0.2)',
          margin: '0 auto 24px',
        }} />

        <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Match %
        </ACLabel>
        <div style={{
          marginTop: 8,
          fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
          letterSpacing: -0.6, lineHeight: 1.1, color: c.fg,
        }}>
          How we rank programs for you
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Training age', detail: 'Years of consistent lifting — determines volume capacity and program complexity.' },
            { label: 'Goal alignment', detail: 'What you said you want (strength, size, endurance) versus what the program delivers.' },
            { label: 'Schedule fit', detail: 'How many days per week you can train versus the program\'s required frequency.' },
            { label: 'Readiness trend', detail: 'Your 7-day adherence and recovery trend — high readiness unlocks higher-volume programs.' },
            { label: 'Current phase', detail: 'Where you are in your current training cycle — accumulation, intensification, or deload.' },
          ].map(({ label, detail }) => (
            <div key={label} style={{ paddingBottom: 14, borderBottom: `1px solid ${dark ? 'rgba(239,233,218,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <div style={{
                fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
                color: c.fg, marginBottom: 4,
              }}>
                {label}
              </div>
              <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5 }}>
                {detail}
              </ACLabel>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: c.mute, lineHeight: 1.6, fontStyle: 'italic' }}>
          Match % is a guidance signal, not a hard gate. A 70% match on a program you commit to beats a 95% match on one you abandon.
        </div>
      </div>
    </div>
  );
}

function ProgramRow({ p, idx, c, active, onClick, onMatchTap }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        background: active ? c.fg : c.card,
        color: active ? c.bg : c.fg,
        borderRadius: ACRadii.card,
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        width: 42, textAlign: 'center',
        fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600,
        color: active ? 'rgba(239,233,218,0.55)' : c.mute,
        letterSpacing: 0.5,
      }}>
        {String(idx).padStart(3, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 16, fontWeight: 600,
            letterSpacing: -0.3, color: active ? c.bg : c.fg,
          }}>{p.name}</div>
        </div>
        <div style={{
          marginTop: 3, display: 'flex', gap: 10, alignItems: 'center',
          fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600,
          color: active ? 'rgba(239,233,218,0.55)' : c.dim,
          letterSpacing: 0.3,
        }}>
          {p.a ? <><span>{p.a}</span><span>·</span></> : null}
          <span>{p.w}wk · {p.d}d/wk</span>
          {p.lvl ? <><span>·</span><span>{p.lvl}</span></> : null}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {active ? (
          <div style={{
            padding: '4px 8px',
            background: c.accent,
            borderRadius: 999,
            display: 'inline-block',
          }}>
            <ACLabel size={9} color={c.ink} style={{ fontFamily: ACFonts.body, letterSpacing: 0.3, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Powers daily plan
            </ACLabel>
          </div>
        ) : typeof p.fit === 'number' ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMatchTap?.(); }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'right' }}
          >
            <div style={{
              fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
              color: p.fit >= 85 ? c.accent : c.fg,
              lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}>
              {p.fit}<span style={{ fontSize: 10, color: c.dim }}>%</span>
            </div>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.body, letterSpacing: 0.2, marginTop: 2, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>
              MATCH
            </ACLabel>
          </button>
        ) : null}
      </div>
    </div>
  );
}

// Default mock — used when no `programs` prop is supplied (gallery preview).
const DEFAULT_PROGRAMS = [
  { id: 'm1', name: 'Push · Pull · Legs',   a: 'atlas.core',   w: 12, d: 6, lvl: 'Intermediate', fit: 91, tag: 'Hypertrophy' },
  { id: 'm2', name: 'Conjugate · Westside', a: 'Louie Simmons', w: 20, d: 4, lvl: 'Advanced',     fit: 78, tag: 'Power' },
  { id: 'm3', name: 'Tactical Barbell',     a: 'K. Black',      w: 8,  d: 3, lvl: 'Intermediate', fit: 73, tag: 'Strength' },
  { id: 'm4', name: 'nSuns 531 LP',         a: 'nSuns',         w: 12, d: 5, lvl: 'Advanced',     fit: 69, tag: 'Strength' },
  { id: 'm5', name: 'GZCLP',                a: 'Cody LeFever',  w: 16, d: 3, lvl: 'Beginner',     fit: 88, tag: 'Strength' },
];

function S24_Library({
  dark = false,
  programs,           // undefined = use mock; [] = show empty state; [..] = real rows
  activeProgramId,    // id of the user's currently-active routine, if any
  featuredProgram,    // optional real featured program; null = use sample
  onStartWorkout,     // () => void — CTA on the active row / empty state
  onSelectProgram,    // (id) => void — row click
  onSearch,
  onBuildProgram,
  onOpenFeatured,
  showTabBar = true,
}) {
  const c = useACT(dark);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [showMatchSheet, setShowMatchSheet] = React.useState(false);
  const categories = ['All', 'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Mobility'];
  const featured = featuredProgram || {
    name: '5/3/1 BBB',
    author: 'Jim Wendler',
    pct: 86,
    wks: 16,
    runners: '12.4k',
    kicker: 'The system most atlas users end up on',
  };

  // Resolve what to render:
  //   programs === undefined  → mock (gallery preview parity)
  //   programs === []         → empty state (real user with zero routines)
  //   programs === [...]      → real rows
  const usingMock = programs === undefined;
  const rows = usingMock ? DEFAULT_PROGRAMS : programs;
  const isEmpty = !usingMock && Array.isArray(programs) && programs.length === 0;

  // Apply category filter to the displayed rows.
  const filteredRows = selectedCategory === 'All'
    ? rows
    : rows.filter(p => p.tag && p.tag.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase' }}>Train · {rows.length > 0 ? `${rows.length} program${rows.length === 1 ? '' : 's'}` : 'Library'}</ACLabel>
        </div>
        <button
          type="button"
          onClick={onSearch}
          style={{
          width: 34, height: 34, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke={c.fg} strokeWidth="1.6"/>
            <path d="M9.5 9.5L12 12" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Featured — full bleed, quotable */}
        <button
          type="button"
          onClick={onOpenFeatured}
          style={{
          padding: 24, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card, position: 'relative', overflow: 'hidden',
          border: 'none', textAlign: 'left', cursor: 'pointer',
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Sample · from the catalog
          </ACLabel>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
            letterSpacing: -1.4, lineHeight: 0.95, marginTop: 10,
          }}>
            {featured.name}
          </div>
          <div style={{ fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600, color: 'rgba(239,233,218,0.55)', marginTop: 6, letterSpacing: 0.1 }}>
            BY {featured.author.toUpperCase()}
          </div>

          <div style={{
            marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 18,
            paddingTop: 18, borderTop: '1px solid rgba(239,233,218,0.14)',
          }}>
            <div>
              <ACLabel size={12} color="rgba(239,233,218,0.72)" style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 4 }}>Match</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -0.8, color: c.accent, lineHeight: 1 }}>
                {featured.pct}<span style={{ fontSize: 16, color: 'rgba(239,233,218,0.55)', letterSpacing: 0 }}>%</span>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(239,233,218,0.14)', paddingLeft: 18 }}>
              <ACLabel size={12} color="rgba(239,233,218,0.72)" style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 4 }}>Length</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, marginTop: 2 }}>{featured.wks} wk</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(239,233,218,0.14)', paddingLeft: 18 }}>
              <ACLabel size={12} color="rgba(239,233,218,0.72)" style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 4 }}>Running</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, marginTop: 2 }}>{featured.runners}</div>
            </div>
          </div>

          <div style={{
            marginTop: 14, fontSize: 13.5, color: 'rgba(239,233,218,0.78)',
            lineHeight: 1.5, fontStyle: 'italic',
          }}>
            "{featured.kicker}."
          </div>
        </button>

        {/* Category pills — hidden when the user has zero programs */}
        {!isEmpty && (
          <div style={{
            marginTop: 22, display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 2,
          }}>
            {categories.map((cat, i) => (
              <button key={cat} type="button" onClick={() => setSelectedCategory(cat)} style={{
                padding: '8px 14px', borderRadius: 999,
                background: selectedCategory === cat ? c.fg : c.card,
                color: selectedCategory === cat ? c.bg : c.fg,
                fontSize: 12, fontWeight: 600,
                flexShrink: 0,
                border: 'none', cursor: 'pointer',
              }}>{cat}</button>
            ))}
          </div>
        )}

        {/* Programs section */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              {usingMock ? 'Ranked for you' : 'Your routines'}
            </ACLabel>
            {usingMock ? (
              <button
                type="button"
                onClick={() => setShowMatchSheet(true)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>Match ↓</ACLabel>
              </button>
            ) : null}
          </div>

          {isEmpty ? (
            // Empty state — paper-styled placeholder, no fake data.
            <div style={{
              padding: '22px 18px',
              background: c.card,
              borderRadius: ACRadii.card,
              display: 'flex', flexDirection: 'column', gap: 12,
              alignItems: 'flex-start',
            }}>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                No routines yet
              </ACLabel>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
                letterSpacing: -0.5, color: c.fg, lineHeight: 1.2,
              }}>
                No programs yet — pick one from the catalog
              </div>
              <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5 }}>
                Start from a featured system above, or roll your own with the editor.
              </ACLabel>
              {onStartWorkout ? (
                <button
                  type="button"
                  onClick={onStartWorkout}
                  style={{
                    marginTop: 4,
                    padding: '10px 16px',
                    background: c.fg, color: c.bg,
                    borderRadius: 999,
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Start empty workout
                </button>
              ) : null}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredRows.length === 0 ? (
                <div style={{ padding: '18px 0', textAlign: 'center' }}>
                  <ACLabel size={12} color={c.dim}>No programs match "{selectedCategory}"</ACLabel>
                </div>
              ) : filteredRows.map((p, i) => {
                const active = activeProgramId != null && p.id === activeProgramId;
                const handleClick = active && onStartWorkout
                  ? onStartWorkout
                  : (onSelectProgram && p.id != null ? () => onSelectProgram(p.id) : undefined);
                return (
                  <ProgramRow
                    key={p.id ?? i}
                    p={p}
                    idx={i + 1}
                    c={c}
                    active={active}
                    onClick={handleClick}
                    onMatchTap={() => setShowMatchSheet(true)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Build your own */}
        <button
          type="button"
          onClick={onBuildProgram}
          style={{
          marginTop: 20, padding: 18,
          border: `1px dashed ${c.faint}`, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'transparent', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v14M2 9h14" stroke={c.fg} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg }}>Build your own</div>
            <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>
              Splits, cycles, deload weeks — the editor knows the grammar.
            </ACLabel>
          </div>
          <svg width="10" height="12" viewBox="0 0 10 12">
            <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {showTabBar ? <ACTabBar active="workout" dark={dark} HeartMarkComp={HeartMark} /> : null}

      {showMatchSheet ? (
        <MatchSheet dark={dark} c={c} onClose={() => setShowMatchSheet(false)} />
      ) : null}
    </div>
  );
}

export default S24_Library;
