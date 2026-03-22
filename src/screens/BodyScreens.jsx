/**
 * atlas.core — Body & Progress Tracking Screen Family
 * Screens 39–45: Body Hub, Progress Tab, Measurements Tab,
 *                Add Measurement Modal, Progress Photos Tab,
 *                Full-Screen Viewer, Upload State
 *
 * Design system: dark-first, SF Pro, #080E0E bg, #4A9B9B accent
 */

import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, BarChart3, Camera, ChevronLeft, ChevronRight,
  Plus, X, Check, Upload, Loader2, ArrowUpRight, ArrowDownRight,
  Minus, Scale, Ruler, Activity, Lock, MoreHorizontal, ZoomIn,
  GitCompare, Trash2, Image, Star, ChevronDown,
} from "lucide-react";

// ─── Design Tokens ──────────────────────────────────────────────────────────
const DS = {
  bg:       "#080E0E",
  card:     "#111A1A",
  card2:    "#0D1515",
  border:   "#1E2C2C",
  accent:   "#4A9B9B",
  accentDim:"rgba(74,155,155,0.12)",
  accentMid:"rgba(74,155,155,0.25)",
  fg:       "#FFFFFF",
  fg2:      "#8A9A9A",
  fg3:      "#556060",
  ok:       "#4CAF7D",
  err:      "#E05C5C",
  warn:     "#E0A25C",
  overlay:  "rgba(8,14,14,0.92)",
};

// ─── Sample Data ─────────────────────────────────────────────────────────────
const WEIGHT_DATA = [
  { w: "Jan 6",  v: 84.2 }, { w: "Jan 13", v: 83.8 }, { w: "Jan 20", v: 83.4 },
  { w: "Jan 27", v: 83.1 }, { w: "Feb 3",  v: 82.7 }, { w: "Feb 10", v: 82.9 },
  { w: "Feb 17", v: 82.3 }, { w: "Feb 24", v: 81.8 }, { w: "Mar 3",  v: 81.4 },
  { w: "Mar 10", v: 81.1 }, { w: "Mar 17", v: 80.8 }, { w: "Mar 22", v: 80.5 },
];
const FAT_DATA = [
  { w: "Jan 6",  v: 18.4 }, { w: "Jan 13", v: 18.2 }, { w: "Jan 20", v: 17.9 },
  { w: "Jan 27", v: 17.7 }, { w: "Feb 3",  v: 17.5 }, { w: "Feb 10", v: 17.6 },
  { w: "Feb 17", v: 17.3 }, { w: "Feb 24", v: 17.0 }, { w: "Mar 3",  v: 16.8 },
  { w: "Mar 10", v: 16.6 }, { w: "Mar 17", v: 16.4 }, { w: "Mar 22", v: 16.1 },
];
const WAIST_DATA = [
  { w: "Jan", v: 86 }, { w: "Feb", v: 84.5 }, { w: "Mar", v: 83.2 },
];

const MEASUREMENTS = [
  { key: "weight",   label: "Weight",    unit: "kg", current: 80.5,  prev: 84.2,  icon: Scale,    color: DS.accent },
  { key: "body_fat", label: "Body Fat",  unit: "%",  current: 16.1,  prev: 18.4,  icon: Activity, color: "#6B9FFF" },
  { key: "waist",    label: "Waist",     unit: "cm", current: 83.2,  prev: 86.0,  icon: Ruler,    color: DS.accent },
  { key: "chest",    label: "Chest",     unit: "cm", current: 101.4, prev: 100.2, icon: Ruler,    color: "#6B9FFF" },
  { key: "arms",     label: "Arms",      unit: "cm", current: 38.2,  prev: 37.1,  icon: Ruler,    color: DS.ok    },
  { key: "thighs",   label: "Thighs",    unit: "cm", current: 59.6,  prev: 61.0,  icon: Ruler,    color: DS.accent },
  { key: "hips",     label: "Hips",      unit: "cm", current: 96.2,  prev: 97.8,  icon: Ruler,    color: "#6B9FFF" },
  { key: "neck",     label: "Neck",      unit: "cm", current: 38.5,  prev: 38.3,  icon: Ruler,    color: DS.ok    },
];

// ─── Shared Primitives ───────────────────────────────────────────────────────

