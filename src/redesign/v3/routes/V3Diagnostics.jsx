import React from 'react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { WebAccountRow, WebAccountScaffold, WebAccountSection } from './WebAccountScaffold.jsx';

export default function V3Diagnostics() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { locale } = useI18n();
  const t = useT();

  const appVersion = typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION
    ? import.meta.env.VITE_APP_VERSION
    : 'dev';

  const diagnosticsPayload = {
    version: appVersion,
    locale,
    theme,
    platform: Capacitor.isNativePlatform() ? 'native' : 'web',
    url: typeof window !== 'undefined' ? window.location.href : '',
    userId: user?.id || null,
    email: user?.email || null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  async function handleCopyDiagnostics() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticsPayload, null, 2));
      toast.success(t('diagnosticsPage.copied'));
    } catch (error) {
      toast.error(t('diagnosticsPage.copyFailed'), {
        description: error?.message || t('common.tryAgain'),
      });
    }
  }

  return (
    <WebAccountScaffold
      eyebrow={t('diagnosticsPage.eyebrow')}
      title={t('diagnosticsPage.heading')}
      description={t('diagnosticsPage.description')}
      backTo="/webapp/settings"
      backLabel={t('dangerZone.backToSettings')}
    >
      <WebAccountSection title={t('diagnosticsPage.sections.runtime')}>
        <div style={{ borderTop: 'none' }}>
          <WebAccountRow title={t('diagnosticsPage.rows.version')} description={appVersion} />
        </div>
        <WebAccountRow title={t('diagnosticsPage.rows.platform')} description={diagnosticsPayload.platform} />
        <WebAccountRow title={t('diagnosticsPage.rows.locale')} description={locale} />
        <WebAccountRow title={t('diagnosticsPage.rows.theme')} description={theme} />
      </WebAccountSection>

      <WebAccountSection title={t('diagnosticsPage.sections.session')}>
        <div style={{ borderTop: 'none' }}>
          <WebAccountRow title={t('diagnosticsPage.rows.email')} description={user?.email || '—'} />
        </div>
        <WebAccountRow title={t('diagnosticsPage.rows.userId')} description={user?.id || '—'} />
        <WebAccountRow
          title={t('diagnosticsPage.rows.copy')}
          description={t('diagnosticsPage.rows.copyDesc')}
          actionLabel={t('diagnosticsPage.actions.copy')}
          onAction={handleCopyDiagnostics}
        />
      </WebAccountSection>
    </WebAccountScaffold>
  );
}
