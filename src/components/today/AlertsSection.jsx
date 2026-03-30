import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';

/**
 * AlertsSection — only renders when there is actionable friction.
 * Max 2 alerts. Each is short, concrete, and has an action.
 * Section is hidden entirely when alerts array is empty.
 */
export function AlertsSection({ alerts }) {
  const { t } = useI18n();

  if (!alerts?.length) return null;

  return (
    <section className="space-y-2">
      {alerts.map((alert, i) => {
        const Icon = alert.icon || AlertCircle;
        return (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3.5 rounded-[15px] border border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.06)]"
          >
            <Icon
              className="w-4 h-4 text-[hsl(var(--warn))] shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))] leading-snug">
                {alert.title}
              </p>
              {alert.description && (
                <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5 leading-snug">
                  {alert.description}
                </p>
              )}
            </div>
            {alert.path && (
              <Link
                to={alert.path}
                className="shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[hsl(var(--warn))] hover:opacity-70 transition-opacity"
              >
                {alert.cta || t('today.planSection.alertFix')} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        );
      })}
    </section>
  );
}
