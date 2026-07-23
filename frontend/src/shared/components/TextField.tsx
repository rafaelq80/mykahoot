import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const inputCls =
  'w-full rounded-lg border border-quiz-border bg-quiz-surface px-3 py-2 text-sm font-medium text-white placeholder:text-quiz-text-muted focus:border-quiz-highlight focus:outline-none';

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-quiz-text-muted"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(inputCls, className)}
          {...props}
        />
        {error && (
          <p className="text-sm font-bold text-option-a">{error}</p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
