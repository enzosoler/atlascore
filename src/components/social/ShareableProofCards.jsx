import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import {
  Share2,
  Download,
  Instagram,
  Twitter,
  Facebook,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Zap,
  Star,
  Activity,
  Scale,
  Dumbbell,
  UtensilsCrossed,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  calculateBodyComposition, 
  calculateWeightTrend, 
  detectPlateau,
  calculateSmoothedWeight 
} from '@/lib/bodyMath';

// Card templates for different proof types
const CARD_TYPES = [
  {
    id: 'weekly_proof',
    name: 'Weekly Proof',
    description: 'Your week in review',
    icon: Calendar,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    requires: ['weight_data', 'nutrition_data', 'workout_data'],
  },
  {
    id: 'physique_trajectory',
    name: 'Physique Trajectory',
    description: 'Body composition progress',
    icon: Scale,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    requires: ['weight_data', 'body_fat'],
  },
  {
    id: 'adherence_score',
    name: 'Adherence Score',
    description: 'Compliance and consistency',
    icon: CheckCircle,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    requires: ['nutrition_data', 'workout_data'],
  },
  {
    id: 'milestone',
    name: 'Milestone',
    description: 'Achievement unlocked',
    icon: Trophy,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    requires: ['any_progress'],
  },
];

export default function ShareableProofCards({ open, onClose }) {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
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
      
      // Get weight data
      const { data: weights } = await supabase
        .from('measurements')
        .select('weight, body_fat, date')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .order('date', { ascending: true });
      
      // Get nutrition data
      const { data: nutrition } = await supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat, date')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .order('date', { ascending: true });
      
      // Get workout data
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

  const generateCardImage = useCallback(async () => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (doc, el) => {
          el.style.transform = 'none';
        },
      });
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    } catch (err) {
      console.error('[ShareableProofCards] html2canvas failed:', err);
      return null;
    }
  }, []);

  const handleShare = useCallback(async (platform = 'native') => {
    if (!selectedCard) return;
    setIsGenerating(true);
    try {
      const blob = await generateCardImage();
      if (!blob) {
        toast.error('Failed to generate card image');
        return;
      }

      const shareText = getShareText(selectedCard);
      const shareUrl = 'https://useatlascore.com/start?ref=share';

      if (platform === 'instagram' && navigator.canShare?.({ files: [new File([blob], 'atlas.png', { type: 'image/png' })] })) {
        const file = new File([blob], `atlas-${selectedCard}.png`, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'My Atlas Progress',
          text: `${shareText} ${shareUrl}`,
        });
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        window.open(twitterUrl, '_blank');
      } else if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(fbUrl, '_blank');
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Atlas Progress',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `atlas-${selectedCard}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (err) {
      console.error('[ShareableProofCards] Share failed:', err);
      toast.error('Share failed. Try downloading instead.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCard, generateCardImage]);

  const getShareText = (cardType) => {
    const texts = {
      weekly_proof: 'Check out my weekly progress with Atlas Core! 📈',
      physique_trajectory: 'My physique transformation is happening! 💪',
      adherence_score: 'Consistency is key! Hit my targets this week 🎯',
      milestone: 'Just hit a new milestone! 🔥',
    };
    return texts[cardType] || 'Making progress with Atlas Core!';
  };

  if (!open) return null;

  const selectedCardData = CARD_TYPES.find(card => card.id === selectedCard);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Athlete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--border)/0.1)] bg-[hsl(var(--card))/0.95] backdrop-blur-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.6)] text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--fg))]">Share Your Progress</h2>
                <p className="text-sm text-[hsl(var(--fg-2))]">Create proof cards to inspire others</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Card Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Choose Proof Card</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">Select what you want to share</p>
              </div>

              <div className="space-y-3">
                {CARD_TYPES.map((card) => {
                  const Icon = card.icon;
                  const isAvailable = weekData?.data && (
                    card.requires.includes('any_progress') || 
                    (card.requires.includes('weight_data') && weekData.data.weights.length > 0) ||
                    (card.requires.includes('nutrition_data') && weekData.data.nutrition.length > 0) ||
                    (card.requires.includes('workout_data') && weekData.data.workouts.length > 0)
                  );

                  return (
                    <button
                      key={card.id}
                      onClick={() => isAvailable && setSelectedCard(card.id)}
                      disabled={!isAvailable}
                      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        selectedCard === card.id
                          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                          : isAvailable
                          ? 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
                          : 'border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card)/0.3)] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[hsl(var(--fg))]">{card.name}</h4>
                          <p className="text-sm text-[hsl(var(--fg-2))]">{card.description}</p>
                          
                          {!isAvailable && (
                            <p className="text-xs text-[hsl(var(--fg-3))] mt-2">
                              Needs more data to unlock
                            </p>
                          )}
                        </div>
                        {selectedCard === card.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Preview & Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Preview</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">This is how your card will look</p>
              </div>

              {selectedCardData && weekData?.data ? (
                <div className="space-y-4">
                  {/* Card Preview */}
                  <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border)/0.2)] shadow-xl">
                    <ProofCardPreview
                      ref={cardRef}
                      cardType={selectedCardData}
                      data={weekData.data}
                      displayName={displayName}
                    />
                  </div>

                  {/* Share Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleShare('instagram')}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E4405F] to-[#C13584] px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Instagram className="h-4 w-4" />
                      )}
                      Instagram
                    </button>

                    <button
                      onClick={() => handleShare('twitter')}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </button>

                    <button
                      onClick={() => handleShare('facebook')}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#4267B2] px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </button>

                    <button
                      onClick={() => handleShare('download')}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))] disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--shell))] p-12 text-center">
                  <Trophy className="h-12 w-12 text-[hsl(var(--fg-3))]" />
                  <p className="mt-4 text-lg font-semibold text-[hsl(var(--fg))]">No Card Selected</p>
                  <p className="mt-2 text-sm text-[hsl(var(--fg-2))]">
                    Choose a card type to preview your shareable proof
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Proof Card Preview Component
const ProofCardPreview = React.forwardRef(({ cardType, data, displayName }, ref) => {
  const renderCardContent = () => {
    switch (cardType.id) {
      case 'weekly_proof':
        return <WeeklyProofCard data={data} displayName={displayName} />;
      case 'physique_trajectory':
        return <PhysiqueTrajectoryCard data={data} displayName={displayName} />;
      case 'adherence_score':
        return <AdherenceScoreCard data={data} displayName={displayName} />;
      case 'milestone':
        return <MilestoneCard data={data} displayName={displayName} />;
      default:
        return <div>Card preview</div>;
    }
  };

  return (
    <div
      ref={ref}
      style={{
        background: cardType.gradient,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        padding: '32px',
        color: '#fff',
        minHeight: '400px',
        aspectRatio: '1/1',
      }}
    >
      {/* Decorative elements */}
      <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'absolute', left: '-10px', bottom: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.8)' }}>
            atlas.core
          </p>
          <h3 style={{ marginTop: '8px', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.04em' }}>
            {cardType.name}
          </h3>
          <p style={{ marginTop: '4px', fontSize: '16px', opacity: '0.9' }}>
            {displayName.split(' ')[0]}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {renderCardContent()}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', padding: '12px 16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '-0.01em' }}>
            Track your own progress
          </p>
          <p style={{ marginTop: '2px', fontSize: '12px', opacity: '0.8' }}>
            useatlascore.com
          </p>
        </div>
      </div>
    </div>
  );
});

