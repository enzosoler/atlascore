/**
 * MagicLinkSent — /auth/magic.
 * Shown after we successfully triggered Supabase `signInWithOtp`. User checks
 * their email and clicks the link, which lands in /auth/callback.
 */
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  AuthLayout, AuthTitle, AuthPrimary, BrandMark,
  FormError, FormSuccess, MailIcon,
} from './_AuthPrimitives';

export default function MagicLinkSent() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const resend = async () => {
    if (!email) return;
    setError('');
    setSending(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      setResent(true);
    } catch (err) {
      setError(err?.message || 'Could not resend the link.');
    } finally { setSending(false); }
  };

  return (
    <AuthLayout>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <BrandMark size="lg" />
      </div>

      {/* Envelope hero icon */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <span
          aria-hidden
          style={{
            width: 72, height: 72, borderRadius: 9999,
            background: 'rgba(0,255,255,0.08)',
            border: '1px solid rgba(0,255,255,0.22)',
            color: 'hsl(var(--rd-accent))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M3 7l9 7 9-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <AuthTitle
          title="Check your email"
          subtitle={email
            ? <>We sent a sign-in link to <strong style={{ color: 'hsl(var(--rd-fg-primary))' }}>{email}</strong>. Tap it and you're in.</>
            : 'We sent you a sign-in link. Tap it from your inbox and you\'re in.'}
        />
      </div>

      {error && <div style={{ marginTop: 18 }}><FormError message={error} /></div>}
      {resent && <div style={{ marginTop: 18 }}><FormSuccess message="Link resent. Check again in a moment." /></div>}

      <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
        <AuthPrimary
          onClick={() => { window.location.href = mailClientUrl(email); }}
          disabled={!email}
        >
          Open mail app
        </AuthPrimary>
        <button
          type="button"
          onClick={resend}
          disabled={!email || sending || resent}
          style={{
            height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
            color: 'hsl(var(--rd-fg-secondary))',
            fontSize: 14, fontWeight: 600,
            cursor: (!email || sending || resent) ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
            opacity: (!email || sending || resent) ? 0.5 : 1,
          }}
        >
          {resent ? 'Sent' : sending ? 'Sending…' : 'Resend link'}
        </button>
      </div>

      <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
        Wrong email?{' '}
        <Link to="/auth/login" style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}>
          Go back
        </Link>
      </p>
    </AuthLayout>
  );
}
export { MagicLinkSent };

function mailClientUrl(email) {
  if (!email) return 'mailto:';
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain?.includes('gmail')) return 'https://mail.google.com';
  if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) return 'https://outlook.live.com';
  if (domain?.includes('icloud') || domain?.includes('me.com')) return 'https://www.icloud.com/mail';
  if (domain?.includes('proton')) return 'https://mail.proton.me';
  if (domain?.includes('yahoo')) return 'https://mail.yahoo.com';
  return 'mailto:';
}
