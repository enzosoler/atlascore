/**
 * AppDiagnostics — hidden support/debug screen at /app/settings/diagnostics.
 *
 * Support channel: "go to Settings → Diagnostics and paste what you see."
 * Not linked from SettingsHub on purpose — only reachable by typing the URL.
 *
 * Every value is REAL. TRUST RULE applies — if a value is unknown, we show
 * "Unknown" rather than a fabricated placeholder.
 *
 * Sources of truth:
 *  - App version — Vite exposes package.json via `import.meta.env.VITE_APP_VERSION`
 *    (set in vite.config; falls back to "unknown").
 *  - Platform — `Capacitor.getPlatform()` if loaded, else "web".
 *  - User agent — `navigator.userAgent`.
 *  - Online / offline — `navigator.onLine` + live window events.
 *  - Supabase connection — a lightweight `auth.getSession()` probe.
 *  - Supabase user id — last 8 chars only, for privacy.
 *  - Build commit — `import.meta.env.VITE_BUILD_COMMIT` if set by the CI build.
 *  - Last error timestamps — best-effort, read from sessionStorage key
 *    `atlas_error_log` (array of ISO strings pushed by our ErrorBoundary).
 *
 * Rules applied:
 *  - ZERO emojis. All glyphs inline SVG.
 *  - safe-area-inset via SafeScreen on all four sides.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { SafeScreen, SpringReveal, LiquidButton, Glass } from '../lib/glass';
import { supabase } from '@/lib/supabaseClient';

/* ─── Helpers ───────────────────────────────────────────────────────────── */

/**
 * Read build-time environment. Vite replaces these at build time.
 * We use `import.meta.env.VITE_APP_VERSION` and `VITE_BUILD_COMMIT` if the
 * build pipeline set them; otherwise we fall back to "unknown".
 */
function readBuildInfo() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return {
    appVersion:  env.VITE_APP_VERSION  || env.PACKAGE_VERSION || 'unknown',
    buildCommit: env.VITE_BUILD_COMMIT || env.VITE_COMMIT_SHA || null,
    mode:        env.MODE              || 'unknown',
  };
}

function readPlatform() {
  try {
    const p = Capacitor?.getPlatform?.();
    if (p) return p;
  } catch { /* ignore */ }
  return 'web';
}

function readUserAgent() {
  return (typeof navigator !== 'undefined' && navigator.userAgent) || 'unknown';
}

/** Last-8 tail of a UUID (privacy-preserving). Returns null if missing. */
function tailId(id) {
  if (!id || typeof id !== 'string') return null;
  return id.length > 8 ? id.slice(-8) : id;
}

/**
 * Read error timestamps logged by the ErrorBoundary (if any).
 * Sessions store a list of ISO strings under `atlas_error_log`.
 * Never throws — returns [] on any parse failure.
 */
function readErrorLog() {
  try {
    if (typeof sessionStorage === 'undefined') return [];
    const raw = sessionStorage.getItem('atlas_error_log');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 5) : [];
  } catch {
    return [];
  }
}

/* ─── Row primitive ─────────────────────────────────────────────────────── */

