/**
 * ProgressPhotos — grid of progress photos with before/after slider.
 * Ref: Macrofactor photos + Apple Photos picker + FitMe comparison.
 *
 * Layout:
 *  - Top: before/after comparison (two photos side-by-side, draggable divider)
 *  - Grid: timeline of checkpoints (4 per row), each card = date + thumb + weight
 *  - FAB: + Take new photo
 *  - Pose selector (front / side / back) tabs
 */
import React, { useMemo, useRef, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { CompareIcon } from '../lib/icons';

const POSES = ['Front', 'Side', 'Back'];

/**
 * CRITICAL: `photos` always comes from the real user archive. Never defaults
 * to fabricated before/after examples — implying a fake weight journey is a
 * trust-breaker.
 */
export default function ProgressPhotos({
  photos = [],
  weightUnit = 'kg',
  onTakePhoto,
  onOpenPhoto,
  onClose,
  onCompare,
}) {
  const [pose, setPose] = useState('Front');
  const [divider, setDivider] = useState(0.5);
  const dragRef = useRef(null);

  const filtered = useMemo(() => photos.filter((p) => p.pose === pose), [photos, pose]);
  const latest = filtered[0];
  const oldest = filtered[filtered.length - 1];

  const onDragStart = (e) => {
    e.preventDefault();
    const el = dragRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const move = (evt) => {
      const x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      setDivider(pct);
    };
    const end = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchend', end);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
  };

  return (
    <SafeScreen hasTopBar hasBottomNav hasFab paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Eyebrow + top-right Compare button */}
        <SpringReveal delay={20}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
                Body
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                Progress photos
              </h1>
            </div>
            {/* Discoverability: jumps to /app/body/compare. Free-tier. */}
            <LiquidButton
              intent="neutral"
              size="sm"
              leftIcon={<CompareIcon size={14} />}
              onClick={onCompare}
            >
              Compare
            </LiquidButton>
          </div>
        </SpringReveal>

        {/* Pose tabs */}
        <SpringReveal delay={60}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              padding: 4,
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {POSES.map((p) => {
              const active = pose === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPose(p)}
                  style={{
                    height: 36, borderRadius: 9999, border: 'none',
                    background: active ? 'rgba(0,255,255,0.14)' : 'transparent',
                    color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
                    fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </SpringReveal>

        {/* Comparison */}
        {filtered.length >= 2 ? (
          <SpringReveal delay={120}>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                  Before · {formatDate(oldest.date)}
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))', fontWeight: 700 }}>
                  After · {formatDate(latest.date)}
                </div>
              </div>
              <div
                ref={dragRef}
                style={{
                  position: 'relative',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  aspectRatio: '3 / 4',
                  background: oldest.thumbColor,
                  userSelect: 'none',
                  cursor: 'ew-resize',
                }}
                onMouseDown={onDragStart}
                onTouchStart={onDragStart}
              >
                {/* Latest overlays the oldest, clipped by divider */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    background: latest.thumbColor,
                    clipPath: `inset(0 ${(1 - divider) * 100}% 0 0)`,
                  }}
                  aria-label={`After photo from ${latest.date}`}
                />
                {/* Divider */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 0, bottom: 0,
                    left: `${divider * 100}%`,
                    transform: 'translateX(-50%)',
                    width: 3,
                    background: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 0 12px rgba(0,0,0,0.5)',
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${divider * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 40, height: 40,
                    borderRadius: 9999,
                    background: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 6L2 12l6 6M16 6l6 6-6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {/* Labels */}
                <div style={{ position: 'absolute', bottom: 12, left: 12, padding: '4px 10px', borderRadius: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {oldest.weight.toFixed(1)} {weightUnit}
                </div>
                <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 10px', borderRadius: 9999, background: 'rgba(0,255,255,0.25)', border: '1px solid rgba(0,255,255,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {latest.weight.toFixed(1)} {weightUnit}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', textAlign: 'center', marginTop: 8 }}>
                {(latest.weight - oldest.weight).toFixed(1)} {weightUnit} in {daysBetween(oldest.date, latest.date)} days · drag to compare
              </div>
            </div>
          </SpringReveal>
        ) : (
          <SpringReveal delay={120}>
            <Glass radius="xl" style={{ padding: 20, marginTop: 14, textAlign: 'center' }}>
              <div aria-hidden style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
                First photo unlocks compare
              </div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.45, marginBottom: 14 }}>
                Same pose, same lighting, weekly. The slider is worth every pixel.
              </div>
              <LiquidButton intent="primary" size="md" onClick={onTakePhoto}>📸 Take photo</LiquidButton>
            </Glass>
          </SpringReveal>
        )}

        {/* Timeline grid */}
        <SpringReveal delay={180}>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
                Timeline · {filtered.length}
              </h2>
              <button
                type="button"
                onClick={onTakePhoto}
                style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                + New
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
              {filtered.map((p) => (
                <PhotoTile key={p.id} photo={p} weightUnit={weightUnit} onClick={() => onOpenPhoto?.(p.id)} />
              ))}
            </div>
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { ProgressPhotos };

function PhotoTile({ photo, weightUnit, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        aspectRatio: '3 / 4',
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        background: photo.thumbColor,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 0,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8, textAlign: 'left' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', fontWeight: 600 }}>
          {formatDate(photo.date)}
        </div>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {photo.weight.toFixed(1)} {weightUnit}
        </div>
      </div>
    </button>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}
