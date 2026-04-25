/* atlas.core — iOS widget system
 * SwiftUI / WidgetKit-faithful sizing, spacing, type ramp.
 * Sizes (pt, iPhone 15 Pro reference):
 *   small  158 × 158
 *   medium 338 × 158
 *   large  338 × 354
 *   lock circular  72 × 72
 *   lock rectangular 158 × 72
 *   lock inline ~338 × 22
 * Corner radius: 22 (system widget radius)
 * Internal padding: 16 (Apple's default for widgets)
 */

const { useMemo } = React;

/* ─────────────────────────────────────────────────────────────
 *  TOKENS
 * ───────────────────────────────────────────────────────────── */

const wTokens = {
  // atlas.core brand
  ink:    "#0a0a0a",
  paper:  "#efe9da",
  accent: "#e8b500",
  // SF system
  sfPro: '-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif',
  sfRounded: '-apple-system, "SF Pro Rounded", "SF Pro", system-ui, sans-serif',
  // widget radius
  radius: 22,
};

/* ─────────────────────────────────────────────────────────────
 *  SF SYMBOL — minimal stand-ins, drawn flat to match SF weight
 * ───────────────────────────────────────────────────────────── */
function SF({ name, size = 14, color = "currentColor", weight = 600 }) {
  const sw = weight >= 700 ? 2.4 : weight >= 600 ? 2.1 : 1.8;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "figure.strengthtraining":
      // dumbbell glyph
      return (<svg {...common}><path d="M3 9v6M5 7v10M19 7v10M21 9v6M5 12h14"/></svg>);
    case "fork.knife":
      return (<svg {...common}><path d="M6 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M16 3c-1.5 1-2 3-2 5s.5 3 2 3v9"/></svg>);
    case "figure.walk":
      return (<svg {...common}><circle cx="13" cy="4" r="1.5"/><path d="M9 22l3-7-3-3 1-5 5 3 2 4M11 12l-3 4"/></svg>);
    case "ruler":
      return (<svg {...common}><path d="M3 14l11-11 7 7-11 11zM7 11l2 2M10 8l2 2M13 5l2 2M5 13l2 2"/></svg>);
    case "flame":
      return (<svg {...common}><path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>);
    case "checkmark":
      return (<svg {...common}><path d="M5 12l5 5 9-11"/></svg>);
    case "checkmark.circle.fill":
      return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="11"/><path d="M6.5 12.5l3.5 3.5 7-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>);
    case "circle":
      return (<svg {...common}><circle cx="12" cy="12" r="10"/></svg>);
    case "plus":
      return (<svg {...common}><path d="M12 5v14M5 12h14"/></svg>);
    case "plus.circle.fill":
      return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="11"/><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none"/></svg>);
    case "chevron.right":
      return (<svg {...common}><path d="M9 6l6 6-6 6"/></svg>);
    case "calendar":
      return (<svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>);
    case "arrow.up.right":
      return (<svg {...common}><path d="M7 17L17 7M9 7h8v8"/></svg>);
    case "clock":
      return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "scale.3d":
      return (<svg {...common}><path d="M3 6l9-3 9 3v12l-9 3-9-3z"/><path d="M3 6l9 3 9-3M12 9v12"/></svg>);
    case "bolt.fill":
      return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M13 2L4 14h6l-2 8 9-12h-6z"/></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="9"/></svg>);
  }
}

/* ─────────────────────────────────────────────────────────────
 *  WIDGET SHELL — handles size, corner radius, light/dark
 * ───────────────────────────────────────────────────────────── */
