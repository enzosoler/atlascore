import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchAllUsers, updateUserRole } from '@/lib/adminService';

const ROLES = ['athlete', 'coach', 'nutritionist', 'clinician', 'admin'];

const ROLE_COLORS = {
  admin: 'badge-err',
  coach: 'badge-blue',
  nutritionist: 'badge-ok',
  clinician: 'badge-warn',
  athlete: 'badge-neutral',
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
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Roles & Permissions</h2>
        <p className="t-caption mt-1">Change a user's platform role</p>
      </div>

      <Input
        placeholder="Search by email or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm h-10 rounded-lg"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-[hsl(var(--fg-2))] gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
        </div>
      ) : (
        <div className="surface divide-y divide-[hsl(var(--border-h))]">
          {users.map((u) => (
            <div key={u.id} className="px-5 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[hsl(var(--fg))] truncate">{u.email || u.full_name}</p>
                {u.full_name && u.email && (
                  <p className="t-caption truncate">{u.full_name}</p>
                )}
              </div>
              <Select
                value={u.role || 'athlete'}
                onValueChange={(role) => updateRoleM.mutate({ userId: u.id, role })}
                disabled={updateRoleM.isPending}
              >
                <SelectTrigger className="w-36 h-8 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
