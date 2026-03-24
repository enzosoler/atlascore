import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const RECENT_SEARCHES = ['chest workout', 'high protein meals', 'progressive overload'];
const TRENDING_SEARCHES = ['hypertrophy', 'meal prep', 'intermittent fasting', '5x5'];

const RESULTS = [
  { id: 1, title: 'Chest Hypertrophy Routine', type: 'Workout', author: 'Atlas Team' },
  { id: 2, title: 'High Protein Breakfast Ideas', type: 'Nutrition', author: 'Nutritionist Sarah' },
  { id: 3, title: 'Progressive Overload Guide', type: 'Protocol', author: 'Coach Mike' },
];

export default function SearchResults() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-3))]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workouts, exercises, nutrition..."
              className="pl-10 pr-10"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); setHasSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-[hsl(var(--fg-3))]" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {!hasSearched ? (
            <div className="space-y-6">
              {RECENT_SEARCHES.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-sm text-[hsl(var(--fg-3))]">
                    <Clock className="w-4 h-4" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RECENT_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => { setQuery(term); setHasSearched(true); }}
                        className="px-3 py-1.5 rounded-full bg-[hsl(var(--fill))] text-sm hover:bg-[hsl(var(--fill-h))]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3 text-sm text-[hsl(var(--fg-3))]">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); setHasSearched(true); }}
                      className="px-3 py-1.5 rounded-full bg-[hsl(var(--fill))] text-sm hover:bg-[hsl(var(--fill-h))]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[hsl(var(--fg-3))] mb-3">
                {RESULTS.length} results for "{query}"
              </p>
              {RESULTS.map((result) => (
                <button
                  key={result.id}
                  onClick={() => navigate(`/detail/${result.id}`)}
                  className="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--border-h))] transition-colors"
                >
                  <p className="text-xs text-[hsl(var(--accent-primary))] font-medium">{result.type}</p>
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-[hsl(var(--fg-2))]">by {result.author}</p>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
