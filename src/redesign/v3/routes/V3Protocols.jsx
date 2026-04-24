import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S43_Protocols_Home from '../screens/S43_Protocols_Home.jsx';
import S44_Protocols_Empty_Locked from '../screens/S44_Protocols_Empty_Locked.jsx';
import {
  listProtocols,
  getTodayDue,
  getAdherenceStats,
} from '@/services/protocolService.js';
import {
  CONTEXTUAL_PAYWALL_ROUTE,
  createPaywallState,
} from '@/redesign/v3/components/paywall/paywallRouteGuard.js';

function formatDose(protocol) {
  const amount = protocol?.dose_amount;
  const unit = protocol?.dose_unit;
  if (amount == null && !unit) return 'Dose pending';
  return [amount, unit].filter(Boolean).join(' ');
}

function formatCadence(protocol) {
  if (protocol?.schedule_type === 'weekdays' && Array.isArray(protocol.schedule_weekdays) && protocol.schedule_weekdays.length) {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return protocol.schedule_weekdays
      .map((value) => labels[value] || value)
      .join(' · ');
  }

  if (protocol?.schedule_type === 'interval' && protocol?.schedule_interval_days) {
    return protocol.schedule_interval_days === 1
      ? 'Daily'
      : `Every ${protocol.schedule_interval_days} days`;
  }

  return 'Custom cadence';
}

function formatNextDue(protocol, dueTodaySet) {
  if (protocol?.status === 'paused') return '—';
  if (dueTodaySet.has(protocol?.id)) return 'today';
  return 'scheduled';
}

function buildAdherenceStrip(rate) {
  const activeBars = Math.max(0, Math.min(30, Math.round((rate / 100) * 30)));
  return Array.from({ length: 30 }, (_, index) => (index < activeBars ? 1 : 0));
}

export default function V3Protocols() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [view, setView] = useState('loading');
  const [protocols, setProtocols] = useState([]);
  const [todayDue, setTodayDue] = useState([]);
  const [adherenceRate, setAdherenceRate] = useState(0);

  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        if (!cancelled) {
          setView('empty');
          setProtocols([]);
          setTodayDue([]);
          setAdherenceRate(0);
        }
        return;
      }

      if (!isPremium) {
        if (!cancelled) {
          setView('locked');
          setProtocols([]);
          setTodayDue([]);
          setAdherenceRate(0);
        }
        return;
      }

      try {
        const [allProtocols, dueToday, adherence] = await Promise.all([
          listProtocols(user.id, { status: null }),
          getTodayDue(user.id),
          getAdherenceStats(user.id, { days: 30 }),
        ]);

        if (cancelled) return;

        const activeAndPaused = (allProtocols || []).filter((protocol) =>
          ['active', 'paused'].includes(protocol.status)
        );

        setProtocols(activeAndPaused);
        setTodayDue(dueToday || []);
        setAdherenceRate(adherence?.overall?.rate || 0);
        setView(activeAndPaused.length ? 'home' : 'empty');
      } catch (error) {
        console.error('[V3Protocols] load error:', error);
        if (!cancelled) {
          setView('empty');
          setProtocols([]);
          setTodayDue([]);
          setAdherenceRate(0);
          toast.error('Could not load protocols right now.');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isPremium, user?.id]);

  const dueTodaySet = new Set((todayDue || []).map((protocol) => protocol.id));
  const rows = protocols.map((protocol) => ({
    id: protocol.id,
    name: protocol.name,
    dose: formatDose(protocol),
    cadence: formatCadence(protocol),
    adh: adherenceRate,
    state: protocol.status,
    next: formatNextDue(protocol, dueTodaySet),
  }));

  if (view === 'locked' || view === 'empty') {
    return (
      <S44_Protocols_Empty_Locked
        dark={theme === 'dark'}
        state={view === 'locked' ? 'locked' : 'empty'}
        onAddQuickStart={(protocol) => navigate('/app/protocols/new', { state: { template: protocol } })}
        onCreateCustom={() => navigate('/app/protocols/new')}
        onStartTrial={() => navigate(CONTEXTUAL_PAYWALL_ROUTE, {
          state: createPaywallState('protocol_limit', location.pathname),
        })}
        showTabBar={false}
      />
    );
  }

  return (
    <S43_Protocols_Home
      dark={theme === 'dark'}
      protocols={rows}
      todayLogged={todayDue.filter((protocol) => protocol.logged?.status === 'taken').length}
      todayTotal={todayDue.length}
      adherence30d={buildAdherenceStrip(adherenceRate)}
      onSelectProtocol={(id) => navigate(`/app/protocols/${id}`)}
      onAddProtocol={() => navigate('/app/protocols/new')}
      onLogDose={(protocol) => navigate('/app/protocols/log', { state: { protocolId: protocol?.id } })}
      onOpenTimeline={() => navigate('/app/protocols/timeline')}
      showTabBar={false}
    />
  );
}
