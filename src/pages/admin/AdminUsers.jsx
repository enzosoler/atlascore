import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCcw, MoreVertical, Eye, Crown, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  fetchAllUsers, searchUsers, grantAccess, resetOnboarding, logAdminAction, deleteUser,
} from '@/lib/adminService';

function fmt(d) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const FILTERS = ['all', 'active', 'suspended', 'admin', 'trial', 'paid'];

export default function AdminUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);

  const { data: rawUsers, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => fetchAllUsers(page, 50),
    staleTime: 30_000,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['admin-users-search', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 10_000,
  });

  const users = useMemo(() => {
    let list = query.length >= 2 ? (searchResults?.users || searchResults || []) : (rawUsers?.users || rawUsers || []);
    if (!Array.isArray(list)) list = [];
    if (filter === 'suspended') list = list.filter((u) => u.is_suspended);
    else if (filter === 'active') list = list.filter((u) => !u.is_suspended);
    else if (filter === 'admin') list = list.filter((u) => u.role === 'admin');
    else if (filter === 'trial') list = list.filter((u) => u.subscriptions?.[0]?.status === 'trialing' || u.subscription_status === 'trialing');
    else if (filter === 'paid') list = list.filter((u) => u.subscriptions?.[0]?.status === 'active' || u.subscription_status === 'active');
    return list;
  }, [rawUsers, searchResults, query, filter]);

  const [grantDuration, setGrantDuration] = useState(null);
  const [grantLocale, setGrantLocale] = useState('en');

  const grantM = useMutation({
    mutationFn: ({ userId, duration, locale }) => grantAccess(userId, 'premium', 'admin_grant', duration, locale),
    onSuccess: () => { toast.success('Premium granted + email sent'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDialog(null); },
  });
  const resetM = useMutation({
    mutationFn: (userId) => resetOnboarding(userId),
    onSuccess: () => { toast.success('Onboarding reset'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDialog(null); },
  });
  const deleteM = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => { toast.success('User permanently deleted'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDialog(null); },
    onError: (err) => toast.error(err.message || 'Failed to delete user'),
  });

  const handleImpersonate = useCallback((u) => {
    logAdminAction('impersonation_started', u.id, { source: 'users_table' }).catch(() => {});
    navigate(`/AdminPanel/view-as/${u.id}`);
  }, [navigate]);

  const totalCount = (rawUsers?.users || rawUsers || []).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Users</h1>
        <span className="text-[11px] tabular-nums text-[hsl(var(--fg-3))]">
          {users.length} result{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or ID..."
            className="h-8 pl-8 text-[12px]"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-[8px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)] p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-[6px] px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                filter === f
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                  : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
          <RefreshCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[10px] border border-[hsl(var(--border)/0.5)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--fill)/0.4)]">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Name</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Email</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Role</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Plan</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Created</th>
              <th className="w-[44px] px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.25)]">
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <span className="inline-flex items-center gap-2 text-[12px] text-[hsl(var(--fg-3))]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading users...
                  </span>
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[12px] text-[hsl(var(--fg-3))]">
                  No users found
                </td>
              </tr>
            )}
            {users.map((u) => {
              const sub = u.subscriptions?.[0] || {};
              const subTier = sub.tier || u.subscription_tier || '\u2014';
              const subStatus = sub.status || u.subscription_status || '\u2014';
              const isActiveSub = subStatus === 'active' || subStatus === 'trialing';
              return (
                <tr
                  key={u.id}
                  className="cursor-pointer transition hover:bg-[hsl(var(--fill)/0.35)]"
                  onClick={() => navigate(`/AdminPanel/users/${u.id}`)}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[9px] font-bold text-[hsl(var(--brand))]">
                        {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                      </div>
                      <span className="truncate text-[12px] font-medium text-[hsl(var(--fg))]">{u.full_name || '\u2014'}</span>
                      {u.onboarding_completed && (
                        <span className="text-[hsl(var(--ok))] text-[10px]" title="Onboarding complete">&#10003;</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[180px] truncate px-3 py-2 text-[12px] text-[hsl(var(--fg-2))]">{u.email}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">{u.role || 'athlete'}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                      isActiveSub
                        ? 'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
                        : 'bg-[hsl(var(--fill)/0.8)] text-[hsl(var(--fg-3))]'
                    }`}>
                      {subTier} &middot; {subStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[11px] tabular-nums text-[hsl(var(--fg-3))]">{fmt(u.created_at)}</td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[hsl(var(--fg-3))] transition hover:bg-[hsl(var(--fill)/0.6)] hover:text-[hsl(var(--fg))]">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px]">
                        <DropdownMenuItem onClick={() => navigate(`/AdminPanel/users/${u.id}`)}>
                          <Eye className="mr-2 h-3 w-3" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImpersonate(u)}>
                          <Eye className="mr-2 h-3 w-3" /> Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDialog({ type: 'grant', userId: u.id, name: u.full_name || u.email })}>
                          <Crown className="mr-2 h-3 w-3" /> Grant Premium
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDialog({ type: 'reset', userId: u.id, name: u.full_name || u.email })}>
                          <RotateCcw className="mr-2 h-3 w-3" /> Reset Onboarding
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDialog({ type: 'delete', userId: u.id, name: u.full_name || u.email })}
                          className="text-[hsl(var(--err))] focus:text-[hsl(var(--err))]"
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!query && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] tabular-nums text-[hsl(var(--fg-3))]">Page {page}</p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={totalCount < 50} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Grant Premium Dialog */}
      <Dialog open={dialog?.type === 'grant'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[15px]">Grant Premium Access</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-[13px] text-[hsl(var(--fg-2))]">Grant premium access to <strong>{dialog?.name}</strong></p>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 7, label: '7d' },
                  { value: 30, label: '30d' },
                  { value: 90, label: '90d' },
                  { value: 365, label: '1yr' },
                  { value: null, label: 'Unlimited' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setGrantDuration(opt.value)}
                    className={`rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition ${
                      grantDuration === opt.value
                        ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                        : 'border-[hsl(var(--border)/0.5)] text-[hsl(var(--fg-3))] hover:bg-[hsl(var(--fill)/0.5)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Email language</label>
              <div className="flex gap-1.5">
                {[{ value: 'en', label: 'EN' }, { value: 'pt-BR', label: 'PT' }].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGrantLocale(opt.value)}
                    className={`rounded-[6px] border px-3 py-1 text-[11px] font-medium transition ${
                      grantLocale === opt.value
                        ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                        : 'border-[hsl(var(--border)/0.5)] text-[hsl(var(--fg-3))] hover:bg-[hsl(var(--fill)/0.5)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialog(null)}>Cancel</Button>
            <Button size="sm" onClick={() => grantM.mutate({ userId: dialog?.userId, duration: grantDuration, locale: grantLocale })} disabled={grantM.isPending}>
              {grantM.isPending ? 'Processing...' : 'Grant & notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Onboarding Dialog */}
      <Dialog open={dialog?.type === 'reset'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[15px]">Reset Onboarding</DialogTitle></DialogHeader>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">Reset onboarding for <strong>{dialog?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialog(null)}>Cancel</Button>
            <Button size="sm" onClick={() => resetM.mutate(dialog?.userId)} disabled={resetM.isPending}>
              {resetM.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={dialog?.type === 'delete'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[14px] text-[hsl(var(--err))]">Delete User Permanently</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-[13px] text-[hsl(var(--fg-2))]">Permanently delete <strong>{dialog?.name}</strong> and all their data:</p>
            <ul className="list-disc space-y-0.5 pl-5 text-[12px] text-[hsl(var(--fg-3))]">
              <li>Profile, workouts, nutrition logs</li>
              <li>Subscriptions and billing data</li>
              <li>AI coach messages and memory</li>
              <li>Progress photos and lab exams</li>
            </ul>
            <p className="text-[12px] font-medium text-[hsl(var(--err))]">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteM.mutate(dialog?.userId)} disabled={deleteM.isPending}>
              {deleteM.isPending ? 'Deleting...' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
