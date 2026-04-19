/**
 * OnboardingGoal — Step 2/10. "What's your primary goal?"
 * Ref: Cal AI goal picker (single-select tall pills)
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { ChoicePill } from '../lib/glass';
import { FlameIcon, MuscleIcon, BalanceIcon, BoltIcon, ZenIcon } from '../lib/icons';

const OPTIONS = [
  { id: 'lose_fat',       label: 'Lose fat',           description: 'Calorie deficit + strength + cardio',     Icon: FlameIcon },
  { id: 'gain_muscle',    label: 'Gain muscle',        description: 'Calorie surplus + progressive overload',  Icon: MuscleIcon },
  { id: 'recomp',         label: 'Recomp',             description: 'Lose fat + gain muscle simultaneously',   Icon: BalanceIcon },
  { id: 'perform',        label: 'Perform better',     description: 'Endurance, strength, recovery tuning',    Icon: BoltIcon },
  { id: 'maintain',       label: 'Maintain & health',  description: 'Dial in the basics, stay consistent',     Icon: ZenIcon },
];

export default function OnboardingGoal({ value, onChange, onBack, onContinue }) {
  const [selected, setSelected] = useState(value || null);
  const pick = (id) => { setSelected(id); onChange?.(id); };
  return (
    <OnboardingShell
      step={2}
      total={10}
      title="What's your primary goal?"
      subtitle="Pick one. You can always adjust later — this just sets your first plan."
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
export { OnboardingGoal };
