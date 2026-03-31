import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, CreditCard, UserPlus, Brain, AlertTriangle,
  MessageCircle, Clock, Activity, TrendingUp, CheckCircle,
} from 'lucide-react';
import AdminSparkline from '@/components/admin/AdminSparkline';
import {
  getEnhancedAdminMetrics, fetchRecentSignups,
  fetchRecentErrors, fetchSignupSparkline,
} from '@/lib/adminService';

function relTime(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const KPI_CARDS = [
  { key: 'signupsToday', label: 'Signups Today', icon: UserPlus, spark: true },
  { key: 'totalUsers', label: 'Total Users', icon: Users, sub: (m) => `+${m.signupsLast7Days} this week` },
  { key: 'activeSubscriptions', label: 'Active Subs', icon: CreditCard, sub: (m) => `${m.trialingSubscriptions} trialing` },
  { key: 'onboardingRate', label: 'Onboarding Rate', icon: CheckCircle, suffix: '%', sub: (m) => `${m.onboardingCompleted} completed` },
  { key: 'trialToPaidRate', label: 'Trial → Paid', icon: TrendingUp, suffix: '%' },
  { key: 'aiMessagesToday', label: 'AI Messages Today', icon: Brain },
  { key: 'errorsToday', label: 'Errors Today', icon: AlertTriangle, alert: (m) => m.errorsToday > 10 },
  { key: 'pendingSupportRequests', label: 'Support Requests', icon: MessageCircle },
  { key: 'trialsExpiringIn7Days', label: 'Trials Expiring 7d', icon: Clock },
  { key: 'system', label: 'System Status', icon: Activity, value: () => 'Operational', ok: true },
];

export default function AdminOverview() {
  const navigate = useNavigate();

  const { data: metrics } = useQuery({
    queryKey: ['enhanced-admin-metrics'],
    queryFn: getEnhancedAdminMetrics,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: sparkline } = useQuery({
    queryKey: ['admin-sparkline'],
    queryFn: () => fetchSignupSparkline(7),
    staleTime: 60_000,
  });

  const { data: recentSignups } = useQuery({
    queryKey: ['admin-recent-signups'],
    queryFn: () => fetchRecentSignups(5),
    staleTime: 30_000,
  });

  const { data: recentErrors } = useQuery({
    queryKey: ['admin-recent-errors'],
    queryFn: () => fetchRecentErrors(5),
    staleTime: 30_000,
  });

  const m = metrics || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">Overview</h1>
        <p className="text-[13px] text-[hsl(var(--fg-3))]">Platform health at a glance</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {KPI_CARDS.map((card) => {
          const val = card.value ? card.value(m) : (m[card.key] ?? '—');
          const isAlert = card.alert?.(m);
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`rounded-[14px] border bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-xs)] transition ${
                isAlert
                  ? 'border-[hsl(var(--err)/0.5)]'
                  : card.ok
                  ? 'border-[hsl(var(--ok)/0.3)]'
                  : 'border-[hsl(var(--border)/0.6)]'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <Icon className={`h-4 w-4 ${isAlert ? 'text-[hsl(var(--err))]' : card.ok ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'}`} />
                {card.spark && sparkline && <AdminSparkline data={sparkline} color="hsl(var(--brand))" />}
              </div>
              <p className={`text-xl font-bold ${isAlert ? 'text-[hsl(var(--err))]' : card.ok ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'}`}>
                {val}{card.suffix || ''}
              </p>
              <p className="mt-0.5 text-[11px] text-[hsl(var(--fg-3))]">{card.label}</p>
              {card.sub && <p className="mt-1 text-[11px] text-[hsl(var(--fg-3))]">{card.sub(m)}</p>}
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[18px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)]">
          <h2 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Recent Signups</h2>
          {(recentSignups || []).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => navigate(`/AdminPanel/users/${u.id}`)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[hsl(var(--fill)/0.5)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[11px] font-bold text-[hsl(var(--brand))]">
                {(u.full_name || u.email || '?')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-[13px] font-medium text-[hsl(var(--fg))]">{u.full_name || u.email}</p>
                <p className="truncate text-[11px] text-[hsl(var(--fg-3))]">{u.email}</p>
              </div>
              <span className="shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{relTime(u.created_at)}</span>
            </button>
          ))}
          {(!recentSignups || recentSignups.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No recent signups.</p>}
        </div>

        <div className="rounded-[18px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)]">
          <h2 className="mb-3 text-[13px] font-semibold text-[hsl(var(--fg))]">Recent Errors</h2>
          {(recentErrors || []).map((e) => (
            <div key={e.id} className="border-b border-[hsl(var(--border)/0.2)] py-2.5">
              <p className="truncate text-[13px] text-[hsl(var(--fg))]">{e.message || 'Error'}</p>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{e.component || e.route || '—'} · {relTime(e.created_at)}</p>
            </div>
          ))}
          {(!recentErrors || recentErrors.length === 0) && <p className="text-[13px] text-[hsl(var(--fg-3))]">No recent errors.</p>}
        </div>
      </div>
    </div>
  );
}
