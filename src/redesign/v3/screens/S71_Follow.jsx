import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { useT } from '@/lib/i18nContext';

/* ── tab config ─────────────────────────────────────────────── */
const TAB_IDS = ['suggested', 'leaderboard', 'search'];

/* ── user row (suggested / search) ──────────────────────────── */
function UserRow({ u, c, onOpenUser, onFollow, showBio, labels }) {
  const following = !!u.following;
  const displayName = u.name || labels.unknownUser;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 2px',
      borderBottom: `1px solid ${c.hair}`,
    }}>
      {/* Avatar */}
      <button
        type="button"
        onClick={() => { if (typeof onOpenUser === 'function') onOpenUser(u.id); }}
        aria-label={labels.openUser.replace('{name}', displayName)}
        style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: c.card, border: `1px solid ${c.faint}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
          color: c.fg, cursor: 'pointer', padding: 0,
        }}
      >
        {u.initials || '??'}
      </button>

      {/* Info */}
      <button
        type="button"
        onClick={() => { if (typeof onOpenUser === 'function') onOpenUser(u.id); }}
        style={{
          flex: 1, minWidth: 0, textAlign: 'left',
          background: 'transparent', border: 'none', padding: 0,
          color: 'inherit', cursor: 'pointer',
        }}
      >
        <div style={{
          fontSize: 14.5, fontWeight: 600, color: c.fg,
          letterSpacing: -0.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {displayName}
        </div>
        {showBio && u.bio && (
          <div style={{
            marginTop: 2, fontSize: 12, color: c.dim,
            letterSpacing: -0.1, lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {u.bio}
          </div>
        )}
      </button>

      {/* Follow / Following button */}
      <button
        type="button"
        onClick={() => { if (typeof onFollow === 'function') onFollow(u.id); }}
        aria-label={following ? labels.unfollow : labels.follow}
        style={{
          padding: '7px 14px', borderRadius: 999, flexShrink: 0,
          background: following ? 'transparent' : c.accent,
          border: following ? `1px solid ${c.faint}` : 'none',
          color: following ? c.dim : c.ink,
          fontSize: 12, fontWeight: 700, letterSpacing: -0.1,
          fontFamily: ACFonts.body,
          cursor: 'pointer',
        }}
      >
        {following ? labels.following : labels.follow}
      </button>
    </div>
  );
}

/* ── leaderboard row ────────────────────────────────────────── */
function LeaderRow({ u, rank, c, onOpenUser, labels }) {
  const displayName = u.name || labels.unknownUser;
  return (
    <button
      type="button"
      onClick={() => { if (typeof onOpenUser === 'function') onOpenUser(u.id); }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 2px', background: 'transparent',
        borderTop: 'none', borderRight: 'none', borderLeft: 'none',
        borderBottom: `1px solid ${c.hair}`,
        textAlign: 'left', cursor: 'pointer', color: 'inherit',
      }}
    >
      {/* Rank */}
      <div style={{
        width: 24, textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
        color: rank <= 3 ? c.accent : c.mute,
        letterSpacing: 0.5,
      }}>
        {String(rank).padStart(2, '0')}
      </div>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 999,
        background: rank === 1 ? c.accent : c.card,
        color: rank === 1 ? c.ink : c.fg,
        border: rank === 1 ? 'none' : `1px solid ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
        flexShrink: 0,
      }}>
        {u.initials || '??'}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 600, color: c.fg,
          letterSpacing: -0.2,
        }}>
          {displayName}
        </div>
        {u.metric && (
          <div style={{
            marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
            color: c.dim, letterSpacing: 0.3,
          }}>
            {u.metric}
          </div>
        )}
      </div>
      {/* Value */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <ACNum size={20} color={rank <= 3 ? c.accent : c.fg} weight={700}>
          {u.value ?? '—'}
        </ACNum>
      </div>
    </button>
  );
}

/* ── demo data ──────────────────────────────────────────────── */
const DEMO_SUGGESTED = [
  { id: 's1', name: 'Riley M.',   initials: 'RM', bio: 'Powerlifting · 3 yr', following: false },
  { id: 's2', name: 'Taylor H.',  initials: 'TH', bio: 'Bodybuilding prep coach', following: false },
  { id: 's3', name: 'Morgan C.',  initials: 'MC', bio: 'Running + lifting', following: true },
  { id: 's4', name: 'Casey L.',   initials: 'CL', bio: 'Hybrid athlete · BJJ', following: false },
];

