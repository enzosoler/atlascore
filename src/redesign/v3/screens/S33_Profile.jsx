import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACLine, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

const MOCK_STATS = [
  { k: 'PRs', v: '14' },
  { k: 'Sessions', v: '87' },
  { k: 'Crew', v: '5' },
];

const MOCK_LIFTS = [
  { l: 'Deadlift', v: '415', u: 'lb', hi: true },
  { l: 'Squat', v: '325', u: 'lb' },
  { l: 'Bench', v: '275', u: 'lb' },
  { l: 'OHP', v: '165', u: 'lb' },
];

const MOCK_PROGRAM = {
  badge: 'Running',
  title: '5/3/1 BBB · week 7 of 16',
  mark: 'W7',
  total: 16,
  current: 7,
};

const MOCK_COMPOSITION = {
  label: '−2.1 lb · +1.4 LBM',
  weight: '182.4',
  unit: 'lb',
  trend: [184.5,184.1,183.8,183.9,183.4,183.2,182.8,182.6,182.4],
};

const MOCK_RECENT = [
  { t: 'Deadlift PR · 415 lb', d: '4h', hi: true },
  { t: 'Completed Heavy Lower', d: '4h' },
  { t: 'Hit 186g protein', d: 'Yest' },
  { t: 'Ordered Function Q3 panel', d: '3d' },
];

const MOCK_BADGES = ['Slow compounder', '14-day streak', 'e1RM +12% YTD', 'No streaks enabled'];

