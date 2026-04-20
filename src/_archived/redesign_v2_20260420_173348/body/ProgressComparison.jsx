/**
 * ProgressComparison — /app/body/compare
 *
 * Side-by-side before/after. Two columns, each with its own date picker.
 * Stats overlay: weight delta, composition delta, days between photos.
 *
 * NOT Pro-gated — body tracking is core free-tier. Free users can compare
 * their own photos.
 *
 * TRUST RULE: never fabricates photos. If the user has <2 photos, we show
 * an honest empty state directing them to upload more.
 *
 * TODO (backend): the `progress_photos` table already exists in spirit
 * (used by ProgressPhotos.jsx); this screen only reads from it. Wanted
 * schema:
 *   id uuid PK
 *   user_id uuid FK
 *   captured_at timestamptz
 *   pose text check (pose in ('front','side','back'))
 *   image_url text
 *   weight_kg numeric null
 *   body_fat_pct numeric null
 *   created_at timestamptz default now()
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  SafeScreen,
  Glass,
  LiquidButton,
  SpringReveal,
} from '../lib/glass';
import {
  XIcon,
  CalendarIcon,
  ShareIcon,
  CompareIcon,
  CameraIcon,
} from '../lib/icons';

/**
 * ProgressComparison — presentational.
 *
 * Props:
 *  - photos: Array<{ id, date, thumbColor?, imageUrl?, weight?, bodyFatPct?, pose? }>
 *  - weightUnit: 'kg' | 'lb'
 *  - onClose, onShare, onUploadPhoto
 */
