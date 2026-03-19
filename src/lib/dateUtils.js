/**
 * Atlas Core — Utilitário Centralizado de Datas
 * Padrão: "19 de março" / "Quinta-feira, 19 de março"
 * Todos os componentes devem importar daqui em vez de criar formatação inline.
 */

const PT_BR = 'pt-BR';

/**
 * Formata data como "19 de março de 2026" (completo com ano)
 * @param {Date|string} date
 */
export function formatDateLong(date) {
  const d = toDate(date);
  return d.toLocaleDateString(PT_BR, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Formata data como "19 de março" (sem ano)
 * @param {Date|string} date
 */
export function formatDateShort(date) {
  const d = toDate(date);
  return d.toLocaleDateString(PT_BR, { day: 'numeric', month: 'long' });
}

/**
 * Formata data como "Quinta-feira, 19 de março"
 * (primeira letra do dia da semana em maiúsculo, restante em minúsculo)
 * @param {Date|string} date
 */
export function formatDateWithWeekday(date) {
  const d = toDate(date);
  const weekday = d.toLocaleDateString(PT_BR, { weekday: 'long' });
  const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
  const day = d.getDate();
  const month = d.toLocaleDateString(PT_BR, { month: 'long' });
  return `${weekdayCapitalized}, ${day} de ${month}`;
}

/**
 * Formata data como "Qui, 19 mar" (abreviado)
 * @param {Date|string} date
 */
export function formatDateAbbr(date) {
  const d = toDate(date);
  return d.toLocaleDateString(PT_BR, { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(/,/, '');
}

/**
 * Formata como "19/03/2026" (formato BR padrão)
 * @param {Date|string} date
 */
export function formatDateBR(date) {
  const d = toDate(date);
  return d.toLocaleDateString(PT_BR);
}

/**
 * Formata como "19/03" (dia e mês sem ano)
 * @param {Date|string} date
 */
export function formatDateDayMonth(date) {
  const d = toDate(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

/**
 * Formata hora como "14:30"
 * @param {Date|string} date
 */
export function formatTime(date) {
  const d = toDate(date);
  return d.toLocaleTimeString(PT_BR, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Retorna "Hoje", "Ontem" ou a data formatada
 * @param {Date|string} date
 */
export function formatRelativeDate(date) {
  const d = toDate(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(d, today)) return 'Hoje';
  if (isSameDay(d, yesterday)) return 'Ontem';
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
 * Converte string YYYY-MM-DD ou Date para objeto Date, evitando timezone shift
 */
function toDate(date) {
  if (date instanceof Date) return date;
  if (typeof date === 'string') {
    // YYYY-MM-DD: adiciona T12:00 para evitar conversão de timezone
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
