import { useGameStore } from '../store/useGameStore';
import { OptionButton } from './OptionButton';
import { getSocket } from '../../shared/hooks/useSocket';
import type { OptionVariant } from './OptionButton';

export function QuestionView() {
  const question = useGameStore((s) => s.question);
  const hasAnswered = useGameStore((s) => s.hasAnswered);
  const selectedIndex = useGameStore((s) => s.selectedIndex);
  const answer = useGameStore((s) => s.answer);

  if (!question) return null;

  const handleAnswer = (idx: number) => {
    if (hasAnswered) return;
    answer(idx);
    getSocket().emit('player:responder', { questionId: question.questionId, selectedIndex: idx });
  };

  const getVariant = (idx: number): OptionVariant => {
    if (!hasAnswered) return 'idle';
    if (idx === selectedIndex) return 'selected';
    return 'dimmed';
  };

  return (
    <div className="flex h-full w-full max-w-5xl min-h-0 flex-1 flex-col gap-3 sm:gap-4 animate-[slideUp_0.35s_ease_both]">
      {/* Texto da pergunta — card branco, altura fixa */}
      <div className="shrink-0 rounded-2xl bg-white px-6 py-3.5 shadow-lg sm:px-8 sm:py-4">
        <h2 className="text-center font-extrabold text-lg leading-snug text-quiz-bg-to sm:text-xl">
          {question.text}
        </h2>
      </div>

      {/* Imagem — ocupa o espaço vertical restante entre pergunta e alternativas */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {question.imageUrl ? (
          <img
            src={question.imageUrl}
            alt="Imagem da pergunta"
            className="h-full max-h-full w-auto max-w-full rounded-xl border border-quiz-border object-contain shadow-md"
          />
        ) : (
          <DefaultQuestionImage />
        )}
      </div>

      {/* Alternativas — grid 1 col mobile, 2 cols sm+, largas e com altura fixa maior */}
      <div
        className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
        role="group"
        aria-label="Alternativas"
      >
        {question.options.map((opt, idx) => (
          <OptionButton
            key={idx}
            index={idx as 0 | 1 | 2 | 3}
            text={opt}
            variant={getVariant(idx)}
            disabled={hasAnswered}
            onClick={() => handleAnswer(idx)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Moldura padrão exibida quando a pergunta não tem imagem própria —
 * mantém o layout consistente com perguntas que têm imagem.
 */
function DefaultQuestionImage() {
  return (
    <div
      className="flex h-full max-h-full w-auto aspect-4/3 items-center justify-center rounded-xl border border-quiz-border bg-quiz-surface p-6"
      role="img"
      aria-label="Pergunta sem imagem"
    >
      <div className="flex h-full w-2/3 items-center justify-center rounded-lg bg-quiz-surface-strong">
        <ImagePlaceholderIcon />
      </div>
    </div>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/50"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}