import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { RefreshCw, Plus, X, Check, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ── Helpers ───────────────────────────────────────────── */

async function fetchInfluencers() {
  const { data, error } = await supabase
    .from('influencer_summary')
    .select('*')
    .order('display_name');
  if (error) {
    // fallback to raw table if view not available
    const { data: raw, error: rawErr } = await supabase
      .from('influencers')
      .select('*')
      .order('display_name');
    if (rawErr) throw rawErr;
    return raw;
  }
  return data;
}

async function upsertInfluencer(payload) {
  const { data, error } = await supabase
    .from('influencers')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function toggleInfluencerActive(id, active) {
  const { error } = await supabase
    .from('influencers')
    .update({ active })
    .eq('id', id);
  if (error) throw error;
}

/* ── Status badge ──────────────────────────────────────── */

const STATUS_COLORS = {
  true:  'text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.08)]',
  false: 'text-[hsl(var(--fg-3))] bg-[hsl(var(--fill)/0.5)]',
};

/* ── Component ─────────────────────────────────────────── */

export default function AdminInfluencers() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: influencers = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-influencers'],
    queryFn: fetchInfluencers,
  });

  const saveMutation = useMutation({
    mutationFn: upsertInfluencer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      setShowForm(false);
      setEditing(null);
      toast.success('Influencer saved');
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => toggleInfluencerActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-influencers'] }),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="atlas-display-title text-[1.4rem]">Influencers</h1>
          <p className="atlas-copy mt-1">{influencers.length} influencers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 rounded-[10px] bg-[hsl(var(--brand))] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add Influencer
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <InlineForm
          initial={editing}
          saving={saveMutation.isPending}
          onSave={(values) => saveMutation.mutate(values)}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Table */}
      {isLoading ? (
        <div className="h-48 animate-pulse rounded-[18px] bg-[hsl(var(--fill)/0.5)]" />
      ) : influencers.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">No influencers found.</p>
      ) : (
        <div className="atlas-card overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border)/0.5)] text-left">
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Name</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Code</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Commission %</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Status</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Attached</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Paid</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Revenue</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Owed</th>
                <th className="p-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {influencers.map((inf) => (
                <tr key={inf.id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--fill)/0.3)]">
                  <td className="p-3 font-medium text-[hsl(var(--fg))]">{inf.display_name}</td>
                  <td className="p-3">
                    <span className="rounded-[6px] bg-[hsl(var(--brand)/0.1)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--brand))]">
                      {inf.code}
                    </span>
                  </td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{inf.commission_percent ?? '—'}%</td>
                  <td className="p-3">
                    <span className={cn('rounded-[6px] px-2 py-0.5 text-[11px] font-semibold', STATUS_COLORS[inf.active])}>
                      {inf.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{inf.attached_users ?? '—'}</td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{inf.paid_users ?? '—'}</td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{inf.total_revenue != null ? `$${Number(inf.total_revenue).toFixed(2)}` : '—'}</td>
                  <td className="p-3 text-[hsl(var(--fg-2))]">{inf.commission_owed != null ? `$${Number(inf.commission_owed).toFixed(2)}` : '—'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setEditing(inf); setShowForm(true); }}
                        className="rounded-[8px] p-1.5 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.6)] hover:text-[hsl(var(--fg))]"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate({ id: inf.id, active: !inf.active })}
                        className="rounded-[8px] p-1.5 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.6)] hover:text-[hsl(var(--fg))]"
                        title={inf.active ? 'Deactivate' : 'Activate'}
                      >
                        {inf.active ? <ToggleRight className="h-4 w-4 text-[hsl(var(--ok))]" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Inline Form ───────────────────────────────────────── */

function InlineForm({ initial, saving, onSave, onCancel }) {
  const [displayName, setDisplayName] = useState(initial?.display_name || '');
  const [code, setCode] = useState(initial?.code || '');
  const [commission, setCommission] = useState(initial?.commission_percent ?? 20);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      display_name: displayName.trim(),
      code: code.trim().toLowerCase(),
      commission_percent: Number(commission),
      active: initial?.active ?? true,
    };
    if (initial?.id) payload.id = initial.id;
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="atlas-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
          {initial ? 'Edit Influencer' : 'Add Influencer'}
        </p>
        <button type="button" onClick={onCancel} className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-10 w-full rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-3 text-[13px] text-[hsl(var(--fg))] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Code</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!!initial}
            className="h-10 w-full rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-3 text-[13px] text-[hsl(var(--fg))] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Commission %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="h-10 w-full rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-3 text-[13px] text-[hsl(var(--fg))] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="atlas-button atlas-button-secondary text-[12px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !displayName.trim() || !code.trim()}
          className="flex items-center gap-1.5 rounded-[10px] bg-[hsl(var(--brand))] px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {initial ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  );
}
