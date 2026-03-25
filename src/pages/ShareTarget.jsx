/**
 * ShareTarget — Handles incoming content from the OS Share Menu
 *
 * When a user sees a workout or recipe video on Instagram and taps "Share" →
 * selects Atlas Core, the PWA receives the shared URL/text/files here.
 *
 * This page:
 *   1. Reads the shared data from URL params (GET) or FormData (POST)
 *   2. Detects the content type (video URL, text, image)
 *   3. Routes to the appropriate module:
 *      - Recipe/food content → Nutrition (pre-fill food log)
 *      - Workout content → Workouts (pre-fill workout log)
 *      - Generic → Today (with shared context)
 *
 * This occupies the "Share Menu Real Estate" described in the viral loop strategy,
 * keeping Atlas top-of-mind every time a user shares fitness content.
 *
 * Route: /share-target
 * Registered in manifest.json as a Web Share Target.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Dumbbell,
  UtensilsCrossed,
  Loader2,
  Share2,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Content detection heuristics ───────────────────────────────────────────────

const FOOD_KEYWORDS = [
  'recipe', 'meal', 'food', 'cook', 'nutrition', 'protein', 'calories',
  'macros', 'diet', 'eating', 'breakfast', 'lunch', 'dinner', 'snack',
  'prep', 'healthy', 'receta', 'comida', 'refeicao', 'receita',
];

const WORKOUT_KEYWORDS = [
  'workout', 'exercise', 'training', 'gym', 'lift', 'squat', 'bench',
  'deadlift', 'cardio', 'hiit', 'crossfit', 'run', 'sets', 'reps',
  'treino', 'exercicio', 'academia', 'musculacao', 'entrenamiento',
];

function detectContentType(text = '', url = '') {
  const combined = `${text} ${url}`.toLowerCase();

  const foodScore = FOOD_KEYWORDS.reduce(
    (score, kw) => score + (combined.includes(kw) ? 1 : 0),
    0
  );
  const workoutScore = WORKOUT_KEYWORDS.reduce(
    (score, kw) => score + (combined.includes(kw) ? 1 : 0),
    0
  );

  if (foodScore > workoutScore && foodScore > 0) return 'food';
  if (workoutScore > foodScore && workoutScore > 0) return 'workout';
  return 'unknown';
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ShareTarget() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [processing, setProcessing] = useState(true);

  // Read shared data from URL params (Web Share Target GET method)
  const sharedTitle = searchParams.get('title') || '';
  const sharedText = searchParams.get('text') || '';
  const sharedUrl = searchParams.get('url') || '';

  const contentType = useMemo(
    () => detectContentType(sharedTitle + ' ' + sharedText, sharedUrl),
    [sharedTitle, sharedText, sharedUrl]
  );

  // If not authenticated, redirect to auth with return URL
  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = `/share-target?${searchParams.toString()}`;
      navigate(`${ROUTES.auth}?mode=login&next=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Store shared content in sessionStorage for the destination page to pick up
  useEffect(() => {
    if (!isAuthenticated) return;

    const sharedContent = {
      title: sharedTitle,
      text: sharedText,
      url: sharedUrl,
      type: contentType,
      received_at: new Date().toISOString(),
    };

    sessionStorage.setItem('atlas_shared_content', JSON.stringify(sharedContent));

    // Brief processing animation, then redirect
    const timer = setTimeout(() => {
      setProcessing(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, sharedTitle, sharedText, sharedUrl, contentType]);

  const handleNavigate = (destination) => {
    navigate(destination, { replace: true });
  };

  // Auto-redirect after processing
  useEffect(() => {
    if (processing || !isAuthenticated) return;

    const timer = setTimeout(() => {
      if (contentType === 'food') {
        handleNavigate(ROUTES.nutrition);
      } else if (contentType === 'workout') {
        handleNavigate(ROUTES.workouts);
      }
      // For 'unknown', we show the choice UI below
    }, 500);

    return () => clearTimeout(timer);
  }, [processing, isAuthenticated, contentType]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))] p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <AtlasCoreLogoSVG width={48} height={24} className="shrink-0" />
          <span className="text-[17px] font-bold tracking-tight">
            <span className="text-[hsl(var(--accent-primary))]">atlas</span>
            <span className="text-[hsl(var(--fg))]">.core</span>
          </span>
        </div>

        {processing ? (
          /* Processing state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="surface rounded-[22px] p-8 text-center space-y-6"
          >
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[hsl(var(--brand))] animate-spin" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">
                Analyzing shared content...
              </p>
              {sharedUrl && (
                <p className="mt-2 text-[12px] text-[hsl(var(--fg-3))] truncate max-w-[280px] mx-auto">
                  {sharedUrl}
                </p>
              )}
            </div>
          </motion.div>
        ) : contentType === 'unknown' ? (
          /* Content type unclear — let user choose */
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface rounded-[22px] p-6 space-y-5"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-7 h-7 text-[hsl(var(--brand))]" strokeWidth={1.75} />
              </div>
              <h2 className="text-[18px] font-bold tracking-tight">
                What would you like to log?
              </h2>
              <p className="mt-2 text-[13px] text-[hsl(var(--fg-2))] leading-relaxed">
                We received your shared content. Choose where to log it.
              </p>
            </div>

            {sharedTitle && (
              <div className="rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] px-3 py-2.5">
                <p className="text-[12px] text-[hsl(var(--fg-2))] truncate">{sharedTitle}</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => handleNavigate(ROUTES.nutrition)}
                className="flex items-center gap-3 w-full p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] transition-colors text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <UtensilsCrossed className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Log as a meal</p>
                  <p className="text-[11px] text-[hsl(var(--fg-2))]">Add to today's nutrition</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              </button>

              <button
                onClick={() => handleNavigate(ROUTES.workouts)}
                className="flex items-center gap-3 w-full p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] transition-colors text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Dumbbell className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Log as a workout</p>
                  <p className="text-[11px] text-[hsl(var(--fg-2))]">Add to your training log</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              </button>

              <button
                onClick={() => handleNavigate(ROUTES.today)}
                className="flex items-center gap-3 w-full p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] transition-colors text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
                  <Zap className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Go to Today</p>
                  <p className="text-[11px] text-[hsl(var(--fg-2))]">View your dashboard</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Auto-routing — brief confirmation */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="surface rounded-[22px] p-8 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--ok)/0.1)] flex items-center justify-center mx-auto">
              {contentType === 'food' ? (
                <UtensilsCrossed className="w-7 h-7 text-[hsl(var(--ok))]" strokeWidth={1.75} />
              ) : (
                <Dumbbell className="w-7 h-7 text-[hsl(var(--ok))]" strokeWidth={1.75} />
              )}
            </div>
            <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">
              {contentType === 'food' ? 'Opening Nutrition...' : 'Opening Workouts...'}
            </p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              Redirecting you to log this content.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
