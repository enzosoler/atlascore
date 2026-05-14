// screens-p4.jsx — atlas.core app screens, PHASE 4
// Settings · PR gallery · Share card · Notifications · Empty/error states

// ══════════════════════════════════════════════════════════════
// P4-1 — SETTINGS
// ══════════════════════════════════════════════════════════════
function S19_Settings({ dark }) {
  const c = useACT(dark);
  const groups = [
    {
      l: 'Account',
      rows: [
        { k: 'profile',  t: 'Marcus Kane',   d: 'marcus@kane.co · member since Jan 24', chevron: true, avatar: true },
        { k: 'plan',     t: 'Core · annual', d: '$120 / year · renews 14 Jan 26',       chevron: true, chip: 'Pro' },
      ],
    },
    {
      l: 'Integrations',
      rows: [
        { k: 'hk',   t: 'Apple Health',    d: 'Read/write · syncing',         chevron: true, dot: 'on' },
        { k: 'oura', t: 'Oura ring',       d: 'Gen 4 · syncing',              chevron: true, dot: 'on' },
        { k: 'func', t: 'Function Health', d: '2 panels synced · Q2 pending', chevron: true, dot: 'on' },
        { k: 'gcal', t: 'Google Calendar', d: 'Not connected',                chevron: true, dot: 'off' },
      ],
    },
    {
      l: 'Preferences',
      rows: [
        { k: 'units',    t: 'Units',           d: 'Imperial · lb, in, °F',       chevron: true },
        { k: 'goals',    t: 'Daily targets',   d: '2,380 kcal · 186g protein',    chevron: true },
        { k: 'theme',    t: 'Appearance',      d: 'Auto · follows system',        chevron: true },
        { k: 'notifs',   t: 'Notifications',   d: '4 types active',               chevron: true },
      ],
    },
    {
      l: 'Data & privacy',
      rows: [
        { k: 'export',  t: 'Export data',      d: 'CSV · JSON · all time',        chevron: true },
        { k: 'photos',  t: 'Progress photos',  d: 'On-device only',               chevron: true, chip: 'Local' },
        { k: 'delete',  t: 'Delete all data',  d: 'Irreversible',                 chevron: true, danger: true },
      ],
    },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Settings</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            The system
          </div>
        </div>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono }}>v 2.4.1</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 26 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase', marginLeft: 2 }}>
              {g.l}
            </ACLabel>
            <div style={{
              marginTop: 10, background: c.card, borderRadius: ACRadii.card, overflow: 'hidden',
            }}>
              {g.rows.map((r, i) => (
                <div key={r.k} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                }}>
                  {r.avatar && (
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: c.fg, color: c.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
                    }}>MK</div>
                  )}
                  {r.dot && (
                    <div style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: r.dot === 'on' ? c.accent : c.mute,
                      flexShrink: 0,
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 15, fontWeight: 500,
                      color: r.danger ? '#e85a2f' : c.fg,
                    }}>
                      {r.t}
                      {r.chip && (
                        <span style={{
                          padding: '2px 7px', fontSize: 9, fontWeight: 700,
                          letterSpacing: 0.5, textTransform: 'uppercase',
                          background: c.accent, color: c.ink, borderRadius: 4,
                        }}>{r.chip}</span>
                      )}
                    </div>
                    <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.d}</ACLabel>
                  </div>
                  {r.chevron && (
                    <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
                      <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{
          textAlign: 'center', padding: '22px 0 8px',
        }}>
          <div style={{
            display: 'inline-block', padding: '10px 20px',
            border: `1px solid ${c.faint}`, borderRadius: 999,
            fontSize: 13, fontWeight: 600, color: c.dim,
          }}>
            Sign out
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <ACBrand dark={dark} size={14} />
          <div style={{
            marginTop: 8, fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 0.5,
          }}>
            Built for people who measure.
          </div>
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P4-2 — PR GALLERY
// ══════════════════════════════════════════════════════════════
function S20_PR_Gallery({ dark }) {
  const c = useACT(dark);
  const prs = [
    { lift: 'Deadlift',     w: '415', u: 'lb × 1', e1rm: '415', date: 'Apr 18', days: 'today', fresh: true },
    { lift: 'Bench press',  w: '275', u: 'lb × 1', e1rm: '275', date: 'Apr 11', days: '7d ago' },
    { lift: 'Back squat',   w: '325', u: 'lb × 3', e1rm: '352', date: 'Apr 04', days: '14d ago' },
    { lift: 'Overhead press', w: '165', u: 'lb × 1', e1rm: '165', date: 'Mar 28', days: '21d ago' },
    { lift: 'Weighted pullup', w: '95', u: 'lb × 5', e1rm: '108', date: 'Mar 21', days: '28d ago' },
    { lift: 'Front squat',  w: '255', u: 'lb × 3', e1rm: '276', date: 'Mar 14', days: '35d ago' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Personal records · all-time</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            The wall
          </div>
        </div>
        <ACChip accent dark={dark}>+6 this yr</ACChip>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Summary hero — this month's tonnage / PR count */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18,
        }}>
          <div>
            <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>April PRs</ACLabel>
            <ACNum size={76} color={c.bg} weight={700}>3</ACNum>
            <ACLabel size={11} color="rgba(239,233,218,0.6)">lifts moved · 52 total tonnes</ACLabel>
          </div>
          <div style={{
            borderLeft: '1px solid rgba(239,233,218,0.14)', paddingLeft: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Biggest lift</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginTop: 4 }}>415 lb</div>
              <ACLabel size={11} color="rgba(239,233,218,0.55)">Deadlift · today</ACLabel>
            </div>
            <div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.accent, fontWeight: 700 }}>+10 lb vs Feb</div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{
          marginTop: 18, display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 2,
        }}>
          {['All lifts', 'Squat', 'Bench', 'Deadlift', 'Press', 'Accessory'].map((t, i) => (
            <div key={t} style={{
              padding: '8px 14px', borderRadius: 999,
              background: i === 0 ? c.fg : c.card,
              color: i === 0 ? c.bg : c.fg,
              fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}>{t}</div>
          ))}
        </div>

        {/* Records list */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prs.map((r, i) => (
            <div key={i} style={{
              position: 'relative',
              padding: '16px 16px 16px 18px',
              background: c.card, borderRadius: ACRadii.card,
              display: 'flex', alignItems: 'center', gap: 14,
              overflow: 'hidden',
            }}>
              {r.fresh && (
                <div style={{
                  position: 'absolute', top: 10, right: 12,
                  padding: '3px 7px', fontSize: 9, fontWeight: 700,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  background: c.accent, color: c.ink, borderRadius: 4,
                }}>New</div>
              )}
              <TrophyStamp color={c.fg} accent={c.accent} fresh={r.fresh} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600,
                  letterSpacing: -0.3, color: c.fg,
                }}>{r.lift}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
                  <ACNum size={22} color={r.fresh ? c.accent : c.fg} weight={700}>{r.w}</ACNum>
                  <span style={{ fontSize: 11, color: c.dim, fontFamily: ACFonts.mono }}>{r.u}</span>
                </div>
                <div style={{
                  marginTop: 4, display: 'flex', gap: 10,
                  fontFamily: ACFonts.mono, fontSize: 10, color: c.mute,
                  letterSpacing: 0.3,
                }}>
                  <span>e1RM {r.e1rm}</span>
                  <span>·</span>
                  <span>{r.date}</span>
                  <span>·</span>
                  <span>{r.days}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="workout" dark={dark} />
    </div>
  );
}

