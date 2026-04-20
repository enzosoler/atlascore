import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S69_Social_Feed from '../screens/S69_Social_Feed.jsx';

export default function V3SocialFeed() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S69_Social_Feed
      dark={theme === 'dark'}
      onOpenUser={(id) => navigate(`/app/u/${id}`)}
      onOpenItem={(item) => navigate(`/app/workouts/${item?.id || ''}`)}
      onLike={() => {}}
      onFindFriends={() => navigate('/app/social/friends')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
