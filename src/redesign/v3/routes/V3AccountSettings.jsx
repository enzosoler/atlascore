import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
  connectProvider,
  disconnectProvider,
  getIntegrationConnections,
} from '@/lib/integrationsService';
import S63_Account_Settings from '../screens/S63_Account_Settings.jsx';

export default function V3AccountSettings() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [providers, setProviders] = useState([
    { id: 'apple', name: 'Apple Health', connected: false },
    { id: 'google', name: 'Google Fit', connected: false },
  ]);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProviders() {
      if (!user?.id) return;
      const connections = await getIntegrationConnections(user.id);
      if (cancelled) return;
      const byId = new Map(connections.map((row) => [row.id, row]));
      setProviders([
        {
          id: 'apple',
          name: 'Apple Health',
          connected: byId.get('apple_health')?.status === 'connected',
        },
        {
          id: 'google',
          name: 'Google Fit',
          connected: byId.get('google_fit')?.status === 'connected',
        },
      ]);

      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (!cancelled) {
        setMfaEnabled(Boolean(factors?.totp?.length || factors?.phone?.length || factors?.webauthn?.length));
      }
    }

    loadProviders();
    return () => { cancelled = true; };
  }, [user?.id]);

  const sessionsCount = user ? 1 : 0;
  const resetPasswordRedirect = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/reset-password`
    : undefined;

  const email = user?.email || '';

  const providerServiceIds = useMemo(() => ({
    apple: 'apple_health',
    google: 'google_fit',
  }), []);

  async function refreshProviders() {
    if (!user?.id) return;
    const connections = await getIntegrationConnections(user.id);
    const byId = new Map(connections.map((row) => [row.id, row]));
    setProviders([
      {
        id: 'apple',
        name: 'Apple Health',
        connected: byId.get('apple_health')?.status === 'connected',
      },
      {
        id: 'google',
        name: 'Google Fit',
        connected: byId.get('google_fit')?.status === 'connected',
      },
    ]);
  }

  async function handleChangeEmail() {
    const nextEmail = window.prompt('Enter your new email address.', email);
    if (!nextEmail || nextEmail === email) return;

    try {
      const { error } = await supabase.auth.updateUser({ email: nextEmail.trim() });
      if (error) throw error;
      toast.success('Email update requested', {
        description: `Check ${nextEmail.trim()} to confirm the change.`,
      });
    } catch (err) {
      toast.error('Could not update email', {
        description: err?.message || 'Try again.',
      });
    }
  }

  async function handleChangePassword() {
    if (!email) {
      toast.error('No email found for this account');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetPasswordRedirect,
      });
      if (error) throw error;
      toast.success('Password reset email sent', {
        description: `Open ${email} to set a new password.`,
      });
    } catch (err) {
      toast.error('Could not send reset email', {
        description: err?.message || 'Try again.',
      });
    }
  }

  async function handleToggle2FA() {
    try {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const verifiedFactor = factors?.totp?.[0] || factors?.phone?.[0] || factors?.webauthn?.[0] || null;

      if (verifiedFactor) {
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalError) throw aalError;

        if (aalData?.currentLevel !== 'aal2') {
          const disableCode = window.prompt(
            'Enter the 6-digit code from your authenticator app to disable two-factor authentication.',
            ''
          );
          if (!disableCode) return;
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: verifiedFactor.id,
          });
          if (challengeError) throw challengeError;
          const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId: verifiedFactor.id,
            challengeId: challengeData.id,
            code: disableCode.trim(),
          });
          if (verifyError) throw verifyError;
        }

        const { error: disableError } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
        if (disableError) throw disableError;
        setMfaEnabled(false);
        toast.success('Two-factor disabled');
        return;
      }

      const unverifiedTotp = (factors?.all || []).filter(
        (factor) => factor.factor_type === 'totp' && factor.status === 'unverified'
      );
      for (const factor of unverifiedTotp) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'atlas.core',
        issuer: 'atlas.core',
      });
      if (enrollError) throw enrollError;

      if (enrollData?.totp?.qr_code) {
        window.open(enrollData.totp.qr_code, '_blank', 'noopener,noreferrer');
      }

      const code = window.prompt(
        `Scan the QR code in your authenticator app, or use this secret: ${enrollData?.totp?.secret || ''}\n\nEnter the 6-digit code to verify.`,
        ''
      );
      if (!code) return;

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        challengeId: challengeData.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      toast.success('Two-factor enabled');
    } catch (err) {
      toast.error('Two-factor update failed', {
        description: err?.message || 'Try again.',
      });
    }
  }

  async function handleLinkProvider(providerId) {
    const serviceId = providerServiceIds[providerId];
    if (!serviceId) return;
    const result = await connectProvider(serviceId, user?.id);
    if (!result?.success) {
      toast.error('Connection failed', {
        description: result?.message || 'Try again.',
      });
      return;
    }
    await refreshProviders();
    toast.success(`${providerId === 'apple' ? 'Apple Health' : 'Google Fit'} connection started`, {
      description: result?.message || 'Finish the provider flow to complete setup.',
    });
  }

  async function handleUnlinkProvider(providerId) {
    const serviceId = providerServiceIds[providerId];
    if (!serviceId) return;
    const result = await disconnectProvider(serviceId, user?.id);
    if (!result?.success) {
      toast.error('Disconnect failed', {
        description: result?.message || 'Try again.',
      });
      return;
    }
    await refreshProviders();
    toast.success(`${providerId === 'apple' ? 'Apple Health' : 'Google Fit'} disconnected`);
  }

  async function handleManageSessions() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      toast.success('Signed out other sessions', {
        description: 'This device stays active.',
      });
    } catch (err) {
      toast.error('Could not revoke other sessions', {
        description: err?.message || 'Try again.',
      });
    }
  }

  return (
    <S63_Account_Settings
      dark={theme === 'dark'}
      email={email}
      twoFactorEnabled={mfaEnabled}
      sessionsCount={sessionsCount}
      providers={providers}
      onChangeEmail={handleChangeEmail}
      onChangePassword={handleChangePassword}
      onToggle2FA={handleToggle2FA}
      onLinkProvider={handleLinkProvider}
      onUnlinkProvider={handleUnlinkProvider}
      onManageSessions={handleManageSessions}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
