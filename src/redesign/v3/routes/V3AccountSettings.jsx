import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { email as emailService } from '@/lib/emailService';
import { useT } from '@/lib/i18nContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import PromptDialog from '@/components/ui/PromptDialog';
import {
  connectProvider,
  disconnectProvider,
  getIntegrationConnections,
} from '@/lib/integrationsService';
import { WEBAPP_DANGER } from '@/lib/platformRoutes';
import { WebAccountRow, WebAccountScaffold, WebAccountSection } from './WebAccountScaffold.jsx';

export default function V3AccountSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT();

  const [providers, setProviders] = useState([
    { id: 'apple', name: t('accountSettings.providers.apple'), connected: false },
    { id: 'google', name: t('accountSettings.providers.google'), connected: false },
  ]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [pendingMfaFactor, setPendingMfaFactor] = useState(null);

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

  function handleChangeEmail() {
    setEmailDialogOpen(true);
  }

  async function submitEmailChange(nextEmail) {
    if (!nextEmail || nextEmail.trim() === email) return;
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
      await emailService.passwordReset({ email });
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
          setPendingMfaFactor(verifiedFactor);
          setMfaDialogOpen(true);
          return;
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

  async function submitMfaDisable(code) {
    if (!code || !pendingMfaFactor) return;
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: pendingMfaFactor.id,
      });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: pendingMfaFactor.id,
        challengeId: challengeData.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      const { error: disableError } = await supabase.auth.mfa.unenroll({ factorId: pendingMfaFactor.id });
      if (disableError) throw disableError;
      setMfaEnabled(false);
      setPendingMfaFactor(null);
      toast.success(t('accountSettings.toasts.twoFactorDisabled'));
    } catch (err) {
      toast.error(t('accountSettings.toasts.twoFactorToggleFailed'), {
        description: err?.message || t('common.tryAgain'),
      });
    }
  }

  return (<>
    <WebAccountScaffold
      eyebrow={t('accountSettingsPage.eyebrow')}
      title={t('accountSettingsPage.heading')}
      description={t('accountSettingsPage.description')}
    >
      <WebAccountSection title={t('accountSettingsPage.sections.access')}>
        <WebAccountRow
          title={t('accountSettingsPage.rows.email')}
          description={email || t('accountSettingsPage.rows.emailMissing')}
          actionLabel={t('accountSettingsPage.actions.changeEmail')}
          onAction={handleChangeEmail}
        />
        <WebAccountRow
          title={t('accountSettingsPage.rows.password')}
          description={t('accountSettingsPage.rows.passwordDesc')}
          actionLabel={t('accountSettingsPage.actions.resetPassword')}
          onAction={handleChangePassword}
        />
        <WebAccountRow
          title={t('accountSettingsPage.rows.twoFactor')}
          description={mfaEnabled ? t('accountSettingsPage.rows.twoFactorOn') : t('accountSettingsPage.rows.twoFactorOff')}
          actionLabel={mfaEnabled ? t('accountSettingsPage.actions.disable') : t('accountSettingsPage.actions.enable')}
          onAction={handleToggle2FA}
        />
      </WebAccountSection>

      <WebAccountSection title={t('accountSettingsPage.sections.connections')}>
        {providers.map((provider, index) => (
          <div key={provider.id} style={{ borderTop: index === 0 ? 'none' : '1px solid rgba(10,10,10,0.08)' }}>
            <WebAccountRow
              title={provider.name}
              description={provider.connected ? t('accountSettingsPage.rows.providerConnected') : t('accountSettingsPage.rows.providerDisconnected')}
              actionLabel={provider.connected ? t('accountSettingsPage.actions.disconnect') : t('accountSettingsPage.actions.connect')}
              onAction={() => (provider.connected ? handleUnlinkProvider(provider.id) : handleLinkProvider(provider.id))}
            />
          </div>
        ))}
      </WebAccountSection>

      <WebAccountSection title={t('accountSettingsPage.sections.sessions')}>
        <WebAccountRow
          title={t('accountSettingsPage.rows.sessions')}
          description={t('accountSettingsPage.rows.sessionsDesc', { count: sessionsCount })}
          actionLabel={t('accountSettingsPage.actions.revokeOthers')}
          onAction={handleManageSessions}
        />
      </WebAccountSection>

      <WebAccountSection title={t('accountSettingsPage.sections.recovery')}>
        <WebAccountRow
          title={t('accountSettingsPage.rows.danger')}
          description={t('accountSettingsPage.rows.dangerDesc')}
          actionLabel={t('accountSettingsPage.actions.openDanger')}
          onAction={() => navigate(WEBAPP_DANGER)}
          danger
        />
      </WebAccountSection>
    </WebAccountScaffold>

    <PromptDialog
      open={emailDialogOpen}
      onOpenChange={setEmailDialogOpen}
      title={t('accountSettings.prompts.changeEmailTitle')}
      description={t('accountSettings.prompts.changeEmail')}
      inputLabel={t('accountSettings.prompts.emailLabel')}
      inputPlaceholder={email}
      defaultValue={email}
      confirmLabel={t('accountSettings.prompts.updateButton')}
      cancelLabel={t('common.cancel')}
      onConfirm={submitEmailChange}
    />

    <PromptDialog
      open={mfaDialogOpen}
      onOpenChange={setMfaDialogOpen}
      title={t('accountSettings.prompts.disable2faTitle')}
      description={t('accountSettings.prompts.disable2fa')}
      inputLabel={t('accountSettings.prompts.codeLabel')}
      inputPlaceholder="000000"
      confirmLabel={t('accountSettings.prompts.disableButton')}
      cancelLabel={t('common.cancel')}
      onConfirm={submitMfaDisable}
    />
  </>
  );
}
