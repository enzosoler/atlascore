import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S44_Protocols_Empty_Locked from '../screens/S44_Protocols_Empty_Locked.jsx';

export default function V3ProtocolsEmpty() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S44_Protocols_Empty_Locked
      dark={theme === 'dark'}
      onAddQuickStart={(protocol) => navigate('/app/protocols/new', { state: { protocol } })}
      onCreateCustom={() => navigate('/app/protocols/new')}
      onUpgrade={() => navigate('/app/billing/plans')}
      showTabBar={false}
    />
  );
}