const DEMO_LEADERBOARD = [
  { id: 'l1', name: 'Jordan K.', initials: 'JK', rank: 1, value: '62', metric: 'Tonnes this week' },
  { id: 'l2', name: 'You',       initials: 'MK', rank: 2, value: '55', metric: 'Tonnes this week' },
  { id: 'l3', name: 'Lin R.',    initials: 'LR', rank: 3, value: '48', metric: 'Tonnes this week' },
  { id: 'l4', name: 'Sam S.',    initials: 'SS', rank: 4, value: '41', metric: 'Tonnes this week' },
  { id: 'l5', name: 'Marcos O.', initials: 'MO', rank: 5, value: '37', metric: 'Tonnes this week' },
];

const DEMO_SEARCH = [
  { id: 'x1', name: 'Alex T.',  initials: 'AT', following: false },
  { id: 'x2', name: 'Alexa R.', initials: 'AR', following: true },
];

const LEADERBOARD_GATE = 10;

/**
 * S71_Follow — user discovery: suggested, leaderboard, search.
 *
 * Gallery:    <S71_Follow dark />
 * Production: <S71_Follow dark
 *               suggested={[{id, name, initials, bio, following?},...]}
 *               leaderboard={[{id, name, initials, rank, value, metric},...]}
 *               searchResults={[{id, name, initials, following?},...]}
 *               friendCount={12}
 *               onOpenUser={fn} onFollow={fn} onSearch={fn} onBack={fn} />
 *
 * onOpenUser(id)  — tap user avatar / name
 * onFollow(id)    — follow / unfollow
 * onSearch(query) — live search query change
 * onBack()        — back navigation
 */
