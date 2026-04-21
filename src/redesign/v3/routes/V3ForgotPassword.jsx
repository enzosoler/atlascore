import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { email as emailService } from '@/lib/emailService';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import { ACBtn, ACFonts, ACLabel, ACBrand, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function ForgotPasswordCard({
  dark,
  email,
  loading,
  error,
  sent,
  onEmailChange,
  onSubmit,
  onClose,
  onTryAgain,
  t,
}) {
  const c = useACT(dark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/auth/login"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: c.card,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.fg,
            textDecoration: 'none',
          }}
          aria-label={t('auth.forgot.backToLogin')}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M6.5 1.4L2.5 5l4 3.6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: c.card,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label={t('common.close')}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 0' }}>
        <div style={{ marginTop: 14 }}>
          <HeartMark size={40} color={c.fg} accent={c.accent} />
        </div>

        <div style={{ marginTop: 22, fontFamily: ACFonts.brand, fontSize: 44, letterSpacing: -2, lineHeight: 0.9, textTransform: 'lowercase' }}>
          {t('auth.forgot.headingLine1')}
          <br />
          <span style={{ color: c.accent }}>{t('auth.forgot.headingAccent')}</span>
        </div>

        <div style={{ marginTop: 12, maxWidth: 300, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          {sent
            ? t('auth.forgot.sentBody', { email })
            : t('auth.forgot.body')}
        </div>

        {sent ? (
          <>
            <div
              style={{
                marginTop: 30,
                padding: '16px 18px',
                borderRadius: 16,
                background: c.card,
                border: `1px solid ${c.hair}`,
                fontSize: 14,
                lineHeight: 1.55,
                color: c.dim,
              }}
            >
              {t('auth.forgot.checkSpam')}
            </div>
            <div style={{ marginTop: 22 }}>
              <ACBtn primary dark={dark} size="lg" pill block type="button" onClick={() => onClose('/auth/login')}>
                {t('auth.forgot.backToSignIn')}
              </ACBtn>
            </div>
            <button
              type="button"
              onClick={onTryAgain}
              style={{
                marginTop: 18,
                border: 'none',
                background: 'transparent',
                color: c.accent,
                fontFamily: ACFonts.body,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: -0.1,
                cursor: 'pointer',
              }}
            >
              {t('auth.forgot.tryDifferentEmail')}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginTop: 34 }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                Email
              </ACLabel>
              <div
                style={{
                  marginTop: 8,
                  padding: '0 16px',
                  background: c.card,
                  borderRadius: 12,
                  borderBottom: `2px solid ${c.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder={t('auth.form.emailPlaceholder')}
                  style={{
                    flex: 1,
                    height: 48,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: c.fg,
                    fontSize: 16,
                    letterSpacing: -0.2,
                    fontWeight: 500,
                    fontFamily: ACFonts.body,
                  }}
                />
              </div>
              <ACLabel
                size={10}
                color={error ? ACBrand.error : c.mute}
                style={{ fontFamily: ACFonts.body, letterSpacing: 0.1, marginTop: 8, display: 'block' }}
              >
                {error || t('auth.forgot.hint')}
              </ACLabel>
            </div>

            <div style={{ marginTop: 22 }}>
              <ACBtn primary dark={dark} size="lg" pill block type="submit" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? t('auth.forgot.sending') : t('auth.forgot.submit')}
              </ACBtn>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default function V3ForgotPassword() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const t = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const em = email.trim().toLowerCase();
    if (!em) {
      setError(t('auth.forgot.enterEmail'));
      return;
    }

    setLoading(true);
    try {
      await emailService.passwordReset({ email: em });
      setEmail(em);
      setSent(true);
    } catch (err) {
      setError(err?.message || t('auth.forgot.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <V3StandaloneLayout>
      <ForgotPasswordCard
        dark={theme === 'dark'}
        email={email}
        loading={loading}
        error={error}
        sent={sent}
        onEmailChange={setEmail}
        onSubmit={onSubmit}
        onClose={(to = '/welcome/manifesto') => navigate(to)}
        onTryAgain={() => {
          setSent(false);
          setError('');
        }}
        t={t}
      />
    </V3StandaloneLayout>
  );
}
