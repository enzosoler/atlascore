import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACBtn,
} from '../lib/paper.jsx';

const MOCK_CURRENT = {
  name: 'Back Squat',
  exerciseNum: 4,
  lastRecord: '215×5',
  sets: [
    { n: 1, w: 215, r: 5, rpe: 7,   done: true },
    { n: 2, w: 215, r: 5, rpe: 8,   done: true },
    { n: 3, w: 225, r: 5, rpe: 8.5, done: true },
    { n: 4, w: 225, r: 5, rpe: null, done: false, active: true },
    { n: 5, w: 225, r: 5, rpe: null, done: false },
    { n: 6, w: 230, r: 4, rpe: null, done: false },
  ],
};

const MOCK_QUEUE = [
  { n: '05', t: 'Romanian deadlift',     sx: '4 × 8 · 185 lb' },
  { n: '06', t: 'Bulgarian split squat', sx: '3 × 10 · 45 lb' },
  { n: '07', t: 'Leg curl',              sx: '4 × 12' },
  { n: '08', t: 'Standing calf raise',   sx: '5 × 15' },
];

/**
 * S3_Workout_A — active workout session.
 *
 * Gallery:    <S3_Workout_A dark />
 * Production: <S3_Workout_A dark sessionName="Heavy Lower" elapsed="24:18"
 *               currentExercise={{...}} queue={[...]} progress={{done:3,total:8}}
 *               onLogSet={fn} onFinish={fn} onDiscard={fn} />
 *
 * onLogSet receives: { exerciseId, setIndex, weight, reps, rpe }
 * onFinish: () => void
 * onDiscard: () => void
 */
function S3_Workout_A({
  dark = false,
  sessionName = 'Heavy Lower',
  sessionNumber = 24,
  elapsed = '24:18',
  currentExercise,
  queue,
  progress,
  onLogSet,
  onFinish,
  onDiscard,
}) {
  const c = useACT(dark);
  const ex = currentExercise || MOCK_CURRENT;
  const q = queue || MOCK_QUEUE;
  const prog = progress || { done: 3, total: 8 };
  const activeSet = ex.sets.find((s) => s.active) || ex.sets.find((s) => !s.done);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Session {sessionNumber}</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: c.fg, marginTop: 2 }}>
            {sessionName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <ACLabel size={11} color={c.dim}>Elapsed</ACLabel>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 18, fontWeight: 600, color: c.accent, marginTop: 2 }}>
            {elapsed}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 22px' }}>
        <div style={{ display: 'flex', height: 6, gap: 3, borderRadius: 3, overflow: 'hidden' }}>
          {Array.from({ length: prog.total }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              background: i < prog.done ? c.accent : (i === prog.done ? c.fg : c.faint),
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 22px 20px' }}>
        {/* Current exercise card — inverted */}
        <div style={{ padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card, marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Now · Exercise {ex.exerciseNum}</ACLabel>
            {ex.lastRecord && <ACLabel size={11} color={dark ? 'rgba(239,233,218,0.5)' : 'rgba(10,10,10,0.45)'}>Last: {ex.lastRecord}</ACLabel>}
          </div>
          <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginTop: 8 }}>
            {ex.name}
          </div>
          <div style={{ marginTop: 14, borderTop: `1px solid ${dark ? 'rgba(239,233,218,0.12)' : 'rgba(10,10,10,0.1)'}` }}>
            {ex.sets.map((s) => (
              <div key={s.n} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                alignItems: 'center', padding: '10px 8px',
                borderBottom: `1px solid ${dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)'}`,
                opacity: s.done ? 0.55 : 1,
                background: s.active ? (dark ? 'rgba(232,181,0,0.14)' : 'rgba(232,181,0,0.12)') : 'transparent',
                borderRadius: s.active ? 10 : 0,
                margin: s.active ? '2px -8px' : 0,
              }}>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: s.active ? c.accent : (dark ? 'rgba(239,233,218,0.55)' : 'rgba(10,10,10,0.45)'), fontWeight: 600 }}>{String(s.n).padStart(2,'0')}</span>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 600 }}>{s.w} <span style={{ opacity: 0.5, fontSize: 11 }}>lb</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 600 }}>{s.r} <span style={{ opacity: 0.5, fontSize: 11 }}>rep</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 12, color: s.rpe ? c.accent : (dark ? 'rgba(239,233,218,0.3)' : 'rgba(10,10,10,0.2)'), fontWeight: 600 }}>
                  {s.rpe ? `@${s.rpe}` : '—'}
                </div>
                <div style={{ width: 18, height: 18, borderRadius: 6, background: s.done ? c.accent : 'transparent', border: s.done ? 'none' : `1.5px solid ${dark ? 'rgba(239,233,218,0.3)' : 'rgba(10,10,10,0.2)'}`, justifySelf: 'end' }} />
              </div>
            ))}
          </div>
          {activeSet && (
            <ACBtn
              primary dark={dark} size="lg" block
              style={{ marginTop: 14, borderRadius: ACRadii.button }}
              onClick={() => onLogSet?.({
                exerciseName: ex.name,
                setIndex: activeSet.n,
                weight: activeSet.w,
                reps: activeSet.r,
                rpe: activeSet.rpe,
              })}
            >
              Log set · {activeSet.w} × {activeSet.r}
            </ACBtn>
          )}
        </div>

        {/* Queue */}
        {q.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <ACLabel size={12} color={c.dim}>Queue · {q.length} more</ACLabel>
            </div>
            {q.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <ACLabel size={12} color={c.mute} style={{ fontFamily: ACFonts.mono }}>{e.n}</ACLabel>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: c.fg }}>{e.t}</div>
                  <ACLabel size={12} color={c.dim}>{e.sx}</ACLabel>
                </div>
                <div style={{ width: 14, height: 14, borderRadius: 5, background: c.faint }} />
              </div>
            ))}
          </div>
        )}

        {/* Finish / Discard */}
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <ACBtn dark={dark} size="lg" pill block onClick={onDiscard}>Discard</ACBtn>
          </div>
          <div style={{ flex: 1.2 }}>
            <ACBtn primary dark={dark} size="lg" pill block onClick={onFinish}>Finish workout</ACBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S3_Workout_A;
