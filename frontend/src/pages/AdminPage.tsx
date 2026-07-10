import { useState } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminQuizzesPage } from './AdminQuizzesPage';
import { AdminHistoricoPage } from './AdminHistoricoPage';
import styles from '../styles/AdminPage.module.css';

type AdminTab = 'dashboard' | 'quizzes' | 'historico';

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('admin_token'),
  );
  const [tab, setTab] = useState<AdminTab>('dashboard');

  const handleLogin = (t: string) => {
    sessionStorage.setItem('admin_token', t);
    setToken(t);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
  };

  if (!token) {
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Shared nav bar */}
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>QuizLive</span>
        <div className={styles.navTabs}>
          <button
            type="button"
            className={`${styles.navTab} ${tab === 'dashboard' ? styles.navTabActive : ''}`}
            onClick={() => setTab('dashboard')}
          >
            Partida
          </button>
          <button
            type="button"
            className={`${styles.navTab} ${tab === 'quizzes' ? styles.navTabActive : ''}`}
            onClick={() => setTab('quizzes')}
          >
            Quizzes
          </button>
          <button
            type="button"
            className={`${styles.navTab} ${tab === 'historico' ? styles.navTabActive : ''}`}
            onClick={() => setTab('historico')}
          >
            Histórico
          </button>
        </div>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Sair
        </button>
      </div>

      {/* Tab content — rendered without top bar duplication */}
      {tab === 'dashboard' && (
        <AdminDashboardPageInner token={token} onLogout={handleLogout} />
      )}
      {tab === 'quizzes' && <AdminQuizzesPage token={token} />}
      {tab === 'historico' && <AdminHistoricoPage token={token} />}
    </div>
  );
}

function AdminDashboardPageInner({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  return <AdminDashboardPage token={token} onLogout={onLogout} hideTopBar />;
}
