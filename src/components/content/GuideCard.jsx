import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuideCard({
  title,
  excerpt,
  readingTime,
  icon: Icon,
  href,
  category,
}) {
  return (
    <Link
      to={href}
      className="group atlas-card block p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--brand)/0.24)] hover:shadow-[var(--shadow-md)] lg:p-6"
    >
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)] transition-colors group-hover:bg-[hsl(var(--card))]">
            <Icon className="h-5 w-5" strokeWidth={1.7} />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {category ? (
            <p className="atlas-metric-label mb-2">
              {category}
            </p>
          ) : null}

          <h3 className="text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))] transition-colors group-hover:text-[hsl(var(--fg))]">
            {title}
          </h3>

          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {excerpt}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[11px] text-[hsl(var(--fg-3))]">
              {readingTime ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime} min
                </span>
              ) : null}
            </div>

            <ArrowRight
              className="h-4 w-4 text-[hsl(var(--fg-3))] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--fg))]"
              strokeWidth={1.9}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
