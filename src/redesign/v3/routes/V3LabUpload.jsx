import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S77_Lab_Upload from '../screens/S77_Lab_Upload.jsx';

export default function V3LabUpload(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S77_Lab_Upload dark={theme === 'dark'} onBack={() => navigate('/labs')} />
  );
}
