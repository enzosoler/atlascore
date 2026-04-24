import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import {
  readOnboardingIntentDraft,
  writeOnboardingIntentDraft,
} from '@/services/onboardingService';

const GOALS = [
  { id: 'lose', label: 'Lose fat' },
  { id: 'recomp', label: 'Recomp' },
  { id: 'maintain', label: 'Maintain' },
  { id: 'gain', label: 'Build muscle' },
];

const EXPERIENCE = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const EQUIPMENT = [
  'Full gym',
  'Home gym',
  'Dumbbells only',
  'Bodyweight',
  'Resistance bands',
];

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: 16,
        border: active ? '1px solid transparent' : '1px solid rgba(10,10,10,0.12)',
        background: active ? ACBrand.ink : 'rgba(255,255,255,0.72)',
        color: active ? ACBrand.paper : ACBrand.ink,
        fontFamily: ACFonts.body,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: -0.1,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {children}
    </button>
  );
}

function QuizStage({ draft, update, onContinue }) {
  const canContinue = Boolean(draft.goal && draft.experience && draft.equipment?.length);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '56px 24px 96px' }}>
      <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(10,10,10,0.58)' }}>
        Intent quiz
      </div>
      <div style={{ marginTop: 18, fontFamily: ACFonts.brand, fontSize: 'clamp(52px, 9vw, 92px)', lineHeight: 0.86, letterSpacing: '-0.06em', textTransform: 'lowercase' }}>
        build the plan
        <br />
        before the account.
      </div>
      <p style={{ margin: '18px 0 0', maxWidth: 700, fontSize: 18, lineHeight: 1.6, color: 'rgba(10,10,10,0.72)' }}>
        Three fast answers first. We will show the shape of your week before asking for email.
      </p>

      <div style={{ marginTop: 34, display: 'grid', gap: 24 }}>
        <section>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ACBrand.accent }}>
            01 · Goal
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {GOALS.map((item) => (
              <Pill key={item.id} active={draft.goal === item.id} onClick={() => update({ goal: item.id })}>
                {item.label}
              </Pill>
            ))}
          </div>
        </section>

        <section>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ACBrand.accent }}>
            02 · Experience
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {EXPERIENCE.map((item) => (
              <Pill key={item.id} active={draft.experience === item.id} onClick={() => update({ experience: item.id })}>
                {item.label}
              </Pill>
            ))}
          </div>
        </section>

        <section>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ACBrand.accent }}>
            03 · Equipment
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {EQUIPMENT.map((item) => {
              const active = draft.equipment.includes(item);
              return (
                <Pill
                  key={item}
                  active={active}
                  onClick={() => update({
                    equipment: active
                      ? draft.equipment.filter((value) => value !== item)
                      : [...draft.equipment, item],
                  })}
                >
                  {item}
                </Pill>
              );
            })}
          </div>
        </section>
      </div>

      <div style={{ marginTop: 32 }}>
        <button
          type="button"
          onClick={canContinue ? onContinue : undefined}
          style={{
            width: '100%',
            maxWidth: 360,
            border: 'none',
            borderRadius: 999,
            padding: '18px 24px',
            background: canContinue ? ACBrand.ink : 'rgba(10,10,10,0.18)',
            color: ACBrand.paper,
            fontFamily: ACFonts.brand,
            fontSize: 28,
            letterSpacing: -0.9,
            textTransform: 'lowercase',
            cursor: canContinue ? 'pointer' : 'default',
          }}
        >
          build my week
        </button>
      </div>
    </div>
  );
}

