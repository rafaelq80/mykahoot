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
}

export function AdminHeader({ navLinks, onLogout, simplified = false }: AdminHeaderProps) {
  return (
    <nav className="flex shrink-0 items-center gap-1 border-b border-surface-container bg-white px-4 py-2.5 shadow-sm">
      <span className="mr-4 font-black text-lg text-brand">{APP_NAME}</span>
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
      <button
        type="button"
        onClick={onLogout}
        className="ml-auto rounded-lg border border-surface-container px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Sair
      </button>
      <AdminMusicControl
        className="ml-2"
        buttonClassName="text-gray-600 hover:bg-surface-container"
      />
    </nav>
  );
}
