import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Droplets,
  Flame,
  LogOut,
  Mail,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import {
  ErrorState,
  LoadingState,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  formatNumber,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const PROFILE_FORM_SECTIONS = [
  {
    eyebrow: 'Baseline',
    title: 'Personal baseline',
    description: 'Dados pessoais essenciais para dar contexto ao resto da experiencia.',
    gridClassName: 'md:grid-cols-3',
    fields: [
      {
        key: 'phone',
        label: 'Telefone',
        type: 'tel',
        placeholder: '(11) 99999-0000',
        description: 'Contato rapido para referencia e suporte.',
      },
      {
        key: 'age',
        label: 'Idade',
        type: 'number',
        step: '1',
        unit: 'anos',
        placeholder: '29',
        description: 'Ajuda a contextualizar rotina e metas.',
      },
      {
        key: 'height',
        label: 'Altura',
        type: 'number',
        step: '1',
        unit: 'cm',
        placeholder: '178',
        description: 'Base para leitura de composicao e progresso.',
      },
    ],
  },
  {
    eyebrow: 'Body',
    title: 'Current body metrics',
    description: 'Ajuste direcao e referencia corporal de forma objetiva.',
    gridClassName: 'md:grid-cols-2',
    fields: [
      {
        key: 'current_weight',
        label: 'Peso atual',
        type: 'number',
        step: '0.1',
        unit: 'kg',
        placeholder: '82.4',
        description: 'Ponto de partida da fase atual.',
      },
      {
        key: 'target_weight',
        label: 'Peso alvo',
        type: 'number',
        step: '0.1',
        unit: 'kg',
        placeholder: '78.0',
        description: 'Meta corporal que guia a direcao do bloco.',
      },
    ],
  },
  {
    eyebrow: 'Targets',
    title: 'Daily performance targets',
    description: 'Targets que deixam nutricao, treino e recuperacao mais coerentes.',
    gridClassName: 'md:grid-cols-2 xl:grid-cols-3',
    fields: [
      {
        key: 'calories_target',
        label: 'Calorias alvo',
        type: 'number',
        step: '1',
        unit: 'kcal',
        placeholder: '2200',
        description: 'Base energetica do dia.',
      },
      {
        key: 'protein_target',
        label: 'Proteina alvo',
        type: 'number',
        step: '1',
        unit: 'g',
        placeholder: '160',
        description: 'Prioridade para recuperar e sustentar massa magra.',
      },
      {
        key: 'carbs_target',
        label: 'Carboidratos alvo',
        type: 'number',
        step: '1',
        unit: 'g',
        placeholder: '240',
        description: 'Combustivel util para o treino e o dia.',
      },
      {
        key: 'fat_target',
        label: 'Gordura alvo',
        type: 'number',
        step: '1',
        unit: 'g',
        placeholder: '60',
        description: 'Complementa energia e adesao nutricional.',
      },
      {
        key: 'water_target',
        label: 'Agua alvo',
        type: 'number',
        step: '0.1',
        unit: 'L',
        placeholder: '3.2',
        description: 'Ritmo diario de hidratacao.',
      },
    ],
  },
];

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

function hasValue(value) {
  return value !== '' && value != null;
}

function getPreferredName(displayName) {
  if (!displayName) return 'Athlete';
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function getInitials(name) {
  const chunks = String(name || 'Athlete')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return chunks.map((chunk) => chunk[0]?.toUpperCase() || '').join('') || 'AT';
}

function getRoleLabel(role) {
  const labels = {
    athlete: 'Athlete',
    coach: 'Coach',
    nutritionist: 'Nutritionist',
    clinician: 'Clinician',
    admin: 'Admin',
  };

  return labels[role] || 'Athlete';
}

function countFilledFields(form) {
  return Object.values(form).filter((value) => String(value || '').trim().length > 0).length;
}

function formatValue(value, suffix, options = {}) {
  if (!hasValue(value)) return '--';
  return `${formatNumber(value, options)} ${suffix}`;
}

function getReadinessCopy(score) {
  if (score >= 82) {
    return 'Seu perfil ja esta maduro o bastante para deixar metas e leitura do produto mais precisas.';
  }

  if (score >= 45) {
    return 'A base principal esta montada. Complete os campos restantes para dar mais contexto ao seu dia.';
  }

  return 'Defina baseline, targets e direcao para o produto ficar mais pessoal desde a primeira leitura.';
}

function getGoalSummary(goal) {
  if (!goal) {
    return 'Defina um objetivo claro para o treino e o restante do produto responder com mais contexto.';
  }

  const trimmedGoal = goal.trim();
  return trimmedGoal.length > 140 ? `${trimmedGoal.slice(0, 137).trim()}...` : trimmedGoal;
}

function getWeightDirection(currentWeight, targetWeight) {
  const hasCurrent = hasValue(currentWeight);
  const hasTarget = hasValue(targetWeight);

  if (hasCurrent && hasTarget) {
    const current = Number(currentWeight);
    const target = Number(targetWeight);
    const delta = target - current;
    const deltaValue = Math.abs(delta);

    if (delta === 0) {
      return {
        value: `${formatNumber(current, { maximumFractionDigits: 1 })} kg`,
        detail: 'Peso atual e meta estao alinhados na mesma faixa.',
      };
    }

    return {
      value: `${formatNumber(current, { maximumFractionDigits: 1 })} -> ${formatNumber(target, { maximumFractionDigits: 1 })} kg`,
      detail: `${delta > 0 ? 'Ganho' : 'Reducao'} planejada de ${formatNumber(deltaValue, {
        maximumFractionDigits: 1,
      })} kg.`,
    };
  }

  if (hasCurrent) {
    return {
      value: `${formatNumber(currentWeight, { maximumFractionDigits: 1 })} kg`,
      detail: 'Peso atual informado. Falta definir o alvo corporal.',
    };
  }

  if (hasTarget) {
    return {
      value: `${formatNumber(targetWeight, { maximumFractionDigits: 1 })} kg`,
      detail: 'Meta corporal definida. Falta registrar o peso atual.',
    };
  }

  return {
    value: 'Sem direcao',
    detail: 'Preencha peso atual e peso alvo para enxergar a estrategia corporal.',
  };
}

function getMacroSignature(form) {
  const parts = [
    hasValue(form.protein_target) ? `P ${formatNumber(form.protein_target)}g` : null,
    hasValue(form.carbs_target) ? `C ${formatNumber(form.carbs_target)}g` : null,
    hasValue(form.fat_target) ? `G ${formatNumber(form.fat_target)}g` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : 'Macros pendentes';
}

function HeroStat({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 break-words text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function QuickMetricCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="atlas-card flex h-full flex-col justify-between px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="atlas-metric-label">{label}</p>
          <p className="text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
      </div>
      <p className="mt-5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </article>
  );
}

function AccountDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
          {label}
        </p>
        <p className="mt-1 truncate text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ReadoutItem({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function ProfileField({ field, value, onChange, multiline = false }) {
  return (
    <label
      className={cn(
        'group block rounded-[26px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4 shadow-[var(--shadow-xs)] transition-all duration-200 focus-within:border-[hsl(var(--fg)/0.18)] focus-within:bg-[hsl(var(--card))]',
        field.className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {field.label}
          </p>
          {field.description ? (
            <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
              {field.description}
            </p>
          ) : null}
        </div>

        {field.unit ? (
          <span className="shrink-0 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.7)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
            {field.unit}
          </span>
        ) : null}
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          className="mt-4 min-h-[140px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
        />
      ) : (
        <input
          type={field.type}
          step={field.step}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          className="mt-4 w-full border-0 bg-transparent p-0 text-[15px] font-medium tracking-[-0.02em] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
        />
      )}
    </label>
  );
}

export default function Profile() {
  return (
    <SafePageBoundary
      title="Profile"
      subtitle="Modo seguro do perfil premium."
      maxWidth="max-w-6xl"
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
  const [notice, setNotice] = useState(null);
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
      setForm({ ...EMPTY_FORM });
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
      setNotice({
        tone: 'success',
        message: 'Perfil salvo com sucesso.',
      });
    },
    onError: () => {
      setNotice({
        tone: 'error',
        message: 'Nao foi possivel salvar o perfil.',
      });
    },
  });

  const displayName = user?.full_name || user?.email || 'Athlete';
  const preferredName = getPreferredName(displayName);
  const initials = getInitials(displayName);
  const roleLabel = getRoleLabel(user?.atlas_role);
  const filledFields = countFilledFields(form);
  const totalFields = Object.keys(EMPTY_FORM).length;
  const completionScore = Math.round((filledFields / totalFields) * 100);
  const readinessCopy = getReadinessCopy(completionScore);
  const weightDirection = getWeightDirection(form.current_weight, form.target_weight);
  const goalSummary = getGoalSummary(form.training_goal);
  const macroSignature = getMacroSignature(form);
  const calorieTargetValue = hasValue(form.calories_target)
    ? `${formatNumber(form.calories_target)} kcal`
    : 'Target pendente';
  const proteinTargetValue = formatValue(form.protein_target, 'g');
  const waterTargetValue = formatValue(form.water_target, 'L', { maximumFractionDigits: 1 });
  const draftStatus = profileId ? 'Perfil configurado' : 'Primeiro setup';
  const payload = buildProfilePayload(form);

  const handleFieldChange = (key) => (event) => {
    setNotice(null);
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleReset = () => {
    setNotice(null);
    setForm({ ...EMPTY_FORM });
  };

  return (
    <div className="atlas-page-shell">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-6 lg:px-8 lg:py-10">
        <section className="atlas-page-header relative overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--brand)/0.08)] via-[hsl(var(--ok)/0.04)] to-transparent" />
          <div className="pointer-events-none absolute -right-10 top-10 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.08)] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="atlas-overline">Profile</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Premium health setup
                  </span>
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="atlas-display-title">{preferredName}, keep your baseline sharp.</h1>
                  <p className="max-w-2xl text-[15px] leading-7 text-[hsl(var(--fg-2))] lg:text-[16px]">
                    Conta, targets e identidade do atleta agora leem como uma unica superficie:
                    sofisticada, pessoal e pronta para sustentar nutricao, treino e performance.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to={ROUTES.myDiet}>
                    Abrir Meu Diet
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to={ROUTES.myWorkout}>Abrir Meu Workout</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroStat
                  label="Session"
                  value="Supabase active"
                  detail={user?.email || 'Sessao autenticada e pronta para uso.'}
                />
                <HeroStat
                  label="Profile"
                  value={`${completionScore}% aligned`}
                  detail={`${filledFields} de ${totalFields} campos principais preenchidos.`}
                />
                <HeroStat
                  label="Daily fuel"
                  value={calorieTargetValue}
                  detail={macroSignature}
                />
              </div>
            </div>

            <aside className="rounded-[30px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.6)] p-5 shadow-[var(--shadow-xs)] lg:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="atlas-overline">Conta</p>
                  <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                    Identidade premium, acesso estavel.
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] text-[hsl(var(--fg-2))]">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
                </div>
              </div>

              <div className="rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[16px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                        {displayName}
                      </p>
                      <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                        {roleLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      Sua autenticacao ja esta ativa. O restante da experiencia agora fica ancorado
                      neste perfil com o fluxo de dados atual preservado.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Auth ativa
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                    {draftStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <AccountDetail icon={Mail} label="Email" value={user?.email || '--'} />
                <AccountDetail icon={UserCircle2} label="Role" value={roleLabel} />
                <AccountDetail icon={Sparkles} label="Profile state" value={draftStatus} />
              </div>

              <Button type="button" variant="outline" size="lg" className="mt-5 w-full" onClick={() => logout?.()}>
                <LogOut className="h-4 w-4" strokeWidth={1.9} />
                Sair da conta
              </Button>
            </aside>
          </div>
        </section>

        <StatusBanner>
          Auth real com Supabase segue intacta. Esta tela preserva o fluxo atual de dados do perfil
          enquanto ganha a nova camada visual premium.
        </StatusBanner>

        {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

        {profileQuery.isLoading ? (
          <LoadingState
            title="Carregando seu perfil"
            description="Estamos trazendo os dados existentes para essa nova leitura visual sem interromper a pagina."
          />
        ) : null}

        {!profileQuery.isLoading && profileQuery.isError ? (
          <ErrorState
            title="Profile em modo seguro"
            description="Parte dos dados nao carregou, mas voce ainda pode revisar a conta e salvar as informacoes principais."
          />
        ) : null}

        {!profileQuery.isLoading ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <QuickMetricCard
                label="Weight direction"
                value={weightDirection.value}
                detail={weightDirection.detail}
                icon={Scale}
              />
              <QuickMetricCard
                label="Calories"
                value={calorieTargetValue}
                detail={
                  hasValue(form.calories_target)
                    ? 'Target energetico definido para dar base ao dia.'
                    : 'Configure um alvo calorico para ancorar a leitura nutricional.'
                }
                icon={Flame}
              />
              <QuickMetricCard
                label="Protein"
                value={proteinTargetValue}
                detail={
                  hasValue(form.protein_target)
                    ? 'Proteina alvo pronta para sustentar recuperacao e composicao.'
                    : 'Defina a proteina alvo para fechar o baseline nutricional.'
                }
                icon={Target}
              />
              <QuickMetricCard
                label="Hydration"
                value={waterTargetValue}
                detail={
                  hasValue(form.water_target)
                    ? 'Meta diaria pronta para manter constancia de hidratacao.'
                    : 'Configure uma meta de agua para completar o setup diario.'
                }
                icon={Droplets}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
              <SectionCard
                title="Profile blueprint"
                subtitle="Organize baseline, composicao corporal e targets em blocos claros, com a mesma linguagem sofisticada do restante do produto."
              >
                {!profileData ? (
                  <div className="mb-6 rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--brand)/0.05)] px-5 py-5 shadow-[var(--shadow-xs)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] text-[hsl(var(--brand))]">
                        <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                          Primeiro setup em andamento
                        </p>
                        <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                          Preencha os dados abaixo para transformar a rota de perfil em uma base
                          pessoal mais completa e coerente com o restante do app.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mb-6 rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.52)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="atlas-metric-label">Profile readiness</p>
                      <p className="mt-3 text-[2.25rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
                        {completionScore}%
                      </p>
                      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {readinessCopy}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                      {filledFields} de {totalFields} campos
                    </span>
                  </div>

                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--card))]">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--fg))]"
                      style={{ width: `${completionScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {PROFILE_FORM_SECTIONS.map((section) => (
                    <section
                      key={section.title}
                      className="rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] px-5 py-5 shadow-[var(--shadow-xs)]"
                    >
                      <div className="mb-5">
                        <p className="atlas-overline">{section.eyebrow}</p>
                        <h3 className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                          {section.title}
                        </h3>
                        <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                          {section.description}
                        </p>
                      </div>

                      <div className={cn('grid gap-3', section.gridClassName)}>
                        {section.fields.map((field) => (
                          <ProfileField
                            key={field.key}
                            field={field}
                            value={form[field.key]}
                            onChange={handleFieldChange(field.key)}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                  <section className="rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] px-5 py-5 shadow-[var(--shadow-xs)]">
                    <div className="mb-5">
                      <p className="atlas-overline">Direction</p>
                      <h3 className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                        Training goal
                      </h3>
                      <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        Descreva o foco principal do momento para a experiencia parecer mais sua e
                        menos generica.
                      </p>
                    </div>

                    <ProfileField
                      multiline
                      field={{
                        key: 'training_goal',
                        label: 'Objetivo de treino',
                        placeholder:
                          'Ex.: perder gordura com alta energia, ganhar massa com controle, melhorar consistencia e rotina.',
                        description:
                          'Use uma frase curta e honesta sobre o resultado que voce quer perseguir agora.',
                      }}
                      value={form.training_goal}
                      onChange={handleFieldChange('training_goal')}
                    />
                  </section>
                </div>

                <div className="mt-8 rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.52)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="atlas-metric-label">Persistencia</p>
                      <p className="mt-3 text-[16px] font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">
                        Salve o perfil sem alterar a logica atual de dados.
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        Esta acao atualiza o perfil com o fluxo existente e mantem a pagina pronta
                        para o restante da experiencia premium.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={handleReset}>
                        Limpar campos
                      </Button>
                      <Button
                        type="button"
                        disabled={saveProfile.isPending}
                        onClick={() => saveProfile.mutate(payload)}
                      >
                        {saveProfile.isPending ? 'Salvando...' : 'Salvar perfil'}
                      </Button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                className="relative overflow-hidden"
                title="Profile readout"
                subtitle="Uma leitura curta e pessoal de como o restante do produto deve enxergar voce hoje."
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--brand)/0.07)] to-transparent" />

                <div className="relative space-y-5">
                  <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))]">
                        <Target className="h-4 w-4" strokeWidth={1.9} />
                      </div>
                      <div>
                        <p className="atlas-metric-label">Current focus</p>
                        <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                          {form.training_goal ? 'Goal defined' : 'Direction pending'}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                      {goalSummary}
                    </p>
                  </div>

                  <ReadoutItem
                    label="Daily intake"
                    value={calorieTargetValue}
                    detail={
                      macroSignature === 'Macros pendentes'
                        ? 'Complete proteina, carboidratos e gordura para uma leitura nutricional mais precisa.'
                        : macroSignature
                    }
                  />
                  <ReadoutItem
                    label="Body direction"
                    value={weightDirection.value}
                    detail={weightDirection.detail}
                  />
                  <ReadoutItem
                    label="Hydration cadence"
                    value={waterTargetValue}
                    detail={
                      hasValue(form.water_target)
                        ? 'Meta diaria definida para manter consistencia de energia e rotina.'
                        : 'Defina a meta de agua para fechar a preparacao diaria.'
                    }
                  />
                  <ReadoutItem
                    label="Structure"
                    value={formatValue(form.height, 'cm')}
                    detail={
                      hasValue(form.height)
                        ? 'Altura registrada para deixar o baseline mais completo.'
                        : 'Altura ainda nao definida neste setup.'
                    }
                  />

                  <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                    <p className="atlas-metric-label">Why it matters</p>
                    <p className="mt-3 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                      Um perfil claro deixa metas, planos e contextos mais consistentes sem adicionar
                      friccao ao backend. A pagina passa a parecer pessoal porque o sistema le voce
                      com mais nitidez.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
                        <Ruler className="h-4 w-4" strokeWidth={1.9} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                          Refinado para leitura rapida
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                          A hierarquia agora separa identidade, metrics rapidas e formulario em
                          blocos muito mais claros.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
