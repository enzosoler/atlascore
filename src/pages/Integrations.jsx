import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Loader2, RefreshCw, Settings2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useHealthKit } from '@/hooks/useHealthKit';
import { PageShell, SectionCard, SafePageBoundary } from '@/components/shared/StablePage';

/* ─── Roadmap items ───────────────────────────────────────────────────────── */

const ROADMAP_INTEGRATIONS = [
  { id: 'garmin', name: 'Garmin', detail: 'Activity, sleep, and body composition sync.' },
  { id: 'strava', name: 'Strava', detail: 'Workout import and training load.' },
  { id: 'fitbit', name: 'Fitbit', detail: 'Daily activity and sleep tracking.' },
  { id: 'whoop', name: 'WHOOP', detail: 'Recovery and strain data.' },
  { id: 'myfitnesspal', name: 'MyFitnessPal', detail: 'Nutrition diary sync.' },
];

/* ─── Roadmap row ─────────────────────────────────────────────────────────── */

function IntegrationRoadmapRow({ item, isLast = false }) {
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3 ${
      !isLast ? 'border-b border-[hsl(var(--border)/0.5)]' : ''
    }`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[hsl(var(--fill)/0.4)] text-[14px] font-semibold text-[hsl(var(--fg-3))]">
        {item.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium tracking-[-0.01em] text-[hsl(var(--fg))]">{item.name}</p>
        <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-3))]">{item.detail}</p>
      </div>
      <span className="rounded-full bg-[hsl(var(--fill)/0.56)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">
        2026
      </span>
    </div>
  );
}

/* ─── Apple Health card ───────────────────────────────────────────────────── */

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
      setSyncError('Could not confirm Apple Health access. Check system health permissions.');
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
      const message = error?.message || 'Could not sync Apple Health right now.';
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
    toast('Apple Health link cleared');
  };

  // Relative sync time display
  const syncTimeLabel = (() => {
    if (!lastSync) return null;
    const diff = Date.now() - new Date(lastSync).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(lastSync).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  })();

  if (!isIOS) {
    return (
      <div className="rounded-[16px] border border-dashed border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.18)] px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-red-500/10 text-red-400">
            <Heart className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Apple Health</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
              Only available on iPhone. Android support via Health Connect is on the roadmap.
            </p>
            <span className="mt-2 inline-flex rounded-full bg-[hsl(var(--fill)/0.56)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">
              Unavailable on this device
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-red-500 text-white">
            <Heart className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">Apple Health</p>
            <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">
              Body data, activity, workouts, heart rate, and sleep.
            </p>
          </div>
        </div>

        {/* Status badge */}
        {connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--ok)/0.08)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--ok))]">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ok))]" />
            Connected
          </span>
        ) : available ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--warn)/0.08)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--warn))]">
            Not connected
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-[hsl(var(--fill)/0.56)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">
            Unavailable
          </span>
        )}
      </div>

      {/* Last sync time */}
      {connected && syncTimeLabel && (
        <div className="rounded-[12px] bg-[hsl(var(--fill)/0.36)] px-4 py-2.5">
          <p className="text-[12px] text-[hsl(var(--fg-2))]">
            Last synced: <span className="font-medium text-[hsl(var(--fg))]">{syncTimeLabel}</span>
          </p>
        </div>
      )}

      {/* Connected data preview */}
      {connected && (
        <div className="grid gap-2 grid-cols-3">
          <div className="rounded-[12px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.6)] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Reads</p>
            <p className="mt-0.5 text-[12px] font-medium text-[hsl(var(--fg))]">Body, activity</p>
          </div>
          <div className="rounded-[12px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.6)] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Writes</p>
            <p className="mt-0.5 text-[12px] font-medium text-[hsl(var(--fg))]">Weight, nutrition</p>
          </div>
          <div className="rounded-[12px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.6)] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Today</p>
            <p className="mt-0.5 text-[12px] font-medium text-[hsl(var(--fg))]">
              {todayData ? `${todayData.steps?.toLocaleString?.() || 0} steps` : 'Sync to see'}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {syncError && (
        <div className="rounded-[12px] border border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.04)] px-4 py-3">
          <p className="text-[13px] text-[hsl(var(--err))]">{syncError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {connected ? (
          <>
            <Button onClick={handleSync} disabled={syncing} size="sm" className="gap-2">
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync now
            </Button>
            <Button onClick={handleDisconnect} variant="outline" size="sm">
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={handleConnect} disabled={loading || !available} size="sm" className="gap-2">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings2 className="h-3.5 w-3.5" />}
            Connect Apple Health
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Integrations page ───────────────────────────────────────────────────── */

export default function Integrations() {
  const navigate = useNavigate();

  return (
    <SafePageBoundary title="Integrations" maxWidth="max-w-2xl" fallbackDescription="Manage connected services and sync state.">
      <PageShell
        title="Integrations"
        subtitle="Connect external services to sync health and activity data into Atlas."
        maxWidth="max-w-2xl"
        actions={(
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      >
        {/* ── Live integrations ──────────────────────────────────────────── */}
        <SectionCard title="Connected" subtitle="Services actively syncing with Atlas.">
          <AppleHealthCard />
        </SectionCard>

        {/* ── Roadmap ────────────────────────────────────────────────────── */}
        <SectionCard title="Coming soon" subtitle="Planned integrations. Not yet available.">
          <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.4)]">
            {ROADMAP_INTEGRATIONS.map((item, i) => (
              <IntegrationRoadmapRow
                key={item.id}
                item={item}
                isLast={i === ROADMAP_INTEGRATIONS.length - 1}
              />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[hsl(var(--fg-3))]">
            Integrations are added based on user demand. Follow our changelog for updates.
          </p>
        </SectionCard>
      </PageShell>
    </SafePageBoundary>
  );
}
