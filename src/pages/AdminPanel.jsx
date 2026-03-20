import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRoleAndSubscription } from '@/hooks/useRoleAndSubscription';
import {
  fetchAllUsers,
  searchUsers,
  updateUserRole,
  updateSubscriptionTier,
  updateSubscriptionStatus,
  extendTrial,
  grantAccess,
  revokeAccess,
  getAdminMetrics,
} from '@/lib/adminService';
import { SafePageBoundary as StablePage } from '@/components/shared/StablePage';
import { ChevronDown, Search, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRoleAndSubscription(user?.id);

  // Metrics
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Users table
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load metrics
  useEffect(() => {
    async function load() {
      try {
        setMetricsLoading(true);
        const data = await getAdminMetrics();
        setMetrics(data);
        setMetricsError(null);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setMetricsError(error.message);
      } finally {
        setMetricsLoading(false);
      }
    }

    load();
  }, []);

  // Load users
  useEffect(() => {
    async function load() {
      try {
        setUsersLoading(true);
        if (searchQuery) {
          const data = await searchUsers(searchQuery);
          setUsers(data);
          setTotalUsers(data.length);
        } else {
          const result = await fetchAllUsers(page, pageSize, searchQuery);
          setUsers(result.users);
          setTotalUsers(result.total);
        }
        setUsersError(null);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsersError(error.message);
      } finally {
        setUsersLoading(false);
      }
    }

    load();
  }, [page, pageSize, searchQuery]);

  // Admin actions
  const handleUpdateRole = useCallback(async (userId, newRole) => {
    try {
      setActionLoading(true);
      await updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      setSelectedUser(null);
      // Refresh users
      const result = await fetchAllUsers(page, pageSize);
      setUsers(result.users);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [page, pageSize]);

  const handleUpdateTier = useCallback(async (userId, newTier) => {
    try {
      setActionLoading(true);
      await updateSubscriptionTier(userId, newTier);
      toast.success(`Tier updated to ${newTier}`);
      setSelectedUser(null);
      const result = await fetchAllUsers(page, pageSize);
      setUsers(result.users);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [page, pageSize]);

  const handleUpdateStatus = useCallback(async (userId, newStatus) => {
    try {
      setActionLoading(true);
      await updateSubscriptionStatus(userId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setSelectedUser(null);
      const result = await fetchAllUsers(page, pageSize);
      setUsers(result.users);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [page, pageSize]);

  const handleExtendTrial = useCallback(async (userId) => {
    try {
      setActionLoading(true);
      await extendTrial(userId, 7);
      toast.success('Trial extended by 7 days');
      setSelectedUser(null);
      const result = await fetchAllUsers(page, pageSize);
      setUsers(result.users);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [page, pageSize]);

  const handleGrantAccess = useCallback(async (userId) => {
    try {
      setActionLoading(true);
      await grantAccess(userId, 'pro', 'Admin grant');
      toast.success('Access granted');
      setSelectedUser(null);
      const result = await fetchAllUsers(page, pageSize);
      setUsers(result.users);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [page, pageSize]);

  const handleRevokeAccess = useCallback(async (userId) => {
    try {
      setActionLoading(true);
      await revokeAccess(userId);
      toast.success('Access revoked');
      setSelectedUser(null);
      const result = await fetchAllUsers(page, pageSize);
      setUsers(result.users);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [page, pageSize]);

  // Check authorization
  if (roleLoading) {
    return (
      <StablePage>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </StablePage>
    );
  }

  if (role !== 'admin') {
    return (
      <StablePage>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--err))]" />
            <p className="text-lg font-semibold">Access Denied</p>
            <p className="text-sm text-[hsl(var(--fg-2))]">Only admins can access this panel.</p>
          </div>
        </div>
      </StablePage>
    );
  }

  return (
    <StablePage>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--fg))]">Admin Panel</h1>
          <p className="text-[hsl(var(--fg-2))] mt-1">Manage users, roles, and subscriptions</p>
        </div>

        {/* Metrics */}
        {metricsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : metricsError ? (
          <div className="rounded-lg bg-[hsl(var(--err)/0.08)] border border-[hsl(var(--err)/0.2)] p-4">
            <p className="text-sm text-[hsl(var(--err))]">{metricsError}</p>
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={metrics.totalUsers} />
            <MetricCard label="Active Subscriptions" value={metrics.activeSubscriptions} />
            <MetricCard label="Trialing" value={metrics.trialingSubscriptions} />
            <MetricCard label="Admins" value={metrics.adminCount} />
          </div>
        ) : null}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-2))]" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg))] placeholder-[hsl(var(--fg-2))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" 
          />
        </div>

        {/* Users Table */}
        {usersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : usersError ? (
          <div className="rounded-lg bg-[hsl(var(--err)/0.08)] border border-[hsl(var(--err)/0.2)] p-4">
            <p className="text-sm text-[hsl(var(--err))]">{usersError}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-[hsl(var(--border))] p-8 text-center">
            <p className="text-[hsl(var(--fg-2))]">No users found</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[hsl(var(--shell))]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">Trial End</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--fg))]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const subscription = user.subscriptions?.[0];
                    return (
                      <tr key={user.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--shell)/0.5)]">
                        <td className="px-4 py-3 text-sm text-[hsl(var(--fg))] font-mono">{user.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--fg))]">{user.role}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--fg))]">{subscription?.tier || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(subscription?.status)}`}>
                            {subscription?.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--fg-2))]">
                          {subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--fg-2))]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-[hsl(var(--primary))] hover:underline"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--shell))]">
              <p className="text-sm text-[hsl(var(--fg-2))]">
                Page {page} of {Math.ceil(totalUsers / pageSize)} ({totalUsers} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-[hsl(var(--border))] text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(totalUsers / pageSize)}
                  className="px-3 py-1 rounded border border-[hsl(var(--border))] text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Actions Modal */}
        {selectedUser && (
          <UserActionsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdateRole={handleUpdateRole}
            onUpdateTier={handleUpdateTier}
            onUpdateStatus={handleUpdateStatus}
            onExtendTrial={handleExtendTrial}
            onGrantAccess={handleGrantAccess}
            onRevokeAccess={handleRevokeAccess}
            loading={actionLoading}
          />
        )}
      </div>
    </StablePage>
  );
};

// ─── COMPONENTS ────────────────────────────────────────────────────────────

const MetricCard = ({ label, value }) => (
  <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
    <p className="text-sm text-[hsl(var(--fg-2))] mb-1">{label}</p>
    <p className="text-2xl font-bold text-[hsl(var(--fg))]">{value}</p>
  </div>
);

const UserActionsModal = ({
  user,
  onClose,
  onUpdateRole,
  onUpdateTier,
  onUpdateStatus,
  onExtendTrial,
  onGrantAccess,
  onRevokeAccess,
  loading,
}) => {
  const subscription = user.subscriptions?.[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[hsl(var(--card))] rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--fg))]">Manage User</h2>
        <p className="text-sm text-[hsl(var(--fg-2))] font-mono">{user.id}</p>

        {/* Role */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Role</label>
          <select
            value={user.role}
            onChange={(e) => onUpdateRole(user.id, e.target.value)}
            disabled={loading}
            className="w-full mt-1 px-3 py-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[hsl(var(--fg))] disabled:opacity-50"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
            <option value="nutritionist">Nutritionist</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {/* Tier */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Tier</label>
          <select
            value={subscription?.tier || 'free'}
            onChange={(e) => onUpdateTier(user.id, e.target.value)}
            disabled={loading}
            className="w-full mt-1 px-3 py-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[hsl(var(--fg))] disabled:opacity-50"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
            <option value="internal">Internal</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Status</label>
          <select
            value={subscription?.status || 'inactive'}
            onChange={(e) => onUpdateStatus(user.id, e.target.value)}
            disabled={loading}
            className="w-full mt-1 px-3 py-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[hsl(var(--fg))] disabled:opacity-50"
          >
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="granted">Granted</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={() => onExtendTrial(user.id)}
            disabled={loading || subscription?.status !== 'trialing'}
            className="px-3 py-2 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-medium disabled:opacity-50"
          >
            Extend Trial
          </button>
          <button
            onClick={() => onGrantAccess(user.id)}
            disabled={loading}
            className="px-3 py-2 rounded bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))] text-sm font-medium disabled:opacity-50"
          >
            Grant Access
          </button>
          <button
            onClick={() => onRevokeAccess(user.id)}
            disabled={loading}
            className="px-3 py-2 rounded bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))] text-sm font-medium disabled:opacity-50 col-span-2"
          >
            Revoke Access
          </button>
        </div>

        {/* Close */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded border border-[hsl(var(--border))] text-[hsl(var(--fg))] font-medium disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function getStatusBadgeClass(status) {
  switch (status) {
    case 'active':
      return 'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]';
    case 'trialing':
      return 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]';
    case 'granted':
      return 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]';
    case 'past_due':
      return 'bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]';
    case 'canceled':
    case 'expired':
    case 'inactive':
      return 'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]';
    default:
      return 'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]';
  }
}

export default AdminPanel