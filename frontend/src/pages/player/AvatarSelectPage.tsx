import { useState } from "react";
import { PlayerVolumeControl } from "../../features/background-music/components/PlayerVolumeControl";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../stores/useGameStore";


const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

/** 15 avatares — grid 3×5. Placeholders em emoji; substituir por imagens futuramente. */
const AVATARS = [
  '🦊', '🤖', '🦖', '👾', '😸',
  '🐼', '⚡', '🦉', '🐸', '🦄',
  '🐙', '🦁', '🐵', '🐧', '🦋',
] as const;

interface AvatarSelectPageProps {
  nickname: string;
  onConfirm: (avatar: string) => void;
  onBack: () => void;
  roomOpen: boolean;
  joinPending: boolean;
  playerCount: number;
  errorMessage?: string | null;
}

export function AvatarSelectPage({
  nickname,
  onConfirm,
  onBack,
  roomOpen,
  joinPending,
  playerCount,
  errorMessage,
}: AvatarSelectPageProps) {
  const musicEnabledByAdmin = useGameStore((s) => s.musicEnabledByAdmin);
  const quizTitle = useGameStore((s) => s.quizTitle);
  const [avatar, setAvatar] = useState<string | null>(null);

  const fieldsDisabled = !roomOpen || joinPending;
  const canConfirm = roomOpen && !joinPending && avatar !== null;

  const handleConfirm = () => {
    if (!canConfirm || !avatar) return;
    onConfirm(avatar);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Header — mesmo padrão do JoinRoomForm/LobbyPage */}
      <header className="flex items-center justify-between border-b border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
        <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>

        <PlayerVolumeControl
          musicEnabledByAdmin={musicEnabledByAdmin}
          buttonClassName="text-white hover:bg-white/10"
        />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-3 sm:px-6">
        {!roomOpen && (
          <div
            role="status"
            className="mb-4 w-full max-w-lg rounded-2xl bg-yellow-400 px-6 py-3 text-center shadow-md"
          >
            <p className="font-bold text-body-lg text-black">Sala fechada</p>
            <p className="mt-1 text-body-sm text-black/70">
              Aguarde o professor abrir uma nova partida para entrar.
            </p>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 w-full max-w-lg rounded-2xl border border-option-a/40 bg-option-a/20 px-6 py-3 text-center text-body-sm font-bold text-white"
          >
            {errorMessage}
          </div>
        )}

        {/* Card central */}
        <div
          className={cn(
            'flex w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-4xl border border-quiz-border bg-quiz-surface-strong/30 shadow-xl backdrop-blur-sm',
            'animate-[slideUp_0.35s_ease_both]',
            !roomOpen && 'pointer-events-none opacity-60',
          )}
        >
          <div className="flex flex-col gap-4 px-6 py-5 sm:gap-5 sm:px-8 sm:py-6">
            <header className="flex flex-col gap-1 text-center">
              <h1 className="font-black text-headline-md text-white">Escolha um Avatar</h1>
              <p className="text-body-sm text-quiz-text-muted">
                {nickname}{quizTitle ? ` — ${quizTitle}` : ''}
              </p>
            </header>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {AVATARS.map((emoji) => {
                const selected = avatar === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Avatar ${emoji}`}
                    aria-pressed={selected}
                    disabled={fieldsDisabled}
                    onClick={() => setAvatar(emoji)}
                    className={cn(
                      'flex aspect-square w-full items-center justify-center rounded-lg bg-white',
                      'text-[clamp(1.5rem,6vw,2.25rem)]',
                      'border-2 border-transparent',
                      'transition-all active:scale-95 motion-reduce:transition-none',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      selected && 'border-quiz-highlight scale-[1.03] shadow-md',
                    )}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                disabled={joinPending}
                className={cn(
                  'flex-1 rounded-xl py-3 font-bold text-body-md',
                  'border border-quiz-border text-white/80 hover:bg-white/5',
                  'transition-colors active:scale-[0.99] motion-reduce:transition-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!canConfirm}
                onClick={handleConfirm}
                className={cn(
                  'flex-2 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-body-lg',
                  'transition-colors active:scale-[0.99] motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2',
                  canConfirm
                    ? 'cursor-pointer bg-quiz-highlight text-quiz-highlight-foreground hover:bg-quiz-highlight/90'
                    : 'cursor-not-allowed bg-quiz-surface text-quiz-text-muted',
                )}
              >
                {joinPending ? 'Entrando…' : 'Pronto para Jogar!'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé — mesmo padrão do JoinRoomForm/LobbyPage */}
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
            {roomOpen
              ? `Sala aberta - ${playerCount} conectado${playerCount === 1 ? '' : 's'}`
              : 'Aguardando professor'}
          </span>
        </div>
      </footer>
    </div>
  );
}