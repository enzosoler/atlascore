import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function DayRow({ d, c, first, onSelect, onOpenSession }) {
  const isRest = d.status === 'rest';
  const isShifted = d.status === 'shifted';
  const isToday = d.today;
  return (
    <div role="button" onClick={() => {
      if (typeof onSelect === 'function') onSelect({ date: d.date, type: d.type, status: d.status });
      if (d.status !== 'rest' && typeof onOpenSession === 'function') onOpenSession({ date: d.date });
    }} style={{
      display: 'flex', alignItems: 'stretch', gap: 14,
      padding: '14px 0',
      borderTop: first ? 'none' : `1px solid ${c.hair}`,
      cursor: 'pointer',
    }}>
      {/* Day column */}
      <div style={{
        width: 46, flexShrink: 0, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <ACLabel size={9} color={c.mute} style={{
          fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase',
        }}>{d.date.split(' ')[0]}</ACLabel>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isToday ? c.accent : (isRest ? 'transparent' : c.card),
          border: isRest ? `1px dashed ${c.faint}` : 'none',
          color: isToday ? c.ink : c.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
        }}>{d.date.split(' ')[1]}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            fontSize: 15.5, fontWeight: 600, color: isRest ? c.mute : c.fg,
            letterSpacing: -0.2,
          }}>
            {d.type}
          </div>
          {isToday && (
            <div style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: c.accent, color: c.ink, borderRadius: 4,
            }}>Today</div>
          )}
          {isShifted && (
            <div style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: 'transparent', color: c.accent,
              border: `1px solid ${c.accent}`, borderRadius: 4,
            }}>Shifted</div>
          )}
        </div>
        <div style={{
          marginTop: 4, display: 'flex', gap: 10, alignItems: 'center',
          fontFamily: ACFonts.mono, fontSize: 10.5, color: c.dim, letterSpacing: 0.3,
        }}>
          {d.vol && <span>{d.vol}</span>}
          {d.duration && <><span>·</span><span>{d.duration}</span></>}
          {d.read !== null && d.read !== undefined && <><span>·</span><span>Readiness {d.read}</span></>}
          {d.shift && <><span>·</span><span style={{ color: c.accent }}>{d.shift}</span></>}
        </div>
      </div>

      {/* Status glyph */}
      <div style={{
        width: 28, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isRest ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12" stroke={c.mute} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12">
            <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

/**
 * S26_Calendar — workout history as a week calendar.
 *
 * Gallery:    <S26_Calendar dark />
 * Production: <S26_Calendar dark onBack={fn} onOpenSession={fn} onStartWorkout={fn} />
 */
function S26_Calendar({ dark = false, onBack, onOpenSession, onStartWorkout, onSelectDate, onAddSession }) {
  const c = useACT(dark);
  const days = [
    { date: 'Sat 18', today: true,  type: 'Heavy Lower', vol: 'High',   read: 87, status: 'today', duration: '58m' },
    { date: 'Sun 19', type: 'Recovery',    vol: 'Rest',   read: null, status: 'rest' },
    { date: 'Mon 20', type: 'Upper push',  vol: 'Mod',    read: 78, status: 'upcoming', duration: '52m' },
    { date: 'Tue 21', type: 'Conditioning',vol: 'Low',    read: 72, status: 'upcoming', duration: '28m' },
    { date: 'Wed 22', type: 'Heavy Pull',  vol: 'High',   read: 74, status: 'shifted', shift: 'moved 1d later' },
    { date: 'Thu 23', type: 'Recovery',    vol: 'Rest',   read: null, status: 'rest' },
    { date: 'Fri 24', type: 'Full body',   vol: 'Mod',    read: 80, status: 'upcoming', duration: '45m' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Plan · week 07 of 16</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Apr 18 — 24
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: c.card, borderRadius: 10 }}>
            {['W', 'M'].map((r, i) => (
              <div key={r} style={{
                padding: '6px 12px', borderRadius: 7,
                background: i === 0 ? c.fg : 'transparent',
                color: i === 0 ? c.bg : c.dim,
                fontSize: 12, fontWeight: 600,
              }}>{r}</div>
            ))}
          </div>
          <button type="button" onClick={() => {
            if (typeof onAddSession === 'function') onAddSession({ weekStart: 'Apr 18', weekEnd: 'Apr 24' });
          }} style={{
            padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: c.accent, color: c.ink, fontWeight: 700, fontSize: 12
          }}>Add</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Week summary */}
        <div style={{
          padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <ACLabel size={11} color={c.dim}>Week · volume distribution</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>On track</ACLabel>
          </div>
          <div style={{ display: 'flex', gap: 3, height: 40, alignItems: 'flex-end' }}>
            {[75, 0, 55, 30, 80, 0, 50].map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%', height: v > 0 ? `${v}%` : 2,
                  background: i === 0 ? c.accent : v === 0 ? c.faint : c.fg,
                  opacity: v === 0 ? 0.3 : 1,
                  borderRadius: 2,
                }} />
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 6, display: 'flex', gap: 3,
          }}>
            {['S', 'S', 'M', 'T', 'W', 'T', 'F'].map((l, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                fontFamily: ACFonts.mono, fontSize: 9,
                color: i === 0 ? c.accent : c.mute, fontWeight: 600,
                letterSpacing: 0.5,
              }}>{l}</div>
            ))}
          </div>
        </div>

        {/* Day list */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column' }}>
          {days.map((d, i) => (
            <DayRow key={i} d={d} c={c} first={i === 0}
              onSelect={(payload) => { if (typeof onSelectDate === 'function') onSelectDate(payload); }}
              onOpenSession={onOpenSession}
            />
          ))}
        </div>

        {/* Reschedule note */}
        <div style={{
          marginTop: 18, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Auto-reschedule
          </ACLabel>
          <div style={{
            marginTop: 6, fontSize: 13.5, color: c.fg, lineHeight: 1.5,
          }}>
            Wed's Heavy Pull moved to Thu. Your readiness trended low from back-to-back high-volume days — we gave you a recovery buffer.
          </div>
          <div style={{
            marginTop: 10, display: 'flex', gap: 8,
          }}>
            <div style={{
              padding: '6px 12px', background: c.fg, color: c.bg,
              fontSize: 11, fontWeight: 600, borderRadius: 999,
            }}>Accept</div>
            <div style={{
              padding: '6px 12px', border: `1px solid ${c.faint}`,
              fontSize: 11, fontWeight: 600, color: c.fg, borderRadius: 999,
            }}>Keep original</div>
          </div>
        </div>
      </div>

      <ACTabBar active="workout" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S26_Calendar;
