import React from 'react';
import { CoachShell, CMono, CBtn, CChip } from '../lib/coachDesktop.jsx';
import { useACTheme } from '../lib/paper.jsx';

export default function S71_Coach_Intervention() {
  const t = useACTheme();
  return (
    <CoachShell active="roster" breadcrumb="COACH · ROSTER · J. PARKER · INTERVENTION" title="Push a plan change." actions={<><CBtn size="sm">Save as draft</CBtn><CBtn size="sm">Discard</CBtn><CBtn size="sm" primary>Send to J. Parker →</CBtn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, height: '100%', overflow: 'auto' }}>
        <div>
          <CMono size={10} color={`${t.ink}70`} style={{ marginBottom: 10, display: 'block' }}>STEP 01 · THE WHY</CMono>
          <div style={{ padding: 16, border: `1px solid ${t.ink}14` }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What is triggering this change?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                ['HRV drift', '−18', true], ['Sleep debt', '−40m/n', true], ['Session RPE ↑', '+0.6', false],
                ['Missed workouts', '0', false], ['Reported pain', '—', false], ['Lab flag', '—', false],
              ].map(([k, v, on]) => <div key={k} style={{ padding: '10px 12px', border: `1px solid ${on ? t.ink : `${t.ink}18`}`, background: on ? `${t.accent}14` : 'transparent', borderLeft: on ? `3px solid ${t.accent}` : '3px solid transparent', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, fontWeight: on ? 700 : 500 }}>{k}</span><CMono size={10}>{v}</CMono></div>)}
            </div>
          </div>
          <div style={{ marginTop: 20, border: `1px solid ${t.ink}14`, padding: 16 }}>
            <CMono size={10} color={`${t.ink}70`}>STEP 02 · THE CHANGE</CMono>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>{['Deload', 'Swap day', 'Skip session', 'Change lift', 'Add rest'].map((c, i) => <CChip key={c} state={i === 0 ? 'live' : 'neutral'}>{c}</CChip>)}</div>
            <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6 }}>Swap Thursday's heavy pull for mobility + sauna. Move deadlifts to Saturday if Friday recovery is green.</div>
          </div>
        </div>
        <div>
          <div style={{ padding: 16, background: `${t.accent}12`, border: `1px solid ${t.accent}40` }}>
            <CMono size={10} color={t.accent}>PREVIEW · CLIENT VIEW</CMono>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700 }}>Plan updated for this week.</div>
            <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6 }}>Thursday becomes recovery and mobility. Heavy pull moves to Saturday if Friday readiness improves.</div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

