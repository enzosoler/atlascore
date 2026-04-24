import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import {
  Share2,
  Download,
  Trophy,
  Scale,
  Dumbbell,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  calculateBodyComposition,
} from '@/lib/bodyMath';

// ── Card type definitions ────────────────────────────────────────────────────

const CARD_TYPES = [
  {
    id: 'weekly_proof',
    name: 'Weekly Proof',
    description: 'Your week in review',
    icon: Dumbbell,
    gradient: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    accentColor: '#4facfe',
    requires: ['nutrition_data', 'workout_data'],
  },
  {
    id: 'physique_trajectory',
    name: 'Physique Update',
    description: 'Body composition progress',
    icon: Scale,
    gradient: 'linear-gradient(160deg, #1a1a2e 0%, #2d1b3d 40%, #441a5e 100%)',
    accentColor: '#f093fb',
    requires: ['weight_data'],
  },
  {
    id: 'adherence_score',
    name: 'Consistency',
    description: 'Compliance and streak',
    icon: CheckCircle,
    gradient: 'linear-gradient(160deg, #0a0a0a 0%, #1a2a1a 40%, #0d3320 100%)',
    accentColor: '#43e97b',
    requires: ['nutrition_data', 'workout_data'],
  },
  {
    id: 'milestone',
    name: 'Milestone',
    description: 'Achievement unlocked',
    icon: Trophy,
    gradient: 'linear-gradient(160deg, #1a1005 0%, #2d1f0a 40%, #4a2f0a 100%)',
    accentColor: '#f5a623',
    requires: ['any_progress'],
  },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function ShareableProofCards({ open, onClose }) {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef(null);

  // Fetch user data for cards
  const { data: weekData } = useQuery({
    queryKey: ['share-card-week-data'],
    queryFn: async () => {
      if (!user?.id) return null;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weights } = await supabase
        .from('measurements')
        .select('weight, body_fat, date')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .order('date', { ascending: true });

      const { data: nutrition } = await supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat, date')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .order('date', { ascending: true });

      const { data: workouts } = await supabase
        .from('workouts')
        .select('status, completed_at, duration_minutes')
        .eq('user_id', user.id)
        .gte('completed_at', `${weekStartStr}T00:00:00`)
        .order('completed_at', { ascending: true });

      return {
        weights: weights || [],
        nutrition: nutrition || [],
        workouts: workouts || [],
      };
    },
    enabled: !!user?.id,
  });

  const selectedCard = CARD_TYPES[selectedIndex];
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Athlete';

  const generateCardImage = useCallback(async () => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (_doc, el) => {
          el.style.transform = 'none';
        },
      });
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    } catch (err) {
      console.error('[ShareableProofCards] html2canvas failed:', err);
      return null;
    }
  }, []);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCardImage();
      if (!blob) {
        toast.error('Failed to generate card image');
        return;
      }

      const file = new File([blob], `atlas-${selectedCard.id}.png`, { type: 'image/png' });
      const shareText = `Making progress with Atlas Core`;
      const shareUrl = 'https://useatlascore.com/start?ref=share';

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Atlas Progress',
          text: `${shareText} ${shareUrl}`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Atlas Progress',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: download
        handleDownload(blob);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('[ShareableProofCards] Share failed:', err);
        toast.error('Share failed. Try downloading instead.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCard, generateCardImage]);

  const handleDownload = useCallback(async (existingBlob) => {
    setIsGenerating(true);
    try {
      const blob = existingBlob || await generateCardImage();
      if (!blob) {
        toast.error('Failed to generate card image');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-${selectedCard.id}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      toast.success('Card downloaded');
    } catch (err) {
      console.error('[ShareableProofCards] Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCard, generateCardImage]);

  const goNext = () => setSelectedIndex((i) => (i + 1) % CARD_TYPES.length);
  const goPrev = () => setSelectedIndex((i) => (i - 1 + CARD_TYPES.length) % CARD_TYPES.length);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-4 w-full max-w-sm px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 right-2 z-20 rounded-full bg-white/10 p-2 text-white/60 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card type pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 w-full justify-center">
          {CARD_TYPES.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                idx === selectedIndex
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {card.name}
            </button>
          ))}
        </div>

        {/* Story card preview (9:16) */}
        <div className="relative w-full" style={{ aspectRatio: '9 / 16', maxHeight: '65vh' }}>
          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-1.5 text-white/70 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-1.5 text-white/70 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* The actual card rendered at 1080x1920, scaled to fit */}
          <div className="w-full h-full overflow-hidden rounded-2xl shadow-2xl">
            <div
              ref={cardRef}
              className="share-story-card-wrapper origin-top-left"
              style={{
                width: 1080,
                height: 1920,
                transform: 'scale(var(--story-scale))',
              }}
            >
              <StoryCard
                cardType={selectedCard}
                data={weekData}
                displayName={displayName}
              />
            </div>
          </div>
        </div>

        {/* Scale CSS */}
        <style>{`
          .share-story-card-wrapper {
            --story-scale: calc(min(100vw - 32px, 24rem) / 1080);
          }
        `}</style>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {CARD_TYPES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === selectedIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Export controls */}
        <div className="flex w-full gap-3">
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-[15px] font-bold text-black transition-opacity active:opacity-80 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Share
              </>
            )}
          </button>
          <button
            onClick={() => handleDownload()}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3.5 text-[15px] font-semibold text-white/70 transition-colors active:bg-white/5 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Story Card (1080x1920 canvas) ────────────────────────────────────────────
// Follows Strava pattern: one BIG hero stat, 2-3 supporting metrics below,
// subtle branding watermark.

function StoryCard({ cardType, data, displayName }) {
  switch (cardType.id) {
    case 'weekly_proof':
      return <WeeklyStoryCard data={data} displayName={displayName} accent={cardType.accentColor} gradient={cardType.gradient} />;
    case 'physique_trajectory':
      return <PhysiqueStoryCard data={data} displayName={displayName} accent={cardType.accentColor} gradient={cardType.gradient} />;
    case 'adherence_score':
      return <AdherenceStoryCard data={data} displayName={displayName} accent={cardType.accentColor} gradient={cardType.gradient} />;
    case 'milestone':
      return <MilestoneStoryCard data={data} displayName={displayName} accent={cardType.accentColor} gradient={cardType.gradient} />;
    default:
      return null;
  }
}

// ── Shared layout wrapper ────────────────────────────────────────────────────

function StoryLayout({ gradient, accent, heroNumber, heroUnit, heroLabel, metrics, displayName }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: gradient,
        color: '#fff',
      }}
    >
      {/* Accent glow behind hero */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          width: 800,
          height: 800,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top: branding + user */}
      <div style={{ padding: '80px 72px 0', position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
        }}>
          atlas.core
        </p>
        <p style={{
          marginTop: 12,
          fontSize: 34,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.45)',
        }}>
          {displayName}
        </p>
      </div>

      {/* Center: Hero stat */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          gap: 16,
        }}
      >
        <span style={{
          fontSize: 240,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: '#fff',
        }}>
          {heroNumber}
        </span>
        <span style={{
          fontSize: 56,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: accent,
        }}>
          {heroUnit}
        </span>
        {heroLabel && (
          <p style={{
            marginTop: 20,
            fontSize: 36,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}>
            {heroLabel}
          </p>
        )}
      </div>

      {/* Bottom: Supporting metrics row */}
      {metrics && metrics.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            margin: '0 72px 160px',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.06)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '32px 16px',
                textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <p style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}>
                {m.value}
              </p>
              <p style={{
                marginTop: 8,
                fontSize: 22,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.35)',
              }}>
                {m.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Watermark bottom-right */}
      <span
        style={{
          position: 'absolute',
          bottom: 64,
          right: 72,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'rgba(255,255,255,0.12)',
          zIndex: 1,
        }}
      >
        atlas.core
      </span>
    </div>
  );
}

