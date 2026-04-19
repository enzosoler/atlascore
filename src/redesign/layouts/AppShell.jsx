import React from 'react';
import { cn } from '../lib/cn';
import { BottomNav, Sidebar } from './nav';
import { Brand } from '../ui/Brand';

/**
 * AppShell — primary authenticated surface.
 * Mobile: stacked with bottom nav.
 * Desktop (>= md): sidebar + content.
 */
export function AppShell({ current, children, topBar, aside, wide = false }) {
  return (
    <div className="rd-scope rd-canvas min-h-screen text-rd-fg">
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar current={current} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {topBar}
          <main className={cn('flex-1 min-w-0', !wide && 'mx-auto w-full max-w-[1200px]', 'px-4 md:px-6 pb-24 md:pb-10 pt-4')}>
            {children}
          </main>
        </div>
        {aside && <aside className="hidden lg:block w-[320px] shrink-0 border-l border-rd-border">{aside}</aside>}
      </div>
      <div className="md:hidden"><BottomNav current={current} /></div>
    </div>
  );
}

export function AuthShell({ children, hero }) {
  return (
    <div className="rd-scope rd-canvas min-h-screen text-rd-fg">
      <div className="mx-auto flex min-h-screen max-w-[1000px] flex-col items-stretch px-4 md:grid md:grid-cols-2 md:items-center md:gap-10 md:px-8">
        <div className="order-2 flex items-center md:order-1">
          <div className="w-full max-w-md mx-auto py-8">{children}</div>
        </div>
        <div className="order-1 hidden md:order-2 md:flex md:items-center">
          {hero ?? (
            <div className="aspect-square w-full rounded-rd-2xl border border-rd-border bg-gradient-to-br from-rd-accent-muted via-transparent to-rd-ai-muted" />
          )}
        </div>
      </div>
    </div>
  );
}

export function OnboardingShell({ step, total, onBack, children, footer }) {
  const pct = total ? Math.round((step / total) * 100) : 0;
  return (
    <div className="rd-scope rd-canvas flex min-h-screen flex-col text-rd-fg">
      <header className="flex items-center gap-3 border-b border-rd-border px-4 h-rd-top-bar rd-safe-top">
        {onBack ? (
          <button onClick={onBack} aria-label="Back" className="h-10 w-10 rounded-rd-control text-rd-fg-secondary hover:bg-rd-surface-2">←</button>
        ) : <span className="h-10 w-10" />}
        <div className="flex-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-rd-surface-2">
            <div className="h-full rounded-full bg-rd-accent transition-[width] duration-rd-slow ease-rd-out" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="rd-tnum text-[12px] text-rd-fg-muted w-10 text-right">{step}/{total}</span>
      </header>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 py-6 md:py-10">
        {children}
      </main>
      {footer && (
        <div className="border-t border-rd-border bg-rd-bg/90 p-4 backdrop-blur rd-safe-bottom">
          <div className="mx-auto max-w-[560px]">{footer}</div>
        </div>
      )}
    </div>
  );
}

export function MarketingShell({ children, header, footer }) {
  return (
    <div className="rd-scope rd-canvas min-h-screen text-rd-fg">
      {header ?? <MarketingHeader />}
      <main>{children}</main>
      {footer ?? <MarketingFooter />}
    </div>
  );
}

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-[50] border-b border-rd-border bg-rd-bg/80 backdrop-blur">
      <div className="mx-auto flex h-rd-top-bar max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Brand href="/" size="md" />
        <nav className="hidden items-center gap-6 text-[13px] md:flex">
          <a href="/pricing" className="text-rd-fg-secondary hover:text-rd-fg">Pricing</a>
          <a href="/guides"  className="text-rd-fg-secondary hover:text-rd-fg">Guides</a>
          <a href="/help"    className="text-rd-fg-secondary hover:text-rd-fg">Help</a>
          <a href="/auth"    className="text-rd-fg-secondary hover:text-rd-fg">Sign in</a>
          <a href="/auth/signup" className="inline-flex h-9 items-center rounded-rd-control bg-rd-accent px-4 text-[13px] font-medium text-rd-fg-on-accent hover:bg-rd-accent-hover">Get started</a>
        </nav>
      </div>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-rd-border mt-20">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 text-[13px] md:grid-cols-4 md:px-6">
        <div>
          <Brand size="sm" />
          <p className="mt-3 text-rd-fg-muted max-w-xs">Training, nutrition, recovery, labs — one clear plan.</p>
        </div>
        <FooterCol title="Product" links={[['Pricing','/pricing'],['Guides','/guides'],['Help','/help']]} />
        <FooterCol title="Company" links={[['Blog','/blog'],['Careers','#'],['Contact','#']]} />
        <FooterCol title="Legal"   links={[['Privacy','/privacy'],['Terms','/terms']]} />
      </div>
      <p className="border-t border-rd-border py-4 text-center text-[12px] text-rd-fg-muted">© 2026 atlas.core</p>
    </footer>
  );
}
function FooterCol({ title, links }) {
  return (
    <div>
      <p className="text-rd-fg font-semibold">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(([l, h]) => <li key={l}><a className="text-rd-fg-muted hover:text-rd-fg" href={h}>{l}</a></li>)}
      </ul>
    </div>
  );
}

