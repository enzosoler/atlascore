import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchAuditLogs } from '@/lib/adminService';

const ACTION_COLORS = {
  role_update: 'badge-blue',
  suspend: 'badge-warn',
  unsuspend: 'badge-ok',
  grant_access: 'badge-ok',
  revoke_access: 'badge-err',
  reset_onboarding: 'badge-neutral',
};

export default function AdminAuditLog() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => fetchAuditLogs(200),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[hsl(var(--fg-2))] gap-2">
        <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
        Loading audit log…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Audit Log</h2>
        <p className="t-caption mt-1">All admin actions are recorded here</p>
      </div>

      {logs.length === 0 ? (
        <div className="surface p-8 text-center t-caption">No audit events yet</div>
      ) : (
        <div className="surface divide-y divide-[hsl(var(--border-h))]">
          {logs.map((log) => (
            <div key={log.id} className="px-5 py-3 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${ACTION_COLORS[log.action_type] || 'badge-neutral'}`}>
                    {log.action_type}
                  </span>
                  {log.target_user_id && (
                    <span className="text-[12px] font-mono text-[hsl(var(--fg-2))] truncate">
                      target: {log.target_user_id}
                    </span>
                  )}
                </div>
                {log.action_detail && Object.keys(log.action_detail).length > 0 && (
                  <p className="t-caption mt-1 truncate">
                    {JSON.stringify(log.action_detail)}
                  </p>
                )}
              </div>
              <time className="t-caption shrink-0">
                {log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : '—'}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
