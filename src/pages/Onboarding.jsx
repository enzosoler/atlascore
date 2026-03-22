import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  X,
  ArrowRight,
  Zap,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Compass,
  Star,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Config ───────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'fat_loss',    emoji: '🔥', label: 'Perda de gordura' },
  { id: 'muscle_gain', emoji: '💪', label: 'Ganho muscular' },
  { id: 'recomp',      emoji: '⚡', label: 'Recomposição' },
  { id: 'performance', emoji: '🏆', label: 'Performance' },
  { id: 'health',      emoji: '❤️', label: 'Saúde geral' },
  { id: 'longevity',   emoji: '🌱', label: 'Longevidade' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary',   label: 'Sedentário',   desc: 'Sem exercícios regulares' },
  { id: 'light',       label: 'Leve',          desc: '1–2× por semana' },
  { id: 'moderate',    label: 'Moderado',      desc: '3–4× por semana' },
  { id: 'active',      label: 'Ativo',         desc: '5–6× por semana' },
  { id: 'very_active', label: 'Muito ativo',   desc: '2× ao dia / atleta' },
];

// Remarketing data — collected for retargeting (transcript 2 playbook)
const HEAR_ABOUT_US = [
  { id: 'instagram',     label: 'Instagram / TikTok' },
  { id: 'youtube',       label: 'YouTube' },
  { id: 'google',        label: 'Google' },
  { id: 'indication',    label: 'Indicação' },
  { id: 'coach',         label: 'Meu coach / nutricionista' },
  { id: 'other',         label: 'Outro' },
];

const SETUP_MESSAGES = [
  'Calculando suas metas nutricionais...',
  'Registrando primeiro checkpoint...',
  'Configurando seu painel...',
  'Seu Atlas Core está pronto.',
];

const TOTAL_STEPS = 4; // 0=welcome, 1=profile+goals, 2=first checkpoint, 3=path choice

const INITIAL_FORM = {
  sex: 'male',
  age: '',
  height: '',
  current_weight: '',
  target_weight: '',
  health_goals: [],
  activity_level: 'moderate',
  hear_about_us: '',          // remarketing data
  // Step 2 — first checkpoint
  checkpoint_weight: '',
  checkpoint_body_fat: '',
  checkpoint_waist: '',
  // Step 3 — path
  chosen_path: '', // 'fresh' | 'own'
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8">
      <AtlasCoreLogoSVG width={48} height={24} className="shrink-0" />
      <span className="text-[17px] font-bold tracking-tight">
        <span className="text-[hsl(var(--accent-primary))]">atlas</span>
        <span className="text-[hsl(var(--fg))]">.core</span>
      </span>
    </div>
  );
}

function StepDots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === step
              ? 'w-6 h-2 bg-[hsl(var(--brand))]'
              : i < step
                ? 'w-2 h-2 bg-[hsl(var(--brand)/0.4)]'
                : 'w-2 h-2 bg-[hsl(var(--border-h))]'
          }`}
        />
      ))}
    </div>
  );
}

function GoalChip({ selected, onClick, emoji, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all text-center
        ${selected
          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.08)] shadow-sm'
          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))]'
        }`}
    >
      <span className="text-[22px] leading-none">{emoji}</span>
      <span className={`text-[12px] font-semibold leading-tight ${selected ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-2))]'}`}>
        {label}
      </span>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
      {children}
    </label>
  );
}

