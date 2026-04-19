import React from 'react';
import { cn, variants } from '../lib/cn';

/**
 * Button — foundational interactive.
 *
 * Variants:
 *   intent:  primary | secondary | ghost | danger | premium | ai
 *   size:    sm | md | lg | xl
 *   tone:    solid | outline | soft
 *   block:   true to fill container
 *   loading: disables + shows spinner
 */
const classes = variants({
  base: [
    'inline-flex items-center justify-center gap-2 select-none',
    'font-medium tracking-tight rd-tnum',
    'transition-[background,color,border,transform,box-shadow] duration-rd-base ease-rd-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent focus-visible:ring-offset-2 focus-visible:ring-offset-rd-bg',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-[.98]',
  ].join(' '),
  variants: {
    intent: {
      primary:  'bg-rd-accent text-rd-fg-on-accent hover:bg-rd-accent-hover',
      secondary:'bg-rd-surface-2 text-rd-fg border border-rd-border hover:bg-rd-elevated',
      ghost:    'bg-transparent text-rd-fg hover:bg-rd-surface-2',
      danger:   'bg-rd-danger text-white hover:opacity-90',
      premium:  'bg-rd-premium text-rd-fg-on-accent hover:opacity-95',
      ai:       'bg-rd-ai text-white hover:opacity-95',
    },
    tone: {
      solid:   '',
      outline: 'bg-transparent border',
      soft:    '',
    },
    size: {
      sm: 'h-8  px-3 text-[13px] rounded-rd-sm',
      md: 'h-10 px-4 text-[14px] rounded-rd-control',
      lg: 'h-12 px-5 text-[15px] rounded-rd-control',
      xl: 'h-14 px-6 text-[16px] rounded-rd-lg',
    },
    block: { true: 'w-full', false: '' },
  },
  compound: [
    { when: { intent: 'primary',   tone: 'outline' }, class: 'bg-transparent border-rd-accent text-rd-accent hover:bg-rd-accent-muted' },
    { when: { intent: 'secondary', tone: 'outline' }, class: 'bg-transparent' },
    { when: { intent: 'danger',    tone: 'outline' }, class: 'bg-transparent border-rd-danger text-rd-danger hover:bg-rd-danger-muted' },
    { when: { intent: 'primary',   tone: 'soft'    }, class: 'bg-rd-accent-muted text-rd-accent hover:bg-rd-accent-muted/80' },
    { when: { intent: 'danger',    tone: 'soft'    }, class: 'bg-rd-danger-muted text-rd-danger hover:bg-rd-danger-muted/80' },
    { when: { intent: 'ai',        tone: 'soft'    }, class: 'bg-rd-ai-muted text-rd-ai hover:bg-rd-ai-muted/80' },
    { when: { intent: 'premium',   tone: 'soft'    }, class: 'bg-rd-premium-muted text-rd-premium hover:bg-rd-premium-muted/80' },
  ],
  defaultVariants: { intent: 'primary', tone: 'solid', size: 'md', block: false },
});

export const Button = React.forwardRef(function Button(
  { as: Comp = 'button', intent, tone, size, block, loading, leftIcon, rightIcon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <Comp
      ref={ref}
      disabled={disabled || loading}
      className={classes({ intent, tone, size, block, className })}
      {...rest}
    >
      {loading ? <Spinner /> : leftIcon}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </Comp>
  );
});

export function IconButton({ size = 'md', intent = 'ghost', className, children, label, ...rest }) {
  const sizeMap = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-11 w-11' };
  return (
    <Button intent={intent} size={size} aria-label={label} className={cn('px-0', sizeMap[size], className)} {...rest}>
      {children}
    </Button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default Button;
