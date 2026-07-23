import { useAdminStore } from '../store/useAdminStore';
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
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const correctIndex = useAdminStore((s) => s.correctIndex);
  const ranking = useAdminStore((s) => s.ranking);
  const errorMessage = useAdminStore((s) => s.errorMessage);

  const currentQ = questions[currentQuestionIndex] ?? null;
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const voteCounts = computeVoteCounts(ranking);

  if (!currentQ) return null;

  return (
    <div className="flex flex-1 min-h-0 flex-col items-center gap-4">
      {errorMessage && (
        <div role="alert" className="w-full max-w-3xl rounded-xl bg-option-a px-4 py-3 text-sm font-bold text-white">
          {errorMessage}
        </div>
      )}

      {/* Pergunta — ocupa o espaço disponível, mesmo visual do aluno, sem poder clicar */}
      <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center overflow-hidden">
        {screen === 'question_active' && (
          <AdminQuestionDisplay
            text={currentQ.text}
            imageUrl={currentQ.imageUrl}
            options={currentQ.options}
            mode="preview"
          />
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

      {/* Ações — só aparecem no resultado, pra avançar o jogo */}
      {screen === 'showing_result' && (
        <div className="flex w-full max-w-3xl shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onProximaPergunta}
            className="flex-1 rounded-xl bg-quiz-highlight py-4 text-base font-black tracking-wide text-quiz-highlight-foreground shadow-lg transition-all hover:bg-quiz-highlight/90 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2"
          >
            {isLastQuestion ? 'ENCERRAR JOGO ›' : 'PRÓXIMA PERGUNTA ›'}
          </button>
          {!isLastQuestion && (
            <button
              type="button"
              onClick={onEncerrarJogo}
              className="rounded-xl border border-quiz-border bg-quiz-surface px-6 py-4 text-sm font-bold text-white transition-all hover:bg-quiz-surface-strong active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              Encerrar jogo agora
            </button>
          )}
        </div>
      )}
    </div>
  );
}