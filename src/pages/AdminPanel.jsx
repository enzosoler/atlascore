import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRoleAndSubscription } from '@/hooks/useRoleAndSubscription';
import {
  fetchAllUsers,
  searchUsers,
  fetchAllSubscriptions,
  fetchAuditLogs,
  getAdminMetrics,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  resetOnboarding,
  updateSubscriptionTier,
  updateSubscriptionStatus,
  extendTrial,
  grantAccess,
  revokeAccess,
  resyncBillingStatus,
} from '@/lib/adminService';
import { SafePageBoundary as StablePage } from '@/components/shared/StablePage';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  TrendingUp,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Users', 'Subscriptions', 'Roles', 'Audit Log'];

const ROLES = ['athlete', 'user', 'admin', 'coach', 'nutritionist', 'clinician'];

const TIERS = ['free', 'pro', 'premium', 'internal', 'custom'];

const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'granted', 'past_due', 'canceled', 'expired', 'inactive'];

// ─── STATUS / BADGE HELPERS ──────────────────────────────────────────────────

function statusBadge(status) {
  const map = {
    active:   'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] ring-1 ring-[hsl(var(--ok)/0.25)]',
    granted:  'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] ring-1 ring-[hsl(var(--ok)/0.25)]',
    trialing: 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.25)]',
    past_due: 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] ring-1 ring-[hsl(var(--warn)/0.25)]',
    canceled: 'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.2)]',
    expired:  'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))] ring-1 ring-[hsl(var(--err)/0.2)]',
    inactive: 'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]',
  };
  return map[status] || 'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]';
}

function roleBadge(role) {
  const map = {
    admin:        'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]',
    coach:        'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
    nutritionist: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
    clinician:    'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]',
    athlete:      'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]',
    user:         'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]',
  };
  return map[role] || 'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]';
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtFull(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function shortId(id) {
  if (!id) return '—';
  return id.slice(0, 8) + '…';
}

// ─── CONFIRMATION MODAL ──────────────────────────────────────────────────────

function ConfirmModal({ title, description, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-xl)] space-y-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">{title}</h3>
          {description && <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">{description}</p>}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-xl border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 h-9 rounded-xl text-[13px] font-medium transition-colors disabled:opacity-50',
              danger
                ? 'bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err)/0.88)]'
                : 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.88)]'
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDetailsModal({ user, onClose, onUpdated }) {
  const latestSubscription = user?.subscriptions?.[0] || null;
  const [tier, setTier] = useState(latestSubscription?.tier || 'free');
  const [status, setStatus] = useState(latestSubscription?.status || 'inactive');
  const [saving, setSaving] = useState(false);
  const hasSubscription = Boolean(latestSubscription?.user_id);
  const hasChanges =
    hasSubscription &&
    (tier !== (latestSubscription?.tier || 'free') ||
      status !== (latestSubscription?.status || 'inactive'));

  const handleSave = async () => {
    if (!hasSubscription) return;

    setSaving(true);
    try {
      if (tier !== latestSubscription?.tier) {
        await updateSubscriptionTier(user.id, tier);
      }
      if (status !== latestSubscription?.status) {
        await updateSubscriptionStatus(user.id, status);
      }
      toast.success('User details updated');
      onUpdated?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-xl)] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-semibold text-[hsl(var(--fg))]">User details</h3>
            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
              Review account, role and latest subscription state.
            </p>
          </div>
          <button onClick={onClose} className="text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--shell)/0.5)] p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Account</p>
            <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">
              {user?.full_name || user?.display_name || user?.email || '—'}
            </p>
            <p className="text-[12px] text-[hsl(var(--fg-2))] break-all">{user?.email || 'No email available'}</p>
            <p className="text-[12px] font-mono text-[hsl(var(--fg-2))] break-all">{user?.id || '—'}</p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--shell)/0.5)] p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge label={user?.role || '—'} className={roleBadge(user?.role)} />
              {user?.is_suspended ? (
                <Badge label="suspended" className="bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]" />
              ) : null}
            </div>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">Joined {fmt(user?.created_at)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--shell)/0.5)] p-4 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Subscription</p>
            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
              {hasSubscription ? 'Latest subscription can be edited below.' : 'No subscription record found for this user yet.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-[12px] font-medium text-[hsl(var(--fg))]">Tier</label>
              <select
                value={tier}
                onChange={(event) => setTier(event.target.value)}
                disabled={!hasSubscription || saving}
                className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
              >
                {TIERS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-[12px] font-medium text-[hsl(var(--fg))]">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={!hasSubscription || saving}
                className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
              >
                {SUBSCRIPTION_STATUSES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2 text-[12px] text-[hsl(var(--fg-2))] sm:grid-cols-2">
            <p>Trial ends: {fmt(latestSubscription?.trial_ends_at)}</p>
            <p>Current period ends: {fmt(latestSubscription?.current_period_ends_at)}</p>
            <p>Provider: {latestSubscription?.provider || 'manual'}</p>
            <p>Created: {fmt(latestSubscription?.created_at)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1 h-10 rounded-xl bg-[hsl(var(--primary))] text-[13px] font-medium text-white hover:bg-[hsl(var(--primary)/0.88)] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ACTION DROPDOWN ─────────────────────────────────────────────────────────

function ActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const enabledItems = items.filter((i) => i !== null);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))] transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-md)] py-1 overflow-hidden">
          {enabledItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { item.onClick(); setOpen(false); }}
              disabled={item.disabled}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                item.danger
                  ? 'text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.07)]'
                  : 'text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))]'
              )}
            >
              {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon, trend, sub }) {
  return (
    <div className="atlas-card px-5 py-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 text-[28px] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">{value ?? '—'}</p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
      {(trend || sub) && (
        <p className="text-[12px] text-[hsl(var(--fg-2))]">{trend || sub}</p>
      )}
    </div>
  );
}

