/* atlas.core — watchOS experience
 * Reference device: Apple Watch Series 10 / Ultra 2 — 45mm screen
 * Render width: 198 × 242 pt (45mm screen, accounting for bezel/curve)
 * Type ramp: SF Pro Rounded (system) + SF Pro Display
 * Default background: pure black (#000) — OLED honest
 */

const wt = {
  ink: "#000",
  paper: "#fff",
  accent: "#e8b500",
  // watch system grays
  g6: "#1c1c1e",   // tertiary
  g5: "#2c2c2e",
  g4: "#3a3a3c",
  g3: "#48484a",
  g2: "#8e8e93",   // secondary label
  g1: "#aeaeb2",
  // health system colors (matches Apple watchOS conventions)
  pink: "#ff375f",   // move
  green: "#92e832",  // exercise
  cyan: "#00d4ff",   // stand
  red: "#ff3b30",    // heart
  sf: '-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif',
  rounded: '-apple-system, "SF Pro Rounded", "SF Pro", system-ui, sans-serif',
};

/* ─────────────────────────────────────────────────────────────
 *  WATCH FRAME — 45mm Series 10
 * ───────────────────────────────────────────────────────────── */
function WatchFrame({ children, label, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 270,
        padding: 12,
        background: "#0a0a0a",
        borderRadius: 64,
        boxShadow: "0 18px 36px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        {/* digital crown stub */}
        <div style={{ position: "absolute", right: -6, top: 80, width: 8, height: 32, borderRadius: 3, background: "#1c1c1e", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}/>
        <div style={{ position: "absolute", right: -5, top: 130, width: 6, height: 22, borderRadius: 2, background: "#1c1c1e" }}/>
        {/* screen */}
        <div style={{
          width: 246, height: 300,
          background: "#000",
          borderRadius: 50,
          overflow: "hidden",
          position: "relative",
          fontFamily: wt.sf,
        }}>
          {children}
        </div>
      </div>
      {label && (
        <div style={{ textAlign: "center", maxWidth: 270 }}>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 700, color: "#0a0a0a", letterSpacing: -0.2 }}>{label}</div>
          {sub && <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(10,10,10,0.55)", marginTop: 2 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

/* SF symbol stand-ins — minimal, watch-weight */
function WSF({ name, size = 18, color = "#fff", weight = 600 }) {
  const sw = weight >= 700 ? 2.4 : 2.0;
  const c = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "play.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M7 4l13 8-13 8z"/></svg>);
    case "pause.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>);
    case "checkmark": return (<svg {...c}><path d="M5 12l5 5 9-11"/></svg>);
    case "checkmark.circle.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="11"/><path d="M6.5 12.5l3.5 3.5 7-8" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>);
    case "plus": return (<svg {...c}><path d="M12 5v14M5 12h14"/></svg>);
    case "minus": return (<svg {...c}><path d="M5 12h14"/></svg>);
    case "fork.knife": return (<svg {...c}><path d="M6 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M16 3c-1.5 1-2 3-2 5s.5 3 2 3v9"/></svg>);
    case "scale.3d": return (<svg {...c}><path d="M3 6l9-3 9 3v12l-9 3-9-3z"/><path d="M3 6l9 3 9-3M12 9v12"/></svg>);
    case "drop.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 3c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z"/></svg>);
    case "heart.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 21s-8-5-8-12a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 7-8 12-8 12z"/></svg>);
    case "figure.strengthtraining": return (<svg {...c}><path d="M3 9v6M5 7v10M19 7v10M21 9v6M5 12h14"/></svg>);
    case "bolt.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M13 2L4 14h6l-2 8 9-12h-6z"/></svg>);
    case "chevron.left": return (<svg {...c}><path d="M15 18l-6-6 6-6"/></svg>);
    case "chevron.right": return (<svg {...c}><path d="M9 6l6 6-6 6"/></svg>);
    case "ellipsis": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>);
    case "stop.fill": return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><rect x="5" y="5" width="14" height="14" rx="2"/></svg>);
    case "arrow.clockwise": return (<svg {...c}><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>);
    default: return <span/>;
  }
}

