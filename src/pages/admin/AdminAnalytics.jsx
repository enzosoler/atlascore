import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2 } from 'lucide-react';
import AdminFunnelBar from '@/components/admin/AdminFunnelBar';
import { fetchFunnelData } from '@/lib/adminService';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export default function AdminAnalytics() {
  const [range, setRange] = useState(30);

  const dateRangeStart = useMemo(() => {
    return new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();
  }, [range]);

  const { data: steps, isLoading } = useQuery({
    queryKey: ['admin-funnel', range],
    queryFn: () => fetchFunnelData(dateRangeStart),
    staleTime: 60_000,
  });

  const maxCount = steps?.[0]?.count || 1;
  const overallConversion = steps && steps.length >= 2 && steps[0].count > 0
    ? Math.round((steps[steps.length - 1].count / steps[0].count) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">Analytics</h1>
          <p className="text-[13px] text-[hsl(var(--fg-3))]">Conversion funnels and growth metrics</p>
        </div>
        <div className="flex gap-1 rounded-[10px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setRange(r.days)}
              className={`rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition ${
                range === r.days
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
                  : 'text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)]">
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-[hsl(var(--brand))]" />
          <h2 className="text-[14px] font-semibold text-[hsl(var(--fg))]">User Funnel</h2>
          <span className="text-[12px] text-[hsl(var(--fg-3))]">Last {range} days</span>
        </div>

        {isLoading && <p className="py-8 text-center text-[13px] text-[hsl(var(--fg-3))]">Loading funnel data...</p>}

        {steps && (
          <div className="space-y-0.5">
            {steps.map((s, i) => (
              <AdminFunnelBar
                key={s.step}
                label={s.label}
                count={s.count}
                conversionPct={s.conversionFromPrev}
                dropoffPct={s.dropoffPct}
                maxCount={maxCount}
                isFirst={i === 0}
              />
            ))}
          </div>
        )}

        {steps && (
          <div className="mt-6 rounded-[12px] bg-[hsl(var(--fill)/0.3)] p-4 text-center">
            <p className="text-[12px] text-[hsl(var(--fg-3))]">Overall Conversion (Registered → Paid)</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--fg))]">{overallConversion}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
