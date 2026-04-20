import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel,
} from '../lib/paper.jsx';

function CaptureScan({ c, dark, onScanResult, onAddItem }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Viewfinder area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26 }}>
        <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
          {/* corner brackets */}
          {[
            { t: 0, l: 0, r: 'tl' },
            { t: 0, r: 0 },
            { b: 0, l: 0 },
            { b: 0, r: 0 },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', width: 36, height: 36,
              top: p.t, bottom: p.b, left: p.l, right: p.r,
              borderTop: p.t !== undefined ? `3px solid ${c.accent}` : 'none',
              borderBottom: p.b !== undefined ? `3px solid ${c.accent}` : 'none',
              borderLeft: p.l !== undefined ? `3px solid ${c.accent}` : 'none',
              borderRight: p.r !== undefined ? `3px solid ${c.accent}` : 'none',
            }} />
          ))}
          {/* Barcode illustration — found */}
          <div style={{
            position: 'absolute', top: '38%', left: '12%', right: '12%',
            display: 'flex', gap: 1.5, height: 48, alignItems: 'stretch',
          }}>
            {Array.from({length: 32}).map((_, i) => (
              <div key={i} style={{
                flex: (i % 4 === 0) ? 2.5 : ((i % 3 === 0) ? 0.8 : 1.4),
                background: '#efe9da', opacity: 0.9,
              }} />
            ))}
          </div>
          {/* scan line */}
          <div style={{
            position: 'absolute', top: '62%', left: '8%', right: '8%',
            height: 2, background: c.accent,
            boxShadow: `0 0 18px ${c.accent}`,
          }} />
        </div>
      </div>

      {/* Result card — found product */}
      <div style={{ padding: '0 22px' }}>
        <div style={{
          padding: 16, background: 'rgba(239,233,218,0.96)',
          borderRadius: ACRadii.card, color: c.ink,
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <div style={{
            width: 52, height: 52, background: c.ink, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, color: '#efe9da' }}>FG</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>Found · FairLife 26g</ACLabel>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.ink, marginTop: 3, letterSpacing: -0.2 }}>
              Core Power chocolate
            </div>
            <div style={{ marginTop: 3, fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(10,10,10,0.55)', letterSpacing: 0.3 }}>
              170 kcal · 26P · 8C · 4.5F · 14 fl oz
            </div>
          </div>
          <button 
            type="button"
            onClick={() => onAddItem?.({
              name: 'Core Power chocolate',
              brand: 'FairLife 26g',
              barcode: '0123456789012',
              nutrition: {
                kcal: 170,
                protein: 26,
                carbs: 8,
                fat: 4.5,
                serving: '14 fl oz'
              }
            })}
            style={{
              padding: '8px 14px', background: c.accent, color: c.ink,
              fontSize: 12, fontWeight: 700, borderRadius: 999,
              border: 'none', cursor: 'pointer',
            }}>Add</button>
        </div>
      </div>
    </div>
  );
}

