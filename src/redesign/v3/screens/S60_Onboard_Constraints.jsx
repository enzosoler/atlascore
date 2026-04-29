/**
 * S60_Onboard_Constraints — Step 8 of 10.
 *
 * OPTIONAL health-constraints screen. Two multi-select chip groups (injuries +
 * medical), a free-text notes field, and a privacy callout. All fields are
 * optional so onContinue is always enabled. A dedicated Skip button lives in
 * the footer alongside the Continue CTA.
 *
 * Props
 * -----
 * @param {boolean}  dark           - light / dark variant
 * @param {number}   [step=8]       - current onboarding step
 * @param {number}   [total=10]     - total onboarding steps
 * @param {object}   [value]        - { injuries:[], medical:[], notes:'' }
 * @param {function} [onChange]     - ({ injuries, medical, notes }) => void
 * @param {function} [onBack]       - back handler
 * @param {function} [onContinue]   - continue handler
 * @param {function} [onSkip]       - skip handler (optional step)
 *
 * DEMO fallbacks: renders sensibly when no props are provided.
 */
import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

/* ── progress header (matches S7–S11 exactly) ──────────────── */
function OBHeader({ step, total, dark, onBack = true, onExit }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      {onBack ? (
        <button type="button" onClick={typeof onBack === 'function' ? onBack : undefined} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 10px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{step}/{total}</ACLabel>
      {onExit && (
        <button type="button" onClick={onExit} aria-label="Exit" style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
      )}
    </div>
  );
}

/* ── chip lists ─────────────────────────────────────────────── */
const INJURIES = ['Knee', 'Lower back', 'Shoulder', 'Wrist', 'Hip', 'Ankle', 'Neck'];
const MEDICAL  = ['Hypertension', 'Diabetes', 'Heart condition', 'Asthma', 'Thyroid', 'Pregnancy'];

/* tint-aware backgrounds — amber for injuries, rose for medical */
const TINTS = {
  amber: {
    bg:     'rgba(232,181,0,0.16)',
    border: 'rgba(232,181,0,0.50)',
    fg:     '#e8b500',
  },
  rose: {
    bg:     'rgba(198,91,75,0.16)',
    border: 'rgba(198,91,75,0.50)',
    fg:     '#c65b4b',
  },
};

function ChipGroup({ items, selected, onToggle, tint, dark }) {
  const c = useACT(dark);
  const t = TINTS[tint] || TINTS.amber;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map(item => {
        const on = selected.has(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            style={{
              height: 34,
              paddingInline: 14,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: ACFonts.body,
              letterSpacing: -0.1,
              background: on ? t.bg : c.card,
              border: on ? `1px solid ${t.border}` : `1px solid ${c.hair}`,
              color: on ? t.fg : c.fg,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

/* ── main screen ────────────────────────────────────────────── */
function S60_Onboard_Constraints({
  dark = false,
  step = 8,
  total = 10,
  value,
  onChange,
  onBack,
  onExit,
  onContinue,
  onSkip,
}) {
  const c = useACT(dark);

  const [injuries, setInjuries] = React.useState(
    new Set(value?.injuries || []),
  );
  const [medical, setMedical] = React.useState(
    new Set(value?.medical || []),
  );
  const [notes, setNotes] = React.useState(value?.notes || '');

  function emit(patch) {
    onChange?.({
      injuries: Array.from(injuries),
      medical: Array.from(medical),
      notes,
      ...patch,
    });
  }

  function toggleInjury(item) {
    const next = new Set(injuries);
    next.has(item) ? next.delete(item) : next.add(item);
    setInjuries(next);
    emit({ injuries: Array.from(next) });
  }

  function toggleMedical(item) {
    const next = new Set(medical);
    next.has(item) ? next.delete(item) : next.add(item);
    setMedical(next);
    emit({ medical: Array.from(next) });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg, minHeight: 0 }}>
      <OBHeader step={step} total={total} dark={dark} onBack={onBack} onExit={onExit} />

      {/* scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 28px 16px', display: 'flex', flexDirection: 'column' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Constraints</ACLabel>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Anything to flag?
        </div>
        <ACLabel size={12} color={c.dim} style={{ marginTop: 6, display: 'block' }}>Everything optional — private, used only to filter unsafe prescriptions.</ACLabel>

        {/* injuries */}
        <div style={{ marginTop: 20 }}>
          <ACLabel size={12} color={c.dim}>Injuries</ACLabel>
          <div style={{ marginTop: 10 }}>
            <ChipGroup items={INJURIES} selected={injuries} onToggle={toggleInjury} tint="amber" dark={dark} />
          </div>
        </div>

        {/* medical */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Medical</ACLabel>
          <div style={{ marginTop: 10 }}>
            <ChipGroup items={MEDICAL} selected={medical} onToggle={toggleMedical} tint="rose" dark={dark} />
          </div>
        </div>

        {/* free-text notes */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim}>Additional notes</ACLabel>
          <div style={{
            marginTop: 10, padding: 4, background: c.card,
            borderRadius: ACRadii.input,
          }}>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); emit({ notes: e.target.value }); }}
              placeholder="Medications, recent surgery, dietary needs..."
              rows={2}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: c.fg,
                padding: 14,
                resize: 'none',
                fontSize: 15,
                lineHeight: 1.4,
                fontFamily: ACFonts.body,
              }}
            />
          </div>
        </div>
      </div>

      {/* bottom actions */}
      <div style={{ padding: '14px 28px 26px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={() => onContinue?.()}>Continue →</ACBtn>
        <div style={{ textAlign: 'center', padding: 4 }}>
          <button type="button" onClick={() => onSkip?.()} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
            <ACLabel size={12} color={c.dim}>Skip for now</ACLabel>
          </button>
        </div>
      </div>
    </div>
  );
}

export default S60_Onboard_Constraints;
