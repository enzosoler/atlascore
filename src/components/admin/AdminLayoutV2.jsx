/**
 * Atlas Core Admin Layout v2.0
 * Premium admin dashboard layout with new design system
 * Built from scratch with the new design system
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Home,
  Database,
  Zap,
  Target,
  Crown
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock admin data
const mockAdminData = {
  user: {
    name: 'Admin User',
    email: 'admin@atlascore.com',
    role: 'Super Admin',
    avatar: '/api/placeholder/40/40'
  },
  stats: {
    totalUsers: 15420,
    activeUsers: 12480,
    newUsers: 234,
    revenue: 45680,
    conversion: 3.2
  },
  notifications: [
    { id: 1, type: 'warning', message: 'Server load high on EU region', time: '5 min ago' },
    { id: 2, type: 'info', message: 'New feature deployment successful', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Monthly revenue target achieved', time: '2 hours ago' }
  ]
};

// Sidebar Navigation Component
function AdminSidebar({ isOpen, onClose, activeSection, onSectionChange }) {
  const menuItems = [
    {
      section: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'var(--color-primary-500)'
    },
    {
      section: 'users',
      label: 'Users',
      icon: <Users className="w-5 h-5" />,
      color: 'var(--color-secondary-500)'
    },
    {
      section: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'var(--color-success)'
    },
    {
      section: 'billing',
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'var(--color-warning)'
    },
    {
      section: 'content',
      label: 'Content',
      icon: <FileText className="w-5 h-5" />,
      color: 'var(--color-info)'
    },
    {
      section: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      color: 'var(--color-danger)'
    },
    {
      section: 'support',
      label: 'Support',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'var(--color-secondary-500)'
    },
    {
      section: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'var(--color-gray-400)'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-base-100 border-r border-gray-800 transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-sm">Admin Panel</span>
                <p className="text-gray-400 text-xs">Atlas Core</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => {
                    onSectionChange(item.section);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === item.section
                      ? 'bg-gray-800 text-white border-l-4'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  style={{
                    borderLeftColor: activeSection === item.section ? item.color : 'transparent'
                  }}
                >
                  <div className="w-5 h-5 flex items-center justify-center" style={{ color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
          
          {/* User Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{mockAdminData.user.name}</p>
                <p className="text-gray-400 text-xs truncate">{mockAdminData.user.role}</p>
              </div>
              <button className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Stats Card Component
function StatsCard({ title, value, change, icon, color = 'var(--color-primary-500)' }) {
  const isPositive = change > 0;
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    </div>
  );
}

// Notification Item Component
function NotificationItem({ notification }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-300 text-sm">{notification.message}</p>
        <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
      </div>
    </div>
  );
}

// Header Component
function AdminHeader({ onMenuToggle, title, subtitle }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-base-100/80 border-b border-gray-800">
      <div className="px-6 py-4">
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none text-sm"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white relative"
              >
                <Bell className="w-4 h-4" />
                {mockAdminData.notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-base-100 border border-gray-800 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockAdminData.notifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Main Admin Layout Component
function AdminLayoutV2({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const getSectionTitle = () => {
    const titles = {
      overview: 'Dashboard Overview',
      users: 'User Management',
      analytics: 'Analytics & Reports',
      billing: 'Billing & Revenue',
      content: 'Content Management',
      security: 'Security & Compliance',
      support: 'Customer Support',
      settings: 'System Settings'
    };
    return titles[activeSection] || 'Dashboard';
  };

  const getSectionSubtitle = () => {
    const subtitles = {
      overview: 'Monitor key metrics and system health',
      users: 'Manage user accounts and permissions',
      analytics: 'Track performance and user behavior',
      billing: 'Revenue and subscription management',
      content: 'Manage app content and resources',
      security: 'Security logs and compliance',
      support: 'Customer tickets and inquiries',
      settings: 'System configuration and preferences'
    };
    return subtitles[activeSection] || '';
  };

  return (
    <div className="min-h-screen bg-base-0">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      <div className="lg:ml-64">
        <AdminHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={getSectionTitle()}
          subtitle={getSectionSubtitle()}
        />
        
        <main className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Users"
                  value={mockAdminData.stats.totalUsers}
                  change={2.3}
                  icon={<Users className="w-5 h-5" />}
                  color="var(--color-primary-500)"
                />
                <StatsCard
                  title="Active Users"
                  value={mockAdminData.stats.activeUsers}
                  change={1.8}
                  icon={<Activity className="w-5 h-5" />}
                  color="var(--color-success)"
                />
                <StatsCard
                  title="New Users"
                  value={mockAdminData.stats.newUsers}
                  change={-5.2}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="var(--color-warning)"
                />
                <StatsCard
                  title="Revenue"
                  value={`$${mockAdminData.stats.revenue.toLocaleString()}`}
                  change={8.1}
                  icon={<Target className="w-5 h-5" />}
                  color="var(--color-secondary-500)"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {children}
                </div>
                <div className="space-y-4">
                  <div className="card">
                    <h3 className="headline-sm text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {mockAdminData.notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection !== 'overview' && children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayoutV2;
