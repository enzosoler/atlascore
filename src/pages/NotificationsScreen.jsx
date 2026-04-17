import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Trash2, Settings } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, title: 'Workout Reminder', desc: 'Your chest workout is scheduled for today', time: '2 hours ago', read: false, type: 'workout' },
  { id: 2, title: 'Goal Reached!', desc: 'You hit your protein target yesterday', time: '5 hours ago', read: false, type: 'achievement' },
  { id: 3, title: 'New Feature', desc: 'Check out the new progress photo tracking', time: '1 day ago', read: true, type: 'update' },
  { id: 4, title: 'Weekly Summary', desc: 'View your progress from last week', time: '2 days ago', read: true, type: 'summary' },
];

export default function NotificationsScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
        <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[hsl(var(--fg-2))]">{NOTIFICATIONS.filter(n => !n.read).length} unread</p>
            <button className="text-sm text-[hsl(var(--accent-primary))]">Mark all read</button>
          </div>

          <div className="space-y-2">
            {NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  notif.read 
                    ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))]' 
                    : 'border-[hsl(var(--accent-primary))]/30 bg-[hsl(var(--accent-primary))]/5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-[hsl(var(--border))]' : 'bg-[hsl(var(--accent-primary))]'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">{notif.desc}</p>
                  <p className="text-xs text-[hsl(var(--fg-3))] mt-1">{notif.time}</p>
                </div>
                {!notif.read && (
                  <button className="p-1 hover:bg-[hsl(var(--fill))] rounded">
                    <Check className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                  </button>
                )}
                <button className="p-1 hover:bg-[hsl(var(--fill))] rounded">
                  <Trash2 className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
