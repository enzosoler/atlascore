import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Heart, Share2, Folder, Trash2 } from 'lucide-react';

const COLLECTIONS = [
  { id: 1, name: 'Favorite Workouts', count: 12, icon: Heart },
  { id: 2, name: 'Meal Ideas', count: 8, icon: Bookmark },
  { id: 3, name: 'Research', count: 5, icon: Folder },
];

const SAVED_ITEMS = [
  { id: 1, title: 'Push Pull Legs Routine', type: 'Workout', author: 'Atlas Team', saved: '2 days ago' },
  { id: 2, title: 'High Protein Breakfast Guide', type: 'Nutrition', author: 'Sarah N.', saved: '1 week ago' },
  { id: 3, title: 'Progressive Overload Bible', type: 'Protocol', author: 'Coach Mike', saved: '2 weeks ago' },
  { id: 4, title: 'Mobility Masterclass', type: 'Recovery', author: 'Yoga Jane', saved: '1 month ago' },
];

export default function SavedFavorites() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Saved</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--fill))] hover:bg-[hsl(var(--fill-h))] transition-colors whitespace-nowrap"
              >
                <col.icon className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                <span className="text-sm font-medium">{col.name}</span>
                <span className="text-xs text-[hsl(var(--fg-3))]">({col.count})</span>
              </button>
            ))}
          </div>

          <h2 className="font-semibold mb-3">Recent Saves</h2>
          <div className="space-y-2">
            {SAVED_ITEMS.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-bold text-sm">
                  {item.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[hsl(var(--accent-primary))]">{item.type}</p>
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">by {item.author} • Saved {item.saved}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
                    <Share2 className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
