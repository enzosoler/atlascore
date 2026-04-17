import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { DataState } from '@/components/shared/DataState';

/**
 * Page-level NoResults -- wraps the unified DataState component.
 * Keeps the same public API as the original for backward compatibility.
 */
export default function NoResults({
  query = '',
  onClear,
  suggestions = [],
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <DataState
          variant="empty"
          icon={SearchX}
          title="No results found"
          description={query ? `No matches for "${query}". Try different keywords or check your spelling.` : 'Try different keywords or check your spelling.'}
          action={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
        />
        {suggestions.length > 0 && (
          <div className="mt-5 text-center">
            <p className="text-[12px] font-medium text-[hsl(var(--fg-3))] mb-2">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(suggestion)}`)}
                  className="rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill)/0.6)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
