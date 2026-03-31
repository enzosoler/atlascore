/**
 * CoachChatSheet — full-screen bottom-sheet AI coach chat.
 *
 * Renders message bubbles, action confirmation cards, suggestion pills,
 * and a text input using the MobileSheet (vaul Drawer) pattern.
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer';
import { Sparkles, Send, X, Check, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useT } from '@/lib/i18nContext';

// ─── Markdown components ───────────────────────────────────────────────────────

const mdComponents = {
  p: ({ children }) => (
    <p className="leading-6 text-[14px] text-[hsl(var(--fg-2))]">{children}</p>
  ),
  ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5 leading-6 text-[14px] text-[hsl(var(--fg-2))]">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[hsl(var(--fg))]">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-[hsl(var(--fill))] px-1 py-0.5 text-[12px] text-[hsl(var(--fg))]">
      {children}
    </code>
  ),
};

// ─── Action card ───────────────────────────────────────────────────────────────

function ActionCard({ action, actionKey, state, onConfirm, onDismiss }) {
  const t = useT();
  if (state === 'dismissed') return null;
  if (state === 'done') {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--ok))] font-medium mt-2">
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span>{action.description ?? t('coach.chat.done')}</span>
      </div>
    );
  }

  const isLoading = state === 'loading';

  return (
    <div className="mt-2 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-3.5 py-2.5">
      <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
        {action.description ?? action.type}
      </p>
      <div className="mt-2 flex gap-2">
        <button
          disabled={isLoading}
          onClick={() => onConfirm(action, actionKey)}
          className="flex items-center gap-1.5 rounded-[10px] bg-[hsl(var(--brand))] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} />
          ) : (
            <Check className="w-3 h-3" strokeWidth={2.5} />
          )}
          {t('coach.chat.confirm')}
        </button>
        <button
          disabled={isLoading}
          onClick={() => onDismiss(actionKey)}
          className="rounded-[10px] border border-[hsl(var(--border)/0.6)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] disabled:opacity-60"
        >
          {t('coach.chat.dismiss')}
        </button>
      </div>
    </div>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, actionStates, onConfirm, onDismiss }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--brand-ai)/0.3)] bg-[hsl(var(--brand-ai)/0.1)]">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
        </div>
      )}

      <div className={cn('max-w-[82%] min-w-0', isUser && 'items-end')}>
        {/* Bubble */}
        <div
          className={cn(
            'rounded-[18px] px-4 py-2.5',
            isUser
              ? 'rounded-tr-[4px] bg-[hsl(var(--brand))] text-white'
              : 'rounded-tl-[4px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.95)]'
          )}
        >
          {isUser ? (
            <p className="text-[14px] leading-6 text-white">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 space-y-1"
              components={mdComponents}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action cards (only on assistant messages) */}
        {!isUser && Array.isArray(message.actions) && message.actions.length > 0 && (
          <div className="mt-1 space-y-1.5 pl-1">
            {message.actions.map((action, i) => {
              const key = `${message.id}-${i}`;
              return (
                <ActionCard
                  key={key}
                  action={action}
                  actionKey={key}
                  state={actionStates[key] ?? 'pending'}
                  onConfirm={onConfirm}
                  onDismiss={onDismiss}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--brand-ai)/0.3)] bg-[hsl(var(--brand-ai)/0.1)]">
        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
      </div>
      <div className="rounded-[18px] rounded-tl-[4px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.95)] px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.5 w-1.5 rounded-full bg-[hsl(var(--fg-3))] animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main sheet ────────────────────────────────────────────────────────────────

export default function CoachChatSheet({
  open,
  onOpenChange,
  messages,
  isTyping,
  actionStates,
  onSendMessage,
  onConfirmAction,
  onDismissAction,
  pageContext = 'today',
  suggestions = [],
}) {
  const t = useT();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  
  // Safe array defaults
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [safeMessages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    onSendMessage(text, pageContext);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSuggestion(text) {
    onSendMessage(text, pageContext);
  }

  // Show suggestions from the last assistant message, or default page suggestions
  const lastAssistant = [...safeMessages].reverse().find((m) => m.role === 'assistant');
  const visibleSuggestions =
    (lastAssistant?.suggestions?.length > 0 ? lastAssistant.suggestions : safeSuggestions).slice(0, 3);

  const isEmpty = safeMessages.length === 0;

  return createPortal(
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="flex flex-col max-h-[92dvh] pb-[env(safe-area-inset-bottom,0px)] focus:outline-none">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[hsl(var(--border)/0.5)] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-ai)/0.2)] to-[hsl(var(--brand)/0.15)] border border-[hsl(var(--brand-ai)/0.3)]">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {t('coach.chat.title')}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
        >
          {isEmpty && !isTyping && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-ai)/0.15)] to-[hsl(var(--brand)/0.1)] border border-[hsl(var(--brand-ai)/0.2)]">
                <Sparkles className="h-6 w-6 text-[hsl(var(--brand-ai))]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">{t('coach.chat.emptyTitle')}</p>
                <p className="mt-1 text-[13px] text-[hsl(var(--fg-3))] leading-5 max-w-[220px]">
                  {t('coach.chat.emptyDesc')}
                </p>
              </div>
            </div>
          )}

          {safeMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              actionStates={actionStates}
              onConfirm={onConfirmAction}
              onDismiss={onDismissAction}
            />
          ))}

          {isTyping && <TypingIndicator />}
        </div>

        {/* Suggestion pills */}
        {visibleSuggestions.length > 0 && (
          <div className="shrink-0 flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
            {visibleSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="shrink-0 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] whitespace-nowrap active:bg-[hsl(var(--fill))] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="shrink-0 flex items-end gap-2 border-t border-[hsl(var(--border)/0.5)] px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('coach.chat.placeholder')}
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] px-3.5 py-2.5',
              'text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))]',
              'focus:outline-none focus:border-[hsl(var(--brand)/0.5)] focus:bg-[hsl(var(--fill)/0.6)]',
              'max-h-28 transition-colors',
              'leading-5'
            )}
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
              input.trim() && !isTyping
                ? 'bg-[hsl(var(--brand))] text-white active:scale-95'
                : 'bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-3))] cursor-not-allowed'
            )}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ) : (
              <Send className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

      </DrawerContent>
    </Drawer>,
    document.body
  );
}
