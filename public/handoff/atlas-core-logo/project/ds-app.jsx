// ds-app.jsx — atlas.core design system document.
// A single-page, scrollable & printable reference.
// Reads like an editorial spec sheet: identity → palette → type
// → shape → motif → components → voice → export.

function Masthead() {
  return (
    <header style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        borderBottom: '1px solid var(--ink)', paddingBottom: 20,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--mute)' }}>
          atlas systems / sf · internal
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--mute)' }}>
          ds v 1.0 · apr 2026 · 24 pp
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 40, padding: '60px 0 20px' }}>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2.4,
            textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 28,
          }}>
            the design system
          </div>
          <Wordmark size={132} />
          <p style={{
            marginTop: 36, maxWidth: 620,
            fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400,
            letterSpacing: -0.4, lineHeight: 1.35, color: 'var(--ink)',
          }}>
            A health operating system — calm, analytical, and editorial. Built for people who measure.
          </p>
          <p style={{ marginTop: 12, maxWidth: 620, fontSize: 15, lineHeight: 1.55, color: 'var(--dim)' }}>
            This document is the source of truth for atlas.core's visual language — identity, palette, type, shape, motif, and the components that carry them. Everything ships in this vocabulary or it does not ship.
          </p>
        </div>
        <HeartMark size={160} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)',
      }}>
        {[
          ['01', 'identity'],
          ['02', 'palette'],
          ['03', 'type'],
          ['04', 'shape · space'],
          ['05', 'motifs'],
          ['06', 'components'],
          ['07', 'voice · content'],
          ['08', 'export · handoff'],
        ].map(([n, t]) => (
          <div key={n} style={{
            padding: '14px 16px',
            borderRight: '1px solid var(--hair)',
            display: 'flex', alignItems: 'baseline', gap: 10,
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>§ {n}</span>
            <span style={{ color: 'var(--ink)' }}>{t}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

// § 01 IDENTITY
function S_Identity() {
  return (
    <DSSection
      index={1}
      eyebrow="identity"
      title="The mark, the wordmark, the dot."
      lede="A filled heart with an ECG trace drawn across its midline. Never tilted, never gradient, never playful. The wordmark sets 'atlas.core' in Archivo Black, lowercase, with a sulfur dot — the only colored glyph in the system."
    >
      <DSGrid cols={3} gap={14}>
        <DSCard eyebrow="heart · mark" meta="96 × 96">
          <div style={{ display: 'grid', placeItems: 'center', height: 220 }}>
            <HeartMark size={148} />
          </div>
        </DSCard>
        <DSCard eyebrow="wordmark · primary" meta="lowercase · sulfur dot">
          <div style={{ display: 'grid', placeItems: 'center', height: 220 }}>
            <Wordmark size={58} />
          </div>
        </DSCard>
        <DSCard eyebrow="lockup · dark" meta="reversed on ink" dark>
          <div style={{ display: 'grid', placeItems: 'center', height: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <HeartMark size={64} color="var(--paper)" accent="var(--accent)" />
              <Wordmark size={38} dark />
            </div>
          </div>
        </DSCard>
      </DSGrid>

      <DSGrid cols={2} gap={14} style={{ marginTop: 14 }}>
        <DSCard eyebrow="construction" meta="12-unit grid">
          <svg viewBox="0 0 96 96" width="100%" style={{ maxHeight: 220 }}>
            <rect x="0" y="0" width="96" height="96" fill="none" stroke="var(--ink)" strokeWidth="0.3" opacity="0.25" />
            {[12,24,36,48,60,72,84].map(v => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="96" stroke="var(--ink)" strokeWidth="0.2" opacity="0.18" />
                <line x1="0" y1={v} x2="96" y2={v} stroke="var(--ink)" strokeWidth="0.2" opacity="0.18" />
              </g>
            ))}
            <path d="M48,84 C 26,68 8,54 8,34 C 8,20 19,10 32,10 C 40,10 45,14 48,20 C 51,14 56,10 64,10 C 77,10 88,20 88,34 C 88,54 70,68 48,84 Z" fill="var(--ink)" opacity="0.92" />
            <path d="M8 50 L26 50 L32 38 L38 62 L44 50 L88 50" fill="none" stroke="var(--accent)" strokeWidth="3.6" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </DSCard>
        <DSCard eyebrow="don't" meta="3 violations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Do not tilt', caption: 'the mark is never rotated', visual: (
                <div style={{ transform: 'rotate(-14deg)' }}>
                  <HeartMark size={64} />
                </div>
              )},
              { label: 'Do not outline', caption: 'the heart is a filled shape, not a line', visual: (
                <svg width="64" height="64" viewBox="0 0 96 96">
                  <path d="M48,84 C 26,68 8,54 8,34 C 8,20 19,10 32,10 C 40,10 45,14 48,20 C 51,14 56,10 64,10 C 77,10 88,20 88,34 C 88,54 70,68 48,84 Z" fill="none" stroke="var(--ink)" strokeWidth="5" />
                </svg>
              )},
              { label: 'Do not change the dot', caption: 'the dot is always sulfur — never red, never any other hue', visual: (
                <div style={{ fontFamily: 'var(--brand)', fontSize: 22, lineHeight: 1, letterSpacing: -1, textTransform: 'lowercase', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                  atlas<span style={{ color: '#e8391f' }}>.</span>core
                </div>
              )},
            ].map((d, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'minmax(120px, max-content) 1fr auto',
                alignItems: 'center', gap: 20, padding: '14px 0',
                borderBottom: i === 2 ? 'none' : '1px solid var(--hair)',
              }}>
                <div style={{ position: 'relative', display: 'grid', placeItems: 'center', minHeight: 80, padding: '0 12px' }}>
                  {d.visual}
                  {/* Red diagonal slash to signal "forbidden" */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'grid', placeItems: 'stretch' }}>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <line x1="8" y1="88" x2="92" y2="12" stroke="#e8391f" strokeWidth="1.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 600, letterSpacing: -0.1 }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 3, lineHeight: 1.45 }}>{d.caption}</div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: '#e8391f', fontWeight: 700 }}>✕</div>
              </div>
            ))}
          </div>
        </DSCard>
      </DSGrid>
    </DSSection>
  );
}

// § 02 PALETTE
function S_Palette() {
  return (
    <DSSection
      index={2}
      eyebrow="palette"
      title="Ink. Paper. Sulfur."
      lede="Every palette is a three-chord structure: ink (near-black foreground), paper (warm neutral background), accent (saturated signal). Six interchangeable pairs ship with the system — noir / sulfur is the default; others are reserved for specific surfaces."
    >
      <DSGrid cols={3} gap={12}>
        {PALETTES.map(p => <PaletteCard key={p.id} p={p} />)}
      </DSGrid>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>
          2.2 · text hierarchy · derived from ink
        </div>
        <HierarchyRow />
      </div>
    </DSSection>
  );
}

// § 03 TYPE
function S_Type() {
  return (
    <DSSection
      index={3}
      eyebrow="type"
      title="Three voices, no more."
      lede="SF Pro is the app's voice. SF Mono is the voice of data. Archivo Black is reserved for the brand — splash, wordmark, manifesto moments. Inter is a web fallback for SF Pro."
    >
      <DSGrid cols={3} gap={14}>
        <TypeSpec
          voice="display · 01"
          family="SF Pro Display"
          use="numbers · headlines · screen titles"
          sample="415"
          size={88} weight={700} tracking={-3}
          display
        />
        <TypeSpec
          voice="mono · 02"
          family="SF Mono / JetBrains Mono"
          use="labels · timestamps · boot logs"
          sample="0 6 : 4 2"
          size={48} weight={500} tracking={2}
          mono
        />
        <TypeSpec
          voice="brand · 03"
          family="Archivo Black"
          use="splash · wordmark · manifesto"
          sample="atlas.core"
          size={36} weight={900} tracking={-1.4}
          brand
        />
      </DSGrid>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>
          3.2 · scale · 9 stops
        </div>
        <TypeScale />
      </div>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>
          3.3 · pairing rules
        </div>
        <DSGrid cols={3} gap={14}>
          <DSCard eyebrow="rule · 01" meta="mandatory">
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>
              All numbers in the UI set in <strong>tabular-nums</strong>. Digits must stack without drift in tables, row values, and vital readouts.
            </div>
          </DSCard>
          <DSCard eyebrow="rule · 02" meta="mandatory">
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>
              Labels, timestamps, and metadata always mono. Nouns and sentences always SF Pro. Never the reverse.
            </div>
          </DSCard>
          <DSCard eyebrow="rule · 03" meta="reserve">
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>
              Archivo Black is reserved. It does not appear in settings, forms, tables, or any row-level UI.
            </div>
          </DSCard>
        </DSGrid>
      </div>
    </DSSection>
  );
}

// § 04 SHAPE + SPACE
function S_Shape() {
  return (
    <DSSection
      index={4}
      eyebrow="shape · space"
      title="Soft brutalism."
      lede="Surfaces soften. Utility stays sharp. Hard corners survive only on dividers, ticks, progress segments, and ECG traces. Everything a finger can touch gets a radius."
    >
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>
        4.1 · radius scale
      </div>
      <RadiiRow />

      <div style={{ marginTop: 32, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>
        4.2 · spacing · 4-pt base
      </div>
      <SpacingScale />
    </DSSection>
  );
}

// § 05 MOTIFS
function S_Motifs() {
  return (
    <DSSection
      index={5}
      eyebrow="motifs"
      title="ECG, ring, stamp."
      lede="Three repeating marks give the system its signature. The ECG trace appears in the splash, the share card, the inline spark, and severed in the offline state. The readiness ring sits at the center of Today. The stamp encodes artifacts — PR, workout, lift family."
    >
      <DSGrid cols={3} gap={14}>
        <DSCard eyebrow="motif · 01" meta="ECG signal">
          <div style={{ display: 'grid', placeItems: 'center', height: 180 }}>
            <ECGTrace w={320} h={72} />
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--dim)' }}>
            One canonical beat pattern — reused at any width. Stroke weight scales with size: 2.2px at 72h, 3.6px at 120h+.
          </div>
        </DSCard>
        <DSCard eyebrow="motif · 02" meta="readiness ring">
          <div style={{ display: 'grid', placeItems: 'center', height: 180 }}>
            <ReadinessRing size={150} value={87} />
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--dim)' }}>
            10px thickness, sulfur fill, hair track. Starts at top (−90°). No gradient. Value sits in the center, Display 700, tabular.
          </div>
        </DSCard>
        <DSCard eyebrow="motif · 03" meta="barbell stamp">
          <div style={{ display: 'grid', placeItems: 'center', height: 180 }}>
            <BarbellStamp size={88} />
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--dim)' }}>
            A geometric barbell glyph. Appears in PR rows, gallery tiles, and dashed on empty states (day-zero stamp).
          </div>
        </DSCard>
      </DSGrid>
    </DSSection>
  );
}

