import { useState } from 'react';
import { cn } from '../../lib/utils';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { QuizFormPage } from './QuizFormPage';
import { useQuizzes } from '../hooks/useQuizzes';

const PAGE_SIZE = 10;

export function QuizListPage({ token }: { token: string }) {
  const { quizzes, reload: reloadQuizzes, deleteQuiz, error: quizzesError } = useQuizzes(token);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const totalPages = Math.max(1, Math.ceil(quizzes.length / PAGE_SIZE));
  const pageQuizzes = quizzes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar quiz?')) return;
    const err = await deleteQuiz(id);
    if (err) { showFeedback(err); return; }
    showFeedback('Quiz removido.');
  };

  if (creating) {
    return (
      <QuizFormPage
        token={token}
        onClose={() => setCreating(false)}
        onCreated={(id) => { setCreating(false); setEditingQuizId(id); void reloadQuizzes(); }}
        onSaved={() => { void reloadQuizzes(); }}
      />
    );
  }

  if (editingQuizId) {
    return (
      <QuizFormPage
        token={token}
        quizId={editingQuizId}
        onClose={() => { setEditingQuizId(null); void reloadQuizzes(); }}
        onSaved={() => { void reloadQuizzes(); }}
      />
    );
  }

  const btnCls = 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const deleteBtnCls = 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0';

  return (
    <AdminScreenLayout title="Quizzes" subtitle="Gerencie seus quizzes">
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md text-sm">
          {feedback}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base text-white">{quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}</h2>
          <button type="button" className={btnCls} onClick={() => setCreating(true)}>+ Novo Quiz</button>
        </div>

        {quizzesError && (
          <div role="alert" className="rounded-xl bg-option-a px-4 py-3 text-center text-sm font-bold text-white">
            {quizzesError}
          </div>
        )}

        {quizzes.length === 0 && !quizzesError && (
          <p className="py-10 text-center text-sm text-quiz-text-muted">Nenhum quiz cadastrado. Clique em &quot;+ Novo Quiz&quot; para começar.</p>
        )}

        {quizzes.length > 0 && (
          <>
            <ul className="flex flex-col gap-2">
              {pageQuizzes.map((q) => (
                <li key={q.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                  <div className="flex items-center gap-3 min-w-0">
                    {q.imageUrl ? (
                      <img src={q.imageUrl} alt="" className="h-10 w-16 shrink-0 rounded-lg border border-quiz-border object-cover" />
                    ) : (
                      <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-quiz-surface-strong text-lg font-black text-white/50">
                        {q.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <strong className="block truncate">{q.title}</strong>
                      <span className="text-xs text-quiz-text-muted">{q.theme?.name ?? 'Sem tema'} · {q._count?.questions ?? 0} perguntas</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingQuizId(q.id)}
                      className="rounded-lg border border-quiz-border px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-quiz-surface active:scale-95"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={deleteBtnCls}
                      onClick={() => void handleDelete(q.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="flex shrink-0 items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  aria-label="Próxima página"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all enabled:hover:border-brand enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 motion-reduce:transition-none"
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminScreenLayout>
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
