import { useAdminStore } from '../../../stores/useAdminStore';
import { cn } from '../../../lib/utils';

interface Props {
  quizzes: { id: string; title: string; theme: { name: string }; _count: { questions: number } }[];
  selectedQuizId: string;
  onSelectQuiz: (id: string) => void;
  onAbrirSala: () => void;
  /** Called when professor clicks "Iniciar Jogo" */
  onLiberarPergunta: () => void;
  /** Called when professor clicks "Finalizar Jogo" — closes the room */
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

  const dotPattern: React.CSSProperties = {
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  };

  /* ─────────────────────────────────────────────────
   * STATE A — room not open yet: quiz selector
   * ───────────────────────────────────────────────── */
  if (!roomOpen) {
    return (
      <div className="relative flex min-h-[calc(100dvh-52px)] flex-col" style={{ backgroundColor: '#3d0b99' }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={dotPattern} />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
          <div className="text-center">
            <h1 className="font-black text-4xl text-white">Abrir Sala</h1>
            <p className="mt-2 text-white/60 font-medium">Selecione o quiz e abra a sala para os jogadores</p>
          </div>

          {errorMessage && (
            <div role="alert" className="w-full max-w-md rounded-xl bg-option-a px-4 py-3 text-sm font-bold text-white text-center">
              {errorMessage}
            </div>
          )}

          <div className="w-full max-w-md flex flex-col gap-3">
            <select
              value={selectedQuizId}
              onChange={(e) => onSelectQuiz(e.target.value)}
              className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 font-bold text-white focus:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            >
              <option value="" className="text-gray-800 bg-white">-- Escolha um quiz --</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id} className="text-gray-800 bg-white">
                  {q.title} ({q.theme.name}) — {q._count.questions} perguntas
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedQuizId}
              onClick={onAbrirSala}
              className={cn(
                'w-full rounded-xl py-4 font-black text-lg tracking-wide transition-all active:scale-95 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
                selectedQuizId
                  ? 'bg-white text-brand hover:opacity-90 shadow-xl cursor-pointer'
                  : 'bg-white/20 text-white/40 cursor-not-allowed',
              )}
            >
              ABRIR SALA
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────
   * STATE B — room open: player grid + start button
   * ───────────────────────────────────────────────── */
  return (
    <div className="relative flex min-h-[calc(100dvh-52px)] flex-col" style={{ backgroundColor: '#3d0b99' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={dotPattern} />

      {/* Main scrollable area */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pt-8 pb-4 gap-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-black text-white leading-tight text-4xl">
            Aguardando jogadores...
          </h1>
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            SESSÃO AO VIVO
          </div>
        </div>

        {/* Player grid */}
        {players.length === 0 ? (
          <p className="text-center text-white/40 font-medium mt-4">
            Nenhum jogador entrou ainda...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {players.map((p) => (
              <div
                key={p.socketId}
                className="flex flex-col items-center gap-2 rounded-2xl p-4 animate-[slideUp_0.3s_ease_both]"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                {/* Avatar circle */}
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-4xl shadow-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                  aria-hidden="true"
                >
                  {p.avatar}
                </div>
                <p className="font-bold text-white text-sm text-center leading-tight w-full truncate">
                  {p.nickname}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar — sticky */}
      <div
        className="relative z-10 flex items-center justify-between px-6 py-4 mt-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            JOGADORES
          </span>
          <span className="font-black text-4xl text-white tabular-nums">
            {players.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Encerrar a sala? Os jogadores serão desconectados.')) {
                onFinalizarSala();
              }
            }}
            className={cn(
              'rounded-xl border-2 border-white/30 px-6 py-3.5 font-black text-base tracking-wide text-white',
              'transition-all active:scale-95 motion-reduce:transition-none hover:bg-white/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 cursor-pointer',
            )}
          >
            FINALIZAR JOGO
          </button>

          <button
            type="button"
            onClick={onLiberarPergunta}
            disabled={players.length === 0}
            className={cn(
              'rounded-xl px-8 py-3.5 font-black text-base tracking-wide',
              'transition-all active:scale-95 motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
              players.length > 0
                ? 'bg-white text-brand hover:opacity-90 shadow-xl cursor-pointer'
                : 'cursor-not-allowed',
            )}
            style={players.length === 0 ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)' } : undefined}
          >
            INICIAR JOGO ›
          </button>
        </div>
      </div>
    </div>
  );
}