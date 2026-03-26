import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Gift, Loader2, ShieldCheck, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PLAN_LABELS, FEATURE_LABELS } from '@/lib/entitlements';
import { supabase } from '@/lib/supabaseClient';
import { grantAccess } from '@/lib/adminService';

const STATUS_COLORS = {
  active: 'badge-ok',
  granted: 'badge-ok',
  trialing: 'badge-blue',
  past_due: 'badge-warn',
  canceled: 'badge-err',
  expired: 'badge-neutral',
  inactive: 'badge-neutral',
};

const SOURCE_LABELS = {
  stripe: 'Stripe',
  manual: 'Manual',
  gift: 'Gift',
  admin: 'Admin',
};

// Plan tiers for grant options
const GRANT_PLANS = [
  { code: 'pro', label: 'Pro', description: 'AI insights, meal/workout builders, lab exams, progress photos' },
  { code: 'performance', label: 'Performance', description: 'Everything in Pro + advanced protocol tracking, half-life curves' },
  { code: 'coach', label: 'Coach', description: 'Coach dashboard and client management' },
  { code: 'nutritionist', label: 'Nutritionist', description: 'Nutritionist dashboard and meal planning tools' },
  { code: 'clinician', label: 'Clinician', description: 'Clinical dashboard and advanced health tracking' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'granted', label: 'Granted (Admin)' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'inactive', label: 'Inactive' },
];

