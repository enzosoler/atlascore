import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { getAdminMetrics } from '@/lib/adminService';
import { Users, CreditCard, Brain, AlertTriangle, MessageCircle, Dumbbell, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

const ADMIN = ROUTES.admin;

function Metric({ icon: Icon, label, value, sub, color = 'text-primary', to }) {
  const content = (
    <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${color}`} strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function AdminOverview() {
  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: getAdminMetrics,
    staleTime: 30_000,
  });

  const { data: todayWorkouts } = useQuery({
    queryKey: ['admin-today-workouts'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('date', today);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: errorCount } = useQuery({
    queryKey: ['admin-today-errors'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: supportCount } = useQuery({
    queryKey: ['admin-pending-support'],
    queryFn: async () => {
      const { count } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 60_000,
  });

  const { data: aiRecsToday } = useQuery({
    queryKey: ['admin-ai-recs-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('ai_recommendations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const m = metrics || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">System health at a glance.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Users} label="Total Users" value={m.totalUsers} sub={m.newUsersLast7Days ? `+${m.newUsersLast7Days} this week` : null} to={`${ADMIN}/users`} />
        <Metric icon={CreditCard} label="Active Subs" value={m.activeSubscriptions} sub={m.trialingSubscriptions ? `${m.trialingSubscriptions} trialing` : null} color="text-green-500" to={`${ADMIN}/subscriptions`} />
        <Metric icon={Dumbbell} label="Workouts Today" value={todayWorkouts} color="text-blue-500" />
        <Metric icon={Brain} label="AI Recs Today" value={aiRecsToday} color="text-violet-500" to={`${ADMIN}/ai-system`} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={AlertTriangle} label="Errors Today" value={errorCount} color={errorCount > 10 ? 'text-red-500' : 'text-amber-500'} to={`${ADMIN}/logs`} />
        <Metric icon={MessageCircle} label="Support Requests" value={supportCount} color="text-blue-500" to={`${ADMIN}/logs`} />
        <Metric icon={Activity} label="System" value="Operational" color="text-green-500" />
      </div>
    </div>
  );
}
