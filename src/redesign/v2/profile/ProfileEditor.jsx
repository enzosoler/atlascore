/**
 * ProfileEditor — /app/profile/edit.
 *
 * Full-screen editor for everything that lives in the Supabase `user_metadata`
 * blob. Replaces the old broken/placeholder edit flow.
 *
 * Sections:
 *  1. Avatar hero (circular, tap-to-change, upload to Supabase Storage)
 *  2. Personal info (first name, last name, display name, bio, DOB, gender)
 *  3. Physical info (height, read-only weight, unit preference)
 *  4. Training info (experience, primary goal, days/week)
 *  5. Fine print (email → Account settings, delete → Danger Zone)
 *
 * SUPABASE BACKEND TODO (Enzo):
 * ─────────────────────────────────────────────────────────────────────────
 *  The avatar upload writes to a Storage bucket named `avatars`. You need:
 *
 *    1. Create a PUBLIC bucket called `avatars` in the Supabase Dashboard
 *       (Storage → New bucket → name: avatars, public: true).
 *
 *    2. RLS policies on `storage.objects` restricted to authenticated users
 *       operating inside their own folder `avatars/{auth.uid()}/*`:
 *
 *       -- READ (public read — since the bucket is public)
 *       create policy "avatars public read"
 *         on storage.objects for select
 *         using (bucket_id = 'avatars');
 *
 *       -- INSERT
 *       create policy "avatars users can upload their own"
 *         on storage.objects for insert
 *         to authenticated
 *         with check (
 *           bucket_id = 'avatars'
 *           and (storage.foldername(name))[1] = auth.uid()::text
 *         );
 *
 *       -- UPDATE
 *       create policy "avatars users can update their own"
 *         on storage.objects for update
 *         to authenticated
 *         using (
 *           bucket_id = 'avatars'
 *           and (storage.foldername(name))[1] = auth.uid()::text
 *         );
 *
 *       -- DELETE
 *       create policy "avatars users can delete their own"
 *         on storage.objects for delete
 *         to authenticated
 *         using (
 *           bucket_id = 'avatars'
 *           and (storage.foldername(name))[1] = auth.uid()::text
 *         );
 *
 *    3. Keys written to `auth.users.raw_user_meta_data` by this screen:
 *         - avatar_url          (string, public URL to Storage object)
 *         - first_name          (string)
 *         - last_name           (string)
 *         - full_name           (string, derived: `${first} ${last}`)
 *         - display_name        (string)
 *         - bio                 (string, ≤ 160 chars)
 *         - date_of_birth       (string, ISO date yyyy-mm-dd)
 *         - gender              (enum: 'male'|'female'|'non_binary'|'prefer_not_to_say')
 *         - height_cm           (number)
 *         - unit_preference     (enum: 'metric'|'imperial')
 *         - experience_level    (enum: 'beginner'|'intermediate'|'advanced')
 *         - primary_goal        (enum: 'strength'|'hypertrophy'|'endurance'|'weight_loss'|'health'|'general')
 *         - training_days_per_week (number, 1..7)
 *
 *    Current weight is stored separately via the body-progress service and is
 *    READ-ONLY here (edit via /app/body/weight).
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { CameraIcon, TrashIcon, ChevronLeftIcon } from '../lib/icons';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const GENDER_OPTIONS = [
  { id: 'male',                 label: 'Male' },
  { id: 'female',               label: 'Female' },
  { id: 'non_binary',           label: 'Non-binary' },
  { id: 'prefer_not_to_say',    label: 'Prefer not to say' },
];

const EXPERIENCE_OPTIONS = [
  { id: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced' },
];

const GOAL_OPTIONS = [
  { id: 'strength',     label: 'Strength' },
  { id: 'hypertrophy',  label: 'Hypertrophy' },
  { id: 'endurance',    label: 'Endurance' },
  { id: 'weight_loss',  label: 'Weight loss' },
  { id: 'health',       label: 'Health' },
  { id: 'general',      label: 'General fitness' },
];

const UNIT_OPTIONS = [
  { id: 'metric',   label: 'Metric (cm · kg)' },
  { id: 'imperial', label: 'Imperial (ft · lb)' },
];

const BIO_MAX = 160;

/**
 * Build the editable form state from a Supabase user.
 * Only reads from user_metadata — never fabricates values.
 */