function S71_Follow({
  dark = false,
  suggested = null,
  leaderboard = null,
  searchResults = null,
  friendCount = null,
  onOpenUser,
  onFollow,
  onSearch,
  onBack,
}) {
  const c = useACT(dark);
  const t = useT();
  const _suggested = Array.isArray(suggested) ? suggested : DEMO_SUGGESTED;
  const _leaderboard = Array.isArray(leaderboard) ? leaderboard : DEMO_LEADERBOARD;
  const _searchResults = Array.isArray(searchResults) ? searchResults : DEMO_SEARCH;
  const _friendCount = typeof friendCount === 'number' ? friendCount : 12;
  const labels = {
    openUser: t('social.follow.openUser'),
    unknownUser: t('social.follow.unknownUser'),
    follow: t('social.follow.follow'),
    following: t('social.follow.following'),
    unfollow: t('social.follow.unfollow'),
  };

  const [activeTab, setActiveTab] = useState('suggested');
  const [query, setQuery] = useState('');

  const leaderboardLocked = _friendCount < LEADERBOARD_GATE;
  const neededFriends = Math.max(0, LEADERBOARD_GATE - _friendCount);
  const friendWord = neededFriends === 1 ? t('social.follow.friend') : t('social.follow.friends');

  const handleSearchChange = (val) => {
    setQuery(val);
    if (typeof onSearch === 'function') onSearch(val);
  };

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
              {t('social.follow.discover')}
            </ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -0.8, color: c.fg, marginTop: 4,
            }}>
              {t('social.follow.title')}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ padding: '10px 22px 0' }}>
        <div style={{
          padding: 4, display: 'flex', gap: 2,
          background: c.card, borderRadius: 10,
        }}>
          {TAB_IDS.map((tabId) => (
            <button key={tabId} type="button" onClick={() => setActiveTab(tabId)} style={{
              flex: 1, padding: '8px 0', textAlign: 'center',
              background: activeTab === tabId ? c.fg : 'transparent',
              color: activeTab === tabId ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600, borderRadius: 7,
              border: 'none', cursor: 'pointer',
            }}>
              {t(`social.follow.tabs.${tabId}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll area */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px',
      }}>

        {/* ── Suggested tab ───────────────────────────── */}
        {activeTab === 'suggested' && (
          <>
            <ACLabel size={10} color={c.dim} style={{
              fontFamily: ACFonts.mono, letterSpacing: 0.7,
              textTransform: 'uppercase', display: 'block', marginBottom: 8,
            }}>
              {t('social.follow.peopleYouMayKnow')}
            </ACLabel>
            {_suggested.length === 0 ? (
              <div style={{
                marginTop: 12, padding: 22, borderRadius: ACRadii.card,
                border: `1px dashed ${c.faint}`, textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                  letterSpacing: -0.3, color: c.fg,
                }}>
                  {t('social.follow.emptySuggestedTitle')}
                </div>
                <ACLabel size={12} color={c.dim} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
                  {t('social.follow.emptySuggestedBody')}
                </ACLabel>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {_suggested.map((u) => (
                  <UserRow key={u.id} u={u} c={c} onOpenUser={onOpenUser} onFollow={onFollow} showBio labels={labels} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Leaderboard tab ─────────────────────────── */}
        {activeTab === 'leaderboard' && (
          <>
            {leaderboardLocked ? (
              /* Locked state */
              <div style={{
                marginTop: 12, padding: 28, borderRadius: ACRadii.card,
                border: `1px dashed ${c.faint}`, textAlign: 'center',
              }}>
                {/* Lock icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 999,
                  background: c.card, border: `1px solid ${c.hair}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="9" width="12" height="9" rx="2" stroke={c.mute} strokeWidth="1.6" />
                    <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke={c.mute} strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="10" cy="13.5" r="1.2" fill={c.accent} />
                  </svg>
                </div>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                  letterSpacing: -0.4, color: c.fg,
                }}>
                  {t('social.follow.leaderboardLockedTitle', { count: LEADERBOARD_GATE })}
                </div>
                <ACLabel size={12} color={c.dim} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
                  {t('social.follow.leaderboardLockedBody', { count: neededFriends, friendWord })}
                </ACLabel>
                {/* Progress bar */}
                <div style={{
                  marginTop: 16, height: 6, borderRadius: 3,
                  background: c.faint, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: c.accent,
                    width: `${Math.min(100, (_friendCount / LEADERBOARD_GATE) * 100)}%`,
                  }} />
                </div>
                <div style={{
                  marginTop: 6, fontFamily: ACFonts.mono, fontSize: 10,
                  color: c.mute, letterSpacing: 0.3,
                }}>
                  {t('social.follow.friendProgress', { current: _friendCount, count: LEADERBOARD_GATE })}
                </div>
              </div>
            ) : (
              /* Unlocked leaderboard */
              <>
                <ACLabel size={10} color={c.accent} style={{
                  fontFamily: ACFonts.mono, fontWeight: 700,
                  letterSpacing: 0.7, textTransform: 'uppercase',
                  display: 'block', marginBottom: 8,
                }}>
                  {t('social.follow.weeklyVolumeTop', { count: _leaderboard.length })}
                </ACLabel>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {_leaderboard.map((u, i) => (
                    <LeaderRow key={u.id} u={u} rank={i + 1} c={c} onOpenUser={onOpenUser} labels={labels} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Search tab ──────────────────────────────── */}
        {activeTab === 'search' && (
          <>
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', background: c.card,
              borderRadius: ACRadii.input, marginBottom: 14,
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke={c.dim} strokeWidth="1.8" />
                <path d="M11 11l3.5 3.5" stroke={c.dim} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={query}
                placeholder={t('social.follow.searchPlaceholder')}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                style={{
                  flex: 1, fontSize: 14, color: c.fg, letterSpacing: -0.2, fontWeight: 500,
                  background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: 'inherit', padding: 0, minWidth: 0,
                }}
              />
              {query && (
                <button
                  type="button"
                  aria-label={t('social.follow.clearSearch')}
                  onClick={() => handleSearchChange('')}
                  style={{
                    width: 22, height: 22, borderRadius: 999,
                    background: c.faint, border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <path d="M1 1l6 6M7 1l-6 6" stroke={c.dim} strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {!query.trim() ? (
              <div style={{
                marginTop: 12, padding: 22, borderRadius: ACRadii.card,
                border: `1px dashed ${c.faint}`, textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                  letterSpacing: -0.3, color: c.fg,
                }}>
                  {t('social.follow.searchEmptyTitle')}
                </div>
                <ACLabel size={12} color={c.dim} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
                  {t('social.follow.searchEmptyBody')}
                </ACLabel>
              </div>
            ) : _searchResults.length === 0 ? (
              <div style={{
                marginTop: 12, padding: 22, borderRadius: ACRadii.card,
                border: `1px dashed ${c.faint}`, textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                  letterSpacing: -0.3, color: c.fg,
                }}>
                  {t('social.follow.noResultsTitle')}
                </div>
                <ACLabel size={12} color={c.dim} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
                  {t('social.follow.noResultsBody', { query })}
                </ACLabel>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {_searchResults.map((u) => (
                  <UserRow key={u.id} u={u} c={c} onOpenUser={onOpenUser} onFollow={onFollow} showBio={false} labels={labels} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S71_Follow;
