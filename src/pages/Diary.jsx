import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import {
  Smile,
  Moon,
  Droplets,
  UtensilsCrossed,
  Dumbbell,
  BarChart3,
  Pill,
  Minus,
} from 'lucide-react';
import { getToday } from '@/lib/atlas-theme';
import {
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  DateStepper,
  SafePageBoundary,
  shiftDate,
} from '@/components/shared/StablePage';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────
// Sub-components reutilizando os mesmos padrões das outras páginas
// ─────────────────────────────────────────────────────────────────

function HeroStat({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function SectionMetric({ label, value, suffix }) {
  return (
    <div className="bg-[hsl(var(--card)/0.86)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        {suffix ? (
          <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

function ScoreDots({ value, max = 5 }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full transition-colors',
            i < value ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--border))]'
          )}
        />
      ))}
    </div>
  );
}

function EmptySlot({ message }) {
  return (
    <div className="flex items-center gap-2 py-5 px-5 text-[13px] text-[hsl(var(--fg-2))]">
      <Minus className="h-3.5 w-3.5 opacity-40 shrink-0" strokeWidth={2} />
      {message}
    </div>
  );
}

function SectionIconHeader({ icon: Icon, color, label }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border)/0.5)]">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.6)]"
        style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}
      >
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.9} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────

export default function Diary() {
  return (
    <SafePageBoundary
      title="Diário"
      subtitle="Modo seguro do diário."
      fallbackDescription="O diário carregou em modo de segurança. Navegue para outra rota e volte para tentar novamente."
    >
      <DiaryContent />
    </SafePageBoundary>
  );
}

