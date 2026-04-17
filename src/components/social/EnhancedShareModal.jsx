import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import html2canvas from 'html2canvas';
import {
  Share2,
  Download,
  Instagram,
  Twitter,
  Facebook,
  Link2,
  Copy,
  Check,
  Trophy,
  Flame,
  Star,
  Zap,
  Loader2,
  X,
  Camera,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

// Viral hooks that drive acquisition (Hunter Isaacson playbook)
const VIRAL_HOOKS = {
  transformation: 'See my transformation',
  milestone: 'I hit a new milestone',
  streak: 'Start your streak',
  workout: 'Track your own macros',
  nutrition: 'Start your fitness journey',
  achievement: 'Unlock your potential',
};

const VIRAL_URLS = {
  transformation: 'https://useatlascore.com/start?ref=story&card=transformation',
  milestone: 'https://useatlascore.com/start?ref=story&card=milestone',
  streak: 'https://useatlascore.com/start?ref=story&card=streak',
  workout: 'https://useatlascore.com/start?ref=story&card=workout',
  nutrition: 'https://useatlascore.com/start?ref=story&card=nutrition',
  achievement: 'https://useatlascore.com/start?ref=story&card=achievement',
};

// Gradient backgrounds for different card types
const CARD_GRADIENTS = {
  transformation: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  milestone: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  streak: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  workout: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  nutrition: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  achievement: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
};

export default function EnhancedShareModal({ open, onClose, userData }) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');
  const cardRef = useRef(null);

  if (!open) return null;

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Athlete';

  const templates = [
    {
      id: 'transformation',
      name: 'Transformation',
      icon: Trophy,
      description: 'Show off your progress',
      stats: [
        { label: 'Duration', value: '12 weeks' },
        { label: 'Weight loss', value: '8.5 kg' },
        { label: 'Muscle gain', value: '2.3 kg' },
        { label: 'Athlete', value: displayName.split(' ')[0] },
      ],
    },
    {
      id: 'milestone',
      name: 'Milestone',
      icon: Target,
      description: 'Celebrate achievements',
      stats: [
        { label: 'Workouts', value: '100' },
        { label: 'Streak', value: '30 days' },
        { label: 'Calories', value: '25,000' },
        { label: 'Athlete', value: displayName.split(' ')[0] },
      ],
    },
    {
      id: 'streak',
      name: 'Streak Master',
      icon: Flame,
      description: 'Show your consistency',
      stats: [
        { label: 'Current streak', value: '15 days' },
        { label: 'Longest streak', value: '45 days' },
        { label: 'This month', value: '22/30 days' },
        { label: 'Athlete', value: displayName.split(' ')[0] },
      ],
    },
    {
      id: 'workout',
      name: 'Workout Warrior',
      icon: Zap,
      description: 'Share training wins',
      stats: [
        { label: 'Today', value: '45 min' },
        { label: 'This week', value: '4 sessions' },
        { label: 'Calories burned', value: '1,850' },
        { label: 'Athlete', value: displayName.split(' ')[0] },
      ],
    },
    {
      id: 'nutrition',
      name: 'Nutrition Pro',
      icon: Star,
      description: 'Flex your diet game',
      stats: [
        { label: 'Calories', value: '2,150' },
        { label: 'Protein', value: '145g' },
        { label: 'Meals logged', value: '5' },
        { label: 'Athlete', value: displayName.split(' ')[0] },
      ],
    },
    {
      id: 'achievement',
      name: 'Achievement',
      icon: Sparkles,
      description: 'Show your wins',
      stats: [
        { label: 'Goal reached', value: 'Yes!' },
        { label: 'Days to goal', value: '60' },
        { label: 'Success rate', value: '92%' },
        { label: 'Athlete', value: displayName.split(' ')[0] },
      ],
    },
  ];

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
      console.error('[EnhancedShare] html2canvas failed:', err);
      return null;
    }
  }, []);

  const handleShare = useCallback(async (platform = 'native') => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const blob = await generateCardImage();
      const hook = VIRAL_HOOKS[selectedTemplate];
      const url = VIRAL_URLS[selectedTemplate];
      const text = customText || `${hook} 🏋️‍♂️ Track training, nutrition, and labs in one place.`;

      if (platform === 'instagram' && blob) {
        // Instagram Stories - share as image
        if (navigator.canShare?.({ files: [new File([blob], 'atlas.png', { type: 'image/png' })] })) {
          const file = new File([blob], `atlas-${selectedTemplate}.png`, { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: hook,
            text: `${text} ${url}`,
          });
        }
      } else if (platform === 'twitter') {
        // Twitter - open with pre-filled text
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} ${url}`)}`;
        window.open(twitterUrl, '_blank');
      } else if (platform === 'facebook') {
        // Facebook - share with link
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(fbUrl, '_blank');
      } else if (platform === 'native' && navigator.share) {
        // Native share
        if (blob && navigator.canShare?.({ files: [new File([blob], 'atlas.png', { type: 'image/png' })] })) {
          const file = new File([blob], `atlas-${selectedTemplate}.png`, { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: hook,
            text: `${text} ${url}`,
          });
        } else {
          await navigator.share({
            title: hook,
            text: text,
            url: url,
          });
        }
      } else {
        // Fallback: copy link
        await navigator.clipboard?.writeText(`${text} ${url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('[EnhancedShare] Share failed:', err);
      toast.error('Could not share. Try downloading instead.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, customText, generateCardImage]);

  const handleDownload = useCallback(async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const blob = await generateCardImage();
      if (!blob) {
        console.error('[EnhancedShare] Failed to generate card image');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-${selectedTemplate}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      toast.success('Image downloaded successfully!');
    } catch (err) {
      console.error('[EnhancedShare] Download failed:', err);
      toast.error('Download failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, generateCardImage]);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--border)/0.1)] bg-[hsl(var(--card))/0.95] backdrop-blur-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.6)] text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--fg))]">Share Your Progress</h2>
                <p className="text-sm text-[hsl(var(--fg-2))]">Create stunning cards to inspire others</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Template Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Choose Template</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">Select a template that best represents your achievement</p>
              </div>

              <div className="grid gap-3">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        selectedTemplate === template.id
                          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                          : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          selectedTemplate === template.id
                            ? 'bg-[hsl(var(--brand))] text-white'
                            : 'bg-[hsl(var(--shell))] text-[hsl(var(--brand))]'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[hsl(var(--fg))]">{template.name}</h4>
                          <p className="text-sm text-[hsl(var(--fg-2))]">{template.description}</p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--fg))]">Custom Message (Optional)</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Add a personal touch to your share..."
                  className="w-full rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--shell))] px-4 py-3 text-sm text-[hsl(var(--fg))] placeholder-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))/0.2]"
                  rows={3}
                />
              </div>
            </div>

            {/* Right: Preview & Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Preview</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">This is how your card will look</p>
              </div>

              {selectedTemplateData ? (
                <div className="space-y-4">
                  {/* Card Preview */}
                  <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border)/0.2)] shadow-xl">
                    <div
                      ref={cardRef}
                      style={{
                        background: CARD_GRADIENTS[selectedTemplate],
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '16px',
                        padding: '24px',
                        color: '#fff',
                        minHeight: '320px',
                      }}
                    >
                      {/* Decorative elements */}
                      <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                      <div style={{ position: 'absolute', left: '-10px', bottom: '20px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

                      <div style={{ position: 'relative' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>
                          atlas.core
                        </p>
                        <h3 style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.04em' }}>
                          {selectedTemplateData.name} · {displayName.split(' ')[0]}
                        </h3>

                        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {selectedTemplateData.stats.map((stat, index) => (
                            <div key={index} style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.15)', padding: '12px' }}>
                              <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.8)' }}>
                                {stat.label}
                              </p>
                              <p style={{ marginTop: '4px', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.04em' }}>{stat.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Viral CTA */}
                        <div style={{ marginTop: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', padding: '12px 16px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '-0.01em' }}>
                            {VIRAL_HOOKS[selectedTemplate]}
                          </p>
                          <p style={{ marginTop: '2px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                            useatlascore.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Actions */}
                  <div className="space-y-3">
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
                        Instagram Story
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
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))] disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download
                      </button>
                    </div>

                    <button
                      onClick={() => handleShare('native')}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                      Share with Native App
                    </button>
                  </div>

                  {/* Viral hint */}
                  <div className="rounded-xl bg-[hsl(var(--brand)/0.05)] border border-[hsl(var(--brand)/0.2)] p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-[hsl(var(--brand))] mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--fg))]">Pro Tip</p>
                        <p className="text-xs text-[hsl(var(--fg-2))] mt-1">
                          Your card includes a referral link. When friends join through your share, you'll get recognition as a community leader!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--shell))] p-12 text-center">
                  <Camera className="h-12 w-12 text-[hsl(var(--fg-3))]" />
                  <p className="mt-4 text-lg font-semibold text-[hsl(var(--fg))]">No Template Selected</p>
                  <p className="mt-2 text-sm text-[hsl(var(--fg-2))]">Choose a template on the left to preview your share card</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
