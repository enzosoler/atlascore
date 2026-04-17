import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Flame } from 'lucide-react';

const TABS = ['Weekly', 'Monthly', 'All Time'];

const LEADERS = [
  { id: 1, name: 'Alex M.', workouts: 45, streak: 12, avatar: 'A' },
  { id: 2, name: 'Sarah K.', workouts: 42, streak: 8, avatar: 'S' },
  { id: 3, name: 'Mike R.', workouts: 38, streak: 15, avatar: 'M' },
  { id: 4, name: 'You', workouts: 35, streak: 7, avatar: 'Y', isUser: true },
  { id: 5, name: 'John D.', workouts: 32, streak: 5, avatar: 'J' },
  { id: 6, name: 'Lisa P.', workouts: 28, streak: 3, avatar: 'L' },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Weekly');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Leaderboard</h1>
        <Trophy className="w-5 h-5 text-yellow-500 ml-auto" />
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[hsl(var(--accent-primary))] text-white'
                    : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg))]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {LEADERS.map((user, index) => (
              <div
                key={user.id}
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  user.isUser
                    ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {index === 0 ? (
                    <Medal className="w-6 h-6 text-yellow-500" />
                  ) : index === 1 ? (
                    <Medal className="w-6 h-6 text-gray-400" />
                  ) : index === 2 ? (
                    <Medal className="w-6 h-6 text-amber-600" />
                  ) : (
                    <span className="text-sm font-medium text-[hsl(var(--fg-3))]">{index + 1}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-semibold">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${user.isUser ? 'text-[hsl(var(--accent-primary))]' : ''}`}>
                    {user.name} {user.isUser && '(You)'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--fg-2))]">
                    <span>{user.workouts} workouts</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {user.streak} day streak
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--fill))] text-center">
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Complete 3 more workouts this week to move up!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
