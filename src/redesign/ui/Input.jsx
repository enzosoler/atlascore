import React from 'react';
import { cn } from '../lib/cn';

/**
 * Input — labeled, with optional leading/trailing adornments, hint, error.
 * Matches button heights (md = 40px, lg = 48px).
 */
export const Input = React.forwardRef(function Input(
  {
    label, hint, error, leading, trailing, size = 'md',
    type = 'text', className, id, required, ...rest
  },
  ref,
) {
  const inputId = id || `in-${Math.random().toString(36).slice(2, 8)}`;
  const h = size === 'lg' ? 'h-12 text-[15px]' : size === 'sm' ? 'h-8 text-[13px]' : 'h-10 text-[14px]';
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-rd-fg-secondary">
          {label} {required && <span className="text-rd-danger" aria-hidden>*</span>}
        </label>
      )}
      <div className={cn(
        'group flex items-center gap-2 rounded-rd-control border bg-rd-surface px-3',
        h,
        error ? 'border-rd-danger' : 'border-rd-border hover:border-rd-border-strong focus-within:border-rd-accent',
        'transition-colors duration-rd-fast',
      )}>
        {leading && <span className="text-rd-fg-muted shrink-0">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'text-rd-fg placeholder:text-rd-fg-muted',
            'rd-tnum',
          )}
          aria-invalid={!!error}
          aria-describedby={(error || hint) ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {trailing && <span className="text-rd-fg-muted shrink-0">{trailing}</span>}
      </div>
      {(error || hint) && (
        <p id={`${inputId}-hint`} className={cn(
          'text-[12px]',
          error ? 'text-rd-danger' : 'text-rd-fg-muted',
        )}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export const Textarea = React.forwardRef(function Textarea(
  { label, hint, error, rows = 4, className, id, ...rest }, ref,
) {
  const inputId = id || `ta-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label htmlFor={inputId} className="text-[13px] font-medium text-rd-fg-secondary">{label}</label>}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          'w-full resize-none rounded-rd-control border bg-rd-surface px-3 py-2.5',
          'text-[14px] text-rd-fg placeholder:text-rd-fg-muted outline-none',
          error ? 'border-rd-danger' : 'border-rd-border focus:border-rd-accent',
          'transition-colors duration-rd-fast',
        )}
        aria-invalid={!!error}
        {...rest}
      />
      {(error || hint) && <p className={cn('text-[12px]', error ? 'text-rd-danger' : 'text-rd-fg-muted')}>{error || hint}</p>}
    </div>
  );
});

export function SearchInput(props) {
  return (
    <Input
      leading={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      placeholder="Search..."
      {...props}
    />
  );
}

export default Input;
