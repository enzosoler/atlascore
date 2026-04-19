/**
 * AccountSettings — /app/settings/account.
 * Ref: iOS Account settings + Stripe account + Linear account.
 *
 * Sections:
 *  - Email (change → sends verification)
 *  - Password (change → requires current + new)
 *  - 2FA status (enabled / not enabled → link)
 *  - Linked providers (Apple, Google OAuth status)
 *  - Sessions (active devices, sign out others)
 *  - Delete account → routes to /danger
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

export default function AccountSettings({
  user = null,                 // { email, twoFactorEnabled, providers, sessionsCount }
  onBack,
  onChangeEmail,
  onChangePassword,
  onEnable2FA,
  onManageSessions,
  onUnlinkProvider,            // (providerName) => void
  onDeleteAccount,
}) {
  const email = user?.email || '';
  const twoFactorOn = !!user?.twoFactorEnabled;
  const providers = user?.providers || [];   // ['apple', 'google']
  const sessionsCount = user?.sessionsCount ?? null;

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 60px)' }}>
      {/* Back */}
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 520, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Account & security
          </h1>
        </SpringReveal>

        {/* Email */}
        <Section title="Email" delay={60}>
          <Row
            label="Email address"
            value={email || '—'}
            actionLabel="Change"
            onAction={onChangeEmail}
            last
          />
        </Section>

        {/* Password */}
        <Section title="Password" delay={100}>
          <Row
            label="Password"
            value="••••••••••"
            actionLabel="Change"
            onAction={onChangePassword}
            last
          />
        </Section>

        {/* 2FA */}
        <Section title="Two-factor authentication" delay={140}>
          <Row
            label={twoFactorOn ? '2FA enabled' : '2FA not enabled'}
            value={twoFactorOn ? 'App + backup codes' : 'Recommended'}
            valueColor={twoFactorOn ? '#34D399' : '#FBBF24'}
            actionLabel={twoFactorOn ? 'Manage' : 'Enable'}
            onAction={onEnable2FA}
            last
          />
        </Section>

        {/* Linked providers */}
        <Section title="Linked accounts" delay={180}>
          {providers.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
              No third-party providers linked. You sign in with email + password.
            </div>
          ) : (
            providers.map((p, i) => (
              <Row
                key={p}
                label={providerLabel(p)}
                value="Connected"
                valueColor="#34D399"
                actionLabel="Unlink"
                actionTone="danger"
                onAction={() => onUnlinkProvider?.(p)}
                last={i === providers.length - 1}
              />
            ))
          )}
        </Section>

        {/* Sessions */}
        <Section title="Active sessions" delay={220}>
          <Row
            label="Signed-in devices"
            value={sessionsCount != null ? `${sessionsCount} ${sessionsCount === 1 ? 'device' : 'devices'}` : '—'}
            actionLabel="Manage"
            onAction={onManageSessions}
            last
          />
        </Section>

        {/* Danger zone link */}
        <Section title="Account deletion" delay={260}>
          <button
            type="button"
            onClick={onDeleteAccount}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent', border: 'none',
              color: '#FB7185',
              fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
              textAlign: 'left',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            Delete account and all data →
          </button>
        </Section>
      </div>
    </SafeScreen>
  );
}
export { AccountSettings };

/* ─── Shared section/row components ─────────────────────────────────────── */

function Section({ title, delay = 0, children }) {
  return (
    <SpringReveal delay={delay}>
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
          {title}
        </div>
        <Glass radius="xl" style={{ padding: 4, overflow: 'hidden' }}>
          {children}
        </Glass>
      </div>
    </SpringReveal>
  );
}

function Row({ label, value, valueColor, actionLabel, actionTone, onAction, last }) {
  const danger = actionTone === 'danger';
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 14px',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))', letterSpacing: '-0.005em' }}>{label}</div>
        <div
          style={{
            fontSize: 12,
            color: valueColor || 'hsl(var(--rd-fg-muted))',
            fontWeight: valueColor ? 600 : 500,
            fontVariantNumeric: 'tabular-nums',
            marginTop: 2,
          }}
          className="truncate"
        >
          {value}
        </div>
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          style={{
            height: 32, paddingInline: 12, borderRadius: 9999, flexShrink: 0,
            background: danger ? 'rgba(239,68,68,0.10)' : 'rgba(0,255,255,0.08)',
            border: danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,255,255,0.22)',
            color: danger ? '#FB7185' : 'hsl(var(--rd-accent))',
            fontSize: 12, fontWeight: 700, letterSpacing: '-0.005em',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
        zIndex: 45,
        width: 36, height: 36, borderRadius: 9999,
        background: 'rgba(10,14,20,0.55)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function providerLabel(p) {
  return ({ apple: 'Apple', google: 'Google', github: 'GitHub' })[p] || p;
}
