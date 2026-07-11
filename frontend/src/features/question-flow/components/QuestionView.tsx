import { useGameStore } from '../../../stores/useGameStore';
import { OptionButton } from '../../../components/shared/OptionButton';
import { getSocket } from '../../../hooks/useSocket';
import type { OptionVariant } from '../../../components/shared/OptionButton';

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
    <div className="flex w-full max-w-3xl flex-col gap-6 animate-[slideUp_0.35s_ease_both]">
      {/* Texto da pergunta — direto no fundo escuro, sem card */}
      <h2 className="text-center font-extrabold text-2xl leading-snug text-white sm:text-3xl">
        {question.text}
      </h2>

      {/* Imagem da pergunta, ou moldura padrão quando não há imagem */}
      {question.imageUrl ? (
        <img
          src={question.imageUrl}
          alt="Imagem da pergunta"
          className="mx-auto aspect-4/3 w-full max-w-sm rounded-xl border border-quiz-border object-cover shadow-md"
        />
      ) : (
        <DefaultQuestionImage />
      )}

      {/* Alternativas — grid 1 col mobile, 2 cols sm+ */}
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
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
      className="mx-auto flex aspect-4/3 w-full max-w-sm items-center justify-center rounded-xl border border-quiz-border bg-quiz-surface p-6"
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