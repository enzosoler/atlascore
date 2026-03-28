import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${color}`} strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SpendingConfig() {
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['admin-ai-spending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_spending_config')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const toggleKillSwitch = async () => {
    if (!config) return;
    const { error } = await supabase
      .from('ai_spending_config')
      .update({ kill_switch: !config.kill_switch })
      .eq('id', config.id);
    if (error) { toast.error('Failed to toggle'); return; }
    toast.success(config.kill_switch ? 'AI enabled' : 'AI disabled (kill switch ON)');
    refetch();
  };

  if (isLoading) return <div className="animate-pulse h-32 rounded-xl bg-muted" />;
  if (!config) return <p className="text-sm text-muted-foreground">No AI spending config found. Create the ai_spending_config table first.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Engine Control</h3>
        <Button
          variant={config.kill_switch ? 'default' : 'destructive'}
          size="sm"
          onClick={toggleKillSwitch}
          className="gap-2"
        >
          <Power className="h-3.5 w-3.5" />
          {config.kill_switch ? 'Enable AI' : 'Kill Switch ON'}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Zap} label="Status" value={config.kill_switch ? 'DISABLED' : 'ACTIVE'} color={config.kill_switch ? 'text-destructive' : 'text-green-500'} />
        <StatCard icon={TrendingUp} label="Daily Cap" value={`$${config.daily_spend_cap_usd || 0}`} />
        <StatCard icon={TrendingUp} label="Monthly Cap" value={`$${config.monthly_spend_cap_usd || 0}`} />
        <StatCard icon={Brain} label="Engine Ver" value={config.engine_version || 'v1'} />
      </div>
    </div>
  );
}

function RecommendationFeed() {
  const [limit] = useState(20);
  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['admin-ai-recs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*, profiles!ai_recommendations_user_id_fkey(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        // Fallback without join if FK doesn't exist
        const { data: d2, error: e2 } = await supabase
          .from('ai_recommendations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (e2) throw e2;
        return d2 || [];
      }
      return data || [];
    },
  });

  if (isLoading) return <div className="animate-pulse h-48 rounded-xl bg-muted" />;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Recent AI Recommendations</h3>
      {recs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recommendations yet.</p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto rounded-xl border">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="p-3">User</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium">{r.profiles?.email || r.user_id?.slice(0, 8) || '—'}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{r.type}</span>
                  </td>
                  <td className="p-3">
                    {r.status === 'followed' && <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="h-3.5 w-3.5" />Followed</span>}
                    {r.status === 'dismissed' && <span className="flex items-center gap-1 text-amber-500"><XCircle className="h-3.5 w-3.5" />Dismissed</span>}
                    {!r.status && <span className="text-muted-foreground">pending</span>}
                  </td>
                  <td className="p-3 text-muted-foreground">{r.created_at ? format(new Date(r.created_at), 'MMM d HH:mm') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserAIStates() {
  const { data: states = [], isLoading } = useQuery({
    queryKey: ['admin-user-ai-states'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_ai_state')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div className="animate-pulse h-48 rounded-xl bg-muted" />;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">User AI States ({states.length})</h3>
      {states.length === 0 ? (
        <p className="text-sm text-muted-foreground">No user AI state entries yet.</p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto rounded-xl border">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="p-3">User ID</th>
                <th className="p-3">Adherence</th>
                <th className="p-3">Feedback</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s) => (
                <tr key={s.user_id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-mono text-[12px]">{s.user_id?.slice(0, 12)}…</td>
                  <td className="p-3">{JSON.stringify(s.adherence_patterns || {}).slice(0, 40)}</td>
                  <td className="p-3">{JSON.stringify(s.feedback_signals || {}).slice(0, 40)}</td>
                  <td className="p-3 text-muted-foreground">{s.updated_at ? format(new Date(s.updated_at), 'MMM d HH:mm') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminAISystem() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">AI System</h1>
        <p className="text-sm text-muted-foreground">Monitor and control the AI decision engine.</p>
      </div>
      <SpendingConfig />
      <RecommendationFeed />
      <UserAIStates />
    </div>
  );
}
