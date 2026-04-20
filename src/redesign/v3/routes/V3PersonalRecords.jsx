/**
 * V3PersonalRecords - Personal records gallery with real data integration.
 * 
 * Connects S20_PR_Gallery to actual workout history service
 * and provides interactive PR viewing and sharing.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { fetchRecentWorkoutHistory, computePersonalRecords } from '@/services/workoutHistoryService';
import S20_PR_Gallery from '../screens/S20_PR_Gallery.jsx';

export default function V3PersonalRecords() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prs, setPrs] = useState([]);
  const [summary, setSummary] = useState(null);

  // Category mapping for exercise classification
  function categorizeExercise(exerciseName) {
    const name = (exerciseName || '').toLowerCase();
    if (name.includes('squat') || name.includes('front squat')) return 'Squat';
    if (name.includes('bench') || name.includes('press') && name.includes('bench')) return 'Bench';
    if (name.includes('deadlift') || name.includes('dead')) return 'Deadlift';
    if (name.includes('overhead') || name.includes('press') && !name.includes('bench')) return 'Press';
    return 'Accessory';
  }

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'today';
    if (daysDiff === 1) return '1d ago';
    if (daysDiff < 7) return `${daysDiff}d ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Load PR data from workout history
  useEffect(() => {
    async function loadPRs() {
      if (!user) return;
      
      setLoading(true);
      try {
        const workouts = await fetchRecentWorkoutHistory(user.id);
        const records = computePersonalRecords(workouts);
        
        // Transform records into PR gallery format
        const prList = Object.entries(records).map(([exercise, record]) => {
          const now = new Date();
          const recordDate = new Date(record.date);
          const daysDiff = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
          
          return {
            lift: exercise.charAt(0).toUpperCase() + exercise.slice(1),
            w: record.bestWeight?.toString() || '0',
            u: `lb × ${record.bestReps || 1}`,
            e1rm: record.bestWeight?.toString() || '0',
            date: formatDate(record.date),
            days: formatDate(record.date),
            fresh: daysDiff < 7, // Fresh if within last week
            category: categorizeExercise(exercise)
          };
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date

        // Calculate summary stats
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const monthPRs = prList.filter(pr => {
          const prDate = new Date(pr.date);
          const now = new Date();
          return prDate.getMonth() === now.getMonth() && prDate.getFullYear() === now.getFullYear();
        });

        const biggestPR = prList.length > 0 ? prList.reduce((max, pr) => 
          (parseInt(pr.w) || 0) > (parseInt(max.w) || 0) ? pr : max
        ) : null;

        setSummary({
          monthLabel: `${new Date().toLocaleDateString('en-US', { month: 'long' })} PRs`,
          count: monthPRs.length,
          tonnage: `${Math.floor(prList.reduce((sum, pr) => sum + (parseInt(pr.w) || 0), 0) / 1000)} total tonnes`,
          biggestLift: biggestPR?.w || '0',
          biggestUnit: 'lb',
          biggestLiftName: `${biggestPR?.lift || 'None'} · ${biggestPR?.days || 'never'}`,
          delta: '+5 lb vs last month', // Would need historical comparison
          yearCount: prList.length
        });

        setPrs(prList);
      } catch (error) {
        console.error('Failed to load PRs:', error);
        toast.error('Failed to load personal records');
      } finally {
        setLoading(false);
      }
    }

    loadPRs();
  }, [user]);

  function handleOpenPR(pr) {
    // Navigate to detailed PR view or workout session
    toast(`Opening ${pr.lift} PR details`);
    // Could navigate to specific workout: navigate(`/app/workouts/${pr.workoutId}`)
  }

  function handleSharePR(pr) {
    // Navigate to share PR route with PR data
    const prData = {
      lift: pr.lift,
      weight: pr.w,
      reps: pr.u.includes('×') ? pr.u.split('×')[1].trim() : '1',
      date: pr.date,
      e1rm: pr.e1rm,
      rpe: '9.0', // Would come from actual data
      bodyweight: '182', // Would come from user profile
      improvement: '+5', // Would calculate from previous PR
      days: pr.days
    };
    
    navigate('/app/workouts/share', { state: { prData } });
  }

  if (loading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: theme === 'dark' ? '#0a0a0a' : '#efe9da',
        color: theme === 'dark' ? '#efe9da' : '#0a0a0a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Loading personal records...</div>
        </div>
      </div>
    );
  }

  return (
    <S20_PR_Gallery
      dark={theme === 'dark'}
      prs={prs}
      summary={summary}
      filterCategories={['All lifts', 'Squat', 'Bench', 'Deadlift', 'Press', 'Accessory']}
      onOpenPR={handleOpenPR}
      showTabBar={false}
    />
  );
}
