/**
 * /app/body — composition + labs + protocols dashboard.
 *
 * When the 5-tab nav flag is enabled, Labs and Protocols are promoted
 * into this screen as inline sections (not teasers to tap away from).
 * They are always accessible via full-screen routes but the summary
 * lives here so the Body tab is the single health-data hub.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { useNavigate } from 'react-router-dom';
import { listMeasurements } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { listExams, examToPanel } from '@/services/labExamService';
import { listProtocols, getTodayDue } from '@/services/protocolService.js';
import S14_Body_Dashboard from '../screens/S14_Body_Dashboard.jsx';
import { ACFonts, ACRadii, useACT, ACLabel, ACMono, ACNum, ACChip } from '../lib/paper.jsx';

// ── Feature flag check (mirrors V3AppShell) ────────────────────────────────
function isNav5TabEnabled() {
  if (import.meta.env.VITE_FLAG_NAV_5TAB === '1') return true;
  try { return localStorage.getItem('atlas.flag.nav5tab') === '1'; } catch { return false; }
}

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

// ── Labs inline section ────────────────────────────────────────────────────
function LabsSection({ dark, exams, onOpenLabs, onUploadLabs, t }) {
  const c = useACT(dark);

  const markers = React.useMemo(() => {
    const out = [];
    // exams are already shaped by examToPanel: markers have { id, t, v, u, flag, d }
    (exams || []).slice(0, 3).forEach((exam) => {
      (exam.markers || []).slice(0, 3).forEach((marker) => {
        if (out.length < 6) out.push({ ...marker, examDate: exam.date });
      });
    });
    return out;
  }, [exams]);

  // In examToPanel output, flag is 'high' | 'low' | 'ok' (not 'out'/'monitor')
  const attentionCount = markers.filter((m) => m.flag === 'high' || m.flag === 'low').length;

  return (
    <div style={{ marginTop: 22, padding: '18px 18px', background: c.card, borderRadius: ACRadii.card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <ACMono size={9} color={c.accent} style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            {t('labs.section.title') || 'Labs'}
          </ACMono>
          {attentionCount > 0 && (
            <div style={{ marginTop: 2, fontSize: 12, color: c.dim }}>
              {attentionCount} {t('labs.section.needsAttention') || 'needs attention'}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenLabs}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>
            {exams.length > 0 ? (t('labs.section.viewAll') || 'View all') : (t('labs.section.upload') || 'Upload')} →
          </ACLabel>
        </button>
      </div>

      {markers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {markers.map((marker, i) => {
            // examToPanel shapes markers as { t (name), v (value), u (unit), flag ('high'|'low'|'ok') }
            const flagColor = marker.flag === 'high' ? c.accent
              : marker.flag === 'low' ? '#e8a000'
              : c.fg;
            return (
              <div
                key={marker.id || i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 2, background: flagColor, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.fg }}>
                  {marker.t || '—'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 700, color: flagColor }}>
                    {marker.v != null ? String(marker.v) : '—'}
                  </span>
                  {marker.u && (
                    <span style={{ fontSize: 10, color: c.dim, marginLeft: 3 }}>{marker.u}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 13, color: c.dim, lineHeight: 1.5 }}>
            {t('labs.section.empty') || 'Upload a blood panel to track biomarkers here.'}
          </div>
          <button
            type="button"
            onClick={onUploadLabs}
            style={{
              marginTop: 12,
              padding: '10px 18px',
              background: c.fg,
              color: c.bg,
              border: 'none',
              borderRadius: 999,
              fontFamily: ACFonts.body,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('labs.section.uploadCta') || 'Upload labs'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Protocols inline section ───────────────────────────────────────────────
function ProtocolsSection({ dark, protocols, todayDue, onOpenProtocols, onNewProtocol, t }) {
  const c = useACT(dark);
  const todayDueSet = new Set((todayDue || []).map((p) => p.id));
  const dueToday = (protocols || []).filter((p) => todayDueSet.has(p.id));
  const active = (protocols || []).filter((p) => p.status === 'active');

  return (
    <div style={{ marginTop: 10, padding: '18px 18px', background: c.card, borderRadius: ACRadii.card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <ACMono size={9} color={c.accent} style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            {t('protocols.section.title') || 'Protocols'}
          </ACMono>
          {dueToday.length > 0 && (
            <div style={{ marginTop: 2, fontSize: 12, color: c.dim }}>
              {dueToday.length} {t('protocols.section.dueToday') || 'due today'}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenProtocols}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>
            {protocols.length > 0 ? (t('protocols.section.manage') || 'Manage') : (t('protocols.section.add') || 'Add')} →
          </ACLabel>
        </button>
      </div>

      {active.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {active.slice(0, 4).map((protocol, i) => {
            const isDueToday = todayDueSet.has(protocol.id);
            return (
              <div
                key={protocol.id || i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0',
                  borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                  borderBottom: `1px solid ${c.hair}`,
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: isDueToday ? c.accent : c.faint,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>
                    {protocol.name || protocol.substance_name || 'Protocol'}
                  </div>
                  {protocol.dose_amount != null && (
                    <div style={{ fontSize: 11, color: c.dim, marginTop: 1 }}>
                      {[protocol.dose_amount, protocol.dose_unit].filter(Boolean).join(' ')}
                    </div>
                  )}
                </div>
                {isDueToday && (
                  <ACChip accent dark={dark} style={{ fontSize: 9, padding: '3px 7px' }}>
                    {t('protocols.section.today') || 'today'}
                  </ACChip>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 13, color: c.dim, lineHeight: 1.5 }}>
            {t('protocols.section.empty') || 'Track supplements, medications, or any protocol here.'}
          </div>
          <button
            type="button"
            onClick={onNewProtocol}
            style={{
              marginTop: 12,
              padding: '10px 18px',
              background: c.fg,
              color: c.bg,
              border: 'none',
              borderRadius: 999,
              fontFamily: ACFonts.body,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('protocols.section.addCta') || 'Add protocol'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function V3Body() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useT();
  const navigate = useNavigate();
  const dark = theme === 'dark';
  const nav5tab = React.useMemo(() => isNav5TabEnabled(), []);

  const { data: measurements = [] } = useQuery({
    queryKey: ['v3-body-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 60),
    enabled: !!user?.id,
  });

  // Only fetch labs + protocols when nav5tab is enabled (body tab is the hub)
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';

  const { data: exams = [] } = useQuery({
    queryKey: ['v3-body-labs', user?.id],
    queryFn: async () => {
      const rows = await listExams(user.id);
      return rows.map(examToPanel);
    },
    enabled: !!user?.id && nav5tab && isPremium,
  });

  const { data: protocols = [] } = useQuery({
    queryKey: ['v3-body-protocols', user?.id],
    queryFn: () => listProtocols(user.id),
    enabled: !!user?.id && nav5tab,
  });

  const { data: todayDue = [] } = useQuery({
    queryKey: ['v3-body-protocols-today', user?.id],
    queryFn: () => getTodayDue(user.id),
    enabled: !!user?.id && nav5tab,
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

  // In 5-tab mode, pass real labs to S14 teaser row and add extra sections below.
  // In legacy mode, keep the empty labs array (no teaser, labs has its own tab path via profile).
  // examToPanel already shapes markers as { t, v, u, flag, d } — pass through directly.
  const labsForDashboard = nav5tab
    ? (exams || []).slice(0, 3).flatMap((exam) =>
        (exam.markers || []).slice(0, 2)
      ).slice(0, 3)
    : [];

  return (
    <S14_Body_Dashboard
      dark={dark}
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
      labs={labsForDashboard}
      onOpenMeasurements={() => navigate('/app/body/measurements')}
      onOpenLabs={() => navigate('/app/labs')}
      onOpenWeight={() => navigate('/app/body/weight/trend')}
      onOpenSleep={() => navigate('/app/sleep')}
      onOpenPhotos={() => navigate('/app/body/progress/photos')}
      // Extended sections rendered as children when nav5tab is on:
      extraSections={nav5tab ? (
        <>
          <LabsSection
            dark={dark}
            exams={exams}
            onOpenLabs={() => navigate('/app/labs')}
            onUploadLabs={() => navigate('/app/labs/upload')}
            t={t}
          />
          <ProtocolsSection
            dark={dark}
            protocols={protocols}
            todayDue={todayDue}
            onOpenProtocols={() => navigate('/app/protocols')}
            onNewProtocol={() => navigate('/app/protocols/new')}
            t={t}
          />
        </>
      ) : null}
    />
  );
}
