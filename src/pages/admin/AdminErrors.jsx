import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangle, Bell, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const ERROR_SPIKE_THRESHOLD = 10; // errors in last hour = spike

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]',
    error:   'bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]',
    event:   'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

function Row({ log }) {
  const isEvent = log.message.startsWith('[event]');
  return (
    <div className="surface p-4 space-y-2">
      <div className="flex items-start gap-3 flex-wrap">
        <Badge variant={isEvent ? 'event' : 'error'}>
          {isEvent ? 'event' : 'error'}
        </Badge>
        <p className="text-sm font-medium text-[hsl(var(--fg))] flex-1 min-w-0 break-all">
          {log.message}
        </p>
        <span className="text-[11px] text-[hsl(var(--fg-3))] whitespace-nowrap">
          {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
        </span>
      </div>

      {log.url && (
        <p className="text-[11px] text-[hsl(var(--fg-3))] break-all">{log.url}</p>
      )}

      {log.context && (
        <pre className="text-[11px] bg-[hsl(var(--shell))] rounded p-2 overflow-x-auto text-[hsl(var(--fg-2))]">
          {JSON.stringify(log.context, null, 2)}
        </pre>
      )}

      {log.stack && (
        <details>
          <summary className="text-[11px] text-[hsl(var(--fg-3))] cursor-pointer select-none">
            Stack trace
          </summary>
          <pre className="mt-1 text-[11px] bg-[hsl(var(--shell))] rounded p-2 overflow-x-auto text-[hsl(var(--fg-2))] whitespace-pre-wrap">
            {log.stack}
          </pre>
        </details>
      )}

      {log.user_id && (
        <p className="text-[11px] text-[hsl(var(--fg-3))]">user: {log.user_id}</p>
      )}
    </div>
  );
}

export default function AdminErrors() {
  const [alertSending, setAlertSending] = useState(false);

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  const errors = logs.filter(l => !l.message.startsWith('[event]'));
  const events = logs.filter(l => l.message.startsWith('[event]'));

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentErrors = errors.filter(l => new Date(l.created_at) > oneHourAgo);
  const isSpike = recentErrors.length >= ERROR_SPIKE_THRESHOLD;

  const sendAlertEmail = async () => {
    setAlertSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single();

      await supabase.functions.invoke('send-email', {
        body: {
          type: 'custom',
          to: profile?.email || user?.email,
          subject: `[atlas.core] Error spike detected — ${recentErrors.length} errors in last hour`,
          body: `${recentErrors.length} errors logged in the last hour.\n\nLatest: ${recentErrors[0]?.message}\n\nCheck the admin panel for details.`,
        },
      }).catch(() => null); // fire-and-forget, ignore if not supported

      toast.success('Alert email sent to your admin address');
    } catch {
      toast.error('Failed to send alert email');
    } finally {
      setAlertSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {isSpike && (
        <div className="rounded-xl border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.06)] p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--err))] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[hsl(var(--err))]">
              Error spike detected — {recentErrors.length} errors in the last hour
            </p>
            <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">
              Threshold is {ERROR_SPIKE_THRESHOLD}. Most recent: {recentErrors[0]?.message}
            </p>
          </div>
          <button
            onClick={sendAlertEmail}
            disabled={alertSending}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--err))] text-white text-[12px] font-medium hover:bg-[hsl(var(--err)/0.88)] disabled:opacity-50 transition-colors"
          >
            <Bell className="w-3 h-3" />
            {alertSending ? 'Sending…' : 'Alert me'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Errors & Events</h2>
          <p className="t-caption mt-1">
            {errors.length} errors · {events.length} events · last 200 entries
            {recentErrors.length > 0 && ` · ${recentErrors.length} in last hour`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-[hsl(var(--fg-2))] gap-2">
          <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
          Loading…
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div className="surface p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 mx-auto text-[hsl(var(--fg-3))]" />
          <p className="text-sm text-[hsl(var(--fg-2))]">No logs yet</p>
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <div className="space-y-2">
          {logs.map(log => <Row key={log.id} log={log} />)}
        </div>
      )}
    </div>
  );
}
