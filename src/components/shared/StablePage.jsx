import React from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('pt-BR', options).format(Number(value || 0));
}

export function formatDateLabel(date, options) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', options || {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
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

export function PageShell({ title, subtitle, actions, children, maxWidth = 'max-w-6xl' }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-zinc-950">
      <div className={`mx-auto ${maxWidth} space-y-6 px-5 py-6 lg:px-8 lg:py-8`}>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-sm text-zinc-600">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`.trim()}>
      {(title || subtitle || actions) ? (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-zinc-950">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
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
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" strokeWidth={2} />
        <div>
          <p className="font-semibold text-zinc-900">Carregando...</p>
          <p className="mt-1 text-zinc-600">{description}</p>
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
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} />
        <div>
          <p className="font-semibold">Alguns dados nao carregaram.</p>
          <p className="mt-1">{description}</p>
        </div>
      </div>
    </SectionCard>
  );
}

export function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      {Icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">{value}</p>
      {hint ? <p className="mt-2 text-sm text-zinc-600">{hint}</p> : null}
    </article>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
      <p className="text-base font-semibold text-zinc-900">{title}</p>
      {description ? <p className="mt-2 text-sm text-zinc-600">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatusBanner({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-zinc-200 bg-zinc-50 text-zinc-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone] || tones.neutral}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function DateStepper({ date, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <button
        type="button"
        onClick={() => onChange(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="min-w-[170px] text-center text-sm font-medium text-zinc-900">
        {formatDateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
