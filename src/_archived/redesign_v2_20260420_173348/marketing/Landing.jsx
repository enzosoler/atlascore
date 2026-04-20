/**
 * Landing — public marketing home page.
 * Ref: Whoop / Oura / Ladder landing pages — premium-feeling, data-forward.
 *
 * Sections:
 *  1. Hero — big promise + primary CTA
 *  2. Feature grid — 4 pillars (Train, Nutrition, Coach, Body + Labs)
 *  3. How it works — 3 simple steps
 *  4. Social proof — placeholder quote blocks (replace with real testimonials
 *     before launch — TRUST RULE, no fabricated reviews)
 *  5. Final CTA
 *
 * Rules applied:
 *  - ZERO emojis — uses SVG icons + geometric accents.
 *  - Brand palette only (obsidian + cyan + violet + gold).
 *  - safe-area-inset respected through the MarketingShell.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import MarketingShell from './MarketingShell';
import {
  DumbbellIcon, UtensilsIcon, SparkleIcon, PulseIcon,
  TargetIcon, FlameIcon, ChartIcon,
} from '../lib/icons';

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        paddingTop: 72, paddingBottom: 96,
        paddingInline: 'max(16px, env(safe-area-inset-left))',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(0,255,255,0.16) 0%, transparent 60%), ' +
            'radial-gradient(50% 40% at 80% 80%, rgba(139,92,246,0.14) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'rgba(0,255,255,0.08)',
            border: '1px solid rgba(0,255,255,0.20)',
            color: 'hsl(var(--rd-accent))',
            fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          <SparkleIcon size={12} />
          AI-native fitness OS
        </div>
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '0 0 20px',
            color: 'hsl(var(--rd-fg-primary))',
          }}
        >
          The last fitness app you'll ever install.
        </h1>
        <p
          style={{
            fontSize: 'clamp(15px, 1.5vw, 18px)',
            color: 'hsl(var(--rd-fg-secondary))',
            lineHeight: 1.55,
            maxWidth: 560,
            margin: '0 auto 32px',
          }}
        >
          atlas.core combines training, nutrition, body data, and lab work in one
          surface, with an AI coach that actually reads your data. No more five apps.
          No more guessing.
        </p>
        <div style={{ display: 'inline-flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/auth/signup"
            style={{
              padding: '14px 22px',
              borderRadius: 12,
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.005em',
              color: '#05070A',
              textDecoration: 'none',
              background: 'hsl(var(--rd-accent))',
              boxShadow: '0 10px 30px rgba(0,255,255,0.25)',
            }}
          >
            Start free
          </Link>
          <Link
            to="/pricing"
            style={{
              padding: '14px 22px',
              borderRadius: 12,
              fontSize: 15, fontWeight: 700,
              color: 'hsl(var(--rd-fg-primary))',
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              letterSpacing: '-0.005em',
            }}
          >
            See pricing
          </Link>
        </div>
        <div style={{ marginTop: 18, fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>
          Free forever plan · No credit card required
        </div>
      </div>

      {/* Product shot placeholder — stylized frame, no fabricated screenshot */}
      <div style={{ position: 'relative', maxWidth: 980, margin: '64px auto 0' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '16 / 10',
            borderRadius: 24,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            backdropFilter: 'blur(20px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0,
              background:
                'radial-gradient(80% 60% at 30% 40%, rgba(0,255,255,0.10) 0%, transparent 60%), ' +
                'radial-gradient(60% 50% at 80% 70%, rgba(139,92,246,0.12) 0%, transparent 60%)',
            }}
          />
          <div
            style={{
              position: 'absolute', inset: '12% 18%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              { Icon: FlameIcon,   label: 'Daily streak' },
              { Icon: PulseIcon,   label: 'HRV trend' },
              { Icon: ChartIcon,   label: 'Volume' },
              { Icon: UtensilsIcon,label: 'Macros' },
              { Icon: TargetIcon,  label: 'Goal' },
              { Icon: DumbbellIcon,label: "Today's lift" },
            ].map(({ Icon, label }, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: 'hsl(var(--rd-fg-secondary))',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
              >
                <Icon size={18} />
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features grid ─────────────────────────────────────────────────────── */

const FEATURES = [
  {
    Icon: DumbbellIcon,
    tint: { bg: 'rgba(0,255,255,0.10)', bd: 'rgba(0,255,255,0.26)', c: 'hsl(var(--rd-accent))' },
    title: 'Train with intent',
    body: 'Exercise library with 330+ catalogued movements, pre-built routines, and real-time set tracking — like Hevy, plus an AI that reviews your session.',
  },
  {
    Icon: UtensilsIcon,
    tint: { bg: 'rgba(52,211,153,0.10)', bd: 'rgba(52,211,153,0.26)', c: '#34D399' },
    title: 'Log food in seconds',
    body: 'Photo scan, voice log, barcode, or free-text AI parser. Macros, micros, and fiber — auto-calculated and stored with your session history.',
  },
  {
    Icon: SparkleIcon,
    tint: { bg: 'rgba(139,92,246,0.10)', bd: 'rgba(139,92,246,0.26)', c: '#A78BFA' },
    title: 'Your AI coach',
    body: 'Every screen has a coach that knows your goals, your PRs, your sleep, and your labs. Ask anything — it reads your data first, then answers.',
  },
  {
    Icon: PulseIcon,
    tint: { bg: 'rgba(201,169,106,0.10)', bd: 'rgba(201,169,106,0.28)', c: 'hsl(var(--rd-premium))' },
    title: 'Body + labs, together',
    body: 'Weight, photos, circumference, and uploaded bloodwork in one view. Biomarker trends with context — your lipid panel next to your training load.',
  },
];

function FeatureGrid() {
  return (
    <section
      style={{
        paddingBlock: 80,
        paddingInline: 'max(16px, env(safe-area-inset-left))',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="What's inside"
          title="Four pillars, one app"
          subtitle="Everything your body needs tracked, in one surface with shared context."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 36,
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ Icon, tint, title, body }) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 18,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 42, height: 42, borderRadius: 12,
          background: tint.bg, border: `1px solid ${tint.bd}`, color: tint.c,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={20} />
      </div>
      <div>
        <div style={{
          fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em',
          color: 'hsl(var(--rd-fg-primary))', marginBottom: 6,
        }}>
          {title}
        </div>
        <div style={{ fontSize: 13.5, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.55 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

/* ─── How it works ──────────────────────────────────────────────────────── */

const STEPS = [
  {
    num: '01',
    title: 'Set your baseline',
    body: 'Tell the onboarding about your goal, training level, and constraints. Takes under 2 minutes.',
  },
  {
    num: '02',
    title: 'Log what you do',
    body: 'Food in seconds, sets in real-time, body data weekly. The app gets smarter every time you use it.',
  },
  {
    num: '03',
    title: 'Ask your coach',
    body: 'Every insight, every plan tweak, every "is my sleep bad?" — the AI answers using your data.',
  },
];

function HowItWorks() {
  return (
    <section
      style={{
        paddingBlock: 80,
        paddingInline: 'max(16px, env(safe-area-inset-left))',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="How it works"
          title="Three steps. Zero friction."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 36,
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.num}
              style={{
                padding: 24,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
                color: 'hsl(var(--rd-accent))', marginBottom: 14,
              }}>
                {s.num}
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em',
                color: 'hsl(var(--rd-fg-primary))', marginBottom: 8,
              }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13.5, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.55 }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section
      style={{
        paddingBlock: 80,
        paddingInline: 'max(16px, env(safe-area-inset-left))',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: 40,
          borderRadius: 24,
          background: 'rgba(0,255,255,0.05)',
          border: '1px solid rgba(0,255,255,0.22)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(80% 60% at 50% 0%, rgba(0,255,255,0.18) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <h2 style={{
          position: 'relative',
          fontSize: 'clamp(26px, 3.5vw, 36px)',
          fontWeight: 800,
          letterSpacing: '-0.015em',
          lineHeight: 1.15,
          margin: '0 0 12px',
          color: 'hsl(var(--rd-fg-primary))',
        }}>
          Ready to take your body seriously?
        </h2>
        <p style={{
          position: 'relative',
          fontSize: 15, color: 'hsl(var(--rd-fg-secondary))',
          lineHeight: 1.55, maxWidth: 500, margin: '0 auto 24px',
        }}>
          Free forever plan. All core features. Upgrade when (and if) you want the AI coach and lab tools.
        </p>
        <Link
          to="/auth/signup"
          style={{
            position: 'relative',
            display: 'inline-block',
            padding: '14px 28px',
            borderRadius: 12,
            fontSize: 15, fontWeight: 800,
            color: '#05070A',
            textDecoration: 'none',
            background: 'hsl(var(--rd-accent))',
            boxShadow: '0 10px 30px rgba(0,255,255,0.30)',
            letterSpacing: '-0.005em',
          }}
        >
          Create your account
        </Link>
      </div>
    </section>
  );
}

/* ─── Section header helper ─────────────────────────────────────────────── */

function SectionHeader({ kicker, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
      {kicker ? (
        <div style={{
          fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'hsl(var(--rd-accent))',
          marginBottom: 14,
        }}>
          {kicker}
        </div>
      ) : null}
      <h2 style={{
        fontSize: 'clamp(26px, 3.5vw, 38px)',
        fontWeight: 800,
        letterSpacing: '-0.015em',
        lineHeight: 1.15,
        margin: '0 0 10px',
        color: 'hsl(var(--rd-fg-primary))',
      }}>
        {title}
      </h2>
      {subtitle ? (
        <p style={{
          fontSize: 15, color: 'hsl(var(--rd-fg-secondary))',
          lineHeight: 1.55, margin: 0,
        }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <MarketingShell>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <FinalCta />
    </MarketingShell>
  );
}
export { Landing };
