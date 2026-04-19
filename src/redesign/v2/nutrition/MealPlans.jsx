/**
 * MealPlans — adaptive meal plan browser.
 *
 * Pro-gated via `hasAccess(tier, 'meal.plans.adaptive')`. Non-Pro users see a
 * gate card with a violet sparkle + CTA to the paywall. Pro users see:
 *  - "My plans" tab — empty state until backend lands
 *  - "Browse templates" tab — 6 static preset cards with kcal range, split,
 *    description, and a "Start this plan" button (toast for now)
 *
 * TRUST RULE — no real writes happen yet (backend is not wired). Toast copy
 * reflects that honestly so users don't think a plan was saved.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon, UtensilsIcon, PlusIcon } from '../lib/icons';
import { useAuth } from '@/lib/AuthContext';
import { hasAccess } from '../billing/plans';

const TEMPLATES = [
  {
    id: 'cutting',
    title: 'Cutting (-500 kcal)',
    kcal: '1600 – 1800',
    split: { p: 40, c: 35, f: 25 },
    desc: 'High protein, moderate carbs to preserve muscle while losing fat.',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    kcal: '2000 – 2400',
    split: { p: 30, c: 40, f: 30 },
    desc: 'Balanced macros designed to hold your current weight and training volume.',
  },
  {
    id: 'lean-bulk',
    title: 'Lean bulking (+300 kcal)',
    kcal: '2500 – 2900',
    split: { p: 30, c: 45, f: 25 },
    desc: 'Small surplus with enough carbs to fuel hard lifts without added fat.',
  },
  {
    id: 'endurance',
    title: 'Endurance carb-heavy',
    kcal: '2800 – 3400',
    split: { p: 20, c: 60, f: 20 },
    desc: 'High-carb fuel for long-duration sessions — runners, cyclists, triathletes.',
  },
  {
    id: 'low-fodmap',
    title: 'Low FODMAP',
    kcal: '1900 – 2200',
    split: { p: 30, c: 40, f: 30 },
    desc: 'IBS-friendly substitutions with minimal fermentable carbs.',
  },
  {
    id: 'plant-protein',
    title: 'Plant-based high-protein',
    kcal: '2100 – 2400',
    split: { p: 30, c: 45, f: 25 },
    desc: 'Soy, legumes, and complete grains combined for full amino profiles.',
  },
];

export default function MealPlans({
  isPro = false,
  onUpgrade,
  onGeneratePlan,
  onStartTemplate,
}) {
  const [tab, setTab] = useState('mine');

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <SpringReveal delay={20}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Nutrition
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Meal plans
            </h1>
            <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', marginTop: 6, lineHeight: 1.45 }}>
              AI-tailored plans that adapt to your goals, training load, and food preferences.
            </p>
          </div>
        </SpringReveal>

        {!isPro ? (
          <UpgradeGate onUpgrade={onUpgrade} />
        ) : (
          <>
            {/* Tabs */}
            <SpringReveal delay={60}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 4,
                  padding: 4,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <TabBtn active={tab === 'mine'} onClick={() => setTab('mine')}>My plans</TabBtn>
                <TabBtn active={tab === 'browse'} onClick={() => setTab('browse')}>Browse templates</TabBtn>
              </div>
            </SpringReveal>

            {tab === 'mine' ? (
              <MyPlansEmpty onGenerate={onGeneratePlan} />
            ) : (
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {TEMPLATES.map((t, i) => (
                  <SpringReveal key={t.id} delay={80 + i * 40}>
                    <TemplateCard template={t} onStart={() => onStartTemplate?.(t)} />
                  </SpringReveal>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </SafeScreen>
  );
}
export { MealPlans };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 38,
        borderRadius: 10,
        background: active ? 'rgba(0,255,255,0.14)' : 'transparent',
        border: active ? '1px solid rgba(0,255,255,0.4)' : '1px solid transparent',
        color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 13, fontWeight: 600,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function UpgradeGate({ onUpgrade }) {
  return (
    <SpringReveal delay={60}>
      <Glass tint="ai" radius="xl" elevation="lg" style={{ padding: 24, textAlign: 'center' }}>
        <div
          aria-hidden
          style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(180deg, rgba(139,92,246,0.30) 0%, rgba(139,92,246,0.14) 100%)',
            color: '#A78BFA',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <SparkleIcon size={26} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Pro feature
        </div>
        <h2 style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          AI meal plans are a Pro feature
        </h2>
        <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', marginTop: 8, lineHeight: 1.5, maxWidth: 340, marginInline: 'auto' }}>
          Get unlimited plans tailored to your goals — adapt weekly based on your training, weight, and preferences.
        </p>
        <div style={{ marginTop: 18 }}>
          <LiquidButton intent="ai" size="lg" onClick={onUpgrade}>
            Upgrade to Pro
          </LiquidButton>
        </div>
      </Glass>
    </SpringReveal>
  );
}

function MyPlansEmpty({ onGenerate }) {
  return (
    <SpringReveal delay={100}>
      <Glass radius="xl" style={{ padding: 28, textAlign: 'center', marginTop: 16 }}>
        <div
          aria-hidden
          style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            color: 'hsl(var(--rd-fg-muted))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <UtensilsIcon size={24} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>
          No plans yet
        </div>
        <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.45, maxWidth: 300, marginInline: 'auto' }}>
          Generate your first adaptive plan — we'll build it from your goals and preferences.
        </div>
        <div style={{ marginTop: 14 }}>
          <LiquidButton intent="ai" size="lg" leftIcon={<SparkleIcon size={14} />} onClick={onGenerate}>
            Generate your first plan
          </LiquidButton>
        </div>
      </Glass>
    </SpringReveal>
  );
}

function TemplateCard({ template, onStart }) {
  const { p, c, f } = template.split;
  return (
    <Glass radius="xl" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>{template.title}</div>
        <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, flexShrink: 0 }}>
          {template.kcal} kcal
        </div>
      </div>

      {/* Macro split strip */}
      <div style={{ display: 'flex', height: 6, borderRadius: 6, overflow: 'hidden', marginTop: 10, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ width: `${p}%`, background: 'hsl(var(--rd-accent))' }} />
        <div style={{ width: `${c}%`, background: '#FBBF24' }} />
        <div style={{ width: `${f}%`, background: '#A78BFA' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        <span><span style={{ color: 'hsl(var(--rd-accent))' }}>•</span> P {p}%</span>
        <span><span style={{ color: '#FBBF24' }}>•</span> C {c}%</span>
        <span><span style={{ color: '#A78BFA' }}>•</span> F {f}%</span>
      </div>

      <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', marginTop: 10, lineHeight: 1.45 }}>
        {template.desc}
      </p>

      <div style={{ marginTop: 12 }}>
        <LiquidButton intent="primary" size="sm" leftIcon={<PlusIcon size={14} />} onClick={onStart}>
          Start this plan
        </LiquidButton>
      </div>
    </Glass>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function MealPlansRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier || 'free';
  const isPro = hasAccess(tier, 'meal.plans.adaptive');

  return (
    <MealPlans
      isPro={isPro}
      onUpgrade={() => navigate('/app/billing/paywall')}
      onGeneratePlan={() => {
        // TODO: call nutritionAi.generatePlan(user) once backend is wired.
        toast.info('Plan generation coming soon', {
          description: 'Wiring this up next.',
        });
      }}
      onStartTemplate={(t) => {
        // TODO: persist chosen template to user's meal plans table in Supabase.
        toast.success(`"${t.title}" queued`, {
          description: 'This will become your active plan once sync is wired.',
        });
      }}
    />
  );
}
