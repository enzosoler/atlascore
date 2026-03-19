import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { ChevronLeft, ChevronRight, Smile, Zap, Moon, Droplets, UtensilsCrossed, Dumbbell, BarChart3, Pill } from 'lucide-react';
import { getToday, MEAL_TYPES } from '@/lib/atlas-theme';

function formatDiaryDate(dateStr) {
  const dt = new Date(dateStr + 'T12:00:00');
  const weekday = dt.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = dt.getDate();
  const month = dt.toLocaleDateString('pt-BR', { month: 'long' });
  // Capitalize only the first letter of the weekday
  const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${weekdayCapitalized}, ${day} de ${month}`;
}

function DateNav({ date, onChange }) {
  const isToday = date === getToday();
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(-1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[hsl(var(--fill)/0.9)] transition-colors border border-transparent hover:border-[hsl(var(--border)/0.5)]"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
      </button>
      <span className="text-[14px] font-semibold min-w-[220px] text-center text-[hsl(var(--fg))] tracking-[-0.01em]">
        {formatDiaryDate(date)}
        {isToday && (
          <span className="ml-2 inline-flex items-center rounded-full bg-[hsl(var(--brand)/0.1)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--brand))]">
            Hoje
          </span>
        )}
      </span>
      <button
        onClick={() => onChange(1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[hsl(var(--fill)/0.9)] transition-colors border border-transparent hover:border-[hsl(var(--border)/0.5)]"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function ScoreDot({ value, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${i < value ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--border))]'}`}
        />
      ))}
    </div>
  );
}

function TimelineSection({ icon: Icon, color, title, children, empty }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[hsl(var(--border)/0.5)]"
          style={{ background: color ? `color-mix(in srgb, ${color} 12%, transparent)` : 'hsl(var(--fill))' }}
        >
          <Icon className="w-4 h-4" style={{ color: color || 'hsl(var(--fg-2))' }} strokeWidth={2} />
        </div>
        <div className="w-px flex-1 bg-[hsl(var(--border)/0.5)] mt-2" />
      </div>
      <div className="flex-1 pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-2))] mb-2.5">
          {title}
        </p>
        {empty ? (
          <p className="text-[13px] text-[hsl(var(--fg-2))] italic">Nenhum registro.</p>
        ) : children}
      </div>
    </div>
  );
}

