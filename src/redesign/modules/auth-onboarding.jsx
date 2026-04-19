import React from 'react';
import { Card, CardBody, Button, Input, Badge, Divider, Chip, Brand } from '../ui';
import { cn } from '../lib/cn';

/** Auth + Onboarding. Duolingo warmth + Linear minimalism + Cal AI conversion. */

export function AuthPanel({ mode = 'signin', onSubmit, onSwitchMode, onMagic, onSocial, loading, error }) {
  return (
    <div>
      <Brand size="lg" />
      <h1 className="mt-8 text-rd-display-md text-rd-fg">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-[14px] text-rd-fg-muted">
        {mode === 'signup' ? 'Train smarter with a plan built for you.' : 'Pick up where you left off.'}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="mt-8 space-y-3">
        {mode === 'signup' && <Input label="Name"  name="name"  type="text" autoComplete="name" required />}
        <Input label="Email" name="email" type="email" autoComplete="email" required size="lg" />
        <Input label="Password" name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required size="lg"
               hint={mode === 'signup' ? 'At least 8 characters.' : undefined} />
        {error && <p className="text-[13px] text-rd-danger">{error}</p>}
        <Button type="submit" intent="primary" size="lg" block loading={loading}>
          {mode === 'signup' ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <Divider label="or" className="my-6" />

      <div className="space-y-2">
        <Button intent="secondary" size="lg" block onClick={onMagic}>Email me a magic link</Button>
        {onSocial && <Button intent="ghost" size="lg" block onClick={() => onSocial('apple')}> Continue with Apple</Button>}
      </div>

      <p className="mt-6 text-center text-[13px] text-rd-fg-muted">
        {mode === 'signup' ? 'Already have an account?' : "New here?"}{' '}
        <button onClick={onSwitchMode} className="text-rd-accent hover:underline">
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] text-rd-fg-muted">
        By continuing, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
    </div>
  );
}

export function WelcomeHero({ onStart, onSignIn }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-6 rd-safe-top rd-safe-bottom">
      <div className="w-full text-right">
        <button onClick={onSignIn} className="text-[13px] text-rd-fg-secondary hover:text-rd-fg">Sign in</button>
      </div>
      <div className="text-center">
        <div className="mx-auto">
          <img src="/branding/dark/logo.svg" alt="atlas.core" width="96" height="96" className="h-24 w-24 drop-shadow-[0_0_40px_rgba(0,255,255,0.25)]" draggable={false} />
        </div>
        <h1 className="mt-6 text-rd-display-lg text-rd-fg">Your plan,<br/>built for you.</h1>
        <p className="mt-3 max-w-xs mx-auto text-[15px] text-rd-fg-secondary">
          Training, nutrition, recovery, labs. All in one thoughtful plan — adapted weekly.
        </p>
      </div>
      <div className="w-full space-y-3">
        <Button intent="primary" size="xl" block onClick={onStart}>Get started</Button>
        <p className="text-center text-[12px] text-rd-fg-muted">Free trial. Cancel anytime.</p>
      </div>
    </div>
  );
}

/** Onboarding step card — tight vertical rhythm, single focus. */
export function StepCard({ title, description, children, whyAsk }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-rd-h1 text-rd-fg">{title}</h1>
      {description && <p className="mt-2 text-[14px] text-rd-fg-muted">{description}</p>}
      <div className="mt-7 flex-1">{children}</div>
      {whyAsk && (
        <details className="mt-6 group">
          <summary className="cursor-pointer select-none text-[13px] text-rd-fg-muted hover:text-rd-fg">Why we ask this</summary>
          <p className="mt-2 rounded-rd-md border border-rd-border bg-rd-surface-2 p-3 text-[13px] text-rd-fg-secondary">{whyAsk}</p>
        </details>
      )}
    </div>
  );
}

/** Goal / preference picker — large-tap cards. */
export function OptionPicker({ options, value, onChange, multi }) {
  const toggle = (v) => {
    if (multi) {
      const set = new Set(value || []);
      set.has(v) ? set.delete(v) : set.add(v);
      onChange?.(Array.from(set));
    } else onChange?.(v);
  };
  const selected = (v) => multi ? (value || []).includes(v) : value === v;
  return (
    <ul className="grid gap-2.5">
      {options.map((o) => {
        const active = selected(o.id);
        return (
          <li key={o.id}>
            <button
              onClick={() => toggle(o.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-rd-card border bg-rd-surface p-4 text-left transition-all duration-rd-fast',
                active
                  ? 'border-rd-accent bg-rd-accent-muted shadow-rd-glow'
                  : 'border-rd-border hover:border-rd-border-strong',
              )}
            >
              {o.icon && <span className="text-2xl" aria-hidden>{o.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-rd-fg">{o.label}</span>
                {o.description && <span className="block mt-0.5 text-[12px] text-rd-fg-muted">{o.description}</span>}
              </span>
              <span className={cn(
                'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                active ? 'border-rd-accent bg-rd-accent text-rd-fg-on-accent' : 'border-rd-border',
              )}>{active && '✓'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Numeric entry with stepper (e.g. age, weight, height). */
export function NumericStepper({ label, value, onChange, unit, step = 1, min, max }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-rd-fg-secondary">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <button onClick={() => onChange?.(Math.max(min ?? -Infinity, (value ?? 0) - step))} className="h-10 w-10 rounded-rd-control border border-rd-border bg-rd-surface text-rd-fg-secondary hover:bg-rd-surface-2">−</button>
        <div className="flex flex-1 items-baseline justify-center gap-2 rounded-rd-control border border-rd-border bg-rd-surface h-12">
          <span className="text-rd-metric-md text-rd-fg rd-tnum">{value ?? '—'}</span>
          <span className="text-[12px] text-rd-fg-muted">{unit}</span>
        </div>
        <button onClick={() => onChange?.(Math.min(max ?? Infinity, (value ?? 0) + step))} className="h-10 w-10 rounded-rd-control border border-rd-border bg-rd-surface text-rd-fg-secondary hover:bg-rd-surface-2">+</button>
      </div>
    </div>
  );
}

export function PersonalizedSummary({ lines }) {
  return (
    <div className="space-y-3">
      <div className="rounded-rd-card border border-rd-accent-muted bg-rd-accent-muted p-4">
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-accent">Your plan</p>
        <p className="mt-2 text-rd-h2 text-rd-fg">Built from your answers</p>
      </div>
      <ul className="divide-y divide-rd-border rounded-rd-card border border-rd-border bg-rd-surface">
        {lines.map((l) => (
          <li key={l.label} className="flex items-start gap-3 px-4 py-3">
            <span className="text-rd-accent mt-0.5">✓</span>
            <div className="flex-1">
              <p className="text-[13px] text-rd-fg-muted">{l.label}</p>
              <p className="text-[15px] font-semibold text-rd-fg rd-tnum">{l.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
