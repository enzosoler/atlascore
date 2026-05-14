function useAdaptiveOnboarding() {
  const mock = window.useMockState();
  const adaptiveState = (mock && mock.state && mock.state.onboardingAdaptive) || window.OnboardingEngine.defaultOnboardingState;
  const signals = window.OnboardingEngine.evaluateUser(adaptiveState);
  const systemState = window.OnboardingEngine.buildSystemState(signals, adaptiveState);
  const trajectory = window.OnboardingEngine.buildTrajectory(signals, adaptiveState);
  const today = window.OnboardingEngine.generateToday(signals, adaptiveState);
  const insight = window.OnboardingEngine.getSystemInsight(signals, adaptiveState);

  const updateAdaptive = React.useCallback((patch) => {
    if (!mock || !mock.update) return;
    Object.entries(patch).forEach(([key, value]) => {
      mock.update(`onboardingAdaptive.${key}`, value);
    });
  }, [mock]);

  return {
    adaptiveState,
    signals,
    systemState,
    trajectory,
    today,
    insight,
    updateAdaptive,
  };
}

function SYSHeader({ step, total, dark, label = 'Calibration', onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</ACLabel>
          <ACMono size={10} color={c.dim}>{step}/{total}</ACMono>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < step ? c.accent : (i === step ? c.fg : c.faint),
            }} />
          ))}
        </div>
      </div>
      <div style={{ width: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <ACDot size={6} color={c.accent} />
      </div>
    </div>
  );
}

function SYSPanel({ dark, children, accent = false, style = {} }) {
  const c = useACT(dark);
  return (
    <div style={{
      padding: 16,
      borderRadius: ACRadii.card,
      background: c.card,
      borderLeft: accent ? `3px solid ${c.accent}` : 'none',
      ...style,
    }}>{children}</div>
  );
}

function SYSChip({ dark, active, children, accent = false, style = {} }) {
  const c = useACT(dark);
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '9px 14px',
      borderRadius: ACRadii.chip,
      background: active ? (accent ? c.accent : c.fg) : c.card,
      color: active ? (accent ? c.ink : c.bg) : c.fg,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      ...style,
    }}>{children}</div>
  );
}

function SYSChoice({ dark, active, title, desc, right, accent = false }) {
  const c = useACT(dark);
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: ACRadii.input,
      background: active ? c.fg : c.card,
      color: active ? c.bg : c.fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      cursor: 'pointer',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        {desc && <div style={{ marginTop: 3, fontSize: 12, opacity: active ? 0.62 : 0.56, lineHeight: 1.4 }}>{desc}</div>}
      </div>
      {right ? (
        <div style={{ color: active ? c.accent : (accent ? c.accent : c.dim) }}>{right}</div>
      ) : (
        <div style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          border: `1.8px solid ${active ? c.accent : c.faint}`,
          background: active ? c.accent : 'transparent',
        }} />
      )}
    </div>
  );
}

