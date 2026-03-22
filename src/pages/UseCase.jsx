import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import PublicSiteShell, {
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const USE_CASES = {
  athlete: {
    eyebrow: 'Athlete',
    title: 'For athletes and serious lifters who want real history.',
    heroSubtitle: 'Training, nutrition, progress, and decision context in one connected system.',
    features: [
      {
        icon: Target,
        title: 'Detailed tracking',
        description: 'Log training, nutrition, and progress without scattering data across different tools.',
      },
      {
        icon: TrendingUp,
        title: 'Trend visibility',
        description: 'See how body weight, strength, adherence, and routine evolve over time.',
      },
      {
        icon: BarChart3,
        title: 'Context for adjustment',
        description: 'Understand what is working and where execution drifts away from the plan.',
      },
    ],
    benefits: [
      'Photos, measurements, and history in one place',
      'Atlas AI grounded in your real usage',
      'Plan versus execution, visible every day',
      'Exports you can save or share',
    ],
    cta: 'Create athlete account',
  },
  coach: {
    eyebrow: 'Coach',
    title: 'For coaches who need adherence visibility without relying on screenshots.',
    heroSubtitle: 'Prescribe, track, and interpret athlete execution from a shared history.',
    features: [
      {
        icon: Users,
        title: 'Athlete overview',
        description: 'Centralize progress, adherence, and context for every athlete in one place.',
      },
      {
        icon: Target,
        title: 'Clear prescription',
        description: 'Turn the plan into an executable routine with direct plan-versus-actual comparison.',
      },
      {
        icon: BarChart3,
        title: 'Practical insight',
        description: 'Spot who is stalling, where execution drops, and what needs adjustment.',
      },
    ],
    benefits: [
      'Professional dashboard for multiple athletes',
      'Real-time adherence monitoring',
      'Training, nutrition, and check-ins in one workflow',
      'Exportable summaries for follow-up',
    ],
    cta: 'Start as a coach',
  },
  nutritionist: {
    eyebrow: 'Nutritionist',
    title: 'For nutritionists who need context beyond the meal plan.',
    heroSubtitle: 'Prescribed nutrition, real meals, body metrics, and progress in one shared story.',
    features: [
      {
        icon: UtensilsCrossed,
        title: 'Plan and intake side by side',
        description: 'Compare what was planned with what was actually eaten and understand adherence clearly.',
      },
      {
        icon: BarChart3,
        title: 'Reliable history',
        description: 'Review meals, progress, consistency, and gaps with less noise.',
      },
      {
        icon: TrendingUp,
        title: 'Evidence-based adjustment',
        description: 'Refine the plan using real execution data and client progress.',
      },
    ],
    benefits: [
      'Clients and prescriptions in one workspace',
      'Body metrics and progress tracking',
      'Nutrition reports with richer context',
      'AI-assisted meal-plan generation when needed',
    ],
    cta: 'Start as a nutritionist',
  },
  clinician: {
    eyebrow: 'Clinician',
    title: 'For clinicians who need an integrated patient view.',
    heroSubtitle: 'Labs, protocols, measurements, and routine logged in a continuous, shareable record.',
    features: [
      {
        icon: BarChart3,
        title: 'Consolidated history',
        description: 'Track labs, biometrics, and lifestyle signals without fragmentation.',
      },
      {
        icon: Target,
        title: 'Protocols with context',
        description: 'Connect clinical decisions to real patient behavior over time.',
      },
      {
        icon: Users,
        title: 'Continuous follow-up',
        description: 'Use one shared foundation to monitor adherence, progress, and next adjustments.',
      },
    ],
    benefits: [
      'Clinical view with continuous history',
      'Protocols and logs in one place',
      'Body metrics connected to progress',
      'Consolidated reports for follow-up',
    ],
    cta: 'Start as a clinician',
  },
};

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="atlas-card h-full px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>
      <p className="mt-5 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">
        {feature.title}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{feature.description}</p>
    </article>
  );
}

export default function UseCase() {
  const { role } = useParams();
  const navigate = useNavigate();
  const caseData = USE_CASES[role];

  if (!caseData) {
    return (
      <PublicSiteShell
        compactNav
      >
        <section className="mx-auto max-w-4xl px-5 pb-6 pt-16 lg:px-8">
          <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
            <p className="atlas-overline justify-center">Use Case</p>
            <h1 className="atlas-display-title mt-4">Use case not found.</h1>
            <p className="atlas-public-copy mx-auto mt-4 max-w-xl">
              This scenario is not available in the public version of <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core yet.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild>
                <Link to={ROUTES.home}>Back to home</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicSiteShell>
    );
  }

  return (
    <PublicSiteShell
      compactNav
      actions={(
        <>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to={ROUTES.help}>Help</Link>
          </Button>
          <Button asChild>
            <Link to={`${ROUTES.auth}?mode=signup`}>Create account</Link>
          </Button>
        </>
      )}
    >
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12 lg:px-8 lg:pt-16">
        <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="atlas-overline transition-colors hover:text-[hsl(var(--fg-2))]"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back
          </button>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="atlas-overline">{caseData.eyebrow}</p>
              <h1 className="atlas-display-title mt-4 text-[clamp(2.5rem,2rem+1.6vw,4.15rem)]">
                {caseData.title}
              </h1>
              <p className="atlas-public-copy mt-4 max-w-2xl">{caseData.heroSubtitle}</p>
            </div>

            <div className="atlas-public-panel-muted p-4">
              <p className="atlas-metric-label">Why <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                The value is not just in logging. It is in turning everything into a timeline you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <PublicSectionHeader
            eyebrow="Capabilities"
            title="What changes in this scenario."
            description="Each role uses the same product, but with views and actions tailored to the job."
            className="mb-10"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {caseData.features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <PublicSectionHeader
            eyebrow="Benefits"
            title="Practical benefits."
            description="What the product unlocks when data stops living in different places."
          />

          <div className="atlas-public-panel-muted p-5 lg:p-6">
            <div className="space-y-3">
              {caseData.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
                    <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
          <p className="atlas-overline justify-center">Get started</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(2.2rem,1.9rem+1.3vw,3.3rem)]">
            {caseData.cta}
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            Enter <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core and continue inside the same visual system without switching context between marketing and product.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={`${ROUTES.auth}?mode=signup`}>
                {caseData.cta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
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
