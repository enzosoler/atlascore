import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
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

  // Daily state for context
  const { workoutDone, nutrition, checkin } = useDailyStateV2();

  // Build initial messages from URL param
  const buildInitial = () => {
    if (!ask) return [];
    return [
      {
        text: 'Syncing your current state. Ask anything.',
        meta: 'Coach · context ready',
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
      if (!session?.access_token) throw new Error('Not authenticated');

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
            { text: limitMsg, meta: 'Coach · limit reached' },
          ]);
          return;
        }
        throw new Error(err?.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.message ?? '';

      setMessages((prev) => [
        ...prev,
        { text: reply, meta: 'Coach · just now' },
      ]);
    } catch (err) {
      console.error('[V3CoachChat] send error:', err);
      const errMsg = err?.message ?? t('coach.chat.connectingToast');
      toast(errMsg);
      setMessages((prev) => [
        ...prev,
        { text: 'Something went wrong. Try again.', meta: 'Coach · error' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Build messages array for S12, appending typing indicator when loading
  const visibleMessages = loading
    ? [...messages, { text: '…', meta: 'Coach · typing' }]
    : messages;

  return (
    <V3StandaloneLayout>
      <S12_Coach_Chat
        dark={theme === 'dark'}
        messages={visibleMessages.length > 0 ? visibleMessages : undefined}
        statusLabel={loading ? 'Thinking…' : 'Reading your signal · live'}
        onBack={() => navigate(-1)}
        onSuggestionAction={(label) => {
          if (/add to plan/i.test(label)) return toast(t('coach.chat.addedToPlan'));
          if (/not today/i.test(label)) return toast(t('coach.chat.dismissedForToday'));
          toast(t('coach.chat.noted'));
        }}
        onQuickAction={(label) => {
          if (/log/i.test(label)) return navigate('/app/nutrition/search');
          if (/show/i.test(label)) return navigate('/app/nutrition/search');
          if (/workout/i.test(label)) return navigate('/app/train');
          if (/later/i.test(label)) return toast(t('coach.chat.savedForLater'));
          // Route quick actions from AI suggestions as new messages
          sendMessage(label);
        }}
        composerDisabled={loading}
        draftPlaceholder={loading ? t('coach.chat.connectingPlaceholder') : t('coach.chat.placeholder', { defaultValue: 'Ask the coach…' })}
        onSend={sendMessage}
      />
    </V3StandaloneLayout>
  );
}
