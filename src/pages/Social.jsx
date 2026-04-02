import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { getDailyCheckin } from '@/services/checkinService';
import html2canvas from 'html2canvas';
import {
  SafePageBoundary,
  PageShell,
  LoadingState,
} from '@/components/shared/StablePage';
import {
  Download,
  ImageIcon,
  Share2,
  Dumbbell,
  UtensilsCrossed,
  BarChart3,
  Trophy,
  Flame,
  Instagram,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

/** Calculate consecutive-day streak from an array of { date } objects. */
function calcStreak(entries = []) {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (sorted.some((c) => c.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Viral CTA hooks ────────────────────────────────────────────────────────────
// Instead of "Download Atlas" or "Check out my progress", use action-oriented
// hooks that speak to the viewer's self-interest (Hunter Isaacson playbook).

const VIRAL_HOOKS = {
  nutrition: 'Track your own macros',
  workout: 'Start your streak',
  streak: 'Start your streak',
  mood: 'Track your own macros',
  weight: 'Track your own macros',
};

const VIRAL_URLS = {
  nutrition: 'https://useatlascore.com/start?ref=story&card=nutrition',
  workout: 'https://useatlascore.com/start?ref=story&card=workout',
  streak: 'https://useatlascore.com/start?ref=story&card=streak',
  mood: 'https://useatlascore.com/start?ref=story&card=mood',
  weight: 'https://useatlascore.com/start?ref=story&card=weight',
};

// ─── SocialCard (selector tile) ─────────────────────────────────────────────────

function SocialCard({ title, subtitle, value, unit, detail, icon: Icon, gradient, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] border p-5 text-left shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
        selected
          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.04)]'
          : 'border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.92)] hover:border-[hsl(var(--brand)/0.2)]'
      }`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: gradient, mixBlendMode: 'screen' }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] text-[hsl(var(--brand))]">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <Share2
            className="mt-1 h-4 w-4 text-[hsl(var(--fg-3))] transition-colors group-hover:text-[hsl(var(--fg))]"
            strokeWidth={2}
          />
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
          {title}
        </p>
        <p className="mt-2 text-[30px] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">
          {value}
          <span className="ml-1 text-[16px] font-semibold text-[hsl(var(--fg-3))]">{unit}</span>
        </p>
        <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{subtitle}</p>
        {detail && <p className="mt-3 text-[12px] font-medium text-[hsl(var(--fg-3))]">{detail}</p>}
      </div>
    </button>
  );
}

// ─── ShareCardPreview (the card that gets rendered to an image) ──────────────

function ShareCardPreview({ title, stats, color, hook, cardRef }) {
  // Use inline styles for colors so html2canvas can render them reliably.
  // Tailwind's bg-white/12 and text-white/70 use modern CSS that html2canvas
  // doesn't fully support.
  return (
    <div
      ref={cardRef}
      style={{
        background: color,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: 24,
        color: '#fff',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -32, top: -32, width: 128, height: 128, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'absolute', left: -16, bottom: 0, width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>
          atlas.core
        </p>
        <p style={{ marginTop: 8, fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em' }}>{title}</p>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ borderRadius: 14, background: 'rgba(255,255,255,0.12)', padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.64)' }}>
                {s.label}
              </p>
              <p style={{ marginTop: 4, fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Viral CTA — the compelling hook that drives acquisition */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, background: 'rgba(255,255,255,0.16)', padding: '12px 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{hook}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>useatlascore.com</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────────

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
  const [selectedCard, setSelectedCard] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef(null);

  const today = getToday();
  const weekStart = getWeekStart();

  // ── No paywall gate ──────────────────────────────────────────────────────────
  // Social cards are FREE for all users. This is the viral loop entry point.
  // Removing the UpgradeGate entirely — social sharing must be frictionless.

  // ── Data queries ─────────────────────────────────────────────────────────────

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
      return (data || []).map((m) => ({
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
      return (data || []).map((w) => ({ ...w, completed: w.status === 'completed' }));
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

  // Streak data — fetch recent checkins for streak calculation
  const { data: recentCheckins = [] } = useQuery({
    queryKey: ['social-streak-checkins'],
    queryFn: async () => {
      if (!user?.id) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
      const { data } = await supabase
        .from('daily_checkins')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Workout streak — consecutive days with completed workouts
  const { data: recentWorkouts = [] } = useQuery({
    queryKey: ['social-workout-streak'],
    queryFn: async () => {
      if (!user?.id) return [];
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const { data } = await supabase
        .from('workouts')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', sixtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false });
      // Convert to date-only entries for streak calc
      return (data || []).map((w) => ({
        date: w.completed_at?.split('T')[0],
      }));
    },
    enabled: !!user?.id,
  });

  const isLoading = loadingCheckin || loadingMeals || loadingWorkouts;

  // ── Derived values ───────────────────────────────────────────────────────────

  const totalCalToday = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtToday = meals.reduce((s, m) => s + (m.total_protein || 0), 0);
  const completedWorkouts = workoutsWeek.filter((w) => w.completed).length;
  const latestMeasurement = measurements[0] || null;
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Athlete';
  const workoutStreak = calcStreak(recentWorkouts);
  const checkinStreak = calcStreak(recentCheckins);

  // ── Card definitions ─────────────────────────────────────────────────────────

  const shareCards = [
    {
      id: 'nutrition',
      title: "Today's nutrition",
      subtitle: `${meals.length} meals logged`,
      value: totalCalToday,
      unit: 'kcal',
      detail: `Protein: ${totalProtToday}g`,
      icon: UtensilsCrossed,
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    },
    {
      id: 'streak',
      title: 'Workout streak',
      subtitle: workoutStreak >= 7 ? 'On fire!' : workoutStreak > 0 ? 'Keep it going' : 'Start today',
      value: workoutStreak,
      unit: workoutStreak === 1 ? 'day' : 'days',
      detail: checkinStreak > 0 ? `Check-in streak: ${checkinStreak} days` : null,
      icon: Flame,
      gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    },
    {
      id: 'workout',
      title: 'Workouts this week',
      subtitle: 'Completed sessions',
      value: completedWorkouts,
      unit: completedWorkouts === 1 ? 'workout' : 'workouts',
      detail: 'This week',
      icon: Dumbbell,
      gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
    },
    {
      id: 'mood',
      title: "Today's check-in",
      subtitle: checkin ? 'Mood and energy logged' : 'No entry today',
      value: checkin ? checkin.mood : '\u2014',
      unit: checkin ? '/5' : '',
      detail: checkin ? `Energy: ${checkin.energy}/5 \u00B7 Sleep: ${checkin.sleep_hours}h` : null,
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #BBF7D0 100%)',
    },
    {
      id: 'weight',
      title: 'Current weight',
      subtitle: latestMeasurement ? 'Latest measurement logged' : 'No measurements logged',
      value: latestMeasurement?.weight ?? '\u2014',
      unit: latestMeasurement ? 'kg' : '',
      detail: latestMeasurement?.body_fat ? `Body fat: ${latestMeasurement.body_fat}%` : null,
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #F5F3FF 0%, #E9D5FF 100%)',
    },
  ];

  // ── Preview stats per card ───────────────────────────────────────────────────

  const getPreviewStats = (cardId) => {
    switch (cardId) {
      case 'nutrition':
        return [
          { label: 'Calories', value: `${totalCalToday} kcal` },
          { label: 'Protein', value: `${totalProtToday}g` },
          { label: 'Meals', value: `${meals.length}` },
          { label: 'Carbs', value: `${meals.reduce((s, m) => s + (m.total_carbs || 0), 0)}g` },
        ];
      case 'streak':
        return [
          { label: 'Workout streak', value: `${workoutStreak} days` },
          { label: 'Check-in streak', value: `${checkinStreak} days` },
          { label: 'This week', value: `${completedWorkouts} sessions` },
          { label: 'Athlete', value: displayName.split(' ')[0] },
        ];
      case 'workout':
        return [
          { label: 'Workouts', value: completedWorkouts },
          { label: 'This week', value: workoutsWeek.length },
          {
            label: 'Rate',
            value:
              workoutsWeek.length > 0
                ? `${Math.round((completedWorkouts / workoutsWeek.length) * 100)}%`
                : '\u2014',
          },
          { label: 'Athlete', value: displayName.split(' ')[0] },
        ];
      case 'mood':
        return [
          { label: 'Mood', value: checkin ? `${checkin.mood}/5` : '\u2014' },
          { label: 'Energy', value: checkin ? `${checkin.energy}/5` : '\u2014' },
          { label: 'Sleep', value: checkin ? `${checkin.sleep_hours}h` : '\u2014' },
          { label: 'Water', value: checkin ? `${checkin.hydration_liters}L` : '\u2014' },
        ];
      default:
        return [
          { label: 'Weight', value: latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '\u2014' },
          { label: 'Body fat', value: latestMeasurement?.body_fat ? `${latestMeasurement.body_fat}%` : '\u2014' },
          { label: 'Waist', value: latestMeasurement?.waist ? `${latestMeasurement.waist} cm` : '\u2014' },
          { label: 'Athlete', value: displayName.split(' ')[0] },
        ];
    }
  };

  const cardColors = {
    nutrition: 'linear-gradient(135deg, #0A84FF 0%, #38A3FF 100%)',
    streak: 'linear-gradient(135deg, #FF6B35 0%, #FF9F0A 100%)',
    workout: 'linear-gradient(135deg, #FF9F0A 0%, #FFCC00 100%)',
    mood: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    weight: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  };

  const cardTitles = {
    nutrition: `Nutrition \u00B7 ${displayName.split(' ')[0]}`,
    streak: `Streak \u00B7 ${displayName.split(' ')[0]}`,
    workout: `Workouts \u00B7 ${displayName.split(' ')[0]}`,
    mood: `Check-in \u00B7 ${displayName.split(' ')[0]}`,
    weight: `Progress \u00B7 ${displayName.split(' ')[0]}`,
  };

  // ── Image generation + share ─────────────────────────────────────────────────

  const generateCardImage = useCallback(async () => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High-res for Instagram Stories (1080×1920 target)
        useCORS: true,
        backgroundColor: null,
        logging: false,
        // Ensure the element is fully painted before capture
        onclone: (doc, el) => {
          el.style.transform = 'none';
        },
      });
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    } catch (err) {
      console.error('[Social] html2canvas failed:', err);
      return null;
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!selectedCard) return;
    setIsGenerating(true);
    try {
      const blob = await generateCardImage();
      if (!blob) {
        console.error('[Social] Failed to generate card image');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-${selectedCard}-${today}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('[Social] Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCard, generateCardImage, today]);

  const handleShare = useCallback(async () => {
    if (!selectedCard) return;
    setIsGenerating(true);
    try {
      const blob = await generateCardImage();
      const hook = VIRAL_HOOKS[selectedCard];
      const url = VIRAL_URLS[selectedCard];

      if (blob && navigator.canShare?.({ files: [new File([blob], 'atlas.png', { type: 'image/png' })] })) {
        // Native share with image file — ideal for Instagram Stories
        const file = new File([blob], `atlas-${selectedCard}.png`, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: hook,
          text: `${hook} \u2192 ${url}`,
        });
      } else if (navigator.share) {
        // Fallback: text-only native share
        await navigator.share({
          title: hook,
          text: `${hook} \u2014 track training, nutrition, and labs in one place.`,
          url,
        });
      } else {
        // Desktop fallback: download the image + copy link
        if (blob) {
          const dlUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = dlUrl;
          a.download = `atlas-${selectedCard}.png`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(dlUrl);
          }, 100);
        }
        await navigator.clipboard?.writeText(`${hook} \u2192 ${url}`);
        toast.success('Card saved! Link copied to clipboard.');
      }
    } catch (err) {
      console.error('[Social] Share failed:', err);
      toast.error('Could not share. Try downloading instead.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCard, generateCardImage]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageShell
      title="Social"
      subtitle="Share your progress. Every card is free \u2014 the more you share, the more your friends join."
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
                  selected={selectedCard === card.id}
                  onClick={() => setSelectedCard(card.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: preview + actions */}
          <div className="space-y-4">
            <p className="px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
              Card preview
            </p>

            {selectedCard ? (
              <div className="space-y-4">
                <ShareCardPreview
                  cardRef={cardRef}
                  title={cardTitles[selectedCard]}
                  stats={getPreviewStats(selectedCard)}
                  color={cardColors[selectedCard]}
                  hook={VIRAL_HOOKS[selectedCard]}
                />

                {/* Share actions */}
                <div className="flex gap-3">
                  <button
                    className="atlas-button atlas-button-primary flex-1 justify-center gap-2"
                    onClick={handleShare}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Instagram className="h-4 w-4" strokeWidth={2} />
                    )}
                    Share to Story
                  </button>
                  <button
                    className="atlas-button atlas-button-secondary justify-center gap-2"
                    onClick={handleDownload}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Download className="h-4 w-4" strokeWidth={2} />
                    )}
                    Save
                  </button>
                </div>

                {/* Viral hint */}
                <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
                  Your card includes a link so friends can start tracking too.
                </p>
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
