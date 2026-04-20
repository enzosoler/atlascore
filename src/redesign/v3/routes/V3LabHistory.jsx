import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S79_Lab_History from '../screens/S79_Lab_History.jsx';

export default function V3LabHistory(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S79_Lab_History dark={theme === 'dark'} onOpenDetail={(id)=>navigate(`/labs/exam/${id}`)} />
  );
}
