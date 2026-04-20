/**
 * OnboardingActivity — Step 3/10. "How active are you day-to-day?"
 * Ref: Noom activity level (single-select with clear calibration)
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { ChoicePill } from '../lib/glass';
import { ChairIcon, WalkIcon, RunIcon, FlameIcon, TrophyIcon } from '../lib/icons';

const OPTIONS = [
  { id: 'sedentary', label: 'Sedentary',        description: 'Desk job, little to no exercise',       Icon: ChairIcon },
  { id: 'light',     label: 'Lightly active',   description: '1–3 sessions / week',                    Icon: WalkIcon },
  { id: 'moderate',  label: 'Moderate',         description: '3–5 sessions / week',                    Icon: RunIcon },
  { id: 'high',      label: 'Very active',      description: '6–7 sessions / week',                    Icon: FlameIcon },
  { id: 'athlete',   label: 'Athlete',          description: '2-a-days, competition training',         Icon: TrophyIcon },
];

export default function OnboardingActivity({ value, onChange, onBack, onContinue }) {
  const [selected, setSelected] = useState(value || null);
  const pick = (id) => { setSelected(id); onChange?.(id); };
  return (
    <OnboardingShell
      step={3}
      total={10}
      title="How active are you?"
      subtitle="Includes training, steps, and job activity. This sets your baseline burn."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!selected}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {OPTIONS.map((o) => {
          const Icon = o.Icon;
          return (
            <ChoicePill
              key={o.id}
              selected={selected === o.id}
              onClick={() => pick(o.id)}
              icon={<Icon size={18} />}
              label={o.label}
              description={o.description}
            />
          );
        })}
      </div>
    </OnboardingShell>
  );
}
export { OnboardingActivity };
