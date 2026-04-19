/**
 * Shared primitives used by every v2 auth screen (Login, Signup, Forgot,
 * Reset, MagicLinkSent). Keeping them here avoids visual drift between
 * screens — same input, same OAuth button, same title treatment.
 */
import React from 'react';

/** Clean auth input with floating label + icon slot. */
export function AuthInput({
  label, type = 'text', value, onChange, placeholder,
  autoComplete, autoFocus, icon, hint, error, rightSlot,
}) {
  return (
    <label style={{ display: 'block' }}>
      {/* Kill Safari/Chrome autofill blue + add focus ring in dark theme. */}
      <style>{`
        .ac-auth-input:-webkit-autofill,
        .ac-auth-input:-webkit-autofill:hover,
        .ac-auth-input:-webkit-autofill:focus,
        .ac-auth-input:-webkit-autofill:active {
          -webkit-text-fill-color: hsl(var(--rd-fg-primary)) !important;
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
          caret-color: hsl(var(--rd-fg-primary)) !important;
        }
        .ac-auth-input-wrap:focus-within {
          border-color: rgba(255,255,255,0.22) !important;
          background: rgba(255,255,255,0.06) !important;
        }
      `}</style>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      <div
        className="ac-auth-input-wrap"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: 52,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)'}`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'background-color 160ms ease, border-color 160ms ease',
        }}
      >
        {icon && (
          <span aria-hidden style={{ paddingLeft: 14, color: 'hsl(var(--rd-fg-muted))', display: 'inline-flex' }}>
            {icon}
          </span>
        )}
        <input
          className="ac-auth-input"
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'hsl(var(--rd-fg-primary))',
            padding: icon ? '0 14px 0 10px' : '0 14px',
            fontSize: 15, fontWeight: 500,
            fontFamily: 'inherit',
          }}
        />
        {rightSlot}
      </div>
      {hint && !error && (
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 6 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: '#FB7185', marginTop: 6 }}>{error}</div>
      )}
    </label>
  );
}

/** Cyan liquid glass CTA — consistent with Sign in button Enzo approved. */
export function AuthPrimary({ children, disabled, loading, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="v2-auth-primary"
    >
      {loading ? (
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" fill="none" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      ) : null}
      <span>{children}</span>
      <style>{`
        .v2-auth-primary {
          width: 100%;
          height: 52px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          color: hsl(var(--rd-fg-on-accent));
          background: linear-gradient(180deg, rgba(0,255,255,0.98) 0%, rgba(0,210,210,0.92) 100%);
          border: 1px solid rgba(0,255,255,0.55);
          box-shadow: 0 8px 22px -6px rgba(0,210,210,0.4), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.18);
          transition: transform 180ms cubic-bezier(.34,1.56,.64,1), opacity 180ms;
        }
        .v2-auth-primary:active:not(:disabled) { transform: scale(.985); }
        .v2-auth-primary:disabled { opacity: .55; cursor: not-allowed; }
        .v2-auth-primary:focus-visible { outline: 2px solid hsl(var(--rd-accent)); outline-offset: 3px; }
      `}</style>
    </button>
  );
}

/** OAuth button (Google, Apple). */
export function OAuthButton({ provider, onClick, disabled }) {
  const label = provider === 'google' ? 'Continue with Google' : 'Continue with Apple';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="v2-auth-oauth"
      aria-label={label}
    >
      {provider === 'google' ? <GoogleG /> : <AppleLogo />}
      <span>{label}</span>
      <style>{`
        .v2-auth-oauth {
          width: 100%;
          height: 48px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.005em;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          color: hsl(var(--rd-fg-primary));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          transition: transform 180ms cubic-bezier(.34,1.56,.64,1), background 180ms, border-color 180ms, opacity 180ms;
        }
        .v2-auth-oauth:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.16); }
        .v2-auth-oauth:active { transform: scale(.985); }
        .v2-auth-oauth:disabled { opacity: .5; cursor: not-allowed; }
        .v2-auth-oauth:focus-visible { outline: 2px solid hsl(var(--rd-accent)); outline-offset: 2px; }
      `}</style>
    </button>
  );
}

export function AuthTitle({ eyebrow, title, subtitle }) {
  return (
    <>
      {eyebrow && (
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.45 }}>
          {subtitle}
        </p>
      )}
    </>
  );
}

export function BrandMark({ size = 'lg' }) {
  const dims = size === 'xl' ? { h: 48 } : size === 'lg' ? { h: 36 } : { h: 28 };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={dims.h * 2.2} height={dims.h} viewBox="0 0 200 100" fill="none" aria-hidden>
        <path d="M20 50H50L57 62L68 24L80 62L88 50H104L140 32" stroke="hsl(var(--rd-fg-primary))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M133 32H140V40" stroke="hsl(var(--rd-accent))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: dims.h * 0.55, fontWeight: 700, letterSpacing: '-0.02em' }}>
        atlas<span style={{ color: 'hsl(var(--rd-accent))' }}>.</span>core
      </span>
    </div>
  );
}

export function Divider({ label = 'or' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
    </div>
  );
}

export function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        paddingTop: 'calc(env(safe-area-inset-top) + 40px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)',
        paddingLeft: 'max(20px, env(safe-area-inset-left))',
        paddingRight: 'max(20px, env(safe-area-inset-right))',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(60% 40% at 50% 20%, rgba(0,255,255,0.06) 0%, transparent 55%), radial-gradient(50% 40% at 50% 100%, rgba(139,92,246,0.04) 0%, transparent 55%)',
        }}
      />
      <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(239,68,68,0.10)',
        border: '1px solid rgba(239,68,68,0.38)',
        color: '#FB7185',
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  );
}

export function FormSuccess({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(16,185,129,0.10)',
        border: '1px solid rgba(16,185,129,0.38)',
        color: '#34D399',
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  );
}

/* ─── Inline icons (email envelope, lock, etc.) ─────────────────────────── */
const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
export const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect {...stroke} x="3" y="5" width="18" height="14" rx="2" /><path {...stroke} d="M3 7l9 7 9-7" />
  </svg>
);
export const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect {...stroke} x="5" y="11" width="14" height="10" rx="2" /><path {...stroke} d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
export const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <circle {...stroke} cx="12" cy="9" r="3.5" /><path {...stroke} d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
  </svg>
);

export function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
export function AppleLogo() {
  return (
    <svg width="16" height="18" viewBox="0 0 384 512" aria-hidden fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM260.6 110c29.5-35 26.8-66.9 25.9-78.3-26 1.5-56.1 17.7-73.2 37.7-18.8 21.4-29.9 47.9-27.5 77.7 28.1 2.2 53.7-12.2 74.8-37.1z"/>
    </svg>
  );
}
