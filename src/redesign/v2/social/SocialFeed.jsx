/**
 * SocialFeed — /app/social. Feed of friends' activity.
 *
 * Ref: Hevy feed + Strong social feed. Compact 60-80px rows instead of big
 * cards — scanning through 50 entries should feel like a timeline, not a
 * gallery.
 *
 * Item types supported (via `kind`):
 *   - 'workout'   : logged session (title, exercises, duration)
 *   - 'pr'        : personal record
 *   - 'body'      : body milestone (-5kg, +1cm arms, etc.)
 *   - 'lab'       : uploaded a lab panel (generic placeholder)
 *
 * TRUST RULE: MVP ships with an empty feed. Route wrapper passes feed=[].
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, Glass, LiquidButton, LiquidTopBar, SpringReveal } from '../lib/glass';
import {
  DumbbellIcon, TrophyIcon, ScaleIcon, SparkleIcon, UsersIcon, ChevronLeftIcon,
} from '../lib/icons';

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'friends',   label: 'Friends' },
  { id: 'following', label: 'Following' },
  { id: 'discover',  label: 'Discover' },
];

export default function SocialFeed({
  feed = [],
  onOpenUser,
  onOpenItem,
  onLike,
  onComment,
  onFindFriends,
  onBack,
}) {
  const [filter, setFilter] = useState('all');

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={16}>
      <LiquidTopBar
        left={
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
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
        }
        title="Feed"
        right={
          <button
            type="button"
            aria-label="Find friends"
            onClick={onFindFriends}
            style={{
              width: 40, height: 40, borderRadius: 9999,
              background: 'rgba(0,255,255,0.10)',
              border: '1px solid rgba(0,255,255,0.3)',
              color: 'hsl(var(--rd-accent))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <UsersIcon size={18} />
          </button>
        }
      />

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
        {/* Filter chips */}
        <SpringReveal delay={20}>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBlock: 4,
              marginTop: 2,
              scrollbarWidth: 'none',
            }}
          >
            {FILTERS.map((f) => (
              <FilterChip
                key={f.id}
                active={filter === f.id}
                label={f.label}
                onClick={() => setFilter(f.id)}
              />
            ))}
          </div>
        </SpringReveal>

        {/* Feed list */}
        {feed.length === 0 ? (
          <SpringReveal delay={80}>
            <EmptyFeed onFindFriends={onFindFriends} />
          </SpringReveal>
        ) : (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {feed.map((item, idx) => (
              <SpringReveal key={item.id} delay={60 + idx * 30}>
                <FeedRow
                  item={item}
                  onOpenUser={onOpenUser}
                  onOpenItem={onOpenItem}
                  onLike={onLike}
                  onComment={onComment}
                />
              </SpringReveal>
            ))}
          </div>
        )}
      </div>
    </SafeScreen>
  );
}
export { SocialFeed };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function FilterChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: 34,
        paddingInline: 14,
        borderRadius: 9999,
        background: active
          ? 'linear-gradient(180deg, rgba(0,255,255,0.16) 0%, rgba(0,255,255,0.08) 100%)'
          : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
        color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 180ms, border-color 180ms, color 180ms',
      }}
    >
      {label}
    </button>
  );
}

function EmptyFeed({ onFindFriends }) {
  return (
    <Glass radius="xl" style={{ padding: 20, marginTop: 16, textAlign: 'center' }}>
      <div
        aria-hidden
        style={{
          width: 52, height: 52, borderRadius: 9999,
          background: 'rgba(0,255,255,0.08)',
          border: '1px solid rgba(0,255,255,0.22)',
          color: 'hsl(var(--rd-accent))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <UsersIcon size={22} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }}>
        Your feed is empty
      </div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, marginTop: 6, maxWidth: 320, marginInline: 'auto' }}>
        Find friends to see their progress — workouts, PRs, and body milestones will show up here.
      </div>
      <div style={{ marginTop: 14 }}>
        <LiquidButton intent="primary" size="md" onClick={onFindFriends}>
          Find friends
        </LiquidButton>
      </div>
    </Glass>
  );
}

