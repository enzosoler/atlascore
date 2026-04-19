import React, { useState } from 'react';
import { Card, CardBody, Button, Badge, Chip } from '../ui';
import { cn } from '../lib/cn';

/** AI Coach — ChatGPT mental model + Whoop/Oura proactive cards. */

export function CoachMessage({ message }) {
  const isCoach = message.role === 'coach';
  return (
    <div className={cn('flex gap-2.5', isCoach ? 'justify-start' : 'justify-end')}>
      {isCoach && <CoachAvatar />}
      <div className={cn('max-w-[78%] rounded-rd-xl px-4 py-2.5',
        isCoach
          ? 'bg-rd-surface-2 border border-rd-border text-rd-fg rounded-tl-sm'
          : 'bg-rd-accent text-rd-fg-on-accent rounded-tr-sm',
      )}>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
        {isCoach && message.confidence != null && (
          <p className="mt-1.5 text-[11px] text-rd-fg-muted">
            Confidence {Math.round(message.confidence * 100)}% · <button className="underline">Why?</button>
          </p>
        )}
        <p className={cn('mt-1 text-[11px]', isCoach ? 'text-rd-fg-muted' : 'text-rd-fg-on-accent/70')}>{message.ts}</p>
      </div>
    </div>
  );
}

function CoachAvatar() {
  return (
    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rd-ai-muted text-rd-ai" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5L18 18 M6 18l2.5-2.5 M15.5 8.5 18 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
    </span>
  );
}

export function CoachComposer({ value, onChange, onSend, disabled, suggestions = [] }) {
  return (
    <div className="border-t border-rd-border bg-rd-bg/90 backdrop-blur p-3 rd-safe-bottom">
      {suggestions.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto rd-scroll-hide">
          {suggestions.map((s) => <Chip key={s} onClick={() => onChange?.(s)}>{s}</Chip>)}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-rd-xl border border-rd-border bg-rd-surface px-3 py-2">
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={1}
          disabled={disabled}
          placeholder="Ask your coach anything…"
          className="flex-1 resize-none bg-transparent text-[14px] text-rd-fg placeholder:text-rd-fg-muted outline-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend?.(); } }}
        />
        <Button size="sm" intent="primary" onClick={onSend} disabled={!value?.trim() || disabled}>Send</Button>
      </div>
    </div>
  );
}

export function CoachThinking() {
  return (
    <div className="flex items-center gap-2.5">
      <CoachAvatar />
      <div className="rounded-rd-xl rounded-tl-sm bg-rd-surface-2 border border-rd-border px-4 py-2.5">
        <span className="inline-flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rd-fg-muted animate-rd-pulse-soft" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-rd-fg-muted animate-rd-pulse-soft" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-rd-fg-muted animate-rd-pulse-soft" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}

/** Low-confidence output — explicit, honest. */
export function CoachLowConfidence({ body, onRefine, onEscalate }) {
  return (
    <Card tone="warning">
      <CardBody>
        <Badge tone="warning">Low confidence</Badge>
        <p className="mt-2 text-[14px] text-rd-fg-secondary leading-relaxed">{body}</p>
        <div className="mt-3 flex gap-2">
          {onRefine && <Button size="sm" intent="secondary" onClick={onRefine}>Refine with more detail</Button>}
          {onEscalate && <Button size="sm" intent="ghost" onClick={onEscalate}>Get human help</Button>}
        </div>
      </CardBody>
    </Card>
  );
}

/** Proactive insight card — Whoop/Oura pattern. */
export function ProactiveInsightCard({ insight }) {
  const toneMap = { info: 'ai', success: 'success', warning: 'warning', danger: 'danger' };
  return (
    <Card tone={toneMap[insight.tone] || 'ai'}>
      <CardBody>
        <div className="flex items-start gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            insight.tone === 'success' ? 'bg-rd-success/15 text-rd-success' :
            insight.tone === 'warning' ? 'bg-rd-warning/15 text-rd-warning' :
                                         'bg-rd-ai/15 text-rd-ai',
          )}>✨</div>
          <div className="min-w-0">
            <p className="text-rd-h4 text-rd-fg">{insight.title}</p>
            <p className="mt-1 text-[13px] text-rd-fg-secondary leading-relaxed">{insight.body}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function ExplainabilityCard({ sources }) {
  return (
    <Card>
      <CardBody>
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">What this is based on</p>
        <ul className="mt-2 space-y-1.5 text-[13px] text-rd-fg-secondary">
          {sources.map((s, i) => <li key={i}>· {s}</li>)}
        </ul>
        <p className="mt-3 text-[12px] text-rd-fg-muted">Coach suggestions are informational and not medical advice.</p>
      </CardBody>
    </Card>
  );
}
