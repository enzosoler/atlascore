import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { fetchAllUsers, updateUserRole } from '@/lib/adminService';

const ROLES = ['athlete', 'coach', 'nutritionist', 'clinician', 'admin'];

const ROLE_BADGE = {
  admin: 'destructive',
  coach: 'default',
  nutritionist: 'success',
  clinician: 'warning',
  athlete: 'secondary',
};

export default function AdminRoles() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => fetchAllUsers(1, 100),
  });

  const updateRoleM = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-roles'] });
      toast.success('Role updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const users = (data?.users || []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Roles & Permissions</h1>
        <span className="text-[11px] tabular-nums text-[hsl(var(--fg-3))]">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-[12px]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[10px] border border-[hsl(var(--border)/0.5)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--fill)/0.4)]">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">User</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Email</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Current Role</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">Change to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.25)]">
            {isLoading && (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <span className="inline-flex items-center gap-2 text-[12px] text-[hsl(var(--fg-3))]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading users...
                  </span>
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[12px] text-[hsl(var(--fg-3))]">
                  No users found
                </td>
              </tr>
            )}
            {users.map((u) => {
              const currentRole = u.role || 'athlete';
              return (
                <tr key={u.id} className="transition hover:bg-[hsl(var(--fill)/0.35)]">
                  <td className="px-3 py-2">
                    <span className="text-[12px] font-medium text-[hsl(var(--fg))]">{u.full_name || '\u2014'}</span>
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-[12px] text-[hsl(var(--fg-2))]">{u.email}</td>
                  <td className="px-3 py-2">
                    <Badge variant={ROLE_BADGE[currentRole] || 'secondary'} className="text-[9px] px-1.5 py-0.5">
                      {currentRole}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-0.5">
                      {ROLES.filter((r) => r !== currentRole).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => updateRoleM.mutate({ userId: u.id, role: r })}
                          disabled={updateRoleM.isPending}
                          className="rounded-[5px] border border-[hsl(var(--border)/0.4)] px-1.5 py-0.5 text-[9px] font-medium capitalize text-[hsl(var(--fg-3))] transition hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--brand)/0.06)] hover:text-[hsl(var(--brand))] disabled:opacity-40"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
