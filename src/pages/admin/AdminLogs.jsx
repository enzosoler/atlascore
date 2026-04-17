import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { AlertTriangle, FileText, MessageCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'errors',  label: 'Errors',    icon: AlertTriangle },
  { id: 'audit',   label: 'Audit Log', icon: FileText },
  { id: 'support', label: 'Support',   icon: MessageCircle },
];

/* ---------- Shared inline states ---------- */
function InlineLoading() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-[hsl(var(--fg-3))]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
    </div>
  );
}

function InlineEmpty({ text }) {
  return <p className="py-10 text-center text-[12px] text-[hsl(var(--fg-3))]">{text}</p>;
}

/* ---------- Errors Tab ---------- */
function ErrorsTab() {
  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
  });

  if (isLoading) return <InlineLoading />;
  if (errors.length === 0) return <InlineEmpty text="No errors logged." />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] tabular-nums text-[hsl(var(--fg-3))]">{errors.length} errors</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--fg-3))] transition hover:text-[hsl(var(--fg))]"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto rounded-[10px] border border-[hsl(var(--border)/0.5)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--fill)/0.4)]">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Message</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Component</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">User</th>
              <th className="w-[100px] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.25)]">
            {errors.map((e) => (
              <tr key={e.id} className="group transition hover:bg-[hsl(var(--fill)/0.35)]">
                <td className="max-w-[300px] px-3 py-2">
                  <p className="truncate text-[12px] font-medium text-[hsl(var(--fg))]">{e.message || e.error_message || 'Unknown'}</p>
                  {e.stack && (
                    <pre className="mt-1 hidden max-h-16 overflow-auto rounded-[6px] bg-[hsl(var(--fill)/0.5)] px-2 py-1 text-[10px] text-[hsl(var(--fg-3))] group-hover:block">
                      {e.stack}
                    </pre>
                  )}
                </td>
                <td className="px-3 py-2 text-[11px] text-[hsl(var(--fg-3))]">{e.component || e.route || '\u2014'}</td>
                <td className="px-3 py-2 text-[11px] font-mono text-[hsl(var(--fg-3))]">{e.user_id ? e.user_id.slice(0, 8) : '\u2014'}</td>
                <td className="px-3 py-2 text-[11px] tabular-nums text-[hsl(var(--fg-3))]">
                  {e.created_at ? format(new Date(e.created_at), 'MMM d HH:mm') : '\u2014'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Audit Tab ---------- */
function AuditTab() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
  });

  if (isLoading) return <InlineLoading />;
  if (logs.length === 0) return <InlineEmpty text="No audit logs." />;

  return (
    <div className="overflow-x-auto rounded-[10px] border border-[hsl(var(--border)/0.5)]">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--fill)/0.4)]">
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Action</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Admin</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Target</th>
            <th className="w-[100px] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border)/0.25)]">
          {logs.map((l) => (
            <tr key={l.id} className="transition hover:bg-[hsl(var(--fill)/0.35)]">
              <td className="px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg))]">{l.action}</td>
              <td className="px-3 py-2 text-[11px] text-[hsl(var(--fg-2))]">{l.admin_email || l.admin_id?.slice(0, 8) || '\u2014'}</td>
              <td className="px-3 py-2 text-[11px] font-mono text-[hsl(var(--fg-3))]">{l.target_user_id?.slice(0, 8) || '\u2014'}</td>
              <td className="px-3 py-2 text-[11px] tabular-nums text-[hsl(var(--fg-3))]">
                {l.created_at ? format(new Date(l.created_at), 'MMM d HH:mm') : '\u2014'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Support Tab ---------- */
function SupportTab() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('support_requests').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <InlineLoading />;
  if (tickets.length === 0) return <InlineEmpty text="No support requests." />;

  const typeStyle = {
    bug: 'bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]',
    feature: 'bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
    help: 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
    contact: 'bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-3))]',
  };

  return (
    <div className="overflow-x-auto rounded-[10px] border border-[hsl(var(--border)/0.5)]">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--fill)/0.4)]">
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Type</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">User</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Message</th>
            <th className="w-[100px] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border)/0.25)]">
          {tickets.map((t) => (
            <tr key={t.id} className="transition hover:bg-[hsl(var(--fill)/0.35)]">
              <td className="px-3 py-2">
                <span className={cn('rounded-[5px] px-1.5 py-0.5 text-[9px] font-semibold', typeStyle[t.type] || typeStyle.contact)}>
                  {t.type}
                </span>
              </td>
              <td className="px-3 py-2 text-[11px] text-[hsl(var(--fg-2))]">{t.user_email || '\u2014'}</td>
              <td className="max-w-[300px] truncate px-3 py-2 text-[12px] text-[hsl(var(--fg))]">{t.message}</td>
              <td className="px-3 py-2 text-[11px] tabular-nums text-[hsl(var(--fg-3))]">
                {t.created_at ? format(new Date(t.created_at), 'MMM d HH:mm') : '\u2014'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TAB_COMPONENTS = { errors: ErrorsTab, audit: AuditTab, support: SupportTab };

export default function AdminLogs() {
  const [tab, setTab] = useState('errors');
  const TabContent = TAB_COMPONENTS[tab];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Logs & Errors</h1>
      </div>

      {/* Compact tab strip */}
      <div className="flex gap-0.5 rounded-[8px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)] p-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[11px] font-medium transition',
              tab === t.id
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
            )}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      <TabContent />
    </div>
  );
}
