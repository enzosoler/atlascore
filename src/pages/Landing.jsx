import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Layers,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';
import PublicSiteShell, {
  PublicLanguageSwitcher,
} from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

/* ─────────────────────────────────────────
   AUTH ACTIONS
───────────────────────────────────────── */
const handleSignUp = () => { window.location.href = `${ROUTES.auth}?mode=signup`; };
const handleLogin  = () => { window.location.href = `${ROUTES.auth}?mode=login`; };
const handlePlan   = (id) => {
  if (!id || id === 'free') { handleSignUp(); return; }
  if (window.self !== window.top) { alert('O checkout só funciona no app publicado.'); return; }
  sessionStorage.setItem('pending_plan', id);
  window.location.href = `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.pricing)}`;
};

/* ─────────────────────────────────────────
   COPY (bilingual, inline)
───────────────────────────────────────── */
const COPY = {
  'pt-BR': {
    nav: { howItWorks: 'Como funciona', features: 'Funcionalidades', blog: 'Blog', pricing: 'Planos', login: 'Entrar', signup: 'Criar conta' },
    hero: {
      badge: 'Acesso Antecipado',
      h1a: 'Seu corpo está evoluindo.',
      h1b: 'Você sabe exatamente como?',
      sub: 'Um único lugar para treinos, nutrição, suplementos e progresso. Pare de gerenciar abas. Comece a entender sua evolução.',
      cta1: 'Começar grátis',
      cta2: 'Ver como funciona',
      s1t: '1 sistema', s1d: 'em vez de 6 apps',
      s2t: 'Clareza total', s2d: 'sobre seu progresso real',
      s3t: 'Feito para', s3d: 'a vida real, não planos perfeitos',
    },
    problem: {
      label: 'O Problema',
      h2: 'Seus dados de saúde\nestão espalhados por toda parte.',
      sub: 'Você leva a sério seu corpo — mas suas informações vivem em 5 lugares diferentes. Nenhum deles fala com o outro.',
      items: [
        { e: '🏋️', t: 'App de treino', d: 'Séries, repetições, PRs — mas nada mais' },
        { e: '🥗', t: 'Contador de calorias', d: 'Calorias registradas, ignoradas pela manhã' },
        { e: '📊', t: 'Planilha', d: 'Medidas que você atualiza duas vezes por ano' },
        { e: '📱', t: 'Notas', d: 'Stack de suplementos anotado em 2022' },
        { e: '📸', t: 'Galeria de fotos', d: 'Fotos de progresso soterradas no rolo da câmera' },
        { e: '💬', t: 'WhatsApp', d: 'Feedback do coach que você nunca mais vai achar' },
      ],
      quote: '"O problema não é falta de esforço. É que você não tem uma visão real do que todo esse esforço está fazendo."',
      quoteDesc: 'Sem uma visão unificada, você não sabe se está progredindo, estagnado ou regredindo. Você está trabalhando no escuro.',
    },
    solution: {
      label: 'A Solução',
      h2a: 'Tudo em um lugar.',
      h2b: 'Finalmente.',
      sub: 'O Atlas Core é seu sistema de performance pessoal. Não é mais um app de treino, não é um rastreador de dieta — é o único lugar onde todos os seus dados de saúde vivem, se conectam e fazem sentido.',
      p1t: 'Centralizado', p1d: 'Treinos, nutrição, suplementos, medidas e fotos — tudo em um sistema. Sem mais troca de apps.',
      p2t: 'Focado em progresso', p2d: 'O produto inteiro é construído em torno de uma pergunta: você está realmente melhorando?',
      p3t: 'Pronto para a vida real', p3d: 'Planos não são perfeitos. O Atlas Core reflete como você realmente vive — não como pretendia viver.',
    },
    features: {
      workouts: {
        label: 'Treinos',
        h2: 'Treine mais inteligente.\nRegistre tudo.',
        desc: 'Registre qualquer treino, qualquer estilo. Acompanhe séries, reps, carga e descanso. Saiba exatamente o que fez na última sessão — e supere.',
        pts: [
          { t: 'Biblioteca completa de exercícios', d: '— ou adicione os seus. Musculação, funcional, cardio.' },
          { t: 'Histórico de treinos em destaque', d: '— veja todas as sessões que já fez.' },
          { t: 'Rastreamento de PR automático', d: '— recordes pessoais se atualizam sozinhos.' },
          { t: 'Sem templates forçados', d: '— registre o que realmente fez, não o que foi planejado.' },
        ],
      },
      nutrition: {
        label: 'Nutrição',
        h2: 'Registre a comida.\nEntenda os padrões.',
        desc: 'Acompanhe o que come sem obsessão. O objetivo não é perfeição — é consciência. Veja o que realmente move seus resultados.',
        pts: [
          { t: 'Registro diário rápido', d: '— refeições, macros e calorias sem atrito.' },
          { t: 'Padrões semanais', d: '— veja onde está atingindo metas e onde não está.' },
          { t: 'Conectado aos resultados', d: '— nutrição fica ao lado dos dados de peso e performance.' },
          { t: 'Não é uma prisão calórica', d: '— desenhado para consciência, não ansiedade.' },
        ],
      },
      progress: {
        label: 'Rastreamento de Progresso',
        h2: 'Números não mentem.\nAgora você pode vê-los.',
        desc: 'Peso, gordura corporal, circunferências — registrados em segundos, visíveis ao longo do tempo.',
        pts: [
          { t: 'Tendências de peso corporal', d: '— médias semanais cortam o ruído diário.' },
          { t: 'Medidas completas', d: '— cintura, peito, braços, pernas, quadril, % gordura.' },
          { t: 'Comparações antes/depois', d: '— escolha duas datas e veja a diferença.' },
          { t: 'Detecção de tendência', d: '— saiba imediatamente se sua trajetória está correta.' },
        ],
      },
      photos: {
        label: 'Fotos de Progresso',
        h2: 'Veja o que a balança\nnão consegue mostrar.',
        desc: 'Seu corpo muda de formas que as medidas não capturam. Fotos de progresso são o registro mais honesto que você tem.',
        pts: [
          { t: 'Organizadas por data', d: '— sem mais cavar no rolo da câmera.' },
          { t: 'Comparação lado a lado', d: '— escolha dois check-ins e veja a diferença.' },
          { t: 'Privado e seguro', d: '— suas fotos são suas. Sem compartilhamento público.' },
          { t: 'Sincronizado com métricas', d: '— veja seu peso e medidas ao lado da foto daquele dia.' },
        ],
      },
      supplements: {
        label: 'Suplementos & Protocolos',
        h2: 'Seu stack registrado.\nFinalmente consistente.',
        desc: 'Creatina, vitaminas, pré-treino — seja lá qual for o seu protocolo, o Atlas Core o mantém organizado e rastreável.',
        pts: [
          { t: 'Checklist diário', d: '— registre o que tomou e quando.' },
          { t: 'Protocolos personalizados', d: '— stack matinal, noturno, dosagem por ciclo.' },
          { t: 'Rastreamento de consistência', d: '— veja sua aderência nos últimos 30 dias.' },
          { t: 'Sem julgamentos', d: '— registre o que quiser. São seus dados de saúde.' },
        ],
      },
      timeline: {
        label: 'Linha do Tempo Unificada',
        h2: 'Tudo que aconteceu,\nem uma visão.',
        desc: 'Treinos, check-ins, fotos, mudanças de protocolo — tudo visível em uma única linha do tempo cronológica.',
        pts: [
          { t: 'Log automático', d: '— cada ação vira parte do seu histórico.' },
          { t: 'Cruze qualquer dado', d: '— veja como estava sua nutrição na semana que bateu o PR.' },
          { t: 'Resumos mensais', d: '— entenda o que cada mês realmente entregou.' },
          { t: 'Memória de longo prazo', d: '— volte 6, 12 meses, 2 anos. Seus dados não expiram.' },
        ],
      },
    },
    diff: {
      label: 'Por que Atlas Core',
      h2: 'Não é mais um app de fitness.',
      sub: 'Cada outra ferramenta é construída em torno de uma única categoria. O Atlas Core é construído em torno de você.',
      cols: ['Capacidade', 'Apps de treino', 'Rastreadores de comida', 'Apps genéricos', 'Atlas Core'],
      rows: [
        ['Rastreamento de treino', '✓', '—', 'Parcial', '✓ Completo'],
        ['Nutrição & macros', '—', '✓', 'Parcial', '✓ Completo'],
        ['Medidas corporais', '—', '—', 'Básico', '✓ Completo'],
        ['Fotos de progresso', '—', '—', '—', '✓ Organizado'],
        ['Suplementos', '—', '—', '—', '✓ Completo'],
        ['Linha do tempo unificada', '—', '—', '—', '✓ Tudo'],
        ['Análise entre métricas', '—', '—', '—', '✓ Integrado'],
      ],
      cards: [
        { e: '🚫', t: 'Não força planos', d: 'O Atlas Core não diz o que fazer. Rastreia o que você realmente faz — e mostra se está funcionando.' },
        { e: '🚫', t: 'Sem gamificação', d: 'Sem streaks, sem medalhas, sem motivação falsa. Seu progresso é real. Essa é a recompensa.' },
        { e: '🚫', t: 'Não é clínico', d: 'Construído para pessoas sérias — não pacientes. Sem jargão, sem formulários, sem complexidade.' },
      ],
    },
    pricing: {
      label: 'Planos',
      h2: 'Simples. Honesto.',
      sub: 'Comece grátis. Faça upgrade quando quiser a visão completa.',
      toggle: { intl: 'USD / Internacional', br: 'BRL / Brasil' },
      free: {
        name: 'Free', priceIntl: '$0', priceBR: 'Grátis', period: '/mês', annualNote: 'Sempre grátis. Sem cartão.',
        features: ['Today básico', 'Diário de treino e nutrição', 'Registro de medidas', 'Protocolos básicos', 'Perfil e configurações', 'Histórico limitado (30 dias)', 'Atlas AI limitada'],
        absent: ['Geração de dieta/treino por IA', 'Exames laboratoriais completos', 'Fotos de progresso', 'Analytics avançados', 'Export PDF/CSV'],
        cta: 'Criar conta grátis', id: 'free',
      },
      pro: {
        name: 'Pro', priceIntl: '$9.99', priceBR: 'R$ 29', period: '/mês',
        annualIntl: 'Ou $79/ano — economize $40 (33%)', annualBR: 'Ou R$249/ano — economize R$110 (31%)',
        popular: 'Mais escolhido',
        features: [
          'Tudo do Free', 'Geração de dieta por IA', 'Geração de treino por IA', 'Plano Alimentar / Plano de Treino completos',
          'Exames laboratoriais completos', 'Fotos de progresso ilimitadas', 'Histórico expandido (1 ano)',
          'Analytics completos', 'Atlas AI contextual completa', 'Export PDF e CSV', 'Alertas de estoque', 'Social cards premium',
        ],
        cta: '7 dias grátis — sem cartão', id: 'pro_monthly',
      },
      founder: {
        h3: '🔒 Preço Fundador — Bloqueado Para Sempre',
        desc: 'Entrando no Acesso Antecipado? Seu preço nunca muda — mesmo quando aumentarmos. Você entra pelo preço de base.',
        cta: 'Garantir preço fundador',
      },
    },
    pros: {
      label: 'Para Profissionais',
      h2: 'Feito para o indivíduo.\nFunciona com seu time.',
      sub: 'O Atlas Core não exige coach ou nutricionista. Mas se você trabalha com um, ele pode ver seus dados e colaborar direto no app.',
      cards: [
        { e: '🏃', t: 'Personal Trainers', d: 'Acompanhe treinos, fotos de progresso e medidas dos seus alunos em tempo real. Sem mais prints no WhatsApp.' },
        { e: '🥦', t: 'Nutricionistas', d: 'Revise registros alimentares reais ao lado das métricas corporais. Veja se o plano está gerando resultados reais.' },
      ],
      note: 'A colaboração profissional é opcional. O Atlas Core funciona perfeitamente sem nenhum outro envolvido.',
    },
    closing: {
      h2a: 'Você tem colocado esforço.',
      h2b: 'Está na hora de ver.',
      sub: 'O Atlas Core te dá o que nenhum app de fitness conseguiu — a visão completa da sua evolução física, em um lugar, sempre honesto.',
      cta1: 'Começar grátis hoje', cta2: 'Ver todos os planos',
      fine: 'Sem cartão de crédito. Plano grátis disponível. Cancele quando quiser.',
    },
  },
  'en-US': {
    nav: { howItWorks: 'How it works', features: 'Features', blog: 'Blog', pricing: 'Pricing', login: 'Log In', signup: 'Get Started' },
    hero: {
      badge: 'Early Access',
      h1a: 'Track what you do.',
      h1b: 'Understand what works',
      sub: 'Atlas connects your training, nutrition, and body progress in one place — so the relationship between your habits and your results becomes clear.',
      cta1: 'Get Started',
      cta2: 'How It Works',
      s1t: '1 system', s1d: 'instead of 6 apps',
      s2t: 'Full clarity', s2d: 'on your real progress',
      s3t: 'Built for', s3d: 'real life, not perfect plans',
    },
    problem: {
      label: 'The Problem',
      h2: 'You\'re collecting data.\nYou\'re not gaining clarity.',
      sub: 'You\'re putting in the work. But nothing is connected — so nothing makes sense together.',
      items: [
        { e: '🏋️', t: 'Workout App', d: 'Sets, reps, PRs — but nothing else' },
        { e: '🥗', t: 'Food Tracker', d: 'Calories logged, ignored by morning' },
        { e: '📊', t: 'Spreadsheet', d: 'Measurements you update twice a year' },
        { e: '📱', t: 'Notes App', d: 'Supplement stack written in a note from 2022' },
        { e: '📸', t: 'Photo Gallery', d: 'Progress photos buried in your camera roll' },
        { e: '💬', t: 'WhatsApp', d: 'Coach feedback you\'ll never find again' },
      ],
      quote: 'That\'s not a data problem. It\'s a clarity problem.',
      quoteDesc: 'Without a unified view, you can\'t tell if you\'re progressing, plateauing, or going backwards.',
    },
    solution: {
      label: 'The Solution',
      h2a: 'Everything connected.',
      h2b: 'Finally.',
      sub: 'Atlas is a single platform for people who want to understand their progress, not just record it. Training, nutrition, and body metrics — organized, connected, readable.',
      p1t: 'Centralized', p1d: 'Training, nutrition, body metrics — all in one system. When the data lives together, patterns become visible.',
      p2t: 'Connected', p2d: 'The entire product is built around one question: what is actually driving your results?',
      p3t: 'Honest', p3d: 'No gamification. No motivation tricks. Just your data, clearly presented.',
    },
    features: {
      workouts: {
        label: 'Workouts',
        h2: 'See how your\ntraining builds.',
        desc: 'Track volume, intensity, and consistency over time. Know when you\'re progressing and when you\'ve plateaued.',
        pts: [
          { t: 'Full exercise library', d: '— or add your own. Bodybuilding, functional, cardio.' },
          { t: 'Workout history at a glance', d: '— see every session you\'ve ever done.' },
          { t: 'PR tracking built in', d: '— personal records update automatically.' },
          { t: 'No forced templates', d: '— log what you actually did, not what was planned.' },
        ],
      },
      nutrition: {
        label: 'Nutrition',
        h2: 'See what your\nnutrition is doing.',
        desc: 'Not just a daily calorie count. A clear view of your intake patterns and how they connect to your performance and body composition.',
        pts: [
          { t: 'Fast daily logging', d: '— meals, macros, and calories without friction.' },
          { t: 'Weekly patterns', d: '— see where you\'re hitting targets and where you\'re not.' },
          { t: 'Connected to results', d: '— nutrition sits next to body weight and performance data.' },
          { t: 'Not a calorie prison', d: '— designed for awareness, not anxiety.' },
        ],
      },
      progress: {
        label: 'Progress Tracking',
        h2: 'Track real\nbody changes.',
        desc: 'Weight fluctuates. Atlas tracks multiple markers — body measurements, visual progress, weight trends — so you see the full picture.',
        pts: [
          { t: 'Body weight trends', d: '— weekly averages cut through daily noise.' },
          { t: 'Full measurements', d: '— waist, chest, arms, legs, hips, body fat %.' },
          { t: 'Before/after comparisons', d: '— pick any two dates and see the difference.' },
          { t: 'Trend detection', d: '— know immediately if your trajectory is going the right way.' },
        ],
      },
      photos: {
        label: 'Progress Photos',
        h2: 'See what the scale\ncan\'t show.',
        desc: 'Your body changes in ways measurements miss. Progress photos are the most honest record you have.',
        pts: [
          { t: 'Organized by date', d: '— no more digging through your camera roll.' },
          { t: 'Side-by-side comparison', d: '— pick any two check-ins and see the difference.' },
          { t: 'Private and secure', d: '— your photos stay yours. No public sharing.' },
          { t: 'Synced with metrics', d: '— see your weight and measurements alongside the photo from that day.' },
        ],
      },
      supplements: {
        label: 'Supplements & Protocols',
        h2: 'Your stack, tracked.\nFinally consistent.',
        desc: 'Creatine, vitamins, pre-workout — whatever your protocol is, Atlas keeps it organized and trackable.',
        pts: [
          { t: 'Daily checklist', d: '— log what you took, when you took it.' },
          { t: 'Custom protocols', d: '— morning stack, evening stack, cycle-based dosing.' },
          { t: 'Consistency tracking', d: '— see your adherence over the past 30 days.' },
          { t: 'No judgment', d: '— log whatever you want. It\'s your health data.' },
        ],
      },
      timeline: {
        label: 'Unified Timeline',
        h2: 'Everything that happened,\nin one view.',
        desc: 'Workouts, check-ins, photos, protocol changes — all visible in a single chronological timeline.',
        pts: [
          { t: 'Automatic log', d: '— every action you take becomes part of your history.' },
          { t: 'Cross-reference anything', d: '— see what your nutrition looked like the week you hit your PR.' },
          { t: 'Monthly summaries', d: '— understand what each month actually delivered.' },
          { t: 'Long-term memory', d: '— scroll back 6 months, 12 months, 2 years. Your data doesn\'t expire.' },
        ],
      },
    },
    diff: {
      label: 'Why Atlas',
      h2: 'Not another fitness app.',
      sub: 'Most tools track a single category. Atlas is built around the connection between all of them.',
      cols: ['Capability', 'Workout Apps', 'Food Trackers', 'Generic Health Apps', 'Atlas'],
      rows: [
        ['Workout tracking', '✓', '—', 'Partial', '✓ Full'],
        ['Nutrition & macros', '—', '✓', 'Partial', '✓ Full'],
        ['Body measurements', '—', '—', 'Basic', '✓ Full'],
        ['Progress photos', '—', '—', '—', '✓ Organized'],
        ['Supplement tracking', '—', '—', '—', '✓ Full'],
        ['Unified timeline', '—', '—', '—', '✓ Everything'],
        ['Cross-metric analysis', '—', '—', '—', '✓ Built-in'],
      ],
      cards: [
        { e: '🚫', t: 'No plan-pushing', d: 'Atlas doesn\'t tell you what to do. It tracks what you actually do — and shows you if it\'s working.' },
        { e: '🚫', t: 'No gamification', d: 'No streaks, no badges. Your progress is real. That\'s the reward.' },
        { e: '🚫', t: 'Not clinical', d: 'Built for serious people. No jargon, no forms, no complexity.' },
      ],
    },
    pricing: {
      label: 'Pricing',
      h2: 'Simple. Honest.',
      sub: 'Start free. Upgrade when you want the full picture.',
      toggle: { intl: 'USD / International', br: 'BRL / Brasil' },
      free: {
        name: 'Free', priceIntl: '$0', priceBR: 'R$ 0', period: '/month', annualNote: 'Always free. No card required.',
        features: ['Basic Today', 'Workout and nutrition diary', 'Measurement tracking', 'Basic protocols', 'Profile and settings', 'Limited history (30 days)', 'Limited Atlas AI'],
        absent: ['AI diet/workout generation', 'Full lab work', 'Progress photos', 'Advanced analytics', 'PDF/CSV export'],
        cta: 'Get Started Free', id: 'free',
      },
      pro: {
        name: 'Pro', priceIntl: '$9.99', priceBR: 'R$ 29', period: '/month',
        annualIntl: 'Or $79/year — save $40 (33%)', annualBR: 'Or R$249/year — save $40 (33%)',
        popular: 'Most Popular',
        features: [
          'Everything in Free', 'AI diet generation', 'AI workout generation', 'Complete meal/workout plans',
          'Full lab work', 'Unlimited progress photos', 'Expanded history (1 year)',
          'Complete analytics', 'Full contextual Atlas AI', 'PDF and CSV export', 'Stock alerts', 'Premium social cards',
        ],
        cta: 'Start Pro Free for 7 Days', id: 'pro_monthly',
      },
      founder: {
        h3: '🔒 Founder Price — Locked Forever',
        desc: 'Joining during Early Access? Your price never changes — even when we raise rates.',
        cta: 'Claim Founder Price',
      },
    },
    pros: {
      label: 'For Professionals',
      h2: 'Built for individuals.\nWorks with your team.',
      sub: 'Atlas doesn\'t require a coach or nutritionist. But if you work with one, they can see your data and collaborate directly inside the app.',
      cards: [
        { e: '🏃', t: 'Personal Trainers', d: 'See your clients\' workout logs, progress photos, and measurements in real-time. No more WhatsApp screenshots.' },
        { e: '🥦', t: 'Nutritionists', d: 'Review actual food logs alongside body metrics. See whether the plan is translating into real results.' },
      ],
      note: 'Professional collaboration is optional. Atlas works perfectly without anyone else involved.',
    },
    closing: {
      h2a: 'Clarity over guesswork.',
      h2b: 'Start now.',
      sub: 'If you\'re serious about your results, your tools should be too. Atlas gives you the clarity to see what\'s working — and the foundation to keep improving.',
      cta1: 'Get Started', cta2: 'See All Plans',
      fine: 'No credit card needed. Free plan available. Cancel anytime.',
    },
  },
};

