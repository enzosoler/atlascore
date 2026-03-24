import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Dumbbell, Utensils, Scale, ChevronRight } from 'lucide-react';

const ACTIVITIES = [
  { date: 'Today', items: [
    { icon: Dumbbell, title: 'Chest & Triceps Workout', desc: 'Completed • 45 min • 2,400 lbs', time: '9:00 AM' },
    { icon: Utensils, title: 'Logged Breakfast', desc: '650 kcal • 40g protein', time: '7:30 AM' },
  ]},
  { date: 'Yesterday', items: [
    { icon: Scale, title: 'Weight Check-in', desc: '75.2 kg • -0.3 kg from last week', time: '8:00 AM' },
    { icon: Dumbbell, title: 'Back & Biceps Workout', desc: 'Completed • 50 min • 3,100 lbs', time: '6:00 PM' },
  ]},
  { date: 'Jan 20', items: [
    { icon: Activity, title: 'Progress Photo', desc: 'Front view updated', time: '9:00 AM' },
  ]},
];

export default function ActivityScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Activity</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {ACTIVITIES.map((group, i) => (
            <div key={i} className="mb-6">
              <p className="text-sm font-medium text-[hsl(var(--fg-3))] mb-3 sticky top-0 bg-[hsl(var(--bg))] py-2">
                {group.date}
              </p>
              <div className="space-y-2">
                {group.items.map((item, j) => (
                  <button
                    key={j}
                    className="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-3 hover:border-[hsl(var(--border-h))] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-[hsl(var(--fill))]">
                      <item.icon className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-[hsl(var(--fg-2))]">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[hsl(var(--fg-3))]">{item.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
