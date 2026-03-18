import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/routes';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight, Check, ArrowRight,
  Dumbbell, UtensilsCrossed, FlaskConical, BarChart3,
  Brain, Package, AlertCircle, CheckCircle, Zap,
  Users, User, Stethoscope, X, TrendingUp, Globe, ChevronDown,
} from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }),
};

const handleSignUp = () => window.location.href = `${ROUTES.auth}?mode=signup`;
const handleLogin = () => window.location.href = `${ROUTES.auth}?mode=login`;

const handlePlanClick = (planId) => {
  if (planId === 'free' || !planId) {
    window.location.href = `${ROUTES.auth}?mode=signup`;
    return;
  }
  if (window.self !== window.top) {
    alert('O checkout só funciona no app publicado. Acesse a URL pública para assinar.');
    return;
  }
  sessionStorage.setItem('pending_plan', planId);
  window.location.href = `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.pricing)}`;
};

// ── Mock "Today" screen card ──
function TodayMock() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Shadow */}
      <div className="absolute -inset-3 bg-gradient-to-b from-[#3B82F6]/20 to-transparent rounded-3xl blur-3xl pointer-events-none" />

      {/* Light mode card */}
      <div className="relative rounded-2xl border border-[#111827]/[0.08] bg-white overflow-hidden shadow-xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#111827]/[0.08] bg-gradient-to-r from-[#FBFCFE] to-white">
          <div>
            <p className="text-[10px] text-[#98A2B3] mb-0.5">{t('landing.mock.date')}</p>
            <p className="text-[13px] font-semibold text-[#111827]">{t('landing.mock.greeting')}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#7C6CF2]/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-[#7C6CF2]" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {/* Action needed */}
          <div className="rounded-xl bg-[#EEF2F7]/50 border border-[#111827]/[0.08] p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#667085] mb-2">{t('landing.mock.actionNeeded')}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#DC2626]/[0.08] border border-[#DC2626]/[0.15]">
                <AlertCircle className="w-3 h-3 text-[#DC2626] shrink-0" strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[#111827]">{t('landing.mock.workoutTitle')}</p>
                  <p className="text-[9px] text-[#667085]">{t('landing.mock.workoutMeta')}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-[#667085]/40 shrink-0" />
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.15]">
                <Package className="w-3 h-3 text-[#F59E0B] shrink-0" strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[#111827]">{t('landing.mock.stockTitle')}</p>
                  <p className="text-[9px] text-[#667085]">{t('landing.mock.stockMeta')}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-[#667085]/40 shrink-0" />
              </div>
            </div>
          </div>

          {/* Nutrition + Workout row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gradient-to-br from-[#FBFCFE] to-white border border-[#111827]/[0.08] p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#667085] mb-1.5">{t('landing.mock.nutrition')}</p>
              <p className="text-[18px] font-bold text-[#111827] leading-none">1.620</p>
              <p className="text-[9px] text-[#667085] mb-2">/ 2.200 kcal</p>
              <div className="h-1 rounded-full bg-[#111827]/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-[#3B82F6] w-[74%]" />
              </div>
              <div className="flex gap-2 mt-2 text-[8px] text-[#667085]">
                <span>P <b className="text-[#111827] font-semibold">138g</b></span>
                <span>C <b className="text-[#111827] font-semibold">220g</b></span>
                <span>G <b className="text-[#111827] font-semibold">48g</b></span>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#FBFCFE] to-white border border-[#111827]/[0.08] p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#667085] mb-1.5">{t('landing.mock.training')}</p>
              <p className="text-[13px] font-semibold text-[#111827] leading-tight">{t('landing.mock.trainingTitle')}</p>
              <p className="text-[9px] text-[#667085] mb-2">{t('landing.mock.trainingSubtitle')}</p>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#B45309] text-[8px] font-medium border border-[#F59E0B]/20">
                {t('landing.mock.pending')}
              </span>
            </div>
          </div>

          {/* Adherence */}
          <div className="rounded-xl bg-gradient-to-br from-[#FBFCFE] to-white border border-[#111827]/[0.08] p-3 flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <svg width="40" height="40" className="-rotate-90">
                <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(17, 24, 39, 0.08)" strokeWidth="3" />
                <circle cx="20" cy="20" r="14" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={88} strokeDashoffset={88 * 0.22} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#111827]">78</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#111827]">{t('landing.mock.adherenceTitle')}</p>
              <p className="text-[9px] text-[#667085]">{t('landing.mock.adherenceSubtitle')}</p>
            </div>
          </div>

          {/* AI insight */}
          <div className="rounded-xl bg-[#7C6CF2]/[0.06] border border-[#7C6CF2]/[0.15] p-3 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#7C6CF2]/[0.12] flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-3 h-3 text-[#7C6CF2]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#7C6CF2] mb-0.5">{t('landing.mock.aiLabel')}</p>
              <p className="text-[10px] text-[#667085] leading-relaxed">{t('landing.mock.aiInsight')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dinâmic content from translations — no hardcoding
const getContent = (t) => ({
  chaos: [
    { icon: Dumbbell, label: t('landing.problem.items.workout'), where: t('landing.problem.items.workoutWhere') },
    { icon: UtensilsCrossed, label: t('landing.problem.items.diet'), where: t('landing.problem.items.dietWhere') },
    { icon: FlaskConical, label: t('landing.problem.items.labs'), where: t('landing.problem.items.labsWhere') },
    { icon: BarChart3, label: t('landing.problem.items.measurements'), where: t('landing.problem.items.measurementsWhere') },
    { icon: Package, label: t('landing.problem.items.protocols'), where: t('landing.problem.items.protocolsWhere') },
    { icon: Brain, label: t('landing.problem.items.history'), where: t('landing.problem.items.historyWhere') },
  ],
  gains: [
    { icon: CheckCircle, key: 'dashboard' },
    { icon: BarChart3, key: 'data' },
    { icon: Zap, key: 'score' },
    { icon: TrendingUp, key: 'trends' },
    { icon: Brain, key: 'ai' },
    { icon: Users, key: 'team' },
  ].map(g => ({ icon: g.icon, title: t(`landing.solution.gains.${g.key}.title`), desc: t(`landing.solution.gains.${g.key}.desc`) })),
  forWho: [
    { key: 'athlete', icon: User },
    { key: 'coach', icon: Users },
    { key: 'nutritionist', icon: Users },
    { key: 'clinician', icon: Stethoscope },
  ].map(w => ({
    icon: w.icon,
    title: t(`landing.forWho.${w.key}.title`),
    desc: t(`landing.forWho.${w.key}.desc`),
    items: t(`landing.forWho.${w.key}.features`),
  })),
  system: t('landing.system.items'),
  faq: t('landing.faq.items'),
});

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const { t, language, setLanguage } = useTranslation();
  const currentLanguageLabel = language === 'pt-BR' ? 'PT' : 'EN';

  const content = getContent(t);
  const CHAOS_ITEMS = content.chaos;
  const GAINS = content.gains;
  const FOR_WHO = content.forWho;

  const PLANS = t('landing.pricing.plans');

  const FAQ = t('landing.faq.items');

  useEffect(() => {
    window.addEventListener('languageChanged', () => window.location.reload());
    return () => window.removeEventListener('languageChanged', () => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1D1D1D] overflow-x-hidden" style={{ colorScheme: 'light' }}>

      {/* ── Nav (iOS style) ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#D5D5D7]"
        style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-5 py-3 md:h-14 md:py-0 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center justify-between md:justify-start gap-2.5 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <AtlasCoreLogoSVG width={24} height={24} />
              <span className="text-[15px] md:text-[16px] font-semibold tracking-tight text-[#1D1D1D] truncate">Atlas Core</span>
            </div>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('language')}
                    className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-2.5 text-[12px] font-medium text-[#1D1D1D] shadow-[0_6px_20px_rgba(17,24,39,0.06)] backdrop-blur-xl transition-all"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#6E6E73]" strokeWidth={1.9} />
                    <span>{currentLanguageLabel}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#86868B]" strokeWidth={1.9} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-44 rounded-2xl border border-white/70 bg-white/82 p-1.5 text-[#1D1D1D] shadow-[0_18px_50px_rgba(17,24,39,0.14)] backdrop-blur-2xl"
                >
                  <DropdownMenuItem
                    onClick={() => setLanguage('pt-BR')}
                    className={`rounded-xl px-3 py-2 text-[13px] ${language === 'pt-BR' ? 'bg-[#F5F5F7] text-[#1D1D1D]' : 'text-[#3A3A3C]'}`}
                  >
                    <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span>Português</span>
                      <span className="text-[12px] text-[#86868B]">PT</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage('en-US')}
                    className={`rounded-xl px-3 py-2 text-[13px] ${language === 'en-US' ? 'bg-[#F5F5F7] text-[#1D1D1D]' : 'text-[#3A3A3C]'}`}
                  >
                    <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span>English</span>
                      <span className="text-[12px] text-[#86868B]">EN</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[15px]">
            {[['#solution', t('landing.nav.howItWorks')], ['#pricing', t('landing.nav.pricing')], ['#faq', t('landing.nav.faq')]].map(([href, label]) => (
              <a key={href} href={href} className="text-[#86868B] hover:text-[#1D1D1D] transition-colors font-medium">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('language')}
                  className="group inline-flex h-9 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 text-[13px] font-medium text-[#1D1D1D] shadow-[0_6px_20px_rgba(17,24,39,0.06)] backdrop-blur-xl transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <Globe className="h-3.5 w-3.5 text-[#6E6E73] transition-colors group-hover:text-[#1D1D1D]" strokeWidth={1.9} />
                  <span>{currentLanguageLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#86868B]" strokeWidth={1.9} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-44 rounded-2xl border border-white/70 bg-white/82 p-1.5 text-[#1D1D1D] shadow-[0_18px_50px_rgba(17,24,39,0.14)] backdrop-blur-2xl"
              >
                <DropdownMenuItem
                  onClick={() => setLanguage('pt-BR')}
                  className={`rounded-xl px-3 py-2 text-[13px] ${language === 'pt-BR' ? 'bg-[#F5F5F7] text-[#1D1D1D]' : 'text-[#3A3A3C]'}`}
                >
                  <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span>Português</span>
                    <span className="text-[12px] text-[#86868B]">PT</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('en-US')}
                  className={`rounded-xl px-3 py-2 text-[13px] ${language === 'en-US' ? 'bg-[#F5F5F7] text-[#1D1D1D]' : 'text-[#3A3A3C]'}`}
                >
                  <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span>English</span>
                    <span className="text-[12px] text-[#86868B]">EN</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            <button onClick={handleLogin} className="flex-1 md:flex-none h-9 px-0 md:px-4 text-[14px] md:text-[15px] text-[#3B82F6] hover:text-[#2563EB] transition-colors font-semibold">
              {t('landing.nav.login')}
            </button>
            <button onClick={handleSignUp} className="flex-1 md:flex-none h-10 px-4 md:px-5 bg-[#3B82F6] text-white text-[14px] md:text-[15px] font-semibold rounded-full md:rounded-lg hover:bg-[#2563EB] transition-colors">
              {t('landing.nav.signup')}
            </button>
          </div>
        </div>
      </nav>

      {/* ══ 1. HERO ══ */}
      <section className="relative pt-40 md:pt-32 pb-12 md:pb-16 px-4 md:px-5 min-h-[100vh] flex flex-col items-center justify-start md:justify-center overflow-hidden">
        {/* Minimal background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-40 right-0 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 60%)' }} />
        </div>

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="relative text-center max-w-4xl mx-auto">

          <motion.div variants={fade} custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D5D5D7] text-[#3B82F6] text-[12px] md:text-[13px] mb-5 md:mb-8 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            {t('landing.hero.badge')}
          </motion.div>

          <motion.h1 variants={fade} custom={1}
            className="text-[40px] sm:text-[44px] md:text-[64px] font-bold tracking-[-1.6px] md:tracking-[-1px] leading-[0.98] md:leading-[1.1] mb-5 md:mb-6 text-[#1D1D1D] whitespace-pre-line max-w-[10ch] md:max-w-none mx-auto">
            {t('landing.hero.title')}
          </motion.h1>

          <motion.p variants={fade} custom={2}
            className="text-[18px] md:text-[17px] text-[#86868B] leading-[1.45] md:leading-relaxed mb-8 md:mb-10 max-w-[18.5rem] sm:max-w-[28rem] md:max-w-2xl mx-auto font-normal">
            {t('landing.hero.subtitle')}
          </motion.p>

          {/* 3 simple truths */}
          <motion.div variants={fade} custom={3}
            className="grid grid-cols-1 sm:flex items-start sm:items-center justify-center gap-3 md:gap-4 text-[14px] md:text-[13px] text-[#86868B] mb-8 md:mb-12 max-w-[18rem] sm:max-w-none mx-auto text-left sm:text-center">
            {[t('landing.hero.benefit1'), t('landing.hero.benefit2'), t('landing.hero.benefit3')].map(b => (
              <span key={b} className="flex items-center gap-2.5 sm:gap-2">
                <Check className="w-4 h-4 text-[#3B82F6]" strokeWidth={3} /> {b}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fade} custom={4} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12 md:mb-16 w-full max-w-[19rem] sm:max-w-none mx-auto">
            <button onClick={handleSignUp} className="w-full sm:w-auto px-7 py-3.5 bg-[#3B82F6] text-white text-[16px] font-semibold rounded-2xl sm:rounded-xl hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2.5">
              {t('landing.hero.cta')} <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <a href="#solution">
              <button className="w-full sm:w-auto px-7 py-3.5 text-[#1D1D1D] text-[16px] font-semibold border border-[#D5D5D7] rounded-2xl sm:rounded-xl hover:bg-[#F5F5F7] transition-colors">
                {t('landing.hero.learnMore')}
              </button>
            </a>
          </motion.div>

          {/* Product mock */}
          <motion.div variants={fade} custom={5}>
            <TodayMock />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ 2. O PROBLEMA ══ */}
      <section id="pain" className="py-20 px-5 border-t border-[#D5D5D7]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="max-w-4xl mx-auto">
          <motion.div variants={fade} className="text-center mb-12">
            <p className="text-[13px] text-[#3B82F6] uppercase tracking-[0.5px] mb-3 font-semibold">{t('landing.problem.label')}</p>
            <h2 className="text-[36px] md:text-[44px] font-bold tracking-[-0.5px] mb-4 text-[#1D1D1D]">
              {t('landing.problem.title').split('\n').map((line, index, arr) => (
                <React.Fragment key={line}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-[17px] text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              {t('landing.problem.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CHAOS_ITEMS.map((item, i) => (
              <motion.div key={i} variants={fade} custom={i}
                className="p-4 rounded-[12px] border border-[#D5D5D7] bg-[#F5F5F7] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8E8ED] flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1D1D1D]">{item.label}</p>
                  <p className="text-[11px] text-[#A1A1A6] mt-0.5">{item.where}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ 3. SOLUÇÃO ══ */}
      <section id="solution" className="py-28 px-5 border-t border-[#111827]/[0.08]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="max-w-4xl mx-auto text-center">
          <motion.p variants={fade} className="text-[12px] text-[#3B82F6] uppercase tracking-widest mb-3 font-bold">{t('landing.solution.label')}</motion.p>
          <motion.h2 variants={fade} className="text-[40px] md:text-[48px] font-bold tracking-tight mb-4 text-[#111827]">
            {t('landing.solution.title').split('\n').map((line, index, arr) => (
              <React.Fragment key={line}>
                {index === arr.length - 1 ? <span className="text-[#3B82F6]">{line}</span> : line}
                {index < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h2>
          <motion.p variants={fade} className="text-[17px] text-[#475569] max-w-2xl mx-auto mb-16 leading-relaxed">
            {t('landing.solution.subtitle')}
          </motion.p>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            {GAINS.map((g, i) => (
              <motion.div key={i} variants={fade} custom={i}
                className="p-5 rounded-2xl border border-[#111827]/[0.08] bg-[#FBFCFE] flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2F7] flex items-center justify-center shrink-0">
                  <g.icon className="w-4.5 h-4.5 text-[#3B82F6]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827] mb-1">{g.title}</p>
                  <p className="text-[13px] text-[#667085] leading-relaxed">{g.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ 4. PARA QUEM É ══ */}
      <section id="for-who" className="py-20 px-5 border-t border-[#D5D5D7]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-5xl mx-auto">
          <motion.div variants={fade} className="text-center mb-12">
            <p className="text-[13px] text-[#3B82F6] uppercase tracking-[0.5px] mb-3 font-semibold">{t('landing.forWho.label')}</p>
            <h2 className="text-[36px] md:text-[44px] font-bold tracking-[-0.5px] mb-4 text-[#1D1D1D]">
              {t('landing.forWho.title').split('\n').map((line, index, arr) => (
                <React.Fragment key={line}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-[17px] text-[#86868B]">{t('landing.forWho.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {FOR_WHO.map((w, i) => (
              <motion.div key={i} variants={fade} custom={i}
                className="p-6 rounded-[12px] border border-[#D5D5D7] bg-[#F5F5F7]">
                <div className="w-10 h-10 rounded-lg bg-[#E8E8ED] flex items-center justify-center mb-4">
                  <w.icon className="w-5 h-5 text-[#86868B]" strokeWidth={2} />
                </div>
                <p className="text-[15px] font-semibold mb-2 text-[#1D1D1D]">{w.title}</p>
                <p className="text-[13px] text-[#86868B] leading-relaxed mb-4">{w.desc}</p>
                <ul className="space-y-1.5">
                  {w.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12px] text-[#86868B]">
                      <Check className="w-3 h-3 text-[#3B82F6] shrink-0" strokeWidth={2.5} /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ 5. NÃO É GENÉRICO ══ */}
      <section className="py-16 px-5 border-t border-[#D5D5D7]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="max-w-3xl mx-auto text-center">
          <motion.h2 variants={fade} className="text-[32px] md:text-[40px] font-bold tracking-[-0.5px] mb-8 text-[#1D1D1D]">
            {t('landing.system.title').split('\n').map((line, index, arr) => (
              <React.Fragment key={line}>
                {index === arr.length - 1 ? <span className="text-[#86868B]">{line}</span> : line}
                {index < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {content.system.map((item, i) => (
              <motion.div key={i} variants={fade} custom={i}
                className="p-4 rounded-[12px] border border-[#D5D5D7] bg-[#F5F5F7] text-left">
                <div className="flex items-start gap-2 mb-1">
                  <X className="w-3 h-3 text-[#A1A1A6] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-[11px] text-[#A1A1A6] line-through">{item.before}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-[#3B82F6] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-[11px] text-[#1D1D1D] font-medium">{item.after}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ 6. PRICING ══ */}
      <section id="pricing" className="py-20 px-5 border-t border-[#D5D5D7]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="max-w-5xl mx-auto">
          <motion.div variants={fade} className="text-center mb-12">
            <p className="text-[13px] text-[#3B82F6] uppercase tracking-[0.5px] mb-3 font-semibold">{t('landing.pricing.label')}</p>
            <h2 className="text-[36px] md:text-[44px] font-bold tracking-[-0.5px] mb-4 text-[#1D1D1D]">
              {t('landing.pricing.title').split('\n').map((line, index, arr) => (
                <React.Fragment key={line}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-[17px] text-[#86868B]">{t('landing.pricing.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => (
              <motion.div key={i} variants={fade} custom={i}
                className={`relative p-6 rounded-[12px] border transition-all
                  ${plan.popular ? 'border-[#3B82F6] bg-white shadow-md' : 'border-[#D5D5D7] bg-[#F5F5F7]'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#3B82F6] text-white text-[10px] font-semibold rounded-full">
                    {t('landing.pricing.popular')}
                  </span>
                )}
                <p className="text-[12px] text-[#86868B] font-medium uppercase tracking-[0.5px] mb-1">{plan.name}</p>
                <p className="text-[13px] text-[#86868B] mb-4">{plan.pitch}</p>
                <div className="mb-6">
                  <span className="text-[36px] font-bold text-[#1D1D1D]">{plan.price}</span>
                  {!plan.isFree && <span className="text-[#86868B] text-[13px] ml-1">{t('landing.pricing.period')}</span>}
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px] text-[#1D1D1D]">
                      <Check className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" strokeWidth={2.5} /> {f}
                    </li>
                  ))}
                  {plan.missing.map((f, j) => (
                    <li key={`m-${j}`} className="flex items-center gap-2 text-[13px] text-[#A1A1A6] line-through">
                      <X className="w-3.5 h-3.5 text-[#D5D5D7] shrink-0" strokeWidth={2.5} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePlanClick(plan.id)} className={`w-full h-11 rounded-lg text-[13px] font-semibold transition-colors
                  ${plan.popular ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]' : 'border border-[#D5D5D7] text-[#1D1D1D] hover:bg-white'}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ 7. FAQ ══ */}
      <section id="faq" className="py-20 px-5 border-t border-[#D5D5D7]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="max-w-3xl mx-auto">
          <motion.div variants={fade} className="text-center mb-12">
            <p className="text-[13px] text-[#3B82F6] uppercase tracking-[0.5px] mb-3 font-semibold">{t('landing.faq.label')}</p>
            <h2 className="text-[36px] md:text-[44px] font-bold tracking-[-0.5px] text-[#1D1D1D]">{t('landing.faq.title')}</h2>
          </motion.div>
          <div className="space-y-1">
            {FAQ.map((faq, i) => (
              <motion.div key={i} variants={fade} custom={i}
                className="border border-[#D5D5D7] rounded-lg overflow-hidden hover:border-[#3B82F6]/40 transition-colors">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F5F5F7] transition-colors">
                  <span className="text-[15px] font-medium text-[#1D1D1D] pr-8">{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-[#3B82F6] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-90' : ''}`} strokeWidth={2} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 bg-[#F5F5F7] border-t border-[#D5D5D7]">
                    <p className="text-[14px] text-[#86868B] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ 8. CTA FINAL ══ */}
      <section className="py-24 px-5 border-t border-[#D5D5D7]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="text-center max-w-2xl mx-auto">
          <motion.h2 variants={fade} className="text-[40px] md:text-[50px] font-bold tracking-[-1px] mb-6 leading-tight text-[#1D1D1D]">
            {t('landing.cta.title').split('\n').map((line, index, arr) => (
              <React.Fragment key={line}>
                {index === arr.length - 1 ? <span className="text-[#3B82F6]">{line}</span> : line}
                {index < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h2>
          <motion.p variants={fade} className="text-[17px] text-[#86868B] mb-10 leading-relaxed">
            {t('landing.cta.subtitle')}
          </motion.p>
          <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={handleSignUp} className="px-8 py-3.5 bg-[#3B82F6] text-white text-[16px] font-semibold rounded-xl hover:bg-[#2563EB] transition-colors inline-flex items-center gap-2">
              {t('landing.hero.cta')} <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.div>
          <motion.p variants={fade} className="text-[13px] text-[#A1A1A6] mt-6">
            {t('landing.cta.noCard')}
          </motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D5D5D7] py-8 px-5 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AtlasCoreLogoSVG width={20} height={20} />
            <span className="text-[13px] font-semibold text-[#1D1D1D]">{t('common.appName')}</span>
          </div>
          <p className="text-[12px] text-[#A1A1A6]">{t('landing.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
