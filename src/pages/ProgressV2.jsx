/**
 * Atlas Core Progress Screen v2.0
 * Premium progress tracking and analytics
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Target,
  Award,
  Flame,
  Activity,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  Share2,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  Trophy
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock progress data
const mockProgressData = {
  overview: {
    totalWorkouts: 127,
    currentStreak: 12,
    longestStreak: 28,
    totalWeight: 84520, // lbs lifted
    estimatedCalories: 15420,
    avgHeartRate: 142,
    personalRecords: 8
  },
  weeklyStats: [
    { week: 'W1', workouts: 4, volume: 12400, calories: 1200, completion: 80 },
    { week: 'W2', workouts: 5, volume: 15600, calories: 1500, completion: 100 },
    { week: 'W3', workouts: 3, volume: 9800, calories: 980, completion: 60 },
    { week: 'W4', workouts: 6, volume: 18200, calories: 1800, completion: 120 }
  ],
  monthlyProgress: [
    { month: 'Jan', workouts: 18, volume: 45000, calories: 5400, streak: 15 },
    { month: 'Feb', workouts: 22, volume: 52000, calories: 6200, streak: 22 },
    { month: 'Mar', workouts: 20, volume: 48000, calories: 5800, streak: 12 },
    { month: 'Apr', workouts: 25, volume: 62000, calories: 7400, streak: 28 }
  ],
  personalRecords: [
    { exercise: 'Bench Press', value: '225 lbs', date: '2024-03-15', previous: '215 lbs' },
    { exercise: 'Squat', value: '315 lbs', date: '2024-03-10', previous: '305 lbs' },
    { exercise: 'Deadlift', value: '405 lbs', date: '2024-03-08', previous: '385 lbs' },
    { exercise: '5K Run', value: '22:45', date: '2024-03-20', previous: '23:30' }
  ],
  bodyMetrics: [
    { date: '2024-01-01', weight: 185.2, bodyFat: 18.5, muscle: 152.3 },
    { date: '2024-02-01', weight: 183.8, bodyFat: 17.2, muscle: 153.1 },
    { date: '2024-03-01', weight: 182.4, bodyFat: 16.8, muscle: 154.2 },
    { date: '2024-04-01', weight: 181.0, bodyFat: 16.1, muscle: 155.6 }
  ]
};

// Stat Card Component
function StatCard({ icon, label, value, change, changeType, color = 'var(--color-primary-500)' }) {
  const getChangeIcon = () => {
    if (changeType === 'increase') return <ArrowUp className="w-4 h-4" />;
    if (changeType === 'decrease') return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-400';
    if (changeType === 'decrease') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{change}%</span>
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}

// Progress Chart Component
function ProgressChart({ data, title, type = 'bar' }) {
  const maxValue = Math.max(...data.map(d => d.volume || d.workouts || 0));
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="headline-sm text-white">{title}</h3>
        <button className="btn btn-ghost text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? ((item.volume || item.workouts || 0) / maxValue) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm font-medium">{item.week || item.month}</span>
                <span className="text-white font-medium">{item.volume || item.workouts}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.calories} cal</span>
                <span>{item.completion}% completion</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Personal Records Component
function PersonalRecords({ records }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="headline-sm text-white">Personal Records</h3>
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">{records.length} PRs</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {records.map((record, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">{record.exercise}</p>
                <p className="text-gray-400 text-xs">{record.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">{record.value}</p>
              <p className="text-green-400 text-xs">+{record.previous}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Body Metrics Component
function BodyMetrics({ metrics }) {
  const [selectedMetric, setSelectedMetric] = useState('weight');
  
  const metricData = {
    weight: {
      label: 'Weight',
      unit: 'lbs',
      color: 'var(--color-primary-500)',
      icon: <Activity className="w-4 h-4" />
    },
    bodyFat: {
      label: 'Body Fat',
      unit: '%',
      color: 'var(--color-secondary-500)',
      icon: <PieChart className="w-4 h-4" />
    },
    muscle: {
      label: 'Muscle Mass',
      unit: 'lbs',
      color: 'var(--color-warning)',
      icon: <TrendingUp className="w-4 h-4" />
    }
  };

  const currentMetric = metricData[selectedMetric];
  const latestValue = metrics[metrics.length - 1][selectedMetric];
  const previousValue = metrics[metrics.length - 2][selectedMetric];
  const change = latestValue - previousValue;
  const changePercentage = Math.abs((change / previousValue) * 100).toFixed(1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="headline-sm text-white">Body Metrics</h3>
        <div className="flex gap-2">
          {Object.entries(metricData).map(([key, metric]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === key
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: `${currentMetric.color}20`, color: currentMetric.color }}
          >
            {currentMetric.icon}
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {latestValue}{currentMetric.unit}
          </p>
          <div className={`flex items-center justify-center gap-1 text-sm ${
            change > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{changePercentage}% from last month</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {metrics.slice(-4).map((metric, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="text-white font-medium">{metric[selectedMetric]}{currentMetric.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Achievement Badges Component
function AchievementBadges() {
  const achievements = [
    { id: 1, name: 'Early Bird', description: '5 AM workouts', icon: <Zap className="w-4 h-4" />, unlocked: true },
    { id: 2, name: 'Consistency King', description: '30-day streak', icon: <Flame className="w-4 h-4" />, unlocked: true },
    { id: 3, name: 'Iron Will', description: '100 workouts', icon: <Award className="w-4 h-4" />, unlocked: true },
    { id: 4, name: 'Beast Mode', description: '200 workouts', icon: <Activity className="w-4 h-4" />, unlocked: false },
    { id: 5, name: 'Marathon Runner', description: '1000 miles', icon: <Target className="w-4 h-4" />, unlocked: false },
    { id: 6, name: 'Calorie Crusher', description: '50,000 calories', icon: <Flame className="w-4 h-4" />, unlocked: false }
  ];

  return (
    <div className="card">
      <h3 className="headline-sm text-white mb-6">Achievements</h3>
      <div className="grid grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`text-center p-3 rounded-xl border transition-all duration-200 ${
              achievement.unlocked
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-gray-800/50 border-gray-700 opacity-50'
            }`}
          >
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
              }`}
            >
              {achievement.icon}
            </div>
            <p className={`text-xs font-medium mb-1 ${
              achievement.unlocked ? 'text-white' : 'text-gray-500'
            }`}>
              {achievement.name}
            </p>
            <p className="text-xs text-gray-400">{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export Options Component
function ExportOptions() {
  return (
    <div className="card">
      <h3 className="headline-sm text-white mb-4">Export & Share</h3>
      <div className="space-y-3">
        <button className="btn btn-secondary w-full justify-center">
          <Download className="w-4 h-4" />
          Export Progress Report
        </button>
        <button className="btn btn-secondary w-full justify-center">
          <Share2 className="w-4 h-4" />
          Share Achievements
        </button>
        <button className="btn btn-ghost w-full justify-center">
          <Calendar className="w-4 h-4" />
          Schedule Progress Check
        </button>
      </div>
    </div>
  );
}

// Main Progress Component
function Progress() {
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

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
          <p className="text-gray-400">Loading Progress Data...</p>
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
              <h1 className="display-sm text-white mb-1">Your Progress</h1>
              <p className="text-gray-400">Track your fitness journey and achievements</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="input bg-gray-800 border-gray-700 text-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <Link to="/dashboard" className="btn btn-ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Total Workouts"
            value={mockProgressData.overview.totalWorkouts}
            change={12}
            changeType="increase"
            color="var(--color-primary-500)"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Current Streak"
            value={`${mockProgressData.overview.currentStreak} days`}
            change={8}
            changeType="increase"
            color="var(--color-warning)"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total Volume"
            value={`${(mockProgressData.overview.totalWeight / 1000).toFixed(1)}k lbs`}
            change={15}
            changeType="increase"
            color="var(--color-secondary-500)"
          />
          <StatCard
            icon={<Award className="w-5 h-5" />}
            label="Personal Records"
            value={mockProgressData.overview.personalRecords}
            change={2}
            changeType="increase"
            color="var(--color-info)"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Charts Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress */}
            <ProgressChart
              data={mockProgressData.weeklyStats}
              title="Weekly Progress"
              type="bar"
            />
            
            {/* Monthly Progress */}
            <ProgressChart
              data={mockProgressData.monthlyProgress}
              title="Monthly Progress"
              type="line"
            />
            
            {/* Personal Records */}
            <PersonalRecords records={mockProgressData.personalRecords} />
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Body Metrics */}
            <BodyMetrics metrics={mockProgressData.bodyMetrics} />
            
            {/* Achievement Badges */}
            <AchievementBadges />
            
            {/* Export Options */}
            <ExportOptions />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Progress;
