/**
 * BodyOverview — /app/body (v2 redesign, editorial).
 *
 * Previous version was a dashboard: hero card + 2-up grid + horizontal strip +
 * list + CTAs. Felt generic/boring. This version is editorial:
 *
 *  1. Big editorial headline as typographic hero ("Down 2.5kg. 28 days strong.")
 *  2. Centered body silhouette with measurement labels radiating out (anatomical)
 *  3. Big weight number + full-width trend chart below, with narrative subtitle
 *  4. Photos timeline — visual 3-tile carousel, the latest highlighted
 *  5. Weekly check-in nudge card (only if it's been 7+ days)
 *  6. Floating action bar at bottom: Weight · Check in · Photo
 *
 * Density is intentional but the hierarchy is tall > short > visual > compact.
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  RulerIcon,
  ChartIcon,
  CameraIcon as CameraLineIcon,
  CompareIcon,
} from '../lib/icons';

/**
 * CRITICAL RULE: this screen never fabricates body data. Weight, trend,
 * composition, measurements — all come from real services. If nothing is
 * logged, we show empty states, not invented progress.
 */
export default function BodyOverview({
  currentWeight = null,        // number | null
  weightUnit = 'kg',
  targetWeight = null,         // number | null
  weightTrend = null,          // number[] | null  (never default to fake values)
  bodyFatPct = null,
  leanMassKg = null,
  measurements = null,         // { chest, waist, leftArm, rightArm, leftThigh, rightThigh } | null
  photos = [],
  daysSinceCheckin = null,
  onLogWeight,
  onCheckIn,
  onTakePhoto,
  onOpenPhotos,
  onOpenMeasurements,
  onOpenComposition,
  onOpenCompare,
}) {
  const hasTrend = Array.isArray(weightTrend) && weightTrend.length >= 2 && typeof currentWeight === 'number';
  const deltaAbs = hasTrend ? currentWeight - weightTrend[0] : 0;
  const deltaSign = deltaAbs < 0 ? '−' : deltaAbs > 0 ? '+' : '';
  const deltaWord = deltaAbs < 0 ? 'Down' : deltaAbs > 0 ? 'Up' : 'Steady';
  const daysCount = hasTrend ? weightTrend.length : 0;
  const towardTarget =
    hasTrend &&
    targetWeight != null &&
    ((targetWeight < weightTrend[0] && deltaAbs < 0) ||
      (targetWeight > weightTrend[0] && deltaAbs > 0));

  return (
    <SafeScreen hasTopBar hasBottomNav hasFab paddingX={20}>
      {/* Bottom padding accounts for floating action bar (~76px) + bottom nav (64px)
          + breathing room so last content ("Body fat" row) clears the FAB. */}
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 180 }}>

        {/* ── 1. Editorial headline ──────────────────────────────────
            Only shows real delta when we have a real weight trend.
            Otherwise a friendly inviting headline. */}
        <SpringReveal delay={20}>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.02,
            }}
          >
            {hasTrend ? (
              <>
                {deltaWord}{' '}
                <span style={{ color: towardTarget ? 'hsl(var(--rd-health-excellent))' : deltaAbs === 0 ? 'hsl(var(--rd-fg-muted))' : '#FB7185' }}>
                  {deltaSign}{Math.abs(deltaAbs).toFixed(1)}{weightUnit}.
                </span>
                <br />
                <span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
                  {daysCount} days.
                </span>
              </>
            ) : (
              <>
                Your body.
                <br />
                <span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
                  Log your first weight.
                </span>
              </>
            )}
          </h1>
        </SpringReveal>

        {/* ── 2. Silhouette + measurements ───────────────────────── */}
        <SpringReveal delay={80}>
          <button
            type="button"
            onClick={onOpenMeasurements}
            style={{
              width: '100%',
              marginTop: 24,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Open measurements"
          >
            <SilhouettePanel
              measurements={measurements || {}}
              bodyFatPct={bodyFatPct}
              leanMassKg={leanMassKg}
              weightKg={currentWeight}
              unit="cm"
            />
          </button>
        </SpringReveal>

        {/* ── 2b. Quick-access tiles ─────────────────────────────────
            Obvious discoverability shortcut into the deep body screens.
            Every tile routes to a real v2 screen (Measurements,
            BodyCompositionHistory, ProgressPhotos, ProgressComparison).
            Free-tier — no Pro gating here. */}
        <SpringReveal delay={120}>
          <div
            style={{
              marginTop: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 8,
            }}
          >
            <QuickTile
              icon={<RulerIcon size={18} />}
              label="Measure"
              onClick={onOpenMeasurements}
            />
            <QuickTile
              icon={<ChartIcon size={18} />}
              label="History"
              onClick={onOpenComposition}
            />
            <QuickTile
              icon={<CameraLineIcon size={18} />}
              label="Photos"
              onClick={onOpenPhotos}
            />
            <QuickTile
              icon={<CompareIcon size={18} />}
              label="Compare"
              onClick={onOpenCompare}
            />
          </div>
        </SpringReveal>

        {/* ── 3. Weight + trend ──────────────────────────────────── */}
        <SpringReveal delay={160}>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 2 }}>
                  Weight · today
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: currentWeight != null ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))' }}>
                    {currentWeight != null ? currentWeight.toFixed(1) : '—'}
                  </span>
                  <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
                    {weightUnit}
                  </span>
                </div>
              </div>
              {targetWeight != null && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                    Target
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 2 }}>
                    {targetWeight.toFixed(1)}{' '}
                    <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>{weightUnit}</span>
                  </div>
                </div>
              )}
            </div>
            {hasTrend ? (
              <div style={{ height: 80 }}>
                <TrendChart data={weightTrend} target={targetWeight} />
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', padding: '14px 0', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                No weight history yet. Tap <strong style={{ color: 'hsl(var(--rd-accent))' }}>Weight</strong> below to log your first.
              </div>
            )}
          </div>
        </SpringReveal>

        {/* ── 4. Composition — 2 flat rows, no cards ─────────────── */}
        <SpringReveal delay={220}>
          <div style={{ marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <CompositionRow label="Body fat" value={bodyFatPct != null ? `${bodyFatPct.toFixed(1)}%` : null} hint="7-day avg" />
            <CompositionRow label="Lean mass" value={leanMassKg != null ? `${leanMassKg.toFixed(1)} ${weightUnit}` : null} hint="Last scan" />
          </div>
        </SpringReveal>

        {/* ── 5. Photos timeline ─────────────────────────────────── */}
        <SpringReveal delay={280}>
          <div style={{ marginTop: 28 }}>
            <SectionHeader title="Progress photos" actionLabel="Open gallery" onAction={onOpenPhotos} />
            <PhotosStrip photos={photos} onTakePhoto={onTakePhoto} />
          </div>
        </SpringReveal>

        {/* ── 6. Check-in nudge (only when stale and we actually know) ─ */}
        {typeof daysSinceCheckin === 'number' && daysSinceCheckin >= 7 && (
          <SpringReveal delay={340}>
            <Glass tint="ai" radius="xl" style={{ padding: 16, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  aria-hidden
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(139,92,246,0.24)',
                    border: '1px solid rgba(139,92,246,0.5)',
                    color: '#A78BFA',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v6l3.5 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }}>
                    Time for a check-in
                  </div>
                  <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
                    {daysSinceCheckin} days since the last · 30 seconds.
                  </div>
                </div>
                <LiquidButton intent="ai" size="sm" onClick={onCheckIn}>
                  Check in
                </LiquidButton>
              </div>
            </Glass>
          </SpringReveal>
        )}
      </div>

      {/* ── Floating action bar ────────────────────────────────── */}
      <FloatingActions
        onLogWeight={onLogWeight}
        onTakePhoto={onTakePhoto}
        onCheckIn={onCheckIn}
      />
    </SafeScreen>
  );
}
export { BodyOverview };

