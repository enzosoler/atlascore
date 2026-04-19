/**
 * Pricing — 3-tier pricing page with feature comparison and billing FAQ.
 *
 * Tiers (placeholder numbers — Enzo to set real pricing):
 *   - Free        — core logging, unlimited. No AI coach.
 *   - Pro         — full AI coach, meal plans, lab uploads.
 *   - Elite       — everything Pro + 1:1 human coach, hardware discounts.
 *
 * Pricing is data-driven via PRICING_TIERS below — swap the numbers + copy
 * without editing JSX.
 *
 * Rules applied:
 *  - ZERO emojis.
 *  - TRUST RULE — no fake testimonials or fabricated user counts.
 *  - Toggle month/year has an honest yearly discount (placeholder 20%).
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingShell from './MarketingShell';
import { SparkleIcon, BoltIcon } from '../lib/icons';
import { PLANS } from '../billing/plans';

/* ─── Data — pulled from billing/plans.js (single source of truth) ──────── */

const TIER_ICONS = { free: BoltIcon, pro: SparkleIcon };
const TIER_CTAS = {
  free: { label: 'Start free',            to: '/auth/signup' },
  pro:  { label: 'Start 7-day free trial', to: '/auth/signup?plan=pro' },
};

// Augment the bare PLANS data with the marketing-only Icon + cta fields.
const PRICING_TIERS = PLANS.map((p) => ({
  ...p,
  Icon: TIER_ICONS[p.id] || BoltIcon,
  cta:  TIER_CTAS[p.id]   || { label: 'Get started', to: '/auth/signup' },
}));

const BILLING_FAQ = [
  {
    q: 'Can I change or cancel anytime?',
    a: 'Yes. Subscriptions are month-to-month (or yearly). Cancel from Settings → Subscription. Your access stays active until the end of the current billing period.',
  },
  {
    q: 'Is there a free trial on Pro?',
    a: 'Yes — 7 days of Pro for free, no credit card required up front. If you don\'t upgrade, your account stays on Free with no interruption.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yearly plans are refundable within 14 days, no questions asked. Monthly plans are non-refundable but cancelable anytime.',
  },
  {
    q: 'Is my data private?',
    a: 'Your logs, photos, and health data are end-to-end encrypted at rest and in transit. We do not sell or share personal data. See our Privacy Policy for specifics.',
  },
  {
    q: 'Can I use atlas.core on multiple devices?',
    a: 'Yes. iOS, Android, and web share the same account. Changes sync in seconds.',
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function Pricing() {
  // Default to monthly — sweet-spot for visitor reading the page; yearly is
  // surfaced via savings badge to nudge upgrade.
  const [billing, setBilling] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  return (
    <MarketingShell>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          paddingTop: 56, paddingBottom: 24,
          paddingInline: 'max(16px, env(safe-area-inset-left))',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(60% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'hsl(var(--rd-accent))',
            marginBottom: 14,
          }}>
            Pricing
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: '0 0 14px',
            color: 'hsl(var(--rd-fg-primary))',
          }}>
            Simple pricing. Real value.
          </h1>
          <p style={{
            fontSize: 15.5,
            color: 'hsl(var(--rd-fg-secondary))',
            lineHeight: 1.55,
            maxWidth: 520,
            margin: '0 auto 28px',
          }}>
            Start free forever. Upgrade for AI coaching, meal plans, and lab insights whenever you're ready.
          </p>

          {/* Billing toggle */}
          <BillingToggle value={billing} onChange={setBilling} />
        </div>
      </section>

      {/* Tiers */}
      <section
        style={{
          paddingTop: 32,
          paddingBottom: 40,
          paddingInline: 'max(16px, env(safe-area-inset-left))',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {PRICING_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} billing={billing} />
          ))}
        </div>
      </section>

      {/* Billing FAQ */}
      <section
        style={{
          paddingBlock: 64,
          paddingInline: 'max(16px, env(safe-area-inset-left))',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'hsl(var(--rd-accent))',
              marginBottom: 14,
            }}>
              Billing FAQ
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 800,
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              margin: 0,
              color: 'hsl(var(--rd-fg-primary))',
            }}>
              Questions, answered.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BILLING_FAQ.map((f, i) => (
              <FAQItem key={i} question={f.q} answer={f.a} defaultOpen={i === 0} />
            ))}
          </div>

          <div style={{
            marginTop: 32, textAlign: 'center',
            fontSize: 13, color: 'hsl(var(--rd-fg-muted))',
          }}>
            More questions?{' '}
            <a href="mailto:hello@useatlascore.com" style={{ color: 'hsl(var(--rd-accent))' }}>
              hello@useatlascore.com
            </a>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
export { Pricing };

/* ─── Billing toggle ────────────────────────────────────────────────────── */

function BillingToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 4,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        gap: 4,
        flexWrap: 'wrap',
      }}
    >
      <ToggleBtn active={value === 'weekly'} onClick={() => onChange('weekly')}>
        Weekly
      </ToggleBtn>
      <ToggleBtn active={value === 'monthly'} onClick={() => onChange('monthly')}>
        Monthly
        <SavingsBadge>Save 42%</SavingsBadge>
      </ToggleBtn>
      <ToggleBtn active={value === 'yearly'}  onClick={() => onChange('yearly')}>
        Yearly
        <SavingsBadge strong>Save 62%</SavingsBadge>
      </ToggleBtn>
    </div>
  );
}