// ─── ERROR STATE ─────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--err)/0.25)] bg-[hsl(var(--err)/0.06)] p-6 flex items-start gap-3">
      <AlertCircle className="h-4 w-4 text-[hsl(var(--err))] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[hsl(var(--err))]">Something went wrong</p>
        <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))] break-words">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 text-[12px] text-[hsl(var(--primary))] hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyState({ message }) {
  return (
    <div className="atlas-empty py-16 text-center">
      <p className="text-[14px] text-[hsl(var(--fg-2))]">{message}</p>
    </div>
  );
}

// ─── TABLE WRAPPER ───────────────────────────────────────────────────────────

function TableWrap({ children }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.82)] shadow-[var(--shadow-xs)]">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">{children}</table>
      </div>
    </div>
  );
}

function Th({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))] bg-[hsl(var(--shell))]', className)}>
      {children}
    </th>
  );
}

function Td({ children, className }) {
  return (
    <td className={cn('px-4 py-3 text-[hsl(var(--fg))] align-middle', className)}>
      {children}
    </td>
  );
}

function Badge({ label, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium', className)}>
      {label}
    </span>
  );
}

function Pagination({ page, total, pageSize, onPrev, onNext }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--shell)/0.5)]">
      <p className="text-[12px] text-[hsl(var(--fg-2))]">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="h-7 px-3 rounded-lg border border-[hsl(var(--border))] text-[12px] text-[hsl(var(--fg))] disabled:opacity-40 hover:bg-[hsl(var(--fill))] transition-colors"
        >
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="h-7 px-3 rounded-lg border border-[hsl(var(--border))] text-[12px] text-[hsl(var(--fg))] disabled:opacity-40 hover:bg-[hsl(var(--fill))] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function OverviewTab() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminMetrics();
      setMetrics(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard label="Total Users"        value={metrics?.totalUsers}          icon={Users}       />
        <MetricCard label="Active Subs"        value={metrics?.activeSubscriptions} icon={CheckCircle2} />
        <MetricCard label="Trialing"           value={metrics?.trialingSubscriptions} icon={Clock}    />
        <MetricCard label="Admins"             value={metrics?.adminCount}          icon={Shield}      />
        <MetricCard label="New (7 days)"       value={metrics?.newUsersLast7Days}   icon={TrendingUp}  />
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--shell)/0.4)] p-5 space-y-2">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">DB Schema Requirements</p>
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed">
          Suspend/unsuspend requires <code className="font-mono text-[11px] bg-[hsl(var(--shell))] px-1 rounded">is_suspended boolean</code> on <code className="font-mono text-[11px] bg-[hsl(var(--shell))] px-1 rounded">profiles</code>.
          Onboarding reset requires <code className="font-mono text-[11px] bg-[hsl(var(--shell))] px-1 rounded">onboarding_completed boolean</code> on <code className="font-mono text-[11px] bg-[hsl(var(--shell))] px-1 rounded">profiles</code>.
          Audit logging requires the <code className="font-mono text-[11px] bg-[hsl(var(--shell))] px-1 rounded">admin_audit_logs</code> table.
          See <code className="font-mono text-[11px] bg-[hsl(var(--shell))] px-1 rounded">supabase_admin_console.sql</code> at the project root.
        </p>
      </div>
    </div>
  );
}

