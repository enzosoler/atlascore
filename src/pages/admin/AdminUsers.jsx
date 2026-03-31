import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCcw, MoreVertical, Eye, Crown, RotateCcw } from 'lucide-react';
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
  fetchAllUsers, searchUsers, grantAccess, resetOnboarding, logAdminAction,
} from '@/lib/adminService';

function fmt(d) {
  if (!d) return '—';
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
    let list = query.length >= 2 ? (searchResults || []) : (rawUsers || []);
    if (filter === 'suspended') list = list.filter((u) => u.is_suspended);
    else if (filter === 'active') list = list.filter((u) => !u.is_suspended);
    else if (filter === 'admin') list = list.filter((u) => u.role === 'admin');
    else if (filter === 'trial') list = list.filter((u) => u.subscriptions?.[0]?.status === 'trialing' || u.subscription_status === 'trialing');
    else if (filter === 'paid') list = list.filter((u) => u.subscriptions?.[0]?.status === 'active' || u.subscription_status === 'active');
    return list;
  }, [rawUsers, searchResults, query, filter]);

  const grantM = useMutation({
    mutationFn: (userId) => grantAccess(userId, 'premium', 'admin_grant'),
    onSuccess: () => { toast.success('Premium granted'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDialog(null); },
  });
  const resetM = useMutation({
    mutationFn: (userId) => resetOnboarding(userId),
    onSuccess: () => { toast.success('Onboarding reset'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDialog(null); },
  });

  const handleImpersonate = useCallback((u) => {
    logAdminAction('impersonation_started', u.id, { source: 'users_table' }).catch(() => {});
    navigate(`/AdminPanel/view-as/${u.id}`);
  }, [navigate]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">Users</h1>
        <p className="text-[13px] text-[hsl(var(--fg-3))]">Manage platform users</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search by name, email, or ID..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCcw className="h-4 w-4" /></Button>
      </div>

      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => { setFilter(f); setPage(1); }}
            className={`rounded-[8px] px-3 py-1.5 text-[12px] font-medium capitalize transition ${filter === f ? 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-[hsl(var(--border)/0.6)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px] uppercase">Name</TableHead>
              <TableHead className="text-[11px] uppercase">Email</TableHead>
              <TableHead className="text-[11px] uppercase">Role</TableHead>
              <TableHead className="text-[11px] uppercase">Plan</TableHead>
              <TableHead className="text-[11px] uppercase">Onboarding</TableHead>
              <TableHead className="text-[11px] uppercase">Created</TableHead>
              <TableHead className="w-[60px] text-[11px] uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">Loading...</TableCell></TableRow>}
            {!isLoading && users.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">No users found.</TableCell></TableRow>}
            {users.map((u) => {
              const sub = u.subscriptions?.[0] || {};
              const subTier = sub.tier || u.subscription_tier || '—';
              const subStatus = sub.status || u.subscription_status || '—';
              return (
                <TableRow key={u.id} className="cursor-pointer hover:bg-[hsl(var(--fill)/0.4)]" onClick={() => navigate(`/AdminPanel/users/${u.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[10px] font-bold text-[hsl(var(--brand))]">
                        {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium text-[hsl(var(--fg))]">{u.full_name || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-[13px] text-[hsl(var(--fg-2))]">{u.email}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{u.role || 'athlete'}</Badge></TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${subStatus === 'active' || subStatus === 'trialing' ? 'bg-[hsl(var(--ok)/0.15)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]'}`}>
                      {subTier} · {subStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.onboarding_completed ? <span className="text-[hsl(var(--ok))]">&#10003;</span> : <span className="text-[hsl(var(--fg-3))]">—</span>}</TableCell>
                  <TableCell className="text-[13px] text-[hsl(var(--fg-3))]">{fmt(u.created_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/AdminPanel/users/${u.id}`)}><Eye className="mr-2 h-3.5 w-3.5" /> View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImpersonate(u)}><Eye className="mr-2 h-3.5 w-3.5" /> Impersonate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDialog({ type: 'grant', userId: u.id, name: u.full_name || u.email })}><Crown className="mr-2 h-3.5 w-3.5" /> Grant Premium</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDialog({ type: 'reset', userId: u.id, name: u.full_name || u.email })}><RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset Onboarding</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!query && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[hsl(var(--fg-3))]">Page {page}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={(rawUsers || []).length < 50} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={dialog?.type === 'grant'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant Premium</DialogTitle></DialogHeader>
          <p className="text-[14px] text-[hsl(var(--fg-2))]">Grant premium access to <strong>{dialog?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => grantM.mutate(dialog?.userId)} disabled={grantM.isPending}>{grantM.isPending ? 'Processing...' : 'Confirm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={dialog?.type === 'reset'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Onboarding</DialogTitle></DialogHeader>
          <p className="text-[14px] text-[hsl(var(--fg-2))]">Reset onboarding for <strong>{dialog?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => resetM.mutate(dialog?.userId)} disabled={resetM.isPending}>{resetM.isPending ? 'Processing...' : 'Confirm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
