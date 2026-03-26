import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
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
  return str.replace(/\b\p{L}+/gu, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );
}

export default function AIFoodInput({ onFoodsDetected, onFallbackToSearch }) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const [error, setError] = useState(null);
  const [suggestedSearch, setSuggestedSearch] = useState(null);
  const [validation, setValidation] = useState(null);

  const handleAnalyze = useCallback(async () => {
    const rawText = text.trim();
    if (!rawText) {
      toast.error('Describe what you ate');
      return;
    }

    // Normalize pt-BR inputs for better parsing
    const normalizedText = normalizeFoodInput(rawText);

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setValidation(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('log-food-text', {
        body: { query: normalizedText, originalQuery: rawText },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      // Handle rate limit / spending cap errors from the edge function
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

      // Validate the result quality
      const validationResult = validateFoodResult(data);
      setValidation(validationResult);

      if (!validationResult.isValid) {
        // Still show result but with warning - user can choose to proceed or search
        setResult(data);
        setError(`Low confidence result: ${validationResult.issues.join(', ')}. Please verify or try search.`);
        setSuggestedSearch(rawText);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('AI food text error:', err);
      const msg = err?.message || '';

      // Store the original text for potential fallback search
      setSuggestedSearch(rawText);

      if (msg.includes('429') || msg.includes('rate')) {
        setError('Too many requests. AI is busy — try search below or wait a moment.');
      } else if (msg.includes('limit') || msg.includes('cap')) {
        setError('Daily AI limit reached. Use the search feature to find your food.');
      } else {
        setError('Couldn\'t analyze automatically. Try search below or rephrase your description.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  const handleConfirm = useCallback(() => {
    if (!result) return;

    // The edge function can return sub-items. We let the user add either:
    // - The whole meal as one item (default, simpler)
    // - Individual sub-items (if they expand and want granularity)
    // For now, we always add the whole meal as a single food entry,
    // since that's what the user described as one thing.
    
    // Se tem items, tenta extrair unit_weight_g do primeiro item como referência
    const firstItem = result.items?.[0];
    
    const foods = [{
      name: titleCase(result.food_name),
      serving_description: result.serving_description,
      estimatedAmount: result.serving_description,
      calories: result.calories || 0,
      protein: result.protein || 0,
      carbs: result.carbs || 0,
      fat: result.fat || 0,
      fiber: result.fiber || 0,
      confidence: result.confidence,
      // Dados de conversão de unidades da IA (do primeiro item se disponível)
      unit_weight_g: firstItem?.unit_weight_g || null,
      unit_type: firstItem?.unit_type || 'unit',
      // Quantidade e unidade
      amount: firstItem?.estimated_grams || 100,
      unit: 'g',
    }];

    onFoodsDetected(foods);
    resetState();
  }, [result, onFoodsDetected]);

  const handleAddIndividualItems = useCallback(() => {
    if (!result?.items?.length) return;

    const foods = result.items.map((item) => ({
      name: titleCase(item.name),
      serving_description: `${item.estimated_grams}g`,
      estimatedAmount: `${item.estimated_grams}g`,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: 0,
      confidence: result.confidence,
      // Dados de conversão de unidades da IA
      unit_weight_g: item.unit_weight_g || null,
      unit_type: item.unit_type || 'unit',
      // Quantidade em gramas para cálculos
      amount: item.estimated_grams || 100,
      unit: 'g',
    }));

    onFoodsDetected(foods);
    resetState();
  }, [result, onFoodsDetected]);

  const resetState = useCallback(() => {
    setText('');
    setResult(null);
    setShowItems(false);
    setIsAnalyzing(false);
    setError(null);
    setSuggestedSearch(null);
    setValidation(null);
  }, []);

  // ── Input mode: before analysis ──────────────────────────────────────────
  if (!result) {
    return (
      <div className="space-y-2">
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
            placeholder="Describe what you ate... (e.g., arroz com feijão e frango grelhado)"
            rows={2}
            disabled={isAnalyzing}
            className="w-full px-3 py-2.5 pr-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.46)] text-[13px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.3)] focus:border-[hsl(var(--brand))] disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-[hsl(var(--brand))] text-white flex items-center justify-center hover:bg-[hsl(var(--brand)/0.9)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>

        {isAnalyzing && (
          <p className="text-[11px] text-[hsl(var(--fg-3))] text-center animate-pulse">
            AI is analyzing your meal...
          </p>
        )}

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
      </div>
    );
  }

  // ── Result mode: show detected meal ──────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[hsl(var(--fg))] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[hsl(var(--brand))]" />
          AI Result
          {result.source === 'cache' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-1">
              instant
            </span>
          )}
        </p>
        <button
          onClick={resetState}
          className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main result card */}
      <div className="p-3 rounded-xl border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-[14px] text-[hsl(var(--fg))]">{titleCase(result.food_name)}</p>
            {result.serving_description && (
              <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5">{result.serving_description}</p>
            )}
          </div>
          {result.confidence != null && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                result.confidence >= 0.8
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : result.confidence >= 0.5
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}
            >
              {Math.round(result.confidence * 100)}%
            </span>
          )}
        </div>

        {/* Macro summary */}
        <div className="flex gap-3 text-[12px] mt-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
          <span className="font-semibold text-[hsl(var(--fg))]">{Math.round(result.calories)} kcal</span>
          <span className="text-[hsl(var(--fg-2))]">P <b className="text-[hsl(var(--fg))]">{result.protein}g</b></span>
          <span className="text-[hsl(var(--fg-2))]">C <b className="text-[hsl(var(--fg))]">{result.carbs}g</b></span>
          <span className="text-[hsl(var(--fg-2))]">F <b className="text-[hsl(var(--fg))]">{result.fat}g</b></span>
          {result.fiber > 0 && (
            <span className="text-[hsl(var(--fg-2))]">Fib <b className="text-[hsl(var(--fg))]">{result.fiber}g</b></span>
          )}
        </div>

        {/* Sub-items breakdown (expandable) */}
        {result.items?.length > 1 && (
          <div className="mt-2">
            <button
              onClick={() => setShowItems(!showItems)}
              className="flex items-center gap-1 text-[11px] text-[hsl(var(--brand))] hover:underline"
            >
              {showItems ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showItems ? 'Hide' : 'Show'} breakdown ({result.items.length} items)
            </button>

            {showItems && (
              <div className="mt-2 space-y-1">
                {result.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-[hsl(var(--fill)/0.46)]"
                  >
                    <span className="text-[hsl(var(--fg))]">{titleCase(item.name)}</span>
                    <span className="text-[hsl(var(--fg-2))] shrink-0 ml-2">
                      {item.estimated_grams}g · {Math.round(item.calories)} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--fg-3))]">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>AI estimates — adjust portions after adding if needed.</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetState} className="flex-1 h-9 rounded-xl text-[12px]">
          Try again
        </Button>

        {result.items?.length > 1 && (
          <Button
            variant="outline"
            onClick={handleAddIndividualItems}
            className="h-9 rounded-xl text-[12px] gap-1"
          >
            Add {result.items.length} items
          </Button>
        )}

        <Button
          onClick={handleConfirm}
          disabled={validation && !validation.isValid}
          className="flex-1 h-9 rounded-xl text-[12px] btn btn-primary gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {validation && !validation.isValid ? 'Add anyway (low confidence)' : 'Add meal'}
        </Button>
      </div>

      {/* Usage info */}
      {result.usage && (
        <p className="text-[10px] text-[hsl(var(--fg-3))] text-center">
          {result.usage.calls_today}/{result.usage.daily_limit} AI analyses used today
        </p>
      )}
    </div>
  );
}
