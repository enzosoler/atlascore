/**
 * PhotoScan — Cal AI camera screen.
 * Ref: Cal AI snap-meal + Yuka barcode camera + iOS Camera.
 *
 * - Full-screen black with camera preview (placeholder when no stream)
 * - Scan frame animated scanline
 * - Tips chip with contextual copy
 * - Shutter button 80pt, big hit area
 * - Gallery picker + flash + flip camera affordances
 * - Permission-denied state
 */
import React, { useEffect, useRef, useState } from 'react';

export default function PhotoScan({
  permission = 'prompt',    // 'prompt' | 'granted' | 'denied'
  onRequestPermission,
  onCapture,
  onPickFromGallery,
  onCancel,
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let active = true;
    async function start() {
      if (permission !== 'granted') return;
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) { /* fall through to placeholder */ }
    }
    start();
    return () => {
      active = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  const snap = () => {
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      onCapture?.({ timestamp: Date.now() });
    }, 420);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Camera preview or placeholder */}
      {permission === 'granted' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(139,92,246,0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(0,255,255,0.1) 0%, transparent 50%),
              linear-gradient(180deg, #0a0e14 0%, #000 100%)
            `,
          }}
        />
      )}

      {/* Vignette + scan frame */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

      <ScanFrame capturing={capturing} />

      {/* Flash capture overlay */}
      {capturing && (
        <div style={{ position: 'absolute', inset: 0, background: '#fff', animation: 'rd-flash 420ms ease-out both' }} />
      )}

      {/* Top chrome — close + flash + flip */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 14px)',
          left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingInline: 'max(16px, env(safe-area-inset-left))',
        }}
      >
        <TopCircle onClick={onCancel} aria="Cancel"><XIcon /></TopCircle>
        <div style={{ display: 'flex', gap: 10 }}>
          <TopCircle aria="Flash"><FlashIcon /></TopCircle>
          <TopCircle aria="Flip camera"><FlipIcon /></TopCircle>
        </div>
      </div>

      {/* Tips chip */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 72px)',
          left: '50%', transform: 'translateX(-50%)',
          padding: '8px 14px',
          borderRadius: 9999,
          background: 'rgba(10,14,20,0.7)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 12, fontWeight: 600, letterSpacing: '-0.005em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden>✨</span>
        Fill the frame with your plate
      </div>
      {/* System tag — protein impact */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 110px)',
          left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 10,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color: 'rgba(0,255,255,0.85)',
          whiteSpace: 'nowrap',
        }}
      >
        Feeds your protein target
      </div>

      {/* Permission prompt */}
      {permission !== 'granted' && (
        <div
          style={{
            position: 'absolute',
            left: 'max(20px, env(safe-area-inset-left))', right: 'max(20px, env(safe-area-inset-right))',
            top: '50%', transform: 'translate(0, -50%)',
            padding: 24,
            borderRadius: 20,
            background: 'rgba(10,14,20,0.86)',
            backdropFilter: 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.10)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }} aria-hidden>📷</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            {permission === 'denied' ? 'Camera blocked' : 'Snap your meals'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.4 }}>
            {permission === 'denied'
              ? 'Enable camera access in Settings to log meals and track protein.'
              : 'Enable camera to log meals and track protein in seconds.'}
          </div>
          {permission !== 'denied' && (
            <button
              type="button"
              onClick={onRequestPermission}
              style={{
                height: 44, paddingInline: 22, borderRadius: 9999,
                background: 'linear-gradient(180deg, rgba(0,255,255,0.98), rgba(0,210,210,0.92))',
                border: '1px solid rgba(0,255,255,0.55)',
                color: 'hsl(var(--rd-fg-on-accent))',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Enable camera
            </button>
          )}
        </div>
      )}

      {/* Bottom dock — gallery + shutter + barcode */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
          left: 0, right: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          alignItems: 'center',
          justifyItems: 'center',
          paddingInline: 'max(20px, env(safe-area-inset-left))',
          gap: 16,
        }}
      >
        <button
          type="button"
          onClick={onPickFromGallery}
          aria-label="Pick from gallery"
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <GalleryIcon />
        </button>

        <button
          type="button"
          onClick={permission === 'granted' ? snap : onRequestPermission}
          aria-label="Capture"
          disabled={capturing}
          style={{
            width: 80, height: 80, borderRadius: 9999,
            background: 'rgba(255,255,255,0.10)',
            border: '3px solid rgba(255,255,255,0.9)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1)',
            transform: capturing ? 'scale(.88)' : 'scale(1)',
          }}
        >
          <span style={{ width: 66, height: 66, borderRadius: 9999, background: '#fff', boxShadow: 'inset 0 2px 0 rgba(0,0,0,0.1)' }} />
        </button>

        <button
          type="button"
          aria-label="Barcode scan"
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <BarcodeIcon />
        </button>
      </div>

      <style>{`
        @keyframes rd-flash { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes rd-scan-line {
          0%   { transform: translateY(-50%); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(50%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
export { PhotoScan };

function ScanFrame({ capturing }) {
  // 70% viewport corner brackets + animated scanline
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(78vw, 320px)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
      }}
    >
      {/* Corners */}
      {[
        { top: 0, left: 0, borderTop: 3, borderLeft: 3 },
        { top: 0, right: 0, borderTop: 3, borderRight: 3 },
        { bottom: 0, left: 0, borderBottom: 3, borderLeft: 3 },
        { bottom: 0, right: 0, borderBottom: 3, borderRight: 3 },
      ].map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: 28, height: 28,
            borderColor: 'rgba(0,255,255,0.85)',
            borderStyle: 'solid',
            borderWidth: 0,
            borderTopWidth: s.borderTop || 0,
            borderLeftWidth: s.borderLeft || 0,
            borderRightWidth: s.borderRight || 0,
            borderBottomWidth: s.borderBottom || 0,
            borderTopLeftRadius: s.borderTop && s.borderLeft ? 16 : 0,
            borderTopRightRadius: s.borderTop && s.borderRight ? 16 : 0,
            borderBottomLeftRadius: s.borderBottom && s.borderLeft ? 16 : 0,
            borderBottomRightRadius: s.borderBottom && s.borderRight ? 16 : 0,
            ...s,
          }}
        />
      ))}
      {/* Scanline */}
      {!capturing && (
        <div
          style={{
            position: 'absolute', top: '50%', left: 20, right: 20,
            height: 2, borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.9), transparent)',
            animation: 'rd-scan-line 2200ms cubic-bezier(.4,0,.2,1) infinite',
            willChange: 'transform, opacity',
          }}
        />
      )}
    </div>
  );
}

function TopCircle({ onClick, children, aria }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      style={{
        width: 40, height: 40, borderRadius: 9999,
        background: 'rgba(10,14,20,0.6)',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

const st = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function XIcon()        { return <svg width="18" height="18" viewBox="0 0 24 24"><path {...st} d="M6 6l12 12M18 6L6 18" /></svg>; }
function FlashIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24"><path {...st} d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" /></svg>; }
function FlipIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24"><path {...st} d="M4 7h13a4 4 0 0 1 4 4v1M20 17H7a4 4 0 0 1-4-4v-1M8 4L4 7l4 3M16 20l4-3-4-3" /></svg>; }
function GalleryIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24"><rect {...st} x="3" y="5" width="18" height="14" rx="2" /><circle {...st} cx="9" cy="10" r="1.5" /><path {...st} d="M21 16l-5-5-7 7" /></svg>; }
function BarcodeIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24"><path {...st} d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M19 6v12" /></svg>; }
