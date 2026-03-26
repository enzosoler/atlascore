import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';
import {
  Camera,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  X,
  Lock,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  Eye,
  BarChart3,
  Info,
} from 'lucide-react';
import { getToday } from '@/lib/atlas-theme';
import {
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  PrimaryButton,
  SafePageBoundary,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createProgressPhoto,
  deleteProgressPhoto,
  listProgressPhotos,
  uploadProgressPhoto,
} from '@/services/bodyProgressService';
import { useI18n } from '@/lib/i18nContext';

// Standard poses for physique tracking
const POSES = [
  { key: 'front', label: 'Front', hint: 'Arms to sides, looking at camera' },
  { key: 'side', label: 'Side', hint: 'Right profile, arms relaxed' },
  { key: 'back', label: 'Back', hint: 'Back to camera, arms at sides' },
  { key: 'pose', label: 'Free pose', hint: 'Pose of your choice for comparison' },
];

// AI-generated insights mock
const MOCK_INSIGHTS = [
  { type: 'positive', bodyPart: 'Waist', change: 'looks leaner' },
  { type: 'positive', bodyPart: 'Shoulders', change: 'more defined' },
  { type: 'neutral', bodyPart: 'Lower body', change: 'unchanged' },
  { type: 'positive', bodyPart: 'Overall', change: 'posture improved' },
];

