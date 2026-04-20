/**
 * S67_Profile_Editor — full profile editor screen (v3 paper system).
 *
 * Replaces v2 ProfileEditor.jsx with the paper+ink+amber aesthetic.
 * Pattern: S33_Profile (hero, sections) + S7_Onboard_Identity (editable inputs).
 *
 * Sections:
 *  1. Avatar hero — large circle, initials fallback, "Change photo" overlay
 *  2. Personal    — first name, last name, display name, bio (160 char)
 *  3. Physical    — height (unit toggle), weight (read-only link), DOB, gender
 *  4. Training    — experience pills, primary goal, days/week stepper
 *  5. Bottom      — "Save changes" primary CTA (disabled until dirty)
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]
 * @param {object}   [props.profile]         — current profile data
 * @param {string}   [props.profile.avatarUrl]
 * @param {string}   [props.profile.firstName]
 * @param {string}   [props.profile.lastName]
 * @param {string}   [props.profile.displayName]
 * @param {string}   [props.profile.bio]
 * @param {number}   [props.profile.heightCm]
 * @param {number}   [props.profile.weight]
 * @param {string}   [props.profile.weightUnit]
 * @param {string}   [props.profile.dob]
 * @param {string}   [props.profile.gender]
 * @param {string}   [props.profile.experience]
 * @param {string}   [props.profile.primaryGoal]
 * @param {number}   [props.profile.trainingDaysPerWeek]
 * @param {function} [props.onSave]          — (updatedProfile) => void
 * @param {function} [props.onChangeAvatar]  — () => void
 * @param {function} [props.onBack]          — () => void
 */
import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip, ACNum,
} from '../lib/paper.jsx';

/* ── constants ─────────────────────────────────────────────────── */

const BIO_MAX = 160;

