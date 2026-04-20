import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S45_Protocol_Detail from '../screens/S45_Protocol_Detail.jsx';

export default function V3ProtocolDetail() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  return (
    <S45_Protocol_Detail
      dark={theme === 'dark'}
      onLogDose={() => navigate('/app/protocols/log', { state: { protocolId: id } })}
      onEdit={() => navigate(`/app/protocols/${id}/edit`)}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
