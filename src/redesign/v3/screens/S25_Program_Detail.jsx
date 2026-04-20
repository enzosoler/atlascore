import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn,
} from '../lib/paper.jsx';

/**
 * S25_Program_Detail — program deep-dive with stats, adaptations, wave structure.
 *
 * Gallery:    <S25_Program_Detail dark />
 * Production: <S25_Program_Detail dark programCode="PROGRAM 014"
 *               matchLabel="86% match" title="5/3/1 BBB" accentWord="BBB"
 *               meta="BY JIM WENDLER · 16 WK · 4 D/WK" description="..."
 *               stats={[{k,v},...]} adaptations={[{lift,now,proj,unit},...]}
 *               waves={[{n,tag,pct,sets},...]}
 *               crewAvatars={['JK','MR','LA','SO']} crewCount={4} crewGain="+28 lb on squat"
 *               onBack={fn} onSave={fn} onPreviewWeek={fn} onStartProgram={fn} />
 */

const DEMO_STATS = [
  { k: 'Weeks',    v: '16' },
  { k: 'Days/wk',  v: '4' },
  { k: 'Sets/sess', v: '28' },
  { k: 'Runners',  v: '12.4k' },
];

const DEMO_ADAPTATIONS = [
  { lift: 'Squat',    now: 325, proj: 355, unit: 'lb' },
  { lift: 'Bench',    now: 275, proj: 295, unit: 'lb' },
  { lift: 'Deadlift', now: 415, proj: 445, unit: 'lb' },
  { lift: 'OHP',      now: 165, proj: 180, unit: 'lb' },
];

const DEMO_WAVES = [
  { n: 1, tag: '5s week', pct: '65/75/85', sets: '×5' },
  { n: 2, tag: '3s week', pct: '70/80/90', sets: '×3' },
  { n: 3, tag: '1s week', pct: '75/85/95', sets: '×1+' },
  { n: 4, tag: 'Deload',  pct: '40/50/60', sets: '×5' },
];

