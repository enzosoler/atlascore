import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { getAdminMetrics } from '@/lib/adminService';
import { Users, CreditCard, Brain, AlertTriangle, MessageCircle, Dumbbell, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

const ADMIN = ROUTES.admin;

function Metric({ icon: Icon, label, value, sub, color = 'text-[hsl(var(--brand))]', to }) {
  const inner = (
    <div className="atlas-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] ${color}`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{label}</span>
      </div>
      <p className="mt-3 text-[1.4rem] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function AdminOverview() {
  const { data: metrics } = useQuery({ queryKey: ['admin-metrics'], queryFn: getAdminMetrics, staleTime: 30_000 });

  const todayISO = new Date().toISOString().split('T')[0];

  const { data: todayWorkouts } = useQuery({
    queryKey: ['admin-today-workouts'],
    queryFn: async () => {
      const { count } = await supabase.from('workout_logs').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('date', todayISO);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: errorCount } = useQuery({
    queryKey: ['admin-today-errors'],
    queryFn: async () => {
      const { count } = await supabase.from('error_logs').select('*', { count: 'exact', head: true }).gte('created_at', `${todayISO}T00:00:00`);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: supportCount } = useQuery({
    queryKey: ['admin-pending-support'],
    queryFn: async () => {
      const { count } = await supabase.from('support_requests').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 60_000,
  });

  const { data: aiRecsToday } = useQuery({
    queryKey: ['admin-ai-recs-today'],
    queryFn: async () => {
      const { count } = await supabase.from('ai_recommendations').select('*', { count: 'exact', head: true }).gte('created_at', `${todayISO}T00:00:00`);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const m = metrics || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="atlas-display-title text-[1.4rem]">Overview</h1>
        <p className="atlas-copy mt-1">System health at a glance</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Users} label="Total Users" value={m.totalUsers} sub={m.newUsersLast7Days ? `+${m.newUsersLast7Days} this week` : null} to={`${ADMIN}/users`} />
        <Metric icon={CreditCard} label="Active Subs" value={m.activeSubscriptions} sub={m.trialingSubscriptions ? `${m.trialingSubscriptions} trialing` : null} color="text-[hsl(var(--ok))]" to={`${ADMIN}/subscriptions`} />
        <Metric icon={Dumbbell} label="Workouts Today" value={todayWorkouts} color="text-[hsl(var(--brand-ai))]" />
        <Metric icon={Brain} label="AI Recs Today" value={aiRecsToday} color="text-[hsl(var(--brand))]" to={`${ADMIN}/ai-system`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={AlertTriangle} label="Errors Today" value={errorCount} color={errorCount > 10 ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--warn))]'} to={`${ADMIN}/logs`} />
        <Metric icon={MessageCircle} label="Support" value={supportCount} color="text-[hsl(var(--brand-ai))]" to={`${ADMIN}/logs`} />
        <Metric icon={Activity} label="System" value="Operational" color="text-[hsl(var(--ok))]" />
      </div>
    </div>
  );
}
