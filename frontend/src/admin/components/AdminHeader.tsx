import { NavLink } from 'react-router-dom';
import { AdminMusicControl } from './AdminMusicControl';
import { cn } from '../../lib/utils';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

interface AdminHeaderProps {
  navLinks: { to: string; label: string }[];
  onLogout: () => void;
  /**
   * Quando true (partida em andamento, tela de controle da pergunta),
   * oculta as abas de navegação — só "Sair" e o controle de som ficam
   * visíveis, pra não distrair o professor durante o jogo.
   */
  simplified?: boolean;
  /** Timer opcional exibido ao lado do botão Sair durante a pergunta ativa. */
  timer?: number | null;
  /** Label da pergunta atual (ex: "Pergunta 3/5") exibido ao lado do nome do app. */
  questionLabel?: string | null;
}

export function AdminHeader({ navLinks, onLogout, simplified = false, timer, questionLabel }: AdminHeaderProps) {
  return (
    <nav className="flex shrink-0 items-center gap-1 border-b border-surface-container bg-white px-4 py-2.5 shadow-sm">
      <span className="mr-2 font-black text-lg text-brand">{APP_NAME}</span>
      {questionLabel && (
        <span className="mr-2 rounded-full bg-surface-container px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-brand">
          {questionLabel}
        </span>
      )}
      {!simplified && navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 text-sm font-bold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              isActive
                ? 'bg-brand text-white'
                : 'text-gray-600 hover:bg-surface-container',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
      <div className="ml-auto flex items-center gap-2">
        {timer != null && timer > 0 && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-black tabular-nums shadow-sm',
              timer <= 5
                ? 'bg-option-a text-white animate-pulse motion-reduce:animate-none'
                : 'bg-quiz-highlight text-quiz-highlight-foreground',
            )}
          >
            ⏱ {timer}s
          </span>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-surface-container px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Sair
        </button>
        <AdminMusicControl
          className=""
          buttonClassName="text-gray-600 hover:bg-surface-container"
        />
      </div>
    </nav>
  );
}