// § 06 COMPONENTS
function S_Components() {
  return (
    <DSSection
      index={6}
      eyebrow="components"
      title="The vocabulary."
      lede="A tight set of atoms — chips, buttons, letter stamps, list rows — carry 90% of the UI. If it needs inventing, write it down here first."
    >
      <DSGrid cols={2} gap={14}>
        <DSCard eyebrow="buttons · 3 ranks" meta="primary · secondary · ghost">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button primary>Start workout</Button>
            <Button>Review labs</Button>
            <Button ghost>Skip</Button>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button primary size="sm">Save</Button>
            <Button size="sm">Cancel</Button>
            <Button primary size="lg">Continue →</Button>
          </div>
        </DSCard>

        <DSCard eyebrow="chips · filters · tags" meta="3 variants">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip>all</Chip>
            <Chip filled>push</Chip>
            <Chip>pull</Chip>
            <Chip>legs</Chip>
            <Chip accent>new</Chip>
            <Chip>bench · 3</Chip>
            <Chip>squat · 5</Chip>
          </div>
        </DSCard>

        <DSCard eyebrow="letter stamps · artifact keys" meta="mono · 40 × 40">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <LetterStamp letter="B" />
            <LetterStamp letter="S" />
            <LetterStamp letter="D" />
            <LetterStamp letter="P" />
            <LetterStamp letter="PR" dark />
            <LetterStamp letter="Lb" dark />
          </div>
        </DSCard>

        <DSCard eyebrow="list row · anatomy" meta="stamp · title · value">
          <div style={{ background: 'var(--paper)' }}>
            <ListRow
              stamp={<LetterStamp letter="D" />}
              title="Deadlift"
              meta="apr 18 · 58 days ago"
              value="415"
              valueUnit="lb · e1rm 432"
              accentDot
            />
            <ListRow
              stamp={<LetterStamp letter="B" />}
              title="Bench press"
              meta="apr 16 · rpe 8"
              value="245"
              valueUnit="lb · 3 × 5"
            />
            <ListRow
              stamp={<LetterStamp letter="S" />}
              title="Back squat"
              meta="apr 14 · volume 12.4 t"
              value="325"
              valueUnit="lb · 5 × 5"
            />
          </div>
        </DSCard>
      </DSGrid>
    </DSSection>
  );
}

