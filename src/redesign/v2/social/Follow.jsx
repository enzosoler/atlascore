/**
 * Follow — /app/social/follow. Discover users + leaderboards.
 *
 * Tabs:
 *   - Suggested   : personalized recommendations (empty in MVP)
 *   - Leaderboard : global/friend leaderboards (unlocks after 10 friends)
 *   - Search      : free-form user search
 *
 * TRUST RULE: all collections empty in MVP. Never fabricate usernames.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidTopBar, SpringReveal } from '../lib/glass';
import {
  ChevronLeftIcon, ChevronRightIcon, SearchIcon, XIcon, SparkleIcon,
  TrophyIcon, UserPlusIcon, UserCheckIcon,
} from '../lib/icons';

const TABS = [
  { id: 'suggested',   label: 'Suggested' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'search',      label: 'Search' },
];

export default function Follow({
  suggested = [],
  leaderboard = [],
  searchResults = [],
  friendCount = 0,
  onBack,
  onOpenUser,
  onFollow,
  onSearch,
}) {
  const [tab, setTab] = useState('suggested');
  const [query, setQuery] = useState('');

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={16}>
      <LiquidTopBar
        left={<BackButton onClick={onBack} />}
        title="Discover"
      />

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
        <SpringReveal delay={20}>
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
              marginTop: 2,
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

        {tab === 'suggested' && (
          <SuggestedTab
            items={suggested}
            onOpenUser={onOpenUser}
            onFollow={onFollow}
          />
        )}

        {tab === 'leaderboard' && (
          <LeaderboardTab
            items={leaderboard}
            friendCount={friendCount}
            onOpenUser={onOpenUser}
          />
        )}

        {tab === 'search' && (
          <SearchTab
            query={query}
            setQuery={(v) => { setQuery(v); onSearch?.(v); }}
            results={searchResults}
            onOpenUser={onOpenUser}
            onFollow={onFollow}
          />
        )}
      </div>
    </SafeScreen>
  );
}
export { Follow };

/* ─── Tabs ──────────────────────────────────────────────────────────────── */

function SuggestedTab({ items, onOpenUser, onFollow }) {
  if (!items || items.length === 0) {
    return (
      <SpringReveal delay={60}>
        <EmptyState
          Icon={SparkleIcon}
          title="Suggestions coming soon"
          body="We'll suggest users based on your training style once the social graph is live."
        />
      </SpringReveal>
    );
  }
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((u, idx) => (
        <SpringReveal key={u.id || u.username || idx} delay={40 + idx * 25}>
          <UserRow user={u} onOpenUser={onOpenUser} onFollow={onFollow} />
        </SpringReveal>
      ))}
    </div>
  );
}

function LeaderboardTab({ items, friendCount, onOpenUser }) {
  if (!items || items.length === 0) {
    const needed = Math.max(0, 10 - (friendCount || 0));
    return (
      <SpringReveal delay={60}>
        <EmptyState
          Icon={TrophyIcon}
          title="Leaderboards unlock at 10 friends"
          body={
            needed > 0
              ? `Add ${needed} more friend${needed === 1 ? '' : 's'} to unlock weekly training volume and streak leaderboards.`
              : 'Leaderboards unlock after 10 friends are added.'
          }
        />
      </SpringReveal>
    );
  }
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((row, idx) => (
        <SpringReveal key={row.id || idx} delay={40 + idx * 25}>
          <LeaderboardRow row={row} rank={idx + 1} onOpenUser={onOpenUser} />
        </SpringReveal>
      ))}
    </div>
  );
}

