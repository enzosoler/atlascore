import React from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('pt-BR', options).format(Number(value || 0));
}

export function formatDateLabel(date, options) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'pt-BR',
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
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.title || 'Pagina';
      const subtitle =
        this.props.subtitle || 'Modo seguro ativado para evitar tela em branco.';

      return (
        <PageShell title={title} subtitle={subtitle} maxWidth={this.props.maxWidth}>
          <StatusBanner tone="warning">
            Detectamos uma falha de renderizacao e abrimos o fallback de seguranca da pagina.
          </StatusBanner>
          <SectionCard title={`${title} page loaded`} subtitle="Fallback minimo garantido.">
            <EmptyState
              title={`${title} page loaded`}
              description={
                this.props.fallbackDescription ||
                'O conteudo principal falhou, mas a rota continua acessivel.'
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
  maxWidth = 'max-w-6xl',
  eyebrow,
}) {
  return (
    <div className="atlas-page-shell">
      <div className={cn('mx-auto space-y-8 px-5 py-6 lg:px-8 lg:py-10', maxWidth)}>
        <header className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
              <div>
                <h1 className="atlas-display-title">{title}</h1>
                {subtitle ? <p className="atlas-section-description mt-3">{subtitle}</p> : null}
              </div>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={cn('atlas-card px-6 py-6 lg:px-7 lg:py-7', className)}>
      {title || subtitle || actions ? (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            {title ? <h2 className="atlas-section-title">{title}</h2> : null}
            {subtitle ? <p className="atlas-section-description mt-2">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function LoadingState({
  title = 'Carregando dados',
  description = 'A pagina ja abriu em modo seguro e o conteudo aparece assim que os dados responderem.',
}) {
  return (
    <SectionCard title={title} subtitle={description}>
      <div className="atlas-banner flex items-start gap-3 px-4 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
            Carregando...
          </p>
          <p className="atlas-copy mt-1">{description}</p>
        </div>
      </div>
    </SectionCard>
  );
}

export function ErrorState({
  title = 'Modo seguro ativado',
  description = 'Parte dos dados falhou, mas a pagina continua aberta e utilizavel.',
}) {
  return (
    <SectionCard title={title} subtitle={description}>
      <div className="atlas-banner flex items-start gap-3 px-4 py-4" data-tone="warning">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[hsl(39_62%_80%)] bg-[hsl(var(--card)/0.82)]">
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
  return (
    <article className="atlas-card px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="atlas-metric-label">{label}</p>
          <p className="atlas-metric-value">{value}</p>
          {hint ? <p className="atlas-metric-hint">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="atlas-empty px-6 py-12 lg:px-8">
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      ) : null}
      <p className="text-[1.0625rem] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">
        {title}
      </p>
      {description ? <p className="atlas-copy mt-2 max-w-xl">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatusBanner({ children, tone = 'neutral' }) {
  return (
    <div className="atlas-banner px-4 py-3.5 text-sm leading-6" data-tone={tone}>
      {children}
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

export function DateStepper({ date, onChange }) {
  return (
    <div className="atlas-card inline-flex items-center gap-2 px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="min-w-[180px] text-center text-sm font-medium tracking-[-0.016em] text-[hsl(var(--fg))]">
        {formatDateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
