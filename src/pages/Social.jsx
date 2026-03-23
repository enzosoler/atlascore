import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import { getDailyCheckin } from '@/services/checkinService';
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
      className="group relative overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.92)] p-5 text-left shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--brand)/0.2)] hover:shadow-[var(--shadow-md)]"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: gradient, mixBlendMode: 'screen' }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))]"
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <Share2 className="mt-1 h-4 w-4 text-[hsl(var(--fg-3))] transition-colors group-hover:text-[hsl(var(--fg))]" strokeWidth={2} />
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">{title}</p>
        <p className="mt-2 text-[30px] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">
          {value}<span className="ml-1 text-[16px] font-semibold text-[hsl(var(--fg-3))]">{unit}</span>
        </p>
        <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{subtitle}</p>
        {detail && (
          <p className="mt-3 text-[12px] font-medium text-[hsl(var(--fg-3))]">{detail}</p>
        )}
      </div>
    </button>
  );
}

function ShareCardPreview({ title, stats, color }) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-white/10 p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
      style={{ background: color }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-white/8" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">atlas.core</p>
        <p className="mt-2 text-[22px] font-bold tracking-[-0.04em]">{title}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[14px] bg-white/12 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/64">{s.label}</p>
              <p className="mt-1 text-[20px] font-bold tracking-[-0.04em]">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-white/50">Tracked in atlas.core</p>
      </div>
    </div>
  );
}

export default function Social() {
  return (
    <SafePageBoundary
      title="Social"
      subtitle="Share your progress"
      maxWidth="max-w-4xl"
      fallbackDescription="The Social page loaded in safe mode."
    >
      <SocialContent />
    </SafePageBoundary>
  );
}

