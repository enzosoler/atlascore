import React, { useState } from 'react';
import { AuthShell } from '../../layouts';
import { AuthPanel } from '../../modules';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  return (
    <AuthShell>
      <AuthPanel
        mode={mode}
        loading={loading}
        error={error}
        onSwitchMode={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
        onSubmit={() => { setLoading(true); setTimeout(() => { setLoading(false); setError(''); }, 800); }}
        onMagic={() => {}}
        onSocial={() => {}}
      />
    </AuthShell>
  );
}

export function Login()        { return <Auth mode="signin" />; }
export function Signup()       { return <Auth mode="signup" />; }
