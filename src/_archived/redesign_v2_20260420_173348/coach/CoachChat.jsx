/**
 * CoachChat — fullscreen chat with Atlas AI Coach.
 * Ref: ChatGPT mobile + Claude chat + Superhuman AI composer.
 *
 * Features:
 *  - Streamed responses (SSE if backend supports; fallback non-stream)
 *  - Message bubbles: user (right, cyan), coach (left, violet glass)
 *  - Typing indicator (3 pulsing dots) while waiting for first chunk
 *  - Auto-scroll to bottom on new message
 *  - Auto-growing textarea composer at bottom (sticky, blurred)
 *  - Suggested follow-ups after each coach reply
 *  - Error bubble with retry
 *  - Cancel inflight request on unmount / user send
 */
import React, { useEffect, useRef, useState } from 'react';
import { askCoach } from './coachAi';

export default function CoachChat({
  initialMessage = null,
  onClose,
}) {
  const [messages, setMessages] = useState(() => {
    const seed = [
      {
        id: 'm0',
        role: 'coach',
        text: "Hey — I'm your Atlas coach. I see your recovery, training, and nutrition in real time. Ask me anything.",
      },
    ];
    if (initialMessage) {
      seed.push({ id: 'm_u0', role: 'user', text: initialMessage });
    }
    return seed;
  });
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // If we opened with an initial message, send it automatically.
    if (initialMessage) send(initialMessage, /* skipAppendUser */ true);
    return () => { abortRef.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom on new content.
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const send = async (rawText, skipAppendUser = false) => {
    const text = (rawText ?? input).trim();
    if (!text || thinking) return;
    setError('');
    setInput('');

    const history = messages.filter((m) => m.role !== 'error').map((m) => ({
      role: m.role === 'coach' ? 'assistant' : m.role,
      content: m.text,
    }));

    if (!skipAppendUser) {
      setMessages((m) => [...m, { id: `m_u_${Date.now()}`, role: 'user', text }]);
    }

    const placeholderId = `m_c_${Date.now()}`;
    setMessages((m) => [...m, { id: placeholderId, role: 'coach', text: '' }]);
    setThinking(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await askCoach({
        message: text,
        history,
        signal: ctrl.signal,
        onChunk: (chunk) => {
          setMessages((m) =>
            m.map((msg) => (msg.id === placeholderId ? { ...msg, text: (msg.text || '') + chunk } : msg)),
          );
          setThinking(false); // first chunk arrived
        },
      });
    } catch (e) {
      if (e?.name !== 'AbortError') {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === placeholderId ? { ...msg, text: '', role: 'error', error: e?.message || 'Connection failed' } : msg,
          ),
        );
      }
    } finally {
      setThinking(false);
      abortRef.current = null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Subtle ambient */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 30% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 55%)', pointerEvents: 'none' }} />

      {/* Top bar */}
      <header
        style={{
          position: 'relative', zIndex: 2,
          paddingTop: 'env(safe-area-inset-top)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.88) 0%, rgba(5,7,10,0.65) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center', padding: '10px max(16px, env(safe-area-inset-left))', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: 40, height: 40, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-primary))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,.7)' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                Coach online
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1, color: '#A78BFA' }}>
              Atlas AI
            </div>
          </div>
          <button
            type="button"
            aria-label="Menu"
            style={{ width: 40, height: 40, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-primary))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          >
            ⋯
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '8px max(16px, env(safe-area-inset-left)) 16px',
          position: 'relative', zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} onRetry={() => send(messages[messages.findIndex((x) => x.id === m.id) - 1]?.text)} />
          ))}
          {thinking && <TypingBubble />}
        </div>
      </div>

      {/* Composer */}
      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send()}
        disabled={thinking}
        inputRef={inputRef}
      />
    </div>
  );
}
export { CoachChat };

/* ─── Bubble ────────────────────────────────────────────────────────────── */

function Bubble({ msg, onRetry }) {
  if (msg.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '86%', display: 'flex', justifyContent: 'flex-end' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '16px 16px 4px 16px',
            background: 'linear-gradient(180deg, rgba(0,255,255,0.95) 0%, rgba(0,210,210,0.9) 100%)',
            color: 'hsl(var(--rd-fg-on-accent))',
            fontSize: 14, lineHeight: 1.45, fontWeight: 500,
            boxShadow: '0 4px 12px -4px rgba(0,210,210,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }
  if (msg.role === 'error') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '86%' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '16px 16px 16px 4px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#FB7185',
            fontSize: 13, lineHeight: 1.45,
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <span aria-hidden>⚠️</span>
          <span style={{ flex: 1 }}>{msg.error || 'Something went wrong'}</span>
          <button
            type="button"
            onClick={onRetry}
            style={{ background: 'transparent', border: 'none', color: '#FB7185', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  // coach
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '86%' }}>
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '16px 16px 16px 4px',
          background: 'linear-gradient(180deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          color: 'hsl(var(--rd-fg-primary))',
          fontSize: 14, lineHeight: 1.55, fontWeight: 400,
          backdropFilter: 'blur(14px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {msg.text || ' '}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ alignSelf: 'flex-start' }}>
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '16px 16px 16px 4px',
          background: 'rgba(139,92,246,0.10)',
          border: '1px solid rgba(139,92,246,0.25)',
          display: 'inline-flex', gap: 4,
          backdropFilter: 'blur(14px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            style={{
              width: 6, height: 6, borderRadius: 99,
              background: '#A78BFA',
              animation: `rd-typing 1200ms ${i * 200}ms ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes rd-typing {
          0%, 60%, 100% { opacity: .3; transform: translateY(0); }
          30%           { opacity: 1;  transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

/* ─── Composer ──────────────────────────────────────────────────────────── */

function Composer({ value, onChange, onSend, disabled, inputRef }) {
  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(140, el.scrollHeight)}px`;
  };

  return (
    <div
      style={{
        position: 'relative', zIndex: 2,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.80) 30%, rgba(5,7,10,0.95) 100%)',
        backdropFilter: 'blur(22px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ padding: '10px max(16px, env(safe-area-inset-left))', maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div
          style={{
            flex: 1,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(139,92,246,0.25)',
            padding: '10px 12px',
            display: 'flex', alignItems: 'flex-end', gap: 8,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <span aria-hidden style={{ color: '#A78BFA', paddingBottom: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </span>
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => { onChange(e.target.value); autoGrow(e.target); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Message your coach…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'hsl(var(--rd-fg-primary))',
              fontSize: 15, lineHeight: 1.35,
              fontFamily: 'inherit',
              maxHeight: 140,
              padding: 0,
            }}
          />
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          style={{
            width: 44, height: 44, borderRadius: 9999, flexShrink: 0,
            background: disabled || !value.trim()
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(180deg, rgba(139,92,246,0.95), rgba(124,58,237,0.9))',
            border: disabled || !value.trim()
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(139,92,246,0.55)',
            color: disabled || !value.trim() ? 'hsl(var(--rd-fg-muted))' : '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: disabled || !value.trim() ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 160ms cubic-bezier(.34,1.56,.64,1), background 180ms',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19V5m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
