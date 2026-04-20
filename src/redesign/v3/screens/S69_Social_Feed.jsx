import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/* ── type badge config ──────────────────────────────────────── */
const TYPE_BADGES = {
  workout: { label: 'WORKOUT', color: null },
  pr:      { label: 'PR',      color: null },
  body:    { label: 'BODY',    color: null },
  lab:     { label: 'LAB',     color: null },
};

/* ── tiny inline icons ──────────────────────────────────────── */
function HeartIcon({ size = 14, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 14C6.4 12.8 2 9.6 2 6c0-2 1.6-3.5 3-3.5C6.4 2.5 7.2 3.5 8 4.5c.8-1 1.6-2 3-2C12.4 2.5 14 4 14 6c0 3.6-4.4 6.8-6 8Z"
        fill={color}
      />
    </svg>
  );
}

function HeartOutline({ size = 14, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 14C6.4 12.8 2 9.6 2 6c0-2 1.6-3.5 3-3.5C6.4 2.5 7.2 3.5 8 4.5c.8-1 1.6-2 3-2C12.4 2.5 14 4 14 6c0 3.6-4.4 6.8-6 8Z"
        stroke={color} strokeWidth="1.4" fill="none"
      />
    </svg>
  );
}

/* ── feed row ───────────────────────────────────────────────── */
function FeedItem({ item, c, onOpenUser, onOpenItem, onLike }) {
  const badge = TYPE_BADGES[item.type] || TYPE_BADGES.workout;
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 0',
      borderBottom: `1px solid ${c.hair}`,
    }}>
      {/* Avatar */}
      <button
        type="button"
        onClick={() => { if (typeof onOpenUser === 'function') onOpenUser(item.id); }}
        aria-label={`Open ${item.userName || 'user'}`}
        style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: c.card, border: `1px solid ${c.faint}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
          color: c.fg, cursor: 'pointer', padding: 0,
        }}
      >
        {item.initials || '??'}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => { if (typeof onOpenItem === 'function') onOpenItem(item.id); }}
          style={{
            background: 'transparent', border: 'none', padding: 0,
            textAlign: 'left', cursor: 'pointer', color: 'inherit',
            display: 'block', width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 14, fontWeight: 700, color: c.fg,
              letterSpacing: -0.2,
            }}>
              {item.userName || 'Unknown'}
            </span>
            <ACChip dark={false} style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, fontFamily: ACFonts.mono,
              background: item.type === 'pr' ? c.accent : c.faint,
              color: item.type === 'pr' ? c.ink : c.dim,
              borderRadius: 4,
            }}>
              {badge.label}
            </ACChip>
          </div>
          <div style={{
            fontSize: 13, color: c.dim, marginTop: 3,
            lineHeight: 1.45, letterSpacing: -0.1,
          }}>
            {item.action || ''}
          </div>
          {item.detail && (
            <div style={{
              fontSize: 12, color: c.mute, marginTop: 2,
              fontFamily: ACFonts.mono, letterSpacing: 0.2,
            }}>
              {item.detail}
            </div>
          )}
        </button>

        {/* Meta row: timestamp + like */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 6,
        }}>
          <div style={{
            fontFamily: ACFonts.mono, fontSize: 10, color: c.mute,
            letterSpacing: 0.3,
          }}>
            {item.when || ''}
          </div>
          <button
            type="button"
            onClick={() => { if (typeof onLike === 'function') onLike(item.id); }}
            aria-label={item.liked ? 'Unlike' : 'Like'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'transparent', border: 'none', padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            {item.liked
              ? <HeartIcon size={14} color={c.accent} />
              : <HeartOutline size={14} color={c.mute} />}
            <span style={{
              fontFamily: ACFonts.mono, fontSize: 10,
              color: item.liked ? c.accent : c.mute,
              fontWeight: 600, letterSpacing: 0.3,
            }}>
              {item.likeCount ?? 0}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── demo data ──────────────────────────────────────────────── */
const DEMO_FEED = [
  { id: 'f1', userName: 'Jordan K.', initials: 'JK', action: 'Pulled 500 lb deadlift', detail: '3 sets total volume 4.2t', when: '2h', type: 'pr', likeCount: 7, liked: true },
  { id: 'f2', userName: 'Lin R.',    initials: 'LR', action: 'Completed upper body session', detail: '8 exercises · 52 min', when: '4h', type: 'workout', likeCount: 3, liked: false },
  { id: 'f3', userName: 'Sam S.',    initials: 'SS', action: 'Logged body scan update', detail: '-1.2 kg this week', when: '1d', type: 'body', likeCount: 5, liked: false },
  { id: 'f4', userName: 'Marcos O.', initials: 'MO', action: 'Uploaded blood panel', detail: 'Testosterone + Thyroid', when: '2d', type: 'lab', likeCount: 2, liked: true },
  { id: 'f5', userName: 'You',       initials: 'MK', action: 'Hit 415 lb deadlift PR', detail: '+10 lb from last block', when: '3d', type: 'pr', likeCount: 11, liked: false },
];

/**
 * S69_Social_Feed — activity feed from friends and crew.
 *
 * Gallery:    <S69_Social_Feed dark />
 * Production: <S69_Social_Feed dark
 *               feed={[{id, userName, initials, action, detail, when, type, likeCount, liked},...]}
 *               onOpenUser={fn} onOpenItem={fn} onLike={fn}
 *               onFindFriends={fn} onBack={fn} />
 *
 * onOpenUser(userId) — tap avatar / user name
 * onOpenItem(itemId) — tap feed item body
 * onLike(itemId)     — tap heart
 * onFindFriends()    — empty state CTA
 * onBack()           — back navigation
 */
function S69_Social_Feed({
  dark = false,
  feed = null,
  onOpenUser,
  onOpenItem,
  onLike,
  onFindFriends,
  onBack,
}) {
  const c = useACT(dark);
  const _feed = Array.isArray(feed) && feed.length > 0 ? feed : DEMO_FEED;
  const isEmpty = Array.isArray(feed) && feed.length === 0;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.fg, minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                width: 30, height: 30, borderRadius: 999, border: 'none',
                background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Back"
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M6.5 1.4L2.5 5l4 3.6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}
          <div>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Activity
            </ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -0.8, color: c.fg, marginTop: 4,
            }}>
              Feed
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { if (typeof onFindFriends === 'function') onFindFriends(); }}
          style={{
            width: 34, height: 34, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
          aria-label="Find friends"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="6" r="4" stroke={c.fg} strokeWidth="1.6" />
            <path d="M9.5 9.5L13 13" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scroll area */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '6px 22px 20px',
      }}>
        {isEmpty ? (
          /* ── Empty state ─────────────────────────────── */
          <div style={{
            marginTop: 40, padding: 28, borderRadius: ACRadii.card,
            border: `1px dashed ${c.faint}`, textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 999,
              background: c.card, border: `1px solid ${c.hair}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="8" r="3" stroke={c.mute} strokeWidth="1.6" />
                <path d="M1 18a6 6 0 0 1 12 0" stroke={c.mute} strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="14" cy="6" r="2.5" stroke={c.mute} strokeWidth="1.4" />
                <path d="M10 18a5 5 0 0 1 9 0" stroke={c.mute} strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
              letterSpacing: -0.4, color: c.fg,
            }}>
              Your feed is quiet
            </div>
            <ACLabel size={12} color={c.dim} style={{
              display: 'block', marginTop: 6, lineHeight: 1.6,
            }}>
              Add friends to see their workouts, PRs, and milestones here.
            </ACLabel>
            <div style={{ marginTop: 16 }}>
              <ACBtn
                primary dark={dark}
                onClick={() => { if (typeof onFindFriends === 'function') onFindFriends(); }}
              >
                Find friends
              </ACBtn>
            </div>
          </div>
        ) : (
          /* ── Feed list ───────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {_feed.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                c={c}
                onOpenUser={onOpenUser}
                onOpenItem={onOpenItem}
                onLike={onLike}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        {!isEmpty && (
          <div style={{
            marginTop: 18, padding: 14, borderRadius: ACRadii.card,
            border: `1px dashed ${c.faint}`, textAlign: 'center',
          }}>
            <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
              Activity is shared only with confirmed friends. No public profiles. No strangers.
            </ACLabel>
          </div>
        )}
      </div>

      <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S69_Social_Feed;
