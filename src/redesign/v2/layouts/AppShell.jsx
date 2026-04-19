/**
 * AppShell — single shell for every authed v2 route.
 *
 * Reads the REAL user from AuthContext. Never renders mock data.
 * Zero "Alex Johnson" anywhere. If the user is loading, shows an empty avatar
 * dot, not a fake name.
 *
 * Fixed chrome:
 *  - Top bar (56pt, blurred, safe-area-inset-top)
 *  - Bottom nav (64pt, 5 tabs, safe-area-inset-bottom)
 *  - FAB over bottom nav (80x80 gap reserved via SafeScreen `hasFab`)
 */
import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * Bottom nav layout:
 *   Today | Train | [AI Coach — elevated hero button] | Body | Settings
 *
 * The middle slot is intentionally OUT of the grid pattern — it pops above
 * the bar as a circular AI-violet button, signaling Coach is the signature
 * feature of Atlas (not just another tab).
 */
const TABS_LEFT = [
  { to: '/app/today',     label: 'Today',    icon: IconHome },
  { to: '/app/workouts',  label: 'Train',    icon: IconDumbbell },
];
const TABS_RIGHT = [
  { to: '/app/body',      label: 'Body',     icon: IconPulse },
  { to: '/app/settings',  label: 'Settings', icon: IconSettings },
];

export default function AppShell({ fabAction, fabLabel = 'Add', children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const name =
    (user?.full_name || '').trim() ||
    (user?.email ? user.email.split('@')[0] : '') ||
    '';
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        position: 'relative',
      }}
    >
      {/* Floating avatar (top-left) — no topbar chrome */}
      <button
        onClick={() => navigate('/app/profile')}
        aria-label="Profile"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 14px)',
          left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 45,
          width: 36,
          height: 36,
          borderRadius: 9999,
          overflow: 'hidden',
          background: 'rgba(10,14,20,0.55)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials(name) || (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )
        )}
      </button>

      {/* Floating notifications (top-right) */}
      <button
        onClick={() => navigate('/app/notifications')}
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 14px)',
          right: 'max(16px, env(safe-area-inset-right))',
          zIndex: 45,
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: 'rgba(10,14,20,0.55)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 8H4c0-2 2-3 2-8zM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Main content — every v2 screen uses SafeScreen internally. */}
      <main>
        {children ?? <Outlet />}
      </main>

      {/* Floating action button */}
      {fabAction && (
        <button
          type="button"
          onClick={fabAction}
          aria-label={fabLabel}
          style={{
            position: 'fixed',
            right: 'max(16px, env(safe-area-inset-right))',
            bottom: `calc(env(safe-area-inset-bottom) + 80px)`,
            width: 56,
            height: 56,
            borderRadius: 9999,
            zIndex: 55,
            background: 'linear-gradient(180deg, rgba(0,255,255,0.95), rgba(0,200,200,0.9))',
            border: '1px solid rgba(0,255,255,0.55)',
            color: 'hsl(var(--rd-fg-on-accent))',
            boxShadow: '0 14px 32px -8px rgba(0,200,200,0.5), inset 0 1px 0 rgba(255,255,255,0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1)',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(.95)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Bottom tab bar — 2 tabs + elevated Coach FAB + 2 tabs */}
      <nav
        aria-label="Primary"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: 'rgba(5,7,10,0.80)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            paddingInline: 'max(4px, env(safe-area-inset-left))',
            position: 'relative',
          }}
        >
          {TABS_LEFT.map((t) => <TabLink key={t.to} {...t} />)}

          {/* Elevated AI Coach hero button — pops above the bar */}
          <CoachHeroTab
            active={location.pathname.startsWith('/app/coach')}
            onClick={() => navigate('/app/coach')}
          />

          {TABS_RIGHT.map((t) => <TabLink key={t.to} {...t} />)}
        </div>
      </nav>
    </div>
  );
}
export { AppShell };

/**
 * CoachHeroTab — center nav slot for the AI Coach.
 *
 * v2 redesign: NOT elevated anymore (was sticking out above the bar and the
 * label drifted off the other labels' baseline). Now it lives IN the bar,
 * icon + label on the SAME line as Today/Train/Body/Settings.
 *
 * Visual signal that it's special = violet pill behind the icon, violet
 * coloring, subtle pulsing violet dot above the icon when inactive. No
 * elevation trick — just a confident color story.
 */
