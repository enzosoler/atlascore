import React from 'react';
import { FullScreenShell, MarketingShell } from '../../layouts';
import { Button } from '../../ui';
import { PermissionRequest, EmptyState, OfflineState } from '../../ui';

export function NotFound() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
        <p className="text-rd-overline uppercase tracking-[0.12em] text-rd-fg-muted">Error 404</p>
        <h1 className="mt-3 text-rd-display-md text-rd-fg">Lost this one.</h1>
        <p className="mt-2 text-[15px] text-rd-fg-muted">The page you're looking for isn't here. It might have moved or never existed.</p>
        <div className="mt-6"><Button intent="primary">Back home</Button></div>
      </div>
    </MarketingShell>
  );
}

export function ServerError() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
        <p className="text-rd-overline uppercase tracking-[0.12em] text-rd-fg-muted">Error 500</p>
        <h1 className="mt-3 text-rd-display-md text-rd-fg">That's on us.</h1>
        <p className="mt-2 text-[15px] text-rd-fg-muted">Something broke on our end. We've been notified. Please try again in a minute.</p>
        <div className="mt-6"><Button intent="primary">Retry</Button></div>
      </div>
    </MarketingShell>
  );
}

export function Offline() {
  return (
    <FullScreenShell>
      <div className="flex min-h-screen items-center justify-center p-6">
        <OfflineState onRetry={() => {}} />
      </div>
    </FullScreenShell>
  );
}

export function Maintenance() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
        <p className="text-rd-overline uppercase tracking-[0.12em] text-rd-fg-muted">Scheduled</p>
        <h1 className="mt-3 text-rd-display-md text-rd-fg">We'll be right back.</h1>
        <p className="mt-2 text-[15px] text-rd-fg-muted">Performing a quick upgrade. ETA 5 minutes.</p>
      </div>
    </MarketingShell>
  );
}

export function PermissionNotifications() {
  return (
    <FullScreenShell>
      <div className="mx-auto max-w-[420px] p-6 pt-16">
        <PermissionRequest
          title="Stay on track with reminders"
          description="We'll nudge you for workouts, check-ins, and when your trial ends. Two or three per day, max."
          onGrant={() => {}}
          onDecline={() => {}}
        />
      </div>
    </FullScreenShell>
  );
}

export function PermissionCamera() {
  return (
    <FullScreenShell>
      <div className="mx-auto max-w-[420px] p-6 pt-16">
        <PermissionRequest
          title="Scan meals with your camera"
          description="Point your camera at food to auto-fill macros. We never store imagery — processing happens on your device."
          onGrant={() => {}}
          onDecline={() => {}}
        />
      </div>
    </FullScreenShell>
  );
}

export function PermissionHealth() {
  return (
    <FullScreenShell>
      <div className="mx-auto max-w-[420px] p-6 pt-16">
        <PermissionRequest
          title="Connect Apple Health"
          description="Bring in sleep, HRV, and workouts automatically. You choose exactly what to share."
          onGrant={() => {}}
          onDecline={() => {}}
        />
      </div>
    </FullScreenShell>
  );
}

export function Styleguide() {
  return (
    <FullScreenShell>
      <div className="mx-auto max-w-[1100px] p-6">
        <h1 className="text-rd-h1 text-rd-fg">Styleguide</h1>
        <p className="mt-1 text-[13px] text-rd-fg-muted">Dark premium token gallery + components.</p>
      </div>
    </FullScreenShell>
  );
}

export function TokenGallery() { return <Styleguide />; }
export function ComponentGallery() { return <Styleguide />; }
