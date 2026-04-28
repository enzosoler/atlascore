import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { ACBtn, ACFonts, ACLabel, ACRadii, useACT } from '../lib/paper.jsx';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S7_Onboard_Identity from '../screens/S7_Onboard_Identity.jsx';
import S8_Onboard_Goal from '../screens/S8_Onboard_Goal.jsx';
import S9_Onboard_Activity from '../screens/S9_Onboard_Activity.jsx';
import S10_Onboard_Plan from '../screens/S10_Onboard_Plan.jsx';
import S11_Onboard_Permissions from '../screens/S11_Onboard_Permissions.jsx';
import S58_Onboard_Workout from '../screens/S58_Onboard_Workout.jsx';
import S59_Onboard_Habits from '../screens/S59_Onboard_Habits.jsx';
import S60_Onboard_Constraints from '../screens/S60_Onboard_Constraints.jsx';
import S61_Onboard_Summary from '../screens/S61_Onboard_Summary.jsx';
import S62_Onboard_Tour from '../screens/S62_Onboard_Tour.jsx';
import {
  buildProfileDataFromOnboarding,
  finalizeOnboarding,
  readOnboardingDraft,
  writeOnboardingDraft,
} from '@/services/onboardingService';

/** Shared onboarding state — persists to localStorage across steps. */
function useOnboardingState() {
  const [data, setData] = useState(() => {
    return readOnboardingDraft();
  });
  const update = useCallback((patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      writeOnboardingDraft(next);
      return next;
    });
  }, []);
  return { data, update };
}

function Wrap({ children }) {
  return <V3StandaloneLayout>{children}</V3StandaloneLayout>;
}

function SplitOnboardingCard({ dark = false, stepLabel, title, body, children, footer }) {
  const c = useACT(dark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg, minHeight: 0 }}>
      <div style={{ padding: '18px 28px 0' }}>
        <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {stepLabel}
        </ACLabel>
        <div style={{ marginTop: 12, fontFamily: ACFonts.display, fontSize: 34, lineHeight: 1, letterSpacing: -1.2 }}>
          {title}
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: c.dim, maxWidth: 320 }}>
          {body}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 28px 16px' }}>
        {children}
      </div>
      <div style={{ padding: '14px 28px 26px', background: c.bg, flexShrink: 0 }}>
        {footer}
      </div>
    </div>
  );
}

