/**
 * PublicProfile — /app/u/:username. A user's public-facing profile.
 *
 * Layout:
 *   - Hero: initials avatar, display name, @username, bio
 *   - Stats strip: total workouts, current streak, etc.
 *   - CTA row: Follow (toggles) + Message (Pro-gated)
 *   - Tabs: Recent activity / PRs / Shared routines
 *
 * TRUST RULE: route wrapper passes profile=null in MVP. Screen renders
 * honest "User not found" state. Never fabricate data. Initials only.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { SafeScreen, Glass, LiquidButton, LiquidTopBar, SpringReveal } from '../lib/glass';
import {
  ChevronLeftIcon, DumbbellIcon, FlameIcon, TrophyIcon, MessageIcon,
  UserPlusIcon, UserCheckIcon, SparkleIcon, UsersIcon,
} from '../lib/icons';

const TABS = [
  { id: 'activity', label: 'Activity' },
  { id: 'prs',      label: 'PRs' },
  { id: 'routines', label: 'Routines' },
];

export default function PublicProfile({
  profile = null,
  isViewerPro = false,
  isFollowing = false,
  onBack,
  onToggleFollow,
  onMessage,
  onOpenRoutine,
  onShareProfile,
}) {
  const [tab, setTab] = useState('activity');

  // ── Not found / empty state ────────────────────────────────────────────
  if (!profile) {
    return (
      <SafeScreen hasTopBar paddingX={16}>
        <LiquidTopBar
          left={<BackButton onClick={onBack} />}
          title="Profile"
        />
        <div style={{ maxWidth: 480, margin: '48px auto 0', textAlign: 'center' }}>
          <SpringReveal delay={20}>
            <div
              aria-hidden
              style={{
                width: 72, height: 72, borderRadius: 9999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'hsl(var(--rd-fg-muted))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <UsersIcon size={28} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', color: 'hsl(var(--rd-fg-primary))' }}>
              User not found
            </div>
            <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, marginTop: 8 }}>
              This profile doesn't exist yet, or it's private.
            </div>
            <div style={{ marginTop: 20 }}>
              <LiquidButton intent="neutral" size="md" onClick={onBack}>
                Go back
              </LiquidButton>
            </div>
          </SpringReveal>
        </div>
      </SafeScreen>
    );
  }

  const name = profile.name || profile.username || 'Atlas user';
  const initials = (name || '·').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={16}>
      <LiquidTopBar
        left={<BackButton onClick={onBack} />}
        title={profile.username ? `@${profile.username}` : 'Profile'}
        right={
          <button
            type="button"
            onClick={onShareProfile}
            style={{
              background: 'transparent', border: 'none',
              color: 'hsl(var(--rd-accent))', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', padding: '6px 10px',
            }}
          >
            Share
          </button>
        }
      />

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 60 }}>
        {/* Hero */}
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <span
              aria-hidden
              style={{
                width: 96, height: 96, borderRadius: 9999,
                background: 'linear-gradient(180deg, rgba(0,255,255,0.22), rgba(0,255,255,0.04))',
                border: '2px solid rgba(255,255,255,0.14)',
                color: 'hsl(var(--rd-fg-on-accent))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em',
              }}
            >
              {initials}
            </span>
          </div>
        </SpringReveal>

        <SpringReveal delay={60}>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(var(--rd-fg-primary))' }}>
              {name}
            </h1>
            {profile.username && (
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
                @{profile.username}
              </div>
            )}
            {profile.bio && (
              <p style={{ margin: '10px auto 0', maxWidth: 360, fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                {profile.bio}
              </p>
            )}
          </div>
        </SpringReveal>

        {/* CTA row */}
        <SpringReveal delay={100}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <LiquidButton
              intent={isFollowing ? 'neutral' : 'primary'}
              size="md"
              leftIcon={isFollowing ? <UserCheckIcon size={16} /> : <UserPlusIcon size={16} />}
              onClick={onToggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </LiquidButton>
            <LiquidButton
              intent="neutral"
              size="md"
              leftIcon={<MessageIcon size={16} />}
              onClick={onMessage}
            >
              Message{!isViewerPro ? ' ·' : ''}
              {!isViewerPro && <span style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 700, color: 'hsl(var(--rd-premium))', marginLeft: 2 }}>PRO</span>}
            </LiquidButton>
          </div>
        </SpringReveal>

        {/* Stats */}
        <SpringReveal delay={140}>
          <StatsStrip stats={profile.stats} />
        </SpringReveal>

        {/* Tabs */}
        <SpringReveal delay={180}>
          <div
            role="tablist"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              padding: 4,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginTop: 18,
            }}
          >
            {TABS.map((t) => (
              <TabButton
                key={t.id}
                active={tab === t.id}
                label={t.label}
                onClick={() => setTab(t.id)}
              />
            ))}
          </div>
        </SpringReveal>

        {tab === 'activity' && (
          <ActivityTab items={profile.recentActivity || []} />
        )}
        {tab === 'prs' && (
          <PRsTab items={profile.prs || []} />
        )}
        {tab === 'routines' && (
          <RoutinesTab items={profile.sharedRoutines || []} onOpenRoutine={onOpenRoutine} />
        )}
      </div>
    </SafeScreen>
  );
}
export { PublicProfile };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function StatsStrip({ stats }) {
  const items = [
    { Icon: DumbbellIcon, label: 'Workouts',   value: stats?.totalWorkouts },
    { Icon: FlameIcon,    label: 'Streak',     value: stats?.currentStreak,    unit: 'd', color: '#FBBF24' },
    { Icon: TrophyIcon,   label: 'Months',     value: stats?.monthsActive,     unit: 'mo' },
  ];
  return (
    <Glass radius="xl" style={{ padding: 4, marginTop: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {items.map((it, idx) => {
          const has = it.value !== null && it.value !== undefined;
          const Icon = it.Icon;
          return (
            <div
              key={it.label}
              style={{
                padding: 14,
                borderRight: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: it.color || 'hsl(var(--rd-accent))' }}>
                <Icon size={14} />
                <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
                  {it.label}
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: has ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.1 }}>
                {has ? it.value : '—'}
                {has && it.unit && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{it.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
}

function ActivityTab({ items }) {
  if (items.length === 0) {
    return (
      <SpringReveal delay={60}>
        <EmptyState
          Icon={DumbbellIcon}
          title="No recent activity"
          body="This user hasn't shared any workouts yet."
        />
      </SpringReveal>
    );
  }
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((it, idx) => (
        <SpringReveal key={it.id || idx} delay={40 + idx * 25}>
          <ListRow
            Icon={DumbbellIcon}
            iconBg="rgba(0,255,255,0.14)"
            iconColor="hsl(var(--rd-accent))"
            title={it.title || 'Workout'}
            sub={`${it.exerciseCount || 0} exercises · ${it.durationMin || 0} min`}
            right={it.when || ''}
          />
        </SpringReveal>
      ))}
    </div>
  );
}

function PRsTab({ items }) {
  if (items.length === 0) {
    return (
      <SpringReveal delay={60}>
        <EmptyState
          Icon={TrophyIcon}
          title="No PRs yet"
          body="Personal records appear here as this user hits them."
        />
      </SpringReveal>
    );
  }
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((pr, idx) => (
        <SpringReveal key={pr.id || idx} delay={40 + idx * 25}>
          <ListRow
            Icon={TrophyIcon}
            iconBg="rgba(201,169,106,0.14)"
            iconColor="hsl(var(--rd-premium))"
            title={pr.exercise || 'Lift'}
            sub={`${pr.weight || 0}${pr.unit || 'kg'} × ${pr.reps || 1}`}
            right={pr.when || ''}
          />
        </SpringReveal>
      ))}
    </div>
  );
}

function RoutinesTab({ items, onOpenRoutine }) {
  if (items.length === 0) {
    return (
      <SpringReveal delay={60}>
        <EmptyState
          Icon={SparkleIcon}
          title="No shared routines"
          body="When this user shares a routine, you'll be able to save a copy from here."
        />
      </SpringReveal>
    );
  }
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((r, idx) => (
        <SpringReveal key={r.id || idx} delay={40 + idx * 25}>
          <button
            type="button"
            onClick={() => onOpenRoutine?.(r)}
            style={{
              width: '100%',
              minHeight: 64,
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              textAlign: 'left', color: 'inherit',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(139,92,246,0.14)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#A78BFA',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SparkleIcon size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))' }}>
                {r.name || 'Routine'}
              </div>
              <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
                {r.dayCount ? `${r.dayCount} days` : ''}{r.dayCount && r.exerciseCount ? ' · ' : ''}{r.exerciseCount ? `${r.exerciseCount} exercises` : ''}
              </div>
            </div>
          </button>
        </SpringReveal>
      ))}
    </div>
  );
}

function ListRow({ Icon, iconBg, iconColor, title, sub, right }) {
  return (
    <div
      style={{
        minHeight: 64,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg, color: iconColor,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {sub}
        </div>
      </div>
      {right && (
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      style={{
        height: 34,
        borderRadius: 10,
        background: active
          ? 'linear-gradient(180deg, rgba(0,255,255,0.16) 0%, rgba(0,255,255,0.08) 100%)'
          : 'transparent',
        border: active ? '1px solid rgba(0,255,255,0.45)' : '1px solid transparent',
        color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        transition: 'background 180ms, border-color 180ms, color 180ms',
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ Icon, title, body }) {
  return (
    <Glass radius="xl" style={{ padding: 18, marginTop: 14, textAlign: 'center' }}>
      <div
        aria-hidden
        style={{
          width: 48, height: 48, borderRadius: 9999,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'hsl(var(--rd-fg-muted))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))' }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, marginTop: 6, maxWidth: 320, marginInline: 'auto' }}>
        {body}
      </div>
    </Glass>
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

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * PublicProfileRoute — resolves `:username` from the route. MVP passes
 * `profile=null` so the screen renders an honest "User not found" state.
 * Backend-pending:
 *   - supabase `public_profiles` table + RLS-safe fetch by username
 *   - edge fn `social-public-profile` (aggregates stats, recent activity, PRs)
 *   - messaging gate depends on `subscription.tier === 'Pro'`
 */
export function PublicProfileRoute() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier;
  const isViewerPro = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';

  const [isFollowing, setIsFollowing] = useState(false);

  // TODO: fetch public profile by username. Default null = "User not found".
  const profile = null;

  return (
    <PublicProfile
      profile={profile}
      isViewerPro={isViewerPro}
      isFollowing={isFollowing}
      onBack={() => navigate(-1)}
      onToggleFollow={() => {
        setIsFollowing((f) => !f);
        toast.success(isFollowing ? 'Unfollowed' : 'Followed');
      }}
      onMessage={() => {
        if (!isViewerPro) {
          toast('Messaging is a Pro feature', { description: 'Upgrade to start conversations.' });
        } else {
          toast('DMs coming soon');
        }
      }}
      onOpenRoutine={(r) => r?.id && navigate(`/app/routines/${r.id}`)}
      onShareProfile={async () => {
        const url = `${window.location.origin}/app/u/${username || ''}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: `${username ? '@' + username : 'Atlas profile'}`, url });
          } else {
            await navigator.clipboard.writeText(url);
            toast.success('Profile link copied');
          }
        } catch { /* user canceled */ }
      }}
    />
  );
}
