/**
 * S76_Public_Profile -- Read-only public profile for another user.
 *
 * Hero: large avatar + display name + bio + follower/following counts.
 * Stats row: sessions, volume, streaks.
 * Three tabs: Activity, PRs, Routines.
 * Follow/Unfollow toggle, Message (Pro-gated), Share profile in header.
 *
 * Gallery:    <S76_Public_Profile />
 * Production: <S76_Public_Profile dark profile={...} onToggleFollow={fn} onBack={fn} />
 *
 * Props:
 *   dark            -- light/dark variant
 *   profile         -- { displayName, initials, bio, avatarUrl,
 *                        followers, following, sessions, volume, streaks,
 *                        activity: [{id, name, date, summary}],
 *                        prs: [{lift, weight, unit, date}],
 *                        routines: [{id, name, exercises, sessions}] }
 *   isFollowing     -- boolean
 *   isViewerPro     -- boolean (gates message button)
 *   onToggleFollow  -- () => void
 *   onMessage       -- () => void
 *   onOpenRoutine   -- (id) => void
 *   onShareProfile  -- () => void
 *   onBack          -- () => void
 */
import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACChip,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/* -- DEMO data ----------------------------------------------------------- */

const DEMO_PROFILE = {
  displayName: 'Jordan Kessler',
  initials: 'JK',
  bio: 'Chasing 500. Intermediate powerlifter. Sleep is the real PED.',
  avatarUrl: null,
  followers: 128,
  following: 34,
  sessions: 214,
  volume: '482t',
  streaks: 22,
  activity: [
    { id: 'a1', name: 'Heavy Lower', date: '18 Apr', summary: '5 exercises, 62 min' },
    { id: 'a2', name: 'Upper Hypertrophy', date: '16 Apr', summary: '6 exercises, 48 min' },
    { id: 'a3', name: 'Conditioning', date: '14 Apr', summary: '3 exercises, 30 min' },
  ],
  prs: [
    { lift: 'Deadlift', weight: '500', unit: 'lb', date: '18 Apr' },
    { lift: 'Squat', weight: '405', unit: 'lb', date: '10 Apr' },
    { lift: 'Bench', weight: '285', unit: 'lb', date: '2 Apr' },
    { lift: 'OHP', weight: '185', unit: 'lb', date: '28 Mar' },
  ],
  routines: [
    { id: 'r1', name: '5/3/1 BBB', exercises: 12, sessions: 4 },
    { id: 'r2', name: 'Conditioning Block', exercises: 8, sessions: 3 },
  ],
};

const TABS = [
  { id: 'activity', label: 'Activity' },
  { id: 'prs',      label: 'PRs' },
  { id: 'routines', label: 'Routines' },
];

/* -- Screen --------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {boolean} [props.dark]
 * @param {object} [props.profile]
 * @param {boolean} [props.isFollowing]
 * @param {boolean} [props.isViewerPro]
 * @param {function} [props.onToggleFollow]
 * @param {function} [props.onMessage]
 * @param {function} [props.onOpenRoutine]
 * @param {function} [props.onShareProfile]
 * @param {function} [props.onBack]
 */