export function V3OnboardingDietPreferences() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  const t = useT();
  const c = useACT(theme === 'dark');
  const [dietaryStyle, setDietaryStyle] = useState(data?.dietaryStyle || 'high_protein');
  const [restrictions, setRestrictions] = useState(() => new Set(data?.dietaryRestrictions || []));
  const [avoidFoods, setAvoidFoods] = useState(data?.avoidFoods || '');
  const styleKeys = ['high_protein', 'balanced', 'low_carb', 'plant_forward'];
  const styles = styleKeys.map((id) => [id, t(`onboarding.diet.styles.${id}`)]);
  const restrictionKeys = ['dairy_free', 'gluten_free', 'vegetarian', 'vegan', 'no_pork', 'no_shellfish'];
  const restrictionOptions = restrictionKeys.map((k) => ({ key: k, label: t(`onboarding.diet.restrictions.${k}`) }));

  function emit(nextPatch = {}) {
    update({
      dietaryStyle,
      dietaryRestrictions: Array.from(restrictions),
      avoidFoods,
      ...nextPatch,
    });
  }

  return (
    <Wrap>
      <SplitOnboardingCard
        dark={theme === 'dark'}
        stepLabel={t('onboarding.diet.stepLabel')}
        title={t('onboarding.diet.title')}
        body={t('onboarding.diet.body')}
        footer={(
          <ACBtn primary block dark={theme === 'dark'} size="lg" pill onClick={() => {
            emit();
            navigate('/onboarding/goal');
          }}
          >
            {t('onboarding.diet.continue')}
          </ACBtn>
        )}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          {styles.map(([id, label]) => {
            const active = dietaryStyle === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setDietaryStyle(id);
                  emit({ dietaryStyle: id });
                }}
                style={{
                  padding: '16px 18px',
                  borderRadius: ACRadii.input,
                  border: active ? '1px solid transparent' : `1px solid ${c.hair}`,
                  background: active ? c.fg : 'transparent',
                  color: active ? c.bg : c.fg,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>
            {t('onboarding.diet.restrictionsLabel')}
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {restrictionOptions.map(({ key, label }) => {
              const active = restrictions.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    const next = new Set(restrictions);
                    next.has(key) ? next.delete(key) : next.add(key);
                    setRestrictions(next);
                    emit({ dietaryRestrictions: Array.from(next) });
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 999,
                    border: active ? '1px solid transparent' : `1px solid ${c.hair}`,
                    background: active ? c.accent : 'transparent',
                    color: active ? c.ink : c.fg,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>
            {t('onboarding.diet.avoidLabel')}
          </ACLabel>
          <textarea
            value={avoidFoods}
            onChange={(event) => {
              setAvoidFoods(event.target.value);
              emit({ avoidFoods: event.target.value });
            }}
            placeholder={t('onboarding.diet.avoidPlaceholder')}
            style={{
              marginTop: 12,
              width: '100%',
              minHeight: 110,
              borderRadius: ACRadii.card,
              border: `1px solid ${c.hair}`,
              background: c.card,
              color: c.fg,
              padding: 14,
              fontSize: 14,
              fontFamily: ACFonts.body,
              resize: 'vertical',
            }}
          />
        </div>
      </SplitOnboardingCard>
    </Wrap>
  );
}

export function V3OnboardingCoachMatch() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  const t = useT();
  const c = useACT(theme === 'dark');
  const [coachTone, setCoachTone] = useState(data?.coachTone || 'direct');
  const [coachFocus, setCoachFocus] = useState(data?.coachFocus || 'consistency');
  const toneKeys = ['direct', 'supportive', 'analytical'];
  const tones = toneKeys.map((id) => [id, t(`onboarding.coachMatch.tones.${id}`)]);
  const focusKeys = ['consistency', 'performance', 'body_comp', 'recovery'];
  const focuses = focusKeys.map((id) => [id, t(`onboarding.coachMatch.focuses.${id}`)]);

  return (
    <Wrap>
      <SplitOnboardingCard
        dark={theme === 'dark'}
        stepLabel={t('onboarding.coachMatch.stepLabel')}
        title={t('onboarding.coachMatch.title')}
        body={t('onboarding.coachMatch.body')}
        footer={(
          <ACBtn
            primary
            block
            dark={theme === 'dark'}
            size="lg"
            pill
            onClick={() => {
              update({ coachTone, coachFocus });
              navigate('/onboarding/tour');
            }}
          >
            {t('onboarding.coachMatch.continue')}
          </ACBtn>
        )}
      >
        <div>
          <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>
            {t('onboarding.coachMatch.toneLabel')}
          </ACLabel>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {tones.map(([id, label]) => {
              const active = coachTone === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCoachTone(id)}
                  style={{
                    padding: '16px 18px',
                    borderRadius: ACRadii.input,
                    border: active ? '1px solid transparent' : `1px solid ${c.hair}`,
                    background: active ? c.fg : 'transparent',
                    color: active ? c.bg : c.fg,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>
            {t('onboarding.coachMatch.focusLabel')}
          </ACLabel>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {focuses.map(([id, label]) => {
              const active = coachFocus === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCoachFocus(id)}
                  style={{
                    padding: '16px 18px',
                    borderRadius: ACRadii.input,
                    border: active ? '1px solid transparent' : `1px solid ${c.hair}`,
                    background: active ? c.accent : 'transparent',
                    color: active ? c.ink : c.fg,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </SplitOnboardingCard>
    </Wrap>
  );
}

export function V3OnboardingIdentity() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S7_Onboard_Identity
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onContinue={() => navigate('/onboarding/nutrition')}
      />
    </Wrap>
  );
}

export function V3OnboardingGoal() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S8_Onboard_Goal
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/nutrition')}
        onContinue={() => navigate('/onboarding/activity')}
      />
    </Wrap>
  );
}

export function V3OnboardingActivity() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S9_Onboard_Activity
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/goal')}
        onContinue={() => navigate('/onboarding/stats')}
      />
    </Wrap>
  );
}

export function V3OnboardingPlan() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S10_Onboard_Plan
        dark={theme === 'dark'}
        onboardingData={data}
        onChange={update}
        onBack={() => navigate('/onboarding/activity')}
        onContinue={(nextData) => {
          update(nextData || {});
          navigate('/onboarding/diet');
        }}
      />
    </Wrap>
  );
}

export function V3OnboardingPermissions() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S11_Onboard_Permissions
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/stats')}
        onContinue={() => navigate('/onboarding/workout')}
        onSkip={() => navigate('/onboarding/workout')}
      />
    </Wrap>
  );
}

export function V3OnboardingWorkout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S58_Onboard_Workout
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/diet')}
        onContinue={() => navigate('/onboarding/habits')}
      />
    </Wrap>
  );
}

