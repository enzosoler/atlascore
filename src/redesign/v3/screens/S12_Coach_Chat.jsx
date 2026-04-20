import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function S12_Coach_Chat({
  dark = false,
  dateLabel = 'Today · 07:42 AM',
  statusLabel = 'Reading your signal · live',
  messages,
  suggestionLabel = 'Suggested · today',
  suggestionText = 'Add a 30g protein shake between lunch and training. Keeps you above threshold without extra meals.',
  suggestionActions = ['Add to plan', 'Not today'],
  quickActions = ['Log oats + whey', 'Show me options', 'Later'],
  draftPlaceholder = 'Ask the coach…',
  composerDisabled = false,
  onBack,
  onOpenMenu,
  onSuggestionAction,
  onQuickAction,
  onSend,
}) {
  const c = useACT(dark);
  const [draft, setDraft] = useState('');
  const rows = messages || [
    {
      text: <>Good morning. HRV came back strong, <b style={{ color: c.accent }}>72 ms</b>, up 8 from your rolling average. Your body's primed for heavy lower today.</>,
      meta: 'Coach · context: readiness 87, HRV 72ms',
    },
    {
      text: <>One flag: protein landed at <b>128g</b> yesterday vs your target of 186g. That's a 58g gap, and it shows up as slower recovery if it becomes a pattern.</>,
    },
    {
      mine: true,
      text: 'Got it. What should I aim for pre-workout?',
    },
    {
      text: '~40g carbs + 20g protein, 60–90 min before. A banana with Greek yogurt or oats with whey hits it clean. Want me to log one?',
      meta: 'Coach · just now',
    },
  ];
  const Bubble = ({ mine, children, meta }) => (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: mine ? 'flex-end' : 'flex-start',
      marginBottom: 14,
    }}>
      <div style={{
        maxWidth: '82%', padding: '12px 14px',
        borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: mine ? c.fg : c.card,
        color: mine ? c.bg : c.fg,
        fontSize: 14.5, lineHeight: 1.45,
      }}>{children}</div>
      {meta && <ACLabel size={10} color={c.mute} style={{ marginTop: 4, padding: '0 4px' }}>{meta}</ACLabel>}
    </div>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${c.hair}` }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: 30, height: 30, borderRadius: 999, border: 'none',
            background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: onBack ? 'pointer' : 'default',
          }}
          aria-label="Back"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M6.5 1.4L2.5 5l4 3.6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: c.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HeartMark size={18} color={c.ink} accent="transparent" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>Coach</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />
            <ACLabel size={11} color={c.dim}>{statusLabel}</ACLabel>
          </div>
        </div>
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            aria-label="Chat actions"
          >
            <svg width="16" height="4" viewBox="0 0 16 4"><circle cx="2" cy="2" r="1.6" fill={c.fg}/><circle cx="8" cy="2" r="1.6" fill={c.fg}/><circle cx="14" cy="2" r="1.6" fill={c.fg}/></svg>
          </button>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 22px' }}>
        <div style={{ textAlign: 'center', margin: '4px 0 18px' }}>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase' }}>{dateLabel}</ACLabel>
        </div>

        {rows.map((row, idx) => (
          <Bubble key={idx} mine={row.mine} meta={row.meta}>
            {row.text}
          </Bubble>
        ))}

        <div style={{ marginBottom: 14, padding: 12, background: c.card, borderRadius: ACRadii.input, borderLeft: `3px solid ${c.accent}` }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{suggestionLabel}</ACLabel>
          <div style={{ marginTop: 6, fontSize: 13.5, color: c.fg, lineHeight: 1.5 }}>
            {suggestionText}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {suggestionActions.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => onSuggestionAction?.(label)}
                style={{
                  padding: '7px 12px',
                  background: i === 0 ? c.accent : 'transparent',
                  color: i === 0 ? c.ink : c.dim,
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: i === 0 ? 'none' : `1px solid ${c.faint}`,
                  cursor: onSuggestionAction ? 'pointer' : 'default',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {quickActions.map((s, i) => (
            <button key={i} type="button" onClick={() => onQuickAction?.(s)} style={{
              padding: '8px 12px', background: 'transparent', border: `1px solid ${c.faint}`,
              borderRadius: 999, fontSize: 12, color: c.fg, fontWeight: 500,
              cursor: onQuickAction ? 'pointer' : 'default',
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 16px 18px', borderTop: `1px solid ${c.hair}`, opacity: composerDisabled ? 0.5 : 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: c.card, borderRadius: 999,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9l6 6M9 15V3M9 3l6 6" stroke={c.dim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={draftPlaceholder}
            disabled={composerDisabled}
            onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { onSend?.(draft.trim()); setDraft(''); } }}
            style={{
              flex: 1, fontSize: 14, color: c.fg, background: 'transparent',
              border: 'none', outline: 'none', boxShadow: 'none',
              fontFamily: ACFonts.body,
            }}
          />
          <button
            type="button"
            disabled={composerDisabled || !draft.trim()}
            onClick={() => { if (draft.trim()) { onSend?.(draft.trim()); setDraft(''); } }}
            style={{
            width: 30, height: 30, borderRadius: 999,
            background: composerDisabled ? c.mute : c.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: composerDisabled ? 'not-allowed' : (onSend ? 'pointer' : 'default'),
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 11V3M3 7l4-4 4 4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default S12_Coach_Chat;
