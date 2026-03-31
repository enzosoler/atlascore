/**
 * QuickLogSheet — ultra-fast food logging.
 *
 * Spec from plan:
 * - AI text input autofocused on open
 * - Recent food chips (1 tap = log with default quantity)
 * - Barcode + search buttons
 *
 * Speed SLA: recent food = 1 tap, AI text = < 10s, barcode = 1 tap.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Search, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { tapLight, tapMedium } from '@/lib/haptics';
import { toast } from 'sonner';

const RECENT_FOODS_KEY = 'atlas_recent_foods';

function getRecentFoods() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_FOODS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {(food: object) => Promise<void>} props.onLogRecent — called when a recent chip is tapped
 * @param {(text: string) => Promise<void>} props.onAISubmit — called when AI text is submitted
 * @param {() => void} props.onOpenBarcode
 * @param {() => void} props.onOpenSearch
 */
export default function QuickLogSheet({ open, onOpenChange, onLogRecent, onAISubmit, onOpenBarcode, onOpenSearch }) {
  const inputRef = useRef(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recentFoods = getRecentFoods();

  useEffect(() => {
    if (open) {
      // Autofocus AI input after sheet animation
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      setText('');
    }
  }, [open]);

  const handleSubmitAI = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAISubmit?.(text.trim());
      setText('');
      onOpenChange(false);
      tapMedium();
    } catch {
      toast.error('Could not log food. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecentTap = async (food) => {
    tapLight();
    try {
      await onLogRecent?.(food);
      onOpenChange(false);
      tapMedium();
      toast.success(`${food.name || food.food_name || 'Food'} logged.`);
    } catch {
      toast.error('Could not log food.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAI();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[24px] max-h-[70dvh]">
        <SheetHeader className="pb-3">
          <SheetTitle className="text-[16px] font-bold tracking-[-0.02em]">Quick Log</SheetTitle>
        </SheetHeader>

        {/* AI text input */}
        <div className="relative mb-4">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I had 2 eggs and a coffee..."
            rows={2}
            className="w-full resize-none rounded-[12px] bg-[hsl(var(--shell))] border border-[hsl(var(--border))] px-4 py-3 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand))] focus:ring-0 focus:outline-none transition-colors duration-100"
          />
          {text.trim() && (
            <button
              onClick={handleSubmitAI}
              disabled={submitting}
              className="absolute right-3 bottom-3 h-7 w-7 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center disabled:opacity-50"
            >
              <span className="text-white text-[12px] font-bold">↑</span>
            </button>
          )}
        </div>

        {/* Recent food chips */}
        {recentFoods.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-2">
              Recent
            </p>
            <div className="flex flex-wrap gap-2">
              {recentFoods.slice(0, 6).map((food, i) => (
                <button
                  key={food.id || i}
                  onClick={() => handleRecentTap(food)}
                  className="px-3 py-1.5 rounded-full bg-[hsl(var(--shell))] border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg-2))] active:scale-[0.95] transition-transform duration-100"
                >
                  {food.name || food.food_name || 'Food'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {onOpenBarcode && (
            <button
              onClick={() => { onOpenBarcode(); onOpenChange(false); }}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[12px] bg-[hsl(var(--shell))] border border-[hsl(var(--border))] text-[13px] font-semibold text-[hsl(var(--fg-2))] active:scale-[0.97] transition-transform duration-100"
            >
              <Camera className="w-4 h-4" strokeWidth={2} />
              Scan barcode
            </button>
          )}
          {onOpenSearch && (
            <button
              onClick={() => { onOpenSearch(); onOpenChange(false); }}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[12px] bg-[hsl(var(--shell))] border border-[hsl(var(--border))] text-[13px] font-semibold text-[hsl(var(--fg-2))] active:scale-[0.97] transition-transform duration-100"
            >
              <Search className="w-4 h-4" strokeWidth={2} />
              Search food
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
