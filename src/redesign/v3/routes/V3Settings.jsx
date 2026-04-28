import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { openSubscriptionManagement } from '@/lib/revenueCat';
import { getAnalyticsConsent, setAnalyticsConsent, subscribeAnalyticsConsent } from '@/lib/analytics';
import { getDefaultUserPreferences, loadUserPreferences, updateUserPreferences } from '@/services/userPreferencesService';
import {
  WEBAPP_BILLING,
  WEBAPP_DANGER,
  WEBAPP_EXPORT,
  WEBAPP_HOME,
} from '@/lib/platformRoutes';
import S19_Settings from '../screens/S19_Settings.jsx';

function buildRealUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  const first = (meta.first_name || '').trim();
  const last = (meta.last_name || '').trim();
  const derivedName =
    [first, last].filter(Boolean).join(' ') ||
    authUser.full_name ||
    (authUser.email ? authUser.email.split('@')[0] : '');
  return {
    name: derivedName,
    email: authUser.email || '',
    memberSince: authUser.raw_user?.created_at || null,
    tier:
      meta.tier ||
      (authUser.atlas_role === 'coach'
        ? 'Coach'
        : authUser.atlas_role === 'admin'
          ? 'Admin'
          : 'Free'),
    providers: (authUser.raw_user?.identities || [])
      .map((i) => i.provider)
      .filter((p) => p && p !== 'email'),
  };
}

