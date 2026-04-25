import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { notificationService } from '@/services/notificationService';
import * as healthKitService from '@/services/healthKitService';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';

const IS_NATIVE = Capacitor.isNativePlatform();

function OBHeader({ step, total, dark, onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <button type="button" onClick={typeof onBack === 'function' ? onBack : undefined} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{step}/{total}</ACLabel>
    </div>
  );
}

// Real brand-ish icons for permission cards.
function PermIcon({ k }) {
  if (k === 'health') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#fff',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 18.5s-7-4.3-7-9.4a4.3 4.3 0 0 1 7-3.3 4.3 4.3 0 0 1 7 3.3c0 5.1-7 9.4-7 9.4Z"
          fill="#FF2D55" />
      </svg>
    </div>
  );
  if (k === 'camera') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M3 7a2 2 0 0 1 2-2h2l1.5-2h5L15 5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="11" cy="11.5" r="3.2" stroke="#fff" strokeWidth="1.8" />
        <circle cx="16.2" cy="8" r="0.9" fill="#e8b500" />
      </svg>
    </div>
  );
  if (k === 'notif') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#FF3B30',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3c-3 0-5 2.2-5 5v2.5L3.5 13h13L15 10.5V8c0-2.8-2-5-5-5Z"
          stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M8 15a2 2 0 0 0 4 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
  if (k === 'whoop') return (
    <div style={{
      width: 38, height: 38, borderRadius: 999,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Archivo Black", sans-serif',
      color: '#fff', fontSize: 17, letterSpacing: -0.5,
      lineHeight: 1,
    }}>W</div>
  );
  return null;
}

// ---------------------------------------------------------------------------
// Connector state: 'idle' | 'connecting' | 'granted' | 'denied' | 'unavailable' | 'coming_soon'
// ---------------------------------------------------------------------------

const STATUS_LABELS = {
  idle: 'Connect',
  connecting: 'Connecting\u2026',
  granted: 'Connected',
  denied: 'Denied',
  unavailable: 'Not available',
  coming_soon: 'Coming soon',
};

function chipProps(state) {
  if (state === 'granted') return { accent: true };
  if (state === 'denied' || state === 'unavailable') return { accent: false };
  return { accent: false };
}

function S11_Onboard_Permissions({
  dark = false,
  onBack,
  onContinue,
  onSkip,
  value,
  onChange,
}) {
  const c = useACT(dark);
  const [perms, setPerms] = React.useState({
    health: value?.health || 'idle',
    camera: value?.camera || 'idle',
    notif: value?.notif || 'idle',
    whoop: 'coming_soon',
  });

  function update(k, state) {
    const next = { ...perms, [k]: state };
    setPerms(next);
    onChange?.(next);
  }

  // --- Real permission request handlers ---

  async function connectHealth() {
    if (perms.health === 'granted' || perms.health === 'connecting') return;
    if (!IS_NATIVE) {
      update('health', 'unavailable');
      return;
    }
    update('health', 'connecting');
    try {
      const available = await healthKitService.isAvailable();
      if (!available) {
        update('health', 'unavailable');
        return;
      }
      const granted = await healthKitService.requestAuthorization();
      update('health', granted ? 'granted' : 'denied');
    } catch {
      update('health', 'denied');
    }
  }

  async function connectCamera() {
    if (perms.camera === 'granted' || perms.camera === 'connecting') return;
    if (!IS_NATIVE) {
      update('camera', 'unavailable');
      return;
    }
    update('camera', 'connecting');
    try {
      const result = await Camera.requestPermissions({ permissions: ['camera'] });
      update('camera', result.camera === 'granted' ? 'granted' : 'denied');
    } catch {
      update('camera', 'denied');
    }
  }

  async function connectNotif() {
    if (perms.notif === 'granted' || perms.notif === 'connecting') return;
    if (!IS_NATIVE) {
      update('notif', 'unavailable');
      return;
    }
    update('notif', 'connecting');
    try {
      const result = await notificationService.requestPermissions();
      update('notif', result === 'granted' ? 'granted' : 'denied');
    } catch {
      update('notif', 'denied');
    }
  }

  const handlers = {
    health: connectHealth,
    camera: connectCamera,
    notif: connectNotif,
    whoop: () => {},
  };

  const items = [
    {
      k: 'health',
      t: 'Apple Health',
      d: 'Recovery, sleep, steps, and heart rate let coach adjust the day instead of guessing.',
    },
    {
      k: 'camera',
      t: 'Camera',
      d: 'Progress photos, barcode scans, and meal capture work faster when camera access is ready.',
    },
    {
      k: 'notif',
      t: 'Notifications',
      d: 'Trial reminders, coach nudges, and workout check-ins land at the right moment.',
    },
    {
      k: 'whoop',
      t: 'Whoop / Oura',
      d: 'Import readiness signals from your recovery tracker.',
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg, minHeight: 0 }}>
      <OBHeader step={5} total={10} dark={dark} onBack={onBack} />

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Connect</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Connect your sources.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          We explain each permission before the OS prompt so the ask feels earned. atlas.core reads signal and never writes without asking.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((p) => {
            const state = perms[p.k];
            const isFinal = state === 'granted' || state === 'denied' || state === 'unavailable' || state === 'coming_soon';
            const isLoading = state === 'connecting';
            return (
              <button
                key={p.k}
                type="button"
                onClick={() => handlers[p.k]()}
                disabled={isFinal || isLoading}
                style={{
                  padding: 18, borderRadius: ACRadii.card,
                  background: c.card,
                  display: 'flex', alignItems: 'center', gap: 14,
                  border: 'none', cursor: isFinal || isLoading ? 'default' : 'pointer',
                  textAlign: 'left', width: '100%',
                  opacity: state === 'coming_soon' ? 0.55 : 1,
                }}
              >
                <PermIcon k={p.k} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{p.t}</div>
                  <ACLabel size={12} color={c.dim}>{p.d}</ACLabel>
                </div>
                <ACChip accent={state === 'granted'} dark={dark}>
                  {STATUS_LABELS[state] || state}
                </ACChip>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 22, padding: '14px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Privacy</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            All data stays on-device by default. Cloud sync is opt-in, encrypted, and exportable.
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div style={{ height: 24 }} />
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={onContinue}>Continue →</ACBtn>
        <div style={{ textAlign: 'center', padding: 4 }}>
          <button type="button" onClick={onSkip} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
            <ACLabel size={12} color={c.dim}>Skip for now</ACLabel>
          </button>
        </div>
      </div>
    </div>
  );
}

export default S11_Onboard_Permissions;
