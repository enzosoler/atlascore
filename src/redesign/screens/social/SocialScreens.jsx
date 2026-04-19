import React from 'react';
import { AppShell, DetailShell, FullScreenShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, SectionHeader, Badge } from '../../ui';
import { ShareCardPreview, ReferralStatsCard, CreatorCodeEntry } from '../../modules';

export function SocialHome() {
  return (
    <AppShell current="social" topBar={<PageHeader title="Social" />}>
      <SectionHeader title="Your milestones" description="Ready to share" />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: '23-day streak',   stats: [{ label: 'Streak', value: '23' }, { label: 'Workouts', value: '14' }, { label: 'Weight change', value: '-1.2 kg' }] },
          { title: 'New PR 📈',       stats: [{ label: 'Lift', value: 'Bench' }, { label: 'Best', value: '92.5' }, { label: 'vs last', value: '+2.5 kg' }] },
        ].map((c) => <ShareCardPreview key={c.title} title={c.title} stats={c.stats} />)}
      </div>
      <SectionHeader className="mt-8" title="Invite friends" />
      <ReferralStatsCard invites={4} joined={2} earnings={20} />
      <div className="mt-4"><Button intent="primary" size="lg" block>Copy invite link</Button></div>
    </AppShell>
  );
}

export function ShareComposer() {
  return (
    <FullScreenShell topChrome={<PageHeader title="Share" back={() => {}} />}>
      <div className="mx-auto max-w-[420px] p-6 space-y-4">
        <ShareCardPreview title="23-day streak" stats={[
          { label: 'Streak', value: '23' }, { label: 'Workouts', value: '14' }, { label: 'Weight change', value: '-1.2 kg' },
        ]} />
        <div className="grid grid-cols-2 gap-2">
          <Button intent="primary" size="lg" block>Share</Button>
          <Button intent="secondary" size="lg" block>Download</Button>
        </div>
      </div>
    </FullScreenShell>
  );
}

export function CreatorDashboard() {
  return (
    <AppShell current="social" topBar={<PageHeader title="Creator" />}>
      <Card><CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Your code</p>
            <p className="mt-1 text-rd-metric-lg text-rd-fg rd-tnum">ENZO10</p>
          </div>
          <Badge tone="premium">Active</Badge>
        </div>
        <p className="mt-2 text-[13px] text-rd-fg-muted">Gives users 10% off. You earn $2 per paid month.</p>
      </CardBody></Card>
      <SectionHeader className="mt-6" title="Performance" />
      <div className="grid gap-3 md:grid-cols-3">
        {[['Clicks','1,204'],['Signups','89'],['Active subs','42']].map(([l, v]) => (
          <Card key={l}><CardBody>
            <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{l}</p>
            <p className="mt-1 text-rd-metric-md text-rd-fg rd-tnum">{v}</p>
          </CardBody></Card>
        ))}
      </div>
    </AppShell>
  );
}

export function CreatorCode() {
  return (
    <DetailShell title="Apply creator code" back={() => {}}>
      <Card><CardBody>
        <p className="text-[13px] text-rd-fg-muted">Enter a code from a creator to unlock their perk.</p>
        <div className="mt-4"><CreatorCodeEntry code="HUBERMAN" onApply={() => {}} valid /></div>
      </CardBody></Card>
    </DetailShell>
  );
}

export function Referrals() {
  return (
    <DetailShell title="Referrals" back={() => {}}>
      <ReferralStatsCard invites={12} joined={4} earnings={32} />
      <div className="mt-4"><Button intent="primary" size="lg" block>Share your link</Button></div>
    </DetailShell>
  );
}
