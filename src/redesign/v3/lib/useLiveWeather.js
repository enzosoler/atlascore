/**
 * useLiveWeather — fetches real local weather via browser geolocation +
 * Open-Meteo (free, no API key, ~50 KB response). Honest behavior:
 *  - If geolocation permission denied or unavailable → returns null (no chip)
 *  - If fetch fails → returns null
 *  - Caches the last successful fetch in sessionStorage for 30 min so the
 *    chip doesn't flicker on re-renders / route changes
 *
 * Copied from the equivalent v2 hook defined inline in src/App.jsx. Lives here
 * so v3 routes don't reach across layers; shape is identical:
 *   { tempC: number, condition: 'clear'|'cloudy'|'fog'|'rain'|'snow'|'storm' }
 */
import { useEffect, useState } from 'react';

/** Map WMO weather codes to broad conditions the screen understands. */
function wmoCodeToCondition(code) {
  if (code == null) return 'clear';
  if (code === 0) return 'clear';
  if (code <= 3)  return 'cloudy';
  if (code <= 49) return 'fog';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 99) return 'storm';
  return 'clear';
}

export function useLiveWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const cached = sessionStorage.getItem('atlas.weather.v1');
      if (cached) {
        const { value, ts } = JSON.parse(cached);
        if (Date.now() - ts < 30 * 60 * 1000) { setWeather(value); return; }
      }
    } catch {}
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
        const res = await fetch(url);
        const json = await res.json();
        const tempC = json?.current?.temperature_2m;
        const code  = json?.current?.weather_code;
        if (typeof tempC !== 'number' || cancelled) return;
        const condition = wmoCodeToCondition(code);
        const value = { tempC: Math.round(tempC), condition };
        try { sessionStorage.setItem('atlas.weather.v1', JSON.stringify({ value, ts: Date.now() })); } catch {}
        setWeather(value);
      } catch { /* honest silent failure → no chip */ }
    }, () => { /* permission denied → leave null */ }, { timeout: 5000, maximumAge: 30 * 60 * 1000 });
    return () => { cancelled = true; };
  }, []);
  return weather;
}

export default useLiveWeather;