export default function Diary() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(getToday());

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const changeDate = (d) => {
    const dt = new Date(date);
    dt.setDate(dt.getDate() + d);
    setDate(dt.toISOString().split('T')[0]);
  };

  const { data: checkin } = useQuery({
    queryKey: ['diary-checkin', date],
    queryFn: async () => {
      const r = await base44.entities.DailyCheckin.filter({ date });
      return r?.[0] || null;
    },
  });
  const { data: meals = [] } = useQuery({
    queryKey: ['diary-meals', date],
    queryFn: () => base44.entities.Meal.filter({ date }),
  });
  const { data: workouts = [] } = useQuery({
    queryKey: ['diary-workouts', date],
    queryFn: () => base44.entities.Workout.filter({ date }),
  });
  const { data: measurements = [] } = useQuery({
    queryKey: ['diary-measurements', date],
    queryFn: () => base44.entities.Measurement.filter({ date }),
  });
  const { data: supplements = [] } = useQuery({
    queryKey: ['diary-supplements-active'],
    queryFn: () => base44.entities.Supplement.filter({ active: true }),
  });

  const totalCal = meals.reduce((s, m) => s + (m.total_calories || 0), 0);
  const measurement = measurements[0] || null;

  return (
    <div className="min-h-screen bg-[hsl(var(--shell,var(--bg,#F5F5F7)))]">
      <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8 lg:py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">
            Diário
          </h1>
          <p className="mt-1 text-[14px] text-[hsl(var(--fg-2))]">
            Resumo cronológico do seu dia
          </p>
        </div>

        {/* Date navigator */}
        <div className="mb-8 rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card,white))] px-4 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <DateNav date={date} onChange={changeDate} />
        </div>

        {/* Timeline */}
        <div className="rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card,white))] px-6 py-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          {/* Check-in */}
          <TimelineSection
            icon={Smile}
            color="hsl(var(--ok, #34C759))"
            title="Check-in"
            empty={!checkin}
          >
            {checkin && (
              <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.5)] p-4 space-y-3">
                {[
                  { label: 'Humor', value: checkin.mood, max: 5 },
                  { label: 'Energia', value: checkin.energy, max: 5 },
                ].map(({ label, value, max }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[13px] text-[hsl(var(--fg-2))]">{label}</span>
                    <ScoreDot value={value} max={max} />
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[hsl(var(--fg-2))] flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" /> Sono
                  </span>
                  <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">{checkin.sleep_hours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[hsl(var(--fg-2))] flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" /> Água
                  </span>
                  <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">{checkin.hydration_liters}L</span>
                </div>
                {checkin.notes && (
                  <p className="text-[12px] italic text-[hsl(var(--fg-2))] border-t border-[hsl(var(--border)/0.5)] pt-2">
                    {checkin.notes}
                  </p>
                )}
              </div>
            )}
          </TimelineSection>

          {/* Nutrition */}
          <TimelineSection
            icon={UtensilsCrossed}
            color="hsl(var(--brand, #0A84FF))"
            title={`Nutrição${meals.length > 0 ? ` · ${totalCal} kcal` : ''}`}
            empty={meals.length === 0}
          >
            <div className="space-y-2">
              {meals.map((m) => (
                <div key={m.id} className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
                  <div className="flex justify-between items-baseline">
                    <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                      {MEAL_TYPES[m.meal_type]?.label || m.meal_type}
                    </p>
                    <span className="text-[12px] text-[hsl(var(--fg-2))]">{m.total_calories || 0} kcal</span>
                  </div>
                  <div className="flex gap-3 mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">
                    <span>P {m.total_protein || 0}g</span>
                    <span>C {m.total_carbs || 0}g</span>
                    <span>G {m.total_fat || 0}g</span>
                  </div>
                  {(m.foods || []).length > 0 && (
                    <p className="text-[12px] mt-1 text-[hsl(var(--fg-2))]">
                      {m.foods.map((f) => f.name).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TimelineSection>

          {/* Workout */}
          <TimelineSection
            icon={Dumbbell}
            color="hsl(var(--brand-ai, #8B5CF6))"
            title="Treino"
            empty={workouts.length === 0}
          >
            {workouts.map((w) => (
              <div key={w.id} className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.5)] px-4 py-3 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{w.name}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      w.completed
                        ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok,#34C759))]'
                        : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn,#FF9F0A))]'
                    }`}
                  >
                    {w.completed ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
                <div className="flex gap-3 text-[12px] text-[hsl(var(--fg-2))]">
                  {w.duration_minutes > 0 && <span>{w.duration_minutes} min</span>}
                  {w.volume_load > 0 && <span>{w.volume_load.toLocaleString()} kg vol.</span>}
                  {w.perceived_effort > 0 && <span>RPE {w.perceived_effort}</span>}
                </div>
                {(w.exercises || []).length > 0 && (
                  <p className="text-[12px] text-[hsl(var(--fg-2))]">
                    {w.exercises.map((e) => e.name).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </TimelineSection>

          {/* Measurements */}
          <TimelineSection
            icon={BarChart3}
            color="hsl(var(--warn, #FF9F0A))"
            title="Medidas"
            empty={!measurement}
          >
            {measurement && (
              <div className="rounded-[14px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[hsl(var(--fg-2))]">
                  {measurement.weight && (
                    <span>Peso <b className="text-[hsl(var(--fg))] font-semibold">{measurement.weight}kg</b></span>
                  )}
                  {measurement.body_fat && (
                    <span>Gordura <b className="text-[hsl(var(--fg))] font-semibold">{measurement.body_fat}%</b></span>
                  )}
                  {measurement.waist && (
                    <span>Cintura <b className="text-[hsl(var(--fg))] font-semibold">{measurement.waist}cm</b></span>
                  )}
                  {measurement.arms && (
                    <span>Braços <b className="text-[hsl(var(--fg))] font-semibold">{measurement.arms}cm</b></span>
                  )}
                </div>
              </div>
            )}
          </TimelineSection>

          {/* Supplements */}
          <TimelineSection
            icon={Pill}
            color="hsl(var(--ok, #34C759))"
            title={`Suplementos${supplements.length > 0 ? ` (${supplements.length} ativos)` : ''}`}
            empty={supplements.length === 0}
          >
            <div className="flex flex-wrap gap-1.5">
              {supplements.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.6)] px-3 py-1 text-[12px] font-medium text-[hsl(var(--fg-2))]"
                >
                  {s.name}{s.dose ? ` · ${s.dose}` : ''}
                </span>
              ))}
            </div>
          </TimelineSection>

        </div>
      </div>
    </div>
  );
}
