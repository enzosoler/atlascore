import React, { useState } from 'react';
import { MarketingShell } from '../../layouts';
import { Button, SegmentedControl, Card, CardBody, Badge } from '../../ui';
import { PricingTable, TrialTimeline } from '../../modules';
import { mockPlans } from '../../lib/mock-data';

export default function Pricing() {
  const [cycle, setCycle] = useState('annual');
  const [plan, setPlan] = useState('annual');
  return (
    <MarketingShell>
      <section className="mx-auto max-w-[900px] px-4 md:px-6 py-16 md:py-24 text-center">
        <h1 className="text-rd-display-md text-rd-fg">Pricing that pays for itself.</h1>
        <p className="mt-3 text-[16px] text-rd-fg-secondary max-w-xl mx-auto">
          One plan. Everything included. Cancel from within the app any time.
        </p>
        <div className="mt-6 inline-flex justify-center">
          <SegmentedControl
            value={cycle}
            onChange={setCycle}
            options={[{ value: 'weekly', label: 'Weekly' }, { value: 'annual', label: 'Annual — save 40%' }]}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[560px] px-4 md:px-6 pb-16">
        <PricingTable plans={mockPlans} value={plan} onChange={setPlan} />
        <Button intent="primary" size="xl" block className="mt-4">Start 7-day free trial</Button>
        <p className="mt-3 text-center text-[12px] text-rd-fg-muted">
          Payment via Stripe on web. On iOS and Android, billing uses Apple / Google and may differ.
        </p>
      </section>

      <section className="mx-auto max-w-[900px] px-4 md:px-6 py-12">
        <h2 className="text-rd-h2 text-rd-fg">How the trial works</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card><CardBody><TrialTimeline /></CardBody></Card>
          <Card>
            <CardBody>
              <p className="text-rd-h4 text-rd-fg">Included in every plan</p>
              <ul className="mt-3 space-y-2 text-[14px] text-rd-fg-secondary">
                {['Adaptive training plans','Nutrition logging + AI scan','Recovery + readiness','Labs interpretation','Coach chat','HealthKit + integrations','Priority support'].map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}
