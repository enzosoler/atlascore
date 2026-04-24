import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import S15_Labs_Inbox from '../screens/S15_Labs_Inbox.jsx';
import {
  CONTEXTUAL_PAYWALL_ROUTE,
  createPaywallState,
} from '@/redesign/v3/components/paywall/paywallRouteGuard.js';
import { examToPanel, listExams } from '@/services/labExamService';

function summarizePanels(exams) {
  return exams.reduce(
    (acc, exam) => {
      acc.panelCount += 1;
      acc.totalMarkers += exam.markers.length;
      exam.markers.forEach((marker) => {
        if (marker.status === 'out') {
          acc.attentionCount += 1;
          acc.elevatedCount += 1;
        } else if (marker.status === 'monitor') {
          acc.attentionCount += 1;
          acc.lowCount += 1;
        } else {
          acc.optimalCount += 1;
        }
      });
      return acc;
    },
    { panelCount: 0, totalMarkers: 0, attentionCount: 0, optimalCount: 0, elevatedCount: 0, lowCount: 0 },
  );
}

export default function V3Labs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [exams, setExams] = React.useState([]);
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';

  React.useEffect(() => {
    let cancelled = false;
    if (!user?.id || !isPremium) {
      setExams([]);
      return () => {
        cancelled = true;
      };
    }

    listExams(user.id)
      .then((rows) => {
        if (!cancelled) setExams(rows);
      })
      .catch((error) => {
        console.error('[V3Labs] failed to load labs:', error);
        if (!cancelled) setExams([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isPremium, user?.id]);

  return (
    <S15_Labs_Inbox
      dark={theme === 'dark'}
      isLocked={!isPremium}
      panels={exams.map(examToPanel)}
      summary={summarizePanels(exams)}
      onUpgrade={() =>
        navigate(CONTEXTUAL_PAYWALL_ROUTE, {
          state: createPaywallState('labs_locked', location.pathname),
        })
      }
      onUpload={() => navigate('/app/labs/upload')}
      onOpenPanel={(panel) => {
        if (!panel?.id) return;
        navigate(`/app/labs/exam/${panel.id}`);
      }}
      showTabBar={false}
    />
  );
}
