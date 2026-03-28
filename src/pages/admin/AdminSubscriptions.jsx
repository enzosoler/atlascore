import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSubscriptions, updateSubscriptionTier, updateSubscriptionStatus, extendTrial } from '@/lib/adminService';
import { format } from 'date-fns';
import { CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  active: 'text-green-500 bg-green-500/10',
  trialing: 'text-blue-500 bg-blue-500/10',
  canceled: 'text-red-500 bg-red-500/10',
  past_due: 'text-amber-500 bg-amber-500/10',
  free: 'text-muted-foreground bg-muted',
};

export default function AdminSubscriptions() {
  const qc = useQueryClient();
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
          <h1 className="text-xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">{subs.length} subscriptions loaded</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-48 rounded-xl bg-muted" />
      ) : subs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="p-3">User</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Started</th>
                <th className="p-3">Expires</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium">{s.profiles?.email || s.user_id?.slice(0, 12) || '—'}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {s.plan_code || s.tier || 'free'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold', STATUS_COLORS[s.status] || STATUS_COLORS.free)}>
                      {s.status || 'free'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{s.created_at ? format(new Date(s.created_at), 'MMM d, yyyy') : '—'}</td>
                  <td className="p-3 text-muted-foreground">{s.current_period_end ? format(new Date(s.current_period_end), 'MMM d, yyyy') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" disabled={subs.length < 25} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