function SearchTab({ query, setQuery, results, onOpenUser, onFollow }) {
  return (
    <>
      <SpringReveal delay={60}>
        <SearchBar value={query} onChange={setQuery} />
      </SpringReveal>
      {!query.trim() ? (
        <SpringReveal delay={100}>
          <EmptyState
            Icon={SearchIcon}
            title="Find people on atlas.core"
            body="Search by name or username to discover other members."
          />
        </SpringReveal>
      ) : results.length === 0 ? (
        <SpringReveal delay={100}>
          <EmptyState
            Icon={SearchIcon}
            title="No results"
            body={`Nothing matched "${query}".`}
          />
        </SpringReveal>
      ) : (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.map((u, idx) => (
            <SpringReveal key={u.id || u.username || idx} delay={40 + idx * 25}>
              <UserRow user={u} onOpenUser={onOpenUser} onFollow={onFollow} />
            </SpringReveal>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Rows ──────────────────────────────────────────────────────────────── */

function UserRow({ user, onOpenUser, onFollow }) {
  const sub = user.bio || (user.username ? `@${user.username}` : 'atlas.core member');
  const following = !!user.isFollowing;
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
      <button
        type="button"
        onClick={() => onOpenUser?.(user)}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
        aria-label={`Open ${user.name || 'user'} profile`}
      >
        <InitialsAvatar name={user.name || user.username} />
      </button>
      <button
        type="button"
        onClick={() => onOpenUser?.(user)}
        style={{
          flex: 1, minWidth: 0, textAlign: 'left',
          background: 'transparent', border: 'none', padding: 0,
          color: 'inherit', cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name || user.username || 'Atlas user'}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub}
        </div>
      </button>
      <button
        type="button"
        onClick={() => onFollow?.(user)}
        aria-label={following ? 'Unfollow' : 'Follow'}
        style={{
          height: 32, paddingInline: 12,
          borderRadius: 9999,
          background: following ? 'rgba(255,255,255,0.04)' : 'rgba(0,255,255,0.10)',
          border: following ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,255,255,0.3)',
          color: following ? 'hsl(var(--rd-fg-secondary))' : 'hsl(var(--rd-accent))',
          fontSize: 12, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
        }}
      >
        {following ? <UserCheckIcon size={14} /> : <UserPlusIcon size={14} />}
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

function LeaderboardRow({ row, rank, onOpenUser }) {
  return (
    <button
      type="button"
      onClick={() => onOpenUser?.(row)}
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
          width: 28, height: 28, borderRadius: 9999,
          background: rank <= 3 ? 'rgba(201,169,106,0.14)' : 'rgba(255,255,255,0.04)',
          border: rank <= 3 ? '1px solid rgba(201,169,106,0.35)' : '1px solid rgba(255,255,255,0.08)',
          color: rank <= 3 ? 'hsl(var(--rd-premium))' : 'hsl(var(--rd-fg-muted))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {rank}
      </span>
      <InitialsAvatar name={row.name || row.username} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))' }}>
          {row.name || row.username || 'Atlas user'}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {row.metricLabel || 'Volume'}
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-primary))', flexShrink: 0 }}>
        {row.metricValue ?? '—'}
        {row.metricUnit && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{row.metricUnit}</span>}
      </div>
      <ChevronRightIcon size={14} />
    </button>
  );
}

/* ─── Shared bits ──────────────────────────────────────────────────────── */

function SearchBar({ value, onChange }) {
  return (
    <div
      style={{
        marginTop: 12,
        height: 44,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 8,
        paddingInline: 12,
      }}
    >
      <span aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))' }}>
        <SearchIcon size={16} />
      </span>
      <input
        type="text"
        placeholder="Search users"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, minWidth: 0,
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 14, color: 'hsl(var(--rd-fg-primary))',
        }}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => onChange('')}
          style={{
            width: 24, height: 24, borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: 'hsl(var(--rd-fg-muted))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <XIcon size={12} />
        </button>
      )}
    </div>
  );
}

function InitialsAvatar({ name }) {
  const initials = (name || '·')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: 40, height: 40, borderRadius: 9999,
        background: 'linear-gradient(180deg, rgba(0,255,255,0.18), rgba(0,255,255,0.04))',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-on-accent))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
      }}
    >
      {initials}
    </span>
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
 * FollowRoute — MVP returns empty arrays for all three tabs. Backend-pending:
 *   - supabase `follows` table + recommendation edge fn `social-suggest-users`
 *   - `leaderboards` materialized view, rotating weekly
 *   - full-text user search edge fn `social-search-users`
 */
export function FollowRoute() {
  const navigate = useNavigate();
  return (
    <Follow
      suggested={[]}
      leaderboard={[]}
      searchResults={[]}
      friendCount={0}
      onBack={() => navigate(-1)}
      onOpenUser={(u) => u?.username && navigate(`/app/u/${u.username}`)}
      onFollow={() => toast.success('Followed')}
      onSearch={() => { /* TODO: debounced call to social-search-users */ }}
    />
  );
}
