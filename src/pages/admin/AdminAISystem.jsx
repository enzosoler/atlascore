import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { Brain, Zap, TrendingUp, CheckCircle2, XCircle, Power } from 'lucide-react';
import { toast } from 'sonner';

function StatCard({ icon: Icon, label, value, sub, color = 'text-[hsl(var(--brand))]' }) {
  return (
    <div className="atlas-card px-4 py-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.9} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{label}</span>
      </div>
      <p className="mt-2 text-[1.2rem] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{value ?? '—'}</p>
      {sub && <p className="mt-0.5 text-[11px] text-[hsl(var(--fg-2))]">{sub}</p>}
    </div>
  );
}

function SpendingConfig() {
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['admin-ai-spending'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_spending_config').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const toggleKillSwitch = async () => {
    if (!config) return;
    const { error } = await supabase.from('ai_spending_config').update({ kill_switch: !config.kill_switch }).eq('id', config.id);
    if (error) { toast.error('Failed to toggle'); return; }
    toast.success(config.kill_switch ? 'AI enabled' : 'AI disabled');
    refetch();
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />;
  if (!config) return <p className="text-[13px] text-[hsl(var(--fg-2))]">No AI config found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[hsl(var(--fg))]">Engine Control</h3>
        <button onClick={toggleKillSwitch} className={`atlas-button gap-2 text-[12px] ${config.kill_switch ? 'atlas-button-primary' : 'bg-[hsl(var(--err))] text-white hover:opacity-90'}`}>
          <Power className="h-3.5 w-3.5" />
          {config.kill_switch ? 'Enable AI' : 'Kill Switch'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Zap} label="Status" value={config.kill_switch ? 'OFF' : 'ACTIVE'} color={config.kill_switch ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--ok))]'} />
        <StatCard icon={TrendingUp} label="Daily Cap" value={`$${config.daily_spend_cap_usd || 0}`} />
        <StatCard icon={TrendingUp} label="Monthly Cap" value={`$${config.monthly_spend_cap_usd || 0}`} />
        <StatCard icon={Brain} label="Engine" value={config.engine_version || 'v1'} />
      </div>
    </div>
  );
}

function RecommendationFeed() {
  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['admin-ai-recs', 20],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_recommendations').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />;

  return (
    <div className="space-y-3">
      <h3 className="text-[14px] font-semibold text-[hsl(var(--fg))]">Recent Recommendations</h3>
      {recs.length === 0 ? (
        <p className="text-[13px] text-[hsl(var(--fg-2))]">No recommendations yet.</p>
      ) : (
        <div className="atlas-card max-h-[400px] overflow-y-auto p-0">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-[hsl(var(--card))]">
              <tr className="border-b border-[hsl(var(--border)/0.5)] text-left">
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">User</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Type</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Status</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Time</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r) => (
                <tr key={r.id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 transition-colors hover:bg-[hsl(var(--fill)/0.3)]">
                  <td className="p-3 font-medium text-[hsl(var(--fg))]">{r.user_id?.slice(0, 8) || '—'}</td>
                  <td className="p-3"><span className="rounded-[6px] bg-[hsl(var(--brand)/0.1)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--brand))]">{r.type}</span></td>
                  <td className="p-3">
                    {r.status === 'followed' && <span className="flex items-center gap-1 text-[hsl(var(--ok))]"><CheckCircle2 className="h-3.5 w-3.5" />Followed</span>}
                    {r.status === 'dismissed' && <span className="flex items-center gap-1 text-[hsl(var(--warn))]"><XCircle className="h-3.5 w-3.5" />Dismissed</span>}
                    {!r.status && <span className="text-[hsl(var(--fg-3))]">pending</span>}
                  </td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{r.created_at ? format(new Date(r.created_at), 'MMM d HH:mm') : '—'}</td>
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
      const { data, error } = await supabase.from('user_ai_state').select('*').order('updated_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />;

  return (
    <div className="space-y-3">
      <h3 className="text-[14px] font-semibold text-[hsl(var(--fg))]">User AI States ({states.length})</h3>
      {states.length === 0 ? (
        <p className="text-[13px] text-[hsl(var(--fg-2))]">No AI state entries yet.</p>
      ) : (
        <div className="atlas-card max-h-[400px] overflow-y-auto p-0">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-[hsl(var(--card))]">
              <tr className="border-b border-[hsl(var(--border)/0.5)] text-left">
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">User</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Adherence</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Feedback</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Updated</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s) => (
                <tr key={s.user_id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--fill)/0.3)]">
                  <td className="p-3 font-mono text-[12px] text-[hsl(var(--fg))]">{s.user_id?.slice(0, 12)}</td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{JSON.stringify(s.adherence_patterns || {}).slice(0, 40)}</td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{JSON.stringify(s.feedback_signals || {}).slice(0, 40)}</td>
                  <td className="p-3 text-[hsl(var(--fg-3))]">{s.updated_at ? format(new Date(s.updated_at), 'MMM d HH:mm') : '—'}</td>
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
        <h1 className="atlas-display-title text-[1.4rem]">AI System</h1>
        <p className="atlas-copy mt-1">Monitor and control the AI decision engine</p>
      </div>
      <SpendingConfig />
      <RecommendationFeed />
      <UserAIStates />
    </div>
  );
}