function DiaryContent() {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(getToday());
  const isToday = date === getToday();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // ── Queries ────────────────────────────────────────────────────

  const { data: checkin = null } = useQuery({
    queryKey: ['diary-checkin', date],
    queryFn: async () => {
      try {
        const r = await base44.entities.DailyCheckin.filter({ date });
        return r?.[0] || null;
      } catch {
        return null;
      }
    },
  });

  const { data: meals = [] } = useQuery({
    queryKey: ['diary-food-logs', date, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const { data, error } = await supabase
          .from('food_logs')
          .select('id, food_name, calories, protein, carbs, fat, date, created_at')
          .eq('user_id', user.id)
          .eq('date', date)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []).map((log) => ({
          id: log.id,
          date: log.date,
          title: log.food_name || 'Alimento',
          total_calories: Number(log.calories || 0),
          total_protein: Number(log.protein || 0),
          total_carbs: Number(log.carbs || 0),
          total_fat: Number(log.fat || 0),
        }));
      } catch {
        try {
          return await base44.entities.Meal.filter({ date });
        } catch {
          return [];
        }
      }
    },
    enabled: !!user?.id,
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['diary-workouts', date],
    queryFn: async () => {
      try {
        return await base44.entities.Workout.filter({ date });
      } catch {
        return [];
      }
    },
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['diary-measurements', date],
    queryFn: async () => {
      try {
        return await base44.entities.Measurement.filter({ date });
      } catch {
        return [];
      }
    },
  });

  // Show doses logged for the selected date (protocol_id links log → plan)
  const { data: supplements = [] } = useQuery({
    queryKey: ['diary-supplements', date],
    queryFn: async () => {
      try {
        const byDate = await base44.entities.Supplement.filter({ date });
        if (byDate.length > 0) return byDate;
        // Fallback: show active supplements if none logged for this date
        return await base44.entities.Supplement.filter({ active: true });
      } catch {
        return [];
      }
    },
  });

  // ── Valores derivados ──────────────────────────────────────────

  const totalCal      = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtein  = meals.reduce((s, m) => s + (m.total_protein || 0), 0);
  const totalCarbs    = meals.reduce((s, m) => s + (m.total_carbs || 0), 0);
  const totalFat      = meals.reduce((s, m) => s + (m.total_fat || 0), 0);
  const measurement   = measurements[0] || null;
  const doneWorkouts  = workouts.filter((w) => w.completed || w.status === 'completed').length;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <AppContainer>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Diário"
        title="Seu dia em um lugar só."
        subtitle="Visão consolidada de nutrição, treinos, check-in e medidas para a data selecionada."
        accentClassName="from-[hsl(var(--brand)/0.07)] via-[hsl(var(--brand)/0.02)]"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DateStepper
              date={date}
              onChange={(amount) => setDate(shiftDate(date, amount))}
            />
            {isToday && (
              <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand)/0.1)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--brand))]">
                Hoje
              </span>
            )}
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat
            label="Energia do dia"
            value={totalCal > 0 ? `${Math.round(totalCal)} kcal` : '—'}
            detail={
              meals.length > 0
                ? `${meals.length} registro(s) · ${Math.round(totalProtein)}g proteína`
                : 'Nenhum alimento registrado para este dia.'
            }
          />
          <HeroStat
            label="Check-in"
            value={
              checkin
                ? `Humor ${checkin.mood ?? '—'}/5 · Energia ${checkin.energy ?? '—'}/5`
                : '—'
            }
            detail={
              checkin
                ? `${checkin.sleep_hours || 0}h de sono · ${checkin.hydration_liters || 0}L de água`
                : 'Check-in não registrado para este dia.'
            }
          />
          <HeroStat
            label="Treinos"
            value={workouts.length > 0 ? `${workouts.length} sessão(ões)` : '—'}
            detail={
              workouts.length > 0
                ? `${doneWorkouts} concluído(s) para a data selecionada.`
                : 'Nenhum treino registrado para este dia.'
            }
          />
        </div>
      </PageHeader>

      {/* ── Nutrição ────────────────────────────────────────────── */}
      <Section
        eyebrow="Diário"
        title={meals.length > 0 ? `Nutrição · ${Math.round(totalCal)} kcal` : 'Nutrição'}
        subtitle="Alimentos registrados via página de Nutrição para a data selecionada."
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={UtensilsCrossed}
            color="hsl(var(--brand, #0A84FF))"
            label="Nutrição"
          />

          {meals.length === 0 ? (
            <EmptySlot message="Nenhum alimento registrado para este dia." />
          ) : (
            <>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {meals.map((m) => (
                  <div key={m.id} className="px-5 py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                        {m.title}
                      </p>
                      <span className="shrink-0 text-[13px] font-semibold text-[hsl(var(--fg))]">
                        {Math.round(m.total_calories)}{' '}
                        <span className="text-[11px] font-medium text-[hsl(var(--fg-2))]">kcal</span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex gap-4 text-[12px] text-[hsl(var(--fg-2))]">
                      <span>P {Math.round(m.total_protein)}g</span>
                      <span>C {Math.round(m.total_carbs)}g</span>
                      <span>G {Math.round(m.total_fat)}g</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-px bg-[hsl(var(--border)/0.6)] sm:grid-cols-3">
                <SectionMetric label="Proteína" value={`${Math.round(totalProtein)}`} suffix="g" />
                <SectionMetric label="Carboidratos" value={`${Math.round(totalCarbs)}`} suffix="g" />
                <SectionMetric label="Gordura" value={`${Math.round(totalFat)}`} suffix="g" />
              </div>
            </>
          )}
        </Card>
      </Section>

      {/* ── Check-in ────────────────────────────────────────────── */}
      <Section
        eyebrow="Diário"
        title="Check-in"
        subtitle="Dados de bem-estar, sono e hidratação registrados para o dia."
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={Smile}
            color="hsl(var(--ok, #34C759))"
            label="Check-in"
          />

          {!checkin ? (
            <EmptySlot message="Check-in não registrado para este dia." />
          ) : (
            <div className="px-5 py-5 space-y-5">
              {/* Métricas em grid */}
              <div className="grid gap-px overflow-hidden rounded-[20px] bg-[hsl(var(--border)/0.6)] sm:grid-cols-2">
                <SectionMetric label="Humor" value={`${checkin.mood ?? '—'}`} suffix={checkin.mood != null ? '/5' : ''} />
                <SectionMetric label="Energia" value={`${checkin.energy ?? '—'}`} suffix={checkin.energy != null ? '/5' : ''} />
                <SectionMetric
                  label="Sono"
                  value={`${checkin.sleep_hours || 0}`}
                  suffix="h"
                />
                <SectionMetric
                  label="Hidratação"
                  value={`${checkin.hydration_liters || 0}`}
                  suffix="L"
                />
              </div>

              {/* Score dots visuais */}
              {(checkin.mood != null || checkin.energy != null) && (
                <div className="space-y-3">
                  {checkin.mood != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                        <Smile className="h-3.5 w-3.5" strokeWidth={1.9} />
                        Humor
                      </div>
                      <ScoreDots value={checkin.mood} max={5} />
                    </div>
                  )}
                  {checkin.energy != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                        <Moon className="h-3.5 w-3.5" strokeWidth={1.9} />
                        Energia
                      </div>
                      <ScoreDots value={checkin.energy} max={5} />
                    </div>
                  )}
                  {checkin.hydration_liters != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                        <Droplets className="h-3.5 w-3.5" strokeWidth={1.9} />
                        Hidratação
                      </div>
                      <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                        {checkin.hydration_liters}L
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notas */}
              {checkin.notes && (
                <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))] mb-1.5">
                    Observações
                  </p>
                  <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{checkin.notes}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Treinos ─────────────────────────────────────────────── */}
      <Section
        eyebrow="Diário"
        title={workouts.length > 0 ? `Treinos · ${workouts.length} sessão(ões)` : 'Treinos'}
        subtitle="Sessões registradas na rota de Treinos para a data selecionada."
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={Dumbbell}
            color="hsl(var(--brand-ai, #8B5CF6))"
            label="Treinos"
          />

          {workouts.length === 0 ? (
            <EmptySlot message="Nenhum treino registrado para este dia." />
          ) : (
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {workouts.map((w) => {
                const done = w.completed || w.status === 'completed';
                return (
                  <div key={w.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
                        {w.name}
                      </p>
                      <span
                        className={cn(
                          'shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          done
                            ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                            : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(34_68%_32%)]'
                        )}
                      >
                        {done ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-[12px] text-[hsl(var(--fg-2))]">
                      {w.duration_minutes > 0 && <span>{w.duration_minutes} min</span>}
                      {w.volume_load > 0 && (
                        <span>{w.volume_load.toLocaleString('pt-BR')} kg vol.</span>
                      )}
                      {w.perceived_effort > 0 && <span>RPE {w.perceived_effort}</span>}
                    </div>
                    {(w.exercises || []).length > 0 && (
                      <p className="mt-1.5 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
                        {w.exercises.map((e) => e.name).join(' · ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Medidas ─────────────────────────────────────────────── */}
      <Section
        eyebrow="Diário"
        title="Medidas"
        subtitle="Checkpoint corporal registrado para a data selecionada."
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={BarChart3}
            color="hsl(var(--warn, #FF9F0A))"
            label="Medidas"
          />

          {!measurement ? (
            <EmptySlot message="Nenhuma medida registrada para este dia." />
          ) : (
            <div className="grid gap-px bg-[hsl(var(--border)/0.6)] sm:grid-cols-2">
              {measurement.weight != null && (
                <SectionMetric label="Peso" value={`${measurement.weight}`} suffix="kg" />
              )}
              {measurement.body_fat != null && (
                <SectionMetric
                  label="Gordura corporal"
                  value={`${measurement.body_fat}`}
                  suffix="%"
                />
              )}
              {measurement.waist != null && (
                <SectionMetric label="Cintura" value={`${measurement.waist}`} suffix="cm" />
              )}
              {measurement.arms != null && (
                <SectionMetric label="Braços" value={`${measurement.arms}`} suffix="cm" />
              )}
              {measurement.chest != null && (
                <SectionMetric label="Peito" value={`${measurement.chest}`} suffix="cm" />
              )}
              {measurement.hips != null && (
                <SectionMetric label="Quadril" value={`${measurement.hips}`} suffix="cm" />
              )}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Suplementos ─────────────────────────────────────────── */}
      <Section
        eyebrow="Diário"
        title={
          supplements.length > 0
            ? `Suplementos · ${supplements.length} ativo(s)`
            : 'Suplementos'
        }
        subtitle="Compostos ativos cadastrados nos Protocolos."
      >
        <Card className="overflow-hidden px-0 py-0">
          <SectionIconHeader
            icon={Pill}
            color="hsl(var(--ok, #34C759))"
            label="Suplementos"
          />

          {supplements.length === 0 ? (
            <EmptySlot message="Nenhum suplemento ativo cadastrado." />
          ) : (
            <div className="flex flex-wrap gap-2 px-5 py-5">
              {supplements.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] px-3.5 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))]"
                >
                  {s.name}
                  {s.dose ? ` · ${s.dose}` : ''}
                  {s.protocol_id && (
                    <span className="rounded-full bg-[hsl(var(--brand)/0.12)] px-1.5 py-0.5 text-[10px] text-[hsl(var(--brand))]">
                      protocolo
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </Card>
      </Section>
    </AppContainer>
  );
}
