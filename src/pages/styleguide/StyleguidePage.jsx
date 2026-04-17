import { useState } from 'react';
import { useT } from '@/lib/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DataState,
  LoadingDataState,
  EmptyDataState,
  ErrorDataState,
  OfflineDataState,
  PermissionDataState,
} from '@/components/shared/DataState';
import { ColorBlock } from './ColorBlock';
import { Scale, Camera, Dumbbell, Lock } from 'lucide-react';

/* ---------- Layout helpers ---------- */
const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-20 space-y-4">
    <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[hsl(var(--label-tertiary))]">
      {title}
    </h2>
    {children}
  </section>
);

const ExampleBlock = ({ label, description, children }) => (
  <div className="rounded-[12px] border border-[hsl(var(--border-default)/0.5)] bg-[hsl(var(--bg-card-semantic))] p-4">
    <p className="mb-1 text-[12px] font-semibold text-[hsl(var(--label))]">{label}</p>
    {description && <p className="mb-3 text-[11px] text-[hsl(var(--label-tertiary))]">{description}</p>}
    <div>{children}</div>
  </div>
);

/* ---------- Nav sidebar items ---------- */
const NAV = [
  { id: 'tokens-colors', label: 'Colors' },
  { id: 'tokens-surfaces', label: 'Surfaces' },
  { id: 'tokens-borders', label: 'Borders' },
  { id: 'tokens-spacing', label: 'Spacing' },
  { id: 'tokens-radius', label: 'Radius & Shadows' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'badges', label: 'Badges' },
  { id: 'cards', label: 'Cards' },
  { id: 'data-states', label: 'Data States' },
];

