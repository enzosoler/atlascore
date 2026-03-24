import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SearchX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NoResults({
  query = '',
  onClear,
  suggestions = [],
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-10 h-10 text-[hsl(var(--fg-3))]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          No results found
        </h3>
        {query && (
          <p className="text-sm text-[hsl(var(--fg-2))] mb-2">
            No matches for "{query}"
          </p>
        )}
        <p className="text-sm text-[hsl(var(--fg-3))] mb-6">
          Try different keywords or check your spelling
        </p>
        {onClear && (
          <Button onClick={onClear} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Search
          </Button>
        )}
        {suggestions.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-[hsl(var(--fg-3))] mb-2">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(suggestion)}`)}
                  className="px-3 py-1 rounded-full bg-[hsl(var(--fill))] text-sm hover:bg-[hsl(var(--fill-h))]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
