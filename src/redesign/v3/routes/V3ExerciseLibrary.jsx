import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { DEMO_EXERCISES } from '../lib/exerciseCatalog.js';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S35_Search from '../screens/S35_Search.jsx';

function groupExercises(rows) {
  const top = rows.slice(0, 1)[0];
  const compound = rows.filter((row) => /press|squat|deadlift|row|pull-up|chin-up/i.test(row.name)).slice(0, 4);
  const isolation = rows.filter((row) => !/press|squat|deadlift|row|pull-up|chin-up/i.test(row.name)).slice(0, 4);

  return {
    topMatch: top ? {
      label: 'Top match · Lift',
      title: top.name,
      meta: `${(top.muscles || []).slice(0, 2).join(' · ').toUpperCase()} · ${(top.equipment || '').toUpperCase()}`,
    } : undefined,
    groups: [
      {
        cat: `COMPOUND · ${compound.length}`,
        rows: compound.map((row) => ({ ...row, t: row.name, sub: `${(row.muscles || []).join(' · ')} · ${row.equipment}` })),
      },
      {
        cat: `ISOLATION · ${isolation.length}`,
        rows: isolation.map((row) => ({ ...row, t: row.name, sub: `${(row.muscles || []).join(' · ')} · ${row.equipment}` })),
      },
      {
        cat: 'QUICK FILTERS',
        rows: [
          { id: 'legs', t: 'Leg day staples', sub: 'Squat, hack squat, RDL, leg press' },
          { id: 'back', t: 'Back builders', sub: 'Row, pulldown, pull-up, shrug' },
          { id: 'arms', t: 'Arms finishers', sub: 'Curl, pushdown, overhead extension' },
        ],
      },
    ],
  };
}

export default function V3ExerciseLibrary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeScope, setActiveScope] = React.useState('All');

  const filtered = React.useMemo(() => {
    if (activeScope === 'All') return DEMO_EXERCISES;
    if (activeScope === 'Compound') return DEMO_EXERCISES.filter((r) => /press|squat|deadlift|row|pull-up|chin-up/i.test(r.name));
    if (activeScope === 'Isolation') return DEMO_EXERCISES.filter((r) => !/press|squat|deadlift|row|pull-up|chin-up/i.test(r.name));
    if (activeScope === 'Machine') return DEMO_EXERCISES.filter((r) => /machine|cable|smith/i.test(r.equipment || ''));
    if (activeScope === 'Bodyweight') return DEMO_EXERCISES.filter((r) => /bodyweight|body weight|bw/i.test(r.equipment || ''));
    return DEMO_EXERCISES;
  }, [activeScope]);

  const grouped = groupExercises(filtered);

  return (
    <V3StandaloneLayout>
      <S35_Search
        dark={theme === 'dark'}
        query="exercise library"
        scopes={['All', 'Compound', 'Isolation', 'Machine', 'Bodyweight']}
        activeScope={activeScope}
        topMatch={grouped.topMatch}
        groups={grouped.groups}
        prompts={[
          'Show me lower-body compounds',
          'Find shoulder accessories',
          'Which lifts build glutes fastest?',
        ]}
        onBack={() => navigate(-1)}
        onPickScope={(scope) => setActiveScope(scope)}
        onOpenResult={(result) => {
          const id = result?.id;
          if (id && DEMO_EXERCISES.some((row) => row.id === id)) {
            navigate(`/app/exercises/${id}`);
          }
        }}
        onOpenPrompt={(prompt) => navigate(`/app/coach/chat?ask=${encodeURIComponent(prompt)}`)}
      />
    </V3StandaloneLayout>
  );
}
