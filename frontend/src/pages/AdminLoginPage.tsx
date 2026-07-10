import { useState, useCallback } from 'react';
import styles from '../styles/AdminPage.module.css';

interface Props {
  onLogin: (token: string) => void;
}

export function AdminLoginPage({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        },
      );
      if (!res.ok) {
        setError('Senha incorreta.');
        return;
      }
      const data = (await res.json()) as { access_token: string };
      onLogin(data.access_token);
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }, [password, onLogin]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void handleLogin();
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>QuizLive — Professor</h1>

        <div>
          <label className={styles.loginLabel} htmlFor="admin-password">
            Senha de acesso
          </label>
          <input
            id="admin-password"
            type="password"
            className={styles.loginInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite a senha..."
            autoFocus
          />
        </div>

        {error && <p className={styles.loginError}>{error}</p>}

        <button
          type="button"
          className={styles.loginBtn}
          onClick={() => void handleLogin()}
          disabled={loading || !password.trim()}
        >
          {loading ? 'Entrando...' : 'ENTRAR'}
        </button>
      </div>
    </div>
  );
}
