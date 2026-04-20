import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACSpark,
} from '../lib/paper.jsx';

function OBHeader({ step, total, dark, onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <button type="button" onClick={typeof onBack === 'function' ? onBack : undefined} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{step}/{total}</ACLabel>
    </div>
  );
}

/**
 * Mifflin-St Jeor BMR. Weight estimated from height + sex when not provided.
 * Activity multipliers: 1=1.2, 2=1.375, 3=1.55, 4=1.725, 5=1.9
 * Goal adjustments: lose=-500, recomp=-200, maintain=0, gain=+300
 */
function computePlan(data) {
  const sex = data?.sex || 'male';
  const age = data?.age || 28;
  const heightCm = data?.heightCm || 178;
  const activity = data?.activity || 3;
  const goal = data?.goal || 'recomp';

  // Estimate weight from height when not available (regression from CDC data)
  const weightKg = sex === 'male'
    ? 0.65 * heightCm - 38
    : 0.55 * heightCm - 30;

  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const multipliers = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9 };
  const tdee = Math.round(bmr * (multipliers[activity] || 1.55));

  const goalAdj = { lose: -500, recomp: -200, maintain: 0, gain: 300 };
  const calories = Math.round(tdee + (goalAdj[goal] || 0));

  // Macro split: protein 1g/lb, fat 25%, carbs remainder
  const weightLb = Math.round(weightKg * 2.205);
  const proteinG = Math.round(weightLb * 1.0);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  const proteinPct = Math.round((proteinG * 4 / calories) * 100);
  const carbsPct = Math.round((carbsG * 4 / calories) * 100);
  const fatPct = 100 - proteinPct - carbsPct;

  const deficit = tdee - calories;
  const weeklyLb = Math.abs(deficit * 7 / 3500).toFixed(1);
  const deficitLabel = deficit > 0
    ? `${deficit} kcal deficit · ${weeklyLb} lb / wk`
    : deficit < 0
      ? `${Math.abs(deficit)} kcal surplus · +${weeklyLb} lb / wk`
      : 'Maintenance · weight stable';

  const daysPerWeek = Math.min(activity + 1, 6);
  const goalLabels = { lose: 'Cut fat', recomp: 'Recomp', maintain: 'Maintain', gain: 'Build muscle' };

  return {
    calories, proteinG, carbsG, fatG, proteinPct, carbsPct, fatPct,
    deficitLabel, daysPerWeek, weightLb, goalLabel: goalLabels[goal] || 'Recomp',
  };
}

function S10_Onboard_Plan({
  dark = false,
  onBack,
  onContinue,
  onboardingData,
  value,
  onChange,
}) {
  const c = useACT(dark);
  const [localData, setLocalData] = React.useState(value || onboardingData || {});
  const plan = React.useMemo(() => computePlan(localData), [localData]);

  function update(patch) {
    const next = { ...localData, ...patch };
    setLocalData(next);
    onChange?.(next);
  }

  const goals = [
    { k: 'lose', l: 'Cut fat' },
    { k: 'recomp', l: 'Recomp' },
    { k: 'maintain', l: 'Maintain' },
    { k: 'gain', l: 'Build' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={4} total={10} dark={dark} onBack={onBack} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Your plan</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Here's your<br/>
          <span style={{ background: c.accent, color: c.ink, padding: '0 10px', borderRadius: 8 }}>daily core</span>.
        </div>

        {/* The plan card */}
        <div style={{
          marginTop: 24, padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Calories · daily</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={72} color={c.bg} weight={700}>{plan.calories.toLocaleString()}</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">kcal</ACLabel>
          </div>
          <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ marginTop: 2 }}>
            {plan.deficitLabel}
          </ACLabel>

          <div style={{ marginTop: 18, height: 1, background: 'rgba(239,233,218,0.12)' }} />

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: 'Protein', v: String(plan.proteinG), u: 'g', pct: `${plan.proteinPct}%` },
              { l: 'Carbs',   v: String(plan.carbsG),   u: 'g', pct: `${plan.carbsPct}%` },
              { l: 'Fat',     v: String(plan.fatG),      u: 'g', pct: `${plan.fatPct}%` },
            ].map((m, i) => (
              <div key={i}>
                <ACLabel size={11} color="rgba(239,233,218,0.55)">{m.l}</ACLabel>
                <div style={{ marginTop: 6 }}>
                  <ACNum size={26} color={c.bg} weight={700}>{m.v}</ACNum>
                  <span style={{ fontSize: 11, color: 'rgba(239,233,218,0.55)', marginLeft: 3 }}>{m.u}</span>
                </div>
                <ACLabel size={10} color={c.accent} style={{ fontWeight: 600, marginTop: 2 }}>{m.pct}</ACLabel>
              </div>
            ))}
          </div>
        </div>

        {/* Tweak section */}
        <div style={{ marginTop: 28 }}>
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Tweak your targets</ACLabel>
          
          <div style={{ marginTop: 14 }}>
            <ACLabel size={10} color={c.mute}>Primary goal</ACLabel>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              {goals.map(g => {
                const on = localData.goal === g.k;
                return (
                  <button key={g.k} type="button" onClick={() => update({ goal: g.k })} style={{
                    flex: 1, padding: '10px 0', borderRadius: 8,
                    background: on ? c.accent : c.card,
                    color: on ? c.ink : c.dim,
                    fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                  }}>{g.l}</button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <ACLabel size={10} color={c.mute}>Activity level (1–5)</ACLabel>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(v => {
                const on = localData.activity === v;
                return (
                  <button key={v} type="button" onClick={() => update({ activity: v })} style={{
                    flex: 1, height: 32, borderRadius: 8,
                    background: on ? c.fg : c.card,
                    color: on ? c.bg : c.fg,
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                  }}>{v}</button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <ACLabel size={11} color={c.dim}>Training</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>
                {plan.daysPerWeek} days / week
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACLabel size={11} color={c.dim}>Goal</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>
                {plan.goalLabel}
              </div>
            </div>
          </div>
          <ACSpark w={272} h={30} dark={dark} stroke={2} />
          <ACLabel size={11} color={c.mute} style={{ marginTop: 8 }}>
            Expected body composition curve · 12 weeks
          </ACLabel>
        </div>

        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: ACRadii.card, border: `1px dashed ${c.faint}` }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
            atlas.core recalibrates weekly from your weight trend, logs, and readiness.
          </ACLabel>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={() => onContinue?.(localData)}>Looks good →</ACBtn>
      </div>
    </div>
  );
}

export default S10_Onboard_Plan;
