/**
 * AdminGDPR — GDPR & compliance tools page.
 *
 * Shows pending account deletion requests, manual compliance action
 * checklist for third-party services, and GDPR data export tooling.
 * Follows the same styling conventions as AdminOverview.jsx.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ACFonts, ACBrand, useACT, ACMono } from '@/redesign/v3/lib/paper.jsx';
import { supabase } from '@/lib/supabaseClient';
import { fetchAuditLogs, logAdminAction, searchUsers } from '@/lib/adminService';

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchDeletionRequests() {
  // Query the deletion_requests table if it exists. Returns empty array if
  // the table is absent or the query fails — this page must never error out.
  try {
    const { data, error } = await supabase
      .from('deletion_requests')
      .select('id, user_id, email, requested_at, status, completed_at')
      .order('requested_at', { ascending: false })
      .limit(50);
    if (error) {
      // Table may not exist yet — treat as empty state.
      console.warn('[AdminGDPR] deletion_requests query failed:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[AdminGDPR] deletion_requests fetch error:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

function StatusBadge({ status, c }) {
  const colors = {
    pending: { bg: 'rgba(232,181,0,0.15)', fg: ACBrand.accent },
    completed: { bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
    failed: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
  };
  const style = colors[status] || { bg: 'rgba(239,233,218,0.07)', fg: c.mute };
  return (
    <span style={{
      fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.4,
      textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5,
      background: style.bg, color: style.fg,
    }}>
      {status}
    </span>
  );
}

function DeletionRequestsTable({ requests, c }) {
  if (!requests?.length) {
    return (
      <div style={{
        padding: '24px 12px', textAlign: 'center',
        color: c.mute, fontSize: 13,
      }}>
        No pending deletion requests.
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          {['User ID', 'Email', 'Requested', 'Status', 'Completed'].map(col => (
            <th key={col} style={{
              textAlign: 'left', padding: '6px 10px',
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
        {requests.map((row) => (
          <tr key={row.id} style={{ borderBottom: `1px solid ${c.hair}` }}>
            <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>
              {(row.user_id || row.id || '—').slice(0, 8)}…
            </td>
            <td style={{ padding: '8px 10px', color: c.fg }}>{row.email || '—'}</td>
            <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>
              {row.requested_at ? new Date(row.requested_at).toLocaleDateString() : '—'}
            </td>
            <td style={{ padding: '8px 10px' }}>
              <StatusBadge status={row.status || 'pending'} c={c} />
            </td>
            <td style={{ padding: '8px 10px', fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>
              {row.completed_at ? new Date(row.completed_at).toLocaleDateString() : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ManualActionRow({ service, status, instruction, link, c }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '12px 0',
      borderBottom: `1px solid ${c.hair}`,
    }}>
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: 8,
        background: 'rgba(239,233,218,0.06)',
        display: 'grid', placeItems: 'center',
        fontFamily: ACFonts.mono, fontSize: 10, color: c.dim,
      }}>
        {status === 'auto' ? '✓' : '!'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: c.fg, marginBottom: 3,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {service}
          {status === 'auto' && (
            <span style={{
              fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.2,
              textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4,
              background: 'rgba(34,197,94,0.12)', color: '#22c55e',
            }}>
              automated
            </span>
          )}
          {status === 'manual' && (
            <span style={{
              fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.2,
              textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4,
              background: 'rgba(232,181,0,0.15)', color: ACBrand.accent,
            }}>
              manual step
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: c.dim, lineHeight: 1.5 }}>
          {instruction}
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: 5,
              fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.5,
              color: c.accent, textDecoration: 'none',
            }}
          >
            {link} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function ProcessorIdentifierGrid({ user, c }) {
  if (!user) return null;
  const subscription = Array.isArray(user.subscriptions) ? user.subscriptions[0] : null;
  const rows = [
    { label: 'Supabase user_id', value: user.id },
    { label: 'RevenueCat app_user_id', value: user.id },
    { label: 'PostHog distinct_id', value: user.id },
    { label: 'Sentry user.id', value: user.id },
    { label: 'Stripe customer', value: subscription?.stripe_customer_id || subscription?.stripe_subscription_id || 'No linked Stripe customer found' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 14 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ padding: 12, borderRadius: 10, background: 'rgba(239,233,218,0.03)', border: `1px solid ${c.hair}` }}>
          <ACMono size={8} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>{row.label}</ACMono>
          <div style={{ marginTop: 5, fontFamily: ACFonts.mono, fontSize: 11, color: c.fg, overflowWrap: 'anywhere' }}>
            {row.value || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminGDPR() {
  const c = useACT(true);
  const [lookupQuery, setLookupQuery] = React.useState('');
  const [lookupResults, setLookupResults] = React.useState([]);
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupError, setLookupError] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [adminNote, setAdminNote] = React.useState('');
  const [noteSaving, setNoteSaving] = React.useState(false);

  const { data: deletionRequests = [], isLoading } = useQuery({
    queryKey: ['admin-gdpr-deletion-requests'],
    queryFn: fetchDeletionRequests,
    staleTime: 30_000,
  });
  const { data: auditLogs = [], refetch: refetchAuditLogs } = useQuery({
    queryKey: ['admin-gdpr-audit-logs'],
    queryFn: () => fetchAuditLogs(40),
    staleTime: 30_000,
  });

  const pending = deletionRequests.filter(r => r.status === 'pending' || !r.status);
  const completed = deletionRequests.filter(r => r.status === 'completed');
  const selectedDeletion = selectedUser
    ? deletionRequests.find((row) => row.user_id === selectedUser.id || row.email === selectedUser.email)
    : null;
  const selectedAuditLogs = selectedUser
    ? auditLogs.filter((row) => row.target_user_id === selectedUser.id).slice(0, 8)
    : [];

  const handleLookup = async () => {
    const query = lookupQuery.trim();
    if (!query) return;
    setLookupLoading(true);
    setLookupError('');
    try {
      const result = await searchUsers(query);
      setLookupResults(result.users || []);
      setSelectedUser((result.users || [])[0] || null);
    } catch (error) {
      console.warn('[AdminGDPR] user lookup failed:', error);
      setLookupError(error?.message || 'Could not search users.');
      setLookupResults([]);
      setSelectedUser(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedUser?.id || !adminNote.trim()) return;
    setNoteSaving(true);
    try {
      await logAdminAction('gdpr_compliance_note', selectedUser.id, {
        note: adminNote.trim(),
        deletion_status: selectedDeletion?.status || 'no_request_found',
        identifiers: {
          revenuecat_app_user_id: selectedUser.id,
          posthog_distinct_id: selectedUser.id,
          sentry_user_id: selectedUser.id,
        },
      });
      setAdminNote('');
      await refetchAuditLogs();
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -1, color: c.fg,
        }}>
          Compliance
        </div>
        <div style={{ fontSize: 13, color: c.dim, marginTop: 4 }}>
          GDPR deletion requests, manual compliance actions, and data export tools.
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total requests', value: deletionRequests.length },
          { label: 'Pending', value: pending.length, accent: pending.length > 0 },
          { label: 'Completed', value: completed.length },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            padding: 20, borderRadius: 14,
            background: accent ? 'rgba(232,181,0,0.08)' : c.card,
            border: `1px solid ${accent ? 'rgba(232,181,0,0.2)' : c.hair}`,
          }}>
            <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>
              {label}
            </ACMono>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
              letterSpacing: -1.2, color: accent ? c.accent : c.fg, marginTop: 6,
            }}>
              {isLoading ? '…' : value}
            </div>
          </div>
        ))}
      </div>

      {/* User lookup */}
      <SectionCard title="User lookup and processor status" c={c}>
        <div style={{ fontSize: 12, color: c.dim, marginBottom: 14, lineHeight: 1.6 }}>
          Search by email, Supabase user ID, or display name. Use the identifiers below when verifying RevenueCat,
          PostHog, Sentry, Stripe, and Supabase deletion/anonymization work.
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={lookupQuery}
            onChange={(event) => setLookupQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') handleLookup(); }}
            placeholder="email, user UUID, or name"
            style={{
              flex: 1, minHeight: 42, borderRadius: 10,
              border: `1px solid ${c.hair}`, background: 'rgba(239,233,218,0.03)',
              color: c.fg, padding: '0 12px', fontFamily: ACFonts.body, fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={lookupLoading || !lookupQuery.trim()}
            style={{
              minHeight: 42, borderRadius: 10, border: 'none',
              background: c.accent, color: '#111', padding: '0 16px',
              fontWeight: 700, cursor: lookupLoading ? 'wait' : 'pointer',
              opacity: lookupQuery.trim() ? 1 : 0.45,
            }}
          >
            {lookupLoading ? 'Searching…' : 'Search'}
          </button>
        </div>
        {lookupError && (
          <div style={{ marginTop: 10, color: '#ef4444', fontSize: 12 }}>{lookupError}</div>
        )}
        {lookupResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            {lookupResults.slice(0, 6).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUser(user)}
                style={{
                  display: 'flex', justifyContent: 'space-between', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  border: `1px solid ${selectedUser?.id === user.id ? c.accent : c.hair}`,
                  background: selectedUser?.id === user.id ? 'rgba(232,181,0,0.08)' : 'rgba(239,233,218,0.03)',
                  color: c.fg, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{user.email || user.full_name || user.id}</span>
                  <span style={{ display: 'block', marginTop: 3, fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{user.id}</span>
                </span>
                <StatusBadge status={selectedUser?.id === user.id ? 'completed' : 'idle'} c={c} />
              </button>
            ))}
          </div>
        )}
        {selectedUser && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.hair}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>{selectedUser.email || selectedUser.full_name || selectedUser.id}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: c.dim }}>
                  Deletion status: <StatusBadge status={selectedDeletion?.status || 'no request'} c={c} />
                </div>
              </div>
              <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.3 }}>
                {selectedUser.role || 'user'}
              </ACMono>
            </div>
            <ProcessorIdentifierGrid user={selectedUser} c={c} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 10, marginTop: 14 }}>
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Record RevenueCat/PostHog/Sentry/Stripe deletion verification notes."
                rows={3}
                style={{
                  width: '100%', borderRadius: 10, border: `1px solid ${c.hair}`,
                  background: 'rgba(239,233,218,0.03)', color: c.fg,
                  padding: 12, fontFamily: ACFonts.body, fontSize: 13,
                  resize: 'vertical', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={noteSaving || !adminNote.trim()}
                style={{
                  minHeight: 42, borderRadius: 10, border: `1px solid ${c.hair}`,
                  background: adminNote.trim() ? c.fg : 'rgba(239,233,218,0.04)',
                  color: adminNote.trim() ? c.bg : c.mute,
                  fontWeight: 700, cursor: noteSaving ? 'wait' : 'pointer',
                }}
              >
                {noteSaving ? 'Saving note…' : 'Save audit note'}
              </button>
            </div>
            {selectedAuditLogs.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Recent audit trail
                </ACMono>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {selectedAuditLogs.map((log) => (
                    <div key={log.id} style={{ padding: 10, borderRadius: 10, background: 'rgba(239,233,218,0.03)', border: `1px solid ${c.hair}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.fg }}>{log.action_type}</span>
                        <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </span>
                      </div>
                      {log.action_detail?.note && (
                        <div style={{ marginTop: 5, fontSize: 12, color: c.dim, lineHeight: 1.5 }}>{log.action_detail.note}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Pending deletion requests */}
      <SectionCard title="Pending deletion requests" c={c}>
        {isLoading ? (
          <div style={{ color: c.mute, fontSize: 12, padding: 8 }}>Loading…</div>
        ) : (
          <DeletionRequestsTable requests={pending} c={c} />
        )}
      </SectionCard>

      {/* All requests (recent) */}
      {deletionRequests.length > 0 && (
        <SectionCard title={`All requests · ${deletionRequests.length} total`} c={c}>
          <DeletionRequestsTable requests={deletionRequests} c={c} />
        </SectionCard>
      )}

      {/* Manual compliance actions */}
      <SectionCard title="Manual compliance actions" c={c}>
        <div style={{ fontSize: 12, color: c.dim, marginBottom: 12, lineHeight: 1.6 }}>
          When a user deletes their account via the app, the{' '}
          <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.fg }}>self-delete-user</span>{' '}
          edge function automatically handles Supabase data, Stripe subscription cancellation,
          RevenueCat subscriber deletion, PostHog person deletion, and a best-effort Sentry user scrub.
          The items below require manual follow-up for full compliance.
        </div>

        <ManualActionRow
          service="RevenueCat"
          status="auto"
          instruction="Automated path: self-delete-user calls DELETE /v1/subscribers/{app_user_id}. Dashboard verification path: RevenueCat > Project > Customer List > search the Supabase user UUID as App User ID > confirm the subscriber is absent or anonymized."
          link="https://app.revenuecat.com"
          c={c}
        />
        <ManualActionRow
          service="PostHog"
          status="auto"
          instruction="Automated path: self-delete-user looks up a person by distinct_id = Supabase user UUID and deletes with delete_events=true. Dashboard fallback: PostHog > People > search distinct_id/user UUID > open person > Delete person and events > verify no person profile remains."
          link="https://app.posthog.com/settings"
          c={c}
        />
        <ManualActionRow
          service="Sentry"
          status="manual"
          instruction="Best-effort path: self-delete-user calls the Sentry project users endpoint with user.id = Supabase user UUID. Manual fallback: Sentry > Project > Issues > Users tab, or Organization Settings > Users, search the UUID/email, delete or request support erasure, then record the result as an audit note."
          link="https://sentry.io/settings"
          c={c}
        />
        <div style={{ paddingTop: 4 }}>
          <ManualActionRow
            service="Stripe"
            status="auto"
            instruction="Active Stripe subscriptions are cancelled automatically. Customer records are retained by Stripe for financial/audit purposes per their data retention policy, which is acceptable under GDPR legitimate interest for billing history."
            link="https://dashboard.stripe.com/customers"
            c={c}
          />
        </div>
      </SectionCard>

      {/* GDPR data export */}
      <SectionCard title="Data export tools" c={c}>
        <div style={{ fontSize: 12, color: c.dim, marginBottom: 16, lineHeight: 1.6 }}>
          Export user data in response to GDPR data portability requests (Article 20).
          Use the Supabase dashboard for direct table exports, or build a structured
          export from the user_profiles + related tables.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              label: 'Supabase table editor',
              desc: 'Direct table access — filter by user_id and export as CSV.',
              href: 'https://supabase.com/dashboard',
            },
            {
              label: 'PostHog person export',
              desc: 'Download all events for a specific user from the PostHog dashboard.',
              href: 'https://app.posthog.com',
            },
            {
              label: 'Stripe customer portal',
              desc: 'Billing history and invoice export for the user.',
              href: 'https://dashboard.stripe.com/customers',
            },
          ].map(({ label, desc, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239,233,218,0.03)',
                border: `1px solid ${c.hair}`,
                textDecoration: 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>{label}</div>
                <div style={{ fontSize: 11, color: c.dim, marginTop: 2 }}>{desc}</div>
              </div>
              <span style={{ color: c.mute, fontSize: 16 }}>↗</span>
            </a>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
