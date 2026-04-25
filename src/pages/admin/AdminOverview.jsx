/**
 * AdminOverview — dashboard landing page.
 *
 * Shows KPI cards, recent signups, recent errors, signup sparkline,
 * and onboarding funnel. All data from existing adminService functions.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ACFonts, ACBrand, useACT, ACNum, ACLabel, ACMono } from '@/redesign/v3/lib/paper.jsx';
import {
  getEnhancedAdminMetrics,
  fetchRecentSignups,
  fetchRecentErrors,
  fetchSignupSparkline,
  fetchFunnelData,
} from '@/lib/adminService';
import AdminSparkline from '@/components/admin/AdminSparkline';
import AdminFunnelBar from '@/components/admin/AdminFunnelBar';

function KPICard({ label, value, sub, accent, c }) {
  return (
    <div style={{
      padding: 20, borderRadius: 14,
      background: accent ? 'rgba(232,181,0,0.08)' : c.card,
      border: `1px solid ${accent ? 'rgba(232,181,0,0.2)' : c.hair}`,
    }}>
      <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>{label}</ACMono>
      <div style={{
        fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
        letterSpacing: -1.2, color: accent ? c.accent : c.fg, marginTop: 6,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: c.dim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function RecentList({ title, items, emptyText, c, onClickItem }) {
  return (
    <div style={{
      padding: 20, borderRadius: 14,
      background: c.card, border: `1px solid ${c.hair}`,
    }}>
      <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>{title}</ACMono>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items?.length ? items.map((item, i) => (
          <div
            key={i}
            onClick={() => onClickItem?.(item)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(239,233,218,0.03)',
              cursor: onClickItem ? 'pointer' : 'default',
              fontSize: 12,
            }}
          >
            <span style={{ color: c.fg, fontWeight: 500 }}>{item.label}</span>
            <span style={{ color: c.mute, fontFamily: ACFonts.mono, fontSize: 10 }}>{item.meta}</span>
          </div>
        )) : (
          <div style={{ fontSize: 12, color: c.mute, padding: 8 }}>{emptyText}</div>
        )}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const c = useACT(true);
  const navigate = useNavigate();

  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: getEnhancedAdminMetrics,
    staleTime: 30_000,
  });

  const { data: recentSignups } = useQuery({
    queryKey: ['admin-recent-signups'],
    queryFn: () => fetchRecentSignups(5),
    staleTime: 30_000,
  });

  const { data: recentErrors } = useQuery({
    queryKey: ['admin-recent-errors'],
    queryFn: () => fetchRecentErrors(5),
    staleTime: 30_000,
  });

  const { data: sparkline } = useQuery({
    queryKey: ['admin-signup-sparkline'],
    queryFn: () => fetchSignupSparkline(7),
    staleTime: 60_000,
  });

  const { data: funnel } = useQuery({
    queryKey: ['admin-funnel'],
    queryFn: () => fetchFunnelData(),
    staleTime: 60_000,
  });

  const m = metrics || {};
  const maxFunnel = funnel?.[0]?.count || 1;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -1, color: c.fg,
        }}>
          Dashboard
        </div>
        <div style={{ fontSize: 13, color: c.dim, marginTop: 4 }}>
          System overview and key metrics.
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="Total users" value={m.totalUsers ?? '—'} c={c} />
        <KPICard label="Active subs" value={m.activeSubscriptions ?? '—'} sub={`${m.trialingSubscriptions ?? 0} trialing`} accent c={c} />
        <KPICard label="Signups (7d)" value={m.signupsLast7Days ?? m.newUsersLast7Days ?? '—'} c={c} />
        <KPICard label="Errors today" value={m.errorsToday ?? '—'} sub={m.errorsToday > 0 ? 'check ops' : 'clean'} c={c} />
      </div>

      {/* Sparkline + Funnel row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Signups sparkline */}
        <div style={{
          padding: 20, borderRadius: 14,
          background: c.card, border: `1px solid ${c.hair}`,
        }}>
          <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>Signups · 7d</ACMono>
          <div style={{ marginTop: 12, height: 60 }}>
            {sparkline?.length > 0 ? (
              <AdminSparkline data={sparkline.map(d => d.count)} color={ACBrand.accent} />
            ) : (
              <div style={{ color: c.mute, fontSize: 12 }}>No data</div>
            )}
          </div>
        </div>

        {/* Trial conversion */}
        <div style={{
          padding: 20, borderRadius: 14,
          background: c.card, border: `1px solid ${c.hair}`,
        }}>
          <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>Trial → Paid</ACMono>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
            letterSpacing: -1.2, color: c.accent, marginTop: 8,
          }}>
            {m.trialToPaidConversionRate != null ? `${Math.round(m.trialToPaidConversionRate)}%` : '—'}
          </div>
          <div style={{ fontSize: 12, color: c.dim, marginTop: 4 }}>
            {m.totalEverTrialed ?? 0} ever trialed · {m.trialsExpiringIn7Days ?? 0} expiring soon
          </div>
        </div>
      </div>

      {/* Funnel */}
      {funnel?.length > 0 && (
        <div style={{
          padding: 20, borderRadius: 14, marginBottom: 24,
          background: c.card, border: `1px solid ${c.hair}`,
        }}>
          <ACMono size={9} color={c.mute} style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}>Onboarding funnel</ACMono>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {funnel.map((step, i) => (
              <AdminFunnelBar
                key={step.label || i}
                label={step.label}
                count={step.count}
                conversionPct={step.conversionPct}
                dropoffPct={step.dropoffPct}
                maxCount={maxFunnel}
                isFirst={i === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <RecentList
          title="Recent signups"
          items={recentSignups?.map(u => ({
            label: u.email || u.full_name || 'Unknown',
            meta: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
            id: u.id,
          }))}
          emptyText="No recent signups"
          c={c}
          onClickItem={(item) => item.id && navigate(`/admin/users/${item.id}`)}
        />
        <RecentList
          title="Recent errors"
          items={recentErrors?.map(e => ({
            label: (e.message || e.error_message || 'Error').slice(0, 60),
            meta: e.created_at ? new Date(e.created_at).toLocaleTimeString() : '',
          }))}
          emptyText="No recent errors"
          c={c}
        />
      </div>
    </div>
  );
}