function formatCheckpointDate(dateStr, locale = 'en-US') {
  const dt = new Date(dateStr + 'T12:00:00');
  const today = getToday();
  const label = dt.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return { label, isToday: dateStr === today };
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

// Visual Preview Component
function VisualPreview() {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[hsl(var(--brand)/0.08)] via-[hsl(var(--brand)/0.03)] to-[hsl(var(--brand)/0.01)] p-6">
      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">
            Your Future Checkpoints
          </span>
        </div>
        <p className="mt-2 text-[13px] font-medium text-[hsl(var(--fg))]">
          This is what your progress will look like
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))]">
            <div className="aspect-[3/4] bg-gradient-to-b from-[hsl(var(--fill)/0.6)] to-[hsl(var(--fill)/0.3)]" />
            <div className="px-3 py-2">
              <p className="text-[11px] font-semibold text-[hsl(var(--fg-2))]">Before</p>
              <p className="text-[10px] text-[hsl(var(--fg-3))]">Month 1</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--card))] ring-1 ring-[hsl(var(--brand)/0.1)]">
            <div className="aspect-[3/4] bg-gradient-to-br from-[hsl(var(--brand)/0.15)] to-[hsl(var(--brand)/0.05)]">
              <div className="flex h-full items-center justify-center">
                <TrendingUp className="h-8 w-8 text-[hsl(var(--brand)/0.5)]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-[11px] font-semibold text-[hsl(var(--brand))]">After</p>
              <p className="text-[10px] text-[hsl(var(--fg-3))]">Month 3</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[hsl(var(--fg-2))]">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)]">
            <TrendingUp className="h-3 w-3 text-[hsl(var(--success))]" strokeWidth={2} />
          </div>
          <span>Side-by-side comparisons</span>
          <span className="text-[hsl(var(--fg-3))]">·</span>
          <span>AI-powered insights</span>
          <span className="text-[hsl(var(--fg-3))]">·</span>
          <span>Visual timeline</span>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateCheckpoint, isAtLimit }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[hsl(var(--border)/0.6)] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--fill)/0.3)] p-8 text-center">
        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[hsl(var(--brand)/0.2)] to-[hsl(var(--brand)/0.05)] ring-1 ring-[hsl(var(--brand)/0.2)]">
            <Camera className="h-9 w-9 text-[hsl(var(--brand))]" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 text-[1.375rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            Start your visual timeline
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-[14px] leading-6 text-[hsl(var(--fg-2))]">
            Take your first checkpoint to track real change over time. The scale lies — photos do not.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {POSES.map((pose, i) => (
              <div key={pose.key} className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.3)]">
                  <span className="text-[13px] font-semibold text-[hsl(var(--fg-3))]">{i + 1}</span>
                </div>
                <span className="text-[9px] font-medium uppercase tracking-wide text-[hsl(var(--fg-3))]">{pose.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            {isAtLimit ? (
              <div className="space-y-3">
                <p className="text-[13px] text-[hsl(var(--fg-2))]">Free plan: 5 checkpoints limit reached</p>
                <Link to="/pricing" className="inline-block">
                  <Button className="gap-2">
                    <Lock className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            ) : (
              <PrimaryButton type="button" onClick={onCreateCheckpoint} className="inline-flex items-center gap-2 px-6">
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Create first checkpoint
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
      <VisualPreview />
    </div>
  );
}

// AI Insights Component
function AIInsights({ checkpoints, insights = MOCK_INSIGHTS }) {
  if (checkpoints.length < 2) return null;
  const latest = checkpoints[0];
  const previous = checkpoints[1];
  const daysDiff = daysBetween(previous, latest);

  const formatRelativeDateSafe = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="overflow-hidden border-[hsl(var(--brand)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.06)] to-[hsl(var(--brand)/0.02)]">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">AI Analysis</span>
        </div>
        <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
          Comparing checkpoint {formatRelativeDateSafe(latest)} with {formatRelativeDateSafe(previous)}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-[hsl(var(--card)/0.8)] px-3 py-2">
              <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', insight.type === 'positive' && 'bg-[hsl(var(--success)/0.15)]', insight.type === 'neutral' && 'bg-[hsl(var(--warning)/0.15)]')}>
                {insight.type === 'positive' && <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" strokeWidth={2} />}
                {insight.type === 'neutral' && <Info className="h-3.5 w-3.5 text-[hsl(var(--warning))]" strokeWidth={2} />}
              </div>
              <p className="text-[12px] text-[hsl(var(--fg))]">
                <span className="font-semibold">{insight.bodyPart}</span>
                <span className="text-[hsl(var(--fg-2))]"> {insight.change}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-[hsl(var(--fg-3))]">
          <Clock className="h-3 w-3" strokeWidth={2} />
          <span>{daysDiff} days between checkpoints</span>
        </div>
      </div>
    </Card>
  );
}

// Consistency Component
function ConsistencyIndicator({ checkpoints }) {
  if (checkpoints.length === 0) return null;
  const latest = checkpoints[0];
  const daysSince = daysBetween(latest, getToday());
  const isRecent = daysSince <= 7;
  const isWarning = daysSince > 14 && daysSince <= 21;
  const isOverdue = daysSince > 21;

  let message = '';
  let tone = 'neutral';
  if (isRecent) {
    message = daysSince === 0 ? 'Checkpoint today — great consistency!' : `Last checkpoint: ${daysSince} days ago — stay consistent!`;
    tone = 'success';
  } else if (isWarning) {
    message = `Last checkpoint: ${daysSince} days ago — aim for weekly photos`;
    tone = 'warning';
  } else if (isOverdue) {
    message = `Last checkpoint: ${daysSince} days ago — time for an update`;
    tone = 'urgent';
  } else {
    message = `Last checkpoint: ${daysSince} days ago`;
  }

  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3', tone === 'success' && 'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.06)]', tone === 'warning' && 'border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.06)]', tone === 'urgent' && 'border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.06)]', tone === 'neutral' && 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)]')}>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone === 'success' && 'bg-[hsl(var(--success)/0.15)]', tone === 'warning' && 'bg-[hsl(var(--warning)/0.15)]', tone === 'urgent' && 'bg-[hsl(var(--err)/0.15)]', tone === 'neutral' && 'bg-[hsl(var(--fill)/0.6)]')}>
        <Calendar className={cn('h-5 w-5', tone === 'success' && 'text-[hsl(var(--success))]', tone === 'warning' && 'text-[hsl(var(--warning))]', tone === 'urgent' && 'text-[hsl(var(--err))]', tone === 'neutral' && 'text-[hsl(var(--fg-2))]')} strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className={cn('text-[13px] font-medium', tone === 'success' && 'text-[hsl(var(--success))]', tone === 'warning' && 'text-[hsl(var(--warning))]', tone === 'urgent' && 'text-[hsl(var(--err))]')}>{message}</p>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''} total</p>
      </div>
    </div>
  );
}

