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

/**
 * Layout padrão das telas do professor: fundo roxo, rodapé branco.
 *
 * O cabeçalho branco já existe uma única vez, fixo em `AdminPage` (marca +
 * abas + sair). Este layout NÃO renderiza uma segunda barra de cabeçalho —
 * título/badge/subtitle/headerRight aparecem como um heading dentro do
 * próprio corpo roxo, evitando duas barras brancas empilhadas.
 */
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
    <div className={cn('flex min-h-full flex-1 flex-col bg-brand', className)}>
      <main className="relative flex flex-1 flex-col overflow-auto bg-brand bg-dot-pattern">
        <div className="relative z-10 flex flex-1 flex-col">
          {/* Heading da tela — parte do corpo roxo, não uma barra própria */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-6 pb-2 sm:px-8">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-black text-xl text-white sm:text-2xl">{title}</h1>
                {badge && (
                  <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-white">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-body-sm font-medium text-white/70">{subtitle}</p>
              )}
            </div>
            {headerRight && <div className="ml-4 shrink-0">{headerRight}</div>}
          </div>

          {children}
        </div>
      </main>

      {footer && (
        <footer className="shrink-0 border-t border-surface-container bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6">
          {footer}
        </footer>
      )}
    </div>
  );
}
