import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#080E0E",
  card:      "#111A1A",
  cardHover: "#13201F",
  surface:   "#0D1515",
  border:    "#1E2C2C",
  borderSub: "#162020",
  teal:      "#4A9B9B",
  tealDim:   "rgba(74,155,155,0.12)",
  tealBorder:"rgba(74,155,155,0.22)",
  fg:        "#FFFFFF",
  fg2:       "#8A9A9A",
  fg3:       "#556060",
  ok:        "#4CAF7D",
  okDim:     "rgba(76,175,125,0.12)",
  okBorder:  "rgba(76,175,125,0.22)",
  warn:      "#F59E4A",
  warnDim:   "rgba(245,158,74,0.12)",
  warnBorder:"rgba(245,158,74,0.22)",
  err:       "#E05C5C",
  errDim:    "rgba(224,92,92,0.12)",
  errBorder: "rgba(224,92,92,0.22)",
  crit:      "#E05C5C",
};

// ─── Shared Primitives ────────────────────────────────────────────────────────
const PhoneFrame = ({ children, label, width = 390 }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
    <div style={{
      width, height: 844,
      background: T.bg,
      borderRadius: 52,
      overflow: "hidden",
      border: `1.5px solid #1E2C2C`,
      boxShadow: "0 32px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.04) inset",
      display: "flex", flexDirection: "column",
      fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
      position: "relative",
    }}>
      {/* Notch */}
      <div style={{
        position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:126, height:34, background:T.bg,
        borderBottomLeftRadius:20, borderBottomRightRadius:20,
        zIndex:100,
      }}/>
      {children}
    </div>
    <div style={{
      fontSize:12, fontWeight:600, color:T.fg3, letterSpacing:"0.06em",
      textTransform:"uppercase", fontFamily:"system-ui",
    }}>{label}</div>
  </div>
);

const StatusBar = () => (
  <div style={{
    height:44, display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"0 28px", paddingTop:10, flexShrink:0, position:"relative", zIndex:10,
  }}>
    <span style={{ fontSize:15, fontWeight:600, color:T.fg }}>9:41</span>
    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
      {/* Signal */}
      <svg width="17" height="12" viewBox="0 0 17 12">
        {[0,1,2,3].map((i) => (
          <rect key={i} x={i*4.5} y={11-(i+1)*2.5} width="3.5" height={(i+1)*2.5}
            rx="0.8" fill={i < 3 ? T.fg : T.fg3} opacity={i < 3 ? 1 : 0.4}/>
        ))}
      </svg>
      {/* Wifi */}
      <svg width="16" height="12" viewBox="0 0 16 12">
        <path d="M8 9.5a1 1 0 110 2 1 1 0 010-2z" fill={T.fg}/>
        <path d="M4.5 6.5a5 5 0 017 0" stroke={T.fg} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M1.5 3.5a9 9 0 0113 0" stroke={T.fg} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
      </svg>
      {/* Battery */}
      <div style={{ display:"flex", alignItems:"center", gap:1 }}>
        <div style={{ width:22, height:11, border:`1.5px solid ${T.fg}`, borderRadius:3, padding:1.5 }}>
          <div style={{ width:"80%", height:"100%", background:T.fg, borderRadius:1.5 }}/>
        </div>
        <div style={{ width:2, height:5, background:T.fg, borderRadius:1, opacity:0.6 }}/>
      </div>
    </div>
  </div>
);

const NavBar = ({ title, subtitle, action }) => (
  <div style={{ padding:"8px 20px 12px", flexShrink:0 }}>
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
      <div>
        <div style={{ fontSize:28, fontWeight:700, color:T.fg, letterSpacing:"-0.04em", lineHeight:1.15 }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:T.fg2, marginTop:4, letterSpacing:"-0.01em" }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  </div>
);

const AddBtn = ({ label = "+" }) => (
  <button style={{
    background:T.teal, border:"none", borderRadius:12,
    width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", fontSize:20, fontWeight:500, cursor:"pointer", flexShrink:0,
    boxShadow:"0 4px 14px rgba(74,155,155,0.35)",
  }}>{label}</button>
);

const Badge = ({ label, tone = "ok" }) => {
  const map = {
    ok:   { bg: T.okDim,   border: T.okBorder,   color: T.ok },
    warn: { bg: T.warnDim, border: T.warnBorder,  color: T.warn },
    err:  { bg: T.errDim,  border: T.errBorder,   color: T.err },
    teal: { bg: T.tealDim, border: T.tealBorder,  color: T.teal },
    neutral: { bg:"rgba(138,154,154,0.1)", border:"rgba(138,154,154,0.2)", color: T.fg2 },
  };
  const s = map[tone] || map.neutral;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      background: s.bg, border:`1px solid ${s.border}`, color: s.color,
      borderRadius:100, padding:"3px 10px", fontSize:11, fontWeight:600,
      letterSpacing:"0.02em", whiteSpace:"nowrap",
    }}>{label}</span>
  );
};

const Card = ({ children, style }) => (
  <div style={{
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    overflow:"hidden",
    ...style,
  }}>{children}</div>
);

