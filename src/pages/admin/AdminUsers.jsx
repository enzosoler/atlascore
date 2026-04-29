/**
 * AdminUsers — user management list page.
 *
 * Search, inspect, suspend, delete, and grant roles.
 * Follows the same styling conventions as AdminOverview.jsx / AdminGDPR.jsx.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ACFonts, ACBrand, useACT, ACMono } from '@/redesign/v3/lib/paper.jsx';
import {
  fetchAllUsers,
  searchUsers,
  deleteUser,
  suspendUser,
  unsuspendUser,
} from '@/lib/adminService';

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

function UserRow({ user, c, onDelete, onToggleSuspend, deleting }) {
  const navigate = useNavigate();
  const sub = user.subscriptions?.[0];
  const subStatus = sub?.status || 'inactive';
  const isSuspended = user.is_suspended;
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  return (
    <tr
      style={{ borderBottom: `1px solid ${c.hair}`, cursor: 'pointer' }}
      onClick={() => navigate(`/admin/users/${user.id}`)}
    >
      {/* Name / email */}
      <td style={{ padding: '12px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>
          {user.full_name || user.display_name || '—'}
        </div>
        <div style={{ fontSize: 11, color: c.dim, marginTop: 2 }}>
          {user.email || '—'}
        </div>
      </td>

      {/* Role */}
      <td style={{ padding: '12px 10px' }}>
        <StatusBadge label={user.role || 'user'} variant={isAdmin ? 'admin' : 'neutral'} c={c} />
      </td>

      {/* Subscription */}
      <td style={{ padding: '12px 10px' }}>
        <StatusBadge label={subStatus} variant={subStatus} c={c} />
        {sub?.tier && (
          <span style={{
            fontFamily: ACFonts.mono, fontSize: 9, color: c.dim,
            marginLeft: 6, letterSpacing: 0.5,
          }}>
            {sub.tier}
          </span>
        )}
      </td>

      {/* Status */}
      <td style={{ padding: '12px 10px' }}>
        {isSuspended
          ? <StatusBadge label="suspended" variant="suspended" c={c} />
          : <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: '#22c55e', letterSpacing: 1 }}>ACTIVE</span>
        }
      </td>

      {/* Created */}
      <td style={{ padding: '12px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
      </td>

      {/* Actions */}
      <td style={{ padding: '12px 10px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => onToggleSuspend(user)}
            style={{
              background: 'none', border: `1px solid ${c.hair}`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.8,
              textTransform: 'uppercase', color: c.dim,
            }}
          >
            {isSuspended ? 'Unsuspend' : 'Suspend'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            disabled={deleting || isAdmin}
            title={isAdmin ? 'Cannot delete admins' : 'Delete user'}
            style={{
              background: isAdmin ? 'transparent' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${isAdmin ? c.hair : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 6, padding: '4px 10px', cursor: isAdmin ? 'not-allowed' : 'pointer',
              fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: isAdmin ? c.mute : '#ef4444',
              opacity: isAdmin ? 0.4 : 1,
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const c = useACT(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isSearching = search.trim().length > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: isSearching ? ['admin-users-search', search] : ['admin-users', page],
    queryFn: () => isSearching ? searchUsers(search) : fetchAllUsers(page),
    staleTime: 15_000,
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / (data?.pageSize || 50));

  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-search'] });
      setConfirmDelete(null);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (user) => user.is_suspended ? unsuspendUser(user.id) : suspendUser(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-search'] });
    },
  });

  const handleDelete = (user) => {
    if (user.role === 'admin' || user.role === 'superadmin') return;
    setConfirmDelete(user);
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -1, color: c.fg,
        }}>
          Users
        </div>
        <div style={{ fontSize: 13, color: c.dim, marginTop: 4 }}>
          Search, inspect, suspend, and manage users. {total > 0 && `${total} total.`}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by email, name, or user ID..."
          style={{
            flex: 1, minHeight: 42, borderRadius: 10,
            border: `1px solid ${c.hair}`, background: 'rgba(239,233,218,0.03)',
            color: c.fg, padding: '0 14px', fontFamily: ACFonts.body, fontSize: 13,
            outline: 'none',
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setPage(1); }}
            style={{
              minHeight: 42, borderRadius: 10, border: `1px solid ${c.hair}`,
              background: 'transparent', color: c.dim, padding: '0 14px',
              cursor: 'pointer', fontFamily: ACFonts.mono, fontSize: 10,
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Users table */}
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        background: c.card, border: `1px solid ${c.hair}`,
      }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: c.mute, fontSize: 13 }}>
            Loading users...
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ef4444', fontSize: 13 }}>
            {error.message || 'Failed to load users.'}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: c.mute, fontSize: 13 }}>
            {isSearching ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Role', 'Subscription', 'Status', 'Joined', 'Actions'].map(col => (
                  <th key={col} style={{
                    textAlign: 'left', padding: '10px 10px',
                    fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.5,
                    textTransform: 'uppercase', color: c.mute,
                    borderBottom: `1px solid ${c.hair}`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  c={c}
                  onDelete={handleDelete}
                  onToggleSuspend={(u) => suspendMutation.mutate(u)}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isSearching && totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 12, marginTop: 20,
        }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{
              background: 'none', border: `1px solid ${c.hair}`,
              borderRadius: 8, padding: '6px 14px', cursor: page <= 1 ? 'not-allowed' : 'pointer',
              fontFamily: ACFonts.mono, fontSize: 10, color: page <= 1 ? c.mute : c.fg,
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            Prev
          </button>
          <ACMono size={10} color={c.dim} style={{ letterSpacing: 1 }}>
            {page} / {totalPages}
          </ACMono>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              background: 'none', border: `1px solid ${c.hair}`,
              borderRadius: 8, padding: '6px 14px', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              fontFamily: ACFonts.mono, fontSize: 10, color: page >= totalPages ? c.mute : c.fg,
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            display: 'grid', placeItems: 'center',
          }}
          onClick={() => setConfirmDelete(null)}
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
              This will permanently delete the following user and all their data. This action cannot be undone.
            </div>
            <div style={{
              padding: 14, borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>
                {confirmDelete.full_name || confirmDelete.display_name || '—'}
              </div>
              <div style={{ fontSize: 12, color: c.dim, marginTop: 2 }}>
                {confirmDelete.email || confirmDelete.id}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
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
                onClick={confirmDeleteAction}
                disabled={deleteMutation.isPending}
                style={{
                  background: '#ef4444', border: 'none',
                  borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  opacity: deleteMutation.isPending ? 0.6 : 1,
                }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
            {deleteMutation.isError && (
              <div style={{ marginTop: 12, color: '#ef4444', fontSize: 12 }}>
                {deleteMutation.error?.message || 'Failed to delete user.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
