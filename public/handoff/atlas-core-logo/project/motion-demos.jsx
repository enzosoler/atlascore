// motion-demos.jsx — eight live looping demos for Motion.html

const COL = {
  ink:'#0a0a0a', bg:'#efe9da', accent:'#e8b500',
  dim:'rgba(10,10,10,0.55)', line:'rgba(10,10,10,0.12)',
  soft:'rgba(10,10,10,0.04)',
};
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';
const FONT_DISPLAY = '"Archivo Black", sans-serif';

// ── helpers ─────────────────────────────────
function useLoop(duration, deps=[], pause=600) {
  // Returns t (0→1) that loops. Pauses pause ms after each cycle.
  const [t, setT] = React.useState(0);
  const [key, setKey] = React.useState(0);
  React.useEffect(() => {
    let raf, start = performance.now();
    const tick = now => {
      const el = now - start;
      if (el < duration) {
        setT(el / duration);
        raf = requestAnimationFrame(tick);
      } else {
        setT(1);
        setTimeout(() => {
          start = performance.now();
          setT(0);
          setKey(k => k+1);
          raf = requestAnimationFrame(tick);
        }, pause);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, ...deps]);
  const replay = () => { setT(0); setKey(k => k+1); };
  return [t, replay];
}
const Easing = {
  aceEase:     t => 1 - Math.pow(1-t, 3),                    // cubic-out
  aceEmphasis: t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2,
  acePhysical: t => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); },
  aceLinear:   t => t,
};