const SummaryTile = ({ label, value, sub, icon, tone = "teal" }) => {
  const colors = {
    teal: { bg: T.tealDim, border: T.tealBorder, color: T.teal },
    warn: { bg: T.warnDim, border: T.warnBorder, color: T.warn },
    ok:   { bg: T.okDim,   border: T.okBorder,   color: T.ok },
  };
  const c = colors[tone];
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 16, padding:"14px 14px",
      display:"flex", flexDirection:"column", gap:6, flex:1,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:11, color:T.fg2, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</div>
        <div style={{
          width:30, height:30, borderRadius:10,
          background: c.bg, border:`1px solid ${c.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: c.color, fontSize:14,
        }}>{icon}</div>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:T.fg, letterSpacing:"-0.04em", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:T.fg3, lineHeight:1.4 }}>{sub}</div>
    </div>
  );
};

const TabBar = ({ active = "more" }) => {
  const tabs = [
    { id:"today",     icon:"☀️", label:"Today" },
    { id:"train",     icon:"🏋️", label:"Train" },
    { id:"nutrition", icon:"🥗", label:"Nutrition" },
    { id:"body",      icon:"📊", label:"Body" },
    { id:"more",      icon:"···", label:"More" },
  ];
  return (
    <div style={{
      height:82, background:"rgba(8,14,14,0.95)",
      borderTop:`1px solid ${T.border}`,
      display:"flex", alignItems:"flex-start",
      paddingTop:10, paddingBottom:20,
      backdropFilter:"blur(20px)",
      flexShrink:0,
    }}>
      {tabs.map(tab => (
        <div key={tab.id} style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", gap:4, cursor:"pointer",
        }}>
          <div style={{ fontSize:tab.id === "more" ? 18 : 22 }}>{tab.icon}</div>
          <div style={{
            fontSize:10, fontWeight:600,
            color: tab.id === active ? T.teal : T.fg3,
            letterSpacing:"0.02em",
          }}>{tab.label}</div>
          {tab.id === active && (
            <div style={{ width:4, height:4, borderRadius:2, background:T.teal, marginTop:-2 }}/>
          )}
        </div>
      ))}
    </div>
  );
};

const Divider = () => (
  <div style={{ height:1, background:T.border, margin:"0 20px" }}/>
);

const ScrollContent = ({ children, style }) => (
  <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", ...style }}>{children}</div>
);

// ─── Screen 46: Lab Exams — List View ─────────────────────────────────────────
function Screen46() {
  return (
    <PhoneFrame label="46 · Lab Exams — List View">
      <StatusBar/>
      <NavBar
        title="Lab Exams"
        subtitle="Clinical history & marker tracking"
        action={<AddBtn/>}
      />
      <ScrollContent>
        <div style={{ padding:"0 16px", display:"flex", gap:8, paddingBottom:12 }}>
          <SummaryTile label="Panels" value="8" sub="Total recorded" icon="🧾" tone="teal"/>
          <SummaryTile label="Abnormal" value="3" sub="Across all exams" icon="⚠️" tone="warn"/>
          <SummaryTile label="Tracked" value="46" sub="Total markers" icon="✓" tone="ok"/>
        </div>

        {/* Section header */}
        <div style={{ padding:"4px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.fg, letterSpacing:"-0.02em" }}>Exam History</div>
          <div style={{ fontSize:12, color:T.fg3 }}>8 panels</div>
        </div>

        <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {/* Exam row — abnormal */}
          {[
            { name:"Hormone Panel", date:"Mar 12, 2026", markers:12, abnormal:2, status:"warn" },
            { name:"Complete Blood Count", date:"Mar 12, 2026", markers:18, abnormal:0, status:"ok" },
            { name:"Lipid Profile", date:"Jan 20, 2026", markers:6, abnormal:1, status:"warn" },
            { name:"Thyroid Function", date:"Dec 5, 2025", markers:4, abnormal:0, status:"ok" },
            { name:"Metabolic Panel", date:"Oct 14, 2025", markers:14, abnormal:0, status:"ok" },
          ].map((exam, i) => (
            <Card key={i}>
              <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                {/* Indicator dot */}
                <div style={{
                  width:8, height:8, borderRadius:4, flexShrink:0,
                  background: exam.status === "warn" ? T.warn : T.ok,
                  boxShadow: exam.status === "warn"
                    ? "0 0 8px rgba(245,158,74,0.5)"
                    : "0 0 8px rgba(76,175,125,0.5)",
                }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:T.fg, letterSpacing:"-0.02em" }}>{exam.name}</div>
                  <div style={{ display:"flex", gap:10, marginTop:4, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:T.fg3 }}>{exam.date}</span>
                    <span style={{ fontSize:11, color:T.fg3 }}>{exam.markers} markers</span>
                    {exam.abnormal > 0 ? (
                      <span style={{ fontSize:11, color:T.warn, fontWeight:600 }}>
                        ↑ {exam.abnormal} abnormal
                      </span>
                    ) : (
                      <span style={{ fontSize:11, color:T.ok, fontWeight:600 }}>All normal</span>
                    )}
                  </div>
                </div>
                <div style={{
                  width:28, height:28, borderRadius:9, background:T.surface,
                  border:`1px solid ${T.border}`, display:"flex", alignItems:"center",
                  justifyContent:"center", color:T.fg2, fontSize:14, flexShrink:0,
                }}>›</div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ height:20 }}/>
      </ScrollContent>
      <TabBar active="more"/>
    </PhoneFrame>
  );
}

// ─── Screen 47: Lab Exams — Exam Expanded ─────────────────────────────────────
function Screen47() {
  const markers = [
    { name:"Total Testosterone",   value:"285",  unit:"ng/dL",  refMin:"300",  refMax:"1000", status:"low" },
    { name:"Free Testosterone",    value:"8.2",  unit:"pg/mL",  refMin:"9",    refMax:"30",   status:"low" },
    { name:"LH",                   value:"3.1",  unit:"mIU/mL", refMin:"1.7",  refMax:"8.6",  status:"ok" },
    { name:"FSH",                  value:"2.8",  unit:"mIU/mL", refMin:"1.5",  refMax:"12.4", status:"ok" },
    { name:"Estradiol (E2)",       value:"42",   unit:"pg/mL",  refMin:"10",   refMax:"40",   status:"high" },
    { name:"SHBG",                 value:"55",   unit:"nmol/L", refMin:"18",   refMax:"54",   status:"high" },
    { name:"Prolactin",            value:"12.4", unit:"ng/mL",  refMin:"2",    refMax:"18",   status:"ok" },
    { name:"Cortisol (AM)",        value:"18.2", unit:"µg/dL",  refMin:"6",    refMax:"23",   status:"ok" },
  ];

  const badgeTone = (s) => s === "ok" ? "ok" : s === "high" ? "err" : "warn";
  const badgeLabel = (s) => s === "ok" ? "Normal" : s === "high" ? "High" : "Low";

  return (
    <PhoneFrame label="47 · Lab Exams — Exam Expanded">
      <StatusBar/>
      {/* Back nav */}
      <div style={{ padding:"4px 20px 0", display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:T.teal, fontSize:14, cursor:"pointer" }}>‹</span>
        <span style={{ color:T.teal, fontSize:14 }}>Lab Exams</span>
      </div>
      <div style={{ padding:"8px 20px 12px" }}>
        <div style={{ fontSize:22, fontWeight:700, color:T.fg, letterSpacing:"-0.04em" }}>Hormone Panel</div>
        <div style={{ display:"flex", gap:8, marginTop:6, alignItems:"center" }}>
          <span style={{ fontSize:12, color:T.fg3 }}>Mar 12, 2026</span>
          <span style={{ fontSize:12, color:T.fg3 }}>·</span>
          <span style={{ fontSize:12, color:T.fg3 }}>12 markers</span>
          <Badge label="4 abnormal" tone="warn"/>
        </div>
      </div>

      <ScrollContent>
        {/* Clinical note */}
        <div style={{ margin:"0 16px 12px", background:T.warnDim, border:`1px solid ${T.warnBorder}`, borderRadius:14, padding:"10px 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.warn, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>Clinical Note</div>
          <div style={{ fontSize:12, color:"rgba(245,158,74,0.85)", lineHeight:1.5 }}>
            Low testosterone with elevated SHBG and E2. Consider reassessment in 6 weeks after dietary and sleep optimization.
          </div>
        </div>

        <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:6 }}>
          {markers.map((m, i) => {
            const isAbnormal = m.status !== "ok";
            return (
              <div key={i} style={{
                background: isAbnormal ? (m.status === "low" ? T.warnDim : T.errDim) : T.surface,
                border: `1px solid ${isAbnormal ? (m.status === "low" ? T.warnBorder : T.errBorder) : T.borderSub}`,
                borderRadius:13, padding:"10px 14px",
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.fg, letterSpacing:"-0.01em" }}>{m.name}</div>
                  <div style={{ fontSize:11, color:T.fg3, marginTop:2 }}>Ref: {m.refMin}–{m.refMax} {m.unit}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{
                      fontSize:15, fontWeight:700,
                      color: m.status === "ok" ? T.fg : m.status === "low" ? T.warn : T.err,
                      letterSpacing:"-0.03em",
                      fontVariantNumeric:"tabular-nums",
                      fontFamily:"'SF Mono', 'Fira Code', monospace",
                    }}>{m.value}</div>
                    <div style={{ fontSize:10, color:T.fg3 }}>{m.unit}</div>
                  </div>
                  <Badge label={badgeLabel(m.status)} tone={badgeTone(m.status)}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height:20 }}/>
      </ScrollContent>
      <TabBar active="more"/>
    </PhoneFrame>
  );
}

// ─── Screen 48: Lab Exams — Marker Trends Section ─────────────────────────────
function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:40 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{
            width:"100%", borderRadius:"3px 3px 0 0",
            height: `${Math.max((d.v / max) * 36, 4)}px`,
            background: d.abnormal
              ? T.warn
              : color || T.teal,
            opacity: i === data.length - 1 ? 1 : 0.5,
          }}/>
        </div>
      ))}
    </div>
  );
}

function Screen48() {
  const trendData = [
    {
      name:"Total Testosterone",
      unit:"ng/dL",
      refRange:"300–1000",
      data:[
        {v:310, abnormal:false},{v:295, abnormal:true},{v:300, abnormal:false},
        {v:280, abnormal:true},{v:285, abnormal:true},
      ],
      latest:"285",
      delta:"-25",
      trend:"down",
      color:T.warn,
    },
    {
      name:"Estradiol (E2)",
      unit:"pg/mL",
      refRange:"10–40",
      data:[
        {v:28, abnormal:false},{v:32, abnormal:false},{v:38, abnormal:false},
        {v:40, abnormal:false},{v:42, abnormal:true},
      ],
      latest:"42",
      delta:"+14",
      trend:"up",
      color:T.err,
    },
    {
      name:"Cortisol (AM)",
      unit:"µg/dL",
      refRange:"6–23",
      data:[
        {v:22, abnormal:false},{v:20, abnormal:false},{v:19, abnormal:false},
        {v:18, abnormal:false},{v:18.2, abnormal:false},
      ],
      latest:"18.2",
      delta:"-3.8",
      trend:"down",
      color:T.ok,
    },
    {
      name:"SHBG",
      unit:"nmol/L",
      refRange:"18–54",
      data:[
        {v:42, abnormal:false},{v:46, abnormal:false},{v:50, abnormal:false},
        {v:53, abnormal:false},{v:55, abnormal:true},
      ],
      latest:"55",
      delta:"+13",
      trend:"up",
      color:T.warn,
    },
    {
      name:"Free Testosterone",
      unit:"pg/mL",
      refRange:"9–30",
      data:[
        {v:12, abnormal:false},{v:10.5, abnormal:false},{v:9.8, abnormal:false},
        {v:8.8, abnormal:true},{v:8.2, abnormal:true},
      ],
      latest:"8.2",
      delta:"-3.8",
      trend:"down",
      color:T.warn,
    },
    {
      name:"LH",
      unit:"mIU/mL",
      refRange:"1.7–8.6",
      data:[
        {v:4, abnormal:false},{v:3.5, abnormal:false},{v:3.8, abnormal:false},
        {v:3.2, abnormal:false},{v:3.1, abnormal:false},
      ],
      latest:"3.1",
      delta:"-0.9",
      trend:"stable",
      color:T.ok,
    },
  ];

  return (
    <PhoneFrame label="48 · Lab Exams — Marker Trends">
      <StatusBar/>
      <NavBar title="Marker Trends" subtitle="Longitudinal view across all panels"/>
      <ScrollContent>
        {/* Time period selector */}
        <div style={{ display:"flex", gap:6, padding:"0 16px 14px", overflowX:"auto" }}>
          {["3 months","6 months","1 year","All time"].map((p, i) => (
            <div key={i} style={{
              borderRadius:100, padding:"6px 14px",
              background: i === 1 ? T.teal : "transparent",
              border: `1px solid ${i === 1 ? T.teal : T.border}`,
              color: i === 1 ? "#fff" : T.fg2,
              fontSize:12, fontWeight:600, whiteSpace:"nowrap", cursor:"pointer",
            }}>{p}</div>
          ))}
        </div>

        <div style={{ padding:"0 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {trendData.map((m, i) => {
            const isAbnormal = m.data[m.data.length-1].abnormal;
            return (
              <div key={i} style={{
                background: T.card,
                border: `1px solid ${isAbnormal ? T.warnBorder : T.border}`,
                borderRadius:16, padding:"12px 12px 10px",
                display:"flex", flexDirection:"column", gap:8,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.fg, letterSpacing:"-0.01em", lineHeight:1.3, flex:1 }}>{m.name}</div>
                  <span style={{
                    fontSize:10, fontWeight:700,
                    color: m.trend === "stable" ? T.fg3 : m.color,
                    marginLeft:4,
                  }}>
                    {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"} {m.delta}
                  </span>
                </div>
                <MiniBarChart data={m.data} color={isAbnormal ? m.color : T.teal}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <span style={{
                      fontSize:16, fontWeight:700,
                      fontFamily:"'SF Mono','Fira Code',monospace",
                      color: isAbnormal ? m.color : T.fg,
                      letterSpacing:"-0.03em",
                    }}>{m.latest}</span>
                    <span style={{ fontSize:10, color:T.fg3, marginLeft:3 }}>{m.unit}</span>
                  </div>
                  <div style={{ fontSize:9, color:T.fg3 }}>ref {m.refRange}</div>
                </div>
                {/* 5-point sparkline labels */}
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  {["N","F","M","J","M"].map((l, j) => (
                    <span key={j} style={{ fontSize:9, color:T.fg3, textAlign:"center", flex:1 }}>{l}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height:20 }}/>
      </ScrollContent>
      <TabBar active="more"/>
    </PhoneFrame>
  );
}

// ─── Screen 49: Lab Exams — Add Modal ─────────────────────────────────────────
function FloatingInput({ label, value, placeholder, mono, type = "text" }) {
  return (
    <div style={{ position:"relative" }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius:12, padding:"6px 14px 8px",
        position:"relative",
      }}>
        <div style={{ fontSize:10, color:T.fg3, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:2 }}>{label}</div>
        <div style={{
          fontSize:14, color: value ? T.fg : T.fg3,
          fontFamily: mono ? "'SF Mono','Fira Code',monospace" : "inherit",
          letterSpacing: mono ? "-0.02em" : "inherit",
        }}>
          {value || placeholder}
        </div>
      </div>
    </div>
  );
}

function Screen49() {
  const markers = [
    { name:"Total Testosterone", value:"285", unit:"ng/dL", status:"low" },
    { name:"Free Testosterone",  value:"8.2", unit:"pg/mL", status:"low" },
    { name:"Estradiol (E2)",     value:"",    unit:"",       status:"normal" },
  ];

  return (
    <PhoneFrame label="49 · Lab Exams — Add Modal">
      {/* Dimmed background */}
      <div style={{ flex:1, background:"rgba(0,0,0,0.6)", display:"flex", flexDirection:"column" }}>
        <StatusBar/>
        <div style={{ flex:1 }}/>
        {/* Sheet */}
        <div style={{
          background: T.card,
          borderRadius:"24px 24px 0 0",
          border: `1px solid ${T.border}`,
          borderBottom:"none",
          overflow:"hidden",
          maxHeight:700,
          display:"flex", flexDirection:"column",
        }}>
          {/* Drag handle */}
          <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.border }}/>
          </div>
          {/* Header */}
          <div style={{ padding:"8px 20px 14px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:T.teal, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>LAB IMPORT</div>
                <div style={{ fontSize:20, fontWeight:700, color:T.fg, letterSpacing:"-0.04em" }}>New Exam</div>
              </div>
              <button style={{ width:32, height:32, borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.fg2, fontSize:16, cursor:"pointer" }}>✕</button>
            </div>
          </div>

          <div style={{ overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            {/* PDF import zone */}
            <div style={{
              border:`1.5px dashed ${T.tealBorder}`, borderRadius:14, padding:"12px 16px",
              display:"flex", alignItems:"center", gap:10, cursor:"pointer",
              background: T.tealDim,
            }}>
              <div style={{ fontSize:20 }}>📎</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:T.teal }}>Import PDF or Image</div>
                <div style={{ fontSize:11, color:T.fg3, marginTop:2 }}>Auto-extract panel, date & markers</div>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <FloatingInput label="Panel / Exam" value="Hormone Panel" placeholder="e.g. CBC"/>
              <FloatingInput label="Date" value="Mar 12, 2026" placeholder="Select"/>
            </div>

            {/* Markers section */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.fg }}>Markers <span style={{ color:T.fg3, fontWeight:500 }}>({markers.length})</span></div>
                <button style={{
                  fontSize:11, color:T.teal, fontWeight:700, background:"transparent", border:"none", cursor:"pointer"
                }}>+ Add marker</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {markers.map((m, i) => (
                  <div key={i} style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius:12, padding:"8px 10px",
                    display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto",
                    gap:6, alignItems:"center",
                  }}>
                    <div style={{ fontSize:12, color: m.name ? T.fg : T.fg3 }}>{m.name || "Marker name"}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.fg, fontFamily:"'SF Mono','Fira Code',monospace" }}>{m.value || "—"}</div>
                    <div style={{ fontSize:11, color:T.fg3 }}>{m.unit || "unit"}</div>
                    <button style={{ width:24, height:24, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.err, fontSize:13, cursor:"pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <FloatingInput label="Notes" placeholder="Clinical context, next steps…"/>

            {/* Save */}
            <button style={{
              background: T.teal, border:"none", borderRadius:13,
              padding:"14px 0", color:"#fff", fontSize:15, fontWeight:700,
              cursor:"pointer", letterSpacing:"-0.02em",
              boxShadow:"0 4px 20px rgba(74,155,155,0.4)",
            }}>Save Exam</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Screen 50: Lab Exams — PDF Import State ──────────────────────────────────
function Screen50() {
  return (
    <PhoneFrame label="50 · Lab Exams — PDF Import State">
      <div style={{ flex:1, background:"rgba(0,0,0,0.6)", display:"flex", flexDirection:"column" }}>
        <StatusBar/>
        <div style={{ flex:1 }}/>
        <div style={{
          background: T.card,
          borderRadius:"24px 24px 0 0",
          border: `1px solid ${T.border}`,
          borderBottom:"none",
          overflow:"hidden",
          maxHeight:680,
          display:"flex", flexDirection:"column",
        }}>
          <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.border }}/>
          </div>
          <div style={{ padding:"8px 20px 14px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:T.teal, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>LAB IMPORT</div>
                <div style={{ fontSize:20, fontWeight:700, color:T.fg, letterSpacing:"-0.04em" }}>New Exam</div>
              </div>
              <button style={{ width:32, height:32, borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.fg2, fontSize:16, cursor:"pointer" }}>✕</button>
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"20px 20px", display:"flex", flexDirection:"column", gap:16 }}>
            {/* Processing banner */}
            <div style={{
              background:"rgba(74,155,155,0.1)", border:`1px solid ${T.tealBorder}`,
              borderRadius:16, padding:"16px 16px",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* Spinner */}
                <div style={{
                  width:32, height:32, borderRadius:16,
                  border:`2.5px solid ${T.tealBorder}`,
                  borderTopColor: T.teal,
                  animation:"spin 1s linear infinite",
                }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:T.teal }}>Extracting from PDF…</div>
                  <div style={{ fontSize:11, color:T.fg3, marginTop:2 }}>lab_results_march2026.pdf · 1.2 MB</div>
                </div>
              </div>
              {/* Progress steps */}
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { label:"File uploaded", done:true },
                  { label:"Detecting panel name & date", done:true },
                  { label:"Parsing marker values & units", done:false, active:true },
                  { label:"Classifying clinical status", done:false },
                ].map((step, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{
                      width:16, height:16, borderRadius:8, flexShrink:0,
                      background: step.done ? T.ok : step.active ? T.teal : "transparent",
                      border: step.done ? "none" : step.active ? `2px solid ${T.teal}` : `2px solid ${T.fg3}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, color:"#fff",
                    }}>
                      {step.done ? "✓" : ""}
                    </div>
                    <div style={{
                      fontSize:12,
                      color: step.done ? T.fg2 : step.active ? T.fg : T.fg3,
                      fontWeight: step.active ? 700 : 500,
                    }}>{step.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview: partially filled */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:T.fg2, marginBottom:8, letterSpacing:"0.04em", textTransform:"uppercase", fontSize:10 }}>Detected so far</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <FloatingInput label="Panel" value="Hormone Panel"/>
                <FloatingInput label="Date" value="Mar 12, 2026"/>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {[
                  { name:"Total Testosterone", value:"285", unit:"ng/dL" },
                  { name:"Free Testosterone",  value:"8.2", unit:"pg/mL" },
                  { name:"LH",                 value:"",    unit:"" },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: T.surface, border:`1px solid ${T.border}`,
                    borderRadius:10, padding:"7px 12px",
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    opacity: m.value ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize:12, color:T.fg }}>{m.name}</span>
                    <span style={{
                      fontSize:13, fontWeight:700, color: m.value ? T.fg : T.fg3,
                      fontFamily:"'SF Mono','Fira Code',monospace",
                    }}>{m.value ? `${m.value} ${m.unit}` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <button disabled style={{
              background:"rgba(74,155,155,0.3)", border:"none", borderRadius:13,
              padding:"14px 0", color:"rgba(255,255,255,0.5)", fontSize:15, fontWeight:700,
              cursor:"not-allowed",
            }}>Extracting…</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Screen 51: Lab Exams — Empty State ───────────────────────────────────────
function Screen51() {
  return (
    <PhoneFrame label="51 · Lab Exams — Empty State">
      <StatusBar/>
      <NavBar title="Lab Exams" subtitle="Clinical history & marker tracking" action={<AddBtn/>}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"0 32px", gap:20 }}>
        {/* Icon */}
        <div style={{
          width:72, height:72, borderRadius:24,
          background:"rgba(74,155,155,0.08)", border:`1px solid ${T.tealBorder}`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:30,
        }}>🧬</div>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:20, fontWeight:700, color:T.fg, letterSpacing:"-0.04em", marginBottom:8 }}>No lab exams yet</div>
          <div style={{ fontSize:14, color:T.fg2, lineHeight:1.6 }}>
            Import a PDF or enter results manually to start tracking your biomarkers over time.
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:280 }}>
          <button style={{
            background:T.teal, border:"none", borderRadius:13, padding:"14px 0",
            color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(74,155,155,0.4)",
          }}>Record First Exam</button>
          <button style={{
            background:"transparent", border:`1px solid ${T.border}`, borderRadius:13, padding:"13px 0",
            color:T.fg2, fontSize:14, fontWeight:600, cursor:"pointer",
          }}>Import from PDF</button>
        </div>

        {/* Feature pills */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:4 }}>
          {["📋 Panels","📈 Trends","⚠️ Abnormal flags","🧾 PDF import"].map((f, i) => (
            <div key={i} style={{
              border:`1px solid ${T.border}`, borderRadius:100,
              padding:"5px 12px", fontSize:11, color:T.fg3,
            }}>{f}</div>
          ))}
        </div>
      </div>
      <TabBar active="more"/>
    </PhoneFrame>
  );
}

