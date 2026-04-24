// screens-p11.jsx — atlas.core · phase 11 · coach-side tools
// Four desktop screens for the human-coach layer:
//   S68 Coach · roster         — multi-client dashboard
//   S69 Coach · client detail  — one athlete's full read
//   S70 Coach · message queue  — inbox of pending threads
//   S71 Coach · intervention   — push a plan change to a client
//
// Rendered at 1280×820 inside ChromeWindow. Desktop typography:
// H1 Archivo Black at modest size (this is an internal tool — brand voice
// is allowed to breathe), SF Pro Display for section heads, SF Pro Text
// for UI, JetBrains Mono for data and labels. Paper/ink/sulfur throughout.

// ── shared primitives (local to p11 — desktop-only) ─────────────

function CoachShell({ active, title, breadcrumb, children, actions }) {
  const t = window.useTheme();
  const nav = [
    { k:'roster',   label:'Roster',    stamp:'R' },
    { k:'queue',    label:'Queue',     stamp:'Q', badge:7 },
    { k:'library',  label:'Library',   stamp:'L' },
    { k:'analytics',label:'Analytics', stamp:'A' },
    { k:'settings', label:'Settings',  stamp:'S' },
  ];
  return (
    <div style={{
      width:1280, height:820, background:t.bg, color:t.ink,
      fontFamily:'-apple-system, "SF Pro Text", system-ui, sans-serif',
      display:'grid', gridTemplateColumns:'220px 1fr',
      borderTop:`1px solid ${t.ink}22`,
    }}>
      {/* Sidebar */}
      <div style={{
        background:t.ink, color:t.bg,
        padding:'24px 0',
        display:'flex', flexDirection:'column',
        borderRight:`1px solid ${t.ink}`,
      }}>
        <div style={{ padding:'0 20px 24px', display:'flex', alignItems:'baseline', gap:2 }}>
          <span style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:18, letterSpacing:-0.6, textTransform:'lowercase' }}>atlas</span>
          <span style={{ color:t.accent, fontFamily:'"Archivo Black",sans-serif', fontSize:18 }}>.</span>
          <span style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:18, letterSpacing:-0.6, textTransform:'lowercase' }}>core</span>
          <span style={{ marginLeft:8, fontFamily:'"JetBrains Mono",monospace', fontSize:9, letterSpacing:2, color:`${t.bg}88`, textTransform:'uppercase' }}>/ coach</span>
        </div>
        <div style={{ padding:'0 12px 18px' }}>
          <div style={{ height:1, background:`${t.bg}12` }} />
        </div>
        {nav.map(n => {
          const on = n.k === active;
          return (
            <div key={n.k} style={{
              margin:'2px 12px', padding:'10px 12px',
              display:'flex', alignItems:'center', gap:12,
              background: on ? `${t.bg}0e` : 'transparent',
              borderLeft: on ? `2px solid ${t.accent}` : '2px solid transparent',
              fontSize:13, fontWeight: on ? 600 : 500,
              color: on ? t.bg : `${t.bg}b0`,
              cursor:'pointer',
            }}>
              <span style={{
                width:22, height:22, display:'grid', placeItems:'center',
                background: on ? t.accent : `${t.bg}14`, color: on ? t.ink : t.bg,
                fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:700,
              }}>{n.stamp}</span>
              <span style={{ flex:1 }}>{n.label}</span>
              {n.badge !== undefined && (
                <span style={{
                  fontFamily:'"JetBrains Mono",monospace', fontSize:9, letterSpacing:1,
                  padding:'2px 6px', background:t.accent, color:t.ink, fontWeight:700,
                }}>{n.badge}</span>
              )}
            </div>
          );
        })}

        <div style={{ flex:1 }} />
        <div style={{ padding:'18px 20px 0', borderTop:`1px solid ${t.bg}10` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:30, height:30, background:t.accent, color:t.ink,
              display:'grid', placeItems:'center',
              fontFamily:'"Archivo Black",sans-serif', fontSize:12,
            }}>MK</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:t.bg }}>Dr. M. Kline</div>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, letterSpacing:1.4, color:`${t.bg}70`, textTransform:'uppercase' }}>coach · 12 clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Topbar */}
        <div style={{
          padding:'18px 32px',
          borderBottom:`1px solid ${t.ink}12`,
          display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24,
        }}>
          <div>
            {breadcrumb && (
              <div style={{
                fontFamily:'"JetBrains Mono",monospace', fontSize:10, letterSpacing:1.8,
                color:`${t.ink}80`, textTransform:'uppercase', marginBottom:6,
              }}>{breadcrumb}</div>
            )}
            <div style={{
              fontFamily:'"SF Pro Display","SF Pro",sans-serif',
              fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1,
            }}>{title}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {actions}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex:1, overflow:'hidden', padding:'20px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── tiny desktop atoms ──────────────────────────────────────

