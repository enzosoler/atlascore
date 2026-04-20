/**
 * MealDetail — expanded view of a single logged food entry.
 *
 * - Reads `:id` from the router, finds the entry in nutritionStore
 * - Hero: name, portion, time logged, total kcal
 * - Macros grid (grams + kcal contribution)
 * - Micros section — honest empty state when the store has no data
 * - Actions: Edit serving size, Duplicate to now, Delete (with confirmation)
 *
 * Back returns to FoodDiary.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  UtensilsIcon,
  EditIcon,
  CopyIcon,
  TrashIcon,
  ChevronLeftIcon,
} from '../lib/icons';
import { useAuth } from '@/lib/AuthContext';
import {
  findEntryById,
  updateEntryById,
  removeEntryById,
  addEntry,
  subscribe,
} from './nutritionStore';

export default function MealDetail({
  entry,
  mealId,
  date,
  onBack,
  onEditPortion,
  onDuplicate,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry?.portion || '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset draft if the entry changes.
  useEffect(() => {
    setDraft(entry?.portion || '');
  }, [entry?.id]);

  if (!entry) {
    return (
      <SafeScreen paddingX={20}>
        <BackButton onClick={onBack} />
        <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 80px)' }}>
          <Glass radius="xl" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Entry not found</div>
            <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 6, lineHeight: 1.45 }}>
              It may have been deleted. Head back to your diary to pick another.
            </div>
            <div style={{ marginTop: 14 }}>
              <LiquidButton intent="primary" onClick={onBack}>Back to diary</LiquidButton>
            </div>
          </Glass>
        </div>
      </SafeScreen>
    );
  }

  const kcal = Math.round(entry.calories || 0);
  const p = Number(entry.protein || 0);
  const c = Number(entry.carbs || 0);
  const f = Number(entry.fat || 0);
  const pKcal = Math.round(p * 4);
  const cKcal = Math.round(c * 4);
  const fKcal = Math.round(f * 9);

  const hasMicros = Boolean(entry.micros && Object.keys(entry.micros).length > 0);
  const time = entry.createdAt
    ? new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null;

  const savePortion = () => {
    if (!draft.trim()) {
      toast.error('Enter a portion');
      return;
    }
    onEditPortion?.(draft.trim());
    setEditing(false);
    toast.success('Serving updated');
  };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>

        {/* Name + meta */}
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            {mealLabel(mealId)}{time ? ` · ${time}` : ''}
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {entry.name || 'Food'}
          </h1>
          <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UtensilsIcon size={14} />
            <span>{entry.portion || '—'}</span>
          </div>
        </SpringReveal>

        {/* Hero kcal */}
        <SpringReveal delay={60}>
          <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 20, marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Total
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{kcal}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'hsl(var(--rd-fg-muted))' }}>kcal</span>
            </div>
          </Glass>
        </SpringReveal>

        {/* Macros grid */}
        <SpringReveal delay={100}>
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Macros</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <MacroCard label="Protein" grams={p} kcal={pKcal} color="hsl(var(--rd-accent))" />
              <MacroCard label="Carbs"   grams={c} kcal={cKcal} color="#FBBF24" />
              <MacroCard label="Fat"     grams={f} kcal={fKcal} color="#A78BFA" />
            </div>
          </div>
        </SpringReveal>

        {/* Micros */}
        <SpringReveal delay={140}>
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Micronutrients</SectionLabel>
            {hasMicros ? (
              <Glass radius="xl" style={{ padding: 4 }}>
                {Object.entries(entry.micros).map(([k, v], i) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{String(v)}</span>
                  </div>
                ))}
              </Glass>
            ) : (
              <Glass radius="xl" style={{ padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>No micronutrient data for this food</div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.45 }}>
                  Vitamins and minerals will appear here once the nutrition service is wired.
                </div>
              </Glass>
            )}
          </div>
        </SpringReveal>

        {/* Actions */}
        <SpringReveal delay={180}>
          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            {/* Edit serving */}
            {!editing ? (
              <ActionRow
                icon={<EditIcon size={16} />}
                label="Edit serving size"
                onClick={() => setEditing(true)}
              />
            ) : (
              <Glass radius="lg" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Edit serving
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="e.g. 150 g or 1 cup"
                    style={{
                      flex: 1, height: 44, borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(0,255,255,0.3)',
                      color: 'hsl(var(--rd-fg-primary))',
                      padding: '0 14px',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <LiquidButton intent="primary" onClick={savePortion}>Save</LiquidButton>
                  <LiquidButton intent="ghost" onClick={() => setEditing(false)}>Cancel</LiquidButton>
                </div>
              </Glass>
            )}

            {/* Duplicate */}
            <ActionRow
              icon={<CopyIcon size={16} />}
              label="Duplicate to now"
              description="Log the same food again with the current time."
              onClick={onDuplicate}
            />

            {/* Delete */}
            {!confirmingDelete ? (
              <ActionRow
                icon={<TrashIcon size={16} />}
                label="Delete entry"
                danger
                onClick={() => setConfirmingDelete(true)}
              />
            ) : (
              <Glass radius="lg" style={{ padding: 14, borderColor: 'rgba(239,68,68,0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Delete this entry?</div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.45 }}>
                  This can't be undone.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <LiquidButton intent="danger" onClick={onDelete}>Delete</LiquidButton>
                  <LiquidButton intent="ghost" onClick={() => setConfirmingDelete(false)}>Cancel</LiquidButton>
                </div>
              </Glass>
            )}
          </div>
        </SpringReveal>

      </div>
    </SafeScreen>
  );
}
export { MealDetail };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function mealLabel(id) {
  switch (id) {
    case 'breakfast': return 'Breakfast';
    case 'lunch':     return 'Lunch';
    case 'dinner':    return 'Dinner';
    case 'snacks':    return 'Snacks';
    default:          return 'Meal';
  }
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function MacroCard({ label, grams, kcal, color }) {
  return (
    <Glass radius="lg" style={{ padding: 14 }}>
      <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color, fontVariantNumeric: 'tabular-nums' }}>{grams}</span>
        <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>g</span>
      </div>
      <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {kcal} kcal
      </div>
    </Glass>
  );
}

function ActionRow({ icon, label, description, onClick, danger = false }) {
  const color = danger ? '#F87171' : 'hsl(var(--rd-fg-primary))';
  const tintBg = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)';
  const tintBorder = danger ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.10)';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '14px 16px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: 10,
          background: tintBg,
          border: `1px solid ${tintBorder}`,
          color,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', color }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1.4 }}>{description}</div>
        )}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top) + 14px)',
        left: 'max(16px, env(safe-area-inset-left))',
        zIndex: 45,
        width: 36, height: 36, borderRadius: 9999,
        background: 'rgba(10,14,20,0.55)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <ChevronLeftIcon size={18} />
    </button>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function MealDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [found, setFound] = useState(() => findEntryById(user?.id, id));

  // Refresh after any store change so edit/duplicate/delete reflect.
  useEffect(() => {
    setFound(findEntryById(user?.id, id));
    return subscribe(() => setFound(findEntryById(user?.id, id)));
  }, [user?.id, id]);

  return (
    <MealDetail
      entry={found?.entry}
      mealId={found?.mealId}
      date={found?.date}
      onBack={() => navigate('/app/nutrition/diary')}
      onEditPortion={(portion) => {
        updateEntryById(user?.id, id, { portion });
      }}
      onDuplicate={() => {
        if (!found?.entry) return;
        const { id: _ignore, createdAt: _ts, ...rest } = found.entry;
        addEntry(user?.id, new Date(), found.mealId, rest);
        toast.success('Logged again for now');
        navigate('/app/nutrition/diary');
      }}
      onDelete={() => {
        removeEntryById(user?.id, id);
        toast.success('Entry deleted');
        navigate('/app/nutrition/diary');
      }}
    />
  );
}
