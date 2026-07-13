import { useState, useCallback } from 'react';
import { cn } from '../../../lib/utils';
import { PlayerVolumeControl } from '../../background-music/components/PlayerVolumeControl';
import { useGameStore } from '../../../stores/useGameStore';

/** 8 avatares — grid 2×4 conforme manual de design */
const AVATARS = ['🦊', '🤖', '🦖', '👾', '😸', '🐼', '⚡', '🦉'] as const;

const APP_NAME = 'QuizMaster Live';

interface JoinRoomFormProps {
  onJoin: (nickname: string, avatar: string) => void;
  roomOpen: boolean;
  joinPending: boolean;
  connected: boolean;
  playerCount: number;
  errorMessage?: string | null;
}

export function JoinRoomForm({
  onJoin,
  roomOpen,
  joinPending,
  connected,
  playerCount,
  errorMessage,
}: JoinRoomFormProps) {
  const musicEnabledByAdmin = useGameStore((s) => s.musicEnabledByAdmin);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const canSubmit =
    roomOpen &&
    !joinPending &&
    connected &&
    nickname.trim().length > 0 &&
    avatar !== null;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onJoin(nickname.trim(), avatar!);
  }, [nickname, avatar, canSubmit, onJoin]);

  return (
    <div className="flex min-h-dvh flex-col bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Header — mesmo padrão do LobbyPage */}
      <header className="flex items-center justify-between border-b border-quiz-border bg-quiz-surface px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
          <span className="rounded-full bg-quiz-surface-strong px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-white/90">
            Entrar na Sala
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-label-xs font-extrabold uppercase tracking-[0.14em] shadow-sm',
              connected
                ? 'bg-quiz-highlight text-quiz-highlight-foreground'
                : 'bg-quiz-surface-strong text-white/70',
            )}
          >
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                connected
                  ? 'bg-quiz-highlight-foreground animate-pulse motion-reduce:animate-none'
                  : 'bg-white/40',
              )}
              aria-hidden="true"
            />
            {connected ? 'Conectado' : 'Conectando…'}
          </div>
          <PlayerVolumeControl
            musicEnabledByAdmin={musicEnabledByAdmin}
            buttonClassName="text-white hover:bg-white/10"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
        {!roomOpen && (
          <div
            role="status"
            className="mb-6 w-full max-w-lg rounded-2xl border border-quiz-border bg-quiz-surface-strong/40 px-6 py-4 text-center"
          >
            <p className="font-bold text-body-lg text-white">Sala fechada</p>
            <p className="mt-1 text-body-sm text-quiz-text-muted">
              Aguarde o professor abrir uma nova partida para entrar.
            </p>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 w-full max-w-lg rounded-2xl border border-option-a/40 bg-option-a/20 px-6 py-3 text-center text-body-sm font-bold text-white"
          >
            {errorMessage}
          </div>
        )}

        {/* Card central */}
        <div
          className={cn(
            'flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-quiz-border bg-quiz-surface-strong/30 shadow-xl backdrop-blur-sm',
            'animate-[slideUp_0.35s_ease_both]',
            !roomOpen && 'pointer-events-none opacity-60',
          )}
        >
          <div className="flex flex-col gap-8 px-6 py-8 sm:gap-10 sm:px-10 sm:py-10">
            <header className="flex flex-col gap-2 text-center">
              <h1 className="font-black text-headline-md text-white">Entrar no Jogo</h1>
              <p className="text-body-lg text-quiz-text-muted">
                Escolha seu visual e um apelido!
              </p>
            </header>

            <section className="flex flex-col gap-2.5">
              <label
                htmlFor="nickname"
                className="font-semibold uppercase text-label-xs text-quiz-text-muted"
              >
                Seu Apelido
              </label>
              <input
                id="nickname"
                type="text"
                maxLength={20}
                placeholder="Digite um nome divertido..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="off"
                autoFocus={roomOpen}
                disabled={!roomOpen || joinPending}
                className={cn(
                  'w-full rounded-xl border border-quiz-border bg-quiz-surface px-6 py-3.5 font-bold text-input text-white',
                  'placeholder:font-bold placeholder:text-quiz-text-muted',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                )}
              />
            </section>

            <section className="flex flex-col gap-3">
              <p className="font-semibold uppercase text-label-xs text-quiz-text-muted">
                Escolha um Avatar
              </p>
              <div className="grid grid-cols-4 gap-4 sm:gap-5">
                {AVATARS.map((emoji) => {
                  const selected = avatar === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Avatar ${emoji}`}
                      aria-pressed={selected}
                      disabled={!roomOpen || joinPending}
                      onClick={() => setAvatar(emoji)}
                      className={cn(
                        'flex aspect-square w-full items-center justify-center rounded-full bg-surface-container',
                        'text-[clamp(1.5rem,5vw,2rem)]',
                        'ring-2 ring-transparent ring-offset-2 ring-offset-transparent',
                        'transition-all active:scale-90 motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-quiz-highlight',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        selected && 'ring-quiz-highlight scale-[1.03]',
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-body-lg',
                'transition-colors active:scale-[0.99] motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2',
                canSubmit
                  ? 'cursor-pointer bg-quiz-highlight text-quiz-highlight-foreground hover:bg-quiz-highlight/90'
                  : 'cursor-not-allowed bg-quiz-surface text-quiz-text-muted',
              )}
            >
              {joinPending ? 'Entrando…' : 'Pronto para Jogar!'}
            </button>
          </div>
        </div>
      </main>

      {/* Rodapé — mesmo padrão do LobbyPage */}
      <footer className="grid w-full grid-cols-2 items-center border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
        <div className="flex flex-col items-start">
          <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
            Jogadores na sala
          </span>
          <span className="text-body-md font-extrabold tracking-tight text-white/90">
            {playerCount} {playerCount === 1 ? 'conectado' : 'conectados'}
          </span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
            Status do Jogo
          </span>
          <span className="text-body-sm font-bold text-white/90">
            {roomOpen ? 'Sala aberta' : 'Aguardando professor'}
          </span>
        </div>
      </footer>
    </div>
  );
}
