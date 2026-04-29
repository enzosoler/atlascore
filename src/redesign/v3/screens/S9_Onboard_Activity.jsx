import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel,
} from '../lib/paper.jsx';
import { useT } from '@/lib/i18nContext';
import { OnboardingCard, OnboardingHero, OnboardingPrimaryAction, OnboardingShell } from './onboardingShared.jsx';

function S9_Onboard_Activity({ dark = false, onBack, onExit, onContinue, onChange, value }) {
  const c = useACT(dark);
  const t = useT();
  const [lvl, setLvl] = React.useState(value?.activity || 3);
  const levels = [
    { k: 1, t: t('onboardActivity.levels.sedentary'),   d: t('onboardActivity.levels.sedentaryDesc'), mult: '1.2×' },
    { k: 2, t: t('onboardActivity.levels.light'),       d: t('onboardActivity.levels.lightDesc'),     mult: '1.38×' },
    { k: 3, t: t('onboardActivity.levels.moderate'),    d: t('onboardActivity.levels.moderateDesc'),  mult: '1.55×' },
    { k: 4, t: t('onboardActivity.levels.active'),      d: t('onboardActivity.levels.activeDesc'),    mult: '1.73×' },
    { k: 5, t: t('onboardActivity.levels.athletic'),    d: t('onboardActivity.levels.athleticDesc'),  mult: '1.9×' },
  ];
  return (
    <OnboardingShell
      dark={dark}
      step={3}
      total={10}
      onBack={onBack}
      onExit={onExit}
      eyebrow={t('onboardActivity.eyebrow')}
      footer={<OnboardingPrimaryAction dark={dark} onClick={onContinue}>{t('onboardActivity.cta')}</OnboardingPrimaryAction>}
    >
      <OnboardingHero
        dark={dark}
        label={t('onboardActivity.label')}
        title={<>{t('onboardActivity.title')}</>}
        body={t('onboardActivity.body')}
        aside={(
          <>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>{t('onboardActivity.asideLabel')}</ACLabel>
            <div style={{ marginTop: 8, fontSize: 12, color: c.dim, lineHeight: 1.45 }}>{t('onboardActivity.asideBody')}</div>
          </>
        )}
      />

      <div style={{ display: 'grid', gap: 10 }}>
        {levels.map((l) => {
          const on = lvl === l.k;
          return (
            <button
              key={l.k}
              type="button"
              onClick={() => { setLvl(l.k); onChange?.({ activity: l.k }); }}
              style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            >
              <OnboardingCard dark={dark} accent={on}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28, width: 34, justifyContent: 'center', flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          borderRadius: 999,
                          height: 7 + i * 3.6,
                          background: i <= l.k
                            ? (on ? c.accent : c.fg)
                            : (dark ? 'rgba(239,233,218,0.12)' : 'rgba(10,10,10,0.08)'),
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 650 }}>{l.t}</div>
                    <div style={{ fontSize: 12, color: c.dim, marginTop: 4, lineHeight: 1.45 }}>{l.d}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <ACLabel size={11} color={on ? c.accent : c.dim} style={{ fontFamily: ACFonts.mono, fontWeight: 700 }}>{l.mult}</ACLabel>
                    <div style={{
                      width: 18,
                      height: 18,
                      marginTop: 8,
                      marginLeft: 'auto',
                      borderRadius: 999,
                      border: `1.5px solid ${on ? c.accent : c.faint}`,
                      background: on ? c.accent : 'transparent',
                    }} />
                  </div>
                </div>
              </OnboardingCard>
            </button>
          );
        })}
      </div>
    </OnboardingShell>
  );
}

export default S9_Onboard_Activity;
