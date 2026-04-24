import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Shield,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DataState -- unified system state component for Atlas Core.
 *
 * Handles: loading, empty, error, offline, permission, success, neutral.
 *
 * Pattern (Linear / Things 3 / Duolingo):
 *   Eyebrow (optional context)
 *   State title
 *   Short explanation
 *   Primary CTA
 *   Optional secondary CTA
 *   Optional note/meta
 *
 * Usage:
 *   <DataState
 *     variant="empty"
 *     icon={Scale}
 *     title="No measurements yet"
 *     description="Add your first weight entry to start tracking progress."
 *     action={{ label: "Add measurement", onClick: fn }}
 *     secondaryAction={{ label: "Learn more", onClick: fn }}
 *     meta="Last checked 2 minutes ago"
 *   />
 */

const VARIANT_CONFIG = {
  loading: {
    defaultIcon: Loader2,
    shellClass: 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.18)]',
    iconBgClass: 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
    spin: true,
  },
  empty: {
    defaultIcon: Info,
    shellClass: 'border-dashed border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.12)]',
    iconBgClass: 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] text-[hsl(var(--fg-3))]',
  },
  error: {
    defaultIcon: AlertTriangle,
    shellClass: 'border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.04)]',
    iconBgClass: 'border-[hsl(var(--err)/0.2)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--err))]',
  },
  offline: {
    defaultIcon: WifiOff,
    shellClass: 'border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.04)]',
    iconBgClass: 'border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--warn))]',
  },
  permission: {
    defaultIcon: Shield,
    shellClass: 'border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.04)]',
    iconBgClass: 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--brand))]',
  },
  success: {
    defaultIcon: CheckCircle2,
    shellClass: 'border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.04)]',
    iconBgClass: 'border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--ok))]',
  },
  neutral: {
    defaultIcon: Info,
    shellClass: 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.18)]',
    iconBgClass: 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
  },
};

