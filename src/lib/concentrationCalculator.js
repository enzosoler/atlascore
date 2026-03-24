// ── Pharmacokinetic concentration calculator ───────────────────────────────────
// Calculates drug concentration over time using one-compartment model with
// first-order elimination and dose accumulation

import { supabase } from '@/lib/supabaseClient';

// Half-life lookup table (in days) for common substances
const SUBSTANCE_HALF_LIFE_MAP = {
  'Cipionato de Testosterona': 8.0,
  'Test C': 8.0,
  'Enantato de Testosterona': 4.5,
  'Test E': 4.5,
  'Propionato de Testosterona': 0.8,
  'Test P': 0.8,
  'Undecanoato de Testosterona': 20.9,
  'Nebido': 20.9,
  'Decanoato de Nandrolona': 12.0,
  'Deca': 12.0,
  'Fenilpropionato de Nandrolona': 2.5,
  'NPP': 2.5,
  'Acetato de Trembolona': 1.0,
  'Tren A': 1.0,
  'Enantato de Trembolona': 5.0,
  'Tren E': 5.0,
  'Drostanolona Propionato': 1.0,
  'Masteron': 1.0,
  'Drostanolona Enantato': 4.5,
  'Mast E': 4.5,
  'Metenolona Enantato': 10.5,
  'Primobolan': 10.5,
  'Oxandrolona': 0.4,
  'Anavar': 0.4,
  'Oximetolona': 0.35,
  'Hemogenin': 0.35,
  'Metandienona': 0.2,
  'Dianabol': 0.2,
  'Estanozolol': 0.4,
  'Winstrol': 0.4,
};

/**
 * Get half-life for a protocol (in days)
 */
export function getSubstanceHalfLife(protocol) {
  if (typeof protocol?.estimated_half_life_days === 'number' && protocol.estimated_half_life_days > 0) {
    return protocol.estimated_half_life_days;
  }

  const name = protocol?.substance_name;
  if (name && SUBSTANCE_HALF_LIFE_MAP[name]) {
    return SUBSTANCE_HALF_LIFE_MAP[name];
  }

  return 1; // Default to 1 day
}

/**
 * Calculate concentration at a specific time point from all doses
 * Uses one-compartment model: C(t) = sum(Dose_i * e^(-k * (t - t_i)))
 * where k = ln(2) / half_life
 */
export function calculateConcentrationAtTime(doses, targetTime, halfLife) {
  if (!doses || doses.length === 0) return 0;
  if (halfLife <= 0) return 0;

  const k = Math.log(2) / halfLife; // elimination rate constant
  let concentration = 0;

  for (const dose of doses) {
    const doseTime = new Date(dose.taken_at).getTime();
    const targetTimeMs = new Date(targetTime).getTime();
    const timeDiffDays = (targetTimeMs - doseTime) / (1000 * 60 * 60 * 24);

    if (timeDiffDays >= 0) {
      // Dose contributes to concentration (decayed)
      concentration += dose.dose_amount * Math.exp(-k * timeDiffDays);
    }
  }

  return concentration;
}

/**
 * Generate concentration time series for charting
 * @param {Array} doses - Array of dose logs
 * @param {number} halfLife - Half-life in days
 * @param {number} daysBack - Days to show before now
 * @param {number} daysForward - Days to project forward
 * @param {number} pointsPerDay - Resolution of the curve
 * @returns {Array} Array of {time, concentration, relativeConcentration} points
 */
export function generateConcentrationSeries(
  doses,
  halfLife,
  daysBack = 30,
  daysForward = 7,
  pointsPerDay = 4
) {
  if (!doses || doses.length === 0) {
    return [];
  }

  const now = new Date();
  const startTime = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + daysForward * 24 * 60 * 60 * 1000);

  const totalPoints = Math.ceil((daysBack + daysForward) * pointsPerDay);
  const timeStepMs = (endTime.getTime() - startTime.getTime()) / totalPoints;

  const series = [];

  // Calculate baseline (at start time) for relative percentage
  const baselineConcentration = calculateConcentrationAtTime(doses, startTime, halfLife) || 1;

  for (let i = 0; i <= totalPoints; i++) {
    const timePoint = new Date(startTime.getTime() + i * timeStepMs);
    const concentration = calculateConcentrationAtTime(doses, timePoint, halfLife);

    series.push({
      time: timePoint,
      concentration,
      relativeConcentration: (concentration / baselineConcentration) * 100,
      isPast: timePoint <= now,
    });
  }

  return series;
}

/**
 * Fetch protocol logs from Supabase
 */
export async function fetchProtocolLogs(protocolId) {
  const { data, error } = await supabase
    .from('protocol_logs')
    .select('*')
    .eq('protocol_id', protocolId)
    .order('taken_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get current concentration for a protocol (at current time)
 */
export function getCurrentConcentration(doses, halfLife) {
  return calculateConcentrationAtTime(doses, new Date(), halfLife);
}

/**
 * Get concentration statistics for a protocol
 */
export function getConcentrationStats(doses, halfLife) {
  if (!doses || doses.length === 0) {
    return {
      current: 0,
      peak: 0,
      trough: 0,
      average: 0,
      timeToPeak: 0,
    };
  }

  const series = generateConcentrationSeries(doses, halfLife, 30, 0, 4);

  const concentrations = series.map((p) => p.concentration);
  const current = concentrations.length > 0 ? concentrations[concentrations.length - 1] : 0;
  const peak = Math.max(...concentrations);
  const trough = Math.min(...concentrations.filter((c) => c > 0));
  const average = concentrations.reduce((a, b) => a + b, 0) / concentrations.length;

  // Find time to peak after last dose
  const lastDose = doses[doses.length - 1];
  const lastDoseTime = new Date(lastDose.taken_at);
  const timeToPeak = 0; // Would need more complex calculation

  return {
    current,
    peak,
    trough,
    average,
    timeToPeak,
  };
}
