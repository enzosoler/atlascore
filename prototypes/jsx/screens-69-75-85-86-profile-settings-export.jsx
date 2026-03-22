import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#080E0E",
  card: "#111A1A",
  card2: "#162020",
  border: "#1E2C2C",
  teal: "#4A9B9B",
  tealDim: "rgba(74,155,155,0.12)",
  tealDim2: "rgba(74,155,155,0.08)",
  white: "#FFFFFF",
  sub: "#8A9A9A",
  red: "#E05C5C",
  redDim: "rgba(224,92,92,0.12)",
  green: "#4CAF7D",
  greenDim: "rgba(76,175,125,0.12)",
  amber: "#E0A84A",
};

const font = {
  display: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  text: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'SF Mono', 'Fira Code', monospace",
};

// ─── Shared Primitives ────────────────────────────────────────────────────────
const StatusBar = () => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px 8px", fontFamily: font.text, fontSize: 15, fontWeight: 600, color: C.white }}>
    <span>9:41</span>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="3" width="3" height="9" rx="1" fill={C.white} opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill={C.white} opacity="0.6"/><rect x="9" y="0" width="3" height="12" rx="1" fill={C.white} opacity="0.8"/><rect x="13.5" y="0" width="3" height="12" rx="1" fill={C.white}/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 2.5C10.2 2.5 12.2 3.4 13.6 4.9L15 3.4C13.2 1.3 10.7 0 8 0C5.3 0 2.8 1.3 1 3.4L2.4 4.9C3.8 3.4 5.8 2.5 8 2.5Z" fill={C.white}/><path d="M8 5.5C9.6 5.5 11 6.2 12 7.3L13.4 5.8C12 4.4 10.1 3.5 8 3.5C5.9 3.5 4 4.4 2.6 5.8L4 7.3C5 6.2 6.4 5.5 8 5.5Z" fill={C.white}/><circle cx="8" cy="10" r="2" fill={C.white}/></svg>
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        <div style={{ width: 25, height: 12, border: `1.5px solid ${C.white}`, borderRadius: 3, padding: "1.5px 2px", display: "flex", alignItems: "center" }}>
          <div style={{ width: "75%", height: "100%", background: C.white, borderRadius: 1.5 }} />
        </div>
      </div>
    </div>
  </div>
);

const HomeIndicator = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 6px" }}>
    <div style={{ width: 134, height: 5, background: C.white, borderRadius: 3, opacity: 0.2 }} />
  </div>
);

const TabBar = ({ active = "more" }) => {
  const tabs = [
    { id: "today", label: "Today", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="4" fill="currentColor" opacity="0.9"/><path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.9 4.9l1.4 1.4M15.7 15.7l1.4 1.4M4.9 17.1l1.4-1.4M15.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
    { id: "train", label: "Train", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="9" width="18" height="4" rx="2" fill="currentColor" opacity="0.9"/><circle cx="5" cy="11" r="3" fill="currentColor"/><circle cx="17" cy="11" r="3" fill="currentColor"/></svg> },
    { id: "nutrition", label: "Nutrition", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3C7.5 3 4 6 4 10c0 4.5 4 8 7 9 3-1 7-4.5 7-9 0-4-3.5-7-7-7z" fill="currentColor" opacity="0.9"/></svg> },
    { id: "body", label: "Body", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="5" r="2.5" fill="currentColor" opacity="0.9"/><path d="M7 9h8l-1 5H8L7 9z" fill="currentColor" opacity="0.8"/><path d="M8 14l-2 5M14 14l2 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id: "more", label: "More", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="5" cy="11" r="2" fill="currentColor"/><circle cx="11" cy="11" r="2" fill="currentColor"/><circle cx="17" cy="11" r="2" fill="currentColor"/></svg> },
  ];
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(8,14,14,0.96)", backdropFilter: "blur(20px)", padding: "10px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {tabs.map(t => (
          <button key={t.id} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 12px", color: t.id === active ? C.teal : C.sub, transition: "color 0.15s" }}>
            {t.icon}
            <span style={{ fontFamily: font.text, fontSize: 10, fontWeight: t.id === active ? 600 : 400, letterSpacing: 0.2 }}>{t.label}</span>
          </button>
        ))}
      </div>
      <HomeIndicator />
    </div>
  );
};

const NavBar = ({ title, large = true, back, right }) => (
  <div style={{ padding: large ? "4px 24px 0" : "12px 24px", background: "rgba(8,14,14,0.92)", backdropFilter: "blur(20px)" }}>
    {back && (
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, color: C.teal, fontFamily: font.text, fontSize: 17, cursor: "pointer" }}>
        <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {back}
      </div>
    )}
    <div style={{ display: "flex", alignItems: large ? "flex-end" : "center", justifyContent: "space-between", paddingBottom: large ? 12 : 0 }}>
      <h1 style={{ fontFamily: font.display, fontSize: large ? 34 : 17, fontWeight: large ? 700 : 600, color: C.white, margin: 0, letterSpacing: large ? -0.5 : -0.2 }}>{title}</h1>
      {right}
    </div>
  </div>
);

