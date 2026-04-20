import React, { useState, useEffect } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn,
} from '../lib/paper.jsx';

/**
 * S82_Meal_Detail -- single logged meal detail screen (v3 paper aesthetic).
 *
 * Gallery:    <S82_Meal_Detail dark />
 * Production: <S82_Meal_Detail dark entry={...} mealSlot="lunch"
 *               onEditPortion={fn} onDuplicate={fn} onDelete={fn} onBack={fn} />
 *
 * @param {object}   props
 * @param {boolean}  props.dark           - light/dark variant
 * @param {object}   props.entry          - {name, portion, kcal, protein, carbs, fat, micros, loggedAt}
 * @param {string}   props.mealSlot       - 'breakfast' | 'lunch' | 'dinner' | 'snacks'
 * @param {Function} props.onEditPortion  - (portion: string) => void
 * @param {Function} props.onDuplicate    - () => void
 * @param {Function} props.onDelete       - () => void
 * @param {Function} props.onBack         - () => void
 */

const DEMO_ENTRY = {
  name: 'Grilled chicken bowl',
  portion: '350 g',
  kcal: 540,
  protein: 48,
  carbs: 52,
  fat: 14,
  micros: null,
  loggedAt: new Date().toISOString(),
};

function slotLabel(slot) {
  switch (slot) {
    case 'breakfast': return 'Breakfast';
    case 'lunch':     return 'Lunch';
    case 'dinner':    return 'Dinner';
    case 'snacks':    return 'Snacks';
    default:          return 'Meal';
  }
}

function formatTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return null;
  }
}

