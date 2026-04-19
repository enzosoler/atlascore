import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACLine, ACChip,
} from '../lib/paper.jsx';

/**
 * S6_Weight_B — weight entry screen with functional numpad.
 *
 * Gallery:    <S6_Weight_B dark />
 * Production: <S6_Weight_B dark unit="lb" previousWeight={182.6} trendData={[...]} onBack={fn} onSave={fn} onViewHistory={fn} />
 *
 * onSave receives: { weight: number, unit: string, when: string (ISO) }
 */
function S6_Weight_B({
  dark = false,
  unit = 'lb',
  previousWeight = null,
  trendData,
  onBack,
  onSave,
  onViewHistory,
}) {
  const c = useACT(dark);
  const [raw, setRaw] = useState('');

  const weightNum = parseFloat(raw) || 0;
  const canSave = raw.length > 0 && weightNum > 0 && weightNum < 1000;

  const delta = useMemo(() => {
    if (!canSave || previousWeight == null) return null;
    return weightNum - previousWeight;
  }, [canSave, weightNum, previousWeight]);

  const _trend = trendData || [183.8, 183.6, 183.2, 183.1, 182.8, 182.6, 182.4].map((v, i) => ({ k: i, v }));

  function handleKey(k) {
    if (k === '⌫') {
      setRaw((prev) => prev.slice(0, -1));
      return;
    }
    if (k === '.') {
      if (raw.includes('.')) return;
      if (raw.length === 0) { setRaw('0.'); return; }
      setRaw((prev) => prev + '.');
      return;
    }
    setRaw((prev) => {
      const next = prev + k;
      // Limit: max 3 digits before decimal, 1 after
      const parts = next.split('.');
      if (parts[0].length > 3) return prev;
      if (parts[1] && parts[1].length > 1) return prev;
      return next;
    });
  }

  // Display formatting: split into integer + decimal
  const displayValue = raw || '—';
  const hasDecimal = raw.includes('.');
  const intPart = hasDecimal ? raw.split('.')[0] : raw;
  const decPart = hasDecimal ? '.' + (raw.split('.')[1] || '') : '';

  // Date label
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${dayNames[now.getDay()]} · ${now.getDate()} ${monthNames[now.getMonth()]} · ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() < 12 ? 'AM' : 'PM'}`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Log weight</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 0' }}>
        <ACLabel size={12} color={c.dim}>{dateLabel}</ACLabel>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            {raw.length === 0 ? (
              <div style={{
                fontFamily: ACFonts.display, fontSize: 120, fontWeight: 700,
                letterSpacing: -5, lineHeight: 0.9, color: c.faint,
                fontVariantNumeric: 'tabular-nums',
              }}>0</div>
            ) : (
              <div style={{
                fontFamily: ACFonts.display, fontSize: 120, fontWeight: 700,
                letterSpacing: -5, lineHeight: 0.9, color: c.fg,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {intPart || '0'}<span style={{ color: c.accent }}>{decPart}</span>
              </div>
            )}
            <ACLabel size={13} color={c.dim} style={{ paddingBottom: 20 }}>{unit}</ACLabel>
          </div>

          {delta != null && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ACChip accent dark={dark}>
                {delta <= 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(1)} vs yesterday
              </ACChip>
              {previousWeight != null && (
                <ACLabel size={11} color={c.dim}>prev {previousWeight.toFixed(1)}</ACLabel>
              )}
            </div>
          )}

          {_trend.length > 0 && (
            <button type="button" onClick={onViewHistory} style={{
              marginTop: 26, padding: 18, borderRadius: ACRadii.card, background: c.card,
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <ACLabel size={12} color={c.dim}>Last 7 days</ACLabel>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>View history</ACLabel>
              </div>
              <ACLine w={270} h={60} dark={dark} data={
                Array.isArray(_trend[0]?.k !== undefined ? _trend : _trend.map((v, i) => ({ k: i, v })))
                  ? _trend
                  : _trend.map((v, i) => ({ k: i, v }))
              }/>
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 14px 24px', background: c.bg }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKey(k)}
              style={{
                borderRadius: 14,
                background: k === '⌫' ? 'transparent' : c.card,
                border: 'none',
                cursor: 'pointer',
                padding: '18px 0',
                textAlign: 'center',
                fontFamily: ACFonts.display,
                fontSize: 26,
                fontWeight: 500,
                color: (k === '⌫' || k === '.') ? c.dim : c.fg,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <ACBtn
            primary
            block
            dark={dark}
            size="lg"
            pill
            onClick={() => {
              if (!canSave) return;
              onSave?.({ weight: weightNum, unit, when: new Date().toISOString() });
            }}
            style={{ opacity: canSave ? 1 : 0.4, pointerEvents: canSave ? 'auto' : 'none' }}
          >
            Save
          </ACBtn>
        </div>
      </div>
    </div>
  );
}

export default S6_Weight_B;