const Divider = ({ indent = 0 }) => (
  <div style={{ height: 1, background: C.border, marginLeft: indent }} />
);

const RowChevron = () => (
  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke={C.sub} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const Switch = ({ on = false }) => (
  <div style={{ width: 51, height: 31, borderRadius: 15.5, background: on ? C.teal : "#2A3A3A", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
    <div style={{ width: 27, height: 27, borderRadius: "50%", background: C.white, position: "absolute", top: 2, left: on ? 22 : 2, transition: "left 0.2s", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }} />
  </div>
);

const Badge = ({ label, color = C.teal, bgColor }) => (
  <span style={{ fontFamily: font.text, fontSize: 12, fontWeight: 600, color, background: bgColor || `${color}20`, borderRadius: 20, padding: "3px 10px", letterSpacing: 0.2 }}>{label}</span>
);

// ─── Phone Shell ──────────────────────────────────────────────────────────────
const Phone = ({ children, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <div style={{ width: 390, height: 844, background: C.bg, borderRadius: 48, overflow: "hidden", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}>
      {/* Dynamic Island */}
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, background: "#000", borderRadius: 20, zIndex: 10 }} />
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {children}
      </div>
    </div>
    <span style={{ fontFamily: font.text, fontSize: 12, fontWeight: 500, color: C.sub, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 69 · PROFILE — VIEW MODE
// ═══════════════════════════════════════════════════════════════════════════════
const Screen69 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />

    {/* Hero */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px 24px", gap: 14 }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, #2A6B6B)`, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${C.border}`, boxShadow: `0 0 0 1px ${C.teal}30`, position: "relative" }}>
        <span style={{ fontFamily: font.display, fontSize: 32, fontWeight: 700, color: C.white }}>E</span>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: C.card, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke={C.teal} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: C.white, margin: "0 0 4px", letterSpacing: -0.4 }}>Enzo Soler</h2>
        <p style={{ fontFamily: font.text, fontSize: 14, color: C.sub, margin: 0 }}>enzo@chronoinnovation.com</p>
      </div>
      <Badge label="Pro" color={C.teal} />
    </div>

    {/* Stats Row */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "0 20px 20px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 0" }}>
      {[
        { val: "142", label: "Workouts" },
        { val: "61", label: "Days Active" },
        { val: "8.4", label: "Avg Score" },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
          <span style={{ fontFamily: font.mono, fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: -0.5 }}>{s.val}</span>
          <span style={{ fontFamily: font.text, fontSize: 11, color: C.sub, letterSpacing: 0.2 }}>{s.label}</span>
        </div>
      ))}
    </div>

    {/* Profile Info */}
    <div style={{ margin: "0 20px 12px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 8px" }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8 }}>Personal Info</span>
      </div>
      {[
        { label: "Date of Birth", value: "June 12, 1993" },
        { label: "Height", value: "183 cm" },
        { label: "Weight", value: "82 kg" },
        { label: "Training Goal", value: "Strength & Hypertrophy" },
      ].map((row, i, arr) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
            <span style={{ fontFamily: font.text, fontSize: 15, color: C.sub }}>{row.label}</span>
            <span style={{ fontFamily: font.text, fontSize: 15, color: C.white, fontWeight: 500 }}>{row.value}</span>
          </div>
          {i < arr.length - 1 && <Divider indent={16} />}
        </div>
      ))}
    </div>

    {/* Account Actions */}
    <div style={{ margin: "0 20px 12px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      {[
        { label: "Edit Profile", icon: "✏️", color: C.white },
        { label: "Change Password", icon: "🔑", color: C.white },
        { label: "Manage Subscription", icon: "💎", color: C.teal },
      ].map((row, i, arr) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 16 }}>{row.icon}</span>
              <span style={{ fontFamily: font.text, fontSize: 16, color: row.color, fontWeight: 500 }}>{row.label}</span>
            </div>
            <RowChevron />
          </div>
          {i < arr.length - 1 && <Divider indent={46} />}
        </div>
      ))}
    </div>

    {/* Logout */}
    <div style={{ margin: "0 20px 24px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <button style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "16px 16px" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 2H3C2.4 2 2 2.4 2 3V15C2 15.6 2.4 16 3 16H7" stroke={C.red} strokeWidth="1.6" strokeLinecap="round"/><path d="M12 5l4 4-4 4M16 9H7" stroke={C.red} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontFamily: font.text, fontSize: 16, color: C.red, fontWeight: 500 }}>Log Out</span>
      </button>
    </div>

    <TabBar active="more" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 70 · PROFILE — EDIT SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const FloatingInput = ({ label, value, unit }) => (
  <div style={{ position: "relative", background: C.card2, borderRadius: 10, border: `1.5px solid ${C.teal}`, padding: "20px 16px 10px" }}>
    <span style={{ position: "absolute", top: 8, left: 16, fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.teal, letterSpacing: 0.4 }}>{label}</span>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontFamily: font.text, fontSize: 16, color: C.white }}>{value}</span>
      {unit && <span style={{ fontFamily: font.mono, fontSize: 12, color: C.sub }}>{unit}</span>}
    </div>
  </div>
);

