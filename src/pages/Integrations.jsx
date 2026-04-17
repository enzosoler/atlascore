import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Loader2, RefreshCw, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useHealthKit } from '@/hooks/useHealthKit';
import { DataState, PageShell, SectionCard, SafePageBoundary } from '@/components/shared/StablePage';

const ROADMAP_INTEGRATIONS = [
  { id: 'garmin', name: 'Garmin', detail: 'Roadmap only. Not connected in Atlas yet.' },
  { id: 'strava', name: 'Strava', detail: 'Roadmap only. Workout import is not live yet.' },
  { id: 'fitbit', name: 'Fitbit', detail: 'Roadmap only. Daily sync is not live yet.' },
  { id: 'whoop', name: 'WHOOP', detail: 'Roadmap only. Recovery sync is not live yet.' },
  { id: 'myfitnesspal', name: 'MyFitnessPal', detail: 'Roadmap only. Nutrition sync is not live yet.' },
];

function IntegrationRoadmapRow({ item }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.26)] px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{item.name}</p>
        <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{item.detail}</p>
      </div>
      <span className="rounded-full bg-[hsl(var(--card)/0.85)] px-3 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">
        Roadmap
      </span>
    </div>
  );
}

function AppleHealthCard() {
  const {
    available,
    connected,
    loading,
    connect,
    disconnect,
    importSnapshot,
    getTodayActivity,
    isIOS,
    lastSync,
    markSynced,
    status,
  } = useHealthKit();
  const [syncing, setSyncing] = useState(false);
  const [todayData, setTodayData] = useState(null);
  const [syncError, setSyncError] = useState('');

  const handleConnect = async () => {
    setSyncError('');
    const granted = await connect();
    if (!granted) {
      setSyncError('Atlas could not confirm Apple Health access. Check the system health permissions and try again.');
      toast.error('Apple Health permission was not granted.');
      return;
    }

    toast.success('Apple Health connected');
    await handleSync();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activity = await getTodayActivity();
      await importSnapshot(thirtyDaysAgo, now);
      if (activity) setTodayData(activity);
      markSynced(now);
      toast.success('Health data synced');
    } catch (error) {
      const message = error?.message || 'Atlas could not sync Apple Health right now.';
      setSyncError(message);
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setTodayData(null);
    setSyncError('');
    toast('Atlas link cleared');
  };

  if (!isIOS) {
    return (
      <DataState
        variant="empty"
        eyebrow="Live integration"
        meta="Unsupported on this device"
        title="Apple Health is only available on iPhone"
        description="Atlas uses Apple Health on iOS. Android support will arrive through a dedicated Health Connect path instead of pretending the same integration works here."
        primaryAction={(
          <Button asChild variant="outline">
            <Link to={ROUTES.settings}>Back to settings</Link>
          </Button>
        )}
        note="This is a truthful platform state, not a hidden failure."
      />
    );
  }

  const statusTitle = connected ? 'Apple Health connected' : available ? 'Permission needed' : 'Apple Health unavailable';
  const statusMeta = connected ? 'Live' : status === 'permission_needed' ? 'Action required' : 'Unavailable';

  return (
    <div className="space-y-4 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.28)] px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-red-500 text-white">
            <Heart className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">Apple Health</p>
            <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
              Atlas can read body data, activity, workouts, heart rate, and sleep after you grant access.
            </p>
          </div>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--ok)/0.08)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--ok))]">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Connected
          </span>
        ) : null}
      </div>

      <DataState
        variant={connected ? 'success' : available ? 'permission' : 'error'}
        eyebrow="Connection state"
        meta={statusMeta}
        title={statusTitle}
        description={
          connected
            ? `Last synced ${lastSync ? new Date(lastSync).toLocaleString() : 'not yet'}. Atlas treats this as an app link and still relies on iOS for permission ownership.`
            : available
              ? 'Grant Apple Health access from this card when you are ready. Atlas only asks when the live integration is relevant.'
              : 'Atlas could not confirm Apple Health availability on this device.'
        }
        note="Disconnect clears the Atlas-side link and cached sync state. Revoking Apple Health permission still happens in iPhone system settings."
      />

      {connected ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.78)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Reads</p>
            <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">Body, activity, workouts</p>
          </div>
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.78)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Writes</p>
            <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">Weight, body fat, nutrition, workouts</p>
          </div>
          <div className="rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.78)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Today</p>
            <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">
              {todayData ? `${todayData.steps?.toLocaleString?.() || 0} steps` : 'Sync to preview'}
            </p>
          </div>
        </div>
      ) : null}

      {syncError ? (
        <DataState
          variant="error"
          eyebrow="Sync state"
          title="Apple Health sync needs attention"
          description={syncError}
          primaryAction={(
            <Button onClick={connected ? handleSync : handleConnect} disabled={loading || syncing} className="gap-2">
              {(loading || syncing) && <Loader2 className="h-4 w-4 animate-spin" />}
              Retry
            </Button>
          )}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {connected ? (
          <>
            <Button onClick={handleSync} disabled={syncing} className="gap-2">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync now
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="gap-2">
              Clear Atlas link
            </Button>
          </>
        ) : (
          <Button onClick={handleConnect} disabled={loading || !available} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
            Connect Apple Health
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Integrations() {
  const navigate = useNavigate();

  return (
    <SafePageBoundary title="Integrations" maxWidth="max-w-2xl" fallbackDescription="Manage connected services and sync state.">
      <PageShell
        eyebrow="Integrations"
        title="Integration center"
        subtitle="One truthful place for what is live on this device, what Atlas can sync now, and what is still roadmap-only."
        maxWidth="max-w-2xl"
        actions={(
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      >
        <SectionCard title="Overview" subtitle="Live integrations stay separate from future providers.">
          <DataState
            variant="neutral"
            eyebrow="Atlas sync"
            title="Apple Health is the only live integration in this build"
            description="This page does not mix roadmap logos with working sync states. Connected services stay in the live section below. Future providers stay in a separate roadmap section."
            note="That keeps Atlas honest about what can sync today."
          />
        </SectionCard>

        <SectionCard title="Live integrations" subtitle="Connect, sync, inspect scope, and clear the Atlas-side link.">
          <AppleHealthCard />
        </SectionCard>

        <SectionCard title="Roadmap" subtitle="Future providers are listed separately until backend support is real.">
          <div className="space-y-3">
            {ROADMAP_INTEGRATIONS.map((item) => (
              <IntegrationRoadmapRow key={item.id} item={item} />
            ))}
          </div>
        </SectionCard>
      </PageShell>
    </SafePageBoundary>
  );
}
