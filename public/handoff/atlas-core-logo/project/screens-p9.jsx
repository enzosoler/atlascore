// screens-p9.jsx — atlas.core · phase 09 · batch A (S51–S57)
// Nutrition + workout history + composition + coach insight.
// Uses screens-lib atoms; renders at 360×780 via ACScreen.

// ══════════════════════════════════════════════════════════════
// S51 — FOOD DIARY
// Canonical ref: dashboard of today's meals, kcal + macro bar,
// 4 meal rows with items, quick-add capture strip
// ══════════════════════════════════════════════════════════════
function S51_Food_Diary({ dark }) {
  const c = useACT(dark);
  const meals = [
    { t: 'breakfast', time: '06 · 42', kcal: 420, items: ['3 eggs · 1 yolk bowl', 'oatmeal · 40 g', 'black coffee'] },
    { t: 'lunch',     time: '12 · 18', kcal: 780, items: ['sirloin · 220 g', 'jasmine rice · 180 g', 'kimchi'] },
    { t: 'snack',     time: '15 · 50', kcal: 210, items: ['greek yogurt · 200 g', 'blueberries'] },
    { t: 'dinner',    time: '— · —',   kcal: null, items: [] },
  ];
  const target = 2680;
  const logged = meals.reduce((s, m) => s + (m.kcal || 0), 0);
  const pct = logged / target;

  return (<>
      <ACHeader sub="THU · APR 24" title="Eat" right={
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <ACDot /><ACMono size={10} color={c.dim}>REMAIN {target - logged}</ACMono>
        </div>
      } dark={dark} />

      {/* kcal hero row */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          background: c.card, padding: '18px 18px 16px',
          borderRadius: ACRadii.card,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div>
              <ACMono size={10} color={c.mute} track={1.6}>KCAL · LOGGED</ACMono>
              <div style={{ marginTop: 6 }}>
                <ACNum size={42} color={c.fg}>{logged}</ACNum>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 13, color: c.dim, marginLeft: 6 }}>/ {target}</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <ACMono size={10} color={c.mute} track={1.6}>TARGET</ACMono>
              <div style={{ marginTop: 6 }}>
                <ACNum size={22} color={c.dim}>{Math.round(pct*100)}%</ACNum>
              </div>
            </div>
          </div>
          {/* segmented bar */}
          <div style={{ display:'flex', gap:3, marginTop:14, height:4 }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const on = i / 24 < pct;
              return <div key={i} style={{ flex:1, background: on ? c.accent : c.hair }} />;
            })}
          </div>
          {/* macro triad */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:16 }}>
            {[
              { k:'PROTEIN', v:128, tgt:180, unit:'g' },
              { k:'CARBS',   v:142, tgt:280, unit:'g' },
              { k:'FAT',     v:56,  tgt:90,  unit:'g' },
            ].map(m => (
              <div key={m.k}>
                <ACMono size={9} color={c.mute} track={1.4}>{m.k}</ACMono>
                <div style={{ marginTop:4, display:'flex', alignItems:'baseline', gap:3 }}>
                  <ACNum size={18} color={c.fg}>{m.v}</ACNum>
                  <span style={{ fontFamily: ACFonts.mono, fontSize:10, color:c.dim }}>/ {m.tgt}{m.unit}</span>
                </div>
                <div style={{ height:2, background:c.hair, marginTop:6 }}>
                  <div style={{ height:'100%', width:`${(m.v/m.tgt)*100}%`, background:c.fg }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* capture strip */}
      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { k:'scan',    label:'Scan' },
            { k:'camera',  label:'Snap' },
            { k:'voice',   label:'Say' },
            { k:'recents', label:'Again' },
          ].map(btn => (
            <div key={btn.k} style={{
              flex:1, padding:'12px 8px',
              background:c.card, borderRadius:ACRadii.button,
              display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            }}>
              <CaptureIcon k={btn.k} color={c.fg} accent={c.accent} />
              <span style={{ fontFamily:ACFonts.body, fontSize:11, fontWeight:600, color:c.fg, letterSpacing:-0.1 }}>{btn.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* meal list */}
      <div style={{ padding:'0 20px 8px', flex:1, overflow:'auto' }}>
        {meals.map((m, i) => (
          <div key={m.t} style={{ padding:'14px 0', borderTop: i===0 ? 'none' : `1px solid ${c.hair}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                <span style={{ fontFamily:ACFonts.display, fontSize:17, fontWeight:600, color:c.fg, letterSpacing:-0.3, textTransform:'capitalize' }}>{m.t}</span>
                <ACMono size={10} color={c.mute}>{m.time}</ACMono>
              </div>
              {m.kcal != null ? (
                <ACNum size={18} color={c.fg}>{m.kcal}</ACNum>
              ) : (
                <ACChip dark={dark}>+ Log</ACChip>
              )}
            </div>
            {m.items.map((it, j) => (
              <div key={j} style={{ fontFamily:ACFonts.body, fontSize:14, color:c.dim, padding:'3px 0' }}>{it}</div>
            ))}
          </div>
        ))}
      </div>

      <ACTabBar active="eat" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S52 — MACRO TARGETS (editor)
// ══════════════════════════════════════════════════════════════
function S52_Macro_Targets({ dark }) {
  const c = useACT(dark);
  return (<>
      <ACHeader sub="EAT · SETTINGS" title="Macro targets" dark={dark} />

      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ background:c.card, padding:18, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.mute} track={1.6}>DAILY ENERGY</ACMono>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:6 }}>
            <ACNum size={48} color={c.fg}>2,680</ACNum>
            <span style={{ fontFamily:ACFonts.mono, fontSize:12, color:c.dim }}>kcal · day</span>
          </div>
          <div style={{ height:2, background:c.hair, marginTop:14, position:'relative' }}>
            <div style={{ position:'absolute', left:'62%', top:-4, width:2, height:10, background:c.accent }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <ACMono size={9} color={c.mute}>1,800</ACMono>
            <ACMono size={9} color={c.accent}>2,680</ACMono>
            <ACMono size={9} color={c.mute}>3,600</ACMono>
          </div>
        </div>
      </div>

      {/* macro split */}
      <div style={{ padding:'0 20px 16px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>SPLIT · %</ACMono>
        <div style={{ display:'flex', height:14, marginBottom:14 }}>
          <div style={{ width:'27%', background:c.fg }} />
          <div style={{ width:'43%', background:c.accent }} />
          <div style={{ width:'30%', background:c.dim }} />
        </div>
        {[
          { k:'PROTEIN', pct:27, g:180, per:'2.0 g · kg' },
          { k:'CARBS',   pct:43, g:288, per:'3.2 g · kg' },
          { k:'FAT',     pct:30, g:89,  per:'1.0 g · kg' },
        ].map((m, i) => (
          <div key={m.k} style={{ padding:'14px 0', borderTop: i===0 ? `1px solid ${c.hair}` : `1px solid ${c.hair}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <ACMono size={11} color={c.fg} track={1.4}>{m.k}</ACMono>
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <ACNum size={20} color={c.fg}>{m.g}</ACNum>
                <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.dim }}>g · {m.pct}%</span>
              </div>
            </div>
            <ACMono size={10} color={c.mute} style={{ marginTop:4, display:'block' }}>{m.per}</ACMono>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 20px 20px' }}>
        <ACBtn primary block dark={dark}>Save targets</ACBtn>
      </div>

      <div style={{ padding:'0 20px 16px' }}>
        <ACMono size={10} color={c.mute} track={1.4}>BASED ON YOUR CURRENT BODY MASS AND TRAINING LOAD.</ACMono>
      </div>

      <div style={{ flex:1 }} />
      <ACTabBar active="eat" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S53 — WATER LOG
// ══════════════════════════════════════════════════════════════
function S53_Water_Log({ dark }) {
  const c = useACT(dark);
  const entries = [
    { time:'06 · 15', amt:500 },
    { time:'08 · 30', amt:350 },
    { time:'10 · 45', amt:500 },
    { time:'13 · 10', amt:500 },
    { time:'15 · 22', amt:250 },
  ];
  const total = entries.reduce((s,e)=>s+e.amt,0);
  const target = 3200;

  return (<>
      <ACHeader sub="EAT · WATER" title="Hydration" dark={dark} />

      <div style={{ padding:'0 20px 20px', display:'flex', gap:14 }}>
        <div style={{ flex:1, background:c.card, padding:18, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.mute} track={1.6}>TODAY · ML</ACMono>
          <div style={{ marginTop:6 }}>
            <ACNum size={36} color={c.fg}>{total.toLocaleString()}</ACNum>
          </div>
          <div style={{ display:'flex', gap:3, marginTop:12, height:56 }}>
            {Array.from({ length:8 }).map((_, i) => {
              const filled = i < Math.floor((total/target)*8);
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column-reverse' }}>
                  <div style={{ height:'100%', background: filled ? c.accent : c.hair }} />
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ width:120, background:c.card, padding:18, borderRadius:ACRadii.card, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <ACMono size={10} color={c.mute} track={1.6}>TARGET</ACMono>
            <div style={{ marginTop:6 }}><ACNum size={20} color={c.fg}>{target/1000}L</ACNum></div>
          </div>
          <div>
            <ACMono size={10} color={c.mute} track={1.6}>REMAIN</ACMono>
            <div style={{ marginTop:6 }}><ACNum size={16} color={c.accent}>{((target-total)/1000).toFixed(1)}L</ACNum></div>
          </div>
        </div>
      </div>

      {/* quick add */}
      <div style={{ padding:'0 20px 20px' }}>
        <div style={{ display:'flex', gap:8 }}>
          {[250, 500, 750, 1000].map(v => (
            <div key={v} style={{ flex:1, background:c.card, padding:'14px 0', borderRadius:ACRadii.button, textAlign:'center' }}>
              <ACNum size={18} color={c.fg}>+{v}</ACNum>
              <div style={{ marginTop:2 }}><ACMono size={9} color={c.mute}>ML</ACMono></div>
            </div>
          ))}
        </div>
      </div>

      {/* log */}
      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>LOG · {entries.length} ENTRIES</ACMono>
        {entries.map((e, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderTop: `1px solid ${c.hair}` }}>
            <ACMono size={12} color={c.dim}>{e.time}</ACMono>
            <ACNum size={17} color={c.fg}>{e.amt} ml</ACNum>
          </div>
        ))}
      </div>

      <ACTabBar active="eat" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S54 — WORKOUT HISTORY
// ══════════════════════════════════════════════════════════════
function S54_Workout_History({ dark }) {
  const c = useACT(dark);
  const weeks = [
    { w:'APR 22', items:[
      { d:'THU', name:'Push · B', vol:'12.4 t', time:'58 m', pr:true, stamp:'B' },
      { d:'TUE', name:'Pull · A', vol:'10.8 t', time:'62 m', stamp:'P' },
      { d:'MON', name:'Legs · A', vol:'18.2 t', time:'71 m', stamp:'S' },
    ]},
    { w:'APR 15', items:[
      { d:'SUN', name:'Push · A', vol:'11.1 t', time:'54 m', stamp:'B' },
      { d:'FRI', name:'Pull · B', vol:'9.8 t',  time:'49 m', stamp:'P' },
      { d:'WED', name:'Legs · B', vol:'16.4 t', time:'65 m', stamp:'S' },
      { d:'MON', name:'Push · B', vol:'12.2 t', time:'55 m', stamp:'B' },
    ]},
  ];

  return (<>
      <ACHeader sub="TRAIN" title="History" right={
        <ACMono size={10} color={c.dim} track={1.4}>7 · 30 · ALL</ACMono>
      } dark={dark} />

      {/* strip stats */}
      <div style={{ padding:'0 20px 18px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { k:'SESSIONS', v:'27', sub:'last 30 d' },
            { k:'VOLUME',   v:'324 t', sub:'last 30 d' },
            { k:'PRs',      v:'4',  sub:'this month', hl:true },
          ].map(s => (
            <div key={s.k} style={{ background:c.card, padding:14, borderRadius:ACRadii.card }}>
              <ACMono size={9} color={c.mute} track={1.4}>{s.k}</ACMono>
              <div style={{ marginTop:6 }}><ACNum size={22} color={s.hl ? c.accent : c.fg}>{s.v}</ACNum></div>
              <ACMono size={9} color={c.mute} style={{ marginTop:4, display:'block' }}>{s.sub}</ACMono>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        {weeks.map(w => (
          <div key={w.w} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
              <ACMono size={10} color={c.mute} track={1.6}>WEEK · {w.w}</ACMono>
              <ACMono size={10} color={c.dim} track={1.4}>{w.items.length} SESSIONS</ACMono>
            </div>
            {w.items.map((it, i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'auto 1fr auto',
                alignItems:'center', gap:14,
                padding:'12px 0', borderTop:`1px solid ${c.hair}`,
              }}>
                <div style={{
                  width:36, height:36, background:c.card2, borderRadius:10,
                  display:'grid', placeItems:'center',
                  fontFamily:ACFonts.mono, fontSize:13, fontWeight:700, color:c.fg,
                }}>{it.stamp}</div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:600, color:c.fg, letterSpacing:-0.2 }}>{it.name}</span>
                    {it.pr && <span style={{ padding:'1px 6px', background:c.accent, color:c.ink, fontFamily:ACFonts.mono, fontSize:8, fontWeight:700, letterSpacing:1 }}>PR</span>}
                  </div>
                  <ACMono size={10} color={c.mute} style={{ marginTop:3, display:'block' }}>{it.d} · {it.time}</ACMono>
                </div>
                <div style={{ textAlign:'right' }}>
                  <ACNum size={16} color={c.fg}>{it.vol}</ACNum>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <ACTabBar active="train" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S55 — WORKOUT DETAIL
// ══════════════════════════════════════════════════════════════
function S55_Workout_Detail({ dark }) {
  const c = useACT(dark);
  const lifts = [
    { n:'Bench press',    sets:[{ r:5, w:235 },{ r:5, w:245, pr:true },{ r:5, w:245 },{ r:3, w:255 }] },
    { n:'OHP',            sets:[{ r:5, w:135 },{ r:5, w:145 },{ r:5, w:145 }] },
    { n:'Incline DB',     sets:[{ r:8, w:75 },{ r:8, w:75 },{ r:8, w:75 }] },
    { n:'Triceps rope',   sets:[{ r:12, w:45 },{ r:12, w:50 },{ r:10, w:55 }] },
  ];

  return (<>
      <ACHeader sub="THU · APR 22" title="Push · B" right={
        <ACChip accent dot dark={dark}>PR</ACChip>
      } dark={dark} />

      <div style={{ padding:'0 20px 18px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { k:'VOLUME', v:'12.4', sub:'tonnes' },
            { k:'TIME',   v:'58',   sub:'min' },
            { k:'RPE·AVG',v:'7.8',  sub:'of 10' },
          ].map(s => (
            <div key={s.k} style={{ background:c.card, padding:14, borderRadius:ACRadii.card }}>
              <ACMono size={9} color={c.mute} track={1.4}>{s.k}</ACMono>
              <div style={{ marginTop:6 }}><ACNum size={22} color={c.fg}>{s.v}</ACNum></div>
              <ACMono size={9} color={c.mute} style={{ marginTop:4, display:'block' }}>{s.sub}</ACMono>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        {lifts.map((l, i) => (
          <div key={i} style={{ marginBottom:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
              <div style={{ fontFamily:ACFonts.display, fontSize:17, fontWeight:600, color:c.fg, letterSpacing:-0.3 }}>{l.n}</div>
              <ACMono size={10} color={c.mute} track={1.4}>{l.sets.length} SETS</ACMono>
            </div>
            {l.sets.map((s, j) => (
              <div key={j} style={{
                display:'grid', gridTemplateColumns:'24px 1fr auto',
                alignItems:'center', gap:14, padding:'10px 0',
                borderTop: j===0 ? `1px solid ${c.hair}` : `1px solid ${c.hair}`,
              }}>
                <ACMono size={11} color={c.mute}>{String(j+1).padStart(2,'0')}</ACMono>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontFamily:ACFonts.mono, fontSize:13, color:c.fg, fontVariantNumeric:'tabular-nums' }}>{s.r} × {s.w}</span>
                  {s.pr && <span style={{ padding:'1px 5px', background:c.accent, color:c.ink, fontFamily:ACFonts.mono, fontSize:8, fontWeight:700, letterSpacing:1 }}>PR</span>}
                </div>
                <ACMono size={10} color={c.dim}>{s.w}·lb</ACMono>
              </div>
            ))}
          </div>
        ))}
      </div>

      <ACTabBar active="train" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S56 — COMPOSITION HISTORY
// ══════════════════════════════════════════════════════════════
function S56_Composition_History({ dark }) {
  const c = useACT(dark);
  const data = Array.from({ length: 30 }).map((_, i) => ({
    v: 178 + Math.sin(i * 0.6) * 1.1 - i * 0.04,
  }));

  return (<>
      <ACHeader sub="BODY" title="Composition" right={
        <ACMono size={10} color={c.dim} track={1.4}>30D · 3M · 1Y</ACMono>
      } dark={dark} />

      <div style={{ padding:'0 20px 18px' }}>
        <div style={{ background:c.card, padding:18, borderRadius:ACRadii.card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div>
              <ACMono size={10} color={c.mute} track={1.6}>WEIGHT · LB</ACMono>
              <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:8 }}>
                <ACNum size={44} color={c.fg}>176.8</ACNum>
                <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.accent }}>− 1.4 · 30d</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <ACMono size={10} color={c.mute} track={1.6}>BF · %</ACMono>
              <div style={{ marginTop:6 }}><ACNum size={22} color={c.fg}>14.2</ACNum></div>
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <ACLine data={data} w={300} h={120} dark={dark} />
          </div>
        </div>
      </div>

      {/* sub-metrics */}
      <div style={{ padding:'0 20px 18px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { k:'LEAN MASS', v:'151.7',unit:'lb', d:'+ 0.4' },
            { k:'FAT MASS',  v:'25.1', unit:'lb', d:'− 1.8' },
            { k:'WAIST',     v:'32.0', unit:'in', d:'− 0.5' },
          ].map(s => (
            <div key={s.k} style={{ background:c.card, padding:14, borderRadius:ACRadii.card }}>
              <ACMono size={9} color={c.mute} track={1.4}>{s.k}</ACMono>
              <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:4 }}>
                <ACNum size={18} color={c.fg}>{s.v}</ACNum>
                <span style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.dim }}>{s.unit}</span>
              </div>
              <ACMono size={9} color={c.accent} style={{ marginTop:4, display:'block' }}>{s.d}</ACMono>
            </div>
          ))}
        </div>
      </div>

      {/* recent scans */}
      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>RECENT SCANS</ACMono>
        {[
          { d:'APR 20', w:176.8, bf:14.2 },
          { d:'APR 13', w:177.4, bf:14.6 },
          { d:'APR 06', w:178.2, bf:15.1 },
          { d:'MAR 30', w:178.2, bf:15.3 },
        ].map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'12px 0', borderTop:`1px solid ${c.hair}` }}>
            <ACMono size={12} color={c.dim}>{r.d}</ACMono>
            <div style={{ textAlign:'right' }}><ACNum size={15} color={c.fg}>{r.w}</ACNum><span style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.dim }}> lb</span></div>
            <div style={{ textAlign:'right' }}><ACNum size={15} color={c.fg}>{r.bf}</ACNum><span style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.dim }}> %</span></div>
          </div>
        ))}
      </div>

      <ACTabBar active="body" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S57 — COACH INSIGHT (a single deep-read)
// ══════════════════════════════════════════════════════════════
function S57_Coach_Insight({ dark }) {
  const c = useACT(dark);
  return (<>
      <ACHeader sub="COACH · INSIGHT" title="Your HRV is drifting." dark={dark} />

      <div style={{ padding:'0 20px 14px' }}>
        <ACMono size={10} color={c.mute} track={1.6}>APR 24 · 06 · 48</ACMono>
      </div>

      <div style={{ padding:'0 20px 18px' }}>
        <div style={{ background:c.card, padding:18, borderRadius:ACRadii.card }}>
          <div style={{ fontFamily:ACFonts.display, fontSize:17, fontWeight:400, lineHeight:1.5, color:c.fg, letterSpacing:-0.2 }}>
            Your 7-day average HRV has fallen from 78 to 64 ms. RHR is up 4 bpm. Sleep stage mix has shifted toward light.
          </div>
          <div style={{ marginTop:14 }}>
            <ACSpark w={300} h={60} dark={dark} />
          </div>
        </div>
      </div>

      <div style={{ padding:'0 20px 18px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:12, display:'block' }}>LIKELY FACTORS</ACMono>
        {[
          { k:'01', l:'Three high-RPE sessions in the past 5 days.' },
          { k:'02', l:'Average sleep under target · 6 h 14 m.' },
          { k:'03', l:'Alcohol logged twice this week.' },
        ].map(r => (
          <div key={r.k} style={{ display:'grid', gridTemplateColumns:'32px 1fr', padding:'10px 0', borderTop:`1px solid ${c.hair}` }}>
            <ACMono size={11} color={c.accent} track={1.4}>{r.k}</ACMono>
            <div style={{ fontFamily:ACFonts.body, fontSize:14, color:c.fg, lineHeight:1.5 }}>{r.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 20px 18px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:12, display:'block' }}>RECOMMENDATION</ACMono>
        <div style={{ background:c.ink, color:c.paper, padding:18, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ marginBottom:8, display:'block' }}>DIAL IT BACK · 72 HRS</ACMono>
          <div style={{ fontFamily:ACFonts.display, fontSize:18, fontWeight:600, color:c.paper, letterSpacing:-0.3, lineHeight:1.35 }}>
            Swap tomorrow's push session for mobility + 40 min Z2. Re-evaluate Saturday.
          </div>
        </div>
      </div>

      <div style={{ padding:'0 20px 20px', display:'flex', gap:10 }}>
        <ACBtn primary dark={dark} style={{ flex:1, justifyContent:'center' }}>Apply to plan</ACBtn>
        <ACBtn dark={dark} style={{ flex:1, justifyContent:'center' }}>Remind me</ACBtn>
      </div>

      <div style={{ flex:1 }} />
      <ACTabBar active="today" dark={dark} />
  </>  );
}

Object.assign(window, {
  S51_Food_Diary, S52_Macro_Targets, S53_Water_Log,
  S54_Workout_History, S55_Workout_Detail,
  S56_Composition_History, S57_Coach_Insight,
});
