/**
 * Friends — /app/social/friends. Friend list, requests, invite.
 *
 * Three tabs:
 *   - Friends  : current confirmed friends + search
 *   - Requests : incoming + outgoing pending
 *   - Invite   : share referral link (copies atlas.core/?ref=<userId>)
 *
 * TRUST RULE: all data is explicitly empty in MVP. Route passes friends=[].
 * Never fabricate avatars — initials only.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { SafeScreen, Glass, LiquidButton, LiquidTopBar, SpringReveal } from '../lib/glass';
import {
  ChevronLeftIcon, ChevronRightIcon, SearchIcon, CopyIcon, UsersIcon,
  UserPlusIcon, CheckIcon, XIcon,
} from '../lib/icons';

const TABS = [
  { id: 'friends',  label: 'Friends' },
  { id: 'requests', label: 'Requests' },
  { id: 'invite',   label: 'Invite' },
];

export default function Friends({
  friends = [],
  requestsIn = [],
  requestsOut = [],
  inviteUrl = 'https://atlas.core/?ref=',
  onBack,
  onOpenUser,
  onAccept,
  onReject,
  onCancelOutgoing,
  onCopyInvite,
}) {
  const [tab, setTab] = useState('friends');
  const [query, setQuery] = useState('');

  const filteredFriends = useMemo(() => {
    if (!query.trim()) return friends;
    const q = query.trim().toLowerCase();
    return friends.filter((f) =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.username || '').toLowerCase().includes(q),
    );
  }, [friends, query]);

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={16}>
      <LiquidTopBar
        left={<BackButton onClick={onBack} />}
        title="Friends"
      />

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
        {/* Tabs */}
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

        {tab === 'friends' && (
          <FriendsTab
            friends={filteredFriends}
            rawCount={friends.length}
            query={query}
            setQuery={setQuery}
            onOpenUser={onOpenUser}
          />
        )}

        {tab === 'requests' && (
          <RequestsTab
            incoming={requestsIn}
            outgoing={requestsOut}
            onAccept={onAccept}
            onReject={onReject}
            onCancelOutgoing={onCancelOutgoing}
            onOpenUser={onOpenUser}
          />
        )}

        {tab === 'invite' && (
          <InviteTab inviteUrl={inviteUrl} onCopyInvite={onCopyInvite} />
        )}
      </div>
    </SafeScreen>
  );
}
export { Friends };

/* ─── Tabs ──────────────────────────────────────────────────────────────── */

function FriendsTab({ friends, rawCount, query, setQuery, onOpenUser }) {
  return (
    <>
      {/* Search */}
      <SpringReveal delay={60}>
        <SearchBar value={query} onChange={setQuery} />
      </SpringReveal>

      {rawCount === 0 ? (
        <SpringReveal delay={100}>
          <EmptyState
            Icon={UsersIcon}
            title="No friends yet"
            body="You haven't added any friends yet. Invite your first friend to see their progress."
          />
        </SpringReveal>
      ) : friends.length === 0 ? (
        <SpringReveal delay={100}>
          <EmptyState
            Icon={SearchIcon}
            title="No matches"
            body={`No friends matched "${query}".`}
          />
        </SpringReveal>
      ) : (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {friends.map((f, idx) => (
            <SpringReveal key={f.id || f.username || idx} delay={60 + idx * 25}>
              <FriendRow friend={f} onOpenUser={onOpenUser} />
            </SpringReveal>
          ))}
        </div>
      )}
    </>
  );
}

