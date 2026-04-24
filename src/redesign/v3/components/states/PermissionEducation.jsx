import React from 'react';
import EmptyStateShell from './EmptyStateShell.jsx';

export default function PermissionEducation({
  dark = false,
  title = 'Permission required',
  description = 'Enable this permission to unlock the complete experience on your device.',
  primaryLabel = 'Continue',
  secondaryLabel = 'Not now',
  onContinue,
  onSkip,
}) {
  return (
    <EmptyStateShell
      dark={dark}
      eyebrow="Permission"
      title={title}
      description={description}
      primaryLabel={primaryLabel}
      secondaryLabel={secondaryLabel}
      onPrimary={onContinue}
      onSecondary={onSkip}
    />
  );
}
