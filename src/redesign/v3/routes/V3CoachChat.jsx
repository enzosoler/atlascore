import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAIConsent } from '../lib/useAIConsent.js';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S12_Coach_Chat from '../screens/S12_Coach_Chat.jsx';

const COACH_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`;

export default function V3CoachChat() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const t = useT();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const ask = params.get('ask');
  const { consented, grant: grantConsent } = useAIConsent({ userId: user?.id, kind: 'coach_chat', provider: 'OpenAI' });

  // Daily state for context
  const { workoutDone, nutrition, checkin } = useDailyStateV2();
  const addToPlanLabel = t('coach.chat.runtime.actions.addToPlan');
  const notTodayLabel = t('coach.chat.runtime.actions.notToday');
  const logActionLabel = t('coach.chat.runtime.quick.logMeal');
  const showOptionsLabel = t('coach.chat.runtime.quick.showOptions');
  const laterLabel = t('coach.chat.runtime.quick.later');

  // Build initial messages from URL param
  const buildInitial = () => {
    if (!ask) return [];
    return [
      {
        text: t('coach.chat.runtime.contextReadyText'),
        meta: t('coach.chat.runtime.contextReadyMeta'),
      },
      { mine: true, text: ask },
    ];
  };

  const [messages, setMessages] = useState(buildInitial);
  const [loading, setLoading] = useState(false);
  const firedInitial = useRef(false);

  // If there was an initial question from URL, fire it immediately
  React.useEffect(() => {
    if (ask && !firedInitial.current) {
      firedInitial.current = true;
      sendMessage(ask);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text) {
    if (!text?.trim()) return;

    // Append user bubble immediately
    setMessages((prev) => [...prev, { mine: true, text }]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error(t('coach.chat.runtime.notAuthenticated'));

      const pageContext = {
        workout_done: workoutDone ?? false,
        nutrition: nutrition ?? null,
        checkin: checkin ?? null,
      };

      const res = await fetch(COACH_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          page_context: 'coach_chat',
          context: pageContext,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const limitMsg = err?.error ?? t('coach.chat.limitReached');
          toast(limitMsg);
          setMessages((prev) => [
            ...prev,
            { text: limitMsg, meta: t('coach.chat.runtime.limitMeta') },
          ]);
          return;
        }
        throw new Error(err?.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.message ?? '';

      setMessages((prev) => [
        ...prev,
        { text: reply, meta: t('coach.chat.runtime.justNowMeta') },
      ]);
    } catch (err) {
      console.error('[V3CoachChat] send error:', err);
      const errMsg = err?.message ?? t('coach.chat.connectingToast');
      toast(errMsg);
      setMessages((prev) => [
        ...prev,
        { text: t('coach.chat.runtime.errorText'), meta: t('coach.chat.runtime.errorMeta') },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Build messages array for S12, appending typing indicator when loading
  const visibleMessages = loading
    ? [...messages, { text: '…', meta: t('coach.chat.runtime.typingMeta') }]
    : messages;

  if (!consented) {
    const dark = theme === 'dark';
    return (
      <V3StandaloneLayout>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flex: 1, padding: 32, textAlign: 'center',
          color: dark ? '#fff' : '#111', background: dark ? '#111' : '#fff',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            {t('coach.chat.consent.title')}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.8, maxWidth: 360, marginBottom: 32 }}>
            {t('coach.chat.consent.body')}
          </p>
          <button
            onClick={grantConsent}
            style={{
              padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 16, fontWeight: 600, marginBottom: 12, width: '100%', maxWidth: 320,
              background: dark ? '#fff' : '#111', color: dark ? '#111' : '#fff',
            }}
          >
            {t('coach.chat.consent.accept')}
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '14px 28px', borderRadius: 12, border: '1px solid',
              borderColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              cursor: 'pointer', fontSize: 16, fontWeight: 500, width: '100%', maxWidth: 320,
              background: 'transparent', color: dark ? '#fff' : '#111',
            }}
          >
            {t('coach.chat.consent.decline')}
          </button>
        </div>
      </V3StandaloneLayout>
    );
  }

  return (
    <V3StandaloneLayout>
      <S12_Coach_Chat
        dark={theme === 'dark'}
        messages={visibleMessages.length > 0 ? visibleMessages : undefined}
        statusLabel={loading ? t('coach.chat.runtime.thinking') : t('coach.chat.runtime.liveStatus')}
        suggestionLabel={t('coach.chat.runtime.suggestionLabel')}
        suggestionText={t('coach.chat.runtime.suggestionText')}
        suggestionActions={[addToPlanLabel, notTodayLabel]}
        quickActions={[logActionLabel, showOptionsLabel, laterLabel]}
        onBack={() => navigate(-1)}
        onSuggestionAction={(label) => {
          if (label === addToPlanLabel) return toast(t('coach.chat.addedToPlan'));
          if (label === notTodayLabel) return toast(t('coach.chat.dismissedForToday'));
          toast(t('coach.chat.noted'));
        }}
        onQuickAction={(label) => {
          if (label === logActionLabel) return navigate('/app/nutrition/search');
          if (label === showOptionsLabel) return navigate('/app/nutrition/search');
          if (label === laterLabel) return toast(t('coach.chat.savedForLater'));
          // Route quick actions from AI suggestions as new messages
          sendMessage(label);
        }}
        composerDisabled={loading}
        draftPlaceholder={loading ? t('coach.chat.connectingPlaceholder') : t('coach.chat.placeholder')}
        onSend={sendMessage}
      />
    </V3StandaloneLayout>
  );
}