function SocialContent() {
  const { user } = useAuth();
  const { can } = useSubscription();
  const [selectedCard, setSelectedCard] = useState(null);

  const today = getToday();
  const weekStart = getWeekStart();

  // Check if user can access social cards
  if (!can('social_cards')) {
    return <UpgradeGate feature="social_cards" plan="Pro" />;
  }

  const { data: checkin, isLoading: loadingCheckin } = useQuery({
    queryKey: ['social-checkin', today],
    queryFn: async () => {
      if (!user?.id) return null;
      return getDailyCheckin(user.id, today);
    },
    enabled: !!user?.id,
  });

  const { data: meals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['social-meals', today],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('food_logs')
        .select('id, date, calories, protein, carbs, fat, food_name')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true });
      return (data || []).map(m => ({
        total_calories: Number(m.calories || 0),
        total_protein: Number(m.protein || 0),
        total_carbs: Number(m.carbs || 0),
      }));
    },
    enabled: !!user?.id,
  });

  const { data: workoutsWeek = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['social-workouts-week', weekStart],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('workouts')
        .select('id, status, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', `${weekStart}T00:00:00`)
        .order('completed_at', { ascending: false });
      return (data || []).map(w => ({ ...w, completed: w.status === 'completed' }));
    },
    enabled: !!user?.id,
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['social-measurements'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('measurements')
        .select('weight, body_fat, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isLoading = loadingCheckin || loadingMeals || loadingWorkouts;

  const totalCalToday = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtToday = meals.reduce((s, m) => s + (m.total_protein || 0), 0);
  const completedWorkouts = workoutsWeek.filter((w) => w.completed).length;
  const latestMeasurement = measurements[0] || null;
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Athlete';

  const shareCards = [
    {
      id: 'nutrition',
      title: 'Today\'s nutrition',
      subtitle: `${meals.length} meals logged`,
      value: totalCalToday,
      unit: 'kcal',
      detail: `Protein: ${totalProtToday}g`,
      icon: UtensilsCrossed,
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    },
    {
      id: 'workout',
      title: 'Workouts this week',
      subtitle: 'Completed sessions',
      value: completedWorkouts,
      unit: 'workouts',
      detail: 'This week',
      icon: Dumbbell,
      gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
    },
    {
      id: 'mood',
      title: 'Today\'s check-in',
      subtitle: checkin ? 'Mood and energy logged' : 'No entry today',
      value: checkin ? checkin.mood : '—',
      unit: checkin ? '/5' : '',
      detail: checkin ? `Energy: ${checkin.energy}/5 · Sleep: ${checkin.sleep_hours}h` : null,
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #BBF7D0 100%)',
    },
    {
      id: 'weight',
      title: 'Current weight',
      subtitle: latestMeasurement ? 'Latest measurement logged' : 'No measurements logged',
      value: latestMeasurement?.weight ?? '—',
      unit: latestMeasurement ? 'kg' : '',
      detail: latestMeasurement?.body_fat ? `Body fat: ${latestMeasurement.body_fat}%` : null,
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #F5F3FF 0%, #E9D5FF 100%)',
    },
  ];

  const previewStats =
    selectedCard === 'nutrition'
      ? [
          { label: 'Calories', value: `${totalCalToday} kcal` },
          { label: 'Protein', value: `${totalProtToday}g` },
          { label: 'Meals', value: `${meals.length}` },
          { label: 'Carbs', value: `${meals.reduce((s, m) => s + (m.total_carbs || 0), 0)}g` },
        ]
      : selectedCard === 'workout'
      ? [
          { label: 'Workouts', value: completedWorkouts },
          { label: 'This week', value: workoutsWeek.length },
          { label: 'Rate', value: workoutsWeek.length > 0 ? `${Math.round((completedWorkouts / workoutsWeek.length) * 100)}%` : '—' },
          { label: 'Athlete', value: displayName.split(' ')[0] },
        ]
      : selectedCard === 'mood'
      ? [
          { label: 'Mood', value: checkin ? `${checkin.mood}/5` : '—' },
          { label: 'Energy', value: checkin ? `${checkin.energy}/5` : '—' },
          { label: 'Sleep', value: checkin ? `${checkin.sleep_hours}h` : '—' },
          { label: 'Water', value: checkin ? `${checkin.hydration_liters}L` : '—' },
        ]
      : [
          { label: 'Weight', value: latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '—' },
          { label: 'Body fat', value: latestMeasurement?.body_fat ? `${latestMeasurement.body_fat}%` : '—' },
          { label: 'Waist', value: latestMeasurement?.waist ? `${latestMeasurement.waist} cm` : '—' },
          { label: 'Athlete', value: displayName.split(' ')[0] },
        ];

  const cardColors = {
    nutrition: 'linear-gradient(135deg, #0A84FF 0%, #38A3FF 100%)',
    workout: 'linear-gradient(135deg, #FF9F0A 0%, #FFCC00 100%)',
    mood: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    weight: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  };

  const cardTitles = {
    nutrition: `Nutrition · ${displayName.split(' ')[0]}`,
    workout: `Workouts · ${displayName.split(' ')[0]}`,
    mood: `Check-in · ${displayName.split(' ')[0]}`,
    weight: `Progress · ${displayName.split(' ')[0]}`,
  };

  return (
    <PageShell
      title="Social"
      subtitle="Share your progress with the world. Select a card to generate an image for social media."
      maxWidth="max-w-4xl"
    >
      {isLoading ? (
        <LoadingState
          title="Loading data"
          description="Fetching your latest activity to generate the cards."
        />
      ) : null}

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: stat cards */}
          <div className="space-y-4">
            <p className="px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
              Select a card to share
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
            <p className="px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
              Card preview
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
                    className="atlas-button atlas-button-secondary flex-1 justify-center"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: cardTitles[selectedCard],
                          text: 'Check out my progress in Atlas Core.',
                          url: 'https://useatlascore.com',
                        });
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" strokeWidth={2} />
                    Share
                  </button>
                  <button
                    className="atlas-button atlas-button-primary"
                    onClick={() => {
                      /* future: html2canvas download */
                    }}
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.42)] px-6 py-16 text-center">
                <ImageIcon className="h-10 w-10 text-[hsl(var(--brand)/0.4)]" strokeWidth={1.5} />
                <p className="mt-4 text-[15px] font-semibold text-[hsl(var(--fg))]">
                  No card selected
                </p>
                <p className="mt-2 text-[13px] text-[hsl(var(--fg-2))]">
                  Click a card on the left to preview and share it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
