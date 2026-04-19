import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACBtn,
} from '../lib/paper.jsx';

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

const DAYS = ['M','T','W','T','F','S','S'];
const CADENCE_MODES = ['Daily', 'Days', 'Cycle'];
const UNITS = ['mg', 'µg', 'IU', 'g', 'ml'];

/**
 * S46_Protocol_Form — new/edit protocol form.
 *
 * Gallery:    <S46_Protocol_Form dark />
 * Production: <S46_Protocol_Form dark onCancel={fn} onSave={fn} onOpenPicker={fn} />
 *
 * onSave receives: { substance, dose, doseUnit, cadenceMode, selectedDays, time, cycleEnabled, notes }
 * onOpenPicker: () => Promise<{name, meta}|null> — opens substance picker
 */
function S46_Protocol_Form({
  dark = false,
  initialSubstance,
  conflictWarning,
  onCancel,
  onSave,
  onOpenPicker,
}) {
  const c = useACT(dark);

  const [substance, setSubstance] = useState(initialSubstance || { name: 'Testosterone cypionate', meta: 'HORMONE · IM · CYP' });
  const [doseRaw, setDoseRaw] = useState('100');
  const [doseUnit, setDoseUnit] = useState('mg');
  const [cadenceMode, setCadenceMode] = useState(1); // 0=Daily, 1=Days, 2=Cycle
  const [selectedDays, setSelectedDays] = useState(new Set([0, 3])); // Mon + Thu
  const [time, setTime] = useState('18:00');
  const [cycleEnabled, setCycleEnabled] = useState(false);
  const [notes, setNotes] = useState('');

  const doseNum = parseFloat(doseRaw) || 0;
  const daysPerWeek = selectedDays.size;
  const dosesPerYear = cadenceMode === 0 ? 365 : daysPerWeek * 52;
  const canSave = substance.name && doseNum > 0;

  const _conflict = conflictWarning ?? {
    text: 'Overlaps with Enclomiphene (HPTA) running through 28 Apr. Coach recommends pausing that first.',
  };

  function toggleDay(i) {
    setSelectedDays(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleSave() {
    if (!canSave) return;
    onSave?.({
      substance: substance.name,
      dose: doseNum,
      doseUnit,
      cadenceMode: CADENCE_MODES[cadenceMode],
      selectedDays: Array.from(selectedDays),
      time,
      cycleEnabled,
      notes,
    });
  }

  async function handleOpenPicker() {
    if (!onOpenPicker) return;
    const picked = await onOpenPicker();
    if (picked) setSubstance(picked);
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Nav */}
      <div style={{ padding: '14px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ACMono size={11} color={c.dim}>CANCEL</ACMono>
        </button>
        <ACMono size={11} color={c.fg} style={{ fontWeight: 600 }}>NEW PROTOCOL</ACMono>
        <button
          type="button"
          onClick={handleSave}
          style={{ background: 'none', border: 'none', cursor: canSave ? 'pointer' : 'default', padding: 0, opacity: canSave ? 1 : 0.4 }}
        >
          <ACMono size={11} color={c.accent} style={{ fontWeight: 700 }}>SAVE</ACMono>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 20px 20px' }}>
        {/* Substance */}
        <FormField label="SUBSTANCE" dark={dark}>
          <button type="button" onClick={handleOpenPicker} style={{
            display: 'flex', width: '100%', padding: '14px 16px', background: c.card,
            borderRadius: ACRadii.input, justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', border: 'none', textAlign: 'left',
          }}>
            <div>
              <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: c.fg }}>
                {substance.name}
              </div>
              <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>
                {substance.meta}
              </ACMono>
            </div>
            <ACMono size={12} color={c.dim}>{'\u203a'}</ACMono>
          </button>
        </FormField>

        {/* Dose — editable number + unit picker */}
        <FormField label="DOSE" dark={dark}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 2, padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'baseline', gap: 6,
            }}>
              <input
                type="text"
                inputMode="decimal"
                value={doseRaw}
                onChange={(e) => setDoseRaw(e.target.value.replace(/[^\d.]/g, ''))}
                style={{
                  fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, color: c.fg,
                  letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums',
                  background: 'transparent', border: 'none', outline: 'none',
                  width: 80, padding: 0,
                }}
              />
              <ACMono size={11} color={c.dim}>{doseUnit.toUpperCase()}</ACMono>
            </div>
            <div style={{
              flex: 1, padding: '14px 12px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
            }}>
              {UNITS.map(u => (
                <button key={u} type="button" onClick={() => setDoseUnit(u)} style={{
                  padding: '2px 6px', fontSize: 11, fontWeight: u === doseUnit ? 700 : 500,
                  color: u === doseUnit ? c.accent : c.dim,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: ACFonts.body,
                }}>{u}</button>
              ))}
            </div>
          </div>
        </FormField>

        {/* Cadence */}
        <FormField label="CADENCE" dark={dark}>
          <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input }}>
            <div style={{ display: 'flex', gap: 1, background: c.hair, padding: 2, marginBottom: 14 }}>
              {CADENCE_MODES.map((l, i) => (
                <button key={i} type="button" onClick={() => setCadenceMode(i)} style={{
                  flex: 1, padding: '7px 0', textAlign: 'center',
                  background: i === cadenceMode ? c.fg : 'transparent',
                  color: i === cadenceMode ? c.bg : c.dim,
                  fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600,
                  letterSpacing: 0.5, textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                }}>{l}</button>
              ))}
            </div>

            {cadenceMode === 1 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {DAYS.map((d, i) => {
                  const on = selectedDays.has(i);
                  return (
                    <button key={i} type="button" onClick={() => toggleDay(i)} style={{
                      flex: 1, aspectRatio: '1', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: on ? c.accent : 'transparent',
                      border: on ? 'none' : `1px solid ${c.faint}`,
                      color: on ? c.ink : c.fg,
                      fontFamily: ACFonts.display, fontSize: 13, fontWeight: 700,
                      cursor: 'pointer',
                    }}>{d}</button>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <ACMono size={10} color={c.dim}>
                {cadenceMode === 0 ? 'DAILY' : `${daysPerWeek} \u00d7 PER WEEK`} {'\u00b7'} ~ {dosesPerYear} DOSES / YR
              </ACMono>
              <ACMono size={10} color={c.accent}>{time} {'\u25be'}</ACMono>
            </div>
          </div>
        </FormField>

        {/* Cycle toggle */}
        <FormField label="CYCLE" dark={dark} optional>
          <div style={{
            padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <ACLabel size={13} color={c.fg}>{cycleEnabled ? 'On / off weeks' : 'Continuous'}</ACLabel>
              <ACMono size={10} color={c.dim} style={{ display: 'block', marginTop: 2 }}>
                {cycleEnabled ? 'Set on/off durations' : 'No on/off weeks'}
              </ACMono>
            </div>
            <button type="button" onClick={() => setCycleEnabled(!cycleEnabled)} style={{
              width: 44, height: 26, background: cycleEnabled ? c.accent : c.faint,
              borderRadius: 999, position: 'relative', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: cycleEnabled ? 21 : 3,
                width: 20, height: 20, background: cycleEnabled ? c.ink : c.bg, borderRadius: 999,
              }} />
            </button>
          </div>
        </FormField>

        {/* Conflict warning (shown when relevant) */}
        {_conflict && (
          <div style={{
            padding: 14, marginBottom: 14,
            background: dark ? 'rgba(232,181,0,0.12)' : 'rgba(232,181,0,0.18)',
            borderLeft: `3px solid ${c.accent}`,
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: 16, height: 16, background: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
              }}>
                <span style={{ color: c.ink, fontFamily: ACFonts.display, fontSize: 12, fontWeight: 800 }}>!</span>
              </div>
              <div style={{ flex: 1 }}>
                <ACMono size={9} color={c.accent} track={2}>CYCLE CONFLICT</ACMono>
                <div style={{ fontFamily: ACFonts.body, fontSize: 12, color: c.fg, marginTop: 4, lineHeight: 1.45 }}>
                  {_conflict.text}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes — editable */}
        <FormField label="NOTES" dark={dark} optional>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Rotate injection sites. Draw with 18g, inject with 25g. Keep vial refrigerated."
            style={{
              width: '100%', padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
              minHeight: 64, fontFamily: ACFonts.body, fontSize: 13, color: c.fg, lineHeight: 1.5,
              border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box',
            }}
          />
        </FormField>

        {/* Save CTA */}
        <div style={{ marginTop: 12 }}>
          <ACBtn
            primary dark={dark} block size="lg"
            onClick={handleSave}
            style={{ opacity: canSave ? 1 : 0.4, pointerEvents: canSave ? 'auto' : 'none' }}
          >
            Save protocol
          </ACBtn>
        </div>
      </div>
    </div>
  );
}

export default S46_Protocol_Form;
