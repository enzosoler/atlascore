/**
 * Atlas Core Dashboard v2.0
 * Premium fitness tracker home screen
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Flame,
  TrendingUp,
  Camera,
  Dumbbell,
  UtensilsCrossed,
  Target,
  Plus,
  ChevronRight,
  Play,
  Calendar,
  Award,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';

// Import design system classes
import '@/styles/design-system.css';

// Mock data — ONLY used as shape fallback for UI skeleton.
// User fields are overridden from AuthContext at render time so no one ever
// sees "Alex" again. Fitness stats below (streak, workouts) remain TODO — they
// need to be wired to the real workout/streak services; until then they render
// as zeros on accounts that have no data yet.
const mockData = {
  user: {
    name: '',
    streak: 0,
    weeklyGoal: 5,
    completedWorkouts: 0,
    totalWorkouts: 0
  },
  today: {
    caloriesRemaining: 450,
    proteinConsumed: 85,
    proteinTarget: 120,
    waterConsumed: 6,
    waterTarget: 8,
    workoutCompleted: false,
    nutritionLogged: false,
    checkinCompleted: false
  },
  weeklyProgress: [
    { day: 'M', completed: true, intensity: 0.8 },
    { day: 'T', completed: true, intensity: 0.6 },
    { day: 'W', completed: false, intensity: 0 },
    { day: 'T', completed: true, intensity: 0.9 },
    { day: 'F', completed: false, intensity: 0 },
    { day: 'S', completed: false, intensity: 0 },
    { day: 'S', completed: false, intensity: 0 }
  ],
  nextWorkout: {
    type: 'Upper Body Strength',
    duration: 45,
    exercises: 8,
    difficulty: 'Intermediate'
  },
  recentAchievements: [
    { type: 'streak', value: 12, label: 'Day Streak' },
    { type: 'workout', value: 127, label: 'Total Workouts' },
    { type: 'personal', value: '225lb', label: 'Bench PR' }
  ]
};

// Progress Ring Component
function ProgressRing({ percentage, size = 48, strokeWidth = 6, color = 'var(--color-primary-500)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-ring-bg"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-ring-fill"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-sm">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// Streak Counter Component
function StreakCounter({ streak }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-400" />
        <span className="text-orange-400 font-bold text-lg">{streak}</span>
      </div>
      <div className="text-left">
        <p className="text-white font-semibold text-sm">Day Streak</p>
        <p className="text-gray-400 text-xs">Keep it going!</p>
      </div>
    </div>
  );
}

// Weekly Progress Component
function WeeklyProgress({ data }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline-sm text-white">This Week</h3>
        <span className="text-green-400 text-sm font-medium">
          {data.filter(d => d.completed).length}/{data.length} Complete
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${day.completed 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-gray-700 text-gray-400'
                }
              `}
              style={{
                opacity: day.completed ? day.intensity + 0.2 : 0.3
              }}
            >
              {day.completed ? '×' : ''}
            </div>
            <span className="text-gray-400 text-xs font-medium">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Action Component
function QuickAction({ icon, label, description, to, color = 'var(--color-primary-500)' }) {
  return (
    <Link to={to} className="group block">
      <div className="card hover:transform hover:-translate-y-1 transition-all duration-300">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <h4 className="headline-sm text-white mb-1">{label}</h4>
        <p className="body-sm text-gray-400">{description}</p>
        <div className="flex items-center gap-1 mt-3 text-gray-400 group-hover:text-white transition-colors">
          <span className="text-xs font-medium">Start</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

// Today's Status Component
function TodaysStatus({ data }) {
  const completionPercentage = [
    data.workoutCompleted,
    data.nutritionLogged,
    data.checkinCompleted
  ].filter(Boolean).length / 3 * 100;

  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline-sm text-white">Today's Progress</h3>
        <ProgressRing percentage={completionPercentage} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.workoutCompleted ? 'bg-green-500' : 'bg-gray-700'}`}>
              {data.workoutCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <Dumbbell className="w-4 h-4 text-gray-400" />}
            </div>
            <div>
              <p className="text-white font-medium text-sm">Workout</p>
              <p className="text-gray-400 text-xs">{data.workoutCompleted ? 'Completed' : 'Not started'}</p>
            </div>
          </div>
          {!data.workoutCompleted && (
            <Link to="/workout" className="btn btn-ghost text-xs">
              Start
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.nutritionLogged ? 'bg-green-500' : 'bg-gray-700'}`}>
              {data.nutritionLogged ? <CheckCircle className="w-4 h-4 text-white" /> : <UtensilsCrossed className="w-4 h-4 text-gray-400" />}
            </div>
            <div>
              <p className="text-white font-medium text-sm">Nutrition</p>
              <p className="text-gray-400 text-xs">{data.nutritionLogged ? 'Logged' : 'Not logged'}</p>
            </div>
          </div>
          {!data.nutritionLogged && (
            <Link to="/nutrition" className="btn btn-ghost text-xs">
              Log
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.checkinCompleted ? 'bg-green-500' : 'bg-gray-700'}`}>
              {data.checkinCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <Camera className="w-4 h-4 text-gray-400" />}
            </div>
            <div>
              <p className="text-white font-medium text-sm">Check-in</p>
              <p className="text-gray-400 text-xs">{data.checkinCompleted ? 'Completed' : 'Not done'}</p>
            </div>
          </div>
          {!data.checkinCompleted && (
            <Link to="/checkin" className="btn btn-ghost text-xs">
              Check In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Next Workout Component
function NextWorkout({ workout }) {
  return (
    <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline-sm text-white">Next Workout</h3>
        <div className="flex items-center gap-1 text-blue-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{workout.duration}min</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-white font-semibold text-lg mb-2">{workout.type}</h4>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{workout.exercises} exercises</span>
          <span>·</span>
          <span>{workout.difficulty}</span>
        </div>
      </div>

      <Link to="/workout" className="btn btn-primary w-full justify-center">
        <Play className="w-4 h-4" />
        Start Workout
      </Link>
    </div>
  );
}

// Nutrition Summary Component
function NutritionSummary({ data }) {
  const proteinPercentage = (data.proteinConsumed / data.proteinTarget) * 100;
  const waterPercentage = (data.waterConsumed / data.waterTarget) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline-sm text-white">Nutrition</h3>
        <span className="text-green-400 text-sm font-medium">{data.caloriesRemaining} cal left</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <ProgressRing percentage={proteinPercentage} size={64} strokeWidth={8} color="var(--color-primary-500)" />
          <p className="text-white font-medium text-sm mt-2">Protein</p>
          <p className="text-gray-400 text-xs">{data.proteinConsumed}g / {data.proteinTarget}g</p>
        </div>
        
        <div className="text-center">
          <ProgressRing percentage={waterPercentage} size={64} strokeWidth={8} color="var(--color-secondary-500)" />
          <p className="text-white font-medium text-sm mt-2">Water</p>
          <p className="text-gray-400 text-xs">{data.waterConsumed} / {data.waterTarget} glasses</p>
        </div>
      </div>

      <Link to="/nutrition" className="btn btn-secondary w-full justify-center mt-4">
        <UtensilsCrossed className="w-4 h-4" />
        Log Nutrition
      </Link>
    </div>
  );
}

// Recent Achievements Component
function RecentAchievements({ achievements }) {
  return (
    <div className="card">
      <h3 className="headline-sm text-white mb-4">Recent Achievements</h3>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-white font-bold text-lg">{achievement.value}</p>
            <p className="text-gray-400 text-xs">{achievement.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Pull the REAL first name from the authenticated user.
  // Falls back to the part before "@" in the email, then to a neutral greeting.
  const displayName =
    (user?.full_name || '').split(' ')[0] ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'there';

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-0">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-base-0/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="display-sm text-white mb-1">Welcome back, {displayName}</h1>
              <p className="text-gray-400">Ready to crush your goals today?</p>
            </div>
            <StreakCounter streak={mockData.user.streak} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Status */}
            <TodaysStatus data={mockData.today} />
            
            {/* Next Workout */}
            <NextWorkout workout={mockData.nextWorkout} />
            
            {/* Weekly Progress */}
            <WeeklyProgress data={mockData.weeklyProgress} />
            
            {/* Quick Actions */}
            <div>
              <h3 className="headline-sm text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickAction
                  icon={<Dumbbell className="w-6 h-6" />}
                  label="Quick Workout"
                  description="Start a fast workout"
                  to="/workout"
                  color="var(--color-primary-500)"
                />
                <QuickAction
                  icon={<UtensilsCrossed className="w-6 h-6" />}
                  label="Log Meal"
                  description="Track your nutrition"
                  to="/nutrition"
                  color="var(--color-secondary-500)"
                />
                <QuickAction
                  icon={<Camera className="w-6 h-6" />}
                  label="Progress Photo"
                  description="Document your journey"
                  to="/progress-photos"
                  color="var(--color-warning)"
                />
                <QuickAction
                  icon={<BarChart3 className="w-6 h-6" />}
                  label="View Stats"
                  description="See your progress"
                  to="/progress"
                  color="var(--color-info)"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Side Stats */}
          <div className="space-y-6">
            {/* Nutrition Summary */}
            <NutritionSummary data={mockData.today} />
            
            {/* Recent Achievements */}
            <RecentAchievements achievements={mockData.recentAchievements} />
            
            {/* Motivational Quote */}
            <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <div className="text-center">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-medium italic">"The only bad workout is the one that didn't happen."</p>
                <p className="text-gray-400 text-sm mt-2">- Unknown</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
