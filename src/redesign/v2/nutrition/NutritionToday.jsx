/**
 * NutritionToday — daily food diary.
 * Ref: MyFitnessPal (diary view) + Cal AI (macros hero) + Yazio (meal cards)
 *
 * Layout:
 *  - Macros hero: big calorie remaining + 3 macro rings (protein/carbs/fat)
 *  - Date selector strip (today ± 3 days)
 *  - 4 meal buckets (breakfast / lunch / dinner / snacks) as Glass cards
 *  - Each meal row: name, portion, kcal — tap to edit
 *  - Empty meal shows a "+ Add" inline CTA
 *  - Sticky bottom actions: Photo, Barcode, Search, Voice
 */
import React, { useState, useMemo } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { BreakfastIcon, LunchIcon, DinnerIcon, SnackIcon, SparkleIcon } from '../lib/icons';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', Icon: BreakfastIcon, tint: 'rgba(251,191,36,0.14)', color: '#FBBF24' },
  { id: 'lunch',     label: 'Lunch',     Icon: LunchIcon,     tint: 'rgba(52,211,153,0.14)', color: '#34D399' },
  { id: 'dinner',    label: 'Dinner',    Icon: DinnerIcon,    tint: 'rgba(167,139,250,0.14)', color: '#A78BFA' },
  { id: 'snacks',    label: 'Snacks',    Icon: SnackIcon,     tint: 'rgba(0,255,255,0.10)',   color: 'hsl(var(--rd-accent))' },
];

export default function NutritionToday({
  date = new Date(),
  targets = { calories: 2200, protein: 165, carbs: 220, fat: 73 },
  entries = { breakfast: [], lunch: [], dinner: [], snacks: [] },
  onPickDate,
  onAddFood,        // (mealId) => void
  onEditEntry,      // (mealId, entryId) => void
  onPhotoScan,
  onBarcodeScan,
  onSearch,
  onVoice,
}) {
  const [activeDate, setActiveDate] = useState(date);

  const totals = useMemo(() => {
    const acc = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    Object.values(entries).forEach((arr) => {
      (arr || []).forEach((e) => {
        acc.calories += e.calories || 0;
        acc.protein  += e.protein  || 0;
        acc.carbs    += e.carbs    || 0;
        acc.fat      += e.fat      || 0;
      });
    });
    return acc;
  }, [entries]);

  const remaining = Math.max(0, targets.calories - totals.calories);

  return (
    <SafeScreen hasTopBar hasBottomNav hasFab paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Date strip — tight gap to macros below */}
      <DateStrip
        value={activeDate}
        onChange={(d) => { setActiveDate(d); onPickDate?.(d); }}
      />

      {/* AI-first tagline — signals that this is an AI-powered food feature */}
      <button
        type="button"
        onClick={onPhotoScan}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(139,92,246,0.14) 0%, rgba(0,255,255,0.06) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          color: 'hsl(var(--rd-fg-primary))',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          backdropFilter: 'blur(14px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
          marginBottom: 12,
          textAlign: 'left',
        }}
      >
        <span aria-hidden style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(139,92,246,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#A78BFA' }}>
          <SparkleIcon size={14} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI log
          </div>
          <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', marginTop: 1, lineHeight: 1.3 }}>
            Snap a photo, speak, or describe — we estimate macros.
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: '#A78BFA' }}>
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Macros hero */}
      <SpringReveal delay={40}>
        <MacrosHero targets={targets} totals={totals} remaining={remaining} />
      </SpringReveal>

      {/* Meals */}
      <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
        {MEALS.map((m, i) => (
          <SpringReveal key={m.id} delay={100 + i * 40}>
            <MealCard
              meal={m}
              entries={entries[m.id] || []}
              onAdd={() => onAddFood?.(m.id)}
              onEdit={(entryId) => onEditEntry?.(m.id, entryId)}
            />
          </SpringReveal>
        ))}
      </div>

      {/* Water & notes — placeholder for future */}
      <SpringReveal delay={340}>
        <Glass radius="xl" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Water
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                0 <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>/ 2.5 L</span>
              </div>
            </div>
            <LiquidButton intent="neutral" size="sm">+ 250 ml</LiquidButton>
          </div>
        </Glass>
      </SpringReveal>

      </div>{/* /maxWidth wrapper */}

      {/* Sticky bottom action bar (above bottom nav) */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'calc(64px + env(safe-area-inset-bottom))',
          zIndex: 45,
          backgroundColor: 'rgba(5,7,10,0.80)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            padding: '10px max(12px, env(safe-area-inset-left))',
            maxWidth: 640,
            margin: '0 auto',
          }}
        >
          <QuickAction icon={<IconCamera />} label="Photo" onClick={onPhotoScan} />
          <QuickAction icon={<IconBarcode />} label="Barcode" onClick={onBarcodeScan} />
          <QuickAction icon={<IconSearch />} label="Search" onClick={onSearch} />
          <QuickAction icon={<IconMic />} label="Voice" onClick={onVoice} />
        </div>
      </div>
    </SafeScreen>
  );
}
export { NutritionToday };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function DateStrip({ value, onChange }) {
  const days = useMemo(() => {
    const arr = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(value);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [value.toDateString()]);

  const today = new Date();
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, padding: '2px 0' }}>
        {days.map((d, idx) => {
          const isActive = d.toDateString() === value.toDateString();
          const isToday = d.toDateString() === today.toDateString();
          return (
            <button
              key={idx}
              onClick={() => onChange(d)}
              style={{
                width: '100%',
                height: 64,
                borderRadius: 16,
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: isActive
                  ? 'linear-gradient(180deg, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.08) 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: isActive ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.06)',
                color: isActive ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                boxShadow: isActive ? '0 4px 14px -4px rgba(0,255,255,0.3)' : 'none',
                transition: 'background 220ms, border-color 220ms',
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: '0.1em', color: isActive ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
                {d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                {d.getDate()}
              </span>
              {isToday && !isActive && (
                <span style={{ width: 4, height: 4, borderRadius: 99, background: 'hsl(var(--rd-accent))' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MacrosHero({ targets, totals, remaining }) {
  return (
    <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <CalorieRing remaining={remaining} target={targets.calories} eaten={totals.calories} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Remaining
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                color: 'hsl(var(--rd-fg-primary))',
              }}
            >
              {remaining}
            </span>
            <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>kcal</span>
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-secondary))', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {totals.calories} eaten · {targets.calories} goal
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
        <MacroBar label="Protein" eaten={totals.protein} target={targets.protein} color="hsl(var(--rd-accent))" />
        <MacroBar label="Carbs"   eaten={totals.carbs}   target={targets.carbs}   color="#FBBF24" />
        <MacroBar label="Fat"     eaten={totals.fat}     target={targets.fat}     color="#A78BFA" />
      </div>
    </Glass>
  );
}

function CalorieRing({ remaining, target, eaten }) {
  const pct = target > 0 ? Math.min(1, eaten / target) : 0;
  const offset = 314 * (1 - pct);
  return (
    <div style={{ width: 96, height: 96, flexShrink: 0, position: 'relative' }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }} aria-hidden>
        <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="hsl(var(--rd-accent))"
          strokeWidth="10"
          strokeDasharray="314"
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 60 60)"
          style={{ filter: 'drop-shadow(0 0 8px hsl(var(--rd-accent) / .5))', transition: 'stroke-dashoffset 520ms cubic-bezier(.22,1,.36,1)' }}
        />
        <text x="60" y="58" textAnchor="middle" fontSize="22" fontWeight="700" fill="hsl(var(--rd-fg-primary))" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {Math.round(pct * 100)}%
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="9" fill="hsl(var(--rd-fg-muted))" style={{ letterSpacing: '0.14em' }}>
          EATEN
        </text>
      </svg>
    </div>
  );
}

function MacroBar({ label, eaten, target, color }) {
  const pct = target > 0 ? Math.min(1, eaten / target) : 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-secondary))' }}>
          {Math.round(eaten)}<span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 400 }}>/{target}g</span>
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: color,
            borderRadius: 4,
            boxShadow: `0 0 8px ${color.replace('hsl(', 'hsla(').replace(')', ', .45)')}`,
            transition: 'width 420ms cubic-bezier(.22,1,.36,1)',
          }}
        />
      </div>
    </div>
  );
}