function WorkingStage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: 8, marginBottom: 24 }}>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: ACBrand.accent,
                opacity: 0.35 + index * 0.2,
                animation: `intentPulse 1.2s ${index * 0.12}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>
        <div style={{ fontFamily: ACFonts.brand, fontSize: 'clamp(44px, 8vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'lowercase' }}>
          analyzing your goals
          <br />
          and building your week.
        </div>
        <p style={{ margin: '18px auto 0', maxWidth: 440, fontSize: 16, lineHeight: 1.6, color: 'rgba(10,10,10,0.68)' }}>
          Matching your training intent, recovery load, and available equipment into a first-pass routine.
        </p>
      </div>
    </div>
  );
}

function PreviewStage({ draft, onUnlock }) {
  const goalLabel = GOALS.find((item) => item.id === draft.goal)?.label || 'Your goal';

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '56px 24px 96px' }}>
      <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(10,10,10,0.58)' }}>
        Personalized preview
      </div>
      <div style={{ marginTop: 18, fontFamily: ACFonts.brand, fontSize: 'clamp(52px, 9vw, 92px)', lineHeight: 0.86, letterSpacing: '-0.06em', textTransform: 'lowercase' }}>
        your plan is ready.
      </div>
      <p style={{ margin: '18px 0 0', maxWidth: 680, fontSize: 18, lineHeight: 1.6, color: 'rgba(10,10,10,0.72)' }}>
        We mapped a first week for {goalLabel.toLowerCase()}. The structure is visible below, but the workouts stay locked until you create an account.
      </p>

      <div style={{ position: 'relative', marginTop: 30 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            filter: 'blur(8px)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <div key={day} style={{ borderRadius: 24, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(10,10,10,0.08)', padding: 20, minHeight: 180 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: ACBrand.accent }}>
                {day}
              </div>
              <div style={{ marginTop: 12, fontFamily: ACFonts.brand, fontSize: 28, lineHeight: 0.95, letterSpacing: -1, textTransform: 'lowercase' }}>
                {index % 2 === 0 ? 'strength block' : 'recovery + fuel'}
              </div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'rgba(10,10,10,0.72)' }}>
                {index % 2 === 0 ? 'Primary lift focus, accessory density, and protein target.' : 'Recovery work, walking target, and meal structure.'}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            inset: '8% 8%',
            borderRadius: 28,
            background: 'rgba(10,10,10,0.9)',
            color: ACBrand.paper,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          }}
        >
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: ACBrand.accent }}>
            Unlock your plan
          </div>
          <div style={{ marginTop: 14, fontFamily: ACFonts.brand, fontSize: 'clamp(36px, 6vw, 56px)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'lowercase' }}>
            your personalized plan is ready.
          </div>
          <p style={{ margin: '14px 0 0', maxWidth: 420, fontSize: 15, lineHeight: 1.6, color: 'rgba(239,233,218,0.76)' }}>
            Create a free account to unlock the workouts, save the plan, and keep building from your real data.
          </p>
          <button
            type="button"
            onClick={onUnlock}
            style={{
              marginTop: 22,
              border: 'none',
              borderRadius: 999,
              padding: '16px 22px',
              background: ACBrand.accent,
              color: ACBrand.ink,
              fontFamily: ACFonts.brand,
              fontSize: 26,
              letterSpacing: -0.8,
              textTransform: 'lowercase',
              cursor: 'pointer',
            }}
          >
            create free account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function V3IntentFlow() {
  const navigate = useNavigate();
  const [stage, setStage] = React.useState('quiz');
  const [draft, setDraft] = React.useState(() => {
    const stored = readOnboardingIntentDraft();
    return {
      goal: stored.goal || '',
      experience: stored.experience || '',
      equipment: Array.isArray(stored.equipment) ? stored.equipment : [],
      startedAt: stored.startedAt || new Date().toISOString(),
    };
  });

  React.useEffect(() => {
    writeOnboardingIntentDraft(draft);
  }, [draft]);

  React.useEffect(() => {
    if (stage !== 'working') return undefined;

    const timer = window.setTimeout(() => {
      setStage('preview');
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${ACBrand.paper} 0%, #e7dfc9 100%)`, color: ACBrand.ink }}>
      <style>{`
        @keyframes intentPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.32; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {stage === 'quiz' ? (
        <QuizStage draft={draft} update={(patch) => setDraft((prev) => ({ ...prev, ...patch }))} onContinue={() => setStage('working')} />
      ) : null}
      {stage === 'working' ? <WorkingStage /> : null}
      {stage === 'preview' ? <PreviewStage draft={draft} onUnlock={() => navigate('/auth/signup?source=intent')} /> : null}
    </div>
  );
}
