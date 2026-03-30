import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Capacitor } from '@capacitor/core';

// Evaluated once at module load — never changes at runtime
const IS_NATIVE = Capacitor.isNativePlatform();

/**
 * WebOnlyRoute — blocks access to a route when running as a native mobile app.
 *
 * Usage:
 *   <Route path="/pricing" element={<WebOnlyRoute fallback="/Today"><Pricing /></WebOnlyRoute>} />
 *
 * - `fallback` — redirect target on mobile. If omitted, does an auth-aware redirect:
 *   authenticated → /Today, unauthenticated → /welcome
 */
export function WebOnlyRoute({ children, fallback = null }) {
  const { isAuthenticated, authState } = useAuth();

  // On web — render normally
  if (!IS_NATIVE) return children;

  // On native mobile — redirect away
  if (fallback) return <Navigate to={fallback} replace />;

  // Auth-aware redirect (for landing page, blog, etc.)
  if (authState === 'loading') return null;
  return <Navigate to={isAuthenticated ? '/Today' : '/auth'} replace />;
}
