// screens-p12.jsx — atlas.core app screens, PHASE 12
// Admin Console (10 screens): overview, analytics, users, user detail,
// subscriptions, waitlist, moderation, errors, audit, settings.
// All rendered inside a BrowserFrame with shared AdminShell sidebar.

// ── AdminShell — sidebar + content ───────────────────────────
function AdminShell({ dark, active, children }) {
  const c = useACT(dark);
  const navItems = [
    { k: 'overview',      label: 'Overview',       icon: 'grid' },
    { k: 'analytics',     label: 'Analytics',      icon: 'chart' },
    { k: 'users',         label: 'Users',          icon: 'users' },
    { k: 'subscriptions', label: 'Subscriptions',  icon: 'card' },
    { k: 'waitlist',      label: 'Waitlist',       icon: 'list' },
    { k: 'moderation',    label: 'Moderation',     icon: 'shield' },
    { k: 'errors',        label: 'Errors',         icon: 'alert' },
    { k: 'audit',         label: 'Audit',          icon: 'scroll' },
    { k: 'settings',      label: 'Settings',       icon: 'gear' },
  ];

  const SideIcon = ({ k, color }) => {
    const s = 14;
    if (k === 'grid') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" stroke={color} strokeWidth="1.3"/>
        <rect x="8" y="1" width="5" height="5" rx="1" stroke={color} strokeWidth="1.3"/>
        <rect x="1" y="8" width="5" height="5" rx="1" stroke={color} strokeWidth="1.3"/>
        <rect x="8" y="8" width="5" height="5" rx="1" stroke={color} strokeWidth="1.3"/>
      </svg>
    );
    if (k === 'chart') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <rect x="1" y="8" width="3" height="5" fill={color}/>
        <rect x="5.5" y="4" width="3" height="9" fill={color}/>
        <rect x="10" y="1" width="3" height="12" fill={color}/>
      </svg>
    );
    if (k === 'users') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="4.5" r="2.5" stroke={color} strokeWidth="1.3"/>
        <path d="M2 13a5 5 0 0110 0" stroke={color} strokeWidth="1.3" fill="none"/>
      </svg>
    );
    if (k === 'card') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <rect x="1" y="3" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.3"/>
        <line x1="1" y1="6" x2="13" y2="6" stroke={color} strokeWidth="1.3"/>
      </svg>
    );
    if (k === 'list') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <line x1="4" y1="3" x2="12" y2="3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="4" y1="7" x2="12" y2="7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="4" y1="11" x2="12" y2="11" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="2" cy="3" r="0.8" fill={color}/>
        <circle cx="2" cy="7" r="0.8" fill={color}/>
        <circle cx="2" cy="11" r="0.8" fill={color}/>
      </svg>
    );
    if (k === 'shield') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <path d="M7 1L2 3.5V7c0 3.5 5 5.5 5 5.5s5-2 5-5.5V3.5L7 1z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    );
    if (k === 'alert') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <path d="M6.13 1.5a1 1 0 011.74 0l5 8.5A1 1 0 0112 12H2a1 1 0 01-.87-1.5l5-8.5z" stroke={color} strokeWidth="1.2" fill="none"/>
        <line x1="7" y1="5.5" x2="7" y2="8" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="7" cy="9.8" r="0.6" fill={color}/>
      </svg>
    );
    if (k === 'scroll') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <rect x="3" y="1" width="8" height="12" rx="1" stroke={color} strokeWidth="1.3"/>
        <line x1="5" y1="4" x2="9" y2="4" stroke={color} strokeWidth="1" strokeLinecap="round"/>
        <line x1="5" y1="6.5" x2="9" y2="6.5" stroke={color} strokeWidth="1" strokeLinecap="round"/>
        <line x1="5" y1="9" x2="7.5" y2="9" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      </svg>
    );
    if (k === 'gear') return (
      <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1.3"/>
        <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M11.2 2.8l-1 1M3.8 10.2l-1 1" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
    return null;
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: c.bg, color: c.fg, fontFamily: ACFonts.body,
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width: 200, minWidth: 200, height: '100%', display: 'flex', flexDirection: 'column',
        background: dark ? '#13110d' : '#ece6d3',
        borderRight: `1px solid ${c.hair}`,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartMark size={18} color={c.fg} accent={c.accent} />
          <div style={{
            fontFamily: ACFonts.brand, fontSize: 14, letterSpacing: -0.5,
            color: c.fg, textTransform: 'lowercase',
            display: 'inline-flex', alignItems: 'baseline',
          }}>
            <span>atlas</span>
            <span style={{ width: 3, height: 3, background: c.accent, margin: '0 2px 1px' }} />
            <span>core</span>
          </div>
          <ACMono size={9} color={c.mute} style={{ marginLeft: 2 }}>admin</ACMono>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const on = item.k === active;
            return (
              <div key={item.k} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: on ? (dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)') : 'transparent',
              }}>
                <SideIcon k={item.icon} color={on ? c.accent : c.dim} />
                <span style={{
                  fontSize: 12.5, fontWeight: on ? 700 : 500,
                  color: on ? c.fg : c.dim, letterSpacing: -0.2,
                }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${c.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 999, background: c.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: ACFonts.body, fontSize: 10, fontWeight: 800, color: c.ink,
            }}>ES</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.fg }}>E. Soler</div>
              <ACMono size={9} color={c.mute}>super-admin</ACMono>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}


