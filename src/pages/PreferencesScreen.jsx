import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Clock, Calendar, Utensils, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const PREFERENCES = [
  { id: 'workout_time', icon: Clock, title: 'Workout Time', options: ['Morning', 'Afternoon', 'Evening', 'Flexible'] },
  { id: 'workout_days', icon: Calendar, title: 'Workout Days', options: ['3 days/week', '4 days/week', '5 days/week', '6 days/week'] },
  { id: 'diet_type', icon: Utensils, title: 'Diet Preference', options: ['Standard', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'] },
  { id: 'experience', icon: Dumbbell, title: 'Experience Level', options: ['Beginner', 'Intermediate', 'Advanced', 'Elite'] },
];

export default function PreferencesScreen() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({});

  const selectOption = (prefId, option) => {
    setPreferences(prev => ({ ...prev, [prefId]: option }));
  };

  const handleContinue = () => {
    navigate('/onboarding/setup-input');
  };

  const allSelected = PREFERENCES.every(p => preferences[p.id]);

  return (
    <div className="mobile-page bg-[hsl(var(--bg))]">
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
        <AtlasCoreLogoSVG width={32} height={16} />
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="safe-scroll flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 text-sm text-[hsl(var(--accent-primary))] font-medium">Step 2 of 4</div>
          <h1 className="text-2xl font-bold mb-2">Your preferences</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">Help us personalize your experience</p>

          <div className="space-y-6 pb-4">
            {PREFERENCES.map((pref) => (
              <div key={pref.id}>
                <div className="flex items-center gap-2 mb-3">
                  <pref.icon className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                  <p className="font-medium text-sm">{pref.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pref.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => selectOption(pref.id, option)}
                      className={`p-2 rounded-[14px] text-sm border transition-colors ${
                        preferences[pref.id] === option
                          ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))]'
                          : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-4 border-t border-[hsl(var(--border)/0.4)] bg-[hsl(var(--bg)/0.96)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
        <Button onClick={handleContinue} className="w-full" disabled={!allSelected}>
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
