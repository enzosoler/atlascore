import React from 'react';
import V3MarketingLayout from './V3MarketingLayout.jsx';
import IOSFrame from '@/redesign/v3/gallery/IOSFrame.jsx';
import { PaperThemeProvider, ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { S2_Today_A, S3_Workout_A, S4_Nutrition_A, S13_Coach_Brief, S14_Body_Dashboard } from '@/redesign/v3/screens/index.js';

const SHOTS = [
  {
    title: 'Today',
    subtitle: 'Recovery, fuel, weight, and your next session — one glance, no digging.',
    Comp: S2_Today_A,
  },
  {
    title: 'Workout',
    subtitle: 'Log sets in seconds. Real exercise structure, not a blank spreadsheet.',
    Comp: S3_Workout_A,
  },
  {
    title: 'Nutrition',
    subtitle: 'Snap, speak, or type. Hit your macros without the logging tax.',
    Comp: S4_Nutrition_A,
  },
  {
    title: 'Coach',
    subtitle: 'AI that reads your week and tells you what actually matters today.',
    Comp: S13_Coach_Brief,
  },
  {
    title: 'Body',
    subtitle: 'Weight trend, body comp, and labs — all connected, all in one place.',
    Comp: S14_Body_Dashboard,
  },
];

const shotAnimStyles = `
@keyframes shotEnter {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shotFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes shotTextEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function ShotCard({ shot, dark = false, index = 0 }) {
  const Comp = shot.Comp;
  const enterDelay = index * 0.15;
  const floatDelay = index * 0.5;
  const textDelay = enterDelay + 0.1;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: 0,
        animation: `shotEnter 0.6s ease-out ${enterDelay}s forwards, shotFloat 4s ease-in-out ${enterDelay + 0.6 + floatDelay}s infinite`,
      }}
    >
      <div
        style={{
          opacity: 0,
          animation: `shotTextEnter 0.5s ease-out ${textDelay}s forwards`,
        }}
      >
        <div style={{ fontFamily: ACFonts.brand, fontSize: 28, letterSpacing: -1.1, lineHeight: 0.95, textTransform: 'lowercase' }}>
          {shot.title}
        </div>
        <p style={{ margin: '8px 0 0', maxWidth: 360, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(10,10,10,0.72)' }}>
          {shot.subtitle}
        </p>
      </div>
      <PaperThemeProvider>
        <IOSFrame dark={dark}>
          <Comp dark={dark} />
        </IOSFrame>
      </PaperThemeProvider>
    </div>
  );
}

export default function V3AppPage() {
  return (
    <V3MarketingLayout
      eyebrow="/// the app"
      title={<>everything in <span style={{ color: ACBrand.accent }}>one place.</span></>}
      intro="Training, food, body comp, labs, and coaching — track it in seconds and move on with your day. No switching between five apps. No extra friction."
    >
      <style>{shotAnimStyles}{`
        @keyframes appEcgTrace {
          0% { stroke-dashoffset: 120; }
          30% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: -120; }
          100% { stroke-dashoffset: -120; }
        }
        .app-ecg { stroke-dasharray: 120; stroke-dashoffset: 120; animation: appEcgTrace 3s ease-in-out infinite; }
        .app-ecg-0 { animation-delay: 0s; }
        .app-ecg-1 { animation-delay: 0.8s; }
        .app-ecg-2 { animation-delay: 1.6s; }
      `}</style>
      <svg width="100%" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" style={{ margin: '40px 0' }}>
        <line x1="0" x2="1000" y1="20" y2="20" stroke="rgba(10,10,10,0.12)" strokeWidth="1" />
        {[180, 520, 860].map((x, i) => (
          <path key={x} className={`app-ecg app-ecg-${i}`}
            d={`M${x} 20 L${x+8} 20 L${x+14} 3 L${x+22} 37 L${x+28} 12 L${x+34} 20 L${x+60} 20`}
            stroke="#e8b500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {SHOTS.map((shot, index) => (
          <ShotCard key={shot.title} shot={shot} dark={index % 2 === 1} index={index} />
        ))}
      </div>
    </V3MarketingLayout>
  );
}
