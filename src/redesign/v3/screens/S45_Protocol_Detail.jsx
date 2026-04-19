import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn,
  ACRing, ACChip,
} from '../lib/paper.jsx';

/**
 * S45_Protocol_Detail — detailed view for a single protocol (TRT cypionate).
 *
 * Gallery mode:  <S45_Protocol_Detail dark />
 * Production:    <S45_Protocol_Detail dark protocol={obj} adherence={obj}
 *                  recentDoses={[...]} onBack={fn} onLogDose={fn}
 *                  onEdit={fn} onPause={fn} onEnd={fn} />
 *
 * Props:
 *   dark          — light/dark variant
 *   protocol      — { id, name, category, type, dose, cadence, route, startDate, site }
 *   adherence     — { pct, total, logged, late, missed }
 *   recentDoses   — array of { d, note, status }
 *   onBack        — () => void
 *   onLogDose     — () => void
 *   onEdit        — () => void
 *   onPause       — () => void
 *   onEnd         — () => void
 */

const MOCK_PROTOCOL = {
  id: 'trt',
  name: 'Testosterone cypionate',
  category: 'HORMONE',
  type: 'TRT',
  dose: '100 MG',
  cadence: 'MON + THU',
  route: 'IM',
  startDate: '14 JAN 2026',
};

const MOCK_ADHERENCE = {
  pct: 94,
  total: 26,
  logged: 25,
  late: 1,
  missed: 0,
};

const MOCK_RECENT_DOSES = [
  { d: 'Mon 15 Apr \u00b7 18:04', note: '100 mg \u00b7 left quad',  status: 'ok' },
  { d: 'Thu 11 Apr \u00b7 18:00', note: '100 mg \u00b7 right quad', status: 'ok' },
  { d: 'Mon 08 Apr \u00b7 18:22', note: '100 mg \u00b7 left quad',  status: 'late' },
  { d: 'Thu 04 Apr \u00b7 17:55', note: '100 mg \u00b7 right quad', status: 'ok' },
  { d: 'Mon 01 Apr \u00b7 18:00', note: '100 mg \u00b7 left quad',  status: 'ok' },
];

function LegendDot({ label, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 8, height: 8, background: color }} />
      <ACMono size={8} color={color}>{label}</ACMono>
    </div>
  );
}

function buildWeeks(c) {
  return Array.from({ length: 12 }).map((_, wi) => {
    return Array.from({ length: 7 }).map((_, di) => {
      const scheduled = di === 1 || di === 4;
      if (!scheduled) return 'none';
      if (wi === 4 && di === 4) return 'miss';
      if (wi === 9 && di === 1) return 'late';
      if (wi === 11 && di === 4) return 'today';
      return 'ok';
    });
  });
}

