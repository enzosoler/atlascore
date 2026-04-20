/**
 * DangerZone — /app/settings/danger.
 * Ref: GitHub danger zone + Stripe account close + Notion trash.
 *
 * Three escalating levels:
 *  1. Export data (safe, no destruction)
 *  2. Reset Atlas data (destructive — wipes logs, keeps account)
 *  3. Delete account (terminal — confirms with email typed)
 *
 * Every destructive action requires a confirm step. No one-tap oopsies.
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

export default function DangerZone({
  userEmail = '',
  onBack,
  onExportData,
  onResetData,            // async () — wipes food/workout/body/coach logs
  onDeleteAccount,        // async () — terminal
}) {
  const [confirming, setConfirming] = useState(null); // 'reset' | 'delete' | null
  const [typedEmail, setTypedEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => { setConfirming(null); setTypedEmail(''); };

  const runReset = async () => {
    setBusy(true);
    try { await onResetData?.(); close(); } finally { setBusy(false); }
  };
  const runDelete = async () => {
    setBusy(true);
    try { await onDeleteAccount?.(); } finally { setBusy(false); }
  };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 520, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 9999, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, background: '#FB7185' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#FB7185' }}>
              Danger zone
            </span>
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Irreversible actions
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
            These actions destroy data permanently. Export first if you want a copy.
          </p>
        </SpringReveal>

        {/* Export data */}
        <SpringReveal delay={60}>
          <Glass radius="xl" style={{ padding: 16, marginTop: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 }}>
              Export your data
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
              A JSON archive of every meal, workout, measurement, photo reference, and chat. Takes
              ~30 seconds to generate.
            </p>
            <LiquidButton intent="neutral" size="md" onClick={onExportData}>Generate export</LiquidButton>
          </Glass>
        </SpringReveal>

        {/* Reset data */}
        <SpringReveal delay={100}>
          <Glass radius="xl" style={{ padding: 16, marginTop: 12, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.22)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4, color: '#FBBF24' }}>
              Reset all Atlas data
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
              Wipes every food entry, workout session, measurement, photo, and chat. Your account,
              email, and subscription stay intact. <strong style={{ color: '#FBBF24' }}>Cannot be undone.</strong>
            </p>
            <button
              type="button"
              onClick={() => setConfirming('reset')}
              style={{
                height: 44, paddingInline: 18, borderRadius: 12,
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#FBBF24',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Reset data…
            </button>
          </Glass>
        </SpringReveal>

        {/* Delete account */}
        <SpringReveal delay={140}>
          <Glass radius="xl" style={{ padding: 16, marginTop: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4, color: '#FB7185' }}>
              Delete account
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
              Removes your account, logs, photos, and cancels any active subscription. Your email
              becomes available to sign up again.{' '}
              <strong style={{ color: '#FB7185' }}>Permanent. No recovery.</strong>
            </p>
            <button
              type="button"
              onClick={() => setConfirming('delete')}
              style={{
                height: 44, paddingInline: 18, borderRadius: 12,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.5)',
                color: '#FB7185',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Delete my account…
            </button>
          </Glass>
        </SpringReveal>
      </div>

      {/* Confirm modal */}
      {confirming && (
        <ConfirmModal
          kind={confirming}
          userEmail={userEmail}
          typedEmail={typedEmail}
          onType={setTypedEmail}
          busy={busy}
          onCancel={close}
          onConfirm={confirming === 'reset' ? runReset : runDelete}
        />
      )}
    </SafeScreen>
  );
}
export { DangerZone };

function ConfirmModal({ kind, userEmail, typedEmail, onType, busy, onCancel, onConfirm }) {
  const isDelete = kind === 'delete';
  const needsTyping = isDelete;
  const canConfirm = !busy && (!needsTyping || typedEmail.trim().toLowerCase() === userEmail.trim().toLowerCase());

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          margin: '0 max(12px, env(safe-area-inset-left))',
          padding: 22,
          borderRadius: '20px 20px 0 0',
          background: 'hsl(var(--rd-bg-app))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          boxShadow: '0 -20px 50px -10px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: 40, height: 4, borderRadius: 4,
            background: 'rgba(255,255,255,0.18)',
            margin: '-6px auto 14px',
          }}
          aria-hidden
        />
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: isDelete ? '#FB7185' : '#FBBF24' }}>
          {isDelete ? 'Delete account' : 'Reset all data'}
        </div>
        <h2 style={{ margin: '4px 0 6px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {isDelete ? 'This really ends your Atlas account.' : 'Wipe every log, keep the account.'}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
          {isDelete
            ? 'Your workouts, meals, measurements, photos, and chats will be deleted. Active subscriptions cancel. This cannot be undone.'
            : 'Everything you logged gets erased. Your email, settings, and subscription stay. Takes a few seconds to complete.'}
        </p>

        {needsTyping && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
              Type your email to confirm
            </div>
            <input
              type="email"
              value={typedEmail}
              onChange={(e) => onType(e.target.value)}
              placeholder={userEmail}
              autoFocus
              style={{
                width: '100%', height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.35)',
                color: 'hsl(var(--rd-fg-primary))', padding: '0 14px',
                fontSize: 14, outline: 'none',
              }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
          <LiquidButton intent="neutral" size="lg" onClick={onCancel} disabled={busy}>
            Cancel
          </LiquidButton>
          <LiquidButton intent="danger" size="lg" onClick={onConfirm} disabled={!canConfirm} loading={busy}>
            {isDelete ? 'Delete permanently' : 'Yes, wipe my data'}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label="Back"
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
