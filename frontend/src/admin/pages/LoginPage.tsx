import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../lib/utils';
import { apiFetch, ApiError } from '../../services/api';
import { adminLoginSchema } from '../../schemas/adminLogin.schema';
import type { AdminLoginFormData } from '../../schemas/adminLogin.schema';

interface Props {
  onLogin: (token: string, username: string) => void;
  sessionExpiredMessage?: string | null;
}

export function AdminLoginPage({ onLogin, sessionExpiredMessage }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ access_token: string }>('/admin/login', {
        method: 'POST',
        body: data,
      });
      onLogin(res.access_token, data.username);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Usuário ou senha incorretos.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Erro ao conectar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && isValid;

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
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
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
                {...register('username')}
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
              {errors.username && (
                <p className="text-sm font-bold text-option-a">{errors.username.message}</p>
              )}
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
                {...register('password')}
                placeholder="Digite a senha..."
                autoComplete="current-password"
                className={cn(
                  'w-full rounded-xl border-2 border-surface-container bg-surface-container',
                  'px-4 py-3 font-medium text-base text-gray-800 placeholder:text-gray-300',
                  'focus:border-brand focus:bg-white focus:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-brand transition-colors',
                )}
              />
              {errors.password && (
                <p className="text-sm font-bold text-option-a">{errors.password.message}</p>
              )}
            </div>

            {sessionExpiredMessage && (
              <p className="text-sm font-bold text-option-a" role="alert">{sessionExpiredMessage}</p>
            )}

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