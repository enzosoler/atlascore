/**
 * Atlas Core Profile Screen v2.0
 * Premium user profile and settings
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  Camera,
  Edit2,
  Mail,
  Calendar,
  MapPin,
  Award,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Star,
  ChevronRight,
  Shield,
  Bell,
  Moon,
  Globe,
  CreditCard,
  HelpCircle,
  FileText,
  Download,
  Share2,
  Zap,
  Flame,
  Trophy,
  BarChart3
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock user data
const mockUserData = {
  profile: {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    location: 'San Francisco, CA',
    memberSince: '2024-01-15',
    avatar: '/api/placeholder/150/150',
    bio: 'Fitness enthusiast focused on strength training and nutrition. Love tracking progress and pushing my limits.',
    level: 'Advanced',
    tier: 'Premium'
  },
  stats: {
    totalWorkouts: 127,
    currentStreak: 12,
    longestStreak: 28,
    totalCalories: 15420,
    personalRecords: 8,
    achievements: 24,
    workoutHours: 96
  },
  achievements: [
    { id: 1, name: 'Early Bird', description: '50 morning workouts', icon: <Zap className="w-4 h-4" />, earned: true, date: '2024-03-01' },
    { id: 2, name: 'Consistency King', description: '30-day streak', icon: <Flame className="w-4 h-4" />, earned: true, date: '2024-02-15' },
    { id: 3, name: 'Iron Will', description: '100 workouts completed', icon: <Trophy className="w-4 h-4" />, earned: true, date: '2024-03-10' },
    { id: 4, name: 'Beast Mode', description: '200 workouts completed', icon: <Activity className="w-4 h-4" />, earned: false },
    { id: 5, name: 'Calorie Crusher', description: '50,000 calories burned', icon: <Target className="w-4 h-4" />, earned: false },
    { id: 6, name: 'Marathon Runner', description: '1000 miles logged', icon: <TrendingUp className="w-4 h-4" />, earned: false }
  ],
  preferences: {
    notifications: true,
    darkMode: true,
    units: 'imperial',
    language: 'en',
    privateProfile: false
  }
};

// Profile Header Component
function ProfileHeader({ profile, onEdit }) {
  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-blue-500 p-1">
            <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center overflow-hidden">
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-base-0">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="headline-lg text-white">{profile.name}</h2>
            <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <span className="text-yellow-400 text-xs font-medium">{profile.tier}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">{profile.bio}</p>
          
          <div className="flex items-center gap-4">
            <button onClick={onEdit} className="btn btn-secondary">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Overview Component
function StatsOverview({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
          <Activity className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{stats.totalWorkouts}</p>
        <p className="text-gray-400 text-sm">Total Workouts</p>
      </div>
      
      <div className="card text-center">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
          <Flame className="w-6 h-6 text-orange-400" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{stats.currentStreak}</p>
        <p className="text-gray-400 text-sm">Current Streak</p>
      </div>
      
      <div className="card text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
          <Trophy className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{stats.achievements}</p>
        <p className="text-gray-400 text-sm">Achievements</p>
      </div>
      
      <div className="card text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{stats.workoutHours}</p>
        <p className="text-gray-400 text-sm">Hours Trained</p>
      </div>
    </div>
  );
}

// Recent Achievements Component
function RecentAchievements({ achievements }) {
  const recentAchievements = achievements.filter(a => a.earned).slice(0, 3);
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline-sm text-white">Recent Achievements</h3>
        <Link to="/achievements" className="text-green-400 text-sm hover:underline">
          View All
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{achievement.name}</p>
              <p className="text-gray-400 text-xs">{achievement.description}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 text-xs font-medium">
                {new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Menu Component
function SettingsMenu({ preferences, onNavigate }) {
  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: <User className="w-4 h-4" />, label: 'Edit Profile', path: '/profile/edit' },
        { icon: <Shield className="w-4 h-4" />, label: 'Privacy & Security', path: '/settings/privacy' },
        { icon: <CreditCard className="w-4 h-4" />, label: 'Subscription', path: '/billing' }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell className="w-4 h-4" />, label: 'Notifications', path: '/settings/notifications' },
        { icon: <Moon className="w-4 h-4" />, label: 'Appearance', path: '/settings/appearance' },
        { icon: <Globe className="w-4 h-4" />, label: 'Language & Region', path: '/settings/language' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle className="w-4 h-4" />, label: 'Help Center', path: '/help' },
        { icon: <FileText className="w-4 h-4" />, label: 'Terms & Privacy', path: '/legal' },
        { icon: <Download className="w-4 h-4" />, label: 'Export Data', path: '/settings/export' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {menuSections.map((section, index) => (
        <div key={index} className="card">
          <h3 className="headline-sm text-white mb-4">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => onNavigate(item.path)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300">
                    {item.icon}
                  </div>
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  return (
    <div className="card">
      <h3 className="headline-sm text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn btn-secondary justify-center">
          <Share2 className="w-4 h-4" />
          Share Profile
        </button>
        <button className="btn btn-secondary justify-center">
          <Download className="w-4 h-4" />
          Export Data
        </button>
        <button className="btn btn-secondary justify-center">
          <BarChart3 className="w-4 h-4" />
          View Stats
        </button>
        <button className="btn btn-danger justify-center">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Main Profile Component
function ProfileV2() {
  const [userData, setUserData] = useState(mockUserData);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleSignOut = () => {
    // Handle sign out logic
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading Profile...</p>
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
              <h1 className="display-sm text-white mb-1">Profile</h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
            <Link to="/dashboard" className="btn btn-ghost">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <ProfileHeader profile={userData.profile} onEdit={handleEditProfile} />
        
        {/* Stats Overview */}
        <div className="mt-6">
          <StatsOverview stats={userData.stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Achievements */}
            <RecentAchievements achievements={userData.achievements} />
            
            {/* Settings Menu */}
            <SettingsMenu preferences={userData.preferences} onNavigate={handleNavigate} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Account Status */}
            <div className="card bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-400" />
                <h3 className="headline-sm text-white">Premium Member</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                You're enjoying all premium features including unlimited workouts, advanced analytics, and priority support.
              </p>
              <button className="btn btn-secondary w-full justify-center">
                <CreditCard className="w-4 h-4" />
                Manage Subscription
              </button>
            </div>
            
            {/* Progress Summary */}
            <div className="card">
              <h3 className="headline-sm text-white mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Workouts</span>
                  <span className="text-white font-medium">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Calories Burned</span>
                  <span className="text-white font-medium">8,420</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Active Days</span>
                  <span className="text-white font-medium">22</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">New PRs</span>
                  <span className="text-white font-medium">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileV2;
