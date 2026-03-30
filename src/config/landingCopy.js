/* ─────────────────────────────────────────
   LANDING PAGE COPY — EN-US & PT-BR
   ─────────────────────────────────────────
   All landing page text lives here.
   Landing.jsx imports from this file.
───────────────────────────────────────── */

export const COPY = {
  'en-US': {
    nav: { howItWorks: 'How it works', features: 'Features', blog: 'Blog', pricing: 'Pricing', login: 'Log In', signup: 'Get Started' },
    hero: {
      badge: 'AI-Powered Training',
      h1a: 'Train smarter with AI.',
      h1b: 'Track what actually works.',
      sub: 'Your AI fitness partner that generates personalized workouts, adapts your training in real-time, and shows you exactly what drives results. Not just tracking—intelligent guidance.',
      cta1: 'Start Free — Get AI Workouts',
      cta2: 'See how it works',
      s1t: 'AI-Generated Workouts', s1d: 'personalized for your goals',
      s2t: 'Adaptive Training', s2d: 'adjusts based on performance',
      s3t: 'Intelligent Insights', s3d: 'know what drives results',
    },
    problem: {
      label: 'The Problem',
      h2: 'You\'re guessing your training.\nWe replace guessing with data + AI.',
      sub: 'Workouts in one app. Nutrition in another. Progress photos lost in your camera roll. No AI to analyze patterns, generate workouts, or tell you what to adjust. You\'re flying blind.',
      items: [
        { e: '🏋️', t: 'Workout App', d: 'Tracks sessions, but no AI to generate or adjust plans' },
        { e: '🥗', t: 'Food Tracker', d: 'Logs meals, never sees the impact on performance' },
        { e: '📊', t: 'Spreadsheet', d: 'Static data without intelligent insights' },
        { e: '📱', t: 'Notes App', d: 'Plans scattered, no AI adaptation' },
        { e: '📸', t: 'Photo Gallery', d: 'Progress photos without intelligent analysis' },
        { e: '💬', t: 'Messages', d: 'Coach feedback without AI-powered recommendations' },
      ],
      quote: 'Data without intelligence is just noise.',
      quoteDesc: 'Without AI to analyze everything together, you\'re guessing. And guessing doesn\'t get you results.',
    },
    solution: {
      label: 'The Solution',
      h2a: 'AI-powered decisions.',
      h2b: 'Built around what works for you.',
      sub: 'Atlas is an intelligent fitness system. AI generates your workouts, adapts your plans based on performance, and tells you exactly what\'s driving results. Training, nutrition, and body metrics—connected, analyzed, and optimized.',
      p1t: 'AI-Generated', p1d: 'Get personalized workouts and plans created by AI based on your goals, history, and preferences.',
      p2t: 'Adaptive Intelligence', p2d: 'The system learns from your performance and automatically adjusts volume, intensity, and exercise selection.',
      p3t: 'Result-Focused', p3d: 'Every insight answers one question: what is actually driving your results? No fluff. Just intelligent guidance.',
    },
    features: {
      workouts: {
        label: 'AI Workouts',
        h2: 'AI generates.\nYou dominate.',
        desc: 'Stop wondering what to train. Our AI creates personalized workouts based on your goals, equipment, and past performance. Adaptive progression that evolves with you.',
        pts: [
          { t: 'AI workout generation', d: '— get today\'s workout generated just for you' },
          { t: 'Smart exercise selection', d: '— AI picks exercises based on your history and goals' },
          { t: 'Adaptive volume & intensity', d: '— auto-adjusts based on your recovery and performance' },
          { t: 'Injury-aware recommendations', d: '— AI adapts when you have limitations' },
        ],
      },
      nutrition: {
        label: 'Nutrition',
        h2: 'Understand what\nyour nutrition does.',
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
        h2: 'See the full picture,\nnot just the number.',
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
        h2: 'Your protocol, organized.\nYour adherence, visible.',
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
        h2: 'Your entire history.\nOne scroll.',
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
      h2: 'Intelligence, not just data.',
      sub: 'Other apps track. Atlas thinks. AI generates workouts, adapts your training, and tells you exactly what to do next.',
      cols: ['Capability', 'Workout Apps', 'Food Trackers', 'Generic Health Apps', 'Atlas'],
      rows: [
        ['Workout tracking', '✓', '—', 'Partial', '✓ Full'],
        ['Nutrition & macros', '—', '✓', 'Partial', '✓ Full'],
        ['Body measurements', '—', '—', 'Basic', '✓ Full'],
        ['Progress photos', '—', '—', '—', '✓ Organized'],
        ['Supplement tracking', '—', '—', '—', '✓ Full'],
        ['Unified timeline', '—', '—', '—', '✓ Everything'],
        ['Cross-metric analysis', '—', '—', '—', '✓ Built-in'],
        ['AI workout generation', '—', '—', '—', '✓ Core Feature'],
        ['Adaptive training', '—', '—', '—', '✓ AI-Powered'],
      ],
      cards: [
        { e: '🤖', t: 'AI-Generated Workouts', d: 'Get personalized training sessions generated by AI based on your goals, equipment, and history. No more guessing what to train.' },
        { e: '🧠', t: 'Adaptive Intelligence', d: 'The system learns from your performance and auto-adjusts volume, intensity, and exercise selection. It gets smarter as you train.' },
        { e: '🎯', t: 'Smart Recommendations', d: 'AI analyzes your data and tells you exactly what to adjust: increase back volume, deload next week, or switch exercises.' },
      ],
    },
    pricing: {
      label: 'Pricing',
      h2: 'AI Training for Everyone.',
      sub: 'Start free with limited AI workouts. Unlock unlimited AI generation and adaptive training when you upgrade.',
      toggle: { intl: 'USD / International', br: 'BRL / Brasil' },
      free: {
        name: 'Starter', priceIntl: '$0', priceBR: 'R$ 0', period: '/month', annualNote: 'Always free. No card required.',
        features: ['Basic Today view', 'Workout & nutrition diary', 'Measurement tracking', 'Basic protocols', 'Profile & settings', '3 AI workouts/week', 'Limited insights'],
        absent: ['Unlimited AI workouts', 'AI plan builder', 'Progress photos', 'Advanced analytics', 'Smart adjustments', 'PDF/CSV export'],
        cta: 'Start Free', id: 'free',
      },
      pro: {
        name: 'AI Training', priceIntl: '$9.99', priceBR: 'R$ 29', period: '/month',
        annualIntl: 'Or $79/year — save $40 (33%)', annualBR: 'Or R$249/year — save $40 (33%)',
        popular: 'Most Popular',
        features: [
          'Everything in Starter', 'Unlimited AI workout generation', 'AI plan builder (1/month)', 'Smart training adjustments',
          'Complete meal/workout plans', 'Full lab work tracking', 'Unlimited progress photos', 'Expanded history (1 year)',
          'AI-powered insights', 'PDF and CSV export',
        ],
        cta: 'Get AI Training — 7 Days Free', id: 'pro_monthly',
      },
      founder: {
        h3: '🔒 Founder Price — AI Training Locked Forever',
        desc: 'Joining during Early Access? Your AI Training plan stays at this price forever — even when we add more AI features.',
        cta: 'Claim Founder AI Access',
      },
    },
    pros: {
      label: 'For Professionals — Coming Soon',
      h2: 'Built for athletes today.\nProfessional tools coming soon.',
      sub: 'atlas.core is built for individual athletes. Professional collaboration — coaches seeing your data, nutritionists reviewing your meals — is in private beta and coming soon.',
      cards: [
        { e: '🏃', t: 'Personal Trainers', d: 'Coming soon — coaches will be able to see clients\' workout logs, progress photos, and measurements in real-time.' },
        { e: '🥦', t: 'Nutritionists', d: 'Coming soon — nutritionists will be able to review food logs alongside body metrics and track real results.' },
      ],
      note: 'Professional collaboration is in private beta. atlas.core works 100% as an individual athlete app today.',
    },
    closing: {
      h2a: 'Stop guessing.',
      h2b: 'Start training smarter.',
      sub: 'Get AI-generated workouts, adaptive training plans, and intelligent insights that show you exactly what works.',
      cta1: 'Start Free — Get AI Workouts', cta2: 'See AI Training plans',
      fine: 'No credit card needed. Start with 3 free AI workouts/week. Cancel anytime.',
    },
  },

  /* ─────────────────────────────────────────
     PT-BR — Performance-focused copy
  ───────────────────────────────────────── */
  'pt-BR': {
    nav: { howItWorks: 'Como funciona', features: 'Recursos', blog: 'Blog', pricing: 'Planos', login: 'Entrar', signup: 'Começar' },
    hero: {
      badge: 'Treino com IA',
      h1a: 'Treine mais inteligente.',
      h1b: 'Rastreie o que realmente funciona.',
      sub: 'Seu parceiro fitness com IA que gera treinos personalizados, adapta seu treino em tempo real e mostra exatamente o que gera resultados. Não é apenas rastreamento — é orientação inteligente.',
      cta1: 'Começar Grátis — Treinos com IA',
      cta2: 'Ver como funciona',
      s1t: 'Treinos com IA', s1d: 'personalizados para seus objetivos',
      s2t: 'Treino Adaptativo', s2d: 'ajusta com base na performance',
      s3t: 'Insights Inteligentes', s3d: 'saiba o que gera resultados',
    },
    problem: {
      label: 'O Problema',
      h2: 'Você está chutando seus treinos.\nNós substituímos o chute por dados + IA.',
      sub: 'Treinos em um app. Dieta em outro. Fotos perdidas na galeria. Sem IA para analisar padrões, gerar treinos ou dizer o que ajustar. Você está operando no escuro.',
      items: [
        { e: '🏋️', t: 'App de Treino', d: 'Registra sessões, mas sem IA para gerar ou ajustar planos' },
        { e: '🥗', t: 'App de Dieta', d: 'Conta macros, mas não cruza com performance' },
        { e: '📊', t: 'Planilhas', d: 'Dados estáticos sem insights inteligentes' },
        { e: '📱', t: 'Bloco de Notas', d: 'Planejamento caótico, sem adaptação de IA' },
        { e: '📸', t: 'Galeria', d: 'Fotos de progresso sem análise inteligente' },
        { e: '💬', t: 'WhatsApp', d: 'Feedback sem recomendações baseadas em IA' },
      ],
      quote: 'Dados sem inteligência são apenas ruído.',
      quoteDesc: 'Sem IA para analisar tudo junto, você depende de intuição. E intuição não constrói resultados.',
    },
    solution: {
      label: 'A Solução',
      h2a: 'Decisões baseadas em IA.',
      h2b: 'Construído para o que funciona pra você.',
      sub: 'Atlas é um sistema fitness inteligente. A IA gera seus treinos, adapta seus planos com base na performance e diz exatamente o que está gerando resultados. Treino, nutrição e métricas — conectados, analisados e otimizados.',
      p1t: 'Gerado por IA', p1d: 'Receba treinos e planos personalizados criados por IA com base em seus objetivos, histórico e preferências.',
      p2t: 'Inteligência Adaptativa', p2d: 'O sistema aprende com sua performance e ajusta automaticamente volume, intensidade e seleção de exercícios.',
      p3t: 'Focado em Resultados', p3d: 'Cada insight responde uma pergunta: o que realmente está gerando seus resultados? Sem enrolação. Apenas orientação inteligente.',
    },
    features: {
      workouts: {
        label: 'Treinos com IA',
        h2: 'IA gera.\nVocê executa.',
        desc: 'Pare de adivinhar o que treinar. Nossa IA cria treinos personalizados com base nos seus objetivos, equipamentos e performance anterior. Progressão adaptativa que evolui com você.',
        pts: [
          { t: 'Geração de treinos com IA', d: ' — receba o treino de hoje gerado especialmente para você' },
          { t: 'Seleção inteligente de exercícios', d: ' — a IA escolhe exercícios com base no seu histórico e objetivos' },
          { t: 'Volume e intensidade adaptativos', d: ' — ajusta automaticamente com base na sua recuperação e performance' },
          { t: 'Recomendações seguras', d: ' — a IA se adapta quando você tem limitações ou lesões' },
        ],
      },
      nutrition: {
        label: 'Nutrição',
        h2: 'O impacto real\ndos seus macros.',
        desc: 'Vá além da contagem de calorias. Entenda como sua ingestão calórica dita sua performance no treino e sua composição corporal.',
        pts: [
          { t: 'Registro de alta velocidade', d: ' — refeições e macros sem atrito na interface.' },
          { t: 'Adesão semanal', d: ' — visualize sua consistência e desvios do planejamento.' },
          { t: 'Correlação de resultados', d: ' — cruze a dieta com as variações de peso e força.' },
          { t: 'Foco em performance', d: ' — desenhado para precisão metabólica, não restrição cega.' },
        ],
      },
      progress: {
        label: 'Métricas Corporais',
        h2: 'O quadro completo,\nalém da balança.',
        desc: 'O peso mente. Atlas rastreia as variáveis que importam — dobras cutâneas, circunferências e tendências reais — para você não ser enganado pela retenção hídrica.',
        pts: [
          { t: 'Média móvel de peso', d: ' — elimine o ruído das flutuações diárias.' },
          { t: 'Mapeamento completo', d: ' — cintura, braços, pernas e percentual de gordura.' },
          { t: 'Deltas de evolução', d: ' — compare qualquer período e veja a variação exata.' },
          { t: 'Detecção de estagnação', d: ' — saiba imediatamente se o cutting ou bulking travou.' },
        ],
      },
      photos: {
        label: 'Evolução Visual',
        h2: 'A prova irrefutável\ndo seu progresso.',
        desc: 'A fita métrica tem margem de erro. O espelho não. Mantenha um registro visual blindado e organizado do seu físico.',
        pts: [
          { t: 'Timeline visual', d: ' — fotos categorizadas por data, sem poluir sua galeria.' },
          { t: 'Comparação lado a lado', d: ' — contraste qualquer check-in para ver a mudança real.' },
          { t: 'Privacidade absoluta', d: ' — seus dados visuais são criptografados e apenas seus.' },
          { t: 'Contexto de dados', d: ' — cada foto exibe o peso e as medidas daquele exato dia.' },
        ],
      },
      supplements: {
        label: 'Ergogênicos e Protocolos',
        h2: 'Seu stack organizado.\nSua adesão rastreada.',
        desc: 'De creatina a protocolos avançados. Mantenha o controle exato do que entra no seu corpo e quando.',
        pts: [
          { t: 'Checklist de dosagem', d: ' — registre a administração diária com um toque.' },
          { t: 'Stacks customizáveis', d: ' — separe por horários: pré-treino, intra, noturno.' },
          { t: 'Métrica de consistência', d: ' — visualize sua taxa de adesão nos últimos 30 dias.' },
          { t: 'Sem julgamentos', d: ' — o sistema rastreia o que você mandar. A biologia é sua.' },
        ],
      },
      timeline: {
        label: 'Timeline Unificada',
        h2: 'Seu histórico atlético.\nEm uma tela.',
        desc: 'Treinos, check-ins, fotos e alterações de protocolo. Tudo consolidado em um fluxo cronológico absoluto.',
        pts: [
          { t: 'Registro passivo', d: ' — cada ação no app alimenta automaticamente sua timeline.' },
          { t: 'Engenharia reversa', d: ' — veja o que você estava fazendo na semana do seu melhor shape.' },
          { t: 'Auditoria mensal', d: ' — resumos automáticos do que foi executado no mês.' },
          { t: 'Memória permanente', d: ' — volte anos no tempo. Seus dados de performance não expiram.' },
        ],
      },
    },
    diff: {
      label: 'O Diferencial',
      h2: 'Inteligência, não apenas dados.',
      sub: 'Outros apps rastreiam. O Atlas pensa. IA gera treinos, adapta seu treinamento e diz exatamente o que fazer em seguida.',
      cols: ['Recurso', 'Apps de Treino', 'Apps de Dieta', 'Apps Genéricos', 'Atlas'],
      rows: [
        ['Rastreamento de carga', '✓', '—', 'Básico', '✓ Avançado'],
        ['Macros e calorias', '—', '✓', 'Básico', '✓ Avançado'],
        ['Métricas corporais', '—', '—', 'Básico', '✓ Completo'],
        ['Evolução fotográfica', '—', '—', '—', '✓ Integrado'],
        ['Controle de protocolos', '—', '—', '—', '✓ Completo'],
        ['Timeline cronológica', '—', '—', '—', '✓ Nativo'],
        ['Análise cruzada', '—', '—', '—', '✓ O Core do App'],
        ['Geração de treinos com IA', '—', '—', '—', '✓ Funcionalidade Principal'],
        ['Treino adaptativo', '—', '—', '—', '✓ Com IA'],
      ],
      cards: [
        { e: '🤖', t: 'Treinos Gerados por IA', d: 'Receba sessões de treino personalizadas geradas por IA com base em seus objetivos, equipamentos e histórico. Chega de adivinhar o que treinar.' },
        { e: '🧠', t: 'Inteligência Adaptativa', d: 'O sistema aprende com sua performance e ajusta automaticamente volume, intensidade e seleção de exercícios. Fica mais inteligente à medida que você treina.' },
        { e: '🎯', t: 'Recomendações Inteligentes', d: 'A IA analisa seus dados e diz exatamente o que ajustar: aumentar volume de costas, fazer deload na próxima semana ou trocar exercícios.' },
      ],
    },
    pricing: {
      label: 'Planos',
      h2: 'Treino com IA para todos.',
      sub: 'Comece grátis com treinos de IA limitados. Desbloqueie geração ilimitada de IA e treino adaptativo ao fazer upgrade.',
      toggle: { monthly: 'Mensal', yearly: 'Anual' },
      founder: {
        h3: '🔒 Preço de Fundador — Acesso com IA Vitalício',
        desc: 'Assine durante o Acesso Antecipado e trave seu preço para sempre — mesmo quando adicionarmos mais recursos de IA.',
        cta: 'Garantir Acesso com IA de Fundador',
      },
    },
    pros: {
      label: 'Para Profissionais — Em Breve',
      h2: 'Feito para atletas hoje.\nFerramentas profissionais em breve.',
      sub: 'O Atlas é feito para atletas individuais. Colaboração profissional — treinadores vendo seus dados, nutricionistas revisando suas refeições — está em beta privado e chegando em breve.',
      cards: [
        { e: '🏃', t: 'Treinadores', d: 'Em breve — treinadores poderão acessar treinos, fotos e medidas dos seus atletas em tempo real.' },
        { e: '🥦', t: 'Nutricionistas', d: 'Em breve — nutricionistas poderão auditar a adesão real à dieta cruzada com a variação de peso e treinos.' },
      ],
      note: 'A conexão profissional está em beta privado. O Atlas funciona 100% como app individual para atletas hoje.',
    },
    closing: {
      h2a: 'Pare de chutar.',
      h2b: 'Comece a treinar com inteligência.',
      sub: 'Receba treinos gerados por IA, planos de treino adaptativos e insights inteligentes que mostram exatamente o que funciona.',
      cta1: 'Começar Grátis — Treinos com IA', cta2: 'Ver planos com IA',
      fine: 'Sem cartão de crédito. Comece com 3 treinos de IA gratuitos por semana. Cancele quando quiser.',
    },
  },
};

/* ─────────────────────────────────────────
   MOCK UI CARDS — data for visual demos
───────────────────────────────────────── */
export const HOME_MOCK_COPY = {
  'pt-BR': {
    workout: {
      overline: 'Treino de hoje',
      exerciseName: 'supino reto',
      weight: '102.5 kg',
      progress: '⬆ +2.5 kg desde a última sessão · PR',
      bars: [
        { label: 'Volume', pct: 82, val: '+18%' },
        { label: 'Frequência', pct: 65, val: '3x/sem' },
        { label: 'Consistência', pct: 91, val: '91%' },
      ],
      tags: ['Push A', 'Superior', 'Semana 6'],
    },
    nutrition: {
      overline: 'Nutrição de hoje',
      metricLabel: 'Calorias',
      metricValue: '2.340',
      metricMeta: 'Meta: 2.500 · 94% do objetivo',
      bars: [
        { label: 'Proteína', pct: 88, val: '176g' },
        { label: 'Carbos', pct: 72, val: '248g' },
        { label: 'Gordura', pct: 54, val: '62g' },
      ],
      summaryLabel: 'Média de 7 dias',
      summaryText: 'Proteína média: 168g · 3 dias abaixo da meta',
    },
    progress: {
      overline: 'Evolução corporal',
      cards: [
        { label: 'Peso', value: '84.2 kg', trend: '▼ −3.8 kg / 8 sem' },
        { label: 'Gordura corporal', value: '17.4%', trend: '▼ −2.1% / 8 sem' },
      ],
      bars: [
        { label: 'Cintura', pct: 60, val: '−3 cm', accent: true },
        { label: 'Braço', pct: 75, val: '+1.5 cm' },
        { label: 'Peitoral', pct: 68, val: '+2 cm' },
      ],
    },
    photos: {
      overline: 'Evolução visual',
      items: [
        ['01 Jan', '#1a1a2e'],
        ['15 Fev', '#1e2a1e'],
        ['19 Mar', '#2a1e1e'],
      ],
      summaryTitle: '📸 12 semanas de progresso',
      summaryText: 'Compare duas datas. A diferença que você não percebe no dia a dia.',
    },
    supplements: {
      overline: 'Protocolo de hoje',
      items: [
        { icon: '💊', name: 'Creatina', dose: '5g · Manhã', done: true },
        { icon: '🌿', name: 'Vitamina D3', dose: '5000 UI · Manhã', done: true },
        { icon: '🔥', name: 'Pré-treino', dose: '1 dose · Pré-treino', done: true },
        { icon: '🌙', name: 'Magnésio', dose: '400mg · Noite', done: false },
      ],
      summaryLabel: 'Adesão 30 dias',
      summaryValue: '87%',
      summarySuffix: 'consistência',
    },
    timeline: {
      overline: 'Sua timeline',
      items: [
        { date: 'Hoje · 19 Mar', label: 'Novo PR — agachamento 140 kg', detail: 'Treino registrado · 4 exercícios', active: true },
        { date: '17 Mar', label: 'Check-in — 84.2 kg', detail: 'Gordura corporal: 17.4% · Foto de progresso', active: false },
        { date: '15 Mar', label: 'Protocolo atualizado', detail: 'Adicionado ômega-3 · 3g diários', active: false },
        { date: '12 Mar', label: 'Nutrição — melhor semana', detail: 'Proteína média: 182g · 7/7 dias', active: false },
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
