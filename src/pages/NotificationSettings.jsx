import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Scale, Flame, Clock } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { AppContainer, PageHeader } from '@/components/shared/AppContainer';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import { loadPrefs, savePrefs, scheduleSmartReminders } from '@/services/reminderService';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

function ReminderToggle({ icon: Icon, label, description, enabled, time, onToggle, onTimeChange, color }) {
  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.6)] px-4 py-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${color}`}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">{label}</p>
          <button
            type="button"
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
              enabled ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--fill))]'
            }`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">{description}</p>
        {enabled && (
          <div className="mt-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[hsl(var(--fg-3))]" />
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-[hsl(var(--fg))] outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationSettingsContent() {
  const [config, setConfig] = useState(() => loadPrefs());
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  useEffect(() => {
    notificationService.checkPermissions().then(setPermissionStatus);
  }, []);

  const handleToggle = (key) => {
    const next = { ...config, [key]: !config[key] };
    setConfig(next);
    savePrefs(next);
    scheduleSmartReminders().catch(() => {});
  };

  const handleTimeChange = (key, value) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    savePrefs(next);
    scheduleSmartReminders().catch(() => {});
  };

  const handleRequestPermission = async () => {
    const result = await notificationService.requestPermissions();
    setPermissionStatus(result);
    if (result === 'granted') {
      toast.success('Notifications enabled');
      scheduleSmartReminders().catch(() => {});
    } else {
      toast.error('Notifications denied. Enable them in Settings > atlas.core > Notifications.');
    }
  };

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Settings"
        title="Notifications"
        subtitle="Configure reminders to stay consistent."
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--ok)/0.02)]"
      />

      <div className="mb-5">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.settings} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {permissionStatus !== 'granted' && (
        <div className="mb-6 rounded-[18px] border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Bell className="h-5 w-5 text-[hsl(var(--brand))]" />
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Enable notifications</p>
          </div>
          <p className="text-[13px] text-[hsl(var(--fg-2))] mb-4">
            Get reminders to train, log meals, and weigh in. We only send notifications you configure — no spam.
          </p>
          <Button onClick={handleRequestPermission} className="w-full gap-2">
            <Bell className="h-4 w-4" />
            Allow notifications
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <ReminderToggle
          icon={Scale}
          label="Morning check-in"
          description="Log your weight. Start the day with intent."
          enabled={config.enabled}
          time={config.morningTime}
          onToggle={() => handleToggle('enabled')}
          onTimeChange={(v) => handleTimeChange('morningTime', v)}
          color="bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]"
        />

        <ReminderToggle
          icon={Flame}
          label="Evening closure"
          description="Finish your day. Log meals and check in."
          enabled={config.enabled}
          time={config.eveningTime}
          onToggle={() => handleToggle('enabled')}
          onTimeChange={(v) => handleTimeChange('eveningTime', v)}
          color="bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]"
        />
      </div>

      <p className="mt-4 text-[12px] text-[hsl(var(--fg-3))]">
        Streak warnings and nutrition alerts are sent automatically based on your activity — only when you need them.
      </p>

      {permissionStatus === 'granted' && (
        <p className="mt-6 text-center text-[12px] text-[hsl(var(--fg-3))]">
          Reminders are scheduled locally on your device. No data is sent to our servers.
        </p>
      )}
    </AppContainer>
  );
}

export default function NotificationSettings() {
  return (
    <SafePageBoundary title="Notifications" maxWidth="max-w-2xl" fallbackDescription="Manage your reminders">
      <NotificationSettingsContent />
    </SafePageBoundary>
  );
}