// Comparison Slider
function ComparisonSlider({ beforePhoto, afterPhoto, beforeDate, afterDate }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
    setSliderPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  }, []);

  const handleStart = useCallback(() => {
    const handleMoveWrapper = (e) => handleMove(e);
    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMoveWrapper);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMoveWrapper);
      document.removeEventListener('touchend', handleEnd);
    };
    document.addEventListener('mousemove', handleMoveWrapper);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMoveWrapper);
    document.addEventListener('touchend', handleEnd);
  }, [handleMove]);

  if (!beforePhoto?.photo_url || !afterPhoto?.photo_url) return null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">Visual Comparison</span>
          </div>
          <span className="text-[11px] text-[hsl(var(--fg-3))]">Drag to compare</span>
        </div>
      </div>
      <div ref={containerRef} className="relative aspect-[4/3] cursor-ew-resize select-none overflow-hidden" onMouseDown={handleStart} onTouchStart={handleStart}>
        <img src={afterPhoto.photo_url} alt="After" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
          <img src={beforePhoto.photo_url} alt="Before" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        </div>
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
            <ChevronRight className="h-4 w-4 -translate-x-0.5 text-[hsl(var(--fg))]" strokeWidth={2} />
            <ChevronRight className="h-4 w-4 -translate-x-2 rotate-180 text-[hsl(var(--fg))]" strokeWidth={2} />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">Before · {beforeDate}</div>
        <div className="absolute bottom-4 right-4 rounded-full bg-[hsl(var(--brand)/0.9)] px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">After · {afterDate}</div>
      </div>
    </Card>
  );
}

// Timeline Component
function Timeline({ checkpoints, photosByDate, onSelect }) {
  if (checkpoints.length === 0) return null;
  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">Checkpoint Timeline</span>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border)/0.5)] px-5 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {checkpoints.map((date, index) => {
            const photos = photosByDate(date);
            const firstPhoto = photos.find(p => p?.photo_url);
            const { label } = formatCheckpointDate(date);
            return (
              <button key={date} onClick={() => onSelect(date)} className="group flex shrink-0 flex-col items-center gap-2">
                <div className={cn('relative h-16 w-16 overflow-hidden rounded-xl border transition-all', firstPhoto?.photo_url ? 'border-[hsl(var(--border)/0.5)]' : 'border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.4)]', index === 0 && 'ring-2 ring-[hsl(var(--brand))]')}>
                  {firstPhoto?.photo_url ? (
                    <img src={firstPhoto.photo_url} alt={label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="h-5 w-5 text-[hsl(var(--fg-3))]" strokeWidth={1.5} />
                    </div>
                  )}
                  {index === 0 && <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-[8px] font-bold text-white">L</div>}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-medium text-[hsl(var(--fg))]">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-[9px] text-[hsl(var(--fg-3))]">#{checkpoints.length - index}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// Pose Slot
function PoseSlot({ pose, photo, onUpload, onDelete, uploading }) {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{pose.label}</p>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)]">
        {photo?.photo_url ? (
          <>
            <img src={photo.photo_url} alt={pose.label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-end justify-start gap-2 bg-gradient-to-b from-black/30 to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
              <button type="button" onClick={() => onDelete(photo)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--err)/0.88)] text-white shadow">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="flex h-full w-full flex-col items-center justify-center gap-2 text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill)/0.8)] disabled:cursor-wait">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={1.9} /> : <><Camera className="h-6 w-6 opacity-40" strokeWidth={1.5} /><p className="text-[11px] font-medium opacity-60">Add photo</p></>}
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(pose.key, file); e.target.value = ''; }} />
      </div>
      {!photo?.photo_url && <p className="text-center text-[10px] leading-4 text-[hsl(var(--fg-3))]">{pose.hint}</p>}
    </div>
  );
}

