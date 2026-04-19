import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBrandMark, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function S19_Settings({
  dark = false,
  versionLabel = 'v 2.4.1',
  groups,
  onOpenRow,
  onSignOut,
}) {
  const c = useACT(dark);
  const groupRows = groups || [
    {
      l: 'Account',
      rows: [
        { k: 'profile',  t: 'Marcus Kane',   d: 'marcus@kane.co · member since Jan 24', chevron: true, avatar: true },
        { k: 'plan',     t: 'Core · annual', d: '$120 / year · renews 14 Jan 26',       chevron: true, chip: 'Pro' },
      ],
    },
    {
      l: 'Integrations',
      rows: [
        { k: 'hk',   t: 'Apple Health',    d: 'Read/write · syncing',         chevron: true, dot: 'on' },
        { k: 'oura', t: 'Oura ring',       d: 'Gen 4 · syncing',              chevron: true, dot: 'on' },
        { k: 'func', t: 'Function Health', d: '2 panels synced · Q2 pending', chevron: true, dot: 'on' },
        { k: 'gcal', t: 'Google Calendar', d: 'Not connected',                chevron: true, dot: 'off' },
      ],
    },
    {
      l: 'Preferences',
      rows: [
        { k: 'units',    t: 'Units',           d: 'Imperial · lb, in, °F',       chevron: true },
        { k: 'goals',    t: 'Daily targets',   d: '2,380 kcal · 186g protein',    chevron: true },
        { k: 'theme',    t: 'Appearance',      d: 'Auto · follows system',        chevron: true },
        { k: 'notifs',   t: 'Notifications',   d: '4 types active',               chevron: true },
      ],
    },
    {
      l: 'Data & privacy',
      rows: [
        { k: 'export',  t: 'Export data',      d: 'CSV · JSON · all time',        chevron: true },
        { k: 'photos',  t: 'Progress photos',  d: 'On-device only',               chevron: true, chip: 'Local' },
        { k: 'delete',  t: 'Delete all data',  d: 'Irreversible',                 chevron: true, danger: true },
      ],
    },
  ];
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase' }}>Settings</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            The system
          </div>
        </div>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{versionLabel}</ACLabel>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {groupRows.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 26 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginLeft: 2 }}>
              {g.l}
            </ACLabel>
            <div style={{
              marginTop: 10, background: c.card, borderRadius: ACRadii.card, overflow: 'hidden',
            }}>
              {g.rows.map((r, i) => (
                <button key={r.k} type="button" onClick={() => { if (!r.muted) onOpenRow?.(r.k); }} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                  width: '100%', textAlign: 'left', background: 'transparent', borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                  cursor: r.muted ? 'default' : 'pointer',
                  opacity: r.muted ? 0.45 : 1,
                }}>
                  {r.avatar && (
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: c.fg, color: c.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
                    }}>MK</div>
                  )}
                  {r.dot && (
                    <div style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: r.dot === 'on' ? c.accent : c.mute,
                      flexShrink: 0,
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 15, fontWeight: 500,
                      color: r.danger ? '#e85a2f' : c.fg,
                    }}>
                      {r.t}
                      {r.chip && (
                        <span style={{
                          padding: '2px 7px', fontSize: 9, fontWeight: 700,
                          letterSpacing: 0.5, textTransform: 'uppercase',
                          background: c.accent, color: c.ink, borderRadius: 4,
                        }}>{r.chip}</span>
                      )}
                    </div>
                    <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.d}</ACLabel>
                  </div>
                  {r.chevron && (
                    <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
                      <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{
          textAlign: 'center', padding: '22px 0 8px',
        }}>
          <button type="button" onClick={onSignOut} style={{
            display: 'inline-block', padding: '10px 20px',
            border: `1px solid ${c.faint}`, borderRadius: 999,
            fontSize: 13, fontWeight: 600, color: c.dim,
            background: 'transparent', cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <ACBrandMark dark={dark} size={14} HeartMarkComp={HeartMark} />
          <div style={{
            marginTop: 8, fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600, color: c.mute, letterSpacing: 0.1,
          }}>
            Built for people who measure.
          </div>
        </div>
      </div>
    </div>
  );
}

export default S19_Settings;
