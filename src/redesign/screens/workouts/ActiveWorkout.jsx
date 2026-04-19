import React, { useState } from 'react';
import { FullScreenShell } from '../../layouts';
import { Button, IconButton, Badge } from '../../ui';
import {
  ActiveExerciseHeader, SetLogger, SupersetHeader,
  RestTimer, PlateCalculator, useRestTimer,
} from '../../modules';
import { mockActiveWorkout } from '../../lib/mock-data';
import { fmtDuration } from '../../lib/formatters';

export default function ActiveWorkout() {
  const [wo, setWo] = useState(mockActiveWorkout);
  const timer = useRestTimer(90);
  const [elapsed, setElapsed] = useState(1822);

  const updateSet = (blockIdx, exIdx, n, patch) => {
    const next = JSON.parse(JSON.stringify(wo));
    const ex = next.blocks[blockIdx].exercises[exIdx];
    ex.sets = ex.sets.map((s) => (s.n === n ? { ...s, ...patch } : s));
    setWo(next);
  };
  const completeSet = (blockIdx, exIdx, n) => {
    updateSet(blockIdx, exIdx, n, { done: true });
    timer.start();
  };

  return (
    <FullScreenShell
      topChrome={
        <header className="sticky top-0 z-[50] flex items-center justify-between border-b border-rd-border bg-rd-bg/90 px-4 h-rd-top-bar backdrop-blur rd-safe-top">
          <div className="flex items-center gap-2">
            <IconButton label="Back" size="sm">←</IconButton>
            <div>
              <p className="text-[12px] text-rd-fg-muted">In progress</p>
              <p className="text-rd-h4 text-rd-fg truncate">{wo.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="accent">{fmtDuration(elapsed)}</Badge>
            <Button intent="secondary" size="sm">Finish</Button>
          </div>
        </header>
      }
    >
      <div className="mx-auto max-w-[720px] px-4 py-4 pb-28">
        {timer.running && (
          <div className="mb-4">
            <RestTimer
              seconds={timer.seconds}
              remaining={timer.remaining}
              onStop={timer.stop}
              onAdjust={timer.adjust}
            />
          </div>
        )}

        {wo.blocks.map((block, bi) => (
          <section key={block.id} className="mb-6">
            {block.kind === 'superset' && <SupersetHeader letters={block.exercises.map((_, i) => String.fromCharCode(65 + i))} />}
            {block.exercises.map((ex, ei) => (
              <article key={ex.id} className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface mb-3">
                <ActiveExerciseHeader
                  name={ex.name}
                  target={ex.target}
                  lastResult={ex.id === 'ex_bench' ? '92.5 kg × 5' : '—'}
                  onSwap={() => {}}
                />
                <div className="px-4 pb-4">
                  {ex.sets.length > 0 && <PlateCalculator total={Math.max(...ex.sets.map((s) => s.kg || 0))} />}
                </div>
                <SetLogger
                  sets={ex.sets.length ? ex.sets : Array.from({ length: ex.target.sets }, (_, i) => ({ n: i + 1, kg: null, reps: null, rpe: null, done: false }))}
                  onEdit={(n, patch) => updateSet(bi, ei, n, patch)}
                  onCompleteSet={(n) => completeSet(bi, ei, n)}
                  onAddSet={() => {}}
                />
              </article>
            ))}
          </section>
        ))}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-[40] border-t border-rd-border bg-rd-bg/90 p-3 backdrop-blur rd-safe-bottom">
        <div className="mx-auto flex max-w-[720px] gap-2">
          <Button intent="secondary" size="lg" block>Pause</Button>
          <Button intent="primary"   size="lg" block>Finish workout</Button>
        </div>
      </div>
    </FullScreenShell>
  );
}
