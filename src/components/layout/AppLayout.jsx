import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import TrialBanner from '@/components/shared/TrialBanner';
import SupportWidget from '@/components/shared/SupportWidget';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import {
  Home, UtensilsCrossed, Dumbbell, FlaskConical,
  BarChart3, Brain, User, Menu, X, ChevronLeft,
  Heart, BookOpen, LogOut, ShieldCheck, Users,
  Download, Camera, ClipboardList, ChefHat,
  LayoutDashboard, MessageSquare, TrendingUp, Loader2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useRBAC, ROLE_LABELS } from '@/lib/rbac';
import { ROUTES } from '@/lib/routes';

const ICON_MAP = {
  Home, UtensilsCrossed, Dumbbell, FlaskConical, BarChart3, Brain, User,
  Heart, BookOpen, ShieldCheck, Users, Download, Camera, ClipboardList,
  ChefHat, LayoutDashboard, MessageSquare, TrendingUp,
};

const BOTTOM_PATHS_BY_ROLE = {
  athlete: [ROUTES.today, ROUTES.nutrition, ROUTES.workouts, ROUTES.atlasAI],
  coach: [ROUTES.today, ROUTES.coachDashboard, ROUTES.coachStudents, ROUTES.profile],
  nutritionist: [ROUTES.today, ROUTES.nutritionistDashboard, ROUTES.nutritionistClients, ROUTES.profile],
  clinician: [ROUTES.today, ROUTES.clinicianDashboard, ROUTES.clinicianPatients, ROUTES.profile],
  admin: [ROUTES.today, ROUTES.pricing, ROUTES.social, ROUTES.profile],
};

const MOBILE_TAB_HISTORY_KEY = 'atlas_mobile_tab_history_v1';
const PULL_MAX_DISTANCE = 104;
const PULL_REFRESH_THRESHOLD = 72;

const TAB_DETAIL_MATCHERS = [
  [ROUTES.workouts, ['/exercise/']],
  [ROUTES.coachStudents, ['/coach/student/', '/coach/prescribe-workout/']],
  [ROUTES.nutritionistClients, ['/nutritionist/client/', '/nutritionist/prescribe-diet/']],
  [ROUTES.clinicianPatients, ['/clinician/patient/']],
];

