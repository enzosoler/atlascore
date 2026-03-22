import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle2, Clock, Dumbbell, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import RoutineCard from '@/components/routines/RoutineCard';
import RoutineForm from '@/components/routines/RoutineForm';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, SecondaryButton } from '@/components/shared/StablePage';

const DAYS_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function Routines() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const qc = useQueryClient();

  const { data: routines = [] } = useQuery({
    queryKey: ['routines', user?.email],
    queryFn: () => base44.entities.Routine.filter({ athlete_email: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: prescribedRoutines = [] } = useQuery({
    queryKey: ['prescribed-routines', user?.email],
    queryFn: () => base44.entities.Routine.filter({ athlete_email: user?.email, is_prescribed: true }),
    enabled: !!user?.email,
  });

  const deleteRoutine = useMutation({
    mutationFn: (id) => base44.entities.Routine.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rotina deletada');
    },
  });

  const cloneRoutine = useMutation({
    mutationFn: async (source) => {
      const newRoutine = {
        ...source,
        id: undefined,
        name: `${source.name} (Cópia)`,
        created_date: undefined,
        updated_date: undefined,
      };
      delete newRoutine.id;
      return base44.entities.Routine.create(newRoutine);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
      setShowClone(false);
      setCloneSource(null);
      toast.success('Rotina clonada com sucesso');
    },
  });

  const userRoutines = routines.filter(r => !r.is_prescribed);
  const activeRoutine = routines.find(r => r.active);

  return (
    <AppContainer maxWidth="max-w-6xl">
      <PageHeader
        eyebrow="Train"
        title="Rotinas de Treino"
        subtitle="Organize blocos recorrentes, distribua sessões na semana e mantenha um ponto de partida consistente para executar no painel de treino."
        actions={(
          <PrimaryButton className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Nova rotina
          </PrimaryButton>
        )}
      />

      {activeRoutine && (
        <Card className="border-[hsl(var(--ok)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.12),transparent_34%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--ok)/0.12)]">
                <CheckCircle2 className="w-5 h-5 text-[hsl(var(--ok))]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--ok))]">Rotina Ativa</p>
                <p className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{activeRoutine.name}</p>
              </div>
            </div>
            {activeRoutine.last_completed_date && (
              <div className="text-right">
                <p className="text-[11px] text-[hsl(var(--fg-3))]">Último completado</p>
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{new Date(activeRoutine.last_completed_date).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>

          <div className="mb-4 grid grid-cols-7 gap-2">
            {DAYS_ABBR.map((abbr, i) => {
              const dayWorkout = activeRoutine.days_of_week?.find(d => d.day === i);
              return (
                <div key={i} className={`flex flex-col items-center gap-1 rounded-[12px] border p-2 transition-colors ${
                  dayWorkout
                    ? 'border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.15)]'
                    : 'border-[hsl(var(--border)/0.68)] bg-[hsl(var(--fill)/0.74)]'
                }`}>
                  <p className="text-[10px] font-semibold text-[hsl(var(--fg))]">{abbr}</p>
                  {dayWorkout && (
                    <Dumbbell className="w-3.5 h-3.5 text-[hsl(var(--ok))]" strokeWidth={2} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-6 text-[12px] text-[hsl(var(--fg-2))]">
            {activeRoutine.estimated_duration_minutes && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[hsl(var(--fg-3))]" strokeWidth={2} />
                <span>{activeRoutine.estimated_duration_minutes}min por sessão</span>
              </div>
            )}
            {activeRoutine.total_exercises && (
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[hsl(var(--fg-3))]" strokeWidth={2} />
                <span>{activeRoutine.total_exercises} exercícios</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Section
        eyebrow="Library"
        title={`Todas as rotinas (${userRoutines.length})`}
        subtitle="Templates pessoais para repetir semanas, duplicar estruturas e ativar a melhor opção para o bloco atual."
      >
        {userRoutines.length === 0 ? (
          <Card className="px-5 py-4">
            <EmptyState
              icon={Calendar}
              title="Nenhuma rotina criada"
              description="Monte sua primeira rotina para distribuir sessões na semana e começar com uma estrutura recorrente."
              action={(
                <PrimaryButton className="gap-2" onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4" />
                  Criar primeira rotina
                </PrimaryButton>
              )}
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userRoutines.map(routine => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={() => deleteRoutine.mutate(routine.id)}
                onClone={() => {
                  setCloneSource(routine);
                  setShowClone(true);
                }}
              />
            ))}
          </div>
        )}
      </Section>

      {prescribedRoutines.length > 0 && (
        <Section
          eyebrow="Assigned"
          title="Rotinas prescritas"
          subtitle="Estruturas enviadas por coach ou profissional para você iniciar sem reconfigurar a semana."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescribedRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} isPrescribed onClone={() => {
                setCloneSource(routine);
                setShowClone(true);
              }} />
            ))}
          </div>
        </Section>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold tracking-[-0.03em]">Criar nova rotina</DialogTitle>
          </DialogHeader>
          <RoutineForm onSuccess={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showClone} onOpenChange={setShowClone}>
        <DialogContent className="rounded-[24px] border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold tracking-[-0.03em]">Clonar rotina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">Nome da cópia</p>
              <Input
                id="clone-name"
                defaultValue={`${cloneSource?.name} (Cópia)`}
                className="atlas-field h-11 rounded-[10px] border-0 px-4 text-[14px]"
              />
            </div>
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={() => setShowClone(false)} className="h-11 flex-1 rounded-[10px]">
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  const newName = document.getElementById('clone-name')?.value;
                  cloneRoutine.mutate({ ...cloneSource, name: newName || `${cloneSource?.name} (Cópia)` });
                }}
                disabled={cloneRoutine.isPending}
                className="h-11 flex-1 rounded-[10px]"
              >
                {cloneRoutine.isPending ? 'Clonando…' : 'Clonar'}
              </PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppContainer>
  );
}
