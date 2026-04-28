// screens-p13.jsx — atlas.core · phase 15 · redesign-set gap fills (S76–S86)
//   S76 · public profile        — shareable athlete card (external view)
//   S77 · lab upload            — drop / photograph / request a panel
//   S78 · lab exam detail       — full panel breakdown, 84 markers
//   S79 · lab history           — timeline of panels over years
//   S80 · routine presets       — library of saved training presets
//   S81 · routine preset detail — one preset, full breakdown
//   S82 · meal detail           — one saved meal, macro + source breakdown
//   S83 · offline               — "we're not connected" + local queue
//   S84 · server error          — 500 / ECG flatline
//   S85 · maintenance           — scheduled downtime notice
//   S86 · force update          — blocking app-version gate
//
// All 360×780, reuse useACT / ACFonts / ACRadii / ACBtn / ACLabel / ACMono / ACNum.

// ══════════════════════════════════════════════════════════════
// S76 — PUBLIC PROFILE (shareable athlete card · external view)
// ══════════════════════════════════════════════════════════════
function S76_Public_Profile({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      {/* external browser chrome hint */}
      <div style={{
        padding:'10px 16px', display:'flex', alignItems:'center', gap:8,
        borderBottom:`1px solid ${c.hair}`,
      }}>
        <div style={{ width:10, height:10, background:c.faint }} />
        <ACMono size={10} color={c.dim} track={1.5} style={{ textTransform:'uppercase' }}>
          atlas.core/u/jordan-k
        </ACMono>
        <div style={{ marginLeft:'auto' }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight:600 }}>Follow</ACLabel>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto' }}>
        {/* inverted hero */}
        <div style={{ background:c.ink, color:c.bg, padding:'28px 22px 26px', position:'relative', overflow:'hidden' }}>
          <svg viewBox="0 0 400 60" style={{ position:'absolute', top:14, right:-40, width:260, height:40, opacity:0.15 }}>
            <polyline fill="none" stroke={c.accent} strokeWidth="1.5" points="0,30 80,30 95,12 110,48 125,18 140,30 400,30" />
          </svg>
          <ACMono size={10} color={c.accent} track={2} style={{ textTransform:'uppercase' }}>/// atlas.core · public</ACMono>
          <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              width:64, height:64, background:c.accent, color:c.ink,
              display:'grid', placeItems:'center',
              fontFamily:ACFonts.display, fontSize:22, fontWeight:800, letterSpacing:-1,
            }}>JK</div>
            <div>
              <div style={{ fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, lineHeight:1 }}>Jordan K.</div>
              <div style={{ fontSize:12, color:'rgba(239,233,218,0.7)', marginTop:4 }}>Austin, TX · recomp · 14 mo</div>
            </div>
          </div>
          <div style={{
            marginTop:18, display:'grid', gridTemplateColumns:'repeat(3,1fr)',
            borderTop:`1px solid rgba(239,233,218,0.15)`, paddingTop:14,
          }}>
            {[
              { k:'body wt', v:'182', u:'lb' },
              { k:'bf%',     v:'14.8' },
              { k:'prs (4)', v:'17' },
            ].map(s => (
              <div key={s.k}>
                <div style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, letterSpacing:-0.6, fontVariantNumeric:'tabular-nums' }}>
                  {s.v}{s.u && <span style={{ fontSize:11, color:'rgba(239,233,218,0.5)', marginLeft:3, fontWeight:500 }}>{s.u}</span>}
                </div>
                <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:'rgba(239,233,218,0.55)', marginTop:3 }}>{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* big four PRs */}
        <div style={{ padding:'22px 22px 8px' }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>the big four · lifetime</ACMono>
          <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { k:'squat',    v:'405',  d:'aug 24' },
              { k:'bench',    v:'285',  d:'nov 24' },
              { k:'deadlift', v:'485',  d:'mar 25' },
              { k:'ohp',      v:'175',  d:'jan 25' },
            ].map(s => (
              <div key={s.k} style={{ padding:'12px 14px', background:c.card, borderRadius:ACRadii.card }}>
                <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.6, textTransform:'uppercase', color:c.dim }}>{s.k}</div>
                <div style={{ marginTop:4, display:'flex', alignItems:'baseline', gap:4 }}>
                  <span style={{ fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, fontVariantNumeric:'tabular-nums', color:c.fg }}>{s.v}</span>
                  <span style={{ fontSize:10, color:c.mute }}>lb</span>
                </div>
                <div style={{ fontSize:10, color:c.mute, marginTop:2 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* training strip */}
        <div style={{ padding:'16px 22px 0' }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>training · 90 day</ACMono>
          <div style={{ marginTop:10, display:'flex', gap:3, alignItems:'flex-end', height:44 }}>
            {Array.from({length:90}).map((_,i) => {
              const r = (Math.sin(i*0.4)+Math.cos(i*0.23))*0.5+0.5;
              const h = 6 + Math.floor(r*34);
              const on = i%7 < 4;
              return <div key={i} style={{ flex:1, height:h, background: on ? c.fg : c.faint, opacity: on ? 1 : 0.4 }} />;
            })}
          </div>
          <div style={{ marginTop:6, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:9, color:c.mute, textTransform:'uppercase', letterSpacing:1.3 }}>
            <span>90d ago</span>
            <span>today</span>
          </div>
        </div>

        {/* recent moments */}
        <div style={{ padding:'22px 22px 28px' }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>recent</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              { k:'PR', t:'deadlift · 485 lb', d:'3d' },
              { k:'prog', t:'finished 5/3/1 BBB · cycle 4', d:'1w' },
              { k:'lab', t:'panel · 84 markers · clean', d:'3w' },
            ].map((r,i,arr) => (
              <div key={i} style={{ padding:'12px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase',
                  padding:'3px 6px', background:c.accent, color:c.ink, fontWeight:700,
                }}>{r.k}</div>
                <div style={{ flex:1, fontSize:13, color:c.fg }}>{r.t}</div>
                <div style={{ fontSize:11, color:c.mute }}>{r.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}` }}>
        <ACBtn primary block dark={dark} size="md" pill>Follow Jordan</ACBtn>
        <div style={{ textAlign:'center', marginTop:8 }}>
          <ACMono size={9} color={c.mute} track={1.6} style={{ textTransform:'uppercase' }}>atlas.core · public profile</ACMono>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S77 — LAB UPLOAD
// ══════════════════════════════════════════════════════════════
function S77_Lab_Upload({ dark }) {
  const c = useACT(dark);
  const [mode, setMode] = React.useState('drop'); // drop | photo | request
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Labs</ACLabel>
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 16px' }}>
        <div style={{ fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-0.9, lineHeight:1.05, color:c.fg }}>
          Bring your panel in.
        </div>
        <div style={{ marginTop:6, fontSize:13, color:c.dim, lineHeight:1.5 }}>
          Three paths. All markers are normalized into the same timeline.
        </div>

        {/* mode tabs */}
        <div style={{ marginTop:18, display:'flex', gap:6, padding:3, background:c.card, borderRadius:ACRadii.chip }}>
          {[['drop','Drop a file'],['photo','Photograph'],['request','Request']].map(([k,l]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              flex:1, padding:'8px 6px', border:0,
              background: mode===k ? c.fg : 'transparent',
              color: mode===k ? c.bg : c.dim,
              fontFamily:ACFonts.body, fontSize:11, fontWeight:600, cursor:'pointer',
              borderRadius:ACRadii.chip-2,
            }}>{l}</button>
          ))}
        </div>

        {/* mode content */}
        {mode==='drop' && (
          <div style={{ marginTop:16 }}>
            <div style={{
              padding:'36px 20px', border:`2px dashed ${c.fg}30`,
              textAlign:'center',
            }}>
              <div style={{
                width:44, height:44, margin:'0 auto', display:'grid', placeItems:'center',
                background:c.accent, color:c.ink, fontFamily:ACFonts.mono, fontSize:18, fontWeight:700,
              }}>↓</div>
              <div style={{ marginTop:14, fontSize:15, fontWeight:600, color:c.fg }}>Drop PDF or image</div>
              <div style={{ marginTop:4, fontSize:12, color:c.dim }}>or tap to browse · max 20 MB</div>
            </div>
            <div style={{ marginTop:14, padding:14, background:c.card, borderRadius:ACRadii.card }}>
              <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>accepted sources</ACMono>
              <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {['Quest','LabCorp','Function Health','Inside Tracker','20/20','Thorne'].map(s => (
                  <div key={s} style={{ fontSize:12, color:c.fg, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:5, height:5, background:c.accent }} />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode==='photo' && (
          <div style={{ marginTop:16 }}>
            <div style={{
              aspectRatio:'3/4', background:c.card, position:'relative', overflow:'hidden',
              display:'grid', placeItems:'center', borderRadius:ACRadii.card,
            }}>
              {/* viewfinder corners */}
              {[['tl','0 0 auto auto'],['tr','0 0 0 auto'],['bl','auto 0 0 0'],['br','auto 0 0 auto']].map(([k,pos]) => (
                <div key={k} style={{
                  position:'absolute', inset:pos, width:28, height:28,
                  borderTop: k==='tl'||k==='tr' ? `2px solid ${c.accent}` : 'none',
                  borderBottom: k==='bl'||k==='br' ? `2px solid ${c.accent}` : 'none',
                  borderLeft: k==='tl'||k==='bl' ? `2px solid ${c.accent}` : 'none',
                  borderRight: k==='tr'||k==='br' ? `2px solid ${c.accent}` : 'none',
                  margin:16,
                }} />
              ))}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.6, textTransform:'uppercase', color:c.dim }}>align panel here</div>
                <div style={{ marginTop:8, fontSize:13, color:c.fg, maxWidth:200 }}>We'll read the column headers and match markers automatically.</div>
              </div>
            </div>
            <div style={{ marginTop:14, padding:12, borderLeft:`2px solid ${c.accent}`, background:`${c.accent}14` }}>
              <div style={{ fontSize:12, color:c.fg, lineHeight:1.5 }}>
                <strong>92% accuracy</strong> on printed panels. On handwritten results, you'll confirm each row.
              </div>
            </div>
          </div>
        )}

        {mode==='request' && (
          <div style={{ marginTop:16 }}>
            <div style={{ padding:16, background:c.card, borderRadius:ACRadii.card }}>
              <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>request via · partners</ACMono>
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { k:'Function Health', sub:'$499/yr · 84 markers · in-home', on:true },
                  { k:'Quest @ home',    sub:'Kits shipped · 52 markers',     on:false },
                  { k:'Inside Tracker',  sub:'44 markers · wearable-aware',   on:false },
                ].map(p => (
                  <div key={p.k} style={{
                    padding:'12px 14px', background:c.bg, borderRadius:ACRadii.chip,
                    display:'flex', alignItems:'center', gap:12,
                    borderLeft: p.on ? `3px solid ${c.accent}` : `3px solid transparent`,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13.5, fontWeight:600, color:c.fg }}>{p.k}</div>
                      <div style={{ fontSize:11, color:c.dim, marginTop:2 }}>{p.sub}</div>
                    </div>
                    <div style={{
                      fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase',
                      padding:'3px 6px', background: p.on ? c.accent : c.hair, color: p.on ? c.ink : c.dim, fontWeight:700,
                    }}>{p.on ? 'linked' : 'connect'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop:14, fontSize:11, color:c.dim, lineHeight:1.5 }}>
              Kits ship in 3–5 days. Results appear here within 72h of the lab receiving your sample.
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>
          {mode==='drop' ? 'Choose file' : mode==='photo' ? 'Open camera' : 'Order kit · $129'}
        </ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S78 — LAB EXAM DETAIL (full panel breakdown)
// ══════════════════════════════════════════════════════════════
function S78_Lab_Exam_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← History</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Share</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ padding:'10px 22px 4px' }}>
          <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// panel · q1 2025</ACMono>
          <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
            Mar 18, 2025.<br/>
            <span style={{ fontSize:20, color:c.dim, fontWeight:600 }}>84 markers · Function Health</span>
          </div>

          {/* summary ribbon */}
          <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, border:`1px solid ${c.hair}` }}>
            {[
              { k:'optimal',  v:'71', col:c.accent },
              { k:'watch',    v:'9',  col:c.fg },
              { k:'flagged',  v:'4',  col:'#d64545' },
            ].map((s,i) => (
              <div key={s.k} style={{
                padding:'12px 10px', borderRight: i<2 ? `1px solid ${c.hair}` : 'none',
                textAlign:'center',
              }}>
                <div style={{ fontFamily:ACFonts.display, fontSize:24, fontWeight:700, color:s.col, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{s.v}</div>
                <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim, marginTop:4 }}>{s.k}</div>
              </div>
            ))}
          </div>

          {/* flagged section */}
          <div style={{ marginTop:20 }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>flagged · 4</ACMono>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:1, background:c.hair }}>
              {[
                { k:'ApoB',        v:'112', u:'mg/dL', opt:'60–80', dir:'↑', flag:'elevated' },
                { k:'Ferritin',    v:'38',  u:'ng/mL', opt:'80–200', dir:'↓', flag:'low' },
                { k:'Vit D, 25-OH',v:'28',  u:'ng/mL', opt:'40–80',  dir:'↓', flag:'low' },
                { k:'hs-CRP',      v:'3.2', u:'mg/L',  opt:'<1',     dir:'↑', flag:'elevated' },
              ].map(r => (
                <div key={r.k} style={{ background:c.bg, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, color:c.fg, fontWeight:600 }}>{r.k}</div>
                    <div style={{ fontSize:10.5, color:c.mute, marginTop:2, fontFamily:ACFonts.mono, letterSpacing:0.5 }}>optimal: {r.opt}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:ACFonts.display, fontSize:18, fontWeight:700, color:c.fg, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
                      {r.v} <span style={{ fontSize:10, color:c.dim, fontWeight:500 }}>{r.u}</span>
                    </div>
                    <div style={{ marginTop:3, fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:'#d64545', fontWeight:700 }}>
                      {r.dir} {r.flag}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* categories */}
          <div style={{ marginTop:22 }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>by category</ACMono>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { k:'Cardiovascular', t:12, o:8, f:2 },
                { k:'Metabolic',      t:14, o:12, f:1 },
                { k:'Hormones',       t:11, o:10, f:0 },
                { k:'Inflammation',   t:7,  o:5,  f:1 },
                { k:'Micronutrients', t:18, o:15, f:1 },
                { k:'Blood count',    t:12, o:12, f:0 },
                { k:'Liver & kidney', t:10, o:9,  f:0 },
              ].map(cat => {
                const pct = cat.o/cat.t;
                return (
                  <div key={cat.k} style={{ padding:'10px 12px', background:c.card, borderRadius:ACRadii.chip }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                      <span style={{ fontSize:12.5, fontWeight:600, color:c.fg }}>{cat.k}</span>
                      <span style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.dim, letterSpacing:0.5 }}>
                        {cat.o}/{cat.t} optimal {cat.f>0 && <span style={{ color:'#d64545', fontWeight:700 }}>· {cat.f} flag</span>}
                      </span>
                    </div>
                    <div style={{ marginTop:6, height:4, background:c.hair }}>
                      <div style={{ height:'100%', width:`${pct*100}%`, background:c.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop:22, padding:14, background:c.ink, color:c.bg }}>
            <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>coach read</ACMono>
            <div style={{ marginTop:8, fontSize:13.5, lineHeight:1.5 }}>
              Cardiovascular risk panel is the story this cycle. ApoB drift is 4-month trend, not noise. Starting a protocol proposal now.
            </div>
          </div>

          <div style={{ height:20 }} />
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}`, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Export PDF</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>See protocol →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S79 — LAB HISTORY (timeline across years)
// ══════════════════════════════════════════════════════════════
function S79_Lab_History({ dark }) {
  const c = useACT(dark);
  const [marker, setMarker] = React.useState('apob');
  const markers = [
    { k:'apob',    l:'ApoB',        u:'mg/dL', data:[95,102,108,112,110,105,98,92] },
    { k:'a1c',     l:'HbA1c',       u:'%',     data:[5.6,5.5,5.5,5.4,5.4,5.3,5.3,5.2] },
    { k:'vitd',    l:'Vit D',       u:'ng/mL', data:[24,22,28,34,42,48,52,58] },
    { k:'ferr',    l:'Ferritin',    u:'ng/mL', data:[42,36,38,44,58,72,85,98] },
  ];
  const cur = markers.find(m => m.k===marker);
  const min = Math.min(...cur.data), max = Math.max(...cur.data);
  const range = max-min || 1;
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Labs</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Compare</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 16px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// lab history</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          8 panels.<br/>
          <span style={{ fontSize:20, color:c.dim, fontWeight:600 }}>24 months · 84 markers each</span>
        </div>

        {/* marker picker */}
        <div style={{ marginTop:18, display:'flex', gap:6, flexWrap:'wrap' }}>
          {markers.map(m => (
            <button key={m.k} onClick={() => setMarker(m.k)} style={{
              padding:'6px 10px', border:0, cursor:'pointer',
              background: marker===m.k ? c.fg : c.card,
              color: marker===m.k ? c.bg : c.fg,
              fontFamily:ACFonts.body, fontSize:11.5, fontWeight:600,
              borderRadius:ACRadii.chip,
            }}>{m.l}</button>
          ))}
        </div>

        {/* chart */}
        <div style={{ marginTop:18, padding:'16px 14px 12px', background:c.card, borderRadius:ACRadii.card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div>
              <span style={{ fontFamily:ACFonts.display, fontSize:26, fontWeight:700, color:c.fg, letterSpacing:-0.6, fontVariantNumeric:'tabular-nums' }}>
                {cur.data[cur.data.length-1]}
              </span>
              <span style={{ fontSize:11, color:c.dim, marginLeft:4 }}>{cur.u}</span>
            </div>
            <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>24 mo</div>
          </div>

          <svg viewBox="0 0 280 90" style={{ marginTop:14, width:'100%', height:90 }}>
            {/* grid */}
            {[0,1,2,3].map(i => (
              <line key={i} x1={0} y1={i*28+4} x2={280} y2={i*28+4} stroke={c.hair} strokeWidth="1" />
            ))}
            {/* line */}
            <polyline
              fill="none" stroke={c.accent} strokeWidth="2"
              points={cur.data.map((v,i) => `${(i/(cur.data.length-1))*280},${80 - ((v-min)/range)*70 + 5}`).join(' ')}
            />
            {/* dots */}
            {cur.data.map((v,i) => (
              <circle key={i}
                cx={(i/(cur.data.length-1))*280}
                cy={80 - ((v-min)/range)*70 + 5}
                r={i===cur.data.length-1 ? 4 : 2.5}
                fill={i===cur.data.length-1 ? c.ink : c.accent} />
            ))}
          </svg>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontFamily:ACFonts.mono, fontSize:9, color:c.mute, letterSpacing:1.2, textTransform:'uppercase' }}>
            <span>mar '23</span><span>sep '23</span><span>mar '24</span><span>mar '25</span>
          </div>
        </div>

        {/* panel list */}
        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>panels</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              { d:'Mar 18, 2025', src:'Function', n:84, o:71, f:4 },
              { d:'Dec 02, 2024', src:'Function', n:84, o:68, f:6 },
              { d:'Sep 14, 2024', src:'Function', n:84, o:64, f:7 },
              { d:'Jun 08, 2024', src:'Quest',    n:52, o:41, f:3 },
              { d:'Mar 22, 2024', src:'Function', n:84, o:62, f:8 },
              { d:'Dec 01, 2023', src:'LabCorp',  n:38, o:28, f:5 },
              { d:'Sep 11, 2023', src:'Quest',    n:52, o:36, f:7 },
              { d:'Apr 02, 2023', src:'LabCorp',  n:38, o:26, f:6 },
            ].map((p,i) => (
              <div key={i} style={{
                padding:'12px 0', borderBottom:`1px solid ${c.hair}`,
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{
                  width:36, height:36, background:i===0?c.accent:c.card, color:i===0?c.ink:c.fg,
                  display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:10, fontWeight:700,
                }}>{p.d.slice(0,3).toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:c.fg }}>{p.d}</div>
                  <div style={{ fontSize:11, color:c.dim, marginTop:1 }}>{p.src} · {p.n} markers</div>
                </div>
                <div style={{ textAlign:'right', fontFamily:ACFonts.mono, fontSize:10.5, letterSpacing:0.4, color:c.dim }}>
                  <span style={{ color:c.accent, fontWeight:700 }}>{p.o}</span> · <span style={{ color:'#d64545', fontWeight:700 }}>{p.f}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S80 — ROUTINE PRESETS (library)
// ══════════════════════════════════════════════════════════════
function S80_Routine_Presets({ dark }) {
  const c = useACT(dark);
  const [filter, setFilter] = React.useState('all');
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Plan</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>+ New</ACLabel>
      </div>

      <div style={{ padding:'14px 22px 0' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// saved presets</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          12 routines.<br/>
          <span style={{ fontSize:20, color:c.dim, fontWeight:600 }}>ready to slot in</span>
        </div>
        <div style={{ marginTop:14, display:'flex', gap:6, flexWrap:'wrap' }}>
          {[['all','All'],['push','Push'],['pull','Pull'],['legs','Legs'],['full','Full body'],['condition','Condition']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding:'6px 10px', border:0, cursor:'pointer',
              background: filter===k ? c.fg : c.card,
              color: filter===k ? c.bg : c.fg,
              fontFamily:ACFonts.body, fontSize:11, fontWeight:600,
              borderRadius:ACRadii.chip,
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        {[
          { k:'A', t:'Push · heavy',         sub:'Bench primary · 5×5 · 62 min',       tag:'PUSH',  lifts:6, last:'2d' },
          { k:'B', t:'Pull · volume',         sub:'Deadlift primary · 6 exercises',      tag:'PULL',  lifts:6, last:'4d' },
          { k:'C', t:'Legs · posterior',      sub:'RDL + squat · 48 min',                tag:'LEGS',  lifts:5, last:'6d' },
          { k:'D', t:'Full body · A',         sub:'Every lift · 75 min',                 tag:'FULL',  lifts:7, last:'1w' },
          { k:'E', t:'Push · technical',      sub:'OHP primary · slower tempo',          tag:'PUSH',  lifts:5, last:'2w' },
          { k:'F', t:'Arms · accessory',      sub:'Curls + extensions · 32 min',         tag:'PULL',  lifts:6, last:'3w' },
          { k:'G', t:'Condition · anaerobic', sub:'Sled + bike · 24 min',                tag:'COND',  lifts:4, last:'—' },
        ].map((r,i) => (
          <div key={i} style={{
            padding:'14px 14px', marginBottom:8, background:c.card, borderRadius:ACRadii.card,
            display:'flex', alignItems:'center', gap:14,
          }}>
            <div style={{
              width:44, height:44, background:c.ink, color:c.bg,
              display:'grid', placeItems:'center', fontFamily:ACFonts.display, fontSize:20, fontWeight:700,
            }}>{r.k}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13.5, fontWeight:600, color:c.fg }}>{r.t}</span>
                <span style={{
                  fontFamily:ACFonts.mono, fontSize:8.5, letterSpacing:1.4, textTransform:'uppercase',
                  padding:'2px 5px', background:c.hair, color:c.dim, fontWeight:700,
                }}>{r.tag}</span>
              </div>
              <div style={{ fontSize:11.5, color:c.dim, marginTop:3 }}>{r.sub}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.dim, letterSpacing:0.5 }}>last · {r.last}</div>
              <div style={{ fontSize:11, color:c.fg, fontWeight:600, marginTop:2 }}>{r.lifts} lifts</div>
            </div>
          </div>
        ))}

        {/* create new card */}
        <div style={{
          marginTop:8, padding:'18px 14px', border:`2px dashed ${c.faint}`,
          display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{
            width:36, height:36, background:c.accent, color:c.ink,
            display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:18, fontWeight:700,
          }}>+</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:600, color:c.fg }}>New preset</div>
            <div style={{ fontSize:11.5, color:c.dim, marginTop:2 }}>Build a routine from scratch or a program</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S81 — ROUTINE PRESET DETAIL
// ══════════════════════════════════════════════════════════════
function S81_Routine_Preset_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Presets</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Edit</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ padding:'14px 22px 0' }}>
          <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// preset A · push · heavy</ACMono>
          <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-0.9, lineHeight:1.05, color:c.fg }}>
            Bench primary.<br/>
            <span style={{ fontSize:20, color:c.dim, fontWeight:600 }}>62 min · 6 lifts · 18 sets</span>
          </div>

          <div style={{ marginTop:18, display:'grid', gridTemplateColumns:'repeat(3,1fr)', border:`1px solid ${c.hair}` }}>
            {[
              { k:'last run', v:'2d', sub:'mar 22' },
              { k:'avg dur',  v:'62', u:'m' },
              { k:'times run',v:'23' },
            ].map((s,i) => (
              <div key={s.k} style={{ padding:'12px 10px', borderRight: i<2 ? `1px solid ${c.hair}` : 'none' }}>
                <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{s.k}</div>
                <div style={{ marginTop:4, display:'flex', alignItems:'baseline', gap:3 }}>
                  <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, color:c.fg, letterSpacing:-0.6, fontVariantNumeric:'tabular-nums' }}>{s.v}</span>
                  {s.u && <span style={{ fontSize:10, color:c.dim }}>{s.u}</span>}
                </div>
                {s.sub && <div style={{ fontSize:10, color:c.mute, marginTop:2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* the lifts */}
          <div style={{ marginTop:22 }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>the lifts · 6</ACMono>
            <div style={{ marginTop:10 }}>
              {[
                { n:'01', k:'Barbell bench press',     sub:'5×5 · 225 lb · 3m rest',  primary:true },
                { n:'02', k:'Incline DB press',        sub:'3×10 · 70 lb · 90s rest' },
                { n:'03', k:'OHP',                     sub:'3×8 · 135 lb · 2m rest' },
                { n:'04', k:'Cable fly',               sub:'3×12 · 45 lb · 60s rest' },
                { n:'05', k:'Triceps pushdown',        sub:'3×12 · 60 lb · 60s rest' },
                { n:'06', k:'Tricep overhead ext.',    sub:'3×10 · 50 lb · 60s rest' },
              ].map(l => (
                <div key={l.n} style={{
                  padding:'12px 0', borderBottom:`1px solid ${c.hair}`,
                  display:'flex', alignItems:'center', gap:12,
                }}>
                  <div style={{
                    fontFamily:ACFonts.mono, fontSize:10, color:l.primary ? c.accent : c.dim, letterSpacing:1, fontWeight:700,
                    width:20,
                  }}>{l.n}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:c.fg }}>
                      {l.k}
                      {l.primary && <span style={{ marginLeft:6, fontFamily:ACFonts.mono, fontSize:8.5, letterSpacing:1.4, textTransform:'uppercase', padding:'2px 5px', background:c.accent, color:c.ink, fontWeight:700 }}>primary</span>}
                    </div>
                    <div style={{ fontFamily:ACFonts.mono, fontSize:10.5, color:c.dim, marginTop:3, letterSpacing:0.3 }}>{l.sub}</div>
                  </div>
                  <div style={{ fontSize:14, color:c.mute }}>⇵</div>
                </div>
              ))}
            </div>
          </div>

          {/* substitutions */}
          <div style={{ marginTop:20, padding:14, background:c.card, borderRadius:ACRadii.card }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>auto-sub · if tired</ACMono>
            <div style={{ marginTop:8, fontSize:12.5, color:c.fg, lineHeight:1.55 }}>
              Readiness under 60 swaps bench for <strong>incline DB press</strong>, drops set 5 on primary, extends rest to 4 min.
            </div>
          </div>

          <div style={{ height:20 }} />
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}`, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Schedule</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Run now →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S82 — MEAL DETAIL
// ══════════════════════════════════════════════════════════════
function S82_Meal_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Diary</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Save as</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ padding:'14px 22px 0' }}>
          <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// meal · lunch · 12:42 pm</ACMono>
          <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-0.9, lineHeight:1.05, color:c.fg }}>
            Rice bowl + salmon.
          </div>

          {/* macro hero */}
          <div style={{ marginTop:18, padding:'18px 16px', background:c.ink, color:c.bg }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:52, fontWeight:800, letterSpacing:-1.8, lineHeight:1, fontVariantNumeric:'tabular-nums' }}>682</span>
              <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:'rgba(239,233,218,0.6)', letterSpacing:1.4, textTransform:'uppercase' }}>kcal</span>
            </div>
            <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, paddingTop:12, borderTop:'1px solid rgba(239,233,218,0.15)' }}>
              {[
                { k:'protein', v:'42', u:'g' },
                { k:'carbs',   v:'68', u:'g' },
                { k:'fat',     v:'22', u:'g' },
              ].map(m => (
                <div key={m.k}>
                  <div style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:700, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums' }}>
                    {m.v}<span style={{ fontSize:10, color:'rgba(239,233,218,0.55)', marginLeft:2 }}>{m.u}</span>
                  </div>
                  <div style={{ fontFamily:ACFonts.mono, fontSize:9, color:c.accent, letterSpacing:1.4, textTransform:'uppercase', marginTop:3 }}>{m.k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* source */}
          <div style={{ marginTop:14, padding:'10px 12px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', padding:'3px 5px', background:c.accent, color:c.ink, fontWeight:700 }}>PHOTO</div>
            <div style={{ flex:1, fontSize:12, color:c.fg }}>Photo log · 92% confidence</div>
            <div style={{ fontSize:11, color:c.accent, fontWeight:600 }}>View</div>
          </div>

          {/* items */}
          <div style={{ marginTop:20 }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>5 items</ACMono>
            <div style={{ marginTop:10 }}>
              {[
                { n:'Atlantic salmon',    q:'6 oz',   k:'340', p:'38', c:'0',  f:'20' },
                { n:'Jasmine rice',        q:'1 cup',  k:'206', p:'4',  c:'45', f:'0.5' },
                { n:'Avocado',             q:'½',      k:'120', p:'1',  c:'6',  f:'11' },
                { n:'Soy sauce',           q:'2 tbsp', k:'16',  p:'2',  c:'2',  f:'0' },
                { n:'Nori sheets',         q:'2',      k:'10',  p:'1',  c:'2',  f:'0' },
              ].map((it,i,arr) => (
                <div key={i} style={{
                  padding:'12px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{ display:'flex', alignItems:'baseline' }}>
                    <span style={{ flex:1, fontSize:13, fontWeight:600, color:c.fg }}>{it.n}</span>
                    <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.fg, letterSpacing:0.3, fontVariantNumeric:'tabular-nums' }}>{it.k} kcal</span>
                  </div>
                  <div style={{ marginTop:3, display:'flex', alignItems:'baseline', gap:10, fontFamily:ACFonts.mono, fontSize:10, color:c.dim, letterSpacing:0.5 }}>
                    <span>{it.q}</span>
                    <span>·</span>
                    <span>P {it.p}</span>
                    <span>C {it.c}</span>
                    <span>F {it.f}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* notables */}
          <div style={{ marginTop:20, padding:14, background:c.card, borderRadius:ACRadii.card }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>notable micronutrients</ACMono>
            <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {[
                { k:'Omega-3', v:'2.4 g', note:'97% target' },
                { k:'Vit D',    v:'570 IU', note:'half day' },
                { k:'B12',      v:'4.8 µg', note:'200% DV' },
                { k:'Selenium', v:'62 µg',  note:'90% DV' },
              ].map(m => (
                <div key={m.k}>
                  <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{m.k}</div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:c.fg, marginTop:2, fontFamily:ACFonts.mono, letterSpacing:0.2 }}>{m.v}</div>
                  <div style={{ fontSize:10, color:c.accent, marginTop:2 }}>{m.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:20 }} />
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}`, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Duplicate</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Save to meals</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S83 — OFFLINE
// ══════════════════════════════════════════════════════════════
function S83_Offline({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACMono size={10} color={'#d64545'} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>● OFFLINE</ACMono>
        <ACLabel size={12} color={c.dim}>Retry</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'40px 22px 16px', display:'flex', flexDirection:'column' }}>
        {/* motif — interrupted ECG */}
        <div style={{ position:'relative', height:80, margin:'0 -22px 24px' }}>
          <svg viewBox="0 0 360 80" style={{ width:'100%', height:80 }}>
            <polyline fill="none" stroke={c.fg} strokeWidth="2" opacity="0.28" points="0,40 100,40 115,22 130,58 150,40 170,40" />
            <line x1="170" y1="20" x2="195" y2="60" stroke="#d64545" strokeWidth="2.5" />
            <line x1="195" y1="20" x2="170" y2="60" stroke="#d64545" strokeWidth="2.5" />
            <polyline fill="none" stroke={c.fg} strokeWidth="2" opacity="0.28" points="195,40 260,40 275,22 290,58 310,40 360,40" strokeDasharray="4 3" />
          </svg>
        </div>

        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// signal lost</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:32, fontWeight:700, letterSpacing:-1, lineHeight:1.05, color:c.fg }}>
          We're off-grid.<br/>
          <span style={{ color:c.dim }}>Your work isn't.</span>
        </div>
        <div style={{ marginTop:10, fontSize:13.5, color:c.dim, lineHeight:1.5 }}>
          Keep logging. Everything queues locally and syncs the moment we reconnect. No data lost, ever.
        </div>

        {/* local queue */}
        <div style={{ marginTop:22, padding:16, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>local queue · 12</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              { k:'2:14 pm', t:'workout · push · 3 sets' },
              { k:'1:06 pm', t:'meal · lunch · 682 kcal' },
              { k:'11:42 am',t:'water · 500 ml' },
              { k:'8:30 am', t:'weight · 182.4 lb' },
              { k:'7:50 am', t:'readiness · 74' },
            ].map((r,i,arr) => (
              <div key={i} style={{ padding:'8px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:5, height:5, background:c.accent }} />
                <div style={{ flex:1, fontSize:12.5, color:c.fg }}>{r.t}</div>
                <div style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:0.4 }}>{r.k}</div>
              </div>
            ))}
            <div style={{ paddingTop:10, fontSize:11.5, color:c.mute }}>+ 7 more</div>
          </div>
        </div>

        <div style={{ marginTop:18, padding:'12px 14px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10`, fontSize:12.5, color:c.fg, lineHeight:1.5 }}>
          We're trying every 12 seconds. Last attempt: <span style={{ fontFamily:ACFonts.mono, fontSize:11 }}>0:08 ago</span>.
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Retry now</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S84 — SERVER ERROR (500 · ECG flatline)
// ══════════════════════════════════════════════════════════════
function S84_Server_Error({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Close</ACLabel>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>ref · ax-3f91</ACMono>
      </div>

      <div style={{ flex:1, padding:'30px 22px 16px', display:'flex', flexDirection:'column' }}>
        {/* 500 giant */}
        <div style={{ marginTop:10 }}>
          <ACMono size={11} color={'#d64545'} track={2.2} style={{ textTransform:'uppercase', fontWeight:700 }}>/// err · 500</ACMono>
          <div style={{
            marginTop:8, fontFamily:ACFonts.display, fontSize:110, fontWeight:800,
            letterSpacing:-5, lineHeight:0.88, color:c.fg,
          }}>
            500.
          </div>
          <div style={{ fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, lineHeight:1.1, color:c.fg, marginTop:6 }}>
            We lost the signal.
          </div>
          <div style={{ marginTop:8, fontSize:13.5, color:c.dim, lineHeight:1.5, maxWidth:280 }}>
            Something broke on our side. Nothing you logged is at risk — the queue is intact and waiting.
          </div>
        </div>

        {/* flatline */}
        <div style={{ margin:'28px -22px 0' }}>
          <svg viewBox="0 0 360 60" style={{ width:'100%', height:60, display:'block' }}>
            <line x1="0" y1="30" x2="360" y2="30" stroke={c.fg} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
            <text x="180" y="24" fontFamily="JetBrains Mono" fontSize="9" fill={c.accent} textAnchor="middle" letterSpacing="2" style={{ textTransform:'uppercase' }}>— flatline —</text>
          </svg>
        </div>

        {/* what we know */}
        <div style={{ marginTop:28, padding:16, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>what we know</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              ['scope',   'coach-api · us-east-2'],
              ['since',   '2:14:06 pm'],
              ['affects', 'readiness · brief · chat'],
              ['safe',    'all local logs'],
            ].map(([k,v]) => (
              <div key={k} style={{ padding:'6px 0', display:'flex', alignItems:'baseline', gap:10 }}>
                <span style={{ fontFamily:ACFonts.mono, fontSize:9.5, letterSpacing:1.6, textTransform:'uppercase', color:c.mute, width:68 }}>{k}</span>
                <span style={{ flex:1, fontSize:12, color:c.fg, fontFamily:ACFonts.mono, letterSpacing:0.2 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ marginTop:16, fontSize:11, color:c.mute, lineHeight:1.5, textAlign:'center' }}>
          Include reference <span style={{ fontFamily:ACFonts.mono, color:c.fg }}>ax-3f91</span> if you contact support.
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Status page</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Try again</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S85 — MAINTENANCE
// ══════════════════════════════════════════════════════════════
function S85_Maintenance({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>● SCHEDULED</ACMono>
        <ACLabel size={12} color={c.dim}>Status →</ACLabel>
      </div>

      <div style={{ flex:1, padding:'36px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// downtime notice</ACMono>
        <div style={{
          marginTop:6, fontFamily:ACFonts.display, fontSize:44, fontWeight:800,
          letterSpacing:-1.8, lineHeight:0.95, color:c.fg,
        }}>
          Tuning the<br/>
          <span style={{ background:c.ink, color:c.accent, padding:'0 6px' }}>engine.</span>
        </div>
        <div style={{ marginTop:14, fontSize:14, color:c.dim, lineHeight:1.55, maxWidth:280 }}>
          We're rolling out a coach-model upgrade. Everything that happens on-device keeps working — the sync resumes automatically when we're done.
        </div>

        {/* window + ring */}
        <div style={{ marginTop:26, padding:16, background:c.ink, color:c.bg }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>window</ACMono>
          <div style={{ marginTop:8, display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, fontVariantNumeric:'tabular-nums' }}>2:00 — 4:30 am</span>
            <span style={{ fontSize:11, color:'rgba(239,233,218,0.6)' }}>PT · Apr 14</span>
          </div>
          <div style={{ marginTop:14, height:8, background:'rgba(239,233,218,0.1)' }}>
            <div style={{ width:'42%', height:'100%', background:c.accent }} />
          </div>
          <div style={{ marginTop:6, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:9.5, letterSpacing:1.4, textTransform:'uppercase', color:'rgba(239,233,218,0.6)' }}>
            <span>42% complete</span><span>est · 0h 58m</span>
          </div>
        </div>

        <div style={{ marginTop:18, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>still works</ACMono>
          <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12, color:c.fg }}>
            {['Workout log','Meal log','Water log','Weight entry','Timer','Watch mirror'].map(x => (
              <div key={x} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:5, height:5, background:c.accent }} />{x}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:12, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>will wait</ACMono>
          <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12, color:c.dim }}>
            {['Daily brief','Coach chat','Labs sync','Protocols push','Crew feed','Billing'].map(x => (
              <div key={x} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:5, height:5, background:c.mute }} />{x}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Log today, sync later</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S86 — FORCE UPDATE
// ══════════════════════════════════════════════════════════════
function S86_Force_Update({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.ink, color:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>/// update required</ACMono>
        <ACLabel size={12} color={'rgba(239,233,218,0.5)'}>atlas.core</ACLabel>
      </div>

      <div style={{ flex:1, padding:'30px 22px 16px', display:'flex', flexDirection:'column' }}>
        {/* version blocks */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:12 }}>
          <div style={{
            padding:'6px 10px', border:`1px solid rgba(239,233,218,0.2)`,
            fontFamily:ACFonts.mono, fontSize:11, letterSpacing:0.5, color:'rgba(239,233,218,0.5)',
          }}>v 4.1.2</div>
          <div style={{ fontFamily:ACFonts.mono, fontSize:14, color:c.accent }}>→</div>
          <div style={{
            padding:'6px 10px', background:c.accent, color:c.ink,
            fontFamily:ACFonts.mono, fontSize:11, fontWeight:700, letterSpacing:0.5,
          }}>v 5.0</div>
        </div>

        <div style={{
          marginTop:22, fontFamily:ACFonts.display, fontSize:54, fontWeight:800,
          letterSpacing:-2.2, lineHeight:0.9,
        }}>
          Update to<br/>
          <span style={{ color:c.accent }}>continue.</span>
        </div>
        <div style={{ marginTop:14, fontSize:14, color:'rgba(239,233,218,0.72)', lineHeight:1.55, maxWidth:300 }}>
          5.0 ships the new coach model and protocol-aware programming. 4.x can't talk to this server anymore.
        </div>

        {/* what's new */}
        <div style={{ marginTop:26, padding:'16px 16px', background:'rgba(239,233,218,0.05)', border:'1px solid rgba(239,233,218,0.1)' }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>in 5.0</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              { k:'coach v2', sub:'protocol-aware, reads labs directly' },
              { k:'protocols',sub:'compounds, cycles, adherence' },
              { k:'watch',    sub:'mid-set mirror on Apple Watch' },
              { k:'privacy',  sub:'E2E for biomarkers by default' },
            ].map(r => (
              <div key={r.k} style={{ padding:'8px 0', display:'flex', alignItems:'baseline', gap:10 }}>
                <div style={{ width:5, height:5, background:c.accent, marginTop:6 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{r.k}</div>
                  <div style={{ fontSize:11, color:'rgba(239,233,218,0.55)', marginTop:2 }}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ marginTop:16, fontSize:11, color:'rgba(239,233,218,0.45)', textAlign:'center' }}>
          ~42 MB · your logs are already backed up
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px' }}>
        <button style={{
          width:'100%', padding:'16px 24px', background:c.accent, color:c.ink,
          border:0, fontFamily:ACFonts.body, fontSize:15, fontWeight:700, cursor:'pointer',
          borderRadius:999,
        }}>Open App Store</button>
        <div style={{ textAlign:'center', marginTop:10 }}>
          <ACLabel size={11} color={'rgba(239,233,218,0.4)'}>Export my data instead</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ── error-state variants for S83/S84/S85 (alt framings) ──────────────
function S83b_Offline_Compact({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg, alignItems:'center', justifyContent:'center', padding:22 }}>
      <div style={{ width:56, height:56, display:'grid', placeItems:'center', background:c.card, borderRadius:'50%' }}>
        <svg viewBox="0 0 40 40" style={{ width:32, height:32 }}>
          <circle cx="20" cy="20" r="14" fill="none" stroke={c.dim} strokeWidth="2" />
          <line x1="8" y1="8" x2="32" y2="32" stroke="#d64545" strokeWidth="2.5" />
        </svg>
      </div>
      <div style={{ marginTop:20, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, textAlign:'center', color:c.fg, lineHeight:1.1 }}>
        No connection.
      </div>
      <div style={{ marginTop:8, fontSize:13, color:c.dim, textAlign:'center', maxWidth:240, lineHeight:1.5 }}>
        Everything saves locally. We'll catch up when you're back online.
      </div>
      <div style={{ marginTop:24, fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:1.4, textTransform:'uppercase' }}>
            12 items queued
          </div>
      <div style={{ marginTop:18, width:'100%', maxWidth:260 }}>
        <ACBtn primary block dark={dark} size="md" pill>Retry</ACBtn>
      </div>
    </div>
  );
}

function S84b_Server_Error_Compact({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg, alignItems:'center', justifyContent:'center', padding:22 }}>
      <div style={{ fontFamily:ACFonts.display, fontSize:96, fontWeight:800, letterSpacing:-4, color:c.fg, lineHeight:0.9 }}>500</div>
      <svg viewBox="0 0 200 20" style={{ width:200, height:14, marginTop:10 }}>
        <line x1="0" y1="10" x2="200" y2="10" stroke={c.fg} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
      </svg>
      <div style={{ marginTop:16, fontFamily:ACFonts.display, fontSize:22, fontWeight:700, letterSpacing:-0.6, textAlign:'center', color:c.fg, lineHeight:1.2 }}>
        Something broke<br/>on our side.
      </div>
      <div style={{ marginTop:10, fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:1.4, textTransform:'uppercase' }}>
        ref · ax-3f91
      </div>
      <div style={{ marginTop:24, width:'100%', maxWidth:260, display:'flex', flexDirection:'column', gap:8 }}>
        <ACBtn primary block dark={dark} size="md" pill>Try again</ACBtn>
        <ACBtn block dark={dark} size="sm" pill>Status page</ACBtn>
      </div>
    </div>
  );
}

function S85b_Maintenance_Compact({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg, alignItems:'center', justifyContent:'center', padding:22 }}>
      {/* wrench-esque tick mark, geometric */}
      <div style={{ position:'relative' }}>
        <div style={{ width:56, height:56, background:c.accent, display:'grid', placeItems:'center', color:c.ink, fontFamily:ACFonts.display, fontSize:28, fontWeight:800 }}>✕</div>
      </div>
      <div style={{ marginTop:20, fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-0.9, textAlign:'center', color:c.fg, lineHeight:1.05 }}>
        Back at 4:30 am.
      </div>
      <div style={{ marginTop:10, fontSize:13, color:c.dim, textAlign:'center', maxWidth:260, lineHeight:1.5 }}>
        We're upgrading the coach model. On-device features still work.
      </div>
      <div style={{ marginTop:22, padding:'10px 16px', border:`1px solid ${c.hair}`, fontFamily:ACFonts.mono, fontSize:10.5, letterSpacing:1.2, color:c.dim, textTransform:'uppercase' }}>
        est · 0h 58m
      </div>
      <div style={{ marginTop:18, width:'100%', maxWidth:260 }}>
        <ACBtn primary block dark={dark} size="md" pill>Keep logging</ACBtn>
      </div>
    </div>
  );
}

// expose to other scripts
Object.assign(window, {
  S76_Public_Profile,
  S77_Lab_Upload,
  S78_Lab_Exam_Detail,
  S79_Lab_History,
  S80_Routine_Presets,
  S81_Routine_Preset_Detail,
  S82_Meal_Detail,
  S83_Offline, S83b_Offline_Compact,
  S84_Server_Error, S84b_Server_Error_Compact,
  S85_Maintenance, S85b_Maintenance_Compact,
  S86_Force_Update,
});
