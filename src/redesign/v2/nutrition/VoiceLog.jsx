/**
 * VoiceLog — full-screen voice capture for nutrition.
 * Ref: Cal AI voice log + ChatGPT voice mode + WhatsApp audio recording.
 *
 * Flow:
 *  1. User taps mic → requests microphone permission (real, via getUserMedia)
 *  2. On grant → starts both audio-level visualizer AND SpeechRecognition
 *  3. Transcription appears live as user speaks
 *  4. User taps stop → transcript is frozen
 *  5. "Send to Atlas AI" → pipes transcript to AI parser (log-food-text)
 *  6. Parent routes to the confirm screen with the parsed items
 *
 * Handles:
 *  - prompt / granted / denied permission states
 *  - browsers without Web Speech API (fallback: manual typing)
 *  - cancel + retry
 */
import React, { useEffect, useRef, useState } from 'react';
import { LiquidButton } from '../lib/glass';

const HAS_SPEECH =
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function VoiceLog({
  mealLabel = 'Meal',
  onCancel,
  onSubmit,   // (transcript: string) => void
}) {
  const [permission, setPermission] = useState('prompt'); // 'prompt'|'granted'|'denied'|'unsupported'
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [level, setLevel] = useState(0);
  const [error, setError] = useState('');

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!HAS_SPEECH) setPermission('unsupported');
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    rafRef.current = null;
    recognitionRef.current = null;
  };

  const start = async () => {
    setError('');
    setTranscript('');
    setInterim('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setPermission('granted');

      // Audio level visualizer
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i] - 128) / 128;
          if (v > peak) peak = v;
        }
        setLevel(peak);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      // Web Speech API transcription
      if (HAS_SPEECH) {
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new Rec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = navigator.language || 'en-US';
        rec.onresult = (evt) => {
          let finalT = '';
          let interimT = '';
          for (let i = evt.resultIndex; i < evt.results.length; i++) {
            const r = evt.results[i];
            if (r.isFinal) finalT += r[0].transcript;
            else interimT += r[0].transcript;
          }
          if (finalT) setTranscript((prev) => (prev ? prev + ' ' : '') + finalT.trim());
          setInterim(interimT);
        };
        rec.onerror = (e) => {
          if (e.error === 'not-allowed') {
            setPermission('denied');
            setError('Microphone permission was denied.');
          } else if (e.error !== 'aborted' && e.error !== 'no-speech') {
            setError(e.error || 'Speech recognition error');
          }
        };
        rec.onend = () => {
          if (recording) {
            try { rec.start(); } catch {}
          }
        };
        rec.start();
        recognitionRef.current = rec;
      }

      setRecording(true);
    } catch (e) {
      if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
        setPermission('denied');
        setError('Microphone permission was denied. Enable it in your browser settings.');
      } else {
        setError(e?.message || 'Could not access microphone');
      }
    }
  };

  const stop = () => {
    setRecording(false);
    stopAll();
  };

  const submit = () => {
    const full = (transcript + (interim ? ` ${interim}` : '')).trim();
    if (!full) return;
    stop();
    onSubmit?.(full);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingInline: 'max(20px, env(safe-area-inset-left))',
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 50% 45%, rgba(139,92,246,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', position: 'relative', zIndex: 1 }}>
        <button
          type="button"
          onClick={() => { stop(); onCancel?.(); }}
          aria-label="Cancel"
          style={{ width: 40, height: 40, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-primary))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
        </button>
        <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: '#A78BFA' }}>
          Voice log · {mealLabel}
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Transcript */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '24px 0',
          textAlign: 'center',
        }}
      >
        {(permission === 'prompt' || permission === 'unsupported') && !recording && (
          <div>
            <div aria-hidden style={{ fontSize: 56, marginBottom: 12 }}>🎙️</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 8 }}>
              {permission === 'unsupported' ? 'Voice not supported here' : 'Talk to Atlas AI'}
            </div>
            <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, maxWidth: 320, margin: '0 auto' }}>
              {permission === 'unsupported'
                ? 'Your browser doesn\'t expose speech recognition. Try Chrome/Edge or type it manually.'
                : 'Say what you ate. Example: "Two eggs with toast and coffee." Atlas will estimate macros.'}
            </p>
          </div>
        )}

        {permission === 'denied' && (
          <div>
            <div aria-hidden style={{ fontSize: 56, marginBottom: 12 }}>🚫</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Microphone blocked
            </div>
            <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, maxWidth: 320, margin: '0 auto' }}>
              {error || 'Enable microphone access in your browser settings, then try again.'}
            </p>
          </div>
        )}

        {(recording || transcript || interim) && (
          <div style={{ width: '100%', maxWidth: 520 }}>
            <div
              style={{
                fontSize: transcript || interim ? 22 : 14,
                lineHeight: 1.35,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: 'hsl(var(--rd-fg-primary))',
                minHeight: 72,
              }}
            >
              {transcript}
              {interim && (
                <span style={{ color: 'hsl(var(--rd-fg-muted))' }}>
                  {transcript ? ' ' : ''}
                  {interim}
                </span>
              )}
              {!transcript && !interim && (
                <span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>
                  Listening…
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom control: mic button with audio-level halo */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {recording ? (
          <>
            <MicButton pulsing level={level} onClick={stop} stop />
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>Tap to stop</div>
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))' }}>
              Used to hit your protein target
            </div>
            {(transcript || interim) && (
              <div style={{ width: '100%', maxWidth: 400, marginTop: 4 }}>
                <LiquidButton intent="ai" size="lg" block onClick={submit}>
                  ✨ Send to Atlas AI
                </LiquidButton>
              </div>
            )}
          </>
        ) : permission === 'denied' ? (
          <LiquidButton intent="neutral" size="lg" onClick={() => { setPermission('prompt'); setError(''); }}>
            Try again
          </LiquidButton>
        ) : permission === 'unsupported' ? (
          <LiquidButton intent="primary" size="lg" onClick={onCancel}>
            Type it instead
          </LiquidButton>
        ) : (
          <>
            <MicButton level={0} onClick={start} />
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>Tap to speak</div>
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))' }}>
              Used to hit your protein target
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export { VoiceLog };

function MicButton({ onClick, level = 0, pulsing = false, stop = false }) {
  const scale = 1 + Math.min(0.3, level * 0.8);
  return (
    <div style={{ position: 'relative', width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* audio level halo */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
          transform: `scale(${scale})`,
          transition: 'transform 80ms linear',
          pointerEvents: 'none',
        }}
      />
      {pulsing && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: -4, borderRadius: 9999,
            border: '2px solid rgba(139,92,246,0.5)',
            animation: 'rd-mic-pulse 1600ms ease-out infinite',
          }}
        />
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={stop ? 'Stop recording' : 'Start recording'}
        style={{
          width: 84, height: 84, borderRadius: 9999,
          background: stop
            ? 'linear-gradient(180deg, rgba(239,68,68,0.98), rgba(220,38,38,0.92))'
            : 'linear-gradient(180deg, rgba(139,92,246,0.98), rgba(124,58,237,0.92))',
          border: stop ? '1px solid rgba(239,68,68,0.55)' : '1px solid rgba(139,92,246,0.55)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          boxShadow: stop
            ? '0 10px 28px -8px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
            : '0 10px 28px -8px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          transition: 'transform 160ms cubic-bezier(.34,1.56,.64,1)',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {stop ? (
          <span aria-hidden style={{ width: 28, height: 28, borderRadius: 6, background: '#fff' }} />
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <style>{`
        @keyframes rd-mic-pulse {
          0%   { transform: scale(1);   opacity: .7; }
          100% { transform: scale(1.8); opacity: 0;  }
        }
      `}</style>
    </div>
  );
}
