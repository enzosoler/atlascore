import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import S65_Danger_Zone from '../screens/S65_Danger_Zone.jsx';

export default function V3DangerZone() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleResetData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');
      const { error } = await supabase.functions.invoke('reset-user-data', {
        body: {},
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      toast.success('Data reset — account cleared');
      await logout(); // hard redirects to / → auth reads onboarding_completed=false → /onboarding
    } catch (err) {
      console.error('[V3DangerZone] reset error', err);
      toast.error('Reset failed', { description: err?.message || 'Try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    toast('Account deletion requested', {
      description: 'Your account will be deleted within 48h. You have been signed out.',
      duration: 6000,
    });
    await logout();
  };

  return (
    <S65_Danger_Zone
      dark={theme === 'dark'}
      userEmail={user?.email}
      onExportData={() => navigate('/app/export')}
      onResetData={handleResetData}
      onDeleteAccount={handleDeleteAccount}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
