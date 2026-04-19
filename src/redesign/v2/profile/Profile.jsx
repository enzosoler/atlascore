/**
 * Profile — /app/profile. v2 editorial/dense redesign.
 * Ref: Strava profile + Whoop member card + Hevy profile + LinkedIn.
 *
 * Reads like a training "resume" for the user:
 *   1. Avatar hero with explicit "Add photo" CTA when empty
 *   2. Identity block (name + email + tier + location + joined)
 *   3. Physical snapshot (height · weight · age · body fat · lean mass)
 *   4. Primary goal card
 *   5. Training snapshot (4 mini-stats)
 *   6. Nutrition snapshot (4 mini-stats)
 *   7. Achievements grid (badges — empty placeholders until earned)
 *   8. 12-week activity heatmap (GitHub-style contribution grid)
 *   9. Connected integrations strip
 *  10. Edit profile · Share profile · Sign out
 *
 * RULE: every real-data section accepts null/empty and shows an honest hint.
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  FlameIcon, DumbbellIcon, ScaleIcon, PulseIcon, SparkleIcon,
  TargetIcon, TrophyIcon, CameraIcon, TrendUpIcon, UtensilsIcon,
  EditIcon,
} from '../lib/icons';

export default function Profile({
  user = null,            // { name, email, tier, avatar, bio, location, memberSince, coverUrl }
  physical = null,        // { heightCm, weightKg, ageYears, bodyFatPct, leanMassKg }
  goal = null,            // { primary, targetWeight, projectedDate }
  training = null,        // { totalSessions, currentStreak, longestStreak, totalVolumeKg, topPr }
  nutrition = null,       // { avgKcal, proteinAvg, avgWaterL, streakDays }
  achievements = [],      // [{ id, name, hint, earned }]
  activity = null,        // 84 booleans — last 12 weeks (7×12) OR null
  connections = null,     // { apple_health: true, whoop: false, ... }
  onEditProfile,
  onOpenSettings,
  onShareProfile,
  onSignOut,
  onPickAvatar,
  onOpenPublicProfile,   // /app/u/:username — user's public-facing view
  onOpenFriends,         // /app/social/friends
}) {
  const name = user?.name || '';
  const email = user?.email || '';
  const tier = user?.tier || 'Free';
  // Prefer explicit first/last name when present — matches what ProfileEditor
  // writes to user_metadata. Falls back to the name or the local-part of the
  // email so we never show a bogus "A" / "U" character.
  const first = (user?.firstName || '').trim();
  const last  = (user?.lastName  || '').trim();
  const initials = (() => {
    if (first || last) {
      return ((first[0] || '') + (last[0] || '')).toUpperCase() || (first[0] || '').toUpperCase();
    }
    const fallback = name || (email ? email.split('@')[0] : '');
    if (!fallback) return '·';
    const parts = fallback.split(/[\s._-]+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '·';
  })();
  const hasAvatar = !!(user?.avatar && typeof user.avatar === 'string' && user.avatar.trim());
  const memberSinceText = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 60 }}>

        {/* ── 1. Avatar hero ───────────────────────────────────────── */}
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <AvatarHero
              hasAvatar={hasAvatar}
              src={user?.avatar}
              initials={initials}
              onPick={onPickAvatar}
            />
          </div>
        </SpringReveal>

        {/* ── 2. Identity ──────────────────────────────────────────── */}
        <SpringReveal delay={60}>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {name || 'Set your name'}
              </h1>
              {tier && tier !== 'Free' && <TierChip tier={tier} />}
              <button
                type="button"
                onClick={onEditProfile}
                aria-label="Edit profile"
                style={{
                  width: 30, height: 30, borderRadius: 9999,
                  background: 'rgba(0,255,255,0.10)',
                  border: '1px solid rgba(0,255,255,0.3)',
                  color: 'hsl(var(--rd-accent))',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  marginLeft: 2,
                }}
              >
                <EditIcon size={14} />
              </button>
            </div>
            {email && (
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
                {email}
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 12, color: 'hsl(var(--rd-fg-muted))', display: 'inline-flex', gap: 10 }}>
              {user?.location && <span>{user.location}</span>}
              {memberSinceText && <span>· Joined {memberSinceText}</span>}
            </div>
          </div>
        </SpringReveal>

        {/* Bio */}
        {user?.bio && (
          <SpringReveal delay={100}>
            <p style={{ margin: '12px auto 0', maxWidth: 420, fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', textAlign: 'center', lineHeight: 1.5 }}>
              {user.bio}
            </p>
          </SpringReveal>
        )}

        {/* Quick actions */}
        <SpringReveal delay={140}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <LiquidButton intent="neutral" size="md" onClick={onEditProfile}>Edit profile</LiquidButton>
            <LiquidButton intent="neutral" size="md" onClick={onShareProfile}>Share</LiquidButton>
          </div>
        </SpringReveal>

        {/* Social entry points — main discoverability hook for the post-launch
            social domain. Two compact links: view-as-public + friends. */}
        <SpringReveal delay={160}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <SocialLink
              label="View public profile"
              sub="See what others see"
              onClick={onOpenPublicProfile}
            />
            <SocialLink
              label="Friends"
              sub="Activity feed · requests"
              onClick={onOpenFriends}
            />
          </div>
        </SpringReveal>

        {/* ── 3. Physical snapshot ─────────────────────────────────── */}
        <Section title="Physical" delay={180}>
          {physical ? (
            <Glass radius="xl" style={{ padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <Metric label="Height"    value={physical.heightCm != null ? `${physical.heightCm}` : null} unit="cm" />
                <Metric label="Weight"    value={physical.weightKg != null ? physical.weightKg.toFixed(1) : null} unit="kg" />
                <Metric label="Age"       value={physical.ageYears != null ? physical.ageYears : null} unit="yr" />
                <Metric label="Body fat"  value={physical.bodyFatPct != null ? physical.bodyFatPct.toFixed(1) : null} unit="%" />
                <Metric label="Lean mass" value={physical.leanMassKg != null ? physical.leanMassKg.toFixed(1) : null} unit="kg" />
              </div>
            </Glass>
          ) : <EmptyHint text="Add your height, weight, and age in Edit profile to personalize coaching." ctaLabel="Fill in" onCta={onEditProfile} />}
        </Section>

        {/* ── 4. Primary goal ──────────────────────────────────────── */}
        <Section title="Goal" delay={220}>
          {goal ? (
            <Glass tint="accent" radius="xl" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,255,255,0.14)', border: '1px solid rgba(0,255,255,0.3)', color: 'hsl(var(--rd-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TargetIcon size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))', fontWeight: 700 }}>
                    Primary goal
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25, marginTop: 2 }}>
                    {goal.primary || 'Set a goal'}
                  </div>
                  {goal.targetWeight != null && (
                    <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', marginTop: 4 }}>
                      Target: <strong style={{ color: 'hsl(var(--rd-fg-primary))', fontVariantNumeric: 'tabular-nums' }}>{goal.targetWeight.toFixed(1)} kg</strong>
                      {goal.projectedDate && (
                        <> · ETA {new Date(goal.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Glass>
          ) : <EmptyHint text="No goal set yet. Atlas uses your goal to tune macros and training load." ctaLabel="Choose a goal" onCta={onEditProfile} />}
        </Section>

        {/* ── 5. Training snapshot ─────────────────────────────────── */}
        <Section title="Training" delay={260}>
          <StatsGrid
            items={[
              { Icon: DumbbellIcon, label: 'Total sessions', value: training?.totalSessions, unit: '' },
              { Icon: FlameIcon,    label: 'Current streak', value: training?.currentStreak, unit: 'd', color: '#FBBF24' },
              { Icon: TrophyIcon,   label: 'Longest streak', value: training?.longestStreak, unit: 'd' },
              { Icon: TrendUpIcon,  label: 'Total volume',   value: training?.totalVolumeKg, unit: 'kg' },
            ]}
            emptyHint="Your first workout starts these numbers."
          />
          {training?.topPr && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'hsl(var(--rd-fg-muted))', paddingInline: 2 }}>
              Recent PR: <strong style={{ color: 'hsl(var(--rd-fg-primary))' }}>{training.topPr.exercise}</strong>{' '}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{training.topPr.weight}kg × {training.topPr.reps}</span>
            </div>
          )}
        </Section>

        {/* ── 6. Nutrition snapshot ────────────────────────────────── */}
        <Section title="Nutrition" delay={300}>
          <StatsGrid
            items={[
              { Icon: UtensilsIcon, label: 'Avg daily kcal', value: nutrition?.avgKcal, unit: '' },
              { Icon: PulseIcon,    label: 'Avg protein',    value: nutrition?.proteinAvg, unit: 'g' },
              { Icon: ScaleIcon,    label: 'Avg water',      value: nutrition?.avgWaterL, unit: 'L' },
              { Icon: FlameIcon,    label: 'Log streak',     value: nutrition?.streakDays, unit: 'd', color: '#FBBF24' },
            ]}
            emptyHint="Log your first meal to start averages."
          />
        </Section>

        {/* ── 7. Achievements ──────────────────────────────────────── */}
        <Section title="Achievements" delay={340}>
          <AchievementsGrid items={achievements} />
        </Section>

        {/* ── 8. Activity heatmap ──────────────────────────────────── */}
        <Section title="Last 12 weeks" delay={380}>
          <Heatmap data={activity} />
        </Section>

        {/* ── 9. Connected integrations ────────────────────────────── */}
        <Section title="Connected" delay={420} action={{ label: 'Manage', onClick: onOpenSettings }}>
          <ConnectionsStrip connections={connections} onManage={onOpenSettings} />
        </Section>

        {/* Sign out */}
        <SpringReveal delay={460}>
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              onClick={onSignOut}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 14,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#FB7185',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Sign out
            </button>
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { Profile };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function AvatarHero({ hasAvatar, src, initials, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={hasAvatar ? 'Change photo' : 'Add photo'}
      style={{
        position: 'relative',
        width: 120, height: 120, borderRadius: 9999, overflow: 'hidden',
        background: hasAvatar
          ? 'transparent'
          : 'linear-gradient(180deg, rgba(0,255,255,0.22), rgba(0,255,255,0.06))',
        border: '2px solid rgba(255,255,255,0.14)',
        color: 'hsl(var(--rd-fg-on-accent))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, fontWeight: 700, letterSpacing: '-0.01em',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {hasAvatar ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <span style={{ position: 'absolute', inset: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials}
          </span>
          {/* Empty state — dashed ring + "Add photo" label over */}
          <span
            aria-hidden
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 9999,
              border: '2px dashed rgba(0,255,255,0.5)',
            }}
          />
        </>
      )}
      {/* Edit/add badge — aligned to ~5 o'clock on the circle arc.
          Smaller + less-intense shadow so it reads as a UI affordance, not a
          blob hovering off the avatar. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 'calc(50% - 14px - 50% * 0.707)',   // center sits on circle edge at 45°
          bottom: 'calc(50% - 14px - 50% * 0.707)',
          width: 28, height: 28, borderRadius: 9999,
          background: 'hsl(var(--rd-accent))',
          color: '#05070A',
          border: '2px solid hsl(var(--rd-bg-app))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px -2px rgba(0,0,0,0.5)',
        }}
      >
        <CameraIcon size={14} />
      </span>
    </button>
  );
}

function SocialLink({ label, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 54,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))' }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
        {sub}
      </div>
    </button>
  );
}

function TierChip({ tier }) {
  const isPremium = tier === 'Premium' || tier === 'Pro' || tier === 'Coach' || tier === 'Admin';
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: 10,
        letterSpacing: '0.14em',
        fontWeight: 700,
        background: isPremium ? 'rgba(201,169,106,0.14)' : 'rgba(255,255,255,0.06)',
        border: isPremium ? '1px solid rgba(201,169,106,0.35)' : '1px solid rgba(255,255,255,0.14)',
        color: isPremium ? 'hsl(var(--rd-premium))' : 'hsl(var(--rd-fg-secondary))',
        textTransform: 'uppercase',
      }}
    >
      {tier}
    </span>
  );
}

function Section({ title, delay = 0, action, children }) {
  return (
    <SpringReveal delay={delay}>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingInline: 2 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
            {title}
          </div>
          {action && (
            <button type="button" onClick={action.onClick} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              {action.label}
            </button>
          )}
        </div>
        {children}
      </div>
    </SpringReveal>
  );
}

function Metric({ label, value, unit }) {
  const has = value !== null && value !== undefined && value !== '';
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: has ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1.1 }}>
        {has ? value : '—'}
        {has && unit && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function StatsGrid({ items, emptyHint }) {
  const anyReal = items.some((i) => i.value !== null && i.value !== undefined);
  if (!anyReal) return <EmptyHint text={emptyHint} />;
  return (
    <Glass radius="xl" style={{ padding: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {items.map((it, idx) => {
          const Icon = it.Icon;
          const has = it.value !== null && it.value !== undefined;
          const border = idx % 2 === 0 && idx < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none';
          const right = idx % 2 === 1 ? 'none' : '1px solid rgba(255,255,255,0.05)';
          return (
            <div
              key={it.label}
              style={{
                padding: 14,
                borderBottom: idx < items.length - 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                borderRight: idx % 2 === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: it.color || 'hsl(var(--rd-accent))' }}>
                <Icon size={14} />
                <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
                  {it.label}
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: has ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.1 }}>
                {has
                  ? (typeof it.value === 'number' ? formatBigNumber(it.value) : it.value)
                  : '—'}
                {has && it.unit && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{it.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
}

function AchievementsGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <EmptyHint text="Streaks, first PRs, and milestones appear here as you hit them." />
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
      {items.map((a) => (
        <div
          key={a.id}
          style={{
            aspectRatio: '1 / 1',
            borderRadius: 14,
            background: a.earned ? 'rgba(201,169,106,0.10)' : 'rgba(255,255,255,0.03)',
            border: a.earned ? '1px solid rgba(201,169,106,0.35)' : '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 6, textAlign: 'center', gap: 4,
            color: a.earned ? 'hsl(var(--rd-premium))' : 'hsl(var(--rd-fg-muted))',
          }}
          title={a.hint || a.name}
        >
          <TrophyIcon size={20} />
          <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.1 }}>{a.name}</span>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ data }) {
  // 12 columns × 7 rows = 84 days. Values: null (no data) | 0 (rest) | 1..3 (intensity)
  const weeks = 12;
  const cells = Array.isArray(data) && data.length === weeks * 7 ? data : new Array(weeks * 7).fill(null);
  const hasAny = cells.some((c) => c !== null && c > 0);
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gap: 3 }}>
        {Array.from({ length: weeks }).map((_, col) => (
          <div key={col} style={{ display: 'grid', gap: 3 }}>
            {Array.from({ length: 7 }).map((__, row) => {
              const idx = col * 7 + row;
              const v = cells[idx];
              const bg =
                v === null || v === undefined ? 'rgba(255,255,255,0.04)'
                : v === 0 ? 'rgba(255,255,255,0.06)'
                : v === 1 ? 'rgba(0,255,255,0.25)'
                : v === 2 ? 'rgba(0,255,255,0.5)'
                : 'hsl(var(--rd-accent))';
              return (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 3,
                    background: bg,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {!hasAny && (
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 10, lineHeight: 1.4 }}>
          No training logged yet. Each completed workout lights up a cell (darker = higher volume).
        </div>
      )}
    </Glass>
  );
}

function ConnectionsStrip({ connections, onManage }) {
  const known = [
    { id: 'apple_health', label: 'Apple Health' },
    { id: 'google_fit',   label: 'Google Fit' },
    { id: 'whoop',        label: 'Whoop' },
    { id: 'oura',         label: 'Oura' },
    { id: 'garmin',       label: 'Garmin' },
    { id: 'strava',       label: 'Strava' },
  ];
  const active = known.filter((k) => connections && connections[k.id]);
  if (active.length === 0) {
    return <EmptyHint text="No devices connected. Apple Health, Whoop, Oura, Garmin supported." ctaLabel="Connect" onCta={onManage} />;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {active.map((k) => (
        <span
          key={k.id}
          style={{
            height: 32, paddingInline: 12, borderRadius: 9999,
            background: 'rgba(52,211,153,0.10)',
            border: '1px solid rgba(52,211,153,0.3)',
            color: '#34D399',
            fontSize: 12, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, background: '#34D399' }} />
          {k.label}
        </span>
      ))}
    </div>
  );
}

function EmptyHint({ text, ctaLabel, onCta }) {
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
        {text}
      </div>
      {ctaLabel && (
        <button
          type="button"
          onClick={onCta}
          style={{
            marginTop: 10,
            height: 32, paddingInline: 14, borderRadius: 9999,
            background: 'rgba(0,255,255,0.10)', border: '1px solid rgba(0,255,255,0.3)',
            color: 'hsl(var(--rd-accent))',
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {ctaLabel}
        </button>
      )}
    </Glass>
  );
}

function formatBigNumber(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}