// § 07 VOICE + CONTENT
function S_Voice() {
  const dos = [
    '"Readiness: 87. Train as planned."',
    '"You deadlifted 415. +10 lb, 58 days."',
    '"Sleep debt: 1h 42m. Push back your next hard day."',
  ];
  const donts = [
    '"You\'re on fire today! Keep the streak alive! 🔥"',
    '"Don\'t let your gains slip — one more workout this week!"',
    '"Woohoo, you hit 10,000 steps! 🎉"',
  ];
  return (
    <DSSection
      index={7}
      eyebrow="voice · content"
      title="Terse. Analytical. No guilt."
      lede="atlas.core talks like an instrument, not a coach in a headband. Report the number, state the consequence, stop. No streaks, no badges, no emoji, no filler encouragement."
    >
      <DSGrid cols={2} gap={14}>
        <DSCard eyebrow="do" meta="03 samples">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dos.map((d, i) => (
              <div key={i} style={{
                padding: '14px 16px', background: 'var(--paper)',
                borderLeft: '3px solid var(--accent)',
                fontFamily: 'var(--display)', fontSize: 16, lineHeight: 1.45, color: 'var(--ink)',
              }}>
                {d}
              </div>
            ))}
          </div>
        </DSCard>
        <DSCard eyebrow="don't" meta="03 samples">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {donts.map((d, i) => (
              <div key={i} style={{
                padding: '14px 16px', background: 'var(--paper)',
                borderLeft: '3px solid #e8391f',
                fontFamily: 'var(--display)', fontSize: 16, lineHeight: 1.45,
                color: 'var(--ink)', opacity: 0.75, textDecoration: 'line-through', textDecorationColor: 'rgba(232,57,31,0.6)',
              }}>
                {d}
              </div>
            ))}
          </div>
        </DSCard>
      </DSGrid>

      <div style={{ marginTop: 28, background: 'var(--ink)', color: 'var(--paper)', padding: '32px 40px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 18 }}>
          the refusal
        </div>
        <div style={{ fontFamily: 'var(--brand)', fontSize: 38, letterSpacing: -1.2, lineHeight: 1.1, textTransform: 'lowercase' }}>
          No streaks. No guilt.<br/>No badges.
        </div>
      </div>
    </DSSection>
  );
}

// § 08 EXPORT / HANDOFF
function S_Export() {
  return (
    <DSSection
      index={8}
      eyebrow="export · handoff"
      title="How this ships."
      lede="Token naming, file structure, and a short checklist for anyone adding to the system."
    >
      <DSGrid cols={2} gap={14}>
        <DSCard eyebrow="tokens · css vars" meta="root">
          <pre style={{
            margin: 0, padding: 20, background: 'var(--ink)', color: 'var(--paper)',
            fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.7, letterSpacing: 0.2,
            overflow: 'auto',
          }}>
{`--ink:    #0a0a0a
--paper:  #efe9da
--accent: #e8b500

--dim:    rgba(10,10,10,.56)
--mute:   rgba(10,10,10,.42)
--faint:  rgba(10,10,10,.22)
--hair:   rgba(10,10,10,.08)

--radius-chip:   8
--radius-button: 12
--radius-input:  14
--radius-card:   18
--radius-sheet:  24`}
          </pre>
        </DSCard>

        <DSCard eyebrow="checklist · before merge" meta="07 items">
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9, color: 'var(--ink)' }}>
            <li>Uses tokens — no hard-coded hex or pixel radii.</li>
            <li>Numbers set tabular, mono labels, SF Pro body.</li>
            <li>No emoji. No gradients. No filler microcopy.</li>
            <li>ECG / ring / stamp reused — no new motifs without review.</li>
            <li>Works on ink AND paper; dark is first-class.</li>
            <li>Hit targets ≥ 44 px on mobile.</li>
            <li>If it breaks voice (§ 07), it does not ship.</li>
          </ol>
        </DSCard>
      </DSGrid>

      <div style={{
        marginTop: 28,
        display: 'grid', gridTemplateColumns: '1fr auto',
        alignItems: 'center', gap: 24,
        padding: '24px 32px', background: 'var(--accent)', color: 'var(--ink)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 8 }}>
            one sentence
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.25 }}>
            Ink, paper, sulfur. SF Pro, SF Mono, Archivo Black. Heart, ECG, ring, stamp. That's the system.
          </div>
        </div>
        <HeartMark size={88} />
      </div>
    </DSSection>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 96, paddingTop: 24, borderTop: '1px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--mute)' }}>
      <span>© 2026 atlas systems</span>
      <span>ds v 1.0 · apr 2026</span>
      <span>maintained by design · sf</span>
    </footer>
  );
}

function PrintBtn() {
  return (
    <button
      className="no-print"
      onClick={() => window.print()}
      style={{
        position: 'fixed', right: 20, bottom: 20, zIndex: 20,
        padding: '12px 16px',
        background: 'var(--ink)', color: 'var(--paper)', border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.6,
        textTransform: 'uppercase', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
      <span style={{ width: 6, height: 6, background: 'var(--accent)' }} />
      print / save pdf
    </button>
  );
}

function App() {
  return (
    <>
      <Masthead />
      <S_Identity />
      <S_Palette />
      <S_Type />
      <S_Shape />
      <S_Motifs />
      <S_Components />
      <S_Voice />
      <S_Export />
      <Footer />
      <PrintBtn />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
