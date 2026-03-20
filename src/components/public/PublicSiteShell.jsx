import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Globe } from 'lucide-react';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggleButton from '@/components/shared/ThemeToggleButton';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';

const DEFAULT_FOOTER_LINKS = [
  { href: ROUTES.home, label: 'Home' },
  { href: ROUTES.blog, label: 'Blog' },
  { href: ROUTES.pricing, label: 'Pricing' },
  { href: ROUTES.help, label: 'Help' },
  { href: `${ROUTES.auth}?mode=login`, label: 'Login' },
];

export function PublicLanguageSwitcher({ className = '', align = 'end' }) {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const currentLanguageLabel = language === 'pt-BR' ? 'PT' : 'EN';

  const handleLanguageSelect = React.useCallback((nextLanguage) => {
    setOpen(false);

    if (nextLanguage === language) return;

    if (typeof window === 'undefined') {
      setLanguage(nextLanguage);
      return;
    }

    window.requestAnimationFrame(() => {
      setLanguage(nextLanguage);
    });
  }, [language, setLanguage]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change language"
          className={cn(
            'atlas-button atlas-button-secondary h-10 rounded-full px-3.5 text-[12px] shadow-[var(--shadow-xs)]',
            className
          )}
        >
          <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>{currentLanguageLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={10}
        className="atlas-popover-panel w-44 p-1.5"
      >
        <DropdownMenuItem
          onSelect={() => handleLanguageSelect('pt-BR')}
          className={cn(
            'rounded-[14px] px-3 py-2 text-[13px]',
            language === 'pt-BR'
              ? 'bg-[hsl(var(--fill))] text-[hsl(var(--fg))]'
              : 'text-[hsl(var(--fg-2))]'
          )}
        >
          <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span>Português</span>
            <span className="text-[12px] text-[hsl(var(--fg-3))]">PT</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => handleLanguageSelect('en-US')}
          className={cn(
            'rounded-[14px] px-3 py-2 text-[13px]',
            language === 'en-US'
              ? 'bg-[hsl(var(--fill))] text-[hsl(var(--fg))]'
              : 'text-[hsl(var(--fg-2))]'
          )}
        >
          <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span>English</span>
            <span className="text-[12px] text-[hsl(var(--fg-3))]">EN</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  return (
    <header className="atlas-public-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link
          to={ROUTES.home}
          className="flex min-w-0 items-center gap-3 text-[hsl(var(--fg))] transition-opacity hover:opacity-80"
        >
          <AtlasCoreLogoSVG width={48} height={24} className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold tracking-[-0.02em]">
              <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core
            </p>
            <p className="truncate text-[11px] text-[hsl(var(--fg-3))]">Performance operating system</p>
          </div>
        </Link>

        {!compact && links.length > 0 ? (
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2.5">
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
  footerLinks = DEFAULT_FOOTER_LINKS,
  mainClassName = '',
}) {
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
                  Calm, connected tracking for real-world performance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[hsl(var(--fg-2))]">
                {footerLinks.map((link) => (
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