const InactiveInput = ({ label, value, unit }) => (
  <div style={{ position: "relative", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px 16px 10px" }}>
    <span style={{ position: "absolute", top: 8, left: 16, fontFamily: font.text, fontSize: 11, fontWeight: 500, color: C.sub, letterSpacing: 0.3 }}>{label}</span>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontFamily: font.text, fontSize: 16, color: C.white }}>{value}</span>
      {unit && <span style={{ fontFamily: font.mono, fontSize: 12, color: C.sub }}>{unit}</span>}
    </div>
  </div>
);

const Screen70 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <NavBar title="Edit Profile" large={false} back="Profile" right={
      <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: font.text, fontSize: 17, fontWeight: 600, color: C.teal }}>Save</button>
    } />

    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
      {/* Avatar */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, #2A6B6B)`, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${C.border}` }}>
            <span style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: C.white }}>E</span>
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.bg}` }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L5 10L12.5 2.5C13.1 1.9 13.1 0.9 12.5 0.3L13.7 1.5C14.3 2.1 14.3 3.1 13.7 3.7L6 11.5H2V10Z" fill="white"/><path d="M10.5 1.5L12.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>

      {/* Section: Identity */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Identity</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <FloatingInput label="Full Name" value="Enzo Soler" />
        <InactiveInput label="Email" value="enzo@chronoinnovation.com" />
      </div>

      {/* Section: Body */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Body</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <InactiveInput label="Height" value="183" unit="cm" />
        <InactiveInput label="Weight" value="82.0" unit="kg" />
      </div>

      {/* Section: Goals */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Training Goal</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {["Strength & Hypertrophy", "Fat Loss", "Endurance", "General Fitness"].map((g, i) => (
          <button key={i} style={{ background: i === 0 ? C.tealDim : C.card, border: `1.5px solid ${i === 0 ? C.teal : C.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: font.text, fontSize: 15, color: i === 0 ? C.teal : C.white, fontWeight: i === 0 ? 600 : 400 }}>{g}</span>
            {i === 0 && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke={C.teal} strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Danger Zone</span>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 32 }}>
        {[
          { label: "Reset All Progress", color: C.red },
          { label: "Delete Account", color: C.red },
        ].map((row, i, arr) => (
          <div key={i}>
            <button style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px" }}>
              <span style={{ fontFamily: font.text, fontSize: 16, color: row.color, fontWeight: 500 }}>{row.label}</span>
              <RowChevron />
            </button>
            {i < arr.length - 1 && <Divider indent={16} />}
          </div>
        ))}
      </div>
    </div>

    <TabBar active="more" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 71 · PROFILE — RESET PROGRESS DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
