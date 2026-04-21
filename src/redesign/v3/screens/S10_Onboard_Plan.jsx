import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACSpark,
} from '../lib/paper.jsx';
import { computeOnboardingPlan } from '@/services/onboardingService';
import { OnboardingCard, OnboardingHero, OnboardingPrimaryAction, OnboardingShell } from './onboardingShared.jsx';

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
  const plan = React.useMemo(() => {
    const computed = computeOnboardingPlan(localData);
    const deficit = computed.tdee - computed.calories;
    const weeklyLb = Math.abs(deficit * 7 / 3500).toFixed(1);
    const deficitLabel = deficit > 0
      ? `${deficit} kcal deficit · ${weeklyLb} lb / wk`
      : deficit < 0
        ? `${Math.abs(deficit)} kcal surplus · +${weeklyLb} lb / wk`
        : 'Maintenance · weight stable';
    const goalLabels = { lose: 'Cut fat', recomp: 'Recomp', maintain: 'Maintain', gain: 'Build muscle' };

    return {
      ...computed,
      deficitLabel,
      daysPerWeek: Math.min((Number(localData?.activity) || 3) + 1, 6),
      weightLb: Math.round((computed.estimatedWeightKg || 0) * 2.205),
      goalLabel: goalLabels[localData?.goal] || 'Recomp',
    };
  }, [localData]);

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
    <OnboardingShell
      dark={dark}
      step={4}
      total={10}
      onBack={onBack}
      eyebrow="Output"
      footer={<OnboardingPrimaryAction dark={dark} onClick={() => onContinue?.(localData)}>Looks good →</OnboardingPrimaryAction>}
    >
      <OnboardingHero
        dark={dark}
        label="Your plan"
        title={<>Daily targets, first pass.</>}
        body="This is the initial operating preset. The system should feel precise, not final."
        aside={(
          <>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>Adaptive</ACLabel>
            <div style={{ marginTop: 8, fontSize: 12, color: c.dim, lineHeight: 1.45 }}>Recalibrated weekly.</div>
          </>
        )}
      />

      <div style={{
        marginTop: 4, padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        boxShadow: dark ? 'none' : '0 20px 40px rgba(10,10,10,0.12)',
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

      <OnboardingCard dark={dark} style={{ marginTop: 16 }}>
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Tweak the model</ACLabel>

        <div style={{ marginTop: 16 }}>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>Primary goal</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {goals.map((g) => {
              const on = localData.goal === g.k;
              return (
                <button key={g.k} type="button" onClick={() => update({ goal: g.k })} style={{
                  flex: '1 1 120px',
                  padding: '12px 0',
                  borderRadius: 999,
                  background: on ? c.accent : 'transparent',
                  color: on ? c.ink : c.fg,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1px solid ${on ? 'transparent' : c.hair}`,
                  cursor: 'pointer',
                }}>{g.l}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>Activity level</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((v) => {
              const on = localData.activity === v;
              return (
                <button key={v} type="button" onClick={() => update({ activity: v })} style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  background: on ? c.fg : 'transparent',
                  color: on ? c.bg : c.fg,
                  fontSize: 14,
                  fontWeight: 700,
                  border: `1px solid ${on ? 'transparent' : c.hair}`,
                  cursor: 'pointer',
                }}>{v}</button>
              );
            })}
          </div>
        </div>
      </OnboardingCard>

      <OnboardingCard dark={dark} style={{ marginTop: 14 }}>
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
      </OnboardingCard>

      <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: ACRadii.card, border: `1px dashed ${c.faint}` }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
            atlas.core recalibrates weekly from your weight trend, logs, and readiness.
          </ACLabel>
      </div>
    </OnboardingShell>
  );
}

export default S10_Onboard_Plan;