function W({ size = "small", dark = false, accent = false, children, tint }) {
  const dims = {
    small:  { w: 158, h: 158 },
    medium: { w: 338, h: 158 },
    large:  { w: 338, h: 354 },
  }[size];
  const bg = tint || (accent ? wTokens.accent : (dark ? "#1c1c1e" : "#ffffff"));
  const fg = accent ? wTokens.ink : (dark ? "#ffffff" : wTokens.ink);
  return (
    <div style={{
      width: dims.w, height: dims.h,
      borderRadius: wTokens.radius,
      background: bg,
      color: fg,
      fontFamily: wTokens.sfPro,
      overflow: "hidden",
      boxShadow: dark ? "0 8px 22px rgba(0,0,0,0.45)" : "0 8px 22px rgba(10,10,10,0.10)",
      position: "relative",
      letterSpacing: "-0.2px",
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  RING — Apple-style activity ring
 * ───────────────────────────────────────────────────────────── */
function Ring({ size = 56, stroke = 7, value = 0.6, color = wTokens.accent, track }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const trk = track || "rgba(10,10,10,0.10)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={trk} strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={`${c * Math.min(value, 1)} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  WIDGET 1 — TODAY (small / medium / large)
 * ───────────────────────────────────────────────────────────── */
function WidgetTodaySmall({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  return (
    <W size="small" dark={dark}>
      <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>today</span>
          <SF name="bolt.fill" size={12} color={wTokens.accent}/>
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, fontFamily: wTokens.sfRounded, letterSpacing: -1 }}>Push A</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: dim, marginTop: 4 }}>5 exercises · 48 min</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ring size={28} stroke={4} value={0.42} color={wTokens.accent} track={dark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.10)"}/>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>1,248 kcal</div>
            <div style={{ fontSize: 10, color: dim }}>of 2,950</div>
          </div>
        </div>
      </div>
    </W>
  );
}

function WidgetTodayMedium({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const hair = dark ? "rgba(255,255,255,0.10)" : "rgba(10,10,10,0.08)";
  return (
    <W size="medium" dark={dark}>
      <div style={{ padding: 16, height: "100%", display: "flex" }}>
        {/* left: workout */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 14, borderRight: `1px solid ${hair}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>today</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: dim }}>Tue · Apr 28</span>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, fontFamily: wTokens.sfRounded, letterSpacing: -0.8 }}>Push A</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: dim, marginTop: 4 }}>Bench · OHP · Dips</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
            <SF name="clock" size={12} color={dim}/>
            <span style={{ color: dim }}>5 ex · 48 min</span>
          </div>
        </div>
        {/* right: nutrition rings */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingLeft: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>fuel</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Ring size={56} stroke={6} value={0.42} color={wTokens.accent} track={dark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.10)"}/>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: wTokens.sfRounded, letterSpacing: -0.6, lineHeight: 1 }}>1,248</div>
              <div style={{ fontSize: 11, color: dim, marginTop: 2 }}>of 2,950 kcal</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 600 }}>
            <span><span style={{ color: dim }}>P </span>92g</span>
            <span><span style={{ color: dim }}>C </span>142g</span>
            <span><span style={{ color: dim }}>F </span>38g</span>
          </div>
        </div>
      </div>
    </W>
  );
}

function WidgetTodayLarge({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const hair = dark ? "rgba(255,255,255,0.10)" : "rgba(10,10,10,0.08)";
  return (
    <W size="large" dark={dark}>
      <div style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>atlas.core · today</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: dim }}>Tue · Apr 28</span>
        </div>

        {/* workout block */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, fontFamily: wTokens.sfRounded, letterSpacing: -1 }}>Push A</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: dim, marginTop: 4 }}>Bench · OHP · Incline · Dips · Lateral</div>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 19,
            background: wTokens.accent, color: wTokens.ink,
            display: "grid", placeItems: "center"
          }}>
            <SF name="figure.strengthtraining" size={20} color={wTokens.ink} weight={700}/>
          </div>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: hair }}/>

        {/* nutrition rings row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Ring size={84} stroke={9} value={0.42} color={wTokens.accent} track={dark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.10)"}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>fuel</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: wTokens.sfRounded, letterSpacing: -0.8, lineHeight: 1, marginTop: 2 }}>1,248 <span style={{ fontSize: 14, color: dim, fontWeight: 600 }}>/ 2,950</span></div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 600, marginTop: 6 }}>
              <span><span style={{ color: dim }}>Protein </span>92g</span>
              <span><span style={{ color: dim }}>Carbs </span>142g</span>
              <span><span style={{ color: dim }}>Fat </span>38g</span>
            </div>
          </div>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: hair }}/>

        {/* checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ChecklistRow done label="Morning weigh-in" detail="82.4 kg" dark={dark}/>
          <ChecklistRow done label="Breakfast logged" detail="412 kcal" dark={dark}/>
          <ChecklistRow label="Push A workout" detail="48 min" dark={dark}/>
          <ChecklistRow label="Lunch + dinner" detail="~1,300 kcal" dark={dark}/>
        </div>
      </div>
    </W>
  );
}

function ChecklistRow({ done, label, detail, dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const empty = dark ? "rgba(255,255,255,0.25)" : "rgba(10,10,10,0.22)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {done
        ? <SF name="checkmark.circle.fill" size={16} color={wTokens.accent}/>
        : <SF name="circle" size={16} color={empty}/>}
      <span style={{ fontSize: 13, fontWeight: 600, flex: 1, opacity: done ? 0.6 : 1, textDecoration: done ? "line-through" : "none" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: dim }}>{detail}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  WIDGET 2 — NEXT WORKOUT (small)
 * ───────────────────────────────────────────────────────────── */
function WidgetNextWorkoutSmall({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  return (
    <W size="small" dark={dark} accent={!dark}>
      <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SF name="figure.strengthtraining" size={18} color={dark ? wTokens.accent : wTokens.ink} weight={700}/>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)", textTransform: "uppercase" }}>next</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)" }}>Today · 6:30 PM</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, fontFamily: wTokens.sfRounded, letterSpacing: -1, marginTop: 4, color: dark ? "#fff" : wTokens.ink }}>Push A</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.65)", marginTop: 4 }}>Week 4 · Day 12</div>
        </div>
      </div>
    </W>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  WIDGET 3 — MACROS (small)
 * ───────────────────────────────────────────────────────────── */
function WidgetMacrosSmall({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const trk = dark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.10)";
  return (
    <W size="small" dark={dark}>
      <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>fuel</span>
          <SF name="fork.knife" size={12} color={dim}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ring size={64} stroke={7} value={0.42} color={wTokens.accent} track={trk}/>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: wTokens.sfRounded, letterSpacing: -0.6, lineHeight: 1 }}>1,248</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: dim, marginTop: 2 }}>of 2,950</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700 }}>
          <span><span style={{ color: dim }}>P </span>92</span>
          <span><span style={{ color: dim }}>C </span>142</span>
          <span><span style={{ color: dim }}>F </span>38</span>
        </div>
      </div>
    </W>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  WIDGET 4 — QUICK LOG (medium, interactive iOS 17)
 * ───────────────────────────────────────────────────────────── */
function WidgetQuickLogMedium({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const btn = dark ? "rgba(255,255,255,0.10)" : "rgba(10,10,10,0.06)";
  return (
    <W size="medium" dark={dark}>
      <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>quick log</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: dim }}>tap to log</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <QuickBtn dark={dark} icon="fork.knife" label="Meal"/>
          <QuickBtn dark={dark} icon="figure.walk" label="Cardio"/>
          <QuickBtn dark={dark} icon="ruler" label="Weigh"/>
          <QuickBtn dark={dark} icon="plus" label="More" accent/>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: dim }}>Last logged · 2:04 PM · Lunch · 612 kcal</div>
      </div>
    </W>
  );
}

function QuickBtn({ dark, icon, label, accent }) {
  const bg = accent ? wTokens.accent : (dark ? "rgba(255,255,255,0.10)" : "rgba(10,10,10,0.06)");
  const fg = accent ? wTokens.ink : (dark ? "#fff" : wTokens.ink);
  return (
    <div style={{
      background: bg, color: fg,
      borderRadius: 14,
      padding: "10px 4px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    }}>
      <SF name={icon} size={20} color={fg} weight={700}/>
      <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  WIDGET 5 — THIS WEEK (medium)
 * ───────────────────────────────────────────────────────────── */
function WidgetThisWeekMedium({ dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const empty = dark ? "rgba(255,255,255,0.10)" : "rgba(10,10,10,0.08)";
  // 7 days, mon-sun. true = workout completed, "rest" = scheduled rest, "today" = current
  const days = [
    { d: "M", state: "done" },
    { d: "T", state: "done" },
    { d: "W", state: "rest" },
    { d: "T", state: "today" },
    { d: "F", state: "planned" },
    { d: "S", state: "planned" },
    { d: "S", state: "rest" },
  ];
  return (
    <W size="medium" dark={dark}>
      <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: dim, textTransform: "uppercase" }}>this week</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: dim }}>Week 4</span>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: wTokens.sfRounded, letterSpacing: -0.8, lineHeight: 1 }}>2 of 4 done</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: dim, marginTop: 4 }}>Push, pull complete · legs Thursday</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {days.map((d, i) => (
            <DayPip key={i} {...d} dark={dark}/>
          ))}
        </div>
      </div>
    </W>
  );
}

function DayPip({ d, state, dark }) {
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";
  const empty = dark ? "rgba(255,255,255,0.10)" : "rgba(10,10,10,0.08)";
  let dotBg, dotFg = wTokens.ink, ringBorder = "none";
  if (state === "done") { dotBg = wTokens.accent; }
  else if (state === "today") { dotBg = "transparent"; ringBorder = `2px solid ${wTokens.accent}`; dotFg = dark ? "#fff" : wTokens.ink; }
  else if (state === "rest") { dotBg = empty; dotFg = dim; }
  else { dotBg = empty; dotFg = dim; }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: dim, letterSpacing: 0.4 }}>{d}</span>
      <div style={{
        width: 26, height: 26, borderRadius: 13,
        background: dotBg, border: ringBorder,
        display: "grid", placeItems: "center",
        color: dotFg,
      }}>
        {state === "done" && <SF name="checkmark" size={12} color={wTokens.ink} weight={700}/>}
        {state === "rest" && <span style={{ fontSize: 10, fontWeight: 700 }}>·</span>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  LOCK SCREEN WIDGETS (iOS 16+)
 * ───────────────────────────────────────────────────────────── */
function LockCircular({ value = 0.42, label = "FUEL", num = "42%" }) {
  // 72×72 — rendered with white-on-glass aesthetic
  const stroke = 6;
  const r = (72 - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{
      width: 72, height: 72, borderRadius: 36,
      background: "rgba(255,255,255,0.20)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      display: "grid", placeItems: "center",
      position: "relative",
      fontFamily: wTokens.sfRounded,
      color: "#fff",
    }}>
      <svg width={72} height={72} style={{ position: "absolute", inset: 0 }}>
        <circle cx={36} cy={36} r={r} stroke="rgba(255,255,255,0.30)" strokeWidth={stroke} fill="none"/>
        <circle cx={36} cy={36} r={r}
          stroke="#fff" strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * value} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"/>
      </svg>
      <div style={{ textAlign: "center", lineHeight: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{num}</div>
      </div>
    </div>
  );
}

function LockRectangular() {
  return (
    <div style={{
      width: 158, height: 72, borderRadius: 14,
      background: "rgba(255,255,255,0.20)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      padding: "10px 14px",
      color: "#fff",
      fontFamily: wTokens.sfPro,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <SF name="figure.strengthtraining" size={11} color="#fff" weight={700}/>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, opacity: 0.85 }}>NEXT · 6:30 PM</span>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: wTokens.sfRounded, letterSpacing: -0.4, lineHeight: 1 }}>Push A</div>
        <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.75, marginTop: 2 }}>5 ex · 48 min</div>
      </div>
    </div>
  );
}

function LockInline() {
  return (
    <div style={{
      width: 338, height: 22, padding: "0 10px",
      display: "flex", alignItems: "center", gap: 6,
      color: "#fff", fontFamily: wTokens.sfPro,
      fontSize: 13, fontWeight: 600,
      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
    }}>
      <SF name="bolt.fill" size={12} color="#fff"/>
      <span>Push A · 1,248 / 2,950 kcal · 2 of 4 this week</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  iOS HOME SCREEN MOCK — for showcasing widgets in context
 * ───────────────────────────────────────────────────────────── */

const iosWallpaperLight = "linear-gradient(180deg, #c9b894 0%, #b59b6e 50%, #8a7148 100%)";
const iosWallpaperDark = "linear-gradient(180deg, #1a2238 0%, #0f1525 50%, #060912 100%)";
const iosWallpaperLock = "linear-gradient(180deg, #2a1a14 0%, #1a0f0c 60%, #0a0604 100%)";

function HomeScreen({ dark, children, label }) {
  const wp = dark ? iosWallpaperDark : iosWallpaperLight;
  return (
    <div>
      <div style={{ fontFamily: wTokens.sfPro, fontSize: 11, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: "rgba(10,10,10,0.55)", marginBottom: 10 }}>{label}</div>
      <div style={{
        width: 396, height: 720,
        background: wp,
        borderRadius: 48,
        padding: "18px 18px 28px",
        boxShadow: "0 30px 60px rgba(10,10,10,0.30), inset 0 0 0 6px rgba(0,0,0,0.6), inset 0 0 0 8px rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px 12px", color: "#fff", fontFamily: wTokens.sfPro, fontSize: 14, fontWeight: 600 }}>
          <span>9:41</span>
          <div style={{ width: 110, height: 30, borderRadius: 15, background: "#000" }}/>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <SignalDots/>
            <WifiArc/>
            <BatteryIcon/>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function SignalDots() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="#fff">
      <rect x="0" y="6" width="3" height="4" rx="0.5"/>
      <rect x="4" y="4" width="3" height="6" rx="0.5"/>
      <rect x="8" y="2" width="3" height="8" rx="0.5"/>
      <rect x="12" y="0" width="3" height="10" rx="0.5"/>
    </svg>
  );
}
function WifiArc() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#fff" strokeWidth="1.6">
      <path d="M1 4c1.5-1.5 4-2.5 6-2.5s4.5 1 6 2.5"/>
      <path d="M3 6c1-1 2.5-1.5 4-1.5s3 0.5 4 1.5"/>
      <circle cx="7" cy="9" r="0.8" fill="#fff"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="26" height="12" viewBox="0 0 26 12">
      <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6"/>
      <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#fff"/>
      <rect x="23" y="4" width="2" height="4" rx="0.6" fill="#fff" opacity="0.6"/>
    </svg>
  );
}

function AppIcon({ label, fill = "#fff", glyph }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 13,
        background: fill,
        display: "grid", placeItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}>{glyph}</div>
      <span style={{ fontSize: 10, color: "#fff", fontFamily: wTokens.sfPro, fontWeight: 500, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  HOME SCREEN COMPOSITIONS
 * ───────────────────────────────────────────────────────────── */
function HomeLight() {
  return (
    <HomeScreen dark={false} label="home · light">
      <div style={{ padding: "8px 0 0", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <WidgetTodayLarge dark={false}/>
        <div style={{ display: "flex", gap: 14 }}>
          <WidgetMacrosSmall dark={false}/>
          <WidgetNextWorkoutSmall dark={false}/>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          <AppIcon label="atlas.core" fill={wTokens.accent} glyph={<SF name="bolt.fill" size={28} color={wTokens.ink}/>}/>
          <AppIcon label="Health" fill="#fff" glyph={<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 27c-7-5-11-9-11-14a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 5-4 9-11 14z" fill="#ff375f"/></svg>}/>
          <AppIcon label="Notes" fill="#fff" glyph={<div style={{ width: 30, height: 30, background: "#ffd60a", borderRadius: 4 }}/>}/>
          <AppIcon label="Camera" fill="#222" glyph={<div style={{ width: 30, height: 30, borderRadius: 6, background: "#444", display: "grid", placeItems: "center" }}><div style={{ width: 14, height: 14, border: "2px solid #fff", borderRadius: "50%" }}/></div>}/>
        </div>
      </div>
    </HomeScreen>
  );
}

function HomeDark() {
  return (
    <HomeScreen dark={true} label="home · dark">
      <div style={{ padding: "8px 0 0", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <WidgetTodaySmall dark/>
          <WidgetNextWorkoutSmall dark/>
        </div>
        <WidgetTodayMedium dark/>
        <WidgetThisWeekMedium dark/>
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          <AppIcon label="atlas.core" fill={wTokens.accent} glyph={<SF name="bolt.fill" size={28} color={wTokens.ink}/>}/>
          <AppIcon label="Health" fill="#1c1c1e" glyph={<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 27c-7-5-11-9-11-14a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 5-4 9-11 14z" fill="#ff375f"/></svg>}/>
          <AppIcon label="Notes" fill="#1c1c1e" glyph={<div style={{ width: 30, height: 30, background: "#ffd60a", borderRadius: 4 }}/>}/>
          <AppIcon label="Camera" fill="#1c1c1e" glyph={<div style={{ width: 30, height: 30, borderRadius: 6, background: "#2c2c2e", display: "grid", placeItems: "center" }}><div style={{ width: 14, height: 14, border: "2px solid #fff", borderRadius: "50%" }}/></div>}/>
        </div>
      </div>
    </HomeScreen>
  );
}

function LockScreen() {
  return (
    <div>
      <div style={{ fontFamily: wTokens.sfPro, fontSize: 11, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: "rgba(10,10,10,0.55)", marginBottom: 10 }}>lock screen</div>
      <div style={{
        width: 396, height: 720,
        background: iosWallpaperLock,
        borderRadius: 48,
        padding: "18px 18px 28px",
        boxShadow: "0 30px 60px rgba(10,10,10,0.30), inset 0 0 0 6px rgba(0,0,0,0.6), inset 0 0 0 8px rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px 12px", color: "#fff", fontFamily: wTokens.sfPro, fontSize: 14, fontWeight: 600 }}>
          <span>9:41</span>
          <div style={{ width: 110, height: 30, borderRadius: 15, background: "#000" }}/>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <SignalDots/>
            <WifiArc/>
            <BatteryIcon/>
          </div>
        </div>

        {/* date + time */}
        <div style={{ textAlign: "center", color: "#fff", marginTop: 18, fontFamily: wTokens.sfPro }}>
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>Tuesday, April 28</div>
        </div>

        {/* inline widget under date */}
        <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
          <LockInline/>
        </div>

        {/* big clock */}
        <div style={{ textAlign: "center", marginTop: 4, color: "#fff", fontFamily: wTokens.sfPro, fontSize: 96, fontWeight: 200, letterSpacing: -4, lineHeight: 1 }}>9:41</div>

        {/* widget row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, padding: "0 18px" }}>
          <LockCircular value={0.42} label="FUEL" num="42%"/>
          <LockRectangular/>
          <LockCircular value={0.5} label="WEEK" num="2/4"/>
        </div>

        {/* bottom shortcut row */}
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 38px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.20)", backdropFilter: "blur(14px)", display: "grid", placeItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6"><path d="M9 9V7a3 3 0 0 1 6 0v2M6 9h12v11H6z"/></svg>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.20)", backdropFilter: "blur(14px)", display: "grid", placeItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M5 8h2l1-2h8l1 2h2v11H5z"/></svg>
          </div>
        </div>

        {/* home indicator */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.7)" }}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  GALLERY — every widget at every size, light + dark
 * ───────────────────────────────────────────────────────────── */
function Gallery({ dark }) {
  const dim = "rgba(10,10,10,0.55)";
  const cellLabel = (label, sub) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: wTokens.sfPro, fontSize: 13, fontWeight: 700, color: wTokens.ink, letterSpacing: -0.2 }}>{label}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: dim, marginTop: 2 }}>{sub}</div>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 24 }}>
      {/* TODAY */}
      <div>
        {cellLabel("Today · small", "158 × 158 pt")}
        <WidgetTodaySmall dark={dark}/>
      </div>
      <div>
        {cellLabel("Today · medium", "338 × 158 pt")}
        <WidgetTodayMedium dark={dark}/>
      </div>
      <div style={{ gridColumn: "1 / span 2" }}>
        {cellLabel("Today · large", "338 × 354 pt — flagship widget")}
        <WidgetTodayLarge dark={dark}/>
      </div>

      {/* NEXT WORKOUT */}
      <div>
        {cellLabel("Next workout · small", "158 × 158 pt — accent variant")}
        <WidgetNextWorkoutSmall dark={dark}/>
      </div>
      <div>
        {cellLabel("Macros · small", "158 × 158 pt")}
        <WidgetMacrosSmall dark={dark}/>
      </div>

      {/* MEDIUMS */}
      <div style={{ gridColumn: "1 / span 2" }}>
        {cellLabel("Quick log · medium", "338 × 158 pt — interactive (iOS 17 buttons)")}
        <WidgetQuickLogMedium dark={dark}/>
      </div>
      <div style={{ gridColumn: "1 / span 2" }}>
        {cellLabel("This week · medium", "338 × 158 pt — quiet load summary, no streak")}
        <WidgetThisWeekMedium dark={dark}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  EXPORT
 * ───────────────────────────────────────────────────────────── */

Object.assign(window, {
  WidgetTodaySmall, WidgetTodayMedium, WidgetTodayLarge,
  WidgetNextWorkoutSmall, WidgetMacrosSmall,
  WidgetQuickLogMedium, WidgetThisWeekMedium,
  LockCircular, LockRectangular, LockInline,
  HomeLight, HomeDark, LockScreen,
  Gallery, SF,
});
