import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { presentCustomerCenter, isRevenueCatAvailable } from '@/lib/revenueCat';
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

function memberSinceLabel(value) {
  if (!value) return 'member recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'member recently';
  return `member since ${date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}`;
}

export default function V3Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const realUser = buildRealUser(user);

  const groups = [
    {
      l: 'Account',
      rows: [
        {
          k: 'profile',
          t: realUser?.name || 'Your profile',
          d: [realUser?.email, memberSinceLabel(realUser?.memberSince)].filter(Boolean).join(' · '),
          chevron: true,
          avatar: true,
        },
        {
          k: 'plan',
          t: realUser?.tier && realUser.tier !== 'Free' ? `${realUser.tier} plan` : 'Subscription',
          d: realUser?.tier && realUser.tier !== 'Free' ? `${realUser.tier} access active` : 'Upgrade, manage billing, restore access',
          chevron: true,
          chip: realUser?.tier && realUser.tier !== 'Free' ? realUser.tier : undefined,
        },
      ],
    },
    {
      l: 'Integrations',
      rows: [
        { k: 'integrations', t: 'Connected services', d: 'Apple Health, wearables · improves readiness accuracy', chevron: true, dot: 'on' },
      ],
    },
    {
      l: 'Preferences',
      rows: [
        { k: 'theme',  t: 'Appearance',    d: `Currently ${theme === 'dark' ? 'dark' : 'light'} · tap to switch`, chevron: true },
        { k: 'notifs', t: 'Notifications', d: 'Coming soon', chevron: false, muted: true },
        { k: 'goals',  t: 'Daily targets', d: 'Drives your daily protein target · used by Today', chevron: true },
      ],
    },
    {
      l: 'Data & privacy',
      rows: [
        { k: 'export', t: 'Export data',      d: 'Download your logs and history', chevron: true },
        { k: 'photos', t: 'Progress photos',  d: 'Body trend tracking · used by composition system', chevron: true, chip: 'Local' },
        { k: 'delete', t: 'Danger zone',      d: 'Delete account and reset data', chevron: true, danger: true },
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
      onOpenRow={(key) => {
        // Theme toggle works directly — no sub-screen needed
        if (key === 'theme') {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          toast(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
          return;
        }
        // Native subscription management — open RevenueCat customer center
        if (key === 'plan' && Capacitor.isNativePlatform() && isRevenueCatAvailable()) {
          presentCustomerCenter().catch(() => {
            toast.error('Could not open subscription manager');
          });
          return;
        }

        // Routes that exist
        const next = routeMap[key];
        if (next) {
          navigate(next);
        } else {
          toast('This feature is coming soon');
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