export default function ProgressComparison({
  photos = [],
  weightUnit = 'kg',
  onClose,
  onShare,
  onUploadPhoto,
}) {
  // Sort once, oldest first for easier UI logic.
  const sorted = useMemo(() => {
    const copy = [...photos];
    copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    return copy;
  }, [photos]);

  const canCompare = sorted.length >= 2;

  // Defaults: earliest for left, latest for right.
  const [leftId, setLeftId] = useState(() => (canCompare ? sorted[0].id : null));
  const [rightId, setRightId] = useState(() => (canCompare ? sorted[sorted.length - 1].id : null));

  const left = sorted.find((p) => p.id === leftId) || null;
  const right = sorted.find((p) => p.id === rightId) || null;

  const weightDelta = left?.weight != null && right?.weight != null ? right.weight - left.weight : null;
  const bfDelta = left?.bodyFatPct != null && right?.bodyFatPct != null ? right.bodyFatPct - left.bodyFatPct : null;
  const daysBetween = left?.date && right?.date
    ? Math.abs(Math.round((new Date(right.date) - new Date(left.date)) / 86400000))
    : null;

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}>
      {/* Top bar — close + title */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 45,
          paddingTop: 'env(safe-area-inset-top)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.86) 0%, rgba(5,7,10,0.6) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(18px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
        }}
      >
        <div
          style={{
            height: 56,
            maxWidth: 640, margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '44px 1fr 44px',
            alignItems: 'center',
            padding: '0 max(12px, env(safe-area-inset-left))',
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: 'rgba(10,14,20,0.55)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <XIcon size={16} />
          </button>
          <span style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Compare
          </span>
          <span />
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 'calc(env(safe-area-inset-top) + 72px)' }}>
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
            Body · progress
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Before · After
          </h1>
        </SpringReveal>

        {!canCompare ? (
          /* Empty state */
          <SpringReveal delay={80}>
            <Glass radius="xl" style={{ padding: 24, marginTop: 24, textAlign: 'center' }}>
              <span
                aria-hidden
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(0,255,255,0.10)',
                  color: 'hsl(var(--rd-accent))',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <CompareIcon size={22} />
              </span>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
                {sorted.length === 0 ? 'No photos yet' : 'One photo down'}
              </div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, marginBottom: 16, maxWidth: 340, marginInline: 'auto' }}>
                Upload at least 2 progress photos to compare. Same pose, same lighting, a week or two apart.
              </div>
              <LiquidButton intent="primary" size="md" leftIcon={<CameraIcon size={16} />} onClick={onUploadPhoto}>
                {sorted.length === 0 ? 'Upload first photo' : 'Upload another'}
              </LiquidButton>
            </Glass>
          </SpringReveal>
        ) : (
          <>
            {/* Two photos side by side */}
            <SpringReveal delay={80}>
              <div
                style={{
                  marginTop: 20,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <PhotoColumn
                  label="Before"
                  photo={left}
                  photos={sorted}
                  selectedId={leftId}
                  onSelect={setLeftId}
                  weightUnit={weightUnit}
                />
                <PhotoColumn
                  label="After"
                  photo={right}
                  photos={sorted}
                  selectedId={rightId}
                  onSelect={setRightId}
                  weightUnit={weightUnit}
                  accent
                />
              </div>
            </SpringReveal>

            {/* Stats overlay */}
            <SpringReveal delay={140}>
              <Glass tint="accent" radius="xl" style={{ marginTop: 16, padding: 16 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  <StatBlock
                    label="Weight"
                    value={weightDelta != null ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} ${weightUnit}` : '—'}
                    tone={weightDelta == null ? 'muted' : weightDelta < 0 ? 'good' : weightDelta > 0 ? 'warn' : 'muted'}
                  />
                  <StatBlock
                    label="Body fat"
                    value={bfDelta != null ? `${bfDelta > 0 ? '+' : ''}${bfDelta.toFixed(1)}%` : '—'}
                    tone={bfDelta == null ? 'muted' : bfDelta < 0 ? 'good' : bfDelta > 0 ? 'warn' : 'muted'}
                  />
                  <StatBlock
                    label="Time"
                    value={daysBetween != null ? `${daysBetween} day${daysBetween === 1 ? '' : 's'}` : '—'}
                  />
                </div>
              </Glass>
            </SpringReveal>

            {/* Share */}
            <SpringReveal delay={180}>
              <div style={{ marginTop: 20 }}>
                <LiquidButton
                  intent="neutral"
                  size="lg"
                  block
                  leftIcon={<ShareIcon size={16} />}
                  onClick={() => {
                    // TODO: generate a shareable image + open share sheet.
                    if (onShare) onShare({ left, right });
                    else toast('Share coming soon', { description: 'We are wiring this up next session.' });
                  }}
                >
                  Share this comparison
                </LiquidButton>
              </div>
            </SpringReveal>
          </>
        )}
      </div>
    </SafeScreen>
  );
}

export { ProgressComparison };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function PhotoColumn({ label, photo, photos, selectedId, onSelect, weightUnit, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: accent ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))',
          fontWeight: 700,
          paddingInline: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 4',
          borderRadius: 16,
          overflow: 'hidden',
          border: accent ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
          background: photo?.thumbColor || (photo?.imageUrl
            ? `center / cover no-repeat url(${photo.imageUrl})`
            : 'linear-gradient(135deg, #1a0e2e, #0e1a2e)'),
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em', fontWeight: 600 }}>
            {photo?.date ? formatDate(photo.date) : '—'}
          </div>
          {photo?.weight != null && (
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {photo.weight.toFixed(1)} {weightUnit}
              {photo.bodyFatPct != null && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginLeft: 6 }}>
                  · {photo.bodyFatPct.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date picker — selects which of the user's photos occupies this column. */}
      <div style={{ position: 'relative' }}>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'hsl(var(--rd-fg-muted))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <CalendarIcon size={14} />
        </span>
        <select
          value={selectedId || ''}
          onChange={(e) => onSelect(e.target.value)}
          aria-label={`${label} photo date`}
          style={{
            width: '100%',
            height: 40,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'hsl(var(--rd-fg-primary))',
            padding: '0 10px 0 30px',
            fontSize: 13, fontWeight: 600,
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            colorScheme: 'dark',
          }}
        >
          {photos.map((p) => (
            <option key={p.id} value={p.id} style={{ background: '#0a0e14', color: '#fff' }}>
              {formatDate(p.date)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StatBlock({ label, value, tone = 'default' }) {
  const color = tone === 'good' ? '#34D399' : tone === 'warn' ? '#FBBF24' : tone === 'muted' ? 'hsl(var(--rd-fg-muted))' : 'hsl(var(--rd-fg-primary))';
  return (
    <div style={{ textAlign: 'center', padding: '4px 2px' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color }}>
        {value}
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function ProgressComparisonRoute() {
  // MVP: empty photos = honest empty state. Wire to progressPhotosService later.
  const photos = [];

  return (
    <ProgressComparison
      photos={photos}
      weightUnit="kg"
      onClose={() => window.history.back()}
      onUploadPhoto={() => window.location.assign('/app/body/progress/photos')}
      onShare={null}
    />
  );
}
