import { useAdminStore } from '../store/useAdminStore';
import { TimerDisplay } from '../../player/components/TimerDisplay';
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
}

/**
 * Tela de controle da pergunta — ocupa toda a área disponível, sem sidebar
 * e sem barra superior. O contador de tempo (só em `question_active`) fica
 * no canto superior direito, com a mesma aparência do jogador. As ações
 * (próxima pergunta / encerrar jogo) e a mensagem de espera vivem no
 * rodapé global da página (AdminFooter), não aqui.
 */
export function QuestionControlPanel({ questions }: Props) {
  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const correctIndex = useAdminStore((s) => s.correctIndex);
  const ranking = useAdminStore((s) => s.ranking);
  const errorMessage = useAdminStore((s) => s.errorMessage);
  const timer = useAdminStore((s) => s.timer);

  const currentQ = questions[currentQuestionIndex] ?? null;
  const voteCounts = computeVoteCounts(ranking);

  if (!currentQ) return null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center gap-2 overflow-hidden px-4 py-3 sm:px-6">
      {/* Contador de tempo — canto superior direito, igual ao do jogador */}
      {screen === 'question_active' && (
        <div className="flex w-full max-w-5xl shrink-0 justify-end">
          <TimerDisplay seconds={timer} />
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="w-full max-w-5xl shrink-0 rounded-xl bg-option-a px-4 py-3 text-sm font-bold text-white">
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
          <AdminQuestionDisplay
            text={currentQ.text}
            imageUrl={currentQ.imageUrl}
            options={currentQ.options}
            mode="result"
            correctIndex={correctIndex}
            voteCounts={voteCounts}
          />
        )}
      </div>
    </div>
  );
}
