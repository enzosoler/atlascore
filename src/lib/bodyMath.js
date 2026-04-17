/**
 * Body Math Engine - Real mathematical models for body composition
 * Based on NIH Body Weight Planner and validated scientific methods
 */

// ─── Constants ─────────────────────────────────────────────────────────────────────

const CALORIES_PER_KG_FAT = 7700; // More accurate than 3500 cal/lb
const CALORIES_PER_KG_MUSCLE = 6800; // Approximate
const PROTEIN_PER_KG_MUSCLE = 0.8; // g protein per kg muscle gained

// Activity multipliers (Harris-Benedict)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// ─── Energy Balance Model ────────────────────────────────────────────────────────

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Most accurate for general population
 */
export function calculateBMR(weight_kg, height_cm, age, sex) {
  const s = sex === 'male' ? 5 : -161;
  return 10 * weight_kg + 6.25 * height_cm - 5 * age + s;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr, activity_level) {
  const multiplier = ACTIVITY_MULTIPLIERS[activity_level] || ACTIVITY_MULTIPLIERS.moderate;
  return bmr * multiplier;
}

/**
 * Calculate maintenance calories with adaptive thermogenesis
 * Accounts for metabolic adaptation during dieting
 */
export function calculateMaintenanceCalories(weight_kg, height_cm, age, sex, activity_level, weeks_dieting = 0) {
  const bmr = calculateBMR(weight_kg, height_cm, age, sex);
  const tdee = calculateTDEE(bmr, activity_level);
  
  // Adaptive thermogenesis: metabolism slows ~1% per week of dieting
  const adaptation_factor = Math.max(0.85, 1 - (weeks_dieting * 0.01));
  
  return tdee * adaptation_factor;
}

/**
 * Project weight change using dynamic model
 * Based on NIH Body Weight Planner methodology
 */
export function projectWeightChange(
  current_weight,
  target_weight,
  daily_calories,
  maintenance_calories,
  weeks_to_project = 12
) {
  const projections = [];
  let weight = current_weight;
  
  for (let week = 0; week <= weeks_to_project; week++) {
    const deficit = maintenance_calories - daily_calories;
    const weekly_change = (deficit * 7) / CALORIES_PER_KG_FAT;
    
    // Apply diminishing returns as weight decreases
    const metabolic_adaptation = Math.max(0.8, 1 - (week * 0.005));
    const adjusted_change = weekly_change * metabolic_adaptation;
    
    weight = Math.max(target_weight, weight + adjusted_change);
    
    projections.push({
      week,
      weight: Math.round(weight * 10) / 10,
      weekly_change: Math.round(adjusted_change * 100) / 100,
      cumulative_change: Math.round((weight - current_weight) * 100) / 100,
    });
  }
  
  return projections;
}

// ─── Body Composition Estimation ───────────────────────────────────────────────

/**
 * Estimate body fat percentage using circumference method
 * U.S. Army body composition formula (simplified for civilians)
 */
export function estimateBodyFatCircumference(weight_kg, height_cm, waist_cm, neck_cm, sex, age) {
  if (sex === 'male') {
    // Navy SEAL formula for males
    const lean_mass = weight_kg - (
      (495 / (1.0324 - 0.19077 * Math.log10(waist_cm - neck_cm) + 0.15456 * Math.log10(height_cm))) - 450
    );
    const body_fat_percent = ((weight_kg - lean_mass) / weight_kg) * 100;
    return Math.round(body_fat_percent * 10) / 10;
  } else {
    // Formula for females (requires hip measurement)
    // This is a simplified version - in production we'd collect hip measurements
    const estimated_body_fat = (age < 30 ? 25 : age < 40 ? 28 : 32); // Rough estimate
    return estimated_body_fat;
  }
}

/**
 * Estimate body fat from BMI with age and sex adjustments
 * Less accurate but useful when circumference data unavailable
 */
export function estimateBodyFatBMI(weight_kg, height_m, age, sex) {
  const bmi = weight_kg / (height_m * height_m);
  
  let base_body_fat;
  if (sex === 'male') {
    base_body_fat = (1.20 * bmi) + (0.23 * age) - 16.2;
  } else {
    base_body_fat = (1.20 * bmi) + (0.23 * age) - 5.4;
  }
  
  return Math.round(Math.max(5, Math.min(45, base_body_fat)) * 10) / 10;
}

/**
 * Calculate lean mass and fat mass
 */
export function calculateBodyComposition(weight_kg, body_fat_percent) {
  const fat_mass = weight_kg * (body_fat_percent / 100);
  const lean_mass = weight_kg - fat_mass;
  
  return {
    fat_mass: Math.round(fat_mass * 100) / 100,
    lean_mass: Math.round(lean_mass * 100) / 100,
    body_fat_percent: Math.round(body_fat_percent * 10) / 10,
  };
}

