import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel,
} from '../lib/paper.jsx';

export default function S35_Search({
  dark = false,
  query = 'deadlift',
  scopes,
  activeScope = 'All',
  topMatch,
  groups,
  prompts,
  onBack,
  onPickScope,
  onOpenResult,
  onOpenPrompt,
}) {
  const c = useACT(dark);
  const resolvedScopes = scopes || ['All', 'Lifts', 'Foods', 'Labs', 'Programs', 'People'];
  const resolvedTopMatch = topMatch || {
    label: 'Top match · Lift',
    title: 'Deadlift',
    meta: 'COMPOUND · HINGE · 415 LB PR',
  };
  const resolvedGroups = groups || [
    {
      cat: 'LIFTS · 4',
      rows: [
        { t: 'Deficit deadlift', sub: 'Variant · 355 lb PR' },
        { t: 'Romanian deadlift', sub: 'Variant · 275 lb × 8' },
        { t: 'Trap bar deadlift', sub: 'Alt pattern · never logged' },
        { t: 'Snatch-grip deadlift', sub: 'Variant · 315 lb × 5' },
      ],
    },
    {
      cat: 'PROGRAMS · 3',
      rows: [
        { t: '5/3/1 BBB', sub: 'Deadlift day · W7 running' },
        { t: 'nSuns 531 LP', sub: 'Deadlift T1 block' },
        { t: 'Conjugate · Westside', sub: 'Max-effort lower' },
      ],
    },
  ];
  const resolvedPrompts = prompts || [
    "How's my deadlift progressing vs last block?",
    'When should I test a 1RM deadlift?',
    'Compare my deadlift to my squat ratio',
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Search bar at top */}
      <div style={{ padding: '14px 22px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              width: 30, height: 30, borderRadius: 999, border: 'none',
              background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: onBack ? 'pointer' : 'default',
            }}
            aria-label="Back"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M6.5 1.4L2.5 5l4 3.6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
            Search
          </ACLabel>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: c.card,
          borderRadius: 14,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke={c.dim} strokeWidth="1.8"/>
            <path d="M11 11l3.5 3.5" stroke={c.dim} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div style={{ flex: 1, fontSize: 15, color: c.fg, letterSpacing: -0.2, fontWeight: 500 }}>
            {query}
            <span style={{ display: 'inline-block', width: 1.5, height: 14, background: c.accent, marginLeft: 2, verticalAlign: 'middle' }} />
          </div>
          <div style={{
            padding: '3px 8px', fontSize: 10, fontWeight: 700,
            color: c.dim, background: c.faint, borderRadius: 4,
            letterSpacing: 0.3, fontFamily: ACFonts.mono,
          }}>⌘K</div>
        </div>

        {/* Scope chips */}
        <div style={{
          marginTop: 10, display: 'flex', gap: 6, overflow: 'auto',
        }}>
          {resolvedScopes.map((s) => (
            <button key={s} type="button" onClick={() => onPickScope?.(s)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: activeScope === s ? c.fg : 'transparent',
              border: activeScope === s ? 'none' : `1px solid ${c.hair}`,
              color: activeScope === s ? c.bg : c.dim,
              fontSize: 11, fontWeight: 600,
              flexShrink: 0, letterSpacing: -0.1,
              cursor: onPickScope ? 'pointer' : 'default',
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 22px 20px' }}>
        {/* Best match hero */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          {resolvedTopMatch.label}
        </ACLabel>
        <button type="button" onClick={() => onOpenResult?.(resolvedTopMatch)} style={{
          marginTop: 10, padding: 18, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 14,
          border: 'none', width: '100%', textAlign: 'left', cursor: onOpenResult ? 'pointer' : 'default',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 6,
            border: `1.5px solid ${c.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="12.5" width="22" height="3" fill={c.accent}/>
              <rect x="5" y="8" width="3" height="12" fill={c.accent}/>
              <rect x="20" y="8" width="3" height="12" fill={c.accent}/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
              {resolvedTopMatch.title}
            </div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(239,233,218,0.55)', marginTop: 3, letterSpacing: 0.3 }}>
              {resolvedTopMatch.meta}
            </div>
          </div>
          <svg width="10" height="12" viewBox="0 0 10 12">
            <path d="M2 1l5 5-5 5" stroke={c.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Grouped results */}
        {resolvedGroups.map((g, gi) => (
          <div key={gi} style={{ marginTop: 22 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              {g.cat}
            </ACLabel>
            <div style={{ marginTop: 8 }}>
              {g.rows.map((r, i) => (
                <button key={i} type="button" onClick={() => onOpenResult?.(r)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 2px',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                  width: '100%', background: 'transparent', borderRight: 'none', borderLeft: 'none', textAlign: 'left',
                  cursor: onOpenResult ? 'pointer' : 'default',
                }}>
                  <div style={{
                    width: 6, height: 6, flexShrink: 0,
                    background: r.hi ? c.accent : c.mute,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, color: c.fg, letterSpacing: -0.2,
                      fontWeight: r.hi ? 600 : 500,
                    }}>
                      {r.t.split(/(deadlift)/i).map((part, pi) =>
                        /^deadlift$/i.test(part)
                          ? <mark key={pi} style={{ background: 'transparent', color: c.accent, fontWeight: 700 }}>{part}</mark>
                          : <span key={pi}>{part}</span>
                      )}
                    </div>
                    <ACLabel size={11} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{r.sub}</ACLabel>
                  </div>
                  <svg width="8" height="10" viewBox="0 0 8 10">
                    <path d="M1 1l4 4-4 4" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Quick actions */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Try asking coach
          </ACLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {resolvedPrompts.map(q => (
              <button key={q} type="button" onClick={() => onOpenPrompt?.(q)} style={{
                padding: '10px 14px', background: c.card,
                borderRadius: 12, fontSize: 13, color: c.fg,
                letterSpacing: -0.2, display: 'flex', alignItems: 'center', gap: 8,
                border: 'none', width: '100%', textAlign: 'left', cursor: onOpenPrompt ? 'pointer' : 'default',
              }}>
                <div style={{
                  width: 3, height: 18, background: c.accent,
                }} />
                {q.split(/(deadlift|squat)/i).map((part, pi) =>
                  /^(deadlift|squat)$/i.test(part)
                    ? <mark key={pi} style={{ background: 'transparent', color: c.accent, fontWeight: 700 }}>{part}</mark>
                    : <span key={pi}>{part}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
