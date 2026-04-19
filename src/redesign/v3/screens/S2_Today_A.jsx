import React from 'react';
import {
  ACFonts, ACRadii, useACT, useACTheme,
  ACDot, ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACBars, ACLine, ACChip,
  ACHeader, ACBrandMark, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag } from '../lib/brandMarks.jsx';

/**
 * S2_Today_A — the /app/v3/today hero screen.
 *
 * Pure design port: with no props, renders the exact mock values the v3
 * gallery preview was built against (so screenshots stay stable). Each prop
 * below is an optional real-data override; `undefined` falls back to the mock.
 * Pass `null` explicitly to hide an optional element (e.g. weather chip).
 *
 * Props:
 *   - dark            : boolean — theme
 *   - greeting        : string? — e.g. "Good morning, Enzo". Default: undefined (not shown)
 *   - readiness       : { value, trend, trendLabel, hrv, sleep, prompt }?
 *   - lastSession     : { label, name, exerciseSummary, duration, volumeLabel, volume }?
 *   - weather         : { tempC, condition }? — `null` = hide (default), object = show chip
 *   - fuel            : { current, target, unit }?
 *   - weight          : { current, delta, trend: number[] }?
 *   - coachTip        : string?
 *
 * TRUST RULE: callers must never fabricate user data — if a datum is unknown,
 * pass `undefined` so the visible value is clearly the static mock.
 */

const MOCK_READINESS = {
  value: 87,
  trend: '+4',
  trendLabel: 'Rising',
  hrv: 72,
  sleep: '7h 42m',
  prompt: 'Push lower body today.',
};

const MOCK_LAST_SESSION = {
  label: 'Today · Session 24',
  name: 'Heavy Lower',
  exerciseSummary: 'Back squat · RDL · Bulgarian split · Calf raise',
  duration: '58 min',
  volumeLabel: 'Projected volume',
  volume: '18,420 lb',
};

const MOCK_FUEL = {
  current: 1842,
  target: 2380,
  unit: 'kcal',
};

const MOCK_WEIGHT = {
  current: 182.4,
  delta: '↓ 1.8 lb',
  trend: [188,187.6,186.9,186.1,185.8,185.2,184.9,184.3,184,183.4,183.2,182.8,182.6,182.4],
};

const MOCK_COACH_TIP =
  'Your sleep window has shifted 42 min later across the week. Protein was short by ~18g yesterday.';

function formatMockDate() {
  // Static "Sat · 18 Apr" preserves gallery screenshot. Used only as fallback
  // when nothing better is known (e.g. gallery preview).
  return 'Sat · 18 Apr';
}

function formatNumber(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toLocaleString();
}

function WeatherChip({ weather, dark }) {
  if (!weather) return null;
  const c = useACT(dark);
  const temp = typeof weather.tempC === 'number' ? `${Math.round(weather.tempC)}°` : '—';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 999,
      background: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.05)',
      fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
      letterSpacing: -0.2, color: c.fg,
    }}>
      {temp}{weather.condition ? ` · ${weather.condition}` : ''}
    </div>
  );
}

/**
 * useCountUp — animates a number from 0 to target over duration.
 * Returns the current display value. Used for readiness score reveal.
 */
