import { cn } from '../../../lib/utils';
import { useAdminStore } from '../../../stores/useAdminStore';

const ICONS = ['▲', '◆', '●', '■'] as const;

interface Question {
  id: string;
  text: string;
  options: string[];
  timeLimitSec: number;
  order: number;
}

interface Props {
  questions: Question[];
  onLiberarPergunta: () => void;
  onProximaPergunta: () => void;
  /** unused in active game but kept for interface consistency */
  quizzes: unknown[];
  selectedQuizId: string;
  onSelectQuiz: (id: string) => void;
  onAbrirSala: () => void;
}

export function QuestionControlPanel({
  questions,
  onProximaPergunta,
}: Props) {
  const screen = useAdminStore((s) => s.screen);
  const timer = useAdminStore((s) => s.timer);
  const answeredCount = useAdminStore((s) => s.answeredCount);
  const players = useAdminStore((s) => s.players);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const correctIndex = useAdminStore((s) => s.correctIndex);
  const errorMessage = useAdminStore((s) => s.errorMessage);

  const currentQ = questions[currentQuestionIndex] ?? null;
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const isTimerUrgent = timer > 0 && timer <= 5;

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <div role="alert" className="rounded-xl bg-option-a px-4 py-3 text-sm font-bold text-white">
          {errorMessage}
        </div>
      )}

      {/* ── Question active ── */}
      {screen === 'question_active' && currentQ && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Tempo"
              value={`${timer}s`}
              urgent={isTimerUrgent}
            />
            <StatCard
              label="Responderam"
              value={`${answeredCount} / ${players.length}`}
            />
            <StatCard
              label="Pergunta"
              value={`${currentQuestionIndex + 1} / ${questions.length}`}
            />
          </div>

          {/* Question card */}
          <div className="rounded-2xl border-2 border-surface-container bg-surface-container p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Pergunta {currentQuestionIndex + 1} de {questions.length}
            </p>
            <p className="font-bold text-lg text-gray-800 leading-snug">{currentQ.text}</p>
          </div>

          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-gray-100 py-4 font-bold text-gray-400 cursor-not-allowed border-2 border-gray-200"
          >
            Aguardando respostas...
          </button>
        </>
      )}

      {/* ── Showing result ── */}
      {screen === 'showing_result' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Pergunta"
              value={`${currentQuestionIndex + 1} / ${questions.length}`}
            />
            {correctIndex !== null && currentQ && (
              <StatCard
                label="Resposta certa"
                value={`${ICONS[correctIndex]} ${currentQ.options[correctIndex] ?? ''}`}
                small
              />
            )}
          </div>

          <button
            type="button"
            onClick={onProximaPergunta}
            className="w-full rounded-xl bg-brand py-4 font-black text-white text-base tracking-wide active:scale-95 transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 shadow-md"
          >
            {isLastQuestion ? 'ENCERRAR JOGO ›' : 'PRÓXIMA PERGUNTA ›'}
          </button>

          {/* Always show explicit "Encerrar" button */}
          {!isLastQuestion && (
            <button
              type="button"
              onClick={onProximaPergunta}
              className="w-full rounded-xl border-2 border-option-a py-3 font-bold text-option-a text-sm active:scale-95 transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2"
            >
              Encerrar jogo agora
            </button>
          )}
        </>
      )}

      {/* ── Game over ── */}
      {screen === 'game_over' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-brand/10 border-2 border-brand/20 px-5 py-4 text-center">
            <p className="font-black text-2xl text-brand">🏆 Partida encerrada!</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Veja o ranking completo abaixo
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-brand py-4 font-black text-white text-base tracking-wide active:scale-95 transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 shadow-md"
          >
            NOVA PARTIDA
          </button>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  urgent?: boolean;
  small?: boolean;
}

function StatCard({ label, value, urgent, small }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-surface-container bg-surface-container px-3 py-4 text-center gap-1">
      <span className={cn(
        'font-black tabular-nums leading-none',
        small ? 'text-base' : 'text-3xl',
        urgent ? 'text-option-a' : 'text-brand',
      )}>
        {value}
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}