function S76_Public_Profile({
  dark = false,
  profile,
  isFollowing = false,
  isViewerPro = false,
  onToggleFollow,
  onMessage,
  onOpenRoutine,
  onShareProfile,
  onBack,
}) {
  const c = useACT(dark);
  const p = profile || DEMO_PROFILE;
  const [tab, setTab] = useState('activity');

  const safeToggleFollow = () => { if (typeof onToggleFollow === 'function') onToggleFollow(); };
  const safeMessage = () => { if (typeof onMessage === 'function') onMessage(); };
  const safeShareProfile = () => { if (typeof onShareProfile === 'function') onShareProfile(); };
  const safeBack = () => { if (typeof onBack === 'function') onBack(); };
  const safeOpenRoutine = (id) => { if (typeof onOpenRoutine === 'function') onOpenRoutine(id); };

  /* -- Not found state --------------------------------------------------- */
  if (profile === null) {
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
        {/* Header */}
        <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BackBtn c={c} onClick={safeBack} />
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, letterSpacing: 0.1 }}>Profile</ACLabel>
          <div style={{ width: 28 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 28px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 999,
            background: c.card, border: `1px solid ${c.hair}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="10" r="5" stroke={c.mute} strokeWidth="2" />
              <path d="M4 24a10 10 0 0 1 20 0" stroke={c.mute} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>
            User not found
          </div>
          <div style={{ fontFamily: ACFonts.body, fontSize: 13, color: c.dim, lineHeight: 1.5, textAlign: 'center' }}>
            This profile does not exist or is private.
          </div>
          <div style={{ marginTop: 8 }}>
            <ACBtn dark={dark} size="md" pill onClick={safeBack}>Go back</ACBtn>
          </div>
        </div>
      </div>
    );
  }

  /* -- Main profile ------------------------------------------------------- */
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Top bar */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackBtn c={c} onClick={safeBack} />
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, letterSpacing: 0.1 }}>
          {p.displayName || 'Profile'}
        </ACLabel>
        <button
          type="button"
          onClick={safeShareProfile}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6v4a1 1 0 001 1h6a1 1 0 001-1V6M8 3L6 1 4 3M6 1v7" stroke={c.fg} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Hero section */}
        <div style={{ padding: '20px 22px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: 999,
            background: c.accent, color: c.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
            letterSpacing: -0.8,
            border: `3px solid ${c.bg}`,
            boxShadow: `0 0 0 2px ${c.accent}`,
            overflow: 'hidden',
          }}>
            {p.avatarUrl ? (
              <img
                src={p.avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              p.initials || '?'
            )}
          </div>

          {/* Name */}
          <div style={{
            marginTop: 14,
            fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.1, textAlign: 'center',
          }}>
            {p.displayName || 'Atlas User'}
          </div>

          {/* Bio */}
          {p.bio ? (
            <div style={{
              marginTop: 8, fontFamily: ACFonts.body, fontSize: 13,
              color: c.dim, lineHeight: 1.5, textAlign: 'center',
              maxWidth: 300,
            }}>
              {p.bio}
            </div>
          ) : null}

          {/* Follower / Following counts */}
          <div style={{
            marginTop: 14, display: 'flex', gap: 20,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                letterSpacing: -0.4, lineHeight: 1.1,
              }}>
                {p.followers ?? 0}
              </div>
              <ACLabel size={10} color={c.mute} style={{ letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Followers
              </ACLabel>
            </div>
            <div style={{ width: 1, height: 28, background: c.hair, alignSelf: 'center' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                letterSpacing: -0.4, lineHeight: 1.1,
              }}>
                {p.following ?? 0}
              </div>
              <ACLabel size={10} color={c.mute} style={{ letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Following
              </ACLabel>
            </div>
          </div>

          {/* CTA row: Follow + Message */}
          <div style={{
            marginTop: 16, display: 'flex', gap: 8, width: '100%',
            maxWidth: 340,
          }}>
            <div style={{ flex: 1 }}>
              <ACBtn
                primary={!isFollowing}
                dark={dark}
                block
                size="md"
                pill
                onClick={safeToggleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </ACBtn>
            </div>
            <div style={{ flex: 1 }}>
              <ACBtn
                dark={dark}
                block
                size="md"
                pill
                onClick={safeMessage}
                style={!isViewerPro ? { opacity: 0.65 } : undefined}
              >
                Message
                {!isViewerPro && (
                  <ACLabel size={8} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.6, marginLeft: 4 }}>
                    PRO
                  </ACLabel>
                )}
              </ACBtn>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ padding: '16px 22px 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            background: c.card, borderRadius: ACRadii.card,
            padding: '14px 0',
          }}>
            {[
              { label: 'Sessions', value: p.sessions },
              { label: 'Volume',   value: p.volume },
              { label: 'Streak',   value: p.streaks, unit: 'd' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  textAlign: 'center',
                  borderLeft: i === 0 ? 'none' : `1px solid ${c.hair}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
                  <ACNum size={22} color={c.fg} weight={700}>
                    {stat.value ?? '--'}
                  </ACNum>
                  {stat.unit && stat.value != null && (
                    <span style={{ fontFamily: ACFonts.body, fontSize: 10, color: c.dim }}>
                      {stat.unit}
                    </span>
                  )}
                </div>
                <ACLabel size={9} color={c.mute} style={{
                  letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2,
                  display: 'block',
                }}>
                  {stat.label}
                </ACLabel>
              </div>
            ))}
          </div>
        </div>

        {/* Tab strip */}
        <div style={{ padding: '14px 22px 0' }}>
          <div style={{
            display: 'flex', gap: 4, padding: 4,
            background: c.card, borderRadius: ACRadii.button,
          }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  textAlign: 'center',
                  background: tab === t.id ? c.fg : 'transparent',
                  color: tab === t.id ? c.bg : c.dim,
                  fontFamily: ACFonts.body,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: -0.1,
                  borderRadius: ACRadii.chip,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ padding: '10px 22px 32px' }}>
          {tab === 'activity' && (
            <ActivityTab items={p.activity || []} c={c} />
          )}
          {tab === 'prs' && (
            <PRsTab items={p.prs || []} c={c} />
          )}
          {tab === 'routines' && (
            <RoutinesTab items={p.routines || []} c={c} onOpen={safeOpenRoutine} />
          )}
        </div>
      </div>
    </div>
  );
}

