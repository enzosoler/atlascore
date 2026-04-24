import React from 'react';
import EmptyStateShell from './EmptyStateShell.jsx';

export default function SubscriptionSuccess({
  dark = false,
  onContinue,
}) {
  return (
    <EmptyStateShell
      dark={dark}
      eyebrow="Subscription active"
      title="Premium access is now enabled."
      description="Your account has been upgraded. Coach insights, labs analysis, and advanced protocols are now available."
      primaryLabel="Continue"
      onPrimary={onContinue}
    />
  );
}