function CMono({ children, size=11, track=1.4, color, style }) {
  return <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:size, letterSpacing:track, textTransform:'uppercase', color, ...style }}>{children}</span>;
}
function CLabel({ children, size=11, color, style }) {
  return <span style={{ fontFamily:'-apple-system,"SF Pro Text",sans-serif', fontSize:size, fontWeight:500, color, ...style }}>{children}</span>;
}
function CNum({ children, size=28, color, weight=700, style }) {
  return <span style={{ fontFamily:'"SF Pro Display","SF Pro",sans-serif', fontSize:size, fontWeight:weight, fontVariantNumeric:'tabular-nums', letterSpacing:-0.6, color, ...style }}>{children}</span>;
}
function CBtn({ children, primary, danger, size='md', style, icon }) {
  const t = window.useTheme();
  const pads = { sm:'8px 14px', md:'10px 18px', lg:'14px 22px' };
  const bg = primary ? t.ink : danger ? '#c2391a' : 'transparent';
  const fg = primary || danger ? t.bg : t.ink;
  const border = primary || danger ? 'transparent' : `${t.ink}24`;
  return (
    <button style={{
      padding:pads[size], background:bg, color:fg,
      border:`1px solid ${border}`, fontFamily:'inherit',
      fontSize: size==='sm'?12:13, fontWeight:600,
      cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
      ...style,
    }}>{icon}{children}</button>
  );
}
function CChip({ children, state, style }) {
  const t = window.useTheme();
  // states: neutral | good | flag | warn | live
  const palettes = {
    neutral: { bg:`${t.ink}10`,  fg:`${t.ink}b0` },
    good:    { bg:'#1f4d2e18',   fg:'#2a7a47' },
    flag:    { bg:`${t.accent}24`, fg:t.ink, dot:t.accent },
    warn:    { bg:'#c2391a18',   fg:'#c2391a' },
    live:    { bg:t.ink,         fg:t.bg, dot:t.accent },
  };
  const p = palettes[state] || palettes.neutral;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'3px 9px', background:p.bg, color:p.fg,
      fontFamily:'"JetBrains Mono",monospace', fontSize:10, letterSpacing:1.2, fontWeight:600,
      textTransform:'uppercase', ...style,
    }}>
      {p.dot && <span style={{ width:6, height:6, background:p.dot, borderRadius:999 }} />}
      {children}
    </span>
  );
}
function CAvatar({ name='AK', size=36, accent }) {
  const t = window.useTheme();
  return (
    <div style={{
      width:size, height:size, background: accent ? t.accent : `${t.ink}10`, color: accent ? t.ink : t.ink,
      display:'grid', placeItems:'center',
      fontFamily:'"Archivo Black",sans-serif', fontSize: size*0.36,
    }}>{name}</div>
  );
}

