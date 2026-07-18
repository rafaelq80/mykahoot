import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { PlayerVolumeControl } from '../../background-music/components/PlayerVolumeControl';
import { useGameStore } from '../../../stores/useGameStore';
import type { Turma } from '../../../types/turma';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

interface JoinRoomFormProps {
  /** Turma + aluno confirmados — a escolha de avatar acontece na tela seguinte. */
  onContinue: (alunoId: string, nickname: string, turmaId: string) => void;
  roomOpen: boolean;
  connected: boolean;
  playerCount: number;
  errorMessage?: string | null;
}

export function JoinRoomForm({
  onContinue,
  roomOpen,
  connected,
  playerCount,
  errorMessage,
}: JoinRoomFormProps) {
  const musicEnabledByAdmin = useGameStore((s) => s.musicEnabledByAdmin);
  const quizTitle = useGameStore((s) => s.quizTitle);
  const quizImageUrl = useGameStore((s) => s.quizImageUrl);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasError, setTurmasError] = useState<string | null>(null);
  const [turmaId, setTurmaId] = useState('');
  const [nickname, setNickname] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/turmas`)
      .then((r) => {
        if (!r.ok) throw new Error(`GET /turmas falhou com status ${r.status}`);
        return r.json();
      })
      .then((data: Turma[]) => {
        setTurmas(Array.isArray(data) ? data : []);
        setTurmasError(null);
      })
      .catch((err: Error) => {
        console.error(err);
        setTurmas([]);
        setTurmasError('Não foi possível carregar as turmas. Recarregue a página.');
      });
  }, []);

  // Fecha a lista de sugestões ao clicar fora dela
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selectedTurma = turmas.find((t) => t.id === turmaId) ?? null;

  const suggestions = useMemo(() => {
    if (!selectedTurma || nickname.trim().length === 0) return [];
    const query = nickname.trim().toLowerCase();
    return selectedTurma.alunos
      .filter((a) => a.nome.toLowerCase().includes(query))
      .slice(0, 6);
  }, [selectedTurma, nickname]);

  // O nome precisa bater com um aluno cadastrado na turma selecionada —
  // mesma regra que o servidor aplica antes de deixar entrar na sala.
  // Evita mandar pro backend um nome que a gente já sabe que vai ser
  // rejeitado, e deixa claro na hora que "nome" != apelido livre.
  const matchedAluno = useMemo(() => {
    if (!selectedTurma) return null;
    const nomeDigitado = nickname.trim().toLowerCase();
    if (!nomeDigitado) return null;
    return (
      selectedTurma.alunos.find((a) => a.nome.toLowerCase() === nomeDigitado) ?? null
    );
  }, [selectedTurma, nickname]);

  const handleTurmaChange = (id: string) => {
    setTurmaId(id);
    setNickname('');
    setShowSuggestions(false);
  };

  const canContinue = roomOpen && connected && turmaId !== '' && matchedAluno !== null;

  const handleContinue = useCallback(() => {
    if (!canContinue || !matchedAluno) return;
    onContinue(matchedAluno.id, matchedAluno.nome, turmaId);
  }, [matchedAluno, turmaId, canContinue, onContinue]);

  const fieldsDisabled = !roomOpen;
  const showNameNotFoundHint =
    !matchedAluno && selectedTurma !== null && nickname.trim().length > 2 && suggestions.length === 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Header — mesmo padrão do LobbyPage */}
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

        {turmasError && (
          <div
            role="alert"
            className="mb-4 w-full max-w-lg rounded-2xl border border-option-a/40 bg-option-a/20 px-6 py-3 text-center text-body-sm font-bold text-white"
          >
            {turmasError}
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
          <div className="flex flex-col gap-5 px-6 py-6 sm:gap-6 sm:px-8 sm:py-8">
            <header className="flex flex-col gap-1 text-center">
              <h1 className="font-black text-headline-md text-white">Entrar no Jogo</h1>
              <p className="text-body-sm text-quiz-text-muted">
                Escolha sua turma e seu nome pra continuar.
              </p>
            </header>

            {/* Turma */}
            <section className="flex flex-col gap-1.5">
              <label
                htmlFor="turma"
                className="font-semibold uppercase text-label-xs text-quiz-text-muted"
              >
                Sua Turma
              </label>
              <select
                id="turma"
                value={turmaId}
                onChange={(e) => handleTurmaChange(e.target.value)}
                disabled={fieldsDisabled}
                className={cn(
                  'w-full rounded-xl border border-quiz-border bg-quiz-surface px-6 py-3 font-bold text-input text-white',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                <option value="" className="text-gray-800">Selecione sua turma...</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id} className="text-gray-800">{t.nome}</option>
                ))}
              </select>
            </section>

            {/* Nickname com autocomplete a partir dos alunos da turma */}
            <section className="relative flex flex-col gap-1.5" ref={suggestionsRef}>
              <label
                htmlFor="nickname"
                className="font-semibold uppercase text-label-xs text-quiz-text-muted"
              >
                Seu Nome
              </label>
              <input
                id="nickname"
                type="text"
                maxLength={20}
                placeholder={turmaId ? 'Digite seu nome...' : 'Selecione a turma primeiro'}
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                autoComplete="off"
                disabled={fieldsDisabled || !turmaId}
                className={cn(
                  'w-full rounded-xl border border-quiz-border bg-quiz-surface px-6 py-3 font-bold text-input text-white',
                  'placeholder:font-bold placeholder:text-quiz-text-muted',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                )}
              />

              {showNameNotFoundHint && (
                <p className="text-body-sm font-semibold text-option-a">
                  Nome não encontrado nessa turma. Confira a grafia ou peça ao professor pra te cadastrar.
                </p>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-quiz-border bg-quiz-bg-to shadow-xl">
                  {suggestions.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => { setNickname(a.nome); setShowSuggestions(false); }}
                        className="w-full px-5 py-2.5 text-left font-semibold text-body-sm text-white hover:bg-white/10 transition-colors"
                      >
                        {a.nome}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-body-lg',
                'transition-colors active:scale-[0.99] motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2',
                canContinue
                  ? 'cursor-pointer bg-quiz-highlight text-quiz-highlight-foreground hover:bg-quiz-highlight/90'
                  : 'cursor-not-allowed bg-quiz-surface text-quiz-text-muted',
              )}
            >
              Continuar
            </button>
          </div>
        </div>
      </main>

      {/* Rodapé — mesmo padrão do LobbyPage */}
      <footer className="grid w-full grid-cols-2 items-center border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
        <div className="flex flex-col items-start">
          {roomOpen && quizTitle ? (
            <div className="flex items-center gap-2">
              {quizImageUrl ? (
                <img
                  src={quizImageUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
              ) : (
                <PlaceholderIcon />
              )}
              <span className="text-body-md font-extrabold tracking-tight text-white/90 truncate max-w-40 sm:max-w-xs">
                {quizTitle}
              </span>
            </div>
          ) : (
            <>
              <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
                Jogadores na sala
              </span>
              <span className="text-body-md font-extrabold tracking-tight text-white/90">
                {playerCount} {playerCount === 1 ? 'conectado' : 'conectados'}
              </span>
            </>
          )}
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

// Ícone temporário do quiz — mesmo padrão do LobbyPage
function PlaceholderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-quiz-text-muted shrink-0"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}