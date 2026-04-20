import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S78_Lab_Exam_Detail from '../screens/S78_Lab_Exam_Detail.jsx';

export default function V3LabExamDetail(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  return (
    <S78_Lab_Exam_Detail dark={theme === 'dark'} id={id} onBack={() => navigate('/labs/history')} />
  );
}
