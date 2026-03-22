import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Compass, Home, LifeBuoy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { EmptyState, PageShell, PrimaryButton, SecondaryButton, SectionCard } from '@/components/shared/StablePage';
import { ROUTES } from '@/lib/routes';

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export default function PageNotFound() {
  const location = useLocation();
  const path = normalizePath(location.pathname);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['page-not-found-user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
  });

  const isAdmin = Boolean(isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin');

  return (
    <PageShell
      eyebrow="System"
      title="Page not found"
      subtitle="This route does not exist in atlas.core, or it may not be available for your role yet."
      maxWidth="max-w-3xl"
    >
      <SectionCard title="404" subtitle={path}>
        <EmptyState
          icon={Compass}
          title="We couldn't open this page"
          description="Try returning to your home screen, opening help, or checking whether the link belongs to a different role workspace."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton type="button" onClick={() => window.location.assign(ROUTES.home)}>
                <Home className="h-4 w-4" strokeWidth={2} />
                Go home
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => window.location.assign(ROUTES.help)}>
                <LifeBuoy className="h-4 w-4" strokeWidth={2} />
                Help center
              </SecondaryButton>
            </div>
          }
        />
      </SectionCard>

      <SectionCard title="What happened" subtitle="A deliberate system state, not a dead end.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.5)] px-4 py-4">
            <p className="atlas-metric-label">Requested path</p>
            <p className="mt-3 break-all text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {path}
            </p>
          </div>
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.5)] px-4 py-4">
            <p className="atlas-metric-label">Likely cause</p>
            <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              Broken link, expired deep link, or a route reserved for another role.
            </p>
          </div>
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.5)] px-4 py-4">
            <p className="atlas-metric-label">Next best step</p>
            <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              Return to your main workspace and re-enter from tab navigation or the help guides.
            </p>
          </div>
        </div>
      </SectionCard>

      {isAdmin ? (
        <SectionCard title="Admin note" subtitle="Context for implementation and routing.">
          <div className="atlas-banner px-4 py-4" data-tone="warning">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--card)/0.9)] text-[hsl(var(--warn))] shadow-[var(--shadow-xs)]">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  This route may still be unimplemented
                </p>
                <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  If this URL should exist, compare it against the role route map and the latest design handoff implementation list.
                </p>
                <Link
                  to={ROUTES.admin}
                  className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--brand))]"
                >
                  Open admin workspace
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </PageShell>
  );
}
