import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function CameraIconSolid({ color = '#000' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6a2 2 0 0 1 2-2h1.5L8 2h4l1.5 2H15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"
        stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="10" cy="10.5" r="3" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

function CompareTile({ label, c, dark, dim }) {
  return (
    <div style={{
      flex: 1, aspectRatio: '3/4',
      background: dim ? (dark ? '#0f0d0a' : '#d8cfb8') : c.fg,
      borderRadius: ACRadii.input,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Silhouette hint */}
      <svg width="100%" height="100%" viewBox="0 0 100 140" fill="none"
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx="50" cy="30" r="12"
          fill={dim ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.22)'} />
        <path d="M34 42 L66 42 L62 88 L50 94 L38 88 Z"
          fill={dim ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.22)'} />
        <path d="M34 42 L26 82 L30 84 L38 48 Z"
          fill={dim ? 'rgba(10,10,10,0.12)' : 'rgba(239,233,218,0.18)'} />
        <path d="M66 42 L74 82 L70 84 L62 48 Z"
          fill={dim ? 'rgba(10,10,10,0.12)' : 'rgba(239,233,218,0.18)'} />
        <path d="M40 92 L36 138 L46 140 L50 100 Z"
          fill={dim ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.22)'} />
        <path d="M60 92 L64 138 L54 140 L50 100 Z"
          fill={dim ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.22)'} />
      </svg>
      <div style={{
        position: 'relative', padding: 10,
        background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)',
      }}>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: '#fff', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function PhotoCard({ m, c, dark }) {
  return (
    <div style={{
      aspectRatio: '3/4',
      background: c.fg,
      borderRadius: ACRadii.card,
      position: 'relative', overflow: 'hidden',
      border: m.latest ? `2px solid ${c.accent}` : 'none',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 140" fill="none"
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx="50" cy="30" r="12" fill="rgba(239,233,218,0.22)" />
        <path d="M34 42 L66 42 L62 88 L50 94 L38 88 Z" fill="rgba(239,233,218,0.22)" />
        <path d="M34 42 L26 82 L30 84 L38 48 Z" fill="rgba(239,233,218,0.18)" />
        <path d="M66 42 L74 82 L70 84 L62 48 Z" fill="rgba(239,233,218,0.18)" />
        <path d="M40 92 L36 138 L46 140 L50 100 Z" fill="rgba(239,233,218,0.22)" />
        <path d="M60 92 L64 138 L54 140 L50 100 Z" fill="rgba(239,233,218,0.22)" />
      </svg>
      {m.latest && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          padding: '3px 8px', background: c.accent, color: c.ink,
          fontSize: 9, fontWeight: 700, letterSpacing: 0.3, borderRadius: 4,
          textTransform: 'uppercase',
        }}>Latest</div>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 10,
        background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
      }}>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: '#fff', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {m.m}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
          {m.w} lb · {m.bf}% BF
        </div>
      </div>
    </div>
  );
}

function S18_Progress_Photos({
  dark = false,
  photos,
  onTakePhoto,
  onOpenPhoto,
  showTabBar = false,
}) {
  const c = useACT(dark);
  const defaultMonths = [
    { m: 'Apr 18', w: '182.4', bf: '17.2', latest: true },
    { m: 'Mar 18', w: '184.8', bf: '18.0' },
    { m: 'Feb 18', w: '186.2', bf: '18.5' },
    { m: 'Jan 18', w: '188.4', bf: '19.2' },
    { m: 'Dec 18', w: '189.0', bf: '19.4' },
    { m: 'Nov 18', w: '188.2', bf: '19.0' },
  ];
  const monthRows = photos === undefined ? defaultMonths : photos;
  const isEmpty = Array.isArray(monthRows) && monthRows.length === 0;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Progress · photos</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            6 months
          </div>
        </div>
        <button type="button" onClick={onTakePhoto} style={{
          width: 38, height: 38, borderRadius: 999, background: c.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <CameraIconSolid color={c.ink} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {isEmpty ? (
          <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>
              No progress photos yet.
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: c.dim, lineHeight: 1.55 }}>
              Take your first front, side, or back photo to unlock visual comparisons over time.
            </div>
            <button type="button" onClick={onTakePhoto} style={{ marginTop: 14, padding: '10px 16px', borderRadius: 999, border: 'none', background: c.fg, color: c.bg, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Take photo →
            </button>
          </div>
        ) : (
          <>
            {/* Compare strip */}
            <div style={{ padding: 14, background: c.card, borderRadius: ACRadii.card }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <ACLabel size={12} color={c.dim}>Nov → Apr</ACLabel>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>−5.8 lb · −1.8% BF</ACLabel>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <CompareTile label="Nov 18" c={c} dark={dark} dim />
                <div style={{
                  alignSelf: 'center',
                  fontFamily: ACFonts.mono, fontSize: 18, color: c.accent, fontWeight: 700,
                }}>→</div>
                <CompareTile label="Apr 18" c={c} dark={dark} />
              </div>
            </div>

            {/* Grid */}
            <div style={{ marginTop: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <ACLabel size={12} color={c.dim}>All months · {monthRows.length}</ACLabel>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>Front view</ACLabel>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {monthRows.map((m, i) => (
                  <button key={i} type="button" onClick={() => onOpenPhoto?.(m.id || i)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                    <PhotoCard m={m} c={c} dark={dark} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{
          marginTop: 22, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
            Photos stay on-device. Never leave your phone without your permission.
          </ACLabel>
        </div>
      </div>

      {showTabBar ? <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S18_Progress_Photos;