function MealCard({ meal, entries, onAdd, onEdit }) {
  const kcalSum = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const Icon = meal.Icon;
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: entries.length ? 10 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: meal.tint,
              color: meal.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon size={16} />
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }}>
              {meal.label}
            </div>
            <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
              {entries.length === 0 ? 'Nothing logged' : `${Math.round(kcalSum)} kcal · ${entries.length} ${entries.length === 1 ? 'item' : 'items'}`}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add to ${meal.label}`}
          style={{
            width: 36, height: 36, borderRadius: 9999,
            background: 'rgba(0,255,255,0.12)',
            border: '1px solid rgba(0,255,255,0.3)',
            color: 'hsl(var(--rd-accent))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {entries.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onEdit(e.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">{e.name}</div>
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 1 }} className="truncate">
              {e.portion || '—'}
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(e.calories || 0)} kcal
          </span>
        </button>
      ))}
    </Glass>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '8px 4px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <span style={{ color: 'hsl(var(--rd-accent))' }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
    </button>
  );
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="3" y="6" width="18" height="14" rx="2.5" />
      <circle {...stroke} cx="12" cy="13" r="3.5" />
      <path {...stroke} d="M8 6l1.5-2h5L16 6" />
    </svg>
  );
}
function IconBarcode() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M19 6v12" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle {...stroke} cx="11" cy="11" r="7" />
      <path {...stroke} d="M20 20l-4-4" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="9" y="3" width="6" height="12" rx="3" />
      <path {...stroke} d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
