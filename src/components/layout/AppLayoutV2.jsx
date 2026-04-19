/**
 * Atlas Core App Layout v2.0
 * Premium app layout with new design system
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  BarChart3,
  Camera,
  User,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Activity,
  Flame,
  Target,
  Zap,
  ChevronDown,
  LogOut,
  Crown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// Import design system classes
import '@/styles/design-system.css';

/**
 * Maps the real Supabase user (via useAuth) into the shape this layout expects.
 * NEVER hardcode demo users here — that leaked into production before (Alex Johnson bug).
 */
function useLayoutUser() {
  const { user } = useAuth();
  if (!user) {
    return { name: '', email: '', tier: 'Free', avatar: null, notifications: 0, streak: 0 };
  }
  const metadata = user.user_metadata ?? {};
  return {
    name: user.full_name || (user.email ? user.email.split('@')[0] : 'Athlete'),
    email: user.email || '',
    tier: metadata.tier || (user.atlas_role === 'coach' ? 'Coach' : 'Free'),
    avatar: metadata.avatar_url || null,
    notifications: 0, // TODO: wire to real notifications service
    streak: metadata.streak || 0,
  };
}

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    activeIcon: <Home className="w-5 h-5" />,
    label: 'Home'
  },
  {
    name: 'Workout',
    path: '/workout',
    icon: <Dumbbell className="w-5 h-5" />,
    activeIcon: <Dumbbell className="w-5 h-5" />,
    label: 'Train'
  },
  {
    name: 'Progress',
    path: '/progress',
    icon: <BarChart3 className="w-5 h-5" />,
    activeIcon: <BarChart3 className="w-5 h-5" />,
    label: 'Stats'
  },
  {
    name: 'Photos',
    path: '/progress-photos',
    icon: <Camera className="w-5 h-5" />,
    activeIcon: <Camera className="w-5 h-5" />,
    label: 'Photos'
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: <User className="w-5 h-5" />,
    activeIcon: <User className="w-5 h-5" />,
    label: 'Profile'
  }
];

// Bottom Navigation Component
function BottomNavigation({ items, activePath, onItemClick }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-0/95 backdrop-blur-xl border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-around h-16">
          {items.map((item, index) => {
            const isActive = item.path === activePath;
            return (
              <button
                key={index}
                onClick={() => onItemClick(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center ${
                  isActive ? 'text-green-400' : 'text-current'
                }`}>
                  {isActive ? item.activeIcon : item.icon}
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-green-400' : 'text-current'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Top Navigation Bar Component
function TopNavigationBar({ title, subtitle, onMenuToggle, onSearch, notifications, onNotifications, user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-base-0/80 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuToggle}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="headline-lg text-white">{title}</h1>
              {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onSearch}
              className="hidden md:block w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white relative"
              >
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{notifications}</span>
                  </div>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-base-0 border border-gray-800 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 text-center text-gray-400">
                      <p className="text-sm">No new notifications</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-base-0 border border-gray-800 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.tier}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left">
                      <LogOut className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Sidebar Navigation Component
function SidebarNavigation({ items, activePath, onItemClick, isOpen, onClose, user }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-base-0 border-r border-gray-800 transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Atlas Core</span>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {items.map((item, index) => {
                const isActive = item.path === activePath;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      onItemClick(item.path);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {isActive ? item.activeIcon : item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Divider */}
            <div className="my-6 border-t border-gray-800"></div>
            
            {/* Streak Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{user.streak} days</div>
              <div className="text-gray-400 text-sm">Keep it going!</div>
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user.name}</p>
                <p className="text-gray-400 text-xs truncate">{user.tier}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Crown className="w-3 h-3 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Floating Action Button Component
function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center z-50"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}

// Main App Layout Component
function AppLayoutV2() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const layoutUser = useLayoutUser();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSearch = () => {
    console.log('Search clicked');
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
  };

  const handleFabClick = () => {
    navigate('/workout');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const item = navigationItems.find(item => item.path === path);
    return item ? item.name : 'Atlas Core';
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    const subtitles = {
      '/dashboard': 'Track your fitness journey',
      '/workout': 'Log your training sessions',
      '/progress': 'Monitor your progress',
      '/progress-photos': 'Visual transformation tracking',
      '/profile': 'Manage your account'
    };
    return subtitles[path] || '';
  };

  return (
    <div className="min-h-screen bg-base-0">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        items={navigationItems}
        activePath={location.pathname}
        onItemClick={handleNavigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={layoutUser}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <TopNavigationBar
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSearch={handleSearch}
          notifications={layoutUser.notifications}
          onNotifications={handleNotifications}
          user={layoutUser}
        />

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <BottomNavigation
          items={navigationItems}
          activePath={location.pathname}
          onItemClick={handleNavigation}
        />

        {/* Floating Action Button */}
        <FloatingActionButton onClick={handleFabClick} />
      </div>
    </div>
  );
}

export default AppLayoutV2;
