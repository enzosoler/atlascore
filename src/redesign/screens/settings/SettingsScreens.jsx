import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { SettingsShell, AppShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, Badge, Switch, Input, Avatar } from '../../ui';
import { ProfileHeader, SettingsGroup, SettingsRow, IntegrationTile, SubscriptionSummaryTile } from '../../modules';
import { ResetAccountDialog } from '../../overlays/ResetAccountDialog';
import { mockUser } from '../../lib/mock-data';

export function SettingsHub() {
  const [resetOpen, setResetOpen] = useState(false);
  const { logout } = useAuth();
  return (
    <AppShell current="settings" topBar={<PageHeader title="Settings" />}>
      <ProfileHeader user={mockUser} />
      <div className="mt-6 space-y-6">
        <SettingsGroup title="Account">
          <SettingsRow icon="👤" title="Profile"           subtitle="Name, email, units"     onClick={() => {}} />
          <SettingsRow icon="🔒" title="Privacy"           subtitle="Data controls"          onClick={() => {}} />
          <SettingsRow icon="💳" title="Subscription"      subtitle="Pro · renews May 14"    onClick={() => {}} />
        </SettingsGroup>
        <SettingsGroup title="Experience">
          <SettingsRow icon="🔔" title="Notifications" onClick={() => {}} />
          <SettingsRow icon="🌗" title="Appearance"    value="Dark"   onClick={() => {}} />
          <SettingsRow icon="🗣" title="Language"      value="English" onClick={() => {}} />
          <SettingsRow icon="🔌" title="Integrations"  subtitle="HealthKit, Whoop…" onClick={() => {}} />
        </SettingsGroup>
        <SettingsGroup title="Data">
          <SettingsRow icon="⬇" title="Export data" onClick={() => {}} />
          <SettingsRow
            icon="↻"
            title="Start fresh"
            subtitle="Wipe logs, keep biometrics + Pro. Redo onboarding."
            destructive
            onClick={() => setResetOpen(true)}
          />
        </SettingsGroup>
        <SettingsGroup title="Danger zone">
          <SettingsRow icon="←" title="Sign out" onClick={() => logout?.()} />
          <SettingsRow icon="✕" title="Delete account" destructive onClick={() => {}} />
        </SettingsGroup>
      </div>

      <ResetAccountDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </AppShell>
  );
}

export function AccountSettings() {
  return (
    <SettingsShell current="/app/settings/account">
      <Card><CardBody className="space-y-3">
        <Input label="Name"  defaultValue={mockUser.name} />
        <Input label="Email" defaultValue={mockUser.email} />
        <Input label="Locale" defaultValue="English" />
      </CardBody></Card>
    </SettingsShell>
  );
}

export function NotificationSettings() {
  return (
    <SettingsShell current="/app/settings/notifications">
      <SettingsGroup title="Reminders">
        <SettingsRow title="Daily check-in" trailing={<Switch checked onChange={() => {}} />} />
        <SettingsRow title="Workout time"   trailing={<Switch checked onChange={() => {}} />} />
        <SettingsRow title="Meal reminders" trailing={<Switch onChange={() => {}} />} />
      </SettingsGroup>
      <div className="mt-6">
        <SettingsGroup title="Coach">
          <SettingsRow title="Insights"      subtitle="New proactive recommendations"  trailing={<Switch checked onChange={() => {}} />} />
          <SettingsRow title="Weekly review" subtitle="Sunday digest"                   trailing={<Switch checked onChange={() => {}} />} />
        </SettingsGroup>
      </div>
    </SettingsShell>
  );
}

export function PrivacySettings() {
  return (
    <SettingsShell current="/app/settings/privacy">
      <SettingsGroup title="Data sharing">
        <SettingsRow title="Share anonymized usage"  subtitle="Helps us improve the product" trailing={<Switch onChange={() => {}} />} />
        <SettingsRow title="Analytics" subtitle="PostHog usage metrics" trailing={<Switch checked onChange={() => {}} />} />
      </SettingsGroup>
    </SettingsShell>
  );
}

