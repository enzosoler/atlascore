import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function CrewRow({ p, rank, c, onMessage }) {
  const valueKey = 'prs';
  const val = p[valueKey];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', marginTop: 4,
      background: p.isMe ? c.card : 'transparent',
      borderRadius: p.isMe ? ACRadii.card : 0,
      borderLeft: p.isMe ? `3px solid ${c.accent}` : 'none',
      paddingLeft: p.isMe ? 11 : 14,
    }}>
      <div style={{
        width: 22, textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
        color: rank === 1 ? c.accent : c.mute,
        letterSpacing: 0.5,
      }}>{String(rank).padStart(2, '0')}</div>
      <div style={{
        width: 34, height: 34, borderRadius: 999,
        background: p.top ? c.accent : (p.isMe ? c.fg : c.card),
        color: p.top ? c.ink : (p.isMe ? c.bg : c.fg),
        border: p.isMe ? 'none' : `1px solid ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
        flexShrink: 0,
      }}>{p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 600, color: c.fg,
          letterSpacing: -0.2,
        }}>{p.name}</div>
        <div style={{
          marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {p.tonnes}t · {p.streak}d streak
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div>
          <ACNum size={22} color={rank === 1 ? c.accent : c.fg} weight={700}>{val}</ACNum>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.5 }}>PRS</div>
        </div>
        <button type="button" onClick={() => { if (typeof onMessage === 'function') onMessage({ to: p.id, name: p.name }); }} style={{ padding: '6px 8px', fontSize: 11, borderRadius: 8, border: 'none', background: c.accent, color: c.ink, cursor: 'pointer' }}>Message</button>
      </div>
    </div>
  );
}

function S28_Crew({ dark = false, onInvite, onMessage }) {
  const c = useACT(dark);
  const me = { id: 'mk', name: 'You',      initials: 'MK', prs: 3, tonnes: 52, streak: 14, isMe: true };
  const crew = [
    { id: 'jk', name: 'Jordan K.',  initials: 'JK', prs: 4, tonnes: 58, streak: 22, top: true },
    me,
    { id: 'lr', name: 'Lin R.',     initials: 'LR', prs: 2, tonnes: 44, streak: 9 },
    { id: 'ss', name: 'Sam S.',     initials: 'SS', prs: 2, tonnes: 41, streak: 18 },
    { id: 'mo', name: 'Marcos O.',  initials: 'MO', prs: 1, tonnes: 38, streak: 6 },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Your crew · 5</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Training together
          </div>
        </div>
        <button type="button" onClick={() => { if (typeof onInvite === 'function') onInvite({ source: 'crew', crewCount: crew.length }); }} style={{
          width: 34, height: 34, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke={c.fg} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Week headline */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            This week · together
          </ACLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16, gap: 0 }}>
            {[
              { k: 'PRs',     v: '12' },
              { k: 'Tonnes',  v: '233' },
              { k: 'Sessions',v: '28' },
            ].map((m, i) => (
              <div key={i} style={{
                borderLeft: i === 0 ? 'none' : '1px solid rgba(239,233,218,0.14)',
                paddingLeft: i === 0 ? 0 : 14,
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1, marginTop: 4 }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, fontSize: 13, color: 'rgba(239,233,218,0.7)',
            lineHeight: 1.5,
          }}>
            Your crew moved more total weight this week than any week since Jan. Jordan led with 4 new PRs.
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          marginTop: 18, padding: 4, display: 'flex', gap: 2,
          background: c.card, borderRadius: 10,
        }}>
          {['PRs', 'Tonnes', 'Streak'].map((t, i) => (
            <div key={t} style={{
              flex: 1, padding: '8px 0', textAlign: 'center',
              background: i === 0 ? c.fg : 'transparent',
              color: i === 0 ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600, borderRadius: 7,
            }}>{t}</div>
          ))}
        </div>

        {/* Leaderboard */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
          {crew.map((p, i) => (
            <CrewRow key={p.id} p={p} rank={i + 1} c={c} onMessage={onMessage} />
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Crew feed · this week
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              { who: 'Jordan K.',  did: 'pulled 500 lb', when: '2h',  hot: true },
              { who: 'Lin R.',     did: 'hit 200 on bench · 40-lb jump from last cycle', when: 'Yest' },
              { who: 'Sam S.',     did: 'completed week 8 of 5/3/1',                     when: '2d' },
              { who: 'You',        did: 'pulled 415 lb',                                 when: '4h', mine: true },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: f.mine ? c.accent : c.fg,
                  color: f.mine ? c.ink : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: ACFonts.display, fontSize: 10, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {f.who.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600 }}>{f.who}</span>
                    <span style={{ color: c.dim }}> {f.did}</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
                    color: c.mute, letterSpacing: 0.3,
                  }}>
                    <span>{f.when}</span>
                    {f.hot && (
                      <>
                        <span>·</span>
                        <span style={{ color: c.accent, fontWeight: 700 }}>ALL-TIME BEST</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 18, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
            Crews are collaborative, not competitive. No public leaderboards. No follower counts.
          </ACLabel>
        </div>
      </div>

      <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S28_Crew;