const GENDER_OPTIONS = [
  { id: 'male',              label: 'Male' },
  { id: 'female',            label: 'Female' },
  { id: 'non_binary',        label: 'Non-binary' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const EXPERIENCE_OPTIONS = [
  { id: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced' },
];

const GOAL_OPTIONS = [
  { id: 'strength',    label: 'Strength' },
  { id: 'hypertrophy', label: 'Hypertrophy' },
  { id: 'endurance',   label: 'Endurance' },
  { id: 'weight_loss', label: 'Weight loss' },
  { id: 'health',      label: 'Health' },
  { id: 'general',     label: 'General fitness' },
];

const DEMO_PROFILE = {
  avatarUrl: null,
  firstName: 'Marcus',
  lastName: 'Kane',
  displayName: 'marcus.k',
  bio: 'Chasing 500. Slow lifter, good sleeper.',
  heightCm: 183,
  weight: 182.4,
  weightUnit: 'lb',
  dob: '1996-03-14',
  gender: 'male',
  experience: 'intermediate',
  primaryGoal: 'strength',
  trainingDaysPerWeek: 4,
};

/* ── helpers ───────────────────────────────────────────────────── */

function getInitials(first, last) {
  const a = (first || '').trim();
  const b = (last || '').trim();
  if (a || b) return ((a[0] || '') + (b[0] || '')).toUpperCase();
  return '--';
}

function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return `${ft}'${inches}"`;
}

function formsEqual(a, b) {
  const keys = [
    'firstName', 'lastName', 'displayName', 'bio',
    'heightCm', 'dob', 'gender', 'unitMode',
    'experience', 'primaryGoal', 'trainingDaysPerWeek',
  ];
  return keys.every(k => (a[k] ?? '') === (b[k] ?? ''));
}

/* ── main component ────────────────────────────────────────────── */

export default function S67_Profile_Editor({
  dark = false,
  profile: profileProp,
  onSave,
  onChangeAvatar,
  onBack,
}) {
  const c = useACT(dark);
  const source = profileProp === undefined ? DEMO_PROFILE : profileProp;

  /* ── form state ─────────────────────────────────────────────── */
  const initial = useMemo(() => ({
    firstName:           source?.firstName || '',
    lastName:            source?.lastName || '',
    displayName:         source?.displayName || '',
    bio:                 (source?.bio || '').slice(0, BIO_MAX),
    heightCm:            source?.heightCm != null ? String(source.heightCm) : '',
    dob:                 source?.dob || '',
    gender:              source?.gender || '',
    unitMode:            (source?.weightUnit === 'kg' || source?.weightUnit === 'metric') ? 'metric' : 'imperial',
    experience:          source?.experience || '',
    primaryGoal:         source?.primaryGoal || '',
    trainingDaysPerWeek: source?.trainingDaysPerWeek ?? 3,
  }), [source]);

  const [form, setForm] = useState(initial);
  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const isDirty = !formsEqual(form, initial);
  const bioLen = (form.bio || '').length;
  const initials = getInitials(form.firstName, form.lastName);
  const avatarUrl = source?.avatarUrl || null;

  /* ── save handler ───────────────────────────────────────────── */
  function handleSave() {
    if (!isDirty) return;
    const out = {
      firstName:           form.firstName.trim(),
      lastName:            form.lastName.trim(),
      displayName:         form.displayName.trim(),
      bio:                 form.bio.slice(0, BIO_MAX).trim(),
      heightCm:            form.heightCm === '' ? null : Number(form.heightCm),
      dob:                 form.dob || null,
      gender:              form.gender || null,
      experience:          form.experience || null,
      primaryGoal:         form.primaryGoal || null,
      trainingDaysPerWeek: Number(form.trainingDaysPerWeek) || null,
    };
    if (typeof onSave === 'function') onSave(out);
  }

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.fg,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 22px 0', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          type="button"
          onClick={typeof onBack === 'function' ? onBack : undefined}
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: c.card, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{
          fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25,
          textTransform: 'uppercase',
        }}>
          Edit profile
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* Scrollable body */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px',
      }}>
        {/* ── 1. Avatar hero ──────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', paddingTop: 6, paddingBottom: 20,
        }}>
          <button
            type="button"
            onClick={typeof onChangeAvatar === 'function' ? onChangeAvatar : undefined}
            aria-label="Change photo"
            style={{
              position: 'relative', width: 96, height: 96,
              borderRadius: 999, overflow: 'hidden',
              background: avatarUrl ? 'transparent' : c.accent,
              color: c.ink, border: `3px solid ${c.hair}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{
                fontFamily: ACFonts.display, fontSize: 32,
                fontWeight: 700, letterSpacing: -0.8,
              }}>
                {initials}
              </span>
            )}
            {/* camera overlay badge */}
            <span style={{
              position: 'absolute', right: 0, bottom: 0,
              width: 28, height: 28, borderRadius: 999,
              background: c.fg, color: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${c.bg}`,
            }}>
              <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                <path d="M3 7a2 2 0 0 1 2-2h2l1.5-2h5L15 5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                  stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="11" cy="11.5" r="3.2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </button>
          <ACLabel size={11} color={c.dim} style={{ marginTop: 10 }}>
            Tap to change photo
          </ACLabel>
        </div>

        {/* ── 2. Personal ─────────────────────────────────────────── */}
        <SectionLabel dark={dark}>Personal</SectionLabel>

        <FieldBlock dark={dark} label="First name">
          <PaperInput dark={dark} value={form.firstName}
            onChange={set('firstName')} placeholder="First name" />
        </FieldBlock>

        <FieldBlock dark={dark} label="Last name">
          <PaperInput dark={dark} value={form.lastName}
            onChange={set('lastName')} placeholder="Last name" />
        </FieldBlock>

        <FieldBlock dark={dark} label="Display name">
          <PaperInput dark={dark} value={form.displayName}
            onChange={set('displayName')} placeholder="Optional handle" maxLength={40} />
        </FieldBlock>

        <FieldBlock dark={dark} label="Bio" hint={`${bioLen}/${BIO_MAX}`}>
          <PaperTextarea dark={dark} value={form.bio}
            onChange={(v) => set('bio')(v.slice(0, BIO_MAX))}
            placeholder="One line about you." rows={3} maxLength={BIO_MAX} />
        </FieldBlock>

        {/* ── 3. Physical ─────────────────────────────────────────── */}
        <SectionLabel dark={dark} style={{ marginTop: 24 }}>Physical</SectionLabel>

        <FieldBlock dark={dark}
          label={form.unitMode === 'imperial' ? 'Height' : 'Height (cm)'}
          hint={
            form.heightCm && Number(form.heightCm) >= 100
              ? (form.unitMode === 'imperial'
                ? `${Number(form.heightCm)} cm`
                : cmToFtIn(Number(form.heightCm)))
              : null
          }
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <PaperInput dark={dark}
              value={form.heightCm}
              onChange={set('heightCm')}
              placeholder={form.unitMode === 'imperial' ? '70' : '180'}
              type="text" inputMode="numeric"
              style={{ flex: 1 }}
            />
            <UnitToggle dark={dark}
              value={form.unitMode}
              onChange={set('unitMode')}
            />
          </div>
        </FieldBlock>

        <FieldBlock dark={dark} label="Current weight" hint="Read-only — log from Body">
          <div style={{
            padding: '12px 16px', background: c.card,
            borderRadius: ACRadii.input,
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            opacity: 0.7,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <ACNum size={22} color={c.fg} weight={700}>
                {source?.weight != null ? source.weight : '--'}
              </ACNum>
              <span style={{ fontFamily: ACFonts.body, fontSize: 10, color: c.dim }}>
                {source?.weightUnit || 'lb'}
              </span>
            </div>
            <ACLabel size={10} color={c.accent} style={{ fontWeight: 600 }}>
              Weight log
            </ACLabel>
          </div>
        </FieldBlock>

        <FieldBlock dark={dark} label="Date of birth">
          <PaperInput dark={dark} type="date"
            value={form.dob} onChange={set('dob')}
            max={new Date().toISOString().slice(0, 10)} />
        </FieldBlock>

        <FieldBlock dark={dark} label="Gender">
          <PillGroup dark={dark}
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={set('gender')} />
        </FieldBlock>

        {/* ── 4. Training ─────────────────────────────────────────── */}
        <SectionLabel dark={dark} style={{ marginTop: 24 }}>Training</SectionLabel>

        <FieldBlock dark={dark} label="Experience level">
          <PillGroup dark={dark}
            options={EXPERIENCE_OPTIONS}
            value={form.experience}
            onChange={set('experience')} />
        </FieldBlock>

        <FieldBlock dark={dark} label="Primary goal">
          <PillGroup dark={dark}
            options={GOAL_OPTIONS}
            value={form.primaryGoal}
            onChange={set('primaryGoal')} />
        </FieldBlock>

        <FieldBlock dark={dark} label="Training days / week">
          <Stepper dark={dark}
            value={Number(form.trainingDaysPerWeek) || 3}
            min={1} max={7}
            onChange={(n) => set('trainingDaysPerWeek')(n)}
            suffix="days" />
        </FieldBlock>
      </div>

      {/* ── 5. Bottom CTA ───────────────────────────────────────── */}
      <div style={{
        padding: '14px 22px calc(14px + env(safe-area-inset-bottom, 0px))',
        borderTop: `1px solid ${c.hair}`, background: c.bg,
      }}>
        <ACBtn
          primary block dark={dark} size="lg" pill
          onClick={isDirty ? handleSave : undefined}
          style={{
            opacity: isDirty ? 1 : 0.35,
            pointerEvents: isDirty ? 'auto' : 'none',
          }}
        >
          Save changes
        </ACBtn>
        {!isDirty && (
          <div style={{
            textAlign: 'center', marginTop: 8,
            fontFamily: ACFonts.body, fontSize: 11, color: c.mute,
          }}>
            No unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}

/* ── sub-components ────────────────────────────────────────────── */

function SectionLabel({ dark, children, style }) {
  const c = useACT(dark);
  return (
    <div style={{
      marginBottom: 10,
      ...style,
    }}>
      <ACLabel size={10} color={c.dim} style={{
        fontFamily: ACFonts.body, letterSpacing: 0.5,
        textTransform: 'uppercase', fontWeight: 700,
      }}>
        {children}
      </ACLabel>
    </div>
  );
}

function FieldBlock({ dark, label, hint, children }) {
  const c = useACT(dark);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', gap: 8, marginBottom: 6,
      }}>
        <ACLabel size={11} color={c.dim} style={{
          fontFamily: ACFonts.body, letterSpacing: 0.2, fontWeight: 600,
        }}>
          {label}
        </ACLabel>
        {hint && (
          <ACLabel size={10} color={c.mute} style={{
            fontFamily: ACFonts.body, fontVariantNumeric: 'tabular-nums',
          }}>
            {hint}
          </ACLabel>
        )}
      </div>
      {children}
    </div>
  );
}

function PaperInput({ dark, value, onChange, placeholder, type = 'text', inputMode, maxLength, max, min, style: outerStyle }) {
  const c = useACT(dark);
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value ?? ''}
      onChange={(e) => typeof onChange === 'function' && onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      max={max}
      min={min}
      style={{
        width: '100%', height: 44,
        padding: '0 16px',
        borderRadius: ACRadii.input,
        background: c.card,
        border: `1px solid ${c.hair}`,
        color: c.fg,
        fontFamily: ACFonts.body,
        fontSize: 15, fontWeight: 500,
        letterSpacing: -0.2,
        outline: 'none',
        WebkitAppearance: 'none',
        ...outerStyle,
      }}
    />
  );
}

function PaperTextarea({ dark, value, onChange, placeholder, rows = 3, maxLength }) {
  const c = useACT(dark);
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => typeof onChange === 'function' && onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      style={{
        width: '100%',
        padding: '10px 16px',
        borderRadius: ACRadii.input,
        background: c.card,
        border: `1px solid ${c.hair}`,
        color: c.fg,
        fontFamily: ACFonts.body,
        fontSize: 14, fontWeight: 500,
        lineHeight: 1.5, letterSpacing: -0.2,
        outline: 'none', resize: 'vertical',
        WebkitAppearance: 'none',
      }}
    />
  );
}

function UnitToggle({ dark, value, onChange }) {
  const c = useACT(dark);
  const opts = ['metric', 'imperial'];
  return (
    <div style={{ display: 'flex', gap: 2, background: c.hair, padding: 2, borderRadius: ACRadii.chip }}>
      {opts.map(k => {
        const on = value === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => typeof onChange === 'function' && onChange(k)}
            style={{
              padding: '6px 10px', borderRadius: ACRadii.chip - 2,
              background: on ? c.fg : 'transparent',
              color: on ? c.bg : c.dim,
              fontFamily: ACFonts.body, fontSize: 10,
              fontWeight: 600, letterSpacing: 0.3,
              textTransform: 'uppercase',
              border: 'none', cursor: 'pointer',
            }}
          >
            {k === 'metric' ? 'CM' : 'IN'}
          </button>
        );
      })}
    </div>
  );
}

function PillGroup({ dark, options, value, onChange }) {
  const c = useACT(dark);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const on = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => typeof onChange === 'function' && onChange(on ? '' : opt.id)}
            aria-pressed={on}
            style={{
              padding: '8px 14px', borderRadius: 999,
              background: on ? c.fg : c.card,
              color: on ? c.bg : c.fg,
              border: on ? `1px solid ${c.fg}` : `1px solid ${c.hair}`,
              fontFamily: ACFonts.body, fontSize: 12,
              fontWeight: 600, letterSpacing: -0.1,
              cursor: 'pointer',
              WebkitAppearance: 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({ dark, value, min = 1, max = 7, onChange, suffix }) {
  const c = useACT(dark);
  const dec = () => typeof onChange === 'function' && onChange(Math.max(min, (value || min) - 1));
  const inc = () => typeof onChange === 'function' && onChange(Math.min(max, (value || min) + 1));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        type="button"
        onClick={dec}
        disabled={atMin}
        aria-label="Decrease"
        style={{
          width: 38, height: 38, borderRadius: 999,
          background: c.card, border: `1px solid ${c.hair}`,
          color: c.fg, fontFamily: ACFonts.display,
          fontSize: 20, fontWeight: 700, lineHeight: 1,
          cursor: atMin ? 'not-allowed' : 'pointer',
          opacity: atMin ? 0.3 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        -
      </button>
      <div style={{
        minWidth: 72, height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: ACRadii.input, background: c.card,
        border: `1px solid ${c.hair}`,
        fontFamily: ACFonts.display, fontSize: 18,
        fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: c.fg, padding: '0 14px', gap: 4,
      }}>
        {value || '--'}
        {suffix && (
          <span style={{
            fontFamily: ACFonts.body, fontSize: 10,
            fontWeight: 500, color: c.mute,
          }}>
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={atMax}
        aria-label="Increase"
        style={{
          width: 38, height: 38, borderRadius: 999,
          background: c.card, border: `1px solid ${c.hair}`,
          color: c.fg, fontFamily: ACFonts.display,
          fontSize: 20, fontWeight: 700, lineHeight: 1,
          cursor: atMax ? 'not-allowed' : 'pointer',
          opacity: atMax ? 0.3 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        +
      </button>
    </div>
  );
}
