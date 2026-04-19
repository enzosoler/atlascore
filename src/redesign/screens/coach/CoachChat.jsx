import React, { useState } from 'react';
import { FullScreenShell } from '../../layouts';
import { IconButton, Badge } from '../../ui';
import { CoachMessage, CoachComposer, CoachThinking } from '../../modules';
import { mockCoachMessages } from '../../lib/mock-data';

export default function CoachChat() {
  const [messages, setMessages] = useState(mockCoachMessages);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: `u${Date.now()}`, role: 'user', text: input, ts: 'now' };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, {
        id: `c${Date.now()}`, role: 'coach', text: 'Got it. Switching today to Pull A. Expect 48 minutes at RPE 7–8.', ts: 'now', confidence: 0.88,
      }]);
    }, 900);
  };

  return (
    <FullScreenShell
      topChrome={
        <header className="sticky top-0 z-[50] flex items-center gap-3 border-b border-rd-border bg-rd-bg/90 px-4 h-rd-top-bar backdrop-blur rd-safe-top">
          <IconButton size="sm" label="Back">←</IconButton>
          <div className="min-w-0">
            <p className="text-rd-h4 text-rd-fg">Coach</p>
            <p className="text-[11px] text-rd-fg-muted">Online</p>
          </div>
          <div className="ml-auto"><Badge tone="ai" size="xs">AI</Badge></div>
        </header>
      }
    >
      <div className="flex flex-col min-h-[calc(100vh-56px)]">
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {messages.map((m) => <CoachMessage key={m.id} message={m} />)}
          {thinking && <CoachThinking />}
        </div>
        <CoachComposer
          value={input}
          onChange={setInput}
          onSend={send}
          disabled={thinking}
          suggestions={['Plan my day', 'Why is my HRV low?', 'Swap today\'s workout']}
        />
      </div>
    </FullScreenShell>
  );
}
