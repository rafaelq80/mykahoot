import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../lib/utils';
import { useGameStore } from '../store/useGameStore';
import { apiFetch } from '../../services/api';
import { joinRoomSchema } from '../../schemas/joinRoom.schema';
import type { JoinRoomFormData } from '../../schemas/joinRoom.schema';
import type { Turma } from '../../types/turma';
import { RoomFooterBar } from './RoomFooterBar';

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
  const quizTitle = useGameStore((s) => s.quizTitle);
  const quizImageUrl = useGameStore((s) => s.quizImageUrl);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasError, setTurmasError] = useState<string | null>(null);
  const [turmaId, setTurmaId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { register, watch, setValue, formState: { errors } } = useForm<JoinRoomFormData>({
    resolver: zodResolver(joinRoomSchema),
    mode: 'onChange',
    defaultValues: { nickname: '' },
  });
  const nickname = watch('nickname');

  useEffect(() => {
    apiFetch<Turma[]>('/turmas')
      .then((data) => {
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
    setValue('nickname', '', { shouldValidate: false });
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
      <header className="flex items-center border-b border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
        <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-3 sm:px-6">
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
                {...register('nickname', { onChange: () => setShowSuggestions(true) })}
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

              {errors.nickname && !showNameNotFoundHint && (
                <p className="text-sm font-bold text-option-a">{errors.nickname.message}</p>
              )}

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
                        onClick={() => { setValue('nickname', a.nome, { shouldValidate: true }); setShowSuggestions(false); }}
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

      <RoomFooterBar quizTitle={quizTitle} quizImageUrl={quizImageUrl} playerCount={playerCount} roomOpen={roomOpen} />
    </div>
  );
}