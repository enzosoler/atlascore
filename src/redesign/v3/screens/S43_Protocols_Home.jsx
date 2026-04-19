import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACChip,
  ACHeader, ACBrandMark, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/**
 * S43_Protocols_Home — protocols overview with populated protocol list.
 *
 * Gallery mode:  <S43_Protocols_Home dark />
 * Production:    <S43_Protocols_Home dark protocols={[...]} todayLogged={2}
 *                  todayTotal={4} adherence30d={[...]} onSelectProtocol={fn}
 *                  onAddProtocol={fn} />
 *
 * Props:
 *   dark             — light/dark variant
 *   protocols        — array of { id, name, dose, cadence, adh, cycle, state, next }
 *   todayLogged      — number of doses logged today
 *   todayTotal       — total doses scheduled today
 *   adherence30d     — array of 30 values (0 | 0.5 | 1) for the adherence strip
 *   onSelectProtocol — (id) => void
 *   onAddProtocol    — () => void
 *   showTabBar       — boolean (default true)
 */

const MOCK_PROTOCOLS = [
  { id: 'trt',   name: 'Testosterone cypionate', dose: '100 mg', cadence: 'Mon \u00b7 Thu',                adh: 94, cycle: 'on', state: 'active',  next: 'today 18:00' },
  { id: 'bpc',   name: 'BPC-157',                dose: '250 \u00b5g', cadence: 'daily \u00b7 14d on \u00b7 7d off', adh: 88, cycle: 'on', state: 'active',  next: 'today 08:00' },
  { id: 'creat', name: 'Creatine monohydrate',   dose: '5 g',    cadence: 'daily',                       adh: 97, cycle: null, state: 'active',  next: 'today 09:00' },
  { id: 'berb',  name: 'Berberine',              dose: '500 mg', cadence: 'with meals',                  adh: 72, cycle: null, state: 'paused',  next: '\u2014' },
  { id: 'vitd',  name: 'Vitamin D3 + K2',        dose: '5 000 IU', cadence: 'Mon / Wed / Fri',           adh: 81, cycle: null, state: 'active',  next: 'wed 12:00' },
];

const MOCK_ADHERENCE_30D = [1,1,1,0.5,1,1,1,1,0,1,1,1,1,1,0.5,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1];

function ProtocolRow({ p, dark, onSelect }) {
  const c = useACT(dark);
  const paused = p.state === 'paused';
  return (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(p.id) : undefined}
      style={{
        display: 'block',
        width: '100%',
        padding: '14px 14px 14px',
        marginBottom: 8,
        background: c.card,
        borderRadius: ACRadii.card,
        opacity: paused ? 0.55 : 1,
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ width: 6, height: 6, background: paused ? c.mute : c.accent, flexShrink: 0 }} />
          <div style={{
            fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700, color: c.fg,
            letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.name}
          </div>
        </div>
        <span style={{
          fontFamily: ACFonts.display, fontSize: 13, fontWeight: 700, color: c.fg,
          fontVariantNumeric: 'tabular-nums', marginLeft: 8,
        }}>
          {p.adh}<span style={{ color: c.dim, fontSize: 10 }}>%</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
        <ACMono size={10} color={c.dim}>{p.dose}</ACMono>
        <span style={{ width: 2, height: 2, background: c.faint }} />
        <ACMono size={10} color={c.dim}>{p.cadence}</ACMono>
        {paused && (
          <>
            <span style={{ width: 2, height: 2, background: c.faint }} />
            <ACMono size={10} color={c.accent}>PAUSED</ACMono>
          </>
        )}
      </div>
      {!paused && (
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ACMono size={9} color={c.dim} track={2}>NEXT \u00b7 {(p.next || '').toUpperCase()}</ACMono>
          <ACSpark
            w={80} h={16} dark={dark}
            data={[50,50,50,45,55,30,70,50,50,50,45,55,20,80,30,50,50,50]}
            stroke={1.5}
          />
        </div>
      )}
    </button>
  );
}

function S43_Protocols_Home({
  dark = false,
  protocols,
  todayLogged,
  todayTotal,
  adherence30d,
  onSelectProtocol,
  onAddProtocol,
  showTabBar = true,
}) {
  const c = useACT(dark);

  const ps = protocols || MOCK_PROTOCOLS;
  const logged = todayLogged ?? 2;
  const total = todayTotal ?? 4;
  const adh30 = adherence30d || MOCK_ADHERENCE_30D;
  const activeCount = ps.filter(p => p.state === 'active').length;

  // Compute overall 30d adherence %
  const adh30Pct = adh30.length > 0
    ? Math.round((adh30.reduce((s, v) => s + v, 0) / adh30.length) * 100)
    : 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Brand + PRO badge */}
      <div style={{ padding: '14px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrandMark size={20} dark={dark} HeartMarkComp={HeartMark} />
        <ACMono size={9} color={c.dim}>PRO</ACMono>
      </div>

      <ACHeader dark={dark} sub="PROTOCOLS" title="Today."
        right={<ACChip dark={dark} accent dot>pro</ACChip>}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 20px 14px' }}>
        {/* Today hero -- doses + adherence */}
        <div style={{
          background: c.card, padding: '18px 18px 16px',
          borderRadius: ACRadii.card, marginBottom: 14,
          display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <ACRing size={92} value={total > 0 ? Math.round((logged / total) * 100) : 0} dark={dark} thickness={8} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ACNum size={22} color={c.fg}>{logged}</ACNum>
              <ACMono size={8} color={c.dim}>OF {total}</ACMono>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>TODAY \u00b7 DOSES</ACMono>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
              letterSpacing: -0.4, color: c.fg, marginTop: 2, lineHeight: 1.2,
            }}>
              {logged} logged. {total - logged} to go.
            </div>
          </div>
        </div>

        {/* 30d adherence strip */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <ACMono size={9} color={c.dim} track={2}>30-DAY ADHERENCE \u00b7 ALL PROTOCOLS</ACMono>
            <span style={{ fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700, color: c.fg }}>
              {adh30Pct}<span style={{ color: c.accent }}>%</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 30 }}>
            {adh30.map((v, i) => (
              <div key={i} style={{
                flex: 1,
                background: v === 0 ? c.hair : v < 1 ? c.accent : c.fg,
                opacity: v === 0 ? 1 : v < 1 ? 1 : 0.85,
              }} />
            ))}
          </div>
        </div>

        {/* Active section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <ACMono size={9} color={c.dim} track={2}>ACTIVE \u00b7 {activeCount}</ACMono>
          <button
            type="button"
            onClick={onAddProtocol}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ACMono size={9} color={c.accent} track={2}>+ NEW</ACMono>
          </button>
        </div>

        {/* Protocol rows */}
        {ps.map(p => (
          <ProtocolRow key={p.id} p={p} dark={dark} onSelect={onSelectProtocol} />
        ))}

        {/* AI insight banner */}
        <div style={{
          marginTop: 10, padding: 14,
          background: c.accent, color: c.ink,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <HeartMark size={18} color={c.ink} accent={c.ink} />
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} track={2} style={{ opacity: 0.6 }}>COACH \u00b7 INSIGHT</ACMono>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
              lineHeight: 1.3, marginTop: 2,
            }}>
              BPC-157 cycle ends Friday. Plan 7-day washout before restart.
            </div>
          </div>
        </div>
      </div>

      {showTabBar ? <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S43_Protocols_Home;