// ── Individual card implementations ──────────────────────────────────────────

function WeeklyStoryCard({ data, displayName, accent, gradient }) {
  const workoutsCompleted = data?.workouts?.filter(w => w.status === 'completed').length || 0;
  const totalCalories = data?.nutrition?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
  const avgCalories = data?.nutrition?.length > 0 ? Math.round(totalCalories / 7) : 0;
  const totalProtein = data?.nutrition?.reduce((sum, m) => sum + (m.protein || 0), 0) || 0;
  const avgProtein = data?.nutrition?.length > 0 ? Math.round(totalProtein / 7) : 0;
  const weightChange = data?.weights?.length >= 2
    ? data.weights[data.weights.length - 1].weight - data.weights[0].weight
    : null;

  const metrics = [
    { value: `${avgCalories}`, label: 'Avg kcal' },
    { value: `${avgProtein}g`, label: 'Avg protein' },
  ];
  if (weightChange !== null) {
    metrics.push({ value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}`, label: 'kg change' });
  }

  return (
    <StoryLayout
      gradient={gradient}
      accent={accent}
      heroNumber={workoutsCompleted}
      heroUnit="workouts"
      heroLabel="completed this week"
      metrics={metrics}
      displayName={displayName}
    />
  );
}

function PhysiqueStoryCard({ data, displayName, accent, gradient }) {
  const currentWeight = data?.weights?.length > 0
    ? data.weights[data.weights.length - 1].weight
    : 0;
  const currentBf = data?.weights?.length > 0
    ? data.weights[data.weights.length - 1].body_fat
    : null;
  const composition = currentWeight && currentBf
    ? calculateBodyComposition(currentWeight, currentBf)
    : null;

  const metrics = [];
  if (currentBf) metrics.push({ value: `${currentBf.toFixed(1)}%`, label: 'Body fat' });
  if (composition) metrics.push({ value: `${composition.lean_mass.toFixed(1)}`, label: 'Lean kg' });
  if (data?.weights?.length >= 2) {
    const delta = data.weights[data.weights.length - 1].weight - data.weights[0].weight;
    metrics.push({ value: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`, label: 'kg delta' });
  }

  return (
    <StoryLayout
      gradient={gradient}
      accent={accent}
      heroNumber={currentWeight ? currentWeight.toFixed(1) : '--'}
      heroUnit="kg"
      heroLabel="current weight"
      metrics={metrics}
      displayName={displayName}
    />
  );
}

