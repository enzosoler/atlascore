import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S43_Protocols_Home from '../screens/S43_Protocols_Home.jsx';

export default function V3Protocols() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';

  return (
    <S43_Protocols_Home
      dark={theme === 'dark'}
      onAddProtocol={() => navigate('/app/protocols/new')}
      onOpenProtocol={(id) => navigate(`/app/protocols/${id || 'detail'}`)}
      onLogDose={(protocol) => navigate('/app/protocols/log', { state: { protocol } })}
      onOpenTimeline={() => navigate('/app/protocols/timeline')}
      showTabBar={false}
    />
  );
}
