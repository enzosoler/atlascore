import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACLine,
} from '../lib/paper.jsx';

function MuscleMap({ color, accent }) {
  return (
    <svg width="86" height="180" viewBox="0 0 86 180" fill="none" style={{ flexShrink: 0 }}>
      {/* back silhouette */}
      <circle cx="43" cy="18" r="11" fill={color} opacity="0.14" />
      <path d="M24 30 L62 30 L58 84 L43 90 L28 84 Z" fill={color} opacity="0.14" />
      {/* glutes - primary */}
      <path d="M28 84 L43 90 L58 84 L62 104 L43 112 L24 104 Z" fill={accent} opacity="0.85" />
      {/* hamstrings - primary */}
      <path d="M30 112 L42 112 L40 156 L32 156 Z" fill={accent} opacity="0.7" />
      <path d="M56 112 L44 112 L46 156 L54 156 Z" fill={accent} opacity="0.7" />
      {/* erectors stripe */}
      <rect x="39" y="32" width="8" height="52" fill={accent} opacity="0.6" />
      {/* calves */}
      <path d="M32 158 L40 158 L38 175 L34 175 Z" fill={color} opacity="0.18" />
      <path d="M48 158 L56 158 L54 175 L50 175 Z" fill={color} opacity="0.18" />
      {/* arms along sides */}
      <path d="M24 30 L16 80 L20 82 L28 36 Z" fill={color} opacity="0.14" />
      <path d="M62 30 L70 80 L66 82 L58 36 Z" fill={color} opacity="0.14" />
      {/* lats/traps - secondary */}
      <path d="M28 34 L39 34 L39 56 L30 60 Z" fill={accent} opacity="0.32" />
      <path d="M58 34 L47 34 L47 56 L56 60 Z" fill={accent} opacity="0.32" />
    </svg>
  );
}

