// templates-blocks.jsx — atlas.core master template pack · part 3b
// ════════════════════════════════════════════════════════════════════
// ASSET / MARKETING BUILDING BLOCKS (priority 4)
// Composable modules for landing pages, emails, decks, ad creatives.
// Each block is a self-contained artboard sized for handoff.
// ════════════════════════════════════════════════════════════════════

function BPanel({ label, w, h, bg, fg, children, pad = 32 }) {
  const t = window.useTheme();
  return (
    <DCArtboard label={label} width={w} height={h} style={{ background: bg ?? t.bg, borderRadius: 0 }}>
      <div style={{ width: '100%', height: '100%', color: fg ?? t.ink, fontFamily: '-apple-system, system-ui', padding: pad, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </DCArtboard>
  );
}

function BKicker({ children, color, inline }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
      textTransform: 'uppercase', color, fontWeight: 600,
      display: inline ? 'inline-flex' : 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, background: 'currentColor' }}/>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// B-01 · DEVICE MOCKUP WRAPPER (desktop crop)
// ══════════════════════════════════════════════════════════════
function B_DeviceWrapper() {
  const t = window.useTheme();
  return (
    <BPanel label="b-01 · device wrapper" w={720} h={420} bg={t.ink} fg={t.bg}>
      <BKicker color={t.accent}>MOCKUP · PHONE</BKicker>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 80, bottom: 40, display: 'flex', gap: 24 }}>
        {[-4, 0, 4].map((tilt, i) => (
          <div key={i} style={{
            flex: 1, background: t.bg, border: `1px solid rgba(239,233,218,0.15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotate(${tilt}deg)`,
          }}>
            <div style={{
              width: 140, height: 260, background: t.ink,
              borderRadius: 20, padding: 6,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 14, background: i === 1 ? t.accent : '#f4efde' }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 16, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.55)' }}>
        TILT ±4° · DROP-SHADOW 0 20 40 / 40%
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-02 · BROWSER MOCKUP WRAPPER
// ══════════════════════════════════════════════════════════════
function B_BrowserWrapper() {
  const t = window.useTheme();
  return (
    <BPanel label="b-02 · browser wrapper" w={720} h={420} bg="#f4efde" fg={t.ink}>
      <BKicker color={t.accent}>MOCKUP · BROWSER</BKicker>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 80, bottom: 40, background: t.bg, border: `1px solid rgba(10,10,10,0.1)`, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid rgba(10,10,10,0.08)`, background: '#f4efde' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#f87171', '#fbbf24', '#4ade80'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>
            ))}
          </div>
          <div style={{ flex: 1, padding: '4px 10px', background: t.bg, border: `1px solid rgba(10,10,10,0.1)`, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1, color: 'rgba(10,10,10,0.55)' }}>
            atlas.health/app
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 20, letterSpacing: -0.6 }}>today.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1, height: 80, background: t.ink }}/>
            <div style={{ flex: 1, height: 80, background: t.accent }}/>
            <div style={{ flex: 1, height: 80, background: '#f4efde', border: `1px solid rgba(10,10,10,0.12)` }}/>
          </div>
        </div>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-03 · SECTION HEADER
// ══════════════════════════════════════════════════════════════
function B_SectionHeader() {
  const t = window.useTheme();
  return (
    <BPanel label="b-03 · section header" w={960} h={260} bg={t.bg} fg={t.ink}>
      <BKicker color={t.accent}>03 · LABS</BKicker>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 90, letterSpacing: -4, lineHeight: 0.92, textTransform: 'lowercase' }}>
          biomarkers,<br/>
          <span style={{ color: t.accent }}>readable.</span>
        </div>
        <div style={{ maxWidth: 280, fontSize: 14, lineHeight: 1.55, color: 'rgba(10,10,10,0.7)', paddingBottom: 14 }}>
          84 markers. Flagged against optimal, not normal. Trended 18 months.
        </div>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-04 · CTA STRIP
// ══════════════════════════════════════════════════════════════
function B_CTAStrip() {
  const t = window.useTheme();
  return (
    <BPanel label="b-04 · cta strip" w={960} h={180} bg={t.ink} fg={t.bg} pad={40}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <div>
          <BKicker color={t.accent}>GET · IOS</BKicker>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 44, letterSpacing: -1.8, lineHeight: 0.95, marginTop: 8 }}>
            start your system.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ padding: '16px 22px', background: t.accent, color: t.ink, fontFamily: '"Archivo Black", sans-serif', fontSize: 15, letterSpacing: -0.4 }}>download →</div>
          <div style={{ padding: '16px 22px', background: 'transparent', border: `1.5px solid ${t.bg}`, color: t.bg, fontFamily: '"Archivo Black", sans-serif', fontSize: 15, letterSpacing: -0.4 }}>see specs</div>
        </div>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-05 · STAT CARD GRID
// ══════════════════════════════════════════════════════════════
function B_StatCards() {
  const t = window.useTheme();
  const Stat = ({ n, l, d, alt }) => (
    <div style={{ padding: 22, background: alt ? t.ink : '#f4efde', color: alt ? t.bg : t.ink, flex: 1 }}>
      <BKicker color={alt ? t.accent : t.accent}>{d}</BKicker>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 68, letterSpacing: -3, lineHeight: 0.92, marginTop: 8 }}>{n}</div>
      <div style={{ fontSize: 13, marginTop: 8, color: alt ? 'rgba(239,233,218,0.7)' : 'rgba(10,10,10,0.65)' }}>{l}</div>
    </div>
  );
  return (
    <BPanel label="b-05 · stat cards" w={960} h={300} bg={t.bg} fg={t.ink}>
      <BKicker color={t.accent}>NUMBERS · Q1</BKicker>
      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <Stat n="84"     d="MARKERS"   l="biomarkers tracked across labs + wearables"/>
        <Stat n="+18%"   d="STRENGTH"  l="avg user strength gain, 90-day median" alt/>
        <Stat n="52"     d="HRV MS"    l="median resting HRV across beta cohort"/>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-06 · FEATURE CARD ROW
// ══════════════════════════════════════════════════════════════
function B_FeatureCards() {
  const t = window.useTheme();
  const Card = ({ k, h, b }) => (
    <div style={{ flex: 1, padding: 22, background: '#f4efde', border: `1px solid rgba(10,10,10,0.08)` }}>
      <BKicker color={t.accent}>{k}</BKicker>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.7, marginTop: 10, textTransform: 'lowercase' }}>{h}</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(10,10,10,0.68)', marginTop: 8 }}>{b}</div>
    </div>
  );
  return (
    <BPanel label="b-06 · feature cards" w={960} h={300} bg={t.bg} fg={t.ink}>
      <BKicker color={t.accent}>MODULES</BKicker>
      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <Card k="01 · TRAIN"  h="rpe-aware logging" b="Auto-PRs, 18-month strength curves, RPE calibration."/>
        <Card k="02 · LABS"   h="84 markers"        b="Quest, LabCorp, Function. Trended. Flagged vs optimal."/>
        <Card k="03 · COACH"  h="morning brief"     b="Readiness + one priority. No streaks. Signal, not nags."/>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-07 · PRICING BLOCK
// ══════════════════════════════════════════════════════════════
function B_Pricing() {
  const t = window.useTheme();
  const Plan = ({ name, price, per, alt, feat, tag }) => (
    <div style={{ flex: 1, padding: 26, background: alt ? t.ink : t.bg, color: alt ? t.bg : t.ink, border: alt ? 'none' : `2px solid ${t.ink}`, position: 'relative' }}>
      {tag && (
        <span style={{ position: 'absolute', top: -10, left: 16, padding: '2px 8px', background: t.accent, color: t.ink, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2 }}>{tag}</span>
      )}
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: alt ? t.accent : t.accent, textTransform: 'uppercase' }}>{name}</div>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 52, letterSpacing: -2, lineHeight: 1, marginTop: 10 }}>{price}<span style={{ fontSize: 14, opacity: 0.6 }}> {per}</span></div>
      <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.7, color: alt ? 'rgba(239,233,218,0.75)' : 'rgba(10,10,10,0.7)' }}>
        {feat.map(f => <div key={f}>— {f}</div>)}
      </div>
    </div>
  );
  return (
    <BPanel label="b-07 · pricing" w={960} h={380} bg="#f4efde" fg={t.ink}>
      <BKicker color={t.accent}>PLANS</BKicker>
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Plan name="CORE" price="free" per="" feat={['Today + workout', 'Apple Health sync', '1 protocol']}/>
        <Plan name="PRO" price="$24" per="/mo" alt tag="RECOMMENDED" feat={['Labs · 84 markers', 'Unlimited protocols', 'Coach + brief', '18-mo history']}/>
        <Plan name="ANNUAL" price="$199" per="/yr" feat={['Everything in Pro', 'Save 30%', 'Priority support']}/>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-08 · COMPARISON BLOCK (full)
// ══════════════════════════════════════════════════════════════
function B_CompareBlock() {
  const t = window.useTheme();
  const Row = ({ l, a, b, c, w }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderTop: '1px solid rgba(10,10,10,0.12)', padding: '10px 14px', alignItems: 'center' }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2, color: 'rgba(10,10,10,0.6)' }}>{l}</div>
      <div style={{ fontSize: 12.5 }}>{a}</div>
      <div style={{ fontSize: 12.5 }}>{b}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: w ? t.accent : t.ink }}>{c}</div>
    </div>
  );
  return (
    <BPanel label="b-08 · compare block" w={960} h={400} bg={t.bg} fg={t.ink} pad={32}>
      <BKicker color={t.accent}>COMPARE</BKicker>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 30, letterSpacing: -1, marginTop: 8, textTransform: 'lowercase' }}>
        three categories. one system.
      </div>
      <div style={{ marginTop: 18, border: `1px solid rgba(10,10,10,0.12)` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', background: '#f4efde' }}>
          <div/>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>TRACKER</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>CLINIC APP</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>ATLAS.CORE</div>
        </div>
        <Row l="LABS MEMORY"    a="—"          b="90 days"     c="18 months"  w/>
        <Row l="TRAINING"       a="basic"      b="—"           c="RPE-aware"  w/>
        <Row l="PROTOCOLS"      a="—"          b="clinician"   c="self-serve" w/>
        <Row l="DATA EXPORT"    a="locked"     b="PDF only"    c="CSV / JSON" w/>
        <Row l="DEVICE SYNC"    a="1 wearable" b="—"           c="5+ sources" w/>
        <Row l="COACH"          a="streaks"    b="scheduled"   c="signal-led" w/>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-09 · QUOTE / SOCIAL PROOF
// ══════════════════════════════════════════════════════════════
function B_QuoteBlock() {
  const t = window.useTheme();
  const Q = ({ q, n, r }) => (
    <div style={{ flex: 1, padding: 20, borderLeft: `3px solid ${t.accent}`, background: '#f4efde' }}>
      <div style={{ fontSize: 14.5, lineHeight: 1.5, color: t.ink, fontStyle: 'italic' }}>"{q}"</div>
      <div style={{ marginTop: 12, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.6)' }}>— {n} · {r}</div>
    </div>
  );
  return (
    <BPanel label="b-09 · quote block" w={960} h={260} bg={t.bg} fg={t.ink}>
      <BKicker color={t.accent}>FIELD · BETA</BKicker>
      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <Q q="Finally an app that treats my data like data." n="Marcus L." r="41, operator"/>
        <Q q="Labs, training, protocols — in one place, finally." n="Priya K." r="36, physician"/>
        <Q q="Respects how much I track. No streak nonsense." n="Jordan R." r="29, PM"/>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-10 · BADGE / CHIP SYSTEM
// ══════════════════════════════════════════════════════════════
function B_Chips() {
  const t = window.useTheme();
  const row = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 18 };
  return (
    <BPanel label="b-10 · badge / chip system" w={720} h={420} bg={t.bg} fg={t.ink}>
      <BKicker color={t.accent}>BADGES · CHIPS · TOKENS</BKicker>

      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)', marginTop: 18 }}>STATUS · MONO CHIP</div>
      <div style={row}>
        {['OPTIMAL', 'ELEVATED', 'LOW', 'PENDING', 'FLAGGED'].map(s => (
          <span key={s} style={{
            padding: '6px 10px', background: s === 'ELEVATED' || s === 'FLAGGED' ? t.accent : '#f4efde',
            color: t.ink, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2,
          }}>{s}</span>
        ))}
      </div>

      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>CATEGORY · INK CHIP</div>
      <div style={row}>
        {['TRAIN', 'EAT', 'LABS', 'SLEEP', 'PROTOCOL'].map(s => (
          <span key={s} style={{ padding: '6px 10px', background: t.ink, color: t.bg, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2 }}>{s}</span>
        ))}
      </div>

      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>PLAN · BADGE</div>
      <div style={row}>
        {['CORE', 'PRO', 'ANNUAL'].map(s => (
          <span key={s} style={{ padding: '5px 10px', border: `1.5px solid ${t.ink}`, fontFamily: '"Archivo Black", sans-serif', fontSize: 10, letterSpacing: -0.1, textTransform: 'lowercase' }}>{s.toLowerCase()}</span>
        ))}
      </div>

      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>MOMENT · STICKER</div>
      <div style={row}>
        <span style={{ padding: '6px 10px', background: t.accent, color: t.ink, fontFamily: '"Archivo Black", sans-serif', fontSize: 11, letterSpacing: -0.1, textTransform: 'lowercase' }}>new</span>
        <span style={{ padding: '6px 10px', background: t.accent, color: t.ink, fontFamily: '"Archivo Black", sans-serif', fontSize: 11, letterSpacing: -0.1, textTransform: 'lowercase' }}>auto-pr</span>
        <span style={{ padding: '6px 10px', background: t.ink, color: t.bg, fontFamily: '"Archivo Black", sans-serif', fontSize: 11, letterSpacing: -0.1, textTransform: 'lowercase' }}>beta</span>
        <span style={{ padding: '6px 10px', background: t.ink, color: t.bg, fontFamily: '"Archivo Black", sans-serif', fontSize: 11, letterSpacing: -0.1, textTransform: 'lowercase' }}>day 01</span>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-11 · ICON / CALLOUT STICKER SYSTEM
// ══════════════════════════════════════════════════════════════
function B_Stickers() {
  const t = window.useTheme();
  const Sticker = ({ k, label, bg = t.bg, rotate = 0 }) => (
    <div style={{
      padding: '10px 12px', background: bg, color: bg === t.bg ? t.ink : t.bg,
      border: bg === t.bg ? `2px solid ${t.ink}` : 'none',
      boxShadow: bg === t.bg ? `5px 5px 0 ${t.accent}` : `5px 5px 0 ${t.ink}`,
      transform: `rotate(${rotate}deg)`,
      display: 'inline-flex', flexDirection: 'column', maxWidth: 140,
    }}>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>{k}</span>
      <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, letterSpacing: -0.5, marginTop: 2 }}>{label}</span>
    </div>
  );
  return (
    <BPanel label="b-11 · stickers" w={720} h={420} bg="#f4efde" fg={t.ink}>
      <BKicker color={t.accent}>CALLOUT · STICKER SYSTEM</BKicker>
      <div style={{ position: 'absolute', inset: 70, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'center', justifyItems: 'center' }}>
        <Sticker k="AUTO-PR" label="+5 kg" rotate={-4}/>
        <Sticker k="FLAGGED" label="apoB 92" bg={t.accent} rotate={3}/>
        <Sticker k="READY"   label="87 / 100" rotate={-2}/>
        <Sticker k="NEW"     label="labs v2" bg={t.ink} rotate={4}/>
        <Sticker k="STREAK-FREE" label="0 guilt" rotate={-3}/>
        <Sticker k="SIGNAL" label="HRV +8" bg={t.accent} rotate={2}/>
      </div>
    </BPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// B-12 · TEXTURE / MOTIF SHEET
// ══════════════════════════════════════════════════════════════
function B_Textures() {
  const t = window.useTheme();
  // 4 backgrounds demonstrating the motif system
  const Swatch = ({ label, children }) => (
    <div style={{ flex: 1, border: `1px solid rgba(10,10,10,0.1)`, minHeight: 170, position: 'relative', overflow: 'hidden' }}>
      {children}
      <div style={{ position: 'absolute', left: 8, bottom: 6, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.6)' }}>{label}</div>
    </div>
  );
  // ECG row
  const ecg = <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ background: t.bg }}><path d="M 0 50 L 60 50 L 74 20 L 88 80 L 100 50 L 160 50" fill="none" stroke={t.ink} strokeWidth={1.2}/><path d="M 0 50 L 60 50 L 74 20 L 88 80 L 100 50 L 160 50" fill="none" stroke={t.accent} strokeWidth={1.2} transform="translate(0,20)"/></svg>;
  // Grid
  const grid = <div style={{ width: '100%', height: '100%', background: `repeating-linear-gradient(0deg, ${t.bg}, ${t.bg} 11px, rgba(10,10,10,0.08) 11px, rgba(10,10,10,0.08) 12px), repeating-linear-gradient(90deg, ${t.bg}, ${t.bg} 11px, rgba(10,10,10,0.08) 11px, rgba(10,10,10,0.08) 12px)` }}/>;
  // Ink field
  const ink = <div style={{ width: '100%', height: '100%', background: t.ink, position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 18 }}>
      <div style={{ width: 10, height: 10, background: t.accent, marginBottom: 6 }}/>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 36, color: t.bg, letterSpacing: -1.4, lineHeight: 0.9 }}>state /<br/><span style={{ color: t.accent }}>signal.</span></div>
    </div>
  </div>;
  // Paper + rule
  const paper = <div style={{ width: '100%', height: '100%', background: '#f4efde', padding: 18, position: 'relative' }}>
    <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.8 }}>paper.</div>
    <div style={{ position: 'absolute', left: 16, right: 16, top: 60, height: 1, background: t.ink, opacity: 0.3 }}/>
    <div style={{ position: 'absolute', left: 16, right: 16, top: 80, height: 1, background: t.ink, opacity: 0.15 }}/>
    <div style={{ position: 'absolute', left: 16, right: 16, top: 100, height: 1, background: t.ink, opacity: 0.08 }}/>
  </div>;
  return (
    <BPanel label="b-12 · textures / motifs" w={960} h={300} bg={t.bg} fg={t.ink}>
      <BKicker color={t.accent}>MOTIFS · BG SYSTEM</BKicker>
      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <Swatch label="ECG · SIGNAL">{ecg}</Swatch>
        <Swatch label="GRID · PAPER">{grid}</Swatch>
        <Swatch label="INK · HERO">{ink}</Swatch>
        <Swatch label="PAPER · EDITORIAL">{paper}</Swatch>
      </div>
    </BPanel>
  );
}

Object.assign(window, {
  B_DeviceWrapper, B_BrowserWrapper, B_SectionHeader, B_CTAStrip,
  B_StatCards, B_FeatureCards, B_Pricing, B_CompareBlock,
  B_QuoteBlock, B_Chips, B_Stickers, B_Textures,
});
