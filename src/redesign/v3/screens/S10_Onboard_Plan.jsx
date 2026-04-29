import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum,
} from '../lib/paper.jsx';
import { computeOnboardingPlan } from '@/services/onboardingService';
import { useT } from '@/lib/i18nContext';
import { OnboardingCard, OnboardingHero, OnboardingPrimaryAction, OnboardingShell } from './onboardingShared.jsx';

function S10_Onboard_Plan({
  dark = false,
  onBack,
  onExit,
  onContinue,
  onboardingData,
  value,
  onChange,
}) {
  const c = useACT(dark);
  const t = useT();
  const [localData, setLocalData] = React.useState(value || onboardingData || {});
  const plan = React.useMemo(() => {
    const computed = computeOnboardingPlan(localData);
    const deficit = computed.tdee - computed.calories;
    const weeklyLb = Math.abs(deficit * 7 / 3500).toFixed(1);
    const deficitLabel = deficit > 0
      ? t('onboardPlan.runtime.deficit', { kcal: deficit, weeklyLb })
      : deficit < 0
        ? t('onboardPlan.runtime.surplus', { kcal: Math.abs(deficit), weeklyLb })
        : t('onboardPlan.runtime.maintenance');
    const goalLabels = {
      lose: t('onboardPlan.runtime.goals.lose'),
      recomp: t('onboardPlan.runtime.goals.recomp'),
      maintain: t('onboardPlan.runtime.goals.maintain'),
      gain: t('onboardPlan.runtime.goals.gain'),
    };

    return {
      ...computed,
      deficitLabel,
      daysPerWeek: Math.min((Number(localData?.activity) || 3) + 1, 6),
      weightLb: Math.round((computed.estimatedWeightKg || 0) * 2.205),
      goalLabel: goalLabels[localData?.goal] || t('onboardPlan.runtime.goals.recomp'),
    };
  }, [localData, t]);

  function update(patch) {
    const next = { ...localData, ...patch };
    setLocalData(next);
    onChange?.(next);
  }

  const goals = [
    { k: 'lose', l: t('onboardPlan.runtime.goals.lose') },
    { k: 'recomp', l: t('onboardPlan.runtime.goals.recomp') },
    { k: 'maintain', l: t('onboardPlan.runtime.goals.maintain') },
    { k: 'gain', l: t('onboardPlan.runtime.goals.build') },
  ];

  return (
    <OnboardingShell
      dark={dark}
      step={4}
      total={10}
      onBack={onBack}
      onExit={onExit}
      eyebrow={t('onboardPlan.runtime.eyebrow')}
      footer={<OnboardingPrimaryAction dark={dark} onClick={() => onContinue?.(localData)}>{t('onboardPlan.runtime.cta')}</OnboardingPrimaryAction>}
    >
      <OnboardingHero
        dark={dark}
        label={t('onboardPlan.runtime.label')}
        title={<>{t('onboardPlan.runtime.title')}</>}
      />

      <div style={{
        marginTop: 4, padding: 16, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        boxShadow: dark ? 'none' : '0 20px 40px rgba(10,10,10,0.12)',
      }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t('onboardPlan.runtime.caloriesDaily')}</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={52} color={c.bg} weight={700}>{plan.calories.toLocaleString()}</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">{t('onboardPlan.runtime.kcal')}</ACLabel>
          </div>
          <ACLabel size={11} color="rgba(239,233,218,0.8)" style={{ marginTop: 2 }}>
            {plan.deficitLabel}
          </ACLabel>

          <div style={{ marginTop: 14, height: 1, background: 'rgba(239,233,218,0.12)' }} />

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: t('onboardPlan.runtime.macros.protein'), v: String(plan.proteinG), u: t('onboardPlan.runtime.grams'), pct: `${plan.proteinPct}%` },
              { l: t('onboardPlan.runtime.macros.carbs'),   v: String(plan.carbsG),   u: t('onboardPlan.runtime.grams'), pct: `${plan.carbsPct}%` },
              { l: t('onboardPlan.runtime.macros.fat'),     v: String(plan.fatG),      u: t('onboardPlan.runtime.grams'), pct: `${plan.fatPct}%` },
            ].map((m, i) => (
              <div key={i}>
                <ACLabel size={12} color="rgba(239,233,218,0.95)" style={{ fontWeight: 600, display: 'block' }}>{m.l}</ACLabel>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <ACNum size={26} color={c.bg} weight={700}>{m.v}</ACNum>
                  <span style={{ fontSize: 11, color: 'rgba(239,233,218,0.8)' }}>{m.u}</span>
                </div>
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, marginTop: 2 }}>{m.pct}</ACLabel>
              </div>
            ))}
          </div>
      </div>

      <OnboardingCard dark={dark} style={{ marginTop: 10 }}>
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('onboardPlan.runtime.tweakModel')}</ACLabel>

        <div style={{ marginTop: 16 }}>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>{t('onboardPlan.runtime.primaryGoal')}</ACLabel>
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
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>{t('onboardPlan.runtime.activityLevel')}</ACLabel>
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

    </OnboardingShell>
  );
}

export default S10_Onboard_Plan;
