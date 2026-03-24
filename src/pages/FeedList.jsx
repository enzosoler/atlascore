import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, SlidersHorizontal, Heart, Share2, ChevronRight } from 'lucide-react';

const ITEMS = [
  { id: 1, title: 'Hypertrophy Chest Routine', category: 'Workout', author: 'Atlas Team', likes: 1240, image: 'C', tags: ['Intermediate', '60 min'] },
  { id: 2, title: 'Keto Meal Plan', category: 'Nutrition', author: 'Dr. Smith', likes: 890, image: 'K', tags: ['Fat Loss', '4 weeks'] },
  { id: 3, title: 'Progressive Overload Guide', category: 'Protocol', author: 'Coach Mike', likes: 2100, image: 'P', tags: ['Advanced', 'Strength'] },
  { id: 4, title: 'Morning Mobility Flow', category: 'Recovery', author: 'Yoga Jane', likes: 650, image: 'M', tags: ['Beginner', '15 min'] },
  { id: 5, title: 'Bench Press Technique', category: 'Exercise', author: 'Power Pete', likes: 3400, image: 'B', tags: ['Tutorial', 'Chest'] },
];

const FILTERS = ['All', 'Workouts', 'Nutrition', 'Protocols', 'Exercises'];

export default function FeedList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = React.useState('All');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Discover</h1>
        <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg ml-auto">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-[hsl(var(--accent-primary))] text-white'
                    : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg))]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))] transition-colors cursor-pointer"
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-[hsl(var(--accent-primary))] font-medium">{item.category}</p>
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        <p className="text-sm text-[hsl(var(--fg-2))]">by {item.author}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[hsl(var(--fg-3))]">
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-[hsl(var(--fill))] text-xs text-[hsl(var(--fg-2))]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--fg-3))] shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
