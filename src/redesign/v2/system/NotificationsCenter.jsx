/**
 * NotificationsCenter — /app/notifications
 *
 * Inbox of user notifications. Grouped by relative date (Today / Yesterday /
 * This week / Earlier). Filter chips: All / Unread / Mentions.
 *
 * TRUST RULE — we NEVER fabricate notifications. The MVP route wrapper passes
 * `notifications={[]}`. Backend wiring lands via the `notifications` table +
 * `notifications-fanout` edge function — see /docs/BACKEND_TODO.md.
 *
 * Shape of a notification:
 *   {
 *     id:        string,
 *     kind:      'workout_reminder' | 'pr_achievement' | 'streak_milestone'
 *              | 'coach_insight'    | 'friend_request' | 'friend_like'
 *              | 'billing'          | 'system',
 *     title:     string,
 *     body:      string,
 *     deep_link: string | null,         // e.g. '/app/today/streaks'
 *     is_mention:boolean,
 *     read_at:   string | null,         // ISO timestamp
 *     created_at:string,                // ISO timestamp
 *   }
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  BellIcon,
  SettingsIcon,
  TrophyIcon,
  FlameIcon,
  SparkleIcon,
  UsersIcon,
  HeartIcon,
  ReceiptIcon,
  InfoIcon,
  ChevronLeftIcon,
} from '../lib/icons';

/* ─── Kind → icon + tint palette ─────────────────────────────────────────── */

const KIND_VISUAL = {
  workout_reminder: { tint: 'cyan',    Icon: BellIcon,    label: 'Workout reminder' },
  pr_achievement:   { tint: 'gold',    Icon: TrophyIcon,  label: 'Personal record' },
  streak_milestone: { tint: 'cyan',    Icon: FlameIcon,   label: 'Streak milestone' },
  coach_insight:    { tint: 'violet',  Icon: SparkleIcon, label: 'Coach insight' },
  friend_request:   { tint: 'cyan',    Icon: UsersIcon,   label: 'Friend request' },
  friend_like:      { tint: 'cyan',    Icon: HeartIcon,   label: 'Like' },
  billing:          { tint: 'gold',    Icon: ReceiptIcon, label: 'Billing' },
  system:           { tint: 'neutral', Icon: InfoIcon,    label: 'System' },
};

const TINT_COLORS = {
  cyan:    { bg: 'rgba(0,255,255,0.10)',   border: 'rgba(0,255,255,0.25)',   fg: 'hsl(var(--rd-accent))' },
  gold:    { bg: 'rgba(201,169,106,0.14)', border: 'rgba(201,169,106,0.30)', fg: '#E0C78A' },
  violet:  { bg: 'rgba(139,92,246,0.14)',  border: 'rgba(139,92,246,0.30)',  fg: '#A78BFA' },
  neutral: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', fg: 'hsl(var(--rd-fg-secondary))' },
};

/* ─── Main screen ────────────────────────────────────────────────────────── */

export default function NotificationsCenter({
  notifications = [],
  onBack,
  onOpenSettings,
  onMarkAllRead,
  onOpenNotification,
  onGoToReminders,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'mentions'

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read_at).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === 'unread')   return notifications.filter((n) => !n.read_at);
    if (filter === 'mentions') return notifications.filter((n) => n.is_mention);
    return notifications;
  }, [notifications, filter]);

  const groups = useMemo(() => groupByRelativeDate(filtered), [filtered]);

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        {/* Header */}
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              style={backButtonStyle}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <h1
              style={{
                margin: 0,
                flex: 1,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Notifications
            </h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {unreadCount > 0 && (
                <LiquidButton intent="ghost" size="sm" onClick={onMarkAllRead}>
                  Mark all read
                </LiquidButton>
              )}
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Notification settings"
                style={iconButtonStyle}
              >
                <SettingsIcon size={18} />
              </button>
            </div>
          </div>
        </SpringReveal>

        {/* Filter chips */}
        <SpringReveal delay={60}>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <FilterChip active={filter === 'all'}      onClick={() => setFilter('all')}      label="All" />
            <FilterChip active={filter === 'unread'}   onClick={() => setFilter('unread')}   label="Unread" count={unreadCount} />
            <FilterChip active={filter === 'mentions'} onClick={() => setFilter('mentions')} label="Mentions" />
          </div>
        </SpringReveal>

        {/* Body */}
        {filtered.length === 0 ? (
          <SpringReveal delay={120}>
            <EmptyState
              filter={filter}
              onGoToReminders={onGoToReminders}
            />
          </SpringReveal>
        ) : (
          <div style={{ marginTop: 8 }}>
            {groups.map((group, gIdx) => (
              <SpringReveal key={group.key} delay={120 + gIdx * 40}>
                <SectionHeader title={group.label} />
                <Glass radius="xl" style={{ padding: 4, overflow: 'hidden' }}>
                  {group.items.map((n, i) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      last={i === group.items.length - 1}
                      onClick={() => onOpenNotification?.(n)}
                    />
                  ))}
                </Glass>
              </SpringReveal>
            ))}
          </div>
        )}
      </div>
    </SafeScreen>
  );
}
export { NotificationsCenter };

/* ─── Row ────────────────────────────────────────────────────────────────── */