function FeedRow({ item, onOpenUser, onOpenItem, onLike, onComment }) {
  const { kind, user, createdAt } = item;
  const when = relativeTime(createdAt);
  const { Icon, iconBg, iconColor } = iconForKind(kind);

  return (
    <div
      style={{
        minHeight: 68,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        type="button"
        onClick={() => onOpenUser?.(user)}
        aria-label={`Open ${user?.name || 'user'}'s profile`}
        style={{
          flexShrink: 0,
          width: 40, height: 40, borderRadius: 9999,
          background: 'linear-gradient(180deg, rgba(0,255,255,0.18), rgba(0,255,255,0.04))',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-on-accent))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        {initialsOf(user)}
      </button>

      <button
        type="button"
        onClick={() => onOpenItem?.(item)}
        style={{
          flex: 1, minWidth: 0, textAlign: 'left',
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer', color: 'inherit', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em', color: 'hsl(var(--rd-fg-primary))' }}>
            {user?.name || 'Someone'}
          </span>
          <span
            aria-hidden
            style={{
              width: 20, height: 20, borderRadius: 6,
              background: iconBg, color: iconColor,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon size={12} />
          </span>
          <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginLeft: 'auto', flexShrink: 0 }}>
            {when}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'hsl(var(--rd-fg-secondary))',
            marginTop: 3,
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {summaryForItem(item)}
        </div>
        <div style={{ marginTop: 4, display: 'flex', gap: 12, fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>
          <span>{item.likes || 0} likes</span>
          <span>{item.comments || 0} comments</span>
        </div>
      </button>
    </div>
  );
}

function iconForKind(kind) {
  switch (kind) {
    case 'pr':       return { Icon: TrophyIcon,   iconBg: 'rgba(201,169,106,0.14)', iconColor: 'hsl(var(--rd-premium))' };
    case 'body':     return { Icon: ScaleIcon,    iconBg: 'rgba(52,211,153,0.14)',  iconColor: '#34D399' };
    case 'lab':      return { Icon: SparkleIcon,  iconBg: 'rgba(139,92,246,0.14)',  iconColor: '#A78BFA' };
    case 'workout':
    default:         return { Icon: DumbbellIcon, iconBg: 'rgba(0,255,255,0.14)',   iconColor: 'hsl(var(--rd-accent))' };
  }
}

function summaryForItem(item) {
  switch (item.kind) {
    case 'workout':
      return `Completed ${item.title || 'a workout'}${item.exerciseCount ? ` · ${item.exerciseCount} exercises` : ''}${item.durationMin ? ` · ${item.durationMin} min` : ''}`;
    case 'pr':
      return `New PR · ${item.exercise || 'Lift'}${item.weight ? ` · ${item.weight}${item.unit || 'kg'} × ${item.reps || 1}` : ''}`;
    case 'body':
      return item.milestone || 'Reached a body milestone';
    case 'lab':
      return `Uploaded a lab panel${item.panelName ? ` · ${item.panelName}` : ''}`;
    default:
      return item.summary || '';
  }
}

function initialsOf(user) {
  const name = user?.name || user?.username || '·';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'now';
  if (mins < 60)  return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5)  return `${weeks}w`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * SocialFeedRoute — MVP wraps with an empty feed. Backend-pending:
 *   - supabase `feed_items` table + `friendships` resolver
 *   - edge function `social-feed-aggregator`
 */
export function SocialFeedRoute() {
  const navigate = useNavigate();
  return (
    <SocialFeed
      feed={[]}
      onBack={() => navigate(-1)}
      onFindFriends={() => navigate('/app/social/friends')}
      onOpenUser={(user) => user?.username && navigate(`/app/u/${user.username}`)}
      onOpenItem={() => { /* TODO: feed item detail route */ }}
      onLike={() => { /* TODO: POST feed_item_likes */ }}
      onComment={() => { /* TODO: open comments sheet */ }}
    />
  );
}
