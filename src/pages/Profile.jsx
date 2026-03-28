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

  const displayName = user?.full_name || user?.email || 'User';
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
        <MenuSection title="Your Plan">
          <MenuRow
            to={ROUTES.goals}
            icon={Target}
            label="Goals & Targets"
            sublabel="Nutrition targets, goal weight, macros"
          />
          <MenuRow
            to={ROUTES.plan}
            icon={Target}
            label="Training Plan"
            sublabel="Active plan and schedule"
          />
        </MenuSection>

        {/* Health */}
        <MenuSection title="Health">
          <MenuRow
            to={ROUTES.labExams}
            icon={FlaskConical}
            label="Lab Results"
            sublabel="Blood work, hormones, markers"
          />
          <MenuRow
            to={ROUTES.protocols}
            icon={Pill}
            label="Protocols & Hormones"
            sublabel="TRT, supplements, compounds"
          />
        </MenuSection>

        {/* Account */}
        <MenuSection title="Account">
          <MenuRow
            to={ROUTES.account}
            icon={User}
            label="Account"
            sublabel="Email, password, profile"
          />
          <MenuRow
            to={ROUTES.pricing}
            icon={CreditCard}
            label="Subscription"
            sublabel="Manage your plan"
          />
          <MenuRow
            to="/notifications"
            icon={Bell}
            label="Notifications"
          />
        </MenuSection>

        {/* App */}
        <MenuSection title="App">
          <MenuRow
            to={ROUTES.settings}
            icon={Settings}
            label="Settings"
            sublabel="Theme, language, preferences"
          />
          <MenuRow
            to={ROUTES.export}
            icon={Download}
            label="Export Data"
          />
          <MenuRow
            to={ROUTES.help}
            icon={HelpCircle}
            label="Help & Support"
          />
        </MenuSection>

        {/* Logout */}
        <MenuSection>
          <MenuRow
            onClick={() => logout()}
            icon={LogOut}
            label="Sign Out"
            destructive
          />
        </MenuSection>

      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <SafePageBoundary
      title="More"
      subtitle="Settings and account"
      fallbackDescription="The More screen opened in safe mode."
    >
      <MoreContent />
    </SafePageBoundary>
  );
}