const Screen71 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <NavBar title="Edit Profile" large={false} back="Profile" />

    {/* Dimmed background content suggestion */}
    <div style={{ flex: 1, opacity: 0.2, padding: "20px 20px 0", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 56, background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }} />
        <div style={{ height: 56, background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }} />
        <div style={{ height: 56, background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }} />
      </div>
    </div>

    {/* Sheet Backdrop */}
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 10 }} />

    {/* Sheet */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, background: C.card, borderRadius: "20px 20px 0 0", padding: "12px 24px 0", border: `1px solid ${C.border}` }}>
      {/* Drag handle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
      </div>

      {/* Warning icon */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4L26 24H2L14 4Z" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11v6" stroke={C.red} strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="20" r="1.2" fill={C.red}/></svg>
        </div>
      </div>

      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: C.white, textAlign: "center", margin: "0 0 10px", letterSpacing: -0.3 }}>Reset All Progress?</h2>
      <p style={{ fontFamily: font.text, fontSize: 15, color: C.sub, textAlign: "center", lineHeight: 1.55, margin: "0 0 24px" }}>
        This will permanently erase all your workouts, nutrition logs, body measurements, and progress photos. This action cannot be undone.
      </p>

      {/* What will be deleted */}
      <div style={{ background: C.redDim, borderRadius: 12, border: `1px solid ${C.red}25`, padding: "14px 16px", marginBottom: 24 }}>
        {["142 workout sessions", "61 nutrition days logged", "38 body check-ins", "24 progress photos"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
            <span style={{ fontFamily: font.text, fontSize: 14, color: C.red }}>{item}</span>
          </div>
        ))}
      </div>

      <button style={{ width: "100%", background: C.red, border: "none", borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 12 }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 600, color: C.white }}>Reset Everything</span>
      </button>
      <button style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px", marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 500, color: C.sub }}>Cancel</span>
      </button>
      <HomeIndicator />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 72 · PROFILE — LOGOUT CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════
