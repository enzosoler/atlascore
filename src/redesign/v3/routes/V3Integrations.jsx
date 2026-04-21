import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import {
  getIntegrationConnections,
  connectProvider,
  disconnectProvider,
  refreshProvider,
  toastConnectResult,
} from '@/lib/integrationsService';
import S64_Integrations from '../screens/S64_Integrations.jsx';

export default function V3Integrations() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [connections, setConnections] = useState(undefined);

  async function reloadConnections() {
    const rows = await getIntegrationConnections(user?.id);
    setConnections(rows);
  }

  useEffect(() => {
    reloadConnections();
  }, [user?.id]);

  async function handleConnect(id) {
    const result = await connectProvider(id, user?.id);
    toastConnectResult(id, result);
    await reloadConnections();
  }

  async function handleDisconnect(id) {
    const result = await disconnectProvider(id, user?.id);
    toastConnectResult(id, result);
    await reloadConnections();
  }

  async function handleRefresh(id) {
    const result = await refreshProvider(id, user?.id);
    toastConnectResult(id, result);
    await reloadConnections();
  }

  return (
    <S64_Integrations
      dark={theme === 'dark'}
      connections={connections}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={handleRefresh}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