function S25_Program_Detail({
  dark = false,
  program = null, // optional program object
  programCode = 'PROGRAM 014',
  matchLabel = '86% match · strength focus',
  title = '5/3/1 BBB',
  accentWord = 'BBB',
  meta = 'BY JIM WENDLER · 16 WK · 4 D/WK',
  description = 'A four-day strength cycle built on submaximal training max percentages. Boring But Big adds 5×10 volume on the main lift for hypertrophy. Proven, slow, honest.',
  stats,
  adaptations,
  waves,
  crewAvatars = ['JK', 'MR', 'LA', 'SO'],
  crewCount = 4,
  crewGain = '+28 lb on squat',
  onBack,
  onSave,
  onPreviewWeek,
  onStartProgram,
}) {
  const c = useACT(dark);
  const programId = (program && program.id) || programCode;
  const hasAccentWord = Boolean(accentWord && accentWord.trim());
  const plainTitle = hasAccentWord ? title.replace(accentWord, '').trim() : title;
  const _stats = stats || DEMO_STATS;
  const _adaptations = adaptations || DEMO_ADAPTATIONS;
  const _waves = waves || DEMO_WAVES;

  // Small, safe wrappers that define the design->engine prop contract.
  const handleSave = () => {
    if (typeof onSave === 'function') {
      onSave({ programId, title, savedAt: Date.now() });
    }
  };
  const handlePreview = (week = 1) => {
    if (typeof onPreviewWeek === 'function') onPreviewWeek({ programId, week });
  };
  const handleStart = (opts = {}) => {
    if (typeof onStartProgram === 'function') onStartProgram({ programId, startedAt: Date.now(), ...opts });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25 }}>{programCode}</ACLabel>
        {onSave ? (
          <button type="button" onClick={handleSave} style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M1 1h10v12L6 10 1 13V1Z" stroke={c.fg} strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <div style={{ width: 28 }} />
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.body, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {matchLabel}
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 46, fontWeight: 700,
          letterSpacing: -2, lineHeight: 0.95, color: c.fg,
        }}>
          {plainTitle}{hasAccentWord ? <> <span style={{ color: c.accent }}>{accentWord}</span></> : null}.
        </div>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {meta}
        </div>

        <div style={{ marginTop: 14, fontSize: 14, color: c.dim, lineHeight: 1.55 }}>
          {description}
        </div>

        {/* Stat bar */}
        <div style={{
          marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {[
            { k: 'Weeks',    v: '16' },
            { k: 'Days/wk',  v: '4' },
            { k: 'Sets/sess',v: '28' },
            { k: 'Runners',  v: '12.4k' },
          ].map((m, i) => (
            <div key={i} style={{
              borderLeft: i === 0 ? 'none' : `1px solid ${c.hair}`,
              paddingLeft: i === 0 ? 0 : 12,
            }}>
              <ACLabel size={9} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                {m.k}
              </ACLabel>
              <ACNum size={20} color={c.fg} weight={700} style={{ display: 'block', marginTop: 4 }}>{m.v}</ACNum>
            </div>
          ))}
        </div>

        {/* Expected adaptations */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Expected adaptations · 16 wk
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { lift: 'Squat',    now: 325, proj: 355, unit: 'lb' },
              { lift: 'Bench',    now: 275, proj: 295, unit: 'lb' },
              { lift: 'Deadlift', now: 415, proj: 445, unit: 'lb' },
              { lift: 'OHP',      now: 165, proj: 180, unit: 'lb' },
            ].map((r, i) => {
              const gain = r.proj - r.now;
              const pct = ((gain / r.now) * 100).toFixed(1);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  <div style={{ width: 70 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: c.fg }}>{r.lift}</div>
                  </div>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'baseline', gap: 4,
                    fontFamily: ACFonts.mono, fontSize: 12, color: c.dim,
                  }}>
                    <span style={{ color: c.fg, fontWeight: 600 }}>{r.now}</span>
                    <span>→</span>
                    <span style={{ color: c.accent, fontWeight: 700 }}>{r.proj}</span>
                    <span style={{ color: c.mute }}>{r.unit}</span>
                  </div>
                  <div style={{
                    fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
                    color: c.accent, minWidth: 50, textAlign: 'right',
                  }}>+{gain} · {pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week structure */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Wave structure · 4 wk block
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {_waves.map((w, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: w.tag === 'Deload' ? 'transparent' : c.card,
                border: w.tag === 'Deload' ? `1px dashed ${c.faint}` : 'none',
                borderRadius: ACRadii.card,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: w.n === 1 ? c.accent : c.fg,
                  color: w.n === 1 ? c.ink : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: ACFonts.display, fontWeight: 700, fontSize: 17,
                }}>{w.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg }}>Week {w.n} · {w.tag}</div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.dim, marginTop: 2, letterSpacing: 0.3 }}>
                    {w.pct}% TM · sets of {w.sets}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{
          marginTop: 22, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ display: 'flex' }}>
            {['JK', 'MR', 'LA', 'SO'].map((i, idx) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 999,
                background: idx % 2 ? c.fg : c.accent,
                color: idx % 2 ? c.bg : c.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: ACFonts.display, fontSize: 10, fontWeight: 700,
                marginLeft: idx > 0 ? -8 : 0,
                border: `2px solid ${c.card}`,
              }}>{i}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>4 in your crew are running this</div>
            <ACLabel size={11} color={c.dim} style={{ marginTop: 2 }}>Avg gain: +28 lb on squat</ACLabel>
          </div>
        </div>
      </div>

        <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
          <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block onClick={() => handlePreview(1)}>Preview week</ACBtn>
          </div>
          <div style={{ flex: 1.3 }}>
          <ACBtn primary dark={dark} size="lg" pill block onClick={() => handleStart()}>Start program →</ACBtn>
          </div>
        </div>
    </div>
  );
}

export default S25_Program_Detail;
