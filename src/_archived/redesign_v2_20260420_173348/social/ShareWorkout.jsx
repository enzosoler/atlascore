/**
 * ShareWorkout — /app/social/share?workoutId=xyz
 *
 * Post a completed workout to the social feed.
 *   - Workout summary (title, exercises, duration, volume)
 *   - Optional comment
 *   - Visibility picker: Public / Friends only / Only me
 *   - "Share" CTA — MVP toasts "Workout shared" and navigates back.
 *
 * TRUST RULE: no workout service yet. Route wrapper passes workout=null when
 * the id isn't resolvable; screen renders an honest "can't find that session"
 * state.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, LiquidTopBar, SpringReveal } from '../lib/glass';
import {
  ChevronLeftIcon, GlobeIcon, UsersIcon, LockIcon, ShareIcon, DumbbellIcon,
} from '../lib/icons';

const VISIBILITY = [
  { id: 'public',  label: 'Public',       sub: 'Anyone on atlas.core',  Icon: GlobeIcon },
  { id: 'friends', label: 'Friends only', sub: 'Only your friends',     Icon: UsersIcon },
  { id: 'private', label: 'Only me',      sub: 'Save without sharing',  Icon: LockIcon },
];

export default function ShareWorkout({
  workout = null,
  defaultVisibility = 'friends',
  onCancel,
  onShare,
}) {
  const [comment, setComment] = useState('');
  const [visibility, setVisibility] = useState(defaultVisibility);

  return (
    <SafeScreen hasTopBar paddingX={16}>
      <LiquidTopBar
        left={<BackButton onClick={onCancel} />}
        title="Share workout"
        right={
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'transparent', border: 'none',
              color: 'hsl(var(--rd-fg-muted))', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', padding: '6px 10px',
            }}
          >
            Cancel
          </button>
        }
      />

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 140 }}>
        {/* Summary */}
        <SpringReveal delay={20}>
          {workout ? <WorkoutSummary workout={workout} /> : <MissingWorkout />}
        </SpringReveal>

        {/* Comment */}
        <SpringReveal delay={60}>
          <SectionTitle>Comment</SectionTitle>
          <Glass radius="xl" style={{ padding: 12 }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Say something..."
              rows={4}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                fontSize: 14,
                lineHeight: 1.5,
                color: 'hsl(var(--rd-fg-primary))',
                fontFamily: 'inherit',
                minHeight: 88,
              }}
              maxLength={500}
            />
            <div style={{ marginTop: 4, textAlign: 'right', fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
              {comment.length}/500
            </div>
          </Glass>
        </SpringReveal>

        {/* Visibility */}
        <SpringReveal delay={100}>
          <SectionTitle>Visibility</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VISIBILITY.map((v) => (
              <VisibilityRow
                key={v.id}
                Icon={v.Icon}
                label={v.label}
                sub={v.sub}
                selected={visibility === v.id}
                onClick={() => setVisibility(v.id)}
              />
            ))}
          </div>
        </SpringReveal>
      </div>

      {/* Footer action */}
      <footer
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto' }}>
          <LiquidButton
            intent="primary"
            size="xl"
            block
            leftIcon={<ShareIcon size={16} />}
            disabled={!workout}
            onClick={() => onShare?.({ comment, visibility })}
          >
            Share
          </LiquidButton>
        </div>
      </footer>
    </SafeScreen>
  );
}
export { ShareWorkout };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function WorkoutSummary({ workout }) {
  const { title, durationMin, totalVolumeKg, exercises = [] } = workout;
  return (
    <Glass tint="accent" radius="xl" style={{ padding: 16, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span
          aria-hidden
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(0,255,255,0.14)',
            border: '1px solid rgba(0,255,255,0.3)',
            color: 'hsl(var(--rd-accent))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <DumbbellIcon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))', fontWeight: 700 }}>
            Workout
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25, marginTop: 2, color: 'hsl(var(--rd-fg-primary))' }}>
            {title || 'Untitled session'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
        <Stat label="Exercises" value={exercises.length || 0} />
        <Stat label="Duration"  value={durationMin != null ? `${durationMin}` : '—'} unit={durationMin != null ? 'min' : ''} />
        <Stat label="Volume"    value={totalVolumeKg != null ? formatBig(totalVolumeKg) : '—'} unit={totalVolumeKg != null ? 'kg' : ''} />
      </div>

      {exercises.length > 0 && (
        <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {exercises.slice(0, 5).map((ex, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'hsl(var(--rd-fg-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ex.name}
                </span>
                <span style={{ color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 10 }}>
                  {ex.sets}×{ex.reps}
                </span>
              </div>
            ))}
            {exercises.length > 5 && (
              <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
                +{exercises.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </Glass>
  );
}

function MissingWorkout() {
  return (
    <Glass radius="xl" style={{ padding: 16, marginTop: 4 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))' }}>
        Workout not found
      </div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 6, lineHeight: 1.5 }}>
        We couldn't find a session to share. Head back to your history and pick one.
      </div>
    </Glass>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div
      style={{
        padding: '8px 10px',
        borderRadius: 10,
        background: 'rgba(0,0,0,0.18)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'hsl(var(--rd-fg-primary))', marginTop: 2 }}>
        {value}
        {unit && <span style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function VisibilityRow({ Icon, label, sub, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: selected
          ? 'linear-gradient(180deg, rgba(0,255,255,0.14) 0%, rgba(0,255,255,0.06) 100%)'
          : 'rgba(255,255,255,0.04)',
        border: selected ? '1px solid rgba(0,255,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
        color: 'inherit',
        transition: 'background 180ms, border-color 180ms',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: selected ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.06)',
          color: selected ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>{sub}</span>
      </span>
      <span
        aria-hidden
        style={{
          width: 20, height: 20, borderRadius: 9999,
          border: selected ? '1px solid hsl(var(--rd-accent))' : '1px solid rgba(255,255,255,0.24)',
          background: selected ? 'hsl(var(--rd-accent))' : 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8.5L6.5 12L13 4.5" stroke="hsl(var(--rd-fg-on-accent))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ marginTop: 22, marginBottom: 8, paddingInline: 2 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
        {children}
      </div>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: 9999,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <ChevronLeftIcon size={18} />
    </button>
  );
}

function formatBig(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * ShareWorkoutRoute — reads `?workoutId=<id>` from the URL. Until the workout
 * service is wired, we always pass `workout=null` — the UI shows an honest
 * "Workout not found" message. Backend-pending:
 *   - workoutService.getSession(id) to hydrate the summary
 *   - POST /feed_items when `onShare` fires
 */
export function ShareWorkoutRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // eslint-disable-next-line no-unused-vars -- will hydrate via workoutService once wired.
  const workoutId = params.get('workoutId');

  // TODO: fetch the workout from workoutService.getSession(workoutId)
  // For MVP we deliberately pass null so we don't fabricate a summary.
  const workout = null;

  return (
    <ShareWorkout
      workout={workout}
      onCancel={() => navigate(-1)}
      onShare={() => {
        // TODO: POST to supabase `feed_items` (edge fn `social-feed-post`)
        toast.success('Workout shared');
        navigate(-1);
      }}
    />
  );
}
