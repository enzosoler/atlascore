import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { listProgressPhotos } from '@/services/bodyProgressService';
import S18_Progress_Photos from '../screens/S18_Progress_Photos.jsx';

function formatPhotoDate(value) {
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export default function V3ProgressPhotos() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: photos = [] } = useQuery({
    queryKey: ['v3-progress-photos', user?.id],
    queryFn: () => listProgressPhotos(user.id, 24),
    enabled: !!user?.id,
  });

  const mappedPhotos = photos.map((photo, index) => ({
    id: photo.id || `${photo.date}-${photo.category || index}`,
    m: `${formatPhotoDate(photo.date)}${photo.category ? ` · ${photo.category}` : ''}`,
    w: '--',
    bf: '--',
    latest: index === 0,
    photoUrl: photo.photo_url,
  }));

  return (
    <S18_Progress_Photos
      dark={theme === 'dark'}
      photos={mappedPhotos}
      onTakePhoto={() => {
        navigate('/app/body/progress/photos/capture');
      }}
      onOpenPhoto={(id) => {
        const selected = mappedPhotos.find((photo) => photo.id === id);
        if (selected?.photoUrl) {
          window.open(selected.photoUrl, '_blank', 'noopener,noreferrer');
          return;
        }
        toast('Photo preview unavailable', {
          description: 'Capture a photo first to open it here.',
        });
      }}
      showTabBar={false}
    />
  );
}