// ─── USERS TAB ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);
  const [roleEdit, setRoleEdit] = useState(null); // { userId, currentRole }
  const [selectedRole, setSelectedRole] = useState('');

  const searchTimeout = useRef(null);

  const load = useCallback(async (p = page, q = search) => {
    setLoading(true);
    setError(null);
    try {
      const result = q.trim()
        ? await searchUsers(q.trim())
        : await fetchAllUsers(p, pageSize);
      setUsers(result.users);
      setTotal(result.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      load(1, value);
    }, 350);
  };

  const runAction = useCallback(async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setConfirm(null);
      setRoleEdit(null);
      await load(page, search);
    } catch (e) {
      toast.error(e.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }, [page, search, load]);

  const subscription = (u) => u.subscriptions?.[0] || null;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--fg-2))]" />
        <input
          type="text"
          placeholder="Search by ID, name, or email…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[13px] text-[hsl(var(--fg))] placeholder-[hsl(var(--fg-2))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
        />
      </div>

      {error && <ErrorState message={error} onRetry={() => load(page, search)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Trial End</Th>
              <Th>Joined</Th>
              <Th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const sub = subscription(u);
              const isSuspended = u.is_suspended;
              return (
                <tr key={u.id} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--fill)/0.5)] transition-colors">
                  <Td>
                    <div>
                      <p className="font-medium text-[hsl(var(--fg))]">
                        {u.full_name || u.display_name || u.email || '—'}
                      </p>
                      <p className="text-[11px] font-mono text-[hsl(var(--fg-2))]">{shortId(u.id)}</p>
                      {u.email && <p className="text-[11px] text-[hsl(var(--fg-2))]">{u.email}</p>}
                    </div>
                  </Td>
                  <Td>
                    <Badge label={u.role || '—'} className={roleBadge(u.role)} />
                    {isSuspended && <Badge label="suspended" className="ml-1 bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]" />}
                  </Td>
                  <Td>
                    <span className="text-[hsl(var(--fg-2))]">{sub?.tier || '—'}</span>
                  </Td>
                  <Td>
                    {sub ? (
                      <Badge label={sub.status} className={statusBadge(sub.status)} />
                    ) : (
                      <span className="text-[hsl(var(--fg-2))]">—</span>
                    )}
                  </Td>
                  <Td className="text-[hsl(var(--fg-2))]">{fmt(sub?.trial_ends_at)}</Td>
                  <Td className="text-[hsl(var(--fg-2))]">{fmt(u.created_at)}</Td>
                  <Td>
                    <ActionMenu items={[
                      {
                        label: 'View details',
                        icon: User,
                        onClick: () => setDetailsUser(u),
                      },
                      {
                        label: 'Edit Role',
                        icon: UserCheck,
                        onClick: () => { setRoleEdit({ userId: u.id, name: u.full_name || shortId(u.id) }); setSelectedRole(u.role || 'athlete'); },
                      },
                      {
                        label: isSuspended ? 'Unsuspend' : 'Suspend',
                        icon: isSuspended ? UserPlus : UserMinus,
                        onClick: () => setConfirm({ type: isSuspended ? 'unsuspend' : 'suspend', user: u }),
                        danger: !isSuspended,
                      },
                      {
                        label: 'Grant Access',
                        icon: ShieldCheck,
                        onClick: () => setConfirm({ type: 'grant', user: u }),
                      },
                      {
                        label: 'Revoke Access',
                        icon: UserMinus,
                        danger: true,
                        onClick: () => setConfirm({ type: 'revoke', user: u }),
                      },
                      {
                        label: 'Extend Trial (+7d)',
                        icon: Clock,
                        disabled: sub?.status !== 'trialing',
                        onClick: () => setConfirm({ type: 'extendTrial', user: u }),
                      },
                      {
                        label: 'Reset Onboarding',
                        icon: RefreshCw,
                        danger: true,
                        onClick: () => setConfirm({ type: 'resetOnboarding', user: u }),
                      },
                    ]} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}

      {!loading && !search && (
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      {/* Role Edit Modal */}
      {detailsUser && (
        <UserDetailsModal
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
          onUpdated={() => load(page, search)}
        />
      )}

      {roleEdit && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-xl)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Edit Role</h3>
              <button onClick={() => setRoleEdit(null)} className="text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[12px] font-mono text-[hsl(var(--fg-2))]">{roleEdit.name}</p>
            <div>
              <label className="text-[12px] font-medium text-[hsl(var(--fg))] block mb-2">New role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRoleEdit(null)}
                className="flex-1 h-9 rounded-xl border border-[hsl(var(--border))] text-[13px] text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => runAction(
                  () => updateUserRole(roleEdit.userId, selectedRole),
                  `Role updated to ${selectedRole}`
                )}
                disabled={actionLoading}
                className="flex-1 h-9 rounded-xl bg-[hsl(var(--primary))] text-[13px] font-medium text-white hover:bg-[hsl(var(--primary)/0.88)] transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm && (
        <ConfirmModal
          title={
            confirm.type === 'suspend'         ? 'Suspend User'
            : confirm.type === 'unsuspend'     ? 'Unsuspend User'
            : confirm.type === 'grant'         ? 'Grant Access'
            : confirm.type === 'revoke'        ? 'Revoke Access'
            : confirm.type === 'extendTrial'   ? 'Extend Trial +7 Days'
            : confirm.type === 'resetOnboarding' ? 'Reset Onboarding'
            : 'Confirm'
          }
          description={
            confirm.type === 'suspend'         ? `Suspend ${confirm.user.full_name || shortId(confirm.user.id)}? They will lose access.`
            : confirm.type === 'unsuspend'     ? `Restore access for ${confirm.user.full_name || shortId(confirm.user.id)}.`
            : confirm.type === 'grant'         ? `Grant pro access to ${confirm.user.full_name || shortId(confirm.user.id)}.`
            : confirm.type === 'revoke'        ? `Revoke access for ${confirm.user.full_name || shortId(confirm.user.id)}. This sets subscription to inactive.`
            : confirm.type === 'extendTrial'   ? `Extend trial by 7 days for ${confirm.user.full_name || shortId(confirm.user.id)}.`
            : confirm.type === 'resetOnboarding' ? `Reset onboarding flags for ${confirm.user.full_name || shortId(confirm.user.id)}. They will see the onboarding flow again.`
            : null
          }
          confirmLabel={
            confirm.type === 'suspend'         ? 'Suspend'
            : confirm.type === 'unsuspend'     ? 'Unsuspend'
            : confirm.type === 'grant'         ? 'Grant'
            : confirm.type === 'revoke'        ? 'Revoke'
            : confirm.type === 'extendTrial'   ? 'Extend'
            : confirm.type === 'resetOnboarding' ? 'Reset'
            : 'Confirm'
          }
          danger={['suspend', 'revoke', 'resetOnboarding'].includes(confirm.type)}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const { type, user } = confirm;
            const actions = {
              suspend:         () => runAction(() => suspendUser(user.id),         'User suspended'),
              unsuspend:       () => runAction(() => unsuspendUser(user.id),       'User unsuspended'),
              grant:           () => runAction(() => grantAccess(user.id, 'pro', 'Admin console grant'), 'Access granted'),
              revoke:          () => runAction(() => revokeAccess(user.id),        'Access revoked'),
              extendTrial:     () => runAction(() => extendTrial(user.id, 7),      'Trial extended by 7 days'),
              resetOnboarding: () => runAction(() => resetOnboarding(user.id),     'Onboarding reset'),
            };
            actions[type]?.();
          }}
        />
      )}
    </div>
  );
}

