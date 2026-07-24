import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch, ApiError } from '../../services/api';
import { adminLoginSchema } from '../../schemas/adminLogin.schema';
import type { AdminLoginFormData } from '../../schemas/adminLogin.schema';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';

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
            <p className="font-black text-headline-md text-white">MyKahoot</p>
            <p className="font-bold text-label-xs text-white/60 uppercase tracking-widest mt-0.5">Professor</p>
          </div>

          {/* Card */}
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="card-glass-strong rounded-2xl p-8 flex flex-col gap-5"
          >
            <TextField
              id="admin-username"
              label="Usuário"
              type="text"
              placeholder="Digite o usuário..."
              autoFocus
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <TextField
              id="admin-password"
              label="Senha de acesso"
              type="password"
              placeholder="Digite a senha..."
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {sessionExpiredMessage && (
              <p className="text-sm font-bold text-option-a" role="alert">{sessionExpiredMessage}</p>
            )}

            {error && (
              <p className="text-sm font-bold text-option-a" role="alert">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit}
              className="w-full py-4 font-black text-body-md tracking-wide"
            >
              {loading ? 'Entrando...' : 'ENTRAR'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
