/**
 * Atlas Core Navigation v2.0
 * Premium navigation and interaction patterns
 * Built from scratch with the new design system
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  BarChart3,
  Camera,
  User,
  Settings,
  Menu,
  X,
  Plus,
  Search,
  Bell,
  ChevronRight,
  Activity,
  Target,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// Import design system classes
import '@/styles/design-system.css';

// Navigation data
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

// Floating Action Button Component
function FloatingActionButton({ icon, label, onClick, position = 'bottom-right' }) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses[position]} w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group z-50`}
      title={label}
    >
      <div className="relative">
        {icon}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </div>
    </button>
  );
}

// Bottom Navigation Component
function BottomNavigation({ items, activePath, onItemClick }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-0/95 backdrop-blur-xl border-t border-white/10 z-50">
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

// Sidebar Navigation Component
function SidebarNavigation({ items, activePath, onItemClick, isOpen, onClose }) {
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
        fixed top-0 left-0 h-full w-64 bg-base-0 border-r border-white/10 transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
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
            <div className="my-6 border-t border-white/10"></div>
            
            {/* Secondary Navigation */}
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
          
          {/* Footer */}
          <SidebarUserFooter />

        </div>
      </aside>
    </>
  );
}

// Sidebar user footer — reads REAL user from AuthContext (no mock Alex Johnson)
function SidebarUserFooter() {
  const { user } = useAuth();
  const name = user?.full_name || (user?.email ? user.email.split('@')[0] : 'Athlete');
  const tierLabel =
    user?.user_metadata?.tier ||
    (user?.atlas_role === 'coach' ? 'Coach' : 'Member');
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 p-[2px] mx-auto mb-3">
          <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[12px] font-semibold tracking-tight">{initials || '·'}</span>
            )}
          </div>
        </div>
        <p className="text-white font-medium text-sm truncate max-w-[200px] mx-auto" title={name}>{name || '—'}</p>
        <p className="text-gray-400 text-xs truncate max-w-[200px] mx-auto">{tierLabel}</p>
      </div>
    </div>
  );
}

// Top Navigation Bar Component
function TopNavigationBar({ title, subtitle, onMenuToggle, onSearch, notifications, onNotifications }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-base-0/80 border-b border-white/10">
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
              <h1 className="headline-md text-white">{title}</h1>
              {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onSearch}
              className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <button 
              onClick={onNotifications}
              className="relative w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{notifications}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Breadcrumb Navigation Component
function BreadcrumbNavigation({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm py-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          {item.path ? (
            <Link 
              to={item.path}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Quick Actions Bar Component
function QuickActionsBar({ actions }) {
  return (
    <div className="fixed bottom-20 left-0 right-0 bg-base-0/95 backdrop-blur-xl border-t border-white/10 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-3 overflow-x-auto">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 whitespace-nowrap"
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tab Navigation Component
function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-xl">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-green-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// Main Navigation Container Component
function NavigationV2({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Search clicked');
  };

  const handleNotifications = () => {
    // Implement notifications functionality
    console.log('Notifications clicked');
    setNotifications(0);
  };

  const quickActions = [
    {
      icon: <Plus className="w-4 h-4" />,
      label: 'Quick Workout',
      onClick: () => handleNavigation('/workout')
    },
    {
      icon: <Camera className="w-4 h-4" />,
      label: 'Progress Photo',
      onClick: () => handleNavigation('/progress-photos')
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: 'Set Goal',
      onClick: () => console.log('Set goal clicked')
    }
  ];

  return (
    <div className="min-h-screen bg-base-0">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        items={navigationItems}
        activePath={location.pathname}
        onItemClick={handleNavigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <TopNavigationBar
          title="Atlas Core"
          subtitle="Premium Fitness Tracker"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSearch={handleSearch}
          notifications={notifications}
          onNotifications={handleNotifications}
        />

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
          {children}
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <BottomNavigation
          items={navigationItems}
          activePath={location.pathname}
          onItemClick={handleNavigation}
        />

        {/* Floating Action Button */}
        <FloatingActionButton
          icon={<Plus className="w-6 h-6" />}
          label="Quick Workout"
          onClick={() => handleNavigation('/workout')}
          position="bottom-right"
        />

        {/* Quick Actions Bar */}
        <QuickActionsBar actions={quickActions} />
      </div>
    </div>
  );
}

export default NavigationV2;
export {
  FloatingActionButton,
  BottomNavigation,
  SidebarNavigation,
  TopNavigationBar,
  BreadcrumbNavigation,
  QuickActionsBar,
  TabNavigation
};