/* status bar (watch top — time always present) */
function WatchStatus({ time = "9:41", label, fg = "#fff" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px 4px", color: fg, fontSize: 14, fontWeight: 600, fontFamily: wt.rounded }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: wt.accent }}>{label || ""}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S1 · MAIN ENTRY (list)
 * ───────────────────────────────────────────────────────────── */
function ScreenMain() {
  return (
    <>
      <WatchStatus label="atlas.core"/>
      <div style={{ padding: "0 8px 12px", display: "flex", flexDirection: "column", gap: 8, color: "#fff" }}>
        <ListBtn glyph="figure.strengthtraining" tint={wt.accent} title="Push A" sub="Today · 5 ex"/>
        <ListBtn glyph="fork.knife" tint={wt.g5} title="Log meal"/>
        <ListBtn glyph="scale.3d" tint={wt.g5} title="Weigh-in"/>
        <ListBtn glyph="drop.fill" tint={wt.g5} title="Water" right="6 / 8"/>
      </div>
    </>
  );
}

function ListBtn({ glyph, tint, title, sub, right }) {
  const isAccent = tint === wt.accent;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px",
      background: tint,
      borderRadius: 18,
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: isAccent ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.10)", display: "grid", placeItems: "center" }}>
        <WSF name={glyph} size={16} color={isAccent ? "#000" : "#fff"} weight={700}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: isAccent ? "#000" : "#fff", letterSpacing: -0.2, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, fontWeight: 500, color: isAccent ? "rgba(0,0,0,0.6)" : wt.g2, marginTop: 2 }}>{sub}</div>}
      </div>
      {right && <span style={{ fontSize: 13, fontWeight: 700, color: isAccent ? "#000" : "#fff", fontFamily: wt.rounded }}>{right}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S2 · WORKOUT — pre-start
 * ───────────────────────────────────────────────────────────── */
function ScreenWorkoutPre() {
  return (
    <>
      <WatchStatus/>
      <div style={{ padding: "0 16px 10px", color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: wt.g2, letterSpacing: 0.4, textTransform: "uppercase" }}>WEEK 4 · DAY 12</div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -1, lineHeight: 1, marginTop: 3 }}>Push A</div>
        <div style={{ fontSize: 11, color: wt.g2, fontWeight: 500, marginTop: 3 }}>5 exercises · ~48 min</div>

        <button style={{
          marginTop: 10,
          width: "100%",
          padding: "12px",
          background: wt.accent,
          color: "#000",
          border: 0,
          borderRadius: 22,
          fontSize: 15, fontWeight: 800,
          fontFamily: wt.rounded,
          letterSpacing: -0.2,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <WSF name="play.fill" size={13} color="#000"/>
          Start
        </button>

        <div style={{ marginTop: 8, padding: "7px 10px", background: wt.g6, borderRadius: 12, fontSize: 10, color: wt.g1, fontWeight: 600, textAlign: "center" }}>
          Bench · OHP · Incline · Dips · Lateral
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S3 · WORKOUT — set in progress (HERO)
 * ───────────────────────────────────────────────────────────── */
function ScreenWorkoutLogging() {
  return (
    <>
      <WatchStatus label="2 / 5"/>
      <div style={{ padding: "0 14px 8px", color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: wt.g2, letterSpacing: 0.4, textTransform: "uppercase" }}>BENCH PRESS</div>
        <div style={{ fontSize: 12, color: wt.g2, fontWeight: 600, marginTop: 2 }}>Set 3 of 4 · last 80×8</div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 56, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -2.4, lineHeight: 1 }}>82.5</span>
          <span style={{ fontSize: 14, color: wt.g2, fontWeight: 600 }}>kg</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: -2 }}>
          <span style={{ fontSize: 30, fontWeight: 800, fontFamily: wt.rounded, color: wt.accent, letterSpacing: -1 }}>× 8</span>
          <span style={{ fontSize: 11, color: wt.g2, fontWeight: 600 }}>reps</span>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <ActionBtn glyph="minus" tint={wt.g5}/>
          <ActionBtn glyph="checkmark" tint={wt.accent} dark wide/>
          <ActionBtn glyph="plus" tint={wt.g5}/>
        </div>
      </div>
    </>
  );
}

