import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import { ACFonts, useACT, ACLabel, ACBtn, ACBrand } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

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

function MagicLinkState() {
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const email = params.get('email') || '';
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 28px 32px', background: c.bg, color: c.fg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <HeartMark size={20} color={c.fg} accent={c.accent} />
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Check inbox
        </ACLabel>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke={c.accent} strokeWidth="1.75" />
            <path d="M3 7l9 7 9-7" stroke={c.accent} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ marginTop: 22, fontFamily: ACFonts.brand, fontSize: 42, letterSpacing: -1.8, lineHeight: 0.92, textTransform: 'lowercase' }}>
          check your
          <br />
          <span style={{ color: c.accent }}>email.</span>
        </div>

        <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: c.dim, maxWidth: 310 }}>
          {email ? (
            <>We sent a sign-in link to <span style={{ color: c.fg, fontWeight: 600 }}>{email}</span>. Tap it and you&apos;re in.</>
          ) : (
            <>We sent you a sign-in link. Tap it from your inbox and you&apos;re in.</>
          )}
        </div>

        {error ? (
          <div style={{ marginTop: 14, fontSize: 13, color: ACBrand.error, lineHeight: 1.5 }}>{error}</div>
        ) : null}
        {resent ? (
          <div style={{ marginTop: 14, fontSize: 13, color: c.accent, lineHeight: 1.5 }}>Link resent. Check again in a moment.</div>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={() => { window.location.href = mailClientUrl(email); }}>
          Open mail app →
        </ACBtn>
        <ACBtn block dark={dark} size="lg" pill onClick={resend} style={{ opacity: !email || sending || resent ? 0.5 : 1 }}>
          {resent ? 'Sent' : sending ? 'Sending…' : 'Resend link'}
        </ACBtn>
        <div style={{ textAlign: 'center', paddingTop: 4, fontSize: 13, color: c.dim }}>
          Wrong email?{' '}
          <Link to="/auth/login" style={{ color: c.fg, fontWeight: 600, textDecoration: 'none' }}>
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function V3MagicLinkSent() {
  return (
    <V3StandaloneLayout>
      <MagicLinkState />
    </V3StandaloneLayout>
  );
}
