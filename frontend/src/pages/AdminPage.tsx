import { useState } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import type { WaitingRoomFooterState } from './AdminDashboardPage';
import { AdminQuizzesPage } from './AdminQuizzesPage';
import { AdminTurmasPage } from './AdminTurmasPage';
import { AdminHistoricoPage } from './AdminHistoricoPage';
import { useAdminSocket } from '../features/admin-control/hooks/useAdminSocket';
import { useBackgroundMusic } from '../features/background-music/hooks/useBackgroundMusic';
import { AdminMusicControl } from '../features/background-music/components/AdminMusicControl';
import { useAdminStore } from '../stores/useAdminStore';
import type { AdminScreen } from '../stores/useAdminStore';
import type { MusicPhase } from '../features/background-music/constants';
import { cn } from '../lib/utils';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

type Tab = 'dashboard' | 'quizzes' | 'turmas' | 'historico';

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
  const [adminUsername, setAdminUsername] = useState<string | null>(() => sessionStorage.getItem('admin_username'));
  const [tab, setTab] = useState<Tab>('dashboard');
  // Contagem de quizzes disponíveis, reportada pelo AdminDashboardPage assim
  // que ele carrega a lista — usada no rodapé global abaixo.
  const [quizzesCount, setQuizzesCount] = useState<number | null>(null);
  // Estado da sala de espera (contagem de jogadores + ações), reportado pelo
  // AdminDashboardPage. Quando presente, substitui a contagem de quizzes e o
  // avatar/usuário passa a dividir o rodapé com a contagem de jogadores e os
  // botões Finalizar Sala / Iniciar Jogo. `null` fora da sala de espera (ex:
  // seleção de quiz, partida em andamento, outras abas).
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomFooterState | null>(null);
  const adminScreen = useAdminStore((s) => s.screen);
  const musicEnabledByAdmin = useAdminStore((s) => s.musicEnabledByAdmin);

  useAdminSocket(token);
  useBackgroundMusic(
    token ? musicPhaseForAdminScreen(adminScreen) : 'idle',
    musicEnabledByAdmin,
  );

  const handleLogin = (t: string, username: string) => {
    sessionStorage.setItem('admin_token', t);
    sessionStorage.setItem('admin_username', username);
    setToken(t);
    setAdminUsername(username);
  };
  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_username');
    setToken(null);
    setAdminUsername(null);
  };

  if (!token) return <AdminLoginPage onLogin={handleLogin} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Partida' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'turmas', label: 'Turmas' },
    { id: 'historico', label: 'Histórico' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-brand">
      <nav className="flex shrink-0 items-center gap-1 border-b border-surface-container bg-white px-4 py-2.5 shadow-sm">
        <span className="mr-4 font-black text-lg text-brand">{APP_NAME}</span>
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
        {tab === 'dashboard' && (
          <AdminDashboardPage
            token={token}
            onLogout={handleLogout}
            adminUsername={adminUsername}
            onQuizzesCountChange={setQuizzesCount}
            onWaitingRoomStateChange={setWaitingRoom}
          />
        )}
        {tab === 'quizzes' && <AdminQuizzesPage token={token} />}
        {tab === 'turmas' && <AdminTurmasPage token={token} />}
        {tab === 'historico' && <AdminHistoricoPage token={token} />}
      </div>

      <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-surface-container bg-white px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5 justify-self-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
            {(adminUsername ?? '?').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-bold text-gray-700">{adminUsername ?? 'Admin'}</span>
        </div>

        {waitingRoom ? (
          <span className="justify-self-center whitespace-nowrap font-black text-lg tabular-nums text-brand sm:text-xl">
            {String(waitingRoom.playersCount).padStart(2, '0')}{' '}
            {waitingRoom.playersCount === 1 ? 'conectado' : 'conectados'}
          </span>
        ) : (
          <span />
        )}

        <div className="justify-self-end">
          {waitingRoom ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={waitingRoom.onFinalizarSala}
                className="rounded-lg border-2 border-option-a bg-white px-3 py-1.5 text-xs font-black tracking-wide text-option-a transition-all hover:bg-option-a/5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                FINALIZAR SALA
              </button>
              <button
                type="button"
                onClick={waitingRoom.onIniciarJogo}
                disabled={waitingRoom.iniciarDisabled}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-xs font-black tracking-wide text-white transition-all active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:px-5 sm:py-2 sm:text-sm',
                  waitingRoom.iniciarDisabled
                    ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                    : 'cursor-pointer bg-brand shadow-sm hover:bg-brand/90',
                )}
              >
                INICIAR JOGO ›
              </button>
            </div>
          ) : (
            quizzesCount !== null && (
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                {quizzesCount} {quizzesCount === 1 ? 'quiz disponível' : 'quizzes disponíveis'}
              </span>
            )
          )}
        </div>
      </footer>
    </div>
  );
}