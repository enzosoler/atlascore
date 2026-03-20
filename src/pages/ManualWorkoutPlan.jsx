import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Dumbbell, 
  Search, 
  Loader2,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';
import { searchExercises } from '@/lib/exerciseDB';
import { 
  AppContainer, 
  Card, 
  PageHeader, 
  Section,
  ActionRow 
} from '@/components/shared/AppContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ManualWorkoutPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  
  const [planName, setPlanName] = useState('Meu Novo Plano');
  const [objective, setObjective] = useState('');
  const [days, setDays] = useState([
    { id: crypto.randomUUID(), name: 'Treino A', focus: '', exercises: [] }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);

  const addDay = () => {
    setDays([...days, { id: crypto.randomUUID(), name: `Treino ${String.fromCharCode(65 + days.length)}`, focus: '', exercises: [] }]);
  };

  const removeDay = (dayId) => {
    if (days.length > 1) {
      setDays(days.filter(d => d.id !== dayId));
    }
  };

  const updateDay = (dayId, updates) => {
    setDays(days.map(d => d.id === dayId ? { ...d, ...updates } : d));
  };

  const addExercise = (dayId, exercise) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          exercises: [...d.exercises, {
            id: crypto.randomUUID(),
            exercise_id: exercise.id,
            name: exercise.canonical_name_pt || exercise.name,
            muscle_group: exercise.primary_muscles?.[0] || '',
            sets: 3,
            reps: '12',
            rest_seconds: 60,
            notes: ''
          }]
        };
      }
      return d;
    }));
  };

  const removeExercise = (dayId, exerciseId) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return { ...d, exercises: d.exercises.filter(ex => ex.id !== exerciseId) };
      }
      return d;
    }));
  };

  const updateExercise = (dayId, exerciseId, updates) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          exercises: d.exercises.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex)
        };
      }
      return d;
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      // Deactivate current plans
      const currentPlans = await base44.entities.WorkoutPlan.filter({ active: true });
      for (const p of currentPlans) {
        await base44.entities.WorkoutPlan.update(p.id, { active: false });
      }

      // Create new plan
      await base44.entities.WorkoutPlan.create({
        name: planName,
        objective,
        days: days.map(({ name, focus, exercises }) => ({
          name,
          focus,
          exercises: exercises.map(({ name, muscle_group, sets, reps, rest_seconds, notes }) => ({
            name,
            muscle_group,
            sets: Number(sets),
            reps,
            rest_seconds: Number(rest_seconds),
            notes
          }))
        })),
        source: 'user',
        created_by_type: 'user',
        active: true,
        version: 1,
        start_date: new Date().toISOString().split('T')[0],
      });

      toast.success('Plano de treino salvo com sucesso!');
      qc.invalidateQueries({ queryKey: ['workout-plans'] });
      navigate(ROUTES.myWorkout);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar o plano.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppContainer maxWidth="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="atlas-display-title text-2xl">Criar Plano Manual</h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="atlas-overline">Nome do Plano</label>
              <Input 
                value={planName} 
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Hipertrofia ABC"
              />
            </div>
            <div className="space-y-2">
              <label className="atlas-overline">Objetivo</label>
              <Input 
                value={objective} 
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ex: Ganho de massa muscular"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {days.map((day, dayIndex) => (
            <DayEditor 
              key={day.id}
              day={day}
              onUpdate={(updates) => updateDay(day.id, updates)}
              onRemove={() => removeDay(day.id)}
              onAddExercise={(ex) => addExercise(day.id, ex)}
              onUpdateExercise={(exId, updates) => updateExercise(day.id, exId, updates)}
              onRemoveExercise={(exId) => removeExercise(day.id, exId)}
            />
          ))}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={addDay} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Dia
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Plano
          </Button>
        </div>
      </div>
    </AppContainer>
  );
}

function DayEditor({ day, onUpdate, onRemove, onAddExercise, onUpdateExercise, onRemoveExercise }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchExercises(q, 5);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-[hsl(var(--shell))] px-5 py-3 flex items-center justify-between border-b border-[hsl(var(--border-h))]">
        <div className="flex items-center gap-3 flex-1">
          <Input 
            value={day.name} 
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="max-w-[150px] h-8 font-semibold bg-transparent border-none focus-visible:ring-0 px-0"
          />
          <Input 
            value={day.focus} 
            onChange={(e) => onUpdate({ focus: e.target.value })}
            placeholder="Foco (ex: Peito e Tríceps)"
            className="max-w-[250px] h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-0 text-[hsl(var(--fg-2))]"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.1)]">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {day.exercises.map((ex, idx) => (
          <div key={ex.id} className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-h))]">
            <div className="flex items-center gap-3 flex-1">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--shell))] text-[10px] font-bold text-[hsl(var(--fg-2))]">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{ex.name}</p>
                <p className="text-[11px] text-[hsl(var(--fg-2))]">{ex.muscle_group}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-[hsl(var(--fg-3))] font-bold">Séries</label>
                <Input 
                  type="number" 
                  value={ex.sets} 
                  onChange={(e) => onUpdateExercise(ex.id, { sets: e.target.value })}
                  className="w-14 h-8 text-center text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-[hsl(var(--fg-3))] font-bold">Reps</label>
                <Input 
                  value={ex.reps} 
                  onChange={(e) => onUpdateExercise(ex.id, { reps: e.target.value })}
                  className="w-16 h-8 text-center text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-[hsl(var(--fg-3))] font-bold">Descanso</label>
                <Input 
                  type="number" 
                  value={ex.rest_seconds} 
                  onChange={(e) => onUpdateExercise(ex.id, { rest_seconds: e.target.value })}
                  className="w-16 h-8 text-center text-xs"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemoveExercise(ex.id)} className="mt-4 text-[hsl(var(--fg-3))] hover:text-[hsl(var(--err))]">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="relative pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-3))]" />
            <Input 
              placeholder="Buscar exercício para adicionar..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[hsl(var(--fg-3))]" />}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border-h))] rounded-xl shadow-lg overflow-hidden">
              {searchResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => {
                    onAddExercise(result);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[hsl(var(--shell))] transition-colors border-b border-[hsl(var(--border-h))] last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{result.canonical_name_pt || result.name}</p>
                    <p className="text-[11px] text-[hsl(var(--fg-2))]">{result.primary_muscles?.[0] || result.body_part}</p>
                  </div>
                  <Plus className="w-4 h-4 text-[hsl(var(--brand))]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
