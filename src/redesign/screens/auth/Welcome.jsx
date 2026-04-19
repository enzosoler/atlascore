import React from 'react';
import { FullScreenShell } from '../../layouts';
import { WelcomeHero } from '../../modules';

export default function Welcome() {
  return (
    <FullScreenShell>
      <WelcomeHero onStart={() => { /* route to /auth/signup */ }} onSignIn={() => { /* route to /auth */ }} />
    </FullScreenShell>
  );
}
