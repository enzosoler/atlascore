import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { AlertTriangle, FileText, MessageCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'errors',  label: 'Errors',    icon: AlertTriangle },
  { id: 'audit',   label: 'Audit Log', icon: FileText },
  { id: 'support', label: 'Support',   icon: MessageCircle },
];

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

  if (isLoading) return <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[hsl(var(--fg-2))]">{errors.length} recent errors</p>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>
      {errors.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">No errors logged.</p>
      ) : (
        <div className="atlas-card max-h-[500px] divide-y divide-[hsl(var(--border)/0.3)] overflow-y-auto p-0">
          {errors.map((e) => (
            <div key={e.id} className="p-3 transition-colors hover:bg-[hsl(var(--fill)/0.3)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[hsl(var(--fg))] truncate">{e.message || e.error_message || 'Unknown'}</p>
                  <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">{e.component || e.route || '—'} {e.user_id ? `· ${e.user_id.slice(0, 8)}` : ''}</p>
                </div>
                <span className="shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{e.created_at ? format(new Date(e.created_at), 'MMM d HH:mm') : '—'}</span>
              </div>
              {e.stack && <pre className="mt-2 max-h-20 overflow-auto rounded-[10px] bg-[hsl(var(--fill)/0.5)] p-2 text-[11px] text-[hsl(var(--fg-2))]">{e.stack}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

  if (isLoading) return <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />;

  return (
    <div className="atlas-card max-h-[500px] divide-y divide-[hsl(var(--border)/0.3)] overflow-y-auto p-0">
      {logs.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">No audit logs.</p>
      ) : logs.map((l) => (
        <div key={l.id} className="flex items-start justify-between gap-2 p-3 hover:bg-[hsl(var(--fill)/0.3)]">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{l.action}</p>
            <p className="text-[11px] text-[hsl(var(--fg-3))]">{l.admin_email || l.admin_id?.slice(0, 8)} · target: {l.target_user_id?.slice(0, 8) || '—'}</p>
          </div>
          <span className="shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{l.created_at ? format(new Date(l.created_at), 'MMM d HH:mm') : '—'}</span>
        </div>
      ))}
    </div>
  );
}

function SupportTab() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('support_requests').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />;

  const typeColors = {
    bug: 'text-[hsl(var(--err))] bg-[hsl(var(--err)/0.08)]',
    feature: 'text-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.08)]',
    help: 'text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]',
    contact: 'text-[hsl(var(--fg-2))] bg-[hsl(var(--fill)/0.5)]',
  };

  return (
    <div className="atlas-card max-h-[500px] divide-y divide-[hsl(var(--border)/0.3)] overflow-y-auto p-0">
      {tickets.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">No support requests.</p>
      ) : tickets.map((t) => (
        <div key={t.id} className="p-3 hover:bg-[hsl(var(--fill)/0.3)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold', typeColors[t.type] || typeColors.contact)}>{t.type}</span>
                <span className="text-[12px] font-medium text-[hsl(var(--fg))]">{t.user_email || '—'}</span>
              </div>
              <p className="mt-1 text-[13px] text-[hsl(var(--fg))]">{t.message}</p>
            </div>
            <span className="shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{t.created_at ? format(new Date(t.created_at), 'MMM d HH:mm') : '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const TAB_COMPONENTS = { errors: ErrorsTab, audit: AuditTab, support: SupportTab };

export default function AdminLogs() {
  const [tab, setTab] = useState('errors');
  const TabContent = TAB_COMPONENTS[tab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="atlas-display-title text-[1.4rem]">Logs & Errors</h1>
        <p className="atlas-copy mt-1">System errors, admin audit trail, and support requests</p>
      </div>

      <div className="flex gap-1 rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-all',
              tab === t.id
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                : 'text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <TabContent />
    </div>
  );
}
