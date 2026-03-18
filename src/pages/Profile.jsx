import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Mail, Target, UserCircle2, Waves } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  SecondaryButton,
  StatusBanner,
} from '@/components/shared/StablePage';

const EMPTY_FORM = {
  phone: '',
  age: '',
  height: '',
  current_weight: '',
  target_weight: '',
  training_goal: '',
  calories_target: '',
  protein_target: '',
  carbs_target: '',
  fat_target: '',
  water_target: '',
};

const NUMERIC_FIELDS = [
  'age',
  'height',
  'current_weight',
  'target_weight',
  'calories_target',
  'protein_target',
  'carbs_target',
  'fat_target',
  'water_target',
];

const LOCAL_PROFILE_STORAGE_KEY = 'atlas_local_profile_store';

function readStoredProfiles() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredProfiles(profiles) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function getProfileScope(user) {
  return user?.email || user?.id || 'anonymous';
}

function createLocalProfileId(scope) {
  const normalizedScope = String(scope || 'anonymous')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `local-profile-${normalizedScope || 'anonymous'}`;
}

function buildProfilePayload(form) {
  return Object.entries(form).reduce((accumulator, [key, value]) => {
    accumulator[key] =
      value === '' || value == null ? '' : NUMERIC_FIELDS.includes(key) ? Number(value) : value;
    return accumulator;
  }, {});
}

async function loadLocalProfile(user) {
  const profiles = readStoredProfiles();
  const scope = getProfileScope(user);
  const profile = profiles[scope];
  return profile && typeof profile === 'object' ? profile : null;
}

async function saveLocalProfile(user, currentProfileId, payload) {
  const profiles = readStoredProfiles();
  const scope = getProfileScope(user);
  const existingProfile =
    profiles[scope] && typeof profiles[scope] === 'object' ? profiles[scope] : {};

  const nextProfile = {
    ...existingProfile,
    ...payload,
    id: currentProfileId || existingProfile.id || createLocalProfileId(scope),
  };

  profiles[scope] = nextProfile;
  writeStoredProfiles(profiles);

  return nextProfile;
}

export default function Profile() {
  return (
    <SafePageBoundary
      title="Profile"
      subtitle="Modo seguro do perfil."
      maxWidth="max-w-5xl"
      fallbackDescription="Profile page loaded. O conteudo principal falhou, mas a rota continua acessivel."
    >
      <ProfileContent />
    </SafePageBoundary>
  );
}

