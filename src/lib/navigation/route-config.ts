import { SCREENS, ScreenEntry, ScreenAccess, UserRole, Platform, LayoutType } from './screen-registry';

/**
 * ROUTES Constants
 * Derived from the canonical screen registry.
 * Use these for navigation: navigate(ROUTES.today)
 */
export const ROUTES = SCREENS.reduce((acc, screen) => {
  // Convert kebab-case or id to camelCase for the constant key if needed, 
  // but here we'll keep them consistent with registry IDs for predictability.
  // We map the ID to the path.
  const key = screen.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  acc[key] = screen.path;
  return acc;
}, {} as Record<string, string>);

/**
 * Default home page per role.
 */
export const ROLE_HOME: Record<UserRole, string> = {
  athlete: ROUTES.today,
  coach: ROUTES.coachDashboard,
  nutritionist: ROUTES.nutritionistDashboard,
  clinician: ROUTES.clinicianDashboard,
  admin: ROUTES.adminOverview,
  creator: ROUTES.today, // Default to today for creator for now
};

/**
 * Route Configuration for React Router
 * This can be used to dynamically generate Route components.
 */
export interface RouteConfig extends ScreenEntry {
  // Any additional properties needed for routing
}

export const ROUTE_CONFIG: RouteConfig[] = [...SCREENS];

/**
 * Helper to get screen configuration by ID
 */
export const getScreenById = (id: string): ScreenEntry | undefined => {
  return SCREENS.find(s => s.id === id);
};

/**
 * Helper to get screen configuration by Path
 */
export const getScreenByPath = (path: string): ScreenEntry | undefined => {
  // Exact match first
  const exact = SCREENS.find(s => s.path === path);
  if (exact) return exact;

  // Pattern match (simplified for React Router paths like /Protocols/:id)
  return SCREENS.find(screen => {
    const pattern = screen.path.replace(/:[^\/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
};

/**
 * RBAC & Access Helpers
 */
export const canAccessScreen = (
  screenId: string, 
  userRole: UserRole, 
  isPremium: boolean = false
): boolean => {
  const screen = getScreenById(screenId);
  if (!screen) return false;

  // Check Role
  if (!screen.roles.includes(userRole)) return false;

  // Check Access Level
  if (screen.access === 'premium' && !isPremium) return false;

  return true;
};

/**
 * Platform Helpers
 */
export const isPlatformCompatible = (screenId: string, currentPlatform: Platform): boolean => {
  const screen = getScreenById(screenId);
  if (!screen) return false;

  if (screen.platform === 'all') return true;
  return screen.platform === currentPlatform;
};

/**
 * Legacy Redirect Map
 * Generated from legacyAliases in the registry.
 */
export const LEGACY_REDIRECTS = SCREENS.reduce((acc, screen) => {
  if (screen.legacyAliases) {
    screen.legacyAliases.forEach(alias => {
      acc[alias] = screen.path;
    });
  }
  return acc;
}, {} as Record<string, string>);
