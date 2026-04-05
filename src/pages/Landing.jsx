import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Brain,
  Compass,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COPY } from '@/config/landingCopy';
import { supabase } from '@/lib/supabaseClient';
import { trackLandingPageView, trackCtaClick, trackWaitlistSignup } from '@/lib/analytics';

/* ─────────────────────────────────────────
   ANIMATION HELPERS
───────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

const LOOP_ICONS = [Eye, Brain, Compass, Zap, RefreshCw];

/* ─────────────────────────────────────────
   EARLY ACCESS FORM
───────────────────────────────────────── */
function EarlyAccessForm({ copy, compact = false }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    goal: '',
    improving: '',
    currentTools: '',
    interest: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setChip = (key, value) => () =>
    setForm((f) => ({ ...f, [key]: f[key] === value ? '' : value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('waitlist').insert([{
        name: form.name || null,
        email: form.email,
        primary_goal: form.goal || null,
        improving: form.improving || null,
        current_tools: form.currentTools || null,
        interest_type: form.interest || null,
      }]);
      // Duplicate email (unique constraint) — still show success
      if (error && !error.message?.includes('duplicate')) {
        console.error('Waitlist insert error:', error);
      }
    } catch {
      // silently succeed
    }
    setLoading(false);
    setSubmitted(true);
    trackWaitlistSignup({ goal: form.goal || undefined });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--sys-green)/0.12)]">
          <CheckCircle2 className="h-7 w-7 text-[hsl(var(--sys-green))]" />
        </div>
        <h3 className="text-[1.25rem] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
          {copy.successHeading}
        </h3>
        <p className="text-[14px] text-[hsl(var(--fg-2))]">{copy.successText}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Email row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
            {copy.name}
          </label>
          <Input
            value={form.name}
            onChange={set('name')}
            placeholder={copy.namePlaceholder}
            className="h-11"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
            {copy.email} *
          </label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            placeholder={copy.emailPlaceholder}
            className="h-11"
          />
        </div>
      </div>

      {/* Primary goal — chips */}
      {!compact && (
        <>
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
              {copy.goal}
            </label>
            <div className="flex flex-wrap gap-2">
              {copy.goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={setChip('goal', opt.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                    form.goal === opt.value
                      ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border)/0.86)] bg-transparent text-[hsl(var(--fg-2))] hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--brand)/0.04)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* What are you improving */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
              {copy.improving}
            </label>
            <Input
              value={form.improving}
              onChange={set('improving')}
              placeholder={copy.improvingPlaceholder}
              className="h-11"
            />
          </div>

          {/* Current tools — chips */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
              {copy.currentTools}
            </label>
            <div className="flex flex-wrap gap-2">
              {copy.currentToolsOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={setChip('currentTools', opt.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                    form.currentTools === opt.value
                      ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border)/0.86)] bg-transparent text-[hsl(var(--fg-2))] hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--brand)/0.04)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interest type — chips */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
              {copy.interest}
            </label>
            <div className="flex flex-wrap gap-2">
              {copy.interestOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={setChip('interest', opt.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                    form.interest === opt.value
                      ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border)/0.86)] bg-transparent text-[hsl(var(--fg-2))] hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--brand)/0.04)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Button type="submit" disabled={loading || !form.email.trim()} className="h-12 w-full gap-2 text-[15px]">
        {loading ? '...' : copy.submit}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}

