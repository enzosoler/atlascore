/**
 * AnalyticsProvider — Initializes analytics and provides automatic tracking.
 *
 * Place this component inside the Router and AuthProvider so it has access
 * to both route changes and user state.
 *
 * Features:
 *   - Initializes Firebase Analytics on mount
 *   - Tracks page views automatically on route changes
 *   - Identifies the user when auth state changes
 *   - Respects user consent preferences
 */

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/lib/AuthContext';
import { usePageTracking, useAnalyticsIdentify } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }) {
  const { user } = useAuth();

  // Initialize analytics once on mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  // Track page views on route changes
  usePageTracking();

  // Identify user when auth state changes
  useAnalyticsIdentify(user);

  return children;
}

export default AnalyticsProvider;