function ActionBtn({ glyph, tint, dark, wide, label }) {
  return (
    <div style={{
      flex: wide ? 2 : 1,
      height: 38,
      borderRadius: 19,
      background: tint,
      display: "grid", placeItems: "center",
      color: dark ? "#000" : "#fff",
    }}>
      <WSF name={glyph} size={18} color={dark ? "#000" : "#fff"} weight={700}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S4 · REST TIMER
 * ───────────────────────────────────────────────────────────── */
function ScreenRest() {
  // ring at 70%
  const r = 68; const stroke = 7;
  const c = 2 * Math.PI * r;
  return (
    <>
      <WatchStatus label="REST"/>
      <div style={{ position: "relative", height: 200, display: "grid", placeItems: "center", color: "#fff" }}>
        <svg width={170} height={170} style={{ position: "absolute" }}>
          <circle cx={85} cy={85} r={r} stroke={wt.g6} strokeWidth={stroke} fill="none"/>
          <circle cx={85} cy={85} r={r} stroke={wt.accent} strokeWidth={stroke} fill="none"
            strokeDasharray={`${c * 0.7} ${c}`} strokeLinecap="round"
            transform="rotate(-90 85 85)"/>
        </svg>
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: wt.g2, letterSpacing: 0.4, textTransform: "uppercase" }}>NEXT IN</div>
          <div style={{ fontSize: 48, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -1.6, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>0:42</div>
          <div style={{ fontSize: 11, color: wt.g2, fontWeight: 600, marginTop: 4 }}>Bench · set 4 of 4</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 14px 8px" }}>
        <ActionBtn glyph="minus" tint={wt.g5}/>
        <ActionBtn glyph="play.fill" tint={wt.accent} dark wide/>
        <ActionBtn glyph="plus" tint={wt.g5}/>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S5 · QUICK LOG MEAL (page 1 — pick)
 * ───────────────────────────────────────────────────────────── */
function ScreenQuickMeal() {
  return (
    <>
      <WatchStatus label="LOG MEAL"/>
      <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 6, color: "#fff" }}>
        <SuggestRow label="Oatmeal + berries" kcal={412} tint={wt.g5}/>
        <SuggestRow label="Chicken bowl" kcal={612} tint={wt.g5}/>
        <SuggestRow label="Yogurt + nuts" kcal={280} tint={wt.g5}/>
        <SuggestRow label="Custom…" kcal={null} tint={wt.g6} dim/>
      </div>
    </>
  );
}

function SuggestRow({ label, kcal, tint, dim }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: tint,
      borderRadius: 16,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: dim ? wt.g1 : "#fff", letterSpacing: -0.2 }}>{label}</span>
      {kcal && <span style={{ fontSize: 13, fontWeight: 700, color: wt.accent, fontFamily: wt.rounded, fontVariantNumeric: "tabular-nums" }}>{kcal}</span>}
      {!kcal && <WSF name="chevron.right" size={12} color={wt.g2}/>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S6 · WEIGH-IN (Crown to set)
 * ───────────────────────────────────────────────────────────── */
function ScreenWeighIn() {
  return (
    <>
      <WatchStatus label="WEIGH-IN"/>
      <div style={{ padding: "0 16px 8px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: wt.g2, letterSpacing: 0.4, textTransform: "uppercase", marginTop: 2 }}>BODY WEIGHT</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 56, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -2.4, lineHeight: 1 }}>82.4</span>
          <span style={{ fontSize: 14, color: wt.g2, fontWeight: 600 }}>kg</span>
        </div>
        <div style={{ fontSize: 10, color: wt.g2, fontWeight: 600, marginTop: 4 }}>↓ 0.3 kg from last week</div>

        <div style={{ marginTop: 10, padding: "7px 10px", background: wt.g6, borderRadius: 12, fontSize: 10, color: wt.g1, fontWeight: 600, display: "flex", justifyContent: "center", gap: 6, alignItems: "center" }}>
          <CrownIcon/> Turn crown · tap to save
        </div>
      </div>
    </>
  );
}

function CrownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={wt.g1} strokeWidth="2">
      <circle cx="12" cy="12" r="6"/>
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S7 · TODAY GLANCE (page-based, page 1 of 3)
 * ───────────────────────────────────────────────────────────── */
function ScreenToday() {
  const r = 60; const stroke = 8;
  const c = 2 * Math.PI * r;
  return (
    <>
      <WatchStatus label="TODAY"/>
      <div style={{ position: "relative", height: 250, color: "#fff" }}>
        <svg width={180} height={180} style={{ position: "absolute", left: "50%", top: 8, transform: "translateX(-50%)" }}>
          <circle cx={90} cy={90} r={r} stroke={wt.g6} strokeWidth={stroke} fill="none"/>
          <circle cx={90} cy={90} r={r} stroke={wt.accent} strokeWidth={stroke} fill="none"
            strokeDasharray={`${c * 0.42} ${c}`} strokeLinecap="round"
            transform="rotate(-90 90 90)"/>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: 180, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: wt.g2, letterSpacing: 0.4, textTransform: "uppercase" }}>FUEL</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -1.2, marginTop: 3 }}>1,248</div>
            <div style={{ fontSize: 10, color: wt.g2, fontWeight: 600, marginTop: 3 }}>of 2,950 kcal</div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, fontSize: 11, color: "#fff", fontWeight: 700, display: "flex", justifyContent: "center", gap: 10, fontFamily: wt.rounded, fontVariantNumeric: "tabular-nums" }}>
          <span>P 92</span><span>C 142</span><span>F 38</span>
        </div>
        {/* page dots */}
        <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: "#fff" }}/>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: wt.g4 }}/>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: wt.g4 }}/>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S8 · NOTIFICATION (long-look)
 * ───────────────────────────────────────────────────────────── */