// ─── Screen 52: Protocols — List View ─────────────────────────────────────────
function Screen52() {
  const protocols = [
    { name:"Testosterone Cypionate",  dose:"200mg", freq:"E7D", status:"active",  start:"Jan 6",  halfLife:"8d" },
    { name:"Anastrozole",             dose:"0.25mg", freq:"E3D", status:"active", start:"Jan 6",  halfLife:"2d" },
    { name:"HCG",                     dose:"500 IU", freq:"E3D", status:"paused", start:"Jan 6",  halfLife:"36h" },
    { name:"Vitamin D3",              dose:"5000 IU", freq:"ED", status:"active", start:"Oct 2",  halfLife:"—" },
    { name:"Testosterone Enanthate",  dose:"250mg", freq:"E5D", status:"finished",start:"Aug 1",  halfLife:"4.5d" },
  ];

  const statusMeta = {
    active:   { label:"Active",   tone:"ok",      dot:T.ok },
    paused:   { label:"Paused",   tone:"warn",    dot:T.warn },
    finished: { label:"Finished", tone:"neutral", dot:T.fg3 },
  };

  return (
    <PhoneFrame label="52 · Protocols — List View">
      <StatusBar/>
      <NavBar title="Protocols" subtitle="Compounds, doses & cycles" action={<AddBtn/>}/>
      <ScrollContent>
        {/* Summary tiles */}
        <div style={{ padding:"0 16px 12px", display:"flex", gap:8 }}>
          <SummaryTile label="Active" value="3" sub="Currently running" icon="⚗️" tone="ok"/>
          <SummaryTile label="Paused" value="1" sub="Temporarily off" icon="⏸" tone="warn"/>
          <SummaryTile label="Finished" value="1" sub="Completed cycles" icon="✓" tone="teal"/>
        </div>

        {/* Filter chips */}
        <div style={{ display:"flex", gap:6, padding:"0 16px 14px", overflowX:"auto" }}>
          {["All (5)","Active (3)","Paused (1)","Finished (1)"].map((f, i) => (
            <div key={i} style={{
              borderRadius:100, padding:"6px 14px",
              background: i === 1 ? T.teal : "transparent",
              border: `1px solid ${i === 1 ? T.teal : T.border}`,
              color: i === 1 ? "#fff" : T.fg2,
              fontSize:12, fontWeight:600, whiteSpace:"nowrap", cursor:"pointer",
            }}>{f}</div>
          ))}
        </div>

        {/* Half-life section */}
        <div style={{ margin:"0 16px 10px", background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"12px 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.fg2, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:10 }}>Half-Life Curves · Active</div>
          {/* SVG decay chart */}
          <svg viewBox="0 0 340 100" style={{ width:"100%", borderRadius:8 }}>
            <line x1="30" y1="10" x2="30" y2="80" stroke={T.border} strokeWidth="1"/>
            <line x1="30" y1="80" x2="330" y2="80" stroke={T.border} strokeWidth="1"/>
            {/* Test C curve (hl=8d) */}
            <path d="M30 12 C80 12 120 35 160 48 C200 60 250 72 330 79"
              stroke="#4A9B9B" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* Anastrozole curve (hl=2d) */}
            <path d="M30 12 C55 25 80 55 120 70 C160 78 220 79 330 80"
              stroke="#4CAF7D" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* Labels */}
            <text x="34" y="8" fontSize="7" fill="#4A9B9B" fontWeight="700">Test C</text>
            <text x="80" y="20" fontSize="7" fill="#4CAF7D" fontWeight="700">Anastrozole</text>
            <text x="30" y="92" fontSize="7" fill={T.fg3}>0d</text>
            <text x="170" y="92" fontSize="7" fill={T.fg3}>15d</text>
            <text x="318" y="92" fontSize="7" fill={T.fg3}>30d</text>
          </svg>
        </div>

        {/* Protocol list */}
        <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {protocols.map((p, i) => {
            const meta = statusMeta[p.status];
            return (
              <Card key={i}>
                <div style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:4, background:meta.dot, flexShrink:0 }}/>
                        <div style={{ fontSize:14, fontWeight:700, color: p.status === "finished" ? T.fg2 : T.fg, letterSpacing:"-0.02em" }}>{p.name}</div>
                      </div>
                      <div style={{ display:"flex", gap:10, marginTop:5 }}>
                        <span style={{ fontSize:12, color:T.teal, fontWeight:700, fontFamily:"'SF Mono','Fira Code',monospace" }}>{p.dose}</span>
                        <span style={{ fontSize:12, color:T.fg3 }}>{p.freq}</span>
                        <span style={{ fontSize:12, color:T.fg3 }}>T½ {p.halfLife}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                      <Badge label={meta.label} tone={meta.tone}/>
                      <span style={{ fontSize:10, color:T.fg3 }}>Since {p.start}</span>
                    </div>
                  </div>
                  {/* Action row */}
                  {p.status !== "finished" && (
                    <div style={{ display:"flex", gap:6, marginTop:10, paddingTop:10, borderTop:`1px solid ${T.borderSub}` }}>
                      <button style={{ flex:1, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 0", background:"transparent", color:T.fg2, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        {p.status === "active" ? "Pause" : "Resume"}
                      </button>
                      <button style={{ flex:1, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 0", background:"transparent", color:T.fg2, fontSize:11, fontWeight:600, cursor:"pointer" }}>Edit</button>
                      <button style={{ flex:1, border:`1px solid ${T.errBorder}`, borderRadius:10, padding:"7px 0", background:T.errDim, color:T.err, fontSize:11, fontWeight:600, cursor:"pointer" }}>Finish</button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        <div style={{ height:20 }}/>
      </ScrollContent>
      <TabBar active="more"/>
    </PhoneFrame>
  );
}

// ─── Screen 53: Protocols — Add/Edit Modal ────────────────────────────────────
function SegmentedControl({ options, active, small }) {
  return (
    <div style={{
      display:"flex", gap:2, background:T.surface,
      border:`1px solid ${T.border}`, borderRadius:10,
      padding:3,
    }}>
      {options.map((opt, i) => (
        <div key={i} style={{
          flex:1, textAlign:"center",
          padding: small ? "5px 4px" : "8px 4px",
          borderRadius:8,
          background: opt === active ? T.teal : "transparent",
          color: opt === active ? "#fff" : T.fg2,
          fontSize: small ? 11 : 12, fontWeight:700, cursor:"pointer",
          transition:"all 0.15s",
        }}>{opt}</div>
      ))}
    </div>
  );
}

function Screen53() {
  return (
    <PhoneFrame label="53 · Protocols — Add / Edit Modal">
      <div style={{ flex:1, background:"rgba(0,0,0,0.6)", display:"flex", flexDirection:"column" }}>
        <StatusBar/>
        <div style={{ flex:1 }}/>
        <div style={{
          background: T.card,
          borderRadius:"24px 24px 0 0",
          border: `1px solid ${T.border}`,
          borderBottom:"none",
          overflow:"hidden",
          maxHeight:720,
          display:"flex", flexDirection:"column",
        }}>
          {/* Drag handle */}
          <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:T.border }}/>
          </div>
          {/* Header */}
          <div style={{ padding:"6px 20px 12px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:T.teal, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:3 }}>PROTOCOLS</div>
                <div style={{ fontSize:20, fontWeight:700, color:T.fg, letterSpacing:"-0.04em" }}>Add Protocol</div>
              </div>
              <button style={{ width:32, height:32, borderRadius:10, border:`1px solid ${T.border}`, background:"transparent", color:T.fg2, fontSize:16, cursor:"pointer" }}>✕</button>
            </div>
          </div>

          <div style={{ overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            {/* Substance name */}
            <FloatingInput label="Substance / Compound" placeholder="e.g. Testosterone Cypionate" value="Testosterone Cypionate"/>

            {/* Category */}
            <div>
              <div style={{ fontSize:10, color:T.fg3, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Category</div>
              <SegmentedControl
                options={["Hormone","Peptide","Suppl.","Other"]}
                active="Hormone"
              />
            </div>

            {/* Dose + unit row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <FloatingInput label="Dose" value="200" mono/>
              <FloatingInput label="Unit" value="mg"/>
              <FloatingInput label="Freq." value="E7D"/>
            </div>

            {/* Timing */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <FloatingInput label="Timing / Route" value="IM injection"/>
              <FloatingInput label="Est. Half-Life (days)" value="8" mono/>
            </div>

            {/* Start date + status */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <FloatingInput label="Start Date" value="Jan 6, 2026"/>
              <div>
                <div style={{ fontSize:10, color:T.fg3, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Status</div>
                <SegmentedControl options={["Active","Paused"]} active="Active" small/>
              </div>
            </div>

            {/* Notes */}
            <div style={{
              background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:12, padding:"8px 14px",
            }}>
              <div style={{ fontSize:10, color:T.fg3, fontWeight:700, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:4 }}>Notes</div>
              <div style={{ fontSize:13, color:T.fg3, lineHeight:1.5 }}>Protocol goal, monitoring notes, prescriber…</div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:8 }}>
              <button style={{
                flex:1, background:"transparent", border:`1px solid ${T.border}`, borderRadius:13,
                padding:"13px 0", color:T.fg2, fontSize:14, fontWeight:600, cursor:"pointer",
              }}>Cancel</button>
              <button style={{
                flex:2, background:T.teal, border:"none", borderRadius:13,
                padding:"13px 0", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer",
                boxShadow:"0 4px 20px rgba(74,155,155,0.4)",
              }}>Save Protocol</button>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Screen 54: Protocols — Empty State ───────────────────────────────────────
function Screen54() {
  return (
    <PhoneFrame label="54 · Protocols — Empty State">
      <StatusBar/>
      <NavBar title="Protocols" subtitle="Compounds, doses & cycles" action={<AddBtn/>}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"0 32px", gap:20 }}>
        {/* Icon */}
        <div style={{
          width:72, height:72, borderRadius:24,
          background:"rgba(74,155,155,0.08)", border:`1px solid ${T.tealBorder}`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:30,
        }}>⚗️</div>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:20, fontWeight:700, color:T.fg, letterSpacing:"-0.04em", marginBottom:8 }}>No protocols tracked</div>
          <div style={{ fontSize:14, color:T.fg2, lineHeight:1.6 }}>
            Log your current compounds, doses and cycles. Track status, half-life curves and protocol history.
          </div>
        </div>

        <button style={{
          background:T.teal, border:"none", borderRadius:13, padding:"14px 48px",
          color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer",
          boxShadow:"0 4px 20px rgba(74,155,155,0.4)",
        }}>Add Protocol</button>

        {/* Feature list */}
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
          {[
            { icon:"⚗️", text:"Hormones, peptides, supplements" },
            { icon:"📈", text:"Half-life curves & active levels" },
            { icon:"⏸",  text:"Pause, resume or finish cycles" },
            { icon:"🔗", text:"Link to lab exam markers" },
          ].map((f, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10,
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:12, padding:"10px 14px",
            }}>
              <span style={{ fontSize:18 }}>{f.icon}</span>
              <span style={{ fontSize:13, color:T.fg2 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="more"/>
    </PhoneFrame>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function LabProtocolsMockups() {
  const [group, setGroup] = useState("lab");

  const screens = {
    lab: [
      { id:46, el:<Screen46/> },
      { id:47, el:<Screen47/> },
      { id:48, el:<Screen48/> },
      { id:49, el:<Screen49/> },
      { id:50, el:<Screen50/> },
      { id:51, el:<Screen51/> },
    ],
    protocols: [
      { id:52, el:<Screen52/> },
      { id:53, el:<Screen53/> },
      { id:54, el:<Screen54/> },
    ],
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"#040808",
      fontFamily:"-apple-system,'SF Pro Display',system-ui,sans-serif",
      color:T.fg,
    }}>
      {/* Header */}
      <div style={{
        maxWidth:1400, margin:"0 auto", padding:"48px 40px 32px",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
          <div>
            <div style={{ fontSize:11, color:T.teal, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
              atlas.core · Mobile Mockups
            </div>
            <div style={{ fontSize:36, fontWeight:800, letterSpacing:"-0.05em", lineHeight:1.1 }}>
              Lab Exams &amp; Protocols
            </div>
            <div style={{ fontSize:16, color:T.fg2, marginTop:8, lineHeight:1.5 }}>
              Screens 46–54 · Clinical data, precision tracking, disciplined protocols
            </div>
          </div>
          {/* Tab switcher */}
          <div style={{ display:"flex", gap:8 }}>
            {[
              { key:"lab",       label:"Lab Exams (46–51)" },
              { key:"protocols", label:"Protocols (52–54)" },
            ].map(t => (
              <button key={t.key} onClick={() => setGroup(t.key)} style={{
                padding:"10px 20px", borderRadius:12,
                background: group === t.key ? T.teal : "transparent",
                border: `1px solid ${group === t.key ? T.teal : T.border}`,
                color: group === t.key ? "#fff" : T.fg2,
                fontSize:13, fontWeight:700, cursor:"pointer",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Screen grid */}
      <div style={{
        maxWidth:1400, margin:"0 auto", padding:"0 40px 80px",
        display:"flex", flexWrap:"wrap", gap:48, justifyContent:"center",
      }}>
        {screens[group].map(({ id, el }) => (
          <div key={id}>{el}</div>
        ))}
      </div>

      {/* Design token legend */}
      <div style={{
        maxWidth:1400, margin:"0 auto", padding:"0 40px 60px",
        borderTop:`1px solid ${T.border}`, paddingTop:32,
      }}>
        <div style={{ fontSize:11, color:T.fg3, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16 }}>Design tokens</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[
            { label:"Background", color:T.bg, text:T.bg },
            { label:"Card Surface", color:T.card, text:T.card },
            { label:"Border", color:T.border, text:T.border },
            { label:"Teal Accent", color:T.teal, text:T.teal },
            { label:"Success", color:T.ok, text:T.ok },
            { label:"Warning", color:T.warn, text:T.warn },
            { label:"Destructive", color:T.err, text:T.err },
            { label:"Secondary Text", color:T.fg2, text:T.fg2 },
          ].map((t, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:16, height:16, borderRadius:4, background:t.color, border:`1px solid rgba(255,255,255,0.08)` }}/>
              <div>
                <div style={{ fontSize:11, color:T.fg, fontWeight:600 }}>{t.label}</div>
                <div style={{ fontSize:10, color:T.fg3, fontFamily:"'SF Mono','Fira Code',monospace" }}>{t.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #1E2C2C; border-radius: 2px }
      `}</style>
    </div>
  );
}
