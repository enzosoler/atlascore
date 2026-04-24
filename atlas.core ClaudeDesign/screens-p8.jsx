// screens-p8.jsx — atlas.core · app · phase 08 · PROTOCOLS
// ─────────────────────────────────────────────────────────────
// Covers the canonical protocols domain from screen-registry.js
// and src/components/protocols. Eight screens, explicit state ownership:
//
//   S43 — P1 Overview (populated)
//   S44 — P1 Overview (empty + locked / paywall)
//   S45 — P2 Protocol Detail (TRT cypionate, with paused+offline states shown inline)
//   S46 — P3 Protocol Form (new, with cycle-conflict + validation warnings)
//   S47 — P5 Substance Picker (search, results, no-results, custom)
//   S48 — P4 Log Dose Sheet (taken · skipped · adjusted, offline queue indicator)
//   S49 — Cross-protocol Timeline (90-day adherence zine — novel moment)
//   S50 — P6 Today Dose Module + all-complete success
//
// Reuses: ACScreen, ACHeader, ACTabBar, ACChip, ACBtn, ACRing, ACSpark,
// ACBars, ACLine, ACNum, ACMono, ACLabel, HeartMark, and the S5 paywall,
// S22 toggle row, S23 empty-state, S25 week-grid, S27 history chart,
// S31 sparkline patterns.

