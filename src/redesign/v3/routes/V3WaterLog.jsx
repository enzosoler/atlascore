import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { loadLocalProfile, saveLocalProfile } from '@/lib/profileUtils';
import { getDailyCheckin, upsertDailyCheckin } from '@/services/checkinService';
import S53_Water_Log from '../screens/S53_Water_Log.jsx';

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hydrationStorageKey(userId, date) {
  return `atlas.water-log.${userId || 'anon'}.${date}`;
}

function readEntries(userId, date) {
  try {
    const raw = localStorage.getItem(hydrationStorageKey(userId, date));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(userId, date, entries) {
  try {
    localStorage.setItem(hydrationStorageKey(userId, date), JSON.stringify(entries));
  } catch {}
}

function litersToMl(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 1000);
}

function mlToLiters(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric) / 1000;
}

export default function V3WaterLog() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const date = todayKey();
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: checkin } = useQuery({
    queryKey: ['v3-water-log-checkin', user?.id, date],
    queryFn: () => getDailyCheckin(user.id, date),
    enabled: !!user?.id,
  });

  const { data: profileData } = useQuery({
    queryKey: ['v3-water-log-profile', user?.id],
    queryFn: () => loadLocalProfile(user),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;
    const stored = readEntries(user.id, date);
    if (stored.length > 0) {
      setEntries(stored);
      return;
    }

    const hydratedMl = litersToMl(checkin?.hydration_liters);
    if (hydratedMl > 0) {
      const seeded = [{
        id: `seed-${date}`,
        ml: hydratedMl,
        createdAt: `${date}T08:00:00`,
      }];
      setEntries(seeded);
      writeEntries(user.id, date, seeded);
      return;
    }

    setEntries([]);
  }, [checkin?.hydration_liters, date, user?.id]);

  const target = useMemo(() => {
    const profileTargetMl = litersToMl(profileData?.water_target);
    return profileTargetMl > 0 ? profileTargetMl : 2500;
  }, [profileData?.water_target]);

  async function persist(nextEntries) {
    if (!user?.id) {
      toast.error('You need to be signed in to log water');
      return;
    }

    const totalMl = nextEntries.reduce((sum, entry) => sum + Number(entry?.ml || 0), 0);
    setEntries(nextEntries);
    writeEntries(user.id, date, nextEntries);
    setSaving(true);
    try {
      await upsertDailyCheckin(user.id, {
        date,
        hydration_liters: mlToLiters(totalMl),
      });
    } catch (error) {
      toast.error('Could not save hydration', {
        description: error?.message || 'Try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(ml) {
    const amount = Number(ml);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const nextEntries = [
      ...entries,
      {
        id: `${Date.now()}-${amount}`,
        ml: amount,
        createdAt: new Date().toISOString(),
      },
    ];
    await persist(nextEntries);
  }

  async function handleUndo() {
    if (entries.length === 0) return;
    const nextEntries = entries.slice(0, -1);
    await persist(nextEntries);
  }

  async function handleEditTarget(nextTargetMl) {
    if (!user?.id) return;
    try {
      await saveLocalProfile(user, user?.id, {
        ...(profileData || {}),
        water_target: mlToLiters(nextTargetMl),
      });
      toast.success('Hydration target updated');
    } catch (error) {
      toast.error('Could not update target', {
        description: error?.message || 'Try again.',
      });
    }
  }

  return (
    <S53_Water_Log
      dark={theme === 'dark'}
      entries={entries}
      target={target}
      onAdd={handleAdd}
      onUndo={handleUndo}
      onEditTarget={handleEditTarget}
      onBack={() => navigate(-1)}
      showTabBar={false}
      saving={saving}
    />
  );
}
