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
      h1: 'Stop guessing. Run your body like a system.',
      sub: 'atlas.core tracks your body, interprets your current state, and gives you exact next actions across nutrition, training, recovery, and protocols.',
      cta1: 'Get early access',
      cta2: 'See how it works',
    },
    loop: {
      label: 'How it works',
      h2: 'One loop. Complete clarity.',
      sub: 'atlas.core replaces scattered tracking with a single adaptive system that tells you what to do next.',
      steps: [
        { title: 'Detect', desc: 'See where you are right now — weight, macros, training load, recovery, protocols.' },
        { title: 'Interpret', desc: 'Know instantly if you\'re on track, drifting, or stalling.' },
        { title: 'Decide', desc: 'Get your next best action — no guesswork, no second-guessing.' },
        { title: 'Execute', desc: 'Log fast. Meals, workouts, protocols — all in one place.' },
        { title: 'Adapt', desc: 'Plans and recommendations evolve automatically as you progress.' },
      ],
    },
    diff: {
      label: 'Why atlas.core',
      h2: 'Not another tracking app.',
      pillars: [
        { title: 'Simple on the surface', desc: 'Fast logging, clear daily view, zero friction. You open it, you know what to do.' },
        { title: 'Intelligent underneath', desc: 'Predictions, cause-effect analysis, and recommendations that actually make sense.' },
        { title: 'Built for execution', desc: 'Not just data and charts — exact next actions you can act on today.' },
        { title: 'Adaptive system', desc: 'Your plan evolves with your body. Targets adjust as you progress.' },
        { title: 'One system, not five apps', desc: 'Nutrition, training, recovery, progress, and protocols — one loop, one source of truth.' },
      ],
    },
    proof: {
      label: 'Inside the app',
      h2: 'Real utility. Not feature marketing.',
      cards: [
        { title: 'Today view', desc: 'Know if you\'re on track before you do anything.', tag: 'Core' },
        { title: 'Next best action', desc: 'One clear recommendation based on your current state.', tag: 'Intelligence' },
        { title: 'Nutrition logging', desc: 'Fast meal logging with macro tracking and AI analysis.', tag: 'Nutrition' },
        { title: 'Training & progress', desc: 'Workout logs connected to body metrics and trends.', tag: 'Training' },
        { title: 'Protocols & recovery', desc: 'Track supplements, sleep, and recovery protocols.', tag: 'Recovery' },
        { title: 'Trend detection', desc: 'See what\'s working and what needs to change — automatically.', tag: 'Insights' },
      ],
    },
    outcomes: {
      label: 'What changes',
      h2: 'Use it consistently. See the difference.',
      items: [
        'Less guesswork, more clarity',
        'Better adherence to nutrition and training',
        'Faster body composition progress',
        'Smarter daily decisions',
        'Full control over training, nutrition, recovery, and protocols',
      ],
    },
    trust: {
      label: 'Built by someone who uses it',
      h2: 'This is not a venture-backed experiment.',
      text: 'atlas.core was built by an athlete and engineer who needed a system that actually worked — not another app that tracks calories and calls it a day. Every feature exists because it solves a real problem in the daily loop of body optimization.',
    },
    cta: {
      h2: 'Start using a system that tells you what to do next.',
      sub: 'Join the beta and be first to experience atlas.core.',
      cta1: 'Get early access',
      fine: 'Free during beta. No credit card required.',
    },
    form: {
      heading: 'Get early access',
      sub: 'Join the beta. We\'ll reach out as atlas.core opens.',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@email.com',
      goal: 'Primary goal',
      goalPlaceholder: 'Select your main goal',
      goalOptions: [
        { value: 'fat_loss', label: 'Fat loss' },
        { value: 'muscle_gain', label: 'Muscle gain' },
        { value: 'performance', label: 'Performance' },
        { value: 'recovery', label: 'Recovery' },
        { value: 'hormone_protocol', label: 'Hormone / protocol tracking' },
        { value: 'optimization', label: 'Overall optimization' },
      ],
      improving: 'What are you trying to improve most right now?',
      improvingPlaceholder: 'e.g. body composition, energy, strength...',
      currentTools: 'What do you currently use?',
      currentToolsOptions: [
        { value: 'mfp', label: 'MyFitnessPal' },
        { value: 'workout_app', label: 'Workout app' },
        { value: 'notes', label: 'Notes' },
        { value: 'spreadsheet', label: 'Spreadsheet' },
        { value: 'multiple', label: 'Multiple apps' },
        { value: 'nothing', label: 'Nothing consistent' },
      ],
      interest: 'Interest',
      interestOptions: [
        { value: 'beta', label: 'Beta access' },
        { value: 'paid', label: 'Early paid access' },
        { value: 'both', label: 'Both' },
      ],
      submit: 'Request access',
      successHeading: 'You\'re in.',
      successText: 'We\'ll reach out as atlas.core opens early access.',
    },
  },

  /* ─────────────────────────────────────────
     PT-BR
  ───────────────────────────────────────── */
  'pt-BR': {
    nav: { howItWorks: 'Como funciona', features: 'Recursos', blog: 'Blog', pricing: 'Planos', login: 'Entrar', signup: 'Começar' },
    hero: {
      h1: 'Pare de chutar. Gerencie seu corpo como um sistema.',
      sub: 'atlas.core rastreia seu corpo, interpreta seu estado atual e entrega ações exatas para nutrição, treino, recuperação e protocolos.',
      cta1: 'Acesso antecipado',
      cta2: 'Veja como funciona',
    },
    loop: {
      label: 'Como funciona',
      h2: 'Um loop. Clareza total.',
      sub: 'atlas.core substitui rastreamento disperso por um sistema adaptativo único que diz o que fazer em seguida.',
      steps: [
        { title: 'Detectar', desc: 'Veja onde você está agora — peso, macros, carga de treino, recuperação, protocolos.' },
        { title: 'Interpretar', desc: 'Saiba na hora se você está no rumo, desviando ou estagnado.' },
        { title: 'Decidir', desc: 'Receba sua próxima melhor ação — sem achismo, sem insegurança.' },
        { title: 'Executar', desc: 'Registre rápido. Refeições, treinos, protocolos — tudo em um lugar.' },
        { title: 'Adaptar', desc: 'Planos e recomendações evoluem automaticamente conforme você progride.' },
      ],
    },
    diff: {
      label: 'Por que atlas.core',
      h2: 'Não é mais um app de rastreamento.',
      pillars: [
        { title: 'Simples na superfície', desc: 'Registro rápido, visão diária clara, zero atrito. Você abre e sabe o que fazer.' },
        { title: 'Inteligente por dentro', desc: 'Previsões, análise causa-efeito e recomendações que realmente fazem sentido.' },
        { title: 'Feito para execução', desc: 'Não são apenas dados e gráficos — ações exatas para agir hoje.' },
        { title: 'Sistema adaptativo', desc: 'Seu plano evolui com seu corpo. As metas se ajustam conforme você progride.' },
        { title: 'Um sistema, não cinco apps', desc: 'Nutrição, treino, recuperação, progresso e protocolos — um loop, uma fonte de verdade.' },
      ],
    },
    proof: {
      label: 'Dentro do app',
      h2: 'Utilidade real. Não marketing de features.',
      cards: [
        { title: 'Visão de hoje', desc: 'Saiba se você está no rumo antes de fazer qualquer coisa.', tag: 'Core' },
        { title: 'Próxima melhor ação', desc: 'Uma recomendação clara baseada no seu estado atual.', tag: 'Inteligência' },
        { title: 'Registro nutricional', desc: 'Registro rápido de refeições com macros e análise por IA.', tag: 'Nutrição' },
        { title: 'Treino & progresso', desc: 'Registros de treino conectados a métricas e tendências corporais.', tag: 'Treino' },
        { title: 'Protocolos & recuperação', desc: 'Rastreie suplementos, sono e protocolos de recuperação.', tag: 'Recuperação' },
        { title: 'Detecção de tendências', desc: 'Veja o que está funcionando e o que precisa mudar — automaticamente.', tag: 'Insights' },
      ],
    },
    outcomes: {
      label: 'O que muda',
      h2: 'Use com consistência. Veja a diferença.',
      items: [
        'Menos achismo, mais clareza',
        'Melhor adesão à nutrição e treino',
        'Progresso de composição corporal mais rápido',
        'Decisões diárias mais inteligentes',
        'Controle total sobre treino, nutrição, recuperação e protocolos',
      ],
    },
    trust: {
      label: 'Feito por quem usa',
      h2: 'Isso não é um experimento de startup.',
      text: 'atlas.core foi construído por um atleta e engenheiro que precisava de um sistema que realmente funcionasse — não mais um app que conta calorias e para por aí. Cada feature existe porque resolve um problema real no loop diário de otimização corporal.',
    },
    cta: {
      h2: 'Comece a usar um sistema que diz o que fazer em seguida.',
      sub: 'Entre na beta e seja o primeiro a experimentar atlas.core.',
      cta1: 'Acesso antecipado',
      fine: 'Gratuito durante a beta. Sem cartão de crédito.',
    },
    form: {
      heading: 'Acesso antecipado',
      sub: 'Entre na beta. Entraremos em contato quando atlas.core abrir.',
      name: 'Nome',
      namePlaceholder: 'Seu nome',
      email: 'Email',
      emailPlaceholder: 'voce@email.com',
      goal: 'Objetivo principal',
      goalPlaceholder: 'Selecione seu objetivo',
      goalOptions: [
        { value: 'fat_loss', label: 'Perda de gordura' },
        { value: 'muscle_gain', label: 'Ganho muscular' },
        { value: 'performance', label: 'Performance' },
        { value: 'recovery', label: 'Recuperação' },
        { value: 'hormone_protocol', label: 'Hormônios / protocolos' },
        { value: 'optimization', label: 'Otimização geral' },
      ],
      improving: 'O que você mais quer melhorar agora?',
      improvingPlaceholder: 'ex: composição corporal, energia, força...',
      currentTools: 'O que você usa hoje?',
      currentToolsOptions: [
        { value: 'mfp', label: 'MyFitnessPal' },
        { value: 'workout_app', label: 'App de treino' },
        { value: 'notes', label: 'Notas' },
        { value: 'spreadsheet', label: 'Planilha' },
        { value: 'multiple', label: 'Vários apps' },
        { value: 'nothing', label: 'Nada consistente' },
      ],
      interest: 'Interesse',
      interestOptions: [
        { value: 'beta', label: 'Acesso beta' },
        { value: 'paid', label: 'Acesso pago antecipado' },
        { value: 'both', label: 'Ambos' },
      ],
      submit: 'Solicitar acesso',
      successHeading: 'Você está dentro.',
      successText: 'Entraremos em contato quando atlas.core abrir o acesso antecipado.',
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
