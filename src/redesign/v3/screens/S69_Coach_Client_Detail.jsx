import React from 'react';
import { CoachShell, CMono, CNum, CBtn, CChip, CAvatar, DeskSpark } from '../lib/coachDesktop.jsx';
import { useACTheme } from '../lib/paper.jsx';

export default function S69_Coach_Client_Detail() {
  const t = useACTheme();
  const heart = [80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 59, 58, 60, 61, 62, 61, 61, 60, 61, 61];
  const read = [72, 68, 65, 62, 60, 61, 61];
  return (
    <CoachShell active="roster" breadcrumb="COACH · ROSTER · J. PARKER" title="Jordan Parker." actions={<><CBtn size="sm">Message</CBtn><CBtn size="sm">Schedule</CBtn><CBtn size="sm" primary>Push intervention →</CBtn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, height: '100%', overflow: 'auto' }}>
        <div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 20, borderBottom: `1px solid ${t.ink}14` }}>
            <CAvatar name="JP" size={72} accent />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: `${t.ink}b0` }}>M · 34 · 178 cm · 82.4 kg · recomp</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}><CChip state="neutral">W03/12</CChip><CChip state="flag">HRV drift</CChip><CChip state="good">pro plan</CChip></div>
              <div style={{ marginTop: 12, fontSize: 13, color: `${t.ink}b0`, lineHeight: 1.55, maxWidth: 520 }}>Works remote, 2 kids, sleep volatile (5–7h). Wants to drop 4 kg and keep strength.</div>
            </div>
          </div>
          <div style={{ padding: 16, border: `1px solid ${t.ink}14`, margin: '20px 0 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}><div><CMono size={10} color={`${t.ink}70`}>HRV · 21 DAYS · RMSSD</CMono><div style={{ marginTop: 4, fontSize: 14, fontWeight: 600 }}>Drift began Mar 18 — correlates with travel block.</div></div><CMono size={10} color={t.accent}>7D · 21D</CMono></div>
            <DeskSpark data={heart} w={760} h={100} color="#c2391a" stroke={2} />
          </div>
          <div style={{ padding: 16, border: `1px solid ${t.ink}14` }}><CMono size={10} color={`${t.ink}70`}>READINESS · 7D</CMono><div style={{ marginTop: 10 }}><DeskSpark data={read} w={340} h={80} color="#c2391a" stroke={2} /></div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 16, background: t.ink, color: t.paper }}>
            <CMono size={10} color={t.accent}>COACH · THREAD</CMono>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5 }}><strong>You · 2d:</strong> Let's swap Thu's heavy pull for mobility + sauna.<br /><br /><strong>J.P. · 2d:</strong> Agreed. Back felt stiff anyway.</div>
          </div>
          <div style={{ padding: 16, border: `1px solid ${t.ink}14` }}>
            <CMono size={10} color={`${t.ink}70`}>AI RECOMMENDATION</CMono>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>Deload pull day this week. Keep squat.</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><CBtn size="sm" primary>Apply → plan</CBtn><CBtn size="sm">Customize</CBtn></div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

