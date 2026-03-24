import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Lock, Check } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 1, icon: Trophy, name: 'First Steps', desc: 'Complete your first workout', unlocked: true, date: 'Jan 10' },
  { id: 2, icon: Star, name: 'Consistency', desc: 'Log in 7 days in a row', unlocked: true, date: 'Jan 20' },
  { id: 3, icon: Trophy, name: 'Heavy Lifter', desc: 'Lift 10,000 lbs total', unlocked: false, progress: '8,500/10,000' },
  { id: 4, icon: Star, name: 'Nutrition Master', desc: 'Hit protein goal 30 days', unlocked: false, progress: '12/30' },
  { id: 5, icon: Trophy, name: 'Social Butterfly', desc: 'Share 5 workouts', unlocked: false, locked: true },
  { id: 6, icon: Star, name: 'Elite', desc: 'Complete 100 workouts', unlocked: false, progress: '67/100' },
];

export default function Achievements() {
  const navigate = useNavigate();
  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Achievements</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-3xl font-bold">{unlocked}/{total}</p>
            <p className="text-sm text-[hsl(var(--fg-2))]">Achievements Unlocked</p>
          </div>

          <div className="space-y-3">
            {ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  achievement.unlocked
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : achievement.locked
                    ? 'border-[hsl(var(--border))] bg-[hsl(var(--fill))] opacity-50'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  achievement.unlocked ? 'bg-yellow-500/20' : 'bg-[hsl(var(--fill))]'
                }`}>
                  {achievement.locked ? (
                    <Lock className="w-5 h-5 text-[hsl(var(--fg-3))]" />
                  ) : (
                    <achievement.icon className={`w-5 h-5 ${achievement.unlocked ? 'text-yellow-500' : 'text-[hsl(var(--fg-3))]'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${achievement.unlocked ? '' : 'text-[hsl(var(--fg-2))]'}`}>
                    {achievement.name}
                  </p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{achievement.desc}</p>
                  {achievement.progress && (
                    <div className="mt-2">
                      <div className="w-full bg-[hsl(var(--fill))] rounded-full h-1.5">
                        <div 
                          className="bg-[hsl(var(--accent-primary))] rounded-full h-1.5" 
                          style={{ width: `${(parseInt(achievement.progress) / parseInt(achievement.progress.split('/')[1])) * 100}%` }} 
                        />
                      </div>
                      <p className="text-xs text-[hsl(var(--fg-3))] mt-1">{achievement.progress}</p>
                    </div>
                  )}
                </div>
                {achievement.unlocked && <Check className="w-5 h-5 text-green-500" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
