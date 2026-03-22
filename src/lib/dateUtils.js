/**
 * Atlas Core — centralized date helpers
 * Standard output: "March 19" / "Thursday, March 19"
 * Components should import from here instead of formatting inline.
 */

const EN_US = 'en-US';

/**
 * Formats a date like "March 19, 2026"
 * @param {Date|string} date
 */
export function formatDateLong(date) {
  const d = toDate(date);
  return d.toLocaleDateString(EN_US, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Formats a date like "March 19"
 * @param {Date|string} date
 */
export function formatDateShort(date) {
  const d = toDate(date);
  return d.toLocaleDateString(EN_US, { day: 'numeric', month: 'long' });
}

/**
 * Formats a date like "Thursday, March 19"
 * @param {Date|string} date
 */
export function formatDateWithWeekday(date) {
  const d = toDate(date);
  const weekday = d.toLocaleDateString(EN_US, { weekday: 'long' });
  const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
  const day = d.getDate();
  const month = d.toLocaleDateString(EN_US, { month: 'long' });
  return `${weekdayCapitalized}, ${month} ${day}`;
}

/**
 * Formats a date like "Thu Mar 19"
 * @param {Date|string} date
 */
export function formatDateAbbr(date) {
  const d = toDate(date);
  return d.toLocaleDateString(EN_US, { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(/,/, '');
}

/**
 * Formats a date like "3/19/2026"
 * @param {Date|string} date
 */
export function formatDateBR(date) {
  const d = toDate(date);
  return d.toLocaleDateString(EN_US);
}

/**
 * Formats as "03/19" (month/day without year)
 * @param {Date|string} date
 */
export function formatDateDayMonth(date) {
  const d = toDate(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * Formats time like "2:30 PM"
 * @param {Date|string} date
 */
export function formatTime(date) {
  const d = toDate(date);
  return d.toLocaleTimeString(EN_US, { hour: 'numeric', minute: '2-digit' });
}

/**
 * Returns "Today", "Yesterday", or the formatted date
 * @param {Date|string} date
 */
export function formatRelativeDate(date) {
  const d = toDate(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return formatDateShort(d);
}

/**
 * Retorna a data atual no formato YYYY-MM-DD
 */
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// ── helpers internos ──────────────────────────────────────

/**
 * Converts YYYY-MM-DD strings or Date values to Date while avoiding timezone shift
 */
function toDate(date) {
  if (date instanceof Date) return date;
  if (typeof date === 'string') {
    // YYYY-MM-DD: add T12:00 to avoid timezone conversion drift
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Date(`${date}T12:00:00`);
    return new Date(date);
  }
  return new Date(date);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