function RequestsTab({ incoming, outgoing, onAccept, onReject, onCancelOutgoing, onOpenUser }) {
  const any = incoming.length + outgoing.length > 0;
  if (!any) {
    return (
      <SpringReveal delay={60}>
        <EmptyState
          Icon={UserPlusIcon}
          title="No pending requests"
          body="Friend requests you send or receive will appear here."
        />
      </SpringReveal>
    );
  }
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {incoming.length > 0 && (
        <div>
          <GroupTitle>Incoming</GroupTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {incoming.map((r, idx) => (
              <SpringReveal key={r.id || idx} delay={40 + idx * 25}>
                <RequestRow
                  user={r}
                  kind="incoming"
                  onAccept={() => onAccept?.(r)}
                  onReject={() => onReject?.(r)}
                  onOpenUser={onOpenUser}
                />
              </SpringReveal>
            ))}
          </div>
        </div>
      )}
      {outgoing.length > 0 && (
        <div>
          <GroupTitle>Sent</GroupTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {outgoing.map((r, idx) => (
              <SpringReveal key={r.id || idx} delay={40 + idx * 25}>
                <RequestRow
                  user={r}
                  kind="outgoing"
                  onCancel={() => onCancelOutgoing?.(r)}
                  onOpenUser={onOpenUser}
                />
              </SpringReveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InviteTab({ inviteUrl, onCopyInvite }) {
  return (
    <SpringReveal delay={60}>
      <Glass radius="xl" style={{ padding: 18, marginTop: 14 }}>
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
          <UserPlusIcon size={22} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }}>
          Invite a friend to atlas.core
        </div>
        <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 6, lineHeight: 1.5 }}>
          Share your personal link. When they sign up, you'll be connected automatically.
        </div>

        {/* URL preview */}
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
            color: 'hsl(var(--rd-fg-secondary))',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {inviteUrl}
        </div>

        <div style={{ marginTop: 14 }}>
          <LiquidButton
            intent="primary"
            size="md"
            block
            leftIcon={<CopyIcon size={16} />}
            onClick={onCopyInvite}
          >
            Copy invite link
          </LiquidButton>
        </div>
      </Glass>
    </SpringReveal>
  );
}

/* ─── Rows & bits ──────────────────────────────────────────────────────── */

function FriendRow({ friend, onOpenUser }) {
  const subtitle = friend.currentStreak
    ? `${friend.currentStreak}-day streak`
    : friend.lastWorkoutAt
    ? `Last workout ${relativeTime(friend.lastWorkoutAt)}`
    : friend.username
    ? `@${friend.username}`
    : 'atlas.core member';
  return (
    <button
      type="button"
      onClick={() => onOpenUser?.(friend)}
      style={{
        width: '100%',
        minHeight: 64,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        color: 'inherit',
      }}
    >
      <InitialsAvatar name={friend.name || friend.username} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em', color: 'hsl(var(--rd-fg-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {friend.name || friend.username || 'Atlas user'}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
      <ChevronRightIcon size={16} />
    </button>
  );
}

function RequestRow({ user, kind, onAccept, onReject, onCancel, onOpenUser }) {
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
        aria-label={`Open ${user?.name || 'user'}`}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <InitialsAvatar name={user?.name || user?.username} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || user?.username || 'Atlas user'}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {kind === 'incoming' ? 'Wants to be friends' : 'Request sent'}
        </div>
      </div>
      {kind === 'incoming' ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <IconAction label="Reject" onClick={onReject} Icon={XIcon} tone="neutral" />
          <IconAction label="Accept" onClick={onAccept} Icon={CheckIcon} tone="accent" />
        </div>
      ) : (
        <IconAction label="Cancel request" onClick={onCancel} Icon={XIcon} tone="neutral" />
      )}
    </div>
  );
}

function IconAction({ label, onClick, Icon, tone = 'neutral' }) {
  const tones = {
    accent:  { bg: 'rgba(0,255,255,0.10)', border: 'rgba(0,255,255,0.3)', color: 'hsl(var(--rd-accent))' },
    neutral: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'hsl(var(--rd-fg-secondary))' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 36, height: 36, borderRadius: 9999,
        background: t.bg, border: `1px solid ${t.border}`, color: t.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon size={16} />
    </button>
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
        placeholder="Search friends"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, minWidth: 0,
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 14,
          color: 'hsl(var(--rd-fg-primary))',
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

function GroupTitle({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
      {children}
    </div>
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

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * FriendsRoute — MVP: empty friend/requests lists. Backend-pending:
 *   - supabase `friendships` table (user_a, user_b, state, created_at)
 *   - edge function `social-friends-resolver` (returns enriched user rows)
 */
export function FriendsRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inviteUrl = `https://atlas.core/?ref=${user?.id || ''}`;

  return (
    <Friends
      friends={[]}
      requestsIn={[]}
      requestsOut={[]}
      inviteUrl={inviteUrl}
      onBack={() => navigate(-1)}
      onOpenUser={(f) => f?.username && navigate(`/app/u/${f.username}`)}
      onAccept={() => toast.success('Request accepted')}
      onReject={() => toast('Request dismissed')}
      onCancelOutgoing={() => toast('Request canceled')}
      onCopyInvite={async () => {
        try {
          await navigator.clipboard.writeText(inviteUrl);
          toast.success('Invite link copied');
        } catch {
          toast.error('Could not copy link');
        }
      }}
    />
  );
}