function readStoredTabHistory() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.sessionStorage.getItem(MOBILE_TAB_HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function resolveTabRoot(pathname, bottomPaths) {
  for (const [tabRoot, matches] of TAB_DETAIL_MATCHERS) {
    if (matches.some((prefix) => pathname.startsWith(prefix)) && bottomPaths.includes(tabRoot)) {
      return tabRoot;
    }
  }

  return [...bottomPaths]
    .sort((left, right) => right.length - left.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`)) || null;
}

function getTransitionState(pathname, previousPathname, bottomPaths) {
  const currentTab = resolveTabRoot(pathname, bottomPaths);
  const previousTab = resolveTabRoot(previousPathname, bottomPaths);

  if (currentTab && previousTab && currentTab !== previousTab) {
    const currentIndex = bottomPaths.indexOf(currentTab);
    const previousIndex = bottomPaths.indexOf(previousTab);
    const direction = currentIndex > previousIndex ? 1 : -1;

    return {
      initial: { opacity: 0, x: 22 * direction, scale: 0.995 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -18 * direction, scale: 0.995 },
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    };
  }

  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.18, ease: 'easeOut' },
  };
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabHistory, setTabHistory] = useState(() => readStoredTabHistory());
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const queryClient = useQueryClient();
  const { pathname } = location;
  const previousPathnameRef = useRef(pathname);
  const pullStartYRef = useRef(0);
  const isPullingRef = useRef(false);

  const { user, logout } = useAuth();
  const { role, nav } = useRBAC(user);

  const bottomPaths = BOTTOM_PATHS_BY_ROLE[role] || BOTTOM_PATHS_BY_ROLE.athlete;
  const bottomNav = useMemo(
    () => nav.filter((item) => bottomPaths.includes(item.path)),
    [bottomPaths, nav]
  );
  const currentTabRoot = resolveTabRoot(pathname, bottomPaths);
  const transitionState = getTransitionState(pathname, previousPathnameRef.current, bottomPaths);

  useEffect(() => {
    previousPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!currentTabRoot) return;

    setTabHistory((previous) => {
      if (previous[currentTabRoot] === pathname) return previous;

      const next = { ...previous, [currentTabRoot]: pathname };

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(MOBILE_TAB_HISTORY_KEY, JSON.stringify(next));
      }

      return next;
    });
  }, [currentTabRoot, pathname]);

  const isActive = (path) =>
    pathname === path || (path !== ROUTES.today && pathname.startsWith(path));

  const getBottomTabTarget = (path) => tabHistory[path] || path;

  const handleBottomTabPress = (event, path) => {
    event.preventDefault();

    const target = getBottomTabTarget(path);
    if (target !== pathname) {
      navigate(target);
    }
  };

  const handlePullStart = (event) => {
    if (window.innerWidth >= 1024 || mobileOpen || isRefreshing || window.scrollY > 0) return;

    pullStartYRef.current = event.touches[0]?.clientY ?? 0;
    isPullingRef.current = true;
  };

  const handlePullMove = (event) => {
    if (!isPullingRef.current) return;

    const currentY = event.touches[0]?.clientY ?? 0;
    const rawDelta = currentY - pullStartYRef.current;

    if (rawDelta <= 0 || window.scrollY > 0) {
      setPullDistance(0);
      return;
    }

    const nextDistance = Math.min(rawDelta * 0.45, PULL_MAX_DISTANCE);
    setPullDistance(nextDistance);

    if (nextDistance > 0) {
      event.preventDefault();
    }
  };

  const finishPull = async () => {
    if (!isPullingRef.current) return;

    isPullingRef.current = false;

    if (pullDistance < PULL_REFRESH_THRESHOLD) {
      setPullDistance(0);
      return;
    }

    setIsRefreshing(true);
    setPullDistance(PULL_REFRESH_THRESHOLD);

    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-[#D5D5D7] transition-all duration-300 ease-out shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <div className={`flex items-center h-14 shrink-0 border-b border-[#D5D5D7] px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <AtlasCoreLogoSVG width={28} height={28} className="shrink-0" />
          {!collapsed && <span className="text-[16px] font-semibold tracking-tight text-[#1D1D1D]">Atlas Core</span>}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {nav.map(({ path, label, icon }) => {
            const Icon = ICON_MAP[icon] || Home;
            const active = isActive(path);

            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={`flex items-center rounded-[10px] text-[13px] font-medium transition-colors h-10 ${collapsed ? 'justify-center w-10 mx-auto' : 'gap-3 px-3'} ${active ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#86868B] hover:text-[#1D1D1D] hover:bg-[#F5F5F7]'}`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {!collapsed && label}
              </Link>
            );
          })}

          {role === 'admin' && (
            <Link
              to={ROUTES.admin}
              title={collapsed ? 'Admin Panel' : undefined}
              className={`flex items-center rounded-[10px] text-[13px] font-medium transition-colors h-10 ${collapsed ? 'justify-center w-10 mx-auto' : 'gap-3 px-3'} ${isActive(ROUTES.admin) ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#86868B] hover:text-[#1D1D1D] hover:bg-[#F5F5F7]'}`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
              {!collapsed && 'Admin Panel'}
            </Link>
          )}
        </nav>

        <div className="px-2 py-3 border-t border-[#D5D5D7] space-y-1 shrink-0">
          {!collapsed && (
            <div className="px-3 py-2 mb-1">
              <p className="text-[12px] truncate text-[#1D1D1D] font-medium">{user?.full_name || user?.email}</p>
              <span className="inline-block text-[11px] text-[#86868B] mt-0.5">{ROLE_LABELS[role] || role}</span>
            </div>
          )}
          <button
            onClick={() => logout()}
            className={`flex items-center rounded-[10px] text-[13px] font-medium transition-colors h-10 text-[#86868B] hover:text-[#DC2626] hover:bg-[#DC2626]/10 w-full ${collapsed ? 'justify-center' : 'gap-3 px-3'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
            {!collapsed && 'Sair'}
          </button>
          <button
            onClick={() => setCollapsed((value) => !value)}
            className={`flex items-center rounded-[10px] text-[13px] transition-colors h-10 text-[#86868B] hover:text-[#1D1D1D] hover:bg-[#F5F5F7] w-full ${collapsed ? 'justify-center' : 'gap-3 px-3'}`}
          >
            <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} strokeWidth={2} />
            {!collapsed && 'Recolher'}
          </button>
        </div>
      </aside>

      <header
        className="lg:hidden fixed top-0 inset-x-0 z-[60] h-12 bg-white border-b border-[#D5D5D7] flex items-center justify-between px-4"
        style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      >
        <button
          onClick={() => setMobileOpen((value) => !value)}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--shell))] transition-colors"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
            </motion.div>
          </AnimatePresence>
        </button>

        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <AtlasCoreLogoSVG width={24} height={24} />
          <span className="text-[16px] font-semibold tracking-tight text-[#1D1D1D]">Atlas Core</span>
        </div>

        <div className="w-8" />
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-[65] bg-black/50"
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white border-r border-[#D5D5D7] flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between h-12 px-4 border-b border-[#D5D5D7] shrink-0">
                <div className="flex items-center gap-2">
                  <AtlasCoreLogoSVG width={24} height={24} />
                  <span className="text-[16px] font-semibold tracking-tight text-[#1D1D1D]">Atlas Core</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors">
                  <X className="w-4 h-4 text-[#1D1D1D]" strokeWidth={2} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {nav.map(({ path, label, icon }) => {
                  const Icon = ICON_MAP[icon] || Home;
                  const active = isActive(path);

                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-3 px-3 h-11 rounded-[10px] text-[14px] font-medium transition-colors ${active ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#86868B] hover:text-[#1D1D1D] hover:bg-[#F5F5F7]'}`}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
                      {label}
                    </Link>
                  );
                })}

                {role === 'admin' && (
                  <Link
                    to={ROUTES.admin}
                    className={`flex items-center gap-3 px-3 h-11 rounded-[10px] text-[14px] font-medium transition-colors ${isActive(ROUTES.admin) ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#86868B] hover:text-[#1D1D1D] hover:bg-[#F5F5F7]'}`}
                  >
                    <ShieldCheck className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                    Admin Panel
                  </Link>
                )}
              </nav>

              <div className="px-2 py-3 border-t border-[#D5D5D7] space-y-1 shrink-0">
                <div className="px-3 py-2">
                  <p className="text-[13px] font-medium truncate text-[#1D1D1D]">{user?.full_name || user?.email}</p>
                  <p className="text-[11px] text-[#86868B] truncate">{user?.email}</p>
                  <span className="text-[11px] text-[#86868B] inline-block mt-1">{ROLE_LABELS[role] || role}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-3 h-11 rounded-[10px] text-[14px] font-medium text-[#86868B] hover:text-[#DC2626] hover:bg-[#DC2626]/10 w-full transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={2} /> Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-[#D5D5D7]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-[60px] px-1">
          {bottomNav.map(({ path, label, icon }) => {
            const Icon = ICON_MAP[icon] || Home;
            const active = currentTabRoot === path;

            return (
              <Link
                key={path}
                to={getBottomTabTarget(path)}
                onClick={(event) => handleBottomTabPress(event, path)}
                className={`flex flex-col items-center gap-[4px] px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 ${active ? 'text-[#3B82F6]' : 'text-[#86868B]'}`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-tight leading-none truncate max-w-[52px] text-center">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-[4px] px-2 py-1.5 rounded-lg transition-colors text-[#86868B] flex-1"
          >
            <Menu className="w-5 h-5 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-tight leading-none">Menu</span>
          </button>
        </div>
      </nav>

      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-56'} pt-12 lg:pt-0 pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-0 overflow-x-hidden`}
        onTouchStart={handlePullStart}
        onTouchMove={handlePullMove}
        onTouchEnd={finishPull}
        onTouchCancel={finishPull}
      >
        <TrialBanner />

        <motion.div
          className="lg:hidden fixed left-1/2 z-50 -translate-x-1/2 pointer-events-none"
          style={{ top: 'calc(48px + env(safe-area-inset-top) + 8px)' }}
          animate={{
            y: isRefreshing || pullDistance > 0 ? 0 : -18,
            opacity: isRefreshing || pullDistance > 0 ? 1 : 0,
          }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-2 rounded-full border border-[#D5D5D7] bg-white/95 px-3 py-1.5 shadow-sm">
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance >= PULL_REFRESH_THRESHOLD ? 180 : 0 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.18 }}
            >
              <Loader2 className={`w-3.5 h-3.5 text-[#3B82F6] ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.div>
            <span className="text-[11px] font-medium text-[#1D1D1D]">
              {isRefreshing ? 'Atualizando' : 'Puxe para atualizar'}
            </span>
          </div>
        </motion.div>

        <div
          className="lg:min-h-screen"
          style={{ transform: `translateY(${pullDistance}px)`, minHeight: 'calc(100vh - 48px - 76px - env(safe-area-inset-bottom))' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={transitionState.initial}
              animate={transitionState.animate}
              exit={transitionState.exit}
              transition={transitionState.transition}
            >
              {outlet || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>

        <SupportWidget />
      </main>
    </div>
  );
}
