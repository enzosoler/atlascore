/**
 * V3Today — The daily operating system.
 *
 * STATE → DECISION → ACTION → FEEDBACK → UPDATE
 *
 * This is the center of atlas.core. It:
 *   1. Shows a check-in if the user hasn't checked in today
 *   2. Calculates readiness from sleep/recovery/soreness
 *   3. Generates 3-5 concrete actions based on readiness
 *   4. Tracks completion → adherence score
 *   5. Feeds adherence back into next day's readiness
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { useDailySystem, getSystemIntegrity } from '@/lib/dailySystem';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { upsertDailyCheckin } from '@/services/checkinService';
import { useLiveWeather } from '../lib/useLiveWeather.js';
import {
  ACFonts, ACRadii, useACT, ACBrand,
  ACLabel, ACMono, ACNum, ACBtn, ACChip, ACRing,
  ACBrandMark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function timeOfDaySalute(hour, t) {
  if (hour < 12) return t('today.system.greeting.morning');
  if (hour < 17) return t('today.system.greeting.afternoon');
  return t('today.system.greeting.evening');
}

function interpolate(template, vars) {
  if (!template) return '';
  return Object.keys(vars || {}).reduce(
    (acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])),
    template
  );
}

function resolveDisplayName(user) {
  if (!user) return null;
  const meta = user.user_metadata || user.raw_user?.user_metadata || {};
  const display = meta.display_name || meta.name || meta.full_name;
  if (typeof display === 'string' && display.trim()) return display.trim();
  if (user.full_name && user.full_name !== 'Athlete') return user.full_name;
  if (user.email) return user.email.split('@')[0];
  return null;
}

function sleepScaleToHours(scale) {
  const map = { 1: 4.5, 2: 6, 3: 7, 4: 8, 5: 9 };
  return map[scale] || 7;
}

function hoursToSleepScale(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value)) return 3;
  if (value < 5.5) return 1;
  if (value < 6.5) return 2;
  if (value < 7.5) return 3;
  if (value < 8.5) return 4;
  return 5;
}

function checkinToScales(checkin) {
  return {
    sleep: hoursToSleepScale(checkin?.sleep_hours),
    recovery: Math.min(5, Math.max(1, Number(checkin?.recovery ?? checkin?.energy ?? 3) || 3)),
    soreness: Math.min(5, Math.max(1, Number(checkin?.soreness ?? 1) || 1)),
  };
}

function WeatherChip({ weather, c }) {
  if (!weather) return null;
  const temp = typeof weather.tempC === 'number' ? `${Math.round(weather.tempC)}°` : null;
  if (!temp) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 999,
      background: 'rgba(239,233,218,0.08)',
      fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
      letterSpacing: -0.2, color: c.fg,
    }}>
      {temp}{weather.condition ? ` · ${weather.condition}` : ''}
    </div>
  );
}

// ─── CHECK-IN SCREEN ────────────────────────────────────────

function CheckInScreen({ dark, greeting, weather, onSubmit }) {
  const t = useT();
  const c = useACT(dark);
  const [sleep, setSleep] = useState(3);
  const [recovery, setRecovery] = useState(3);
  const [soreness, setSoreness] = useState(1);

  const labels = {
    1: t('today.system.checkIn.scale.terrible'),
    2: t('today.system.checkIn.scale.poor'),
    3: t('today.system.checkIn.scale.okay'),
    4: t('today.system.checkIn.scale.good'),
    5: t('today.system.checkIn.scale.excellent'),
  };
  const sorenessLabels = {
    1: t('today.system.checkIn.sorenessScale.none'),
    2: t('today.system.checkIn.sorenessScale.mild'),
    3: t('today.system.checkIn.sorenessScale.moderate'),
    4: t('today.system.checkIn.sorenessScale.high'),
    5: t('today.system.checkIn.sorenessScale.extreme'),
  };

  function ScaleRow({ label, value, onChange, labelMap }) {
    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <ACLabel size={13} color={c.fg} style={{ fontWeight: 600 }}>{label}</ACLabel>
          <ACMono size={11} color={c.accent}>{labelMap[value]}</ACMono>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              style={{
                flex: 1, height: 44, borderRadius: ACRadii.button,
                border: 'none', cursor: 'pointer',
                background: v <= value ? c.accent : c.card,
                color: v <= value ? c.ink : c.dim,
                fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                transition: 'background 0.15s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrandMark size={24} dark={dark} HeartMarkComp={HeartMark} />
        <WeatherChip weather={weather} c={c} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 22px 24px' }}>
        {greeting && (
          <div style={{
            fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
            letterSpacing: -0.6, lineHeight: 1.15, color: c.fg, marginBottom: 4,
          }}>
            {greeting}
          </div>
        )}

        <div style={{
          marginTop: 24, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
        }}>
          {t('today.system.checkIn.heading')}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          {t('today.system.checkIn.subtitle')}
        </div>

        <ScaleRow label={t('today.system.checkIn.sleep')}    value={sleep}    onChange={setSleep}    labelMap={labels} />
        <ScaleRow label={t('today.system.checkIn.recovery')} value={recovery} onChange={setRecovery} labelMap={labels} />
        <ScaleRow label={t('today.system.checkIn.soreness')} value={soreness} onChange={setSoreness} labelMap={sorenessLabels} />

        <button
          type="button"
          onClick={() => onSubmit(sleep, recovery, soreness)}
          style={{
            marginTop: 28, width: '100%', padding: '16px 24px',
            background: c.accent, color: c.ink, border: 'none',
            borderRadius: 999, fontFamily: ACFonts.body, fontSize: 16,
            fontWeight: 600, letterSpacing: -0.2, cursor: 'pointer',
          }}
        >
          {t('today.system.checkIn.submit')}
        </button>
      </div>
    </div>
  );
}

// ─── DAILY SYSTEM SCREEN ────────────────────────────────────

function DailySystemScreen({ dark, greeting, weather, readiness, actions, completions, adherence, trend, momentum, proteinConsumed, proteinTarget, onToggle, onNavigate }) {
  const t = useT();
  const c = useACT(dark);
  const navigate = useNavigate();

  // First-win detection — toast once when first anchor completes
  const prevDone = useRef(adherence.done);
  useEffect(() => {
    if (adherence.done > 0 && prevDone.current === 0) {
      try {
        if (!localStorage.getItem('atlas.firstWin')) {
          localStorage.setItem('atlas.firstWin', '1');
          toast.success(t('today.system.firstWin'));
        }
      } catch {}
    }
    prevDone.current = adherence.done;
  }, [adherence.done, t]);

  const statusColors = {
    high: c.accent,
    medium: c.fg,
    low: ACBrand.error || '#c65b4b',
  };

  const categoryIcons = {
    train: '◆',
    eat: '●',
    recover: '○',
    habit: '—',
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrandMark size={24} dark={dark} HeartMarkComp={HeartMark} />
        <WeatherChip weather={weather} c={c} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 22px 24px' }}>
        {greeting && (
          <div style={{
            fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
            letterSpacing: -0.6, lineHeight: 1.15, color: c.fg, marginBottom: 4,
          }}>
            {greeting}
          </div>
        )}

        {/* SYSTEM HEALTH — warnings about missing inputs */}
        {(() => {
          const warnings = [];
          if (!proteinTarget || proteinTarget <= 0) warnings.push(t('today.system.warnings.proteinTargetMissing'));
          if (trend.values.length === 0) warnings.push(t('today.system.warnings.noHistory'));
          if (trend.values.length > 0 && trend.direction === '↓') warnings.push(t('today.system.warnings.adherenceDeclining'));

          if (warnings.length === 0) return null;
          return (
            <div style={{
              marginTop: 12, padding: '8px 14px', borderRadius: ACRadii.button,
              border: `1px solid ${c.hair}`,
            }}>
              <ACMono size={9} color={c.mute} style={{ fontWeight: 600, letterSpacing: 0.5 }}>
                {interpolate(t('today.system.warnings.systemPrefix'), { list: warnings.join(' · ') })}
              </ACMono>
            </div>
          );
        })()}

        {/* 1. STATUS BLOCK */}
        <div style={{
          marginTop: 16, padding: 20, background: c.card,
          borderRadius: ACRadii.card,
          borderLeft: `3px solid ${statusColors[readiness.level]}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACMono size={10} color={statusColors[readiness.level]} style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                {interpolate(t('today.system.readinessLabel'), { level: t(`today.system.levels.${readiness.level}`) || readiness.level })}
              </ACMono>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <ACNum size={48} color={c.fg} weight={700}>{readiness.score}</ACNum>
                <ACLabel size={12} color={c.dim}>{t('today.system.outOf')}</ACLabel>
              </div>
            </div>
            <ACRing size={64} value={readiness.score} dark={dark} thickness={5} color={statusColors[readiness.level]} />
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
            {readiness.level === 'high'
              ? t('today.system.reveal.consequenceHigh')
              : readiness.level === 'medium'
                ? t('today.system.reveal.consequenceMedium')
                : t('today.system.reveal.consequenceLow')}
          </div>
          {readiness.reasons && readiness.reasons.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <ACMono size={10} color={c.mute} style={{ letterSpacing: 0.3 }}>
                {readiness.reasons.join(' · ')}
              </ACMono>
            </div>
          )}
        </div>

        {/* 7-DAY TREND */}
        {trend && trend.values.length > 0 && (
          <div style={{
            marginTop: 10, padding: '12px 16px', background: c.card,
            borderRadius: ACRadii.button, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <ACMono size={10} color={c.dim} style={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              {t('today.system.trend7d')}
            </ACMono>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ACLabel size={14} color={c.fg} style={{ fontWeight: 700 }}>{trend.avg}%</ACLabel>
              <ACLabel size={16} color={trend.direction === '↑' ? c.accent : trend.direction === '↓' ? (ACBrand.error || '#c65b4b') : c.dim}>
                {trend.direction}
              </ACLabel>
            </div>
          </div>
        )}

        {/* MOMENTUM */}
        {momentum && (
          <div style={{ marginTop: 6, paddingLeft: 16 }}>
            <ACMono size={10} color={trend.direction === '↑' ? c.accent : (ACBrand.error || '#c65b4b')} style={{ fontWeight: 600, letterSpacing: 0.3 }}>
              {trend.direction === '↑' ? t('today.system.momentum.building') : t('today.system.momentum.downtrend')}
            </ACMono>
          </div>
        )}

        {/* SYSTEM STATUS — single line summary */}
        {(() => {
          const trainingAction = actions.find(a => a.category === 'train');
          const proteinAction = actions.find(a => a.anchor && a.category === 'eat');
          const trainingDone = trainingAction && completions[trainingAction.id] === 'done';
          const proteinDone = proteinAction && (proteinConsumed >= proteinTarget || completions[proteinAction.id] === 'done');
          const allDone = adherence.adherence >= 100;

          let statusText, statusColor;
          if (allDone) {
            statusText = t('today.system.status.allDone');
            statusColor = c.accent;
          } else if (trainingDone && proteinDone) {
            statusText = t('today.system.status.anchorsDone');
            statusColor = c.accent;
          } else if (trainingDone && !proteinDone) {
            statusText = interpolate(t('today.system.status.trainDoneProteinMissing'), {
              consumed: proteinConsumed, target: proteinTarget,
            });
            statusColor = c.fg;
          } else if (!trainingDone && proteinDone) {
            statusText = t('today.system.status.proteinDoneTrainPending');
            statusColor = c.fg;
          } else if (adherence.done > 0) {
            statusText = t('today.system.status.started');
            statusColor = c.dim;
          } else {
            statusText = readiness.level === 'low'
              ? t('today.system.status.recovery')
              : t('today.system.status.ready');
            statusColor = c.dim;
          }

          // System integrity
          const anchorsComplete = trainingDone && proteinDone;
          const integrity = getSystemIntegrity(adherence, trend, anchorsComplete);
          const integrityColor = integrity.state === 'stable' ? c.accent
            : integrity.state === 'degrading' ? c.fg
            : (ACBrand.error || '#c65b4b');

          const integrityLabel = integrity.state === 'stable' ? t('today.system.integrity.stable')
            : integrity.state === 'degrading' ? t('today.system.integrity.degrading')
            : t('today.system.integrity.broken');

          return (
            <div style={{
              marginTop: 10, padding: '10px 16px', borderRadius: ACRadii.button,
              background: c.card,
            }}>
              <ACMono size={11} color={statusColor} style={{ fontWeight: 600, letterSpacing: 0.2 }}>
                {statusText}
              </ACMono>
              <ACMono size={10} color={integrityColor} style={{ fontWeight: 600, letterSpacing: 0.4, marginTop: 6, display: 'block' }}>
                {integrityLabel}
              </ACMono>
            </div>
          );
        })()}

        {/* 2. WHAT TO DO TODAY */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <ACMono size={10} color={c.dim} style={{ fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {t('today.system.whatToDo')}
            </ACMono>
            <ACMono size={10} color={c.accent} style={{ fontWeight: 700 }}>
              {adherence.done}/{adherence.total}
            </ACMono>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map(action => {
              // Auto-complete protein actions when target is reached
              const isProteinAction = action.anchor && action.category === 'eat' && action.text.includes('protein');
              const proteinMet = isProteinAction && proteinConsumed >= proteinTarget;
              const status = proteinMet ? 'done' : (completions[action.id] || 'pending');
              const isDone = status === 'done';
              const isSkipped = status === 'skipped';
              return (
                <div
                  key={action.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', background: c.card,
                    borderRadius: ACRadii.button,
                    opacity: isSkipped ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Checkbox — training actions auto-complete from workouts, not manual */}
                  <button
                    type="button"
                    onClick={() => {
                      if (action.category === 'train' && !isDone) {
                        // Training actions must be completed by actually logging a workout
                        navigate('/app/workouts');
                        return;
                      }
                      onToggle(action.id);
                    }}
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: 'none',
                      background: isDone ? c.accent : isSkipped ? c.faint : 'transparent',
                      borderWidth: isDone || isSkipped ? 0 : 2,
                      borderStyle: 'solid',
                      borderColor: c.hair,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    {isDone && (
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <path d="M3 7l3 3 5-6" stroke={c.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isSkipped && (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M2 6h8" stroke={c.dim} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>

                  {/* Action text + live protein progress */}
                  <button
                    type="button"
                    onClick={() => action.route ? navigate(action.route) : onToggle(action.id)}
                    style={{
                      flex: 1, background: 'none', border: 'none',
                      textAlign: 'left', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <div style={{
                      fontFamily: ACFonts.body, fontSize: 14.5, fontWeight: 500,
                      letterSpacing: -0.1, lineHeight: 1.4,
                      color: isDone ? c.dim : c.fg,
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {isProteinAction
                        ? interpolate(t('today.system.proteinProgress'), { consumed: proteinConsumed, target: proteinTarget })
                        : action.text}
                    </div>
                    {isProteinAction && !isDone && (() => {
                      const remaining = Math.max(0, proteinTarget - proteinConsumed);
                      const pct = proteinTarget > 0 ? (proteinConsumed / proteinTarget) : 0;
                      const deficitColor = pct > 0.7 ? c.accent : pct > 0.35 ? c.fg : c.dim;
                      return remaining > 0 ? (
                        <div style={{
                          marginTop: 3, fontFamily: ACFonts.mono || ACFonts.body,
                          fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
                          color: deficitColor,
                        }}>
                          {interpolate(t('today.system.remaining'), { amount: remaining })}
                        </div>
                      ) : null;
                    })()}
                    {isProteinAction && !isDone && proteinConsumed > 0 && (
                      <div style={{
                        marginTop: 6, height: 4, borderRadius: 2,
                        background: c.faint, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${Math.min(100, (proteinConsumed / proteinTarget) * 100)}%`,
                          background: c.accent,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    )}
                  </button>

                  {/* Anchor badge or category dot */}
                  {action.anchor ? (
                    <ACMono size={8} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t('today.system.anchorBadge')}</ACMono>
                  ) : (
                    <ACMono size={9} color={c.mute}>{categoryIcons[action.category]}</ACMono>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PROGRESS */}
        {adherence.done > 0 && (
          <div style={{
            marginTop: 20, padding: 18, background: c.card,
            borderRadius: ACRadii.card, textAlign: 'center',
          }}>
            <ACNum size={36} color={adherence.adherence >= 80 ? c.accent : c.fg} weight={700}>
              {adherence.adherence}%
            </ACNum>
            <div style={{ marginTop: 6 }}>
              <ACLabel size={12} color={c.dim}>{adherence.label}</ACLabel>
            </div>
            {/* Progress bar */}
            <div style={{
              marginTop: 12, height: 6, borderRadius: 3,
              background: c.faint, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${adherence.adherence}%`,
                background: adherence.adherence >= 80 ? c.accent : c.fg,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROUTE ──────────────────────────────────────────────────

// ─── READINESS REVEAL (3-stage gift: anticipation → reveal → celebration) ──

function ReadinessReveal({ dark, readiness, onComplete }) {
  const t = useT();
  const c = useACT(dark);
  const [phase, setPhase] = React.useState('anticipation');

  React.useEffect(() => {
    // Tighter timing: 700ms anticipation, 1300ms reveal = ~2s total
    const t1 = setTimeout(() => setPhase('reveal'), 700);
    const t2 = setTimeout(() => onComplete(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  const statusColors = { high: c.accent, medium: c.fg, low: ACBrand.error || '#c65b4b' };

  // Consequence line — connects state → decision immediately
  const consequenceLine = readiness.level === 'high'
    ? t('today.system.reveal.consequenceHigh')
    : readiness.level === 'medium'
      ? t('today.system.reveal.consequenceMedium')
      : t('today.system.reveal.consequenceLow');

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: c.bg, color: c.fg, padding: 32,
    }}>
      <style>{`
        @keyframes revealPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes revealFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes revealCountUp { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {phase === 'anticipation' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'revealPulse 0.7s ease-in-out infinite' }}>
            <HeartMark size={56} color={c.fg} accent={c.accent} />
          </div>
          <div style={{
            marginTop: 16, fontFamily: ACFonts.mono, fontSize: 11,
            letterSpacing: 1.5, textTransform: 'uppercase', color: c.dim,
          }}>
            {t('today.system.reveal.building')}
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div style={{ textAlign: 'center', animation: 'revealFadeUp 0.4s ease-out' }}>
          <ACMono size={10} color={statusColors[readiness.level]} style={{ fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {interpolate(t('today.system.readinessLabel'), { level: t(`today.system.levels.${readiness.level}`) || readiness.level })}
          </ACMono>
          <div style={{ marginTop: 10, animation: 'revealCountUp 0.35s ease-out 0.1s both' }}>
            <ACNum size={88} color={c.fg} weight={700}>{readiness.score}</ACNum>
          </div>
          <div style={{ marginTop: 14, fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600, color: c.fg, letterSpacing: -0.3 }}>
            {consequenceLine}
          </div>
          {readiness.reasons && readiness.reasons.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <ACMono size={10} color={c.mute} style={{ letterSpacing: 0.3 }}>
                {readiness.reasons.join(' · ')}
              </ACMono>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FIRST-TIME WELCOME OVERLAY ─────────────────────────────

function FirstTimeOverlay({ dark, onDismiss }) {
  const t = useT();
  const c = useACT(dark);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 32,
    }}>
      <div style={{
        maxWidth: 340, padding: 32, borderRadius: ACRadii.sheet,
        background: c.bg, color: c.fg, textAlign: 'center',
      }}>
        <HeartMark size={48} color={c.fg} accent={c.accent} />
        <div style={{
          marginTop: 18, fontFamily: ACFonts.display, fontSize: 24,
          fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1,
        }}>
          {t('today.system.firstTime.title')}
        </div>
        <div style={{ marginTop: 12, fontSize: 14, color: c.dim, lineHeight: 1.6 }}>
          {t('today.system.firstTime.body')}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            marginTop: 24, width: '100%', padding: '14px 20px',
            background: c.accent, color: c.ink, border: 'none',
            borderRadius: 999, fontFamily: ACFonts.body, fontSize: 15,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t('today.system.firstTime.cta')}
        </button>
      </div>
    </div>
  );
}

// ─── ROUTE ──────────────────────────────────────────────────

export default function V3Today() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useT();
  const weather = useLiveWeather();
  const navigate = useNavigate();
  const dark = theme === 'dark';

  const daily = useDailyStateV2() || { nutrition: null, todayMeals: [], recentSessions: [], workoutStreak: 0 };

  const name = resolveDisplayName(user);
  const greeting = name ? `${timeOfDaySalute(new Date().getHours(), t)}, ${name}` : undefined;

  const proteinTarget = daily.nutrition?.proteinTarget || user?.user_metadata?.daily_protein_target || 0;
  const proteinConsumed = daily.nutrition?.proteinConsumed || 0;

  const system = useDailySystem({ proteinTarget });
  const bootstrappedCheckin = useRef(false);

  // First-time welcome (one-time, localStorage)
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return !localStorage.getItem('atlas.welcomed'); } catch { return false; }
  });

  // Readiness reveal ceremony (after each check-in)
  const [showReveal, setShowReveal] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  useEffect(() => {
    if (!daily.checkin || system.checkedIn || bootstrappedCheckin.current) return;
    const scales = checkinToScales(daily.checkin);
    bootstrappedCheckin.current = true;
    system.checkIn(scales.sleep, scales.recovery, scales.soreness);
  }, [daily.checkin, system]);

  async function handleCheckIn(sleep, recovery, soreness) {
    system.checkIn(sleep, recovery, soreness);
    setJustCheckedIn(true);
    setShowReveal(true);
    if (!user?.id) return;

    try {
      await upsertDailyCheckin(user.id, {
        date: new Date().toISOString().slice(0, 10),
        sleep_hours: sleepScaleToHours(sleep),
        energy: recovery,
        recovery,
        soreness,
      });
      daily.invalidateAfterAction?.('checkin');
    } catch (error) {
      console.error('[V3Today] checkin save failed', error);
      toast.error('Check-in saved locally, but cloud sync failed.', {
        description: error?.message || 'Try again later.',
      });
    }
  }

  function dismissWelcome() {
    try { localStorage.setItem('atlas.welcomed', '1'); } catch {}
    setShowWelcome(false);
  }

  if (daily.checkinDone && !system.checkedIn) {
    return null;
  }

  // Not checked in → show check-in (with optional welcome overlay)
  if (!system.checkedIn && !daily.checkinDone) {
    return (
      <>
        {showWelcome && <FirstTimeOverlay dark={dark} onDismiss={dismissWelcome} />}
        <CheckInScreen
          dark={dark}
          greeting={greeting}
          weather={weather}
          onSubmit={handleCheckIn}
        />
      </>
    );
  }

  // Just checked in → show readiness reveal ceremony
  if (showReveal && justCheckedIn && system.readiness) {
    return (
      <ReadinessReveal
        dark={dark}
        readiness={system.readiness}
        onComplete={() => setShowReveal(false)}
      />
    );
  }

  return (
    <DailySystemScreen
      dark={dark}
      greeting={greeting}
      weather={weather}
      readiness={system.readiness}
      actions={system.actions}
      completions={system.completions}
      adherence={system.adherence}
      trend={system.trend}
      momentum={system.momentum}
      proteinConsumed={proteinConsumed}
      proteinTarget={proteinTarget}
      onToggle={system.toggleAction}
      onNavigate={(route) => navigate(route)}
    />
  );
}
