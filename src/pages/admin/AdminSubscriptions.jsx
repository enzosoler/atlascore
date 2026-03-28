import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSubscriptions } from '@/lib/adminService';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  active:   'text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.08)]',
  trialing: 'text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]',
  canceled: 'text-[hsl(var(--err))] bg-[hsl(var(--err)/0.08)]',
  past_due: 'text-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.08)]',
  free:     'text-[hsl(var(--fg-3))] bg-[hsl(var(--fill)/0.5)]',
};

export default function AdminSubscriptions() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-subscriptions', page],
    queryFn: () => fetchAllSubscriptions(page, 25),
  });

  const subs = data?.subscriptions || data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="atlas-display-title text-[1.4rem]">Subscriptions</h1>
          <p className="atlas-copy mt-1">{subs.length} subscriptions loaded</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />
      ) : subs.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">No subscriptions found.</p>
      ) : (
        <div className="atlas-card overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border)/0.5)] text-left">
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">User</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Plan</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Status</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Started</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Expires</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--fill)/0.3)]">
                  <td className="p-3 font-medium text-[hsl(var(--fg))]">{s.profiles?.email || s.user_id?.slice(0, 12) || '—'}</td>
                  <td className="p-3"><span className="rounded-[6px] bg-[hsl(var(--brand)/0.1)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--brand))]">{s.plan_code || s.tier || 'free'}</span></td>
                  <td className="p-3"><span className={cn('rounded-[6px] px-2 py-0.5 text-[11px] font-semibold', STATUS_COLORS[s.status] || STATUS_COLORS.free)}>{s.status || 'free'}</span></td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{s.created_at ? format(new Date(s.created_at), 'MMM d, yyyy') : '—'}</td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{s.current_period_end ? format(new Date(s.current_period_end), 'MMM d, yyyy') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="atlas-button atlas-button-secondary text-[12px] disabled:opacity-40">Previous</button>
        <span className="text-[13px] text-[hsl(var(--fg-2))]">Page {page}</span>
        <button disabled={subs.length < 25} onClick={() => setPage(p => p + 1)} className="atlas-button atlas-button-secondary text-[12px] disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
