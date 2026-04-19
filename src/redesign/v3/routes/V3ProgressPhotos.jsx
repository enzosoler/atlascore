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
        // TODO: route to a body-photo capture screen (not nutrition photo)
        // /app/body/photo/capture doesn't exist yet — needs a v3 screen + route
        toast('Body photo capture coming soon', { description: 'This will open a dedicated body-photo camera.' });
      }}
      onOpenPhoto={(id) => navigate('/app/body')}
      showTabBar={false}
    />
  );
}
