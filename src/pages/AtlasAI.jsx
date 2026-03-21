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
    title: 'Nutrition adherence',
    prompt: 'How is my nutrition adherence?',
    description: 'See where your diet is sustaining or blocking the week.',
  },
  {
    id: 'weight',
    title: 'Weight Progress',
    prompt: 'Analyze my weight progress',
    description: 'Read trend, distance to goal and next adjustments clearly.',
  },
  {
    id: 'labs',
    title: 'Lab Results Reading',
    prompt: 'What do my lab exams indicate?',
    description: 'Get a guided and contextual interpretation of what deserves attention.',
  },
  {
    id: 'supplements',
    title: 'Supplementation',
    prompt: 'Which supplements match my goals?',
    description: 'Prioritize what makes sense for your goal before stacking interventions.',
  },
  {
    id: 'weekly',
    title: 'Weekly Summary',
    prompt: 'Generate a weekly summary',
    description: 'Condense the week into a quick read, focused on the next decision.',
  },
  {
    id: 'plan',
    title: 'Plan vs Execution',
    prompt: 'Compare my plan vs execution',
    description: 'Understand intention versus real consistency without opening multiple screens.',
  },
];

function createConversation(name) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    metadata: {
      name: name || new Date().toLocaleDateString('en-US'),
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
        name: conversation?.metadata?.name || 'Conversation',
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
      'Local simulated nutrition adherence summary:',
      calories
        ? `- Calorie goal saved in profile: **${calories}**.`
        : '- I found no calorie goal saved in local profile yet.',
      macros
        ? `- Targets logged today: ${macros}.`
        : '- Protein, carbs, fat and water have not been set in local profile yet.',
      goal
        ? `- Your current goal is **${goal}**, so I would evaluate adherence by how much daily routine sustains this goal.`
        : '- With no saved goal, I would treat adherence as basic meal and hydration consistency.',
      '',
      `Suggested next step: keep a protein anchor at end of day and repeat meals that already worked well. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('peso') || normalized.includes('progresso')) {
    return [
      'Local simulated weight progress reading:',
      Number.isFinite(currentWeight)
        ? `- Current weight saved: **${currentWeight} kg**.`
        : '- I found no current weight saved in local profile yet.',
      Number.isFinite(targetWeight)
        ? `- Registered goal: **${targetWeight} kg**${weightGap ? ` and ${weightGap}.` : '.'}`
        : '- I found no target weight saved to compare trend.',
      goal
        ? `- With the goal **${goal}**, I would track weight alongside energy, training and weekly consistency.`
        : '- For better reading, it helps to save goal and target in Profile.',
      '',
      `If you want, I can transform this analysis into a simple plan for training, sleep and calorie adjustments. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('exame')) {
    return [
      'Local simulated exam analysis:',
      '- At this local stage I do not have exams synced to this route yet.',
      goal
        ? `- Even so, I can prioritize the reading based on your goal **${goal}**.`
        : '- With no saved goal, I would start by defining main goal, symptoms and recent routine.',
      '- The interpretation makes more sense when combined with symptoms, sleep and training load.',
      '',
      `At this decoupled route, I am responding with local mock without accessing real exams. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('suplement')) {
    return [
      'Local simulated supplementation suggestion:',
      goal
        ? `- I would align any supplement first to your goal **${goal}**.`
        : '- With no saved goal, I would avoid suggesting a specific supplement too early.',
      calories || macros
        ? '- Since you already have targets in your profile, I would prioritize eating consistency before stacking interventions.'
        : '- Before thinking about supplements, it helps to define daily intake and hydration in Profile.',
      '- Creatine and protein are usually the easiest options to justify when base, training and tolerance are organized.',
      '- Caffeine, omega-3 and vitamin D depend more on your context and exams.',
      '',
      `The best combination changes based on goal, routine and individual tolerance. ${modeLine}`,
    ].join('\n');
  }

  if (normalized.includes('resumo') || normalized.includes('semana')) {
    return [
      'Local simulated weekly summary:',
      goal
        ? `- Main focus of the week: **${goal}**.`
        : '- Still missing a main saved goal to summarize the week with more context.',
      Number.isFinite(currentWeight)
        ? `- Saved reference weight: **${currentWeight} kg**${Number.isFinite(targetWeight) ? ` for a goal of **${targetWeight} kg**.` : '.'}`
        : '- No weight saved yet for me to use as reference for this week.',
      calories
        ? `- Registered daily goal: **${calories}**${macros ? ` with ${macros}.` : '.'}`
        : '- Nutritional goals have not been set in local profile yet.',
      `- Focus for next week: repeat what worked and protect your rest routine. ${modeLine}`,
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

  return new Intl.DateTimeFormat('en-US', isToday ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short' }).format(date);
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
    const conversation = createConversation(new Date().toLocaleDateString('en-US'));
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
                        Loading your conversations
                      </p>
                      <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                        Restoring Atlas AI local history.
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
                          )}
                            </div>
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
