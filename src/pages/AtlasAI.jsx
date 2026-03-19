import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useAuth } from '@/lib/AuthContext';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import { FilterChip } from '@/components/shared/StablePage';
import {
  ArrowUpRight,
  Brain,
  Clock3,
  Loader2,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/ai/MessageBubble';
import { cn } from '@/lib/utils';

const LOCAL_ATLAS_AI_STORAGE_KEY = 'atlas-ai-local-conversations';
const LOCAL_PROFILE_STORAGE_KEY = 'atlas_local_profile_store';
const LOCAL_FREE_PROMPTS_KEY = 'atlas-ai-free-prompts';
const FREE_PROMPT_LIMIT = 3;

const PROMPTS = [
  {
    id: 'nutrition',
    title: 'Aderencia nutricional',
    prompt: 'Como está minha aderência nutricional?',
    description: 'Veja onde sua rotina alimentar está sustentando ou travando a semana.',
  },
  {
    id: 'weight',
    title: 'Progresso de peso',
    prompt: 'Analise meu progresso de peso',
    description: 'Leia tendência, distância até a meta e próximos ajustes com clareza.',
  },
  {
    id: 'labs',
    title: 'Leitura de exames',
    prompt: 'O que meus exames indicam?',
    description: 'Abra uma interpretação guiada e contextual do que merece atenção.',
  },
  {
    id: 'supplements',
    title: 'Suplementação',
    prompt: 'Quais suplementos combinam com meus objetivos?',
    description: 'Priorize o que faz sentido para seu objetivo antes de empilhar intervenção.',
  },
  {
    id: 'weekly',
    title: 'Resumo semanal',
    prompt: 'Gere um resumo semanal',
    description: 'Condense a semana em uma leitura rápida, com foco na próxima decisão.',
  },
  {
    id: 'plan',
    title: 'Plano vs execução',
    prompt: 'Compare meu plano vs execução',
    description: 'Entenda intenção versus consistência real sem abrir várias telas.',
  },
];

function createConversation(name) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    metadata: {
      name: name || new Date().toLocaleDateString('pt-BR'),
    },
    messages: [],
    updated_at: new Date().toISOString(),
  };
}

function readJsonStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getAtlasScope(user) {
  return user?.email || user?.id || 'anonymous';
}

function isLocalMockUser(user) {
  return user?.id?.startsWith('local-') || user?.email?.endsWith('@local.dev');
}

function sortConversations(list) {
  return [...list].sort(
    (a, b) => new Date(b?.updated_at || 0).getTime() - new Date(a?.updated_at || 0).getTime()
  );
}

function sanitizeConversations(raw) {
  if (!Array.isArray(raw)) return [];

  const conversations = raw
    .filter(Boolean)
    .map((conversation, index) => ({
      id: conversation?.id || `local-restored-${index}`,
      metadata: {
        name: conversation?.metadata?.name || 'Conversa',
      },
      messages: Array.isArray(conversation?.messages)
        ? conversation.messages
            .filter(message => message && typeof message.content === 'string')
            .map(message => ({
              role: message.role === 'assistant' ? 'assistant' : 'user',
              content: message.content,
            }))
        : [],
      updated_at: conversation?.updated_at || new Date().toISOString(),
    }));

  return sortConversations(conversations);
}

function readStoredConversations(user) {
  const store = readJsonStorage(LOCAL_ATLAS_AI_STORAGE_KEY, {});
  return sanitizeConversations(store[getAtlasScope(user)]);
}

function writeStoredConversations(user, conversations) {
  const store = readJsonStorage(LOCAL_ATLAS_AI_STORAGE_KEY, {});
  store[getAtlasScope(user)] = conversations;
  writeJsonStorage(LOCAL_ATLAS_AI_STORAGE_KEY, store);
}

function readLocalProfile(user) {
  const profiles = readJsonStorage(LOCAL_PROFILE_STORAGE_KEY, {});
  const profile = profiles[getAtlasScope(user)];
  return profile && typeof profile === 'object' ? profile : null;
}

function readFreePromptCount(user) {
  const store = readJsonStorage(LOCAL_FREE_PROMPTS_KEY, {});
  return typeof store[getAtlasScope(user)] === 'number' ? store[getAtlasScope(user)] : 0;
}