// ─── SUBSCRIPTIONS TAB ───────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAllSubscriptions(p, pageSize);
      setSubs(result.subscriptions);
      setTotal(result.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { load(page); }, [page]);

  const runAction = useCallback(async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setConfirm(null);
      await load(page);
    } catch (e) {
      toast.error(e.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }, [page, load]);

  return (
    <div className="space-y-4">
      {error && <ErrorState message={error} onRetry={() => load(page)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : subs.length === 0 ? (
        <EmptyState message="No subscriptions found." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>User ID</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Provider</Th>
              <Th>Trial End</Th>
              <Th>Period End</Th>
              <Th>Created</Th>
              <Th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--fill)/0.5)] transition-colors">
                <Td>
                  <p className="font-mono text-[12px] text-[hsl(var(--fg-2))]">{shortId(s.user_id)}</p>
                </Td>
                <Td>
                  <span className="text-[hsl(var(--fg))]">{s.tier || '—'}</span>
                </Td>
                <Td>
                  <Badge label={s.status || '—'} className={statusBadge(s.status)} />
                </Td>
                <Td className="text-[hsl(var(--fg-2))]">{s.provider || 'manual'}</Td>
                <Td className="text-[hsl(var(--fg-2))]">{fmt(s.trial_ends_at)}</Td>
                <Td className="text-[hsl(var(--fg-2))]">{fmt(s.current_period_ends_at)}</Td>
                <Td className="text-[hsl(var(--fg-2))]">{fmt(s.created_at)}</Td>
                <Td>
                  <ActionMenu items={[
                    {
                      label: 'Activate Premium',
                      icon: CheckCircle2,
                      onClick: () => setConfirm({ type: 'activate', sub: s }),
                    },
                    {
                      label: 'Grant Trial (+7d)',
                      icon: Clock,
                      onClick: () => setConfirm({ type: 'grantTrial', sub: s }),
                    },
                    {
                      label: 'Revoke Access',
                      icon: UserMinus,
                      danger: true,
                      onClick: () => setConfirm({ type: 'revoke', sub: s }),
                    },
                    {
                      label: 'Resync Billing (backend)',
                      icon: RefreshCw,
                      disabled: true,
                      onClick: () => setConfirm({ type: 'resync', sub: s }),
                    },
                  ]} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {!loading && (
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={
            confirm.type === 'activate'   ? 'Activate Premium'
            : confirm.type === 'grantTrial' ? 'Grant Trial +7 Days'
            : confirm.type === 'revoke'   ? 'Revoke Access'
            : confirm.type === 'resync'   ? 'Resync Billing'
            : 'Confirm'
          }
          description={
            confirm.type === 'activate'   ? 'Set this subscription to active with pro tier.'
            : confirm.type === 'grantTrial' ? 'Extend this subscription trial by 7 days.'
            : confirm.type === 'revoke'   ? 'Set this subscription to inactive. The user will lose access.'
            : confirm.type === 'resync'   ? 'Request a billing status resync. This requires a backend Edge Function.'
            : null
          }
          confirmLabel={
            confirm.type === 'activate'   ? 'Activate'
            : confirm.type === 'grantTrial' ? 'Grant'
            : confirm.type === 'revoke'   ? 'Revoke'
            : confirm.type === 'resync'   ? 'Request Resync'
            : 'Confirm'
          }
          danger={confirm.type === 'revoke'}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const { type, sub } = confirm;
            if (type === 'activate')    runAction(() => grantAccess(sub.user_id, 'pro', 'Admin activate'), 'Subscription activated');
            if (type === 'grantTrial')  runAction(() => extendTrial(sub.user_id, 7), 'Trial extended');
            if (type === 'revoke')      runAction(() => revokeAccess(sub.user_id), 'Access revoked');
            if (type === 'resync')      runAction(() => resyncBillingStatus(sub.user_id), 'Resync requested');
          }}
        />
      )}
    </div>
  );
}