const Screen72 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />

    {/* Blurred background */}
    <div style={{ flex: 1, opacity: 0.15, padding: "28px 20px" }}>
      <div style={{ height: 88, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 16 }} />
      <div style={{ height: 100, background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }} />
    </div>

    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", zIndex: 10 }} />

    {/* Sheet */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, background: C.card, borderRadius: "20px 20px 0 0", padding: "12px 24px 0", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
      </div>

      {/* User summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.bg, borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, #2A6B6B)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: C.white }}>E</span>
        </div>
        <div>
          <p style={{ fontFamily: font.text, fontSize: 16, fontWeight: 600, color: C.white, margin: "0 0 2px" }}>Enzo Soler</p>
          <p style={{ fontFamily: font.text, fontSize: 13, color: C.sub, margin: 0 }}>enzo@chronoinnovation.com</p>
        </div>
        <Badge label="Pro" color={C.teal} />
      </div>

      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: C.white, margin: "0 0 10px", letterSpacing: -0.3 }}>Log Out?</h2>
      <p style={{ fontFamily: font.text, fontSize: 15, color: C.sub, lineHeight: 1.55, margin: "0 0 28px" }}>
        Your data is safely stored in Atlas. Logging out won't delete anything — you can sign back in anytime.
      </p>

      <button style={{ width: "100%", background: C.red, border: "none", borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 12 }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 600, color: C.white }}>Log Out</span>
      </button>
      <button style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px", marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 500, color: C.teal }}>Stay Signed In</span>
      </button>
      <HomeIndicator />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 73 · SETTINGS — MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const SettingsSection = ({ title, rows }) => (
  <div style={{ marginBottom: 20 }}>
    {title && <div style={{ padding: "0 4px 8px 4px" }}><span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</span></div>}
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      {rows.map((row, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: row.iconBg || C.tealDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {row.icon}
              </div>
              <div>
                <p style={{ fontFamily: font.text, fontSize: 15, color: row.danger ? C.red : C.white, fontWeight: 500, margin: 0 }}>{row.label}</p>
                {row.sub && <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, margin: "1px 0 0" }}>{row.sub}</p>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {row.value && <span style={{ fontFamily: font.text, fontSize: 14, color: C.sub }}>{row.value}</span>}
              {row.toggle !== undefined ? <Switch on={row.toggle} /> : <RowChevron />}
            </div>
          </div>
          {i < rows.length - 1 && <Divider indent={58} />}
        </div>
      ))}
    </div>
  </div>
);

const Screen73 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <div style={{ padding: "4px 24px 16px" }}>
      <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 700, color: C.white, margin: 0, letterSpacing: -0.5 }}>Settings</h1>
    </div>

    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
      <SettingsSection title="Account" rows={[
        { label: "Profile", sub: "Enzo Soler", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" fill={C.teal}/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/></svg>, iconBg: C.tealDim },
        { label: "Subscription", sub: "Pro · Renews Apr 1", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" fill={C.teal}/></svg>, iconBg: C.tealDim },
      ]} />

      <SettingsSection title="Preferences" rows={[
        { label: "Theme", value: "Dark", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a6 6 0 1 0 6 6 4 4 0 0 1-6-6z" fill={C.teal}/></svg>, iconBg: C.tealDim },
        { label: "Units", value: "Metric", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3v10M3 8h5M3 13h10" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/></svg>, iconBg: C.tealDim },
        { label: "Week Starts On", value: "Monday", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke={C.teal} strokeWidth="1.5"/><path d="M5 1v4M11 1v4M2 7h12" stroke={C.teal} strokeWidth="1.4" strokeLinecap="round"/></svg>, iconBg: C.tealDim },
        { label: "Language", value: "English", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={C.teal} strokeWidth="1.5"/><path d="M2 8h12M8 2c-2 2-3 4-3 6s1 4 3 6M8 2c2 2 3 4 3 6s-1 4-3 6" stroke={C.teal} strokeWidth="1.2"/></svg>, iconBg: C.tealDim },
      ]} />

      <SettingsSection title="Notifications" rows={[
        { label: "Daily Reminders", toggle: true, icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 0 1 5 5v3l1.5 2H1.5L3 9V6a5 5 0 0 1 5-5z" stroke={C.teal} strokeWidth="1.4"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" stroke={C.teal} strokeWidth="1.4" strokeLinecap="round"/></svg>, iconBg: C.tealDim },
        { label: "Workout Alerts", toggle: true, icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v5l3 3" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="6" stroke={C.teal} strokeWidth="1.5"/></svg>, iconBg: C.tealDim },
        { label: "Weekly Summary", toggle: false, icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke={C.teal} strokeWidth="1.4"/><path d="M5 7h6M5 10h4" stroke={C.teal} strokeWidth="1.2" strokeLinecap="round"/></svg>, iconBg: C.tealDim },
      ]} />

      <SettingsSection title="Privacy & Data" rows={[
        { label: "Health Sync", sub: "Apple Health connected", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13C8 13 2 9.5 2 5.5a3.5 3.5 0 0 1 6-2.4A3.5 3.5 0 0 1 14 5.5C14 9.5 8 13 8 13z" fill={C.green} opacity="0.8"/></svg>, iconBg: C.greenDim },
        { label: "Data Export", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M5 8l3 3 3-3M3 12v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, iconBg: C.tealDim },
        { label: "Privacy Policy", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 3 2.7 5.6 6 7 3.3-1.4 6-4 6-7V4L8 1z" stroke={C.teal} strokeWidth="1.4"/></svg>, iconBg: C.tealDim },
      ]} />

      <SettingsSection title="" rows={[
        { label: "Delete Account", danger: true, icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l.7 9h6.6L12 4" stroke={C.red} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>, iconBg: C.redDim },
      ]} />

      <div style={{ paddingBottom: 32 }}>
        <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, textAlign: "center" }}>atlas.core v2.4.1 · Build 241</p>
      </div>
    </div>

    <TabBar active="more" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 74 · SETTINGS — THEME
// ═══════════════════════════════════════════════════════════════════════════════
const Screen74 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <NavBar title="Appearance" large={false} back="Settings" />

    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>

      {/* Theme Options */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Theme</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Dark", active: true, bg: "#080E0E", surface: "#111A1A" },
          { label: "Light", active: false, bg: "#F2F4F6", surface: "#FFFFFF" },
          { label: "System", active: false, bg: "linear-gradient(135deg, #080E0E 50%, #F2F4F6 50%)", surface: "#111A1A" },
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 80, borderRadius: 12, background: t.bg, border: `2px solid ${t.active ? C.teal : C.border}`, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 10, left: 8, right: 8, height: 10, borderRadius: 3, background: t.surface, opacity: 0.8 }} />
              <div style={{ position: "absolute", top: 26, left: 8, right: 8, height: 6, borderRadius: 3, background: t.surface, opacity: 0.5 }} />
              <div style={{ position: "absolute", top: 37, left: 8, right: 20, height: 6, borderRadius: 3, background: t.surface, opacity: 0.4 }} />
              {t.active && (
                <div style={{ position: "absolute", bottom: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
            <p style={{ fontFamily: font.text, fontSize: 12, color: t.active ? C.teal : C.sub, textAlign: "center", margin: 0, fontWeight: t.active ? 600 : 400 }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Accent Color */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Accent Color</span>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {[
            { color: "#4A9B9B", active: true },
            { color: "#6B8EE8", active: false },
            { color: "#E07D4A", active: false },
            { color: "#9B6BE8", active: false },
            { color: "#4CAF7D", active: false },
            { color: "#E0A84A", active: false },
          ].map((c, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: c.color, border: c.active ? `3px solid ${C.white}` : "3px solid transparent", outline: c.active ? `2px solid ${C.teal}` : "none", cursor: "pointer", boxSizing: "border-box" }} />
          ))}
        </div>
      </div>

      {/* Text Size */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Text Size</span>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: font.text, fontSize: 12, color: C.sub }}>Aa</span>
          <span style={{ fontFamily: font.text, fontSize: 20, color: C.sub }}>Aa</span>
        </div>
        <div style={{ position: "relative", height: 4, background: C.border, borderRadius: 2 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: "40%", height: "100%", background: C.teal, borderRadius: 2 }} />
          <div style={{ position: "absolute", left: "40%", top: "50%", transform: "translate(-50%, -50%)", width: 22, height: 22, borderRadius: "50%", background: C.white, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <span style={{ fontFamily: font.text, fontSize: 11, color: C.sub }}>Small</span>
          <span style={{ fontFamily: font.text, fontSize: 11, color: C.teal, fontWeight: 600 }}>Default</span>
          <span style={{ fontFamily: font.text, fontSize: 11, color: C.sub }}>Large</span>
        </div>
      </div>

      {/* Display options */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 32 }}>
        {[
          { label: "Reduce Motion", sub: "Minimize animations", toggle: false },
          { label: "High Contrast", sub: "Increase visual distinction", toggle: false },
          { label: "Bold Text", sub: "Thicker font weight", toggle: true },
        ].map((row, i, arr) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
              <div>
                <p style={{ fontFamily: font.text, fontSize: 15, color: C.white, fontWeight: 500, margin: 0 }}>{row.label}</p>
                <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, margin: "2px 0 0" }}>{row.sub}</p>
              </div>
              <Switch on={row.toggle} />
            </div>
            {i < arr.length - 1 && <Divider indent={16} />}
          </div>
        ))}
      </div>
    </div>

    <TabBar active="more" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 75 · SETTINGS — DELETE ACCOUNT CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════
