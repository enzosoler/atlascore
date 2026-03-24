import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy, Target, Calendar, Star, Zap } from 'lucide-react';

const MILESTONES = [
  { id: 1, icon: Flame, title: '7 Day Streak', desc: 'Logged for 7 days in a row', achieved: true, date: 'Jan 15' },
  { id: 2, icon: Trophy, title: 'First Workout', desc: 'Completed your first workout', achieved: true, date: 'Jan 10' },
  { id: 3, icon: Target, title: 'Goal Crusher', desc: 'Hit 5 goals in one week', achieved: true, date: 'Jan 20' },
  { id: 4, icon: Zap, title: 'Power User', desc: '30 days of activity', achieved: false, progress: '22/30' },
  { id: 5, icon: Star, title: 'Elite Status', desc: 'Complete 100 workouts', achieved: false, progress: '67/100' },
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreaksMilestones() {
  const navigate = useNavigate();
  const currentStreak = 12;
  const longestStreak = 21;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Progress</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{currentStreak}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">Day Streak</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[hsl(var(--fg-2))]">Best: {longestStreak} days</p>
              </div>
            </div>
            <div className="flex justify-between">
              {WEEK_DAYS.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i < 5 ? 'bg-orange-500 text-white' : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]'
                  }`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-[hsl(var(--fg-3))]">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
            Milestones
          </h2>
          <div className="space-y-3">
            {MILESTONES.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  milestone.achieved
                    ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                    : 'border-dashed border-[hsl(var(--border))] bg-[hsl(var(--fill))]/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${milestone.achieved ? 'bg-[hsl(var(--accent-primary))]/20' : 'bg-[hsl(var(--fill))]'}`}>
                  <milestone.icon className={`w-5 h-5 ${milestone.achieved ? 'text-[hsl(var(--accent-primary))]' : 'text-[hsl(var(--fg-3))]'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${milestone.achieved ? '' : 'text-[hsl(var(--fg-2))]'}`}>{milestone.title}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{milestone.desc}</p>
                </div>
                {milestone.achieved ? (
                  <span className="text-xs text-[hsl(var(--fg-3))]">{milestone.date}</span>
                ) : (
                  <span className="text-xs text-[hsl(var(--accent-primary))]">{milestone.progress}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
