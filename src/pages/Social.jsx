import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  SafePageBoundary,
  PageShell,
  SectionCard,
  EmptyState,
  LoadingState,
} from '@/components/shared/StablePage';
import { Download, ImageIcon, Share2, Dumbbell, UtensilsCrossed, BarChart3, Trophy } from 'lucide-react';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

function SocialCard({ title, subtitle, value, unit, detail, icon: Icon, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(15,23,42,0.10)]"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: gradient }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-zinc-200 text-zinc-600"
            style={{ background: 'hsl(0,0%,97%)' }}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <Share2 className="h-4 w-4 text-zinc-400 mt-1 group-hover:text-zinc-700 transition-colors" strokeWidth={2} />
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{title}</p>
        <p className="mt-2 text-[30px] font-bold tracking-[-0.06em] text-zinc-950">
          {value}<span className="text-[16px] font-semibold text-zinc-500 ml-1">{unit}</span>
        </p>
        <p className="mt-1 text-[13px] leading-6 text-zinc-600">{subtitle}</p>
        {detail && (
          <p className="mt-3 text-[12px] font-medium text-zinc-400">{detail}</p>
        )}
      </div>
    </button>
  );
}

function ShareCardPreview({ title, stats, color }) {
  return (
    <div
      className="rounded-[24px] p-6 text-white overflow-hidden relative"
      style={{ background: color }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-white/8" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Atlas Core</p>
        <p className="mt-2 text-[22px] font-bold tracking-[-0.04em]">{title}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[14px] bg-white/12 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/64">{s.label}</p>
              <p className="mt-1 text-[20px] font-bold tracking-[-0.04em]">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-white/50">useatlascore.com</p>
      </div>
    </div>
  );
}

export default function Social() {
  return (
    <SafePageBoundary
      title="Social"
      subtitle="Compartilhe seu progresso"
      maxWidth="max-w-4xl"
      fallbackDescription="A página Social abriu em modo seguro."
    >
      <SocialContent />
    </SafePageBoundary>
  );
}

function SocialContent() {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);

  const today = getToday();
  const weekStart = getWeekStart();

  const { data: checkin, isLoading: loadingCheckin } = useQuery({
    queryKey: ['social-checkin', today],
    queryFn: async () => {
      const r = await base44.entities.DailyCheckin.filter({ date: today });
      return r?.[0] || null;
    },
  });

  const { data: meals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['social-meals', today],
    queryFn: () => base44.entities.Meal.filter({ date: today }),
  });

  const { data: workoutsWeek = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['social-workouts-week', weekStart],
    queryFn: () => base44.entities.Workout.filter({ date: weekStart }),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['social-measurements'],
    queryFn: () => base44.entities.Measurement.list('-date', 1),
  });

  const isLoading = loadingCheckin || loadingMeals || loadingWorkouts;

  const totalCalToday = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtToday = meals.reduce((s, m) => s + (m.total_protein || 0), 0);
  const completedWorkouts = workoutsWeek.filter((w) => w.completed).length;
  const latestMeasurement = measurements[0] || null;
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Atleta';

  const shareCards = [
    {
      id: 'nutrition',
      title: 'Nutrição de hoje',
      subtitle: `${meals.length} refeições registradas`,
      value: totalCalToday,
      unit: 'kcal',
      detail: `Proteína: ${totalProtToday}g`,
      icon: UtensilsCrossed,
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    },
    {
      id: 'workout',
      title: 'Treinos esta semana',
      subtitle: 'Sessões concluídas',
      value: completedWorkouts,
      unit: 'treinos',
      detail: 'Esta semana',
      icon: Dumbbell,
      gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
    },
    {
      id: 'mood',
      title: 'Check-in de hoje',
      subtitle: checkin ? 'Humor e energia registrados' : 'Sem registro hoje',
      value: checkin ? checkin.mood : '—',
      unit: checkin ? '/5' : '',
      detail: checkin ? `Energia: ${checkin.energy}/5 · Sono: ${checkin.sleep_hours}h` : null,
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #BBF7D0 100%)',
    },
    {
      id: 'weight',
      title: 'Peso atual',
      subtitle: latestMeasurement ? 'Última medida registrada' : 'Nenhuma medida registrada',
      value: latestMeasurement?.weight ?? '—',
      unit: latestMeasurement ? 'kg' : '',
      detail: latestMeasurement?.body_fat ? `Gordura: ${latestMeasurement.body_fat}%` : null,
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #F5F3FF 0%, #E9D5FF 100%)',
    },
  ];

  const previewStats =
    selectedCard === 'nutrition'
      ? [
          { label: 'Calorias', value: `${totalCalToday} kcal` },
          { label: 'Proteína', value: `${totalProtToday}g` },
          { label: 'Refeições', value: `${meals.length}` },
          { label: 'Carb', value: `${meals.reduce((s, m) => s + (m.total_carbs || 0), 0)}g` },
        ]
      : selectedCard === 'workout'
      ? [
          { label: 'Treinos', value: completedWorkouts },
          { label: 'Esta semana', value: workoutsWeek.length },
          { label: 'Taxa', value: workoutsWeek.length > 0 ? `${Math.round((completedWorkouts / workoutsWeek.length) * 100)}%` : '—' },
          { label: 'Atleta', value: displayName.split(' ')[0] },
        ]
      : selectedCard === 'mood'
      ? [
          { label: 'Humor', value: checkin ? `${checkin.mood}/5` : '—' },
          { label: 'Energia', value: checkin ? `${checkin.energy}/5` : '—' },
          { label: 'Sono', value: checkin ? `${checkin.sleep_hours}h` : '—' },
          { label: 'Água', value: checkin ? `${checkin.hydration_liters}L` : '—' },
        ]
      : [
          { label: 'Peso', value: latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '—' },
          { label: 'Gordura', value: latestMeasurement?.body_fat ? `${latestMeasurement.body_fat}%` : '—' },
          { label: 'Cintura', value: latestMeasurement?.waist ? `${latestMeasurement.waist} cm` : '—' },
          { label: 'Atleta', value: displayName.split(' ')[0] },
        ];

  const cardColors = {
    nutrition: 'linear-gradient(135deg, #0A84FF 0%, #38A3FF 100%)',
    workout: 'linear-gradient(135deg, #FF9F0A 0%, #FFCC00 100%)',
    mood: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    weight: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  };

  const cardTitles = {
    nutrition: `Nutrição · ${displayName.split(' ')[0]}`,
    workout: `Treinos · ${displayName.split(' ')[0]}`,
    mood: `Check-in · ${displayName.split(' ')[0]}`,
    weight: `Progresso · ${displayName.split(' ')[0]}`,
  };

  return (
    <PageShell
      title="Social"
      subtitle="Compartilhe seu progresso com o mundo. Selecione um card para gerar uma imagem para redes sociais."
      maxWidth="max-w-4xl"
    >
      {isLoading ? (
        <LoadingState
          title="Carregando dados"
          description="Buscando seus dados mais recentes para gerar os cards."
        />
      ) : null}

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: stat cards */}
          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500 px-1">
              Selecione um card para compartilhar
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {shareCards.map((card) => (
                <SocialCard
                  key={card.id}
                  {...card}
                  onClick={() => setSelectedCard(card.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: preview */}
          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500 px-1">
              Pré-visualização do card
            </p>

            {selectedCard ? (
              <div className="space-y-4">
                <ShareCardPreview
                  title={cardTitles[selectedCard]}
                  stats={previewStats}
                  color={cardColors[selectedCard]}
                />
                <div className="flex gap-3">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-[16px] border border-zinc-200 bg-white px-4 py-3 text-[14px] font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: cardTitles[selectedCard],
                          text: 'Confira meu progresso no Atlas Core!',
                          url: 'https://useatlascore.com',
                        });
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" strokeWidth={2} />
                    Compartilhar
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 rounded-[16px] border border-zinc-200 bg-white px-4 py-3 text-[14px] font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
                    onClick={() => {
                      /* future: html2canvas download */
                    }}
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    Baixar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50 py-16 px-6 text-center">
                <ImageIcon className="h-10 w-10 text-zinc-300" strokeWidth={1.5} />
                <p className="mt-4 text-[15px] font-semibold text-zinc-700">
                  Nenhum card selecionado
                </p>
                <p className="mt-2 text-[13px] text-zinc-500">
                  Clique em um card à esquerda para visualizar e compartilhar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
