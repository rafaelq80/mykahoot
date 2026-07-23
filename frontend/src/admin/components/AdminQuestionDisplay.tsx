import { cn } from '../../lib/utils';

const ICONS = ['▲', '◆', '●', '■'] as const;
const BG_CLASSES = [
  'bg-option-a',
  'bg-option-b',
  'bg-option-c',
  'bg-option-d',
] as const;

export type AdminOptionMode = 'preview' | 'result';

interface AdminOptionCardProps {
  index: 0 | 1 | 2 | 3;
  text: string;
  mode: AdminOptionMode;
  isCorrect?: boolean;
  voteCount?: number;
}

/** Cartão de alternativa — mesma aparência do OptionButton do jogador, porém não clicável. */
export function AdminOptionCard({
  index,
  text,
  mode,
  isCorrect = false,
  voteCount = 0,
}: AdminOptionCardProps) {
  return (
    <div
      className={cn(
        'flex min-h-18 w-full items-center gap-3 rounded-xl px-5 py-3.5 sm:min-h-21 sm:gap-4 sm:px-6',
        'text-left font-bold text-base text-white shadow-md sm:text-lg',
        'whitespace-normal break-words',
        BG_CLASSES[index],
        mode === 'result' && isCorrect && 'ring-4 ring-white ring-offset-2',
        mode === 'result' && !isCorrect && 'opacity-85',
      )}
    >
      <span className="text-2xl shrink-0 leading-none sm:text-3xl" aria-hidden="true">
        {mode === 'result' && isCorrect ? '✓' : ICONS[index]}
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 leading-snug">{text}</span>
      {mode === 'result' && (
        <span
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-sm font-black tabular-nums',
            isCorrect ? 'bg-white text-brand' : 'bg-quiz-surface-strong text-white',
          )}
        >
          {voteCount}
        </span>
      )}
    </div>
  );
}

interface AdminQuestionDisplayProps {
  text: string;
  imageUrl: string | null;
  options: string[];
  mode: AdminOptionMode;
  correctIndex?: number | null;
  voteCounts?: number[];
}

/**
 * Exibição da pergunta na tela do professor — mesmo visual e proporções do
 * QuestionView do jogador (card branco + imagem/moldura + alternativas),
 * ocupando toda a área disponível, porém sem interação (somente leitura).
 */
export function AdminQuestionDisplay({
  text,
  imageUrl,
  options,
  mode,
  correctIndex = null,
  voteCounts = [0, 0, 0, 0],
}: AdminQuestionDisplayProps) {
  return (
    <div className="flex h-full w-full max-w-5xl min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      {/* Texto da pergunta — card branco, altura fixa, igual ao jogador */}
      <div className="shrink-0 rounded-2xl bg-white px-6 py-3.5 shadow-lg sm:px-8 sm:py-4">
        <h2 className="text-center font-extrabold text-lg leading-snug text-quiz-bg-to sm:text-xl">
          {text}
        </h2>
      </div>

      {/* Imagem — ocupa o espaço vertical restante, mesmo sem imagem própria */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Imagem da pergunta"
            className="h-full max-h-full w-auto max-w-full rounded-xl border border-quiz-border object-contain shadow-md"
          />
        ) : (
          <DefaultQuestionImage />
        )}
      </div>

      {/* Alternativas — mesmo grid e tamanho do jogador, sem poder clicar */}
      <div
        className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
        role="group"
        aria-label="Alternativas"
      >
        {options.map((opt, idx) => (
          <AdminOptionCard
            key={idx}
            index={idx as 0 | 1 | 2 | 3}
            text={opt}
            mode={mode}
            isCorrect={mode === 'result' && correctIndex === idx}
            voteCount={voteCounts[idx] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

function DefaultQuestionImage() {
  return (
    <div
      className="flex h-full max-h-full w-auto aspect-4/3 items-center justify-center rounded-xl border border-quiz-border bg-quiz-surface p-6"
      role="img"
      aria-label="Pergunta sem imagem"
    >
      <div className="flex h-full w-2/3 items-center justify-center rounded-lg bg-quiz-surface-strong">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className="text-white/50"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    </div>
  );
}

export function computeVoteCounts(
  ranking: { selectedIndex: number }[],
): number[] {
  const counts = [0, 0, 0, 0];
  for (const entry of ranking) {
    if (entry.selectedIndex >= 0 && entry.selectedIndex <= 3) {
      counts[entry.selectedIndex]++;
    }
  }
  return counts;
}
