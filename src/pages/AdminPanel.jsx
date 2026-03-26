import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Filter,
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
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',      label: 'Overview',       icon: TrendingUp },
  { key: 'users',         label: 'Users',          icon: Users },
  { key: 'subscriptions', label: 'Subscriptions',  icon: CreditCard },
  { key: 'audit',         label: 'Audit Log',      icon: FileText },
];

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

function planBadge(plan) {
  const map = {
    pro:      'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))] ring-1 ring-[hsl(var(--ok)/0.2)]',
    premium:  'bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))] ring-1 ring-[hsl(var(--warn)/0.2)]',
    internal: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.2)]',
    custom:   'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.2)]',
    free:     'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]',
  };
  return map[plan] || 'bg-[hsl(var(--border))] text-[hsl(var(--fg-2))]';
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
  return id.slice(0, 7) + '…';
}

// ─── SHARED UI PRIMITIVES ───────────────────────────────────────────────────

function Badge({ label, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap', className)}>
      {label}
    </span>
  );
}

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
        <div className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-md)] py-1 overflow-hidden">
          {enabledItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.separator && idx > 0 && (
                <div className="my-1 border-t border-[hsl(var(--border)/0.5)]" />
              )}
              <button
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
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="text-[10px] text-[hsl(var(--fg-2))]">{item.shortcut}</span>
                )}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, sub, accent }) {
  return (
    <div className="atlas-card px-5 py-5 space-y-3">
      <div className="flex items-start justify-between">
        <p className="atlas-metric-label">{label}</p>
        {Icon && (
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[14px] shadow-[var(--shadow-xs)]',
            accent === 'ok'      ? 'border border-[hsl(var(--ok)/0.16)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]'
            : accent === 'err'   ? 'border border-[hsl(var(--err)/0.16)] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
            : accent === 'warn'  ? 'border border-[hsl(var(--warn)/0.16)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]'
            : 'border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))]'
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-[28px] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">{value ?? '—'}</p>
      {sub && <p className="text-[12px] text-[hsl(var(--fg-2))]">{sub}</p>}
    </div>
  );
}

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

function EmptyState({ icon: Icon = Users, title, message }) {
  return (
    <div className="atlas-empty py-16 text-center space-y-2">
      {Icon && <Icon className="h-8 w-8 mx-auto text-[hsl(var(--fg-2)/0.5)]" />}
      {title && <p className="text-[14px] font-medium text-[hsl(var(--fg))]">{title}</p>}
      <p className="text-[13px] text-[hsl(var(--fg-2))]">{message}</p>
    </div>
  );
}

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

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-7 px-3 rounded-full text-[11px] font-medium transition-all whitespace-nowrap',
        active
          ? 'bg-[hsl(var(--fg))] text-[hsl(var(--bg))] shadow-[var(--shadow-xs)]'
          : 'bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]'
      )}
    >
      {label}
    </button>
  );
}

// ─── USER DETAILS DRAWER ────────────────────────────────────────────────────

