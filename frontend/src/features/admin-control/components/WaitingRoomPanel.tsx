import { useAdminStore } from '../../../stores/useAdminStore';
import { cn } from '../../../lib/utils';
import { AdminScreenLayout } from './AdminScreenLayout';

interface Props {
  quizzes: { id: string; title: string; theme: { name: string }; _count: { questions: number } }[];
  selectedQuizId: string;
  onSelectQuiz: (id: string) => void;
  onAbrirSala: () => void;
  onLiberarPergunta: () => void;
  onFinalizarSala: () => void;
  roomOpen: boolean;
}

export function WaitingRoomPanel({
  quizzes,
  selectedQuizId,
  onSelectQuiz,
  onAbrirSala,
  onLiberarPergunta,
  onFinalizarSala,
  roomOpen,
}: Props) {
  const players = useAdminStore((s) => s.players);
  const errorMessage = useAdminStore((s) => s.errorMessage);

  if (!roomOpen) {
    return (
      <AdminScreenLayout
        title="Abrir Sala"
        subtitle="Selecione o quiz e abra a sala para os jogadores entrarem"
        footer={
          <button
            type="button"
            disabled={!selectedQuizId}
            onClick={onAbrirSala}
            className={cn(
              'w-full rounded-xl py-4 font-black text-lg tracking-wide transition-all active:scale-95 motion-reduce:transition-none sm:max-w-md sm:ml-auto',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
              selectedQuizId
                ? 'cursor-pointer bg-brand text-white shadow-lg hover:bg-brand/90'
                : 'cursor-not-allowed bg-gray-200 text-gray-400',
            )}
          >
            ABRIR SALA
          </button>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-10 sm:px-8">
          {errorMessage && (
            <div
              role="alert"
              className="w-full max-w-md rounded-xl bg-option-a px-4 py-3 text-center text-sm font-bold text-white"
            >
              {errorMessage}
            </div>
          )}

          <div className="w-full max-w-md rounded-2xl border-2 border-white/20 bg-white p-6 shadow-xl">
            <label
              htmlFor="quiz-select"
              className="mb-2 block font-bold uppercase text-label-xs tracking-[0.14em] text-gray-400"
            >
              Quiz da partida
            </label>
            <select
              id="quiz-select"
              value={selectedQuizId}
              onChange={(e) => onSelectQuiz(e.target.value)}
              className="w-full rounded-xl border-2 border-surface-container bg-surface-container px-4 py-3 font-bold text-brand focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="">-- Escolha um quiz --</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.theme.name}) — {q._count.questions} perguntas
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminScreenLayout>
    );
  }

  return (
    <AdminScreenLayout
      title="Sala de Espera"
      badge="Ao vivo"
      subtitle="Aguardando jogadores entrarem na sala"
      headerRight={
        <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-label-xs font-extrabold uppercase tracking-[0.14em] text-white">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
          Conectado
        </span>
      }
      footer={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              Jogadores conectados
            </span>
            <span className="font-black text-4xl tabular-nums text-brand">{players.length}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Encerrar a sala? Os jogadores serão desconectados.')) {
                  onFinalizarSala();
                }
              }}
              className="rounded-xl border-2 border-option-a bg-white px-6 py-3.5 font-black text-base tracking-wide text-option-a transition-all hover:bg-option-a/5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2"
            >
              FINALIZAR SALA
            </button>
            <button
              type="button"
              onClick={onLiberarPergunta}
              disabled={players.length === 0}
              className={cn(
                'rounded-xl px-8 py-3.5 font-black text-base tracking-wide text-white transition-all active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                players.length > 0
                  ? 'cursor-pointer bg-brand shadow-lg hover:bg-brand/90'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500',
              )}
            >
              INICIAR JOGO ›
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-1 flex-col px-5 py-8 sm:px-8">
        {players.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-6 text-center font-medium text-white/70">
              Nenhum jogador entrou ainda…
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {players.map((p) => (
              <div
                key={p.socketId}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-white/20 bg-white p-4 shadow-md animate-[slideUp_0.3s_ease_both]"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-4xl"
                  aria-hidden="true"
                >
                  {p.avatar}
                </div>
                <p className="w-full truncate text-center text-sm font-bold leading-tight text-brand">
                  {p.nickname}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminScreenLayout>
  );
}