function ProfileContent() {
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [profileId, setProfileId] = useState(null);
  const [notice, setNotice] = useState('');
  const profileScope = getProfileScope(user);
  const profileQueryKey = ['profile-stable', profileScope];

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => loadLocalProfile(user),
  });

  const profileData =
    profileQuery.data && typeof profileQuery.data === 'object' ? profileQuery.data : null;

  useEffect(() => {
    if (!profileData) {
      setProfileId(null);
      setForm(EMPTY_FORM);
      return;
    }

    setProfileId(profileData.id || null);
    setForm((current) => ({
      ...current,
      ...Object.fromEntries(
        Object.keys(EMPTY_FORM).map((field) => {
          const value = profileData[field];
          return [field, value == null ? '' : String(value)];
        })
      ),
    }));
  }, [profileData, profileScope]);

  const saveProfile = useMutation({
    mutationFn: (payload) => saveLocalProfile(user, profileId, payload),
    onSuccess: (result) => {
      if (!profileId && result?.id) setProfileId(result.id);
      qc.setQueryData(profileQueryKey, result);
      setNotice('Perfil salvo com sucesso.');
    },
    onError: () => {
      setNotice('Nao foi possivel salvar o perfil.');
    },
  });

  const payload = buildProfilePayload(form);

  return (
    <PageShell
      title="Profile"
      subtitle="Pagina reconstruida para abrir sem erro e cobrir o essencial: dados da conta, metas e preferencias basicas."
      maxWidth="max-w-5xl"
    >
      {notice ? <StatusBanner>{notice}</StatusBanner> : null}

      {profileQuery.isLoading ? (
        <LoadingState
          title="Profile page loaded"
          description="Estamos carregando os dados do perfil e mantendo a pagina aberta em modo seguro."
        />
      ) : null}

      {!profileQuery.isLoading && profileQuery.isError ? (
        <ErrorState
          title="Profile em modo seguro"
          description="Parte dos dados nao carregou, mas voce ainda pode abrir a pagina e salvar as informacoes principais."
        />
      ) : null}

      {!profileQuery.isLoading && !profileData ? (
        <SectionCard title="Profile page loaded" subtitle="Perfil ainda nao configurado.">
          <EmptyState
            title="Nenhum perfil salvo ainda"
            description="Voce pode preencher os dados basicos abaixo e salvar o primeiro perfil sem sair desta pagina."
          />
        </SectionCard>
      ) : null}

      {!profileQuery.isLoading ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Conta"
              value={user?.full_name || 'Atleta'}
              hint={user?.email || 'Sem email disponivel'}
              icon={UserCircle2}
            />
            <MetricCard
              label="Peso atual"
              value={form.current_weight ? `${form.current_weight} kg` : '--'}
              hint={form.target_weight ? `Meta ${form.target_weight} kg` : 'Defina uma meta de peso'}
              icon={Target}
            />
            <MetricCard
              label="Calorias alvo"
              value={form.calories_target ? `${form.calories_target} kcal` : '--'}
              hint={form.training_goal || 'Defina um objetivo de treino'}
              icon={Mail}
            />
            <MetricCard
              label="Agua alvo"
              value={form.water_target ? `${form.water_target} L` : '--'}
              hint="Meta diaria configurada no perfil."
              icon={Waves}
            />
          </section>

          <SectionCard
            title="Conta"
            subtitle="Informacoes principais da autenticacao atual."
            actions={
              <PrimaryButton type="button" onClick={() => logout?.()}>
                Sair da conta
              </PrimaryButton>
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Nome
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-950">
                  {user?.full_name || 'Atleta'}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Email
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-950">{user?.email || '--'}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={ROUTES.myDiet}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Abrir Meu Diet
              </Link>
              <Link
                to={ROUTES.myWorkout}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Abrir Meu Workout
              </Link>
            </div>
          </SectionCard>

          <SectionCard
            title="Dados do perfil"
            subtitle="Formulario basico para metas e preferencias essenciais."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['phone', 'Telefone', 'text'],
                ['age', 'Idade', 'number'],
                ['height', 'Altura (cm)', 'number'],
                ['current_weight', 'Peso atual (kg)', 'number'],
                ['target_weight', 'Peso alvo (kg)', 'number'],
                ['calories_target', 'Calorias alvo', 'number'],
                ['protein_target', 'Proteina alvo (g)', 'number'],
                ['carbs_target', 'Carboidratos alvo (g)', 'number'],
                ['fat_target', 'Gordura alvo (g)', 'number'],
                ['water_target', 'Agua alvo (L)', 'number'],
              ].map(([key, label, type]) => (
                <label key={key} className="text-sm text-zinc-700">
                  {label}
                  <input
                    type={type}
                    step={type === 'number' ? '0.1' : undefined}
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [key]: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none focus:border-zinc-400"
                  />
                </label>
              ))}

              <label className="text-sm text-zinc-700 md:col-span-2">
                Objetivo de treino
                <textarea
                  value={form.training_goal}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, training_goal: event.target.value }))
                  }
                  placeholder="Ex.: perder gordura, ganhar massa, melhorar consistencia"
                  className="mt-1 min-h-[110px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none focus:border-zinc-400"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <SecondaryButton type="button" onClick={() => setForm(EMPTY_FORM)}>
                Limpar
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={saveProfile.isPending}
                onClick={() => saveProfile.mutate(payload)}
              >
                {saveProfile.isPending ? 'Salvando...' : 'Salvar perfil'}
              </PrimaryButton>
            </div>
          </SectionCard>
        </>
      ) : null}
    </PageShell>
  );
}