function TrophyStamp({ color, accent, fresh }) {
  // A minimalist "bar + stack of plates" stamp instead of a literal trophy icon.
  return (
    <div style={{
      width: 46, height: 46, flexShrink: 0,
      border: `1.5px solid ${fresh ? accent : color}`,
      borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        {/* barbell bar */}
        <rect x="3" y="13.5" width="24" height="3" fill={fresh ? accent : color} />
        {/* left plate */}
        <rect x="5" y="9" width="3" height="12" fill={fresh ? accent : color} />
        {/* right plate */}
        <rect x="22" y="9" width="3" height="12" fill={fresh ? accent : color} />
        {/* left end cap */}
        <rect x="2" y="11" width="2" height="8" fill={fresh ? accent : color} opacity="0.6" />
        <rect x="26" y="11" width="2" height="8" fill={fresh ? accent : color} opacity="0.6" />
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P4-3 — SHARE CARD (post-PR, optimized for screenshot → IG)
// ══════════════════════════════════════════════════════════════
function S21_Share_Card({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Share PR</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, padding: '18px 22px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* The card itself — 9:16 phoneshot aspect */}
        <div style={{
          background: c.ink, color: '#efe9da',
          borderRadius: 22,
          aspectRatio: '9/12',
          padding: 24,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* watermark brand */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HeartMark size={14} color="#efe9da" accent={c.accent} />
              <span style={{
                fontFamily: ACFonts.brand, fontSize: 11, color: '#efe9da',
                letterSpacing: -0.4, textTransform: 'lowercase',
              }}>
                atlas<span style={{ color: c.accent }}>.</span>core
              </span>
            </div>
            <ACLabel size={9} color="rgba(239,233,218,0.5)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              18 APR 26
            </ACLabel>
          </div>

          {/* kicker */}
          <div style={{ marginTop: 24 }}>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
              Personal record · lift 014
            </ACLabel>
          </div>

          {/* big display */}
          <div style={{
            fontFamily: ACFonts.display, fontSize: 36, fontWeight: 700,
            letterSpacing: -1.4, lineHeight: 1, marginTop: 10,
          }}>
            Deadlift.
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            marginTop: 14,
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 140, fontWeight: 700,
              letterSpacing: -6, lineHeight: 0.82, color: '#efe9da',
              fontVariantNumeric: 'tabular-nums',
            }}>
              415
            </div>
            <div style={{ paddingBottom: 10, lineHeight: 1 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 13, color: c.accent, fontWeight: 700 }}>LB</div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: 'rgba(239,233,218,0.6)', marginTop: 3 }}>× 1</div>
            </div>
          </div>

          <div style={{
            marginTop: 4, fontFamily: ACFonts.mono, fontSize: 11,
            color: c.accent, fontWeight: 700, letterSpacing: 0.5,
          }}>
            +10 LB · 58 DAYS
          </div>

          {/* ECG divider */}
          <div style={{ marginTop: 18 }}>
            <ACSpark w={260} h={22} dark={true} color={c.accent} stroke={1.8} />
          </div>

          <div style={{ flex: 1 }} />

          {/* footer meta — grid of context */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0, paddingTop: 16,
            borderTop: '1px solid rgba(239,233,218,0.14)',
          }}>
            {[
              { k: 'e1RM',    v: '415' },
              { k: 'RPE',     v: '9.0' },
              { k: 'BODYWT',  v: '182' },
            ].map((m, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 12,
                borderLeft: i === 0 ? 'none' : '1px solid rgba(239,233,218,0.14)',
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle row */}
        <div style={{
          display: 'flex', gap: 6, padding: 4,
          background: c.card, borderRadius: 12,
        }}>
          {[
            { l: 'Dark', on: true },
            { l: 'Light', on: false },
            { l: 'Minimal', on: false },
          ].map((t, i) => (
            <div key={i} style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: t.on ? c.fg : 'transparent',
              color: t.on ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600, borderRadius: 8,
            }}>{t.l}</div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div style={{
        padding: '12px 22px 22px',
        display: 'flex', gap: 8,
      }}>
        <ShareBtn c={c} label="Save" icon="download" />
        <ShareBtn c={c} label="Stories" icon="ig" />
        <ShareBtn c={c} label="Copy link" icon="link" />
        <div style={{ flex: 1 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Share →</ACBtn>
        </div>
      </div>
    </div>
  );
}

function ShareBtn({ c, label, icon }) {
  const icons = {
    download: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    ig: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke={c.fg} strokeWidth="1.6"/><circle cx="8" cy="8" r="2.5" stroke={c.fg} strokeWidth="1.6"/><circle cx="11.5" cy="4.5" r="0.7" fill={c.fg}/></svg>,
    link: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 10L10 6M5 9a2.5 2.5 0 0 1 0-3.5l2-2a2.5 2.5 0 0 1 3.5 3.5l-1 1M11 7a2.5 2.5 0 0 1 0 3.5l-2 2a2.5 2.5 0 0 1-3.5-3.5l1-1" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  };
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 999,
      background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icons[icon]}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P4-4 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
function S22_Notifications({ dark }) {
  const [prefs, setPrefs] = React.useState({
    brief: true, pr: true, protein: true, labs: true, sleep: false, social: false,
  });
  const c = useACT(dark);
  const recent = [
    { t: 'Daily brief · ready',       d: 'Readiness 87 · three moves queued',              ago: '7m',  kind: 'brief',   fresh: true },
    { t: 'Lab panel in',              d: 'Function Q2 · 3 flags need attention',           ago: '2h',  kind: 'labs',    fresh: true },
    { t: 'PR window open',            d: 'Deadlift +10 projected · your bar is warm',      ago: '4h',  kind: 'pr' },
    { t: 'Protein below pace',        d: '92g / 186g · 10h left in day',                    ago: 'Yest', kind: 'protein' },
    { t: 'Bench press PR · 275 lb',   d: 'You moved 10 lb over last ceiling',               ago: '7d',  kind: 'pr' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Notifications</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Only what moves you
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 999, background: c.accent,
          }} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Recent list */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>Recent · 7 days</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Mark all read</ACLabel>
          </div>
          <div style={{ background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
            {recent.map((n, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
              }}>
                <NotifMark kind={n.kind} c={c} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.1 }}>
                      {n.t}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {n.fresh && <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />}
                      <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 0.3 }}>{n.ago}</span>
                    </div>
                  </div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{n.d}</ACLabel>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>Preferences</ACLabel>
          <div style={{
            marginTop: 10, background: c.card, borderRadius: ACRadii.card, overflow: 'hidden',
          }}>
            {[
              { k: 'brief',   t: 'Morning brief',    d: '7:30 AM · your daily plan' },
              { k: 'pr',      t: 'PR windows',       d: 'When your lifts look ready' },
              { k: 'protein', t: 'Nutrition nudges', d: 'If you fall behind target pace' },
              { k: 'labs',    t: 'Lab results',      d: 'New biomarkers in your inbox' },
              { k: 'sleep',   t: 'Sleep reminder',   d: 'Wind-down 30 min before bedtime' },
              { k: 'social',  t: 'Friends\' PRs',    d: 'When your crew hits a record' },
            ].map((r, i) => (
              <div key={r.k} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: c.fg }}>{r.t}</div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.d}</ACLabel>
                </div>
                <Toggle on={prefs[r.k]} c={c} onClick={() => setPrefs({ ...prefs, [r.k]: !prefs[r.k] })} />
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
            We only ping you for signals worth acting on. No streaks. No guilt. No badges.
          </ACLabel>
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

function NotifMark({ kind, c }) {
  const maps = {
    brief:   { bg: c.accent, fg: c.ink,  g: 'B' },
    pr:      { bg: c.fg,     fg: c.bg,   g: 'PR' },
    labs:    { bg: c.accent, fg: c.ink,  g: 'Lb' },
    protein: { bg: c.fg,     fg: c.bg,   g: 'F' },
  };
  const m = maps[kind] || maps.brief;
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 6,
      background: m.bg, color: m.fg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
      letterSpacing: -0.2,
    }}>
      {m.g}
    </div>
  );
}

function Toggle({ on, c, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? c.accent : c.faint,
      position: 'relative', cursor: 'pointer',
      transition: 'background 160ms ease',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: on ? c.ink : c.bg,
        transition: 'left 160ms ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P4-5 — EMPTY / ERROR STATES (three compact states in one)
// ══════════════════════════════════════════════════════════════
function S23_Empty_States({ dark }) {
  const c = useACT(dark);
  const [active, setActive] = React.useState('first-workout');
  const states = {
    'first-workout': <EmptyFirstWorkout c={c} dark={dark} />,
    'no-data':       <EmptyNoData c={c} dark={dark} />,
    'offline':       <EmptyOffline c={c} dark={dark} />,
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>System states</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Empty &amp; edges
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 6 }}>
        {[
          { k: 'first-workout', l: 'First run' },
          { k: 'no-data',       l: 'No data' },
          { k: 'offline',       l: 'Offline' },
        ].map(t => {
          const on = t.k === active;
          return (
            <div key={t.k} onClick={() => setActive(t.k)} style={{
              flex: 1, padding: '9px 0', textAlign: 'center',
              background: on ? c.fg : c.card,
              color: on ? c.bg : c.fg,
              fontSize: 12, fontWeight: 600, borderRadius: 999,
              cursor: 'pointer',
            }}>{t.l}</div>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '18px 22px 20px', display: 'flex' }}>
        {states[active]}
      </div>
    </div>
  );
}

function EmptyFirstWorkout({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      {/* Big empty barbell stamp */}
      <div style={{
        width: 160, height: 160, borderRadius: 18,
        border: `1.5px dashed ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
          <rect x="12" y="43" width="72" height="5" fill={c.fg} opacity="0.4" />
          <rect x="16" y="33" width="6" height="25" fill={c.fg} opacity="0.4" />
          <rect x="74" y="33" width="6" height="25" fill={c.fg} opacity="0.4" />
          <rect x="9"  y="38" width="4" height="15" fill={c.fg} opacity="0.25" />
          <rect x="83" y="38" width="4" height="15" fill={c.fg} opacity="0.25" />
        </svg>
        <div style={{
          position: 'absolute', bottom: -10, padding: '4px 10px',
          background: c.accent, color: c.ink,
          fontSize: 9, fontWeight: 700, letterSpacing: 0.7,
          borderRadius: 4, textTransform: 'uppercase',
        }}>
          Day 000
        </div>
      </div>

      <div style={{
        marginTop: 40, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1, color: c.fg, maxWidth: 280,
      }}>
        Your wall is <span style={{ color: c.accent }}>empty</span>.
      </div>
      <div style={{
        marginTop: 12, fontSize: 14.5, color: c.dim, lineHeight: 1.55,
        maxWidth: 280,
      }}>
        Log your first set. Every PR here started as zero. We'll build the system around you.
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <ACBtn primary dark={dark} size="lg" pill block>Start first workout →</ACBtn>
        <div style={{
          textAlign: 'center', padding: 8,
          fontSize: 13, fontWeight: 500, color: c.dim,
        }}>
          or <span style={{ color: c.fg, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>import from Hevy / Strong</span>
        </div>
      </div>
    </div>
  );
}

function EmptyNoData({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'stretch', padding: '0 8px',
    }}>
      <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        ApoB · 24 months
      </ACLabel>

      {/* Flatline chart with 'waiting' treatment */}
      <div style={{
        marginTop: 12, padding: 20, background: c.card,
        borderRadius: ACRadii.card, position: 'relative',
        overflow: 'hidden',
      }}>
        <svg width="100%" height="120" viewBox="0 0 280 120" fill="none">
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" x2="280" y1={24 + i * 24} y2={24 + i * 24}
              stroke={c.hair} strokeDasharray="2 4" />
          ))}
          {/* dashed horizontal skeleton line */}
          <line x1="0" x2="280" y1="72" y2="72"
            stroke={c.mute} strokeWidth="2" strokeDasharray="6 6" />
          {/* pending marker */}
          <circle cx="240" cy="72" r="5" fill={c.accent} />
          <circle cx="240" cy="72" r="10" fill="none" stroke={c.accent} strokeWidth="1.5" opacity="0.4" />
        </svg>
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '4px 9px', fontSize: 10, fontWeight: 700,
          letterSpacing: 0.5, textTransform: 'uppercase',
          background: c.accent, color: c.ink, borderRadius: 4,
        }}>Pending</div>
      </div>

      <div style={{
        marginTop: 24, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
        letterSpacing: -0.6, color: c.fg, lineHeight: 1.1,
      }}>
        No readings yet.
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: c.dim, lineHeight: 1.55 }}>
        Your first ApoB result will plot here. Function Health panels ship in 5–7 business days.
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex', gap: 8, marginTop: 18,
      }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="md" pill block>Remind me</ACBtn>
        </div>
        <div style={{ flex: 1.2 }}>
          <ACBtn primary dark={dark} size="md" pill block>Order panel →</ACBtn>
        </div>
      </div>
    </div>
  );
}

function EmptyOffline({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      {/* Severed ECG line as offline metaphor */}
      <div style={{ width: '100%', padding: '0 10px' }}>
        <svg width="100%" height="64" viewBox="0 0 280 64" fill="none">
          {/* left trace */}
          <path d="M0 32 L40 32 L50 24 L60 40 L70 32 L100 32"
            stroke={c.fg} strokeWidth="2" strokeLinejoin="miter" opacity="0.6" />
          {/* gap marker */}
          <line x1="118" y1="32" x2="162" y2="32" stroke={c.accent}
            strokeWidth="2" strokeDasharray="4 4" />
          {/* right trace */}
          <path d="M180 32 L210 32 L220 24 L230 40 L240 32 L280 32"
            stroke={c.fg} strokeWidth="2" strokeLinejoin="miter" opacity="0.6" />
          {/* end dots */}
          <circle cx="118" cy="32" r="4" fill={c.accent} />
          <circle cx="162" cy="32" r="4" fill={c.accent} />
        </svg>
      </div>

      <div style={{
        marginTop: 32, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1, lineHeight: 1, color: c.fg, maxWidth: 280,
      }}>
        Signal <span style={{ color: c.accent }}>lost</span>.
      </div>
      <div style={{
        marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55,
        maxWidth: 280,
      }}>
        You're offline. Everything you log stays safe on this device and syncs when you're back.
      </div>

      {/* Local queue readout */}
      <div style={{
        marginTop: 26, padding: 14,
        background: c.card, borderRadius: ACRadii.card,
        width: '100%', maxWidth: 280,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: 2, background: c.accent,
          }} />
          <div style={{ textAlign: 'left' }}>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Queued locally</ACLabel>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.fg, marginTop: 2 }}>
              4 sets · 1 meal
            </div>
          </div>
        </div>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>00:04:12 ago</ACLabel>
      </div>

      <div style={{ marginTop: 20, width: '100%' }}>
        <ACBtn dark={dark} size="lg" pill block>Retry connection</ACBtn>
      </div>
    </div>
  );
}

Object.assign(window, {
  S19_Settings, S20_PR_Gallery, S21_Share_Card, S22_Notifications, S23_Empty_States,
});
