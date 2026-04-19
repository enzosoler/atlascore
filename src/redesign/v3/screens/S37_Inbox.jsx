import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

const DEMO_ITEMS = [
  { t: 'coach', when: '06:41', title: 'Readiness held at 87', body: 'Sleep was good, HRV top-band. Heavy Lower is on the plan — pull when you are ready.', cta: 'Open today', hi: true },
  { t: 'plan',  when: '12:00', title: 'Protein · 64g of 186', body: 'Track to land the target. Suggest 8oz chicken or a FairLife bottle next.', cta: 'Log fuel' },
  { t: 'labs',  when: '09:14', title: 'Your Q3 panel arrived', body: '18 markers. 15 optimal, 2 elevated (ApoB, LDL-P), 1 borderline. Tap to read.', cta: 'Open labs', hi: true },
  { t: 'crew',  when: '08:02', title: 'Mara hit 315 squat',     body: 'Third session of the week. She added a note: "felt grippy."', cta: 'Send kudos' },
  { t: 'rest',  when: 'Yest',  title: 'Rescheduled Heavy Pull', body: 'HRV dropped on Wed. Moved to Sat. Keep Thu mobility as planned.' },
  { t: 'bill',  when: 'Mon',   title: 'Receipt · Core $12',     body: 'Your monthly subscription renewed.' },
];

/**
 * S37_Inbox — notifications / coach inbox.
 *
 * Gallery:    <S37_Inbox dark />
 * Production: <S37_Inbox dark items={[...]} onOpenItem={fn} onMarkAllRead={fn} onCompose={fn} />
 */
function S37_Inbox({
  dark = false,
  items,
  onOpenItem,
  onMarkAllRead,
  onCompose,
  showTabBar = false,
}) {
  const c = useACT(dark);
  const _items = items || DEMO_ITEMS;

  const typeCol = (t) => ({
    coach: c.accent, labs: c.accent, plan: c.fg,
    crew: c.fg, rest: c.mute, bill: c.mute,
  })[t] || c.fg;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onCompose} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8M6 2v8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Inbox · {_items.length} new
        </ACLabel>
        <button type="button" onClick={onMarkAllRead} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke={c.fg} strokeWidth="1.4" fill="none" />
            <path d="M5 7l1.5 1.5L9 5.5" stroke={c.fg} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ padding: '18px 22px 12px' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1, color: c.fg,
        }}>
          Today's<br/>
          <span style={{ color: c.accent }}>signals.</span>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, marginTop: 8, display: 'block' }}>
          We don't remind you to open the app. We tell you when something matters.
        </ACLabel>
      </div>

      {/* filter chips */}
      <div style={{ padding: '2px 22px 0', display: 'flex', gap: 6, overflow: 'auto' }}>
        {['All', 'Coach', 'Plan', 'Labs', 'Crew', 'Billing'].map((s, i) => (
          <div key={s} style={{
            padding: '6px 12px', borderRadius: 999,
            background: i === 0 ? c.fg : 'transparent',
            border: i === 0 ? 'none' : `1px solid ${c.hair}`,
            color: i === 0 ? c.bg : c.dim,
            fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>{s}</div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 22px 20px' }}>
        {_items.map((it, i) => (
          <button key={i} type="button" onClick={() => onOpenItem?.(it)} style={{
            display: 'flex', gap: 12, padding: '14px 0', width: '100%', textAlign: 'left',
            opacity: it.t === 'bill' ? 0.72 : 1,
            background: 'transparent',
            border: 'none',
            borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
            borderBottom: `1px solid ${c.hair}`,
            cursor: 'pointer',
          }}>
            <div style={{ width: 46, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: 3, height: 20, background: typeCol(it.t) }} />
              <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, marginTop: 8, textTransform: 'uppercase' }}>
                {it.when}
              </ACLabel>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <ACLabel size={9} color={typeCol(it.t)} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                  {it.t}
                </ACLabel>
                {it.hi && (
                  <div style={{
                    padding: '1px 6px', fontSize: 9,
                    fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.4,
                    background: c.accent, color: c.ink,
                  }}>NEW</div>
                )}
              </div>
              <div style={{ marginTop: 5, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2, lineHeight: 1.3 }}>
                {it.title}
              </div>
              <div style={{ marginTop: 4, fontSize: 12.5, color: c.dim, lineHeight: 1.45 }}>
                {it.body}
              </div>
              {it.cta && (
                <div style={{
                  marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
                  color: c.accent, letterSpacing: 0.5, textTransform: 'uppercase',
                }}>
                  {it.cta}
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1l6 6M7 1v6H1" stroke={c.accent} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
                </div>
              )}
            </div>
          </button>
        ))}
        <div style={{
          marginTop: 22, textAlign: 'center',
          fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 0.5,
        }}>
          No streak. No guilt. Just signals.
        </div>
      </div>

      {showTabBar && <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} />}
    </div>
  );
}

export default S37_Inbox;
