import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/lib/supabaseClient';
import { getAuthRedirectUrl } from '@/lib/authRedirects';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import { ACFonts, useACT, ACLabel, ACBtn, ACBrand } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function getMailLaunchTarget(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain?.includes('gmail')) return 'https://mail.google.com';
  if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) return 'https://outlook.live.com';
  if (domain?.includes('icloud') || domain?.includes('me.com')) return 'https://www.icloud.com/mail';
  if (domain?.includes('proton')) return 'https://mail.proton.me';
  if (domain?.includes('yahoo')) return 'https://mail.yahoo.com';
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') return 'message://';
  return null;
}

function MagicLinkState() {
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const t = useT();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const email = params.get('email') || '';
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const mailLaunchTarget = getMailLaunchTarget(email);

  const openInbox = async () => {
    if (!mailLaunchTarget) return;

    if (/^https?:/i.test(mailLaunchTarget) && Capacitor.isNativePlatform()) {
      await Browser.open({ url: mailLaunchTarget });
      return;
    }

    window.location.assign(mailLaunchTarget);
  };

  const resend = async () => {
    if (!email) return;
    setError('');
    setSending(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      });
      if (err) throw err;
      setResent(true);
    } catch (err) {
      setError(err?.message || t('magicLink.errorFallback'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 28px 32px', background: c.bg, color: c.fg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <HeartMark size={20} color={c.fg} accent={c.accent} />
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {t('magicLink.eyebrow')}
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
          {t('magicLink.headingLine1')}
          <br />
          <span style={{ color: c.accent }}>{t('magicLink.headingAccent')}</span>
        </div>

        <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: c.dim, maxWidth: 310 }}>
          {email ? (
            <>{t('magicLink.bodyWithEmail').split('{email}')[0]}<span style={{ color: c.fg, fontWeight: 600 }}>{email}</span>{t('magicLink.bodyWithEmail').split('{email}')[1]}</>
          ) : (
            <>{t('magicLink.bodyNoEmail')}</>
          )}
        </div>

        {error ? (
          <div style={{ marginTop: 14, fontSize: 13, color: ACBrand.error, lineHeight: 1.5 }}>{error}</div>
        ) : null}
        {resent ? (
          <div style={{ marginTop: 14, fontSize: 13, color: c.accent, lineHeight: 1.5 }}>{t('magicLink.resentConfirm')}</div>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ACBtn
          primary
          block
          dark={dark}
          size="lg"
          pill
          onClick={openInbox}
          style={{ opacity: mailLaunchTarget ? 1 : 0.5 }}
        >
          {t('magicLink.openMailApp')}
        </ACBtn>
        <ACBtn block dark={dark} size="lg" pill onClick={resend} style={{ opacity: !email || sending || resent ? 0.5 : 1 }}>
          {resent ? t('magicLink.sent') : sending ? t('magicLink.sending') : t('magicLink.resend')}
        </ACBtn>
        <div style={{ textAlign: 'center', paddingTop: 4, fontSize: 13, color: c.dim }}>
          {t('magicLink.wrongEmail')}{' '}
          <Link to="/auth/login" style={{ color: c.fg, fontWeight: 600, textDecoration: 'none' }}>
            {t('magicLink.goBack')}
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
