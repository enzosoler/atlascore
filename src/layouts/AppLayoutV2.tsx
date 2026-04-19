import React, { useState, useEffect, ReactNode } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useViewportHeight } from '@/hooks/use-viewport-height';
import { tapLight, tapMedium } from '@/lib/haptics';
import { cn } from '@/lib/utils';

/**
 * Slot-based components for AppLayoutV2
 */

interface LayoutSlotProps {
  children: ReactNode;
  className?: string;
}

export function AppHeader({ children, className }: LayoutSlotProps) {
  return <div className={cn("flex items-center justify-between h-16 px-4 border-b border-border/40", className)}>{children}</div>;
}

export function AppContent({ children, className }: LayoutSlotProps) {
  return <div className={cn("flex-1 overflow-y-auto safe-scroll", className)}>{children}</div>;
}

export function AppActionBar({ children, className }: LayoutSlotProps) {
  return <div className={cn("sticky-bottom-bar flex items-center justify-around gap-2", className)}>{children}</div>;
}

/**
 * Main AppLayoutV2 Component
 */

const IS_NATIVE = Capacitor.isNativePlatform();

const navItems = [
  { label: 'Today', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Train', path: '/workout', icon: Dumbbell },
  { label: 'Stats', path: '/progress', icon: BarChart3 },
  { label: 'Photos', path: '/progress-photos', icon: Camera },
  { label: 'Profile', path: '/profile', icon: User },
];

export default function AppLayoutV2() {
  useViewportHeight();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavClick = (path: string) => {
    tapLight();
    if (location.pathname === path) return;
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-shell bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-sidebar hidden lg:flex flex-col w-sidebar bg-card border-r border-border/50 transition-transform duration-300",
        !isSidebarOpen && "lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-border/40">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-secondary bg-clip-text text-transparent">
              Atlas Core
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border/40 space-y-2">
            <button 
              onClick={() => handleNavClick('/settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => tapMedium()}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-col flex-1 lg:pl-sidebar h-full overflow-hidden">
        {/* Mobile Header (Only shown if page doesn't provide its own) */}
        <header className="lg:hidden h-header flex items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur-xl z-header sticky top-0 pt-[env(safe-area-inset-top)] h-[calc(var(--header-h)+env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
             </div>
             <span className="font-bold text-lg">Atlas</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
        </header>

        {/* Page Content Slot */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden flex items-center justify-around h-tab-bar bg-card/80 backdrop-blur-2xl border-t border-border/40 pb-[env(safe-area-inset-bottom)] h-[calc(var(--tab-bar-h)+env(safe-area-inset-bottom))] z-tabbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6 transition-transform duration-200", isActive && "scale-110")} />
                  {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                    />
                  )}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-sidebar bg-card z-[101] lg:hidden border-r border-border/50 shadow-2xl"
            >
               {/* Same sidebar content as desktop but for mobile drawer */}
               <div className="flex flex-col h-full pt-[env(safe-area-inset-top)]">
                <div className="h-16 flex items-center justify-between px-6 border-b border-border/40">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-secondary bg-clip-text text-transparent">
                    Atlas Core
                  </span>
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                          isActive 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-border/40 pb-[max(1rem,env(safe-area-inset-bottom))]">
                   <button 
                    onClick={() => handleNavClick('/settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
