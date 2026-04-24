import React, { useRef, useState, useEffect } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn,
} from '../lib/paper.jsx';

/* ── phase config ─────────────────────────────────────────────── */

const PHASES = [
  { key: 'uploading', label: 'Uploading panel',       pct: 35 },
  { key: 'parsing',   label: 'Parsing biomarkers',    pct: 65 },
  { key: 'analyzing', label: 'Saving results',        pct: 90 },
];

/**
 * S77_Lab_Upload -- lab panel upload flow with 3-stage gift reveal (section 12).
 *
 * Three states:
 *   1) idle     -- dashed drop-zone, tap to pick file, 20MB limit, privacy note
 *   2) working  -- staged progress (uploading, parsing, saving) with bar
 *   3) success  -- parsed result or honest pending state
 *   4) error    -- inline error with retry
 *
 * This is a GIFT MOMENT (section 12: lab result parsing).
 * The processing-to-success transition uses the 3-stage reward system:
 *   Anticipation -- animated progress through staged labels
 *   Reveal       -- biomarker count animates in with weight
 *   Celebration  -- outcome message + accent CTA
 *
 * Gallery:    <S77_Lab_Upload dark />
 * Production: <S77_Lab_Upload dark onCancel={fn} onSubmit={fn} onViewResults={fn} />
 *
 * @param {boolean}  dark           - light/dark variant
 * @param {Function} onCancel       - cancel / close handler
 * @param {Function} onSubmit       - (file) => Promise<{examId, biomarkerCount, status, pendingMessage}>
 * @param {Function} onViewResults  - (examId) => void
 */
