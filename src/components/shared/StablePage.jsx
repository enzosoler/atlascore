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
    // Log para debug - mostra no console do navegador
    window.__lastPageError = { error: error?.toString?.(), stack: error?.stack, componentStack: errorInfo?.componentStack };
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.title || 'Page';
      const subtitle =
        this.props.subtitle || 'Safe mode is active to avoid a blank screen.';

      return (
        <PageShell title={title} subtitle={subtitle} maxWidth={this.props.maxWidth || 'max-w-5xl'}>
          <StatusBanner tone="warning">
            We detected a rendering failure and opened the page safety fallback.
          </StatusBanner>
          <SectionCard title={`${title} page loaded`} subtitle="Minimal fallback guaranteed.">
            <EmptyState
              title={`${title} page loaded`}
              description={
                this.props.fallbackDescription ||
                'The main content failed, but the route remains accessible.'
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
  title = 'Loading data',
  description = 'The page has opened in safe mode and content appears when data responds.',
}) {
  return (
    <SectionCard title={title} subtitle={description}>
      <div className="atlas-banner flex items-start gap-3 px-4 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
            Loading...
          </p>
          <p className="atlas-copy mt-1">{description}</p>
        </div>
      </div>
    </SectionCard>
  );
}

export function ErrorState({
  title = 'Safe mode active',
  description = 'Some data failed to load, but the page remains open and usable.',
}) {
  return (
    <SectionCard title={title} subtitle={description}>
      <div className="atlas-banner flex items-start gap-3 px-4 py-4" data-tone="warning">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--warn))]">
          <AlertTriangle className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[-0.018em]">Alguns dados nao carregaram.</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </SectionCard>
  );
}

export function MetricCard({ label, value, hint, icon: Icon }) {
  return <StatCard label={label} value={value} detail={hint} icon={Icon} />;
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="atlas-empty px-6 py-10 lg:px-8">
      {Icon ? (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.85} />
        </div>
      ) : null}
      <p className="text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {title}
      </p>
      {description ? <p className="atlas-copy mt-2 max-w-xl">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
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
