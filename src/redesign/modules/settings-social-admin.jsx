import React from 'react';
import { Card, CardBody, Button, Badge, ListRow, Switch, Avatar, Divider } from '../ui';
import { cn } from '../lib/cn';

/** Settings — Things 3 calm + iOS grouped rows. */
export function SettingsGroup({ title, description, children }) {
  return (
    <section className="space-y-2">
      {title && (
        <div className="px-1">
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">{title}</p>
          {description && <p className="mt-1 text-[13px] text-rd-fg-muted">{description}</p>}
        </div>
      )}
      <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
        {children}
      </div>
    </section>
  );
}

export function SettingsRow({ icon, title, subtitle, value, onClick, destructive, trailing }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        onClick && 'hover:bg-rd-surface-2',
        destructive && 'text-rd-danger',
      )}
    >
      {icon && <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-rd-sm',
        destructive ? 'bg-rd-danger-muted text-rd-danger' : 'bg-rd-surface-2 text-rd-fg-secondary')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        {subtitle && <span className="block text-[12px] text-rd-fg-muted">{subtitle}</span>}
      </span>
      {trailing ?? (value != null && <span className="text-[13px] text-rd-fg-muted rd-tnum">{value}</span>)}
      {onClick && !trailing && <span aria-hidden className="text-rd-fg-muted">›</span>}
    </button>
  );
}

export function ProfileHeader({ user, onEdit }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <Avatar name={user.name} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="text-rd-h3 text-rd-fg truncate">{user.name}</p>
          <p className="text-[13px] text-rd-fg-muted truncate">{user.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge tone="premium" size="xs">{user.plan}</Badge>
            <Badge tone="neutral" size="xs">Since Nov 2025</Badge>
          </div>
        </div>
        <Button intent="secondary" size="sm" onClick={onEdit}>Edit</Button>
      </CardBody>
    </Card>
  );
}

export function IntegrationTile({ name, connected, description, icon, onToggle }) {
  return (
    <Card interactive onClick={onToggle}>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-rd-card bg-rd-surface-2 text-xl">{icon}</div>
          <Badge tone={connected ? 'success' : 'neutral'} size="xs">{connected ? 'Connected' : 'Connect'}</Badge>
        </div>
        <p className="mt-3 text-[14px] font-medium text-rd-fg">{name}</p>
        <p className="mt-0.5 text-[12px] text-rd-fg-muted">{description}</p>
      </CardBody>
    </Card>
  );
}

/** Social — Strava share-card composer. */
export function ShareCardPreview({ title, stats, theme = 'dark' }) {
  return (
    <div className={cn(
      'aspect-[4/5] w-full overflow-hidden rounded-rd-card p-6 text-white',
      'bg-[radial-gradient(600px_400px_at_80%_10%,rgba(0,255,255,0.20),transparent),linear-gradient(145deg,#05070A,#141A22)]',
    )}>
      <div className="flex items-center gap-2">
        <img src="/branding/dark/logo.svg" alt="" width="18" height="18" className="h-[18px] w-[18px]" />
        <span className="text-[12px] uppercase tracking-[0.08em] text-white/70">atlas.core</span>
      </div>
      <h3 className="mt-16 text-3xl font-bold leading-tight">{title}</h3>
      <ul className="mt-8 space-y-4">
        {stats.map((s) => (
          <li key={s.label} className="flex items-baseline justify-between">
            <span className="text-[13px] uppercase tracking-[0.08em] text-white/60">{s.label}</span>
            <span className="text-2xl font-semibold rd-tnum">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReferralStatsCard({ invites, joined, earnings }) {
  return (
    <Card>
      <CardBody>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Invites sent" value={invites} />
          <Stat label="Joined"       value={joined} />
          <Stat label="Earned"       value={`$${earnings}`} />
        </div>
      </CardBody>
    </Card>
  );
}
function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{label}</p>
      <p className="mt-0.5 text-rd-metric-md text-rd-fg rd-tnum">{value}</p>
    </div>
  );
}

export function CreatorCodeEntry({ code, onApply, valid, error }) {
  return (
    <div className="flex items-end gap-2">
      <input
        value={code}
        readOnly
        className="h-11 flex-1 rounded-rd-control border border-rd-border bg-rd-surface px-3 text-[14px] text-rd-fg uppercase tracking-[0.08em] outline-none rd-tnum"
      />
      <Button intent="primary" size="md" onClick={onApply}>Apply</Button>
      {valid && <Badge tone="success">Applied</Badge>}
      {error && <p className="text-[12px] text-rd-danger">{error}</p>}
    </div>
  );
}

/** Admin — Linear-like tables, minimal. */
export function AdminTable({ columns, rows, onRowClick }) {
  return (
    <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-rd-border">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2.5 text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rd-border">
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onRowClick?.(r)} className={onRowClick ? 'cursor-pointer hover:bg-rd-surface-2' : undefined}>
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2.5 text-rd-fg rd-tnum">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AuditRow({ event }) {
  const toneMap = { success: 'success', warn: 'warning', error: 'danger', info: 'neutral' };
  return (
    <div className="grid grid-cols-[100px_80px_1fr_160px] items-center gap-3 px-4 py-2 text-[13px] font-mono">
      <span className="text-rd-fg-muted rd-tnum">{event.ts}</span>
      <Badge tone={toneMap[event.level] || 'neutral'} size="xs">{event.level}</Badge>
      <span className="truncate text-rd-fg">{event.actor} · {event.action}</span>
      <span className="truncate text-right text-rd-fg-muted">{event.target}</span>
    </div>
  );
}
