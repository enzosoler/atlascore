import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18nContext';
import { toast } from 'sonner';

/**
 * Normalizes pt-BR food descriptions for better AI parsing
 * Handles common Brazilian food terms, portions, and variations
 */
function normalizeFoodInput(input) {
  if (!input || typeof input !== 'string') return input;

  let normalized = input.toLowerCase().trim();

  // Brazilian portion descriptors → standard quantities
  const portionMappings = {
    'um pao': '1 pao',
    'uma fatia': '1 fatia',
    'um pedaco': '1 pedaco',
    'um pouco de': '20g de',
    'colher de': '1 colher de',
    'colheres de': '2 colheres de',
    'xicara de': '1 xicara de 200ml de',
    'copo de': '1 copo de 250ml de',
    'prato de': '1 prato de 300g de',
    'concha de': '1 concha de',
  };

  Object.entries(portionMappings).forEach(([pattern, replacement]) => {
    normalized = normalized.replace(new RegExp(`\\b${pattern}\\b`, 'gi'), replacement);
  });

  // Common Brazilian food normalizations
  const foodMappings = {
    'pao frances': 'pao frances (baguette)',
    'pao de forma': 'pao de forma (sliced white bread)',
    'arroz branco': 'arroz branco cozido',
    'feijao': 'feijao carioca cozido',
    'frango': 'peito de frango',
    'carne': 'carne bovina',
    'manteiga': 'manteiga comum',
    'queijo': 'queijo minas frescal',
    'leite': 'leite integral',
    'cafe': 'cafe preto sem acucar',
    'suco': 'suco natural de laranja',
    'ovos': 'ovos inteiros',
  };

  Object.entries(foodMappings).forEach(([pattern, replacement]) => {
    // Only replace if it's a standalone word to avoid partial matches
    normalized = normalized.replace(
      new RegExp(`\\b${pattern}\\b(?!\\w)`, 'gi'),
      replacement
    );
  });

  return normalized;
}

/**
 * Validates AI food analysis result
 * Returns { isValid: boolean, confidence: number, issues: string[] }
 */
function validateFoodResult(result) {
  const issues = [];

  if (!result || typeof result !== 'object') {
    return { isValid: false, confidence: 0, issues: ['Invalid result structure'] };
  }

  if (!result.food_name || typeof result.food_name !== 'string') {
    issues.push('Missing food name');
  }

  // Check for zero calories (likely unparseable)
  if (result.calories === 0 || result.calories === undefined || result.calories === null) {
    issues.push('Calories not determined');
  }

  // Check confidence threshold
  const confidence = result.confidence || 0;
  if (confidence < 0.5) {
    issues.push(`Low confidence (${Math.round(confidence * 100)}%)`);
  }

  // Validate macros are reasonable (not all zeros unless it's water)
  const hasAnyMacros = (result.protein || 0) > 0 || (result.carbs || 0) > 0 || (result.fat || 0) > 0;
  if (!hasAnyMacros && (result.calories || 0) > 10) {
    issues.push('Missing macronutrient breakdown');
  }

  return {
    isValid: issues.length === 0 && confidence >= 0.5,
    confidence,
    issues,
  };
}

/** Capitalize each word: "frango frito" → "Frango Frito" */
function titleCase(str) {
  if (!str) return str;
  // Replace underscores with spaces (AI sometimes returns snake_case names)
  return str.replace(/_/g, ' ').replace(/\b\p{L}+/gu, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );
}

function getConfidenceLabel(confidence = 0) {
  if (confidence >= 0.8) return { label: 'High confidence', tone: 'success' };
  if (confidence >= 0.5) return { label: 'Needs review', tone: 'warn' };
  return { label: 'Low confidence', tone: 'danger' };
}