// ── card shell ──────────────────────────────
function DemoCard({ id, title, spec, children, onReplay }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-l">
          <span className="card-id">M·{id}</span>
          <span className="card-title">{title}</span>
        </div>
        <button className="card-replay" onClick={onReplay}>↻ replay</button>
      </div>
      <div className="card-stage">{children}</div>
      <div className="card-spec">
        {spec.map((s,i) => (
          <React.Fragment key={i}>
            <div className="spec-k">{s[0]}</div>
            <div className="spec-v" style={{ gridColumn: 'span 2' }}>{s[1]}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── M01 · READINESS RING COUNT-UP ───────────
function M01() {
  const [t, replay] = useLoop(1400);
  const e = Easing.aceEmphasis(t);
  const target = 87;
  const shown = Math.round(e * target);
  const circ = 2 * Math.PI * 72;
  const dash = circ * (1 - e * (target/100));
  return (
    <DemoCard id="01" title="readiness · count-up" onReplay={replay}
      spec={[['curve','ac-emphasis'], ['duration','1400ms'], ['trigger','today screen open']]}>
      <div style={{ position:'relative', width:200, height:200 }}>
        <svg width="200" height="200" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(10,10,10,0.08)" strokeWidth="8" />
          <circle cx="100" cy="100" r="72" fill="none" stroke={COL.accent} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:54, letterSpacing:-2, lineHeight:1 }}>{shown}</div>
          <div style={{ fontFamily:FONT_MONO, fontSize:10, letterSpacing:1.6, color:COL.dim, textTransform:'uppercase', marginTop:6 }}>READINESS</div>
        </div>
      </div>
    </DemoCard>
  );
}

// ── M02 · TAB SWITCH ──────────────────────────
function M02() {
  const [t, replay] = useLoop(600);
  const e = Easing.aceEase(t);
  const tabs = ['today','move','eat','body','you'];
  // underline slides from 0 → 2
  const fromIdx = 0, toIdx = 2;
  const x = fromIdx + (toIdx - fromIdx) * e;
  return (
    <DemoCard id="02" title="tab · underline slide" onReplay={replay}
      spec={[['curve','ac-ease'], ['duration','600ms'], ['trigger','tap tab']]}>
      <div style={{ width: 320, background: COL.bg, border: `1px solid ${COL.line}`, padding: '16px 0 0' }}>
        <div style={{ display:'flex', padding:'0 20px', position:'relative' }}>
          {tabs.map((tab,i) => (
            <div key={i} style={{
              flex:1, padding:'6px 0 14px', textAlign:'center',
              fontFamily:FONT_MONO, fontSize:10, letterSpacing:1.6, textTransform:'uppercase',
              color: i === Math.round(x) ? COL.ink : COL.dim,
              transition:'color 200ms',
            }}>{tab}</div>
          ))}
          <div style={{
            position:'absolute', bottom:0, left:`calc(20px + ${x * (280/5)}px)`,
            width:`${280/5}px`, height:2, background:COL.accent,
          }} />
        </div>
      </div>
    </DemoCard>
  );
}

// ── M03 · PR CELEBRATION ──────────────────────
function M03() {
  const [t, replay] = useLoop(2800, [], 900);
  // three phases: 0-0.2 stamp lands, 0.2-0.5 ECG draws, 0.5-0.8 number counts, 0.8-1 settle
  const stampIn = t < 0.2 ? Easing.acePhysical(t/0.2) : 1;
  const ecgT = t < 0.2 ? 0 : t < 0.6 ? (t-0.2)/0.4 : 1;
  const numT = t < 0.35 ? 0 : t < 0.75 ? Easing.aceEase((t-0.35)/0.4) : 1;
  const finalNum = Math.round(numT * 415);

  // ECG path draw
  const ecgPath = "M0 30 L30 30 L40 30 L55 12 L68 48 L82 30 L120 30 L132 8 L144 52 L156 30 L240 30";
  const ecgLen = 380;

  return (
    <DemoCard id="03" title="PR · celebration (ECG + stamp + count)" onReplay={replay}
      spec={[['curves','physical → ecg → ease'], ['duration','2800ms'], ['trigger','new PR recorded']]}>
      <div style={{ position:'relative', width:300, height:220, background:COL.ink, color:COL.bg, padding:24 }}>
        {/* Top stamp */}
        <div style={{
          transform:`scale(${0.6 + stampIn*0.4}) rotate(${(stampIn-1)*6}deg)`,
          opacity: stampIn, transformOrigin:'left top',
        }}>
          <span style={{
            fontFamily:FONT_MONO, fontSize:10, letterSpacing:2, fontWeight:700,
            background:COL.accent, color:COL.ink, padding:'2px 8px',
          }}>NEW · PR</span>
        </div>

        {/* Big number */}
        <div style={{
          marginTop:14, fontFamily:FONT_DISPLAY, fontSize:72, letterSpacing:-3, lineHeight:0.9,
          opacity: numT > 0 ? 1 : 0,
        }}>
          {finalNum}
          <span style={{ fontFamily:FONT_MONO, fontSize:14, letterSpacing:1.4, marginLeft:6, color:COL.accent }}>LB</span>
        </div>

        {/* ECG trace */}
        <svg width="240" height="60" viewBox="0 0 240 60" style={{ position:'absolute', bottom:20, left:24 }}>
          <path d={ecgPath} fill="none" stroke={COL.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={ecgLen}
            strokeDashoffset={ecgLen * (1 - ecgT)} />
        </svg>
      </div>
    </DemoCard>
  );
}

// ── M04 · SWIPE TO LOG ────────────────────────
function M04() {
  const [t, replay] = useLoop(2000, [], 500);
  // 0-0.35 swipe right, 0.35-0.55 check appears, 0.55-0.85 row collapses, 0.85-1 settle
  const drag = t < 0.35 ? Easing.aceEase(t/0.35) : t < 0.55 ? 1 : Math.max(0, 1 - (t-0.55)/0.3);
  const x = drag * 140;
  const check = t > 0.35 && t < 0.85 ? Easing.acePhysical(Math.min(1, (t-0.35)/0.2)) : t >= 0.85 ? 1 - (t-0.85)/0.15 : 0;
  const height = t < 0.55 ? 72 : 72 * (1 - Math.min(1, (t-0.55)/0.3));
  const fade = t < 0.55 ? 1 : Math.max(0, 1 - (t-0.55)/0.3);

  return (
    <DemoCard id="04" title="swipe-to-log · complete set" onReplay={replay}
      spec={[['curves','ease → physical → ease'], ['duration','2000ms'], ['trigger','swipe set row right']]}>
      <div style={{ width:300, background:COL.bg, border:`1px solid ${COL.line}`, overflow:'hidden' }}>
        {/* Green bg w/ check */}
        <div style={{ position:'relative', height, overflow:'hidden', opacity:fade }}>
          <div style={{ position:'absolute', inset:0, background:'#2a7a47', display:'flex', alignItems:'center', paddingLeft:18 }}>
            <div style={{
              transform:`scale(${check})`, color:'#fff', fontFamily:FONT_DISPLAY, fontSize:22,
            }}>✓</div>
          </div>
          <div style={{
            position:'relative', transform:`translateX(${x}px)`,
            background:COL.bg, height:'100%', padding:'14px 18px',
            display:'flex', alignItems:'center', gap:14,
          }}>
            <div style={{ fontFamily:FONT_DISPLAY, fontSize:20, width:36 }}>03</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Set · 95 kg × 5</div>
              <div style={{ fontFamily:FONT_MONO, fontSize:10, letterSpacing:1.2, color:COL.dim, marginTop:2, textTransform:'uppercase' }}>RPE 8 · REST 2:00</div>
            </div>
          </div>
        </div>
      </div>
    </DemoCard>
  );
}

// ── M05 · PULL TO REFRESH (ECG flat → pulse) ──
function M05() {
  const [t, replay] = useLoop(2200, [], 600);
  // 0-0.3 pull down, 0.3-0.45 release snap, 0.45-0.9 ECG pulse spinner, 0.9-1 snap back
  const pull = t < 0.3 ? t/0.3 : t < 0.45 ? 1 - (t-0.3)/0.15 * 0.3 : 0.7;
  const h = t < 0.9 ? pull * 52 : Math.max(0, (1-t)/0.1 * 36);
  // ECG scrolling across while loading
  const pulseT = t > 0.3 && t < 0.9 ? (t - 0.3) / 0.6 : 0;
  const dashOffset = -pulseT * 200;

  return (
    <DemoCard id="05" title="pull-to-refresh · ECG spinner" onReplay={replay}
      spec={[['curves','ease · ecg loop'], ['duration','2200ms'], ['trigger','drag content down 60px+']]}>
      <div style={{ width:260, background:COL.bg, border:`1px solid ${COL.line}`, overflow:'hidden' }}>
        <div style={{ height:h, background:COL.soft, display:'grid', placeItems:'center', transition:'none' }}>
          <svg width="120" height="24" viewBox="0 0 120 24">
            <path d="M0 12 L24 12 L32 4 L40 20 L48 12 L72 12 L80 4 L88 20 L96 12 L120 12"
              fill="none" stroke={COL.accent} strokeWidth="1.6"
              strokeDasharray="40 200" strokeDashoffset={dashOffset} />
          </svg>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ fontFamily:FONT_MONO, fontSize:9, letterSpacing:1.4, color:COL.dim, textTransform:'uppercase' }}>INBOX</div>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:26, letterSpacing:-0.8, marginTop:4 }}>3 new signals.</div>
        </div>
      </div>
    </DemoCard>
  );
}

