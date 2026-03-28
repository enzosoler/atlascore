import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight, Dumbbell, UtensilsCrossed, TrendingUp, Zap } from 'lucide-react';

const TYPE_META = {
  workout:   { icon: Dumbbell,        label: 'Training',  color: 'brand' },
  nutrition: { icon: UtensilsCrossed, label: 'Nutrition', color: 'brand' },
  recovery:  { icon: TrendingUp,      label: 'Recovery',  color: 'ok' },
  habit:     { icon: Zap,             label: 'Habit',     color: 'warn' },
};

const COLOR_CLASSES = {
  brand: {
    pill:   'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.15)]',
    icon:   'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
    action: 'bg-[hsl(var(--brand))] text-white',
  },
  ok: {
    pill:   'bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))] border-[hsl(var(--ok)/0.15)]',
    icon:   'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
    action: 'bg-[hsl(var(--ok))] text-white',
  },
  warn: {
    pill:   'bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))] border-[hsl(var(--warn)/0.15)]',
    icon:   'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
    action: 'bg-[hsl(var(--warn))] text-white',
  },
};

function RecCard({ rec, onDismiss, onFollow }) {
  const meta = TYPE_META[rec.type] || TYPE_META.habit;
  const Icon = meta.icon;
  const cc = COLOR_CLASSES[meta.color];

  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.35)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-[8px] flex items-center justify-center ${cc.icon}`}>
            <Icon className="w-3 h-3" strokeWidth={2} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-[6px] border ${cc.pill}`}>
            {meta.label}
          </span>
        </div>
        <button
          onClick={() => onDismiss(rec.id)}
          className="w-6 h-6 flex items-center justify-center text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <p className="text-[14px] font-semibold text-[hsl(var(--fg))] leading-snug mb-1.5">
        {rec.title}
      </p>
      {rec.reason && (
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-[1.5] mb-3">
          {rec.reason}
        </p>
      )}

      {/* Action */}
      {rec.actionPath && (
        <Link
          to={rec.actionPath}
          onClick={() => onFollow?.(rec)}
          className={`flex items-center justify-center gap-1.5 h-9 w-full rounded-[11px] text-[13px] font-semibold transition-opacity hover:opacity-85 active:opacity-70 ${cc.action}`}
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          {rec.actionLabel || 'Do this'}
          <ArrowRight className="w-3 h-3 shrink-0" />
        </Link>
      )}
    </div>
  );
}

/**
 * AIRecommendations — max 3 cards, each dismissible.
 * Hides section when all dismissed or empty.
 * High signal only — caller is responsible for filtering low-confidence recs.
 */
export function AIRecommendations({ recommendations, onFollow, onDismiss: onDismissCallback }) {
  const [dismissed, setDismissed] = useState(new Set());
  const recs = Array.isArray(recommendations) ? recommendations : [];

  const visible = recs
    .filter((r) => !dismissed.has(r.id))
    .slice(0, 3);

  if (!visible.length) return null;

  const dismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
    const rec = recs.find((r) => r.id === id);
    if (rec) onDismissCallback?.(rec);
  };

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2 px-0.5">
        <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
          For you
        </p>
      </div>
      <div className="space-y-2.5">
        {visible.map((rec) => (
          <RecCard key={rec.id} rec={rec} onDismiss={dismiss} onFollow={onFollow} />
        ))}
      </div>
    </section>
  );
}
