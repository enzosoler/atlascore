import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACBtn,
} from '../lib/paper.jsx';

/** Labeled form section with optional OPTIONAL badge. */
function FormField({ label, children, dark, optional }) {
  const c = useACT(dark);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <ACMono size={9} color={c.dim} track={2}>{label}</ACMono>
        {optional && <ACMono size={9} color={c.faint} track={2}>OPTIONAL</ACMono>}
      </div>
      {children}
    </div>
  );
}

export default function S48_Log_Dose({
  dark = false,
  substance,
  scheduledDose,
  scheduledTime,
  isOffline = true,
  onClose,
  onSubmit,
}) {
  const c = useACT(dark);
  const [mode, setMode] = useState('taken');
  const [selectedSite, setSelectedSite] = useState(1);
  const [selectedReason, setSelectedReason] = useState(2);
  const [notes, setNotes] = useState('');
  const [adjustedDose, setAdjustedDose] = useState('80');
  const [adjustReason, setAdjustReason] = useState('');

  const resolvedSubstance = substance || 'Testosterone cypionate';
  const resolvedDose = scheduledDose || '100 MG';
  const resolvedTime = scheduledTime || 'FRI 18:00';

  const sites = [
    'Left quad', 'Right quad', 'Left glute', 'Right glute', 'Left delt', 'Right delt',
  ];

  const skipReasons = [
    ['Forgot',        'Move to tomorrow'],
    ['Out of supply', "I'll reorder"],
    ['Side effects',  'Flag for coach'],
    ['Illness',       "I'm not myself"],
    ['Other',         '\u2014'],
  ];

  const modes = [
    ['taken', 'Taken'],
    ['skipped', 'Skipped'],
    ['adjust', 'Adjust'],
  ];

  const ctaLabel =
    mode === 'taken'   ? 'Log dose' :
    mode === 'skipped' ? 'Confirm skip' :
                         'Save adjusted dose';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      overflow: 'hidden', position: 'relative', background: c.bg,
    }}>
      {/* Faux dimmed background simulating Today screen */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.28,
        pointerEvents: 'none', paddingTop: 18,
      }}>
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between' }}>
          <ACMono size={9} color={c.dim}>{resolvedTime}</ACMono>
        </div>
        <div style={{ padding: '14px 20px' }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, color: c.fg,
          }}>
            Today.
          </div>
        </div>
        <div style={{ padding: '0 20px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              background: c.card, height: 60, marginBottom: 10,
              borderRadius: ACRadii.card,
            }} />
          ))}
        </div>
      </div>

      {/* Dim overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 110,
        background: c.bg,
        borderRadius: `${ACRadii.sheet}px ${ACRadii.sheet}px 0 0`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.35)',
      }}>
        {/* Handle bar */}
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 36, height: 4, background: c.faint, borderRadius: 2,
          }} />
        </div>

        {/* Header row with offline indicator */}
        <div style={{
          padding: '6px 20px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <ACMono size={9} color={c.dim} track={2}>LOG DOSE</ACMono>
          {isOffline && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, background: c.accent }} />
              <ACMono size={9} color={c.accent} track={1.5}>OFFLINE {'\u00B7'} WILL SYNC</ACMono>
            </div>
          )}
        </div>

        {/* Substance header */}
        <div style={{ padding: '8px 20px 14px' }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
            letterSpacing: -0.6, lineHeight: 1.1, color: c.fg,
          }}>
            {resolvedSubstance}
          </div>
          <div style={{ marginTop: 4 }}>
            <ACMono size={10} color={c.dim}>
              {resolvedDose} {'\u00B7'} SCHEDULED {resolvedTime}
            </ACMono>
          </div>
        </div>

        {/* Mode switcher (segmented control) */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', gap: 1, background: c.hair, padding: 2 }}>
            {modes.map(([k, label]) => (
              <button
                type="button"
                key={k}
                onClick={() => setMode(k)}
                style={{
                  flex: 1, padding: '9px 0', textAlign: 'center', cursor: 'pointer',
                  background: mode === k ? c.fg : 'transparent',
                  color: mode === k ? c.bg : c.dim,
                  fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                  border: 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific content */}
        <div style={{
          flex: 1, padding: '0 20px', overflow: 'hidden auto',
          minHeight: 0, WebkitOverflowScrolling: 'touch',
        }}>
          {/* -- TAKEN mode -- */}
          {mode === 'taken' && (
            <>
              <FormField label="TIME" dark={dark}>
                <div style={{
                  padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <ACLabel size={15} color={c.fg}>Fri 19 Apr {'\u00B7'} 18:04</ACLabel>
                  <ACMono size={10} color={c.accent}>NOW</ACMono>
                </div>
              </FormField>

              <FormField label="SITE" dark={dark}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sites.map((s, i) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedSite(i)}
                      style={{
                        padding: '8px 12px', cursor: 'pointer',
                        background: i === selectedSite ? c.fg : 'transparent',
                        color: i === selectedSite ? c.bg : c.fg,
                        border: i === selectedSite ? 'none' : `1px solid ${c.faint}`,
                        fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="NOTES" dark={dark} optional>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clean pull, no backflow."
                  style={{
                    width: '100%', padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                    fontFamily: ACFonts.body, fontSize: 13, color: c.fg, minHeight: 50,
                    border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box',
                  }}
                />
              </FormField>
            </>
          )}

          {/* -- SKIPPED mode -- */}
          {mode === 'skipped' && (
            <FormField label="REASON" dark={dark}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {skipReasons.map(([r, sub], i) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setSelectedReason(i)}
                    style={{
                      padding: '12px 14px',
                      background: i === selectedReason ? c.fg : c.card,
                      color: i === selectedReason ? c.bg : c.fg,
                      borderRadius: ACRadii.input,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <ACLabel size={14} style={{ fontWeight: 500 }}>{r}</ACLabel>
                    <ACMono size={10} color={i === selectedReason ? c.accent : c.dim}>
                      {sub}
                    </ACMono>
                  </button>
                ))}
              </div>
            </FormField>
          )}

          {/* -- ADJUST mode -- */}
          {mode === 'adjust' && (
            <>
              <FormField label="NEW DOSE" dark={dark}>
                <div style={{
                  padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                  display: 'flex', alignItems: 'baseline', gap: 8,
                }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={adjustedDose}
                    onChange={(e) => setAdjustedDose(e.target.value.replace(/[^\d.]/g, ''))}
                    style={{
                      fontFamily: ACFonts.display, fontSize: 32, fontWeight: 800,
                      color: c.fg, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums',
                      background: 'transparent', border: 'none', outline: 'none',
                      width: 80, padding: 0,
                    }}
                  />
                  <ACMono size={12} color={c.dim}>MG</ACMono>
                  <div style={{ flex: 1 }} />
                  {adjustedDose && (
                    <ACMono size={10} color={c.accent}>
                      {parseFloat(adjustedDose) < 100 ? '\u2212' : '+'}{Math.abs(parseFloat(adjustedDose || 0) - 100)} FROM SCHEDULED
                    </ACMono>
                  )}
                </div>
              </FormField>

              <FormField label="REASON" dark={dark}>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Coach recommended half-dose while labs pending."
                  style={{
                    width: '100%', padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                    fontFamily: ACFonts.body, fontSize: 13, color: c.fg,
                    border: 'none', outline: 'none', resize: 'none', minHeight: 50,
                    boxSizing: 'border-box',
                  }}
                />
              </FormField>
            </>
          )}
        </div>

        {/* Primary CTA */}
        <div style={{ padding: '10px 20px 22px', borderTop: `1px solid ${c.hair}` }}>
          <ACBtn
            primary
            dark={dark}
            block
            size="lg"
            onClick={onSubmit ? () => {
              const base = { mode, substance: resolvedSubstance, scheduledDose: resolvedDose, when: new Date().toISOString() };
              if (mode === 'taken') {
                onSubmit({ ...base, site: sites[selectedSite], notes });
              } else if (mode === 'skipped') {
                onSubmit({ ...base, reason: skipReasons[selectedReason]?.[0] });
              } else {
                onSubmit({ ...base, adjustedDose: parseFloat(adjustedDose) || 0, reason: adjustReason });
              }
            } : undefined}
          >
            {ctaLabel}
          </ACBtn>
        </div>
      </div>
    </div>
  );
}
