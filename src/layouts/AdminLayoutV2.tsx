import React, { ReactNode, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CreditCard, 
  Search, 
  Bell, 
  Menu, 
  X,
  Database,
  Terminal,
  Activity,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children?: ReactNode;
}

const adminNavItems = [
  { group: 'Core', items: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ]},
  { group: 'Operations', items: [
    { label: 'Billing', path: '/admin/billing', icon: CreditCard },
    { label: 'Database', path: '/admin/db', icon: Database },
    { label: 'Logs', path: '/admin/logs', icon: Terminal },
  ]},
  { group: 'System', items: [
    { label: 'Security', path: '/admin/security', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ]}
];

export default function AdminLayoutV2({ children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 flex font-sans selection:bg-primary/30">
      {/* Dense Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-sidebar bg-[#09090b] border-r border-zinc-800/50 transition-all duration-300 flex flex-col",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-14 flex items-center px-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center shrink-0">
               <Command className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-white truncate">Atlas Admin</span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {adminNavItems.map((group, idx) => (
            <div key={group.group} className={cn("mb-6", isSidebarCollapsed ? "px-2" : "px-4")}>
              {!isSidebarCollapsed && (
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 px-2">
                  {group.group}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md transition-colors group relative",
                        isActive 
                          ? "bg-zinc-800 text-white" 
                          : "hover:bg-zinc-800/50 hover:text-zinc-200"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300")} />
                      {!isSidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      {isActive && !isSidebarCollapsed && (
                         <div className="ml-auto w-1 h-4 bg-primary rounded-full" />
                      )}
                      {isSidebarCollapsed && (
                         <div className="absolute left-14 bg-zinc-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
                            {item.label}
                         </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded hover:bg-zinc-800 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        {/* Top Header */}
        <header className="h-14 bg-[#09090b]/80 backdrop-blur border-b border-zinc-800/50 sticky top-0 z-header flex items-center justify-between px-6">
          <div className="flex items-center flex-1 max-w-xl">
             <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Global search (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">System Healthy</span>
             </div>

             <button className="relative p-2 text-zinc-500 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#09090b]" />
             </button>

             <div className="w-px h-6 bg-zinc-800" />

             <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-white leading-none mb-1">Admin Ops</p>
                   <p className="text-[10px] text-zinc-500">Superuser</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all">
                   <UserIcon className="w-4 h-4" />
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
          {children}
        </main>

        {/* Console/Status Bar */}
        <footer className="h-8 bg-[#09090b] border-t border-zinc-800/50 px-4 flex items-center justify-between text-[10px] font-mono text-zinc-600">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                 <Activity className="w-3 h-3" />
                 API: 24ms
              </span>
              <span className="flex items-center gap-1">
                 <Database className="w-3 h-3" />
                 v2.4.1-stable
              </span>
           </div>
           <div>
              LATENCY: 12ms / REGION: US-EAST-1
           </div>
        </footer>
      </div>
    </div>
  );
}
