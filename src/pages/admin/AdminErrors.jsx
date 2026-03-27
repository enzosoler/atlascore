import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Errors & Events</h2>
          <p className="t-caption mt-1">
            {errors.length} errors · {events.length} events · last 200 entries
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
