import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

export default function ThemeToggleButton({ compact = false, className = '' }) {
  const { theme, setTheme } = useTheme();
  const t = useT();

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const label = nextTheme === 'light'
    ? t('settings.appearance.light')
    : t('settings.appearance.dark');
  const ariaLabel = nextTheme === 'light'
    ? t('settings.appearance.switchToLight')
    : t('settings.appearance.switchToDark');
  const Icon = theme === 'dark' ? SunMedium : Moon;

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon' : 'default'}
      onClick={() => setTheme(nextTheme)}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        compact ? 'h-9 w-9 rounded-2xl' : 'h-10 rounded-full px-3.5 text-[12px]',
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
      {!compact ? <span>{label}</span> : null}
    </Button>
  );
}
