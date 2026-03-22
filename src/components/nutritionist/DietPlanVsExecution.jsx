import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * DietPlanVsExecution — compares prescribed nutrition with what was actually logged
 */
export default function DietPlanVsExecution({ diet, meals }) {
  if (!diet) {
    return (
      <div className="surface p-6 text-center">
        <p className="text-[13px] text-[hsl(var(--fg-2))]">No prescribed nutrition plan yet</p>
      </div>
    );
  }

  // Summarize this week's consumption
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  
  const weekMeals = meals.filter(m => new Date(m.date) >= weekStart && new Date(m.date) <= now);
  const avgDailyCalories = weekMeals.length > 0 
    ? Math.round(weekMeals.reduce((s, m) => s + (m.total_calories || 0), 0) / 7)
    : 0;
  
  const planCalories = diet.target_calories || 0;
  const adherenceCalories = planCalories > 0 ? Math.round((avgDailyCalories / planCalories) * 100) : 0;

  // Macro comparison
  const avgMacros = {
    protein: weekMeals.length > 0 ? Math.round(weekMeals.reduce((s, m) => s + (m.total_protein || 0), 0) / 7) : 0,
    carbs: weekMeals.length > 0 ? Math.round(weekMeals.reduce((s, m) => s + (m.total_carbs || 0), 0) / 7) : 0,
    fat: weekMeals.length > 0 ? Math.round(weekMeals.reduce((s, m) => s + (m.total_fat || 0), 0) / 7) : 0,
  };

  const chartData = [
    {
      macro: 'Protein',
      Planned: diet.target_protein || 0,
      Consumed: avgMacros.protein,
    },
    {
      macro: 'Carbs',
      Planned: diet.target_carbs || 0,
      Consumed: avgMacros.carbs,
    },
    {
      macro: 'Fat',
      Planned: diet.target_fat || 0,
      Consumed: avgMacros.fat,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="surface p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-[11px] text-[hsl(var(--fg-2))] uppercase tracking-wider mb-1">Target</p>
            <p className="text-[18px] font-bold">{planCalories}</p>
            <p className="text-[10px] text-[hsl(var(--fg-2))]">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-[hsl(var(--fg-2))] uppercase tracking-wider mb-1">7-day average</p>
            <p className="text-[18px] font-bold">{avgDailyCalories}</p>
            <p className="text-[10px] text-[hsl(var(--fg-2))]">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-[hsl(var(--fg-2))] uppercase tracking-wider mb-1">Adherence</p>
            <p className={`text-[18px] font-bold ${adherenceCalories >= 90 ? 'text-[hsl(var(--ok))]' : adherenceCalories >= 70 ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--err))]'}`}>
              {adherenceCalories}%
            </p>
            <p className="text-[10px] text-[hsl(var(--fg-2))]">score</p>
          </div>
        </div>
      </div>

      <div className="surface p-4">
        <p className="t-label mb-3">Macronutrients: planned vs consumed</p>
        {weekMeals.length === 0 ? (
          <p className="text-center text-[12px] text-[hsl(var(--fg-2))] py-4">No entries logged this week</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border-h))" />
              <XAxis dataKey="macro" tick={{ fontSize: 11, fill: 'hsl(var(--fg-2))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--fg-2))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
              <Bar dataKey="Planned" fill="hsl(var(--shell))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Consumed" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