function buildInitialForm(user) {
  const m = user?.user_metadata || {};
  const email = user?.email || '';
  // Best-effort split if only full_name exists — never invent names.
  let firstName = m.first_name || '';
  let lastName  = m.last_name || '';
  if (!firstName && !lastName && typeof m.full_name === 'string' && m.full_name.trim()) {
    const parts = m.full_name.trim().split(/\s+/);
    firstName = parts[0] || '';
    lastName  = parts.slice(1).join(' ') || '';
  }
  return {
    avatarUrl:          m.avatar_url || null,
    firstName,
    lastName,
    displayName:        m.display_name || '',
    bio:                (m.bio || '').slice(0, BIO_MAX),
    dateOfBirth:        m.date_of_birth || '',
    gender:             m.gender || '',
    heightCm:           m.height_cm != null ? String(m.height_cm) : '',
    unitPreference:     m.unit_preference || 'metric',
    experienceLevel:    m.experience_level || '',
    primaryGoal:        m.primary_goal || '',
    trainingDaysPerWeek: m.training_days_per_week != null ? Number(m.training_days_per_week) : 3,
    // read-only:
    email,
  };
}

function formsEqual(a, b) {
  if (!a || !b) return false;
  const keys = [
    'avatarUrl', 'firstName', 'lastName', 'displayName', 'bio',
    'dateOfBirth', 'gender', 'heightCm', 'unitPreference',
    'experienceLevel', 'primaryGoal', 'trainingDaysPerWeek',
  ];
  return keys.every((k) => (a[k] ?? '') === (b[k] ?? ''));
}

