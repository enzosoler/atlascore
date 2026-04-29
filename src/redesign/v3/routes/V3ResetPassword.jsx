import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import { ACBtn, ACFonts, ACLabel, ACBrand, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function EyeToggle({ show, onClick, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Hide password' : 'Show password'}
      style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
    >
      {show ? (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" stroke={color} strokeWidth="1.6" /><circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.6" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" stroke={color} strokeWidth="1.6" /><circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.6" /><path d="M3 17L17 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></svg>
      )}
    </button>
  );
}

function ResetPasswordCard({
  dark,
  password,
  confirm,
  loading,
  error,
  done,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
  t,
}) {
  const c = useACT(dark);
  const mismatch = password && confirm && password !== confirm;
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

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
          aria-label={t('auth.reset.backToLogin')}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M6.5 1.4L2.5 5l4 3.6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </Link>
      </div>

      <form onSubmit={onSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 0' }}>
        <div style={{ marginTop: 14 }}>
          <HeartMark size={40} color={c.fg} accent={c.accent} />
        </div>

        <div style={{ marginTop: 22, fontFamily: ACFonts.brand, fontSize: 44, letterSpacing: -2, lineHeight: 0.9, textTransform: 'lowercase' }}>
          {t('auth.reset.headingLine1')}
          <br />
          <span style={{ color: c.accent }}>{t('auth.reset.headingAccent')}</span>
        </div>

        <div style={{ marginTop: 12, maxWidth: 300, fontSize: 14, lineHeight: 1.55, color: c.dim }}>
          {done ? t('auth.reset.doneBody') : t('auth.reset.body')}
        </div>

        {done ? (
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
            {t('auth.reset.doneCard')}
          </div>
        ) : (
          <>
            <div style={{ marginTop: 34 }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                {t('auth.form.newPasswordLabel')}
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
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder={t('auth.reset.passwordPlaceholder')}
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
                <EyeToggle show={showPw} onClick={() => setShowPw(v => !v)} color={c.dim} />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                {t('auth.form.confirmPasswordLabel')}
              </ACLabel>
              <div
                style={{
                  marginTop: 8,
                  padding: '0 16px',
                  background: c.card,
                  borderRadius: 12,
                  borderBottom: `2px solid ${mismatch ? ACBrand.error : c.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => onConfirmChange(e.target.value)}
                  placeholder={t('auth.reset.confirmPlaceholder')}
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
                <EyeToggle show={showConfirm} onClick={() => setShowConfirm(v => !v)} color={c.dim} />
              </div>
              <ACLabel
                size={10}
                color={error || mismatch ? ACBrand.error : c.mute}
                style={{ fontFamily: ACFonts.body, letterSpacing: 0.1, marginTop: 8, display: 'block' }}
              >
                {error || (mismatch ? t('auth.reset.passwordsDontMatch') : t('auth.reset.passwordHint'))}
              </ACLabel>
            </div>

            <div style={{ marginTop: 22 }}>
              <ACBtn primary dark={dark} size="lg" pill block type="submit" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? t('auth.reset.updating') : t('auth.reset.submit')}
              </ACBtn>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default function V3ResetPassword() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('auth.reset.passwordMin'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.reset.passwordsDontMatch'));
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      window.setTimeout(() => navigate('/auth/login', { replace: true }), 1500);
    } catch (err) {
      setError(err?.message || t('auth.reset.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <V3StandaloneLayout>
      <ResetPasswordCard
        dark={theme === 'dark'}
        password={password}
        confirm={confirm}
        loading={loading}
        error={error}
        done={done}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
        onSubmit={onSubmit}
        t={t}
      />
    </V3StandaloneLayout>
  );
}
