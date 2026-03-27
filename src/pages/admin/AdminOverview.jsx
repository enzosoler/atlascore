import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, TrendingUp, Shield, UserPlus } from 'lucide-react';
import { getAdminMetrics } from '@/lib/adminService';

function Metric({ icon: Icon, label, value, color = 'text-[hsl(var(--primary))]' }) {
  return (
    <div className="surface p-5 space-y-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-[hsl(var(--fill))] ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[hsl(var(--fg))]">{value ?? '—'}</p>
        <p className="t-caption mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: getAdminMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[hsl(var(--fg-2))] gap-2">
        <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
        Loading metrics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Overview</h2>
        <p className="t-caption mt-1">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric icon={Users} label="Total users" value={metrics?.totalUsers} />
        <Metric icon={CreditCard} label="Active subscriptions" value={metrics?.activeSubscriptions} color="text-[hsl(var(--ok))]" />
        <Metric icon={TrendingUp} label="Trialing" value={metrics?.trialingSubscriptions} color="text-[hsl(var(--warn))]" />
        <Metric icon={Shield} label="Admin accounts" value={metrics?.adminCount} color="text-[hsl(var(--err))]" />
        <Metric icon={UserPlus} label="New users (7d)" value={metrics?.newUsersLast7Days} color="text-[hsl(var(--brand-ai))]" />
      </div>
    </div>
  );
}
