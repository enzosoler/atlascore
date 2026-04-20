// screens-p8.jsx — atlas.core app screens, PHASE 8
// Onboarding completion (7 screens): welcome, diet, training, habits, constraints, summary, tour.
// Extends the 5-step onboarding from Phase 2 with a "customize" pass.

// ── onboarding header (local copy — mirrors p2's OBHeader) ──────
function OB2Header({ step, total, dark, onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>{step}/{total}</ACLabel>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S45 — WELCOME (post-signup, pre-onboarding bridge)
// ══════════════════════════════════════════════════════════════
function S45_Welcome({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px' }}>
        <HeartMark size={72} color={c.fg} accent={c.accent} />
        <div style={{
          marginTop: 28, fontFamily: ACFonts.brand, fontSize: 42, letterSpacing: -2,
          lineHeight: 0.95, color: c.fg, textAlign: 'center', textTransform: 'lowercase',
        }}>
          welcome to<br/>
          <span style={{ color: c.accent }}>atlas</span>
          <span style={{ display: 'inline-block', width: 8, height: 8, background: c.accent, margin: '0 3px 3px', borderRadius: 1 }} />
          <span style={{ color: c.accent }}>core</span>
        </div>

        <ACSpark w={200} h={24} dark={dark} stroke={1.5} />

        <div style={{ marginTop: 20, fontSize: 15, lineHeight: 1.6, color: c.dim, textAlign: 'center', maxWidth: 280 }}>
          Your body is a system. We built the instrument panel for it. Five minutes to calibrate — then it's yours.
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
          {[
            { n: 'Train', v: 'logging + programs' },
            { n: 'Eat', v: 'macros + capture' },
            { n: 'Measure', v: 'body + labs' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <ACDot size={6} color={c.accent} />
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: c.fg }}>{f.n}</div>
              <div style={{ marginTop: 2, fontSize: 10, color: c.dim }}>{f.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px' }}>
        <ACBtn primary block dark={dark} size="lg" pill>Build my profile →</ACBtn>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <ACLabel size={12} color={c.dim}>Takes about 2 minutes</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S46 — ONBOARDING · DIET PREFERENCES
// ══════════════════════════════════════════════════════════════
function S46_Onboard_Diet({ dark }) {
  const c = useACT(dark);
  const [diet, setDiet] = React.useState('none');
  const [allergies, setAllergies] = React.useState(['dairy']);

  const diets = [
    { k: 'none',       t: 'No restrictions', d: 'I eat everything' },
    { k: 'vegetarian', t: 'Vegetarian',      d: 'No meat or fish' },
    { k: 'vegan',      t: 'Vegan',           d: 'No animal products' },
    { k: 'keto',       t: 'Keto / low-carb', d: 'Under 50g carbs daily' },
    { k: 'paleo',      t: 'Paleo',           d: 'Whole foods, no grains' },
  ];
  const allergens = ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Soy', 'Eggs'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OB2Header step={1} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Nutrition</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          How do you eat?
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          Shapes your food search, meal suggestions, and macro defaults.
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {diets.map(d => {
            const on = diet === d.k;
            return (
              <div key={d.k} onClick={() => setDiet(d.k)} style={{
                padding: '14px 16px', borderRadius: ACRadii.input,
                background: on ? c.fg : c.card,
                color: on ? c.bg : c.fg,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{d.t}</div>
                  <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{d.d}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: 999,
                  border: `1.8px solid ${on ? c.accent : c.faint}`,
                  background: on ? c.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={on ? c.ink : c.bg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28 }}>
          <ACLabel size={12} color={c.dim}>Allergies or intolerances</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allergens.map(a => {
              const on = allergies.includes(a.toLowerCase());
              return (
                <div key={a} onClick={() => {
                  const k = a.toLowerCase();
                  setAllergies(on ? allergies.filter(x => x !== k) : [...allergies, k]);
                }} style={{
                  padding: '8px 14px', borderRadius: ACRadii.chip,
                  background: on ? c.accent : c.card,
                  color: on ? c.ink : c.fg,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>{a}</div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S47 — ONBOARDING · TRAINING PREFERENCES
// ══════════════════════════════════════════════════════════════
function S47_Onboard_Training({ dark }) {
  const c = useACT(dark);
  const [exp, setExp] = React.useState('intermediate');
  const [equip, setEquip] = React.useState('full');
  const [style, setStyle] = React.useState('strength');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OB2Header step={2} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Training</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          How do you train?
        </div>

        {/* Experience */}
        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Experience level</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {[
              { k: 'beginner', t: 'Beginner', d: '< 1 yr' },
              { k: 'intermediate', t: 'Intermediate', d: '1–3 yr' },
              { k: 'advanced', t: 'Advanced', d: '3+ yr' },
            ].map(e => {
              const on = exp === e.k;
              return (
                <div key={e.k} onClick={() => setExp(e.k)} style={{
                  flex: 1, padding: '14px 8px', textAlign: 'center',
                  borderRadius: ACRadii.input,
                  background: on ? c.fg : c.card,
                  color: on ? c.bg : c.fg,
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.t}</div>
                  <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>{e.d}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>Equipment access</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { k: 'full', t: 'Full gym', d: 'Barbell, dumbbells, machines, cables' },
              { k: 'home', t: 'Home gym', d: 'Rack, barbell, adjustable dumbbells' },
              { k: 'minimal', t: 'Minimal', d: 'Dumbbells + pull-up bar' },
              { k: 'bodyweight', t: 'Bodyweight only', d: 'No equipment' },
            ].map(e => {
              const on = equip === e.k;
              return (
                <div key={e.k} onClick={() => setEquip(e.k)} style={{
                  padding: '12px 16px', borderRadius: ACRadii.input,
                  background: on ? c.fg : 'transparent',
                  color: on ? c.bg : c.fg,
                  border: on ? 'none' : `1px solid ${c.hair}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.t}</div>
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>{e.d}</div>
                  </div>
                  {on && <ACDot size={8} color={c.accent} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Style */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>Preferred style</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Strength', 'Hypertrophy', 'Powerlifting', 'Calisthenics', 'Hybrid'].map(s => {
              const k = s.toLowerCase();
              const on = style === k;
              return (
                <div key={k} onClick={() => setStyle(k)} style={{
                  padding: '8px 14px', borderRadius: ACRadii.chip,
                  background: on ? c.accent : c.card,
                  color: on ? c.ink : c.fg,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>{s}</div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S48 — ONBOARDING · HABITS
// ══════════════════════════════════════════════════════════════
function S48_Onboard_Habits({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OB2Header step={3} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Daily rhythm</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Your daily<br/>baseline.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          We use these to calibrate readiness scoring and coach timing.
        </div>

        {/* Sleep window */}
        <div style={{ marginTop: 28, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.dim}>Sleep window</ACLabel>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={10} color={c.mute}>Bedtime</ACLabel>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <ACNum size={36} color={c.fg} weight={700}>22:30</ACNum>
              </div>
            </div>
            <div style={{ width: 40, height: 1, background: c.faint }} />
            <div style={{ textAlign: 'right' }}>
              <ACLabel size={10} color={c.mute}>Wake</ACLabel>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
                <ACNum size={36} color={c.fg} weight={700}>06:30</ACNum>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>8h target</ACLabel>
          </div>
        </div>

        {/* Step target */}
        <div style={{ marginTop: 14, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={11} color={c.dim}>Daily steps target</ACLabel>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <ACNum size={36} color={c.fg} weight={700}>8,000</ACNum>
                <ACLabel size={12} color={c.dim}>steps</ACLabel>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 32 }}>
              {[4, 6, 8, 10, 12].map((v, i) => (
                <div key={i} style={{
                  width: 6, height: v * 2.5, borderRadius: 2,
                  background: v <= 8 ? c.accent : c.faint,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Water */}
        <div style={{ marginTop: 14, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={11} color={c.dim}>Water intake goal</ACLabel>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <ACNum size={36} color={c.fg} weight={700}>3.0</ACNum>
                <ACLabel size={12} color={c.dim}>liters / day</ACLabel>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4].map((v, i) => (
                <div key={i} style={{
                  width: 10, height: 28, borderRadius: 3,
                  background: v <= 3 ? c.accent : c.faint,
                  opacity: v <= 3 ? 1 : 0.4,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Supplements */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Current supplements</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Creatine', 'Whey', 'Omega-3', 'Vitamin D', 'Magnesium', 'Caffeine', 'None'].map((s, i) => {
              const on = i < 3;
              return (
                <div key={s} style={{
                  padding: '7px 12px', borderRadius: ACRadii.chip,
                  background: on ? c.accent : c.card,
                  color: on ? c.ink : c.fg,
                  fontSize: 12, fontWeight: 500,
                }}>{s}</div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S49 — ONBOARDING · CONSTRAINTS (injuries + conditions)
// ══════════════════════════════════════════════════════════════
function S49_Onboard_Constraints({ dark }) {
  const c = useACT(dark);
  const [injuries, setInjuries] = React.useState([{ site: 'Lower back', severity: 'minor' }]);

  const sites = ['Lower back', 'Knee (L)', 'Knee (R)', 'Shoulder (L)', 'Shoulder (R)', 'Wrist', 'Hip', 'Ankle', 'Neck', 'Elbow'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OB2Header step={4} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Constraints</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Anything we<br/>should avoid?
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          We'll filter exercises and flag movements that load injured sites.
        </div>

        {/* Current injuries */}
        {injuries.map((inj, i) => (
          <div key={i} style={{
            marginTop: i === 0 ? 24 : 10,
            padding: 16, background: c.card, borderRadius: ACRadii.card,
            borderLeft: `3px solid ${inj.severity === 'severe' ? '#e8391f' : inj.severity === 'moderate' ? c.accent : c.dim}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{inj.site}</div>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ opacity: 0.4 }}>
                <path d="M3 3l8 8M11 3l-8 8" stroke={c.fg} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              {['minor', 'moderate', 'severe'].map(s => {
                const on = inj.severity === s;
                return (
                  <div key={s} style={{
                    padding: '5px 10px', borderRadius: ACRadii.chip,
                    background: on ? (s === 'severe' ? '#e8391f' : s === 'moderate' ? c.accent : c.fg) : 'transparent',
                    color: on ? (s === 'severe' ? '#fff' : c.ink) : c.dim,
                    border: on ? 'none' : `1px solid ${c.faint}`,
                    fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                  }}>{s}</div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Add injury */}
        <div style={{
          marginTop: 14, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center', cursor: 'pointer',
        }}>
          <ACLabel size={13} color={c.dim} style={{ fontWeight: 500 }}>+ Add injury or condition</ACLabel>
        </div>

        {/* Body sites quick-select */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Quick select</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sites.map(s => {
              const on = injuries.some(inj => inj.site === s);
              return (
                <div key={s} style={{
                  padding: '6px 10px', borderRadius: ACRadii.chip,
                  background: on ? c.fg : 'transparent',
                  color: on ? c.bg : c.dim,
                  border: on ? 'none' : `1px solid ${c.faint}`,
                  fontSize: 11, fontWeight: 500,
                }}>{s}</div>
              );
            })}
          </div>
        </div>

        <div style={{
          marginTop: 22, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Note</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            This isn't medical advice. atlas.core filters your exercise pool — your physio or doctor clears you for the work.
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
        <div style={{ textAlign: 'center', padding: 4, cursor: 'pointer' }}>
          <ACLabel size={12} color={c.dim}>No injuries — skip</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S50 — ONBOARDING · SUMMARY (full profile recap)
// ══════════════════════════════════════════════════════════════
function S50_Onboard_Summary({ dark }) {
  const c = useACT(dark);

  const Row = ({ label, value, accent: isAccent }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: `1px solid ${c.hair}`,
    }}>
      <ACLabel size={12} color={c.dim}>{label}</ACLabel>
      <span style={{ fontSize: 14, fontWeight: 600, color: isAccent ? c.accent : c.fg }}>{value}</span>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OB2Header step={5} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Review</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Your profile,<br/>
          <span style={{ background: c.accent, color: c.ink, padding: '0 8px', borderRadius: 6 }}>confirmed</span>.
        </div>

        {/* Calorie hero */}
        <div style={{
          marginTop: 24, padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Daily target</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <ACNum size={52} color={c.bg} weight={700}>2,380</ACNum>
            <ACLabel size={13} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'}>kcal</ACLabel>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
            {[
              { l: 'P', v: '186g' },
              { l: 'C', v: '286g' },
              { l: 'F', v: '79g' },
            ].map(m => (
              <div key={m.l}>
                <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.45)' : 'rgba(239,233,218,0.5)'}>{m.l}</ACLabel>
                <span style={{ marginLeft: 4, fontSize: 14, fontWeight: 600, color: c.bg }}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile rows */}
        <div style={{ marginTop: 18, padding: '0 2px' }}>
          <Row label="Sex" value="Male" />
          <Row label="Age" value="32 years" />
          <Row label="Height" value="5'11″ / 180 cm" />
          <Row label="Goal" value="Recomp" accent />
          <Row label="Activity" value="Moderate · 3–4×/wk" />
          <Row label="Diet" value="No restrictions" />
          <Row label="Experience" value="Intermediate · 1–3 yr" />
          <Row label="Equipment" value="Full gym" />
          <Row label="Style" value="Strength" accent />
          <Row label="Sleep" value="22:30 → 06:30 · 8h" />
          <Row label="Steps" value="8,000 / day" />
          <Row label="Water" value="3.0 L / day" />
          <Row label="Constraints" value="Lower back · minor" />
        </div>

        <div style={{
          marginTop: 18, padding: '12px 16px', borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`,
        }}>
          <ACLabel size={11} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
            Tap any row above to edit. atlas.core recalibrates weekly from your data.
          </ACLabel>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start atlas.core →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S51 — TOUR (first-run coachmarks)
// ══════════════════════════════════════════════════════════════
function S51_Tour({ dark }) {
  const c = useACT(dark);
  const step = 2; // showing step 2 of 4 as the "snapshot"

  const tips = [
    { k: 1, t: 'Your readiness', d: 'Ring shows recovery. Green means push it, amber means listen.', y: 120 },
    { k: 2, t: 'Quick capture', d: 'Scan, snap, or say it — three ways to log food in under 5 seconds.', y: 310 },
    { k: 3, t: 'The coach', d: 'Pulls from your signal — HRV, sleep, protein, volume — and gives you one move.', y: 430 },
    { k: 4, t: 'Your body', d: 'Weight, photos, labs, measurements. The long view, not the daily noise.', y: 560 },
  ];

  const active = tips.find(t => t.k === step);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Simulated Today screen behind the overlay */}
      <div style={{ flex: 1, opacity: 0.15, padding: '20px 22px' }}>
        <ACBrand size={18} dark={dark} />
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <ACRing size={140} value={87} dark={dark} thickness={10} />
        </div>
        <div style={{ marginTop: 20, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ height: 12, width: '60%', background: c.faint, borderRadius: 4 }} />
          <div style={{ marginTop: 8, height: 8, width: '80%', background: c.faint, borderRadius: 4 }} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ height: 8, width: '40%', background: c.faint, borderRadius: 4 }} />
          </div>
          <div style={{ flex: 1, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ height: 8, width: '50%', background: c.faint, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Tour overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* Step counter */}
        <div style={{ padding: '16px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>Quick tour</ACLabel>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: i === step ? 20 : 8, height: 8, borderRadius: 4,
                background: i === step ? c.accent : (i < step ? c.fg : c.faint),
                transition: 'width 0.2s',
              }} />
            ))}
          </div>
        </div>

        {/* Coachmark card positioned near the active area */}
        <div style={{
          position: 'absolute', top: active.y, left: 22, right: 22,
        }}>
          {/* Pointer dot */}
          <div style={{
            width: 14, height: 14, borderRadius: 999, background: c.accent,
            border: `3px solid ${c.bg}`,
            marginLeft: 40, marginBottom: -7, position: 'relative', zIndex: 2,
          }} />
          <div style={{
            padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <ACDot size={6} color={c.accent} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', color: c.accent }}>
                {step} of 4
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{active.t}</div>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, opacity: 0.7 }}>{active.d}</div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: c.accent, color: c.ink,
                fontSize: 14, fontWeight: 600, borderRadius: ACRadii.button,
              }}>Next</div>
              <div style={{
                padding: '10px 16px', textAlign: 'center',
                fontSize: 14, fontWeight: 500, color: c.bg, opacity: 0.55,
              }}>Skip tour</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// expose to window for app.jsx
Object.assign(window, {
  S45_Welcome, S46_Onboard_Diet, S47_Onboard_Training,
  S48_Onboard_Habits, S49_Onboard_Constraints, S50_Onboard_Summary, S51_Tour,
});
