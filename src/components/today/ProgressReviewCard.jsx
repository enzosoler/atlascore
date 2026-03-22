import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function ProgressReviewCard() {
  return (
    <Link to={ROUTES.insights}
      className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-[hsl(var(--primary)/0.3)] transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
        <BarChart3 className="w-5 h-5 text-[hsl(var(--primary))]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold">Insights</p>
        <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
          Your weekly summary hub. Log data for clearer insights.
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 group-hover:text-[hsl(var(--primary))] transition-colors" strokeWidth={2} />
    </Link>
  );
}
