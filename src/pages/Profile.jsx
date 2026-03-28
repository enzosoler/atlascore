/**
 * More — Control Center
 *
 * Clean list-based hub for account, goals, health, settings, and logout.
 * Replaces the old summary-card Profile page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  CreditCard,
  Download,
  FlaskConical,
  HelpCircle,
  LogOut,
  Pill,
  Settings,
  Target,
  User,
} from 'lucide-react';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { useRBAC, ROLE_LABELS } from '@/lib/rbac';
import { ROUTES } from '@/lib/routes';
import { useT } from '@/lib/i18nContext';

// ─── Row component ─────────────────────────────────────────────────────────────

function MenuRow({ to, icon: Icon, label, sublabel, badge, onClick, destructive }) {
  const content = (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors ${
      destructive
        ? 'active:bg-[hsl(var(--err)/0.08)]'
        : 'active:bg-[hsl(var(--fill)/0.6)]'
    }`}>
      <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
        destructive
          ? 'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]'
          : 'bg-[hsl(var(--fill)/0.8)] text-[hsl(var(--fg-2))]'
      }`}>
        <Icon className="w-4 h-4" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold tracking-[-0.01em] ${
          destructive ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]'
        }`}>{label}</p>
        {sublabel && (
          <p className="text-[12px] text-[hsl(var(--fg-3))] mt-0.5 leading-4">{sublabel}</p>
        )}
      </div>
      {badge && (
        <span className="text-[11px] font-semibold text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] border border-[hsl(var(--brand)/0.2)] rounded-full px-2 py-0.5 shrink-0">
          {badge}
        </span>
      )}
      {!destructive && (
        <ChevronRight className="w-4 h-4 text-[hsl(var(--fg-3))] shrink-0" strokeWidth={1.8} />
      )}
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
  }
  return <Link to={to}>{content}</Link>;
}

// ─── Section ───────────────────────────────────────────────────────────────────

function MenuSection({ title, children }) {
  return (
    <div>
      {title && (
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] px-4 mb-1.5">
          {title}
        </p>
      )}
      <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] overflow-hidden divide-y divide-[hsl(var(--border)/0.5)]">
        {children}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function MoreContent() {
  const { user, logout } = useAuth();
  const { role } = useRBAC(user);
  const t = useT();

  const displayName = user?.full_name || user?.email || t('profile.more.fallbackUser');
  const email = user?.email || '';
  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <div className="min-h-full bg-[hsl(var(--bg))]">
      <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">

        {/* Identity card */}
        <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--brand)/0.12)] flex items-center justify-center text-[hsl(var(--brand))]">
              <User className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))] truncate">
                {displayName}
              </p>
              <p className="text-[13px] text-[hsl(var(--fg-3))] truncate">{email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] border border-[hsl(var(--brand)/0.2)] rounded-full px-2 py-0.5">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Your Plan */}
        <MenuSection title={t('profile.more.sectionYourPlan')}>
          <MenuRow
            to={ROUTES.goals}
            icon={Target}
            label={t('profile.more.goalsAndTargets')}
            sublabel={t('profile.more.goalsAndTargetsDesc')}
          />
          <MenuRow
            to={ROUTES.plan}
            icon={Target}
            label={t('profile.more.trainingPlan')}
            sublabel={t('profile.more.trainingPlanDesc')}
          />
        </MenuSection>

        {/* Health */}
        <MenuSection title={t('profile.more.sectionHealth')}>
          <MenuRow
            to={ROUTES.labExams}
            icon={FlaskConical}
            label={t('profile.more.labResults')}
            sublabel={t('profile.more.labResultsDesc')}
          />
          <MenuRow
            to={ROUTES.protocols}
            icon={Pill}
            label={t('profile.more.protocolsAndHormones')}
            sublabel={t('profile.more.protocolsAndHormonesDesc')}
          />
        </MenuSection>

        {/* Account */}
        <MenuSection title={t('profile.more.sectionAccount')}>
          <MenuRow
            to={ROUTES.account}
            icon={User}
            label={t('profile.more.account')}
            sublabel={t('profile.more.accountDesc')}
          />
          <MenuRow
            to={ROUTES.pricing}
            icon={CreditCard}
            label={t('profile.more.subscription')}
            sublabel={t('profile.more.subscriptionDesc')}
          />
          <MenuRow
            to="/notifications"
            icon={Bell}
            label={t('profile.more.notifications')}
          />
        </MenuSection>

        {/* App */}
        <MenuSection title={t('profile.more.sectionApp')}>
          <MenuRow
            to={ROUTES.settings}
            icon={Settings}
            label={t('profile.more.settings')}
            sublabel={t('profile.more.settingsDesc')}
          />
          <MenuRow
            to={ROUTES.export}
            icon={Download}
            label={t('profile.more.exportData')}
          />
          <MenuRow
            to={ROUTES.help}
            icon={HelpCircle}
            label={t('profile.more.helpAndSupport')}
          />
        </MenuSection>

        {/* Logout */}
        <MenuSection>
          <MenuRow
            onClick={() => logout()}
            icon={LogOut}
            label={t('profile.more.signOut')}
            destructive
          />
        </MenuSection>

      </div>
    </div>
  );
}

export default function Profile() {
  const t = useT();
  return (
    <SafePageBoundary
      title={t('profile.more.title')}
      subtitle={t('profile.more.subtitle')}
      fallbackDescription={t('profile.more.fallbackDescription')}
    >
      <MoreContent />
    </SafePageBoundary>
  );
}