function CaptureCamera({ c, dark, onCameraCapture, onAddItem }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* fake photo frame w/ detected zones */}
      <div style={{ flex: 1, position: 'relative', margin: '8px 22px 0' }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #4a3c28 0%, #7a6548 60%, #a88960 100%)',
          borderRadius: 14, position: 'relative', overflow: 'hidden',
        }}>
          {/* grid overlay */}
          <div style={{
            position: 'absolute', inset: 16,
            border: '1px dashed rgba(239,233,218,0.25)',
          }} />
          {/* detection pins */}
          {[
            { x: '25%', y: '30%', l: 'chicken', v: '6 oz', nutrition: { kcal: 180, protein: 36, carbs: 0, fat: 4 } },
            { x: '62%', y: '42%', l: 'rice',    v: '1 cup', nutrition: { kcal: 205, protein: 4, carbs: 44, fat: 0 } },
            { x: '72%', y: '72%', l: 'broccoli', v: '~2 cups', nutrition: { kcal: 60, protein: 5, carbs: 12, fat: 0 } },
          ].map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAddItem?.({
                name: p.l.charAt(0).toUpperCase() + p.l.slice(1),
                serving: p.v,
                nutrition: p.nutrition,
                source: 'camera_ai',
                confidence: 0.92
              })}
              style={{
                position: 'absolute', left: p.x, top: p.y,
                transform: 'translate(-50%, -50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 0,
              }}
            >
              <div style={{
                width: 12, height: 12, borderRadius: 999,
                background: c.accent, border: '2px solid #efe9da',
                boxShadow: `0 0 12px ${c.accent}`,
              }} />
              <div style={{
                position: 'absolute', top: 18, left: 0,
                padding: '4px 8px', background: 'rgba(10,10,10,0.85)',
                color: '#efe9da', borderRadius: 4,
                fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.3,
                whiteSpace: 'nowrap', fontWeight: 600,
              }}>{p.l.toUpperCase()} · {p.v}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Capture button overlay */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <button
          type="button"
          onClick={() => onCameraCapture?.({
            timestamp: Date.now(),
            mode: 'food_analysis',
            mockData: true
          })}
          style={{
            width: 64, height: 64, borderRadius: 999,
            background: 'rgba(239,233,218,0.9)', border: '3px solid #efe9da',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{
            width: 54, height: 54, borderRadius: 999,
            background: c.accent, border: '2px solid #efe9da',
          }} />
        </button>
      </div>

      {/* Analysis card */}
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{
          padding: 16, background: 'rgba(239,233,218,0.96)', color: c.ink,
          borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>3 items detected</ACLabel>
            <ACLabel size={10} color="rgba(10,10,10,0.5)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>Confidence 92%</ACLabel>
          </div>
          <div style={{
            marginTop: 10, display: 'flex', gap: 16,
            fontFamily: ACFonts.display,
          }}>
            {[
              { k: 'kcal', v: '540', hi: true },
              { k: 'P',    v: '48g' },
              { k: 'C',    v: '52g' },
              { k: 'F',    v: '14g' },
            ].map((m, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 12,
                borderLeft: i === 0 ? 'none' : '1px solid rgba(10,10,10,0.1)',
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(10,10,10,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.hi ? c.accent : c.ink, letterSpacing: -0.5, marginTop: 2 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureVoice({ c, dark, onVoiceTranscribe, onAddItem }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 22px', position: 'relative' }}>
      {/* Ring meter */}
      <div style={{
        position: 'relative',
        width: 200, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* outer pulse */}
        <div style={{
          position: 'absolute', inset: -8,
          borderRadius: 999, border: `2px solid ${c.accent}`, opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: 999, border: `1px solid rgba(239,233,218,0.2)`,
        }} />
        {/* waveform */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[18, 36, 58, 80, 50, 28, 68, 92, 62, 40, 72, 34, 22, 50, 30].map((h, i) => (
            <div key={i} style={{
              width: 3, height: h, background: c.accent, borderRadius: 2,
              opacity: 0.55 + (h / 200),
            }} />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 28, fontFamily: ACFonts.mono, fontSize: 10,
        color: 'rgba(239,233,218,0.55)', letterSpacing: 0.8, fontWeight: 700,
        textAlign: 'center', textTransform: 'uppercase',
      }}>
        Listening · 0:04
      </div>

      {/* Transcribed line */}
      <button
        type="button"
        onClick={() => onVoiceTranscribe?.({
          transcript: "Had a six ounce ribeye, sweet potato, and a handful of almonds",
          confidence: 0.94,
          timestamp: Date.now()
        })}
        style={{
          marginTop: 22, width: '100%', padding: 18,
          background: 'rgba(239,233,218,0.06)', borderRadius: ACRadii.card,
          border: 'none', cursor: 'pointer',
        }}>
        <div style={{
          fontSize: 17, color: '#efe9da', lineHeight: 1.45,
          letterSpacing: -0.3,
        }}>
          "Had a <span style={{ color: c.accent, fontWeight: 600 }}>six ounce ribeye</span>, <span style={{ color: c.accent, fontWeight: 600 }}>sweet potato</span>, and a <span style={{ color: c.accent, fontWeight: 600 }}>handful of almonds</span>..."
        </div>
      </button>

      {/* parsed items */}
      <div style={{
        marginTop: 12, width: '100%',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {[
          { t: 'Ribeye · 6 oz',           k: '420 · 48P', nutrition: { kcal: 420, protein: 48, carbs: 0, fat: 28 } },
          { t: 'Sweet potato · medium',    k: '105 · 2P', nutrition: { kcal: 105, protein: 2, carbs: 24, fat: 0 } },
          { t: 'Almonds · ~1 oz',          k: '164 · 6P', nutrition: { kcal: 164, protein: 6, carbs: 6, fat: 14 } },
        ].map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAddItem?.({
              name: r.t.split(' · ')[0],
              serving: r.t.split(' · ')[1],
              nutrition: r.nutrition,
              source: 'voice_ai',
              confidence: 0.94
            })}
            style={{
              padding: '10px 14px', background: 'rgba(239,233,218,0.94)',
              color: c.ink, borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.t}</span>
            <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(10,10,10,0.6)', letterSpacing: 0.3 }}>{r.k}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * S32_Capture -- fuel logging capture interface (barcode, camera, voice).
 *
 * Gallery:    <S32_Capture dark />
 * Production: <S32_Capture dark onClose={fn} onScanResult={fn} onCameraCapture={fn} onVoiceTranscribe={fn} onAddItem={fn} />
 *
 * Props:
 *   dark               -- light/dark variant
 *   onClose            -- close/cancel handler
 *   onScanResult       -- (barcodeData) => void -- barcode scan completed
 *   onCameraCapture    -- (imageData) => void -- photo captured for AI analysis
 *   onVoiceTranscribe  -- (transcript) => void -- voice transcription completed
 *   onAddItem          -- (foodItem) => void -- add detected food item to log
 */
export default function S32_Capture({ 
  dark = false, 
  onClose,
  onScanResult,
  onCameraCapture, 
  onVoiceTranscribe,
  onAddItem,
}) {
  const [active, setActive] = React.useState('scan');
  const c = useACT(dark);
  const views = {
    scan: <CaptureScan c={c} dark={dark} onScanResult={onScanResult} onAddItem={onAddItem} />,
    camera: <CaptureCamera c={c} dark={dark} onCameraCapture={onCameraCapture} onAddItem={onAddItem} />,
    voice: <CaptureVoice c={c} dark={dark} onVoiceTranscribe={onVoiceTranscribe} onAddItem={onAddItem} />,
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.ink, color: '#efe9da' }}>
      {/* top bar */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: 'rgba(239,233,218,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="#efe9da" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <ACLabel size={11} color="rgba(239,233,218,0.75)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, fontWeight: 600 }}>
          LOG FUEL · 12:41 PM
        </ACLabel>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M3 11l8-8" stroke="#efe9da" strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/></svg>
        </div>
      </div>

      {/* viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {views[active]}
      </div>

      {/* mode switcher */}
      <div style={{ padding: '10px 22px 28px' }}>
        <div style={{
          padding: 5, display: 'flex', gap: 3,
          background: 'rgba(239,233,218,0.08)',
          borderRadius: 999, backdropFilter: 'blur(10px)',
        }}>
          {[
            { k: 'scan', l: 'Barcode' },
            { k: 'camera', l: 'Photo' },
            { k: 'voice', l: 'Voice' },
          ].map(t => {
            const on = t.k === active;
            return (
              <button key={t.k} type="button" onClick={() => setActive(t.k)} style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: on ? c.accent : 'transparent',
                color: on ? c.ink : 'rgba(239,233,218,0.75)',
                fontSize: 12, fontWeight: 700, borderRadius: 999,
                letterSpacing: -0.2, cursor: 'pointer', border: 'none',
              }}>{t.l}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
