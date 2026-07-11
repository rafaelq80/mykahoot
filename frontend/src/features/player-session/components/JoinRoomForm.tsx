import { useState, useCallback } from 'react';
import { TopNavBar } from '../../../components/shared/TopNavBar';
import { cn } from '../../../lib/utils';

/** 8 avatares — grid 2×4 conforme manual de design */
const AVATARS = ['🦊', '🤖', '🦖', '👾', '😸', '🐼', '⚡', '🦉'] as const;

interface JoinRoomFormProps {
  onJoin: (nickname: string, avatar: string) => void;
  playerCount?: number;
}

export function JoinRoomForm({ onJoin, playerCount }: JoinRoomFormProps) {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const canSubmit = nickname.trim().length > 0 && avatar !== null;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onJoin(nickname.trim(), avatar!);
  }, [nickname, avatar, canSubmit, onJoin]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand bg-dot-pattern">
      <TopNavBar />

      <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-6 sm:py-10">
        {/* Card */}
        <div
          className={cn(
            'flex w-full max-w-110 flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-lg',
            'animate-[slideUp_0.35s_ease_both]',
          )}
        >
          {/* Conteúdo — TODO o espaçamento vertical vem de `gap` num flex, nunca de margin (o projeto tem um reset global zerando margin em elementos como h1/p/label) */}
          <div className="flex flex-col gap-10 px-8 pt-10 pb-6 sm:gap-12 sm:px-12 sm:pt-12 sm:pb-8">
            {/* Cabeçalho centralizado */}
            <header className="flex flex-col gap-2 text-center">
              <h1 className="font-black text-headline-md text-brand">
                Entrar no Jogo
              </h1>
              <p className="text-body-lg text-text-muted">
                Escolha seu visual e um apelido!
              </p>
            </header>

            {/* Nickname */}
            <section className="flex flex-col gap-2.5">
              <label
                htmlFor="nickname"
                className="font-semibold uppercase text-label-xs text-text-muted"
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
                autoFocus
                className={cn(
                  'w-full rounded-xl border border-black/10 bg-surface-container',
                  'px-6 py-3.5 font-bold text-input text-brand',
                  'placeholder:font-bold placeholder:text-text-muted',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                  'transition-colors',
                )}
              />
            </section>

            {/* Avatares */}
            <section className="flex flex-col gap-3">
              <p className="font-semibold uppercase text-label-xs text-text-muted">
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
                      onClick={() => setAvatar(emoji)}
                      className={cn(
                        'flex aspect-square w-full items-center justify-center rounded-full bg-surface-container',
                        'text-[clamp(1.5rem,5vw,2rem)]',
                        'ring-2 ring-transparent ring-offset-2 ring-offset-white',
                        'transition-all active:scale-90 motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-offset-2',
                        selected && 'ring-brand scale-[1.03]',
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CTA — mesmo recuo lateral do conteúdo, cantos próprios, menor altura */}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-body-lg text-brand-foreground',
                'transition-colors active:scale-[0.99] motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                canSubmit
                  ? 'cursor-pointer bg-brand hover:bg-brand/90'
                  : 'cursor-not-allowed bg-brand-soft',
              )}
            >
              <span aria-hidden="true" className="text-white/60">
                •
              </span>
              Pronto para Jogar!
            </button>
          </div>
        </div>
      </main>

      {playerCount !== undefined && (
        <footer className="py-3 text-center font-medium text-body-md text-white/60">
          Aguardando outros jogadores... {playerCount} entrou
        </footer>
      )}
    </div>
  );
}