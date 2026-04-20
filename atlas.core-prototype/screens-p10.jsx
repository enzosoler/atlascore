// screens-p10.jsx — atlas.core app screens, PHASE 10
// Domain depth (12 screens): nutrition (meal detail, add food, water log, macro editor),
// body (check-in, composition history), labs (exam detail, history, upload),
// coach (home, insight, action), cardio detail.

// ══════════════════════════════════════════════════════════════
// S60 — MEAL DETAIL
// ══════════════════════════════════════════════════════════════
function S60_Meal_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>Lunch · 12:30 PM</ACLabel>
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 10l5-5 5 5" stroke={c.fg} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 20px' }}>
        <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>
          Lunch
        </div>

        {/* Meal total */}
        <div style={{ marginTop: 14, padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <ACNum size={42} color={c.bg} weight={700}>684</ACNum>
            <ACLabel size={12} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'}>kcal</ACLabel>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            {[
              { l: 'Protein', v: '52g', pct: 30, clr: c.accent },
              { l: 'Carbs', v: '68g', pct: 40, clr: c.bg },
              { l: 'Fat', v: '24g', pct: 30, clr: dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)' },
            ].map(m => (
              <div key={m.l} style={{ flex: 1 }}>
                <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.45)' : 'rgba(239,233,218,0.5)'}>{m.l}</ACLabel>
                <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: c.bg }}>{m.v}</div>
                <div style={{ marginTop: 4, height: 3, background: dark ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.15)', borderRadius: 2 }}>
                  <div style={{ height: 3, background: m.clr, borderRadius: 2, width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food items */}
        {[
          { name: 'Grilled Chicken Breast', portion: '200g', kcal: 330, p: 62, carb: 0, fat: 7 },
          { name: 'Brown Rice', portion: '150g cooked', kcal: 172, p: 4, carb: 36, fat: 1 },
          { name: 'Mixed Salad', portion: '1 bowl', kcal: 45, p: 2, carb: 8, fat: 1 },
          { name: 'Olive Oil', portion: '1 tbsp', kcal: 119, p: 0, carb: 0, fat: 14 },
          { name: 'Banana', portion: '1 medium', kcal: 105, p: 1, carb: 27, fat: 0 },
        ].map((f, i) => (
          <div key={i} style={{
            marginTop: 8, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{f.name}</div>
              <ACMono size={10} color={c.mute}>{f.portion}</ACMono>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{f.kcal}</div>
              <ACMono size={9} color={c.mute}>P{f.p} C{f.carb} F{f.fat}</ACMono>
            </div>
          </div>
        ))}

        {/* Add to meal */}
        <div style={{ marginTop: 10, padding: 12, borderRadius: ACRadii.input, border: `1px dashed ${c.faint}`, textAlign: 'center' }}>
          <ACLabel size={12} color={c.dim}>+ Add food item</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S61 — ADD NEW FOOD (custom food form)
// ══════════════════════════════════════════════════════════════
function S61_Add_Food({ dark }) {
  const c = useACT(dark);
  const Field = ({ label, value, unit, half }) => (
    <div style={{ flex: half ? 1 : undefined, marginTop: 14 }}>
      <ACLabel size={11} color={c.dim}>{label}</ACLabel>
      <div style={{
        marginTop: 6, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: c.fg }}>{value}</span>
        {unit && <ACLabel size={11} color={c.mute}>{unit}</ACLabel>}
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACLabel size={14} color={c.dim} style={{ fontWeight: 500 }}>Cancel</ACLabel>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>New food</span>
        <ACLabel size={14} color={c.accent} style={{ fontWeight: 600 }}>Save</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 20px' }}>
        <Field label="Food name" value="Homemade Protein Pancakes" />
        <Field label="Brand (optional)" value="" />

        <div style={{ marginTop: 22, padding: '12px 0', borderBottom: `1px solid ${c.hair}` }}>
          <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>Serving size</ACLabel>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Amount" value="120" unit="g" half />
          <Field label="Servings per container" value="4" half />
        </div>

        <div style={{ marginTop: 22, padding: '12px 0', borderBottom: `1px solid ${c.hair}` }}>
          <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>Nutrition per serving</ACLabel>
        </div>

        <Field label="Calories" value="285" unit="kcal" />
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Protein" value="28" unit="g" half />
          <Field label="Carbs" value="24" unit="g" half />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Fat" value="9" unit="g" half />
          <Field label="Fiber" value="3" unit="g" half />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Sugar" value="6" unit="g" half />
          <Field label="Sodium" value="280" unit="mg" half />
        </div>

        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
            Only calories and macros are required. Micronutrients improve coaching accuracy.
          </ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S62 — WATER LOG
// ══════════════════════════════════════════════════════════════
function S62_Water({ dark }) {
  const c = useACT(dark);
  const glasses = 8; // target
  const filled = 5;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Water" sub="Today" dark={dark}
        right={<ACChip dark={dark} accent>Goal: 3.0 L</ACChip>} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Ring hero */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 20px', position: 'relative' }}>
          <ACRing size={180} value={(filled / glasses) * 100} dark={dark} thickness={14} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <ACNum size={40} color={c.fg} weight={700}>1.9</ACNum>
            <div style={{ marginTop: 2 }}><ACLabel size={12} color={c.dim}>of 3.0 L</ACLabel></div>
          </div>
        </div>

        {/* Glass grid */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: glasses }).map((_, i) => (
            <div key={i} style={{
              width: 36, height: 44, borderRadius: 6,
              background: i < filled ? c.accent : c.card,
              border: i >= filled ? `1px solid ${c.faint}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < filled && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7l3 3 5-5" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {i >= filled && <ACMono size={10} color={c.mute}>{(i + 1) * 375}ml</ACMono>}
            </div>
          ))}
        </div>

        {/* Quick add */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          {['250 ml', '375 ml', '500 ml', '750 ml'].map(v => (
            <div key={v} style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              background: c.card, borderRadius: ACRadii.input,
              fontSize: 13, fontWeight: 600, color: c.fg,
            }}>+ {v}</div>
          ))}
        </div>

        {/* Today's log */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Today</ACLabel>
          {[
            { time: '07:15', amount: '375 ml', note: 'Morning' },
            { time: '09:30', amount: '375 ml', note: 'Post-workout' },
            { time: '11:00', amount: '250 ml', note: '' },
            { time: '13:00', amount: '500 ml', note: 'With lunch' },
            { time: '15:30', amount: '375 ml', note: '' },
          ].map((e, i) => (
            <div key={i} style={{
              marginTop: 6, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <ACMono size={10} color={c.mute}>{e.time}</ACMono>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: c.fg }}>{e.amount}</div>
              {e.note && <ACLabel size={10} color={c.dim}>{e.note}</ACLabel>}
            </div>
          ))}
        </div>

        {/* Weekly trend */}
        <div style={{ marginTop: 18, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.dim}>This week</ACLabel>
          <ACBars w={280} h={60} dark={dark} data={[
            { k: 'M', v: 3.0 }, { k: 'T', v: 2.8 }, { k: 'W', v: 3.2 },
            { k: 'T', v: 2.5 }, { k: 'F', v: 1.9, hl: true }, { k: 'S', v: 0 }, { k: 'S', v: 0 },
          ]} />
        </div>
      </div>

      <ACTabBar active="eat" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S63 — MACRO TARGETS EDITOR
// ══════════════════════════════════════════════════════════════
function S63_Macros({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Macro targets</span>
        <ACLabel size={14} color={c.accent} style={{ fontWeight: 600 }}>Save</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Total calories */}
        <div style={{ padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card, textAlign: 'center' }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Daily calorie target</ACLabel>
          <div style={{ marginTop: 8 }}>
            <ACNum size={56} color={c.bg} weight={700}>2,380</ACNum>
            <ACLabel size={13} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'}> kcal</ACLabel>
          </div>
          <div style={{ marginTop: 6 }}>
            <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.45)'}>TDEE 2,780 — deficit 400</ACLabel>
          </div>
        </div>

        {/* Macro sliders */}
        {[
          { l: 'Protein', v: 186, u: 'g', pct: 31, kcal: 744, color: c.accent },
          { l: 'Carbs', v: 286, u: 'g', pct: 48, kcal: 1144, color: c.fg },
          { l: 'Fat', v: 56, u: 'g', pct: 21, kcal: 504, color: c.dim },
        ].map((m, i) => (
          <div key={i} style={{ marginTop: 18, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>{m.l}</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <ACNum size={28} color={c.fg} weight={700}>{m.v}</ACNum>
                <ACLabel size={11} color={c.dim}>{m.u}</ACLabel>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 6, background: c.faint, borderRadius: 3 }}>
              <div style={{ height: 6, background: m.color, borderRadius: 3, width: `${m.pct}%` }} />
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <ACMono size={10} color={c.mute}>{m.pct}% of total</ACMono>
              <ACMono size={10} color={c.mute}>{m.kcal} kcal</ACMono>
            </div>
          </div>
        ))}

        {/* Presets */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Presets</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {[
              { t: 'High protein', p: '35/40/25' },
              { t: 'Balanced', p: '30/45/25' },
              { t: 'Low carb', p: '35/25/40' },
              { t: 'Custom', p: '31/48/21', active: true },
            ].map(pr => (
              <div key={pr.t} style={{
                flex: 1, padding: '10px 6px', textAlign: 'center',
                borderRadius: ACRadii.input,
                background: pr.active ? c.accent : c.card,
                color: pr.active ? c.ink : c.fg,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{pr.t}</div>
                <ACMono size={9} color={pr.active ? c.ink : c.mute} style={{ marginTop: 2 }}>{pr.p}</ACMono>
              </div>
            ))}
          </div>
        </div>

        {/* Training vs rest */}
        <div style={{
          marginTop: 18, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Tip</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            atlas.core can auto-adjust macros on training vs rest days. Enable in settings.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S64 — BODY CHECK-IN FLOW
// ══════════════════════════════════════════════════════════════
function S64_Body_Checkin({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACLabel size={14} color={c.dim} style={{ fontWeight: 500 }}>Cancel</ACLabel>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Body check-in</span>
        <ACMono size={11} color={c.mute}>Apr 18</ACMono>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Weight */}
        <div style={{ padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card, textAlign: 'center' }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Weight</ACLabel>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <ACNum size={64} color={c.bg} weight={700}>83.0</ACNum>
            <ACLabel size={14} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)'}>kg</ACLabel>
          </div>
          <ACLabel size={11} color={c.accent} style={{ marginTop: 4 }}>-0.4 kg from last check-in</ACLabel>
        </div>

        {/* Measurements */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Measurements</ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'Waist', v: '81.2', u: 'cm', d: '-0.3' },
              { l: 'Chest', v: '102.5', u: 'cm', d: '+0.2' },
              { l: 'Arms', v: '37.8', u: 'cm', d: '+0.1' },
              { l: 'Thighs', v: '59.4', u: 'cm', d: '—' },
            ].map(m => (
              <div key={m.l} style={{ padding: 14, background: c.card, borderRadius: ACRadii.input }}>
                <ACLabel size={10} color={c.mute}>{m.l}</ACLabel>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <ACNum size={24} color={c.fg} weight={700}>{m.v}</ACNum>
                  <ACLabel size={10} color={c.dim}>{m.u}</ACLabel>
                </div>
                <ACLabel size={10} color={m.d.startsWith('-') ? c.accent : c.dim} style={{ marginTop: 2 }}>{m.d}</ACLabel>
              </div>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Progress photo</ACLabel>
          <div style={{
            marginTop: 10, padding: 30, background: c.card, borderRadius: ACRadii.card,
            border: `1px dashed ${c.faint}`, textAlign: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ margin: '0 auto' }}>
              <path d="M4 10a3 3 0 013-3h3l2-3h8l2 3h3a3 3 0 013 3v13a3 3 0 01-3 3H7a3 3 0 01-3-3V10z" stroke={c.dim} strokeWidth="2" fill="none"/>
              <circle cx="16" cy="16" r="5" stroke={c.dim} strokeWidth="2" fill="none"/>
            </svg>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500, color: c.dim }}>Add front photo</div>
            <ACLabel size={11} color={c.mute} style={{ marginTop: 4, display: 'block' }}>Photos stay on-device</ACLabel>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Notes</ACLabel>
          <div style={{
            marginTop: 8, padding: 14, background: c.card, borderRadius: ACRadii.input,
            minHeight: 60,
          }}>
            <span style={{ fontSize: 13, color: c.mute }}>How do you feel? Any observations...</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 34px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Save check-in</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S65 — BODY COMPOSITION HISTORY
// ══════════════════════════════════════════════════════════════
function S65_Composition_History({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Composition" sub="6-month trend" dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Chart */}
        <div style={{ padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {['Weight', 'BF %', 'Lean mass'].map((t, i) => (
              <div key={t} style={{
                padding: '4px 10px', borderRadius: ACRadii.chip,
                background: i === 0 ? c.accent : 'transparent',
                color: i === 0 ? c.ink : c.dim,
                fontSize: 11, fontWeight: 600,
              }}>{t}</div>
            ))}
          </div>
          <ACLine data={[
            { v: 86.2 }, { v: 85.8 }, { v: 85.5 }, { v: 85.2 }, { v: 85.0 },
            { v: 84.7 }, { v: 84.3 }, { v: 84.0 }, { v: 83.8 }, { v: 83.5 },
            { v: 83.2 }, { v: 83.0 },
          ]} w={280} h={120} dark={dark} />
        </div>

        {/* Check-in history */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Check-ins</ACLabel>
          {[
            { date: 'Apr 18', w: '83.0', bf: '14.2', lean: '71.2', waist: '81.2' },
            { date: 'Apr 4', w: '83.4', bf: '14.5', lean: '71.3', waist: '81.5' },
            { date: 'Mar 21', w: '83.8', bf: '14.8', lean: '71.4', waist: '82.0' },
            { date: 'Mar 7', w: '84.3', bf: '15.1', lean: '71.6', waist: '82.4' },
            { date: 'Feb 21', w: '84.7', bf: '15.4', lean: '71.6', waist: '82.8' },
            { date: 'Feb 7', w: '85.2', bf: '15.8', lean: '71.7', waist: '83.2' },
          ].map((ci, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '12px 14px', background: i === 0 ? c.fg : c.card,
              color: i === 0 ? c.bg : c.fg, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <ACMono size={10} color={i === 0 ? c.accent : c.mute}>{ci.date}</ACMono>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{ci.w} kg</span>
                <ACMono size={10} color={i === 0 ? (dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)') : c.mute}>{ci.bf}% BF</ACMono>
              </div>
              <ACMono size={9} color={i === 0 ? (dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)') : c.mute}>W {ci.waist}</ACMono>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S66 — LAB EXAM DETAIL (whole-panel view)
// ══════════════════════════════════════════════════════════════
function S66_Lab_Exam({ dark }) {
  const c = useACT(dark);
  const markers = [
    { name: 'Total Cholesterol', v: '195', u: 'mg/dL', range: '< 200', status: 'optimal' },
    { name: 'LDL-C', v: '118', u: 'mg/dL', range: '< 100', status: 'elevated' },
    { name: 'HDL-C', v: '62', u: 'mg/dL', range: '> 40', status: 'optimal' },
    { name: 'Triglycerides', v: '85', u: 'mg/dL', range: '< 150', status: 'optimal' },
    { name: 'ApoB', v: '92', u: 'mg/dL', range: '< 90', status: 'elevated' },
    { name: 'Glucose (fasting)', v: '88', u: 'mg/dL', range: '70–100', status: 'optimal' },
    { name: 'HbA1c', v: '5.2', u: '%', range: '< 5.7', status: 'optimal' },
    { name: 'Testosterone', v: '680', u: 'ng/dL', range: '300–1000', status: 'optimal' },
    { name: 'Vitamin D', v: '38', u: 'ng/mL', range: '30–100', status: 'optimal' },
    { name: 'Ferritin', v: '45', u: 'ng/mL', range: '30–400', status: 'low' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>Comprehensive Panel</ACLabel>
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 12l4-4M14 4l-4 4M6 8l4-4" stroke={c.fg} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>
            Comprehensive Panel
          </div>
          <ACMono size={10} color={c.mute}>Mar 15, 2026</ACMono>
        </div>

        {/* Summary bar */}
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <ACChip dark={dark} accent>7 optimal</ACChip>
          <ACChip dark={dark}>2 elevated</ACChip>
          <ACChip dark={dark}>1 low</ACChip>
        </div>

        {/* Markers */}
        <div style={{ marginTop: 18 }}>
          {markers.map((m, i) => {
            const statusColor = m.status === 'optimal' ? c.accent : m.status === 'elevated' ? '#e8391f' : '#ff5f1f';
            return (
              <div key={i} style={{
                padding: '12px 0', borderBottom: `1px solid ${c.hair}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 4, height: 28, borderRadius: 2, background: statusColor }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{m.name}</div>
                  <ACMono size={9} color={c.mute}>ref: {m.range}</ACMono>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <ACNum size={20} color={statusColor} weight={700}>{m.v}</ACNum>
                  <div><ACMono size={9} color={c.mute}>{m.u}</ACMono></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S67 — LAB HISTORY
// ══════════════════════════════════════════════════════════════
function S67_Lab_History({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Lab history" sub="All panels" dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {[
          { date: 'Mar 15, 2026', name: 'Comprehensive Panel', markers: 10, optimal: 7, elevated: 2, low: 1 },
          { date: 'Dec 3, 2025', name: 'Comprehensive Panel', markers: 10, optimal: 6, elevated: 3, low: 1 },
          { date: 'Sep 12, 2025', name: 'Lipid Panel', markers: 5, optimal: 3, elevated: 2, low: 0 },
          { date: 'Jun 1, 2025', name: 'Basic Metabolic', markers: 8, optimal: 7, elevated: 1, low: 0 },
          { date: 'Mar 18, 2025', name: 'Comprehensive Panel', markers: 10, optimal: 5, elevated: 4, low: 1 },
        ].map((panel, i) => (
          <div key={i} style={{
            marginBottom: 10, padding: 16, background: i === 0 ? c.fg : c.card,
            color: i === 0 ? c.bg : c.fg, borderRadius: ACRadii.card,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{panel.name}</div>
                <ACMono size={10} color={i === 0 ? (dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)') : c.mute}>{panel.date}</ACMono>
              </div>
              <ACMono size={10} color={i === 0 ? c.accent : c.dim}>{panel.markers} markers</ACMono>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              <div style={{ flex: panel.optimal, height: 4, background: c.accent, borderRadius: 2 }} />
              {panel.elevated > 0 && <div style={{ flex: panel.elevated, height: 4, background: '#e8391f', borderRadius: 2 }} />}
              {panel.low > 0 && <div style={{ flex: panel.low, height: 4, background: '#ff5f1f', borderRadius: 2 }} />}
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 10 }}>
              <ACMono size={9} color={c.accent}>{panel.optimal} optimal</ACMono>
              {panel.elevated > 0 && <ACMono size={9} color="#e8391f">{panel.elevated} elevated</ACMono>}
              {panel.low > 0 && <ACMono size={9} color="#ff5f1f">{panel.low} low</ACMono>}
            </div>
          </div>
        ))}

        <div style={{
          marginTop: 8, padding: 16, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={13} color={c.dim}>+ Upload new results</ACLabel>
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S68 — LAB UPLOAD
// ══════════════════════════════════════════════════════════════
function S68_Lab_Upload({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACLabel size={14} color={c.dim} style={{ fontWeight: 500 }}>Cancel</ACLabel>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Upload labs</span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 22px 20px' }}>
        {/* Upload area */}
        <div style={{
          padding: 40, background: c.card, borderRadius: ACRadii.card,
          border: `2px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ margin: '0 auto' }}>
            <path d="M10 30v6a4 4 0 004 4h20a4 4 0 004-4v-6" stroke={c.dim} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M24 8v20M16 16l8-8 8 8" stroke={c.accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: c.fg }}>
            Upload lab results
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: c.dim, lineHeight: 1.5 }}>
            PDF or photo of your lab report.<br/>We'll extract the markers automatically.
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <ACBtn dark={dark} size="sm" pill>Choose file</ACBtn>
            <ACBtn dark={dark} size="sm" pill>Take photo</ACBtn>
          </div>
        </div>

        {/* Supported labs */}
        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Supported formats</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'PDF lab reports (Quest, LabCorp, etc.)',
              'Photo of printed results',
              'CSV / spreadsheet export',
              'Manual entry (any marker)',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <ACDot size={5} color={c.accent} />
                <span style={{ fontSize: 13, color: c.fg }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div style={{
          marginTop: 22, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Privacy</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            Lab data is encrypted and stays on your device by default. Cloud sync is opt-in and HIPAA-aligned.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S69 — COACH HOME (user-side hub)
// ══════════════════════════════════════════════════════════════
function S69_Coach_Home({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 999, background: c.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HeartMark size={20} color={c.ink} accent="transparent" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: c.fg, letterSpacing: -0.3 }}>Coach</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />
            <ACLabel size={11} color={c.dim}>Reading your signal</ACLabel>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Today's brief */}
        <div style={{ padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ACDot size={6} color={c.accent} />
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Today's brief</ACLabel>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5, color: c.bg }}>
            HRV is strong — 72 ms. Push the heavy lower session today. Protein gap yesterday (128g vs 186g target). Add a shake pre-training.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <div style={{ padding: '8px 14px', background: c.accent, color: c.ink, borderRadius: ACRadii.chip, fontSize: 12, fontWeight: 600 }}>
              Open chat
            </div>
            <div style={{ padding: '8px 14px', border: `1px solid ${dark ? 'rgba(10,10,10,0.2)' : 'rgba(239,233,218,0.2)'}`, borderRadius: ACRadii.chip, fontSize: 12, fontWeight: 500, color: c.bg }}>
              View full brief
            </div>
          </div>
        </div>

        {/* Active insights */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Active insights</ACLabel>
          {[
            { t: 'Protein consistency improving', type: 'positive', age: '2d ago' },
            { t: 'Sleep dipping mid-week', type: 'warning', age: '1d ago' },
            { t: 'Bench PR trajectory on track', type: 'positive', age: '5d ago' },
          ].map((ins, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 10,
              borderLeft: `3px solid ${ins.type === 'positive' ? c.accent : '#e8391f'}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{ins.t}</div>
                <ACMono size={9} color={c.mute}>{ins.age}</ACMono>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6" stroke={c.faint} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>

        {/* Pending actions */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Pending actions</ACLabel>
          {[
            { t: 'Add protein shake to today\'s plan', done: false },
            { t: 'Log pre-workout meal', done: false },
            { t: 'Review deload week schedule', done: true },
          ].map((a, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 999,
                border: `1.8px solid ${a.done ? c.accent : c.faint}`,
                background: a.done ? c.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {a.done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: 13, color: a.done ? c.mute : c.fg, textDecoration: a.done ? 'line-through' : 'none' }}>{a.t}</span>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S70 — COACH INSIGHT DETAIL
// ══════════════════════════════════════════════════════════════
function S70_Coach_Insight({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACChip dark={dark} accent dot>Positive</ACChip>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.8, color: c.fg, lineHeight: 1.15 }}>
          Protein consistency<br/>is improving
        </div>
        <ACMono size={10} color={c.mute} style={{ marginTop: 6, display: 'block' }}>Generated Apr 16 · Updated 2d ago</ACMono>

        <div style={{ marginTop: 18, fontSize: 15, lineHeight: 1.65, color: c.fg }}>
          You hit your protein target (186g) on <b>6 of 7 days</b> this week, up from 4 of 7 last week and 3 of 7 two weeks ago. This is a clear upward trend.
        </div>

        {/* Supporting data */}
        <div style={{ marginTop: 18, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600 }}>Supporting data</ACLabel>
          <ACBars w={280} h={80} dark={dark} data={[
            { k: 'W1', v: 3 }, { k: 'W2', v: 4 }, { k: 'W3', v: 6, hl: true },
          ]} labelFmt={k => k} />
          <ACLabel size={10} color={c.mute} style={{ marginTop: 6, display: 'block' }}>Days hitting 186g target per week</ACLabel>
        </div>

        <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.65, color: c.fg }}>
          Recovery markers are responding. Your HRV 7-day average is up <b style={{ color: c.accent }}>8%</b> and
          subjective fatigue scores have improved from 6.2 to 5.1 (lower is better).
        </div>

        {/* Recommendation */}
        <div style={{
          marginTop: 18, padding: 16, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Recommendation</ACLabel>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: c.bg }}>
            Keep doing what you're doing. The pre-training shake habit is working. If you can sustain 6–7 days consistently for another 2 weeks, we'll see it reflected in your strength numbers.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S71 — CARDIO DETAIL (zones, history, HR)
// ══════════════════════════════════════════════════════════════
function S71_Cardio({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Cardio" sub="Last 30 days" dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Summary */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: 'Sessions', v: '12' },
            { l: 'Avg HR', v: '142 bpm' },
            { l: 'Total', v: '8.2h' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: 14, background: c.card, borderRadius: ACRadii.input, textAlign: 'center' }}>
              <ACLabel size={9} color={c.mute}>{s.l}</ACLabel>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: c.fg }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* HR zones */}
        <div style={{ marginTop: 18, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Time in zones (last session)</ACLabel>
          <div style={{ marginTop: 12 }}>
            {[
              { zone: 'Z1 · Recovery', range: '< 120', pct: 15, time: '4 min', color: '#4488ff' },
              { zone: 'Z2 · Aerobic', range: '120–140', pct: 40, time: '12 min', color: '#44cc88' },
              { zone: 'Z3 · Tempo', range: '140–160', pct: 30, time: '9 min', color: c.accent },
              { zone: 'Z4 · Threshold', range: '160–175', pct: 12, time: '3.5 min', color: '#ff5f1f' },
              { zone: 'Z5 · Max', range: '175+', pct: 3, time: '1 min', color: '#e8391f' },
            ].map((z, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <ACLabel size={10} color={c.fg} style={{ fontWeight: 500 }}>{z.zone}</ACLabel>
                  <ACMono size={9} color={c.mute}>{z.time}</ACMono>
                </div>
                <div style={{ height: 6, background: c.faint, borderRadius: 3 }}>
                  <div style={{ height: 6, background: z.color, borderRadius: 3, width: `${z.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Recent sessions</ACLabel>
          {[
            { date: 'Apr 17', type: 'Walk', dur: '45 min', hr: '118 bpm', kcal: '280' },
            { date: 'Apr 14', type: 'Run', dur: '30 min', hr: '155 bpm', kcal: '320' },
            { date: 'Apr 12', type: 'Cycling', dur: '40 min', hr: '138 bpm', kcal: '350' },
            { date: 'Apr 9', type: 'Run', dur: '25 min', hr: '148 bpm', kcal: '265' },
          ].map((s, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <ACMono size={10} color={c.mute}>{s.date}</ACMono>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{s.type}</div>
                <ACMono size={9} color={c.mute}>{s.dur} · {s.hr}</ACMono>
              </div>
              <ACMono size={11} color={c.dim}>{s.kcal} kcal</ACMono>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// expose to window for app.jsx
Object.assign(window, {
  S60_Meal_Detail, S61_Add_Food, S62_Water, S63_Macros,
  S64_Body_Checkin, S65_Composition_History,
  S66_Lab_Exam, S67_Lab_History, S68_Lab_Upload,
  S69_Coach_Home, S70_Coach_Insight, S71_Cardio,
});
