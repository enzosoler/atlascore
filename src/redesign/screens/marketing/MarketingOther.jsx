import React from 'react';
import { MarketingShell } from '../../layouts';
import { AuthShell } from '../../layouts';
import { Button, Card, CardBody, Input, SectionHeader, Badge, SearchInput } from '../../ui';

export function Waitlist() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[560px] px-4 py-20 text-center">
        <Badge tone="accent">Early access</Badge>
        <h1 className="mt-4 text-rd-display-md text-rd-fg">Join the waitlist</h1>
        <p className="mt-2 text-[15px] text-rd-fg-muted">We're rolling out to new users weekly.</p>
        <form className="mt-6 flex gap-2">
          <Input size="lg" placeholder="you@email.com" className="flex-1" />
          <Button intent="primary" size="lg">Join</Button>
        </form>
      </div>
    </MarketingShell>
  );
}

export function BlogIndex() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[900px] px-4 py-16">
        <h1 className="text-rd-display-md text-rd-fg">Writing</h1>
        <p className="mt-2 text-[15px] text-rd-fg-muted">Deep dives on training, nutrition, and the science behind Atlas.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[1,2,3,4].map((i) => (
            <article key={i}>
              <div className="aspect-[16/9] rounded-rd-card border border-rd-border bg-rd-surface-2" />
              <p className="mt-3 text-[12px] uppercase tracking-[0.08em] text-rd-fg-muted">Training</p>
              <h3 className="mt-1 text-rd-h3 text-rd-fg">How we adapt your weekly plan</h3>
              <p className="mt-1 text-[13px] text-rd-fg-muted">8 min read · Apr 10</p>
            </article>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}

export function BlogPost() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-[720px] px-4 py-16">
        <p className="text-[12px] uppercase tracking-[0.08em] text-rd-fg-muted">Training</p>
        <h1 className="mt-3 text-rd-display-md text-rd-fg">How we adapt your weekly plan</h1>
        <p className="mt-3 text-[14px] text-rd-fg-muted">By Atlas Team · Apr 10, 2026 · 8 min read</p>
        <div className="mt-8 space-y-5 text-[16px] text-rd-fg-secondary leading-relaxed">
          <p>Every Sunday, we recalculate your plan using your actual data — not a generic template. Here's what changes, and why it matters.</p>
          <p>The core principle is simple: progress is a signal. When a metric moves, the plan should respond.</p>
        </div>
      </article>
    </MarketingShell>
  );
}

export function GuidesIndex() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[900px] px-4 py-16">
        <h1 className="text-rd-display-md text-rd-fg">Guides</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Getting started','Nutrition','Training','Recovery','Labs','Integrations'].map((g) => (
            <Card key={g} interactive><CardBody>
              <p className="text-rd-h4 text-rd-fg">{g}</p>
              <p className="mt-1 text-[13px] text-rd-fg-muted">12 articles</p>
            </CardBody></Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}

export function GuideDetail() { return <BlogPost />; }
export function UseCasePage() { return <BlogPost />; }

export function HelpCenter() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[720px] px-4 py-16">
        <h1 className="text-rd-display-md text-rd-fg">Help center</h1>
        <div className="mt-6"><SearchInput placeholder="Search help..." size="lg" /></div>
        <SectionHeader className="mt-8" title="Popular" />
        <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
          {['How does the trial work?','Cancel my subscription on iOS','Sync with Apple Health','Update my macro targets'].map((q) => (
            <a key={q} href="#" className="block px-4 py-3 text-[14px] text-rd-fg hover:bg-rd-surface-2">{q}</a>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}

export function Privacy() {
  return <BlogPost />;
}
export function Terms() {
  return <BlogPost />;
}

export function InviteAccept() {
  return (
    <AuthShell>
      <div>
        <Badge tone="accent">Invited</Badge>
        <h1 className="mt-4 text-rd-display-md text-rd-fg">You're in.</h1>
        <p className="mt-2 text-[14px] text-rd-fg-muted">Someone's rolling with you. Create your account to get started.</p>
        <Button intent="primary" size="xl" block className="mt-6">Create account</Button>
      </div>
    </AuthShell>
  );
}