export default function StyleguidePage() {
  const t = useT();
  const [activeNav, setActiveNav] = useState('tokens-colors');

  const handleNavClick = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-app))]">
      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8">

        {/* Sidebar nav */}
        <nav className="sticky top-8 hidden h-fit w-[180px] shrink-0 space-y-0.5 lg:block">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--label-tertiary))]">
            On this page
          </p>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`block w-full rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium transition ${
                activeNav === item.id
                  ? 'bg-[hsl(var(--accent-primary)/0.08)] text-[hsl(var(--accent-primary))]'
                  : 'text-[hsl(var(--label-tertiary))] hover:text-[hsl(var(--label-secondary))]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-14">

          {/* Header */}
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[hsl(var(--label))]">
              {t('styleguide.title')}
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--label-secondary))]">
              {t('styleguide.subtitle')}
            </p>
          </div>

          {/* ================================================================= */}
          {/*  DESIGN TOKENS                                                    */}
          {/* ================================================================= */}

          {/* Colors: Semantic */}
          <Section id="tokens-colors" title={t('styleguide.sections.colors')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ColorBlock labelKey="styleguide.tokens.primary"      cssVar="--accent-primary" />
              <ColorBlock labelKey="styleguide.tokens.secondary"    cssVar="--fill" />
              <ColorBlock labelKey="styleguide.tokens.muted"        cssVar="--fill-secondary" />
              <ColorBlock labelKey="styleguide.tokens.accent"       cssVar="--accent-secondary" />
              <ColorBlock labelKey="styleguide.tokens.destructive"  cssVar="--status-danger" />
              <ColorBlock labelKey="styleguide.tokens.success"      cssVar="--status-success" />
              <ColorBlock labelKey="styleguide.tokens.warning"      cssVar="--status-warning" />
              <ColorBlock labelKey="styleguide.tokens.ai"           cssVar="--status-ai" />
            </div>
          </Section>

          {/* Surfaces */}
          <Section id="tokens-surfaces" title={t('styleguide.sections.surfaces')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ColorBlock labelKey="styleguide.tokens.bgApp"          cssVar="--bg-app" />
              <ColorBlock labelKey="styleguide.tokens.bgSurface"      cssVar="--bg-surface" />
              <ColorBlock labelKey="styleguide.tokens.bgSurface2"     cssVar="--bg-surface-2" />
              <ColorBlock labelKey="styleguide.tokens.card"           cssVar="--bg-card-semantic" />
              <ColorBlock labelKey="styleguide.tokens.cardElevated"   cssVar="--bg-card-elevated" />
            </div>
          </Section>

          {/* Borders */}
          <Section id="tokens-borders" title={t('styleguide.sections.borders')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ColorBlock labelKey="styleguide.tokens.border"       cssVar="--border-default" />
              <ColorBlock labelKey="styleguide.tokens.borderStrong" cssVar="--border-strong" />
              <ColorBlock labelKey="styleguide.tokens.ring"         cssVar="--accent-primary" />
            </div>
          </Section>

          {/* Spacing */}
          <Section id="tokens-spacing" title="Spacing Scale">
            <div className="rounded-[12px] border border-[hsl(var(--border-default)/0.5)] bg-[hsl(var(--bg-card-semantic))] p-4">
              <div className="space-y-2">
                {[
                  { token: '--space-1',  px: '4px' },
                  { token: '--space-2',  px: '8px' },
                  { token: '--space-3',  px: '12px' },
                  { token: '--space-4',  px: '16px' },
                  { token: '--space-5',  px: '20px' },
                  { token: '--space-6',  px: '24px' },
                  { token: '--space-8',  px: '32px' },
                  { token: '--space-10', px: '40px' },
                  { token: '--space-12', px: '48px' },
                  { token: '--space-16', px: '64px' },
                ].map(({ token, px }) => (
                  <div key={token} className="flex items-center gap-3">
                    <span className="w-[90px] shrink-0 text-[11px] font-mono text-[hsl(var(--label-tertiary))]">{token}</span>
                    <div
                      className="h-3 rounded-[3px] bg-[hsl(var(--accent-primary)/0.2)]"
                      style={{ width: `var(${token})` }}
                    />
                    <span className="text-[10px] tabular-nums text-[hsl(var(--label-tertiary))]">{px}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Radius & Shadows */}
          <Section id="tokens-radius" title={t('styleguide.sections.radius')}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[
                { label: 'xs \u00b7 12px', style: { borderRadius: 'var(--r-xs)' } },
                { label: 'sm \u00b7 16px', style: { borderRadius: 'var(--r-sm)' } },
                { label: 'md \u00b7 18px', style: { borderRadius: 'var(--r-md)' } },
                { label: 'lg \u00b7 24px', style: { borderRadius: 'var(--r-lg)' } },
                { label: 'pill',           style: { borderRadius: 'var(--r-pill)' } },
              ].map(({ label, style }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className="h-12 w-full border border-[hsl(var(--accent-primary)/0.3)] bg-[hsl(var(--accent-primary)/0.1)]"
                    style={style}
                  />
                  <span className="text-[10px] font-mono text-[hsl(var(--label-tertiary))]">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'shadow-xs', cls: '[box-shadow:var(--shadow-xs)]' },
                { label: 'shadow-sm', cls: '[box-shadow:var(--shadow-sm)]' },
                { label: 'shadow-md', cls: '[box-shadow:var(--shadow-md)]' },
                { label: 'shadow-lg', cls: '[box-shadow:var(--shadow-lg)]' },
              ].map(({ label, cls }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-12 w-full bg-[hsl(var(--bg-card-semantic))] ${cls}`}
                    style={{ borderRadius: 'var(--r-md)' }}
                  />
                  <span className="text-[10px] font-mono text-[hsl(var(--label-tertiary))]">{label}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ================================================================= */}
          {/*  TYPOGRAPHY                                                       */}
          {/* ================================================================= */}

          <Section id="typography" title={t('styleguide.sections.typography')}>
            <div className="rounded-[12px] border border-[hsl(var(--border-default)/0.5)] bg-[hsl(var(--bg-card-semantic))] p-5 space-y-4">
              {[
                { cls: 'text-[28px] font-semibold tracking-[-0.03em] text-[hsl(var(--label))]',       label: 'Display', spec: '28px / semibold / -0.03em' },
                { cls: 'text-xl font-semibold tracking-[-0.025em] text-[hsl(var(--label))]',           label: 'Title',   spec: '20px / semibold / -0.025em' },
                { cls: 'text-[15px] font-semibold text-[hsl(var(--label))]',                           label: 'Heading', spec: '15px / semibold' },
                { cls: 'text-base font-medium text-[hsl(var(--label))]',                               label: 'Body',    spec: '16px / medium' },
                { cls: 'text-sm text-[hsl(var(--label-secondary))]',                                   label: 'Secondary', spec: '14px / regular' },
                { cls: 'text-[13px] text-[hsl(var(--label-tertiary))]',                                label: 'Caption', spec: '13px / regular' },
                { cls: 'text-[11px] text-[hsl(var(--label-tertiary))]',                                label: 'Micro',   spec: '11px / regular' },
                { cls: 'text-[11px] font-mono tracking-wide text-[hsl(var(--label-tertiary))]',        label: 'Mono',    spec: '11px / mono' },
              ].map(({ cls, label, spec }) => (
                <div key={label} className="flex items-baseline justify-between gap-4">
                  <div className={cls}>{label}</div>
                  <span className="shrink-0 text-[10px] font-mono text-[hsl(var(--label-tertiary))]">{spec}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ================================================================= */}
          {/*  COMPONENT CATALOG                                                */}
          {/* ================================================================= */}

          {/* Buttons */}
          <Section id="buttons" title={t('styleguide.sections.buttons')}>
            <ExampleBlock label="Variants" description="All button variants available in the design system.">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">{t('styleguide.variants.default')}</Button>
                <Button variant="outline">{t('styleguide.variants.outline')}</Button>
                <Button variant="secondary">{t('styleguide.variants.secondary')}</Button>
                <Button variant="ghost">{t('styleguide.variants.ghost')}</Button>
                <Button variant="destructive">{t('styleguide.variants.destructive')}</Button>
                <Button variant="link">{t('styleguide.variants.link')}</Button>
              </div>
            </ExampleBlock>
            <ExampleBlock label="Sizes" description="Size scale from sm to lg, plus icon-only and disabled states.">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">{t('styleguide.sizes.sm')}</Button>
                <Button size="default">{t('styleguide.sizes.default')}</Button>
                <Button size="lg">{t('styleguide.sizes.lg')}</Button>
                <Button size="icon" aria-label="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </Button>
                <Button disabled>{t('styleguide.sizes.disabled')}</Button>
              </div>
            </ExampleBlock>
          </Section>

          {/* Inputs */}
          <Section id="inputs" title={t('styleguide.sections.inputs')}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ExampleBlock label="Text Input">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[hsl(var(--label-secondary))]">
                    {t('styleguide.inputLabels.text')}
                  </label>
                  <Input placeholder={t('styleguide.inputLabels.textPlaceholder')} />
                </div>
              </ExampleBlock>
              <ExampleBlock label="Disabled Input">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[hsl(var(--label-secondary))]">
                    {t('styleguide.inputLabels.disabled')}
                  </label>
                  <Input placeholder={t('styleguide.inputLabels.disabledPlaceholder')} disabled />
                </div>
              </ExampleBlock>
              <ExampleBlock label="Textarea">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[hsl(var(--label-secondary))]">
                    {t('styleguide.inputLabels.textarea')}
                  </label>
                  <Textarea placeholder={t('styleguide.inputLabels.textareaPlaceholder')} rows={3} />
                </div>
              </ExampleBlock>
              <ExampleBlock label="Select">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[hsl(var(--label-secondary))]">
                    {t('styleguide.inputLabels.select')}
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('styleguide.inputLabels.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">{t('styleguide.inputLabels.optionA')}</SelectItem>
                      <SelectItem value="b">{t('styleguide.inputLabels.optionB')}</SelectItem>
                      <SelectItem value="c">{t('styleguide.inputLabels.optionC')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ExampleBlock>
            </div>
          </Section>

          {/* Badges */}
          <Section id="badges" title="Badges">
            <ExampleBlock label="Badge Variants" description="Semantic badge styles for statuses, categories, and labels.">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </ExampleBlock>
          </Section>

          {/* Cards */}
          <Section id="cards" title="Cards">
            <div className="grid gap-3 sm:grid-cols-2">
              <ExampleBlock label="Default Card" description="Standard surface container with border and shadow.">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-[13px] text-[hsl(var(--label-secondary))]">
                      Cards use <code className="rounded bg-[hsl(var(--fill)/0.6)] px-1 py-0.5 text-[11px] font-mono">--bg-card-semantic</code> with <code className="rounded bg-[hsl(var(--fill)/0.6)] px-1 py-0.5 text-[11px] font-mono">--r-md</code> radius and <code className="rounded bg-[hsl(var(--fill)/0.6)] px-1 py-0.5 text-[11px] font-mono">--shadow-xs</code>.
                    </p>
                  </CardContent>
                </Card>
              </ExampleBlock>
              <ExampleBlock label="Atlas Card (CSS class)" description="Uses the .atlas-card utility class from index.css.">
                <div className="atlas-card p-4">
                  <p className="text-[13px] text-[hsl(var(--label-secondary))]">
                    The <code className="rounded bg-[hsl(var(--fill)/0.6)] px-1 py-0.5 text-[11px] font-mono">.atlas-card</code> class applies the standard card surface, border, and radius tokens.
                  </p>
                </div>
              </ExampleBlock>
            </div>
          </Section>

          {/* ================================================================= */}
          {/*  DATA STATES                                                      */}
          {/* ================================================================= */}

          <Section id="data-states" title="Data States">
            <p className="text-[13px] text-[hsl(var(--label-secondary))]">
              The <code className="rounded bg-[hsl(var(--fill)/0.6)] px-1 py-0.5 text-[11px] font-mono">DataState</code> component handles all system-level feedback: loading, empty, error, offline, permission, success, and neutral states. It follows a consistent pattern: icon + title + description + optional CTA.
            </p>

            <div className="space-y-3">
              {/* Loading */}
              <ExampleBlock label="Loading" description="variant='loading' -- Shown while data is being fetched. Spinner auto-animates.">
                <LoadingDataState
                  title="Loading..."
                  description="Fetching your data, hang tight."
                  eyebrow="Measurements"
                />
              </ExampleBlock>

              {/* Empty */}
              <ExampleBlock label="Empty" description="variant='empty' -- Shown when a list or dataset has zero items. Dashed border signals actionable emptiness.">
                <EmptyDataState
                  icon={Scale}
                  title="No measurements yet"
                  description="Add your first weight entry to start tracking progress."
                  action={{ label: 'Add measurement', onClick: () => {} }}
                  secondaryAction={{ label: 'Learn more', onClick: () => {} }}
                />
              </ExampleBlock>

              {/* Error */}
              <ExampleBlock label="Error" description="variant='error' -- Shown when a fetch or operation fails. Red tint signals danger. Retry CTA is standard.">
                <ErrorDataState
                  title="Something went wrong"
                  description="We couldn't load your workouts. Please try again."
                  onRetry={() => {}}
                  retryLabel="Retry"
                  note="If the problem persists, contact support."
                />
              </ExampleBlock>

              {/* Offline */}
              <ExampleBlock label="Offline" description="variant='offline' -- Shown when the device has no network. Warm tint signals caution, not failure.">
                <OfflineDataState
                  title="You're offline"
                  description="Check your connection and try again when ready."
                  onRetry={() => {}}
                />
              </ExampleBlock>

              {/* Permission */}
              <ExampleBlock label="Permission" description="variant='permission' -- Shown when access is gated (e.g., camera, premium feature). Brand tint signals trust.">
                <PermissionDataState
                  icon={Lock}
                  title="Camera access needed"
                  description="Allow camera access to take progress photos."
                  onAllow={() => {}}
                  onDismiss={() => {}}
                  allowLabel="Allow access"
                  dismissLabel="Not now"
                  note="You can change this later in Settings."
                />
              </ExampleBlock>

              {/* Success */}
              <ExampleBlock label="Success" description="variant='success' -- Shown after a successful operation. Green tint signals completion.">
                <DataState
                  variant="success"
                  title="Workout saved"
                  description="Your workout has been logged successfully."
                  meta="Just now"
                />
              </ExampleBlock>

              {/* Neutral */}
              <ExampleBlock label="Neutral" description="variant='neutral' -- Generic informational state. No emotional tint.">
                <DataState
                  variant="neutral"
                  title="Getting started"
                  description="Complete your profile to unlock personalized recommendations."
                  action={{ label: 'Complete profile', onClick: () => {} }}
                />
              </ExampleBlock>
            </div>

            {/* Usage notes */}
            <div className="rounded-[10px] border border-[hsl(var(--border-default)/0.5)] bg-[hsl(var(--fill)/0.15)] p-4">
              <p className="mb-2 text-[12px] font-semibold text-[hsl(var(--label))]">Usage Notes</p>
              <ul className="list-disc space-y-1 pl-5 text-[12px] text-[hsl(var(--label-secondary))]">
                <li>Import from <code className="rounded bg-[hsl(var(--fill)/0.6)] px-1 py-0.5 text-[10px] font-mono">@/components/shared/DataState</code></li>
                <li>Use convenience wrappers (<code className="text-[10px] font-mono">LoadingDataState</code>, <code className="text-[10px] font-mono">EmptyDataState</code>, etc.) for common patterns</li>
                <li>The <code className="text-[10px] font-mono">action</code> prop accepts <code className="text-[10px] font-mono">{'{ label, onClick }'}</code> for the primary CTA</li>
                <li>The <code className="text-[10px] font-mono">meta</code> prop renders a pill in the eyebrow row (e.g., "Last checked 2m ago")</li>
                <li>Legacy boolean API (<code className="text-[10px] font-mono">loading</code>, <code className="text-[10px] font-mono">empty</code>, <code className="text-[10px] font-mono">error</code>) is still supported for backward compat</li>
                <li>All variants support <code className="text-[10px] font-mono">centered={'{false}'}</code> for left-aligned layout</li>
              </ul>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
