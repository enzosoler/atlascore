/**
 * /app/v3/body — composition dashboard.
 * Wraps S14_Body_Dashboard with real measurement data.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { useNavigate } from 'react-router-dom';
import { listMeasurements } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import S14_Body_Dashboard from '../screens/S14_Body_Dashboard.jsx';

function formatSignedDelta(delta, unit = '', stableLabel = 'Stable') {
  if (!Number.isFinite(delta) || delta === 0) return stableLabel;
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
  const t = useT();
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
  const stableLabel = t('body.dashboard.stable');
  const trendChip = latestWeight != null && previousWeight != null
    ? t('body.dashboard.deltaLatest', { delta: formatSignedDelta(latestWeight - previousWeight, 'kg', stableLabel) })
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
      l: t('body.dashboard.bodyFat'),
      v: latestBodyFat != null ? latestBodyFat.toFixed(1) : '—',
      u: latestBodyFat != null ? '%' : '',
      d: latestBodyFat != null && previousBodyFat != null ? formatSignedDelta(latestBodyFat - previousBodyFat, '%', stableLabel) : '',
    },
    {
      l: t('body.dashboard.leanMass'),
      v: latestLeanMass != null ? latestLeanMass.toFixed(1) : '—',
      u: latestLeanMass != null ? 'kg' : '',
      d: latestLeanMass != null && previousLeanMass != null ? formatSignedDelta(latestLeanMass - previousLeanMass, 'kg', stableLabel) : '',
    },
    {
      l: t('body.dashboard.waistHip'),
      v: latestRatio != null ? latestRatio.toFixed(2) : '—',
      u: '',
      d: latestRatio != null && previousRatio != null ? formatSignedDelta(latestRatio - previousRatio, '', stableLabel) : '',
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
    { l: t('body.dashboard.chest'), v: latestChest != null ? latestChest.toFixed(1) : '—', u: latestChest != null ? 'cm' : '', d: latestChest != null && previousChest != null ? formatSignedDelta(latestChest - previousChest, 'cm', stableLabel) : '' },
    { l: t('body.dashboard.waist'), v: latestWaist != null ? latestWaist.toFixed(1) : '—', u: latestWaist != null ? 'cm' : '', d: latestWaist != null && previousWaist != null ? formatSignedDelta(latestWaist - previousWaist, 'cm', stableLabel) : '' },
    { l: t('body.dashboard.hips'),  v: latestHips != null ? latestHips.toFixed(1) : '—', u: latestHips != null ? 'cm' : '', d: latestHips != null && previousHips != null ? formatSignedDelta(latestHips - previousHips, 'cm', stableLabel) : '' },
    { l: t('body.dashboard.arm'),   v: latestArm != null ? latestArm.toFixed(1) : '—', u: latestArm != null ? 'cm' : '', d: latestArm != null && previousArm != null ? formatSignedDelta(latestArm - previousArm, 'cm', stableLabel) : '' },
    { l: t('body.dashboard.thigh'), v: latestThigh != null ? latestThigh.toFixed(1) : '—', u: latestThigh != null ? 'cm' : '', d: latestThigh != null && previousThigh != null ? formatSignedDelta(latestThigh - previousThigh, 'cm', stableLabel) : '' },
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
          ? `${avgWeight ? t('body.dashboard.avgWeight', { avg: avgWeight }) : t('body.dashboard.recentWeight')} · ${measurements.length === 1 ? t('body.dashboard.checkpoints', { count: measurements.length }) : t('body.dashboard.checkpointsPlural', { count: measurements.length })}`
          : t('body.dashboard.firstCheckpointHint'),
        trend: weightSeries.length > 1 ? weightSeries : undefined,
      }}
      composition={composition}
      measurements={measurementRows}
      measurementsLabel={latest ? t('body.dashboard.measurementsWithCount', { count: measurements.length }) : t('body.dashboard.measurementsLabel')}
      measurementsActionLabel={latest ? t('body.dashboard.logCheckpoint') : t('body.dashboard.startLogging')}
      emptyTitle={!latest ? t('body.dashboard.emptyTitle') : undefined}
      emptyDescription={!latest ? t('body.dashboard.emptyDescription') : undefined}
      labs={[]}
      onOpenMeasurements={() => navigate('/app/body/measurements')}
      onOpenLabs={() => navigate('/app/labs')}
      onOpenWeight={() => navigate('/app/body/weight/trend')}
      onOpenSleep={() => navigate('/app/sleep')}
      onOpenPhotos={() => navigate('/app/body/progress/photos')}
    />
  );
}
