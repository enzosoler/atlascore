import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S45_Protocol_Detail from '../screens/S45_Protocol_Detail.jsx';
import {
  getProtocol,
  getProtocolLogs,
  getAdherenceStats,
  pauseProtocol,
  discontinueProtocol,
} from '@/services/protocolService.js';

function formatProtocol(protocol) {
  if (!protocol) return null;

  return {
    id: protocol.id,
    name: protocol.name,
    category: String(protocol.category || 'Protocol').toUpperCase(),
    type: String(protocol.route || protocol.schedule_type || 'Tracked').toUpperCase(),
    dose: [protocol.dose_amount, protocol.dose_unit].filter(Boolean).join(' ').toUpperCase(),
    cadence:
      protocol.schedule_type === 'interval'
        ? `EVERY ${protocol.schedule_interval_days || 1} DAY${protocol.schedule_interval_days === 1 ? '' : 'S'}`
        : 'WEEKLY',
    route: String(protocol.route || 'Tracked').toUpperCase(),
    startDate: protocol.start_date
      ? new Date(protocol.start_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      : 'UNKNOWN',
  };
}

export default function V3ProtocolDetail() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id } = useParams();
  const [protocol, setProtocol] = React.useState(null);
  const [recentDoses, setRecentDoses] = React.useState([]);
  const [adherence, setAdherence] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id || !user?.id) return;

      try {
        const [protocolData, protocolLogs, adherenceStats] = await Promise.all([
          getProtocol(id),
          getProtocolLogs(id, { limit: 5 }),
          getAdherenceStats(user.id, { days: 90 }),
        ]);

        if (cancelled) return;

        setProtocol(protocolData);
        setRecentDoses((protocolLogs || []).map((entry) => ({
          d: entry.taken_at
            ? new Date(entry.taken_at).toLocaleString('en-US', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', ' ·')
            : entry.scheduled_date,
          note: [protocolData?.dose_amount, protocolData?.dose_unit, entry.notes].filter(Boolean).join(' · '),
          status: entry.status === 'taken' ? 'ok' : entry.status,
        })));

        const stats = adherenceStats?.byProtocol?.[id];
        setAdherence(stats
          ? {
              pct: stats.rate,
              total: stats.due,
              logged: stats.taken,
              late: 0,
              missed: stats.missed,
            }
          : null);
      } catch (error) {
        console.error('[V3ProtocolDetail] load error:', error);
        if (!cancelled) toast.error('Could not load this protocol.');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  return (
    <S45_Protocol_Detail
      dark={theme === 'dark'}
      protocol={formatProtocol(protocol)}
      adherence={adherence}
      recentDoses={recentDoses}
      onLogDose={() => navigate('/app/protocols/log', { state: { protocolId: id } })}
      onEdit={() => navigate(`/app/protocols/${id}/edit`)}
      onPause={async () => {
        try {
          await pauseProtocol(id);
          toast.success('Protocol paused.');
          navigate('/app/protocols');
        } catch (error) {
          console.error('[V3ProtocolDetail] pause error:', error);
          toast.error('Could not pause protocol.');
        }
      }}
      onEnd={async () => {
        try {
          await discontinueProtocol(id);
          toast.success('Protocol ended.');
          navigate('/app/protocols');
        } catch (error) {
          console.error('[V3ProtocolDetail] end error:', error);
          toast.error('Could not end protocol.');
        }
      }}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
