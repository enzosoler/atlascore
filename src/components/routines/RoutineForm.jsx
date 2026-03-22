import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function RoutineForm({ onSuccess }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    description: '',
    estimated_duration_minutes: 45,
    total_exercises: 0,
    days_of_week: [],
  });
  const [selectedDays, setSelectedDays] = useState(new Set());

  useQuery({
    queryKey: ['prescribed-workouts', user?.email],
    queryFn: () => base44.entities.PrescribedWorkout?.filter?.({ athlete_email: user?.email }) ?? [],
    enabled: !!user?.email,
  });

  const createRoutine = useMutation({
    mutationFn: async (data) => {
      const daysData = Array.from(selectedDays).map(dayNum => ({
        day: dayNum,
        name: DAYS_PT[dayNum],
        workout_id: null,
        workout_name: null,
      }));

      const routineData = {
        ...data,
        athlete_email: user?.email,
        days_of_week: daysData,
        active: true,
        is_prescribed: false,
      };

      return base44.entities.Routine.create(routineData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rotina criada com sucesso');
      onSuccess?.();
    },
    onError: (err) => {
      toast.error('Erro ao criar rotina: ' + err.message);
    },
  });

  const toggleDay = (dayNum) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(dayNum)) {
      newSelected.delete(dayNum);
    } else {
      newSelected.add(dayNum);
    }
    setSelectedDays(newSelected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Nome da rotina é obrigatório');
      return;
    }

    if (selectedDays.size === 0) {
      toast.error('Selecione pelo menos um dia da semana');
      return;
    }

    createRoutine.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
          Nome da Rotina
        </label>
        <Input
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Upper/Lower Split, Full Body 4x"
          className="atlas-field h-11 rounded-[10px] border-0 px-4 text-[14px]"
        />
      </div>

      <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
          Descrição
        </label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descreva a rotina (opcional)"
          className="atlas-field min-h-[96px] resize-none rounded-[10px] border-0 px-4 py-3 text-[14px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
            Duração (minutos)
          </label>
          <Input
            type="number"
            value={form.estimated_duration_minutes}
            onChange={(e) => setForm(f => ({ ...f, estimated_duration_minutes: Number(e.target.value) }))}
            min={5}
            max={300}
            className="atlas-field h-11 rounded-[10px] border-0 px-4 text-[14px]"
          />
        </div>
        <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
            Total de Exercícios
          </label>
          <Input
            type="number"
            value={form.total_exercises}
            onChange={(e) => setForm(f => ({ ...f, total_exercises: Number(e.target.value) }))}
            min={0}
            max={50}
            className="atlas-field h-11 rounded-[10px] border-0 px-4 text-[14px]"
          />
        </div>
      </div>

      <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
        <label className="mb-3 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
          Dias da Semana
        </label>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_PT.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              className={`flex flex-col items-center gap-2 rounded-[12px] border px-1 py-3 transition-colors ${
                selectedDays.has(idx)
                  ? 'border-[hsl(var(--brand)/0.26)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
                  : 'border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.5)] text-[hsl(var(--fg-3))] hover:bg-[hsl(var(--fill)/0.9)]'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  selectedDays.has(idx) ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--border))]'
                }`}
              />
              <span className="text-[10px] font-semibold">
                {day.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={createRoutine.isPending || selectedDays.size === 0}
        className="h-11 w-full rounded-[10px] bg-[hsl(var(--primary))] text-[13px] font-semibold text-white hover:bg-[hsl(var(--primary)/0.85)]"
      >
        {createRoutine.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Criando…
          </>
        ) : (
          'Criar rotina'
        )}
      </Button>
    </form>
  );
}