/* ─── Adaptive silhouette ───────────────────────────────────────────────
   Shape scales with the user's real composition:
     - muscle  (leanMass or arm/thigh circumference) → wider shoulders, bigger arms/thighs
     - fat     (bodyFatPct or waist circumference)   → wider waist, softer torso curve
   Default is a light bodybuilder (muscle≈0.6, fat≈0.25) so day-one users see a
   figure that looks aspirational, not like a stick.  When the user logs real
   data the shape morphs smoothly. */
function SilhouettePanel({ measurements, bodyFatPct, leanMassKg, weightKg, unit }) {
  // muscle + fat factors both in [0..1]
  const { muscle, fat } = deriveBodyShape({ measurements, bodyFatPct, leanMassKg, weightKg });

  // Geometry derived from factors
  const shoulderOffset = 10 + muscle * 10;   // 10..20px wider beyond base
  const armThick       = 6  + muscle * 6;
  const thighThick     = 12 + muscle * 6;
  const waistPinch     = 14 - fat * 10;      // wider waist = less pinch
  const torsoBulge     = 2  + fat * 6;

  // Path coordinates (base 120x260 viewBox)
  const cx = 60;
  const shoulderX_L = cx - 20 - shoulderOffset;
  const shoulderX_R = cx + 20 + shoulderOffset;
  const waistX_L    = cx - waistPinch;
  const waistX_R    = cx + waistPinch;
  const hipX_L      = cx - 22 - fat * 4;
  const hipX_R      = cx + 22 + fat * 4;

  const torso = `
    M ${shoulderX_L} 52
    C ${shoulderX_L - torsoBulge} 80, ${waistX_L - 2} 110, ${waistX_L} 130
    C ${waistX_L + 2} 145, ${hipX_L - 2} 155, ${hipX_L} 162
    L ${hipX_R} 162
    C ${hipX_R + 2} 155, ${waistX_R - 2} 145, ${waistX_R} 130
    C ${waistX_R + 2} 110, ${shoulderX_R + torsoBulge} 80, ${shoulderX_R} 52
    Z`;

  const leftArm = `
    M ${shoulderX_L} 58
    C ${shoulderX_L - armThick - 2} 78, ${shoulderX_L - armThick} 110, ${shoulderX_L - armThick + 2} 130
    L ${shoulderX_L - 1} 130
    C ${shoulderX_L - 2} 110, ${shoulderX_L + 1} 84, ${shoulderX_L + armThick - 4} 70 Z`;
  const rightArm = `
    M ${shoulderX_R} 58
    C ${shoulderX_R + armThick + 2} 78, ${shoulderX_R + armThick} 110, ${shoulderX_R + armThick - 2} 130
    L ${shoulderX_R + 1} 130
    C ${shoulderX_R + 2} 110, ${shoulderX_R - 1} 84, ${shoulderX_R - armThick + 4} 70 Z`;
  const leftLeg = `
    M ${hipX_L} 162
    L ${hipX_L - 2} 248
    L ${hipX_L + thighThick - 2} 248
    L ${hipX_L + thighThick + 2} 172 Z`;
  const rightLeg = `
    M ${hipX_R} 162
    L ${hipX_R + 2} 248
    L ${hipX_R - thighThick + 2} 248
    L ${hipX_R - thighThick - 2} 172 Z`;

  const strokeC = 'rgba(255,255,255,0.28)';
  const fillC   = 'rgba(0,255,255,0.04)';

  return (
    <div
      style={{
        position: 'relative',
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(50% 60% at 50% 50%, rgba(0,255,255,0.06) 0%, transparent 70%)',
      }}
    >
      <svg width="160" height="260" viewBox="0 0 120 260" fill="none" aria-hidden>
        {/* Head */}
        <circle cx="60" cy="22" r="16" stroke={strokeC} strokeWidth="1.5" fill={fillC} />
        {/* Neck */}
        <path d={`M ${cx - 5} 38 Q ${cx} 46 ${cx + 5} 38`} stroke={strokeC} strokeWidth="1.5" fill={fillC} />
        {/* Torso */}
        <path d={torso} stroke={strokeC} strokeWidth="1.5" fill={fillC} />
        {/* Arms */}
        <path d={leftArm}  stroke={strokeC} strokeWidth="1.5" fill={fillC} />
        <path d={rightArm} stroke={strokeC} strokeWidth="1.5" fill={fillC} />
        {/* Legs */}
        <path d={leftLeg}  stroke={strokeC} strokeWidth="1.5" fill={fillC} />
        <path d={rightLeg} stroke={strokeC} strokeWidth="1.5" fill={fillC} />

        {/* Tick marks at key measurement points — only faintly cyan */}
        <line x1={shoulderX_L - 4} y1="68"  x2={shoulderX_R + 4} y2="68"  stroke="hsl(var(--rd-accent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
        <line x1={waistX_L - 4}    y1="128" x2={waistX_R + 4}    y2="128" stroke="hsl(var(--rd-accent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
        <line x1={shoulderX_L - armThick - 4} y1="100" x2={shoulderX_L - armThick + 6} y2="100" stroke="hsl(var(--rd-accent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
        <line x1={shoulderX_R + armThick - 6} y1="100" x2={shoulderX_R + armThick + 4} y2="100" stroke="hsl(var(--rd-accent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
        <line x1={hipX_L + thighThick - 6} y1="200" x2={hipX_L - 6} y2="200" stroke="hsl(var(--rd-accent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
        <line x1={hipX_R + 6} y1="200" x2={hipX_R - thighThick + 6} y2="200" stroke="hsl(var(--rd-accent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
      </svg>

      {/* Floating labels */}
      <MeasurementLabel label="L arm"   value={measurements.leftArm}    unit={unit} top={60}  side="left"  />
      <MeasurementLabel label="Chest"   value={measurements.chest}      unit={unit} top={60}  side="right" />
      <MeasurementLabel label="Waist"   value={measurements.waist}      unit={unit} top={140} side="left"  />
      <MeasurementLabel label="R arm"   value={measurements.rightArm}   unit={unit} top={140} side="right" />
      <MeasurementLabel label="L thigh" value={measurements.leftThigh}  unit={unit} top={210} side="left"  />
      <MeasurementLabel label="R thigh" value={measurements.rightThigh} unit={unit} top={210} side="right" />
    </div>
  );
}