/* ─────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────── */
export default function Landing() {
  const { language: locale } = useTranslation();
  const c = COPY[locale === 'pt-BR' ? 'pt-BR' : 'en-US'];
  const formRef = useRef(null);

  useEffect(() => { trackLandingPageView(); }, []);

  const scrollToForm = () => {
    trackCtaClick({ location: 'landing_hero' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <PublicSiteShell
      navLinks={[
        { href: '#how-it-works', label: c.nav.howItWorks },
        { href: '#features', label: c.nav.features },
        { href: ROUTES.blog, label: c.nav.blog },
      ]}
      actions={
        <Button size="sm" onClick={scrollToForm}>
          {c.hero.cta1}
        </Button>
      }
    >
      <PublicMetadata
        title="atlas.core — Stop guessing. Run your body like a system."
        description="atlas.core combines nutrition, training, recovery, protocols, and progress into one self-optimization system that tells you what to do next."
        canonicalPath={ROUTES.home}
      />

      {/* ══ HERO ══════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              <motion.h1
                variants={fade}
                custom={0}
                className="atlas-display-title text-[clamp(2.6rem,1.8rem+2.8vw,4.6rem)] leading-[1.06] tracking-[-0.04em]"
              >
                {c.hero.h1}
              </motion.h1>

              <motion.p
                variants={fade}
                custom={1}
                className="atlas-public-copy max-w-lg text-[1.1rem] leading-[1.65]"
              >
                {c.hero.sub}
              </motion.p>

              <motion.div variants={fade} custom={2} className="flex flex-wrap gap-3">
                <Button size="lg" onClick={scrollToForm} className="gap-2">
                  {c.hero.cta1}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how-it-works">{c.hero.cta2}</a>
                </Button>
              </motion.div>
            </div>

            {/* Hero form — compact inline version */}
            <motion.div variants={fade} custom={2}>
              <div className="atlas-public-panel px-6 py-6" ref={formRef}>
                <h3 className="text-[1.1rem] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  {c.form.heading}
                </h3>
                <p className="mt-1 mb-5 text-[13px] text-[hsl(var(--fg-2))]">
                  {c.form.sub}
                </p>
                <EarlyAccessForm copy={c.form} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══ CORE LOOP — How it works ═════════════ */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10 text-center">
          <p className="atlas-overline justify-center">{c.loop.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
            {c.loop.h2}
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-xl">{c.loop.sub}</p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {c.loop.steps.map((step, i) => {
            const Icon = LOOP_ICONS[i];
            return (
              <motion.div key={step.title} {...fadeIn(i * 0.06)}>
                <div className="group relative h-full rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-5 py-6 transition-colors hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--fill)/0.5)]">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.07)] text-[hsl(var(--brand))]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--brand))]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-[16px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[hsl(var(--fg-2))]">
                    {step.desc}
                  </p>
                  {i < 4 && (
                    <ChevronRight className="absolute right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3)/0.4)] lg:block" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

{/* ══ WHY DIFFERENT — Value pillars ════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-8">
            <p className="atlas-overline">{c.diff.label}</p>
            <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
              {c.diff.h2}
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.diff.pillars.map((p, i) => (
              <motion.div key={p.title} {...fadeIn(i * 0.06)}>
                <div className="h-full rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.7)] px-5 py-5 transition-colors hover:bg-[hsl(var(--fill)/0.4)]">
                  <h3 className="text-[15px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.65] text-[hsl(var(--fg-2))]">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUCT PROOF ════════════════════════ */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10 text-center">
          <p className="atlas-overline justify-center">{c.proof.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
            {c.proof.h2}
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.proof.cards.map((card, i) => (
            <motion.div key={card.title} {...fadeIn(i * 0.06)}>
              <div className="group h-full rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-5 py-6 transition-all hover:border-[hsl(var(--brand)/0.25)] hover:shadow-[var(--shadow-sm)]">
                <span className="atlas-public-pill mb-4 inline-flex border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.06)] text-[hsl(var(--brand))]">
                  {card.tag}
                </span>
                <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-[hsl(var(--fg-2))]">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

{/* ══ OUTCOMES ═════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-6">
            <p className="atlas-overline">{c.outcomes.label}</p>
            <h2 className="atlas-display-title mt-4 text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
              {c.outcomes.h2}
            </h2>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.outcomes.items.map((item, i) => (
              <motion.div key={item} {...fadeIn(i * 0.05)}>
                <div className="flex items-start gap-3 rounded-[var(--atlas-control-radius)] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.7)] px-4 py-4">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]">
                    <Check className="h-3 w-3" strokeWidth={2.6} />
                  </div>
                  <p className="text-[14px] font-medium leading-[1.5] text-[hsl(var(--fg))]">
                    {item}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST / FOUNDER ══════════════════════ */}
      <section className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="text-center">
          <p className="atlas-overline justify-center">{c.trust.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
            {c.trust.h2}
          </h2>
          <p className="atlas-public-copy mx-auto mt-5 max-w-2xl text-[1rem] leading-[1.75]">
            {c.trust.text}
          </p>
        </motion.div>
      </section>

      {/* ══ CLOSING CTA + FORM ═══════════════════ */}
      <section className="mx-auto max-w-4xl px-5 pb-8 lg:px-8">
        <motion.div {...fadeIn(0)} className="atlas-page-header atlas-cta-glow px-6 py-10 text-center lg:px-10 lg:py-14">
          <h2 className="atlas-display-title text-[clamp(1.9rem,1.3rem+1.4vw,3rem)] leading-[1.1]">
            {c.cta.h2}
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-xl">{c.cta.sub}</p>

          <div className="mx-auto mt-8 max-w-md text-left">
            <EarlyAccessForm copy={c.form} compact />
          </div>

          <p className="mt-5 text-[13px] text-[hsl(var(--fg-3))]">{c.cta.fine}</p>
        </motion.div>
      </section>
    </PublicSiteShell>
  );
}