export default function AIFoodInput({ onFoodsDetected, onFallbackToSearch, prefillText, onPrefillConsumed }) {
  const { locale } = useI18n();
  const [text, setText] = useState('');

  // Handle prefill from quick suggestions
  React.useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      onPrefillConsumed?.();
    }
  }, [prefillText]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [error, setError] = useState(null);
  const [suggestedSearch, setSuggestedSearch] = useState(null);
  const [validation, setValidation] = useState(null);

  // Step tracking: 'input' -> 'analyzing' -> 'review'
  const step = result ? 'review' : isAnalyzing ? 'analyzing' : 'input';

  // Build editable items from result whenever result changes
  React.useEffect(() => {
    if (!result) { setEditableItems([]); return; }
    const items = result.items?.length
      ? result.items.map((item, idx) => ({
          _id: idx,
          name: titleCase(item.name),
          grams: item.estimated_grams || 100,
          calories: Math.round(item.calories || 0),
          protein: Math.round((item.protein || 0) * 10) / 10,
          carbs: Math.round((item.carbs || 0) * 10) / 10,
          fat: Math.round((item.fat || 0) * 10) / 10,
          unit_weight_g: item.unit_weight_g || null,
          unit_type: item.unit_type || 'unit',
        }))
      : [{
          _id: 0,
          name: titleCase(result.food_name),
          grams: result.items?.[0]?.estimated_grams || 100,
          calories: Math.round(result.calories || 0),
          protein: Math.round((result.protein || 0) * 10) / 10,
          carbs: Math.round((result.carbs || 0) * 10) / 10,
          fat: Math.round((result.fat || 0) * 10) / 10,
          unit_weight_g: null,
          unit_type: 'unit',
        }];
    setEditableItems(items);
  }, [result]);

  const editableTotal = React.useMemo(() => {
    return editableItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [editableItems]);

  const updateEditableItem = useCallback((id, field, value) => {
    setEditableItems((prev) => prev.map((item) => {
      if (item._id !== id) return item;
      return { ...item, [field]: field === 'name' ? value : Number(value) || 0 };
    }));
  }, []);

  const removeEditableItem = useCallback((id) => {
    setEditableItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const handleAnalyze = useCallback(async () => {
    const rawText = text.trim();
    if (!rawText) {
      toast.error('Describe what you ate');
      return;
    }

    const normalizedText = normalizeFoodInput(rawText);

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setValidation(null);

    try {
      const langName = locale?.startsWith('pt') ? 'Portuguese' : locale?.startsWith('es') ? 'Spanish' : 'English';
      const { data, error: fnError } = await supabase.functions.invoke('log-food-text', {
        body: { query: normalizedText, originalQuery: rawText, language: langName },
      });

      if (fnError) {
        let errorMsg = fnError.message || 'AI analysis failed';
        try {
          if (fnError.context && typeof fnError.context.json === 'function') {
            const errorBody = await fnError.context.json();
            if (errorBody?.code) {
              if (errorBody.code === 'KILL_SWITCH') {
                setError('AI food analysis is temporarily unavailable. Please add foods manually.');
                setSuggestedSearch(rawText);
                return;
              }
              if (errorBody.code === 'MONTHLY_CAP' || errorBody.code === 'DAILY_CAP') {
                setError('AI food analysis has reached its limit. Please add foods manually.');
                setSuggestedSearch(rawText);
                return;
              }
              if (errorBody.code === 'USER_DAILY_LIMIT') {
                setError(`Daily AI limit reached (${errorBody.used}/${errorBody.limit}). Try again tomorrow or add foods manually.`);
                setSuggestedSearch(rawText);
                return;
              }
              if (errorBody.code === 'PARSE_ERROR') {
                setError('AI couldn\'t parse that food. Try rephrasing with more detail (e.g., "1 prato de macarrao com molho").');
                setSuggestedSearch(rawText);
                return;
              }
              if (errorBody.code === 'RATE_LIMIT') {
                setError('AI service is busy. Try again in a moment or use the search below.');
                setSuggestedSearch(rawText);
                return;
              }
            }
            if (errorBody?.error) {
              setError(errorBody.error);
              setSuggestedSearch(rawText);
              return;
            }
          }
        } catch {
          // fall through
        }
        throw new Error(errorMsg);
      }

      if (data?.error) {
        if (data.code === 'USER_DAILY_LIMIT') {
          setError(`Daily AI limit reached (${data.used}/${data.limit}). Try again tomorrow or add foods manually.`);
        } else if (data.code === 'KILL_SWITCH') {
          setError('AI food analysis is temporarily unavailable. Please add foods manually.');
        } else if (data.code === 'MONTHLY_CAP' || data.code === 'DAILY_CAP') {
          setError('AI food analysis has reached its limit. Please add foods manually.');
        } else {
          setError(data.error);
        }
        setSuggestedSearch(rawText);
        return;
      }

      if (!data?.success) {
        setError('Could not identify foods. Try being more specific (e.g., "1 pao frances com 10g de manteiga").');
        setSuggestedSearch(rawText);
        return;
      }

      const validationResult = validateFoodResult(data);
      setValidation(validationResult);

      if (!validationResult.isValid) {
        setResult(data);
        setError(`Low confidence result: ${validationResult.issues.join(', ')}. Please verify or try search.`);
        setSuggestedSearch(rawText);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('AI food text error:', err);
      const msg = err?.message || '';
      setSuggestedSearch(rawText);

      if (msg.includes('429') || msg.includes('rate')) {
        setError('Too many requests. AI is busy -- try search below or wait a moment.');
      } else if (msg.includes('limit') || msg.includes('cap')) {
        setError('Daily AI limit reached. Use the search feature to find your food.');
      } else if (msg && !msg.includes('fetch') && !msg.includes('network') && msg.length < 200) {
        setError(msg);
      } else {
        setError('Couldn\'t analyze automatically. Try search below or rephrase your description.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [text, locale]);

  const handleConfirm = useCallback(() => {
    if (editableItems.length === 0) return;

    const foods = editableItems.map((item) => ({
      name: item.name,
      serving_description: `${item.grams}g`,
      estimatedAmount: `${item.grams}g`,
      calories: Math.round(item.calories),
      protein: Math.round(item.protein * 10) / 10,
      carbs: Math.round(item.carbs * 10) / 10,
      fat: Math.round(item.fat * 10) / 10,
      fiber: 0,
      confidence: result?.confidence,
      unit_weight_g: item.unit_weight_g,
      unit_type: item.unit_type,
      amount: item.grams,
      unit: 'g',
    }));

    onFoodsDetected(foods);
    resetState();
  }, [editableItems, result, onFoodsDetected]);

  const resetState = useCallback(() => {
    setText('');
    setResult(null);
    setEditableItems([]);
    setIsAnalyzing(false);
    setError(null);
    setSuggestedSearch(null);
    setValidation(null);
  }, []);

  // ── Step indicator ─────────────────────────────────────────────────────────
  const stepLabels = ['Describe', 'Analyze', 'Review'];
  const stepIdx = step === 'input' ? 0 : step === 'analyzing' ? 1 : 2;

  return (
    <div className="space-y-3">
      {/* Step indicator bar */}
      <div className="flex items-center gap-1">
        {stepLabels.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i <= stepIdx
                  ? 'bg-[hsl(var(--brand))] text-white'
                  : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]'
              }`}>
                {i + 1}
              </div>
              <span className={`text-[11px] font-medium ${
                i <= stepIdx ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-3))]'
              }`}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${
                i < stepIdx ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--fill))]'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Text input */}
      {step === 'input' && (
        <>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="e.g. eggs, toast, coffee"
              rows={2}
              disabled={isAnalyzing}
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.46)] text-[13px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.3)] focus:border-[hsl(var(--brand))] disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              aria-label="Analyze with AI"
              className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-[hsl(var(--brand))] text-white flex items-center justify-center hover:bg-[hsl(var(--brand)/0.9)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[12px]">{error}</p>
              </div>
              {onFallbackToSearch && suggestedSearch && (
                <button
                  onClick={() => onFallbackToSearch(suggestedSearch)}
                  className="w-full py-2 px-3 rounded-lg bg-[hsl(var(--fill)/0.46)] hover:bg-[hsl(var(--fill))] text-[12px] text-[hsl(var(--fg))] transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  Try searching for &quot;{suggestedSearch.length > 25 ? suggestedSearch.substring(0, 25) + '...' : suggestedSearch}&quot;
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* STEP 2: Analyzing */}
      {step === 'analyzing' && (
        <div className="rounded-[16px] border border-[hsl(var(--brand-ai)/0.15)] bg-[hsl(var(--brand-ai)/0.04)] px-4 py-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--brand-ai))] mx-auto" />
          <p className="mt-3 text-[13px] font-medium text-[hsl(var(--brand-ai))]">
            Analyzing your meal...
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--fg-3))]">
            Identifying foods, portions, and macros
          </p>
        </div>
      )}

      {/* STEP 3: Editable review */}
      {step === 'review' && (
        <>
          {/* Confidence badge */}
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[hsl(var(--brand))]" />
              Review &amp; edit
            </p>
            <div className="flex items-center gap-2">
              {result?.confidence != null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                  getConfidenceLabel(result.confidence).tone === 'success'
                    ? 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]'
                    : getConfidenceLabel(result.confidence).tone === 'warn'
                      ? 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]'
                      : 'bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]'
                }`}>
                  {getConfidenceLabel(result.confidence).label}
                </span>
              )}
              {result?.source === 'cache' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]">
                  instant
                </span>
              )}
              <button
                onClick={resetState}
                className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Low-confidence warning */}
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-[12px]">{error}</p>
            </div>
          )}

          {/* Editable food items */}
          <div className="space-y-2">
            {editableItems.map((item) => (
              <div
                key={item._id}
                className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateEditableItem(item._id, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-[13px] font-semibold text-[hsl(var(--fg))] outline-none border-b border-transparent focus:border-[hsl(var(--brand)/0.3)] transition-colors"
                  />
                  {editableItems.length > 1 && (
                    <button
                      onClick={() => removeEditableItem(item._id)}
                      className="shrink-0 p-1 rounded text-[hsl(var(--fg-3))] hover:text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[
                    { key: 'calories', label: 'kcal' },
                    { key: 'protein', label: 'P (g)' },
                    { key: 'carbs', label: 'C (g)' },
                    { key: 'fat', label: 'F (g)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{label}</label>
                      <input
                        type="number"
                        min="0"
                        step={key === 'calories' ? '1' : '0.1'}
                        value={item[key]}
                        onChange={(e) => updateEditableItem(item._id, key, e.target.value)}
                        className="mt-0.5 w-full rounded-lg border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)] px-2 py-1 text-[12px] font-medium text-[hsl(var(--fg))] text-center outline-none focus:border-[hsl(var(--brand)/0.4)] transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Total summary */}
          <div className="grid grid-cols-4 gap-2 rounded-[12px] bg-[hsl(var(--fill)/0.4)] px-3 py-2">
            {[
              { label: 'kcal', value: Math.round(editableTotal.calories) },
              { label: 'P', value: `${Math.round(editableTotal.protein * 10) / 10}g` },
              { label: 'C', value: `${Math.round(editableTotal.carbs * 10) / 10}g` },
              { label: 'F', value: `${Math.round(editableTotal.fat * 10) / 10}g` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{label}</p>
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{value}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--fg-3))]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>AI estimates. Edit values above if needed.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetState} className="flex-1 h-10 rounded-xl text-[12px]">
              Try again
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={editableItems.length === 0}
              className="flex-[2] h-10 rounded-xl text-[13px] btn btn-primary gap-1.5 font-semibold disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Log meal ({editableItems.length} item{editableItems.length !== 1 ? 's' : ''})
            </Button>
          </div>

          {/* Usage info */}
          {result?.usage && (
            <p className="text-[10px] text-[hsl(var(--fg-3))] text-center">
              {result.usage.calls_today}/{result.usage.daily_limit} AI analyses used today
            </p>
          )}
        </>
      )}
    </div>
  );
}
