import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Dumbbell, Sparkles, Target } from 'lucide-react';
import GuideCard from '@/components/content/GuideCard';
import PublicSiteShell, { PublicSectionHeader } from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const START_GUIDES = [
  {
    title: 'Getting Started',
    excerpt: 'Create your account, complete onboarding, and understand how Atlas Core organizes your routine from day one.',
    readingTime: 5,
    icon: BookOpen,
    href: '/guides/getting-started',
    category: 'Onboarding',
  },
];

const TRACKING_GUIDES = [
  {
    title: 'Workout Logging',
    excerpt: 'How to log exercises, sets, reps, load, and progression with precision.',
    readingTime: 8,
    icon: Dumbbell,
    href: '/guides/workout-logging',
    category: 'Training',
  },
  {
    title: 'Plan vs Execution',
    excerpt: 'Understand adherence clearly: what was prescribed, what was done, and what to adjust.',
    readingTime: 7,
    icon: Target,
    href: '/guides/plan-vs-execution',
    category: 'Analysis',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How much does Atlas Core cost?',
    a: 'There is a free plan to get started, plus paid tiers for richer insights, exports, reports, and professional workflows. The full comparison lives on the pricing page.',
  },
  {
    q: 'Does the product work on mobile?',
    a: 'Yes. The core experiences are designed for both desktop and mobile without losing the same visual language or navigational clarity.',
  },
  {
    q: 'Can I share data with a coach or nutritionist?',
    a: 'Yes. Atlas Core is designed to keep the same history accessible to both athletes and professionals, without relying on scattered screenshots.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Paid plans expand exports and reporting while preserving the logic of one connected system for tracking progress.',
  },
];

export default function HelpCenter() {
  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.blog, label: 'Blog' },
        { href: '#guides', label: 'Guides' },
        { href: '#faq', label: 'FAQ' },
      ]}
      actions={(
        <>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to={ROUTES.pricing}>Pricing</Link>
          </Button>
          <Button asChild>
            <Link to={`${ROUTES.auth}?mode=signup`}>Create account</Link>
          </Button>
        </>
      )}
    >
      <PublicMetadata
        title="Help Center — Atlas Core"
        description="Public guides and FAQs for learning Atlas Core, from onboarding to training and adherence workflows."
        canonicalPath={ROUTES.help}
      />

      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12 lg:px-8 lg:pt-16">
        <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <span className="atlas-public-pill">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
            Help Center
          </span>
          <h1 className="atlas-display-title mt-5 max-w-4xl text-[clamp(2.6rem,2rem+1.6vw,4rem)]">
            Straightforward guides to join, log, and track with clarity.
          </h1>
          <p className="atlas-public-copy mt-4 max-w-2xl">
            Practical content for opening your account, logging training, and understanding adherence without guessing the next step.
          </p>
        </div>
      </section>

      <section id="guides" className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <div className="space-y-10">
            <div className="space-y-6">
              <PublicSectionHeader
                eyebrow="Start Here"
                title="Open your account and understand the product foundation."
                description="The essentials for getting from zero to your first meaningful use."
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {START_GUIDES.map((guide) => (
                  <GuideCard key={guide.title} {...guide} />
                ))}
              </div>
            </div>

            <div className="space-y-6 border-t border-[hsl(var(--border)/0.76)] pt-8">
              <PublicSectionHeader
                eyebrow="Tracking"
                title="Log execution and read adherence clearly."
                description="These guides cover the core of daily use for training and analysis."
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {TRACKING_GUIDES.map((guide) => (
                  <GuideCard key={guide.title} {...guide} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <PublicSectionHeader
          eyebrow="FAQ"
          title="Quick questions before you jump in."
          description="Direct answers to the most common questions from public visitors."
          align="center"
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="atlas-card p-5 lg:p-6">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{item.q}</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
          <p className="atlas-overline justify-center">Next step</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(2.2rem,1.9rem+1.4vw,3.3rem)]">
            Explore the product with context.
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            If you want to review pricing or open your account now, you can jump straight into the product and continue from here with context.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={`${ROUTES.auth}?mode=signup`}>Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>View pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
