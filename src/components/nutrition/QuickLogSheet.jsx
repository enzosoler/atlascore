/**
 * QuickLogSheet — ultra-fast food logging via vaul Drawer.
 * Uses the same Drawer pattern as CoachChatSheet for proper keyboard handling.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Search, X } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
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

export default function QuickLogSheet({ open, onOpenChange, onLogRecent, onAISubmit, onOpenBarcode, onOpenSearch }) {
  const inputRef = useRef(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recentFoods = getRecentFoods();

  useEffect(() => {
    if (open) {
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
      toast.success(`${food.name || food.food_name || 'Food'} opened for review.`);
    } catch {
      toast.error('Could not open food.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAI();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="flex flex-col max-h-[85dvh] pb-[env(safe-area-inset-bottom,0px)] focus:outline-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div>
            <p className="text-[16px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">Quick log</p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">
              Capture the meal first, then review it in Atlas.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--fg-3))]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4 overflow-y-auto">
          {/* AI text input */}
          <div className="rounded-[16px] border border-[hsl(var(--brand-ai)/0.16)] bg-[hsl(var(--brand-ai)/0.04)] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ai))]">
              Fast capture
            </p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
              Describe what you ate in one line. Atlas will open the structured review step next.
            </p>
          </div>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I had 2 eggs and a coffee..."
              rows={2}
              className="w-full resize-none rounded-[12px] bg-[hsl(var(--fill)/0.5)] border border-[hsl(var(--border))] px-4 py-3 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand))] focus:ring-0 focus:outline-none transition-colors duration-100"
            />
            {text.trim() && (
              <button
                onClick={handleSubmitAI}
                disabled={submitting}
                className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center disabled:opacity-50"
              >
                <span className="text-white text-[12px] font-bold">↑</span>
              </button>
            )}
          </div>

          {/* Recent food chips */}
          {recentFoods.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-2">
                Recent
              </p>
              <div className="flex flex-wrap gap-2">
                {recentFoods.slice(0, 6).map((food, i) => (
                  <button
                    key={food.id || i}
                    onClick={() => handleRecentTap(food)}
                    className="px-3 py-1.5 rounded-full bg-[hsl(var(--fill)/0.5)] border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg-2))] active:scale-[0.95] transition-transform duration-100"
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
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[12px] bg-[hsl(var(--fill)/0.5)] border border-[hsl(var(--border))] text-[13px] font-semibold text-[hsl(var(--fg-2))] active:scale-[0.97] transition-transform duration-100"
              >
                <Camera className="w-4 h-4" strokeWidth={2} />
                Scan photo
              </button>
            )}
            {onOpenSearch && (
              <button
                onClick={() => { onOpenSearch(); onOpenChange(false); }}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[12px] bg-[hsl(var(--fill)/0.5)] border border-[hsl(var(--border))] text-[13px] font-semibold text-[hsl(var(--fg-2))] active:scale-[0.97] transition-transform duration-100"
              >
                <Search className="w-4 h-4" strokeWidth={2} />
                Search foods
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