function getInitials(first, last, email) {
  const a = (first || '').trim();
  const b = (last || '').trim();
  if (a || b) {
    return ((a[0] || '') + (b[0] || '')).toUpperCase() || (a[0] || '').toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '·';
}

function fileExtension(name = '', type = '') {
  const dot = name.lastIndexOf('.');
  if (dot > -1 && dot < name.length - 1) return name.slice(dot + 1).toLowerCase();
  if (type && type.includes('/')) return type.split('/')[1].toLowerCase();
  return 'jpg';
}

export default function ProfileEditor() {
  const navigate = useNavigate();
  const { user, revalidateSession } = useAuth();

  const initial = useMemo(() => buildInitialForm(user), [user]);
  const [form, setForm] = useState(initial);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);   // File | null
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState(null); // ObjectURL
  const [avatarMarkedForRemoval, setAvatarMarkedForRemoval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Sync form when the user object arrives late (auth resolves async).
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  // Revoke blob URL on change / unmount.
  useEffect(() => {
    return () => {
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    };
  }, [pendingAvatarPreview]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const isDirty =
    !formsEqual(form, initial) ||
    !!pendingAvatarFile ||
    avatarMarkedForRemoval;

  /* ─── Avatar handlers ──────────────────────────────────────────── */

  function openPicker() {
    fileInputRef.current?.click();
  }

  function handleFilePicked(e) {
    const file = e.target.files?.[0];
    // Reset input so picking the same file twice still triggers onChange.
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please pick an image file.');
      return;
    }
    const MAX = 8 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error('Image must be under 8 MB.');
      return;
    }
    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatarFile(file);
    setPendingAvatarPreview(URL.createObjectURL(file));
    setAvatarMarkedForRemoval(false);
  }

  function discardPending() {
    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
  }

  function markAvatarRemoved() {
    discardPending();
    setAvatarMarkedForRemoval(true);
  }

  /* ─── Save ─────────────────────────────────────────────────────── */

  async function uploadAvatar(file) {
    if (!user?.id) throw new Error('Not signed in.');
    const ext = fileExtension(file.name, file.type);
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });
    if (upErr) {
      // Enzo: bucket-missing error from supabase-js typically contains
      // "Bucket not found" — surface that cleanly.
      const msg = (upErr.message || '').toLowerCase();
      if (msg.includes('bucket not found') || msg.includes('not_found')) {
        throw new Error('storage bucket not configured');
      }
      throw upErr;
    }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    if (!pub?.publicUrl) throw new Error('Failed to resolve public URL.');
    return pub.publicUrl;
  }

  async function handleSave() {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      // 1. Resolve avatar_url: upload new / keep / remove.
      let nextAvatarUrl = form.avatarUrl || null;
      if (pendingAvatarFile) {
        setUploading(true);
        try {
          nextAvatarUrl = await uploadAvatar(pendingAvatarFile);
        } catch (err) {
          toast.error(`Avatar upload failed: ${err.message || 'unknown error'}`);
          setUploading(false);
          setSaving(false);
          return;
        } finally {
          setUploading(false);
        }
      } else if (avatarMarkedForRemoval) {
        nextAvatarUrl = null;
      }

      // 2. Build user_metadata payload. Trim strings; empties become nulls so
      // fields are cleanable instead of accumulating "".
      const clean = (s) => {
        const t = (s ?? '').trim();
        return t === '' ? null : t;
      };
      const firstName = clean(form.firstName);
      const lastName  = clean(form.lastName);
      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null;

      const metadata = {
        avatar_url:            nextAvatarUrl,
        first_name:            firstName,
        last_name:             lastName,
        full_name:             fullName,
        display_name:          clean(form.displayName),
        bio:                   clean((form.bio || '').slice(0, BIO_MAX)),
        date_of_birth:         clean(form.dateOfBirth),
        gender:                clean(form.gender),
        height_cm:             form.heightCm === '' ? null : Number(form.heightCm),
        unit_preference:       form.unitPreference || 'metric',
        experience_level:      clean(form.experienceLevel),
        primary_goal:          clean(form.primaryGoal),
        training_days_per_week: Number(form.trainingDaysPerWeek) || null,
      };

      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) {
        toast.error(error.message || 'Could not save profile.');
        setSaving(false);
        return;
      }

      // 3. Refresh AuthContext so Profile shows the new values immediately.
      try { await revalidateSession?.(); } catch { /* non-fatal */ }

      toast.success('Profile updated.');
      setPendingAvatarFile(null);
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
      setPendingAvatarPreview(null);
      setAvatarMarkedForRemoval(false);

      navigate('/app/profile');
    } catch (err) {
      toast.error(err?.message || 'Unexpected error saving profile.');
    } finally {
      setSaving(false);
    }
  }

  /* ─── Render helpers ───────────────────────────────────────────── */

  const initials = getInitials(form.firstName, form.lastName, form.email);
  const displayedAvatar =
    pendingAvatarPreview
      ? pendingAvatarPreview
      : avatarMarkedForRemoval
        ? null
        : form.avatarUrl || null;
  const bioLen = (form.bio || '').length;

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      {/* Fixed top bar: back · title · save */}
      <EditorTopBar
        onBack={() => navigate('/app/profile')}
        onSave={handleSave}
        saving={saving}
        canSave={isDirty && !saving}
      />

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 60 }}>

        {/* ── 1. Avatar ─────────────────────────────────────────────── */}
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, gap: 12 }}>
            <AvatarEditor
              src={displayedAvatar}
              initials={initials}
              uploading={uploading}
              onTap={openPicker}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFilePicked}
            />
            {pendingAvatarFile ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={discardPending}
                  style={pillButtonStyle('neutral')}
                >
                  Keep current
                </button>
                <button
                  type="button"
                  onClick={markAvatarRemoved}
                  style={pillButtonStyle('danger')}
                >
                  <TrashIcon size={13} /> Remove
                </button>
              </div>
            ) : (form.avatarUrl && !avatarMarkedForRemoval) ? (
              <button
                type="button"
                onClick={markAvatarRemoved}
                style={pillButtonStyle('danger')}
              >
                <TrashIcon size={13} /> Remove photo
              </button>
            ) : avatarMarkedForRemoval ? (
              <button
                type="button"
                onClick={() => setAvatarMarkedForRemoval(false)}
                style={pillButtonStyle('neutral')}
              >
                Undo remove
              </button>
            ) : (
              <button
                type="button"
                onClick={openPicker}
                style={pillButtonStyle('accent')}
              >
                <CameraIcon size={13} /> Add photo
              </button>
            )}
          </div>
        </SpringReveal>

        {/* ── 2. Personal info ──────────────────────────────────────── */}
        <Section title="Personal" delay={60}>
          <FieldRow label="First name">
            <TextInput
              value={form.firstName}
              onChange={set('firstName')}
              autoComplete="given-name"
              placeholder="Your first name"
            />
          </FieldRow>
          <FieldRow label="Last name">
            <TextInput
              value={form.lastName}
              onChange={set('lastName')}
              autoComplete="family-name"
              placeholder="Your last name"
            />
          </FieldRow>
          <FieldRow label="Display name" hint="Shown on your public profile and in the feed">
            <TextInput
              value={form.displayName}
              onChange={set('displayName')}
              placeholder="Optional"
              maxLength={40}
            />
          </FieldRow>
          <FieldRow label="Bio" hint={`${bioLen}/${BIO_MAX}`}>
            <TextArea
              value={form.bio}
              onChange={(v) => set('bio')(v.slice(0, BIO_MAX))}
              placeholder="One line about you."
              rows={3}
              maxLength={BIO_MAX}
            />
          </FieldRow>
          <FieldRow label="Date of birth">
            <TextInput
              type="date"
              value={form.dateOfBirth}
              onChange={set('dateOfBirth')}
              max={new Date().toISOString().slice(0, 10)}
            />
          </FieldRow>
          <FieldRow label="Gender">
            <PillGroup
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={set('gender')}
            />
          </FieldRow>
        </Section>

        {/* ── 3. Physical info ──────────────────────────────────────── */}
        <Section title="Physical" delay={120}>
          <FieldRow
            label={form.unitPreference === 'imperial' ? 'Height (inches)' : 'Height (cm)'}
            hint={
              form.unitPreference === 'imperial'
                ? 'Stored as cm internally'
                : null
            }
          >
            <TextInput
              type="number"
              inputMode="decimal"
              value={form.heightCm}
              onChange={set('heightCm')}
              placeholder={form.unitPreference === 'imperial' ? 'e.g. 70' : 'e.g. 178'}
              min={60}
              max={260}
            />
          </FieldRow>
          <FieldRow
            label="Current weight"
            hint="Edit this by logging a new weight"
          >
            <LinkRow
              label="Open weight log"
              onClick={() => navigate('/app/body/weight')}
            />
          </FieldRow>
          <FieldRow label="Units">
            <PillGroup
              options={UNIT_OPTIONS}
              value={form.unitPreference}
              onChange={set('unitPreference')}
            />
          </FieldRow>
        </Section>

        {/* ── 4. Training info ──────────────────────────────────────── */}
        <Section title="Training" delay={180}>
          <FieldRow label="Experience">
            <PillGroup
              options={EXPERIENCE_OPTIONS}
              value={form.experienceLevel}
              onChange={set('experienceLevel')}
            />
          </FieldRow>
          <FieldRow label="Primary goal">
            <PillGroup
              options={GOAL_OPTIONS}
              value={form.primaryGoal}
              onChange={set('primaryGoal')}
            />
          </FieldRow>
          <FieldRow label="Training days / week">
            <Stepper
              value={Number(form.trainingDaysPerWeek) || 0}
              min={1}
              max={7}
              onChange={(n) => set('trainingDaysPerWeek')(n)}
              suffix="days"
            />
          </FieldRow>
        </Section>

        {/* ── 5. Fine print ─────────────────────────────────────────── */}
        <SpringReveal delay={240}>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FinePrintLink
              label="Email changes happen from Account settings"
              onClick={() => navigate('/app/settings/account')}
            />
            <FinePrintLink
              label="Delete your account — Danger Zone"
              tone="danger"
              onClick={() => navigate('/app/settings/danger')}
            />
          </div>
        </SpringReveal>

        {/* Inline save CTA at the bottom — redundant with top-bar save but
            mobile users often expect a bottom button. */}
        <SpringReveal delay={280}>
          <div style={{ marginTop: 24 }}>
            <LiquidButton
              intent="primary"
              size="lg"
              block
              onClick={handleSave}
              disabled={!isDirty || saving}
              loading={saving}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </LiquidButton>
            {!isDirty && (
              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>
                No unsaved changes.
              </div>
            )}
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { ProfileEditor };

