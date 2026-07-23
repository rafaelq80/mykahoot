import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLoginPage } from '../admin/pages/LoginPage';
import { AdminDashboardPage } from '../admin/pages/DashboardPage';
import type { WaitingRoomFooterState } from '../admin/pages/DashboardPage';
import { AdminQuizzesPage } from '../admin/pages/QuizzesPage';
import { AdminTurmasPage } from '../admin/pages/TurmasPage';
import { AdminHistoricoPage } from '../admin/pages/HistoricoPage';
import { AdminHeader } from '../admin/components/AdminHeader';
import { AdminFooter } from '../admin/components/AdminFooter';
import { useAdminSocket } from '../admin/hooks/useAdminSocket';
import { useBackgroundMusic } from '../shared/hooks/useBackgroundMusic';
import { useAdminStore } from '../admin/store/useAdminStore';
import type { AdminScreen } from '../admin/store/useAdminStore';
import type { MusicPhase } from '../shared/constants';
import { setOnUnauthorized } from '../services/api';
import { getTokenExpiry } from '../lib/jwt';

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
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_username');
    setToken(null);
    setAdminUsername(null);
  }, []);

  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Registrar callback global de 401 para logout automático
  useEffect(() => {
    setOnUnauthorized(() => {
      setSessionExpiredMsg('Sessão expirada, faça login novamente.');
      handleLogout();
    });
    return () => setOnUnauthorized(null);
  }, [handleLogout]);

  // Agendar logout automático quando o token estiver perto de expirar
  useEffect(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const msUntilExpiry = expiry - Date.now();
    if (msUntilExpiry <= 0) {
      setSessionExpiredMsg('Sessão expirada, faça login novamente.');
      handleLogout();
      return;
    }
    expiryTimerRef.current = setTimeout(() => {
      setSessionExpiredMsg('Sessão expirada, faça login novamente.');
      handleLogout();
    }, msUntilExpiry);
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [token, handleLogout]);

  if (!token) return <AdminLoginPage onLogin={handleLogin} sessionExpiredMessage={sessionExpiredMsg} />;

  const navLinks: { to: string; label: string }[] = [
    { to: '/admin/partida', label: 'Partida' },
    { to: '/admin/quizzes', label: 'Quizzes' },
    { to: '/admin/turmas', label: 'Turmas' },
    { to: '/admin/historico', label: 'Histórico' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-brand">
      <AdminHeader navLinks={navLinks} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-auto">
        <Routes>
          <Route
            path="partida"
            element={
              <AdminDashboardPage
                token={token}
                onLogout={handleLogout}
                adminUsername={adminUsername}
                onQuizzesCountChange={setQuizzesCount}
                onWaitingRoomStateChange={setWaitingRoom}
              />
            }
          />
          <Route path="quizzes" element={<AdminQuizzesPage token={token} />} />
          <Route path="turmas" element={<AdminTurmasPage token={token} />} />
          <Route path="historico" element={<AdminHistoricoPage token={token} />} />
          <Route path="*" element={<Navigate to="/admin/partida" replace />} />
        </Routes>
      </div>

      <AdminFooter adminUsername={adminUsername} waitingRoom={waitingRoom} quizzesCount={quizzesCount} />
    </div>
  );
}