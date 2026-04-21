import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ACFonts, ACBrand, ACRadii } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { WEBAPP_BILLING, WEBAPP_EXPORT, WEBAPP_HOME, WEBAPP_SETTINGS } from '@/lib/platformRoutes';

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: ACBrand.ink,
        textDecoration: 'none',
        fontFamily: ACFonts.mono,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}

export function WebAccountScaffold({ eyebrow, title, description, children, backTo = WEBAPP_HOME, backLabel }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const t = useT();

  return (
    <div style={{ minHeight: '100vh', background: ACBrand.paper, color: ACBrand.ink, fontFamily: ACFonts.body }}>
      <style>{`
        @keyframes webAccountFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 680px) {
          .wa-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .wa-nav { display: none !important; }
          .wa-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="wa-pad"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          padding: '22px 56px',
          borderBottom: MC.border,
          flexWrap: 'wrap',
        }}
      >
        <Link to={WEBAPP_HOME} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div className="wa-nav" style={{ display: 'flex', gap: 24 }}>
          <NavLink to={WEBAPP_HOME}>{t('webNav.account')}</NavLink>
          <NavLink to={WEBAPP_SETTINGS}>{t('webNav.settings')}</NavLink>
          <NavLink to={WEBAPP_BILLING}>{t('webNav.billing')}</NavLink>
          <NavLink to={WEBAPP_EXPORT}>{t('webNav.export')}</NavLink>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <NavLink to="/download-app">{t('webNav.getApp')}</NavLink>
          <button
            type="button"
            onClick={async () => {
              try {
                await logout?.();
              } catch {}
              navigate('/auth/login', { replace: true });
            }}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: ACFonts.mono,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              fontWeight: 700,
              color: MC.dim,
              cursor: 'pointer',
            }}
          >
            {t('webNav.signOut')}
          </button>
        </div>
      </div>

      <div
        className="wa-pad"
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '64px 56px 96px',
          animation: 'webAccountFadeIn 0.4s ease-out',
        }}
      >
        <Link
          to={backTo}
          style={{
            display: 'inline-block',
            color: MC.dim,
            textDecoration: 'none',
            fontFamily: ACFonts.body,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {backLabel || t('webapp.backToAccount')}
        </Link>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: MC.dim }}>
            {eyebrow}
          </div>
          <h1
            style={{
              margin: '12px 0 0',
              fontFamily: ACFonts.brand,
              fontSize: 'clamp(36px, 6vw, 56px)',
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              textTransform: 'lowercase',
            }}
          >
            {title}
          </h1>
          {description ? (
            <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.55, color: MC.body, maxWidth: 680 }}>
              {description}
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: 32 }}>{children}</div>
      </div>

      <div
        className="wa-pad"
        style={{
          padding: '32px 56px 48px',
          borderTop: MC.border,
          textAlign: 'center',
          fontFamily: ACFonts.mono,
          fontSize: 11,
          letterSpacing: 0.4,
          color: MC.dim,
          lineHeight: 1.6,
        }}
      >
        {t('webapp.footer')}
      </div>
    </div>
  );
}

export function WebAccountSection({ title, children }) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: MC.dim, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ border: MC.border, borderRadius: ACRadii.card, overflow: 'hidden', background: 'rgba(255,255,255,0.6)' }}>
        {children}
      </div>
    </section>
  );
}

export function WebAccountRow({ title, description, actionLabel, onAction, danger = false, muted = false, trailing }) {
  return (
    <div
      className="wa-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 16,
        alignItems: 'center',
        padding: '18px 20px',
        borderTop: '1px solid rgba(10,10,10,0.08)',
        opacity: muted ? 0.6 : 1,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: danger ? '#c65b4b' : ACBrand.ink }}>{title}</div>
        {description ? (
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, color: MC.body }}>{description}</div>
        ) : null}
      </div>
      {trailing || (
        actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            disabled={muted}
            style={{
              border: danger ? '1px solid #c65b4b' : 'none',
              borderRadius: 999,
              padding: '10px 16px',
              background: danger ? 'transparent' : ACBrand.ink,
              color: danger ? '#c65b4b' : ACBrand.paper,
              fontFamily: ACFonts.body,
              fontSize: 14,
              fontWeight: 600,
              cursor: muted ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {actionLabel}
          </button>
        ) : null
      )}
    </div>
  );
}
