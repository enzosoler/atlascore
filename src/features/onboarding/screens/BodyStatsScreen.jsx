import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function Field({ label, helper, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-[13px] font-medium text-[hsl(var(--fg-2))]">{label}</label>
        {helper && <span className="text-[11px] text-[hsl(var(--fg-3))]">{helper}</span>}
      </div>
      {children}
    </div>
  );
}

export default function BodyStatsScreen() {
  const { currentScreen, answers, setAnswer } = useOnboarding();
  const t = useT();

  const title = (currentScreen?.titleKey && t(currentScreen.titleKey)) || currentScreen?.title || 'The basics';
  const subtitle = (currentScreen?.subtitleKey && t(currentScreen.subtitleKey)) || currentScreen?.subtitle || 'We use these to calibrate your metabolism and projection.';

  const heightValue = answers.height_cm ?? answers.height ?? '';
  const summary = useMemo(() => {
    const hasBody = answers.sex && answers.age && heightValue && answers.current_weight;
    return hasBody
      ? 'Enough to build a real baseline. You can refine everything later.'
      : 'Required for personalization. Nothing here is permanent.';
  }, [answers.sex, answers.age, heightValue, answers.current_weight]);

  const updateHeight = (value) => {
    const parsed = value === '' ? '' : Number(value);
    setAnswer('height_cm', Number.isNaN(parsed) ? '' : parsed);
    setAnswer('height', Number.isNaN(parsed) ? '' : parsed);
  };

  const updateWeight = (value) => {
    const parsed = value === '' ? '' : Number(value);
    setAnswer('current_weight', Number.isNaN(parsed) ? '' : parsed);
  };

  return (
    <div className="flex flex-1 flex-col px-5 pt-4 pb-2">
      <motion.div
        className="mx-auto flex w-full max-w-[420px] flex-col gap-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand))]">
            Personalize your baseline
          </p>
          <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.04em] text-[hsl(var(--fg))]">
            {title}
          </h1>
          <p className="max-w-[360px] text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
            {subtitle}
          </p>
        </div>

        <div className="rounded-[24px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-4 shadow-[0_12px_40px_hsl(var(--shadow)/0.08)]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Biological sex">
              <Select value={answers.sex ?? ''} onValueChange={(v) => setAnswer('sex', v)}>
                <SelectTrigger className="atlas-field h-12 rounded-[14px] border-0 text-[15px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('onboarding.page.male') || 'Male'}</SelectItem>
                  <SelectItem value="female">{t('onboarding.page.female') || 'Female'}</SelectItem>
                  <SelectItem value="other">{t('onboarding.page.other') || 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Age" helper="Years">
              <Input
                type="number"
                min="1"
                max="120"
                value={answers.age ?? ''}
                onChange={(e) => {
                  const parsed = e.target.value === '' ? '' : Number(e.target.value);
                  setAnswer('age', Number.isNaN(parsed) ? '' : parsed);
                }}
                placeholder="30"
                className="atlas-field h-12 rounded-[14px] border-0 px-4 text-base"
              />
            </Field>

            <Field label="Height" helper="cm">
              <Input
                type="number"
                min="50"
                max="280"
                value={heightValue}
                onChange={(e) => updateHeight(e.target.value)}
                placeholder="175"
                className="atlas-field h-12 rounded-[14px] border-0 px-4 text-base"
              />
            </Field>

            <Field label="Current weight" helper="kg">
              <Input
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={answers.current_weight ?? ''}
                onChange={(e) => updateWeight(e.target.value)}
                placeholder="80"
                className="atlas-field h-12 rounded-[14px] border-0 px-4 text-base"
              />
            </Field>
          </div>

          <div className="mt-4 rounded-[18px] bg-[hsl(var(--fill)/0.55)] px-4 py-3">
            <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{summary}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
              We use these inputs for calorie targets, goal projections, and the first week's plan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
