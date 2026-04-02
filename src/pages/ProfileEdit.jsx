import React, { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Activity, Dumbbell, Settings } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { loadLocalProfile } from '@/lib/profileUtils';
import { SafePageBoundary, LoadingState, ErrorState } from '@/components/shared/StablePage';
import { AppContainer, PageHeader } from '@/components/shared/AppContainer';
import { Button } from '@/components/ui/button';

const AccountTab = lazy(() => import('@/components/profile/AccountTab'));
const BodyBiometricsTab = lazy(() => import('@/components/profile/BodyBiometricsTab'));
const FitnessSetupTab = lazy(() => import('@/components/profile/FitnessSetupTab'));
const PreferencesTab = lazy(() => import('@/components/profile/PreferencesTab'));

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'body', label: 'Body', icon: Activity },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 rounded-[16px] bg-[hsl(var(--fill)/0.5)] p-1">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-200',
              active
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2 : 1.7} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ProfileEditContent() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'account';
  const [activeTab, setActiveTab] = useState(initialTab);

  const profileScope = user?.email || user?.id || 'anonymous';
  const profileQueryKey = ['profile-stable', profileScope];

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => loadLocalProfile(user),
    enabled: !!user?.id,
  });

  const profileData = profileQuery.data && typeof profileQuery.data === 'object' ? profileQuery.data : null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  if (profileQuery.isLoading) {
    return (
      <AppContainer>
        <LoadingState title="Loading profile" description="Fetching your data..." />
      </AppContainer>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppContainer>
        <ErrorState title="Could not load profile" description="Please try again." />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Profile"
        title="Edit profile"
        subtitle="Manage your account, body data, fitness setup, and preferences."
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--ok)/0.02)]"
      />

      {/* Back link */}
      <div className="mb-5">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.profile} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Tab content */}
      <Suspense fallback={<LoadingState title="Loading..." />}>
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'body' && <BodyBiometricsTab profileData={profileData} profileQueryKey={profileQueryKey} />}
        {activeTab === 'fitness' && <FitnessSetupTab profileData={profileData} profileQueryKey={profileQueryKey} />}
        {activeTab === 'preferences' && <PreferencesTab profileData={profileData} profileQueryKey={profileQueryKey} />}
      </Suspense>
    </AppContainer>
  );
}

export default function ProfileEdit() {
  return (
    <SafePageBoundary title="Edit Profile" maxWidth="max-w-2xl" fallbackDescription="Manage your profile">
      <ProfileEditContent />
    </SafePageBoundary>
  );
}
