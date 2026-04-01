import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Check, Loader2, Activity, Moon, Footprints, Flame, Scale, RefreshCw } from 'lucide-react';
import { useHealthKit } from '@/hooks/useHealthKit';
import { useT } from '@/lib/i18nContext';
import { toast } from 'sonner';
import { AppContainer, Card, PageHeader } from '@/components/shared/AppContainer';
import { PrimaryButton, SecondaryButton } from '@/components/shared/StablePage';

function DataTypeRow({ icon: Icon, label, description, color }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{label}</p>
        <p className="text-[11px] text-[hsl(var(--fg-2))] truncate">{description}</p>
      </div>
    </div>
  );
}

function HealthSyncCard() {
  const { available, connected, loading, connect, disconnect, importSnapshot, getTodayActivity, isIOS } = useHealthKit();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    try { return localStorage.getItem('atlas_healthkit_last_sync'); } catch { return null; }
  });
  const [todayData, setTodayData] = useState(null);

  const handleConnect = async () => {
    const granted = await connect();
    if (granted) {
      toast.success('Apple Health connected');
      handleSync();
    } else {
      toast.error('Apple Health permission denied. Check Settings > Privacy > Health.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setTodayData(null);
    toast('Apple Health disconnected');
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const activity = await getTodayActivity();
      if (activity) setTodayData(activity);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      await importSnapshot(thirtyDaysAgo, now);

      const syncTime = new Date().toISOString();
      setLastSync(syncTime);
      localStorage.setItem('atlas_healthkit_last_sync', syncTime);
      toast.success('Health data synced');
    } catch (e) {
      toast.error('Sync failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  if (!isIOS) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">Apple Health</p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">Available on iOS only</p>
          </div>
        </div>
        <p className="text-[12px] text-[hsl(var(--fg-3))]">
          Apple Health integration requires running atlas.core on an iPhone.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">Apple Health</p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              {connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        {connected && <Check className="w-5 h-5 text-[hsl(var(--ok))]" />}
      </div>

      {/* Data types we read */}
      {connected && (
        <div className="border-t border-[hsl(var(--border-h))] pt-3 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] mb-2">Reading from Health</p>
          <DataTypeRow icon={Scale} label="Body Measurements" description="Weight, body fat, height" color="bg-blue-500" />
          <DataTypeRow icon={Footprints} label="Activity" description="Steps, distance, calories burned" color="bg-green-500" />
          <DataTypeRow icon={Activity} label="Heart Rate" description="Resting and active heart rate" color="bg-red-400" />
          <DataTypeRow icon={Moon} label="Sleep" description="Sleep duration and quality" color="bg-indigo-500" />
          <DataTypeRow icon={Flame} label="Workouts" description="Exercises from Watch and other apps" color="bg-orange-500" />
        </div>
      )}

      {/* Today's data preview */}
      {connected && todayData && (
        <div className="border-t border-[hsl(var(--border-h))] pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] mb-2">Today</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
              <p className="text-[16px] font-bold text-[hsl(var(--fg))]">{todayData.steps?.toLocaleString() || '—'}</p>
              <p className="text-[10px] text-[hsl(var(--fg-2))]">steps</p>
            </div>
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
              <p className="text-[16px] font-bold text-[hsl(var(--fg))]">{todayData.activeCalories || '—'}</p>
              <p className="text-[10px] text-[hsl(var(--fg-2))]">kcal active</p>
            </div>
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
              <p className="text-[16px] font-bold text-[hsl(var(--fg))]">{todayData.distance ? (todayData.distance / 1000).toFixed(1) : '—'}</p>
              <p className="text-[10px] text-[hsl(var(--fg-2))]">km</p>
            </div>
          </div>
        </div>
      )}

      {/* Last sync */}
      {connected && lastSync && (
        <p className="text-[11px] text-[hsl(var(--fg-3))]">
          Last synced: {new Date(lastSync).toLocaleString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {connected ? (
          <>
            <SecondaryButton onClick={handleSync} disabled={syncing} className="flex-1 gap-2">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync Now
            </SecondaryButton>
            <SecondaryButton onClick={handleDisconnect} className="text-[hsl(var(--err))]">
              Disconnect
            </SecondaryButton>
          </>
        ) : (
          <PrimaryButton onClick={handleConnect} disabled={loading || !available} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {available ? 'Connect Apple Health' : 'HealthKit not available'}
          </PrimaryButton>
        )}
      </div>
    </Card>
  );
}

export default function ConnectedServices() {
  const navigate = useNavigate();
  const t = useT();

  return (
    <AppContainer maxWidth="max-w-2xl">
      <PageHeader
        eyebrow="Integrations"
        title="Connected Services"
        subtitle="Sync your health and fitness data with external apps."
        actions={
          <SecondaryButton onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </SecondaryButton>
        }
      />

      <HealthSyncCard />

      {/* Future integrations placeholder */}
      <Card className="p-5">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-1">More integrations coming soon</p>
        <p className="text-[12px] text-[hsl(var(--fg-2))]">
          Google Health Connect, Garmin, Fitbit, and Strava integrations are planned for future updates.
        </p>
      </Card>
    </AppContainer>
  );
}