export function V3OnboardingHabits() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S59_Onboard_Habits
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/workout')}
        onContinue={() => navigate('/onboarding/constraints')}
      />
    </Wrap>
  );
}

export function V3OnboardingConstraints() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S60_Onboard_Constraints
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/habits')}
        onContinue={() => navigate('/onboarding/summary')}
        onSkip={() => navigate('/onboarding/summary')}
      />
    </Wrap>
  );
}

export function V3OnboardingSummary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data } = useOnboardingState();
  const profileData = buildProfileDataFromOnboarding(data);
  const summaryTargets = {
    calories: profileData?.targets?.calories,
    protein: profileData?.targets?.protein,
    carbs: profileData?.targets?.carbs,
    fat: profileData?.targets?.fat,
    weeklySessions: profileData?.training_days_per_week,
    experience: profileData?.training_experience,
    sleep: profileData?.sleep_target_hours,
    waterL: profileData?.water_target_liters,
    steps: profileData?.steps_target,
  };
  const summaryConstraints = profileData?.constraints || data;
  return (
    <Wrap>
      <S61_Onboard_Summary
        dark={theme === 'dark'}
        targets={summaryTargets}
        constraints={summaryConstraints}
        onBack={() => navigate('/onboarding/constraints')}
        onContinue={() => navigate('/onboarding/coach-match')}
      />
    </Wrap>
  );
}

export function V3OnboardingTour() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, checkAppState } = useAuth();
  const t = useT();
  const [finishing, setFinishing] = useState(false);

  async function completeOnboarding() {
    if (finishing) return;
    if (!user?.id) {
      navigate('/auth/signup', { replace: true });
      return;
    }

    setFinishing(true);
    try {
      console.log('[onboarding] tour finish requested', { userId: user.id });
      await finalizeOnboarding(user.id);
      await checkAppState();
      navigate('/app/today', { replace: true });
    } catch (error) {
      console.error('[onboarding] tour finish failed', {
        userId: user.id,
        code: error?.code || null,
        message: error?.message || null,
        details: error?.details || null,
        hint: error?.hint || null,
      });
      toast.error(t('onboarding.tourError.title'), {
        description: error?.message || t('onboarding.tourError.fallback'),
      });
    } finally {
      setFinishing(false);
    }
  }

  return (
    <Wrap>
      <S62_Onboard_Tour
        dark
        finishing={finishing}
        onFinish={completeOnboarding}
        onSkip={completeOnboarding}
      />
    </Wrap>
  );
}
