/** Tiny classNames utility — avoids runtime cost of clsx + twMerge chain. */
export function cn(...args) {
  const out = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === 'string' || typeof a === 'number') out.push(a);
    else if (Array.isArray(a)) out.push(cn(...a));
    else if (typeof a === 'object') {
      for (const k in a) if (a[k]) out.push(k);
    }
  }
  return out.join(' ');
}

/** Build variant className maps with defaults. cva-style, no dependency. */
export function variants(config) {
  const { base = '', variants: v = {}, defaultVariants = {}, compound = [] } = config;
  return (props = {}) => {
    const classes = [base];
    const resolved = { ...defaultVariants, ...props };
    for (const key of Object.keys(v)) {
      const val = resolved[key];
      if (val && v[key][val]) classes.push(v[key][val]);
    }
    for (const c of compound) {
      const match = Object.entries(c.when).every(([k, val]) => resolved[k] === val);
      if (match) classes.push(c.class);
    }
    if (props.className) classes.push(props.className);
    return classes.filter(Boolean).join(' ');
  };
}
