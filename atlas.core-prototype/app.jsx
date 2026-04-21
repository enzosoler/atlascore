// app.jsx — atlas.core app screens, phase 1
// 6 screens × 2 variations × (light + dark) laid out on the design canvas.

// PhoneRow now accepts an array of { Comp, label } — each shown in light + dark.
// Single-variation screens pass one entry; coexisting screens pass two.
function PhoneRow({ title, subtitle, variants, idx }) {
  return (
    <div style={{ marginBottom: 110 }}>
      <div style={{ padding: '0 60px 24px', maxWidth: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3,
            color: 'rgba(60,50,40,0.6)', textTransform: 'uppercase',
          }}>screen {String(idx).padStart(2, '0')}</span>
          <span style={{
            fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: 'rgba(40,30,20,0.9)',
          }}>{title}</span>
        </div>
        {subtitle && <div style={{
          fontSize: 14, color: 'rgba(60,50,40,0.6)', maxWidth: 600,
        }}>{subtitle}</div>}
      </div>

      <div style={{
        display: 'flex', gap: 32, padding: '0 60px',
        alignItems: 'flex-start', width: 'max-content',
      }}>
        {variants.map((v, vi) => (
          <React.Fragment key={vi}>
            {vi > 0 && <div style={{ width: 40 }} />}
            <ACScreen label={v.label} dark={false}><v.Comp dark={false} /></ACScreen>
            <ACScreen label={v.label} dark={true}><v.Comp dark={true} /></ACScreen>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function DesktopRow({ title, subtitle, variants, idx }) {
  return (
    <div style={{ marginBottom: 110 }}>
      <div style={{ padding: '0 60px 24px', maxWidth: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3,
            color: 'rgba(60,50,40,0.6)', textTransform: 'uppercase',
          }}>screen {String(idx).padStart(2, '0')}</span>
          <span style={{
            fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: 'rgba(40,30,20,0.9)',
          }}>{title}</span>
        </div>
        {subtitle && <div style={{
          fontSize: 14, color: 'rgba(60,50,40,0.6)', maxWidth: 720,
        }}>{subtitle}</div>}
      </div>

      <div style={{
        display: 'flex', gap: 32, padding: '0 60px',
        alignItems: 'flex-start', width: 'max-content',
      }}>
        {variants.map((v, vi) => (
          <React.Fragment key={vi}>
            {vi > 0 && <div style={{ width: 40 }} />}
            <div>
              <div style={{
                marginBottom: 12,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                letterSpacing: 2.4,
                textTransform: 'uppercase',
                color: 'rgba(60,50,40,0.6)',
              }}>
                {v.label} · light
              </div>
              <v.Comp dark={false} />
            </div>
            <div>
              <div style={{
                marginBottom: 12,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                letterSpacing: 2.4,
                textTransform: 'uppercase',
                color: 'rgba(60,50,40,0.6)',
              }}>
                {v.label} · dark
              </div>
              <v.Comp dark={true} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function useSwipe(onLeft, onRight) {
  const startX = React.useRef(0);

  return React.useMemo(() => ({
    onTouchStart: (e) => {
      startX.current = e.touches[0]?.clientX || 0;
    },
    onTouchEnd: (e) => {
      const endX = e.changedTouches[0]?.clientX || 0;
      const diff = endX - startX.current;
      if (diff > 50) onRight();
      if (diff < -50) onLeft();
    },
  }), [onLeft, onRight]);
}

function PreviewTopBar({ query, setQuery, currentName, previewFlow, setPreviewFlow, presentation, setPresentation }) {
  return (
    <div style={{
      padding: 12,
      background: 'rgba(12,12,12,0.92)',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(18px)',
    }}>
      <input
        placeholder="Search screen..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          flex: 1,
          minWidth: 0,
          height: 38,
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#191919',
          color: '#f4f1ea',
          padding: '0 12px',
          outline: 'none',
          fontSize: 14,
        }}
      />
      <button onClick={() => setPreviewFlow(null)} style={previewFlow === null ? previewToggleButtonSel : previewToggleButton}>
        Explore
      </button>
      <button onClick={() => setPreviewFlow('onboarding')} style={previewFlow === 'onboarding' ? previewToggleButtonSel : previewToggleButton}>
        Start Onboarding
      </button>
      <button onClick={() => setPresentation((value) => !value)} style={previewToggleButton}>
        Demo Mode
      </button>
      <span style={{
        color: 'rgba(255,255,255,0.58)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {currentName || 'No match'}
      </span>
    </div>
  );
}

const previewToggleButton = {
  height: 38,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#151515',
  color: '#f4f1ea',
  cursor: 'pointer',
  fontSize: 13,
};

const previewToggleButtonSel = {
  ...previewToggleButton,
  background: '#f4f1ea',
  color: '#111',
  borderColor: '#f4f1ea',
};

function PreviewMode() {
  const screenList = window.MOBILE_SCREEN_LIST || [];
  const [index, setIndex] = React.useState(0);
  const [query, setQuery] = React.useState('');
  const [previewFlow, setPreviewFlow] = React.useState(null);
  const [presentation, setPresentation] = React.useState(false);

  const activeScreens = React.useMemo(() => {
    if (!previewFlow) return screenList;
    const flowNames = (window.FLOWS && window.FLOWS[previewFlow]) || [];
    return flowNames
      .map((name) => screenList.find((screen) => screen.name === name))
      .filter(Boolean);
  }, [previewFlow, screenList]);

  const filteredScreens = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return activeScreens;
    return activeScreens.filter((screen) => screen.name.toLowerCase().includes(normalized));
  }, [activeScreens, query]);

  React.useEffect(() => {
    setIndex(0);
  }, [query, previewFlow]);

  React.useEffect(() => {
    setIndex((value) => Math.min(value, Math.max(filteredScreens.length - 1, 0)));
  }, [filteredScreens.length]);

  React.useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;

    const hashedIndex = filteredScreens.findIndex((screen) => screen.name === hash);
    if (hashedIndex >= 0) {
      setIndex(hashedIndex);
      return;
    }

    const inFlow = activeScreens.some((screen) => screen.name === hash);
    if (inFlow) {
      setQuery('');
      const activeIndex = activeScreens.findIndex((screen) => screen.name === hash);
      if (activeIndex >= 0) setIndex(activeIndex);
    }
  }, [activeScreens, filteredScreens]);

  const current = filteredScreens[index] || filteredScreens[0] || null;
  const Screen = current?.Comp || null;

  React.useEffect(() => {
    if (current?.name) window.location.hash = current.name;
  }, [current]);

  const goPrev = React.useCallback(() => {
    setIndex((value) => Math.max(value - 1, 0));
  }, []);

  const goNext = React.useCallback(() => {
    setIndex((value) => Math.min(value + 1, filteredScreens.length - 1));
  }, [filteredScreens.length]);

  const goTo = React.useCallback((name) => {
    const targetIndex = filteredScreens.findIndex((screen) => screen.name === name);
    if (targetIndex >= 0) {
      setIndex(targetIndex);
      return;
    }

    const globalMatch = activeScreens.find((screen) => screen.name === name);
    if (globalMatch) {
      setQuery('');
      const activeIndex = activeScreens.findIndex((screen) => screen.name === name);
      if (activeIndex >= 0) setIndex(activeIndex);
    }
  }, [activeScreens, filteredScreens]);

  const navigationValue = React.useMemo(() => ({
    current,
    goTo,
    goNext,
    goPrev,
    activeScreens,
  }), [activeScreens, current, goNext, goPrev, goTo]);

  const swipe = useSwipe(goNext, goPrev);

  return (
    <window.MockStateProvider>
      <window.PreviewNavigationContext.Provider value={navigationValue}>
        <div style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#050505',
        }}>
          {!presentation && (
            <PreviewTopBar
              query={query}
              setQuery={(value) => {
                setQuery(value);
                setIndex(0);
              }}
              currentName={current?.name}
              previewFlow={previewFlow}
              setPreviewFlow={setPreviewFlow}
              presentation={presentation}
              setPresentation={setPresentation}
            />
          )}

          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: presentation ? 'center' : 'stretch',
            padding: presentation ? 0 : 18,
            background: 'radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 34%), #050505',
          }}>
            <div
              {...swipe}
              style={{
                width: presentation ? '100vw' : 'min(390px, 100%)',
                height: presentation ? '100vh' : '100%',
                maxHeight: presentation ? '100vh' : 844,
                borderRadius: presentation ? 0 : 32,
                overflow: 'hidden',
                background: '#000',
                boxShadow: presentation ? 'none' : '0 20px 60px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {Screen ? <Screen dark={false} /> : (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.62)',
                    fontSize: 14,
                  }}>
                    No screen matches this filter.
                  </div>
                )}
              </div>

              {!presentation && (
                <div style={{
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: '#111',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <button onClick={goPrev} style={previewToggleButton}>Prev</button>
                  <div style={{
                    color: 'rgba(255,255,255,0.58)',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {filteredScreens.length ? `${index + 1}/${filteredScreens.length}` : '0/0'}
                  </div>
                  <button onClick={goNext} style={previewToggleButton}>Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </window.PreviewNavigationContext.Provider>
    </window.MockStateProvider>
  );
}

function App() {
  const [mode, setMode] = React.useState(() => window.location.hash ? 'preview' : 'design');

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        gap: 8,
        background: 'rgba(0,0,0,0.68)',
        padding: '6px 8px',
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
      }}>
        <button onClick={() => setMode('design')} style={mode === 'design' ? previewToggleButtonSel : previewToggleButton}>
          Design
        </button>
        <button onClick={() => setMode('preview')} style={mode === 'preview' ? previewToggleButtonSel : previewToggleButton}>
          Preview
        </button>
      </div>

      {mode === 'design' ? <DesignMode /> : <PreviewMode />}
    </>
  );
}

function DesignMode() {
  const t = window.useTheme();
  return (
    <DesignCanvas>
      {/* Title strip */}
      <div style={{ padding: '12px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 01
        </div>
        <h1 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 84, letterSpacing: -4, lineHeight: 0.88,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the system,<br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>on a phone.</span>
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Six screens from the core loop — welcome, today, active workout, nutrition, paywall, bodyweight.
          Two variations each, paired in light + dark. Everything built from the brand system:
          SF Pro for UI, Archivo Black for brand moments, paper + ink + sulfur, softened corners, ECG as motif, heart as the only icon that matters.
        </p>
        <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['brand', 'archivo black'],
            ['ui', 'sf pro'],
            ['data', 'sf mono'],
            ['paper', t.bg.toUpperCase()],
            ['ink', t.ink.toUpperCase()],
            ['accent', t.accent.toUpperCase()],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 8px', border: '1px solid rgba(0,0,0,0.15)',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2,
              textTransform: 'uppercase', color: 'rgba(40,30,20,0.8)',
            }}>
              <span style={{ opacity: 0.55 }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <PhoneRow idx={1} title="splash / welcome"
        subtitle="Two coexisting entry points. Welcome — Duolingo-energy hero for first open. Manifesto — about/brand moment with ECG divider. Both shown in light + dark."
        variants={[
          { label: 'welcome', Comp: S1_Splash_A },
          { label: 'manifesto', Comp: S1_Splash_B },
        ]} />

      <PhoneRow idx={2} title="today · readiness"
        subtitle="Readiness ring hero + session card + fuel/weight tiles + coach strip. Whoop × Apple Fitness pattern."
        variants={[{ label: 'today', Comp: S2_Today_A }]} />

      <PhoneRow idx={3} title="workout · active session"
        subtitle="Hevy-style logging: progress bar, current-set card with RPE, queued exercises below."
        variants={[{ label: 'workout', Comp: S3_Workout_A }]} />

      <PhoneRow idx={4} title="nutrition · fuel"
        subtitle="Day ledger with macros hero, meal sections, and a quick-capture row (scan / camera / voice / recents) at the top."
        variants={[{ label: 'fuel', Comp: S4_Nutrition_A }]} />

      <PhoneRow idx={5} title="paywall · trial gate"
        subtitle="Two coexisting moments. Plans — Cal AI-style trial comparison. PR moment — post-record upgrade pitch."
        variants={[
          { label: 'plans', Comp: S5_Paywall_A },
          { label: 'pr moment', Comp: S5_Paywall_B },
        ]} />

      <PhoneRow idx={6} title="bodyweight · trend & entry"
        subtitle="Two coexisting screens. Trend — MacroFactor/Happy Scale view with 7-day moving average. Entry — giant number + full number pad modal."
        variants={[
          { label: 'trend', Comp: S6_Weight_A },
          { label: 'entry', Comp: S6_Weight_B },
        ]} />

      {/* ── PHASE 2 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 02
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          onboarding <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the coach</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five-step onboarding (identity → goal → activity → plan preview → permissions), plus two AI coach surfaces — live chat and the morning daily brief.
          Same system, same vocabulary. Light + dark each.
        </p>
      </div>

      <PhoneRow idx={7} title="onboarding · identity"
        subtitle="Step 1 of 5. Sex, age, height. Used for calorie + macro math."
        variants={[{ label: 'identity', Comp: S7_Onboard_Identity }]} />

      <PhoneRow idx={8} title="onboarding · goal"
        subtitle="Step 2 of 5. Four archetypes: lose, recomp, maintain, build. Each with a trend icon."
        variants={[{ label: 'goal', Comp: S8_Onboard_Goal }]} />

      <PhoneRow idx={9} title="onboarding · activity"
        subtitle="Step 3 of 5. Sedentary → athletic on a 5-step ladder, with the TDEE multiplier exposed."
        variants={[{ label: 'activity', Comp: S9_Onboard_Activity }]} />

      <PhoneRow idx={10} title="onboarding · plan preview"
        subtitle="Step 4 of 5. The calculated daily target — kcal + macro split + projected trend."
        variants={[{ label: 'plan', Comp: S10_Onboard_Plan }]} />

      <PhoneRow idx={11} title="onboarding · connect"
        subtitle="Step 5 of 5. HealthKit, notifications, optional wearable. Privacy-forward copy."
        variants={[{ label: 'connect', Comp: S11_Onboard_Permissions }]} />

      <PhoneRow idx={12} title="coach · chat"
        subtitle="Live AI coach thread. Context-aware bubbles, inline suggestion cards, quick-reply chips."
        variants={[{ label: 'chat', Comp: S12_Coach_Chat }]} />

      <PhoneRow idx={13} title="coach · daily brief"
        subtitle="Morning summary. Readiness hero, three-move plan, 14d signal strip. The AI's opening move every day."
        variants={[{ label: 'brief', Comp: S13_Coach_Brief }]} />

      {/* ── PHASE 3 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 03
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          body <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>biology</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five screens for the deeper body layer — composition dashboard, lab results inbox,
          biomarker deep-dive (ApoB), measurements entry, progress photos. Same vocabulary
          extended to a richer dataset.
        </p>
      </div>

      <PhoneRow idx={14} title="body · dashboard"
        subtitle="Composition hero with weight + trend, 3-up tiles (BF%, lean mass, waist:hip), silhouette with measurement rings, and an inbox teaser for flagged biomarkers."
        variants={[{ label: 'body', Comp: S14_Body_Dashboard }]} />

      <PhoneRow idx={15} title="labs · inbox"
        subtitle="Chronological panel list with optimal/elevated/low flags. Summary bar shows the full breakdown across 84 markers."
        variants={[{ label: 'labs', Comp: S15_Labs_Inbox }]} />

      <PhoneRow idx={16} title="biomarker · detail"
        subtitle="ApoB deep-dive. Current value vs optimal band, 24-month trend with optimal overlay, what-drives-this protocol items, coach note CTA."
        variants={[{ label: 'apob', Comp: S16_Biomarker_Detail }]} />

      <PhoneRow idx={17} title="measurements · entry"
        subtitle="Giant tabular number with accent decimal, pill tabs for body sites, mini trend chart, full numeric keypad."
        variants={[{ label: 'entry', Comp: S17_Measurements_Entry }]} />

      <PhoneRow idx={18} title="progress · photos"
        subtitle="Nov → Apr compare hero, then grid of 6 months with stats pinned to each. Photos stay on-device — privacy-forward copy."
        variants={[{ label: 'photos', Comp: S18_Progress_Photos }]} />

      {/* ── PHASE 4 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 04
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          settings <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the edges</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five screens for the system's perimeter — settings, PR gallery, shareable PR card,
          notification inbox + prefs, and three empty/edge states (first run, no data, offline).
          Same system, tested at its rough edges.
        </p>
      </div>

      <PhoneRow idx={19} title="settings · system"
        subtitle="Account, integrations, preferences, data & privacy. iOS-grouped rows with our type discipline — accent dots for integration status, danger-red for destructive actions."
        variants={[{ label: 'settings', Comp: S19_Settings }]} />

      <PhoneRow idx={20} title="PR · gallery"
        subtitle="Personal records as a wall. April summary hero, filter chips by lift family, chronological list with barbell stamp, e1RM, and time-since badges."
        variants={[{ label: 'wall', Comp: S20_PR_Gallery }]} />

      <PhoneRow idx={21} title="PR · share card"
        subtitle="Post-PR share moment, optimized for screenshot → IG. 9:12 aspect. 140px tabular lift number, ECG divider, three-up metadata strip, atlas.core watermark."
        variants={[{ label: 'share', Comp: S21_Share_Card }]} />

      <PhoneRow idx={22} title="notifications · inbox + prefs"
        subtitle="Recent alerts list + granular toggles. Morning brief, PR windows, fuel nudges, lab results, sleep, social. Copy explicitly rejects streak/guilt mechanics."
        variants={[{ label: 'notifs', Comp: S22_Notifications }]} />

      <PhoneRow idx={23} title="states · empty &amp; edges"
        subtitle="Three compact states switchable via pill tabs. First-run empty, no-data chart (pending Function panel), offline with local queue readout."
        variants={[{ label: 'states', Comp: S23_Empty_States }]} />

      {/* ── PHASE 5 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 05
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          programs <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the crew</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five screens that expand the training surface — discover, commit, schedule, deep-dive, compare.
          Library of programs, 5/3/1 BBB program detail, calendar, deadlift exercise page, and a small social layer.
        </p>
      </div>

      <PhoneRow idx={24} title="workout · library"
        subtitle="Filterable program directory. Categories, then cards with duration · sessions/wk · difficulty stamp."
        variants={[{ label: 'library', Comp: S24_Library }]} />

      <PhoneRow idx={25} title="program · 5/3/1 BBB"
        subtitle="Program detail page. 16-week block with percentage progression, day split, and the commit CTA."
        variants={[{ label: 'program', Comp: S25_Program_Detail }]} />

      <PhoneRow idx={26} title="plan · calendar"
        subtitle="Month view with session dots, today highlight, and upcoming list. Reschedule, skip, swap inline."
        variants={[{ label: 'calendar', Comp: S26_Calendar }]} />

      <PhoneRow idx={27} title="exercise · deadlift"
        subtitle="Deep-dive on a lift: 18-month 1RM trend, cues, variants, pattern siblings. The hinge, examined."
        variants={[{ label: 'deadlift', Comp: S27_Exercise_Detail }]} />

      <PhoneRow idx={28} title="crew · leaderboard"
        subtitle="Opt-in micro-social. 5 people you train alongside. Tonnes, PRs, streak — ranked, not gamified."
        variants={[{ label: 'crew', Comp: S28_Crew }]} />

      {/* ── PHASE 6 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 06
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          bookends <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>companions</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Seven final surfaces. Session + week bookends (workout summary, Sunday recap zine),
          biological depth (sleep detail), capture (barcode · photo · voice — one screen, three modes),
          social identity (profile), companion (watch on the wrist), and universal find (search).
        </p>
      </div>

      <PhoneRow idx={29} title="workout · summary"
        subtitle="Post-session. Big headline, four signal grid, volume vs 12-wk avg, lift log with PR stamp, what's next preview."
        variants={[{ label: 'summary', Comp: S29_Workout_Summary }]} />

      <PhoneRow idx={30} title="weekly · recap"
        subtitle="Sunday review as a zine. Issue-numbered, poster-scale type, daily bars, moments feed, next week kicker. The only screen that leans full ink."
        variants={[{ label: 'recap', Comp: S30_Weekly_Recap }]} />

      <PhoneRow idx={31} title="sleep · detail"
        subtitle="Last-night deep-dive. Score + duration hero, stages timeline with deep/light/REM/awake strip, HRV · RHR · resp · temp tiles, coach takeaway."
        variants={[{ label: 'sleep', Comp: S31_Sleep_Detail }]} />

      <PhoneRow idx={32} title="capture · fuel"
        subtitle="Three modes in one surface — barcode scanner with product card, photo recognition with detection pins, voice log with waveform + parsed items."
        variants={[{ label: 'capture', Comp: S32_Capture }]} />

      <PhoneRow idx={33} title="profile · public"
        subtitle="You as shown to the crew. Inverted hero card, big-four PRs, current program strip, composition mini, recent activity. No streaks, no grind badges."
        variants={[{ label: 'profile', Comp: S33_Profile }]} />

      <PhoneRow idx={34} title="watch · companion"
        subtitle="Apple Watch mid-set mirror — drawn as a 44mm device. Weight + reps, rest ring, HR. Plus phone-side mirroring preferences."
        variants={[{ label: 'watch', Comp: S34_Watch }]} />

      <PhoneRow idx={35} title="search · universal"
        subtitle="Query 'deadlift' → top match card, grouped results (lifts · programs · history · articles), coach suggestion prompts. Highlights in accent."
        variants={[{ label: 'search', Comp: S35_Search }]} />

      {/* ── PHASE 7 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 07 · mvp
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the perimeter <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the front door</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Nine screens to close MVP — the entry (auth), the spine (account · subscription · help · legal),
          the content depth (food detail · workout history), and the one public surface on the open web (landing + pricing).
          Same system, carried across eight mobile surfaces and one desktop browser.
        </p>
      </div>

      <PhoneRow idx={36} title="auth · entry"
        subtitle="One field — email, then we handle the rest. Magic-link first, OAuth (Apple, Google) below. Terms footer stays discreet."
        variants={[{ label: 'sign-in', Comp: S36_Auth_Entry }]} />

      <PhoneRow idx={37} title="auth · recover"
        subtitle="Three states in one surface — request · sent · reset. Pill-tab switcher, minimal state machine. No dead-ends."
        variants={[{ label: 'recover', Comp: S37_Auth_Recover }]} />

      <PhoneRow idx={38} title="settings · account"
        subtitle="Identity card, profile section, data export, danger zone. iOS-grouped rows, danger-red for destructive moves."
        variants={[{ label: 'account', Comp: S38_Account_Settings }]} />

      <PhoneRow idx={39} title="settings · subscription"
        subtitle="Inverted plan card — $99/year, the real price the app needs to ship. Manage, cancel, restore — all one tap away."
        variants={[{ label: 'plan', Comp: S39_Subscription }]} />

      <PhoneRow idx={40} title="settings · help"
        subtitle="Search bar + five featured articles + contact rows. Star rating at bottom — the feedback loop stays visible."
        variants={[{ label: 'help', Comp: S40_Help }]} />

      <PhoneRow idx={41} title="settings · legal"
        subtitle="Three-tabbed — terms · privacy · changelog. Reader-friendly typography. Changelog uses dated entries."
        variants={[{ label: 'legal', Comp: S41_Legal }]} />

      <PhoneRow idx={42} title="fuel · food detail"
        subtitle="Chicken breast deep-dive. Inverted kcal tile with ring, stacked-bar macros, portion chips, similar items, add-to-log CTA."
        variants={[{ label: 'food', Comp: S42_Food_Detail }]} />

      <PhoneRow idx={43} title="train · history"
        subtitle="April 2026 — 30-day heat strip, filter chips, eight sessions with PR stamps, month nav. The training ledger, navigable."
        variants={[{ label: 'history', Comp: S43_Workout_History }]} />

      <PhoneRow idx={44} title="web · landing + pricing"
        subtitle="The one desktop surface. Browser-framed hero, product demo, three-column pricing. Same ink + paper + sulfur, scaled up."
        variants={[{ label: 'web', Comp: S44_Web_Landing }]} />

      {/* ── PHASE 8 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 08
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          onboarding <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the deep pass</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Seven screens that complete the onboarding surface — welcome bridge, then five customize steps
          (diet, training, habits, constraints, summary), plus a first-run tour with coachmarks.
          Extends the Phase 2 basics into a fully calibrated profile.
        </p>
      </div>

      <PhoneRow idx={45} title="welcome · post-signup"
        subtitle="Brand moment before onboarding. HeartMark hero, three-pillar summary (train, eat, measure), and the calibration CTA."
        variants={[{ label: 'welcome', Comp: S45_Welcome }]} />

      <PhoneRow idx={46} title="onboarding · diet"
        subtitle="Step 1 of 5 (customize pass). Dietary pattern selector, allergen chips. Shapes food search and meal suggestions."
        variants={[{ label: 'diet', Comp: S46_Onboard_Diet }]} />

      <PhoneRow idx={47} title="onboarding · training"
        subtitle="Step 2 of 5. Experience level, equipment access, preferred style. Feeds the program matcher and exercise filter."
        variants={[{ label: 'training', Comp: S47_Onboard_Training }]} />

      <PhoneRow idx={48} title="onboarding · habits"
        subtitle="Step 3 of 5. Sleep window, step target, water goal, current supplements. Calibrates readiness scoring and coach timing."
        variants={[{ label: 'habits', Comp: S48_Onboard_Habits }]} />

      <PhoneRow idx={49} title="onboarding · constraints"
        subtitle="Step 4 of 5. Injury and condition flags with severity. Filters the exercise pool — not medical advice, just smarter defaults."
        variants={[{ label: 'constraints', Comp: S49_Onboard_Constraints }]} />

      <PhoneRow idx={50} title="onboarding · summary"
        subtitle="Step 5 of 5. Full profile recap — calorie hero, 13 data rows, all editable. The last screen before the app opens."
        variants={[{ label: 'summary', Comp: S50_Onboard_Summary }]} />

      <PhoneRow idx={51} title="tour · coachmarks"
        subtitle="First-run overlay. Four-step walkthrough (readiness ring, quick capture, coach, body) with pointer dots and skip option."
        variants={[{ label: 'tour', Comp: S51_Tour }]} />

      {/* ── PHASE 9 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 09
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the loop <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>extensions</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Eight screens that deepen the core loop — streaks, focus mode, plan overview, progress, insights,
          past workout drill-in, and the routine templates (list + detail). The surfaces that keep users
          coming back after the first week.
        </p>
      </div>

      <PhoneRow idx={52} title="streaks · consistency"
        subtitle="42-day streak hero with ring, 4-month heat grid (miss/partial/complete), milestones with progress bars. No guilt mechanics — just data."
        variants={[{ label: 'streaks', Comp: S52_Streaks }]} />

      <PhoneRow idx={53} title="focus · distraction-free"
        subtitle="Inverted full-screen. One exercise, one set, one rest timer. Volume, duration, progress. The anti-scroll screen."
        variants={[{ label: 'focus', Comp: S53_Focus }]} />

      <PhoneRow idx={54} title="plan · macro view"
        subtitle="5/3/1 BBB block 2. Weeks 9–11 visible, day-level pills, volume trend sparkline. 56% complete, 7 weeks left."
        variants={[{ label: 'plan', Comp: S54_Plan }]} />

      <PhoneRow idx={55} title="progress · overview"
        subtitle="Last 90 days at a glance. 4 delta tiles (weight, BF%, bench, squat), weight trend chart with period switcher, PR list."
        variants={[{ label: 'progress', Comp: S55_Progress }]} />

      <PhoneRow idx={56} title="insights · trends"
        subtitle="Coach-powered pattern detection. Positive (protein consistency), warning (sleep dip), trajectory (bench PR), info (volume creep). Each with a CTA."
        variants={[{ label: 'insights', Comp: S56_Insights }]} />

      <PhoneRow idx={57} title="workout · detail"
        subtitle="Past session drill-in. Upper A — Apr 15. Four stat tiles, full exercise log with set/weight/reps/RPE table, PR stamp on the bench top set."
        variants={[{ label: 'detail', Comp: S57_Workout_Detail }]} />

      <PhoneRow idx={58} title="routines · list"
        subtitle="Six routine templates. Exercises, sets, duration, last used, frequency. Numbered cards, accent for most recent. Create new CTA."
        variants={[{ label: 'routines', Comp: S58_Routines }]} />

      <PhoneRow idx={59} title="routine · detail"
        subtitle="Upper A — Push. 5 exercises, 18 sets, ~50 min. Stats (last used, times run, avg volume). Ordered exercise list with type badges and notes."
        variants={[{ label: 'routine', Comp: S59_Routine_Detail }]} />

      {/* ── PHASE 10 ────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 10
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          domain <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>depth</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Twelve screens that add depth to every domain — nutrition (meal detail, custom food, water log, macro editor),
          body (check-in flow, composition history), labs (exam detail, history, upload),
          coach (home hub, insight detail), and cardio (zones, history, HR).
        </p>
      </div>

      <PhoneRow idx={60} title="nutrition · meal detail"
        subtitle="Lunch drill-in. Inverted macro total (684 kcal), stacked food items with per-item macros. Add food CTA."
        variants={[{ label: 'meal', Comp: S60_Meal_Detail }]} />

      <PhoneRow idx={61} title="nutrition · add food"
        subtitle="Custom food form. Name, brand, serving size, macros (required), micros (optional). Minimal fields, maximal data."
        variants={[{ label: 'add food', Comp: S61_Add_Food }]} />

      <PhoneRow idx={62} title="nutrition · water log"
        subtitle="Ring hero (1.9 of 3.0L), glass grid with check marks, quick-add row (250–750ml), today's log, weekly bar chart."
        variants={[{ label: 'water', Comp: S62_Water }]} />

      <PhoneRow idx={63} title="nutrition · macro targets"
        subtitle="Calorie hero (2,380 kcal), three macro sliders with bars (P/C/F split), preset pills, training-day tip."
        variants={[{ label: 'macros', Comp: S63_Macros }]} />

      <PhoneRow idx={64} title="body · check-in"
        subtitle="Weight entry (83.0 kg, -0.4 delta), 4 measurement tiles, photo upload area, notes field. Save CTA."
        variants={[{ label: 'check-in', Comp: S64_Body_Checkin }]} />

      <PhoneRow idx={65} title="body · composition history"
        subtitle="6-month trend chart (weight/BF%/lean tabs), 6 check-in rows with date, weight, BF%, waist. Latest inverted."
        variants={[{ label: 'composition', Comp: S65_Composition_History }]} />

      <PhoneRow idx={66} title="labs · exam detail"
        subtitle="Comprehensive panel (Mar 15). Summary chips (7 optimal, 2 elevated, 1 low), 10 markers with status bars and ref ranges."
        variants={[{ label: 'exam', Comp: S66_Lab_Exam }]} />

      <PhoneRow idx={67} title="labs · history"
        subtitle="5 panels chronological. Latest inverted. Summary bars (optimal/elevated/low ratio), marker count. Upload CTA."
        variants={[{ label: 'history', Comp: S67_Lab_History }]} />

      <PhoneRow idx={68} title="labs · upload"
        subtitle="Upload area with PDF/photo/CSV support list, choose-file + take-photo CTAs. Privacy note: encrypted, on-device, HIPAA-aligned."
        variants={[{ label: 'upload', Comp: S68_Lab_Upload }]} />

      <PhoneRow idx={69} title="coach · home"
        subtitle="User-side hub. Today's brief (inverted card), active insights list with type borders, pending actions with checkboxes."
        variants={[{ label: 'coach', Comp: S69_Coach_Home }]} />

      <PhoneRow idx={70} title="coach · insight detail"
        subtitle="Protein consistency deep-dive. Supporting data bar chart, HRV delta, recommendation card. Full narrative format."
        variants={[{ label: 'insight', Comp: S70_Coach_Insight }]} />

      <PhoneRow idx={71} title="cardio · detail"
        subtitle="Last 30 days. 3 summary tiles, HR zone breakdown (Z1–Z5 with colored bars), 4 recent sessions."
        variants={[{ label: 'cardio', Comp: S71_Cardio }]} />

      {/* ── PHASE 11 ────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 11
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          settings <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the plumbing</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Eight screens that handle the infrastructure — notification preferences, integrations, goals editor,
          billing history, trial flow, checkout success, system error states (4-in-1), and the referral system.
          The surfaces nobody designs first but everyone needs to ship.
        </p>
      </div>

      <PhoneRow idx={72} title="settings · notifications"
        subtitle="Grouped toggles: training, nutrition, health, social. Master toggle hero, quiet hours, per-channel control. No guilt mechanics."
        variants={[{ label: 'notif prefs', Comp: S72_Notification_Prefs }]} />

      <PhoneRow idx={73} title="settings · integrations"
        subtitle="HealthKit (connected), Whoop (connected), Oura, Garmin, MFP (import only). Status chips, sync frequency, privacy note."
        variants={[{ label: 'integrations', Comp: S73_Integrations }]} />

      <PhoneRow idx={74} title="settings · goals"
        subtitle="Weight target (175 lb by Jul), BF% (12%), strength goals (bench/squat/deadlift) with progress bars and timelines."
        variants={[{ label: 'goals', Comp: S74_Goals }]} />

      <PhoneRow idx={75} title="billing · history"
        subtitle="Pro plan hero ($99/yr), payment method, 5 invoice rows with status and download links. Subscription management CTAs."
        variants={[{ label: 'invoices', Comp: S75_Billing_History }]} />

      <PhoneRow idx={76} title="billing · trial"
        subtitle="7-day free trial. Feature checklist (8 items), post-trial explainer, transparent pricing ($99/yr = $8.25/mo). Start trial CTA."
        variants={[{ label: 'trial', Comp: S76_Trial }]} />

      <PhoneRow idx={77} title="billing · success"
        subtitle="Post-checkout confirmation. Checkmark hero with pulse rings, plan summary, 3 numbered next steps. Welcome to Pro."
        variants={[{ label: 'success', Comp: S77_Checkout_Success }]} />

      <PhoneRow idx={78} title="system · states"
        subtitle="4-in-1 pill-tab switcher: 404, 500, permission denied, offline. Each with icon, message, action. Matches S23 pattern."
        variants={[{ label: 'states', Comp: S78_System_States }]} />

      <PhoneRow idx={79} title="social · referral"
        subtitle="Dual-view: share (code hero, share channels, stats, reward tiers) + accept invite (referrer card, benefits, code input)."
        variants={[{ label: 'referral', Comp: S79_Referral }]} />

      {/* ── PHASE 12 ────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · admin · phase 12
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the admin <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>console</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Ten desktop screens for the admin console — overview, analytics, users, user detail, subscriptions,
          waitlist, moderation, errors + logs, audit trail, and settings. This is a webapp-only surface,
          rendered in browser frames and excluded from the mobile app.
        </p>
      </div>

      <DesktopRow idx={80} title="admin · overview"
        subtitle="Desktop-only webapp dashboard. KPI cards (DAU, MAU, revenue, churn), sparklines, alert feed, system health (API latency, error rate, uptime)."
        variants={[{ label: 'overview', Comp: S80_Admin_Overview }]} />

      <DesktopRow idx={81} title="admin · analytics"
        subtitle="Desktop-only analytics workspace. DAU/MAU chart, retention cohort grid (6 weeks), conversion funnel (signup → paid), top features by usage."
        variants={[{ label: 'analytics', Comp: S81_Admin_Analytics }]} />

      <DesktopRow idx={82} title="admin · users"
        subtitle="Desktop-only user management. Search, filter chips, 8-row sortable table (name, email, plan, joined, last active, revenue)."
        variants={[{ label: 'users', Comp: S82_Admin_Users }]} />

      <DesktopRow idx={83} title="admin · user detail"
        subtitle="Desktop-only account review. Profile card, engagement metrics grid, subscription history timeline, activity timeline, impersonation trigger."
        variants={[{ label: 'user', Comp: S83_Admin_User_Detail }]} />

      <DesktopRow idx={84} title="admin · subscriptions"
        subtitle="Desktop-only billing analytics. MRR/ARR/conversion/churn KPIs, plan breakdown chart, 12-month revenue trend, subscription events table."
        variants={[{ label: 'subs', Comp: S84_Admin_Subscriptions }]} />

      <DesktopRow idx={85} title="admin · waitlist"
        subtitle="Desktop-only ops queue. Total/invited/converted KPIs, 10-row table (email, date, status, source), bulk invite action."
        variants={[{ label: 'waitlist', Comp: S85_Admin_Waitlist }]} />

      <DesktopRow idx={86} title="admin · moderation"
        subtitle="Desktop-only moderation queue. Flagged content, preview, flag reason, reporter, and action controls."
        variants={[{ label: 'mod', Comp: S86_Admin_Moderation }]} />

      <DesktopRow idx={87} title="admin · errors + logs"
        subtitle="Desktop-only incident view. Error rate sparkline, top 5 errors table, live log stream, and severity filters."
        variants={[{ label: 'errors', Comp: S87_Admin_Errors }]} />

      <DesktopRow idx={88} title="admin · audit log"
        subtitle="Desktop-only audit trail. Admin actions table with filters for actor, action type, and date range."
        variants={[{ label: 'audit', Comp: S88_Admin_Audit }]} />

      <DesktopRow idx={89} title="admin · settings"
        subtitle="Desktop-only console settings. Maintenance mode, feature flags, role management, and masked system config."
        variants={[{ label: 'settings', Comp: S89_Admin_Settings }]} />

      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · onboarding · phase 13
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          calibrate <span style={{ color: t.accent }}>the</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>system</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          A full calibration flow built as a system, not a form. Signals, constraints, live inputs, reflection,
          final state, trajectory, and immediate handoff into Today.
        </p>
      </div>

      <PhoneRow idx={90} title="system · entry"
        subtitle="Boot screen for calibration. Frames onboarding as signals, constraints, and system inputs."
        variants={[{ label: 'boot', Comp: S90_System_Calibration_Entry }]} />

      <PhoneRow idx={91} title="system · biological baseline"
        subtitle="Age, height, mass, and physiology as engine inputs rather than profile trivia."
        variants={[{ label: 'baseline', Comp: S91_System_Bio_Baseline }]} />

      <PhoneRow idx={92} title="system · direction"
        subtitle="Choose the dominant control target so the system can resolve tradeoffs."
        variants={[{ label: 'direction', Comp: S92_System_Direction }]} />

      <PhoneRow idx={93} title="system · load profile"
        subtitle="Measure current training output and the usable equipment environment."
        variants={[{ label: 'load', Comp: S93_System_Load_Profile }]} />

      <PhoneRow idx={94} title="system · recovery window"
        subtitle="Sleep consistency and stress load define usable recovery margin."
        variants={[{ label: 'recovery', Comp: S94_System_Recovery_Window }]} />

      <PhoneRow idx={95} title="system · fuel signal"
        subtitle="Protein consistency and appetite volatility converted into nutritional control signals."
        variants={[{ label: 'fuel', Comp: S95_System_Fuel_Signal }]} />

      <PhoneRow idx={96} title="system · schedule constraints"
        subtitle="Identify the training windows that survive the real calendar."
        variants={[{ label: 'schedule', Comp: S96_System_Schedule_Constraints }]} />

      <PhoneRow idx={97} title="system · movement constraints"
        subtitle="Treat pain, surgery history, and restricted patterns as routing constraints."
        variants={[{ label: 'movement', Comp: S97_System_Movement_Constraints }]} />

      <PhoneRow idx={98} title="system · adherence risk"
        subtitle="Find the real break point and the available decision bandwidth."
        variants={[{ label: 'risk', Comp: S98_System_Adherence_Risk }]} />

      <PhoneRow idx={99} title="system · data inputs"
        subtitle="Connect Apple Health, wearables, calendar, and food logs as live telemetry."
        variants={[{ label: 'inputs', Comp: S99_System_Data_Inputs }]} />

      <PhoneRow idx={100} title="system · reflection"
        subtitle="The system reflects back what it understands before locking the model."
        variants={[{ label: 'reflection', Comp: S100_System_Reflection }]} />

      <PhoneRow idx={101} title="system · control settings"
        subtitle="Set change rate and correction cadence for the operating loop."
        variants={[{ label: 'control', Comp: S101_System_Calibration_Plan }]} />

      <PhoneRow idx={102} title="system · week 01"
        subtitle="A concrete first week with train, fuel, recover, and measure actions."
        variants={[{ label: 'week 01', Comp: S102_System_First_Week }]} />

      <PhoneRow idx={103} title="system · state"
        subtitle="The final configured system state with readiness, cadence, and protein floor."
        variants={[{ label: 'state', Comp: S103_System_State }]} />

      <PhoneRow idx={104} title="system · trajectory"
        subtitle="Projected six-week drift with decision rules if compliance or recovery changes."
        variants={[{ label: 'trajectory', Comp: S104_System_Trajectory }]} />

      <PhoneRow idx={105} title="today · live handoff"
        subtitle="Immediate handoff into a live Today screen with one clear next action."
        variants={[{ label: 'today', Comp: S105_System_Today }]} />

      {/* ── FINAL FOOTER ─────────────────────────────────── */}
      <div style={{ padding: '0 60px 80px', maxWidth: 900 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase', color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// mvp complete · 105 screens · 13 phases
        </div>
        <h2 style={{
          margin: '0 0 18px', fontFamily: '"Archivo Black", sans-serif',
          fontSize: 48, letterSpacing: -2, lineHeight: 0.95,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          that's the system.
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
          105 screens across 13 phases — core loop (6), onboarding + coach (7), body + biology (5),
          settings + edges (5), programs + crew (5), bookends + companions (7), MVP front door (9),
          onboarding deep pass (7), core extensions (8), domain depth (12), settings + billing + system (8),
          admin console (10), and system calibration onboarding (16). All in light + dark, built on one system: Archivo Black for brand,
          SF Pro for UI, SF Mono for data; paper + ink + sulfur; ECG as the motif that binds it all.
          Consumer mobile app + desktop admin console. The full product, designed without treating admin as a mobile surface.
        </p>
      </div>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
