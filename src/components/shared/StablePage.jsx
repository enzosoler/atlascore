import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  XCircle,
} from 'lucide-react';
import {
  AppContainer,
  Card,
  PageHeader,
  Section,
  StatCard,
} from '@/components/shared/AppContainer';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18nContext';

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('en-US', options).format(Number(value || 0));
}

export function formatDateLabel(date, options) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'en-US',
    options || {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
  );
}

export function shiftDate(date, amount) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + amount);
  return next.toISOString().split('T')[0];
}

export function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export class SafePageBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[SafePageBoundary:${this.props.title || 'Page'}]`, error, errorInfo);
    window.__lastPageError = { error: error?.toString?.(), stack: error?.stack, componentStack: errorInfo?.componentStack };
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.title || 'Page';
      // Use static context for i18n in class component
      const t = window.__i18n?.t || ((k, fallback) => fallback || k);

      return (
        <PageShell title={title} subtitle={t('shared.stablePage.errorSectionSubtitle', "We couldn't load this section.")} maxWidth={this.props.maxWidth || 'max-w-5xl'}>
          <SectionCard title={t('shared.stablePage.tryAgain', 'Try again')}>
            <EmptyState
              title={t('shared.stablePage.errorSectionTitle', "We couldn't load this section")}
              description={t('shared.stablePage.errorSectionDesc', 'Please try again. If the problem continues, go back and try a different route.')}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => window.location.reload()} className="atlas-button atlas-button-primary gap-2">
                    {t('shared.stablePage.tryAgainButton', 'Try again')}
                  </button>
                  <button type="button" onClick={() => window.history.back()} className="atlas-button atlas-button-secondary gap-2">
                    {t('shared.stablePage.goBackButton', 'Go back')}
                  </button>
                </div>
              }
            />
          </SectionCard>
        </PageShell>
      );
    }

    return this.props.children;
  }
}

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  eyebrow,
  maxWidth,
}) {
  return (
    <AppContainer maxWidth={maxWidth}>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} />
      {children}
    </AppContainer>
  );
}

export function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <Section title={title} subtitle={subtitle} actions={actions}>
      <Card className={cn('relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-7', className)}>
        {children}
      </Card>
    </Section>
  );
}

export function LoadingState({
  title,
  description,
}) {
  const t = useT();
  const resolvedTitle = title ?? t('shared.stablePage.loadingTitle');
  const resolvedDescription = description ?? t('shared.stablePage.loadingDescription');
  return (
    <SectionCard title={resolvedTitle} subtitle={resolvedDescription}>
      <DataState
        variant="loading"
        title={resolvedTitle}
        description={resolvedDescription}
        eyebrow={t('shared.stablePage.loadingText')}
      />
    </SectionCard>
  );
}

export function ErrorState({
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
}) {
  const t = useT();
  const resolvedTitle = title ?? t('shared.stablePage.errorTitle');
  const resolvedDescription = description ?? t('shared.stablePage.errorDescription');
  return (
    <SectionCard title={resolvedTitle} subtitle={resolvedDescription}>
      <DataState
        variant="error"
        title={resolvedTitle}
        description={resolvedDescription}
        eyebrow={t('shared.stablePage.errorBannerText')}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        note={note}
      />
    </SectionCard>
  );
}

export function MetricCard({ label, value, hint, icon: Icon }) {
  return <StatCard label={label} value={value} detail={hint} icon={Icon} />;
}

export function EmptyState({ title, description, action, icon: Icon, note }) {
  return (
    <DataState
      variant="empty"
      title={title}
      description={description}
      customIcon={Icon}
      primaryAction={action}
      note={note}
      centered
    />
  );
}

export function DataState({
  variant = 'neutral',
  title,
  description,
  eyebrow,
  meta,
  primaryAction,
  secondaryAction,
  note,
  customIcon: CustomIcon,
  centered = false,
}) {
  const variantMeta = {
    neutral: {
      icon: Info,
      shellClass: 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.32)]',
      iconClass: 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
    },
    loading: {
      icon: Loader2,
      shellClass: 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.32)]',
      iconClass: 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
      spin: true,
    },
    empty: {
      icon: Info,
      shellClass: 'border-dashed border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.18)]',
      iconClass: 'border-[hsl(var(--border)/0.76)] bg-[hsl(var(--card))] text-[hsl(var(--fg-3))]',
    },
    error: {
      icon: AlertTriangle,
      shellClass: 'border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--warn)/0.05)]',
      iconClass: 'border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--warn))]',
    },
    offline: {
      icon: AlertTriangle,
      shellClass: 'border-[hsl(var(--fg-3)/0.2)] bg-[hsl(var(--fill)/0.26)]',
      iconClass: 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
    },
    permission: {
      icon: Info,
      shellClass: 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.05)]',
      iconClass: 'border-[hsl(var(--brand)/0.24)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--brand))]',
    },
    success: {
      icon: CheckCircle2,
      shellClass: 'border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.05)]',
      iconClass: 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--ok))]',
    },
  };

  const resolvedMeta = variantMeta[variant] || variantMeta.neutral;
  const Icon = CustomIcon || resolvedMeta.icon;

  return (
    <div
      className={cn(
        'rounded-[18px] border px-5 py-5 shadow-[var(--shadow-xs)]',
        resolvedMeta.shellClass,
        centered && 'text-center'
      )}
    >
      {(eyebrow || meta) ? (
        <div className={cn('mb-4 flex items-center justify-between gap-3', centered && 'justify-center')}>
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
      ) : null}

      <div className={cn('flex items-start gap-3.5', centered && 'flex-col items-center')}>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border shadow-[var(--shadow-xs)]',
            resolvedMeta.iconClass
          )}
        >
          <Icon className={cn('h-5 w-5', resolvedMeta.spin && 'animate-spin')} strokeWidth={2} />
        </div>

        <div className={cn('min-w-0 flex-1', centered && 'flex flex-col items-center')}>
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {title}
          </p>
          {description ? (
            <p className={cn('mt-1.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]', centered && 'max-w-md')}>
              {description}
            </p>
          ) : null}

          {(primaryAction || secondaryAction) ? (
            <div className={cn('mt-4 flex flex-wrap gap-2.5', centered && 'justify-center')}>
              {primaryAction ? <div>{primaryAction}</div> : null}
              {secondaryAction ? <div>{secondaryAction}</div> : null}
            </div>
          ) : null}

          {note ? (
            <p className={cn('mt-3 text-[12px] leading-5 text-[hsl(var(--fg-3))]', centered && 'max-w-sm')}>
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function StatusBanner({ children, tone = 'neutral' }) {
  const toneMeta = {
    neutral: {
      icon: Info,
      iconClass:
        'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--warn))]',
    },
    success: {
      icon: CheckCircle2,
      iconClass: 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--ok))]',
    },
    error: {
      icon: XCircle,
      iconClass: 'border-[hsl(var(--err)/0.24)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--err))]',
    },
  };
  const meta = toneMeta[tone] || toneMeta.neutral;
  const Icon = meta.icon;

  return (
    <div className="atlas-banner px-4 py-3.5 text-sm leading-6" data-tone={tone}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] border shadow-[var(--shadow-xs)]',
            meta.iconClass
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={cn('atlas-button atlas-button-primary', className)}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={cn('atlas-button atlas-button-secondary', className)}
    >
      {children}
    </button>
  );
}

export function FilterChip({ active = false, children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'atlas-button h-10 rounded-full px-4 text-[12px] shadow-none',
        active
          ? 'atlas-button-primary'
          : 'atlas-button-secondary bg-[hsl(var(--card)/0.88)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.94)] hover:text-[hsl(var(--fg))]',
        className
      )}
    >
      {children}
    </button>
  );
}

export function DialogPanelHeader({
  eyebrow,
  title,
  description,
  accentClassName = '',
  className = '',
}) {
  return (
    <DialogHeader
      className={cn(
        'relative overflow-hidden border-b border-[hsl(var(--border)/0.82)] px-6 pb-5 pt-6 text-left lg:px-7',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent',
          accentClassName
        )}
      />
      <div className="relative pr-8">
        {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
        <DialogTitle className={eyebrow ? 'mt-3' : ''}>{title}</DialogTitle>
        {description ? (
          <DialogDescription className="mt-3 max-w-2xl">{description}</DialogDescription>
        ) : null}
      </div>
    </DialogHeader>
  );
}

export function DateStepper({ date, onChange }) {
  return (
    <Card className="inline-flex items-center gap-2 px-2 py-2 shadow-[var(--shadow-xs)]">
      <button
        type="button"
        onClick={() => onChange(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="min-w-0 w-[130px] sm:w-[180px] text-center text-sm font-medium tracking-[-0.016em] text-[hsl(var(--fg))]">
        {formatDateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </Card>
  );
}
