// screens-p9.jsx — atlas.core app screens, PHASE 9
// Core loop extensions (8 screens): streaks, focus mode, plan page, progress overview,
// insights, past workout detail, routines list, routine detail.

// ══════════════════════════════════════════════════════════════
// S52 — STREAKS DETAIL
// ══════════════════════════════════════════════════════════════
function S52_Streaks({ dark }) {
  const c = useACT(dark);
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  // 4 months of fake data, 30 days each
  const grid = months.map((m, mi) =>
    Array.from({ length: 30 }, (_, di) => {
      if (mi === 3 && di > 17) return 0; // April, future days
      const r = Math.random();
      return r > 0.25 ? (r > 0.6 ? 2 : 1) : 0; // 0=miss, 1=partial, 2=full
    })
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Streaks" sub="Consistency" dark={dark}
        right={<ACChip dark={dark} accent dot>42 days</ACChip>} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Current streak hero */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <ACRing size={90} value={87} dark={!dark} thickness={8} color={c.accent} />
          <div>
            <ACNum size={56} color={c.bg} weight={700}>42</ACNum>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>day streak</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
              <div>
                <ACLabel size={10} color={c.accent}>Best</ACLabel>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.bg }}>67</div>
              </div>
              <div>
                <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.45)' : 'rgba(239,233,218,0.5)'}>Freezes</ACLabel>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.bg }}>2 left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Heat grid */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>2026 activity</ACLabel>
          {months.map((m, mi) => (
            <div key={m} style={{ marginTop: 12 }}>
              <ACMono size={10} color={c.mute}>{m}</ACMono>
              <div style={{ marginTop: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {grid[mi].map((v, di) => (
                  <div key={di} style={{
                    width: 9, height: 9,
                    background: v === 2 ? c.accent : v === 1 ? c.fg : c.faint,
                    opacity: v === 0 ? 0.3 : 1,
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          {[
            { c: c.faint, l: 'Rest' },
            { c: c.fg, l: 'Partial' },
            { c: c.accent, l: 'Complete' },
          ].map(item => (
            <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 9, height: 9, background: item.c }} />
              <ACLabel size={10} color={c.dim}>{item.l}</ACLabel>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Milestones</ACLabel>
          {[
            { days: 7, t: 'First week', done: true },
            { days: 14, t: 'Two weeks strong', done: true },
            { days: 30, t: 'Monthly machine', done: true },
            { days: 60, t: 'Two months', done: false, progress: 0.7 },
            { days: 100, t: 'Triple digits', done: false, progress: 0.42 },
          ].map(ms => (
            <div key={ms.days} style={{
              marginTop: 10, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: ms.done ? c.accent : c.faint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ms.done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {!ms.done && <ACMono size={9} color={c.dim}>{ms.days}</ACMono>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: ms.done ? c.fg : c.dim }}>{ms.t}</div>
                {!ms.done && (
                  <div style={{ marginTop: 4, height: 3, background: c.faint, borderRadius: 2 }}>
                    <div style={{ height: 3, background: c.accent, borderRadius: 2, width: `${ms.progress * 100}%` }} />
                  </div>
                )}
              </div>
              <ACMono size={10} color={ms.done ? c.accent : c.mute}>{ms.days}d</ACMono>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S53 — FOCUS MODE (distraction-free single-task view)
// ══════════════════════════════════════════════════════════════
function S53_Focus({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.fg }}>
      {/* Minimal header */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase' }}>Focus mode</ACLabel>
        <div style={{
          padding: '5px 10px', borderRadius: ACRadii.chip,
          border: `1px solid ${dark ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.15)'}`,
        }}>
          <ACLabel size={11} color={c.bg} style={{ fontWeight: 500 }}>Exit</ACLabel>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        {/* The one thing */}
        <ACDot size={8} color={c.accent} />
        <div style={{
          marginTop: 16, fontFamily: ACFonts.display, fontSize: 14, fontWeight: 600,
          letterSpacing: 0.5, textTransform: 'uppercase', color: c.accent,
        }}>Next up</div>
        <div style={{
          marginTop: 12, fontFamily: ACFonts.display, fontSize: 36, fontWeight: 700,
          letterSpacing: -1.2, lineHeight: 1.1, color: c.bg, textAlign: 'center',
        }}>
          Deadlift<br/>5 × 3 @ 140 kg
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: dark ? 'rgba(10,10,10,0.45)' : 'rgba(239,233,218,0.5)' }}>
          Set 3 of 5 · RPE target 8
        </div>

        {/* Rest timer */}
        <div style={{
          marginTop: 40, width: 160, height: 160, borderRadius: 999,
          border: `4px solid ${c.accent}`, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div>
            <ACNum size={48} color={c.bg} weight={700}>1:42</ACNum>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.45)'}>rest remaining</ACLabel>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ marginTop: 36, display: 'flex', gap: 28 }}>
          {[
            { l: 'Volume', v: '4,200 kg' },
            { l: 'Duration', v: '38 min' },
            { l: 'Sets done', v: '12 / 18' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)'}>{s.l}</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: c.bg }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '14px 28px 34px' }}>
        <div style={{
          padding: '18px 24px', background: c.accent, color: c.ink,
          borderRadius: 999, textAlign: 'center',
          fontFamily: ACFonts.body, fontSize: 17, fontWeight: 600,
        }}>Log set →</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S54 — PLAN PAGE (macro view across weeks)
// ══════════════════════════════════════════════════════════════
function S54_Plan({ dark }) {
  const c = useACT(dark);
  const weeks = [
    { n: 'Week 9', phase: 'Intensity', sessions: [
      { d: 'Mon', t: 'Upper A', done: true },
      { d: 'Tue', t: 'Rest', done: true, rest: true },
      { d: 'Wed', t: 'Lower A', done: true },
      { d: 'Thu', t: 'Rest', done: true, rest: true },
      { d: 'Fri', t: 'Upper B', done: false, today: true },
      { d: 'Sat', t: 'Lower B', done: false },
      { d: 'Sun', t: 'Rest', done: false, rest: true },
    ]},
    { n: 'Week 10', phase: 'Intensity', sessions: [
      { d: 'Mon', t: 'Upper A' }, { d: 'Tue', t: 'Rest', rest: true },
      { d: 'Wed', t: 'Lower A' }, { d: 'Thu', t: 'Rest', rest: true },
      { d: 'Fri', t: 'Upper B' }, { d: 'Sat', t: 'Lower B' },
      { d: 'Sun', t: 'Rest', rest: true },
    ]},
    { n: 'Week 11', phase: 'Deload', sessions: [
      { d: 'Mon', t: 'Full A' }, { d: 'Tue', t: 'Rest', rest: true },
      { d: 'Wed', t: 'Full B' }, { d: 'Thu', t: 'Rest', rest: true },
      { d: 'Fri', t: 'Full C' }, { d: 'Sat', t: 'Rest', rest: true },
      { d: 'Sun', t: 'Rest', rest: true },
    ]},
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Plan" sub="5/3/1 BBB · Block 2" dark={dark}
        right={<ACChip dark={dark}>Week 9 of 16</ACChip>} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ height: 4, background: c.faint, borderRadius: 2 }}>
            <div style={{ height: 4, background: c.accent, borderRadius: 2, width: '56%' }} />
          </div>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <ACMono size={10} color={c.mute}>56% complete</ACMono>
            <ACMono size={10} color={c.mute}>7 weeks left</ACMono>
          </div>
        </div>

        {weeks.map((w, wi) => (
          <div key={wi} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: c.fg }}>{w.n}</span>
                {wi === 0 && <ACDot size={6} color={c.accent} />}
              </div>
              <ACChip dark={dark} accent={w.phase === 'Deload'}>{w.phase}</ACChip>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {w.sessions.map((s, si) => (
                <div key={si} style={{
                  flex: 1, padding: '8px 2px', borderRadius: 6, textAlign: 'center',
                  background: s.today ? c.accent : s.done ? c.fg : (s.rest ? 'transparent' : c.card),
                  border: s.rest && !s.done ? `1px solid ${c.hair}` : 'none',
                }}>
                  <ACMono size={8} color={
                    s.today ? c.ink : s.done ? c.bg : (s.rest ? c.mute : c.dim)
                  }>{s.d}</ACMono>
                  <div style={{
                    marginTop: 3, fontSize: 8, fontWeight: 600,
                    color: s.today ? c.ink : s.done ? (dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.6)') : (s.rest ? c.mute : c.fg),
                    lineHeight: 1.2,
                  }}>{s.rest ? '—' : s.t}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Volume trend */}
        <div style={{ marginTop: 8, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.dim}>Weekly volume trend</ACLabel>
          <ACSpark w={280} h={40} dark={dark} stroke={2}
            data={[35, 42, 45, 40, 48, 52, 46, 50, 55]} />
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <ACMono size={9} color={c.mute}>Wk 1</ACMono>
            <ACMono size={9} color={c.accent}>Wk 9 · 55 sets</ACMono>
          </div>
        </div>
      </div>

      <ACTabBar active="train" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S55 — PROGRESS OVERVIEW (cross-metric visualization)
// ══════════════════════════════════════════════════════════════
function S55_Progress({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Progress" sub="Last 90 days" dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Summary tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l: 'Weight', v: '-3.2', u: 'kg', trend: 'down', good: true },
            { l: 'Body fat', v: '-1.8', u: '%', trend: 'down', good: true },
            { l: 'Bench 1RM', v: '+7.5', u: 'kg', trend: 'up', good: true },
            { l: 'Squat 1RM', v: '+12', u: 'kg', trend: 'up', good: true },
          ].map((t, i) => (
            <div key={i} style={{ padding: 16, background: c.card, borderRadius: ACRadii.card }}>
              <ACLabel size={11} color={c.dim}>{t.l}</ACLabel>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <ACNum size={28} color={t.good ? c.accent : c.fg} weight={700}>{t.v}</ACNum>
                <ACLabel size={11} color={c.dim}>{t.u}</ACLabel>
              </div>
              <ACSpark w={110} h={20} dark={dark} stroke={1.5}
                data={t.trend === 'down'
                  ? [80, 75, 72, 68, 70, 65, 62, 58, 55]
                  : [40, 45, 48, 52, 50, 55, 58, 62, 65]
                } />
            </div>
          ))}
        </div>

        {/* Weight chart */}
        <div style={{ marginTop: 18, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>Weight trend</ACLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {['1M', '3M', '6M', '1Y'].map((p, i) => (
                <div key={p} style={{
                  padding: '3px 8px', borderRadius: ACRadii.chip,
                  background: i === 1 ? c.accent : 'transparent',
                  color: i === 1 ? c.ink : c.dim,
                  fontSize: 10, fontWeight: 600,
                }}>{p}</div>
              ))}
            </div>
          </div>
          <ACLine data={[
            { v: 86.2 }, { v: 85.8 }, { v: 86.0 }, { v: 85.5 }, { v: 85.2 },
            { v: 85.6 }, { v: 85.0 }, { v: 84.7 }, { v: 84.3 }, { v: 84.5 },
            { v: 84.0 }, { v: 83.8 }, { v: 83.5 }, { v: 83.0 },
          ]} w={280} h={100} dark={dark} />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <ACMono size={9} color={c.mute}>Jan 18</ACMono>
            <ACMono size={9} color={c.accent}>Apr 18 · 83.0 kg</ACMono>
          </div>
        </div>

        {/* PRs this period */}
        <div style={{ marginTop: 18 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>PRs this period</ACLabel>
          {[
            { lift: 'Deadlift', v: '195 kg', date: 'Mar 28' },
            { lift: 'Bench Press', v: '112.5 kg', date: 'Apr 12' },
            { lift: 'Squat', v: '165 kg', date: 'Apr 6' },
          ].map((pr, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{pr.lift}</div>
                <ACMono size={10} color={c.mute}>{pr.date}</ACMono>
              </div>
              <ACNum size={20} color={c.accent} weight={700}>{pr.v}</ACNum>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S56 — INSIGHTS (trends + anomalies)
// ══════════════════════════════════════════════════════════════
function S56_Insights({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Insights" sub="This week" dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {/* Insight cards */}
        {[
          {
            type: 'positive', icon: 'up',
            title: 'Protein consistency improved',
            body: 'You hit your protein target 6 of 7 days this week, up from 4 of 7 last week. Recovery markers are responding — HRV is up 8%.',
            action: 'View nutrition trend',
          },
          {
            type: 'warning', icon: 'alert',
            title: 'Sleep dipping mid-week',
            body: 'Wednesday and Thursday averaged 5.8h vs your 8h target. Thursday\'s readiness dropped to 62 — your lowest in 3 weeks.',
            action: 'View sleep detail',
          },
          {
            type: 'positive', icon: 'star',
            title: 'Bench press PR trajectory',
            body: 'e1RM has climbed 4.2 kg in 6 weeks. At this rate you\'ll clear 115 kg by end of block.',
            action: 'View PR gallery',
          },
          {
            type: 'neutral', icon: 'info',
            title: 'Volume trending high',
            body: 'Weekly sets are 12% above program target. Not a problem yet, but watch fatigue markers if it continues.',
            action: 'View plan',
          },
        ].map((ins, i) => (
          <div key={i} style={{
            marginBottom: 12, padding: 18, background: c.card, borderRadius: ACRadii.card,
            borderLeft: `3px solid ${ins.type === 'positive' ? c.accent : ins.type === 'warning' ? '#e8391f' : c.dim}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: ins.type === 'positive' ? c.accent : ins.type === 'warning' ? '#e8391f' : c.faint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ins.icon === 'up' && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 8l3-6 3 6" fill={c.ink} /></svg>}
                {ins.icon === 'alert' && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 2v4M5 7.5v.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {ins.icon === 'star' && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1l1.2 2.5 2.8.4-2 2 .5 2.8L5 7.5 2.5 8.7l.5-2.8-2-2 2.8-.4z" fill={c.ink}/></svg>}
                {ins.icon === 'info' && <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" stroke={c.fg} strokeWidth="1.2" fill="none"/><path d="M5 4.5v3M5 3v.5" stroke={c.fg} strokeWidth="1.2" strokeLinecap="round"/></svg>}
              </div>
              <ACLabel size={11} color={
                ins.type === 'positive' ? c.accent : ins.type === 'warning' ? '#e8391f' : c.dim
              } style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {ins.type === 'positive' ? 'Positive' : ins.type === 'warning' ? 'Watch' : 'Info'}
              </ACLabel>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.fg, letterSpacing: -0.3 }}>{ins.title}</div>
            <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5, color: c.dim }}>{ins.body}</div>
            <div style={{
              marginTop: 12, padding: '8px 12px', background: 'transparent',
              border: `1px solid ${c.faint}`, borderRadius: ACRadii.chip,
              display: 'inline-block', fontSize: 12, fontWeight: 500, color: c.fg,
            }}>{ins.action} →</div>
          </div>
        ))}
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S57 — PAST WORKOUT DETAIL (drill from history)
// ══════════════════════════════════════════════════════════════
function S57_Workout_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>Apr 15, 2026</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="4" viewBox="0 0 14 4"><circle cx="2" cy="2" r="1.4" fill={c.fg}/><circle cx="7" cy="2" r="1.4" fill={c.fg}/><circle cx="12" cy="2" r="1.4" fill={c.fg}/></svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 20px' }}>
        <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>
          Upper A — Push
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: c.dim }}>5/3/1 BBB · Week 9 · 52 min</div>

        {/* Stats row */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          {[
            { l: 'Volume', v: '8,240 kg' },
            { l: 'Sets', v: '18' },
            { l: 'PRs', v: '1' },
            { l: 'RPE avg', v: '7.4' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: 10, background: c.card, borderRadius: ACRadii.input, textAlign: 'center' }}>
              <ACLabel size={9} color={c.mute}>{s.l}</ACLabel>
              <div style={{ marginTop: 3, fontSize: 16, fontWeight: 700, color: s.l === 'PRs' ? c.accent : c.fg }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Exercise log */}
        {[
          { name: 'Bench Press', sets: [
            { s: 1, w: '90 kg', r: 5, rpe: 6 },
            { s: 2, w: '100 kg', r: 3, rpe: 7 },
            { s: 3, w: '112.5 kg', r: 1, rpe: 8, pr: true },
            { s: 4, w: '85 kg', r: 10, rpe: 7 },
            { s: 5, w: '85 kg', r: 10, rpe: 8 },
          ]},
          { name: 'OHP', sets: [
            { s: 1, w: '50 kg', r: 10, rpe: 7 },
            { s: 2, w: '50 kg', r: 10, rpe: 7 },
            { s: 3, w: '50 kg', r: 8, rpe: 8 },
          ]},
          { name: 'Incline DB Press', sets: [
            { s: 1, w: '32 kg', r: 12, rpe: 7 },
            { s: 2, w: '32 kg', r: 10, rpe: 8 },
          ]},
          { name: 'Lateral Raise', sets: [
            { s: 1, w: '12 kg', r: 15, rpe: 7 },
            { s: 2, w: '12 kg', r: 15, rpe: 7 },
            { s: 3, w: '12 kg', r: 12, rpe: 8 },
          ]},
        ].map((ex, ei) => (
          <div key={ei} style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: c.fg }}>{ex.name}</span>
              {ex.sets.some(s => s.pr) && <ACChip accent dark={dark}>PR</ACChip>}
            </div>
            <div style={{ background: c.card, borderRadius: ACRadii.input, overflow: 'hidden' }}>
              <div style={{ display: 'flex', padding: '6px 12px', borderBottom: `1px solid ${c.hair}` }}>
                {['Set', 'Weight', 'Reps', 'RPE'].map(h => (
                  <div key={h} style={{ flex: h === 'Set' ? 0.5 : 1, textAlign: h === 'Set' ? 'left' : 'center' }}>
                    <ACMono size={9} color={c.mute}>{h}</ACMono>
                  </div>
                ))}
              </div>
              {ex.sets.map((s, si) => (
                <div key={si} style={{
                  display: 'flex', padding: '8px 12px',
                  borderBottom: si < ex.sets.length - 1 ? `1px solid ${c.hair}` : 'none',
                  background: s.pr ? (dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.06)') : 'transparent',
                }}>
                  <div style={{ flex: 0.5 }}>
                    <ACMono size={11} color={c.dim}>{s.s}</ACMono>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>{s.w}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: s.pr ? c.accent : c.fg }}>{s.r}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <ACMono size={11} color={c.dim}>{s.rpe}</ACMono>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S58 — ROUTINES LIST
// ══════════════════════════════════════════════════════════════
function S58_Routines({ dark }) {
  const c = useACT(dark);
  const routines = [
    { name: 'Upper A — Push', exercises: 5, sets: 18, dur: '~50 min', lastUsed: '2d ago', freq: '2×/wk' },
    { name: 'Lower A — Squat', exercises: 5, sets: 20, dur: '~55 min', lastUsed: '1d ago', freq: '1×/wk' },
    { name: 'Upper B — Pull', exercises: 5, sets: 18, dur: '~50 min', lastUsed: '4d ago', freq: '2×/wk' },
    { name: 'Lower B — Deadlift', exercises: 5, sets: 18, dur: '~55 min', lastUsed: '3d ago', freq: '1×/wk' },
    { name: 'Full Body Deload', exercises: 6, sets: 12, dur: '~35 min', lastUsed: '3w ago', freq: 'Deload' },
    { name: 'Quick Pump', exercises: 4, sets: 12, dur: '~25 min', lastUsed: '1w ago', freq: 'Ad hoc' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ACHeader title="Routines" sub="My templates" dark={dark}
        right={
          <div style={{
            width: 28, height: 28, borderRadius: 999, background: c.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2v8M2 6h8" stroke={c.ink} strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        } />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {routines.map((r, i) => (
          <div key={i} style={{
            marginBottom: 10, padding: 16, background: c.card, borderRadius: ACRadii.card,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: ACRadii.input,
              background: i === 0 ? c.accent : c.faint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ACNum size={16} color={i === 0 ? c.ink : c.dim} weight={700}>{i + 1}</ACNum>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{r.name}</div>
              <div style={{ marginTop: 3, display: 'flex', gap: 8 }}>
                <ACMono size={10} color={c.mute}>{r.exercises} exercises</ACMono>
                <ACMono size={10} color={c.mute}>{r.sets} sets</ACMono>
                <ACMono size={10} color={c.mute}>{r.dur}</ACMono>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACLabel size={10} color={c.dim}>{r.lastUsed}</ACLabel>
              <div style={{ marginTop: 2 }}>
                <ACMono size={9} color={c.mute}>{r.freq}</ACMono>
              </div>
            </div>
          </div>
        ))}

        {/* Create new */}
        <div style={{
          marginTop: 4, padding: 16, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={13} color={c.dim}>+ Create new routine</ACLabel>
        </div>
      </div>

      <ACTabBar active="train" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S59 — ROUTINE DETAIL
// ══════════════════════════════════════════════════════════════
function S59_Routine_Detail({ dark }) {
  const c = useACT(dark);
  const exercises = [
    { name: 'Bench Press', type: 'Main lift', sets: '3 × 5/3/1', rest: '3 min', notes: '5/3/1 percentages' },
    { name: 'Bench Press (BBB)', type: 'Supplemental', sets: '5 × 10', rest: '90s', notes: '50–60% of TM' },
    { name: 'OHP', type: 'Accessory', sets: '3 × 10', rest: '90s', notes: '' },
    { name: 'Incline DB Press', type: 'Accessory', sets: '2 × 12', rest: '60s', notes: '' },
    { name: 'Lateral Raise', type: 'Accessory', sets: '3 × 15', rest: '60s', notes: 'Slow eccentric' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 8.5L8.5 2M8.5 2H4M8.5 2v4.5" stroke={c.fg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="4" viewBox="0 0 14 4"><circle cx="2" cy="2" r="1.4" fill={c.fg}/><circle cx="7" cy="2" r="1.4" fill={c.fg}/><circle cx="12" cy="2" r="1.4" fill={c.fg}/></svg>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 20px' }}>
        <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg }}>
          Upper A — Push
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <ACChip dark={dark}>5 exercises</ACChip>
          <ACChip dark={dark}>18 sets</ACChip>
          <ACChip dark={dark}>~50 min</ACChip>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          {[
            { l: 'Last used', v: '2d ago' },
            { l: 'Times run', v: '14' },
            { l: 'Avg volume', v: '8.1k kg' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: 12, background: c.card, borderRadius: ACRadii.input, textAlign: 'center' }}>
              <ACLabel size={9} color={c.mute}>{s.l}</ACLabel>
              <div style={{ marginTop: 3, fontSize: 15, fontWeight: 700, color: c.fg }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Exercise list */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Exercises</ACLabel>
          {exercises.map((ex, i) => (
            <div key={i} style={{
              marginTop: 10, padding: 14, background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: ex.type === 'Main lift' ? c.accent : (ex.type === 'Supplemental' ? c.fg : c.faint),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ACMono size={10} color={
                  ex.type === 'Main lift' ? c.ink : (ex.type === 'Supplemental' ? c.bg : c.dim)
                }>{i + 1}</ACMono>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{ex.name}</div>
                <div style={{ marginTop: 2, display: 'flex', gap: 8 }}>
                  <ACMono size={10} color={c.mute}>{ex.sets}</ACMono>
                  <ACMono size={10} color={c.mute}>rest {ex.rest}</ACMono>
                </div>
                {ex.notes && <ACLabel size={10} color={c.accent} style={{ marginTop: 2 }}>{ex.notes}</ACLabel>}
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14">
                <path d="M1 1l6 6-6 6" stroke={c.faint} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Add exercise */}
        <div style={{
          marginTop: 12, padding: 14, borderRadius: ACRadii.input,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim}>+ Add exercise</ACLabel>
        </div>
      </div>

      <div style={{ padding: '14px 28px 34px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start workout →</ACBtn>
      </div>
    </div>
  );
}

// expose to window for app.jsx
Object.assign(window, {
  S52_Streaks, S53_Focus, S54_Plan, S55_Progress,
  S56_Insights, S57_Workout_Detail, S58_Routines, S59_Routine_Detail,
});