// Individual Card Components
function WeeklyProofCard({ data, displayName }) {
  const workoutsCompleted = data.workouts.filter(w => w.status === 'completed').length;
  const totalCalories = data.nutrition.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const avgCalories = Math.round(totalCalories / 7);
  const weightChange = data.weights.length >= 2 
    ? data.weights[data.weights.length - 1].weight - data.weights[0].weight
    : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Workouts
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{workoutsCompleted}</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>sessions completed</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Calories
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{avgCalories}</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>daily average</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Weight
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>
          {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
        </p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>weekly change</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Consistency
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>85%</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>adherence rate</p>
      </div>
    </div>
  );
}

function PhysiqueTrajectoryCard({ data, displayName }) {
  const currentWeight = data.weights.length > 0 ? data.weights[data.weights.length - 1].weight : 0;
  const currentBodyFat = data.weights.length > 0 ? data.weights[data.weights.length - 1].body_fat : 0;
  const composition = currentWeight && currentBodyFat ? calculateBodyComposition(currentWeight, currentBodyFat) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Weight
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{currentWeight.toFixed(1)}</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>kilograms</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Body Fat
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{currentBodyFat.toFixed(1)}%</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>estimated</p>
      </div>
      
      {composition && (
        <>
          <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
              Lean Mass
            </p>
            <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{composition.lean_mass.toFixed(1)}</p>
            <p style={{ fontSize: '12px', opacity: '0.8' }}>kilograms</p>
          </div>
          
          <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
              Phase
            </p>
            <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>CUT</p>
            <p style={{ fontSize: '12px', opacity: '0.8' }}>active</p>
          </div>
        </>
      )}
    </div>
  );
}

function AdherenceScoreCard({ data, displayName }) {
  const workoutCompliance = data.workouts.length > 0 
    ? (data.workouts.filter(w => w.status === 'completed').length / data.workouts.length) * 100
    : 0;
  
  const nutritionDays = new Set(data.nutrition.map(n => n.date)).size;
  const nutritionCompliance = (nutritionDays / 7) * 100;
  
  const overallCompliance = Math.round((workoutCompliance + nutritionCompliance) / 2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Overall Score
        </p>
        <p style={{ marginTop: '8px', fontSize: '32px', fontWeight: '700' }}>{overallCompliance}%</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>adherence</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Workouts
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{Math.round(workoutCompliance)}%</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>completed</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Nutrition
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>{Math.round(nutritionCompliance)}%</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>logged</p>
      </div>
      
      <div style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
          Streak
        </p>
        <p style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>12</p>
        <p style={{ fontSize: '12px', opacity: '0.8' }}>days</p>
      </div>
    </div>
  );
}

function MilestoneCard({ data, displayName }) {
  // Detect milestones based on data
  const milestones = [];
  
  if (data.workouts.filter(w => w.status === 'completed').length >= 10) {
    milestones.push('10 Workouts Completed');
  }
  
  if (data.nutrition.length >= 30) {
    milestones.push('30 Meals Logged');
  }
  
  if (data.weights.length >= 4) {
    milestones.push('Consistent Tracking');
  }

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <Trophy style={{ width: '80px', height: '80px', margin: '0 auto 24px', opacity: '0.9' }} />
      
      <h4 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
        Milestone Unlocked!
      </h4>
      
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {milestones.map((milestone, index) => (
          <div key={index} style={{ 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.15)', 
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            ✓ {milestone}
          </div>
        ))}
      </div>
      
      {milestones.length === 0 && (
        <p style={{ fontSize: '16px', opacity: '0.8' }}>
          Keep going! Your first milestone is just around the corner.
        </p>
      )}
    </div>
  );
}
