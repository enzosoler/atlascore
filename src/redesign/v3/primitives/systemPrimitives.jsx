import React from 'react';
import { ACFonts, ACRadii, ACBtn } from '../lib/paper.jsx';

export const systemTokens = {
  bgPrimary: '#000000',
  bgSecondary: '#0E0E0E',
  bgTertiary: '#141414',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  accentPrimary: '#F5C518',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(245,197,24,0.32)',
  spacing: { 8: 8, 12: 12, 16: 16, 24: 24, 32: 32, 48: 48 },
  radius: { md: 16, lg: 20 },
  maxWidth: 420,
  navHeight: 92,
};

const shellGutter = systemTokens.spacing[24];

function baseCardStyle(accent = false) {
  return {
    background: systemTokens.bgSecondary,
    border: `1px solid ${accent ? systemTokens.borderStrong : systemTokens.border}`,
    borderRadius: systemTokens.radius.lg,
  };
}

export function ScreenShell({ children, style }) {
  return (
    <div
      style={{
        minHeight: '100%',
        background: systemTokens.bgPrimary,
        color: systemTokens.textPrimary,
        padding: '20px 20px 112px',
        maxWidth: systemTokens.maxWidth,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: shellGutter,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TopBar({ leading, title, subtitle, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 0, flex: 1 }}>
        {leading ? <div style={{ flexShrink: 0 }}>{leading}</div> : null}
        <div style={{ minWidth: 0 }}>
          {title ? (
            <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: -0.9 }}>
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: systemTokens.textSecondary }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      {trailing ? <div style={{ flexShrink: 0 }}>{trailing}</div> : null}
    </div>
  );
}

export function HeroBlock({ eyebrow, title, body, visual, footer, accentValue }) {
  return (
    <div
      style={{
        ...baseCardStyle(),
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {eyebrow ? (
            <div style={{ fontFamily: ACFonts.body, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: systemTokens.textMuted }}>
              {eyebrow}
            </div>
          ) : null}
          <div style={{ marginTop: eyebrow ? 12 : 0, fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700, lineHeight: 0.96, letterSpacing: -1.2 }}>
            {accentValue ? <span style={{ color: systemTokens.accentPrimary }}>{accentValue} </span> : null}
            {title}
          </div>
          {body ? (
            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.55, color: systemTokens.textSecondary }}>
              {body}
            </div>
          ) : null}
        </div>
        {visual ? <div style={{ flexShrink: 0 }}>{visual}</div> : null}
      </div>
      {footer ? <div style={{ paddingTop: 16, borderTop: `1px solid ${systemTokens.border}` }}>{footer}</div> : null}
    </div>
  );
}

export function MetricCard({ label, value, hint, accent = false, suffix, style }) {
  return (
    <div style={{ ...baseCardStyle(accent), padding: 16, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: systemTokens.textMuted }}>
        {label}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -0.9, color: accent ? systemTokens.accentPrimary : systemTokens.textPrimary }}>
          {value}
        </div>
        {suffix ? <div style={{ fontSize: 12, color: systemTokens.textSecondary }}>{suffix}</div> : null}
      </div>
      {hint ? <div style={{ marginTop: 8, fontSize: 12, color: systemTokens.textSecondary, lineHeight: 1.45 }}>{hint}</div> : null}
    </div>
  );
}

export function InsightCard({ tone = 'info', label, title, body, action, onAction }) {
  const toneColor = tone === 'warning'
    ? '#F59E0B'
    : tone === 'positive'
      ? systemTokens.accentPrimary
      : systemTokens.textSecondary;

  return (
    <div style={{ ...baseCardStyle(), padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: toneColor }}>
            {label || tone}
          </div>
          <div style={{ marginTop: 10, fontSize: 16, fontWeight: 650, letterSpacing: -0.2 }}>
            {title}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: systemTokens.textSecondary }}>
            {body}
          </div>
        </div>
      </div>
      {action ? (
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={onAction}
            style={{
              border: 'none',
              background: 'transparent',
              color: systemTokens.accentPrimary,
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {action}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ActionCard({ title, body, cta, onClick, secondary = false, meta }) {
  return (
    <div style={{ ...baseCardStyle(), padding: 16 }}>
      {meta ? (
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: systemTokens.textMuted }}>
          {meta}
        </div>
      ) : null}
      <div style={{ marginTop: meta ? 10 : 0, fontSize: 16, fontWeight: 650, letterSpacing: -0.2 }}>
        {title}
      </div>
      {body ? (
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: systemTokens.textSecondary }}>
          {body}
        </div>
      ) : null}
      {cta ? (
        <div style={{ marginTop: 16 }}>
          <ACBtn
            primary={!secondary}
            dark
            size="md"
            pill
            onClick={onClick}
            style={secondary ? { border: `1px solid ${systemTokens.border}`, background: systemTokens.bgTertiary, color: systemTokens.textPrimary } : { background: systemTokens.accentPrimary, color: '#000000' }}
          >
            {cta}
          </ACBtn>
        </div>
      ) : null}
    </div>
  );
}

export function SectionBlock({ title, action, onAction, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 650, letterSpacing: -0.3 }}>{title}</div>
        {action ? (
          <button
            type="button"
            onClick={onAction}
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 13, fontWeight: 700, color: systemTokens.textSecondary, cursor: 'pointer' }}
          >
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ListRow({ title, subtitle, value, status, onClick, chevron = false, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 0',
        border: 'none',
        borderBottom: `1px solid ${systemTokens.border}`,
        background: 'transparent',
        color: systemTokens.textPrimary,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 4, fontSize: 13, color: systemTokens.textSecondary, lineHeight: 1.45 }}>{subtitle}</div> : null}
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right', fontSize: 13, color: status ? systemTokens.accentPrimary : systemTokens.textSecondary }}>
        {value || status}
        {chevron ? <div style={{ marginTop: 4, color: systemTokens.textMuted }}>›</div> : null}
      </div>
    </button>
  );
}

export function BottomNav({ items = [], activeKey, onChange }) {
  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        marginTop: 'auto',
        paddingTop: 12,
      }}
    >
      <div
        style={{
          ...baseCardStyle(),
          background: 'rgba(14,14,14,0.94)',
          backdropFilter: 'blur(12px)',
          padding: '10px 8px',
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, 1fr)`,
          gap: 4,
        }}
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange?.(item.key)}
              style={{
                border: 'none',
                background: 'transparent',
                color: active ? systemTokens.accentPrimary : systemTokens.textMuted,
                padding: '10px 8px',
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {item.icon ? <span>{item.icon}</span> : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