const HOME_MOCK_COPY = {
  'pt-BR': {
    workout: {
      overline: 'Treino de hoje',
      exerciseName: 'supino reto',
      weight: '102,5 kg',
      progress: '⬆ +2,5 kg desde a última sessão · PR',
      bars: [
        { label: 'Volume', pct: 82, val: '+18%' },
        { label: 'Frequência', pct: 65, val: '3x/sem' },
        { label: 'Consistência', pct: 91, val: '91%' },
      ],
      tags: ['Peito A', 'Superior', 'Semana 6'],
    },
    nutrition: {
      overline: 'Nutrição do dia',
      metricLabel: 'Calorias',
      metricValue: '2.340',
      metricMeta: 'Meta: 2.500 · 94% do objetivo',
      bars: [
        { label: 'Proteína', pct: 88, val: '176g' },
        { label: 'Carbo', pct: 72, val: '248g' },
        { label: 'Gordura', pct: 54, val: '62g' },
      ],
      summaryLabel: 'Média de 7 dias',
      summaryText: 'Proteína média: 168g · 3 dias abaixo da meta',
    },
    progress: {
      overline: 'Evolução corporal',
      cards: [
        { label: 'Peso', value: '84,2 kg', trend: '▼ −3,8 kg / 8 sem' },
        { label: 'Gordura', value: '17,4%', trend: '▼ −2,1% / 8 sem' },
      ],
      bars: [
        { label: 'Cintura', pct: 60, val: '−3 cm', accent: true },
        { label: 'Braço', pct: 75, val: '+1,5 cm' },
        { label: 'Peito', pct: 68, val: '+2 cm' },
      ],
    },
    photos: {
      overline: 'Progresso visual',
      items: [
        ['01 jan', '#1a1a2e'],
        ['15 fev', '#1e2a1e'],
        ['19 mar', '#2a1e1e'],
      ],
      summaryTitle: '📸 12 semanas de progresso',
      summaryText: 'Compare quaisquer duas datas. A diferença que você não percebe no dia a dia.',
    },
    supplements: {
      overline: 'Protocolo do dia',
      items: [
        { icon: '💊', name: 'Creatina', dose: '5g · Manhã', done: true },
        { icon: '🌿', name: 'Vitamina D3', dose: '5000 IU · Manhã', done: true },
        { icon: '🔥', name: 'Pré-treino', dose: '1 dose · Pré-treino', done: true },
        { icon: '🌙', name: 'Magnésio', dose: '400mg · Noite', done: false },
      ],
      summaryLabel: 'Aderência em 30 dias',
      summaryValue: '87%',
      summarySuffix: 'de consistência',
    },
    timeline: {
      overline: 'Sua linha do tempo',
      items: [
        { date: 'Hoje · 19 mar', label: 'Novo PR — agachamento 140 kg', detail: 'Treino registrado · 4 exercícios', active: true },
        { date: '17 mar', label: 'Check-in — 84,2 kg', detail: '% de gordura: 17,4% · Foto de progresso', active: false },
        { date: '15 mar', label: 'Protocolo atualizado', detail: 'Ômega-3 adicionado · 3g por dia', active: false },
        { date: '12 mar', label: 'Nutrição — melhor semana', detail: 'Proteína média: 182g · 7/7 dias', active: false },
      ],
    },
  },
  'en-US': {
    workout: {
      overline: "Today's workout",
      exerciseName: 'bench press',
      weight: '102.5 kg',
      progress: '⬆ +2.5 kg from last session · PR',
      bars: [
        { label: 'Volume', pct: 82, val: '+18%' },
        { label: 'Frequency', pct: 65, val: '3x/wk' },
        { label: 'Consistency', pct: 91, val: '91%' },
      ],
      tags: ['Push A', 'Upper', 'Week 6'],
    },
    nutrition: {
      overline: "Today's nutrition",
      metricLabel: 'Calories',
      metricValue: '2,340',
      metricMeta: 'Target: 2,500 · 94% of goal',
      bars: [
        { label: 'Protein', pct: 88, val: '176g' },
        { label: 'Carbs', pct: 72, val: '248g' },
        { label: 'Fat', pct: 54, val: '62g' },
      ],
      summaryLabel: '7-day average',
      summaryText: 'Average protein: 168g · 3 days below target',
    },
    progress: {
      overline: 'Body evolution',
      cards: [
        { label: 'Weight', value: '84.2 kg', trend: '▼ −3.8 kg / 8 wk' },
        { label: 'Body fat', value: '17.4%', trend: '▼ −2.1% / 8 wk' },
      ],
      bars: [
        { label: 'Waist', pct: 60, val: '−3 cm', accent: true },
        { label: 'Arm', pct: 75, val: '+1.5 cm' },
        { label: 'Chest', pct: 68, val: '+2 cm' },
      ],
    },
    photos: {
      overline: 'Visual progress',
      items: [
        ['Jan 01', '#1a1a2e'],
        ['Feb 15', '#1e2a1e'],
        ['Mar 19', '#2a1e1e'],
      ],
      summaryTitle: '📸 12 weeks of progress',
      summaryText: "Compare any two dates. The difference you don't notice day to day.",
    },
    supplements: {
      overline: "Today's protocol",
      items: [
        { icon: '💊', name: 'Creatine', dose: '5g · Morning', done: true },
        { icon: '🌿', name: 'Vitamin D3', dose: '5000 IU · Morning', done: true },
        { icon: '🔥', name: 'Pre-workout', dose: '1 scoop · Pre-workout', done: true },
        { icon: '🌙', name: 'Magnesium', dose: '400mg · Night', done: false },
      ],
      summaryLabel: '30-day adherence',
      summaryValue: '87%',
      summarySuffix: 'consistency',
    },
    timeline: {
      overline: 'Your timeline',
      items: [
        { date: 'Today · Mar 19', label: 'New PR — squat 140 kg', detail: 'Workout logged · 4 exercises', active: true },
        { date: 'Mar 17', label: 'Check-in — 84.2 kg', detail: 'Body fat: 17.4% · Progress photo', active: false },
        { date: 'Mar 15', label: 'Protocol updated', detail: 'Added omega-3 · 3g daily', active: false },
        { date: 'Mar 12', label: 'Nutrition — best week', detail: 'Average protein: 182g · 7/7 days', active: false },
      ],
    },
  },
};

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

