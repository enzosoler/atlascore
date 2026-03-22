import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import substances from '@/lib/substances_seed.json';
import { cn } from '@/lib/utils';

const SUGGESTION_LIMIT = 8;
const DEFAULT_SUGGESTIONS = substances.slice(0, 6);

function matchesSubstance(item, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    item.canonical_name,
    ...(Array.isArray(item.aliases) ? item.aliases : []),
    item.category,
    item.common_frequency_reference,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export default function SubstancePicker({
  value = '',
  onChange,
  onSelect,
  className = '',
}) {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const suggestions = useMemo(() => {
    const source = query.trim() ? substances.filter((item) => matchesSubstance(item, query)) : DEFAULT_SUGGESTIONS;
    return source.slice(0, SUGGESTION_LIMIT);
  }, [query]);

  const handleInputChange = (nextValue) => {
    setQuery(nextValue);
    onChange?.(nextValue);
  };

  const handleSelect = (item) => {
    setQuery(item.canonical_name);
    onChange?.(item.canonical_name);
    onSelect?.(item);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label htmlFor="protocol-substance-picker" className="text-[12px] font-semibold text-[hsl(var(--fg))]">
        Main substance
      </label>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
        <input
          id="protocol-substance-picker"
          type="text"
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder="E.g.: Testosterone Cypionate, Creatine, Vitamin D3"
          className="atlas-field h-12 pl-11 pr-4 text-base"
        />
      </div>

      <div className="rounded-[22px] border border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.72)_0%,hsl(var(--card))_100%)] p-3 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-2 pb-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={1.9} />
          <p className="text-[12px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            Clinical suggestions
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((item) => (
            <button
              key={item.canonical_name}
              type="button"
              onClick={() => handleSelect(item)}
              className="rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card))] px-3 py-3 text-left transition-all duration-200 hover:border-[hsl(var(--brand)/0.24)] hover:bg-[hsl(var(--fill)/0.68)]"
            >
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.canonical_name}</p>
              <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
                {item.category} · {item.common_frequency_reference || 'No reference'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