function S90_System_Calibration_Entry({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <SYSHeader step={1} total={15} dark={dark} onBack={false} />
      <div style={{ flex: 1, padding: '28px 28px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>System boot</ACLabel>
        <div style={{ marginTop: 12, fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700, lineHeight: 1.04, letterSpacing: -1, color: c.fg }}>
          calibrate the<br/>human system.
        </div>
        <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: c.dim }}>
          atlas.core does not ask generic profile questions. It ingests signals, constraints, and available control surfaces, then builds your operating state.
        </div>
        <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
          {[
            ['Signals', 'body state, recovery, output, appetite'],
            ['Constraints', 'injuries, schedule, equipment, friction'],
            ['System inputs', 'goal direction, data sources, available decisions'],
          ].map((item) => (
            <SYSPanel key={item[0]} dark={dark}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item[0]}</ACLabel>
              <div style={{ marginTop: 5, fontSize: 14, lineHeight: 1.45, color: c.fg }}>{item[1]}</div>
            </SYSPanel>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Begin calibration →</ACBtn>
      </div>
    </div>
  );
}

function S91_System_Bio_Baseline({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, updateAdaptive } = useAdaptiveOnboarding();
  const sex = adaptiveState.sex;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={2} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Biological baseline</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          establish the engine.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          These inputs anchor energy expenditure, tissue response, and recovery assumptions before the system refines with live data.
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Sex-linked physiology</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {['male', 'female'].map((k) => (
              <div key={k} onClick={() => updateAdaptive({ sex: k })} style={{ flex: 1 }}>
                <SYSChip dark={dark} active={sex === k}>{k === 'male' ? 'Male' : 'Female'}</SYSChip>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <SYSPanel dark={dark}>
            <ACLabel size={11} color={c.dim}>Age signal</ACLabel>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <ACNum size={34} color={c.fg}>31</ACNum>
              <ACMono size={11} color={c.dim}>years</ACMono>
            </div>
          </SYSPanel>
          <SYSPanel dark={dark}>
            <ACLabel size={11} color={c.dim}>Height input</ACLabel>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <ACNum size={34} color={c.fg}>180</ACNum>
                <span style={{ fontSize: 12, color: c.dim, marginLeft: 4 }}>cm</span>
              </div>
              <ACMono size={11} color={c.dim}>5'11"</ACMono>
            </div>
          </SYSPanel>
          <SYSPanel dark={dark}>
            <ACLabel size={11} color={c.dim}>Body mass</ACLabel>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <ACNum size={34} color={c.fg}>84.8</ACNum>
                <span style={{ fontSize: 12, color: c.dim, marginLeft: 4 }}>kg</span>
              </div>
              <ACMono size={11} color={c.accent}>186.9 lb</ACMono>
            </div>
          </SYSPanel>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Lock baseline →</ACBtn>
      </div>
    </div>
  );
}

function S92_System_Direction({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, updateAdaptive } = useAdaptiveOnboarding();
  const mode = adaptiveState.goal;
  const modes = [
    { k: 'cut', t: 'Reduce mass', d: 'Lower body fat while preserving output', trend: '↓ weight · ↔ strength' },
    { k: 'rebuild', t: 'Rebuild composition', d: 'Trade fat for lean mass at stable scale weight', trend: '↔ weight · ↑ quality' },
    { k: 'build', t: 'Increase output', d: 'Drive tissue gain and performance progression', trend: '↑ weight · ↑ strength' },
    { k: 'stabilize', t: 'Stabilize system', d: 'Reduce volatility and improve readiness', trend: '↔ weight · ↑ recovery' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={3} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Direction</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          set the control target.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          The system needs one dominant outcome so it can resolve tradeoffs between recovery, calories, and training stress.
        </div>
        <div style={{ marginTop: 24, display: 'grid', gap: 9 }}>
          {modes.map((m) => (
            <div key={m.k} onClick={() => updateAdaptive({ goal: m.k })}>
              <SYSChoice
                dark={dark}
                active={mode === m.k}
                title={m.t}
                desc={m.d}
                right={<ACMono size={10} color={mode === m.k ? c.accent : c.dim}>{m.trend}</ACMono>}
              />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Set direction →</ACBtn>
      </div>
    </div>
  );
}

function S93_System_Load_Profile({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, signals, updateAdaptive } = useAdaptiveOnboarding();
  const days = String(adaptiveState.trainingDays);
  const environment = adaptiveState.equipment;
  const nextScreen = window.OnboardingEngine.getNextScreen('S93', adaptiveState);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={4} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Training load</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          map current output.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          Not “how often do you work out?” The system needs present strain, available work capacity, and the equipment envelope.
        </div>

        <SYSPanel dark={dark} accent style={{ marginTop: 22 }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Weekly load</ACLabel>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            {['2', '3', '4', '5', '6'].map((k) => (
              <div key={k} onClick={() => updateAdaptive({ trainingDays: Number(k) })} style={{ flex: 1 }}>
                <SYSChip dark={dark} active={days === k} accent>{k}d</SYSChip>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: c.dim }}>Current recoverable frequency appears to be {days} training days per week.</div>
        </SYSPanel>

        <div style={{ marginTop: 16, display: 'grid', gap: 9 }}>
          {[
            ['full', 'Full gym access', 'barbell, machines, cables, conditioning'],
            ['home', 'Home gym access', 'rack, barbell, dumbbells, bench'],
            ['minimal', 'Minimal setup', 'dumbbells, bands, pull-up bar'],
          ].map((item) => (
            <div key={item[0]} onClick={() => updateAdaptive({ equipment: item[0] })}>
              <SYSChoice dark={dark} active={environment === item[0]} title={item[1]} desc={item[2]} />
            </div>
          ))}
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 18 }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Adaptive branch</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>
            {nextScreen === 'S94_Recovery_DeepDive'
              ? 'Low recovery detected. The flow should branch into a deeper recovery calibration before standard progression.'
              : `Training load is compatible with a ${signals.recovery} recovery profile. Continue to standard recovery setup.`}
          </div>
        </SYSPanel>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Accept load model →</ACBtn>
      </div>
    </div>
  );
}

function S94_System_Recovery_Window({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, signals, insight, updateAdaptive } = useAdaptiveOnboarding();
  const sleep = adaptiveState.sleepStability;
  const stress = adaptiveState.stressLoad;
  const nextScreen = window.OnboardingEngine.getNextScreen('S94', adaptiveState);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={5} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Recovery window</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          define usable recovery.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          Recovery sets the ceiling for progress. The system needs consistency, not perfect behavior.
        </div>
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>Sleep timing stability</ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {[
              ['chaotic', 'Chaotic', 'wake and sleep times move daily'],
              ['mostly', 'Mostly stable', 'within ~60 minutes most days'],
              ['locked', 'Locked in', 'same window nearly every day'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({
                sleepStability: item[0],
                sleepHours: item[0] === 'chaotic' ? 5.8 : item[0] === 'mostly' ? 6.8 : 7.8,
              })}>
                <SYSChoice dark={dark} active={sleep === item[0]} title={item[1]} desc={item[2]} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Daily stress load</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {[
              ['low', 'Low'],
              ['moderate', 'Moderate'],
              ['high', 'High'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({ stressLoad: item[0] })} style={{ flex: 1 }}>
                <SYSChip dark={dark} active={stress === item[0]}>{item[1]}</SYSChip>
              </div>
            ))}
          </div>
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 18 }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>System read</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>
            {signals.recovery === 'low'
              ? 'Recovery volatility is elevated. The system will start with a narrower training range.'
              : 'Recovery margin is usable. The system can push progression without aggressive fatigue debt.'}
          </div>
        </SYSPanel>
        {signals.recovery === 'low' && (
          <SYSPanel dark={dark} accent style={{ marginTop: 12 }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>System insight</ACLabel>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>{insight}</div>
            <div style={{ marginTop: 8 }}><ACMono size={10} color={c.dim}>next branch → {nextScreen}</ACMono></div>
          </SYSPanel>
        )}
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Apply recovery input →</ACBtn>
      </div>
    </div>
  );
}

function S95_System_Fuel_Signal({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, updateAdaptive } = useAdaptiveOnboarding();
  const protein = adaptiveState.proteinConsistency;
  const appetite = adaptiveState.appetiteStability;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={6} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Nutrition</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          measure nutritional control.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          Food is not a preference form. It is a signal about how predictable your intake is under real life pressure.
        </div>
        <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
          <SYSPanel dark={dark}>
            <ACLabel size={11} color={c.dim}>Protein consistency</ACLabel>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              {[
                ['low', 'Low'],
                ['inconsistent', 'Inconsistent'],
                ['locked', 'Locked'],
              ].map((item) => (
                <div key={item[0]} onClick={() => updateAdaptive({ proteinConsistency: item[0] })} style={{ flex: 1 }}>
                  <SYSChip dark={dark} active={protein === item[0]}>{item[1]}</SYSChip>
                </div>
              ))}
            </div>
          </SYSPanel>
          <SYSPanel dark={dark}>
            <ACLabel size={11} color={c.dim}>Appetite stability</ACLabel>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {[
                ['stable', 'Stable appetite', 'easy to repeat meals and portions'],
                ['variable', 'Variable appetite', 'some days overshoot or undershoot'],
                ['reactive', 'Reactive appetite', 'stress and schedule drive intake swings'],
              ].map((item) => (
                <div key={item[0]} onClick={() => updateAdaptive({ appetiteStability: item[0] })}>
                  <SYSChoice dark={dark} active={appetite === item[0]} title={item[1]} desc={item[2]} />
                </div>
              ))}
            </div>
          </SYSPanel>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Lock fuel model →</ACBtn>
      </div>
    </div>
  );
}

function S96_System_Schedule_Constraints({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, updateAdaptive } = useAdaptiveOnboarding();
  const windowKey = adaptiveState.trainingWindow;
  const travel = adaptiveState.travelVolatility;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={7} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Schedule constraints</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          identify execution windows.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          The system cares less about what time sounds ideal and more about what time survives your actual calendar.
        </div>
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>Most reliable training window</ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {[
              ['am', 'Morning window', 'highest execution probability before work or obligations'],
              ['mid', 'Midday window', 'works if calendar control is high'],
              ['pm', 'Evening window', 'best if energy survives the day'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({ trainingWindow: item[0] })}>
                <SYSChoice dark={dark} active={windowKey === item[0]} title={item[1]} desc={item[2]} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Travel / shift volatility</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {[
              ['low', 'Low'],
              ['medium', 'Medium'],
              ['high', 'High'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({ travelVolatility: item[0] })} style={{ flex: 1 }}>
                <SYSChip dark={dark} active={travel === item[0]}>{item[1]}</SYSChip>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Apply constraints →</ACBtn>
      </div>
    </div>
  );
}

function S97_System_Movement_Constraints({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, signals, updateAdaptive } = useAdaptiveOnboarding();
  const constraint = adaptiveState.movementConstraint;
  const avoid = adaptiveState.avoidPatterns || [];
  const nextScreen = window.OnboardingEngine.getNextScreen('S97', adaptiveState);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={8} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Movement constraints</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          protect what cannot be loaded.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          The system treats pain, surgery history, and restricted patterns as routing constraints, not footnotes.
        </div>
        <div style={{ marginTop: 22, display: 'grid', gap: 8 }}>
          {[
            ['none', 'No active limitation', 'system can use the full exercise graph'],
            ['shoulder', 'Upper-body limitation', 'modify pressing, hanging, and overhead volume'],
            ['spine', 'Back / hip limitation', 'control axial load and hinge fatigue'],
            ['knee', 'Knee limitation', 'bias hinges, tempo, and partial ROM where needed'],
          ].map((item) => (
            <div key={item[0]} onClick={() => updateAdaptive({ movementConstraint: item[0] })}>
              <SYSChoice dark={dark} active={constraint === item[0]} title={item[1]} desc={item[2]} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Patterns to avoid right now</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Overhead', 'High impact', 'Deep knee flexion', 'Heavy hinge', 'Wide grip'].map((item) => {
              const key = item.toLowerCase();
              const active = avoid.includes(key);
              return (
                <div key={key} onClick={() => updateAdaptive({
                  avoidPatterns: active ? avoid.filter((x) => x !== key) : [...avoid, key],
                })}>
                  <SYSChip dark={dark} active={active} accent>{item}</SYSChip>
                </div>
              );
            })}
          </div>
        </div>
        {signals.intensityTolerance === 'low' && (
          <SYSPanel dark={dark} accent style={{ marginTop: 18 }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Adaptive branch</ACLabel>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>
              Movement constraints plus current recovery signal force a lower-intensity branch before normal loading.
            </div>
            <div style={{ marginTop: 8 }}><ACMono size={10} color={c.dim}>next branch → {nextScreen}</ACMono></div>
          </SYSPanel>
        )}
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Protect movement →</ACBtn>
      </div>
    </div>
  );
}

function S98_System_Adherence_Risk({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, signals, insight, updateAdaptive } = useAdaptiveOnboarding();
  const failure = adaptiveState.adherenceFailure;
  const bandwidth = adaptiveState.decisionBandwidth;
  const nextScreen = window.OnboardingEngine.getNextScreen('S98', adaptiveState);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={9} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Adherence risk</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          locate the break point.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          Generic onboarding asks what you want. Good onboarding asks what repeatedly breaks.
        </div>
        <div style={{ marginTop: 22, display: 'grid', gap: 8 }}>
          {[
            ['schedule', 'Calendar pressure', 'sessions disappear when work expands'],
            ['energy', 'Low energy', 'you know what to do but not when to push'],
            ['food', 'Food drift', 'protein and calories collapse under stress'],
            ['complexity', 'Too much complexity', 'plans fail when they require too many decisions'],
          ].map((item) => (
            <div key={item[0]} onClick={() => updateAdaptive({ adherenceFailure: item[0] })}>
              <SYSChoice dark={dark} active={failure === item[0]} title={item[1]} desc={item[2]} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Daily decision bandwidth</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {[
              ['low', 'Low'],
              ['medium', 'Medium'],
              ['high', 'High'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({ decisionBandwidth: item[0] })} style={{ flex: 1 }}>
                <SYSChip dark={dark} active={bandwidth === item[0]}>{item[1]}</SYSChip>
              </div>
            ))}
          </div>
        </div>
        {signals.adherenceRisk === 'high' && (
          <SYSPanel dark={dark} accent style={{ marginTop: 18 }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>System insight</ACLabel>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>{insight}</div>
            <div style={{ marginTop: 8 }}><ACMono size={10} color={c.dim}>next branch → {nextScreen}</ACMono></div>
          </SYSPanel>
        )}
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Model compliance risk →</ACBtn>
      </div>
    </div>
  );
}

function S99_System_Data_Inputs({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, signals, updateAdaptive } = useAdaptiveOnboarding();
  const sources = adaptiveState.connectedSources;
  const cards = [
    ['apple health', 'Apple Health', 'sleep, HR, body mass, steps'],
    ['wearable', 'WHOOP / Oura', 'recovery and strain signals'],
    ['calendar', 'Calendar', 'training windows and work density'],
    ['nutrition', 'Meal logging', 'intake quality and calorie certainty'],
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={10} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>System inputs</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          connect live telemetry.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          Manual calibration gets you started. Live inputs let the system stop guessing.
        </div>
        <div style={{ marginTop: 24, display: 'grid', gap: 9 }}>
          {cards.map((item) => {
            const active = sources.includes(item[0]);
            return (
              <div key={item[0]} onClick={() => updateAdaptive({
                connectedSources: active
                  ? sources.filter((x) => x !== item[0])
                  : [...sources, item[0]],
              })}>
                <SYSChoice dark={dark} active={active} title={item[1]} desc={item[2]} accent />
              </div>
            );
          })}
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 18 }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Coverage</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>
            {signals.telemetryCoverage === 'strong' ? 'Signal coverage is strong enough to refine readiness and calorie targets automatically.' : 'Coverage is partial. The system will start conservative and learn from your logs.'}
          </div>
        </SYSPanel>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Connect sources →</ACBtn>
      </div>
    </div>
  );
}

function S100_System_Reflection({ dark }) {
  const c = useACT(dark);
  const { signals, insight, systemState } = useAdaptiveOnboarding();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={11} total={15} dark={dark} label="System read" />
      <div style={{ flex: 1, padding: '28px 28px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Reflection</ACLabel>
        <div style={{ marginTop: 12, fontFamily: ACFonts.display, fontSize: 33, fontWeight: 700, lineHeight: 1.02, letterSpacing: -1, color: c.fg }}>
          the system sees<br/>{signals.recovery === 'low' ? 'high intent, low margin.' : 'usable capacity, unstable inputs.'}
        </div>
        <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: c.dim }}>
          {insight}
        </div>
        <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
          {[
            ['Primary lever', systemState.limitingFactor === 'nutrition' ? 'increase protein reliability before adding more volume' : 'stabilize recovery before pushing progression'],
            ['Primary constraint', systemState.limitingFactor === 'adherence' ? 'decision load is too high for stable execution' : 'calendar volatility compresses training windows'],
            ['Initial posture', signals.intensityTolerance === 'low' ? 'protect recovery and reduce fatigue spikes' : 'progression with conservative fatigue exposure'],
          ].map((item) => (
            <SYSPanel key={item[0]} dark={dark} accent>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item[0]}</ACLabel>
              <div style={{ marginTop: 5, fontSize: 14, lineHeight: 1.45, color: c.fg }}>{item[1]}</div>
            </SYSPanel>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>That feels right →</ACBtn>
      </div>
    </div>
  );
}

function S101_System_Calibration_Plan({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, updateAdaptive } = useAdaptiveOnboarding();
  const aggression = adaptiveState.correctionRate;
  const checkin = adaptiveState.correctionCadence;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={12} total={15} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Control settings</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          choose the correction rate.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          The same goal can be pursued with different levels of speed and volatility. Set the operating posture.
        </div>
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>Change rate</ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {[
              ['low', 'Conservative', 'slow change, lowest disruption, easier compliance'],
              ['moderate', 'Moderate', 'balanced rate with stable recovery'],
              ['high', 'Aggressive', 'faster change, tighter margins, higher compliance demand'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({ correctionRate: item[0] })}>
                <SYSChoice dark={dark} active={aggression === item[0]} title={item[1]} desc={item[2]} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Correction cadence</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {[
              ['weekly', 'Weekly'],
              ['biweekly', 'Biweekly'],
              ['dynamic', 'Dynamic'],
            ].map((item) => (
              <div key={item[0]} onClick={() => updateAdaptive({ correctionCadence: item[0] })} style={{ flex: 1 }}>
                <SYSChip dark={dark} active={checkin === item[0]}>{item[1]}</SYSChip>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Finalize control loop →</ACBtn>
      </div>
    </div>
  );
}

function S102_System_First_Week({ dark }) {
  const c = useACT(dark);
  const { adaptiveState, systemState } = useAdaptiveOnboarding();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={13} total={15} dark={dark} label="Week 01" />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Week 01 plan</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          first operating week.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          The system starts with enough structure to move, not enough complexity to fail.
        </div>
        <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
          {[
            ['Train', `${adaptiveState.trainingDays} sessions`, systemState.limitingFactor === 'recovery' ? 'reduced-fatigue split with capped volume' : 'split progression matched to your current load'],
            ['Nutrition', `${systemState.proteinFloor}g protein`, adaptiveState.goal === 'build' ? 'calories tuned for tissue gain' : 'calories tuned for recomposition'],
            ['Recover', adaptiveState.trainingWindow === 'am' ? 'sleep anchor 22:30' : 'sleep anchor 23:00', 'reduce readiness volatility'],
            ['Measure', adaptiveState.connectedSources.length >= 3 ? 'passive telemetry + 1 check-in' : '2 weigh-ins + 1 check-in', 'enough data to learn without noise'],
          ].map((item) => (
            <SYSPanel key={item[0]} dark={dark}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item[0]}</ACLabel>
                <ACMono size={10} color={c.dim}>{item[1]}</ACMono>
              </div>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>{item[2]}</div>
            </SYSPanel>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Accept week 01 →</ACBtn>
      </div>
    </div>
  );
}

function S103_System_State({ dark }) {
  const c = useACT(dark);
  const { signals, systemState } = useAdaptiveOnboarding();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={14} total={15} dark={dark} label="System state" />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Current state</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          system configured.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          This is the operating state atlas.core will use until real-world feedback says otherwise.
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 22, background: c.fg, color: c.bg }}>
          <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>State class</ACLabel>
          <div style={{ marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, lineHeight: 0.98, color: c.bg }}>
            {systemState.stateClass}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: dark ? 'rgba(10,10,10,0.6)' : 'rgba(239,233,218,0.68)' }}>
            {signals.recovery} recovery margin · {signals.adherenceRisk} adherence risk · {systemState.limitingFactor} is limiting
          </div>
        </SYSPanel>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Readiness baseline', String(systemState.readinessBaseline)],
            ['Training cadence', systemState.trainingCadence],
            ['Protein floor', `${systemState.proteinFloor}g`],
            ['Correction loop', systemState.correctionLoop],
          ].map((item) => (
            <SYSPanel key={item[0]} dark={dark}>
              <ACLabel size={10} color={c.dim}>{item[0]}</ACLabel>
              <div style={{ marginTop: 6 }}>
                <ACNum size={28} color={c.fg}>{item[1]}</ACNum>
              </div>
            </SYSPanel>
          ))}
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 12 }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Causal read</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>
            {systemState.explanation}
          </div>
        </SYSPanel>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>View trajectory →</ACBtn>
      </div>
    </div>
  );
}

function S104_System_Trajectory({ dark }) {
  const c = useACT(dark);
  const { signals, trajectory } = useAdaptiveOnboarding();
  const data = signals.recovery === 'low'
    ? [186.9, 186.9, 186.7, 186.5, 186.2, 186.0, 185.7, 185.4]
    : [186.9, 186.5, 186.2, 185.9, 185.7, 185.4, 185.2, 185.0];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SYSHeader step={15} total={15} dark={dark} label="Trajectory" />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>6-week projection</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 31, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: c.fg }}>
          where this path leads.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          {signals.recovery === 'low'
            ? 'Recovery is the first bottleneck, so the trajectory prioritizes stability before visible change.'
            : 'If compliance is steady, body weight trends slightly down while strength quality rises. The first goal is signal stability, not dramatic change.'}
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Expected drift</ACLabel>
              <div style={{ marginTop: 4 }}><ACNum size={40} color={c.fg}>{signals.recovery === 'low' ? '-1.4' : '-1.9'}</ACNum><span style={{ fontSize: 12, color: c.dim, marginLeft: 4 }}>lb</span></div>
            </div>
            <ACChip accent dark={dark}>{signals.recovery === 'low' ? 'Stability first' : 'Low volatility'}</ACChip>
          </div>
          <div style={{ marginTop: 12 }}>
            <ACLine
              w={290}
              h={120}
              dark={dark}
              data={data.map((v, i) => ({ k: i, v }))}
            />
          </div>
        </SYSPanel>
        <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          {trajectory.map((item, index) => (
            <SYSPanel key={item} dark={dark}>
              <ACLabel size={11} color={c.dim}>Week {index + 1}</ACLabel>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>{item}</div>
            </SYSPanel>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Open today →</ACBtn>
      </div>
    </div>
  );
}

function S105_System_Today({ dark }) {
  const c = useACT(dark);
  const { signals, systemState, today } = useAdaptiveOnboarding();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrand size={16} dark={dark} />
        <ACChip dark={dark} dot>calibrated</ACChip>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 22px 20px' }}>
        <ACLabel size={12} color={c.dim}>Today · first day live</ACLabel>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <ACNum size={112} color={c.fg}>{systemState.readinessBaseline}</ACNum>
            <div style={{ marginTop: 4 }}><ACChip accent dark={dark}>{signals.recovery === 'low' ? 'Protect recovery' : 'Ready to train'}</ACChip></div>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 12 }}>
            <ACLabel size={11} color={c.dim}>State</ACLabel>
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>{systemState.stateClass}</div>
          </div>
        </div>
        <SYSPanel dark={dark} accent style={{ marginTop: 16 }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Next action</ACLabel>
          <div style={{ marginTop: 8, fontSize: 19, fontWeight: 700, color: c.fg, letterSpacing: -0.4 }}>
            {today.workout} at {today.timing}.
          </div>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
            {today.duration} · {today.focus} · {today.nutrition}.
          </div>
        </SYSPanel>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <SYSPanel dark={dark}>
            <ACLabel size={10} color={c.dim}>Nutrition target</ACLabel>
            <div style={{ marginTop: 6 }}><ACNum size={28} color={c.fg}>{signals.recovery === 'low' ? '2,310' : '2,420'}</ACNum><span style={{ fontSize: 11, color: c.dim, marginLeft: 4 }}>kcal</span></div>
          </SYSPanel>
          <SYSPanel dark={dark}>
            <ACLabel size={10} color={c.dim}>Protein floor</ACLabel>
            <div style={{ marginTop: 6 }}><ACNum size={28} color={c.fg}>{systemState.proteinFloor}</ACNum><span style={{ fontSize: 11, color: c.dim, marginLeft: 4 }}>g</span></div>
          </SYSPanel>
        </div>
        <SYSPanel dark={dark} style={{ marginTop: 12 }}>
          <ACLabel size={11} color={c.dim}>Why this is next</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: c.fg }}>
            {signals.recovery === 'low'
              ? 'Your recovery is currently limiting your ability to improve performance, so today starts with a lower-fatigue session that still preserves momentum.'
              : 'The system sees enough recovery margin to push progression without exceeding your current compliance envelope.'}
          </div>
        </SYSPanel>
      </div>
      <div style={{ padding: '14px 22px 24px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start today →</ACBtn>
      </div>
      <ACTabBar active="today" dark={dark} />
    </div>
  );
}