const Screen75 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <NavBar title="Settings" large={false} back="Settings" />

    <div style={{ flex: 1, opacity: 0.15, padding: "20px" }}>
      <div style={{ height: 120, background: C.card, borderRadius: 14, marginBottom: 12 }} />
      <div style={{ height: 80, background: C.card, borderRadius: 14 }} />
    </div>

    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 10 }} />

    {/* Sheet */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, background: C.card, borderRadius: "20px 20px 0 0", padding: "12px 24px 0", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.redDim, border: `1px solid ${C.red}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 8l16 16M24 8L8 24" stroke={C.red} strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: C.white, textAlign: "center", margin: "0 0 10px", letterSpacing: -0.3 }}>Delete Account</h2>
      <p style={{ fontFamily: font.text, fontSize: 15, color: C.sub, textAlign: "center", lineHeight: 1.55, margin: "0 0 24px" }}>
        Your account and all associated data will be permanently deleted. This action is irreversible.
      </p>

      {/* Consequences */}
      <div style={{ background: C.redDim, borderRadius: 12, border: `1px solid ${C.red}25`, padding: "16px", marginBottom: 24 }}>
        <p style={{ fontFamily: font.text, fontSize: 12, fontWeight: 600, color: C.red, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>You will lose</p>
        {[
          "All workout history and templates",
          "Nutrition logs and custom foods",
          "Body measurements and photos",
          "Active Pro subscription (no refund)",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "3px 0" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1, flexShrink: 0 }}><path d="M3 3l8 8M11 3L3 11" stroke={C.red} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontFamily: font.text, fontSize: 14, color: `${C.red}CC`, lineHeight: 1.4 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Confirmation input */}
      <div style={{ background: C.bg, borderRadius: 10, border: `1.5px solid ${C.red}50`, padding: "14px 16px", marginBottom: 20 }}>
        <p style={{ fontFamily: font.text, fontSize: 11, color: C.sub, margin: "0 0 4px", letterSpacing: 0.3 }}>Type DELETE to confirm</p>
        <p style={{ fontFamily: font.mono, fontSize: 15, color: C.sub, margin: 0, letterSpacing: 1 }}>_ _ _ _ _ _</p>
      </div>

      <button style={{ width: "100%", background: `${C.red}30`, border: `1.5px solid ${C.red}60`, borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 12 }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 600, color: `${C.red}80` }}>Delete My Account</span>
      </button>
      <button style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px", marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 500, color: C.sub }}>Cancel</span>
      </button>
      <HomeIndicator />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 85 · EXPORT — MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const ExportCategory = ({ icon, label, desc, checked }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer" }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: C.tealDim, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: font.text, fontSize: 15, fontWeight: 600, color: C.white, margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, margin: 0 }}>{desc}</p>
    </div>
    <div style={{ width: 22, height: 22, borderRadius: 6, background: checked ? C.teal : "transparent", border: `1.5px solid ${checked ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  </div>
);

const Screen85 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <NavBar title="Export Data" large={false} back="Settings" />

    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 0" }}>
      {/* Header card */}
      <div style={{ background: C.tealDim2, borderRadius: 14, border: `1px solid ${C.teal}25`, padding: "16px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v10M6 9l3 3 3-3M3 14v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke={C.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <p style={{ fontFamily: font.text, fontSize: 14, fontWeight: 600, color: C.teal, margin: "0 0 4px" }}>Your data, your way</p>
          <p style={{ fontFamily: font.text, fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.5 }}>Export a full copy of your Atlas data. Choose what to include and your preferred format.</p>
        </div>
      </div>

      {/* Data selection */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Include</span>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
        {[
          { label: "Workouts", desc: "142 sessions, templates, PRs", checked: true, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="8" width="14" height="3" rx="1.5" fill={C.teal} opacity="0.8"/><circle cx="5" cy="9.5" r="3" fill={C.teal}/><circle cx="13" cy="9.5" r="3" fill={C.teal}/></svg> },
          { label: "Nutrition", desc: "61 days of meals & macros", checked: true, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2C6 2 3 5 3 8.5c0 4 3.5 7 6 8 2.5-1 6-4 6-8C15 5 12 2 9 2z" fill={C.teal} opacity="0.7"/></svg> },
          { label: "Body Metrics", desc: "38 check-ins, weight, measurements", checked: true, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="2,14 6,8 10,11 14,5 16,7" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          { label: "Progress Photos", desc: "24 photos · ~180 MB", checked: false, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="11" rx="2" stroke={C.teal} strokeWidth="1.4"/><circle cx="9" cy="9.5" r="3" stroke={C.teal} strokeWidth="1.4"/><circle cx="14" cy="5" r="1.2" fill={C.teal}/></svg> },
          { label: "Protocols", desc: "3 active protocols", checked: false, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4h10M4 9h7M4 14h5" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/></svg> },
        ].map((item, i, arr) => (
          <div key={i}>
            <ExportCategory {...item} />
            {i < arr.length - 1 && <Divider indent={70} />}
          </div>
        ))}
      </div>

      {/* Format */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Format</span>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
        {[
          { label: "JSON", sub: "Full structured export · Recommended for re-import", active: true },
          { label: "CSV", sub: "Spreadsheet-compatible · No media", active: false },
          { label: "PDF Report", sub: "Human-readable summary", active: false },
        ].map((f, i, arr) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
              <div>
                <p style={{ fontFamily: font.mono, fontSize: 15, fontWeight: 600, color: f.active ? C.teal : C.white, margin: "0 0 2px" }}>{f.label}</p>
                <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, margin: 0 }}>{f.sub}</p>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: f.active ? C.teal : "transparent", border: `2px solid ${f.active ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.white }} />}
              </div>
            </div>
            {i < arr.length - 1 && <Divider indent={16} />}
          </div>
        ))}
      </div>

      {/* Date range */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: font.text, fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>Date Range</span>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 24 }}>
        {["All Time", "Last 90 Days", "Last 30 Days", "Custom Range"].map((d, i, arr) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
              <span style={{ fontFamily: font.text, fontSize: 15, color: i === 0 ? C.teal : C.white, fontWeight: i === 0 ? 600 : 400 }}>{d}</span>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: i === 0 ? C.teal : "transparent", border: `2px solid ${i === 0 ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 0 && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.white }} />}
              </div>
            </div>
            {i < arr.length - 1 && <Divider indent={16} />}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ paddingBottom: 12 }}>
        <div style={{ background: C.card, borderRadius: 12, padding: "12px 16px", border: `1px solid ${C.border}`, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: font.text, fontSize: 13, color: C.sub }}>Estimated size</span>
          <span style={{ fontFamily: font.mono, fontSize: 13, color: C.white, fontWeight: 600 }}>~24 MB</span>
        </div>
        <button style={{ width: "100%", background: C.teal, border: "none", borderRadius: 14, padding: "16px", cursor: "pointer" }}>
          <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 600, color: C.white }}>Generate Export</span>
        </button>
        <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, textAlign: "center", marginTop: 12 }}>Export will be sent to enzo@chronoinnovation.com</p>
      </div>
      <div style={{ paddingBottom: 20 }} />
    </div>

    <TabBar active="more" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 86 · EXPORT — GENERATING STATE
