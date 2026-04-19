import React from 'react';
import { AdminShell } from '../../layouts';
import { Card, CardBody, Badge, Button, SectionHeader } from '../../ui';
import { AdminTable, AuditRow } from '../../modules';

export function AdminHome() {
  return (
    <AdminShell current="/admin">
      <h1 className="text-rd-h1 text-rd-fg">Overview</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[['MAU','8,420','+4.2% wk'],['Pro subs','1,249','+18 net'],['Trials','312','62% convert'],['Churn','2.4%','−0.3pp']].map(([l, v, d]) => (
          <Card key={l}><CardBody>
            <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{l}</p>
            <p className="mt-1 text-rd-metric-md text-rd-fg rd-tnum">{v}</p>
            <p className="mt-0.5 text-[11px] text-rd-fg-muted">{d}</p>
          </CardBody></Card>
        ))}
      </div>
      <SectionHeader className="mt-8" title="Recent audit events" />
      <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
        {[
          { ts: '18:22', level: 'info', actor: 'enzo@…', action: 'login',                       target: 'web:Chrome' },
          { ts: '18:19', level: 'warn', actor: 'system', action: 'stripe-webhook retry',        target: 'cus_OaB…' },
          { ts: '18:14', level: 'info', actor: 'admin:m@', action: 'updated feature flag',       target: 'labs_v2' },
        ].map((e, i) => <AuditRow key={i} event={e} />)}
      </div>
    </AdminShell>
  );
}

export function AdminUsers() {
  const rows = Array.from({ length: 10 }, (_, i) => ({
    id: `u${i}`, email: `user${i + 1}@example.com`, plan: i % 3 === 0 ? 'free' : 'pro', status: 'active', joined: 'Jan 2026',
  }));
  return (
    <AdminShell current="/admin/users">
      <h1 className="text-rd-h1 text-rd-fg">Users</h1>
      <div className="mt-6">
        <AdminTable
          columns={[
            { key: 'email',  label: 'Email' },
            { key: 'plan',   label: 'Plan',   render: (r) => <Badge tone={r.plan === 'pro' ? 'premium' : 'neutral'} size="xs">{r.plan}</Badge> },
            { key: 'status', label: 'Status' },
            { key: 'joined', label: 'Joined' },
          ]}
          rows={rows}
          onRowClick={() => {}}
        />
      </div>
    </AdminShell>
  );
}

export function AdminSubscriptions() {
  return (
    <AdminShell current="/admin/subscriptions">
      <h1 className="text-rd-h1 text-rd-fg">Subscriptions</h1>
      <AdminTable
        columns={[
          { key: 'id',       label: 'ID' },
          { key: 'user',     label: 'User' },
          { key: 'platform', label: 'Platform' },
          { key: 'mrr',      label: 'MRR' },
          { key: 'status',   label: 'Status' },
        ]}
        rows={Array.from({ length: 6 }, (_, i) => ({ id: `sub_${i}`, user: `u${i}@x`, platform: i % 2 ? 'Stripe' : 'RevenueCat', mrr: '$9.99', status: 'active' }))}
      />
    </AdminShell>
  );
}

export function AdminAudit() {
  return (
    <AdminShell current="/admin/audit">
      <h1 className="text-rd-h1 text-rd-fg">Audit</h1>
      <div className="mt-6 overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
        {Array.from({ length: 20 }, (_, i) => (
          <AuditRow key={i} event={{ ts: `18:${(22 - i).toString().padStart(2, '0')}`, level: ['info','warn','error','info'][i % 4], actor: 'system', action: 'webhook received', target: `evt_${i}` }} />
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminFeatureFlags() {
  return (
    <AdminShell current="/admin/flags">
      <h1 className="text-rd-h1 text-rd-fg">Feature flags</h1>
      <AdminTable
        columns={[
          { key: 'key', label: 'Flag' }, { key: 'rollout', label: 'Rollout' }, { key: 'owner', label: 'Owner' },
        ]}
        rows={[
          { id: '1', key: 'labs_v2',         rollout: '50%',    owner: 'product' },
          { id: '2', key: 'coach_proactive', rollout: '100%',   owner: 'coach'   },
          { id: '3', key: 'meal_plan_ai',    rollout: '10%',    owner: 'nutrition' },
        ]}
      />
    </AdminShell>
  );
}

export function AdminAnalytics() {
  return (
    <AdminShell current="/admin/analytics">
      <h1 className="text-rd-h1 text-rd-fg">Analytics</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {['Retention D30','Feature adoption','Funnel'].map((t) => (
          <Card key={t}><CardBody>
            <p className="text-rd-h4 text-rd-fg">{t}</p>
            <div className="mt-3 aspect-[16/9] rounded-rd-md bg-rd-surface-2" />
          </CardBody></Card>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminSettings() {
  return (
    <AdminShell current="/admin/settings">
      <h1 className="text-rd-h1 text-rd-fg">Settings</h1>
      <div className="mt-6 space-y-3">
        <Card><CardBody><p className="text-[14px] text-rd-fg-secondary">Internal tooling options.</p></CardBody></Card>
      </div>
    </AdminShell>
  );
}

export function CoachProDashboard() {
  return (
    <AdminShell current="/pro/coach">
      <h1 className="text-rd-h1 text-rd-fg">Coach dashboard</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {['Active clients','Programs shipped','Messages unread'].map((l, i) => (
          <Card key={l}><CardBody>
            <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{l}</p>
            <p className="mt-1 text-rd-metric-md text-rd-fg rd-tnum">{[24, 89, 3][i]}</p>
          </CardBody></Card>
        ))}
      </div>
    </AdminShell>
  );
}
export function NutritionistDashboard() { return <CoachProDashboard />; }
export function ClinicianDashboard()    { return <CoachProDashboard />; }
