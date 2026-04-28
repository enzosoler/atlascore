// splash.jsx — atlas.core boot sequence
// Full-page overlay shown on first load. Loops the brand:
//   ink background → ECG draws across → heart pulses → wordmark
//   resolves → manifesto + progress + boot log → fade out.
// Re-triggerable from the canvas via the "Replay splash" sticker.

(function () {
  const SEEN_KEY = 'atlas_splash_seen_v3';

  // Tokens read directly from window so it stays palette-aware.
  const palette = () => window.ACTheme || { ink: '#0a0a0a', bg: '#efe9da', accent: '#e8b500' };

  const FONTS = {
    display: '-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
    brand: '"Archivo Black", "Arial Black", sans-serif',
  };

  const BOOT_LINES = [
    'init  · system kernel',
    'mount · biomarker stream',
    'sync  · apple health · whoop · function',
    'load  · readiness model · v 4.2',
    'tune  · coach · direct mode',
    'open  · today',
  ];

  function HeartMarkInline({ size = 96, color, accent, pulse }) {
    // Inline copy of the heart mark so splash doesn't depend on file load order.
    const cx = 48, w = 96, h = 96;
    const path = "M48,84 C 26,68 8,54 8,34 C 8,20 19,10 32,10 C 40,10 45,14 48,20 C 51,14 56,10 64,10 C 77,10 88,20 88,34 C 88,54 70,68 48,84 Z";
    const ecg = "M8 50 L26 50 L32 38 L38 62 L44 50 L88 50";
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
        <path d={path} fill={color}
          style={{
            transformOrigin: '48px 48px',
            animation: pulse ? 'ac-heart-pulse 1.4s ease-in-out infinite' : 'none',
          }} />
        <path d={ecg}
          fill="none" stroke={accent} strokeWidth="3.6"
          strokeLinecap="square" strokeLinejoin="miter"
          strokeDasharray="200" strokeDashoffset="200"
          style={{ animation: 'ac-ecg-draw 1600ms cubic-bezier(.6,.05,.2,1) 350ms forwards' }} />
      </svg>
    );
  }

  function Splash({ onDone, manual }) {
    const p = palette();
    const [progress, setProgress] = React.useState(0);
    const [logIdx, setLogIdx] = React.useState(0);
    const [phase, setPhase] = React.useState('boot'); // boot → reveal → manifesto → out
    const [out, setOut] = React.useState(false);

    React.useEffect(() => {
      // Progress bar — ease-out toward 100 over ~3.0s
      const start = performance.now();
      const dur = 3000;
      let raf;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 2.4);
        setProgress(eased * 100);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);

    React.useEffect(() => {
      // Cycle boot log lines
      const id = setInterval(() => setLogIdx(i => (i + 1) % BOOT_LINES.length), 480);
      return () => clearInterval(id);
    }, []);

    React.useEffect(() => {
      const t1 = setTimeout(() => setPhase('reveal'), 650);
      const t2 = setTimeout(() => setPhase('manifesto'), 1500);
      const t3 = setTimeout(() => setOut(true), 3300);
      const t4 = setTimeout(() => onDone?.(), 3900);
      return () => { [t1,t2,t3,t4].forEach(clearTimeout); };
    }, [onDone]);

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: p.ink, color: p.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', justifyContent: 'space-between',
        padding: '40px 48px',
        opacity: out ? 0 : 1,
        transition: 'opacity 600ms cubic-bezier(.4,0,.2,1)',
        pointerEvents: out ? 'none' : 'auto',
        overflow: 'hidden',
        fontFamily: FONTS.display,
      }}>
        <style>{`
          @keyframes ac-heart-pulse {
            0%,100% { transform: scale(1); }
            45%     { transform: scale(1.08); }
            55%     { transform: scale(0.98); }
          }
          @keyframes ac-ecg-draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes ac-fade-up {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ac-blink { 50% { opacity: 0.2; } }
          @keyframes ac-slide-trace {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .ac-stagger > * { opacity: 0; animation: ac-fade-up 700ms cubic-bezier(.2,.8,.2,1) forwards; }
          .ac-stagger > *:nth-child(1) { animation-delay: 1500ms; }
          .ac-stagger > *:nth-child(2) { animation-delay: 1700ms; }
          .ac-stagger > *:nth-child(3) { animation-delay: 1900ms; }
        `}</style>

        {/* ── TOP BAR ── identity + build ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 0.6,
          color: 'rgba(239,233,218,0.5)', textTransform: 'uppercase',
        }}>
          <span>atlas.core / v 2.4.1 · build 8412</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 6, height: 6, background: p.accent, borderRadius: 0,
              animation: 'ac-blink 1.2s ease-in-out infinite',
            }} />
            booting
          </span>
        </div>

        {/* ── CENTER ── mark + wordmark ── */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 28, position: 'relative',
        }}>
          {/* Faint horizontal ECG trace strip behind everything */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 1, background: `linear-gradient(90deg, transparent, ${p.accent} 20%, ${p.accent} 80%, transparent)`,
            opacity: 0.12, transform: 'translateY(-0.5px)',
          }} />

          {/* Mark */}
          <div style={{
            opacity: phase === 'boot' ? 0 : 1,
            transform: phase === 'boot' ? 'scale(0.94)' : 'scale(1)',
            transition: 'opacity 600ms ease, transform 600ms cubic-bezier(.2,.8,.2,1)',
            position: 'relative',
          }}>
            <HeartMarkInline size={104} color={p.bg} accent={p.accent} pulse={phase !== 'boot'} />
          </div>

          {/* Wordmark — Archivo Black, lowercase, with sulfur dot */}
          <div style={{
            opacity: phase === 'boot' ? 0 : 1,
            transform: phase === 'boot' ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 700ms ease 200ms, transform 700ms cubic-bezier(.2,.8,.2,1) 200ms',
            fontFamily: FONTS.brand,
            fontSize: 'clamp(48px, 8vw, 84px)',
            letterSpacing: -3.5,
            lineHeight: 0.9,
            color: p.bg,
            textTransform: 'lowercase',
            display: 'inline-flex', alignItems: 'baseline',
          }}>
            atlas<span style={{ color: p.accent }}>.</span>core
          </div>

          {/* Manifesto sub-line */}
          <div className="ac-stagger" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 0.7,
            color: 'rgba(239,233,218,0.55)', textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            <span>built for people who measure</span>
          </div>
        </div>

        {/* ── BOTTOM ── boot log + progress ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Boot log line */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: FONTS.mono, fontSize: 11, color: 'rgba(239,233,218,0.65)',
            letterSpacing: 0.4, height: 16,
          }}>
            <span style={{ color: p.accent, fontWeight: 700 }}>
              [{String(Math.floor(progress)).padStart(3, ' ')}%]
            </span>
            <span style={{ opacity: 0.85 }}>
              {BOOT_LINES[logIdx]}
            </span>
            <span style={{
              marginLeft: 'auto', color: 'rgba(239,233,218,0.45)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              hr 62 · hrv 71 · spo₂ 98
            </span>
          </div>

          {/* Progress rail — 4 segments, fill sequentially */}
          <div style={{ display: 'flex', gap: 4, height: 4 }}>
            {[0,1,2,3,4,5,6,7].map(i => {
              const segPct = Math.max(0, Math.min(1, (progress / 100) * 8 - i));
              return (
                <div key={i} style={{
                  flex: 1, height: '100%',
                  background: 'rgba(239,233,218,0.08)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: p.accent,
                    transformOrigin: 'left',
                    transform: `scaleX(${segPct})`,
                    transition: 'transform 80ms linear',
                  }} />
                </div>
              );
            })}
          </div>

          {/* Footer caption */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(239,233,218,0.4)',
            letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 4,
          }}>
            <span>day 142 · streak intact</span>
            <span>© 2026 atlas systems · sf</span>
          </div>
        </div>

        {/* Skip — only visible after a beat */}
        {!manual && (
          <button
            onClick={() => { setOut(true); setTimeout(() => onDone?.(), 500); }}
            style={{
              position: 'absolute', top: 36, right: 48,
              background: 'transparent', color: 'rgba(239,233,218,0.5)',
              border: 'none', padding: '8px 12px',
              fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 0.6,
              textTransform: 'uppercase', cursor: 'pointer',
              opacity: phase === 'manifesto' ? 1 : 0,
              transition: 'opacity 400ms ease',
            }}
          >
            skip →
          </button>
        )}
      </div>
    );
  }

  // Boot host — mounts in its own root so it survives canvas re-renders.
  function bootSplash({ force = false } = {}) {
    if (!force) {
      try { if (sessionStorage.getItem(SEEN_KEY)) return; } catch (e) {}
    }
    const host = document.createElement('div');
    host.id = '__atlas_splash_host';
    document.body.appendChild(host);
    const root = ReactDOM.createRoot(host);
    const close = () => {
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
      root.unmount();
      host.remove();
    };
    root.render(<Splash onDone={close} manual={force} />);
  }

  // Tiny floating button so users can replay it.
  function ReplayButton() {
    return (
      <button
        onClick={() => bootSplash({ force: true })}
        title="Replay boot sequence"
        style={{
          position: 'fixed', left: 16, bottom: 16, zIndex: 50,
          padding: '8px 12px',
          background: '#0a0a0a', color: '#efe9da',
          border: 'none', cursor: 'pointer',
          fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1.4,
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        }}
      >
        <span style={{ width: 6, height: 6, background: '#e8b500' }} />
        replay splash
      </button>
    );
  }

  // Public API
  window.AtlasSplash = { boot: bootSplash, ReplayButton };

  // Auto-boot on first load (after React + DOM ready).
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => bootSplash(), 50);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => bootSplash(), 50));
  }
})();
