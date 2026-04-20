/**
 * FoodDiary — full history view of logged meals.
 * Ref: MyFitnessPal diary + Cronometer history.
 *
 * - Date navigator (left/right arrows + tappable native date picker)
 * - "Today" / "Yesterday" shortcut chips
 * - Grouped by meal (Breakfast / Lunch / Dinner / Snacks)
 * - Each food row: name, portion, kcal — tap to open MealDetail
 * - Total kcal + macros strip at the bottom (grams + percentage)
 * - Honest empty state when nothing is logged that day
 *
 * Data source: local nutritionStore (Supabase not yet wired).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  BreakfastIcon,
  LunchIcon,
  DinnerIcon,
  SnackIcon,
  UtensilsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '../lib/icons';
import { useAuth } from '@/lib/AuthContext';
import { getEntriesForDate, subscribe } from './nutritionStore';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', Icon: BreakfastIcon, tint: 'rgba(251,191,36,0.14)',  color: '#FBBF24' },
  { id: 'lunch',     label: 'Lunch',     Icon: LunchIcon,     tint: 'rgba(52,211,153,0.14)',  color: '#34D399' },
  { id: 'dinner',    label: 'Dinner',    Icon: DinnerIcon,    tint: 'rgba(167,139,250,0.14)', color: '#A78BFA' },
  { id: 'snacks',    label: 'Snacks',    Icon: SnackIcon,     tint: 'rgba(0,255,255,0.10)',   color: 'hsl(var(--rd-accent))' },
];

/* ─── Date utilities ────────────────────────────────────────────────────── */

function toISO(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function fromISO(iso) {
  // Local-date parsing — avoid UTC slips that a raw `new Date(iso)` would cause.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function formatLong(d) {
  const today = new Date();
  const yesterday = addDays(today, -1);
  if (isSameDay(d, today))     return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function FoodDiary({
  date: initialDate,
  entries,
  onPickDate,
  onOpenEntry,
  onGoToToday,
  onLogFirstMeal,
}) {
  const [date, setDate] = useState(initialDate || new Date());

  const pick = (d) => {
    setDate(d);
    onPickDate?.(d);
  };

  // Flatten entries for totals and empty-state.
  const flat = useMemo(() => {
    const out = [];
    for (const m of MEALS) {
      (entries?.[m.id] || []).forEach((e) => out.push({ ...e, mealId: m.id }));
    }
    return out;
  }, [entries]);

  const totals = useMemo(() => {
    const acc = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    flat.forEach((e) => {
      acc.calories += e.calories || 0;
      acc.protein  += e.protein  || 0;
      acc.carbs    += e.carbs    || 0;
      acc.fat      += e.fat      || 0;
    });
    return acc;
  }, [flat]);

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Heading */}
        <SpringReveal delay={20}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Food diary
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              {formatLong(date)}
            </h1>
          </div>
        </SpringReveal>

        {/* Date navigator */}
        <SpringReveal delay={60}>
          <DateNavigator date={date} onChange={pick} />
        </SpringReveal>

        {/* Today / Yesterday chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Chip active={isSameDay(date, new Date())} onClick={() => pick(new Date())}>Today</Chip>
          <Chip active={isSameDay(date, addDays(new Date(), -1))} onClick={() => pick(addDays(new Date(), -1))}>Yesterday</Chip>
        </div>

        {/* Meal groups or empty state */}
        {flat.length === 0 ? (
          <EmptyState onLogFirstMeal={onLogFirstMeal || onGoToToday} />
        ) : (
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {MEALS.map((m, i) => (
              <SpringReveal key={m.id} delay={120 + i * 40}>
                <MealGroup
                  meal={m}
                  items={entries?.[m.id] || []}
                  onOpen={(id) => onOpenEntry?.(id)}
                />
              </SpringReveal>
            ))}
          </div>
        )}

        {/* Totals strip — only when there's something logged */}
        {flat.length > 0 && (
          <SpringReveal delay={320}>
            <TotalsStrip totals={totals} />
          </SpringReveal>
        )}

      </div>
    </SafeScreen>
  );
}
export { FoodDiary };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function DateNavigator({ date, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 6,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <IconBtn label="Previous day" onClick={() => onChange(addDays(date, -1))}>
        <ChevronLeftIcon size={18} />
      </IconBtn>

      <label
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: 40,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          color: 'hsl(var(--rd-fg-primary))',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <CalendarIcon size={16} />
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {/* Native date picker overlays the label — works on iOS + Android web. */}
        <input
          type="date"
          value={toISO(date)}
          onChange={(e) => {
            if (e.target.value) onChange(fromISO(e.target.value));
          }}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
          }}
          aria-label="Pick a date"
        />
      </label>

      <IconBtn label="Next day" onClick={() => onChange(addDays(date, 1))}>
        <ChevronRightIcon size={18} />
      </IconBtn>
    </div>
  );
}

