// app.jsx — final brand sheet for Heart (Vital) mark

function Card({ label, caption, children, width = 540, height = 280, dark, bg, pad = 28, center = true }) {
  const t = window.useTheme();
  const cardBg = bg ?? (dark ? t.ink : t.bg);
  const fg = dark ? t.bg : t.ink;
  const content = typeof children === 'function' ? children({ color: fg, accent: t.accent }) : children;
  return (
    <DCArtboard label={label} width={width} height={height} style={{ background: cardBg, borderRadius: 0 }}>
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center',
        padding: pad,
      }}>
        {content}
        {caption && (
          <div style={{
            position: 'absolute', bottom: 12, left: 16, right: 16,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
            color: fg, opacity: 0.45,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{caption}</span><span style={{ color: t.accent }}>●</span>
          </div>
        )}
      </div>
    </DCArtboard>
  );
}

// Construction / grid overlay
function Construction() {
  const t = window.useTheme();
  const grid = [];
  for (let i = 0; i <= 8; i++) grid.push(i * 12);
  return (
    <svg width="280" height="280" viewBox="0 0 96 96">
      <rect x="0" y="0" width="96" height="96" fill="none" stroke={t.ink} strokeWidth="0.3" opacity="0.15" />
      {grid.map(v => (
        <g key={v}>
          <line x1={v} y1="0" x2={v} y2="96" stroke={t.ink} strokeWidth="0.2" opacity="0.2" />
          <line x1="0" y1={v} x2="96" y2={v} stroke={t.ink} strokeWidth="0.2" opacity="0.2" />
        </g>
      ))}
      {/* heart shape outline */}
      <path d="M48 82 C 34 72, 10 58, 10 36 C 10 22, 22 12, 32 12 C 40 12, 44 18, 48 24 C 52 18, 56 12, 64 12 C 74 12, 86 22, 86 36 C 86 58, 62 72, 48 82 Z"
        fill={t.ink} opacity="0.9" />
      <path d="M10 50 L30 50 L36 50 L42 42 L48 60 L54 32 L60 58 L66 50 L86 50"
        fill="none" stroke={t.accent} strokeWidth="3.2" />
      {/* anchor points */}
      {[[48,24],[48,82],[10,36],[86,36],[32,12],[64,12]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill={t.accent} />
      ))}
    </svg>
  );
}

// Palette row
function PaletteRow() {
  const t = window.useTheme();
  return (
    <div style={{ display: 'flex', gap: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}>
      {[
        { name: 'INK', value: t.ink, color: t.bg },
        { name: 'PAPER', value: t.bg, color: t.ink },
        { name: 'ACCENT', value: t.accent, color: t.ink },
      ].map(s => (
        <div key={s.name} style={{ width: 110 }}>
          <div style={{ background: s.value, height: 80, border: '1px solid rgba(0,0,0,0.08)' }} />
          <div style={{ marginTop: 6, letterSpacing: 2, color: t.ink }}>{s.name}</div>
          <div style={{ letterSpacing: 1, color: t.ink, opacity: 0.55, marginTop: 2 }}>{s.value.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

// Type specimen
function TypeSpec() {
  const t = window.useTheme();
  return (
    <div style={{ color: t.ink }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, opacity: 0.55 }}>
        DISPLAY — Archivo Black · 800
      </div>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 52, letterSpacing: -3, lineHeight: 0.95, textTransform: 'lowercase' }}>
        atlas.core
      </div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, opacity: 0.55, marginTop: 14 }}>
        MONO — JetBrains Mono · 500
      </div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, letterSpacing: 2, marginTop: 2 }}>
        BODY · OPERATING · SYSTEM
      </div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, opacity: 0.75, marginTop: 4 }}>
        AaBbCcDd 0123456789 ·❯●
      </div>
    </div>
  );
}

// Favicon set
function FaviconSet() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
      {[16, 24, 32, 48, 64].map(s => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <HeartMark size={s} />
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.5, opacity: 0.55 }}>
            {s}px
          </div>
        </div>
      ))}
    </div>
  );
}

// Don't list
function DontDo({ children, label }) {
  const t = window.useTheme();
  return (
    <div style={{ position: 'relative', padding: 20, background: t.bg, border: `1px solid rgba(0,0,0,0.08)` }}>
      {children}
      <div style={{
        position: 'absolute', top: 8, right: 10,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2,
        color: '#c2391a', fontWeight: 600,
      }}>✗ {label}</div>
    </div>
  );
}

