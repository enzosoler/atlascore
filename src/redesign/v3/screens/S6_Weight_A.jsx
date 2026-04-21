import React from 'react';
import {
  ACFonts, ACRadii, useACT, useACTheme,
  ACDot, ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACBars, ACLine, ACChip,
  ACHeader, ACBrandMark, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag } from '../lib/brandMarks.jsx';
import { useT } from '@/lib/i18nContext';

function S6_Weight_A({ dark = false }) {
  const c = useACT(dark);
  const t = useT();
  const days = [188.2,187.9,187.6,186.9,186.5,186.1,185.8,185.9,185.4,185.2,184.7,184.3,184.4,184,183.7,183.4,183.2,182.8,182.6,182.4];
  const data = days.map((v, i) => ({ k: i, v }));
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>{t('bodyweight.runtime.eyebrow')}</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            {t('bodyweight.runtime.title')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: c.card, borderRadius: 10 }}>
          {['14d', '30d', '1y'].map((r, i) => (
            <div key={r} style={{
              padding: '6px 12px', borderRadius: 7,
              background: i === 0 ? c.fg : 'transparent',
              color: i === 0 ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600,
            }}>{r}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        <div style={{ padding: '10px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <ACNum size={92} color={c.fg} weight={700}>182.4</ACNum>
            <div style={{ paddingBottom: 10 }}>
              <ACLabel size={12} color={c.dim}>{t('bodyweight.runtime.todayWeightUnit')}</ACLabel>
              <div style={{ marginTop: 6 }}>
                <ACChip accent dark={dark}>↓ 1.8 · 14d</ACChip>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 20, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <ACLabel size={12} color={c.dim}>{t('bodyweight.runtime.avgTrend')}</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{t('bodyweight.runtime.avgTrendDelta')}</ACLabel>
          </div>
          <ACLine w={296} h={140} data={data} dark={dark} />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <ACLabel size={11} color={c.mute}>Apr 01</ACLabel>
            <ACLabel size={11} color={c.mute}>Apr 18</ACLabel>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 12, borderRadius: ACRadii.card, overflow: 'hidden', background: c.card }}>
          {[
            { l: t('bodyweight.runtime.stats.start'), v: '188.2', u: t('bodyweight.runtime.poundsShort'), d: 'Apr 01' },
            { l: t('bodyweight.runtime.stats.goal'),  v: '175.0', u: t('bodyweight.runtime.poundsShort'), d: 'Jul 01' },
            { l: t('bodyweight.runtime.stats.toGo'), v: '7.4',   u: t('bodyweight.runtime.poundsShort'), d: t('bodyweight.runtime.weeksRemaining') },
          ].map((s, i) => (
            <div key={i} style={{
              padding: 16, borderRight: i < 2 ? `1px solid ${c.hair}` : 'none',
            }}>
              <ACLabel size={11} color={c.dim}>{s.l}</ACLabel>
              <div style={{ marginTop: 6 }}>
                <ACNum size={22} color={c.fg} weight={700}>{s.v}</ACNum>
                <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{s.u}</span>
              </div>
              <ACLabel size={11} color={c.mute}>{s.d}</ACLabel>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={12} color={c.dim}>{t('bodyweight.runtime.recentLog')}</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{t('bodyweight.runtime.viewAll')}</ACLabel>
          </div>
          {[
            { d: t('bodyweight.runtime.entries.today'), v: '182.4', delta: '−0.2' },
            { d: t('bodyweight.runtime.entries.fri'),   v: '182.6', delta: '−0.2' },
            { d: t('bodyweight.runtime.entries.thu'),   v: '182.8', delta: '−0.4' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13.5, color: c.fg }}>{r.d}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, marginRight: 16 }}>
                {r.v}
              </div>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{r.delta}</ACLabel>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 22px 6px' }}>
        <ACBtn primary block dark={dark} size="md" pill>{t('bodyweight.runtime.logToday')}</ACBtn>
      </div>
      <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S6_Weight_A;
