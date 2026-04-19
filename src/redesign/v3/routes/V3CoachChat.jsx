import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S12_Coach_Chat from '../screens/S12_Coach_Chat.jsx';

export default function V3CoachChat() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [params] = useSearchParams();
  const ask = params.get('ask');

  const messages = ask
    ? [
        {
          text: 'You asked for a direct coach take. I pulled the question into the thread so you can keep moving without context switching.',
          meta: 'Coach · context synced',
        },
        { mine: true, text: ask },
        {
          text: 'I can answer that next, or turn it into a workout, meal, or check-in action. Pick the fastest useful move.',
          meta: 'Coach · live',
        },
      ]
    : undefined;

  return (
    <V3StandaloneLayout>
      <S12_Coach_Chat
        dark={theme === 'dark'}
        messages={messages}
        onBack={() => navigate(-1)}
        onSuggestionAction={(label) => {
          if (/add to plan/i.test(label)) return toast('Added to your plan');
          if (/not today/i.test(label)) return toast('Dismissed for today');
          toast('Noted');
        }}
        onQuickAction={(label) => {
          if (/log/i.test(label)) return navigate('/app/nutrition/search');
          if (/show/i.test(label)) return navigate('/app/nutrition/search');
          if (/later/i.test(label)) return toast('Saved for later');
          toast(label);
        }}
        composerDisabled
        draftPlaceholder="Coach AI is being connected..."
        onSend={() => toast('The AI coach is being connected. This will work soon.')}
      />
    </V3StandaloneLayout>
  );
}