function titleCaseWords(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatDateLabel(value) {
  if (!value) return 'No PR yet';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No PR yet';
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

function defaultHistory() {
  return null;
}

function S27_Exercise_Detail({
  dark = false,
  exercise = null,
  title = 'Deadlift',
  classification = 'LIFT · COMPOUND',
  musclePattern = 'POSTERIOR CHAIN · HINGE PATTERN',
  bestWeight = 415,
  bestUnit = 'lb',
  bestReps = 1,
  bestDate,
  history,
  historyDelta = '+235 lb · 24mo',
  cues,
  muscleEngagement,
  onBack,
  onSave,
  onOpenHistory,
  onLogSet,
  onFavorite,
}) {
  const c = useACT(dark);
  const lineData = Array.isArray(history) && history.length > 0 ? history : defaultHistory();
  const resolvedCues = cues || [
    { n: '01', t: 'Bar over mid-foot', d: 'Start with the bar 1 in from shins' },
    { n: '02', t: 'Neutral spine', d: 'Chest proud, lats tight — no rounding' },
    { n: '03', t: 'Push the floor', d: 'Drive legs down, not the bar up' },
    { n: '04', t: 'Lock knees + hips together', d: 'Finish in one snap at the top' },
  ];
  const resolvedEngagement = Array.isArray(muscleEngagement) && muscleEngagement.length > 0 ? muscleEngagement : null;

  // Stable prop contract helpers
  const exerciseId = (exercise && exercise.id) || titleCaseWords(title);
  const [favorited, setFavorited] = React.useState(false);
  const handleFavorite = () => {
    const next = !favorited;
    setFavorited(next);
    if (typeof onFavorite === 'function') onFavorite({ exerciseId, favorite: next, favoritedAt: Date.now() });
  };
  const handleLog = (payload = {}) => {
    if (typeof onLogSet === 'function') onLogSet({ exerciseId, loggedAt: Date.now(), ...payload });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: onBack ? 'pointer' : 'default' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>{classification}</ACLabel>
        <button type="button" onClick={handleFavorite} aria-pressed={favorited} style={{
          width: 28, height: 28, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', marginRight: 8,
        }}>
          <svg width="14" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-4.35-9-7.02C1.24 11.94 2 7.5 6 6c2.2-.86 4 1 6 3 2-2 3.8-3.86 6-3 4 1.5 4.76 5.94 3 7.98C19 16.65 12 21 12 21z" fill={favorited ? c.accent : 'none'} stroke={c.fg} strokeWidth="1.2" />
          </svg>
        </button>
        <button type="button" onClick={onSave} style={{
          width: 28, height: 28, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: onSave ? 'pointer' : 'default',
        }}>
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 1h10v12L6 10 1 13V1Z" stroke={c.fg} strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 42, fontWeight: 700,
          letterSpacing: -1.8, lineHeight: 0.95, color: c.fg,
        }}>
          {titleCaseWords(title)}.
        </div>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {musclePattern}
        </div>

        {/* Video / demo placeholder */}
        <div style={{
          marginTop: 18, aspectRatio: '16/10',
          background: c.fg, borderRadius: ACRadii.card,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* simple stick-figure deadlift silhouette */}
          <svg width="80%" height="80%" viewBox="0 0 200 120" fill="none">
            <circle cx="80" cy="30" r="8" fill={c.bg} opacity="0.35"/>
            <line x1="80" y1="38" x2="110" y2="70" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            <line x1="110" y1="70" x2="140" y2="70" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            <line x1="110" y1="70" x2="100" y2="110" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            <line x1="140" y1="70" x2="130" y2="110" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            {/* barbell */}
            <line x1="60" y1="95" x2="160" y2="95" stroke={c.accent} strokeWidth="4" strokeLinecap="round"/>
            <rect x="55" y="88" width="8" height="14" fill={c.accent}/>
            <rect x="157" y="88" width="8" height="14" fill={c.accent}/>
            {/* arms */}
            <line x1="80" y1="38" x2="105" y2="95" stroke={c.bg} strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
          </svg>
          <div style={{
            position: 'absolute', left: 14, bottom: 12,
            width: 44, height: 44, borderRadius: 999,
            background: c.bg, color: c.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 2l9 5-9 5V2Z" fill={c.fg}/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', right: 14, bottom: 12,
            fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(239,233,218,0.7)',
            letterSpacing: 0.5,
          }}>00:34</div>
        </div>

        {/* Your all-time */}
        <div style={{
          marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>All-time best</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <ACNum size={40} color={c.fg} weight={700}>{bestWeight}</ACNum>
                <span style={{ fontSize: 12, color: c.dim, fontFamily: ACFonts.mono }}>{bestUnit} × {bestReps}</span>
              </div>
              <ACLabel size={11} color={c.accent} style={{ marginTop: 4, fontWeight: 600 }}>{formatDateLabel(bestDate)}</ACLabel>
            </div>
            <div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>e1RM curve</ACLabel>
              {lineData ? (
                <>
                  <div style={{ marginTop: 8 }}>
                    <ACLine w={130} h={52} dark={dark} data={lineData} />
                  </div>
                  <ACLabel size={11} color={c.accent} style={{ marginTop: 4, fontWeight: 600, textAlign: 'right', display: 'block' }}>{historyDelta}</ACLabel>
                </>
              ) : (
                <ACLabel size={11} color={c.mute} style={{ marginTop: 8 }}>No data yet</ACLabel>
              )}
            </div>
          </div>
        </div>

        {/* Muscle engagement — only shown when real data is available */}
        {resolvedEngagement && (
          <div style={{ marginTop: 22 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Muscle engagement
            </ACLabel>
            <div style={{ marginTop: 12, display: 'flex', gap: 18, alignItems: 'center' }}>
              <MuscleMap color={c.fg} accent={c.accent} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resolvedEngagement.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: r.primary ? 600 : 400, color: r.primary ? c.fg : c.dim, width: 88 }}>
                      {r.m}
                    </div>
                    <div style={{ flex: 1, height: 6, background: c.faint, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${r.p}%`, height: '100%', background: r.primary ? c.accent : c.fg }} />
                    </div>
                    <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, width: 22, textAlign: 'right' }}>{r.p}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form tips — generic, not personalized */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            General form tips
          </ACLabel>
          <ACLabel size={11} color={c.mute} style={{ marginTop: 4, fontStyle: 'italic' }}>
            Based on common movement patterns
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {resolvedCues.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 11, color: c.accent,
                  fontWeight: 700, width: 28,
                }}>{r.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: c.fg }}>{r.t}</div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.d}</ACLabel>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
        <div style={{ flex: 1, opacity: 0.45 }}>
          <ACBtn dark={dark} size="lg" pill block onClick={onOpenHistory}>All sets</ACBtn>
        </div>
        <div style={{ flex: 1.3 }}>
          <ACBtn primary dark={dark} size="lg" pill block onClick={() => handleLog()}>Log set →</ACBtn>
        </div>
      </div>
    </div>
  );
}

export default S27_Exercise_Detail;
