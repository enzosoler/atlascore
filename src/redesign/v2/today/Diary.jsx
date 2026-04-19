/**
 * Diary — /app/diary.
 * Ref: Day One (journaling) + iOS Notes + Reflectly prompts.
 *
 * Personal reflection journal. Each entry is a timestamped note the user
 * writes — optionally tied to a mood tag and to the day's metrics snapshot.
 * Atlas AI can ask the user prompted questions to surface patterns.
 *
 * Layout:
 *  - Compose card at top (big placeholder, mood picker, save button)
 *  - Entries feed below, reverse-chron, each with date chip + mood dot +
 *    body + optional metrics badge
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { MoodGreatIcon, MoodGoodIcon, MoodOkIcon, MoodLowIcon, SparkleIcon } from '../lib/icons';

const MOODS = [
  { v: 'great', label: 'Great', Icon: MoodGreatIcon, color: '#34D399' },
  { v: 'good',  label: 'Good',  Icon: MoodGoodIcon,  color: 'hsl(var(--rd-accent))' },
  { v: 'ok',    label: 'OK',    Icon: MoodOkIcon,    color: '#FBBF24' },
  { v: 'low',   label: 'Low',   Icon: MoodLowIcon,   color: '#FB7185' },
];

export default function Diary({
  entries = [],          // [{ id, at, text, mood, metrics: { recovery, kcal, sleepH, workouts } }]
  suggestedPrompt = null, // string | null — AI-generated prompt for today
  onSave,                // ({ text, mood }) => void
  onOpenEntry,           // (id) => void
  onDismissPrompt,
}) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      await onSave?.({ text: body, mood });
      setText('');
      setMood(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Diary
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            What's on your mind?
          </h1>
        </SpringReveal>

        {/* Optional AI prompt */}
        {suggestedPrompt && (
          <SpringReveal delay={60}>
            <Glass tint="ai" radius="lg" style={{ padding: 12, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span aria-hidden style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(139,92,246,0.28)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SparkleIcon size={12} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700 }}>
                    Atlas prompt
                  </div>
                  <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-primary))', marginTop: 2, lineHeight: 1.4 }}>
                    {suggestedPrompt}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onDismissPrompt}
                  aria-label="Dismiss"
                  style={{ width: 24, height: 24, background: 'transparent', border: 'none', color: 'hsl(var(--rd-fg-muted))', cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
                </button>
              </div>
            </Glass>
          </SpringReveal>
        )}

        {/* Composer */}
        <SpringReveal delay={100}>
          <Glass radius="xl" style={{ padding: 4, marginTop: 16 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Training felt heavy today. Knee a little sore on the left side. Slept badly…"
              rows={5}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'hsl(var(--rd-fg-primary))',
                padding: 14,
                resize: 'none',
                fontSize: 15, lineHeight: 1.5,
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {MOODS.map((m) => {
                  const Icon = m.Icon;
                  const active = mood === m.v;
                  return (
                    <button
                      key={m.v}
                      type="button"
                      onClick={() => setMood(active ? null : m.v)}
                      aria-label={m.label}
                      aria-pressed={active}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: active ? `${m.color}22` : 'transparent',
                        border: active ? `1px solid ${m.color}66` : '1px solid transparent',
                        color: active ? m.color : 'hsl(var(--rd-fg-muted))',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                        transition: 'all 180ms',
                      }}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
              <LiquidButton
                intent="primary"
                size="sm"
                onClick={save}
                disabled={!text.trim() || busy}
                loading={busy}
              >
                Save entry
              </LiquidButton>
            </div>
          </Glass>
        </SpringReveal>

        {/* Feed */}
        <div style={{ marginTop: 28 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', paddingInline: 2 }}>
            Your entries
          </h2>
          {entries.length === 0 ? (
            <Glass radius="lg" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                No entries yet. Writing a few lines after a hard day gives your coach the missing context that numbers can't explain.
              </div>
            </Glass>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {entries.map((e) => (
                <EntryCard key={e.id} entry={e} onClick={() => onOpenEntry?.(e.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SafeScreen>
  );
}
export { Diary };

function EntryCard({ entry, onClick }) {
  const d = new Date(entry.at);
  const moodDef = MOODS.find((m) => m.v === entry.mood);
  const MoodIcon = moodDef?.Icon;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', gap: 12,
        padding: '14px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ width: 40, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
          {d.toLocaleDateString('en-US', { month: 'short' })}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {d.getDate()}
        </div>
        <div style={{ fontSize: 9, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {MoodIcon && (
            <span style={{ color: moodDef.color, display: 'inline-flex' }}>
              <MoodIcon size={14} />
            </span>
          )}
          {entry.metrics && (
            <div style={{ display: 'flex', gap: 4, fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
              {entry.metrics.recovery != null && <MetricChip label="Rec" value={`${entry.metrics.recovery}%`} />}
              {entry.metrics.sleepH != null && <MetricChip label="Sleep" value={`${entry.metrics.sleepH}h`} />}
              {entry.metrics.workouts > 0 && <MetricChip label="W" value={entry.metrics.workouts} />}
            </div>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.5 }} className="line-clamp-3">
          {entry.text}
        </p>
      </div>
    </button>
  );
}

function MetricChip({ label, value }) {
  return (
    <span
      style={{
        padding: '1px 6px',
        borderRadius: 6,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      <span style={{ color: 'hsl(var(--rd-fg-muted))' }}>{label} </span>{value}
    </span>
  );
}
