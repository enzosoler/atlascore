import React from 'react';
import { MarketingShell } from './layouts';
import { Card, CardBody, Badge, Button, Brand } from './ui';

/**
 * Redesign gallery — hub page that links to every previewable screen.
 * Lives at /v2. Public, no auth required, so you can share the URL.
 */
const SCREENS = [
  { path: '/v2/today',           title: 'Today',            tag: 'app',         ref: 'Whoop + Apple Fitness + Strava' },
  { path: '/v2/nutrition',       title: 'Nutrition',        tag: 'app',         ref: 'MyFitnessPal + MacroFactor + Cal AI' },
  { path: '/v2/workouts',        title: 'Workouts',         tag: 'app',         ref: 'Fitbod + Hevy' },
  { path: '/v2/workouts/active', title: 'Active workout',   tag: 'app',         ref: 'Hevy — set logger + rest timer + plate calc' },
  { path: '/v2/body',            title: 'Body + progress',  tag: 'app',         ref: 'Happy Scale + MacroFactor' },
  { path: '/v2/coach',           title: 'Coach chat',       tag: 'app',         ref: 'ChatGPT + Whoop/Oura insights' },
  { path: '/v2/welcome',         title: 'Welcome',          tag: 'onboarding',  ref: 'Duolingo' },
  { path: '/v2/onboarding',      title: 'Onboarding (10 steps)', tag: 'onboarding', ref: 'Cal AI + Noom' },
  { path: '/v2/paywall',         title: 'Post-onboard paywall', tag: 'billing', ref: 'Cal AI trial gate' },
  { path: '/v2/auth',            title: 'Auth',             tag: 'auth',        ref: 'Linear' },
  { path: '/v2/landing',         title: 'Landing page',     tag: 'marketing',   ref: 'Linear' },
  { path: '/v2/pricing',         title: 'Pricing',          tag: 'marketing',   ref: 'Linear + Superhuman' },
];

const TAG_TONE = {
  app: 'accent',
  onboarding: 'ai',
  billing: 'premium',
  auth: 'neutral',
  marketing: 'neutral',
};

export default function RedesignGallery() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-[1000px] px-4 md:px-6 pt-16 pb-8">
        <div className="mb-8"><Brand size="xl" /></div>
        <Badge tone="accent">Redesign preview · v2</Badge>
        <h1 className="mt-5 text-rd-display-md text-rd-fg">The redesigned atlas<span className="text-rd-accent">.</span>core.</h1>
        <p className="mt-3 max-w-xl text-[15px] text-rd-fg-secondary">
          Dark &amp; premium. Obsidian base, cyan accent, reference-driven across every domain.
          Click any screen below to open it live. None of these routes affect your existing app.
        </p>
        <p className="mt-2 text-[12px] text-rd-fg-muted">
          Source lives at <code className="text-rd-fg-secondary">src/redesign/</code>. Wired at <code className="text-rd-fg-secondary">/v2/*</code>. Your old routes are untouched.
        </p>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 md:px-6 pb-20">
        <div className="grid gap-3 md:grid-cols-2">
          {SCREENS.map((s) => (
            <a key={s.path} href={s.path} className="block">
              <Card interactive>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-rd-h3 text-rd-fg">{s.title}</p>
                      <p className="mt-1 text-[12px] text-rd-fg-muted">{s.ref}</p>
                    </div>
                    <Badge tone={TAG_TONE[s.tag] || 'neutral'} size="xs">{s.tag}</Badge>
                  </div>
                  <p className="mt-3 text-[11px] text-rd-fg-muted font-mono">{s.path}</p>
                </CardBody>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
