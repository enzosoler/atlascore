import React, { useState } from 'react';
import { AppShell } from '../../layouts';
import { PageHeader, Button, SectionHeader, SegmentedControl } from '../../ui';
import { DailyTotalsBar, MealSection, QuickAddSheet } from '../../modules';
import { mockMacros, mockMeals } from '../../lib/mock-data';

export default function NutritionToday() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [tab, setTab] = useState('today');
  return (
    <AppShell
      current="nutrition"
      topBar={
        <PageHeader
          title="Nutrition"
          subtitle="Friday · Apr 17"
          actions={<Button intent="primary" size="sm" onClick={() => setQuickAddOpen(true)}>+ Log food</Button>}
        />
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'plan',  label: 'Plan' },
            { value: 'history', label: 'History' },
          ]}
        />
      </div>

      <DailyTotalsBar macros={mockMacros} />

      <SectionHeader className="mt-6" title="Meals" description="Tap a food to edit. Tap the meal to add more." />
      <div className="space-y-3">
        {mockMeals.map((m) => (
          <MealSection
            key={m.id}
            meal={m}
            onAdd={() => setQuickAddOpen(true)}
            onEditItem={() => {}}
          />
        ))}
      </div>

      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} onPickMode={() => {}} />
    </AppShell>
  );
}