/**
 * ProfileEditorRoute — matches the codebase pattern where the route file wraps
 * the presentational component. Kept trivial because ProfileEditor already
 * consumes useAuth + useNavigate directly.
 */
export function ProfileEditorRoute() {
  return <ProfileEditor />;
}

/* ─── Top bar ──────────────────────────────────────────────────────────── */

function EditorTopBar({ onBack, onSave, saving, canSave }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        backgroundImage:
          'linear-gradient(180deg, rgba(5,7,10,0.86) 0%, rgba(5,7,10,0.72) 70%, rgba(5,7,10,0) 100%)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <ChevronLeftIcon size={18} />
          </button>
        </div>
        <div
          className="truncate"
          style={{
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'hsl(var(--rd-fg-primary))',
          }}
        >
          Edit profile
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            style={{
              height: 32,
              paddingInline: 14,
              borderRadius: 9999,
              background: canSave
                ? 'linear-gradient(180deg, rgba(0,255,255,0.98) 0%, rgba(0,210,210,0.92) 100%)'
                : 'rgba(255,255,255,0.06)',
              border: canSave
                ? '1px solid rgba(0,255,255,0.55)'
                : '1px solid rgba(255,255,255,0.10)',
              color: canSave
                ? 'hsl(var(--rd-fg-on-accent))'
                : 'hsl(var(--rd-fg-muted))',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              cursor: canSave ? 'pointer' : 'not-allowed',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background 180ms, border-color 180ms, color 180ms',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar editor ────────────────────────────────────────────────────── */

function AvatarEditor({ src, initials, uploading, onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={src ? 'Change photo' : 'Add photo'}
      style={{
        position: 'relative',
        width: 96,
        height: 96,
        borderRadius: 9999,
        overflow: 'hidden',
        background: src
          ? 'transparent'
          : 'linear-gradient(180deg, rgba(0,255,255,0.22), rgba(0,255,255,0.06))',
        border: '2px solid rgba(255,255,255,0.14)',
        color: 'hsl(var(--rd-fg-on-accent))',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        opacity: uploading ? 0.6 : 1,
        transition: 'opacity 180ms',
      }}
    >
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ position: 'absolute', inset: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {initials}
        </span>
      )}
      {uploading && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
          }}
        >
          <MiniSpinnerInline />
        </span>
      )}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 2,
          bottom: 2,
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: 'hsl(var(--rd-accent))',
          color: 'hsl(var(--rd-fg-on-accent))',
          border: '2px solid hsl(var(--rd-bg-app))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px -4px rgba(0,200,200,0.45)',
        }}
      >
        <CameraIcon size={14} />
      </span>
    </button>
  );
}

