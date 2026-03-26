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
      badge: 'Early Access',
      h1a: 'Track everything.',
      h1b: 'Understand what actually works.',
      sub: 'Your workouts, nutrition, and body metrics — finally in one place. See the patterns that actually change your body.',
      cta1: 'Start free',
      cta2: 'See how it works',
      s1t: 'Everything connected', s1d: 'not scattered across apps',
      s2t: 'See patterns', s2d: 'not just data points',
      s3t: 'Know what works', s3d: 'for your body',
    },
    problem: {
      label: 'The Problem',
      h2: 'You\'re doing everything right.\nBut you don\'t actually know what\'s working.',
      sub: 'Workouts in one app. Nutrition in another. Progress photos lost in your camera roll. When your data is scattered, you\'re flying blind.',
      items: [
        { e: '🏋️', t: 'Workout App', d: 'Track sessions, but no context on results' },
        { e: '🥗', t: 'Food Tracker', d: 'Log meals, never see the impact' },
        { e: '📊', t: 'Spreadsheet', d: 'Measurements you forget to update' },
        { e: '📱', t: 'Notes App', d: 'Plans scattered across random notes' },
        { e: '📸', t: 'Photo Gallery', d: 'Progress photos buried and forgotten' },
        { e: '💬', t: 'Messages', d: 'Coach feedback lost in threads' },
      ],
      quote: 'Data without connection is just noise.',
      quoteDesc: 'Without everything in one place, you\'re guessing. And guessing doesn\'t get you results.',
    },
    solution: {
      label: 'The Solution',
      h2a: 'Everything connected.',
      h2b: 'One view.',
      sub: 'Atlas is a single platform for people who want to understand their progress, not just record it. Training, nutrition, and body metrics — organized, connected, readable.',
      p1t: 'Centralized', p1d: 'Training, nutrition, body metrics — all in one system. When the data lives together, patterns become visible.',
      p2t: 'Connected', p2d: 'The entire product is built around one question: what is actually driving your results?',
      p3t: 'Honest', p3d: 'No gamification. No motivation tricks. Just your data, clearly presented.',
    },
    features: {
      workouts: {
        label: 'Workouts',
        h2: 'Watch your\ntraining compound.',
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
      h2: 'Built around the connection,\nnot the category.',
      sub: 'Every other tool tracks one thing well. Atlas tracks how everything relates.',
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
        features: ['Basic Today', 'Workout and nutrition diary', 'Measurement tracking', 'Basic protocols', 'Profile and settings', 'Limited history (30 days)', 'Weekly insights', 'Social sharing cards'],
        absent: ['Structured plan tools', 'Full lab work', 'Progress photos', 'Advanced analytics', 'PDF/CSV export'],
        cta: 'Get Started Free', id: 'free',
      },
      pro: {
        name: 'Pro', priceIntl: '$9.99', priceBR: 'R$ 29', period: '/month',
        annualIntl: 'Or $79/year — save $40 (33%)', annualBR: 'Or R$249/year — save $40 (33%)',
        popular: 'Most Popular',
        features: [
          'Everything in Free', 'Meal plan tools', 'Workout plan tools', 'Complete meal/workout plans',
          'Full lab work', 'Unlimited progress photos', 'Expanded history (1 year)',
          'Complete analytics', 'Progress insights', 'PDF and CSV export', 'Stock alerts',
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
      h2a: 'Stop guessing.',
      h2b: 'Start seeing.',
      sub: 'Atlas gives you the full picture — what you\'ve done, how it\'s working, and where to keep pushing.',
      cta1: 'Get started free', cta2: 'See plans',
      fine: 'No credit card needed. Free plan available. Cancel anytime.',
    },
  },

  /* ─────────────────────────────────────────
     PT-BR — Performance-focused copy
  ───────────────────────────────────────── */
  'pt-BR': {
    nav: { howItWorks: 'Como funciona', features: 'Recursos', blog: 'Blog', pricing: 'Planos', login: 'Entrar', signup: 'Começar' },
    hero: {
      badge: 'Acesso Antecipado',
      h1a: 'Mensure tudo.',
      h1b: 'Otimize o que importa.',
      sub: 'Treino, nutrição e métricas corporais em um único ecossistema. Pare de adivinhar e comece a identificar os padrões que geram resultados reais.',
      cta1: 'Começar grátis',
      cta2: 'Ver como funciona',
      s1t: 'Ecossistema unificado', s1d: 'sem dados perdidos entre apps',
      s2t: 'Identifique padrões', s2d: 'não apenas números isolados',
      s3t: 'Saiba o que funciona', s3d: 'para a sua biologia',
    },
    problem: {
      label: 'O Problema',
      h2: 'Você treina pesado e come certo.\nMas não sabe exatamente o que está gerando resultado.',
      sub: 'Treinos no bloco de notas. Dieta em um app. Fotos perdidas na galeria. Quando seus dados estão fragmentados, você está operando no escuro.',
      items: [
        { e: '🏋️', t: 'App de Treino', d: 'Registra cargas, mas ignora o impacto no físico' },
        { e: '🥗', t: 'App de Dieta', d: 'Conta macros, mas não cruza com a performance' },
        { e: '📊', t: 'Planilhas', d: 'Métricas estáticas que você esquece de atualizar' },
        { e: '📱', t: 'Bloco de Notas', d: 'Planejamento caótico e sem histórico rastreável' },
        { e: '📸', t: 'Galeria', d: 'Fotos de evolução perdidas entre memes e prints' },
        { e: '💬', t: 'WhatsApp', d: 'Feedback do treinador perdido no histórico' },
      ],
      quote: 'Dados fragmentados são apenas ruído.',
      quoteDesc: 'Sem um sistema centralizado, você depende de intuição. E intuição não constrói físicos de elite.',
    },
    solution: {
      label: 'A Solução',
      h2a: 'Controle total.',
      h2b: 'Uma única interface.',
      sub: 'Atlas é o sistema operacional para quem leva o físico a sério. Treino, nutrição e métricas — estruturados, correlacionados e acionáveis.',
      p1t: 'Centralizado', p1d: 'Cargas, macros e medidas no mesmo ambiente. Quando os dados convergem, a evolução se torna previsível.',
      p2t: 'Correlacionado', p2d: 'O sistema foi desenhado para responder uma única pergunta: qual variável está destravando seus resultados?',
      p3t: 'Direto ao ponto', p3d: 'Sem gamificação infantil. Sem notificações inúteis. Apenas a verdade sobre o seu progresso.',
    },
    features: {
      workouts: {
        label: 'Treinamento',
        h2: 'Sobrecarga progressiva\nsob controle.',
        desc: 'Monitore volume, intensidade e consistência. Saiba exatamente quando você está evoluindo e quando atingiu um platô.',
        pts: [
          { t: 'Banco de exercícios completo', d: ' — ou crie os seus. Musculação, LPO, cardio.' },
          { t: 'Histórico absoluto', d: ' — acesse qualquer sessão que você já realizou.' },
          { t: 'Rastreamento de PRs', d: ' — recordes de carga e repetições atualizados automaticamente.' },
          { t: 'Execução real', d: ' — registre o que você de fato levantou, não apenas o planejado.' },
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
      h2: 'Construído para correlação,\nnão isolamento.',
      sub: 'Outros apps fazem uma coisa bem. O Atlas cruza todas as variáveis para te dar a resposta final.',
      cols: ['Recurso', 'Apps de Treino', 'Apps de Dieta', 'Apps Genéricos', 'Atlas'],
      rows: [
        ['Rastreamento de carga', '✓', '—', 'Básico', '✓ Avançado'],
        ['Macros e calorias', '—', '✓', 'Básico', '✓ Avançado'],
        ['Métricas corporais', '—', '—', 'Básico', '✓ Completo'],
        ['Evolução fotográfica', '—', '—', '—', '✓ Integrado'],
        ['Controle de protocolos', '—', '—', '—', '✓ Completo'],
        ['Timeline cronológica', '—', '—', '—', '✓ Nativo'],
        ['Análise cruzada', '—', '—', '—', '✓ O Core do App'],
      ],
      cards: [
        { e: '🚫', t: 'Sem algoritmos engessados', d: 'O Atlas não dita o seu treino. Ele rastreia a sua execução e expõe a verdade sobre os resultados.' },
        { e: '🚫', t: 'Sem confetes', d: 'Sem ofensivas diárias ou badges virtuais. O único prêmio que importa é a mudança no espelho.' },
        { e: '🚫', t: 'Sem burocracia clínica', d: 'Desenvolvido para quem treina sério. Interface tática, rápida e focada em dados.' },
      ],
    },
    pricing: {
      label: 'Planos',
      h2: 'Sem letras miúdas.',
      sub: 'Comece sem custo. Escale quando precisar de poder analítico total.',
      toggle: { monthly: 'Mensal', yearly: 'Anual' },
      founder: {
        h3: '🔒 Preço de Fundador — Vitalício',
        desc: 'Assine durante o Acesso Antecipado e trave o valor da sua mensalidade para sempre.',
        cta: 'Garantir Preço de Fundador',
      },
    },
    pros: {
      label: 'Para Profissionais',
      h2: 'Feito para o atleta.\nIntegrado com o treinador.',
      sub: 'O Atlas é autossuficiente. Mas se você tem um treinador ou nutricionista, eles podem acessar sua telemetria em tempo real.',
      cards: [
        { e: '🏃', t: 'Treinadores', d: 'Acesse cargas, volume, fotos e medidas dos seus atletas instantaneamente. Fim dos relatórios em planilhas.' },
        { e: '🥦', t: 'Nutricionistas', d: 'Audite a adesão real à dieta cruzada com a variação de peso. Ajuste o plano baseado em dados, não em relatos.' },
      ],
      note: 'A conexão profissional é opcional. O Atlas entrega 100% do seu valor para usuários individuais.',
    },
    closing: {
      h2a: 'Pare de supor.',
      h2b: 'Comece a mensurar.',
      sub: 'O Atlas te entrega a telemetria completa do seu físico — o que foi feito, o impacto gerado e o próximo passo.',
      cta1: 'Começar grátis', cta2: 'Ver planos',
      fine: 'Sem cartão de crédito. Plano gratuito disponível. Cancele com um clique.',
    },
  },
};

/* ─────────────────────────────────────────
   MOCK UI CARDS — data for visual demos
───────────────────────────────────────── */
export const HOME_MOCK_COPY = {
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
