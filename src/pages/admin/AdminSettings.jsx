import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [resyncing, setResyncing] = useState(false);

  const { data: dbInfo, isLoading } = useQuery({
    queryKey: ['admin-settings-info'],
    queryFn: async () => {
      const [{ count: profileCount }, { count: subCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      ]);
      return { profileCount: profileCount ?? 0, subCount: subCount ?? 0 };
    },
  });

  const handleClearCache = () => {
    if (typeof window !== 'undefined' && window.__queryClient) {
      window.__queryClient.invalidateQueries();
      toast.success('Query cache cleared');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">Admin Settings</h2>
        <p className="t-caption mt-1">Platform configuration and maintenance</p>
      </div>

      {/* DB info */}
      <div className="surface p-5 space-y-4">
        <p className="t-subtitle">Database</p>
        {isLoading ? (
          <div className="flex items-center gap-2 t-caption">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="px-4 py-3 rounded-xl bg-[hsl(var(--shell))]">
              <p className="text-[hsl(var(--fg-2))]">Profiles</p>
              <p className="font-semibold text-lg">{dbInfo?.profileCount}</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[hsl(var(--shell))]">
              <p className="text-[hsl(var(--fg-2))]">Subscriptions</p>
              <p className="font-semibold text-lg">{dbInfo?.subCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="surface p-5 space-y-3">
        <p className="t-subtitle">Maintenance</p>
        <button
          onClick={handleClearCache}
          className="btn btn-secondary gap-2 h-9"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear client cache
        </button>
      </div>
    </div>
  );
}
