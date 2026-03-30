/**
 * More — Control Center
 *
 * Clean list-based hub for account, goals, health, settings, and logout.
 * Replaces the old summary-card Profile page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
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
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${
      destructive
        ? 'active:bg-[hsl(var(--err)/0.06)]'
        : 'active:bg-[hsl(var(--fill)/0.5)]'
    }`}>
      <Icon className={`w-[18px] h-[18px] shrink-0 ${
        destructive ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg-3))]'
      }`} strokeWidth={1.7} />
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium ${
          destructive ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]'
        }`}>{label}</p>
        {sublabel && (
          <p className="text-[12px] text-[hsl(var(--fg-3))] mt-0.5 leading-4">{sublabel}</p>
        )}
      </div>
      {badge && (
        <span className="text-[11px] font-medium text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.06)] rounded-full px-2 py-0.5 shrink-0">
          {badge}
        </span>
      )}
      {!destructive && (
        <ChevronRight className="w-4 h-4 text-[hsl(var(--fg-3)/0.5)] shrink-0" strokeWidth={1.5} />
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
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))] px-4 mb-2">
          {title}
        </p>
      )}
      <div className="rounded-2xl bg-[hsl(var(--card))] overflow-hidden divide-y divide-[hsl(var(--border)/0.3)]">
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

        {/* Identity */}
        <div className="px-1 py-2">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[hsl(var(--fill)/0.8)] flex items-center justify-center text-[hsl(var(--fg-2))]">
              <User className="w-5 h-5" strokeWidth={1.7} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] truncate">
                {displayName}
              </p>
              <p className="text-[13px] text-[hsl(var(--fg-3))] truncate">{email}</p>
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
            to={ROUTES.bodyProfile}
            icon={Activity}
            label={t('profile.more.bodyProfile')}
            sublabel={t('profile.more.bodyProfileDesc')}
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
