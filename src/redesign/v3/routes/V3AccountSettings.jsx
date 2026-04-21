import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
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
  const t = useT();

  const [providers, setProviders] = useState([
    { id: 'apple', name: t('accountSettings.providers.apple'), connected: false },
    { id: 'google', name: t('accountSettings.providers.google'), connected: false },
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
          name: t('accountSettings.providers.apple'),
          connected: byId.get('apple_health')?.status === 'connected',
        },
        {
          id: 'google',
          name: t('accountSettings.providers.google'),
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
  }, [t, user?.id]);

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
        name: t('accountSettings.providers.apple'),
        connected: byId.get('apple_health')?.status === 'connected',
      },
      {
        id: 'google',
        name: t('accountSettings.providers.google'),
        connected: byId.get('google_fit')?.status === 'connected',
      },
    ]);
  }

  async function handleChangeEmail() {
    const nextEmail = window.prompt(t('accountSettings.prompts.changeEmail'), email);
    if (!nextEmail || nextEmail === email) return;

    try {
      const { error } = await supabase.auth.updateUser({ email: nextEmail.trim() });
      if (error) throw error;
      toast.success(t('accountSettings.toasts.emailUpdateRequested'), {
        description: t('accountSettings.toasts.checkEmailConfirm', { email: nextEmail.trim() }),
      });
    } catch (err) {
      toast.error(t('accountSettings.toasts.emailUpdateFailed'), {
        description: err?.message || t('common.tryAgain'),
      });
    }
  }

  async function handleChangePassword() {
    if (!email) {
      toast.error(t('accountSettings.toasts.noEmail'));
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetPasswordRedirect,
      });
      if (error) throw error;
      toast.success(t('accountSettings.toasts.passwordResetSent'), {
        description: t('accountSettings.toasts.openInboxPassword', { email }),
      });
    } catch (err) {
      toast.error(t('accountSettings.toasts.passwordResetFailed'), {
        description: err?.message || t('common.tryAgain'),
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
            t('accountSettings.prompts.disable2fa'),
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
        toast.success(t('accountSettings.toasts.twoFactorDisabled'));
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
        t('accountSettings.prompts.enable2fa', { secret: enrollData?.totp?.secret || '' }),
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
      toast.success(t('accountSettings.toasts.twoFactorEnabled'));
    } catch (err) {
      toast.error(t('accountSettings.toasts.twoFactorFailed'), {
        description: err?.message || t('common.tryAgain'),
      });
    }
  }

  async function handleLinkProvider(providerId) {
    const serviceId = providerServiceIds[providerId];
    if (!serviceId) return;
    const result = await connectProvider(serviceId, user?.id);
    if (!result?.success) {
      toast.error(t('accountSettings.toasts.connectionFailed'), {
        description: result?.message || t('common.tryAgain'),
      });
      return;
    }
    await refreshProviders();
    toast.success(t(providerId === 'apple' ? 'accountSettings.toasts.appleStarted' : 'accountSettings.toasts.googleStarted'), {
      description: result?.message || t('accountSettings.toasts.finishProviderFlow'),
    });
  }

  async function handleUnlinkProvider(providerId) {
    const serviceId = providerServiceIds[providerId];
    if (!serviceId) return;
    const result = await disconnectProvider(serviceId, user?.id);
    if (!result?.success) {
      toast.error(t('accountSettings.toasts.disconnectFailed'), {
        description: result?.message || t('common.tryAgain'),
      });
      return;
    }
    await refreshProviders();
    toast.success(t(providerId === 'apple' ? 'accountSettings.toasts.appleDisconnected' : 'accountSettings.toasts.googleDisconnected'));
  }

  async function handleManageSessions() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      toast.success(t('accountSettings.toasts.sessionsRevoked'), {
        description: t('accountSettings.toasts.thisDeviceActive'),
      });
    } catch (err) {
      toast.error(t('accountSettings.toasts.sessionsRevokeFailed'), {
        description: err?.message || t('common.tryAgain'),
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