export default function S77_Lab_Upload({
  dark = false,
  onCancel,
  onSubmit,
  onViewResults,
}) {
  const c = useACT(dark);
  const inputRef = useRef(null);

  const [file, setFile]       = useState(null);
  const [phase, setPhase]     = useState('idle');   // idle | uploading | parsing | analyzing | success | error
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);
  const [revealStep, setRevealStep] = useState(0);  // 0=hidden, 1=number, 2=celebration

  const handleCancel  = () => { if (typeof onCancel === 'function') onCancel(); };
  const handleView    = () => { if (typeof onViewResults === 'function') onViewResults(result?.examId); };

  /* ── file selection ─────────────────────────────────────────── */

  const pickFile = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      setError('File exceeds 20 MB. Try compressing or splitting.');
      return;
    }
    setError('');
    setFile(f);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError('');
  };

  /* ── upload + staged progress ───────────────────────────────── */

  const upload = async () => {
    if (!file) return;
    setError('');
    try {
      if (typeof onSubmit !== 'function') {
        throw new Error('Lab upload is not configured.');
      }
      const res = await onSubmit(file, { onPhaseChange: setPhase });
      setResult(res || null);
      setPhase('success');
    } catch (err) {
      setError(err?.message || 'Upload failed. Check your connection and retry.');
      setPhase('idle');
    }
  };

  /* ── gift moment: 3-stage reveal on success ─────────────────── */

  useEffect(() => {
    if (phase !== 'success') { setRevealStep(0); return; }
    const t1 = setTimeout(() => setRevealStep(1), 300);
    const t2 = setTimeout(() => setRevealStep(2), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const isWorking = phase === 'uploading' || phase === 'parsing' || phase === 'analyzing';
  const currentPhase = PHASES.find((p) => p.key === phase);
  const isPending = result?.status === 'pending';
  const successTitle = isPending ? 'Upload received' : 'Panel analyzed';
  const successBody = isPending
    ? result?.pendingMessage || 'Your lab report is uploaded. Parsing usually takes 1-2 minutes. We will notify you when biomarkers are ready.'
    : 'Your biomarkers have been extracted and flagged.';
  const ctaLabel = isPending ? 'Open upload record' : 'View results';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── nav bar ────────────────────────────────────────── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button" onClick={handleCancel}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Upload panel
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── scrollable content ─────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 22px 28px' }}>

        {/* ── title ──────────────────────────────────────── */}
        <div style={{
          fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
        }}>
          {phase === 'success' ? successTitle : 'Add lab panel'}
        </div>
        <div style={{ marginTop: 6 }}>
          <ACLabel size={13} color={c.dim} style={{ lineHeight: 1.5 }}>
            {phase === 'success'
              ? successBody
              : 'Upload a blood panel PDF. Atlas reads every biomarker and explains what it means.'}
          </ACLabel>
        </div>

        {/* ── SUCCESS STATE ──────────────────────────────── */}
        {phase === 'success' && (
          <div style={{ marginTop: 28 }}>
            {/* Stage 1: reveal — biomarker count */}
            <div style={{
              opacity: revealStep >= 1 ? 1 : 0,
              transform: revealStep >= 1 ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
              textAlign: 'center', padding: '28px 0 14px',
            }}>
              {isPending ? (
                <>
                  <ACLabel size={12} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    Pending
                  </ACLabel>
                  <div style={{ marginTop: 10, fontSize: 18, fontWeight: 600, color: c.fg }}>
                    Parsing has not completed yet
                  </div>
                </>
              ) : (
                <>
                  <ACNum size={72} color={c.accent} weight={700}>
                    {result?.biomarkerCount ?? 0}
                  </ACNum>
                  <div style={{ marginTop: 8 }}>
                    <ACLabel size={14} color={c.fg} style={{ fontWeight: 600 }}>
                      biomarkers extracted
                    </ACLabel>
                  </div>
                </>
              )}
            </div>

            {/* Stage 2: celebration — outcome + CTA */}
            <div style={{
              opacity: revealStep >= 2 ? 1 : 0,
              transform: revealStep >= 2 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
            }}>
              <div style={{
                padding: 18, background: c.card, borderRadius: ACRadii.card,
                borderLeft: `3px solid ${c.accent}`,
              }}>
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                  {isPending ? 'Queued for parsing' : 'Ready for review'}
                </ACLabel>
                <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>
                  {isPending
                    ? 'The file is in storage and the panel record is created. Results will appear here once parsing finishes.'
                    : 'Each marker has been flagged with status, range context, and coaching notes. Tap below to explore.'}
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                <ACBtn primary dark={dark} block onClick={handleView} size="lg">
                  {ctaLabel}
                </ACBtn>
              </div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button" onClick={handleCancel}
                  style={{
                    padding: '10px 16px', borderRadius: ACRadii.button,
                    border: `1px solid ${c.faint}`, background: 'transparent',
                    color: c.dim, fontSize: 13, fontWeight: 600,
                    fontFamily: ACFonts.body, cursor: 'pointer',
                  }}
                >
                  Back to labs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── IDLE / WORKING STATE ───────────────────────── */}
        {phase !== 'success' && (
          <>
            {/* ── drop zone ────────────────────────────────── */}
            <button
              type="button"
              onClick={!isWorking ? pickFile : undefined}
              disabled={isWorking}
              style={{
                width: '100%', marginTop: 22, padding: 28,
                borderRadius: ACRadii.card,
                background: c.card,
                border: `2px dashed ${file ? c.accent : c.faint}`,
                color: c.fg,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                cursor: isWorking ? 'default' : 'pointer',
                WebkitTapHighlightColor: 'transparent',
                opacity: isWorking ? 0.6 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {/* upload icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: c.faint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v13m0-13l-5 5m5-5l5 5M5 21h14" stroke={c.accent} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {file ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, textAlign: 'center', color: c.fg }}>
                    {file.name}
                  </div>
                  <ACMono size={11} color={c.dim}>{formatBytes(file.size)}</ACMono>
                  {!isWorking && (
                    <span
                      onClick={clearFile}
                      style={{ fontSize: 12, color: c.accent, fontWeight: 600, cursor: 'pointer', marginTop: 2, fontFamily: ACFonts.body }}
                    >
                      Choose different file
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: c.fg }}>
                    Tap to pick a PDF
                  </div>
                  <ACMono size={11} color={c.dim}>Blood panel PDF up to 20 MB</ACMono>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />

            {/* ── progress card (anticipation stage) ───────── */}
            {isWorking && currentPhase && (
              <div style={{
                marginTop: 14, padding: 16, background: c.card,
                borderRadius: ACRadii.card,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    border: `2px solid ${c.faint}`,
                    borderTopColor: c.accent,
                    animation: 'ac-spin 0.9s linear infinite',
                    flexShrink: 0,
                  }} />
                  <ACLabel size={13} color={c.fg} style={{ fontWeight: 600 }}>
                    {currentPhase.label}
                  </ACLabel>
                </div>
                <div style={{
                  height: 6, borderRadius: 3, background: c.faint, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${currentPhase.pct}%`, height: '100%',
                    background: c.accent,
                    transition: 'width 0.8s cubic-bezier(.22,1,.36,1)',
                    borderRadius: 3,
                  }} />
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  {PHASES.map((p) => (
                    <ACMono
                      key={p.key}
                      size={9}
                      color={phase === p.key ? c.accent : (PHASES.indexOf(p) < PHASES.findIndex((x) => x.key === phase) ? c.fg : c.mute)}
                      style={{ fontWeight: phase === p.key ? 700 : 500 }}
                    >
                      {p.key === 'uploading' ? 'Upload' : p.key === 'parsing' ? 'Parse' : 'Save'}
                    </ACMono>
                  ))}
                </div>
                <style>{`@keyframes ac-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* ── error ────────────────────────────────────── */}
            {error && (
              <div style={{
                marginTop: 12, padding: '12px 14px', borderRadius: ACRadii.card,
                background: 'rgba(198,91,75,0.12)', border: `1px solid rgba(198,91,75,0.35)`,
                fontSize: 13, color: '#c65b4b', lineHeight: 1.45,
                fontFamily: ACFonts.body,
              }}>
                {error}
              </div>
            )}

            {/* ── privacy note ─────────────────────────────── */}
            <div style={{
              marginTop: 16, padding: 14, background: c.card,
              borderRadius: ACRadii.card,
            }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                Private by default
              </ACLabel>
              <div style={{ marginTop: 6, fontSize: 12, color: c.dim, lineHeight: 1.5, fontFamily: ACFonts.body }}>
                Your lab PDF is stored encrypted on your account only. It is never used to train any model, and you can delete it at any time.
              </div>
            </div>

            {/* ── upload CTA ───────────────────────────────── */}
            <div style={{ marginTop: 22 }}>
              <ACBtn
                primary dark={dark} block size="lg"
                onClick={upload}
                style={{ opacity: (!file || isWorking) ? 0.45 : 1, pointerEvents: (!file || isWorking) ? 'none' : 'auto' }}
              >
                {isWorking ? (currentPhase?.label || 'Processing') : 'Upload report'}
              </ACBtn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────── */

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
