import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import {
  Camera,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ZoomIn,
  X,
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
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────
// Poses padrão para acompanhamento corporal
// ─────────────────────────────────────────────────────────────────

const POSES = [
  { key: 'front',      label: 'Frente',      hint: 'Braços ao lado, olhando para a câmera' },
  { key: 'side',       label: 'Lateral',     hint: 'Perfil direito, braços soltos' },
  { key: 'back',       label: 'Costas',      hint: 'De costas para a câmera, braços ao lado' },
  { key: 'pose',       label: 'Pose livre',  hint: 'Pose de sua escolha para comparação' },
];

// ─────────────────────────────────────────────────────────────────
// Formata data legível
// ─────────────────────────────────────────────────────────────────

function formatCheckpointDate(dateStr) {
  const dt = new Date(dateStr + 'T12:00:00');
  const weekday = dt.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = dt.getDate();
  const month = dt.toLocaleDateString('pt-BR', { month: 'long' });
  const year = dt.getFullYear();
  const today = getToday();
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const label = `${capitalized}, ${day} de ${month} de ${year}`;
  return { label, isToday: dateStr === today };
}

// ─────────────────────────────────────────────────────────────────
// Slot de pose individual
// ─────────────────────────────────────────────────────────────────

function PoseSlot({ pose, photo, onUpload, onDelete, uploading }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Rótulo da pose */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {pose.label}
      </p>

      {/* Área da foto */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)]">
        {photo?.photo_url ? (
          <>
            <img
              src={photo.photo_url}
              alt={pose.label}
              className="h-full w-full object-cover"
            />
            {/* Overlay com ações */}
            <div className="absolute inset-0 flex flex-col items-end justify-start gap-2 bg-gradient-to-b from-black/30 to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--err)/0.88)] text-white shadow"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </>
        ) : (
          /* Placeholder de upload */
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
                <p className="text-[11px] font-medium opacity-60">Adicionar foto</p>
              </>
            )}
          </button>
        )}

        {/* Input oculto */}
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
// Card de checkpoint (agrupamento por data)
// ─────────────────────────────────────────────────────────────────

function CheckpointCard({ date, photos, onUpload, onDelete, uploadingPose }) {
  const [expanded, setExpanded] = useState(true);
  const { label, isToday } = formatCheckpointDate(date);
  const filledCount = photos.filter((p) => p?.photo_url).length;

  return (
    <Card className="overflow-hidden px-0 py-0">
      {/* Cabeçalho do checkpoint */}
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
                  Hoje
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">
              {filledCount} de {POSES.length} poses preenchidas
            </p>
          </div>
        </div>

        {/* Miniaturas + expand */}
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

      {/* Grid de poses */}
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
          Fotos
        </p>
        <h2 className="mt-2 text-[1.25rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
          Novo checkpoint
        </h2>
        <p className="mt-1.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          Selecione a data do registro fotográfico. Você poderá adicionar as fotos em cada pose depois.
        </p>

        <div className="mt-5">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))] mb-2">
            Data do checkpoint
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
            Cancelar
          </button>
          <PrimaryButton
            type="button"
            onClick={() => onConfirm(date)}
            className="flex-1"
          >
            Criar checkpoint
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────

export default function ProgressPhotos() {
  return (
    <SafePageBoundary
      title="Fotos de Progresso"
      subtitle="Modo seguro da página de fotos."
      fallbackDescription="A página de fotos carregou em modo de segurança."
    >
      <ProgressPhotosContent />
    </SafePageBoundary>
  );
}

function ProgressPhotosContent() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
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
    queryKey: ['progress-photos-page'],
    queryFn: () => base44.entities.ProgressPhoto.list('-date', 200),
  });

  // ── Mutações ────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProgressPhoto.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress-photos-page'] });
      setNotice({ tone: 'success', message: 'Foto removida.' });
    },
    onError: () => setNotice({ tone: 'error', message: 'Erro ao remover a foto.' }),
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
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.ProgressPhoto.create({
          photo_url: file_url,
          date,
          category: poseKey,
        });
        qc.invalidateQueries({ queryKey: ['progress-photos-page'] });
        setNotice({ tone: 'success', message: 'Foto salva com sucesso.' });
      } catch {
        setNotice({ tone: 'error', message: 'Erro ao fazer upload da foto. Tente novamente.' });
      } finally {
        setUploadingPose(null);
      }
    },
    [qc]
  );

  const handleDelete = useCallback(
    (id) => {
      if (!window.confirm('Remover esta foto do checkpoint?')) return;
      deleteMutation.mutate(id);
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

  // ── Render ─────────────────────────────────────────────────────

  return (
    <AppContainer>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Fotos"
        title="Fotos de Progresso"
        subtitle="Registre checkpoints fotográficos nas poses padrão para visualizar a evolução do seu corpo ao longo do tempo."
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--brand)/0.02)]"
        actions={
          <PrimaryButton
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            Novo checkpoint
          </PrimaryButton>
        }
      >
        {/* Resumo rápido */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
            <p className="atlas-metric-label">Checkpoints</p>
            <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {allDates.length > 0 ? `${allDates.length} registro(s)` : '—'}
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {allDates.length > 0
                ? 'Clique em "Novo checkpoint" para adicionar mais.'
                : 'Adicione o primeiro checkpoint fotográfico.'}
            </p>
          </div>
          <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
            <p className="atlas-metric-label">Fotos registradas</p>
            <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {allPhotos.length > 0 ? `${allPhotos.length} foto(s)` : '—'}
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {`${POSES.length} poses por checkpoint: ${POSES.map((p) => p.label).join(', ')}.`}
            </p>
          </div>
        </div>
      </PageHeader>

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

      {/* ── Instruções de pose ───────────────────────────────────── */}
      <Section
        eyebrow="Guia"
        title="Como registrar"
        subtitle="Siga as poses padrão para garantir comparações consistentes entre checkpoints."
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
        eyebrow="Fotos"
        title={allDates.length > 0 ? `Checkpoints · ${allDates.length}` : 'Checkpoints'}
        subtitle="Cada checkpoint agrupa as 4 poses padrão para a data selecionada."
        actions={
          <PrimaryButton
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            Novo
          </PrimaryButton>
        }
      >
        {allDates.length === 0 ? (
          <Card className="px-5 py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[26px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)]">
                <Camera className="h-6 w-6 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                  Nenhum checkpoint ainda
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  Crie o primeiro checkpoint para começar a registrar sua evolução visual.
                </p>
              </div>
              <PrimaryButton
                type="button"
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Criar primeiro checkpoint
              </PrimaryButton>
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
    </AppContainer>
  );
}