function writeFreePromptCount(user, count) {
  const store = readJsonStorage(LOCAL_FREE_PROMPTS_KEY, {});
  store[getAtlasScope(user)] = count;
  writeJsonStorage(LOCAL_FREE_PROMPTS_KEY, store);
}

function appendMessage(list, conversationId, message) {
  return sortConversations(
    list.map(conversation =>
      conversation.id === conversationId
        ? {
            ...conversation,
            messages: [...conversation.messages, message],
            updated_at: new Date().toISOString(),
          }
        : conversation
    )
  );
}

function buildMacroSummary(profile) {
  const parts = [];

  if (profile?.protein_target) parts.push(`${profile.protein_target} g de proteína`);
  if (profile?.carbs_target) parts.push(`${profile.carbs_target} g de carboidratos`);
  if (profile?.fat_target) parts.push(`${profile.fat_target} g de gordura`);
  if (profile?.water_target) parts.push(`${profile.water_target} L de água`);

  return parts.join(', ');
}

function formatWeightGap(currentWeight, targetWeight) {
  if (!Number.isFinite(currentWeight) || !Number.isFinite(targetWeight)) return null;

  const delta = Math.abs(targetWeight - currentWeight);
  const formattedDelta = Number.isInteger(delta) ? String(delta) : delta.toFixed(1);

  if (targetWeight > currentWeight) {
    return `faltam cerca de ${formattedDelta} kg para a meta de ganho`;
  }

  if (targetWeight < currentWeight) {
    return `faltam cerca de ${formattedDelta} kg para a meta de redução`;
  }

  return 'você já está exatamente no peso-alvo';
}