function CoachHeroTab({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="AI Coach"
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: '100%',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        color: active ? '#A78BFA' : '#C4B5FD',
        padding: 0,
      }}
    >
      {/* Notification dot (breathing) — only when idle */}
      {!active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 4,
            right: 'calc(50% - 14px)',
            width: 5, height: 5, borderRadius: 99,
            background: '#A78BFA',
            boxShadow: '0 0 6px #A78BFA',
            animation: 'rd-coach-dot 2200ms ease-in-out infinite',
          }}
        />
      )}

      {/* Icon wrapped in a violet pill for prominence */}
      <span
        aria-hidden
        style={{
          width: 36, height: 22, borderRadius: 9999,
          background: active
            ? 'linear-gradient(180deg, rgba(139,92,246,0.95), rgba(124,58,237,0.88))'
            : 'linear-gradient(180deg, rgba(139,92,246,0.22), rgba(124,58,237,0.14))',
          border: active ? '1px solid rgba(167,139,250,0.7)' : '1px solid rgba(139,92,246,0.38)',
          color: active ? '#fff' : '#A78BFA',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 200ms, border-color 200ms, color 200ms',
          boxShadow: active ? '0 4px 10px -4px rgba(139,92,246,0.45)' : 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      </span>

      {/* Label aligned with other tab labels */}
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.02em',
          fontWeight: 600,
        }}
      >
        Coach
      </span>

      {/* Active indicator bar (same pattern as TabLink) */}
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            width: 24, height: 2,
            borderRadius: 2,
            backgroundColor: '#A78BFA',
            boxShadow: '0 0 6px rgba(167,139,250,.6)',
          }}
        />
      )}

      <style>{`
        @keyframes rd-coach-dot {
          0%, 100% { opacity: .35; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="rd-coach-dot"] { animation: none !important; }
        }
      `}</style>
    </button>
  );
}

function TabLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: '100%',
        color: isActive ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))',
        fontSize: 10,
        letterSpacing: '0.02em',
        fontWeight: 600,
        textDecoration: 'none',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        transition: 'color 200ms',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} />
          <span>{label}</span>
          {isActive && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 6,
                width: 24,
                height: 2,
                borderRadius: 2,
                backgroundColor: 'hsl(var(--rd-accent))',
                boxShadow: '0 0 6px hsl(var(--rd-accent) / .6)',
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function titleFor(path) {
  if (path.startsWith('/app/today'))     return 'Today';
  if (path.startsWith('/app/workouts'))  return 'Training';
  if (path.startsWith('/app/nutrition')) return 'Nutrition';
  if (path.startsWith('/app/body'))      return 'Body';
  if (path.startsWith('/app/coach'))     return 'Coach';
  if (path.startsWith('/app/labs'))      return 'Labs';
  if (path.startsWith('/app/profile'))   return 'Profile';
  if (path.startsWith('/app/settings'))  return 'Settings';
  if (path.startsWith('/app/billing'))   return 'Billing';
  if (path.startsWith('/app/social'))    return 'Community';
  return '';
}

function initials(name) {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/**
 * Small heartbeat→arrow mark used in the topbar. Matches the brand SVG in
 * /public/branding/dark/logo.svg but inlined so it renders instantly and can
 * be tinted via currentColor.
 */
function HeartbeatMark() {
  return (
    <svg width="22" height="12" viewBox="0 0 200 100" fill="none" aria-hidden>
      <path
        d="M20 50H50L57 62L68 24L80 62L88 50H104L140 32"
        stroke="hsl(var(--rd-fg-primary))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M133 32H140V40"
        stroke="hsl(var(--rd-accent))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Tab icons ─────────────────────────────────────────────────────────── */
function baseStroke(active) {
  return {
    stroke: 'currentColor',
    strokeWidth: active ? 2 : 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
}
function IconHome({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path {...baseStroke(active)} d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}
function IconDumbbell({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path {...baseStroke(active)} d="M6 9v6M4 10.5v3M10 6v12M18 9v6M20 10.5v3M14 6v12M10 12h4" />
    </svg>
  );
}
function IconFork({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path {...baseStroke(active)} d="M8 3v7a2 2 0 0 0 2 2v9M6 3v5a2 2 0 0 0 2 2M10 3v5a2 2 0 0 1-2 2M16 3c0 4 3 6 3 11v7" />
    </svg>
  );
}
function IconPulse({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path {...baseStroke(active)} d="M3 12h4l2 6 4-12 2 6h6" />
    </svg>
  );
}
function IconUser({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle {...baseStroke(active)} cx="12" cy="9" r="3.5" />
      <path {...baseStroke(active)} d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}
function IconSettings({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle {...baseStroke(active)} cx="12" cy="12" r="3" />
      <path {...baseStroke(active)} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
