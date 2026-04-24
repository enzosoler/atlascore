import React from 'react';
import EmptyStateShell from './EmptyStateShell.jsx';

export default function FeatureLocked({
  dark = false,
  title = 'Premium feature',
  description = 'This surface unlocks once you upgrade from the free core loop.',
  ctaLabel = 'View plans',
  onUpgrade,
}) {
  return (
    <EmptyStateShell
      dark={dark}
      eyebrow="Locked"
      title={title}
      description={description}
      primaryLabel={ctaLabel}
      onPrimary={onUpgrade}
    />
  );
}
