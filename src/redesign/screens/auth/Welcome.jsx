import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FullScreenShell } from '../../layouts';
import { WelcomeHero } from '../../modules';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <FullScreenShell>
      <div className="rd-scope">
        <WelcomeHero
          onStart={() => navigate('/v2/auth?mode=signup')}
          onSignIn={() => navigate('/v2/auth')}
        />
      </div>
    </FullScreenShell>
  );
}
