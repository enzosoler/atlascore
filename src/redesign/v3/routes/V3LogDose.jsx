import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import S48_Log_Dose from '../screens/S48_Log_Dose.jsx';
import { getProtocol, logDose } from '@/services/protocolService.js';

export default function V3LogDose() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const protocolId = location.state?.protocolId || location.state?.protocol?.id;
  const [protocol, setProtocol] = React.useState(location.state?.protocol || null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!protocolId || protocol) return;
      const data = await getProtocol(protocolId);
      if (!cancelled) setProtocol(data);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [protocol, protocolId]);

  return (
    <S48_Log_Dose
      dark={theme === 'dark'}
      substance={protocol?.name}
      scheduledDose={[protocol?.dose_amount, protocol?.dose_unit].filter(Boolean).join(' ').toUpperCase()}
      scheduledTime="TODAY"
      onClose={() => navigate(-1)}
      onSubmit={async (payload) => {
        if (!protocolId) {
          toast.error('Missing protocol context for this log.');
          return;
        }

        try {
          await logDose(protocolId, {
            scheduled_date: new Date().toISOString().split('T')[0],
            status:
              payload.mode === 'taken'
                ? 'taken'
                : payload.mode === 'skipped'
                  ? 'skipped'
                  : 'taken',
            taken_at: payload.mode === 'taken' || payload.mode === 'adjust'
              ? payload.when
              : null,
            notes: payload.notes || payload.reason || null,
          });

          toast.success(payload.mode === 'skipped' ? 'Dose skipped.' : 'Dose logged.');
          navigate('/app/protocols');
        } catch (error) {
          console.error('[V3LogDose] submit error:', error);
          toast.error('Could not save this dose.');
        }
      }}
      showTabBar={false}
    />
  );
}
