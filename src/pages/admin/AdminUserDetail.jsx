/**
 * AdminUserDetail — single user inspection & actions page.
 *
 * Shows profile, subscription, admin actions (delete, suspend, role, grant),
 * and a recent activity timeline. Follows AdminOverview/AdminGDPR styling.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ACFonts, ACBrand, useACT, ACMono } from '@/redesign/v3/lib/paper.jsx';
import {
  fetchUserFull,
  fetchUserTimeline,
  deleteUser,
  suspendUser,
  unsuspendUser,
  updateUserRole,
  grantAccess,
  revokeEntitlement,
  resetOnboarding,
} from '@/lib/adminService';

// ── Helpers ────────────────────────────────────────────────────

function StatusBadge({ label, variant = 'neutral', c }) {
  const variants = {
    active: { bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
    trialing: { bg: 'rgba(59,130,246,0.12)', fg: '#3b82f6' },
    granted: { bg: 'rgba(168,85,247,0.12)', fg: '#a855f7' },
    canceled: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
    expired: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
    inactive: { bg: 'rgba(239,233,218,0.07)', fg: c.mute },
    past_due: { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
    suspended: { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444' },
    admin: { bg: 'rgba(232,181,0,0.15)', fg: ACBrand.accent },
    neutral: { bg: 'rgba(239,233,218,0.07)', fg: c.mute },
  };
  const style = variants[variant] || variants.neutral;
  return (
    <span style={{
      fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.4,
      textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5,
      background: style.bg, color: style.fg, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function SectionCard({ title, children, c }) {
  return (
    <div style={{
      padding: 20, borderRadius: 14,
      background: c.card, border: `1px solid ${c.hair}`,
      marginBottom: 20,
    }}>
      <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8, display: 'block', marginBottom: 14 }}>
        {title}
      </ACMono>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false, c }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: `1px solid ${c.hair}`,
    }}>
      <span style={{ fontSize: 12, color: c.dim }}>{label}</span>
      <span style={{
        fontSize: 12, color: c.fg, fontWeight: 500,
        fontFamily: mono ? ACFonts.mono : ACFonts.body,
        ...(mono && { fontSize: 11 }),
      }}>
        {value || '—'}
      </span>
    </div>
  );
}

function ActionButton({ label, onClick, variant = 'default', disabled = false, c }) {
  const styles = {
    default: { bg: 'transparent', border: c.hair, fg: c.dim },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', fg: '#ef4444' },
    accent: { bg: 'rgba(232,181,0,0.1)', border: 'rgba(232,181,0,0.25)', fg: ACBrand.accent },
    success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', fg: '#22c55e' },
  };
  const s = styles[variant] || styles.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: s.bg, border: `1px solid ${s.border}`,
        borderRadius: 8, padding: '8px 14px', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8,
        textTransform: 'uppercase', color: s.fg,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}

const TIMELINE_ICONS = {
  workout: '●',
  meal_day: '◐',
  measurement: '◑',
  photo: '◒',
  ai_message: '◆',
  error: '✕',
  subscription: '◎',
  audit: '◇',
};

const TIMELINE_COLORS = {
  workout: '#22c55e',
  meal_day: '#3b82f6',
  measurement: '#a855f7',
  photo: '#f59e0b',
  ai_message: ACBrand.accent,
  error: '#ef4444',
  subscription: '#6366f1',
  audit: '#6b7280',
};

const VALID_ROLES = ['athlete', 'user', 'admin', 'coach', 'nutritionist', 'clinician', 'beta_tester'];

// ── Page ───────────────────────────────────────────────────────

export default function AdminUserDetail() {
  const { id } = useParams();
  const c = useACT(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roleSelect, setRoleSelect] = useState('');
  const [grantDuration, setGrantDuration] = useState('monthly');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => fetchUserFull(id),
    staleTime: 15_000,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['admin-user-timeline', id],
    queryFn: () => fetchUserTimeline(id),
    staleTime: 30_000,
  });

  const profile = data?.profile;
  const subscription = data?.subscription;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] });
    queryClient.invalidateQueries({ queryKey: ['admin-user-timeline', id] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const deleteMut = useMutation({
    mutationFn: () => deleteUser(id),
    onSuccess: () => { navigate('/admin/users'); },
  });

  const suspendMut = useMutation({
    mutationFn: () => profile?.is_suspended ? unsuspendUser(id) : suspendUser(id),
    onSuccess: invalidateUser,
  });

  const roleMut = useMutation({
    mutationFn: (role) => updateUserRole(id, role),
    onSuccess: () => { setRoleSelect(''); invalidateUser(); },
  });

  const grantMut = useMutation({
    mutationFn: () => grantAccess(id, grantDuration),
    onSuccess: invalidateUser,
  });

  const revokeMut = useMutation({
    mutationFn: () => revokeEntitlement(id),
    onSuccess: invalidateUser,
  });

  const resetMut = useMutation({
    mutationFn: () => resetOnboarding(id),
    onSuccess: invalidateUser,
  });

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: c.mute, fontSize: 13 }}>
        Loading user...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
          {error?.message || 'User not found.'}
        </div>
        <ActionButton label="Back to users" onClick={() => navigate('/admin/users')} c={c} />
      </div>
    );
  }

  return (
    <div>
      {/* Back + header */}
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 1,
          textTransform: 'uppercase', color: c.mute, padding: 0, marginBottom: 16,
        }}
      >
        &larr; Back to users
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
            letterSpacing: -1, color: c.fg,
          }}>
            {profile.full_name || profile.display_name || profile.email || 'Unknown'}
          </div>
          <div style={{ fontSize: 13, color: c.dim, marginTop: 4, display: 'flex', gap: 10, alignItems: 'center' }}>
            {profile.email || '—'}
            <StatusBadge label={profile.role || 'user'} variant={isAdmin ? 'admin' : 'neutral'} c={c} />
            {profile.is_suspended && <StatusBadge label="suspended" variant="suspended" c={c} />}
          </div>
        </div>
        <ACMono size={10} color={c.dim} style={{ letterSpacing: 0.5 }}>
          {profile.id?.slice(0, 8)}...
        </ACMono>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div>
          {/* Profile info */}
          <SectionCard title="Profile" c={c}>
            <InfoRow label="User ID" value={profile.id} mono c={c} />
            <InfoRow label="Email" value={profile.email} c={c} />
            <InfoRow label="Name" value={profile.full_name || profile.display_name} c={c} />
            <InfoRow label="Role" value={profile.role || 'user'} c={c} />
            <InfoRow label="Onboarding" value={profile.onboarding_completed ? 'Completed' : 'Incomplete'} c={c} />
            <InfoRow label="Created" value={profile.created_at ? new Date(profile.created_at).toLocaleString() : '—'} c={c} />
            <InfoRow label="Updated" value={profile.updated_at ? new Date(profile.updated_at).toLocaleString() : '—'} c={c} />
          </SectionCard>

          {/* Subscription info */}
          <SectionCard title="Subscription" c={c}>
            {subscription ? (
              <>
                <InfoRow label="Status" value={subscription.status} c={c} />
                <InfoRow label="Tier" value={subscription.tier} c={c} />
                <InfoRow label="Provider" value={subscription.provider || '—'} c={c} />
                <InfoRow label="Period start" value={subscription.current_period_starts_at ? new Date(subscription.current_period_starts_at).toLocaleDateString() : '—'} c={c} />
                <InfoRow label="Period end" value={subscription.current_period_ends_at ? new Date(subscription.current_period_ends_at).toLocaleDateString() : '—'} c={c} />
                {subscription.trial_ends_at && (
                  <InfoRow label="Trial ends" value={new Date(subscription.trial_ends_at).toLocaleDateString()} c={c} />
                )}
                {subscription.granted_by_admin && (
                  <InfoRow label="Granted by" value={subscription.granted_by_admin} mono c={c} />
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: c.mute, padding: '8px 0' }}>
                No subscription record.
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div>
          {/* Actions */}
          <SectionCard title="Actions" c={c}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Suspend / Unsuspend */}
              <div>
                <ActionButton
                  label={suspendMut.isPending ? 'Working...' : profile.is_suspended ? 'Unsuspend user' : 'Suspend user'}
                  onClick={() => suspendMut.mutate()}
                  variant={profile.is_suspended ? 'success' : 'danger'}
                  disabled={suspendMut.isPending}
                  c={c}
                />
              </div>

              {/* Role change */}
              <div>
                <div style={{ fontSize: 11, color: c.dim, marginBottom: 6 }}>Change role</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={roleSelect}
                    onChange={(e) => setRoleSelect(e.target.value)}
                    style={{
                      flex: 1, minHeight: 36, borderRadius: 8,
                      border: `1px solid ${c.hair}`, background: 'rgba(239,233,218,0.03)',
                      color: c.fg, fontFamily: ACFonts.body, fontSize: 12,
                      padding: '0 10px', outline: 'none',
                    }}
                  >
                    <option value="">Select role...</option>
                    {VALID_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ActionButton
                    label={roleMut.isPending ? '...' : 'Apply'}
                    onClick={() => roleSelect && roleMut.mutate(roleSelect)}
                    variant="accent"
                    disabled={!roleSelect || roleMut.isPending}
                    c={c}
                  />
                </div>
                {roleMut.isError && (
                  <div style={{ marginTop: 4, color: '#ef4444', fontSize: 11 }}>{roleMut.error?.message}</div>
                )}
              </div>

              {/* Grant access via RevenueCat */}
              <div>
                <div style={{ fontSize: 11, color: c.dim, marginBottom: 6 }}>Grant Pro access (via RevenueCat)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={grantDuration}
                    onChange={(e) => setGrantDuration(e.target.value)}
                    style={{
                      flex: 1, minHeight: 36, borderRadius: 8,
                      border: `1px solid ${c.hair}`, background: 'rgba(239,233,218,0.03)',
                      color: c.fg, fontFamily: ACFonts.body, fontSize: 12,
                      padding: '0 10px', outline: 'none',
                    }}
                  >
                    <option value="weekly">1 week</option>
                    <option value="monthly">1 month</option>
                    <option value="two_month">2 months</option>
                    <option value="three_month">3 months</option>
                    <option value="six_month">6 months</option>
                    <option value="yearly">1 year</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                  <ActionButton
                    label={grantMut.isPending ? 'Granting...' : 'Grant'}
                    onClick={() => grantMut.mutate()}
                    variant="success"
                    disabled={grantMut.isPending}
                    c={c}
                  />
                </div>
                {grantMut.isError && (
                  <div style={{ marginTop: 4, color: '#ef4444', fontSize: 11 }}>{grantMut.error?.message}</div>
                )}
                {grantMut.isSuccess && (
                  <div style={{ marginTop: 4, color: '#22c55e', fontSize: 11 }}>Entitlement granted via RevenueCat. Webhook will sync shortly.</div>
                )}
              </div>

              {/* Revoke promotional entitlement */}
              <ActionButton
                label={revokeMut.isPending ? 'Revoking...' : 'Revoke promotional access'}
                onClick={() => revokeMut.mutate()}
                variant="danger"
                disabled={revokeMut.isPending}
                c={c}
              />
              {revokeMut.isError && (
                <div style={{ marginTop: 4, color: '#ef4444', fontSize: 11 }}>{revokeMut.error?.message}</div>
              )}

              {/* Reset onboarding */}
              <ActionButton
                label={resetMut.isPending ? 'Resetting...' : 'Reset onboarding'}
                onClick={() => resetMut.mutate()}
                disabled={resetMut.isPending}
                c={c}
              />

              {/* Delete */}
              <div style={{ paddingTop: 10, borderTop: `1px solid ${c.hair}` }}>
                <ActionButton
                  label="Delete user permanently"
                  onClick={() => setConfirmDelete(true)}
                  variant="danger"
                  disabled={isAdmin}
                  c={c}
                />
                {isAdmin && (
                  <div style={{ marginTop: 4, fontSize: 11, color: c.mute }}>
                    Admin accounts cannot be deleted from this panel.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Activity timeline */}
      {timeline.length > 0 && (
        <SectionCard title={`Activity timeline \u00b7 ${timeline.length} events`} c={c}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {timeline.slice(0, 50).map((event, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 8px', borderRadius: 8,
                  background: i % 2 === 0 ? 'transparent' : 'rgba(239,233,218,0.02)',
                }}
              >
                <span style={{
                  fontSize: 12, color: TIMELINE_COLORS[event.type] || c.mute,
                  width: 16, textAlign: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  {TIMELINE_ICONS[event.type] || '·'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: c.fg }}>{event.label}</span>
                    <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, flexShrink: 0 }}>
                      {event.date ? new Date(event.date).toLocaleString() : '—'}
                    </span>
                  </div>
                  {event.detail && (
                    <div style={{ fontSize: 11, color: c.dim, marginTop: 2 }}>{event.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {timeline.length > 50 && (
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: c.mute }}>
              Showing 50 of {timeline.length} events.
            </div>
          )}
        </SectionCard>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            display: 'grid', placeItems: 'center',
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            style={{
              background: c.bg, border: `1px solid ${c.hair}`,
              borderRadius: 16, padding: 28, maxWidth: 420, width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
              color: c.fg, letterSpacing: -0.5, marginBottom: 12,
            }}>
              Delete user?
            </div>
            <div style={{ fontSize: 13, color: c.dim, lineHeight: 1.6, marginBottom: 8 }}>
              This will permanently delete this user and all their data. This action cannot be undone.
            </div>
            <div style={{
              padding: 14, borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>
                {profile.full_name || profile.display_name || '—'}
              </div>
              <div style={{ fontSize: 12, color: c.dim, marginTop: 2 }}>
                {profile.email || profile.id}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                style={{
                  background: 'none', border: `1px solid ${c.hair}`,
                  borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                  color: c.dim, fontSize: 13, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMut.mutate()}
                disabled={deleteMut.isPending}
                style={{
                  background: '#ef4444', border: 'none',
                  borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  opacity: deleteMut.isPending ? 0.6 : 1,
                }}
              >
                {deleteMut.isPending ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
            {deleteMut.isError && (
              <div style={{ marginTop: 12, color: '#ef4444', fontSize: 12 }}>
                {deleteMut.error?.message || 'Failed to delete user.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
