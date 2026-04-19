import React, { useState } from 'react';
import { Card, CardBody, Badge, Button, ListRow, Input, SearchInput, ProgressBar, Sheet, Chip } from '../ui';
import { cn } from '../lib/cn';
import { fmtInt, fmtKcal, confidenceBand } from '../lib/formatters';

/** Nutrition — dense utility-first. MyFitnessPal structure, MacroFactor transparency. */

export function MealSection({ meal, onAdd, onEditItem }) {
  const empty = meal.items.length === 0;
  return (
    <section className="rounded-rd-card border border-rd-border bg-rd-surface overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="text-rd-h4 text-rd-fg">{meal.name}</p>
          <p className="text-[12px] text-rd-fg-muted rd-tnum">
            {meal.time} · {fmtKcal(meal.totals.kcal)} · {fmtInt(meal.totals.protein)}P · {fmtInt(meal.totals.carbs)}C · {fmtInt(meal.totals.fat)}F
          </p>
        </div>
        <Button intent="ghost" size="sm" onClick={() => onAdd?.(meal)}>+ Add food</Button>
      </header>
      <div className="border-t border-rd-border divide-y divide-rd-border">
        {empty ? (
          <button
            onClick={() => onAdd?.(meal)}
            className="block w-full px-4 py-4 text-left text-[13px] text-rd-fg-muted hover:bg-rd-surface-2"
          >
            Empty — tap to add a food.
          </button>
        ) : meal.items.map((f) => (
          <FoodRow key={f.id} food={f} onClick={() => onEditItem?.(f, meal)} />
        ))}
      </div>
    </section>
  );
}

/** Two-line food row — MFP canonical. Tight, editable, tap-to-adjust. */
export function FoodRow({ food, onClick, trailing }) {
  return (
    <ListRow
      onClick={onClick}
      title={food.name}
      subtitle={`${food.portion} · ${fmtInt(food.protein)}P · ${fmtInt(food.carbs)}C · ${fmtInt(food.fat)}F`}
      meta={`${fmtInt(food.kcal)} kcal`}
      trailing={trailing}
    />
  );
}

export function DailyTotalsBar({ macros }) {
  return (
    <div className="rounded-rd-card border border-rd-border bg-rd-surface p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Today</p>
          <p className="text-rd-metric-lg text-rd-fg rd-tnum">
            {fmtInt(macros.consumed.kcal)} <span className="text-[14px] text-rd-fg-muted font-normal">/ {fmtInt(macros.targets.kcal)} kcal</span>
          </p>
        </div>
        <Button size="sm" intent="secondary">Explain targets</Button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <MacroChip label="Protein" consumed={macros.consumed.protein} target={macros.targets.protein} tone="good" />
        <MacroChip label="Carbs"   consumed={macros.consumed.carbs}   target={macros.targets.carbs}   tone="premium" />
        <MacroChip label="Fat"     consumed={macros.consumed.fat}     target={macros.targets.fat}     tone="warning" />
      </div>
    </div>
  );
}
function MacroChip({ label, consumed, target, tone }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-rd-fg-muted">{label}</span>
        <span className="text-[12px] rd-tnum text-rd-fg-secondary">
          <span className="text-rd-fg">{fmtInt(consumed)}</span>/{fmtInt(target)}g
        </span>
      </div>
      <ProgressBar value={consumed} max={target} tone={tone} className="mt-1" />
    </div>
  );
}

