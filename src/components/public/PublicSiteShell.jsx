import React from 'react';
import { Link } from 'react-router-dom';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import ThemeToggleButton from '@/components/shared/ThemeToggleButton';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';

const FOOTER_LINKS = {
  en: [
    { href: ROUTES.home, label: 'Home' },
    { href: ROUTES.blog, label: 'Blog' },
    { href: ROUTES.pricing, label: 'Pricing' },
    { href: ROUTES.help, label: 'Help' },
    { href: `${ROUTES.auth}?mode=login`, label: 'Login' },
  ],
  'pt-BR': [
    { href: ROUTES.home, label: 'Início' },
    { href: ROUTES.blog, label: 'Blog' },
    { href: ROUTES.pricing, label: 'Planos' },
    { href: ROUTES.help, label: 'Ajuda' },
    { href: `${ROUTES.auth}?mode=login`, label: 'Entrar' },
  ],
};

const FOOTER_TAGLINE = {
  en: 'Calm, connected tracking for real-world performance.',
  'pt-BR': 'Acompanhamento calmo e conectado para performance real.',
};

const SUBTITLE = {
  en: 'Performance OS',
  'pt-BR': 'Sistema de Performance',
};

/**
 * Language toggle button — compact pill that switches between EN and PT-BR.
 */
export function LanguageToggle({ className = '' }) {
  let locale = 'en';
  let switchLocale = () => {};
  try {
    const i18n = useI18n();
    locale = i18n.locale || 'en';
    switchLocale = i18n.switchLocale;
  } catch (e) {
    // fallback if not in I18nProvider
  }

  const isPt = locale === 'pt-BR';
  const nextLocale = isPt ? 'en' : 'pt-BR';
  const label = isPt ? 'EN' : 'PT';

  return (
    <button
      onClick={() => switchLocale(nextLocale)}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.56)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]',
        className
      )}
      title={isPt ? 'Switch to English' : 'Mudar para Português'}
    >
      {label}
    </button>
  );
}

export function PublicLanguageSwitcher({ className = '', align = 'end' }) {
  return <LanguageToggle className={className} />;
}

export function PublicSectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}) {
  const centered = align === 'center';

  return (
    <div className={cn(centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl', className)}>
      {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
      <div className={cn(eyebrow ? 'mt-4' : '')}>
        <h2 className="atlas-display-title whitespace-pre-line text-[clamp(2rem,1.4rem+1.2vw,3rem)]">{title}</h2>
        {description ? (
          <p className="atlas-public-copy mt-4 max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PublicNav({ links = [], actions, compact = false }) {
  let locale = 'en';
  try {
    const i18n = useI18n();
    locale = i18n.locale || 'en';
  } catch (e) {
    // fallback if not in I18nProvider
  }

  return (
    <header className="atlas-public-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link
          to={ROUTES.home}
          className="flex min-w-0 items-center gap-3 text-[hsl(var(--fg))] transition-opacity hover:opacity-80"
        >
          <AtlasCoreLogoSVG width={32} className="shrink-0 block" />
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] sm:text-[20px]">
              <span className="text-[hsl(var(--accent-primary))]">atlas</span><span className="font-light">.core</span>
            </p>
            <p className="hidden truncate text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] sm:block">{SUBTITLE[locale] || SUBTITLE.en}</p>
          </div>
        </Link>

        {!compact && links.length > 0 ? (
          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[hsl(var(--fg-2))] transition-all hover:text-[hsl(var(--accent-primary))] hover:tracking-[0.06em]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[hsl(var(--fg-2))] transition-all hover:text-[hsl(var(--accent-primary))] hover:tracking-[0.06em]"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggleButton compact className="sm:hidden" />
          <ThemeToggleButton className="hidden sm:inline-flex" />
          {actions}
        </div>
      </div>
    </header>
  );
}

export default function PublicSiteShell({
  children,
  navLinks = [],
  actions,
  compactNav = false,
  showFooter = true,
  footerLinks,
  mainClassName = '',
}) {
  let locale = 'en';
  try {
    const i18n = useI18n();
    locale = i18n.locale || 'en';
  } catch (e) {
    // fallback if not in I18nProvider
  }

  const resolvedFooterLinks = footerLinks || FOOTER_LINKS[locale] || FOOTER_LINKS.en;
  const tagline = FOOTER_TAGLINE[locale] || FOOTER_TAGLINE.en;

  return (
    <div className="atlas-public-shell">
      {/* Primary brand halo — top center */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,hsla(var(--tint),0.13),transparent_62%)]" />
      {/* Secondary accent — top right corner */}
      <div className="pointer-events-none absolute right-[-8rem] top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,hsla(var(--sys-purple),0.07),transparent_65%)] blur-3xl" />
      {/* Tertiary warm accent — bottom left */}
      <div className="pointer-events-none absolute left-[-6rem] top-[60vh] h-72 w-72 rounded-full bg-[radial-gradient(circle,hsla(var(--tint),0.06),transparent_70%)] blur-3xl" />

      <div className="relative z-10">
        <PublicNav links={navLinks} actions={actions} compact={compactNav} />

        <main className={cn('pb-20', mainClassName)}>{children}</main>

        {showFooter ? (
          <footer className="relative border-t border-[hsl(var(--border)/0.7)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="space-y-1">
                <p className="text-[16px] font-semibold tracking-[-0.02em]">
                  <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[hsl(var(--fg-2))]">
                {resolvedFooterLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    to={link.href}
                    className="transition-colors hover:text-[hsl(var(--fg))]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
