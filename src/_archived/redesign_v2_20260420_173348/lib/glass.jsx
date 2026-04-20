/**
 * Atlas Core — Liquid Glass primitives (v2)
 *
 * Goal: make the React app feel native-iOS-premium without going Swift.
 * Inspired by Apple's iOS 18/26 "Liquid Glass" design language.
 *
 * Every v2 screen composes from these primitives. Never hardcode colors here —
 * tokens come from theme.css (`--rd-*`).
 *
 * Key properties:
 *  - Translucent surfaces via backdrop-blur + saturate
 *  - Specular edge highlight (inset top), ambient base shadow (inset bottom)
 *  - Spring physics (cubic-bezier(.34,1.56,.64,1)) on interactive bits
 *  - Safe-area-aware by default — never collide with the iOS status bar or home indicator
 *  - Haptic-feel scale-down on active (0.97), springs back out
 *
 * Rendering: we use inline style for the blur stack because Tailwind's
 * backdrop-filter combinations are harder to read than a short style object,
 * and these primitives are the only place we touch those properties.
 */

import React from 'react';

/* ─── Safe-area aware screen shell ──────────────────────────────────────── */

/**
 * SafeScreen — every v2 screen root. Handles:
 *  - iOS notch / Dynamic Island (safe-area-inset-top)
 *  - Home indicator bar (safe-area-inset-bottom)
 *  - Optional bottom-nav offset when the screen lives inside the AppShell
 *  - Optional FAB offset (adds 80px bottom padding so cards never sit under the FAB)
 */
export function SafeScreen({
  children,
  scrollable = true,
  hasBottomNav = false,
  hasFab = false,
  hasTopBar = false,
  paddingX = 16,
  className = '',
  style,
}) {
  const paddingTop = hasTopBar
    // Floating avatar + bell sit ~14px from top and are 36px tall. We need
    // safe-area + ~62px to clear them, plus 12px breathing room.
    ? `calc(env(safe-area-inset-top) + 72px)`
    : `max(${paddingX}px, env(safe-area-inset-top))`;

  const extraBottom = (hasBottomNav ? 64 : 0) + (hasFab ? 80 : 0);
  const paddingBottom = `max(${paddingX + extraBottom}px, calc(env(safe-area-inset-bottom) + ${extraBottom}px))`;

  // IMPORTANT: we do NOT set `min-height: 100vh` or `overflow: auto` here.
  // The browser document scrolls naturally. Nesting an overflow-auto container
  // inside AppShell (which also fills the viewport) breaks mobile scroll on
  // both iOS Safari and Chrome.
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        paddingTop,
        paddingBottom,
        paddingLeft: `max(${paddingX}px, env(safe-area-inset-left))`,
        paddingRight: `max(${paddingX}px, env(safe-area-inset-right))`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Liquid Glass surface ──────────────────────────────────────────────── */

const tintMap = {
  neutral:  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
  accent:   { bg: 'rgba(0,255,255,0.06)',    border: 'rgba(0,255,255,0.18)' },
  ai:       { bg: 'rgba(139,92,246,0.06)',   border: 'rgba(139,92,246,0.22)' },
  premium:  { bg: 'rgba(201,169,106,0.06)',  border: 'rgba(201,169,106,0.22)' },
  success:  { bg: 'rgba(16,185,129,0.06)',   border: 'rgba(16,185,129,0.22)' },
  warning:  { bg: 'rgba(245,158,11,0.06)',   border: 'rgba(245,158,11,0.22)' },
  danger:   { bg: 'rgba(239,68,68,0.06)',    border: 'rgba(239,68,68,0.22)' },
};

const blurMap = {
  none: 'none',
  sm:   'blur(12px) saturate(1.3)',
  md:   'blur(20px) saturate(1.6)',
  lg:   'blur(28px) saturate(1.8)',
  xl:   'blur(40px) saturate(2.0)',
};

const radiusMap = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 9999,
};

