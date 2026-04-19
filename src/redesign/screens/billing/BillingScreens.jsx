import React, { useState } from 'react';
import { SettingsShell, DetailShell, FullScreenShell, AppShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, Badge, SectionHeader } from '../../ui';
import { PricingTable, SaveOfferCard, SubscriptionSummaryTile, TrialTimeline, PlatformBillingNotice } from '../../modules';
import { mockPlans } from '../../lib/mock-data';

export function BillingOverview() {
  return (
    <SettingsShell current="/app/billing">
      <SubscriptionSummaryTile plan="Pro — Annual" status="active" renewsAt="May 14, 2026" platform="Stripe (Web)" />
      <SectionHeader className="mt-6" title="Manage" />
      <div className="space-y-3">
        <Button intent="secondary" size="lg" block>Update payment method</Button>
        <Button intent="secondary" size="lg" block>Download invoices</Button>
        <Button intent="danger" tone="soft" size="lg" block>Cancel subscription</Button>
      </div>
      <p className="mt-4 text-[12px] text-rd-fg-muted">
        On iOS and Android, subscriptions are managed by Apple or Google. We\'ll open the right screen when you tap cancel.
      </p>
    </SettingsShell>
  );
}

export function PlanPicker() {
  const [plan, setPlan] = useState('annual');
  return (
    <DetailShell title="Choose a plan" back={() => {}} stickyFooter={[<Button intent="primary" size="lg" block key="s">Continue</Button>]}>
      <PricingTable plans={mockPlans} value={plan} onChange={setPlan} />
      <div className="mt-4"><PlatformBillingNotice platform="web" /></div>
    </DetailShell>
  );
}

export function TrialStart() {
  return (
    <FullScreenShell>
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <img src="/branding/dark/logo.svg" alt="atlas.core" width="96" height="96" className="h-24 w-24 drop-shadow-[0_0_40px_rgba(0,255,255,0.30)]" draggable={false} />
        <h1 className="mt-8 text-rd-display-md text-rd-fg">Your trial is live.</h1>
        <p className="mt-2 max-w-sm text-[15px] text-rd-fg-muted">7 days of full access. No charge today.</p>
        <Button intent="primary" size="xl" className="mt-8">Go to dashboard</Button>
      </div>
    </FullScreenShell>
  );
}

export function TrialExplain() {
  return (
    <DetailShell title="How your trial works" back={() => {}}>
      <Card><CardBody><TrialTimeline /></CardBody></Card>
      <div className="mt-4 rounded-rd-md border border-rd-border bg-rd-surface-2 p-4 text-[13px] text-rd-fg-secondary">
        Cancel anytime in Settings → Billing. On mobile, cancellations happen via your App Store subscription.
      </div>
    </DetailShell>
  );
}

export function DiscountOffer() {
  return (
    <FullScreenShell>
      <div className="flex min-h-screen flex-col justify-between p-6 rd-safe-top rd-safe-bottom">
        <div className="text-center">
          <Badge tone="premium">Only for you</Badge>
          <h1 className="mt-4 text-rd-display-md text-rd-fg">40% off annual — today only.</h1>
          <p className="mt-2 text-[15px] text-rd-fg-muted">$59.99 → <span className="text-rd-fg rd-tnum">$35.99</span></p>
        </div>
        <Button intent="premium" size="xl" block>Claim offer</Button>
      </div>
    </FullScreenShell>
  );
}

export function RestorePurchases() {
  return (
    <DetailShell title="Restore purchases" back={() => {}}>
      <Card><CardBody>
        <p className="text-[14px] text-rd-fg-secondary">
          If you\'ve purchased on another device with the same Apple ID or Google account, tap restore to reactivate.
        </p>
        <div className="mt-4"><Button intent="primary" size="md" block>Restore</Button></div>
      </CardBody></Card>
    </DetailShell>
  );
}

export function ManageSubscription() {
  return (
    <SettingsShell current="/app/billing/manage">
      <Card><CardBody>
        <p className="text-rd-h4 text-rd-fg">Manage with Apple</p>
        <p className="mt-1 text-[13px] text-rd-fg-muted">We\'ll open your iOS subscription settings — Apple handles cancels and plan changes there.</p>
        <div className="mt-4"><Button intent="primary" size="md">Open iOS settings</Button></div>
      </CardBody></Card>
    </SettingsShell>
  );
}

export function CancelFlow() {
  return (
    <FullScreenShell topChrome={<PageHeader title="Before you go" back={() => {}} />}>
      <div className="mx-auto max-w-[560px] p-6 space-y-4">
        <SaveOfferCard onAccept={() => {}} onDecline={() => {}} offer={{ percent: 50, months: 3 }} />
        <Button intent="ghost" size="md" block>No thanks, continue cancelling</Button>
      </div>
    </FullScreenShell>
  );
}

export function UpgradePrompt() {
  return (
    <DetailShell title="Go Pro" back={() => {}}>
      <Card><CardBody>
        <p className="text-rd-h3 text-rd-fg">Unlock meal plans, labs, and adaptive training.</p>
        <p className="mt-2 text-[14px] text-rd-fg-secondary">Pro members see 2.3× the progress at month 3.</p>
        <div className="mt-4"><Button intent="premium" size="lg" block>Start 7-day trial</Button></div>
      </CardBody></Card>
    </DetailShell>
  );
}

export function Checkout() {
  return (
    <DetailShell title="Checkout" back={() => {}}>
      <Card><CardBody>
        <p className="text-[14px] text-rd-fg-secondary">Redirecting to Stripe…</p>
      </CardBody></Card>
    </DetailShell>
  );
}