function FeaturePoint({ t, d }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]">
        <Check className="h-3 w-3" strokeWidth={2.6} />
      </div>
      <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
        <strong className="font-semibold text-[hsl(var(--fg))]">{t}</strong>{d}
      </p>
    </div>
  );
}

function MockCard({ children }) {
  return (
    <div className="rounded-[14px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.6)] p-3.5">
      {children}
    </div>
  );
}

function BarRow({ label, pct, val, accent = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-16 shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: accent ? 'hsl(0 67% 52%)' : 'hsl(var(--brand))' }}
        />
      </div>
      <span className="w-9 text-right text-[11px] text-[hsl(var(--fg-2))]">{val}</span>
    </div>
  );
}

function WorkoutMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <MockCard>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{copy.exerciseName}</p>
        <p className="mt-1 text-[2rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{copy.weight}</p>
        <p className="mt-0.5 text-[11px] text-[hsl(var(--brand))]">{copy.progress}</p>
      </MockCard>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {copy.tags.map((tag) => (
          <span key={tag} className="atlas-public-pill border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.06)] text-[hsl(var(--brand))]">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function NutritionMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <MockCard>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{copy.metricLabel}</p>
        <p className="mt-1 text-[2rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{copy.metricValue}</p>
        <p className="mt-0.5 text-[11px] text-[hsl(var(--fg-2))]">{copy.metricMeta}</p>
      </MockCard>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} />
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{copy.summaryLabel}</p>
        <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">{copy.summaryText}</p>
      </MockCard>
    </div>
  );
}

function ProgressMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="grid grid-cols-2 gap-2">
        {copy.cards.map((card) => (
          <MockCard key={card.label}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{card.label}</p>
            <p className="mt-1 text-[1.8rem] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">{card.value}</p>
            <p className="mt-0.5 text-[11px] text-[hsl(var(--brand))]">{card.trend}</p>
          </MockCard>
        ))}
      </div>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} accent={bar.accent} />
        ))}
      </div>
    </div>
  );
}

function PhotosMock({ copy }) {
  const demoPhotos = [
    { date: '01 Jan', url: '/demo-progress-photos/progress_casual_1.jpg' },
    { date: '15 Feb', url: '/demo-progress-photos/progress_casual_2.jpg' },
    { date: '19 Mar', url: '/demo-progress-photos/progress_photo_2_during.jpg' },
  ];
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="grid grid-cols-3 gap-2">
        {demoPhotos.map(({ date, url }) => (
          <div key={date} className="relative overflow-hidden rounded-[12px] border border-[hsl(var(--border)/0.7)]" style={{ aspectRatio: '3/4' }}>
            <img src={url} alt={date} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90">{date}</span>
          </div>
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] font-semibold text-[hsl(var(--brand))]">{copy.summaryTitle}</p>
        <p className="mt-1 text-[13px] text-[hsl(var(--fg))]">{copy.summaryText}</p>
      </MockCard>
    </div>
  );
}

function SupplementsMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="space-y-2">
        {copy.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{item.icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.name}</p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.dose}</p>
              </div>
            </div>
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${item.done ? 'border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]' : 'border border-[hsl(var(--border))] bg-transparent'}`}>
              {item.done ? <Check className="h-3 w-3" strokeWidth={2.6} /> : null}
            </div>
          </div>
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{copy.summaryLabel}</p>
        <p className="mt-0.5 text-[1.2rem] font-bold tracking-[-0.04em] text-[hsl(var(--brand))]">{copy.summaryValue} <span className="text-[11px] font-normal text-[hsl(var(--fg-3))]">{copy.summarySuffix}</span></p>
      </MockCard>
    </div>
  );
}

function TimelineMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="space-y-0">
        {copy.items.map((item, i) => (
          <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < copy.items.length - 1 && (
              <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[hsl(var(--border)/0.7)]" />
            )}
            <div className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${item.active ? 'border-[hsl(var(--brand))] bg-[hsl(var(--card))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--fill))]'}`} />
            <div>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.date}</p>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.label}</p>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURE_BLOCKS = [
  { key: 'workouts', mockKey: 'workout', Mock: WorkoutMock, reverse: false },
  { key: 'nutrition', mockKey: 'nutrition', Mock: NutritionMock, reverse: true },
  { key: 'progress', mockKey: 'progress', Mock: ProgressMock, reverse: false },
  { key: 'photos', mockKey: 'photos', Mock: PhotosMock, reverse: true },
  { key: 'supplements', mockKey: 'supplements', Mock: SupplementsMock, reverse: false },
  { key: 'timeline', mockKey: 'timeline', Mock: TimelineMock, reverse: true },
];

