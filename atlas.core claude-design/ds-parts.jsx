// ds-parts.jsx — atomic cells for the atlas.core design system doc.
// Each cell is designed at a spec density (labels, values, mono captions)
// that matches the brand voice: analytical, terse, editorial.

// ── LAYOUT PRIMITIVES ────────────────────────────────────────────

function DSDivider({ accent }) {
  return (
    <div style={{
      height: 1, background: accent ? 'var(--accent)' : 'var(--hair)',
      width: '100%', margin: 0,
    }} />
  );
}

// Section header: big mono index + title block + long rule.
function DSSection({ index, eyebrow, title, lede, children, break: br }) {
  return (
    <section className={br ? 'page-break' : ''} style={{ marginTop: 72 }}>
      <header style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 40, alignItems: 'start', paddingBottom: 28, borderBottom: '1px solid var(--ink)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, color: 'var(--mute)', textTransform: 'uppercase', paddingTop: 8 }}>
          § {String(index).padStart(2, '0')}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
            {eyebrow}
          </div>
          <h2 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: 44, fontWeight: 700, letterSpacing: -1.3, lineHeight: 1.02 }}>
            {title}
          </h2>
          {lede && (
            <p style={{ margin: '14px 0 0', maxWidth: 640, fontSize: 15, lineHeight: 1.55, color: 'var(--dim)' }}>
              {lede}
            </p>
          )}
        </div>
      </header>
      <div style={{ marginTop: 36 }}>{children}</div>
    </section>
  );
}

// Spec card: flat card with a tiny mono eyebrow and content.
function DSCard({ eyebrow, meta, children, dark, pad = 24, style }) {
  return (
    <div style={{
      background: dark ? 'var(--ink)' : 'var(--card)',
      color: dark ? 'var(--paper)' : 'var(--ink)',
      padding: pad,
      position: 'relative',
      ...style,
    }}>
      {eyebrow && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 18,
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: dark ? 'rgba(239,233,218,0.55)' : 'var(--mute)',
        }}>
          <span>{eyebrow}</span>
          {meta && <span>{meta}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function DSGrid({ cols = 2, gap = 18, children, style }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
      ...style,
    }}>{children}</div>
  );
}

// ── IDENTITY ─────────────────────────────────────────────────────

function HeartMark({ size = 120, color = 'var(--ink)', accent = 'var(--accent)' }) {
  const path = "M48,84 C 26,68 8,54 8,34 C 8,20 19,10 32,10 C 40,10 45,14 48,20 C 51,14 56,10 64,10 C 77,10 88,20 88,34 C 88,54 70,68 48,84 Z";
  const ecg = "M8 50 L26 50 L32 38 L38 62 L44 50 L88 50";
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      <path d={path} fill={color} />
      <path d={ecg} fill="none" stroke={accent} strokeWidth="3.6" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function Wordmark({ size = 72, dark, style }) {
  return (
    <div style={{
      fontFamily: 'var(--brand)',
      fontSize: size,
      letterSpacing: -size * 0.04,
      lineHeight: 0.9,
      color: dark ? 'var(--paper)' : 'var(--ink)',
      textTransform: 'lowercase',
      ...style,
    }}>
      atlas<span style={{ color: 'var(--accent)' }}>.</span>core
    </div>
  );
}

// ── PALETTE ──────────────────────────────────────────────────────

const PALETTES = [
  { id: 'noir-sulfur',  name: 'noir / sulfur',  ink: '#0a0a0a', bg: '#efe9da', accent: '#e8b500', use: 'default · brand system' },
  { id: 'carbon-blood', name: 'carbon / blood', ink: '#0a0a0a', bg: '#eceae5', accent: '#e8391f', use: 'alerts · PR moments' },
  { id: 'jet-sunset',   name: 'jet / sunset',   ink: '#111111', bg: '#efe6d8', accent: '#ff5f1f', use: 'launch · marketing' },
  { id: 'steel-cyan',   name: 'steel / cyan',   ink: '#0a1020', bg: '#e6e8ee', accent: '#00c8ff', use: 'labs · data-heavy' },
  { id: 'oxblood-bone', name: 'oxblood / bone', ink: '#2a0a10', bg: '#ece4d6', accent: '#c2391a', use: 'limited / seasonal' },
  { id: 'pitch-white',  name: 'pitch / white',  ink: '#050505', bg: '#fafafa', accent: '#050505', use: 'editorial · print' },
];

function PaletteCard({ p }) {
  return (
    <div style={{ background: p.bg, padding: 20, paddingBottom: 18 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[
          { c: p.ink, label: 'ink' },
          { c: p.bg, label: 'paper', border: true },
          { c: p.accent, label: 'accent' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: 68, background: s.c,
              border: s.border ? '1px solid rgba(10,10,10,0.08)' : 'none',
            }} />
            <div style={{
              marginTop: 6, display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.2,
              textTransform: 'uppercase', color: p.ink, opacity: 0.6,
            }}>
              <span>{s.label}</span>
              <span>{s.c.replace('#', '')}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        borderTop: '1px solid ' + p.ink + '22', paddingTop: 12,
      }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 600, color: p.ink, letterSpacing: -0.3 }}>
          {p.name}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: p.ink, opacity: 0.55 }}>
          {p.use}
        </div>
      </div>
    </div>
  );
}

