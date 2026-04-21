import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { saveLocalProfile } from '@/lib/profileUtils';
import S67_Profile_Editor from '../screens/S67_Profile_Editor.jsx';

export default function V3ProfileEditor() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const meta = user?.user_metadata || {};

  async function handleSave(updatedProfile) {
    try {
      const nextProfile = {
        first_name: updatedProfile.firstName || '',
        last_name: updatedProfile.lastName || '',
        display_name: updatedProfile.displayName || '',
        bio: updatedProfile.bio || '',
        date_of_birth: updatedProfile.dob || '',
        height: updatedProfile.heightCm ?? '',
        fitness_level: updatedProfile.experience || '',
        training_goal: updatedProfile.primaryGoal || '',
        training_days_per_week: updatedProfile.trainingDaysPerWeek ?? '',
        gender: updatedProfile.gender || '',
        units_system: 'metric',
      };

      await saveLocalProfile(user, user?.id, nextProfile);

      const fullName = [updatedProfile.firstName, updatedProfile.lastName].filter(Boolean).join(' ').trim();
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: updatedProfile.firstName || '',
          last_name: updatedProfile.lastName || '',
          display_name: updatedProfile.displayName || '',
          full_name: fullName || user?.full_name || '',
          bio: updatedProfile.bio || '',
          gender: updatedProfile.gender || '',
          primary_goal: updatedProfile.primaryGoal || '',
          training_days_per_week: updatedProfile.trainingDaysPerWeek ?? null,
        },
      });

      if (error) throw error;

      toast.success('Profile updated');
      navigate(-1);
    } catch (err) {
      toast.error('Could not save profile', {
        description: err?.message || 'Try again.',
      });
    }
  }

  return (
    <S67_Profile_Editor
      dark={theme === 'dark'}
      profile={{
        firstName: meta.first_name || '',
        lastName: meta.last_name || '',
        displayName: meta.display_name || '',
        email: user?.email || '',
        bio: meta.bio || '',
        heightCm: meta.height || '',
        dob: meta.date_of_birth || '',
        gender: meta.gender || '',
        experience: meta.fitness_level || '',
        primaryGoal: meta.primary_goal || '',
        trainingDaysPerWeek: meta.training_days_per_week || 3,
      }}
      onSave={handleSave}
      onChangeAvatar={() => navigate('/app/body/progress/photos')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
