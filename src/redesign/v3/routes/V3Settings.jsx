import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { openSubscriptionManagement } from '@/lib/revenueCat';
import S19_Settings from '../screens/S19_Settings.jsx';

const LANGUAGE_LABELS = { en: 'English', 'pt-BR': 'Português (Brasil)' };

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

function memberSinceLabel(value, locale, t) {
  if (!value) return t('settings.v3.memberRecently');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('settings.v3.memberRecently');
  const formatted = date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
  return t('settings.v3.memberSince', { date: formatted });
}

export default function V3Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { locale, switchLocale } = useI18n();
  const t = useT();
  const { user, logout } = useAuth();
  const realUser = buildRealUser(user);
  const currentLanguageLabel = LANGUAGE_LABELS[locale] || LANGUAGE_LABELS.en;
  const currentThemeLabel = theme === 'dark' ? 'dark' : 'light';

  const groups = [
    {
      l: t('settings.v3.sections.account'),
      rows: [
        {
          k: 'profile',
          t: realUser?.name || t('settings.v3.rows.yourProfile'),
          d: [realUser?.email, memberSinceLabel(realUser?.memberSince, locale, t)].filter(Boolean).join(' · '),
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
        { k: 'theme',    t: t('settings.v3.rows.appearance'),    d: t('settings.v3.rows.appearanceDesc', { theme: currentThemeLabel }), chevron: true },
        { k: 'language', t: t('settings.v3.rows.language'),      d: t('settings.v3.rows.languageDesc', { language: currentLanguageLabel }), chevron: true },
        { k: 'notifs',   t: t('settings.v3.rows.notifications'), d: t('settings.v3.rows.notificationsDesc'), chevron: false, muted: true },
        { k: 'goals',    t: t('settings.v3.rows.dailyTargets'),  d: t('settings.v3.rows.dailyTargetsDesc'), chevron: true },
      ],
    },
    {
      l: t('settings.v3.sections.dataPrivacy'),
      rows: [
        { k: 'export', t: t('settings.v3.rows.exportData'),      d: t('settings.v3.rows.exportDataDesc'), chevron: true },
        { k: 'photos', t: t('settings.v3.rows.progressPhotos'),  d: t('settings.v3.rows.progressPhotosDesc'), chevron: true, chip: 'Local' },
        { k: 'delete', t: t('settings.v3.rows.dangerZone'),      d: t('settings.v3.rows.dangerZoneDesc'), chevron: true, danger: true },
      ],
    },
  ];

  const routeMap = {
    profile: '/app/profile',
    plan: '/app/billing',
    integrations: '/app/settings/integrations',
    // theme is handled directly in onOpenRow (toggle, no navigation)
    goals: '/app/nutrition/targets',
    export: '/app/export',
    photos: '/app/body/progress/photos',
    delete: '/app/settings/danger',
  };

  return (
    <S19_Settings
      dark={theme === 'dark'}
      versionLabel={typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION ? `v ${import.meta.env.VITE_APP_VERSION}` : 'v current'}
      groups={groups}
      onOpenRow={async (key) => {
        // Theme toggle works directly — no sub-screen needed
        if (key === 'theme') {
          const nextTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(nextTheme);
          toast(t('settings.v3.toasts.themeSwitch', { theme: nextTheme }));
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
          if (!handled) navigate('/app/billing');
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
