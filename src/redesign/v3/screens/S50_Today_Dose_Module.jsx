import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACMono, ACBtn, ACSpark, ACHeader,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { ACBrandMark, ACTabBar } from '../lib/paper.jsx';

export default function S50_Today_Dose_Module({
  dark = false,
  todayDoses,
  tomorrowDoses,
  onRemindTomorrow,
  showTabBar = true,
}) {
  const c = useACT(dark);

  const resolvedToday = todayDoses || [
    { time: '08:02', name: 'BPC-157',        dose: '250 \u00B5g \u00B7 subq abdomen' },
    { time: '09:14', name: 'Creatine mono',   dose: '5 g \u00B7 in water' },
    { time: '12:30', name: 'Vit D3 + K2',     dose: '5 000 IU \u00B7 with lunch' },
    { time: '18:04', name: 'TRT cypionate',   dose: '100 mg \u00B7 right quad' },
  ];

  const resolvedTomorrow = tomorrowDoses || {
    count: 2,
    names: 'BPC-157, Creatine',
    times: '08:00 + 09:00 \u00B7 SAME AS TODAY',
  };

  const totalDoses = resolvedToday.length;
  const loggedDoses = resolvedToday.length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden',
      background: c.bg,
    }}>
      {/* Brand header */}
      <div style={{
        padding: '0 20px 4px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <ACBrandMark size={15} dark={dark} HeartMarkComp={HeartMark} />
        <ACMono size={9} color={c.dim}>FRI 19 APR</ACMono>
      </div>

      <ACHeader dark={dark} sub="TODAY" title="Stack complete." />

      {/* Scrollable body */}
      <div style={{
        flex: 1, overflow: 'hidden auto',
        minHeight: 0, WebkitOverflowScrolling: 'touch',
        padding: '0 20px 14px',
      }}>
        {/* Success hero -- full accent block */}
        <div style={{
          background: c.accent, color: c.ink,
          padding: '22px 20px 20px',
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <ACMono size={10} track={3} style={{ opacity: 0.65 }}>
            ALL DOSES {'\u00B7'} LOGGED
          </ACMono>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 56, fontWeight: 800,
            letterSpacing: -2, lineHeight: 0.92, marginTop: 8,
          }}>
            {loggedDoses} / {totalDoses}
          </div>
          <div style={{
            fontFamily: ACFonts.body, fontSize: 13, fontWeight: 500,
            marginTop: 10, opacity: 0.85,
          }}>
            Your full stack -- on schedule, on time. First all-clear in 14 days.
          </div>
          {/* Watermark HeartMark */}
          <div style={{ position: 'absolute', right: -20, top: -10, opacity: 0.18 }}>
            <HeartMark size={170} color={c.ink} accent={c.ink} />
          </div>
          {/* ECG sparkline */}
          <div style={{ marginTop: 18 }}>
            <ACSpark w={280} h={22} color={c.ink} dark={false} stroke={2} />
          </div>
        </div>

        {/* Logged today list */}
        <div style={{ marginBottom: 14 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            LOGGED TODAY
          </ACMono>
          {resolvedToday.map((h, i) => (
            <div key={i} style={{
              display: 'flex', padding: '12px 14px',
              marginBottom: 6, background: c.card, borderRadius: ACRadii.card,
              alignItems: 'center', gap: 12,
            }}>
              {/* Checkmark icon */}
              <div style={{
                width: 22, height: 22, background: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    d="M2 6.5 L5 9 L10 3"
                    stroke={c.ink} strokeWidth="2" fill="none"
                    strokeLinejoin="miter" strokeLinecap="square"
                  />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
                  letterSpacing: -0.2, color: c.fg,
                }}>
                  {h.name}
                </div>
                <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>
                  {h.dose.toUpperCase()}
                </ACMono>
              </div>
              <ACMono size={11} color={c.dim}>{h.time}</ACMono>
            </div>
          ))}
        </div>

        {/* Tomorrow section */}
        <div style={{ marginBottom: 10 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            TOMORROW {'\u00B7'} SAT
          </ACMono>
          <div style={{
            padding: '14px 16px', background: c.card, borderRadius: ACRadii.card,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
                color: c.fg, letterSpacing: -0.2,
              }}>
                {resolvedTomorrow.count} doses {'\u00B7'} {resolvedTomorrow.names}
              </div>
              <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>
                {resolvedTomorrow.times}
              </ACMono>
            </div>
            <button
              type="button"
              onClick={onRemindTomorrow}
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <ACMono size={10} color={c.accent} track={2}>REMIND {'\u203A'}</ACMono>
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      {showTabBar && (
        <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} />
      )}
    </div>
  );
}