// Phone mockup
function Phone() {
  const t = window.useTheme();
  return (
    <div style={{
      width: 240, height: 480, background: t.ink, borderRadius: 32,
      padding: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        width: '100%', height: '100%', background: t.bg, borderRadius: 24,
        padding: 20, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartMark size={24} />
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, letterSpacing: -0.6, color: t.ink, textTransform: 'lowercase' }}>
            atlas.core
          </div>
        </div>
        <div style={{ marginTop: 24, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.ink, opacity: 0.55 }}>
          TODAY · W·17 · D·4
        </div>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 32, letterSpacing: -1.5, lineHeight: 1, color: t.ink, textTransform: 'lowercase', marginTop: 4 }}>
          heavy<br/>bench day.
        </div>
        <div style={{ marginTop: 20, padding: 14, background: t.ink, color: t.bg, borderRadius: 12 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>
            RECOVERY · 78 / 100
          </div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, marginTop: 4 }}>
            ready
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          padding: 12, textAlign: 'center', background: t.accent, color: t.ink,
          fontFamily: '"Archivo Black", sans-serif', fontSize: 14, letterSpacing: -0.3, borderRadius: 10,
        }}>
          start session →
        </div>
      </div>
    </div>
  );
}

// Business card
function BizCard({ side }) {
  const t = window.useTheme();
  if (side === 'back') {
    return (
      <div style={{ width: 360, height: 220, background: t.ink, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <HeartMark size={48} color={t.bg} accent={t.accent} />
        <div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 28, letterSpacing: -1.3, color: t.bg, textTransform: 'lowercase', lineHeight: 1 }}>
            atlas<span style={{ color: t.accent }}>.</span>core
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2.5, color: t.bg, opacity: 0.55, marginTop: 4 }}>
            BODY · OPERATING · SYSTEM
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: 360, height: 220, background: t.bg, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid rgba(0,0,0,0.08)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HeartMark size={28} />
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 18, letterSpacing: -0.7, color: t.ink, textTransform: 'lowercase' }}>
          atlas<span style={{ color: t.accent }}>.</span>core
        </div>
      </div>
      <div>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, color: t.ink }}>
          Marco Silva
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: t.ink, opacity: 0.6, marginTop: 2 }}>
          FOUNDER / CEO
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: t.ink, opacity: 0.6, marginTop: 10 }}>
          marco@atlas.core · atlas.core
        </div>
      </div>
    </div>
  );
}

