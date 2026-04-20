/**
 * OnboardingDiet — Step 5/10. Diet preferences + allergens.
 * Ref: Yazio diet picker + Noom food preferences (single-select diet + multi-select allergens)
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { ChoicePill } from '../lib/glass';

const DIETS = [
  { id: 'balanced',      label: 'Balanced',       description: 'No restrictions, focus on quality' },
  { id: 'high_protein',  label: 'High protein',   description: '≥30% calories from protein' },
  { id: 'low_carb',      label: 'Low carb / keto', description: 'Low-carb or ketogenic macros' },
  { id: 'mediterranean', label: 'Mediterranean',  description: 'Whole foods, olive oil, fish' },
  { id: 'vegetarian',    label: 'Vegetarian',     description: 'No meat or fish' },
  { id: 'vegan',         label: 'Vegan',          description: 'Plants only' },
  { id: 'pescatarian',   label: 'Pescatarian',    description: 'No meat, fish ok' },
];

const ALLERGENS = ['Dairy', 'Gluten', 'Eggs', 'Nuts', 'Shellfish', 'Soy'];

export default function OnboardingDiet({ value = {}, onChange, onBack, onContinue }) {
  const [diet, setDiet] = useState(value.diet || null);
  const [allergens, setAllergens] = useState(new Set(value.allergens || []));

  const toggleAllergen = (a) => {
    const next = new Set(allergens);
    next.has(a) ? next.delete(a) : next.add(a);
    setAllergens(next);
    onChange?.({ diet, allergens: Array.from(next) });
  };
  const pickDiet = (id) => {
    setDiet(id);
    onChange?.({ diet: id, allergens: Array.from(allergens) });
  };

  return (
    <OnboardingShell
      step={5}
      total={10}
      title="How do you eat?"
      subtitle="This shapes your meal plan + food search defaults. You can change it anytime."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!diet}
    >
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {DIETS.map((d) => (
          <ChoicePill
            key={d.id}
            selected={diet === d.id}
            onClick={() => pickDiet(d.id)}
            label={d.label}
            description={d.description}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'hsl(var(--rd-fg-muted))',
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        Avoid (optional)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALLERGENS.map((a) => {
          const active = allergens.has(a);
          return (
            <button
              key={a}
              type="button"
              onClick={() => toggleAllergen(a)}
              style={{
                height: 40,
                paddingInline: 14,
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                background: active
                  ? 'linear-gradient(180deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.12) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: active
                  ? '1px solid rgba(239,68,68,0.5)'
                  : '1px solid rgba(255,255,255,0.10)',
                color: active ? '#fff' : 'hsl(var(--rd-fg-secondary))',
                backdropFilter: 'blur(14px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
                WebkitTapHighlightColor: 'transparent',
                cursor: 'pointer',
                transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1), background 200ms, border-color 200ms',
              }}
            >
              {a}
            </button>
          );
        })}
      </div>
    </OnboardingShell>
  );
}
export { OnboardingDiet };
