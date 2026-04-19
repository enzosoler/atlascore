import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACLine, ACChip,
} from '../lib/paper.jsx';

const FIELDS = [
  { k: 'chest', l: 'Chest' },
  { k: 'waist', l: 'Waist' },
  { k: 'hips',  l: 'Hips' },
  { k: 'arm',   l: 'Arm' },
  { k: 'thigh', l: 'Thigh' },
  { k: 'neck',  l: 'Neck' },
];

/**
 * S17_Measurements_Entry — body measurements entry with numpad + field tabs.
 *
 * Gallery:    <S17_Measurements_Entry dark />
 * Production: <S17_Measurements_Entry dark unit="in" previous={{ waist: 34.0 }} onClose={fn} onSave={fn} />
 *
 * onSave receives: { chest: 42.0, waist: 33.4, ... } (only fields with values)
 * onClose: dismiss/cancel
 */
function S17_Measurements_Entry({
  dark = false,
  unit = 'in',
  previous,
  trendDataByField,
  onClose,
  onSave,
}) {
  const c = useACT(dark);
  const [active, setActive] = useState('waist');
  const [values, setValues] = useState(() => {
    const init = {};
    FIELDS.forEach((f) => { init[f.k] = ''; });
    return init;
  });

  const currentRaw = values[active] || '';
  const currentNum = parseFloat(currentRaw) || 0;
  const prevValue = previous?.[active] ?? null;
  const delta = currentRaw && currentNum > 0 && prevValue != null
    ? currentNum - prevValue
    : null;

  // Default trend for gallery mode
  const _prev = previous || { chest: 41.8, waist: 34.0, hips: 40.0, arm: 14.7, thigh: 23.3, neck: 15.2 };
  const defaultTrend = { waist: [34.6,34.4,34.2,34.0,33.8,33.4], chest: [41.2,41.4,41.6,41.8,42.0,42.0] };
  const trendForActive = trendDataByField?.[active]
    || (defaultTrend[active] || []).map((v, i) => ({ k: i, v }));

  const hasAnyValue = Object.values(values).some((v) => v.length > 0 && parseFloat(v) > 0);

  function handleKey(k) {
    setValues((prev) => {
      const current = prev[active] || '';
      if (k === '⌫') return { ...prev, [active]: current.slice(0, -1) };
      if (k === '.') {
        if (current.includes('.')) return prev;
        return { ...prev, [active]: current.length === 0 ? '0.' : current + '.' };
      }
      const next = current + k;
      const parts = next.split('.');
      if (parts[0].length > 3) return prev;
      if (parts[1] && parts[1].length > 1) return prev;
      return { ...prev, [active]: next };
    });
  }

  function handleSave() {
    const payload = {};
    FIELDS.forEach((f) => {
      const v = parseFloat(values[f.k]);
      if (v > 0) payload[f.k] = v;
    });
    onSave?.(payload);
  }

  // Display parts
  const hasDecimal = currentRaw.includes('.');
  const intPart = hasDecimal ? currentRaw.split('.')[0] : currentRaw;
  const decPart = hasDecimal ? '.' + (currentRaw.split('.')[1] || '') : '';

  // Date label
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${dayNames[now.getDay()]} · ${now.getDate()} ${monthNames[now.getMonth()]}`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Measurements</ACLabel>
        <button
          type="button"
          onClick={handleSave}
          style={{ border: 'none', background: 'transparent', cursor: hasAnyValue ? 'pointer' : 'default', padding: 0, opacity: hasAnyValue ? 1 : 0.4 }}
        >
          <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>Save</ACLabel>
        </button>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <ACLabel size={12} color={c.dim}>{dateLabel}</ACLabel>

        {/* Field tabs */}
        <div style={{
          marginTop: 14, display: 'flex', gap: 6, overflow: 'auto',
          paddingBottom: 2,
        }}>
          {FIELDS.map(f => {
            const on = f.k === active;
            const hasValue = values[f.k]?.length > 0;
            return (
              <button key={f.k} type="button" onClick={() => setActive(f.k)} style={{
                padding: '8px 14px', borderRadius: 999,
                background: on ? c.fg : c.card,
                color: on ? c.bg : c.fg,
                fontSize: 12, fontWeight: 600,
                flexShrink: 0, cursor: 'pointer', border: 'none',
                position: 'relative',
              }}>
                {f.l}
                {hasValue && !on && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 6, height: 6, borderRadius: 999,
                    background: c.accent,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '22px 28px 0', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          {currentRaw.length === 0 ? (
            <div style={{
              fontFamily: ACFonts.display, fontSize: 110, fontWeight: 700,
              letterSpacing: -4.5, lineHeight: 0.9, color: c.faint,
              fontVariantNumeric: 'tabular-nums',
            }}>0</div>
          ) : (
            <div style={{
              fontFamily: ACFonts.display, fontSize: 110, fontWeight: 700,
              letterSpacing: -4.5, lineHeight: 0.9, color: c.fg,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {intPart || '0'}<span style={{ color: c.accent }}>{decPart}</span>
            </div>
          )}
          <ACLabel size={13} color={c.dim} style={{ paddingBottom: 16 }}>{unit}</ACLabel>
        </div>

        {delta != null && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ACChip accent dark={dark}>
              {delta <= 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(1)} vs last
            </ACChip>
            <ACLabel size={11} color={c.dim}>Previous {prevValue?.toFixed(1)} · {_prev[active] ? '' : 'no prior'}</ACLabel>
          </div>
        )}

        {/* Mini trend */}
        {trendForActive.length > 0 && (
          <div style={{ marginTop: 18, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <ACLabel size={11} color={c.dim}>{FIELDS.find(f => f.k === active)?.l} · 6 months</ACLabel>
              {delta != null && (
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>
                  {delta <= 0 ? '' : '+'}{delta.toFixed(1)} {unit}
                </ACLabel>
              )}
            </div>
            <ACLine w={272} h={46} dark={dark} data={
              Array.isArray(trendForActive) && trendForActive[0]?.k !== undefined
                ? trendForActive
                : trendForActive.map((v, i) => ({ k: i, v }))
            }/>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 14px 18px', background: c.bg }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKey(k)}
              style={{
                padding: '16px 0',
                textAlign: 'center',
                fontFamily: ACFonts.display,
                fontSize: 24,
                fontWeight: 500,
                color: (k === '⌫' || k === '.') ? c.dim : c.fg,
                background: c.card,
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default S17_Measurements_Entry;