// ── Shared admin helpers ─────────────────────────────────────
function AdminKPI({ label, value, sub, dark, accent }) {
  const c = useACT(dark);
  return (
    <div style={{
      flex: 1, padding: '16px 18px', background: c.card, borderRadius: ACRadii.card,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{label}</ACLabel>
      <div style={{
        fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
        letterSpacing: -1.2, color: accent ? c.accent : c.fg, lineHeight: 1,
      }}>{value}</div>
      {sub && <ACMono size={10} color={c.dim}>{sub}</ACMono>}
    </div>
  );
}

function AdminMiniSpark({ title, data, w, h, dark, color }) {
  const c = useACT(dark);
  const col = color || c.accent;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / span) * (h - 8) - 4}`).join(' L ');
  return (
    <div>
      <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 8 }}>{title}</ACLabel>
      <svg width={w} height={h} style={{ display: 'block' }}>
        <path d={`M ${pts}`} fill="none" stroke={col} strokeWidth={1.8} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AdminTable({ cols, rows, dark }) {
  const c = useACT(dark);
  return (
    <div style={{ width: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ACFonts.body, fontSize: 12 }}>
        <thead>
          <tr>
            {cols.map((col, i) => (
              <th key={i} style={{
                padding: '8px 12px', textAlign: 'left', fontWeight: 600,
                fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                color: c.mute, borderBottom: `1px solid ${c.hair}`,
                fontFamily: ACFonts.mono, whiteSpace: 'nowrap',
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${c.hair}` }}>
              {cols.map((col, ci) => (
                <td key={ci} style={{
                  padding: '10px 12px', color: c.fg,
                  fontFamily: col.mono ? ACFonts.mono : ACFonts.body,
                  fontSize: col.mono ? 11 : 12,
                  fontWeight: col.bold ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// S80 — ADMIN OVERVIEW
// ══════════════════════════════════════════════════════════════
function AdminOverviewBody({ dark }) {
  const c = useACT(dark);
  const signupData = [42, 51, 38, 67, 59, 72, 65, 84, 78, 91, 88, 96, 103, 98];
  const revenueData = [12400, 13100, 12800, 14200, 15600, 15100, 16400, 17200, 18100, 17800, 19400, 20100, 21300, 22700];

  const alerts = [
    { level: 'warn', msg: 'Churn spike: 4.2% daily (threshold 3%)', time: '14 min ago' },
    { level: 'info', msg: 'RevenueCat webhook sync completed', time: '28 min ago' },
    { level: 'error', msg: 'Coach inference timeout — 3 requests failed', time: '1 hr ago' },
    { level: 'info', msg: 'Deployment v2.14.3 rolled out to 100%', time: '2 hr ago' },
  ];

  const health = [
    { label: 'API latency (p95)', value: '142ms', ok: true },
    { label: 'Error rate', value: '0.34%', ok: true },
    { label: 'Uptime (30d)', value: '99.94%', ok: true },
    { label: 'Queue depth', value: '12', ok: true },
  ];

  const levelColor = { error: '#e8391f', warn: '#d4a017', info: c.dim };

  return (
    <AdminShell dark={dark} active="overview">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Overview</div>
            <ACMono size={10} color={c.mute}>Last refreshed: 2 min ago</ACMono>
          </div>
          <ACChip dark={dark} dot>System nominal</ACChip>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <AdminKPI dark={dark} label="DAU" value="4,218" sub="+8.3% vs last week" />
          <AdminKPI dark={dark} label="MAU" value="31,402" sub="+12.1% MoM" />
          <AdminKPI dark={dark} label="Revenue (MTD)" value="$89.4K" sub="$22.7K ARR run rate" accent />
          <AdminKPI dark={dark} label="Churn (30d)" value="2.1%" sub="down from 2.8%" />
        </div>

        {/* Charts row */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <AdminMiniSpark title="Signups (14d)" data={signupData} w={340} h={80} dark={dark} />
          </div>
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <AdminMiniSpark title="Revenue trend (14d)" data={revenueData} w={340} h={80} dark={dark} color={c.fg} />
          </div>
        </div>

        {/* Alerts + health */}
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Alerts */}
          <div style={{ flex: 1.4, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 12 }}>Recent alerts</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: dark ? 'rgba(239,233,218,0.03)' : 'rgba(10,10,10,0.02)', borderRadius: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 999, background: levelColor[a.level], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: c.fg, fontWeight: 500 }}>{a.msg}</span>
                  <ACMono size={9} color={c.mute}>{a.time}</ACMono>
                </div>
              ))}
            </div>
          </div>
          {/* Health */}
          <div style={{ flex: 0.6, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 12 }}>System health</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {health.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ACLabel size={11} color={c.dim}>{h.label}</ACLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ACMono size={12} color={c.fg} style={{ fontWeight: 600 }}>{h.value}</ACMono>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: h.ok ? '#28c93f' : '#e8391f' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function S80_Admin_Overview({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/overview" width={1024} height={720} dark={dark}>
      <AdminOverviewBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S81 — ADMIN ANALYTICS
// ══════════════════════════════════════════════════════════════
function AdminAnalyticsBody({ dark }) {
  const c = useACT(dark);
  const [period, setPeriod] = React.useState('30d');
  const periods = ['7d', '30d', '90d'];

  // DAU/MAU 30 day
  const dauData = [3810, 3920, 4010, 3780, 4120, 4260, 4180, 4340, 3960, 4050, 4190, 4280, 4370, 4100, 4210, 4350, 4420, 4510, 4280, 4160, 4320, 4440, 4380, 4510, 4620, 4480, 4310, 4560, 4680, 4218];
  const mauData = [28400, 28600, 28900, 29100, 29400, 29600, 29800, 30100, 30200, 30400, 30500, 30700, 30800, 30900, 31000, 31100, 31200, 31300, 31400, 31500, 31600, 31700, 31800, 31900, 32000, 32100, 32200, 32300, 32400, 31402];

  // Retention cohort
  const cohorts = [
    { week: 'Mar 3',  d: [100, 72, 58, 46, 41] },
    { week: 'Mar 10', d: [100, 68, 55, 44, 38] },
    { week: 'Mar 17', d: [100, 74, 61, 48, null] },
    { week: 'Mar 24', d: [100, 70, 57, null, null] },
    { week: 'Mar 31', d: [100, 71, null, null, null] },
    { week: 'Apr 7',  d: [100, 69, null, null, null] },
  ];

  // Funnel
  const funnel = [
    { label: 'Signup', pct: 100, n: '8,412' },
    { label: 'Onboarding complete', pct: 74, n: '6,225' },
    { label: 'Active (7d)', pct: 52, n: '4,374' },
    { label: 'Paid conversion', pct: 18, n: '1,514' },
  ];

  // Top features
  const features = [
    { name: 'Workout log', sessions: '12,841', pct: 82 },
    { name: 'Meal tracker', sessions: '10,209', pct: 65 },
    { name: 'Coach chat', sessions: '7,840', pct: 50 },
    { name: 'Body metrics', sessions: '6,410', pct: 41 },
    { name: 'Lab results', sessions: '3,120', pct: 20 },
  ];

  // Mini area chart
  const ChartArea = ({ data, w, h, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;
    const step = w / (data.length - 1);
    const pts = data.map((v, i) => [i * step, h - ((v - min) / span) * (h - 12) - 6]);
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
    const area = `${line} L${w},${h} L0,${h} Z`;
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        <path d={area} fill={color} opacity={0.12} />
        <path d={line} fill="none" stroke={color} strokeWidth={1.8} />
      </svg>
    );
  };

  const cohortColor = (v) => {
    if (v === null) return 'transparent';
    if (v >= 70) return c.accent;
    if (v >= 50) return dark ? 'rgba(239,233,218,0.18)' : 'rgba(10,10,10,0.10)';
    if (v >= 40) return dark ? 'rgba(239,233,218,0.10)' : 'rgba(10,10,10,0.05)';
    return dark ? 'rgba(239,233,218,0.05)' : 'rgba(10,10,10,0.02)';
  };

  return (
    <AdminShell dark={dark} active="analytics">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Analytics</div>
          <div style={{ display: 'flex', gap: 4, background: c.card, borderRadius: 8, padding: 3 }}>
            {periods.map(p => (
              <div key={p} onClick={() => setPeriod(p)} style={{
                padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                background: period === p ? c.fg : 'transparent',
                color: period === p ? c.bg : c.dim,
                fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* DAU/MAU charts */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>DAU (30 days)</ACLabel>
              <span style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>4,218</span>
            </div>
            <ChartArea data={dauData} w={330} h={70} color={c.accent} />
          </div>
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>MAU (30 days)</ACLabel>
              <span style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>31,402</span>
            </div>
            <ChartArea data={mauData} w={330} h={70} color={c.fg} />
          </div>
        </div>

        {/* Retention cohort */}
        <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 12 }}>Retention cohort (weekly)</ACLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, fontWeight: 600, letterSpacing: 0.4 }}>COHORT</th>
                {['Wk 0', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'].map(w => (
                  <th key={w} style={{ padding: '6px 10px', textAlign: 'center', fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, fontWeight: 600, letterSpacing: 0.4 }}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ padding: '5px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{row.week}</td>
                  {row.d.map((v, ci) => (
                    <td key={ci} style={{
                      padding: '5px 10px', textAlign: 'center',
                      fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600,
                      color: v === null ? 'transparent' : (v >= 70 ? c.ink : c.fg),
                      background: cohortColor(v),
                    }}>{v !== null ? `${v}%` : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Funnel + top features */}
        <div style={{ display: 'flex', gap: 14 }}>
          {/* Funnel */}
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Conversion funnel</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {funnel.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: c.fg }}>{f.label}</span>
                    <ACMono size={10} color={c.dim}>{f.n}</ACMono>
                  </div>
                  <div style={{ height: 6, background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)', borderRadius: 3 }}>
                    <div style={{ height: 6, width: `${f.pct}%`, background: i === 0 ? c.fg : (i === funnel.length - 1 ? c.accent : c.dim), borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Top features */}
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Top features by usage</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {features.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: c.fg }}>{f.name}</span>
                    <ACMono size={10} color={c.dim}>{f.sessions} sessions</ACMono>
                  </div>
                  <div style={{ height: 4, background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)', borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${f.pct}%`, background: i === 0 ? c.accent : c.fg, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function S81_Admin_Analytics({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/analytics" width={1024} height={720} dark={dark}>
      <AdminAnalyticsBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S82 — ADMIN USERS LIST
// ══════════════════════════════════════════════════════════════
function AdminUsersBody({ dark }) {
  const c = useACT(dark);
  const [filter, setFilter] = React.useState('all');
  const filters = ['all', 'free', 'pro', 'churned'];

  const users = [
    { name: 'Maria Gonzalez', email: 'maria@gmail.com', plan: 'Pro', joined: 'Jan 12, 2026', lastActive: '2 hr ago', revenue: '$149.88' },
    { name: 'Jake Thompson', email: 'jake.t@outlook.com', plan: 'Pro', joined: 'Nov 3, 2025', lastActive: '18 min ago', revenue: '$299.88' },
    { name: 'Aisha Patel', email: 'aisha.p@icloud.com', plan: 'Free', joined: 'Mar 28, 2026', lastActive: '1 day ago', revenue: '$0.00' },
    { name: 'Liam Chen', email: 'lchen@proton.me', plan: 'Pro', joined: 'Feb 14, 2026', lastActive: '5 hr ago', revenue: '$74.94' },
    { name: 'Sofia Reyes', email: 's.reyes@yahoo.com', plan: 'Churned', joined: 'Oct 19, 2025', lastActive: '14 days ago', revenue: '$224.91' },
    { name: 'Noah Williams', email: 'noah.w@gmail.com', plan: 'Free', joined: 'Apr 2, 2026', lastActive: '3 hr ago', revenue: '$0.00' },
    { name: 'Emma Fischer', email: 'efischer@web.de', plan: 'Pro', joined: 'Dec 1, 2025', lastActive: '44 min ago', revenue: '$199.92' },
    { name: 'Ravi Kumar', email: 'ravi.k@gmail.com', plan: 'Free', joined: 'Apr 10, 2026', lastActive: '6 hr ago', revenue: '$0.00' },
  ];

  const planChip = (plan) => {
    const colors = {
      Pro: { bg: c.accent, fg: c.ink },
      Free: { bg: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)', fg: c.dim },
      Churned: { bg: 'rgba(232,57,31,0.12)', fg: '#e8391f' },
    };
    const s = colors[plan] || colors.Free;
    return (
      <span style={{
        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
        fontFamily: ACFonts.mono, letterSpacing: 0.3,
        background: s.bg, color: s.fg,
      }}>{plan}</span>
    );
  };

  return (
    <AdminShell dark={dark} active="users">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Users</div>
            <ACMono size={10} color={c.mute}>31,402 total accounts</ACMono>
          </div>
          <ACBtn dark={dark} size="sm" style={{ fontSize: 12 }}>Export CSV</ACBtn>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', background: c.card, borderRadius: 10,
            border: `1px solid ${c.hair}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke={c.dim} strokeWidth="1.3"/>
              <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke={c.dim} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 12, color: c.mute, fontFamily: ACFonts.body }}>Search by name, email, or ID...</span>
          </div>
          <div style={{ display: 'flex', gap: 4, background: c.card, borderRadius: 8, padding: 3 }}>
            {filters.map(f => (
              <div key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                background: filter === f ? c.fg : 'transparent',
                color: filter === f ? c.bg : c.dim,
                fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600,
                letterSpacing: 0.3, textTransform: 'uppercase',
              }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px',
          background: dark ? 'rgba(239,233,218,0.04)' : 'rgba(10,10,10,0.02)',
          borderRadius: 8,
        }}>
          <div style={{
            width: 14, height: 14, border: `1.5px solid ${c.faint}`, borderRadius: 3,
          }} />
          <ACLabel size={11} color={c.mute}>0 selected</ACLabel>
          <div style={{ flex: 1 }} />
          <ACMono size={10} color={c.faint}>Bulk: email / tag / export / suspend</ACMono>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'Name', 'Email', 'Plan', 'Joined', 'Last active', 'Revenue'].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 10px', textAlign: 'left', fontWeight: 600,
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                    color: c.mute, borderBottom: `1px solid ${c.hair}`,
                    fontFamily: ACFonts.mono, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${c.hair}` }}>
                  <td style={{ padding: '10px 10px', width: 30 }}>
                    <div style={{ width: 14, height: 14, border: `1.5px solid ${c.faint}`, borderRadius: 3 }} />
                  </td>
                  <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: c.fg }}>{u.name}</td>
                  <td style={{ padding: '10px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{u.email}</td>
                  <td style={{ padding: '10px 10px' }}>{planChip(u.plan)}</td>
                  <td style={{ padding: '10px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{u.joined}</td>
                  <td style={{ padding: '10px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{u.lastActive}</td>
                  <td style={{ padding: '10px 10px', fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 600, color: c.fg }}>{u.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <ACMono size={10} color={c.mute}>Showing 1-8 of 31,402</ACMono>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, '...', 3926].map((p, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: p === 1 ? c.fg : 'transparent',
                color: p === 1 ? c.bg : c.dim,
                fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600,
                cursor: typeof p === 'number' ? 'pointer' : 'default',
              }}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function S82_Admin_Users({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/users" width={1024} height={720} dark={dark}>
      <AdminUsersBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S83 — ADMIN USER DETAIL
// ══════════════════════════════════════════════════════════════
function AdminUserDetailBody({ dark }) {
  const c = useACT(dark);

  const user = {
    name: 'Jake Thompson', email: 'jake.t@outlook.com', plan: 'Pro',
    joined: 'Nov 3, 2025', id: 'usr_8f2a3c9d', location: 'Austin, TX',
  };

  const engagement = [
    { label: 'Sessions (30d)', value: '47' },
    { label: 'Current streak', value: '12 days' },
    { label: 'Workout logs', value: '214' },
    { label: 'Meal logs', value: '1,082' },
    { label: 'Coach msgs', value: '38' },
    { label: 'Avg session', value: '8.2 min' },
  ];

  const subHistory = [
    { date: 'Nov 3, 2025', event: 'Trial started', plan: 'Pro trial (14d)' },
    { date: 'Nov 17, 2025', event: 'Converted to paid', plan: 'Pro monthly — $24.99/mo' },
    { date: 'Feb 17, 2026', event: 'Upgraded', plan: 'Pro annual — $149.88/yr' },
  ];

  const activity = [
    { time: '10:42 AM', action: 'Logged workout: Upper body (52 min)', type: 'workout' },
    { time: '8:15 AM', action: 'Logged breakfast: 620 kcal, 42g protein', type: 'nutrition' },
    { time: '7:30 AM', action: 'Viewed coach message', type: 'coach' },
    { time: 'Yesterday', action: 'Completed body scan', type: 'body' },
    { time: 'Yesterday', action: 'Logged workout: Legs (48 min)', type: 'workout' },
    { time: '2 days ago', action: 'Updated goal: target weight 82kg', type: 'settings' },
  ];

  const typeColor = {
    workout: c.accent,
    nutrition: '#d4a017',
    coach: '#7c6de0',
    body: '#e8391f',
    settings: c.dim,
  };

  return (
    <AdminShell dark={dark} active="users">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ACMono size={10} color={c.dim} style={{ cursor: 'pointer' }}>Users</ACMono>
          <ACMono size={10} color={c.mute}>/</ACMono>
          <ACMono size={10} color={c.fg} style={{ fontWeight: 600 }}>{user.name}</ACMono>
        </div>

        {/* User card + engagement */}
        <div style={{ display: 'flex', gap: 14 }}>
          {/* Profile card */}
          <div style={{ flex: 1, padding: 20, background: c.card, borderRadius: ACRadii.card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 999, background: c.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, color: c.ink,
            }}>JT</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: c.fg }}>{user.name}</div>
              <ACMono size={11} color={c.dim} style={{ display: 'block', marginTop: 2 }}>{user.email}</ACMono>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <ACChip dark={dark} accent>Pro</ACChip>
                <ACChip dark={dark}>{user.location}</ACChip>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div>
                  <ACLabel size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600, display: 'block' }}>Joined</ACLabel>
                  <ACMono size={11} color={c.fg} style={{ fontWeight: 500 }}>{user.joined}</ACMono>
                </div>
                <div>
                  <ACLabel size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600, display: 'block' }}>ID</ACLabel>
                  <ACMono size={11} color={c.fg} style={{ fontWeight: 500 }}>{user.id}</ACMono>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {engagement.map((e, i) => (
              <div key={i} style={{ padding: '12px 14px', background: c.card, borderRadius: 12 }}>
                <ACLabel size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600, display: 'block' }}>{e.label}</ACLabel>
                <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.6, color: c.fg, marginTop: 4 }}>{e.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub history + activity */}
        <div style={{ display: 'flex', gap: 14 }}>
          {/* Subscription history */}
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Subscription history</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {subHistory.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '10px 0',
                  borderBottom: i < subHistory.length - 1 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{ width: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: i === subHistory.length - 1 ? c.accent : c.faint }} />
                    {i < subHistory.length - 1 && <div style={{ width: 1, flex: 1, background: c.hair, marginTop: 4 }} />}
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.fg }}>{s.event}</span>
                    <ACMono size={10} color={c.dim} style={{ display: 'block', marginTop: 2 }}>{s.plan}</ACMono>
                    <ACMono size={9} color={c.mute} style={{ marginTop: 2, display: 'block' }}>{s.date}</ACMono>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Recent activity</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                  borderBottom: i < activity.length - 1 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: 999, background: typeColor[a.type], marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, color: c.fg }}>{a.action}</span>
                  </div>
                  <ACMono size={9} color={c.mute}>{a.time}</ACMono>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impersonation bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', background: 'rgba(232,57,31,0.08)',
          border: '1px solid rgba(232,57,31,0.2)', borderRadius: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L1 14h14L8 1.5z" stroke="#e8391f" strokeWidth="1.4" fill="none"/>
            <line x1="8" y1="6" x2="8" y2="9.5" stroke="#e8391f" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.7" fill="#e8391f"/>
          </svg>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#e8391f' }}>Impersonate user</span>
            <ACMono size={10} color={c.dim} style={{ display: 'block', marginTop: 1 }}>
              This action is logged. You will see the app as this user.
            </ACMono>
          </div>
          <div style={{
            padding: '6px 14px', background: '#e8391f', color: '#fff',
            fontFamily: ACFonts.body, fontSize: 11, fontWeight: 700, borderRadius: 8,
            letterSpacing: -0.1,
          }}>Begin session</div>
        </div>
      </div>
    </AdminShell>
  );
}

function S83_Admin_User_Detail({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/users/usr_8f2a3c9d" width={1024} height={720} dark={dark}>
      <AdminUserDetailBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S84 — ADMIN SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════════
function AdminSubscriptionsBody({ dark }) {
  const c = useACT(dark);

  const planBreakdown = [
    { label: 'Free', pct: 52, count: '16,329', color: c.dim },
    { label: 'Pro monthly', pct: 28, count: '8,793', color: c.accent },
    { label: 'Pro annual', pct: 16, count: '5,024', color: c.fg },
    { label: 'Churned', pct: 4, count: '1,256', color: '#e8391f' },
  ];

  const events = [
    { user: 'Maria Gonzalez', action: 'Upgraded', from: 'Pro monthly', to: 'Pro annual', time: '22 min ago' },
    { user: 'David Park', action: 'Cancelled', from: 'Pro monthly', to: 'Free', time: '1 hr ago' },
    { user: 'Lisa Nguyen', action: 'Converted', from: 'Trial', to: 'Pro monthly', time: '2 hr ago' },
    { user: 'Tom Eriksen', action: 'Downgraded', from: 'Pro annual', to: 'Pro monthly', time: '3 hr ago' },
    { user: 'Ana Costa', action: 'Converted', from: 'Trial', to: 'Pro annual', time: '4 hr ago' },
    { user: 'Chen Wei', action: 'Cancelled', from: 'Pro monthly', to: 'Free', time: '5 hr ago' },
  ];

  const revenueData = [64200, 66800, 68400, 71200, 73100, 75800, 78200, 80100, 82400, 84900, 86200, 89400];

  const actionColor = {
    Upgraded: '#28c93f',
    Converted: c.accent,
    Downgraded: '#d4a017',
    Cancelled: '#e8391f',
  };

  // Simple pie chart
  const PieChart = ({ data, size }) => {
    let cumulative = 0;
    const slices = data.map(d => {
      const start = cumulative;
      cumulative += d.pct;
      return { ...d, start, end: cumulative };
    });
    const r = size / 2 - 4;
    const cx = size / 2;
    return (
      <svg width={size} height={size}>
        {slices.map((s, i) => {
          const startAngle = (s.start / 100) * Math.PI * 2 - Math.PI / 2;
          const endAngle = (s.end / 100) * Math.PI * 2 - Math.PI / 2;
          const largeArc = s.pct > 50 ? 1 : 0;
          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cx + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cx + r * Math.sin(endAngle);
          return (
            <path key={i}
              d={`M${cx},${cx} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`}
              fill={s.color} />
          );
        })}
        <circle cx={cx} cy={cx} r={r * 0.55} fill={c.card} />
      </svg>
    );
  };

  return (
    <AdminShell dark={dark} active="subscriptions">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Subscriptions</div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <AdminKPI dark={dark} label="MRR" value="$89.4K" sub="+6.2% MoM" accent />
          <AdminKPI dark={dark} label="ARR" value="$1.07M" sub="projected from current MRR" />
          <AdminKPI dark={dark} label="Conversion rate" value="18.0%" sub="trial to paid (30d)" />
          <AdminKPI dark={dark} label="Churn rate" value="2.1%" sub="monthly, down from 2.8%" />
        </div>

        {/* Plan breakdown + revenue trend */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Plan breakdown</ACLabel>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <PieChart data={planBreakdown} size={120} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {planBreakdown.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: c.fg, fontWeight: 500, minWidth: 80 }}>{p.label}</span>
                    <ACMono size={10} color={c.dim}>{p.count}</ACMono>
                    <ACMono size={10} color={c.mute}>{p.pct}%</ACMono>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Revenue trend (12 mo)</ACLabel>
            <AdminMiniSpark title="" data={revenueData} w={340} h={90} dark={dark} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <ACMono size={9} color={c.mute}>May 2025</ACMono>
              <ACMono size={9} color={c.mute}>Apr 2026</ACMono>
            </div>
          </div>
        </div>

        {/* Recent events */}
        <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 12 }}>Recent subscription events</ACLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Action', 'From', 'To', 'Time'].map(h => (
                  <th key={h} style={{
                    padding: '6px 10px', textAlign: 'left',
                    fontFamily: ACFonts.mono, fontSize: 9, fontWeight: 600,
                    letterSpacing: 0.4, color: c.mute, textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.hair}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${c.hair}` }}>
                  <td style={{ padding: '9px 10px', fontSize: 12, fontWeight: 600, color: c.fg }}>{e.user}</td>
                  <td style={{ padding: '9px 10px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                      fontFamily: ACFonts.mono, letterSpacing: 0.3,
                      color: actionColor[e.action],
                      background: `${actionColor[e.action]}18`,
                    }}>{e.action}</span>
                  </td>
                  <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{e.from}</td>
                  <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{e.to}</td>
                  <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.mute }}>{e.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function S84_Admin_Subscriptions({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/subscriptions" width={1024} height={720} dark={dark}>
      <AdminSubscriptionsBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S85 — ADMIN WAITLIST
// ══════════════════════════════════════════════════════════════
function AdminWaitlistBody({ dark }) {
  const c = useACT(dark);

  const entries = [
    { email: 'alex.rivera@gmail.com', date: 'Apr 14, 2026', status: 'Pending', source: 'Landing page' },
    { email: 'kira.nakamura@icloud.com', date: 'Apr 13, 2026', status: 'Pending', source: 'Referral' },
    { email: 'ben.oconnor@hey.com', date: 'Apr 12, 2026', status: 'Invited', source: 'Twitter' },
    { email: 'priya.sharma@outlook.com', date: 'Apr 11, 2026', status: 'Pending', source: 'Landing page' },
    { email: 'lucas.martins@proton.me', date: 'Apr 10, 2026', status: 'Converted', source: 'Product Hunt' },
    { email: 'emma.johansson@gmail.com', date: 'Apr 9, 2026', status: 'Invited', source: 'Referral' },
    { email: 'omar.hassan@yahoo.com', date: 'Apr 8, 2026', status: 'Pending', source: 'Landing page' },
    { email: 'chloe.dubois@gmail.com', date: 'Apr 7, 2026', status: 'Converted', source: 'Instagram' },
    { email: 'ryan.murphy@outlook.com', date: 'Apr 6, 2026', status: 'Pending', source: 'Landing page' },
    { email: 'mei.zhang@qq.com', date: 'Apr 5, 2026', status: 'Invited', source: 'Referral' },
  ];

  const statusStyle = (s) => {
    if (s === 'Pending') return { bg: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)', fg: c.dim };
    if (s === 'Invited') return { bg: `${c.accent}20`, fg: c.accent };
    if (s === 'Converted') return { bg: 'rgba(40,201,63,0.15)', fg: '#28c93f' };
    return { bg: 'transparent', fg: c.dim };
  };

  return (
    <AdminShell dark={dark} active="waitlist">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Waitlist</div>
            <ACMono size={10} color={c.mute}>Manage pre-launch access queue</ACMono>
          </div>
          <div style={{
            padding: '8px 16px', background: c.accent, color: c.ink,
            fontFamily: ACFonts.body, fontSize: 12, fontWeight: 700,
            borderRadius: 8, letterSpacing: -0.1, cursor: 'pointer',
          }}>Invite next 50</div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <AdminKPI dark={dark} label="Total waitlist" value="2,847" sub="412 added this week" />
          <AdminKPI dark={dark} label="Invited" value="1,204" sub="42.3% of total" />
          <AdminKPI dark={dark} label="Converted" value="891" sub="74.0% invite-to-signup" accent />
          <AdminKPI dark={dark} label="Avg wait time" value="6.2d" sub="down from 11.4d" />
        </div>

        {/* Bulk bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px',
          background: dark ? 'rgba(239,233,218,0.04)' : 'rgba(10,10,10,0.02)',
          borderRadius: 8,
        }}>
          <div style={{ width: 14, height: 14, border: `1.5px solid ${c.faint}`, borderRadius: 3 }} />
          <ACLabel size={11} color={c.mute}>0 selected</ACLabel>
          <div style={{ flex: 1 }} />
          <ACMono size={10} color={c.faint}>Bulk: invite / remove / export</ACMono>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'Email', 'Signup date', 'Status', 'Source'].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 10px', textAlign: 'left', fontWeight: 600,
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                    color: c.mute, borderBottom: `1px solid ${c.hair}`,
                    fontFamily: ACFonts.mono, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const ss = statusStyle(e.status);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${c.hair}` }}>
                    <td style={{ padding: '9px 10px', width: 30 }}>
                      <div style={{ width: 14, height: 14, border: `1.5px solid ${c.faint}`, borderRadius: 3 }} />
                    </td>
                    <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.fg }}>{e.email}</td>
                    <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{e.date}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                        fontFamily: ACFonts.mono, letterSpacing: 0.3,
                        background: ss.bg, color: ss.fg,
                      }}>{e.status}</span>
                    </td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: c.dim }}>{e.source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ACMono size={10} color={c.mute}>Showing 1-10 of 2,847</ACMono>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, '...', 285].map((p, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: p === 1 ? c.fg : 'transparent',
                color: p === 1 ? c.bg : c.dim,
                fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600,
              }}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function S85_Admin_Waitlist({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/waitlist" width={1024} height={720} dark={dark}>
      <AdminWaitlistBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S86 — ADMIN MODERATION
// ══════════════════════════════════════════════════════════════
function AdminModerationBody({ dark }) {
  const c = useACT(dark);

  const flagged = [
    {
      id: 'flg_01a', type: 'Display name', user: 'user_xk92', content: 'F**kFitness420',
      reason: 'Profanity filter triggered', reporter: 'Automated', time: '18 min ago',
    },
    {
      id: 'flg_02b', type: 'Profile photo', user: 'user_m3r7', content: '[image]',
      reason: 'Nudity detection — 0.87 confidence', reporter: 'Automated', time: '42 min ago',
    },
    {
      id: 'flg_03c', type: 'Coach message', user: 'user_9fa4', content: 'I want to lose 30 lbs in 2 weeks, give me something strong...',
      reason: 'Harmful intent — possible substance request', reporter: 'AI flagged', time: '1 hr ago',
    },
    {
      id: 'flg_04d', type: 'Display name', user: 'user_bb21', content: 'Admin_Official',
      reason: 'Impersonation — reserved keyword', reporter: 'Automated', time: '2 hr ago',
    },
    {
      id: 'flg_05e', type: 'Profile bio', user: 'user_ck88', content: 'Check out my supplement store at shadylinks.biz — DM for codes!',
      reason: 'Spam / external promotion', reporter: 'User report (x3)', time: '3 hr ago',
    },
  ];

  const typeColors = {
    'Display name': c.fg,
    'Profile photo': '#7c6de0',
    'Coach message': '#d4a017',
    'Profile bio': c.dim,
  };

  return (
    <AdminShell dark={dark} active="moderation">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Moderation</div>
            <ACMono size={10} color={c.mute}>Flagged content queue</ACMono>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 8, height: 8, borderRadius: 999,
              background: '#e8391f', animation: 'none',
            }} />
            <ACMono size={11} color={c.fg} style={{ fontWeight: 600 }}>5 items pending</ACMono>
          </div>
        </div>

        {/* Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {flagged.map((f, i) => (
            <div key={i} style={{
              padding: '16px 18px', background: c.card, borderRadius: ACRadii.card,
              border: `1px solid ${c.hair}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                      fontFamily: ACFonts.mono, letterSpacing: 0.3,
                      background: `${typeColors[f.type]}18`, color: typeColors[f.type],
                    }}>{f.type}</span>
                    <ACMono size={9} color={c.mute}>{f.id}</ACMono>
                    <div style={{ flex: 1 }} />
                    <ACMono size={9} color={c.mute}>{f.time}</ACMono>
                  </div>

                  {/* Content preview */}
                  <div style={{
                    padding: '10px 14px', background: dark ? 'rgba(239,233,218,0.03)' : 'rgba(10,10,10,0.02)',
                    borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${typeColors[f.type]}`,
                  }}>
                    <span style={{
                      fontFamily: f.type === 'Profile photo' ? ACFonts.mono : ACFonts.body,
                      fontSize: 12, color: c.fg, fontStyle: f.type === 'Profile photo' ? 'italic' : 'normal',
                    }}>{f.content}</span>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <ACLabel size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>Reason</ACLabel>
                      <span style={{ display: 'block', fontSize: 11, color: c.dim, marginTop: 1 }}>{f.reason}</span>
                    </div>
                    <div>
                      <ACLabel size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>Reporter</ACLabel>
                      <span style={{ display: 'block', fontSize: 11, color: c.dim, marginTop: 1 }}>{f.reporter}</span>
                    </div>
                    <div>
                      <ACLabel size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>User</ACLabel>
                      <ACMono size={11} color={c.dim} style={{ display: 'block', marginTop: 1 }}>{f.user}</ACMono>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  {[
                    { label: 'Approve', bg: 'rgba(40,201,63,0.12)', fg: '#28c93f' },
                    { label: 'Remove', bg: 'rgba(232,57,31,0.12)', fg: '#e8391f' },
                    { label: 'Warn', bg: `${c.accent}18`, fg: c.accent },
                    { label: 'Ban', bg: 'rgba(232,57,31,0.25)', fg: '#e8391f' },
                  ].map((a, ai) => (
                    <div key={ai} style={{
                      padding: '5px 12px', borderRadius: 6, textAlign: 'center',
                      background: a.bg, color: a.fg,
                      fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
                      letterSpacing: 0.2, cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>{a.label}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function S86_Admin_Moderation({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/moderation" width={1024} height={720} dark={dark}>
      <AdminModerationBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S87 — ADMIN ERRORS + LOGS
// ══════════════════════════════════════════════════════════════
function AdminErrorsBody({ dark }) {
  const c = useACT(dark);
  const [severity, setSeverity] = React.useState('all');
  const severities = ['all', 'error', 'warn', 'info'];

  const errorRateData = [0.41, 0.38, 0.52, 0.34, 0.29, 0.44, 0.31, 0.56, 0.48, 0.34, 0.28, 0.37, 0.42, 0.34];

  const topErrors = [
    { msg: 'TypeError: Cannot read property "plan" of undefined', count: 142, lastSeen: '4 min ago', users: 89 },
    { msg: 'NetworkError: RevenueCat webhook timeout (30s)', count: 87, lastSeen: '12 min ago', users: 87 },
    { msg: 'RangeError: Invalid date in meal log parser', count: 64, lastSeen: '28 min ago', users: 31 },
    { msg: 'AuthError: JWT expired during active session', count: 41, lastSeen: '1 hr ago', users: 41 },
    { msg: 'TimeoutError: Coach inference exceeded 10s limit', count: 28, lastSeen: '2 hr ago', users: 22 },
  ];

  const logs = [
    { level: 'error', ts: '14:42:18.304', msg: 'Unhandled rejection in /api/coach/stream — user usr_8f2a' },
    { level: 'error', ts: '14:41:56.112', msg: 'RevenueCat webhook failed: 504 Gateway Timeout' },
    { level: 'warn',  ts: '14:41:33.891', msg: 'Slow query: meal_logs SELECT took 2,340ms (threshold 500ms)' },
    { level: 'info',  ts: '14:40:58.220', msg: 'Deployment v2.14.3 health check passed — all regions green' },
    { level: 'warn',  ts: '14:40:12.773', msg: 'Rate limit approached: /api/nutrition/scan (82% of 100 rq/min)' },
    { level: 'error', ts: '14:39:44.501', msg: 'TypeError: Cannot read property "plan" of undefined at billing.js:142' },
    { level: 'info',  ts: '14:39:02.118', msg: 'Cache invalidation: user_profiles (batch of 240 keys)' },
    { level: 'warn',  ts: '14:38:21.445', msg: 'Memory usage at 78% on worker-03 (threshold 80%)' },
    { level: 'info',  ts: '14:37:55.892', msg: 'Cron: daily_digest emails queued — 4,218 recipients' },
    { level: 'info',  ts: '14:37:10.334', msg: 'SSL certificate renewal: atlas.core — 42 days remaining' },
    { level: 'error', ts: '14:36:48.221', msg: 'RangeError: Invalid date "2026-02-30" in meal log parser' },
    { level: 'info',  ts: '14:36:01.778', msg: 'Backup completed: postgres_main — 2.4 GB, verified' },
  ];

  const levelColor = { error: '#e8391f', warn: '#d4a017', info: c.dim };
  const levelBg = { error: 'rgba(232,57,31,0.10)', warn: 'rgba(212,160,23,0.10)', info: 'transparent' };

  return (
    <AdminShell dark={dark} active="errors">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Errors + Logs</div>
            <ACMono size={10} color={c.mute}>Real-time system telemetry</ACMono>
          </div>
          <div style={{ display: 'flex', gap: 4, background: c.card, borderRadius: 8, padding: 3 }}>
            {severities.map(s => (
              <div key={s} onClick={() => setSeverity(s)} style={{
                padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                background: severity === s ? c.fg : 'transparent',
                color: severity === s ? c.bg : c.dim,
                fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600,
                letterSpacing: 0.3, textTransform: 'uppercase',
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Error rate chart */}
        <div style={{ padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Error rate (14d)</ACLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>0.34%</span>
              <ACMono size={10} color="#28c93f">within SLA</ACMono>
            </div>
          </div>
          <AdminMiniSpark title="" data={errorRateData} w={740} h={50} dark={dark} color="#e8391f" />
        </div>

        {/* Top errors */}
        <div style={{ padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 10 }}>Top errors</ACLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Message', 'Count', 'Last seen', 'Users'].map(h => (
                  <th key={h} style={{
                    padding: '6px 10px', textAlign: 'left',
                    fontFamily: ACFonts.mono, fontSize: 9, fontWeight: 600,
                    letterSpacing: 0.4, color: c.mute, textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.hair}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topErrors.map((e, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${c.hair}` }}>
                  <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 10.5, color: '#e8391f', maxWidth: 460, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.msg}</td>
                  <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700, color: c.fg }}>{e.count}</td>
                  <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{e.lastSeen}</td>
                  <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{e.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Log stream */}
        <div style={{ padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 10 }}>Log stream (live)</ACLabel>
          <div style={{
            background: dark ? '#0d0c0a' : '#faf6ea',
            borderRadius: 8, padding: '8px 0', maxHeight: 180, overflow: 'auto',
            border: `1px solid ${c.hair}`,
          }}>
            {logs.map((l, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '4px 12px',
                background: levelBg[l.level],
                fontFamily: ACFonts.mono, fontSize: 10.5, lineHeight: 1.6,
              }}>
                <span style={{ color: levelColor[l.level], fontWeight: 700, minWidth: 36, textTransform: 'uppercase' }}>{l.level}</span>
                <span style={{ color: c.mute, minWidth: 90 }}>{l.ts}</span>
                <span style={{ color: c.fg, flex: 1 }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function S87_Admin_Errors({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/errors" width={1024} height={720} dark={dark}>
      <AdminErrorsBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S88 — ADMIN AUDIT LOG
// ══════════════════════════════════════════════════════════════
function AdminAuditBody({ dark }) {
  const c = useACT(dark);
  const [filterAdmin, setFilterAdmin] = React.useState('all');
  const admins = ['all', 'E. Soler', 'J. Park', 'R. Diaz'];

  const entries = [
    { ts: '2026-04-18 14:38:22', admin: 'E. Soler', action: 'user.impersonate', target: 'usr_8f2a3c9d', detail: 'Started impersonation session for Jake Thompson' },
    { ts: '2026-04-18 14:21:07', admin: 'E. Soler', action: 'feature_flag.toggle', target: 'ff_coach_v2', detail: 'Enabled "Coach v2 inference" for 100% of users' },
    { ts: '2026-04-18 13:55:41', admin: 'J. Park', action: 'user.suspend', target: 'usr_bb21f4e0', detail: 'Suspended for impersonation (display name violation)' },
    { ts: '2026-04-18 13:12:33', admin: 'R. Diaz', action: 'waitlist.invite', target: 'batch_042', detail: 'Batch invite: 50 users from waitlist queue' },
    { ts: '2026-04-18 12:48:19', admin: 'E. Soler', action: 'deployment.approve', target: 'v2.14.3', detail: 'Approved production deployment — all checks passed' },
    { ts: '2026-04-18 12:30:55', admin: 'J. Park', action: 'moderation.remove', target: 'flg_01a', detail: 'Removed display name "F**kFitness420" — profanity' },
    { ts: '2026-04-18 11:42:08', admin: 'R. Diaz', action: 'billing.refund', target: 'txn_9c4f21', detail: 'Issued $24.99 refund to Sofia Reyes — billing dispute' },
    { ts: '2026-04-18 11:15:30', admin: 'E. Soler', action: 'config.update', target: 'rate_limits', detail: 'Increased /api/nutrition/scan limit from 80 to 100 rq/min' },
    { ts: '2026-04-18 10:58:12', admin: 'J. Park', action: 'moderation.warn', target: 'usr_ck88a0', detail: 'Warning issued for spam/external promotion in bio' },
    { ts: '2026-04-18 10:22:44', admin: 'R. Diaz', action: 'user.role_change', target: 'usr_m1x5', detail: 'Promoted from moderator to admin' },
  ];

  const actionStyles = {
    'user.impersonate': { bg: 'rgba(232,57,31,0.12)', fg: '#e8391f' },
    'feature_flag.toggle': { bg: `${c.accent}18`, fg: c.accent },
    'user.suspend': { bg: 'rgba(232,57,31,0.12)', fg: '#e8391f' },
    'waitlist.invite': { bg: 'rgba(40,201,63,0.12)', fg: '#28c93f' },
    'deployment.approve': { bg: 'rgba(40,201,63,0.12)', fg: '#28c93f' },
    'moderation.remove': { bg: 'rgba(232,57,31,0.12)', fg: '#e8391f' },
    'billing.refund': { bg: 'rgba(212,160,23,0.12)', fg: '#d4a017' },
    'config.update': { bg: `${c.accent}18`, fg: c.accent },
    'moderation.warn': { bg: 'rgba(212,160,23,0.12)', fg: '#d4a017' },
    'user.role_change': { bg: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)', fg: c.fg },
  };

  return (
    <AdminShell dark={dark} active="audit">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Audit log</div>
            <ACMono size={10} color={c.mute}>All admin actions are recorded and immutable</ACMono>
          </div>
          <ACBtn dark={dark} size="sm" style={{ fontSize: 12 }}>Export</ACBtn>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Admin filter */}
          <div style={{ display: 'flex', gap: 4, background: c.card, borderRadius: 8, padding: 3 }}>
            {admins.map(a => (
              <div key={a} onClick={() => setFilterAdmin(a)} style={{
                padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                background: filterAdmin === a ? c.fg : 'transparent',
                color: filterAdmin === a ? c.bg : c.dim,
                fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600,
                letterSpacing: -0.1,
              }}>{a}</div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {/* Date range indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', background: c.card, borderRadius: 8,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke={c.dim} strokeWidth="1.2"/>
              <line x1="1" y1="5" x2="11" y2="5" stroke={c.dim} strokeWidth="1.2"/>
              <line x1="4" y1="1" x2="4" y2="3" stroke={c.dim} strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="8" y1="1" x2="8" y2="3" stroke={c.dim} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <ACMono size={10} color={c.dim}>Apr 18, 2026 (today)</ACMono>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Timestamp', 'Admin', 'Action', 'Target', 'Details'].map(h => (
                  <th key={h} style={{
                    padding: '8px 10px', textAlign: 'left',
                    fontFamily: ACFonts.mono, fontSize: 9, fontWeight: 600,
                    letterSpacing: 0.4, color: c.mute, textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.hair}`, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const as = actionStyles[e.action] || { bg: 'transparent', fg: c.dim };
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${c.hair}` }}>
                    <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, whiteSpace: 'nowrap' }}>{e.ts}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, fontWeight: 600, color: c.fg, whiteSpace: 'nowrap' }}>{e.admin}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                        fontFamily: ACFonts.mono, letterSpacing: 0.2,
                        background: as.bg, color: as.fg, whiteSpace: 'nowrap',
                      }}>{e.action}</span>
                    </td>
                    <td style={{ padding: '9px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, whiteSpace: 'nowrap' }}>{e.target}</td>
                    <td style={{ padding: '9px 10px', fontSize: 11, color: c.dim, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ACMono size={10} color={c.mute}>Showing 10 of 1,247 entries today</ACMono>
          <ACMono size={9} color={c.faint}>Retention: 90 days | Archival: indefinite</ACMono>
        </div>
      </div>
    </AdminShell>
  );
}

function S88_Admin_Audit({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/audit" width={1024} height={720} dark={dark}>
      <AdminAuditBody dark={dark} />
    </BrowserFrame>
  );
}


// ══════════════════════════════════════════════════════════════
// S89 — ADMIN SETTINGS
// ══════════════════════════════════════════════════════════════
function AdminSettingsBody({ dark }) {
  const c = useACT(dark);
  const [maintenance, setMaintenance] = React.useState(false);

  const Toggle = ({ on, onClick }) => (
    <div onClick={onClick} style={{
      width: 38, height: 22, borderRadius: 999, padding: 2,
      background: on ? c.accent : c.faint,
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 999,
        background: on ? c.ink : c.bg,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  );

  const featureFlags = [
    { key: 'ff_coach_v2', label: 'Coach v2 inference', desc: 'Use upgraded LLM for coach responses (GPT-4o)', on: true },
    { key: 'ff_food_scan', label: 'Food photo scanning', desc: 'AI-powered meal recognition from camera', on: true },
    { key: 'ff_social_feed', label: 'Social feed', desc: 'Activity feed and athlete following (beta)', on: false },
    { key: 'ff_body_3d', label: '3D body scan', desc: 'AR-based body composition estimation', on: false },
    { key: 'ff_dark_mode', label: 'Dark mode', desc: 'System-wide dark theme support', on: true },
    { key: 'ff_referrals', label: 'Referral program', desc: 'Invite-based rewards for existing users', on: true },
  ];

  const roles = [
    { name: 'E. Soler', email: 'enzo@atlas.core', role: 'Super admin', lastLogin: '14 min ago' },
    { name: 'J. Park', email: 'jpark@atlas.core', role: 'Admin', lastLogin: '2 hr ago' },
    { name: 'R. Diaz', email: 'rdiaz@atlas.core', role: 'Admin', lastLogin: '3 hr ago' },
    { name: 'S. Chen', email: 'schen@atlas.core', role: 'Moderator', lastLogin: '1 day ago' },
  ];

  const configItems = [
    { label: 'RevenueCat API key', value: 'rc_live_••••••••••••k9f2', type: 'key' },
    { label: 'OpenAI API key', value: 'sk-proj-••••••••••••m4x1', type: 'key' },
    { label: 'Webhook URL (billing)', value: 'https://api.atlas.core/webhooks/rc', type: 'url' },
    { label: 'Webhook URL (analytics)', value: 'https://api.atlas.core/webhooks/mixpanel', type: 'url' },
  ];

  const roleStyle = (r) => {
    if (r === 'Super admin') return { bg: `${c.accent}20`, fg: c.accent };
    if (r === 'Admin') return { bg: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)', fg: c.fg };
    return { bg: dark ? 'rgba(239,233,218,0.05)' : 'rgba(10,10,10,0.03)', fg: c.dim };
  };

  return (
    <AdminShell dark={dark} active="settings">
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>Settings</div>

        {/* Maintenance mode */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
          background: maintenance ? 'rgba(232,57,31,0.08)' : c.card,
          border: maintenance ? '1px solid rgba(232,57,31,0.2)' : `1px solid ${c.hair}`,
          borderRadius: ACRadii.card,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: maintenance ? '#e8391f' : c.fg }}>Maintenance mode</div>
            <ACLabel size={11} color={c.dim} style={{ display: 'block', marginTop: 2 }}>
              {maintenance ? 'App is offline. Users see maintenance page.' : 'App is live and serving traffic normally.'}
            </ACLabel>
          </div>
          <Toggle on={maintenance} onClick={() => setMaintenance(!maintenance)} />
        </div>

        {/* Feature flags + roles */}
        <div style={{ display: 'flex', gap: 14 }}>
          {/* Feature flags */}
          <div style={{ flex: 1.2, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Feature flags</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {featureFlags.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < featureFlags.length - 1 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.fg }}>{f.label}</span>
                      <ACMono size={9} color={c.mute}>{f.key}</ACMono>
                    </div>
                    <ACLabel size={10} color={c.dim} style={{ display: 'block', marginTop: 2 }}>{f.desc}</ACLabel>
                  </div>
                  <Toggle on={f.on} />
                </div>
              ))}
            </div>
          </div>

          {/* Roles */}
          <div style={{ flex: 0.8, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>Role management</ACLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {roles.map((r, i) => {
                const rs = roleStyle(r.role);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0',
                    borderBottom: i < roles.length - 1 ? `1px solid ${c.hair}` : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: i === 0 ? c.accent : c.faint,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: ACFonts.body, fontSize: 9, fontWeight: 800,
                      color: i === 0 ? c.ink : c.fg,
                    }}>{r.name.split(' ').map(w => w[0]).join('')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: c.fg }}>{r.name}</div>
                      <ACMono size={9} color={c.mute}>{r.email}</ACMono>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700,
                      fontFamily: ACFonts.mono, letterSpacing: 0.2,
                      background: rs.bg, color: rs.fg,
                    }}>{r.role}</span>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 12, padding: '8px 0', textAlign: 'center',
              border: `1px dashed ${c.faint}`, borderRadius: 8,
              fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600,
              color: c.dim, cursor: 'pointer',
            }}>+ Invite team member</div>
          </div>
        </div>

        {/* System configuration */}
        <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', marginBottom: 14 }}>System configuration</ACLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {configItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < configItems.length - 1 ? `1px solid ${c.hair}` : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: c.fg }}>{item.label}</span>
                </div>
                <div style={{
                  padding: '5px 12px', background: dark ? '#0d0c0a' : '#faf6ea',
                  borderRadius: 6, border: `1px solid ${c.hair}`,
                }}>
                  <ACMono size={10} color={c.dim}>{item.value}</ACMono>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: c.accent,
                  fontFamily: ACFonts.mono, letterSpacing: 0.2, cursor: 'pointer',
                }}>Reveal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function S89_Admin_Settings({ dark }) {
  return (
    <BrowserFrame url="admin.atlas.core/settings" width={1024} height={720} dark={dark}>
      <AdminSettingsBody dark={dark} />
    </BrowserFrame>
  );
}


// ── Exports ──────────────────────────────────────────────────
Object.assign(window, {
  S80_Admin_Overview, S81_Admin_Analytics, S82_Admin_Users,
  S83_Admin_User_Detail, S84_Admin_Subscriptions, S85_Admin_Waitlist,
  S86_Admin_Moderation, S87_Admin_Errors, S88_Admin_Audit, S89_Admin_Settings,
});