// ─── Weight Trend Analysis ───────────────────────────────────────────────────────

/**
 * Exponentially weighted moving average for weight smoothing
 * Reduces noise while maintaining responsiveness
 */
export function calculateSmoothedWeight(weights, alpha = 0.1) {
  if (!weights || weights.length === 0) return null;
  
  let smoothed = weights[0];
  const smoothed_weights = [smoothed];
  
  for (let i = 1; i < weights.length; i++) {
    smoothed = alpha * weights[i] + (1 - alpha) * smoothed;
    smoothed_weights.push(Math.round(smoothed * 100) / 100);
  }
  
  return smoothed_weights;
}

/**
 * Calculate weight trend slope over recent period
 */
export function calculateWeightTrend(weights, days = 14) {
  if (!weights || weights.length < 3) return { slope: 0, direction: 'stable' };
  
  const recent_weights = weights.slice(-days);
  const n = recent_weights.length;
  
  // Linear regression
  const x_sum = (n * (n - 1)) / 2; // Sum of indices
  const y_sum = recent_weights.reduce((sum, w) => sum + w, 0);
  const xy_sum = recent_weights.reduce((sum, w, i) => sum + w * i, 0);
  const x2_sum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares
  
  const slope = (n * xy_sum - x_sum * y_sum) / (n * x2_sum - x_sum * x_sum);
  
  // Convert to weekly change
  const weekly_change = slope * 7;
  
  let direction;
  if (Math.abs(weekly_change) < 0.1) {
    direction = 'stable';
  } else if (weekly_change > 0) {
    direction = 'gaining';
  } else {
    direction = 'losing';
  }
  
  return {
    slope: Math.round(weekly_change * 100) / 100,
    direction,
    confidence: calculateTrendConfidence(recent_weights),
  };
}

/**
 * Calculate confidence in trend based on variance
 */
function calculateTrendConfidence(weights) {
  if (weights.length < 5) return 'low';
  
  const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  const std_dev = Math.sqrt(variance);
  
  // Lower variance = higher confidence
  const cv = std_dev / mean; // Coefficient of variation
  
  if (cv < 0.005) return 'high';
  if (cv < 0.01) return 'medium';
  return 'low';
}

// ─── Plateau Detection ───────────────────────────────────────────────────────────

/**
 * Detect weight loss plateau using statistical analysis
 */
export function detectPlateau(weights, target_rate_kg_per_week = 0.5, window_days = 14) {
  if (!weights || weights.length < window_days) {
    return { is_plateau: false, reason: 'insufficient_data' };
  }
  
  const recent_weights = weights.slice(-window_days);
  const trend = calculateWeightTrend(recent_weights);
  
  // Expected weight loss over this period
  const expected_loss = target_rate_kg_per_week * (window_days / 7);
  const actual_change = recent_weights[recent_weights.length - 1] - recent_weights[0];
  
  // Plateau if actual loss is less than 25% of expected
  const is_plateau = actual_change > (expected_loss * 0.75);
  
  return {
    is_plateau,
    actual_change: Math.round(actual_change * 100) / 100,
    expected_change: Math.round(expected_loss * 100) / 100,
    trend_slope: trend.slope,
    confidence: trend.confidence,
    reason: is_plateau ? 'rate_too_slow' : 'progress_normal',
  };
}

// ─── Lean Mass Preservation Analysis ───────────────────────────────────────────

/**
 * Assess risk of muscle loss during cutting
 */
export function assessMuscleLossRisk(
  weight_trend,
  strength_trend,
  protein_intake_g,
  weight_kg,
  deficit_calories
) {
  const risk_factors = [];
  let risk_score = 0;
  
  // Check if weight loss is too rapid (>1% body weight per week)
  const weekly_loss_rate = Math.abs(weight_trend.slope);
  const rapid_loss_threshold = weight_kg * 0.01;
  
  if (weekly_loss_rate > rapid_loss_threshold) {
    risk_factors.push('rapid_weight_loss');
    risk_score += 2;
  }
  
  // Check protein intake (minimum 1.6g/kg for muscle preservation)
  const protein_per_kg = protein_intake_g / weight_kg;
  if (protein_per_kg < 1.6) {
    risk_factors.push('low_protein');
    risk_score += 2;
  }
  
  // Check strength trends
  if (strength_trend.direction === 'declining') {
    risk_factors.push('strength_decline');
    risk_score += 3;
  }
  
  // Check if deficit is too large (>1000 calories)
  if (deficit_calories > 1000) {
    risk_factors.push('excessive_deficit');
    risk_score += 1;
  }
  
  let risk_level;
  if (risk_score >= 5) {
    risk_level = 'high';
  } else if (risk_score >= 3) {
    risk_level = 'medium';
  } else if (risk_score >= 1) {
    risk_level = 'low';
  } else {
    risk_level = 'minimal';
  }
  
  return {
    risk_level,
    risk_score,
    risk_factors,
    recommendations: generateMusclePreservationRecommendations(risk_factors),
  };
}

