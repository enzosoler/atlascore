import React from 'react';
import {
  ACFonts, useACT,
  ACLabel, ACBtn, ACSpark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function ShareBtn({ c, label, icon }) {
  const icons = {
    download: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    ig: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke={c.fg} strokeWidth="1.6"/><circle cx="8" cy="8" r="2.5" stroke={c.fg} strokeWidth="1.6"/><circle cx="11.5" cy="4.5" r="0.7" fill={c.fg}/></svg>,
    link: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 10L10 6M5 9a2.5 2.5 0 0 1 0-3.5l2-2a2.5 2.5 0 0 1 3.5 3.5l-1 1M11 7a2.5 2.5 0 0 1 0 3.5l-2 2a2.5 2.5 0 0 1-3.5-3.5l1-1" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  };
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 999,
      background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icons[icon]}
    </div>
  );
}

function S21_Share_Card({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Share PR</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, padding: '18px 22px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* The card itself — 9:16 phoneshot aspect */}
        <div style={{
          background: c.ink, color: '#efe9da',
          borderRadius: 22,
          aspectRatio: '9/12',
          padding: 24,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* watermark brand */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HeartMark size={14} color="#efe9da" accent={c.accent} />
              <span style={{
                fontFamily: ACFonts.brand, fontSize: 11, color: '#efe9da',
                letterSpacing: -0.4, textTransform: 'lowercase',
              }}>
                atlas<span style={{ color: c.accent }}>.</span>core
              </span>
            </div>
            <ACLabel size={9} color="rgba(239,233,218,0.5)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              18 APR 26
            </ACLabel>
          </div>

          {/* kicker */}
          <div style={{ marginTop: 24 }}>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
              Personal record · lift 014
            </ACLabel>
          </div>

          {/* big display */}
          <div style={{
            fontFamily: ACFonts.display, fontSize: 36, fontWeight: 700,
            letterSpacing: -1.4, lineHeight: 1, marginTop: 10,
          }}>
            Deadlift.
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            marginTop: 14,
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 140, fontWeight: 700,
              letterSpacing: -6, lineHeight: 0.82, color: '#efe9da',
              fontVariantNumeric: 'tabular-nums',
            }}>
              415
            </div>
            <div style={{ paddingBottom: 10, lineHeight: 1 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 13, color: c.accent, fontWeight: 700 }}>LB</div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: 'rgba(239,233,218,0.6)', marginTop: 3 }}>× 1</div>
            </div>
          </div>

          <div style={{
            marginTop: 4, fontFamily: ACFonts.mono, fontSize: 11,
            color: c.accent, fontWeight: 700, letterSpacing: 0.5,
          }}>
            +10 LB · 58 DAYS
          </div>

          {/* ECG divider */}
          <div style={{ marginTop: 18 }}>
            <ACSpark w={260} h={22} dark={true} color={c.accent} stroke={1.8} />
          </div>

          <div style={{ flex: 1 }} />

          {/* footer meta — grid of context */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0, paddingTop: 16,
            borderTop: '1px solid rgba(239,233,218,0.14)',
          }}>
            {[
              { k: 'e1RM',    v: '415' },
              { k: 'RPE',     v: '9.0' },
              { k: 'BODYWT',  v: '182' },
            ].map((m, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 12,
                borderLeft: i === 0 ? 'none' : '1px solid rgba(239,233,218,0.14)',
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle row */}
        <div style={{
          display: 'flex', gap: 6, padding: 4,
          background: c.card, borderRadius: 12,
        }}>
          {[
            { l: 'Dark', on: true },
            { l: 'Light', on: false },
            { l: 'Minimal', on: false },
          ].map((t, i) => (
            <div key={i} style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: t.on ? c.fg : 'transparent',
              color: t.on ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600, borderRadius: 8,
            }}>{t.l}</div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div style={{
        padding: '12px 22px 22px',
        display: 'flex', gap: 8,
      }}>
        <ShareBtn c={c} label="Save" icon="download" />
        <ShareBtn c={c} label="Stories" icon="ig" />
        <ShareBtn c={c} label="Copy link" icon="link" />
        <div style={{ flex: 1 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Share →</ACBtn>
        </div>
      </div>
    </div>
  );
}

export default S21_Share_Card;
