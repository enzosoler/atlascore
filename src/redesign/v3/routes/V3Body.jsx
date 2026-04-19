/**
 * /app/v3/body — composition dashboard.
 * Wraps S14_Body_Dashboard with real measurement data.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { listMeasurements } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import S14_Body_Dashboard from '../screens/S14_Body_Dashboard.jsx';

function formatSignedDelta(delta, unit = '') {
  if (!Number.isFinite(delta) || delta === 0) return 'Stable';
  const arrow = delta > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(delta).toFixed(1)}${unit ? ` ${unit}` : ''}`;
}

function getFirstNumeric(entry, keys) {
  for (const key of keys) {
    const value = getMeasurementFieldValue(entry, key);
    if (value != null) return value;
  }
  return null;
}

function avgTwo(a, b) {
  const nums = [a, b].filter((v) => Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

export default function V3Body() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: measurements = [] } = useQuery({
    queryKey: ['v3-body-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 60),
    enabled: !!user?.id,
  });

  const latest = measurements[0] || null;
  const previous = measurements[1] || null;
  const weightSeries = measurements
    .map((entry) => getMeasurementFieldValue(entry, 'weight'))
    .filter((value) => value != null)
    .slice(0, 14)
    .reverse();

  const latestWeight = getMeasurementFieldValue(latest, 'weight');
  const previousWeight = getMeasurementFieldValue(previous, 'weight');
  const trendChip = latestWeight != null && previousWeight != null
    ? `${formatSignedDelta(latestWeight - previousWeight, 'kg')} · latest`
    : '';

  const avgWeight = weightSeries.length > 0
    ? (weightSeries.reduce((sum, value) => sum + value, 0) / weightSeries.length).toFixed(1)
    : null;

  const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
  const previousBodyFat = getMeasurementFieldValue(previous, 'body_fat_percent');
  const latestLeanMass = getMeasurementFieldValue(latest, 'lean_mass');
  const previousLeanMass = getMeasurementFieldValue(previous, 'lean_mass');
  const latestWaist = getMeasurementFieldValue(latest, 'waist');
  const latestHips = getMeasurementFieldValue(latest, 'hips');
  const previousWaist = getMeasurementFieldValue(previous, 'waist');
  const previousHips = getMeasurementFieldValue(previous, 'hips');
  const latestRatio = latestWaist != null && latestHips ? latestWaist / latestHips : null;
  const previousRatio = previousWaist != null && previousHips ? previousWaist / previousHips : null;

  const composition = [
    {
      l: 'Body fat',
      v: latestBodyFat != null ? latestBodyFat.toFixed(1) : '—',
      u: latestBodyFat != null ? '%' : '',
      d: latestBodyFat != null && previousBodyFat != null ? formatSignedDelta(latestBodyFat - previousBodyFat, '%') : '',
    },
    {
      l: 'Lean mass',
      v: latestLeanMass != null ? latestLeanMass.toFixed(1) : '—',
      u: latestLeanMass != null ? 'kg' : '',
      d: latestLeanMass != null && previousLeanMass != null ? formatSignedDelta(latestLeanMass - previousLeanMass, 'kg') : '',
    },
    {
      l: 'Waist:hip',
      v: latestRatio != null ? latestRatio.toFixed(2) : '—',
      u: '',
      d: latestRatio != null && previousRatio != null ? formatSignedDelta(latestRatio - previousRatio) : '',
    },
  ];

  const latestChest = getFirstNumeric(latest, ['thorax', 'chest']);
  const previousChest = getFirstNumeric(previous, ['thorax', 'chest']);
  const latestArm = avgTwo(getMeasurementFieldValue(latest, 'biceps_left'), getMeasurementFieldValue(latest, 'biceps_right'))
    ?? getMeasurementFieldValue(latest, 'arms');
  const previousArm = avgTwo(getMeasurementFieldValue(previous, 'biceps_left'), getMeasurementFieldValue(previous, 'biceps_right'))
    ?? getMeasurementFieldValue(previous, 'arms');
  const latestThigh = avgTwo(getMeasurementFieldValue(latest, 'thigh_left'), getMeasurementFieldValue(latest, 'thigh_right'))
    ?? getMeasurementFieldValue(latest, 'thighs');
  const previousThigh = avgTwo(getMeasurementFieldValue(previous, 'thigh_left'), getMeasurementFieldValue(previous, 'thigh_right'))
    ?? getMeasurementFieldValue(previous, 'thighs');

  const measurementRows = latest ? [
    { l: 'Chest', v: latestChest != null ? latestChest.toFixed(1) : '—', u: latestChest != null ? 'cm' : '', d: latestChest != null && previousChest != null ? formatSignedDelta(latestChest - previousChest, 'cm') : '' },
    { l: 'Waist', v: latestWaist != null ? latestWaist.toFixed(1) : '—', u: latestWaist != null ? 'cm' : '', d: latestWaist != null && previousWaist != null ? formatSignedDelta(latestWaist - previousWaist, 'cm') : '' },
    { l: 'Hips',  v: latestHips != null ? latestHips.toFixed(1) : '—', u: latestHips != null ? 'cm' : '', d: latestHips != null && previousHips != null ? formatSignedDelta(latestHips - previousHips, 'cm') : '' },
    { l: 'Arm',   v: latestArm != null ? latestArm.toFixed(1) : '—', u: latestArm != null ? 'cm' : '', d: latestArm != null && previousArm != null ? formatSignedDelta(latestArm - previousArm, 'cm') : '' },
    { l: 'Thigh', v: latestThigh != null ? latestThigh.toFixed(1) : '—', u: latestThigh != null ? 'cm' : '', d: latestThigh != null && previousThigh != null ? formatSignedDelta(latestThigh - previousThigh, 'cm') : '' },
  ] : [];

  return (
    <S14_Body_Dashboard
      dark={theme === 'dark'}
      showTabBar={false}
      trendChip={trendChip}
      hero={{
        weight: latestWeight != null ? latestWeight.toFixed(1) : '—',
        unit: latestWeight != null ? 'kg' : '',
        subtitle: latestWeight != null
          ? `${avgWeight ? `Avg ${avgWeight} kg` : 'Recent weight'} · ${measurements.length} checkpoint${measurements.length === 1 ? '' : 's'}`
          : 'Log your first checkpoint to unlock body trends',
        trend: weightSeries.length > 1 ? weightSeries : undefined,
      }}
      composition={composition}
      measurements={measurementRows}
      measurementsLabel={latest ? `Measurements · ${measurements.length} checkpoints` : 'Measurements'}
      measurementsActionLabel={latest ? '+ Log checkpoint' : 'Start logging'}
      emptyTitle={!latest ? 'No checkpoints yet' : undefined}
      emptyDescription={!latest ? 'Log weight, waist, and other body checkpoints to turn this screen into a real trend view.' : undefined}
      labs={[]}
      onOpenMeasurements={() => navigate('/app/body/measurements')}
      onOpenLabs={() => navigate('/app/labs')}
    />
  );
}