export default function SubscriptionManager() {
  const qc = useQueryClient();
  const [showGrant, setShowGrant] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [grantForm, setGrantForm] = useState({ 
    user_email: '', 
    plan_code: 'pro', 
    status: 'granted', 
    source: 'admin', 
    grant_reason: '', 
    expires_at: '',
    granted_by_admin: true 
  });
  const [ovForm, setOvForm] = useState({ user_email: '', feature_key: 'atlas_ai', enabled: true, reason: '', expires_at: '' });

  // Fetch subscriptions from Supabase
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch entitlement overrides from Base44 (legacy system)
  const { data: overrides = [] } = useQuery({
    queryKey: ['admin-overrides'],
    queryFn: async () => {
      // Import dynamically to avoid issues if base44 is not configured
      const { base44 } = await import('@/api/base44Client');
      return base44.entities.EntitlementOverride.list('-created_date', 100);
    },
  });

  // Grant subscription mutation using Supabase
  const grantSubM = useMutation({
    mutationFn: async (d) => {
      const email = d.user_email.toLowerCase().trim();
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error(`No user found with email: ${email}`);
      return grantAccess(profile.id, d.plan_code, d.grant_reason || 'Admin grant');
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }); 
      setShowGrant(false); 
      toast.success('Plan granted successfully'); 
    },
    onError: (err) => {
      toast.error('Failed to grant plan: ' + err.message);
    },
  });

  const deleteSubM = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });

  // Override mutations using Base44 (legacy system)
  const createOvM = useMutation({
    mutationFn: async (d) => {
      const { base44 } = await import('@/api/base44Client');
      const payload = {
        user_email: d.user_email.toLowerCase().trim(),
        feature_key: d.feature_key,
        enabled: d.enabled,
        reason: d.reason || 'Admin override',
        expires_at: d.expires_at || null,
      };
      return base44.entities.EntitlementOverride.create(payload);
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-overrides'] }); 
      setShowOverride(false); 
      toast.success('Override created'); 
    },
    onError: (err) => {
      toast.error('Failed to create override: ' + err.message);
    },
  });

  const deleteOvM = useMutation({
    mutationFn: async (id) => {
      const { base44 } = await import('@/api/base44Client');
      return base44.entities.EntitlementOverride.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-overrides'] }),
  });

  return (
    <div className="space-y-6">

      {/* Subscriptions */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="t-subtitle">Subscriptions</p>
            <p className="t-caption mt-0.5">Grant or manage user plans manually</p>
          </div>
          <button onClick={() => setShowGrant(true)} className="btn btn-primary gap-1.5 h-9">
            <Crown className="w-3.5 h-3.5" /> Grant plan
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 t-small text-[hsl(var(--fg-2))]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : subs.length === 0 ? (
          <p className="t-caption text-center py-6">No subscriptions found</p>
        ) : (
          <div className="space-y-2">
            {subs.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium">{s.user_email}</span>
                    <span className="badge badge-blue">{PLAN_LABELS[s.plan_code] || s.plan_code}</span>
                    <span className={`badge ${STATUS_COLORS[s.status] || 'badge-neutral'}`}>{s.status}</span>
                    <span className="badge badge-neutral">{SOURCE_LABELS[s.source] || s.source}</span>
                  </div>
                  {s.notes && <p className="t-caption mt-0.5">{s.notes}</p>}
                  {s.ends_at && <p className="t-caption mt-0.5">Expires: {s.ends_at}</p>}
                </div>
                <button onClick={() => deleteSubM.mutate(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--fg-2)/0.4)] hover:text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.07)] transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overrides */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="t-subtitle flex items-center gap-2"><Gift className="w-4 h-4 text-[hsl(var(--brand-ai))]" /> Manual overrides</p>
            <p className="t-caption mt-0.5">Grant or block features individually</p>
          </div>
          <button onClick={() => setShowOverride(true)} className="btn btn-secondary gap-1.5 h-9">
            <Plus className="w-3.5 h-3.5" /> New override
          </button>
        </div>

        {overrides.length === 0 ? (
          <p className="t-caption text-center py-6">No overrides found</p>
        ) : (
          <div className="space-y-2">
            {overrides.map(o => (
              <div key={o.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))]">
                <ShieldCheck className={`w-4 h-4 shrink-0 ${o.enabled ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--err))]'}`} strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium">{o.user_email}</span>
                    <span className="badge badge-blue">{FEATURE_LABELS[o.feature_key] || o.feature_key}</span>
                    <span className={`badge ${o.enabled ? 'badge-ok' : 'badge-err'}`}>{o.enabled ? 'enabled' : 'blocked'}</span>
                  </div>
                  {o.reason && <p className="t-caption mt-0.5">{o.reason}</p>}
                  {o.expires_at && <p className="t-caption mt-0.5">Expires: {o.expires_at}</p>}
                </div>
                <button onClick={() => deleteOvM.mutate(o.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--fg-2)/0.4)] hover:text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.07)] transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grant Plan Dialog */}
      <Dialog open={showGrant} onOpenChange={setShowGrant}>
        <DialogContent className="sm:max-w-lg bg-[hsl(var(--card))] border-[hsl(var(--border-h))] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[hsl(var(--brand))]" />
              Grant plan to user
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="t-label block mb-1.5">User email</label>
              <Input 
                value={grantForm.user_email} 
                onChange={e => setGrantForm(f => ({ ...f, user_email: e.target.value }))} 
                placeholder="user@example.com" 
                className="h-10 rounded-lg text-base" 
              />
            </div>
            
            <div>
              <label className="t-label block mb-2">Select plan</label>
              <div className="grid gap-2">
                {GRANT_PLANS.map((plan) => (
                  <button
                    key={plan.code}
                    onClick={() => setGrantForm(f => ({ ...f, plan_code: plan.code }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      grantForm.plan_code === plan.code 
                        ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]' 
                        : 'border-[hsl(var(--border-h))] hover:border-[hsl(var(--brand)/0.5)]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      grantForm.plan_code === plan.code 
                        ? 'border-[hsl(var(--brand))]' 
                        : 'border-[hsl(var(--border-h))]'
                    }`}>
                      {grantForm.plan_code === plan.code && (
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--brand))]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[14px]">{plan.label}</span>
                        {plan.code === 'performance' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]">Advanced</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">{plan.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="t-label block mb-1.5">Status</label>
                <Select value={grantForm.status} onValueChange={v => setGrantForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="t-label block mb-1.5">Expires on (optional)</label>
                <Input 
                  type="date" 
                  value={grantForm.expires_at} 
                  onChange={e => setGrantForm(f => ({ ...f, expires_at: e.target.value }))} 
                  className="h-10 rounded-lg text-base" 
                />
              </div>
            </div>
            
            <div>
              <label className="t-label block mb-1.5">Grant reason</label>
              <Input 
                value={grantForm.grant_reason} 
                onChange={e => setGrantForm(f => ({ ...f, grant_reason: e.target.value }))} 
                placeholder="Example: partner gift, promotional, or manual upgrade" 
                className="h-10 rounded-lg text-base" 
              />
            </div>
            
            <button 
              onClick={() => grantSubM.mutate(grantForm)} 
              disabled={!grantForm.user_email || grantSubM.isPending} 
              className="btn btn-primary w-full h-11 rounded-xl text-[14px]"
            >
              {grantSubM.isPending ? 'Granting...' : `Grant ${GRANT_PLANS.find(p => p.code === grantForm.plan_code)?.label || 'plan'}`}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Override Dialog */}
      <Dialog open={showOverride} onOpenChange={setShowOverride}>
        <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border-h))] rounded-2xl">
          <DialogHeader><DialogTitle>Create manual override</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="t-label block mb-1.5">User email</label>
              <Input value={ovForm.user_email} onChange={e => setOvForm(f => ({ ...f, user_email: e.target.value }))} placeholder="user@example.com" className="h-10 rounded-lg text-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="t-label block mb-1.5">Feature</label>
                <Select value={ovForm.feature_key} onValueChange={v => setOvForm(f => ({ ...f, feature_key: v }))}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FEATURE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="t-label block mb-1.5">Action</label>
                <Select value={String(ovForm.enabled)} onValueChange={v => setOvForm(f => ({ ...f, enabled: v === 'true' }))}>
                  <SelectTrigger className="h-10 rounded-lg text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enable</SelectItem>
                    <SelectItem value="false">Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="t-label block mb-1.5">Expires on (optional)</label>
              <Input type="date" value={ovForm.expires_at} onChange={e => setOvForm(f => ({ ...f, expires_at: e.target.value }))} className="h-10 rounded-lg text-base" />
            </div>
            <div>
              <label className="t-label block mb-1.5">Reason</label>
              <Input value={ovForm.reason} onChange={e => setOvForm(f => ({ ...f, reason: e.target.value }))} placeholder="Example: gift, trial, or compensation" className="h-10 rounded-lg text-base" />
            </div>
            <button onClick={() => createOvM.mutate(ovForm)} disabled={!ovForm.user_email || createOvM.isPending} className="btn btn-primary w-full h-11 rounded-xl text-[14px]">
              {createOvM.isPending ? 'Creating...' : 'Create override'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
