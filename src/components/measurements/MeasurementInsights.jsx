import React from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_TONE_CLASS = {
  positive: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
  attention: 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(34_68%_32%)]',
  neutral: 'border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
};

export default function MeasurementInsights({ measurements, latest }) {
  if (!latest || measurements.length < 2) return null;

  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldest = sorted[0];

  const weightChange = latest.weight - oldest.weight;
  const bfChange =
    latest.body_fat && oldest.body_fat ? latest.body_fat - oldest.body_fat : null;
  const waistChange = latest.waist && oldest.waist ? latest.waist - oldest.waist : null;

  const daysElapsed = Math.floor(
    (new Date(`${latest.date}T12:00:00`) - new Date(`${oldest.date}T12:00:00`)) /
      (1000 * 60 * 60 * 24)
  );
  const weeksElapsed = daysElapsed / 7;

  const weightRate = weeksElapsed > 0 ? weightChange / weeksElapsed : 0;
  const projectedWeight8w = latest.weight + weightRate * 8;

  const insights = [];

  if (Math.abs(weightChange) > 0.1) {
    insights.push({
      label: 'Peso no periodo',
      icon: weightChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: weightChange > 0 ? 'attention' : 'positive',
      text: `${weightChange > 0 ? 'Subiu' : 'Caiu'} ${Math.abs(weightChange).toFixed(1)}kg desde ${new Date(
        `${oldest.date}T12:00:00`
      ).toLocaleDateString('pt-BR')}.`,
    });
  }

  if (bfChange !== null && Math.abs(bfChange) > 0.05) {
    insights.push({
      label: 'Composicao corporal',
      icon: bfChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: bfChange > 0 ? 'attention' : 'positive',
      text: `Body fat ${bfChange > 0 ? 'subiu' : 'caiu'} ${Math.abs(bfChange).toFixed(2)}% no intervalo analisado.`,
    });
  }

  if (waistChange !== null && Math.abs(waistChange) > 0.1) {
    insights.push({
      label: 'Linha de cintura',
      icon: waistChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: waistChange > 0 ? 'attention' : 'positive',
      text: `Cintura ${waistChange > 0 ? 'subiu' : 'caiu'} ${Math.abs(waistChange).toFixed(1)}cm desde a base inicial.`,
    });
  }

  if (Math.abs(weightRate) > 0.05) {
    insights.push({
      label: 'Ritmo atual',
      icon: AlertCircle,
      tone: 'neutral',
      text: `Ritmo medio de ${Math.abs(weightRate).toFixed(2)}kg por semana. Mantido o mesmo compasso, a projecao em 8 semanas aponta ${projectedWeight8w.toFixed(1)}kg.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      label: 'Leitura estavel',
      icon: Minus,
      tone: 'neutral',
      text: 'As medidas estao estaveis no periodo atual. Novos checkpoints ajudam a tornar a curva mais legivel.',
    });
  }

  return (
    <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
      <div>
        <p className="atlas-overline">Automated reading</p>
        <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
          Sinais detectados no periodo
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          Um resumo automatico da curva corporal atual, sem competir com a visualizacao principal.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <div
              key={insight.label}
              className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border',
                    ICON_TONE_CLASS[insight.tone]
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                    {insight.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                    {insight.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