function generateMusclePreservationRecommendations(risk_factors) {
  const recommendations = [];
  
  if (risk_factors.includes('rapid_weight_loss')) {
    recommendations.push('Reduce weekly weight loss rate to 0.5-1% of body weight');
  }
  
  if (risk_factors.includes('low_protein')) {
    recommendations.push('Increase protein intake to 1.6-2.2g per kg body weight');
  }
  
  if (risk_factors.includes('strength_decline')) {
    recommendations.push('Consider a diet break or reduce training volume');
  }
  
  if (risk_factors.includes('excessive_deficit')) {
    recommendations.push('Reduce calorie deficit to 500-750 calories per day');
  }
  
  return recommendations;
}

// ─── Macro Calculations ───────────────────────────────────────────────────────────

/**
 * Calculate optimal macros based on goal and body composition
 */
export function calculateMacros(
  weight_kg,
  lean_mass_kg,
  goal,
  activity_level,
  maintenance_calories,
  target_calories
) {
  let protein_g, fat_g, carbs_g;
  
  // Protein: higher for cutting, moderate for maintenance, high for bulking
  if (goal === 'cut') {
    protein_g = Math.round(lean_mass_kg * 2.2); // 2.2g per kg lean mass
  } else if (goal === 'bulk') {
    protein_g = Math.round(weight_kg * 1.8); // 1.8g per kg total weight
  } else {
    protein_g = Math.round(lean_mass_kg * 1.8); // 1.8g per kg lean mass
  }
  
  // Fat: 20-30% of calories, minimum 0.8g per kg
  const min_fat_g = Math.round(weight_kg * 0.8);
  const fat_calories_min = min_fat_g * 9;
  const fat_calories_max = target_calories * 0.3;
  
  fat_g = Math.min(Math.round(fat_calories_max / 9), Math.max(min_fat_g, Math.round(target_calories * 0.25 / 9)));
  
  // Carbs: remaining calories
  const protein_calories = protein_g * 4;
  const fat_calories = fat_g * 9;
  const remaining_calories = target_calories - protein_calories - fat_calories;
  
  carbs_g = Math.max(0, Math.round(remaining_calories / 4));
  
  return {
    protein: Math.round(protein_g),
    fat: Math.round(fat_g),
    carbs: Math.round(carbs_g),
    calories: target_calories,
  };
}

// ─── Readiness & Recovery Inference ─────────────────────────────────────────────

/**
 * Infer readiness score from available data
 */
export function calculateReadinessScore(
  sleep_hours,
  resting_hr = null,
  training_volume,
  fatigue_rating = null,
  deficit_calories = 0
) {
  let score = 100; // Start with perfect readiness
  
  // Sleep impact (most important factor)
  if (sleep_hours < 6) {
    score -= 30;
  } else if (sleep_hours < 7) {
    score -= 15;
  } else if (sleep_hours < 8) {
    score -= 5;
  }
  
  // Resting heart rate impact
  if (resting_hr) {
    // Elevated RHR suggests poor recovery
    if (resting_hr > 65) {
      score -= 20;
    } else if (resting_hr > 60) {
      score -= 10;
    }
  }
  
  // Training volume impact
  if (training_volume > 100) { // High volume
    score -= 10;
  }
  
  // Subjective fatigue
  if (fatigue_rating && fatigue_rating >= 4) { // Scale 1-5
    score -= 15;
  }
  
  // Large calorie deficit
  if (deficit_calories > 750) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate training recommendation based on readiness
 */
export function generateTrainingRecommendation(readiness_score, goal) {
  if (readiness_score >= 80) {
    return {
      intensity: 'high',
      recommendation: 'Push hard - you\'re ready for intense training',
      volume_multiplier: 1.0,
    };
  } else if (readiness_score >= 60) {
    return {
      intensity: 'moderate',
      recommendation: 'Normal training - maintain current intensity',
      volume_multiplier: 0.9,
    };
  } else if (readiness_score >= 40) {
    return {
      intensity: 'low',
      recommendation: 'Light session - focus on form and recovery',
      volume_multiplier: 0.7,
    };
  } else {
    return {
      intensity: 'rest',
      recommendation: 'Rest day - prioritize recovery',
      volume_multiplier: 0,
    };
  }
}

export default {
  calculateBMR,
  calculateTDEE,
  calculateMaintenanceCalories,
  projectWeightChange,
  estimateBodyFatCircumference,
  estimateBodyFatBMI,
  calculateBodyComposition,
  calculateSmoothedWeight,
  calculateWeightTrend,
  detectPlateau,
  assessMuscleLossRisk,
  calculateMacros,
  calculateReadinessScore,
  generateTrainingRecommendation,
};