function buildMockReply(user, content) {
  const normalized = content.toLowerCase();
  const profile = readLocalProfile(user);
  const goal = profile?.training_goal;
  const currentWeight = Number(profile?.current_weight);
  const targetWeight = Number(profile?.target_weight);
  const calories = profile?.calories_target ? `${profile.calories_target} kcal` : null;
  const macros = buildMacroSummary(profile);
  const weightGap = formatWeightGap(currentWeight, targetWeight);
  const modeLine = 'Modo local: resposta simulada sem Base44, usando apenas o perfil salvo nesta migração.';

  if (normalized.includes('ader') || normalized.includes('nutri')) {
    return [
      'Resumo local simulado da sua aderencia nutricional:',
      calories
        ? `- Meta calórica salva no perfil: **${calories}**.`
        : '- Ainda não encontrei meta calórica salva no perfil local.',
      macros
        ? `- Metas registradas hoje: ${macros}.`
        : '- Proteína, carboidratos, gordura e água ainda não foram definidos no perfil local.',
      goal
        ? `- Seu objetivo atual é **${goal}**, então eu avaliaria aderência pelo quanto a rotina diária sustenta essa meta.`
        : '- Sem objetivo salvo, eu trataria aderência como consistência básica de refeições e hidratação.',
      '',
      `Proximo passo sugerido: manter uma ancora proteica no fim do dia e repetir as refeicoes que ja funcionaram bem. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('peso') || normalized.includes('progresso')) {
    return [
      'Leitura local simulada do seu progresso de peso:',
      Number.isFinite(currentWeight)
        ? `- Peso atual salvo: **${currentWeight} kg**.`
        : '- Ainda não encontrei peso atual salvo no perfil local.',
      Number.isFinite(targetWeight)
        ? `- Meta registrada: **${targetWeight} kg**${weightGap ? ` e ${weightGap}.` : '.'}`
        : '- Ainda não encontrei peso-alvo salvo para comparar tendência.',
      goal
        ? `- Com o objetivo **${goal}**, eu acompanharia peso junto com energia, treino e consistência semanal.`
        : '- Para uma leitura melhor, vale salvar objetivo e meta no Profile.',
      '',
      `Se quiser, posso transformar essa analise em um plano simples de ajustes para treino, sono e calorias. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('exame')) {
    return [
      'Analise local simulada dos exames:',
      '- Nesta etapa local eu ainda não tenho exames sincronizados nesta rota.',
      goal
        ? `- Mesmo assim, já dá para priorizar a leitura com base no objetivo **${goal}**.`
        : '- Sem objetivo salvo, eu começaria definindo meta principal, sintomas e rotina recente.',
      '- A interpretação faz mais sentido quando combinada com sintomas, sono e carga de treino.',
      '',
      `Nesta rota desacoplada, eu estou respondendo com mock local e sem acessar exames reais. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('suplement')) {
    return [
      'Sugestão local simulada para suplementação:',
      goal
        ? `- Eu alinharia qualquer suplemento primeiro ao objetivo **${goal}**.`
        : '- Sem objetivo salvo, eu evitaria sugerir suplemento específico cedo demais.',
      calories || macros
        ? '- Como você já tem metas no perfil, eu priorizaria consistência alimentar antes de empilhar intervenção.'
        : '- Antes de pensar em suplemento, vale definir ingestão diária e hidratação no Profile.',
      '- Creatina e proteína costumam ser as opções mais fáceis de justificar quando base, treino e tolerância estão organizados.',
      '- Cafeína, ômega-3 e vitamina D dependem mais do seu contexto e dos exames.',
      '',
      `A melhor combinação muda conforme objetivo, rotina e tolerância individual. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('resumo') || normalized.includes('semana')) {
    return [
      'Resumo semanal local simulado:',
      goal
        ? `- Foco principal da semana: **${goal}**.`
        : '- Ainda falta um objetivo principal salvo para resumir a semana com mais contexto.',
      Number.isFinite(currentWeight)
        ? `- Peso de referência salvo: **${currentWeight} kg**${Number.isFinite(targetWeight) ? ` para uma meta de **${targetWeight} kg**.` : '.'}`
        : '- Ainda não há peso salvo para eu usar como referência desta semana.',
      calories
        ? `- Meta diária registrada: **${calories}**${macros ? ` com ${macros}.` : '.'}`
        : '- As metas nutricionais ainda não foram definidas no perfil local.',
      `- Foco da próxima semana: repetir o que funcionou e proteger a rotina de descanso. ${modeLine}`,
    ].join('\n');
  }

  if (
    normalized.includes('plano') ||
    normalized.includes('execu') ||
    normalized.includes('compare')
  ) {
    return [
      'Comparação local simulada entre plano e execução:',
      '- O layout do chat já suporta esse fluxo, mas nesta etapa local ainda não tenho treino, dieta ou check-ins sincronizados automáticamente.',
      goal
        ? `- Enquanto isso, eu usaria o objetivo **${goal}** como régua para comparar intenção vs consistência real.`
        : '- Sem objetivo salvo, a comparação entre plano e execução fica genérica demais.',
      '- Maior ganho imediato costuma vir de reduzir a fricção entre o que foi planejado e o que realmente cabe na rotina.',
      '',
      `Posso continuar com uma versão resumida ou com recomendações práticas. ${modeLine}`,
    ].join('\n');
  }

  return [
    'Resposta local simulada do Atlas AI:',
    `- Sua pergunta foi: **"${content}"**`,
    goal ? `- Hoje o objetivo salvo no seu perfil é **${goal}**.` : '- Ainda não encontrei um objetivo salvo no Profile.',
    calories
      ? `- Sua principal meta nutricional salva é **${calories}**${macros ? ` com ${macros}.` : '.'}`
      : '- Se você salvar calorias e macros no Profile, o chat fica mais contextual.',
    `- Nesta rota, o chat esta usando mock local e não consulta Base44 nem LLM real. ${modeLine}`,
  ].join('\n');
}

function formatConversationTimestamp(value) {
  if (!value) return 'Sem histórico';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem histórico';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat('pt-BR', isToday ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short' }).format(date);
}

function getConversationPreview(conversation) {
  const lastMessage = conversation?.messages?.[conversation.messages.length - 1];
  if (!lastMessage?.content) return 'Sem mensagens ainda. Abra uma nova leitura contextual.';

  const preview = lastMessage.content.replace(/\s+/g, ' ').trim();
  return preview.length > 110 ? `${preview.slice(0, 107)}...` : preview;
}

function getMessageCountLabel(count) {
  if (!count) return 'Sem mensagens';
  return `${count} ${count === 1 ? 'mensagem' : 'mensagens'}`;
}

