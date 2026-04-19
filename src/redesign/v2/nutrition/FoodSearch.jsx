/**
 * FoodSearch — full-screen food search.
 * Ref: MyFitnessPal search + Yazio recent foods + Cal AI quick entry.
 *
 * - Sticky search input at top (big, autofocus)
 * - Filter tabs: Recent / Meals / Foods / My Foods
 * - Result rows: name, brand, portion, kcal
 * - Empty = "Nothing yet — try 'eggs' or scan a barcode"
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

const TABS = ['Recent', 'Meals', 'Foods', 'My foods'];

// Demo catalogue — replace with real nutritionService query upstream.
// `aliases` holds natural-language synonyms (EN + PT) so fuzzy search works:
// "arroz" matches rice, "frango" matches chicken, "ovo" matches eggs, etc.
const DEMO_FOODS = [
  { id: '1',  name: 'Greek yogurt',          brand: 'Oikos 0%',          portion: '170 g',  calories: 100, protein: 17, carbs: 6,  fat: 0,  aliases: ['iogurte', 'grego', 'yogurt'] },
  { id: '2',  name: 'Rolled oats',           brand: 'Quaker',            portion: '40 g',   calories: 150, protein: 5,  carbs: 27, fat: 3,  aliases: ['aveia', 'oats', 'mingau'] },
  { id: '3',  name: 'Blueberries',           brand: null,                portion: '100 g',  calories: 57,  protein: 0,  carbs: 14, fat: 0,  aliases: ['mirtilo', 'blueberry'] },
  { id: '4',  name: 'Chicken breast',        brand: 'Perdigão',          portion: '150 g',  calories: 248, protein: 46, carbs: 0,  fat: 5,  aliases: ['frango', 'peito de frango', 'chicken'] },
  { id: '5',  name: 'Jasmine rice, cooked',  brand: null,                portion: '1 cup',  calories: 205, protein: 4,  carbs: 45, fat: 0,  aliases: ['arroz', 'arroz branco', 'rice', 'jasmim'] },
  { id: '6',  name: 'Brown rice, cooked',    brand: null,                portion: '1 cup',  calories: 216, protein: 5,  carbs: 45, fat: 2,  aliases: ['arroz integral', 'brown rice', 'arroz'] },
  { id: '7',  name: 'Black beans',           brand: null,                portion: '1 cup',  calories: 227, protein: 15, carbs: 41, fat: 1,  aliases: ['feijão', 'feijão preto', 'beans'] },
  { id: '8',  name: 'Olive oil',             brand: 'Colavita',          portion: '1 tbsp', calories: 119, protein: 0,  carbs: 0,  fat: 14, aliases: ['azeite', 'azeite de oliva', 'olive'] },
  { id: '9',  name: 'Banana',                brand: null,                portion: '1 med',  calories: 105, protein: 1,  carbs: 27, fat: 0,  aliases: ['banana'] },
  { id: '10', name: 'Peanut butter',         brand: 'Skippy Natural',    portion: '2 tbsp', calories: 190, protein: 8,  carbs: 6,  fat: 16, aliases: ['pasta de amendoim', 'amendoim', 'peanut'] },
  { id: '11', name: 'Whey isolate',          brand: 'Transparent Labs',  portion: '1 scoop',calories: 120, protein: 28, carbs: 1,  fat: 1,  aliases: ['whey', 'proteína', 'protein', 'suplemento'] },
  { id: '12', name: 'Avocado',               brand: null,                portion: '½ med',  calories: 160, protein: 2,  carbs: 9,  fat: 15, aliases: ['abacate', 'avocado'] },
  { id: '13', name: 'Egg, whole',            brand: null,                portion: '1 large',calories: 72,  protein: 6,  carbs: 0,  fat: 5,  aliases: ['ovo', 'ovos', 'egg', 'eggs'] },
  { id: '14', name: 'Sweet potato, baked',   brand: null,                portion: '100 g',  calories: 90,  protein: 2,  carbs: 21, fat: 0,  aliases: ['batata doce', 'batata-doce', 'sweet potato'] },
  { id: '15', name: 'Ground beef, 90/10',    brand: null,                portion: '100 g',  calories: 176, protein: 20, carbs: 0,  fat: 10, aliases: ['carne moída', 'carne', 'beef', 'hambúrguer'] },
  { id: '16', name: 'Salmon fillet, grilled',brand: null,                portion: '120 g',  calories: 250, protein: 26, carbs: 0,  fat: 15, aliases: ['salmão', 'salmao', 'salmon', 'peixe'] },
  { id: '17', name: 'Pasta, cooked',         brand: 'Barilla',           portion: '1 cup',  calories: 220, protein: 8,  carbs: 43, fat: 1,  aliases: ['macarrão', 'macarrao', 'pasta', 'espaguete', 'spaghetti'] },
  { id: '18', name: 'Bread, whole wheat',    brand: null,                portion: '1 slice',calories: 80,  protein: 4,  carbs: 14, fat: 1,  aliases: ['pão', 'pao', 'pão integral', 'bread'] },
  { id: '19', name: 'Milk, skim',            brand: null,                portion: '1 cup',  calories: 83,  protein: 8,  carbs: 12, fat: 0,  aliases: ['leite', 'leite desnatado', 'milk'] },
  { id: '20', name: 'Coffee, black',         brand: null,                portion: '1 cup',  calories: 2,   protein: 0,  carbs: 0,  fat: 0,  aliases: ['café', 'cafe', 'coffee', 'cafezinho'] },
];

/**
 * Fuzzy-match a food against a query string.
 * Normalizes accents + lowercases + splits the query into tokens, then requires
 * every token to hit either the name, brand, or an alias. So "arroz branco"
 * matches "Jasmine rice, cooked" (via the "arroz" alias) AND "Brown rice".
 */
