import React from 'react';
import { CoachShell, CMono, CNum, CBtn, CChip, CAvatar } from '../lib/coachDesktop.jsx';
import { useACTheme } from '../lib/paper.jsx';

export default function S70_Coach_Queue() {
  const t = useACTheme();
  const threads = [
    { from: 'J. Parker', stamp: 'JP', prio: 'high', subj: 'HRV drop — should I skip Thu?', preview: 'My watch says HRV is way down.', time: '2m', unread: true, tags: ['hrv', 'plan'] },
    { from: 'D. Singh', stamp: 'DS', prio: 'pr', subj: 'PR window — 180 kg squat?', preview: 'Last three warmups felt lighter than expected.', time: '14m', unread: true, tags: ['pr', 'squat'] },
  ];
  const [active, setActive] = React.useState(0);
  const selected = threads[active];
  return (
    <CoachShell active="queue" breadcrumb="COACH · QUEUE" title="Inbox." actions={<><CBtn size="sm">Filters</CBtn><CBtn size="sm">Saved replies</CBtn><CBtn size="sm" primary>Compose →</CBtn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100%', border: `1px solid ${t.ink}14`, overflow: 'hidden' }}>
        <div style={{ borderRight: `1px solid ${t.ink}14`, overflow: 'auto' }}>
          {threads.map((th, i) => <div key={th.from} onClick={() => setActive(i)} style={{ padding: '14px', display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, borderBottom: `1px solid ${t.ink}0c`, background: i === active ? `${t.accent}10` : 'transparent', cursor: 'pointer' }}>
            <CAvatar name={th.stamp} size={36} accent={th.prio === 'pr'} />
            <div><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 13, fontWeight: 700 }}>{th.from}</span>{th.prio === 'high' && <CChip state="warn">urgent</CChip>}{th.prio === 'pr' && <CChip state="flag">PR · ok?</CChip>}</div><div style={{ fontSize: 12, marginTop: 2 }}>{th.subj}</div><div style={{ fontSize: 11, color: `${t.ink}80`, marginTop: 2 }}>{th.preview}</div></div>
            <CMono size={9} color={`${t.ink}60`}>{th.time}</CMono>
          </div>)}
        </div>
        <div style={{ padding: 20 }}>
          <CMono size={10} color={`${t.ink}70`}>FROM · {selected.from.toUpperCase()}</CMono>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{selected.subj}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>{selected.tags.map((tag) => <CChip key={tag} state="neutral">#{tag}</CChip>)}</div>
          <div style={{ marginTop: 18, padding: 16, background: `${t.ink}08`, borderLeft: `2px solid ${t.accent}` }}>{selected.preview}</div>
          <div style={{ marginTop: 20, padding: 16, border: `1px dashed ${t.ink}30` }}>
            <CMono size={10} color={t.accent}>AI DRAFT · READY TO EDIT</CMono>
            <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.6 }}>Trust the signal. Swap Thursday's heavy pull for mobility + sauna. Move deadlifts to Saturday if Friday recovery looks good.</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><CBtn size="sm" primary>Send as-is</CBtn><CBtn size="sm">Edit</CBtn></div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

