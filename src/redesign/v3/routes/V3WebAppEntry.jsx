import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import V3LoadingSplash from './V3LoadingSplash.jsx';

export default function V3WebAppEntry() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (user) {
      navigate('/app/account', { replace: true });
      return;
    }
    navigate('/auth/signup?web=1&next=%2Fapp%2Fbilling', { replace: true });
  }, [isLoadingAuth, navigate, user]);

  return <V3LoadingSplash phase="syncing" />;
}