function OptionalBadge() {
  return (
    <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--fg-3))]">
      opcional
    </span>
  );
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="text-center space-y-6 py-2">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto">
        <Zap className="w-8 h-8 text-[hsl(var(--brand))]" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight mb-2">
          Bem-vindo ao{' '}
          <span className="text-[hsl(var(--accent-primary))]">atlas</span>
          <span className="text-[hsl(var(--fg))]">.core</span>
        </h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-xs mx-auto">
          3 passos rápidos para configurar seu painel e registrar seu primeiro ponto de dados.
        </p>
      </div>
      <div className="space-y-2 text-left">
        {[
          { n: '01', title: 'Perfil e objetivos', desc: 'Quem você é e o que quer alcançar' },
          { n: '02', title: 'Primeiro checkpoint', desc: 'Seu ponto de partida — você vai querer comparar com este momento' },
          { n: '03', title: 'Escolha seu caminho', desc: 'Como quer começar esta semana' },
        ].map(({ n, title, desc }) => (
          <div
            key={n}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--card-hi))] border border-[hsl(var(--border-h))]"
          >
            <span className="text-[11px] font-bold tabular-nums text-[hsl(var(--brand))] shrink-0 mt-0.5 w-4">
              {n}
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-snug">{title}</p>
              <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepProfileAndGoals({ form, set, toggle }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold mb-1">Qual é seu objetivo principal?</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">
          Define o foco do painel e das recomendações da IA
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {GOALS.map((g) => (
          <GoalChip
            key={g.id}
            selected={form.health_goals.includes(g.id)}
            onClick={() => toggle('health_goals', g.id)}
            emoji={g.emoji}
            label={g.label}
          />
        ))}
      </div>

      <div className="border-t border-[hsl(var(--border-h))] pt-4 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))]">
          Dados básicos
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Altura (cm)</FieldLabel>
            <Input
              type="number"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              placeholder="175"
              className="h-10 rounded-lg text-base"
            />
          </div>
          <div>
            <FieldLabel>Peso atual (kg)</FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.current_weight}
              onChange={(e) => {
                set('current_weight', e.target.value);
                // Keep checkpoint pre-filled in sync
                set('checkpoint_weight', e.target.value);
              }}
              placeholder="80"
              className="h-10 rounded-lg text-base"
            />
          </div>
          <div>
            <FieldLabel>Sexo biológico</FieldLabel>
            <Select value={form.sex} onValueChange={(v) => set('sex', v)}>
              <SelectTrigger className="h-10 rounded-lg text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Idade</FieldLabel>
            <Input
              type="number"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="30"
              className="h-10 rounded-lg text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>
              Peso alvo (kg)<OptionalBadge />
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.target_weight}
              onChange={(e) => set('target_weight', e.target.value)}
              placeholder="75"
              className="h-10 rounded-lg text-base"
            />
          </div>
          <div>
            <FieldLabel>Nível de atividade</FieldLabel>
            <Select value={form.activity_level} onValueChange={(v) => set('activity_level', v)}>
              <SelectTrigger className="h-10 rounded-lg text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label} — {a.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Remarketing data collection (transcript 2 playbook) ── */}
      <div className="border-t border-[hsl(var(--border-h))] pt-4 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))]">
          Como você nos encontrou? <OptionalBadge />
        </p>
        <div className="flex flex-wrap gap-2">
          {HEAR_ABOUT_US.map((option) => {
            const selected = form.hear_about_us === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => set('hear_about_us', selected ? '' : option.id)}
                className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all
                  ${selected
                    ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--fg))]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card-hi))]'
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepFirstCheckpoint({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold mb-1">Primeiro checkpoint</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed">
          Vamos registrar seu ponto de partida. Você vai poder comparar com este momento em
          qualquer bloco futuro do Block Review.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <FieldLabel>Peso (kg)</FieldLabel>
          <Input
            type="number"
            step="0.1"
            value={form.checkpoint_weight}
            onChange={(e) => set('checkpoint_weight', e.target.value)}
            placeholder="80"
            className="h-10 rounded-lg text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>
              Gordura corporal (%)<OptionalBadge />
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.checkpoint_body_fat}
              onChange={(e) => set('checkpoint_body_fat', e.target.value)}
              placeholder="18"
              className="h-10 rounded-lg text-base"
            />
          </div>
          <div>
            <FieldLabel>
              Cintura (cm)<OptionalBadge />
            </FieldLabel>
            <Input
              type="number"
              step="0.1"
              value={form.checkpoint_waist}
              onChange={(e) => set('checkpoint_waist', e.target.value)}
              placeholder="80"
              className="h-10 rounded-lg text-base"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.15)] px-4 py-3">
        <p className="text-[12px] text-[hsl(var(--fg-2))] leading-5">
          Este checkpoint fica salvo em <strong className="text-[hsl(var(--fg))]">Medições</strong> e
          serve como referência para comparar progresso no{' '}
          <strong className="text-[hsl(var(--fg))]">Block Review</strong>.
        </p>
      </div>
    </div>
  );
}

function PathCard({ selected, onClick, icon: Icon, title, desc, items }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all space-y-3
        ${selected
          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.06)]'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-h))] hover:bg-[hsl(var(--card-hi))]'
        }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${selected ? 'bg-[hsl(var(--brand)/0.15)]' : 'bg-[hsl(var(--shell))]'}`}>
          <Icon className={`w-4 h-4 ${selected ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-2))]'}`} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))] leading-snug">{title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5 leading-4">{desc}</p>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
          ${selected ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'}`}>
          {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
        </div>
      </div>
      {selected && items && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5 pl-12"
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] text-[hsl(var(--fg-2))]">
              <div className="w-1 h-1 rounded-full bg-[hsl(var(--brand)/0.6)] shrink-0" />
              {item}
            </div>
          ))}
        </motion.div>
      )}
    </button>
  );
}

