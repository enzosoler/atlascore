import React from 'react';
import { Card, CardBody, CardFooter, Button, Badge } from '../ui';
import { cn } from '../lib/cn';

/** Billing. Stripe on web, RevenueCat on mobile — platform-aware. */

/**
 * Plan card — Cal AI weekly-default pattern.
 * highlight: true for the plan you want chosen. Shows "MOST POPULAR" chip.
 */
export function PlanCard({ plan, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect?.(plan.id)}
      className={cn(
        'relative flex w-full items-center gap-4 rounded-rd-card border bg-rd-surface p-4 text-left transition-all duration-rd-fast',
        active
          ? 'border-rd-accent bg-rd-accent-muted shadow-rd-glow'
          : plan.highlight
            ? 'border-rd-premium-border bg-rd-premium-muted'
            : 'border-rd-border hover:border-rd-border-strong',
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-rd-premium px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rd-fg-on-premium">Most popular</span>
      )}
      {plan.badge && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-rd-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rd-fg-on-accent">{plan.badge}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-rd-h4 text-rd-fg">{plan.label}</p>
        <p className="text-[12px] text-rd-fg-muted">{plan.sub}</p>
        {plan.trial && <p className="mt-1 text-[13px] text-rd-accent">{plan.trial}</p>}
      </div>
      <div className="text-right">
        <p className="text-rd-metric-md text-rd-fg rd-tnum">{plan.price}</p>
      </div>
    </button>
  );
}

export function PricingTable({ plans, value, onChange }) {
  return (
    <div className="space-y-2.5">
      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} active={value === p.id} onSelect={onChange} />
      ))}
    </div>
  );
}

export function TrialTimeline() {
  const steps = [
    { title: 'Today',          body: 'Full access to everything. No charge.' },
    { title: 'Day 2',          body: 'We remind you — cancel easily any time.' },
    { title: 'Day 3',          body: 'Trial ends. You\'re billed only if you keep the plan.' },
  ];
  return (
    <ol className="relative space-y-6 pl-6">
      <div className="absolute left-[11px] top-1 bottom-1 w-px bg-rd-border" aria-hidden />
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-6 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rd-accent text-[11px] font-bold text-rd-fg-on-accent">{i + 1}</span>
          <p className="text-[14px] font-semibold text-rd-fg">{s.title}</p>
          <p className="text-[13px] text-rd-fg-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** Save-offer card — Blinkist pattern. Shown before cancellation. */
export function SaveOfferCard({ onAccept, onDecline, offer = { percent: 50, months: 3 } }) {
  return (
    <Card className="border-rd-premium-border bg-rd-premium-muted">
      <CardBody>
        <Badge tone="premium">Exclusive</Badge>
        <p className="mt-3 text-rd-h2 text-rd-fg">Wait — here's {offer.percent}% off for {offer.months} months.</p>
        <p className="mt-2 text-[14px] text-rd-fg-secondary">
          Atlas adapts your plan every week. Real progress takes a few cycles. Keep going at half the price.
        </p>
      </CardBody>
      <CardFooter>
        <Button intent="premium" size="md" onClick={onAccept}>Keep plan at {offer.percent}% off</Button>
        <Button intent="ghost" size="md" onClick={onDecline}>No thanks, cancel</Button>
      </CardFooter>
    </Card>
  );
}

export function SubscriptionSummaryTile({ plan, status, renewsAt, platform }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Your plan</p>
            <p className="mt-1 text-rd-h3 text-rd-fg">{plan}</p>
            <p className="mt-0.5 text-[13px] text-rd-fg-muted">
              {status === 'trialing' ? `Trial ends ${renewsAt}` : `Renews ${renewsAt}`} · via {platform}
            </p>
          </div>
          <Badge tone={status === 'active' ? 'success' : status === 'trialing' ? 'accent' : 'warning'}>{status}</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

export function PlatformBillingNotice({ platform }) {
  if (platform === 'web') {
    return (
      <div className="rounded-rd-md border border-rd-border bg-rd-surface-2 p-3 text-[13px] text-rd-fg-muted">
        Billed via Stripe. Manage your card, invoices, and subscription directly in this app.
      </div>
    );
  }
  return (
    <div className="rounded-rd-md border border-rd-border bg-rd-surface-2 p-3 text-[13px] text-rd-fg-muted">
      {platform === 'ios'
        ? 'Billed via Apple. To change or cancel, we\'ll open your iOS subscription settings.'
        : 'Billed via Google Play. To change or cancel, we\'ll open your Play subscription settings.'}
    </div>
  );
}
