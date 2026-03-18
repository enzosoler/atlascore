import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, Dumbbell, UtensilsCrossed, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import {
  MetricCard,
  PageShell,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';

function QuickLink({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </Link>
  );
}

export default function Today() {
  return (
    <SafePageBoundary
      title="Today"
      subtitle="Mock local do dashboard enquanto os dados remotos ainda sao migrados."
      maxWidth="max-w-6xl"
      fallbackDescription="O dashboard local abriu em modo seguro."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}

function TodayContent() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email || 'Athlete';

  return (
    <PageShell
      title="Today"
      subtitle="Dashboard local temporario para navegar pelo app sem depender do Base44."
      maxWidth="max-w-6xl"
    >
      <StatusBanner tone="warning">
        Primeiro ponto de falha encontrado: a rota <strong>/Today</strong> ainda fazia chamadas a
        <strong> base44.entities.Protocol.*</strong>. Nesta etapa, ela foi trocada por um mock local
        sem backend.
      </StatusBanner>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sessao"
          value="Ativa"
          hint="Autenticacao mock local em funcionamento."
          icon={User}
        />
        <MetricCard
          label="Usuario"
          value={displayName}
          hint={user?.email || 'Sessao sem backend'}
          icon={Activity}
        />
        <MetricCard
          label="Nutricao"
          value="Mock"
          hint="Sem dados remotos nesta etapa."
          icon={UtensilsCrossed}
        />
        <MetricCard
          label="Treino"
          value="Mock"
          hint="Sem dados remotos nesta etapa."
          icon={Dumbbell}
        />
      </section>

      <SectionCard
        title="Continuar navegando"
        subtitle="Esses atalhos locais permitem validar as telas principais enquanto o frontend eh desacoplado do Base44 por partes."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            to={ROUTES.nutrition}
            icon={UtensilsCrossed}
            title="Nutricao"
            description="Abrir a area de refeicoes e metas."
          />
          <QuickLink
            to={ROUTES.workouts}
            icon={Dumbbell}
            title="Treinos"
            description="Abrir a area de treinos."
          />
          <QuickLink
            to={ROUTES.atlasAI}
            icon={Brain}
            title="Atlas AI"
            description="Abrir a area de insights e IA."
          />
          <QuickLink
            to={ROUTES.profile}
            icon={User}
            title="Perfil"
            description="Abrir a tela de perfil local."
          />
        </div>
      </SectionCard>
    </PageShell>
  );
}