export function AppearanceSettings() {
  return (
    <SettingsShell current="/app/settings/appearance">
      <SettingsGroup title="Theme">
        <SettingsRow title="Dark"   trailing={<Badge tone="accent">Active</Badge>} />
        <SettingsRow title="Light"  />
        <SettingsRow title="System" />
      </SettingsGroup>
    </SettingsShell>
  );
}

export function Integrations() {
  const items = [
    { name: 'Apple Health', description: 'Sync activity, sleep, and workouts.',  icon: '♥', connected: true },
    { name: 'Whoop',        description: 'Bring in recovery + strain.',          icon: 'W', connected: false },
    { name: 'Oura',         description: 'Sleep + readiness.',                   icon: 'O', connected: false },
    { name: 'Garmin',       description: 'Activity + HR.',                        icon: 'G', connected: false },
    { name: 'MyFitnessPal', description: 'Import food history.',                  icon: 'M', connected: false },
    { name: 'Strava',       description: 'Sync running and cycling.',             icon: 'S', connected: true  },
  ];
  return (
    <SettingsShell current="/app/settings/integrations">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((i) => <IntegrationTile key={i.name} {...i} onToggle={() => {}} />)}
      </div>
    </SettingsShell>
  );
}

export function LanguageSettings() {
  return (
    <SettingsShell current="/app/settings/language">
      <SettingsGroup title="Language" description="We currently support English and Portuguese (Brazil). More coming.">
        <SettingsRow title="English"                 trailing={<Badge tone="accent">Active</Badge>} />
        <SettingsRow title="Português (Brasil)"      trailing={<Badge tone="neutral" size="xs">Partial</Badge>} />
      </SettingsGroup>
    </SettingsShell>
  );
}

export function DataExport() {
  return (
    <SettingsShell current="/app/settings/data">
      <Card><CardBody>
        <p className="text-rd-h4 text-rd-fg">Export your data</p>
        <p className="mt-1 text-[13px] text-rd-fg-muted">We\'ll email you a JSON bundle of everything within 24 hours.</p>
        <div className="mt-4"><Button intent="primary" size="md">Request export</Button></div>
      </CardBody></Card>
    </SettingsShell>
  );
}

export function DangerZone() {
  const [resetOpen, setResetOpen] = useState(false);
  const { logout } = useAuth();
  return (
    <SettingsShell current="/app/settings/danger">
      <SettingsGroup title="Start fresh" description="For when you've drifted and want to begin again from zero.">
        <SettingsRow
          icon="↻"
          title="Reset account"
          subtitle="Wipe all logs, keep your biometrics + Pro. Redo onboarding."
          destructive
          onClick={() => setResetOpen(true)}
        />
      </SettingsGroup>
      <div className="mt-6">
        <SettingsGroup title="Session">
          <SettingsRow title="Sign out" onClick={() => logout?.()} />
        </SettingsGroup>
      </div>
      <div className="mt-6">
        <SettingsGroup title="Permanent">
          <SettingsRow
            icon="✕"
            title="Delete account"
            subtitle="All data removed within 30 days. This cannot be undone."
            destructive
            onClick={() => { /* TODO: wire DeleteAccountDialog — edge fn admin-delete-user */ }}
          />
        </SettingsGroup>
      </div>

      <ResetAccountDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </SettingsShell>
  );
}

export function Profile() {
  return (
    <AppShell current="settings" topBar={<PageHeader title="Profile" />}>
      <ProfileHeader user={mockUser} />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[['Streak','23 days'],['Workouts this month','14'],['Member since','Nov 2025']].map(([l, v]) => (
          <Card key={l}><CardBody>
            <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{l}</p>
            <p className="mt-1 text-rd-metric-md text-rd-fg rd-tnum">{v}</p>
          </CardBody></Card>
        ))}
      </div>
    </AppShell>
  );
}

export function ProfileEdit() {
  return <AccountSettings />;
}
