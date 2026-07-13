import { cn } from '../../../lib/utils';
import { useAdminStore } from '../../../stores/useAdminStore';
import {
  AdminQuestionDisplay,
  computeVoteCounts,
} from './AdminQuestionDisplay';

interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  timeLimitSec: number;
  order: number;
}

interface Props {
  questions: Question[];
  onProximaPergunta: () => void;
  onEncerrarJogo: () => void;
}

export function QuestionControlPanel({
  questions,
  onProximaPergunta,
  onEncerrarJogo,
}: Props) {
  const screen = useAdminStore((s) => s.screen);
  const timer = useAdminStore((s) => s.timer);
  const answeredCount = useAdminStore((s) => s.answeredCount);
  const players = useAdminStore((s) => s.players);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const correctIndex = useAdminStore((s) => s.correctIndex);
  const ranking = useAdminStore((s) => s.ranking);
  const errorMessage = useAdminStore((s) => s.errorMessage);

  const currentQ = questions[currentQuestionIndex] ?? null;
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const isTimerUrgent = timer > 0 && timer <= 5;
  const voteCounts = computeVoteCounts(ranking);

  if (!currentQ) return null;

  return (
    <div className="flex flex-1 flex-col gap-5">
      {errorMessage && (
        <div role="alert" className="rounded-xl bg-option-a px-4 py-3 text-sm font-bold text-white">
          {errorMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tempo" value={screen === 'question_active' ? `${timer}s` : '—'} urgent={isTimerUrgent} />
        <StatCard label="Responderam" value={`${answeredCount} / ${players.length}`} />
        <StatCard label="Pergunta" value={`${currentQuestionIndex + 1} / ${questions.length}`} />
        {screen === 'showing_result' && correctIndex !== null && (
          <StatCard label="Sem resposta" value={String(players.length - answeredCount)} />
        )}
      </div>

      {/* Pergunta — visual igual ao aluno */}
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-white/15 bg-white/5 px-4 py-8 sm:px-8">
        {screen === 'question_active' && (
          <>
            <AdminQuestionDisplay
              text={currentQ.text}
              imageUrl={currentQ.imageUrl}
              options={currentQ.options}
              mode="preview"
            />
            <p className="mt-6 rounded-full border-2 border-white/30 bg-white/10 px-6 py-2 text-sm font-bold uppercase tracking-widest text-white/80">
              Aguardando respostas dos jogadores…
            </p>
          </>
        )}

        {screen === 'showing_result' && (
          <>
            <p className="mb-4 text-center text-label-xs font-bold uppercase tracking-[0.14em] text-white/70">
              Resultado da pergunta — votos por alternativa
            </p>
            <AdminQuestionDisplay
              text={currentQ.text}
              imageUrl={currentQ.imageUrl}
              options={currentQ.options}
              mode="result"
              correctIndex={correctIndex}
              voteCounts={voteCounts}
            />
          </>
        )}
      </div>

      {/* Ações — sempre visíveis com contraste no fundo roxo */}
      {screen === 'showing_result' && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onProximaPergunta}
            className="flex-1 rounded-xl bg-white py-4 text-base font-black tracking-wide text-brand shadow-lg transition-all hover:bg-surface-container active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          >
            {isLastQuestion ? 'ENCERRAR JOGO ›' : 'PRÓXIMA PERGUNTA ›'}
          </button>
          {!isLastQuestion && (
            <button
              type="button"
              onClick={onEncerrarJogo}
              className="rounded-xl border-2 border-white bg-transparent px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
            >
              Encerrar jogo agora
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  urgent?: boolean;
}

function StatCard({ label, value, urgent }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-white/20 bg-white px-3 py-4 text-center shadow-sm">
      <span
        className={cn(
          'font-black tabular-nums leading-none text-2xl sm:text-3xl',
          urgent ? 'text-option-a' : 'text-brand',
        )}
      >
        {value}
      </span>
      <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </span>
    </div>
  );
}
