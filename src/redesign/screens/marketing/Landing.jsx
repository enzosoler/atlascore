import React from 'react';
import { MarketingShell } from '../../layouts';
import { Button, Badge, Card, CardBody } from '../../ui';

export default function Landing() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 pt-20 pb-24 text-center">
          <Badge tone="accent">New · Whoop & HealthKit integrations</Badge>
          <h1 className="mt-6 text-rd-display-lg md:text-rd-display-xl text-rd-fg tracking-tight">
            Your plan,<br/>built for you.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-rd-fg-secondary">
            Training, nutrition, recovery, and labs — adapted weekly to your actual data. Nothing generic. Nothing gimmicky.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center">
            <Button intent="primary" size="xl">Start free trial</Button>
            <Button intent="ghost"   size="xl">See how it works</Button>
          </div>
          <p className="mt-3 text-[12px] text-rd-fg-muted">Cancel anytime. Plans from $4.99/mo.</p>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_50%_-10%,rgba(0,255,255,0.12),transparent)]" />
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { t: 'Training',  d: 'Progressive plans that adjust to your recovery, not a spreadsheet.' },
            { t: 'Nutrition', d: 'Transparent macro targets that update with your real trend.' },
            { t: 'Recovery',  d: 'Readiness scores from HRV, sleep, and training load.' },
            { t: 'Labs',      d: 'Clear biomarker insights — built for humans, not labs.' },
          ].map((c) => (
            <Card key={c.t}>
              <CardBody>
                <p className="text-rd-h3 text-rd-fg">{c.t}</p>
                <p className="mt-2 text-[14px] text-rd-fg-muted">{c.d}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-[1000px] px-4 md:px-6 py-16 text-center">
        <p className="text-rd-overline uppercase tracking-[0.12em] text-rd-fg-muted">Trusted by</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-rd-fg-muted">
          <span>Athletes</span><span>Coaches</span><span>Nutritionists</span><span>Clinicians</span>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[900px] px-4 md:px-6 py-16">
        <div className="rounded-rd-2xl border border-rd-accent/30 bg-gradient-to-br from-rd-accent-muted to-transparent p-8 md:p-12 text-center">
          <h2 className="text-rd-display-md text-rd-fg">Train like someone planned it.</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-rd-fg-secondary">One weekly plan. Everything in one app. Adjusted automatically.</p>
          <div className="mt-6"><Button intent="primary" size="xl">Start free trial</Button></div>
        </div>
      </section>
    </MarketingShell>
  );
}
