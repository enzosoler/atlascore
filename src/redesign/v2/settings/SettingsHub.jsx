/**
 * SettingsHub — /app/settings.
 * Ref: iOS Settings hub + Linear settings + Notion settings.
 *
 * Flat list of setting categories grouped into sections:
 *  - Account (email, password, delete)
 *  - Preferences (notifications, privacy, appearance, language)
 *  - Data (integrations, export, danger zone)
 *  - About (help, terms, privacy, version)
 */
import React from 'react';
import { SafeScreen, Glass, SpringReveal } from '../lib/glass';

export default function SettingsHub({
  user = null,              // { name, email, tier, avatar }
  appVersion = '2.0.0',
  buildNumber = '128',
  onNavigate,               // (route) => void
  onSignOut,
}) {
  const sections = [
    {
      title: 'Account',
      rows: [
        { icon: <UserIcon />,     label: 'Profile',           route: '/app/profile' },
        { icon: <LockIcon />,     label: 'Account & security', route: '/app/settings/account' },
        { icon: <CreditIcon />,   label: 'Subscription',       route: '/app/billing' },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { icon: <BellIcon />,     label: 'Notifications',      route: '/app/settings/notifications' },
        { icon: <ShieldIcon />,   label: 'Privacy',            route: '/app/settings/privacy' },
        { icon: <MoonIcon />,     label: 'Appearance',         route: '/app/settings/appearance', hint: 'Dark' },
        { icon: <GlobeIcon />,    label: 'Language',           route: '/app/settings/language', hint: 'English' },
      ],
    },
    {
      title: 'Data',
      rows: [
        { icon: <LinkIcon />,     label: 'Integrations',       route: '/app/settings/integrations', hint: 'HealthKit, Whoop…' },
        { icon: <DownloadIcon />, label: 'Export data',        route: '/app/settings/data' },
        { icon: <DangerIcon />,   label: 'Danger zone',        route: '/app/settings/danger', tone: 'danger' },
      ],
    },
    {
      title: 'About',
      rows: [
        { icon: <HelpIcon />,     label: 'Help center',        route: '/help' },
        { icon: <BookIcon />,     label: 'Terms of Service',   route: '/terms' },
        { icon: <ShieldIcon />,   label: 'Privacy Policy',     route: '/privacy' },
      ],
    },
  ];

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        {/* Header */}
        <SpringReveal delay={20}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Settings
          </h1>
        </SpringReveal>

        {/* User strip (compact profile card) */}
        {user && (
          <SpringReveal delay={60}>
            <button
              type="button"
              onClick={() => onNavigate?.('/app/profile')}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 14,
                marginTop: 18,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'hsl(var(--rd-fg-primary))',
                textAlign: 'left',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 52, height: 52, borderRadius: 9999, overflow: 'hidden', flexShrink: 0,
                  background: 'linear-gradient(180deg, rgba(0,255,255,0.28), rgba(0,255,255,0.08))',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: 'hsl(var(--rd-fg-on-accent))',
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials(user.name)
                )}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }} className="truncate">
                  {user.name || 'Set your name'}
                </div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }} className="truncate">
                  {user.email}{user.tier && user.tier !== 'Free' ? ` · ${user.tier}` : ''}
                </div>
              </div>
              <Chevron />
            </button>
          </SpringReveal>
        )}

        {/* Sections */}
        {sections.map((section, sIdx) => (
          <SpringReveal key={section.title} delay={120 + sIdx * 40}>
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
                {section.title}
              </div>
              <Glass radius="xl" style={{ padding: 4, overflow: 'hidden' }}>
                {section.rows.map((row, i) => (
                  <SettingRow
                    key={row.label}
                    {...row}
                    last={i === section.rows.length - 1}
                    onClick={() => onNavigate?.(row.route)}
                  />
                ))}
              </Glass>
            </div>
          </SpringReveal>
        ))}

        {/* Sign out */}
        <SpringReveal delay={320}>
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              onClick={onSignOut}
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FB7185',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Sign out
            </button>
          </div>
        </SpringReveal>

        {/* Version footer */}
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
          atlas.core v{appVersion} · build {buildNumber}
        </div>
      </div>
    </SafeScreen>
  );
}
export { SettingsHub };

function SettingRow({ icon, label, hint, tone, last, onClick }) {
  const danger = tone === 'danger';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 10px',
        background: 'transparent', border: 'none',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
        color: danger ? '#FB7185' : 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: 9,
          background: danger ? 'rgba(239,68,68,0.14)' : 'rgba(0,255,255,0.08)',
          border: danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,255,255,0.18)',
          color: danger ? '#FB7185' : 'hsl(var(--rd-accent))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>{label}</span>
      {hint && (
        <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, flexShrink: 0 }}>
          {hint}
        </span>
      )}
      <Chevron />
    </button>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function initials(name) {
  if (!name) return '·';
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const s = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function UserIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><circle {...s} cx="12" cy="9" r="3.5" /><path {...s} d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" /></svg>; }
function LockIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><rect {...s} x="5" y="11" width="14" height="10" rx="2" /><path {...s} d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>; }
function CreditIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24"><rect {...s} x="3" y="6" width="18" height="13" rx="2" /><path {...s} d="M3 10h18M6 15h4" /></svg>; }
function BellIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 8H4c0-2 2-3 2-8zM10 20a2 2 0 0 0 4 0" /></svg>; }
function ShieldIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /></svg>; }
function MoonIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>; }
function GlobeIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24"><circle {...s} cx="12" cy="12" r="9" /><path {...s} d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>; }
function LinkIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>; }
function DownloadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M12 3v13m0 0l-5-5m5 5l5-5M5 21h14" /></svg>; }
function DangerIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M12 3L2 21h20L12 3zM12 10v5M12 18v.01" /></svg>; }
function HelpIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><circle {...s} cx="12" cy="12" r="9" /><path {...s} d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2.5-2.5 4M12 17v.01" /></svg>; }
function BookIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24"><path {...s} d="M4 4h10a4 4 0 0 1 4 4v12a2 2 0 0 0-2-2H4zM4 4v16" /></svg>; }