// ─── ROLES TAB ───────────────────────────────────────────────────────────────

function RolesTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch first 200 users for role overview
      const result = await fetchAllUsers(1, 200);
      setUsers(result.users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = (user, newRole) => {
    setConfirm({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirm) return;
    setSaving(confirm.user.id);
    try {
      await updateUserRole(confirm.user.id, confirm.newRole);
      toast.success(`Role updated to ${confirm.newRole}`);
      setConfirm(null);
      await load();
    } catch (e) {
      toast.error(e.message || 'Failed to update role');
    } finally {
      setSaving(null);
    }
  };

  // Group users by role
  const grouped = ROLES.reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {ROLES.map((r) => (
          <div key={r} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center space-y-1">
            <p className="text-[22px] font-bold text-[hsl(var(--fg))]">{grouped[r]?.length ?? 0}</p>
            <Badge label={r} className={cn(roleBadge(r), 'text-[12px]')} />
          </div>
        ))}
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Current Role</Th>
            <Th>Joined</Th>
            <Th>Change Role</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--fill)/0.5)] transition-colors">
              <Td>
                <p className="font-medium">{u.full_name || u.email || '—'}</p>
                <p className="font-mono text-[11px] text-[hsl(var(--fg-2))]">{shortId(u.id)}</p>
              </Td>
              <Td>
                <Badge label={u.role || '—'} className={roleBadge(u.role)} />
              </Td>
              <Td className="text-[hsl(var(--fg-2))]">{fmt(u.created_at)}</Td>
              <Td>
                <select
                  value={u.role || 'athlete'}
                  onChange={(e) => handleRoleChange(u, e.target.value)}
                  disabled={saving === u.id}
                  className="h-8 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[12px] text-[hsl(var(--fg))] px-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {saving === u.id && <Loader2 className="inline-block ml-2 h-3 w-3 animate-spin text-[hsl(var(--primary))]" />}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      {confirm && (
        <ConfirmModal
          title="Change User Role"
          description={`Set ${confirm.user.full_name || shortId(confirm.user.id)} role to "${confirm.newRole}"?`}
          confirmLabel="Confirm Change"
          danger={confirm.newRole === 'admin'}
          loading={saving === confirm.user.id}
          onCancel={() => setConfirm(null)}
          onConfirm={confirmRoleChange}
        />
      )}
    </div>
  );
}

