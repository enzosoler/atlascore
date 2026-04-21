import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { WEBAPP_BILLING, WEBAPP_HOME } from '@/lib/platformRoutes';
import V3LoadingSplash from './V3LoadingSplash.jsx';

export default function V3WebAppEntry() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (user) {
      navigate(WEBAPP_HOME, { replace: true });
      return;
    }
    navigate(`/auth/signup?web=1&next=${encodeURIComponent(WEBAPP_BILLING)}`, { replace: true });
  }, [isLoadingAuth, navigate, user]);

  return <V3LoadingSplash phase="syncing" />;
}