// Checkpoint Card
function CheckpointCard({ date, photos, onUpload, onDelete, uploadingPose, isLatest }) {
  const { locale } = useI18n();
  const [expanded, setExpanded] = useState(isLatest);
  const { label, isToday } = formatCheckpointDate(date, locale);
  const filledCount = photos.filter((p) => p?.photo_url).length;

  return (
    <Card className="overflow-hidden px-0 py-0">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[hsl(var(--fill)/0.4)]">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border', isLatest ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.1)]' : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.6)]')}>
            <Camera className={cn('h-4 w-4', isLatest ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-2))]')} strokeWidth={1.9} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">{label}</p>
              {isToday && <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand)/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--brand))]">Today</span>}
              {isLatest && !isToday && <span className="inline-flex items-center rounded-full bg-[hsl(var(--success)/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--success))]">Latest</span>}
            </div>
            <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">{filledCount} of {POSES.length} poses filled</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden gap-1 sm:flex">
            {photos.map((photo, i) => (
              <div key={i} className={cn('h-8 w-8 overflow-hidden rounded-lg border', photo?.photo_url ? 'border-[hsl(var(--border)/0.5)]' : 'border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.4)]')}>
                {photo?.photo_url && <img src={photo.photo_url} alt="" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} /> : <ChevronDown className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-[hsl(var(--border)/0.5)] px-5 py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {POSES.map((pose, i) => (
              <PoseSlot key={pose.key} pose={pose} photo={photos[i] || null} onUpload={(poseKey, file) => onUpload(date, poseKey, file)} onDelete={onDelete} uploading={uploadingPose === `${date}-${pose.key}`} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Guide Section
function GuideSection() {
  const { locale } = useI18n();
  const isPt = locale === 'pt-BR';
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)]">
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} />
          <span className="text-[13px] font-medium text-[hsl(var(--fg))]">{isPt ? 'Como registrar fotos' : 'How to record photos'}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} /> : <ChevronDown className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} />}
      </button>
      {expanded && (
        <div className="border-t border-[hsl(var(--border)/0.4)] px-5 py-4">
          <p className="mb-3 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{isPt ? 'Siga as poses padrão para garantir comparações consistentes entre checkpoints.' : 'Follow the standard poses to ensure consistent comparisons between checkpoints.'}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {POSES.map((pose, i) => (
              <div key={pose.key} className="flex items-start gap-3 rounded-[14px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] px-3 py-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[10px] font-bold text-[hsl(var(--brand))]">{i + 1}</div>
                <div>
                  <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">{pose.label}</p>
                  <p className="text-[11px] leading-4 text-[hsl(var(--fg-2))]">{pose.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// New Checkpoint Modal
function NewCheckpointModal({ onConfirm, onClose }) {
  const [date, setDate] = useState(getToday());
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-[28px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-6 pb-8 pt-6 shadow-[var(--shadow-lg)] sm:rounded-[28px]">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.8)]">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">New Checkpoint</p>
        <h2 className="mt-2 text-[1.25rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">Record your progress</h2>
        <p className="mt-1.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">Select the date for your checkpoint. You will then add photos for all 4 poses.</p>
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Checkpoint date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="atlas-input w-full" />
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="atlas-button atlas-button-secondary flex-1">Cancel</button>
          <PrimaryButton type="button" onClick={() => onConfirm(date)} className="flex-1">Create checkpoint</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// Main page
export default function ProgressPhotos({ embedded = false, photos: propPhotos }) {
  const { locale } = useI18n();
  const isPt = locale === 'pt-BR';
  if (embedded) {
    return <ProgressPhotosContent embedded photos={propPhotos} />;
  }
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  if (!isLoadingAuth && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <h2 className="text-[1.75rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">{isPt ? 'Veja o que a balança não mostra' : "See what the scale can't show"}</h2>
        <p className="mt-3 max-w-md text-center text-[15px] leading-7 text-[hsl(var(--fg-2))]">{isPt ? 'Acompanhe sua evolução visual e compare seu corpo ao longo do tempo.' : 'Track your visual progress and compare your body over time.'}</p>
        <PrimaryButton type="button" onClick={() => navigate(ROUTES.auth)} className="mt-6 inline-flex items-center gap-2">
          <Lock className="h-4 w-4" strokeWidth={1.9} />
          {isPt ? 'Entrar para começar' : 'Sign in to start'}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <SafePageBoundary title={isPt ? "Fotos de Progresso" : "Progress Photos"} subtitle="Photos page safe mode." fallbackDescription="The photos page loaded in safe mode.">
      <ProgressPhotosContent photos={propPhotos} />
    </SafePageBoundary>
  );
}

function ProgressPhotosContent({ embedded = false, photos: propPhotos }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const { subscription } = useSubscription();
  const { locale } = useI18n();
  const isPt = locale === 'pt-BR';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showNewModal, setShowNewModal] = useState(false);
  const [checkpointDates, setCheckpointDates] = useState([]);
  const [uploadingPose, setUploadingPose] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && embedded) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate, embedded]);

  const { data: allPhotos = [] } = useQuery({
    queryKey: ['progress-photos-page', user?.id],
    queryFn: () => listProgressPhotos(user.id, 200),
    enabled: !!user?.id && isAuthenticated && !propPhotos,
  });

  const photos = propPhotos || allPhotos;

  const deleteMutation = useMutation({
    mutationFn: ({ id, photoUrl }) => isAuthenticated ? deleteProgressPhoto(user.id, id, photoUrl) : Promise.reject(new Error('Not authenticated')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress-photos-page', user?.id] });
      qc.invalidateQueries({ queryKey: ['progress-photos', user?.id] });
      setNotice({ tone: 'success', message: 'Photo removed.' });
    },
    onError: () => setNotice({ tone: 'error', message: 'Error removing photo.' }),
  });

  const handleCreateCheckpoint = (date) => {
    setCheckpointDates((prev) => {
      if (prev.includes(date)) return prev;
      return [date, ...prev].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    });
    setShowNewModal(false);
  };

  const handleUpload = useCallback(async (date, poseKey, file) => {
    if (!isAuthenticated || !user?.id) {
      setNotice({ tone: 'error', message: 'Please sign in to upload photos.' });
      navigate(ROUTES.auth);
      return;
    }
    const key = `${date}-${poseKey}`;
    setUploadingPose(key);
    try {
      const photoUrl = await uploadProgressPhoto(user.id, file);
      await createProgressPhoto(user.id, { photo_url: photoUrl, date, category: poseKey });
      qc.invalidateQueries({ queryKey: ['progress-photos-page', user?.id] });
      qc.invalidateQueries({ queryKey: ['progress-photos', user?.id] });
      setNotice({ tone: 'success', message: 'Photo saved successfully.' });
    } catch (error) {
      setNotice({ tone: 'error', message: error?.message || 'Error uploading photo. Please try again.' });
    } finally {
      setUploadingPose(null);
    }
  }, [qc, user?.id, isAuthenticated, navigate]);

  const handleDelete = useCallback((photo) => {
    if (!window.confirm('Remove this photo from the checkpoint?')) return;
    deleteMutation.mutate({ id: photo.id, photoUrl: photo.photo_url });
  }, [deleteMutation]);

  const photosByDate = useCallback((date) => {
    return POSES.map((pose) => allPhotos.find((p) => p.date === date && p.category === pose.key) || null);
  }, [allPhotos]);

  const savedDates = [...new Set(photos.map((p) => p.date).filter(Boolean))];
  const allDates = [...new Set([...checkpointDates, ...savedDates])].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const planCode = subscription?.plan_code || 'free';
  const FREE_PHOTO_LIMIT = 5;
  const isAtLimit = planCode === 'free' && allDates.length >= FREE_PHOTO_LIMIT;

  const comparisonData = useMemo(() => {
    if (allDates.length < 2) return null;
    const latest = allDates[0];
    const earliest = allDates[allDates.length - 1];
    return {
      before: photosByDate(earliest)[0],
      after: photosByDate(latest)[0],
      beforeDate: earliest,
      afterDate: latest,
    };
  }, [allDates, photosByDate]);

  const hasCheckpoints = allDates.length > 0;
  const showComparison = comparisonData?.before?.photo_url && comparisonData?.after?.photo_url;

  const pageBody = (
    <>
      {!embedded ? (
        <PageHeader
          eyebrow={isPt ? 'Progresso Visual' : 'Visual Progress'}
          title={isPt ? 'Veja o que a balança não mostra' : "See what the scale can't show"}
          subtitle={isPt ? 'Acompanhe sua evolução visual e compare seu corpo ao longo do tempo.' : 'Track your visual progress and compare your body over time.'}
          accentClassName="from-[hsl(var(--brand)/0.08)] via-[hsl(var(--brand)/0.03)] to-transparent"
          actions={hasCheckpoints && !isAtLimit ? (
            <PrimaryButton type="button" onClick={() => setShowNewModal(true)} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              {isPt ? 'Novo checkpoint' : 'New checkpoint'}
            </PrimaryButton>
          ) : isAtLimit ? (
            <div className="space-y-2 text-left sm:text-right">
              <p className="text-xs text-[hsl(var(--fg-3))]">Limit reached (5 checkpoints)</p>
              <Link to="/pricing">
                <Button size="sm" className="gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          ) : null}
        >
          {hasCheckpoints && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="px-4 py-4">
                <p className="atlas-metric-label">Checkpoints</p>
                <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{allDates.length}</p>
              </Card>
              <Card className="px-4 py-4">
                <p className="atlas-metric-label">Photos</p>
                <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{photos.length}</p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">of {allDates.length * 4} possible</p>
              </Card>
              <Card className="px-4 py-4">
                <p className="atlas-metric-label">Time tracked</p>
                <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{allDates.length >= 2 ? `${daysBetween(allDates[allDates.length - 1], allDates[0])} days` : '—'}</p>
              </Card>
            </div>
          )}
        </PageHeader>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="atlas-overline">{isPt ? 'Progresso Visual' : 'Visual Progress'}</p>
            <h2 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">{isPt ? 'Veja o que a balança não mostra' : "See what the scale can't show"}</h2>
            <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">{isPt ? 'Acompanhe sua evolução visual e compare seu corpo ao longo do tempo.' : 'Track your visual progress and compare your body over time.'}</p>
          </div>
          {!isAtLimit && (
            <PrimaryButton type="button" onClick={() => setShowNewModal(true)} className="inline-flex items-center gap-2 self-start">
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              {isPt ? 'Novo checkpoint' : 'New checkpoint'}
            </PrimaryButton>
          )}
        </div>
      )}

      {notice?.message && (
        <div className={cn('atlas-banner px-4 py-3 text-sm leading-6', notice.tone === 'error' && 'border-[hsl(var(--err)/0.25)] bg-[hsl(var(--err)/0.06)]', notice.tone === 'success' && 'border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.06)]')}>
          {notice.message}
        </div>
      )}

      {!hasCheckpoints && (
        <Section>
          <EmptyState onCreateCheckpoint={() => setShowNewModal(true)} isAtLimit={isAtLimit} />
        </Section>
      )}

      {hasCheckpoints && (
        <>
          <Section><ConsistencyIndicator checkpoints={allDates} /></Section>
          {allDates.length >= 2 && <Section><AIInsights checkpoints={allDates} /></Section>}
          {showComparison && (
            <Section>
              <ComparisonSlider
                beforePhoto={comparisonData.before}
                afterPhoto={comparisonData.after}
                beforeDate={new Date(comparisonData.beforeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                afterDate={new Date(comparisonData.afterDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
            </Section>
          )}
          <Section><Timeline checkpoints={allDates} photosByDate={photosByDate} onSelect={setSelectedDate} /></Section>
          <Section
            eyebrow={isPt ? 'Checkpoints' : 'Checkpoints'}
            title={isPt ? 'Seus registros' : 'Your records'}
            subtitle={isPt ? 'Cada checkpoint agrupa as 4 poses padrão para a data selecionada.' : 'Each checkpoint groups the 4 standard poses for the selected date.'}
            actions={!isAtLimit ? <PrimaryButton type="button" onClick={() => setShowNewModal(true)} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" strokeWidth={1.9} />{isPt ? 'Novo' : 'New'}</PrimaryButton> : null}
          >
            <div className="space-y-4">
              {allDates.map((date, index) => (
                <CheckpointCard key={date} date={date} photos={photosByDate(date)} onUpload={handleUpload} onDelete={handleDelete} uploadingPose={uploadingPose} isLatest={index === 0} />
              ))}
            </div>
          </Section>
          {allDates.length === 1 && <Section><VisualPreview /></Section>}
        </>
      )}

      <Section><GuideSection /></Section>

      {showNewModal && <NewCheckpointModal onConfirm={handleCreateCheckpoint} onClose={() => setShowNewModal(false)} />}
    </>
  );

  return embedded ? <div className="space-y-7">{pageBody}</div> : <AppContainer>{pageBody}</AppContainer>;
}
