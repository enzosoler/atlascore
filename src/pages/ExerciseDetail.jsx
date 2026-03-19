/**
 * ExerciseDetail — Full exercise detail page
 *
 * Data source: fetchExercise(id) from @/lib/exerciseDB
 *   - Handles both "edb_xxx" (ExerciseDB) and plain IDs (base44 ExerciseMaster)
 *   - Falls back gracefully when API is not configured
 *
 * Shows:
 *   - GIF / image (via ExerciseMedia)
 *   - PT + EN names
 *   - Enrichment metadata: movement pattern, resistance curve, fatigue profile, stability
 *   - Primary & secondary muscles (in PT)
 *   - Instructions (EN step-by-step)
 *   - Form cues (PT)
 *   - Common mistakes (PT)
 *   - Default prescription (sets / reps / rest)
 *   - History (use_count, PR, last used)
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, ArrowLeft, Loader2, Zap, Timer, BarChart3, Activity } from 'lucide-react';
import { toast } from 'sonner';
import ExerciseMedia from '@/components/exercises/ExerciseMedia.jsx';
import {
  exerciseKeys,
  fetchExercise,
  muscleToPT,
  equipmentToPT,
  bodyPartToPT,
  MOVEMENT_PATTERN_LABELS,
  RESISTANCE_CURVE_LABELS,
  FATIGUE_PROFILE_LABELS,
  STABILITY_LABELS,
} from '@/lib/exerciseDB/index.js';

// ─── Small UI atoms ───────────────────────────────────────────────────────────

function MetaTile({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="t-label flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 opacity-60" />}
        {label}
      </p>
      <p className="text-[14px] font-semibold text-[hsl(var(--fg))] capitalize">{value}</p>
    </div>
  );
}

function MuscleBadge({ muscle, primary }) {
  return (
    <span className={`badge ${primary ? 'badge-blue' : 'badge-neutral'} text-[12px]`}>
      {muscleToPT(muscle)}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExerciseDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

  // ── Fetch unified exercise ─────────────────────────────────────────────────

  const { data: exercise, isLoading } = useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn:  () => fetchExercise(id),
    staleTime: 300_000, // 5 min — GIF URLs don't change often
  });

  // ── Fetch user log (base44 ExerciseLog entity) ────────────────────────────

  const { data: log } = useQuery({
    queryKey: ['exercise-log', id],
    queryFn:  () =>
      base44.entities.ExerciseLog
        .filter({ exercise_master_id: id })
        .then((r) => r?.[0]),
    enabled: !!id,
    staleTime: 60_000,
  });

  // Init favorite state from log once loaded
  React.useEffect(() => {
    if (log?.is_favorite !== undefined) setIsFavorite(log.is_favorite);
  }, [log]);

  // ── Toggle favorite ────────────────────────────────────────────────────────

  const toggleFavMut = useMutation({
    mutationFn: async () => {
      const exerciseName = exercise?.canonical_name_pt || exercise?.name || '';
      const nextFav = !isFavorite;
      if (!log?.id) {
        await base44.entities.ExerciseLog.create({
          exercise_master_id: id,
          exercise_name:      exerciseName,
          is_favorite:        nextFav,
          last_used_at:       new Date().toISOString(),
        });
      } else {
        await base44.entities.ExerciseLog.update(log.id, { is_favorite: nextFav });
      }
      setIsFavorite(nextFav);
      qc.invalidateQueries({ queryKey: ['exercise-log', id] });
      toast(nextFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    },
    onError: () => toast.error('Erro ao atualizar favoritos'),
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-[hsl(var(--brand))]" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-8 text-center">
        <p className="t-caption">Exercício não encontrado</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[13px] text-[hsl(var(--brand))] font-medium hover:underline">
          ← Voltar
        </button>
      </div>
    );
  }

  // Resolve fields from unified model
  const namePT          = exercise.canonical_name_pt || exercise.name || '—';
  const nameEN          = exercise.canonical_name_en || '';
  const primaryMuscles  = exercise.primary_muscles  || [];
  const secondaryMuscles= exercise.secondary_muscles || [];
  const instructionsEN  = exercise.instructions?.en  || [];
  const formCuesPT      = exercise.instructions?.pt  || exercise.form_cues_pt || [];
  const commonMistakes  = exercise.common_mistakes_pt || [];
  const defaultSets     = exercise.default_set_range;
  const defaultReps     = exercise.default_rep_range;
  const defaultRest     = exercise.default_rest_seconds;
  const isUnilateral    = exercise.unilateral ?? exercise.is_unilateral;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[hsl(var(--border-h))]">
        <div className="p-4 lg:p-5 flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[13px] text-[hsl(var(--brand))] font-medium hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </button>
          <button
            onClick={() => toggleFavMut.mutate()}
            disabled={toggleFavMut.isPending}
            className="p-2 rounded-lg hover:bg-[hsl(var(--shell))] transition-colors"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-current text-[hsl(var(--err))]' : 'text-[hsl(var(--fg-2))]'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-5 lg:p-8 max-w-4xl mx-auto space-y-6">

        {/* Title */}
        <div>
          <h1 className="t-headline mb-1">{namePT}</h1>
          {nameEN && <p className="t-caption">{nameEN}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {exercise.source === 'exercisedb' && (
              <span className="badge badge-neutral text-[9px]">ExerciseDB</span>
            )}
            {exercise.equipment && (
              <span className="badge badge-neutral text-[10px]">{equipmentToPT(exercise.equipment)}</span>
            )}
            {exercise.body_part && (
              <span className="badge badge-neutral text-[10px]">{bodyPartToPT(exercise.body_part)}</span>
            )}
          </div>
        </div>

        {/* Media */}
        <ExerciseMedia exercise={exercise} size="lg" />

        {/* Enrichment metadata */}
        <div className="surface rounded-xl p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetaTile
            label="Dificuldade"
            value={
              exercise.difficulty_level === 'beginner'     ? 'Iniciante'
              : exercise.difficulty_level === 'intermediate' ? 'Intermediário'
              : exercise.difficulty_level === 'advanced'     ? 'Avançado'
              : exercise.difficulty_level
            }
          />
          <MetaTile
            label="Padrão de movimento"
            value={exercise.movement_pattern && MOVEMENT_PATTERN_LABELS[exercise.movement_pattern]}
            icon={Activity}
          />
          <MetaTile
            label="Curva de resistência"
            value={exercise.resistance_curve && RESISTANCE_CURVE_LABELS[exercise.resistance_curve]}
            icon={BarChart3}
          />
          <MetaTile
            label="Perfil de fadiga"
            value={exercise.fatigue_profile && FATIGUE_PROFILE_LABELS[exercise.fatigue_profile]}
          />
          <MetaTile
            label="Estabilidade"
            value={exercise.stability && STABILITY_LABELS[exercise.stability]}
          />
          {isUnilateral && (
            <MetaTile label="Unilateral" value="Sim" />
          )}
          {exercise.is_compound && (
            <MetaTile label="Tipo" value="Composto" />
          )}
        </div>

        {/* Default prescription */}
        {(defaultSets || defaultReps || defaultRest) && (
          <div className="surface rounded-xl p-5 space-y-3">
            <p className="t-subtitle flex items-center gap-2">
              <Timer className="w-4 h-4 text-[hsl(var(--brand))]" />
              Prescrição Padrão
            </p>
            <div className="flex flex-wrap gap-4">
              {defaultSets && (
                <div className="text-center">
                  <p className="text-[22px] font-bold text-[hsl(var(--fg))]">{defaultSets}</p>
                  <p className="t-label">Séries</p>
                </div>
              )}
              {defaultReps && (
                <div className="text-center">
                  <p className="text-[22px] font-bold text-[hsl(var(--fg))]">{defaultReps}</p>
                  <p className="t-label">Reps</p>
                </div>
              )}
              {defaultRest && (
                <div className="text-center">
                  <p className="text-[22px] font-bold text-[hsl(var(--fg))]">{defaultRest}s</p>
                  <p className="t-label">Descanso</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Muscles */}
        {(primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
          <div className="surface rounded-xl p-5 space-y-4">
            <p className="t-subtitle">Músculos Envolvidos</p>
            {primaryMuscles.length > 0 && (
              <div>
                <p className="t-label mb-2">Primários</p>
                <div className="flex flex-wrap gap-2">
                  {primaryMuscles.map((m) => <MuscleBadge key={m} muscle={m} primary />)}
                </div>
              </div>
            )}
            {secondaryMuscles.length > 0 && (
              <div>
                <p className="t-label mb-2">Secundários</p>
                <div className="flex flex-wrap gap-2">
                  {secondaryMuscles.map((m) => <MuscleBadge key={m} muscle={m} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions (EN step-by-step) */}
        {instructionsEN.length > 0 && (
          <div className="surface rounded-xl p-5 space-y-3">
            <p className="t-subtitle">Como Fazer</p>
            <ol className="space-y-2">
              {instructionsEN.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))] text-[11px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Form Cues (PT) */}
        {formCuesPT.length > 0 && (
          <div className="surface rounded-xl p-5 space-y-3">
            <p className="t-subtitle">Pontos Importantes</p>
            <ul className="space-y-2">
              {formCuesPT.map((cue, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[hsl(var(--brand))] font-bold shrink-0">✓</span>
                  <span className="text-[14px] text-[hsl(var(--fg-2))]">{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes (PT) */}
        {commonMistakes.length > 0 && (
          <div className="surface rounded-xl p-5 space-y-3 border-[hsl(var(--warn)/0.2)]">
            <p className="t-subtitle">Erros Comuns</p>
            <ul className="space-y-2">
              {commonMistakes.map((mistake, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[hsl(var(--warn))] font-bold shrink-0">✗</span>
                  <span className="text-[14px] text-[hsl(var(--fg-2))]">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Usage history */}
        {log && (
          <div className="surface rounded-xl p-5 space-y-3">
            <p className="t-subtitle">Seu Histórico</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="t-label">Usado</p>
                <p className="text-[16px] font-bold mt-1">{log.use_count || 0}×</p>
              </div>
              <div>
                <p className="t-label">Última vez</p>
                <p className="text-[14px] font-medium mt-1">
                  {log.last_used_at
                    ? new Date(log.last_used_at).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              {log.personal_record_weight && (
                <div>
                  <p className="t-label">Recorde</p>
                  <p className="text-[14px] font-medium mt-1">
                    {log.personal_record_weight}kg × {log.personal_record_reps}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary w-full h-11 rounded-xl text-[14px] gap-2 sticky bottom-5"
        >
          <Zap className="w-4 h-4" /> Adicionar ao Treino
        </button>

      </div>
    </div>
  );
}