// ══════════════════════════════════════════════════════════════
// P8-1 — PROTOCOLS OVERVIEW (populated)
// Canonical ref: Protocols / ProtocolsHome
// ══════════════════════════════════════════════════════════════
function S43_Protocols_Home({ dark }) {
  const c = useACT(dark);
  const protocols = [
    { id: 'trt',    name: 'Testosterone cypionate', dose: '100 mg', cadence: 'Mon · Thu', adh: 94, cycle: 'on', state: 'active',  next: 'today 18:00' },
    { id: 'bpc',    name: 'BPC-157',                 dose: '250 µg', cadence: 'daily · 14d on · 7d off', adh: 88, cycle: 'on', state: 'active',  next: 'today 08:00' },
    { id: 'creat',  name: 'Creatine monohydrate',    dose: '5 g',    cadence: 'daily',   adh: 97, cycle: null, state: 'active',  next: 'today 09:00' },
    { id: 'berb',   name: 'Berberine',               dose: '500 mg', cadence: 'with meals', adh: 72, cycle: null, state: 'paused', next: '—' },
    { id: 'vitd',   name: 'Vitamin D3 + K2',         dose: '5 000 IU', cadence: 'Mon / Wed / Fri', adh: 81, cycle: null, state: 'active', next: 'wed 12:00' },
  ];
  const activeCount = protocols.filter(p => p.state === 'active').length;
  const todayCount = 4;
  const todayLogged = 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Brand + filter */}
      <div style={{ padding: '0 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrand size={15} dark={dark} />
        <ACMono size={9} color={c.dim}>PRO</ACMono>
      </div>

      <ACHeader dark={dark} sub="PROTOCOLS" title="Today."
        right={<ACChip dark={dark} accent dot>pro</ACChip>} />

      <div style={{ flex: 1, overflow: 'hidden auto', padding: '0 20px 14px' }}>
        {/* Today hero — doses + adherence */}
        <div style={{
          background: c.card, padding: '18px 18px 16px',
          borderRadius: ACRadii.card, marginBottom: 14,
          display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <ACRing size={92} value={Math.round((todayLogged/todayCount)*100)} dark={dark} thickness={8} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ACNum size={22} color={c.fg}>{todayLogged}</ACNum>
              <ACMono size={8} color={c.dim}>OF {todayCount}</ACMono>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>TODAY · DOSES</ACMono>
            <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: c.fg, marginTop: 2, lineHeight: 1.2 }}>
              2 logged. 2 to go.
            </div>
            <div style={{ marginTop: 6 }}>
              <ACMono size={10} color={c.dim}>BPC-157 · 08:00 ✓&nbsp;&nbsp;Creatine · 09:00 ✓</ACMono>
            </div>
          </div>
        </div>

        {/* 30d adherence strip */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <ACMono size={9} color={c.dim} track={2}>30-DAY ADHERENCE · ALL PROTOCOLS</ACMono>
            <span style={{ fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700, color: c.fg }}>
              89<span style={{ color: c.accent }}>%</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 30 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const v = [1,1,1,0.5,1,1,1,1,0,1,1,1,1,1,0.5,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1][i];
              return <div key={i} style={{ flex: 1, background: v === 0 ? c.hair : v < 1 ? c.accent : c.fg, opacity: v === 0 ? 1 : v < 1 ? 1 : 0.85 }} />;
            })}
          </div>
        </div>

        {/* Active section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <ACMono size={9} color={c.dim} track={2}>ACTIVE · {activeCount}</ACMono>
          <ACMono size={9} color={c.accent} track={2}>+ NEW</ACMono>
        </div>

        {protocols.map(p => (
          <ProtocolRow key={p.id} p={p} dark={dark} />
        ))}

        {/* AI insight banner (reuses coach voice) */}
        <div style={{
          marginTop: 10, padding: 14,
          background: c.accent, color: c.ink,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <HeartMark size={18} color={c.ink} accent={c.ink} />
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} track={2} style={{ opacity: 0.6 }}>COACH · INSIGHT</ACMono>
            <div style={{ fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginTop: 2 }}>
              BPC-157 cycle ends Friday. Plan 7-day washout before restart.
            </div>
          </div>
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

function ProtocolRow({ p, dark }) {
  const c = useACT(dark);
  const paused = p.state === 'paused';
  return (
    <div style={{
      padding: '14px 14px 14px', marginBottom: 8,
      background: c.card, borderRadius: ACRadii.card,
      opacity: paused ? 0.55 : 1,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ width: 6, height: 6, background: paused ? c.mute : c.accent, flexShrink: 0 }} />
          <div style={{ fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700, color: c.fg, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.name}
          </div>
        </div>
        <span style={{ fontFamily: ACFonts.display, fontSize: 13, fontWeight: 700, color: c.fg, fontVariantNumeric: 'tabular-nums', marginLeft: 8 }}>
          {p.adh}<span style={{ color: c.dim, fontSize: 10 }}>%</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
        <ACMono size={10} color={c.dim}>{p.dose}</ACMono>
        <span style={{ width: 2, height: 2, background: c.faint }} />
        <ACMono size={10} color={c.dim}>{p.cadence}</ACMono>
        {paused && (
          <>
            <span style={{ width: 2, height: 2, background: c.faint }} />
            <ACMono size={10} color={c.accent}>PAUSED</ACMono>
          </>
        )}
      </div>
      {!paused && (
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ACMono size={9} color={c.dim} track={2}>NEXT · {p.next.toUpperCase()}</ACMono>
          <ACSpark w={80} h={16} dark={dark}
            data={[50,50,50,45,55,30,70,50,50,50,45,55,20,80,30,50,50,50]} stroke={1.5} />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-2 — OVERVIEW · EMPTY + LOCKED (two sub-states in one screen)
// Canonical ref: Protocols (empty + paywall-gated)
// ══════════════════════════════════════════════════════════════
function S44_Protocols_Empty_Locked({ dark }) {
  const c = useACT(dark);
  const [tab, setTab] = React.useState('empty');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '0 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrand size={15} dark={dark} />
        <ACMono size={9} color={c.dim}>PRO</ACMono>
      </div>

      <ACHeader dark={dark} sub="PROTOCOLS" title="Protocols." />

      {/* Sub-state toggle */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ display: 'flex', gap: 1, background: c.hair, padding: 2 }}>
          {[['empty', 'Empty'], ['locked', 'Locked']].map(([k, label]) => (
            <div key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: '8px 0', textAlign: 'center', cursor: 'pointer',
              background: tab === k ? c.fg : 'transparent',
              color: tab === k ? c.bg : c.dim,
              fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
            }}>{label}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 20px', overflow: 'hidden auto' }}>
        {tab === 'empty' ? (
          <div>
            {/* Empty state — first-run */}
            <div style={{ padding: '28px 0 24px', textAlign: 'center' }}>
              <svg width="92" height="92" viewBox="0 0 92 92" style={{ display: 'block', margin: '0 auto 18px' }}>
                {/* Vial / capsule pictogram */}
                <rect x="34" y="14" width="24" height="64" stroke={c.fg} strokeWidth="2.5" fill="none" />
                <line x1="34" y1="40" x2="58" y2="40" stroke={c.fg} strokeWidth="2" />
                <rect x="34" y="40" width="24" height="38" fill={c.fg} opacity="0.08" />
                <circle cx="46" cy="58" r="3" fill={c.accent} />
                <circle cx="46" cy="68" r="3" fill={c.accent} />
                {/* Spark above */}
                <line x1="14" y1="8" x2="22" y2="8" stroke={c.accent} strokeWidth="2" />
                <line x1="70" y1="8" x2="78" y2="8" stroke={c.accent} strokeWidth="2" />
              </svg>
              <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.05, color: c.fg }}>
                No protocols yet.
              </div>
              <div style={{ fontFamily: ACFonts.body, fontSize: 14, color: c.dim, maxWidth: 260, margin: '10px auto 0', lineHeight: 1.5 }}>
                Track supplements, peptides, and anything you're cycling. Cadence, dose, adherence — in one place.
              </div>
            </div>

            {/* Quick-add templates (reusable chips) */}
            <div style={{ marginBottom: 14 }}>
              <ACMono size={9} color={c.dim} track={2}>QUICK START</ACMono>
            </div>
            {[
              { name: 'Creatine monohydrate', meta: '5 g · daily' },
              { name: 'Vitamin D3 + K2',      meta: '5 000 IU · M/W/F' },
              { name: 'Omega-3',              meta: '3 g · daily' },
              { name: 'Magnesium glycinate',  meta: '400 mg · before bed' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '14px 16px', marginBottom: 6,
                background: c.card, borderRadius: ACRadii.card,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700, letterSpacing: -0.2, color: c.fg }}>{t.name}</div>
                  <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{t.meta}</ACMono>
                </div>
                <span style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, color: c.accent }}>+</span>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              <ACBtn primary dark={dark} block size="lg">Create custom protocol</ACBtn>
            </div>
          </div>
        ) : (
          <div>
            {/* Locked / paywall — reuses S5 Paywall vocabulary */}
            <div style={{
              position: 'relative', background: c.fg, color: c.bg,
              padding: '24px 20px 22px',
              marginTop: 4,
            }}>
              <ACMono size={9} track={3} color={c.accent}>PRO · REQUIRED</ACMono>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 34, fontWeight: 800, letterSpacing: -1.2,
                lineHeight: 0.98, marginTop: 10,
              }}>
                Your stack,<br />
                <span style={{ color: c.accent }}>recorded properly.</span>
              </div>
              <div style={{ marginTop: 12, fontFamily: ACFonts.body, fontSize: 13, lineHeight: 1.5, opacity: 0.8 }}>
                Peptides. Hormones. Supplements. Anything you cycle — logged, scheduled, visualized.
                Pro is where protocols live.
              </div>

              {/* ECG */}
              <div style={{ marginTop: 16 }}>
                <ACSpark w={280} h={30} color={c.accent} dark={true} stroke={2.2} />
              </div>
            </div>

            {/* Perks */}
            <div style={{ padding: '16px 0 12px' }}>
              {[
                ['Unlimited protocols', 'One stack or twenty.'],
                ['Cycle-aware cadence',  'On-weeks, off-weeks, loading phases.'],
                ['AI washout warnings',  'Avoid overlapping half-lives.'],
                ['Clinician-ready PDF',  'Export for labs + TRT appointments.'],
              ].map(([t, s], i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, padding: '12px 0',
                  borderBottom: i < 3 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{ flexShrink: 0, width: 6, height: 6, background: c.accent, marginTop: 8 }} />
                  <div>
                    <div style={{ fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700, letterSpacing: -0.2, color: c.fg }}>{t}</div>
                    <div style={{ fontFamily: ACFonts.body, fontSize: 12, color: c.dim, marginTop: 2 }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <ACBtn primary dark={dark} block size="lg">Start 7-day trial</ACBtn>
            </div>
            <div style={{ textAlign: 'center', paddingBottom: 6 }}>
              <ACMono size={10} color={c.dim}>$12 / MO AFTER · CANCEL ANYTIME</ACMono>
            </div>
          </div>
        )}
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-3 — PROTOCOL DETAIL (TRT cypionate)
// Canonical ref: ProtocolDetail
// ══════════════════════════════════════════════════════════════
function S45_Protocol_Detail({ dark }) {
  const c = useACT(dark);
  // 12-week adherence grid (Mon/Thu cadence)
  const weeks = Array.from({ length: 12 }).map((_, wi) => {
    return Array.from({ length: 7 }).map((_, di) => {
      // Cadence: Mon (1) + Thu (4)
      const scheduled = di === 1 || di === 4;
      if (!scheduled) return 'none';
      // Sample misses: 1 miss in week 4, late in week 9
      if (wi === 4 && di === 4) return 'miss';
      if (wi === 9 && di === 1) return 'late';
      if (wi === 11 && di === 4) return 'today';
      return 'ok';
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Top nav */}
      <div style={{ padding: '0 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACMono size={11} color={c.dim}>‹ PROTOCOLS</ACMono>
        <ACMono size={11} color={c.dim}>···</ACMono>
      </div>

      <div style={{ flex: 1, overflow: 'hidden auto' }}>
        {/* Header block */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, background: c.accent }} />
            <ACMono size={10} color={c.dim} track={2}>HORMONE · TRT</ACMono>
          </div>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.05, color: c.fg,
          }}>
            Testosterone<br />cypionate.
          </div>
          <div style={{ marginTop: 8 }}>
            <ACMono size={11} color={c.dim}>100 MG · MON + THU · IM · STARTED 14 JAN 2026</ACMono>
          </div>
        </div>

        {/* Adherence hero */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{
            background: c.card, borderRadius: ACRadii.card,
            padding: '18px', display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <ACRing size={104} value={94} dark={dark} thickness={10} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <ACMono size={9} color={c.dim} track={2}>ADHERENCE · 90D</ACMono>
              <div style={{ fontFamily: ACFonts.display, fontSize: 34, fontWeight: 800, letterSpacing: -1, color: c.fg, lineHeight: 1 }}>
                94<span style={{ color: c.accent, fontSize: 22 }}>%</span>
              </div>
              <div style={{ fontFamily: ACFonts.body, fontSize: 12, color: c.dim, marginTop: 4 }}>
                25 of 26 doses. 1 late, 0 missed.
              </div>
            </div>
          </div>
        </div>

        {/* Today row — primary CTA */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{
            background: c.accent, color: c.ink,
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <ACMono size={9} track={2} style={{ opacity: 0.6 }}>TODAY · THU · 18:00</ACMono>
              <div style={{ fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700, letterSpacing: -0.3, marginTop: 2 }}>
                100 mg · right quad
              </div>
            </div>
            <div style={{
              padding: '8px 14px', background: c.ink, color: c.accent,
              fontFamily: ACFonts.body, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
            }}>Log ›</div>
          </div>
        </div>

        {/* Cadence schedule (week grid) */}
        <div style={{ padding: '0 20px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACMono size={9} color={c.dim} track={2}>CADENCE · 12 WEEKS</ACMono>
            <div style={{ display: 'flex', gap: 10 }}>
              <LegendDot label="ON" color={c.fg} />
              <LegendDot label="LATE" color={c.accent} />
              <LegendDot label="MISS" color={c.faint} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <ACMono size={8} color={c.dim}>{d}</ACMono>
              </div>
            ))}
          </div>
          {weeks.map((w, wi) => (
            <div key={wi} style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {w.map((cell, di) => (
                <div key={di} style={{
                  flex: 1, aspectRatio: '1', position: 'relative',
                  background: cell === 'ok' ? c.fg :
                              cell === 'late' ? c.accent :
                              cell === 'miss' ? c.hair :
                              cell === 'today' ? 'transparent' : 'transparent',
                  border: cell === 'today' ? `1.5px solid ${c.accent}` : 'none',
                }} />
              ))}
            </div>
          ))}
        </div>

        {/* AI insight */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ padding: 14, background: c.card, borderLeft: `3px solid ${c.accent}` }}>
            <ACMono size={9} color={c.accent} track={2}>COACH · INSIGHT</ACMono>
            <div style={{ fontFamily: ACFonts.body, fontSize: 13, color: c.fg, marginTop: 4, lineHeight: 1.45 }}>
              Your last trough labs read 512 ng/dL. At your current cadence you're steady-state.
              No change recommended — next labs due in 6 weeks.
            </div>
          </div>
        </div>

        {/* History list */}
        <div style={{ padding: '0 20px 14px' }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>RECENT · 5 DOSES</ACMono>
          {[
            { d: 'Mon 15 Apr · 18:04', note: '100 mg · left quad',  status: 'ok' },
            { d: 'Thu 11 Apr · 18:00', note: '100 mg · right quad', status: 'ok' },
            { d: 'Mon 08 Apr · 18:22', note: '100 mg · left quad',  status: 'late' },
            { d: 'Thu 04 Apr · 17:55', note: '100 mg · right quad', status: 'ok' },
            { d: 'Mon 01 Apr · 18:00', note: '100 mg · left quad',  status: 'ok' },
          ].map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: `1px solid ${c.hair}`,
            }}>
              <div>
                <ACMono size={10} color={c.dim}>{h.d.toUpperCase()}</ACMono>
                <div style={{ fontFamily: ACFonts.body, fontSize: 13, fontWeight: 500, color: c.fg, marginTop: 2 }}>{h.note}</div>
              </div>
              <ACChip dark={dark} accent={h.status === 'late'} dot>
                {h.status === 'late' ? 'late' : 'on-time'}
              </ACChip>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '0 20px 24px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}><ACBtn dark={dark} block>Edit</ACBtn></div>
          <div style={{ flex: 1 }}><ACBtn dark={dark} block>Pause</ACBtn></div>
          <div style={{ flex: 1, opacity: 0.7 }}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '14px 20px',
              fontFamily: ACFonts.body, fontSize: 16, fontWeight: 600,
              color: '#c2391a',
              background: dark ? 'rgba(194,57,26,0.1)' : 'rgba(194,57,26,0.06)',
              borderRadius: ACRadii.button,
            }}>End</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ label, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 8, height: 8, background: color }} />
      <ACMono size={8} color={color}>{label}</ACMono>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-4 — PROTOCOL FORM (new — with conflict warning)
// Canonical ref: ProtocolForm
// ══════════════════════════════════════════════════════════════
function S46_Protocol_Form({ dark }) {
  const c = useACT(dark);
  const days = ['M','T','W','T','F','S','S'];
  const [selected] = React.useState([0, 3]); // Mon + Thu

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* nav */}
      <div style={{ padding: '0 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACMono size={11} color={c.dim}>CANCEL</ACMono>
        <ACMono size={11} color={c.fg} style={{ fontWeight: 600 }}>NEW PROTOCOL</ACMono>
        <ACMono size={11} color={c.accent} style={{ fontWeight: 700 }}>SAVE</ACMono>
      </div>

      <div style={{ flex: 1, overflow: 'hidden auto', padding: '12px 20px 20px' }}>

        {/* Substance (links to picker) */}
        <FormField label="SUBSTANCE" dark={dark}>
          <div style={{
            padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: c.fg }}>
                Testosterone cypionate
              </div>
              <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>HORMONE · IM · CYP</ACMono>
            </div>
            <ACMono size={12} color={c.dim}>›</ACMono>
          </div>
        </FormField>

        {/* Dose */}
        <FormField label="DOSE" dark={dark}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 2, padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'baseline', gap: 6,
            }}>
              <span style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, color: c.fg, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>100</span>
              <ACMono size={11} color={c.dim}>MG</ACMono>
            </div>
            <div style={{
              flex: 1, padding: '14px 12px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
            }}>
              <ACLabel size={13} color={c.fg}>mg</ACLabel>
              <ACMono size={10} color={c.dim}>▾</ACMono>
            </div>
          </div>
        </FormField>

        {/* Cadence */}
        <FormField label="CADENCE" dark={dark}>
          <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input }}>
            <div style={{ display: 'flex', gap: 1, background: c.hair, padding: 2, marginBottom: 14 }}>
              {['Daily', 'Days', 'Cycle'].map((l, i) => (
                <div key={i} style={{
                  flex: 1, padding: '7px 0', textAlign: 'center',
                  background: i === 1 ? c.fg : 'transparent',
                  color: i === 1 ? c.bg : c.dim,
                  fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
                }}>{l}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {days.map((d, i) => {
                const on = selected.includes(i);
                return (
                  <div key={i} style={{
                    flex: 1, aspectRatio: '1', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: on ? c.accent : 'transparent',
                    border: on ? 'none' : `1px solid ${c.faint}`,
                    color: on ? c.ink : c.fg,
                    fontFamily: ACFonts.display, fontSize: 13, fontWeight: 700,
                  }}>{d}</div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <ACMono size={10} color={c.dim}>2 × PER WEEK · ~ 104 DOSES / YR</ACMono>
              <ACMono size={10} color={c.accent}>18:00 ▾</ACMono>
            </div>
          </div>
        </FormField>

        {/* Cycle */}
        <FormField label="CYCLE" dark={dark} optional>
          <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={13} color={c.fg}>Continuous</ACLabel>
              <ACMono size={10} color={c.dim} style={{ display: 'block', marginTop: 2 }}>No on/off weeks</ACMono>
            </div>
            <div style={{ width: 44, height: 26, background: c.faint, borderRadius: 999, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: c.bg, borderRadius: 999 }} />
            </div>
          </div>
        </FormField>

        {/* ⚠️ conflict warning — validation state */}
        <div style={{
          padding: 14, marginBottom: 14,
          background: dark ? 'rgba(232,181,0,0.12)' : 'rgba(232,181,0,0.18)',
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, width: 16, height: 16, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <span style={{ color: c.ink, fontFamily: ACFonts.display, fontSize: 12, fontWeight: 800 }}>!</span>
            </div>
            <div style={{ flex: 1 }}>
              <ACMono size={9} color={c.accent} track={2}>CYCLE CONFLICT</ACMono>
              <div style={{ fontFamily: ACFonts.body, fontSize: 12, color: c.fg, marginTop: 4, lineHeight: 1.45 }}>
                Overlaps with <strong>Enclomiphene (HPTA)</strong> running through 28 Apr. Coach recommends pausing that first.
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <FormField label="NOTES" dark={dark} optional>
          <div style={{
            padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
            minHeight: 64, fontFamily: ACFonts.body, fontSize: 13, color: c.dim, lineHeight: 1.5,
          }}>
            Rotate injection sites. Draw with 18g, inject with 25g. Keep vial refrigerated.
          </div>
        </FormField>

        {/* Save */}
        <div style={{ marginTop: 12 }}>
          <ACBtn primary dark={dark} block size="lg">Save protocol</ACBtn>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, dark, optional }) {
  const c = useACT(dark);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <ACMono size={9} color={c.dim} track={2}>{label}</ACMono>
        {optional && <ACMono size={9} color={c.faint} track={2}>OPTIONAL</ACMono>}
      </div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-5 — SUBSTANCE PICKER (search + custom)
// Canonical ref: SubstancePicker
// ══════════════════════════════════════════════════════════════
function S47_Substance_Picker({ dark }) {
  const c = useACT(dark);

  const cats = ['All', 'Hormones', 'Peptides', 'Vitamins', 'Nootropics', 'Other'];
  const [cat, setCat] = React.useState('Peptides');

  const results = [
    { name: 'BPC-157',         meta: 'PEPTIDE · REGENERATIVE',       route: 'Subcutaneous' },
    { name: 'TB-500',          meta: 'PEPTIDE · REGENERATIVE',       route: 'Subcutaneous' },
    { name: 'CJC-1295 / Ipamorelin', meta: 'PEPTIDE · GH SECRETAGOGUE', route: 'Subcutaneous' },
    { name: 'Semaglutide',     meta: 'PEPTIDE · GLP-1',              route: 'Subcutaneous' },
    { name: 'Tesamorelin',     meta: 'PEPTIDE · GHRH',               route: 'Subcutaneous' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: c.bg }}>
      {/* nav — sheet */}
      <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACMono size={11} color={c.dim}>✕ CLOSE</ACMono>
        <ACMono size={11} color={c.fg} style={{ fontWeight: 600 }}>SUBSTANCE</ACMono>
        <div style={{ width: 48 }} />
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke={c.dim} strokeWidth="1.5"/>
            <line x1="11" y1="11" x2="14" y2="14" stroke={c.dim} strokeWidth="1.5"/>
          </svg>
          <div style={{ flex: 1, fontFamily: ACFonts.body, fontSize: 14, color: c.fg }}>
            bpc
            <span style={{ display: 'inline-block', width: 1, height: 14, background: c.accent, marginLeft: 2, verticalAlign: 'middle' }} />
          </div>
          <ACMono size={10} color={c.dim}>⌘K</ACMono>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {cats.map(k => {
          const on = k === cat;
          return (
            <div key={k} onClick={() => setCat(k)} style={{
              padding: '6px 12px', cursor: 'pointer',
              background: on ? c.fg : 'transparent',
              color: on ? c.bg : c.fg,
              border: on ? 'none' : `1px solid ${c.faint}`,
              fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
            }}>{k}</div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'hidden auto', padding: '0 20px' }}>
        <div style={{ marginBottom: 10 }}>
          <ACMono size={9} color={c.dim} track={2}>{results.length} RESULTS · {cat.toUpperCase()}</ACMono>
        </div>
        {results.map((r, i) => (
          <div key={i} style={{
            padding: '14px 0', borderBottom: `1px solid ${c.hair}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700, letterSpacing: -0.3, color: c.fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {highlight(r.name, 'BPC', c.accent)}
              </div>
              <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{r.meta}</ACMono>
            </div>
            <ACMono size={10} color={c.dim}>{r.route}</ACMono>
          </div>
        ))}

        {/* No-results shown as subtle footer section for "BPC-9999" variant */}
        <div style={{ marginTop: 18, padding: '16px 14px', background: c.card, borderLeft: `3px solid ${c.accent}` }}>
          <ACMono size={9} color={c.accent} track={2}>CAN'T FIND IT?</ACMono>
          <div style={{ fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700, letterSpacing: -0.2, color: c.fg, marginTop: 4 }}>
            Add a custom substance.
          </div>
          <div style={{ fontFamily: ACFonts.body, fontSize: 12, color: c.dim, marginTop: 4, lineHeight: 1.5 }}>
            Your protocol, your vocabulary. We'll keep it private unless you share.
          </div>
          <div style={{ marginTop: 10 }}>
            <ACBtn dark={dark} size="sm">+ Add custom</ACBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function highlight(text, frag, color) {
  const i = text.toUpperCase().indexOf(frag.toUpperCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color }}>{text.slice(i, i + frag.length)}</span>
      {text.slice(i + frag.length)}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-6 — LOG DOSE SHEET (taken · skipped · adjusted)
// Canonical ref: LogDoseForm / QuickLogSheet
// Presented as a bottom sheet over Today. Includes offline-pending indicator.
// ══════════════════════════════════════════════════════════════
function S48_Log_Dose({ dark }) {
  const c = useACT(dark);
  const [mode, setMode] = React.useState('taken');

  // Dimmed background sim — render Today faintly behind
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative', background: c.bg }}>
      {/* Faux background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.28, pointerEvents: 'none', paddingTop: 18 }}>
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between' }}>
          <ACBrand size={14} dark={dark} />
          <ACMono size={9} color={c.dim}>FRI 18:00</ACMono>
        </div>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, color: c.fg }}>Today.</div>
        </div>
        <div style={{ padding: '0 20px' }}>
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} style={{ background: c.card, height: 60, marginBottom: 10, borderRadius: ACRadii.card }} />
          ))}
        </div>
      </div>

      {/* Dim overlay */}
      <div style={{ position: 'absolute', inset: 0, background: dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)' }} />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 110,
        background: c.bg,
        borderRadius: `${ACRadii.sheet}px ${ACRadii.sheet}px 0 0`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.35)',
      }}>
        {/* Handle */}
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, background: c.faint, borderRadius: 2 }} />
        </div>

        {/* Offline indicator */}
        <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ACMono size={9} color={c.dim} track={2}>LOG DOSE</ACMono>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, background: c.accent }} />
            <ACMono size={9} color={c.accent} track={1.5}>OFFLINE · WILL SYNC</ACMono>
          </div>
        </div>

        {/* Substance header */}
        <div style={{ padding: '8px 20px 14px' }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
            letterSpacing: -0.6, lineHeight: 1.1, color: c.fg,
          }}>
            Testosterone cypionate
          </div>
          <div style={{ marginTop: 4 }}>
            <ACMono size={10} color={c.dim}>100 MG · SCHEDULED FRI 18:00</ACMono>
          </div>
        </div>

        {/* Mode switcher */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', gap: 1, background: c.hair, padding: 2 }}>
            {[['taken','Taken'], ['skipped','Skipped'], ['adjust','Adjust']].map(([k, label]) => (
              <div key={k} onClick={() => setMode(k)} style={{
                flex: 1, padding: '9px 0', textAlign: 'center', cursor: 'pointer',
                background: mode === k ? c.fg : 'transparent',
                color: mode === k ? c.bg : c.dim,
                fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Mode content */}
        <div style={{ flex: 1, padding: '0 20px', overflow: 'hidden auto' }}>
          {mode === 'taken' && (
            <>
              <FormField label="TIME" dark={dark}>
                <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ACLabel size={15} color={c.fg}>Fri 19 Apr · 18:04</ACLabel>
                  <ACMono size={10} color={c.accent}>NOW</ACMono>
                </div>
              </FormField>
              <FormField label="SITE" dark={dark}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Left quad', 'Right quad', 'Left glute', 'Right glute', 'Left delt', 'Right delt'].map((s, i) => (
                    <div key={s} style={{
                      padding: '8px 12px', cursor: 'pointer',
                      background: i === 1 ? c.fg : 'transparent',
                      color: i === 1 ? c.bg : c.fg,
                      border: i === 1 ? 'none' : `1px solid ${c.faint}`,
                      fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600,
                    }}>{s}</div>
                  ))}
                </div>
              </FormField>
              <FormField label="NOTES" dark={dark} optional>
                <div style={{
                  padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                  fontFamily: ACFonts.body, fontSize: 13, color: c.dim, minHeight: 50,
                }}>Clean pull, no backflow.</div>
              </FormField>
            </>
          )}

          {mode === 'skipped' && (
            <>
              <FormField label="REASON" dark={dark}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['Forgot',          'Move to tomorrow'],
                    ['Out of supply',   "I'll reorder"],
                    ['Side effects',    'Flag for coach'],
                    ['Illness',         "I'm not myself"],
                    ['Other',           '—'],
                  ].map(([r, sub], i) => (
                    <div key={r} style={{
                      padding: '12px 14px', background: i === 2 ? c.fg : c.card,
                      color: i === 2 ? c.bg : c.fg,
                      borderRadius: ACRadii.input,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <ACLabel size={14} style={{ fontWeight: 500 }}>{r}</ACLabel>
                      <ACMono size={10} color={i === 2 ? c.accent : c.dim}>{sub}</ACMono>
                    </div>
                  ))}
                </div>
              </FormField>
            </>
          )}

          {mode === 'adjust' && (
            <>
              <FormField label="NEW DOSE" dark={dark}>
                <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                  display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: ACFonts.display, fontSize: 32, fontWeight: 800, color: c.fg, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>80</span>
                  <ACMono size={12} color={c.dim}>MG</ACMono>
                  <div style={{ flex: 1 }} />
                  <ACMono size={10} color={c.accent}>−20 FROM SCHEDULED</ACMono>
                </div>
              </FormField>
              <FormField label="REASON" dark={dark}>
                <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                  fontFamily: ACFonts.body, fontSize: 13, color: c.dim }}>
                  Coach recommended half-dose while labs pending.
                </div>
              </FormField>
            </>
          )}
        </div>

        {/* Primary CTA */}
        <div style={{ padding: '10px 20px 22px', borderTop: `1px solid ${c.hair}` }}>
          <ACBtn primary dark={dark} block size="lg">
            {mode === 'taken' && 'Log dose'}
            {mode === 'skipped' && 'Confirm skip'}
            {mode === 'adjust' && 'Save adjusted dose'}
          </ACBtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-7 — CROSS-PROTOCOL TIMELINE · 90 DAYS (novel zine moment)
// Canonical ref: ProtocolTimeline + AdherenceWidget
// ══════════════════════════════════════════════════════════════
function S49_Protocol_Timeline({ dark }) {
  const c = useACT(dark);
  const protocols = [
    { id: 'trt',   name: 'TRT cyp',       color: c.accent, dose: '100 mg' },
    { id: 'bpc',   name: 'BPC-157',       color: c.fg,     dose: '250 µg' },
    { id: 'creat', name: 'Creatine',      color: c.fg,     dose: '5 g',    alt: true },
    { id: 'vitd',  name: 'Vit D3 + K2',   color: c.accent, dose: '5 ku',   alt: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: c.bg }}>
      <div style={{ padding: '0 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACMono size={11} color={c.dim}>‹ PROTOCOLS</ACMono>
        <ACMono size={11} color={c.dim}>Q1 2026</ACMono>
      </div>

      {/* Poster-scale header */}
      <div style={{ padding: '12px 20px 14px', borderBottom: `1px solid ${c.hair}` }}>
        <ACMono size={10} color={c.accent} track={3}>ISSUE 12 · SUN 19 APR</ACMono>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 44, fontWeight: 800,
          letterSpacing: -1.6, lineHeight: 0.95, color: c.fg, marginTop: 6,
        }}>
          90&nbsp;days.<br />
          <span style={{ color: c.accent }}>four stacks.</span>
        </div>
        <div style={{ marginTop: 8, fontFamily: ACFonts.body, fontSize: 12, color: c.dim, lineHeight: 1.5 }}>
          Every dose, every skip, every cycle. One view.
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden auto', padding: '14px 0 20px' }}>
        {/* Adherence summary */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>LOGGED</ACMono>
            <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800, color: c.fg, letterSpacing: -0.8, marginTop: 2 }}>
              214<span style={{ color: c.dim, fontSize: 14 }}> / 230</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>MISSED</ACMono>
            <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800, color: c.fg, letterSpacing: -0.8, marginTop: 2 }}>
              16
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <ACMono size={9} color={c.dim} track={2}>ADHERENCE</ACMono>
            <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800, color: c.accent, letterSpacing: -0.8, marginTop: 2 }}>
              93<span style={{ fontSize: 14 }}>%</span>
            </div>
          </div>
        </div>

        {/* Timeline bands */}
        <div style={{ padding: '0 20px' }}>
          {/* month ticks */}
          <div style={{ display: 'flex', marginBottom: 6 }}>
            {['JAN', 'FEB', 'MAR', 'APR'].map((m, i) => (
              <div key={m} style={{ flex: 1, borderLeft: i > 0 ? `1px solid ${c.hair}` : 'none', paddingLeft: i > 0 ? 4 : 0 }}>
                <ACMono size={9} color={c.dim} track={2}>{m}</ACMono>
              </div>
            ))}
          </div>

          {protocols.map(p => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, background: p.color }} />
                  <span style={{ fontFamily: ACFonts.display, fontSize: 13, fontWeight: 700, color: c.fg, letterSpacing: -0.2 }}>
                    {p.name}
                  </span>
                </div>
                <ACMono size={9} color={c.dim}>{p.dose.toUpperCase()}</ACMono>
              </div>
              <TimelineBand protocol={p} dark={dark} />
            </div>
          ))}
        </div>

        {/* Events strip */}
        <div style={{ padding: '14px 20px 0', marginTop: 4, borderTop: `1px solid ${c.hair}` }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>MOMENTS · 90D</ACMono>
          {[
            { date: '14 JAN', t: 'Started TRT cypionate', tone: 'accent' },
            { date: '03 FEB', t: 'BPC-157 14-day cycle · on',  tone: 'fg' },
            { date: '17 FEB', t: 'BPC-157 washout · 7 days',   tone: 'dim' },
            { date: '11 MAR', t: 'Dose adjust · −20 mg (coach)', tone: 'accent' },
            { date: '08 APR', t: 'Started Vitamin D3 + K2',    tone: 'fg' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
              <ACMono size={10} color={c.dim} track={1} style={{ minWidth: 56 }}>{e.date}</ACMono>
              <div style={{ fontFamily: ACFonts.body, fontSize: 13, color: e.tone === 'accent' ? c.accent : e.tone === 'dim' ? c.dim : c.fg, fontWeight: 500 }}>
                {e.t}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineBand({ protocol, dark }) {
  const c = useACT(dark);
  // 90 days, ~30 pixels per month. Simulate cadence.
  const cells = Array.from({ length: 90 }).map((_, d) => {
    if (protocol.id === 'trt') {
      // Mon/Thu
      const wd = d % 7;
      if (wd === 0 || wd === 3) {
        if (d === 28) return 'miss';
        if (d === 62) return 'late';
        return 'ok';
      }
      return 'none';
    }
    if (protocol.id === 'bpc') {
      // 14 on, 7 off, 14 on, 7 off, 14 on...
      const cycle = d % 21;
      if (cycle < 14) return 'ok';
      return 'off';
    }
    if (protocol.id === 'creat') {
      return d === 19 || d === 42 || d === 77 ? 'miss' : 'ok';
    }
    if (protocol.id === 'vitd') {
      // M/W/F — starts at d=86 (recently)
      if (d < 82) return 'none';
      const wd = d % 7;
      if (wd === 0 || wd === 2 || wd === 4) return 'ok';
      return 'none';
    }
    return 'none';
  });

  return (
    <div style={{ display: 'flex', gap: 1, height: 16 }}>
      {cells.map((v, i) => {
        const bg = v === 'ok' ? protocol.color :
                   v === 'late' ? c.accent :
                   v === 'miss' ? c.faint :
                   v === 'off' ? c.hair :
                   'transparent';
        return <div key={i} style={{ flex: 1, background: bg, opacity: v === 'off' ? 0.6 : 1 }} />;
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P8-8 — TODAY DOSE MODULE · all-complete success
// Canonical ref: TodayDoseSection
// ══════════════════════════════════════════════════════════════
function S50_Today_Dose_Module({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '0 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrand size={15} dark={dark} />
        <ACMono size={9} color={c.dim}>FRI 19 APR</ACMono>
      </div>

      <ACHeader dark={dark} sub="TODAY" title="Stack complete." />

      <div style={{ flex: 1, overflow: 'hidden auto', padding: '0 20px 14px' }}>
        {/* Success hero — full accent block */}
        <div style={{
          background: c.accent, color: c.ink,
          padding: '22px 20px 20px',
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <ACMono size={10} track={3} style={{ opacity: 0.65 }}>ALL DOSES · LOGGED</ACMono>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 56, fontWeight: 800,
            letterSpacing: -2, lineHeight: 0.92, marginTop: 8,
          }}>
            4 / 4
          </div>
          <div style={{ fontFamily: ACFonts.body, fontSize: 13, fontWeight: 500, marginTop: 10, opacity: 0.85 }}>
            Your full stack — on schedule, on time. First all-clear in 14 days.
          </div>
          <div style={{ position: 'absolute', right: -20, top: -10, opacity: 0.18 }}>
            <HeartMark size={170} color={c.ink} accent={c.ink} />
          </div>
          <div style={{ marginTop: 18 }}>
            <ACSpark w={280} h={22} color={c.ink} dark={false} stroke={2} />
          </div>
        </div>

        {/* Today — complete list */}
        <div style={{ marginBottom: 14 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>LOGGED TODAY</ACMono>
          {[
            { t: '08:02', name: 'BPC-157',           dose: '250 µg · subq abdomen' },
            { t: '09:14', name: 'Creatine mono',     dose: '5 g · in water' },
            { t: '12:30', name: 'Vit D3 + K2',       dose: '5 000 IU · with lunch' },
            { t: '18:04', name: 'TRT cypionate',     dose: '100 mg · right quad' },
          ].map((h, i) => (
            <div key={i} style={{
              display: 'flex', padding: '12px 14px',
              marginBottom: 6, background: c.card, borderRadius: ACRadii.card,
              alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 22, height: 22, background: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2 6.5 L5 9 L10 3" stroke={c.ink} strokeWidth="2" fill="none" strokeLinejoin="miter" strokeLinecap="square" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700, letterSpacing: -0.2, color: c.fg }}>{h.name}</div>
                <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{h.dose.toUpperCase()}</ACMono>
              </div>
              <ACMono size={11} color={c.dim}>{h.t}</ACMono>
            </div>
          ))}
        </div>

        {/* Upcoming tomorrow — forward look */}
        <div style={{ marginBottom: 10 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>TOMORROW · SAT</ACMono>
          <div style={{
            padding: '14px 16px', background: c.card, borderRadius: ACRadii.card,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700, color: c.fg, letterSpacing: -0.2 }}>
                2 doses · BPC-157, Creatine
              </div>
              <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>08:00 + 09:00 · SAME AS TODAY</ACMono>
            </div>
            <ACMono size={10} color={c.accent} track={2}>REMIND ›</ACMono>
          </div>
        </div>
      </div>

      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

// ── exports ──────────────────────────────────────────────────
Object.assign(window, {
  S43_Protocols_Home,
  S44_Protocols_Empty_Locked,
  S45_Protocol_Detail,
  S46_Protocol_Form,
  S47_Substance_Picker,
  S48_Log_Dose,
  S49_Protocol_Timeline,
  S50_Today_Dose_Module,
});
