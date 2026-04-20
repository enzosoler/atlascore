// screens-p5.jsx — atlas.core app screens, PHASE 5
// Library · Program detail · Calendar · Exercise detail · Crew

// ══════════════════════════════════════════════════════════════
// P5-1 — WORKOUT LIBRARY
// ══════════════════════════════════════════════════════════════
function S24_Library({ dark }) {
  const c = useACT(dark);
  const categories = ['All', 'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Mobility'];
  const featured = {
    name: '5/3/1 BBB',
    author: 'Jim Wendler',
    pct: 86,
    wks: 16,
    runners: '12.4k',
    kicker: 'The system most atlas users end up on',
  };
  const programs = [
    { name: 'Push · Pull · Legs',   a: 'atlas.core',  w: 12, d: 6, lvl: 'Intermediate', fit: 91, tag: 'Hypertrophy' },
    { name: 'Conjugate · Westside', a: 'Louie Simmons', w: 20, d: 4, lvl: 'Advanced',     fit: 78, tag: 'Power' },
    { name: 'Tactical Barbell',     a: 'K. Black',    w: 8,  d: 3, lvl: 'Intermediate', fit: 73, tag: 'Strength' },
    { name: 'nSuns 531 LP',         a: 'nSuns',       w: 12, d: 5, lvl: 'Advanced',     fit: 69, tag: 'Strength' },
    { name: 'GZCLP',                a: 'Cody LeFever',w: 16, d: 3, lvl: 'Beginner',     fit: 88, tag: 'Strength' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Library · 147 programs</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            The canon
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke={c.fg} strokeWidth="1.6"/>
            <path d="M9.5 9.5L12 12" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Featured — full bleed, quotable */}
        <div style={{
          padding: 24, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card, position: 'relative', overflow: 'hidden',
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Featured · program 014
          </ACLabel>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
            letterSpacing: -1.4, lineHeight: 0.95, marginTop: 10,
          }}>
            {featured.name}
          </div>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: 'rgba(239,233,218,0.55)', marginTop: 6, letterSpacing: 0.3 }}>
            BY {featured.author.toUpperCase()}
          </div>

          <div style={{
            marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 18,
            paddingTop: 18, borderTop: '1px solid rgba(239,233,218,0.14)',
          }}>
            <div>
              <ACLabel size={9} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>Match</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -0.8, color: c.accent, lineHeight: 1 }}>
                {featured.pct}<span style={{ fontSize: 16, color: 'rgba(239,233,218,0.55)', letterSpacing: 0 }}>%</span>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(239,233,218,0.14)', paddingLeft: 18 }}>
              <ACLabel size={9} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>Length</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, marginTop: 2 }}>{featured.wks} wk</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(239,233,218,0.14)', paddingLeft: 18 }}>
              <ACLabel size={9} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>Running</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, marginTop: 2 }}>{featured.runners}</div>
            </div>
          </div>

          <div style={{
            marginTop: 14, fontSize: 13.5, color: 'rgba(239,233,218,0.78)',
            lineHeight: 1.5, fontStyle: 'italic',
          }}>
            "{featured.kicker}."
          </div>
        </div>

        {/* Category pills */}
        <div style={{
          marginTop: 22, display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 2,
        }}>
          {categories.map((cat, i) => (
            <div key={cat} style={{
              padding: '8px 14px', borderRadius: 999,
              background: i === 0 ? c.fg : c.card,
              color: i === 0 ? c.bg : c.fg,
              fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}>{cat}</div>
          ))}
        </div>

        {/* Grid of programs */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>Ranked for you</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Match ↓</ACLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {programs.map((p, i) => (
              <ProgramRow key={i} p={p} idx={i + 1} c={c} />
            ))}
          </div>
        </div>

        {/* Build your own */}
        <div style={{
          marginTop: 20, padding: 18,
          border: `1px dashed ${c.faint}`, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v14M2 9h14" stroke={c.fg} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg }}>Build your own</div>
            <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>
              Splits, cycles, deload weeks — the editor knows the grammar.
            </ACLabel>
          </div>
          <svg width="10" height="12" viewBox="0 0 10 12">
            <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <ACTabBar active="workout" dark={dark} />
    </div>
  );
}

function ProgramRow({ p, idx, c }) {
  return (
    <div style={{
      padding: '14px 16px', background: c.card, borderRadius: ACRadii.card,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 42, textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 0.5,
      }}>
        {String(idx).padStart(3, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 16, fontWeight: 600,
            letterSpacing: -0.3, color: c.fg,
          }}>{p.name}</div>
        </div>
        <div style={{
          marginTop: 3, display: 'flex', gap: 10, alignItems: 'center',
          fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, letterSpacing: 0.3,
        }}>
          <span>{p.a}</span>
          <span>·</span>
          <span>{p.w}wk · {p.d}d/wk</span>
          <span>·</span>
          <span>{p.lvl}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
          color: p.fit >= 85 ? c.accent : c.fg,
          lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        }}>
          {p.fit}<span style={{ fontSize: 10, color: c.dim }}>%</span>
        </div>
        <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, marginTop: 2 }}>
          MATCH
        </ACLabel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P5-2 — PROGRAM DETAIL (5/3/1 BBB expanded)