function UserDetailsModal({ user, onClose, onUpdated }) {
  const latestSubscription = user?.subscriptions?.[0] || null;
  const [tier, setTier] = useState(latestSubscription?.plan_code || 'free');
  const [status, setStatus] = useState(latestSubscription?.status || 'inactive');
  const [saving, setSaving] = useState(false);
  const hasSubscription = Boolean(latestSubscription?.user_id);
  const hasChanges =
    hasSubscription &&
    (tier !== (latestSubscription?.plan_code || 'free') ||
      status !== (latestSubscription?.status || 'inactive'));

  const handleSave = async () => {
    if (!hasSubscription) return;
    setSaving(true);
    try {
      if (tier !== latestSubscription?.plan_code) {
        await updateSubscriptionTier(user.id, tier);
      }
      if (status !== latestSubscription?.status) {
        await updateSubscriptionStatus(user.id, status);
      }
      toast.success('Subscription updated');
      onUpdated?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xl)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-semibold text-[hsl(var(--fg))] truncate">
                {user?.full_name || user?.display_name || 'Unknown'}
              </h3>
              <p className="text-[12px] text-[hsl(var(--fg-2))] truncate">{user?.email || '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[hsl(var(--shell)/0.5)] p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Role</p>
              <Badge label={user?.role || '—'} className={roleBadge(user?.role)} />
            </div>
            <div className="rounded-xl bg-[hsl(var(--shell)/0.5)] p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Status</p>
              {user?.is_suspended
                ? <Badge label="suspended" className="bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]" />
                : <Badge label="active" className="bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]" />
              }
            </div>
            <div className="rounded-xl bg-[hsl(var(--shell)/0.5)] p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Joined</p>
              <p className="text-[12px] font-medium text-[hsl(var(--fg))]">{fmt(user?.created_at)}</p>
            </div>
          </div>

          {/* ID */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--shell)/0.4)]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">ID</p>
            <p className="text-[11px] font-mono text-[hsl(var(--fg-2))] select-all">{user?.id || '—'}</p>
          </div>

          {/* Subscription editor */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-2))]">Subscription</p>
            {!hasSubscription ? (
              <p className="text-[13px] text-[hsl(var(--fg-2))]">No subscription record found.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-[12px] font-medium text-[hsl(var(--fg))]">Plan</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      disabled={saving}
                      className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
                    >
                      {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[12px] font-medium text-[hsl(var(--fg))]">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={saving}
                      className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] disabled:opacity-50"
                    >
                      {SUBSCRIPTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[hsl(var(--fg-2))]">
                  <span>Expires: {fmt(latestSubscription?.expires_at)}</span>
                  <span>Started: {fmt(latestSubscription?.started_at)}</span>
                  <span>Stripe: {latestSubscription?.stripe_subscription_id || 'none'}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors"
            >
              Close
            </button>
            {hasSubscription && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex-1 h-10 rounded-xl bg-[hsl(var(--primary))] text-[13px] font-medium text-white hover:bg-[hsl(var(--primary)/0.88)] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save changes'}
              </button>
            )}
          </div>
        </div>
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
      {/* Primary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard label="Total Users"   value={metrics?.totalUsers}            icon={Users}        accent="default" />
        <MetricCard label="Active"        value={metrics?.activeSubscriptions}   icon={CheckCircle2} accent="ok" />
        <MetricCard label="Trialing"      value={metrics?.trialingSubscriptions} icon={Clock}        accent="warn" />
        <MetricCard label="Admins"        value={metrics?.adminCount}            icon={Shield}       accent="err" />
        <MetricCard label="New (7d)"      value={metrics?.newUsersLast7Days}     icon={TrendingUp}   accent="default"
          sub="Last 7 days"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="atlas-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Quick Actions</p>
          </div>
          <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed">
            Use the Users tab to manage roles, grant or revoke access, suspend accounts, and edit subscriptions. All actions are logged in the Audit Log.
          </p>
        </div>
        <div className="atlas-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[hsl(var(--ok))]" />
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Realtime Sync</p>
          </div>
          <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed">
            Role and access changes take effect immediately for all users. No logout required — the app syncs in realtime via Supabase Realtime.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── USERS TAB ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleEdit, setRoleEdit] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    let result = users;
    if (filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole);
    }
    if (filterStatus !== 'all') {
      const sub = (u) => u.subscriptions?.[0];
      result = result.filter((u) => sub(u)?.status === filterStatus);
    }
    return result;
  }, [users, filterRole, filterStatus]);

  const subscription = (u) => u.subscriptions?.[0] || null;

  // Role distribution for filter pills
  const roleCounts = useMemo(() => {
    const counts = { all: users.length };
    users.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [users]);

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="space-y-3">
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

        {/* Role filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 text-[hsl(var(--fg-2))] shrink-0" />
          <FilterPill
            label={`All (${roleCounts.all || 0})`}
            active={filterRole === 'all'}
            onClick={() => setFilterRole('all')}
          />
          {ROLES.filter((r) => roleCounts[r]).map((r) => (
            <FilterPill
              key={r}
              label={`${r} (${roleCounts[r] || 0})`}
              active={filterRole === r}
              onClick={() => setFilterRole(filterRole === r ? 'all' : r)}
            />
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => load(page, search)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState icon={Users} title="No users found" message="Try adjusting your search or filters." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Expires</Th>
              <Th>Joined</Th>
              <Th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const sub = subscription(u);
              const isSuspended = u.is_suspended;
              return (
                <tr key={u.id} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--fill)/0.5)] transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]">
                        <span className="text-[11px] font-semibold uppercase">
                          {(u.full_name || u.email || '?')[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[hsl(var(--fg))] truncate">
                          {u.full_name || u.display_name || '—'}
                        </p>
                        <p className="text-[11px] text-[hsl(var(--fg-2))] truncate">{u.email || shortId(u.id)}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Badge label={u.role || '—'} className={roleBadge(u.role)} />
                      {isSuspended && <Badge label="suspended" className="bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]" />}
                    </div>
                  </Td>
                  <Td>
                    <Badge label={sub?.plan_code || 'free'} className={planBadge(sub?.plan_code || 'free')} />
                  </Td>
                  <Td>
                    {sub ? (
                      <Badge label={sub.status} className={statusBadge(sub.status)} />
                    ) : (
                      <span className="text-[hsl(var(--fg-2))]">—</span>
                    )}
                  </Td>
                  <Td className="text-[hsl(var(--fg-2))] text-[12px]">{fmt(sub?.expires_at)}</Td>
                  <Td className="text-[hsl(var(--fg-2))] text-[12px]">{fmt(u.created_at)}</Td>
                  <Td>
                    <ActionMenu items={[
                      {
                        label: 'View details',
                        icon: User,
                        onClick: () => setDetailsUser(u),
                      },
                      {
                        label: 'Edit role',
                        icon: UserCheck,
                        onClick: () => { setRoleEdit({ userId: u.id, name: u.full_name || u.email || shortId(u.id) }); setSelectedRole(u.role || 'athlete'); },
                      },
                      {
                        label: isSuspended ? 'Unsuspend' : 'Suspend',
                        icon: isSuspended ? UserPlus : UserMinus,
                        onClick: () => setConfirm({ type: isSuspended ? 'unsuspend' : 'suspend', user: u }),
                        danger: !isSuspended,
                        separator: true,
                      },
                      {
                        label: 'Grant pro access',
                        icon: ShieldCheck,
                        onClick: () => setConfirm({ type: 'grant', user: u }),
                      },
                      {
                        label: 'Revoke access',
                        icon: UserMinus,
                        danger: true,
                        onClick: () => setConfirm({ type: 'revoke', user: u }),
                      },
                      {
                        label: 'Extend trial (+7d)',
                        icon: Clock,
                        disabled: sub?.status !== 'trialing',
                        onClick: () => setConfirm({ type: 'extendTrial', user: u }),
                      },
                      {
                        label: 'Reset onboarding',
                        icon: RefreshCw,
                        danger: true,
                        separator: true,
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

      {/* User Details Modal */}
      {detailsUser && (
        <UserDetailsModal
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
          onUpdated={() => load(page, search)}
        />
      )}

      {/* Role Edit Modal */}
      {roleEdit && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-xl)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Edit Role</h3>
              <button onClick={() => setRoleEdit(null)} className="text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[13px] text-[hsl(var(--fg-2))]">{roleEdit.name}</p>
            <div>
              <label className="text-[12px] font-medium text-[hsl(var(--fg))] block mb-1.5">New role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] text-[13px] text-[hsl(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {selectedRole === 'admin' && (
              <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--warn)/0.08)] border border-[hsl(var(--warn)/0.2)] p-3">
                <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warn))] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[hsl(var(--warn))] leading-relaxed">
                  Admin role grants full access to all features and this console.
                </p>
              </div>
            )}
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
                className={cn(
                  'flex-1 h-9 rounded-xl text-[13px] font-medium text-white transition-colors disabled:opacity-50',
                  selectedRole === 'admin'
                    ? 'bg-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.88)]'
                    : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.88)]'
                )}
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
            : confirm.type === 'grant'         ? 'Grant Pro Access'
            : confirm.type === 'revoke'        ? 'Revoke Access'
            : confirm.type === 'extendTrial'   ? 'Extend Trial'
            : confirm.type === 'resetOnboarding' ? 'Reset Onboarding'
            : 'Confirm'
          }
          description={
            confirm.type === 'suspend'         ? `Suspend ${confirm.user.full_name || confirm.user.email || shortId(confirm.user.id)}? They will lose access immediately.`
            : confirm.type === 'unsuspend'     ? `Restore access for ${confirm.user.full_name || confirm.user.email || shortId(confirm.user.id)}.`
            : confirm.type === 'grant'         ? `Grant pro access to ${confirm.user.full_name || confirm.user.email || shortId(confirm.user.id)}. This takes effect immediately.`
            : confirm.type === 'revoke'        ? `Revoke access for ${confirm.user.full_name || confirm.user.email || shortId(confirm.user.id)}. Their subscription will be set to inactive.`
            : confirm.type === 'extendTrial'   ? `Extend trial by 7 days for ${confirm.user.full_name || confirm.user.email || shortId(confirm.user.id)}.`
            : confirm.type === 'resetOnboarding' ? `Reset onboarding for ${confirm.user.full_name || confirm.user.email || shortId(confirm.user.id)}. They will see the onboarding flow again on next login.`
            : null
          }
          confirmLabel={
            confirm.type === 'suspend'         ? 'Suspend'
            : confirm.type === 'unsuspend'     ? 'Unsuspend'
            : confirm.type === 'grant'         ? 'Grant Access'
            : confirm.type === 'revoke'        ? 'Revoke'
            : confirm.type === 'extendTrial'   ? 'Extend +7d'
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
              grant:           () => runAction(() => grantAccess(user.id, 'pro', 'Admin console grant'), 'Pro access granted'),
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
  const [allUsers, setAllUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const [subResult, userResult] = await Promise.all([
        fetchAllSubscriptions(p, pageSize),
        fetchAllUsers(1, 200),
      ]);
      setSubs(subResult.subscriptions);
      setTotal(subResult.total);
      setAllUsers(userResult.users);
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

  // Map user_id → user for enrichment
  const userMap = useMemo(() => {
    const map = {};
    allUsers.forEach((u) => { map[u.id] = u; });
    return map;
  }, [allUsers]);

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts = { all: subs.length };
    subs.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [subs]);

  const filteredSubs = useMemo(() => {
    if (filterStatus === 'all') return subs;
    return subs.filter((s) => s.status === filterStatus);
  }, [subs, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 text-[hsl(var(--fg-2))] shrink-0" />
        <FilterPill
          label={`All (${statusCounts.all || 0})`}
          active={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
        />
        {SUBSCRIPTION_STATUSES.filter((s) => statusCounts[s]).map((s) => (
          <FilterPill
            key={s}
            label={`${s} (${statusCounts[s] || 0})`}
            active={filterStatus === s}
            onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
          />
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={() => load(page)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : filteredSubs.length === 0 ? (
        <EmptyState icon={CreditCard} title="No subscriptions found" message="Try adjusting your filters." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Stripe</Th>
              <Th>Expires</Th>
              <Th>Created</Th>
              <Th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map((s) => {
              const u = userMap[s.user_id];
              return (
                <tr key={s.id} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--fill)/0.5)] transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]">
                        <span className="text-[11px] font-semibold uppercase">
                          {(u?.full_name || u?.email || '?')[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[hsl(var(--fg))] truncate text-[12px]">
                          {u?.full_name || u?.display_name || shortId(s.user_id)}
                        </p>
                        <p className="text-[11px] text-[hsl(var(--fg-2))] truncate">{u?.email || shortId(s.user_id)}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge label={s.plan_code || 'free'} className={planBadge(s.plan_code || 'free')} />
                  </Td>
                  <Td>
                    <Badge label={s.status || '—'} className={statusBadge(s.status)} />
                  </Td>
                  <Td>
                    <span className="text-[11px] font-mono text-[hsl(var(--fg-2))]">
                      {s.stripe_subscription_id ? shortId(s.stripe_subscription_id) : 'manual'}
                    </span>
                  </Td>
                  <Td className="text-[hsl(var(--fg-2))] text-[12px]">{fmt(s.expires_at)}</Td>
                  <Td className="text-[hsl(var(--fg-2))] text-[12px]">{fmt(s.created_at)}</Td>
                  <Td>
                    <ActionMenu items={[
                      {
                        label: 'Grant pro access',
                        icon: CheckCircle2,
                        onClick: () => setConfirm({ type: 'activate', sub: s }),
                      },
                      {
                        label: 'Extend trial (+7d)',
                        icon: Clock,
                        onClick: () => setConfirm({ type: 'grantTrial', sub: s }),
                      },
                      {
                        label: 'Revoke access',
                        icon: UserMinus,
                        danger: true,
                        separator: true,
                        onClick: () => setConfirm({ type: 'revoke', sub: s }),
                      },
                    ]} />
                  </Td>
                </tr>
              );
            })}
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
            confirm.type === 'activate'    ? 'Grant Pro Access'
            : confirm.type === 'grantTrial' ? 'Extend Trial'
            : confirm.type === 'revoke'    ? 'Revoke Access'
            : 'Confirm'
          }
          description={
            confirm.type === 'activate'    ? `Set this subscription to active with pro plan for ${userMap[confirm.sub.user_id]?.full_name || shortId(confirm.sub.user_id)}.`
            : confirm.type === 'grantTrial' ? `Extend trial by 7 days for ${userMap[confirm.sub.user_id]?.full_name || shortId(confirm.sub.user_id)}.`
            : confirm.type === 'revoke'    ? `Revoke access for ${userMap[confirm.sub.user_id]?.full_name || shortId(confirm.sub.user_id)}. Their subscription will be set to inactive.`
            : null
          }
          confirmLabel={
            confirm.type === 'activate'    ? 'Grant Access'
            : confirm.type === 'grantTrial' ? 'Extend +7d'
            : confirm.type === 'revoke'    ? 'Revoke'
            : 'Confirm'
          }
          danger={confirm.type === 'revoke'}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const { type, sub } = confirm;
            if (type === 'activate')    runAction(() => grantAccess(sub.user_id, 'pro', 'Admin activate'), 'Pro access granted');
            if (type === 'grantTrial')  runAction(() => extendTrial(sub.user_id, 7), 'Trial extended');
            if (type === 'revoke')      runAction(() => revokeAccess(sub.user_id), 'Access revoked');
          }}
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
      <EmptyState
        icon={FileText}
        title="No audit logs yet"
        message="Admin actions will appear here once performed."
      />
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
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h1 className="text-[22px] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">Admin Console</h1>
              </div>
              <p className="ml-[50px] text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                Manage users, subscriptions, and audit activity
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

        {/* Tab navigation — icons + labels */}
        <div className="flex gap-1 rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.46)] p-1.5">
          {TABS.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(idx)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[14px] px-2 text-[12px] font-medium transition-all duration-150',
                activeTab === idx
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                  : 'text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <UsersTab />}
          {activeTab === 2 && <SubscriptionsTab />}
          {activeTab === 3 && <AuditLogTab />}
        </div>
      </div>
    </StablePage>
  );
}
