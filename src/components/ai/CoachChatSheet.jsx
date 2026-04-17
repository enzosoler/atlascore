/**
 * CoachChatSheet — full-screen bottom-sheet AI coach chat.
 *
 * Chat is reactive: use it for follow-up, clarification, and adjustments.
 * Proactive insights live elsewhere.
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Check, Loader2, MessageSquareText, ShieldAlert, Sparkles, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useT } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import PaywallTrigger from '@/components/entitlements/PaywallTrigger';

const mdComponents = {
  p: ({ children }) => <p className="my-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">{children}</p>,
  ul: ({ children }) => <ul className="my-3 ml-4 list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 ml-4 list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="pl-1 text-[14px] leading-7 text-[hsl(var(--fg-2))]">{children}</li>,
  h1: ({ children }) => <h1 className="my-3 text-[16px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{children}</h1>,
  h2: ({ children }) => <h2 className="my-3 text-[15px] font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">{children}</h2>,
  h3: ({ children }) => <h3 className="my-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold text-[hsl(var(--fg))]">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded bg-[hsl(var(--fill))] px-1.5 py-0.5 text-[12px] text-[hsl(var(--fg))]">
      {children}
    </code>
  ),
};

function ActionCard({ action, actionKey, state, onConfirm, onDismiss }) {
  const t = useT();
  if (state === 'dismissed') return null;

  if (state === 'done') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--ok))]">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>{action.description ?? t('coach.chat.done')}</span>
      </div>
    );
  }

  const isLoading = state === 'loading';

  return (
    <div className="mt-3 rounded-[18px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.42)] p-3.5">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          <MessageSquareText className="h-3.5 w-3.5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {action.description ?? action.type}
          </p>
          <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-3))]">
            Confirm this action to let the coach make the change.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onConfirm(action, actionKey)}
              className="inline-flex items-center gap-1.5 rounded-[12px] bg-[hsl(var(--brand))] px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 active:opacity-80"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
              {t('coach.chat.confirm')}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onDismiss(actionKey)}
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.65)] px-3.5 py-2 text-[12px] font-semibold text-[hsl(var(--fg-2))] transition-colors disabled:cursor-not-allowed disabled:opacity-60 active:bg-[hsl(var(--fill)/0.7)]"
            >
              {t('coach.chat.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, actionStates, onConfirm, onDismiss }) {
  const isUser = message.role === 'user';
  const label = isUser ? 'You' : 'Coach';

  return (
    <article className={cn('flex items-end gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border shadow-[var(--shadow-xs)]',
          isUser
            ? 'border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand))] text-white'
            : 'border-[hsl(var(--brand-ai)/0.22)] bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]'
        )}
      >
        {isUser ? (
          <span className="text-[11px] font-semibold tracking-[-0.02em]">Me</span>
        ) : (
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        )}
      </div>

      <div className={cn('max-w-[86%] min-w-0 space-y-1.5', isUser && 'items-end text-right')}>
        <div className={cn('flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]', isUser ? 'justify-end text-[hsl(var(--fg-3))]' : 'text-[hsl(var(--fg-3))]')}>
          <span>{label}</span>
          <span className="h-1 w-1 rounded-full bg-current/70" />
          <span>{isUser ? 'Question' : 'Response'}</span>
        </div>

        <div
          className={cn(
            'rounded-[24px] border px-4 py-3.5 shadow-[var(--shadow-sm)]',
            isUser
              ? 'border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--brand))_0%,hsl(var(--brand)/0.84)_100%)] text-white rounded-br-[8px]'
              : 'border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.42)_100%)] text-[hsl(var(--fg))] rounded-bl-[8px]'
          )}
        >
          {isUser ? (
            <p className="text-[14px] leading-7 text-white">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={mdComponents}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && Array.isArray(message.actions) && message.actions.length > 0 ? (
          <div className="space-y-0.5 pl-0.5">
            {message.actions.map((action, index) => {
              const key = `${message.id}-${index}`;
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
        ) : null}
      </div>
    </article>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--brand-ai)/0.22)] bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))] shadow-[var(--shadow-xs)]">
        <Sparkles className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="rounded-[24px] rounded-bl-[8px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.42)_100%)] px-4 py-3.5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-1.5">
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

function HydratingState() {
  return (
    <div className="space-y-4 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className={cn('flex items-end gap-3', i % 2 === 1 && 'flex-row-reverse')}>
          <div className="h-9 w-9 rounded-[14px] bg-[hsl(var(--fill)/0.8)] animate-pulse" />
          <div className={cn('space-y-2', i % 2 === 1 ? 'ml-auto w-[72%]' : 'w-[74%]')}>
            <div className="h-3 w-20 rounded-full bg-[hsl(var(--fill)/0.8)] animate-pulse" />
            <div className="h-16 rounded-[24px] bg-[hsl(var(--fill)/0.8)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CoachChatSheet({
  open,
  onOpenChange,
  messages,
  isTyping,
  isHydrating = false,
  loadError = null,
  actionStates,
  onSendMessage,
  onConfirmAction,
  onDismissAction,
  pageContext = 'today',
  suggestions = [],
}) {
  const t = useT();
  const { can } = useSubscription();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const userMsgCount = safeMessages.filter((m) => m.role === 'user').length;
  const isFreeGated = !can('atlas_ai') && userMsgCount >= 1;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [safeMessages, isTyping, isHydrating]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;
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
    if (!text) return;
    onSendMessage(text, pageContext);
  }

  const lastAssistant = [...safeMessages].reverse().find((m) => m.role === 'assistant');
  const visibleSuggestions = (lastAssistant?.suggestions?.length > 0 ? lastAssistant.suggestions : safeSuggestions).slice(0, 3);
  const isEmpty = safeMessages.length === 0;

  return createPortal(
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="flex max-h-[92dvh] flex-col pb-[env(safe-area-inset-bottom,0px)] focus:outline-none">
        <div className="shrink-0 border-b border-[hsl(var(--border)/0.52)] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]">
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {t('coach.chat.title')}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--fg-3))]">
                    Reactive chat for follow-up and adjustments
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--fill)/0.5)] hover:text-[hsl(var(--fg-2))]"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-4">
            {isHydrating && isEmpty ? <HydratingState /> : null}

            {!isHydrating && isEmpty && !loadError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(var(--brand-ai)/0.2)] bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))]">
                  <Sparkles className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div className="max-w-[240px] space-y-1">
                  <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">
                    {t('coach.chat.emptyTitle')}
                  </p>
                  <p className="text-[13px] leading-5 text-[hsl(var(--fg-3))]">
                    {t('coach.chat.emptyDesc')}
                  </p>
                </div>
              </div>
            ) : null}

            {loadError && isEmpty ? (
              <div className="rounded-[18px] border border-[hsl(var(--warn)/0.22)] bg-[hsl(var(--warn)/0.08)] px-4 py-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[hsl(var(--warn))]" strokeWidth={2} />
                  <span className="font-semibold text-[hsl(var(--fg))]">Conversation history unavailable</span>
                </div>
                <p className="mt-1">
                  {loadError}. New messages still work.
                </p>
              </div>
            ) : null}

            {safeMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                actionStates={actionStates}
                onConfirm={onConfirmAction}
                onDismiss={onDismissAction}
              />
            ))}

            {isTyping ? <TypingIndicator /> : null}

            {isFreeGated ? (
              <div className="pt-1">
                <PaywallTrigger trigger="ai_coach" show />
              </div>
            ) : null}
          </div>
        </div>

        {visibleSuggestions.length > 0 ? (
          <div className="shrink-0 border-t border-[hsl(var(--border)/0.52)] px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {visibleSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="shrink-0 rounded-full border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--fill)/0.45)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-colors active:bg-[hsl(var(--fill)/0.8)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className={cn(
          'shrink-0 border-t border-[hsl(var(--border)/0.52)] px-4 py-3',
          isFreeGated && 'pointer-events-none opacity-45'
        )}>
          <div className="rounded-[22px] border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--card)/0.75)] p-3 shadow-[var(--shadow-xs)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Message coach
              </p>
              <span className="text-[11px] text-[hsl(var(--fg-3))]">
                Enter to send
              </span>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isFreeGated}
                placeholder={isFreeGated ? 'Upgrade for more messages' : t('coach.chat.placeholder')}
                rows={1}
                className={cn(
                  'flex-1 resize-none rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.42)] px-3.5 py-2.5',
                  'text-[14px] leading-6 text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))]',
                  'focus:border-[hsl(var(--brand-ai)/0.42)] focus:bg-[hsl(var(--fill)/0.58)] focus:outline-none',
                  'max-h-28 transition-colors'
                )}
                style={{ minHeight: '44px' }}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all',
                  input.trim() && !isTyping
                    ? 'bg-[hsl(var(--brand-ai))] text-white active:scale-95'
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

            <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[hsl(var(--fg-3))]">
              <span>Shift+Enter for a new line</span>
              <span>{safeMessages.length} messages</span>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>,
    document.body
  );
}
