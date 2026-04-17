import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, CreditCard, UserPlus, AlertTriangle,
  Clock, TrendingUp, ArrowRight, Loader2,
} from 'lucide-react';
import AdminSparkline from '@/components/admin/AdminSparkline';
import {
  getEnhancedAdminMetrics, fetchRecentSignups,
  fetchRecentErrors, fetchSignupSparkline,
} from '@/lib/adminService';

function relTime(d) {
  if (!d) return '\u2014';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ---------- Compact stat chip ---------- */
function Stat({ label, value, sub, icon: Icon, alert, ok, suffix, spark }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] px-3.5 py-2.5">
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${
          alert ? 'text-[hsl(var(--err))]' : ok ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-[15px] font-semibold tabular-nums ${
              alert ? 'text-[hsl(var(--err))]' : ok ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'
            }`}
          >
            {value}{suffix || ''}
          </span>
          <span className="truncate text-[11px] text-[hsl(var(--fg-3))]">{label}</span>
        </div>
        {sub && <p className="truncate text-[10px] text-[hsl(var(--fg-3))]">{sub}</p>}
      </div>
      {spark}
    </div>
  );
}

export default function AdminOverview() {
  const navigate = useNavigate();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
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

  const { data: recentSignups, isLoading: signupsLoading } = useQuery({
    queryKey: ['admin-recent-signups'],
    queryFn: () => fetchRecentSignups(5),
    staleTime: 30_000,
  });

  const { data: recentErrors, isLoading: errorsLoading } = useQuery({
    queryKey: ['admin-recent-errors'],
    queryFn: () => fetchRecentErrors(5),
    staleTime: 30_000,
  });

  const m = metrics || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Overview</h1>
        <span className="text-[11px] text-[hsl(var(--fg-3))]">
          {metricsLoading ? 'Refreshing...' : 'Live'}
        </span>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <Stat
          icon={Users} label="Total Users" value={m.totalUsers ?? '\u2014'}
          sub={m.signupsLast7Days ? `+${m.signupsLast7Days} this week` : undefined}
        />
        <Stat
          icon={CreditCard} label="Active Subs" value={m.activeSubscriptions ?? '\u2014'}
          sub={m.trialingSubscriptions ? `${m.trialingSubscriptions} trialing` : undefined}
        />
        <Stat
          icon={UserPlus} label="Signups Today" value={m.signupsToday ?? '\u2014'}
          spark={sparkline ? <AdminSparkline data={sparkline} color="hsl(var(--brand))" /> : null}
        />
        <Stat
          icon={TrendingUp} label="Trial \u2192 Paid" value={m.trialToPaidRate ?? '\u2014'}
          suffix="%" ok={m.trialToPaidRate > 0}
        />
        <Stat
          icon={AlertTriangle} label="Errors Today" value={m.errorsToday ?? '\u2014'}
          alert={m.errorsToday > 10}
        />
      </div>

      {/* Recent activity tables */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Recent Signups */}
        <div className="rounded-[12px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))]">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border)/0.3)] px-3.5 py-2.5">
            <h2 className="text-[12px] font-semibold text-[hsl(var(--fg))]">Recent Signups</h2>
            <button
              type="button"
              onClick={() => navigate('/AdminPanel/users')}
              className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--brand))] transition hover:opacity-80"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.2)]">
            {signupsLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[hsl(var(--fg-3))]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
              </div>
            )}
            {!signupsLoading && (!recentSignups || recentSignups.length === 0) && (
              <p className="py-6 text-center text-[12px] text-[hsl(var(--fg-3))]">No recent signups</p>
            )}
            {(recentSignups || []).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => navigate(`/AdminPanel/users/${u.id}`)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-[hsl(var(--fill)/0.4)]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[10px] font-bold text-[hsl(var(--brand))]">
                  {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[hsl(var(--fg))]">{u.full_name || u.email}</p>
                  <p className="truncate text-[10px] text-[hsl(var(--fg-3))]">{u.email}</p>
                </div>
                <span className="shrink-0 text-[10px] tabular-nums text-[hsl(var(--fg-3))]">{relTime(u.created_at)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="rounded-[12px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))]">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border)/0.3)] px-3.5 py-2.5">
            <h2 className="text-[12px] font-semibold text-[hsl(var(--fg))]">Recent Errors</h2>
            <button
              type="button"
              onClick={() => navigate('/AdminPanel/logs')}
              className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--brand))] transition hover:opacity-80"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.2)]">
            {errorsLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[hsl(var(--fg-3))]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
              </div>
            )}
            {!errorsLoading && (!recentErrors || recentErrors.length === 0) && (
              <p className="py-6 text-center text-[12px] text-[hsl(var(--fg-3))]">No recent errors</p>
            )}
            {(recentErrors || []).map((e) => (
              <div key={e.id} className="px-3.5 py-2 transition hover:bg-[hsl(var(--fill)/0.3)]">
                <p className="truncate text-[12px] font-medium text-[hsl(var(--fg))]">{e.message || 'Error'}</p>
                <p className="text-[10px] text-[hsl(var(--fg-3))]">
                  {e.component || e.route || '\u2014'} &middot; {relTime(e.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