function S82_Meal_Detail({
  dark = false,
  entry,
  mealSlot = 'lunch',
  onEditPortion,
  onDuplicate,
  onDelete,
  onBack,
}) {
  const c = useACT(dark);
  const _entry = entry || DEMO_ENTRY;

  const kcal = Math.round(_entry.kcal || 0);
  const protein = Number(_entry.protein || 0);
  const carbs = Number(_entry.carbs || 0);
  const fat = Number(_entry.fat || 0);
  const pKcal = Math.round(protein * 4);
  const cKcal = Math.round(carbs * 4);
  const fKcal = Math.round(fat * 9);

  const hasMicros = Boolean(_entry.micros && typeof _entry.micros === 'object' && Object.keys(_entry.micros).length > 0);
  const time = formatTime(_entry.loggedAt);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(_entry.portion || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(_entry.portion || '');
  }, [_entry.portion]);

  const handleBack = () => {
    if (typeof onBack === 'function') onBack();
  };
  const handleSavePortion = () => {
    if (!draft.trim()) return;
    if (typeof onEditPortion === 'function') onEditPortion(draft.trim());
    setEditing(false);
  };
  const handleDuplicate = () => {
    if (typeof onDuplicate === 'function') onDuplicate();
  };
  const handleDelete = () => {
    if (typeof onDelete === 'function') onDelete();
  };

  // Inverted card color helpers
  const invDim = dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)';
  const invHair = dark ? 'rgba(10,10,10,0.14)' : 'rgba(239,233,218,0.14)';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Top bar */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>
          MEAL \u00b7 {slotLabel(mealSlot).toUpperCase()}
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Header: name + portion + time */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          {slotLabel(mealSlot)}{time ? ` \u00b7 ${time}` : ''}
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
          letterSpacing: -1.2, lineHeight: 1.05, color: c.fg,
        }}>
          {_entry.name}
        </div>
        <div style={{
          marginTop: 6, fontFamily: ACFonts.mono, fontSize: 12,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {_entry.portion || '\u2014'}
        </div>

        {/* Hero calorie card (accent background) */}
        <div style={{
          marginTop: 20, padding: 22,
          background: c.accent, color: c.ink,
          borderRadius: ACRadii.card,
          textAlign: 'center',
        }}>
          <ACLabel size={10} color="rgba(10,10,10,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>
            Total energy
          </ACLabel>
          <div style={{ marginTop: 8 }}>
            <ACNum size={52} color={c.ink} weight={700}>{kcal}</ACNum>
            <span style={{
              fontFamily: ACFonts.mono, fontSize: 14,
              color: 'rgba(10,10,10,0.50)', marginLeft: 6, fontWeight: 600,
              letterSpacing: 0.3,
            }}>kcal</span>
          </div>
        </div>

        {/* 3-column macro grid */}
        <div style={{
          marginTop: 18, padding: 18,
          background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
        }}>
          {[
            { k: 'PROTEIN', v: protein, u: 'g', kcalVal: pKcal, hi: true },
            { k: 'CARBS',   v: carbs,   u: 'g', kcalVal: cKcal },
            { k: 'FAT',     v: fat,     u: 'g', kcalVal: fKcal },
          ].map((m, i) => (
            <div key={m.k} style={{
              paddingLeft: i === 0 ? 0 : 14,
              borderLeft: i === 0 ? 'none' : `1px solid ${invHair}`,
            }}>
              <div style={{
                fontFamily: ACFonts.mono, fontSize: 9, color: invDim,
                letterSpacing: 0.7,
              }}>{m.k}</div>
              <div style={{
                marginTop: 6, fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
                letterSpacing: -0.7, color: m.hi ? c.accent : c.bg,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {m.v}<span style={{
                  fontSize: 12, fontFamily: ACFonts.mono,
                  color: invDim, marginLeft: 2,
                }}>{m.u}</span>
              </div>
              <div style={{
                fontFamily: ACFonts.mono, fontSize: 10, color: invDim, marginTop: 2,
                fontVariantNumeric: 'tabular-nums',
              }}>{m.kcalVal} kcal</div>
            </div>
          ))}
        </div>

        {/* Micronutrients */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Micronutrients
          </ACLabel>
          {hasMicros ? (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {Object.entries(_entry.micros).map(([key, val], i) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  <span style={{ fontFamily: ACFonts.body, fontSize: 13, color: c.dim }}>{key}</span>
                  <span style={{
                    fontFamily: ACFonts.mono, fontSize: 13, fontWeight: 700,
                    color: c.fg, fontVariantNumeric: 'tabular-nums',
                  }}>{String(val)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              marginTop: 10, padding: '18px 16px',
              background: c.card, borderRadius: ACRadii.card,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: ACFonts.body, fontSize: 13, fontWeight: 600, color: c.fg }}>
                No micronutrient data
              </div>
              <ACLabel size={11} color={c.mute} style={{ marginTop: 4, display: 'block', lineHeight: 1.45 }}>
                Vitamins and minerals will appear here when available for this food.
              </ACLabel>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Edit portion */}
          {!editing ? (
            <ActionRow
              label="Edit serving size"
              description={_entry.portion || 'Not set'}
              c={c}
              dark={dark}
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 2L12 4L5 11H3V9L10 2Z" stroke={c.fg} strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              }
              onClick={() => setEditing(true)}
            />
          ) : (
            <div style={{
              padding: 14, background: c.card, borderRadius: ACRadii.card,
            }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Edit serving
              </ACLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. 150 g or 1 cup"
                  autoFocus
                  style={{
                    flex: 1, height: 42, borderRadius: ACRadii.input,
                    background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)',
                    border: `1px solid ${c.faint}`,
                    color: c.fg,
                    padding: '0 14px',
                    fontFamily: ACFonts.body,
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <ACBtn primary dark={dark} size="sm" onClick={handleSavePortion}>Save</ACBtn>
                <ACBtn dark={dark} size="sm" onClick={() => setEditing(false)}>Cancel</ACBtn>
              </div>
            </div>
          )}

          {/* Duplicate */}
          <ActionRow
            label="Duplicate to now"
            description="Log the same food again with the current time"
            c={c}
            dark={dark}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4" y="4" width="8" height="8" rx="1.5" stroke={c.fg} strokeWidth="1.4" />
                <path d="M10 4V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5.5A1.5 1.5 0 003 10h1" stroke={c.fg} strokeWidth="1.4" />
              </svg>
            }
            onClick={handleDuplicate}
          />

          {/* Delete */}
          {!confirmDelete ? (
            <ActionRow
              label="Delete entry"
              c={c}
              dark={dark}
              danger
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M4 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              onClick={() => setConfirmDelete(true)}
            />
          ) : (
            <div style={{
              padding: 14, background: c.card, borderRadius: ACRadii.card,
              border: `1px solid ${c.faint}`,
            }}>
              <div style={{ fontFamily: ACFonts.body, fontSize: 14, fontWeight: 700, color: c.fg }}>
                Delete this entry?
              </div>
              <ACLabel size={12} color={c.mute} style={{ marginTop: 4, display: 'block', lineHeight: 1.45 }}>
                This cannot be undone.
              </ACLabel>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <ACBtn dark={dark} size="sm" style={{ background: c.accent === '#e8b500' ? '#c65b4b' : '#c65b4b', color: '#fff' }} onClick={handleDelete}>
                  Delete
                </ACBtn>
                <ACBtn dark={dark} size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </ACBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -- ActionRow ----------------------------------------------------------- */

function ActionRow({ icon, label, description, c, dark, danger = false, onClick }) {
  const color = danger ? '#c65b4b' : c.fg;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '14px 16px',
        background: c.card,
        borderRadius: ACRadii.card,
        border: 'none',
        color: c.fg,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{
        width: 32, height: 32, borderRadius: 10,
        background: danger
          ? 'rgba(198,91,75,0.12)'
          : (dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)'),
        color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
          letterSpacing: -0.15, color,
        }}>
          {label}
        </div>
        {description && (
          <ACLabel size={11} color={c.mute} style={{ marginTop: 2, display: 'block' }}>
            {description}
          </ACLabel>
        )}
      </div>
      <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
        <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default S82_Meal_Detail;
