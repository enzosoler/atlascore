import { useT } from '@/lib/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ColorBlock } from './ColorBlock';

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[hsl(var(--label-tertiary))]">
      {title}
    </h2>
    {children}
  </section>
);

export default function StyleguidePage() {
  const t = useT();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-app))] px-5 py-10">
      <div className="mx-auto max-w-2xl space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[hsl(var(--label))]">
            {t('styleguide.title')}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--label-secondary))]">
            {t('styleguide.subtitle')}
          </p>
        </div>

        {/* ── Colors: Semantic ─────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.colors')}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ColorBlock labelKey="styleguide.tokens.primary"    cssVar="--accent-primary" />
            <ColorBlock labelKey="styleguide.tokens.secondary"  cssVar="--fill" />
            <ColorBlock labelKey="styleguide.tokens.muted"      cssVar="--fill-secondary" />
            <ColorBlock labelKey="styleguide.tokens.accent"     cssVar="--accent-secondary" />
            <ColorBlock labelKey="styleguide.tokens.destructive" cssVar="--status-danger" />
            <ColorBlock labelKey="styleguide.tokens.success"    cssVar="--status-success" />
            <ColorBlock labelKey="styleguide.tokens.warning"    cssVar="--status-warning" />
            <ColorBlock labelKey="styleguide.tokens.ai"         cssVar="--status-ai" />
          </div>
        </Section>

        {/* ── Surfaces ─────────────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.surfaces')}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ColorBlock labelKey="styleguide.tokens.bgApp"      cssVar="--bg-app" />
            <ColorBlock labelKey="styleguide.tokens.bgSurface"  cssVar="--bg-surface" />
            <ColorBlock labelKey="styleguide.tokens.bgSurface2" cssVar="--bg-surface-2" />
            <ColorBlock labelKey="styleguide.tokens.card"       cssVar="--bg-card-semantic" />
            <ColorBlock labelKey="styleguide.tokens.cardElevated" cssVar="--bg-card-elevated" />
          </div>
        </Section>

        {/* ── Borders & Ring ───────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.borders')}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ColorBlock labelKey="styleguide.tokens.border"       cssVar="--border-default" />
            <ColorBlock labelKey="styleguide.tokens.borderStrong" cssVar="--border-strong" />
            <ColorBlock labelKey="styleguide.tokens.ring"         cssVar="--accent-primary" />
          </div>
        </Section>

        {/* ── Text ─────────────────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.typography')}>
          <Card>
            <CardContent className="pt-6 space-y-3">
              {[
                { cls: 'text-[28px] font-semibold tracking-[-0.03em] text-[hsl(var(--label))]',           label: 'Display · 28/semibold' },
                { cls: 'text-xl font-semibold tracking-[-0.025em] text-[hsl(var(--label))]',              label: 'Title · 20/semibold' },
                { cls: 'text-base font-medium text-[hsl(var(--label))]',                                  label: 'Body · 16/medium' },
                { cls: 'text-sm text-[hsl(var(--label-secondary))]',                                      label: 'Secondary · 14/regular' },
                { cls: 'text-[13px] text-[hsl(var(--label-tertiary))]',                                   label: 'Muted · 13/regular' },
                { cls: 'text-[11px] font-mono tracking-wide text-[hsl(var(--label-tertiary))]',           label: 'Mono · 11' },
              ].map(({ cls, label }) => (
                <div key={label} className={cls}>{label}</div>
              ))}
            </CardContent>
          </Card>
        </Section>

        {/* ── Buttons ──────────────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.buttons')}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button variant="default">{t('styleguide.variants.default')}</Button>
                <Button variant="outline">{t('styleguide.variants.outline')}</Button>
                <Button variant="secondary">{t('styleguide.variants.secondary')}</Button>
                <Button variant="ghost">{t('styleguide.variants.ghost')}</Button>
                <Button variant="destructive">{t('styleguide.variants.destructive')}</Button>
                <Button variant="link">{t('styleguide.variants.link')}</Button>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button size="lg">{t('styleguide.sizes.lg')}</Button>
                <Button size="default">{t('styleguide.sizes.default')}</Button>
                <Button size="sm">{t('styleguide.sizes.sm')}</Button>
                <Button size="icon" aria-label="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </Button>
                <Button disabled>{t('styleguide.sizes.disabled')}</Button>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ── Inputs ───────────────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.inputs')}>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[hsl(var(--label-secondary))]">
                  {t('styleguide.inputLabels.text')}
                </label>
                <Input placeholder={t('styleguide.inputLabels.textPlaceholder')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[hsl(var(--label-secondary))]">
                  {t('styleguide.inputLabels.disabled')}
                </label>
                <Input placeholder={t('styleguide.inputLabels.disabledPlaceholder')} disabled />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[hsl(var(--label-secondary))]">
                  {t('styleguide.inputLabels.textarea')}
                </label>
                <Textarea placeholder={t('styleguide.inputLabels.textareaPlaceholder')} rows={3} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[hsl(var(--label-secondary))]">
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
            </CardContent>
          </Card>
        </Section>

        {/* ── Radius & Shadows ─────────────────────────────────────────────── */}
        <Section title={t('styleguide.sections.radius')}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {[
              { label: 'xs · 12px', style: { borderRadius: 'var(--r-xs)' } },
              { label: 'sm · 16px', style: { borderRadius: 'var(--r-sm)' } },
              { label: 'md · 18px', style: { borderRadius: 'var(--r-md)' } },
              { label: 'lg · 24px', style: { borderRadius: 'var(--r-lg)' } },
              { label: 'pill',      style: { borderRadius: 'var(--r-pill)' } },
            ].map(({ label, style }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className="h-12 w-full bg-[hsl(var(--accent-primary)/0.15)] border border-[hsl(var(--accent-primary)/0.3)]"
                  style={style}
                />
                <span className="text-[11px] font-mono text-[hsl(var(--label-tertiary))]">{label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
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
                <span className="text-[11px] font-mono text-[hsl(var(--label-tertiary))]">{label}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
