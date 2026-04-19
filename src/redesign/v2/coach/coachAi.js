/**
 * Coach AI client — thin wrapper over `ai-coach-chat` Supabase edge function.
 * Streams replies when the backend supports SSE; falls back to one-shot JSON
 * otherwise. Follows the ARCHITECTURE.md contract: no direct LLM calls.
 */

import { authHeaders } from '../lib/supabaseAuth';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || '';

/**
 * Send a message to the coach. If the backend emits SSE, `onChunk` is called
 * progressively with text fragments; otherwise `onChunk` receives the whole
 * reply in one call. Resolves with the final { reply, sources, confidence }.
 */
export async function askCoach({ message, history = [], context = null, onChunk, signal }) {
  const trimmed = (message || '').trim();
  if (!trimmed) throw new Error('Empty message');

  if (!SUPABASE_URL) {
    // Offline/dev fallback — canned empathetic reply so the UI is demoable.
    const canned = offlineReply(trimmed);
    onChunk?.(canned);
    return { reply: canned, sources: [], confidence: 0.5, offline: true };
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-coach-chat`, {
    method: 'POST',
    headers: await authHeaders({ Accept: 'text/event-stream, application/json' }),
    body: JSON.stringify({ message: trimmed, history, context }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Coach failed (${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/event-stream') && res.body) {
    // Streaming path
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let reply = '';
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const dataLine = frame.split('\n').find((l) => l.startsWith('data: '));
        if (!dataLine) continue;
        const payload = dataLine.slice(6);
        if (payload === '[DONE]') continue;
        try {
          const obj = JSON.parse(payload);
          const chunk = obj.delta || obj.text || '';
          if (chunk) { reply += chunk; onChunk?.(chunk); }
        } catch { /* ignore malformed */ }
      }
    }
    return { reply, sources: [], confidence: 0.9 };
  }

  // Non-stream JSON path
  const data = await res.json();
  const reply = data?.reply || data?.message || '';
  onChunk?.(reply);
  return {
    reply,
    sources: data?.sources || [],
    confidence: data?.confidence ?? 0.9,
  };
}

function offlineReply(msg) {
  const lower = msg.toLowerCase();
  if (/sono|sleep|recovery/.test(lower)) {
    return "Pelo que vi nos seus dados, seu REM caiu ~22% em relação à média de 30 dias. Três coisas costumam puxar isso: álcool na noite anterior, refeição muito tarde, ou estresse. Se você dormir antes das 23h hoje e cortar cafeína após 14h, o score deve subir para a faixa normal amanhã.";
  }
  if (/treino|workout|pr|bench/.test(lower)) {
    return 'Seu progression curve no bench está saudável — projetando 80kg × 8 por volta de 15 de maio. Se quiser acelerar, adicionar um dia extra de volume acessório (incline DB + cable fly) em dia de recovery alto é a alavanca mais segura.';
  }
  if (/comer|eat|dieta|diet|protein/.test(lower)) {
    return "Você está batendo calorias mas ficando 50g abaixo de proteína em média. Um jeito simples: adicionar 1 scoop de whey no lanche da tarde — adiciona ~25g sem mexer em carbs/fat significativamente.";
  }
  return "Entendi. Posso dar contexto melhor se você abrir sua tela de hoje ou me falar o que está acontecendo. Quer que eu olhe seu último treino, sua última refeição, ou sua recovery?";
}