function foodMatches(food, q) {
  if (!q) return true;
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const haystack = [food.name, food.brand, ...(food.aliases || [])].map(norm).join(' ');
  const tokens = norm(q).trim().split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

export default function FoodSearch({
  mealLabel = 'Breakfast',
  onClose,
  onPick,
  onBarcode,
  onPhoto,
  onVoice,
  onAiParse,    // (text) => void — user hit "Ask AI" with natural-language input
  recent = DEMO_FOODS.slice(0, 5),
  catalogue = DEMO_FOODS,
}) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('Recent');

  const results = useMemo(() => {
    // When there's a query, always search the FULL catalogue regardless of tab.
    // Tab only filters when the query is empty.
    const src = q.trim() ? catalogue : (tab === 'Recent' ? recent : catalogue);
    return src.filter((f) => foodMatches(f, q));
  }, [q, tab, recent, catalogue]);

  // "AI-composer mode" triggers when the query looks like natural language
  // (3+ words or contains "and/e/com"). Atlas nutrition is AI-heavy — the UI
  // should SIGNAL that typing freely is expected, not a bug.
  const looksNaturalLanguage =
    q.trim().split(/\s+/).length >= 3 ||
    /\b(and|com|e|with|plus|\+)\b/i.test(q);

  // Tag each result with whether we hit via alias vs exact name — when via
  // alias, we render a tiny "AI" badge to make the smart match visible.
  const tagged = useMemo(
    () =>
      results.map((f) => {
        const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nq = norm(q);
        const viaAlias = !!q.trim() && !norm(f.name).includes(nq) && (f.aliases || []).some((a) => norm(a).includes(nq));
        return { ...f, viaAlias };
      }),
    [results, q],
  );

  return (
    <SafeScreen paddingX={0}>
      {/* Sticky header (search + close) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          paddingInline: 16,
          paddingBottom: 12,
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.80) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, flexShrink: 0,
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Sparkle + search icon combo signals AI-powered search */}
            <span aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A78BFA' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Describe a food or meal…`}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 14,
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.22)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                color: 'hsl(var(--rd-fg-primary))',
                padding: '0 14px 0 40px',
                fontSize: 15,
                outline: 'none',
              }}
            />
            {q && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setQ('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 28, height: 28, borderRadius: 9999,
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: 'hsl(var(--rd-fg-muted))', cursor: 'pointer',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* AI composer pill — appears when user types natural language */}
        {looksNaturalLanguage && (
          <button
            type="button"
            onClick={() => onAiParse?.(q)}
            style={{
              marginTop: 10,
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderRadius: 14,
              background: 'linear-gradient(180deg, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0.10) 100%)',
              border: '1px solid rgba(139,92,246,0.5)',
              backdropFilter: 'blur(14px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
              color: '#fff',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              textAlign: 'left',
            }}
          >
            <span aria-hidden style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(139,92,246,0.35)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ask Atlas AI to parse this
              </div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-primary))', marginTop: 1, lineHeight: 1.3 }} className="truncate">
                "{q.trim()}"
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: '#A78BFA' }}>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  flex: '0 0 auto',
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
                {t}
              </button>
            );
          })}
        </div>

        {/* Quick actions strip */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <LiquidButton intent="neutral" size="sm" onClick={onPhoto} leftIcon={<CameraIcon />}>Photo</LiquidButton>
          <LiquidButton intent="neutral" size="sm" onClick={onBarcode} leftIcon={<BarcodeIcon />}>Barcode</LiquidButton>
          <LiquidButton intent="neutral" size="sm" onClick={onVoice} leftIcon={<MicIcon />}>Voice</LiquidButton>
        </div>
      </div>

      {/* Results */}
      <div style={{ paddingInline: 16, paddingTop: 8, paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {tagged.length === 0 ? (
          <NothingFound query={q} onAiParse={onAiParse} onPhoto={onPhoto} />
        ) : (
          <>
            {/* "Powered by AI" hint — only when idle (no query) */}
            {!q.trim() && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.18)',
                  marginBottom: 12,
                }}
              >
                <span aria-hidden style={{ color: '#A78BFA' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                </span>
                <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.35 }}>
                  Type naturally — "2 ovos com arroz", "pizza calabresa slice", "café com leite"
                </span>
              </div>
            )}
            <div style={{ display: 'grid', gap: 1 }}>
              {tagged.map((f, i) => (
                <SpringReveal key={f.id} delay={Math.min(i * 18, 200)}>
                  <FoodRow food={f} onClick={() => onPick?.(f)} />
                </SpringReveal>
              ))}
            </div>
          </>
        )}
      </div>
    </SafeScreen>
  );
}
export { FoodSearch };