function ScreenNotification() {
  return (
    <>
      <div style={{ padding: "10px 14px 8px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: wt.accent }}>
          <WSF name="bolt.fill" size={11} color={wt.accent}/>
          atlas.core
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -0.6, lineHeight: 1.1, marginTop: 8 }}>Push A in 30 min</div>
        <div style={{ fontSize: 12, color: wt.g1, fontWeight: 500, marginTop: 6, lineHeight: 1.3 }}>5 exercises · 48 min · last logged 4 days ago.</div>

        <button style={{ width: "100%", marginTop: 12, padding: "10px", background: wt.g5, color: "#fff", border: 0, borderRadius: 18, fontSize: 13, fontWeight: 700, fontFamily: wt.rounded }}>Start now</button>
        <button style={{ width: "100%", marginTop: 6, padding: "10px", background: "transparent", color: wt.g2, border: 0, borderRadius: 18, fontSize: 13, fontWeight: 600 }}>Snooze 15 min</button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  S9 · COMPLETE
 * ───────────────────────────────────────────────────────────── */
function ScreenComplete() {
  return (
    <div style={{ padding: 16, color: "#fff", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: wt.accent, display: "grid", placeItems: "center" }}>
        <WSF name="checkmark" size={32} color="#000" weight={700}/>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: wt.rounded, letterSpacing: -0.6, marginTop: 14 }}>Push A done</div>
      <div style={{ fontSize: 12, color: wt.g1, fontWeight: 600, marginTop: 6 }}>20 sets · 48:14 · 1 PR</div>
      <div style={{ marginTop: 14, padding: "8px 12px", background: wt.g6, borderRadius: 14, fontSize: 12, color: wt.accent, fontWeight: 700 }}>Bench · 82.5 × 8 PR</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 *  WATCH FACES — modular, infograph, rectangular complications
 * ───────────────────────────────────────────────────────────── */

/* INFOGRAPH face — circular complications around bezel */
function FaceInfograph() {
  // dial centered in 246x300 — cy=150, dial radius 120
  const W = 246, H = 300;
  const cx = 123, cy = 150;
  return (
    <div style={{ width: W, height: H, position: "relative", background: "#000" }}>
      {/* tick marks */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[...Array(12)].map((_, i) => {
          const a = i * 30 - 90;
          const rad = a * Math.PI / 180;
          const r1 = 134, r2 = 142;
          return (
            <line key={i}
              x1={cx + r1*Math.cos(rad)} y1={cy + r1*Math.sin(rad)}
              x2={cx + r2*Math.cos(rad)} y2={cy + r2*Math.sin(rad)}
              stroke="#fff" strokeWidth={i % 3 === 0 ? 2.5 : 1} opacity={i % 3 === 0 ? 0.9 : 0.4}
            />
          );
        })}
        {/* hour */}
        <line x1={cx} y1={cy} x2={cx + 58*Math.cos((130 - 90) * Math.PI/180)} y2={cy + 58*Math.sin((130 - 90) * Math.PI/180)} stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        {/* minute */}
        <line x1={cx} y1={cy} x2={cx + 92*Math.cos((246 - 90) * Math.PI/180)} y2={cy + 92*Math.sin((246 - 90) * Math.PI/180)} stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
        {/* second */}
        <line x1={cx} y1={cy} x2={cx + 108*Math.cos((180 - 90) * Math.PI/180)} y2={cy + 108*Math.sin((180 - 90) * Math.PI/180)} stroke={wt.accent} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="3.5" fill={wt.accent}/>
      </svg>
      {/* digital time — above center */}
      <div style={{ position: "absolute", top: cy - 78, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: wt.rounded, fontVariantNumeric: "tabular-nums" }}>9:41</div>

      {/* corner complications — pushed to the actual screen corners */}
      <div style={{ position: "absolute", top: 22, left: 22, width: 54, height: 54 }}>
        <ComplicationCorner kind="next"/>
      </div>
      <div style={{ position: "absolute", top: 22, right: 22, width: 54, height: 54 }}>
        <ComplicationCorner kind="fuel"/>
      </div>
      <div style={{ position: "absolute", bottom: 22, left: 22, width: 54, height: 54 }}>
        <ComplicationCorner kind="week"/>
      </div>
      <div style={{ position: "absolute", bottom: 22, right: 22, width: 54, height: 54 }}>
        <ComplicationCorner kind="weight"/>
      </div>
    </div>
  );
}

function ComplicationCorner({ kind }) {
  const r = 18; const stroke = 3;
  const c = 2 * Math.PI * r;
  if (kind === "next") {
    return (
      <div style={{ width: 50, height: 50, position: "relative" }}>
        <svg width={50} height={50}>
          <circle cx={25} cy={25} r={r} stroke={wt.g4} strokeWidth={stroke} fill="none"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div style={{ color: wt.accent, fontSize: 8, fontWeight: 800, letterSpacing: 0.4 }}>NEXT</div>
        </div>
        <div style={{ position: "absolute", left: -4, top: 32, fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: wt.rounded }}>Push A</div>
      </div>
    );
  }
  if (kind === "fuel") {
    return (
      <div style={{ width: 50, height: 50, position: "relative" }}>
        <svg width={50} height={50}>
          <circle cx={25} cy={25} r={r} stroke={wt.g4} strokeWidth={stroke} fill="none"/>
          <circle cx={25} cy={25} r={r} stroke={wt.accent} strokeWidth={stroke} fill="none"
            strokeDasharray={`${c * 0.42} ${c}`} strokeLinecap="round"
            transform="rotate(-90 25 25)"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: wt.rounded }}>42%</div>
        </div>
      </div>
    );
  }
  if (kind === "week") {
    return (
      <div style={{ width: 50, height: 50, position: "relative" }}>
        <svg width={50} height={50}>
          <circle cx={25} cy={25} r={r} stroke={wt.g4} strokeWidth={stroke} fill="none"/>
          <circle cx={25} cy={25} r={r} stroke="#fff" strokeWidth={stroke} fill="none"
            strokeDasharray={`${c * 0.5} ${c}`} strokeLinecap="round"
            transform="rotate(-90 25 25)"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1 }}>
          <div>
            <div style={{ color: wt.g2, fontSize: 7, fontWeight: 800, letterSpacing: 0.4 }}>WEEK</div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, fontFamily: wt.rounded, marginTop: 1 }}>2/4</div>
          </div>
        </div>
      </div>
    );
  }
  if (kind === "weight") {
    return (
      <div style={{ width: 50, height: 50, position: "relative" }}>
        <svg width={50} height={50}>
          <circle cx={25} cy={25} r={r} stroke={wt.g4} strokeWidth={stroke} fill="none"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1 }}>
          <div>
            <div style={{ color: wt.g2, fontSize: 7, fontWeight: 800, letterSpacing: 0.4 }}>KG</div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: wt.rounded, marginTop: 1 }}>82.4</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* MODULAR face — top corner + bottom rectangular */
