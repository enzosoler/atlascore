import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  LayoutDashboard, Users, CreditCard, Shield, FileText, Settings,
  LogOut, Menu, Brain, Mail, ArrowLeft, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

const ADMIN = ROUTES.admin;

const primaryNav = [
  { path: ADMIN,                     label: 'Overview',      icon: LayoutDashboard, end: true },
  { path: `${ADMIN}/users`,         label: 'Users',         icon: Users },
  { path: `${ADMIN}/ai-system`,     label: 'AI System',     icon: Brain },
  { path: `${ADMIN}/logs`,          label: 'Logs & Errors', icon: FileText },
  { path: `${ADMIN}/subscriptions`, label: 'Subscriptions', icon: CreditCard },
];

const secondaryNav = [
  { path: `${ADMIN}/roles`,    label: 'Roles',    icon: Shield },
  { path: `${ADMIN}/invites`,  label: 'Invites',  icon: Mail },
  { path: `${ADMIN}/settings`, label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const isAdmin = user.atlas_role === 'admin';
    supabase.from('user_permissions').select('permission_name').eq('user_id', user.id)
      .then(({ data }) => { setPermissions(data?.map(p => p.permission_name) || []); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    if (!isAdmin) navigate(ROUTES.today);
  }, [user]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--bg))]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--brand))]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Top-right actions */}
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.today + '?skip_admin=1')}
          className="flex items-center gap-1.5 rounded-[10px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> App
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-[10px] bg-[hsl(var(--err))] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-[hsl(var(--card))]">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 text-[hsl(var(--fg-2))]"><X className="h-4 w-4" /></button>
            <SidebarContent user={user} onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] lg:flex lg:flex-col">
        <SidebarContent user={user} />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          <Outlet context={{ permissions }} />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ user, onNav }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-[hsl(var(--border)/0.5)] px-5">
        <span className="text-[14px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">atlas.core</span>
        <span className="rounded-[6px] bg-[hsl(var(--brand)/0.12)] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[hsl(var(--brand))]">ADMIN</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Core</p>
        {primaryNav.map((item) => <NavItem key={item.path} item={item} onClick={onNav} />)}
        <div className="my-3 border-t border-[hsl(var(--border)/0.4)]" />
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">System</p>
        {secondaryNav.map((item) => <NavItem key={item.path} item={item} onClick={onNav} />)}
      </nav>

      <div className="border-t border-[hsl(var(--border)/0.5)] px-5 py-3">
        <p className="truncate text-[12px] font-medium text-[hsl(var(--fg))]">{user?.email}</p>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{user?.atlas_role}</p>
      </div>
    </div>
  );
}

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all',
          isActive
            ? 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
            : 'text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.6)] hover:text-[hsl(var(--fg))]'
        )
      }
    >
      <item.icon className="h-4 w-4" strokeWidth={1.8} />
      {item.label}
    </NavLink>
  );
}
