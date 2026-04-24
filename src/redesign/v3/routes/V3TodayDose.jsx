import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S50_Today_Dose_Module from '../screens/S50_Today_Dose_Module.jsx';
import { getTodayDue } from '@/services/protocolService.js';

export default function V3TodayDose() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [todayDoses, setTodayDoses] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) return;
      const due = await getTodayDue(user.id);
      if (cancelled) return;
      setTodayDoses((due || []).filter((protocol) => protocol.logged?.status === 'taken').map((protocol) => ({
        time: protocol.logged?.taken_at
          ? new Date(protocol.logged.taken_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : 'Logged',
        name: protocol.name,
        dose: [protocol.dose_amount, protocol.dose_unit].filter(Boolean).join(' · '),
      })));
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <S50_Today_Dose_Module
      dark={theme === 'dark'}
      todayDoses={todayDoses.length ? todayDoses : undefined}
      onRemindTomorrow={() => {
        toast.message('Tomorrow reminders will follow your protocol schedule.');
        navigate('/app/protocols');
      }}
      showTabBar={false}
    />
  );
}