function S45_Protocol_Detail({
  dark = false,
  protocol,
  adherence,
  recentDoses,
  onBack,
  onLogDose,
  onEdit,
  onPause,
  onEnd,
}) {
  const c = useACT(dark);

  const p = { ...MOCK_PROTOCOL, ...(protocol || {}) };
  const adh = { ...MOCK_ADHERENCE, ...(adherence || {}) };
  const recent = recentDoses || MOCK_RECENT_DOSES;
  const weeks = buildWeeks(c);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Top nav */}
      <div style={{ padding: '14px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ACMono size={11} color={c.dim}>{'\u2039'} PROTOCOLS</ACMono>
        </button>
        <ACMono size={11} color={c.dim}>{'\u00b7\u00b7\u00b7'}</ACMono>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Header block */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, background: c.accent }} />
            <ACMono size={10} color={c.dim} track={2}>{p.category} \u00b7 {p.type}</ACMono>
          </div>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.05, color: c.fg,
          }}>
            {p.name.split(' ').length > 1 ? (
              <>
                {p.name.split(' ').slice(0, -1).join(' ')}<br />
                {p.name.split(' ').slice(-1)[0]}.
              </>
            ) : (
              <>{p.name}.</>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <ACMono size={11} color={c.dim}>
              {p.dose} \u00b7 {p.cadence} \u00b7 {p.route} \u00b7 STARTED {p.startDate}
            </ACMono>
          </div>
        </div>

        {/* Adherence hero */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{
            background: c.card, borderRadius: ACRadii.card,
            padding: 18, display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <ACRing size={104} value={adh.pct} dark={dark} thickness={10} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <ACMono size={9} color={c.dim} track={2}>ADHERENCE \u00b7 90D</ACMono>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 34, fontWeight: 800,
                letterSpacing: -1, color: c.fg, lineHeight: 1,
              }}>
                {adh.pct}<span style={{ color: c.accent, fontSize: 22 }}>%</span>
              </div>
              <div style={{
                fontFamily: ACFonts.body, fontSize: 12, color: c.dim, marginTop: 4,
              }}>
                {adh.logged} of {adh.total} doses. {adh.late} late, {adh.missed} missed.
              </div>
            </div>
          </div>
        </div>

        {/* Today CTA row */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{
            background: c.accent, color: c.ink,
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <ACMono size={9} track={2} style={{ opacity: 0.6 }}>TODAY \u00b7 THU \u00b7 18:00</ACMono>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                letterSpacing: -0.3, marginTop: 2,
              }}>
                100 mg \u00b7 right quad
              </div>
            </div>
            <button
              type="button"
              onClick={onLogDose}
              style={{
                padding: '8px 14px', background: c.ink, color: c.accent,
                fontFamily: ACFonts.body, fontSize: 12, fontWeight: 700,
                letterSpacing: 0.5, textTransform: 'uppercase',
                border: 'none', cursor: 'pointer',
              }}
            >
              Log {'\u203a'}
            </button>
          </div>
        </div>

        {/* 12-week cadence grid */}
        <div style={{ padding: '0 20px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACMono size={9} color={c.dim} track={2}>CADENCE \u00b7 12 WEEKS</ACMono>
            <div style={{ display: 'flex', gap: 10 }}>
              <LegendDot label="ON" color={c.fg} />
              <LegendDot label="LATE" color={c.accent} />
              <LegendDot label="MISS" color={c.faint} />
            </div>
          </div>
          {/* Day headers */}
          <div style={{ display: 'flex', gap: 3 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <ACMono size={8} color={c.dim}>{d}</ACMono>
              </div>
            ))}
          </div>
          {/* Grid rows */}
          {weeks.map((w, wi) => (
            <div key={wi} style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {w.map((cell, di) => (
                <div key={di} style={{
                  flex: 1, aspectRatio: '1', position: 'relative',
                  background:
                    cell === 'ok'    ? c.fg :
                    cell === 'late'  ? c.accent :
                    cell === 'miss'  ? c.hair :
                    cell === 'today' ? 'transparent' : 'transparent',
                  border: cell === 'today' ? `1.5px solid ${c.accent}` : 'none',
                }} />
              ))}
            </div>
          ))}
        </div>

        {/* AI insight */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ padding: 14, background: c.card, borderLeft: `3px solid ${c.accent}` }}>
            <ACMono size={9} color={c.accent} track={2}>COACH \u00b7 INSIGHT</ACMono>
            <div style={{
              fontFamily: ACFonts.body, fontSize: 13, color: c.fg,
              marginTop: 4, lineHeight: 1.45,
            }}>
              Your last trough labs read 512 ng/dL. At your current cadence you're steady-state.
              No change recommended — next labs due in 6 weeks.
            </div>
          </div>
        </div>

        {/* Recent 5 doses */}
        <div style={{ padding: '0 20px 14px' }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            RECENT \u00b7 {recent.length} DOSES
          </ACMono>
          {recent.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: `1px solid ${c.hair}`,
            }}>
              <div>
                <ACMono size={10} color={c.dim}>{(h.d || '').toUpperCase()}</ACMono>
                <div style={{
                  fontFamily: ACFonts.body, fontSize: 13, fontWeight: 500,
                  color: c.fg, marginTop: 2,
                }}>
                  {h.note}
                </div>
              </div>
              <ACChip dark={dark} accent={h.status === 'late'} dot>
                {h.status === 'late' ? 'late' : 'on-time'}
              </ACChip>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '0 20px 24px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <ACBtn dark={dark} block onClick={onEdit}>Edit</ACBtn>
          </div>
          <div style={{ flex: 1 }}>
            <ACBtn dark={dark} block onClick={onPause}>Pause</ACBtn>
          </div>
          <div style={{ flex: 1 }}>
            <button
              type="button"
              onClick={onEnd}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                width: '100%',
                padding: '14px 20px',
                fontFamily: ACFonts.body, fontSize: 16, fontWeight: 600,
                color: '#c2391a',
                background: dark ? 'rgba(194,57,26,0.1)' : 'rgba(194,57,26,0.06)',
                borderRadius: ACRadii.button,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S45_Protocol_Detail;
