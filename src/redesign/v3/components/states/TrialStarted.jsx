import React from 'react';
import EmptyStateShell from './EmptyStateShell.jsx';

export default function TrialStarted({
  dark = false,
  onContinue,
}) {
  return (
    <EmptyStateShell
      dark={dark}
      eyebrow="Trial started"
      title="Your premium trial is live."
      description="Jump back into Today and use the upgraded coach, labs, and protocol features while the trial is active."
      primaryLabel="Go to Today"
      onPrimary={onContinue}
    />
  );
}
