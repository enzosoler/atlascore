import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { listMeasurements } from '@/services/bodyProgressService';
import S56_Composition_History from '../screens/S56_Composition_History.jsx';

function computeStats(entries) {
  if (!entries || entries.length === 0) {
    return { totalChange: null, weeklyAvg: null, bestStreak: null, lastLogDate: null };
  }

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const latest = sorted[sorted.length - 1];
  const oldest = sorted[0];
  const totalChange =
    latest?.weight != null && oldest?.weight != null
      ? parseFloat((latest.weight - oldest.weight).toFixed(1))
      : null;

  // Weekly average change (per week over the full window)
  const daySpan = (new Date(latest.date) - new Date(oldest.date)) / 86400000;
  const weeks = daySpan / 7 || 1;
  const weeklyAvg =
    totalChange != null && daySpan > 0
      ? parseFloat((totalChange / weeks).toFixed(2))
      : null;

  // Best logging streak (consecutive calendar days)
  const dateKeys = new Set(sorted.map((e) => e.date?.slice(0, 10)).filter(Boolean));
  let bestStreak = 0;
  let streak = 0;
  let prev = null;
  for (const dk of [...dateKeys].sort()) {
    if (prev) {
      const diff = (new Date(dk) - new Date(prev)) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    bestStreak = Math.max(bestStreak, streak);
    prev = dk;
  }

  const lastLogDate = latest?.date?.slice(0, 10) || null;

  return { totalChange, weeklyAvg, bestStreak, lastLogDate };
}

function computeCurrent(entries) {
  if (!entries || entries.length === 0) return undefined;

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];

  // Find entry from ~7 days ago for the delta
  const weekAgo = new Date(new Date(latest.date) - 7 * 86400000).toISOString().slice(0, 10);
  const weekEntry = sorted.find((e) => e.date?.slice(0, 10) <= weekAgo);

  const weightDelta =
    latest?.weight != null && weekEntry?.weight != null
      ? parseFloat((latest.weight - weekEntry.weight).toFixed(1))
      : null;

  const bfDelta =
    latest?.body_fat != null && weekEntry?.body_fat != null
      ? parseFloat((latest.body_fat - weekEntry.body_fat).toFixed(1))
      : null;

  return {
    weight: latest.weight ?? null,
    bodyFatPct: latest.body_fat ?? null,
    weightDelta,
    bfDelta,
  };
}

export default function V3CompositionHistory() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [rawEntries, setRawEntries] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    listMeasurements(user.id, 60)
      .then((data) => setRawEntries(data))
      .catch((err) => setLoadError(err));
  }, [user?.id]);

  // Map service entries to the shape S56 expects
  const history = useMemo(() => {
    if (!rawEntries) return undefined; // undefined = show demo while loading
    return rawEntries.map((e) => ({
      id: e.id,
      date: e.date,
      weight: e.weight ?? null,
      bodyFatPct: e.body_fat ?? null,
    }));
  }, [rawEntries]);

  const current = useMemo(() => computeCurrent(rawEntries), [rawEntries]);
  const stats = useMemo(() => computeStats(rawEntries), [rawEntries]);

  return (
    <S56_Composition_History
      dark={theme === 'dark'}
      history={history}
      current={current}
      stats={stats}
      onLogWeight={() => navigate('/app/body/weight')}
      onOpenEntry={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
