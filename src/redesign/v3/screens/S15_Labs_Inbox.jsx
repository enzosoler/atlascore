import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACChip, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function LegendDot({ color, label, c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      <ACLabel size={11} color={c.dim}>{label}</ACLabel>
    </div>
  );
}

function S15_Labs_Inbox({
  dark = false,
  isLocked = false,
  summary,
  panels,
  onUpgrade,
  onUpload,
  onOpenPanel,
  showTabBar = false,
}) {
  const c = useACT(dark);
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [localPanels, setLocalPanels] = React.useState(panels || [
    {
      id: 'p1',
      date: 'Apr 18', lab: 'Function Health', n: 'Q2 Panel',
      flagged: 3, total: 42, isNew: true,
      markers: [
        { t: 'ApoB',          v: '82',  u: 'mg/dL', flag: 'high', d: '↑ 4' },
        { t: 'hs-CRP',        v: '0.6', u: 'mg/L',  flag: 'ok',   d: 'stable' },
        { t: 'HbA1c',         v: '5.2', u: '%',     flag: 'ok',   d: 'stable' },
        { t: 'Vitamin D',     v: '28',  u: 'ng/mL', flag: 'low',  d: '↓ 6' },
        { t: 'Testosterone',  v: '642', u: 'ng/dL', flag: 'high', d: '↑ 38' },
      ],
    },
    {
      id: 'p2',
      date: 'Jan 14', lab: 'Function Health', n: 'Q1 Panel',
      flagged: 5, total: 42, isNew: false,
      markers: [
        { t: 'ApoB',          v: '78',  u: 'mg/dL', flag: 'ok',  d: 'baseline' },
        { t: 'Vitamin D',     v: '34',  u: 'ng/mL', flag: 'ok',  d: 'baseline' },
      ],
    },
  ]);

  function handleUpload() {
    if (onUpload) {
      onUpload();
      return;
    }
    // Demo behavior: add a new panel
    const newPanel = {
      id: `p${localPanels.length + 1}`,
      date: 'Today', lab: 'LabCorp', n: 'Quick Panel',
      flagged: 1, total: 12, isNew: true,
      markers: [
        { t: 'Glucose', v: '92', u: 'mg/dL', flag: 'ok', d: 'optimal' },
        { t: 'Ferritin', v: '18', u: 'ng/mL', flag: 'low', d: '↓ 4' },
      ],
    };
    setLocalPanels([newPanel, ...localPanels]);
  }

  const summaryRow = summary || { 
    panelCount: localPanels.length, 
    totalMarkers: localPanels.reduce((acc, p) => acc + p.total, 0),
    attentionCount: localPanels.reduce((acc, p) => acc + p.flagged, 0),
    optimalCount: 37, elevatedCount: 3, lowCount: 2 
  };
  const isEmpty = !isLocked && Array.isArray(localPanels) && localPanels.length === 0;
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Labs · inbox</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Your biology
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: c.card, borderRadius: 10 }}>
          {[['all', 'All'], ['flags', 'Flags']].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setActiveFilter(k)} style={{
              padding: '6px 12px', borderRadius: 7,
              background: activeFilter === k ? c.fg : 'transparent',
              color: activeFilter === k ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Summary card */}
        {isLocked ? (
          <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>
              Labs are locked.
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: c.dim, lineHeight: 1.55 }}>
              Upload panels, flag biomarkers, and track changes over time with Pro.
            </div>
            <button type="button" onClick={onUpgrade} style={{ marginTop: 14, padding: '10px 16px', borderRadius: 999, border: 'none', background: c.accent, color: c.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Unlock labs →
            </button>
          </div>
        ) : isEmpty ? (
          <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>
              No panels yet.
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: c.dim, lineHeight: 1.55 }}>
              Upload your first lab PDF to turn this into a living biology inbox.
            </div>
            <button type="button" onClick={handleUpload} style={{ marginTop: 14, padding: '10px 16px', borderRadius: 999, border: 'none', background: c.fg, color: c.bg, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Upload panel →
            </button>
          </div>
        ) : (
          <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <ACLabel size={11} color={c.dim}>{summaryRow.panelCount} panels · {summaryRow.totalMarkers} markers tracked</ACLabel>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>{summaryRow.attentionCount} need attention</ACLabel>
            </div>
            <div style={{ display: 'flex', gap: 6, height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ flex: Math.max(1, summaryRow.optimalCount), background: c.fg }} />
              <div style={{ flex: Math.max(1, summaryRow.elevatedCount), background: c.accent }} />
              <div style={{ flex: Math.max(1, summaryRow.lowCount), background: '#e85a2f' }} />
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
              <LegendDot color={c.fg} label={`Optimal · ${summaryRow.optimalCount}`} c={c} />
              <LegendDot color={c.accent} label={`Elevated · ${summaryRow.elevatedCount}`} c={c} />
              <LegendDot color="#e85a2f" label={`Low · ${summaryRow.lowCount}`} c={c} />
            </div>
          </div>
        )}

        {/* Action bar for Upload */}
        {!isLocked && !isEmpty && (
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleUpload} style={{ 
              padding: '6px 12px', borderRadius: 999, border: `1px solid ${c.faint}`, 
              background: 'transparent', color: c.fg, fontSize: 12, fontWeight: 600, cursor: 'pointer' 
            }}>
              + Upload panel
            </button>
          </div>
        )}

        {/* Panels list */}
        {!isLocked && !isEmpty ? localPanels.map((p, pi) => {
          const visibleMarkers = activeFilter === 'flags'
            ? p.markers.filter((r) => r.flag === 'high' || r.flag === 'low')
            : p.markers;
          if (visibleMarkers.length === 0) return null;
          return (
          <div key={pi} style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600, color: c.fg }}>{p.n}</div>
                {p.isNew && <ACChip accent dark={dark}>New</ACChip>}
              </div>
              <ACLabel size={11} color={c.dim}>{p.date} · {p.lab}</ACLabel>
            </div>
            {visibleMarkers.map((r, i) => {
              const col = r.flag === 'high' ? c.accent
                        : r.flag === 'low' ? '#e85a2f'
                        : c.fg;
              return (
                <button key={i} type="button" onClick={() => onOpenPanel?.(p, r)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                  width: '100%', textAlign: 'left', background: 'transparent', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: c.fg }}>{r.t}</div>
                    <ACLabel size={12} color={c.dim}>{r.d}</ACLabel>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <ACNum size={18} color={c.fg} weight={700}>{r.v}</ACNum>
                    <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{r.u}</span>
                  </div>
                  <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
                    <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              );
            })}
          </div>
          );
        }) : null}
      </div>

      {showTabBar ? <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S15_Labs_Inbox;