// ═══════════════════════════════════════════════════════════════════════════════
const ProgressStep = ({ done, active, label, sub, last }) => (
  <div style={{ display: "flex", gap: 14, paddingBottom: last ? 0 : 20 }}>
    {/* Icon + line */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? C.teal : active ? C.tealDim : C.card, border: `1.5px solid ${done || active ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
        {done
          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : active
          ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} />
          : <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.sub }} />}
      </div>
      {!last && <div style={{ width: 1.5, flex: 1, marginTop: 4, background: done ? C.teal : C.border, borderRadius: 1 }} />}
    </div>
    <div style={{ flex: 1, paddingTop: 4 }}>
      <p style={{ fontFamily: font.text, fontSize: 15, fontWeight: done || active ? 600 : 400, color: done ? C.white : active ? C.teal : C.sub, margin: "0 0 2px" }}>{label}</p>
      {sub && <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, margin: 0 }}>{sub}</p>}
    </div>
  </div>
);

const Screen86 = () => (
  <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
    <StatusBar />
    <div style={{ width: 126, height: 37 }} />
    <NavBar title="Export Data" large={false} back="Settings" />

    <div style={{ flex: 1, padding: "24px 20px 0", display: "flex", flexDirection: "column" }}>
      {/* Central progress ring */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke={C.border} strokeWidth="6" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={C.teal} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.68)}`}
              strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <span style={{ fontFamily: font.mono, fontSize: 26, fontWeight: 700, color: C.white, letterSpacing: -0.5 }}>68%</span>
            <span style={{ fontFamily: font.text, fontSize: 11, color: C.sub }}>complete</span>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: C.white, margin: "0 0 8px", letterSpacing: -0.3 }}>Generating Export</h2>
        <p style={{ fontFamily: font.text, fontSize: 14, color: C.sub, margin: 0 }}>This typically takes 30–60 seconds</p>
      </div>

      {/* Steps */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 20px 20px", marginBottom: 20 }}>
        <ProgressStep done label="Collecting workout data" sub="142 sessions processed" />
        <ProgressStep done label="Collecting nutrition logs" sub="61 days processed" />
        <ProgressStep done label="Collecting body metrics" sub="38 check-ins processed" />
        <ProgressStep active label="Packaging JSON export" sub="Compressing · 24 MB → 8.2 MB" />
        <ProgressStep label="Sending to email" sub="enzo@chronoinnovation.com" />
        <ProgressStep label="Done" last />
      </div>

      {/* ETA strip */}
      <div style={{ background: C.tealDim2, borderRadius: 12, border: `1px solid ${C.teal}20`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: font.text, fontSize: 13, color: C.sub }}>Estimated time remaining</span>
        <span style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 600, color: C.teal }}>~12s</span>
      </div>

      {/* Cancel */}
      <button style={{ width: "100%", background: "none", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "15px", cursor: "pointer" }}>
        <span style={{ fontFamily: font.text, fontSize: 17, fontWeight: 500, color: C.sub }}>Cancel Export</span>
      </button>

      <div style={{ flex: 1 }} />
      <div style={{ paddingBottom: 16 }}>
        <p style={{ fontFamily: font.text, fontSize: 12, color: C.sub, textAlign: "center", lineHeight: 1.6 }}>
          You can leave this screen — we'll notify you when your export is ready.
        </p>
      </div>
    </div>

    <TabBar active="more" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Root: Gallery
