// Atlas Core — domain constants and utilities
// Colors removed: use CSS tokens (--brand, --brand-ai, --ok, --warn, --err) directly

export const MEAL_TYPES = {
  breakfast:       { label: 'Breakfast' },
  morning_snack:   { label: 'Morning snack' },
  lunch:           { label: 'Lunch' },
  afternoon_snack: { label: 'Afternoon snack' },
  dinner:          { label: 'Dinner' },
  evening_snack:   { label: 'Evening snack' },
  pre_workout:     { label: 'Pre-workout' },
  post_workout:    { label: 'Post-workout' },
};

export const WORKOUT_TYPES = {
  strength:    { label: 'Strength' },
  cardio:      { label: 'Cardio' },
  hiit:        { label: 'HIIT' },
  flexibility: { label: 'Flexibility' },
  sport:       { label: 'Sport' },
  other:       { label: 'Other' },
};

export const formatDate = (date) => {
  if (!date) return '';
  const loc = (typeof localStorage !== 'undefined' && localStorage.getItem('atlas_locale')) || 'en';
  const intlLoc = loc === 'pt-BR' ? 'pt-BR' : 'en-US';
  return new Date(date + 'T12:00').toLocaleDateString(intlLoc, { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getGreeting = (locale) => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};
