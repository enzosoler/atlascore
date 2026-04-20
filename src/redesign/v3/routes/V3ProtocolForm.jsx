import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S46_Protocol_Form from '../screens/S46_Protocol_Form.jsx';

export default function V3ProtocolForm() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S46_Protocol_Form
      dark={theme === 'dark'}
      onSave={() => navigate('/app/protocols')}
      onCancel={() => navigate(-1)}
      onPickSubstance={() => navigate('/app/protocols/substances')}
      showTabBar={false}
    />
  );
}
