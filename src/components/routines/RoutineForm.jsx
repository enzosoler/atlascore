import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createWorkoutPlan } from '@/services/workoutPlanService';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  const createRoutine = useMutation({
    mutationFn: async (data) => {
      if (!user?.id) {
        throw new Error('You need to be signed in to save a routine.');
      }

      const dayList = Array.from(selectedDays)
        .sort((a, b) => a - b)
        .map((dayNum) => ({
          day: dayNum,
          name: DAYS[dayNum],
          focus: '',
          exercises: [],
        }));

      return createWorkoutPlan(user.id, {
        name: data.name.trim(),
        objective: data.description.trim() || null,
        notes: data.description.trim() || null,
        frequency: selectedDays.size,
        days: dayList,
        estimated_duration_minutes: Number(data.estimated_duration_minutes) || null,
        total_exercises: Number(data.total_exercises) || 0,
        source: 'user',
        created_by_type: 'user',
        active: false,
        version: 1,
        start_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-plans', user?.id] });
      toast.success('Routine saved to library');
      onSuccess?.();
    },
    onError: (err) => {
      toast.error('Error creating routine: ' + err.message);
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
      toast.error('Routine name is required');
      return;
    }

    if (selectedDays.size === 0) {
      toast.error('Select at least one day of the week');
      return;
    }

    createRoutine.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-[16px] border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.06)] px-4 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand))]">
          Library template
        </p>
        <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          Save a reusable routine outline. It stays in your library until you choose it for training.
        </p>
      </div>

      <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
          Routine name
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
          Description
        </label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Describe the routine (optional)"
          className="atlas-field min-h-[96px] resize-none rounded-[10px] border-0 px-4 py-3 text-[14px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.48)] p-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase text-[hsl(var(--fg-3))]">
            Duration (minutes)
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
            Total exercises
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
          Days of the week
        </label>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, idx) => (
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
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...
          </>
        ) : (
          'Save routine'
        )}
      </Button>
    </form>
  );
}
