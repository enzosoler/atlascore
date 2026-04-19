import React, { useState } from 'react';
import { OnboardingShell } from '../../layouts';
import { Button, Badge } from '../../ui';
import { PricingTable, TrialTimeline, PlatformBillingNotice } from '../../modules';
import { mockPlans } from '../../lib/mock-data';

/** Post-onboarding paywall — Cal AI-style trial gate. */
export default function OnboardingPaywall() {
  const [plan, setPlan] = useState('annual');
  return (
    <OnboardingShell
      step={10}
      total={10}
      footer={
        <>
          <Button intent="primary" size="xl" block>Start 7-day free trial</Button>
          <p className="mt-2 text-center text-[12px] text-rd-fg-muted">We\'ll remind you 2 days before it ends.</p>
        </>
      }
    >
      <div className="text-center">
        <Badge tone="accent">Limited — full access during trial</Badge>
        <h1 className="mt-4 text-rd-display-md text-rd-fg">Try everything free for 7 days.</h1>
        <p className="mt-2 text-[15px] text-rd-fg-muted">No charge today. Cancel in two taps.</p>
      </div>

      <div className="mt-8">
        <PricingTable plans={mockPlans} value={plan} onChange={setPlan} />
      </div>

      <div className="mt-6 rounded-rd-card border border-rd-border bg-rd-surface p-4">
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Included</p>
        <ul className="mt-2 space-y-1.5 text-[14px] text-rd-fg-secondary">
          {['Adaptive weekly plans','AI coach','Nutrition logging + photo scan','Recovery & HealthKit','Labs interpretation','Priority support'].map((f) => (
            <li key={f}>· {f}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted mb-3">How the trial works</p>
        <TrialTimeline />
      </div>

      <div className="mt-6">
        <PlatformBillingNotice platform="web" />
      </div>
    </OnboardingShell>
  );
}