export default function V3Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { locale, switchLocale } = useI18n();
  const t = useT();
  const { user, logout } = useAuth();
  const realUser = buildRealUser(user);
  const [preferences, setPreferences] = useState(getDefaultUserPreferences);
  const [analyticsAllowed, setAnalyticsAllowedState] = useState(() => getAnalyticsConsent());
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const currentLanguageLabel = locale === 'pt-BR'
    ? t('settings.v3.labels.languagePortugueseBrazil')
    : t('settings.v3.labels.languageEnglish');
  const currentThemeLabel = theme === 'dark'
    ? t('settings.v3.labels.themeDark')
    : t('settings.v3.labels.themeLight');
  const dailyCheckinRequired = preferences.dailyCheckinRequired !== false;

  useEffect(() => {
    let cancelled = false;

    async function syncPreferences() {
      setPrefsLoading(true);
      const next = await loadUserPreferences(user?.id);
      if (!cancelled) {
        setPreferences(next);
        setPrefsLoading(false);
      }
    }

    syncPreferences();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => subscribeAnalyticsConsent(setAnalyticsAllowedState), []);

  async function setDailyCheckinRequired(nextValue) {
    if (prefsSaving) return;
    const optimistic = { ...preferences, dailyCheckinRequired: nextValue };
    setPreferences(optimistic);
    setPrefsSaving(true);
    try {
      const persisted = await updateUserPreferences(user?.id, { dailyCheckinRequired: nextValue });
      setPreferences(persisted);
      toast(nextValue ? t('settings.v3.toasts.dailyCheckinRequiredOn') : t('settings.v3.toasts.dailyCheckinRequiredOff'));
    } catch (error) {
      setPreferences(preferences);
      toast.error(error?.message || t('settings.v3.toasts.dailyCheckinRequiredError'));
    } finally {
      setPrefsSaving(false);
    }
  }

  function setAnalyticsAllowed(nextValue) {
    setAnalyticsConsent(nextValue);
    setAnalyticsAllowedState(nextValue);
    toast(nextValue ? t('settings.v3.toasts.analyticsOn') : t('settings.v3.toasts.analyticsOff'));
  }

  const groups = [
    {
      l: t('settings.v3.sections.account'),
      rows: [
        {
          k: 'profile',
          t: t('settings.v3.rows.yourProfile'),
          d: t('settings.v3.rows.desktopAccountDesc'),
          chevron: true,
          avatar: true,
        },
        {
          k: 'plan',
          t: realUser?.tier && realUser.tier !== 'Free'
            ? t('settings.v3.rows.planLabel', { tier: realUser.tier })
            : t('settings.v3.rows.subscription'),
          d: realUser?.tier && realUser.tier !== 'Free'
            ? t('settings.v3.rows.planActive', { tier: realUser.tier })
            : t('settings.v3.rows.planUpgrade'),
          chevron: true,
          chip: realUser?.tier && realUser.tier !== 'Free' ? realUser.tier : undefined,
        },
      ],
    },
    {
      l: t('settings.v3.sections.integrations'),
      rows: [
        {
          k: 'integrations',
          t: t('settings.v3.rows.connectedServices'),
          d: t('settings.v3.rows.connectedServicesDesc'),
          chevron: true,
          dot: 'on',
        },
      ],
    },
    {
      l: t('settings.v3.sections.preferences'),
      rows: [
        {
          k: 'daily-checkin-required',
          t: t('settings.v3.rows.dailyCheckinRequired'),
          d: dailyCheckinRequired
            ? t('settings.v3.rows.dailyCheckinRequiredDescOn')
            : t('settings.v3.rows.dailyCheckinRequiredDescOff'),
          toggle: {
            checked: dailyCheckinRequired,
            disabled: prefsLoading || prefsSaving,
            ariaLabel: t('settings.v3.rows.dailyCheckinRequiredAriaLabel'),
          },
        },
        { k: 'theme',    t: t('settings.v3.rows.appearance'),    d: t('settings.v3.rows.appearanceDesc', { theme: currentThemeLabel }), chevron: true },
        { k: 'language', t: t('settings.v3.rows.language'),      d: t('settings.v3.rows.languageDesc', { language: currentLanguageLabel }), chevron: true },
        { k: 'notifs',   t: t('settings.v3.rows.notifications'), d: t('settings.v3.rows.notificationsDesc'), chevron: false, muted: true },
        { k: 'goals',    t: t('settings.v3.rows.dailyTargets'),  d: t('settings.v3.rows.dailyTargetsDesc'), chevron: true },
      ],
    },
    {
      l: t('settings.v3.sections.dataPrivacy'),
      rows: [
        { k: 'export', t: t('settings.v3.rows.exportData'),      d: t('settings.v3.rows.desktopExportDesc'), chevron: true },
        {
          k: 'analytics-consent',
          t: t('settings.v3.rows.analyticsConsent'),
          d: analyticsAllowed
            ? t('settings.v3.rows.analyticsConsentDescOn')
            : t('settings.v3.rows.analyticsConsentDescOff'),
          toggle: {
            checked: analyticsAllowed,
            ariaLabel: t('settings.v3.rows.analyticsConsentAriaLabel'),
          },
        },
        { k: 'photos', t: t('settings.v3.rows.progressPhotos'),  d: t('settings.v3.rows.progressPhotosDesc'), chevron: true, chip: t('settings.v3.rows.localChip') },
        { k: 'delete', t: t('settings.v3.rows.dangerZone'),      d: t('settings.v3.rows.desktopDangerDesc'), chevron: true, danger: true },
      ],
    },
  ];

  const routeMap = {
    profile: WEBAPP_HOME,
    plan: WEBAPP_BILLING,
    integrations: '/app/settings/integrations',
    // theme is handled directly in onOpenRow (toggle, no navigation)
    goals: '/app/nutrition/targets',
    export: WEBAPP_EXPORT,
    photos: '/app/body/progress/photos',
    delete: WEBAPP_DANGER,
  };

  return (
    <S19_Settings
      dark={theme === 'dark'}
      versionLabel={typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION ? `v ${import.meta.env.VITE_APP_VERSION}` : 'v current'}
      groups={groups}
      onOpenRow={async (key) => {
        if (key === 'daily-checkin-required') {
          await setDailyCheckinRequired(!dailyCheckinRequired);
          return;
        }
        if (key === 'analytics-consent') {
          setAnalyticsAllowed(!analyticsAllowed);
          return;
        }
        // Theme toggle works directly — no sub-screen needed
        if (key === 'theme') {
          const nextTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(nextTheme);
          toast(t('settings.v3.toasts.themeSwitch', {
            theme: nextTheme === 'dark'
              ? t('settings.v3.labels.themeDark')
              : t('settings.v3.labels.themeLight'),
          }));
          return;
        }
        // Language: cycle EN ↔ PT in place. switchLocale handles both the
        // main build (state update, dictionaries are bundled) and the /br/
        // build (full nav) correctly.
        if (key === 'language') {
          const next = locale === 'pt-BR' ? 'en' : 'pt-BR';
          switchLocale(next);
          toast(next === 'pt-BR' ? t('settings.v3.toasts.languagePT') : t('settings.v3.toasts.languageEN'));
          return;
        }
        // Subscription management: native sheet on iOS/Android, web page on web.
        if (key === 'plan') {
          const handled = await openSubscriptionManagement();
          if (!handled) navigate(WEBAPP_BILLING);
          return;
        }
        // Routes that exist
        const next = routeMap[key];
        if (next) {
          navigate(next);
        } else {
          toast(t('settings.v3.toasts.comingSoon'));
        }
      }}
      onToggleRow={async (key, checked) => {
        if (key === 'daily-checkin-required') {
          await setDailyCheckinRequired(checked);
        }
        if (key === 'analytics-consent') {
          setAnalyticsAllowed(checked);
        }
      }}
      onSignOut={async () => {
        try {
          await logout?.();
        } finally {
          navigate('/auth/login', { replace: true });
        }
      }}
    />
  );
}
