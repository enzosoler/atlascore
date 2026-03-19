import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

function getThemeToggleCopy(language, nextTheme) {
  const isPt = language === 'pt-BR';

  if (nextTheme === 'light') {
    return {
      label: isPt ? 'Claro' : 'Light',
      ariaLabel: isPt ? 'Ativar modo claro' : 'Switch to light mode',
    };
  }

  return {
    label: isPt ? 'Escuro' : 'Dark',
    ariaLabel: isPt ? 'Ativar modo escuro' : 'Switch to dark mode',
  };
}

export default function ThemeToggleButton({ compact = false, className = '' }) {
  const { theme, setTheme } = useTheme();
  const { language } = useTranslation();

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const copy = getThemeToggleCopy(language, nextTheme);
  const Icon = theme === 'dark' ? SunMedium : Moon;

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon' : 'default'}
      onClick={() => setTheme(nextTheme)}
      aria-label={copy.ariaLabel}
      title={copy.ariaLabel}
      className={cn(
        compact ? 'h-9 w-9 rounded-2xl' : 'h-10 rounded-full px-3.5 text-[12px]',
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
      {!compact ? <span>{copy.label}</span> : null}
    </Button>
  );
}
