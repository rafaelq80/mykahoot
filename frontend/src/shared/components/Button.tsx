import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantCls: Record<ButtonVariant, string> = {
  primary: 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  danger: 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0',
  ghost: 'rounded-lg border border-quiz-border px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-quiz-surface active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(variantCls[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
