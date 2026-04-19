import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S16_Biomarker_Detail from '../screens/S16_Biomarker_Detail.jsx';

function titleize(value) {
  return String(value || 'biomarker')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function V3BiomarkerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const name = titleize(id);

  return (
    <S16_Biomarker_Detail
      dark={theme === 'dark'}
      biomarkerName={name}
      noData
      onBack={() => navigate('/app/labs')}
      onOpenUpload={() => navigate('/app/labs/upload')}
      onAskCoach={() => navigate(`/app/coach/chat?ask=${encodeURIComponent(`Explain ${name} and what I should do next`)}`)}
    />
  );
}
