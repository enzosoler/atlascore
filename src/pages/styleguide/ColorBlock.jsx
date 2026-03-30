import { useT } from '@/lib/i18nContext';
import { Card } from '@/components/ui/card';

export function ColorBlock({ labelKey, cssVar, className }) {
  const t = useT();
  return (
    <Card className="overflow-hidden p-0">
      <div
        className={`h-16 w-full ${className ?? ''}`}
        style={cssVar ? { background: `hsl(var(${cssVar}))` } : undefined}
      />
      <div className="px-3 py-2">
        <p className="text-[13px] font-medium text-[hsl(var(--label))]">{t(labelKey)}</p>
        {cssVar && (
          <p className="text-[11px] text-[hsl(var(--label-tertiary))] font-mono mt-0.5">{cssVar}</p>
        )}
      </div>
    </Card>
  );
}
