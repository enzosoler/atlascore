import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACSpark, ACChip, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

// Simple body silhouette — front view, single color.
function BodySilhouette({ color, accent, w = 100, h = 200 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 100 200" fill="none" style={{ flexShrink: 0 }}>
      {/* head */}
      <circle cx="50" cy="22" r="14" fill={color} opacity="0.18" />
      {/* neck */}
      <rect x="44" y="34" width="12" height="8" fill={color} opacity="0.18" />
      {/* torso */}
      <path d="M30 42 L70 42 L66 96 L50 102 L34 96 Z" fill={color} opacity="0.18" />
      {/* arms */}
      <path d="M30 42 L22 90 L26 92 L34 48 Z" fill={color} opacity="0.18" />
      <path d="M70 42 L78 90 L74 92 L66 48 Z" fill={color} opacity="0.18" />
      {/* forearms */}
      <path d="M22 90 L18 138 L22 140 L26 92 Z" fill={color} opacity="0.14" />
      <path d="M78 90 L82 138 L78 140 L74 92 Z" fill={color} opacity="0.14" />
      {/* legs */}
      <path d="M36 100 L30 170 L40 172 L46 108 Z" fill={color} opacity="0.18" />
      <path d="M64 100 L70 170 L60 172 L54 108 Z" fill={color} opacity="0.18" />
      {/* measurement rings */}
      <ellipse cx="50" cy="58" rx="22" ry="3" fill="none" stroke={accent} strokeWidth="1.5" />
      <ellipse cx="50" cy="82" rx="19" ry="3" fill="none" stroke={accent} strokeWidth="1.5" />
      <ellipse cx="50" cy="102" rx="20" ry="3" fill="none" stroke={accent} strokeWidth="1.5" />
      {/* dots */}
      <circle cx="72" cy="58" r="2" fill={accent} />
      <circle cx="69" cy="82" r="2" fill={accent} />
      <circle cx="70" cy="102" r="2" fill={accent} />
    </svg>
  );
}

const MOCK_HERO = {
  weight: '182.4',
  unit: 'lb',
  subtitle: '7-day avg 183.1 · trending to 175',
  trend: undefined,
};

const MOCK_COMPOSITION = [
  { l: 'Body fat', v: '17.2', u: '%', d: '↓ 0.8' },
  { l: 'Lean mass', v: '151.0', u: 'lb', d: '↑ 0.4' },
  { l: 'Waist:hip', v: '0.84', u: '', d: '↓ 0.02' },
];

const MOCK_MEASUREMENTS = [
  { l: 'Chest', v: '42.0', u: 'in', d: '+0.2' },
  { l: 'Waist', v: '33.4', u: 'in', d: '−0.6' },
  { l: 'Hips',  v: '39.8', u: 'in', d: '−0.2' },
  { l: 'Arm',   v: '14.8', u: 'in', d: '+0.1' },
  { l: 'Thigh', v: '23.2', u: 'in', d: '−0.1' },
];

const MOCK_LABS = [
  { t: 'ApoB', v: '82', u: 'mg/dL', flag: 'high', d: '↑ 4 vs last' },
  { t: 'HbA1c', v: '5.2', u: '%', flag: 'ok', d: 'stable' },
  { t: 'Vitamin D', v: '28', u: 'ng/mL', flag: 'low', d: '↓ 6 vs last' },
];