function Row({ label, value, mono = false }) {
  const displayed =
    value == null || value === ''
      ? <span style={{ color: 'hsl(var(--rd-fg-muted))', fontStyle: 'italic' }}>Unknown</span>
      : value;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, 38%) 1fr',
        alignItems: 'baseline',
        gap: 12,
        paddingBlock: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          fontSize: 11, letterSpacing: '0.12em',
          textTransform: 'uppercase', fontWeight: 700,
          color: 'hsl(var(--rd-fg-muted))',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13, lineHeight: 1.45,
          color: 'hsl(var(--rd-fg-primary))',
          fontFamily: mono
            ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
            : 'inherit',
          wordBreak: 'break-word',
        }}
      >
        {displayed}
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function AppDiagnostics({ onBack }) {
  const build = useMemo(readBuildInfo, []);
  const platform = useMemo(readPlatform, []);
  const userAgent = useMemo(readUserAgent, []);

  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? !!navigator.onLine : true,
  );
  const [userId, setUserId] = useState(null);
  const [supaStatus, setSupaStatus] = useState('checking'); // 'checking' | 'connected' | 'error' | 'unknown'
  const [errorLog] = useState(() => readErrorLog());

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Probe Supabase and read the current user id (last 8 chars shown).
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          setSupaStatus('error');
          return;
        }
        const uid = data?.session?.user?.id || null;
        setUserId(uid);
        setSupaStatus('connected');
      } catch {
        if (!mounted) return;
        setSupaStatus('error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const rows = useMemo(() => ([
    { label: 'App version',     value: build.appVersion, mono: true },
    { label: 'Build commit',    value: build.buildCommit, mono: true },
    { label: 'Build mode',      value: build.mode, mono: true },
    { label: 'Platform',        value: platform, mono: true },
    { label: 'Native',          value: (() => {
      try { return Capacitor?.isNativePlatform?.() ? 'yes' : 'no'; } catch { return 'no'; }
    })(), mono: true },
    { label: 'Connection',      value: online ? 'online' : 'offline', mono: true },
    { label: 'Supabase',        value:
      supaStatus === 'checking'  ? 'Checking…' :
      supaStatus === 'connected' ? 'Connected' :
      supaStatus === 'error'     ? 'Error' : 'Unknown', mono: true },
    { label: 'User id (tail)',  value: tailId(userId), mono: true },
    { label: 'User agent',      value: userAgent, mono: true },
    { label: 'Screen',          value:
      typeof window !== 'undefined'
        ? `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x`
        : null,
      mono: true,
    },
    { label: 'Language',        value: typeof navigator !== 'undefined' ? navigator.language : null, mono: true },
    { label: 'Timezone',        value: (() => {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; }
    })(), mono: true },
    { label: 'Timestamp',       value: new Date().toISOString(), mono: true },
  ]), [build, platform, userAgent, online, supaStatus, userId]);

  const diagnosticsText = useMemo(() => {
    const lines = [
      '# atlas.core diagnostics',
      ...rows.map((r) => `${r.label}: ${r.value ?? 'unknown'}`),
    ];
    if (errorLog.length > 0) {
      lines.push('', '# Recent errors');
      errorLog.forEach((t) => lines.push(`- ${t}`));
    }
    return lines.join('\n');
  }, [rows, errorLog]);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(diagnosticsText);
        toast.success('Diagnostics copied to clipboard.');
        return;
      }
      // Fallback: textarea + execCommand.
      const ta = document.createElement('textarea');
      ta.value = diagnosticsText;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('Diagnostics copied to clipboard.');
    } catch {
      toast.error('Could not copy — select the text manually.');
    }
  };

  return (
    <SafeScreen paddingX={16} hasBottomNav>
      <SpringReveal delay={20}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11, letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontWeight: 700,
                  color: 'hsl(var(--rd-fg-muted))',
                }}
              >
                Support tools
              </div>
              <h1
                style={{
                  margin: '4px 0 0', fontSize: 26, lineHeight: 1.2,
                  fontWeight: 700, letterSpacing: '-0.02em',
                  color: 'hsl(var(--rd-fg-primary))',
                }}
              >
                Diagnostics
              </h1>
            </div>
            {onBack && (
              <LiquidButton intent="ghost" size="sm" onClick={onBack}>
                Back
              </LiquidButton>
            )}
          </div>
        </div>
      </SpringReveal>

      <SpringReveal delay={80}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 14, lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
            }}
          >
            If our support team asked for this, tap{' '}
            <span style={{ color: 'hsl(var(--rd-fg-primary))', fontWeight: 600 }}>
              Copy diagnostics
            </span>{' '}
            and paste the result into your reply.
          </p>
        </div>
      </SpringReveal>

      <SpringReveal delay={140}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Glass tint="neutral" radius="lg" style={{ padding: '4px 16px 12px' }}>
            {rows.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} mono={r.mono} />
            ))}
          </Glass>
        </div>
      </SpringReveal>

      {errorLog.length > 0 && (
        <SpringReveal delay={200}>
          <div style={{ maxWidth: 640, margin: '16px auto 0' }}>
            <Glass tint="neutral" radius="lg" style={{ padding: 16 }}>
              <div
                style={{
                  fontSize: 11, letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontWeight: 700,
                  color: 'hsl(var(--rd-fg-muted))',
                  marginBottom: 10,
                }}
              >
                Recent errors
              </div>
              <ul
                style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                {errorLog.map((t, i) => (
                  <li
                    key={`${t}-${i}`}
                    style={{
                      fontSize: 12,
                      color: 'hsl(var(--rd-fg-primary))',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Glass>
          </div>
        </SpringReveal>
      )}

      <SpringReveal delay={260}>
        <div
          style={{
            maxWidth: 640, margin: '20px auto 0',
            display: 'flex', gap: 10, flexWrap: 'wrap',
          }}
        >
          <LiquidButton intent="primary" size="lg" onClick={handleCopy}>
            Copy diagnostics
          </LiquidButton>
        </div>
      </SpringReveal>
    </SafeScreen>
  );
}

export { AppDiagnostics };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function AppDiagnosticsRoute() {
  const navigate = useNavigate();
  return <AppDiagnostics onBack={() => navigate('/app/settings')} />;
}
