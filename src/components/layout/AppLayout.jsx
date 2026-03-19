import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Brain,
  Camera,
  ChefHat,
  ChevronLeft,
  ClipboardList,
  Download,
  FlaskConical,
  Heart,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
  UtensilsCrossed,
  Dumbbell,
  X,
} from 'lucide-react';
import TrialBanner from '@/components/shared/TrialBanner';
import SupportWidget from '@/components/shared/SupportWidget';
import { TabBar } from '@/components/shared/AppContainer';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { useAuth } from '@/lib/AuthContext';
import { useRBAC, ROLE_LABELS } from '@/lib/rbac';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  Home,
  UtensilsCrossed,
  Dumbbell,
  FlaskConical,
  BarChart3,
  Brain,
  User,
  Heart,
  BookOpen,
  ShieldCheck,
  Users,
  Download,
  Camera,
  ClipboardList,
  ChefHat,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
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

function getDesktopNavItemClass(active, collapsed, destructive = false) {
  return cn(
    'group flex h-11 items-center rounded-[20px] text-[13px] font-medium tracking-[-0.014em] transition-all duration-200',
    collapsed ? 'mx-auto w-11 justify-center px-0' : 'gap-3 px-4',
    destructive
      ? 'text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]'
      : active
        ? 'border border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
        : 'text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.9)] hover:text-[hsl(var(--fg))]'
  );
}

