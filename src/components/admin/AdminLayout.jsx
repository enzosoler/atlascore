import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Shield,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

const ADMIN = ROUTES.admin;

const primaryNav = [
  { path: ADMIN,                    label: 'Overview',       icon: LayoutDashboard, end: true },
  { path: `${ADMIN}/users`,        label: 'Users',          icon: Users },
  { path: `${ADMIN}/ai-system`,    label: 'AI System',      icon: Brain },
  { path: `${ADMIN}/logs`,         label: 'Logs & Errors',  icon: FileText },
  { path: `${ADMIN}/subscriptions`,label: 'Subscriptions',  icon: CreditCard },
];

const secondaryNav = [
  { path: `${ADMIN}/roles`,    label: 'Roles',     icon: Shield },
  { path: `${ADMIN}/invites`,  label: 'Invites',   icon: Mail },
  { path: `${ADMIN}/settings`, label: 'Settings',  icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModerationMode, setIsModerationMode] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If the user already has the admin atlas_role (validated by RouteGuard), grant access
    // immediately. The user_permissions table adds granular feature-level permissions on top,
    // but an empty table must not block a valid admin.
    const isAdminRole = user.atlas_role === 'admin';

    try {
      const { data: userPermissions, error } = await supabase
        .from('user_permissions')
        .select('permission_name, permission_category')
        .eq('user_id', user.id);

      if (error) throw error;

      const permNames = userPermissions?.map(p => p.permission_name) || [];
      setPermissions(permNames);

      const hasGranularAccess = userPermissions?.some(p =>
        ['manage_users', 'manage_subscriptions', 'view_audit_logs', 'manage_roles', 'moderate_photos'].includes(p.permission_name)
      );

      // Allow if they have either the admin role OR granular permissions
      if (!isAdminRole && !hasGranularAccess) {
        navigate(ROUTES.today);
      }
    } catch (error) {
      console.error('Error loading admin permissions:', error);
      // Fall back to role-based access — don't kick a valid admin just because
      // the permissions table query failed.
      if (!isAdminRole) {
        navigate(ROUTES.today);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Admins with no granular permissions yet see all nav items by role
  const isAdminRole = user?.atlas_role === 'admin';
  const hasPermission = (permissionName) =>
    isAdminRole || permissions.includes(permissionName);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Top bar — logout always visible */}
      <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-3 lg:p-4">
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => { navigate(ROUTES.today + '?skip_admin=1'); }}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to app
        </Button>
        <Button variant="destructive" size="sm" className="text-xs" onClick={handleLogout}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Logout
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar user={user} onLogout={handleLogout} navigate={navigate} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
        <Sidebar user={user} onLogout={handleLogout} navigate={navigate} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-4">
        <div className="mx-auto max-w-6xl p-4 lg:p-6">
          <Outlet context={{ permissions, hasPermission, setIsModerationMode }} />
        </div>
      </main>
    </div>
  );
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )
      }
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}

function Sidebar({ user, onLogout, navigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-[15px] font-bold tracking-tight">atlas.core</span>
        <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">ADMIN</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Core</p>
        {primaryNav.map((item) => <NavItem key={item.path} item={item} />)}

        <div className="my-3 border-t" />
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">System</p>
        {secondaryNav.map((item) => <NavItem key={item.path} item={item} />)}
      </nav>

      <div className="border-t p-3">
        <p className="truncate px-3 text-[12px] font-medium text-foreground">{user?.email}</p>
        <p className="px-3 text-[11px] text-muted-foreground">{user?.atlas_role}</p>
      </div>
    </div>
  );
}
