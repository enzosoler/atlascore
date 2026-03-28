import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { AlertTriangle, FileText, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'errors', label: 'Errors', icon: AlertTriangle },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'support', label: 'Support', icon: MessageCircle },
];

function ErrorsTab() {
  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="animate-pulse h-48 rounded-xl bg-muted" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{errors.length} recent errors</p>
        <Button variant="ghost" size="sm" onClick={() => refetch()}><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh</Button>
      </div>
      {errors.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No errors logged.</p>
      ) : (
        <div className="max-h-[500px] overflow-y-auto rounded-xl border divide-y">
          {errors.map((e) => (
            <div key={e.id} className="p-3 hover:bg-muted/50">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{e.message || e.error_message || 'Unknown error'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {e.component || e.route || '—'} {e.user_id ? `· ${e.user_id.slice(0, 8)}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {e.created_at ? format(new Date(e.created_at), 'MMM d HH:mm') : '—'}
                </span>
              </div>
              {e.stack && (
                <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-muted p-2 text-[11px] text-muted-foreground">{e.stack}</pre>
              )}
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
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="animate-pulse h-48 rounded-xl bg-muted" />;

  return (
    <div className="max-h-[500px] overflow-y-auto rounded-xl border divide-y">
      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No audit logs.</p>
      ) : logs.map((l) => (
        <div key={l.id} className="flex items-start justify-between gap-2 p-3 hover:bg-muted/50">
          <div className="min-w-0">
            <p className="text-[13px] font-medium">{l.action}</p>
            <p className="text-[11px] text-muted-foreground">{l.admin_email || l.admin_id?.slice(0, 8)} · target: {l.target_user_id?.slice(0, 8) || '—'}</p>
            {l.details && <p className="text-[11px] text-muted-foreground mt-0.5">{typeof l.details === 'string' ? l.details : JSON.stringify(l.details).slice(0, 80)}</p>}
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">{l.created_at ? format(new Date(l.created_at), 'MMM d HH:mm') : '—'}</span>
        </div>
      ))}
    </div>
  );
}

function SupportTab() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div className="animate-pulse h-48 rounded-xl bg-muted" />;

  const typeColors = {
    bug: 'text-red-500 bg-red-500/10',
    feature: 'text-amber-500 bg-amber-500/10',
    help: 'text-blue-500 bg-blue-500/10',
    contact: 'text-muted-foreground bg-muted',
  };

  return (
    <div className="max-h-[500px] overflow-y-auto rounded-xl border divide-y">
      {tickets.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No support requests.</p>
      ) : tickets.map((t) => (
        <div key={t.id} className="p-3 hover:bg-muted/50">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', typeColors[t.type] || typeColors.contact)}>{t.type}</span>
                <span className="text-[12px] font-medium">{t.user_email || '—'}</span>
              </div>
              <p className="mt-1 text-[13px] text-foreground">{t.message}</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{t.created_at ? format(new Date(t.created_at), 'MMM d HH:mm') : '—'}</span>
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
        <h1 className="text-xl font-bold tracking-tight">Logs & Errors</h1>
        <p className="text-sm text-muted-foreground">System errors, admin audit trail, and support requests.</p>
      </div>

      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
              tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
