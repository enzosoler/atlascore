/**
 * WaterLog — quick water-intake tracker.
 * Ref: Apple Health water + WaterMinder.
 *
 * - Big circular progress ring (current vs target)
 * - Target defaults to 2000 ml (8 glasses), editable via a small button
 * - Quick-add grid: Glass (250), Cup (200), Bottle (500), Custom (input)
 * - Recent entries timeline (today only)
 * - Undo last entry
 * - Honest empty state when zero entries today
 *
 * Persists via `nutritionStore.addWater` — local for MVP until Supabase.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  WaterIcon,
  PlusIcon,
  UndoIcon,
  EditIcon,
} from '../lib/icons';
import { useAuth } from '@/lib/AuthContext';
import {
  getWaterForDate,
  addWater as storeAddWater,
  removeLastWater,
  getWaterTarget,
  setWaterTarget,
  subscribe,
} from './nutritionStore';

const PRESETS = [
  { id: 'glass',  label: 'Glass',  ml: 250 },
  { id: 'cup',    label: 'Cup',    ml: 200 },
  { id: 'bottle', label: 'Bottle', ml: 500 },
];

export default function WaterLog({
  entries = [],
  target = 2000,
  onAdd,
  onUndo,
  onEditTarget,
}) {
  const total = useMemo(() => entries.reduce((s, e) => s + (e.ml || 0), 0), [entries]);
  const [custom, setCustom] = useState('');
  const [showTargetEditor, setShowTargetEditor] = useState(false);
  const [draftTarget, setDraftTarget] = useState(target);

  const addCustom = () => {
    const n = parseInt(custom, 10);
    if (!n || n <= 0) {
      toast.error('Enter a valid amount in ml');
      return;
    }
    onAdd?.(n);
    setCustom('');
  };

  const saveTarget = () => {
    const n = parseInt(draftTarget, 10);
    if (!n || n <= 0) {
      toast.error('Enter a valid target in ml');
      return;
    }
    onEditTarget?.(n);
    setShowTargetEditor(false);
    toast.success('Target updated');
  };

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <SpringReveal delay={20}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Nutrition
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Water
            </h1>
          </div>
        </SpringReveal>

        {/* Progress ring */}
        <SpringReveal delay={60}>
          <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 24, textAlign: 'center' }}>
            <ProgressRing total={total} target={target} />
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              {!showTargetEditor ? (
                <button
                  type="button"
                  onClick={() => { setDraftTarget(target); setShowTargetEditor(true); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'hsl(var(--rd-fg-secondary))',
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <EditIcon size={12} />
                  Edit target
                </button>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftTarget}
                    onChange={(e) => setDraftTarget(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="2000"
                    style={{
                      width: 90, height: 32,
                      borderRadius: 9999,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(0,255,255,0.3)',
                      color: 'hsl(var(--rd-fg-primary))',
                      padding: '0 12px',
                      fontSize: 13, fontWeight: 600,
                      textAlign: 'center',
                      outline: 'none',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>ml</span>
                  <LiquidButton size="sm" intent="primary" onClick={saveTarget}>Save</LiquidButton>
                  <LiquidButton size="sm" intent="ghost" onClick={() => setShowTargetEditor(false)}>Cancel</LiquidButton>
                </div>
              )}
            </div>
          </Glass>
        </SpringReveal>

        {/* Quick-add */}
        <SpringReveal delay={120}>
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Quick add</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PRESETS.map((p) => (
                <QuickAddBtn key={p.id} label={p.label} note={`${p.ml} ml`} onClick={() => onAdd?.(p.ml)} />
              ))}
              <QuickAddBtn
                label="Custom"
                note="tap"
                onClick={() => document.getElementById('water-custom-input')?.focus()}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                id="water-custom-input"
                type="number"
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="Custom amount (ml)"
                style={{
                  flex: 1, height: 44,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'hsl(var(--rd-fg-primary))',
                  padding: '0 14px',
                  fontSize: 14, fontWeight: 500,
                  outline: 'none',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
              <LiquidButton intent="primary" onClick={addCustom} leftIcon={<PlusIcon size={14} />}>Add</LiquidButton>
            </div>
          </div>
        </SpringReveal>

        {/* Recent timeline */}
        <SpringReveal delay={180}>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <SectionLabel noMargin>Today</SectionLabel>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={onUndo}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'hsl(var(--rd-fg-secondary))',
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <UndoIcon size={12} />
                  Undo last
                </button>
              )}
            </div>
            {entries.length === 0 ? (
              <Glass radius="xl" style={{ padding: 24, textAlign: 'center' }}>
                <div
                  aria-hidden
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'rgba(0,255,255,0.08)',
                    color: 'hsl(var(--rd-accent))',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <WaterIcon size={20} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Nothing logged yet today</div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
                  Tap a preset above to log your first drink.
                </div>
              </Glass>
            ) : (
              <Glass radius="xl" style={{ padding: 4 }}>
                {entries.slice().reverse().map((e, i) => (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 28, height: 28, borderRadius: 9,
                          background: 'rgba(0,255,255,0.10)',
                          color: 'hsl(var(--rd-accent))',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <WaterIcon size={14} />
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(e.createdAt)}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {e.ml} <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>ml</span>
                    </div>
                  </div>
                ))}
              </Glass>
            )}
          </div>
        </SpringReveal>

      </div>
    </SafeScreen>
  );
}
export { WaterLog };

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function SectionLabel({ children, noMargin = false }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'hsl(var(--rd-fg-muted))',
        fontWeight: 700,
        marginBottom: noMargin ? 0 : 10,
      }}
    >
      {children}
    </div>
  );
}

