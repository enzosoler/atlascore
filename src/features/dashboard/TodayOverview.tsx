import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, MapPin } from 'lucide-react';

interface TodayOverviewProps {
  userName: string;
  streak: number;
}

export default function TodayOverview({ userName, streak }: TodayOverviewProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
      <div className="space-y-1">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[hsl(var(--fg-3))] font-medium text-xs uppercase tracking-widest"
        >
          <Calendar size={14} />
          {today}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black text-[hsl(var(--fg))] tracking-tight"
        >
          Morning, {userName}
        </motion.h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 bg-[hsl(var(--card)/0.5)] backdrop-blur-md border border-[hsl(var(--border)/0.5)] px-4 py-2 rounded-2xl"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[hsl(var(--fg-3))] uppercase tracking-tighter">Current Streak</span>
          <span className="text-xl font-black text-[hsl(var(--fg))]">{streak} Days</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
          <Flame size={20} fill="currentColor" />
        </div>
      </motion.div>
    </div>
  );
}