/** Quick-add entry row. FAB-spawned from Today/Nutrition. */
export function QuickAddSheet({ open, onClose, onPickMode }) {
  const modes = [
    { id: 'search', label: 'Search food',  icon: '🔎', hint: 'Browse our database or custom foods.' },
    { id: 'barcode', label: 'Scan barcode', icon: '📊', hint: 'Point your camera at a barcode.' },
    { id: 'photo',  label: 'Snap a meal',   icon: '📷', hint: 'AI will estimate what you ate.' },
    { id: 'recent', label: 'Recent foods',  icon: '↩︎', hint: 'Log something you logged before.' },
    { id: 'recipe', label: 'From recipe',   icon: '🥗', hint: 'Add from your recipe library.' },
    { id: 'text',   label: 'Describe meal', icon: '✎', hint: 'Type what you had in plain words.' },
  ];
  return (
    <Sheet open={open} onClose={onClose} side="bottom" size="md" title="Add food">
      <ul className="grid grid-cols-2 gap-2">
        {modes.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => onPickMode?.(m.id)}
              className="flex h-full w-full flex-col items-start gap-2 rounded-rd-card border border-rd-border bg-rd-surface-2 p-3 text-left transition-colors hover:border-rd-border-strong"
            >
              <span className="text-xl">{m.icon}</span>
              <span className="text-[14px] font-medium text-rd-fg">{m.label}</span>
              <span className="text-[12px] text-rd-fg-muted">{m.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/** Food search — dense list with recents and database. */
export function FoodSearchPanel({ query, onQueryChange, recents, results, onPick }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-rd-border p-4">
        <SearchInput value={query} onChange={(e) => onQueryChange?.(e.target.value)} placeholder="Search foods, brands, recipes…" />
        <div className="mt-3 flex gap-2 overflow-x-auto rd-scroll-hide">
          {['All','Recents','My foods','Recipes','Verified'].map((t, i) => <Chip key={t} active={i === 0}>{t}</Chip>)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-rd-border">
        {results.length === 0 && recents.length > 0 && (
          <>
            <p className="px-4 py-3 text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Recent</p>
            {recents.map((f) => <FoodRow key={f.id} food={f} onClick={() => onPick?.(f)} />)}
          </>
        )}
        {results.map((f) => (
          <FoodRow key={f.id} food={f} onClick={() => onPick?.(f)} />
        ))}
      </div>
    </div>
  );
}

/** AI photo-scan confirmation — Cal AI pattern. Confidence + per-item edit. */
export function PhotoScanConfirm({ image, items, overallConfidence, onConfirm, onEditItem, onRetake }) {
  const band = confidenceBand(overallConfidence);
  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface-2">
        {image ? <img src={image} alt="meal" className="h-full w-full object-cover" /> : null}
        <div className="absolute left-3 top-3">
          <Badge tone={band.tone === 'success' ? 'success' : band.tone === 'warning' ? 'warning' : 'accent'}>
            {band.label}
          </Badge>
        </div>
      </div>

      <Card tone={band.tone === 'warning' ? 'warning' : undefined}>
        <CardBody>
          <p className="text-rd-h4 text-rd-fg">We detected {items.length} items</p>
          <p className="mt-1 text-[13px] text-rd-fg-muted">
            Tap any row to adjust quantity, swap food, or remove. We'll learn from your edits.
          </p>
        </CardBody>
      </Card>

      <ul className="divide-y divide-rd-border rounded-rd-card border border-rd-border bg-rd-surface">
        {items.map((it) => (
          <li key={it.id}>
            <ListRow
              onClick={() => onEditItem?.(it)}
              title={it.name}
              subtitle={`${it.portion} · ${fmtInt(it.kcal)} kcal`}
              meta={`${Math.round((it.confidence ?? 0.7) * 100)}%`}
              trailing={<span className="text-rd-fg-muted" aria-hidden>›</span>}
            />
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-2">
        <Button intent="secondary" size="lg" onClick={onRetake}>Retake</Button>
        <Button intent="primary"   size="lg" onClick={onConfirm}>Save meal</Button>
      </div>
    </div>
  );
}

/** Macro targets explanation — MacroFactor transparency. */
export function MacroTargetsExplainer({ bmr, tdee, goalDelta, proteinRule, result }) {
  const steps = [
    { label: 'Baseline (BMR)',     value: `${fmtInt(bmr)} kcal`, hint: 'Mifflin-St Jeor from your body stats.' },
    { label: 'Activity multiplier', value: `×${1.55}`,           hint: 'Based on weekly training volume + daily steps.' },
    { label: 'Maintenance (TDEE)', value: `${fmtInt(tdee)} kcal`, hint: 'Estimated total daily energy expenditure.' },
    { label: 'Goal adjustment',    value: `${goalDelta >= 0 ? '+' : ''}${goalDelta} kcal`, hint: 'Cutting ~0.5% BW/week.' },
    { label: 'Protein target',     value: proteinRule,          hint: '1.8 g/kg lean mass. Prioritized first.' },
    { label: 'Daily target',       value: `${fmtInt(result)} kcal`, hint: 'Adjusted weekly based on actual weight trend.' },
  ];
  return (
    <Card>
      <CardBody className="space-y-3">
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">How we calculated this</p>
        {steps.map((s) => (
          <div key={s.label} className="rounded-rd-md border border-rd-border bg-rd-surface-2 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-rd-fg-secondary">{s.label}</span>
              <span className="text-[14px] font-semibold text-rd-fg rd-tnum">{s.value}</span>
            </div>
            <p className="mt-1 text-[12px] text-rd-fg-muted">{s.hint}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