function NothingFound({ query, onAiParse, onPhoto }) {
  return (
    <div style={{ padding: '40px 16px 16px', textAlign: 'center' }}>
      <div aria-hidden style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(var(--rd-fg-primary))', marginBottom: 6 }}>
        Nothing in our catalog{query ? ` for "${query}"` : ''}
      </div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.45, maxWidth: 320, margin: '0 auto 16px' }}>
        But Atlas AI can figure it out from a description or a photo. Pick one:
      </div>
      <div style={{ display: 'grid', gap: 8, maxWidth: 320, margin: '0 auto' }}>
        {query && (
          <button
            type="button"
            onClick={() => onAiParse?.(query)}
            style={{
              height: 48, borderRadius: 14,
              background: 'linear-gradient(180deg, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.14) 100%)',
              border: '1px solid rgba(139,92,246,0.5)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: '-0.01em',
            }}
          >
            <span aria-hidden>✨</span>
            Ask AI to parse "{query.length > 20 ? `${query.slice(0, 20)}…` : query}"
          </button>
        )}
        <button
          type="button"
          onClick={onPhoto}
          style={{
            height: 44, borderRadius: 14,
            background: 'rgba(0,255,255,0.12)',
            border: '1px solid rgba(0,255,255,0.3)',
            color: 'hsl(var(--rd-accent))', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          📷 Snap a photo instead
        </button>
      </div>
    </div>
  );
}

function FoodRow({ food, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 12px',
        borderRadius: 14,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        color: 'hsl(var(--rd-fg-primary))',
        width: '100%',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 40, height: 40, flexShrink: 0,
          borderRadius: 12,
          background: 'rgba(0,255,255,0.08)',
          border: '1px solid rgba(0,255,255,0.18)',
          color: 'hsl(var(--rd-accent))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 3v7a2 2 0 0 0 2 2v9M6 3v5a2 2 0 0 0 2 2M10 3v5a2 2 0 0 1-2 2M16 3c0 4 3 6 3 11v7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="truncate">{food.name}</span>
          {food.viaAlias && (
            <span
              aria-label="AI match"
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '1px 6px',
                borderRadius: 9999,
                background: 'rgba(139,92,246,0.16)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#A78BFA',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
              AI
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 1 }} className="truncate">
          {[food.brand, food.portion].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-primary))' }}>
          {food.calories} <span style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>kcal</span>
        </div>
        <div style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
          P{food.protein} · C{food.carbs} · F{food.fat}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

const s = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function CameraIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24"><rect {...s} x="3" y="6" width="18" height="14" rx="2.5" /><circle {...s} cx="12" cy="13" r="3.5" /><path {...s} d="M8 6l1.5-2h5L16 6" /></svg>); }
function BarcodeIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24"><path {...s} d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M19 6v12" /></svg>); }
function MicIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24"><rect {...s} x="9" y="3" width="6" height="12" rx="3" /><path {...s} d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>); }