/**
 * deriveBodyShape — returns { muscle, fat } in [0..1] for the silhouette.
 *
 * Hierarchy of signals (first available wins):
 *  1. Real circumferences (arms, waist, thighs)
 *  2. leanMassKg + bodyFatPct
 *  3. bodyFatPct alone
 *  4. Nothing → default "light bodybuilder" (0.6 muscle, 0.25 fat)
 */
function deriveBodyShape({ measurements, bodyFatPct, leanMassKg, weightKg }) {
  const DEFAULT = { muscle: 0.6, fat: 0.25 };
  const m = measurements || {};

  // Signal 1: circumferences
  const armAvg = (m.leftArm != null && m.rightArm != null) ? (m.leftArm + m.rightArm) / 2 : m.leftArm || m.rightArm;
  const thighAvg = (m.leftThigh != null && m.rightThigh != null) ? (m.leftThigh + m.rightThigh) / 2 : m.leftThigh || m.rightThigh;

  let muscle = null, fat = null;
  if (armAvg != null) muscle = clamp01((armAvg - 28) / (48 - 28));           // 28cm → 0, 48cm → 1
  else if (thighAvg != null) muscle = clamp01((thighAvg - 45) / (75 - 45));
  else if (leanMassKg != null) muscle = clamp01((leanMassKg - 45) / (80 - 45));

  if (m.waist != null && weightKg != null) {
    // waist-to-height-ish proxy: higher waist at same weight = more fat
    fat = clamp01((m.waist - 70) / (110 - 70));
  } else if (bodyFatPct != null) {
    fat = clamp01((bodyFatPct - 8) / (35 - 8));
  }

  if (muscle == null && fat == null) return DEFAULT;
  return {
    muscle: muscle != null ? muscle : DEFAULT.muscle,
    fat:    fat    != null ? fat    : DEFAULT.fat,
  };
}
function clamp01(n) { return Math.max(0, Math.min(1, n)); }