function SavingsBadge({ children, strong = false }) {
  return (
    <span style={{
      marginLeft: 6,
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em',
      padding: '2px 6px', borderRadius: 6,
      background: strong ? 'rgba(0,255,255,0.18)' : 'rgba(0,255,255,0.10)',
      border: strong ? '1px solid rgba(0,255,255,0.40)' : '1px solid rgba(0,255,255,0.24)',
      color: 'hsl(var(--rd-accent))',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 9,
        fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em',
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
        color: active ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        display: 'inline-flex', alignItems: 'center',
      }}
    >
      {children}
    </button>
  );
}

/* ─── Tier card ─────────────────────────────────────────────────────────── */

function TierCard({ tier, billing }) {
  // Pick price + unit based on billing period. Weekly is the anchor.
  const price =
    billing === 'yearly'  ? tier.priceYearly  :
    billing === 'weekly'  ? tier.priceWeekly  :
                            tier.priceMonthly;
  const perUnit =
    billing === 'yearly'  ? '/year' :
    billing === 'weekly'  ? '/week' :
                            '/mo';

  const tintStyles = {
    neutral: { bg: 'rgba(255,255,255,0.04)', bd: 'rgba(255,255,255,0.10)', c: 'hsl(var(--rd-fg-primary))', btnBg: 'rgba(255,255,255,0.06)', btnBorder: 'rgba(255,255,255,0.14)' },
    violet:  { bg: 'rgba(139,92,246,0.08)',  bd: 'rgba(139,92,246,0.28)',  c: '#A78BFA', btnBg: '#A78BFA', btnBorder: '#A78BFA', solid: true },
    gold:    { bg: 'rgba(201,169,106,0.08)', bd: 'rgba(201,169,106,0.30)', c: 'hsl(var(--rd-premium))', btnBg: 'rgba(201,169,106,0.14)', btnBorder: 'rgba(201,169,106,0.40)' },
  };
  const t = tintStyles[tier.tint] || tintStyles.neutral;

  return (
    <div
      style={{
        position: 'relative',
        padding: 24,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.03)',
        border: tier.popular ? `1px solid ${t.bd}` : '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 18,
        boxShadow: tier.popular ? `0 0 0 1px ${t.bd} inset, 0 10px 40px -20px ${t.bd}` : 'none',
      }}
    >
      {tier.popular ? (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(80% 60% at 50% 0%, ${t.bg.replace('0.08', '0.15')} 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {tier.popular ? (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '3px 8px', borderRadius: 6,
          background: t.bg, border: `1px solid ${t.bd}`, color: t.c,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>
          Most popular
        </div>
      ) : null}

      {/* Header */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          aria-hidden
          style={{
            width: 38, height: 38, borderRadius: 11,
            background: t.bg, border: `1px solid ${t.bd}`, color: t.c,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <tier.Icon size={18} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
          {tier.name}
        </div>
      </div>

      {/* Price */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <div style={{
            fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em',
            color: 'hsl(var(--rd-fg-primary))', lineHeight: 1,
          }}>
            ${price}
          </div>
          <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
            {price > 0 ? perUnit : ''}
          </div>
        </div>
        {price > 0 && billing === 'yearly' ? (
          <div style={{ fontSize: 11.5, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
            ≈ ${(price / 12).toFixed(2)}/mo billed yearly
          </div>
        ) : null}
        {price > 0 && billing === 'weekly' ? (
          <div style={{ fontSize: 11.5, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
            ≈ ${(price * 4.33).toFixed(2)}/mo billed weekly
          </div>
        ) : null}
        <p style={{
          fontSize: 13, color: 'hsl(var(--rd-fg-secondary))',
          lineHeight: 1.55, margin: '10px 0 0',
        }}>
          {tier.tagline}
        </p>
      </div>

      {/* CTA */}
      <Link
        to={tier.cta.to}
        style={{
          position: 'relative',
          display: 'inline-block',
          textAlign: 'center',
          padding: '12px 18px',
          borderRadius: 12,
          fontSize: 14, fontWeight: 800, letterSpacing: '-0.005em',
          textDecoration: 'none',
          background: t.solid ? t.btnBg : t.btnBg,
          border: `1px solid ${t.btnBorder}`,
          color: t.solid ? '#05070A' : 'hsl(var(--rd-fg-primary))',
        }}
      >
        {tier.cta.label}
      </Link>

      {/* Features */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {tier.features.map((f, i) => (
          <FeatureRow key={i} feature={f} />
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ feature: f }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        opacity: f.included ? 1 : 0.45,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 16, height: 16, borderRadius: 9999,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 2,
          background: f.included ? 'rgba(0,255,255,0.12)' : 'rgba(255,255,255,0.04)',
          border: f.included ? '1px solid rgba(0,255,255,0.30)' : '1px solid rgba(255,255,255,0.10)',
          color: f.included ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))',
        }}
      >
        {f.included ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
            <path d="M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          color: f.strong ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-secondary))',
          lineHeight: 1.45,
          fontWeight: f.strong ? 700 : 500,
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <span style={{ flex: '1 1 auto' }}>{f.text}</span>
          {/* Note (e.g. "3 per day", "5 messages / week") — the freemium limit. */}
          {f.note ? (
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em',
              color: 'hsl(var(--rd-fg-muted))',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}>
              {f.note}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

function FAQItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left',
          padding: '16px 18px',
          background: 'transparent',
          border: 'none',
          color: 'hsl(var(--rd-fg-primary))',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
        }}
      >
        <span style={{ flex: 1 }}>{question}</span>
        <svg
          aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none"
          style={{
            flexShrink: 0,
            color: 'hsl(var(--rd-fg-muted))',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms',
          }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div style={{
          padding: '0 18px 18px',
          fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.6,
        }}>
          {answer}
        </div>
      ) : null}
    </div>
  );
}
