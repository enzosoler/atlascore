import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';

function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}<span className="text-muted-foreground">/{max}g</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function TodayNutrition({ meals, profile }) {
  const { t } = useI18n();

  const totals = (meals || []).reduce((acc, m) => ({
    cal: acc.cal + (m.total_calories || 0),
    pro: acc.pro + (m.total_protein || 0),
    carb: acc.carb + (m.total_carbs || 0),
    fat: acc.fat + (m.total_fat || 0),
  }), { cal: 0, pro: 0, carb: 0, fat: 0 });

  const targets = {
    cal: profile?.calories_target || 2200,
    pro: profile?.protein_target || 160,
    carb: profile?.carbs_target || 250,
    fat: profile?.fat_target || 70,
  };

  const calPct = Math.min((totals.cal / targets.cal) * 100, 100);

  return (
    <Link to={ROUTES.nutrition} className="atlas-card block p-5 hover:border-[hsl(var(--border-strong))] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="atlas-overline">{t('today.nutrition.label')}</p>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={2} />
      </div>
      <div className="mb-4">
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-2xl font-bold">{Math.round(totals.cal)}</span>
          <span className="text-[13px] text-muted-foreground">/ {targets.cal} {t('today.nutrition.calories')}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700" style={{ width: `${calPct}%` }} />
        </div>
      </div>
      <div className="space-y-2">
        <MacroBar label={t('today.nutrition.protein')} value={totals.pro} max={targets.pro} color="hsl(var(--accent-primary))" />
        <MacroBar label={t('today.nutrition.carbs')} value={totals.carb} max={targets.carb} color="hsl(var(--accent-secondary))" />
        <MacroBar label={t('today.nutrition.fat')} value={totals.fat} max={targets.fat} color="hsl(var(--status-warning))" />
      </div>
    </Link>
  );
}