function MeasurementLabel({ label, value, unit, top, side }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        [side]: 0,
        transform: 'translateY(-50%)',
        padding: '4px 8px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        textAlign: side === 'left' ? 'left' : 'right',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, lineHeight: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: value != null ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1 }}>
        {value != null ? `${Number(value).toFixed(0)}` : '—'}
        <span style={{ fontSize: 9, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── Composition flat row ──────────────────────────────────────────────── */

function CompositionRow({ label, value, hint }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 2px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {hint}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: value ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))' }}>
        {value || '—'}
      </div>
    </div>
  );
}

/* ─── Photos strip ──────────────────────────────────────────────────────── */

function PhotosStrip({ photos, onTakePhoto }) {
  if (!photos || photos.length === 0) {
    return (
      <button
        type="button"
        onClick={onTakePhoto}
        style={{
          width: '100%',
          padding: 20,
          marginTop: 10,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.15)',
          color: 'hsl(var(--rd-fg-secondary))',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          textAlign: 'center',
        }}
      >
        <div aria-hidden style={{ fontSize: 30, marginBottom: 6 }}>📸</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', letterSpacing: '-0.01em' }}>
          First photo unlocks compare
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
          Same pose, same light, weekly.
        </div>
      </button>
    );
  }
  const latest = photos[0];
  const others = photos.slice(1, 3);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginTop: 10 }}>
      <PhotoTile photo={latest} big />
      {others.map((p) => <PhotoTile key={p.id} photo={p} />)}
      {/* Pad to 3 if only 1 extra */}
      {others.length < 2 && (
        <button
          type="button"
          onClick={onTakePhoto}
          style={{
            aspectRatio: '3 / 4',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)',
            color: 'hsl(var(--rd-fg-muted))',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 20,
          }}
          aria-label="Take photo"
        >
          +
        </button>
      )}
    </div>
  );
}

