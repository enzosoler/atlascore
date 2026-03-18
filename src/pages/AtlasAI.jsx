import React, { useEffect, useRef, useState } from 'react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useAuth } from '@/lib/AuthContext';
import UpgradeGate from '@/components/entitlements/UpgradeGate';
import { Brain, Send, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/ai/MessageBubble';

const LOCAL_ATLAS_AI_STORAGE_KEY = 'atlas-ai-local-conversations';
const LOCAL_PROFILE_STORAGE_KEY = 'atlas_local_profile_store';

const PROMPTS = [
  'Como está minha aderência nutricional?',
  'Analise meu progresso de peso',
  'O que meus exames indicam?',
  'Quais suplementos combinam com meus objetivos?',
  'Gere um resumo semanal',
  'Compare meu plano vs execução',
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
      'Sugestao local simulada para suplementacao:',
      goal
        ? `- Eu alinharia qualquer suplemento primeiro ao objetivo **${goal}**.`
        : '- Sem objetivo salvo, eu evitaria sugerir suplemento específico cedo demais.',
      calories || macros
        ? '- Como você já tem metas no perfil, eu priorizaria consistência alimentar antes de empilhar intervenção.'
        : '- Antes de pensar em suplemento, vale definir ingestão diária e hidratação no Profile.',
      '- Creatina e proteína costumam ser as opções mais fáceis de justificar quando base, treino e tolerância estão organizados.',
      '- Cafeína, ômega-3 e vitamina D dependem mais do seu contexto e dos exames.',
      '',
      `A melhor combinacao muda conforme objetivo, rotina e tolerancia individual. ${modeLine}`,
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
      `- Foco da proxima semana: repetir o que funcionou e proteger a rotina de descanso. ${modeLine}`,
    ].join('\n');
  }

  if (
    normalized.includes('plano') ||
    normalized.includes('execu') ||
    normalized.includes('compare')
  ) {
    return [
      'Comparacao local simulada entre plano e execucao:',
      '- O layout do chat já suporta esse fluxo, mas nesta etapa local ainda não tenho treino, dieta ou check-ins sincronizados automaticamente.',
      goal
        ? `- Enquanto isso, eu usaria o objetivo **${goal}** como régua para comparar intenção vs consistência real.`
        : '- Sem objetivo salvo, a comparação entre plano e execução fica genérica demais.',
      '- Maior ganho imediato costuma vir de reduzir a fricção entre o que foi planejado e o que realmente cabe na rotina.',
      '',
      `Posso continuar com uma versao resumida ou com recomendacoes praticas. ${modeLine}`,
    ].join('\n');
  }

  return [
    'Resposta local simulada do Atlas AI:',
    `- Sua pergunta foi: **"${content}"**`,
    goal ? `- Hoje o objetivo salvo no seu perfil é **${goal}**.` : '- Ainda não encontrei um objetivo salvo no Profile.',
    calories
      ? `- Sua principal meta nutricional salva é **${calories}**${macros ? ` com ${macros}.` : '.'}`
      : '- Se você salvar calorias e macros no Profile, o chat fica mais contextual.',
    `- Nesta rota, o chat esta usando mock local e nao consulta Base44 nem LLM real. ${modeLine}`,
  ].join('\n');
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
  const endRef = useRef(null);
  const replyTimeoutRef = useRef(null);
  const hasAtlasAIAccess = can('atlas_ai') || isLocalMockUser(user);

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

  const activeConversation = conversations.find(conversation => conversation.id === activeId) || null;
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, messages.length, sending]);

  if (!hasAtlasAIAccess) {
    return (
      <div className="h-[calc(100vh-3rem)] lg:h-screen flex items-center justify-center p-5">
        <UpgradeGate
          feature="atlas_ai"
          plan="Pro"
          title="Atlas AI — Plano Pro+"
          description="Desbloqueie insights contextuais com inteligência artificial poderosa"
        />
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

    setInput('');
    setSending(true);

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
    <div className="h-[calc(100vh-3rem)] lg:h-screen flex overflow-hidden bg-background">
      <div className="hidden lg:flex flex-col w-56 border-r border-border bg-[hsl(var(--shell))] shrink-0">
        <div className="p-3 border-b border-border">
          <Button
            onClick={newConv}
            variant="outline"
            className="w-full h-9 rounded-lg text-[13px] gap-1.5 border-border"
          >
            <Plus className="w-3.5 h-3.5" /> Nova conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            conversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => loadConv(conversation)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] truncate transition-colors
                ${
                  activeId === conversation.id
                    ? 'bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--card))]'
                }`}
              >
                {conversation.metadata?.name || 'Conversa'}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border bg-[hsl(var(--card))] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[14px] font-semibold">Atlas AI</p>
            <p className="text-[11px] text-muted-foreground">Coach de saúde e performance</p>
          </div>
          <div className="ml-auto lg:hidden">
            <Button onClick={newConv} size="sm" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center">
                <Brain className="w-7 h-7 text-[hsl(var(--brand-ai))]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold mb-1.5 tracking-tight">Olá! Sou o Atlas AI</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Nesta versao local, eu simulo respostas e insights para manter a experiencia do
                  chat enquanto a rota e desacoplada do Base44.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => send(prompt)}
                    className="px-3.5 py-2.5 rounded-xl border border-border text-left text-[12px] text-muted-foreground hover:text-foreground hover:border-[hsl(var(--brand-ai)/0.3)] hover:bg-[hsl(var(--brand-ai)/0.04)] transition-all flex items-start gap-2"
                  >
                    <Sparkles
                      className="w-3 h-3 text-[hsl(var(--brand-ai))] mt-0.5 shrink-0"
                      strokeWidth={2}
                    />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {sending && activeId === pendingConversationId && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-ai)/0.6)]" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[hsl(var(--card))] border border-border">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="px-4 lg:px-6 pb-4 pt-3 border-t border-border bg-[hsl(var(--card))]">
          <div className="flex gap-2 items-center max-w-3xl mx-auto">
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="Pergunte algo sobre seus dados…"
              className="flex-1 h-11 rounded-xl bg-[hsl(var(--secondary))] border border-border px-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[hsl(var(--brand-ai)/0.5)] transition-colors"
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-xl bg-[hsl(var(--brand-ai))] hover:bg-[hsl(var(--brand-ai)/0.85)] text-white shrink-0 p-0"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
