import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-md border border-base-gray-800 bg-base-black px-4 py-2 text-sm text-base-white ring-offset-base-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-base-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
