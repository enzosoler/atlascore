import React, { useMemo, useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/* ── tab config ─────────────────────────────────────────────── */
const TABS = [
  { id: 'friends',  label: 'Friends' },
  { id: 'requests', label: 'Requests' },
  { id: 'invite',   label: 'Invite' },
];

/* ── friend row ─────────────────────────────────────────────── */
function FriendRow({ f, c, onOpenUser }) {
  return (
    <button
      type="button"
      onClick={() => { if (typeof onOpenUser === 'function') onOpenUser(f.id); }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 2px', background: 'transparent',
        borderTop: 'none', borderRight: 'none', borderLeft: 'none',
        borderBottom: `1px solid ${c.hair}`,
        textAlign: 'left', cursor: 'pointer', color: 'inherit',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: c.card, border: `1px solid ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
        color: c.fg, flexShrink: 0,
      }}>
        {f.initials || '??'}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 600, color: c.fg,
          letterSpacing: -0.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {f.name || 'Unknown'}
        </div>
        {(f.mutualCount != null && f.mutualCount > 0) && (
          <div style={{
            marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
            color: c.dim, letterSpacing: 0.3,
          }}>
            {f.mutualCount} mutual friend{f.mutualCount === 1 ? '' : 's'}
          </div>
        )}
      </div>
      {/* Chevron */}
      <svg width="8" height="12" viewBox="0 0 8 12" style={{ flexShrink: 0 }}>
        <path d="M1.5 1l5 5-5 5" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ── request row ────────────────────────────────────────────── */
function RequestRow({ r, c, kind, onAccept, onReject, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 2px',
      borderBottom: `1px solid ${c.hair}`,
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: c.card, border: `1px solid ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
        color: c.fg, flexShrink: 0,
      }}>
        {r.initials || '??'}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 600, color: c.fg,
          letterSpacing: -0.2,
        }}>
          {r.name || 'Unknown'}
        </div>
        <div style={{
          marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {kind === 'incoming' ? 'Wants to be friends' : 'Request sent'}
        </div>
      </div>
      {/* Actions */}
      {kind === 'incoming' ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => { if (typeof onReject === 'function') onReject(r.id); }}
            aria-label="Reject"
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: c.card, border: `1px solid ${c.hair}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 2l6 6M8 2l-6 6" stroke={c.dim} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { if (typeof onAccept === 'function') onAccept(r.id); }}
            aria-label="Accept"
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: c.accent, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke={c.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { if (typeof onCancel === 'function') onCancel(r.id); }}
          aria-label="Cancel request"
          style={{
            width: 32, height: 32, borderRadius: 999,
            background: c.card, border: `1px solid ${c.hair}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 2l6 6M8 2l-6 6" stroke={c.dim} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── demo data ──────────────────────────────────────────────── */
const DEMO_FRIENDS = [
  { id: 'jk', name: 'Jordan K.', initials: 'JK', mutualCount: 3 },
  { id: 'lr', name: 'Lin R.',    initials: 'LR', mutualCount: 2 },
  { id: 'ss', name: 'Sam S.',    initials: 'SS', mutualCount: 5 },
  { id: 'mo', name: 'Marcos O.', initials: 'MO', mutualCount: 1 },
  { id: 'at', name: 'Alex T.',   initials: 'AT', mutualCount: 0 },
];

const DEMO_REQUESTS_IN = [
  { id: 'kw', name: 'Kai W.',   initials: 'KW' },
  { id: 'np', name: 'Nina P.',  initials: 'NP' },
];

const DEMO_REQUESTS_OUT = [
  { id: 'dm', name: 'Dana M.', initials: 'DM' },
];

/**
 * S70_Friends — friend list, pending requests, and invite link.
 *
 * Gallery:    <S70_Friends dark />
 * Production: <S70_Friends dark
 *               friends={[{id, name, initials, mutualCount},...]}
 *               requestsIn={[{id, name, initials},...]}
 *               requestsOut={[{id, name, initials},...]}
 *               inviteUrl="https://atlas.core/?ref=abc"
 *               onOpenUser={fn} onAccept={fn} onReject={fn}
 *               onCancelOutgoing={fn} onCopyInvite={fn} onBack={fn} />
 *
 * onOpenUser(id)       — tap friend row
 * onAccept(id)         — accept incoming request
 * onReject(id)         — reject incoming request
 * onCancelOutgoing(id) — cancel sent request
 * onCopyInvite()       — copy invite link
 * onBack()             — back navigation
 */
function S70_Friends({
  dark = false,
  friends = null,
  requestsIn = null,
  requestsOut = null,
  inviteUrl = null,
  onOpenUser,
  onAccept,
  onReject,
  onCancelOutgoing,
  onCopyInvite,
  onBack,
}) {
  const c = useACT(dark);
  const _friends = Array.isArray(friends) && friends.length > 0 ? friends : DEMO_FRIENDS;
  const _requestsIn = Array.isArray(requestsIn) ? requestsIn : DEMO_REQUESTS_IN;
  const _requestsOut = Array.isArray(requestsOut) ? requestsOut : DEMO_REQUESTS_OUT;
  const _inviteUrl = inviteUrl || 'https://atlas.core/?ref=demo';

  const [activeTab, setActiveTab] = useState('friends');
  const [query, setQuery] = useState('');

  const filteredFriends = useMemo(() => {
    if (!query.trim()) return _friends;
    const q = query.trim().toLowerCase();
    return _friends.filter((f) =>
      (f.name || '').toLowerCase().includes(q),
    );
  }, [_friends, query]);

  const requestCount = _requestsIn.length + _requestsOut.length;

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
              Social · {_friends.length}
            </ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -0.8, color: c.fg, marginTop: 4,
            }}>
              Friends
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
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: '8px 0', textAlign: 'center',
              background: activeTab === t.id ? c.fg : 'transparent',
              color: activeTab === t.id ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600, borderRadius: 7,
              border: 'none', cursor: 'pointer',
              position: 'relative',
            }}>
              {t.label}
              {t.id === 'requests' && requestCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 8,
                  width: 6, height: 6, borderRadius: 999,
                  background: c.accent,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll area */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px',
      }}>

        {/* ── Friends tab ─────────────────────────────── */}
        {activeTab === 'friends' && (
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
                placeholder="Search friends"
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1, fontSize: 14, color: c.fg, letterSpacing: -0.2, fontWeight: 500,
                  background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: 'inherit', padding: 0, minWidth: 0,
                }}
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear"
                  onClick={() => setQuery('')}
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

            {filteredFriends.length === 0 ? (
              <div style={{
                marginTop: 20, padding: 22, borderRadius: ACRadii.card,
                border: `1px dashed ${c.faint}`, textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                  letterSpacing: -0.3, color: c.fg,
                }}>
                  {query ? 'No matches' : 'No friends yet'}
                </div>
                <ACLabel size={12} color={c.dim} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
                  {query
                    ? `No friends matched "${query}".`
                    : 'Switch to the Invite tab to share your link.'}
                </ACLabel>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredFriends.map((f) => (
                  <FriendRow key={f.id} f={f} c={c} onOpenUser={onOpenUser} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Requests tab ────────────────────────────── */}
        {activeTab === 'requests' && (
          <>
            {_requestsIn.length === 0 && _requestsOut.length === 0 ? (
              <div style={{
                marginTop: 20, padding: 22, borderRadius: ACRadii.card,
                border: `1px dashed ${c.faint}`, textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                  letterSpacing: -0.3, color: c.fg,
                }}>
                  No pending requests
                </div>
                <ACLabel size={12} color={c.dim} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
                  Friend requests you send or receive will appear here.
                </ACLabel>
              </div>
            ) : (
              <>
                {_requestsIn.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <ACLabel size={10} color={c.dim} style={{
                      fontFamily: ACFonts.mono, letterSpacing: 0.7,
                      textTransform: 'uppercase', display: 'block', marginBottom: 8,
                    }}>
                      Incoming · {_requestsIn.length}
                    </ACLabel>
                    {_requestsIn.map((r) => (
                      <RequestRow
                        key={r.id} r={r} c={c} kind="incoming"
                        onAccept={onAccept} onReject={onReject}
                      />
                    ))}
                  </div>
                )}
                {_requestsOut.length > 0 && (
                  <div>
                    <ACLabel size={10} color={c.dim} style={{
                      fontFamily: ACFonts.mono, letterSpacing: 0.7,
                      textTransform: 'uppercase', display: 'block', marginBottom: 8,
                    }}>
                      Sent · {_requestsOut.length}
                    </ACLabel>
                    {_requestsOut.map((r) => (
                      <RequestRow
                        key={r.id} r={r} c={c} kind="outgoing"
                        onCancel={onCancelOutgoing}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Invite tab ──────────────────────────────── */}
        {activeTab === 'invite' && (
          <div style={{
            padding: 22, background: c.fg, color: c.bg,
            borderRadius: ACRadii.card,
          }}>
            <ACLabel size={10} color={c.accent} style={{
              fontFamily: ACFonts.mono, fontWeight: 700,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              Share your link
            </ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
              letterSpacing: -0.5, marginTop: 12,
            }}>
              Invite a friend to atlas.core
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(239,233,218,0.7)',
              lineHeight: 1.5, marginTop: 8,
            }}>
              Share your personal link. When they sign up, you will be connected automatically.
            </div>

            {/* URL preview */}
            <div style={{
              marginTop: 16, padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,233,218,0.08)',
              border: '1px solid rgba(239,233,218,0.14)',
              fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.2,
              color: 'rgba(239,233,218,0.55)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {_inviteUrl}
            </div>

            <button
              type="button"
              onClick={() => { if (typeof onCopyInvite === 'function') onCopyInvite(); }}
              style={{
                marginTop: 14, width: '100%', padding: '14px 20px',
                background: c.accent, color: c.ink,
                border: 'none', borderRadius: ACRadii.button,
                fontFamily: ACFonts.body, fontSize: 16, fontWeight: 600,
                letterSpacing: -0.2, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4.5" y="4.5" width="8" height="8" rx="2" stroke={c.ink} strokeWidth="1.5" />
                <path d="M9.5 4.5V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2h1.5" stroke={c.ink} strokeWidth="1.5" />
              </svg>
              Copy invite link
            </button>
          </div>
        )}
      </div>

      <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S70_Friends;