function buildProfileContext(profile) {
  const pills = [];

  if (profile?.training_goal) {
    pills.push({ label: 'Objetivo', value: profile.training_goal });
  }

  if (profile?.calories_target) {
    pills.push({ label: 'Calorias', value: `${profile.calories_target} kcal` });
  }

  if (profile?.current_weight) {
    pills.push({ label: 'Peso atual', value: `${profile.current_weight} kg` });
  }

  if (profile?.target_weight) {
    pills.push({ label: 'Meta', value: `${profile.target_weight} kg` });
  }

  return pills.slice(0, 4);
}

function ConversationListItem({ conversation, active, onClick, compact = false }) {
  const messageCount = conversation?.messages?.length || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border text-left transition-all duration-200',
        compact ? 'min-w-[240px] px-4 py-4' : 'w-full px-4 py-4',
        active
          ? 'border-[hsl(var(--fg)/0.08)] bg-[hsl(var(--fg))] text-[hsl(var(--button-primary-foreground))] shadow-[var(--shadow-md)]'
          : 'border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card)/0.74)] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)] hover:-translate-y-0.5 hover:border-[hsl(var(--separator-strong))] hover:bg-[hsl(var(--card)/0.92)] hover:shadow-[var(--shadow-sm)]'
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-20',
          active
            ? 'bg-gradient-to-b from-white/10 to-transparent'
            : 'bg-gradient-to-b from-[hsl(var(--brand-ai)/0.08)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100'
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                'text-[14px] font-semibold tracking-[-0.02em]',
                active
                  ? 'text-[hsl(var(--button-primary-foreground))]'
                  : 'text-[hsl(var(--fg))]'
              )}
            >
              {conversation.metadata?.name || 'Conversa'}
            </p>
            <p
              className={cn(
                'mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                active
                  ? 'text-[hsl(var(--button-primary-foreground)/0.64)]'
                  : 'text-[hsl(var(--fg-3))]'
              )}
            >
              {getMessageCountLabel(messageCount)}
            </p>
          </div>

          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
              active
                ? 'bg-white/10 text-[hsl(var(--button-primary-foreground)/0.82)]'
                : 'bg-[hsl(var(--fill)/0.86)] text-[hsl(var(--fg-2))]'
            )}
          >
            {formatConversationTimestamp(conversation.updated_at)}
          </span>
        </div>

        <p
          className={cn(
            'mt-3 text-[13px] leading-6',
            active
              ? 'text-[hsl(var(--button-primary-foreground)/0.8)]'
              : 'text-[hsl(var(--fg-2))]'
          )}
        >
          {getConversationPreview(conversation)}
        </p>
      </div>
    </button>
  );
}

function PromptCard({ item, onSelect }) {
  return (
    <button
      onClick={() => onSelect(item.prompt)}
      className="atlas-chat-panel group relative overflow-hidden rounded-[26px] border border-[hsl(var(--border)/0.92)] px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--separator-strong))] hover:shadow-[var(--shadow-sm)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--brand-ai)/0.08)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-2))]">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={1.9} />
            {item.title}
          </span>
          <ArrowUpRight className="h-4 w-4 text-[hsl(var(--fg-3))] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} />
        </div>

        <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {item.prompt}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.description}</p>
      </div>
    </button>
  );
}