function NotificationRow({ notification, last, onClick }) {
  const unread = !notification.read_at;
  const vis = KIND_VISUAL[notification.kind] || KIND_VISUAL.system;
  const palette = TINT_COLORS[vis.tint] || TINT_COLORS.neutral;
  const Icon = vis.Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 10px',
        background: 'transparent',
        border: 'none',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          color: palette.fg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          className="truncate"
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            color: 'hsl(var(--rd-fg-primary))',
          }}
        >
          {notification.title}
        </span>
        <span
          className="truncate"
          style={{
            display: 'block',
            fontSize: 13,
            color: 'hsl(var(--rd-fg-muted))',
            marginTop: 2,
            lineHeight: 1.35,
          }}
        >
          {notification.body}
        </span>
      </span>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
          flexShrink: 0,
          paddingTop: 2,
        }}
      >
        <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
          {relativeTime(notification.created_at)}
        </span>
        {unread && (
          <span
            aria-label="Unread"
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: 'hsl(var(--rd-accent))',
              boxShadow: '0 0 6px hsl(var(--rd-accent) / .6)',
            }}
          />
        )}
      </span>
    </button>
  );
}

/* ─── Filter chip ────────────────────────────────────────────────────────── */

function FilterChip({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 32,
        padding: '0 14px',
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        background: active
          ? 'linear-gradient(180deg, rgba(0,255,255,0.22) 0%, rgba(0,255,255,0.10) 100%)'
          : 'rgba(255,255,255,0.04)',
        border: active
          ? '1px solid rgba(0,255,255,0.45)'
          : '1px solid rgba(255,255,255,0.10)',
        color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 180ms, border-color 180ms, color 180ms',
      }}
    >
      <span>{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span
          style={{
            minWidth: 18,
            height: 18,
            padding: '0 6px',
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: active ? 'rgba(0,255,255,0.30)' : 'rgba(255,255,255,0.10)',
            color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────── */

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color: 'hsl(var(--rd-fg-muted))',
        marginTop: 22,
        marginBottom: 8,
        paddingInline: 2,
      }}
    >
      {title}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */

function EmptyState({ filter, onGoToReminders }) {
  const copy = filter === 'unread'
    ? { title: 'Nothing unread.', body: 'You\'re all caught up.' }
    : filter === 'mentions'
    ? { title: 'No mentions yet.', body: 'When someone tags you, it lands here.' }
    : { title: 'You\'re all caught up.', body: 'No notifications yet — set up reminders so Atlas nudges you at the right times.' };

  return (
    <Glass radius="xl" style={{ padding: 24, marginTop: 20, textAlign: 'center' }}>
      <div
        aria-hidden
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: 'rgba(0,255,255,0.10)',
          border: '1px solid rgba(0,255,255,0.22)',
          color: 'hsl(var(--rd-accent))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
      >
        <BellIcon size={22} />
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'hsl(var(--rd-fg-primary))',
        }}
      >
        {copy.title}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'hsl(var(--rd-fg-secondary))',
          maxWidth: 360,
          marginInline: 'auto',
        }}
      >
        {copy.body}
      </div>
      {filter === 'all' && (
        <div style={{ marginTop: 16, display: 'inline-flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <LiquidButton intent="primary" size="sm" onClick={onGoToReminders}>
            Set up reminders
          </LiquidButton>
        </div>
      )}
    </Glass>
  );
}

/* ─── Relative-date grouping ─────────────────────────────────────────────── */

function groupByRelativeDate(items) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfThisWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups = [
    { key: 'today',     label: 'Today',     items: [] },
    { key: 'yesterday', label: 'Yesterday', items: [] },
    { key: 'week',      label: 'This week', items: [] },
    { key: 'earlier',   label: 'Earlier',   items: [] },
  ];

  for (const n of items) {
    const created = new Date(n.created_at);
    if (isNaN(created.getTime())) {
      groups[3].items.push(n);
      continue;
    }
    if (created >= startOfToday)         groups[0].items.push(n);
    else if (created >= startOfYesterday) groups[1].items.push(n);
    else if (created >= startOfThisWeek) groups[2].items.push(n);
    else                                  groups[3].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

function relativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1)   return 'now';
  if (min < 60)  return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24)   return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7)   return `${day}d ago`;
  const wk = Math.round(day / 7);
  if (wk < 5)    return `${wk}w ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ─── Shared button styles ───────────────────────────────────────────────── */

const backButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 9999,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'hsl(var(--rd-fg-primary))',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  flexShrink: 0,
};

const iconButtonStyle = {
  ...backButtonStyle,
};

/* ─── Route wrapper ──────────────────────────────────────────────────────── */

/**
 * NotificationsCenterRoute — MVP wrapper.
 *
 * Passes `notifications={[]}` so the honest empty state renders. Tapping a
 * notification follows its `deep_link` if present.
 *
 * TODO: wire to a real notifications service. See /docs/BACKEND_TODO.md
 * section on the `notifications` table + `notifications-fanout` edge function.
 */
export function NotificationsCenterRoute() {
  const navigate = useNavigate();

  // MVP: always an empty array. Never fabricate notifications.
  const notifications = [];

  return (
    <NotificationsCenter
      notifications={notifications}
      onBack={() => navigate('/app/today')}
      onOpenSettings={() => navigate('/app/settings/notifications')}
      onMarkAllRead={() => {
        // TODO: bulk UPDATE notifications SET read_at = now()
        // WHERE user_id = auth.uid() AND read_at IS NULL;
      }}
      onOpenNotification={(n) => {
        // TODO: optimistic UPDATE read_at = now() for n.id via supabase.
        if (n?.deep_link) navigate(n.deep_link);
      }}
      onGoToReminders={() => navigate('/app/settings/notifications')}
    />
  );
}