function S14_Body_Dashboard({
  dark = false,
  showTabBar = true,
  trendChip,
  hero,
  composition,
  measurements,
  measurementsLabel,
  measurementsActionLabel,
  emptyTitle,
  emptyDescription,
  labs,
  onOpenMeasurements,
  onOpenLabs,
}) {
  const c = useACT(dark);
  const heroData = hero || MOCK_HERO;
  const compositionRows = composition === undefined ? MOCK_COMPOSITION : composition;
  const measurementRows = measurements === undefined ? MOCK_MEASUREMENTS : measurements;
  const labsRows = labs === undefined ? MOCK_LABS : labs;
  const showEmpty = Array.isArray(measurementRows) && measurementRows.length === 0 && !!emptyTitle;

  // Determine if composition has any real data (not all dashes)
  const hasCompositionData = Array.isArray(compositionRows) && compositionRows.some(
    (s) => s.v != null && s.v !== '' && s.v !== '—' && s.v !== '-'
  );

  // Determine if measurements all have empty values
  const allMeasurementsEmpty = Array.isArray(measurementRows) && measurementRows.length > 0 &&
    measurementRows.every((r) => r.v == null || r.v === '' || r.v === '—' || r.v === '-');

  // Check if hero weight is a real number (not "—")
  const hasWeight = heroData.weight != null && heroData.weight !== '' && heroData.weight !== '—';
  const hasTrend = Array.isArray(heroData.trend) && heroData.trend.length > 1;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Body · composition</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Your signal
          </div>
          <div style={{ marginTop: 8, fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: c.accent, fontWeight: 600 }}>
            Updates readiness · composition tracking
          </div>
        </div>
        {trendChip ? <ACChip accent dark={dark}>{trendChip}</ACChip> : null}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Hero — bodyweight + trend (compact) */}
        <div style={{ padding: '14px 18px', background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <ACLabel size={10} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Weight · today</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <ACNum size={hasWeight ? 44 : 28} color={c.bg} weight={700}>{heroData.weight}</ACNum>
                {heroData.unit ? <ACLabel size={12} color="rgba(239,233,218,0.6)">{heroData.unit}</ACLabel> : null}
              </div>
              <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ marginTop: 2 }}>
                {heroData.subtitle}
              </ACLabel>
            </div>
            {/* Inline spark when trend data exists */}
            {hasTrend ? (
              <div style={{ flexShrink: 0, marginLeft: 12 }}>
                <ACSpark w={100} h={32} dark={true} color={c.accent} stroke={2} data={heroData.trend} />
              </div>
            ) : null}
          </div>
        </div>

        {/* 3-up composition tiles — only render when at least one has real data */}
        {hasCompositionData ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
            {compositionRows.map((s, i) => (
              <div key={i} style={{ padding: 14, background: c.card, borderRadius: ACRadii.card }}>
                <ACLabel size={11} color={c.dim}>{s.l}</ACLabel>
                <div style={{ marginTop: 8 }}>
                  <ACNum size={22} color={c.fg} weight={700}>{s.v}</ACNum>
                  {s.u && <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{s.u}</span>}
                </div>
                {s.d ? <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, marginTop: 2 }}>{s.d}</ACLabel> : null}
              </div>
            ))}
          </div>
        ) : null}

        {/* Body diagram — minimal silhouette with hotspots */}
        <div style={{ marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showEmpty || allMeasurementsEmpty ? 0 : 14 }}>
            <ACLabel size={12} color={c.dim}>{measurementsLabel || 'Measurements · last 30d'}</ACLabel>
            {measurementsActionLabel ? (
              <button type="button" onClick={onOpenMeasurements} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{measurementsActionLabel}</ACLabel>
              </button>
            ) : null}
          </div>
          {showEmpty ? (
            /* No measurements entry at all — first-time user */
            <div style={{ padding: '12px 0 4px' }}>
              <ACLabel size={13} color={c.dim} style={{ lineHeight: 1.5 }}>
                {emptyDescription || 'Log your first checkpoint to see measurements here.'}
              </ACLabel>
            </div>
          ) : allMeasurementsEmpty ? (
            /* Measurements entry exists but all individual values are dashes */
            <div style={{ padding: '12px 0 4px' }}>
              <ACLabel size={13} color={c.dim} style={{ lineHeight: 1.5 }}>
                Log your first checkpoint to see measurements here.
              </ACLabel>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <BodySilhouette color={c.fg} accent={c.accent} w={90} h={180} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {measurementRows.filter((r) => r.v != null && r.v !== '' && r.v !== '—' && r.v !== '-').map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <ACLabel size={12} color={c.dim} style={{ width: 46 }}>{r.l}</ACLabel>
                    <div style={{ flex: 1 }}>
                      <ACNum size={16} color={c.fg} weight={700}>{r.v}</ACNum>
                      <span style={{ fontSize: 11, color: c.dim, marginLeft: 2 }}>{r.u}</span>
                    </div>
                    {r.d ? (
                      <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, fontFamily: ACFonts.mono }}>{r.d}</ACLabel>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inbox teasers */}
        {Array.isArray(labsRows) && labsRows.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <ACLabel size={12} color={c.dim}>Labs · inbox</ACLabel>
              <button type="button" onClick={onOpenLabs} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>View all · {labsRows.length} new</ACLabel>
              </button>
            </div>
            {labsRows.map((r, i) => {
            const col = r.flag === 'high' ? c.accent : r.flag === 'low' ? '#e85a2f' : c.fg;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: c.fg }}>{r.t}</div>
                  <ACLabel size={12} color={c.dim}>{r.d}</ACLabel>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <ACNum size={17} color={c.fg} weight={700}>{r.v}</ACNum>
                  <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{r.u}</span>
                </div>
              </div>
            );
            })}
          </div>
        ) : null}
      </div>

      {showTabBar ? <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S14_Body_Dashboard;