/* -- Subcomponents -------------------------------------------------------- */

function BackBtn({ c, onClick }) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick}
      style={{
        width: 28, height: 28, borderRadius: 999,
        background: c.card,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ActivityTab({ items, c }) {
  if (items.length === 0) {
    return <EmptyTab c={c} label="No recent activity" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <div
          key={item.id || i}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 0',
            borderBottom: `1px solid ${c.hair}`,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: ACRadii.chip,
            background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="6" width="12" height="4" rx="1" stroke={c.accent} strokeWidth="1.4" />
              <rect x="4" y="4" width="2" height="8" rx="1" stroke={c.accent} strokeWidth="1.4" />
              <rect x="10" y="4" width="2" height="8" rx="1" stroke={c.accent} strokeWidth="1.4" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
              color: c.fg, letterSpacing: -0.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.name}
            </div>
            <div style={{
              fontFamily: ACFonts.body, fontSize: 11, color: c.dim,
              marginTop: 2,
            }}>
              {item.summary}
            </div>
          </div>
          <ACLabel size={10} color={c.mute} style={{ flexShrink: 0 }}>
            {item.date}
          </ACLabel>
        </div>
      ))}
    </div>
  );
}

function PRsTab({ items, c }) {
  if (items.length === 0) {
    return <EmptyTab c={c} label="No PRs yet" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((pr, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 0',
            borderBottom: `1px solid ${c.hair}`,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: ACRadii.chip,
            background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2l2 4 4.5 0.7-3.2 3.1 0.8 4.5L8 12l-4.1 2.3 0.8-4.5L1.5 6.7 6 6Z"
                stroke={c.accent} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
              color: c.fg, letterSpacing: -0.2,
            }}>
              {pr.lift}
            </div>
            <div style={{
              fontFamily: ACFonts.mono, fontSize: 11, color: c.dim,
              marginTop: 2, letterSpacing: 0.3,
            }}>
              {pr.weight} {pr.unit}
            </div>
          </div>
          <ACLabel size={10} color={c.mute} style={{ flexShrink: 0 }}>
            {pr.date}
          </ACLabel>
        </div>
      ))}
    </div>
  );
}

function RoutinesTab({ items, c, onOpen }) {
  if (items.length === 0) {
    return <EmptyTab c={c} label="No shared routines" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      {items.map((r, i) => (
        <button
          key={r.id || i}
          type="button"
          onClick={() => onOpen(r.id)}
          style={{
            width: '100%',
            padding: '14px 14px',
            background: c.card,
            borderRadius: ACRadii.card,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'inherit',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: ACRadii.chip,
            background: c.fg, color: c.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
            flexShrink: 0,
          }}>
            {r.sessions || 0}d
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
              color: c.fg, letterSpacing: -0.2,
            }}>
              {r.name}
            </div>
            <div style={{
              fontFamily: ACFonts.body, fontSize: 11, color: c.dim,
              marginTop: 2,
            }}>
              {r.exercises || 0} exercises · {r.sessions || 0} days/wk
            </div>
          </div>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M3 1l4 4-4 4" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function EmptyTab({ c, label }) {
  return (
    <div style={{
      marginTop: 24,
      textAlign: 'center',
      padding: '28px 20px',
      border: `1px dashed ${c.faint}`,
      borderRadius: ACRadii.card,
    }}>
      <div style={{
        fontFamily: ACFonts.body, fontSize: 13, color: c.mute,
        letterSpacing: -0.1,
      }}>
        {label}
      </div>
    </div>
  );
}

export default S76_Public_Profile;
