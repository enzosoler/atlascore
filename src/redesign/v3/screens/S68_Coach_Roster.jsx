import React from 'react';
import { CoachShell, CMono, CNum, CBtn, CChip, CAvatar, DeskSpark } from '../lib/coachDesktop.jsx';
import { useACTheme } from '../lib/paper.jsx';

export default function S68_Coach_Roster() {
  const t = useACTheme();
  const clients = [
    { name: 'A. Kimura', stamp: 'AK', prog: '5/3/1 BBB', wk: 'W07/16', read: 82, trend: [78, 80, 79, 82, 83, 82, 82], flag: null, lastSeen: '2h', tonnage: '18.2k', adherence: 98 },
    { name: 'J. Parker', stamp: 'JP', prog: 'Recomp', wk: 'W03/12', read: 61, trend: [72, 68, 65, 62, 60, 61, 61], flag: 'HRV drift', lastSeen: '8h', tonnage: '11.4k', adherence: 87 },
    { name: 'D. Singh', stamp: 'DS', prog: 'Powerlifting', wk: 'W05/16', read: 88, trend: [84, 85, 87, 86, 88, 88, 88], flag: 'PR window', lastSeen: '3h', tonnage: '15.6k', adherence: 100 },
    { name: 'R. Chen', stamp: 'RC', prog: 'Maintain', wk: '—', read: 55, trend: [68, 65, 60, 58, 55, 56, 55], flag: 'Missed 3', lastSeen: '4d', tonnage: '—', adherence: 62 },
  ];
  return (
    <CoachShell active="roster" breadcrumb="COACH · ROSTER" title="Your athletes." actions={<><CBtn size="sm" icon={<span style={{ color: t.accent, fontWeight: 700 }}>+</span>}>Invite</CBtn><CBtn size="sm">Export CSV</CBtn><CBtn size="sm" primary>New session</CBtn></>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: `${t.ink}08`, border: `1px solid ${t.ink}14` }}><CMono color={`${t.ink}70`} size={10}>⌕</CMono><span style={{ fontSize: 13, color: `${t.ink}60` }}>Search by name, program, or flag…</span></div>
        {['All · 12', 'Flagged · 4', 'On-track · 8', 'New · 1'].map((c, i) => <CChip key={c} state={i === 0 ? 'live' : 'neutral'}>{c}</CChip>)}
      </div>
      <div style={{ border: `1px solid ${t.ink}14` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 0.9fr 1.2fr 1.1fr 0.9fr 1fr 0.7fr', padding: '12px 16px', background: `${t.ink}08`, borderBottom: `1px solid ${t.ink}14` }}>
          {['athlete', 'program', 'read.', '7-day signal', 'flag', 'tonnage', 'adherence', 'last'].map((h) => <CMono key={h} size={9} color={`${t.ink}70`} track={1.6}>{h}</CMono>)}
        </div>
        {clients.map((c, i) => <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 0.9fr 1.2fr 1.1fr 0.9fr 1fr 0.7fr', padding: '14px 16px', alignItems: 'center', borderBottom: i < clients.length - 1 ? `1px solid ${t.ink}0c` : 'none', background: i === 1 ? `${t.accent}06` : 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CAvatar name={c.stamp} size={32} accent={c.flag === 'PR window'} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div><CMono size={9} color={`${t.ink}60`}>last: {c.lastSeen}</CMono></div></div>
          <div><div style={{ fontSize: 12, color: t.ink }}>{c.prog}</div><CMono size={9} color={`${t.ink}60`}>{c.wk}</CMono></div>
          <div><CNum size={18} color={c.read < 65 ? '#c2391a' : c.read >= 85 ? '#2a7a47' : t.ink}>{c.read}</CNum></div>
          <DeskSpark data={c.trend} w={90} h={22} color={c.read < 65 ? '#c2391a' : c.read >= 85 ? '#2a7a47' : t.ink} />
          <div>{c.flag ? <CChip state={c.flag === 'PR window' ? 'flag' : 'warn'}>{c.flag}</CChip> : <CMono size={10} color={`${t.ink}40`}>—</CMono>}</div>
          <div><CMono size={11} color={t.ink}>{c.tonnage}</CMono></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ flex: 1, height: 4, background: `${t.ink}10`, position: 'relative' }}><div style={{ position: 'absolute', inset: 0, right: `${100 - c.adherence}%`, background: c.adherence < 80 ? '#c2391a' : c.adherence < 95 ? t.accent : t.ink }} /></div><CMono size={10} color={`${t.ink}80`}>{c.adherence}%</CMono></div>
          <div style={{ textAlign: 'right' }}><CMono size={11} color={t.accent}>Open →</CMono></div>
        </div>)}
      </div>
    </CoachShell>
  );
}