/**
 * Glass — translucent surface with specular edge + ambient shadow.
 * Use as the base of cards, sheets, toasts, and nav bars.
 */
export function Glass({
  as: Tag = 'div',
  tint = 'neutral',
  blur = 'md',
  radius = 'lg',
  elevation = 'md',   // 'none' | 'sm' | 'md' | 'lg'
  specular = true,
  children,
  className = '',
  style,
  ...rest
}) {
  const t = tintMap[tint] || tintMap.neutral;
  const shadow = (() => {
    switch (elevation) {
      case 'none': return 'none';
      case 'sm':   return '0 1px 0 rgba(0,0,0,.3), 0 4px 12px -4px rgba(0,0,0,.4)';
      case 'lg':   return '0 1px 0 rgba(0,0,0,.4), 0 20px 40px -8px rgba(0,0,0,.55), 0 4px 12px -4px rgba(0,0,0,.4)';
      case 'xl':   return '0 1px 0 rgba(0,0,0,.4), 0 30px 60px -10px rgba(0,0,0,.65), 0 8px 20px -6px rgba(0,0,0,.45)';
      default:     return '0 1px 0 rgba(0,0,0,.3), 0 8px 20px -6px rgba(0,0,0,.4)';
    }
  })();
  const inset = specular ? 'inset 0 1px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.3)' : '';
  return (
    <Tag
      className={className}
      style={{
        backgroundColor: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: radiusMap[radius] || 16,
        backdropFilter: blurMap[blur],
        WebkitBackdropFilter: blurMap[blur],
        boxShadow: [shadow, inset].filter(Boolean).join(', '),
        color: 'hsl(var(--rd-fg-primary))',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ─── Liquid buttons ─────────────────────────────────────────────────────── */

/**
 * LiquidButton — the canonical interactive. Haptic-feel press (scale 0.97 with spring-back).
 *
 * intent:
 *   primary — cyan glass pill, the one true CTA
 *   neutral — white-tinted glass, secondary
 *   ghost   — transparent, lightest touch
 *   premium — gold-tinted glass
 *   ai      — violet-tinted glass
 *   danger  — red-tinted glass
 *
 * size: sm (36) | md (44 — the iOS min touch target) | lg (52) | xl (60)
 */
export function LiquidButton({
  as: Tag = 'button',
  intent = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  style,
  ...rest
}) {
  const heights = { sm: 36, md: 44, lg: 52, xl: 60 };
  const fontSize = { sm: 13, md: 15, lg: 16, xl: 17 };
  const padX = { sm: 14, md: 20, lg: 24, xl: 28 };

  const visual = (() => {
    switch (intent) {
      case 'primary':
        return {
          // Solid cyan, same treatment as the sign-in button. Previously too
          // translucent (0.28 alpha) which read as dark on the obsidian canvas.
          background:
            'linear-gradient(180deg, rgba(0,255,255,0.98) 0%, rgba(0,210,210,0.92) 100%)',
          border: '1px solid rgba(0,255,255,0.55)',
          color: 'hsl(var(--rd-fg-on-accent))',
          shadow:
            '0 8px 22px -6px rgba(0,210,210,0.40), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.18)',
        };
      case 'neutral':
        return {
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: 'hsl(var(--rd-fg-primary))',
          shadow:
            'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.25)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          border: '1px solid transparent',
          color: 'hsl(var(--rd-fg-primary))',
          shadow: 'none',
        };
      case 'premium':
        return {
          background:
            'linear-gradient(180deg, rgba(201,169,106,0.32) 0%, rgba(201,169,106,0.20) 100%)',
          border: '1px solid rgba(201,169,106,0.5)',
          color: 'hsl(var(--rd-fg-on-premium))',
          shadow:
            '0 6px 20px -4px rgba(201,169,106,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
        };
      case 'ai':
        return {
          background:
            'linear-gradient(180deg, rgba(139,92,246,0.32) 0%, rgba(139,92,246,0.18) 100%)',
          border: '1px solid rgba(139,92,246,0.5)',
          color: '#fff',
          shadow: '0 6px 20px -4px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
        };
      case 'danger':
        return {
          background:
            'linear-gradient(180deg, rgba(239,68,68,0.28) 0%, rgba(239,68,68,0.16) 100%)',
          border: '1px solid rgba(239,68,68,0.5)',
          color: '#fff',
          shadow: '0 6px 20px -4px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
        };
      default:
        return { background: 'transparent', border: 'none', color: 'inherit', shadow: 'none' };
    }
  })();

  return (
    <Tag
      disabled={disabled || loading}
      className={`lg-btn ${className}`}
      style={{
        height: heights[size],
        fontSize: fontSize[size],
        paddingLeft: padX[size],
        paddingRight: padX[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: block ? '100%' : undefined,
        borderRadius: 9999,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition:
          'transform 180ms cubic-bezier(.34,1.56,.64,1), opacity 180ms, box-shadow 180ms',
        background: visual.background,
        border: visual.border,
        color: visual.color,
        boxShadow: visual.shadow,
        backdropFilter: intent === 'ghost' ? 'none' : 'blur(14px) saturate(1.6)',
        WebkitBackdropFilter: intent === 'ghost' ? 'none' : 'blur(14px) saturate(1.6)',
        ...style,
      }}
      {...rest}
    >
      {loading ? <MiniSpinner /> : leftIcon}
      {children ? <span className="truncate">{children}</span> : null}
      {!loading && rightIcon}
      {/* Press-down spring via a <style> tag sibling-less — scoped by className */}
      <style>{`
        .lg-btn:active:not(:disabled) { transform: scale(.97); }
        .lg-btn:focus-visible {
          outline: 2px solid hsl(var(--rd-accent));
          outline-offset: 2px;
        }
      `}</style>
    </Tag>
  );
}

function MiniSpinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" fill="none" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ─── Spring-reveal (staggered list entrance) ───────────────────────────── */

/**
 * SpringReveal — wraps children in a translate-up+fade-in with optional stagger.
 * Respects prefers-reduced-motion.
 */
export function SpringReveal({ children, delay = 0, duration = 520, distance = 12, className = '', style }) {
  return (
    <div
      className={className}
      style={{
        animation: `rd-reveal ${duration}ms ${delay}ms cubic-bezier(.22,1,.36,1) both`,
        ...style,
      }}
    >
      {children}
      <style>{`
        @keyframes rd-reveal {
          from { opacity: 0; transform: translateY(${distance}px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="rd-reveal"], [style*="rd-reveal"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Liquid TopBar + BottomBar (for AppShell) ──────────────────────────── */

/**
 * LiquidTopBar — 56pt tall, fixed, blurred, respects safe-area-inset-top.
 * No collisions with the iOS status bar.
 */
/**
 * LiquidTopBar — fixed, blurred, borderless.
 * The bottom border was a thin "riso" that Enzo didn't like — removed. The
 * blur transition does the separation job on its own.
 *
 * `title` accepts a string OR a React node, so a screen can render a more
 * personalized header (e.g. brand mark + date) instead of a boring word.
 */
export function LiquidTopBar({ left, title, right, className = '', style }) {
  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        // Gradient fade at the bottom edge (masks the blur hairline so content
        // behind feels like it dissolves under the bar, no visible seam).
        backgroundImage:
          'linear-gradient(180deg, rgba(5,7,10,0.86) 0%, rgba(5,7,10,0.72) 70%, rgba(5,7,10,0) 100%)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        ...style,
      }}
    >
      <div
        style={{
          height: 56,
          display: 'grid',
          gridTemplateColumns: 'minmax(44px, auto) 1fr minmax(44px, auto)',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>{left}</div>
        <div
          className="truncate"
          style={{
            textAlign: 'center',
            color: 'hsl(var(--rd-fg-primary))',
          }}
        >
          {typeof title === 'string' ? (
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</span>
          ) : (
            title
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{right}</div>
      </div>
    </div>
  );
}

/* ─── Liquid progress bar (onboarding / splash) ─────────────────────────── */

export function LiquidProgress({ value = 0, max = 1, height = 3, color, className = '', style }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className={className}
      style={{
        height,
        width: '100%',
        borderRadius: height,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct * 100}%`,
          backgroundColor: color || 'hsl(var(--rd-accent))',
          borderRadius: height,
          boxShadow: '0 0 12px -2px hsl(var(--rd-accent) / .45)',
          transition: 'width 420ms cubic-bezier(.22,1,.36,1)',
        }}
      />
    </div>
  );
}

/* ─── Choice pill (onboarding option rows) ──────────────────────────────── */

/**
 * ChoicePill — Cal AI / Noom-style tall option row. Single-select by default.
 *
 * - 52pt tall, huge tap target (exceeds iOS 44pt minimum)
 * - Selected state uses accent tint + inset ring
 * - Subtle scale on press
 */
export function ChoicePill({
  selected = false,
  onClick,
  icon,
  label,
  description,
  rightAdornment,
  multi = false,
  className = '',
  style,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`lg-choice ${className}`}
      aria-pressed={selected}
      style={{
        width: '100%',
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 16,
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        background: selected
          ? 'linear-gradient(180deg, rgba(0,255,255,0.14) 0%, rgba(0,255,255,0.08) 100%)'
          : 'rgba(255,255,255,0.04)',
        border: selected
          ? '1px solid rgba(0,255,255,0.5)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected
          ? '0 6px 18px -4px rgba(0,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.14)'
          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
        transition:
          'transform 180ms cubic-bezier(.34,1.56,.64,1), background 200ms, border-color 200ms, box-shadow 200ms',
        color: 'hsl(var(--rd-fg-primary))',
        ...style,
      }}
    >
      {icon && (
        <span
          className="shrink-0 inline-flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: selected ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.06)',
            color: selected ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))',
            transition: 'color 200ms, background-color 200ms',
          }}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block truncate" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {label}
        </span>
        {description && (
          <span
            className="block truncate"
            style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}
          >
            {description}
          </span>
        )}
      </span>
      {rightAdornment ?? (
        <span
          className="shrink-0"
          aria-hidden
          style={{
            width: 20,
            height: 20,
            borderRadius: multi ? 6 : 9999,
            border: selected ? '1px solid hsl(var(--rd-accent))' : '1px solid rgba(255,255,255,0.24)',
            backgroundColor: selected ? 'hsl(var(--rd-accent))' : 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 180ms, border-color 180ms',
          }}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8.5L6.5 12L13 4.5" stroke="hsl(var(--rd-fg-on-accent))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      <style>{`
        .lg-choice:active { transform: scale(.985); }
        .lg-choice:focus-visible {
          outline: 2px solid hsl(var(--rd-accent));
          outline-offset: 2px;
        }
      `}</style>
    </button>
  );
}

/* ─── Big numeric input (stats onboarding, weight log, etc.) ────────────── */

/**
 * BigNumberInput — huge centered numeric input. Cal AI / Yazio weight-input style.
 */
export function BigNumberInput({ value, onChange, suffix, placeholder = '0', inputMode = 'decimal', autoFocus = true }) {
  return (
    <label
      className="block w-full text-center select-none"
      style={{ color: 'hsl(var(--rd-fg-primary))' }}
    >
      <span className="sr-only">Enter value</span>
      <span className="inline-flex items-baseline justify-center gap-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value.replace(/[^\d.,-]/g, ''))}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="bg-transparent text-center outline-none"
          style={{
            fontSize: 72,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            width: '4.5ch',
            color: 'hsl(var(--rd-fg-primary))',
          }}
        />
        {suffix && (
          <span style={{ fontSize: 24, fontWeight: 600, color: 'hsl(var(--rd-fg-muted))' }}>
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

export default {
  SafeScreen,
  Glass,
  LiquidButton,
  LiquidTopBar,
  LiquidProgress,
  ChoicePill,
  BigNumberInput,
  SpringReveal,
};
