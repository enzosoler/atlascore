import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

/**
 * AIFoodInput — Natural language food logging powered by AI.
 *
 * Users type what they ate in plain language (any language), e.g.:
 *   "arroz com feijão com um pouco de manteiga"
 *   "2 eggs scrambled with cheese and toast"
 *
 * The component calls the `log-food-text` edge function which returns:
 *   {
 *     success: true,
 *     source: 'ai' | 'cache',
 *     food_name: string,
 *     serving_description: string,
 *     calories, protein, carbs, fat, fiber,
 *     confidence: number,
 *     items: [{ name, estimated_grams, calories, protein, carbs, fat }]  // sub-items
 *   }
 *
 * Props:
 *   onFoodsDetected(foods[]) — called with an array of food items in the standard shape:
 *     { name, estimatedAmount, calories, protein, carbs, fat, fiber, confidence, serving_description }
 */
export default function AIFoodInput({ onFoodsDetected }) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // The full AI response
  const [showItems, setShowItems] = useState(false); // Toggle sub-items breakdown
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Describe what you ate');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('log-food-text', {
        body: { query: trimmed },
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
        return;
      }

      if (!data?.success) {
        toast.info('Could not identify foods. Try being more specific (e.g., "1 plate of rice with beans").');
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('AI food text error:', err);
      const msg = err?.message || '';
      if (msg.includes('429') || msg.includes('rate')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to analyze. Please try again or add foods manually.');
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
    const foods = [{
      name: result.food_name,
      serving_description: result.serving_description,
      estimatedAmount: result.serving_description,
      calories: result.calories || 0,
      protein: result.protein || 0,
      carbs: result.carbs || 0,
      fat: result.fat || 0,
      fiber: result.fiber || 0,
      confidence: result.confidence,
    }];

    onFoodsDetected(foods);
    resetState();
  }, [result, onFoodsDetected]);

  const handleAddIndividualItems = useCallback(() => {
    if (!result?.items?.length) return;

    const foods = result.items.map((item) => ({
      name: item.name,
      serving_description: `${item.estimated_grams}g`,
      estimatedAmount: `${item.estimated_grams}g`,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: 0,
      confidence: result.confidence,
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
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[12px]">{error}</p>
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
            <p className="font-semibold text-[14px] text-[hsl(var(--fg))]">{result.food_name}</p>
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
                    <span className="text-[hsl(var(--fg))]">{item.name}</span>
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
          className="flex-1 h-9 rounded-xl text-[12px] btn btn-primary gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Add meal
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
