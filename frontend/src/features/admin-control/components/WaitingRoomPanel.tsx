import { useEffect, useState } from 'react';
import { useAdminStore } from '../../../stores/useAdminStore';
import { cn } from '../../../lib/utils';
import { AdminScreenLayout } from './AdminScreenLayout';

interface Quiz {
  id: string;
  title: string;
  theme: { name: string };
  _count: { questions: number };
  imageUrl?: string | null;
}

interface Props {
  quizzes: Quiz[];
  selectedQuizId: string;
  onPlay: (quizId: string) => void;
  onEditQuiz: (quizId: string) => void;
  roomOpen: boolean;
  quizzesError: string | null;
}

const QUIZ_PAGE_SIZE = 10; // 2 linhas x 5 colunas
const PLAYERS_PAGE_SIZE = 12; // 2 linhas x 6 colunas

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M14.2 2.5a1.7 1.7 0 0 1 2.4 2.4L6.5 15 3 16l1-3.5L14.2 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
      <path d="M5 3.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 4.5 7 10l5.5 5.5' : 'M7.5 4.5 13 10l-5.5 5.5'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 0}
        aria-label="Página anterior"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all enabled:hover:border-brand enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 motion-reduce:transition-none"
      >
        <ChevronIcon direction="left" />
      </button>
      <span className="text-sm font-bold tabular-nums text-white/60">
        Página {page + 1} de {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page === totalPages - 1}
        aria-label="Próxima página"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all enabled:hover:border-brand enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 motion-reduce:transition-none"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

export function WaitingRoomPanel({
  quizzes,
  selectedQuizId,
  onPlay,
  onEditQuiz,
  roomOpen,
  quizzesError,
}: Props) {
  const players = useAdminStore((s) => s.players);
  const errorMessage = useAdminStore((s) => s.errorMessage);

  const totalQuizPages = Math.max(1, Math.ceil(quizzes.length / QUIZ_PAGE_SIZE));
  const [quizPage, setQuizPage] = useState(0);

  useEffect(() => {
    if (quizPage > totalQuizPages - 1) setQuizPage(0);
  }, [totalQuizPages, quizPage]);

  const totalPlayerPages = Math.max(1, Math.ceil(players.length / PLAYERS_PAGE_SIZE));
  const [playerPage, setPlayerPage] = useState(0);

  useEffect(() => {
    if (playerPage > totalPlayerPages - 1) setPlayerPage(0);
  }, [totalPlayerPages, playerPage]);

  if (!roomOpen) {
    const pageQuizzes = quizzes.slice(quizPage * QUIZ_PAGE_SIZE, quizPage * QUIZ_PAGE_SIZE + QUIZ_PAGE_SIZE);

    // Sem `footer` aqui: avatar/nome do admin e contagem de quizzes moraram
    // pro rodapé global (AdminPage). Aqui é só o grid, ponto.
    return (
      <AdminScreenLayout title="Escolha um Quiz">
        <div className="flex flex-1 flex-col gap-3 px-5 py-5 sm:px-8">
          {(quizzesError || errorMessage) && (
            <div
              role="alert"
              className="rounded-xl bg-option-a px-4 py-3 text-center text-sm font-bold text-white"
            >
              {quizzesError ?? errorMessage}
            </div>
          )}

          {quizzes.length === 0 && !quizzesError ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="rounded-2xl border border-quiz-border bg-quiz-surface px-8 py-6 text-center font-medium text-quiz-text-muted">
                Nenhum quiz cadastrado ainda…
              </p>
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-5 grid-rows-2 gap-3">
              {pageQuizzes.map((q) => (
                <div
                  key={q.id}
                  className={cn(
                    'card-glass-strong flex h-full flex-col overflow-hidden',
                    selectedQuizId === q.id && 'ring-2 ring-brand',
                  )}
                >
                  <div
                    className="flex h-20 w-full shrink-0 items-center justify-center overflow-hidden bg-quiz-surface-strong text-2xl font-black text-white"
                    aria-hidden="true"
                  >
                    {q.imageUrl ? (
                      <img src={q.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      q.title.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    <p className="line-clamp-2 text-xs font-black leading-tight text-white">{q.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-quiz-text-muted">
                      {q._count.questions} perguntas
                    </p>

                    <div className="mt-auto flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditQuiz(q.id)}
                        aria-label={`Editar ${q.title}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-quiz-border text-quiz-text-muted transition-all hover:border-brand hover:text-brand active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => onPlay(q.id)}
                        disabled={q._count.questions === 0}
                        aria-label={
                          q._count.questions === 0
                            ? `${q.title} não tem perguntas cadastradas`
                            : `Jogar ${q.title}`
                        }
                        title={q._count.questions === 0 ? 'Adicione perguntas para poder jogar' : undefined}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-black tracking-wide text-white shadow-sm transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                          q._count.questions === 0
                            ? 'cursor-not-allowed bg-quiz-surface-strong text-quiz-text-muted shadow-none'
                            : 'cursor-pointer bg-brand hover:bg-brand/90 active:scale-95',
                        )}
                      >
                        <PlayIcon />
                        JOGAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalQuizPages > 1 && (
            <Pagination
              page={quizPage}
              totalPages={totalQuizPages}
              onPrev={() => setQuizPage((p) => Math.max(0, p - 1))}
              onNext={() => setQuizPage((p) => Math.min(totalQuizPages - 1, p + 1))}
            />
          )}
        </div>
      </AdminScreenLayout>
    );
  }

  const pagePlayers = players.slice(
    playerPage * PLAYERS_PAGE_SIZE,
    playerPage * PLAYERS_PAGE_SIZE + PLAYERS_PAGE_SIZE,
  );

  return (
    <AdminScreenLayout title="Sala de Espera">
      <div className="flex flex-1 flex-col gap-3 px-5 py-8 sm:px-8">
        {players.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="rounded-2xl border border-quiz-border bg-quiz-surface px-8 py-6 text-center font-medium text-quiz-text-muted">
              Nenhum jogador entrou ainda…
            </p>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-6 grid-rows-2 gap-4">
            {pagePlayers.map((p) => (
              <div
                key={p.socketId}
                className="card-glass-strong flex h-full flex-col items-center justify-center gap-3 p-4 animate-[slideUp_0.3s_ease_both]"
              >
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-quiz-surface-strong text-4xl"
                  aria-hidden="true"
                >
                  {p.avatar}
                </div>
                <p className="w-full truncate text-center text-sm font-bold leading-tight text-white">
                  {p.nickname}
                </p>
              </div>
            ))}
          </div>
        )}

        {totalPlayerPages > 1 && (
          <Pagination
            page={playerPage}
            totalPages={totalPlayerPages}
            onPrev={() => setPlayerPage((p) => Math.max(0, p - 1))}
            onNext={() => setPlayerPage((p) => Math.min(totalPlayerPages - 1, p + 1))}
          />
        )}
      </div>
    </AdminScreenLayout>
  );
}