function QuickAddBtn({ label, note, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '14px 4px',
        borderRadius: 14,
        background: 'rgba(0,255,255,0.06)',
        border: '1px solid rgba(0,255,255,0.18)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <span aria-hidden style={{ color: 'hsl(var(--rd-accent))' }}>
        <WaterIcon size={18} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.005em' }}>{label}</span>
      <span style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>{note}</span>
    </button>
  );
}

function ProgressRing({ total, target }) {
  const pct = target > 0 ? Math.min(1, total / target) : 0;
  const R = 58;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct);
  return (
    <div style={{ display: 'inline-flex', position: 'relative', width: 160, height: 160 }}>
      <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%' }} aria-hidden>
        <circle cx="70" cy="70" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={R}
          stroke="hsl(var(--rd-accent))"
          strokeWidth="10"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 70 70)"
          style={{
            filter: 'drop-shadow(0 0 8px hsl(var(--rd-accent) / .5))',
            transition: 'stroke-dashoffset 520ms cubic-bezier(.22,1,.36,1)',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {total}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
          of {target} ml
        </div>
      </div>
    </div>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function WaterLogRoute() {
  const { user } = useAuth();
  const today = new Date();
  const [entries, setEntries] = useState(() => getWaterForDate(user?.id, today));
  const [target, setTarget] = useState(() => getWaterTarget(user?.id));

  useEffect(() => {
    setEntries(getWaterForDate(user?.id, today));
    setTarget(getWaterTarget(user?.id));
    return subscribe((detail) => {
      if (detail?.kind === 'water' || detail?.kind === 'water-target') {
        setEntries(getWaterForDate(user?.id, today));
        setTarget(getWaterTarget(user?.id));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <WaterLog
      entries={entries}
      target={target}
      onAdd={(ml) => {
        storeAddWater(user?.id, new Date(), ml);
      }}
      onUndo={() => {
        const ok = removeLastWater(user?.id, new Date());
        if (ok) toast.success('Removed last entry');
      }}
      onEditTarget={(ml) => {
        setWaterTarget(user?.id, ml);
      }}
    />
  );
}
