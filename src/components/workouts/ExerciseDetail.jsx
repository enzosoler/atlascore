import React from 'react';

/**
 * ExerciseDetail — shows exercise media, muscles, and form cues.
 *
 * Accepts exercises from multiple sources that may use different field names:
 *   - ExerciseMaster entities:  primary_muscles (array)
 *   - ExerciseSearch results:   primary_muscles (array)  ← fixed in ExerciseSearch
 *   - Legacy WorkoutExecution:  muscle_groups (array)    ← still supported here
 *
 * Media is shown only when exercise.media_gif_url is present.
 */
export default function ExerciseDetail({ exercise }) {
  if (!exercise) return null;

  // Support both field naming conventions
  const muscles =
    (Array.isArray(exercise.primary_muscles) && exercise.primary_muscles.length > 0
      ? exercise.primary_muscles
      : null) ||
    (Array.isArray(exercise.muscle_groups) && exercise.muscle_groups.length > 0
      ? exercise.muscle_groups
      : null) ||
    [];

  return (
    <div className="surface p-5 space-y-4">
      {/* Exercise Media — GIF or image, shown only when URL is available */}
      {exercise.media_gif_url && (
        <div className="w-full rounded-xl overflow-hidden bg-[hsl(var(--shell))] aspect-video flex items-center justify-center">
          <img
            src={exercise.media_gif_url}
            alt={`Demonstration: ${exercise.name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Name & Muscles */}
      <div>
        <h2 className="t-subtitle mb-1">{exercise.name}</h2>
        {muscles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {muscles.map((m, i) => (
              <span key={i} className="badge badge-neutral text-[11px]">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Cues */}
      {exercise.form_cues_pt && exercise.form_cues_pt.length > 0 && (
        <div>
          <p className="t-label mb-2">Form cues</p>
          <ul className="space-y-1">
            {exercise.form_cues_pt.slice(0, 3).map((cue, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12px] text-muted-foreground"
              >
                <span className="text-[hsl(var(--brand))] mt-1">•</span>
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
