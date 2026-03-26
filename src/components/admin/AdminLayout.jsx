import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
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
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, permission: 'manage_users' },
  { path: '/admin/users', label: 'Users', icon: Users, permission: 'manage_users' },
  { path: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard, permission: 'manage_subscriptions' },
  { path: '/admin/roles', label: 'Roles & Permissions', icon: Shield, permission: 'manage_roles' },
  { path: '/admin/audit', label: 'Audit Log', icon: FileText, permission: 'view_audit_logs' },
  { path: '/admin/settings', label: 'Settings', icon: Settings, permission: 'manage_feature_flags' },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
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

    try {
      // Check if user has admin permissions
      const { data: userPermissions, error } = await supabase
        .from('user_permissions')
        .select('permission_name, permission_category')
        .eq('user_id', user.id);

      if (error) throw error;

      const permNames = userPermissions?.map(p => p.permission_name) || [];
      setPermissions(permNames);

      // Check if user has any admin access
      const hasAdminAccess = userPermissions?.some(p => 
        ['manage_users', 'manage_subscriptions', 'view_audit_logs', 'manage_roles', 'moderate_photos'].includes(p.permission_name)
      );

      if (!hasAdminAccess) {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permissionName) => permissions.includes(permissionName);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Moderation Mode Warning Banner */}
      {isModerationMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Moderation Mode Active — All actions are logged</span>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebar 
            navItems={filteredNavItems} 
            onLogout={handleLogout}
            isModerationMode={isModerationMode}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-semibold">Atlas Core Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}

          {/* Moderation Console Link (separate module) */}
          {hasPermission('moderate_photos') && (
            <NavLink
              to="/moderation"
              className={({ isActive }) =>
                cn(
                  'mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive || isModerationMode
                    ? 'bg-amber-500 text-amber-950'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <AlertTriangle className="h-4 w-4" />
              Enter Moderation
            </NavLink>
          )}
        </nav>

        <div className="border-t p-4">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {permissions.length} permissions granted
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto",
        isModerationMode && "pt-10"
      )}>
        <div className="container mx-auto p-6">
          <Outlet context={{ permissions, hasPermission, setIsModerationMode }} />
        </div>
      </main>
    </div>
  );
}

function MobileSidebar({ navItems, onLogout, isModerationMode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold">Atlas Core Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
