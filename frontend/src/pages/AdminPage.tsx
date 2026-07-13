import { useState } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminQuizzesPage } from './AdminQuizzesPage';
import { AdminHistoricoPage } from './AdminHistoricoPage';
import { useAdminSocket } from '../features/admin-control/hooks/useAdminSocket';
import { useBackgroundMusic } from '../features/background-music/hooks/useBackgroundMusic';
import { AdminMusicControl } from '../features/background-music/components/AdminMusicControl';
import { useAdminStore } from '../stores/useAdminStore';
import type { AdminScreen } from '../stores/useAdminStore';
import type { MusicPhase } from '../features/background-music/constants';
import { cn } from '../lib/utils';

type Tab = 'dashboard' | 'quizzes' | 'historico';

function musicPhaseForAdminScreen(screen: AdminScreen): MusicPhase {
  switch (screen) {
    case 'lobby':
      return 'lobby';
    case 'question_active':
      return 'question';
    case 'showing_result':
      return 'result';
    case 'game_over':
      return 'podium';
    default:
      return 'idle';
  }
}

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_token'));
  const [tab, setTab] = useState<Tab>('dashboard');
  const adminScreen = useAdminStore((s) => s.screen);
  const musicEnabledByAdmin = useAdminStore((s) => s.musicEnabledByAdmin);

  useAdminSocket(token);
  useBackgroundMusic(
    token ? musicPhaseForAdminScreen(adminScreen) : 'idle',
    musicEnabledByAdmin,
  );

  const handleLogin = (t: string) => {
    sessionStorage.setItem('admin_token', t);
    setToken(t);
  };
  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
  };

  if (!token) return <AdminLoginPage onLogin={handleLogin} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Partida' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'historico', label: 'Histórico' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-brand">
      <nav className="flex shrink-0 items-center gap-1 border-b border-surface-container bg-white px-4 py-2.5 shadow-sm">
        <span className="mr-4 font-black text-lg text-brand">QuizLive</span>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-bold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              tab === t.id
                ? 'bg-brand text-white'
                : 'text-gray-600 hover:bg-surface-container',
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto rounded-lg border border-surface-container px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Sair
        </button>
        <AdminMusicControl
          className="ml-2"
          buttonClassName="text-gray-600 hover:bg-surface-container"
        />
      </nav>

      <div className="flex flex-1 flex-col overflow-auto">
        {tab === 'dashboard' && <AdminDashboardPage token={token} onLogout={handleLogout} />}
        {tab === 'quizzes' && <AdminQuizzesPage token={token} />}
        {tab === 'historico' && <AdminHistoricoPage token={token} />}
      </div>

      <footer className="flex shrink-0 items-center justify-center border-t border-surface-container bg-white px-4 py-2.5 text-xs font-medium text-gray-400">
        QuizLive · Painel do Professor
      </footer>
    </div>
  );
}