function PhotoTile({ photo, big }) {
  return (
    <div
      style={{
        aspectRatio: big ? '3 / 4' : '3 / 4',
        borderRadius: big ? 16 : 12,
        background: photo.thumbColor || 'linear-gradient(135deg, #1a0e2e, #0e1a2e)',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', fontWeight: 600 }}>
        {formatDate(photo.date)}
      </div>
    </div>
  );
}

/* ─── Trend chart ───────────────────────────────────────────────────────── */

function TrendChart({ data, target }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data, target ?? Infinity);
  const max = Math.max(...data, target ?? -Infinity);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  });
  const areaPath = `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
  const linePath = `M ${points.join(' L ')}`;
  const targetY = target != null ? 100 - ((target - min) / range) * 100 : null;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} aria-hidden>
      <defs>
        <linearGradient id="bodyTrend" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--rd-accent))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--rd-accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {targetY != null && (
        <line x1="0" x2="100" y1={targetY} y2={targetY} stroke="hsl(var(--rd-health-excellent))" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" vectorEffect="non-scaling-stroke" />
      )}
      <path d={areaPath} fill="url(#bodyTrend)" />
      <path d={linePath} fill="none" stroke="hsl(var(--rd-accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ─── Section header + floating actions + helpers ───────────────────────── */

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingInline: 2 }}>
      <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
        {title}
      </h2>
      {actionLabel && (
        <button type="button" onClick={onAction} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function FloatingActions({ onLogWeight, onTakePhoto, onCheckIn }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0, right: 0,
        bottom: 'calc(64px + env(safe-area-inset-bottom) + 10px)',
        zIndex: 44,
        padding: '0 max(16px, env(safe-area-inset-left))',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 560, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          pointerEvents: 'auto',
          padding: 6,
          borderRadius: 18,
          background: 'rgba(10,14,20,0.68)',
          backdropFilter: 'blur(22px) saturate(1.7)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 32px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <FabCell icon={<ScaleIcon />} label="Weight"  onClick={onLogWeight} primary />
        <FabCell icon={<PulseIcon />} label="Check-in" onClick={onCheckIn} />
        <FabCell icon={<CamIcon />}   label="Photo"   onClick={onTakePhoto} />
      </div>
    </div>
  );
}

function FabCell({ icon, label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 52,
        borderRadius: 14,
        background: primary
          ? 'linear-gradient(180deg, rgba(0,255,255,0.98), rgba(0,210,210,0.92))'
          : 'rgba(255,255,255,0.04)',
        border: primary ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
        color: primary ? 'hsl(var(--rd-fg-on-accent))' : 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em' }}>{label}</span>
    </button>
  );
}

/* ─── QuickTile (Measure / History / Photos / Compare row) ────────────── */
function QuickTile({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 72,
        padding: '10px 8px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1), background 200ms, border-color 200ms',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(0,255,255,0.08)',
          color: 'hsl(var(--rd-accent))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em' }}>{label}</span>
    </button>
  );
}

const st = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function ScaleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24"><rect {...st} x="3" y="6" width="18" height="14" rx="2" /><path {...st} d="M12 10v6M9 13h6" /></svg>; }
function PulseIcon() { return <svg width="18" height="18" viewBox="0 0 24 24"><path {...st} d="M3 12h4l2 6 4-12 2 6h6" /></svg>; }
function CamIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24"><rect {...st} x="3" y="6" width="18" height="14" rx="2.5" /><circle {...st} cx="12" cy="13" r="3.5" /><path {...st} d="M8 6l1.5-2h5L16 6" /></svg>; }

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
