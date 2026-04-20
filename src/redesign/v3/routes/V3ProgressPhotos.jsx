import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import S18_Progress_Photos from '../screens/S18_Progress_Photos.jsx';

export default function V3ProgressPhotos() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <S18_Progress_Photos
      dark={theme === 'dark'}
      photos={[]}
      onTakePhoto={() => {
        navigate('/app/body/progress/photos/capture');
      }}
      onOpenPhoto={(id) => navigate('/app/body')}
      showTabBar={false}
    />
  );
}
