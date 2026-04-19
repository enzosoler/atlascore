import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { toast } from 'sonner';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S35_Search from '../screens/S35_Search.jsx';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';

export default function V3NutritionSearch() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [params] = useSearchParams();
  const meal = params.get('meal');
  const { nutrition } = useDailyStateV2();

  const groups = [
    {
      cat: 'FOODS · 4',
      rows: [
        { t: 'Chicken breast', sub: '165 kcal · 31g protein' },
        { t: 'Greek yogurt', sub: '130 kcal · 20g protein' },
        { t: 'Banana', sub: '105 kcal · fast carbs' },
        { t: 'Overnight oats', sub: '312 kcal · atlas meal' },
      ],
    },
    {
      cat: 'MEALS · 3',
      rows: [
        { t: 'Chicken rice bowl', sub: 'Saved meal · 580 kcal' },
        { t: 'Post-workout shake', sub: 'Saved meal · 340 kcal' },
        { t: 'Desk lunch', sub: 'Recent · 610 kcal' },
      ],
    },
    {
      cat: 'RECENTS · 3',
      rows: [
        { t: 'Fage 0%', sub: 'Yesterday · breakfast' },
        { t: 'Blueberries', sub: 'Yesterday · breakfast' },
        { t: 'Almonds', sub: '2d ago · snack' },
      ],
    },
  ];

  const proteinConsumed = Math.round(nutrition?.proteinConsumed || 0);
  const proteinTarget = Math.round(nutrition?.proteinTarget || 0);

  return (
    <V3StandaloneLayout>
      {proteinTarget > 0 && (
        <div
          style={{
            padding: '8px 20px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: theme === 'dark' ? 'rgba(0,255,255,0.85)' : 'hsl(var(--rd-accent))',
            borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {proteinConsumed}g / {proteinTarget}g protein today
        </div>
      )}
      <S35_Search
        dark={theme === 'dark'}
        query="protein"
        scopes={['Foods', 'Meals', 'Recents', 'Brands']}
        activeScope="Foods"
        topMatch={{ label: 'Top match · Food', title: 'Chicken breast', meta: '165 KCAL · 31G PROTEIN · 100G' }}
        groups={groups}
        prompts={[
          'Find high-protein breakfast ideas',
          'Show foods under 300 kcal',
          'What should I eat pre-workout?',
        ]}
        onBack={() => navigate(-1)}
        onPickScope={() => {}}
        onOpenResult={(result) => {
          if (typeof result?.t === 'string' || typeof result?.title === 'string') {
            return toast(`${result.t || result.title}${meal ? ` → ${meal}` : ''}`);
          }
        }}
        onOpenPrompt={(prompt) => navigate(`/app/coach/chat?ask=${encodeURIComponent(prompt)}`)}
      />
    </V3StandaloneLayout>
  );
}
