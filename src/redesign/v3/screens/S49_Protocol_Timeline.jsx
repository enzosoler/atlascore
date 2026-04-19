import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACMono,
} from '../lib/paper.jsx';

/**
 * Single protocol timeline band — 90 cells with cadence simulation.
 * Colors cells as ok / miss / late / off / none based on protocol type.
 */
function TimelineBand({ protocol, dark }) {
  const c = useACT(dark);

  const cells = Array.from({ length: 90 }).map((_, d) => {
    const cadence = protocol.cadence || protocol.id;

    if (cadence === 'trt') {
      // Mon/Thu injection cadence
      const wd = d % 7;
      if (wd === 0 || wd === 3) {
        if (d === 28) return 'miss';
        if (d === 62) return 'late';
        return 'ok';
      }
      return 'none';
    }

    if (cadence === 'bpc') {
      // 14 on / 7 off cycling
      const cycle = d % 21;
      if (cycle < 14) return 'ok';
      return 'off';
    }

    if (cadence === 'creat') {
      // Daily with occasional misses
      if (d === 19 || d === 42 || d === 77) return 'miss';
      return 'ok';
    }

    if (cadence === 'vitd') {
      // M/W/F, starts late in the 90-day window
      if (d < 82) return 'none';
      const wd = d % 7;
      if (wd === 0 || wd === 2 || wd === 4) return 'ok';
      return 'none';
    }

    return 'none';
  });

  return (
    <div style={{ display: 'flex', gap: 1, height: 16 }}>
      {cells.map((v, i) => {
        const bg =
          v === 'ok'   ? protocol.color :
          v === 'late' ? c.accent :
          v === 'miss' ? c.faint :
          v === 'off'  ? c.hair :
          'transparent';
        return (
          <div
            key={i}
            style={{
              flex: 1,
              background: bg,
              opacity: v === 'off' ? 0.6 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

export default function S49_Protocol_Timeline({
  dark = false,
  protocols,
  events,
  adherenceSummary,
  onBack,
}) {
  const c = useACT(dark);

  const resolvedProtocols = protocols || [
    { id: 'trt',   cadence: 'trt',   name: 'TRT cyp',     color: c.accent, dose: '100 mg' },
    { id: 'bpc',   cadence: 'bpc',   name: 'BPC-157',     color: c.fg,     dose: '250 \u00B5g' },
    { id: 'creat', cadence: 'creat', name: 'Creatine',    color: c.fg,     dose: '5 g' },
    { id: 'vitd',  cadence: 'vitd',  name: 'Vit D3 + K2', color: c.accent, dose: '5 ku' },
  ];

  const resolvedEvents = events || [
    { date: '14 JAN', text: 'Started TRT cypionate',            tone: 'accent' },
    { date: '03 FEB', text: 'BPC-157 14-day cycle \u00B7 on',   tone: 'fg' },
    { date: '17 FEB', text: 'BPC-157 washout \u00B7 7 days',    tone: 'dim' },
    { date: '11 MAR', text: 'Dose adjust \u00B7 \u221220 mg (coach)', tone: 'accent' },
    { date: '08 APR', text: 'Started Vitamin D3 + K2',          tone: 'fg' },
  ];

  const resolvedAdherence = adherenceSummary || {
    logged: 214, total: 230, missed: 16, pct: 93,
  };

  const months = ['JAN', 'FEB', 'MAR', 'APR'];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      overflow: 'hidden', background: c.bg,
    }}>
      {/* Back nav */}
      <div style={{
        padding: '0 20px 4px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          }}
        >
          <ACMono size={11} color={c.dim}>{'\u2039'} PROTOCOLS</ACMono>
        </button>
        <ACMono size={11} color={c.dim}>Q1 2026</ACMono>
      </div>

      {/* Poster-scale header */}
      <div style={{
        padding: '12px 20px 14px',
        borderBottom: `1px solid ${c.hair}`,
      }}>
        <ACMono size={10} color={c.accent} track={3}>
          ISSUE 12 {'\u00B7'} SUN 19 APR
        </ACMono>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 44, fontWeight: 800,
          letterSpacing: -1.6, lineHeight: 0.95, color: c.fg, marginTop: 6,
        }}>
          90&nbsp;days.<br />
          <span style={{ color: c.accent }}>four stacks.</span>
        </div>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.body, fontSize: 12,
          color: c.dim, lineHeight: 1.5,
        }}>
          Every dose, every skip, every cycle. One view.
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflow: 'hidden auto',
        minHeight: 0, WebkitOverflowScrolling: 'touch',
        padding: '14px 0 20px',
      }}>
        {/* Adherence summary — 3 columns */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>LOGGED</ACMono>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800,
              color: c.fg, letterSpacing: -0.8, marginTop: 2,
            }}>
              {resolvedAdherence.logged}
              <span style={{ color: c.dim, fontSize: 14 }}> / {resolvedAdherence.total}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>MISSED</ACMono>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800,
              color: c.fg, letterSpacing: -0.8, marginTop: 2,
            }}>
              {resolvedAdherence.missed}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>ADHERENCE</ACMono>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800,
              color: c.accent, letterSpacing: -0.8, marginTop: 2,
            }}>
              {resolvedAdherence.pct}<span style={{ fontSize: 14 }}>%</span>
            </div>
          </div>
        </div>

        {/* Timeline bands */}
        <div style={{ padding: '0 20px' }}>
          {/* Month ticks */}
          <div style={{ display: 'flex', marginBottom: 6 }}>
            {months.map((m, i) => (
              <div key={m} style={{
                flex: 1,
                borderLeft: i > 0 ? `1px solid ${c.hair}` : 'none',
                paddingLeft: i > 0 ? 4 : 0,
              }}>
                <ACMono size={9} color={c.dim} track={2}>{m}</ACMono>
              </div>
            ))}
          </div>

          {/* Protocol bands */}
          {resolvedProtocols.map((p) => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: 4,
              }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, background: p.color }} />
                  <span style={{
                    fontFamily: ACFonts.display, fontSize: 13, fontWeight: 700,
                    color: c.fg, letterSpacing: -0.2,
                  }}>
                    {p.name}
                  </span>
                </div>
                <ACMono size={9} color={c.dim}>{p.dose.toUpperCase()}</ACMono>
              </div>
              <TimelineBand protocol={p} dark={dark} />
            </div>
          ))}
        </div>

        {/* Events strip */}
        <div style={{
          padding: '14px 20px 0', marginTop: 4,
          borderTop: `1px solid ${c.hair}`,
        }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            MOMENTS {'\u00B7'} 90D
          </ACMono>
          {resolvedEvents.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
              <ACMono size={10} color={c.dim} track={1} style={{ minWidth: 56 }}>
                {e.date}
              </ACMono>
              <div style={{
                fontFamily: ACFonts.body, fontSize: 13, fontWeight: 500,
                color:
                  e.tone === 'accent' ? c.accent :
                  e.tone === 'dim'    ? c.dim :
                  c.fg,
              }}>
                {e.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