// ── M06 · ECG TRACE DRAW-IN ───────────────────
function M06() {
  const [t, replay] = useLoop(1600);
  const len = 520;
  // Linear stepped draw (the signature ECG feel — not smooth)
  const e = t;
  return (
    <DemoCard id="06" title="ECG · trace draw-in (hero)" onReplay={replay}
      spec={[['curve','ac-ecg (stepped linear)'], ['duration','1600ms'], ['trigger','screen load / labs land']]}>
      <div style={{ width:360, background:COL.bg, padding:20 }}>
        <div style={{ fontFamily:FONT_MONO, fontSize:10, letterSpacing:1.6, color:COL.dim, textTransform:'uppercase' }}>LAST 30 DAYS · READINESS</div>
        <svg width="320" height="80" viewBox="0 0 320 80" style={{ marginTop:10 }}>
          <path d="M0 60 L24 60 L32 42 L40 68 L48 54 L80 54 L88 30 L96 70 L104 46 L140 46 L148 22 L156 58 L164 38 L200 38 L208 8 L216 50 L224 30 L260 30 L268 14 L276 44 L284 24 L320 24"
            fill="none" stroke={COL.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - e)} />
        </svg>
      </div>
    </DemoCard>
  );
}

// ── M07 · SHEET PRESENTATION ──────────────────
function M07() {
  const [t, replay] = useLoop(2400, [], 600);
  const upT = t < 0.35 ? Easing.aceEmphasis(t/0.35) : t < 0.85 ? 1 : Math.max(0, 1 - (t-0.85)/0.15);
  const scrimT = Math.min(1, upT * 1.2);
  const sheetY = 180 * (1 - upT);
  return (
    <DemoCard id="07" title="sheet · slide up from bottom" onReplay={replay}
      spec={[['curve','ac-emphasis'], ['duration','340ms in · 220ms out'], ['trigger','open log / modal']]}>
      <div style={{ width:240, height:260, background:COL.bg, border:`1px solid ${COL.line}`, position:'relative', overflow:'hidden' }}>
        {/* bg content */}
        <div style={{ padding:16 }}>
          <div style={{ fontFamily:FONT_MONO, fontSize:9, letterSpacing:1.4, color:COL.dim, textTransform:'uppercase' }}>TODAY</div>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:22, letterSpacing:-0.6, marginTop:4 }}>Readiness 87</div>
        </div>
        {/* scrim */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', opacity:scrimT, pointerEvents:'none' }} />
        {/* sheet */}
        <div style={{
          position:'absolute', left:0, right:0, bottom:0, height:180,
          background:COL.ink, color:COL.bg, transform:`translateY(${sheetY}px)`,
          padding:18,
        }}>
          <div style={{ width:40, height:3, background:`${COL.bg}40`, margin:'0 auto 14px' }} />
          <div style={{ fontFamily:FONT_MONO, fontSize:9, letterSpacing:1.4, color:COL.accent, textTransform:'uppercase' }}>LOG · DOSE</div>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:20, letterSpacing:-0.4, marginTop:4 }}>TRT · 100mg</div>
          <div style={{ marginTop:14, display:'flex', gap:6 }}>
            <div style={{ flex:1, padding:'8px 0', background:COL.accent, color:COL.ink, textAlign:'center', fontSize:12, fontWeight:700 }}>TAKEN</div>
            <div style={{ flex:1, padding:'8px 0', border:`1px solid ${COL.bg}40`, textAlign:'center', fontSize:12, fontWeight:600 }}>SKIP</div>
          </div>
        </div>
      </div>
    </DemoCard>
  );
}