export default function S33_Profile({
  dark = false,
  showTabBar = true,
  handle = '@marcus',
  profileStatus = 'public',
  initials = 'MK',
  name = 'Marcus Kane',
  joinedLabel = 'joined JAN 24',
  bio = 'Chasing 500. Slow lifter, good sleeper. Measurements over motivation.',
  stats,
  lifts,
  program,
  composition,
  recent,
  badges,
  onGoBack,
  onOpenSettings,
  onOpenProgram,
  onOpenComposition,
}) {
  const c = useACT(dark);
  const statRows = stats === undefined ? MOCK_STATS : stats;
  const liftRows = lifts === undefined ? MOCK_LIFTS : lifts;
  const programCard = program === undefined ? MOCK_PROGRAM : program;
  const compositionCard = composition === undefined ? MOCK_COMPOSITION : composition;
  const recentRows = recent === undefined ? MOCK_RECENT : recent;
  const badgeRows = badges === undefined ? MOCK_BADGES : badges;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onGoBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.1 }}>{handle} · {profileStatus}</ACLabel>
        <button type="button" onClick={onOpenSettings} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="4" height="14" viewBox="0 0 4 14" fill="none">
            <circle cx="2" cy="2" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="7" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="12" r="1.6" fill={c.fg}/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Hero card — inverted, compact */}
        <div style={{ padding: '10px 22px 0' }}>
          <div style={{
            padding: '14px 16px', background: c.fg, color: c.bg,
            borderRadius: ACRadii.card, position: 'relative',
          }}>
            {/* Top row: avatar + name inline */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 999,
                background: c.accent, color: c.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                letterSpacing: -0.5, flexShrink: 0,
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15 }}>
                  {name}
                </div>
                <div style={{ fontFamily: ACFonts.body, fontSize: 11, color: 'rgba(239,233,218,0.6)', marginTop: 2, letterSpacing: 0.1 }}>
                  {handle} · {joinedLabel}
                </div>
              </div>
            </div>
            {bio ? (
              <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(239,233,218,0.72)', lineHeight: 1.45 }}>
                {bio}
              </div>
            ) : null}

            {/* Stats strip — number on top, label underneath */}
            <div style={{
              marginTop: 12, paddingTop: 10,
              borderTop: '1px solid rgba(239,233,218,0.14)',
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            }}>
              {statRows.map((m, i) => (
                <div key={i} style={{
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(239,233,218,0.14)',
                  paddingLeft: i === 0 ? 0 : 14,
                  textAlign: i === 0 ? 'left' : 'left',
                }}>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.1 }}>{m.v}</div>
                  <div style={{ fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600, color: 'rgba(239,233,218,0.5)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>{m.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px 16px' }}>
          {/* Big 4 lifts — hidden entirely when all values are empty/dash */}
          {(() => {
            const hasAnyLiftData = Array.isArray(liftRows) && liftRows.length > 0
              && liftRows.some(lift => lift.v != null && lift.v !== '—' && lift.v !== '-' && lift.v !== '');
            if (!hasAnyLiftData) return null;
            return (
              <>
                <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  The big four
                </ACLabel>
                <div style={{
                  marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                }}>
                  {liftRows.map((lift, i) => (
                    <div key={i} style={{
                      padding: 12, background: c.card, borderRadius: ACRadii.card,
                    }}>
                      <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        {lift.l}
                      </ACLabel>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                        <ACNum size={22} color={lift.hi ? c.accent : c.fg} weight={700}>{lift.v}</ACNum>
                        <span style={{ fontFamily: ACFonts.body, fontSize: 10, color: c.dim }}>{lift.u}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {/* Current program strip */}
          {programCard ? (
            <button type="button" onClick={onOpenProgram} style={{
              marginTop: 12, padding: 12, background: c.card,
              borderRadius: ACRadii.card,
              display: 'flex', alignItems: 'center', gap: 12,
              border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{
                width: 40, height: 40, background: c.fg, color: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: ACFonts.display, fontWeight: 700, fontSize: 14,
                borderRadius: 8,
              }}>{programCard.mark}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.body, letterSpacing: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>{programCard.badge}</ACLabel>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, marginTop: 2 }}>{programCard.title}</div>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: Math.max(1, programCard.total || 1) }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, height: 22,
                    background: i < (programCard.current || 0) ? c.accent : c.faint,
                  }} />
                ))}
              </div>
            </button>
          ) : null}

          {/* Composition mini */}
          {compositionCard ? (
            <button type="button" onClick={onOpenComposition} style={{
              marginTop: 8, padding: 14, background: c.card, borderRadius: ACRadii.card,
              border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Composition · 90d
                </ACLabel>
                <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.body, fontWeight: 700, letterSpacing: 0.1 }}>{compositionCard.label}</ACLabel>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <div>
                  <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.body, letterSpacing: 0.4, textTransform: 'uppercase' }}>Weight</ACLabel>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <ACNum size={22} color={c.fg} weight={700}>{compositionCard.weight}</ACNum>
                    <span style={{ fontFamily: ACFonts.body, fontSize: 9, color: c.dim }}>{compositionCard.unit}</span>
                  </div>
                </div>
                <div style={{ flex: 1, paddingTop: 14 }}>
                  <ACLine w={160} h={40} dark={dark} data={(compositionCard.trend || []).map((v,k)=>({k,v}))} />
                </div>
              </div>
            </button>
          ) : null}

          {/* Recent activity */}
          {Array.isArray(recentRows) && recentRows.length > 0 ? (
            <div style={{ marginTop: 14 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Recent
            </ACLabel>
            <div style={{ marginTop: 8 }}>
              {recentRows.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  <div style={{
                    width: 6, height: 6,
                    background: r.hi ? c.accent : c.mute,
                  }} />
                  <div style={{
                    flex: 1, fontSize: 13, color: c.fg,
                    fontWeight: r.hi ? 600 : 400,
                  }}>{r.t}</div>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.body, letterSpacing: 0.1 }}>{r.d}</ACLabel>
                </div>
              ))}
            </div>
            </div>
          ) : null}

          {/* Cred strip */}
          {Array.isArray(badgeRows) && badgeRows.length > 0 ? (
            <div style={{
              marginTop: 14, padding: 12, border: `1px dashed ${c.faint}`,
              borderRadius: ACRadii.card,
              display: 'flex', gap: 10, flexWrap: 'wrap',
            }}>
            {badgeRows.map(t => (
              <div key={t} style={{
                padding: '5px 10px', fontSize: 10,
                fontFamily: ACFonts.body, letterSpacing: 0.3,
                color: c.dim, border: `1px solid ${c.hair}`,
                borderRadius: 999, textTransform: 'uppercase', fontWeight: 600,
              }}>{t}</div>
            ))}
            </div>
          ) : null}
        </div>
      </div>

      {showTabBar ? <ACTabBar active="you" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}