function AdherenceStoryCard({ data, displayName, accent, gradient }) {
  const workoutCompliance = data?.workouts?.length > 0
    ? Math.round((data.workouts.filter(w => w.status === 'completed').length / data.workouts.length) * 100)
    : 0;
  const nutritionDays = new Set(data?.nutrition?.map(n => n.date) || []).size;
  const nutritionCompliance = Math.round((nutritionDays / 7) * 100);
  const overallCompliance = Math.round((workoutCompliance + nutritionCompliance) / 2);

  const metrics = [
    { value: `${workoutCompliance}%`, label: 'Training' },
    { value: `${nutritionCompliance}%`, label: 'Nutrition' },
    { value: `${nutritionDays}/7`, label: 'Days logged' },
  ];

  return (
    <StoryLayout
      gradient={gradient}
      accent={accent}
      heroNumber={`${overallCompliance}%`}
      heroUnit="adherence"
      heroLabel="consistency is the real flex"
      metrics={metrics}
      displayName={displayName}
    />
  );
}

function MilestoneStoryCard({ data, displayName, accent, gradient }) {
  const milestones = [];
  const workoutsCompleted = data?.workouts?.filter(w => w.status === 'completed').length || 0;
  if (workoutsCompleted >= 10) milestones.push('10+ Workouts');
  if ((data?.nutrition?.length || 0) >= 30) milestones.push('30+ Meals Logged');
  if ((data?.weights?.length || 0) >= 4) milestones.push('Consistent Tracking');

  const heroText = milestones.length > 0 ? milestones.length : 0;
  const metrics = milestones.slice(0, 3).map((m) => ({
    value: '\u2713',
    label: m,
  }));

  return (
    <StoryLayout
      gradient={gradient}
      accent={accent}
      heroNumber={heroText}
      heroUnit={heroText === 1 ? 'milestone' : 'milestones'}
      heroLabel="unlocked this week"
      metrics={metrics.length > 0 ? metrics : [{ value: '...', label: 'Keep going' }]}
      displayName={displayName}
    />
  );
}
