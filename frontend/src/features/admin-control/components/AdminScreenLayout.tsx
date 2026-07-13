import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface AdminScreenLayoutProps {
  title: string;
  subtitle?: string;
  badge?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Layout padrão das telas do professor: cabeçalho branco, fundo roxo, rodapé branco */
export function AdminScreenLayout({
  title,
  subtitle,
  badge,
  headerRight,
  footer,
  children,
  className,
}: AdminScreenLayoutProps) {
  return (
    <div className={cn('flex min-h-[calc(100dvh-52px)] flex-1 flex-col bg-brand', className)}>
      <header className="flex shrink-0 items-center justify-between border-b border-surface-container bg-white px-5 py-4 shadow-sm sm:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-black text-xl text-brand sm:text-2xl">{title}</h1>
            {badge && (
              <span className="shrink-0 rounded-full bg-surface-container px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-brand">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-body-sm font-medium text-gray-500">{subtitle}</p>
          )}
        </div>
        {headerRight && <div className="ml-4 shrink-0">{headerRight}</div>}
      </header>

      <main className="relative flex flex-1 flex-col overflow-auto bg-brand bg-dot-pattern">
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </main>

      {footer && (
        <footer className="shrink-0 border-t border-surface-container bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6">
          {footer}
        </footer>
      )}
    </div>
  );
}
