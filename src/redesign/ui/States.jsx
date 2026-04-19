import React from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';

/**
 * Universal state surfaces — loading, empty, error, locked, offline,
 * permission-request, permission-denied, no-results. Linear-style:
 * restrained, informative, one clear next action.
 */

export function Skeleton({ className, shimmer = true }) {
  return (
    <div className={cn(
      'rounded-rd-md bg-rd-surface-2',
      shimmer && 'relative overflow-hidden',
      className,
    )}>
      {shimmer && (
        <div className="absolute inset-0 animate-rd-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)] bg-[length:200%_100%]" />
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-10 text-rd-fg-muted', className)}>
      <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-[13px]">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, secondaryAction, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-10 text-center', className)}>
      {icon && <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-rd-card bg-rd-surface-2 text-rd-fg-muted">{icon}</div>}
      {title && <h3 className="text-rd-h3 text-rd-fg">{title}</h3>}
      {description && <p className="max-w-sm text-[13px] text-rd-fg-muted">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-3 flex items-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, className }) {
  return (
    <EmptyState
      className={className}
      icon={<span>!</span>}
      title={title}
      description={description ?? 'We hit an unexpected issue. Please try again.'}
      action={onRetry && <Button onClick={onRetry} intent="primary" size="sm">Try again</Button>}
    />
  );
}

export function LockedState({ title = 'Pro feature', description, onUpgrade, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-rd-card border border-rd-premium-border bg-rd-premium-muted p-8 text-center',
      className,
    )}>
      <div className="flex h-12 w-12 items-center justify-center rounded-rd-card bg-rd-premium/15 text-rd-premium">
        <LockIcon />
      </div>
      <h3 className="text-rd-h3 text-rd-fg">{title}</h3>
      {description && <p className="max-w-sm text-[13px] text-rd-fg-muted">{description}</p>}
      {onUpgrade && <Button onClick={onUpgrade} intent="premium" size="md">Start free trial</Button>}
    </div>
  );
}

export function OfflineState({ onRetry, className }) {
  return (
    <EmptyState
      className={className}
      icon={<span>⚠</span>}
      title="You're offline"
      description="Some data may be out of date. We'll sync when you're back online."
      action={onRetry && <Button onClick={onRetry} intent="secondary" size="sm">Retry</Button>}
    />
  );
}

export function PermissionRequest({ title, description, onGrant, onDecline, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 rounded-rd-card border border-rd-border bg-rd-surface p-8 text-center',
      className,
    )}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rd-accent-muted text-rd-accent text-2xl">✨</div>
      <h3 className="text-rd-h2 text-rd-fg">{title}</h3>
      {description && <p className="max-w-sm text-[14px] text-rd-fg-secondary">{description}</p>}
      <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
        {onGrant && <Button onClick={onGrant} intent="primary" size="lg" block>Allow</Button>}
        {onDecline && <Button onClick={onDecline} intent="ghost" size="md" block>Not now</Button>}
      </div>
    </div>
  );
}

export function NoResults({ query, onClear, className }) {
  return (
    <EmptyState
      className={className}
      icon={<span>🔍</span>}
      title="No results"
      description={query ? `Nothing matched "${query}". Try a different term.` : 'Try different filters.'}
      action={onClear && <Button onClick={onClear} intent="ghost" size="sm">Clear filters</Button>}
    />
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