function useCountUp(target, duration = 1000, active = true) {
  const [value, setValue] = React.useState(active ? 0 : target);
  React.useEffect(() => {
    if (!active || !Number.isFinite(target)) { setValue(target); return; }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return value;
}

function S2_Today_A({
  dark = false,
  greeting,
  readiness,
  lastSession,
  weather,
  fuel,
  weight,
  coachTip,
  giftPhase = 'ready',
  onStartWorkout,
  onOpenNutrition,
  onOpenBody,
  onOpenCoach,
  showTabBar = true,
}) {
  const c = useACT(dark);

  // undefined = use mock (gallery preview). null = honest empty state. object = real data.
  const r = readiness === null ? null : { ...MOCK_READINESS, ...(readiness || {}) };
  const ls = lastSession === null ? null : { ...MOCK_LAST_SESSION, ...(lastSession || {}) };
  const f  = fuel === null ? null : { ...MOCK_FUEL, ...(fuel || {}) };
  const w  = weight === null ? null : { ...MOCK_WEIGHT, ...(weight || {}) };
  const tip = coachTip === null ? null : (coachTip ?? MOCK_COACH_TIP);

  // Preserve the original 3-segment decorative bar when no real fuel data is
  // passed (gallery preview fidelity). Use a simple 2-segment proportional
  // bar when a real fuel override arrives.
  const usingMockFuel = fuel === undefined;
  const fuelPct = f ? Math.max(0, Math.min(1, (f.current || 0) / (f.target || 1))) : 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrandMark size={24} dark={dark} HeartMarkComp={HeartMark} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {weather !== undefined && <WeatherChip weather={weather} dark={dark} />}
        </div>
      </div>

      {greeting && (
        <div style={{ padding: '2px 22px 0' }}>
          <div style={{
            fontFamily: ACFonts.display,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.6,
            lineHeight: 1.15,
            color: c.fg,
          }}>
            {greeting}
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 22px 20px' }}>
        {/* Readiness ring — real data or honest empty state */}
        {r ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 0 24px' }}>
            <div style={{ position: 'relative' }}>
              <ACRing size={224} value={r.value} dark={dark} thickness={10} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <ACLabel size={11} color={c.dim} style={{ fontWeight: 500 }}>Readiness</ACLabel>
                <ACNum size={80} color={c.fg} weight={700} style={{ marginTop: 4 }}>{r.value}</ACNum>
                {(r.trendLabel || r.trend) && (
                  <div style={{ marginTop: 8 }}>
                    <ACChip accent dark={dark}>
                      {[r.trendLabel, r.trend].filter(Boolean).join(' · ')}
                    </ACChip>
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 18, fontSize: 14, color: c.dim, textAlign: 'center', maxWidth: 270, lineHeight: 1.5 }}>
              HRV {r.hrv} ms. Sleep {r.sleep}. <span style={{ color: c.fg, fontWeight: 500 }}>{r.prompt}</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>
              No readiness data yet
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
              Complete a workout to see your readiness score.
            </div>
          </div>
        )}

        {ls && (
          <div style={{ background: c.fg, color: c.bg, padding: 20, borderRadius: ACRadii.card, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>{ls.label}</ACLabel>
              <ACLabel size={11} color="rgba(239,233,218,0.5)">{ls.duration}</ACLabel>
            </div>
            <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>
              {ls.name}
            </div>
            <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>
              {ls.exerciseSummary}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(239,233,218,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <ACLabel size={10} color="rgba(239,233,218,0.5)">{ls.volumeLabel}</ACLabel>
                <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>{ls.volume}</div>
              </div>
              <button
                type="button"
                onClick={onStartWorkout}
                style={{ background: c.accent, color: c.ink, padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Start →
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <button type="button" onClick={onOpenNutrition} style={{ padding: 18, background: c.card, borderRadius: ACRadii.card, border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            {f ? (
              <>
                <ACLabel size={11} color={c.dim}>Fuel · today</ACLabel>
                <div style={{ marginTop: 10 }}><ACNum size={34} color={c.fg}>{formatNumber(f.current)}</ACNum></div>
                <div style={{ marginTop: 4 }}><ACLabel size={11} color={c.dim}>of {formatNumber(f.target)} {f.unit}</ACLabel></div>
                <div style={{ marginTop: 12, display: 'flex', height: 6, gap: 2, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ flex: Math.max(0.0001, fuelPct), background: c.accent }} />
                  <div style={{ flex: Math.max(0.0001, 1 - fuelPct), background: c.faint }} />
                </div>
              </>
            ) : (
              <>
                <ACLabel size={11} color={c.dim}>Fuel</ACLabel>
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: c.fg }}>Log a meal</div>
                <div style={{ marginTop: 4, fontSize: 12, color: c.dim, lineHeight: 1.4 }}>Tap to start tracking.</div>
              </>
            )}
          </button>
          <button type="button" onClick={onOpenBody} style={{ padding: 18, background: c.card, borderRadius: ACRadii.card, border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            {w ? (
              <>
                <ACLabel size={11} color={c.dim}>Weight · 14d</ACLabel>
                <div style={{ marginTop: 10 }}><ACNum size={34} color={c.fg}>{w.current}</ACNum></div>
                <div style={{ marginTop: 4 }}>
                  <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>{w.delta}</ACLabel>
                </div>
                <div style={{ marginTop: 12 }}>
                  <ACLine w={132} h={28} dark={dark} data={(w.trend || []).map((v,i)=>({k:i,v}))} />
                </div>
              </>
            ) : (
              <>
                <ACLabel size={11} color={c.dim}>Body</ACLabel>
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: c.fg }}>Log weight</div>
                <div style={{ marginTop: 4, fontSize: 12, color: c.dim, lineHeight: 1.4 }}>Tap to check in.</div>
              </>
            )}
          </button>
        </div>

        <button type="button" onClick={onOpenCoach} style={{ marginTop: 10, padding: 18, background: c.card, borderRadius: ACRadii.card, borderLeft: `3px solid ${c.accent}`, borderTop: 'none', borderRight: 'none', borderBottom: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
          {tip ? (
            <>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Coach</ACLabel>
              <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>{tip}</div>
            </>
          ) : (
            <>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Coach</ACLabel>
              <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>Ask the coach anything about your training, nutrition, or recovery.</div>
            </>
          )}
        </button>
      </div>

      {showTabBar ? <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S2_Today_A;
