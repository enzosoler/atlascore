import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Clock,
  Loader2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try {
      return typeof results === 'string' ? JSON.parse(results) : results;
    } catch {
      return results;
    }
  })();

  const isError =
    results &&
    ((typeof results === 'string' && /error|failed/i.test(results)) ||
      parsedResults?.success === false);

  const statusConfig =
    {
      pending: { icon: Clock, color: 'text-[hsl(var(--fg-3))]', text: 'Pending' },
      running: {
        icon: Loader2,
        color: 'text-[hsl(var(--brand-ai))]',
        text: 'Running...',
        spin: true,
      },
      in_progress: {
        icon: Loader2,
        color: 'text-[hsl(var(--brand-ai))]',
        text: 'Running...',
        spin: true,
      },
      completed: isError
        ? { icon: AlertCircle, color: 'text-[hsl(var(--err))]', text: 'Failed' }
        : { icon: CheckCircle2, color: 'text-[hsl(var(--ok))]', text: 'Success' },
      success: { icon: CheckCircle2, color: 'text-[hsl(var(--ok))]', text: 'Success' },
      failed: { icon: AlertCircle, color: 'text-[hsl(var(--err))]', text: 'Failed' },
      error: { icon: AlertCircle, color: 'text-[hsl(var(--err))]', text: 'Failed' },
    }[status] || { icon: Clock, color: 'text-[hsl(var(--fg-3))]', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();

  return (
    <div className="mt-3 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-2 rounded-[18px] border px-3 py-2 text-left transition-all',
          expanded
            ? 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--fill)/0.86)]'
            : 'border-[hsl(var(--border)/0.78)] bg-[hsl(var(--card)/0.8)] hover:bg-[hsl(var(--fill)/0.72)]'
        )}
      >
        <Icon
          className={cn('h-3.5 w-3.5 shrink-0', statusConfig.color, statusConfig.spin && 'animate-spin')}
        />
        <span className="truncate text-[12px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
          {formattedName}
        </span>
        {statusConfig.text ? (
          <span
            className={cn(
              'shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]',
              isError && 'text-[hsl(var(--err))]'
            )}
          >
            {statusConfig.text}
          </span>
        ) : null}
        {!statusConfig.spin && (toolCall.arguments_string || results) ? (
          <ChevronRight
            className={cn(
              'ml-auto h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))] transition-transform',
              expanded && 'rotate-90'
            )}
          />
        ) : null}
      </button>

      {expanded && !statusConfig.spin ? (
        <div className="mt-2 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] p-3 shadow-[var(--shadow-xs)]">
          {parsedResults ? (
            <pre className="whitespace-pre-wrap text-[12px] leading-6 text-[hsl(var(--fg-2))]">
              {typeof parsedResults === 'object'
                ? JSON.stringify(parsedResults, null, 2)
                : parsedResults}
            </pre>
          ) : (
            <p className="text-[12px] leading-6 text-[hsl(var(--fg-2))]">
              No result available.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

const assistantMarkdownComponents = {
  p: ({ children }) => <p className="my-2 leading-7 text-[hsl(var(--fg-2))]">{children}</p>,
  ul: ({ children }) => <ul className="my-3 ml-4 list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 ml-4 list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-7 text-[hsl(var(--fg-2))]">{children}</li>,
  h1: ({ children }) => (
    <h1 className="my-3 text-[1rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="my-3 text-[0.95rem] font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="my-2 text-[0.9rem] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
      {children}
    </h3>
  ),
  strong: ({ children }) => <strong className="font-semibold text-[hsl(var(--fg))]">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded-md bg-[hsl(var(--fill))] px-1.5 py-0.5 text-[12px] text-[hsl(var(--fg))]">
      {children}
    </code>
  ),
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <article className={cn('flex items-start gap-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border shadow-[var(--shadow-xs)]',
          isUser
            ? 'border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand))] text-white'
            : 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.88)] text-[hsl(var(--brand))]'
        )}
        >
        {isUser ? <User className="h-4 w-4" strokeWidth={1.9} /> : <BarChart3 className="h-4 w-4" strokeWidth={1.9} />}
      </div>

      <div className={cn('max-w-3xl space-y-2', isUser && 'items-end text-right')}>
        <div
          className={cn(
            'rounded-[28px] border px-5 py-4 shadow-[var(--shadow-sm)]',
            isUser
              ? 'border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--brand))_0%,hsl(var(--brand)/0.84)_100%)] text-white'
              : 'border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.5)_100%)] text-[hsl(var(--fg))]'
          )}
        >
          <div
            className={cn(
              'mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]',
              isUser
                ? 'justify-end text-white/70'
                : 'text-[hsl(var(--fg-3))]'
            )}
          >
            {isUser ? (
              <>
                <span>You</span>
                <span className="h-1 w-1 rounded-full bg-current" />
                <span>Question</span>
              </>
            ) : (
              <>
                <span>Insights</span>
                <span className="h-1 w-1 rounded-full bg-current" />
                <span>Local summary</span>
              </>
            )}
          </div>

          {message.content ? (
            isUser ? (
              <p className="text-[14px] leading-7 text-white">
                {message.content}
              </p>
            ) : (
              <ReactMarkdown
                className="max-w-none text-[14px] leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={assistantMarkdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            )
          ) : null}
        </div>

        {message.tool_calls?.length > 0 ? (
          <div className="space-y-1">
            {message.tool_calls.map((toolCall, index) => (
              <FunctionDisplay key={index} toolCall={toolCall} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