// ═══════════════════════════════════════════════════════════════════════════════
export default function ScreenGallery() {
  const screens = [
    { id: "69", label: "69 · Profile — View", Component: Screen69 },
    { id: "70", label: "70 · Profile — Edit", Component: Screen70 },
    { id: "71", label: "71 · Profile — Reset Progress", Component: Screen71 },
    { id: "72", label: "72 · Profile — Logout", Component: Screen72 },
    { id: "73", label: "73 · Settings — Main", Component: Screen73 },
    { id: "74", label: "74 · Settings — Appearance", Component: Screen74 },
    { id: "75", label: "75 · Settings — Delete Account", Component: Screen75 },
    { id: "85", label: "85 · Export — Main", Component: Screen85 },
    { id: "86", label: "86 · Export — Generating", Component: Screen86 },
  ];

  return (
    <div style={{ background: "#030708", minHeight: "100vh", padding: "48px 32px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.teal}, #2A6B6B)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.white, letterSpacing: -0.5 }}>A</span>
          </div>
          <span style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: -0.5 }}>atlas.core</span>
        </div>
        <p style={{ fontFamily: font.text, fontSize: 15, color: C.sub, margin: 0 }}>
          Profile · Settings · Export — Screen Family
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
          {["Screens 69–75", "85–86", "9 screens"].map((t, i) => (
            <span key={i} style={{ fontFamily: font.text, fontSize: 12, color: C.teal, background: C.tealDim, borderRadius: 20, padding: "4px 12px", border: `1px solid ${C.teal}30` }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Screen Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "center" }}>
        {screens.map(({ id, label, Component }) => (
          <Phone key={id} label={label}>
            <Component />
          </Phone>
        ))}
      </div>
    </div>
  );
}
