import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Trophy,
  Flame,
  Target,
  Star,
  Calendar,
  CheckCircle,
  TrendingUp,
  Crown,
  Sparkles,
  X,
} from 'lucide-react';

// Milestone definitions
const MILESTONE_CATEGORIES = {
  consistency: {
    name: 'Consistency',
    icon: Calendar,
    color: 'from-blue-500 to-blue-600',
    milestones: [
      { id: 'first_week', name: 'First Week', description: '7 days of tracking', threshold: 7, unit: 'days' },
      { id: 'two_weeks', name: 'Two Week Streak', description: '14 consecutive days', threshold: 14, unit: 'days' },
      { id: 'one_month', name: 'One Month', description: '30 days of consistency', threshold: 30, unit: 'days' },
      { id: 'three_months', name: 'Quarter Master', description: '90 days of tracking', threshold: 90, unit: 'days' },
      { id: 'six_months', name: 'Half Year Hero', description: '180 days of tracking', threshold: 180, unit: 'days' },
    ],
  },
  workouts: {
    name: 'Training',
    icon: Target,
    color: 'from-orange-500 to-orange-600',
    milestones: [
      { id: 'first_workout', name: 'First Workout', description: 'Completed first session', threshold: 1, unit: 'workouts' },
      { id: 'five_workouts', name: 'Getting Started', description: '5 workouts completed', threshold: 5, unit: 'workouts' },
      { id: 'ten_workouts', name: 'Workout Warrior', description: '10 workouts completed', threshold: 10, unit: 'workouts' },
      { id: 'twenty_five_workouts', name: 'Dedicated Athlete', description: '25 workouts completed', threshold: 25, unit: 'workouts' },
      { id: 'fifty_workouts', name: 'Elite Performer', description: '50 workouts completed', threshold: 50, unit: 'workouts' },
    ],
  },
  nutrition: {
    name: 'Nutrition',
    icon: Flame,
    color: 'from-green-500 to-green-600',
    milestones: [
      { id: 'first_meal', name: 'First Meal Logged', description: 'Started nutrition tracking', threshold: 1, unit: 'meals' },
      { id: 'seven_meals', name: 'Week of Nutrition', description: '7 meals logged', threshold: 7, unit: 'meals' },
      { id: 'thirty_meals', name: 'Month of Tracking', description: '30 meals logged', threshold: 30, unit: 'meals' },
      { id: 'hundred_meals', name: 'Nutrition Master', description: '100 meals logged', threshold: 100, unit: 'meals' },
    ],
  },
  progress: {
    name: 'Progress',
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
    milestones: [
      { id: 'first_weight', name: 'First Weigh-In', description: 'Started tracking weight', threshold: 1, unit: 'weigh-ins' },
      { id: 'five_weights', name: 'Consistent Tracker', description: '5 weight entries', threshold: 5, unit: 'weigh-ins' },
      { id: 'weight_loss_2kg', name: '2kg Down', description: 'Lost 2kg', threshold: 2, unit: 'kg_lost' },
      { id: 'weight_loss_5kg', name: '5kg Achievement', description: 'Lost 5kg', threshold: 5, unit: 'kg_lost' },
      { id: 'weight_loss_10kg', description: '10kg Transformation', threshold: 10, unit: 'kg_lost' },
    ],
  },
  perfect_weeks: {
    name: 'Perfect Weeks',
    icon: Star,
    color: 'from-yellow-500 to-yellow-600',
    milestones: [
      { id: 'first_perfect_week', name: 'Perfect Week', description: '100% adherence for 7 days', threshold: 1, unit: 'weeks' },
      { id: 'three_perfect_weeks', name: 'Consistency King', description: '3 perfect weeks', threshold: 3, unit: 'weeks' },
      { id: 'perfect_month', name: 'Month of Excellence', description: '4 perfect weeks', threshold: 4, unit: 'weeks' },
    ],
  },
};