function StepPathChoice({ form, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold mb-1">Como quer começar?</h2>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">
          Você pode mudar isso a qualquer momento dentro do app
        </p>
      </div>

      <PathCard
        selected={form.chosen_path === 'fresh'}
        onClick={() => set('chosen_path', 'fresh')}
        icon={Compass}
        title="Começar do zero esta semana"
        desc="Vou te mostrar exatamente o que registrar nos próximos 7 dias para gerar seus primeiros insights."
        items={[
          'Log de refeições hoje (Nutrição)',
          'Criar ou iniciar um plano de treino (Treinos)',
          'Acompanhar peso + medidas 2× por semana',
          'Configurar protocolos ativos, se houver',
        ]}
      />

      <PathCard
        selected={form.chosen_path === 'own'}
        onClick={() => set('chosen_path', 'own')}
        icon={Dumbbell}
        title="Vou configurar no meu ritmo"
        desc="Já tenho uma rotina. Vou explorar os módulos que fazem sentido para mim."
      />

      {!form.chosen_path && (
        <p className="text-[11px] text-center text-[hsl(var(--fg-3))]">
          Selecione uma das opções para continuar
        </p>
      )}
    </div>
  );
}

// ─── Paywall priming screen (transcript 2 playbook) ───────────────────────────
// Shows BEFORE the actual setup generation. Builds trust, explains the trial,
// and primes users toward the annual plan without hard-selling.

function PaywallPrimingScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 py-2"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-[hsl(var(--brand))]" strokeWidth={1.75} />
        </div>
        <h2 className="text-[20px] font-bold tracking-tight mb-1">
          Como seu período gratuito funciona
        </h2>
        <p className="text-[13px] text-[hsl(var(--fg-2))] leading-relaxed">
          7 dias com acesso completo. Sem cartão de crédito agora.
        </p>
      </div>

      {/* Trial timeline */}
      <div className="space-y-2">
        {[
          {
            day: 'Hoje',
            title: 'Acesso completo desbloqueado',
            desc: 'Treinos, nutrição, IA e exames — tudo disponível desde o primeiro dia.',
            icon: '🚀',
            highlight: true,
          },
          {
            day: 'Dia 5',
            title: 'Lembrete por email',
            desc: 'Avisamos antes do seu período gratuito encerrar.',
            icon: '📧',
            highlight: false,
          },
          {
            day: 'Dia 7',
            title: 'Período gratuito encerra',
            desc: 'Escolha um plano para continuar ou perca o acesso.',
            icon: '⏰',
            highlight: false,
          },
        ].map(({ day, title, desc, icon, highlight }) => (
          <div
            key={day}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all
              ${highlight
                ? 'bg-[hsl(var(--brand)/0.06)] border-[hsl(var(--brand)/0.2)]'
                : 'bg-[hsl(var(--card-hi))] border-[hsl(var(--border-h))]'
              }`}
          >
            <span className="text-[18px] shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0
                  ${highlight ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'}`}>
                  {day}
                </span>
                <span className="text-[13px] font-semibold leading-snug">{title}</span>
              </div>
              <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Annual plan highlight — pushes LTV (transcript 2 playbook) */}
      <div className="rounded-xl border border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.04)] p-3">
        <div className="flex items-start gap-2.5">
          <Crown className="w-4 h-4 text-[hsl(var(--brand))] shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-[12px] font-semibold text-[hsl(var(--fg))] leading-snug">
              Plano Anual — economize até 40%
            </p>
            <p className="text-[11px] text-[hsl(var(--fg-2))] mt-0.5">
              Após o período gratuito, o plano anual garante o menor custo por mês. Você pode escolher na hora de ativar.
            </p>
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] px-3 py-2.5">
        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" strokeWidth={1.5} />
          ))}
          <span className="text-[11px] font-semibold ml-1 text-[hsl(var(--fg-2))]">
            4.9 · 500+ atletas
          </span>
        </div>
        <p className="text-[12px] text-[hsl(var(--fg-2))] italic leading-relaxed">
          "Finalmente um app que centraliza treino, nutrição e exames no mesmo lugar."
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="btn btn-primary w-full h-12 rounded-2xl text-[14px] gap-2"
      >
        Começar meu período gratuito <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </button>

      <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
        Sem cartão de crédito · Cancele quando quiser
      </p>
    </motion.div>
  );
}