export default function AtlasAI() {
  const { can } = useSubscription();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freePromptsUsed, setFreePromptsUsed] = useState(0);
  const endRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  const hasPaidAccess = can('atlas_ai') || isLocalMockUser(user);
  const freePromptsRemaining = Math.max(0, FREE_PROMPT_LIMIT - freePromptsUsed);
  const hasAtlasAIAccess = hasPaidAccess || freePromptsRemaining > 0;

  const localProfile = useMemo(() => readLocalProfile(user), [user]);
  const profileContext = useMemo(() => buildProfileContext(localProfile), [localProfile]);

  useEffect(() => {
    setFreePromptsUsed(readFreePromptCount(user));
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    if (!hasAtlasAIAccess) {
      setConversations([]);
      setActiveId(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    const loadTimer = window.setTimeout(() => {
      if (cancelled) return;

      try {
        const restored = readStoredConversations(user);
        setConversations(restored);
        setActiveId(restored[0]?.id || null);
        setInput('');
      } catch {
        setConversations([]);
        setActiveId(null);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimer);
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    };
  }, [hasAtlasAIAccess, user]);

  useEffect(() => {
    if (loading || !hasAtlasAIAccess) return;
    writeStoredConversations(user, conversations);
  }, [conversations, hasAtlasAIAccess, loading, user]);

  const activeConversation =
    conversations.find(conversation => conversation.id === activeId) || null;
  const messages = activeConversation?.messages || [];
  const hasProfileContext = profileContext.length > 0;
  const activeConversationLabel =
    activeConversation?.metadata?.name || 'New contextual conversation';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, messages.length, sending]);

  if (!hasPaidAccess && freePromptsRemaining === 0) {
    return (
      <div className="flex h-[calc(100dvh-3rem)] items-center justify-center p-5 lg:h-screen">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-2))]">
            Atlas AI
          </p>
          <p className="text-[20px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
            Você usou seus {FREE_PROMPT_LIMIT} prompts gratuitos
          </p>
          <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
            Faça upgrade para o Plano Pro e tenha acesso ilimitado a insights contextuais com IA.
          </p>
          <UpgradeGate
            feature="atlas_ai"
            plan="Pro"
            title="Atlas AI — Plano Pro+"
            description="Desbloqueie insights contextuais com inteligência artificial poderosa"
          />
        </div>
      </div>
    );
  }

  const newConv = () => {
    const conversation = createConversation(new Date().toLocaleDateString('pt-BR'));
    setConversations(prev => [conversation, ...prev]);
    setActiveId(conversation.id);
    setInput('');
  };

  const loadConv = conversation => {
    setActiveId(conversation.id);
  };

  const send = text => {
    const content = (text || input).trim();
    if (!content || sending) return;

    if (!hasPaidAccess && freePromptsRemaining <= 0) return;

    setInput('');
    setSending(true);

    if (!hasPaidAccess) {
      const newCount = freePromptsUsed + 1;
      setFreePromptsUsed(newCount);
      writeFreePromptCount(user, newCount);
    }

    let conversationId = activeId;
    let createdConversation = null;

    if (!conversationId) {
      createdConversation = createConversation(content.slice(0, 40));
      conversationId = createdConversation.id;
      setActiveId(conversationId);
    }

    const userMessage = { role: 'user', content };
    setConversations(prev => {
      const baseList = createdConversation ? [createdConversation, ...prev] : prev;
      return appendMessage(baseList, conversationId, userMessage);
    });
    setPendingConversationId(conversationId);

    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
    }

    replyTimeoutRef.current = window.setTimeout(() => {
      setConversations(prev =>
        appendMessage(prev, conversationId, {
          role: 'assistant',
          content: buildMockReply(user, content),
        })
      );
      setSending(false);
      setPendingConversationId(null);
      replyTimeoutRef.current = null;
    }, 900);
  };

  return (
    <div className="atlas-page-shell">
      <div className="mx-auto max-w-[1560px] px-3 py-3 lg:px-6 lg:py-4">
        <div className="atlas-chat-shell flex min-h-[80vh] flex-col overflow-hidden lg:h-[calc(100dvh-2rem)] lg:flex-row">

          {/* ── SIDEBAR ── */}
          <aside className="atlas-chat-sidebar hidden w-[300px] shrink-0 border-r border-[hsl(var(--border)/0.82)] lg:flex lg:flex-col">
            <div className="border-b border-[hsl(var(--border)/0.78)] px-5 py-5">
              <div className="relative overflow-hidden rounded-[30px] border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card)/0.92)_0%,hsl(var(--fill)/0.58)_100%)] px-5 py-5 shadow-[var(--shadow-sm)]">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[hsl(var(--brand-ai)/0.14)] blur-3xl atlas-chat-orb" />

                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[22px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.88)] text-[hsl(var(--brand-ai))] shadow-[var(--shadow-xs)]">
                      <Brain className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <p className="atlas-overline">Atlas AI</p>
                      <h2 className="mt-3 text-[1.125rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                        Assistant contextual
                      </h2>
                      <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                        Conversas premium com contexto do profile local.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.72)] px-3 py-2.5 shadow-[var(--shadow-xs)]">
                      <p className="atlas-metric-label">Modo</p>
                      <p className="mt-1.5 text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                        IA local
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.72)] px-3 py-2.5 shadow-[var(--shadow-xs)]">
                      <p className="atlas-metric-label">Contexto</p>
                      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                        {hasProfileContext ? 'Profile connected' : 'Profile pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={newConv} size="lg" className="mt-4 w-full rounded-[20px]">
                <Plus className="h-4 w-4" strokeWidth={2} />
                New conversation
              </Button>
            </div>

            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              <div>
                <p className="atlas-metric-label">Conversas</p>
                <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                  {conversations.length
                    ? `${conversations.length} sessões locais`
                    : 'Nenhum histórico salvo'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {loading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[100px] rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.72)] shadow-[var(--shadow-xs)]"
                    />
                  ))}
                </div>
              ) : conversations.length ? (
                <div className="space-y-2.5">
                  {conversations.map(conversation => (
                    <ConversationListItem
                      key={conversation.id}
                      conversation={conversation}
                      active={activeId === conversation.id}
                      onClick={() => loadConv(conversation)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card)/0.66)] px-4 py-5 text-center shadow-[var(--shadow-xs)]">
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    Sua primeira conversa aparece aqui
                  </p>
                  <p className="mt-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
                    Inicie um prompt para criar o histórico local.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* ── MAIN SECTION ── */}
          <section className="flex min-h-0 flex-1 flex-col">

              <div className="relative flex flex-col gap-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="atlas-overline">Atlas AI</span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.74)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
                        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={1.9} />
                        Atlas AI
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.74)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={1.9} />
                        {activeConversation
                          ? formatConversationTimestamp(activeConversation.updated_at)
                          : 'Ready to start'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h1 className="text-[1.4rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))] lg:text-[1.7rem]">
                        {activeConversationLabel}
                      </h1>
                      <p className="mt-2 max-w-3xl text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                        {activeConversation
                          ? getConversationPreview(activeConversation)
                          : 'A premium assistant experience to review training, nutrition, progress and profile signals — not a generic chat.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={newConv}
                      variant="outline"
                      size="sm"
                      className="rounded-full px-4"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                      New conversation
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <ChatSignalCard
                    icon={Target}
                    label="Context"
                    value={hasProfileContext ? 'Profile connected' : 'Add profile'}
                    detail={
                      hasProfileContext
                        ? 'Local goals and signals help responses feel more personal.'
                        : 'Add your goal, calories and weight in Profile for deeper responses.'
                    }
                  />
                  <ChatSignalCard
                    icon={MessageSquare}
                    label="Conversation"
                    value={
                      activeConversation
                        ? getMessageCountLabel(messages.length)
                        : 'Session ready to open'
                    }
                    detail={
                      activeConversation
                        ? 'Local history is saved and reappears in the sidebar.'
                        : 'Start with an objective prompt to give context from the very first exchange.'
                    }
                  />
                  <ChatSignalCard
                    icon={Activity}
                    label="Mode"
                    value="Stable local mode"
                    detail="Experience continues without remote backend, keeping the current chat flow."
                  />
                </div>

                <StatusBanner tone={hasProfileContext ? 'success' : 'neutral'}>
                  {hasProfileContext
                    ? 'Local profile is connected and already informs goal, weight and targets in this conversation.'
                    : 'Connect goals and weight in Profile to make Atlas AI more contextual.'}
                </StatusBanner>

                {hasProfileContext ? (
                  <div className="flex flex-wrap gap-2">
                    {profileContext.map(item => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.78)] px-3 py-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]"
                      >
                        <span className="text-[hsl(var(--fg-3))]">{item.label}</span>
                        <span className="text-[hsl(var(--fg))]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </header>

            {/* ── MOBILE CONVERSATIONS STRIP ── */}
            <div className="border-b border-[hsl(var(--border)/0.72)] px-4 py-3 lg:hidden">
              <div className="flex gap-3 overflow-x-auto pb-1">
                <button
                  onClick={newConv}
                  className="flex min-w-[200px] items-center gap-3 rounded-[22px] border border-dashed border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card)/0.72)] px-4 py-3 text-left shadow-[var(--shadow-xs)]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.76)] text-[hsl(var(--fg-2))]">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                      New conversation
                    </p>
                    <p className="mt-0.5 text-[11px] leading-5 text-[hsl(var(--fg-2))]">
                      Novo fio contextual
                    </p>
                  </div>
                </button>

                {!loading &&
                  conversations.map(conversation => (
                    <ConversationListItem
                      key={conversation.id}
                      conversation={conversation}
                      active={activeId === conversation.id}
                      onClick={() => loadConv(conversation)}
                      compact
                    />
                  ))}
              </div>
            </div>

            {/* ── MESSAGES AREA ── */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div className="pointer-events-none absolute left-[8%] top-10 h-48 w-48 rounded-full bg-[hsl(var(--brand-ai)/0.08)] blur-3xl atlas-chat-orb" />
              <div className="pointer-events-none absolute bottom-10 right-[10%] h-48 w-48 rounded-full bg-[hsl(var(--tint)/0.06)] blur-3xl atlas-chat-orb" />

              <div className="h-full overflow-y-auto">
                {loading ? (
                  /* ── LOADING ── */
                  <div className="flex h-full items-center justify-center px-4 py-6">
                    <div className="atlas-chat-panel w-full max-w-sm rounded-[32px] border border-[hsl(var(--border)/0.92)] px-6 py-8 text-center shadow-[var(--shadow-md)]">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--brand-ai))] shadow-[var(--shadow-xs)]">
                        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.9} />
                      </div>
                      <p className="mt-4 text-[1.05rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                        Carregando suas conversas
                      </p>
                      <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                        Restaurando o histórico local do Atlas AI.
                      </p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  /* ── EMPTY STATE ── */
                  <div className="px-4 py-5 lg:px-6 lg:py-6">
                    <div className="mx-auto max-w-3xl space-y-5">
                      {/* Welcome panel */}
                      <section className="relative overflow-hidden rounded-[32px] border border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card)/0.96)_0%,hsl(var(--fill)/0.62)_100%)] px-6 py-6 shadow-[var(--shadow-lg)] lg:px-7 lg:py-7">
                        <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-[hsl(var(--brand-ai)/0.14)] blur-3xl atlas-chat-orb" />
                        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[hsl(var(--tint)/0.07)] blur-3xl atlas-chat-orb" />

                        <div className="relative space-y-4">
                          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
                            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={1.9} />
                            Contextual assistant
                          </div>

                          <div className="max-w-3xl">
                            <h2 className="text-[clamp(2rem,1.55rem+1.2vw,3rem)] font-semibold tracking-[-0.075em] text-[hsl(var(--fg))]">
                              Chat with Atlas context — not a generic chatbot.
                            </h2>
                            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[hsl(var(--fg-2))] lg:text-[16px]">
                              Abra uma leitura rápida sobre progresso, aderência ou próximo passo.
                              A camada visual já é nativa do produto, enquanto a lógica continua
                              usando o mock local desta fase.
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <ChatSignalCard
                              icon={Brain}
                              label="Assistente"
                              value="Premium e contextual"
                              detail="Mais próximo de uma camada estratégica do produto do que de um chat utilitário."
                            />
                            <ChatSignalCard
                              icon={Clock3}
                              label="Persistência"
                              value="Histórico local salvo"
                              detail="Cada conversa criada aqui reaparece organizada na sidebar."
                            />
                            <ChatSignalCard
                              icon={Target}
                              label="Leitura"
                              value={hasProfileContext ? 'Ready for context' : 'Ready to start'}
                              detail={
                                hasProfileContext
                                  ? 'O profile local já adiciona sinais úteis para a resposta.'
                                  : 'Mesmo sem profile completo, o fluxo do chat já está pronto.'
                              }
                            />
                          </div>

                          <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.74)] px-5 py-5 shadow-[var(--shadow-sm)]">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="atlas-metric-label">Contexto visivel agora</p>
                                <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                                  {hasProfileContext
                                    ? 'Seu profile local já informa parte da conversa.'
                                    : 'Ainda não há sinais suficientes do Profile nesta rota.'}
                                </p>
                              </div>
                              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg-2))]">
                                <Activity className="h-3.5 w-3.5" strokeWidth={1.9} />
                                Sem backend remoto
                              </span>
                            </div>

                            {hasProfileContext ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {profileContext.map(item => (
                                  <div
                                    key={`${item.label}-${item.value}-empty`}
                                    className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.76)] px-3 py-1.5 text-[12px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg-2))]"
                                  >
                                    <span className="text-[hsl(var(--fg-3))]">{item.label}</span>
                                    <span className="text-[hsl(var(--fg))]">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                                Preencha metas, peso ou objetivo no Profile para deixar o assistant
                                even more specific to your context.
                              </p>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Quick starts */}
                      <div>
                        <p className="atlas-overline px-1">Quick starts</p>
                        <p className="mt-2 px-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                          Comece com um prompt objetivo para dar contexto desde a primeira troca.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {PROMPTS.map(item => (
                            <PromptCard key={item.id} item={item} onSelect={send} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
                    <div className="mb-6 flex justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
                        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={1.9} />
                        {hasProfileContext ? 'Profile connected' : 'Ready to start'}
                      </div>
                    </div>

                    <div className="space-y-5 pb-2">
                      {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                      ))}

                      {sending && activeId === pendingConversationId && (
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.88)] text-[hsl(var(--brand-ai))] shadow-[var(--shadow-xs)]">
                            <Brain className="h-4 w-4" strokeWidth={1.8} />
                          </div>

                          <div className="rounded-[28px] border border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.52)_100%)] px-5 py-4 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--brand-ai))]" strokeWidth={1.9} />
                              <div>
                                <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                                  Atlas AI estruturando a resposta
                                </p>
                                <p className="mt-1 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
                                  Lendo o profile local e montando retorno contextual.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={endRef} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── COMPOSER ── */}
            <div className="shrink-0 border-t border-[hsl(var(--border)/0.78)] px-4 py-4 lg:px-6 lg:py-4">
              <div className="mx-auto max-w-3xl space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PROMPTS.slice(0, 3).map(item => (
                    <FilterChip
                      key={`${item.id}-composer`}
                      onClick={() => send(item.prompt)}
                      className="whitespace-nowrap"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={1.9} />
                      {item.title}
                    </FilterChip>
                  ))}
                </div>

                <div className="atlas-chat-panel relative overflow-hidden rounded-[28px] border border-[hsl(var(--border)/0.92)] px-3 py-3 shadow-[var(--shadow-md)] lg:px-4">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[hsl(var(--brand-ai)/0.06)] to-transparent" />

                  <div className="relative flex items-end gap-3">
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.82)] text-[hsl(var(--brand-ai))] sm:flex">
                      <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <textarea
                        value={input}
                        onChange={event => setInput(event.target.value)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            send();
                          }
                        }}
                        rows={3}
                        placeholder="Pergunte algo sobre seus dados, progresso ou próxima decisão..."
                        className="w-full resize-none bg-transparent px-1 py-1 text-[15px] leading-7 text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
                      />

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--border)/0.72)] pt-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[hsl(var(--fg-3))]">
                          <span className="rounded-full bg-[hsl(var(--fill)/0.82)] px-2.5 py-1 font-semibold">
                            Enter envia
                          </span>
                          <span className="rounded-full bg-[hsl(var(--fill)/0.82)] px-2.5 py-1 font-semibold">
                            Shift+Enter quebra linha
                          </span>
                        </div>

                        <p className="text-[11px] leading-6 text-[hsl(var(--fg-2))]">
                          {!hasPaidAccess && freePromptsRemaining > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-ai)/0.10)] px-2.5 py-1 font-semibold text-[hsl(var(--brand-ai))]">
                              {freePromptsRemaining} prompt{freePromptsRemaining !== 1 ? 's' : ''} gratuito{freePromptsRemaining !== 1 ? 's' : ''} restante{freePromptsRemaining !== 1 ? 's' : ''}
                            </span>
                          ) : hasProfileContext
                            ? 'Contexto do Profile ativo.'
                            : 'Adicione metas no Profile para respostas precisas.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => send()}
                      disabled={!input.trim() || sending || (!hasPaidAccess && freePromptsRemaining <= 0)}
                      size="lg"
                      className="h-11 shrink-0 rounded-[18px] px-5"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
                      ) : (
                        <Send className="h-4 w-4" strokeWidth={2} />
                      )}
                      <span className="hidden sm:inline">Enviar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}