export function DataState(props) {
  const {
    variant: variantProp = 'neutral',
    icon,
    title,
    description,
    eyebrow,
    meta,
    action,
    secondaryAction,
    note,
    className,

    // ── Legacy prop bridge (StablePage compat) ──────────────────────────────
    // The older StablePage DataState passed `primaryAction` / `secondaryAction`
    // as ReactNode elements and `customIcon` as a component. We detect and
    // forward them so every existing call-site keeps working without edits.
    primaryAction: legacyPrimaryAction,
    customIcon,
    centered: legacyCentered,

    // ── Boolean-flag legacy API (old DataState.jsx file) ─────────────────────
    loading,
    empty,
    error,
    offline,
    subtitle: legacySubtitle,
    retryLabel,
  } = props;
  // ── Resolve legacy boolean API → variant string ───────────────────────────
  let resolvedVariant = variantProp;
  if (loading) resolvedVariant = 'loading';
  else if (error === 'partial') resolvedVariant = 'error';
  else if (error) resolvedVariant = 'error';
  else if (offline) resolvedVariant = 'offline';
  else if (empty) resolvedVariant = 'empty';

  // If called with boolean flags, map title/subtitle/action accordingly
  const resolvedTitle = title ?? (loading ? 'Loading...' : undefined);
  const resolvedDescription = description ?? legacySubtitle;

  // The `action` prop is an object `{ label, onClick }` in the new API,
  // but a plain function in the old boolean-flag API. Detect which form.
  const isNewActionAPI = action && typeof action === 'object' && action.label;
  const isLegacyActionFn = typeof action === 'function';

  // The `secondaryAction` prop is an object `{ label, onClick }` in the new API,
  // or a ReactNode in the StablePage compat API (`primaryAction` / `secondaryAction` as JSX).
  const isNewSecondaryAPI = secondaryAction && typeof secondaryAction === 'object' && secondaryAction.label;
  // When secondaryAction is a ReactNode (not an object with .label), it's legacy StablePage
  const isLegacySecondaryNode = secondaryAction && !isNewSecondaryAPI && React.isValidElement(secondaryAction);

  const config = VARIANT_CONFIG[resolvedVariant] || VARIANT_CONFIG.neutral;
  const Icon = icon || customIcon || config.defaultIcon;
  const isCentered = legacyCentered !== undefined ? legacyCentered : true;

  // ── Build action buttons ──────────────────────────────────────────────────
  const renderPrimary = () => {
    // New object API  { label, onClick }
    if (isNewActionAPI) {
      return (
        <button
          type="button"
          onClick={action.onClick}
          className="atlas-button atlas-button-primary w-full"
        >
          {action.label}
        </button>
      );
    }
    // Legacy ReactNode (StablePage compat -- `primaryAction` prop)
    if (legacyPrimaryAction) return <div>{legacyPrimaryAction}</div>;
    // Legacy boolean-flag onClick (old DataState.jsx)
    if (isLegacyActionFn) {
      return (
        <button
          type="button"
          onClick={action}
          className="atlas-button atlas-button-primary w-full"
        >
          {retryLabel || (resolvedVariant === 'error' ? 'Retry' : 'Get started')}
        </button>
      );
    }
    return null;
  };

  const renderSecondary = () => {
    // New object API  { label, onClick }
    if (isNewSecondaryAPI) {
      return (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
        >
          {secondaryAction.label}
        </button>
      );
    }
    // Legacy ReactNode (StablePage compat)
    if (isLegacySecondaryNode) return <div>{secondaryAction}</div>;
    return null;
  };

  const primary = renderPrimary();
  const secondary = renderSecondary();

  return (
    <div
      className={cn(
        'rounded-[18px] border px-5 py-6 shadow-[var(--shadow-xs)]',
        config.shellClass,
        isCentered && 'text-center',
        className,
      )}
    >
      {/* Eyebrow + Meta row */}
      {(eyebrow || meta) && (
        <div className={cn('mb-4 flex items-center justify-between gap-3', isCentered && 'justify-center')}>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
              {eyebrow}
            </p>
          ) : <span />}
          {meta ? (
            <span className="rounded-full bg-[hsl(var(--card)/0.8)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">
              {meta}
            </span>
          ) : null}
        </div>
      )}

      {/* Body: icon + text + actions */}
      <div className={cn('flex items-start gap-3.5', isCentered && 'flex-col items-center')}>
        {/* Icon circle — 48px (h-12 w-12) */}
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border shadow-[var(--shadow-xs)]',
            config.iconBgClass,
          )}
        >
          <Icon
            className={cn('h-5 w-5', config.spin && 'animate-spin')}
            strokeWidth={2}
          />
        </div>

        <div className={cn('min-w-0 flex-1', isCentered && 'flex flex-col items-center')}>
          {/* Title — 18px semibold */}
          {resolvedTitle && (
            <p className="text-[18px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {resolvedTitle}
            </p>
          )}

          {/* Description — 14px secondary, max-width 320px */}
          {resolvedDescription && (
            <p className={cn(
              'mt-1.5 text-[14px] leading-6 text-[hsl(var(--fg-2))]',
              isCentered && 'max-w-[320px]',
            )}>
              {resolvedDescription}
            </p>
          )}

          {/* Actions */}
          {(primary || secondary) && (
            <div className={cn(
              'mt-5 flex flex-col gap-2.5',
              isCentered ? 'w-full max-w-[280px] items-center' : 'items-start',
            )}>
              {primary}
              {secondary}
            </div>
          )}

          {/* Note / meta text */}
          {note && (
            <p className={cn(
              'mt-3 text-[12px] leading-5 text-[hsl(var(--fg-3))]',
              isCentered && 'max-w-[320px]',
            )}>
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Convenience pre-wired variants ──────────────────────────────────────────

export function LoadingDataState({ title = 'Loading...', description, eyebrow, ...rest }) {
  return (
    <DataState
      variant="loading"
      title={title}
      description={description}
      eyebrow={eyebrow}
      {...rest}
    />
  );
}

export function EmptyDataState({ icon, title, description, action, secondaryAction, note, ...rest }) {
  return (
    <DataState
      variant="empty"
      icon={icon}
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      note={note}
      {...rest}
    />
  );
}

export function ErrorDataState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Retry',
  secondaryAction,
  note,
  ...rest
}) {
  return (
    <DataState
      variant="error"
      title={title}
      description={description}
      action={onRetry ? { label: retryLabel, onClick: onRetry } : undefined}
      secondaryAction={secondaryAction}
      note={note}
      {...rest}
    />
  );
}

export function OfflineDataState({
  title = "You're offline",
  description = 'Check your connection and try again when ready.',
  onRetry,
  ...rest
}) {
  return (
    <DataState
      variant="offline"
      title={title}
      description={description}
      action={onRetry ? { label: 'Retry connection', onClick: onRetry } : { label: 'Retry connection', onClick: () => window.location.reload() }}
      {...rest}
    />
  );
}

export function PermissionDataState({
  icon,
  title,
  description,
  onAllow,
  onDismiss,
  allowLabel = 'Allow access',
  dismissLabel = 'Not now',
  note,
  ...rest
}) {
  return (
    <DataState
      variant="permission"
      icon={icon}
      title={title}
      description={description}
      action={onAllow ? { label: allowLabel, onClick: onAllow } : undefined}
      secondaryAction={onDismiss ? { label: dismissLabel, onClick: onDismiss } : undefined}
      note={note}
      {...rest}
    />
  );
}

export default DataState;