// ── ECG / sparkline for desktop (reuses ACSpark) ────────────
function DeskSpark({ data, w=120, h=32, color, stroke=1.6 }) {
  const t = window.useTheme();
  const col = color ?? t.accent;
  const max = Math.max(...data), min = Math.min(...data);
  const span = Math.max(1, max-min);
  const pts = data.map((v,i) => [i*(w/(data.length-1)), h - ((v-min)/span)*(h-4) - 2]);
  const d = pts.map((p,i) => (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  return (
    <svg width={w} height={h} style={{ display:'block' }}>
      <path d={d} fill="none" stroke={col} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════
// S68 — COACH · ROSTER
// ══════════════════════════════════════════════════════════
function S68_Coach_Roster() {
  const t = window.useTheme();
  const clients = [
    { name:'A. Kimura',   stamp:'AK', prog:'5/3/1 BBB',     wk:'W07/16', read:82, trend:[78,80,79,82,83,82,82], flag:null,         lastSeen:'2h',  tonnage:'18.2k', adherence:98 },
    { name:'J. Parker',   stamp:'JP', prog:'Recomp',        wk:'W03/12', read:61, trend:[72,68,65,62,60,61,61], flag:'HRV drift',  lastSeen:'8h',  tonnage:'11.4k', adherence:87 },
    { name:'E. Navarro',  stamp:'EN', prog:'Hypertrophy',   wk:'W11/16', read:74, trend:[70,72,74,73,74,75,74], flag:null,         lastSeen:'1d',  tonnage:'22.8k', adherence:94 },
    { name:'D. Singh',    stamp:'DS', prog:'Powerlifting',  wk:'W05/16', read:88, trend:[84,85,87,86,88,88,88], flag:'PR window',  lastSeen:'3h',  tonnage:'15.6k', adherence:100 },
    { name:'R. Chen',     stamp:'RC', prog:'Maintain',      wk:'—',      read:55, trend:[68,65,60,58,55,56,55], flag:'Missed 3',   lastSeen:'4d',  tonnage:'—',     adherence:62 },
    { name:'L. Monteiro', stamp:'LM', prog:'Athletic',      wk:'W02/12', read:79, trend:[75,77,78,79,80,79,79], flag:null,         lastSeen:'6h',  tonnage:'9.8k',  adherence:91 },
    { name:'M. Davis',    stamp:'MD', prog:'5/3/1 FSL',     wk:'W09/16', read:71, trend:[73,72,70,71,72,71,71], flag:null,         lastSeen:'12h', tonnage:'19.1k', adherence:89 },
    { name:'S. Becker',   stamp:'SB', prog:'Cut',           wk:'W04/08', read:66, trend:[70,68,67,66,65,66,66], flag:'Low sleep',  lastSeen:'5h',  tonnage:'12.2k', adherence:83 },
    { name:'T. Rowe',     stamp:'TR', prog:'Hybrid',        wk:'W12/16', read:84, trend:[80,82,83,84,85,84,84], flag:null,         lastSeen:'1h',  tonnage:'20.5k', adherence:96 },
    { name:'V. Oliveira', stamp:'VO', prog:'Intro',         wk:'W01/08', read:77, trend:[72,74,76,77,78,77,77], flag:'New',        lastSeen:'30m', tonnage:'5.2k',  adherence:100 },
    { name:'W. Park',     stamp:'WP', prog:'Recomp',        wk:'W08/12', read:72, trend:[74,73,72,71,72,72,72], flag:null,         lastSeen:'2d',  tonnage:'14.0k', adherence:85 },
    { name:'Y. Abebe',    stamp:'YA', prog:'Build',         wk:'W06/16', read:80, trend:[76,78,79,80,81,80,80], flag:null,         lastSeen:'4h',  tonnage:'16.8k', adherence:92 },
  ];
  const summary = [
    { k:'active',   v:'12',   sub:'1 paused · 0 ended' },
    { k:'flagged',  v:'04',   sub:'review in queue' },
    { k:'on-track', v:'08',   sub:'adherence ≥ 90%' },
    { k:'prs · wk', v:'03',   sub:'D. Singh · L. Monteiro · T. Rowe' },
  ];
  return (
    <CoachShell
      active="roster"
      breadcrumb="COACH · ROSTER"
      title="Your athletes."
      actions={<>
        <CBtn size="sm" icon={<span style={{ color:t.accent,fontWeight:700 }}>+</span>}>Invite</CBtn>
        <CBtn size="sm">Export CSV</CBtn>
        <CBtn size="sm" primary>New session</CBtn>
      </>}>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1, marginBottom:20, background:`${t.ink}12` }}>
        {summary.map(s => (
          <div key={s.k} style={{ background:t.bg, padding:'18px 20px' }}>
            <CMono color={`${t.ink}70`} size={9} track={1.8}>{s.k}</CMono>
            <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:10 }}>
              <CNum size={34}>{s.v}</CNum>
            </div>
            <div style={{ fontSize:11, color:`${t.ink}80`, marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <div style={{
          flex:1, display:'flex', alignItems:'center', gap:10,
          padding:'8px 14px', background:`${t.ink}08`, border:`1px solid ${t.ink}14`,
        }}>
          <CMono color={`${t.ink}70`} size={10}>⌕</CMono>
          <span style={{ fontSize:13, color:`${t.ink}60` }}>Search by name, program, or flag…</span>
          <span style={{ flex:1 }} />
          <CMono color={`${t.ink}50`} size={9} track={1.4}>⌘ K</CMono>
        </div>
        {['All · 12','Flagged · 4','On-track · 8','New · 1','Paused · 1'].map((c,i) => (
          <CChip key={i} state={i===0?'live':'neutral'}>{c}</CChip>
        ))}
      </div>

      {/* Table */}
      <div style={{ border:`1px solid ${t.ink}14` }}>
        <div style={{
          display:'grid', gridTemplateColumns:'2fr 2fr 0.9fr 1.2fr 1.1fr 0.9fr 1fr 0.7fr',
          padding:'12px 16px', background:`${t.ink}08`,
          borderBottom:`1px solid ${t.ink}14`,
        }}>
          {['athlete','program','read.','7-day signal','flag','tonnage','adherence','last'].map(h => (
            <CMono key={h} size={9} color={`${t.ink}70`} track={1.6}>{h}</CMono>
          ))}
        </div>
        {clients.slice(0,8).map((c,i) => (
          <div key={c.name} style={{
            display:'grid', gridTemplateColumns:'2fr 2fr 0.9fr 1.2fr 1.1fr 0.9fr 1fr 0.7fr',
            padding:'14px 16px', alignItems:'center',
            borderBottom: i<7 ? `1px solid ${t.ink}0c` : 'none',
            background: i===1 ? `${t.accent}06` : 'transparent',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <CAvatar name={c.stamp} size={32} accent={c.flag==='PR window'} />
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                <CMono size={9} color={`${t.ink}60`}>last: {c.lastSeen}</CMono>
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, color:t.ink }}>{c.prog}</div>
              <CMono size={9} color={`${t.ink}60`}>{c.wk}</CMono>
            </div>
            <div>
              <CNum size={18} color={c.read < 65 ? '#c2391a' : c.read >= 85 ? '#2a7a47' : t.ink}>{c.read}</CNum>
            </div>
            <div>
              <DeskSpark data={c.trend} w={90} h={22} color={c.read < 65 ? '#c2391a' : c.read >= 85 ? '#2a7a47' : t.ink} />
            </div>
            <div>
              {c.flag
                ? <CChip state={c.flag==='PR window'?'flag':c.flag==='Missed 3'?'warn':c.flag==='New'?'good':'warn'}>{c.flag}</CChip>
                : <CMono size={10} color={`${t.ink}40`}>—</CMono>}
            </div>
            <div><CMono size={11} color={t.ink}>{c.tonnage}</CMono></div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ flex:1, height:4, background:`${t.ink}10`, position:'relative' }}>
                <div style={{ position:'absolute', inset:0, right:`${100-c.adherence}%`, background: c.adherence<80?'#c2391a':c.adherence<95?t.accent:t.ink }} />
              </div>
              <CMono size={10} color={`${t.ink}80`}>{c.adherence}%</CMono>
            </div>
            <div style={{ textAlign:'right' }}>
              <CMono size={11} color={t.accent}>Open →</CMono>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:'10px 16px', textAlign:'right' }}>
        <CMono size={10} color={`${t.ink}60`}>showing 08 of 12 · page 1/2</CMono>
      </div>
    </CoachShell>
  );
}

// ══════════════════════════════════════════════════════════
// S69 — COACH · CLIENT DETAIL
// ══════════════════════════════════════════════════════════
function S69_Coach_Client_Detail() {
  const t = window.useTheme();
  const heart = [80,78,76,74,72,70,68,66,64,62,60,59,58,60,61,62,61,61,60,61,61];
  const read  = [72,68,65,62,60,61,61];
  const vol   = [18,16,14,12,11,10,12,14,15,14,13,11,10,12,13];
  return (
    <CoachShell
      active="roster"
      breadcrumb="COACH · ROSTER · J. PARKER"
      title="Jordan Parker."
      actions={<>
        <CBtn size="sm">Message</CBtn>
        <CBtn size="sm">Schedule</CBtn>
        <CBtn size="sm" primary>Push intervention →</CBtn>
      </>}>
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20, height:'calc(100% - 0px)', overflow:'auto' }}>
        {/* Left column */}
        <div>
          {/* Bio strip */}
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', paddingBottom:20, borderBottom:`1px solid ${t.ink}14` }}>
            <CAvatar name="JP" size={72} accent />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, color:`${t.ink}b0` }}>M · 34 · 178 cm · 82.4 kg · recomp</div>
              <div style={{ marginTop:6, display:'flex', gap:6, flexWrap:'wrap' }}>
                <CChip state="neutral">W03/12</CChip>
                <CChip state="flag">HRV drift</CChip>
                <CChip state="neutral">since Jan ’26</CChip>
                <CChip state="good">pro plan</CChip>
              </div>
              <div style={{ marginTop:12, fontSize:13, color:`${t.ink}b0`, lineHeight:1.55, maxWidth:520 }}>
                Works remote, 2 kids, sleep volatile (5–7h). Wants to drop 4 kg and keep strength.
                Prefers morning training; avoid calls on Thursdays.
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <CMono size={10} color={`${t.ink}70`}>COACH NOTES · 14 · LAST 3D AGO</CMono>
              <div style={{ marginTop:6 }}>
                <CBtn size="sm">Open notes →</CBtn>
              </div>
            </div>
          </div>

          {/* Signal row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, margin:'20px 0', background:`${t.ink}12` }}>
            {[
              { k:'readiness',   v:'61', sub:'▼ 11 · 7d', state:'warn' },
              { k:'hrv · rmssd', v:'42', sub:'▼ 18 · baseline 52', state:'warn' },
              { k:'rhr',         v:'58', sub:'▲ 3 · normal' },
              { k:'sleep',       v:'6h 12', sub:'−40 vs tgt' },
            ].map(s => (
              <div key={s.k} style={{ background:t.bg, padding:'14px 16px' }}>
                <CMono color={`${t.ink}70`} size={9} track={1.8}>{s.k}</CMono>
                <div style={{ marginTop:4 }}><CNum size={26} color={s.state==='warn'?'#c2391a':t.ink}>{s.v}</CNum></div>
                <div style={{ fontSize:11, color:`${t.ink}90`, marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts stack */}
          <div style={{ padding:16, border:`1px solid ${t.ink}14`, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 }}>
              <div>
                <CMono size={10} color={`${t.ink}70`}>HRV · 21 DAYS · RMSSD</CMono>
                <div style={{ marginTop:4, fontSize:14, fontWeight:600 }}>Drift began Mar 18 — correlates with travel block.</div>
              </div>
              <CMono size={10} color={t.accent}>7D · 21D · 90D</CMono>
            </div>
            <DeskSpark data={heart} w={760} h={100} color="#c2391a" stroke={2} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ padding:16, border:`1px solid ${t.ink}14` }}>
              <CMono size={10} color={`${t.ink}70`}>READINESS · 7D</CMono>
              <div style={{ marginTop:10 }}>
                <DeskSpark data={read} w={340} h={80} color="#c2391a" stroke={2} />
              </div>
            </div>
            <div style={{ padding:16, border:`1px solid ${t.ink}14` }}>
              <CMono size={10} color={`${t.ink}70`}>VOLUME · 15 SESSIONS</CMono>
              <div style={{ marginTop:10, display:'flex', alignItems:'flex-end', gap:3, height:80 }}>
                {vol.map((v,i) => (
                  <div key={i} style={{ flex:1, height:`${v*4}px`, background: i>=vol.length-3?t.accent:t.ink }} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ border:`1px solid ${t.ink}14` }}>
            <div style={{ padding:'12px 16px', background:`${t.ink}08`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <CMono size={10} color={`${t.ink}70`}>RECENT SESSIONS</CMono>
              <CMono size={10} color={t.accent}>Open full log →</CMono>
            </div>
            {[
              { d:'APR 22', k:'Push · B', m:'5×5 bench · 95 kg · RPE 8', ok:true },
              { d:'APR 20', k:'Pull · A', m:'4×6 deadlift · 150 kg · RPE 7', ok:true },
              { d:'APR 18', k:'Legs · B', m:'Terminated early — back tightness', ok:false },
              { d:'APR 16', k:'Push · A', m:'Full · 3 PRs tagged', ok:true },
            ].map((s,i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'90px 140px 1fr auto',
                padding:'12px 16px', alignItems:'center', gap:14,
                borderTop: i? `1px solid ${t.ink}0c`:'none',
              }}>
                <CMono size={11} color={`${t.ink}70`}>{s.d}</CMono>
                <div style={{ fontSize:13, fontWeight:600 }}>{s.k}</div>
                <div style={{ fontSize:12, color:`${t.ink}b0` }}>{s.m}</div>
                {s.ok
                  ? <CChip state="good">complete</CChip>
                  : <CChip state="warn">flagged</CChip>}
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Coach thread */}
          <div style={{ padding:16, background:t.ink, color:t.bg }}>
            <CMono size={10} color={t.accent}>COACH · THREAD</CMono>
            <div style={{ marginTop:10, fontSize:13, lineHeight:1.5 }}>
              <strong>You · 2d:</strong> Let's swap Thu's heavy pull for mobility + sauna. Cortisol's high.
              <br/><br/>
              <strong>J.P. · 2d:</strong> Agreed. Back felt stiff anyway.
              <br/><br/>
              <strong>You · 18h:</strong> How's sleep tonight? Try magnesium + blue-block at 9.
            </div>
            <div style={{ marginTop:14, display:'flex', gap:8 }}>
              <CBtn size="sm" style={{ background:t.accent, color:t.ink, borderColor:'transparent' }}>Reply</CBtn>
              <CBtn size="sm" style={{ color:t.bg, borderColor:`${t.bg}40` }}>View thread</CBtn>
            </div>
          </div>

          {/* Next move */}
          <div style={{ padding:16, border:`1px solid ${t.ink}14` }}>
            <CMono size={10} color={`${t.ink}70`}>AI RECOMMENDATION</CMono>
            <div style={{ marginTop:8, fontSize:14, fontWeight:600, lineHeight:1.35 }}>Deload pull day this week. Keep squat.</div>
            <div style={{ marginTop:6, fontSize:12, color:`${t.ink}b0`, lineHeight:1.5 }}>
              HRV drift −18 from baseline, sleep down 40 min/night, RPE rising on pulls.
              Squat tolerance stable.
            </div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <CBtn size="sm" primary>Apply → plan</CBtn>
              <CBtn size="sm">Customize</CBtn>
            </div>
          </div>

          {/* Labs */}
          <div style={{ padding:16, border:`1px solid ${t.ink}14` }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <CMono size={10} color={`${t.ink}70`}>LABS · LAST PANEL</CMono>
              <CMono size={10} color={`${t.ink}60`}>14D AGO</CMono>
            </div>
            {[
              { k:'ApoB',         v:'78',  u:'mg/dL', flag:'flag' },
              { k:'Testosterone', v:'612', u:'ng/dL', flag:'good' },
              { k:'HbA1c',        v:'5.3', u:'%',     flag:'good' },
              { k:'hs-CRP',       v:'0.8', u:'mg/L',  flag:'good' },
            ].map(l => (
              <div key={l.k} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0', borderTop:`1px solid ${t.ink}0c`,
              }}>
                <CLabel>{l.k}</CLabel>
                <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                  <CNum size={16} color={l.flag==='flag'?t.accent:t.ink}>{l.v}</CNum>
                  <CMono size={9} color={`${t.ink}60`}>{l.u}</CMono>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

// ══════════════════════════════════════════════════════════
// S70 — COACH · MESSAGE QUEUE
// ══════════════════════════════════════════════════════════
function S70_Coach_Queue() {
  const t = window.useTheme();
  const threads = [
    { from:'J. Parker',   stamp:'JP', prio:'high',   subj:'HRV drop — should I skip Thu?',  preview:'My watch says HRV is way down. I was planning heavy deadlifts Thursday...', t:'2m',  unread:true,  tags:['hrv','plan'] },
    { from:'D. Singh',    stamp:'DS', prio:'pr',     subj:'PR window — 180 kg squat?',     preview:'Last three warmups felt lighter than expected. Green light to attempt?',   t:'14m', unread:true,  tags:['pr','squat'] },
    { from:'R. Chen',     stamp:'RC', prio:'churn',  subj:'Thinking about pausing.',        preview:'Life is chaos and I haven\'t logged anything in 4 days. Don\'t want to...', t:'1h',  unread:true,  tags:['churn'] },
    { from:'S. Becker',   stamp:'SB', prio:'normal', subj:'Magnesium brand question.',     preview:'You mentioned a specific brand on the last call — can you resend?',       t:'2h',  unread:true,  tags:['sup'] },
    { from:'T. Rowe',     stamp:'TR', prio:'normal', subj:'Shoulder feels off.',           preview:'Slight pinch on left delt, only on incline. Not sharp. Work through?',    t:'3h',  unread:true,  tags:['injury'] },
    { from:'M. Davis',    stamp:'MD', prio:'low',    subj:'Schedule Tuesday at 7?',        preview:'Conflict with a standup. Could we do 7:30 or skip to Wednesday?',        t:'5h',  unread:false, tags:['sched'] },
    { from:'V. Oliveira', stamp:'VO', prio:'low',    subj:'Loved the brief today.',        preview:'This is exactly what I needed after last week. Thank you.',               t:'1d',  unread:false, tags:['note'] },
  ];
  const [active, setActive] = React.useState(0);
  const selected = threads[active];
  return (
    <CoachShell
      active="queue"
      breadcrumb="COACH · QUEUE"
      title="Inbox."
      actions={<>
        <CBtn size="sm">Filters</CBtn>
        <CBtn size="sm">Saved replies</CBtn>
        <CBtn size="sm" primary>Compose →</CBtn>
      </>}>
      <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', height:'calc(100% - 0px)', border:`1px solid ${t.ink}14`, overflow:'hidden' }}>
        {/* Thread list */}
        <div style={{ borderRight:`1px solid ${t.ink}14`, overflow:'auto' }}>
          <div style={{ padding:'10px 14px', background:`${t.ink}08`, display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${t.ink}14` }}>
            <CMono size={10} color={`${t.ink}70`}>07 NEW · 23 TODAY</CMono>
            <span style={{ flex:1 }} />
            <CMono size={10} color={t.accent}>MARK ALL ·</CMono>
          </div>
          {threads.map((th, i) => (
            <div key={i} onClick={()=>setActive(i)} style={{
              padding:'14px 14px', display:'grid', gridTemplateColumns:'36px 1fr auto', gap:12,
              borderBottom:`1px solid ${t.ink}0c`,
              background: i===active ? `${t.accent}10` : 'transparent',
              borderLeft: i===active ? `2px solid ${t.accent}` : '2px solid transparent',
              cursor:'pointer',
            }}>
              <CAvatar name={th.stamp} size={36} accent={th.prio==='pr'} />
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13, fontWeight: th.unread?700:500 }}>{th.from}</span>
                  {th.prio==='high'  && <CChip state="warn">urgent</CChip>}
                  {th.prio==='pr'    && <CChip state="flag">PR · ok?</CChip>}
                  {th.prio==='churn' && <CChip state="warn">churn risk</CChip>}
                </div>
                <div style={{ fontSize:12, fontWeight: th.unread?600:400, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{th.subj}</div>
                <div style={{ fontSize:11, color:`${t.ink}80`, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{th.preview}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <CMono size={9} color={`${t.ink}60`}>{th.t}</CMono>
                {th.unread && <div style={{ marginTop:6, width:6, height:6, background:t.accent, marginLeft:'auto' }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Thread detail */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${t.ink}14` }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
              <div>
                <CMono size={10} color={`${t.ink}70`}>FROM · {selected.from.toUpperCase()} · {selected.t} AGO</CMono>
                <div style={{ fontSize:20, fontWeight:700, letterSpacing:-0.4, marginTop:4 }}>{selected.subj}</div>
                <div style={{ marginTop:8, display:'flex', gap:6 }}>
                  {selected.tags.map(tag => <CChip key={tag} state="neutral">#{tag}</CChip>)}
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <CBtn size="sm">Mute</CBtn>
                <CBtn size="sm">Assign</CBtn>
                <CBtn size="sm" primary>Open client →</CBtn>
              </div>
            </div>
          </div>

          <div style={{ flex:1, padding:'20px', overflow:'auto' }}>
            {/* Context strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, marginBottom:18, background:`${t.ink}12` }}>
              {[
                { k:'readiness', v:'61', sub:'▼ 11 · 7d' },
                { k:'hrv',       v:'42', sub:'▼ 18' },
                { k:'plan',      v:'W03/12', sub:'Pull · Thu' },
                { k:'last PR',   v:'18d',    sub:'bench · 95 kg' },
              ].map(s => (
                <div key={s.k} style={{ background:t.bg, padding:'10px 14px' }}>
                  <CMono color={`${t.ink}70`} size={9} track={1.8}>{s.k}</CMono>
                  <div style={{ marginTop:2 }}><CNum size={18}>{s.v}</CNum></div>
                  <div style={{ fontSize:10, color:`${t.ink}80` }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding:16, background:`${t.ink}08`, borderLeft:`2px solid ${t.accent}`,
              fontSize:13.5, lineHeight:1.6, color:`${t.ink}e0`,
            }}>
              <p style={{ margin:0 }}>{selected.preview}</p>
              <p style={{ margin:'10px 0 0' }}>My watch says HRV is way down (42). I was planning heavy deadlifts Thursday but I don't trust the numbers — should I move it?</p>
            </div>

            {/* AI draft */}
            <div style={{ marginTop:20, padding:16, border:`1px dashed ${t.ink}30` }}>
              <CMono size={10} color={t.accent}>AI DRAFT · READY TO EDIT</CMono>
              <p style={{ margin:'10px 0 0', fontSize:13, lineHeight:1.6 }}>
                Trust the signal — your HRV drop tracks with this week's poor sleep (6h avg).
                Swap Thursday's heavy pull for mobility + sauna. I'll move deadlifts to Saturday
                if Friday recovery looks good. Want me to update your plan?
              </p>
              <div style={{ marginTop:12, display:'flex', gap:8 }}>
                <CBtn size="sm" primary>Send as-is</CBtn>
                <CBtn size="sm">Edit</CBtn>
                <CBtn size="sm">Regenerate</CBtn>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div style={{ padding:'14px 20px', borderTop:`1px solid ${t.ink}14`, background:`${t.ink}06` }}>
            <div style={{ background:t.bg, border:`1px solid ${t.ink}18`, padding:12 }}>
              <CLabel color={`${t.ink}70`}>Reply to {selected.from} · threaded</CLabel>
              <div style={{ marginTop:8, fontSize:13, color:`${t.ink}40`, minHeight:28 }}>Type a reply or use a saved template…</div>
              <div style={{ display:'flex', gap:6, marginTop:10 }}>
                {['plan · deload','sched · swap','sup · mag','pr · go'].map(s =>
                  <CChip key={s} state="neutral">{s}</CChip>
                )}
                <span style={{ flex:1 }} />
                <CBtn size="sm" primary>Send ↵</CBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

// ══════════════════════════════════════════════════════════
// S71 — COACH · INTERVENTION
// ══════════════════════════════════════════════════════════
function S71_Coach_Intervention() {
  const t = window.useTheme();
  return (
    <CoachShell
      active="roster"
      breadcrumb="COACH · ROSTER · J. PARKER · INTERVENTION"
      title="Push a plan change."
      actions={<>
        <CBtn size="sm">Save as draft</CBtn>
        <CBtn size="sm">Discard</CBtn>
        <CBtn size="sm" primary>Send to J. Parker →</CBtn>
      </>}>
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:24, height:'calc(100% - 0px)', overflow:'auto' }}>
        {/* Left: editor */}
        <div>
          {/* Why */}
          <div style={{ marginBottom:20 }}>
            <CMono size={10} color={`${t.ink}70`} style={{ marginBottom:10, display:'block' }}>STEP 01 · THE WHY</CMono>
            <div style={{ padding:16, border:`1px solid ${t.ink}14` }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>What is triggering this change?</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {[
                  { k:'HRV drift',        on:true,  v:'−18' },
                  { k:'Sleep debt',       on:true,  v:'−40m/n' },
                  { k:'Session RPE ↑',    on:false, v:'+0.6' },
                  { k:'Missed workouts',  on:false, v:'0' },
                  { k:'Reported pain',    on:false, v:'—' },
                  { k:'Lab flag',         on:false, v:'—' },
                ].map(o => (
                  <div key={o.k} style={{
                    padding:'10px 12px', border:`1px solid ${o.on?t.ink:`${t.ink}18`}`,
                    background: o.on ? `${t.accent}14` : 'transparent',
                    borderLeft: o.on ? `3px solid ${t.accent}` : `3px solid transparent`,
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <span style={{ fontSize:12, fontWeight: o.on?700:500 }}>{o.k}</span>
                    <CMono size={10} color={o.on?t.ink:`${t.ink}60`}>{o.v}</CMono>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What */}
          <div style={{ marginBottom:20 }}>
            <CMono size={10} color={`${t.ink}70`} style={{ marginBottom:10, display:'block' }}>STEP 02 · THE CHANGE</CMono>
            <div style={{ border:`1px solid ${t.ink}14` }}>
              <div style={{ padding:14, borderBottom:`1px solid ${t.ink}10`, display:'flex', alignItems:'center', gap:12 }}>
                <CMono size={10} color={`${t.ink}60`} style={{ width:90 }}>TYPE</CMono>
                <div style={{ display:'flex', gap:6 }}>
                  {['Deload','Swap day','Skip session','Change lift','Add rest','Other'].map((c,i) => (
                    <CChip key={c} state={i===0?'live':'neutral'}>{c}</CChip>
                  ))}
                </div>
              </div>
              <div style={{ padding:14, borderBottom:`1px solid ${t.ink}10`, display:'flex', alignItems:'center', gap:12 }}>
                <CMono size={10} color={`${t.ink}60`} style={{ width:90 }}>SCOPE</CMono>
                <div style={{ display:'flex', gap:6 }}>
                  {['This session','This week','Next 2 weeks','Remainder of block'].map((c,i) => (
                    <CChip key={c} state={i===1?'live':'neutral'}>{c}</CChip>
                  ))}
                </div>
              </div>
              <div style={{ padding:14, display:'flex', alignItems:'flex-start', gap:12 }}>
                <CMono size={10} color={`${t.ink}60`} style={{ width:90, paddingTop:8 }}>DETAILS</CMono>
                <div style={{ flex:1, padding:10, background:`${t.ink}06`, border:`1px solid ${t.ink}14` }}>
                  <div style={{ fontSize:13, lineHeight:1.6 }}>
                    <strong>Thu · Pull A</strong> → deload to 60% intensity, cut volume by one set per lift, add 10 min zone-2 and sauna 20 min.
                    <br/>
                    <strong>Sat · Pull B</strong> → moved from Sat to Sun (recovery day inserted).
                    <br/>
                    <strong>Squat</strong> → unchanged.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <CMono size={10} color={`${t.ink}70`} style={{ marginBottom:10, display:'block' }}>STEP 03 · THE MESSAGE</CMono>
            <div style={{ padding:14, border:`1px solid ${t.ink}14` }}>
              <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                {['Direct','Warm','Scientific','Brief'].map((c,i) =>
                  <CChip key={c} state={i===0?'live':'neutral'}>{c}</CChip>
                )}
                <span style={{ flex:1 }} />
                <CMono size={10} color={t.accent}>REGENERATE</CMono>
              </div>
              <div style={{ padding:12, background:`${t.ink}06`, fontSize:13, lineHeight:1.6 }}>
                <p style={{ margin:0 }}>Jordan — your HRV is down 18 from baseline and sleep's dropped ~40 min/night this week. That's a clear signal.</p>
                <p style={{ margin:'10px 0 0' }}>We're pulling Thursday back to a deload (60%, one less set per lift) and adding zone-2 + sauna. Saturday's pull moves to Sunday. Squat stays as-is — that's still tolerating load fine.</p>
                <p style={{ margin:'10px 0 0' }}>Trust the signal. Real strength comes from listening.</p>
                <p style={{ margin:'10px 0 0', color:`${t.ink}80` }}>— M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div>
          <CMono size={10} color={`${t.ink}70`} style={{ marginBottom:10, display:'block' }}>CLIENT PREVIEW · AS SEEN ON PHONE</CMono>
          <div style={{
            width:300, margin:'0 auto', padding:16,
            background:t.ink, color:t.bg, fontFamily:'-apple-system,"SF Pro Text",sans-serif',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:24, background:t.accent, color:t.ink, display:'grid', placeItems:'center', fontFamily:'"Archivo Black",sans-serif', fontSize:10 }}>MK</div>
              <div style={{ fontSize:12, fontWeight:600 }}>Dr. M. Kline</div>
              <span style={{ flex:1 }} />
              <CMono size={9} color={t.accent}>COACH · NOW</CMono>
            </div>

            <div style={{ marginTop:14, fontSize:11, color:`${t.bg}80`, letterSpacing:1.5 }}>PLAN CHANGE</div>
            <div style={{ fontFamily:'"SF Pro Display",sans-serif', fontSize:22, fontWeight:700, letterSpacing:-0.6, lineHeight:1.15, marginTop:4 }}>
              Deload Thu · swap Sat → Sun
            </div>

            <p style={{ margin:'12px 0 0', fontSize:12.5, lineHeight:1.6, color:`${t.bg}e0` }}>
              Jordan — your HRV is down 18 from baseline and sleep's dropped ~40 min/night this week.
              We're deloading Thu (60%) and moving Sat pull to Sun. Squat stays.
            </p>

            <div style={{ marginTop:14, padding:10, borderTop:`1px solid ${t.bg}18`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              <CMono size={9} color={`${t.bg}80`}>HRV · −18</CMono>
              <CMono size={9} color={`${t.bg}80`}>SLEEP · −40M</CMono>
              <CMono size={9} color={`${t.bg}80`}>WEEK · 03/12</CMono>
              <CMono size={9} color={`${t.bg}80`}>DUR · 14D</CMono>
            </div>

            <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              <button style={{ padding:'10px 0', background:t.accent, color:t.ink, border:0, fontSize:12, fontWeight:700 }}>Apply plan</button>
              <button style={{ padding:'10px 0', background:'transparent', color:t.bg, border:`1px solid ${t.bg}40`, fontSize:12, fontWeight:600 }}>Discuss</button>
            </div>
          </div>

          <div style={{ marginTop:20, padding:14, background:`${t.ink}08`, border:`1px solid ${t.ink}14` }}>
            <CMono size={10} color={`${t.ink}70`} style={{ marginBottom:8, display:'block' }}>DELIVERY</CMono>
            {[
              { k:'Push notification', v:'Yes · 9:00 AM local' },
              { k:'In-app banner',     v:'Yes · until actioned' },
              { k:'Email copy',        v:'No' },
              { k:'Require acknowledgment', v:'Yes' },
            ].map(d => (
              <div key={d.k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderTop:`1px solid ${t.ink}0c` }}>
                <CLabel>{d.k}</CLabel>
                <CMono size={11} color={`${t.ink}b0`}>{d.v}</CMono>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CoachShell>
  );
}
