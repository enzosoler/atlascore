import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Mail, Search, Users, Clock, Target } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

async function fetchWaitlist() {
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

function relTime(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function exportCSV(rows) {
  const headers = ['name', 'email', 'primary_goal', 'improving', 'current_tools', 'interest_type', 'created_at'];
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const GOAL_LABELS = {
  fat_loss: 'Fat loss',
  muscle_gain: 'Muscle gain',
  performance: 'Performance',
  recovery: 'Recovery',
  hormone_protocol: 'Hormone / protocol',
  optimization: 'Overall optimization',
};

const INTEREST_LABELS = {
  beta: 'Beta',
  paid: 'Early paid',
  both: 'Both',
};

export default function AdminWaitlist() {
  const [search, setSearch] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['admin-waitlist'],
    queryFn: fetchWaitlist,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const filtered = search.trim()
    ? entries.filter((e) =>
        [e.name, e.email, e.primary_goal, e.improving, e.interest_type]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(search.toLowerCase()))
      )
    : entries;

  const goalCounts = entries.reduce((acc, e) => {
    if (e.primary_goal) acc[e.primary_goal] = (acc[e.primary_goal] || 0) + 1;
    return acc;
  }, {});

  const interestCounts = entries.reduce((acc, e) => {
    if (e.interest_type) acc[e.interest_type] = (acc[e.interest_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-bold tracking-[-0.03em]">Waitlist</h1>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">
            {entries.length} signups total
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="gap-2"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border-default))] bg-[hsl(var(--card))] px-4 py-4">
          <div className="flex items-center gap-2 text-[hsl(var(--fg-3))]">
            <Users className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">Total</span>
          </div>
          <p className="mt-2 text-[1.5rem] font-bold tracking-[-0.04em]">{entries.length}</p>
        </div>
        <div className="rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border-default))] bg-[hsl(var(--card))] px-4 py-4">
          <div className="flex items-center gap-2 text-[hsl(var(--fg-3))]">
            <Clock className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">Today</span>
          </div>
          <p className="mt-2 text-[1.5rem] font-bold tracking-[-0.04em]">
            {entries.filter((e) => new Date(e.created_at).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border-default))] bg-[hsl(var(--card))] px-4 py-4">
          <div className="flex items-center gap-2 text-[hsl(var(--fg-3))]">
            <Target className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">Want paid</span>
          </div>
          <p className="mt-2 text-[1.5rem] font-bold tracking-[-0.04em]">
            {entries.filter((e) => e.interest_type === 'paid' || e.interest_type === 'both').length}
          </p>
        </div>
        <div className="rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border-default))] bg-[hsl(var(--card))] px-4 py-4">
          <div className="flex items-center gap-2 text-[hsl(var(--fg-3))]">
            <Mail className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">Top goal</span>
          </div>
          <p className="mt-2 text-[14px] font-bold">
            {Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
              ? GOAL_LABELS[Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0][0]] || '—'
              : '—'}
          </p>
        </div>
      </div>

      {/* Breakdown chips */}
      {Object.keys(goalCounts).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(goalCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([goal, count]) => (
              <span
                key={goal}
                className="rounded-full border border-[hsl(var(--border-default))] bg-[hsl(var(--fill))] px-3 py-1 text-[12px] font-medium text-[hsl(var(--fg-2))]"
              >
                {GOAL_LABELS[goal] || goal} ({count})
              </span>
            ))}
          <span className="mx-2 text-[hsl(var(--fg-3))]">|</span>
          {Object.entries(interestCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([interest, count]) => (
              <span
                key={interest}
                className="rounded-full border border-[hsl(var(--accent-primary)/0.3)] bg-[hsl(var(--accent-primary)/0.06)] px-3 py-1 text-[12px] font-medium text-[hsl(var(--accent-primary))]"
              >
                {INTEREST_LABELS[interest] || interest} ({count})
              </span>
            ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, goal..."
          className="h-10 pl-10"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--atlas-card-radius)] border border-[hsl(var(--border-default))]">
        <table className="w-full min-w-[700px] text-[13px]">
          <thead>
            <tr className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--fill))]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Email</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Goal</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Improving</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Tools</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Interest</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--fg-3))]">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--fg-3))]">
                  {search ? 'No matches' : 'No signups yet'}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[hsl(var(--border-default)/0.5)] transition-colors hover:bg-[hsl(var(--fill)/0.4)]"
                >
                  <td className="px-4 py-3 font-medium text-[hsl(var(--fg))]">{row.name || '—'}</td>
                  <td className="px-4 py-3 text-[hsl(var(--fg-2))]">{row.email}</td>
                  <td className="px-4 py-3 text-[hsl(var(--fg-2))]">{GOAL_LABELS[row.primary_goal] || row.primary_goal || '—'}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[hsl(var(--fg-2))]">{row.improving || '—'}</td>
                  <td className="px-4 py-3 text-[hsl(var(--fg-2))]">{row.current_tools || '—'}</td>
                  <td className="px-4 py-3">
                    {row.interest_type ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        row.interest_type === 'paid' || row.interest_type === 'both'
                          ? 'bg-[hsl(var(--sys-green)/0.12)] text-[hsl(var(--sys-green))]'
                          : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]'
                      }`}>
                        {INTEREST_LABELS[row.interest_type] || row.interest_type}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--fg-3))]">{relTime(row.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