function Phone({ children, className = "" }) {
  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        background: DS.bg,
        borderRadius: 48,
        overflow: "hidden",
        position: "relative",
        fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
        border: `1px solid ${DS.border}`,
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
      }}
      className={className}
    >
      {/* Status bar */}
      <div style={{ height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: DS.fg, letterSpacing: -0.3 }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[3,3,3,3].map((_,i) => <div key={i} style={{ width: 3, height: 6 + i*2, background: DS.fg, borderRadius: 1.5, opacity: i < 3 ? 1 : 0.4 }} />)}
          </div>
          <div style={{ width: 16, height: 12, border: `1.5px solid ${DS.fg}`, borderRadius: 2, padding: 1 }}>
            <div style={{ height: "100%", width: "75%", background: DS.ok, borderRadius: 0.5 }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

function NavBar({ title, subtitle, back, action }) {
  return (
    <div style={{ padding: "8px 20px 0", flexShrink: 0 }}>
      {back && (
        <button style={{ display: "flex", alignItems: "center", gap: 4, color: DS.accent, fontSize: 15, fontWeight: 500, marginBottom: 4, background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={18} strokeWidth={2.5} /> {back}
        </button>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 12 }}>
        <div>
          {subtitle && <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
          <h1 style={{ fontSize: 28, fontWeight: 700, color: DS.fg, letterSpacing: -0.8, margin: 0, lineHeight: 1.15 }}>{title}</h1>
        </div>
        {action}
      </div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${DS.border}`, margin: "0 20px", gap: 0, flexShrink: 0 }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const isA = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 16px 12px",
              fontSize: 13, fontWeight: isA ? 600 : 500,
              color: isA ? DS.fg : DS.fg2,
              borderBottom: `2px solid ${isA ? DS.accent : "transparent"}`,
              background: "none", border: "none", borderRadius: 0,
              cursor: "pointer", transition: "all 0.15s",
              flexShrink: 0,
            }}
          >
            {Icon && <Icon size={14} strokeWidth={isA ? 2.2 : 1.8} color={isA ? DS.accent : DS.fg2} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function MetricPill({ label, value, unit, delta, positive, color = DS.accent }) {
  const hasD = delta !== undefined;
  const isPos = positive !== undefined ? positive : delta >= 0;
  return (
    <div style={{ background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "16px", flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: DS.fg, letterSpacing: -0.8, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: DS.fg2 }}>{unit}</span>
      </div>
      {hasD && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isPos
            ? <ArrowUpRight size={12} color={DS.ok} strokeWidth={2.5} />
            : <ArrowDownRight size={12} color={DS.warn} strokeWidth={2.5} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: isPos ? DS.ok : DS.warn }}>
            {Math.abs(delta)}{unit} vs start
          </span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: DS.fg3, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</p>
      {action && <button style={{ fontSize: 13, fontWeight: 600, color: DS.accent, background: "none", border: "none", cursor: "pointer" }}>{action}</button>}
    </div>
  );
}

function BottomTabNav({ active = "body" }) {
  const tabs = [
    { id: "today", label: "Today", icon: "◎" },
    { id: "train", label: "Train", icon: "⬡" },
    { id: "nutrition", label: "Nutrition", icon: "◈" },
    { id: "body", label: "Body", icon: "◉" },
    { id: "more", label: "More", icon: "···" },
  ];
  return (
    <div style={{
      height: 83, background: DS.card2, borderTop: `1px solid ${DS.border}`,
      display: "flex", alignItems: "flex-start", paddingTop: 10, paddingBottom: 0,
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <div style={{
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 8,
            background: t.id === active ? DS.accentDim : "transparent",
          }}>
            <span style={{ fontSize: t.icon === "···" ? 10 : 16, color: t.id === active ? DS.accent : DS.fg3 }}>{t.icon}</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: t.id === active ? 700 : 500, color: t.id === active ? DS.accent : DS.fg3, letterSpacing: 0.2 }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// Custom recharts tooltip
function ChartTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: "8px 12px" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: DS.fg }}>{payload[0].value?.toFixed(1)}<span style={{ fontSize: 11, color: DS.fg2, marginLeft: 3 }}>{unit}</span></p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 39 — Body Hub
// ═══════════════════════════════════════════════════════════════════════════
function Screen39_BodyHub() {
  const wStart = WEIGHT_DATA[0].v, wCur = WEIGHT_DATA[WEIGHT_DATA.length - 1].v;
  const fStart = FAT_DATA[0].v,   fCur = FAT_DATA[FAT_DATA.length - 1].v;

  return (
    <Phone>
      {/* Large title area */}
      <div style={{ padding: "12px 20px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Body</p>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: DS.fg, letterSpacing: -1, lineHeight: 1.1, marginBottom: 4 }}>Body Progress</h1>
        <p style={{ fontSize: 13, color: DS.fg2, marginBottom: 16 }}>Track your evolution across metrics, measurements & photos.</p>
      </div>

      {/* Hero weight card */}
      <div style={{ margin: "0 20px 16px", background: `linear-gradient(135deg, #0D1E1E 0%, #0A1616 100%)`, borderRadius: 20, border: `1px solid ${DS.border}`, padding: "20px", overflow: "hidden", position: "relative" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${DS.accentMid} 0%, transparent 70%)`, pointerEvents: "none" }} />
        <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>12-Week Summary</p>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: DS.fg2, marginBottom: 4 }}>Current Weight</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: DS.fg, letterSpacing: -1.5, fontVariantNumeric: "tabular-nums" }}>{wCur}</span>
              <span style={{ fontSize: 15, color: DS.fg2 }}>kg</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              <ArrowDownRight size={13} color={DS.ok} strokeWidth={2.5} />
              <span style={{ fontSize: 12, fontWeight: 600, color: DS.ok }}>−{(wStart - wCur).toFixed(1)} kg since Jan</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: DS.fg2, marginBottom: 4 }}>Body Fat</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: DS.fg, letterSpacing: -1.5, fontVariantNumeric: "tabular-nums" }}>{fCur}</span>
              <span style={{ fontSize: 15, color: DS.fg2 }}>%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              <ArrowDownRight size={13} color={DS.ok} strokeWidth={2.5} />
              <span style={{ fontSize: 12, fontWeight: 600, color: DS.ok }}>−{(fStart - fCur).toFixed(1)}% since Jan</span>
            </div>
          </div>
        </div>
        {/* Mini sparkline */}
        <ResponsiveContainer width="100%" height={52}>
          <AreaChart data={WEIGHT_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DS.accent} stopOpacity={0.3} />
                <stop offset="100%" stopColor={DS.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={DS.accent} strokeWidth={2} fill="url(#g1)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tab navigation CTAs */}
      <div style={{ margin: "0 20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { icon: TrendingUp, label: "Progress", sub: "Trends & charts", color: DS.accent },
          { icon: BarChart3,  label: "Measures", sub: "8 metrics",        color: "#6B9FFF" },
          { icon: Camera,     label: "Photos",   sub: "3 checkpoints",    color: DS.ok    },
        ].map(t => {
          const Icon = t.icon;
          return (
            <div key={t.label} style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, padding: "14px 12px", cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={16} strokeWidth={1.8} color={t.color} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: DS.fg, marginBottom: 2 }}>{t.label}</p>
              <p style={{ fontSize: 10, color: DS.fg2 }}>{t.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Recent measurements */}
      <div style={{ padding: "0 20px 16px" }}>
        <SectionHeader label="Recent Measurements" action="See all" />
        <div style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
          {MEASUREMENTS.slice(0, 4).map((m, i) => {
            const delta = m.current - m.prev;
            const isDown = delta < 0;
            const isGood = (m.key === "weight" || m.key === "body_fat" || m.key === "waist" || m.key === "hips") ? isDown : !isDown;
            return (
              <div key={m.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < 3 ? `1px solid ${DS.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, opacity: 0.8 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: DS.fg }}>{m.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    {isGood
                      ? <ArrowDownRight size={12} color={DS.ok} strokeWidth={2.5} />
                      : <ArrowUpRight size={12} color={DS.err} strokeWidth={2.5} />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: isGood ? DS.ok : DS.err }}>
                      {Math.abs(delta).toFixed(1)}{m.unit}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: DS.fg, fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}>
                    {m.current}<span style={{ fontSize: 11, color: DS.fg2, marginLeft: 2 }}>{m.unit}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent photo checkpoint */}
      <div style={{ padding: "0 20px 20px" }}>
        <SectionHeader label="Latest Checkpoint" action="See all" />
        <div style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: DS.fg }}>March 22, 2026</p>
              <p style={{ fontSize: 11, color: DS.fg2 }}>4 of 4 poses recorded</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${DS.ok}18`, borderRadius: 20, padding: "4px 10px" }}>
              <Check size={11} color={DS.ok} strokeWidth={2.5} />
              <span style={{ fontSize: 11, fontWeight: 700, color: DS.ok }}>Complete</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Front", "Side", "Back", "Free"].map((pose, i) => (
              <div key={pose} style={{
                flex: 1, aspectRatio: "3/4", borderRadius: 10,
                background: `linear-gradient(180deg, #1A2E2E 0%, #0F1E1E 100%)`,
                border: `1px solid ${DS.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={14} color={DS.fg3} strokeWidth={1.5} />
                <p style={{ fontSize: 9, color: DS.fg3, marginTop: 4, fontWeight: 500 }}>{pose}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomTabNav active="body" />
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 40 — Body / Progress Tab
// ═══════════════════════════════════════════════════════════════════════════
function Screen40_ProgressTab() {
  return (
    <Phone>
      <NavBar title="Body Progress" subtitle="Body" />
      <TabBar
        tabs={[
          { id: "progress", label: "Progress", icon: TrendingUp },
          { id: "measurements", label: "Measurements", icon: BarChart3 },
          { id: "photos", label: "Photos", icon: Camera },
        ]}
        active="progress"
        onChange={() => {}}
      />

      <div style={{ flex: 1, padding: "20px 20px 20px", overflowY: "auto" }}>
        {/* Time selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["4W", "8W", "12W", "All"].map((t, i) => (
            <button key={t} style={{
              padding: "6px 14px", borderRadius: 20,
              background: i === 2 ? DS.accent : DS.card,
              border: `1px solid ${i === 2 ? DS.accent : DS.border}`,
              color: i === 2 ? "#fff" : DS.fg2,
              fontSize: 12, fontWeight: i === 2 ? 700 : 500,
              cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>

        {/* Weight chart */}
        <div style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, padding: "18px 16px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Weight</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: DS.fg, letterSpacing: -0.8 }}>80.5</span>
                <span style={{ fontSize: 13, color: DS.fg2 }}>kg</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <ArrowDownRight size={13} color={DS.ok} strokeWidth={2.5} />
                <span style={{ fontSize: 13, fontWeight: 700, color: DS.ok }}>−3.7 kg</span>
              </div>
              <p style={{ fontSize: 11, color: DS.fg2, marginTop: 2 }}>vs 12 weeks ago</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={WEIGHT_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={DS.accent} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={DS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={DS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="w" tick={{ fill: DS.fg3, fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: DS.fg3, fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip content={<ChartTooltip unit="kg" />} />
              <Area type="monotone" dataKey="v" stroke={DS.accent} strokeWidth={2.5} fill="url(#gW)" dot={false} activeDot={{ r: 5, fill: DS.accent, stroke: DS.bg, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Goal progress */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${DS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: DS.fg2 }}>Goal: 78 kg</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: DS.accent }}>2.5 kg to go</span>
            </div>
            <div style={{ height: 4, background: DS.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: `linear-gradient(90deg, ${DS.accent}, ${DS.accentMid})`, borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Body fat chart */}
        <div style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, padding: "18px 16px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Body Fat</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: DS.fg, letterSpacing: -0.8 }}>16.1</span>
                <span style={{ fontSize: 13, color: DS.fg2 }}>%</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <ArrowDownRight size={13} color={DS.ok} strokeWidth={2.5} />
                <span style={{ fontSize: 13, fontWeight: 700, color: DS.ok }}>−2.3%</span>
              </div>
              <p style={{ fontSize: 11, color: DS.fg2, marginTop: 2 }}>vs 12 weeks ago</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={FAT_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B9FFF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6B9FFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={DS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="w" tick={{ fill: DS.fg3, fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: DS.fg3, fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip content={<ChartTooltip unit="%" />} />
              <Area type="monotone" dataKey="v" stroke="#6B9FFF" strokeWidth={2.5} fill="url(#gF)" dot={false} activeDot={{ r: 5, fill: "#6B9FFF", stroke: DS.bg, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Waist sparkline */}
        <div style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, padding: "16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Waist</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: DS.fg, letterSpacing: -0.6 }}>83.2</span>
                <span style={{ fontSize: 12, color: DS.fg2 }}>cm</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                <ArrowDownRight size={12} color={DS.ok} strokeWidth={2.5} />
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.ok }}>−2.8 cm</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={WAIST_DATA} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gW2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={DS.accent} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={DS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="w" tick={{ fill: DS.fg3, fontSize: 10 }} tickLine={false} axisLine={false} />
              <Area type="monotone" dataKey="v" stroke={DS.accent} strokeWidth={2} fill="url(#gW2)" dot={{ r: 4, fill: DS.accent, stroke: DS.bg, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI insight pill */}
        <div style={{ background: `linear-gradient(135deg, ${DS.accentDim}, rgba(74,155,155,0.06))`, borderRadius: 14, border: `1px solid ${DS.accentMid}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: DS.accentMid, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <Star size={13} color={DS.accent} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: DS.accent, marginBottom: 4, letterSpacing: 0.1 }}>Atlas AI Insight</p>
              <p style={{ fontSize: 13, color: DS.fg2, lineHeight: 1.5 }}>
                Consistent 0.31 kg/week loss over 12 weeks. Body fat trending down while waist reduced 2.8 cm — strong recomp signal.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomTabNav active="body" />
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 41 — Body / Measurements Tab
// ═══════════════════════════════════════════════════════════════════════════
function Screen41_MeasurementsTab() {
  return (
    <Phone>
      <NavBar title="Measurements" subtitle="Body" />
      <TabBar
        tabs={[
          { id: "progress", label: "Progress", icon: TrendingUp },
          { id: "measurements", label: "Measurements", icon: BarChart3 },
          { id: "photos", label: "Photos", icon: Camera },
        ]}
        active="measurements"
        onChange={() => {}}
      />

      <div style={{ flex: 1, padding: "20px 20px", overflowY: "auto" }}>
        {/* Latest entry date + add button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 12, color: DS.fg2, marginBottom: 2 }}>Last recorded</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: DS.fg }}>Today · Mar 22</p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: DS.accent, color: "#fff", border: "none",
            borderRadius: 22, padding: "9px 16px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={14} strokeWidth={2.5} />
            Log Today
          </button>
        </div>

        {/* Measurement rows */}
        <div style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, overflow: "hidden", marginBottom: 20 }}>
          {MEASUREMENTS.map((m, i) => {
            const delta = m.current - m.prev;
            const isDown = delta < 0;
            const isGood = (["weight","body_fat","waist","hips"].includes(m.key)) ? isDown : !isDown;
            const Icon = m.icon;
            return (
              <div key={m.key} style={{
                display: "flex", alignItems: "center",
                padding: "14px 16px",
                borderBottom: i < MEASUREMENTS.length - 1 ? `1px solid ${DS.border}` : "none",
              }}>
                {/* Icon */}
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
                  <Icon size={15} strokeWidth={1.8} color={m.color} />
                </div>
                {/* Label + sparkline placeholder */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.fg, marginBottom: 1 }}>{m.label}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {isGood
                      ? <ArrowDownRight size={10} color={DS.ok} strokeWidth={2.5} />
                      : <ArrowUpRight size={10} color={DS.err} strokeWidth={2.5} />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: isGood ? DS.ok : DS.err }}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(1)}{m.unit}
                    </span>
                    <span style={{ fontSize: 10, color: DS.fg3 }}>vs start</span>
                  </div>
                </div>
                {/* Value */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: DS.fg, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{m.current}</span>
                    <span style={{ fontSize: 11, color: DS.fg2 }}>{m.unit}</span>
                  </div>
                  <p style={{ fontSize: 10, color: DS.fg3, marginTop: 1 }}>was {m.prev}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* History entries */}
        <SectionHeader label="History" action="Export" />
        {[
          { date: "Mar 22, 2026", weight: "80.5", fat: "16.1%" },
          { date: "Mar 8, 2026",  weight: "81.4", fat: "16.6%" },
          { date: "Feb 22, 2026", weight: "82.3", fat: "17.3%" },
          { date: "Feb 8, 2026",  weight: "82.9", fat: "17.6%" },
        ].map((entry, i) => (
          <div key={i} style={{
            background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}`,
            padding: "14px 16px", marginBottom: 8,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: DS.fg, marginBottom: 2 }}>{entry.date}</p>
              <p style={{ fontSize: 11, color: DS.fg2 }}>Weight {entry.weight} kg · Fat {entry.fat}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i === 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: DS.accent, background: DS.accentDim, borderRadius: 12, padding: "3px 8px" }}>Latest</span>
              )}
              <ChevronRight size={14} color={DS.fg3} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      <BottomTabNav active="body" />
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 42 — Measurements Add Modal (Bottom Sheet)
// ═══════════════════════════════════════════════════════════════════════════
function Screen42_AddModal() {
  return (
    <Phone>
      {/* Dimmed background */}
      <div style={{ flex: 1, background: "rgba(8,14,14,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end" }}>

        {/* Bottom sheet */}
        <div style={{
          width: "100%",
          background: DS.card,
          borderRadius: "24px 24px 0 0",
          border: `1px solid ${DS.border}`,
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
          maxHeight: 680,
          overflowY: "auto",
        }}>
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.border }} />
          </div>

          {/* Header */}
          <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Measurements</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: DS.fg, letterSpacing: -0.6, margin: 0 }}>Log Entry</h2>
              <p style={{ fontSize: 13, color: DS.fg2, marginTop: 4 }}>March 22, 2026 · Today</p>
            </div>
            <button style={{ width: 32, height: 32, borderRadius: "50%", background: DS.border, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <X size={14} color={DS.fg2} strokeWidth={2} />
            </button>
          </div>

          {/* Form fields */}
          <div style={{ padding: "0 20px 24px" }}>
            {/* Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Date</label>
              <div style={{ background: "#0A1616", border: `1.5px solid ${DS.accent}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: DS.fg }}>Mar 22, 2026</span>
                <ChevronDown size={14} color={DS.fg3} strokeWidth={2} />
              </div>
            </div>

            {/* Body weight + fat — side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[{ label: "Weight", unit: "kg", value: "80.5", accent: true }, { label: "Body Fat", unit: "%", value: "16.1" }].map(f => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{f.label}</label>
                  <div style={{ background: "#0A1616", border: `1.5px solid ${f.accent ? DS.accent : DS.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: DS.fg, fontVariantNumeric: "tabular-nums" }}>{f.value}</span>
                    <span style={{ fontSize: 12, color: DS.fg3 }}>{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Circumferences grid */}
            <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Circumferences</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Waist", unit: "cm", value: "83.2" },
                { label: "Chest", unit: "cm", value: "101.4" },
                { label: "Arms",  unit: "cm", value: "38.2"  },
                { label: "Thighs", unit: "cm", value: "59.6" },
                { label: "Hips",  unit: "cm", value: "96.2"  },
                { label: "Neck",  unit: "cm", value: "38.5"  },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6 }}>{f.label}</label>
                  <div style={{ background: "#0A1616", border: `1.5px solid ${DS.border}`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: DS.fg, fontVariantNumeric: "tabular-nums" }}>{f.value}</span>
                    <span style={{ fontSize: 11, color: DS.fg3 }}>{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Notes (optional)</label>
              <div style={{ background: "#0A1616", border: `1.5px solid ${DS.border}`, borderRadius: 12, padding: "12px 14px", minHeight: 72 }}>
                <span style={{ fontSize: 13, color: DS.fg3 }}>Morning, fasted…</span>
              </div>
            </div>

            {/* Save button */}
            <button style={{
              width: "100%", padding: "15px", borderRadius: 14,
              background: DS.accent, color: "#fff", border: "none",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              letterSpacing: 0.2,
            }}>
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 43 — Body / Progress Photos Tab
// ═══════════════════════════════════════════════════════════════════════════
function Screen43_PhotosTab() {
  const CHECKPOINTS = [
    { date: "March 22, 2026", label: "Today", filled: 4, poses: [true, true, true, true] },
    { date: "March 8, 2026",  label: null,    filled: 4, poses: [true, true, true, true] },
    { date: "February 22, 2026", label: null, filled: 3, poses: [true, true, true, false] },
  ];

  return (
    <Phone>
      <NavBar title="Photos" subtitle="Body" action={
        <button style={{ width: 34, height: 34, borderRadius: 10, background: DS.accent, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
          <Plus size={16} color="#fff" strokeWidth={2.5} />
        </button>
      } />
      <TabBar
        tabs={[
          { id: "progress", label: "Progress", icon: TrendingUp },
          { id: "measurements", label: "Measurements", icon: BarChart3 },
          { id: "photos", label: "Photos", icon: Camera },
        ]}
        active="photos"
        onChange={() => {}}
      />

      <div style={{ flex: 1, padding: "20px 20px", overflowY: "auto" }}>
        {/* Stats pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "14px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Checkpoints</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: DS.fg, letterSpacing: -0.8 }}>3</p>
            <p style={{ fontSize: 11, color: DS.fg2, marginTop: 3 }}>Since January</p>
          </div>
          <div style={{ flex: 1, background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "14px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Total Photos</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: DS.fg, letterSpacing: -0.8 }}>11</p>
            <p style={{ fontSize: 11, color: DS.fg2, marginTop: 3 }}>4 poses / checkpoint</p>
          </div>
          {/* Compare button */}
          <div style={{ background: DS.accentDim, borderRadius: 14, border: `1px solid ${DS.accentMid}`, padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", flexShrink: 0, width: 72 }}>
            <GitCompare size={18} color={DS.accent} strokeWidth={1.8} />
            <p style={{ fontSize: 10, fontWeight: 700, color: DS.accent, textAlign: "center", lineHeight: 1.2 }}>Compare</p>
          </div>
        </div>

        {/* Checkpoint cards */}
        {CHECKPOINTS.map((cp, ci) => (
          <div key={ci} style={{ background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, marginBottom: 12, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${DS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: DS.accentDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={15} color={DS.accent} strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DS.fg }}>{cp.date}</p>
                    {cp.label && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: DS.accent, background: DS.accentDim, borderRadius: 10, padding: "2px 8px" }}>Today</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: DS.fg2 }}>{cp.filled} of 4 poses recorded</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cp.filled === 4 && (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${DS.ok}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} color={DS.ok} strokeWidth={2.5} />
                  </div>
                )}
                <ChevronDown size={16} color={DS.fg3} strokeWidth={2} />
              </div>
            </div>

            {/* Photo grid */}
            <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {["Front", "Side", "Back", "Free"].map((pose, pi) => (
                <div key={pose} style={{ aspectRatio: "3/4", position: "relative" }}>
                  <div style={{
                    height: "100%", borderRadius: 10,
                    background: cp.poses[pi]
                      ? `linear-gradient(180deg, #1C3030 0%, #0E1E1E 100%)`
                      : `#0A1414`,
                    border: `1px solid ${cp.poses[pi] ? DS.border : DS.border}`,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative",
                  }}>
                    {cp.poses[pi] ? (
                      <>
                        {/* Photo placeholder — simulated with gradient */}
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, #1A3232 0%, #0C1A1A 60%, #061010 100%)` }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 6px 4px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
                          <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>{pose}</p>
                        </div>
                        {/* Expand icon */}
                        <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 5, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ZoomIn size={9} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera size={14} color={DS.fg3} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                        <p style={{ fontSize: 8, color: DS.fg3, marginTop: 4, fontWeight: 500, opacity: 0.6 }}>{pose}</p>
                        <div style={{ position: "absolute", bottom: 4 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px dashed ${DS.fg3}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4 }}>
                            <Plus size={8} color={DS.fg3} strokeWidth={2} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Pose guide */}
        <div style={{ background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Pose Guide</p>
          {[
            { n: 1, label: "Front", hint: "Arms to sides, looking at camera" },
            { n: 2, label: "Side", hint: "Right profile, arms relaxed" },
            { n: 3, label: "Back", hint: "Back to camera, arms at sides" },
            { n: 4, label: "Free Pose", hint: "Pose of your choice for comparison" },
          ].map(pose => (
            <div key={pose.n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: DS.accentDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: DS.accent }}>{pose.n}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: DS.fg }}>{pose.label}</span>
                <span style={{ fontSize: 11, color: DS.fg2 }}> — {pose.hint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomTabNav active="body" />
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 44 — Progress Photos Full-Screen Viewer
// ═══════════════════════════════════════════════════════════════════════════
function Screen44_FullScreenViewer() {
  return (
    <Phone>
      {/* Full-bleed dark viewer */}
      <div style={{ flex: 1, background: "#040A0A", display: "flex", flexDirection: "column", position: "relative" }}>

        {/* Top nav overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "linear-gradient(180deg, rgba(4,10,10,0.9) 0%, transparent 100%)",
          padding: "12px 20px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 10,
        }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={18} strokeWidth={2.5} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Compare toggle */}
            <button style={{
              display: "flex", alignItems: "center", gap: 5,
              background: DS.accentMid, border: `1px solid ${DS.accent}`,
              borderRadius: 20, padding: "6px 12px",
              color: DS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              <GitCompare size={13} strokeWidth={2} /> Compare
            </button>
            <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <MoreHorizontal size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Side-by-side comparison view */}
        <div style={{ flex: 1, display: "flex", gap: 2, paddingTop: 0 }}>
          {/* Left — Jan */}
          <div style={{ flex: 1, position: "relative", background: "linear-gradient(160deg, #0E2020 0%, #060E0E 100%)" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 14px 14px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Before</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Jan 6, 2026</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>84.2 kg · 18.4%</p>
            </div>
            {/* Simulated body silhouette using gradient */}
            <div style={{ position: "absolute", inset: "20%", background: "radial-gradient(ellipse at 50% 40%, rgba(74,155,155,0.06) 0%, transparent 70%)" }} />
          </div>

          {/* Right — Mar */}
          <div style={{ flex: 1, position: "relative", background: "linear-gradient(160deg, #112424 0%, #070F0F 100%)" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 14px 14px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: DS.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>After</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Mar 22, 2026</p>
              <p style={{ fontSize: 12, color: DS.accent }}>80.5 kg · 16.1%</p>
            </div>
            <div style={{ position: "absolute", inset: "20%", background: "radial-gradient(ellipse at 50% 40%, rgba(74,155,155,0.10) 0%, transparent 70%)" }} />
          </div>
        </div>

        {/* Center comparison line */}
        <div style={{ position: "absolute", top: 60, bottom: 160, left: "50%", transform: "translateX(-50%)", width: 2, background: `linear-gradient(180deg, transparent, ${DS.accent}, transparent)`, zIndex: 5 }} />

        {/* Bottom info panel */}
        <div style={{
          background: "rgba(8,14,14,0.96)", backdropFilter: "blur(20px)",
          borderTop: `1px solid ${DS.border}`,
          padding: "16px 20px 24px",
        }}>
          {/* Pose selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            {["Front", "Side", "Back", "Free"].map((pose, i) => (
              <button key={pose} style={{
                padding: "6px 14px", borderRadius: 20,
                background: i === 0 ? DS.accent : DS.card,
                border: `1px solid ${i === 0 ? DS.accent : DS.border}`,
                color: i === 0 ? "#fff" : DS.fg2,
                fontSize: 12, fontWeight: i === 0 ? 700 : 500,
                cursor: "pointer",
              }}>{pose}</button>
            ))}
          </div>

          {/* Delta stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Weight", from: "84.2 kg", to: "80.5 kg", delta: "−3.7 kg", good: true },
              { label: "Body Fat", from: "18.4%", to: "16.1%", delta: "−2.3%", good: true },
              { label: "Waist", from: "86 cm", to: "83.2 cm", delta: "−2.8 cm", good: true },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: DS.card, borderRadius: 10, padding: "10px 10px", border: `1px solid ${DS.border}` }}>
                <p style={{ fontSize: 10, color: DS.fg3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: DS.fg, marginBottom: 2 }}>{s.delta}</p>
                <p style={{ fontSize: 10, color: DS.fg2 }}>{s.from} → {s.to}</p>
              </div>
            ))}
          </div>

          {/* Checkpoint selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${DS.border}`, background: DS.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft size={16} color={DS.fg2} strokeWidth={2} />
            </button>
            <div style={{ flex: 1, display: "flex", gap: 6, overflowX: "auto" }}>
              {["Jan 6", "Mar 8", "Mar 22"].map((d, i) => (
                <button key={d} style={{
                  flexShrink: 0, padding: "6px 12px",
                  background: i === 2 ? DS.accentMid : "transparent",
                  border: `1px solid ${i === 2 ? DS.accent : DS.border}`,
                  borderRadius: 8, color: i === 2 ? DS.accent : DS.fg2,
                  fontSize: 11, fontWeight: i === 2 ? 700 : 500, cursor: "pointer",
                }}>{d}</button>
              ))}
            </div>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${DS.border}`, background: DS.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight size={16} color={DS.fg2} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 45 — Progress Photos Upload State
// ═══════════════════════════════════════════════════════════════════════════
function Screen45_UploadState() {
  return (
    <Phone>
      <NavBar title="New Checkpoint" back="Photos" />

      <div style={{ flex: 1, padding: "12px 20px 20px", overflowY: "auto" }}>
        {/* Date badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, background: DS.card, borderRadius: 12, border: `1px solid ${DS.border}`, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: DS.fg }}>March 22, 2026</span>
            <ChevronDown size={14} color={DS.fg3} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.accent, background: DS.accentDim, borderRadius: 10, padding: "5px 10px", flexShrink: 0 }}>Today</span>
        </div>

        {/* Instruction */}
        <p style={{ fontSize: 12, color: DS.fg2, marginBottom: 16, lineHeight: 1.5 }}>Record each pose in consistent lighting for accurate comparisons. Use the same location and camera distance each time.</p>

        {/* Photo slots — 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Front", hint: "Arms to sides", state: "done" },
            { label: "Side",  hint: "Right profile", state: "uploading" },
            { label: "Back",  hint: "Back to camera", state: "empty" },
            { label: "Free",  hint: "Your choice",   state: "empty" },
          ].map(pose => (
            <div key={pose.label}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: DS.fg3, letterSpacing: "0.12em", textTransform: "uppercase" }}>{pose.label}</p>
                {pose.state === "done" && <Check size={12} color={DS.ok} strokeWidth={2.5} />}
                {pose.state === "uploading" && <Loader2 size={12} color={DS.accent} strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }} />}
              </div>
              <div style={{
                aspectRatio: "3/4", borderRadius: 16,
                border: `1.5px ${pose.state === "uploading" ? "solid" : pose.state === "done" ? "solid" : "dashed"} ${
                  pose.state === "uploading" ? DS.accent :
                  pose.state === "done" ? `${DS.ok}60` :
                  DS.border}`,
                background: pose.state === "done"
                  ? "linear-gradient(160deg, #1A3030 0%, #0C1A1A 100%)"
                  : pose.state === "uploading"
                  ? "linear-gradient(160deg, #0D1E1E 0%, #090F0F 100%)"
                  : "#0A1414",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden", cursor: "pointer",
              }}>
                {pose.state === "done" && (
                  <>
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, rgba(74,155,155,0.08) 0%, transparent 70%)" }} />
                    <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: `${DS.ok}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={10} color={DS.ok} strokeWidth={2.5} />
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 8px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>Saved</p>
                    </div>
                    <Trash2 size={14} color="rgba(255,255,255,0.3)" strokeWidth={1.5} style={{ position: "absolute", top: 8, left: 8, opacity: 0.5 }} />
                  </>
                )}
                {pose.state === "uploading" && (
                  <>
                    {/* Upload progress */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ position: "relative", width: 44, height: 44 }}>
                        <svg viewBox="0 0 44 44" style={{ width: 44, height: 44 }}>
                          <circle cx="22" cy="22" r="18" fill="none" stroke={DS.border} strokeWidth="3" />
                          <circle cx="22" cy="22" r="18" fill="none" stroke={DS.accent} strokeWidth="3"
                            strokeDasharray="113" strokeDashoffset="40" strokeLinecap="round"
                            transform="rotate(-90 22 22)" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: DS.accent }}>65%</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: DS.accent }}>Uploading…</p>
                    <p style={{ fontSize: 10, color: DS.fg3, marginTop: 3 }}>3.2 MB</p>
                    {/* Progress bar */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: DS.border }}>
                      <div style={{ height: "100%", width: "65%", background: DS.accent, borderRadius: 1.5 }} />
                    </div>
                  </>
                )}
                {pose.state === "empty" && (
                  <>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px dashed ${DS.fg3}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, opacity: 0.4 }}>
                      <Plus size={16} color={DS.fg3} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: DS.fg3, opacity: 0.5 }}>Tap to add</p>
                    <p style={{ fontSize: 10, color: DS.fg3, opacity: 0.35, marginTop: 4 }}>{pose.hint}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress summary */}
        <div style={{ background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: DS.fg }}>Checkpoint progress</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: DS.accent }}>2 / 4</p>
          </div>
          <div style={{ height: 6, background: DS.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "50%", background: `linear-gradient(90deg, ${DS.accent}, ${DS.ok})`, borderRadius: 3 }} />
          </div>
          <p style={{ fontSize: 11, color: DS.fg2, marginTop: 8 }}>
            <span style={{ color: DS.ok, fontWeight: 600 }}>Front</span> saved · <span style={{ color: DS.accent, fontWeight: 600 }}>Side</span> uploading · Back & Free pending
          </p>
        </div>

        {/* Tips */}
        <div style={{ background: `${DS.accentDim}`, borderRadius: 14, border: `1px solid ${DS.accentMid}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Camera size={15} color={DS.accent} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: DS.accent, marginBottom: 4 }}>Photo tips</p>
              <p style={{ fontSize: 12, color: DS.fg2, lineHeight: 1.55 }}>Shoot in natural light near a window. Keep the same distance and framing each session for accurate visual comparisons.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{ padding: "14px 20px 24px", borderTop: `1px solid ${DS.border}`, background: DS.card2 }}>
        <button style={{
          width: "100%", padding: "15px", borderRadius: 14,
          background: "rgba(74,155,155,0.3)",
          border: `1px solid ${DS.accentMid}`,
          color: DS.accent,
          fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}>
          Save checkpoint (2/4)
        </button>
      </div>
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHOWCASE — All 7 screens side-scrollable
// ═══════════════════════════════════════════════════════════════════════════
export default function BodyScreensShowcase() {
  const screens = [
    { id: 39, label: "39 · Body Hub",            Component: Screen39_BodyHub },
    { id: 40, label: "40 · Progress Tab",         Component: Screen40_ProgressTab },
    { id: 41, label: "41 · Measurements Tab",     Component: Screen41_MeasurementsTab },
    { id: 42, label: "42 · Add Measurement",      Component: Screen42_AddModal },
    { id: 43, label: "43 · Photos Tab",           Component: Screen43_PhotosTab },
    { id: 44, label: "44 · Full-Screen Viewer",   Component: Screen44_FullScreenViewer },
    { id: 45, label: "45 · Upload State",         Component: Screen45_UploadState },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030808",
      padding: "48px 0 80px",
      fontFamily: "-apple-system, 'SF Pro Display', system-ui, sans-serif",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 48, padding: "0 40px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#4A9B9B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>atlas.core · Design System</p>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1.2, marginBottom: 12, margin: 0 }}>
          Body & Progress Tracking
        </h1>
        <p style={{ fontSize: 15, color: "#8A9A9A", marginTop: 10 }}>Screens 39–45 · High-fidelity iOS mobile UI</p>
      </div>

      {/* Screens */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 80 }}>
        {screens.map(({ id, label, Component }) => (
          <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#4A9B9B", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
            </div>
            <Component />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 64, padding: "0 40px" }}>
        <p style={{ fontSize: 12, color: "#333F3F" }}>atlas.core · Body & Progress Tracking · 7 screens</p>
      </div>
    </div>
  );
}