function FaceModular() {
  return (
    <div style={{ width: 246, height: 300, background: "#000", padding: "16px 16px", color: "#fff", fontFamily: wt.rounded, display: "flex", flexDirection: "column" }}>
      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: wt.g2, letterSpacing: 0.4 }}>TUE 28</div>
        </div>
        <ComplicationCircularSmall kind="fuel"/>
      </div>

      {/* big time */}
      <div style={{ fontSize: 96, fontWeight: 200, color: wt.accent, letterSpacing: -3.5, lineHeight: 1, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>9:41</div>

      {/* large rectangular complication */}
      <div style={{ marginTop: 14, padding: "10px 12px", background: wt.g6, borderRadius: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: wt.accent, letterSpacing: 0.4, textTransform: "uppercase" }}>NEXT WORKOUT</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 3 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>Push A</span>
          <span style={{ fontSize: 12, color: wt.g1, fontWeight: 700 }}>6:30 PM</span>
        </div>
        <div style={{ fontSize: 11, color: wt.g2, fontWeight: 600, marginTop: 3 }}>5 ex · 48 min</div>
      </div>

      {/* bottom row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10 }}>
        <ComplicationCircularSmall kind="fuel"/>
        <ComplicationCircularSmall kind="week"/>
        <ComplicationCircularSmall kind="weight"/>
      </div>
    </div>
  );
}

function ComplicationCircularSmall({ kind }) {
  const r = 12; const stroke = 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: 32, height: 32, position: "relative" }}>
      <svg width={32} height={32}>
        <circle cx={16} cy={16} r={r} stroke={wt.g4} strokeWidth={stroke} fill="none"/>
        {kind === "fuel" && <circle cx={16} cy={16} r={r} stroke={wt.accent} strokeWidth={stroke} fill="none" strokeDasharray={`${c*0.42} ${c}`} strokeLinecap="round" transform="rotate(-90 16 16)"/>}
        {kind === "week" && <circle cx={16} cy={16} r={r} stroke="#fff" strokeWidth={stroke} fill="none" strokeDasharray={`${c*0.5} ${c}`} strokeLinecap="round" transform="rotate(-90 16 16)"/>}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        {kind === "fuel" && <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>42</span>}
        {kind === "week" && <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>2/4</span>}
        {kind === "weight" && <span style={{ fontSize: 8, fontWeight: 800, color: "#fff", fontFamily: wt.rounded }}>82</span>}
      </div>
    </div>
  );
}

/* SMART STACK widget (rectangular) — for face stacking on Series 10 */
function ComplicationRectangular() {
  return (
    <div style={{ width: 200, height: 50, background: "#000", border: "1px solid " + wt.g6, borderRadius: 14, padding: "6px 12px", color: "#fff", fontFamily: wt.rounded }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <WSF name="bolt.fill" size={10} color={wt.accent}/>
        <span style={{ fontSize: 8, fontWeight: 800, color: wt.accent, letterSpacing: 0.4, textTransform: "uppercase" }}>ATLAS · NEXT 6:30</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 1 }}>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>Push A</span>
        <span style={{ fontSize: 10, color: wt.g1, fontWeight: 700 }}>5 ex · 48 min</span>
      </div>
    </div>
  );
}

function ComplicationCircularStandalone({ kind, label }) {
  const size = 60; const r = 24; const stroke = 4;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={wt.g6} strokeWidth={stroke} fill="none"/>
        {kind === "fuel" && <circle cx={size/2} cy={size/2} r={r} stroke={wt.accent} strokeWidth={stroke} fill="none" strokeDasharray={`${c*0.42} ${c}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>}
        {kind === "week" && <circle cx={size/2} cy={size/2} r={r} stroke="#fff" strokeWidth={stroke} fill="none" strokeDasharray={`${c*0.5} ${c}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1, fontFamily: wt.rounded }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 800, color: wt.g2, letterSpacing: 0.5 }}>{label}</div>
          {kind === "fuel" && <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 1 }}>42%</div>}
          {kind === "week" && <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 1 }}>2/4</div>}
          {kind === "weight" && <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 1 }}>82.4</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  WatchFrame,
  ScreenMain, ScreenWorkoutPre, ScreenWorkoutLogging,
  ScreenRest, ScreenQuickMeal, ScreenWeighIn,
  ScreenToday, ScreenNotification, ScreenComplete,
  FaceInfograph, FaceModular,
  ComplicationCornerWatch: ComplicationCorner,
  ComplicationRectangular, ComplicationCircularStandalone,
  WSF,
});
