import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--accent-primary)/0.08),transparent_30%),linear-gradient(180deg,hsl(var(--sys-bg))_0%,hsl(var(--sys-bg2))_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-8 shadow-[var(--shadow-md)]">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">Access Restricted</h1>
          <p className="mb-8 text-[hsl(var(--fg-2))]">
            You are not registered to use this application. Please contact the app administrator to request access.
          </p>
          <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.45)] p-4 text-sm text-[hsl(var(--fg-2))]">
            <p>If you believe this is an error, you can:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Verify you are logged in with the correct account</li>
              <li>Contact the app administrator for access</li>
              <li>Try logging out and back in again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
