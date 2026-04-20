import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S37_Inbox from '../screens/S37_Inbox.jsx';

export default function V3Inbox() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S37_Inbox
      dark={theme === 'dark'}
      onOpenItem={(item) => {
        const type = item?.type;
        if (type === 'coach') navigate('/app/coach/chat');
        else if (type === 'labs') navigate('/app/labs');
        else if (type === 'plan') navigate('/app/today');
        else if (type === 'crew') navigate('/app/crew');
        else navigate('/app/today');
      }}
      showTabBar={false}
    />
  );
}
