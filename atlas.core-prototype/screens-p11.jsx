// screens-p11.jsx — atlas.core app screens, PHASE 11
// Settings, billing & system (8 screens): notification prefs, integrations,
// goals editor, billing history, trial, checkout success, system states, referral.

// ══════════════════════════════════════════════════════════════
// S72 — NOTIFICATION PREFERENCES
// ══════════════════════════════════════════════════════════════
function S72_Notification_Prefs({ dark }) {
  const c = useACT(dark);
  const [master, setMaster] = React.useState(true);

  const Toggle = ({ on }) => (
    <div style={{
      width: 44, height: 26, borderRadius: 999, padding: 2,
      background: on ? c.accent : c.faint, transition: 'background 0.2s',
      display: 'flex', alignItems: on ? 'center' : 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        background: on ? c.ink : c.bg,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  );

  const groups = [
    {
      title: 'Training',
      items: [
        { label: 'Workout reminders', desc: 'Scheduled session nudge, 30 min before', on: true },
        { label: 'PR alerts', desc: 'When you set a new personal record', on: true },
      ],
    },
    {
      title: 'Nutrition',
      items: [
        { label: 'Morning brief', desc: 'Daily plan and readiness summary at 7:00 AM', on: true },
        { label: 'Fuel nudges', desc: 'Protein and calorie pacing throughout the day', on: false },
      ],
    },
    {
      title: 'Health',
      items: [
        { label: 'Lab results', desc: 'When new bloodwork results are processed', on: true },
        { label: 'Sleep summary', desc: 'Morning sleep quality recap', on: true },
      ],
    },
    {
      title: 'Social',
      items: [
        { label: 'Coach messages', desc: 'Direct messages from your assigned coach', on: true },
        { label: 'Social updates', desc: 'Activity from athletes you follow', on: false },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Notifications</span>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Master toggle */}
        <div style={{
          padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.bg }}>All notifications</div>
            <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'}>
              {master ? 'Enabled — receiving alerts' : 'Paused — all alerts silenced'}
            </ACLabel>
          </div>
          <div onClick={() => setMaster(!master)} style={{ cursor: 'pointer' }}>
            <Toggle on={master} />
          </div>
        </div>

        {/* Grouped toggles */}
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginTop: 22 }}>
            <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{g.title}</ACLabel>
            {g.items.map((item, ii) => (
              <div key={ii} style={{
                marginTop: 10, padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: master ? 1 : 0.4,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{item.label}</div>
                  <ACLabel size={11} color={c.mute} style={{ marginTop: 2, display: 'block', lineHeight: 1.4 }}>{item.desc}</ACLabel>
                </div>
                <Toggle on={master && item.on} />
              </div>
            ))}
          </div>
        ))}

        {/* Quiet hours */}
        <div style={{
          marginTop: 22, padding: '14px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Quiet hours</ACLabel>
              <div style={{ marginTop: 4, fontSize: 13, color: c.fg }}>10:00 PM — 7:00 AM</div>
            </div>
            <Toggle on={true} />
          </div>
          <ACLabel size={11} color={c.mute} style={{ marginTop: 6, display: 'block', lineHeight: 1.4 }}>
            Notifications are held and delivered silently after quiet hours end.
          </ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S73 — INTEGRATIONS (connected services)
// ══════════════════════════════════════════════════════════════
function S73_Integrations({ dark }) {
  const c = useACT(dark);

  const services = [
    { name: 'Apple HealthKit', status: 'connected', desc: 'Steps, HR, sleep, workouts', sync: 'Real-time', icon: 'heart' },
    { name: 'Whoop', status: 'connected', desc: 'HRV, strain, recovery score', sync: 'Every 15 min', icon: 'ring' },
    { name: 'Oura', status: 'not-connected', desc: 'Sleep stages, readiness, temperature', sync: null, icon: 'ring' },
    { name: 'Garmin', status: 'not-connected', desc: 'GPS activities, body battery, stress', sync: null, icon: 'watch' },
    { name: 'MyFitnessPal', status: 'import-only', desc: 'One-way food diary import', sync: 'Manual', icon: 'fork' },
  ];

  const StatusChip = ({ status }) => {
    const isOn = status === 'connected';
    const isImport = status === 'import-only';
    return (
      <div style={{
        padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
        background: isOn ? c.accent : (isImport ? c.card : 'transparent'),
        color: isOn ? c.ink : (isImport ? c.fg : c.mute),
        border: !isOn && !isImport ? `1px solid ${c.faint}` : 'none',
        letterSpacing: 0.3,
      }}>
        {isOn ? 'Connected' : isImport ? 'Import only' : 'Not connected'}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Integrations</span>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Summary */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: 'Connected', v: '2' },
            { l: 'Available', v: '5' },
            { l: 'Last sync', v: '3 min' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: 14, background: c.card, borderRadius: ACRadii.input, textAlign: 'center' }}>
              <ACLabel size={9} color={c.mute}>{s.l}</ACLabel>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: c.fg }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Service cards */}
        {services.map((svc, i) => {
          const isOn = svc.status === 'connected';
          return (
            <div key={i} style={{
              marginTop: 12, padding: 16, background: c.card, borderRadius: ACRadii.card,
              borderLeft: `3px solid ${isOn ? c.accent : 'transparent'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: ACRadii.input,
                  background: isOn ? c.accent : c.faint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {svc.icon === 'heart' && <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 15s-6-4.35-6-8.25A3.25 3.25 0 019 4.5a3.25 3.25 0 016 2.25C15 10.65 9 15 9 15z" stroke={isOn ? c.ink : c.dim} strokeWidth="1.5" fill="none"/></svg>}
                  {svc.icon === 'ring' && <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" stroke={isOn ? c.ink : c.dim} strokeWidth="1.5" fill="none"/><circle cx="9" cy="9" r="2.5" stroke={isOn ? c.ink : c.dim} strokeWidth="1.5" fill="none"/></svg>}
                  {svc.icon === 'watch' && <svg width="18" height="18" viewBox="0 0 18 18"><rect x="5" y="3" width="8" height="12" rx="2" stroke={isOn ? c.ink : c.dim} strokeWidth="1.5" fill="none"/><path d="M7 3V1M11 3V1M7 15v2M11 15v2" stroke={isOn ? c.ink : c.dim} strokeWidth="1.2" strokeLinecap="round"/></svg>}
                  {svc.icon === 'fork' && <svg width="18" height="18" viewBox="0 0 18 18"><path d="M6 2v5a3 3 0 006 0V2M9 10v6M9 16h0" stroke={isOn ? c.ink : c.dim} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{svc.name}</span>
                    <StatusChip status={svc.status} />
                  </div>
                  <ACLabel size={11} color={c.mute} style={{ marginTop: 4, display: 'block' }}>{svc.desc}</ACLabel>
                  {svc.sync && (
                    <ACMono size={9} color={c.dim} style={{ marginTop: 4, display: 'block' }}>Sync: {svc.sync}</ACMono>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {isOn ? (
                  <>
                    <div style={{ padding: '8px 14px', background: c.faint, borderRadius: ACRadii.chip, fontSize: 12, fontWeight: 500, color: c.fg, cursor: 'pointer' }}>
                      Sync now
                    </div>
                    <div style={{ padding: '8px 14px', borderRadius: ACRadii.chip, fontSize: 12, fontWeight: 500, color: c.mute, cursor: 'pointer' }}>
                      Disconnect
                    </div>
                  </>
                ) : svc.status === 'import-only' ? (
                  <div style={{ padding: '8px 14px', background: c.accent, color: c.ink, borderRadius: ACRadii.chip, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Import data
                  </div>
                ) : (
                  <div style={{ padding: '8px 14px', background: c.accent, color: c.ink, borderRadius: ACRadii.chip, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Connect
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Privacy note */}
        <div style={{
          marginTop: 18, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Data handling</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            atlas.core reads only the data categories you approve. We never write to connected services. Revoke access at any time from this screen or your device settings.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S74 — GOALS EDITOR
// ══════════════════════════════════════════════════════════════
function S74_Goals({ dark }) {
  const c = useACT(dark);

  const ProgressBar = ({ pct, color }) => (
    <div style={{ height: 6, background: c.faint, borderRadius: 3, marginTop: 8 }}>
      <div style={{ height: 6, background: color || c.accent, borderRadius: 3, width: `${Math.min(pct, 100)}%` }} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Goals</span>
        <ACLabel size={14} color={c.accent} style={{ fontWeight: 600 }}>Save</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Body composition */}
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Body composition</ACLabel>

        <div style={{ marginTop: 12, padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <ACLabel size={10} color={c.accent} style={{ fontWeight: 600 }}>Weight target</ACLabel>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <ACNum size={36} color={c.bg} weight={700}>175</ACNum>
                <ACLabel size={13} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'}>lb</ACLabel>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACMono size={10} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)'}>by Jul 2026</ACMono>
              <div style={{ marginTop: 4 }}>
                <ACMono size={10} color={c.accent}>Current: 183 lb</ACMono>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, height: 6, background: dark ? 'rgba(10,10,10,0.15)' : 'rgba(239,233,218,0.15)', borderRadius: 3 }}>
            <div style={{ height: 6, background: c.accent, borderRadius: 3, width: '65%' }} />
          </div>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <ACMono size={9} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)'}>8 lb remaining</ACMono>
            <ACMono size={9} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)'}>65% complete</ACMono>
          </div>
        </div>

        <div style={{ marginTop: 10, padding: 16, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={10} color={c.mute}>Body fat target</ACLabel>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <ACNum size={28} color={c.fg} weight={700}>12</ACNum>
                <ACLabel size={12} color={c.dim}>%</ACLabel>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACMono size={10} color={c.mute}>Current: 14.2%</ACMono>
              <div style={{ marginTop: 2 }}><ACMono size={9} color={c.accent}>-2.2% to go</ACMono></div>
            </div>
          </div>
          <ProgressBar pct={78} />
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <ACMono size={9} color={c.mute}>Started at 15.8%</ACMono>
            <ACMono size={9} color={c.mute}>78% complete</ACMono>
          </div>
        </div>

        {/* Strength goals */}
        <div style={{ marginTop: 24 }}>
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Strength targets</ACLabel>

          {[
            { lift: 'Bench Press', target: '120 kg', current: '112.5 kg', pct: 94, timeline: 'Est. 4 weeks' },
            { lift: 'Squat', target: '180 kg', current: '165 kg', pct: 92, timeline: 'Est. 8 weeks' },
            { lift: 'Deadlift', target: '200 kg', current: '195 kg', pct: 98, timeline: 'Est. 2 weeks' },
          ].map((g, i) => (
            <div key={i} style={{
              marginTop: 10, padding: 16, background: c.card, borderRadius: ACRadii.card,
              borderLeft: g.pct >= 95 ? `3px solid ${c.accent}` : '3px solid transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{g.lift}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                    <ACMono size={10} color={c.mute}>Current: {g.current}</ACMono>
                    <ACMono size={10} color={c.accent}>Target: {g.target}</ACMono>
                  </div>
                </div>
                <ACNum size={22} color={g.pct >= 95 ? c.accent : c.fg} weight={700}>{g.pct}%</ACNum>
              </div>
              <ProgressBar pct={g.pct} color={g.pct >= 95 ? c.accent : c.fg} />
              <ACMono size={9} color={c.dim} style={{ marginTop: 6, display: 'block' }}>{g.timeline}</ACMono>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ marginTop: 18, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Total projected</ACLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <ACNum size={22} color={c.fg} weight={700}>495</ACNum>
              <ACLabel size={11} color={c.dim}>kg combined</ACLabel>
            </div>
          </div>
          <ACMono size={10} color={c.mute} style={{ marginTop: 4, display: 'block' }}>Current total: 472.5 kg</ACMono>
        </div>

        {/* Recalibration note */}
        <div style={{
          marginTop: 18, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Recalibration</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            Goals are re-evaluated every 4 weeks based on actual progress rate. Timelines adjust automatically — no manual input needed.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S75 — BILLING HISTORY
// ══════════════════════════════════════════════════════════════
function S75_Billing_History({ dark }) {
  const c = useACT(dark);

  const invoices = [
    { date: 'Apr 1, 2026', desc: 'Pro Annual', amount: '$99.00', status: 'paid' },
    { date: 'Apr 1, 2025', desc: 'Pro Annual', amount: '$99.00', status: 'paid' },
    { date: 'Mar 15, 2025', desc: 'Lab Panel Add-on', amount: '$29.00', status: 'paid' },
    { date: 'Apr 1, 2024', desc: 'Pro Annual', amount: '$79.00', status: 'paid' },
    { date: 'Mar 25, 2024', desc: 'Trial conversion', amount: '$0.00', status: 'paid' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Billing</span>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Current plan hero */}
        <div style={{ padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartMark size={18} color={c.bg} accent={c.accent} />
                <span style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: c.bg }}>Pro</span>
              </div>
              <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.55)'} style={{ marginTop: 6, display: 'block' }}>Annual subscription</ACLabel>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACNum size={32} color={c.bg} weight={700}>$99</ACNum>
              <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)'}>/year</ACLabel>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: dark ? 'rgba(10,10,10,0.1)' : 'rgba(239,233,218,0.1)', borderRadius: ACRadii.input }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ACLabel size={11} color={dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)'}>Next renewal</ACLabel>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.bg }}>Apr 1, 2027</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ marginTop: 14, padding: 16, background: c.card, borderRadius: ACRadii.card, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 28, borderRadius: 4, background: c.faint,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="14" viewBox="0 0 22 14"><rect x="1" y="1" width="20" height="12" rx="2" stroke={c.dim} strokeWidth="1.2" fill="none"/><line x1="1" y1="5" x2="21" y2="5" stroke={c.dim} strokeWidth="1.2"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>Visa ending 4821</div>
            <ACMono size={10} color={c.mute}>Expires 08/2028</ACMono>
          </div>
          <ACLabel size={12} color={c.accent} style={{ fontWeight: 500 }}>Update</ACLabel>
        </div>

        {/* Invoice history */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Invoice history</ACLabel>

          {invoices.map((inv, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{inv.desc}</div>
                <ACMono size={10} color={c.mute}>{inv.date}</ACMono>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{inv.amount}</span>
                  <div style={{
                    marginTop: 2, fontSize: 10, fontWeight: 600, color: c.accent,
                    letterSpacing: 0.3,
                  }}>
                    {inv.status.toUpperCase()}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ cursor: 'pointer' }}>
                  <path d="M3 10v2h2l6-6-2-2-6 6zM10.5 3.5l-2-2" stroke={c.mute} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 13h10" stroke={c.mute} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, padding: '12px 0', textAlign: 'center',
            border: `1px solid ${c.faint}`, borderRadius: ACRadii.input,
            fontSize: 13, fontWeight: 500, color: c.dim, cursor: 'pointer',
          }}>Manage subscription</div>
          <div style={{
            flex: 1, padding: '12px 0', textAlign: 'center',
            border: `1px solid ${c.faint}`, borderRadius: ACRadii.input,
            fontSize: 13, fontWeight: 500, color: c.dim, cursor: 'pointer',
          }}>Download all receipts</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S76 — TRIAL START + EXPLANATION
// ══════════════════════════════════════════════════════════════
function S76_Trial({ dark }) {
  const c = useACT(dark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <ACLabel size={14} color={c.dim} style={{ fontWeight: 500, cursor: 'pointer' }}>Skip</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 20px' }}>
        {/* Hero */}
        <div style={{
          padding: 28, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999, background: c.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}>
            <HeartMark size={32} color={c.ink} accent="transparent" />
          </div>
          <div style={{ marginTop: 18, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1.2, color: c.bg, lineHeight: 1 }}>
            7 days free.
          </div>
          <div style={{ marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1.2, color: c.accent, lineHeight: 1 }}>
            Full access.
          </div>
          <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.6)' }}>
            Every feature unlocked from day one. No restrictions, no feature gates, no surprises.
          </div>
        </div>

        {/* What's included */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Everything included</ACLabel>
          {[
            { feature: 'Workout tracking and programming', icon: 'dumbbell' },
            { feature: 'Nutrition logging and macro coaching', icon: 'fork' },
            { feature: 'Body composition tracking', icon: 'body' },
            { feature: 'Lab results and biomarker trends', icon: 'lab' },
            { feature: 'AI coach insights and briefs', icon: 'brain' },
            { feature: 'Sleep and HRV analysis', icon: 'sleep' },
            { feature: 'Progress reports and PR gallery', icon: 'chart' },
            { feature: 'Device integrations (HealthKit, Whoop, etc.)', icon: 'link' },
          ].map((f, i) => (
            <div key={i} style={{
              marginTop: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 999, background: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: c.fg }}>{f.feature}</span>
            </div>
          ))}
        </div>

        {/* What happens after */}
        <div style={{
          marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>After 7 days</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Trial converts to Pro at $99/year',
              'Cancel anytime before day 7 — no charge',
              'We send a reminder on day 5',
              'No contracts, cancel from settings in one tap',
            ].map((note, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <ACDot size={5} color={i === 0 ? c.accent : c.dim} style={{ marginTop: 6 }} />
                <span style={{ fontSize: 13, color: c.fg, lineHeight: 1.5 }}>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing transparency */}
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Pro Annual</ACLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <ACNum size={22} color={c.fg} weight={700}>$99</ACNum>
              <ACLabel size={11} color={c.dim}>/year</ACLabel>
            </div>
          </div>
          <ACMono size={10} color={c.mute} style={{ marginTop: 4, display: 'block' }}>$8.25/month effective. Billed annually after trial.</ACMono>
        </div>
      </div>

      <div style={{ padding: '14px 28px 34px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start free trial</ACBtn>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <ACLabel size={11} color={c.mute}>No payment due today. Cancel anytime.</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S77 — CHECKOUT SUCCESS
// ══════════════════════════════════════════════════════════════
function S77_Checkout_Success({ dark }) {
  const c = useACT(dark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        {/* Checkmark animation placeholder */}
        <div style={{
          width: 100, height: 100, borderRadius: 999,
          background: c.accent, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <path d="M12 24l9 9 15-15" stroke={c.ink} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Pulse rings */}
          <div style={{
            position: 'absolute', inset: -12, borderRadius: 999,
            border: `2px solid ${c.accent}`, opacity: 0.3,
          }} />
          <div style={{
            position: 'absolute', inset: -24, borderRadius: 999,
            border: `1.5px solid ${c.accent}`, opacity: 0.15,
          }} />
        </div>

        <div style={{
          marginTop: 32, fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
          letterSpacing: -1.2, lineHeight: 1.05, color: c.fg,
        }}>
          Welcome to Pro.
        </div>

        <div style={{ marginTop: 12, fontSize: 15, color: c.dim, lineHeight: 1.6, maxWidth: 280 }}>
          Your subscription is active. Every feature is unlocked and ready.
        </div>

        {/* Plan summary */}
        <div style={{
          marginTop: 28, padding: 18, background: c.card, borderRadius: ACRadii.card,
          width: '100%', maxWidth: 320,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartMark size={16} color={c.fg} accent={c.accent} />
              <span style={{ fontSize: 15, fontWeight: 700, color: c.fg }}>Pro Annual</span>
            </div>
            <ACNum size={20} color={c.fg} weight={700}>$99</ACNum>
          </div>
          <div style={{ marginTop: 6 }}>
            <ACMono size={10} color={c.mute}>Charged today. Renews Apr 18, 2027.</ACMono>
          </div>
        </div>

        {/* Next steps */}
        <div style={{ marginTop: 24, width: '100%', maxWidth: 320 }}>
          <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Next steps</ACLabel>
          {[
            { step: '1', label: 'Complete your profile', desc: 'Training experience, goals, and body stats' },
            { step: '2', label: 'Connect your devices', desc: 'HealthKit, Whoop, or Oura for auto-tracking' },
            { step: '3', label: 'Start your first workout', desc: 'Pick a program or build a custom routine' },
          ].map((s, i) => (
            <div key={i} style={{
              marginTop: 10, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999, background: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ACMono size={11} color={c.ink}>{s.step}</ACMono>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{s.label}</div>
                <ACLabel size={11} color={c.mute} style={{ marginTop: 1 }}>{s.desc}</ACLabel>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 28px 34px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Go to atlas.core</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S78 — SYSTEM STATES (4-in-1, pill-tab switchable)
// ══════════════════════════════════════════════════════════════
function S78_System_States({ dark }) {
  const c = useACT(dark);
  const [active, setActive] = React.useState('404');

  const states = {
    '404':        <State404 c={c} dark={dark} />,
    '500':        <State500 c={c} dark={dark} />,
    'permission': <StatePermission c={c} dark={dark} />,
    'offline':    <StateOffline c={c} dark={dark} />,
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>System states</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Error &amp; edge
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 6 }}>
        {[
          { k: '404',        l: '404' },
          { k: '500',        l: '500' },
          { k: 'permission', l: 'Denied' },
          { k: 'offline',    l: 'Offline' },
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

function State404({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: 18,
        border: `1.5px dashed ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="28" r="18" stroke={c.fg} strokeWidth="2" opacity="0.3"/>
          <path d="M24 26h0M40 26h0" stroke={c.fg} strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
          <path d="M24 36c2.5-3 5-4 8-4s5.5 1 8 4" stroke={c.fg} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35"/>
          <path d="M20 50l24-36" stroke={c.accent} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>

      <div style={{
        marginTop: 32, fontFamily: ACFonts.display, fontSize: 48, fontWeight: 700,
        letterSpacing: -2, color: c.fg, lineHeight: 1,
      }}>404</div>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
        letterSpacing: -0.6, color: c.fg,
      }}>Page not found</div>
      <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55, maxWidth: 260 }}>
        This route does not exist or the content has been moved. Check the URL or head back to your dashboard.
      </div>
      <div style={{ marginTop: 24, width: '100%' }}>
        <ACBtn primary dark={dark} size="lg" pill block>Back to dashboard</ACBtn>
      </div>
    </div>
  );
}

function State500({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: 18,
        border: `1.5px dashed ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          {/* Broken gear */}
          <circle cx="32" cy="32" r="12" stroke={c.fg} strokeWidth="2" opacity="0.3" strokeDasharray="4 3"/>
          <circle cx="32" cy="32" r="5" stroke={c.fg} strokeWidth="2" opacity="0.3"/>
          <path d="M32 16v-4M32 52v-4M16 32h-4M52 32h-4M21 21l-3-3M46 46l-3-3M43 21l3-3M18 46l3-3" stroke={c.fg} strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
          <path d="M22 42l20-20" stroke="#e8391f" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>

      <div style={{
        marginTop: 32, fontFamily: ACFonts.display, fontSize: 48, fontWeight: 700,
        letterSpacing: -2, color: c.fg, lineHeight: 1,
      }}>500</div>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
        letterSpacing: -0.6, color: c.fg,
      }}>Server error</div>
      <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55, maxWidth: 260 }}>
        Something went wrong on our end. Your data is safe. This has been logged and our team is looking into it.
      </div>

      <div style={{
        marginTop: 20, padding: '10px 16px', background: c.card, borderRadius: ACRadii.card,
        width: '100%', maxWidth: 280,
      }}>
        <ACMono size={10} color={c.mute} style={{ display: 'block', textAlign: 'center' }}>
          Error ID: ac_err_7f2a9c · Apr 18, 10:42 AM
        </ACMono>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, width: '100%' }}>
        <div style={{ flex: 1 }}><ACBtn dark={dark} size="lg" pill block>Report issue</ACBtn></div>
        <div style={{ flex: 1 }}><ACBtn primary dark={dark} size="lg" pill block>Try again</ACBtn></div>
      </div>
    </div>
  );
}

function StatePermission({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: 18,
        border: `1.5px dashed ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="20" y="28" width="24" height="20" rx="3" stroke={c.fg} strokeWidth="2" opacity="0.35"/>
          <path d="M26 28V22a6 6 0 0112 0v6" stroke={c.fg} strokeWidth="2" fill="none" opacity="0.35"/>
          <circle cx="32" cy="38" r="3" fill={c.accent} opacity="0.7"/>
          <path d="M32 41v4" stroke={c.accent} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>

      <div style={{
        marginTop: 32, fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
        letterSpacing: -0.8, color: c.fg, lineHeight: 1.1,
      }}>Permission denied</div>
      <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55, maxWidth: 260 }}>
        You do not have access to this resource. If you believe this is an error, contact your account administrator or reach out to support.
      </div>

      <div style={{
        marginTop: 20, padding: 14, background: c.card, borderRadius: ACRadii.card,
        width: '100%', maxWidth: 280,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ACLabel size={11} color={c.dim}>Your role</ACLabel>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>Member</span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <ACLabel size={11} color={c.dim}>Required</ACLabel>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e8391f' }}>Admin</span>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, width: '100%' }}>
        <div style={{ flex: 1 }}><ACBtn dark={dark} size="lg" pill block>Request access</ACBtn></div>
        <div style={{ flex: 1 }}><ACBtn primary dark={dark} size="lg" pill block>Go back</ACBtn></div>
      </div>
    </div>
  );
}

function StateOffline({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      {/* Severed signal */}
      <div style={{ width: '100%', padding: '0 10px' }}>
        <svg width="100%" height="80" viewBox="0 0 280 80" fill="none">
          {/* WiFi icon, broken */}
          <path d="M100 50a40 40 0 0180 0" stroke={c.fg} strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
          <path d="M115 58a25 25 0 0150 0" stroke={c.fg} strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          <path d="M130 66a12 12 0 0120 0" stroke={c.fg} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          <circle cx="140" cy="72" r="3" fill={c.faint}/>
          {/* Strike-through */}
          <path d="M108 40l64 36" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div style={{
        marginTop: 16, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1, lineHeight: 1, color: c.fg,
      }}>
        You are offline
      </div>
      <div style={{
        marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55, maxWidth: 280,
      }}>
        No network connection detected. You can still log workouts, meals, and check-ins. Everything syncs automatically when connectivity returns.
      </div>

      {/* Local queue */}
      <div style={{
        marginTop: 24, padding: 14, background: c.card, borderRadius: ACRadii.card,
        width: '100%', maxWidth: 280,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: c.accent }} />
          <div style={{ textAlign: 'left' }}>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Queued locally</ACLabel>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.fg, marginTop: 2 }}>
              2 sets · 1 check-in
            </div>
          </div>
        </div>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>00:12:38 ago</ACLabel>
      </div>

      <div style={{
        marginTop: 14, padding: '10px 14px', background: c.card, borderRadius: ACRadii.input,
        width: '100%', maxWidth: 280,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <ACDot size={6} color={c.accent} />
          <ACLabel size={11} color={c.fg} style={{ fontWeight: 500 }}>Available offline: workouts, nutrition, body log</ACLabel>
        </div>
      </div>

      <div style={{ marginTop: 20, width: '100%' }}>
        <ACBtn dark={dark} size="lg" pill block>Retry connection</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S79 — REFERRAL + INVITE ACCEPT
// ══════════════════════════════════════════════════════════════
function S79_Referral({ dark }) {
  const c = useACT(dark);
  const [view, setView] = React.useState('share');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.fg }}>Referral</span>
        <div style={{ width: 28 }} />
      </div>

      {/* View toggle */}
      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 6 }}>
        {[
          { k: 'share', l: 'Your code' },
          { k: 'accept', l: 'Accept invite' },
        ].map(t => {
          const on = t.k === view;
          return (
            <div key={t.k} onClick={() => setView(t.k)} style={{
              flex: 1, padding: '9px 0', textAlign: 'center',
              background: on ? c.fg : c.card,
              color: on ? c.bg : c.fg,
              fontSize: 12, fontWeight: 600, borderRadius: 999,
              cursor: 'pointer',
            }}>{t.l}</div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px 20px' }}>
        {view === 'share' ? (
          <ReferralShare c={c} dark={dark} />
        ) : (
          <ReferralAccept c={c} dark={dark} />
        )}
      </div>
    </div>
  );
}

function ReferralShare({ c, dark }) {
  return (
    <>
      {/* Hero code */}
      <div style={{
        padding: 24, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        textAlign: 'center',
      }}>
        <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your referral code</ACLabel>
        <div style={{
          marginTop: 12, fontFamily: ACFonts.mono, fontSize: 32, fontWeight: 700,
          letterSpacing: 4, color: c.bg,
        }}>ATLAS-JK92</div>
        <div style={{
          marginTop: 14, padding: '10px 20px', background: c.accent, color: c.ink,
          borderRadius: 999, display: 'inline-block', fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}>Copy link</div>
        <div style={{ marginTop: 10 }}>
          <ACMono size={10} color={dark ? 'rgba(10,10,10,0.4)' : 'rgba(239,233,218,0.4)'}>atlas.core/ref/ATLAS-JK92</ACMono>
        </div>
      </div>

      {/* Share options */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {['Messages', 'Email', 'Twitter', 'More'].map((ch, i) => (
          <div key={ch} style={{
            flex: 1, padding: '12px 0', textAlign: 'center',
            background: c.card, borderRadius: ACRadii.input,
            fontSize: 12, fontWeight: 600, color: c.fg, cursor: 'pointer',
          }}>{ch}</div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginTop: 22 }}>
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Your stats</ACLabel>
        <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
          {[
            { l: 'Invited', v: '12' },
            { l: 'Joined', v: '8' },
            { l: 'Earned', v: '$160' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: 16, background: c.card, borderRadius: ACRadii.card, textAlign: 'center' }}>
              <ACNum size={28} color={s.l === 'Earned' ? c.accent : c.fg} weight={700}>{s.v}</ACNum>
              <ACLabel size={10} color={c.mute} style={{ marginTop: 4, display: 'block' }}>{s.l}</ACLabel>
            </div>
          ))}
        </div>
      </div>

      {/* Reward tiers */}
      <div style={{ marginTop: 22 }}>
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Reward tiers</ACLabel>
        {[
          { tier: '1-5 referrals', reward: '$20 credit per join', done: true },
          { tier: '6-10 referrals', reward: '$20 credit + 1 month free', active: true, progress: 0.6 },
          { tier: '11-25 referrals', reward: '$20 credit + 3 months free', done: false },
          { tier: '25+ referrals', reward: '$20 credit + lifetime Pro', done: false },
        ].map((t, i) => (
          <div key={i} style={{
            marginTop: 10, padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
            display: 'flex', alignItems: 'center', gap: 12,
            borderLeft: t.active ? `3px solid ${c.accent}` : (t.done ? `3px solid ${c.accent}` : '3px solid transparent'),
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              background: t.done ? c.accent : c.faint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {t.done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {t.active && <ACDot size={8} color={c.accent} />}
              {!t.done && !t.active && <ACMono size={9} color={c.dim}>{i + 1}</ACMono>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.done || t.active ? c.fg : c.dim }}>{t.tier}</div>
              <ACLabel size={11} color={c.mute} style={{ marginTop: 1 }}>{t.reward}</ACLabel>
              {t.active && t.progress && (
                <div style={{ marginTop: 6, height: 3, background: c.faint, borderRadius: 2 }}>
                  <div style={{ height: 3, background: c.accent, borderRadius: 2, width: `${t.progress * 100}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReferralAccept({ c, dark }) {
  return (
    <>
      {/* Invite hero */}
      <div style={{
        padding: 28, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 999, background: c.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto',
        }}>
          <HeartMark size={28} color={c.ink} accent="transparent" />
        </div>
        <div style={{
          marginTop: 18, fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
          letterSpacing: -0.8, color: c.bg, lineHeight: 1.1,
        }}>
          You've been invited
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.6)', lineHeight: 1.5 }}>
          A friend thinks you'd benefit from atlas.core. Their referral gives you both a reward.
        </div>
      </div>

      {/* Referrer info */}
      <div style={{
        marginTop: 14, padding: 16, background: c.card, borderRadius: ACRadii.card,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999, background: c.faint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ACLabel size={16} color={c.fg} style={{ fontWeight: 700 }}>JK</ACLabel>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>Jake K.</div>
          <ACMono size={10} color={c.mute}>Pro member since Mar 2024</ACMono>
        </div>
        <ACChip dark={dark} accent>Referrer</ACChip>
      </div>

      {/* What you get */}
      <div style={{ marginTop: 22 }}>
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>What you receive</ACLabel>
        {[
          { label: '7-day free trial', desc: 'Full Pro access, no restrictions' },
          { label: '$20 account credit', desc: 'Applied to your first billing cycle' },
          { label: 'Extended support', desc: 'Priority onboarding assistance for 30 days' },
        ].map((item, i) => (
          <div key={i} style={{
            marginTop: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: `1px solid ${c.hair}`,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 999, background: c.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{item.label}</div>
              <ACLabel size={11} color={c.mute} style={{ marginTop: 1 }}>{item.desc}</ACLabel>
            </div>
          </div>
        ))}
      </div>

      {/* Code input */}
      <div style={{ marginTop: 22 }}>
        <ACLabel size={11} color={c.dim} style={{ fontWeight: 600 }}>Referral code</ACLabel>
        <div style={{
          marginTop: 8, padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: ACFonts.mono, fontSize: 16, fontWeight: 600, color: c.fg, letterSpacing: 2 }}>ATLAS-JK92</span>
          <div style={{
            width: 24, height: 24, borderRadius: 999, background: c.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <ACMono size={10} color={c.accent} style={{ marginTop: 4, display: 'block' }}>Valid code — reward will be applied</ACMono>
      </div>

      <div style={{ marginTop: 24 }}>
        <ACBtn primary block dark={dark} size="lg" pill>Accept invite and start trial</ACBtn>
      </div>
    </>
  );
}

// expose to window for app.jsx
Object.assign(window, {
  S72_Notification_Prefs, S73_Integrations, S74_Goals, S75_Billing_History,
  S76_Trial, S77_Checkout_Success, S78_System_States, S79_Referral,
});