export default function MilestoneSystem({ open, onClose }) {
  const { user } = useAuth();
  const [unlockedMilestone, setUnlockedMilestone] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // Fetch user stats for milestone checking
  const { data: userStats } = useQuery({
    queryKey: ['milestone-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get checkins for streak calculation
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Get workouts
      const { data: workouts } = await supabase
        .from('workouts')
        .select('status, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      // Get nutrition logs
      const { data: nutrition } = await supabase
        .from('food_logs')
        .select('date, calories')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Get measurements
      const { data: measurements } = await supabase
        .from('measurements')
        .select('weight, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      // Calculate streak
      const streak = calculateStreak(checkins || []);
      
      // Calculate weight loss
      const weightLoss = calculateWeightLoss(measurements || []);

      // Calculate perfect weeks
      const perfectWeeks = calculatePerfectWeeks(checkins || [], workouts || [], nutrition || []);

      return {
        streak,
        totalWorkouts: workouts?.length || 0,
        totalMeals: nutrition?.length || 0,
        totalWeights: measurements?.length || 0,
        weightLoss,
        perfectWeeks,
        checkins: checkins || [],
      };
    },
    enabled: !!user?.id,
  });

  // Get existing milestones
  const { data: existingMilestones } = useQuery({
    queryKey: ['user-milestones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Check for new milestones
  useEffect(() => {
    if (userStats && existingMilestones) {
      checkForNewMilestones();
    }
  }, [userStats, existingMilestones]);

  const calculateStreak = (checkins) => {
    if (!checkins.length) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const sortedCheckins = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      if (sortedCheckins.some(c => c.date === dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const calculateWeightLoss = (measurements) => {
    if (measurements.length < 2) return 0;
    
    const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0].weight;
    const latest = sorted[sorted.length - 1].weight;
    return Math.max(0, first - latest);
  };

  const calculatePerfectWeeks = (checkins, workouts, nutrition) => {
    // Simplified perfect week calculation
    // A perfect week has: daily checkins, 5+ workouts, 7+ meals logged
    const weeks = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekCheckins = checkins.filter(c => {
        const date = new Date(c.date);
        return date >= weekStart && date <= weekEnd;
      }).length;
      
      const weekWorkouts = workouts.filter(w => {
        const date = new Date(w.completed_at);
        return date >= weekStart && date <= weekEnd;
      }).length;
      
      const weekMeals = nutrition.filter(n => {
        const date = new Date(n.date);
        return date >= weekStart && date <= weekEnd;
      }).length;
      
      if (weekCheckins >= 7 && weekWorkouts >= 5 && weekMeals >= 7) {
        weeks.push(i);
      }
    }
    
    return weeks.length;
  };

  const checkForNewMilestones = async () => {
    const newMilestones = [];

    Object.entries(MILESTONE_CATEGORIES).forEach(([categoryKey, category]) => {
      category.milestones.forEach(milestone => {
        const isAlreadyUnlocked = existingMilestones.some(m => m.milestone_id === milestone.id);
        
        if (isAlreadyUnlocked) return;

        let currentValue = 0;
        
        switch (categoryKey) {
          case 'consistency':
            currentValue = userStats.streak;
            break;
          case 'workouts':
            currentValue = userStats.totalWorkouts;
            break;
          case 'nutrition':
            currentValue = userStats.totalMeals;
            break;
          case 'progress':
            if (milestone.unit === 'weigh-ins') {
              currentValue = userStats.totalWeights;
            } else if (milestone.unit === 'kg_lost') {
              currentValue = userStats.weightLoss;
            }
            break;
          case 'perfect_weeks':
            currentValue = userStats.perfectWeeks;
            break;
        }

        if (currentValue >= milestone.threshold) {
          newMilestones.push({
            ...milestone,
            category: categoryKey,
            categoryName: category.name,
            categoryColor: category.color,
            currentValue,
          });
        }
      });
    });

    if (newMilestones.length > 0) {
      // Show the first new milestone
      setUnlockedMilestone(newMilestones[0]);
      setShowAnimation(true);

      // Save to database
      await Promise.all(
        newMilestones.map(milestone =>
          supabase.from('user_milestones').insert({
            user_id: user.id,
            milestone_id: milestone.id,
            category: milestone.category,
            unlocked_at: new Date().toISOString(),
            current_value: milestone.currentValue,
          })
        )
      );

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowAnimation(false);
      }, 5000);
    }
  };

  const getCategoryIcon = (categoryKey) => {
    const category = MILESTONE_CATEGORIES[categoryKey];
    return category ? category.icon : Trophy;
  };

  const getCategoryColor = (categoryKey) => {
    const category = MILESTONE_CATEGORIES[categoryKey];
    return category ? category.color : 'from-gray-500 to-gray-600';
  };

  if (!showAnimation || !unlockedMilestone) return null;

  const Icon = getCategoryIcon(unlockedMilestone.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-3xl border border-[hsl(var(--border)/0.2)] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card)/0.8)] shadow-2xl"
        style={{
          animation: 'milestonePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setShowAnimation(false)}
          className="absolute right-4 top-4 rounded-xl p-2 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${unlockedMilestone.categoryColor} text-white shadow-lg`}>
            <Icon className="h-10 w-10" />
          </div>

          {/* Milestone content */}
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--brand))]">
              <Crown className="h-3 w-3" />
              {unlockedMilestone.categoryName}
            </div>
            
            <h2 className="mb-2 text-2xl font-bold text-[hsl(var(--fg))]">
              {unlockedMilestone.name}
            </h2>
            
            <p className="text-sm text-[hsl(var(--fg-2))]">
              {unlockedMilestone.description}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-6 rounded-xl bg-[hsl(var(--shell))] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[hsl(var(--fg))]">Progress</span>
              <span className="text-sm font-bold text-[hsl(var(--brand))]">
                {unlockedMilestone.currentValue} / {unlockedMilestone.threshold}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--border)/0.3)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] transition-all duration-500"
                style={{
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Achievement message */}
          <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--success))]">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">Achievement Unlocked!</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes milestonePop {
          0% {
            transform: scale(0.5) rotate(-5deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Milestone Progress Tracker Component
export function MilestoneProgress() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('consistency');

  const { data: userStats } = useQuery({
    queryKey: ['milestone-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Similar stats fetching as above
      return {
        streak: 15,
        totalWorkouts: 12,
        totalMeals: 45,
        totalWeights: 8,
        weightLoss: 2.3,
        perfectWeeks: 1,
      };
    },
    enabled: !!user?.id,
  });

  const { data: existingMilestones } = useQuery({
    queryKey: ['user-milestones-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // Fetch existing milestones
      return ['first_week', 'first_workout', 'first_meal']; // Example
    },
    enabled: !!user?.id,
  });

  if (!userStats) return null;

  const selectedCategoryData = MILESTONE_CATEGORIES[selectedCategory];
  const Icon = selectedCategoryData.icon;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Milestone Progress</h3>
        <p className="text-sm text-[hsl(var(--fg-2))]">Track your achievements</p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {Object.entries(MILESTONE_CATEGORIES).map(([key, category]) => {
          const CategoryIcon = category.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-[hsl(var(--brand))] text-white'
                  : 'bg-[hsl(var(--shell))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))/0.8]'
              }`}
            >
              <CategoryIcon className="h-4 w-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Milestones for selected category */}
      <div className="space-y-3">
        {selectedCategoryData.milestones.map((milestone) => {
          const isUnlocked = existingMilestones?.includes(milestone.id);
          let currentValue = 0;
          
          switch (selectedCategory) {
            case 'consistency':
              currentValue = userStats.streak;
              break;
            case 'workouts':
              currentValue = userStats.totalWorkouts;
              break;
            case 'nutrition':
              currentValue = userStats.totalMeals;
              break;
            case 'progress':
              if (milestone.unit === 'weigh-ins') {
                currentValue = userStats.totalWeights;
              } else if (milestone.unit === 'kg_lost') {
                currentValue = userStats.weightLoss;
              }
              break;
            case 'perfect_weeks':
              currentValue = userStats.perfectWeeks;
              break;
          }

          const progress = Math.min(100, (currentValue / milestone.threshold) * 100);

          return (
            <div
              key={milestone.id}
              className={`rounded-xl border p-4 transition-all ${
                isUnlocked
                  ? 'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.05)]'
                  : 'border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card)/0.5)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isUnlocked
                    ? 'bg-[hsl(var(--success))] text-white'
                    : 'bg-[hsl(var(--shell))] text-[hsl(var(--fg-3))]'
                }`}>
                  {isUnlocked ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[hsl(var(--fg))]">{milestone.name}</h4>
                    <span className={`text-sm font-medium ${
                      isUnlocked ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--fg-2))]'
                    }`}>
                      {currentValue} / {milestone.threshold}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[hsl(var(--fg-2))] mb-3">{milestone.description}</p>
                  
                  {!isUnlocked && (
                    <div className="h-2 rounded-full bg-[hsl(var(--border)/0.3)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
