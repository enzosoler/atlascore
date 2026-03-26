import React, { useState, useRef, useCallback } from 'react';
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
  Loader2,
  X,
  Lock,
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

// ─────────────────────────────────────────────────────────────────
// Standard poses for physique tracking
// ─────────────────────────────────────────────────────────────────

const POSES = [
  { key: 'front',      label: 'Front',      hint: 'Arms to sides, looking at camera' },
  { key: 'side',       label: 'Side',       hint: 'Right profile, arms relaxed' },
  { key: 'back',       label: 'Back',       hint: 'Back to camera, arms at sides' },
  { key: 'pose',       label: 'Free pose',  hint: 'Pose of your choice for comparison' },
];

// ─────────────────────────────────────────────────────────────────
// Formats a readable date label
// ─────────────────────────────────────────────────────────────────

function formatCheckpointDate(dateStr, locale = 'en-US') {
  const dt = new Date(dateStr + 'T12:00:00');
  const today = getToday();
  const label = dt.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return { label, isToday: dateStr === today };
}

// ─────────────────────────────────────────────────────────────────
// Individual pose slot
// ─────────────────────────────────────────────────────────────────

function PoseSlot({ pose, photo, onUpload, onDelete, uploading }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Pose label */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {pose.label}
      </p>

      {/* Photo area */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)]">
        {photo?.photo_url ? (
          <>
            <img
              src={photo.photo_url}
              alt={pose.label}
              className="h-full w-full object-cover"
            />
            {/* Action overlay */}
            <div className="absolute inset-0 flex flex-col items-end justify-start gap-2 bg-gradient-to-b from-black/30 to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={() => onDelete(photo)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--err)/0.88)] text-white shadow"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </>
        ) : (
          /* Upload placeholder */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill)/0.8)] disabled:cursor-wait"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={1.9} />
            ) : (
              <>
                <Camera className="h-6 w-6 opacity-40" strokeWidth={1.5} />
                <p className="text-[11px] font-medium opacity-60">Add photo</p>
              </>
            )}
          </button>
        )}

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(pose.key, file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Hint */}
      {!photo?.photo_url && (
        <p className="text-center text-[10px] leading-4 text-[hsl(var(--fg-3))]">
          {pose.hint}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Checkpoint card (grouped by date)
// ─────────────────────────────────────────────────────────────────

function CheckpointCard({ date, photos, onUpload, onDelete, uploadingPose }) {
  const { locale } = useI18n();
  const [expanded, setExpanded] = useState(true);
  const { label, isToday } = formatCheckpointDate(date, locale);
  const filledCount = photos.filter((p) => p?.photo_url).length;

  return (
    <Card className="overflow-hidden px-0 py-0">
      {/* Checkpoint header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[hsl(var(--fill)/0.4)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.6)]">
            <Camera className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={1.9} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                {label}
              </p>
              {isToday && (
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand)/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--brand))]">
                  Today
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">
              {filledCount} of {POSES.length} poses filled
            </p>
          </div>
        </div>

        {/* Thumbnails + expand */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden gap-1 sm:flex">
            {photos.map((photo, i) => (
              <div
                key={i}
                className={cn(
                  'h-8 w-8 overflow-hidden rounded-lg border',
                  photo?.photo_url
                    ? 'border-[hsl(var(--border)/0.5)]'
                    : 'border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.4)]'
                )}
              >
                {photo?.photo_url && (
                  <img
                    src={photo.photo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4 text-[hsl(var(--fg-2))]" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* Pose grid */}
      {expanded && (
        <div className="border-t border-[hsl(var(--border)/0.5)] px-5 py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {POSES.map((pose, i) => (
              <PoseSlot
                key={pose.key}
                pose={pose}
                photo={photos[i] || null}
                onUpload={(poseKey, file) => onUpload(date, poseKey, file)}
                onDelete={onDelete}
                uploading={uploadingPose === `${date}-${pose.key}`}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// Modal de novo checkpoint
// ─────────────────────────────────────────────────────────────────

function NewCheckpointModal({ onConfirm, onClose }) {
  const [date, setDate] = useState(getToday());

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-t-[28px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-6 pb-8 pt-6 shadow-[var(--shadow-lg)] sm:rounded-[28px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.8)]"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
          Photos
        </p>
        <h2 className="mt-2 text-[1.25rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
          New checkpoint
        </h2>
        <p className="mt-1.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          Select the date for the photo record. You can add photos for each pose afterward.
        </p>

        <div className="mt-5">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))] mb-2">
            Checkpoint date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="atlas-input w-full"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="atlas-button atlas-button-secondary flex-1"
          >
            Cancel
          </button>
          <PrimaryButton
            type="button"
            onClick={() => onConfirm(date)}
            className="flex-1"
          >
            Create checkpoint
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────

export default function ProgressPhotos({ embedded = false }) {
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  if (embedded) {
    return <ProgressPhotosContent embedded />;
  }

  return (
    <SafePageBoundary
      title={isPt ? "Fotos de Progresso" : "Progress Photos"}
      subtitle="Photos page safe mode."
      fallbackDescription="The photos page loaded in safe mode."
    >
      <ProgressPhotosContent />
    </SafePageBoundary>
  );
}

function ProgressPhotosContent({ embedded = false }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const { subscription } = useSubscription();
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showNewModal, setShowNewModal] = useState(false);
  const [checkpointDates, setCheckpointDates] = useState([]);
  const [uploadingPose, setUploadingPose] = useState(null);
  const [notice, setNotice] = useState(null);

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // ── Query de fotos ──────────────────────────────────────────────

  // onSuccess was removed in TanStack Query v5 — derive saved dates from query data directly
  // (allDates computation below merges checkpointDates + savedDates from allPhotos on every render)
  const { data: allPhotos = [] } = useQuery({
    queryKey: ['progress-photos-page', user?.id],
    queryFn: () => listProgressPhotos(user.id, 200),
    enabled: !!user?.id,
  });

  // ── Mutations ───────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: ({ id, photoUrl }) => deleteProgressPhoto(user.id, id, photoUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress-photos-page', user?.id] });
      qc.invalidateQueries({ queryKey: ['progress-photos', user?.id] });
      setNotice({ tone: 'success', message: 'Photo removed.' });
    },
    onError: () => setNotice({ tone: 'error', message: 'Error removing photo.' }),
  });

  // ── Handlers ────────────────────────────────────────────────────

  const handleCreateCheckpoint = (date) => {
    setCheckpointDates((prev) => {
      if (prev.includes(date)) return prev;
      return [date, ...prev].sort((a, b) => new Date(b) - new Date(a));
    });
    setShowNewModal(false);
  };

  const handleUpload = useCallback(
    async (date, poseKey, file) => {
      const key = `${date}-${poseKey}`;
      setUploadingPose(key);
      try {
        const photoUrl = await uploadProgressPhoto(user.id, file);
        await createProgressPhoto(user.id, {
          photo_url: photoUrl,
          date,
          category: poseKey,
        });
        qc.invalidateQueries({ queryKey: ['progress-photos-page', user?.id] });
        qc.invalidateQueries({ queryKey: ['progress-photos', user?.id] });
        setNotice({ tone: 'success', message: 'Photo saved successfully.' });
      } catch (error) {
        setNotice({
          tone: 'error',
          message: error?.message || 'Error uploading photo. Please try again.',
        });
      } finally {
        setUploadingPose(null);
      }
    },
    [qc, user?.id]
  );

  const handleDelete = useCallback(
    (photo) => {
      if (!window.confirm('Remove this photo from the checkpoint?')) return;
      deleteMutation.mutate({ id: photo.id, photoUrl: photo.photo_url });
    },
    [deleteMutation]
  );

  // ── Agrupar fotos por data ──────────────────────────────────────

  const photosByDate = useCallback(
    (date) => {
      return POSES.map((pose) => {
        return allPhotos.find((p) => p.date === date && p.category === pose.key) || null;
      });
    },
    [allPhotos]
  );

  // Mescla datas salvas + datas locais
  const savedDates = [...new Set(allPhotos.map((p) => p.date).filter(Boolean))];
  const allDates = [...new Set([...checkpointDates, ...savedDates])].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Compute whether user can add more checkpoints
  const planCode = subscription?.plan_code || 'free';
  const FREE_PHOTO_LIMIT = 5; // 5 checkpoints
  const isAtLimit = planCode === 'free' && allDates.length >= FREE_PHOTO_LIMIT;

  // ── Render ─────────────────────────────────────────────────────

  const pageBody = (
    <>
      {!embedded ? (
        <PageHeader
        eyebrow="Photos"
        title={isPt ? "Fotos de Progresso" : "Progress Photos"}
        subtitle={isPt ? "Registre checkpoints fotográficos em poses padrão para acompanhar a evolução visual do seu corpo." : "Record photo checkpoints in standard poses to track your body's visual evolution over time."}
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--brand)/0.02)]"
        actions={
          isAtLimit ? (
            <div className="space-y-2 text-left sm:text-right">
              <p className="text-xs text-[hsl(var(--fg-3))]">Limit reached (5 checkpoints on Free plan)</p>
              <Button asChild size="sm" className="gap-1.5">
                <Link to="/pricing">
                  <Lock className="h-3.5 w-3.5" />
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          ) : (
            <PrimaryButton
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            New checkpoint
          </PrimaryButton>
          )}
      >
        {/* Quick summary */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="px-4 py-4">
            <p className="atlas-metric-label">Checkpoints</p>
            <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {allDates.length > 0 ? `${allDates.length} checkpoint(s)` : '—'}
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {allDates.length > 0
                ? isPt ? 'Clique em "Novo checkpoint" para adicionar mais.' : 'Click "New checkpoint" to add more.'
                : 'Add your first photo checkpoint.'}
            </p>
          </Card>
          <Card className="px-4 py-4">
            <p className="atlas-metric-label">Registered photos</p>
            <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {allPhotos.length > 0 ? `${allPhotos.length} photo(s)` : '—'}
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {`${POSES.length} poses per checkpoint: ${POSES.map((p) => p.label).join(', ')}.`}
            </p>
          </Card>
        </div>
      </PageHeader>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="atlas-overline">Photos</p>
            <h2 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              Private checkpoint gallery
            </h2>
            <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
              Capture consistent pose photos and keep them grouped by checkpoint date inside the Body hub.
            </p>
          </div>
          {!isAtLimit ? (
            <PrimaryButton
              type="button"
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 self-start"
            >
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              New checkpoint
            </PrimaryButton>
          ) : null}
        </div>
      )}

      {/* ── Notice banner ────────────────────────────────────────── */}
      {notice?.message && (
        <div
          className={cn(
            'atlas-banner px-4 py-3 text-sm leading-6',
            notice.tone === 'error' && 'border-[hsl(var(--err)/0.25)] bg-[hsl(var(--err)/0.06)]'
          )}
        >
          {notice.message}
        </div>
      )}

      {/* ── Pose instructions ────────────────────────────────────── */}
      <Section
        eyebrow="Guide"
        title={isPt ? "Como registrar" : "How to record"}
        subtitle={isPt ? "Siga as poses padrão para garantir comparações consistentes entre checkpoints." : "Follow the standard poses to ensure consistent comparisons between checkpoints."}
      >
        <Card className="px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {POSES.map((pose, i) => (
              <div
                key={pose.key}
                className="flex items-start gap-3 rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] px-4 py-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[11px] font-bold text-[hsl(var(--brand))]">
                  {i + 1}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{pose.label}</p>
                  <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{pose.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Checkpoints ─────────────────────────────────────────── */}
      <Section
        eyebrow="Photos"
        title={allDates.length > 0 ? `Checkpoints · ${allDates.length}` : 'Checkpoints'}
        subtitle={isPt ? "Cada checkpoint agrupa as 4 poses padrão para a data selecionada." : "Each checkpoint groups the 4 standard poses for the selected date."}
        actions={
          <PrimaryButton
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            New
          </PrimaryButton>
        }
      >
        {allDates.length === 0 ? (
          <Card className="px-5 py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[26px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)]">
                <Camera className="h-6 w-6 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                No checkpoints yet
              </p>
              <PrimaryButton
                type="button"
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Create first checkpoint
              </PrimaryButton>
              <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                Add your first photo checkpoint to start tracking your visual progress over time.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {allDates.map((date) => (
              <CheckpointCard
                key={date}
                date={date}
                photos={photosByDate(date)}
                onUpload={handleUpload}
                onDelete={handleDelete}
                uploadingPose={uploadingPose}
              />
            ))}
          </div>
        )}
      </Section>

      {/* ── Modal de novo checkpoint ─────────────────────────────── */}
      {showNewModal && (
        <NewCheckpointModal
          onConfirm={handleCreateCheckpoint}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </>
  );

  return embedded ? <div className="space-y-7">{pageBody}</div> : <AppContainer>{pageBody}</AppContainer>;
}
