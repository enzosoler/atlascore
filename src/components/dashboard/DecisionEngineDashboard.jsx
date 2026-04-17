import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  Target,
  TrendingUp,
  Calendar,
  Activity,
  UtensilsCrossed,
  Scale,
  Dumbbell,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flame,
  Trophy,
  Share2,
  RefreshCw,
  Plus,
  ChevronRight,
  Brain,
  Heart,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  calculateReadinessScore, 
  generateTrainingRecommendation,
  detectPlateau,
  assessMuscleLossRisk,
  calculateWeightTrend,
  calculateSmoothedWeight 
} from '@/lib/bodyMath';
import ShareableProofCards from '@/components/social/ShareableProofCards';
import CreatorDashboard from '@/components/affiliate/CreatorDashboard';
import StartFreshModal from '@/components/system/StartFreshModal';
import MilestoneSystem from '@/components/system/MilestoneSystem';

export default function DecisionEngineDashboard() {
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreatorDashboard, setShowCreatorDashboard] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Fetch today's data
  const { data: todayData, isLoading: loadingToday } = useQuery({
    queryKey: ['dashboard-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's checkin
      const { data: checkin } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // Get today's nutrition
      const { data: nutrition } = await supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat')
        .eq('user_id', user.id)
        .eq('date', today);

      // Get today's workout
      const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // Get user targets
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        checkin,
        nutrition: nutrition || [],
        workout,
        targets: profile,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch trend data
  const { data: trendData } = useQuery({
    queryKey: ['dashboard-trends', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get weight history
      const { data: weights } = await supabase
        .from('measurements')
        .select('weight, date')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Get workout history
      const { data: workouts } = await supabase
        .from('workouts')
        .select('status, completed_at, duration_minutes')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: true });

      return {
        weights: weights || [],
        workouts: workouts || [],
      };
    },
    enabled: !!user?.id,
  });

  // Generate insights from data
  const generateInsights = () => {
    if (!todayData || !trendData) return null;

    const { checkin, nutrition, workout, targets } = todayData;
    const { weights, workouts } = trendData;

    const insights = {
      readiness: null,
      nutritionStatus: null,
      trainingRecommendation: null,
      plateaus: null,
      muscleRisk: null,
      weightTrend: null,
    };

    // Calculate readiness
    if (checkin) {
      const readinessScore = calculateReadinessScore(
        checkin.sleep_hours,
        checkin.resting_hr,
        workouts?.slice(-7).reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
        checkin.fatigue_rating,
        targets?.maintenance_calories - targets?.target_calories
      );
      
      insights.readiness = {
        score: readinessScore,
        recommendation: generateTrainingRecommendation(readinessScore, targets?.current_goal),
      };
    }

    // Nutrition status
    if (nutrition.length > 0 && targets) {
      const totalCalories = nutrition.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const totalProtein = nutrition.reduce((sum, meal) => sum + (meal.protein || 0), 0);
      
      insights.nutritionStatus = {
        calories: {
          current: totalCalories,
          target: targets.target_calories,
          percentage: Math.round((totalCalories / targets.target_calories) * 100),
        },
        protein: {
          current: totalProtein,
          target: targets.target_protein,
          percentage: Math.round((totalProtein / targets.target_protein) * 100),
        },
        mealsLogged: nutrition.length,
      };
    }

    // Weight trend
    if (weights.length >= 3) {
      const weightValues = weights.map(w => w.weight);
      const smoothedWeights = calculateSmoothedWeight(weightValues);
      const trend = calculateWeightTrend(smoothedWeights || weightValues);
      
      insights.weightTrend = {
        current: weights[weights.length - 1].weight,
        trend: trend,
        smoothed: smoothedWeights ? smoothedWeights[smoothedWeights.length - 1] : weights[weights.length - 1].weight,
      };

      // Plateau detection
      insights.plateaus = detectPlateau(weightValues);
    }

    // Muscle loss risk
    if (insights.weightTrend && targets) {
      insights.muscleRisk = assessMuscleLossRisk(
        insights.weightTrend.trend,
        { direction: 'stable' }, // Would need strength data
        insights.nutritionStatus?.protein?.current || 0,
        insights.weightTrend.current,
        targets.maintenance_calories - targets.target_calories
      );
    }

    return insights;
  };

  const insights = generateInsights();

  const getReadinessColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getReadinessLabel = (score) => {
    if (score >= 80) return 'Ready to Push';
    if (score >= 60) return 'Moderate';
    return 'Recovery Needed';
  };

  if (loadingToday) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--brand))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--brand)/0.05)] to-[hsl(var(--brand)/0.02)]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border)/0.1)] bg-[hsl(var(--card))/0.8] backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--fg))]">Atlas Core</h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">Your body operating system</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                <Share2 className="h-4 w-4" />
                Share Progress
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))]"
              >
                <RefreshCw className="h-4 w-4" />
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Decision Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Decision */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Decision Card */}
            <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card)/0.8)] p-6 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[hsl(var(--fg))] mb-2">Today's Decision</h2>
                  <p className="text-sm text-[hsl(var(--fg-2))]">What should you focus on right now?</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  insights?.readiness?.score >= 80 
                    ? 'bg-green-100 text-green-600' 
                    : insights?.readiness?.score >= 60
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  <Brain className="h-6 w-6" />
                </div>
              </div>

              {insights?.readiness && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-[hsl(var(--shell))] p-4">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--fg-2))]">Readiness Score</p>
                      <p className={`text-2xl font-bold ${getReadinessColor(insights.readiness.score)}`}>
                        {insights.readiness.score}/100
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getReadinessColor(insights.readiness.score)}`}>
                        {getReadinessLabel(insights.readiness.score)}
                      </p>
                      <p className="text-xs text-[hsl(var(--fg-3))]">
                        {insights.readiness.recommendation.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {!todayData?.checkin && (
                      <Link
                        to="/checkin"
                        className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] p-4 transition-all hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--shell))]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-[hsl(var(--fg))]">Daily Check-in</p>
                          <p className="text-xs text-[hsl(var(--fg-2))]">Log sleep, energy, mood</p>
                        </div>
                      </Link>
                    )}

                    {(!insights.nutritionStatus || insights.nutritionStatus.calories.percentage < 80) && (
                      <Link
                        to="/nutrition"
                        className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] p-4 transition-all hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--shell))]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                          <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-[hsl(var(--fg))]">Log Nutrition</p>
                          <p className="text-xs text-[hsl(var(--fg-2))]">
                            {insights.nutritionStatus ? `${insights.nutritionStatus.calories.current}/${insights.nutritionStatus.calories.target} kcal` : 'Start tracking'}
                          </p>
                        </div>
                      </Link>
                    )}

                    {!todayData?.workout && insights.readiness.score >= 60 && (
                      <Link
                        to="/workouts"
                        className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] p-4 transition-all hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--shell))]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-[hsl(var(--fg))]">Today's Workout</p>
                          <p className="text-xs text-[hsl(var(--fg-2))]">{insights.readiness.recommendation.intensity} intensity</p>
                        </div>
                      </Link>
                    )}

                    <Link
                      to="/progress"
                      className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] p-4 transition-all hover:border-[hsl(var(--brand)/0.3)] hover:bg-[hsl(var(--shell))]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <Scale className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[hsl(var(--fg))]">Update Weight</p>
                        <p className="text-xs text-[hsl(var(--fg-2))]">Track your progress</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* System Insights */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Weight Trend */}
              {insights?.weightTrend && (
                <div className="rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))/0.8] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[hsl(var(--fg))] flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[hsl(var(--brand))]" />
                      Weight Trend
                    </h3>
                    <span className={`text-xs font-medium ${
                      insights.weightTrend.trend.direction === 'losing' ? 'text-green-600' :
                      insights.weightTrend.trend.direction === 'gaining' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {insights.weightTrend.trend.direction}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--fg-2))]">Current</span>
                      <span className="font-medium text-[hsl(var(--fg))]">{insights.weightTrend.current.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--fg-2))]">Weekly Change</span>
                      <span className={`font-medium ${
                        insights.weightTrend.trend.slope < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insights.weightTrend.trend.slope > 0 ? '+' : ''}{insights.weightTrend.trend.slope.toFixed(2)} kg/week
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Plateau Alert */}
              {insights?.plateaus?.is_plateau && (
                <div className="rounded-xl border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.05)] p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--err))] mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--fg))] mb-1">Plateau Detected</h3>
                      <p className="text-sm text-[hsl(var(--fg-2))]">
                        Progress has slowed. Consider adjusting your approach.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Muscle Risk Alert */}
              {insights?.muscleRisk != null && insights.muscleRisk.risk_level !== 'minimal' && (
                <div className="rounded-xl border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.05)] p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))] mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--fg))] mb-1">Muscle Loss Risk</h3>
                      <p className="text-sm text-[hsl(var(--fg-2))]">
                        {insights.muscleRisk.risk_level === 'high' ? 'High risk - review your approach' :
                         insights.muscleRisk.risk_level === 'medium' ? 'Moderate risk - consider adjustments' :
                         'Low risk - monitor closely'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nutrition Status */}
              {insights?.nutritionStatus && (
                <div className="rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))/0.8] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[hsl(var(--fg))] flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-[hsl(var(--brand))]" />
                      Nutrition Today
                    </h3>
                    <span className="text-xs font-medium text-[hsl(var(--fg-3))]">
                      {insights.nutritionStatus.mealsLogged} meals
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--fg-2))]">Calories</span>
                      <span className={`font-medium ${
                        insights.nutritionStatus.calories.percentage >= 90 ? 'text-green-600' :
                        insights.nutritionStatus.calories.percentage >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {insights.nutritionStatus.calories.percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--fg-2))]">Protein</span>
                      <span className={`font-medium ${
                        insights.nutritionStatus.protein.percentage >= 90 ? 'text-green-600' :
                        insights.nutritionStatus.protein.percentage >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {insights.nutritionStatus.protein.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Proof & Quick Actions */}
          <div className="space-y-6">
            {/* Shareable Proof */}
            <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.05)] to-[hsl(var(--brand)/0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[hsl(var(--fg))]">Share Your Proof</h3>
                <Trophy className="h-5 w-5 text-[hsl(var(--brand))]" />
              </div>
              <p className="text-sm text-[hsl(var(--fg-2))] mb-4">
                Turn your progress into inspiring cards
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-4 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                <Share2 className="h-4 w-4" />
                Create Share Card
              </button>
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))/0.8] p-6">
              <h3 className="font-semibold text-[hsl(var(--fg))] mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--fg-2))] flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    Streak
                  </span>
                  <span className="font-medium text-[hsl(var(--fg))]">7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--fg-2))] flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Workouts This Week
                  </span>
                  <span className="font-medium text-[hsl(var(--fg))]">3/4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--fg-2))] flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Readiness
                  </span>
                  <span className={`font-medium ${getReadinessColor(insights?.readiness?.score || 0)}`}>
                    {insights?.readiness?.score || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))/0.8] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[hsl(var(--fg))]">Milestones</h3>
                <Star className="h-5 w-5 text-[hsl(var(--brand))]" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--fg-2))]">First Week</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--fg-2))]">5 Workouts</span>
                  <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--border))]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--fg-2))]">30 Meals</span>
                  <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--border))]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showShareModal && (
        <ShareableProofCards
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showCreatorDashboard && (
        <CreatorDashboard
          open={showCreatorDashboard}
          onClose={() => setShowCreatorDashboard(false)}
        />
      )}

      {showResetModal && (
        <StartFreshModal
          open={showResetModal}
          onClose={() => setShowResetModal(false)}
        />
      )}

      <MilestoneSystem />
    </div>
  );
}