function App() {
  const t = window.useTheme();
  return (
    <DesignCanvas>
      <div style={{ padding: '12px 60px 32px', maxWidth: 960 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · v1 — brand sheet · vital
        </div>
        <h1 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 84, letterSpacing: -4, lineHeight: 0.88,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the heart<br />
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>is the core.</span>
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 680 }}>
          Final selection: <b>Heart / Vital</b>. One mark, one wordmark, three colors.
          Built on a 96-unit grid with a tuned ECG trace that reads as a vital sign.
          This sheet is the full system — geometry, palette, type, lockups, favicons,
          app icons, stationery, and usage rules.
        </p>
      </div>

      {/* HERO */}
      <DCSection title="/// 01  The mark" subtitle="One primary. Everything else derives from it.">
        <Card label="Primary" caption="on paper · 200px" width={400} height={380}>
          <HeartMark size={200} />
        </Card>
        <Card label="On ink" caption="inverted · 200px" width={400} height={380} dark>
          {({color, accent}) => <HeartMark size={200} color={color} accent={accent} />}
        </Card>
        <Card label="On accent" caption="notification / marketing" width={400} height={380} bg={t.accent}>
          <HeartMark size={200} color={t.ink} accent={t.ink} />
        </Card>
      </DCSection>

      {/* CONSTRUCTION */}
      <DCSection title="/// 02  Construction" subtitle="96-unit grid · classical two-lobe heart · ECG on horizontal axis.">
        <Card label="Grid & anchors" caption="12u spacing · 6 control points" width={360} height={380}>
          <Construction />
        </Card>
        <Card label="Clear space" caption="x = ¼ mark height" width={360} height={380}>
          <ClearSpace Mark={HeartMark} />
        </Card>
        <Card label="Minimum size" caption="never below 16px" width={360} height={380}>
          <FaviconSet />
        </Card>
      </DCSection>

      {/* LOCKUPS */}
      <DCSection title="/// 03  Lockups" subtitle="Three configurations. Use horizontal as the default.">
        <Card label="Horizontal · primary" caption="app header / site header" width={560}>
          <LockupH Mark={HeartMark} />
        </Card>
        <Card label="Stacked" caption="avatars · icons · cover art" width={320} height={320}>
          <LockupV Mark={HeartMark} />
        </Card>
        <Card label="Tagline" caption="body operating system" width={560}>
          <LockupTag Mark={HeartMark} />
        </Card>
      </DCSection>

      {/* PALETTE + TYPE */}
      <DCSection title="/// 04  Palette & type" subtitle="Three colors, two typefaces. Noir / sulfur is the default.">
        <Card label="Palette" caption="ink · paper · accent" width={440} height={240} center={false}>
          <PaletteRow />
        </Card>
        <Card label="Typography" caption="Archivo Black + JetBrains Mono" width={520} height={240} center={false}>
          <TypeSpec />
        </Card>
      </DCSection>

      {/* APP ICONS */}
      <DCSection title="/// 05  App icons" subtitle="iOS squircle · four approved treatments.">
        <Card label="Paper" width={220} height={260}><AppIconTile Mark={HeartMark} /></Card>
        <Card label="Ink" width={220} height={260}><AppIconTile Mark={HeartMark} bg={t.ink} mark={t.bg} /></Card>
        <Card label="Accent" width={220} height={260}><AppIconTile Mark={HeartMark} bg={t.accent} mark={t.ink} accent={t.ink} /></Card>
        <Card label="Mono" width={220} height={260}><AppIconTile Mark={HeartMark} bg={t.ink} mark={t.bg} accent={t.bg} /></Card>
      </DCSection>

      {/* IN CONTEXT */}
      <DCSection title="/// 06  In context" subtitle="The system at work.">
        <Card label="Mobile app home" width={300} height={540} bg="#e8e5dd">
          <Phone />
        </Card>
        <Card label="Business card · front" width={420} height={280}>
          <BizCard />
        </Card>
        <Card label="Business card · back" width={420} height={280}>
          <BizCard side="back" />
        </Card>
      </DCSection>

      {/* DON'TS */}
      <DCSection title="/// 07  Don't" subtitle="Never do these.">
        <Card label="Misuse" width={700} height={320} center={false}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%' }}>
            <DontDo label="NO ROTATE">
              <div style={{ transform: 'rotate(-12deg)', display: 'flex', justifyContent: 'center' }}>
                <HeartMark size={64} />
              </div>
            </DontDo>
            <DontDo label="NO STROKE">
              <svg width="64" height="64" viewBox="0 0 96 96" style={{ display: 'block', margin: '0 auto' }}>
                <path d="M48 82 C 34 72, 10 58, 10 36 C 10 22, 22 12, 32 12 C 40 12, 44 18, 48 24 C 52 18, 56 12, 64 12 C 74 12, 86 22, 86 36 C 86 58, 62 72, 48 82 Z"
                  fill="none" stroke={t.ink} strokeWidth="3" />
              </svg>
            </DontDo>
            <DontDo label="NO OFF-PALETTE">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <HeartMark size={64} color="#3a8a3a" accent="#88ccff" />
              </div>
            </DontDo>
            <DontDo label="NO SQUISH">
              <div style={{ transform: 'scaleX(1.6) scaleY(0.7)', display: 'flex', justifyContent: 'center' }}>
                <HeartMark size={64} />
              </div>
            </DontDo>
            <DontDo label="NO SHADOW">
              <div style={{ display: 'flex', justifyContent: 'center', filter: 'drop-shadow(4px 6px 0 rgba(0,0,0,0.3))' }}>
                <HeartMark size={64} />
              </div>
            </DontDo>
            <DontDo label="NO TINT">
              <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.4 }}>
                <HeartMark size={64} />
              </div>
            </DontDo>
          </div>
        </Card>
      </DCSection>

      {/* NOTES */}
      <div style={{ padding: '0 60px 80px', maxWidth: 900 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase', color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// delivery
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
          Ready to export. Ping me and I'll hand off:
          <br />— Clean SVGs (primary mark, horizontal lockup, stacked lockup, wordmark-only)
          <br />— Favicon / PWA set (16, 24, 32, 48, 64, 192, 512, apple-touch-icon)
          <br />— App icon PNGs at all iOS / Android sizes
          <br />— A one-pager PDF of this sheet
          <br /><br />
          Or if you want tweaks first: spike style, accent color, or wordmark weight — all live in the Tweaks panel.
        </p>
      </div>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
