import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, TrendingUp, Users, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'protocols', label: 'Protocols' },
  { id: 'coaches', label: 'Coaches' },
];

const TRENDING = [
  { title: 'Hypertrophy Protocol', author: 'Atlas Team', rating: 4.9, users: '12k' },
  { title: 'Fat Loss Blueprint', author: 'Dr. Smith', rating: 4.8, users: '8k' },
  { title: 'Strength Foundations', author: 'Coach Mike', rating: 4.7, users: '5k' },
];

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Explore</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-3))]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts, exercises, protocols..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[hsl(var(--accent-primary))] text-white'
                    : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg))]'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button className="p-2 rounded-full bg-[hsl(var(--fill))]">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
              <h2 className="font-semibold">Trending Now</h2>
            </div>
            <div className="space-y-3">
              {TRENDING.map((item, i) => (
                <button
                  key={i}
                  className="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-3 hover:border-[hsl(var(--border-h))] transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-bold">
                    {item.title[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-[hsl(var(--fg-2))]">by {item.author}</p>
                  </div>
                  <div className="text-right text-xs text-[hsl(var(--fg-2))]">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {item.rating}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {item.users}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
              <h2 className="font-semibold">Recently Added</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Push Pull Legs', 'Upper Lower Split', 'Bro Split', 'Full Body'].map((item, i) => (
                <button
                  key={i}
                  className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--border-h))] transition-colors"
                >
                  <p className="font-medium text-sm">{item}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">Workout Plan</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
