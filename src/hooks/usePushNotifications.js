/**
 * usePushNotifications
 *
 * React hook that ties notificationService into the authenticated app.
 *
 * Mount this hook once inside AuthenticatedApp (inside the Router) so it has
 * access to both `useAuth` and `useNavigate`.
 *
 * What it does
 *   1. When the authenticated user resolves, initialise the notification service.
 *   2. On foreground push → show an in-app Sonner toast (NOT a fake iOS banner).
 *   3. On notification tap → safely navigate to the route in the payload.
 *   4. On logout (user becomes null) → destroy service + remove push token.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';

const IS_NATIVE = Capacitor.isNativePlatform();

// Routes that can be targeted by a notification tap payload.
// Add entries here as new notification types are introduced.
const ALLOWED_ROUTES = new Set(Object.values(ROUTES));

function resolveRoute(route) {
  if (!route) return null;
  // Accept exact path strings that are in the known route set,
  // or any path that starts with '/' (for parameterised routes like /profile/123).
  if (ALLOWED_ROUTES.has(route) || route.startsWith('/')) return route;
  console.warn('[usePushNotifications] unknown route in notification payload:', route);
  return null;
}

export function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const initialisedForRef = useRef(null); // tracks which userId we initialised for

  useEffect(() => {
    if (!IS_NATIVE) return;
    if (!isAuthenticated || !user?.id) return;

    // Don't re-initialise if we already did for this user.
    if (initialisedForRef.current === user.id) return;
    initialisedForRef.current = user.id;

    const onForegroundPush = ({ title, body }) => {
      // Show an in-app toast instead of a fake native-style banner.
      // The toast is positioned at the bottom (see sonner.jsx) so it never
      // overlaps the iOS status bar or looks like a system notification.
      toast(title, {
        description: body || undefined,
        duration: 5000,
      });
    };

    const onTap = ({ route }) => {
      const target = resolveRoute(route);
      if (target) {
        navigate(target, { replace: false });
      }
    };

    notificationService.init({
      userId: user.id,
      onForegroundPush,
      onTap,
    });

    // Cleanup runs when user changes (e.g. logout) or component unmounts.
    return () => {
      // Only destroy when the user actually logs out (user becomes null),
      // not on every re-render.
    };
  }, [isAuthenticated, user?.id, navigate]);

  // Clean up on logout.
  useEffect(() => {
    if (!IS_NATIVE) return;
    if (isAuthenticated || !initialisedForRef.current) return;

    // User logged out — remove token and tear down service.
    notificationService
      .removePushToken(initialisedForRef.current)
      .finally(() => {
        notificationService.destroy();
        initialisedForRef.current = null;
      });
  }, [isAuthenticated]);
}