// ══════════════════════════════════════════════════════════════
function S25_Program_Detail({ dark }) {
  const c = useACT(dark);
  const weeks = [
    { n: 1, tag: '5s week',  pct: '65/75/85',  sets: '×5' },
    { n: 2, tag: '3s week',  pct: '70/80/90',  sets: '×3' },
    { n: 3, tag: '1s week',  pct: '75/85/95',  sets: '×1+' },
    { n: 4, tag: 'Deload',   pct: '40/50/60',  sets: '×5' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>PROGRAM 014</ACLabel>
        <div style={{
          width: 28, height: 28, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 1h10v12L6 10 1 13V1Z" stroke={c.fg} strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          86% match · strength focus
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 46, fontWeight: 700,
          letterSpacing: -2, lineHeight: 0.95, color: c.fg,
        }}>
          5/3/1 <span style={{ color: c.accent }}>BBB</span>.
        </div>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          BY JIM WENDLER · 16 WK · 4 D/WK
        </div>

        <div style={{ marginTop: 14, fontSize: 14, color: c.dim, lineHeight: 1.55 }}>
          A four-day strength cycle built on submaximal training max percentages. Boring But Big adds 5×10 volume on the main lift for hypertrophy. Proven, slow, honest.
        </div>

        {/* Stat bar */}
        <div style={{
          marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {[
            { k: 'Weeks',    v: '16' },
            { k: 'Days/wk',  v: '4' },
            { k: 'Sets/sess',v: '28' },
            { k: 'Runners',  v: '12.4k' },
          ].map((m, i) => (
            <div key={i} style={{
              borderLeft: i === 0 ? 'none' : `1px solid ${c.hair}`,
              paddingLeft: i === 0 ? 0 : 12,
            }}>
              <ACLabel size={9} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                {m.k}
              </ACLabel>
              <ACNum size={20} color={c.fg} weight={700} style={{ display: 'block', marginTop: 4 }}>{m.v}</ACNum>
            </div>
          ))}
        </div>

        {/* Expected adaptations */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Expected adaptations · 16 wk
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { lift: 'Squat',    now: 325, proj: 355, unit: 'lb' },
              { lift: 'Bench',    now: 275, proj: 295, unit: 'lb' },
              { lift: 'Deadlift', now: 415, proj: 445, unit: 'lb' },
              { lift: 'OHP',      now: 165, proj: 180, unit: 'lb' },
            ].map((r, i) => {
              const gain = r.proj - r.now;
              const pct = ((gain / r.now) * 100).toFixed(1);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  <div style={{ width: 70 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: c.fg }}>{r.lift}</div>
                  </div>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'baseline', gap: 4,
                    fontFamily: ACFonts.mono, fontSize: 12, color: c.dim,
                  }}>
                    <span style={{ color: c.fg, fontWeight: 600 }}>{r.now}</span>
                    <span>→</span>
                    <span style={{ color: c.accent, fontWeight: 700 }}>{r.proj}</span>
                    <span style={{ color: c.mute }}>{r.unit}</span>
                  </div>
                  <div style={{
                    fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
                    color: c.accent, minWidth: 50, textAlign: 'right',
                  }}>+{gain} · {pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week structure */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Wave structure · 4 wk block
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: w.tag === 'Deload' ? 'transparent' : c.card,
                border: w.tag === 'Deload' ? `1px dashed ${c.faint}` : 'none',
                borderRadius: ACRadii.card,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: w.n === 1 ? c.accent : c.fg,
                  color: w.n === 1 ? c.ink : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: ACFonts.display, fontWeight: 700, fontSize: 17,
                }}>{w.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg }}>Week {w.n} · {w.tag}</div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.dim, marginTop: 2, letterSpacing: 0.3 }}>
                    {w.pct}% TM · sets of {w.sets}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{
          marginTop: 22, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ display: 'flex' }}>
            {['JK', 'MR', 'LA', 'SO'].map((i, idx) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 999,
                background: idx % 2 ? c.fg : c.accent,
                color: idx % 2 ? c.bg : c.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: ACFonts.display, fontSize: 10, fontWeight: 700,
                marginLeft: idx > 0 ? -8 : 0,
                border: `2px solid ${c.card}`,
              }}>{i}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>4 in your crew are running this</div>
            <ACLabel size={11} color={c.dim} style={{ marginTop: 2 }}>Avg gain: +28 lb on squat</ACLabel>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block>Preview week</ACBtn>
        </div>
        <div style={{ flex: 1.3 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Start program →</ACBtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P5-3 — CALENDAR / PLAN
// ══════════════════════════════════════════════════════════════
function S26_Calendar({ dark }) {
  const c = useACT(dark);
  const days = [
    { date: 'Sat 18', today: true,  type: 'Heavy Lower', vol: 'High',   read: 87, status: 'today', duration: '58m' },
    { date: 'Sun 19', type: 'Recovery',    vol: 'Rest',   read: null, status: 'rest' },
    { date: 'Mon 20', type: 'Upper push',  vol: 'Mod',    read: 78, status: 'upcoming', duration: '52m' },
    { date: 'Tue 21', type: 'Conditioning',vol: 'Low',    read: 72, status: 'upcoming', duration: '28m' },
    { date: 'Wed 22', type: 'Heavy Pull',  vol: 'High',   read: 74, status: 'shifted', shift: 'moved 1d later' },
    { date: 'Thu 23', type: 'Recovery',    vol: 'Rest',   read: null, status: 'rest' },
    { date: 'Fri 24', type: 'Full body',   vol: 'Mod',    read: 80, status: 'upcoming', duration: '45m' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Plan · week 07 of 16</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Apr 18 — 24
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: c.card, borderRadius: 10 }}>
          {['W', 'M'].map((r, i) => (
            <div key={r} style={{
              padding: '6px 12px', borderRadius: 7,
              background: i === 0 ? c.fg : 'transparent',
              color: i === 0 ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600,
            }}>{r}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Week summary */}
        <div style={{
          padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <ACLabel size={11} color={c.dim}>Week · volume distribution</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>On track</ACLabel>
          </div>
          <div style={{ display: 'flex', gap: 3, height: 40, alignItems: 'flex-end' }}>
            {[75, 0, 55, 30, 80, 0, 50].map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%', height: v > 0 ? `${v}%` : 2,
                  background: i === 0 ? c.accent : v === 0 ? c.faint : c.fg,
                  opacity: v === 0 ? 0.3 : 1,
                  borderRadius: 2,
                }} />
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 6, display: 'flex', gap: 3,
          }}>
            {['S', 'S', 'M', 'T', 'W', 'T', 'F'].map((l, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                fontFamily: ACFonts.mono, fontSize: 9,
                color: i === 0 ? c.accent : c.mute, fontWeight: 600,
                letterSpacing: 0.5,
              }}>{l}</div>
            ))}
          </div>
        </div>

        {/* Day list */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column' }}>
          {days.map((d, i) => (
            <DayRow key={i} d={d} c={c} first={i === 0} />
          ))}
        </div>

        {/* Reschedule note */}
        <div style={{
          marginTop: 18, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Auto-reschedule
          </ACLabel>
          <div style={{
            marginTop: 6, fontSize: 13.5, color: c.fg, lineHeight: 1.5,
          }}>
            Wed's Heavy Pull moved to Thu. Your readiness trended low from back-to-back high-volume days — we gave you a recovery buffer.
          </div>
          <div style={{
            marginTop: 10, display: 'flex', gap: 8,
          }}>
            <div style={{
              padding: '6px 12px', background: c.fg, color: c.bg,
              fontSize: 11, fontWeight: 600, borderRadius: 999,
            }}>Accept</div>
            <div style={{
              padding: '6px 12px', border: `1px solid ${c.faint}`,
              fontSize: 11, fontWeight: 600, color: c.fg, borderRadius: 999,
            }}>Keep original</div>
          </div>
        </div>
      </div>

      <ACTabBar active="workout" dark={dark} />
    </div>
  );
}

function DayRow({ d, c, first }) {
  const isRest = d.status === 'rest';
  const isShifted = d.status === 'shifted';
  const isToday = d.today;
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 14,
      padding: '14px 0',
      borderTop: first ? 'none' : `1px solid ${c.hair}`,
    }}>
      {/* Day column */}
      <div style={{
        width: 46, flexShrink: 0, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <ACLabel size={9} color={c.mute} style={{
          fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase',
        }}>{d.date.split(' ')[0]}</ACLabel>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isToday ? c.accent : (isRest ? 'transparent' : c.card),
          border: isRest ? `1px dashed ${c.faint}` : 'none',
          color: isToday ? c.ink : c.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
        }}>{d.date.split(' ')[1]}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            fontSize: 15.5, fontWeight: 600, color: isRest ? c.mute : c.fg,
            letterSpacing: -0.2,
          }}>
            {d.type}
          </div>
          {isToday && (
            <div style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: c.accent, color: c.ink, borderRadius: 4,
            }}>Today</div>
          )}
          {isShifted && (
            <div style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: 'transparent', color: c.accent,
              border: `1px solid ${c.accent}`, borderRadius: 4,
            }}>Shifted</div>
          )}
        </div>
        <div style={{
          marginTop: 4, display: 'flex', gap: 10, alignItems: 'center',
          fontFamily: ACFonts.mono, fontSize: 10.5, color: c.dim, letterSpacing: 0.3,
        }}>
          {d.vol && <span>{d.vol}</span>}
          {d.duration && <><span>·</span><span>{d.duration}</span></>}
          {d.read !== null && d.read !== undefined && <><span>·</span><span>Readiness {d.read}</span></>}
          {d.shift && <><span>·</span><span style={{ color: c.accent }}>{d.shift}</span></>}
        </div>
      </div>

      {/* Status glyph */}
      <div style={{
        width: 28, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isRest ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12" stroke={c.mute} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12">
            <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P5-4 — EXERCISE DETAIL (Deadlift deep-dive)
// ══════════════════════════════════════════════════════════════
function S27_Exercise_Detail({ dark }) {
  const c = useACT(dark);
  const history = [180,200,225,245,270,295,315,335,355,375,385,395,405,415].map((v,k)=>({k,v}));
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>LIFT · COMPOUND</ACLabel>
        <div style={{
          width: 28, height: 28, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 1h10v12L6 10 1 13V1Z" stroke={c.fg} strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 42, fontWeight: 700,
          letterSpacing: -1.8, lineHeight: 0.95, color: c.fg,
        }}>
          Deadlift.
        </div>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          POSTERIOR CHAIN · HINGE PATTERN
        </div>

        {/* Video / demo placeholder */}
        <div style={{
          marginTop: 18, aspectRatio: '16/10',
          background: c.fg, borderRadius: ACRadii.card,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* simple stick-figure deadlift silhouette */}
          <svg width="80%" height="80%" viewBox="0 0 200 120" fill="none">
            <circle cx="80" cy="30" r="8" fill={c.bg} opacity="0.35"/>
            <line x1="80" y1="38" x2="110" y2="70" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            <line x1="110" y1="70" x2="140" y2="70" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            <line x1="110" y1="70" x2="100" y2="110" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            <line x1="140" y1="70" x2="130" y2="110" stroke={c.bg} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
            {/* barbell */}
            <line x1="60" y1="95" x2="160" y2="95" stroke={c.accent} strokeWidth="4" strokeLinecap="round"/>
            <rect x="55" y="88" width="8" height="14" fill={c.accent}/>
            <rect x="157" y="88" width="8" height="14" fill={c.accent}/>
            {/* arms */}
            <line x1="80" y1="38" x2="105" y2="95" stroke={c.bg} strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
          </svg>
          <div style={{
            position: 'absolute', left: 14, bottom: 12,
            width: 44, height: 44, borderRadius: 999,
            background: c.bg, color: c.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 2l9 5-9 5V2Z" fill={c.fg}/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', right: 14, bottom: 12,
            fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(239,233,218,0.7)',
            letterSpacing: 0.5,
          }}>00:34</div>
        </div>

        {/* Your all-time */}
        <div style={{
          marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>All-time best</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <ACNum size={40} color={c.fg} weight={700}>415</ACNum>
                <span style={{ fontSize: 12, color: c.dim, fontFamily: ACFonts.mono }}>lb × 1</span>
              </div>
              <ACLabel size={11} color={c.accent} style={{ marginTop: 4, fontWeight: 600 }}>Today · 18 Apr</ACLabel>
            </div>
            <div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>e1RM curve</ACLabel>
              <div style={{ marginTop: 8 }}>
                <ACLine w={130} h={52} dark={dark} data={history} />
              </div>
              <ACLabel size={11} color={c.accent} style={{ marginTop: 4, fontWeight: 600, textAlign: 'right', display: 'block' }}>+235 lb · 24mo</ACLabel>
            </div>
          </div>
        </div>

        {/* Muscle engagement */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Muscle engagement
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', gap: 18, alignItems: 'center' }}>
            <MuscleMap color={c.fg} accent={c.accent} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { m: 'Glutes',      p: 95, primary: true },
                { m: 'Hamstrings',  p: 88, primary: true },
                { m: 'Spinal erectors', p: 82, primary: true },
                { m: 'Lats',        p: 62 },
                { m: 'Traps',       p: 58 },
                { m: 'Forearms',    p: 55 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: r.primary ? 600 : 400, color: r.primary ? c.fg : c.dim, width: 88 }}>
                    {r.m}
                  </div>
                  <div style={{ flex: 1, height: 6, background: c.faint, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${r.p}%`, height: '100%', background: r.primary ? c.accent : c.fg }} />
                  </div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, width: 22, textAlign: 'right' }}>{r.p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form cues */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Form cues · non-negotiables
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              { n: '01', t: 'Bar over mid-foot',  d: 'Start with the bar 1 in from shins' },
              { n: '02', t: 'Neutral spine',       d: 'Chest proud, lats tight — no rounding' },
              { n: '03', t: 'Push the floor',      d: 'Drive legs down, not the bar up' },
              { n: '04', t: 'Lock knees + hips together', d: 'Finish in one snap at the top' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 11, color: c.accent,
                  fontWeight: 700, width: 28,
                }}>{r.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: c.fg }}>{r.t}</div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.d}</ACLabel>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block>All sets</ACBtn>
        </div>
        <div style={{ flex: 1.3 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Log set →</ACBtn>
        </div>
      </div>
    </div>
  );
}

function MuscleMap({ color, accent }) {
  return (
    <svg width="86" height="180" viewBox="0 0 86 180" fill="none" style={{ flexShrink: 0 }}>
      {/* back silhouette */}
      <circle cx="43" cy="18" r="11" fill={color} opacity="0.14" />
      <path d="M24 30 L62 30 L58 84 L43 90 L28 84 Z" fill={color} opacity="0.14" />
      {/* glutes - primary */}
      <path d="M28 84 L43 90 L58 84 L62 104 L43 112 L24 104 Z" fill={accent} opacity="0.85" />
      {/* hamstrings - primary */}
      <path d="M30 112 L42 112 L40 156 L32 156 Z" fill={accent} opacity="0.7" />
      <path d="M56 112 L44 112 L46 156 L54 156 Z" fill={accent} opacity="0.7" />
      {/* erectors stripe */}
      <rect x="39" y="32" width="8" height="52" fill={accent} opacity="0.6" />
      {/* calves */}
      <path d="M32 158 L40 158 L38 175 L34 175 Z" fill={color} opacity="0.18" />
      <path d="M48 158 L56 158 L54 175 L50 175 Z" fill={color} opacity="0.18" />
      {/* arms along sides */}
      <path d="M24 30 L16 80 L20 82 L28 36 Z" fill={color} opacity="0.14" />
      <path d="M62 30 L70 80 L66 82 L58 36 Z" fill={color} opacity="0.14" />
      {/* lats/traps - secondary */}
      <path d="M28 34 L39 34 L39 56 L30 60 Z" fill={accent} opacity="0.32" />
      <path d="M58 34 L47 34 L47 56 L56 60 Z" fill={accent} opacity="0.32" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// P5-5 — CREW / LEADERBOARD
// ══════════════════════════════════════════════════════════════
function S28_Crew({ dark }) {
  const c = useACT(dark);
  const me = { id: 'mk', name: 'You',      initials: 'MK', prs: 3, tonnes: 52, streak: 14, isMe: true };
  const crew = [
    { id: 'jk', name: 'Jordan K.',  initials: 'JK', prs: 4, tonnes: 58, streak: 22, top: true },
    me,
    { id: 'lr', name: 'Lin R.',     initials: 'LR', prs: 2, tonnes: 44, streak: 9 },
    { id: 'ss', name: 'Sam S.',     initials: 'SS', prs: 2, tonnes: 41, streak: 18 },
    { id: 'mo', name: 'Marcos O.',  initials: 'MO', prs: 1, tonnes: 38, streak: 6 },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Your crew · 5</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Training together
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke={c.fg} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Week headline */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            This week · together
          </ACLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16, gap: 0 }}>
            {[
              { k: 'PRs',     v: '12' },
              { k: 'Tonnes',  v: '233' },
              { k: 'Sessions',v: '28' },
            ].map((m, i) => (
              <div key={i} style={{
                borderLeft: i === 0 ? 'none' : '1px solid rgba(239,233,218,0.14)',
                paddingLeft: i === 0 ? 0 : 14,
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1, marginTop: 4 }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, fontSize: 13, color: 'rgba(239,233,218,0.7)',
            lineHeight: 1.5,
          }}>
            Your crew moved more total weight this week than any week since Jan. Jordan led with 4 new PRs.
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          marginTop: 18, padding: 4, display: 'flex', gap: 2,
          background: c.card, borderRadius: 10,
        }}>
          {['PRs', 'Tonnes', 'Streak'].map((t, i) => (
            <div key={t} style={{
              flex: 1, padding: '8px 0', textAlign: 'center',
              background: i === 0 ? c.fg : 'transparent',
              color: i === 0 ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600, borderRadius: 7,
            }}>{t}</div>
          ))}
        </div>

        {/* Leaderboard */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
          {crew.map((p, i) => (
            <CrewRow key={p.id} p={p} rank={i + 1} c={c} />
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Crew feed · this week
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              { who: 'Jordan K.',  did: 'pulled 500 lb', when: '2h',  hot: true },
              { who: 'Lin R.',     did: 'hit 200 on bench · 40-lb jump from last cycle', when: 'Yest' },
              { who: 'Sam S.',     did: 'completed week 8 of 5/3/1',                     when: '2d' },
              { who: 'You',        did: 'pulled 415 lb',                                 when: '4h', mine: true },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: f.mine ? c.accent : c.fg,
                  color: f.mine ? c.ink : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: ACFonts.display, fontSize: 10, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {f.who.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600 }}>{f.who}</span>
                    <span style={{ color: c.dim }}> {f.did}</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
                    color: c.mute, letterSpacing: 0.3,
                  }}>
                    <span>{f.when}</span>
                    {f.hot && (
                      <>
                        <span>·</span>
                        <span style={{ color: c.accent, fontWeight: 700 }}>ALL-TIME BEST</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 18, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
            Crews are collaborative, not competitive. No public leaderboards. No follower counts.
          </ACLabel>
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

function CrewRow({ p, rank, c }) {
  const valueKey = 'prs';
  const val = p[valueKey];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', marginTop: 4,
      background: p.isMe ? c.card : 'transparent',
      borderRadius: p.isMe ? ACRadii.card : 0,
      borderLeft: p.isMe ? `3px solid ${c.accent}` : 'none',
      paddingLeft: p.isMe ? 11 : 14,
    }}>
      <div style={{
        width: 22, textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
        color: rank === 1 ? c.accent : c.mute,
        letterSpacing: 0.5,
      }}>{String(rank).padStart(2, '0')}</div>
      <div style={{
        width: 34, height: 34, borderRadius: 999,
        background: p.top ? c.accent : (p.isMe ? c.fg : c.card),
        color: p.top ? c.ink : (p.isMe ? c.bg : c.fg),
        border: p.isMe ? 'none' : `1px solid ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
        flexShrink: 0,
      }}>{p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 600, color: c.fg,
          letterSpacing: -0.2,
        }}>{p.name}</div>
        <div style={{
          marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {p.tonnes}t · {p.streak}d streak
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <ACNum size={22} color={rank === 1 ? c.accent : c.fg} weight={700}>{val}</ACNum>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.5 }}>PRS</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  S24_Library, S25_Program_Detail, S26_Calendar, S27_Exercise_Detail, S28_Crew,
});
