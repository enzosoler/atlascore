/**
 * Atlas Core — runtime design tokens
 * Used for dynamic className strings (Tailwind can't purge dynamic concatenations).
 * All badge class names MUST exist in index.css.
 */

// Macro nutrition colors — hex only, used in recharts/SVG
export const MACRO_COLORS = {
  protein: '#3b82f6',  /* brand blue */
  carbs:   '#8b5cf6',  /* purple */
  fat:     '#f59e0b',  /* amber */
  fiber:   '#10b981',  /* emerald */
};

// Authorship badge — maps to classes that exist in index.css
export const AUTHOR = {
  ai:           { label: 'Atlas AI',  cls: 'badge badge-ai' },
  coach:        { label: 'Coach',     cls: 'badge badge-blue' },
  user:         { label: 'You',       cls: 'badge badge-neutral' },
  prescription: { label: 'Prescribed', cls: 'badge badge-ok' },
};

// Plan status badge
export const PLAN_STATUS = {
  active:   { label: 'Active',   cls: 'badge badge-ok' },
  archived: { label: 'Archived', cls: 'badge badge-neutral' },
  draft:    { label: 'Draft',    cls: 'badge badge-warn' },
};