function MiniSpinnerInline() {
  return (
    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" fill="none" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ─── Form primitives ──────────────────────────────────────────────────── */

function Section({ title, delay = 0, children }) {
  return (
    <SpringReveal delay={delay}>
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'hsl(var(--rd-fg-muted))',
            marginBottom: 8,
            paddingInline: 2,
          }}
        >
          {title}
        </div>
        <Glass radius="xl" style={{ padding: 4, overflow: 'hidden' }}>
          {children}
        </Glass>
      </div>
    </SpringReveal>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <label
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'hsl(var(--rd-fg-muted))',
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
            {hint}
          </span>
        )}
      </div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, type = 'text', placeholder, maxLength, autoComplete, inputMode, min, max }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete={autoComplete}
      inputMode={inputMode}
      min={min}
      max={max}
      style={{
        width: '100%',
        height: 40,
        padding: '0 12px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3, maxLength }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '-0.005em',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        WebkitTapHighlightColor: 'transparent',
      }}
    />
  );
}

function PillGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(selected ? '' : opt.id)}
            aria-pressed={selected}
            style={{
              height: 34,
              paddingInline: 12,
              borderRadius: 9999,
              background: selected
                ? 'linear-gradient(180deg, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.08) 100%)'
                : 'rgba(255,255,255,0.04)',
              border: selected
                ? '1px solid rgba(0,255,255,0.5)'
                : '1px solid rgba(255,255,255,0.10)',
              color: selected ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background 180ms, border-color 180ms, color 180ms',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({ value, min = 1, max = 7, onChange, suffix }) {
  const dec = () => onChange(Math.max(min, (value || min) - 1));
  const inc = () => onChange(Math.min(max, (value || min) + 1));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <StepperButton onClick={dec} disabled={atMin} label="−" />
      <div
        style={{
          minWidth: 72,
          height: 36,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 15,
          fontWeight: 700,
          color: 'hsl(var(--rd-fg-primary))',
          padding: '0 12px',
        }}
      >
        {value || '—'}
        {suffix && (
          <span style={{ fontSize: 11, fontWeight: 500, color: 'hsl(var(--rd-fg-muted))', marginLeft: 4 }}>
            {suffix}
          </span>
        )}
      </div>
      <StepperButton onClick={inc} disabled={atMax} label="+" />
    </div>
  );
}

function StepperButton({ onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={label === '+' ? 'Increase' : 'Decrease'}
    >
      {label}
    </button>
  );
}

function LinkRow({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        height: 40,
        padding: '0 12px',
        borderRadius: 10,
        background: 'rgba(0,255,255,0.08)',
        border: '1px solid rgba(0,255,255,0.22)',
        color: 'hsl(var(--rd-accent))',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '-0.005em',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label} →
    </button>
  );
}

function FinePrintLink({ label, onClick, tone = 'neutral' }) {
  const danger = tone === 'danger';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 12,
        background: danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
        border: danger ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.06)',
        color: danger ? '#FB7185' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label} →
    </button>
  );
}

/* ─── Pill button presets (for avatar row secondary actions) ───────────── */

function pillButtonStyle(tone) {
  const base = {
    height: 32,
    paddingInline: 12,
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '-0.005em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  };
  if (tone === 'danger') {
    return {
      ...base,
      background: 'rgba(239,68,68,0.10)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#FB7185',
    };
  }
  if (tone === 'accent') {
    return {
      ...base,
      background: 'rgba(0,255,255,0.10)',
      border: '1px solid rgba(0,255,255,0.3)',
      color: 'hsl(var(--rd-accent))',
    };
  }
  return {
    ...base,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.14)',
    color: 'hsl(var(--rd-fg-primary))',
  };
}
