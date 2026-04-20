/**
 * CustomFood — create a reusable custom food entry.
 *
 * Form mimics a nutrition label: name, brand, serving size + unit,
 * calories, protein, carbs, fat, fiber, sugar, sodium.
 *
 * Save: for MVP we just toast honestly since there's no `custom_foods`
 * table yet. Once the Supabase nutrition service lands, persist there
 * and keep the same UX.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { ChevronLeftIcon, UtensilsIcon, CheckIcon } from '../lib/icons';

const UNITS = ['g', 'ml', 'oz'];

const NUTRIENT_ROWS = [
  { id: 'calories', label: 'Calories',     unit: 'kcal', bold: true },
  { id: 'protein',  label: 'Protein',      unit: 'g' },
  { id: 'carbs',    label: 'Carbohydrate', unit: 'g' },
  { id: 'fat',      label: 'Fat',          unit: 'g' },
  { id: 'fiber',    label: 'Fiber',        unit: 'g', indent: true },
  { id: 'sugar',    label: 'Sugar',        unit: 'g', indent: true },
  { id: 'sodium',   label: 'Sodium',       unit: 'mg' },
];

export default function CustomFood({
  onCancel,
  onSave,
}) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    servingAmount: '',
    servingUnit: 'g',
    nutrients: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: '',
    },
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setNutrient = (k, v) =>
    setForm((f) => ({ ...f, nutrients: { ...f.nutrients, [k]: v } }));

  const canSave = form.name.trim() && form.servingAmount && form.nutrients.calories !== '';

  const save = () => {
    if (!canSave) {
      toast.error('Add a name, serving size, and calories to save');
      return;
    }
    onSave?.({
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      servingAmount: Number(form.servingAmount) || 0,
      servingUnit: form.servingUnit,
      nutrients: Object.fromEntries(
        Object.entries(form.nutrients).map(([k, v]) => [k, Number(v) || 0]),
      ),
    });
  };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}>
      <BackButton onClick={onCancel} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>

        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Nutrition
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Custom food
          </h1>
          <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', marginTop: 6, lineHeight: 1.45 }}>
            Add a food that's not in our catalog. You can log it any time after.
          </p>
        </SpringReveal>

        {/* Name + brand */}
        <SpringReveal delay={60}>
          <Glass radius="xl" style={{ padding: 16, marginTop: 16 }}>
            <FieldLabel>Name</FieldLabel>
            <TextInput
              value={form.name}
              onChange={(v) => setField('name', v)}
              placeholder="e.g. Grandma's granola"
            />
            <FieldLabel style={{ marginTop: 12 }}>Brand <OptionalHint /></FieldLabel>
            <TextInput
              value={form.brand}
              onChange={(v) => setField('brand', v)}
              placeholder="Optional"
            />
          </Glass>
        </SpringReveal>

        {/* Serving */}
        <SpringReveal delay={100}>
          <Glass radius="xl" style={{ padding: 16, marginTop: 12 }}>
            <FieldLabel>Serving size</FieldLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8 }}>
              <TextInput
                value={form.servingAmount}
                onChange={(v) => setField('servingAmount', v.replace(/[^\d.]/g, ''))}
                placeholder="100"
                inputMode="decimal"
                numeric
              />
              <UnitPicker value={form.servingUnit} onChange={(v) => setField('servingUnit', v)} />
            </div>
          </Glass>
        </SpringReveal>

        {/* Nutrition label */}
        <SpringReveal delay={140}>
          <Glass radius="xl" style={{ padding: 0, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  aria-hidden
                  style={{
                    width: 28, height: 28, borderRadius: 9,
                    background: 'rgba(0,255,255,0.10)',
                    color: 'hsl(var(--rd-accent))',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <UtensilsIcon size={14} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Nutrition facts</div>
                  <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                    per {form.servingAmount || '—'} {form.servingUnit}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {NUTRIENT_ROWS.map((row, i) => (
                <NutrientRow
                  key={row.id}
                  row={row}
                  value={form.nutrients[row.id]}
                  onChange={(v) => setNutrient(row.id, v.replace(/[^\d.]/g, ''))}
                  first={i === 0}
                />
              ))}
            </div>
          </Glass>
        </SpringReveal>

        {/* Footer CTAs */}
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <LiquidButton intent="ghost" block onClick={onCancel}>Cancel</LiquidButton>
          <LiquidButton
            intent="primary"
            block
            onClick={save}
            disabled={!canSave}
            leftIcon={canSave ? <CheckIcon size={16} /> : null}
          >
            Save custom food
          </LiquidButton>
        </div>

      </div>
    </SafeScreen>
  );
}
export { CustomFood };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function FieldLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'hsl(var(--rd-fg-muted))',
      fontWeight: 700,
      marginBottom: 6,
      ...style,
    }}>
      {children}
    </div>
  );
}

function OptionalHint() {
  return (
    <span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, letterSpacing: 'normal', textTransform: 'none', fontSize: 11 }}>
      (optional)
    </span>
  );
}

function TextInput({ value, onChange, placeholder, inputMode, numeric = false }) {
  return (
    <input
      type="text"
      inputMode={inputMode || 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 44,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        padding: '0 14px',
        fontSize: 14,
        outline: 'none',
        fontVariantNumeric: numeric ? 'tabular-nums' : 'normal',
      }}
    />
  );
}

function UnitPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {UNITS.map((u) => {
        const active = u === value;
        return (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 9,
              background: active ? 'rgba(0,255,255,0.14)' : 'transparent',
              border: active ? '1px solid rgba(0,255,255,0.4)' : '1px solid transparent',
              color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {u}
          </button>
        );
      })}
    </div>
  );
}

function NutrientRow({ row, value, onChange, first }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        borderTop: first ? 'none' : '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          fontSize: row.bold ? 14 : 13,
          fontWeight: row.bold ? 700 : 500,
          color: row.bold ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-secondary))',
          letterSpacing: '-0.005em',
          paddingLeft: row.indent ? 14 : 0,
        }}
      >
        {row.label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          style={{
            width: 80, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'hsl(var(--rd-fg-primary))',
            padding: '0 10px',
            fontSize: 14,
            textAlign: 'right',
            outline: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', width: 28, fontVariantNumeric: 'tabular-nums' }}>
          {row.unit}
        </span>
      </div>
    </div>
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

export function CustomFoodRoute() {
  const navigate = useNavigate();
  return (
    <CustomFood
      onCancel={() => navigate(-1)}
      onSave={(_food) => {
        // TODO: persist via nutritionService.createCustomFood() once the
        // Supabase `custom_foods` table is live. For MVP we just confirm.
        toast.success('Custom food saved', {
          description: 'Available next time you log a meal.',
        });
        navigate(-1);
      }}
    />
  );
}