function getMobileNavItemClass(active, destructive = false) {
  return cn(
    'flex h-11 items-center gap-3 rounded-[20px] px-4 text-[14px] font-medium tracking-[-0.014em] transition-all duration-200',
    destructive
      ? 'text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]'
      : active
        ? 'border border-[hsl(var(--border)/0.92)] bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
        : 'text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.9)] hover:text-[hsl(var(--fg))]'
  );
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
    <div className="flex min-h-screen bg-transparent">
      {/* ── Sidebar desktop ─────────────────────────────────────── */}
      <aside
        className={cn(
          'glass hidden shrink-0 flex-col fixed inset-y-0 left-0 z-40 border-r border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.8)] transition-all duration-300 ease-out lg:flex',
          collapsed ? 'w-[4.5rem]' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-[hsl(var(--border)/0.72)] px-5',
            collapsed ? 'justify-center px-0' : 'gap-3'
          )}
        >
          <AtlasCoreLogoSVG width={28} height={28} className="shrink-0" />
          {!collapsed ? (
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              Atlas Core
            </span>
          ) : null}
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {nav.map(({ path, label, icon }) => {
            const Icon = ICON_MAP[icon] || Home;
            const active = isActive(path);

            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={getDesktopNavItemClass(active, collapsed)}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.9} />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </Link>
            );
          })}

          {role === 'admin' ? (
            <Link
              to={ROUTES.admin}
              title={collapsed ? 'Painel Admin' : undefined}
              className={getDesktopNavItemClass(isActive(ROUTES.admin), collapsed)}
            >
              <ShieldCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              {!collapsed ? <span className="truncate">Painel Admin</span> : null}
            </Link>
          ) : null}
        </nav>

        {/* Bottom: user card + actions */}
        <div className="border-t border-[hsl(var(--border)/0.72)] px-3 py-4">
          {!collapsed ? (
            <div className="mx-1 mb-3 rounded-[18px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] px-4 py-3 shadow-[var(--shadow-xs)]">
              <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {user?.full_name || user?.email}
              </p>
              <span className="mt-1 inline-block text-[11px] font-medium text-[hsl(var(--fg-2))]">
                {ROLE_LABELS[role] || role}
              </span>
            </div>
          ) : null}

          <div className="space-y-0.5">
            <button
              onClick={() => logout()}
              className={getDesktopNavItemClass(false, collapsed, true)}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.95} />
              {!collapsed ? <span>Sair</span> : null}
            </button>
            <button
              onClick={() => setCollapsed((value) => !value)}
              className={getDesktopNavItemClass(false, collapsed)}
            >
              <ChevronLeft
                className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-transform duration-300',
                  collapsed ? 'rotate-180' : ''
                )}
                strokeWidth={1.95}
              />
              {!collapsed ? <span>Recolher</span> : null}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <header className="glass fixed inset-x-0 top-0 z-[60] flex h-14 items-center justify-between border-b border-[hsl(var(--border)/0.72)] px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--fill))]"
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
              {mobileOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
            </motion.div>
          </AnimatePresence>
        </button>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <AtlasCoreLogoSVG width={22} height={22} />
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            Atlas Core
          </span>
        </div>

        <div className="w-9" />
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[65] bg-[rgba(10,14,22,0.28)] backdrop-blur-[2px] lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass fixed bottom-0 left-0 top-0 z-[70] flex w-[18rem] flex-col border-r border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.88)] lg:hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(var(--border)/0.72)] px-4">
                <div className="flex items-center gap-2">
                  <AtlasCoreLogoSVG width={22} height={22} />
                  <span className="text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                    Atlas Core
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--fill))]"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                {nav.map(({ path, label, icon }) => {
                  const Icon = ICON_MAP[icon] || Home;
                  const active = isActive(path);

                  return (
                    <Link
                      key={path}
                      to={path}
                      className={getMobileNavItemClass(active)}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.9} />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}

                {role === 'admin' ? (
                  <Link to={ROUTES.admin} className={getMobileNavItemClass(isActive(ROUTES.admin))}>
                    <ShieldCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                    <span className="truncate">Painel Admin</span>
                  </Link>
                ) : null}
              </nav>

              <div className="border-t border-[hsl(var(--border)/0.72)] px-3 py-4">
                <div className="mx-1 mb-3 rounded-[18px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] px-4 py-3 shadow-[var(--shadow-xs)]">
                  <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium text-[hsl(var(--fg-2))]">
                    {user?.email}
                  </p>
                  <span className="mt-1 inline-block text-[11px] font-medium text-[hsl(var(--fg-2))]">
                    {ROLE_LABELS[role] || role}
                  </span>
                </div>
                <button onClick={() => logout()} className={getMobileNavItemClass(false, true)}>
                  <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.95} />
                  <span>Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {/* ── Mobile bottom tab bar ───────────────────────────────── */}
      <TabBar
        items={[
          ...bottomNav.map(({ path, label, icon }) => ({
            key: path,
            to: getBottomTabTarget(path),
            onClick: (event) => handleBottomTabPress(event, path),
            label,
            icon: ICON_MAP[icon] || Home,
            active: currentTabRoot === path,
          })),
          {
            key: 'menu',
            label: 'Menu',
            icon: Menu,
            onClick: () => setMobileOpen(true),
            active: false,
          },
        ]}
      />

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        className={cn(
          'flex-1 min-h-screen overflow-x-hidden transition-all duration-300',
          collapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-64',
          'pt-14 lg:pt-0',
          'pb-[calc(90px+env(safe-area-inset-bottom))] lg:pb-0'
        )}
        onTouchStart={handlePullStart}
        onTouchMove={handlePullMove}
        onTouchEnd={finishPull}
        onTouchCancel={finishPull}
      >
        <TrialBanner />

        <motion.div
          className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 lg:hidden"
          style={{ top: 'calc(56px + env(safe-area-inset-top) + 10px)' }}
          animate={{
            y: isRefreshing || pullDistance > 0 ? 0 : -18,
            opacity: isRefreshing || pullDistance > 0 ? 1 : 0,
          }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <div className="atlas-card flex items-center gap-2 rounded-full px-3 py-1.5">
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance >= PULL_REFRESH_THRESHOLD ? 180 : 0 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.18 }}
            >
              <Loader2 className={cn('h-3.5 w-3.5 text-[hsl(var(--brand))]', isRefreshing ? 'animate-spin' : '')} />
            </motion.div>
            <span className="text-[11px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
              {isRefreshing ? 'Atualizando' : 'Puxe para atualizar'}
            </span>
          </div>
        </motion.div>

        <div
          className="lg:min-h-screen"
          style={{
            transform: `translateY(${pullDistance}px)`,
          }}
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
