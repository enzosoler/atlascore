import React from 'react';
import { ACFonts, useACT, ACLabel, ACBtn } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { useT } from '@/lib/i18nContext';

export default function S36_Auth({
  dark = false,
  email = '',
  password = '',
  mode = 'magic',
  headline,
  description,
  submitLabel,
  showModeSwitch = true,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onApple,
  onGoogle,
  onClose,
  onSwitchMode,
  loading = false,
  loadingLabel,
  error = '',
  hint,
  submitDisabled = false,
}) {
  const c = useACT(dark);
  const t = useT();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ email, password, mode });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <style>{`.v3-auth-input:focus-visible,.v3-auth-input:focus{outline:none!important;box-shadow:none!important}`}</style>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: c.card,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: onClose ? 'pointer' : 'default',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 0' }}
      >
        <div style={{ marginTop: 14 }}>
          <HeartMark size={40} color={c.fg} accent={c.accent} />
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: ACFonts.brand,
            fontSize: 44,
            letterSpacing: -2,
            lineHeight: 0.9,
            color: c.fg,
            textTransform: 'lowercase',
          }}
        >
          {headline || (
            <>
              {t('auth.form.defaultHeadlineLine1')}
              <br />
              {t('auth.form.defaultHeadlineLine2Prefix')} <span style={{ color: c.accent }}>{t('auth.form.defaultHeadlineAccent')}</span>
            </>
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: c.dim,
            lineHeight: 1.55,
            maxWidth: 300,
          }}
        >
          {description || (
            mode === 'magic'
              ? t('auth.form.defaultMagicDescription')
              : t('auth.form.defaultPasswordDescription')
          )}
        </div>

        {showModeSwitch ? (
          <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
            {[
              { key: 'magic', label: t('auth.form.magicMode') },
              { key: 'password', label: t('auth.form.passwordMode') },
            ].map((option) => {
              const active = option.key === mode;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onSwitchMode?.(option.key)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: active ? 'none' : `1px solid ${c.hair}`,
                    background: active ? c.fg : 'transparent',
                    color: active ? c.bg : c.dim,
                    fontFamily: ACFonts.body,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.1,
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div style={{ marginTop: 34 }}>
          <ACLabel
            size={10}
            color={c.dim}
            style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}
          >
            {t('auth.form.emailLabel')}
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
              className="v3-auth-input"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => onEmailChange?.(e.target.value)}
              placeholder={t('auth.form.emailPlaceholder')}
              style={{
                flex: 1,
                height: 48,
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
                color: c.fg,
                fontSize: 16,
                letterSpacing: -0.2,
                fontWeight: 500,
                fontFamily: ACFonts.body,
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>
          <ACLabel
            size={10}
            color={error ? '#c65b4b' : c.mute}
            style={{ fontFamily: ACFonts.body, letterSpacing: 0.1, marginTop: 8, display: 'block' }}
          >
            {error || hint || t('auth.form.defaultHint')}
          </ACLabel>
        </div>

        {mode === 'password' ? (
          <div style={{ marginTop: 20 }}>
            <ACLabel
              size={10}
              color={c.dim}
              style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}
            >
              {t('auth.form.passwordLabel')}
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
                className="v3-auth-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange?.(e.target.value)}
                placeholder={t('auth.form.passwordPlaceholder')}
                style={{
                  flex: 1,
                  height: 48,
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  background: 'transparent',
                  color: c.fg,
                  fontSize: 16,
                  letterSpacing: -0.2,
                  fontWeight: 500,
                  fontFamily: ACFonts.body,
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 22 }}>
          <ACBtn
            primary
            dark={dark}
            size="lg"
            pill
            block
            type="submit"
            disabled={submitDisabled}
            style={{ opacity: submitDisabled ? 0.6 : 1 }}
          >
            {loading ? (loadingLabel || t('auth.form.working')) : submitLabel || (mode === 'magic' ? t('auth.form.sendMagic') : t('auth.form.signIn'))}
          </ACBtn>
        </div>

        <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: c.hair }} />
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            {t('auth.form.orUse')}
          </ACLabel>
          <div style={{ flex: 1, height: 1, background: c.hair }} />
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'apple', label: t('auth.form.continueApple'), action: onApple },
            { key: 'google', label: t('auth.form.continueGoogle'), action: onGoogle },
          ].map((provider) => (
            <button
              key={provider.key}
              type="button"
              onClick={provider.action}
              style={{
                padding: '14px 18px',
                border: `1px solid ${c.hair}`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: c.bg,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {provider.key === 'apple' ? (
                  <svg width="18" height="20" viewBox="0 0 18 20" fill={c.fg}>
                    <path d="M14.2 10.3c0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.6.9-.7 0-1.9-.8-3.2-.8-1.6 0-3.1 1-4 2.4C.2 10.4 1.4 14.4 3.2 16.6c.9 1.1 1.9 2.3 3.3 2.2 1.3-.1 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.8 1.4 0 2.3-1.1 3.2-2.2.7-.8 1.2-1.7 1.7-2.7-.1 0-3.2-1.2-3.2-3.6M11.5 2.8c.7-.9 1.2-2.1 1.1-3.3-1 0-2.2.7-3 1.6-.6.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3-1.5" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.6 9.2c0-.6 0-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5" />
                    <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.5 18 9 18" />
                    <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V4.9H.9C.3 6.2 0 7.6 0 9s.3 2.8.9 4.1l3-2.4" />
                    <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.4.9 11.4 0 9 0 5.5 0 2.4 2.1.9 4.9l3 2.3C4.6 5.1 6.6 3.6 9 3.6" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2, textAlign: 'left' }}>
                {provider.label}
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 30,
            paddingBottom: 20,
            fontFamily: ACFonts.body,
            fontSize: 10,
            color: c.mute,
            letterSpacing: 0.1,
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          {t('auth.form.legal')}
        </div>
      </form>
    </div>
  );
}