export function DetailShell({ title, back, actions, children, stickyFooter }) {
  return (
    <div className="rd-scope rd-canvas min-h-screen text-rd-fg">
      <header className="flex items-center justify-between border-b border-rd-border px-4 md:px-6 h-rd-top-bar rd-safe-top bg-rd-bg/80 backdrop-blur sticky top-0 z-[50]">
        <div className="flex items-center gap-3 min-w-0">
          {back && <button onClick={back} aria-label="Back" className="h-10 w-10 rounded-rd-control text-rd-fg-secondary hover:bg-rd-surface-2">←</button>}
          <h1 className="text-rd-h3 text-rd-fg truncate">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <main className="mx-auto w-full max-w-[720px] px-4 md:px-6 py-6 pb-32">{children}</main>
      {stickyFooter && (
        <div className="sticky bottom-0 z-[20] border-t border-rd-border bg-rd-bg/90 px-4 py-3 backdrop-blur rd-safe-bottom">
          <div className="mx-auto flex max-w-[720px] gap-2">{stickyFooter}</div>
        </div>
      )}
    </div>
  );
}

export function SettingsShell({ current, children }) {
  return (
    <AppShell current={current} wide>
      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="flex flex-col gap-0.5">
          {[
            ['Account','/app/settings/account'],
            ['Notifications','/app/settings/notifications'],
            ['Appearance','/app/settings/appearance'],
            ['Integrations','/app/settings/integrations'],
            ['Language','/app/settings/language'],
            ['Privacy','/app/settings/privacy'],
            ['Data','/app/settings/data'],
            ['Billing','/app/billing'],
            ['Danger zone','/app/settings/danger'],
          ].map(([label, href]) => (
            <a key={href} href={href} className={cn(
              'rounded-rd-md px-3 py-2 text-[13px] text-rd-fg-secondary hover:bg-rd-surface-2 hover:text-rd-fg',
              current === href && 'bg-rd-surface-2 text-rd-fg',
            )}>{label}</a>
          ))}
        </nav>
        <section className="min-w-0">{children}</section>
      </div>
    </AppShell>
  );
}

export function AdminShell({ current, children }) {
  return (
    <div className="rd-scope rd-canvas min-h-screen text-rd-fg">
      <aside className="fixed inset-y-0 left-0 w-[220px] border-r border-rd-border bg-rd-surface hidden md:block">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <img src="/branding/dark/logo.svg" alt="" width="20" height="20" className="h-5 w-5" />
            <span className="text-rd-h4 text-rd-fg">atlas<span className="text-rd-accent">.</span>core</span>
            <span className="ml-1 text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">Admin</span>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 p-2 text-[13px]">
          {[['Overview','/admin'],['Users','/admin/users'],['Subscriptions','/admin/subscriptions'],['Audit','/admin/audit'],['Feature flags','/admin/flags'],['Analytics','/admin/analytics'],['Settings','/admin/settings']]
            .map(([l, h]) => (
              <a key={h} href={h} className={cn(
                'rounded-rd-md px-3 py-2 text-rd-fg-secondary hover:bg-rd-surface-2 hover:text-rd-fg',
                current === h && 'bg-rd-surface-2 text-rd-fg',
              )}>{l}</a>
            ))}
        </nav>
      </aside>
      <main className="md:pl-[220px]">
        <div className="mx-auto max-w-[1400px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

export function FullScreenShell({ children, topChrome }) {
  return (
    <div className="rd-scope rd-canvas min-h-screen text-rd-fg">
      {topChrome}
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