// ── M08 · TOAST LIFE ──────────────────────────
function M08() {
  const [t, replay] = useLoop(3400, [], 400);
  // 0-0.1 in, 0.1-0.85 hold, 0.85-1 out
  const inT  = t < 0.1 ? Easing.aceEmphasis(t/0.1) : 1;
  const outT = t > 0.85 ? Easing.aceEase((t-0.85)/0.15) : 0;
  const op = inT * (1 - outT);
  const y = (1-inT) * 40 + outT * -20;
  const progress = t < 0.1 ? 0 : t < 0.85 ? (t-0.1)/0.75 : 1;

  return (
    <DemoCard id="08" title="toast · ambient confirm" onReplay={replay}
      spec={[['curves','emphasis in · ease out'], ['duration','3000ms total · 2.5s hold'], ['trigger','meal logged / set saved']]}>
      <div style={{ width:280, height:200, position:'relative', overflow:'hidden', background:COL.bg, border:`1px solid ${COL.line}` }}>
        {/* bg stub */}
        <div style={{ padding:16 }}>
          <div style={{ fontFamily:FONT_MONO, fontSize:9, letterSpacing:1.4, color:COL.dim, textTransform:'uppercase' }}>BREAKFAST</div>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:20, letterSpacing:-0.4, marginTop:4 }}>642 kcal</div>
        </div>
        {/* toast */}
        <div style={{
          position:'absolute', left:14, right:14, bottom:14,
          background:COL.ink, color:COL.bg,
          transform:`translateY(${y}px)`, opacity:op,
          padding:'12px 14px',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:18, height:18, background:COL.accent, color:COL.ink, display:'grid', placeItems:'center', fontFamily:FONT_MONO, fontSize:10, fontWeight:700 }}>✓</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600 }}>Logged · 642 kcal</div>
              <div style={{ fontFamily:FONT_MONO, fontSize:9, letterSpacing:1.2, color:`${COL.bg}90`, textTransform:'uppercase', marginTop:2 }}>UNDO</div>
            </div>
          </div>
          <div style={{ marginTop:10, height:2, background:`${COL.bg}18` }}>
            <div style={{ width:`${progress*100}%`, height:'100%', background:COL.accent }} />
          </div>
        </div>
      </div>
    </DemoCard>
  );
}

// ── mount ────────────────────────────────────
function Demos() {
  return <>
    <M01/><M02/><M03/><M04/>
    <M05/><M06/><M07/><M08/>
  </>;
}
ReactDOM.createRoot(document.getElementById('demos')).render(<Demos/>);
