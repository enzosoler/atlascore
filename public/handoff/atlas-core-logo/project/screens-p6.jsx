// screens-p6.jsx — atlas.core app screens, PHASE 6
// Session bookends + capture + companion surfaces:
// Workout summary · Weekly recap · Sleep detail · Capture · Profile · Watch · Search

// ══════════════════════════════════════════════════════════════
// P6-1 — WORKOUT SUMMARY (post-session)
// ══════════════════════════════════════════════════════════════
function S29_Workout_Summary({ dark }) {
  const c = useACT(dark);
  const lifts = [
    { n: 'Deadlift',     sets: '5×3', top: '415', hit: true,  rpe: 9.0, note: 'PR · +10 lb' },
    { n: 'Barbell row',  sets: '4×8', top: '185', hit: true,  rpe: 7.5 },
    { n: 'Hip thrust',   sets: '3×10', top: '275', hit: true, rpe: 7.0 },
    { n: 'Hamstring curl', sets: '3×12', top: '90', hit: false, rpe: 8.0, note: 'short 2 reps set 3' },
    { n: 'Plank',        sets: '3×60s', top: '—', hit: true,  rpe: 6.5 },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>SESSION 087 · 18 APR</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4-4 4 4M7 1v9M2 13h10" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Big moment — "you just did" */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Session complete
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 44, fontWeight: 700,
          letterSpacing: -1.8, lineHeight: 0.95, color: c.fg,
        }}>
          Heavy Lower.
        </div>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          58 MIN · 5 LIFTS · 18 SETS · 1 PR
        </div>

        {/* Four-up signal grid — inverted card, so colors flip:
            card bg = c.fg, text on it = c.bg. Labels use ink-alpha. */}
        <div style={{
          marginTop: 22, padding: 20, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        }}>
          {[
            { k: 'Tonnage',     v: '18,420', u: 'lb' },
            { k: 'Top set',     v: '415',    u: 'lb', accent: true },
            { k: 'Avg RPE',     v: '7.6',    u: '/10' },
            { k: 'Rest',        v: '2:14',   u: 'avg' },
          ].map((m, i) => (
            <div key={i} style={{
              padding: '4px 0',
              borderTop: i >= 2 ? `1px solid ${dark ? 'rgba(10,10,10,0.14)' : 'rgba(239,233,218,0.14)'}` : 'none',
              paddingTop: i >= 2 ? 16 : 0,
              paddingLeft: i % 2 === 1 ? 16 : 0,
              borderLeft: i % 2 === 1 ? `1px solid ${dark ? 'rgba(10,10,10,0.14)' : 'rgba(239,233,218,0.14)'}` : 'none',
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <span style={{
                  fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
                  letterSpacing: -1, color: m.accent ? c.accent : c.bg,
                  fontVariantNumeric: 'tabular-nums',
                }}>{m.v}</span>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)' }}>{m.u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tonnage bar — session vs 12-week avg */}
        <div style={{
          marginTop: 14, padding: 16, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Volume · this vs 12-wk avg
            </ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 700 }}>+22%</ACLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, width: 34 }}>Avg</ACLabel>
              <div style={{ flex: 1, height: 10, background: c.faint }}>
                <div style={{ width: '62%', height: '100%', background: c.dim }} />
              </div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, width: 46, textAlign: 'right' }}>15,080</ACLabel>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ACLabel size={10} color={c.fg} style={{ fontFamily: ACFonts.mono, width: 34, fontWeight: 700 }}>Today</ACLabel>
              <div style={{ flex: 1, height: 10, background: c.faint }}>
                <div style={{ width: '78%', height: '100%', background: c.accent }} />
              </div>
              <ACLabel size={10} color={c.fg} style={{ fontFamily: ACFonts.mono, width: 46, textAlign: 'right', fontWeight: 700 }}>18,420</ACLabel>
            </div>
          </div>
        </div>

        {/* Lift log */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            The work · 5 lifts
          </ACLabel>
          <div style={{ marginTop: 12 }}>
            {lifts.map((l, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: l.note && l.note.includes('PR') ? c.accent : (l.hit ? c.fg : 'transparent'),
                  border: !l.hit ? `1.5px dashed ${c.faint}` : 'none',
                  color: l.note && l.note.includes('PR') ? c.ink : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {l.hit && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5L4 8L9.5 2.5" stroke={l.note && l.note.includes('PR') ? c.ink : c.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{l.n}</div>
                  {l.note && (
                    <div style={{
                      marginTop: 3, fontFamily: ACFonts.mono, fontSize: 10.5,
                      color: l.note.includes('PR') ? c.accent : c.mute,
                      letterSpacing: 0.3, fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>{l.note}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 13, color: c.fg, fontWeight: 600 }}>
                    {l.sets}
                  </div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, marginTop: 2 }}>
                    {l.top !== '—' && <>top <span style={{ color: c.fg }}>{l.top}</span> · </>}RPE {l.rpe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's next */}
        <div style={{
          marginTop: 22, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Next · Mon Apr 20
          </ACLabel>
          <div style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: c.fg }}>
            Upper push · Moderate
          </div>
          <div style={{
            marginTop: 4, fontFamily: ACFonts.mono, fontSize: 11,
            color: c.dim, letterSpacing: 0.3,
          }}>
            Bench 4×6 @ 80% · OHP 3×8 · Dips · Incline DB
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block>Share PR</ACBtn>
        </div>
        <div style={{ flex: 1.3 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Save · close →</ACBtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P6-2 — WEEKLY RECAP (Sunday)  ← novel zine/poster moment
// ══════════════════════════════════════════════════════════════
function S30_Weekly_Recap({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.ink, color: '#efe9da' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="#efe9da" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7 }}>WK 16 · SUN 19 APR</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '22px 22px 30px' }}>
        {/* Big poster title */}
        <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.accent, letterSpacing: 1, fontWeight: 700 }}>
          ISSUE 016 · THE WEEK IN REVIEW
        </div>
        <div style={{
          marginTop: 12, fontFamily: ACFonts.brand, fontSize: 56, lineHeight: 0.85,
          letterSpacing: -2.5, textTransform: 'lowercase',
          color: '#efe9da',
        }}>
          you<br/>
          <span style={{ color: c.accent }}>showed</span><br/>
          up.
        </div>
        <div style={{
          marginTop: 14, fontSize: 13, color: 'rgba(239,233,218,0.65)',
          lineHeight: 1.5, maxWidth: 260,
        }}>
          Five sessions. One record. Protein held. Sleep slipped Thursday — we noticed.
        </div>

        {/* Poster-style stat strip */}
        <div style={{
          marginTop: 24, display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: 0,
          borderTop: '1px solid rgba(239,233,218,0.18)',
          borderBottom: '1px solid rgba(239,233,218,0.18)',
        }}>
          {[
            { k: 'Sessions', v: '5', sub: 'of 5 planned', hi: true },
            { k: 'Tonnes',   v: '52', sub: '+8 vs last', hi: true },
            { k: 'Protein',  v: '94%', sub: 'of target' },
            { k: 'Sleep',    v: '7:08', sub: '−0:22' },
          ].map((m, i) => (
            <div key={i} style={{
              padding: '18px 14px',
              borderLeft: i % 2 === 1 ? '1px solid rgba(239,233,218,0.18)' : 'none',
              borderTop: i >= 2 ? '1px solid rgba(239,233,218,0.18)' : 'none',
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
                letterSpacing: -1.2, marginTop: 6, lineHeight: 1,
                color: m.hi ? c.accent : '#efe9da',
                fontVariantNumeric: 'tabular-nums',
              }}>{m.v}</div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.45)', marginTop: 4, letterSpacing: 0.3 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Headline of the week */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
            ── The headline
          </div>
          <div style={{
            marginTop: 10, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
            letterSpacing: -0.6, lineHeight: 1.2, color: '#efe9da',
          }}>
            You pulled <span style={{ color: c.accent }}>415</span> on Saturday. That's 58 days after the last ceiling — and eighteen weeks of deadlift work paid out.
          </div>
        </div>

        {/* Day bars */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
            ── Daily tonnage
          </div>
          <div style={{
            marginTop: 14, display: 'flex', gap: 6, height: 100,
            alignItems: 'flex-end',
          }}>
            {[
              { d: 'M', v: 55 },
              { d: 'T', v: 0 },
              { d: 'W', v: 72 },
              { d: 'T', v: 40 },
              { d: 'F', v: 35 },
              { d: 'S', v: 95, hi: true },
              { d: 'S', v: 0 },
            ].map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%', height: b.v > 0 ? `${b.v}%` : 2,
                  background: b.hi ? c.accent : (b.v === 0 ? 'rgba(239,233,218,0.15)' : '#efe9da'),
                }} />
                <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: b.hi ? c.accent : 'rgba(239,233,218,0.5)', fontWeight: 700 }}>{b.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Moments feed */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
            ── Moments
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { d: 'MON', t: 'Heavy Upper · 4 sets @ RPE 9' },
              { d: 'WED', t: 'Sleep dropped to 6:12 · we rescheduled Heavy Pull' },
              { d: 'FRI', t: 'Hit 186g protein target · first time this block' },
              { d: 'SAT', t: 'Deadlift 415 lb · all-time record', hi: true },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, paddingBottom: 14,
                borderBottom: '1px solid rgba(239,233,218,0.12)',
              }}>
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
                  color: m.hi ? c.accent : 'rgba(239,233,218,0.55)',
                  letterSpacing: 0.5, width: 34,
                }}>{m.d}</div>
                <div style={{
                  flex: 1, fontSize: 13.5, lineHeight: 1.5,
                  color: m.hi ? c.accent : 'rgba(239,233,218,0.85)',
                  fontWeight: m.hi ? 600 : 400,
                }}>{m.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kicker / next week */}
        <div style={{
          marginTop: 26, padding: 18,
          border: `1px solid ${c.accent}`,
        }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
            ── Next issue · wk 17
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: '#efe9da', lineHeight: 1.55 }}>
            Deload week. Volume drops 40%, intensity holds. Your nervous system earned it.
          </div>
        </div>

        {/* Footer credit */}
        <div style={{
          marginTop: 30, paddingTop: 16,
          borderTop: '1px solid rgba(239,233,218,0.18)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <ACBrand size={12} dark={true} />
          <ACLabel size={9} color="rgba(239,233,218,0.45)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7 }}>
            END / ISSUE 016
          </ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P6-3 — SLEEP DETAIL (HRV + stages timeline)
// ══════════════════════════════════════════════════════════════
function S31_Sleep_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>LAST NIGHT · 17→18 APR</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v8M2 10l8-8" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Sleep · 84 / 100
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 56, fontWeight: 700,
          letterSpacing: -2.2, lineHeight: 0.95, color: c.fg,
          fontVariantNumeric: 'tabular-nums',
        }}>
          7<span style={{ color: c.accent }}>:</span>42
        </div>
        <div style={{
          marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          23:18 → 07:00 · 94% EFFICIENCY
        </div>

        {/* Stages timeline — layered strip */}
        <div style={{
          marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>Stages</ACLabel>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>23:18 — 07:00</ACLabel>
          </div>
          {/* Y-axis labels + timeline */}
          <div style={{ display: 'flex', gap: 8, height: 110, alignItems: 'stretch' }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', paddingTop: 2, paddingBottom: 2,
            }}>
              {['AWAKE','REM','LIGHT','DEEP'].map(l => (
                <div key={l} style={{
                  fontFamily: ACFonts.mono, fontSize: 8.5, color: c.mute,
                  letterSpacing: 0.5, textAlign: 'right',
                }}>{l}</div>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="100%" height="110" viewBox="0 0 280 110" preserveAspectRatio="none">
                {/* grid */}
                {[0,1,2,3].map(i => (
                  <line key={i} x1="0" x2="280" y1={i * 28 + 8} y2={i * 28 + 8}
                    stroke={c.hair} strokeDasharray="2 3"/>
                ))}
                {/* stage segments: x0, x1, lane (0=awake 3=deep) */}
                {(() => {
                  const segs = [
                    [0, 6, 2],    // light
                    [6, 30, 3],   // deep
                    [30, 50, 2],  // light
                    [50, 72, 3],  // deep
                    [72, 100, 1], // REM
                    [100, 120, 2],
                    [120, 128, 0], // brief awake
                    [128, 160, 1], // REM
                    [160, 186, 2],
                    [186, 205, 3],
                    [205, 232, 1],
                    [232, 260, 2],
                    [260, 280, 1],
                  ];
                  return segs.map((s, i) => {
                    const y = s[2] * 28 + 4;
                    const isDeep = s[2] === 3;
                    const isAwake = s[2] === 0;
                    return (
                      <rect key={i}
                        x={s[0]} y={y} width={s[1] - s[0]} height={8}
                        fill={isAwake ? c.accent : (isDeep ? c.fg : c.dim)}
                        opacity={isDeep ? 1 : (isAwake ? 1 : 0.55)} />
                    );
                  });
                })()}
                {/* connecting line across stages */}
                <path d="M3 64 L6 64 L6 92 L30 92 L30 64 L50 64 L50 92 L72 92 L72 36 L100 36 L100 64 L120 64 L120 8 L128 8 L128 36 L160 36 L160 64 L186 64 L186 92 L205 92 L205 36 L232 36 L232 64 L260 64 L260 36 L280 36"
                  fill="none" stroke={c.mute} strokeWidth="0.8" opacity="0.6" />
              </svg>
            </div>
          </div>
          {/* x-axis hours */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginLeft: 44, marginTop: 6,
          }}>
            {['23','00','02','04','06','07'].map(h => (
              <span key={h} style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>

          {/* legend w/ durations */}
          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: `1px solid ${c.hair}`,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          }}>
            {[
              { k: 'DEEP',  v: '1:48', sub: '23%', col: c.fg },
              { k: 'LIGHT', v: '3:32', sub: '46%', col: c.dim, op: 0.55 },
              { k: 'REM',   v: '2:04', sub: '27%', col: c.dim, op: 0.55 },
              { k: 'AWAKE', v: '0:18', sub: '4%',  col: c.accent },
            ].map((s, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 10,
                borderLeft: i === 0 ? 'none' : `1px solid ${c.hair}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, background: s.col, opacity: s.op || 1 }} />
                  <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.dim, letterSpacing: 0.5 }}>{s.k}</span>
                </div>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
                  color: c.fg, marginTop: 4, fontVariantNumeric: 'tabular-nums',
                }}>{s.v}</div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Signals during night */}
        <div style={{
          marginTop: 14, display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {[
            { k: 'HRV', v: '62', u: 'ms', trend: '+4', data: [45,48,52,50,55,58,62,60,58,62,65,60,58,62] },
            { k: 'RHR', v: '51', u: 'bpm', trend: '−2', data: [62,58,55,52,50,48,50,52,49,51,50,48,50,51] },
            { k: 'RESP', v: '14.8', u: '/min', trend: '+0.2', data: [14,15,14,13,14,15,14,14,15,15,14,14,15,14.8] },
            { k: 'TEMP', v: '+0.3', u: '°F', trend: 'normal', data: [0,-0.1,0.1,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0.3,0.3,0.4,0.3] },
          ].map((m, i) => (
            <div key={i} style={{
              padding: 14, background: c.card, borderRadius: ACRadii.card,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <ACLabel size={9} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</ACLabel>
                <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, fontWeight: 700 }}>{m.trend}</ACLabel>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                <ACNum size={24} color={c.fg} weight={700}>{m.v}</ACNum>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{m.u}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <ACSpark w={130} h={20} dark={dark} data={m.data.map((v,idx) => (v / Math.max(...m.data)) * 80 + 10)} stroke={1.4} />
              </div>
            </div>
          ))}
        </div>

        {/* Coach takeaway */}
        <div style={{
          marginTop: 16, padding: 18,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Coach take
          </ACLabel>
          <div style={{ marginTop: 8, fontSize: 13.5, color: c.fg, lineHeight: 1.55 }}>
            Deep sleep came early and held — that's why readiness is 87 this morning. HRV is at the top of your 30-day band. Pull heavy today if the bar feels warm.
          </div>
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P6-4 — CAPTURE SURFACES (scan / camera / voice — 3 in one)
// ══════════════════════════════════════════════════════════════
function S32_Capture({ dark }) {
  const [active, setActive] = React.useState('scan');
  const c = useACT(dark);
  const views = {
    scan: <CaptureScan c={c} dark={dark} />,
    camera: <CaptureCamera c={c} dark={dark} />,
    voice: <CaptureVoice c={c} dark={dark} />,
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.ink }}>
      {/* top bar */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="#efe9da" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={11} color="rgba(239,233,218,0.75)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, fontWeight: 600 }}>
          LOG FUEL · 12:41 PM
        </ACLabel>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M3 11l8-8" stroke="#efe9da" strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/></svg>
        </div>
      </div>

      {/* viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {views[active]}
      </div>

      {/* mode switcher */}
      <div style={{ padding: '10px 22px 28px' }}>
        <div style={{
          padding: 5, display: 'flex', gap: 3,
          background: 'rgba(239,233,218,0.08)',
          borderRadius: 999, backdropFilter: 'blur(10px)',
        }}>
          {[
            { k: 'scan', l: 'Barcode' },
            { k: 'camera', l: 'Photo' },
            { k: 'voice', l: 'Voice' },
          ].map(t => {
            const on = t.k === active;
            return (
              <div key={t.k} onClick={() => setActive(t.k)} style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: on ? c.accent : 'transparent',
                color: on ? c.ink : 'rgba(239,233,218,0.75)',
                fontSize: 12, fontWeight: 700, borderRadius: 999,
                letterSpacing: -0.2, cursor: 'pointer',
              }}>{t.l}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CaptureScan({ c, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Viewfinder area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26 }}>
        <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
          {/* corner brackets */}
          {[
            { t: 0, l: 0, r: 'tl' },
            { t: 0, r: 0 },
            { b: 0, l: 0 },
            { b: 0, r: 0 },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', width: 36, height: 36,
              top: p.t, bottom: p.b, left: p.l, right: p.r,
              borderTop: p.t !== undefined ? `3px solid ${c.accent}` : 'none',
              borderBottom: p.b !== undefined ? `3px solid ${c.accent}` : 'none',
              borderLeft: p.l !== undefined ? `3px solid ${c.accent}` : 'none',
              borderRight: p.r !== undefined ? `3px solid ${c.accent}` : 'none',
            }} />
          ))}
          {/* Barcode illustration — found */}
          <div style={{
            position: 'absolute', top: '38%', left: '12%', right: '12%',
            display: 'flex', gap: 1.5, height: 48, alignItems: 'stretch',
          }}>
            {Array.from({length: 32}).map((_, i) => (
              <div key={i} style={{
                flex: (i % 4 === 0) ? 2.5 : ((i % 3 === 0) ? 0.8 : 1.4),
                background: '#efe9da', opacity: 0.9,
              }} />
            ))}
          </div>
          {/* scan line */}
          <div style={{
            position: 'absolute', top: '62%', left: '8%', right: '8%',
            height: 2, background: c.accent,
            boxShadow: `0 0 18px ${c.accent}`,
          }} />
        </div>
      </div>

      {/* Result card — found product */}
      <div style={{ padding: '0 22px' }}>
        <div style={{
          padding: 16, background: 'rgba(239,233,218,0.96)',
          borderRadius: ACRadii.card, color: c.ink,
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <div style={{
            width: 52, height: 52, background: c.ink, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, color: '#efe9da' }}>FG</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>Found · FairLife 26g</ACLabel>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.ink, marginTop: 3, letterSpacing: -0.2 }}>
              Core Power chocolate
            </div>
            <div style={{ marginTop: 3, fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(10,10,10,0.55)', letterSpacing: 0.3 }}>
              170 kcal · 26P · 8C · 4.5F · 14 fl oz
            </div>
          </div>
          <div style={{
            padding: '8px 14px', background: c.accent, color: c.ink,
            fontSize: 12, fontWeight: 700, borderRadius: 999,
          }}>Add</div>
        </div>
      </div>
    </div>
  );
}

function CaptureCamera({ c, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* fake photo frame w/ detected zones */}
      <div style={{ flex: 1, position: 'relative', margin: '8px 22px 0' }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #4a3c28 0%, #7a6548 60%, #a88960 100%)',
          borderRadius: 14, position: 'relative', overflow: 'hidden',
        }}>
          {/* grid overlay */}
          <div style={{
            position: 'absolute', inset: 16,
            border: '1px dashed rgba(239,233,218,0.25)',
          }} />
          {/* detection pins */}
          {[
            { x: '25%', y: '30%', l: 'chicken', v: '6 oz' },
            { x: '62%', y: '42%', l: 'rice',    v: '1 cup' },
            { x: '72%', y: '72%', l: 'broccoli', v: '~2 cups' },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: p.x, top: p.y,
              transform: 'translate(-50%, -50%)',
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: 999,
                background: c.accent, border: '2px solid #efe9da',
                boxShadow: `0 0 12px ${c.accent}`,
              }} />
              <div style={{
                position: 'absolute', top: 18, left: 0,
                padding: '4px 8px', background: 'rgba(10,10,10,0.85)',
                color: '#efe9da', borderRadius: 4,
                fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.3,
                whiteSpace: 'nowrap', fontWeight: 600,
              }}>{p.l.toUpperCase()} · {p.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis card */}
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{
          padding: 16, background: 'rgba(239,233,218,0.96)', color: c.ink,
          borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>3 items detected</ACLabel>
            <ACLabel size={10} color="rgba(10,10,10,0.5)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>Confidence 92%</ACLabel>
          </div>
          <div style={{
            marginTop: 10, display: 'flex', gap: 16,
            fontFamily: ACFonts.display,
          }}>
            {[
              { k: 'kcal', v: '540', hi: true },
              { k: 'P',    v: '48g' },
              { k: 'C',    v: '52g' },
              { k: 'F',    v: '14g' },
            ].map((m, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 12,
                borderLeft: i === 0 ? 'none' : '1px solid rgba(10,10,10,0.1)',
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(10,10,10,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.hi ? c.accent : c.ink, letterSpacing: -0.5, marginTop: 2 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureVoice({ c, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 22px', position: 'relative' }}>
      {/* Ring meter */}
      <div style={{
        position: 'relative',
        width: 200, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* outer pulse */}
        <div style={{
          position: 'absolute', inset: -8,
          borderRadius: 999, border: `2px solid ${c.accent}`, opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: 999, border: `1px solid rgba(239,233,218,0.2)`,
        }} />
        {/* waveform */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[18, 36, 58, 80, 50, 28, 68, 92, 62, 40, 72, 34, 22, 50, 30].map((h, i) => (
            <div key={i} style={{
              width: 3, height: h, background: c.accent, borderRadius: 2,
              opacity: 0.55 + (h / 200),
            }} />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 28, fontFamily: ACFonts.mono, fontSize: 10,
        color: 'rgba(239,233,218,0.55)', letterSpacing: 0.8, fontWeight: 700,
        textAlign: 'center', textTransform: 'uppercase',
      }}>
        Listening · 0:04
      </div>

      {/* Transcribed line */}
      <div style={{
        marginTop: 22, width: '100%', padding: 18,
        background: 'rgba(239,233,218,0.06)', borderRadius: ACRadii.card,
      }}>
        <div style={{
          fontSize: 17, color: '#efe9da', lineHeight: 1.45,
          letterSpacing: -0.3,
        }}>
          "Had a <span style={{ color: c.accent, fontWeight: 600 }}>six ounce ribeye</span>, <span style={{ color: c.accent, fontWeight: 600 }}>sweet potato</span>, and a <span style={{ color: c.accent, fontWeight: 600 }}>handful of almonds</span>…"
        </div>
      </div>

      {/* parsed items */}
      <div style={{
        marginTop: 12, width: '100%',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {[
          { t: 'Ribeye · 6 oz',           k: '420 · 48P' },
          { t: 'Sweet potato · medium',    k: '105 · 2P' },
          { t: 'Almonds · ~1 oz',          k: '164 · 6P' },
        ].map((r, i) => (
          <div key={i} style={{
            padding: '10px 14px', background: 'rgba(239,233,218,0.94)',
            color: c.ink, borderRadius: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.t}</span>
            <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(10,10,10,0.6)', letterSpacing: 0.3 }}>{r.k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P6-5 — PROFILE / PUBLIC PAGE
// ══════════════════════════════════════════════════════════════
function S33_Profile({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: c.card, border: `1px solid ${c.faint}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>@marcus · public</ACLabel>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: c.card, border: `1px solid ${c.faint}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="4" height="14" viewBox="0 0 4 14" fill="none">
            <circle cx="2" cy="2" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="7" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="12" r="1.6" fill={c.fg}/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Hero card — inverted */}
        <div style={{ padding: '14px 22px 0' }}>
          <div style={{
            padding: 24, background: c.fg, color: c.bg,
            borderRadius: ACRadii.card, position: 'relative',
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 68, height: 68, borderRadius: 999,
                background: c.accent, color: c.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
                letterSpacing: -0.8, flexShrink: 0,
              }}>MK</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>
                  Marcus Kane
                </div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: dark ? 'rgba(10,10,10,0.62)' : 'rgba(239,233,218,0.72)', marginTop: 4, letterSpacing: 0.3, fontWeight: 600 }}>
                  @marcus · joined JAN 24
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: dark ? 'rgba(10,10,10,0.82)' : 'rgba(239,233,218,0.9)', lineHeight: 1.5 }}>
                  Chasing 500. Slow lifter, good sleeper. Measurements over motivation.
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div style={{
              marginTop: 22, paddingTop: 18,
              borderTop: `1px solid ${dark ? 'rgba(10,10,10,0.18)' : 'rgba(239,233,218,0.28)'}`,
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            }}>
              {[
                { k: 'PRs',      v: '14' },
                { k: 'Sessions', v: '87' },
                { k: 'Crew',     v: '5' },
              ].map((m, i) => (
                <div key={i} style={{
                  borderLeft: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(10,10,10,0.18)' : 'rgba(239,233,218,0.28)'}`,
                  paddingLeft: i === 0 ? 0 : 14,
                }}>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.62)' : 'rgba(239,233,218,0.62)', letterSpacing: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>{m.k}</div>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.8, marginTop: 4, color: c.bg }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 22px 20px' }}>
          {/* Big 4 lifts */}
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            The big four
          </ACLabel>
          <div style={{
            marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            {[
              { l: 'Deadlift', v: '415', u: 'lb', hi: true },
              { l: 'Squat',    v: '325', u: 'lb' },
              { l: 'Bench',    v: '275', u: 'lb' },
              { l: 'OHP',      v: '165', u: 'lb' },
            ].map((lift, i) => (
              <div key={i} style={{
                padding: 14, background: c.card, borderRadius: ACRadii.card,
              }}>
                <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                  {lift.l}
                </ACLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                  <ACNum size={26} color={lift.hi ? c.accent : c.fg} weight={700}>{lift.v}</ACNum>
                  <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{lift.u}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Current program strip */}
          <div style={{
            marginTop: 18, padding: 14, background: c.card,
            borderRadius: ACRadii.card,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, background: c.fg, color: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: ACFonts.display, fontWeight: 700, fontSize: 14,
              borderRadius: 8,
            }}>W7</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>Running</ACLabel>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, marginTop: 2 }}>5/3/1 BBB · week 7 of 16</div>
            </div>
            {/* mini progress */}
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({length: 16}).map((_, i) => (
                <div key={i} style={{
                  width: 3, height: 22,
                  background: i < 7 ? c.accent : c.faint,
                }} />
              ))}
            </div>
          </div>

          {/* Composition mini */}
          <div style={{
            marginTop: 10, padding: 18, background: c.card, borderRadius: ACRadii.card,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                Composition · 90d
              </ACLabel>
              <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.3 }}>−2.1 lb · +1.4 LBM</ACLabel>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <div>
                <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Weight</ACLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <ACNum size={22} color={c.fg} weight={700}>182.4</ACNum>
                  <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.dim }}>lb</span>
                </div>
              </div>
              <div style={{ flex: 1, paddingTop: 14 }}>
                <ACLine w={160} h={40} dark={dark} data={[184.5,184.1,183.8,183.9,183.4,183.2,182.8,182.6,182.4].map((v,k)=>({k,v}))} />
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ marginTop: 22 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Recent
            </ACLabel>
            <div style={{ marginTop: 10 }}>
              {[
                { t: 'Deadlift PR · 415 lb', d: '4h', hi: true },
                { t: 'Completed Heavy Lower',  d: '4h' },
                { t: 'Hit 186g protein',       d: 'Yest' },
                { t: 'Ordered Function Q3 panel', d: '3d' },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  <div style={{
                    width: 6, height: 6,
                    background: r.hi ? c.accent : c.mute,
                  }} />
                  <div style={{
                    flex: 1, fontSize: 13, color: c.fg,
                    fontWeight: r.hi ? 600 : 400,
                  }}>{r.t}</div>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>{r.d}</ACLabel>
                </div>
              ))}
            </div>
          </div>

          {/* Cred strip */}
          <div style={{
            marginTop: 20, padding: 14, border: `1px dashed ${c.faint}`,
            borderRadius: ACRadii.card,
            display: 'flex', gap: 10, flexWrap: 'wrap',
          }}>
            {['Slow compounder', '14-day streak', 'e1RM +12% YTD', 'No streaks enabled'].map(t => (
              <div key={t} style={{
                padding: '5px 10px', fontSize: 10,
                fontFamily: ACFonts.mono, letterSpacing: 0.4,
                color: c.dim, border: `1px solid ${c.hair}`,
                borderRadius: 999, textTransform: 'uppercase', fontWeight: 600,
              }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <ACTabBar active="you" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P6-6 — WATCH COMPANION (Apple Watch during-set)  ← novel
// ══════════════════════════════════════════════════════════════
function S34_Watch({ dark }) {
  const c = useACT(dark);
  // Draw a 44mm-ish pitch-black watch face floating on the screen.
  // Phone context around it: "mirroring to watch"
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Companion · watch</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            On the wrist
          </div>
        </div>
        <ACChip accent dark={dark} dot>Live</ACChip>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 22px 0' }}>
        {/* Watch device frame */}
        <div style={{
          width: 200, height: 240, position: 'relative',
          filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.3))',
        }}>
          {/* side crown */}
          <div style={{
            position: 'absolute', right: -6, top: 70,
            width: 10, height: 30, borderRadius: 4,
            background: '#222',
          }} />
          <div style={{
            position: 'absolute', right: -4, top: 112,
            width: 6, height: 18, borderRadius: 2,
            background: '#333',
          }} />
          {/* watch body */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#0a0a0a', borderRadius: 46,
            border: '3px solid #1a1a1a',
            overflow: 'hidden',
          }}>
            {/* Face content */}
            <div style={{
              position: 'absolute', inset: 14,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Top: set counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: '#efe9da', opacity: 0.55, letterSpacing: 0.6, fontWeight: 700 }}>DEADLIFT</span>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.5, fontWeight: 700 }}>SET 4/5</span>
              </div>

              {/* Center weight */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 62, fontWeight: 700,
                  letterSpacing: -3, lineHeight: 1, color: '#efe9da',
                  fontVariantNumeric: 'tabular-nums',
                }}>415</div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.accent, letterSpacing: 0.5, fontWeight: 700, marginTop: 2 }}>LB × 1 · PR</div>
              </div>

              {/* Bottom: rest timer ring + HR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 42, height: 42 }}>
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="18" stroke="rgba(239,233,218,0.15)" strokeWidth="3" fill="none"/>
                    <circle cx="21" cy="21" r="18" stroke={c.accent} strokeWidth="3" fill="none"
                      strokeDasharray={`${2 * Math.PI * 18 * 0.62} ${2 * Math.PI * 18}`}
                      transform="rotate(-90 21 21)" strokeLinecap="butt"/>
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700, color: '#efe9da',
                    letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums',
                  }}>1:24</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
                    color: '#efe9da', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
                  }}>132</div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 8, color: 'rgba(239,233,218,0.5)', letterSpacing: 0.5, fontWeight: 600 }}>BPM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* strap hint */}
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.7, marginTop: 16, fontWeight: 600 }}>
          44 MM · SERIES 10 · MIRRORED
        </div>

        {/* Phone view — what's mirroring */}
        <div style={{
          marginTop: 28, width: '100%', padding: 18,
          background: c.card, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Mirroring to watch
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { k: 'During set', v: 'Weight · reps · BPM', on: true },
              { k: 'Between sets', v: 'Rest timer + next target', on: true },
              { k: 'Haptic at rest-end', v: 'Double tap · 0:00', on: true },
              { k: 'Raise-to-log reps', v: 'Auto-count', on: false },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 8, height: 8,
                  background: r.on ? c.accent : c.faint,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>{r.k}</div>
                  <ACLabel size={11} color={c.dim} style={{ marginTop: 1, display: 'block' }}>{r.v}</ACLabel>
                </div>
                <ACLabel size={10} color={r.on ? c.accent : c.mute} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5 }}>
                  {r.on ? 'ON' : 'OFF'}
                </ACLabel>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block>Settings</ACBtn>
        </div>
        <div style={{ flex: 1.4 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Open in Watch app →</ACBtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P6-7 — SEARCH (universal find)
// ══════════════════════════════════════════════════════════════
function S35_Search({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Search bar at top */}
      <div style={{ padding: '14px 22px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: c.card,
          borderRadius: 14,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke={c.dim} strokeWidth="1.8"/>
            <path d="M11 11l3.5 3.5" stroke={c.dim} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div style={{ flex: 1, fontSize: 15, color: c.fg, letterSpacing: -0.2, fontWeight: 500 }}>
            deadlift
            <span style={{ display: 'inline-block', width: 1.5, height: 14, background: c.accent, marginLeft: 2, verticalAlign: 'middle' }} />
          </div>
          <div style={{
            padding: '3px 8px', fontSize: 10, fontWeight: 700,
            color: c.dim, background: c.faint, borderRadius: 4,
            letterSpacing: 0.3, fontFamily: ACFonts.mono,
          }}>⌘K</div>
        </div>

        {/* Scope chips */}
        <div style={{
          marginTop: 10, display: 'flex', gap: 6, overflow: 'auto',
        }}>
          {['All', 'Lifts', 'Foods', 'Labs', 'Programs', 'People'].map((s, i) => (
            <div key={s} style={{
              padding: '6px 12px', borderRadius: 999,
              background: i === 0 ? c.fg : 'transparent',
              border: i === 0 ? 'none' : `1px solid ${c.hair}`,
              color: i === 0 ? c.bg : c.dim,
              fontSize: 11, fontWeight: 600,
              flexShrink: 0, letterSpacing: -0.1,
            }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 22px 20px' }}>
        {/* Best match hero */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Top match · Lift
        </ACLabel>
        <div style={{
          marginTop: 10, padding: 18, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 6,
            border: `1.5px solid ${c.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="12.5" width="22" height="3" fill={c.accent}/>
              <rect x="5" y="8" width="3" height="12" fill={c.accent}/>
              <rect x="20" y="8" width="3" height="12" fill={c.accent}/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
              Deadlift
            </div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(239,233,218,0.55)', marginTop: 3, letterSpacing: 0.3 }}>
              COMPOUND · HINGE · 415 LB PR
            </div>
          </div>
          <svg width="10" height="12" viewBox="0 0 10 12">
            <path d="M2 1l5 5-5 5" stroke={c.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Grouped results */}
        {[
          {
            cat: 'LIFTS · 4',
            rows: [
              { t: 'Deficit deadlift', sub: 'Variant · 355 lb PR' },
              { t: 'Romanian deadlift', sub: 'Variant · 275 lb × 8' },
              { t: 'Trap bar deadlift', sub: 'Alt pattern · never logged' },
              { t: 'Snatch-grip deadlift', sub: 'Variant · 315 lb × 5' },
            ],
          },
          {
            cat: 'PROGRAMS · 3',
            rows: [
              { t: '5/3/1 BBB', sub: 'Deadlift day · W7 running' },
              { t: 'nSuns 531 LP', sub: 'Deadlift T1 block' },
              { t: 'Conjugate · Westside', sub: 'Max-effort lower' },
            ],
          },
          {
            cat: 'HISTORY · 87 sessions',
            rows: [
              { t: '18 Apr · 415 lb × 1', sub: 'Today · PR', hi: true },
              { t: '11 Apr · 395 lb × 1', sub: '7d ago' },
              { t: '04 Apr · 385 lb × 3', sub: '14d ago' },
            ],
          },
          {
            cat: 'ARTICLES · 2',
            rows: [
              { t: 'The grammar of the hinge', sub: 'Atlas field notes · 8 min' },
              { t: "Wendler's 5/3/1, plainly", sub: 'Atlas field notes · 12 min' },
            ],
          },
        ].map((g, gi) => (
          <div key={gi} style={{ marginTop: 22 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              {g.cat}
            </ACLabel>
            <div style={{ marginTop: 8 }}>
              {g.rows.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 2px',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  <div style={{
                    width: 6, height: 6, flexShrink: 0,
                    background: r.hi ? c.accent : c.mute,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, color: c.fg, letterSpacing: -0.2,
                      fontWeight: r.hi ? 600 : 500,
                    }}>
                      {r.t.split(/(deadlift)/i).map((part, pi) =>
                        /^deadlift$/i.test(part)
                          ? <mark key={pi} style={{ background: 'transparent', color: c.accent, fontWeight: 700 }}>{part}</mark>
                          : <span key={pi}>{part}</span>
                      )}
                    </div>
                    <ACLabel size={11} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{r.sub}</ACLabel>
                  </div>
                  <svg width="8" height="10" viewBox="0 0 8 10">
                    <path d="M1 1l4 4-4 4" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick actions */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Try asking coach
          </ACLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              "How's my deadlift progressing vs last block?",
              "When should I test a 1RM deadlift?",
              "Compare my deadlift to my squat ratio",
            ].map(q => (
              <div key={q} style={{
                padding: '10px 14px', background: c.card,
                borderRadius: 12, fontSize: 13, color: c.fg,
                letterSpacing: -0.2, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 3, height: 18, background: c.accent,
                }} />
                {q.split(/(deadlift|squat)/i).map((part, pi) =>
                  /^(deadlift|squat)$/i.test(part)
                    ? <mark key={pi} style={{ background: 'transparent', color: c.accent, fontWeight: 700 }}>{part}</mark>
                    : <span key={pi}>{part}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  S29_Workout_Summary, S30_Weekly_Recap, S31_Sleep_Detail,
  S32_Capture, S33_Profile, S34_Watch, S35_Search,
});
