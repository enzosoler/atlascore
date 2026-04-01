/**
 * ExerciseAutocomplete -- lightweight autocomplete for exercise name inputs.
 *
 * Uses the static EXERCISE_TRANSLATIONS catalog from exerciseDB for instant,
 * offline-first suggestions. Searches both EN and PT names + aliases.
 *
 * Props:
 *   value        - current input value (string)
 *   onChange      - called with new string value on every keystroke
 *   onSelect     - (optional) called with the full exercise entry when a suggestion is picked
 *   placeholder  - input placeholder text
 *   className    - extra classes for the outer wrapper
 *   inputClassName - classes forwarded to the <input>
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { localSearch } from '@/lib/exerciseDB/index.js';
import { EXERCISE_TRANSLATIONS, normalizeStr } from '@/lib/exerciseDB/translations.js';

// Build a flat list once (module-level, never re-computed).
const CATALOG = Object.entries(EXERCISE_TRANSLATIONS).map(([nameEN, entry]) => ({
  canonical_name_en: nameEN,
  canonical_name_pt: entry?.pt || nameEN,
  aliases_en: entry?.aliases_en || [],
  aliases_pt: entry?.aliases_pt || [],
  primary_muscles: entry?.primary_muscles || [],
  equipment: entry?.equipment || '',
  _search: normalizeStr(
    [
      nameEN,
      entry?.pt || '',
      ...(entry?.aliases_en || []),
      ...(entry?.aliases_pt || []),
      ...(entry?.primary_muscles || []),
      entry?.equipment || '',
    ]
      .filter(Boolean)
      .join(' '),
  ),
}));

const MAX_SUGGESTIONS = 6;

export default function ExerciseAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = '',
  className = '',
  inputClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // -- Compute suggestions when value changes --
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const matches = localSearch(CATALOG, value.trim()).slice(0, MAX_SUGGESTIONS);
    setSuggestions(matches);
    setHighlightIdx(-1);
  }, [value]);

  // -- Close dropdown on outside click --
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const pick = useCallback(
    (item) => {
      onChange(item.canonical_name_en);
      onSelect?.(item);
      setOpen(false);
      setSuggestions([]);
    },
    [onChange, onSelect],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!open || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx((i) => (i + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      } else if (e.key === 'Enter' && highlightIdx >= 0) {
        e.preventDefault();
        pick(suggestions[highlightIdx]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, suggestions, highlightIdx, pick],
  );

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-[220px] overflow-y-auto rounded-xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] shadow-lg">
          {suggestions.map((item, idx) => (
            <button
              key={item.canonical_name_en}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus on input
                pick(item);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-[hsl(var(--border-h))] last:border-0 ${
                idx === highlightIdx
                  ? 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--fg))]'
                  : 'text-[hsl(var(--fg))] hover:bg-[hsl(var(--shell))]'
              }`}
            >
              <span className="font-medium">{item.canonical_name_en}</span>
              {item.canonical_name_pt !== item.canonical_name_en && (
                <span className="ml-2 text-xs text-[hsl(var(--fg-2))]">
                  {item.canonical_name_pt}
                </span>
              )}
              {item.primary_muscles.length > 0 && (
                <span className="ml-2 text-[10px] text-[hsl(var(--fg-3))]">
                  {item.primary_muscles[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
