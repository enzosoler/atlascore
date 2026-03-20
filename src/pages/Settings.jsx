import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Moon,
  Sun,
  Monitor,
  User,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import {
  PageShell,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';

// ── Theme option button ───────────────────────────────────────────────────────

function ThemeOption({ icon: Icon, label, value, currentTheme, onSelect }) {
  const active = currentTheme === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'flex flex-1 flex-col items-center gap-2 rounded-[20px] border py-4 text-[13px] font-medium transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
      {label}
    </button>
  );
}

// ── Language option button ────────────────────────────────────────────────────

function LangOption({ code, label, flag, currentLocale, onSelect }) {
  const active = currentLocale === code;
  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      className={[
        'flex flex-1 items-center justify-center gap-2 rounded-[20px] border py-3.5 text-[13px] font-medium transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <span className="text-lg">{flag}</span>
      {label}
    </button>
  );
}

// ── Row link ──────────────────────────────────────────────────────────────────

function SettingsRow({ icon: Icon, label, description, href, onClick, destructive = false }) {
  const cls = [
    'flex w-full items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-5 py-4 text-left transition-all duration-200',
    destructive
      ? 'hover:border-[hsl(var(--err)/0.3)] hover:bg-[hsl(var(--err)/0.06)]'
      : 'hover:bg-[hsl(var(--fill)/0.72)]',
  ].join(' ');

  const inner = (
    <>
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border',
          destructive
            ? 'border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
            : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={[
            'text-[14px] font-semibold tracking-[-0.018em]',
            destructive ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]',
          ].join(' ')}
        >
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{description}</p>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
    </>
  );

  if (href) {
    return (
      <Link to={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

// ── Settings content ──────────────────────────────────────────────────────────

function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await logout?.();
    }
  };

  return (
    <PageShell
      title="Configurações"
      subtitle="Personalize sua experiência no Atlas Core."
      maxWidth="max-w-2xl"
    >
      {/* Account info */}
      <SectionCard
        title="Conta"
        subtitle="Informações da sua conta atual."
      >
        <div className="flex items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
            <User className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
              {user?.name || user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">{user?.email || '—'}</p>
          </div>
          <Link
            to={ROUTES.profile}
            className="ml-auto flex items-center gap-1.5 rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
          >
            Editar perfil
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard
        title="Aparência"
        subtitle="Escolha o tema da interface."
      >
        <div className="flex gap-3">
          <ThemeOption
            icon={Sun}
            label="Claro"
            value="light"
            currentTheme={theme}
            onSelect={setTheme}
          />
          <ThemeOption
            icon={Moon}
            label="Escuro"
            value="dark"
            currentTheme={theme}
            onSelect={setTheme}
          />
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard
        title="Idioma"
        subtitle="Selecione o idioma da interface."
      >
        <div className="flex gap-3">
          <LangOption
            code="pt-BR"
            label="Português"
            flag="🇧🇷"
            currentLocale={locale}
            onSelect={setLocale}
          />
          <LangOption
            code="en-US"
            label="English"
            flag="🇺🇸"
            currentLocale={locale}
            onSelect={setLocale}
          />
        </div>
        {locale === 'en-US' ? (
          <p className="mt-3 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            Note: blog posts and some legacy sections remain in Portuguese as they contain
            user-specific content.
          </p>
        ) : (
          <p className="mt-3 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            Nota: os posts do blog e algumas seções legadas permanecem no idioma original.
          </p>
        )}
      </SectionCard>

      {/* Other links */}
      <SectionCard
        title="Mais opções"
        subtitle="Acesse outras áreas da conta."
      >
        <div className="space-y-3">
          <SettingsRow
            icon={User}
            label="Meu Perfil"
            description="Dados pessoais, metas e informações biométricas."
            href={ROUTES.profile}
          />
          <SettingsRow
            icon={Shield}
            label="Privacidade e dados"
            description="Controle como seus dados são usados."
            href={ROUTES.export}
          />
          <SettingsRow
            icon={Bell}
            label="Ajuda e suporte"
            description="Central de ajuda, tutoriais e contato."
            href={ROUTES.help}
          />
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        title="Sair"
        subtitle="Encerrar sessão desta conta."
      >
        <SettingsRow
          icon={LogOut}
          label="Sair da conta"
          description="Você será redirecionado para a tela de login."
          onClick={handleLogout}
          destructive
        />
      </SectionCard>
    </PageShell>
  );
}

export default function Settings() {
  return (
    <SafePageBoundary
      title="Configurações"
      subtitle="Personalize sua experiência."
      maxWidth="max-w-2xl"
      fallbackDescription="Settings page encountered an error."
    >
      <SettingsContent />
    </SafePageBoundary>
  );
}
