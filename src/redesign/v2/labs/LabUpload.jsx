/**
 * LabUpload — /app/labs/upload.
 * Ref: Function Health PDF upload + SuperDoc.
 *
 * Flow:
 *  1. Drop zone / file picker — accepts PDF (and images?)
 *  2. Upload progress
 *  3. AI parse progress ("Reading panel…", "Extracting biomarkers…")
 *  4. Success summary with "View results" CTA OR error with retry
 */
import React, { useRef, useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon } from '../lib/icons';

const PHASES = {
  idle:      { label: '', pct: 0 },
  uploading: { label: 'Uploading…',           pct: 40 },
  parsing:   { label: 'Atlas AI is reading…', pct: 70 },
  analyzing: { label: 'Extracting biomarkers…', pct: 90 },
  done:      { label: 'Done',                 pct: 100 },
};

export default function LabUpload({
  onCancel,
  onSubmit,             // (file) => Promise<{ examId, biomarkerCount }>
  onViewResults,        // (examId) => void
}) {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const pickFile = () => inputRef.current?.click();

  const onFile = (f) => {
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      setError('File too large (max 20 MB). Try splitting or compressing.');
      return;
    }
    setError('');
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setError('');
    setPhase('uploading');
    try {
      // Simulated staged progress — real impl streams from edge function.
      await wait(800);
      setPhase('parsing');
      await wait(1200);
      setPhase('analyzing');
      await wait(1200);

      const res = await onSubmit?.(file);
      setPhase('done');
      setResult(res || { examId: 'pending', biomarkerCount: 0 });
    } catch (err) {
      setError(err?.message || 'Upload failed. Check your connection and retry.');
      setPhase('idle');
    }
  };

  const isWorking = phase !== 'idle' && phase !== 'done';

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}>
      <BackButton onClick={onCancel} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 480, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Upload lab panel
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Drop a PDF, get answers.
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
            Atlas reads any blood panel PDF, extracts every biomarker, and explains what each
            means for your training. Takes ~15 seconds.
          </p>
        </SpringReveal>

        {phase === 'done' ? (
          <SuccessCard result={result} onViewResults={onViewResults} onCancel={onCancel} />
        ) : (
          <>
            <SpringReveal delay={60}>
              <DropZone
                file={file}
                onPickFile={pickFile}
                working={isWorking}
                onClear={() => setFile(null)}
              />
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => onFile(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
            </SpringReveal>

            {/* Progress */}
            {isWorking && (
              <SpringReveal delay={60}>
                <ProgressCard phase={phase} />
              </SpringReveal>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.38)',
                  color: '#FB7185',
                  fontSize: 13, lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}

            {/* Privacy note */}
            <SpringReveal delay={120}>
              <Glass radius="lg" style={{ padding: 12, marginTop: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
                  Private by default
                </div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                  Your lab PDF is stored encrypted on your account only. It's never used to train any
                  model, and you can delete it at any time from Danger zone.
                </div>
              </Glass>
            </SpringReveal>
          </>
        )}
      </div>

      {/* Sticky upload CTA */}
      {phase !== 'done' && (
        <div
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
            paddingBottom: 'env(safe-area-inset-bottom)',
            backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
            backdropFilter: 'blur(22px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
          }}
        >
          <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 480, margin: '0 auto' }}>
            <LiquidButton
              intent="primary"
              size="xl"
              block
              disabled={!file || isWorking}
              loading={isWorking}
              onClick={upload}
            >
              {isWorking ? PHASES[phase].label : 'Upload & analyze'}
            </LiquidButton>
          </div>
        </div>
      )}
    </SafeScreen>
  );
}
export { LabUpload };

function DropZone({ file, onPickFile, working, onClear }) {
  return (
    <button
      type="button"
      onClick={onPickFile}
      disabled={working}
      style={{
        width: '100%',
        marginTop: 20,
        padding: 28,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed rgba(0,255,255,0.35)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        cursor: working ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span aria-hidden style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(0,255,255,0.10)', border: '1px solid rgba(0,255,255,0.3)', color: 'hsl(var(--rd-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 3v13m0-13l-5 5m5-5l5 5M5 21h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {file ? (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', textAlign: 'center' }}>
            {file.name}
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
            {formatBytes(file.size)}
          </div>
          {!working && (
            <span
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{ fontSize: 12, color: '#FB7185', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
            >
              Choose different file
            </span>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Tap to pick a PDF
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', textAlign: 'center', lineHeight: 1.4 }}>
            Most providers let you download your panel as PDF. Max 20 MB.
          </div>
        </>
      )}
    </button>
  );
}

function ProgressCard({ phase }) {
  const cfg = PHASES[phase];
  return (
    <Glass tint="ai" radius="xl" style={{ padding: 16, marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span aria-hidden style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.5)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'rd-spin 1400ms linear infinite' }}>
          <SparkleIcon size={14} />
        </span>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{cfg.label}</div>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${cfg.pct}%`, height: '100%', background: '#A78BFA', transition: 'width 800ms cubic-bezier(.22,1,.36,1)' }} />
      </div>
      <style>{`@keyframes rd-spin { to { transform: rotate(360deg); } }`}</style>
    </Glass>
  );
}

function SuccessCard({ result, onViewResults, onCancel }) {
  return (
    <SpringReveal>
      <Glass radius="xl" style={{ padding: 20, marginTop: 20, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.25)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, margin: '0 auto 12px', background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.5)', color: '#34D399', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Panel analyzed</div>
        <p style={{ margin: '6px 0 16px', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
          {result?.biomarkerCount
            ? <>Extracted <strong style={{ color: 'hsl(var(--rd-fg-primary))' }}>{result.biomarkerCount}</strong> biomarkers with context + flags.</>
            : 'Your results are ready.'}
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          <LiquidButton intent="primary" size="lg" block onClick={() => onViewResults?.(result?.examId)}>
            View results
          </LiquidButton>
          <LiquidButton intent="neutral" size="md" block onClick={onCancel}>
            Back to labs
          </LiquidButton>
        </div>
      </Glass>
    </SpringReveal>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label="Back"
      style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
        zIndex: 45,
        width: 36, height: 36, borderRadius: 9999,
        background: 'rgba(10,14,20,0.55)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
    </button>
  );
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
