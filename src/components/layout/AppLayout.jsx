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
  Settings,
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
import ThemeToggleButton from '@/components/shared/ThemeToggleButton';
import { TabBar } from '@/components/shared/AppContainer';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { useAuth } from '@/lib/AuthContext';
import { useRBAC, ROLE_LABELS } from '@/lib/rbac';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getPrimaryScrollTop, resetPrimaryScroll, usePrimaryRouteScrollReset } from '@/components/layout/usePrimaryRouteScrollReset';

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
  Settings,
};

const BOTTOM_PATHS_BY_ROLE = {
  athlete: [ROUTES.today, ROUTES.workouts, ROUTES.nutrition, ROUTES.body, ROUTES.profile],
  coach: [ROUTES.today, ROUTES.coachDashboard, ROUTES.coachStudents, ROUTES.profile],
  nutritionist: [ROUTES.today, ROUTES.nutritionistDashboard, ROUTES.nutritionistClients, ROUTES.profile],
  clinician: [ROUTES.today, ROUTES.clinicianDashboard, ROUTES.clinicianPatients, ROUTES.profile],
  admin: [ROUTES.today, ROUTES.admin, ROUTES.social, ROUTES.profile],
};

const MOBILE_TAB_LABEL_OVERRIDES = {
  [ROUTES.workouts]: 'Train',
  [ROUTES.profile]: 'More',
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

function BrandLockup({ logoWidth, logoHeight, textClassName = '', className = '' }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <AtlasCoreLogoSVG
        width={logoWidth}
        height={logoHeight}
        color="hsl(var(--accent-primary))"
        className="shrink-0"
      />
      <span className={cn('text-[17px] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]', textClassName)}>
        <span className="text-[hsl(var(--accent-primary))]">atlas</span>
        <span className="font-medium text-[hsl(var(--fg)/0.84)]">.core</span>
      </span>
    </div>
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

  // Pull-to-refresh refs — all mutable pull state lives here to avoid stale closures
  const mainRef = useRef(null);
  const pullStartYRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const mobileOpenRef = useRef(mobileOpen);
  const isRefreshingRef = useRef(isRefreshing);
  const queryClientRef = useRef(queryClient);

  useEffect(() => { mobileOpenRef.current = mobileOpen; }, [mobileOpen]);
  useEffect(() => { isRefreshingRef.current = isRefreshing; }, [isRefreshing]);
  useEffect(() => { queryClientRef.current = queryClient; }, [queryClient]);

  const { user, logout } = useAuth();
  const { role, nav } = useRBAC(user);

  const bottomPaths = BOTTOM_PATHS_BY_ROLE[role] || BOTTOM_PATHS_BY_ROLE.athlete;
  const bottomNav = useMemo(
    () =>
      nav
        .filter((item) => bottomPaths.includes(item.path))
        .sort((left, right) => bottomPaths.indexOf(left.path) - bottomPaths.indexOf(right.path)),
    [bottomPaths, nav]
  );
  const currentTabRoot = resolveTabRoot(pathname, bottomPaths);
  const transitionState = getTransitionState(pathname, previousPathnameRef.current, bottomPaths);

  usePrimaryRouteScrollReset(mainRef);

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

  // ── Imperative pull-to-refresh (non-passive touchmove so preventDefault works) ──
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const onTouchStart = (event) => {
      if (
        window.innerWidth >= 1024 ||
        mobileOpenRef.current ||
        isRefreshingRef.current ||
        getPrimaryScrollTop(el) > 0
      ) return;

      pullStartYRef.current = event.touches[0]?.clientY ?? 0;
      isPullingRef.current = true;
    };

    const onTouchMove = (event) => {
      if (!isPullingRef.current) return;

      const currentY = event.touches[0]?.clientY ?? 0;
      const rawDelta = currentY - pullStartYRef.current;

      if (rawDelta <= 0 || getPrimaryScrollTop(el) > 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        isPullingRef.current = false;
        return;
      }

      const nextDistance = Math.min(rawDelta * 0.45, PULL_MAX_DISTANCE);
      pullDistanceRef.current = nextDistance;
      setPullDistance(nextDistance);

      // Prevent browser scroll while pulling — requires non-passive listener
      event.preventDefault();
    };

    const onTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      const distance = pullDistanceRef.current;

      if (distance < PULL_REFRESH_THRESHOLD) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      setIsRefreshing(true);
      isRefreshingRef.current = true;
      pullDistanceRef.current = PULL_REFRESH_THRESHOLD;
      setPullDistance(PULL_REFRESH_THRESHOLD);

      try {
        await queryClientRef.current.invalidateQueries();
        await queryClientRef.current.refetchQueries({ type: 'active' });
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false }); // ← non-passive: allows preventDefault
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []); // handlers only registered once; all mutable state via refs

  const isActive = (path) =>
    pathname === path || (path !== ROUTES.today && pathname.startsWith(path));

  const getBottomTabTarget = (path) => tabHistory[path] || path;

  const handleBottomTabPress = (event, path) => {
    event.preventDefault();

    const target = getBottomTabTarget(path);
    if (target === pathname) {
      resetPrimaryScroll(mainRef.current);
      return;
    }

    navigate(target);
  };

  return (
    <div className="flex min-h-screen bg-transparent overflow-x-clip">
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
            'flex h-[4.5rem] shrink-0 items-center border-b border-[hsl(var(--border)/0.72)] px-5',
            collapsed ? 'justify-center px-0' : 'gap-3'
          )}
        >
          {collapsed ? (
            <AtlasCoreLogoSVG width={34} height={34} className="shrink-0" color="hsl(var(--accent-primary))" />
          ) : (
            <BrandLockup logoWidth={82} logoHeight={28} textClassName="text-[18px]" />
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {nav.map(({ path, label, icon }) => {
            const Icon = ICON_MAP[icon] || Home;
            const active = isActive(path);
            const tourId = path === ROUTES.nutrition ? 'nutrition' :
                           path === ROUTES.workouts ? 'workouts' :
                           path === ROUTES.progress || path === ROUTES.body ? 'progress' :
                           path === ROUTES.profile ? 'profile' : undefined;

            return (
              <Link
                key={path}
                to={path}
                data-tour={tourId}
                title={collapsed ? label : undefined}
                className={getDesktopNavItemClass(active, collapsed)}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.9} />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </Link>
            );
          })}

          {/* Admin Console entry is rendered via nav.map() from rbac.js NAV_BY_ROLE — no duplicate here */}
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
            <Link
              to={ROUTES.settings}
              className={getDesktopNavItemClass(isActive(ROUTES.settings), collapsed)}
            >
              <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={1.95} />
              {!collapsed ? <span>Settings</span> : null}
            </Link>
            <ThemeToggleButton
              compact={collapsed}
              className={collapsed ? '' : 'w-full justify-start'}
            />
            <button
              onClick={() => logout()}
              className={getDesktopNavItemClass(false, collapsed, true)}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.95} />
              {!collapsed ? <span>Sign out</span> : null}
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
              {!collapsed ? <span>Collapse</span> : null}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      {/* padding-top: env(safe-area-inset-top) pushes content below notch/Dynamic Island */}
      <header
        className="glass fixed inset-x-0 top-0 z-[60] border-b border-[hsl(var(--border)/0.72)] lg:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* relative so the brand can be absolutely centered regardless of side-button widths */}
        <div className="relative flex h-[3.75rem] items-center justify-between px-4 sm:px-5">
          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-[18px] text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--fill))]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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

          {/* Brand — absolutely centered so side buttons don't push it */}
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
            <div className="flex items-center rounded-full border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.84)] px-3.5 py-1.5 shadow-[var(--shadow-xs)] backdrop-blur-[18px]">
              <BrandLockup
                logoWidth={58}
                logoHeight={19}
                textClassName="text-[17px] sm:text-[18px]"
              />
            </div>
          </div>

          <ThemeToggleButton compact />
        </div>
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
              <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border)/0.72)] px-4"
                style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.75rem + env(safe-area-inset-top, 0px))' }}
              >
                <BrandLockup logoWidth={78} logoHeight={27} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[18px] text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--fill))]"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                {nav.map(({ path, label, icon }) => {
                  const Icon = ICON_MAP[icon] || Home;
                  const active = isActive(path);
                  const tourId = path === ROUTES.nutrition ? 'nutrition' :
                                 path === ROUTES.workouts ? 'workouts' :
                                 path === ROUTES.progress || path === ROUTES.body ? 'progress' :
                                 path === ROUTES.profile ? 'profile' : undefined;

                  return (
                    <Link
                      key={path}
                      to={path}
                      data-tour={tourId}
                      className={getMobileNavItemClass(active)}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.9} />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}

                {/* Admin Console entry is rendered via nav.map() from rbac.js NAV_BY_ROLE — no duplicate here */}
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
                <Link to={ROUTES.settings} className={getMobileNavItemClass(isActive(ROUTES.settings))}>
                  <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={1.95} />
                  <span>Settings</span>
                </Link>
                <button onClick={() => logout()} className={getMobileNavItemClass(false, true)}>
                  <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.95} />
                  <span>Sign out</span>
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
            label: MOBILE_TAB_LABEL_OVERRIDES[path] || label,
            icon: ICON_MAP[icon] || Home,
            active: currentTabRoot === path,
          })),
        ]}
      />

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        ref={mainRef}
        className={cn(
          'flex-1 min-h-screen overflow-x-clip transition-all duration-300',
          collapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-64',
          'lg:pt-0',
          'pb-[calc(94px+env(safe-area-inset-bottom))] lg:pb-0'
        )}
        style={{ paddingTop: 'calc(3.75rem + env(safe-area-inset-top, 0px))' }}
      >
        <TrialBanner />

        {/* ── Pull-to-refresh indicator ── */}
        <motion.div
          className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 lg:hidden"
          style={{ top: 'calc(60px + env(safe-area-inset-top) + 10px)' }}
          animate={{
            y: isRefreshing || pullDistance > 0 ? 0 : -56,
            opacity: isRefreshing || pullDistance > 0 ? 1 : 0,
            scale: isRefreshing || pullDistance > 0 ? 1 : 0.88,
          }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="atlas-card flex items-center gap-2.5 rounded-full px-3.5 py-2 shadow-[var(--shadow-md)]">
            {/* Circular progress ring or spinner */}
            <div className="relative h-4 w-4 shrink-0">
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--brand))]" />
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4 -rotate-90">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="hsl(var(--border))" strokeWidth="2.2" />
                  <circle
                    cx="8" cy="8" r="6" fill="none"
                    stroke="hsl(var(--brand))"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 6}`}
                    strokeDashoffset={`${2 * Math.PI * 6 * (1 - Math.min(pullDistance / PULL_REFRESH_THRESHOLD, 1))}`}
                  />
                </svg>
              )}
            </div>
            <span className="text-[11px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg))]">
              {isRefreshing
                ? 'Refreshing...'
                : pullDistance >= PULL_REFRESH_THRESHOLD
                  ? 'Release to refresh'
                  : 'Pull to refresh'}
            </span>
          </div>
        </motion.div>

        <div
          className="lg:min-h-screen"
          style={{
            transform: `translateY(${pullDistance}px)`,
            // Spring release animation when finger lifts; no transition while actively pulling
            transition: isPullingRef.current ? 'none' : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
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