// ─── Setup generation ─────────────────────────────────────────────────────────

function SetupGenerationScreen({ onDone }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      if (i < SETUP_MESSAGES.length - 1) {
        setMsgIdx(i);
      } else {
        setMsgIdx(SETUP_MESSAGES.length - 1);
        setDone(true);
        clearInterval(intervalRef.current);
      }
    }, 700);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="text-center py-6 space-y-8">
      <div className="relative w-20 h-20 mx-auto">
        <svg
          className="absolute inset-0 -rotate-90 animate-spin"
          style={{ animationDuration: '2s' }}
          viewBox="0 0 80 80"
        >
          <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border-h))" strokeWidth="4" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--brand))" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="50 164"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {done
            ? <Check className="w-8 h-8 text-[hsl(var(--ok))]" strokeWidth={2.5} />
            : <Zap className="w-7 h-7 text-[hsl(var(--brand))]" strokeWidth={2} />
          }
        </div>
      </div>

      <div className="space-y-2 min-h-[48px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-[15px] font-semibold text-[hsl(var(--fg))]"
          >
            {SETUP_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
        {!done && (
          <p className="text-[12px] text-[hsl(var(--fg-2))]">Configurando seu Atlas Core...</p>
        )}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button onClick={onDone} className="btn btn-primary h-12 px-8 rounded-2xl text-[14px] gap-2">
            <ArrowRight className="w-4 h-4" strokeWidth={2} /> Entrar no app
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ chosenPath, onDone }) {
  useEffect(() => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }, []);

  const isFresh = chosenPath === 'fresh';

  return (
    <div className="text-center py-4 space-y-6">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
        className="w-20 h-20 rounded-full bg-[hsl(var(--ok)/0.1)] flex items-center justify-center mx-auto"
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Check className="w-10 h-10 text-[hsl(var(--ok))]" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-[24px] font-bold">Tudo pronto! 🎉</h2>
        <p className="text-[14px] text-[hsl(var(--fg-2))] leading-relaxed max-w-xs mx-auto">
          {isFresh
            ? 'Seu primeiro checkpoint foi salvo. Vá para Today e comece seu primeiro log de hoje.'
            : 'Seu Atlas Core está configurado. Explore os módulos no ritmo que preferir.'}
        </p>
      </motion.div>

      {isFresh && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] p-4 text-left space-y-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
            Esta semana, foque em
          </p>
          {[
            { icon: UtensilsCrossed, text: 'Registrar refeições em Nutrição' },
            { icon: Dumbbell, text: 'Criar ou iniciar um plano em Treinos' },
            { icon: Scale, text: 'Logar medidas 2× esta semana' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2.5 text-[13px] text-[hsl(var(--fg-2))]"
            >
              <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand))] shrink-0" strokeWidth={2} />
              {text}
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        onClick={onDone}
        className="btn btn-primary w-full h-12 rounded-2xl text-[14px] gap-2 mt-2"
      >
        <ArrowRight className="w-4 h-4" strokeWidth={2} /> Entrar no app
      </motion.button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPaywallPriming, setShowPaywallPriming] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!isAuthenticated || !user) navigate(ROUTES.home, { replace: true });
    if (user?.onboarding_completed) {
      navigate(ROLE_HOME[user?.atlas_role] || ROUTES.today, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, id) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id],
    }));

  const canContinue = () => {
    if (step === 0) return true;
    if (step === 1) return form.health_goals.length > 0 && form.height && form.current_weight && form.age;
    if (step === 2) return !!form.checkpoint_weight;
    if (step === 3) return !!form.chosen_path;
    return true;
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  const saveAndFinish = async () => {
    if (!isAuthenticated || !user) { navigate(ROUTES.home, { replace: true }); return; }
    setSaving(true);
    try {
      const nums = ['age', 'height', 'current_weight', 'target_weight'];
      const payload = { onboarding_completed: true };
      // Map form fields to profile columns
      nums.forEach((k) => {
        if (form[k] !== '') payload[k] = Number(form[k]);
      });
      if (form.sex) payload.sex = form.sex;
      if (form.activity_level) payload.activity_level = form.activity_level;
      if (form.health_goals.length) payload.health_goals = form.health_goals;

      // Auto-calculate macro targets based on weight + goals
      const w = Number(form.current_weight) || 80;
      const isDeficit = form.health_goals.includes('fat_loss');
      const multiplier = isDeficit ? 28 : form.health_goals.includes('muscle_gain') ? 35 : 30;
      payload.calories_target = Math.round(w * multiplier);
      payload.protein_target = Math.round(w * 2.2);
      payload.carbs_target = Math.round((payload.calories_target * 0.4) / 4);
      payload.fat_target = Math.round((payload.calories_target * 0.25) / 9);
      payload.water_target = parseFloat((w * 0.035).toFixed(1));

      await supabase
        .from('profiles')
        .upsert({ ...payload, id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' });

      // Store remarketing data in user metadata (no schema change needed)
      if (form.hear_about_us) {
        await supabase.auth.updateUser({
          data: { hear_about_us: form.hear_about_us },
        });
      }

      // Insert first measurement checkpoint
      const checkpointWeight = Number(form.checkpoint_weight) || Number(form.current_weight);
      if (checkpointWeight) {
        const measurementPayload = {
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          weight: checkpointWeight,
        };
        if (form.checkpoint_body_fat !== '') {
          measurementPayload.body_fat = Number(form.checkpoint_body_fat);
        }
        if (form.checkpoint_waist !== '') {
          measurementPayload.waist = Number(form.checkpoint_waist);
        }
        await supabase.from('measurements').insert(measurementPayload);
      }
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Step 3 finish → save → show paywall priming
  const handleFinish = async () => {
    await saveAndFinish();
    setShowPaywallPriming(true);
  };

  // Paywall priming CTA → setup generation
  const handlePrimingContinue = () => {
    setShowPaywallPriming(false);
    setShowGeneration(true);
  };

  const handleGenerationDone = () => {
    setShowGeneration(false);
    setShowSuccess(true);
  };

  const handleSuccessDone = () => {
    navigate(ROLE_HOME[user?.atlas_role] || ROUTES.today, { replace: true });
  };

  const stepContent = () => {
    switch (step) {
      case 0: return <StepWelcome />;
      case 1: return <StepProfileAndGoals form={form} set={set} toggle={toggle} />;
      case 2: return <StepFirstCheckpoint form={form} set={set} />;
      case 3: return <StepPathChoice form={form} set={set} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center p-5">
      <div className="w-full max-w-md">

        {/* ── Paywall priming screen ── */}
        {showPaywallPriming && (
          <>
            <Logo />
            <div className="surface rounded-2xl p-6">
              <PaywallPrimingScreen onContinue={handlePrimingContinue} />
            </div>
          </>
        )}

        {/* ── Setup generation screen ── */}
        {!showPaywallPriming && showGeneration && (
          <>
            <Logo />
            <div className="surface rounded-2xl p-8">
              <SetupGenerationScreen onDone={handleGenerationDone} />
            </div>
          </>
        )}

        {/* ── Success screen ── */}
        {!showPaywallPriming && !showGeneration && showSuccess && (
          <>
            <Logo />
            <div className="surface rounded-2xl p-8">
              <SuccessScreen chosenPath={form.chosen_path} onDone={handleSuccessDone} />
            </div>
          </>
        )}

        {/* ── Main onboarding steps ── */}
        {!showPaywallPriming && !showGeneration && !showSuccess && (
          <>
            <div className="flex justify-end mb-1">
              <button
                onClick={() => navigate(ROUTES.home, { replace: true })}
                className="p-2 rounded-lg hover:bg-[hsl(var(--shell))] transition-colors text-[hsl(var(--fg-2))]"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <Logo />
            <StepDots step={step} total={TOTAL_STEPS} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="surface rounded-2xl p-6 mb-4"
              >
                {stepContent()}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="btn btn-secondary h-11 rounded-xl px-4"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canContinue()}
                  className="btn btn-primary flex-1 h-11 rounded-xl text-[14px] gap-1"
                >
                  Continuar <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving || !canContinue()}
                  className="btn btn-primary flex-1 h-11 rounded-xl text-[14px] gap-1.5"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Zap className="w-4 h-4" strokeWidth={2} /> Configurar meu Atlas Core</>
                  }
                </button>
              )}
            </div>

            {step === 0 && (
              <p className="text-center text-[11px] text-[hsl(var(--fg-2))] mt-4">
                Ao continuar, você aceita os{' '}
                <span className="underline cursor-pointer">Termos de Uso</span>.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