// ─── AUDIT LOG TAB ───────────────────────────────────────────────────────────

function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs(100);
      setLogs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const actionColor = (type) => {
    if (!type) return '';
    if (type.includes('grant') || type.includes('activate') || type.includes('unsuspend')) return 'text-[hsl(var(--ok))]';
    if (type.includes('revoke') || type.includes('suspend') || type.includes('delete')) return 'text-[hsl(var(--err))]';
    if (type.includes('update') || type.includes('extend') || type.includes('reset')) return 'text-[hsl(var(--warn))]';
    return 'text-[hsl(var(--fg-2))]';
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
    </div>
  );

  if (error) {
    // Table missing — surface a helpful prompt instead of a raw error
    if (error.includes('42P01') || error.toLowerCase().includes('relation') || error.toLowerCase().includes('does not exist')) {
      return (
        <div className="rounded-2xl border border-[hsl(var(--warn)/0.3)] bg-[hsl(var(--warn)/0.06)] p-6 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--warn))] shrink-0" />
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Audit log table not found</p>
          </div>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">
            Run <code className="font-mono bg-[hsl(var(--shell))] px-1 rounded text-[12px]">supabase_admin_console.sql</code> in your Supabase SQL editor to create the <code className="font-mono bg-[hsl(var(--shell))] px-1 rounded text-[12px]">admin_audit_logs</code> table.
          </p>
        </div>
      );
    }
    return <ErrorState message={error} onRetry={load} />;
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center space-y-2">
        <FileText className="h-8 w-8 mx-auto text-[hsl(var(--fg-2))]" />
        <p className="text-[14px] font-medium text-[hsl(var(--fg))]">No audit logs yet</p>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">Admin actions will appear here once the table is set up and actions are performed.</p>
      </div>
    );
  }

  return (
    <TableWrap>
      <thead>
        <tr>
          <Th>Timestamp</Th>
          <Th>Action</Th>
          <Th>Actor</Th>
          <Th>Target</Th>
          <Th>Detail</Th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--fill)/0.5)] transition-colors">
            <Td className="text-[hsl(var(--fg-2))] text-[11px] whitespace-nowrap">{fmtFull(log.created_at)}</Td>
            <Td>
              <span className={cn('font-mono text-[12px] font-medium', actionColor(log.action_type))}>
                {log.action_type}
              </span>
            </Td>
            <Td>
              <span className="font-mono text-[11px] text-[hsl(var(--fg-2))]">{shortId(log.actor_id)}</span>
            </Td>
            <Td>
              <span className="font-mono text-[11px] text-[hsl(var(--fg-2))]">{shortId(log.target_user_id)}</span>
            </Td>
            <Td>
              {log.action_detail && Object.keys(log.action_detail).length > 0 ? (
                <code className="text-[11px] text-[hsl(var(--fg-2))] bg-[hsl(var(--shell))] px-1.5 py-0.5 rounded">
                  {JSON.stringify(log.action_detail)}
                </code>
              ) : (
                <span className="text-[hsl(var(--fg-2))]">—</span>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}

// ─── MAIN ADMIN CONSOLE ──────────────────────────────────────────────────────

export default function AdminPanel() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRoleAndSubscription(user?.id);
  const [activeTab, setActiveTab] = useState(0);

  if (roleLoading) {
    return (
      <StablePage>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </StablePage>
    );
  }

  if (role !== 'admin') {
    return (
      <StablePage>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--err)/0.08)]">
            <Shield className="h-6 w-6 text-[hsl(var(--err))]" />
          </div>
          <p className="text-[16px] font-semibold text-[hsl(var(--fg))]">Access Denied</p>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">This console is restricted to administrators.</p>
        </div>
      </StablePage>
    );
  }

  return (
    <StablePage>
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="atlas-page-header px-5 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--err)/0.16)] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))] shadow-[var(--shadow-xs)]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--err))]" />
              </div>
              <h1 className="text-[22px] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">Admin Console</h1>
            </div>
            <p className="ml-[50px] text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Manage users, subscriptions, roles, and audit activity
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--err)/0.16)] bg-[hsl(var(--err)/0.08)] px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--err))]">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--err))] animate-pulse" />
              Admin
            </span>
          </div>
        </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.46)] p-1.5">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={cn(
                'flex-1 h-9 rounded-[14px] px-2 text-[12px] font-medium transition-all duration-150',
                activeTab === idx
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                  : 'text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <UsersTab />}
          {activeTab === 2 && <SubscriptionsTab />}
          {activeTab === 3 && <RolesTab />}
          {activeTab === 4 && <AuditLogTab />}
        </div>
      </div>
    </StablePage>
  );
}