// Hierarchy stops — dim / mute / faint / hair as applied to a text line
function HierarchyRow() {
  const rows = [
    { op: 1,    token: 'fg',    hex: '#0a0a0a', use: 'body · primary' },
    { op: 0.56, token: 'dim',   hex: 'rgba(10,10,10,0.56)', use: 'secondary · values' },
    { op: 0.42, token: 'mute',  hex: 'rgba(10,10,10,0.42)', use: 'labels · captions' },
    { op: 0.22, token: 'faint', hex: 'rgba(10,10,10,0.22)', use: 'placeholders' },
    { op: 0.08, token: 'hair',  hex: 'rgba(10,10,10,0.08)', use: 'dividers · rules' },
  ];
  return (
    <div style={{ background: 'var(--card)' }}>
      {rows.map((r, i) => (
        <div key={r.token} style={{
          display: 'grid', gridTemplateColumns: '90px 1fr 120px',
          alignItems: 'center', gap: 20,
          padding: '16px 20px',
          borderTop: i === 0 ? 'none' : '1px solid var(--hair)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(10,10,10,' + r.op + ')', letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {r.token}
          </div>
          <div style={{ color: 'rgba(10,10,10,' + r.op + ')', fontFamily: 'var(--body)', fontSize: 15 }}>
            {r.use}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mute)', letterSpacing: 0.6, textAlign: 'right' }}>
            {r.op === 1 ? 'solid' : (r.op * 100).toFixed(0) + '%'}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TYPE ─────────────────────────────────────────────────────────

function TypeSpec({ voice, family, use, sample, size = 36, weight = 400, tracking = 0, mono, display, brand }) {
  const font = brand ? 'var(--brand)' : mono ? 'var(--mono)' : display ? 'var(--display)' : 'var(--body)';
  return (
    <div style={{ background: 'var(--card)', padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
          {voice}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--mute)' }}>
          {family}
        </div>
      </div>
      <div style={{
        fontFamily: font, fontSize: size, fontWeight: weight,
        letterSpacing: tracking, lineHeight: 1, color: 'var(--ink)',
      }}>
        {sample}
      </div>
      <div style={{
        borderTop: '1px solid var(--hair)', paddingTop: 14,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.2,
        textTransform: 'uppercase', color: 'var(--mute)',
      }}>
        <span>{use}</span>
        <span>{weight} · {size}px · track {tracking}</span>
      </div>
    </div>
  );
}

function TypeScale() {
  const rows = [
    { size: 64, weight: 700, tracking: -2.4, name: 'display / xl',   use: 'hero numbers · PR moments' },
    { size: 44, weight: 700, tracking: -1.3, name: 'display / lg',   use: 'section titles · screen H1' },
    { size: 28, weight: 600, tracking: -0.6, name: 'display / md',   use: 'card headers · modal titles' },
    { size: 22, weight: 600, tracking: -0.4, name: 'display / sm',   use: 'list section heads' },
    { size: 17, weight: 600, tracking: -0.2, name: 'body / strong',  use: 'list titles · buttons' },
    { size: 15, weight: 400, tracking: 0,    name: 'body / default', use: 'paragraph · rows' },
    { size: 13, weight: 500, tracking: 0.1,  name: 'body / small',   use: 'captions · helper' },
    { size: 11, weight: 500, tracking: 0.4,  name: 'mono / label',   use: 'labels · metadata', mono: true },
    { size: 10, weight: 600, tracking: 1.8,  name: 'mono / eyebrow', use: 'eyebrows · tabs', mono: true, caps: true },
  ];
  return (
    <div style={{ background: 'var(--card)' }}>
      {rows.map((r, i) => (
        <div key={r.name} style={{
          display: 'grid', gridTemplateColumns: '160px 1fr 180px 80px',
          alignItems: 'baseline', gap: 24,
          padding: '22px 24px',
          borderTop: i === 0 ? 'none' : '1px solid var(--hair)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--mute)' }}>
            {r.name}
          </div>
          <div style={{
            fontFamily: r.mono ? 'var(--mono)' : 'var(--display)',
            fontSize: r.size, fontWeight: r.weight, letterSpacing: r.tracking,
            lineHeight: 1, color: 'var(--ink)',
            textTransform: r.caps ? 'uppercase' : 'none',
          }}>
            {r.caps ? 'Readiness' : 'Readiness'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{r.use}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mute)', textAlign: 'right', letterSpacing: 0.4 }}>
            {r.size} / {r.weight}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SHAPE / RADII ────────────────────────────────────────────────

function RadiiRow() {
  const rows = [
    { name: 'chip',   r: 8,  use: 'filters · tags · letter stamps' },
    { name: 'button', r: 12, use: 'primary / secondary / ghost' },
    { name: 'input',  r: 14, use: 'fields · segmented controls' },
    { name: 'card',   r: 18, use: 'cards · list rows · sheets' },
    { name: 'sheet',  r: 24, use: 'modals · iOS sheets · drawers' },
  ];
  return (
    <DSGrid cols={5} gap={14}>
      {rows.map(r => (
        <div key={r.name} style={{ background: 'var(--card)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: '100%', aspectRatio: '1 / 1',
            background: 'var(--ink)', borderRadius: r.r,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', left: 8, top: 8,
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.2,
              textTransform: 'uppercase', color: 'var(--accent)',
            }}>
              {r.r}
            </span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{r.name}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--mute)', marginTop: 4 }}>
              {r.use}
            </div>
          </div>
        </div>
      ))}
    </DSGrid>
  );
}

function SpacingScale() {
  const steps = [2, 4, 8, 12, 16, 24, 32, 48, 72];
  return (
    <div style={{ background: 'var(--card)', padding: 28 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
        {steps.map(s => (
          <div key={s} style={{
            width: s, height: s * 1.2,
            background: 'var(--ink)',
            minHeight: 12,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {steps.map(s => (
          <div key={s} style={{
            width: s, minWidth: 20,
            fontFamily: 'var(--mono)', fontSize: 9,
            letterSpacing: 0.6, color: 'var(--mute)',
            textAlign: 'left',
          }}>
            {s}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--mute)' }}>
        4-pt base · doubles at 16 · jumps at 48 / 72
      </div>
    </div>
  );
}

// ── MOTIFS ───────────────────────────────────────────────────────

function ECGTrace({ w = 320, h = 72, color = 'var(--accent)' }) {
  const d = [50,50,50,50,50,50,50,50,45,55,20,80,30,50,50,50,50,50,45,55,20,80,30,50,50,50];
  const step = w / (d.length - 1);
  const pts = d.map((v, i) => `${i * step},${(v / 100) * h}`).join(' L ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

function BarbellStamp({ size = 48, color = 'var(--ink)' }) {
  // Simple two-plate barbell in a square stamp.
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
      <rect x="0" y="0" width="48" height="48" fill="none" />
      <rect x="4"  y="18" width="4" height="12" fill={color} />
      <rect x="9"  y="14" width="5" height="20" fill={color} />
      <rect x="14" y="22" width="20" height="4" fill={color} />
      <rect x="34" y="14" width="5" height="20" fill={color} />
      <rect x="40" y="18" width="4" height="12" fill={color} />
    </svg>
  );
}

function ReadinessRing({ size = 140, value = 87, color = 'var(--accent)', track = 'var(--hair)' }) {
  const t = 10;
  const r = (size - t) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={t} />
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth={t}
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ / 4}
        transform={`rotate(-90 ${cx} ${cx})`}
        strokeLinecap="butt" />
      <text x={cx} y={cx + 2} textAnchor="middle" dominantBaseline="middle"
        fontFamily="var(--display)" fontSize="36" fontWeight="700"
        fill="var(--ink)" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
        {value}
      </text>
    </svg>
  );
}

// ── COMPONENTS ──────────────────────────────────────────────────

function Button({ children, primary, ghost, size = 'md', style }) {
  const pads = { sm: '10px 16px', md: '14px 22px', lg: '18px 28px' };
  const fs   = { sm: 14, md: 15, lg: 17 };
  const bg = primary ? 'var(--accent)' : ghost ? 'transparent' : 'rgba(10,10,10,0.05)';
  const fg = primary ? 'var(--ink)' : 'var(--ink)';
  const br = ghost ? '1px solid var(--ink)' : 'none';
  return (
    <div style={{
      display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8,
      padding: pads[size], background: bg, color: fg, border: br,
      fontFamily: 'var(--body)', fontSize: fs[size], fontWeight: 600,
      letterSpacing: -0.2, borderRadius: 12,
      ...style,
    }}>{children}</div>
  );
}

function Chip({ children, filled, accent }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 10px',
      background: filled ? 'var(--ink)' : accent ? 'var(--accent)' : 'transparent',
      color: filled ? 'var(--paper)' : 'var(--ink)',
      border: filled || accent ? 'none' : '1px solid var(--ink)',
      fontFamily: 'var(--mono)', fontSize: 10,
      letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600,
      borderRadius: 8,
    }}>{children}</span>
  );
}

function LetterStamp({ letter, dark }) {
  return (
    <div style={{
      width: 40, height: 40,
      background: dark ? 'var(--ink)' : 'var(--card2)',
      color: dark ? 'var(--paper)' : 'var(--ink)',
      display: 'grid', placeItems: 'center', borderRadius: 10,
      fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, letterSpacing: 0,
    }}>{letter}</div>
  );
}

function ListRow({ stamp, title, meta, value, valueUnit, accentDot }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center', gap: 16,
      padding: '14px 16px',
      borderBottom: '1px solid var(--hair)',
    }}>
      {stamp}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'var(--body)', fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{title}</div>
          {accentDot && <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--mute)', marginTop: 4 }}>
          {meta}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        {valueUnit && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--mute)', marginTop: 2 }}>
            {valueUnit}
          </div>
        )}
      </div>
    </div>
  );
}

// Expose everything
Object.assign(window, {
  DSSection, DSCard, DSGrid, DSDivider,
  HeartMark, Wordmark,
  PALETTES, PaletteCard, HierarchyRow,
  TypeSpec, TypeScale,
  RadiiRow, SpacingScale,
  ECGTrace, BarbellStamp, ReadinessRing,
  Button, Chip, LetterStamp, ListRow,
});