function IconBtn({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 40, height: 40, flexShrink: 0,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 32,
        paddingInline: 14,
        borderRadius: 9999,
        background: active ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
        color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function MealGroup({ meal, items, onOpen }) {
  const Icon = meal.Icon;
  const kcal = items.reduce((s, e) => s + (e.calories || 0), 0);
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: items.length ? 10 : 0 }}>
        <span
          aria-hidden
          style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: meal.tint, color: meal.color,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{meal.label}</div>
          <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
            {items.length === 0
              ? 'Nothing logged'
              : `${Math.round(kcal)} kcal · ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          </div>
        </div>
      </div>

      {items.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onOpen?.(e.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '10px 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'hsl(var(--rd-fg-primary))',
            WebkitTapHighlightColor: 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">{e.name || 'Food'}</div>
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 1 }} className="truncate">
              {e.portion || '—'}
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {Math.round(e.calories || 0)} kcal
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </Glass>
  );
}

function TotalsStrip({ totals }) {
  const protein = Math.round(totals.protein || 0);
  const carbs = Math.round(totals.carbs || 0);
  const fat = Math.round(totals.fat || 0);

  // Kcal contribution per macro — used for the percentage split.
  const pKcal = protein * 4;
  const cKcal = carbs * 4;
  const fKcal = fat * 9;
  const totalKcal = Math.max(1, pKcal + cKcal + fKcal);
  const pct = {
    p: Math.round((pKcal / totalKcal) * 100),
    c: Math.round((cKcal / totalKcal) * 100),
    f: Math.round((fKcal / totalKcal) * 100),
  };

  return (
    <Glass tint="accent" radius="xl" elevation="md" style={{ padding: 18, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Daily total
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(totals.calories)} <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>kcal</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <MacroPill label="Protein" grams={protein} pct={pct.p} color="hsl(var(--rd-accent))" />
        <MacroPill label="Carbs"   grams={carbs}   pct={pct.c} color="#FBBF24" />
        <MacroPill label="Fat"     grams={fat}     pct={pct.f} color="#A78BFA" />
      </div>
    </Glass>
  );
}

function MacroPill({ label, grams, pct, color }) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color }}>{grams}</span>
        <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>g</span>
      </div>
      <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {pct}%
      </div>
    </div>
  );
}

function EmptyState({ onLogFirstMeal }) {
  return (
    <Glass radius="xl" style={{ padding: 28, marginTop: 16, textAlign: 'center' }}>
      <div
        aria-hidden
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.04)',
          color: 'hsl(var(--rd-fg-muted))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <UtensilsIcon size={24} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>Nothing logged for this day</div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.45 }}>
        Start logging to hit your daily targets.
      </div>
      <div
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 10,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color: 'hsl(var(--rd-accent))',
          marginTop: 8,
        }}
      >
        Logging meals drives your protein target
      </div>
      <div style={{ marginTop: 14 }}>
        <LiquidButton intent="primary" onClick={onLogFirstMeal}>
          Log your first meal
        </LiquidButton>
      </div>
    </Glass>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function FoodDiaryRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState(() => getEntriesForDate(user?.id, date));

  useEffect(() => {
    setEntries(getEntriesForDate(user?.id, date));
    return subscribe(() => setEntries(getEntriesForDate(user?.id, date)));
  }, [user?.id, date]);

  return (
    <FoodDiary
      date={date}
      entries={entries}
      onPickDate={setDate}
      onOpenEntry={(id) => navigate(`/app/nutrition/meal/${id}`)}
      onGoToToday={() => navigate('/app/nutrition')}
      onLogFirstMeal={() => navigate('/app/nutrition/search')}
    />
  );
}
