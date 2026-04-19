import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import S15_Labs_Inbox from '../screens/S15_Labs_Inbox.jsx';

export default function V3Labs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';

  return (
    <S15_Labs_Inbox
      dark={theme === 'dark'}
      isLocked={!isPremium}
      panels={[]}
      summary={{ panelCount: 0, totalMarkers: 0, attentionCount: 0, optimalCount: 0, elevatedCount: 0, lowCount: 0 }}
      onUpgrade={() => navigate('/app/billing/plans')}
      onUpload={() => navigate('/app/labs/upload')}
      onOpenPanel={(_, row) => navigate(`/app/labs/biomarker/${encodeURIComponent(row?.t || 'marker')}`)}
      showTabBar={false}
    />
  );
}
