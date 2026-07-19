import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';

interface Props {
  onLogin: (token: string, username: string) => void;
}

export function AdminLoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        },
      );
      if (!res.ok) {
        setError('Usuário ou senha incorretos.');
        return;
      }
      const data = (await res.json()) as { access_token: string };
      onLogin(data.access_token, username);
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }, [username, password, onLogin]);

  const canSubmit = !loading && username.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="relative min-h-dvh flex flex-col bg-quiz-bg-to bg-quiz-gradient">
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm animate-[slideUp_0.35s_ease_both]">
          {/* Logo above card */}
          <div className="mb-6 text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-3xl shadow-xl mb-3"
              aria-hidden="true"
            >
              🎯
            </div>
            <p className="font-black text-2xl text-white">QuizLive</p>
            <p className="font-bold text-xs text-white/60 uppercase tracking-widest mt-0.5">Professor</p>
          </div>

          {/* Card */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin();
            }}
            className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-username"
                className="text-xs font-black uppercase tracking-widest text-gray-500"
              >
                Usuário
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o usuário..."
                autoFocus
                autoComplete="username"
                className={cn(
                  'w-full rounded-xl border-2 border-surface-container bg-surface-container',
                  'px-4 py-3 font-medium text-base text-gray-800 placeholder:text-gray-300',
                  'focus:border-brand focus:bg-white focus:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-brand transition-colors',
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs font-black uppercase tracking-widest text-gray-500"
              >
                Senha de acesso
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                autoComplete="current-password"
                className={cn(
                  'w-full rounded-xl border-2 border-surface-container bg-surface-container',
                  'px-4 py-3 font-medium text-base text-gray-800 placeholder:text-gray-300',
                  'focus:border-brand focus:bg-white focus:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-brand transition-colors',
                )}
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-option-a" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'w-full rounded-xl py-4 font-black text-base tracking-wide',
                'transition-all active:scale-95 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                canSubmit
                  ? 'bg-brand text-white hover:opacity-90 shadow-md cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              )}
            >
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}