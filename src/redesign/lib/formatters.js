/** Formatting helpers — keep all number/date/unit display consistent. */

export const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString());
export const fmtDec = (n, d = 1) => (n == null ? '—' : n.toFixed(d));
export const fmtKg  = (n) => (n == null ? '—' : `${fmtDec(n, 1)} kg`);
export const fmtLb  = (n) => (n == null ? '—' : `${fmtDec(n, 1)} lb`);
export const fmtKcal = (n) => (n == null ? '—' : `${fmtInt(n)} kcal`);
export const fmtMacroG = (n) => (n == null ? '—' : `${fmtInt(n)} g`);
export const fmtPct = (n) => (n == null ? '—' : `${fmtInt(n)}%`);

export const fmtDuration = (seconds) => {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const fmtShortDate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const fmtRelDay = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const today = new Date();
  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  if (diff > -7 && diff < 0) return `${Math.abs(diff)}d ago`;
  return fmtShortDate(date);
};

/** Confidence → readable band. For AI meal analysis etc. */
export const confidenceBand = (c /* 0..1 */) => {
  if (c == null) return { label: '—', tone: 'muted' };
  if (c >= 0.85) return { label: 'High confidence', tone: 'success' };
  if (c >= 0.6)  return { label: 'Moderate confidence', tone: 'info' };
  return { label: 'Low confidence — please review', tone: 'warning' };
};

/** Readiness score → color band + copy. Whoop/Oura-ish. */
export const readinessBand = (score /* 0..100 */) => {
  if (score == null) return { label: '—', color: 'rd-fg-muted' };
  if (score >= 80) return { label: 'Primed',     color: 'rd-health-excellent' };
  if (score >= 60) return { label: 'Ready',      color: 'rd-health-good' };
  if (score >= 40) return { label: 'Moderate',   color: 'rd-health-moderate' };
  return             { label: 'Recover',         color: 'rd-health-low' };
};