/* ─────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────── */
function PricingCard({ data, featured, showBR }) {
  const price = showBR ? data.priceBR : data.priceIntl;
  const annual = showBR ? data.annualBR : data.annualIntl;
  return (
    <article
      className={`relative flex h-full flex-col rounded-[28px] border px-6 py-6 ${
        featured
          ? 'border-[hsl(var(--tint)/0.3)] shadow-[var(--shadow-md),0_0_0_1px_hsl(var(--tint)/0.06)]'
          : 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.84)] shadow-[var(--shadow-xs)]'
      }`}
      style={featured ? { background: 'linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--tint)/0.04) 100%)' } : undefined}
    >
      {featured && data.popular ? (
        <span className="atlas-public-pill absolute right-5 top-5 border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          {data.popular}
        </span>
      ) : null}

      <p className="atlas-overline">{data.name}</p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-[2.4rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{price}</span>
        <span className="pb-1.5 text-[13px] text-[hsl(var(--fg-2))]">{data.period}</span>
      </div>

      {annual ? (
        <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
          {annual.split('—')[0]}—
          <span className="font-semibold text-[hsl(var(--brand))]">{annual.split('—')[1]}</span>
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">{data.annualNote}</p>
      )}

      <div className="my-5 h-px bg-[hsl(var(--border)/0.7)]" />

      <div className="flex-1 space-y-2.5">
        {data.features?.map((f) => (
          <div key={f} className="flex items-start gap-2 text-[13px] leading-5 text-[hsl(var(--fg-2))]">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.1} />
            <span>{f}</span>
          </div>
        ))}
        {data.absent?.map((f) => (
          <div key={f} className="flex items-start gap-2 text-[13px] leading-5 text-[hsl(var(--fg-3))]">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={2} />
            <span className="opacity-50">{f}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => handlePlan(data.id)}
        variant={featured ? 'default' : 'outline'}
        className="mt-6 h-11"
      >
        {data.cta}
      </Button>
    </article>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Landing() {
  const { language } = useTranslation();
  const c = COPY[language] || COPY['en-US'];
  const homeMocks = HOME_MOCK_COPY[language] || HOME_MOCK_COPY['en-US'];
  const showBR = language === 'pt-BR';

  return (
    <PublicSiteShell
      navLinks={[
        { href: '#solution', label: c.nav.howItWorks },
        { href: '#features', label: c.nav.features },
        { href: ROUTES.blog, label: c.nav.blog },
        { href: '#pricing', label: c.nav.pricing },
      ]}
      actions={(
        <>
          <span className="hidden sm:contents"><PublicLanguageSwitcher /></span>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[13px]" onClick={handleLogin}>{c.nav.login}</Button>
          <Button size="sm" onClick={handleSignUp}>{c.nav.signup}</Button>
        </>
      )}
    >
      <PublicMetadata
        title="atlas.core"
        description="atlas.core is the public performance operating system for workouts, nutrition, measurements, supplements, and connected progress."
        canonicalPath={ROUTES.home}
      />

      {/* ══ HERO ══════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <motion.div
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          className="space-y-10"
        >
          {/* Badge */}
          <motion.div variants={fade} custom={0} className="flex items-center gap-2.5">
            <span className="atlas-public-pill border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.06)] text-[hsl(var(--brand))]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--brand))]" />
              {c.hero.badge}
            </span>
          </motion.div>

          {/* Headline + sub + CTAs */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="space-y-8">
              <motion.div variants={fade} custom={1} className="space-y-2">
                <h1 className="atlas-display-title text-[clamp(2.8rem,2rem+2.8vw,5rem)] leading-[1.08]">
                  {c.hero.h1a}
                </h1>
                <h1 className="atlas-display-title text-[clamp(2.8rem,2rem+2.8vw,5rem)] leading-[1.08]">
                  {c.hero.h1b}?
                </h1>
              </motion.div>

              <motion.p variants={fade} custom={2} className="atlas-public-copy max-w-lg text-[1.05rem]">
                {c.hero.sub}
              </motion.p>

              <motion.div variants={fade} custom={3} className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handleSignUp} className="gap-2">
                  {c.hero.cta1}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#features">{c.hero.cta2}</a>
                </Button>
              </motion.div>

              <motion.div variants={fade} custom={4} className="grid grid-cols-3 gap-3">
                {[
                  [c.hero.s1t, c.hero.s1d],
                  [c.hero.s2t, c.hero.s2d],
                  [c.hero.s3t, c.hero.s3d],
                ].map(([strong, sub]) => (
                  <div key={strong} className="atlas-public-panel-muted p-4">
                    <p className="text-[15px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{strong}</p>
                    <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{sub}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div variants={fade} custom={2}>
              <WorkoutMock copy={homeMocks.workout} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══ PROBLEM ══════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-8 max-w-2xl">
            <p className="atlas-overline">{c.problem.label}</p>
            <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
              {c.problem.h2}
            </h2>
            <p className="atlas-public-copy mt-3">{c.problem.sub}</p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {c.problem.items.map((item, i) => (
              <motion.div key={item.t} {...fadeIn(i * 0.06)}>
                <div className="atlas-public-panel-muted flex items-start gap-3 p-4">
                  <span className="text-xl">{item.e}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{item.t}</p>
                    <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{item.d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn(0.2)} className="mt-8 max-w-2xl border-l-[3px] border-[hsl(var(--brand))] pl-5">
            <p className="text-[1.05rem] font-semibold leading-7 text-[hsl(var(--fg))]">{c.problem.quote}</p>
            <p className="mt-3 text-[14px] text-[hsl(var(--fg-2))]">{c.problem.quoteDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* ══ SOLUTION ══════════════════════════════ */}
      <section id="solution" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10 text-center">
          <p className="atlas-overline justify-center">{c.solution.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
            {c.solution.h2a}<br />
            <span className="text-[hsl(var(--brand))]">{c.solution.h2b}</span>
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-xl">{c.solution.sub}</p>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--border)/0.7)] md:grid-cols-3">
          {[
            { t: c.solution.p1t, d: c.solution.p1d, icon: Layers },
            { t: c.solution.p2t, d: c.solution.p2d, icon: TrendingUp },
            { t: c.solution.p3t, d: c.solution.p3d, icon: Zap },
          ].map(({ t, d, icon: Icon }, i) => (
            <motion.div key={t} {...fadeIn(i * 0.08)}>
              <div className="h-full bg-[hsl(var(--card))] px-6 py-7 transition-colors hover:bg-[hsl(var(--fill)/0.5)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[18px] border border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.07)] text-[hsl(var(--brand))]">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <p className="text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{t}</p>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════ */}
      <div id="features">
        {FEATURE_BLOCKS.map(({ key, mockKey, Mock, reverse }) => {
          const f = c.features[key];
          return (
            <section
              key={key}
              className="border-t border-[hsl(var(--border)/0.6)] mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20"
            >
              <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:direction-rtl' : ''}`}>
                {/* Text side */}
                <motion.div
                  {...fadeIn(0)}
                  className={`space-y-6 ${reverse ? 'lg:order-2' : ''}`}
                >
                  <p className="atlas-overline">{f.label}</p>
                  <h2 className="atlas-display-title whitespace-pre-line text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
                    {f.h2}
                  </h2>
                  <p className="atlas-public-copy">{f.desc}</p>
                  <div className="space-y-3.5">
                    {f.pts.map((pt) => <FeaturePoint key={pt.t} t={pt.t} d={pt.d} />)}
                  </div>
                </motion.div>

                {/* Visual side */}
                <motion.div
                  {...fadeIn(0.15)}
                  className={reverse ? 'lg:order-1' : ''}
                >
                  <Mock copy={homeMocks[mockKey]} />
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ══ DIFFERENTIATION ═══════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-10 text-center">
            <p className="atlas-overline justify-center">{c.diff.label}</p>
            <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">{c.diff.h2}</h2>
            <p className="atlas-public-copy mx-auto mt-3 max-w-xl">{c.diff.sub}</p>
          </motion.div>

          {/* Comparison table */}
          <motion.div {...fadeIn(0.1)} className="mb-10 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-[13px]">
              <thead>
                <tr>
                  {c.diff.cols.map((col, i) => (
                    <th
                      key={col}
                      className={`border-b border-[hsl(var(--border)/0.7)] px-4 py-3 text-left font-semibold tracking-wider text-[11px] uppercase ${
                        i === 4 ? 'text-[hsl(var(--brand))] bg-[hsl(var(--tint)/0.04)]' : 'text-[hsl(var(--fg-3))]'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.diff.rows.map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-[hsl(var(--border)/0.5)] transition-colors hover:bg-[hsl(var(--fill)/0.4)]"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-3.5 ${
                          ci === 0 ? 'text-[hsl(var(--fg-2))]' :
                          ci === 4 ? 'font-semibold text-[hsl(var(--brand))] bg-[hsl(var(--tint)/0.03)]' :
                          cell === '—' ? 'text-[hsl(var(--fg-3))] opacity-40' : 'text-[hsl(var(--fg-2))]'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Differentiator cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {c.diff.cards.map((card, i) => (
              <motion.div key={card.t} {...fadeIn(i * 0.07)}>
                <div className="atlas-card h-full px-5 py-5">
                  <span className="text-xl">{card.e}</span>
                  <p className="mt-4 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{card.t}</p>
                  <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{card.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════ */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-4 text-center">
          <p className="atlas-overline justify-center">{c.pricing.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">{c.pricing.h2}</h2>
          <p className="atlas-public-copy mx-auto mt-3 max-w-md">{c.pricing.sub}</p>
        </motion.div>


        {/* Cards */}
        <motion.div {...fadeIn(0.1)} className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          <PricingCard data={c.pricing.free} featured={false} showBR={showBR} />
          <PricingCard data={c.pricing.pro}  featured={true}  showBR={showBR} />
        </motion.div>

        {/* Founder box */}
        <motion.div {...fadeIn(0.15)} className="mx-auto mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[hsl(var(--tint)/0.16)] bg-[hsl(var(--tint)/0.03)] px-6 py-5">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{c.pricing.founder.h3}</p>
              <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">{c.pricing.founder.desc}</p>
            </div>
            <Button onClick={handleSignUp} variant="default" size="sm">{c.pricing.founder.cta}</Button>
          </div>
        </motion.div>
      </section>

      {/* ══ PROFESSIONALS ══════════════════════════ */}
      <section className="mx-auto max-w-6xl border-t border-[hsl(var(--border)/0.6)] px-5 py-14 lg:px-8 lg:py-16">
        <motion.div {...fadeIn(0)} className="mb-8 text-center">
          <p className="atlas-overline justify-center">{c.pros.label}</p>
          <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
            {c.pros.h2}
          </h2>
          <p className="atlas-public-copy mx-auto mt-3 max-w-xl">{c.pros.sub}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {c.pros.cards.map((card, i) => (
            <motion.div key={card.t} {...fadeIn(i * 0.08)}>
              <div className="atlas-card h-full px-6 py-6">
                <span className="text-2xl">{card.e}</span>
                <p className="mt-4 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{card.t}</p>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{card.d}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeIn(0.15)} className="mt-6 text-center text-[13px] text-[hsl(var(--fg-3))]">
          {c.pros.note}
        </motion.p>
      </section>

      {/* ══ CLOSING CTA ═══════════════════════════ */}
      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="atlas-page-header atlas-cta-glow px-6 py-10 text-center lg:px-10 lg:py-14">
          <h2 className="atlas-display-title whitespace-pre-line text-[clamp(2.2rem,1.6rem+1.6vw,3.8rem)] leading-[1.1]">
            {c.closing.h2a}
            <br />
            <span className="text-[hsl(var(--brand))]">{c.closing.h2b}</span>
          </h2>
          <p className="atlas-public-copy mx-auto mt-5 max-w-xl text-[1.05rem]">{c.closing.sub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={handleSignUp} className="gap-2">
              {c.closing.cta1}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>{c.closing.cta2}</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-[hsl(var(--fg-3))]">{c.closing.fine}</p>
        </motion.div>
      </section>

    </PublicSiteShell>
  );
}
