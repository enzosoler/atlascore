// screens-p3.jsx — atlas.core app screens, PHASE 3
// Body dashboard · Labs inbox · Biomarker detail · Measurements · Progress photos.
// Uses the same AC* primitives as phase 1/2.

// ══════════════════════════════════════════════════════════════
// P3-1 — BODY DASHBOARD
// ══════════════════════════════════════════════════════════════
function S14_Body_Dashboard({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Body · composition</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Your signal
          </div>
        </div>
        <ACChip accent dark={dark}>↓ 1.8 · 14d</ACChip>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Hero — bodyweight + trend */}
        <div style={{ padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Weight · today</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={72} color={c.bg} weight={700}>182.4</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">lb</ACLabel>
          </div>
          <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ marginTop: 2 }}>
            7-day avg 183.1 · trending to 175
          </ACLabel>
          <div style={{ marginTop: 18 }}>
            <ACSpark w={268} h={34} dark={true} color={c.accent} stroke={2.2} />
          </div>
        </div>

        {/* 3-up composition tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
          {[
            { l: 'Body fat', v: '17.2', u: '%', d: '↓ 0.8' },
            { l: 'Lean mass', v: '151.0', u: 'lb', d: '↑ 0.4' },
            { l: 'Waist:hip', v: '0.84', u: '', d: '↓ 0.02' },
          ].map((s, i) => (
            <div key={i} style={{ padding: 14, background: c.card, borderRadius: ACRadii.card }}>
              <ACLabel size={11} color={c.dim}>{s.l}</ACLabel>
              <div style={{ marginTop: 8 }}>
                <ACNum size={22} color={c.fg} weight={700}>{s.v}</ACNum>
                {s.u && <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{s.u}</span>}
              </div>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, marginTop: 2 }}>{s.d}</ACLabel>
            </div>
          ))}
        </div>

        {/* Body diagram — minimal silhouette with hotspots */}
        <div style={{ marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <ACLabel size={12} color={c.dim}>Measurements · last 30d</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>+ Log new</ACLabel>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <BodySilhouette color={c.fg} accent={c.accent} w={90} h={180} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Chest', v: '42.0', u: 'in', d: '+0.2' },
                { l: 'Waist', v: '33.4', u: 'in', d: '−0.6' },
                { l: 'Hips',  v: '39.8', u: 'in', d: '−0.2' },
                { l: 'Arm',   v: '14.8', u: 'in', d: '+0.1' },
                { l: 'Thigh', v: '23.2', u: 'in', d: '−0.1' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <ACLabel size={12} color={c.dim} style={{ width: 46 }}>{r.l}</ACLabel>
                  <div style={{ flex: 1 }}>
                    <ACNum size={16} color={c.fg} weight={700}>{r.v}</ACNum>
                    <span style={{ fontSize: 11, color: c.dim, marginLeft: 2 }}>{r.u}</span>
                  </div>
                  <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, fontFamily: ACFonts.mono }}>{r.d}</ACLabel>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inbox teasers */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={12} color={c.dim}>Labs · inbox</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>View all · 3 new</ACLabel>
          </div>
          {[
            { t: 'ApoB', v: '82', u: 'mg/dL', flag: 'high', d: '↑ 4 vs last' },
            { t: 'HbA1c', v: '5.2', u: '%', flag: 'ok', d: 'stable' },
            { t: 'Vitamin D', v: '28', u: 'ng/mL', flag: 'low', d: '↓ 6 vs last' },
          ].map((r, i) => {
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
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

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

// ══════════════════════════════════════════════════════════════
// P3-2 — LABS INBOX
// ══════════════════════════════════════════════════════════════
function S15_Labs_Inbox({ dark }) {
  const c = useACT(dark);
  const panels = [
    {
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
      date: 'Jan 14', lab: 'Function Health', n: 'Q1 Panel',
      flagged: 5, total: 42, isNew: false,
      markers: [
        { t: 'ApoB',          v: '78',  u: 'mg/dL', flag: 'ok',  d: 'baseline' },
        { t: 'Vitamin D',     v: '34',  u: 'ng/mL', flag: 'ok',  d: 'baseline' },
      ],
    },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Labs · inbox</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Your biology
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: c.card, borderRadius: 10 }}>
          {['All', 'Flags'].map((r, i) => (
            <div key={r} style={{
              padding: '6px 12px', borderRadius: 7,
              background: i === 0 ? c.fg : 'transparent',
              color: i === 0 ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600,
            }}>{r}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Summary card */}
        <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={11} color={c.dim}>2 panels · 84 markers tracked</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>3 need attention</ACLabel>
          </div>
          <div style={{ display: 'flex', gap: 6, height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ flex: 37, background: c.fg }} />
            <div style={{ flex: 3, background: c.accent }} />
            <div style={{ flex: 2, background: '#e85a2f' }} />
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
            <LegendDot color={c.fg} label="Optimal · 37" c={c} />
            <LegendDot color={c.accent} label="Elevated · 3" c={c} />
            <LegendDot color="#e85a2f" label="Low · 2" c={c} />
          </div>
        </div>

        {/* Panels list */}
        {panels.map((p, pi) => (
          <div key={pi} style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600, color: c.fg }}>{p.n}</div>
                {p.isNew && <ACChip accent dark={dark}>New</ACChip>}
              </div>
              <ACLabel size={11} color={c.dim}>{p.date} · {p.lab}</ACLabel>
            </div>
            {p.markers.map((r, i) => {
              const col = r.flag === 'high' ? c.accent
                        : r.flag === 'low' ? '#e85a2f'
                        : c.fg;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
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
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

function LegendDot({ color, label, c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      <ACLabel size={11} color={c.dim}>{label}</ACLabel>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P3-3 — BIOMARKER DETAIL (ApoB)
// ══════════════════════════════════════════════════════════════
function S16_Biomarker_Detail({ dark }) {
  const c = useACT(dark);
  // 8 historical readings over 24 months
  const history = [
    { d: 'Apr 23', v: 92 },
    { d: 'Oct 23', v: 88 },
    { d: 'Jan 24', v: 85 },
    { d: 'Apr 24', v: 80 },
    { d: 'Jul 24', v: 76 },
    { d: 'Oct 24', v: 75 },
    { d: 'Jan 25', v: 78 },
    { d: 'Apr 25', v: 82 },
  ];
  const max = 110, min = 50;
  const optimal = { low: 60, high: 80 };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Apo B</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="3" viewBox="0 0 14 3"><circle cx="2" cy="1.5" r="1.3" fill={c.fg}/><circle cx="7" cy="1.5" r="1.3" fill={c.fg}/><circle cx="12" cy="1.5" r="1.3" fill={c.fg}/></svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Elevated · above optimal</ACLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
          <ACNum size={88} color={c.fg} weight={700}>82</ACNum>
          <ACLabel size={14} color={c.dim}>mg/dL</ACLabel>
        </div>
        <div style={{ marginTop: 4 }}>
          <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>↑ 4 since Jan · 2 above optimal range</ACLabel>
        </div>

        {/* Range bar */}
        <div style={{ marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <ACLabel size={11} color={c.dim}>Your reading vs optimal range</ACLabel>
            <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono }}>50 – 110</ACLabel>
          </div>
          <RangeBar min={min} max={max} optimal={optimal} value={82} c={c} />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>Low</ACLabel>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>Optimal 60–80</ACLabel>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>High</ACLabel>
          </div>
        </div>

        {/* Trend */}
        <div style={{ marginTop: 12, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <ACLabel size={12} color={c.dim}>24-month trend</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>8 readings</ACLabel>
          </div>
          <BiomarkerTrend data={history} c={c} dark={dark} optimal={optimal} />
        </div>

        {/* What drives this */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>What drives this</ACLabel>
          {[
            { t: 'Saturated fat intake', d: 'Lower sat fat to ≤20g / day', dir: 'down' },
            { t: 'Soluble fiber', d: 'Oats, beans, psyllium — target 10g', dir: 'up' },
            { t: 'Weekly cardio minutes', d: 'Currently 140 / 180 target', dir: 'up' },
            { t: 'Alcohol frequency', d: 'Currently 4× / week', dir: 'down' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <ArrowIcon dir={r.dir} color={c.accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: c.fg }}>{r.t}</div>
                <ACLabel size={12} color={c.dim}>{r.d}</ACLabel>
              </div>
            </div>
          ))}
        </div>

        {/* Coach note */}
        <div style={{ marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card, borderLeft: `3px solid ${c.accent}` }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Coach</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>
            ApoB above 80 raises cardiovascular risk independently of LDL. You were at 75 last quarter — the drift correlates with your sat-fat intake climbing to 28g/day. Let's plan four weeks.
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: c.accent, color: c.ink, fontSize: 12, fontWeight: 600, borderRadius: 8, display: 'inline-block' }}>
            Start 4-week protocol →
          </div>
        </div>
      </div>
    </div>
  );
}

function RangeBar({ min, max, optimal, value, c }) {
  const pct = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', height: 10, background: c.faint, borderRadius: 5, overflow: 'hidden' }}>
      {/* optimal range band */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${pct(optimal.low)}%`, width: `${pct(optimal.high) - pct(optimal.low)}%`,
        background: c.fg, opacity: 0.9,
      }} />
      {/* pointer */}
      <div style={{
        position: 'absolute', top: -3, bottom: -3,
        left: `calc(${pct(value)}% - 2px)`, width: 4,
        background: c.accent, borderRadius: 1,
        boxShadow: `0 0 0 2px ${c.bg}`,
      }} />
    </div>
  );
}

function BiomarkerTrend({ data, c, dark, optimal }) {
  const w = 276, h = 120;
  const max = 100, min = 60;
  const span = max - min;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => [i * step, h - ((d.v - min) / span) * (h - 20) - 10]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  // optimal band
  const yOptHigh = h - ((optimal.high - min) / span) * (h - 20) - 10;
  const yOptLow  = h - ((optimal.low  - min) / span) * (h - 20) - 10;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {/* optimal band */}
      <rect x="0" y={yOptHigh} width={w} height={yOptLow - yOptHigh}
        fill={c.accent} opacity="0.08" />
      <line x1="0" x2={w} y1={yOptHigh} y2={yOptHigh}
        stroke={c.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      <line x1="0" x2={w} y1={yOptLow} y2={yOptLow}
        stroke={c.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      {/* trend line */}
      <path d={path} fill="none" stroke={c.fg} strokeWidth="2.5" strokeLinejoin="miter" />
      {/* points */}
      {pts.map((p, i) => {
        const last = i === pts.length - 1;
        const v = data[i].v;
        const outOfRange = v < optimal.low || v > optimal.high;
        return (
          <rect key={i} x={p[0] - 3} y={p[1] - 3} width="6" height="6"
            fill={last ? c.accent : (outOfRange ? c.accent : c.fg)}
            opacity={last ? 1 : 0.8} />
        );
      })}
      {/* last label */}
      <text x={pts[pts.length - 1][0] - 16} y={pts[pts.length - 1][1] - 10}
        fontFamily="ui-monospace, SF Mono, monospace" fontSize="10" fill={c.accent} fontWeight="600">
        82
      </text>
    </svg>
  );
}

function ArrowIcon({ dir, color, size = 20 }) {
  if (dir === 'up') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 16V4M5 9l5-5 5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 4v12M15 11l-5 5-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// P3-4 — MEASUREMENTS ENTRY
// ══════════════════════════════════════════════════════════════
function S17_Measurements_Entry({ dark }) {
  const c = useACT(dark);
  const [active, setActive] = React.useState('waist');
  const fields = [
    { k: 'chest', l: 'Chest', v: '42.0', prev: '41.8' },
    { k: 'waist', l: 'Waist', v: '33.4', prev: '34.0' },
    { k: 'hips',  l: 'Hips',  v: '39.8', prev: '40.0' },
    { k: 'arm',   l: 'Arm',   v: '14.8', prev: '14.7' },
    { k: 'thigh', l: 'Thigh', v: '23.2', prev: '23.3' },
    { k: 'neck',  l: 'Neck',  v: '15.2', prev: '15.2' },
  ];
  const Key = ({ v, dimmed, wide }) => (
    <div style={{
      padding: '16px 0', textAlign: 'center',
      gridColumn: wide ? 'span 2' : 'auto',
      fontFamily: ACFonts.display, fontSize: 24, fontWeight: 500,
      color: dimmed ? c.dim : c.fg,
      background: c.card, borderRadius: 14,
    }}>{v}</div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Measurements</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>Save</ACLabel>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <ACLabel size={12} color={c.dim}>Sat · 18 Apr</ACLabel>

        {/* Field tabs */}
        <div style={{
          marginTop: 14, display: 'flex', gap: 6, overflow: 'auto',
          paddingBottom: 2,
        }}>
          {fields.map(f => {
            const on = f.k === active;
            return (
              <div key={f.k} onClick={() => setActive(f.k)} style={{
                padding: '8px 14px', borderRadius: 999,
                background: on ? c.fg : c.card,
                color: on ? c.bg : c.fg,
                fontSize: 12, fontWeight: 600,
                flexShrink: 0, cursor: 'pointer',
              }}>{f.l}</div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '22px 28px 0', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 110, fontWeight: 700,
            letterSpacing: -4.5, lineHeight: 0.9, color: c.fg,
            fontVariantNumeric: 'tabular-nums',
          }}>
            33<span style={{ color: c.accent }}>.4</span>
          </div>
          <ACLabel size={13} color={c.dim} style={{ paddingBottom: 16 }}>in</ACLabel>
        </div>

        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ACChip accent dark={dark}>↓ 0.6 vs last</ACChip>
          <ACLabel size={11} color={c.dim}>Previous 34.0 · Mar 18</ACLabel>
        </div>

        {/* Mini trend */}
        <div style={{ marginTop: 18, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <ACLabel size={11} color={c.dim}>Waist · 6 months</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>−1.2 in</ACLabel>
          </div>
          <ACLine w={272} h={46} dark={dark} data={
            [34.6,34.4,34.2,34.0,33.8,33.4].map((v,i)=>({k:i,v}))
          }/>
        </div>
      </div>

      <div style={{ padding: '14px 14px 18px', background: c.bg }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k, i) => (
            <Key key={k + i} v={k} dimmed={k === '⌫' || k === '.'} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P3-5 — PROGRESS PHOTOS
// ══════════════════════════════════════════════════════════════
function S18_Progress_Photos({ dark }) {
  const c = useACT(dark);
  const months = [
    { m: 'Apr 18', w: '182.4', bf: '17.2', latest: true },
    { m: 'Mar 18', w: '184.8', bf: '18.0' },
    { m: 'Feb 18', w: '186.2', bf: '18.5' },
    { m: 'Jan 18', w: '188.4', bf: '19.2' },
    { m: 'Dec 18', w: '189.0', bf: '19.4' },
    { m: 'Nov 18', w: '188.2', bf: '19.0' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Progress · photos</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            6 months
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 999, background: c.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CameraIconSolid color={c.ink} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
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
            <ACLabel size={12} color={c.dim}>All months · 6</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>Front view</ACLabel>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {months.map((m, i) => (
              <PhotoCard key={i} m={m} c={c} dark={dark} />
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 22, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
            Photos stay on-device. Never leave your phone without your permission.
          </ACLabel>
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

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

Object.assign(window, {
  S14_Body_Dashboard, S15_Labs_Inbox, S16_Biomarker_Detail,
  S17_Measurements_Entry, S18_Progress_Photos,
});
